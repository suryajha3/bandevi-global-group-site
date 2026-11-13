"""Invite-only client projects. Client and staff sessions are separate lanes."""
import base64
import datetime
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import sqlite3
import time
from http.cookies import SimpleCookie, CookieError
from urllib.parse import parse_qs, urlsplit
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
import operations

COOKIE = 'bg_client_session'
ASSETS = Path(__file__).parent / 'client'
BLOCKER_LABELS = {
    'approval': 'Internal approval',
    'purchase_order': 'Purchase order',
    'billing': 'Billing details',
    'scope': 'Scope clarification',
    'other': 'Something else',
}
KICKOFF_MINUTES = 30

class Problem(Exception):
    def __init__(self, status, message): self.status, self.message = status, message

def initialize(db):
    db.executescript('''
    CREATE TABLE IF NOT EXISTS client_accounts(email TEXT PRIMARY KEY,password_hash TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS client_invites(digest TEXT PRIMARY KEY,email TEXT NOT NULL,expires INTEGER NOT NULL,used INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS client_sessions(digest TEXT PRIMARY KEY,email TEXT NOT NULL,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS client_logins(fingerprint TEXT NOT NULL,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS client_projects(reference TEXT PRIMARY KEY,email TEXT NOT NULL,title TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Planning',version INTEGER NOT NULL DEFAULT 0,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS client_proposals(id TEXT PRIMARY KEY,reference TEXT NOT NULL,revision INTEGER NOT NULL,title TEXT NOT NULL,scope TEXT NOT NULL,terms TEXT NOT NULL,minor_units INTEGER NOT NULL,currency TEXT NOT NULL,expires INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'draft',created INTEGER NOT NULL,actor TEXT NOT NULL,accepted INTEGER,accepted_by TEXT,published INTEGER NOT NULL DEFAULT 0,UNIQUE(reference,revision));
    CREATE TABLE IF NOT EXISTS client_milestones(id TEXT PRIMARY KEY,reference TEXT NOT NULL,title TEXT NOT NULL,due TEXT NOT NULL,status TEXT NOT NULL,notes TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS client_documents(id TEXT PRIMARY KEY,reference TEXT NOT NULL,name TEXT NOT NULL,mime TEXT NOT NULL,data BLOB NOT NULL,created INTEGER NOT NULL,actor TEXT NOT NULL,deleted INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS client_tickets(id TEXT PRIMARY KEY,reference TEXT NOT NULL,subject TEXT NOT NULL,priority TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Open',owner TEXT NOT NULL,created INTEGER NOT NULL,due INTEGER NOT NULL,first_response INTEGER,version INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS client_ticket_messages(id INTEGER PRIMARY KEY,ticket TEXT NOT NULL,body TEXT NOT NULL,actor TEXT NOT NULL,internal INTEGER NOT NULL,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS client_proposal_feedback(ticket TEXT PRIMARY KEY,proposal TEXT NOT NULL,kind TEXT NOT NULL,
      request_id TEXT NOT NULL,request_digest TEXT NOT NULL,UNIQUE(proposal,request_id));
    CREATE TABLE IF NOT EXISTS client_proposal_reviews(
      id TEXT PRIMARY KEY,reference TEXT NOT NULL,proposal TEXT NOT NULL,slot_id TEXT NOT NULL,
      topic TEXT NOT NULL,meeting TEXT NOT NULL DEFAULT '',state TEXT NOT NULL DEFAULT 'booked',
      created INTEGER NOT NULL,outcome_at INTEGER NOT NULL DEFAULT 0,followed INTEGER NOT NULL DEFAULT 0,
      version INTEGER NOT NULL DEFAULT 1);
    CREATE UNIQUE INDEX IF NOT EXISTS proposal_review_live_slot ON client_proposal_reviews(slot_id) WHERE state='booked';
    CREATE UNIQUE INDEX IF NOT EXISTS proposal_review_live_revision ON client_proposal_reviews(proposal) WHERE state='booked';
    CREATE INDEX IF NOT EXISTS proposal_review_reference ON client_proposal_reviews(reference,created);
    CREATE INDEX IF NOT EXISTS proposal_review_proposal ON client_proposal_reviews(proposal,created);
    CREATE TABLE IF NOT EXISTS client_proposal_decisions(
      proposal TEXT PRIMARY KEY,changes TEXT NOT NULL DEFAULT '',recap TEXT NOT NULL DEFAULT '',
      milestone TEXT NOT NULL DEFAULT '',open_question TEXT NOT NULL DEFAULT '',due TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS client_proposal_blockers(
      proposal TEXT PRIMARY KEY,reason TEXT NOT NULL,note TEXT NOT NULL,expected TEXT NOT NULL,
      due TEXT NOT NULL,created INTEGER NOT NULL,resolved INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS client_kickoffs(reference TEXT PRIMARY KEY,proposal TEXT NOT NULL,owner TEXT NOT NULL,
      materials TEXT NOT NULL,contact TEXT NOT NULL,materials_ready INTEGER NOT NULL,scheduled INTEGER NOT NULL,
      confirmed INTEGER NOT NULL,started INTEGER NOT NULL,version INTEGER NOT NULL,updated INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS client_kickoff_slots(
      id TEXT PRIMARY KEY, host TEXT NOT NULL, starts INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1,
      reference TEXT UNIQUE, zone TEXT NOT NULL DEFAULT '');
    CREATE INDEX IF NOT EXISTS client_kickoff_slot_host ON client_kickoff_slots(host,starts);
    CREATE TABLE IF NOT EXISTS client_kickoff_meetings(reference TEXT PRIMARY KEY, url TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS client_kickoff_reminder_schedules(
      id INTEGER PRIMARY KEY AUTOINCREMENT, reference TEXT NOT NULL UNIQUE, booked_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS client_audit(id INTEGER PRIMARY KEY,reference TEXT NOT NULL,action TEXT NOT NULL,actor TEXT NOT NULL,detail TEXT NOT NULL,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS demo_meetings(reference TEXT PRIMARY KEY,url TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS client_loss_reasons(reference TEXT PRIMARY KEY,reason TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS client_projects_email ON client_projects(email);
    CREATE INDEX IF NOT EXISTS client_tickets_project ON client_tickets(reference);
    CREATE INDEX IF NOT EXISTS client_ticket_visible_message ON client_ticket_messages(ticket,internal,id);
    ''')
    if 'sender' not in {row[1] for row in db.execute('PRAGMA table_info(client_ticket_messages)')}:
        db.execute("ALTER TABLE client_ticket_messages ADD COLUMN sender TEXT NOT NULL DEFAULT ''")
    db.execute("""INSERT OR IGNORE INTO client_kickoff_reminder_schedules(reference,booked_at)
        SELECT reference,updated FROM client_kickoffs
        WHERE confirmed=1 AND started=0 AND scheduled>?""",(int(time.time()),))

def value(data, key, limit, required=True):
    item=data.get(key,'')
    if not isinstance(item,str) or len(item)>limit or any(ord(c)<32 and c not in '\n\t' for c in item):
        raise Problem(400,'Check '+key+' and its length.')
    item=item.strip()
    if required and not item:raise Problem(400,'Enter '+key+'.')
    return item

def digest(token): return hashlib.sha256(token.encode()).hexdigest()

def cookie(token, clear=False):
    security='' if os.environ.get('ENQUIRY_TEST')=='1' else '; Secure'
    return f'{COOKIE}={token}; Path=/; HttpOnly; SameSite=Strict; Max-Age={0 if clear else 28800}{security}'

def session(handler,db):
    try:
        cookies=SimpleCookie(handler.headers.get('Cookie',''));token=cookies[COOKIE].value
        if len(token)>128:return None
        row=db.execute('SELECT s.* FROM client_sessions s JOIN client_accounts a ON a.email=s.email WHERE s.digest=? AND s.expires>? AND a.active=1',(digest(token),int(time.time()))).fetchone()
        return dict(row) if row else None
    except (KeyError,ValueError,CookieError):return None

def project(db,reference,identity,staff=False):
    row=db.execute('SELECT * FROM client_projects WHERE reference=?',(reference,)).fetchone()
    if not row:raise Problem(404,'Project not found.')
    if staff:
        if identity['role']=='agent' and not db.execute('SELECT 1 FROM enquiry_workflow WHERE id=? AND owner=?',(reference,identity['actor'])).fetchone():raise Problem(404,'Project not found.')
    elif row['email']!=identity['email']:raise Problem(404,'Project not found.')
    return row

def audit(db,ref,action,actor,detail=''):
    db.execute('INSERT INTO client_audit(reference,action,actor,detail,created) VALUES(?,?,?,?,?)',(ref,action,actor,detail,int(time.time())))

def active_owner(db,owner):
    from dashboard import USER
    return owner==USER or bool(db.execute('SELECT 1 FROM team_users WHERE email=? AND active=1',(owner,)).fetchone())

def proposal_status(p,now):
    if p['status']=='accepted':return 'Accepted'
    if p['status']=='published':return 'Expired' if p['expires']<=now else 'Awaiting acceptance'
    if p['status']=='draft':return 'Draft (expired)' if p['expires']<=now else 'Draft'
    return p['status'].capitalize()

def proposal_queue(handler,db,identity,query):
    buckets={'drafts':"cp.status='draft'",'awaiting':"cp.status='published' AND cp.expires>?",'expiring':"cp.status='published' AND cp.expires>? AND cp.expires<=?",'expired':"cp.status='published' AND cp.expires<=?",'accepted':"cp.status='accepted'",'withdrawn':"cp.status='withdrawn'",'superseded':"cp.status='superseded'",'all':'1=1'}
    bucket=query.get('bucket',['awaiting'])[0];search=query.get('q',[''])[0][:120]
    try:offset=int(query.get('offset',['0'])[0])
    except ValueError:raise Problem(400,'Invalid page.')
    if bucket not in buckets or not 0<=offset<=1000000:raise Problem(400,'Choose a valid proposal filter.')
    now=int(time.time());week=now+7*86400
    join=' FROM client_proposals cp JOIN client_projects p ON p.reference=cp.reference JOIN enquiries e ON e.id=p.reference LEFT JOIN enquiry_workflow w ON w.id=p.reference '
    base="e.email_status!='qa-verified'";args=[]
    if identity['role']=='agent':base+=' AND w.owner=?';args=[identity['actor']]
    def params(key):return [now,week] if key=='expiring' else [now] if key in ('awaiting','expired') else []
    db.execute('BEGIN')
    counts={key:db.execute('SELECT COUNT(*)'+join+'WHERE '+base+' AND ('+condition+')',args+params(key)).fetchone()[0] for key,condition in buckets.items()}
    where=base+' AND ('+buckets[bucket]+')';filters=args+params(bucket)
    if search:where+=' AND (cp.title LIKE ? OR p.title LIKE ? OR p.reference LIKE ? OR p.email LIKE ?)';filters+=['%'+search+'%']*4
    total=db.execute('SELECT COUNT(*)'+join+'WHERE '+where,filters).fetchone()[0]
    rows=db.execute("SELECT cp.id,cp.reference,cp.revision,cp.title,cp.status,cp.minor_units,cp.currency,cp.created,cp.expires,cp.accepted,p.title AS projectTitle,p.email AS clientEmail,COALESCE(w.owner,'') AS owner"+join+'WHERE '+where+' ORDER BY '+('cp.expires ASC,' if bucket in ('awaiting','expiring','expired') else '')+'cp.created DESC,cp.id DESC LIMIT 25 OFFSET ?',filters+[offset]).fetchall()
    items=[]
    for row in rows:
        item=dict(row);item['displayStatus']=proposal_status(item,now);item['expiresSoon']=item['status']=='published' and now<item['expires']<=week;items.append(item)
    handler.respond(200,{'items':items,'counts':counts,'total':total,'offset':offset,'limit':25,'now':now,'timezone':'Asia/Kolkata'})
    return True


def detail(db,row,staff,ticket_id=''):
    ref=row['reference'];result=dict(row)
    if staff:
        import sales_journey
        result['salesJourney']=sales_journey.record(db,ref)
        enquiry = db.execute("SELECT payload FROM enquiries WHERE id=? AND email_status!='qa-verified'", (ref,)).fetchone()
        if enquiry and result['salesJourney']['outcome']=='Completed':
            booking = db.execute('SELECT b.state,s.starts FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id WHERE b.enquiry_id=?', (ref,)).fetchone()
            followup = sales_journey.post_demo(db,ref,result['salesJourney'],booking,json.loads(enquiry['payload']),int(time.time()))
            if followup:
                result['postDemo'] = {'body':followup['body'],'currency':followup['currency']}
    proposals=[];now=int(time.time())
    closed=db.execute("SELECT 1 FROM enquiry_workflow WHERE id=? AND stage IN ('Won','Lost')",(ref,)).fetchone()
    for item in db.execute('SELECT * FROM client_proposals WHERE reference=? ORDER BY revision DESC',(ref,)):
        if not staff and (item['status']=='draft' or not item['published'] and item['status']!='accepted'):continue
        p=dict(item)
        p['displayStatus']=proposal_status(p,now)
        review=proposal_review(db,p['id'])
        p['review']=review_view(review,staff)
        p['reviewAvailable']=not closed and can_book_review(p,review,now)
        decision=db.execute('SELECT * FROM client_proposal_decisions WHERE proposal=?',(p['id'],)).fetchone()
        if decision:
            keys=('changes','recap','milestone','open_question','due','published') if decision['published'] else ('changes',)
            p['decision']={key:decision[key] for key in (keys if not staff else (*keys,'version'))}
        if decision and decision['published']:
            active_decision=not closed and p['status']=='published' and p['expires']>now
            p['blockerEditable']=not staff and active_decision
            blocker=db.execute('SELECT * FROM client_proposal_blockers WHERE proposal=?',(p['id'],)).fetchone()
            if blocker:
                p['blocker']={key:blocker[key] for key in ('reason','note','expected','resolved','version')}
                if staff:
                    p['blocker'].update(due=blocker['due'],owner=sales_owner(db,ref),
                                        actionable=not closed and p['status']=='published' and not blocker['resolved'])
        if staff:
            p['decisionEditable']=not closed and p['status']=='published' and p['expires']>now and decision_review_exists(db,p['id'])
        if not staff:p.pop('actor',None)
        proposals.append(p)
    result['proposals']=proposals
    if not staff:
        kickoff=kickoff_state(db,ref)
        if kickoff:
            result['kickoff']={key:kickoff[key] for key in ('proposal','revision','currency','materials','contact','materials_ready','scheduled','confirmed','started','version','booking_zone')}
            result['kickoff']['meeting']=kickoff['meeting'] if kickoff['confirmed'] and not kickoff['started'] else ''
            result['kickoff']['canReschedule']=kickoff['confirmed'] and kickoff_can_choose_slot(db,kickoff,now)
            from dashboard import USER
            owner=db.execute('SELECT name FROM team_users WHERE email=? AND active=1',(kickoff['owner'],)).fetchone()
            result['kickoff']['ownerName']=owner['name'] if owner else 'BANDEVI delivery team' if kickoff['owner']==USER else ''
    result['milestones']=[dict(r) for r in db.execute('SELECT * FROM client_milestones WHERE reference=? ORDER BY due,id',(ref,))]
    result['documents']=[dict(r) for r in db.execute('SELECT id,name,mime,length(data) size,created FROM client_documents WHERE reference=? AND deleted=0 ORDER BY created DESC',(ref,))]
    result['tickets']=[]
    for ticket in db.execute('''SELECT t.*,f.proposal,f.kind,p.revision FROM client_tickets t
        LEFT JOIN client_proposal_feedback f ON f.ticket=t.id LEFT JOIN client_proposals p ON p.id=f.proposal
        WHERE t.reference=? ORDER BY (t.id=?) DESC,t.created DESC,t.id LIMIT 100''',(ref,ticket_id)):
        t=dict(ticket);proposal=t.pop('proposal');kind=t.pop('kind');revision=t.pop('revision')
        if proposal:
            t['proposalFeedback']={'proposalId':proposal,'kind':kind,'revision':revision}
            if staff:t['owner']=sales_owner(db,ref)
        if not staff:t.pop('owner',None)
        t['messages']=[dict(r) for r in db.execute('SELECT body,actor,internal,created,sender FROM client_ticket_messages WHERE ticket=?'+('' if staff else ' AND internal=0')+' ORDER BY id',(t['id'],))]
        if not staff:
            for m in t['messages']:
                m['actor']='You' if (m['sender'] or ('client' if m['actor']==row['email'] else 'staff'))=='client' else 'Bandevi team'
                m.pop('internal',None)
        for m in t['messages']:m.pop('sender')
        result['tickets'].append(t)
    return result

def read_json(handler):
    if handler.headers.get('Content-Type','').split(';')[0]!='application/json':raise Problem(400,'JSON required.')
    try: length=int(handler.headers.get('Content-Length','0'))
    except ValueError:raise Problem(400,'Invalid request.')
    if not 0<length<=750000:raise Problem(413,'Request is too large.')
    try:data=json.loads(handler.rfile.read(length))
    except (ValueError,UnicodeError):raise Problem(400,'Invalid request.')
    if not isinstance(data,dict):raise Problem(400,'Invalid request.')
    return data

def send_file(handler,content,mime,name=None):
    handler.send_response(200)
    handler.send_header('Content-Type',mime)
    handler.send_header('Cache-Control','no-store')
    handler.send_header('X-Content-Type-Options','nosniff')
    handler.send_header('X-Robots-Tag','noindex, nofollow, noarchive')
    handler.send_header('Referrer-Policy','no-referrer')
    handler.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
    if name:handler.send_header('Content-Disposition','attachment; filename="'+name+'"')
    handler.send_header('Content-Length',str(len(content)));handler.end_headers();handler.wfile.write(content)

def get(handler,connect):
    parsed=urlsplit(handler.path);route=parsed.path
    assets={'/client-workspace/':'index.html','/client-workspace/app.js':'app.js','/client-workspace/styles.css':'styles.css','/team-inbox/workspace/':'staff.html','/team-inbox/workspace/app.js':'app.js','/team-inbox/workspace/styles.css':'styles.css'}
    if route in assets:
        name=assets[route];send_file(handler,(ASSETS/name).read_bytes(),'text/html; charset=utf-8' if name.endswith('.html') else 'application/javascript; charset=utf-8' if name.endswith('.js') else 'text/css; charset=utf-8');return True
    staff=route.startswith('/api/admin/workspace/')
    if not staff and not route.startswith('/api/client/'):return False
    from dashboard import session as staff_session
    identity=staff_session(handler,connect) if staff else None
    with connect() as db:
        if not staff:identity=session(handler,db)
        if route=='/api/client/session':handler.respond(200,{'authenticated':bool(identity),'email':identity['email'] if identity else None,'csrf':identity['csrf'] if identity else None});return True
        if not identity:raise Problem(401,'Sign in to continue.')
        action=route.rsplit('/',1)[-1];query=parse_qs(parsed.query)
        if action=='appointment' and staff:
            ref=query.get('reference',[''])[0]
            if identity['role']=='agent' and not db.execute('SELECT 1 FROM enquiry_workflow WHERE id=? AND owner=?',(ref,identity['actor'])).fetchone():raise Problem(404,'Appointment not found.')
            b=db.execute('SELECT b.enquiry_id,b.state,b.version,s.starts,s.duration,m.url FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id LEFT JOIN demo_meetings m ON m.reference=b.enquiry_id WHERE b.enquiry_id=?',(ref,)).fetchone()
            if not b:raise Problem(404,'Appointment not found.')
            handler.respond(200,dict(b));return True
        if action=='projects':
            sql='SELECT p.* FROM client_projects p';args=[]
            if staff and identity['role']=='agent':sql+=' JOIN enquiry_workflow w ON w.id=p.reference WHERE w.owner=?';args=[identity['actor']]
            elif not staff:sql+=' WHERE p.email=?';args=[identity['email']]
            rows=db.execute(sql+' ORDER BY p.created DESC LIMIT 200',args).fetchall()
            handler.respond(200,{'projects':[dict(r) for r in rows]});return True
        if action=='report' and staff:
            try:days=int(query.get('days',['30'])[0])
            except ValueError:days=0
            if days not in (7,30,90):raise Problem(400,'Choose 7, 30 or 90 days.')
            where="e.email_status!='qa-verified' AND e.created>=?";args=[int(time.time())-days*86400]
            if identity['role']=='agent':where+=' AND w.owner=?';args.append(identity['actor'])
            refs=[r[0] for r in db.execute('SELECT e.id FROM enquiries e LEFT JOIN enquiry_workflow w ON w.id=e.id WHERE '+where,args)]
            stats={'enquiries':len(refs),'demoReserved':0,'proposalProjects':0,'acceptedProjects':0,'overdueFollowups':0,'openTickets':0,'overdueTickets':0}
            losses={};now=int(time.time());today=datetime.datetime.now(operations.INDIA).date().isoformat()
            for ref in refs:
                stats['demoReserved']+=bool(db.execute("SELECT 1 FROM appointment_events WHERE enquiry_id=? AND event IN ('confirmed','rescheduled')",(ref,)).fetchone())
                stats['proposalProjects']+=bool(db.execute("SELECT 1 FROM client_proposals WHERE reference=? AND published>0",(ref,)).fetchone())
                stats['acceptedProjects']+=bool(db.execute("SELECT 1 FROM client_proposals WHERE reference=? AND status='accepted'",(ref,)).fetchone())
                w=db.execute('SELECT * FROM enquiry_workflow WHERE id=?',(ref,)).fetchone()
                if w and w['stage'] not in ('Won','Lost') and w['follow_up_date'] and w['follow_up_date']<today:stats['overdueFollowups']+=1
                loss=db.execute('SELECT reason FROM client_loss_reasons WHERE reference=?',(ref,)).fetchone()
                if w and w['stage']=='Lost':reason=loss[0] if loss else 'Not recorded';losses[reason]=losses.get(reason,0)+1
                for t in db.execute("SELECT due FROM client_tickets WHERE reference=? AND status IN ('Open','In progress')",(ref,)):
                    stats['openTickets']+=1;stats['overdueTickets']+=t[0]<now
            handler.respond(200,{'days':days,'counts':stats,'lostReasons':losses,'basis':'Received-date enquiry cohort. Demo reservations and published/accepted proposals require recorded events. Support counts are limited to this cohort.'});return True
        if action=='proposal-queue' and staff:return proposal_queue(handler,db,identity,query)
        if action=='review-slots' and not staff:
            ref=query.get('reference',[''])[0]
            project(db,ref,identity)
            now=int(time.time())
            proposal=reviewable_proposal(db,ref,query.get('id',[''])[0],now)
            handler.respond(200,{'slots':[dict(slot) for slot in operations.available_slots(db,now,proposal['expires'])]})
            return True
        if action=='kickoff-queue' and staff:
            db.execute('BEGIN')
            handler.respond(200,kickoff_queue(db,identity,query));return True
        if action in ('kickoff-slots','kickoff-calendar') and not staff:
            db.execute('BEGIN')
            ref=query.get('reference',[''])[0]
            project(db,ref,identity)
            state=kickoff_state(db,ref)
            if not state or state['proposal']!=query.get('id',[''])[0]:
                raise Problem(404,'Kickoff is not available.')
            if action=='kickoff-calendar':
                if not state['confirmed'] or not state['scheduled']:
                    raise Problem(409,'Confirm a kickoff time before downloading a calendar event.')
                event=appointment_calendar('kickoff',ref,state['scheduled'],KICKOFF_MINUTES,state['version'],False,
                    'Open Client Workspace for the current joining details.','https://bandeviglobalgroup.com/client-workspace/')
                send_file(handler,event.encode(),'text/calendar; charset=utf-8','Bandevi-kickoff.ics');return True
            handler.respond(200,{'slots':available_kickoff_slots(db,state,int(time.time())),
                                 'version':state['version']});return True
        if action=='proposal-pdf':
            db.execute('BEGIN')
            proposal=db.execute('SELECT * FROM client_proposals WHERE id=?',(query.get('id',[''])[0],)).fetchone()
            if not proposal:raise Problem(404,'Proposal not found.')
            row=project(db,proposal['reference'],identity,staff)
            if not staff and (proposal['status']=='draft' or not proposal['published'] and proposal['status']!='accepted'):raise Problem(404,'Proposal not found.')
            try:
                from proposal_pdf import generate
                content=generate(dict(row),dict(proposal),int(time.time()))
            except ValueError as error:raise Problem(422,str(error))
            except ImportError:raise Problem(503,'PDF export is temporarily unavailable. The recorded proposal remains in your workspace.')
            filename='Bandevi-'+re.sub(r'[^a-zA-Z0-9_-]','_',row['reference'])+'-revision-'+str(proposal['revision'])+'.pdf'
            send_file(handler,content,'application/pdf',filename);return True
        if action=='project':
            row=project(db,query.get('reference',[''])[0],identity,staff)
            ticket_id=query.get('ticket',[''])[0] if staff else ''
            handler.respond(200,detail(db,row,staff,ticket_id));return True
        if action=='document':
            doc=db.execute('SELECT * FROM client_documents WHERE id=? AND deleted=0',(query.get('id',[''])[0],)).fetchone()
            if not doc:raise Problem(404,'Document not found.')
            project(db,doc['reference'],identity,staff);send_file(handler,doc['data'],'application/octet-stream',doc['name']);return True
    raise Problem(404,'Not found.')

def login(handler,db,data,salt,activate=False):
    from dashboard import password_hash,check_password
    now=int(time.time());fingerprint=digest(salt+handler.headers.get('X-Real-IP',handler.client_address[0]))
    db.execute('DELETE FROM client_logins WHERE created<?',(now-900,))
    if db.execute('SELECT COUNT(*) FROM client_logins WHERE fingerprint=?',(fingerprint,)).fetchone()[0]>=5 or db.execute('SELECT COUNT(*) FROM client_logins').fetchone()[0]>=100:raise Problem(429,'Try again in 15 minutes.')
    db.execute('INSERT INTO client_logins VALUES(?,?)',(fingerprint,now))
    password=value(data,'password',1024)
    if activate:
        if len(password)<14:raise Problem(400,'Use at least 14 characters.')
        token=value(data,'token',128)
        invite=db.execute('SELECT * FROM client_invites WHERE digest=? AND expires>? AND used=0',(digest(token),now)).fetchone()
        if not invite:raise Problem(401,'This invitation is invalid or expired.')
        account=db.execute('SELECT * FROM client_accounts WHERE email=? AND active=1',(invite['email'],)).fetchone()
        if not account:raise Problem(401,'This invitation is invalid or expired.')
        email=invite['email'];db.execute('UPDATE client_accounts SET password_hash=? WHERE email=?',(password_hash(password),email))
        db.execute('UPDATE client_invites SET used=1 WHERE email=?',(email,));db.execute('DELETE FROM client_sessions WHERE email=?',(email,))
        audit(db,'ACCOUNT','activated',email)
    else:
        email=value(data,'email',254).lower();account=db.execute('SELECT * FROM client_accounts WHERE email=? AND active=1',(email,)).fetchone()
        # Equal-cost hash verification for missing accounts.
        stored=account['password_hash'] if account and account['password_hash'] else 'scrypt1:'+'0'*32+':'+'0'*128
        if not check_password(password,stored):raise Problem(401,'Email or password is incorrect.')
    token=secrets.token_urlsafe(32);csrf=secrets.token_urlsafe(32)
    db.execute('DELETE FROM client_sessions WHERE expires<?',(now,))
    db.execute('INSERT INTO client_sessions VALUES(?,?,?,?)',(digest(token),email,csrf,now+28800))
    return {'ok':True,'csrf':csrf,'email':email},{'Set-Cookie':cookie(token)}

def post(handler,connect,origins,salt):
    route=urlsplit(handler.path).path;staff=route.startswith('/api/admin/workspace/')
    if not staff and not route.startswith('/api/client/'):return False
    if handler.headers.get('Origin') not in origins:raise Problem(403,'Use the website to continue.')
    data=read_json(handler);action=route.rsplit('/',1)[-1]
    from dashboard import session as staff_session
    identity=staff_session(handler,connect) if staff else None
    result={'ok':True};headers={}
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        if not staff and action in ('login','activate'):
            # Preserve login rate-limit writes on failures, but activation commits only on success.
            try:result,headers=login(handler,db,data,salt,action=='activate')
            except Problem as error:
                handler.respond(error.status,{'error':error.message});return True
        else:
            if not staff:identity=session(handler,db)
            if not identity:raise Problem(401,'Sign in to continue.')
            if not hmac.compare_digest(handler.headers.get('X-CSRF-Token','').encode(),identity['csrf'].encode()):raise Problem(403,'Refresh before trying again.')
            actor=identity['actor'] if staff else identity['email']
            if action=='logout' and not staff:
                db.execute('DELETE FROM client_sessions WHERE digest=?',(identity['digest'],));headers={'Set-Cookie':cookie('',True)}
            elif action=='kickoff' and staff:
                result.update(change_kickoff(db,value(data,'reference',30),identity,data,True))
            elif action=='kickoff-slots' and staff:
                change_kickoff_slot(db,identity,data)
            elif action=='proposal-review' and staff:
                ref=value(data,'reference',30);project(db,ref,identity,True)
                change_proposal_review(db,ref,identity,data,True)
            elif action=='proposal-decision' and staff:
                ref=value(data,'reference',30);project(db,ref,identity,True)
                save_proposal_decision(db,ref,actor,data)
            elif action=='proposal-blocker' and staff:
                ref=value(data,'reference',30);project(db,ref,identity,True)
                change_proposal_blocker(db,ref,actor,data,True)
            elif action=='create' and staff:
                ref=value(data,'reference',30);enquiry=db.execute('SELECT payload FROM enquiries WHERE id=?',(ref,)).fetchone()
                if not enquiry:raise Problem(404,'Enquiry not found.')
                if identity['role']=='agent' and not db.execute('SELECT 1 FROM enquiry_workflow WHERE id=? AND owner=?',(ref,actor)).fetchone():raise Problem(404,'Enquiry not found.')
                email=json.loads(enquiry[0])['email'].strip().lower()
                if not email:raise Problem(400,'An email address is required before creating a client workspace.')
                if db.execute('SELECT 1 FROM client_projects WHERE reference=?',(ref,)).fetchone():raise Problem(409,'This enquiry already has a project.')
                db.execute('INSERT INTO client_projects(reference,email,title,created) VALUES(?,?,?,?)',(ref,email,value(data,'title',160),int(time.time())))
                audit(db,ref,'project-created',actor);result['reference']=ref
            elif action=='meeting' and staff:
                ref=value(data,'reference',30);b=db.execute('SELECT * FROM demo_bookings WHERE enquiry_id=?',(ref,)).fetchone()
                if not b:raise Problem(404,'Appointment not found.')
                if identity['role']=='agent' and not db.execute("""SELECT 1 FROM demo_slots s
                    WHERE s.id=? AND ((s.host=? AND s.starts>?) OR EXISTS
                        (SELECT 1 FROM enquiry_workflow w WHERE w.id=? AND w.owner=?))""",
                        (b['slot_id'],actor,int(time.time()),ref,actor)).fetchone():raise Problem(404,'Appointment not found.')
                if b['state']!='confirmed':raise Problem(409,'Appointment is cancelled.')
                if type(data.get('version'))!=int or b['version']!=data['version']:raise Problem(409,'Appointment changed. Refresh before saving.')
                url=value(data,'url',500);u=urlsplit(url)
                if u.scheme!='https' or not u.hostname or u.username or u.password or any(c.isspace() for c in url):raise Problem(400,'Use an HTTPS meeting link.')
                db.execute('INSERT INTO demo_meetings VALUES(?,?) ON CONFLICT(reference) DO UPDATE SET url=excluded.url',(ref,url))
                db.execute('UPDATE demo_bookings SET version=version+1 WHERE enquiry_id=?',(ref,))
                email=json.loads(db.execute('SELECT payload FROM enquiries WHERE id=?',(ref,)).fetchone()[0])['email']
                operations.enqueue(db,'appointment:'+ref+':'+str(b['version']+1),email,'Bandevi demo joining details','Reference: '+ref+'\nJoin your confirmed demo: '+url)
                audit(db,ref,'meeting-link',actor);result['version']=b['version']+1
            elif action=='loss' and staff:
                ref=value(data,'reference',30)
                if not db.execute('SELECT 1 FROM enquiries WHERE id=?',(ref,)).fetchone():raise Problem(404,'Enquiry not found.')
                if identity['role']=='agent' and not db.execute('SELECT 1 FROM enquiry_workflow WHERE id=? AND owner=?',(ref,actor)).fetchone():raise Problem(404,'Enquiry not found.')
                reason=value(data,'reason',100)
                if reason not in ('Budget','Timing','Scope mismatch','Competitor','No response','Other'):raise Problem(400,'Choose a loss reason.')
                db.execute('INSERT INTO client_loss_reasons VALUES(?,?) ON CONFLICT(reference) DO UPDATE SET reason=excluded.reason',(ref,reason));audit(db,ref,'loss-reason',actor,reason)
            else:
                row=project(db,value(data,'reference',30),identity,staff);ref=row['reference']
                if staff:
                    if type(data.get('version'))!=int or data['version']!=row['version']:raise Problem(409,'Project changed. Reload before saving.')
                    staff_change(db,row,identity,action,data,result)
                    db.execute('UPDATE client_projects SET version=version+1 WHERE reference=?',(ref,));result['version']=row['version']+1
                else:client_change(db,row,identity,action,data,result)
    handler.respond(200,result,headers);return True

def staff_change(db,row,identity,action,data,result):
    ref=row['reference'];actor=identity['actor'];now=int(time.time())
    if action=='invite':
        if identity['role']=='agent':raise Problem(403,'Manager access is required to change client access.')
        db.execute('INSERT INTO client_accounts(email) VALUES(?) ON CONFLICT(email) DO UPDATE SET active=1',(row['email'],))
        db.execute('UPDATE client_invites SET used=1 WHERE email=?',(row['email'],))
        token=secrets.token_urlsafe(32);db.execute('INSERT INTO client_invites VALUES(?,?,?,0)',(digest(token),row['email'],now+7*86400))
        # Explicit invite action queues the account email. Never return the bearer link to staff.
        operations.enqueue(db,'client-invite:'+digest(token),row['email'],'Your Bandevi client workspace invitation','Set or reset your password using this private link within seven days:\nhttps://bandeviglobalgroup.com/client-workspace/#invite='+token+'\nDo not share this link.')
    elif action=='disable':
        if identity['role']=='agent':raise Problem(403,'Manager access is required to change client access.')
        db.execute('UPDATE client_accounts SET active=0 WHERE email=?',(row['email'],));db.execute('DELETE FROM client_sessions WHERE email=?',(row['email'],));db.execute('UPDATE client_invites SET used=1 WHERE email=?',(row['email'],))
    elif action=='proposal':
        title=value(data,'title',160);scope=value(data,'scope',2500);terms=value(data,'terms',2500)
        try:minor=operations.money(data.get('value'))
        except ValueError:raise Problem(400,'Enter a valid proposal value.')
        currency=data.get('currency');expires=data.get('expires')
        if currency not in ('INR','USD','GBP','EUR','AED') or type(expires)!=int or not now<expires<=now+365*86400:raise Problem(400,'Check the currency and future expiry.')
        revision=db.execute('SELECT COALESCE(MAX(revision),0)+1 FROM client_proposals WHERE reference=?',(ref,)).fetchone()[0];pid=secrets.token_hex(12)
        changes=value(data,'changes',800,False)
        db.execute('INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,created,actor) VALUES(?,?,?,?,?,?,?,?,?,?,?)',(pid,ref,revision,title,scope,terms,minor,currency,expires,now,actor));result['proposalId']=pid
        if revision>1 and changes:db.execute('INSERT INTO client_proposal_decisions(proposal,changes) VALUES(?,?)',(pid,changes))
    elif action in ('publish','withdraw'):
        pid=value(data,'id',30);p=db.execute('SELECT * FROM client_proposals WHERE id=? AND reference=?',(pid,ref)).fetchone()
        if not p:raise Problem(404,'Proposal not found.')
        if action=='publish':
            if p['status']!='draft' or p['expires']<=now:raise Problem(409,'Only unexpired drafts can be published.')
            if p['revision']!=db.execute('SELECT MAX(revision) FROM client_proposals WHERE reference=?',(ref,)).fetchone()[0]:raise Problem(409,'Publish the latest revision.')
            db.execute("UPDATE client_proposals SET status='superseded' WHERE reference=? AND status='published'",(ref,));db.execute("UPDATE client_proposals SET status='published',published=? WHERE id=?",(now,pid))
            operations.enqueue(db,'proposal-published:'+pid,row['email'],'Bandevi proposal ready for review','A proposal is ready in your secure workspace.\nhttps://bandeviglobalgroup.com/client-workspace/\nProject reference: '+ref)
        else:
            if p['status'] not in ('draft','published'):raise Problem(409,'Accepted and historical proposals are preserved.')
            db.execute("UPDATE client_proposals SET status='withdrawn' WHERE id=?",(pid,))
    elif action=='milestone':
        mid=data.get('id') or secrets.token_hex(12)
        if not isinstance(mid,str) or len(mid)>30:raise Problem(400,'Invalid milestone.')
        old=db.execute('SELECT reference FROM client_milestones WHERE id=?',(mid,)).fetchone()
        if old and old[0]!=ref:raise Problem(404,'Milestone not found.')
        title=value(data,'title',160);due=value(data,'due',10,False);notes=value(data,'notes',1500,False);status=data.get('status')
        try:
            if due and datetime.date.fromisoformat(due).isoformat()!=due:raise ValueError()
        except ValueError:raise Problem(400,'Use a valid milestone date.')
        if status not in ('Planned','In progress','Ready for review','Approved','Complete'):raise Problem(400,'Choose a milestone status.')
        db.execute('INSERT INTO client_milestones VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,due=excluded.due,status=excluded.status,notes=excluded.notes',(mid,ref,title,due,status,notes))
    elif action=='document':
        name=value(data,'name',100)
        if not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9 ._-]{0,95}\.(pdf|txt|png|jpg|jpeg)',name,re.I) or '..' in name:raise Problem(400,'Use a simple PDF, TXT, PNG or JPG filename.')
        try:content=base64.b64decode(data.get('content',''),validate=True)
        except (ValueError,TypeError):raise Problem(400,'Invalid document.')
        if not 0<len(content)<=512*1024:raise Problem(400,'Documents must be between 1 byte and 512 KB.')
        ext=name.rsplit('.',1)[-1].lower();mime={'pdf':'application/pdf','txt':'text/plain','png':'image/png','jpg':'image/jpeg','jpeg':'image/jpeg'}[ext]
        if ext=='pdf' and not content.startswith(b'%PDF-') or ext=='png' and not content.startswith(b'\x89PNG\r\n\x1a\n') or ext in ('jpg','jpeg') and not content.startswith(b'\xff\xd8\xff'):raise Problem(400,'File content does not match its extension.')
        if ext=='txt':
            try:content.decode('utf-8')
            except UnicodeError:raise Problem(400,'Text documents must use UTF-8.')
        if db.execute('SELECT COUNT(*) FROM client_documents WHERE reference=? AND deleted=0',(ref,)).fetchone()[0]>=30:raise Problem(400,'A project may have at most 30 active documents.')
        db.execute('INSERT INTO client_documents(id,reference,name,mime,data,created,actor) VALUES(?,?,?,?,?,?,?)',(secrets.token_hex(12),ref,name,mime,content,now,actor))
    elif action=='remove-document':
        if not db.execute('UPDATE client_documents SET deleted=1 WHERE id=? AND reference=? AND deleted=0',(value(data,'id',30),ref)).rowcount:raise Problem(404,'Document not found.')
    elif action=='ticket':ticket_change(db,row,identity,data,True)
    elif action=='status':
        status=data.get('status')
        if status not in ('Planning','In progress','Review','Delivered','On hold'):raise Problem(400,'Choose a project status.')
        db.execute('UPDATE client_projects SET status=? WHERE reference=?',(status,ref))
    else:raise Problem(404,'Not found.')
    audit(db,ref,action,actor,str(data.get('id','')))

def client_change(db,row,identity,action,data,result):
    ref=row['reference'];actor=identity['email'];now=int(time.time())
    if action=='accept':
        pid=value(data,'id',30);name=value(data,'name',120)
        if data.get('agree') is not True:raise Problem(400,'Confirm that you accept the displayed scope and commercial terms.')
        p=db.execute('SELECT * FROM client_proposals WHERE id=? AND reference=?',(pid,ref)).fetchone()
        if not p:raise Problem(404,'Proposal not found.')
        if p['status']=='accepted':result['alreadyAccepted']=True;return
        if p['status']!='published' or p['expires']<=now:raise Problem(409,'This proposal is unavailable or expired. Refresh before accepting.')
        db.execute("UPDATE client_proposals SET status='accepted',accepted=?,accepted_by=? WHERE id=?",(now,name+' <'+actor+'>',pid))
        db.execute('UPDATE client_projects SET version=version+1 WHERE reference=?',(ref,));audit(db,ref,'proposal-accepted',actor,pid)
        from dashboard import USER
        owner=db.execute('SELECT owner FROM enquiry_workflow WHERE id=?',(ref,)).fetchone();recipient=owner[0] if owner and active_owner(db,owner[0]) else USER
        operations.enqueue(db,'proposal-accepted:'+pid,recipient,'Bandevi proposal accepted','Project '+ref+' has an accepted proposal. Review the authenticated record in the team workspace.')
        operations.enqueue(db,'proposal-receipt:'+pid,actor,'Your Bandevi proposal acceptance receipt','Project '+ref+'\nProposal revision '+str(p['revision'])+'\nAccepted by '+name+'\nReview the preserved scope and terms:\nhttps://bandeviglobalgroup.com/client-workspace/')
    elif action=='approve-milestone':
        mid=value(data,'id',30)
        if not db.execute("UPDATE client_milestones SET status='Approved' WHERE id=? AND reference=? AND status='Ready for review'",(mid,ref)).rowcount:raise Problem(409,'This milestone is not awaiting approval.')
        db.execute('UPDATE client_projects SET version=version+1 WHERE reference=?',(ref,));audit(db,ref,'milestone-approved',actor,mid)
    elif action=='ticket':ticket_change(db,row,identity,data,False)
    elif action=='proposal-feedback':result['ticketId']=create_proposal_feedback(db,row,identity,data,now)
    elif action=='proposal-blocker':change_proposal_blocker(db,ref,actor,data,False)
    elif action=='proposal-review':change_proposal_review(db,ref,identity,data,False)
    elif action=='kickoff':result.update(change_kickoff(db,ref,identity,data,False))
    else:raise Problem(404,'Not found.')

def decision_review_exists(db,pid):
    return bool(db.execute("SELECT 1 FROM client_proposal_reviews WHERE proposal=? AND state='attended'",(pid,)).fetchone())


def change_proposal_blocker(db,ref,actor,data,staff):
    pid=value(data,'id',30)
    now=int(time.time())
    proposal=db.execute("""SELECT p.status,p.expires FROM client_proposals p
        JOIN client_proposal_decisions d ON d.proposal=p.id AND d.published>0
        WHERE p.id=? AND p.reference=?""",(pid,ref)).fetchone()
    if not proposal:raise Problem(404,'Decision card not found.')
    if (proposal['status']!='published' or (not staff and proposal['expires']<=now)
            or db.execute("SELECT 1 FROM enquiry_workflow WHERE id=? AND stage IN ('Won','Lost')",(ref,)).fetchone()):
        raise Problem(409,'This decision card is no longer active.')
    prior=db.execute('SELECT * FROM client_proposal_blockers WHERE proposal=?',(pid,)).fetchone()
    version=prior['version'] if prior else 0
    if type(data.get('blockerVersion')) is not int or data['blockerVersion']!=version:
        raise Problem(409,'The blocker changed. Refresh before saving.')
    if staff:
        if not prior or prior['resolved']:raise Problem(409,'There is no open blocker to resolve.')
        db.execute('UPDATE client_proposal_blockers SET resolved=?,version=version+1 WHERE proposal=?',(now,pid))
        audit(db,ref,'proposal-blocker-resolved',actor,pid)
        return
    reason=value(data,'reason',30)
    if reason not in BLOCKER_LABELS:raise Problem(400,'Choose what is holding up your decision.')
    note=value(data,'note',600,False)
    expected=value(data,'expected',10,False)
    if prior and not prior['resolved'] and (reason,note,expected)==(prior['reason'],prior['note'],prior['expected']):
        return
    today=datetime.datetime.fromtimestamp(now,operations.INDIA).date()
    if expected:
        try:
            date=datetime.date.fromisoformat(expected)
            if date.isoformat()!=expected or (not prior or expected!=prior['expected']) and not today<=date<=today+datetime.timedelta(days=365):
                raise ValueError()
        except ValueError:raise Problem(400,'Choose an expected decision date from today through the next year.')
        due=expected
    elif prior and not prior['resolved'] and not prior['expected']:
        due=prior['due']
    else:
        date=today+datetime.timedelta(days=1)
        while date.weekday()>=5:
            date+=datetime.timedelta(days=1)
        due=date.isoformat()
    db.execute("""INSERT INTO client_proposal_blockers(proposal,reason,note,expected,due,created,version)
        VALUES(?,?,?,?,?,?,?) ON CONFLICT(proposal) DO UPDATE SET reason=excluded.reason,note=excluded.note,
        expected=excluded.expected,due=excluded.due,resolved=0,version=excluded.version""",
        (pid,reason,note,expected,due,now,version+1))
    audit(db,ref,'proposal-blocker-saved',actor,pid)


def save_proposal_decision(db,ref,actor,data):
    pid=value(data,'id',30);now=int(time.time())
    p=db.execute('SELECT status,published,expires FROM client_proposals WHERE id=? AND reference=?',(pid,ref)).fetchone()
    if not p:raise Problem(404,'Proposal not found.')
    if (p['status']!='published' or not p['published'] or p['expires']<=now or not decision_review_exists(db,pid)
            or db.execute("SELECT 1 FROM enquiry_workflow WHERE id=? AND stage IN ('Won','Lost')",(ref,)).fetchone()):
        raise Problem(409,'A current unexpired proposal and a recorded attended review are required.')
    prior=db.execute('SELECT version,due FROM client_proposal_decisions WHERE proposal=?',(pid,)).fetchone()
    version=prior['version'] if prior else 0
    if type(data.get('decisionVersion')) is not int or data['decisionVersion']!=version:
        raise Problem(409,'The decision card changed. Refresh before publishing.')
    if data.get('reviewed') is not True:raise Problem(400,'Confirm that the card is ready to share with the client.')
    recap=value(data,'recap',1200)
    milestone=value(data,'milestone',280,False)
    question=value(data,'openQuestion',500,False)
    due=value(data,'due',10,False)
    if due and (not prior or due!=prior['due']):
        try:
            day=datetime.date.fromisoformat(due)
            today=datetime.datetime.fromtimestamp(now,operations.INDIA).date()
            expires=datetime.datetime.fromtimestamp(p['expires'],operations.INDIA).date()
            if day.isoformat()!=due or not today<=day<=expires:raise ValueError()
        except ValueError:raise Problem(400,'Choose a decision date from today through the proposal expiry.')
    db.execute('''INSERT INTO client_proposal_decisions(proposal,recap,milestone,open_question,due,published,version)
        VALUES(?,?,?,?,?,?,?) ON CONFLICT(proposal) DO UPDATE SET recap=excluded.recap,milestone=excluded.milestone,
        open_question=excluded.open_question,due=excluded.due,
        published=COALESCE(NULLIF(client_proposal_decisions.published,0),excluded.published),version=excluded.version''',
        (pid,recap,milestone,question,due,now,version+1))
    audit(db,ref,'proposal-decision-published',actor,pid)


REVIEW_TOPICS={'scope':'Scope','budget':'Budget','timing':'Timing','integrations':'Integrations','other':'Other'}
REVIEW_ROWS="""SELECT r.*,s.starts,s.duration,s.host,p.revision,p.status AS proposal_status,p.expires
    FROM client_proposal_reviews r JOIN demo_slots s ON s.id=r.slot_id JOIN client_proposals p ON p.id=r.proposal"""


def proposal_review(db,pid):
    return db.execute(REVIEW_ROWS+' WHERE r.proposal=? ORDER BY r.rowid DESC LIMIT 1',(pid,)).fetchone()


def review_view(review,staff=False):
    if not review:return None
    keys=('id','topic','meeting','state','starts','duration','version')
    return {key:review[key] for key in keys+(('host','followed') if staff else ())}


def can_book_review(proposal,review,now):
    return (proposal['status']=='published' and proposal['published']>0 and proposal['expires']>now
            and (not review or review['state'] not in ('booked','attended')))


def reviewable_proposal(db,ref,pid,now):
    proposal=db.execute("SELECT * FROM client_proposals WHERE id=? AND reference=? AND published>0",(pid,ref)).fetchone()
    if not proposal:raise Problem(404,'Proposal not found.')
    if (not can_book_review(proposal,proposal_review(db,pid),now)
            or db.execute("SELECT 1 FROM enquiry_workflow WHERE id=? AND stage IN ('Won','Lost')",(ref,)).fetchone()):
        raise Problem(409,'This revision is no longer open for a new review booking.')
    return proposal


def change_proposal_review(db,ref,identity,data,staff):
    pid=value(data,'id',30);action=data.get('action');now=int(time.time())
    actor=identity['actor'] if staff else identity['email']
    if action=='book' and not staff:
        slot_id=value(data,'slotId',30);topic=value(data,'topic',20,False)
        if topic and topic not in REVIEW_TOPICS:raise Problem(400,'Choose a review topic or leave it blank.')
        existing=proposal_review(db,pid)
        if existing and existing['reference']==ref and existing['state']=='booked' and existing['slot_id']==slot_id:return
        proposal=reviewable_proposal(db,ref,pid,now)
        slot=operations.available_slot(db,slot_id,now)
        if not slot or slot['starts']+slot['duration']*60>proposal['expires'] or slot['starts']>=now+180*86400:
            raise Problem(409,'That time is no longer available. Refresh available times.')
        rid=secrets.token_hex(12)
        db.execute('INSERT INTO client_proposal_reviews(id,reference,proposal,slot_id,topic,created) VALUES(?,?,?,?,?,?)',
                   (rid,ref,pid,slot_id,topic,now))
    else:
        rid=value(data,'reviewId',30)
        review=db.execute(REVIEW_ROWS+' WHERE r.reference=? AND r.proposal=? AND r.id=?',(ref,pid,rid)).fetchone()
        if not review:raise Problem(404,'Proposal review not found.')
        if type(data.get('reviewVersion')) is not int or data['reviewVersion']!=review['version']:
            raise Problem(409,'The review changed. Refresh before saving.')
        if action in ('cancel','meeting') and review['state']=='booked' and review['starts']>now:
            if action=='cancel':
                db.execute("UPDATE client_proposal_reviews SET state='cancelled',meeting='',outcome_at=?,version=version+1 WHERE id=?",(now,rid))
                if not active_owner(db,review['host']):db.execute('UPDATE demo_slots SET active=0 WHERE id=?',(review['slot_id'],))
            elif staff:
                url=value(data,'url',500);parsed=urlsplit(url)
                if parsed.scheme!='https' or not parsed.hostname or parsed.username or parsed.password or any(char.isspace() for char in url):
                    raise Problem(400,'Use a valid HTTPS meeting link.')
                db.execute('UPDATE client_proposal_reviews SET meeting=?,version=version+1 WHERE id=?',(url,rid))
            else:raise Problem(403,'Staff access is required.')
        elif staff and action in ('attended','no_show') and review['state']=='booked' and review['starts']+review['duration']*60<=now:
            db.execute('UPDATE client_proposal_reviews SET state=?,outcome_at=?,version=version+1 WHERE id=?',(action,now,rid))
        elif staff and action=='followed' and review['state'] in ('attended','no_show') and not review['followed']:
            db.execute('UPDATE client_proposal_reviews SET followed=?,version=version+1 WHERE id=?',(now,rid))
        else:raise Problem(409,'This action is unavailable for the current review and time.')
    audit(db,ref,'proposal-review-'+action,actor,pid+':'+rid)


KICKOFF_ROWS = """SELECT project.reference,project.title,proposal.id AS proposal,proposal.revision,
    proposal.currency,proposal.accepted,proposal.accepted_by,e.payload,COALESCE(w.owner,'') AS sales_owner,
    COALESCE(k.owner,'') AS owner,COALESCE(k.materials,'') AS materials,k.contact AS contact,
    COALESCE(k.materials_ready,0) AS materials_ready,COALESCE(k.scheduled,0) AS scheduled,
    COALESCE(k.confirmed,0) AS confirmed,COALESCE(k.started,0) AS started,COALESCE(k.version,0) AS version,
    COALESCE(s.zone,'') AS booking_zone,COALESCE(m.url,'') AS meeting
    FROM client_projects project JOIN enquiries e ON e.id=project.reference
    LEFT JOIN enquiry_workflow w ON w.id=project.reference LEFT JOIN client_kickoffs k ON k.reference=project.reference
    LEFT JOIN client_kickoff_slots s ON s.reference=project.reference
    LEFT JOIN client_kickoff_meetings m ON m.reference=project.reference
    JOIN client_proposals proposal ON proposal.id=COALESCE(k.proposal,(SELECT id FROM client_proposals
        WHERE reference=project.reference AND status='accepted' AND accepted>0 ORDER BY accepted,revision LIMIT 1))
    WHERE e.email_status!='qa-verified' AND proposal.status='accepted'"""


def kickoff_state(db, reference):
    row=db.execute(KICKOFF_ROWS+' AND project.reference=?',(reference,)).fetchone()
    return kickoff_record(row) if row else None


def kickoff_record(row):
    state=dict(row)
    accepted_by=state.pop('accepted_by') or ''
    if state['contact'] is None:
        state['contact']=accepted_by.rsplit(' <',1)[0][:160]
    return state


def kickoff_access(db, state, identity):
    owner=state['owner'] if state['owner'] and active_owner(db,state['owner']) else ''
    return identity['role']!='agent' or identity['actor']==(owner or state['sales_owner'])


def kickoff_conflict(db, host, starts, duration, reference=''):
    end=starts+duration*60
    return db.execute("""SELECT 1 FROM client_kickoff_slots
        WHERE host=? AND starts<? AND starts+? > ? AND (active=1 OR reference IS NOT NULL)
        AND (reference IS NULL OR reference!=?)
        UNION ALL SELECT 1 FROM client_kickoffs
        WHERE owner=? AND scheduled>0 AND scheduled<? AND scheduled+? > ? AND reference!=?
        LIMIT 1""",(host,end,KICKOFF_MINUTES*60,starts,reference,
                     host,end,KICKOFF_MINUTES*60,starts,reference)).fetchone()


def kickoff_demo_conflict(db, host, starts):
    return db.execute("""SELECT 1 FROM demo_slots s WHERE s.host=? AND s.starts<?
        AND s.starts+s.duration*60>? AND (s.active=1 OR NOT ("""+operations.SLOT_FREE+'))',
        (host,starts+KICKOFF_MINUTES*60,starts)).fetchone()


def kickoff_can_choose_slot(db, state, now):
    return (not state['started'] and (not state['confirmed'] or state['scheduled']>now)
            and active_owner(db,state['owner']))


def available_kickoff_slots(db, state, now):
    if not kickoff_can_choose_slot(db,state,now):
        return []
    rows=db.execute("""SELECT id,starts FROM client_kickoff_slots
        WHERE host=? AND active=1 AND reference IS NULL AND starts>? ORDER BY starts LIMIT 30""",
        (state['owner'],now))
    return [{**dict(slot),'duration':KICKOFF_MINUTES} for slot in rows]


def change_kickoff_slot(db, identity, data):
    if identity['role']=='agent':raise Problem(403,'A manager must manage kickoff availability.')
    if data.get('action')=='close':
        slot_id=value(data,'slotId',30)
        if not db.execute('UPDATE client_kickoff_slots SET active=0 WHERE id=? AND active=1 AND reference IS NULL',
                          (slot_id,)).rowcount:
            raise Problem(409,'That slot is booked or no longer open.')
        audit(db,'KICKOFF-SLOTS','kickoff-slot-closed',identity['actor'],slot_id)
        return
    if data.get('action')!='publish':raise Problem(400,'Choose a kickoff availability action.')
    starts=data.get('starts')
    now=int(time.time())
    if type(starts) is not int or not now+3600<=starts<=now+180*86400 or starts%900:
        raise Problem(400,'Choose a 15-minute boundary at least one hour ahead and within 180 days.')
    host=value(data,'host',254).lower()
    if not active_owner(db,host):raise Problem(400,'Choose an active delivery owner.')
    if kickoff_conflict(db,host,starts,KICKOFF_MINUTES) or kickoff_demo_conflict(db,host,starts):
        raise Problem(409,'This owner already has an overlapping slot or appointment.')
    slot_id=secrets.token_hex(12)
    db.execute('INSERT INTO client_kickoff_slots(id,host,starts) VALUES(?,?,?)',(slot_id,host,starts))
    audit(db,'KICKOFF-SLOTS','kickoff-slot-published',identity['actor'],slot_id)


def kickoff_queue(db, identity, query):
    from dashboard import USER
    from growth_workbench import COUNTRIES,country
    market=query.get('country',[''])[0]
    status=query.get('status',['all'])[0]
    try:offset=int(query.get('offset',['0'])[0])
    except ValueError:raise Problem(400,'Choose a valid queue page.')
    if market not in ('',*COUNTRIES) or status not in ('all','unbooked','booked','missing-link') or not 0<=offset<=1000000:
        raise Problem(400,'Choose a valid country, booking status or queue page.')
    items=[]
    needs_booking=missing_links=0
    now=int(time.time())
    for record in db.execute(KICKOFF_ROWS+' AND COALESCE(k.started,0)=0'):
        state=kickoff_record(record)
        code=country(json.loads(state.pop('payload')))
        if (market and code!=market) or not kickoff_access(db,state,identity):
            continue
        state.pop('sales_owner')
        if state['owner'] and not active_owner(db,state['owner']):state['owner']=''
        needs_booking+=not state['confirmed']
        missing_link=bool(state['confirmed'] and state['scheduled']>now and not state['meeting'])
        seconds_until=state['scheduled']-now
        link_window=(1 if seconds_until<=3600 else 24 if seconds_until<=86400 else None) if missing_link else None
        missing_links+=missing_link
        if status!='all' and not {'unbooked':not state['confirmed'],'booked':state['confirmed'],'missing-link':missing_link}[status]:
            continue
        items.append({**state,'country':code,'countryLabel':COUNTRIES[code],
                      'followUpOwner':state['owner'] or sales_owner(db,state['reference']),
                      'missingLink':missing_link,'missingLinkHours':link_window})
    items.sort(key=lambda item:(item['missingLinkHours'] or 25,bool(item['confirmed']),bool(item['owner']),item['scheduled'] or 2**63-1,
                                item['accepted'],item['reference']))
    owners=[]
    slots=[]
    if identity['role']!='agent':
        owners=[{'email':USER,'name':'Site administrator'}]+[dict(row) for row in db.execute('SELECT email,name FROM team_users WHERE active=1 ORDER BY name')]
        slots=[dict(row) for row in db.execute("""SELECT id,host,starts,reference IS NOT NULL AS booked
            FROM client_kickoff_slots WHERE starts>? AND active=1 ORDER BY starts LIMIT 100""",(now,))]
    return {'items':items[offset:offset+25],'total':len(items),'offset':offset,'limit':25,'owners':owners,
            'needsBooking':needs_booking,'missingLinks':missing_links,'slots':slots,'canAssign':identity['role']!='agent'}


def change_kickoff(db, reference, identity, data, staff):
    state=kickoff_state(db,reference)
    if not state or staff and not kickoff_access(db,state,identity):
        raise Problem(404,'Kickoff is not available.')
    booking=not staff and data.get('action') in ('book','reschedule')
    if booking:
        if value(data,'id',30)!=state['proposal']:raise Problem(404,'Kickoff is not available on this revision.')
        slot_id=value(data,'slotId',30)
        if db.execute('SELECT 1 FROM client_kickoff_slots WHERE id=? AND reference=?',(slot_id,reference)).fetchone():
            return {'kickoffVersion':state['version']}
    if type(data.get('version')) is not int or data['version']!=state['version'] or state['started']:
        raise Problem(409,'The kickoff changed. Refresh to review the current checklist.')
    now=int(time.time())
    actor=identity['actor'] if staff else identity['email']
    original_schedule=(state['scheduled'],state['confirmed'],state['owner'],state['started'])
    if staff and data.get('action')=='meeting':
        if not state['confirmed'] or state['scheduled']<=now:
            raise Problem(409,'A future confirmed kickoff is required.')
        url=value(data,'url',500,False)
        if url:
            try:
                parsed=urlsplit(url)
                if (parsed.scheme!='https' or not parsed.hostname or parsed.username is not None
                        or parsed.password is not None or '\\' in url or any(char.isspace() for char in url)):
                    raise ValueError()
                parsed.port  # Reject invalid ports.
            except ValueError:raise Problem(400,'Use a valid HTTPS joining link.')
            db.execute('INSERT INTO client_kickoff_meetings VALUES(?,?) ON CONFLICT(reference) DO UPDATE SET url=excluded.url',
                       (reference,url))
        else:
            db.execute('DELETE FROM client_kickoff_meetings WHERE reference=?',(reference,))
        action='kickoff-meeting'
    elif staff and data.get('action')=='start':
        if not (state['owner'] and active_owner(db,state['owner']) and state['contact'] and state['materials_ready']
                and state['confirmed'] and 0<state['scheduled']<=now):
            raise Problem(409,'Assign an active owner, complete the checklist and confirm a kickoff time that has arrived.')
        state['started']=now
        action='kickoff-started'
    elif staff:
        if data.get('action')!='plan':raise Problem(400,'Choose a valid kickoff action.')
        prior_owner=state['owner']
        if 'owner' in data:
            if identity['role']=='agent':raise Problem(403,'A manager must assign the delivery owner.')
            owner=value(data,'owner',254,False).lower()
            if owner and not active_owner(db,owner):raise Problem(400,'Choose an active delivery owner.')
            state['owner']=owner
        materials=value(data,'materials',1500,False)
        scheduled=data.get('scheduled')
        if type(scheduled) is not int or (scheduled!=state['scheduled'] and scheduled!=0 and not now<scheduled<=now+365*86400):
            raise Problem(400,'Choose a future kickoff time within one year, or leave it blank.')
        if materials!=state['materials']:state['materials_ready']=0
        time_changed=scheduled!=state['scheduled']
        owner_changed=state['owner']!=prior_owner
        if scheduled>now and state['owner'] and (time_changed or owner_changed) and (
            kickoff_conflict(db,state['owner'],scheduled,KICKOFF_MINUTES,reference)
            or kickoff_demo_conflict(db,state['owner'],scheduled)
        ):
            raise Problem(409,'This delivery owner already has an overlapping slot or appointment.')
        if time_changed or owner_changed and state['booking_zone']:
            db.execute("UPDATE client_kickoff_slots SET reference=NULL,zone='' WHERE reference=?",(reference,))
            state['confirmed']=0
        if time_changed or owner_changed:
            db.execute('DELETE FROM client_kickoff_meetings WHERE reference=?',(reference,))
        state['materials']=materials
        state['scheduled']=scheduled
        action='kickoff-plan'
    elif booking:
        zone=value(data,'zone',80)
        if not valid_demo_timezone(zone):raise Problem(400,'Choose a valid time zone.')
        reschedule=data['action']=='reschedule'
        if bool(state['confirmed'])!=reschedule or not kickoff_can_choose_slot(db,state,now):
            raise Problem(409,'This kickoff cannot be booked or rescheduled right now.')
        slot=db.execute("""SELECT starts FROM client_kickoff_slots
            WHERE id=? AND host=? AND active=1 AND reference IS NULL AND starts>?""",
            (slot_id,state['owner'],now)).fetchone()
        if not slot:raise Problem(409,'That kickoff time is no longer available. Choose another time.')
        if reschedule:
            db.execute("UPDATE client_kickoff_slots SET reference=NULL,zone='' WHERE reference=?",(reference,))
            db.execute('DELETE FROM client_kickoff_meetings WHERE reference=?',(reference,))
        db.execute('UPDATE client_kickoff_slots SET reference=?,zone=? WHERE id=?',(reference,zone,slot_id))
        state.update(scheduled=slot['starts'],confirmed=1)
        action='kickoff-rescheduled' if reschedule else 'kickoff-booked'
    else:
        contact=value(data,'contact',160,False)
        ready=data.get('materialsReady');confirmed=data.get('confirmed')
        if type(ready) is not bool or type(confirmed) is not bool or confirmed and not state['scheduled']:
            raise Problem(400,'Check the materials and proposed time selections.')
        if confirmed and not state['confirmed'] and state['scheduled']<=now:
            raise Problem(409,'The proposed time has passed. Ask the team to suggest a new time.')
        state.update(contact=contact,materials_ready=int(ready),confirmed=1 if state['booking_zone'] else int(confirmed))
        if state['meeting'] and not state['confirmed']:
            db.execute('DELETE FROM client_kickoff_meetings WHERE reference=?',(reference,))
        action='kickoff-checklist'
    state['version']+=1
    state['updated']=now
    db.execute('''INSERT INTO client_kickoffs VALUES(:reference,:proposal,:owner,:materials,:contact,:materials_ready,
        :scheduled,:confirmed,:started,:version,:updated) ON CONFLICT(reference) DO UPDATE SET owner=excluded.owner,
        materials=excluded.materials,contact=excluded.contact,materials_ready=excluded.materials_ready,
        scheduled=excluded.scheduled,confirmed=excluded.confirmed,started=excluded.started,
        version=excluded.version,updated=excluded.updated''',state)
    if original_schedule!=(state['scheduled'],state['confirmed'],state['owner'],state['started']):
        reset_kickoff_reminders(db,state,now)
    audit(db,reference,action,actor,json.dumps({'version':state['version'],'proposal':state['proposal'],'scheduled':state['scheduled']}))
    return {'kickoffVersion':state['version']}


def reset_kickoff_reminders(db, state, now):
    reference=state['reference']
    db.execute('DELETE FROM client_kickoff_reminder_schedules WHERE reference=?',(reference,))
    db.execute("UPDATE notification_outbox SET status='cancelled' WHERE status='pending' AND dedupe GLOB ?",
               (f'kickoff-reminder:{reference}:s*',))
    if state['confirmed'] and not state['started'] and state['scheduled']>now:
        db.execute('INSERT INTO client_kickoff_reminder_schedules(reference,booked_at) VALUES(?,?)',(reference,now))


PROPOSAL_FEEDBACK_LABELS = {'question':'Proposal question','change':'Proposal change request'}


def sales_owner(db, reference):
    from dashboard import USER
    owner = db.execute('SELECT owner FROM enquiry_workflow WHERE id=?',(reference,)).fetchone()
    return owner[0] if owner and active_owner(db,owner[0]) else USER


def create_proposal_feedback(db, row, identity, data, now):
    pid = value(data,'id',30)
    kind = data.get('kind')
    if not isinstance(kind,str) or kind not in PROPOSAL_FEEDBACK_LABELS:
        raise Problem(400,'Choose a proposal question or change request.')
    body = value(data,'body',2500)
    request_id = value(data,'requestId',36)
    if not re.fullmatch(r'[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}',request_id):
        raise Problem(400,'Refresh before submitting proposal feedback.')
    proposal = db.execute('SELECT revision,status,published,expires FROM client_proposals WHERE id=? AND reference=?',
                          (pid,row['reference'])).fetchone()
    if not proposal or not proposal['published']:
        raise Problem(404,'Proposal not found.')
    request_digest = digest(kind+'\n'+body)
    prior = db.execute('SELECT ticket,request_digest FROM client_proposal_feedback WHERE proposal=? AND request_id=?',
                       (pid,request_id)).fetchone()
    if prior:
        if prior['request_digest'] != request_digest:
            raise Problem(409,'Feedback was already saved. Refresh to see the request.')
        return prior['ticket']
    if proposal['status'] != 'published' or proposal['expires'] <= now:
        raise Problem(409,'This proposal revision is no longer open for feedback. Refresh to see the current proposal.')
    subject = f'{PROPOSAL_FEEDBACK_LABELS[kind]} · revision {proposal["revision"]}'
    ticket = ticket_change(db,row,identity,{'subject':subject,'body':body},False,proposal_feedback=True)
    db.execute('INSERT INTO client_proposal_feedback VALUES(?,?,?,?,?)',(ticket,pid,kind,request_id,request_digest))
    return ticket


def ticket_change(db,row,identity,data,staff,proposal_feedback=False):
    now=int(time.time());ref=row['reference'];actor=identity['actor'] if staff else identity['email'];tid=data.get('id')
    body=value(data,'body',2500);internal=data.get('internal',False)
    if type(internal)!=bool or internal and not staff:raise Problem(403,'Internal notes are for staff only.')
    from dashboard import USER
    if not tid:
        if staff:raise Problem(400,'Select a customer ticket.')
        if db.execute('SELECT COUNT(*) FROM client_tickets WHERE reference=? AND created>?',(ref,now-3600)).fetchone()[0]>=5:raise Problem(429,'Please wait before creating more tickets.')
        tid=secrets.token_hex(12);priority=data.get('priority','Normal')
        if priority not in ('Normal','Urgent'):raise Problem(400,'Choose a ticket priority.')
        owner=sales_owner(db,ref)
        due=now+(4 if priority=='Urgent' else 48)*3600
        db.execute('INSERT INTO client_tickets(id,reference,subject,priority,owner,created,due) VALUES(?,?,?,?,?,?,?)',(tid,ref,value(data,'subject',160),priority,owner,now,due))
        subject='Bandevi proposal feedback' if proposal_feedback else 'Bandevi support request'
        request_type='proposal feedback' if proposal_feedback else 'a new support request'
        operations.enqueue(db,'ticket-created:'+tid,owner,subject,'Project '+ref+' has '+request_type+'. Review the private team workspace.')
    else:
        ticket=db.execute('SELECT * FROM client_tickets WHERE id=? AND reference=?',(tid,ref)).fetchone()
        if not ticket:raise Problem(404,'Ticket not found.')
        if type(data.get('ticketVersion'))!=int or data['ticketVersion']!=ticket['version']:raise Problem(409,'Ticket changed. Refresh before replying.')
        status=data.get('status','Open') if staff else 'Open';owner=data.get('owner',ticket['owner']) if staff else ticket['owner']
        if db.execute('SELECT 1 FROM client_proposal_feedback WHERE ticket=?',(tid,)).fetchone():owner=sales_owner(db,ref)
        if not staff and not active_owner(db,owner):owner=USER
        if status not in ('Open','In progress','Waiting for client','Closed') or not active_owner(db,owner):raise Problem(400,'Choose a valid ticket status and active owner.')
        due=ticket['due'] if staff else now+(4 if ticket['priority']=='Urgent' else 48)*3600
        first=ticket['first_response'] or (now if staff and not internal else None)
        db.execute('UPDATE client_tickets SET status=?,owner=?,due=?,first_response=?,version=version+1 WHERE id=?',(status,owner,due,first,tid))
        recipient=row['email'] if staff else owner
        if not internal:operations.enqueue(db,'ticket-reply:'+tid+':'+str(ticket['version']+1),recipient,'Bandevi support update','An update is available for project '+ref+'.\n'+('https://bandeviglobalgroup.com/client-workspace/' if staff else 'https://bandeviglobalgroup.com/team-inbox/workspace/'))
    db.execute('INSERT INTO client_ticket_messages(ticket,body,actor,internal,created,sender) VALUES(?,?,?,?,?,?)',
               (tid,body,actor,int(internal),now,'staff' if staff else 'client'));audit(db,ref,'ticket-note' if internal else 'ticket-message',actor,tid)
    return tid

def calendar(db,reference):
    b=db.execute('SELECT b.*,s.starts,s.duration FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id WHERE b.enquiry_id=?',(reference,)).fetchone()
    if not b:return None
    starts=b['starts'];duration=b['duration']
    if starts is None:
        old=db.execute('SELECT starts,duration FROM appointment_events WHERE enquiry_id=? AND starts IS NOT NULL ORDER BY id DESC LIMIT 1',(reference,)).fetchone()
        if not old:return None
        starts,duration=old
    meeting=db.execute('SELECT url FROM demo_meetings WHERE reference=?',(reference,)).fetchone();url=meeting[0] if meeting else ''
    details='Join: '+url if url else 'Joining details will be supplied by the team.'
    return appointment_calendar('demo',reference,starts,duration,b['version'],b['state']=='cancelled',details,url)


def appointment_calendar(kind,reference,starts,duration,version,cancelled,details,url):
    def stamp(n):return datetime.datetime.fromtimestamp(n,datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    def escape(s):return s.replace('\\','\\\\').replace('\n','\\n').replace(';','\\;').replace(',','\\,').replace('\r','')
    lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Bandevi//'+kind.title()+' appointments//EN',
           'METHOD:'+('CANCEL' if cancelled else 'PUBLISH'),'BEGIN:VEVENT',
           'UID:'+kind+'-'+reference+'@bandeviglobalgroup.com','DTSTAMP:'+stamp(int(time.time())),
           'DTSTART:'+stamp(starts),'DTEND:'+stamp(starts+duration*60),'SEQUENCE:'+str(version),
           'STATUS:'+('CANCELLED' if cancelled else 'CONFIRMED'),'SUMMARY:Bandevi '+kind,
           'DESCRIPTION:'+escape('Reference: '+reference+'\n'+details)]
    if url:lines.append('URL:'+escape(url))
    lines+=['END:VEVENT','END:VCALENDAR'];folded=[]
    for line in lines:
        # RFC 5545 fold by UTF-8 octets, preserving complete characters.
        current=''
        for char in line:
            if len((current+char).encode())>73:folded.append(current);current=' '+char
            else:current+=char
        folded.append(current)
    return '\r\n'.join(folded)+'\r\n'

DEMO_REMINDER = re.compile(r'demo-reminder:(BG-[A-F0-9]{16}):s(\d+):(24|1)')
DEMO_SCHEDULE = """SELECT b.enquiry_id,b.token_digest,s.starts,e.payload,a.id AS schedule_event,
    a.created AS booked_at,m.url,confirmation.body AS confirmation FROM demo_bookings b
    JOIN demo_slots s ON s.id=b.slot_id JOIN enquiries e ON e.id=b.enquiry_id
    JOIN appointment_events a ON a.id=(SELECT MAX(id) FROM appointment_events
      WHERE enquiry_id=b.enquiry_id AND event IN ('confirmed','rescheduled')) AND a.slot_id=b.slot_id
    LEFT JOIN demo_meetings m ON m.reference=b.enquiry_id
    LEFT JOIN notification_outbox confirmation ON confirmation.dedupe='booking:'||b.enquiry_id||':0'
    WHERE b.state='confirmed' AND e.email_status!='qa-verified'"""

KICKOFF_REMINDER = re.compile(r'kickoff-reminder:([A-Za-z0-9-]+):s(\d+):(24|1)')
KICKOFF_SCHEDULE = """SELECT k.reference,k.scheduled AS starts,r.id AS schedule_event,r.booked_at,
    project.email,e.payload,COALESCE(s.zone,'') AS booking_zone,COALESCE(m.url,'') AS meeting
    FROM client_kickoff_reminder_schedules r JOIN client_kickoffs k ON k.reference=r.reference
    JOIN client_projects project ON project.reference=k.reference
    JOIN client_accounts account ON account.email=project.email AND account.active=1
    JOIN enquiries e ON e.id=k.reference
    JOIN client_proposals p ON p.id=k.proposal AND p.reference=k.reference AND p.status='accepted'
    LEFT JOIN client_kickoff_slots s ON s.reference=k.reference
    LEFT JOIN client_kickoff_meetings m ON m.reference=k.reference
    WHERE k.confirmed=1 AND k.started=0 AND e.email_status!='qa-verified'"""


def valid_demo_timezone(zone):
    if not isinstance(zone, str) or not re.fullmatch(r'[A-Za-z0-9_+/-]{1,80}', zone):
        return False
    try:
        ZoneInfo(zone)
    except (ZoneInfoNotFoundError, ValueError):
        return False
    return True


def demo_timezone(payload):
    qualification = payload.get('qualification') or {}
    zone = payload.get('demoTimezone') or (qualification.get('contact') or {}).get('timezone')
    if not zone or zone == 'UTC' and 'demoTimezone' not in payload:
        zone = {'US': 'America/New_York', 'GB': 'Europe/London'}.get(qualification.get('country'), 'Asia/Kolkata')
    return ZoneInfo(zone if valid_demo_timezone(zone) else 'Asia/Kolkata')


def reminder_due(booking, hours, now):
    due = booking['starts'] - hours * 3600
    cutoff = booking['starts'] - (3600 if hours == 24 else 0)
    return booking['booked_at'] <= due <= now < cutoff


def reminder_message(db, notification, now=None):
    """Resolve the current schedule and joining link at delivery, including retries."""
    match = DEMO_REMINDER.fullmatch(notification['dedupe'])
    if not match:
        return None
    reference, schedule_event, hours = match.groups()
    booking = db.execute(DEMO_SCHEDULE + ' AND b.enquiry_id=?', (reference,)).fetchone()
    if not booking or booking['schedule_event'] != int(schedule_event) or not reminder_due(booking, int(hours), int(time.time()) if now is None else now):
        return None
    payload = json.loads(booking['payload'])
    if payload.get('email') != notification['recipient']:
        return None
    timezone = demo_timezone(payload)
    when = datetime.datetime.fromtimestamp(booking['starts'], timezone).strftime('%d %B %Y at %H:%M %Z (%z)')
    lines = [f'Your Bandevi demo is scheduled for {when}.', f'Reference: {reference}']
    token = re.search(r'/demo-booking/#([A-Za-z0-9_-]{40,100})(?:\s|$)', booking['confirmation'] or '')
    if token and hmac.compare_digest(hashlib.sha256(token[1].encode()).hexdigest(), booking['token_digest']):
        manage = 'https://bandeviglobalgroup.com/demo-booking/#' + token[1]
        if hours == '24':
            confirmed = db.execute('SELECT 1 FROM demo_rsvps WHERE schedule_event=?',(booking['schedule_event'],)).fetchone()
            lines.append(('RSVP confirmed. View appointment: ' if confirmed else 'RSVP or choose another time: ') + manage)
        elif not booking['url']:
            lines.append('Check joining details: ' + manage)
        else:
            lines.append('Manage or reschedule: ' + manage)
    else:
        lines.append('To reschedule, reply to this email or contact sales@bandeviglobalgroup.com.')
    if booking['url']:
        join = 'Join: ' + booking['url']
        if hours == '1':
            lines.insert(0,join)
        else:
            lines.append(join)
    else:
        lines.append('The team will send joining details separately.')
    return '\n'.join(lines)


def kickoff_reminder_message(db, notification, now=None):
    match=KICKOFF_REMINDER.fullmatch(notification['dedupe'])
    if not match:return None
    reference,schedule_event,hours=match.groups()
    booking=db.execute(KICKOFF_SCHEDULE+' AND k.reference=? AND r.id=?',(reference,int(schedule_event))).fetchone()
    now=int(time.time()) if now is None else now
    if not booking or booking['email']!=notification['recipient'] or not reminder_due(booking,int(hours),now):
        return None
    payload=json.loads(booking['payload'])
    qualification=payload.get('qualification') or {}
    zone=booking['booking_zone'] or payload.get('demoTimezone') or (qualification.get('contact') or {}).get('timezone')
    if not valid_demo_timezone(zone) or (zone=='UTC' and not booking['booking_zone'] and not payload.get('demoTimezone')):
        zone={'US':'America/New_York','GB':'Europe/London'}.get(qualification.get('country'),'Asia/Kolkata')
    timezone=ZoneInfo(zone) if valid_demo_timezone(zone) else operations.INDIA
    when=datetime.datetime.fromtimestamp(booking['starts'],timezone).strftime('%d %B %Y at %H:%M %Z (%z)')
    details=('Your joining link is available in Client Workspace.' if booking['meeting'] else
             'Your joining link is pending. Check Client Workspace before the kickoff.')
    return '\n'.join([f'Your Bandevi kickoff is scheduled for {when}.',f'Reference: {reference}',details,
                      'View or reschedule your kickoff: https://bandeviglobalgroup.com/client-workspace/'])


def reminders(connect, now=None):
    now = int(time.time()) if now is None else now
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        bookings = db.execute(DEMO_SCHEDULE + ' AND s.starts>? AND s.starts<=?', (now, now + 86400)).fetchall()
        for booking in bookings:
            email = json.loads(booking['payload']).get('email')
            if not email:
                continue
            for hours in (24,1):
                if not reminder_due(booking, hours, now):
                    continue
                reference = booking['enquiry_id']
                # Older releases keyed reminders by booking version, which also changed when staff edited the link.
                if db.execute("SELECT 1 FROM notification_outbox WHERE dedupe GLOB ? AND status='sent' AND created>=?",
                              (f'demo-reminder:{reference}:[0-9]*:{hours}', booking['booked_at'])).fetchone():
                    continue
                key = f'demo-reminder:{reference}:s{booking["schedule_event"]}:{hours}'
                subject = 'Join your upcoming Bandevi demo' if hours == 1 else 'Your upcoming Bandevi demo'
                operations.enqueue(db, key, email, subject, '')
        for kickoff in db.execute(KICKOFF_SCHEDULE+' AND k.scheduled>? AND k.scheduled<=?',(now,now+86400)):
            for hours in (24,1):
                if reminder_due(kickoff,hours,now):
                    key=f'kickoff-reminder:{kickoff["reference"]}:s{kickoff["schedule_event"]}:{hours}'
                    operations.enqueue(db,key,kickoff['email'],'Your Bandevi kickoff reminder','')

def handle_get(handler,connect):
    try:return get(handler,connect)
    except Problem as error:handler.respond(error.status,{'error':error.message});return True

def handle_post(handler,connect,origins,salt):
    try:return post(handler,connect,origins,salt)
    except Problem as error:handler.respond(error.status,{'error':error.message});return True

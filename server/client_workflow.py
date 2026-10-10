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
import operations

COOKIE = 'bg_client_session'
ASSETS = Path(__file__).parent / 'client'

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
    CREATE TABLE IF NOT EXISTS client_audit(id INTEGER PRIMARY KEY,reference TEXT NOT NULL,action TEXT NOT NULL,actor TEXT NOT NULL,detail TEXT NOT NULL,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS demo_meetings(reference TEXT PRIMARY KEY,url TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS client_loss_reasons(reference TEXT PRIMARY KEY,reason TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS client_projects_email ON client_projects(email);
    CREATE INDEX IF NOT EXISTS client_tickets_project ON client_tickets(reference);
    ''')

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

def detail(db,row,staff):
    ref=row['reference'];result=dict(row)
    proposals=[]
    for item in db.execute('SELECT * FROM client_proposals WHERE reference=? ORDER BY revision DESC',(ref,)):
        if not staff and item['status']=='draft':continue
        p=dict(item)
        if not staff:p.pop('actor',None)
        proposals.append(p)
    result['proposals']=proposals
    result['milestones']=[dict(r) for r in db.execute('SELECT * FROM client_milestones WHERE reference=? ORDER BY due,id',(ref,))]
    result['documents']=[dict(r) for r in db.execute('SELECT id,name,mime,length(data) size,created FROM client_documents WHERE reference=? AND deleted=0 ORDER BY created DESC',(ref,))]
    result['tickets']=[]
    for ticket in db.execute('SELECT * FROM client_tickets WHERE reference=? ORDER BY created DESC LIMIT 100',(ref,)):
        t=dict(ticket)
        if not staff:t.pop('owner',None)
        t['messages']=[dict(r) for r in db.execute('SELECT body,actor,internal,created FROM client_ticket_messages WHERE ticket=?'+('' if staff else ' AND internal=0')+' ORDER BY id',(t['id'],))]
        if not staff:
            for m in t['messages']:
                m['actor']='You' if m['actor']==row['email'] else 'Bandevi team'
                m.pop('internal',None)
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
        if action=='project':handler.respond(200,detail(db,project(db,query.get('reference',[''])[0],identity,staff),staff));return True
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
            elif action=='create' and staff:
                ref=value(data,'reference',30);enquiry=db.execute('SELECT payload FROM enquiries WHERE id=?',(ref,)).fetchone()
                if not enquiry:raise Problem(404,'Enquiry not found.')
                if identity['role']=='agent' and not db.execute('SELECT 1 FROM enquiry_workflow WHERE id=? AND owner=?',(ref,actor)).fetchone():raise Problem(404,'Enquiry not found.')
                email=json.loads(enquiry[0])['email'].strip().lower()
                if db.execute('SELECT 1 FROM client_projects WHERE reference=?',(ref,)).fetchone():raise Problem(409,'This enquiry already has a project.')
                db.execute('INSERT INTO client_projects(reference,email,title,created) VALUES(?,?,?,?)',(ref,email,value(data,'title',160),int(time.time())))
                audit(db,ref,'project-created',actor);result['reference']=ref
            elif action=='meeting' and staff:
                ref=value(data,'reference',30);b=db.execute('SELECT * FROM demo_bookings WHERE enquiry_id=?',(ref,)).fetchone()
                if not b:raise Problem(404,'Appointment not found.')
                if identity['role']=='agent' and not db.execute('SELECT 1 FROM enquiry_workflow WHERE id=? AND owner=?',(ref,actor)).fetchone():raise Problem(404,'Appointment not found.')
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
        db.execute('INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,created,actor) VALUES(?,?,?,?,?,?,?,?,?,?,?)',(pid,ref,revision,title,scope,terms,minor,currency,expires,now,actor));result['proposalId']=pid
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
    else:raise Problem(404,'Not found.')

def ticket_change(db,row,identity,data,staff):
    now=int(time.time());ref=row['reference'];actor=identity['actor'] if staff else identity['email'];tid=data.get('id')
    body=value(data,'body',2500);internal=data.get('internal',False)
    if type(internal)!=bool or internal and not staff:raise Problem(403,'Internal notes are for staff only.')
    from dashboard import USER
    if not tid:
        if staff:raise Problem(400,'Select a customer ticket.')
        if db.execute('SELECT COUNT(*) FROM client_tickets WHERE reference=? AND created>?',(ref,now-3600)).fetchone()[0]>=5:raise Problem(429,'Please wait before creating more tickets.')
        tid=secrets.token_hex(12);priority=data.get('priority','Normal')
        if priority not in ('Normal','Urgent'):raise Problem(400,'Choose a ticket priority.')
        owner=db.execute('SELECT owner FROM enquiry_workflow WHERE id=?',(ref,)).fetchone();owner=owner[0] if owner and active_owner(db,owner[0]) else USER
        due=now+(4 if priority=='Urgent' else 48)*3600
        db.execute('INSERT INTO client_tickets(id,reference,subject,priority,owner,created,due) VALUES(?,?,?,?,?,?,?)',(tid,ref,value(data,'subject',160),priority,owner,now,due))
        operations.enqueue(db,'ticket-created:'+tid,owner,'Bandevi support request','Project '+ref+' has a new support request. Review the private team workspace.')
    else:
        ticket=db.execute('SELECT * FROM client_tickets WHERE id=? AND reference=?',(tid,ref)).fetchone()
        if not ticket:raise Problem(404,'Ticket not found.')
        if type(data.get('ticketVersion'))!=int or data['ticketVersion']!=ticket['version']:raise Problem(409,'Ticket changed. Refresh before replying.')
        status=data.get('status','Open') if staff else 'Open';owner=data.get('owner',ticket['owner']) if staff else ticket['owner']
        if not staff and not active_owner(db,owner):owner=USER
        if status not in ('Open','In progress','Waiting for client','Closed') or not active_owner(db,owner):raise Problem(400,'Choose a valid ticket status and active owner.')
        due=ticket['due'] if staff else now+(4 if ticket['priority']=='Urgent' else 48)*3600
        first=ticket['first_response'] or (now if staff and not internal else None)
        db.execute('UPDATE client_tickets SET status=?,owner=?,due=?,first_response=?,version=version+1 WHERE id=?',(status,owner,due,first,tid))
        recipient=row['email'] if staff else owner
        if not internal:operations.enqueue(db,'ticket-reply:'+tid+':'+str(ticket['version']+1),recipient,'Bandevi support update','An update is available for project '+ref+'.\n'+('https://bandeviglobalgroup.com/client-workspace/' if staff else 'https://bandeviglobalgroup.com/team-inbox/workspace/'))
    db.execute('INSERT INTO client_ticket_messages(ticket,body,actor,internal,created) VALUES(?,?,?,?,?)',(tid,body,actor,int(internal),now));audit(db,ref,'ticket-note' if internal else 'ticket-message',actor,tid)

def calendar(db,reference):
    b=db.execute('SELECT b.*,s.starts,s.duration FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id WHERE b.enquiry_id=?',(reference,)).fetchone()
    if not b:return None
    starts=b['starts'];duration=b['duration']
    if starts is None:
        old=db.execute('SELECT starts,duration FROM appointment_events WHERE enquiry_id=? AND starts IS NOT NULL ORDER BY id DESC LIMIT 1',(reference,)).fetchone()
        if not old:return None
        starts,duration=old
    def stamp(n):return datetime.datetime.fromtimestamp(n,datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    def escape(s):return s.replace('\\','\\\\').replace('\n','\\n').replace(';','\\;').replace(',','\\,').replace('\r','')
    meeting=db.execute('SELECT url FROM demo_meetings WHERE reference=?',(reference,)).fetchone();url=meeting[0] if meeting else ''
    lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Bandevi//Demo appointments//EN','METHOD:'+('CANCEL' if b['state']=='cancelled' else 'PUBLISH'),'BEGIN:VEVENT','UID:demo-'+reference+'@bandeviglobalgroup.com','DTSTAMP:'+stamp(int(time.time())),'DTSTART:'+stamp(starts),'DTEND:'+stamp(starts+duration*60),'SEQUENCE:'+str(b['version']),'STATUS:'+('CANCELLED' if b['state']=='cancelled' else 'CONFIRMED'),'SUMMARY:Bandevi demo','DESCRIPTION:'+escape('Reference: '+reference+'\n'+('Join: '+url if url else 'Joining details will be supplied by the team.'))]
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

def reminders(connect):
    now=int(time.time())
    with connect() as db:
        for b in db.execute("SELECT b.enquiry_id,b.version,s.starts,e.payload FROM demo_bookings b JOIN demo_slots s ON s.id=b.slot_id JOIN enquiries e ON e.id=b.enquiry_id WHERE b.state='confirmed' AND s.starts>? AND s.starts<=?",(now,now+86400)).fetchall():
            email=json.loads(b['payload'])['email']
            for hours in (24,1):
                if b['starts']<=now+hours*3600 and (hours==1 or b['starts']>now+3600):
                    when=datetime.datetime.fromtimestamp(b['starts'],operations.INDIA).strftime('%d %B %Y at %H:%M IST')
                    meeting=db.execute('SELECT url FROM demo_meetings WHERE reference=?',(b['enquiry_id'],)).fetchone()
                    operations.enqueue(db,'demo-reminder:'+b['enquiry_id']+':'+str(b['version'])+':'+str(hours),email,'Your Bandevi demo reminder','Your demo is scheduled for '+when+'.\nReference: '+b['enquiry_id']+('\nJoin: '+meeting[0] if meeting else '\nThe team supplies joining details separately.'))

def handle_get(handler,connect):
    try:return get(handler,connect)
    except Problem as error:handler.respond(error.status,{'error':error.message});return True

def handle_post(handler,connect,origins,salt):
    try:return post(handler,connect,origins,salt)
    except Problem as error:handler.respond(error.status,{'error':error.message});return True

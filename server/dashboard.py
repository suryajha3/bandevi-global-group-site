"""Authenticated sales workflow; no customer data in static files."""
import datetime
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
import operations
from http.cookies import SimpleCookie, CookieError
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

STAGES = ('New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost')
USER = 'sales@bandeviglobalgroup.com'
COOKIE = 'bg_inbox_session'
ASSETS = Path(__file__).parent / 'dashboard'

def initialize_dashboard(db):
    db.executescript('''
    CREATE TABLE IF NOT EXISTS inbox_sessions (
      digest TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS inbox_logins (fingerprint TEXT, created INTEGER);
    CREATE INDEX IF NOT EXISTS inbox_logins_client ON inbox_logins(fingerprint,created);
    CREATE TABLE IF NOT EXISTS enquiry_workflow (
      id TEXT PRIMARY KEY, stage TEXT NOT NULL DEFAULT 'New', owner TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '', version INTEGER NOT NULL DEFAULT 0, updated INTEGER);
    CREATE TABLE IF NOT EXISTS inbox_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT, enquiry_id TEXT NOT NULL, created INTEGER NOT NULL,
      actor TEXT NOT NULL, previous TEXT NOT NULL, changed TEXT NOT NULL);
    ''')

    db.executescript('''
    CREATE TABLE IF NOT EXISTS lead_activity (
      id TEXT PRIMARY KEY, enquiry_id TEXT NOT NULL, created INTEGER NOT NULL,
      actor TEXT NOT NULL, kind TEXT NOT NULL, body TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS lead_activity_reference ON lead_activity(enquiry_id,created);
    ''')
    operations.initialize(db)
    columns = {row[1] for row in db.execute('PRAGMA table_info(enquiry_workflow)')}
    if 'follow_up_date' not in columns:
        db.execute("ALTER TABLE enquiry_workflow ADD COLUMN follow_up_date TEXT NOT NULL DEFAULT ''")

    if 'next_action' not in columns:
        db.execute("ALTER TABLE enquiry_workflow ADD COLUMN next_action TEXT NOT NULL DEFAULT ''")

def attention_sql():
    return "(COALESCE(w.owner,'')='' OR COALESCE(w.follow_up_date,'')='' OR COALESCE(w.next_action,'')='' OR w.follow_up_date<? OR (COALESCE(w.stage,'New')='New' AND e.created<=?))"

def attention_reasons(entry, today, now):
    if entry['stage'] in ('Won','Lost'): return []
    reasons=[]
    if not entry['owner']: reasons.append('Unassigned')
    if not entry['followUpDate']: reasons.append('No follow-up date')
    elif entry['followUpDate']<today: reasons.append('Overdue')
    if not entry['nextAction']: reasons.append('No next action')
    if entry['stage']=='New' and entry['created']<=now-48*3600: reasons.append('New for 48+ hours')
    return reasons

def lead_access(db, reference, identity):
    return db.execute("SELECT e.*,COALESCE(w.owner,'') AS owner FROM enquiries e LEFT JOIN enquiry_workflow w ON e.id=w.id WHERE e.id=? AND e.email_status!='qa-verified'"+(' AND w.owner=?' if identity['role']=='agent' else ''),[reference]+([identity['actor']] if identity['role']=='agent' else [])).fetchone()

def activity_get(handler, connect, query, identity):
    reference=query.get('reference',[''])[0]
    with connect() as db:
        db.execute('BEGIN')
        row=lead_access(db,reference,identity)
        if not row:
            handler.respond(404,{'error':'Enquiry not available.'});return True
        events=[{'created':row['created'],'actor':'Customer','kind':'received','body':'Enquiry received.'}]
        labels={'stage':'Stage','owner':'Owner','notes':'Workflow notes','followUpDate':'Follow-up date','nextAction':'Next action','deal':'Deal value'}
        for audit in db.execute('SELECT * FROM inbox_audit WHERE enquiry_id=? ORDER BY id DESC LIMIT 100',(reference,)):
            old,changed=json.loads(audit['previous']),json.loads(audit['changed'])
            lines=[labels.get(k,k)+': '+str(old.get(k) or 'Not set')+' → '+str(v or 'Not set') for k,v in changed.items() if v!=old.get(k,'')]
            if lines:events.append({'created':audit['created'],'actor':audit['actor'],'kind':'workflow','body':'\n'.join(lines)})
        events += [dict(r) for r in db.execute('SELECT created,actor,kind,body FROM lead_activity WHERE enquiry_id=? ORDER BY created DESC,id DESC LIMIT 100',(reference,))]
        proposal_labels={'proposal':'Proposal draft created','publish':'Proposal published','withdraw':'Proposal withdrawn','proposal-accepted':'Proposal accepted'}
        for r in db.execute("SELECT created,actor,action FROM client_audit WHERE reference=? AND action IN ('proposal','publish','withdraw','proposal-accepted') ORDER BY id DESC LIMIT 100",(reference,)):
            events.append({'created':r['created'],'actor':r['actor'],'kind':'proposal','body':proposal_labels[r['action']]})
        events.sort(key=lambda e:e['created'],reverse=True)
    handler.respond(200,{'items':events[:100],'limit':100})
    return True

def activity_post(handler, connect, identity, data, now):
    reference,kind,body,key=data.get('reference'),data.get('kind'),data.get('body'),data.get('id')
    if (not isinstance(reference,str) or len(reference)>30 or kind not in ('note','call-connected','call-no-answer','call-voicemail','email-sent') or not isinstance(body,str) or not 1<=len(body.strip())<=2000 or not isinstance(key,str) or not 16<=len(key)<=80):
        handler.respond(400,{'error':'Choose an activity and enter a note (up to 2,000 characters).'});return True
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        if not lead_access(db,reference,identity):
            handler.respond(404,{'error':'Enquiry not available.'});return True
        existing=db.execute('SELECT * FROM lead_activity WHERE id=?',(key,)).fetchone()
        if existing:
            if any(existing[k]!=v for k,v in [('enquiry_id',reference),('actor',identity['actor']),('kind',kind),('body',body.strip())]):
                handler.respond(409,{'error':'Activity identifier already used. Refresh before retrying.'});return True
        else:db.execute('INSERT INTO lead_activity VALUES(?,?,?,?,?,?)',(key,reference,now,identity['actor'],kind,body.strip()))
    handler.respond(200,{'ok':True});return True

def business_today():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30))).date()

def valid_follow_up(value):
    if not isinstance(value, str):
        return False
    if value == '':
        return True
    try:
        parsed = datetime.date.fromisoformat(value)
        return len(value) == 10 and parsed.isoformat() == value and 1900 <= parsed.year <= 2100
    except ValueError:
        return False

def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
    return 'scrypt1:' + salt + ':' + digest

def configured():
    value = os.environ.get('DASHBOARD_PASSWORD_HASH', '')
    return value.startswith('scrypt1:') and len(value.split(':')) == 3

def check_password(password, stored=None):
    stored = stored or os.environ.get('DASHBOARD_PASSWORD_HASH', '')
    try:
        _, salt, _ = stored.split(':')
        return hmac.compare_digest(stored, password_hash(password, salt))
    except (ValueError, TypeError):
        return False

def cookie(value, expires=False):
    security = '' if os.environ.get('ENQUIRY_TEST') == '1' else '; Secure'
    return f'{COOKIE}={value}; Path=/; HttpOnly; SameSite=Strict; Max-Age={0 if expires else 28800}{security}'

def session(handler, connect):
    if not configured():
        return None
    try:
        cookies = SimpleCookie(handler.headers.get('Cookie', ''))
        token = cookies[COOKIE].value
        if len(token) > 128:
            return None
        digest = hashlib.sha256(token.encode()).hexdigest()
        with connect() as db:
            row = db.execute('SELECT * FROM inbox_sessions WHERE digest=? AND expires>?', (digest, int(time.time()))).fetchone()
        if not row:return None
        with connect() as db:
            user=db.execute('SELECT role,active FROM team_users WHERE email=?',(row['actor'],)).fetchone()
        if row['actor']!=USER and (not user or not user['active']):return None
        return {**dict(row), 'role':'admin' if row['actor']==USER else user['role']}
    except (KeyError, ValueError, CookieError):
        return None

def read_json(handler):
    if handler.headers.get('Content-Type','').split(';')[0] != 'application/json':
        raise ValueError('JSON required')
    length = int(handler.headers.get('Content-Length', '0'))
    if not 0 < length <= 8192:
        raise ValueError('Invalid size')
    data = json.loads(handler.rfile.read(length))
    if not isinstance(data, dict):
        raise ValueError('Invalid request')
    return data

def send_asset(handler, name):
    file = ASSETS / name
    data = file.read_bytes()
    handler.send_response(200)
    handler.send_header('Content-Type', {'index.html':'text/html; charset=utf-8','app.js':'application/javascript; charset=utf-8','styles.css':'text/css; charset=utf-8','operations.js':'application/javascript; charset=utf-8'}[name])
    handler.send_header('Cache-Control', 'no-store')
    handler.send_header('X-Robots-Tag', 'noindex, nofollow, noarchive')
    handler.send_header('X-Content-Type-Options', 'nosniff')
    handler.send_header('Referrer-Policy', 'no-referrer')
    handler.send_header('X-Frame-Options', 'DENY')
    handler.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
    handler.send_header('Content-Length', str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)

def handle_get(handler, connect):
    parsed = urlsplit(handler.path)
    route = parsed.path
    assets = {'/team-inbox/':'index.html', '/team-inbox/app.js':'app.js', '/team-inbox/styles.css':'styles.css','/team-inbox/operations.js':'operations.js'}
    if route in assets:
        send_asset(handler, assets[route])
        return True
    authenticated = session(handler, connect)
    if operations.get(handler, connect, authenticated):return True
    if not route.startswith('/api/admin/'):
        return False
    if route == '/api/admin/session':
        handler.respond(200, {'authenticated':bool(authenticated), 'configured':configured(), 'user':authenticated['actor'] if authenticated else None, 'role':authenticated['role'] if authenticated else None, 'csrf':authenticated['csrf'] if authenticated else None})
        return True
    if not authenticated:
        handler.respond(401, {'error':'Sign in to view the inbox.'})
        return True
    if route == '/api/admin/activity':
        return activity_get(handler, connect, parse_qs(parsed.query), authenticated)
    if route == '/api/admin/attribution':
        return attribution_report(handler, connect, parse_qs(parsed.query), authenticated)
    if route != '/api/admin/enquiries':
        handler.respond(404, {'error':'Not found'})
        return True
    query = parse_qs(parsed.query)
    search = query.get('q', [''])[0][:120]
    stage = query.get('stage', [''])[0]
    channel = query.get('channel', [''])[0]
    follow_up = query.get('followup', [''])[0]
    today = business_today()
    if follow_up not in ('', 'overdue', 'today', 'upcoming', 'unscheduled', 'unassigned', 'attention'):
        handler.respond(400, {'error':'Invalid follow-up filter'})
        return True
    try:
        offset = max(0, min(1000000, int(query.get('offset',['0'])[0])))
    except ValueError:
        handler.respond(400, {'error':'Invalid page'})
        return True
    where = "e.email_status!='qa-verified'"
    args = []
    if authenticated['role']=='agent':
        where+=' AND w.owner=?';args.append(authenticated['actor'])
    if channel:
        if channel not in ('organic_search','paid','campaign','referral','direct_unknown','unknown'):
            handler.respond(400, {'error':'Invalid source filter'})
            return True
        where += " AND COALESCE(json_extract(e.payload,'$.attribution.channel'),'unknown')=?"
        args.append(channel)
    if search:
        where += ' AND (e.id LIKE ? OR e.payload LIKE ? OR w.owner LIKE ?)'
        # Bind all search input. '%' is allowed as a search wildcard.
        args += ['%' + search + '%'] * 3
    if stage:
        if stage not in STAGES:
            handler.respond(400, {'error':'Invalid stage'})
            return True
        where += " AND COALESCE(w.stage,'New')=?"
        args.append(stage)
    if follow_up:
        where += " AND COALESCE(w.stage,'New') NOT IN ('Won','Lost')"
        if follow_up == 'overdue':
            where += " AND COALESCE(w.follow_up_date,'')!='' AND w.follow_up_date<?"
            args.append(today.isoformat())
        elif follow_up == 'today':
            where += " AND w.follow_up_date=?"
            args.append(today.isoformat())
        elif follow_up == 'upcoming':
            where += " AND w.follow_up_date>? AND w.follow_up_date<=?"
            args += [today.isoformat(), (today+datetime.timedelta(days=7)).isoformat()]
        elif follow_up == 'unscheduled':
            where += " AND COALESCE(w.follow_up_date,'')=''"
        elif follow_up == 'attention':
            where += ' AND '+attention_sql()
            args += [today.isoformat(),int(time.time())-48*3600]
        else:
            where += " AND COALESCE(w.owner,'')=''"
    join = ' FROM enquiries e LEFT JOIN enquiry_workflow w ON e.id=w.id '
    with connect() as db:
        total = db.execute('SELECT COUNT(*)' + join + 'WHERE ' + where, args).fetchone()[0]
        rows = db.execute("SELECT e.*,COALESCE(w.stage,'New') AS stage,COALESCE(w.owner,'') AS owner,COALESCE(w.notes,'') AS notes,COALESCE(w.version,0) AS version,COALESCE(w.follow_up_date,'') AS follow_up_date,COALESCE(w.next_action,'') AS next_action,w.updated" + join + 'WHERE ' + where + (' ORDER BY '+("CASE WHEN COALESCE(w.follow_up_date,'')!='' AND w.follow_up_date<'"+today.isoformat()+"' THEN 0 ELSE 1 END,e.created ASC," if follow_up=='attention' else '')+'e.created DESC,e.id DESC LIMIT 50 OFFSET ?'), args + [offset]).fetchall()
        access=" AND COALESCE(w.owner,'')=?" if authenticated['role']=='agent' else ''
        access_args=[authenticated['actor']] if access else []
        counts = {r[0]:r[1] for r in db.execute("SELECT COALESCE(w.stage,'New'),COUNT(*)" + join + "WHERE e.email_status!='qa-verified' "+access+" GROUP BY COALESCE(w.stage,'New')",access_args)}
        active = "WHERE e.email_status!='qa-verified' AND COALESCE(w.stage,'New') NOT IN ('Won','Lost')"+access
        followups = {
            'overdue':db.execute("SELECT COUNT(*)"+join+active+" AND COALESCE(w.follow_up_date,'')!='' AND w.follow_up_date<?",access_args+[today.isoformat()]).fetchone()[0],
            'today':db.execute("SELECT COUNT(*)"+join+active+" AND w.follow_up_date=?",access_args+[today.isoformat()]).fetchone()[0],
            'upcoming':db.execute("SELECT COUNT(*)"+join+active+" AND w.follow_up_date>? AND w.follow_up_date<=?",access_args+[today.isoformat(),(today+datetime.timedelta(days=7)).isoformat()]).fetchone()[0],
            'attention':db.execute('SELECT COUNT(*)'+join+active+' AND '+attention_sql(),access_args+[today.isoformat(),int(time.time())-48*3600]).fetchone()[0],
            'unassigned':db.execute("SELECT COUNT(*)"+join+active+" AND COALESCE(w.owner,'')=''",access_args).fetchone()[0]
        }
    entries = [{'reference':r['id'], 'created':r['created'], 'emailStatus':r['email_status'], 'details':json.loads(r['payload']), 'stage':r['stage'], 'followUpDate':r['follow_up_date'], 'nextAction':r['next_action'], 'owner':r['owner'], 'notes':r['notes'], 'version':r['version'], 'updated':r['updated']} for r in rows]
    with connect() as db:
        for entry in entries:
            entry['attentionReasons']=attention_reasons(entry,today.isoformat(),int(time.time()))
            value=db.execute('SELECT minor_units,currency FROM deal_values WHERE enquiry_id=?',(entry['reference'],)).fetchone()
            entry['deal']=dict(value) if value else None
            entry['appointment']=operations.receipt(db,entry['reference'])
    handler.respond(200, {'items':entries, 'total':total, 'counts':{s:counts.get(s,0) for s in STAGES}, 'offset':offset, 'followups':followups, 'businessDate':today.isoformat(), 'businessTimezone':'Asia/Kolkata',
                          'emailConfigured':all(os.environ.get(k) for k in ('SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM'))})
    return True


def attribution_report(handler, connect, query, authenticated):
    try: days=int(query.get('days',['30'])[0])
    except ValueError: days=0
    if days not in (7,30,90):
        handler.respond(400, {'error':'Choose 7, 30 or 90 days.'})
        return True
    channels={c:0 for c in ('organic_search','paid','campaign','referral','direct_unknown','unknown')}
    stages={s:0 for s in STAGES};all_stages={s:0 for s in STAGES};channel_stages={c:{s:0 for s in STAGES} for c in channels};landings={};services={};total=0
    with connect() as db:
        access=" AND w.owner=?" if authenticated['role']=='agent' else ''
        rows=db.execute("SELECT e.payload,COALESCE(w.stage,'New') AS stage FROM enquiries e LEFT JOIN enquiry_workflow w ON e.id=w.id WHERE e.email_status!='qa-verified' AND e.created>=?"+access,[int(time.time())-days*86400]+([authenticated['actor']] if access else []))
        for row in rows:
            data=json.loads(row['payload']);a=data.get('attribution') or {};channel=a.get('channel','unknown')
            if channel not in channels:channel='unknown'
            channels[channel]+=1;total+=1
            all_stages[row['stage']]+=1;channel_stages[channel][row['stage']]+=1
            service=data.get('interest') or 'Not recorded'
            counts=services.setdefault(service,{'service':service,'enquiries':0,'organic':0})
            counts['enquiries']+=1
            if channel=='organic_search':
                stages[row['stage']]+=1;counts['organic']+=1
                landing=a.get('landing_page') or 'Not recorded'
                landings[landing]=landings.get(landing,0)+1
    handler.respond(200, {'days':days,'enquiries':total,'channels':channels,'organicStages':stages,'salesStages':all_stages,'channelStages':channel_stages,
                         'organicLandingPages':[{'page':p,'enquiries':n} for p,n in sorted(landings.items(),key=lambda x:(-x[1],x[0]))[:20]],
                         'services':sorted(services.values(),key=lambda x:(-x['enquiries'],x['service']))[:20]})
    return True

def handle_post(handler, connect, origins, salt):
    route = urlsplit(handler.path).path
    if not route.startswith('/api/admin/'):
        return False
    if handler.headers.get('Origin') not in origins:
        handler.respond(403, {'error':'Please use the dashboard.'})
        return True
    try:
        data = read_json(handler)
    except (ValueError, UnicodeError, TypeError):
        handler.respond(400, {'error':'Invalid request'})
        return True
    now = int(time.time())
    if route == '/api/admin/login':
        if not configured():
            handler.respond(503, {'error':'Dashboard access needs to be set up by the site owner.'})
            return True
        password = data.get('password', '')
        username = data.get('email', '')
        if not isinstance(password, str) or len(password) > 1024 or not isinstance(username, str):
            handler.respond(400, {'error':'Invalid credentials'})
            return True
        fingerprint = hashlib.sha256((salt + handler.headers.get('X-Real-IP', handler.client_address[0])).encode()).hexdigest()
        with connect() as db:
            db.execute('BEGIN IMMEDIATE')
            db.execute('DELETE FROM inbox_logins WHERE created<?', (now-900,))
            db.execute('DELETE FROM inbox_sessions WHERE expires<?', (now,))
            attempts = db.execute('SELECT COUNT(*) FROM inbox_logins WHERE fingerprint=?', (fingerprint,)).fetchone()[0]
            global_attempts = db.execute('SELECT COUNT(*) FROM inbox_logins').fetchone()[0]
            if attempts >= 5 or global_attempts >= 100:
                handler.respond(429, {'error':'Too many sign-in attempts. Try again in 15 minutes.'})
                return True
            db.execute('INSERT INTO inbox_logins VALUES(?,?)', (fingerprint, now))
        username=username.strip().lower()
        with connect() as db:
            user=db.execute('SELECT * FROM team_users WHERE email=? AND active=1',(username,)).fetchone()
        correct=check_password(password, user['password_hash'] if user else None)
        if not correct or (username!=USER and not user):
            handler.respond(401, {'error':'Email or password is incorrect.'})
            return True
        token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        with connect() as db:
            db.execute('INSERT INTO inbox_sessions(digest,csrf,expires,actor) VALUES(?,?,?,?)', (hashlib.sha256(token.encode()).hexdigest(), csrf, now+28800,username))
        handler.respond(200, {'ok':True, 'csrf':csrf, 'user':username,'role':'admin' if username==USER else user['role']}, {'Set-Cookie':cookie(token)})
        return True
    authenticated = session(handler, connect)
    if not authenticated:
        handler.respond(401, {'error':'Your session expired. Please sign in again.'})
        return True
    if not hmac.compare_digest(handler.headers.get('X-CSRF-Token','').encode(), authenticated['csrf'].encode()):
        handler.respond(403, {'error':'Refresh the dashboard and try again.'})
        return True
    if route == '/api/admin/logout':
        with connect() as db:
            db.execute('DELETE FROM inbox_sessions WHERE digest=?', (authenticated['digest'],))
        handler.respond(200, {'ok':True}, {'Set-Cookie':cookie('', True)})
        return True
    if route == '/api/admin/activity':return activity_post(handler,connect,authenticated,data,now)
    if operations.post_admin(handler, connect, authenticated, data):return True
    if route != '/api/admin/update':
        handler.respond(404, {'error':'Not found'})
        return True
    reference, stage = data.get('reference'), data.get('stage')
    owner, notes, version = data.get('owner',''), data.get('notes',''), data.get('version')
    if 'nextAction' in data and (not isinstance(data['nextAction'],str) or len(data['nextAction'])>300):
        handler.respond(400,{'error':'Keep the next action within 300 characters.'});return True
    if 'followUpDate' in data and not valid_follow_up(data['followUpDate']):
        handler.respond(400, {'error':'Use a valid follow-up date or leave it blank.'})
        return True
    if (not isinstance(reference,str) or len(reference)>30 or stage not in STAGES or
        not isinstance(owner,str) or len(owner)>120 or not isinstance(notes,str) or len(notes)>2000 or
        type(version) is not int or version < 0):
        handler.respond(400, {'error':'Check the owner, stage and note lengths.'})
        return True
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        if not db.execute('SELECT id FROM enquiries WHERE id=?', (reference,)).fetchone():
            handler.respond(404, {'error':'Enquiry not found'})
            return True
        previous = db.execute('SELECT * FROM enquiry_workflow WHERE id=?', (reference,)).fetchone()
        if authenticated['role']=='agent' and (not previous or previous['owner']!=authenticated['actor'] or owner.strip()!=authenticated['actor']):
            handler.respond(403,{'error':'You may update only your assigned enquiries.'});return True
        if owner.strip() and owner.strip()!=USER and not db.execute('SELECT 1 FROM team_users WHERE email=? AND active=1',(owner.strip(),)).fetchone():
            if authenticated['actor']!=USER:
                handler.respond(400,{'error':'Choose an active team member.'});return True
        if version != (previous['version'] if previous else 0):
            handler.respond(409, {'error':'This enquiry was updated elsewhere. Refresh before saving.'})
            return True
        previous_deal=db.execute('SELECT minor_units,currency FROM deal_values WHERE enquiry_id=?',(reference,)).fetchone()
        if 'dealValue' in data:
            try:
                minor=operations.money(data['dealValue']);currency=data.get('currency','INR')
                if currency not in ('INR','USD','GBP','EUR','AED'):raise ValueError()
            except ValueError:
                handler.respond(400,{'error':'Enter a valid deal value and currency.'});return True
            db.execute('INSERT INTO deal_values VALUES(?,?,?) ON CONFLICT(enquiry_id) DO UPDATE SET minor_units=excluded.minor_units,currency=excluded.currency',(reference,minor,currency))
        follow_up_date = data.get('followUpDate', previous['follow_up_date'] if previous else '')
        next_action=data.get('nextAction',previous['next_action'] if previous else '').strip()
        changed = {'nextAction':next_action, 'stage':stage, 'owner':owner.strip(), 'notes':notes.strip(), 'followUpDate':follow_up_date}
        db.execute('INSERT INTO enquiry_workflow(id,stage,owner,notes,version,updated,follow_up_date) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET stage=excluded.stage,owner=excluded.owner,notes=excluded.notes,version=excluded.version,updated=excluded.updated,follow_up_date=excluded.follow_up_date', (reference,stage,owner.strip(),notes.strip(),version+1,now,follow_up_date))
        db.execute('UPDATE enquiry_workflow SET next_action=? WHERE id=?',(next_action,reference))
        old = {k:previous[k] for k in ('stage','owner','notes')} if previous else {'stage':'New','owner':'','notes':''}
        old['nextAction']=previous['next_action'] if previous else ''
        old['followUpDate'] = previous['follow_up_date'] if previous else ''
        if 'dealValue' in data:
            old['deal']=dict(previous_deal) if previous_deal else None
            changed['deal']={'minor_units':minor,'currency':currency}
        db.execute('INSERT INTO inbox_audit(enquiry_id,created,actor,previous,changed) VALUES(?,?,?,?,?)', (reference,now,authenticated['actor'],json.dumps(old),json.dumps(changed)))
        if stage!=old['stage']:
            db.execute('INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,?,?,?)',(reference,stage,authenticated['actor'],now))
        if owner.strip()!=old['owner'] and (owner.strip()==USER or db.execute('SELECT 1 FROM team_users WHERE email=? AND active=1',(owner.strip(),)).fetchone()):
            operations.enqueue(db,'assignment:'+reference+':'+str(version+1),owner.strip(),'Bandevi enquiry assigned',f'Reference: {reference}\nReview: https://bandeviglobalgroup.com/team-inbox/')
    handler.respond(200, {'ok':True, 'version':version+1})
    return True

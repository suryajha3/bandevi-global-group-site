"""Authenticated sales workflow; no customer data in static files."""
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
from http.cookies import SimpleCookie, CookieError
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

STAGES = ('New', 'Contacted', 'Proposal', 'Won', 'Lost')
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

def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
    return 'scrypt1:' + salt + ':' + digest

def configured():
    value = os.environ.get('DASHBOARD_PASSWORD_HASH', '')
    return value.startswith('scrypt1:') and len(value.split(':')) == 3

def check_password(password):
    stored = os.environ.get('DASHBOARD_PASSWORD_HASH', '')
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
        return row
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
    handler.send_header('Content-Type', {'index.html':'text/html; charset=utf-8','app.js':'application/javascript; charset=utf-8','styles.css':'text/css; charset=utf-8'}[name])
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
    assets = {'/team-inbox/':'index.html', '/team-inbox/app.js':'app.js', '/team-inbox/styles.css':'styles.css'}
    if route in assets:
        send_asset(handler, assets[route])
        return True
    if not route.startswith('/api/admin/'):
        return False
    authenticated = session(handler, connect)
    if route == '/api/admin/session':
        handler.respond(200, {'authenticated':bool(authenticated), 'configured':configured(), 'user':USER if authenticated else None, 'csrf':authenticated['csrf'] if authenticated else None})
        return True
    if not authenticated:
        handler.respond(401, {'error':'Sign in to view the inbox.'})
        return True
    if route == '/api/admin/attribution':
        return attribution_report(handler, connect, parse_qs(parsed.query))
    if route != '/api/admin/enquiries':
        handler.respond(404, {'error':'Not found'})
        return True
    query = parse_qs(parsed.query)
    search = query.get('q', [''])[0][:120]
    stage = query.get('stage', [''])[0]
    channel = query.get('channel', [''])[0]
    try:
        offset = max(0, min(1000000, int(query.get('offset',['0'])[0])))
    except ValueError:
        handler.respond(400, {'error':'Invalid page'})
        return True
    where = "e.email_status!='qa-verified'"
    args = []
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
    join = ' FROM enquiries e LEFT JOIN enquiry_workflow w ON e.id=w.id '
    with connect() as db:
        total = db.execute('SELECT COUNT(*)' + join + 'WHERE ' + where, args).fetchone()[0]
        rows = db.execute("SELECT e.*,COALESCE(w.stage,'New') AS stage,COALESCE(w.owner,'') AS owner,COALESCE(w.notes,'') AS notes,COALESCE(w.version,0) AS version,w.updated" + join + 'WHERE ' + where + ' ORDER BY e.created DESC,e.id DESC LIMIT 50 OFFSET ?', args + [offset]).fetchall()
        counts = {r[0]:r[1] for r in db.execute("SELECT COALESCE(w.stage,'New'),COUNT(*)" + join + "WHERE e.email_status!='qa-verified' GROUP BY COALESCE(w.stage,'New')")}
    entries = [{'reference':r['id'], 'created':r['created'], 'emailStatus':r['email_status'], 'details':json.loads(r['payload']), 'stage':r['stage'], 'owner':r['owner'], 'notes':r['notes'], 'version':r['version'], 'updated':r['updated']} for r in rows]
    handler.respond(200, {'items':entries, 'total':total, 'counts':{s:counts.get(s,0) for s in STAGES}, 'offset':offset,
                          'emailConfigured':all(os.environ.get(k) for k in ('SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM'))})
    return True


def attribution_report(handler, connect, query):
    try: days=int(query.get('days',['30'])[0])
    except ValueError: days=0
    if days not in (7,30,90):
        handler.respond(400, {'error':'Choose 7, 30 or 90 days.'})
        return True
    channels={c:0 for c in ('organic_search','paid','campaign','referral','direct_unknown','unknown')}
    stages={s:0 for s in STAGES};landings={};services={};total=0
    with connect() as db:
        rows=db.execute("SELECT e.payload,COALESCE(w.stage,'New') AS stage FROM enquiries e LEFT JOIN enquiry_workflow w ON e.id=w.id WHERE e.email_status!='qa-verified' AND e.created>=?",(int(time.time())-days*86400,))
        for row in rows:
            data=json.loads(row['payload']);a=data.get('attribution') or {};channel=a.get('channel','unknown')
            if channel not in channels:channel='unknown'
            channels[channel]+=1;total+=1
            service=data.get('interest') or 'Not recorded'
            counts=services.setdefault(service,{'service':service,'enquiries':0,'organic':0})
            counts['enquiries']+=1
            if channel=='organic_search':
                stages[row['stage']]+=1;counts['organic']+=1
                landing=a.get('landing_page') or 'Not recorded'
                landings[landing]=landings.get(landing,0)+1
    handler.respond(200, {'days':days,'enquiries':total,'channels':channels,'organicStages':stages,
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
        correct = check_password(password)
        if not correct or username.strip().lower() != USER:
            handler.respond(401, {'error':'Email or password is incorrect.'})
            return True
        token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        with connect() as db:
            db.execute('INSERT INTO inbox_sessions VALUES(?,?,?)', (hashlib.sha256(token.encode()).hexdigest(), csrf, now+28800))
        handler.respond(200, {'ok':True, 'csrf':csrf, 'user':USER}, {'Set-Cookie':cookie(token)})
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
    if route != '/api/admin/update':
        handler.respond(404, {'error':'Not found'})
        return True
    reference, stage = data.get('reference'), data.get('stage')
    owner, notes, version = data.get('owner',''), data.get('notes',''), data.get('version')
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
        if version != (previous['version'] if previous else 0):
            handler.respond(409, {'error':'This enquiry was updated elsewhere. Refresh before saving.'})
            return True
        changed = {'stage':stage, 'owner':owner.strip(), 'notes':notes.strip()}
        db.execute('INSERT INTO enquiry_workflow(id,stage,owner,notes,version,updated) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET stage=excluded.stage,owner=excluded.owner,notes=excluded.notes,version=excluded.version,updated=excluded.updated', (reference,stage,owner.strip(),notes.strip(),version+1,now))
        old = {k:previous[k] for k in ('stage','owner','notes')} if previous else {'stage':'New','owner':'','notes':''}
        db.execute('INSERT INTO inbox_audit(enquiry_id,created,actor,previous,changed) VALUES(?,?,?,?,?)', (reference,now,USER,json.dumps(old),json.dumps(changed)))
    handler.respond(200, {'ok':True, 'version':version+1})
    return True

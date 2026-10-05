"""Private, same-origin enquiry inbox. Python standard library only."""
import datetime
import hashlib
import json
import logging
import os
import re
import secrets
import smtplib
import sqlite3
import ssl
import threading
import time
import uuid
from contextlib import contextmanager
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from dashboard import initialize_dashboard, handle_get, handle_post

DB = Path(os.environ.get('ENQUIRY_DB', '/var/lib/bandevi-enquiries/inbox.sqlite3'))
ORIGINS = {'https://bandeviglobalgroup.com', 'https://www.bandeviglobalgroup.com'}
if os.environ.get('ENQUIRY_TEST') == '1':
    ORIGINS.add('http://127.0.0.1:8765')
SALT = os.environ.get('RATE_LIMIT_SALT', secrets.token_hex(32))
FIELDS = {'name': 120, 'email': 254, 'phone': 30, 'interest': 160,
          'message': 3000, 'source': 300, 'campaign': 500}
LOG = logging.getLogger('enquiries')

@contextmanager
def connect():
    db = sqlite3.connect(DB, timeout=10)
    db.row_factory = sqlite3.Row
    try:
        with db:
            yield db
    finally:
        db.close()

def initialize():
    DB.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    with connect() as db:
        db.executescript('''
        CREATE TABLE IF NOT EXISTS enquiries (
          id TEXT PRIMARY KEY, created INTEGER NOT NULL, payload TEXT NOT NULL,
          email_status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER DEFAULT 0,
          next_attempt INTEGER DEFAULT 0, sent_at INTEGER);
        CREATE TABLE IF NOT EXISTS requests (
          fingerprint TEXT NOT NULL, created INTEGER NOT NULL);
        CREATE INDEX IF NOT EXISTS requests_by_client ON requests(fingerprint, created);
        CREATE TABLE IF NOT EXISTS idempotency (
          key TEXT PRIMARY KEY, digest TEXT NOT NULL, enquiry_id TEXT NOT NULL,
          created INTEGER NOT NULL);
        ''')
        initialize_dashboard(db)
    os.chmod(DB, 0o600)

CHANNELS = ('organic_search','paid','campaign','referral','direct_unknown','unknown')
def validate_attribution(value):
    if value is None:
        return {'channel':'unknown','landing_page':'','referrer_domain':'','utm_source':'','utm_medium':'','utm_campaign':''}
    if not isinstance(value, dict) or value.get('channel') not in CHANNELS:
        raise ValueError('Invalid source information.')
    result={'channel':value['channel']}
    for field in ('landing_page','referrer_domain','utm_source','utm_medium','utm_campaign'):
        item=value.get(field,'')
        if not isinstance(item,str): raise ValueError('Invalid source information.')
        pattern=r'/(?:[a-zA-Z0-9_-]+/)*' if field=='landing_page' else r'[a-zA-Z0-9.-]{1,253}' if field=='referrer_domain' else r'[a-zA-Z0-9_-]{1,80}'
        if item and (len(item)>253 or not re.fullmatch(pattern,item)):raise ValueError('Invalid source information.')
        result[field]=item
    return result

def validate(data):
    if not isinstance(data, dict):
        raise ValueError('Invalid enquiry.')
    if data.get('website'):
        raise ValueError('Unable to submit. Please use our contact links.')
    if data.get('type') not in ('contact', 'demo'):
        raise ValueError('Invalid enquiry type.')
    result = {'type': data['type']}
    if 'attribution' in data: result['attribution'] = validate_attribution(data['attribution'])
    for key, limit in FIELDS.items():
        value = data.get(key, '')
        if not isinstance(value, str) or len(value) > limit or any(ord(c) < 32 and c not in '\n\t' for c in value):
            raise ValueError('Please check your enquiry fields and their length.')
        result[key] = value.strip()
    if not all(result[k] for k in ('name', 'email', 'interest', 'message')):
        raise ValueError('Please enter your name, email, service and message.')
    if not re.fullmatch(r"[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+", result['email']):
        raise ValueError('Please enter a valid email address.')
    if '\n' in result['email'] or '\r' in result['email']:
        raise ValueError('Please enter a valid email address.')
    schedule = data.get('demoSchedule')
    if schedule is not None:
        if result['type'] != 'demo' or not isinstance(schedule, dict) or set(schedule) != {'date','time','timezone'}:
            raise ValueError('Invalid demo time.')
        day, clock = schedule.get('date'), schedule.get('time')
        if not isinstance(day,str) or not isinstance(clock,str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}',day) or not re.fullmatch(r'\d{2}:\d{2}',clock) or schedule.get('timezone')!='Asia/Kolkata':
            raise ValueError('Invalid demo time.')
        india=datetime.timezone(datetime.timedelta(hours=5,minutes=30))
        selected=datetime.datetime.fromisoformat(day+'T'+clock).replace(tzinfo=india)
        # Future bounds apply only to new requests, after retry lookup.
        if selected.minute%15:
            raise ValueError('Choose a future demo time within 180 days.')
        result['demoSchedule']={'date':day,'time':clock,'timezone':'Asia/Kolkata'}
    return result

def smtp_ready():
    return all(os.environ.get(k) for k in ('SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'))

def notify(row):
    data = json.loads(row['payload'])
    message = EmailMessage()
    message['From'] = os.environ['SMTP_FROM']
    message['To'] = os.environ.get('SMTP_TO', 'sales@bandeviglobalgroup.com')
    message['Reply-To'] = data['email']
    message['Subject'] = f"Website {data['type']} enquiry — {row['id']}"
    message.set_content('\n'.join([f"Reference: {row['id']}", f"Received (UTC epoch): {row['created']}"] +
                                 [f'{key}: {value}' for key, value in data.items()]))
    host, port = os.environ['SMTP_HOST'], int(os.environ.get('SMTP_PORT', '587'))
    context = ssl.create_default_context()
    if os.environ.get('SMTP_TLS', 'starttls') == 'ssl':
        client = smtplib.SMTP_SSL(host, port, timeout=20, context=context)
    else:
        client = smtplib.SMTP(host, port, timeout=20)
    with client:
        if os.environ.get('SMTP_TLS', 'starttls') != 'ssl':
            client.starttls(context=context)
        client.login(os.environ['SMTP_USER'], os.environ['SMTP_PASSWORD'])
        client.send_message(message)

def notification_worker():
    while True:
        try:
            if smtp_ready():
                with connect() as db:
                    rows = db.execute("SELECT * FROM enquiries WHERE email_status='pending' AND next_attempt<=? LIMIT 10", (int(time.time()),)).fetchall()
                for row in rows:
                    try:
                        notify(row)
                        with connect() as db:
                            db.execute("UPDATE enquiries SET email_status='sent',sent_at=? WHERE id=?", (int(time.time()), row['id']))
                    except Exception:
                        # No addresses, passwords or customer content in service logs.
                        LOG.warning('Notification deferred for reference %s', row['id'])
                        with connect() as db:
                            delay = min(3600, 60 * 2 ** min(row['attempts'], 6))
                            db.execute('UPDATE enquiries SET attempts=attempts+1,next_attempt=? WHERE id=?', (int(time.time()) + delay, row['id']))
            with connect() as db:
                now = int(time.time())
                db.execute('DELETE FROM requests WHERE created<?', (now - 3600,))
                db.execute('DELETE FROM idempotency WHERE created<?', (now - 86400,))
        except Exception:
            LOG.error('Inbox maintenance failed; enquiries remain queued')
        time.sleep(15)

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def respond(self, status, body, headers=None):
        content = json.dumps(body).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Length', str(len(content)))
        self.send_header('X-Robots-Tag', 'noindex, nofollow')
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self):
        try:
            if handle_get(self, connect):
                return
        except sqlite3.Error:
            LOG.error('Dashboard storage unavailable')
            return self.respond(503, {'error':'Inbox temporarily unavailable. Please try again.'})
        self.respond(200 if self.path == '/health' else 404,
                     {'ok': True} if self.path == '/health' else {'error': 'Not found'})

    def do_POST(self):
        try:
            if handle_post(self, connect, ORIGINS, SALT):
                return
        except sqlite3.Error:
            LOG.error('Dashboard storage unavailable')
            return self.respond(503, {'error':'Unable to save right now. Your edits have not been confirmed.'})
        if self.path != '/api/enquiries':
            return self.respond(404, {'error': 'Not found'})
        if self.headers.get('Origin') not in ORIGINS:
            return self.respond(403, {'error': 'Please submit from the website.'})
        if self.headers.get('Content-Type', '').split(';')[0].strip() != 'application/json':
            return self.respond(415, {'error': 'JSON required.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 16384:
                return self.respond(413, {'error': 'Enquiry is too large.'})
            data = validate(json.loads(self.rfile.read(length)))
            key = self.headers.get('Idempotency-Key', '')
            uuid.UUID(key)
        except (ValueError, TypeError, UnicodeError):
            return self.respond(400, {'error': 'Please check the required fields and try again.'})
        payload = json.dumps(data, sort_keys=True)
        digest = hashlib.sha256(payload.encode()).hexdigest()
        # Nginx overwrites this header; the server listens only on loopback.
        ip = self.headers.get('X-Real-IP', self.client_address[0])
        fingerprint = hashlib.sha256((SALT + ip).encode()).hexdigest()
        now = int(time.time())
        try:
            with connect() as db:
                db.execute('BEGIN IMMEDIATE')
                existing = db.execute('SELECT * FROM idempotency WHERE key=?', (key,)).fetchone()
                if existing:
                    if existing['digest'] != digest:
                        return self.respond(409, {'error': 'This request changed. Please submit it again.'})
                    return self.respond(200, {'ok': True, 'reference': existing['enquiry_id']})
                if data.get('demoSchedule'):
                    schedule=data['demoSchedule'];india=datetime.timezone(datetime.timedelta(hours=5,minutes=30))
                    selected=datetime.datetime.fromisoformat(schedule['date']+'T'+schedule['time']).replace(tzinfo=india)
                    today=datetime.datetime.now(india)
                    if selected<=today or selected.date()>today.date()+datetime.timedelta(days=180):
                        return self.respond(400, {'error':'Choose a future demo time within 180 days, or leave both date and time blank.'})
                count = db.execute('SELECT COUNT(*) FROM requests WHERE fingerprint=? AND created>?', (fingerprint, now - 3600)).fetchone()[0]
                if count >= 5:
                    return self.respond(429, {'error': 'Too many enquiries. Please try later or contact us directly.'})
                reference = 'BG-' + uuid.uuid4().hex[:16].upper()
                db.execute('INSERT INTO enquiries(id,created,payload) VALUES(?,?,?)', (reference, now, payload))
                db.execute('INSERT INTO requests VALUES(?,?)', (fingerprint, now))
                db.execute('INSERT INTO idempotency VALUES(?,?,?,?)', (key, digest, reference, now))
            return self.respond(201, {'ok': True, 'reference': reference})
        except sqlite3.Error:
            LOG.error('Enquiry storage unavailable')
            return self.respond(503, {'error': 'Unable to save right now. Please use email or WhatsApp.'})

if __name__ == '__main__':
    os.umask(0o077)
    logging.basicConfig(level=logging.INFO)
    initialize()
    threading.Thread(target=notification_worker, daemon=True).start()
    server = ThreadingHTTPServer(('127.0.0.1', int(os.environ.get('ENQUIRY_PORT', '8766'))), Handler)
    server.daemon_threads = True
    server.serve_forever()

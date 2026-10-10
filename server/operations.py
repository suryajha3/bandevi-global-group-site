"""Bandevi appointments, durable notifications and private operational reports."""
import datetime
import hashlib
import json
import os
import secrets
import time
from decimal import Decimal, InvalidOperation
from urllib.parse import parse_qs, urlsplit

INDIA = datetime.timezone(datetime.timedelta(hours=5, minutes=30))

def initialize(db):
    db.executescript('''
    CREATE TABLE IF NOT EXISTS team_users(email TEXT PRIMARY KEY, name TEXT NOT NULL,
      role TEXT NOT NULL, password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS demo_slots(id TEXT PRIMARY KEY, starts INTEGER NOT NULL UNIQUE,
      duration INTEGER NOT NULL, host TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS demo_bookings(enquiry_id TEXT PRIMARY KEY, slot_id TEXT NOT NULL UNIQUE,
      token_digest TEXT NOT NULL UNIQUE, state TEXT NOT NULL DEFAULT 'confirmed', version INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS notification_outbox(id INTEGER PRIMARY KEY, dedupe TEXT NOT NULL UNIQUE,
      recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
      next_attempt INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL, sent INTEGER);
    CREATE TABLE IF NOT EXISTS sales_events(id INTEGER PRIMARY KEY, enquiry_id TEXT NOT NULL,
      stage TEXT NOT NULL, actor TEXT NOT NULL, created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS appointment_events(id INTEGER PRIMARY KEY, enquiry_id TEXT NOT NULL,
      slot_id TEXT NOT NULL, event TEXT NOT NULL, starts INTEGER, duration INTEGER,
      actor TEXT NOT NULL, created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS deal_values(enquiry_id TEXT PRIMARY KEY, minor_units INTEGER NOT NULL,
      currency TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS recovery_checks(id INTEGER PRIMARY KEY, created INTEGER NOT NULL,
      backup_name TEXT NOT NULL, verified INTEGER NOT NULL);
    ''')
    columns = {r[1] for r in db.execute('PRAGMA table_info(inbox_sessions)')}
    if 'actor' not in columns:
        db.execute("ALTER TABLE inbox_sessions ADD COLUMN actor TEXT NOT NULL DEFAULT 'sales@bandeviglobalgroup.com'")

def enqueue(db, key, recipient, subject, body):
    db.execute('INSERT OR IGNORE INTO notification_outbox(dedupe,recipient,subject,body,created) VALUES(?,?,?,?,?)',
               (key,recipient,subject,body,int(time.time())))

def money(value):
    if not isinstance(value, str) or len(value) > 18:
        raise ValueError('Enter a valid deal value.')
    try:
        amount = Decimal(value)
        if not amount.is_finite() or amount < 0 or amount > 100000000000 or amount.as_tuple().exponent < -2:
            raise ValueError('Enter a nonnegative value with at most two decimal places.')
        return int(amount * 100)
    except InvalidOperation:
        raise ValueError('Enter a valid deal value.')

def create_booking(db, reference, slot_id, token):
    slot = db.execute('SELECT * FROM demo_slots WHERE id=? AND active=1 AND starts>?', (slot_id,int(time.time()))).fetchone()
    if not slot or db.execute("SELECT 1 FROM demo_bookings WHERE slot_id=?", (slot_id,)).fetchone():
        raise ValueError('That demo slot is no longer available. Choose another slot.')
    db.execute('INSERT INTO demo_bookings(enquiry_id,slot_id,token_digest) VALUES(?,?,?)',
               (reference,slot_id,hashlib.sha256(token.encode()).hexdigest()))
    db.execute('INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,?,?,?,?,?,?)',
               (reference,slot_id,'confirmed',slot['starts'],slot['duration'],'customer',int(time.time())))
    data=json.loads(db.execute('SELECT payload FROM enquiries WHERE id=?',(reference,)).fetchone()[0])
    when=datetime.datetime.fromtimestamp(slot['starts'],INDIA).strftime('%d %B %Y at %H:%M IST')
    enqueue(db,'booking:'+reference+':0',data['email'],'Your Bandevi demo is confirmed',
            f'Your demo is confirmed for {when} ({slot["duration"]} minutes).\nReference: {reference}\n'
            'The team will send joining details separately.\nManage your appointment: https://bandeviglobalgroup.com/demo-booking/#'+token)
    return {'confirmed':True,'starts':slot['starts'],'duration':slot['duration'],
            'manageUrl':'/demo-booking/#'+token}

def receipt(db, reference, token=None):
    row=db.execute('SELECT b.*,s.starts,s.duration FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id WHERE enquiry_id=?',(reference,)).fetchone()
    if not row:return None
    result={'confirmed':row['state']=='confirmed','starts':row['starts'],'duration':row['duration']}
    if token:result['manageUrl']='/demo-booking/#'+token
    return result

def get(handler, connect, authenticated):
    parsed=urlsplit(handler.path);route=parsed.path
    if route=='/api/demo/slots':
        now=int(time.time())
        with connect() as db:
            rows=db.execute('SELECT s.id,s.starts,s.duration FROM demo_slots s LEFT JOIN demo_bookings b ON b.slot_id=s.id WHERE s.active=1 AND b.slot_id IS NULL AND s.starts>? AND s.starts<? ORDER BY s.starts LIMIT 100',(now,now+180*86400)).fetchall()
        handler.respond(200,{'timezone':'Asia/Kolkata','slots':[dict(r) for r in rows]});return True
    if route not in ('/api/admin/team','/api/admin/slots','/api/admin/operations','/api/admin/conversion'):
        return False
    if not authenticated:handler.respond(401,{'error':'Sign in to continue.'});return True
    role=authenticated['role'];actor=authenticated['actor']
    if role=='agent' and route in ('/api/admin/team','/api/admin/operations'):
        handler.respond(403,{'error':'Manager access required.'});return True
    with connect() as db:
        if route=='/api/admin/team':
            from dashboard import USER
            rows=[{'email':USER,'name':'Site administrator','role':'admin','active':1}]+[dict(r) for r in db.execute('SELECT email,name,role,active FROM team_users ORDER BY name')]
            result={'users':rows}
        elif route=='/api/admin/slots':
            clause=' AND s.host=?' if role=='agent' else ''
            rows=db.execute('SELECT s.*,b.enquiry_id,b.state,b.version FROM demo_slots s LEFT JOIN demo_bookings b ON b.slot_id=s.id WHERE s.starts>?'+clause+' ORDER BY s.starts LIMIT 200',[int(time.time())-86400]+([actor] if role=='agent' else [])).fetchall()
            result={'slots':[dict(r) for r in rows]}
        elif route=='/api/admin/operations':
            pending=db.execute("SELECT COUNT(*),COALESCE(MAX(attempts),0),MIN(created) FROM notification_outbox WHERE status='pending'").fetchone()
            legacy=db.execute("SELECT COUNT(*),COALESCE(MAX(attempts),0),MIN(created) FROM enquiries WHERE email_status='pending'").fetchone()
            backup=db.execute('SELECT created,verified FROM recovery_checks ORDER BY created DESC LIMIT 1').fetchone()
            result={'smtpConfigured':all(os.environ.get(k) for k in ('SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM')),
                    'pendingNotifications':pending[0]+legacy[0],'maximumAttempts':max(pending[1],legacy[1]),
                    'backup':dict(backup) if backup else None,
                    'alerts':['Notification delivery needs attention.'] if max(pending[1],legacy[1])>=5 else []}
        else:
            try:days=int(parse_qs(parsed.query).get('days',['30'])[0])
            except ValueError:days=0
            if days not in (7,30,90):handler.respond(400,{'error':'Choose 7, 30 or 90 days.'});return True
            where="e.email_status!='qa-verified' AND e.created>=?";args=[int(time.time())-days*86400]
            if role=='agent':where+=' AND w.owner=?';args.append(actor)
            rows=db.execute("SELECT e.id,e.payload,COALESCE(w.stage,'New') stage,v.minor_units,v.currency FROM enquiries e LEFT JOIN enquiry_workflow w ON w.id=e.id LEFT JOIN deal_values v ON v.enquiry_id=e.id WHERE "+where,args).fetchall()
            channels={};revenue={}
            for row in rows:
                channel=(json.loads(row['payload']).get('attribution') or {}).get('channel','unknown')
                c=channels.setdefault(channel,{'enquiries':0,'qualified':0,'proposal':0,'won':0,'lost':0})
                c['enquiries']+=1
                reached={r[0] for r in db.execute('SELECT stage FROM sales_events WHERE enquiry_id=?',(row['id'],))}
                # Historical evidence comes from explicit recorded changes, never inferred stage progression.
                for audit in db.execute('SELECT changed FROM inbox_audit WHERE enquiry_id=?',(row['id'],)):
                    reached.add(json.loads(audit[0]).get('stage'))
                for stage in ('Qualified','Proposal'):
                    if stage in reached:c[stage.lower()]+=1
                if row['stage'] in ('Won','Lost'):c[row['stage'].lower()]+=1
                if row['stage']=='Won' and row['minor_units'] is not None:
                    revenue[row['currency']]=revenue.get(row['currency'],0)+row['minor_units']
            result={'days':days,'channels':channels,'wonValueMinorUnits':revenue,'basis':'Received-date cohort; milestones require recorded stage events; won/lost use current stage. Currencies are kept separate.'}
    handler.respond(200,result);return True

def post_admin(handler, connect, authenticated, data):
    route=urlsplit(handler.path).path
    if route not in ('/api/admin/team','/api/admin/slots','/api/admin/appointment'):
        return False
    from dashboard import USER,password_hash
    if authenticated['role']!='admin' and (route=='/api/admin/team' or authenticated['role']!='manager'):
        handler.respond(403,{'error':'You do not have permission for this action.'});return True
    try:
        with connect() as db:
            db.execute('BEGIN IMMEDIATE')
            if route=='/api/admin/team':
                email=data.get('email','').strip().lower();name=data.get('name','').strip();role=data.get('role');active=data.get('active',True)
                import re
                if not re.fullmatch(r'[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+',email) or len(email)>254 or email==USER or not 1<=len(name)<=120 or role not in ('admin','manager','agent') or type(active)!=bool:
                    raise ValueError('Check the staff email, name and role.')
                old=db.execute('SELECT * FROM team_users WHERE email=?',(email,)).fetchone();password=data.get('password','')
                if password and (not isinstance(password,str) or not 14<=len(password)<=1024):raise ValueError('Use a password of at least 14 characters.')
                if not old and not password:raise ValueError('A password is required for a new staff account.')
                stored=password_hash(password) if password else old['password_hash']
                db.execute('INSERT INTO team_users VALUES(?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,role=excluded.role,password_hash=excluded.password_hash,active=excluded.active',(email,name,role,stored,int(active)))
                db.execute('DELETE FROM inbox_sessions WHERE actor=?',(email,))
                if not active:
                    db.execute('UPDATE demo_slots SET active=0 WHERE host=? AND id NOT IN (SELECT slot_id FROM demo_bookings)',(email,))
                db.execute('INSERT INTO inbox_audit(enquiry_id,created,actor,previous,changed) VALUES(?,?,?,?,?)',('TEAM',int(time.time()),authenticated['actor'],'{}',json.dumps({'email':email,'role':role,'active':active})))
            elif route=='/api/admin/slots':
                if data.get('action')=='close':
                    if db.execute('SELECT 1 FROM demo_bookings WHERE slot_id=?',(data.get('id'),)).fetchone():raise ValueError('Cancel the appointment before closing its slot.')
                    if not db.execute('UPDATE demo_slots SET active=0 WHERE id=?',(data.get('id'),)).rowcount:raise ValueError('Slot not found.')
                else:
                    starts=data.get('starts');duration=data.get('duration',30);host=data.get('host',authenticated['actor'])
                    if type(starts)!=int or not int(time.time())+3600<=starts<=int(time.time())+180*86400 or starts%900 or duration not in (15,30,45,60):raise ValueError('Choose a 15-minute boundary at least one hour ahead, within 180 days.')
                    if host!=USER and not db.execute('SELECT 1 FROM team_users WHERE email=? AND active=1',(host,)).fetchone():raise ValueError('Choose an active team member.')
                    if db.execute('SELECT 1 FROM demo_slots WHERE active=1 AND host=? AND starts<? AND starts+duration*60>?',(host,starts+duration*60,starts)).fetchone():raise ValueError('This host already has an overlapping slot.')
                    db.execute('INSERT INTO demo_slots(id,starts,duration,host) VALUES(?,?,?,?)',(secrets.token_hex(12),starts,duration,host))
            else:
                reference=data.get('reference');version=data.get('version')
                booking=db.execute('SELECT * FROM demo_bookings WHERE enquiry_id=?',(reference,)).fetchone()
                if not booking or booking['version']!=version:handler.respond(409,{'error':'Appointment changed. Refresh before saving.'});return True
                if data.get('action')!='cancel':raise ValueError('Choose cancel.')
                cancel_booking(db,booking,'The team cancelled your demo. Please choose another available time.',authenticated['actor'])
        handler.respond(200,{'ok':True})
    except (ValueError,TypeError,AttributeError):handler.respond(400,{'error':'Check the details. The slot or staff account may already exist or overlap.'})
    except __import__('sqlite3').IntegrityError:handler.respond(409,{'error':'That email or demo slot already exists.'})
    return True

def cancel_booking(db, booking, message, actor='customer'):
    slot=db.execute('SELECT starts,duration FROM demo_slots WHERE id=?',(booking['slot_id'],)).fetchone()
    db.execute('INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,?,?,?,?,?,?)',
               (booking['enquiry_id'],booking['slot_id'],'cancelled',slot['starts'] if slot else None,slot['duration'] if slot else None,actor,int(time.time())))
    # Move the historical slot reference away from the live slot so it is reusable.
    db.execute("UPDATE demo_bookings SET slot_id=?,state='cancelled',version=version+1 WHERE enquiry_id=?",('cancelled:'+booking['enquiry_id']+':'+str(booking['version']),booking['enquiry_id']))
    data=json.loads(db.execute('SELECT payload FROM enquiries WHERE id=?',(booking['enquiry_id'],)).fetchone()[0])
    enqueue(db,'appointment:'+booking['enquiry_id']+':'+str(booking['version']+1),data['email'],'Bandevi demo update',message+'\nReference: '+booking['enquiry_id'])

def post_public(handler, connect, origins):
    if urlsplit(handler.path).path!='/api/demo/manage':return False
    if handler.headers.get('Origin') not in origins:handler.respond(403,{'error':'Use the website to manage your appointment.'});return True
    from dashboard import read_json
    try:
        data=read_json(handler);token=data.get('token','')
        if not isinstance(token,str) or not 40<=len(token)<=100:raise ValueError('Invalid appointment link.')
        with connect() as db:
            db.execute('BEGIN IMMEDIATE')
            booking=db.execute('SELECT * FROM demo_bookings WHERE token_digest=?',(hashlib.sha256(token.encode()).hexdigest(),)).fetchone()
            if not booking:handler.respond(404,{'error':'Appointment link not found.'});return True
            action=data.get('action','view')
            if action not in ('view','cancel','reschedule'):raise ValueError('Invalid action.')
            if action!='view':
                if type(data.get('version'))!=int or data['version']!=booking['version']:handler.respond(409,{'error':'Appointment changed. Reload before trying again.'});return True
                if action=='cancel':
                    if booking['state']=='confirmed':cancel_booking(db,booking,'Your demo has been cancelled.')
                else:
                    slot_id=data.get('slotId');slot=db.execute('SELECT * FROM demo_slots WHERE id=? AND active=1 AND starts>?',(slot_id,int(time.time()))).fetchone()
                    if not slot or db.execute('SELECT 1 FROM demo_bookings WHERE slot_id=?',(slot_id,)).fetchone():handler.respond(409,{'error':'That slot is no longer available.'});return True
                    db.execute("UPDATE demo_bookings SET slot_id=?,state='confirmed',version=version+1 WHERE enquiry_id=?",(slot_id,booking['enquiry_id']))
                    db.execute('INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,?,?,?,?,?,?)',
                               (booking['enquiry_id'],slot_id,'rescheduled',slot['starts'],slot['duration'],'customer',int(time.time())))
                    payload=json.loads(db.execute('SELECT payload FROM enquiries WHERE id=?',(booking['enquiry_id'],)).fetchone()[0])
                    when=datetime.datetime.fromtimestamp(slot['starts'],INDIA).strftime('%d %B %Y %H:%M IST')
                    enqueue(db,'appointment:'+booking['enquiry_id']+':'+str(booking['version']+1),payload['email'],'Bandevi demo rescheduled',f'Your new demo time: {when}.\nManage: https://bandeviglobalgroup.com/demo-booking/#'+token)
            row=db.execute('SELECT b.state,b.version,b.enquiry_id,s.starts,s.duration FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id WHERE token_digest=?',(hashlib.sha256(token.encode()).hexdigest(),)).fetchone()
        handler.respond(200,dict(row))
    except (ValueError,TypeError,UnicodeError):handler.respond(400,{'error':'Check your appointment link and details.'})
    return True

def reminders(connect):
    today=datetime.datetime.now(INDIA).date().isoformat()
    with connect() as db:
        from dashboard import USER
        rows=db.execute("SELECT w.id,w.owner,w.follow_up_date FROM enquiry_workflow w JOIN enquiries e ON e.id=w.id WHERE e.email_status!='qa-verified' AND w.stage NOT IN ('Won','Lost') AND w.follow_up_date!='' AND w.follow_up_date<=?",(today,)).fetchall()
        for row in rows:
            recipient=row['owner'] if row['owner']==USER or db.execute('SELECT 1 FROM team_users WHERE email=? AND active=1',(row['owner'],)).fetchone() else USER
            enqueue(db,'followup:'+row['id']+':'+today+':'+recipient,recipient,'Bandevi follow-up due',
                    f'Reference: {row["id"]}\nFollow-up date: {row["follow_up_date"]}\nReview: https://bandeviglobalgroup.com/team-inbox/')

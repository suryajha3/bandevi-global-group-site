"""Anonymous, same-origin enquiry journeys and private response-time summaries."""
import hashlib
import json
import re
import statistics
import time
import uuid
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

ROOT = Path(__file__).resolve().parent.parent
PAGES = {'/'} | {'/' + str(p.relative_to(ROOT).parent).replace('\\','/') + '/' for p in ROOT.glob('**/index.html') if p.relative_to(ROOT).parts[0] not in ('server','qa-results','demo-booking')}
PAGES |= {'/' + p.name for p in ROOT.glob('*.html')}
EVENTS = ('start','invalid','failed','saved','phone_click','email_click','whatsapp_click','demo_click')
REASONS = ('','required','format','length','other','network','server','rate_limit','conflict')
CHANNELS = ('organic_search','paid','campaign','referral','direct_unknown','unknown')

def initialize(db):
    db.executescript('''
    CREATE TABLE IF NOT EXISTS journey_events(journey TEXT NOT NULL,event TEXT NOT NULL,reason TEXT NOT NULL,
      created INTEGER NOT NULL,page TEXT NOT NULL,form TEXT NOT NULL,channel TEXT NOT NULL,
      PRIMARY KEY(journey,event,reason));
    CREATE INDEX IF NOT EXISTS journey_created ON journey_events(created);
    CREATE TABLE IF NOT EXISTS journey_limits(fingerprint TEXT NOT NULL,created INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS journey_limits_created ON journey_limits(created);
    ''')

def prune(db, now):
    db.execute('DELETE FROM journey_events WHERE created<?',(now-90*86400,))
    db.execute('DELETE FROM journey_limits WHERE created<?',(now-3600,))

def validate(data):
    if not isinstance(data,dict) or set(data)!= {'journey','event','reason','page','form','channel'}:
        raise ValueError('Invalid measurement.')
    if any(not isinstance(v,str) for v in data.values()):raise ValueError('Invalid measurement.')
    identifier=uuid.UUID(data['journey'])
    if identifier.version!=4 or str(identifier)!=data['journey']:raise ValueError('Invalid measurement.')
    if data['event'] not in EVENTS or data['page'] not in PAGES or data['form'] not in ('contact','demo','home','none') or data['channel'] not in CHANNELS or data['reason'] not in REASONS:
        raise ValueError('Invalid measurement.')
    click=data['event'].endswith('_click')
    if click != (data['form']=='none') or (data['event'] not in ('invalid','failed') and data['reason']) or (data['event'] in ('invalid','failed') and not data['reason']):raise ValueError('Invalid measurement.')
    return data

def post(handler,connect,origins,salt):
    if handler.path!='/api/measurement':return False
    if handler.headers.get('Origin') not in origins:handler.respond(403,{'error':'Use the website.'});return True
    if handler.headers.get('DNT')=='1':handler.respond(200,{'ok':True,'ignored':True});return True
    if handler.headers.get('Content-Type','').split(';')[0].strip()!='application/json':handler.respond(415,{'error':'JSON required.'});return True
    try:
        size=int(handler.headers.get('Content-Length','0'))
        if not 0<size<=2048:handler.respond(413,{'error':'Measurement too large.'});return True
        data=validate(json.loads(handler.rfile.read(size)))
    except (ValueError,TypeError,UnicodeError):handler.respond(400,{'error':'Invalid measurement.'});return True
    now=int(time.time());fingerprint=hashlib.sha256((salt+handler.headers.get('X-Real-IP',handler.client_address[0])).encode()).hexdigest()
    with connect() as db:
        db.execute('BEGIN IMMEDIATE');prune(db,now)
        if db.execute('SELECT COUNT(*) FROM journey_limits WHERE fingerprint=?',(fingerprint,)).fetchone()[0]>=120 or db.execute('SELECT COUNT(*) FROM journey_limits').fetchone()[0]>=20000:
            handler.respond(429,{'error':'Measurement limit reached.'});return True
        db.execute('INSERT INTO journey_limits VALUES(?,?)',(fingerprint,now))
        prior=db.execute('SELECT page,form,channel FROM journey_events WHERE journey=? LIMIT 1',(data['journey'],)).fetchone()
        if prior and tuple(prior)!=(data['page'],data['form'],data['channel']):handler.respond(409,{'error':'Measurement context changed.'});return True
        db.execute('INSERT OR IGNORE INTO journey_events VALUES(?,?,?,?,?,?,?)',(data['journey'],data['event'],data['reason'],now,data['page'],data['form'],data['channel']))
    handler.respond(200,{'ok':True});return True

def get(handler,connect,identity):
    parsed=urlsplit(handler.path)
    if parsed.path!='/api/admin/journey-report':return False
    if not identity:handler.respond(401,{'error':'Sign in to view reports.'});return True
    try:days=int(parse_qs(parsed.query).get('days',['30'])[0])
    except ValueError:days=0
    if days not in (7,30,90):handler.respond(400,{'error':'Choose 7, 30 or 90 days.'});return True
    now=int(time.time());since=now-days*86400
    with connect() as db:
        prune(db,now)
        # A recorded first contact is not proof the customer replied or the email was delivered.
        access=' AND w.owner=?' if identity['role']=='agent' else ''
        rows=db.execute("""SELECT e.id,e.created,MIN(c.created) AS first_contact FROM enquiries e
          LEFT JOIN enquiry_workflow w ON w.id=e.id LEFT JOIN (
            SELECT enquiry_id,created FROM lead_activity WHERE kind IN ('call-connected','email-sent')
            UNION ALL SELECT enquiry_id,created FROM sales_events WHERE stage IN ('Contacted','Qualified','Proposal','Won')
          ) c ON c.enquiry_id=e.id AND c.created>=e.created
          WHERE e.email_status!='qa-verified' AND e.created>=?"""+access+' GROUP BY e.id,e.created',[since]+([identity['actor']] if access else [])).fetchall()
        times=[r['first_contact']-r['created'] for r in rows if r['first_contact'] is not None]
        response={'enquiries':len(rows),'recordedContact':len(times),'noRecordedContact':len(rows)-len(times),'within24Hours':sum(t<=86400 for t in times),'medianSeconds':round(statistics.median(times)) if times else None,'averageSeconds':round(statistics.mean(times)) if times else None,'oldestUncontactedSeconds':max((max(0,now-r['created']) for r in rows if r['first_contact'] is None),default=None)}
        pages=[];clicks={e:0 for e in EVENTS if e.endswith('_click')};errors=[]
        if identity['role']!='agent':
            starts=db.execute("SELECT s.page,s.form,s.channel,COUNT(*) AS started,SUM(EXISTS(SELECT 1 FROM journey_events x WHERE x.journey=s.journey AND x.event='saved')) AS saved,SUM(EXISTS(SELECT 1 FROM journey_events x WHERE x.journey=s.journey AND x.event='invalid')) AS validation,SUM(EXISTS(SELECT 1 FROM journey_events x WHERE x.journey=s.journey AND x.event='failed')) AS failed FROM journey_events s WHERE s.event='start' AND s.created>=? GROUP BY s.page,s.form,s.channel ORDER BY started DESC,s.page,s.form,s.channel LIMIT 100",(since,)).fetchall()
            pages=[dict(r,notSaved=r['started']-r['saved']) for r in starts]
            clicks.update({r['event']:r['count'] for r in db.execute("SELECT event,COUNT(*) AS count FROM journey_events WHERE created>=? AND event LIKE '%_click' GROUP BY event",(since,))})
            errors=[dict(r) for r in db.execute("SELECT event,reason,COUNT(*) AS count FROM journey_events WHERE created>=? AND event IN ('invalid','failed') GROUP BY event,reason ORDER BY count DESC",(since,))]
    handler.respond(200,{'days':days,'websiteVisible':identity['role']!='agent','pages':pages,'clicks':clicks,'errors':errors,'response':response,'basis':'Anonymous form journeys started during this period, not unique customers. Not saved means no measured success yet; journeys may still be in progress. Blockers, Do Not Track, offline requests and lost telemetry affect counts. Clicks are not enquiries. Response times use the earliest recorded connected call, staff-reported sent email, or Contacted/Qualified/Proposal/Won stage change; they do not prove email delivery or a customer reply. Agents see assigned-lead response times only.'})
    return True

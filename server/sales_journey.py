"""Private enquiry-to-demo records. No customer access to staff discovery notes."""
import json
import secrets
import time
from urllib.parse import parse_qs, urlsplit
import operations

OUTCOMES=('Not recorded','Completed','No show','Reschedule needed','Not suitable')

def initialize(db):
    db.executescript('''CREATE TABLE IF NOT EXISTS sales_demo_records(
        reference TEXT PRIMARY KEY,requirements TEXT NOT NULL DEFAULT '',outcome TEXT NOT NULL DEFAULT 'Not recorded',
        schedule_event INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 0,updated INTEGER NOT NULL,actor TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS sales_demo_audit(id INTEGER PRIMARY KEY,reference TEXT NOT NULL,
        created INTEGER NOT NULL,actor TEXT NOT NULL,previous TEXT NOT NULL,changed TEXT NOT NULL);''')

def schedule_event(db,ref):
    return db.execute("SELECT COALESCE(MAX(id),0) FROM appointment_events WHERE enquiry_id=? AND event IN ('confirmed','rescheduled')",(ref,)).fetchone()[0]

def record(db,ref):
    row=db.execute('SELECT * FROM sales_demo_records WHERE reference=?',(ref,)).fetchone()
    result=dict(row) if row else {'reference':ref,'requirements':'','outcome':'Not recorded','version':0,'updated':None}
    result['scheduleEvent']=schedule_event(db,ref)
    if row and row['schedule_event']!=result['scheduleEvent']:result['outcome']='Not recorded'
    return result

def get(handler,connect,identity):
    parsed=urlsplit(handler.path)
    if parsed.path not in ('/api/admin/sales-journey','/api/admin/sales-funnel'):return False
    if not identity:handler.respond(401,{'error':'Sign in to continue.'});return True
    from dashboard import lead_access
    query=parse_qs(parsed.query)
    with connect() as db:
        db.execute('BEGIN')
        if parsed.path.endswith('sales-funnel'):
            try:days=int(query.get('days',['30'])[0])
            except ValueError:days=0
            if days not in (7,30,90):handler.respond(400,{'error':'Choose 7, 30 or 90 days.'});return True
            handler.respond(200,funnel(db,identity,days));return True
        ref=query.get('reference',[''])[0]
        enquiry=lead_access(db,ref,identity)
        if not enquiry:handler.respond(404,{'error':'Enquiry not available.'});return True
        now=int(time.time())
        slots=db.execute('SELECT s.id,s.starts,s.duration FROM demo_slots s LEFT JOIN demo_bookings b ON b.slot_id=s.id WHERE s.active=1 AND b.slot_id IS NULL AND s.starts>? AND s.starts<? ORDER BY s.starts LIMIT 100',(now,now+180*86400)).fetchall()
        booking=db.execute('SELECT b.state,b.version,s.starts,s.duration FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id WHERE b.enquiry_id=?',(ref,)).fetchone()
        workflow=db.execute('SELECT stage,owner,next_action,follow_up_date FROM enquiry_workflow WHERE id=?',(ref,)).fetchone()
        handler.respond(200,{'record':record(db,ref),'appointment':dict(booking) if booking else None,'slots':[dict(s) for s in slots],
            'workflow':dict(workflow) if workflow else None,'projectExists':bool(db.execute('SELECT 1 FROM client_projects WHERE reference=?',(ref,)).fetchone())})
    return True

def post(handler,connect,identity,data):
    if urlsplit(handler.path).path!='/api/admin/sales-journey':return False
    from dashboard import lead_access
    ref=data.get('reference');version=data.get('version');action=data.get('action')
    if not isinstance(ref,str) or not 1<=len(ref)<=30 or type(version)!=int or version<0 or action not in ('record','book'):
        handler.respond(400,{'error':'Check the enquiry and action.'});return True
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        enquiry=lead_access(db,ref,identity)
        if not enquiry:handler.respond(404,{'error':'Enquiry not available.'});return True
        old=record(db,ref)
        if old['version']!=version:handler.respond(409,{'error':'The demo record changed. Reload before saving.'});return True
        booking=db.execute('SELECT b.*,s.starts FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id WHERE b.enquiry_id=?',(ref,)).fetchone()
        result={'ok':True,'version':version+1};now=int(time.time())
        if action=='book':
            workflow=db.execute('SELECT stage FROM enquiry_workflow WHERE id=?',(ref,)).fetchone()
            if workflow and workflow['stage'] in ('Won','Lost'):handler.respond(409,{'error':'Reopen this enquiry before booking a demo.'});return True
            if data.get('customerAgreed') is not True:handler.respond(400,{'error':'Confirm the customer has agreed to this demo time.'});return True
            if booking:handler.respond(409,{'error':'An appointment already exists. Use its private appointment link to reschedule, or the Demos view to cancel.'});return True
            slot=data.get('slotId')
            if not isinstance(slot,str) or not 1<=len(slot)<=40:handler.respond(400,{'error':'Choose an available demo slot.'});return True
            try:operations.create_booking(db,ref,slot,secrets.token_urlsafe(32))
            except ValueError as error:handler.respond(409,{'error':str(error)});return True
            changed={'requirements':old['requirements'],'outcome':'Not recorded','schedule_event':schedule_event(db,ref)}
            result['confirmationQueued']=True
        else:
            requirements=data.get('requirements');outcome=data.get('outcome')
            if not isinstance(requirements,str) or len(requirements)>2500 or outcome not in OUTCOMES:
                handler.respond(400,{'error':'Enter requirements up to 2,500 characters and choose an outcome.'});return True
            if outcome!='Not recorded' and (not booking or booking['state']!='confirmed'):
                handler.respond(409,{'error':'A confirmed appointment is required to record a demo outcome.'});return True
            if outcome in ('Completed','No show') and booking['starts']>now:
                handler.respond(400,{'error':'Record attendance after the scheduled demo time.'});return True
            if outcome=='Completed' and not requirements.strip():handler.respond(400,{'error':'Record the requirements discussed during this demo.'});return True
            if type(data.get('scheduleEvent'))!=int or data['scheduleEvent']!=schedule_event(db,ref):
                handler.respond(409,{'error':'The demo schedule changed. Reload before recording its outcome.'});return True
            changed={'requirements':requirements.strip(),'outcome':outcome,'schedule_event':schedule_event(db,ref)}
        db.execute('INSERT INTO sales_demo_records VALUES(?,?,?,?,?,?,?) ON CONFLICT(reference) DO UPDATE SET requirements=excluded.requirements,outcome=excluded.outcome,schedule_event=excluded.schedule_event,version=excluded.version,updated=excluded.updated,actor=excluded.actor',
            (ref,changed['requirements'],changed['outcome'],changed['schedule_event'],version+1,now,identity['actor']))
        db.execute('INSERT INTO sales_demo_audit(reference,created,actor,previous,changed) VALUES(?,?,?,?,?)',(ref,now,identity['actor'],json.dumps(old),json.dumps({'action':action,**changed})))
    handler.respond(200,result);return True

def funnel(db,identity,days):
    now=int(time.time());args=[now-days*86400]
    access=' AND w.owner=?' if identity['role']=='agent' else ''
    if access:args.append(identity['actor'])
    rows=db.execute("SELECT e.id,e.created,e.payload,COALESCE(w.stage,'New') AS stage FROM enquiries e LEFT JOIN enquiry_workflow w ON w.id=e.id WHERE e.email_status!='qa-verified' AND e.created>=?"+access,args).fetchall()
    counts={'enquiries':len(rows),'demoBooked':0,'demoCompleted':0,'publishedProposals':0,'proposalAfterDemo':0,'wonAfterDemoProposal':0,'currentlyWon':0}
    markets={code:{'country':code,'label':label,'counts':{**dict.fromkeys(counts,0),'qualified':0}} for code,label in [('US','United States'),('GB','United Kingdom'),('IN','India'),('other','Another country'),('unknown','Country not recorded')]}
    for row in rows:
        payload=json.loads(row['payload']);qualification=payload.get('qualification')
        country=qualification.get('country') if isinstance(qualification,dict) and qualification.get('version')==1 else None
        market=markets[country if country in ('US','GB','IN','other') else 'unknown']['counts']
        before=dict(counts);market['enquiries']+=1
        ref=row['id'];booking=db.execute("SELECT MIN(created) FROM appointment_events WHERE enquiry_id=? AND event IN ('confirmed','rescheduled')",(ref,)).fetchone()[0]
        published=db.execute('SELECT MIN(published) FROM client_proposals WHERE reference=? AND published>0',(ref,)).fetchone()[0]
        after=db.execute('SELECT MIN(published) FROM client_proposals WHERE reference=? AND published>0 AND published>=?',(ref,booking)).fetchone()[0] if booking is not None else None
        counts['demoBooked']+=booking is not None;counts['demoCompleted']+=record(db,ref)['outcome']=='Completed'
        counts['publishedProposals']+=published is not None;counts['proposalAfterDemo']+=after is not None;counts['currentlyWon']+=row['stage']=='Won'
        counts['wonAfterDemoProposal']+=bool(row['stage']=='Won' and after is not None and db.execute("SELECT 1 FROM sales_events WHERE enquiry_id=? AND stage='Won' AND created>=?",(ref,after)).fetchone())
        for key in counts:
            if key!='enquiries':market[key]+=counts[key]-before[key]
        market['qualified']+=bool(db.execute("SELECT 1 FROM sales_events WHERE enquiry_id=? AND stage='Qualified' AND created>=?",(ref,row['created'])).fetchone())
    def rate(n,d):return round(100*n/d,1) if d else None
    for market in markets.values():
        c=market['counts'];market['rates']={'enquiryToDemo':rate(c['demoBooked'],c['enquiries']),'demoToProposal':rate(c['proposalAfterDemo'],c['demoBooked']),'proposalToWon':rate(c['wonAfterDemoProposal'],c['proposalAfterDemo']),'enquiryToWon':rate(c['currentlyWon'],c['enquiries'])}
    return {'days':days,'counts':counts,'rates':{'enquiryToDemo':rate(counts['demoBooked'],counts['enquiries']),
        'demoToProposal':rate(counts['proposalAfterDemo'],counts['demoBooked']),'proposalToWon':rate(counts['wonAfterDemoProposal'],counts['proposalAfterDemo'])},
        'markets':list(markets.values()),'marketBasis':'Country comes only from saved structured business-country preferences, not phone, currency, nationality or location tracking. Legacy enquiries without these preferences stay Country not recorded. Qualified requires a recorded Qualified event; demo and proposal milestones count once per enquiry. Current Won includes paths outside the demo funnel. Rates use the labelled denominator; empty groups have no rate. QA records are excluded and staff ownership restrictions apply.',
        'basis':'Received-date cohort, one count per enquiry, restricted to your staff access. Demo bookings require recorded reservations; completed demos use the current recorded outcome for the current schedule. Proposal-after-demo requires publication after a reservation. Won-after-proposal requires current Won stage and a recorded Won event after publication. Acceptance and Won remain separate; no currency totals are combined.'}

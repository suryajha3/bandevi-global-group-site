"""Private enquiry-to-demo records. No customer access to staff discovery notes."""
import datetime
import json
import re
import secrets
import statistics
import time
from urllib.parse import parse_qs, urlsplit
import growth_workbench
import journey_measurement
import operations

OUTCOMES=('Not recorded','Completed','No show','Reschedule needed','Not suitable')
NEXT_STEPS={'proposal':'Review a scoped proposal','decision-call':'Meet with the decision-maker',
            'follow-up':'Follow up','other':'Other agreed action'}
CRM_INTERESTS=('CRM & ERP Package','Travel CRM Package','Custom CRM development','CRM & ERP','CRM')
CRM_PROMOTIONS=('hero-demo','lead-ownership','quote-follow-up','operations-handover','availability-slot','availability-request')
PORTFOLIO_PROJECTS = {'trip_sarathi': 'Trip Sarathi', 'maximtrip': 'MaximTrip', 'tripodeal': 'TripOdeal'}

INDUSTRY_LABELS = {
    'travel': 'Travel & Hospitality', 'retail': 'Retail & E-commerce', 'education': 'Education & Training',
    'health': 'Healthcare & Wellness', 'property': 'Real Estate', 'manufacturing': 'Manufacturing & Distribution',
    'services': 'Professional Services', 'media': 'Media & Publishing',
}
INDUSTRY_NEEDS = {'travel': ('crm','portal'), 'retail': ('launch','checkout','orders')}

HOME_SERVICE_LABELS = {
    'website-app': 'Build a website or app',
    'crm-erp': 'Improve sales and operations',
    'travel-platform': 'Build a travel platform',
}

def initialize(db):
    db.executescript('''CREATE TABLE IF NOT EXISTS sales_demo_records(
        reference TEXT PRIMARY KEY,requirements TEXT NOT NULL DEFAULT '',outcome TEXT NOT NULL DEFAULT 'Not recorded',
        schedule_event INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 0,updated INTEGER NOT NULL,actor TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS sales_demo_audit(id INTEGER PRIMARY KEY,reference TEXT NOT NULL,
        created INTEGER NOT NULL,actor TEXT NOT NULL,previous TEXT NOT NULL,changed TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS sales_demo_recaps(reference TEXT NOT NULL,schedule_event INTEGER NOT NULL,
        body TEXT NOT NULL,version INTEGER NOT NULL,updated INTEGER NOT NULL,actor TEXT NOT NULL,
        PRIMARY KEY(reference,schedule_event));
        CREATE TABLE IF NOT EXISTS sales_demo_prep(reference TEXT PRIMARY KEY,
        goal TEXT NOT NULL,tools TEXT NOT NULL,teammate TEXT NOT NULL,version INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS sales_demo_next_steps(reference TEXT NOT NULL,schedule_event INTEGER NOT NULL,
        kind TEXT NOT NULL,due TEXT NOT NULL,note TEXT NOT NULL,version INTEGER NOT NULL,
        updated INTEGER NOT NULL,actor TEXT NOT NULL,PRIMARY KEY(reference,schedule_event));''')


def prep_brief(db, reference):
    row=db.execute('SELECT goal,tools,teammate,version FROM sales_demo_prep WHERE reference=?',(reference,)).fetchone()
    return dict(row) if row else {'goal':'','tools':'','teammate':'','version':0}


def brief_text(value, limit):
    if not isinstance(value,str) or len(value)>limit or any(ord(char)<32 and char not in '\r\n\t' for char in value):
        raise ValueError('Check the text fields and their length.')
    return value.strip()


def save_prep_brief(db, reference, data):
    prior=prep_brief(db,reference)
    if type(data.get('prepVersion')) is not int or data['prepVersion']!=prior['version']:
        return False
    goal=brief_text(data.get('goal',''),400)
    tools=brief_text(data.get('tools',''),200)
    teammate=data.get('teammate','')
    if teammate not in ('','yes','no','unsure'):
        raise ValueError('Choose a valid colleague preference.')
    db.execute('''INSERT INTO sales_demo_prep VALUES(?,?,?,?,?)
        ON CONFLICT(reference) DO UPDATE SET goal=excluded.goal,tools=excluded.tools,
        teammate=excluded.teammate,version=excluded.version''',(reference,goal,tools,teammate,prior['version']+1))
    return True


def next_step(db, reference, event):
    row=db.execute('SELECT kind,due,note,version FROM sales_demo_next_steps WHERE reference=? AND schedule_event=?',
                   (reference,event)).fetchone()
    return dict(row) if row else {'kind':'','due':'','note':'','version':0}


def next_step_text(step):
    if not step['kind']:
        return ''
    due=datetime.date.fromisoformat(step['due']).strftime('%d %B %Y')
    text=f"Agreed next step: {NEXT_STEPS[step['kind']]} by {due}."
    return text+'\n'+step['note'] if step['note'] else text

def schedule_event(db,ref):
    return db.execute("SELECT COALESCE(MAX(id),0) FROM appointment_events WHERE enquiry_id=? AND event IN ('confirmed','rescheduled')",(ref,)).fetchone()[0]

def record(db,ref):
    row=db.execute('SELECT * FROM sales_demo_records WHERE reference=?',(ref,)).fetchone()
    result=dict(row) if row else {'reference':ref,'requirements':'','outcome':'Not recorded','version':0,'updated':None}
    result['scheduleEvent']=schedule_event(db,ref)
    if row and row['schedule_event']!=result['scheduleEvent']:result['outcome']='Not recorded'
    return result


def post_demo(db, reference, record, booking, payload, now):
    """Return staff-only follow-up for the current completed appointment."""
    event = record['scheduleEvent']
    if (not event or record['outcome'] != 'Completed' or not booking or booking['state'] != 'confirmed'
            or booking['starts'] is None or booking['starts'] > now):
        return None
    completed = db.execute("""SELECT MIN(created) FROM sales_demo_audit WHERE reference=?
        AND json_extract(changed,'$.outcome')='Completed' AND json_extract(changed,'$.schedule_event')=?""",
                           (reference,event)).fetchone()[0] or record['updated']
    due = datetime.datetime.fromtimestamp(completed, operations.INDIA) + datetime.timedelta(days=1)
    while due.weekday() >= 5:
        due += datetime.timedelta(days=1)
    recap = db.execute('SELECT body,version FROM sales_demo_recaps WHERE reference=? AND schedule_event=?',
                       (reference,event)).fetchone()
    delivery = db.execute('SELECT status FROM notification_outbox WHERE dedupe=?', (f'demo-recap:{reference}:{event}',)).fetchone()
    qualification = payload.get('qualification') or {}
    currency = qualification.get('currency')
    if currency not in ('USD','GBP','INR','EUR','AED'):
        currency = {'US':'USD','GB':'GBP','IN':'INR'}.get(qualification.get('country'), '')
    return {'completed':completed,'due':int(due.timestamp()),'body':recap['body'] if recap else '',
            'version':recap['version'] if recap else 0,'delivery':delivery['status'] if delivery else '',
            'recipient':payload.get('email',''),'currency':currency}


def recap_current(db, notification):
    _, reference, event = notification['dedupe'].split(':')
    booking = db.execute('SELECT state FROM demo_bookings WHERE enquiry_id=?', (reference,)).fetchone()
    enquiry = db.execute("SELECT payload FROM enquiries WHERE id=? AND email_status!='qa-verified'", (reference,)).fetchone()
    demo = record(db,reference)
    return bool(booking and booking['state']=='confirmed' and enquiry and demo['outcome']=='Completed'
                and str(demo['scheduleEvent'])==event and json.loads(enquiry['payload']).get('email')==notification['recipient'])

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
        slots=operations.available_slots(db,now)
        booking=db.execute("""SELECT b.state,b.version,s.starts,s.duration,
          CASE WHEN b.state='confirmed' AND s.starts>? AND COALESCE(m.url,'')='' THEN 1 ELSE 0 END AS missingJoiningLink
          FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id
          LEFT JOIN demo_meetings m ON m.reference=b.enquiry_id WHERE b.enquiry_id=?""",(now,ref)).fetchone()
        workflow=db.execute('SELECT stage,owner,next_action,follow_up_date FROM enquiry_workflow WHERE id=?',(ref,)).fetchone()
        demo=record(db,ref)
        followup=post_demo(db,ref,demo,booking,json.loads(enquiry['payload']),now)
        step=next_step(db,ref,demo['scheduleEvent']) if followup else None
        handler.respond(200,{'record':demo,'appointment':dict(booking) if booking else None,'slots':[dict(s) for s in slots],
            'prepBrief':prep_brief(db,ref) if booking else None,'postDemo':followup,
            'nextStep':{**step,'preview':next_step_text(step)} if step else None,
            'workflow':dict(workflow) if workflow else None,'projectExists':bool(db.execute('SELECT 1 FROM client_projects WHERE reference=?',(ref,)).fetchone())})
    return True

def post(handler,connect,identity,data):
    if urlsplit(handler.path).path!='/api/admin/sales-journey':return False
    from dashboard import lead_access
    ref=data.get('reference');version=data.get('version');action=data.get('action')
    if not isinstance(ref,str) or not 1<=len(ref)<=30 or type(version)!=int or version<0 or action not in ('record','book','recap-save','recap-send','next-step'):
        handler.respond(400,{'error':'Check the enquiry and action.'});return True
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        enquiry=lead_access(db,ref,identity)
        if not enquiry:handler.respond(404,{'error':'Enquiry not available.'});return True
        old=record(db,ref)
        if old['version']!=version:handler.respond(409,{'error':'The demo record changed. Reload before saving.'});return True
        booking=db.execute('SELECT b.*,s.starts FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id WHERE b.enquiry_id=?',(ref,)).fetchone()
        result={'ok':True,'version':version+1};now=int(time.time())
        if action in ('recap-save','recap-send'):
            return change_recap(handler,db,identity,ref,old,booking,enquiry,data,action,now)
        if action=='next-step':
            return change_next_step(handler,db,identity,ref,old,booking,enquiry,data,now)
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


def change_next_step(handler,db,identity,ref,demo,booking,enquiry,data,now):
    followup=post_demo(db,ref,demo,booking,json.loads(enquiry['payload']),now)
    event=demo['scheduleEvent']
    workflow=db.execute('SELECT stage FROM enquiry_workflow WHERE id=?',(ref,)).fetchone()
    if (not followup or workflow and workflow['stage'] in ('Won','Lost')
            or type(data.get('scheduleEvent')) is not int or data['scheduleEvent']!=event):
        handler.respond(409,{'error':'Reload the current completed demo before saving a next step.'});return True
    step=next_step(db,ref,event)
    if (type(data.get('nextStepVersion')) is not int or data['nextStepVersion']!=step['version']
            or followup['delivery'] in ('pending','sent')):
        handler.respond(409,{'error':'The next step changed or its recap was already queued. Refresh to check its status.'});return True
    kind=data.get('kind')
    try:
        if not isinstance(kind,str) or kind not in NEXT_STEPS:raise ValueError()
        due=datetime.date.fromisoformat(data.get('due',''))
        first=datetime.datetime.fromtimestamp(booking['starts'],operations.INDIA).date()
        today=datetime.datetime.fromtimestamp(now,operations.INDIA).date()
        if due.isoformat()!=data['due'] or not first<=due<=today+datetime.timedelta(days=365):raise ValueError()
        note=brief_text(data.get('note',''),240)
        if kind=='other' and not note:raise ValueError()
    except (ValueError,TypeError):
        handler.respond(400,{'error':'Choose an agreed action and a date from the demo day through one year ahead. Describe any other action.'});return True
    db.execute('''INSERT INTO sales_demo_next_steps VALUES(?,?,?,?,?,?,?,?)
        ON CONFLICT(reference,schedule_event) DO UPDATE SET kind=excluded.kind,due=excluded.due,
        note=excluded.note,version=excluded.version,updated=excluded.updated,actor=excluded.actor''',
        (ref,event,kind,due.isoformat(),note,step['version']+1,now,identity['actor']))
    db.commit()
    handler.respond(200,{'ok':True});return True


def change_recap(handler, db, identity, ref, demo, booking, enquiry, data, action, now):
    workflow = db.execute('SELECT stage FROM enquiry_workflow WHERE id=?', (ref,)).fetchone()
    recap = post_demo(db,ref,demo,booking,json.loads(enquiry['payload']),now)
    event = demo['scheduleEvent']
    if (not recap or workflow and workflow['stage'] in ('Won','Lost')
            or type(data.get('scheduleEvent')) is not int or data['scheduleEvent'] != event
            or type(data.get('recapVersion')) is not int or data['recapVersion'] != recap['version']):
        handler.respond(409,{'error':'The completed demo or recap changed. Reload before continuing.'});return True
    if recap['delivery'] in ('pending','sent'):
        if action=='recap-send':handler.respond(200,{'ok':True,'delivery':recap['delivery']})
        else:handler.respond(409,{'error':'The recap is already queued or sent.'})
        return True
    if action=='recap-save':
        body = data.get('body')
        if not isinstance(body,str) or not 1<=len(body.strip())<=2000 or any(ord(char)<32 and char not in '\r\n\t' for char in body):
            handler.respond(400,{'error':'Enter a recap of up to 2,000 characters.'});return True
        db.execute('''INSERT INTO sales_demo_recaps VALUES(?,?,?,?,?,?) ON CONFLICT(reference,schedule_event)
            DO UPDATE SET body=excluded.body,version=excluded.version,updated=excluded.updated,actor=excluded.actor''',
                   (ref,event,body.strip(),recap['version']+1,now,identity['actor']))
        result={'ok':True,'recapVersion':recap['version']+1}
    else:
        if data.get('reviewed') is not True or not recap['body'] or not recap['recipient']:
            handler.respond(400,{'error':'Save and review the recap and confirm the recorded email before queueing.'});return True
        step=next_step(db,ref,event)
        if step['version'] and (type(data.get('nextStepVersion')) is not int or data['nextStepVersion']!=step['version']):
            handler.respond(409,{'error':'The agreed next step changed. Reload and review the recap before queueing.'});return True
        key = f'demo-recap:{ref}:{event}'
        agreed=next_step_text(step)
        body = recap['body']+('\n\n'+agreed if agreed else '')+'\n\nReference: '+ref+'\nBANDEVI GLOBAL GROUP'
        if recap['delivery']=='cancelled':
            db.execute("UPDATE notification_outbox SET recipient=?,body=?,status='pending',attempts=0,next_attempt=0,created=? WHERE dedupe=?",
                       (recap['recipient'],body,now,key))
        else:
            operations.enqueue(db,key,recap['recipient'],'Your BANDEVI demo recap',body)
        result={'ok':True,'delivery':'pending'}
    db.execute('INSERT INTO sales_demo_audit(reference,created,actor,previous,changed) VALUES(?,?,?,?,?)',
               (ref,now,identity['actor'],'{}',json.dumps({'action':action,'schedule_event':event,'recap_version':recap['version']})))
    db.commit()
    handler.respond(200,result);return True

def proposal_decisions(db, identity, since, now):
    """Report on published revisions, independently of the enquiry received date."""
    args = [now, since, now]
    access = ' AND w.owner=?' if identity['role']=='agent' else ''
    if access:
        args.append(identity['actor'])
    rows = db.execute("""WITH cohort AS (
        SELECT p.id,p.reference,p.published,p.status,p.accepted,e.payload,
          CASE WHEN w.stage='Lost' THEN (SELECT MAX(created) FROM sales_events
            WHERE enquiry_id=p.reference AND stage='Lost' AND created<=?) END AS lost
        FROM client_proposals p JOIN enquiries e ON e.id=p.reference
        LEFT JOIN enquiry_workflow w ON w.id=p.reference
        WHERE p.published>0 AND p.published BETWEEN ? AND ? AND p.status!='draft'
          AND e.email_status!='qa-verified'"""+access+"""
      ) SELECT cohort.*,
        (SELECT COUNT(*) FROM client_proposal_feedback f JOIN client_tickets t ON t.id=f.ticket
         WHERE f.proposal=cohort.id AND f.kind='change' AND t.created BETWEEN cohort.published AND ?) AS changes,
        CASE WHEN id=(SELECT p.id FROM client_proposals p WHERE p.reference=cohort.reference
          AND p.published>0 AND p.published<=cohort.lost AND p.status!='draft'
          ORDER BY p.published DESC,p.revision DESC LIMIT 1) THEN lost END AS recorded_loss
      FROM cohort""", [*args, now])
    markets = {code: {'country':code,'label':growth_workbench.COUNTRIES[code],
                      'published':0,'accepted':0,'lost':0,'changeRequests':0,'revisionsWithChanges':0}
               for code in ('US','GB','IN')}
    durations = {code: [] for code in markets}
    for row in rows:
        code = growth_workbench.country(json.loads(row['payload']))
        if code not in markets:
            continue
        group = markets[code]
        group['published'] += 1
        group['changeRequests'] += row['changes']
        group['revisionsWithChanges'] += row['changes']>0
        accepted = row['status']=='accepted' and row['accepted'] is not None and row['published']<=row['accepted']<=now
        if accepted:
            group['accepted'] += 1
            durations[code].append(row['accepted']-row['published'])
        elif row['recorded_loss'] is not None:
            group['lost'] += 1
            durations[code].append(row['recorded_loss']-row['published'])
    for code, group in markets.items():
        group['decided'] = len(durations[code])
        group['withoutDecision'] = group['published']-group['decided']
        group['medianDecisionSeconds'] = round(statistics.median(durations[code])) if durations[code] else None
        group['acceptanceRate'] = round(100*group['accepted']/group['published'],1) if group['published'] else None
    return list(markets.values())


def sample_demo_funnel(db, identity, since, now):
    if identity['role']=='agent':
        return None
    groups = {code: {'country':code,'label':growth_workbench.COUNTRIES[code],
                     'completions':0,'bookings':0,'attended':0}
              for code in (*journey_measurement.SAMPLE_MARKETS, 'unknown')}
    rows = db.execute("""SELECT j.market, COUNT(*) AS completions,
        SUM(EXISTS(SELECT 1 FROM appointment_events a WHERE a.enquiry_id=e.id
            AND a.event IN ('confirmed','rescheduled') AND a.created BETWEEN j.created AND ?)) AS bookings,
        SUM(CASE WHEN d.outcome='Completed' AND b.state='confirmed' AND slot.starts<=?
            AND d.updated<=? AND d.schedule_event>0
            AND d.schedule_event=(SELECT MAX(a.id) FROM appointment_events a
                WHERE a.enquiry_id=e.id AND a.event IN ('confirmed','rescheduled')
                  AND a.created BETWEEN j.created AND ?)
            THEN 1 ELSE 0 END) AS attended
        FROM sample_demo_journeys j LEFT JOIN enquiries e ON e.id=j.reference
        LEFT JOIN demo_bookings b ON b.enquiry_id=e.id LEFT JOIN demo_slots slot ON slot.id=b.slot_id
        LEFT JOIN sales_demo_records d ON d.reference=e.id
        WHERE j.created BETWEEN ? AND ? AND (j.reference IS NULL OR e.email_status!='qa-verified')
        GROUP BY j.market""", (now,now,now,now,since,now))
    for row in rows:
        group = groups[row['market']]
        group.update(completions=row['completions'],bookings=row['bookings'],attended=row['attended'])
    return list(groups.values())


def proposal_review_conversion(db, identity, since, now):
    markets={code:{'country':code,'label':growth_workbench.COUNTRIES[code],
                   'booked':0,'attended':0,'accepted':0,'won':0}
             for code in ('US','GB','IN')}
    won={code:set() for code in markets}
    access=' AND w.owner=?' if identity['role']=='agent' else ''
    args=[now,now,since,now]+([identity['actor']] if access else [])
    rows=db.execute("""WITH first_reviews AS (
        SELECT proposal, MIN(created) AS booked,
          MAX(CASE WHEN state='attended' AND outcome_at<=? THEN 1 ELSE 0 END) AS attended
        FROM client_proposal_reviews GROUP BY proposal)
        SELECT e.id,e.payload,f.booked,f.attended,p.accepted,p.status,
          CASE WHEN w.stage='Won' THEN EXISTS(SELECT 1 FROM sales_events se
            WHERE se.enquiry_id=e.id AND se.stage='Won' AND se.created BETWEEN p.accepted AND ?) ELSE 0 END AS won
        FROM first_reviews f JOIN client_proposals p ON p.id=f.proposal
        JOIN enquiries e ON e.id=p.reference LEFT JOIN enquiry_workflow w ON w.id=e.id
        WHERE f.booked BETWEEN ? AND ? AND e.email_status!='qa-verified'"""+access,args)
    for row in rows:
        code=growth_workbench.country(json.loads(row['payload']))
        if code not in markets:continue
        group=markets[code]
        group['booked']+=1
        group['attended']+=row['attended']
        if row['status']=='accepted' and row['accepted'] is not None and row['booked']<=row['accepted']<=now:
            group['accepted']+=1
            if row['won']:won[code].add(row['id'])
    for code,group in markets.items():group['won']=len(won[code])
    return list(markets.values())


def crm_demo_conversion(db, identity, since, now):
    markets={code:{'country':code,'label':growth_workbench.COUNTRIES[code],
                   'attended':0,'nextSteps':0,'proposals':0,'won':0}
             for code in ('US','GB','IN')}
    access=' AND w.owner=?' if identity['role']=='agent' else ''
    args=[now,now,now,since,now,now]+([identity['actor']] if access else [])
    rows=db.execute("""SELECT e.payload,
        EXISTS(SELECT 1 FROM sales_demo_next_steps n WHERE n.reference=e.id
          AND n.schedule_event=r.schedule_event AND n.updated<=?) AS next_step,
        EXISTS(SELECT 1 FROM client_proposals p WHERE p.reference=e.id
          AND p.published>0 AND p.status!='draft' AND p.published BETWEEN s.starts AND ?) AS proposed,
        CASE WHEN w.stage='Won' THEN EXISTS(SELECT 1 FROM sales_events v WHERE v.enquiry_id=e.id
          AND v.stage='Won' AND v.created BETWEEN s.starts AND ?) ELSE 0 END AS won
        FROM sales_demo_records r JOIN enquiries e ON e.id=r.reference
        JOIN demo_bookings b ON b.enquiry_id=e.id JOIN demo_slots s ON s.id=b.slot_id
        LEFT JOIN enquiry_workflow w ON w.id=e.id
        WHERE r.outcome='Completed' AND r.schedule_event>0 AND b.state='confirmed'
          AND s.starts BETWEEN ? AND ? AND r.updated<=? AND e.email_status!='qa-verified'
          AND r.schedule_event=(SELECT MAX(a.id) FROM appointment_events a WHERE a.enquiry_id=e.id
            AND a.event IN ('confirmed','rescheduled'))"""+access,args)
    for row in rows:
        payload=json.loads(row['payload'])
        country=growth_workbench.country(payload)
        if country not in markets or payload.get('interest') not in CRM_INTERESTS:
            continue
        market=markets[country]
        market['attended']+=1
        market['nextSteps']+=row['next_step']
        market['proposals']+=row['proposed']
        market['won']+=row['won']
    for market in markets.values():
        market['conversionRate']=round(100*market['won']/market['attended'],1) if market['attended'] else None
    return list(markets.values())


def funnel(db,identity,days):
    now=int(time.time());args=[now-days*86400]
    access=' AND w.owner=?' if identity['role']=='agent' else ''
    if access:args.append(identity['actor'])
    rows=db.execute("SELECT e.id,e.created,e.payload,COALESCE(w.stage,'New') AS stage FROM enquiries e LEFT JOIN enquiry_workflow w ON w.id=e.id WHERE e.email_status!='qa-verified' AND e.created>=?"+access,args).fetchall()
    counts={'enquiries':len(rows),'demoBooked':0,'demoCompleted':0,'publishedProposals':0,'proposalAfterDemo':0,'wonAfterDemoProposal':0,'currentlyWon':0}
    markets={code:{'country':code,'label':label,'counts':{**dict.fromkeys(counts,0),'qualified':0,'demoCancelled':0,'demoNoShow':0}}
             for code,label in [('US','United States'),('GB','United Kingdom'),('IN','India'),('other','Another country'),('unknown','Country not recorded')]}
    campaigns={}
    portfolio={}
    industries={}
    home_services={}
    for row in rows:
        payload=json.loads(row['payload']);qualification=payload.get('qualification')
        country=qualification.get('country') if isinstance(qualification,dict) and qualification.get('version')==1 else None
        country=country if country in ('US','GB','IN','other') else 'unknown'
        market=markets[country]['counts']
        before=dict(counts);market['enquiries']+=1
        ref=row['id'];booking=db.execute("SELECT MIN(created) FROM appointment_events WHERE enquiry_id=? AND event IN ('confirmed','rescheduled')",(ref,)).fetchone()[0]
        published=db.execute('SELECT MIN(published) FROM client_proposals WHERE reference=? AND published>0',(ref,)).fetchone()[0]
        after=db.execute('SELECT MIN(published) FROM client_proposals WHERE reference=? AND published>0 AND published>=?',(ref,booking)).fetchone()[0] if booking is not None else None
        outcome = record(db,ref)['outcome']
        current_booking = db.execute('SELECT state FROM demo_bookings WHERE enquiry_id=?', (ref,)).fetchone() if booking is not None else None
        cancelled = bool(current_booking and current_booking['state']=='cancelled')
        counts['demoBooked']+=booking is not None;counts['demoCompleted']+=outcome=='Completed' and not cancelled
        market['demoCancelled']+=cancelled
        market['demoNoShow']+=outcome=='No show' and not cancelled
        counts['publishedProposals']+=published is not None;counts['proposalAfterDemo']+=after is not None;counts['currentlyWon']+=row['stage']=='Won'
        counts['wonAfterDemoProposal']+=bool(row['stage']=='Won' and after is not None and db.execute("SELECT 1 FROM sales_events WHERE enquiry_id=? AND stage='Won' AND created>=?",(ref,after)).fetchone())
        for key in counts:
            if key!='enquiries':market[key]+=counts[key]-before[key]
        qualified=bool(db.execute("SELECT 1 FROM sales_events WHERE enquiry_id=? AND stage='Qualified' AND created>=?",(ref,row['created'])).fetchone())
        market['qualified']+=qualified
        brief = payload.get('projectBrief')
        project = brief.get('portfolioProject') if isinstance(brief, dict) else None
        if isinstance(project, str) and project in PORTFOLIO_PROJECTS:
            project_group = portfolio.setdefault((project, country), {
                'project': project, 'projectLabel': PORTFOLIO_PROJECTS[project],
                'country': country, 'countryLabel': markets[country]['label'],
                'enquiries': 0, 'qualified': 0, 'demoCompleted': 0,
            })
            project_group['enquiries'] += 1
            project_group['qualified'] += qualified
            project_group['demoCompleted'] += counts['demoCompleted'] - before['demoCompleted']
        attribution=payload.get('attribution')
        attribution=attribution if isinstance(attribution,dict) else {}
        industry=attribution.get('industry')
        if isinstance(industry,str) and industry in INDUSTRY_LABELS:
            industry_group=industries.setdefault((industry,country),{
                'industry':industry,'industryLabel':INDUSTRY_LABELS[industry],
                'country':country,'countryLabel':markets[country]['label'],
                'enquiries':0,'qualified':0,'demoCompleted':0,
            })
            industry_group['enquiries']+=1
            industry_group['qualified']+=qualified
            industry_group['demoCompleted']+=counts['demoCompleted']-before['demoCompleted']
        home_service=attribution.get('home_service')
        if isinstance(home_service,str) and home_service in HOME_SERVICE_LABELS:
            home_group=home_services.setdefault((home_service,country),{
                'service':home_service,'serviceLabel':HOME_SERVICE_LABELS[home_service],
                'country':country,'countryLabel':markets[country]['label'],
                'enquiries':0,'qualified':0,'demoCompleted':0,
            })
            home_group['enquiries']+=1
            home_group['qualified']+=qualified
            home_group['demoCompleted']+=counts['demoCompleted']-before['demoCompleted']
        def tag(key):
            value=attribution.get(key,'')
            return value if isinstance(value,str) and re.fullmatch(r'[a-zA-Z0-9_-]{1,80}',value) else ''
        channel=attribution.get('channel')
        channel=channel if channel in ('organic_search','paid','campaign','referral','direct_unknown','unknown') else 'unknown'
        landing=attribution.get('landing_page','')
        landing=landing if isinstance(landing,str) and re.fullmatch(r'/(?:[a-zA-Z0-9_-]+/)*',landing) else ''
        promotion=attribution.get('crm_promotion')
        promotion=promotion if promotion in CRM_PROMOTIONS else ''
        key=(country,tag('utm_campaign'),tag('utm_source'),tag('utm_medium'),channel,landing,promotion)
        group=campaigns.setdefault(key,{'country':country,'label':markets[country]['label'],'campaign':key[1],
            'source':key[2],'medium':key[3],'channel':channel,'landingPage':landing,'promotion':promotion,
            'counts':{**dict.fromkeys(counts,0),'qualified':0,'crmReviewRequests':0},'wonValueByCurrency':{},'wonWithoutValue':0})
        group['counts']['enquiries']+=1
        for name in counts:
            if name!='enquiries':group['counts'][name]+=counts[name]-before[name]
        group['counts']['qualified']+=qualified
        review=payload.get('crmReview')
        group['counts']['crmReviewRequests']+=isinstance(review,dict) and review.get('version')==1
        if row['stage']=='Won':
            deal=db.execute('SELECT currency,minor_units FROM deal_values WHERE enquiry_id=?',(ref,)).fetchone()
            if deal and deal['currency'] in ('INR','USD','GBP','EUR','AED') and type(deal['minor_units']) is int and deal['minor_units']>=0:
                values=group['wonValueByCurrency'].setdefault(deal['currency'],{'currency':deal['currency'],'minorUnits':0,'deals':0})
                values['minorUnits']+=deal['minor_units'];values['deals']+=1
            else:group['wonWithoutValue']+=1
    def rate(n,d):return round(100*n/d,1) if d else None
    for market in markets.values():
        c=market['counts'];market['rates']={'enquiryToDemo':rate(c['demoBooked'],c['enquiries']),'demoToProposal':rate(c['proposalAfterDemo'],c['demoBooked']),'proposalToWon':rate(c['wonAfterDemoProposal'],c['proposalAfterDemo']),'enquiryToWon':rate(c['currentlyWon'],c['enquiries'])}
    for group in campaigns.values():
        c=group['counts'];group['rates']={'enquiryToQualified':rate(c['qualified'],c['enquiries']),
            'enquiryToCompletedDemo':rate(c['demoCompleted'],c['enquiries']),'enquiryToWon':rate(c['currentlyWon'],c['enquiries'])}
        group['wonValueByCurrency']=[value for _,value in sorted(group['wonValueByCurrency'].items())]
    return {'days':days,'counts':counts,'rates':{'enquiryToDemo':rate(counts['demoBooked'],counts['enquiries']),
        'demoToProposal':rate(counts['proposalAfterDemo'],counts['demoBooked']),'proposalToWon':rate(counts['wonAfterDemoProposal'],counts['proposalAfterDemo'])},
        'markets':list(markets.values()),'campaigns':sorted(campaigns.values(),key=lambda g:(-g['counts']['enquiries'],g['country'],g['campaign'],g['source'],g['medium'],g['channel'],g['landingPage'],g['promotion'])),
        'portfolio':sorted(portfolio.values(), key=lambda group: (group['projectLabel'], group['countryLabel'])),
        'industries':sorted(industries.values(), key=lambda group: (group['industryLabel'], group['countryLabel'])),
        'homeServices':sorted(home_services.values(), key=lambda group: (group['serviceLabel'], group['countryLabel'])),
        'sampleDemoFunnel':sample_demo_funnel(db,identity,args[0],now),
        'crmDemoConversion':crm_demo_conversion(db,identity,args[0],now),
        'proposalReviewConversion':proposal_review_conversion(db,identity,args[0],now),
        'proposalDecisions':proposal_decisions(db,identity,args[0],now),
        'proposalDecisionBasis':'Published-date cohort. Each published revision counts once, including later revisions, expired and withdrawn proposals. Acceptance rate is accepted revisions divided by published revisions. Time to decision is median elapsed time from publication to recorded acceptance or staff-recorded Lost. A loss is attributed to the most recent revision published by that event, only while the enquiry is currently Lost and the revision has no recorded acceptance. Change requests are counted against their original revision. Missing decisions are excluded from the median. Uses saved business country and staff access, with QA records excluded.',
        'campaignBasis':'Received-date cohort, 7/30/90 days; sales milestones are evaluated through now. Each enquiry belongs to one saved business-country / campaign / source / medium / channel / landing-page / CRM promotion group. Blank campaign tags remain Unattributed, including direct and organic enquiries; country is never inferred from a campaign name. Review requests are not automatically Qualified. Reached Qualified requires an event; booked and completed demos are distinct; published proposals count once per enquiry. Currently Won is a staff sales outcome, not payment confirmation. Recorded won deal values use saved deal_values, never budgets or proposal amounts, and stay separate by currency with no FX conversion. Won without a recorded value is shown separately. Advertising spend is not combined with this rolling cohort. CPA and ROAS are not calculated here; completed-day manual cost comparisons appear separately. QA records and enquiries outside your staff access are excluded.',
        'marketBasis':'Country comes only from saved structured business-country preferences, not phone, currency, nationality or location tracking. Legacy enquiries without these preferences stay Country not recorded. Qualified requires a recorded Qualified event. Booked counts each enquiry once, including later cancellations. Cancelled counts current cancellations. Completed and no-show use the recorded outcome for the current schedule and exclude cancellations. Current Won includes paths outside the demo funnel. Rates use the labelled denominator; empty groups have no rate. QA records are excluded and staff ownership restrictions apply.',
        'basis':'Received-date cohort, one count per enquiry, restricted to your staff access. Demo bookings require recorded reservations; completed demos use the current recorded outcome for the current schedule. Proposal-after-demo requires publication after a reservation. Won-after-proposal requires current Won stage and a recorded Won event after publication. Acceptance and Won remain separate; no currency totals are combined.'}

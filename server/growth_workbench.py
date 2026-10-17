"""Private review operations and manually recorded, auditable advertising costs."""
import datetime as dt
import hashlib
import json
import re
import secrets
import time
import uuid
from decimal import Decimal, ROUND_HALF_UP
from urllib.parse import parse_qs, urlsplit
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

COUNTRIES={'US':'United States','GB':'United Kingdom','IN':'India','other':'Another country','unknown':'Country not recorded'}
STATUSES=('Requested','In review','Reviewed')
BUCKETS=('open','attention','overdue','unassigned','reviewed','all')


def initialize(db):
    db.executescript('''
    CREATE TABLE IF NOT EXISTS crm_review_work(reference TEXT PRIMARY KEY,status TEXT NOT NULL,
      summary TEXT NOT NULL,version INTEGER NOT NULL,updated INTEGER NOT NULL,actor TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS crm_review_audit(id INTEGER PRIMARY KEY,reference TEXT NOT NULL,
      actor TEXT NOT NULL,created INTEGER NOT NULL,previous TEXT NOT NULL,changed TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS campaign_cost_profiles(id TEXT PRIMARY KEY,country TEXT NOT NULL,
      campaign TEXT NOT NULL,source TEXT NOT NULL,medium TEXT NOT NULL,currency TEXT NOT NULL,
      timezone TEXT NOT NULL,account_label TEXT NOT NULL,created INTEGER NOT NULL,actor TEXT NOT NULL,
      UNIQUE(country,campaign,source,medium));
    CREATE TABLE IF NOT EXISTS campaign_daily_costs(profile_id TEXT NOT NULL,day TEXT NOT NULL,
      minor_units INTEGER NOT NULL,version INTEGER NOT NULL,updated INTEGER NOT NULL,actor TEXT NOT NULL,
      PRIMARY KEY(profile_id,day));
    CREATE TABLE IF NOT EXISTS campaign_cost_audit(id INTEGER PRIMARY KEY,profile_id TEXT NOT NULL,
      day TEXT NOT NULL,actor TEXT NOT NULL,created INTEGER NOT NULL,previous TEXT NOT NULL,changed TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS campaign_cost_requests(id TEXT PRIMARY KEY,actor TEXT NOT NULL,
      digest TEXT NOT NULL,result TEXT NOT NULL,created INTEGER NOT NULL);
    ''')


class Problem(Exception):
    def __init__(self,status,message):self.status=status;self.message=message


def text(data,key,limit,required=True):
    value=data.get(key,'')
    if not isinstance(value,str) or len(value)>limit or any(ord(c)<32 and c not in '\n\t' for c in value):raise Problem(400,'Check '+key+'.')
    value=value.strip()
    if required and not value:raise Problem(400,'Enter '+key+'.')
    return value


def country(payload):
    pref=payload.get('qualification')
    value=pref.get('country') if isinstance(pref,dict) and pref.get('version')==1 else None
    return value if value in ('US','GB','IN','other') else 'unknown'


def review_record(db,ref):
    row=db.execute('SELECT * FROM crm_review_work WHERE reference=?',(ref,)).fetchone()
    return dict(row) if row else dict(reference=ref,status='Requested',summary='',version=0,updated=None,actor='')


def available_review(db,ref,identity):
    from dashboard import lead_access
    lead=lead_access(db,ref,identity)
    if not lead:return None
    payload=json.loads(lead['payload']);review=payload.get('crmReview')
    return lead if isinstance(review,dict) and review.get('version')==1 else None


def review_queue(db,identity,query):
    from dashboard import attention_reasons,business_today
    market=query.get('country',[''])[0];bucket=query.get('bucket',['open'])[0]
    try:offset=int(query.get('offset',['0'])[0])
    except ValueError:raise Problem(400,'Invalid page.')
    if market not in ('',*COUNTRIES) or bucket not in BUCKETS or not 0<=offset<=1000000:raise Problem(400,'Choose valid review filters.')
    access=' AND w.owner=?' if identity['role']=='agent' else ''
    rows=db.execute("SELECT e.id,e.created,e.payload,COALESCE(w.stage,'New') stage,COALESCE(w.owner,'') owner,COALESCE(w.next_action,'') next_action,COALESCE(w.follow_up_date,'') follow_up_date FROM enquiries e LEFT JOIN enquiry_workflow w ON w.id=e.id WHERE e.email_status!='qa-verified' AND json_extract(e.payload,'$.crmReview.version')=1"+access,([identity['actor']] if access else [])).fetchall()
    today=business_today().isoformat();now=int(time.time());items=[];counts=dict.fromkeys(BUCKETS,0)
    for row in rows:
        payload=json.loads(row['payload']);code=country(payload)
        if market and code!=market:continue
        record=review_record(db,row['id']);active=row['stage'] not in ('Won','Lost') and record['status']!='Reviewed'
        entry=dict(reference=row['id'],created=row['created'],stage=row['stage'],owner=row['owner'],nextAction=row['next_action'],followUpDate=row['follow_up_date'])
        contacted=bool(db.execute("SELECT 1 FROM lead_activity WHERE enquiry_id=? AND kind IN ('call-connected','email-sent') AND created>=? UNION ALL SELECT 1 FROM sales_events WHERE enquiry_id=? AND stage IN ('Contacted','Qualified','Proposal','Won') AND created>=? LIMIT 1",(row['id'],row['created'],row['id'],row['created'])).fetchone())
        waiting=active and not contacted and row['created']<=now-48*3600
        reasons=[reason for reason in attention_reasons(entry,today,now) if reason!='New for 48+ hours'] if active else []
        if waiting:reasons.append('No recorded first contact for 48+ hours')
        overdue=active and bool((row['follow_up_date'] and row['follow_up_date']<today) or waiting)
        matches={'open':active,'attention':active and bool(reasons),'overdue':overdue,'unassigned':active and not row['owner'].strip(),'reviewed':record['status']=='Reviewed','all':True}
        for key,yes in matches.items():counts[key]+=bool(yes)
        if matches[bucket]:items.append({**entry,'country':code,'countryLabel':COUNTRIES[code],'name':payload.get('name','Customer'),
            'challenge':payload['crmReview'].get('challenge',''),'reviewStatus':record['status'],'attentionReasons':reasons,'overdue':overdue})
    items.sort(key=lambda r:(not r['overdue'],r['created'],r['reference']))
    return dict(items=items[offset:offset+25],counts=counts,total=len(items),offset=offset,limit=25,today=today,timezone='Asia/Kolkata')


def profile_values(data):
    result={key:text(data,key,limit) for key,limit in [('country',2),('campaign',80),('source',80),('medium',20),('currency',3),('timezone',64),('accountLabel',80)]}
    if result['country'] not in ('US','GB','IN') or result['currency'] not in ('INR','USD','GBP','EUR','AED'):raise Problem(400,'Choose a market and billing currency.')
    if any(not re.fullmatch('[a-zA-Z0-9_-]{1,80}',result[key]) for key in ('campaign','source')) or result['medium'] not in ('cpc','ppc','paid','paid_social','paid_search','display'):raise Problem(400,'Use exact campaign/source tags and a paid medium.')
    try:ZoneInfo(result['timezone'])
    except (ZoneInfoNotFoundError,ValueError):raise Problem(400,'Choose a valid advertising account time zone.')
    return result


def cost_report(db,days,now=None):
    now=now or dt.datetime.now(dt.timezone.utc);profiles=[]
    for raw in db.execute('SELECT * FROM campaign_cost_profiles ORDER BY country,campaign,source,medium'):
        p=dict(raw);zone=ZoneInfo(p['timezone']);end=now.astimezone(zone).date();start=end-dt.timedelta(days=days)
        begin_stamp=int(dt.datetime.combine(start,dt.time(),zone).timestamp());end_stamp=int(dt.datetime.combine(end,dt.time(),zone).timestamp())
        entries=[dict(r) for r in db.execute('SELECT day,minor_units,version FROM campaign_daily_costs WHERE profile_id=? ORDER BY day DESC',(p['id'],))]
        selected=[r for r in entries if start.isoformat()<=r['day']<end.isoformat()]
        counts=dict(enquiries=0,qualified=0,won=0);values={}
        rows=db.execute("SELECT e.id,e.created,e.payload,COALESCE(w.stage,'New') stage FROM enquiries e LEFT JOIN enquiry_workflow w ON w.id=e.id WHERE e.email_status!='qa-verified' AND e.created>=? AND e.created<?",(begin_stamp,end_stamp))
        for row in rows:
            payload=json.loads(row['payload']);a=payload.get('attribution') or {}
            if not isinstance(a,dict) or country(payload)!=p['country'] or (a.get('channel'),a.get('utm_campaign'),a.get('utm_source'),a.get('utm_medium'))!=('paid',p['campaign'],p['source'],p['medium']):continue
            counts['enquiries']+=1
            counts['qualified']+=bool(db.execute("SELECT 1 FROM sales_events WHERE enquiry_id=? AND stage='Qualified' AND created>=?",(row['id'],row['created'])).fetchone())
            if row['stage']=='Won':
                counts['won']+=1;deal=db.execute('SELECT currency,minor_units FROM deal_values WHERE enquiry_id=?',(row['id'],)).fetchone()
                if deal:values[deal['currency']]=values.get(deal['currency'],0)+deal['minor_units']
        complete=len(selected)==days;spend=sum(r['minor_units'] for r in selected) if selected else None
        def average(count):return int((Decimal(spend)/count).quantize(Decimal('1'),rounding=ROUND_HALF_UP)) if complete and count else None
        profiles.append({**p,'entries':entries,'periodStart':start.isoformat(),'periodEnd':(end-dt.timedelta(days=1)).isoformat(),
            'recordedDays':len(selected),'expectedDays':days,'complete':complete,'spendMinor':spend,'counts':counts,
            'costPerQualifiedMinor':average(counts['qualified']),'costPerWonMinor':average(counts['won']),
            'wonValues':[dict(currency=c,minorUnits=v) for c,v in sorted(values.items())]})
    return {'profiles':profiles,'days':days,'basis':'Manually recorded advertising costs, not a live ad-account feed. Each campaign profile matches saved business country and exact paid source/medium/campaign tags across all landing pages. Periods cover the last completed account-calendar days, excluding today, in the saved account time zone. Enter each day, including confirmed zero spend. Cost per qualified lead/won customer is available only with complete daily cost coverage and a non-zero denominator; unrecorded spend is unknown. Qualified requires a recorded event; Won is the current staff stage, not payment. Sales milestones are evaluated through now for enquiries received in the cost period. Recorded won values stay separate by currency; no FX conversion or ROAS is calculated. Campaign tags must be unique across accounts for these ratios to be meaningful. Managers see whole-campaign costs; agents do not receive cost data.'}


def get(handler,connect,identity):
    parsed=urlsplit(handler.path);route=parsed.path
    if route not in ('/api/admin/review-queue','/api/admin/campaign-costs'):return False
    if not identity:handler.respond(401,{'error':'Sign in to continue.'});return True
    try:
        query=parse_qs(parsed.query)
        with connect() as db:
            db.execute('BEGIN')
            if route.endswith('review-queue'):
                ref=query.get('reference',[''])[0]
                if ref:
                    if not available_review(db,ref,identity):raise Problem(404,'Review request not available.')
                    result={'record':review_record(db,ref)}
                else:result=review_queue(db,identity,query)
            else:
                if identity['role'] not in ('admin','manager'):raise Problem(403,'Campaign costs require manager access.')
                try:days=int(query.get('days',['30'])[0])
                except ValueError:days=0
                if days not in (7,30,90):raise Problem(400,'Choose 7, 30 or 90 days.')
                result=cost_report(db,days)
        handler.respond(200,result)
    except Problem as error:handler.respond(error.status,{'error':error.message})
    return True


def post(handler,connect,identity,data):
    route=urlsplit(handler.path).path
    if route not in ('/api/admin/review-queue','/api/admin/campaign-costs'):return False
    try:
        with connect() as db:
            db.execute('BEGIN IMMEDIATE');now=int(time.time())
            if route.endswith('review-queue'):
                ref=text(data,'reference',30)
                if not available_review(db,ref,identity):raise Problem(404,'Review request not available.')
                old=review_record(db,ref);status=data.get('status');summary=text(data,'summary',2000,False)
                if type(data.get('version')) is not int or data['version']!=old['version']:raise Problem(409,'The review changed. Reload before saving.')
                if status not in STATUSES or (status=='Reviewed' and not summary):raise Problem(400,'Choose a review status and record a summary before marking Reviewed.')
                changed=dict(status=status,summary=summary,version=old['version']+1)
                db.execute('INSERT INTO crm_review_work VALUES(?,?,?,?,?,?) ON CONFLICT(reference) DO UPDATE SET status=excluded.status,summary=excluded.summary,version=excluded.version,updated=excluded.updated,actor=excluded.actor',(ref,status,summary,changed['version'],now,identity['actor']))
                db.execute('INSERT INTO crm_review_audit(reference,actor,created,previous,changed) VALUES(?,?,?,?,?)',(ref,identity['actor'],now,json.dumps(old),json.dumps(changed)));result={'ok':True,**changed}
            else:
                if identity['role'] not in ('admin','manager'):raise Problem(403,'Campaign costs require manager access.')
                request=text(data,'requestId',36)
                try:identifier=uuid.UUID(request)
                except ValueError:raise Problem(400,'Invalid retry key.')
                if identifier.version!=4 or str(identifier)!=request:raise Problem(400,'Invalid retry key.')
                digest=hashlib.sha256(json.dumps(data,sort_keys=True).encode()).hexdigest();previous=db.execute('SELECT * FROM campaign_cost_requests WHERE id=?',(request,)).fetchone()
                if previous:
                    if previous['actor']!=identity['actor'] or previous['digest']!=digest:raise Problem(409,'This request changed. Refresh before retrying.')
                    handler.respond(200,json.loads(previous['result']));return True
                if data.get('action')=='profile':
                    p=profile_values(data);pid=secrets.token_hex(12)
                    if db.execute('SELECT 1 FROM campaign_cost_profiles WHERE country=? AND campaign=? AND source=? AND medium=?',(p['country'],p['campaign'],p['source'],p['medium'])).fetchone():raise Problem(409,'This campaign profile already exists. Use its daily cost ledger.')
                    db.execute('INSERT INTO campaign_cost_profiles VALUES(?,?,?,?,?,?,?,?,?,?)',(pid,p['country'],p['campaign'],p['source'],p['medium'],p['currency'],p['timezone'],p['accountLabel'],now,identity['actor']))
                    db.execute("INSERT INTO campaign_cost_audit(profile_id,day,actor,created,previous,changed) VALUES(?,'',?,?,?,?)",(pid,identity['actor'],now,'{}',json.dumps(p)));result={'ok':True,'profileId':pid}
                elif data.get('action')=='entries':
                    pid=text(data,'profileId',24);profile=db.execute('SELECT * FROM campaign_cost_profiles WHERE id=?',(pid,)).fetchone()
                    if not profile:raise Problem(404,'Campaign profile not available.')
                    entries=data.get('entries')
                    if not isinstance(entries,list) or not 1<=len(entries)<=90:raise Problem(400,'Provide 1–90 daily cost rows.')
                    today=dt.datetime.now(ZoneInfo(profile['timezone'])).date();seen=set()
                    for entry in entries:
                        if not isinstance(entry,dict) or set(entry)!={'date','amount','version'}:raise Problem(400,'Check daily cost columns.')
                        day=text(entry,'date',10);amount=text(entry,'amount',20)
                        try:date=dt.date.fromisoformat(day)
                        except ValueError:raise Problem(400,'Use ISO daily cost dates.')
                        if date.isoformat()!=day or not today-dt.timedelta(days=730)<=date<today or day in seen:raise Problem(400,'Use unique completed account dates within the last 730 days.')
                        seen.add(day)
                        if not re.fullmatch(r'\d{1,9}(?:\.\d{1,2})?',amount):raise Problem(400,'Use non-negative costs with up to two decimals, without currency symbols.')
                        minor=int(Decimal(amount)*100);old=db.execute('SELECT * FROM campaign_daily_costs WHERE profile_id=? AND day=?',(pid,day)).fetchone();version=old['version'] if old else 0
                        if type(entry['version']) is not int or entry['version']!=version:raise Problem(409,'A daily cost changed. Reload the ledger before saving.')
                        db.execute('INSERT INTO campaign_daily_costs VALUES(?,?,?,?,?,?) ON CONFLICT(profile_id,day) DO UPDATE SET minor_units=excluded.minor_units,version=excluded.version,updated=excluded.updated,actor=excluded.actor',(pid,day,minor,version+1,now,identity['actor']))
                        db.execute('INSERT INTO campaign_cost_audit(profile_id,day,actor,created,previous,changed) VALUES(?,?,?,?,?,?)',(pid,day,identity['actor'],now,json.dumps(dict(old) if old else {}),json.dumps(dict(minorUnits=minor,version=version+1))))
                    result={'ok':True,'saved':len(entries)}
                else:raise Problem(400,'Choose a campaign cost action.')
                db.execute('INSERT INTO campaign_cost_requests VALUES(?,?,?,?,?)',(request,identity['actor'],digest,json.dumps(result),now))
        handler.respond(200,result)
    except Problem as error:handler.respond(error.status,{'error':error.message})
    return True

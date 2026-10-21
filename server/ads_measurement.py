"""Consent-based GCLID imports for staff review. No Google calls or ad spending."""
import csv
import datetime as dt
import hashlib
import io
import json
import re
import time
from urllib.parse import parse_qs,urlsplit

MARKETS={'US':('United States','us','USD'),'GB':('United Kingdom','uk','GBP'),'IN':('India','india','INR')}
ROUTES={'/'+value[1]+'/travel-agency-crm/':code for code,value in MARKETS.items()}
POLICY='ads-click-v1'
RETENTION=90*86400
GCLID=re.compile(r'[A-Za-z0-9_-]{1,512}')
HEADERS=('Google Click ID','Conversion Name','Conversion Time','Conversion Value','Conversion Currency','Ad User Data','Ad Personalization','Order ID')


def initialize(db):
    db.executescript('''
    CREATE TABLE IF NOT EXISTS ads_market_settings(country TEXT PRIMARY KEY,customer_id TEXT NOT NULL,
      qualified_name TEXT NOT NULL,won_name TEXT NOT NULL,confirmed INTEGER NOT NULL DEFAULT 0,
      version INTEGER NOT NULL,updated INTEGER NOT NULL,actor TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS ads_settings_audit(id INTEGER PRIMARY KEY,country TEXT NOT NULL,
      actor TEXT NOT NULL,created INTEGER NOT NULL,previous TEXT NOT NULL,changed TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS ads_clicks(reference TEXT PRIMARY KEY,market TEXT NOT NULL,
      customer_id TEXT NOT NULL,gclid TEXT NOT NULL,policy TEXT NOT NULL,created INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS ads_clicks_created ON ads_clicks(created);
    CREATE TABLE IF NOT EXISTS ads_exclusions(reference TEXT PRIMARY KEY,actor TEXT NOT NULL,
      created INTEGER NOT NULL,reason TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS ads_export_audit(id INTEGER PRIMARY KEY,market TEXT NOT NULL,
      actor TEXT NOT NULL,created INTEGER NOT NULL,row_count INTEGER NOT NULL,digest TEXT NOT NULL);
    ''')
    purge(db)


def purge(db,now=None):
    db.execute('DELETE FROM ads_clicks WHERE created<=?',((int(time.time()) if now is None else now)-RETENTION,))


def profile(db,country):
    row=db.execute('SELECT * FROM ads_market_settings WHERE country=?',(country,)).fetchone()
    return dict(row) if row else dict(country=country,customer_id='',qualified_name='BANDEVI CRM Qualified Lead',won_name='BANDEVI CRM Won Customer',confirmed=0,version=0,updated=None,actor='')


def validate(value,enquiry):
    if (not isinstance(value,dict) or set(value)!={'version','consent','policy','gclid'} or type(value['version']) is not int or value['version']!=1
            or value['consent'] is not True or value['policy']!=POLICY or not isinstance(value['gclid'],str) or not GCLID.fullmatch(value['gclid'])
            or enquiry['type']!='contact' or enquiry['source'] not in ROUTES):
        raise ValueError('Check the optional advertising measurement choice.')
    return dict(version=1,consent=True,policy=POLICY,gclid=value['gclid'])


def capture(db,reference,data,enquiry,allowed,now):
    purge(db,now)
    if not data or not allowed:return
    market=ROUTES[enquiry['source']];settings=profile(db,market)
    if not settings['confirmed'] or db.execute('SELECT 1 FROM ads_exclusions WHERE reference=?',(reference,)).fetchone():return
    db.execute('INSERT INTO ads_clicks VALUES(?,?,?,?,?,?)',(reference,market,settings['customer_id'],data['gclid'],POLICY,now))


def public_get(handler,connect):
    parsed=urlsplit(handler.path)
    if parsed.path!='/api/enquiries' or parse_qs(parsed.query).get('capabilities')!=['ads-measurement']:return False
    with connect() as db:markets={code:bool(profile(db,code)['confirmed']) for code in MARKETS}
    handler.respond(200,dict(version=1,policy=POLICY,markets=markets));return True


def preview(db,market,days,now=None):
    now=int(time.time()) if now is None else now;purge(db,now)
    settings=profile(db,market);rows=[];diagnostics=dict(consentedClicks=0,accountChanged=0,noQualifiedEvent=0,wonWithoutValue=0,duplicateMilestones=0)
    clicks=db.execute("SELECT a.*,e.created enquiry_created,e.payload,COALESCE(w.stage,'New') stage FROM ads_clicks a JOIN enquiries e ON e.id=a.reference LEFT JOIN enquiry_workflow w ON w.id=e.id LEFT JOIN ads_exclusions x ON x.reference=e.id WHERE a.market=? AND e.email_status!='qa-verified' AND x.reference IS NULL AND a.policy=?",(market,POLICY))
    for item in clicks:
        if not GCLID.fullmatch(item['gclid']):continue
        diagnostics['consentedClicks']+=1
        if item['customer_id']!=settings['customer_id']:diagnostics['accountChanged']+=1;continue
        if not settings['confirmed']:continue
        payload=json.loads(item['payload']);preferences=payload.get('qualification')
        business=preferences.get('country') if isinstance(preferences,dict) and preferences.get('version')==1 else 'unknown'
        business=business if business in ('US','GB','IN','other') else 'unknown'
        for goal in ('Qualified','Won'):
            event=db.execute('SELECT MIN(created) FROM sales_events WHERE enquiry_id=? AND stage=? AND created>=? AND created<=?',(item['reference'],goal,item['enquiry_created'],now)).fetchone()[0]
            if event is None:
                if goal=='Qualified':diagnostics['noQualifiedEvent']+=1
                continue
            if event<now-days*86400:continue
            minor=0;currency=MARKETS[market][2]
            if goal=='Won':
                if item['stage']!='Won':continue
                deal=db.execute('SELECT minor_units,currency FROM deal_values WHERE enquiry_id=?',(item['reference'],)).fetchone()
                if not deal or type(deal['minor_units']) is not int or deal['minor_units']<0 or deal['currency'] not in ('USD','GBP','INR','EUR','AED'):
                    diagnostics['wonWithoutValue']+=1;continue
                minor=deal['minor_units'];currency=deal['currency']
            rows.append(dict(reference=item['reference'],market=market,businessCountry=business,goal=goal,gclid=item['gclid'],conversionName=settings['qualified_name' if goal=='Qualified' else 'won_name'],time=dt.datetime.fromtimestamp(event,dt.timezone.utc).strftime('%Y-%m-%d %H:%M:%S+0000'),minorUnits=minor,currency=currency,orderId=hashlib.sha256((item['customer_id']+':'+item['gclid']+':'+goal).encode()).hexdigest()[:32]))
            if len(rows)>5000:raise ValueError('More than 5,000 conversions match. Select a shorter period before exporting.')
    rows.sort(key=lambda row:(row['time'],row['orderId'],row['reference']))
    unique={}
    for row in rows:
        key=(row['gclid'],row['goal'])
        if key in unique:diagnostics['duplicateMilestones']+=1
        else:unique[key]=row
    rows=list(unique.values())
    digest=hashlib.sha256(json.dumps(dict(settings=settings,rows=rows),sort_keys=True).encode()).hexdigest()
    return dict(market=market,days=days,settings=settings,ready=bool(settings['confirmed']),rows=rows,digest=digest,diagnostics=diagnostics)


def csv_file(rows):
    output=io.StringIO(newline='');writer=csv.writer(output)
    writer.writerow(['Parameters:TimeZone=+0000']);writer.writerow(HEADERS)
    for row in rows:
        writer.writerow((row['gclid'],row['conversionName'],row['time'],f"{row['minorUnits']//100}.{row['minorUnits']%100:02d}",row['currency'],'Granted','Denied',row['orderId']))
    return output.getvalue()


def get(handler,connect,identity):
    parsed=urlsplit(handler.path);route=parsed.path
    if route not in ('/api/admin/ads-setup','/api/admin/ads-preview','/api/admin/ads-consent'):return False
    if not identity:handler.respond(401,{'error':'Sign in to continue.'});return True
    query=parse_qs(parsed.query)
    if route!='/api/admin/ads-consent' and identity['role'] not in ('admin','manager'):
        handler.respond(403,{'error':'Manager access required.'});return True
    from dashboard import lead_access
    try:
        with connect() as db:
            db.execute('BEGIN IMMEDIATE');purge(db)
            if route.endswith('ads-setup'):
                result=dict(profiles=[profile(db,code) for code in MARKETS],policy=POLICY,retentionDays=90,uploadConnected=False)
            elif route.endswith('ads-consent'):
                ref=query.get('reference',[''])[0]
                if not lead_access(db,ref,identity):handler.respond(404,{'error':'Enquiry not available.'});return True
                click=db.execute('SELECT market,created FROM ads_clicks WHERE reference=?',(ref,)).fetchone()
                excluded=bool(db.execute('SELECT 1 FROM ads_exclusions WHERE reference=?',(ref,)).fetchone())
                result=dict(reference=ref,stored=bool(click),excluded=excluded,market=click['market'] if click else None,expires=click['created']+RETENTION if click else None)
            else:
                market=query.get('country',[''])[0];days=int(query.get('days',['30'])[0])
                if market not in MARKETS or days not in (7,30,90):raise ValueError('Choose a market and period.')
                result=preview(db,market,days)
                result['rows']=[{key:value for key,value in row.items() if key!='gclid'} for row in result['rows']]
        handler.respond(200,result)
    except (ValueError,TypeError) as error:handler.respond(400,{'error':str(error)})
    return True


def action_name(value):
    return isinstance(value,str) and 1<=len(value.strip())<=100 and value==value.strip() and value[0] not in '=+-@' and not any(ord(char)<32 for char in value)


def post(handler,connect,identity,data):
    route=urlsplit(handler.path).path
    if route not in ('/api/admin/ads-setup','/api/admin/ads-export','/api/admin/ads-consent'):return False
    from dashboard import lead_access
    if route!='/api/admin/ads-consent' and identity['role'] not in ('admin','manager'):
        handler.respond(403,{'error':'Manager access required.'});return True
    try:
        with connect() as db:
            db.execute('BEGIN IMMEDIATE');now=int(time.time());purge(db,now)
            if route.endswith('ads-consent'):
                ref=data.get('reference');reason=data.get('reason','')
                if not isinstance(ref,str) or not lead_access(db,ref,identity):handler.respond(404,{'error':'Enquiry not available.'});return True
                if data.get('withdraw') is not True or not isinstance(reason,str) or not 1<=len(reason.strip())<=300:raise ValueError('Record the reason for excluding this enquiry.')
                db.execute('INSERT OR IGNORE INTO ads_exclusions VALUES(?,?,?,?)',(ref,identity['actor'],now,reason.strip()))
                db.execute('DELETE FROM ads_clicks WHERE reference=?',(ref,));result=dict(ok=True,excluded=True)
            elif route.endswith('ads-setup'):
                market=data.get('country');customer=data.get('customerId');qualified=data.get('qualifiedName');won=data.get('wonName');confirmed=data.get('confirmed');version=data.get('version')
                if market not in MARKETS or not isinstance(customer,str) or customer and (not re.fullmatch('[0-9]{10}',customer) or customer=='0'*10) or type(confirmed) is not bool or type(version) is not int or not action_name(qualified) or not action_name(won) or qualified==won or confirmed and not customer:
                    raise ValueError('Enter a valid Customer ID and two distinct exact conversion-action names. Confirm the setup only after checking them in Google Ads.')
                old=profile(db,market)
                if old['version']!=version:handler.respond(409,{'error':'The setup changed. Reload before saving.'});return True
                new=dict(country=market,customer_id=customer,qualified_name=qualified,won_name=won,confirmed=int(confirmed),version=version+1,updated=now,actor=identity['actor'])
                db.execute('INSERT INTO ads_market_settings VALUES(:country,:customer_id,:qualified_name,:won_name,:confirmed,:version,:updated,:actor) ON CONFLICT(country) DO UPDATE SET customer_id=excluded.customer_id,qualified_name=excluded.qualified_name,won_name=excluded.won_name,confirmed=excluded.confirmed,version=excluded.version,updated=excluded.updated,actor=excluded.actor',new)
                db.execute('INSERT INTO ads_settings_audit(country,actor,created,previous,changed) VALUES(?,?,?,?,?)',(market,identity['actor'],now,json.dumps(old),json.dumps(new)));result=dict(ok=True,settings=new)
            else:
                market=data.get('country');days=data.get('days')
                if market not in MARKETS or type(days) is not int or days not in (7,30,90) or data.get('reviewed') is not True:raise ValueError('Review the selected market conversions before downloading.')
                result=preview(db,market,days,now)
                if not result['ready']:raise ValueError('Confirm the account and conversion actions before preparing an import.')
                if data.get('digest')!=result['digest']:handler.respond(409,{'error':'The conversions or account settings changed. Refresh and review the preview again.'});return True
                if not result['rows']:raise ValueError('There are no eligible conversions to export.')
                content=csv_file(result['rows'])
                db.execute('INSERT INTO ads_export_audit(market,actor,created,row_count,digest) VALUES(?,?,?,?,?)',(market,identity['actor'],now,len(result['rows']),result['digest']))
                result=dict(ok=True,filename='bandevi-google-ads-'+market.lower()+'.csv',csv=content,rowCount=len(result['rows']),customerId=result['settings']['customer_id'],uploaded=False)
        handler.respond(200,result)
    except (ValueError,TypeError) as error:handler.respond(400,{'error':str(error)})
    return True

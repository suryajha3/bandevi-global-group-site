"""Read-only, access-scoped contact evidence and published-slot coverage."""
import datetime as dt
import json
import statistics
import time
from urllib.parse import parse_qs, urlsplit
from zoneinfo import ZoneInfo
from growth_workbench import COUNTRIES, country

ZONES=(('US','US Eastern','America/New_York'),('US','US Central','America/Chicago'),
       ('US','US Mountain','America/Denver'),('US','US Pacific','America/Los_Angeles'),
       ('US','US Arizona','America/Phoenix'),('US','US Alaska','America/Anchorage'),
       ('US','US Hawaii','Pacific/Honolulu'),('GB','United Kingdom','Europe/London'),
       ('IN','India','Asia/Kolkata'))
RESPONSE_BASIS=('Enquiries received in the selected rolling period, grouped by their saved business country. '
 'First contact uses the earliest staff-recorded connected call or sent email at or after receipt and no later than this snapshot. '
 'Times reflect when the activity was logged, not an independently verified contact time; they do not prove email delivery or a customer reply. Stage changes, automated acknowledgements, notes, voicemail and unanswered calls do not count. '
 'Stage-only progress is shown separately; offline contact may be missing. Waiting and unassigned counts exclude Won/Lost. '
 'Response averages and within-target counts use contacted enquiries, including closed ones; uncontacted enquiries are not treated as zero-time responses. '
 'The target is a review filter in elapsed hours, including nights and weekends, not a promised service level. Hidden QA and future-dated enquiries are excluded. Agents see only currently assigned enquiries.')


def response_report(db,identity,query,now=None):
    now=int(time.time()) if now is None else now
    try:days=int(query.get('days',['30'])[0]);hours=int(query.get('hours',['24'])[0]);offset=int(query.get('offset',['0'])[0])
    except ValueError:raise ValueError('Choose valid response filters.')
    market=query.get('country',[''])[0];bucket=query.get('bucket',['waiting'])[0]
    if days not in (7,30,90,365) or hours not in (4,24,48) or market not in ('',*COUNTRIES) or bucket not in ('all','waiting','overdue','unassigned','stage_only') or not 0<=offset<=1000000:
        raise ValueError('Choose valid response filters.')
    access=' AND w.owner=?' if identity['role']=='agent' else ''
    args=[now,now,now-days*86400,now]+([identity['actor']] if access else [])
    rows=db.execute("""SELECT e.id,e.created,e.payload,COALESCE(w.stage,'New') stage,COALESCE(w.owner,'') owner,
      COALESCE(w.next_action,'') next_action,COALESCE(w.follow_up_date,'') follow_up_date,
      (SELECT MIN(a.created) FROM lead_activity a WHERE a.enquiry_id=e.id AND a.kind IN ('call-connected','email-sent') AND a.created>=e.created AND a.created<=?) contact,
      (SELECT MIN(s.created) FROM sales_events s WHERE s.enquiry_id=e.id AND s.stage IN ('Contacted','Qualified','Proposal','Won') AND s.created>=e.created AND s.created<=?) progress
      FROM enquiries e LEFT JOIN enquiry_workflow w ON w.id=e.id
      WHERE e.email_status!='qa-verified' AND e.created>=? AND e.created<=?"""+access,args)
    entries=[]
    for row in rows:
        payload=json.loads(row['payload']);code=country(payload)
        if market and code!=market:continue
        active=row['stage'] not in ('Won','Lost');waiting=active and row['contact'] is None
        stage_only=row['contact'] is None and (row['progress'] is not None or row['stage'] in ('Contacted','Qualified','Proposal','Won'))
        entries.append(dict(reference=row['id'],name=payload.get('name','Customer'),interest=payload.get('interest',''),created=row['created'],
          country=code,countryLabel=COUNTRIES[code],owner=row['owner'],stage=row['stage'],nextAction=row['next_action'],followUpDate=row['follow_up_date'],
          firstContact=row['contact'],responseSeconds=row['contact']-row['created'] if row['contact'] is not None else None,
          ageSeconds=now-row['created'],active=active,waiting=waiting,overTarget=waiting and now-row['created']>hours*3600,
          unassigned=active and not row['owner'].strip(),stageOnly=stage_only))
    def summary(items):
        times=[item['responseSeconds'] for item in items if item['responseSeconds'] is not None]
        return dict(enquiries=len(items),contactRecorded=len(times),noContactRecorded=len(items)-len(times),
          activeWaiting=sum(item['waiting'] for item in items),overTarget=sum(item['overTarget'] for item in items),
          activeUnassigned=sum(item['unassigned'] for item in items),stageOnly=sum(item['stageOnly'] for item in items),
          withinTarget=sum(value<=hours*3600 for value in times),medianSeconds=round(statistics.median(times)) if times else None,
          averageSeconds=round(statistics.mean(times)) if times else None,
          oldestWaitingSeconds=max((item['ageSeconds'] for item in items if item['waiting']),default=None))
    markets=[dict(country=code,label=label,**summary([item for item in entries if item['country']==code])) for code,label in COUNTRIES.items() if not market or code==market]
    matches=dict(all=lambda item:item['active'],waiting=lambda item:item['waiting'],overdue=lambda item:item['overTarget'],unassigned=lambda item:item['unassigned'],stage_only=lambda item:item['active'] and item['stageOnly'])
    queue=[item for item in entries if matches[bucket](item)]
    queue.sort(key=lambda item:(not item['overTarget'],item['created'],item['reference']))
    return dict(capturedAt=now,days=days,hours=hours,country=market,bucket=bucket,summary=summary(entries),markets=markets,
      items=queue[offset:offset+25],total=len(queue),offset=offset,limit=25,basis=RESPONSE_BASIS)


def coverage_report(db,query,now=None):
    now=int(time.time()) if now is None else now
    try:horizon=int(query.get('horizon',['14'])[0])
    except ValueError:raise ValueError('Choose a valid coverage window.')
    market=query.get('country',[''])[0]
    if horizon not in (7,14,30) or market not in ('','US','GB','IN'):raise ValueError('Choose a valid coverage window or market.')
    # Match the public endpoint, including its first-100 limit. A cancelled
    # booking releases its old slot ID through the existing cancellation flow.
    slots=db.execute('SELECT s.starts,s.duration FROM demo_slots s LEFT JOIN demo_bookings b ON b.slot_id=s.id WHERE s.active=1 AND b.slot_id IS NULL AND s.starts>? AND s.starts<? ORDER BY s.starts LIMIT 100',(now,now+180*86400)).fetchall()
    rows=[]
    for code,label,zone_name in ZONES:
        if market and market!=code:continue
        zone=ZoneInfo(zone_name);today=dt.datetime.fromtimestamp(now,zone).date();days=[]
        for offset in range(horizon):
            date=today+dt.timedelta(days=offset)
            if date.weekday()>=5:continue
            start=dt.datetime.combine(date,dt.time(9),zone);end=dt.datetime.combine(date,dt.time(17),zone)
            # The UTC interval naturally follows local daylight-saving offsets.
            fit=[slot for slot in slots if slot['duration'] in (15,30,45,60) and int(start.timestamp())<=slot['starts'] and slot['starts']+slot['duration']*60<=int(end.timestamp())]
            days.append(dict(date=date.isoformat(),elapsed=int(end.timestamp())<=now,slots=len(fit),firstStart=min((slot['starts'] for slot in fit),default=None)))
        available=[day for day in days if day['slots']]
        rows.append(dict(country=code,label=label,timezone=zone_name,fromDate=today.isoformat(),throughDate=(today+dt.timedelta(days=horizon-1)).isoformat(),
          weekdays=sum(not day['elapsed'] for day in days),coveredDays=len(available),slots=sum(day['slots'] for day in days),nextStart=min((day['firstStart'] for day in available),default=None),
          gaps=[day['date'] for day in days if not day['slots'] and not day['elapsed']],days=days))
    return dict(capturedAt=now,horizon=horizon,rows=rows,publicSlotsConsidered=len(slots),publicLimitReached=len(slots)==100,
      basis='Snapshot of the first 100 active, future, unreserved slots exposed by the public demo-slot endpoint, not a staffing or support-hours guarantee. '
      'A covered date has at least one slot entirely within 09:00–17:00 Monday–Friday in that row’s local time zone. Holidays are not excluded. '
      'The window includes today; elapsed times cannot be booked. A local weekday window that has already ended is labelled elapsed and excluded from the coverage denominator and gaps. US zones are separate views, not customer location inference. '
      'The same slot can cover several zones and can be reserved only once; do not add rows to estimate capacity. '
      'Reservations, cancellations and new publications can change the snapshot immediately. Publish only times and hosts the team has approved. No slots are created or reserved by this report.')


def get(handler,connect,identity):
    parsed=urlsplit(handler.path)
    if parsed.path not in ('/api/admin/response-times','/api/admin/demo-coverage'):return False
    if not identity:handler.respond(401,{'error':'Sign in to continue.'});return True
    if parsed.path.endswith('demo-coverage') and identity['role'] not in ('admin','manager'):
        handler.respond(403,{'error':'Demo coverage requires manager access.'});return True
    try:
        with connect() as db:
            db.execute('BEGIN')
            result=coverage_report(db,parse_qs(parsed.query)) if parsed.path.endswith('demo-coverage') else response_report(db,identity,parse_qs(parsed.query))
        handler.respond(200,result)
    except ValueError as error:handler.respond(400,{'error':str(error)})
    return True

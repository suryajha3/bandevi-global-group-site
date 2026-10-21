"""Derived, access-scoped recovery work. No automatic outreach or stage changes."""
import json
import time
from urllib.parse import parse_qs,urlsplit
import growth_workbench
import sales_journey

REASONS={
    'no_show':('Recorded no-show','Review the missed demo and agree a new time with the customer.'),
    'reschedule':('Reschedule needed','Review the existing appointment and agree a replacement time.'),
    'attendance':('Demo outcome missing','Record what happened after the scheduled demo; do not assume a no-show.'),
    'unbooked':('Enquiry without a demo','Review the requirements and invite the customer to arrange a demo.'),
    'proposal':('Proposal awaiting decision','Review the current proposal and record the next agreed follow-up.'),
}


def queue(db,identity,query,now=None):
    now=int(time.time()) if now is None else now
    market=query.get('country',[''])[0];bucket=query.get('bucket',['all'])[0]
    try:days=int(query.get('days',['90'])[0]);offset=int(query.get('offset',['0'])[0])
    except ValueError:raise ValueError('Choose valid recovery filters.')
    if market not in ('',*growth_workbench.COUNTRIES) or bucket not in ('all',*REASONS) or days not in (7,30,90,365) or not 0<=offset<=1000000:
        raise ValueError('Choose valid recovery filters.')
    from dashboard import business_today
    today=business_today().isoformat();args=[now-days*86400]
    access=' AND w.owner=?' if identity['role']=='agent' else ''
    if access:args.append(identity['actor'])
    rows=db.execute("SELECT e.id,e.created,e.payload,COALESCE(w.stage,'New') stage,COALESCE(w.owner,'') owner,COALESCE(w.next_action,'') next_action,COALESCE(w.follow_up_date,'') follow_up_date FROM enquiries e LEFT JOIN enquiry_workflow w ON w.id=e.id WHERE e.email_status!='qa-verified' AND e.created>=? AND COALESCE(w.stage,'New') NOT IN ('Won','Lost')"+access,args)
    items=[];counts=dict.fromkeys(('all',*REASONS),0)
    for row in rows:
        payload=json.loads(row['payload']);country=growth_workbench.country(payload)
        if market and country!=market:continue
        ref=row['id'];reasons=[];due=[]
        booking=db.execute('SELECT b.state,s.starts,s.duration FROM demo_bookings b LEFT JOIN demo_slots s ON s.id=b.slot_id WHERE b.enquiry_id=?',(ref,)).fetchone()
        record=sales_journey.record(db,ref)
        accepted=bool(db.execute("SELECT 1 FROM client_proposals WHERE reference=? AND status='accepted'",(ref,)).fetchone())
        proposed=bool(db.execute("SELECT 1 FROM client_proposals WHERE reference=? AND published>0 AND status='published'",(ref,)).fetchone())
        if not accepted:
            if record['outcome']=='Reschedule needed' or booking and booking['state']=='cancelled':reasons.append('reschedule');due.append(record.get('updated') or row['created'])
            elif record['outcome']=='No show':reasons.append('no_show');due.append((booking['starts'] if booking else None) or record.get('updated') or row['created'])
            elif booking and booking['state']=='confirmed' and booking['starts'] is not None and booking['starts']+booking['duration']*60<=now and record['outcome']=='Not recorded':
                reasons.append('attendance');due.append(booking['starts']+booking['duration']*60)
            elif not booking and not proposed and row['stage'] in ('New','Contacted','Qualified') and row['created']<=now-86400:reasons.append('unbooked');due.append(row['created']+86400)
        # Only the current published proposal is actionable; accepted, withdrawn,
        # superseded and draft revisions never create unanswered-proposal alerts.
        proposal=db.execute("SELECT id,title,published,expires FROM client_proposals WHERE reference=? AND status='published' AND published>0 AND published<=? ORDER BY revision DESC LIMIT 1",(ref,now-3*86400)).fetchone()
        if proposal:reasons.append('proposal');due.append(proposal['published']+3*86400)
        if not reasons:continue
        counts['all']+=1
        for reason in reasons:counts[reason]+=1
        if bucket!='all' and bucket not in reasons:continue
        items.append(dict(reference=ref,name=payload['name'],interest=payload['interest'],created=row['created'],country=country,countryLabel=growth_workbench.COUNTRIES[country],stage=row['stage'],owner=row['owner'],nextAction=row['next_action'],followUpDate=row['follow_up_date'],overdue=bool(row['follow_up_date'] and row['follow_up_date']<today),reasons=reasons,due=min(due),proposalExpired=bool(proposal and proposal['expires']<=now),suggestedAction=REASONS[reasons[0]][1]))
    items.sort(key=lambda item:(not item['overdue'],item['due'],item['reference']))
    return dict(items=items[offset:offset+25],counts=counts,total=len(items),offset=offset,limit=25,days=days,today=today,labels={key:value[0] for key,value in REASONS.items()},basis='Active, accessible enquiries received in the selected period. Unbooked means a New, Contacted or Qualified enquiry at least 24 hours old, without an appointment or published proposal. Accepted proposals suppress demo-chasing reasons. No-show requires a recorded outcome; a past demo with no outcome is listed separately. Current published proposals enter the decision queue after 72 hours, including expired proposals that need review. A published status means acceptance is not recorded; it does not prove that no offline reply occurred. A lead can have several reasons; All counts each lead once. Rescheduling resets old attendance outcomes. Closed, hidden QA and inaccessible leads are excluded. This queue does not send messages, confirm availability or change sales stages.')


def get(handler,connect,identity):
    parsed=urlsplit(handler.path)
    if parsed.path!='/api/admin/demo-recovery':return False
    if not identity:handler.respond(401,{'error':'Sign in to continue.'});return True
    try:
        with connect() as db:
            db.execute('BEGIN');result=queue(db,identity,parse_qs(parsed.query))
        handler.respond(200,result)
    except ValueError as error:handler.respond(400,{'error':str(error)})
    return True

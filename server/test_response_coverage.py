"""Temporary-record contact evidence, access boundaries and DST-aware coverage."""
import datetime as dt
import json
import secrets
import time
import unittest
import test_dashboard as isolated
import response_coverage as reports


class ResponseCoverageTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login

    def setUp(self):self.now=int(time.time());self.owner=secrets.token_hex(8)+'@example.test'

    def lead(self,country='US',age=2*86400,stage='New',owner=None,qa=False,qualification=True):
        ref='BG-'+secrets.token_hex(8).upper();data=dict(type='contact',name='Synthetic response '+ref,email='qa@example.test',phone='',interest='CRM & ERP Package',message='Synthetic requirements',source='/uk/travel-agency-crm/')
        if qualification:data['qualification']=dict(version=1,country=country)
        with isolated.enquiries.connect() as db:
            db.execute('INSERT INTO enquiries(id,created,payload,email_status) VALUES(?,?,?,?)',(ref,self.now-age,json.dumps(data),'qa-verified' if qa else 'sent'))
            db.execute('INSERT INTO enquiry_workflow(id,stage,owner) VALUES(?,?,?)',(ref,stage,self.owner if owner is None else owner))
        return ref,self.now-age

    def activity(self,ref,when,kind='email-sent'):
        with isolated.enquiries.connect() as db:db.execute('INSERT INTO lead_activity VALUES(?,?,?,?,?,?)',(secrets.token_hex(16),ref,when,self.owner,kind,'Synthetic actual contact record'))

    def report(self,**query):
        with isolated.enquiries.connect() as db:return reports.response_report(db,dict(role='agent',actor=self.owner),{key:[str(value)] for key,value in query.items()},self.now)

    def test_actual_contact_evidence_and_statistics_not_stage_or_acknowledgement(self):
        first,created=self.lead();self.activity(first,created-1);self.activity(first,created+7200);self.activity(first,created+3600,'call-connected');self.activity(first,self.now+1)
        for kind in ('note','call-no-answer','call-voicemail'):self.activity(first,created+30,kind)
        stage,created2=self.lead('GB',stage='Qualified')
        with isolated.enquiries.connect() as db:db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,'Qualified',?,?)",(stage,self.owner,created2+60))
        waiting,_=self.lead('IN');closed,closed_created=self.lead('IN',stage='Won');self.activity(closed,closed_created+10800)
        future,_=self.lead(age=-1);qa,_=self.lead(qa=True)
        result=self.report(bucket='all');s=result['summary'];self.assertEqual(s['enquiries'],4);self.assertEqual(s['contactRecorded'],2);self.assertEqual(s['medianSeconds'],7200);self.assertEqual(s['averageSeconds'],7200);self.assertEqual(s['withinTarget'],2);self.assertEqual(s['activeWaiting'],2);self.assertEqual(s['stageOnly'],1)
        items={item['reference']:item for item in result['items']};self.assertEqual(items[first]['responseSeconds'],3600);self.assertTrue(items[stage]['stageOnly']);self.assertNotIn(closed,items);self.assertNotIn(qa,items);self.assertNotIn(future,items)
        self.assertEqual([item['reference'] for item in self.report(country='GB')['items']],[stage]);self.assertEqual([item['reference'] for item in self.report(bucket='stage_only')['items']],[stage])

    def test_response_boundaries_unknown_country_pagination_and_no_writes(self):
        exact,_=self.lead(age=86400);older,_=self.lead(age=86401);self.lead(age=91*86400);self.lead(qualification=False)
        self.assertEqual({item['reference'] for item in self.report(bucket='overdue')['items']},{older,next(item['reference'] for item in self.report()['items'] if item['country']=='unknown')})
        self.assertEqual(self.report(country='unknown')['summary']['enquiries'],1)
        for _ in range(27):self.lead()
        result=self.report();self.assertEqual(len(result['items']),25);self.assertGreater(self.report(offset=25)['total'],25)
        with isolated.enquiries.connect() as db:
            before=db.total_changes;reports.response_report(db,dict(role='agent',actor=self.owner),{},self.now);reports.coverage_report(db,{},self.now);self.assertEqual(db.total_changes,before)
        for query in ({'hours':0},{'days':31},{'country':'XX'},{'bucket':'bad'},{'offset':-1},{'hours':'x'}):
            with self.assertRaises(ValueError):self.report(**query)

    def slot(self,stamp,duration=30,active=1,booked=False):
        stamp=int(dt.datetime.fromisoformat(stamp).timestamp()) if isinstance(stamp,str) else stamp;slot=secrets.token_hex(12)
        ref=self.lead()[0] if booked else None
        with isolated.enquiries.connect() as db:
            db.execute('INSERT INTO demo_slots VALUES(?,?,?,?,?)',(slot,stamp,duration,self.owner,active))
            if booked:
                db.execute("INSERT INTO demo_bookings VALUES(?,?,?,'confirmed',0)",(ref,slot,secrets.token_hex(32)))
        return slot

    def coverage(self,now,**query):
        with isolated.enquiries.connect() as db:return reports.coverage_report(db,{key:[str(value)] for key,value in query.items()},int(dt.datetime.fromisoformat(now).timestamp()))

    def test_coverage_dst_weekday_full_slot_boundaries_and_booked_exclusion(self):
        self.slot('2026-10-30T13:00:00+00:00') # 09:00 New York before US DST ends
        self.slot('2026-11-02T13:00:00+00:00') # 08:00 New York after DST: not covered
        self.slot('2026-11-02T14:00:00+00:00') # 09:00 New York after DST
        self.slot('2026-10-27T16:45:00+00:00',15) # ends at 17:00 London: fits
        self.slot('2026-10-27T16:46:00+00:00',15) # crosses 17:00 London: not covered
        self.slot('2026-10-31T14:00:00+00:00') # Saturday
        self.slot('2026-10-28T10:00:00+00:00',booked=True)
        self.slot('2026-10-28T11:00:00+00:00',active=0)
        self.slot('2026-10-25T12:00:00+00:00') # already past
        result=self.coverage('2026-10-26T00:00:00+00:00',horizon=14)
        rows={row['timezone']:row for row in result['rows']};ny=rows['America/New_York'];london=rows['Europe/London']
        ny_days={row['date']:row for row in ny['days']};self.assertEqual(ny_days['2026-10-30']['slots'],1);self.assertEqual(ny_days['2026-11-02']['slots'],1)
        london_days={row['date']:row for row in london['days']};self.assertEqual(london_days['2026-10-27']['slots'],1);self.assertEqual(london_days['2026-10-28']['slots'],0);self.assertNotIn('2026-10-31',london_days)
        self.assertEqual(len(result['rows']),9);self.assertEqual(len(self.coverage('2026-10-26T00:00:00+00:00',country='IN')['rows']),1)
        for query in ({'horizon':0},{'country':'XX'},{'horizon':'x'}):
            with self.assertRaises(ValueError):self.coverage('2026-10-26T00:00:00+00:00',**query)

    def test_coverage_public_limit_empty_days_and_local_today(self):
        # Only the first 100 unreserved slots are public; later slots must not
        # appear as bookable coverage before the public list exposes them.
        with isolated.enquiries.connect() as db:db.execute('DELETE FROM demo_bookings');db.execute('DELETE FROM demo_slots')
        start=int(dt.datetime.fromisoformat('2026-11-02T00:00:00+00:00').timestamp())
        for i in range(100):self.slot(start+i*60,15)
        self.slot('2026-11-02T14:00:00+00:00')
        result=self.coverage('2026-11-01T23:00:00+00:00',horizon=7);self.assertTrue(result['publicLimitReached']);self.assertEqual(result['publicSlotsConsidered'],100)
        ny=next(row for row in result['rows'] if row['timezone']=='America/New_York');self.assertEqual(ny['slots'],0);self.assertEqual(ny['fromDate'],'2026-11-01')
        india=next(row for row in result['rows'] if row['country']=='IN');self.assertEqual(india['fromDate'],'2026-11-02')
        ended=self.coverage('2026-11-02T18:00:00+00:00',country='GB',horizon=7)['rows'][0]
        self.assertTrue(ended['days'][0]['elapsed']);self.assertNotIn('2026-11-02',ended['gaps']);self.assertEqual(ended['weekdays'],4)

    def test_http_roles_current_ownership_and_private_asset_headers(self):
        first,_=self.lead(owner='');other,_=self.lead('IN',owner='someone-else@example.test');own,_=self.lead('GB')
        cookie,_=self.login()
        self.assertEqual(self.request('/api/admin/response-times')[0],401);self.assertEqual(self.request('/api/admin/demo-coverage')[0],401)
        self.assertEqual(self.request('/api/admin/response-times?hours=99',cookie=cookie)[0],400);self.assertEqual(self.request('/api/admin/demo-coverage?country=other',cookie=cookie)[0],400)
        self.assertEqual(self.request('/api/admin/demo-coverage',cookie=cookie)[0],200)
        password='Synthetic-access-only';email=self.owner
        with isolated.enquiries.connect() as db:db.execute('INSERT INTO team_users VALUES(?,?,?,?,1)',(email,'Synthetic agent','agent',isolated.dashboard.password_hash(password)))
        status,result,headers=self.request('/api/admin/login',dict(email=email,password=password));self.assertEqual(status,200);agent_cookie=headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.request('/api/admin/demo-coverage',cookie=agent_cookie)[0],403)
        status,result,_=self.request('/api/admin/response-times',cookie=agent_cookie);self.assertEqual(status,200);refs={row['reference'] for row in result['items']};self.assertIn(own,refs);self.assertNotIn(first,refs);self.assertNotIn(other,refs)
        with isolated.enquiries.connect() as db:db.execute('UPDATE enquiry_workflow SET owner=? WHERE id=?',('someone-else@example.test',own))
        self.assertEqual(self.request('/api/admin/response-times',cookie=agent_cookie)[1]['total'],0)
        with isolated.enquiries.connect() as db:db.execute("UPDATE team_users SET role='manager' WHERE email=?",(email,))
        self.assertEqual(self.request('/api/admin/demo-coverage',cookie=agent_cookie)[0],200)
        request=isolated.urllib.request.Request(isolated.base+'/team-inbox/response-coverage.js')
        with isolated.urllib.request.urlopen(request) as response:
            self.assertEqual(response.status,200);self.assertEqual(response.headers['Cache-Control'],'no-store');self.assertEqual(response.headers['Referrer-Policy'],'no-referrer');self.assertIn("script-src 'self'",response.headers['Content-Security-Policy'])


if __name__=='__main__':
    try:result=unittest.main(exit=False).result
    finally:isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

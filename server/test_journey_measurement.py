"""Isolated measurement privacy, cohort and staff-access regressions."""
import json,time,unittest,uuid
import test_dashboard as fixture
import enquiries,journey_measurement

class JourneyTests(unittest.TestCase):
    request=fixture.DashboardTests.request
    login=fixture.DashboardTests.login
    def setUp(self):
        with enquiries.connect() as db:
            db.execute('DELETE FROM journey_events');db.execute('DELETE FROM journey_limits')
    def payload(self,**kw):
        return dict(journey=str(uuid.uuid4()),event='start',reason='',page='/contact-us/',form='contact',channel='direct_unknown',**kw)
    def test_exact_nginx_route_preserves_existing_config(self):
        import journey_route
        original='server {\n    root /srv/bandeviglobalgroup/app;\n'+journey_route.MARKER+'    location = /api/enquiries { proxy_pass http://127.0.0.1:8766; }\n}\n'
        updated=journey_route.updated_config(original)
        self.assertEqual(updated.replace(journey_route.ROUTE,''),original)
        self.assertEqual(journey_route.updated_config(updated),updated)
        self.assertIn('access_log off;',updated);self.assertIn('proxy_set_header Cookie "";',updated)
        with self.assertRaises(ValueError):journey_route.updated_config(original.replace('/srv/bandeviglobalgroup/app','/opt/theholidaysgroup-travel'))
    def test_ingest_privacy_and_idempotence(self):
        p=self.payload()
        for _ in range(2):self.assertEqual(self.request('/api/measurement',p)[0],200)
        self.assertEqual(self.request('/api/measurement',dict(p,event='saved'))[0],200)
        self.assertEqual(self.request('/api/measurement',dict(p,page='/crm-demo/'))[0],409)
        with enquiries.connect() as db:self.assertEqual(db.execute('SELECT COUNT(*) FROM journey_events').fetchone()[0],2)
        for field,value in [('email','private@example.test'),('reason','private@example.test'),('page','/contact-us/?email=private@example.test'),('page','/team-inbox/'),('journey','BG-1234567890ABCDEF'),('event','custom'),('channel','private')]:
            self.assertEqual(self.request('/api/measurement',dict(p,**{field:value}))[0],400)
        self.assertEqual(self.request('/api/measurement',p,origin='https://evil.example')[0],403)
        cookie,_=self.login();r=self.request('/api/admin/journey-report?days=30',cookie=cookie)[1]
        self.assertEqual((r['pages'][0]['started'],r['pages'][0]['saved'],r['pages'][0]['notSaved']),(1,1,0))
        self.assertNotIn(p['journey'],json.dumps(r));self.assertNotIn('private@example.test',json.dumps(r))
    def test_cohort_errors_clicks_retention_and_limits(self):
        p=self.payload();self.request('/api/measurement',p)
        for event,reason in [('invalid','required'),('failed','network')]:self.request('/api/measurement',dict(p,event=event,reason=reason))
        self.request('/api/measurement',dict(self.payload(),event='whatsapp_click',form='none'))
        old=self.payload();self.request('/api/measurement',old)
        with enquiries.connect() as db:
            db.execute('UPDATE journey_events SET created=? WHERE journey=?',(int(time.time())-91*86400,old['journey']))
        cookie,_=self.login();r=self.request('/api/admin/journey-report?days=7',cookie=cookie)[1]
        self.assertEqual((r['pages'][0]['started'],r['pages'][0]['saved'],r['pages'][0]['notSaved'],r['pages'][0]['validation'],r['pages'][0]['failed']),(1,0,1,1,1))
        self.assertEqual(r['clicks']['whatsapp_click'],1);self.assertEqual(len(r['errors']),2)
        with enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM journey_events WHERE journey=?',(old['journey'],)).fetchone()[0],0)
            import hashlib
            key=hashlib.sha256((enquiries.SALT+'rate-test').encode()).hexdigest()
            db.executemany('INSERT INTO journey_limits VALUES(?,?)',[(key,int(time.time()))]*120)
        self.assertEqual(self.request('/api/measurement',self.payload(),ip='rate-test')[0],429)
    def test_response_times_and_agent_boundary(self):
        cookie,csrf=self.login();now=int(time.time())
        self.assertEqual(self.request('/api/admin/journey-report')[0],401)
        self.assertEqual(self.request('/api/admin/journey-report?days=1',cookie=cookie)[0],400)
        with enquiries.connect() as db:
            db.execute('DELETE FROM enquiries');db.execute('DELETE FROM enquiry_workflow');db.execute('DELETE FROM lead_activity');db.execute('DELETE FROM sales_events')
            for ref,age,qa in [('BG-OWNED',3600,False),('BG-OTHER',7200,False),('BG-QA',10000,True)]:
                db.execute('INSERT INTO enquiries(id,created,payload,email_status) VALUES(?,?,?,?)',(ref,now-age,json.dumps({'email':'private@example.test','name':'Private person'}),'qa-verified' if qa else 'pending'))
            db.execute("INSERT INTO enquiry_workflow(id,owner,updated) VALUES('BG-OWNED','agent@example.test',?)",(now,))
            db.execute("INSERT INTO lead_activity VALUES('a','BG-OWNED',?,'staff','note','private note')",(now-3500,))
            db.execute("INSERT INTO lead_activity VALUES('b','BG-OWNED',?,'staff','call-no-answer','private note')",(now-3400,))
            db.execute("INSERT INTO lead_activity VALUES('c','BG-OWNED',?,'staff','email-sent','private note')",(now-1800,))
            db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES('BG-OWNED','Contacted','staff',?)",(now-900,))
        self.request('/api/measurement',self.payload())
        r=self.request('/api/admin/journey-report?days=30',cookie=cookie)[1]
        self.assertEqual((r['response']['enquiries'],r['response']['recordedContact'],r['response']['noRecordedContact'],r['response']['medianSeconds']),(2,1,1,1800))
        self.assertTrue(r['websiteVisible']);self.assertNotIn('private',json.dumps(r).lower())
        self.assertEqual(self.request('/api/admin/team',dict(email='agent@example.test',name='Agent',role='agent',password='Long-test-password-1234',active=True),cookie,csrf)[0],200)
        status,identity,headers=self.request('/api/admin/login',dict(email='agent@example.test',password='Long-test-password-1234'))
        self.assertEqual(status,200);agent=headers['Set-Cookie'].split(';')[0]
        r=self.request('/api/admin/journey-report?days=30',cookie=agent)[1]
        self.assertFalse(r['websiteVisible']);self.assertEqual(r['pages'],[]);self.assertEqual(r['response']['enquiries'],1)
        self.assertEqual(r['waiting'],[])
    def test_waiting_queue_excludes_closed_and_scopes_agents(self):
        cookie,csrf=self.login();now=int(time.time())
        with enquiries.connect() as db:
            db.execute('DELETE FROM enquiries');db.execute('DELETE FROM enquiry_workflow');db.execute('DELETE FROM lead_activity');db.execute('DELETE FROM sales_events')
            for ref,stage,owner,age in [('BG-WAIT','New','agent@example.test',90000),('BG-UNASSIGNED','New','',3600),('BG-CLOSED','Won','',120000),('BG-OTHER','New','other@example.test',7200)]:
                db.execute('INSERT INTO enquiries(id,created,payload,email_status) VALUES(?,?,?,?)',(ref,now-age,'{}','pending'))
                db.execute('INSERT INTO enquiry_workflow(id,stage,owner,updated) VALUES(?,?,?,?)',(ref,stage,owner,now))
        r=self.request('/api/admin/journey-report?days=30',cookie=cookie)[1]
        self.assertEqual([x['reference'] for x in r['waiting']],['BG-WAIT','BG-OTHER','BG-UNASSIGNED'])
        self.assertEqual((r['response']['activeUnassigned'],r['response']['activeWaiting'],r['response']['waitingOver24Hours']),(1,3,1))
        self.request('/api/admin/team',dict(email='agent@example.test',name='Agent',role='agent',password='Long-test-password-1234',active=True),cookie,csrf)
        status,identity,headers=self.request('/api/admin/login',dict(email='agent@example.test',password='Long-test-password-1234'))
        r=self.request('/api/admin/journey-report?days=30',cookie=headers['Set-Cookie'].split(';')[0])[1]
        self.assertEqual([x['reference'] for x in r['waiting']],['BG-WAIT']);self.assertEqual(r['response']['activeUnassigned'],0)
    def test_do_not_track_ignores_measurement(self):
        import urllib.request
        p=self.payload();req=urllib.request.Request(fixture.base+'/api/measurement',data=json.dumps(p).encode(),headers={'Origin':'http://127.0.0.1:8765','Content-Type':'application/json','DNT':'1'})
        with urllib.request.urlopen(req) as response:self.assertTrue(json.load(response)['ignored'])
        with enquiries.connect() as db:self.assertEqual(db.execute('SELECT COUNT(*) FROM journey_events').fetchone()[0],0)

if __name__=='__main__':
    try:result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(JourneyTests))
    finally:fixture.server.shutdown();fixture.server.server_close();fixture.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

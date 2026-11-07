"""Synthetic country-cohort reporting. No production records or email worker."""
import json,time,unittest,uuid
import test_dashboard as isolated
import sales_journey

class MarketReportingTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login
    def setUp(self):
        self.cookie,self.csrf=self.login();self.owner=uuid.uuid4().hex+'@example.test'

    def lead(self,country=None,**changes):
        data=dict(type='contact',name='Synthetic market',email='qa@example.test',phone='+1 202 555 0148',interest='CRM',message='Business country: United States',source='/us/software-development/')
        if country:
            data['qualification']=dict(version=1,country=country,currency={'US':'USD','GB':'GBP','IN':'INR','other':'EUR'}[country],budget='To discuss',contact=dict(channel='Email',date='',time='',timezone='Asia/Kolkata'))
        status,result,_=self.request('/api/enquiries',data);self.assertEqual(status,201);ref=result['reference']
        with isolated.enquiries.connect() as db:
            db.execute("INSERT INTO enquiry_workflow(id,owner,stage) VALUES(?,?,'New')",(ref,self.owner))
            for key,value in changes.items():db.execute('UPDATE enquiries SET '+key+'=? WHERE id=?',(value,ref))
        return ref

    def report(self):
        with isolated.enquiries.connect() as db:return sales_journey.funnel(db,{'role':'agent','actor':self.owner},30)

    def test_proposal_decisions_use_publication_dates_revisions_and_current_owner(self):
        now=int(time.time());day=86400
        us=self.lead('US',created=now-100*day)
        gb=self.lead('GB',created=now-15*day)
        qa=self.lead('IN',email_status='qa-verified')
        reassigned=self.lead('IN');unknown=self.lead()
        def revision(db,ref,number,age,status,accepted=None):
            pid=uuid.uuid4().hex
            published=0 if age is None else now-age*day
            db.execute('''INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,status,created,actor,accepted,published)
                VALUES(?,?,?,'Synthetic title','Test scope','Test terms',100,'USD',?,?,?,?,?,?)''',
                       (pid,ref,number,now+day,status,published or now,self.owner,accepted,published))
            return pid
        with isolated.enquiries.connect() as db:
            first=revision(db,us,1,10,'superseded')
            revision(db,us,2,8,'accepted',now-6*day)
            revision(db,us,3,None,'draft')
            revision(db,gb,1,10,'superseded')
            revision(db,gb,2,8,'withdrawn')
            revision(db,gb,3,1,'published')
            db.execute("UPDATE enquiry_workflow SET stage='Lost' WHERE id=?",(gb,))
            db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,'Lost',?,?)",(gb,self.owner,now-3*day))
            revision(db,qa,1,3,'accepted',now-day)
            revision(db,reassigned,1,3,'published')
            revision(db,reassigned,2,31,'withdrawn')
            db.execute("UPDATE enquiry_workflow SET owner='someone-else@example.test' WHERE id=?",(reassigned,))
            revision(db,unknown,1,2,'published')
            for index,(kind,age) in enumerate([('change',9),('change',8),('question',8),('change',11),('change',-1)]):
                ticket=uuid.uuid4().hex
                db.execute("INSERT INTO client_tickets(id,reference,subject,priority,owner,created,due) VALUES(?,?,'Synthetic feedback','Normal',?,?,?)",
                           (ticket,us,self.owner,now-age*day,now+day))
                db.execute('INSERT INTO client_proposal_feedback VALUES(?,?,?,?,?)',(ticket,first,kind,str(index),'test'))
        groups={group['country']:group for group in self.report()['proposalDecisions']}
        metrics=('published','accepted','lost','withoutDecision','acceptanceRate','changeRequests','revisionsWithChanges','medianDecisionSeconds')
        self.assertEqual(tuple(groups['US'][key] for key in metrics),(2,1,0,1,50.0,2,1,2*day))
        self.assertEqual(tuple(groups['GB'][key] for key in metrics),(3,0,1,2,0.0,0,0,5*day))
        self.assertEqual(tuple(groups['IN'][key] for key in metrics),(0,0,0,0,None,0,0,None))
        with isolated.enquiries.connect() as db:
            db.execute("UPDATE enquiry_workflow SET stage='Proposal' WHERE id=?",(gb,))
            short=sales_journey.proposal_decisions(db,{'role':'agent','actor':self.owner},now-7*day,now)
            self.assertEqual([(group['country'],group['published'],group['decided']) for group in short], [('US',0,0),('GB',1,0),('IN',0,0)])
        self.assertNotIn(us,json.dumps(groups))

    def test_attendance_by_business_country_uses_current_booking_and_schedule(self):
        cases = [('US','confirmed','No show'),('GB','cancelled','Completed'),('IN','confirmed','Completed')]
        for country, state, outcome in cases:
            ref = self.lead(country)
            slot = uuid.uuid4().hex
            now = int(time.time())
            with isolated.enquiries.connect() as db:
                db.execute('INSERT INTO demo_bookings(enquiry_id,slot_id,token_digest,state) VALUES(?,?,?,?)', (ref,slot,uuid.uuid4().hex,state))
                event = db.execute("INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,?,'confirmed',?,30,?,?)",
                                   (ref,slot,now-60,self.owner,now)).lastrowid
                db.execute('INSERT INTO sales_demo_records VALUES(?,?,?,?,?,?,?)', (ref,'Test workflow',outcome,event,1,now,self.owner))
                db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,'Qualified',?,?)", (ref,self.owner,now))
        groups = {row['country']:row['counts'] for row in self.report()['markets']}
        for market, expected in [('US',(0,0,1)),('GB',(0,1,0)),('IN',(1,0,0))]:
            with self.subTest(market=market):
                counts = groups[market]
                self.assertEqual((counts['demoBooked'],counts['qualified']), (1,1))
                self.assertEqual(tuple(counts[key] for key in ('demoCompleted','demoCancelled','demoNoShow')), expected)

    def test_explicit_country_unique_milestones_and_no_phone_currency_inference(self):
        refs={c:self.lead(c) for c in ('US','GB','IN','other')};legacy=self.lead();now=int(time.time())
        with isolated.enquiries.connect() as db:
            payload=json.loads(db.execute('SELECT payload FROM enquiries WHERE id=?',(legacy,)).fetchone()[0]);payload.update(country='US',currency='USD')
            db.execute('UPDATE enquiries SET payload=? WHERE id=?',(json.dumps(payload),legacy))
            ref=refs['IN']
            for event in ('confirmed','rescheduled'):
                db.execute('INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,?,?,?,30,?,?)',(ref,'test-'+event,event,now,self.owner,now))
            for revision in (1,2):
                db.execute("INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,status,created,actor,published) VALUES(?,?,?,'Test','Test','Test',100,'INR',?,'published',?,?,?)",(uuid.uuid4().hex,ref,revision,now+86400,now,self.owner,now))
            for stage in ('Qualified','Qualified','Won'):db.execute('INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,?,?,?)',(ref,stage,self.owner,now))
            db.execute("UPDATE enquiry_workflow SET stage='Won' WHERE id=?",(ref,))
        result=self.report();groups={m['country']:m for m in result['markets']};self.assertEqual(result['counts']['enquiries'],5)
        self.assertTrue(all(m['counts']['enquiries']==1 for m in groups.values()))
        india=groups['IN'];self.assertEqual(india['counts']['qualified'],1);self.assertEqual(india['counts']['publishedProposals'],1)
        self.assertEqual(india['counts']['demoBooked'],1);self.assertEqual(india['counts']['wonAfterDemoProposal'],1)
        self.assertEqual(india['rates'],dict(enquiryToDemo=100.0,demoToProposal=100.0,proposalToWon=100.0,enquiryToWon=100.0))
        self.assertIsNone(groups['US']['rates']['proposalToWon'])
        text=json.dumps(result);self.assertNotIn('qa@example.test',text);self.assertNotIn('+1 202',text);self.assertNotIn('To discuss',text)

    def test_portfolio_outcomes_use_saved_project_and_staff_access(self):
        cases=(('US','trip_sarathi'),('GB','trip_sarathi'),('IN','tripodeal'),('IN',None))
        refs=[]
        for country,project in cases:
            brief=dict(service='Travel technology',businessType='',problem='Plan a public travel portal',
                       features='',budget='Not sure yet',launchDate='')
            if project:
                brief['portfolioProject']=project
            data=dict(type='contact',name='Synthetic buyer',email='qa@example.test',
                      interest='Travel Technology Planning',source='/project-brief/',
                      message='Guided project brief',projectBrief=brief,
                      attribution=dict(channel='direct_unknown',industry='travel' if country!='GB' else 'retail',
                                       industry_need='crm' if country!='GB' else 'orders',
                                       home_service='crm-erp' if country=='US' else 'unlisted'),
                      qualification=dict(version=1,country=country,currency={'US':'USD','GB':'GBP','IN':'INR'}[country],
                                         budget='To discuss',contact=dict(channel='Email',date='',time='',timezone='UTC')))
            status,result,_=self.request('/api/enquiries',data)
            self.assertEqual(status,201,result)
            refs.append(result['reference'])
        entry=self.request('/api/admin/enquiries?q='+refs[0],cookie=self.cookie)[1]['items'][0]
        self.assertEqual(entry['details']['projectBrief']['portfolioProject'],'trip_sarathi')
        self.assertEqual(entry['details']['attribution']['industry'],'travel')
        self.assertEqual(entry['details']['attribution']['industry_need'],'crm')
        now=int(time.time())
        with isolated.enquiries.connect() as db:
            for ref in refs:
                db.execute("INSERT INTO enquiry_workflow(id,owner,stage) VALUES(?,?,'New')",(ref,self.owner))
            ref=refs[0]
            for _ in range(2):
                db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,'Qualified',?,?)",(ref,self.owner,now))
            db.execute("INSERT INTO sales_demo_records(reference,outcome,updated,actor) VALUES(?,'Completed',?,?)",(ref,now,self.owner))
            db.execute("UPDATE enquiries SET email_status='qa-verified' WHERE id=?",(refs[2],))
        groups={(group['project'],group['country']):group for group in self.report()['portfolio']}
        self.assertEqual(set(groups),{('trip_sarathi','US'),('trip_sarathi','GB')})
        for country,outcomes in [('US',(1,1,1)),('GB',(1,0,0))]:
            group=groups['trip_sarathi',country]
            self.assertEqual(tuple(group[key] for key in ('enquiries','qualified','demoCompleted')),outcomes)
        industries={(group['industry'],group['country']):group for group in self.report()['industries']}
        self.assertEqual(set(industries),{('travel','US'),('retail','GB'),('travel','IN')})
        for key,outcomes in [(('travel','US'),(1,1,1)),(('retail','GB'),(1,0,0)),(('travel','IN'),(1,0,0))]:
            group=industries[key]
            self.assertEqual(tuple(group[k] for k in ('enquiries','qualified','demoCompleted')),outcomes)
        home=self.report()['homeServices']
        self.assertEqual([(g['service'],g['country'],g['enquiries'],g['qualified'],g['demoCompleted']) for g in home],
                         [('crm-erp','US',1,1,1)])
        with isolated.enquiries.connect() as db:
            db.execute("UPDATE enquiry_workflow SET owner='another@example.test' WHERE id=?",(refs[0],))
        self.assertEqual([group['country'] for group in self.report()['portfolio']],['GB'])
        self.assertEqual(self.report()['homeServices'],[])

    def test_role_qa_cohort_and_empty_market_boundaries(self):
        ref=self.lead('US');self.lead('IN',email_status='qa-verified');self.lead('GB',created=int(time.time())-91*86400)
        other=self.lead('GB')
        password='Synthetic-market-password-'+uuid.uuid4().hex
        self.assertEqual(self.request('/api/admin/team',dict(email=self.owner,name='Synthetic agent',role='agent',password=password,active=True),self.cookie,self.csrf)[0],200)
        with isolated.enquiries.connect() as db:db.execute("UPDATE enquiry_workflow SET owner='another@example.test' WHERE id=?",(other,))
        _,identity,headers=self.request('/api/admin/login',dict(email=self.owner,password=password));cookie=headers['Set-Cookie'].split(';')[0]
        r=self.request('/api/admin/sales-funnel?days=30',cookie=cookie)[1];groups={m['country']:m for m in r['markets']}
        self.assertEqual(r['counts']['enquiries'],1);self.assertEqual(groups['US']['counts']['enquiries'],1)
        self.assertEqual(groups['GB']['counts']['enquiries'],0);self.assertEqual(groups['IN']['counts']['enquiries'],0)
        self.assertTrue(all(value is None for value in groups['IN']['rates'].values()))
        self.assertEqual(self.request('/api/admin/sales-funnel?days=30')[0],401)
        self.assertEqual(self.request('/api/admin/sales-funnel?days=31',cookie=cookie)[0],400)

if __name__=='__main__':
    try:unittest.main()
    finally:isolated.server.shutdown();isolated.server.server_close()

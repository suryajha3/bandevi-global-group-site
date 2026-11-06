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

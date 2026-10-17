"""Isolated review persistence and country/campaign sales cohorts; no mail worker."""
import copy
import json
import time
import unittest
import uuid
import test_dashboard as isolated
import sales_journey


class ReviewCampaignTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login

    def setUp(self):
        self.owner=uuid.uuid4().hex+'@example.test'

    def data(self,country='US',review=True,campaign='agency_crm'):
        data=dict(type='contact',name='Synthetic review',email='qa@example.test',phone='',interest='CRM & ERP Package',
                  source='/'+{'US':'us','GB':'uk','IN':'india'}.get(country,'us')+'/software-development/',message='Review our workflow.')
        if country:
            data['qualification']=dict(version=1,country=country,currency={'US':'USD','GB':'GBP','IN':'INR','other':'EUR'}[country],budget='',
                                       contact=dict(channel='Email',date='',time='',timezone='Asia/Kolkata'))
        if review:data['crmReview']=dict(version=1,tools='Spreadsheets and email',teamSize='6-20',challenge='Missed follow-ups',integrations='Accounting tool')
        data['attribution']=dict(channel='paid',utm_source='google',utm_medium='cpc',utm_campaign=campaign,landing_page=data['source'],referrer_domain='')
        return data

    def lead(self,data,**changes):
        status,result,_=self.request('/api/enquiries',data);self.assertEqual(status,201,result);ref=result['reference']
        with isolated.enquiries.connect() as db:
            db.execute("INSERT INTO enquiry_workflow(id,owner,stage) VALUES(?,?,'New')",(ref,self.owner))
            for key,value in changes.items():db.execute('UPDATE enquiries SET '+key+'=? WHERE id=?',(value,ref))
        return ref

    def report(self):
        with isolated.enquiries.connect() as db:return sales_journey.funnel(db,dict(role='agent',actor=self.owner),30)

    def test_review_saved_for_three_markets_and_not_automatically_qualified(self):
        for country in ('US','GB','IN'):
            data=self.data(country);ref=self.lead(data)
            with isolated.enquiries.connect() as db:
                payload=json.loads(db.execute('SELECT payload FROM enquiries WHERE id=?',(ref,)).fetchone()[0])
                self.assertEqual(payload['crmReview'],data['crmReview']);self.assertEqual(payload['message'].count('CRM workflow review requested'),1)
                self.assertIn('Main workflow problem: Missed follow-ups',payload['message'])
                self.assertEqual(db.execute('SELECT COUNT(*) FROM demo_bookings WHERE enquiry_id=?',(ref,)).fetchone()[0],0)
        groups=self.report()['campaigns'];self.assertEqual(sum(g['counts']['crmReviewRequests'] for g in groups),3)
        self.assertEqual(sum(g['counts']['qualified'] for g in groups),0)
        self.assertEqual({g['country'] for g in groups},{'US','GB','IN'})

    def test_invalid_reviews_rejected_atomically_and_legacy_form_still_works(self):
        valid=self.data();variants=[]
        for key,value in [('tools',' '),('teamSize','500'),('challenge',''),('integrations','a'*301),('version',True),('tools',None),('challenge','bad\x00text')]:
            data=copy.deepcopy(valid);data['crmReview'][key]=value;variants.append(data)
        data=copy.deepcopy(valid);data['crmReview']['extra']='x';variants.append(data)
        for key,value in [('source','/contact-us/'),('type','demo'),('interest','Travel ERP Package'),('message','x'*3000)]:
            data=copy.deepcopy(valid);data[key]=value;variants.append(data)
        data=copy.deepcopy(valid);del data['qualification'];variants.append(data)
        with isolated.enquiries.connect() as db:before=db.execute('SELECT COUNT(*) FROM enquiries').fetchone()[0]
        for data in variants:self.assertEqual(self.request('/api/enquiries',data)[0],400)
        with isolated.enquiries.connect() as db:self.assertEqual(db.execute('SELECT COUNT(*) FROM enquiries').fetchone()[0],before)
        data=self.data(review=False);ref=self.lead(data)
        with isolated.enquiries.connect() as db:self.assertNotIn('crmReview',json.loads(db.execute('SELECT payload FROM enquiries WHERE id=?',(ref,)).fetchone()[0]))

    def test_retry_does_not_duplicate_review(self):
        data=self.data('GB');key=str(uuid.uuid4())
        first=self.request('/api/enquiries',data,key=key);second=self.request('/api/enquiries',data,key=key)
        self.assertEqual(first[0],201);self.assertEqual(second[1]['reference'],first[1]['reference'])
        with isolated.enquiries.connect() as db:
            payload=json.loads(db.execute('SELECT payload FROM enquiries WHERE id=?',(first[1]['reference'],)).fetchone()[0])
            self.assertEqual(payload['message'].count('CRM workflow review requested'),1)

    def test_campaign_milestones_currency_values_and_missing_values(self):
        us=[self.lead(self.data()) for _ in range(3)];self.lead(self.data('GB'));self.lead(self.data('IN'));now=int(time.time())
        with isolated.enquiries.connect() as db:
            for index,ref in enumerate(us):
                db.execute("UPDATE enquiry_workflow SET stage='Won' WHERE id=?",(ref,))
                for stage in ('Qualified','Qualified','Won'):db.execute('INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,?,?,?)',(ref,stage,self.owner,now))
                for event in ('confirmed','rescheduled'):db.execute('INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,?,?,?,30,?,?)',(ref,event,event,now-30,self.owner,now))
                schedule=sales_journey.schedule_event(db,ref)
                db.execute('INSERT INTO sales_demo_records VALUES(?,?,?,?,?,?,?)',(ref,'Reviewed','Completed',schedule,1,now,self.owner))
                for revision in (1,2):db.execute("INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,status,created,actor,published) VALUES(?,?,?,'Test','Test','Test',999,'INR',?,'published',?,?,?)",(uuid.uuid4().hex,ref,revision,now+1000,now,self.owner,now))
            db.execute('INSERT INTO deal_values VALUES(?,?,?)',(us[0],12000,'USD'));db.execute('INSERT INTO deal_values VALUES(?,?,?)',(us[1],3000,'GBP'))
        result=self.report();group=next(g for g in result['campaigns'] if g['country']=='US')
        for key in ('enquiries','qualified','demoBooked','demoCompleted','publishedProposals','currentlyWon','crmReviewRequests'):self.assertEqual(group['counts'][key],3,key)
        self.assertEqual(group['wonWithoutValue'],1);self.assertEqual(group['wonValueByCurrency'],[dict(currency='GBP',minorUnits=3000,deals=1),dict(currency='USD',minorUnits=12000,deals=1)])
        self.assertEqual(group['rates']['enquiryToWon'],100.0)
        with isolated.enquiries.connect() as db:db.execute("UPDATE enquiry_workflow SET stage='Contacted' WHERE id=?",(us[0],))
        group=next(g for g in self.report()['campaigns'] if g['country']=='US');self.assertEqual(group['counts']['currentlyWon'],2)
        self.assertEqual(len(group['wonValueByCurrency']),1)
        self.assertNotIn('qa@example.test',json.dumps(result));self.assertNotIn('Missed follow-ups',json.dumps(result))

    def test_unknown_untagged_role_qa_and_date_boundaries(self):
        self.lead(self.data(campaign=''));self.lead(self.data(None,False,'travel_agency_crm_us'))
        self.lead(self.data('IN'),email_status='qa-verified');self.lead(self.data('GB'),created=int(time.time())-91*86400)
        other=self.lead(self.data('GB'))
        with isolated.enquiries.connect() as db:db.execute("UPDATE enquiry_workflow SET owner='other@example.test' WHERE id=?",(other,))
        result=self.report();self.assertEqual(sum(g['counts']['enquiries'] for g in result['campaigns']),2)
        self.assertEqual({(g['country'],g['campaign']) for g in result['campaigns']},{('US',''),('unknown','travel_agency_crm_us')})
        self.assertEqual(self.request('/api/admin/sales-funnel?days=30')[0],401)
        password='Synthetic-'+uuid.uuid4().hex;cookie,csrf=self.login()
        self.assertEqual(self.request('/api/admin/team',dict(email=self.owner,name='Synthetic',role='agent',password=password,active=True),cookie,csrf)[0],200)
        _,_,headers=self.request('/api/admin/login',dict(email=self.owner,password=password));agent=headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.request('/api/admin/sales-funnel?days=30',cookie=agent)[1]['campaigns'],result['campaigns'])
        self.assertEqual(self.request('/api/admin/sales-funnel?days=31',cookie=agent)[0],400)


if __name__=='__main__':
    try:unittest.main()
    finally:isolated.server.shutdown();isolated.server.server_close()

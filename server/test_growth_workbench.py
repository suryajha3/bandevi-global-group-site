"""Synthetic review queues and daily-cost accounting; no ad platform or email worker."""
import datetime as dt
import json
import time
import unittest
import uuid
from zoneinfo import ZoneInfo
import test_dashboard as isolated
import growth_workbench as growth


class GrowthTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login

    def setUp(self):
        self.cookie,self.csrf=self.login();self.actor=uuid.uuid4().hex+'@example.test';self.campaign='test_'+uuid.uuid4().hex

    def post(self,data,cookie=None,csrf=None):return self.request('/api/admin/campaign-costs',data,self.cookie if cookie is None else cookie,self.csrf if csrf is None else csrf)

    def lead(self,country='US',review=True,created=None,landing='/us/software-development/',stage='New',qa=False):
        data=dict(type='contact',name='Synthetic review',email='qa@example.test',interest='CRM & ERP Package',message='Synthetic',source=landing,
                  qualification=dict(version=1,country=country,currency={'US':'USD','GB':'GBP','IN':'INR','other':'EUR'}[country],budget='',contact=dict(channel='Email',date='',time='',timezone='Asia/Kolkata')),
                  attribution=dict(channel='paid',utm_source='google',utm_medium='cpc',utm_campaign=self.campaign,landing_page=landing,referrer_domain=''))
        if review:data['crmReview']=dict(version=1,tools='Sheets',teamSize='1-5',challenge='Missed follow-up',integrations='')
        status,result,_=self.request('/api/enquiries',data);self.assertEqual(status,201,result);ref=result['reference'];stamp=created if created is not None else int(time.time())
        with isolated.enquiries.connect() as db:
            db.execute('UPDATE enquiries SET created=?,email_status=? WHERE id=?',(stamp,'qa-verified' if qa else 'sent',ref))
            db.execute('INSERT INTO enquiry_workflow(id,owner,stage) VALUES(?,?,?)',(ref,self.actor,stage))
        return ref

    def profile(self,country='US',currency='USD',zone='UTC'):
        data=dict(action='profile',requestId=str(uuid.uuid4()),country=country,campaign=self.campaign,source='google',medium='cpc',currency=currency,timezone=zone,accountLabel='Synthetic account')
        status,result,_=self.post(data);self.assertEqual(status,200,result);return result['profileId'],data

    def entries(self,pid,rows):return dict(action='entries',requestId=str(uuid.uuid4()),profileId=pid,entries=rows)

    def test_review_queue_scopes_overdue_contact_and_completion(self):
        old=int(time.time())-3*86400;us=self.lead(created=old);contacted=self.lead(created=old);self.lead('GB');self.lead('IN',qa=True);self.lead(review=False);closed=self.lead(stage='Won')
        with isolated.enquiries.connect() as db:
            db.execute("INSERT INTO lead_activity VALUES(?,?,?,?,'call-connected','Synthetic contact')",(str(uuid.uuid4()),contacted,old+1,self.actor))
            db.execute("UPDATE enquiry_workflow SET next_action='Review',follow_up_date='2099-01-01' WHERE id=?",(contacted,))
            report=growth.review_queue(db,dict(role='agent',actor=self.actor),{})
        self.assertEqual(report['total'],3);self.assertEqual(report['counts']['overdue'],1);self.assertNotIn(closed,[r['reference'] for r in report['items']])
        self.assertEqual(self.request('/api/admin/review-queue')[0],401)
        request=dict(reference=us,status='Reviewed',summary='',version=0)
        self.assertEqual(self.request('/api/admin/review-queue',request,self.cookie,self.csrf)[0],400)
        request['summary']='Reviewed tools and agreed next discussion.';self.assertEqual(self.request('/api/admin/review-queue',request,self.cookie,self.csrf)[0],200)
        self.assertEqual(self.request('/api/admin/review-queue',request,self.cookie,self.csrf)[0],409)
        with isolated.enquiries.connect() as db:
            report=growth.review_queue(db,dict(role='agent',actor=self.actor),{'bucket':['reviewed'],'country':['US']})
            self.assertEqual(report['total'],1);self.assertEqual(report['items'][0]['reviewStatus'],'Reviewed');self.assertEqual(report['items'][0]['attentionReasons'],[])
            self.assertEqual(db.execute('SELECT stage FROM enquiry_workflow WHERE id=?',(us,)).fetchone()[0],'New')
            self.assertEqual(db.execute('SELECT COUNT(*) FROM crm_review_audit WHERE reference=?',(us,)).fetchone()[0],1)

    def test_roles_csrf_qa_and_cross_owner(self):
        ref=self.lead();qa=self.lead(qa=True);password='Synthetic-'+uuid.uuid4().hex
        self.assertEqual(self.request('/api/admin/team',dict(email=self.actor,name='Synthetic',role='agent',password=password,active=True),self.cookie,self.csrf)[0],200)
        _,identity,headers=self.request('/api/admin/login',dict(email=self.actor,password=password));cookie=headers['Set-Cookie'].split(';')[0];csrf=identity['csrf']
        self.assertEqual(self.request('/api/admin/campaign-costs',cookie=cookie)[0],403)
        self.assertEqual(self.post(dict(action='profile'),cookie,csrf)[0],403)
        self.assertEqual(self.request('/api/admin/review-queue?reference='+qa,cookie=cookie)[0],404)
        self.assertEqual(self.request('/api/admin/review-queue',dict(reference=ref,status='In review',summary='x',version=0),cookie,'bad')[0],403)
        with isolated.enquiries.connect() as db:db.execute("UPDATE enquiry_workflow SET owner='another@example.test' WHERE id=?",(ref,))
        self.assertEqual(self.request('/api/admin/review-queue?reference='+ref,cookie=cookie)[0],404)
        self.assertEqual(self.request('/api/admin/review-queue',dict(reference=ref,status='Reviewed',summary='x',version=0),cookie,csrf)[0],404)
        self.assertEqual(self.request('/api/admin/review-queue?bucket=invalid',cookie=cookie)[0],400)
        self.assertEqual(self.request('/api/admin/campaign-costs')[0],401)

    def test_profile_retry_duplicates_and_validation(self):
        pid,data=self.profile('IN','USD','Asia/Kolkata');self.assertEqual(self.post(data)[1]['profileId'],pid)
        changed=dict(data,accountLabel='Changed');self.assertEqual(self.post(changed)[0],409)
        changed=dict(data,requestId=str(uuid.uuid4()));self.assertEqual(self.post(changed)[0],409)
        for field,value in [('country','CA'),('currency','JPY'),('timezone','No/Such_Zone'),('campaign','bad tag'),('medium','email')]:
            bad=dict(data,requestId=str(uuid.uuid4()));bad[field]=value;self.assertEqual(self.post(bad)[0],400)
        with isolated.enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM campaign_cost_profiles WHERE id=?',(pid,)).fetchone()[0],1)
            self.assertEqual(db.execute('SELECT COUNT(*) FROM campaign_cost_audit WHERE profile_id=?',(pid,)).fetchone()[0],1)

    def test_partial_zero_complete_and_no_landing_double_count(self):
        pid,_=self.profile();today=dt.datetime.now(dt.timezone.utc).date();start=today-dt.timedelta(days=7)
        refs=[self.lead(review=False,created=int(dt.datetime.combine(start+dt.timedelta(days=1),dt.time(),dt.timezone.utc).timestamp()),landing=landing,stage='Won') for landing in ('/us/software-development/','/crm-demo/')]
        with isolated.enquiries.connect() as db:
            for ref in refs:
                for _ in range(2):db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,'Qualified',?,?)",(ref,self.actor,int(time.time())))
            db.execute('INSERT INTO deal_values VALUES(?,?,?)',(refs[0],12345,'GBP'));db.execute('INSERT INTO deal_values VALUES(?,?,?)',(refs[1],9900,'USD'))
        row=dict(date=start.isoformat(),amount='0',version=0);self.assertEqual(self.post(self.entries(pid,[row]))[0],200)
        with isolated.enquiries.connect() as db:p=next(p for p in growth.cost_report(db,7)['profiles'] if p['id']==pid)
        self.assertIsNone(p['costPerQualifiedMinor']);self.assertEqual(p['spendMinor'],0);self.assertFalse(p['complete'])
        rows=[dict(date=(start+dt.timedelta(days=i)).isoformat(),amount='1.00',version=0) for i in range(1,7)]
        self.assertEqual(self.post(self.entries(pid,rows))[0],200)
        with isolated.enquiries.connect() as db:p=next(p for p in growth.cost_report(db,7)['profiles'] if p['id']==pid)
        self.assertTrue(p['complete']);self.assertEqual(p['spendMinor'],600);self.assertEqual(p['counts'],dict(enquiries=2,qualified=2,won=2));self.assertEqual(p['costPerQualifiedMinor'],300);self.assertEqual(p['costPerWonMinor'],300)
        self.assertEqual(p['wonValues'],[dict(currency='GBP',minorUnits=12345),dict(currency='USD',minorUnits=9900)])
        self.assertNotIn('qa@example.test',json.dumps(p));self.assertNotIn('Synthetic review',json.dumps(p))

    def test_batch_retry_conflict_atomicity_negative_dates_and_amounts(self):
        pid,_=self.profile();today=dt.datetime.now(dt.timezone.utc).date();one=(today-dt.timedelta(days=1)).isoformat();two=(today-dt.timedelta(days=2)).isoformat()
        data=self.entries(pid,[dict(date=one,amount='12.34',version=0)]);self.assertEqual(self.post(data)[0],200);self.assertEqual(self.post(data)[0],200)
        batch=self.entries(pid,[dict(date=two,amount='1',version=0),dict(date=one,amount='2',version=0)]);self.assertEqual(self.post(batch)[0],409)
        with isolated.enquiries.connect() as db:
            self.assertIsNone(db.execute('SELECT 1 FROM campaign_daily_costs WHERE profile_id=? AND day=?',(pid,two)).fetchone())
            self.assertEqual(db.execute('SELECT COUNT(*) FROM campaign_cost_audit WHERE profile_id=? AND day=?',(pid,one)).fetchone()[0],1)
        for day,amount in [(today.isoformat(),'1'),(one,'-1'),(one,'1.001'),(one,'1e3'),(one,'NaN'),('2026-02-30','1')]:self.assertEqual(self.post(self.entries(pid,[dict(date=day,amount=amount,version=1)]))[0],400)
        self.assertEqual(self.post(self.entries(pid,[dict(date=one,amount='0',version=1)]))[0],200)
        with isolated.enquiries.connect() as db:self.assertEqual(db.execute('SELECT minor_units,version FROM campaign_daily_costs WHERE profile_id=? AND day=?',(pid,one)).fetchone()[:],(0,2))

    def test_completed_account_days_dst_boundaries_and_unknown_cost(self):
        pid,_=self.profile('US','GBP','America/New_York');zone=ZoneInfo('America/New_York');now=dt.datetime(2026,3,10,12,tzinfo=dt.timezone.utc)
        begin=int(dt.datetime(2026,3,3,tzinfo=zone).timestamp());end=int(dt.datetime(2026,3,10,tzinfo=zone).timestamp())
        self.assertEqual(end-begin,7*86400-3600)
        for stamp in (begin-1,begin,end-1,end):self.lead(review=False,created=stamp)
        with isolated.enquiries.connect() as db:p=next(p for p in growth.cost_report(db,7,now)['profiles'] if p['id']==pid)
        self.assertEqual(p['periodStart'],'2026-03-03');self.assertEqual(p['periodEnd'],'2026-03-09');self.assertEqual(p['counts']['enquiries'],2);self.assertIsNone(p['spendMinor']);self.assertIsNone(p['costPerWonMinor'])


if __name__=='__main__':
    try:unittest.main()
    finally:isolated.server.shutdown();isolated.server.server_close()

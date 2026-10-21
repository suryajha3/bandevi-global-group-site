"""Consent, account isolation and reviewed Google click-import files. No uploads."""
import csv
import io
import json
import secrets
import time
import unittest
import uuid
import urllib.request
import urllib.error
import test_dashboard as isolated
import ads_measurement as ads


class AdsTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login

    def setUp(self):self.cookie,self.csrf=self.login()

    def configure(self,market='US',confirmed=True,customer='1234567890'):
        with isolated.enquiries.connect() as db:p=ads.profile(db,market)
        status,result,_=self.request('/api/admin/ads-setup',dict(country=market,customerId=customer,qualifiedName='BANDEVI CRM Qualified Lead',wonName='BANDEVI CRM Won Customer',confirmed=confirmed,version=p['version']),self.cookie,self.csrf)
        self.assertEqual(status,200,result);return result

    def lead(self,market='US',business=None,consent=True,gclid=None,key=None,headers=None):
        country=business or market
        payload=dict(type='contact',name='Synthetic Ads enquiry',email='qa@example.test',phone='',interest='CRM & ERP Package',message='Synthetic requirements',source='/'+ads.MARKETS[market][1]+'/travel-agency-crm/',qualification=dict(version=1,country=country,currency={'US':'USD','GB':'GBP','IN':'INR'}[country],budget='',contact=dict(channel='Discuss',date='',time='',timezone='UTC')))
        if consent:payload['adsMeasurement']=dict(version=1,consent=True,policy=ads.POLICY,gclid=gclid or 'Synthetic_'+secrets.token_hex(12))
        key=key or str(uuid.uuid4())
        if headers:
            request=urllib.request.Request(isolated.base+'/api/enquiries',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','Origin':'http://127.0.0.1:8765','Idempotency-Key':key,'X-Real-IP':str(uuid.uuid4()),**headers})
            try:response=urllib.request.urlopen(request)
            except urllib.error.HTTPError as error:response=error
            with response:status=response.status;result=json.load(response)
        else:status,result,_=self.request('/api/enquiries',payload,key=key)
        self.assertEqual(status,201,result);return result['reference'],payload,key

    def milestone(self,ref,stage='Qualified',value=None,currency='USD'):
        with isolated.enquiries.connect() as db:
            now=int(time.time());db.execute('INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,?,?,?)',(ref,stage,'Synthetic',now))
            db.execute('INSERT INTO enquiry_workflow(id,stage) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET stage=excluded.stage',(ref,stage))
            if value is not None:db.execute('INSERT OR REPLACE INTO deal_values VALUES(?,?,?)',(ref,value,currency))

    def preview(self,market='US'):
        status,result,_=self.request('/api/admin/ads-preview?country='+market+'&days=30',cookie=self.cookie);self.assertEqual(status,200,result);return result

    def test_01_defaults_no_collection_without_setup_or_consent_or_with_privacy_signal(self):
        with isolated.enquiries.connect() as db:db.execute('DELETE FROM ads_market_settings')
        ref,_,_=self.lead()
        with isolated.enquiries.connect() as db:self.assertIsNone(db.execute('SELECT 1 FROM ads_clicks WHERE reference=?',(ref,)).fetchone())
        self.configure()
        for options in ({'consent':False},{'headers':{'DNT':'1'}},{'headers':{'Sec-GPC':'1'}}):
            ref,_,_=self.lead(**options)
            with isolated.enquiries.connect() as db:self.assertIsNone(db.execute('SELECT 1 FROM ads_clicks WHERE reference=?',(ref,)).fetchone())
        self.assertEqual(self.request('/api/enquiries?capabilities=ads-measurement')[1]['markets']['US'],True)

    def test_02_three_markets_original_account_and_business_country_separate(self):
        for market in ads.MARKETS:
            self.configure(market);ref,payload,key=self.lead(market,business='GB')
            retry=self.request('/api/enquiries',payload,key=key);self.assertEqual(retry[0],200);self.assertEqual(retry[1]['reference'],ref)
            with isolated.enquiries.connect() as db:
                row=db.execute('SELECT * FROM ads_clicks WHERE reference=?',(ref,)).fetchone();self.assertEqual(row['market'],market);self.assertEqual(row['customer_id'],'1234567890')
                stored=db.execute('SELECT payload FROM enquiries WHERE id=?',(ref,)).fetchone()[0];self.assertNotIn('adsMeasurement',stored);self.assertNotIn(payload['adsMeasurement']['gclid'],stored)
                messages=' '.join(r[0] for r in db.execute('SELECT body FROM notification_outbox WHERE dedupe=?',('ack:'+ref,)));self.assertNotIn(payload['adsMeasurement']['gclid'],messages)
            self.milestone(ref);self.milestone(ref,'Won',123456,'GBP');preview=self.preview(market);rows=[r for r in preview['rows'] if r['reference']==ref];self.assertEqual(len(rows),2);self.assertTrue(all(r['businessCountry']=='GB' for r in rows));self.assertNotIn('gclid',json.dumps(rows))
            status,data,_=self.request('/api/admin/ads-export',dict(country=market,days=30,digest=preview['digest'],reviewed=True),self.cookie,self.csrf);self.assertEqual(status,200,data);self.assertFalse(data['uploaded'])
            csv_rows=list(csv.reader(io.StringIO(data['csv'])));self.assertEqual(csv_rows[0],['Parameters:TimeZone=+0000']);self.assertEqual(tuple(csv_rows[1]),ads.HEADERS)
            exported=[r for r in csv_rows[2:] if r[0]==payload['adsMeasurement']['gclid']];self.assertEqual(len(exported),2);self.assertTrue(all(r[5:7]==['Granted','Denied'] for r in exported));self.assertEqual(next(r for r in exported if r[1]=='BANDEVI CRM Won Customer')[3:5],['1234.56','GBP'])
            for pii in ('qa@example.test','Synthetic requirements','Synthetic Ads enquiry'):self.assertNotIn(pii,data['csv'])
            again=self.request('/api/admin/ads-export',dict(country=market,days=30,digest=preview['digest'],reviewed=True),self.cookie,self.csrf)[1];self.assertEqual(data['csv'],again['csv'])

    def test_03_milestones_not_inferred_qa_missing_value_duplicates_and_stale_review(self):
        self.configure();gclid='Synthetic_Duplicate_'+secrets.token_hex(8);a,_,_=self.lead(gclid=gclid);b,_,_=self.lead(gclid=gclid)
        self.milestone(a);self.milestone(b);self.milestone(a,'Won')
        p=self.preview();self.assertEqual(sum(r['reference'] in (a,b) for r in p['rows']),1);self.assertGreaterEqual(p['diagnostics']['duplicateMilestones'],1);self.assertGreaterEqual(p['diagnostics']['wonWithoutValue'],1)
        ref,_,_=self.lead()
        with isolated.enquiries.connect() as db:db.execute("INSERT INTO enquiry_workflow(id,stage) VALUES(?,'Qualified')",(ref,))
        self.assertFalse(any(r['reference']==ref for r in self.preview()['rows']))
        self.milestone(ref);stale=self.request('/api/admin/ads-export',dict(country='US',days=30,digest=p['digest'],reviewed=True),self.cookie,self.csrf);self.assertEqual(stale[0],409)
        with isolated.enquiries.connect() as db:db.execute("UPDATE enquiries SET email_status='qa-verified' WHERE id=?",(ref,))
        self.assertFalse(any(r['reference']==ref for r in self.preview()['rows']))

    def test_04_withdrawal_retention_and_account_change(self):
        self.configure();ref,_,_=self.lead();self.milestone(ref)
        self.configure(customer='9876543210');self.assertFalse(any(r['reference']==ref for r in self.preview()['rows']));self.assertGreaterEqual(self.preview()['diagnostics']['accountChanged'],1)
        self.configure();status,result,_=self.request('/api/admin/ads-consent',dict(reference=ref,withdraw=True,reason='Synthetic withdrawal'),self.cookie,self.csrf);self.assertEqual(status,200,result)
        with isolated.enquiries.connect() as db:self.assertIsNone(db.execute('SELECT 1 FROM ads_clicks WHERE reference=?',(ref,)).fetchone())
        self.assertTrue(self.request('/api/admin/ads-consent?reference='+ref,cookie=self.cookie)[1]['excluded']);self.assertFalse(any(r['reference']==ref for r in self.preview()['rows']))
        expired,_,_=self.lead()
        with isolated.enquiries.connect() as db:db.execute('UPDATE ads_clicks SET created=? WHERE reference=?',(int(time.time())-ads.RETENTION,expired))
        self.preview()
        with isolated.enquiries.connect() as db:self.assertIsNone(db.execute('SELECT 1 FROM ads_clicks WHERE reference=?',(expired,)).fetchone())

    def test_05_security_validation_csrf_role_and_review_required(self):
        self.assertEqual(self.request('/api/admin/ads-setup')[0],401)
        self.assertEqual(self.request('/api/admin/ads-export',{},self.cookie,'')[0],403)
        self.assertEqual(self.request('/api/admin/ads-export',dict(country='US',days=30,reviewed=False),self.cookie,self.csrf)[0],400)
        self.assertEqual(self.request('/api/admin/ads-setup',dict(country='US',customerId='1234567890',qualifiedName='=formula',wonName='Won',confirmed=True,version=0),self.cookie,self.csrf)[0],400)
        password='Synthetic-'+secrets.token_hex(12);email=secrets.token_hex(8)+'@example.test'
        self.request('/api/admin/team',dict(email=email,name='Synthetic agent',role='agent',password=password,active=True),self.cookie,self.csrf)
        _,login,headers=self.request('/api/admin/login',dict(email=email,password=password));cookie=headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.request('/api/admin/ads-setup',cookie=cookie)[0],403);self.assertEqual(self.request('/api/admin/ads-preview?country=US',cookie=cookie)[0],403)
        ref,_,_=self.lead();self.assertEqual(self.request('/api/admin/ads-consent',dict(reference=ref,withdraw=True,reason='Not mine'),cookie,login['csrf'])[0],404)
        for measurement in ({'version':1,'consent':False,'policy':ads.POLICY,'gclid':'x'},{'version':1,'consent':True,'policy':ads.POLICY,'gclid':'=bad'}):
            with self.assertRaises(ValueError):ads.validate(measurement,dict(type='contact',source='/us/travel-agency-crm/'))


if __name__=='__main__':
    try:result=unittest.main(exit=False).result
    finally:isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

"""Real local HTTP intake and staff workflow; all GA transport is mocked."""
import json
import os
import secrets
import time
import unittest
import urllib.error
import urllib.request
import uuid
from unittest.mock import patch,Mock

import test_dashboard as fixture
import qualified_analytics as ga


class QualifiedAnalyticsHTTPTests(unittest.TestCase):
    login=fixture.DashboardTests.login

    def request(self,route,data=None,cookie='',csrf='',origin='http://127.0.0.1:8765',key=None,extra=None):
        headers={'Content-Type':'application/json','Origin':origin,'Cookie':cookie,'X-CSRF-Token':csrf,
                 'Idempotency-Key':key or str(uuid.uuid4()),'X-Real-IP':uuid.uuid4().hex,**(extra or {})}
        req=urllib.request.Request(fixture.base+route,headers=headers,data=None if data is None else json.dumps(data).encode())
        try:r=urllib.request.urlopen(req)
        except urllib.error.HTTPError as error:r=error
        with r:return r.status,json.load(r),r.headers

    def setUp(self):
        self.at=int(time.time())-1
        self.env=patch.dict(os.environ,{'GA4_CRM_ENABLED':'1','GA4_CRM_ACTIVATED_AT':str(self.at),'GA4_CRM_SEND_ENABLED':'0','GA4_CRM_API_SECRET':''})
        self.env.start()
        self.cookie,self.csrf=self.login()

    def tearDown(self):self.env.stop()

    def data(self,market='GB',token=None):
        return {'type':'contact','name':'Synthetic optional analytics','email':'private@example.test',
                'interest':'Travel ERP Package','message':'Private requirement','source':'/'+('uk' if market=='GB' else 'us')+'/software-development/',
                'attribution':{'channel':'organic_search','landing_page':'/blog/automate-payment-workflows-in-travel-agencies/'},
                'qualification':{'version':1,'country':market,'currency':'GBP' if market=='GB' else 'USD','budget':'To discuss',
                                 'contact':{'channel':'Email','date':'','time':'','timezone':'Asia/Kolkata'}},
                'analyticsContext':{'version':1,'analytics':True,'offline_analytics':True,'policy':ga.POLICY,
                                    'client_id':'123456789.1792497500','expires':int(time.time())+3600,
                                    'qa':False,'dnt':False,'token':token or secrets.token_hex(32)}}

    def create(self,data=None,**kwargs):
        data=data or self.data()
        status,result,_=self.request('/api/enquiries',data,**kwargs)
        self.assertIn(status,(200,201));return result['reference']

    def qualify(self,ref,**changes):
        return self.request('/api/admin/update',{'reference':ref,'stage':'Qualified','owner':'','notes':'Private staff note','version':0,
                           'analyticsQualification':{'version':1,**{k:True for k in ga.CONFIRMATIONS-{'version'}}},**changes},self.cookie,self.csrf)

    def test_default_off_intake_and_queue(self):
        with patch.dict(os.environ,{'GA4_CRM_ENABLED':'0'}):
            self.assertFalse(self.request('/api/analytics-consent/config')[1]['enabled'])
            ref=self.create();self.assertEqual(self.qualify(ref)[0],200)
        with fixture.enquiries.connect() as db:
            self.assertIsNone(db.execute('SELECT 1 FROM ga4_crm_links WHERE enquiry_id=?',(ref,)).fetchone())

    def test_real_gb_us_intake_staff_qualification_fake_delivery_and_routing(self):
        for market in ('GB','US'):
            ref=self.create(self.data(market));self.assertEqual(self.qualify(ref)[1]['analyticsExport'],'pending')
            with fixture.enquiries.connect() as db:
                saved=json.loads(db.execute('SELECT payload FROM enquiries WHERE id=?',(ref,)).fetchone()[0])
                self.assertNotIn('analyticsContext',saved)
                self.assertEqual(saved['qualification']['currency'],'GBP' if market=='GB' else 'USD')
                self.assertEqual(saved['attribution']['landing_page'],'/blog/automate-payment-workflows-in-travel-agencies/')
                body=ga.payload(db,ref,int(time.time()),allowed_pages={'/blog/automate-payment-workflows-in-travel-agencies/'})
                self.assertEqual(body['events'][0]['params']['project_market'],market)
                self.assertNotIn('private@example.test',json.dumps(body))
            # Worker is tested with a fake transport, including opt-in send switch.
        fake=Mock(return_value=204)
        with patch.dict(os.environ,{'GA4_CRM_SEND_ENABLED':'1','GA4_CRM_API_SECRET':'synthetic-not-a-real-secret'}),patch.object(ga,'send_google',fake):
            ga.process_queue(fixture.enquiries.connect);ga.process_queue(fixture.enquiries.connect)
        self.assertGreaterEqual(fake.call_count,2)
        sent=[call.args[0]['client_id'] for call in fake.call_args_list];self.assertTrue(all(x=='123456789.1792497500' for x in sent))

    def test_optional_invalid_missing_and_dnt_context_do_not_reject_enquiry(self):
        for context,extra in [(None,{}),({},{}),({'extra':'private'},{}),(self.data()['analyticsContext'],{'DNT':'1'}),
                              ({**self.data()['analyticsContext'],'qa':True},{}),(self.data()['analyticsContext'],{'X-Bandevi-QA':'1'})]:
            data=self.data();data['analyticsContext']=context;ref=self.create(data,extra=extra)
            with fixture.enquiries.connect() as db:
                self.assertIsNone(db.execute('SELECT 1 FROM ga4_crm_links WHERE enquiry_id=?',(ref,)).fetchone())

    def test_retry_digest_ignores_analytics_and_never_rebinds(self):
        data=self.data();original_token=data['analyticsContext']['token'];key=str(uuid.uuid4());ref=self.create(data,key=key)
        other=self.data()['analyticsContext'];data['analyticsContext']=other
        self.assertEqual(self.create(data,key=key),ref)
        with fixture.enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT grant_hash FROM ga4_crm_links WHERE enquiry_id=?',(ref,)).fetchone()[0],ga._hash(original_token))
            self.assertIsNone(db.execute('SELECT 1 FROM ga4_crm_grants WHERE grant_hash=?',(ga._hash(other['token']),)).fetchone())

    def test_withdraw_before_delayed_intake_prevents_late_link(self):
        data=self.data();token=data['analyticsContext']['token']
        self.assertEqual(self.request('/api/analytics-consent/withdraw',{'tokens':[token]})[1],{'ok':True})
        ref=self.create(data)
        with fixture.enquiries.connect() as db:self.assertIsNone(db.execute('SELECT 1 FROM ga4_crm_links WHERE enquiry_id=?',(ref,)).fetchone())

    def test_withdrawal_works_with_collection_off_and_scrubs_before_worker(self):
        data=self.data();ref=self.create(data);self.qualify(ref)
        with patch.dict(os.environ,{'GA4_CRM_ENABLED':'0'}):
            self.assertEqual(self.request('/api/analytics-consent/withdraw',{'tokens':[data['analyticsContext']['token']]})[0],200)
        with fixture.enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT client_id FROM ga4_crm_grants WHERE grant_hash=?',(ga._hash(data['analyticsContext']['token']),)).fetchone()[0],'')
            self.assertEqual(db.execute('SELECT reason FROM ga4_crm_exports WHERE enquiry_id=?',(ref,)).fetchone()[0],'withdrawn')

    def test_role_csrf_and_version_guards_preserved(self):
        ref=self.create()
        self.assertEqual(self.request('/api/admin/update',{'reference':ref,'stage':'Qualified','version':0})[0],401)
        self.assertEqual(self.request('/api/admin/update',{'reference':ref,'stage':'Qualified','version':0},self.cookie,'wrong')[0],403)
        self.assertEqual(self.qualify(ref,version=99)[0],409)
        with fixture.enquiries.connect() as db:self.assertIsNone(db.execute('SELECT 1 FROM ga4_crm_exports WHERE enquiry_id=?',(ref,)).fetchone())

    def test_unconfirmed_qualification_saves_stage_but_never_exports(self):
        ref=self.create();result=self.qualify(ref,analyticsQualification=None)
        self.assertEqual(result[0],200);self.assertEqual(result[1]['analyticsExport'],'staff_confirmation_required')
        with fixture.enquiries.connect() as db:self.assertIsNone(db.execute('SELECT 1 FROM ga4_crm_exports WHERE enquiry_id=?',(ref,)).fetchone())

    def test_withdrawal_origin_schema_limits_and_generic_response(self):
        token=secrets.token_hex(32)
        self.assertEqual(self.request('/api/analytics-consent/withdraw',{'tokens':[token]},origin='https://evil.example')[0],403)
        self.assertEqual(self.request('/api/analytics-consent/withdraw',{'tokens':['bad']})[0],400)
        self.assertEqual(self.request('/api/analytics-consent/withdraw',{'tokens':[token]*51})[0],400)
        self.assertEqual(self.request('/api/analytics-consent/withdraw',{'tokens':[token],'email':'private@example.test'})[0],400)
        self.assertEqual(self.request('/api/analytics-consent/withdraw',{'tokens':[token]})[1],{'ok':True})

    def test_private_report_has_no_customer_or_analytics_ids(self):
        self.assertEqual(self.request('/api/admin/qualified-analytics')[0],401)
        status,result,_=self.request('/api/admin/qualified-analytics',cookie=self.cookie)
        self.assertEqual(status,200);self.assertNotIn('private@example.test',json.dumps(result));self.assertNotIn('123456789',json.dumps(result))

    def test_optional_storage_failure_does_not_roll_back_real_enquiry_or_stage(self):
        with patch.object(ga,'grant',side_effect=RuntimeError('synthetic failure')):ref=self.create()
        with patch.object(ga,'qualify',side_effect=RuntimeError('synthetic failure')):
            result=self.qualify(ref)
        self.assertEqual(result[0],200);self.assertEqual(result[1]['analyticsExport'],'unavailable')
        with fixture.enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT stage FROM enquiry_workflow WHERE id=?',(ref,)).fetchone()[0],'Qualified')

    def test_staff_withdrawal_uses_existing_role_owner_and_csrf_boundaries(self):
        data=self.data();ref=self.create(data)
        self.assertEqual(self.request('/api/admin/qualified-analytics/withdraw',{'reference':ref,'customerRequested':True})[0],401)
        self.assertEqual(self.request('/api/admin/qualified-analytics/withdraw',{'reference':ref,'customerRequested':True},self.cookie,'wrong')[0],403)
        self.assertEqual(self.request('/api/admin/qualified-analytics/withdraw',{'reference':ref},self.cookie,self.csrf)[0],400)
        email='synthetic-'+uuid.uuid4().hex+'@example.test';password=secrets.token_urlsafe(24)
        self.assertEqual(self.request('/api/admin/team',dict(email=email,name='Synthetic agent',role='agent',password=password,active=True),self.cookie,self.csrf)[0],200)
        _,login,headers=self.request('/api/admin/login',dict(email=email,password=password));cookie=headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.request('/api/admin/qualified-analytics/withdraw',{'reference':ref,'customerRequested':True},cookie,login['csrf'])[0],404)
        self.assertEqual(self.request('/api/admin/qualified-analytics',cookie=cookie)[0],403)
        self.assertEqual(self.request('/api/admin/qualified-analytics/withdraw',{'reference':ref,'customerRequested':True},self.cookie,self.csrf)[0],200)
        with fixture.enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT client_id FROM ga4_crm_grants WHERE grant_hash=?',(ga._hash(data['analyticsContext']['token']),)).fetchone()[0],'')

    def test_transport_is_pinned_redacts_exceptions_and_blocks_test_mode(self):
        with patch.dict(os.environ,{'GA4_CRM_SEND_ENABLED':'1','GA4_CRM_API_SECRET':'synthetic-not-real'}):
            with patch.object(ga.urllib.request,'build_opener') as opener:
                with self.assertRaises(RuntimeError):ga.send_google({'events':[]})
                opener.assert_not_called()
            with patch.dict(os.environ,{'ENQUIRY_TEST':'0'}),patch.object(ga.urllib.request,'build_opener') as opener:
                opener.return_value.open.side_effect=OSError('sensitive transport error with synthetic secret')
                with self.assertRaisesRegex(RuntimeError,'^Analytics delivery outcome uncertain$'):ga.send_google({'events':[]})
                req=opener.return_value.open.call_args.args[0]
                self.assertEqual(ga.urllib.parse.urlsplit(req.full_url).hostname,'region1.google-analytics.com')
                self.assertEqual(opener.return_value.open.call_args.kwargs['timeout'],5)
                self.assertIsNone(ga.NoRedirects().redirect_request(None,None,None,None,None,None))


if __name__=='__main__':
    try:unittest.main()
    finally:fixture.server.shutdown();fixture.server.server_close();fixture.temporary.cleanup()

"""Measurement tests use an isolated inbox; no production data or analytics."""
import json
import time
import unittest
import test_dashboard as fixture
import enquiries

class MeasurementTests(unittest.TestCase):
    request = fixture.DashboardTests.request
    login = fixture.DashboardTests.login

    def test_source_validation_and_legacy_payload(self):
        payload = dict(type='contact', name='Example', email='test@example.com', interest='Travel CRM', message='Test')
        self.assertNotIn('attribution', enquiries.validate(payload))
        source = dict(channel='organic_search', landing_page='/travel-erp-development/', referrer_domain='www.google.com', utm_source='', utm_medium='', utm_campaign='')
        valid = enquiries.validate(dict(payload, attribution=dict(source, ignored='private')))
        self.assertEqual(valid['attribution'], source)
        for field, value in [('channel','invented'), ('landing_page','/contact/?email=test@example.com'), ('referrer_domain','https://google.com/?q=private'), ('utm_campaign','test@example.com')]:
            self.assertEqual(self.request('/api/enquiries', dict(payload, attribution=dict(source, **{field:value})))[0], 400)
        self.assertEqual(self.request('/api/enquiries', dict(payload, attribution=source))[0], 201)

    def test_private_report_ranges_filters_and_workflow(self):
        self.assertEqual(self.request('/api/admin/attribution?days=30')[0], 401)
        cookie, csrf = self.login()
        self.assertEqual(self.request('/api/admin/attribution?days=1', cookie=cookie)[0], 400)
        self.assertEqual(self.request('/api/admin/enquiries?channel=invalid', cookie=cookie)[0], 400)
        # A transaction keeps fixtures separate from other test methods.
        with enquiries.connect() as db:
            db.execute('DELETE FROM enquiries')
            db.execute('DELETE FROM enquiry_workflow')
            now = int(time.time())
            for reference, days, channel, status in [('BG-MEASURE001',0,'organic_search','pending'),('BG-MEASURE002',10,'organic_search','pending'),('BG-MEASURE003',0,None,'pending'),('BG-MEASURE004',0,'organic_search','qa-verified')]:
                payload = dict(type='demo',name='Private name',email='private@example.com',interest='Travel CRM',message='Private message')
                if channel: payload['attribution'] = dict(channel=channel,landing_page='/travel-erp-development/',referrer_domain='www.google.com')
                db.execute('INSERT INTO enquiries(id,created,payload,email_status) VALUES(?,?,?,?)',(reference, now-days*86400,json.dumps(payload),status))
        change = dict(reference='BG-MEASURE001',stage='Proposal',owner='',notes='',version=0)
        self.assertEqual(self.request('/api/admin/update',change,cookie,csrf)[0],200)
        short = self.request('/api/admin/attribution?days=7', cookie=cookie)[1]
        self.assertEqual((short['enquiries'],short['channels']['organic_search'],short['channels']['unknown'],short['organicStages']['Proposal']),(2,1,1,1))
        self.assertEqual(short['organicLandingPages'],[dict(page='/travel-erp-development/',enquiries=1)])
        self.assertEqual(short['services'],[dict(service='Travel CRM',enquiries=2,organic=1)])
        self.assertNotIn('private@example.com',json.dumps(short))
        self.assertNotIn('Private message',json.dumps(short))
        long = self.request('/api/admin/attribution?days=30', cookie=cookie)[1]
        self.assertEqual((long['enquiries'],long['channels']['organic_search']),(3,2))
        filtered = self.request('/api/admin/enquiries?channel=organic_search',cookie=cookie)[1]
        self.assertEqual(filtered['total'],2)
        legacy = self.request('/api/admin/enquiries?channel=unknown',cookie=cookie)[1]
        self.assertEqual(legacy['total'],1)

if __name__ == '__main__':
    try:
        suite=unittest.TestSuite([unittest.defaultTestLoader.loadTestsFromTestCase(fixture.DashboardTests),unittest.defaultTestLoader.loadTestsFromTestCase(MeasurementTests)])
        result=unittest.TextTestRunner(verbosity=2).run(suite)
    finally:
        fixture.server.shutdown(); fixture.server.server_close(); fixture.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

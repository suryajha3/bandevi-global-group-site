"""Isolated tests; never connect to the production inbox or mail provider."""
import json
import os
from pathlib import Path
import secrets
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
import uuid

temporary = tempfile.TemporaryDirectory()
os.environ['ENQUIRY_DB'] = str(Path(temporary.name) / 'test.sqlite3')
os.environ['ENQUIRY_TEST'] = '1'
os.environ['RATE_LIMIT_SALT'] = secrets.token_hex(32)
import dashboard
import enquiries
password = secrets.token_urlsafe(28)
os.environ['DASHBOARD_PASSWORD_HASH'] = dashboard.password_hash(password)
enquiries.initialize()
server = enquiries.ThreadingHTTPServer(('127.0.0.1', 0), enquiries.Handler)
server.daemon_threads = False
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'

class DashboardTests(unittest.TestCase):
    def request(self, route, data=None, cookie='', csrf='', origin='http://127.0.0.1:8765', ip=None, key=None):
        headers = {'Content-Type':'application/json','Origin':origin,'Cookie':cookie,'X-CSRF-Token':csrf,
                   'X-Real-IP':ip or str(uuid.uuid4()), 'Idempotency-Key':key or str(uuid.uuid4())}
        request = urllib.request.Request(base+route, headers=headers, data=None if data is None else json.dumps(data).encode())
        try: response = urllib.request.urlopen(request)
        except urllib.error.HTTPError as error: response = error
        with response:
            return response.status, json.load(response), response.headers

    def login(self):
        status, result, headers = self.request('/api/admin/login', {'email':dashboard.USER,'password':password})
        self.assertEqual(status, 200)
        return headers['Set-Cookie'].split(';')[0], result['csrf']

    def enquiry(self):
        status, result, _ = self.request('/api/enquiries', {'type':'contact','name':'QA test','email':'qa@example.com','interest':'Need guidance','message':'Private test'})
        self.assertEqual(status, 201)
        return result['reference']

    def test_unauthenticated_and_disabled(self):
        self.assertEqual(self.request('/api/admin/enquiries')[0], 401)
        self.assertEqual(self.request('/api/admin/update', {})[0], 401)
        hashed = os.environ.pop('DASHBOARD_PASSWORD_HASH')
        try:
            self.assertEqual(self.request('/api/admin/login', {'email':dashboard.USER,'password':password})[0], 503)
            self.assertFalse(self.request('/api/admin/session')[1]['configured'])
        finally: os.environ['DASHBOARD_PASSWORD_HASH'] = hashed

    def test_login_rate_and_origin(self):
        ip = str(uuid.uuid4())
        for _ in range(5):
            self.assertEqual(self.request('/api/admin/login', {'email':dashboard.USER,'password':'wrong'}, ip=ip)[0], 401)
        self.assertEqual(self.request('/api/admin/login', {'email':dashboard.USER,'password':password}, ip=ip)[0], 429)
        self.assertEqual(self.request('/api/admin/login', {}, origin='https://evil.example')[0], 403)

    def test_session_cookie_logout_and_expiry(self):
        cookie, csrf = self.login()
        state = self.request('/api/admin/session', cookie=cookie)[1]
        self.assertTrue(state['authenticated'])
        self.assertEqual(state['csrf'], csrf)
        self.assertEqual(self.request('/api/admin/logout', {}, cookie, csrf)[0], 200)
        self.assertEqual(self.request('/api/admin/enquiries', cookie=cookie)[0], 401)
        cookie, csrf = self.login()
        with enquiries.connect() as db: db.execute('UPDATE inbox_sessions SET expires=0')
        self.assertEqual(self.request('/api/admin/enquiries', cookie=cookie)[0], 401)

    def test_csrf_updates_and_audit(self):
        reference = self.enquiry(); cookie, csrf = self.login()
        change = {'reference':reference,'stage':'Contacted','owner':'Sales owner','notes':'Call tomorrow','version':0}
        self.assertEqual(self.request('/api/admin/update', change, cookie, '')[0], 403)
        self.assertEqual(self.request('/api/admin/update', change, cookie, csrf, origin='https://evil.example')[0], 403)
        self.assertEqual(self.request('/api/admin/update', change, cookie, csrf)[1]['version'], 1)
        self.assertEqual(self.request('/api/admin/update', change, cookie, csrf)[0], 409)
        result = self.request('/api/admin/enquiries?q='+reference, cookie=cookie)[1]
        item = result['items'][0]
        self.assertEqual((item['stage'],item['owner'],item['notes']), ('Contacted','Sales owner','Call tomorrow'))
        with enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM inbox_audit WHERE enquiry_id=?',(reference,)).fetchone()[0], 1)

    def test_validation_and_hidden_qa(self):
        reference = self.enquiry(); cookie, csrf = self.login()
        change = {'reference':reference,'stage':'Unknown','owner':'','notes':'','version':0}
        self.assertEqual(self.request('/api/admin/update', change, cookie, csrf)[0], 400)
        change.update(stage='New',notes='x'*2001)
        self.assertEqual(self.request('/api/admin/update', change, cookie, csrf)[0], 400)
        with enquiries.connect() as db: db.execute("UPDATE enquiries SET email_status='qa-verified' WHERE id=?",(reference,))
        self.assertEqual(self.request('/api/admin/enquiries?q='+reference, cookie=cookie)[1]['total'], 0)

    def test_qualified_pipeline_by_source(self):
        cookie,csrf=self.login()
        before=self.request('/api/admin/attribution?days=30',cookie=cookie)[1]
        data={'type':'demo','name':'Pipeline QA','email':'qa@example.com','interest':'CRM & ERP Package','message':'Synthetic enquiry','attribution':{'channel':'organic_search','landing_page':'/travel-crm/'}}
        reference=self.request('/api/enquiries',data)[1]['reference']
        for version,stage in enumerate(('Qualified','Proposal','Won','Qualified')):
            change={'reference':reference,'stage':stage,'owner':'QA','notes':'Synthetic outcome','version':version}
            self.assertEqual(self.request('/api/admin/update',change,cookie,csrf)[0],200)
        report=self.request('/api/admin/attribution?days=30',cookie=cookie)[1]
        self.assertEqual(report['channelStages']['organic_search']['Qualified'],before['channelStages']['organic_search']['Qualified']+1)
        self.assertEqual(report['salesStages']['Won'],before['salesStages']['Won'])
        self.assertEqual(sum(report['salesStages'].values()),report['enquiries'])
        self.assertEqual(sum(sum(c.values()) for c in report['channelStages'].values()),report['enquiries'])
        self.assertEqual(self.request('/api/admin/enquiries?stage=Qualified&q='+reference,cookie=cookie)[1]['total'],1)
        with enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM inbox_audit WHERE enquiry_id=?',(reference,)).fetchone()[0],4)
            db.execute("UPDATE enquiries SET email_status='qa-verified' WHERE id=?",(reference,))
        final=self.request('/api/admin/attribution?days=30',cookie=cookie)[1]
        self.assertEqual(final['salesStages'],before['salesStages'])

    def test_demo_preference_storage_validation_and_retry(self):
        import datetime
        india=datetime.timezone(datetime.timedelta(hours=5,minutes=30))
        day=(datetime.datetime.now(india)+datetime.timedelta(days=2)).date().isoformat()
        data={'type':'demo','name':'Demo QA','email':'qa@example.com','interest':'Need guidance','message':'Synthetic demo','demoSchedule':{'date':day,'time':'14:30','timezone':'Asia/Kolkata'}}
        key=str(uuid.uuid4());status,result,_=self.request('/api/enquiries',data,key=key)
        self.assertEqual(status,201)
        self.assertEqual(self.request('/api/enquiries',data,key=key)[1]['reference'],result['reference'])
        cookie,csrf=self.login()
        stored=self.request('/api/admin/enquiries?q='+result['reference'],cookie=cookie)[1]['items'][0]
        self.assertEqual(stored['details']['demoSchedule'],data['demoSchedule'])
        for schedule in ({'date':'2020-01-01','time':'14:30','timezone':'Asia/Kolkata'}, {'date':day,'time':'25:00','timezone':'Asia/Kolkata'}, {'date':day,'time':'14:31','timezone':'Asia/Kolkata'}, {'date':day,'timezone':'Asia/Kolkata'}, {'date':day,'time':'14:30','timezone':'UTC'}, {'date':'2035-01-01','time':'14:30','timezone':'Asia/Kolkata'}):
            self.assertEqual(self.request('/api/enquiries',{**data,'demoSchedule':schedule})[0],400)
        self.assertEqual(self.request('/api/enquiries',{**data,'type':'contact'})[0],400)

    def test_secure_cookie_in_production(self):
        cookie, csrf = self.login()
        self.assertIn('HttpOnly', dashboard.cookie('test'))
        self.assertIn('SameSite=Strict', dashboard.cookie('test'))
        os.environ.pop('ENQUIRY_TEST')
        try: self.assertIn('; Secure', dashboard.cookie('test'))
        finally: os.environ['ENQUIRY_TEST']='1'

if __name__ == '__main__':
    try:
        result = unittest.main(exit=False).result
    finally:
        server.shutdown(); server.server_close(); temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

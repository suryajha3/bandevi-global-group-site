import json,uuid,unittest
from unittest.mock import patch
import test_dashboard as isolated
import enquiries
class ContactChannelTests(unittest.TestCase):
 request=isolated.DashboardTests.request
 login=isolated.DashboardTests.login
 def payload(self,**changes):
  v={'type':'contact','name':'Fictional QA','email':'','phone':'+1 202 555 0148','interest':'','message':'Synthetic project.'};v.update(changes);return v
 def test_phone_only_retry_notification_and_workspace_boundary(self):
  key=str(uuid.uuid4());status,r,_=self.request('/api/enquiries',self.payload(),key=key);self.assertEqual(status,201);retry=self.request('/api/enquiries',self.payload(),key=key);self.assertEqual(retry[0],200);self.assertEqual(retry[1]['reference'],r['reference'])
  with enquiries.connect() as db:
   row=db.execute('SELECT * FROM enquiries WHERE id=?',(r['reference'],)).fetchone();data=json.loads(row['payload']);self.assertEqual(data['email'],'');self.assertEqual(data['interest'],'Need guidance');self.assertEqual(db.execute('SELECT COUNT(*) FROM notification_outbox WHERE dedupe=?',('ack:'+r['reference'],)).fetchone()[0],0)
  with patch.object(enquiries,'send_message') as send,patch.dict(enquiries.os.environ,{'SMTP_FROM':'sender@example.invalid'}):
   enquiries.notify(row);self.assertIsNone(send.call_args.args[0].get('Reply-To'))
  cookie,csrf=self.login();status,data,_=self.request('/api/admin/workspace/create',{'reference':r['reference'],'title':'Synthetic'},cookie,csrf);self.assertEqual(status,400);self.assertIn('email address',data['error'])
  with enquiries.connect() as db:self.assertFalse(db.execute('SELECT 1 FROM client_projects WHERE reference=?',(r['reference'],)).fetchone())
 def test_email_contact_and_ack(self):
  status,r,_=self.request('/api/enquiries',self.payload(email='qa@example.invalid',phone=''));self.assertEqual(status,201)
  with enquiries.connect() as db:self.assertEqual(db.execute('SELECT recipient FROM notification_outbox WHERE dedupe=?',('ack:'+r['reference'],)).fetchone()[0],'qa@example.invalid')
 def test_invalid_channels(self):
  for phone in ['', '123', '+1<script>', '1234567890123456', '+1\n2025550148']:
   with self.subTest(phone=phone):self.assertEqual(self.request('/api/enquiries',self.payload(phone=phone))[0],400)
  self.assertEqual(self.request('/api/enquiries',self.payload(email='invalid@'))[0],400)
 def test_demo_requires_email_and_service(self):
  self.assertEqual(self.request('/api/enquiries',self.payload(type='demo',interest='CRM'))[0],400);self.assertEqual(self.request('/api/enquiries',self.payload(type='demo',email='qa@example.invalid'))[0],400)
if __name__=='__main__':
 try:result=unittest.main(exit=False).result
 finally:isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()
 raise SystemExit(0 if result.wasSuccessful() else 1)

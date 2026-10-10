"""Isolated upgrade tests. No production inbox, mail provider or hosting access."""
import datetime
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import time
import unittest
import uuid
from unittest.mock import patch
import test_dashboard as isolated
import enquiries
import operations
import recovery
import monitor

class UpgradeTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login
    enquiry=isolated.DashboardTests.enquiry

    def staff(self,role='agent'):
        cookie,csrf=self.login();email=uuid.uuid4().hex+'@example.com';password='Synthetic-'+uuid.uuid4().hex
        self.assertEqual(self.request('/api/admin/team',{'email':email,'name':'Synthetic staff','role':role,'password':password,'active':True},cookie,csrf)[0],200)
        status,result,headers=self.request('/api/admin/login',{'email':email,'password':password})
        self.assertEqual(status,200)
        return email,headers['Set-Cookie'].split(';')[0],result['csrf']

    def slot(self,offset=0):
        cookie,csrf=self.login();starts=(int(time.time())//900+200+offset)*900
        host='sales@bandeviglobalgroup.com'
        self.assertEqual(self.request('/api/admin/slots',{'starts':starts,'duration':30,'host':host},cookie,csrf)[0],200)
        with enquiries.connect() as db:return db.execute('SELECT id FROM demo_slots WHERE starts=?',(starts,)).fetchone()[0]

    def book(self,slot,key=None):
        return self.request('/api/enquiries',{'type':'demo','name':'Synthetic demo','email':'qa@example.com','interest':'Need guidance','message':'Test booking','slotId':slot},key=key)

    def test_staff_auth_scope_and_revocation(self):
        email,cookie,csrf=self.staff();admin,admin_csrf=self.login();reference=self.enquiry();foreign=self.enquiry()
        self.assertEqual(self.request('/api/admin/update',{'reference':reference,'stage':'New','owner':email,'notes':'','version':0},admin,admin_csrf)[0],200)
        response=self.request('/api/admin/enquiries',cookie=cookie)[1]
        self.assertEqual([r['reference'] for r in response['items']],[reference]);self.assertEqual(sum(response['counts'].values()),1)
        self.assertEqual(self.request('/api/admin/update',{'reference':foreign,'stage':'Won','owner':email,'notes':'','version':0},cookie,csrf)[0],403)
        self.assertEqual(self.request('/api/admin/update',{'reference':reference,'stage':'Qualified','owner':'other@example.com','notes':'','version':1},cookie,csrf)[0],403)
        self.assertEqual(self.request('/api/admin/team',cookie=cookie)[0],403)
        self.assertEqual(self.request('/api/admin/operations',cookie=cookie)[0],403)
        self.assertEqual(self.request('/api/admin/attribution?days=30',cookie=cookie)[1]['enquiries'],1)
        self.assertEqual(sum(c['enquiries'] for c in self.request('/api/admin/conversion?days=30',cookie=cookie)[1]['channels'].values()),1)
        self.assertEqual(self.request('/api/admin/team',{'email':email,'name':'Synthetic staff','role':'agent','active':False},admin,admin_csrf)[0],200)
        self.assertFalse(self.request('/api/admin/session',cookie=cookie)[1]['authenticated'])

    def test_manager_permissions_and_weak_password(self):
        email,cookie,csrf=self.staff('manager');admin,admin_csrf=self.login()
        self.assertEqual(self.request('/api/admin/team',{'email':'new@example.com','name':'New','role':'admin','password':'short','active':True},admin,admin_csrf)[0],400)
        self.assertEqual(self.request('/api/admin/team',{'email':email,'name':'Changed','role':'admin','active':True},cookie,csrf)[0],403)
        self.assertEqual(self.request('/api/admin/team',cookie=cookie)[0],200)
        self.assertEqual(self.request('/api/admin/update',{'reference':self.enquiry(),'stage':'Contacted','owner':'Nobody','notes':'','version':0},cookie,csrf)[0],400)

    def test_slot_conflict_retry_cancel_and_reschedule(self):
        slot=self.slot(10);key=str(uuid.uuid4());status,result,_=self.book(slot,key)
        self.assertEqual(status,201);self.assertTrue(result['appointment']['confirmed']);token=result['appointment']['manageUrl'].split('#')[1]
        status,retry,_=self.book(slot,key);self.assertEqual(status,200);self.assertEqual(retry['appointment']['manageUrl'],result['appointment']['manageUrl'])
        self.assertEqual(self.book(slot)[0],409)
        self.assertEqual(self.request('/api/enquiries',{'type':'demo','name':'Synthetic demo','email':'qa@example.com','interest':'Need guidance','message':'Conflicting schedules','slotId':slot,'demoSchedule':{'date':'2030-01-01','time':'11:00','timezone':'Asia/Kolkata'}})[0],400)
        self.assertEqual(self.request('/api/demo/manage',{'token':'x'*64})[0],404)
        self.assertEqual(self.request('/api/demo/manage',{'token':token},origin='https://evil.example')[0],403)
        state=self.request('/api/demo/manage',{'token':token})[1];self.assertEqual(state['state'],'confirmed')
        second=self.slot(20)
        self.assertEqual(self.request('/api/demo/manage',{'token':token,'action':'reschedule','version':0,'slotId':second})[0],200)
        self.assertEqual(self.request('/api/demo/manage',{'token':token,'action':'cancel','version':0})[0],409)
        self.assertEqual(self.request('/api/demo/manage',{'token':token,'action':'cancel','version':1})[1]['state'],'cancelled')
        self.assertIn(second,[s['id'] for s in self.request('/api/demo/slots')[1]['slots']])
        with enquiries.connect() as db:self.assertEqual(db.execute('SELECT COUNT(*) FROM enquiries WHERE id=?',(result['reference'],)).fetchone()[0],1)

    def test_slot_overlap_no_contact_data_in_public_slots(self):
        slot=self.slot(30);cookie,csrf=self.login()
        with enquiries.connect() as db:starts=db.execute('SELECT starts FROM demo_slots WHERE id=?',(slot,)).fetchone()[0]
        self.assertEqual(self.request('/api/admin/slots',{'starts':starts+900,'host':'sales@bandeviglobalgroup.com','duration':30},cookie,csrf)[0],400)
        public=self.request('/api/demo/slots')[1]
        self.assertTrue(all(set(s)=={'id','starts','duration'} for s in public['slots']))

    def test_delivery_ack_retry_and_reminder_deduplication(self):
        email,cookie,csrf=self.staff();admin,admin_csrf=self.login();reference=self.enquiry();today=datetime.datetime.now(operations.INDIA).date().isoformat()
        self.assertEqual(self.request('/api/admin/update',{'reference':reference,'stage':'New','owner':email,'notes':'','followUpDate':today,'version':0},admin,admin_csrf)[0],200)
        operations.reminders(enquiries.connect);operations.reminders(enquiries.connect)
        with enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM notification_outbox WHERE dedupe=?',('ack:'+reference,)).fetchone()[0],1)
            self.assertEqual(db.execute("SELECT COUNT(*) FROM notification_outbox WHERE dedupe LIKE ?",('followup:'+reference+':%',)).fetchone()[0],1)
        with patch.dict(os.environ,{'SMTP_HOST':'mock','SMTP_USER':'mock','SMTP_PASSWORD':'mock','SMTP_FROM':'qa@example.com'}),patch.object(enquiries,'send_message',side_effect=RuntimeError('mock')):
            enquiries.process_outbox()
        with enquiries.connect() as db:
            row=db.execute('SELECT attempts,status FROM notification_outbox WHERE dedupe=?',('ack:'+reference,)).fetchone()
            self.assertEqual((row['attempts'],row['status']),(1,'pending'))
            db.execute('UPDATE notification_outbox SET next_attempt=0')
        with patch.dict(os.environ,{'SMTP_HOST':'mock','SMTP_USER':'mock','SMTP_PASSWORD':'mock','SMTP_FROM':'qa@example.com'}),patch.object(enquiries,'send_message') as sender:
            enquiries.process_outbox();self.assertTrue(sender.called)
        with enquiries.connect() as db:self.assertEqual(db.execute('SELECT status FROM notification_outbox WHERE dedupe=?',('ack:'+reference,)).fetchone()[0],'sent')

    def test_pipeline_money_and_actor(self):
        email,cookie,csrf=self.staff('manager');reference=self.enquiry()
        before=self.request('/api/admin/conversion?days=30',cookie=cookie)[1]
        self.assertEqual(self.request('/api/admin/update',{'reference':reference,'stage':'Won','owner':email,'notes':'','version':0,'dealValue':'1200.50','currency':'INR'},cookie,csrf)[0],200)
        with enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT actor FROM inbox_audit WHERE enquiry_id=? ORDER BY id DESC LIMIT 1',(reference,)).fetchone()[0],email)
        report=self.request('/api/admin/conversion?days=30',cookie=cookie)[1]
        self.assertEqual(report['wonValueMinorUnits'].get('INR',0),before['wonValueMinorUnits'].get('INR',0)+120050)
        self.assertEqual(self.request('/api/admin/update',{'reference':reference,'stage':'Won','owner':email,'notes':'','version':0,'dealValue':'9999','currency':'USD'},cookie,csrf)[0],409)
        with enquiries.connect() as db:self.assertEqual(db.execute('SELECT minor_units,currency FROM deal_values WHERE enquiry_id=?',(reference,)).fetchone()['minor_units'],120050)
        for bad in ('NaN','-1','1.001','Infinity'):
            self.assertEqual(self.request('/api/admin/update',{'reference':reference,'stage':'Won','owner':email,'notes':'','version':1,'dealValue':bad},cookie,csrf)[0],400)
        self.assertEqual(self.request('/api/admin/conversion?days=999',cookie=cookie)[0],400)

    def test_backup_restore_and_monitor(self):
        destination=Path(isolated.temporary.name)/'backups'
        before=sqlite3.connect(enquiries.DB).execute('SELECT COUNT(*) FROM enquiries').fetchone()[0]
        result=recovery.backup(enquiries.DB,destination,2);self.assertTrue(result['verified'])
        with sqlite3.connect(destination/result['backup']) as db:self.assertEqual(db.execute('SELECT COUNT(*) FROM enquiries').fetchone()[0],before)
        problems=monitor.check(str(enquiries.DB));self.assertNotIn('No verified backup within 36 hours.',problems)
        self.assertEqual(self.request('/health')[0],200)

    def test_publication_requires_permission_and_evidence(self):
        spec=importlib.util.spec_from_file_location('publish',Path(__file__).with_name('publish_case_study.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
        with self.assertRaises(ValueError):module.render({'clientApproved':False})
        good={'clientApproved':True,'slug':'synthetic-project','client':'Synthetic <client>','title':'Test','scope':'Test scope','delivered':'Test delivery','period':'2026','evidenceUrl':'https://example.com/','approvedBy':'Owner','approvalRecord':'Private record','outcomes':[]}
        self.assertIn('&lt;client&gt;',module.render(good));good['outcomes']=[{'result':'Test'}]
        with self.assertRaises(ValueError):module.render(good)

if __name__=='__main__':
    try:result=unittest.main(exit=False).result
    finally:isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

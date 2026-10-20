"""Isolated campaign enquiry-to-booking tests. No mail worker or production access."""
import concurrent.futures
import hashlib
import json
import secrets
import time
import unittest
import uuid
import test_dashboard as isolated
import enquiries
import operations
import demo_handoff
import sales_journey


class HandoffTests(unittest.TestCase):
    request=isolated.DashboardTests.request

    def lead(self,country='US',**overrides):
        slug={'US':'us','GB':'uk','IN':'india'}[country]
        payload=dict(type='contact',name='Synthetic campaign lead',email='qa@example.test',interest='CRM & ERP Package',message='Review our synthetic sales workflow',source='/'+slug+'/travel-agency-crm/',qualification=dict(version=1,country=country,currency={'US':'USD','GB':'GBP','IN':'INR'}[country],budget='',contact=dict(channel='Discuss',date='',time='',timezone='UTC')),attribution=dict(channel='paid_search',utm_source='google',utm_medium='cpc',utm_campaign='travel_agency_crm_'+slug+'_202610',landing_page='/'+slug+'/travel-agency-crm/'))
        payload['attribution']['channel']='paid'
        payload.update(overrides);key=str(uuid.uuid4())
        status,result,_=self.request('/api/enquiries',payload,key=key)
        self.assertEqual(status,201,result)
        return result,payload,key

    def slot(self,active=1,offset=3600):
        slot=secrets.token_hex(12);starts=int(time.time())+offset
        with enquiries.connect() as db:
            # Multiple tests share this temporary DB. Allocate an unused timestamp
            # deterministically rather than relying on random offsets to be unique.
            while db.execute('SELECT 1 FROM demo_slots WHERE starts=?',(starts,)).fetchone():starts+=1
            db.execute('INSERT INTO demo_slots VALUES(?,?,?,?,?)',(slot,starts,30,'sales@example.test',active))
        return slot

    def call(self,lead,action='view',**data):
        return self.request('/api/demo/handoff',dict(token=lead['demoBookingUrl'].split('#')[1],action=action,**data))

    def test_markets_reuse_original_enquiry_and_idempotency(self):
        for country in ('US','GB','IN'):
            lead,payload,key=self.lead(country)
            self.assertRegex(lead['demoBookingUrl'],r'^/demo-booking/#review\.BG-[A-F0-9]{16}\.[a-f0-9]{64}$')
            retry=self.request('/api/enquiries',payload,key=key)[1];self.assertEqual(retry['demoBookingUrl'],lead['demoBookingUrl'])
            view=self.call(lead)[1];self.assertEqual(view['country'],country);self.assertIsNone(view['appointment'])
            self.assertNotIn('email',view);self.assertNotIn('name',view);self.assertNotIn('payload',view)
            with enquiries.connect() as db:
                before=sales_journey.funnel(db,dict(role='admin',actor=isolated.dashboard.USER),30)
                before_count=sum(g['counts']['demoBooked'] for g in before['campaigns'] if g['country']==country and g['campaign']==payload['attribution']['utm_campaign'])
            slot=self.slot();status,booked,_=self.call(lead,'book',slotId=slot);self.assertEqual(status,200,booked);self.assertTrue(booked['appointment']['confirmed'])
            self.assertTrue(booked['appointment']['manageUrl'].startswith('/demo-booking/#'))
            self.assertEqual(self.call(lead,'book',slotId=slot)[1]['appointment'],booked['appointment'])
            with enquiries.connect() as db:
                after=sales_journey.funnel(db,dict(role='admin',actor=isolated.dashboard.USER),30)
                after_count=sum(g['counts']['demoBooked'] for g in after['campaigns'] if g['country']==country and g['campaign']==payload['attribution']['utm_campaign'])
                self.assertEqual(after_count,before_count+1)
                self.assertEqual(db.execute('SELECT COUNT(*) FROM enquiries WHERE id=?',(lead['reference'],)).fetchone()[0],1)
                saved=json.loads(db.execute('SELECT payload FROM enquiries WHERE id=?',(lead['reference'],)).fetchone()[0]);self.assertEqual(saved['attribution']['utm_campaign'],payload['attribution']['utm_campaign'])
                self.assertEqual(db.execute('SELECT COUNT(*) FROM appointment_events WHERE enquiry_id=?',(lead['reference'],)).fetchone()[0],1)
                self.assertEqual(db.execute("SELECT COUNT(*) FROM notification_outbox WHERE dedupe=?",('booking:'+lead['reference']+':0',)).fetchone()[0],1)
                ack=db.execute('SELECT body FROM notification_outbox WHERE dedupe=?',('ack:'+lead['reference'],)).fetchone()[0];self.assertIn(lead['demoBookingUrl'],ack)

    def test_invalid_origin_token_expiry_and_phone_only(self):
        lead,_,_=self.lead();token=lead['demoBookingUrl'].split('#')[1]
        for bad in ('',lead['reference'],token[:-1]+('0' if token[-1]!='0' else '1'),None,[]):
            self.assertEqual(self.request('/api/demo/handoff',{'token':bad})[0],404)
        self.assertEqual(self.request('/api/demo/handoff',{'token':token},origin='https://evil.example')[0],403)
        with enquiries.connect() as db:db.execute('UPDATE enquiries SET created=? WHERE id=?',(int(time.time())-demo_handoff.LIFETIME-1,lead['reference']))
        self.assertEqual(self.call(lead)[0],410);self.assertEqual(self.call(lead,'book',slotId=self.slot())[0],410)
        phone,_,_=self.lead(email='',phone='+919999999999');self.assertIsNone(phone['demoBookingUrl'])

    def test_availability_conflict_and_concurrent_single_winner(self):
        a,_,_=self.lead();b,_,_=self.lead();slot=self.slot()
        for invalid in (self.slot(active=0),self.slot(offset=-600),self.slot(offset=181*86400)):
            self.assertNotIn(invalid,[s['id'] for s in self.call(a)[1]['slots']]);self.assertEqual(self.call(a,'book',slotId=invalid)[0],409)
        with concurrent.futures.ThreadPoolExecutor() as pool:results=list(pool.map(lambda lead:self.call(lead,'book',slotId=slot)[0],(a,b)))
        self.assertEqual(sorted(results),[200,409])
        with enquiries.connect() as db:self.assertEqual(db.execute('SELECT COUNT(*) FROM demo_bookings WHERE slot_id=?',(slot,)).fetchone()[0],1)

    def test_closed_qa_existing_staff_booking_and_cancelled_management(self):
        lead,_,_=self.lead()
        with enquiries.connect() as db:db.execute("INSERT INTO enquiry_workflow(id,stage) VALUES(?,'Won')",(lead['reference'],))
        self.assertTrue(self.call(lead)[1]['closed']);self.assertEqual(self.call(lead,'book',slotId=self.slot())[0],409)
        with enquiries.connect() as db:db.execute("UPDATE enquiries SET email_status='qa-verified' WHERE id=?",(lead['reference'],))
        self.assertEqual(self.call(lead)[0],404)
        staff,_,_=self.lead();slot=self.slot();original=secrets.token_hex(32)
        with enquiries.connect() as db:operations.create_booking(db,staff['reference'],slot,original)
        self.assertNotIn('manageUrl',self.call(staff)[1]['appointment']);self.assertEqual(self.call(staff,'book',slotId=slot)[0],409)
        with enquiries.connect() as db:self.assertEqual(db.execute('SELECT token_digest FROM demo_bookings WHERE enquiry_id=?',(staff['reference'],)).fetchone()[0],hashlib.sha256(original.encode()).hexdigest())
        lead,_,_=self.lead();self.call(lead,'book',slotId=self.slot());manage=self.call(lead)[1]['appointment']['manageUrl'].split('#')[1]
        state=self.request('/api/demo/manage',dict(token=manage,action='view'))[1]
        self.assertEqual(self.request('/api/demo/manage',dict(token=manage,action='calendar'))[0],200)
        self.assertEqual(self.request('/api/demo/manage',dict(token=manage,action='cancel',version=state['version']))[0],200)
        self.assertFalse(self.call(lead)[1]['appointment']['confirmed']);self.assertEqual(self.call(lead,'book',slotId=self.slot())[0],409)


if __name__=='__main__':
    try:
        result=unittest.main(exit=False).result
    finally:isolated.server.shutdown();isolated.server.server_close()
    raise SystemExit(0 if result.wasSuccessful() else 1)

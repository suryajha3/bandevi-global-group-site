"""Recovery boundaries and access rules against temporary records only."""
import json
import secrets
import time
import unittest
import test_dashboard as isolated
import demo_recovery


class RecoveryTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login

    def setUp(self):self.now=int(time.time());self.owner=secrets.token_hex(8)+'@example.test'

    def lead(self,country='US',age=2*86400,stage='New',qa=False):
        ref='BG-'+secrets.token_hex(8).upper()
        data=dict(type='contact',name='Synthetic recovery '+ref,email='qa@example.test',phone='',interest='CRM & ERP Package',message='Synthetic workflow',source='/us/travel-agency-crm/',qualification=dict(version=1,country=country))
        with isolated.enquiries.connect() as db:
            db.execute('INSERT INTO enquiries(id,created,payload,email_status) VALUES(?,?,?,?)',(ref,self.now-age,json.dumps(data),'qa-verified' if qa else 'sent'))
            db.execute('INSERT INTO enquiry_workflow(id,stage,owner,next_action,follow_up_date) VALUES(?,?,?,?,?)',(ref,stage,self.owner,'Review synthetic enquiry',''))
        return ref

    def book(self,ref,starts=None,outcome='Not recorded',state='confirmed'):
        starts=self.now-7200 if starts is None else starts;slot=secrets.token_hex(12)
        with isolated.enquiries.connect() as db:
            while db.execute('SELECT 1 FROM demo_slots WHERE starts=?',(starts,)).fetchone():starts+=1
            db.execute('INSERT INTO demo_slots VALUES(?,?,30,?,1)',(slot,starts,self.owner))
            db.execute('INSERT INTO demo_bookings VALUES(?,?,?, ?,0)',(ref,slot,secrets.token_hex(32),state))
            event=db.execute("INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,?,'confirmed',?,30,'Synthetic',?)",(ref,slot,starts,self.now-86400)).lastrowid
            db.execute('INSERT INTO sales_demo_records VALUES(?,?,?,?,0,?,?)',(ref,'Synthetic requirements',outcome,event,self.now,self.owner))

    def proposal(self,ref,status='published',age=4*86400,expires=None,revision=1):
        with isolated.enquiries.connect() as db:
            db.execute('INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,status,created,actor,published) VALUES(?,?,?,?,?,?,10000,?,?,?,?,?,?)',(secrets.token_hex(12),ref,revision,'Synthetic proposal','Synthetic scope','Synthetic terms','USD',expires or self.now+86400,status,self.now-age,self.owner,self.now-age if status!='draft' else 0))

    def queue(self,**filters):
        with isolated.enquiries.connect() as db:return demo_recovery.queue(db,dict(role='agent',actor=self.owner),{key:[str(value)] for key,value in filters.items()},self.now)

    def test_reasons_three_markets_and_not_inferred_attendance(self):
        unbooked=self.lead('IN');missing=self.lead('GB');self.book(missing);no_show=self.lead('US');self.book(no_show,outcome='No show')
        cancelled=self.lead('IN');self.book(cancelled,state='cancelled',outcome='No show')
        with isolated.enquiries.connect() as db:db.execute('UPDATE demo_bookings SET slot_id=? WHERE enquiry_id=?',('cancelled:'+cancelled,cancelled))
        proposal=self.lead('US',age=6*86400,stage='Proposal');self.proposal(proposal,expires=self.now-1)
        result=self.queue();items={item['reference']:item for item in result['items']}
        self.assertEqual(set(items),{unbooked,missing,no_show,cancelled,proposal})
        for ref,reason in [(unbooked,'unbooked'),(missing,'attendance'),(no_show,'no_show'),(cancelled,'reschedule'),(proposal,'proposal')]:self.assertEqual(items[ref]['reasons'],[reason])
        self.assertTrue(items[proposal]['proposalExpired']);self.assertEqual(result['counts']['all'],5)
        self.assertEqual({item['reference'] for item in self.queue(country='IN')['items']},{unbooked,cancelled})
        self.assertEqual([item['reference'] for item in self.queue(bucket='no_show')['items']],[no_show])

    def test_boundaries_acceptance_closed_qa_and_new_schedule(self):
        for stage in ('Won','Lost'):self.lead(stage=stage)
        self.lead(qa=True);self.lead(age=23*3600);self.lead(age=91*86400)
        upcoming=self.lead();self.book(upcoming,starts=self.now+3600)
        accepted=self.lead(stage='Proposal');self.proposal(accepted,status='accepted')
        new_proposal=self.lead(age=6*86400,stage='Proposal');self.proposal(new_proposal,status='superseded');self.proposal(new_proposal,age=3600,revision=2)
        draft=self.lead(age=6*86400,stage='Proposal');self.proposal(draft,status='draft')
        stale=self.lead();self.book(stale,starts=self.now+7200,outcome='No show')
        with isolated.enquiries.connect() as db:db.execute("INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,'new-slot','rescheduled',?,30,'Synthetic',?)",(stale,self.now+7200,self.now))
        self.assertEqual(self.queue()['items'],[])
        self.assertEqual(len(self.queue(days=365)['items']),1)

    def test_unique_counts_pagination_and_access_guards(self):
        refs=[self.lead() for _ in range(27)];self.book(refs[0],outcome='No show');self.proposal(refs[0])
        result=self.queue();self.assertEqual(result['total'],27);self.assertEqual(result['counts']['all'],27);self.assertEqual(result['counts']['no_show'],1);self.assertEqual(result['counts']['proposal'],1)
        self.assertEqual(len(result['items']),25);self.assertEqual(len(self.queue(offset=25)['items']),2)
        with isolated.enquiries.connect() as db:
            outside=demo_recovery.queue(db,dict(role='agent',actor='someone-else@example.test'),{},self.now);self.assertEqual(outside['total'],0)
        self.assertEqual(self.request('/api/admin/demo-recovery')[0],401)
        cookie,_=self.login();self.assertEqual(self.request('/api/admin/demo-recovery?country=XX',cookie=cookie)[0],400)
        for filters in ({'days':31},{'offset':-1},{'bucket':'made-up'}):
            with self.assertRaises(ValueError):self.queue(**filters)


if __name__=='__main__':
    try:result=unittest.main(exit=False).result
    finally:isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

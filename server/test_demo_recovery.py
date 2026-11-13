"""Recovery boundaries and access rules against temporary records only."""
import datetime
import json
import secrets
import time
import unittest
import test_dashboard as isolated
import demo_recovery
import client_workflow
import operations
import sales_journey


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

    def test_completed_demo_recap_review_handoff_and_stale_delivery(self):
        ref = self.lead('GB')
        current = datetime.datetime.fromtimestamp(self.now, operations.INDIA)
        friday = current - datetime.timedelta(days=(current.weekday()-4)%7)
        self.book(ref,starts=int(friday.timestamp())-7200,outcome='Completed')
        with isolated.enquiries.connect() as db:
            db.execute('UPDATE sales_demo_records SET updated=? WHERE reference=?', (int(friday.timestamp()),ref))
        initial = self.queue(bucket='completed',country='GB')['items'][0]
        self.assertEqual(initial['reference'],ref)
        self.assertEqual(initial['postDemo']['due'],int((friday+datetime.timedelta(days=3)).timestamp()))
        self.assertEqual(initial['proposalPreparation']['status'],'Needs scope')
        cookie, csrf = self.login()
        route = '/api/admin/sales-journey'
        state = self.request(route+'?reference='+ref,cookie=cookie)[1]
        self.assertEqual(state['postDemo']['currency'],'GBP')
        self.assertEqual(state['postDemo']['body'],'')
        request = dict(reference=ref,version=0,scheduleEvent=state['record']['scheduleEvent'],recapVersion=0)
        body = 'Keep travel enquiries together. Confirm import scope and agree the next review date.'
        self.assertEqual(self.request(route,dict(request,action='recap-save',body=body),cookie)[0],403)
        self.assertEqual(self.request(route,dict(request,action='recap-send',reviewed=True),cookie,csrf)[0],400)
        self.assertEqual(self.request(route,dict(request,action='recap-save',body=body),cookie,csrf)[0],200)
        self.assertEqual(self.request(route,dict(request,action='recap-save',body='Stale edit'),cookie,csrf)[0],409)
        request['recapVersion'] = 1
        self.assertEqual(self.request(route,dict(request,action='recap-send',reviewed=False),cookie,csrf)[0],400)
        due=(current.date()+datetime.timedelta(days=3)).isoformat()
        agreed=dict(request,action='next-step',nextStepVersion=0,kind='decision-call',due=due,note='Review the import together.')
        self.assertEqual(self.request(route,dict(agreed,due='not a date'),cookie,csrf)[0],400)
        self.assertEqual(self.request(route,agreed,cookie)[0],403)
        self.assertEqual(self.request(route,agreed,cookie,csrf)[0],200)
        self.assertEqual(self.request(route,agreed,cookie,csrf)[0],409)
        preview=self.request(route+'?reference='+ref,cookie=cookie)[1]['nextStep']['preview']
        self.assertIn('Meet with the decision-maker',preview)
        self.assertIn('Review the import together.',preview)
        prepared=self.request(route+'?reference='+ref,cookie=cookie)[1]['proposalPreparation']
        self.assertEqual(prepared['status'],'Ready to draft')
        self.assertEqual(prepared['nextStep'],preview)
        self.assertEqual(prepared['dueDate'],'')
        self.assertEqual(self.request(route,dict(agreed,kind='proposal',nextStepVersion=1),cookie,csrf)[0],200)
        prepared=self.request(route+'?reference='+ref,cookie=cookie)[1]['proposalPreparation']
        self.assertEqual(prepared['dueDate'],due)
        self.assertEqual(prepared['timezone'],'Europe/London')
        self.assertIn('Review a scoped proposal',prepared['nextStep'])
        preview=prepared['nextStep']
        self.assertEqual(self.request(route,dict(request,action='recap-send',reviewed=True),cookie,csrf)[0],409)
        request['nextStepVersion'] = 2
        for _ in range(2):
            self.assertEqual(self.request(route,dict(request,action='recap-send',reviewed=True),cookie,csrf)[0],200)
        self.assertEqual(self.request(route,dict(agreed,nextStepVersion=2),cookie,csrf)[0],409)
        with isolated.enquiries.connect() as db:
            rows=db.execute('SELECT * FROM notification_outbox WHERE dedupe LIKE ?', (f'demo-recap:{ref}:%',)).fetchall()
            self.assertEqual(len(rows),1)
            self.assertIn(body,rows[0]['body'])
            self.assertIn(preview,rows[0]['body'])
            self.assertNotIn('Synthetic requirements',rows[0]['body'])
            self.assertTrue(sales_journey.recap_current(db,rows[0]))
            db.execute('INSERT INTO client_projects(reference,email,title,created) VALUES(?,?,?,?)',(ref,'qa@example.test','Synthetic recap project',self.now))
            project = db.execute('SELECT * FROM client_projects WHERE reference=?',(ref,)).fetchone()
            self.assertEqual(client_workflow.detail(db,project,True)['postDemo'],{'body':body,'currency':'GBP'})
            self.assertNotIn('postDemo',client_workflow.detail(db,project,False))
            self.assertNotIn('proposalPreparation',client_workflow.detail(db,project,False))
        self.proposal(ref,status='draft',age=0)
        self.assertEqual(self.queue(bucket='completed')['total'],1)
        prepared=self.queue(bucket='completed')['items'][0]['proposalPreparation']
        self.assertEqual(prepared['status'],'Draft ready for review')
        self.assertEqual(self.request('/api/admin/workspace/proposal-ready',
            {'reference':ref,'id':prepared['id'],'version':0,'reviewed':True},cookie,csrf)[0],200)
        self.assertEqual(self.queue(bucket='completed')['items'][0]['proposalPreparation']['status'],'Ready to publish')
        self.proposal(ref,age=0,revision=2)
        self.assertEqual(self.queue(bucket='completed')['total'],0)
        with isolated.enquiries.connect() as db:
            db.execute("UPDATE demo_bookings SET state='cancelled' WHERE enquiry_id=?", (ref,))
            self.assertFalse(sales_journey.recap_current(db,rows[0]))

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

"""Synthetic client/staff boundary tests; never use live records or send mail."""
import base64
import json
import re
import time
import unittest
import urllib.error
import urllib.request
import uuid
from unittest.mock import patch
import test_dashboard as isolated
import enquiries
import dashboard
import client_workflow as workflow

class ClientTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login

    def setUp(self):self.admin,self.admin_csrf=self.login()

    def create(self,email=None):
        email=email or uuid.uuid4().hex+'@example.com'
        status,result,_=self.request('/api/enquiries',{'type':'contact','name':'Synthetic client','email':email,'interest':'CRM','message':'Synthetic project test'})
        self.assertEqual(status,201);ref=result['reference']
        self.assertEqual(self.request('/api/admin/workspace/create',{'reference':ref,'title':'Synthetic project'},self.admin,self.admin_csrf)[0],200)
        return ref,email

    def p(self,ref,cookie=None):return self.request('/api/admin/workspace/project?reference='+ref,cookie=cookie or self.admin)[1]

    def change(self,ref,action,**data):return self.request('/api/admin/workspace/'+action,{'reference':ref,'version':self.p(ref)['version'],**data},self.admin,self.admin_csrf)

    def invite(self,ref):
        self.assertEqual(self.change(ref,'invite')[0],200)
        email=self.p(ref)['email']
        with enquiries.connect() as db:body=db.execute("SELECT body FROM notification_outbox WHERE recipient=? AND dedupe LIKE 'client-invite:%' ORDER BY id DESC",(email,)).fetchone()[0]
        return re.search(r'#invite=(\S+)',body).group(1)

    def client(self,ref):
        token=self.invite(ref);password='Synthetic-client-password-'+uuid.uuid4().hex
        status,result,headers=self.request('/api/client/activate',{'token':token,'password':password})
        self.assertEqual(status,200)
        return headers['Set-Cookie'].split(';')[0],result['csrf'],password

    def proposal(self,ref):
        response=self.change(ref,'proposal',title='Scope revision',scope='Deliver private workflow.',terms='Agreed acceptance checks; payment milestone on delivery.',value='1234.56',currency='INR',expires=int(time.time())+86400)
        self.assertEqual(response[0],200);return response[1]['proposalId']

    def demo_slot(self,starts=None):
        slot=uuid.uuid4().hex;starts=starts or int(time.time())+3600+int(slot[:5],16)
        with enquiries.connect() as db:db.execute('INSERT INTO demo_slots VALUES(?,?,?,?,1)',(slot,starts,30,dashboard.USER))
        return slot

    def journey(self,ref,cookie=None):
        return self.request('/api/admin/sales-journey?reference='+ref,cookie=cookie or self.admin)

    def demo_change(self,ref,action='record',cookie=None,csrf=None,**data):
        state=self.journey(ref,cookie)[1]['record']
        return self.request('/api/admin/sales-journey',{'reference':ref,'version':state['version'],'scheduleEvent':state['scheduleEvent'],'action':action,'requirements':'Sales workflow, named owners and quoted integrations.','outcome':'Not recorded',**data},cookie or self.admin,csrf or self.admin_csrf)

    def test_proposal_review_preserves_revision_and_shares_slot_inventory(self):
        ref,_=self.create()
        other,_=self.create()
        client,csrf,_=self.client(ref)
        outsider,_,_=self.client(other)
        first=self.proposal(ref)
        self.assertEqual(self.change(ref,'publish',id=first)[0],200)
        now=int(time.time())
        slot=uuid.uuid4().hex[:24]
        late=uuid.uuid4().hex[:24]
        with enquiries.connect() as db:
            db.execute('INSERT INTO demo_slots VALUES(?,?,30,?,1)',(slot,now+7200,dashboard.USER))
            db.execute('INSERT INTO demo_slots VALUES(?,?,30,?,1)',(late,now+86400,dashboard.USER))
            db.execute('UPDATE enquiries SET created=? WHERE id=?',(now-100*86400,ref))
        slots_route=f'/api/client/review-slots?reference={ref}&id={first}'
        self.assertEqual(self.request(slots_route)[0],401)
        self.assertEqual(self.request(slots_route,cookie=outsider)[0],404)
        slots=self.request(slots_route,cookie=client)[1]['slots']
        self.assertIn(slot,[s['id'] for s in slots]);self.assertNotIn(late,[s['id'] for s in slots])
        self.assertTrue(all(set(s)=={'id','starts','duration'} for s in slots))
        data={'reference':ref,'id':first,'action':'book','slotId':slot,'topic':'integrations'}
        self.assertEqual(self.request('/api/client/proposal-review',data,client)[0],403)
        self.assertEqual(self.request('/api/client/proposal-review',dict(data,slotId=late),client,csrf)[0],409)
        for _ in range(2):self.assertEqual(self.request('/api/client/proposal-review',data,client,csrf)[0],200)
        self.assertNotIn(slot,[s['id'] for s in self.request('/api/demo/slots')[1]['slots']])
        self.assertEqual(self.demo_change(other,'book',slotId=slot,customerAgreed=True)[0],409)
        self.assertEqual(self.request('/api/admin/slots',{'action':'close','id':slot},self.admin,self.admin_csrf)[0],400)
        current=self.request('/api/client/project?reference='+ref,cookie=client)[1]['proposals'][0]['review']
        self.assertEqual(current['topic'],'integrations')
        self.assertNotIn('host',current)
        action={'reference':ref,'id':first,'reviewId':current['id'],'reviewVersion':current['version']}
        self.assertEqual(self.request('/api/client/proposal-review',dict(action,action='cancel'),client,csrf)[0],200)
        self.assertIn(slot,[s['id'] for s in self.request('/api/demo/slots')[1]['slots']])
        self.assertEqual(self.request('/api/client/proposal-review',data,client,csrf)[0],200)
        current=self.p(ref)['proposals'][0]['review']
        action.update(reviewId=current['id'],reviewVersion=current['version'])
        staff_route='/api/admin/workspace/proposal-review'
        self.assertEqual(self.request(staff_route,dict(action,action='attended'),self.admin,self.admin_csrf)[0],409)
        self.assertEqual(self.request(staff_route,dict(action,action='meeting',url='https://meet.example.test/review'),self.admin,self.admin_csrf)[0],200)
        second=self.proposal(ref)
        self.assertEqual(self.change(ref,'publish',id=second)[0],200)
        self.assertEqual(self.request(slots_route,cookie=client)[0],409)
        queue=self.request('/api/admin/demo-recovery?bucket=proposal_review&days=7',cookie=self.admin)[1]
        item=next(item for item in queue['items'] if item['reference']==ref)
        self.assertEqual(item['proposalReviews'][0]['proposalId'],first)
        proposals=self.request('/api/client/project?reference='+ref,cookie=client)[1]['proposals']
        self.assertIsNone(proposals[0]['review'])
        self.assertEqual(proposals[1]['review']['meeting'],'https://meet.example.test/review')
        with enquiries.connect() as db:
            db.execute('UPDATE demo_slots SET starts=? WHERE id=?',(now-33333,slot))
        self.assertEqual(self.request(staff_route,dict(action,action='attended'),self.admin,self.admin_csrf)[0],409)
        action['reviewVersion']+=1
        self.assertEqual(self.request(staff_route,dict(action,action='attended'),self.admin,self.admin_csrf)[0],200)
        action['reviewVersion']+=1
        self.assertEqual(self.request(staff_route,dict(action,action='followed'),self.admin,self.admin_csrf)[0],200)
        queue=self.request('/api/admin/demo-recovery?bucket=proposal_review&days=7',cookie=self.admin)[1]
        self.assertNotIn(ref,[item['reference'] for item in queue['items']])

    def test_enquiry_demo_booking_confirmation_conflict_and_private_boundary(self):
        with urllib.request.urlopen(isolated.base+'/team-inbox/sales-journey.js') as response:
            self.assertIn('application/javascript',response.headers['Content-Type'])
            self.assertIn(b'loadSalesJourney',response.read())
        ref,email=self.create();slot=self.demo_slot()
        self.assertEqual(self.demo_change(ref,'book',slotId=slot,customerAgreed=False)[0],400)
        self.assertEqual(self.demo_change(ref,'book',slotId=slot,customerAgreed=True)[0],200)
        state=self.journey(ref)[1];self.assertEqual(state['appointment']['state'],'confirmed')
        self.assertNotIn('token_digest',state['appointment']);self.assertNotIn(slot,[s['id'] for s in state['slots']])
        self.assertEqual(self.demo_change(ref,'book',slotId=slot,customerAgreed=True)[0],409)
        with enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM enquiries WHERE id=?',(ref,)).fetchone()[0],1)
            self.assertEqual(db.execute('SELECT COUNT(*) FROM notification_outbox WHERE dedupe=? AND recipient=?',('booking:'+ref+':0',email)).fetchone()[0],1)
        self.assertEqual(self.request('/api/admin/sales-journey?reference='+ref)[0],401)
        self.assertEqual(self.request('/api/admin/sales-funnel')[0],401)
        client,_,_=self.client(ref)
        self.assertEqual(self.journey(ref,client)[0],401)
        self.assertEqual(self.request('/api/admin/sales-journey',{'reference':ref,'action':'record','version':1},self.admin,'')[0],403)

    def test_demo_requirements_outcomes_schedule_conflicts_and_proposal_privacy(self):
        ref,_=self.create();self.assertEqual(self.demo_change(ref)[0],200)
        self.assertEqual(self.demo_change(ref,outcome='Completed')[0],409)
        slot=self.demo_slot();self.assertEqual(self.demo_change(ref,'book',slotId=slot,customerAgreed=True)[0],200)
        self.assertEqual(self.demo_change(ref,outcome='Completed')[0],400)
        with enquiries.connect() as db:db.execute('UPDATE demo_slots SET starts=? WHERE id=?',(int(time.time())-3600,slot))
        self.assertEqual(self.demo_change(ref,outcome='Completed',requirements='')[0],400)
        self.assertEqual(self.demo_change(ref,outcome='Completed',requirements='PRIVATE DEMO DISCOVERY')[0],200)
        stale=self.journey(ref)[1]['record']
        self.assertEqual(self.p(ref)['salesJourney']['requirements'],'PRIVATE DEMO DISCOVERY')
        client,_,_=self.client(ref)
        self.assertNotIn('salesJourney',self.request('/api/client/project?reference='+ref,cookie=client)[1])
        newslot=self.demo_slot()
        with enquiries.connect() as db:
            db.execute('UPDATE demo_bookings SET slot_id=?,version=version+1 WHERE enquiry_id=?',(newslot,ref))
            db.execute("INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,?,'rescheduled',?,30,'customer',?)",(ref,newslot,int(time.time())+3600,int(time.time())))
        state=self.journey(ref)[1]['record'];self.assertEqual(state['outcome'],'Not recorded');self.assertEqual(state['requirements'],'PRIVATE DEMO DISCOVERY')
        self.assertEqual(self.demo_change(ref,scheduleEvent=stale['scheduleEvent'],outcome='No show')[0],400)
        self.assertEqual(self.demo_change(ref,scheduleEvent=stale['scheduleEvent'])[0],409)
        self.assertEqual(self.demo_change(ref,version=0)[0],409)
        for invalid in (None,'x'*2501):self.assertEqual(self.demo_change(ref,requirements=invalid)[0],400)

    def test_agent_demo_scope_and_qa_closed_exclusions(self):
        ref,_=self.create();other,_=self.create();qa,_=self.create()
        email='demo-agent-'+uuid.uuid4().hex+'@example.com';password='Synthetic-agent-'+uuid.uuid4().hex
        self.assertEqual(self.request('/api/admin/team',{'email':email,'name':'Demo agent','role':'agent','password':password,'active':True},self.admin,self.admin_csrf)[0],200)
        self.assertEqual(self.request('/api/admin/update',{'reference':ref,'stage':'New','owner':email,'notes':'','version':0},self.admin,self.admin_csrf)[0],200)
        _,identity,headers=self.request('/api/admin/login',{'email':email,'password':password});cookie=headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.journey(other,cookie)[0],404)
        self.assertEqual(self.request('/api/admin/sales-journey',{'reference':other,'version':0,'action':'record','requirements':'Forbidden','outcome':'Not recorded','scheduleEvent':0},cookie,identity['csrf'])[0],404)
        self.assertEqual(self.demo_change(ref,cookie=cookie,csrf=identity['csrf'])[0],200)
        counts=self.request('/api/admin/sales-funnel?days=7',cookie=cookie)[1]['counts'];self.assertEqual(counts['enquiries'],1)
        with enquiries.connect() as db:db.execute("UPDATE enquiries SET email_status='qa-verified' WHERE id=?",(qa,))
        self.assertEqual(self.journey(qa)[0],404)
        self.assertEqual(self.request('/api/admin/update',{'reference':ref,'stage':'Lost','owner':email,'notes':'','version':1},self.admin,self.admin_csrf)[0],200)
        self.assertEqual(self.demo_change(ref,'book',slotId=self.demo_slot(),customerAgreed=True)[0],409)
        self.assertEqual(self.request('/api/admin/sales-funnel?days=1',cookie=self.admin)[0],400)

    def test_demo_funnel_chronology_unique_enquiries_and_recorded_won(self):
        refs=[self.create()[0] for _ in range(3)];now=int(time.time())
        with enquiries.connect() as db:
            for ref in refs:
                db.execute("INSERT INTO enquiry_workflow(id,stage) VALUES(?,'Won')",(ref,))
                db.execute("INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,?,'confirmed',?,30,'Test',?)",(ref,'synthetic-'+ref,now,now-100))
            for index,ref in enumerate(refs):
                db.execute("INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,status,created,actor,published) VALUES(?,?,1,'Test','Test','Test',100,'USD',?,'published',?,'Test',?)",(uuid.uuid4().hex,ref,now+86400,now-200,now-150 if index==2 else now-50))
            db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,'Won','Test',?)",(refs[0],now-10))
            db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,'Won','Test',?)",(refs[1],now-70))
            db.execute("INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,'repeat','rescheduled',?,30,'Test',?)",(refs[0],now,now-90))
            agent={'role':'agent','actor':'funnel-test@example.com'}
            for ref in refs:db.execute('UPDATE enquiry_workflow SET owner=? WHERE id=?',(agent['actor'],ref))
            import sales_journey
            r=sales_journey.funnel(db,agent,7)
            empty=sales_journey.funnel(db,{'role':'agent','actor':'no-owned-leads@example.com'},7)
        self.assertEqual(r['counts'],{'enquiries':3,'demoBooked':3,'demoCompleted':0,'publishedProposals':3,'proposalAfterDemo':2,'wonAfterDemoProposal':1,'currentlyWon':3})
        self.assertEqual(r['rates'],{'enquiryToDemo':100.0,'demoToProposal':66.7,'proposalToWon':50.0})
        self.assertEqual(empty['rates'],{'enquiryToDemo':None,'demoToProposal':None,'proposalToWon':None})

    def test_client_staff_cookie_and_project_boundaries(self):
        ref,email=self.create();other,_=self.create();cookie,csrf,_=self.client(ref)
        self.assertEqual(self.request('/api/client/project?reference='+ref,cookie=cookie)[0],200)
        self.assertEqual(self.request('/api/client/project?reference='+other,cookie=cookie)[0],404)
        self.assertEqual(self.request('/api/admin/workspace/projects',cookie=cookie)[0],401)
        self.assertFalse(self.request('/api/admin/session',cookie=cookie)[1]['authenticated'])
        self.assertFalse(self.request('/api/client/session',cookie=self.admin)[1]['authenticated'])
        self.assertEqual(self.request('/api/client/project?reference='+ref,cookie=self.admin)[0],401)
        self.assertEqual(self.request('/api/client/ticket',{'reference':other,'subject':'Cross access','body':'Denied'},cookie,csrf)[0],404)

    def test_invitation_one_use_expiry_and_revocation(self):
        ref,email=self.create();token=self.invite(ref)
        self.assertEqual(self.request('/api/client/activate',{'token':token,'password':'short'})[0],400)
        status,result,headers=self.request('/api/client/activate',{'token':token,'password':'Synthetic-long-password'})
        self.assertEqual(status,200);cookie=headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.request('/api/client/activate',{'token':token,'password':'Synthetic-long-password'})[0],401)
        token2=self.invite(ref)
        with enquiries.connect() as db:db.execute('UPDATE client_invites SET expires=0 WHERE digest=?',(workflow.digest(token2),))
        self.assertEqual(self.request('/api/client/activate',{'token':token2,'password':'Synthetic-long-password'})[0],401)
        self.assertEqual(self.change(ref,'disable')[0],200)
        self.assertFalse(self.request('/api/client/session',cookie=cookie)[1]['authenticated'])

    def test_login_rate_origin_and_csrf(self):
        ref,email=self.create();cookie,csrf,password=self.client(ref);ip=uuid.uuid4().hex
        for _ in range(5):self.assertEqual(self.request('/api/client/login',{'email':email,'password':'wrong'},ip=ip)[0],401)
        self.assertEqual(self.request('/api/client/login',{'email':email,'password':password},ip=ip)[0],429)
        self.assertEqual(self.request('/api/client/login',{'email':email,'password':password},origin='https://evil.example')[0],403)
        self.assertEqual(self.request('/api/client/ticket',{'reference':ref,'subject':'Test','body':'Body'},cookie,'wrong')[0],403)
        self.assertEqual(self.request('/api/client/logout',{},cookie,csrf)[0],200)
        self.assertFalse(self.request('/api/client/session',cookie=cookie)[1]['authenticated'])

    def test_proposal_visibility_supersession_and_immutable_acceptance(self):
        ref,email=self.create();cookie,csrf,_=self.client(ref);old=self.proposal(ref)
        self.assertEqual(self.request('/api/client/project?reference='+ref,cookie=cookie)[1]['proposals'],[])
        self.assertEqual(self.change(ref,'publish',id=old)[0],200)
        new=self.proposal(ref);self.assertEqual(self.change(ref,'publish',id=new)[0],200)
        accept={'reference':ref,'id':old,'name':'Synthetic client','agree':True}
        self.assertEqual(self.request('/api/client/accept',accept,cookie,csrf)[0],409)
        accept['id']=new;accept['agree']=False
        self.assertEqual(self.request('/api/client/accept',accept,cookie,csrf)[0],400)
        accept['agree']=True
        self.assertEqual(self.request('/api/client/accept',accept,cookie,csrf)[0],200)
        self.assertTrue(self.request('/api/client/accept',accept,cookie,csrf)[1]['alreadyAccepted'])
        self.assertEqual(self.change(ref,'withdraw',id=new)[0],409)
        stored=self.p(ref)['proposals'][0]
        self.assertEqual((stored['minor_units'],stored['status']),(123456,'accepted'))
        self.assertIn(email,stored['accepted_by'])

    def test_stale_project_changes_and_expired_proposal(self):
        ref,email=self.create();version=self.p(ref)['version'];pid=self.proposal(ref)
        response=self.request('/api/admin/workspace/status',{'reference':ref,'version':version,'status':'Delivered'},self.admin,self.admin_csrf)
        self.assertEqual(response[0],409);self.assertEqual(self.p(ref)['status'],'Planning')
        self.assertEqual(self.change(ref,'publish',id=pid)[0],200);cookie,csrf,_=self.client(ref)
        with enquiries.connect() as db:db.execute('UPDATE client_proposals SET expires=0 WHERE id=?',(pid,))
        self.assertEqual(self.request('/api/client/accept',{'reference':ref,'id':pid,'name':'Client','agree':True},cookie,csrf)[0],409)

    def test_milestone_approval_boundary(self):
        ref,email=self.create();cookie,csrf,_=self.client(ref)
        self.assertEqual(self.change(ref,'milestone',title='Review',due='2026-12-10',status='Ready for review',notes='Review the supplied build.')[0],200)
        mid=self.p(ref)['milestones'][0]['id']
        self.assertEqual(self.request('/api/client/approve-milestone',{'reference':ref,'id':mid},cookie,csrf)[0],200)
        self.assertEqual(self.request('/api/client/approve-milestone',{'reference':ref,'id':mid},cookie,csrf)[0],409)
        self.assertEqual(self.p(ref)['milestones'][0]['status'],'Approved')

    def test_documents_download_ownership_and_removal(self):
        ref,email=self.create();cookie,csrf,_=self.client(ref);other,_=self.create();foreign,_,_=self.client(other)
        content=base64.b64encode(b'Private synthetic document').decode()
        self.assertEqual(self.change(ref,'document',name='project.txt',content=content)[0],200)
        did=self.p(ref)['documents'][0]['id']
        def download(c):
            req=urllib.request.Request(isolated.base+'/api/client/document?id='+did,headers={'Cookie':c})
            try:response=urllib.request.urlopen(req)
            except urllib.error.HTTPError as e:response=e
            with response:return response.status,response.read(),response.headers
        status,body,headers=download(cookie);self.assertEqual(status,200);self.assertEqual(body,b'Private synthetic document');self.assertEqual(headers['Cache-Control'],'no-store');self.assertIn('attachment',headers['Content-Disposition'])
        self.assertEqual(download(foreign)[0],404)
        self.assertEqual(self.change(ref,'document',name='../bad.txt',content=content)[0],400)
        self.assertEqual(self.change(ref,'document',name='bad.pdf',content=content)[0],400)
        self.assertEqual(self.change(ref,'remove-document',id=did)[0],200);self.assertEqual(download(cookie)[0],404)

    def test_support_internal_notes_and_stale_replies(self):
        ref,email=self.create();cookie,csrf,_=self.client(ref)
        self.assertEqual(self.request('/api/client/ticket',{'reference':ref,'subject':'Synthetic issue','body':'Please review','priority':'Urgent'},cookie,csrf)[0],200)
        ticket=self.p(ref)['tickets'][0];tid=ticket['id']
        self.assertEqual(self.change(ref,'ticket',id=tid,ticketVersion=0,body='Private internal diagnosis',internal=True,status='In progress',owner=dashboard.USER)[0],200)
        public=self.request('/api/client/project?reference='+ref,cookie=cookie)[1]
        self.assertNotIn('Private internal diagnosis',json.dumps(public));self.assertNotIn('owner',public['tickets'][0])
        self.assertEqual(self.change(ref,'ticket',id=tid,ticketVersion=0,body='Stale reply',internal=False,status='Closed',owner=dashboard.USER)[0],409)
        self.assertEqual(self.change(ref,'ticket',id=tid,ticketVersion=1,body='Public response',internal=False,status='Waiting for client',owner=dashboard.USER)[0],200)
        self.assertIsNotNone(self.p(ref)['tickets'][0]['first_response'])
        self.assertEqual(self.request('/api/client/ticket',{'reference':ref,'id':tid,'ticketVersion':2,'body':'Customer reply','internal':True},cookie,csrf)[0],403)
        self.assertEqual(self.request('/api/client/ticket',{'reference':ref,'id':tid,'ticketVersion':2,'body':'Customer reply'},cookie,csrf)[0],200)
        self.assertEqual(self.p(ref)['tickets'][0]['status'],'Open')

    def test_proposal_feedback_follows_exact_revision_and_current_sales_owner(self):
        ref,_ = self.create()
        other,_ = self.create()
        cookie,csrf,_ = self.client(ref)
        agent = uuid.uuid4().hex+'@example.test'
        password = 'Synthetic-sales-owner-password'
        with enquiries.connect() as db:
            db.execute('INSERT INTO team_users VALUES(?,?,?,?,1)', (agent,'Synthetic agent','agent',dashboard.password_hash(password)))
            db.execute("INSERT INTO enquiry_workflow(id,owner,stage) VALUES(?,?,'Qualified')", (ref,agent))
            db.execute('UPDATE enquiries SET created=? WHERE id=?',(int(time.time())-400*86400,ref))
        _,_,headers = self.request('/api/admin/login', {'email':agent,'password':password})
        agent_cookie = headers['Set-Cookie'].split(';')[0]
        pid = self.proposal(ref)
        foreign = self.proposal(other)
        self.assertEqual(self.change(other,'publish',id=foreign)[0],200)
        route = '/api/client/proposal-feedback'
        data = {'reference':ref,'id':pid,'requestId':str(uuid.uuid4()),'kind':'change','body':'Can we include spreadsheet imports?'}
        self.assertEqual(self.request(route,dict(data,id=foreign),cookie,csrf)[0],404)
        self.assertEqual(self.request(route,data,cookie,csrf)[0],404)
        self.assertEqual(self.change(ref,'publish',id=pid)[0],200)
        self.assertEqual(self.request(route,data,cookie,'wrong')[0],403)
        status,result,_ = self.request(route,data,cookie,csrf)
        self.assertEqual(status,200)
        ticket = result['ticketId']
        self.assertEqual(self.request(route,data,cookie,csrf)[1]['ticketId'],ticket)
        self.assertEqual(self.request(route,dict(data,body='Different message'),cookie,csrf)[0],409)
        client = self.request('/api/client/project?reference='+ref,cookie=cookie)[1]
        self.assertEqual(client['tickets'][0]['proposalFeedback'], {'proposalId':pid,'kind':'change','revision':1})
        self.assertNotIn('owner',client['tickets'][0])
        self.assertEqual(client['proposals'][0]['status'],'published')
        with enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT recipient FROM notification_outbox WHERE dedupe=?',('ticket-created:'+ticket,)).fetchone()[0],agent)
        queue = '/api/admin/demo-recovery?bucket=feedback'
        self.assertEqual(self.request(queue,cookie=cookie)[0],401)
        owned = self.request(queue,cookie=agent_cookie)[1]['items']
        self.assertEqual([(item['reference'],item['proposalFeedback']['owner']) for item in owned],[(ref,agent)])
        newer = self.proposal(ref)
        self.assertEqual(self.change(ref,'publish',id=newer)[0],200)
        self.assertEqual(self.request(route,dict(data,requestId=str(uuid.uuid4())),cookie,csrf)[0],409)
        self.assertEqual(self.request(route,data,cookie,csrf)[1]['ticketId'],ticket)
        self.assertEqual(self.change(ref,'ticket',id=ticket,ticketVersion=0,body='We can discuss imports.',status='Waiting for client')[0],200)
        self.assertEqual(self.request(queue,cookie=agent_cookie)[1]['items'],[])
        self.assertEqual(self.request('/api/client/ticket',dict(reference=ref,id=ticket,ticketVersion=1,body='Please send revised scope.'),cookie,csrf)[0],200)
        with enquiries.connect() as db:
            db.execute("UPDATE enquiry_workflow SET owner='',stage='Lost' WHERE id=?", (ref,))
        self.assertEqual(self.request(queue,cookie=agent_cookie)[1]['items'],[])
        item = next(item for item in self.request(queue,cookie=self.admin)[1]['items'] if item['reference']==ref)
        self.assertEqual(item['proposalFeedback']['owner'],dashboard.USER)
        self.assertEqual(item['proposalFeedback']['requests'][0]['revision'],1)

    def test_kickoff_checklist_assignment_and_start_preserve_accepted_revision(self):
        ref,_ = self.create()
        other,_ = self.create()
        cookie,csrf,_ = self.client(ref)
        staff_route='/api/admin/workspace/kickoff'
        client_route='/api/client/kickoff'
        queue='/api/admin/workspace/kickoff-queue'
        self.assertEqual(self.request(queue,cookie=cookie)[0],401)
        self.assertNotIn('kickoff',self.request('/api/client/project?reference='+ref,cookie=cookie)[1])
        pid=self.proposal(ref)
        self.assertEqual(self.change(ref,'publish',id=pid)[0],200)
        self.assertEqual(self.request('/api/client/accept',dict(reference=ref,id=pid,name='Synthetic approver',agree=True),cookie,csrf)[0],200)
        agent=uuid.uuid4().hex+'@example.test';password='Synthetic-delivery-owner-password'
        with enquiries.connect() as db:
            db.execute('INSERT INTO team_users VALUES(?,?,?,?,1)',(agent,'Synthetic delivery owner','agent',dashboard.password_hash(password)))
        _,agent_session,headers=self.request('/api/admin/login',dict(email=agent,password=password))
        agent_cookie=headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.request(queue,cookie=agent_cookie)[1]['items'],[])
        now=int(time.time());slot=now+600
        plan=dict(reference=ref,version=0,action='plan',owner=agent,materials='Share a sample import file through the agreed channel.',scheduled=slot)
        self.assertEqual(self.request(staff_route,plan,self.admin,self.admin_csrf)[0],200)
        own=self.request(queue,cookie=agent_cookie)[1]
        self.assertEqual([(row['reference'],row['owner']) for row in own['items']],[(ref,agent)])
        self.assertFalse(own['canAssign'])
        self.assertEqual(self.request('/api/admin/workspace/project?reference='+ref,cookie=agent_cookie)[0],404)
        self.assertEqual(self.request(staff_route,dict(plan,version=1),agent_cookie,agent_session['csrf'])[0],403)
        checklist=dict(reference=ref,version=1,contact='Synthetic project contact',materialsReady=True,confirmed=True)
        self.assertEqual(self.request(client_route,dict(checklist,reference=other),cookie,csrf)[0],404)
        self.assertEqual(self.request(client_route,checklist,cookie,csrf)[0],200)
        self.assertEqual(self.request(client_route,checklist,cookie,csrf)[0],409)
        second=self.proposal(ref)
        self.assertEqual(self.change(ref,'publish',id=second)[0],200)
        self.assertEqual(self.request('/api/client/accept',dict(reference=ref,id=second,name='Synthetic approver',agree=True),cookie,csrf)[0],200)
        self.assertEqual(self.request(staff_route,dict(reference=ref,version=2,action='start'),agent_cookie,agent_session['csrf'])[0],409)
        self.assertEqual(self.request(staff_route,dict(plan,version=2,scheduled=slot+60,materials='Share the revised import file.'),self.admin,self.admin_csrf)[0],200)
        project=self.request('/api/client/project?reference='+ref,cookie=cookie)[1]
        self.assertEqual(project['kickoff']['proposal'],pid)
        self.assertEqual(project['kickoff']['ownerName'],'Synthetic delivery owner')
        self.assertNotIn(agent,json.dumps(project['kickoff']))
        self.assertEqual((project['kickoff']['confirmed'],project['kickoff']['materials_ready']),(0,0))
        self.assertEqual(self.request(client_route,dict(checklist,version=3),cookie,csrf)[0],200)
        with patch.object(time,'time',return_value=slot+61):
            self.assertEqual(self.request(staff_route,dict(reference=ref,version=4,action='start'),agent_cookie,agent_session['csrf'])[0],200)
        self.assertEqual(self.request(queue,cookie=agent_cookie)[1]['items'],[])
        self.assertGreater(self.request('/api/client/project?reference='+ref,cookie=cookie)[1]['kickoff']['started'],0)
        self.assertEqual(self.request(client_route,dict(checklist,version=5),cookie,csrf)[0],409)

    def test_agent_project_scope_and_invite_restriction(self):
        ref,email=self.create();other,_=self.create();agent=uuid.uuid4().hex+'@example.com';password='Synthetic-agent-password'
        self.assertEqual(self.request('/api/admin/team',{'email':agent,'name':'Test agent','role':'agent','password':password,'active':True},self.admin,self.admin_csrf)[0],200)
        self.assertEqual(self.request('/api/admin/update',{'reference':ref,'stage':'New','owner':agent,'notes':'','version':0},self.admin,self.admin_csrf)[0],200)
        _,state,headers=self.request('/api/admin/login',{'email':agent,'password':password});cookie=headers['Set-Cookie'].split(';')[0]
        refs=[p['reference'] for p in self.request('/api/admin/workspace/projects',cookie=cookie)[1]['projects']]
        self.assertEqual(refs,[ref]);self.assertEqual(self.request('/api/admin/workspace/project?reference='+other,cookie=cookie)[0],404)
        self.assertEqual(self.request('/api/admin/workspace/invite',{'reference':ref,'version':0},cookie,state['csrf'])[0],403)
        self.assertEqual(self.request('/api/admin/workspace/report?days=30',cookie=cookie)[1]['counts']['enquiries'],1)

    def test_calendar_meeting_reminders_and_cancellation(self):
        starts=(int(time.time())//900+196)*900
        with enquiries.connect() as db:db.execute('INSERT INTO demo_slots(id,starts,duration,host) VALUES(?,?,?,?)',(uuid.uuid4().hex[:24],starts,30,dashboard.USER));slot=db.execute('SELECT id FROM demo_slots WHERE starts=?',(starts,)).fetchone()[0]
        status,result,_=self.request('/api/enquiries',{'type':'demo','name':'Synthetic calendar client','email':'calendar@example.com','interest':'CRM','message':'Calendar test','slotId':slot,'demoTimezone':'America/Los_Angeles'})
        self.assertEqual(status,201);ref=result['reference'];token=result['appointment']['manageUrl'].split('#')[1]
        def flag():
            data = self.request('/api/admin/slots', cookie=self.admin)[1]
            return next(item['missingJoiningLink'] for item in data['slots'] if item['id'] == slot)
        self.assertEqual(flag(), 1)
        workflow.reminders(enquiries.connect, starts-86401)
        with enquiries.connect() as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM notification_outbox WHERE dedupe LIKE ?",('demo-reminder:'+ref+':%',)).fetchone()[0],0)
        workflow.reminders(enquiries.connect, starts-86400)
        self.assertEqual(self.request('/api/admin/workspace/meeting',{'reference':ref,'version':0,'url':'http://unsafe.example/'},self.admin,self.admin_csrf)[0],400)
        self.assertEqual(self.request('/api/admin/workspace/meeting',{'reference':ref,'version':0,'url':'https://meet.example.com/synthetic'},self.admin,self.admin_csrf)[0],200)
        self.assertEqual(flag(), 0)
        response=self.request('/api/demo/manage',{'token':token,'action':'calendar'})[1]['calendar'];self.assertIn('URL:https://meet.example.com/synthetic',response);self.assertIn('SEQUENCE:1',response)
        self.assertTrue(all(len(line.encode())<=75 for line in response.split('\r\n')))
        workflow.reminders(enquiries.connect, starts-86300)
        with enquiries.connect() as db:
            rows=db.execute("SELECT * FROM notification_outbox WHERE dedupe LIKE ?",('demo-reminder:'+ref+':%',)).fetchall()
            self.assertEqual(len(rows),1)
            reminder=workflow.reminder_message(db, rows[0], starts-86300)
            self.assertRegex(reminder, r'P[DS]T \(-0[78]00\)')
            self.assertIn('Join: https://meet.example.com/synthetic', reminder)
            self.assertIn('/demo-booking/#'+token, reminder)
        workflow.reminders(enquiries.connect, starts-3600)
        workflow.reminders(enquiries.connect, starts-3599)
        with enquiries.connect() as db:
            rows=db.execute("SELECT * FROM notification_outbox WHERE dedupe LIKE ? ORDER BY id",('demo-reminder:'+ref+':%',)).fetchall()
            self.assertEqual([row['dedupe'].split(':')[-1] for row in rows], ['24','1'])
            self.assertIsNone(workflow.reminder_message(db, rows[0], starts-3600))
            self.assertIsNotNone(workflow.reminder_message(db, rows[1], starts-3600))
            replacement=uuid.uuid4().hex[:24]
            db.execute('INSERT INTO demo_slots(id,starts,duration,host) VALUES(?,?,?,?)',(replacement,starts+3*86400,30,dashboard.USER))
        self.assertEqual(self.request('/api/demo/manage',{'token':token,'action':'reschedule','version':1,'slotId':replacement})[0],200)
        with enquiries.connect() as db:
            self.assertIsNone(workflow.reminder_message(db, rows[1], starts-3600))
        workflow.reminders(enquiries.connect, starts+2*86400)
        with enquiries.connect() as db:
            latest=db.execute("SELECT * FROM notification_outbox WHERE dedupe LIKE ? ORDER BY id DESC",('demo-reminder:'+ref+':%',)).fetchone()
            self.assertNotEqual(latest['dedupe'],rows[0]['dedupe'])
            self.assertIn('send joining details separately',workflow.reminder_message(db,latest,starts+2*86400))
        self.assertEqual(self.request('/api/demo/manage',{'token':token,'action':'cancel','version':2})[0],200)
        with enquiries.connect() as db:
            self.assertIsNone(workflow.reminder_message(db, latest, starts+2*86400))
        calendar=self.request('/api/demo/manage',{'token':token,'action':'calendar'})[1]['calendar'];self.assertIn('METHOD:CANCEL',calendar);self.assertIn('STATUS:CANCELLED',calendar)

    def test_recorded_reporting_and_loss_reason(self):
        ref,email=self.create();pid=self.proposal(ref)
        self.assertEqual(self.change(ref,'withdraw',id=pid)[0],200)
        self.assertEqual(self.request('/api/admin/workspace/loss',{'reference':ref,'reason':'Budget'},self.admin,self.admin_csrf)[0],200)
        self.assertEqual(self.request('/api/admin/update',{'reference':ref,'stage':'Lost','owner':'','notes':'','version':0},self.admin,self.admin_csrf)[0],200)
        report=self.request('/api/admin/workspace/report?days=30',cookie=self.admin)[1]
        self.assertGreaterEqual(report['lostReasons']['Budget'],1)
        with enquiries.connect() as db:self.assertEqual(db.execute('SELECT published FROM client_proposals WHERE id=?',(pid,)).fetchone()[0],0)

if __name__=='__main__':
    try:
        result=unittest.main(exit=False).result
        if not result.wasSuccessful():raise SystemExit(1)
    finally:isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()

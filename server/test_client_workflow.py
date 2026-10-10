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
        starts=(int(time.time())//900+12)*900
        with enquiries.connect() as db:db.execute('INSERT INTO demo_slots(id,starts,duration,host) VALUES(?,?,?,?)',(uuid.uuid4().hex[:24],starts,30,dashboard.USER));slot=db.execute('SELECT id FROM demo_slots WHERE starts=?',(starts,)).fetchone()[0]
        status,result,_=self.request('/api/enquiries',{'type':'demo','name':'Synthetic calendar client','email':'calendar@example.com','interest':'CRM','message':'Calendar test','slotId':slot})
        self.assertEqual(status,201);ref=result['reference'];token=result['appointment']['manageUrl'].split('#')[1]
        self.assertEqual(self.request('/api/admin/workspace/meeting',{'reference':ref,'version':0,'url':'http://unsafe.example/'},self.admin,self.admin_csrf)[0],400)
        self.assertEqual(self.request('/api/admin/workspace/meeting',{'reference':ref,'version':0,'url':'https://meet.example.com/synthetic'},self.admin,self.admin_csrf)[0],200)
        response=self.request('/api/demo/manage',{'token':token,'action':'calendar'})[1]['calendar'];self.assertIn('URL:https://meet.example.com/synthetic',response);self.assertIn('SEQUENCE:1',response)
        self.assertTrue(all(len(line.encode())<=75 for line in response.split('\r\n')))
        workflow.reminders(enquiries.connect);workflow.reminders(enquiries.connect)
        with enquiries.connect() as db:self.assertEqual(db.execute("SELECT COUNT(*) FROM notification_outbox WHERE dedupe LIKE ?",('demo-reminder:'+ref+':%',)).fetchone()[0],1)
        self.assertEqual(self.request('/api/demo/manage',{'token':token,'action':'cancel','version':1})[0],200)
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

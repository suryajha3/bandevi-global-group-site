"""PDF privacy, revision snapshots and proposal tracking using synthetic data."""
from io import BytesIO
import datetime
import json
import secrets
import time
import unittest
import urllib.error
import urllib.request
from pypdf import PdfReader
import test_client_workflow as clients
import test_dashboard as isolated

class ExportTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login
    create=clients.ClientTests.create
    p=clients.ClientTests.p
    change=clients.ClientTests.change
    invite=clients.ClientTests.invite
    client=clients.ClientTests.client
    proposal=clients.ClientTests.proposal

    def setUp(self):self.admin,self.admin_csrf=self.login()

    def download(self,pid,cookie='',staff=True):
        url=isolated.base+('/api/admin/workspace/' if staff else '/api/client/')+'proposal-pdf?id='+pid
        request=urllib.request.Request(url,headers={'Cookie':cookie})
        try:response=urllib.request.urlopen(request,timeout=15)
        except urllib.error.HTTPError as error:response=error
        with response:return response.status,response.read(),response.headers

    def text(self,body):return '\n'.join(p.extract_text() for p in PdfReader(BytesIO(body)).pages)

    def test_pdf_snapshot_status_headers_and_hidden_staff_data(self):
        ref,email=self.create();pid=self.proposal(ref)
        with isolated.enquiries.connect() as db:
            db.execute('INSERT INTO enquiry_workflow(id,notes,owner) VALUES(?,?,?)',(ref,'INTERNAL-SECRET-NOTE','PRIVATE-OWNER'))
        status,body,headers=self.download(pid,self.admin)
        self.assertEqual(status,200);self.assertTrue(body.startswith(b'%PDF-'))
        self.assertEqual(headers['Content-Type'],'application/pdf');self.assertEqual(headers['Cache-Control'],'no-store')
        self.assertIn('attachment;',headers['Content-Disposition'])
        text=self.text(body)
        for value in ('BANDEVI GLOBAL GROUP',ref,'Draft - not published','INR 1,234.56','Deliver private workflow.',email):self.assertIn(value,text)
        self.assertNotIn('INTERNAL-SECRET-NOTE',text);self.assertNotIn('PRIVATE-OWNER',text)
        self.assertNotIn(isolated.dashboard.USER,text)

    def test_client_cannot_download_unpublished_or_other_project(self):
        ref,email=self.create();other,_=self.create();pid=self.proposal(ref);other_pid=self.proposal(other);cookie,csrf,_=self.client(ref)
        self.assertEqual(self.download(pid,cookie,False)[0],404)
        self.assertEqual(self.download(other_pid,cookie,False)[0],404)
        self.assertEqual(self.download(pid,cookie,True)[0],401)
        self.assertEqual(self.download(pid,self.admin,False)[0],401)
        self.assertEqual(self.download(pid)[0],401)
        self.change(ref,'withdraw',id=pid)
        self.assertEqual(self.download(pid,cookie,False)[0],404)
        self.assertEqual(self.request('/api/client/project?reference='+ref,cookie=cookie)[1]['proposals'],[])
        published=self.proposal(ref);self.change(ref,'publish',id=published)
        self.assertEqual(self.download(published,cookie,False)[0],200)
        self.change(ref,'disable')
        self.assertEqual(self.download(published,cookie,False)[0],401)

    def test_expiry_supersession_and_accepted_record(self):
        ref,email=self.create();cookie,csrf,_=self.client(ref);old=self.proposal(ref);self.change(ref,'publish',id=old)
        new=self.proposal(ref);self.change(ref,'publish',id=new)
        self.assertIn('Superseded - historical record',self.text(self.download(old,cookie,False)[1]))
        self.assertEqual(self.request('/api/client/accept',{'reference':ref,'id':new,'name':'Synthetic client','agree':True},cookie,csrf)[0],200)
        with isolated.enquiries.connect() as db:db.execute('UPDATE client_proposals SET expires=? WHERE id=?',(int(time.time())-5,new))
        text=self.text(self.download(new,cookie,False)[1]);self.assertIn('Accepted record',text);self.assertIn('Recorded acceptance',text)
        self.assertNotIn('Status at export: Expired',text)
        expired=self.proposal(ref);self.change(ref,'publish',id=expired)
        with isolated.enquiries.connect() as db:db.execute('UPDATE client_proposals SET expires=? WHERE id=?',(int(time.time()),expired))
        self.assertIn('Status at export: Expired',self.text(self.download(expired,cookie,False)[1]))

    def test_revision_links_and_private_first_view(self):
        ref,_=self.create()
        cookie,csrf,_=self.client(ref)
        old=self.proposal(ref);self.change(ref,'publish',id=old)
        current=self.proposal(ref);self.change(ref,'publish',id=current)
        draft=self.proposal(ref)
        other,_=self.create();other_id=self.proposal(other);self.change(other,'publish',id=other_id)
        now=int(time.time())
        exact='https://bandeviglobalgroup.com/client-workspace/?reference='+ref+'#proposal-'+current
        with isolated.enquiries.connect() as db:
            from client_workflow import pending_proposal_email
            published=db.execute('SELECT * FROM notification_outbox WHERE dedupe=?',('proposal-published:'+current,)).fetchone()
            superseded=db.execute('SELECT * FROM notification_outbox WHERE dedupe=?',('proposal-published:'+old,)).fetchone()
            self.assertIn(exact,published['body'])
            self.assertIn(exact,pending_proposal_email(db,published,now))
            self.assertIsNone(pending_proposal_email(db,superseded,now))
        queue='/api/admin/workspace/proposal-queue?q='+ref
        unopened=self.request(queue+'&bucket=unopened',cookie=self.admin)[1]['items']
        self.assertEqual([(item['id'],item['followUpLink']) for item in unopened],[(current,exact)])
        view='/api/client/proposal-view'
        payload={'reference':ref,'id':current}
        self.assertEqual(self.request(view,payload,cookie=self.admin,csrf=self.admin_csrf)[0],401)
        self.assertEqual(self.request(view,payload,cookie=cookie)[0],403)
        for denied in ({'reference':other,'id':other_id},{'reference':ref,'id':other_id},{'reference':ref,'id':draft}):
            self.assertEqual(self.request(view,denied,cookie,csrf)[0],404)
        self.assertEqual(self.request(view,payload,cookie,csrf)[0],200)
        first_view=now-10
        with isolated.enquiries.connect() as db:
            db.execute('UPDATE client_proposals SET published=? WHERE id=?',(first_view,current))
            db.execute('UPDATE client_proposal_views SET first_view=? WHERE proposal=?',(first_view,current))
        self.assertEqual(self.request(view,payload,cookie,csrf)[0],200)
        self.assertEqual(self.request(queue+'&bucket=unopened',cookie=self.admin)[1]['items'],[])
        expiring=self.request(queue+'&bucket=expiring',cookie=self.admin)[1]['items']
        self.assertEqual([(item['firstView'],item['followUpLink']) for item in expiring],[(first_view,exact)])
        self.assertEqual(self.request('/api/client/accept',{**payload,'name':'Synthetic client','agree':True},cookie,csrf)[0],200)
        with isolated.enquiries.connect() as db:
            receipt=db.execute('SELECT * FROM notification_outbox WHERE dedupe=?',('proposal-receipt:'+current,)).fetchone()
            self.assertIn(exact,receipt['body'])
            self.assertIn(exact,pending_proposal_email(db,receipt,now))

    def test_viewed_queue_time_requests_and_owner_followups(self):
        from client_workflow import proposal_business_date, proposal_followup_target
        from operations import INDIA
        friday=datetime.datetime(2026,11,13,18,tzinfo=INDIA)
        self.assertEqual(proposal_followup_target(friday.timestamp()),'2026-11-17')
        ref,_=self.create();other,_=self.create()
        cookie,csrf,_=self.client(ref)
        pid=self.proposal(ref);self.change(ref,'publish',id=pid)
        other_pid=self.proposal(other);self.change(other,'publish',id=other_pid)
        queue='/api/admin/workspace/proposal-queue?bucket=viewed&q='+ref
        read_queue=lambda: self.request(queue,cookie=self.admin)[1]['items']
        self.assertEqual(read_queue(),[])
        now=int(time.time())
        today=proposal_business_date(now)
        date=(today+datetime.timedelta(days=7)).isoformat()
        request={'reference':ref,'id':pid,'followUpVersion':0,'suggestedDate':date,'note':'Approval is next week.'}
        client_route='/api/client/proposal-more-time'
        staff_route='/api/admin/workspace/proposal-follow-up'
        self.assertEqual(self.request(client_route,{**request,'id':other_pid},cookie,csrf)[0],404)
        self.assertEqual(self.request(client_route,{**request,'suggestedDate':'2026-02-30'},cookie,csrf)[0],400)
        self.assertEqual(self.request(client_route,request,cookie,csrf)[0],200)
        self.assertEqual(self.request(client_route,request,cookie,csrf)[0],200)
        follow=read_queue()[0]['decisionFollowUp']
        self.assertEqual((follow['owner'],follow['due'],follow['version']),(isolated.dashboard.USER,today.isoformat(),1))
        self.assertTrue(follow['request']['pending'])
        self.assertTrue(follow['canFollowUp'])
        log={'reference':ref,'id':pid,'followUpVersion':1,'nextDate':''}
        self.assertEqual(self.request(staff_route,log,cookie,csrf)[0],401)
        self.assertEqual(self.request(staff_route,{**log,'nextDate':date},self.admin,self.admin_csrf)[0],400)
        self.assertEqual(self.request(staff_route,log,self.admin,self.admin_csrf)[0],200)
        self.assertEqual(self.request(staff_route,log,self.admin,self.admin_csrf)[0],409)
        self.assertEqual(self.request(client_route,request,cookie,csrf)[0],200)
        saved=read_queue()[0]
        self.assertFalse(saved['decisionFollowUp']['request']['pending'])
        self.assertFalse(saved['decisionFollowUp']['canFollowUp'])
        self.assertNotIn('followUpLink',saved)
        self.assertEqual(self.request(client_route,{**request,'note':'Updated approval meeting.'},cookie,csrf)[0],409)
        self.assertEqual(self.request(client_route,{**request,'followUpVersion':2,'note':'Updated approval meeting.'},cookie,csrf)[0],200)
        agent='viewed-proposal-agent@qa.example';password=secrets.token_urlsafe(24)
        with isolated.enquiries.connect() as db:
            db.execute('UPDATE client_proposals SET expires=? WHERE id=?',(now-1,pid))
            db.execute('INSERT INTO team_users VALUES(?,?,?,?,1)',(agent,'QA agent','agent',isolated.dashboard.password_hash(password)))
            db.execute('INSERT INTO enquiry_workflow(id,owner) VALUES(?,?)',(ref,agent))
        expired=read_queue()[0]
        self.assertEqual((expired['displayStatus'],expired['decisionFollowUp']['owner']),('Expired',agent))
        _,_,headers=self.request('/api/admin/login',{'email':agent,'password':password})
        agent_cookie=headers['Set-Cookie'].split(';')[0]
        self.assertEqual(len(self.request(queue,cookie=agent_cookie)[1]['items']),1)
        with isolated.enquiries.connect() as db:
            db.execute('UPDATE enquiry_workflow SET owner=? WHERE id=?',(isolated.dashboard.USER,ref))
        self.assertEqual(self.request(queue,cookie=agent_cookie)[1]['items'],[])
        self.assertEqual(self.request(client_route,{**request,'followUpVersion':3,'note':'A late request.'},cookie,csrf)[0],409)
        self.assertEqual(self.request(staff_route,{**log,'followUpVersion':3},self.admin,self.admin_csrf)[0],200)
        self.assertEqual(read_queue(),[])
        with isolated.enquiries.connect() as db:
            self.assertEqual(db.execute('SELECT published FROM client_proposals WHERE id=?',(pid,)).fetchone()[0]>0,True)
            self.assertEqual(db.execute("SELECT COUNT(*) FROM notification_outbox WHERE dedupe LIKE 'proposal-followup:%'").fetchone()[0],0)

    def test_tracker_buckets_search_and_exact_time_boundaries(self):
        ref,email=self.create();ids=[];now=int(time.time())
        with isolated.enquiries.connect() as db:
            for index,(state,expiry) in enumerate([('draft',now+1),('published',now+86400),('published',now-1),('published',now+9*86400),('accepted',now-1),('withdrawn',now+1),('superseded',now+1)]):
                pid=secrets.token_hex(12);ids.append(pid)
                db.execute('INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,status,created,actor,published) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',(pid,ref,index+1,'Tracker '+str(index),'Scope','Terms',100,'INR',expiry,state,now,isolated.dashboard.USER,0 if state=='draft' else now))
        for bucket,indexes in [('drafts',[0]),('awaiting',[1,3]),('expiring',[1]),('expired',[2]),('accepted',[4]),('withdrawn',[5]),('superseded',[6])]:
            result=self.request('/api/admin/workspace/proposal-queue?bucket='+bucket+'&q='+ref,cookie=self.admin)[1]
            self.assertEqual({r['id'] for r in result['items']},{ids[i] for i in indexes})
        for query in ('bucket=invalid','offset=-1','offset=bad'):self.assertEqual(self.request('/api/admin/workspace/proposal-queue?'+query,cookie=self.admin)[0],400)
        self.assertEqual(self.request('/api/admin/workspace/proposal-queue')[0],401)

    def test_agent_pdf_tracker_and_reassignment_boundary(self):
        mine,_=self.create();other,_=self.create();pid=self.proposal(mine);other_pid=self.proposal(other)
        agent='proposal-agent@qa.example';password=secrets.token_urlsafe(24)
        with isolated.enquiries.connect() as db:
            db.execute('INSERT OR REPLACE INTO team_users VALUES(?,?,?,?,1)',(agent,'QA agent','agent',isolated.dashboard.password_hash(password)))
            db.execute('INSERT INTO enquiry_workflow(id,owner) VALUES(?,?)',(mine,agent))
        status,result,headers=self.request('/api/admin/login',{'email':agent,'password':password});self.assertEqual(status,200);cookie=headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.download(pid,cookie)[0],200);self.assertEqual(self.download(other_pid,cookie)[0],404)
        rows=self.request('/api/admin/workspace/proposal-queue?bucket=all',cookie=cookie)[1]['items'];self.assertEqual([r['id'] for r in rows],[pid])
        with isolated.enquiries.connect() as db:db.execute('UPDATE enquiry_workflow SET owner=? WHERE id=?',(isolated.dashboard.USER,mine))
        self.assertEqual(self.download(pid,cookie)[0],404)

    def test_international_quote_currency_snapshots(self):
        ref,email=self.create()
        snapshots=[]
        for currency in ('INR','USD','GBP','EUR'):
            with self.subTest(currency=currency):
                response=self.change(ref,'proposal',title=currency+' quote',scope='Synthetic international scope.',terms='Amount agreed in '+currency+'. No automatic conversion.',value='1234.56',currency=currency,expires=int(time.time())+86400)
                self.assertEqual(response[0],200)
                pid=response[1]['proposalId'];snapshots.append((pid,currency))
                with isolated.enquiries.connect() as db:
                    record=db.execute('SELECT minor_units,currency FROM client_proposals WHERE id=?',(pid,)).fetchone()
                    self.assertEqual((record['minor_units'],record['currency']),(123456,currency))
                status,pdf,_=self.download(pid,self.admin)
                self.assertEqual(status,200);self.assertIn(currency+' 1,234.56',self.text(pdf))
        for pid,currency in snapshots:
            self.assertIn(currency+' 1,234.56',self.text(self.download(pid,self.admin)[1]))
        self.assertEqual(self.change(ref,'proposal',title='Unsupported',scope='Scope',terms='Terms',value='1.00',currency='XYZ',expires=int(time.time())+86400)[0],400)

    def test_long_literal_text_multipage_and_unsupported_glyphs(self):
        ref,email=self.create();body='Scope <tag> & exact commercial text. '+('A'*100)+'\n\n'
        response=self.change(ref,'proposal',title='Café proposal',scope=body*12,terms=body*12,value='0.01',currency='EUR',expires=int(time.time())+86400)
        self.assertEqual(response[0],200);pid=response[1]['proposalId'];status,content,_=self.download(pid,self.admin)
        self.assertEqual(status,200);reader=PdfReader(BytesIO(content));self.assertGreater(len(reader.pages),1)
        text=self.text(content);self.assertIn('Café proposal',text);self.assertIn('Scope <tag> & exact commercial text.',text);self.assertIn('EUR 0.01',text)
        with isolated.enquiries.connect() as db:db.execute('UPDATE client_proposals SET title=? WHERE id=?',('Unsupported \U0001f984 glyph',pid))
        self.assertEqual(self.download(pid,self.admin)[0],422)

if __name__=='__main__':
    try:result=unittest.main(exit=False).result
    finally:isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

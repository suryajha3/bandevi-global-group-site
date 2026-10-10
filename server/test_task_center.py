"""Task state, ownership, concurrency and date boundaries against synthetic data."""
import datetime
import json
import secrets
import time
import unittest
import test_dashboard as isolated

class TaskTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login
    enquiry=isolated.DashboardTests.enquiry
    def setUp(self):
        with isolated.enquiries.connect() as db:
            for t in ('followup_tasks','lead_activity','enquiry_workflow','client_proposals','client_projects','enquiries'):db.execute('DELETE FROM '+t)
    def task(self,ref,**extra):
        data={'id':secrets.token_hex(16),'reference':ref,'link_type':'enquiry','proposal_id':'','title':'Call about scope','owner':isolated.dashboard.USER,'due':isolated.dashboard.business_today().isoformat(),'priority':'Normal','status':'Open','notes':'Private synthetic note','completion':'','version':0};data.update(extra);return data
    def save(self,data,cookie,csrf):return self.request('/api/admin/tasks',data,cookie,csrf)
    def test_create_retry_complete_timeline_conflict(self):
        ref=self.enquiry();c,s=self.login();data=self.task(ref)
        for _ in range(2):self.assertEqual(self.save(data,c,s)[0],200)
        update={**data,'title':'Call for revised scope'};self.assertEqual(self.save(update,c,s)[1]['version'],1)
        self.assertEqual(self.save({**data,'title':'Stale overwrite'},c,s)[0],409)
        self.assertEqual(self.save({**update,'version':1,'status':'Completed'},c,s)[0],400)
        complete={**update,'version':1,'status':'Completed','completion':'Customer confirmed the scope.'}
        for _ in range(2):self.assertEqual(self.save(complete,c,s)[0],200)
        self.assertEqual(self.save({**complete,'version':2,'status':'Open','completion':''},c,s)[0],409)
        events=self.request('/api/admin/activity?reference='+ref,cookie=c)[1]['items'];self.assertEqual(sum(e['kind']=='task' for e in events),3)
        self.assertTrue(any('Customer confirmed the scope.' in e['body'] for e in events));self.assertEqual(self.request('/api/admin/tasks?bucket=open',cookie=c)[1]['total'],0)
    def test_date_filters_priority_mine_and_pagination(self):
        ref=self.enquiry();c,s=self.login();today=isolated.dashboard.business_today()
        for i in range(28):
            d=self.task(ref,title='Task '+str(i),due=(today+datetime.timedelta(days=(-1 if i==0 else 0 if i==1 else 7 if i==2 else 8))).isoformat(),priority='High' if i==0 else 'Normal');self.assertEqual(self.save(d,c,s)[0],200)
        r=self.request('/api/admin/tasks',cookie=c)[1];self.assertEqual(r['counts']['overdue'],1);self.assertEqual(r['counts']['today'],1);self.assertEqual(r['counts']['upcoming'],1);self.assertEqual(len(r['items']),25)
        r2=self.request('/api/admin/tasks?offset=25',cookie=c)[1];self.assertEqual(len(r2['items']),3);self.assertFalse({x['id'] for x in r['items']} & {x['id'] for x in r2['items']})
        self.assertEqual(self.request('/api/admin/tasks?priority=High&mine=me',cookie=c)[1]['total'],1)
        self.assertEqual(self.request('/api/admin/tasks?q=missing',cookie=c)[1]['counts']['open'],28)
        for q in ('bucket=no','mine=other','offset=-1','offset=bad','priority=Urgent'):self.assertEqual(self.request('/api/admin/tasks?'+q,cookie=c)[0],400)
    def test_validation_auth_and_link_integrity(self):
        ref=self.enquiry();c,s=self.login();d=self.task(ref)
        for route in ('/api/admin/tasks','/api/admin/tasks/owners','/api/admin/tasks/targets'):self.assertEqual(self.request(route)[0],401)
        self.assertEqual(self.save(d,'',s)[0],401);self.assertEqual(self.save(d,c,'')[0],403);self.assertEqual(self.request('/api/admin/tasks',d,c,s,origin='https://evil.example')[0],403)
        for bad in ({'due':'2026-02-30'},{'due':''},{'version':False},{'priority':'Urgent'},{'title':'x'*201},{'owner':'inactive@example.invalid'},{'notes':'\x00'},{'link_type':'flight'}):self.assertEqual(self.save({**d,**bad},c,s)[0],400)
        self.assertEqual(self.save({**d,'link_type':'project'},c,s)[0],404)
        with isolated.enquiries.connect() as db:
            db.execute('INSERT INTO client_projects(reference,email,title,created) VALUES(?,?,?,?)',(ref,'qa@example.invalid','Synthetic task project',int(time.time())))
            db.execute('INSERT INTO client_proposals VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',('qa-proposal',ref,1,'Synthetic proposal','Scope','Terms',100,'INR',int(time.time())+9999,'draft',int(time.time()),isolated.dashboard.USER,None,None,0))
        p={**d,'link_type':'proposal','proposal_id':'qa-proposal'};self.assertEqual(self.save(p,c,s)[0],200)
        self.assertEqual(self.save({**p,'version':0,'reference':self.enquiry()},c,s)[0],404)
        targets=self.request('/api/admin/tasks/targets?q='+ref,cookie=c)[1]['targets'];self.assertEqual(targets[0]['proposals'][0]['id'],'qa-proposal')
    def test_agent_ownership_reassignment_disabled_and_qa(self):
        ref=self.enquiry();other=self.enquiry();c,s=self.login();agent='task-agent@qa.example';password=secrets.token_urlsafe(20)
        with isolated.enquiries.connect() as db:
            db.execute('INSERT OR REPLACE INTO team_users VALUES(?,?,?,?,1)',(agent,'Task agent','agent',isolated.dashboard.password_hash(password)))
            db.execute('INSERT INTO enquiry_workflow(id,owner) VALUES(?,?)',(ref,agent))
        status,state,h=self.request('/api/admin/login',{'email':agent,'password':password});self.assertEqual(status,200);ac=h['Set-Cookie'].split(';')[0];as_=state['csrf'];d=self.task(ref,owner=agent)
        self.assertEqual(self.save(d,ac,as_)[0],200);self.assertEqual(self.save(self.task(other,owner=agent),ac,as_)[0],404)
        self.assertEqual(self.save({**d,'owner':isolated.dashboard.USER},ac,as_)[0],400)
        self.assertEqual(len(self.request('/api/admin/tasks/owners',cookie=ac)[1]['owners']),1)
        self.assertEqual(self.save(self.task(other,owner=agent),c,s)[0],400)
        self.assertEqual(self.request('/api/admin/tasks/targets?q='+other,cookie=ac)[1]['targets'],[])
        with isolated.enquiries.connect() as db:db.execute('UPDATE enquiry_workflow SET owner=? WHERE id=?',(isolated.dashboard.USER,ref))
        self.assertEqual(self.request('/api/admin/tasks',cookie=ac)[1]['total'],0);self.assertEqual(self.save({**d,'title':'Forbidden'},ac,as_)[0],404)
        with isolated.enquiries.connect() as db:db.execute("UPDATE enquiries SET email_status='qa-verified' WHERE id=?",(ref,))
        self.assertEqual(self.request('/api/admin/tasks',cookie=c)[1]['total'],0)
        with isolated.enquiries.connect() as db:db.execute('UPDATE team_users SET active=0 WHERE email=?',(agent,))
        self.assertEqual(self.request('/api/admin/tasks',cookie=ac)[0],401)
    def test_client_cookie_cannot_access_staff_tasks(self):
        from client_workflow import digest
        token=secrets.token_urlsafe(32)
        with isolated.enquiries.connect() as db:
            db.execute('INSERT OR REPLACE INTO client_accounts VALUES(?,?,1)',('client-task@qa.example',''))
            db.execute('INSERT INTO client_sessions VALUES(?,?,?,?)',(digest(token),'client-task@qa.example','client-csrf',int(time.time())+3600))
        c='bg_client_session='+token
        self.assertEqual(self.request('/api/client/session',cookie=c)[1]['authenticated'],True)
        for route in ('/api/admin/tasks','/api/admin/tasks/owners','/api/admin/tasks/targets'):self.assertEqual(self.request(route,cookie=c)[0],401)
        self.assertEqual(self.save(self.task(self.enquiry()),c,'client-csrf')[0],401)
    def test_migration_repeat_keeps_existing_records(self):
        ref=self.enquiry();c,s=self.login();d=self.task(ref);self.save(d,c,s)
        with isolated.enquiries.connect() as db:
            before=tuple(db.execute('SELECT * FROM followup_tasks WHERE id=?',(d['id'],)).fetchone());isolated.dashboard.initialize_dashboard(db);isolated.dashboard.initialize_dashboard(db);self.assertEqual(before,tuple(db.execute('SELECT * FROM followup_tasks WHERE id=?',(d['id'],)).fetchone()))

if __name__=='__main__':
    try:result=unittest.main(exit=False).result
    finally:isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

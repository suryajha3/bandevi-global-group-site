"""Attention and activity authorization against synthetic data only."""
import datetime
import json
import secrets
import time
import unittest
import test_dashboard as isolated

class LeadActionsTests(unittest.TestCase):
    request=isolated.DashboardTests.request
    login=isolated.DashboardTests.login
    enquiry=isolated.DashboardTests.enquiry

    def setUp(self):
        with isolated.enquiries.connect() as db:
            for table in ('lead_activity','inbox_audit','client_audit','enquiry_workflow','enquiries'):
                db.execute('DELETE FROM '+table)

    def change(self,ref,cookie,csrf,**extra):
        data={'reference':ref,'stage':'Contacted','owner':isolated.dashboard.USER,'notes':'Test notes','version':0,'followUpDate':isolated.dashboard.business_today().isoformat(),'nextAction':'Confirm scope'}
        data.update(extra)
        return self.request('/api/admin/update',data,cookie,csrf)

    def test_attention_rules_closed_and_qa_excluded(self):
        cookie,csrf=self.login();refs=[self.enquiry() for _ in range(6)]
        self.change(refs[1],cookie,csrf)
        self.change(refs[2],cookie,csrf,stage='Won')
        self.change(refs[3],cookie,csrf,stage='New')
        self.change(refs[4],cookie,csrf,nextAction='')
        self.change(refs[5],cookie,csrf,followUpDate=(isolated.dashboard.business_today()-datetime.timedelta(days=1)).isoformat())
        with isolated.enquiries.connect() as db:
            db.execute('UPDATE enquiries SET created=? WHERE id=?',(int(time.time())-48*3600,refs[3]))
        result=self.request('/api/admin/enquiries?followup=attention',cookie=cookie)[1]
        self.assertEqual(result['total'],4)
        self.assertEqual(result['followups']['attention'],4)
        self.assertEqual(result['items'][0]['reference'],refs[5])
        reasons={r['reference']:r['attentionReasons'] for r in result['items']}
        self.assertEqual(reasons[refs[3]],['New for 48+ hours'])
        self.assertEqual(reasons[refs[4]],['No next action'])
        with isolated.enquiries.connect() as db:db.execute("UPDATE enquiries SET email_status='qa-verified' WHERE id=?",(refs[0],))
        self.assertEqual(self.request('/api/admin/enquiries?followup=attention',cookie=cookie)[1]['total'],3)

    def test_next_action_preservation_clear_conflict_and_audit(self):
        ref=self.enquiry();cookie,csrf=self.login()
        self.assertEqual(self.change(ref,cookie,csrf)[0],200)
        legacy={'reference':ref,'stage':'Qualified','owner':isolated.dashboard.USER,'notes':'Keep action','version':1}
        self.assertEqual(self.request('/api/admin/update',legacy,cookie,csrf)[0],200)
        self.assertEqual(self.request('/api/admin/enquiries?q='+ref,cookie=cookie)[1]['items'][0]['nextAction'],'Confirm scope')
        self.assertEqual(self.change(ref,cookie,csrf,nextAction='',version=1)[0],409)
        self.assertEqual(self.change(ref,cookie,csrf,nextAction='',version=2)[0],200)
        events=self.request('/api/admin/activity?reference='+ref,cookie=cookie)[1]['items']
        self.assertTrue(any('Next action: Confirm scope → Not set' in e['body'] for e in events))
        for invalid in (None,False,'a'*301):self.assertEqual(self.change(ref,cookie,csrf,nextAction=invalid,version=3)[0],400)

    def test_activity_immutable_idempotent_and_does_not_change_stage(self):
        ref=self.enquiry();cookie,csrf=self.login()
        data={'reference':ref,'kind':'call-no-answer','body':'<script>Safe text</script>','id':secrets.token_hex(16)}
        for _ in range(2):self.assertEqual(self.request('/api/admin/activity',data,cookie,csrf)[0],200)
        self.assertEqual(self.request('/api/admin/activity',{**data,'body':'Different'},cookie,csrf)[0],409)
        result=self.request('/api/admin/activity?reference='+ref,cookie=cookie)[1]['items']
        self.assertEqual(sum(e['kind']=='call-no-answer' for e in result),1)
        self.assertEqual(self.request('/api/admin/enquiries?q='+ref,cookie=cookie)[1]['items'][0]['stage'],'New')
        self.assertEqual(self.request('/api/admin/activity',data,cookie,'')[0],403)
        self.assertEqual(self.request('/api/admin/activity',data,cookie,csrf,origin='https://evil.example')[0],403)
        self.assertEqual(self.request('/api/admin/activity?reference='+ref)[0],401)
        for extra in ({'kind':'invalid'},{'body':''},{'body':'a'*2001},{'id':3}):
            self.assertEqual(self.request('/api/admin/activity',{**data,**extra},cookie,csrf)[0],400)

    def test_agent_scope_reassignment_and_hidden_qa(self):
        ref=self.enquiry();other=self.enquiry();cookie,csrf=self.login()
        agent='timeline-agent@qa.example';password=secrets.token_urlsafe(24)
        with isolated.enquiries.connect() as db:
            db.execute('INSERT OR REPLACE INTO team_users VALUES(?,?,?,?,1)',(agent,'QA agent','agent',isolated.dashboard.password_hash(password)))
        self.change(ref,cookie,csrf,owner=agent)
        status,state,headers=self.request('/api/admin/login',{'email':agent,'password':password})
        self.assertEqual(status,200);ac=headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.request('/api/admin/activity?reference='+ref,cookie=ac)[0],200)
        self.assertEqual(self.request('/api/admin/activity?reference='+other,cookie=ac)[0],404)
        data={'reference':other,'kind':'note','body':'Forbidden','id':secrets.token_hex(16)}
        self.assertEqual(self.request('/api/admin/activity',data,ac,state['csrf'])[0],404)
        self.assertEqual(self.request('/api/admin/enquiries?followup=attention',cookie=ac)[1]['total'],0)
        self.change(ref,cookie,csrf,owner=isolated.dashboard.USER,version=1)
        self.assertEqual(self.request('/api/admin/activity?reference='+ref,cookie=ac)[0],404)
        with isolated.enquiries.connect() as db:db.execute("UPDATE enquiries SET email_status='qa-verified' WHERE id=?",(other,))
        self.assertEqual(self.request('/api/admin/activity?reference='+other,cookie=cookie)[0],404)

    def test_bounded_timeline_and_proposal_events(self):
        ref=self.enquiry();cookie,csrf=self.login()
        with isolated.enquiries.connect() as db:
            db.execute('INSERT INTO client_audit(reference,action,actor,detail,created) VALUES(?,?,?,?,?)',(ref,'publish',isolated.dashboard.USER,'proposal-id',int(time.time())+500))
            for i in range(110):db.execute('INSERT INTO lead_activity VALUES(?,?,?,?,?,?)',(str(i),ref,int(time.time())+i,isolated.dashboard.USER,'note',str(i)))
        events=self.request('/api/admin/activity?reference='+ref,cookie=cookie)[1]['items']
        self.assertEqual(len(events),100);self.assertEqual(events[0]['kind'],'proposal')

if __name__=='__main__':
    try:result=unittest.main(exit=False).result
    finally:isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

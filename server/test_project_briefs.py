"""Structured project briefs use the isolated test inbox only."""
import copy
import json
import unittest
import uuid
import test_dashboard as isolated

class ProjectBriefTests(unittest.TestCase):
    request = isolated.DashboardTests.request
    login = isolated.DashboardTests.login

    def payload(self):
        return {'type':'contact','name':'Synthetic buyer','email':'qa@example.com','interest':'CRM & ERP Package','source':'/project-brief/','message':'Guided project brief\nBudget preference (INR): Not sure yet','projectBrief':{'service':'ERP','businessType':'Professional services','problem':'Orders need a shared workflow','features':'Approvals and reporting','budget':'Not sure yet','launchDate':'2030-01-12'}}

    def test_store_private_retrieve_and_retry(self):
        data=self.payload();key=str(uuid.uuid4())
        status,result,_=self.request('/api/enquiries',data,key=key)
        self.assertEqual(status,201)
        status,retry,_=self.request('/api/enquiries',data,key=key)
        self.assertEqual((status,retry['reference']),(200,result['reference']))
        self.assertEqual(self.request('/api/admin/enquiries')[0],401)
        cookie,csrf=self.login()
        entries=self.request('/api/admin/enquiries?q='+result['reference'],cookie=cookie)[1]['items']
        self.assertEqual(entries[0]['details']['projectBrief'],data['projectBrief'])
        self.assertEqual(self.request('/api/admin/update',{'reference':result['reference'],'stage':'Contacted','owner':'Sales QA','notes':'Review budget preference','followUpDate':'2030-01-10','version':0},cookie,csrf)[0],200)
        entry=self.request('/api/admin/enquiries?q='+result['reference'],cookie=cookie)[1]['items'][0]
        self.assertEqual((entry['owner'],entry['followUpDate']),('Sales QA','2030-01-10'))
        self.assertEqual(entry['details']['projectBrief']['launchDate'],'2030-01-12')
        changed=copy.deepcopy(data);changed['projectBrief']['budget']='Under ₹50,000'
        self.assertEqual(self.request('/api/enquiries',changed,key=key)[0],409)

    def test_reject_malformed_and_inconsistent_briefs(self):
        mutations=[lambda d:d.update(type='demo'),lambda d:d.update(source='/contact-us/'),lambda d:d.update(interest='Need guidance'),lambda d:d.update(projectBrief=None),lambda d:d['projectBrief'].update(budget='Invented price'),lambda d:d['projectBrief'].update(problem=' '),lambda d:d['projectBrief'].update(features='x'*1101),lambda d:d['projectBrief'].update(launchDate='2030-02-30'),lambda d:d['projectBrief'].update(launchDate='20300112'),lambda d:d['projectBrief'].update(extra='unexpected'),lambda d:d['projectBrief'].update(problem='bad\x00value')]
        for change in mutations:
            data=self.payload();change(data)
            with self.subTest(data=data):self.assertEqual(self.request('/api/enquiries',data)[0],400)

    def test_old_briefs_remain_unchanged(self):
        data=self.payload();del data['projectBrief']
        status,result,_=self.request('/api/enquiries',data)
        self.assertEqual(status,201)
        cookie,_=self.login();entry=self.request('/api/admin/enquiries?q='+result['reference'],cookie=cookie)[1]['items'][0]
        self.assertNotIn('projectBrief',entry['details'])
        self.assertEqual(entry['details']['message'],data['message'])

if __name__=='__main__':
    try:result=unittest.main(exit=False).result
    finally:isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

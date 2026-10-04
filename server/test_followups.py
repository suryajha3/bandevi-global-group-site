"""Exercise due dates and migration using the isolated test inbox only."""
import datetime
import json
import sqlite3
import unittest
import test_dashboard as isolated

class FollowupTests(unittest.TestCase):
    request = isolated.DashboardTests.request
    login = isolated.DashboardTests.login
    enquiry = isolated.DashboardTests.enquiry

    def setUp(self):
        with isolated.enquiries.connect() as db:
            db.execute('DELETE FROM enquiry_workflow')
            db.execute('DELETE FROM enquiries')

    def change(self, ref, cookie, csrf, date, stage='Contacted', version=0):
        return self.request('/api/admin/update', {'reference':ref,'stage':stage,'owner':'Sales team','notes':'Call to discuss scope','version':version,'followUpDate':date}, cookie, csrf)

    def test_due_filters_closed_records_and_counts(self):
        cookie, csrf = self.login()
        today = isolated.dashboard.business_today()
        dates = [(today-datetime.timedelta(days=1)).isoformat(),today.isoformat(),(today+datetime.timedelta(days=7)).isoformat(),(today+datetime.timedelta(days=8)).isoformat(),'']
        refs = [self.enquiry() for _ in dates]
        for ref, date in zip(refs,dates):
            self.assertEqual(self.change(ref,cookie,csrf,date)[0],200)
        closed = self.enquiry()
        self.assertEqual(self.change(closed,cookie,csrf,dates[0],stage='Won')[0],200)
        qa = self.enquiry()
        self.assertEqual(self.change(qa,cookie,csrf,dates[0])[0],200)
        with isolated.enquiries.connect() as db:
            db.execute("UPDATE enquiries SET email_status='qa-verified' WHERE id=?",(qa,))
        for name, reference in [('overdue',refs[0]),('today',refs[1]),('upcoming',refs[2]),('unscheduled',refs[4])]:
            result = self.request('/api/admin/enquiries?followup='+name,cookie=cookie)[1]
            self.assertEqual([r['reference'] for r in result['items']],[reference])
        summary = self.request('/api/admin/enquiries',cookie=cookie)[1]
        self.assertEqual(summary['followups'],{'overdue':1,'today':1,'upcoming':1,'unassigned':0})
        self.assertEqual(summary['businessTimezone'],'Asia/Kolkata')
        self.assertEqual(self.request('/api/admin/enquiries?followup=invalid',cookie=cookie)[0],400)

    def test_clear_preserve_conflict_and_audit(self):
        ref=self.enquiry(); cookie,csrf=self.login()
        self.assertEqual(self.change(ref,cookie,csrf,'2030-01-12')[0],200)
        legacy={'reference':ref,'stage':'Proposal','owner':'Sales','notes':'Updated by an older client','version':1}
        self.assertEqual(self.request('/api/admin/update',legacy,cookie,csrf)[0],200)
        item=self.request('/api/admin/enquiries?q='+ref,cookie=cookie)[1]['items'][0]
        self.assertEqual(item['followUpDate'],'2030-01-12')
        self.assertEqual(self.change(ref,cookie,csrf,'',version=1)[0],409)
        self.assertEqual(self.change(ref,cookie,csrf,'',version=2)[0],200)
        self.assertEqual(self.request('/api/admin/enquiries?q='+ref,cookie=cookie)[1]['items'][0]['followUpDate'],'')
        with isolated.enquiries.connect() as db:
            audit=db.execute('SELECT previous,changed FROM inbox_audit WHERE enquiry_id=? ORDER BY id DESC LIMIT 1',(ref,)).fetchone()
        self.assertEqual(json.loads(audit[0])['followUpDate'],'2030-01-12')
        self.assertEqual(json.loads(audit[1])['followUpDate'],'')

    def test_invalid_dates_and_authentication(self):
        ref=self.enquiry(); cookie,csrf=self.login()
        for date in [None,False,20261004,'2026-02-30','20261004','2026-1-01','2101-01-01',"2026-01-01' OR 1=1"]:
            self.assertEqual(self.change(ref,cookie,csrf,date)[0],400)
        self.assertEqual(self.change(ref,'',csrf,'2030-01-01')[0],401)
        self.assertEqual(self.change(ref,cookie,'','2030-01-01')[0],403)

    def test_existing_database_migration_preserves_workflow(self):
        with sqlite3.connect(':memory:') as db:
            db.execute("CREATE TABLE enquiry_workflow(id TEXT PRIMARY KEY,stage TEXT,owner TEXT,notes TEXT,version INTEGER,updated INTEGER)")
            db.execute("INSERT INTO enquiry_workflow VALUES('existing','Proposal','Sales','Keep this note',5,123)")
            isolated.dashboard.initialize_dashboard(db)
            isolated.dashboard.initialize_dashboard(db)
            self.assertEqual(db.execute('SELECT stage,owner,notes,version,follow_up_date FROM enquiry_workflow').fetchone(),('Proposal','Sales','Keep this note',5,''))

if __name__ == '__main__':
    try:
        result=unittest.main(exit=False).result
    finally:
        isolated.server.shutdown();isolated.server.server_close();isolated.temporary.cleanup()
    raise SystemExit(0 if result.wasSuccessful() else 1)

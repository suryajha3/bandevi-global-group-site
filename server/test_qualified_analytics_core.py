"""Isolated synthetic CRM fixtures. No HTTP, GA4 secrets, real CRM or email."""
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock

import qualified_analytics as export

NOW = 1792497600
CONFIRMED = {'version': 1, 'service_fit': True, 'real_requirement': True, 'agreed_next_step': True, 'genuine_business_enquiry': True}
PAGES = {'/', '/travel-erp/', '/blog/automate-payment-workflows-in-travel-agencies/'}


class IntegrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='synthetic-', dir=Path(__file__).resolve().parent)
        self.path = Path(self.tmp.name) / 'synthetic.sqlite'
        self.db = sqlite3.connect(self.path)
        self.db.row_factory = sqlite3.Row
        self.db.executescript('''
        CREATE TABLE enquiries(id TEXT PRIMARY KEY,created INTEGER,payload TEXT,email_status TEXT);
        CREATE TABLE sales_events(id INTEGER PRIMARY KEY,enquiry_id TEXT,stage TEXT,actor TEXT,created INTEGER);
        ''')
        export.initialize(self.db)
        self.context = {'version': 1, 'analytics': True, 'offline_analytics': True,
                        'policy': export.POLICY, 'client_id': '123456789.1792497500',
                        'expires': NOW + 86400, 'qa': False, 'dnt': False}

    def tearDown(self):
        self.db.close()
        self.tmp.cleanup()

    def lead(self, ref='BG-SYNTHETIC', market='GB', status='pending', token=None):
        data = {'type': 'contact', 'name': 'SYNTHETIC PRIVATE NAME',
                'email': 'private@example.test', 'phone': '+12025550148',
                'message': 'PRIVATE REQUIREMENT', 'interest': 'Travel ERP Package',
                'qualification': {'country': market, 'currency': 'GBP'},
                'attribution': {'channel': 'organic_search',
                                'landing_page': '/blog/automate-payment-workflows-in-travel-agencies/',
                                'utm_campaign': 'PRIVATE_ARBITRARY_CAMPAIGN'}}
        self.db.execute('INSERT INTO enquiries VALUES(?,?,?,?)', (ref, NOW, json.dumps(data), status))
        if token:
            export.link(self.db, ref, token, NOW)
        return ref

    def event(self, ref='BG-SYNTHETIC', stage='Qualified', at=NOW+10, actor='staff@example.test'):
        return self.db.execute('INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,?,?,?)',
                               (ref, stage, actor, at)).lastrowid

    def ready(self, market='GB'):
        self.token = export.grant(self.db, self.context, NOW)
        self.lead(market=market, token=self.token)
        self.event_id = self.event()
        self.assertEqual(export.qualify(self.db, self.event_id, CONFIRMED, NOW+20, activated_at=NOW), 'pending')
        self.db.commit()

    def send(self, transport=None, **kwargs):
        return export.dispatch(self.db, 'BG-SYNTHETIC', NOW+30,
                                      allowed_pages=PAGES, transport=transport, **kwargs)

    def test_both_collection_and_sender_disabled_by_default(self):
        self.lead()
        event = self.event()
        self.assertEqual(export.qualify(self.db, event, CONFIRMED, NOW+20), 'disabled')
        self.db.commit()
        fake = Mock(return_value=204)
        self.assertEqual(self.send(fake), 'disabled')
        fake.assert_not_called()
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM ga4_crm_exports').fetchone()[0], 0)

    def test_no_missing_denied_dnt_qa_stale_or_extra_consent(self):
        cases = [None, {}, {**self.context, 'analytics': False}, {**self.context, 'offline_analytics': False},
                 {**self.context, 'dnt': True}, {**self.context, 'qa': True},
                 {**self.context, 'policy': 'old'}, {**self.context, 'expires': NOW},
                 {**self.context, 'expires': NOW+export.MAX_LINK_AGE+1},
                 {**self.context, 'client_id': 'private@example.test'},
                 {**self.context, 'client_id': 'BG-123'}, {**self.context, 'name': 'PRIVATE'},
                 {**self.context, 'analytics': 1}, {**self.context, 'version': True}]
        for context in cases:
            with self.subTest(context=context):
                self.assertIsNone(export.grant(self.db, context, NOW))

    def test_legacy_still_usable_but_not_exportable(self):
        self.lead()
        event = self.event()
        self.assertEqual(export.qualify(self.db, event, CONFIRMED, NOW+20, activated_at=NOW), 'suppressed')
        self.db.commit()
        fake = Mock(return_value=204)
        self.assertEqual(self.send(fake, enabled=True), 'not_eligible')
        fake.assert_not_called()
        self.assertIsNotNone(self.db.execute('SELECT 1 FROM enquiries').fetchone())

    def test_staff_criteria_required_and_non_qualified_actions_ignored(self):
        self.lead()
        event = self.event()
        for confirmation in [None, {}, {**CONFIRMED, 'service_fit': False},
                             {**CONFIRMED, 'real_requirement': 1}, {**CONFIRMED, 'version': True}]:
            self.assertEqual(export.qualify(self.db, event, confirmation, NOW+20, activated_at=NOW), 'staff_confirmation_required')
        for stage in ['New', 'Contacted', 'Proposal', 'Won']:
            event = self.event(stage=stage)
            self.assertEqual(export.qualify(self.db, event, CONFIRMED, NOW+20, activated_at=NOW), 'not_staff_qualified')
        event = self.event(actor='')
        self.assertEqual(export.qualify(self.db, event, CONFIRMED, NOW+20, activated_at=NOW), 'not_staff_qualified')

    def test_historical_backfill_rejected(self):
        self.lead()
        event = self.event(at=NOW-1)
        self.assertEqual(export.qualify(self.db, event, CONFIRMED, NOW+20, activated_at=NOW), 'historical_event')

    def test_stage_toggles_and_repeated_calls_are_deduplicated(self):
        self.ready()
        self.assertEqual(export.qualify(self.db, self.event_id, CONFIRMED, NOW+20, activated_at=NOW), 'pending')
        self.event(stage='Contacted', at=NOW+21)
        again = self.event(at=NOW+22)
        self.assertEqual(export.qualify(self.db, again, CONFIRMED, NOW+23, activated_at=NOW), 'repeated_qualification')
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM ga4_crm_exports').fetchone()[0], 1)

    def test_rollback_does_not_leave_phantom_qualification_export(self):
        token = export.grant(self.db, self.context, NOW)
        self.lead(token=token)
        self.db.commit()
        self.db.execute('BEGIN IMMEDIATE')
        event = self.event()
        export.qualify(self.db, event, CONFIRMED, NOW+20, activated_at=NOW)
        self.db.rollback()
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM sales_events').fetchone()[0], 0)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM ga4_crm_exports').fetchone()[0], 0)

    def test_no_pii_raw_lead_ids_arbitrary_utm_budget_or_secret_in_payload(self):
        self.ready()
        body = export.payload(self.db, 'BG-SYNTHETIC', NOW+30, allowed_pages=PAGES)
        text = json.dumps(body)
        for private in ['SYNTHETIC', 'PRIVATE', 'example.test', '12025550148', 'currency', 'budget', 'api_secret', 'user_id']:
            self.assertNotIn(private, text)
        self.assertEqual(body['events'][0]['name'], 'qualify_lead')
        self.assertEqual(body['timestamp_micros'], (NOW+10)*1000000)
        self.assertEqual(body['consent'], {'ad_user_data': 'DENIED', 'ad_personalization': 'DENIED'})
        self.assertNotIn('session_id', body['events'][0]['params'])
        self.assertNotIn('engagement_time_msec', body['events'][0]['params'])
        self.assertNotIn('user_location', body)

    def test_uk_us_business_market_and_original_landing_preserved(self):
        for market in ('GB', 'US'):
            with self.subTest(market=market):
                if market == 'GB':
                    self.ready(market)
                else:
                    row = self.db.execute('SELECT payload FROM enquiries').fetchone()
                    data = json.loads(row['payload'])
                    data['qualification']['country'] = market
                    self.db.execute('UPDATE enquiries SET payload=?', (json.dumps(data),))
                body = export.payload(self.db, 'BG-SYNTHETIC', NOW+30, allowed_pages=PAGES)
                params = body['events'][0]['params']
                self.assertEqual(params['project_market'], market)
                self.assertEqual(params['acquisition_channel'], 'organic_search')
                self.assertEqual(params['landing_page'], '/blog/automate-payment-workflows-in-travel-agencies/')
                self.assertEqual(params['service_interest'], 'travel_erp')

    def test_untrusted_context_is_allowlisted_not_forwarded(self):
        self.ready()
        data = {'interest': 'PRIVATE', 'attribution': {'channel': 'PRIVATE', 'landing_page': '/?email=PRIVATE'},
                'qualification': {'country': 'PRIVATE'}}
        self.db.execute('UPDATE enquiries SET payload=?', (json.dumps(data),))
        body = export.payload(self.db, 'BG-SYNTHETIC', NOW+30, allowed_pages=PAGES)
        self.assertNotIn('PRIVATE', json.dumps(body))
        params = body['events'][0]['params']
        self.assertEqual(params['project_market'], 'unknown')
        self.assertNotIn('landing_page', params)

    def test_initial_qa_cannot_link_or_export(self):
        token = export.grant(self.db, self.context, NOW)
        self.lead(status='qa-verified')
        self.assertFalse(export.link(self.db, 'BG-SYNTHETIC', token, NOW))
        event = self.event()
        self.assertEqual(export.qualify(self.db, event, CONFIRMED, NOW+20, activated_at=NOW), 'suppressed')

    def test_late_qa_classification_rechecked_before_send(self):
        self.ready()
        self.db.execute("UPDATE enquiries SET email_status='qa-verified'")
        self.db.commit()
        fake = Mock(return_value=204)
        self.assertEqual(self.send(fake, enabled=True), 'not_eligible')
        fake.assert_not_called()
        self.assertEqual(self.db.execute('SELECT reason FROM ga4_crm_exports').fetchone()[0], 'qa')

    def test_withdrawal_scrubs_identifier_suppresses_and_is_idempotent(self):
        self.ready()
        export.withdraw(self.db, self.token, NOW+25)
        export.withdraw(self.db, self.token, NOW+26)
        self.db.commit()
        fake = Mock(return_value=204)
        self.assertEqual(self.send(fake, enabled=True), 'not_eligible')
        fake.assert_not_called()
        self.assertEqual(self.db.execute('SELECT client_id FROM ga4_crm_grants').fetchone()[0], '')
        self.assertEqual(self.db.execute('SELECT reason FROM ga4_crm_exports').fetchone()[0], 'withdrawn')
        export.withdraw(self.db, 'bad-token', NOW+26)

    def test_expiry_scrubs_identifier_and_stale_events_do_not_retimestamp(self):
        self.ready()
        export.prune(self.db, NOW+86400)
        self.assertEqual(self.db.execute('SELECT client_id FROM ga4_crm_grants').fetchone()[0], '')
        self.assertIsNone(export.payload(self.db, 'BG-SYNTHETIC', NOW+86400, allowed_pages=PAGES))

    def test_stale_qualified_event_is_suppressed(self):
        self.context['expires'] = NOW+export.MAX_LINK_AGE
        self.ready()
        self.assertIsNone(export.payload(self.db, 'BG-SYNTHETIC', NOW+10+export.MAX_EVENT_AGE, allowed_pages=PAGES))
        self.assertEqual(self.db.execute('SELECT reason FROM ga4_crm_exports').fetchone()[0], 'stale_event')

    def test_no_identifier_in_enquiry_payload_or_private_capability_at_rest(self):
        self.ready()
        raw = self.db.execute('SELECT payload FROM enquiries').fetchone()[0]
        self.assertNotIn(self.context['client_id'], raw)
        self.assertNotIn(self.token, raw)
        self.assertNotEqual(self.db.execute('SELECT grant_hash FROM ga4_crm_grants').fetchone()[0], self.token)

    def test_no_rebinding_or_reconsent_backfill_of_legacy_record(self):
        self.ready()
        other = export.grant(self.db, self.context, NOW+1)
        self.assertFalse(export.link(self.db, 'BG-SYNTHETIC', other, NOW+1))
        self.assertFalse(export.link(self.db, 'BG-SYNTHETIC', self.token, NOW+301))

    def test_success_is_submitted_not_processed_and_never_auto_repeated(self):
        self.ready()
        fake = Mock(return_value=204)
        self.assertEqual(self.send(fake, enabled=True), 'submitted')
        self.assertEqual(self.send(fake, enabled=True), 'not_eligible')
        fake.assert_called_once()

    def test_timeout_and_non_2xx_require_manual_reconciliation_no_retry(self):
        self.ready()
        fake = Mock(side_effect=TimeoutError('Do not log private exception body'))
        self.assertEqual(self.send(fake, enabled=True), 'uncertain')
        self.assertEqual(self.send(fake, enabled=True), 'not_eligible')
        fake.assert_called_once()

    def test_http_failure_requires_review(self):
        self.ready()
        fake = Mock(return_value=500)
        self.assertEqual(self.send(fake, enabled=True), 'review_required')
        self.assertEqual(self.send(fake, enabled=True), 'not_eligible')
        fake.assert_called_once()

    def test_crash_after_claim_does_not_replay(self):
        self.ready()
        self.db.execute("UPDATE ga4_crm_exports SET status='attempting'")
        self.db.commit()
        export.recover_uncertain(self.db, NOW+30)
        self.db.commit()
        fake = Mock(return_value=204)
        self.assertEqual(self.send(fake, enabled=True), 'not_eligible')
        fake.assert_not_called()

    def test_second_worker_connection_sees_consumed_attempt(self):
        self.ready()
        other = sqlite3.connect(self.path)
        other.row_factory = sqlite3.Row
        try:
            fake = Mock(return_value=204)
            self.assertEqual(self.send(fake, enabled=True), 'submitted')
            self.assertEqual(export.dispatch(other, 'BG-SYNTHETIC', NOW+30,
                             allowed_pages=PAGES, transport=fake, enabled=True), 'not_eligible')
            fake.assert_called_once()
        finally:
            other.close()

    def test_withdrawal_committed_between_claim_and_send_wins(self):
        self.ready()
        parent = self
        class CommitBoundary:
            def __init__(self, db):
                self.db = db
                self.once = True
            def __getattr__(self, key):
                return getattr(self.db, key)
            def commit(self):
                self.db.commit()
                if self.once:
                    self.once = False
                    other = sqlite3.connect(parent.path)
                    other.row_factory = sqlite3.Row
                    try:
                        with other:
                            export.withdraw(other, parent.token, NOW+29)
                    finally:
                        other.close()
        fake = Mock(return_value=204)
        self.assertEqual(export.dispatch(CommitBoundary(self.db), 'BG-SYNTHETIC', NOW+30,
                         allowed_pages=PAGES, transport=fake, enabled=True), 'not_eligible')
        fake.assert_not_called()

    def test_qa_change_committed_between_claim_and_send_wins(self):
        self.ready()
        parent = self
        class CommitBoundary:
            def __init__(self, db):
                self.db = db
                self.once = True
            def __getattr__(self, key):
                return getattr(self.db, key)
            def commit(self):
                self.db.commit()
                if self.once:
                    self.once = False
                    other = sqlite3.connect(parent.path)
                    try:
                        with other:
                            other.execute("UPDATE enquiries SET email_status='qa-verified'")
                    finally:
                        other.close()
        fake = Mock(return_value=204)
        self.assertEqual(export.dispatch(CommitBoundary(self.db), 'BG-SYNTHETIC', NOW+30,
                         allowed_pages=PAGES, transport=fake, enabled=True), 'not_eligible')
        fake.assert_not_called()

    def test_dispatch_requires_committed_stage_transaction(self):
        self.ready()
        self.db.execute('UPDATE enquiries SET email_status=email_status')
        with self.assertRaises(ValueError):
            self.send(Mock(return_value=204), enabled=True)

    def test_deletion_scrubs_context_and_does_not_replay_qualification(self):
        self.ready()
        export.forget(self.db, 'BG-SYNTHETIC')
        self.db.commit()
        self.assertEqual(export.qualify(self.db, self.event_id, CONFIRMED, NOW+30, activated_at=NOW), 'deleted')
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM ga4_crm_grants').fetchone()[0], 0)
        self.assertIsNone(export.payload(self.db, 'BG-SYNTHETIC', NOW+30, allowed_pages=PAGES))

    def test_qualification_event_time_not_rewritten_to_submission_time(self):
        self.ready()
        body = export.payload(self.db, 'BG-SYNTHETIC', NOW+3600, allowed_pages=PAGES)
        self.assertEqual(body['timestamp_micros'], (NOW+10)*1000000)

    def test_fresh_clock_catches_expiry_while_waiting_for_send_lock(self):
        self.ready()
        fake=Mock(return_value=204)
        self.assertEqual(export.dispatch(self.db,'BG-SYNTHETIC',NOW+30,allowed_pages=PAGES,
                         transport=fake,enabled=True,clock=lambda:NOW+86400),'not_eligible')
        fake.assert_not_called()


if __name__ == '__main__':
    unittest.main(verbosity=2)

# CRM qualified-lead analytics — undeployed review candidate

This change wires the existing public contact/demo/home forms to the private website CRM. It is not the separate IT Sales or HR application. Collection and delivery default off. No credentials, account changes, deployment, real enquiries or real GA4 events are part of this review.

## Visitor and staff behavior

When collection is enabled, Analytics preferences offers a second, optional **enquiry progress analytics** choice. Existing website analytics permission alone does not enable linking. DNT, QA visits, blocked identifiers and unavailable browser storage keep linking off. Form submission continues without optional context. The privacy page explains the purpose, 30-day maximum active link, pending withdrawals and how to request help from another device.

After both permissions, the browser obtains the real website client ID through the Google tag's `get` callback. The callback times out after 250 ms. It never invents a client/session ID or reads a GA cookie directly. The private context is attached separately to the accepted enquiry request. It is excluded from business payload validation, the existing idempotency digest, notification emails and staff enquiry details. A retry cannot bind the enquiry to a different context.

The browser stores only an opaque revocation capability, expiry and pending state. GA IDs, customer fields, enquiry IDs and request IDs do not enter that storage. The server stores the capability hash and analytics identifier in separate restricted tables. The client must persist a withdrawal control before attaching a context. A capability can only withdraw permission, not read or update an enquiry.

Staff selecting Qualified can separately confirm a genuine business enquiry, real requirement, service fit and agreed next step. All four confirmations and eligible current consent are required to queue `qualify_lead`. An ordinary sales-stage save still works without them. No event is inferred from a form save, click, budget, demo booking, Proposal or Won. First qualification is recorded once per enquiry; toggling stages cannot create another analytics export. Qualification and enqueue share the existing authenticated, role/ownership/CSRF/version-checked transaction. Optional analytics storage failures do not roll back a valid business save.

The inbox also allows an authorised staff member to record a customer's withdrawal against an accessible enquiry. A checked customer-request confirmation is required. This supports another device or lost browser storage. Aggregate delivery states are available to managers at `/api/admin/qualified-analytics`; agents cannot read the whole-company report. No client IDs or capabilities are returned there.

## Withdrawal, expiry and QA

Browser withdrawal immediately stops new linking. Known capabilities are queued locally, sent in a same-origin POST and removed only after server acknowledgement. The UI distinguishes pending withdrawal from confirmed server withdrawal. Online, pageshow, visibility and cross-tab changes retry it. New linking remains blocked while a withdrawal is pending. Declining website analytics, DNT detected on return, or expiry also stops linking.

The withdrawal API continues working while collection is disabled. It records revocation tombstones even for a capability whose delayed enquiry has not arrived yet. A late accepted request therefore cannot revive withdrawn permission. Withdrawn/expired IDs are scrubbed from active linking records. The worker checks expiry every cycle and before delivery; browser preference expiry is not the only protection. A browser which never returns cannot report a new DNT state; the 30-day server expiry and staff withdrawal remain available.

Known `qa-verified` records, client QA/debug flags, DNT and a suppress-only QA header cannot export. The genuine-business confirmation is separate from absence of a QA marker. QA and consent are checked again after the durable delivery claim. A withdrawal/QA update committed in that gap wins. Google developer QA filtering remains unchanged and is a secondary control: this code suppresses QA before transport. A record marked QA after delivery needs reconciliation; this cannot retract an event already processed by Google.

The process uses short SQLite write transactions except for the final bounded HTTP attempt (maximum five seconds). This serializes acknowledged withdrawal against send, but can delay another writer. Measure staff/intake latency in staging before activation. No long background retry is allowed for an uncertain delivery.

## Sending and reporting

The worker is independent of email notifications. Two environment switches and an activation timestamp are required:

```text
GA4_CRM_ENABLED=0
GA4_CRM_SEND_ENABLED=0
GA4_CRM_ACTIVATED_AT=0
# GA4_CRM_API_SECRET is intentionally absent.
```

There is no production activation in this PR. Both switches must remain off for deployment review until criteria, notice, retention and operational checks are accepted. API secrets belong only in restricted server configuration, never Git or static assets. Transport is pinned to `region1.google-analytics.com`, stream `G-TGK7Z8VNJX` (audited property 545292647). Redirects are refused and exception text is redacted. Test mode refuses the real transport even if switches are set. All tests mock or block Google delivery.

The event uses the actual first qualification timestamp, a genuine consented client ID and fixed/allowlisted service, original acquisition category, original landing path and business-country `project_market`. No names, email, phone, private notes, message, budget, enquiry reference, arbitrary campaign text, IP override, monetary estimate or staff identity is exported. Advertising consent fields remain denied. Analytics consent is enforced by our eligibility gate; the Measurement Protocol consent object does not offer an `analytics_storage` property.

Original CRM acquisition labels are custom context, not overrides of GA4 source/medium. `project_market` is business country, not measured visitor geography. An old browser session is not attached to a qualification occurring days later. No session ID or fabricated engagement duration is sent; native session attribution and Realtime completeness are therefore not promised. CRM remains the source for all saved and qualified enquiries, including analytics-off records.

Delivery is at-most-once attempted, not exactly-once processed. A durable per-enquiry claim prevents replay on repeated saves, another worker, timeout or crash. A 2xx result is **submitted**, not verified processed. Non-2xx requires review; timeouts/interrupted claims remain **uncertain** and are never automatically retried. Events 72 hours old or older are suppressed rather than retimestamped. Old enquiries/qualifications are not backfilled, and later reconsent does not revive old suppressed exports.

## Review and release checks

* Additive SQLite tables are initialized by the existing enquiry service. They are separate from mail payloads and normal staff serialization. No database was migrated in production.
* The new public routes need the reviewed `server/analytics-consent.nginx.conf` location inside the BANDEVI server block. It disables access logging and preserves the existing loopback service/port. Nothing applies it automatically. Existing public/CRM routes, THG travel and HR are not changed.
* Existing qualification and ownership tests stay in place. New core, real-local-HTTP and browser regressions run in CI. Google requests are blocked/mocked; there is no live test event.
* Before activation: review the staff criteria and notice, the 30-day identifier limit and durable-ledger/backup retention; verify other external senders will not duplicate these events; validate a synthetic payload with Google's debug endpoint; verify a separately controlled test-property event; confirm production stream/secret privately; check real worker latency and consent/QA exclusion. A separately authorised production test is still required. This PR's local test mode cannot send to Google.
* A local deletion helper scrubs identifier/link data and leaves a no-replay tombstone while the CRM reference exists. Full CRM deletion, backup handling and previously sent Google events require the existing identity-verified deletion process; withdrawal does not undo sent events. Restoring a backup must preserve a current revocation/attempt ledger before sending can resume.
* Rollback: set both flags off, stop delivery, preserve uncertain-attempt and revocation records, and keep withdrawal/pruning available. Do not restore an old consent snapshot and resume sending.

The ERP sample proposal stays unpublished; Goodfirms stays pending; article and outreach drafts stay unpublished and unsent.

## Primary references

[Recommended lead events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events), [Measurement Protocol reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference), [sending events](https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events), [attribution use cases](https://developers.google.com/analytics/devguides/collection/protocol/ga4/use-cases), [validation](https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events). Checked 20 October 2026. Validation success alone does not establish live processing, consent, attribution or API-secret correctness.

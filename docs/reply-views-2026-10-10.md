# Reply drafts and personal inbox views

Bandevi private staff inbox only. No travel, B2B, white-label or CRM changes.

Each enquiry has a Reply draft action with first-contact, demo invitation, follow-up and proposal next-step templates. Drafts include only the current customer's name, service, email and enquiry reference. They do not infer published proposals, confirmed meetings, commercial terms, or completed contact. Staff edit subject/body, review the recipient and draft, then copy into their email app. Changing the template requires an explicit Replace draft action; changing text requires renewed review. Clipboard denial displays a selected manual-copy buffer. Closing or signing out clears drafts. Drafts are not stored, sent, or logged as contacted automatically.

Quick views include My leads, Due today and Needs attention. Up to eight named personal views store stage/source/follow-up/owner filters in browser localStorage under the signed-in account. They do not store customer search text, enquiry records, credentials or draft content, and do not synchronize to other browsers. Names render as text. Stored filter values are validated and allowlisted; malformed/unavailable storage leaves normal filtering usable. Selecting a saved view clears temporary search and resets pagination. A repeated view name updates that saved view; Delete removes the preference without altering enquiries.

My leads uses an authenticated owner equality filter (`assigned=me`), independent of textual matches in payloads. Agents retain their assigned-only boundary even when choosing All accessible leads. Summary counts remain scoped to staff permissions and independent of inbox filters.

The pipeline summary is collapsed by default with active/attention totals in its heading; its existing clickable counters remain available when expanded. Sender configuration is shown in Settings. Per-enquiry notification status remains in the enquiry detail. Responsive controls bring customer requests higher on desktop/mobile.

Validation: backend exact-owner filtering, invalid query, agent scope and existing attention/activity suite; 21 inbox browser scenarios including review/copy, clipboard fallback, storage persistence/errors, account isolation, draft clearing and four viewport widths. GitHub also runs the complete backend and public browser regression suites.

Release from clean production baseline 7f1a49f900ee8e5f980f1688707ad8fc10bac448 after a verified application/config/database backup. Restart only bandevi-enquiries for the owner-filter backend change; no schema or routing changes. Verify served hashes, protected APIs, live read-only signed-in workflow, health, backup and monitoring. Roll back source and restart Bandevi on verification failure.

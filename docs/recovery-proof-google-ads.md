# Recovery queue, customer proof and Google Ads click imports

## Sales workspace

**Demo recovery** is available to signed-in staff. Agents receive only assigned
leads; administrators and managers receive the accessible company queue. Filter
by actual saved business country, reason and received-date period. Country is
never inferred from a campaign name.

- Unbooked: New, Contacted or Qualified enquiries at least 24 hours old, with no
  appointment or current published proposal.
- Recorded no-show: an explicit outcome for the current schedule. A new
  reservation/reschedule invalidates the old schedule's effective outcome.
- Reschedule: a recorded reschedule-needed outcome or cancelled appointment.
- Outcome missing: a confirmed appointment has ended without a recorded outcome;
  this does not imply a no-show.
- Proposal awaiting decision: the current published revision is at least 72 hours
  old. Accepted, superseded, withdrawn and draft revisions are excluded. Expired
  published proposals are flagged for a terms review. Offline replies are not
  inferred; publication status only proves that acceptance is not recorded.

Accepted proposals suppress demo-chasing reasons. Closed and deployment-QA
enquiries are excluded. Counts respect the country/period filter and count each
lead once in All, even if it has several reasons. Pagination is 25 entries.
Use Open enquiry to assign ownership, next action and follow-up. Reply drafts
require review and copying; the queue never sends messages, books appointments,
records outreach or changes sales stages by itself.

## Customer case-study template

Managers can use **Customer proof** to prepare an internal worksheet. Enter
actual scope, evidence, limitations, optional measured results and exact approved
quotes. The draft records missing permission/evidence rather than inventing
claims. It remains marked INTERNAL DRAFT even after its review checklist is
completed. Publication is a separate action outside this tool.

Entered text stays in page memory; logout and reload clear it. Download to retain
a copy in approved storage. Blank downloads omit entered customer information.
The shareable blank worksheet is `/assets/bandevi-customer-case-study-template.txt`.
No live customer case study or testimonial is added by this release.

## Google Ads setup

**Google Ads setup** is manager/admin-only. All three market profiles start in
draft with blank Customer IDs; no credentials or account identifiers are guessed.
Configure the conversion-owning account for each landing-page market and confirm
the exact existing imported-click action names. Defaults are suggested names,
not a claim those Google actions exist. Settings are versioned and audited.
Confirmed means staff-checked; this application has no Google account connection
or automatic upload service.

When the same account serves all markets, the same Qualified and Won actions
may be used across profiles. Choose one primary bidding goal to avoid counting
multiple funnel stages as the same campaign objective. A proposed starting
setup is Qualified primary, Won secondary, Count One, with zero value for
Qualified. Verify actual action types, customer-data terms, conversion windows,
auto-tagging and the account's supported import method in Google Ads.

### Permission and storage

Only configured `/us/travel-agency-crm/`, `/uk/travel-agency-crm/` and
`/india/travel-agency-crm/` pages offer the separate, unchecked permission when a
valid GCLID is present. No permission is inferred from analytics consent. Do Not
Track and Global Privacy Control prevent the integration attaching click data.
Enquiries and demo booking work without permission or a connected Ads account.

The server validates the choice and captures a click only while the matching
market profile is confirmed. Capture shares the enquiry's atomic transaction.
The GCLID is excluded from the saved enquiry JSON, notification text, analytics
events and preview responses. It is stored in `ads_clicks` with a policy version,
server receipt time, landing-page market and captured Customer ID. The original
business-country preference remains separate and editable.

Active click records expire after 90 days. Cleanup runs on initialization,
capture, management queries/exports and the existing notification-worker loop.
Protected backup copies follow existing backup retention. A staff-access-checked
withdrawal deletes the stored identifier and permanently excludes that enquiry
from future exports. It does not automatically retract external files or prior
Google imports; those require the approved external data process.

Changing a market's Customer ID does not remap old captured identifiers. Such
rows are blocked as account mismatches. Verify which account owns the click and
restore the correct configuration before attempting an import.

### Review and export

Preview a 7/30/90-day milestone period. Qualified needs a real recorded Qualified
stage event; a current stage alone is insufficient. Won requires a recorded Won
event, the current Won stage and an explicit recorded deal value/currency.
Neither a review request, a booking, a proposal estimate nor its acceptance is
treated as a Won conversion. QA, expired or withdrawn click records are excluded.

The preview contains no raw GCLIDs or customer contact details. Staff explicitly
review the target account and rows before requesting a CSV. The server recomputes
the preview digest inside the transaction; changed settings, new conversions or
withdrawn consent require another review. The file contains:

`Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Ad User Data,Ad Personalization,Order ID`

Times use UTC and an explicit `+0000` offset. Qualified value is zero; Won value
is the recorded agreed amount in its original currency, without application FX
conversion. Ad User Data is Granted only for the explicit stored permission;
Ad Personalization is Denied. Stable order IDs are derived from account, click
and milestone. Repeated click/milestone records are combined to match the One
counting setup. More than 5,000 matching rows requires a shorter review period.

Downloading is not uploading and is never shown as Google-confirmed attribution.
Use Google's preview/error report and verify the receiving account before applying
the file. Google validates click ownership, windows and action configuration.
Subsequent deal corrections or reopened wins may require Google conversion
adjustments; this application does not retract past imports automatically.

This is a GCLID click-import setup. It does not enable enhanced email/phone
matching, GBRAID/WBRAID, external fractional attribution, remarketing, advertising
spend or scheduled uploads. Enhanced conversions require the appropriate Google
Data Manager/account setup; do not label this click-only file as enhanced data.

Official implementation references checked 21 October 2026:

- [Google click-conversion file format and imports](https://support.google.com/google-ads/answer/7014069?hl=en)
- [Enhanced conversions for leads](https://support.google.com/google-ads/answer/15713840?hl=en)
- [Qualified or converted-lead goals](https://support.google.com/google-ads/answer/10029210?hl=en-GB)

## Release checks

Run all backend/browser suites in `website-preview.yml`, including
`test_demo_recovery.py`, `test_ads_measurement.py` and
`scripts/qa-recovery-proof-ads.cjs`. Fixtures use temporary databases with no mail
worker or Google upload client. Check additive tables, staff ownership/role and
CSRF boundaries, stale previews, privacy withdrawal/expiry, stable imports and
the original enquiry-to-booking journey. Production verification is read-only;
do not create synthetic production leads, configure pretend account IDs, send
customer messages or upload test conversions to a real Google account.

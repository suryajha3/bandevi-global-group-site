# CRM campaign pages and enquiry-to-demo handoff

The dedicated destinations are `/us/travel-agency-crm/`, `/uk/travel-agency-crm/`
and `/india/travel-agency-crm/`. Each has its own canonical URL, reciprocal
language alternates, sitemap entry, market copy and editable country default.
USD, GBP and INR are quotation preferences, not converted or published prices.
Regional service pages link to these campaigns. The prepared Search/LinkedIn
draft pack points at them while retaining its existing campaign tags, draft
status and unset budgets. This release does not launch advertising.

## Customer journey

1. Enter name, email, business country and requirements. CRM is preselected.
   Budget, contact preferences and a structured workflow review are optional.
2. Save the enquiry once. Its reference and original campaign attribution stay
   attached to the same record. No appointment is created at this step.
3. The receipt and transactional acknowledgement offer a private booking link
   for seven days. It opens `/demo-booking/` with a fragment capability, never
   a reference-only public lookup or personal details in a query string.
4. Choose a published slot in the browser's detected or selected time zone.
   Times apply daylight-saving rules for the meeting date and show an IST
   reference. Only a successful reservation confirms a meeting.
5. The confirmation exposes the existing management link for calendar download,
   cancellation and rescheduling. Joining details are sent separately.

If no times are published, the saved enquiry remains available to the team;
the page explicitly says no meeting is confirmed and offers contact/refresh.
Phone-only enquiries retain their existing follow-up flow without a booking
capability because the booking system requires a customer email address.

## Storage and privacy

`server/demo_handoff.py` validates an HMAC-SHA256 capability using the existing
stable `RATE_LIMIT_SALT`. Keep that setting unchanged across ordinary releases.
Changing it intentionally revokes these links. Booking-management capabilities
use a separate HMAC purpose. No schema, credential, hosting or routing change
is required. The existing private booking page uses no-referrer, no-index and
self-only CSP headers. Its API responses are no-store; it loads no analytics.

`POST /api/demo/handoff` accepts `view` or `book` and requires an approved Origin.
Responses contain service/country/currency, published slots and an appointment
receipt, without name, email, phone, private notes or the full stored payload.
Unbooked capabilities expire after seven days; confirmed/cancelled appointment
receipts remain manageable by their existing private capability. Hidden QA
records and closed Won/Lost enquiries cannot create new reservations.

Booking uses the original enquiry ID in a SQLite immediate transaction. Slot
uniqueness prevents competing reservations; identical retries return the same
receipt without a second event or confirmation email. A pre-existing staff
booking keeps its original management token; customers use their email link.
Cancelled appointments use the existing rescheduling flow rather than inserting
a second booking. Campaign-to-sales reporting consumes the same appointment
events and lead attribution as staff-created bookings.

## Release checks

Run all backend suites in `website-preview.yml`, including
`server/test_demo_handoff.py`. The latter checks the three markets, private link
validation/expiry, retry stability, slot bounds, concurrent reservations,
closed/QA records, staff-token preservation, calendar and cancellation.

Run `scripts/qa-crm-acquisition.cjs` with pinned Playwright 1.56.1. It uses a
temporary loopback fixture with no mail worker and exercises static/source
pages at 390/1440 px, four primary fields, optional workflow reviews, original
campaign attribution, booking, local zones, management and failure states.
The existing regional campaign, review, homepage and demo tests still apply.
Production verification must be read-only: asset hashes, private API guards,
health and isolated runtime tests. Never create a production test lead or slot.

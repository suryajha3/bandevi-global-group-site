# Recorded response and demo coverage

The private sales workspace has a **Response & coverage** view. This release is
read-only reporting: it adds no tables, settings, reminders, outreach, published
slots or reservations. Edit ownership and log contact through the existing enquiry
editor. Publish only approved host times through the existing Demos screen.

## Response evidence

`GET /api/admin/response-times` requires the existing staff session. Agents receive
only enquiries currently assigned to their exact account; managers/admins can
review all accessible enquiries. Country comes from the saved version-1 business
country preference, never the campaign URL. Other/unknown countries stay separate.

The cohort is enquiries received in the last 7/30/90/365 days. QA and future-dated
records are excluded. First contact is the earliest `call-connected` or
`email-sent` activity logged at/after receipt and at/before the snapshot. Multiple
activities do not duplicate a lead. These are staff-recorded log times, not proof
of delivery, the actual offline contact time or a customer reply. Notes, voicemail,
unanswered calls and automated acknowledgement emails do not count. Sales-stage
progress without contact evidence is labelled separately. This deliberately uses
a stricter basis than the existing journey report's stage-progression proxy.

Median/average and within-target counts use contacted leads, including closed
ones. Uncontacted leads are not zero-time responses. Waiting/unassigned queues
exclude Won/Lost. The 4/24/48-hour target is an elapsed-hour review filter, including
nights/weekends, not a promised SLA or a business-hours calculation. At the exact
target a waiting record is not yet over target. Queue pagination is 25 rows;
older over-target records come first. The existing editor records changes with
its own access controls and audit history. Closing it refreshes the response view.

## Coverage

`GET /api/admin/demo-coverage` is manager/admin-only. It uses the same first 100
active, future, unreserved slots as `/api/demo/slots`, within that endpoint's
180-day upper bound. Slot IDs, host accounts and customer/booking details are not
returned. Reservations/cancellations can change the snapshot immediately.

The 7/14/30-day calendar window includes the current date in each named time zone.
A covered weekday has at least one full 15/30/45/60-minute slot inside 09:00–17:00
Monday–Friday. An ended local window is labelled elapsed and excluded from gaps
and the denominator; weekends and elapsed times cannot fill a gap. Holidays are
not excluded. This is a planning view of published bookability, not a guarantee
of staffing, working hours, support or appointment confirmation.

US rows cover Eastern, Central, Mountain, Pacific, Arizona, Alaska and Hawaii;
UK uses Europe/London and India uses Asia/Kolkata. IANA zones apply their actual
DST offsets. A single slot may fit several zones but can be reserved only once:
do not add row counts to estimate total capacity. If the public 100-slot limit is
reached the view says so and does not count later slots that are not exposed yet.
The existing slot publisher remains in India time; staff must confirm both local
market time and IST before publishing. This view never creates availability.

## Verification

Run `python3 -B server/test_response_coverage.py` from the repository root (or
`python3 -B test_response_coverage.py` from server/) and
`node scripts/qa-response-coverage.cjs` with the pinned Playwright runtime. Tests
use temporary synthetic data and no mail worker. They cover evidence timestamps,
country, target boundaries, roles/current ownership, pagination, read-only SQL,
reserved/inactive/elapsed/weekend/cross-boundary slots, DST, public-list limits,
mobile layouts, existing editors, sign-out and late-response data cleanup.

Run the full backend/browser release gates before publication. Production checks
must remain read-only: verify assets, service health, unauthenticated API guards
and aggregate report generation without exposing customer information or creating
production test contacts, leads, bookings or slots.

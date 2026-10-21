# CRM comparison and interactive example

The US, UK and India `/travel-agency-crm/` campaign pages compare three proposed
starting scopes: Lead essentials, Sales team workflow and Connected operations.
All display custom quotation in the page's USD, GBP or INR preference. No amount,
subscription entitlement, fixed delivery date or support commitment is invented.
Setup, migration, training, hosting, licences, provider fees, taxes and maintenance
must be confirmed in the written proposal.

Selecting a scope opens the existing optional enquiry section. It preserves the
customer's requirements, business country, currency and campaign attribution.
The choice is editable/optional and becomes one labelled line in the existing
enquiry message, so the current saved-reference and demo-booking handoff continue
to work. Form reset clears the choice; resubmission uses the existing idempotency
mechanism. No new customer store, API, account permission or booking flow is added.

The embedded interactive example uses fixed fictional travel records. Visitors
assign a consultant, set a next action and due date, and prepare a sample quote.
Quote preparation requires both assignment and follow-up. Changing an earlier
step invalidates dependent state. Reset/reload clears all actions; switching the
example market also clears the demo. US, UK and India amounts are independent
illustrations in USD, GBP and INR, not FX conversions or BANDEVI software prices.
Date labels use each example's stated market zone, separate from the real enquiry.

Demo actions make no fetch, booking, payment, message or storage calls. They do
not populate the real enquiry with fictional customer names or amounts. Inputs
are predefined, controls use native keyboard access, and status changes have
live-region feedback. JavaScript-disabled pages retain the comparison, enquiry
anchors, captioned video, email fallback and explanation of the sample workflow.

Run `node scripts/qa-crm-buyer.cjs` with the pinned Playwright runtime. The fixture
uses a temporary database and no mail worker. Tests cover source and static pages,
mobile/desktop layout, keyboard assignment, gated steps, stale quotes, resets,
blocked browser storage, preserved requirements, saved scope, country/currency,
campaign tags and enquiry-to-demo handoff. Run the existing acquisition and
consent/Ads regression suites too. `--live` blocks every non-GET request, omits
submissions and checks only public production pages. Never create live test leads.

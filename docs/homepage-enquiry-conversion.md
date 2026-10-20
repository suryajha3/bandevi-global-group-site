# Focused homepage and regional enquiry entry

The homepage now presents one service comparison, one people/evidence/handover section, an enquiry form, regional routes and a collapsed brand explanation. Duplicate CRM promotion, selected-work cards, service explorer, planning, delivery and evidence sections are consolidated into the remaining content and linked detail pages. Existing project records and disclosures remain available.

The CRM hero preview uses readable HTML for Capture, Assign and Follow up. It links directly to the existing captioned walkthrough. It is labelled fictional, while the other featured projects retain screenshots, source disclosures and the accessible screenshot viewer. US, UK and India routes are visible beside the main introduction.

## Enquiries

The homepage, contact page and US/UK/India regional forms start with four required fields: name, email, business country and requirements. Existing contact forms still accept a valid phone number instead of email. Optional service selection defaults to Need guidance; inbound service aliases and campaign/project context are retained.

Service, budget, telephone and contact preferences remain available under a disclosure. Country still determines USD, GBP or INR. No prices or exchange rates are inferred. A basic US enquiry can defer choosing a contact time zone. Its unscheduled preference uses the existing UTC/discuss sentinel; this is not a claim about the customer's location. UK and India retain their existing London/IST defaults. Any requested contact date/time requires both values and an explicit zone if none is known. Invalid controls inside a closed disclosure are revealed for correction. No appointment is confirmed by this form.

Submission continues through the existing API, attribution, idempotency, validation and CRM workflow. Failed requests retain the draft and retry key. Successful requests reset optional fields and retain the existing receipt. No backend schema, customer records, ad budgets, HR application or travel booking modules change.

Static HTML and the source renderer are kept aligned. Without JavaScript, the homepage stays shortened, the CRM workflow is readable and enquiry submission is disabled with an email alternative.

## Verification

`node scripts/qa-home-conversion.cjs` exercises 22 desktop/mobile static/source cases with intercepted local submissions: basic four-field enquiries, optional scheduling, retained retries, market/currency/campaign context, readable preview, shorter page and no-JavaScript fallback. Existing enquiry, regional routing, CRM-review, native validation, project-viewer and guided-enquiry suites exercise the retained detailed flows. Existing tests reveal optional controls as a setup step; the new suite separately checks disclosure behavior through user clicks.

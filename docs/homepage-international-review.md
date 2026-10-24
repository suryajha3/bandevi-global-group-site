# International homepage design review

Review-only change based on main `89e370c59589c7ab14bcf68b6d49cdd1a75118c7` (24 October 2026). Do not merge or deploy without a separate release instruction.

## Buyer experience

- Charcoal and champagne presentation, shorter homepage brand line and one primary header action. Existing navigation, WhatsApp and mobile menu behaviour remain available.
- “Custom software. Built for your next stage.” introduces the offer, with explicit remote delivery from India for UK, US, UAE and Singapore businesses.
- One labelled fictional CRM concept in the hero. The existing five-reference gallery, accessible tabs, screenshot viewer and service-to-project matching move below the hero.
- Native optional service disclosure keeps the first screen focused. It retains the existing GET form, service values, source field and conditional project field, with a no-JavaScript route to contact.
- Market links, service comparison, published buyer evidence and four delivery stages help buyers assess fit and scope. No new customer endorsement, business result, legal credential or overseas office is claimed.

## Preservation boundaries

The public enquiry form markup is retained from the baseline, including disabled static submission, optional qualification fields and the email fallback. The existing browser client, featured-project logic, attribution, consent implementation, measurement helpers, APIs, database and booking flow are unchanged. Only homepage `index.html` is regenerated; other public pages are not regenerated. The new stylesheet is loaded on the homepage only and uses isolated CRM classes.

The homepage focus form still opens `/contact-us/` with its existing `solution`, `source` and eligible `project` values. Main form submissions still use the existing endpoint. UK/US country, currency, landing-page and campaign attribution are verified with intercepted synthetic requests, rather than real enquiries or Google events. Analytics remains optional; the review tests include unknown, declined, granted, withdrawn and Do Not Track states. Consent does not replay earlier enquiries.

The four existing regression suites keep their business assertions. Their layout expectations now follow the relocated gallery, the optional service disclosure, the shorter homepage-only brand line, five market links and the additional sections. The new `qa-home-international.cjs` covers responsive layout, anchor clearance, duplicate IDs, source-rendered/static parity, UK/US enquiry routing, attribution, consent and native fallback. The preview workflow includes this test and supports manual test-only dispatch; no deployment action is added.

## Review checks

Run the existing guided-enquiry, homepage-conversion, hero-balance, navigation and analytics-consent suites, plus `node scripts/qa-home-international.cjs`. Use an isolated local server; intercept submissions and external analytics traffic. Screenshots and check receipts are written beneath `qa-results/` and are not published assets.

## Holds

The CRM-to-GA4 integration remains in separate draft PR #153; none of its commits are included here. Goodfirms remains pending. The ERP proposal, article, outreach drafts and Trip Sarathi case-study draft stay unpublished; outreach remains unsent. Existing public project-reference pages are not new case-study publications.

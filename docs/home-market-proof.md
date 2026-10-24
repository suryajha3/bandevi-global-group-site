# Homepage market discovery and proof

The homepage leads with custom software for sales and operations. United States, United Kingdom and India links follow the primary actions and use the existing market pages, country defaults and quote currencies.

The compact CRM preview describes three steps and links to the browser-local interactive example and captioned walkthrough. Fictional demo records remain labelled. The first section after the hero presents BANDEVI’s own implementation record, a dated blank consultation capture and a downloadable delivery record. It claims implemented functionality, not customer sales results.

Only the corporate homepage, its renderer and scoped styles change. Existing enquiry submission, booking handoff, featured-project controls, private reporting and all travel/HR applications remain outside this change.

Validation: `node scripts/qa-home-market-proof.cjs`, `node scripts/qa-home-conversion.cjs`, `node scripts/qa-hero-balance.cjs` and the existing website CI gate. The focused QA checks source and prerendered layouts at five widths, native email fallback, all three market defaults, evidence links and horizontal overflow. `--live` uses GET requests only and submits no enquiry.

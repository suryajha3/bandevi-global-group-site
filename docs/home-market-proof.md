# Homepage market discovery and proof

The existing international charcoal and champagne layout, native optional service disclosure, below-hero project gallery, five-market coverage strip and delivery process are retained.

The homepage leads with custom software for sales and operations. United States, United Kingdom and India links follow the primary actions and use the existing market pages, country defaults and quote currencies.

The compact fictional CRM concept retains three example leads and links to the browser-local interactive example and captioned walkthrough. Fictional demo records remain labelled. The proof section before the service comparison presents BANDEVI’s own implementation record, a dated blank consultation capture and a downloadable delivery record. It claims implemented functionality, not customer sales results.

Only the corporate homepage, its renderer and scoped styles change. Existing enquiry submission, booking handoff, featured-project controls, private reporting and all travel/HR applications remain outside this change.

Validation: `node scripts/qa-home-market-proof.cjs`, `node scripts/qa-home-conversion.cjs`, `node scripts/qa-hero-balance.cjs` and the existing website CI gate. The focused QA checks source and prerendered layouts at five widths, native email fallback, all three market defaults, evidence links and horizontal overflow. `--live` uses GET requests only and submits no enquiry.

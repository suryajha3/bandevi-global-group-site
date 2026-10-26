# Project proof and enquiry recovery

The current palette, homepage columns and nine sections are retained. The hero keeps its interactive fictional CRM. The lower gallery opens on BANDEVI's delivered internal website, including without JavaScript, and still exposes all five previews, device captures, viewer navigation and the optional service chooser. Choosing CRM still selects the CRM demonstration.

An always-visible gallery label distinguishes **Delivered internal project**, **Public interface reference**, and **Illustrative demo · fictional records**. These are evidence types, not customer endorsements or performance claims. Existing dated screenshots remain unchanged.

Public home, contact and demo forms show a linked error summary after native field validation reports an error. The native required/validity rules, first-invalid-field focus and individual error messages remain authoritative. Links open containing optional disclosures and focus the corresponding field. Corrected, disabled or reset errors disappear. The summary does not call validity methods, save values, write storage or send requests. Existing retry identities, immutable submitted receipts and transport remain unchanged.

The US software and CRM campaign pages use *inquiry/inquiries* in presentation copy, including generated feedback and optional reviews. UK and India retain *enquiry/enquiries*. Names, IDs, option values, URLs, country/currency defaults and submitted payloads do not change. No other market is rewritten.

The default gallery uses the existing 50,262-byte WebP, intrinsic 1239 × 532 dimensions, lazy loading, asynchronous decoding and low fetch priority. Videos remain on demand. No screenshot pixels or codecs change.

`node scripts/qa-buyer-clarity.cjs --all-browsers` checks static and renderer-generated pages in Chromium, Firefox and WebKit, keyboard error links, optional-field focus, reset and mocked saved receipts, regional payloads, no-JavaScript fallbacks and focused accessibility rules. All external traffic is blocked. `--live` is GET-only and never submits a production form.

The local-only mobile lab compares three cold-cache samples of the production baseline `970e66a4170862705affca9ecc9db55cd02572db` and candidate at a 390 × 900 viewport, 100 ms network latency, 1.6 Mbps download and 4× CPU slowdown. It records LCP, initial layout shifts and resource sizes, and rejects video preloads, initial CLS above 0.1 or a substantial median LCP regression. Results are saved in `qa-results/buyer-clarity/mobile-loading-lab.json`. These are controlled lab measurements, not field Core Web Vitals or physical-device certification.

The authored renderer and three affected static pages are kept aligned. Existing static markup outside the homepage gallery is preserved byte for byte; US page updates change presentation text only. The current client bundle and build command remain unchanged. No private applications, backend, analytics configuration or routing are changed.

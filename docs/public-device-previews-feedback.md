# Public device previews and feedback — 25 October 2026

The corporate website retains its current emerald, charcoal, champagne and ivory palette, header, hero grid, section order and existing enquiry fields. The homepage project gallery now offers Desktop and Mobile views for its four public project references. The illustrative CRM workflow remains the default.

## Project evidence

Desktop references retain their original capture dates (6 October for the external references; 4 October for the internal website). Four unaltered public mobile viewport captures were taken on 25 October at 390 × 844 pixels. `assets/project-mobile-captures-20261025.json` records their source URLs, timestamps, dimensions, hashes and limitations. These are interface references, not customer endorsements, integration verification or performance results. Trip Sarathi's current mobile holiday homepage is described separately from its older desktop flight-search capture.

Device selection updates the image, description, source disclosure and larger-image link. The keyboard-operable dialog fits portrait images, supports zoom and returns focus to its opener. Without JavaScript the original project directory and screenshot links remain usable.

## Presentation enhancements

Decorative SVG service icons accompany the existing seven Services links and service comparison headings. Existing accessible link names, descriptions and destinations are retained. Public project images have loading and failure states, user-initiated retry and their existing project/image alternatives. Keyboard focus stays in context after a retry. No automatic retry loop or external media editing is used.

Public home/contact/demo forms display pending, saved, failed and invalid states around the existing receipt. Native field errors receive visible descriptions linked through `aria-describedby`; existing helper descriptions are preserved. Saving, reference validation, idempotency keys, draft retention, country/currency rules, signed booking links and the backend remain owned by the existing client and server code. The enhancement does not submit requests, read payloads or add required fields. The isolated source renderer receives the same presentation changes.

## Verification

`node scripts/qa-public-experience.cjs` checks genuine asset hashes; desktop/mobile switching for all four references; source and static rendering at 320, 390, 768 and 1440 CSS pixels; portrait fit, zoom and focus return; 44-pixel device controls; image loading/failure/retry and rapid selection; US/UK/India locally mocked enquiry failures and receipts; unchanged retry body and idempotency key; inline errors; reduced motion; narrow reflow and unique IDs on market, project and service pages; and native fallbacks.

Pinned axe-core 4.10.3 checks WCAG 2 A/AA and 2.1 AA rules in the changed gallery, service comparison, open Services menu and enquiry states. Automated checks and Chromium keyboard/reflow tests are bounded evidence, not a complete accessibility certification or assistive-technology audit.

`--live` uses GET-only production checks. It never creates a live enquiry, booking, message or advertising action. Existing public and private regression suites remain mandatory in CI. Release files are limited to public templates/assets, this document, the new QA and its CI invocation. No HR, travel booking, B2B, private CRM, backend, environment or routing changes are included.

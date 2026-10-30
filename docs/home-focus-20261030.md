# Homepage hero and Selected Work — 30 October 2026

The homepage now leads with “Software that connects your sales and operations.” Discuss Your Project and Explore our work remain the main actions. The fictional Capture / Assign / Follow up controls and interactive-demo destination remain; the walkthrough and internal website story move into the work section.

Selected Work immediately follows the hero. Three cards reuse existing public captures and records: BANDEVI’s delivered internal website, the owner-attributed Trip Sarathi public interface reference, and the fictional CRM demo. No customer endorsements, supplier capability or measured outcomes are claimed. The keyboard-accessible project gallery remains below the cards. Remote coverage, documented proof, enquiry forms and regional links remain available.

Only homepage markup, its pure source renderer, a homepage-only stylesheet and associated QA/build documentation change. The shared client, public/private APIs, forms, permissions, service configuration, databases and other product files remain unchanged. No tasks, messages or meetings are created. Reply-watch automations are outside this release.

`node scripts/prerender-home.cjs` regenerates only the static introduction using the pure renderer, preserving later page content and avoiding serialization of runtime enhancements. Source/static and no-JavaScript checks cover both forms of the page.

Validation covers responsive desktop/mobile layouts, WCAG checks, keyboard navigation, native fallback, source/static parity, reference labels and GET-only journeys. The retained demo comparison uses the production baseline 9769fbd37893e58b4f9479e486d08053dc3bf756, preserving grid, heading width, palette, three steps and section count while requiring a shorter preview. Headline and relocated-link expectations are updated for the intended design. Full repository CI remains a deployment gate. Browser emulation is not a physical-device test.

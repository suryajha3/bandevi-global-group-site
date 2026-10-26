# Compact navigation and interactive homepage preview

The public corporate design keeps the charcoal, champagne and ivory palette. The shared desktop header is 82px plus its border; mobile keeps a 74px menu offset. Logo and navigation spacing are tightened across the 98 existing public templates. Their shared stylesheet version is updated together.

The homepage reduces hero padding, retains centred desktop columns and keeps the existing enquiry action and US/UK/India destinations. Market cards include short planning context, explicit focus states and readable full-width rows on phones. The existing country and quote-currency defaults are unchanged.

The three existing fictional CRM cards are inspectable buttons when supported JavaScript is available. A native modal shows the same record's stage, demo owner and next action, plus the existing sample-CRM link. Close, Escape and backdrop clicks restore focus and page scrolling. The preview sends no requests, saves nothing, creates no customer record and adds no tracking. Without JavaScript or native dialog support, the static cards and direct sample-demo link remain available.

Navigation underlines, fine-pointer button/card feedback and brief panel entrances provide visual feedback. Reduced-motion preferences disable movement and entrance animations. Content remains visible with JavaScript disabled.

Validation: `node scripts/qa-front-polish.cjs` covers 35 local responsive, source/static, keyboard, motion, menu and native-fallback cases. `--live` runs 15 GET-only production cases. Existing hero, gallery, market-routing, form, attribution and complete website workflow checks remain release gates. No private inbox, enquiry payload, HR, public travel booking or B2B application code is changed.

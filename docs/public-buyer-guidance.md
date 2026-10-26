# Project walkthroughs, visual scopes and enquiry preferences

This release enhances the existing BANDEVI corporate public design. It does not change the travel booking product, HR, private inbox, request payloads or payment behaviour.

- Four existing project records have three numbered screenshot callouts each. The original captures, dates and evidence limitations remain. Native anchor links focus the matching explanation. These are interface observations, not verified supplier integrations or customer performance claims.
- Eight existing comparison sections show short example workflows. Scope, exclusions and acceptance checks remain in native expandable details; evidence links and proposal actions remain outside them. The homepage section count is unchanged.
- Nine enquiry forms show service, business country and quotation currency. Edit controls focus the original fields, including opening optional details. No additional inputs, required fields, storage, analytics or requests are added. GBP/USD/INR continue to follow the original country rules; other-country currency choices remain available. Form resets refresh the summary for a new enquiry.

`assets/buyer-guidance.js` enhances the existing DOM after form initialisation. The corresponding public HTML contains the annotated screenshots, comparison details and initial preference summaries for visitors without JavaScript. Static edit buttons remain hidden until the enhancement binds them. Existing email fallbacks remain available.

Validation: `node scripts/qa-buyer-guidance.cjs` exercises 50 GET-only local cases across 320px, 390px and 1440px, source-rendered home/contact pages, regional currency rules, editing, reset, keyboard focus and native fallbacks. Pass a production origin as its first argument for GET-only live verification. Existing comparison, compact enquiry retry and market-offer suites verify retained journeys. The full website workflow remains the release gate.

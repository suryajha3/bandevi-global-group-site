# Emerald accents and colour hierarchy

The existing public layout is preserved. Charcoal `#191D1B`, graphite `#252C28`, deep emerald `#16483C`, champagne `#E4CEA1` and warm ivory `#F7F4EC` provide distinct surface and action roles. Solid champagne remains on primary actions; emerald supports market cards, secondary actions, the illustrative CRM frame and selected project tabs. Existing light/dark sections use the same palette without changing their order.

The three fictional CRM headings become labelled slate, amber and emerald chips. The original New, Contacted and Proposal text and counts remain in the markup. Their colours are restricted to the illustrative homepage, with no private CRM status or genuine project screenshot changes. Chip outlines and shadows do not change the layout boxes.

Helper text inside the homepage's light enquiry form uses dark green. This corrects its previous light-on-light treatment while retaining the lighter text used outside the panel on the dark section background.

All 98 public HTML bodies remain byte-for-byte unchanged. They reference the refreshed shared stylesheet version; the homepage also refreshes its existing presentation stylesheet. The public source renderer changes only its stylesheet fallback version. Submission code, enquiry fields, routing, record ownership and private applications are unchanged.

Validation: 18 local baseline/candidate geometry comparisons cover the homepage at 320, 390, 768, 1024, 1440 and 1920px plus contact, CRM, US/UK/India market and project-directory pages at mobile/desktop sizes. Measured positions and sizes match the deployed `05d2b5d` baseline within 0.25px. No raster evidence assets are modified.

`node scripts/qa-emerald-palette.cjs` covers 23 local palette, text-contrast, source/static, labelled-stage, modal, regional-default and native-enquiry cases. `--live` runs eight GET-only production cases. Status labels, market-card text, primary actions and lead-detail text are checked against a minimum 4.5:1 contrast ratio. Existing frontend, keyboard, reduced-motion, gallery, enquiry and complete release tests remain required.

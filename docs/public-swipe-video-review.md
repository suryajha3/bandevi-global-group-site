# Public swipe, video feedback and optional review — 25 October 2026

The corporate site retains its current palette, header, homepage design, section order and page grids. This release changes the existing public enhancement assets and their cache versions. Enquiry transport, validation rules, required fields, backend, private applications, advertising controls and configuration are unchanged.

## Touch navigation

The enlarged project viewer accepts a deliberate horizontal touch swipe at normal zoom. Vertical gestures, short taps, cancelled gestures and multi-touch pinches do not advance projects. Zoomed images retain native panning; browser pinch zoom is preserved. Previous/Next controls, counters and keyboard navigation remain available. A short hint appears for coarse-pointer devices. This adds no automatic carousel or gesture handling to the underlying page.

## Native video feedback

Public video elements retain their native controls, source order, posters, captions, preload=none and existing transcripts. Playback/loading events show feedback only after interaction. Terminal media errors offer a manual retry and available transcript/file alternatives. One failed format does not replace a working native alternate-format fallback.

Retry pauses and reloads metadata with an asset cache-busting query; it does not autoplay. The visitor chooses Play to continue. Keyboard retry returns focus to the player. Existing transcript text is reused, never generated for office videos that have no transcript. A direct transcript shortcut is added where an existing transcript is available. Idle feedback is hidden and loading/error feedback stays outside native media controls.

## Optional enquiry review

Home/contact/demo forms gain a separate type=button review control after the existing submit action. A native dialog shows name, email, phone, service, country, currency and message as plain text. Other optional choices remain in the form. Review is available for partially completed drafts and does not validate, submit, save, book a demo, create a receipt or persist a draft.

Edit controls close the dialog, reveal existing optional fields when necessary and focus the original field. Close/escape returns focus to the review opener. Displayed values are rebuilt on opening and removed on closing/reset. No HTML from the visitor is interpreted. The original Send action remains available without review, with its existing idempotency and failure-retention behaviour. Review is unavailable while sending. A browser without dialog/JavaScript support retains the original form and media alternatives.

## Validation

`scripts/qa-swipe-video-review.cjs` uses Chromium's trusted touch events, real local video streams, interrupted/recovered media routes, alternate codecs and locally mocked submissions. It checks static/source parity, US/UK/India review values, edit focus, no new required fields, safe text, unchanged retry bodies/keys, keyboard traps, short windows and native fallbacks. Pinned axe-core audits cover open review dialogs and video error feedback. Existing video/playback regressions and the full backend/browser CI suite remain gates. `--live` uses GET-only browser checks and never submits a production enquiry.

These are bounded browser/accessibility checks, not a complete assistive-technology certification. No travel booking, B2B, HR, routing or live customer-data changes are included.

The existing public proposal-prefill check waits for its established CRM selection before asserting the same label. Isolated baseline/candidate comparison confirmed identical final selection; this removes an early-read race without changing routing or relaxing the assertion.

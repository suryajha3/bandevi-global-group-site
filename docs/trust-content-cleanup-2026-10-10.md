# Trust-content cleanup — 10 October 2026

Base revision: bf7fed5762e69afaa886fd617ddcd7a916f8623d
Status: prepared source changes; browser rendering and live deployment not verified.

## Customer-facing change
- Replace the company-profile, offices, staff-size/net-worth, official-facts and proof pages with concise service, public-information and record-status content.
- Remove unsupported staff and financial totals from public HTML and editable text/JSON summaries.
- Remove legal-name, workforce and physical-location assertions from organisation metadata where supporting records were not supplied.
- Describe existing addresses as published references awaiting location-specific confirmation. Confirm availability and appointments before visits.
- Preserve the exact five-photo office gallery and three visitor-controlled videos.
- Redirect current page links away from older company-authored PDF/figure notes to current record-status pages.
- Distinguish owner-attributed project descriptions, fictional demos and company-published profiles from independent verification.
- Update the shared source renderer so legacy templates pass through the same claim cleanup; core pages use the rewritten content.

## Checks performed
76 public HTML documents checked. All JSON-LD and changed JSON assets parse. Source JavaScript compiles. Shared cleaner tested against all 76 documents. Exactly one H1 on content pages; redirect documents remain intentional exceptions. No missing literal internal paths or target anchors; no duplicate public descriptions. Complete enquiry form markup is unchanged. Core page markup is balanced. Office-gallery/video sections match the base exactly.

## Limits and retained history
Local shell and browser tools remain unavailable. No browser rendering, mobile interaction, live HTTP, enquiry submission or deployment is claimed. Enquiry backend/configuration files are unchanged.
Older binary PDFs and the former social proof SVG remain in the repository as historical files, but current pages and updated summaries no longer promote them as verification. Existing external social posts and search caches may retain older statements; they require separate review by their publisher.
Authentic registrations, contracting legal name, staffing/financial evidence, individual location records and approved customer testimonials still need to be supplied. No new credentials, staff count, financial figure, ownership claim or customer result has been invented.

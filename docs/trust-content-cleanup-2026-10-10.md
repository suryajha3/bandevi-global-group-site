# Trust-content cleanup — 10 October 2026

Base revision: bf7fed5762e69afaa886fd617ddcd7a916f8623d
Status: source checks and isolated GitHub browser checks passed; live deployment and live HTTP verification pending.

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
Local shell and browser tools remain unavailable. GitHub-hosted Chromium checks passed 84 cases at 360, 390, 768 and 1440px, including static/source pages, gallery keyboard controls, mock enquiry retries/receipts, proposal preselection and no-JavaScript gallery links. Screenshots are generated for review. No production enquiry submission, live HTTP verification or deployment is claimed. Enquiry backend/configuration files are unchanged.
Older binary PDFs and the former social proof SVG remain in the repository as historical files, but current pages and updated summaries no longer promote them as verification. Existing external social posts and search caches may retain older statements; they require separate review by their publisher.
Authentic registrations, contracting legal name, staffing/financial evidence, individual location records and approved customer testimonials still need to be supplied. No new credentials, staff count, financial figure, ownership claim or customer result has been invented.

## Browser check evidence
Run: https://github.com/suryajha3/bandevi-global-group-site/actions/runs/38027516569
Tested source revision: 036a2bde44ea17f4d05e23517933331a5d26b939
Corrections from the checks: CRM walkthrough action labels wrap on narrow mobile screens; travel portfolio buttons wrap inside tablet cards. The workflow uses a local preview server, blocks external requests and mocks enquiry responses; no Hostinger credentials or live customer data are used.

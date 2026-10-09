# Website quality audit — 9 October 2026
Repository: suryajha3/bandevi-global-group-site
Audited source revision: 3d42a5ca5522362a356dfe85b1998e332772ab90
Scope: 77 HTML documents (74 public content pages, two intentional redirect documents and one server dashboard template), sitemap.xml, robots.txt, structured metadata and literal href/src internal references.

## Findings and prepared fixes
1. Trust metadata: 14 structured-data objects across 12 pages included workforce or financial-strength fields without supplied supporting evidence. Removed 27 employee-count / staff-size / net-worth / group-strength fields. Retained company identity, contacts and other metadata. This is an evidence-status correction, not a conclusion that a figure is false.
2. Sitemap completeness: the indexable, self-canonical chairman photo gallery was absent. Added /surya-kant-jha-photos/, bringing the sitemap to 70 unique URLs. Updated modification dates for metadata-edited pages.
3. Public metadata: all 74 content pages have a title, description, self-canonical URL and one H1. All structured JSON blocks parse. Intentional redirect documents are noindex and canonicalise to the destination; their duplicate redirect title is expected.
4. Internal routes: no missing public page/asset paths or absent literal target IDs were found in the checked href/src references. Dashboard /team-inbox/styles.css and /team-inbox/app.js are served by server/dashboard.py and are not missing public assets.
5. Indexing: no missing or noindex URLs in the existing 69-entry sitemap. robots.txt permits public crawling and declares the page and image sitemaps.

## Remaining trust-content review
Older visible pages, company profile assets and source-rendered copy still contain company-provided staff / financial figures and office references. They have not been independently verified in this task. Review them against authentic records before presenting them as verified credentials or results. This change deliberately does not invent records, customer reviews, delivery scope or ownership claims.

## Validation performed
- Parsed all JSON-LD blocks before and after the metadata cleanup.
- Checked that the removed employee / staff / financial properties are absent across audited HTML metadata.
- Compared complete form markup before and after: unchanged.
- Checked 70 unique sitemap locations, including the missing photo-gallery route.
- Checked public literal href/src paths and literal fragment IDs against repository documents.
- No production enquiry submissions or customer messages.

## Validation limits and deployment
Local commands and the browser runtime both fail to start with a workspace setup error on 9 October. Consequently mobile rendering, keyboard journeys, live HTTP redirects/statuses, external links, CSS/srcset asset references, field Core Web Vitals, live enquiry delivery and deployment are not verified in this audit.
Prepared changes are reviewable in the pull request; do not describe them as deployed. Resume local/browser verification and backed-up deployment when the runtime is restored. No nginx/API/private-data changes are included.

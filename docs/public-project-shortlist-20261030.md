# Public Project Shortlist — 30 October 2026

Visitors add or remove references in Site Search, then manually choose **Save shortlist**. Changes remain in memory until saved. **Clear** removes this feature's saved selection and pending handoff; it does not clear other browser storage. The footer links to `/project-shortlist/`, where the saved selection can be reviewed or edited. Up to five pages can be selected from the same 55 explicitly approved public Services, Projects and Guides already used by Site Search. A public reference describes a starting point for discussion, not an agreed feature, quote or client endorsement.

The feature stores only `{version:1, urls:[...]}` under `bgg_public_project_shortlist_v1` in this browser's localStorage. It saves relative canonical public paths, never contact information, search terms or brief text. Titles and categories come from the current public allowlist. Storage is browser/profile specific; clearing browser data or using another device will not carry the selection across. This is not an account, CRM record or server backup.

**Review in project brief** is available only for a nonempty, saved, unchanged selection. This explicit action writes a one-time, URLs-only sessionStorage handoff under `bgg_public_project_shortlist_handoff_v1` and opens the existing project brief. Navigation does not change any form field. The visitor must review the references and choose **Use in brief** to append missing public links to Features / integrations. **Cancel** leaves the brief unchanged. Existing feature text is preserved, duplicate links are skipped, and the existing 1,100-character limit is enforced without truncation. Visitors still complete the existing contact fields, review the complete brief and explicitly choose Send project brief. No new submission schema, endpoint, sending behavior or backend changes are introduced.

Corrupt, unknown, private, duplicate, oversized or unsupported stored selections are rejected without silently overwriting them. Manual Clear can remove an invalid saved value. Storage failures keep the in-page draft visible and prevent a false saved confirmation or handoff. Other-tab changes reload a clean selection; they preserve a dirty draft and require manual Reload saved shortlist before saving or continuing. The saved value is checked again before Save, handoff and Use. A stale handoff cannot update a brief. Clear only affects the shortlist keys. The module does not fetch, call analytics, send messages or submit forms. Existing website analytics and consent behavior are unchanged.

Only Search, Shortlist and Project Brief load the new controller, public catalog and scoped styles. All 98 existing public marketing pages receive one footer link. The existing Search controller, brief controller, shared client, server, CRM, routing and service processes are unchanged. Native links and explanatory fallback content remain available with JavaScript disabled.

Build in this order:

```
node scripts/build-site-search.cjs
node scripts/build-project-shortlist.cjs
```

Run `node scripts/qa-project-shortlist.cjs --all-browsers`. This checks the exact public change boundary against production revision `a73f1243b9c16a9e95b72f4e9449893641f7bec2`, manual persistence and Clear, page-local drafts, storage schema and allowlist, quota and blocked storage, five-item limit, cross-tab conflicts, stale handoffs, explicit review before use, retained form validation, length limits and duplicate prevention. A fictional local mock verifies the existing submission payload; live mode blocks all writes. Chromium, Firefox and WebKit cover desktop/mobile layouts, source/static parity and no-JavaScript fallback; WCAG checks cover the new main content. Browser emulation does not claim physical-device testing. All six existing CI jobs remain, with a seventh public-project-shortlist job.

Deployment requires the exact tested tree, production baseline and scope checks, a verified application rollback archive, public response hashes and protected-route/health checks. Verify unchanged CRM permissions, ownership, private proposal, outgoing records, reminders, reply-watch status, application hashes and service PIDs. No customer messages, business tasks, appointments or external calendar writes are authorized by this release.

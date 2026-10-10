# Enquiry attention and activity

Private Bandevi staff inbox only. This release does not affect The Holidays Group travel, B2B, white-label or Call CRM products.

Needs attention filters active enquiries with no owner, follow-up date or next action, an overdue follow-up, or a New stage aged at least 48 hours. It counts each enquiry once, prioritizes overdue enquiries then oldest requests, and excludes Won/Lost and QA records. Stage/source/search filters can be combined through the form. The quick button resets conflicting filters. Agents see only their assigned records.

Next action is a separate 300-character workflow field. Existing clients that omit it preserve its value. Saves retain optimistic version checks and record previous/current values in the workflow audit. Migration adds a blank default without changing existing notes, owners, stages or dates.

Opening an enquiry loads the latest 100 recorded events: receipt, actual workflow changes, recorded proposal milestones, and immutable staff notes/call/email outcomes. Events contain time and actor. Older workflow audit records remain readable. Staff-reported calls and emails do not trigger delivery or change the sales stage. Exact retries reuse a client-generated identifier to avoid duplicates; changed retries return a conflict. Activity writes require staff session, same-origin and CSRF protection, with ownership rechecked in the transaction. Client accounts cannot access the admin API. DOM rendering uses textContent; delayed responses are tied to the current session and selected enquiry.

Validation: all existing backend suites plus five attention/activity cases; inbox browser scenarios cover the queue, next-action save, call logging, HTML-as-text, role boundaries, sign-out and four viewport sizes. GitHub runs the public browser regression suite as well.

Deployment requires a consistent verified SQLite backup, clean production baseline, fast-forward to the tested merged revision, and restart of bandevi-enquiries for the additive migration. Verify health, asset hashes, unauthorized API rejection, schema integrity, backup and monitoring. On failure revert application revision and restart only Bandevi; leave the additive columns/tables in place so newly recorded events are preserved. No routing or credential changes.

# Bandevi client delivery workflow

Scope: Bandevi corporate website and its private enquiry service only. THG public travel, hotel/flight suppliers, B2B and CRM products are outside this release.

## Operator workflow

Sign in to `/team-inbox/`, then open **Client projects, proposals & support** at `/team-inbox/workspace/`. Create a project using an existing enquiry reference. Its customer email comes from that enquiry and cannot be replaced through the project form. Agents access only projects whose enquiries are currently assigned to them. Administrators and managers can review all projects.

Administrators and managers explicitly send an invitation to the recorded customer address. The link expires in seven days, can be used once, and sets or resets a password of at least 14 characters. The bearer token is stored only as a digest in the invitation table; the queued invitation email necessarily contains the link. It is removed from the browser address immediately on arrival. Disabling a client account invalidates its invitations and sessions across all its projects. Client cookies and CSRF tokens cannot authorize staff APIs, and staff cookies cannot authorize client APIs. Client access is at `/client-workspace/`; the existing `/customer-portal/` service page links to it.

Create a proposal revision with scope, commercial terms, currency, amount and expiry. Draft revisions are private to staff. Publish the latest draft to make it visible and queue a notification; earlier published revisions become superseded. Proposal content and amounts are immutable. Accepted records retain revision, accepting customer account, entered name and timestamp; staff cannot withdraw them. A further revision is a separate amendment. Acceptance records agreement to the displayed proposal; it does not collect money, create an invoice, prove the customer's signatory authority, or imply a payment has settled. Staff and project edits use optimistic version checks; clients cannot accept withdrawn, superseded or expired proposals.

Add milestones and client-visible progress updates. Clients approve milestones marked Ready for review. Share PDF, UTF-8 TXT, PNG or JPG documents, up to 512 KB each and thirty active documents per project. Documents remain in the private SQLite database and are downloaded only after project authorization with attachment/no-store headers. Removing access retains the record for recovery but blocks downloads. Check files before sharing them; no malware-scanning service is introduced.

Clients create support requests and reply through their own projects. Staff assign an active owner, record status, and add either a client-visible reply or a staff-only note. Internal notes and ticket owner identities are omitted from client responses. Normal and urgent priorities set internal follow-up targets of 48 and 4 calendar hours respectively; these are operational targets, not a new advertised SLA. An authenticated client reply reopens the request. Status and reply conflicts require a refresh. New ticket creation is limited to five per project per hour.

The report uses enquiries received in the selected 7/30/90-day cohort. It counts recorded demo reservations, projects with actually published proposals, accepted proposals, current overdue follow-ups and ticket targets. Rejected draft proposals do not count as published. Loss reasons appear only for enquiries currently marked Lost; missing reasons stay explicitly Not recorded. Accepted proposal totals are not revenue or payment totals.

## Demo calendar support

Staff record an existing HTTPS meeting link against a confirmed demo. The customer receives a queued update and a downloadable `.ics` event; the private demo management page shows the joining link and calendar download. Calendar events use a stable UID and booking sequence, include UTC start/end times, and preserve cancellation status. Rescheduling clears the previous meeting link so staff can supply a suitable link for the new host/time. Notifications carry calendar attachments and reminders are deduplicated for the booking version at roughly 24 hours and 1 hour before the appointment. Late bookings avoid sending both reminders at once.

Calendar files require the customer to import/update their calendar. This release does not create provider meetings, write to Google/Microsoft calendars, or read host availability. A provider integration needs the approved account, credentials and meeting policy. Existing published demo slots remain the booking authority.

## Deployment and recovery

Verify the live Git baseline and a clean checkout before updating. Preserve a private application archive, consistent SQLite copy, `/etc/bandevi-enquiries.env`, the Bandevi Nginx configuration and service unit. All schema additions are additive. Update only `/srv/bandeviglobalgroup/app` to the tested merged revision, then run `python3 -B server/deploy-client-workflow.py`. It verifies the existing Bandevi root/private protections and loopback API, adds protected `/api/client/`, `/client-workspace/` and larger bounded `/api/admin/workspace/` upload routes, validates Nginx, restarts only `bandevi-enquiries`, creates a verified backup and reloads Nginx. Existing backup and monitor timers remain active.

If activation fails, restore the saved application revision and the script's private routing backup, validate Nginx, restart only `bandevi-enquiries` and reload Nginx. Preserve the current database: additive tables do not require destructive rollback, and discarding new records would lose client activity. The existing verified backup/recovery process covers documents because they are inside SQLite. For a later source-only update, verify that client routing is already installed rather than rerunning the initial route installer.

## Validation and production inputs

The 40 existing backend cases and 11 additional client workflow cases passed locally. Existing website checks passed 94 browser cases. Nine integrated synthetic browser flows verified staff project creation, immutable proposal publication, invitation activation/fragment removal, exact proposal acceptance, customer tickets, internal note isolation, public replies, mobile layout and session revocation. Tests queue notifications only; no live customer or staff was provisioned and no actual email was sent during QA.

Real staff identities, supported demo hours, external monitoring destination and a verified inbox delivery receipt still require operational inputs. Invitations and proposal notices are sent only when staff explicitly take those actions. Additional case-study content still requires supplied client evidence and approval.

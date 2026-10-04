# Enquiry inbox

Contact and demo requests POST to `/api/enquiries`. The API persists each enquiry in SQLite before acknowledging it. Retry keys prevent duplicate enquiries after a timeout. Same-origin checks, server validation, body limits, a honeypot and hashed IP rate limiting help reject abuse. The API has no unauthenticated read/export route. Enquiries and credentials stay outside the static document root.

## Deploy on the existing Hostinger VPS

Review the release, pull main in `/srv/bandeviglobalgroup/app`, then run `python3 server/deploy.py`. The script backs up the Nginx configuration, installs a restricted systemd service and reloads Nginx only after a successful health check. Back up the SQLite inbox separately from Git, using SQLite's backup API for consistency. The existing weekly VPS backup remains important; no new paid backup subscription is created by this release.

## Sales notifications

Enquiries stay `pending` until an authenticated mail sender is configured. The worker retries failed notifications with capped backoff; customer acknowledgement means saved, not emailed. SMTP credentials are supplied only in `/etc/bandevi-enquiries.env` (root-readable, mode 0600), never in Git or the browser. Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_TLS` (`starttls` or `ssl`), `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and `SMTP_TO`, then restart the service. Use the mailbox provider's actual settings and an approved sender. Do not weaken account security to make a legacy authentication method work. OAuth-only mailboxes require an OAuth-capable sender integration rather than a mailbox password.

## Private inbox access

### Sales dashboard

Open `https://bandeviglobalgroup.com/team-inbox/`. Dashboard access is disabled until the site owner runs `python3 server/setup-dashboard.py` in the authenticated Hostinger root console and personally enters a unique password. This stores a scrypt hash in the private environment file, never a plaintext password or repository secret. The login identity is `sales@bandeviglobalgroup.com`; this password is separate from GoDaddy email.

The dashboard supports searching, 50-record pagination, filtering by New/Contacted/Proposal/Won/Lost, owner names and follow-up notes. Owner assignment records responsibility; it does not create a team account or send a notification. It is a single administrator inbox, not a multiple-user role system. Existing enquiries appear without modifying their customer details. Deployment QA records marked `qa-verified` are hidden.

Sessions expire after eight hours and use HttpOnly, Secure, SameSite=Strict cookies. Mutations require both same-origin requests and a session CSRF token. Login attempts are rate-limited. Concurrent edits use versions to prevent overwrites and changes are recorded in a private audit table. Authenticated customer responses are never cached; customer text is rendered without HTML. Dashboard pages disallow framing, have a restrictive Content Security Policy and are excluded from indexing.

For password recovery, rerun the setup script, type REPLACE and set a new password personally; all existing sessions are invalidated. There is no public account creation, password recovery or unrestricted inbox export. Run `python3 server/test_dashboard.py` for isolated authentication and workflow tests; the tests create a temporary database and generated test credential, with no production inbox or outgoing mail access.

The notification banner distinguishes sender configuration from individual delivery status. GoDaddy authentication must still be connected before notification emails are sent. Keep checking the inbox until delivery has been tested.

The inbox is available through the authenticated dashboard and authorized VPS administration. To view the recent 20 records from the Hostinger console:

```sh
python3 -c "import sqlite3; d=sqlite3.connect('/var/lib/bandevi-enquiries/inbox.sqlite3'); print(*d.execute('SELECT id,datetime(created,\"unixepoch\"),email_status,payload FROM enquiries ORDER BY created DESC LIMIT 20'),sep='\\n')"
```

Do not paste customer records into public logs or Git. For an approved deletion request, delete the enquiry and its matching idempotency record via a parameterized query after verifying the reference. Configure business retention and backup deletion rules as part of inbox operations. SMTP uses a durable outbox with at-least-once delivery; a rare crash after SMTP accepts a message can cause duplicate notification email but never duplicate stored enquiries.

## Rollback

Restore the saved Nginx configuration, validate and reload Nginx, and restore the previous frontend Git revision. Stop the service if needed. Preserve `/var/lib/bandevi-enquiries/` so rollback does not delete enquiries. Never deploy frontend success wording without a healthy backend.

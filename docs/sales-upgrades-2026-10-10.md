# Bandevi sales and website upgrades — 10 October 2026

Prepared from repository revision `4c469de`, preserving its trust-content changes and feedback evidence workflow. This is the Bandevi corporate website and enquiry service. It does not modify the THG hotel, flight, booking, supplier or B2B applications.

## Delivered behavior

- Durable customer acknowledgements, appointment messages, assignment notifications and daily follow-up reminders. Existing sales notifications remain intact. Failed messages remain pending with capped retries; SMTP uses TLS. Delivery is at least once, so a crash after the mail provider accepts a message can produce a duplicate email.
- Individual scrypt-protected staff accounts with administrator, manager and agent roles. Agents see and update only enquiries assigned to their email, including scoped summary/source/conversion reports. Managers review the full inbox and publish demo slots; only administrators change staff access. Access changes revoke existing sessions for the changed account. Existing administrator configuration and legacy assignments are preserved.
- Staff-published demo slots, atomic reservations, conflict responses, safe submission retries, customer cancellation and rescheduling through private bearer links. Dates use Asia/Kolkata. Joining details are still supplied by the team; this release does not create video meetings or calendar events. No availability is invented. Never publish slots that the team cannot support.
- Explicit stage milestones, recorded won-project values and currency-separated source reporting. Missing historical milestones are not inferred. Values are sales records, not payment collection. Stale edits cannot change recorded values, and changes retain the authenticated actor in the audit trail.
- A public project-evidence section linking existing internal and owner-attributed references. Current client feedback already collects measurement sources/periods and explicit media permission. `server/publish_case_study.py` generates reviewable content only from supplied approval and evidence fields; it does not publish automatically. No client endorsement, result or registration is invented.
- Four additional WebP replacements; approximately 108 KB less combined image payload for those replacements. Existing smaller WebP assets are preserved. Original files remain available for evidence/download links. Image dimensions, deferred offscreen images and visitor-controlled video loading improve the loading behavior. Live Core Web Vitals and visitor performance are not claimed.
- Daily consistent SQLite backups, integrity/reopen verification, SHA-256 metadata, fourteen-file retention and five-minute health/backlog/recovery checks. External alerts require an operator-configured HTTPS webhook. Monitoring sends only service status, no customer records.

## Validation

The five existing isolated backend suites (31 cases) and eight upgrade cases passed. The current repository browser suite passed 94 cases, including current trust pages, responsive static/source rendering, gallery keyboard use, feedback measurement/media approval, enquiry retries and proposal preselection. A separate synthetic browser flow passed staff creation, agent controls, published availability, reservation and cancellation. Server Python compiles; static checks found no missing local assets or links. No production enquiry, email, staff account or deployment was created during QC.

## Rollout

1. Verify that the production checkout, repository and current live revision correspond to this Bandevi site; do not deploy the C: backup over newer production work. Record the current Git revision and preserve the existing private environment file, database, Nginx configuration and service definitions. Retain a recoverable application-source snapshot outside the web root.
2. Review and merge the tested release. Update only `/srv/bandeviglobalgroup/app` through the existing deployment process. Verify the root and service before running `python3 server/deploy-upgrades.py` in the authenticated VPS root console. The script requires the existing Bandevi root and loopback enquiry route, snapshots the database/configuration, adds `/api/demo/` routing, starts a verified backup, enables the timers and reloads Nginx after health checks. It does not configure a new hosting provider.
3. Preserve `/etc/bandevi-enquiries.env` permissions. Verify the current approved sender. If it is absent, use the existing owner-operated mail setup appropriate to the mailbox product. Do not put passwords in Git or browser scripts. `CUSTOMER_ACK_ENABLED=0` disables generic acknowledgements if required; appointment changes still queue customer messages. Only verified provider receipt confirms live delivery.
4. Use the existing administrator login at `/team-inbox/` to create real staff accounts and assign existing leads. Deliver passwords privately. Staff can publish supported demo slots. Review pending notifications and due follow-ups after activation.
5. Configure `MONITOR_WEBHOOK` only for an approved HTTPS monitoring destination. Without it, failures appear in the private dashboard/systemd journal. Confirm `systemctl list-timers bandevi-backup.timer bandevi-monitor.timer` and inspect the first verified backup.
6. Verify public pages, staff role boundaries, `/api/demo/slots`, the healthy enquiry service and production routing. Use an approved synthetic enquiry only when live messaging is authorized. Record the deployed revision and results. No production deployment is claimed by the local tests.

## Recovery

On a rollout failure, restore the previous application-source revision/snapshot, Nginx configuration and service definitions, validate Nginx and restart only `bandevi-enquiries`; reload Nginx when its configuration changes. `deploy-upgrades.py` restores configuration/unit files on installation failure; restoring application source remains an operator step. Schema additions are additive. Preserve the latest inbox and its backups so application rollback does not discard new enquiries.

For database recovery, first stop the enquiry service and preserve the current database. Verify the backup's SHA-256 metadata and `PRAGMA integrity_check`, open it in a separate SQLite connection, query its enquiry count and copy it to a separate recovery file before any replacement. Restore only the explicitly chosen database, correct its www-data ownership/0600 permissions, restart the Bandevi service and check `/health`. Never expose databases or backup files through the static website. The backup destination is `/var/lib/bandevi-enquiries/backups`, outside the web root.

## Remaining production inputs

Verified VPS connection/current revision; approved mail sender and delivery receipt; real staff accounts; supported demo availability; external alert destination; client-approved material for any additional case studies. Local development and tests do not substitute for these inputs.

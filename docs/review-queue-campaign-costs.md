# CRM reviews and campaign costs

The private team inbox has a CRM reviews view for submitted workflow-review requests. It uses existing enquiry ownership, sales stages, follow-up dates and next actions. Agents see their assigned enquiries; managers and administrators see all eligible enquiries. QA records are excluded.

Review outcomes are Requested, In review and Reviewed. Reviewed requires an outcome summary. Saving a review does not send a reply, book an appointment or change the sales stage. Reply drafts require staff review before copying. Review changes record the actor and previous version; stale saves fail rather than overwrite another person's work.

The queue highlights missing owners, next actions and follow-up dates, overdue follow-ups, and requests older than 48 hours without a recorded first contact. Follow-up dates use the existing Asia/Kolkata business date. Won, Lost and Reviewed requests are excluded from the open queue. Filters and counts use the saved business country, not inferred visitor location.

## Manual cost ledger

Reports allow managers and administrators to record actual advertising costs. This feature does not connect to, create, fund or publish advertising. Agents cannot read or write the ledger.

Create a profile with the market, exact campaign/source/paid-medium tags, advertising account label, account billing currency and IANA account time zone. Billing currency is independent of quotation currency. Profile configuration is immutable; check it before saving. Use campaign tags unique across accounts. A profile combines matching enquiries across all landing pages once; it cannot allocate costs between accounts sharing the same tags.

Paste up to 90 rows as `YYYY-MM-DD,amount`, optionally preceded by `date,amount`. Amounts are decimal strings in the profile's currency with up to two decimals. Record completed account dates only, within the last 730 days. Include confirmed zero-cost days. Preview and review every batch before saving.

Reports cover the last 7, 30 or 90 completed calendar days in the profile's account time zone, excluding today. This differs from the existing rolling sales-funnel period. Missing days remain unknown. Partial spend is labelled a subtotal; cost per qualified lead and cost per won customer appear only when all days have entries and the denominator is nonzero.

The denominator is the cohort of matching enquiries received during those account days. Qualified requires a recorded Qualified event; Won uses the current staff stage. Milestones are evaluated through now, so cohort results can change later. Recorded won values are staff-entered amounts, not collected payments, and remain separated by currency. There is no FX conversion or ROAS calculation.

Corrections replace a day's amount with a new audited version. Concurrent edits fail with a conflict; refresh and review again. Identical network retries use an idempotency key and cannot double-record a batch. All batch rows commit together or none commit. Logging out clears the new screens and draft costs.

## Release checks

- `python -B server/test_growth_workbench.py` checks access, queue rules, review versioning, cost validation, atomic corrections, retry behavior, complete coverage and time-zone boundaries against an isolated temporary database.
- `node scripts/qa-growth-workbench.cjs` checks the staff interface with synthetic records and no mail worker. It does not create production enquiries, send messages or launch ads.

Both checks are included in the website preview workflow. New database tables are additive. A code rollback must preserve the database and audit records.

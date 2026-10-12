# Demo-to-sale workflow

Open **Demo → sale** on an enquiry in the private team inbox.

1. Save discovery requirements. These remain staff-only until someone explicitly copies them into a proposal scope and publishes that proposal.
2. Select an available slot and confirm that the customer agreed to the time. Booking uses the existing enquiry, reserves one slot and queues the existing confirmation email and private appointment link. It does not create a duplicate lead or grant client-workspace access.
3. Add joining details through the existing project workspace. Existing appointments use the customer's private appointment link for rescheduling; managers can cancel in Demos.
4. Record the outcome after the appointment. Completed requires requirements and a past scheduled start; No show also requires a past start. Public rescheduling resets the effective outcome, preserves requirements/audit history, and rejects stale outcome submissions.
5. Open or create the linked project. Review discovery notes, then explicitly copy them into an editable proposal scope. Save an immutable proposal revision in INR, USD, GBP or EUR. Currency selection never converts the entered amount. Publishing and client invitations remain separate explicit actions.
6. Save owner, next action, follow-up date and sales stage in the existing follow-up form. A demo outcome, proposal acceptance or booking does not automatically mark a deal Won.

## Conversion report

The inbox Reports view uses a received-date cohort of 7, 30 or 90 days, excluding deployment QA and respecting agent ownership. Each enquiry is counted once.

- Enquiry to demo: recorded reservation / enquiries. Cancelled reservations remain historical booking milestones.
- Demo to proposal: enquiries with a proposal published after a reservation / enquiries with a recorded reservation. Drafts are excluded.
- Proposal to Won: current Won enquiries with a recorded Won event after that publication / enquiries with publication after a reservation.
- Completed demos use the current recorded outcome for the current schedule. All published proposals and all current Won enquiries also appear separately, so steps skipped outside this route are visible without inflating its conversion rates.
- Empty denominators display no rate. Proposal acceptance is separate from Won. This report does not combine currencies, infer revenue, or attribute causation to a campaign.

Demo records have independent optimistic versions, an append-only audit, and a schedule-event check. Staff/session and CSRF checks apply to mutations. Requirements never appear in customer project API responses; the customer sees only an explicitly published proposal scope.

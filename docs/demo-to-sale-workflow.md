# Demo-to-sale workflow

Open **Demo → sale** on an enquiry in the private team inbox.

1. Save discovery requirements. These remain staff-only until someone explicitly copies them into a proposal scope and publishes that proposal.
2. Select an available slot and confirm that the customer agreed to the time. Booking uses the existing enquiry, reserves one slot and queues the existing confirmation email and private appointment link. It does not create a duplicate lead or grant client-workspace access.
3. Add joining details through the existing project workspace. Existing appointments use the customer's private appointment link for rescheduling; managers can cancel in Demos.
4. Record the outcome after the appointment. Completed requires requirements and a past scheduled start; No show also requires a past start. Public rescheduling resets the effective outcome, preserves requirements/audit history, and rejects stale outcome submissions.
5. Open or create the linked project. Review discovery notes, then explicitly copy them into an editable proposal scope. Save an immutable proposal revision in INR, USD, GBP or EUR. Currency selection never converts the entered amount. Publishing and client invitations remain separate explicit actions.
6. Save owner, next action, follow-up date and sales stage in the existing follow-up form. A demo outcome, proposal acceptance or booking does not automatically mark a deal Won.

## Completed demo follow-up

In Recovery, choose **Completed demo follow-up** and filter by business country. The target is the next weekday at the same India time after staff record completion, excluding weekends. Use the existing owner and next-action fields to assign the work. A current proposal published after completion and a saved recap clear this item. An accepted proposal also clears it. Drafts and expired proposals still need attention.

Open **Post-demo recap** on the completed demo. Write only customer-facing content, then save the draft. To send it to the email recorded on the enquiry, explicitly review the saved version and queue it. The mail queue sends one recap per completed schedule and discards a pending recap if the appointment or recipient changes. In the proposal editor, copy the saved recap into an empty scope, edit the content, and review the preselected quote currency before saving. Publishing a proposal is a separate step.

## Conversion report

The inbox Reports view uses a received-date cohort of 7, 30 or 90 days, excluding deployment QA and respecting agent ownership. Each enquiry is counted once.

- Enquiry to demo: recorded reservation / enquiries. Cancelled reservations remain historical booking milestones.
- Demo to proposal: enquiries with a proposal published after a reservation / enquiries with a recorded reservation. Drafts are excluded.
- Proposal to Won: current Won enquiries with a recorded Won event after that publication / enquiries with publication after a reservation.
- Completed demos use the current recorded outcome for the current schedule. All published proposals and all current Won enquiries also appear separately, so steps skipped outside this route are visible without inflating its conversion rates.
- Empty denominators display no rate. Proposal acceptance is separate from Won. This report does not combine currencies, infer revenue, or attribute causation to a campaign.

Demo records have independent optimistic versions, an append-only audit, and a schedule-event check. Staff/session and CSRF checks apply to mutations. Requirements never appear in customer project API responses; the customer sees only an explicitly published proposal scope.

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

Customers can open **Prepare for your demo** from the private appointment page before a confirmed meeting. They can share a process to improve, their current tools and whether a colleague should join. All answers are optional. The same prep brief follows a rescheduled appointment. Staff with access to the enquiry can review it in **Demo → sale**.

After recording the demo as Completed, save the agreed action and date. The action and any customer-facing detail appear in the recap preview and are appended when the reviewed recap is queued. A queued or sent recap freezes the step for that appointment. A rescheduled appointment has its own attendance and next-step record.

In **Reports → CRM demo to customer conversion**, use the existing 7, 30 or 90-day window. The cohort uses the scheduled date of each current confirmed CRM demo marked Completed. An enquiry counts once in its saved US, UK or India market. The report counts agreed steps, proposals published after the demo time, and enquiries currently marked Won with a recorded Won event after that time. The conversion rate is Won divided by attended demos. It measures sales outcomes and excludes payment totals.

## Conversion report

The inbox Reports view uses a received-date cohort of 7, 30 or 90 days, excluding deployment QA and respecting agent ownership. Each enquiry is counted once.

- Enquiry to demo: recorded reservation / enquiries. Cancelled reservations remain historical booking milestones.
- Demo to proposal: enquiries with a proposal published after a reservation / enquiries with a recorded reservation. Drafts are excluded.
- Proposal to Won: current Won enquiries with a recorded Won event after that publication / enquiries with publication after a reservation.
- Completed demos use the current recorded outcome for the current schedule. All published proposals and all current Won enquiries also appear separately, so steps skipped outside this route are visible without inflating its conversion rates.
- Empty denominators display no rate. Proposal acceptance is separate from Won. This report does not combine currencies, infer revenue, or attribute causation to a campaign.

### Proposal decisions by market

The Proposal decisions table compares the US, UK and India using proposal revisions published in the selected 7, 30 or 90 days, including revisions for older enquiries. The acceptance rate divides recorded acceptances by published revisions. A replacement revision gets its own row in the underlying counts. Drafts are excluded, and expired, withdrawn and superseded revisions still count if they were published.

Median time to decision uses elapsed time from publication to a recorded acceptance or to a staff-recorded Lost event. For an enquiry still marked Lost, its latest Lost event is matched to the most recent revision already published at that time, unless that revision has a recorded acceptance. Revisions without either outcome are excluded from the median. Change requests count on their original revision, independently of whether the revision was later replaced or accepted. Country and staff access use the saved business country and current enquiry ownership. QA records are excluded.

Demo records have independent optimistic versions, an append-only audit, and a schedule-event check. Staff/session and CSRF checks apply to mutations. Requirements never appear in customer project API responses; the customer sees only an explicitly published proposal scope.

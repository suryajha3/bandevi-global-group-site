# Website enquiry measurement

Released 6 October 2026. New events use the existing GA4 helper and honour Do Not Track. Analytics can be blocked, so these counts cover measured visits, not every visitor. No production test enquiry is required.

| Event | Trigger | Allowed context |
| --- | --- | --- |
| travel_comparison_brief_click | Click a comparison link to a known tailored brief | canonical page URL, fixed entry_workflow |
| project_brief_start | First input/change or valid continue in a page visit | canonical page URL, fixed service_interest and entry_workflow |
| project_brief_step | First valid transition to step 2 or 3 per page visit | above plus numeric step_number |
| project_brief_saved | Saved-reference confirmation shown by the successful API response | above; service captured before reset |
| generate_lead (existing) | Valid saved API response, deduplicated by reference locally | lead_type, fixed service_interest, acquisition_channel, landing_page, canonical page URL |

Never send names, email, phone, message, business problem, features, budget, launch date, reference IDs or arbitrary query values in these events. Service and entry context come from fixed allowlists. References are used only in page memory to suppress repeated success observation. Returning to a step or resetting the form does not inflate the visit-level start/step counts. A page reload starts a new visit-level sequence; these are not unique-person counts. Click events count clicks, including repeats.

In GA4 Explorations, build a closed funnel: project_brief_start → project_brief_step filtered to step_number=2 → project_brief_step filtered to step_number=3 → project_brief_saved. Break down by entry_workflow or service_interest. Use travel_comparison_brief_click separately to compare which starting points attract interest. Do not add project_brief_saved to generate_lead totals: both describe the same successful brief, with different analysis purposes. Compare demo requests using existing generate_lead filtered lead_type=demo and service_interest. CRM and ERP demo packages share crm_erp; do not claim separate CRM/ERP demo counts from that existing field.

For lead quality, use the authenticated inbox source report and review current Qualified, Proposal, Won and Lost stages by acquisition channel. Keep test/QA records excluded. This is a current-stage snapshot, not a historical qualification conversion rate. Staff must keep ownership, follow-up and stage information current. No customer identifiers or private sales outcomes are joined into GA4.

GA4 report definitions/custom dimensions were not created by this code release. Register entry_workflow as an event-scoped custom dimension and step_number as an event-scoped custom metric if required for reports; existing dimensions can be reused where already configured. Confirm events in Realtime/DebugView from an authorised non-DNT visit before interpreting reports. No actual post-release receipt or performance uplift is claimed here. Review comparable date ranges after sufficient real traffic, accounting for blocking, repeated visits and small samples.


## GA4 setup completed 6 October 2026

Property 545292647 has event dimensions Brief entry workflow (entry_workflow) and Project brief step (step_number), alongside existing service/source fields. Two named events now identify the valid transitions directly: project_brief_requirements_complete and project_brief_review_reached. They share the fixed context allowlist and visit-level deduplication of project_brief_step. Keep the generic step event for compatibility; do not sum generic and named step counts. Use the named events in the funnel, so exact step identification does not depend on newly registered custom fields.

Saved exploration: https://analytics.google.com/analytics/web/?authuser=1#/analysis/a400836304p545292647/edit/kaPDbvgfSPKy6PHSGsDHcw . Includes a closed project-brief funnel and a free-form generate_lead table by Enquiry service interest and Enquiry acquisition category. New definitions may need Google processing before they become available for breakdowns. The local verification visit contributed start and step events but no saved enquiry. Realtime confirmed the original comparison/start/step events; saved-brief receipt remains unverified without a real successful enquiry.


## Enquiry journeys and first contact — 12 October 2026

Reports → Enquiry journeys and first contact in the private team inbox shows 7/30/90-day anonymous form-start cohorts by canonical page, form category and acquisition channel. Started, measured saved, no measured save yet, validation issues and failed submissions are deduplicated within each page-memory journey. The same journey can have an error and later save; these columns are not additive. No measured save yet includes journeys still in progress, blocked telemetry and lost requests; it is not a definitive abandonment count. Up to 100 groups are displayed. Call, email, WhatsApp and demo clicks are action counts, not saved leads or proof a conversation occurred.

The same-origin /api/measurement accepts only fixed event/context categories and known public paths. It rejects extra fields, arbitrary reason text, query-bearing paths, lead references and non-UUID journey identifiers. Random journey identifiers stay in page memory and are never joined to enquiry IDs; no visitor cookies or persistent journey storage are added. Events expire from the active DB after 90 days. One-hour hashed network rate-limit identifiers are stored separately, without a journey link; the measurement Nginx route disables access logging. Existing backup retention applies to backup copies. Do Not Track is honoured in browser and collector; blocked analytics never prevents form submission.

GA4 retains existing contact_click and demo select_content events without adding duplicate click events. Additional enquiry_start, enquiry_invalid, enquiry_failed and enquiry_saved events contain only fixed form/error/source categories and canonical page location. The random journey identifier is never sent to GA4. enquiry_saved and existing generate_lead describe the same successful enquiry and must not be summed. No GA4 configuration or third-party report setup is required for the new private report.

First-contact statistics use saved-enquiry received-date cohorts, exclude QA-verified records, and take the earliest recorded connected call, staff-reported sent email or stage transition to Contacted, Qualified, Proposal or Won. Notes, unanswered calls, voicemail, owner changes and automated acknowledgements do not count. Median/average time, within-24-hour count and oldest record without contact are calendar elapsed time, not business hours. Missing historical activity is not inferred. A sent-email activity does not prove delivery; a stage change does not prove the customer replied. Agents see assigned-lead response metrics only; website journey totals are available to managers/admins. Reports never expose customer identifiers or activity bodies.

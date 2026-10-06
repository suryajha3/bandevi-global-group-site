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

# Sample CRM measurement

GA4 property: 545292647. Existing measurement ID: G-TGK7Z8VNJX.

| Event | Trigger | Counting rule |
| --- | --- | --- |
| sample_demo_start | Choose-enquiry guide button, enquiry/stage selection or first successful stage update | Once per page load, including after reset |
| sample_stage_change | An enquiry actually moves to a different stage | Every successful stage change; same-stage attempts excluded |
| sample_walkthrough_complete | Review the updated card after a successful move | Once per page load, including after reset |
| sample_enquiry_click | Intro or completion CRM discussion link clicked | Every click, with cta_placement = intro or completion |

All events have demo_id = crm_pipeline and a canonical page_location without query parameters. Stage-change events include only from_stage and to_stage (new, contacted or proposal). They do not include names, enquiry text, email addresses, telephone numbers, selected sample IDs or query strings. Existing Do Not Track behavior is respected. Analytics failures do not interrupt the sample.

In GA4, open Reports > Engagement > Events and look for these names after real traffic has been processed. Compare total users per event for reach and event counts for interaction volume. Stage changes and enquiry clicks can occur multiple times, so their event counts are not unique visitor counts. An enquiry-link click does not prove a submitted enquiry. Existing generate_lead remains the event for a successfully saved website enquiry.

For a sequential funnel, use Explore > Funnel exploration with sample_demo_start, sample_stage_change, sample_walkthrough_complete and sample_enquiry_click. A closed funnel includes only visitors who follow that sequence; visitors can click the intro enquiry link without trying the demo and will be excluded. Use an open funnel or the Events report to examine these direct enquiry clicks separately. Custom event parameters may require custom definitions for reporting; no new definitions are needed to see the event names and counts. Browser blocking and Do Not Track can reduce measurement coverage.

These are interaction events, not verified sales or revenue. No fake visits or production test enquiries were created. Do not mark starts, stage changes or completion as lead conversions. Use accumulated real traffic to find where visitors stop before changing the demo.

Reporting reference: [Google Analytics funnel exploration](https://support.google.com/analytics/answer/9327974?hl=en).

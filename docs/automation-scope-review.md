# Business Process Automation scope review

Review-only implementation of the 24 October UK/US service brief. The existing service now distinguishes custom workflow development from product selection and outsourced operations, consolidates five proposed discovery outputs, and clarifies the fictional failed-update example. Company-record wording directs buyers to record status and project responsibilities rather than implying verified staffing or financial strength.

The primary action reaches the existing regional enquiry section. UK/US links, Automation Package selection, country/currency defaults and attribution are retained. Provider-dependent caveats and existing guide/ERP links remain. Proposed artefacts are explicitly subject to the written proposal.

Implementation is restricted to the businessProcessAutomation renderer, its static main content and a page-specific stylesheet. Metadata, shared client/measurement/consent runtime, regional forms, other automation service, homepage and server are unchanged. No new analytics integration is included.

Validation: existing automation buyer-journey suite; targeted source/static checks at 320, 390, 768 and 1440 pixels; both guide-to-automation-to-UK/US paths; intercepted failed-save/retry; original organic/campaign attribution; unknown, declined, granted and DNT consent states; withdrawal; no-JavaScript links. All writes and external analytics are intercepted. Tests do not create production enquiries.

Release status: undeployed; review approval required. Analytics PR153 remains separate and undeployed. Goodfirms stays pending. ERP proposal, article, outreach and customer case-study drafts stay unpublished; outreach stays unsent.

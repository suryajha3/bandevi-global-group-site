# Travel ERP supplier-review example

Review-only implementation of the approved Travel ERP brief, based on main `8f59c245180d995092e87ac5fe90999b7385781e`. Do not deploy without a separate release instruction.

The existing `#erp-finance` section now explains four proposed supplier-review scenarios: a due balance, incomplete approval, repeated/unmatched update, and payment reported by another system. Each scenario identifies the record/review scope and an example acceptance check. A short handover checklist separates customer receipts, supplier obligations, approval completion and bank settlement.

This replaces three generic finance cards. The existing software-fit comparison, fictional walkthrough, guide links, regional/demonstration CTAs and IDs remain intact. Copy explicitly describes proposed scope; no connected payment integration, deployed permissions, reconciliation engine or customer result is claimed. The public walkthrough retains its fictional-prototype qualification.

The native table has a caption, column headers and row headers. On small screens its rows stack with visible labels; those duplicate visual labels are hidden from assistive technology. The dedicated stylesheet is loaded only on the ERP page and overrides the shared 680px table minimum only for this example.

Only the ERP finance renderer string and its matching prerendered section change. Page title, H1, canonical, descriptions, structured data, forms, browser client, attribution, consent, measurement and server code remain unchanged. The optional metadata rewrite in the brief is deferred. The analytics integration remains separate in draft PR153.

Validation includes the existing ERP finance regression and new `qa-erp-supplier-review.cjs`: responsive and source/static parity checks; semantic table headers; anchor clearance; both guides into UK/US ERP enquiries; original organic/campaign landing attribution; currency/service prefills; failed-save retry/idempotency; analytics unknown/granted/Do Not Track and withdrawal; native no-JavaScript content. All writes and external analytics are intercepted locally. The existing finance regression retains its demo, regional, fallback-font and button-clipping checks; only its expected finance heading is updated.

Goodfirms stays pending. ERP proposal, article, outreach and Trip Sarathi case-study drafts stay unpublished; outreach stays unsent. The process-automation brief is not implemented in this change. No production records, settings, indexing requests or services are changed.

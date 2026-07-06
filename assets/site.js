const asset = (name) => `/assets/${name}`;

const icons = {
  arrow: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  menu: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  close: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  globe: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.2-2.3 3.4-5.3 3.4-9S14.2 5.3 12 3m0 18c-2.2-2.3-3.4-5.3-3.4-9S9.8 5.3 12 3M3.6 9h16.8M3.6 15h16.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  plane: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 11 18-7-7 18-3-8-8-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  chart: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19V5m0 14h16M8 16l3-5 3 3 5-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  shield: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 5 6v6c0 4.3 2.8 7.4 7 9 4.2-1.6 7-4.7 7-9V6l-7-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  stack: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 8 4-8 4-8-4 8-4Zm8 8-8 4-8-4m16 4-8 4-8-4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  users: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4m8-12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm3 12c0-1.7-.9-3.2-2.3-4m.8-11.5a3 3 0 0 1 0 5.8M5 19c0-1.7.9-3.2 2.3-4M6.5 3.5a3 3 0 0 0 0 5.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  mail: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16v12H4V6Zm1 1 7 6 7-6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  phone: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L17 13l5 2v4c0 1.1-.9 2-2 2C10.6 21 3 13.4 3 4c0-1.1.9-2 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  message: '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5h16v11H8l-4 4V5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

const navItems = [
  ["Home", "/", "home"],
  ["About", "/about-us/", "about"],
  ["Profile", "/company-profile/", "profile"],
  ["Travel CRM", "/travel-crm/", "crm"],
  ["Travel ERP", "/travel-erp/", "erp"],
  ["Products", "/it-products/", "itProducts"],
  ["IT Solutions", "/website-mobile-app-development/", "webApp"],
  ["Blog", "/blog/", "blog"],
  ["Contact", "/contact-us/", "contact"]
];

const socialLinks = [
  ["Facebook", "https://www.facebook.com/profile.php?id=61591222415314"],
  ["Instagram", "https://www.instagram.com/bandeviglobalgroup/"],
  ["LinkedIn", "https://www.linkedin.com/in/bandevi-global-group-38584b419/"],
  ["X", "https://x.com/BANDEVIGLOBAL"]
];

const contactInfo = {
  phoneDisplay: "+91 8287669022",
  phoneHref: "tel:+918287669022",
  email: "sales@bandeviglobalgroup.com",
  whatsapp: "https://wa.me/918287669022"
};

const brandAliases = ["BANDEVI GLOBAL GROUP", "Bandevi Global Group", "Bandevi Global", "Bandevi"];

const officeLocations = [
  ["Delhi", "Third Floor, Gulshan Park, H-30, Plot No. 6 & 7, Vijay Chowk Area, Laxmi Nagar, Delhi 110092"],
  ["Pune", "Spacelane 15/a, 4th Floor, A Building, City Vista, Fountain Road, Ashoka Nagar, Kharadi, Pune, Maharashtra 411014"],
  ["Gurgaon", "7th Floor, 704 Palm Court, Mehrauli Gurugram Road, Sector 16, Gurgaon, Haryana 122001"],
  ["Mumbai", "1st Floor, Sai Dham Housing Society, B-2, Marol Naka, Andheri East, Mumbai 400059"],
  ["Bangalore", "561, 32nd Cross Rd, 4th Block, Jayanagar, Bengaluru 560011"],
  ["Kolkata", "2D, Bose Pukur Rd, Prantik Palli, Kasba, Kolkata 700042"],
  ["Lucknow", "Radiant Complex, Cantonment Road, Lalbagh, Lucknow 226001"],
  ["Dubai", "Office 203, Al Tayer Building, Sheikh Zayed Road, Dubai, UAE"],
  ["London", "71-75 Shelton Street, Covent Garden / Holborn, London WC2H 9JQ"],
  ["United States", "216 W Garvey Avenue, Suite C, Monterey Park, California 91754"]
];

const sisterBrandTrustStats = [
  ["Since 2007", "THG's travel presence gives BANDEVI real operating context for travel, hospitality, support, and customer-service systems."],
  ["26+", "Office and service-location context across India, Dubai, London, and the United States."],
  ["1,289", "Current company-provided worldwide staff count across operations, sales, support, partnerships, technology, and business development."],
  ["INR 7,594 Cr", "Current company-provided net worth and group strength figure. Supporting CA, audited, or company-profile proof can be linked when public."]
];

const companyProfileFacts = [
  ["Official company", "BANDEVI GLOBAL GROUP"],
  ["Common search names", "Bandevi Global Group, Bandevi Global, Bandevi, BANDEVI GLOBAL GROUP"],
  ["Chairman", "Mr Surya Kant Jha"],
  ["Core work", "Premium websites, CRM, ERP, portals, e-commerce, automation, IT products, and business software."],
  ["Staff size / ecosystem", "1,289 staff worldwide as currently provided by the company, across operations, sales, support, partnerships, technology, and business development."],
  ["Net worth / group strength", "INR 7,594 Cr current company-provided net worth and group strength figure. Supporting CA, audited, or company-profile proof can be linked when public."],
  ["Offices / service locations", "10 listed office and service-location references across India, Dubai, London, and the United States."],
  ["Official contact", `${contactInfo.phoneDisplay} and ${contactInfo.email}`]
];

const companyProfileFaqs = [
  ["What is BANDEVI GLOBAL GROUP net worth?", "The current company-provided net worth and group strength figure is INR 7,594 Cr. Supporting CA, audited, or company-profile proof can be linked when public."],
  ["What is BANDEVI GLOBAL GROUP staff size?", "The current company-provided staff count is 1,289 staff worldwide across operations, sales, support, partnerships, technology, and business development. Individual project teams are allocated according to scope."],
  ["Where are BANDEVI GLOBAL GROUP offices?", "The website lists office and service-location references for Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, Lucknow, Dubai, London, and the United States."],
  ["Are BANDEVI and THG the same company?", "BANDEVI GLOBAL GROUP remains the IT and software development company. The Holidays Group is referenced as a separate sister-brand context where trust, travel operations, and group ecosystem signals are discussed."]
];

const proofVerificationItems = [
  ["Official company identity", "BANDEVI GLOBAL GROUP, also searched as Bandevi Global Group, Bandevi Global, Bandevi, and BANDEVI.", "Published on the official website and structured company profile."],
  ["Official website", "https://bandeviglobalgroup.com/", "Primary public domain for brand, service, and contact verification."],
  ["Official contact channels", `${contactInfo.phoneDisplay}, ${contactInfo.email}, WhatsApp, and connected social profiles.`, "Published for direct customer verification before project discussions."],
  ["Chairman", "Mr Surya Kant Jha", "Published leadership detail with a public chairman and company identity note for company-profile, directory, and proof consistency."],
  ["Staff size / ecosystem", "1,289 staff worldwide as currently provided by the company.", "Priority figure published publicly with a staff confirmation note. HR, team, payroll, partner, or company-profile support can be attached when public."],
  ["Net worth / group strength", "INR 7,594 Cr current company-provided net worth and group strength figure.", "Priority figure published publicly with a net worth and group strength note. CA, audited, valuation, or board-approved proof can be attached when public."],
  ["Offices / service locations", "10 listed office and service-location references across India, Dubai, London, and the United States.", "Published location table and office verification sheet with address-level references for visitor and search verification."],
  ["Sister-brand separation", "BANDEVI is the IT and software company. THG is referenced only as separate sister-brand operating context.", "Published separation note reduces confusion between group ecosystem signals and company-specific claims."],
  ["Project proof", "Scope notes, proposals, handover records, access lists, and support history can support client work.", "Use case studies, testimonials, launch records, or client-approved proof when ready for public display."]
];

const proofDocumentChecklist = [
  ["Staff proof pack", "Public staff confirmation note is now available. Team register, HR summary, payroll certificate, partner network note, or board-approved staff declaration can be attached when approved."],
  ["Net worth proof pack", "Public net worth and group strength note is now available. CA certificate, audited statement, valuation note, asset summary, or board-approved net worth declaration can be attached when approved."],
  ["Office proof pack", "Public office verification sheet is now available. Office photos, lease or service-office confirmation, Google Business Profile links, map links, or location-specific contact proof can be attached when approved."],
  ["Company identity pack", "Public chairman and company identity note is now available. Registration, GST, MSME, incorporation, PAN, trademark, or formal company-profile PDF can be attached where applicable."],
  ["Project credibility pack", "Client approvals, signed case studies, testimonials, project launch screenshots, support records, and delivery certificates."],
  ["Sister-brand context pack", "Separate THG proof documents only where used as group ecosystem context, not as BANDEVI licence claims."]
];

const proofVerificationFaqs = [
  ["What staff size is published for BANDEVI GLOBAL GROUP?", "The current company-provided staff size is 1,289 staff worldwide across operations, sales, support, partnerships, technology, and business development."],
  ["What net worth figure is published for BANDEVI GLOBAL GROUP?", "The current company-provided net worth and group strength figure is INR 7,594 Cr. Supporting CA, audited, or company-profile proof can be linked when public."],
  ["Which offices are listed for verification?", "The website lists office and service-location references for Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, Lucknow, Dubai, London, and the United States."],
  ["What proof should be added next?", "The next proof items should be staff confirmation, CA or audited net worth support, office photos or map links, registration documents, and client-approved project proof."]
];

const directoryListingFacts = [
  ["Official business name", "BANDEVI GLOBAL GROUP"],
  ["Common search names", "Bandevi Global Group, Bandevi Global, Bandevi, BANDEVI"],
  ["Chairman", "Mr Surya Kant Jha"],
  ["Primary category", "IT company, software development company, CRM and ERP development company"],
  ["Services", "Websites, CRM, ERP, customer portals, e-commerce, Travel CRM, Travel ERP, lead and booking management, automation, dashboards, and IT products."],
  ["Website", "https://bandeviglobalgroup.com/"],
  ["Phone / WhatsApp", contactInfo.phoneDisplay],
  ["Email", contactInfo.email],
  ["Staff size", "1,289 staff worldwide as currently provided by the company."],
  ["Net worth / group strength", "INR 7,594 Cr current company-provided net worth and group strength figure."],
  ["Office references", "10 listed office and service-location references across India, Dubai, London, and the United States."],
  ["Proof links", "Company Profile, Proof & Verification, Staff Size & Net Worth, Offices & Locations, and company profile PDF."]
];

const directorySubmissionFaqs = [
  ["What name should be used in directories?", "Use BANDEVI GLOBAL GROUP as the official business name. Bandevi Global Group, Bandevi Global, Bandevi, and BANDEVI can be used as alternate names where a directory supports aliases."],
  ["Which category should directories use?", "Use IT company, software development company, CRM development company, ERP software company, website development company, travel technology company, and business automation company where relevant."],
  ["Which phone, email, and website should directories use?", `Use ${contactInfo.phoneDisplay}, ${contactInfo.email}, and https://bandeviglobalgroup.com/ as the primary public contact details.`],
  ["Can directories mention staff size and net worth?", "Yes, when the directory allows company profile details, use 1,289 staff worldwide and INR 7,594 Cr as company-provided public figures with proof links to the official website."],
  ["Which proof links should be included?", "Include the Company Profile page, Proof & Verification page, Staff Size & Net Worth page, Offices page, Contact page, Demo Request page, and company profile PDF."]
];

const staffWorthFacts = [
  ["Staff size", "1,289 staff worldwide as currently provided by the company."],
  ["Net worth / group strength", "INR 7,594 Cr current company-provided net worth and group strength figure."],
  ["Office network", "10 listed office and service-location references across India, Dubai, London, and the United States."],
  ["Public proof documents", "Official company profile PDF, public proof support pack, staff confirmation note, and net worth note linked from this website and the sitemap."],
  ["Official verification", "Use bandeviglobalgroup.com, +91 8287669022, and sales@bandeviglobalgroup.com for confirmation."]
];

const staffWorthProofSteps = [
  ["Staff confirmation", "Public staff confirmation note is now available. HR summary, staff declaration, payroll certificate, partner ecosystem note, or board-approved proof can be added when public sharing is allowed."],
  ["Net worth support", "Public net worth and group strength note is now available. CA certificate, audited statement, valuation note, asset summary, or board-approved net worth declaration can be added when public sharing is allowed."],
  ["Office support", "Public office verification sheet is now available. Office photos, service-office confirmations, map links, Google Business Profile links, or location-specific contact proof can be added next."],
  ["Company profile", "Keep the PDF, website profile, proof page, and office page aligned with the same staff and net worth figures."],
  ["External consistency", "Use the same company name, phone, website, and official contact details across social profiles, directories, and proposals."],
  ["Public updates", "If staff size or net worth changes, update this page, the proof page, the PDF, sitemap, and Search Console together."]
];

const staffWorthFaqs = [
  ["What is BANDEVI GLOBAL GROUP staff size?", "The current company-provided staff size is 1,289 staff worldwide across operations, sales, support, partnerships, technology, and business development."],
  ["What is BANDEVI GLOBAL GROUP net worth?", "The current company-provided net worth and group strength figure is INR 7,594 Cr. Supporting CA, audited, valuation, or company-profile proof can be linked when public."],
  ["Is the staff and net worth proof public?", "The figures are published on the official website and company profile PDF. Formal supporting documents can be linked when they are approved for public sharing."],
  ["Where can visitors verify BANDEVI company details?", "Visitors can use the Company Profile, Proof & Verification page, Offices page, official PDF, phone, WhatsApp, email, and the bandeviglobalgroup.com domain."]
];

const itCompanyServices = [
  ["Website development", "Premium business websites, landing pages, service pages, blog paths, lead forms, WhatsApp/call actions, and SEO-ready page structure."],
  ["CRM development", "Lead capture, assignment, follow-up reminders, customer records, quotation stages, source tracking, sales dashboards, and reporting."],
  ["ERP development", "Operations, approvals, suppliers, invoices, payments, documents, task ownership, inventory, finance flows, and management reports."],
  ["Portal development", "Customer portals, staff portals, partner portals, support desks, document downloads, service status, and secure role-based access."],
  ["E-commerce development", "Product catalogues, order flows, payments, customer accounts, inventory direction, service requests, and conversion-focused storefronts."],
  ["Business automation", "Workflow routing, reminders, notifications, document requests, support handoffs, reporting automation, and process dashboards."],
  ["Travel technology", "Travel CRM, travel ERP, travel websites, itinerary workflows, booking operations, supplier coordination, and customer communication systems."],
  ["IT product planning", "Discovery, module planning, UI direction, launch roadmap, analytics setup, training, support, and post-launch improvement planning."]
];

const itCompanyIndustries = [
  ["Travel and tourism", "Travel CRM, ERP, booking workflows, itinerary websites, supplier operations, and customer portals."],
  ["Service businesses", "Lead handling, quotations, follow-ups, job tracking, document collection, customer status, and support workflows."],
  ["Retail and commerce", "E-commerce storefronts, product catalogues, order handling, payment flows, and customer communication."],
  ["Food and packaged products", "Brand websites, catalogues, enquiry flows, distributor pages, and operations dashboards for masala, makhana, and related brands."],
  ["Consulting and professional services", "Corporate websites, service funnels, CRM pipelines, client portals, and internal management dashboards."],
  ["Multi-brand groups", "Separate websites, portals, CRMs, ERPs, access control, reporting, and support paths across multiple business lines."]
];

const itCompanyFaqs = [
  ["What services does BANDEVI GLOBAL GROUP provide?", "BANDEVI GLOBAL GROUP provides website development, CRM, ERP, portals, e-commerce, automation, travel technology, IT products, dashboards, and business software development."],
  ["Is BANDEVI GLOBAL GROUP an IT company?", "Yes. BANDEVI GLOBAL GROUP is presented on the official website as an IT and software development company building websites, CRM, ERP, portals, automation, and business systems."],
  ["Does BANDEVI build CRM and ERP systems?", "Yes. BANDEVI builds CRM and ERP systems for lead management, sales follow-ups, customer records, operations, approvals, finance workflows, documents, reporting, and team control."],
  ["Does BANDEVI build travel CRM and travel ERP software?", "Yes. BANDEVI has dedicated travel CRM, travel ERP, travel website, booking, supplier, itinerary, and customer communication service paths."],
  ["Where can visitors verify BANDEVI company strength?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, phone, email, and official website domain."]
];

const crmErpDevelopmentRows = [
  ["CRM", "Lead and enquiry management", "Capture leads from websites, WhatsApp, calls, campaigns, referrals, partners, and branch teams with owner assignment and source tracking."],
  ["CRM", "Sales pipeline and quotation stages", "Track inquiry status, proposal progress, follow-up reminders, lost reasons, customer notes, and conversion visibility."],
  ["CRM", "Customer records and service history", "Maintain customer profiles, communication notes, documents, preferences, support requests, invoices, and repeat-business signals."],
  ["CRM", "Team control and dashboards", "Review daily tasks, overdue follow-ups, consultant performance, source quality, lead ageing, and sales activity from one view."],
  ["ERP", "Operations and workflow management", "Move confirmed work into order, booking, project, service, task, approval, supplier, and delivery workflows."],
  ["ERP", "Finance, invoice, and payment control", "Track invoices, receipts, payment status, refunds, credit notes, approvals, margins, and management reports."],
  ["ERP", "Inventory, suppliers, and documents", "Manage supplier records, stock views, product or service availability, files, handover notes, and operating documents."],
  ["ERP", "Management reporting and automation", "Connect sales, operations, finance, workload, turnaround time, and performance into clearer dashboards and reminders."],
  ["CRM + ERP", "Multi-office access and reporting", "Set branch ownership, role-based permissions, office-level reporting, staff queues, escalation paths, and management dashboards across locations."],
  ["CRM + ERP", "Website, portal, and demo integration", "Connect website forms, demo requests, customer portals, support desks, payment status, documents, and dashboard views with CRM and ERP records."]
];

const crmErpIndustries = [
  ["Travel and tourism", "Travel CRM, travel ERP, itinerary workflows, booking files, supplier coordination, customer documents, payments, and portal access."],
  ["Service businesses", "Lead handling, quotation tracking, service delivery, customer history, support tickets, documents, follow-ups, and reporting."],
  ["Retail and e-commerce", "Customer CRM, order workflows, inventory visibility, distributor leads, product interest, payments, invoices, and repeat-customer reporting."],
  ["Food and packaged products", "Distributor CRM, bulk enquiry handling, stock and order control, product catalogues, dispatch status, and sales dashboards."],
  ["Consulting and professional services", "Client records, proposals, project status, document sharing, billing status, approval flows, and management reporting."],
  ["Multi-office groups", "Branch-wise leads, team ownership, role-based access, office-level reporting, task queues, approvals, and shared management dashboards."]
];

const crmErpFaqs = [
  ["What is CRM and ERP development?", "CRM and ERP development means building business software for lead management, customer records, sales pipeline, operations, finance, approvals, documents, dashboards, and automation."],
  ["Does BANDEVI GLOBAL GROUP build custom CRM software?", "Yes. BANDEVI builds CRM software for lead capture, enquiry routing, quotation stages, follow-up reminders, customer profiles, team assignment, source tracking, and sales dashboards."],
  ["Does BANDEVI GLOBAL GROUP build ERP software?", "Yes. BANDEVI builds ERP software for operations, tasks, bookings, orders, suppliers, inventory, approvals, invoices, payments, documents, finance workflows, and management reports."],
  ["Can CRM and ERP connect with a business website?", "Yes. Website forms, demo requests, WhatsApp actions, landing pages, campaigns, customer portals, payment flows, and dashboards can connect with CRM and ERP workflows."],
  ["Does BANDEVI build travel CRM and travel ERP?", "Yes. BANDEVI has dedicated travel CRM and travel ERP paths for inquiries, quotations, itineraries, bookings, suppliers, documents, invoices, payments, customer communication, and reports."],
  ["Where can visitors verify BANDEVI company details?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const webAppDevelopmentRows = [
  ["Corporate website development", "Company websites, service pages, about pages, proof sections, office pages, contact flows, lead forms, and SEO-ready page structure."],
  ["Landing page development", "Campaign pages, product or service pages, demo request pages, call/WhatsApp actions, conversion sections, and analytics-ready lead paths."],
  ["Web app development", "Admin panels, dashboards, role-based tools, workflow screens, internal business apps, reporting views, and integration-ready modules."],
  ["Mobile app development", "Customer apps, staff apps, service apps, mobile-first interfaces, account access, notifications, and workflow screens for Android or iOS planning."],
  ["Portal development", "Customer portals, partner portals, staff portals, support desks, document access, service status, invoices, and secure role-based views."],
  ["E-commerce website development", "Product catalogues, online storefronts, order flows, payments, customer accounts, distributor enquiries, stock direction, and reporting."],
  ["Travel website development", "Complete travel websites, white-label travel websites, destination pages, packages, enquiry forms, WhatsApp handoff, and booking-ready lead flows."],
  ["Website to CRM/ERP connection", "Website forms, demo requests, WhatsApp actions, customer data, portals, dashboards, and automation connected with CRM and ERP workflows."]
];

const webAppIndustries = [
  ["Corporate and service companies", "Professional websites, lead funnels, quotation flows, service pages, CRM-ready forms, portals, and business dashboards."],
  ["Travel and tourism", "Complete travel websites, white-label travel websites, travel CRM handoff, booking workflows, itinerary pages, and customer portals."],
  ["Retail and e-commerce", "Online stores, product catalogues, payment flows, inventory direction, customer accounts, distributor enquiries, and dashboards."],
  ["Food and packaged products", "Masala, makhana, and product-brand websites with catalogues, bulk enquiry paths, e-commerce planning, and distributor CRM support."],
  ["Consulting and professional services", "Authority websites, appointment or demo flows, client portals, document access, service dashboards, and content-led trust pages."],
  ["Multi-brand groups", "Separate websites, apps, portals, dashboards, access control, reporting, and support paths across multiple business lines."]
];

const webAppFaqs = [
  ["Does BANDEVI GLOBAL GROUP build websites?", "Yes. BANDEVI builds corporate websites, business websites, service pages, landing pages, travel websites, e-commerce websites, portals, and SEO-ready digital experiences."],
  ["Does BANDEVI build mobile apps?", "Yes. BANDEVI can plan and build mobile app experiences for customers, staff, service teams, portals, accounts, notifications, and business workflows."],
  ["Does BANDEVI build web apps and dashboards?", "Yes. BANDEVI builds web apps, admin panels, dashboards, role-based tools, reporting views, customer portals, staff portals, and workflow screens."],
  ["Can a website connect with CRM and ERP?", "Yes. Website forms, demo requests, WhatsApp actions, customer portals, e-commerce flows, dashboards, and automation can connect with CRM and ERP workflows."],
  ["Does BANDEVI build travel websites?", "Yes. BANDEVI builds complete travel websites and white-label travel websites with destination pages, package pages, enquiry forms, WhatsApp handoff, blogs, and CRM-ready lead capture."],
  ["Where can visitors verify BANDEVI before starting a website or app project?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const ecommerceDevelopmentRows = [
  ["Storefront development", "Responsive online stores with home, category, product detail, offer, search, cart, checkout, trust, and contact paths."],
  ["Product catalogue", "Manage categories, product names, images, variants, pack sizes, descriptions, price direction, stock notes, and enquiry paths."],
  ["Cart and checkout", "Create cart, checkout, address, delivery note, order confirmation, coupon, shipping, tax, and customer communication flows."],
  ["Payment workflow", "Plan payment gateway flow, payment status, receipts, failed-payment handling, manual review, refund direction, and finance visibility."],
  ["Order management", "Track order status, dispatch notes, customer updates, internal ownership, service requests, returns, and operational handoffs."],
  ["Inventory and stock visibility", "Show stock direction, low-stock alerts, product availability, distributor interest, bulk order records, and management reports."],
  ["Customer accounts and CRM", "Connect customer profiles, repeat orders, WhatsApp enquiries, distributor leads, support requests, campaigns, and CRM follow-ups."],
  ["Dashboards and campaigns", "Review sales, product interest, source quality, payment status, abandoned carts, repeat customers, and campaign performance."]
];

const ecommerceIndustries = [
  ["Masala and food products", "Product catalogues, pack sizes, bulk enquiries, distributor leads, offers, order interest, customer records, and sales dashboards."],
  ["Makhana brands", "Premium product pages, variant visibility, wholesale enquiries, gifting flows, payment paths, stock direction, and repeat-customer campaigns."],
  ["Retail and D2C brands", "Online storefronts, product discovery, checkout flows, coupons, payment status, customer accounts, returns, and reporting."],
  ["Wholesale and distributors", "Bulk enquiry forms, price request paths, partner leads, product interest, order notes, CRM follow-ups, and branch-wise reporting."],
  ["Service businesses", "Paid service packages, booking or request flows, customer records, invoices, support updates, and renewal communication."],
  ["Multi-brand groups", "Separate catalogues, shared CRM, role-based access, office or brand-level reports, product dashboards, and campaign visibility."]
];

const ecommerceFaqs = [
  ["Does BANDEVI GLOBAL GROUP build e-commerce websites?", "Yes. BANDEVI builds e-commerce websites and online stores with product catalogues, storefront pages, cart and checkout flows, payment planning, order management, customer records, and dashboards."],
  ["Can BANDEVI build an online store for masala, makhana, or packaged food brands?", "Yes. BANDEVI can build product websites and e-commerce-ready systems for masala, makhana, food-product, retail, D2C, wholesale, and distributor-led brands."],
  ["Can an e-commerce website connect with CRM and inventory?", "Yes. Product enquiries, customer accounts, orders, payment status, stock direction, distributor leads, campaigns, and support requests can connect with CRM, ERP, automation, and dashboards."],
  ["Can BANDEVI support payments and order workflows?", "Yes. BANDEVI can plan payment gateway flow, checkout, receipts, failed-payment handling, order status, customer notifications, dispatch notes, returns direction, and finance visibility."],
  ["Is the e-commerce page connected with proof and verification?", "Yes. Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, phone, email, and bandeviglobalgroup.com."],
  ["Can a simple product catalogue become a full online store later?", "Yes. A business can start with a catalogue and enquiry flow, then add cart, checkout, payments, inventory direction, customer accounts, CRM, dashboards, and automation later."]
];

const travelCrmRows = [
  ["Travel lead capture", "Capture enquiries from travel websites, package pages, destination pages, WhatsApp, calls, campaigns, referrals, walk-ins, branches, partners, and reseller channels."],
  ["Customer and trip profile", "Record customer details, destination interest, dates, pax count, budget direction, hotel category, service type, source, notes, and preferred contact method."],
  ["Quotation workflow", "Track itinerary discussions, proposal versions, package interest, pricing direction, quotation stage, approval notes, follow-up date, and customer response."],
  ["Follow-up management", "Use reminders, callback lists, overdue alerts, next-action notes, WhatsApp handoff, email notes, consultant ownership, and daily sales review."],
  ["Sales pipeline", "Move leads through new, contacted, qualified, quotation sent, negotiation, won, lost, postponed, repeat, and booking-ready stages."],
  ["Campaign and source tracking", "Track leads from SEO pages, ads, social media, referrals, partners, events, office teams, branches, and white-label travel sellers."],
  ["Dashboards and reports", "Review source quality, response speed, consultant activity, follow-up discipline, quote-to-booking conversion, lost reasons, and revenue pipeline."],
  ["Booking and portal handoff", "Qualified or confirmed leads can move into lead and booking management, Travel ERP, customer portal, payment reminders, documents, support, and automation."]
];

const travelCrmIndustries = [
  ["Travel agencies", "Capture package enquiries, WhatsApp leads, destination interest, quotations, follow-ups, customer records, source tracking, and booking-ready handoff."],
  ["Tour operators", "Manage FIT, group, pilgrimage, MICE, holiday, family, and custom-trip enquiries with quotation stages, owner assignment, and conversion reporting."],
  ["DMCs", "Track B2B partner leads, destination requests, service enquiries, quotation follow-ups, source quality, sales owners, and operations handoff."],
  ["Corporate travel desks", "Manage corporate enquiries, traveller profiles, approval notes, service preferences, follow-up ownership, billing direction, and reporting."],
  ["White-label networks", "Separate partner, branch, reseller, and franchise-style lead sources while keeping management visibility over conversion and workload."],
  ["Multi-office travel groups", "Use branch-wise ownership, team roles, source reporting, follow-up queues, customer records, sales dashboards, and management review."]
];

const travelCrmFaqs = [
  ["Does BANDEVI GLOBAL GROUP build Travel CRM software?", "Yes. BANDEVI builds Travel CRM software for travel agencies, tour operators, DMCs, corporate travel desks, white-label networks, branches, and multi-office travel groups."],
  ["What does Travel CRM software include?", "Travel CRM can include lead capture, customer profiles, trip interest, quotation stages, follow-up reminders, WhatsApp handoff, campaign tracking, source reports, sales dashboards, and booking-ready handoff."],
  ["Can Travel CRM manage WhatsApp and website leads?", "Yes. Travel website forms, package enquiries, destination enquiries, WhatsApp actions, phone calls, demo requests, campaigns, referrals, partner leads, and branch enquiries can feed into CRM-ready lead records."],
  ["Can Travel CRM connect with bookings and Travel ERP?", "Yes. Qualified or confirmed leads can connect with lead and booking management, Travel ERP, supplier workflows, passengers, invoices, payments, documents, customer portal access, and operations reporting."],
  ["Can Travel CRM help improve follow-up discipline?", "Yes. Travel CRM can provide reminders, next-action notes, overdue lead alerts, daily call lists, quotation follow-up stages, owner assignment, lost reasons, and sales dashboards."],
  ["Where can visitors verify BANDEVI before starting a Travel CRM project?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const travelErpRows = [
  ["Booking file management", "Create confirmed booking files with passengers, itinerary notes, services, suppliers, documents, invoices, payment status, owners, and operating status."],
  ["Passenger and traveller records", "Store passenger details, passport notes, visa direction, preferences, emergency information, document status, and communication notes."],
  ["Supplier workflow", "Manage hotels, transport, activities, guides, visa support, insurance, DMC partners, confirmations, rates, availability notes, and payment schedules."],
  ["Invoice and payment tracking", "Track customer invoices, receipts, pending dues, refunds, supplier payables, payment reminders, finance status, and reconciliation notes."],
  ["Document management", "Organize vouchers, tickets, visas, passports, insurance files, invoices, receipts, supplier confirmations, customer documents, and handover records."],
  ["Approvals and controls", "Define approval paths for discounts, margin exceptions, supplier changes, payment release, refunds, document exceptions, and operational changes."],
  ["Margins and reporting", "Review booking revenue, supplier cost, receivables, payables, gross margin, source performance, workload, exceptions, and branch/team performance."],
  ["CRM, portal, and automation path", "Confirmed CRM leads can move into ERP, customer portals, payment reminders, document requests, supplier tasks, status updates, and dashboards."]
];

const travelErpIndustries = [
  ["Tour operators", "Manage confirmed bookings, passengers, suppliers, invoices, payments, documents, approvals, margins, and operations reports from quote to closure."],
  ["Travel agencies", "Move won CRM leads into booking files with customer context, service details, supplier notes, invoices, payment status, and customer updates."],
  ["DMCs", "Coordinate destination services, B2B partner bookings, supplier tasks, local services, confirmations, documents, costing, and partner reporting."],
  ["Corporate travel desks", "Manage corporate bookings, traveller records, approval notes, invoices, service status, payment visibility, documents, and support workflow."],
  ["Group and MICE operators", "Control passenger lists, rooming notes, transport, event services, documents, supplier confirmations, invoices, payments, and task ownership."],
  ["Multi-office travel groups", "Use branch-wise booking ownership, role-based access, supplier workflows, finance visibility, approvals, dashboards, and management reports."]
];

const travelErpFaqs = [
  ["Does BANDEVI GLOBAL GROUP build Travel ERP software?", "Yes. BANDEVI builds Travel ERP software for tour operators, travel agencies, DMCs, corporate travel desks, group travel teams, MICE operators, and multi-office travel businesses."],
  ["What does Travel ERP software include?", "Travel ERP can include booking files, passengers, suppliers, services, invoices, receipts, payments, documents, approvals, margins, task ownership, customer updates, and operations reports."],
  ["Can Travel ERP connect with Travel CRM?", "Yes. Confirmed or qualified CRM leads can move into Travel ERP booking files with customer context, quote details, service requirements, documents, payments, and operations ownership."],
  ["Can Travel ERP manage supplier and payment workflows?", "Yes. Travel ERP can track supplier records, service confirmations, rates, payment schedules, payables, customer invoices, receipts, refunds, dues, and finance status."],
  ["Can Travel ERP connect with a customer portal?", "Yes. Booking status, documents, invoices, receipts, payment updates, support requests, and selected service information can connect with customer portal access when included in scope."],
  ["Where can visitors verify BANDEVI before starting a Travel ERP project?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const travelWebsiteDevelopmentRows = [
  ["Complete travel website", "Home, about, destinations, packages, services, blogs, trust sections, testimonials, enquiry forms, WhatsApp actions, contact paths, and analytics."],
  ["White-label travel website", "Reusable travel website structure for agencies, partners, branches, franchise-style sellers, resellers, controlled branding, and lead routing."],
  ["Destination pages", "SEO-ready pages for destinations, themes, package types, itinerary highlights, inclusions, exclusions, travel tips, FAQs, and enquiry actions."],
  ["Package pages", "Package detail pages with day-wise itinerary, pricing direction, hotel category notes, inclusions, exclusions, gallery, CTA buttons, and lead capture."],
  ["Enquiry and WhatsApp leads", "Website forms, WhatsApp handoff, call buttons, demo requests, source tracking, campaign landing pages, and CRM-ready lead records."],
  ["Travel CRM handoff", "Qualified enquiries can move into Travel CRM with customer details, trip interest, quotation stage, follow-up owner, and source reporting."],
  ["Booking and portal path", "Confirmed leads can later connect with booking workflows, customer portals, documents, invoices, payment status, support, and updates."],
  ["SEO and content setup", "Metadata, internal links, blog categories, schema support, Search Console readiness, analytics, and content paths for organic travel searches."]
];

const travelWebsiteIndustries = [
  ["Travel agencies", "Complete website presence, package pages, enquiry forms, WhatsApp leads, CRM handoff, blog content, testimonials, and search-ready pages."],
  ["DMCs", "Destination-led pages, supplier/service highlights, B2B enquiry flows, partner credibility sections, quotation paths, and lead routing."],
  ["Tour operators", "Itinerary pages, theme tours, group trips, pilgrimage, MICE, family holidays, enquiry capture, quotation handoff, and operations-ready content."],
  ["Corporate travel desks", "Corporate service pages, traveller enquiry paths, policy-friendly content, document request direction, support contact, and reporting handoff."],
  ["White-label networks", "Partner-ready websites, reseller branding, branch pages, shared package structure, controlled content, and source-wise lead capture."],
  ["Multi-office travel groups", "Office-wise pages, location trust, branch enquiry routing, role-ready lead ownership, CRM handoff, and management visibility."]
];

const travelWebsiteFaqs = [
  ["Does BANDEVI GLOBAL GROUP build travel websites?", "Yes. BANDEVI builds complete travel websites and white-label travel websites for travel agencies, DMCs, tour operators, corporate travel desks, partners, branches, and resellers."],
  ["What is a complete travel website?", "A complete travel website includes brand pages, destination pages, package pages, service pages, enquiry forms, WhatsApp actions, blogs, trust sections, analytics, SEO structure, and CRM-ready lead capture."],
  ["What is a white-label travel website?", "A white-label travel website is a reusable travel website structure that can be branded for agencies, partners, branches, franchise-style sellers, and reseller networks while keeping lead flow and content controlled."],
  ["Can the travel website connect with Travel CRM?", "Yes. Website forms, WhatsApp enquiries, package interest, destination interest, campaign leads, and demo requests can connect with Travel CRM for ownership, follow-ups, quotations, and reporting."],
  ["Can a travel website grow into a full travel technology system?", "Yes. A travel website can later connect with Travel CRM, Travel ERP, lead and booking management, customer portals, payment reminders, document workflows, dashboards, and automation."],
  ["Where can visitors verify BANDEVI before starting a travel website project?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const travelTechDevelopmentRows = [
  ["Complete travel website", "Destination pages, package pages, enquiry forms, WhatsApp handoff, blogs, trust sections, lead capture, analytics, and SEO-ready service pages."],
  ["White-label travel website", "Reusable travel website structure for agencies, partners, branches, resellers, franchise-style selling, controlled content, and lead routing."],
  ["Travel CRM", "Travel enquiries, trip interest, customer records, quotation stages, follow-up reminders, campaign leads, consultant ownership, and sales dashboards."],
  ["Travel ERP", "Booking files, passengers, services, suppliers, invoices, payments, documents, approvals, margins, operational tasks, and reporting."],
  ["Lead and booking management", "Capture website, phone, WhatsApp, campaign, referral, and partner leads, then move confirmed work into structured booking files."],
  ["Supplier and inventory workflows", "Supplier records, service inventory, confirmations, rates, availability notes, payment schedules, and operation handoffs."],
  ["Customer portal", "Controlled access for travelers and corporate clients to documents, invoices, booking status, support requests, profile details, and updates."],
  ["Automation and dashboards", "Lead routing, follow-up reminders, document requests, payment alerts, booking status updates, source reports, margin views, and workload dashboards."]
];

const travelTechIndustries = [
  ["Travel agencies", "Complete travel websites, enquiry capture, Travel CRM, quotation stages, follow-ups, customer records, and sales dashboards."],
  ["Tour operators", "Travel ERP, booking files, supplier coordination, passenger details, invoices, payments, documents, margins, and operations reports."],
  ["DMCs", "Partner enquiries, destination pages, supplier services, quotation control, booking operations, document workflows, and B2B reporting."],
  ["Corporate travel desks", "Corporate enquiries, traveller records, approval notes, invoices, service status, support tickets, and customer portal access."],
  ["White-label and reseller networks", "Brand-ready travel websites, branch or partner lead routing, controlled content, access roles, reports, and handoff workflows."],
  ["Multi-office travel groups", "Office-wise lead ownership, CRM stages, booking workflow, branch reporting, role-based access, dashboards, and management visibility."]
];

const travelTechFaqs = [
  ["What is travel technology?", "Travel technology connects travel websites, Travel CRM, Travel ERP, booking workflows, supplier coordination, customer portals, automation, payments, documents, and dashboards into a controlled digital system."],
  ["Does BANDEVI GLOBAL GROUP build travel technology systems?", "Yes. BANDEVI builds complete travel websites, white-label travel websites, Travel CRM, Travel ERP, lead and booking workflows, customer portals, automation, and travel dashboards."],
  ["Can BANDEVI build a complete travel website?", "Yes. BANDEVI can build travel websites with destination pages, package pages, enquiry forms, WhatsApp handoff, blogs, trust sections, CRM-ready lead capture, and SEO structure."],
  ["Can BANDEVI build Travel CRM and Travel ERP?", "Yes. Travel CRM can manage enquiries, customers, quotations, follow-ups, and campaigns. Travel ERP can manage bookings, suppliers, invoices, payments, documents, approvals, and reporting."],
  ["Can travel systems connect with customer portals and automation?", "Yes. Travel CRM, ERP, websites, portals, WhatsApp updates, payment reminders, document requests, dashboards, and reporting can be connected as the system grows."],
  ["Where can visitors verify BANDEVI before starting a travel technology project?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const leadBookingManagementRows = [
  ["Travel lead capture", "Capture website forms, WhatsApp enquiries, phone calls, campaigns, referrals, partner leads, branch leads, source, priority, and owner assignment."],
  ["Lead qualification", "Record destination interest, travel dates, pax count, budget direction, service type, customer notes, preferred contact method, and next action."],
  ["Quotation tracking", "Track quote status, package interest, proposal version, consultant ownership, follow-up date, response history, lost reason, and conversion stage."],
  ["Follow-up management", "Use reminders, overdue alerts, daily call lists, WhatsApp handoff, email notes, callback ownership, and sales-stage movement."],
  ["Booking file creation", "Move confirmed enquiries into booking files with passengers, services, suppliers, itinerary notes, documents, payments, invoices, and status."],
  ["Sales to operations handoff", "Keep customer context, quote details, service requirements, document needs, and payment status visible when operations takes over."],
  ["Dashboards and reports", "Review source quality, response speed, pending follow-ups, quote-to-booking conversion, open booking workload, payment status, and team performance."],
  ["CRM, ERP, and portal path", "Connect the workflow with Travel CRM, Travel ERP, customer portals, payment reminders, document requests, support updates, and automation."]
];

const leadBookingIndustries = [
  ["Travel agencies", "Website, WhatsApp, call, referral, and campaign enquiries can move from lead capture to quotation, follow-up, booking file, and customer update."],
  ["Tour operators", "FIT, group, pilgrimage, MICE, holiday, and package enquiries can convert into booking files with passengers, suppliers, invoices, payments, and documents."],
  ["DMCs", "Partner enquiries, destination requests, supplier services, quotation stages, B2B follow-ups, operations handoff, and booking status can stay organized."],
  ["Corporate travel desks", "Corporate requests, traveller details, approval notes, billing direction, document needs, support queries, and service status can be tracked together."],
  ["White-label networks", "Partner, branch, reseller, and franchise-style lead sources can be separated while management still reviews conversion and booking progress."],
  ["Multi-office travel groups", "Branch-wise lead ownership, team follow-ups, booking workload, source reporting, user roles, and management dashboards can stay visible."]
];

const leadBookingFaqs = [
  ["Does BANDEVI GLOBAL GROUP build lead and booking management software?", "Yes. BANDEVI builds lead and booking management software for travel agencies, tour operators, DMCs, corporate travel desks, white-label networks, branches, and multi-office travel groups."],
  ["What does lead and booking management include?", "It can include lead capture, source tracking, owner assignment, qualification fields, quotation tracking, follow-up reminders, booking files, documents, suppliers, payments, invoices, dashboards, and reports."],
  ["Can WhatsApp and website enquiries be managed together?", "Yes. Website forms, demo requests, WhatsApp handoff, call enquiries, campaign leads, referrals, partner leads, and branch enquiries can be routed into a cleaner sales queue."],
  ["Can confirmed leads become booking files?", "Yes. Confirmed enquiries can move into booking files with passenger details, service items, suppliers, itinerary notes, documents, invoices, payment status, support notes, and operations ownership."],
  ["Can this connect with Travel CRM and Travel ERP?", "Yes. The lead side can connect with Travel CRM for sales follow-up, and the confirmed booking side can connect with Travel ERP for operations, suppliers, finance, documents, and reporting."],
  ["Where can visitors verify BANDEVI before starting a lead and booking project?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const customerPortalRows = [
  ["Customer login", "Role-based customer, corporate client, partner, or traveller access with profile details, service history, booking status, and controlled information views."],
  ["Booking and service status", "Trip status, project milestones, consultation stages, order status, service progress, internal owner notes, and customer-facing updates."],
  ["Documents and files", "Document requests, uploads, downloads, vouchers, tickets, invoices, receipts, reports, project files, policy notes, and handover documents."],
  ["Invoices and payments", "Invoice access, receipts, payment status, due reminders, refund notes, statements, finance handoff, and payment communication support."],
  ["Support requests", "Ticket-style requests, support history, priority notes, response records, service categories, internal routing, and customer updates."],
  ["CRM and ERP connection", "Portal views can connect with CRM customer records, ERP booking files, order workflows, finance records, documents, and support queues."],
  ["Automation and notifications", "Status updates, document reminders, payment reminders, support alerts, booking notes, email or WhatsApp handoff, and dashboard summaries."],
  ["Dashboards and reporting", "Management views for portal activity, open requests, document status, unpaid invoices, service turnaround, customer satisfaction, and workload."]
];

const customerPortalIndustries = [
  ["Travel agencies", "Customers can view booking status, trip documents, vouchers, invoices, payment status, support requests, traveller profiles, and updates."],
  ["Tour operators", "Groups, FIT bookings, pilgrimage, MICE, family trips, and holiday packages can use portal views for documents, services, invoices, and support."],
  ["DMCs", "Partners and B2B clients can access controlled destination service updates, supplier-linked details, documents, invoices, and request history."],
  ["Corporate travel desks", "Corporate clients can manage traveller details, approvals, invoices, service requests, travel documents, and status communication."],
  ["Service businesses", "Customers can view project milestones, documents, invoices, support tickets, service updates, onboarding details, and account history."],
  ["Multi-office groups", "Branches, partners, customers, and internal teams can use role-based access with separated records, support queues, reports, and dashboards."]
];

const customerPortalFaqs = [
  ["Does BANDEVI GLOBAL GROUP build customer portal software?", "Yes. BANDEVI builds customer portal software for travel companies, service businesses, corporate teams, partner networks, multi-office groups, and brands that need controlled customer access."],
  ["What can a customer portal include?", "A customer portal can include login access, booking status, service status, documents, invoices, receipts, payment status, support requests, profile details, project milestones, notifications, and dashboards."],
  ["Can a customer portal connect with CRM and ERP?", "Yes. A portal can connect with CRM customer records, Travel CRM, Travel ERP, booking files, order workflows, invoices, payments, documents, support queues, and automation."],
  ["Can travel customers use the portal for trip documents?", "Yes. Travel customers can use a portal for vouchers, tickets, itineraries, visa notes, invoices, receipts, payment updates, support requests, and booking status."],
  ["Can corporate clients and partners get separate portal access?", "Yes. Corporate clients, partners, branches, resellers, and support teams can receive separate role-based views when the project scope includes those access rules."],
  ["Where can visitors verify BANDEVI before starting a portal project?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const automationDevelopmentRows = [
  ["Lead automation", "Route website forms, demo requests, WhatsApp enquiries, campaign leads, partner leads, and branch enquiries to the right owner with source tracking."],
  ["Follow-up automation", "Create reminders, next-action alerts, overdue lead signals, quotation follow-ups, customer callbacks, and sales-stage notifications."],
  ["CRM automation", "Automate lead assignment, pipeline movement, lost reason capture, customer updates, source reporting, sales tasks, and daily team review."],
  ["ERP automation", "Trigger task queues, approval paths, booking or order updates, supplier actions, invoice status, payment reminders, and operations reports."],
  ["WhatsApp and email workflows", "Send structured customer updates, document requests, payment reminders, booking notes, service status, and internal team alerts."],
  ["Document request automation", "Request, track, and remind for customer documents, project files, invoice copies, booking records, approvals, and support attachments."],
  ["Dashboard automation", "Prepare pipeline, workload, revenue, source, payment, turnaround, support, and exception dashboards for management review."],
  ["Portal and support automation", "Connect customer portals, support desks, status views, ticket routing, file access, notifications, and service handoffs."]
];

const automationIndustries = [
  ["Travel and tourism", "Lead routing, quotation follow-ups, itinerary notes, document requests, payment reminders, booking status, supplier tasks, and travel dashboards."],
  ["Service businesses", "Enquiry assignment, quotation reminders, service status, task routing, customer updates, support handoffs, and management reports."],
  ["Retail and e-commerce", "Order status, payment reminders, customer notifications, distributor leads, inventory alerts, support tickets, and campaign reports."],
  ["Food and packaged products", "Bulk enquiry routing, distributor follow-ups, product interest reports, stock direction, dispatch updates, and sales dashboards."],
  ["Consulting and professional services", "Client onboarding, proposal reminders, document requests, project status, invoice tracking, and client portal notifications."],
  ["Multi-office groups", "Branch-wise lead routing, team ownership, approval paths, role-based notifications, office-level dashboards, and shared management reporting."]
];

const automationFaqs = [
  ["What is business automation?", "Business automation uses workflows, reminders, routing, notifications, dashboards, and system rules to reduce repeated manual work across sales, operations, finance, support, and reporting."],
  ["Does BANDEVI GLOBAL GROUP build business automation systems?", "Yes. BANDEVI builds automation for lead routing, follow-ups, CRM, ERP, WhatsApp and email notifications, document requests, task queues, approvals, portals, and dashboards."],
  ["Can automation connect with CRM and ERP?", "Yes. Automation can connect with CRM and ERP workflows for lead assignment, pipeline updates, tasks, approvals, invoices, payments, documents, reporting, and team notifications."],
  ["Can BANDEVI automate WhatsApp and customer communication?", "Yes. BANDEVI can plan WhatsApp and communication workflows for enquiries, follow-ups, document requests, service status, payment reminders, booking notes, and support updates."],
  ["Which businesses can use automation?", "Travel companies, service businesses, e-commerce brands, food-product brands, consulting teams, multi-office groups, and internal operations teams can use automation to reduce missed work and improve visibility."],
  ["Where can visitors verify BANDEVI before starting automation work?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const officeVerificationFaqs = [
  ["Where are BANDEVI GLOBAL GROUP offices listed?", "The website lists office and service-location references for Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, Lucknow, Dubai, London, and the United States."],
  ["Which BANDEVI office should a customer contact first?", "Customers should use the official sales desk, phone, WhatsApp, or email first. The right office or support route can then be confirmed according to project scope."],
  ["Are the office locations used for project delivery?", "Office and service-location references help visitors understand BANDEVI's wider operating presence. Project delivery, support ownership, and local coordination are confirmed separately for each engagement."],
  ["What office proof can be added next?", "The strongest next office proof would be location photos, Google Business Profile links, map links, lease or service-office confirmations, and location-specific contact proof."]
];

const travelTrustNetworks = [
  ["MoT", "Ministry of Tourism, Government of India travel ecosystem"],
  ["IATA", "International airline and ticketing association"],
  ["OTOAI", "Outbound Tour Operators Association of India"],
  ["TAFI", "Travel Agents Federation of India"],
  ["ASTA", "American Society of Travel Advisors"],
  ["JATA", "Japan Association of Travel Agents"],
  ["PATA", "Pacific Asia Travel Association"],
  ["TBO", "B2B hotel and travel supplier platform"],
  ["IAAI", "IATA Agents Association of India"],
  ["ETAA", "Enterprising Travel Agents Association"],
  ["TAAI", "Travel Agents Association of India"],
  ["ISO", "Quality-focused service-practice standards"]
];

const trustVerificationCards = [
  {
    status: "Official channel",
    title: "Domain, email, phone, and social proof",
    text: "Clients can verify BANDEVI through the official domain, sales email, phone/WhatsApp desk, connected social profiles, and the brand names BANDEVI GLOBAL GROUP, Bandevi Global Group, Bandevi Global, and Bandevi."
  },
  {
    status: "Project control",
    title: "Separate project handling",
    text: "BANDEVI keeps sister-company projects, external client projects, domains, content, forms, logins, and deployment paths separately planned and managed."
  },
  {
    status: "Documented scope",
    title: "Proposal and milestone records",
    text: "Project work can be supported with scope notes, module lists, timeline direction, payment milestones, change requests, and delivery acceptance records."
  },
  {
    status: "Access safety",
    title: "Controlled handover",
    text: "Website, CRM, ERP, portal, hosting, email, analytics, and admin access can be listed clearly during launch so ownership is not confusing."
  },
  {
    status: "Support readiness",
    title: "Post-launch support desk",
    text: "Clients can route support through phone, WhatsApp, email, demo request, contact form, and portal paths depending on the project stage."
  },
  {
    status: "Sister-brand reference",
    title: "THG operating exposure",
    text: "The Holidays Group remains a separate travel brand. Its public travel-network profile gives BANDEVI practical operating context for trust-heavy systems."
  }
];

const trustDocumentChecklist = [
  ["Company identity pack", "Company profile, official contact channels, office/service-location list, sister-brand separation note, and project ownership summary."],
  ["Commercial records", "Proposal, scope sheet, quotation, invoice, payment milestone plan, change-request notes, and delivery confirmation."],
  ["Project blueprint", "Page plan, module list, CRM/ERP fields, portal roles, automation rules, reporting needs, and first-release roadmap."],
  ["Access handover", "Domain, hosting, repository, admin, analytics, email, payment gateway, WhatsApp, and third-party account ownership checklist."],
  ["Support and improvement log", "Bug fixes, training notes, future modules, content updates, support requests, and post-launch improvement priorities."],
  ["Sister-brand reference note", "THG travel licences, memberships, supplier networks, and office references are presented as sister-brand context, not BANDEVI licence claims."]
];

const productPackages = [
  {
    icon: "globe",
    tag: "Website",
    title: "Starter Website Package",
    bestFor: "New companies, service brands, personal brands, and local businesses that need a polished first website.",
    includes: ["Home, about, services, contact, and enquiry sections", "Responsive design for mobile and desktop", "WhatsApp, call, email, and social links", "Basic SEO page structure and analytics readiness"],
    addOns: ["Blog setup", "Extra service pages", "CRM handoff", "Logo or brand polish"],
    timeline: "Typical starting timeline: 7-14 working days.",
    link: "/website-mobile-app-development/"
  },
  {
    icon: "users",
    tag: "Website + CRM",
    title: "Business Website + CRM Package",
    bestFor: "Growing service teams that want a better website plus structured lead capture and follow-up control.",
    includes: ["Premium business website pages", "Lead and enquiry form structure", "CRM-ready customer fields", "Follow-up stages and source tracking"],
    addOns: ["Quotation workflow", "WhatsApp routing", "Sales dashboard", "Email automation"],
    timeline: "Typical starting timeline: 2-4 weeks.",
    link: "/crm-erp-solutions/"
  },
  {
    icon: "plane",
    tag: "Travel website",
    title: "Travel Website Package",
    bestFor: "Travel agencies, tour operators, DMCs, and travel sellers that need a complete travel website.",
    includes: ["Destination and package pages", "Itinerary, inclusions, exclusions, and FAQ structure", "Enquiry and WhatsApp capture", "Blog and SEO content paths"],
    addOns: ["Travel CRM", "Customer portal", "Booking workflow", "Payment gateway"],
    timeline: "Typical starting timeline: 2-4 weeks.",
    link: "/travel-website-development/"
  },
  {
    icon: "shield",
    tag: "White-label",
    title: "White-label Travel Website Package",
    bestFor: "Travel groups, partner networks, branches, resellers, and franchise-style travel sellers.",
    includes: ["Reusable travel website structure", "Partner or branch branding areas", "Controlled package and service templates", "Separate lead capture and source tracking"],
    addOns: ["Partner portal", "CRM routing", "Multi-brand content setup", "Reporting dashboard"],
    timeline: "Typical starting timeline: 3-6 weeks.",
    link: "/travel-website-development/"
  },
  {
    icon: "stack",
    tag: "CRM + ERP",
    title: "CRM + ERP Package",
    bestFor: "Teams that need to connect sales, operations, finance, documents, approvals, and management reporting.",
    includes: ["Lead pipeline and customer records", "Booking, order, or service workflow", "Invoices, payments, documents, and approvals", "Management dashboard planning"],
    addOns: ["Supplier hub", "Customer portal", "Automation", "Advanced analytics"],
    timeline: "Typical starting timeline: 4-8 weeks.",
    link: "/crm-erp-solutions/"
  },
  {
    icon: "globe",
    tag: "Portal",
    title: "Customer Portal Package",
    bestFor: "Companies that want customers, partners, or clients to view documents, invoices, status, and support history.",
    includes: ["Customer login concept", "Document and invoice access", "Support request structure", "Project, booking, order, or service status views"],
    addOns: ["Payment status", "Notifications", "Partner access", "Advanced permissions"],
    timeline: "Typical starting timeline: 3-6 weeks.",
    link: "/customer-portal/"
  },
  {
    icon: "shield",
    tag: "Commerce",
    title: "Masala / Makhana E-Commerce Package",
    bestFor: "Masala, makhana, packaged food, and product brands that need catalog, enquiry, and commerce readiness.",
    includes: ["Product catalog and category pages", "Bulk enquiry and distributor lead capture", "Cart or payment roadmap", "Order and customer communication planning"],
    addOns: ["Inventory view", "Distributor CRM", "Offers and coupons", "Delivery workflow"],
    timeline: "Typical starting timeline: 2-5 weeks.",
    link: "/ecommerce-solutions/"
  },
  {
    icon: "message",
    tag: "Astrology",
    title: "Astrology Booking Platform Package",
    bestFor: "Astrology and consultation brands that need services, booking requests, payments, CRM, and customer records.",
    includes: ["Astrology service pages", "Consultation booking request flow", "WhatsApp and form capture", "Customer CRM and report-delivery planning"],
    addOns: ["Payment gateway", "Calendar workflow", "Customer portal", "Automated reminders"],
    timeline: "Typical starting timeline: 2-5 weeks.",
    link: "/astrology-services-platform/"
  },
  {
    icon: "chart",
    tag: "Automation",
    title: "Automation Package",
    bestFor: "Teams losing time on repeated follow-ups, document requests, internal handoffs, reminders, and reports.",
    includes: ["Lead routing and assignment rules", "Follow-up and task reminders", "Document request triggers", "Status notifications and report summaries"],
    addOns: ["WhatsApp workflow", "CRM/ERP connection", "Dashboard automation", "Support desk routing"],
    timeline: "Typical starting timeline: 1-3 weeks.",
    link: "/business-automation/"
  }
];

const itProductFaqs = [
  ["What IT products does BANDEVI GLOBAL GROUP provide?", "BANDEVI GLOBAL GROUP provides website packages, CRM, ERP, customer portals, travel CRM, travel ERP, lead and booking management, e-commerce systems, automation, dashboards, and business software packages."],
  ["Can BANDEVI software products connect together?", "Yes. A website can capture leads into CRM, confirmed work can move into ERP, customers can use a portal, and automation can connect follow-ups, approvals, reminders, documents, invoices, payments, and dashboards."],
  ["Which IT product package should a business start with?", "Start with a website package for trust, CRM for lead control, CRM plus ERP for sales-to-operations control, a portal for customer access, and automation when repeated manual work needs to be reduced."],
  ["Does BANDEVI build travel technology products?", "Yes. BANDEVI builds travel websites, white-label travel websites, Travel CRM, Travel ERP, lead and booking management, customer portals, supplier workflows, payment tracking, and travel dashboards."],
  ["Can BANDEVI support multi-office and global teams?", "Yes. BANDEVI product planning can include branch ownership, role-based access, office-level reporting, staff queues, escalation paths, and shared management dashboards across locations."],
  ["Where can visitors verify BANDEVI before requesting a demo?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const demoRequestFaqs = [
  ["Can I request a CRM or ERP demo?", "Yes. Use the demo form to request a CRM, ERP, CRM plus ERP, dashboard, portal, automation, or complete business software walkthrough."],
  ["Can the demo cover Travel CRM and Travel ERP?", "Yes. The demo can focus on Travel CRM, Travel ERP, travel websites, lead and booking management, supplier workflows, customer documents, payments, and reporting."],
  ["What should I share in the demo request?", "Share the product needed, business type, team or branch scale, main priority, timeline, budget direction, current website or reference, and the problem you want to solve first."],
  ["Can BANDEVI suggest the right product package?", "Yes. If you are not sure which package fits, choose Product Package Consultation or Not sure yet. BANDEVI can map the right first release around your workflow."],
  ["Where can I verify BANDEVI before requesting a demo?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."],
  ["What happens after submitting a demo request?", "The request is routed with your product interest, business type, priority, timeline, budget direction, and contact preference so the sales team can respond with a focused next step."]
];

const contactFaqs = [
  ["How can I contact BANDEVI GLOBAL GROUP?", `Use the official phone or WhatsApp ${contactInfo.phoneDisplay}, email ${contactInfo.email}, the Contact Us page, or the Demo Request page on bandeviglobalgroup.com.`],
  ["Can I contact BANDEVI for CRM and ERP projects?", "Yes. Contact BANDEVI for CRM development, ERP software, lead management, sales pipeline, operations workflows, finance, dashboards, portals, automation, and business software."],
  ["Can I contact BANDEVI for Travel CRM or Travel ERP?", "Yes. BANDEVI supports Travel CRM, Travel ERP, travel websites, lead and booking management, supplier workflows, customer documents, payments, and travel reporting discussions."],
  ["Which office should I contact first?", "Use the official sales desk first by phone, WhatsApp, email, contact form, or demo request. The correct office or support route can then be confirmed according to project scope."],
  ["Where can visitors verify BANDEVI before contacting?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."],
  ["What details should I include in a contact message?", "Share your product interest, business type, current problem, location or region, timeline, preferred contact method, and whether you need CRM, ERP, portals, travel technology, websites, e-commerce, automation, or support."]
];

const homeFaqs = [
  ["What is BANDEVI GLOBAL GROUP?", "BANDEVI GLOBAL GROUP is an IT and software development company for websites, CRM, ERP, customer portals, e-commerce, travel technology, automation, dashboards, and business software."],
  ["What is BANDEVI GLOBAL GROUP staff size?", "The current company-provided staff count is 1,289 staff worldwide across the operating, sales, support, partnership, technology, and business development ecosystem."],
  ["What is BANDEVI GLOBAL GROUP net worth?", "The current company-provided net worth and group strength figure is INR 7,594 Cr. Supporting CA, audited, valuation, or company-profile proof can be linked when public."],
  ["Where are BANDEVI GLOBAL GROUP offices listed?", "The website lists office and service-location references for Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, Lucknow, Dubai, London, and the United States."],
  ["What IT products does BANDEVI provide?", "BANDEVI provides website packages, CRM, ERP, customer portals, e-commerce systems, Travel CRM, Travel ERP, lead and booking management, automation, dashboards, and software package planning."],
  ["Where can visitors verify BANDEVI before contacting?", "Visitors can verify BANDEVI through the Company Profile, Proof & Verification page, Staff Size & Net Worth page, Offices page, company profile PDF, official phone, email, and bandeviglobalgroup.com."]
];

const productImage = asset("travel-platform-dashboard.png");
const heroImage = asset("travel-operations-hero.png");
const companyProfilePdf = asset("bandevi-global-group-company-profile.pdf");
const proofSupportPackPdf = asset("bandevi-global-group-public-proof-support-pack.pdf");
const officialFactsJson = asset("bandevi-global-group-official-facts.json");
const proofIndexJson = asset("bandevi-global-group-proof-index.json");
const llmsTxt = "/llms.txt";

const proofSupportFiles = [
  ["Staff Confirmation Note", asset("bandevi-global-group-staff-confirmation-note.txt"), "Company-published public note for 1,289 staff worldwide and staff-size wording consistency."],
  ["Net Worth & Group Strength Note", asset("bandevi-global-group-net-worth-group-strength-note.txt"), "Company-published public note for INR 7,594 Cr net worth and group-strength wording consistency."],
  ["Office Verification Sheet", asset("bandevi-global-group-office-verification-sheet.txt"), "Address-level office and service-location sheet for Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, Lucknow, Dubai, London, and United States references."],
  ["Chairman & Company Identity Note", asset("bandevi-global-group-chairman-company-identity-note.txt"), "Public identity note for BANDEVI GLOBAL GROUP, Chairman Mr Surya Kant Jha, official contact details, and company category consistency."],
  ["Official Facts JSON", officialFactsJson, "Machine-readable official facts for staff size, net worth, offices, chairman, contact, services, proof URLs, and structured search consistency."],
  ["Proof Index JSON", proofIndexJson, "Machine-readable catalog of all public proof files, official facts, PDFs, citation tracker, and submission status references."],
  ["Google Indexing Status", asset("bandevi-global-group-google-indexing-status.txt"), "Public Search Console status note for sitemap success, confirmed indexing requests, and next priority URL Inspection follow-up."],
  ["LLMs Text Summary", llmsTxt, "Crawler-friendly official facts file for AI assistants and search systems to identify the correct BANDEVI staff, net worth, office, and proof facts."],
  ["Public Proof Support Pack PDF", proofSupportPackPdf, "Combined downloadable proof-support pack covering chairman identity, staff size, net worth, office references, and next formal evidence."]
];

const citationTrackerCsv = asset("bandevi-global-group-external-citation-tracker.csv");
const directorySubmissionCopy = asset("bandevi-global-group-directory-submission-copy.txt");
const externalSubmissionStatus = asset("bandevi-global-group-external-submission-status.txt");
const googleBusinessProfileStatus = asset("bandevi-global-group-google-business-profile-status.txt");
const bingPlacesSubmissionPack = asset("bandevi-global-group-bing-places-submission-pack.txt");

const externalCitationTargets = [
  ["Google Search Console", "Search indexing", "https://search.google.com/search-console", "Sitemap clean; 52 pages discovered; priority indexing in progress", "URL Inspection, sitemap, priority crawl"],
  ["Google Business Profile", "Search and maps", "https://business.google.com/us/business-profile/", "100% verified in manager; processing review", "Software company, website designer, IT services"],
  ["Bing Places for Business", "Search and maps", "https://www.bing.com/forbusiness", "Submission pack ready; Microsoft verification pending", "Software company, IT services, website designer"],
  ["Clutch", "B2B services directory", "https://clutch.co/get-listed", "Submission reported complete; monitor review", "Custom software development, web development, CRM, ERP"],
  ["The Manifest", "B2B shortlist directory", "https://themanifest.com/get-listed", "Ready after Clutch profile", "Software development, web development, IT services"],
  ["GoodFirms", "B2B reviews and software directory", "https://www.goodfirms.co/get-listed", "Submission reported complete; monitor review", "Software development, web development, CRM, ERP"],
  ["TechBehemoths", "IT company directory", "https://techbehemoths.com/", "Submitted; manual review pending", "Custom software development, web development, CRM, ERP"],
  ["Sortlist", "Agency and service-provider directory", "https://www.sortlist.com/providers", "Existing profile claimed; access request submitted", "Web Application, web development, CRM, ERP"],
  ["DesignRush", "Agency and B2B marketplace", "https://www.designrush.com/", "Ready for account submission", "Software development, app development, web design, technology services"],
  ["LinkedIn", "Professional profile", "https://www.linkedin.com/in/bandevi-global-group-38584b419/", "Profile updated; monitor public cache", "IT services and IT consulting, software development"],
  ["Facebook", "Social profile", "https://www.facebook.com/profile.php?id=61591222415314", "Bio updated; category follow-up pending", "Software company, information technology company"],
  ["Instagram", "Social profile", "https://www.instagram.com/bandeviglobalgroup/", "Bio updated; mobile link edit pending", "Software company, IT services"],
  ["X", "Social profile", "https://x.com/BANDEVIGLOBAL", "Blocked; X did not expose editor", "IT company, software development"]
];

const pageData = {
  home: {
    title: "BANDEVI GLOBAL GROUP",
    eyebrow: "IT products, CRM, ERP, proof, offices",
    lede: "BANDEVI GLOBAL GROUP builds IT products, websites, CRM, ERP, portals, e-commerce, travel technology, automation, and business software with published company-provided strength of 1,289 staff worldwide, INR 7,594 Cr net worth, and 10 listed office references.",
    home: true
  },
  about: {
    title: "About BANDEVI GLOBAL GROUP",
    eyebrow: "Company",
    lede: "Bandevi Global Group, also searched as Bandevi Global and Bandevi, is an IT and software development company building premium websites, CRM, ERP, portals, automation, and business systems."
  },
  profile: {
    title: "Company Profile, Staff Size & Offices",
    eyebrow: "Company facts",
    lede: "Priority company profile for BANDEVI GLOBAL GROUP covering common search names, staff ecosystem, group strength context, official contacts, and all listed offices."
  },
  proof: {
    title: "Proof & Verification",
    eyebrow: "Public proof page",
    lede: "Priority verification page for BANDEVI GLOBAL GROUP staff size, net worth, office locations, official contacts, and proof documents."
  },
  directoryProfile: {
    title: "Directory Listing Profile",
    eyebrow: "Directory and AI citation pack",
    lede: "Directory-ready BANDEVI GLOBAL GROUP profile for business listings, AI citations, staff size, net worth, offices, proof links, official phone, email, website, CRM, ERP, IT products, and software development services."
  },
  externalCitations: {
    title: "External Citation Tracker",
    eyebrow: "Directory submission tracker",
    lede: "Priority external citation tracker for BANDEVI GLOBAL GROUP directory submissions, social profile updates, map listings, proof links, staff size, net worth, offices, and chairman identity consistency."
  },
  staffWorth: {
    title: "Staff Size & Net Worth",
    eyebrow: "Company strength",
    lede: "Dedicated BANDEVI GLOBAL GROUP staff size and net worth page covering 1,289 staff worldwide, INR 7,594 Cr group strength, offices, and proof links."
  },
  itCompanyServices: {
    title: "IT Company & Software Development Services",
    eyebrow: "Commercial services",
    lede: "BANDEVI GLOBAL GROUP IT company and software development services for websites, CRM, ERP, portals, e-commerce, automation, travel technology, and business software."
  },
  offices: {
    title: "Offices & Locations",
    eyebrow: "Office network",
    lede: "BANDEVI GLOBAL GROUP office and service-location references across Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, Lucknow, Dubai, London, and the United States."
  },
  trust: {
    title: "Trust, Licences & Certifications",
    eyebrow: "Trust center",
    lede: "A clearer trust center for BANDEVI's IT delivery: official channels, project separation, documentation, office presence, support readiness, and sister-brand references without mixing company claims."
  },
  crm: {
    title: "Travel CRM Software",
    eyebrow: "Travel lead, quotation, and follow-up control",
    lede: "BANDEVI GLOBAL GROUP builds Travel CRM software for travel agencies, tour operators, DMCs, corporate desks, WhatsApp leads, quotations, follow-ups, customer records, booking handoff, and sales dashboards."
  },
  erp: {
    title: "Travel ERP Software",
    eyebrow: "Booking, supplier, finance, and operations control",
    lede: "BANDEVI GLOBAL GROUP builds Travel ERP software for tour operators, travel agencies, DMCs, booking files, suppliers, invoices, payments, documents, approvals, margins, and operations reporting."
  },
  products: {
    title: "Products",
    eyebrow: "Platform suite",
    lede: "Modular software products that can launch together or phase in across sales, operations, finance, commerce, bookings, service, and customer self-service."
  },
  itProducts: {
    title: "IT Products & Software Solutions",
    eyebrow: "Software products",
    lede: "Clear product and service packages for websites, CRM, ERP, customer portals, travel websites, white-label websites, e-commerce, astrology booking, automation, and business dashboards."
  },
  crmErp: {
    title: "CRM & ERP Development Company",
    eyebrow: "CRM and ERP software",
    lede: "BANDEVI GLOBAL GROUP builds CRM and ERP software for lead management, sales pipelines, operations, finance, dashboards, automation, travel CRM, travel ERP, and business workflows."
  },
  ecommerce: {
    title: "E-Commerce Website Development Company",
    eyebrow: "E-commerce development",
    lede: "BANDEVI GLOBAL GROUP builds e-commerce websites, online stores, product catalogues, cart and checkout flows, payment workflows, order management, inventory direction, CRM, dashboards, and campaigns."
  },
  webApp: {
    title: "Website & Mobile App Development Company",
    eyebrow: "Website and app development",
    lede: "BANDEVI GLOBAL GROUP builds corporate websites, business websites, landing pages, web apps, mobile apps, portals, dashboards, travel websites, and SEO-ready digital systems."
  },
  automation: {
    title: "Business Automation Company",
    eyebrow: "Workflow automation services",
    lede: "BANDEVI GLOBAL GROUP builds business automation for lead routing, follow-ups, CRM automation, ERP automation, WhatsApp workflows, document requests, task queues, dashboards, and reporting."
  },
  masala: {
    title: "Masala & Food Product IT Solutions",
    eyebrow: "Food brand technology",
    lede: "Websites, e-commerce, CRM, inventory, order management, distributor inquiry flows, and automation for masala and food-product brands."
  },
  makhana: {
    title: "Makhana Brand Digital Solutions",
    eyebrow: "Makhana brand systems",
    lede: "Premium websites, online stores, product catalogs, bulk inquiry flows, payments, CRM, and operational dashboards for makhana brands."
  },
  astrology: {
    title: "Astrology Services Digital Platform",
    eyebrow: "Astrology service systems",
    lede: "Astrology websites, consultation booking, payment flows, WhatsApp lead capture, CRM, customer portals, and service automation."
  },
  travelWebsite: {
    title: "Travel Website Development Company",
    eyebrow: "Complete and white-label travel websites",
    lede: "BANDEVI GLOBAL GROUP builds complete travel websites and white-label travel websites for agencies, DMCs, tour operators, corporate travel desks, partners, branches, resellers, and travel technology brands."
  },
  travelTech: {
    title: "Travel Technology Company",
    eyebrow: "Travel CRM, ERP, and websites",
    lede: "BANDEVI GLOBAL GROUP builds travel technology for complete travel websites, white-label travel websites, Travel CRM, Travel ERP, booking workflows, supplier coordination, customer portals, automation, and dashboards."
  },
  leadBooking: {
    title: "Lead & Booking Management Software",
    eyebrow: "Travel sales to booking control",
    lede: "BANDEVI GLOBAL GROUP builds lead and booking management software for travel enquiries, WhatsApp leads, quotation follow-ups, booking files, documents, payments, dashboards, and CRM/ERP handoff."
  },
  it: {
    title: "IT Solutions",
    eyebrow: "Digital delivery",
    lede: "Web, cloud, integrations, automation, and managed development services for product, service, commerce, astrology, and travel-led businesses."
  },
  cases: {
    title: "Case Studies",
    eyebrow: "Business outcomes",
    lede: "Representative project stories across travel websites, white-label websites, CRM, ERP, portals, e-commerce, automation, masala, makhana, astrology, and digital operations."
  },
  blog: {
    title: "Blog",
    eyebrow: "Insights",
    lede: "Practical thinking on CRM, ERP, portals, automation, e-commerce, digital customer experience, and growth operations."
  },
  support: {
    title: "Support",
    eyebrow: "Client care",
    lede: "Structured support options for implementation, training, enhancements, uptime monitoring, and long-term platform improvement."
  },
  contact: {
    title: "Contact",
    eyebrow: "Start a conversation",
    lede: "Contact BANDEVI GLOBAL GROUP through official phone, WhatsApp, email, demo request, or office support for CRM, ERP, IT products, portals, travel technology, websites, e-commerce, automation, and proof verification."
  },
  demo: {
    title: "Demo Request",
    eyebrow: "See the platform",
    lede: "Request a package-matched demo for CRM, ERP, customer portals, IT products, travel technology, websites, e-commerce, automation, dashboards, and implementation planning."
  },
  portal: {
    title: "Customer Portal Software",
    eyebrow: "Customer access, documents, invoices, support",
    lede: "BANDEVI GLOBAL GROUP builds customer portal software for booking status, documents, invoices, payments, support requests, project milestones, CRM/ERP connection, and controlled customer access."
  },
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Data and trust",
    lede: "How BANDEVI GLOBAL GROUP handles website inquiries, demo requests, contact details, support messages, and project communication data."
  },
  terms: {
    title: "Terms & Conditions",
    eyebrow: "Website terms",
    lede: "General terms for using the BANDEVI GLOBAL GROUP website, requesting demos, discussing projects, and reading service information."
  }
};

function activePage() {
  return document.body.dataset.page || "home";
}

function header(page) {
  const links = navItems.map(([label, href, key]) => (
    `<a class="nav-link ${key === page ? "is-active" : ""}" href="${href}">${label}</a>`
  )).join("");

  return `
    <header class="topbar">
      <div class="nav-wrap">
        <a class="brand" href="/" aria-label="BANDEVI GLOBAL GROUP home">
          <span class="brand-mark">BG</span>
          <span class="brand-copy">
            <span class="brand-name">BANDEVI GLOBAL GROUP</span>
            <span class="brand-line">IT & software development company</span>
          </span>
        </a>
        <nav class="primary-nav" aria-label="Primary navigation">
          ${links}
          <div class="mobile-nav-extra">
            <a class="nav-link ${page === "crmErp" ? "is-active" : ""}" href="/crm-erp-solutions/">CRM & ERP</a>
            <a class="nav-link ${page === "automation" ? "is-active" : ""}" href="/business-automation/">Automation</a>
            <a class="nav-link ${page === "cases" ? "is-active" : ""}" href="/case-studies/">Case Studies</a>
            <a class="nav-link ${page === "support" ? "is-active" : ""}" href="/support/">Support</a>
            <a class="nav-link ${page === "portal" ? "is-active" : ""}" href="/customer-portal/">Customer Portal</a>
            <a class="nav-link ${page === "demo" ? "is-active" : ""}" href="/demo-request/">Demo Request</a>
          </div>
        </nav>
        <div class="nav-actions">
          <a class="button secondary" href="${contactInfo.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ${icons.message}</a>
          <a class="button primary" href="/demo-request/">Demo ${icons.arrow}</a>
          <button class="icon-button" type="button" aria-label="Open menu" data-nav-toggle>${icons.menu}</button>
        </div>
      </div>
    </header>
  `;
}

function hero(page, data) {
  const actions = data.home ? `
    <div class="hero-actions">
      <a class="button primary" href="/demo-request/">Request Demo ${icons.arrow}</a>
      <a class="button secondary" href="/it-products/">Explore Products ${icons.stack}</a>
    </div>
  ` : `
    <div class="hero-actions">
      <a class="button primary" href="/demo-request/">Book a Demo ${icons.arrow}</a>
      <a class="button secondary" href="${contactInfo.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ${icons.message}</a>
    </div>
  `;

  const meta = data.home ? `
    <div class="hero-meta" aria-label="Company capabilities">
      <div class="hero-meta-item"><span class="hero-meta-value">CRM</span><span class="hero-meta-label">Lead, quote, follow-up, and customer lifecycle control</span></div>
      <div class="hero-meta-item"><span class="hero-meta-value">ERP</span><span class="hero-meta-label">Booking, supplier, finance, and operations management</span></div>
      <div class="hero-meta-item"><span class="hero-meta-value">Portal</span><span class="hero-meta-label">Client self-service with documents, tickets, and invoices</span></div>
    </div>
  ` : "";

  return `
    <section class="hero ${data.home ? "home-hero" : "media-hero"}" style="--hero-image: url('${heroImage}')">
      <div class="hero-inner">
        <div class="hero-content">
          <span class="eyebrow">${data.eyebrow}</span>
          <h1>${data.title}</h1>
          <p class="hero-lede">${data.lede}</p>
          ${actions}
        </div>
      </div>
      ${meta}
    </section>
  `;
}

function iconTile(name) {
  return `<div class="icon-tile">${icons[name] || icons.stack}</div>`;
}

function cards(items, cols = 3) {
  return `<div class="grid cols-${cols}">${items.map((item) => `
    <article class="card">
      ${iconTile(item.icon || "stack")}
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join("")}</div>`;
}

function list(items) {
  return `<ul class="feature-list">${items.map((item) => `<li><span class="check">&#10003;</span><span>${item}</span></li>`).join("")}</ul>`;
}

function optionList(items) {
  return items.map((item) => `<option>${item}</option>`).join("");
}

function cta(title = "Ready to modernize your business systems?", text = "Build the website, CRM, ERP, customer portal, and automation around one clear growth story.") {
  return `
    <section class="cta-band">
      <div class="cta-inner">
        <div>
          <h2>${title}</h2>
          <p>${text}</p>
        </div>
        <a class="button primary" href="/demo-request/">Request Demo ${icons.arrow}</a>
      </div>
    </section>
  `;
}

function industryPreview() {
  const industries = [
    {
      icon: "plane",
      title: "Travel website development",
      text: "Launch complete travel websites and white-label travel websites with package pages, destination content, enquiries, WhatsApp handoff, and CRM-ready lead flow.",
      href: "/travel-website-development/"
    },
    {
      icon: "shield",
      title: "Masala and food products",
      text: "Build a premium product website, online store, catalog, order flow, stock visibility, CRM, and distributor inquiry system.",
      href: "/masala-food-products/"
    },
    {
      icon: "stack",
      title: "Makhana brands",
      text: "Create product pages, bulk inquiry capture, online payments, customer follow-up, inventory views, and management dashboards.",
      href: "/makhana-brand-solutions/"
    },
    {
      icon: "globe",
      title: "Astrology services",
      text: "Launch consultation booking, payment collection, WhatsApp leads, customer profiles, reports, and a clean client portal.",
      href: "/astrology-services-platform/"
    }
  ];

  return `
    <section class="section gold-band">
      <div class="container">
        <div class="section-head">
          <h2>Industries and services we build for.</h2>
          <p>BANDEVI GLOBAL GROUP keeps each business line separate while giving every brand the right website, CRM, ERP, portal, commerce, and automation layer.</p>
        </div>
        <div class="grid cols-4">
          ${industries.map((item) => `
            <a class="card industry-card" href="${item.href}">
              ${iconTile(item.icon)}
              <h3>${item.title}</h3>
              <p>${item.text}</p>
              <span>Explore ${icons.arrow}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function trustProofPreview() {
  return `
    <section class="section trust-strip">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Trust proof</span>
          <h2>What clients can check before starting with BANDEVI.</h2>
          <p>BANDEVI's trust story is built around visible contact channels, written scope, clean handover, project separation, and sister-brand operating exposure without confusing one company with another.</p>
        </div>
        <div class="proof-grid">
          ${trustVerificationCards.slice(0, 4).map((item) => `
            <article class="proof-card">
              <span class="status-label">${item.status}</span>
              <h3>${item.title}</h3>
              <p>${item.text}</p>
            </article>
          `).join("")}
        </div>
        <div class="inline-actions">
          <a class="button primary" href="/trust-licences-certifications/">Open Trust Center ${icons.arrow}</a>
          <a class="button ghost" href="/company-profile/">Company Profile</a>
        </div>
      </div>
    </section>
  `;
}

function brandIdentityPanel() {
  return `
    <section class="section tight">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Brand identity</span>
          <h2>One company, three common search names.</h2>
          <p>Customers may search for the company as Bandevi Global Group, Bandevi Global, Bandevi, or BANDEVI GLOBAL GROUP. These names refer to the same official BANDEVI technology and development brand at bandeviglobalgroup.com.</p>
        </div>
        <div class="grid cols-3">
          ${brandAliases.map((name) => `
            <article class="card metric-card">
              <strong>${name}</strong>
              <p>Official BANDEVI brand reference for website, CRM, ERP, portal, automation, e-commerce, and IT development enquiries.</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function companyProfilePreview() {
  return `
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Company facts</span>
          <h2>Priority profile signals: staff ecosystem, group strength, and offices.</h2>
          <p>This company-profile layer helps visitors and search engines understand BANDEVI GLOBAL GROUP, the common search names, the office network, and the careful separation between BANDEVI and sister-brand THG references.</p>
        </div>
        <div class="grid cols-3">
          <article class="card metric-card"><strong>1,289</strong><p>Company-provided current staff count across the worldwide operating and support ecosystem.</p></article>
          <article class="card metric-card"><strong>INR 7,594 Cr</strong><p>Company-provided current net worth and group strength figure for market-confidence context.</p></article>
          <article class="card metric-card"><strong>10 locations</strong><p>Listed office and service-location references across India, Dubai, London, and the United States.</p></article>
        </div>
        <div class="inline-actions">
          <a class="button primary" href="/company-profile/">Open Company Profile ${icons.arrow}</a>
          <a class="button ghost" href="/contact-us/">Verify Contact Details</a>
        </div>
      </div>
    </section>
  `;
}

function homePriorityProof() {
  const proofLinks = [
    { icon: "shield", title: "Proof & Verification", href: "/proof-verification/", text: "Verify company identity, official phone, email, staff size, net worth, offices, and public proof links." },
    { icon: "users", title: "Staff Size & Net Worth", href: "/staff-size-net-worth/", text: "Review 1,289 staff worldwide and INR 7,594 Cr company-provided net worth and group strength figure." },
    { icon: "globe", title: "Offices & Locations", href: "/offices/", text: "View Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, Lucknow, Dubai, London, and United States references." },
    { icon: "stack", title: "IT Products", href: "/it-products/", text: "Explore website, CRM, ERP, portal, e-commerce, travel technology, automation, and dashboard packages." },
    { icon: "chart", title: "CRM & ERP Solutions", href: "/crm-erp-solutions/", text: "Plan lead management, sales pipeline, operations, finance, approvals, reporting, portals, and multi-office dashboards." },
    { icon: "message", title: "Demo Request", href: "/demo-request/", text: "Request a walkthrough for CRM, ERP, IT products, portals, Travel CRM, Travel ERP, websites, and automation." }
  ];

  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Priority public proof</span>
          <h2>Staff size, net worth, offices, and IT products are now visible from the homepage.</h2>
          <p>The homepage connects BANDEVI's main company-strength signals with the pages visitors and search engines need next: proof, staff size, net worth, offices, CRM, ERP, IT products, and demo request.</p>
        </div>
        <div class="grid cols-3">
          ${proofLinks.map((item) => `
            <a class="card industry-card" href="${item.href}">
              ${iconTile(item.icon)}
              <h3>${item.title}</h3>
              <p>${item.text}</p>
              <span>Open page ${icons.arrow}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function homeFaqSection() {
  return `
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Homepage FAQ</span>
          <h2>Answers for BANDEVI GLOBAL GROUP, staff size, net worth, offices, CRM, ERP, and IT product searches.</h2>
          <p>These homepage answers help visitors quickly verify the company and choose the right product, proof, or contact path.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${homeFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Fast verification links</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "IT Products", "CRM & ERP Solutions"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/demo-request/">Request Demo</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function homePage() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>One premium digital ecosystem for websites, software, sales, operations, and customer experience.</h2>
          <p>BANDEVI GLOBAL GROUP helps businesses replace scattered tools with integrated systems that make teams faster, customers better informed, and leadership more confident.</p>
        </div>
        ${cards([
          { icon: "users", title: "Lead to loyalty", text: "Capture inquiries, assign owners, manage quotations, track follow-ups, and build repeat-customer relationships." },
          { icon: "stack", title: "Operations control", text: "Coordinate orders, bookings, inventory, services, documents, payments, schedules, and exceptions in one operational layer." },
          { icon: "chart", title: "Management visibility", text: "Give decision makers dashboards for conversion, revenue, stock, margin, workload, and customer service quality." }
        ])}
      </div>
    </section>
    ${brandIdentityPanel()}
    ${companyProfilePreview()}
    ${homePriorityProof()}
    <section class="section mist">
      <div class="container split">
        <div>
          <span class="eyebrow">Platform suite</span>
          <h2>Built for the real pace of growing business lines.</h2>
          <p class="muted">Every module is shaped around practical daily workflows: inquiry handling, order or booking control, product catalogs, service requests, supplier coordination, finance, customer communication, and repeat sales.</p>
          ${list(["Complete travel websites and white-label travel websites for agencies, DMCs, operators, and partners", "CRM for inquiries, quotations, follow-ups, campaigns, and customer profiles", "ERP for orders, bookings, suppliers, invoices, approvals, stock, and reporting", "Customer portals for documents, invoices, tickets, service status, and project milestones", "IT services for websites, integrations, automation, cloud, e-commerce, and security"])}
        </div>
        <div class="media-frame"><img src="${productImage}" alt="Premium travel software dashboard mockup"></div>
      </div>
    </section>
    ${industryPreview()}
    ${trustProofPreview()}
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <h2>Why choose BANDEVI GLOBAL GROUP.</h2>
          <p>Technology delivery shaped by real business needs: fast response, clear documentation, premium customer confidence, and long-term operational control.</p>
        </div>
        ${cards([
          { icon: "stack", title: "Multi-business understanding", text: "CRM, ERP, portal, e-commerce, and workflow systems are planned around how each business line sells, serves, delivers, and reports." },
          { icon: "shield", title: "Trust and documentation", text: "Projects focus on clean records, controlled handoffs, professional communication, and a polished digital presence." },
          { icon: "globe", title: "Sister-company clarity", text: "BANDEVI stays the IT and development company while sister brands such as THG and other business lines stay separate." },
          { icon: "chart", title: "Growth visibility", text: "Dashboards and lead paths help leadership understand enquiry sources, conversion quality, workload, service status, and next actions." }
        ], 4)}
        <div class="inline-actions">
          <a class="button primary" href="/trust-licences-certifications/">View Trust & Licences ${icons.arrow}</a>
          <a class="button ghost" href="/about-us/">About BANDEVI</a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">Growth architecture</span>
          <h2>From website visitor to confirmed customer.</h2>
        </div>
        <div class="process">
          ${["Attract", "Capture", "Convert", "Retain"].map((name, index) => `
            <div class="process-step">
              <span>0${index + 1}</span>
              <h3>${name}</h3>
              <p>${[
                "Premium corporate pages, product storytelling, blogs, and lead paths.",
                "Contact, demo, order, booking, and campaign forms routed into CRM queues.",
                "Quotation, proposal, approval, order, booking, and payment visibility.",
                "Portal access, support, campaigns, reviews, and repeat-business intelligence."
              ][index]}</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    ${casePreview()}
    ${blogPreview()}
    ${homeFaqSection()}
    ${cta()}
  `;
}

function aboutPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Who we are</span>
          <h2>A trusted IT and software development company for serious business growth.</h2>
          <p class="muted">The company is searched and referenced as Bandevi Global Group, Bandevi Global, Bandevi, and BANDEVI GLOBAL GROUP. The official website is bandeviglobalgroup.com.</p>
          <p class="muted">BANDEVI GLOBAL GROUP builds premium websites, CRM, ERP, customer portals, e-commerce platforms, automation, and business software for brands that need a stronger digital presence and cleaner operational control.</p>
          <p class="muted">Our advantage is practical operating exposure. BANDEVI remains the IT and development company, while sister brands such as The Holidays Group stay separate. That gives our systems a real-world view of trust, documentation, customer support, multi-location coordination, and long-term service quality.</p>
          ${list(["Premium website presence that builds confidence before the first enquiry", "CRM and ERP workflows that protect leads, orders, bookings, documents, finance, and follow-ups", "Customer portals, dashboards, and automation for professional service delivery", "Separate project structure for sister brands, outside clients, and new business lines", "Long-term improvement support after launch, not only one-time website delivery"])}
          <div class="inline-actions">
            <a class="button primary" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button ghost" href="/contact-us/">Contact Us</a>
          </div>
        </div>
        <div class="media-frame"><img src="${heroImage}" alt="Travel technology operations center"></div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Sister-brand trust signals that make our technology stronger.</h2>
          <p>The Holidays Group public profile gives BANDEVI a real operating reference for travel-grade systems, premium support, documentation discipline, and multi-location customer service.</p>
        </div>
        <div class="grid cols-4">
          ${sisterBrandTrustStats.map(([title, text]) => `<article class="card metric-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Client confidence</span>
          <h2>Trust should be visible before the first payment.</h2>
          <p>Before a project starts, BANDEVI can align the company identity, scope, timeline, access ownership, support path, and brand separation so the client knows exactly what is being built and who is responsible.</p>
        </div>
        <div class="proof-grid">
          ${trustVerificationCards.map((item) => `
            <article class="proof-card">
              <span class="status-label">${item.status}</span>
              <h3>${item.title}</h3>
              <p>${item.text}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    ${brandIdentityPanel()}
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <h2>Built around the systems a growing business actually needs.</h2>
          <p>Instead of treating design, software, and support as separate pieces, BANDEVI GLOBAL GROUP brings them into one practical digital growth stack.</p>
        </div>
        <div class="grid cols-4">
          ${[
            ["CRM", "Lead capture, follow-ups, quotation tracking, customer history, and sales visibility."],
            ["ERP", "Orders, bookings, suppliers, stock, operations, payments, approvals, and reporting control."],
            ["Portal", "Customer access for service status, documents, invoices, support requests, and updates."],
            ["Web", "Corporate websites, landing pages, product pages, and conversion-focused contact paths."]
          ].map(([title, text]) => `<article class="card metric-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Licences, memberships and travel-network references.</h2>
          <p>THG's public travel ecosystem references recognized tourism, airline, travel association, supplier, and quality networks. BANDEVI uses this sister-brand operating knowledge to build better travel websites, CRM, ERP, customer portals, and booking workflows while keeping each brand separate.</p>
        </div>
        <div class="grid cols-4">
          ${travelTrustNetworks.map(([title, text]) => `<article class="card metric-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
        </div>
        <div class="inline-actions">
          <a class="button dark" href="/trust-licences-certifications/">Trust & Licences ${icons.arrow}</a>
          <a class="button dark" href="/travel-website-development/">Travel Website Development ${icons.arrow}</a>
          <a class="button light" href="https://theholidaysgroup.com/about-us" target="_blank" rel="noopener noreferrer">THG Reference</a>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">What we build</span>
          <h2>Technology that feels premium outside and disciplined inside.</h2>
        </div>
        ${cards([
          { icon: "users", title: "CRM systems", text: "A sales workspace for enquiries, campaigns, owner assignment, follow-up reminders, proposals, and conversion reporting." },
          { icon: "stack", title: "ERP systems", text: "An operations backbone for orders, bookings, stock, suppliers, finance, approvals, documents, team workload, and management reports." },
          { icon: "globe", title: "Premium websites", text: "Company pages, product pages, travel websites, white-label websites, blogs, demo requests, and search-friendly lead generation." },
          { icon: "shield", title: "Portals and automation", text: "Customer portals, internal dashboards, WhatsApp handoffs, task routing, and repeatable workflows for service teams." }
        ], 4)}
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Trust-first delivery practices.</h2>
          <p>We build websites and software around the things customers notice most: clear promises, fast response, proper records, secure access, and reliable post-launch service.</p>
        </div>
        <div class="process">
          ${[
            ["Discover", "Understand services, users, lead sources, operations, reporting needs, trust gaps, and launch priorities."],
            ["Document", "Turn business requirements into clear pages, modules, workflows, roles, permissions, and handoff rules."],
            ["Build", "Create responsive pages, CRM/ERP workflows, portal experiences, integrations, and admin controls."],
            ["Support", "Refine content, train teams, review usage, improve conversion paths, and add new modules."]
          ].map((item, index) => `
            <div class="process-step">
              <span>0${index + 1}</span>
              <h3>${item[0]}</h3>
              <p>${item[1]}</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section dark">
      <div class="container split reverse">
        <div class="media-frame"><img src="${productImage}" alt="Travel CRM and ERP dashboard screens"></div>
        <div>
          <span class="eyebrow">Who we serve</span>
          <h2>For teams where trust, speed, and service quality directly affect revenue.</h2>
          <p class="muted">BANDEVI is built for organizations that need a stronger first impression, cleaner sales control, reliable operations, and a more professional customer experience.</p>
          ${list(["Group and sister-company technology projects", "Masala and food-product businesses that need e-commerce, CRM, stock, and order visibility", "Makhana brands that need product catalogs, commerce, distribution, and customer systems", "Astrology service brands that need websites, booking flows, consultation portals, CRM, and payments", "Travel, service, and corporate teams that need CRM, ERP, portals, websites, and automation"])}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Office and service-location confidence.</h2>
          <p>The shared business network gives clients a stronger support story across India, Dubai, London, and the United States while each project remains separately managed.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Location</th><th>Address</th></tr></thead>
            <tbody>
              ${officeLocations.map(([city, address]) => `<tr><td>${city}</td><td>${address}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">Operating principles</span>
          <h2>Clear systems, practical delivery, and long-term trust.</h2>
        </div>
        ${cards([
          { icon: "shield", title: "Trust by design", text: "Clear data flows, permissions, auditability, customer communication, and operational controls are treated as product essentials." },
          { icon: "chart", title: "Measurable outcomes", text: "Projects are mapped to response speed, conversion visibility, staff productivity, support quality, and customer satisfaction." },
          { icon: "users", title: "Team adoption", text: "Interfaces are designed for daily users so sales, support, operations, finance, and leadership can work with confidence." },
          { icon: "stack", title: "Separate project control", text: "Each brand, website, portal, CRM, ERP, and campaign can stay separate with its own access, content, workflows, and roadmap." }
        ], 4)}
      </div>
    </section>
    ${cta("Let your About page prove trust before the first call.", "Create a premium corporate presence backed by systems that can support sales, orders, service, delivery, documentation, and long-term support.")}
  `;
}

function companyProfilePage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Company profile</span>
          <h2>BANDEVI GLOBAL GROUP company profile, staff ecosystem, group strength, and offices.</h2>
          <p class="muted">This page is built as the priority reference for people searching BANDEVI GLOBAL GROUP, Bandevi Global Group, Bandevi Global, Bandevi, BANDEVI staff size, BANDEVI net worth, and BANDEVI office locations.</p>
          <p class="muted">BANDEVI GLOBAL GROUP is the IT and software development company. THG and other sister-brand references are used only where they provide operating context, team ecosystem context, or public trust signals.</p>
          ${list(["Official website: bandeviglobalgroup.com", "Official sales desk: +91 8287669022", "Official email: sales@bandeviglobalgroup.com", "Company facts presented with sister-brand separation where needed", "Office and service-location references listed clearly for verification"])}
          <div class="inline-actions">
            <a class="button primary" href="/contact-us/">Verify Contact ${icons.arrow}</a>
            <a class="button ghost" href="/it-company-software-development-services/">IT Services</a>
            <a class="button ghost" href="${companyProfilePdf}">Company Profile PDF</a>
            <a class="button ghost" href="/proof-verification/">Proof & Verification</a>
            <a class="button ghost" href="/directory-listing-profile/">Directory Profile</a>
            <a class="button ghost" href="${proofSupportPackPdf}">Proof Support Pack</a>
            <a class="button ghost" href="/staff-size-net-worth/">Staff & Net Worth</a>
            <a class="button ghost" href="/offices/">Offices</a>
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="BANDEVI company profile and office network"></div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Priority facts</span>
          <h2>Company facts Google and visitors should read first.</h2>
          <p>These details are worded carefully so public claims stay accurate while the company profile still answers high-intent searches for staff size, net worth, offices, and official identity.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Fact</th><th>Published detail</th></tr></thead>
            <tbody>
              ${companyProfileFacts.map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <h2>Staff size and group strength context.</h2>
          <p>BANDEVI keeps its company identity separate while using sister-brand operating exposure to show practical scale, service understanding, and delivery maturity.</p>
        </div>
        <div class="grid cols-4">
          ${sisterBrandTrustStats.map(([title, text]) => `<article class="card metric-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Offices</span>
          <h2>All listed office and service-location references.</h2>
          <p>Visitors can use these locations to understand the broader service-location story across India, Dubai, London, and the United States. Project ownership, support desk, and delivery scope are confirmed separately for every engagement.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Location</th><th>Address</th></tr></thead>
            <tbody>
              ${officeLocations.map(([city, address]) => `<tr><td>${city}</td><td>${address}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="inline-actions">
          <a class="button primary" href="/offices/">Open Offices Page ${icons.arrow}</a>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Search questions</span>
          <h2>Answers for net worth, staff size, offices, and brand separation.</h2>
          <p>These answers are written for clarity, customer confidence, and search visibility without overstating company-specific claims.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${companyProfileFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Official verification</h3>
            ${list(["Use bandeviglobalgroup.com as the official domain.", "Use sales@bandeviglobalgroup.com for company enquiries.", "Use +91 8287669022 for phone or WhatsApp contact.", "Use the company profile PDF and public proof support pack for staff size, net worth, offices, and proof notes.", "Use the Directory Listing Profile for external directory submissions."])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/it-company-software-development-services/">IT Services</a>
            <a class="button light" href="/staff-size-net-worth/">Staff & Net Worth</a>
            <a class="button light" href="/directory-listing-profile/">Directory Profile</a>
            <a class="button light" href="${companyProfilePdf}">Open PDF</a>
            <a class="button light" href="${proofSupportPackPdf}">Proof Support Pack</a>
          </aside>
        </div>
      </div>
    </section>
    ${cta("Keep company facts visible and verifiable.", "Contact BANDEVI GLOBAL GROUP to confirm project scope, office support, staff allocation, and official communication channels.")}
  `;
}

function directoryProfilePage() {
  const shortDescription = "BANDEVI GLOBAL GROUP is an IT and software development company building websites, CRM, ERP, customer portals, e-commerce systems, Travel CRM, Travel ERP, automation, dashboards, and business software.";
  const longDescription = "BANDEVI GLOBAL GROUP, chaired by Mr Surya Kant Jha, builds IT products and software systems for businesses that need stronger websites, clearer lead management, CRM, ERP, customer portals, e-commerce, travel technology, automation, dashboards, and operational control. The company publishes 1,289 staff worldwide, INR 7,594 Cr company-provided net worth and group strength, and 10 listed office and service-location references across India, Dubai, London, and the United States.";

  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Directory profile</span>
          <h2>Directory-ready BANDEVI GLOBAL GROUP listing for Google, AI tools, and business directories.</h2>
          <p class="muted">Use this page as the clean public citation source for directories, social profiles, business listings, AI search systems, and external company profiles.</p>
          ${list(["Official name: BANDEVI GLOBAL GROUP", "Chairman: Mr Surya Kant Jha", "Category: IT company, software development company, CRM and ERP development company", `Contact: ${contactInfo.phoneDisplay}, ${contactInfo.email}`, "Website: https://bandeviglobalgroup.com/", "Staff size: 1,289 staff worldwide", "Net worth and group strength: INR 7,594 Cr", "Offices: 10 listed office and service-location references"])}
          <div class="inline-actions">
            <a class="button primary" href="/proof-verification/">Verify Proof ${icons.arrow}</a>
            <a class="button ghost" href="${companyProfilePdf}">Company Profile PDF</a>
            <a class="button ghost" href="/external-citation-tracker/">Citation Tracker</a>
            <a class="button ghost" href="/contact-us/">Contact</a>
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="BANDEVI directory listing profile and proof summary"></div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Listing facts</span>
          <h2>Exact company details for directories.</h2>
          <p>Keep these details consistent everywhere so Google, Bing, AI answer engines, directories, and customers see the same BANDEVI profile.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Field</th><th>Use this public detail</th></tr></thead>
            <tbody>
              ${directoryListingFacts.map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Copy for directory forms</span>
          <h2>Short and long descriptions.</h2>
          <p>These descriptions can be reused for directory profiles, social profiles, business listings, and AI citation pages.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Short description</h3>
              <p>${shortDescription}</p>
            </article>
            <article class="article-block">
              <h3>Long description</h3>
              <p>${longDescription}</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Recommended directory categories</h3>
            ${list(["IT company", "Software development company", "CRM development company", "ERP software company", "Website development company", "Travel technology company", "Business automation company"])}
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof links</span>
          <h2>Links to include in directories and AI citations.</h2>
          <p>Use these official links anywhere a directory allows website, social, proof, PDF, or profile references.</p>
        </div>
        <div class="grid cols-3">
          ${[
            ["/company-profile/", "Company Profile", "Official company profile, staff ecosystem, net worth, offices, and contact details."],
            ["/proof-verification/", "Proof & Verification", "Staff size, net worth, offices, official contact, proof status, and document checklist."],
            ["/staff-size-net-worth/", "Staff Size & Net Worth", "Dedicated staff and net worth verification page."],
            ["/offices/", "Offices & Locations", "Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, Lucknow, Dubai, London, and United States."],
            ["/it-products/", "IT Products", "CRM, ERP, portals, Travel CRM, Travel ERP, websites, e-commerce, automation, and dashboards."],
            ["/contact-us/", "Contact", "Official phone, WhatsApp, email, demo request, and office support routes."]
          ].map(([href, title, text]) => `
            <a class="card industry-card" href="${href}">
              ${iconTile("shield")}
              <h3>${title}</h3>
              <p>${text}</p>
              <span>Open page ${icons.arrow}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Directory FAQ</span>
          <h2>Answers for directory submissions and AI profile citations.</h2>
          <p>These answers keep the public profile consistent when submitting BANDEVI to directories or external profiles.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${directorySubmissionFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Submission status</h3>
            ${list(["Website-controlled profile is ready.", "External directories may require login, OTP, owner approval, or manual verification.", "Keep every listing aligned with official phone, email, website, proof pages, and company PDF."])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/external-citation-tracker/">Citation Tracker</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function externalCitationTrackerPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">External citations</span>
          <h2>Directory submission tracker for BANDEVI GLOBAL GROUP.</h2>
          <p class="muted">This tracker keeps outside profiles aligned with the official BANDEVI website, chairman identity, staff size, net worth, offices, proof files, and contact details.</p>
          ${list(["Official company: BANDEVI GLOBAL GROUP", "Chairman: Mr Surya Kant Jha", "Staff size: 1,289 staff worldwide", "Net worth and group strength: INR 7,594 Cr", "Office references: 10 listed office and service-location references", "Primary contact: +91 8287669022 and sales@bandeviglobalgroup.com"])}
          <div class="inline-actions">
            <a class="button primary" href="${citationTrackerCsv}">Download Tracker CSV ${icons.arrow}</a>
            <a class="button ghost" href="${directorySubmissionCopy}">Submission Copy Pack</a>
            <a class="button ghost" href="${externalSubmissionStatus}">Submission Status</a>
            <a class="button ghost" href="${googleBusinessProfileStatus}">Google Profile Status</a>
            <a class="button ghost" href="${bingPlacesSubmissionPack}">Bing Places Pack</a>
            <a class="button ghost" href="/directory-listing-profile/">Directory Profile</a>
            <a class="button ghost" href="/proof-verification/">Proof Page</a>
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="BANDEVI external citation tracker and directory submission pack"></div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Submission priority</span>
          <h2>Start with the platforms that can reinforce search and AI trust.</h2>
          <p>Most external profiles require account access, OTP, owner approval, profile review, or location verification. The website-controlled files are ready now; the next work is logging into each platform and submitting the same details.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>12</strong><p>Priority external citation targets prepared for map, B2B directory, and social profile consistency.</p></article>
          <article class="card metric-card"><strong>Pending</strong><p>Map verification is pending after owner submission. Keep official name, phone, website, category, and first address unchanged.</p></article>
          <article class="card metric-card"><strong>Same data</strong><p>Every listing should repeat the same name, chairman, phone, email, website, staff size, net worth, and proof links.</p></article>
          <article class="card metric-card"><strong>Clutch</strong><p>Basic free profile submission has been reported complete. Monitor review/onboarding and add approved case studies later.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Tracker table</span>
          <h2>Priority directory and profile targets.</h2>
          <p>Use this table as the working order for external trust building. The CSV has the fuller submission notes, proof URLs, and status columns.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Platform</th><th>Type</th><th>Status</th><th>Recommended category</th></tr></thead>
            <tbody>
              ${externalCitationTargets.map(([name, type, href, status, category]) => `<tr><td><a href="${href}" target="_blank" rel="noopener noreferrer">${name}</a></td><td>${type}</td><td>${status}</td><td>${category}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="inline-actions">
          <a class="button primary" href="${citationTrackerCsv}">Open Full Tracker CSV ${icons.arrow}</a>
          <a class="button ghost" href="${directorySubmissionCopy}">Open Copy Pack</a>
          <a class="button ghost" href="${externalSubmissionStatus}">Open Status Note</a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Copy and proof assets</span>
          <h2>Use these files while creating external profiles.</h2>
          <p>These files keep staff size, net worth, offices, chairman identity, and proof links consistent across every directory submission.</p>
        </div>
        <div class="grid cols-3">
          ${[
            ["Directory Submission Copy", directorySubmissionCopy, "Copy-paste descriptions, categories, services, proof URLs, phone, email, social links, staff size, net worth, and office wording."],
            ["External Submission Status", externalSubmissionStatus, "Working status note for Google/Bing verification, Clutch submission, GoodFirms next action, and proof-link consistency."],
            ["Google Business Profile Status", googleBusinessProfileStatus, "Public status note showing the profile is verified in Business Profile Manager and currently processing review."],
            ["Bing Places Submission Pack", bingPlacesSubmissionPack, "Microsoft/Bing listing copy, categories, services, proof URLs, address rule, and verification-safe submission wording."],
            ["External Citation Tracker CSV", citationTrackerCsv, "Priority platform list with status, account requirements, categories, proof URLs, and notes for each submission."],
            ["Directory Listing Profile", "/directory-listing-profile/", "Public directory-ready company profile for search engines, AI tools, and external business listings."],
            ["Proof Support Pack", proofSupportPackPdf, "Combined PDF for chairman identity, staff size, net worth, office references, and next formal evidence."],
            ["Company Profile PDF", companyProfilePdf, "Downloadable company profile covering services, staff, net worth, offices, and official contact details."],
            ["Proof & Verification", "/proof-verification/", "Public proof page for staff size, net worth, offices, contact details, and proof status."]
          ].map(([title, href, text]) => `
            <article class="card">
              <h3>${title}</h3>
              <p>${text}</p>
              <a class="button light" href="${href}">Open ${icons.arrow}</a>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Submission rule</h3>
              <p>Do not change BANDEVI's official company name, chairman name, phone, email, website, staff size, net worth, or office wording between platforms. Consistency is the trust signal.</p>
            </article>
            <article class="article-block">
              <h3>Location rule</h3>
              <p>For Google Business Profile, Bing Places, and map-style platforms, publish only locations that can pass that platform's verification rules. Use the offices page and office verification sheet as public support.</p>
            </article>
            <article class="article-block">
              <h3>Review rule</h3>
              <p>For Clutch, GoodFirms, TechBehemoths, Sortlist, DesignRush, and The Manifest, add client-approved reviews, portfolio items, case studies, and project proof only after approval for public sharing.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Next live action</h3>
            ${list(["Do not edit Google/Bing core profile details while verification is pending.", "Monitor Clutch and GoodFirms for profile review or onboarding messages.", "Create TechBehemoths next using the same profile copy and proof URLs.", "Update LinkedIn, Facebook, Instagram, and X with the proof URL."])}
            <a class="button dark" href="${citationTrackerCsv}">Download Tracker ${icons.arrow}</a>
            <a class="button light" href="${directorySubmissionCopy}">Copy Pack</a>
            <a class="button light" href="${externalSubmissionStatus}">Status Note</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function proofVerificationPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Proof and verification</span>
          <h2>Public verification for BANDEVI staff size, net worth, offices, and official identity.</h2>
          <p class="muted">This page gives visitors, partners, and search engines one clear place to verify the highest-priority BANDEVI GLOBAL GROUP facts: staff size, net worth, office references, contact channels, and document proof status.</p>
          <p class="muted">The figures below are published as company-provided public facts. Formal proof documents can be linked here when they are approved for public sharing.</p>
          ${list(["Staff size: 1,289 staff worldwide", "Net worth and group strength: INR 7,594 Cr", "Offices and service locations: Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, Lucknow, Dubai, London, and United States", "Official website: bandeviglobalgroup.com", "Official contact: +91 8287669022 and sales@bandeviglobalgroup.com"])}
          <div class="inline-actions">
            <a class="button primary" href="/company-profile/">Company Profile ${icons.arrow}</a>
            <a class="button ghost" href="/it-company-software-development-services/">IT Services</a>
            <a class="button ghost" href="/staff-size-net-worth/">Staff & Net Worth</a>
            <a class="button ghost" href="${companyProfilePdf}">Company Profile PDF</a>
            <a class="button ghost" href="/directory-listing-profile/">Directory Profile</a>
            <a class="button ghost" href="/contact-us/">Verify Contact</a>
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="BANDEVI proof verification dashboard"></div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Priority verification</span>
          <h2>First facts to prove and rank.</h2>
          <p>These are the public proof signals that should stay consistent across the website, Google indexing, company profile PDFs, social profiles, and future document links.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>1,289</strong><p>Current company-provided worldwide staff size across operations, sales, support, partnerships, technology, and business development.</p></article>
          <article class="card metric-card"><strong>INR 7,594 Cr</strong><p>Current company-provided net worth and group strength figure for public confidence and market context.</p></article>
          <article class="card metric-card"><strong>10</strong><p>Listed office and service-location references across India, Dubai, London, and the United States.</p></article>
          <article class="card metric-card"><strong>Official</strong><p>Primary verification through bandeviglobalgroup.com, phone, WhatsApp, email, and connected social profiles.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof table</span>
          <h2>Published facts and proof status.</h2>
          <p>This table keeps public claims organized so each fact can later connect to a document, profile, certificate, map, case study, or approved proof file.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Proof item</th><th>Current public detail</th><th>Status / next evidence</th></tr></thead>
            <tbody>
              ${proofVerificationItems.map(([label, value, status]) => `<tr><td>${label}</td><td>${value}</td><td>${status}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Office verification</span>
          <h2>All listed office and service-location references.</h2>
          <p>Office proof can be strengthened next with location photos, Google Business Profile links, map links, service-office confirmations, and location-specific contact proof.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Location</th><th>Address</th></tr></thead>
            <tbody>
              ${officeLocations.map(([city, address]) => `<tr><td>${city}</td><td>${address}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="inline-actions">
          <a class="button primary" href="/offices/">Open Offices Page ${icons.arrow}</a>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof documents</span>
          <h2>Documents to attach when approved for public use.</h2>
          <p>This list shows the next proof files that will make staff size, net worth, offices, and company identity stronger for visitors and search engines.</p>
        </div>
        <div class="grid cols-3">
          ${proofDocumentChecklist.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
        <div class="inline-actions">
          <a class="button primary" href="${companyProfilePdf}">Open Company Profile PDF ${icons.arrow}</a>
          <a class="button ghost" href="/directory-listing-profile/">Open Directory Profile</a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Public support files</span>
          <h2>Downloadable proof-support notes now published.</h2>
          <p>These company-published notes give Google, directories, partners, and visitors consistent public references for staff size, net worth, offices, chairman identity, and next formal proof.</p>
        </div>
        <div class="grid cols-3">
          ${proofSupportFiles.map(([title, href, text]) => `
            <article class="card">
              <h3>${title}</h3>
              <p>${text}</p>
              <a class="button light" href="${href}">Open file ${icons.arrow}</a>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Verification FAQ</span>
          <h2>Answers for staff size, net worth, offices, and next proof.</h2>
          <p>These answers keep the main public proof language consistent across BANDEVI pages and future Google indexing.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${proofVerificationFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Verification priority</h3>
            ${list(["Keep 1,289 staff worldwide consistent everywhere.", "Keep INR 7,594 Cr net worth consistent everywhere.", "Link proof files only after approval for public use.", "Use BANDEVI and THG separation wherever sister-brand context is mentioned."])}
            <a class="button dark" href="/trust-licences-certifications/">Open Trust Center ${icons.arrow}</a>
            <a class="button light" href="/it-company-software-development-services/">IT Services</a>
            <a class="button light" href="/staff-size-net-worth/">Staff & Net Worth</a>
            <a class="button light" href="/directory-listing-profile/">Directory Profile</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    ${cta("Make BANDEVI proof easier to trust.", "Use the official contact channels to verify staff size, net worth, offices, documentation, and project scope before engagement.")}
  `;
}

function itCompanyServicesPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">IT company and software development</span>
          <h2>BANDEVI GLOBAL GROUP builds websites, CRM, ERP, portals, automation, and business software.</h2>
          <p class="muted">This page is built for people searching BANDEVI GLOBAL GROUP services, BANDEVI IT company, software development company, website CRM ERP company, and business automation company.</p>
          <p class="muted">BANDEVI combines commercial website design with practical business systems, so the public brand, sales pipeline, operations, support, and reporting can work together.</p>
          ${list(["Premium website and landing-page development", "CRM and ERP development for sales, operations, finance, and reporting", "Customer, staff, partner, and support portal development", "E-commerce, booking, payment, and product-catalogue workflows", "Business automation, dashboards, and process improvement", "Travel CRM, travel ERP, travel websites, and travel technology systems"])}
          <div class="inline-actions">
            <a class="button primary" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button ghost" href="/contact-us/">Contact</a>
            <a class="button ghost" href="/proof-verification/">Proof Page</a>
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="BANDEVI IT company software development services dashboard"></div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial service signals</span>
          <h2>The core services BANDEVI should rank for.</h2>
          <p>These service signals connect BANDEVI's proof layer with the actual commercial work customers search for: website development, CRM, ERP, portals, automation, and software systems.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>Website</strong><p>Corporate websites, landing pages, service pages, SEO page structure, enquiry paths, and conversion-ready design.</p></article>
          <article class="card metric-card"><strong>CRM</strong><p>Lead capture, pipeline tracking, follow-ups, customer records, quotations, source tracking, and dashboards.</p></article>
          <article class="card metric-card"><strong>ERP</strong><p>Operations, approvals, suppliers, invoices, finance, documents, task ownership, inventory, and reports.</p></article>
          <article class="card metric-card"><strong>Automation</strong><p>Workflow routing, reminders, notifications, document requests, support handoffs, and process dashboards.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Service overview</span>
          <h2>Software development services and business systems.</h2>
          <p>Each service can launch as a focused first release, then expand into integrations, dashboards, portals, automation, and support workflows as the business grows.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Service</th><th>What BANDEVI can build</th></tr></thead>
            <tbody>
              ${itCompanyServices.map(([service, detail]) => `<tr><td>${service}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Industries</span>
          <h2>Business lines that can use BANDEVI systems.</h2>
          <p>The same website, CRM, ERP, portal, and automation foundation can be adapted for travel companies, service businesses, retail, food brands, professional services, and multi-brand groups.</p>
        </div>
        <div class="grid cols-3">
          ${itCompanyIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed services</span>
          <h2>Company strength signals supporting service trust.</h2>
          <p>Commercial service pages should still point to the proof layer, so customers can verify company identity, staff size, net worth, offices, and official channels before starting a project.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and proof</h3>
              <p>BANDEVI's company profile, proof page, staff size and net worth page, offices page, and company profile PDF work together as the public trust layer behind its IT services.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>The website publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>Service delivery clarity</h3>
              <p>Each website, CRM, ERP, portal, commerce, or automation project can be defined with scope notes, modules, responsibilities, launch requirements, access handover, and support paths.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before engagement</h3>
            ${list(["Company Profile: /company-profile/", "Proof & Verification: /proof-verification/", "Staff Size & Net Worth: /staff-size-net-worth/", "Offices & Locations: /offices/", "Company Profile PDF: /assets/bandevi-global-group-company-profile.pdf"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Service FAQ</span>
          <h2>Answers for IT company, software, CRM, ERP, and automation searches.</h2>
          <p>These answers help Google connect BANDEVI with the commercial services customers are likely to search for.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${itCompanyFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start a project</h3>
            ${list(["Share the business workflow.", "Choose website, CRM, ERP, portal, e-commerce, automation, or travel technology scope.", "Confirm first-release modules and timeline.", "Use official phone, WhatsApp, email, or demo request for contact."])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
    ${cta("Build a website that can become a complete business system.", "BANDEVI GLOBAL GROUP can plan the public website, CRM, ERP, portal, automation, and reporting path together.")}
  `;
}

function staffWorthPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Staff size and net worth</span>
          <h2>BANDEVI GLOBAL GROUP staff size, net worth, and public proof links.</h2>
          <p class="muted">This page is built for people searching BANDEVI GLOBAL GROUP staff size, Bandevi Global Group net worth, BANDEVI net worth, and BANDEVI company strength.</p>
          <p class="muted">The figures below are presented as current company-provided public facts. Formal supporting documents can be linked when they are approved for public sharing.</p>
          ${list(["Staff size: 1,289 staff worldwide", "Net worth and group strength: INR 7,594 Cr", "Office network: 10 listed office and service-location references", "Official proof document: BANDEVI GLOBAL GROUP company profile PDF", "Official contact: +91 8287669022 and sales@bandeviglobalgroup.com"])}
          <div class="inline-actions">
            <a class="button primary" href="${companyProfilePdf}">Open Company Profile PDF ${icons.arrow}</a>
            <a class="button ghost" href="/proof-verification/">Proof Page</a>
            <a class="button ghost" href="/offices/">Offices</a>
            <a class="button ghost" href="${proofSupportPackPdf}">Proof Support Pack</a>
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="BANDEVI staff size and net worth verification"></div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Priority facts</span>
          <h2>The exact staff and net worth signals to keep consistent.</h2>
          <p>These numbers should match across the website, PDF, social profiles, proposals, public profiles, and future proof documents.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>1,289</strong><p>Current company-provided staff size worldwide.</p></article>
          <article class="card metric-card"><strong>INR 7,594 Cr</strong><p>Current company-provided net worth and group strength figure.</p></article>
          <article class="card metric-card"><strong>10</strong><p>Listed office and service-location references across India, Dubai, London, and the United States.</p></article>
          <article class="card metric-card"><strong>PDF</strong><p>Official company profile document linked from the website and sitemap.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Company strength table</span>
          <h2>Published staff, net worth, and verification details.</h2>
          <p>This table gives Google and visitors a focused reference for the highest-priority company-strength facts.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Fact</th><th>Published detail</th></tr></thead>
            <tbody>
              ${staffWorthFacts.map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof roadmap</span>
          <h2>Next documents that can strengthen these claims.</h2>
          <p>The website now publishes the staff and net worth facts. The strongest next trust layer is formal document support and external consistency.</p>
        </div>
        <div class="grid cols-3">
          ${staffWorthProofSteps.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Support notes</span>
          <h2>Staff and net worth proof-support files.</h2>
          <p>Use these public files as the current company-published support layer for the 1,289 staff and INR 7,594 Cr figures.</p>
        </div>
        <div class="grid cols-3">
          ${[
            proofSupportFiles[0],
            proofSupportFiles[1],
            proofSupportFiles[4]
          ].map(([title, href, text]) => `
            <article class="card">
              <h3>${title}</h3>
              <p>${text}</p>
              <a class="button light" href="${href}">Open file ${icons.arrow}</a>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Staff and net worth FAQ</span>
          <h2>Answers for staff size, net worth, proof, and verification.</h2>
          <p>These answers are written for exact-search visibility while keeping the claim language careful and consistent.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${staffWorthFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Verification links</h3>
            ${list(["Company Profile: /company-profile/", "Proof & Verification: /proof-verification/", "Offices & Locations: /offices/", "Company Profile PDF: /assets/bandevi-global-group-company-profile.pdf", "Staff Confirmation Note: /assets/bandevi-global-group-staff-confirmation-note.txt", "Net Worth Note: /assets/bandevi-global-group-net-worth-group-strength-note.txt"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="${companyProfilePdf}">Open PDF</a>
            <a class="button light" href="${proofSupportPackPdf}">Proof Support Pack</a>
          </aside>
        </div>
      </div>
    </section>
    ${cta("Keep staff size and net worth easy to verify.", "Use the official BANDEVI company profile, proof page, offices page, PDF, and contact channels for confirmation.")}
  `;
}

function officesPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Offices and locations</span>
          <h2>BANDEVI GLOBAL GROUP office and service-location references.</h2>
          <p class="muted">This page is built for visitors searching BANDEVI GLOBAL GROUP office, Bandevi Global Delhi office, Bandevi Global Pune, Bandevi Global Dubai, Bandevi Global London, and other location-based searches.</p>
          <p class="muted">Use the official contact channels first so the correct office route, support desk, project owner, and delivery scope can be confirmed clearly.</p>
          ${list(["India references: Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, and Lucknow", "International references: Dubai, London, and United States", "Official phone and WhatsApp: +91 8287669022", "Official email: sales@bandeviglobalgroup.com", "Office proof can be strengthened with photos, map links, Google Business Profile links, and service-office confirmations"])}
          <div class="inline-actions">
            <a class="button primary" href="/contact-us/">Contact Office Desk ${icons.arrow}</a>
            <a class="button ghost" href="${companyProfilePdf}">Company Profile PDF</a>
            <a class="button ghost" href="/proof-verification/">Proof Page</a>
            <a class="button ghost" href="${asset("bandevi-global-group-office-verification-sheet.txt")}">Office Verification Sheet</a>
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="BANDEVI GLOBAL GROUP offices and service locations"></div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Location priority</span>
          <h2>Office signals for customers and Google.</h2>
          <p>The office page keeps location names, addresses, official contact paths, and verification language consistent across the website.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>7</strong><p>India office and service-location references: Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, and Lucknow.</p></article>
          <article class="card metric-card"><strong>3</strong><p>International references: Dubai, London, and United States.</p></article>
          <article class="card metric-card"><strong>10</strong><p>Total listed office and service-location references for visitor and search verification.</p></article>
          <article class="card metric-card"><strong>Official</strong><p>Office enquiries should start through the official phone, WhatsApp, email, or contact page.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">All offices</span>
          <h2>Complete BANDEVI office and service-location list.</h2>
          <p>These addresses support local search visibility and give visitors one public place to confirm the location references currently listed by the company.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Location</th><th>Address</th></tr></thead>
            <tbody>
              ${officeLocations.map(([city, address]) => `<tr><td>BANDEVI GLOBAL GROUP ${city}</td><td>${address}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Office proof</span>
          <h2>What should be attached next for stronger office trust.</h2>
          <p>Website location listings are useful, but external and document proof makes the office story stronger for customers and Google.</p>
        </div>
        <div class="grid cols-3">
          ${[
            { title: "Public office sheet", text: "The office verification sheet is now published with all 10 office and service-location references." },
            { title: "Location photos", text: "Add office entrance, reception, workspace, team, or service-office photos where approved for public use." },
            { title: "Map and profile links", text: "Add Google Business Profile links, map pins, or location pages after the listings are verified and ready." },
            { title: "Official confirmations", text: "Add lease, service-office, registration, or location-specific contact proof where public sharing is allowed." },
            { title: "Contact routing", text: "Keep all office enquiries routed through the official phone, WhatsApp, email, and contact page first." },
            { title: "Local landing pages", text: "Create city pages later only for offices where proof, photos, services, and local content are strong enough." },
            { title: "Consistent wording", text: "Use office and service-location references consistently so no city page overstates company-specific proof." }
          ].map((item) => `<article class="card"><h3>${item.title}</h3><p>${item.text}</p></article>`).join("")}
        </div>
        <div class="inline-actions">
          <a class="button primary" href="${asset("bandevi-global-group-office-verification-sheet.txt")}">Open Office Verification Sheet ${icons.arrow}</a>
          <a class="button ghost" href="${proofSupportPackPdf}">Open Proof Support Pack</a>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Office FAQ</span>
          <h2>Answers for office searches and verification.</h2>
          <p>These answers support searches around BANDEVI GLOBAL GROUP offices, city names, location proof, and official contact routing.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${officeVerificationFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Official office contact</h3>
            ${list(["Phone and WhatsApp: +91 8287669022", "Email: sales@bandeviglobalgroup.com", "Website: bandeviglobalgroup.com", "Use the proof page for staff size, net worth, offices, and documentation status.", "Office Verification Sheet: /assets/bandevi-global-group-office-verification-sheet.txt"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
            <a class="button light" href="${asset("bandevi-global-group-office-verification-sheet.txt")}">Office Sheet</a>
          </aside>
        </div>
      </div>
    </section>
    ${cta("Confirm the right office route before starting.", "Contact BANDEVI GLOBAL GROUP through official channels so the correct office, support desk, and project owner can be assigned.")}
  `;
}

function trustPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Trust center</span>
          <h2>Trust signals for clients choosing BANDEVI for websites, CRM, ERP, portals, and automation.</h2>
          <p class="muted">Bandevi Global Group, Bandevi Global, Bandevi, and BANDEVI GLOBAL GROUP are used as brand references for the same official company website and technology services.</p>
          <p class="muted">This page brings BANDEVI's credibility story into one place: sister-brand operating exposure, public travel-network references, office presence, documentation standards, and separate project control.</p>
          <p class="muted">BANDEVI GLOBAL GROUP remains the IT and software development company. The Holidays Group remains a separate sister travel brand, and its public trust profile gives practical context for the systems BANDEVI builds.</p>
          ${list(["Official BANDEVI contact channels for sales, demo, WhatsApp, email, and support routing", "Clear separation between BANDEVI technology projects and sister-brand travel operations", "Written project scope, module lists, milestones, access records, and launch handover planning", "Public THG references across tourism, airline, travel association, supplier, and quality networks", "Multi-location confidence across India, Dubai, London, and the United States", "Project delivery focused on scope clarity, access control, documentation, support, and long-term improvement"])}
          <div class="inline-actions">
            <a class="button primary" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button ghost" href="/contact-us/">Contact Us</a>
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="BANDEVI trust and technology dashboard"></div>
      </div>
    </section>
    ${brandIdentityPanel()}
    <section class="section trust-strip">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Verification layer</span>
          <h2>Practical proof points clients can review.</h2>
          <p>Trust is strongest when the client can check who they are speaking to, what will be delivered, how access will be handled, and how support will continue after launch.</p>
        </div>
        <div class="proof-grid">
          ${trustVerificationCards.map((item) => `
            <article class="proof-card">
              <span class="status-label">${item.status}</span>
              <h3>${item.title}</h3>
              <p>${item.text}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Sister-brand operating strength.</h2>
          <p>THG's public profile gives BANDEVI a stronger real-world reference for customer support, documentation, multi-location coordination, and premium service expectations.</p>
        </div>
        <div class="grid cols-4">
          ${sisterBrandTrustStats.map(([title, text]) => `<article class="card metric-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <h2>Licences, memberships, supplier networks, and quality references.</h2>
          <p>These public THG travel-ecosystem references support stronger confidence when BANDEVI builds travel websites, white-label websites, CRM, ERP, booking workflows, portals, and documentation systems. They are shown as sister-brand references, not as BANDEVI licence claims.</p>
        </div>
        <div class="grid cols-4">
          ${travelTrustNetworks.map(([title, text]) => `<article class="card metric-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Onboarding records</span>
          <h2>Documents and handover details that reduce client risk.</h2>
          <p>A premium website or system should not depend on memory. BANDEVI can keep the important business, technical, commercial, and access details visible during planning, launch, and support.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Trust record</th><th>What it covers</th></tr></thead>
            <tbody>
              ${trustDocumentChecklist.map(([title, text]) => `<tr><td>${title}</td><td>${text}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>How trust becomes better software.</h2>
          <p>Credibility is useful only when it improves the client experience. BANDEVI converts operating discipline into practical product decisions.</p>
        </div>
        ${cards([
          { icon: "globe", title: "Trust-ready websites", text: "Company pages, service pages, travel websites, white-label websites, social links, office locations, policies, and enquiry paths are structured to build confidence quickly." },
          { icon: "users", title: "CRM follow-up discipline", text: "Every enquiry can have owner assignment, follow-up reminders, source tracking, customer history, and clear sales-stage visibility." },
          { icon: "stack", title: "ERP and document control", text: "Bookings, orders, service records, invoices, supplier notes, approvals, files, and status updates stay organized for daily teams." },
          { icon: "shield", title: "Portal and access control", text: "Customer and partner portals can separate documents, invoices, tickets, project milestones, service updates, and support requests." }
        ], 4)}
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">Delivery standards</span>
          <h2>Trust practices we apply to every project.</h2>
        </div>
        <div class="process">
          ${[
            ["Scope", "Define pages, modules, roles, workflows, data fields, access needs, and launch priorities clearly before build."],
            ["Separate", "Keep each project, brand, domain, workflow, and login structure separate when the business requires it."],
            ["Document", "Preserve important content, lead fields, customer records, service status, files, forms, and support paths."],
            ["Improve", "Review usage, customer response, lead quality, team adoption, and future module expansion after launch."]
          ].map((item, index) => `
            <div class="process-step">
              <span>0${index + 1}</span>
              <h3>${item[0]}</h3>
              <p>${item[1]}</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <h2>Access, privacy, and support promises.</h2>
          <p>These practices help clients trust the system after it goes live, especially when websites, CRM, ERP, portals, domains, and business brands must stay separate.</p>
        </div>
        ${cards([
          { icon: "shield", title: "Least-access planning", text: "Admin, staff, customer, partner, and support access can be separated so users only see what they need." },
          { icon: "stack", title: "Ownership clarity", text: "Domain, hosting, database, repository, email, analytics, payment, and WhatsApp ownership can be documented before launch." },
          { icon: "users", title: "Training and handover", text: "Daily users can receive clear launch notes for content, leads, orders, bookings, reports, support requests, and future updates." },
          { icon: "chart", title: "Improvement roadmap", text: "After launch, the next release can be prioritized around real enquiries, conversion gaps, staff feedback, and support requests." }
        ], 4)}
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Office and service-location confidence.</h2>
          <p>The shared business network creates a stronger support story across India, Dubai, London, and the United States while BANDEVI technology projects remain separately managed.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Location</th><th>Address</th></tr></thead>
            <tbody>
              ${officeLocations.map(([city, address]) => `<tr><td>${city}</td><td>${address}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    ${cta("Build trust into the website and the system behind it.", "BANDEVI can turn credibility, documentation, support, CRM, ERP, portal, and automation into one stronger digital experience.")}
  `;
}

function crmPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Travel CRM software</span>
          <h2>Travel CRM software for enquiries, quotations, follow-ups, and customer records.</h2>
          <p class="muted">BANDEVI GLOBAL GROUP builds Travel CRM software for travel agencies, tour operators, DMCs, corporate travel desks, branches, partners, white-label sellers, and multi-office travel groups that need stronger sales control.</p>
          ${list(["Lead capture from travel websites, package pages, destination pages, WhatsApp, calls, campaigns, referrals, partners, branches, and offline enquiries", "Customer and trip profiles with destination interest, dates, pax count, budget direction, hotel category, service type, notes, and source", "Quotation stages for FIT, group, MICE, pilgrimage, corporate, DMC, holiday, family, and custom-trip requests", "Follow-up reminders, task ownership, campaign segmentation, repeat-sales prompts, lost reasons, and sales dashboards"])}
        </div>
        <div class="media-frame"><img src="${productImage}" alt="Travel CRM dashboard screens"></div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <h2>CRM modules that match travel sales work.</h2>
          <p>Designed to support sales leaders, travel consultants, marketing teams, and customer service teams without forcing generic workflows.</p>
        </div>
        ${cards([
          { icon: "users", title: "Travel lead desk", text: "Queue, assign, prioritize, and track enquiries from website, WhatsApp, calls, campaigns, referrals, partners, and branches." },
          { icon: "plane", title: "Trip interest profile", text: "Capture destinations, dates, budget, pax count, hotel category, service type, preferences, documents, and communication notes." },
          { icon: "message", title: "Quotation follow-ups", text: "Track quotation stage, proposal version, customer response, next action, callback owner, overdue reminders, and lost reasons." },
          { icon: "stack", title: "Booking-ready handoff", text: "Move qualified or confirmed leads toward lead and booking management, Travel ERP, customer portal, documents, and payment workflow." },
          { icon: "shield", title: "Team ownership", text: "Separate branch, partner, reseller, consultant, manager, and support access so daily work has clear accountability." },
          { icon: "chart", title: "Conversion intelligence", text: "See source performance, response speed, consultant activity, follow-up discipline, conversion rate, and revenue potential." }
        ])}
      </div>
    </section>
    ${crmSeoSections()}
    ${cta("Turn more travel enquiries into booked revenue.", "Launch a CRM that keeps follow-ups sharp and leadership informed.")}
  `;
}

function crmSeoSections() {
  return `
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial search targets</span>
          <h2>Travel CRM services customers search before asking for a demo.</h2>
          <p>This page is structured for Travel CRM software, travel agency CRM, tour operator CRM, DMC CRM software, travel lead management software, travel enquiry management, quotation follow-up software, WhatsApp lead CRM, travel sales CRM, and travel CRM with ERP handoff searches.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>Leads</strong><p>Travel website enquiries, package leads, destination interest, WhatsApp, calls, campaigns, referrals, branches, partners, and resellers.</p></article>
          <article class="card metric-card"><strong>Customers</strong><p>Customer profiles, trip interest, dates, pax count, budget, hotel category, preferences, documents, notes, and communication history.</p></article>
          <article class="card metric-card"><strong>Quotations</strong><p>Proposal versions, quotation stages, follow-up reminders, next actions, overdue leads, lost reasons, and booking-ready movement.</p></article>
          <article class="card metric-card"><strong>Reports</strong><p>Source quality, response speed, consultant activity, quote-to-booking conversion, revenue pipeline, and sales dashboards.</p></article>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel CRM modules</span>
          <h2>What BANDEVI can build into Travel CRM software.</h2>
          <p>The first release can start with lead capture, customer profiles, quotation stages, and follow-up reminders, then expand into booking handoff, Travel ERP, portals, documents, payments, automation, and dashboards.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>CRM area</th><th>What it can include</th></tr></thead>
            <tbody>
              ${travelCrmRows.map(([area, detail]) => `<tr><td>${area}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel segments</span>
          <h2>Travel CRM for agencies, tour operators, DMCs, corporate desks, branches, and reseller networks.</h2>
          <p>BANDEVI can shape the CRM around how each travel business captures enquiries, qualifies customers, sends quotations, follows up, tracks sources, and hands confirmed work into booking operations.</p>
        </div>
        <div class="grid cols-3">
          ${travelCrmIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed Travel CRM company</span>
          <h2>Company strength signals behind Travel CRM delivery.</h2>
          <p>Travel CRM touches leads, customers, sales owners, quotations, documents, staff performance, and revenue pipeline. BANDEVI connects this page with its public proof layer so buyers can verify the company before sharing sales workflow details.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and verification</h3>
              <p>The website links Travel CRM service pages to the Company Profile, Proof & Verification page, Offices page, Staff Size & Net Worth page, and official company profile PDF.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>BANDEVI publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>CRM governance</h3>
              <p>Travel CRM projects can include lead fields, source rules, sales stages, user roles, follow-up rules, quotation notes, dashboard access, handover records, training notes, and support ownership.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before CRM planning</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "Company Profile PDF", "Official contact and demo request"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/staff-size-net-worth/">Staff & Net Worth</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Connected travel system</span>
          <h2>Travel CRM connects website leads, lead booking, ERP, portal, and automation.</h2>
          <p>Travel CRM is the sales center of the wider travel technology stack. It protects enquiry context before the lead becomes a confirmed booking.</p>
        </div>
        <div class="grid cols-3">
          <a class="card" href="/travel-website-development/"><h3>Travel Website</h3><p>Capture SEO, package, destination, campaign, contact, demo, and WhatsApp enquiries into CRM-ready records.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/lead-booking-management/"><h3>Lead & Booking Management</h3><p>Move qualified CRM leads into booking files with customer context, quote status, documents, and operations notes.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/travel-erp/"><h3>Travel ERP</h3><p>Connect confirmed work with suppliers, passengers, invoices, payments, documents, approvals, and operations reports.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/customer-portal/"><h3>Customer Portal</h3><p>Give customers controlled access to booking status, documents, invoices, support requests, and service updates.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/business-automation/"><h3>Business Automation</h3><p>Automate lead routing, follow-up reminders, document requests, payment alerts, updates, and daily sales reports.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/travel-technology/"><h3>Travel Technology</h3><p>Use the wider travel stack for websites, CRM, ERP, bookings, suppliers, portals, automation, and dashboards.</p><span>Open page ${icons.arrow}</span></a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel CRM FAQ</span>
          <h2>Answers for Travel CRM, travel agency CRM, WhatsApp leads, quotations, follow-ups, and ERP handoff searches.</h2>
          <p>These answers help customers and search engines understand the Travel CRM work BANDEVI can support.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${travelCrmFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start with the right CRM layer</h3>
            ${list(["Travel lead capture", "Customer and trip profiles", "Quotation stages", "Follow-up reminders", "Source tracking", "Sales dashboards and booking handoff"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function erpPage() {
  return `
    <section class="section">
      <div class="container split reverse">
        <div class="media-frame"><img src="${productImage}" alt="Travel ERP operations screens"></div>
        <div>
          <span class="eyebrow">Travel ERP software</span>
          <h2>Travel ERP software for bookings, suppliers, finance, documents, and operations.</h2>
          <p class="muted">BANDEVI GLOBAL GROUP builds Travel ERP software for tour operators, travel agencies, DMCs, corporate travel desks, group operators, MICE teams, and multi-office travel businesses that need stronger control after a lead becomes a confirmed booking.</p>
          ${list(["Booking file management with passengers, itinerary notes, services, suppliers, invoices, documents, owners, and status", "Supplier workflows for hotels, transport, DMC partners, activities, guides, insurance, visas, confirmations, rates, and payment schedules", "Invoice, receipt, refund, customer dues, supplier payables, payment reminders, reconciliation notes, and margin visibility", "Role-based approvals for discounts, supplier changes, payment release, refunds, margin exceptions, and operational changes"])}
        </div>
      </div>
    </section>
    <section class="section gold-band">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">Control layer</span>
          <h2>Operational clarity from quote to closure.</h2>
        </div>
        ${cards([
          { icon: "stack", title: "Booking files", text: "Keep passengers, services, suppliers, itinerary notes, documents, invoices, payments, and status in one operating record." },
          { icon: "plane", title: "Supplier coordination", text: "Track hotels, transport, activities, guides, visas, insurance, local services, confirmations, rates, and supplier payment schedules." },
          { icon: "shield", title: "Approval paths", text: "Define authority rules for margin exceptions, payment release, supplier changes, refunds, discounts, and document exceptions." },
          { icon: "users", title: "Team ownership", text: "Separate sales, operations, finance, support, branch, supplier, and management access with clear task responsibility." },
          { icon: "message", title: "Customer updates", text: "Connect document requests, payment reminders, booking status notes, customer portal access, and support communication." },
          { icon: "chart", title: "Finance reporting", text: "Connect sales, cost, receivables, payables, margin, workload, exceptions, and profitability views for every booking file." }
        ])}
      </div>
    </section>
    ${erpSeoSections()}
    ${cta("Give operations the same polish as your sales story.", "Use ERP workflows to reduce leakage, delays, and manual reconciliation.")}
  `;
}

function erpSeoSections() {
  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial search targets</span>
          <h2>Travel ERP services customers search before choosing an operations system.</h2>
          <p>This page is structured for Travel ERP software, tour operator ERP, travel agency ERP, DMC ERP software, travel booking ERP, booking file management, supplier management software, travel invoice software, travel payment tracking, travel document workflow, and travel operations reporting searches.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>Bookings</strong><p>Booking files, passengers, itineraries, service items, owners, suppliers, documents, invoices, payments, and status.</p></article>
          <article class="card metric-card"><strong>Suppliers</strong><p>Hotels, transport, activities, guides, DMC partners, visas, insurance, confirmations, rates, payables, and schedules.</p></article>
          <article class="card metric-card"><strong>Finance</strong><p>Customer invoices, receipts, pending dues, refunds, supplier payments, reconciliation notes, margins, and profitability.</p></article>
          <article class="card metric-card"><strong>Controls</strong><p>Approvals, roles, task ownership, exceptions, document workflow, customer updates, portal handoff, and operations dashboards.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel ERP modules</span>
          <h2>What BANDEVI can build into Travel ERP software.</h2>
          <p>The first release can start with booking files, passengers, suppliers, invoices, payments, and documents, then expand into approvals, margin reporting, customer portals, automation, and dashboards.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ERP area</th><th>What it can include</th></tr></thead>
            <tbody>
              ${travelErpRows.map(([area, detail]) => `<tr><td>${area}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel segments</span>
          <h2>Travel ERP for tour operators, agencies, DMCs, corporate desks, groups, and multi-office teams.</h2>
          <p>BANDEVI can shape ERP around how each travel business confirms bookings, coordinates suppliers, tracks passengers, collects documents, handles finance, manages approvals, and reports operations.</p>
        </div>
        <div class="grid cols-3">
          ${travelErpIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed Travel ERP company</span>
          <h2>Company strength signals behind Travel ERP delivery.</h2>
          <p>Travel ERP touches bookings, passengers, suppliers, payments, documents, margins, approvals, and daily operations. BANDEVI connects this page with its public proof layer so buyers can verify the company before sharing operations and finance workflow details.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and verification</h3>
              <p>The website links Travel ERP service pages to the Company Profile, Proof & Verification page, Offices page, Staff Size & Net Worth page, and official company profile PDF.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>BANDEVI publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>ERP governance</h3>
              <p>Travel ERP projects can include booking fields, supplier rules, document folders, invoice stages, payment status, approval paths, role access, handover records, training notes, and support ownership.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before ERP planning</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "Company Profile PDF", "Official contact and demo request"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/staff-size-net-worth/">Staff & Net Worth</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Connected travel operations</span>
          <h2>Travel ERP connects CRM, booking management, suppliers, portal, and automation.</h2>
          <p>Travel ERP is the operations backbone after sales confirms the work. It protects the booking record, financial status, supplier coordination, and document flow.</p>
        </div>
        <div class="grid cols-3">
          <a class="card" href="/travel-crm/"><h3>Travel CRM</h3><p>Bring qualified or won enquiries into ERP with customer context, source notes, quotation status, and owner details.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/lead-booking-management/"><h3>Lead & Booking Management</h3><p>Convert confirmed leads into booking files with passengers, services, documents, invoices, payments, and operations status.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/customer-portal/"><h3>Customer Portal</h3><p>Give customers controlled access to booking status, documents, invoices, receipts, payment updates, and support requests.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/business-automation/"><h3>Business Automation</h3><p>Automate supplier tasks, document reminders, payment alerts, approvals, booking updates, and management reports.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/travel-website-development/"><h3>Travel Website</h3><p>Start with travel website enquiries, then connect sales and operations through CRM, booking workflow, and ERP.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/travel-technology/"><h3>Travel Technology</h3><p>Use the wider travel stack for websites, CRM, ERP, bookings, suppliers, portals, automation, and dashboards.</p><span>Open page ${icons.arrow}</span></a>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel ERP FAQ</span>
          <h2>Answers for Travel ERP, tour operator ERP, booking files, suppliers, invoices, payments, and document workflow searches.</h2>
          <p>These answers help customers and search engines understand the Travel ERP work BANDEVI can support.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${travelErpFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start with the right ERP layer</h3>
            ${list(["Booking files", "Passenger and traveller records", "Supplier workflow", "Invoices and payments", "Documents and approvals", "Margins, dashboards, and portal handoff"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function productsPage() {
  return `
    <section class="section">
      <div class="container product-row">
        <div>
          <span class="eyebrow">Products</span>
          <h2>A modular platform suite for growing business lines.</h2>
          <p class="muted">Start with the module that solves the most urgent business problem, then expand into a connected operating system for growth across travel, masala, makhana, astrology, and service brands.</p>
          <div class="pill-list">
            ${["Travel CRM", "Travel ERP", "Complete Travel Website", "White-label Website", "Customer Portal", "E-Commerce", "Analytics"].map((item) => `<span class="pill">${item}</span>`).join("")}
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="Travel technology product suite"></div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Product areas.</h2>
          <p>Each product can be tailored to the scale, market, and operating model of the company while the core modules remain consistent.</p>
        </div>
        ${cards([
          { icon: "users", title: "Travel CRM", text: "Lead capture, pipeline, customer profiles, follow-up automation, campaigns, and consultant performance." },
          { icon: "stack", title: "Travel ERP", text: "Bookings, services, suppliers, invoices, receipts, approvals, documents, and profit tracking." },
          { icon: "globe", title: "Customer Portal", text: "Client login for service status, files, invoices, support tickets, project milestones, and booking milestones." },
          { icon: "shield", title: "E-Commerce", text: "Product catalogs, offers, carts, payment flows, order status, and customer communication for masala and makhana brands." },
          { icon: "plane", title: "Booking Desk", text: "Travel bookings, astrology consultations, service appointments, confirmations, documents, and change requests." },
          { icon: "chart", title: "Analytics", text: "Dashboards for sales, operations, service quality, supplier performance, stock, orders, bookings, and management reporting." }
        ])}
      </div>
    </section>
    ${cta("Choose the modules that match your next growth stage.", "BANDEVI GLOBAL GROUP can shape the rollout around your team, market, and priorities.")}
  `;
}

function itPage() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>IT solutions for brands that need more than a brochure website.</h2>
          <p>From premium corporate websites to integrated portals, e-commerce, and automation, the delivery model is built to support both marketing and operations.</p>
        </div>
        ${cards([
          { icon: "globe", title: "Corporate websites", text: "Premium multi-page websites with product storytelling, lead paths, blogs, forms, and campaign-ready pages." },
          { icon: "stack", title: "Custom applications", text: "Dashboards, admin panels, portals, booking tools, order tools, workflows, and internal productivity systems." },
          { icon: "plane", title: "Business integrations", text: "Supplier APIs, payment gateways, CRM handoffs, email workflows, analytics, inventory tools, and third-party systems." },
          { icon: "shield", title: "Cloud and security", text: "Hosting, monitoring, backups, access control, SSL, security hygiene, and release management." },
          { icon: "chart", title: "Automation", text: "Reduce manual status updates, reminders, data movement, reporting, and lead routing." },
          { icon: "users", title: "Ongoing support", text: "Enhancement backlogs, training, documentation, support desks, and continuous improvement." }
        ])}
      </div>
    </section>
    <section class="section mist">
      <div class="container split">
        <div>
          <span class="eyebrow">Delivery approach</span>
          <h2>Launch polished, then keep improving.</h2>
          <p class="muted">The first release should establish credibility quickly. After launch, the same platform can support campaigns, integrations, internal tools, and portal features.</p>
          ${list(["Discovery and content architecture", "Premium UI direction and responsive page design", "CRM, ERP, commerce, and portal workflow planning", "Launch support, analytics, and enhancement roadmap"])}
        </div>
        <div class="media-frame"><img src="${heroImage}" alt="Global business operations environment"></div>
      </div>
    </section>
    ${cta("Build a digital presence that also improves operations.", "A strong business website should support sales, service, orders, bookings, and systems together.")}
  `;
}

const landingPages = {
  itProducts: {
    tag: "Products & software",
    title: "IT products and software solution packages for CRM, ERP, portals, e-commerce, travel tech, and automation.",
    intro: "BANDEVI GLOBAL GROUP packages its IT products into clear starting points, so clients can choose a website, CRM, ERP, customer portal, e-commerce, travel technology, astrology booking, automation, or dashboard rollout without guessing where to begin.",
    points: ["Website and digital presence packages for brands that need trust, lead capture, SEO-ready pages, and proof-backed company signals", "CRM, ERP, portal, booking, order, lead management, and automation packages for daily business control", "Industry software packages for travel, masala, makhana, astrology, e-commerce, service teams, multi-office groups, and global operations"],
    modules: [
      { icon: "users", title: "Travel CRM", text: "Capture enquiries, assign sales owners, track quotation stages, manage follow-ups, and improve conversion visibility." },
      { icon: "stack", title: "Travel ERP", text: "Control bookings, services, suppliers, invoices, payments, approvals, documents, and operational reporting." },
      { icon: "globe", title: "Customer Portal", text: "Give customers controlled access to service status, invoices, documents, support requests, booking updates, and project milestones." },
      { icon: "plane", title: "Booking & Order Desk", text: "Coordinate bookings, orders, consultations, packages, confirmations, documents, change requests, and service status." },
      { icon: "shield", title: "Websites & E-Commerce", text: "Launch premium corporate websites, complete travel websites, white-label travel websites, storefronts, masala or makhana catalogs, service pages, and search-friendly lead paths." },
      { icon: "chart", title: "Automation & Analytics", text: "Automate reminders, routing, reports, notifications, dashboards, and performance reviews." }
    ],
    process: ["Map business workflow", "Prioritize product modules", "Launch first release", "Improve with data"]
  },
  crmErp: {
    tag: "CRM & ERP development",
    title: "CRM development company and ERP software company for growing businesses.",
    intro: "BANDEVI GLOBAL GROUP builds CRM and ERP software for lead management, sales pipelines, customer records, operations, approvals, finance, dashboards, automation, travel CRM, travel ERP, and business workflow control.",
    points: ["CRM development for leads, enquiries, quotations, follow-ups, customer records, team assignment, source tracking, and dashboards", "ERP software development for operations, orders, bookings, suppliers, inventory, invoices, payments, approvals, documents, and reports", "Connected CRM and ERP systems that help sales, operations, finance, support, and management work from the same business truth", "Business automation, customer portals, website forms, WhatsApp actions, and reporting dashboards can be connected as the system grows"],
    modules: [
      { icon: "users", title: "CRM development", text: "Lead capture, enquiry routing, pipeline stages, quotation tracking, follow-up reminders, customer profiles, and sales dashboards." },
      { icon: "stack", title: "ERP software development", text: "Operations, task queues, booking files, orders, suppliers, inventory, finance, approvals, invoices, payments, and documents." },
      { icon: "chart", title: "Business dashboards", text: "Management views for pipeline health, workload, source quality, revenue, payments, margins, bottlenecks, and team performance." },
      { icon: "globe", title: "Website and portal connection", text: "Website forms, demo requests, WhatsApp handoff, customer portals, support desks, and document access connected to CRM and ERP." },
      { icon: "plane", title: "Travel CRM and ERP", text: "Travel-ready CRM and ERP for inquiries, quotations, itineraries, bookings, suppliers, customers, documents, payments, and reporting." },
      { icon: "shield", title: "Automation and access control", text: "Role-based access, workflow reminders, approvals, notifications, source tracking, handover records, and support-ready governance." }
    ],
    process: ["Map sales and operations", "Design CRM and ERP modules", "Build first release", "Train, support, and improve"]
  },
  ecommerce: {
    tag: "E-commerce development",
    title: "E-commerce website development company for online stores, catalogues, payments, orders, and CRM.",
    intro: "BANDEVI GLOBAL GROUP builds e-commerce websites and online store systems that connect storefront experience with product catalogues, cart and checkout, payment workflows, order management, inventory direction, customer CRM, dashboards, and campaigns.",
    points: ["E-commerce website development for online stores, product catalogues, product detail pages, offers, search, cart, and checkout", "Payment, order, inventory, customer account, WhatsApp, email, support, and notification workflows", "CRM-ready leads, distributor enquiries, bulk orders, repeat customer records, dashboards, and campaign reporting", "Masala, makhana, packaged food, retail, D2C, wholesale, service, and multi-brand commerce workflows"],
    modules: [
      { icon: "globe", title: "Online storefront", text: "Responsive category pages, product pages, search, offers, trust sections, enquiry paths, cart, and checkout journeys." },
      { icon: "shield", title: "Cart and payments", text: "Payment gateway planning, payment status, receipts, failed-payment handling, order confirmation, and finance visibility." },
      { icon: "stack", title: "Order operations", text: "Order status, dispatch notes, customer updates, returns direction, internal ownership, support requests, and reporting." },
      { icon: "users", title: "Customer CRM", text: "Customer accounts, distributor leads, WhatsApp enquiries, repeat orders, support history, follow-ups, and campaigns." },
      { icon: "plane", title: "Product catalogue", text: "Categories, variants, pack sizes, images, descriptions, offers, stock direction, bulk enquiry paths, and product visibility." },
      { icon: "chart", title: "Dashboards", text: "Sales, source quality, product interest, payment status, inventory direction, abandoned carts, and repeat-customer reports." }
    ],
    process: ["Structure catalogue", "Build storefront and cart", "Connect payments and CRM", "Launch, report, and improve"]
  },
  webApp: {
    tag: "Website and mobile app development",
    title: "Website development company and mobile app development company for business growth.",
    intro: "BANDEVI GLOBAL GROUP builds corporate websites, business websites, landing pages, web apps, mobile apps, portals, dashboards, travel websites, white-label travel websites, and SEO-ready digital systems.",
    points: ["Website development for corporate websites, business websites, landing pages, service pages, enquiry forms, SEO structure, WhatsApp actions, and trust sections", "Web app development for dashboards, admin panels, portals, workflow screens, role-based tools, reporting views, and internal systems", "Mobile app development for customer access, staff workflows, service status, notifications, portals, account views, and mobile-first experiences", "Travel website development, e-commerce websites, CRM-ready lead flows, ERP connection, automation, and analytics can be added as the business grows"],
    modules: [
      { icon: "globe", title: "Website development", text: "Corporate websites, service pages, landing pages, lead forms, proof sections, office pages, SEO metadata, analytics, and responsive layouts." },
      { icon: "stack", title: "Web app development", text: "Admin dashboards, role-based tools, workflow screens, reporting views, integrations, portals, and business software interfaces." },
      { icon: "phone", title: "Mobile app development", text: "Customer apps, staff apps, service apps, account access, notifications, mobile-first portals, and workflow screens." },
      { icon: "plane", title: "Travel website development", text: "Complete travel websites, white-label travel websites, destination pages, package pages, enquiry forms, WhatsApp handoff, and CRM-ready leads." },
      { icon: "shield", title: "Portal development", text: "Customer portals, partner portals, staff portals, document access, support desks, service status, invoices, and role-based access." },
      { icon: "chart", title: "Dashboards and SEO", text: "Business dashboards, analytics, source tracking, conversion paths, content structure, schema support, and post-launch improvement planning." }
    ],
    process: ["Plan pages and workflows", "Design website and app screens", "Build and connect systems", "Launch, measure, and improve"]
  },
  automation: {
    tag: "Business automation",
    title: "Business automation company for leads, workflows, CRM, ERP, and dashboards.",
    intro: "BANDEVI GLOBAL GROUP builds business automation for lead routing, follow-up reminders, CRM automation, ERP automation, WhatsApp workflows, email notifications, document requests, task queues, approvals, dashboards, and reporting.",
    points: ["Lead automation for website forms, demo requests, WhatsApp enquiries, campaigns, partners, branches, owner assignment, and source tracking", "Workflow automation for reminders, task routing, approvals, document requests, service status, support handoffs, and customer updates", "CRM and ERP automation for pipeline movement, operations tasks, invoice and payment status, booking or order updates, and management reports", "Dashboard automation for sales, workload, revenue, source quality, overdue actions, support tickets, turnaround time, and exception visibility"],
    modules: [
      { icon: "users", title: "Lead automation", text: "Route enquiries by source, service, branch, campaign, form, WhatsApp action, priority, and team owner with clear follow-up visibility." },
      { icon: "shield", title: "Workflow automation", text: "Trigger task queues, approvals, reminders, document requests, support handoffs, status updates, and internal notifications." },
      { icon: "message", title: "WhatsApp and email automation", text: "Plan communication flows for customer updates, payment reminders, booking notes, service status, document requests, and team alerts." },
      { icon: "stack", title: "CRM and ERP automation", text: "Connect sales, operations, finance, documents, approvals, invoices, bookings, orders, payments, and team tasks." },
      { icon: "globe", title: "Portal automation", text: "Link customer portals, staff portals, partner portals, support desks, file access, ticket routing, and controlled status views." },
      { icon: "chart", title: "Dashboard automation", text: "Generate management views for pipeline, workload, revenue, source quality, overdue actions, turnaround time, and exceptions." }
    ],
    process: ["Map repeated manual work", "Define triggers and owners", "Build controlled automation", "Measure, support, and improve"]
  },
  masala: {
    tag: "Masala & food products",
    title: "Digital systems for masala and food-product brands.",
    intro: "BANDEVI GLOBAL GROUP builds product websites, e-commerce stores, CRM, ERP, inventory, order workflows, distributor inquiry systems, and automation for masala and packaged food businesses.",
    points: ["Premium product website with brand story, categories, product detail pages, offers, and lead paths", "E-commerce, payment, order status, inventory, invoice, and customer communication workflows", "CRM and distributor inquiry tracking for bulk orders, retail partners, repeat customers, and campaigns"],
    modules: [
      { icon: "globe", title: "Product website", text: "Brand story, product catalog, categories, nutrition or usage details, trust sections, forms, and SEO-ready pages." },
      { icon: "shield", title: "Online store", text: "Cart, checkout, payment flow, offers, order confirmation, customer notifications, and repeat purchase paths." },
      { icon: "stack", title: "Order and stock control", text: "Inventory views, order status, supplier notes, invoices, dispatch stages, and internal dashboards." },
      { icon: "users", title: "CRM and distributor leads", text: "Capture retailer, distributor, bulk, and customer inquiries with ownership, follow-ups, and source reporting." },
      { icon: "chart", title: "Business dashboards", text: "Track product interest, order volume, campaign leads, conversion, stock movement, and customer response." },
      { icon: "message", title: "WhatsApp handoff", text: "Route website inquiries and order questions into a clean WhatsApp or sales-team response flow." }
    ],
    process: ["Structure product catalog", "Build store and CRM", "Connect orders and stock", "Launch campaigns"]
  },
  makhana: {
    tag: "Makhana brand",
    title: "Premium digital growth systems for makhana brands.",
    intro: "BANDEVI GLOBAL GROUP helps makhana brands create a premium web presence with product catalogs, e-commerce, bulk inquiry flows, CRM, payment paths, customer support, and management visibility.",
    points: ["Premium product pages for flavors, pack sizes, quality story, certifications, offers, and customer confidence", "Bulk inquiry and distributor lead capture for retail, corporate, gifting, and export conversations", "Order, payment, stock, customer follow-up, campaign, and dashboard systems built around daily operations"],
    modules: [
      { icon: "globe", title: "Premium brand website", text: "Modern pages for product range, quality promise, packaging, use cases, brand story, and contact paths." },
      { icon: "shield", title: "E-commerce and payments", text: "Online selling flows with cart, offers, checkout, payment status, notifications, and customer records." },
      { icon: "users", title: "Bulk inquiry CRM", text: "Capture distributor, retail, gifting, and B2B leads with follow-up ownership and conversation history." },
      { icon: "stack", title: "Inventory and operations", text: "Track product variants, stock status, orders, documents, invoices, and dispatch progress." },
      { icon: "chart", title: "Sales visibility", text: "Review best-performing products, lead sources, order value, repeat interest, and campaign response." },
      { icon: "message", title: "Customer communication", text: "Connect website forms, WhatsApp inquiries, email, status updates, and support requests." }
    ],
    process: ["Plan brand story", "Create product catalog", "Launch order flows", "Track growth"]
  },
  astrology: {
    tag: "Astrology services",
    title: "A professional digital platform for astrology consultation brands.",
    intro: "BANDEVI GLOBAL GROUP builds astrology websites, consultation booking flows, payment systems, WhatsApp lead capture, CRM, customer portals, reports, and service automation for astrology businesses.",
    points: ["Professional website for services, astrologer profile, consultation types, trust sections, blogs, and enquiry paths", "Booking, payment, calendar, WhatsApp, and consultation-status workflows for smoother service delivery", "Customer CRM, support history, report delivery, reminders, and portal access for a premium client experience"],
    modules: [
      { icon: "globe", title: "Astrology website", text: "Service pages for kundli, compatibility, career, business, marriage, vastu, numerology, and consultation categories." },
      { icon: "plane", title: "Consultation booking", text: "Slot requests, appointment forms, payment status, reminders, WhatsApp handoff, and admin review." },
      { icon: "users", title: "Customer CRM", text: "Client profiles, consultation history, follow-ups, notes, source tracking, and repeat-service opportunities." },
      { icon: "shield", title: "Reports and portal", text: "Controlled access for reports, documents, invoices, support questions, and service milestones." },
      { icon: "chart", title: "Service dashboards", text: "Monitor enquiries, bookings, revenue, service categories, pending follow-ups, and conversion." },
      { icon: "message", title: "Communication automation", text: "Automate confirmations, reminders, document requests, follow-up messages, and support routing." }
    ],
    process: ["Map services", "Build booking flow", "Connect payments and CRM", "Launch portal"]
  },
  travelWebsite: {
    tag: "Travel website development company",
    title: "Complete travel website and white-label travel website development for travel sellers.",
    intro: "BANDEVI GLOBAL GROUP builds travel websites for agencies, DMCs, tour operators, corporate travel desks, white-label sellers, partners, branches, and reseller networks that need stronger enquiry capture, destination content, package pages, WhatsApp leads, CRM handoff, SEO structure, and trust signals.",
    points: ["Complete travel websites with home, about, destination pages, package pages, service pages, enquiry forms, WhatsApp handoff, blogs, testimonials, trust sections, and analytics", "White-label travel websites for agencies, partners, branches, resellers, and franchise-style travel selling with controlled branding, source tracking, and lead flow", "Travel package pages, itinerary sections, destination guides, campaign landing pages, SEO-ready metadata, internal links, and Search Console readiness", "Optional Travel CRM handoff, booking workflow, customer portal, payment reminders, dashboards, automation, and support roadmap as the business grows"],
    modules: [
      { icon: "globe", title: "Complete travel website", text: "Home, about, destinations, packages, services, blogs, testimonials, enquiry forms, WhatsApp actions, contact paths, and analytics." },
      { icon: "shield", title: "White-label travel website", text: "Reusable travel website structures for agencies, partners, branches, franchise-style sellers, reseller businesses, and controlled branding." },
      { icon: "plane", title: "Package and destination pages", text: "Destination guides, package detail pages, itinerary highlights, inclusions, exclusions, FAQs, gallery sections, and enquiry actions." },
      { icon: "message", title: "Enquiry and WhatsApp capture", text: "Website forms, WhatsApp handoff, call buttons, campaign landing pages, source tracking, and CRM-ready lead records." },
      { icon: "chart", title: "SEO and blog setup", text: "Metadata, internal links, blog categories, schema support, analytics, Search Console readiness, and content paths for organic growth." },
      { icon: "stack", title: "CRM and booking handoff", text: "Connect qualified enquiries to Travel CRM, booking workflow, customer portal, dashboards, reporting, and automation when required." }
    ],
    process: ["Plan website and content", "Build pages and lead flow", "Connect CRM-ready enquiries", "Launch, submit, and improve"]
  },
  travelTech: {
    tag: "Travel technology company",
    title: "Travel technology company for Travel CRM, Travel ERP, complete websites, white-label websites, and booking systems.",
    intro: "BANDEVI GLOBAL GROUP builds travel technology for agencies, tour operators, DMCs, corporate travel desks, white-label sellers, and multi-office travel groups that need stronger website, sales, booking, supplier, customer, payment, and reporting control.",
    points: ["Complete travel websites with destination pages, package pages, enquiry forms, WhatsApp handoff, blogs, trust sections, analytics, and SEO-ready service paths", "White-label travel websites for agencies, partners, branches, resellers, and franchise-style travel selling", "Travel CRM for enquiries, trip interests, quotation stages, follow-ups, campaigns, source tracking, customers, and sales dashboards", "Travel ERP for booking files, passengers, suppliers, services, invoices, payments, documents, approvals, margins, and operations reports", "Customer portals, lead and booking management, automation, supplier workflows, payment reminders, and management dashboards"],
    modules: [
      { icon: "globe", title: "Complete travel website", text: "Destination pages, package pages, enquiry forms, blogs, social proof, WhatsApp actions, lead capture, analytics, and SEO structure." },
      { icon: "shield", title: "White-label website", text: "Brand-ready travel websites for agencies, partners, branches, resellers, controlled content, and lead-routing options." },
      { icon: "users", title: "Travel CRM", text: "Enquiries, trip interests, quotation stages, follow-up reminders, campaigns, customers, source tracking, and sales dashboards." },
      { icon: "stack", title: "Travel ERP", text: "Bookings, passengers, suppliers, invoices, payments, documents, approvals, margins, operations tasks, and reporting." },
      { icon: "plane", title: "Lead and booking workflow", text: "Move website, WhatsApp, phone, campaign, referral, and partner leads into quotation and booking control." },
      { icon: "chart", title: "Portal and dashboards", text: "Customer portals, document access, service status, support tickets, payment reminders, automation, and management views." }
    ],
    process: ["Audit travel workflow", "Prioritize website, CRM, and ERP", "Launch travel system", "Scale with automation and reporting"]
  },
  leadBooking: {
    tag: "Lead and booking management software",
    title: "Lead and booking management software for travel enquiries, quotations, and confirmed bookings.",
    intro: "BANDEVI GLOBAL GROUP builds lead and booking management software for travel agencies, tour operators, DMCs, corporate travel desks, white-label sellers, branch teams, and multi-office travel groups that need stronger enquiry control, quote follow-up, booking files, customer records, documents, payments, and reporting.",
    points: ["Travel lead management for website forms, WhatsApp enquiries, phone calls, campaigns, referrals, partners, branches, and reseller channels", "Quotation tracking with customer preferences, destination interest, budget direction, follow-up reminders, lost reasons, and sales ownership", "Booking management software for confirmed enquiries, passengers, services, suppliers, invoices, payments, documents, status updates, and operations handoff", "CRM, ERP, customer portal, automation, payment reminder, document request, and dashboard paths can be added as the travel business grows"],
    modules: [
      { icon: "users", title: "Travel lead desk", text: "Centralize website, WhatsApp, phone, campaign, referral, partner, branch, and reseller enquiries with owner assignment and source tracking." },
      { icon: "message", title: "Follow-up control", text: "Track callbacks, reminders, next actions, quotation stage, WhatsApp handoff, email notes, overdue leads, and customer response." },
      { icon: "plane", title: "Quotation workflow", text: "Manage destination interest, package requests, pax count, travel dates, budget direction, proposal versions, and lost reasons." },
      { icon: "stack", title: "Booking file management", text: "Create structured booking records with passengers, suppliers, services, itinerary notes, invoices, payments, documents, and status." },
      { icon: "shield", title: "CRM and ERP handoff", text: "Move qualified leads into Travel CRM and confirmed bookings into Travel ERP without losing customer context." },
      { icon: "chart", title: "Dashboards and reports", text: "Review source quality, response speed, quote-to-booking conversion, open booking workload, payments, and team performance." }
    ],
    process: ["Capture travel enquiry", "Qualify and quote", "Confirm booking file", "Track delivery and reports"]
  }
};

function landingPage(key) {
  const page = landingPages[key];
  const extraSections = key === "itProducts" ? itProductUpgradeSections() : key === "travelWebsite" ? travelWebsiteSeoSections() : key === "travelTech" ? travelTechSeoSections() : key === "leadBooking" ? leadBookingSeoSections() : key === "crmErp" ? crmErpSeoSections() : key === "ecommerce" ? ecommerceSeoSections() : key === "webApp" ? webAppSeoSections() : key === "automation" ? automationSeoSections() : "";
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">${page.tag}</span>
          <h2>${page.title}</h2>
          <p class="muted">${page.intro}</p>
          ${list(page.points)}
          <div class="inline-actions">
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="${contactInfo.phoneHref}">Call ${icons.phone}</a>
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="${page.title}"></div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>What this includes.</h2>
          <p>Each page focuses on a service area that can become a standalone project or part of a larger digital system.</p>
        </div>
        ${cards(page.modules)}
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">Delivery path</span>
          <h2>A simple path from idea to working system.</h2>
        </div>
        <div class="process">
          ${page.process.map((item, index) => `
            <div class="process-step">
              <span>0${index + 1}</span>
              <h3>${item}</h3>
              <p>Keep the rollout clear, controlled, and useful for the team that will use it every day.</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    ${extraSections}
    ${cta(`Discuss ${page.tag.toLowerCase()} for your business.`, "Share your current workflow and BANDEVI GLOBAL GROUP can map the right first release.")}
  `;
}

function travelWebsiteSeoSections() {
  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial search targets</span>
          <h2>Travel website services customers search before asking for a demo.</h2>
          <p>This page is structured for travel website development company, complete travel website, white-label travel website, travel agency website, tour operator website, DMC website, travel package website, destination website, travel enquiry website, and CRM-ready travel website searches.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>Complete site</strong><p>Home, about, destinations, packages, services, blogs, testimonials, enquiry forms, WhatsApp actions, contact paths, and analytics.</p></article>
          <article class="card metric-card"><strong>White-label</strong><p>Agency, partner, branch, franchise-style, and reseller-ready website structures with controlled branding and lead routing.</p></article>
          <article class="card metric-card"><strong>Lead flow</strong><p>Forms, WhatsApp, calls, campaign pages, source tracking, CRM-ready lead records, and follow-up handoff.</p></article>
          <article class="card metric-card"><strong>Growth</strong><p>SEO metadata, destination pages, package pages, blogs, schema support, analytics, Search Console, and content improvement.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel website modules</span>
          <h2>What BANDEVI can build into a travel website.</h2>
          <p>The first release can start with high-trust brand pages and package enquiries, then expand into Travel CRM, booking workflow, customer portal, automation, and dashboards.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Website area</th><th>What it can include</th></tr></thead>
            <tbody>
              ${travelWebsiteDevelopmentRows.map(([area, detail]) => `<tr><td>${area}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel segments</span>
          <h2>Travel websites for agencies, DMCs, tour operators, corporate desks, and reseller networks.</h2>
          <p>BANDEVI can shape the website around how each travel business earns trust, presents destinations, explains packages, captures enquiries, routes WhatsApp leads, and hands qualified prospects into CRM.</p>
        </div>
        <div class="grid cols-3">
          ${travelWebsiteIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed travel website company</span>
          <h2>Company strength signals behind travel website delivery.</h2>
          <p>Travel website buyers need confidence before sharing brand, package, destination, lead, customer, and sales workflow details. BANDEVI links this page with its public proof layer for verification.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and verification</h3>
              <p>The website links travel website service pages to the Company Profile, Proof & Verification page, Offices page, Staff Size & Net Worth page, and official company profile PDF.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>BANDEVI publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>Website project governance</h3>
              <p>Travel website work can include sitemap planning, page scope, package fields, enquiry paths, source tracking, access handover, analytics setup, Search Console support, and post-launch improvement planning.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before website planning</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "Company Profile PDF", "Official contact and demo request"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/travel-technology/">Travel Technology</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel website FAQ</span>
          <h2>Answers for complete travel website, white-label website, package page, and CRM-ready lead searches.</h2>
          <p>These answers help customers and search engines understand the travel website work BANDEVI can support.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${travelWebsiteFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start with the right website layer</h3>
            ${list(["Complete travel website", "White-label travel website", "Destination and package pages", "Enquiry and WhatsApp capture", "Travel CRM handoff", "SEO and blog setup"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function travelTechSeoSections() {
  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial search targets</span>
          <h2>Travel technology services customers search before choosing a system.</h2>
          <p>This page is structured for travel technology company, Travel CRM, Travel ERP, travel website development, complete travel website, white-label travel website, travel booking software, tour operator software, DMC software, customer portal, supplier workflow, and travel automation searches.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>Website</strong><p>Complete travel websites, white-label websites, destination pages, package pages, blogs, enquiry paths, and SEO-ready structure.</p></article>
          <article class="card metric-card"><strong>Travel CRM</strong><p>Enquiries, customers, quotations, follow-ups, campaigns, source tracking, consultant ownership, and sales dashboards.</p></article>
          <article class="card metric-card"><strong>Travel ERP</strong><p>Bookings, suppliers, passengers, invoices, payments, documents, approvals, margins, and operations reporting.</p></article>
          <article class="card metric-card"><strong>Automation</strong><p>Lead routing, reminders, document requests, payment alerts, customer portals, booking updates, and management dashboards.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel technology modules</span>
          <h2>What BANDEVI can build for travel businesses.</h2>
          <p>The first release can start with a complete travel website, Travel CRM, Travel ERP, or white-label website, then expand into portals, suppliers, payments, automation, and dashboards.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Travel technology area</th><th>What it can include</th></tr></thead>
            <tbody>
              ${travelTechDevelopmentRows.map(([area, detail]) => `<tr><td>${area}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel segments</span>
          <h2>Travel systems for agencies, operators, DMCs, corporate desks, and reseller networks.</h2>
          <p>BANDEVI can shape the travel technology stack around how each business captures enquiries, prepares quotations, confirms bookings, coordinates suppliers, collects documents, updates customers, and reviews performance.</p>
        </div>
        <div class="grid cols-3">
          ${travelTechIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed travel technology company</span>
          <h2>Company strength signals behind travel system delivery.</h2>
          <p>Travel technology touches customers, payments, documents, suppliers, booking files, staff ownership, and daily operations. BANDEVI connects this page with its public proof layer so buyers can verify the company before sharing workflow details.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and verification</h3>
              <p>The website links travel technology service pages to the Company Profile, Proof & Verification page, Offices page, Staff Size & Net Worth page, and official company profile PDF.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>BANDEVI publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>Travel project governance</h3>
              <p>Travel technology work can include scope notes, modules, fields, access roles, booking-flow rules, supplier workflow, payment status, customer communication, handover records, and support ownership.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before travel system planning</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "Company Profile PDF", "Official contact and demo request"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/staff-size-net-worth/">Staff & Net Worth</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    ${travelTechWebsiteLinksSection()}
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel technology FAQ</span>
          <h2>Answers for Travel CRM, Travel ERP, travel website, booking, portal, and automation searches.</h2>
          <p>These answers help customers and search engines understand the travel technology work BANDEVI can support.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${travelTechFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start with the right travel layer</h3>
            ${list(["Complete travel website", "White-label travel website", "Travel CRM", "Travel ERP", "Lead and booking workflow", "Customer portal and dashboards"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function leadBookingSeoSections() {
  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial search targets</span>
          <h2>Lead and booking management services travel companies search before choosing a system.</h2>
          <p>This page is structured for lead and booking management software, travel lead management software, travel booking management software, travel CRM lead management, quotation follow-up software, tour operator booking management, DMC lead management, WhatsApp lead management, and travel agency booking workflow searches.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>Lead capture</strong><p>Website forms, WhatsApp enquiries, phone calls, campaigns, referrals, partner leads, branch leads, source tracking, and owner assignment.</p></article>
          <article class="card metric-card"><strong>Quotation flow</strong><p>Destination interest, trip details, proposal versions, follow-up reminders, customer response, lost reasons, and sales-stage movement.</p></article>
          <article class="card metric-card"><strong>Booking files</strong><p>Confirmed enquiries, passengers, services, suppliers, itinerary notes, documents, invoices, payment status, and operations handoff.</p></article>
          <article class="card metric-card"><strong>Reporting</strong><p>Source quality, response speed, quote-to-booking conversion, open workload, payment visibility, team performance, and management dashboards.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Lead and booking modules</span>
          <h2>What BANDEVI can build into the lead-to-booking workflow.</h2>
          <p>The first release can start with a lead desk and quotation tracker, then expand into booking files, Travel CRM, Travel ERP, customer portals, document requests, payment reminders, automation, and dashboards.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Workflow area</th><th>What it can include</th></tr></thead>
            <tbody>
              ${leadBookingManagementRows.map(([area, detail]) => `<tr><td>${area}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Travel segments</span>
          <h2>Lead and booking workflows for agencies, operators, DMCs, corporate desks, and branch networks.</h2>
          <p>BANDEVI can shape the system around how each travel business receives enquiries, qualifies customers, sends quotations, confirms bookings, coordinates operations, collects documents, tracks payments, and reports performance.</p>
        </div>
        <div class="grid cols-3">
          ${leadBookingIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed software company</span>
          <h2>Company strength signals behind travel lead and booking delivery.</h2>
          <p>Lead and booking systems touch customers, revenue, documents, suppliers, payments, staff ownership, and daily operations. BANDEVI connects this page with its public proof layer so buyers can verify the company before sharing workflow details.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and verification</h3>
              <p>The website links lead and booking management pages to the Company Profile, Proof & Verification page, Offices page, Staff Size & Net Worth page, and official company profile PDF.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>BANDEVI publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>Workflow governance</h3>
              <p>Lead and booking projects can include source rules, lead fields, user roles, quote stages, booking status, supplier notes, payment status, document requests, handover records, access control, and support ownership.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before lead system planning</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "Company Profile PDF", "Official contact and demo request"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/staff-size-net-worth/">Staff & Net Worth</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Connected travel stack</span>
          <h2>Lead and booking management connects the website, CRM, ERP, portal, and automation roadmap.</h2>
          <p>This page is an important bridge between travel website enquiries and confirmed booking operations. It supports the wider SEO path for Travel CRM, Travel ERP, Travel Technology, Customer Portal, and Business Automation.</p>
        </div>
        <div class="grid cols-3">
          <a class="card" href="/travel-website-development/"><h3>Travel Website</h3><p>Capture enquiries from destination pages, package pages, WhatsApp actions, forms, campaigns, blogs, and trust sections.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/travel-crm/"><h3>Travel CRM</h3><p>Manage lead owners, quotation stages, follow-up reminders, customer records, source reports, and sales dashboards.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/travel-erp/"><h3>Travel ERP</h3><p>Move confirmed bookings into supplier coordination, documents, invoices, payments, approvals, margins, and operations reports.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/travel-technology/"><h3>Travel Technology</h3><p>Use the wider travel stack for websites, CRM, ERP, bookings, portals, suppliers, automation, and dashboards.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/customer-portal/"><h3>Customer Portal</h3><p>Give customers controlled access to booking status, documents, invoices, support requests, and updates.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/business-automation/"><h3>Business Automation</h3><p>Automate lead routing, follow-up reminders, document requests, payment alerts, status updates, and daily reports.</p><span>Open page ${icons.arrow}</span></a>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Lead and booking FAQ</span>
          <h2>Answers for travel lead management, quotation follow-up, booking workflow, and CRM/ERP handoff searches.</h2>
          <p>These answers help customers and search engines understand the lead and booking management work BANDEVI can support.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${leadBookingFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start with the right workflow layer</h3>
            ${list(["Travel lead desk", "Quotation tracking", "Follow-up reminders", "Booking file management", "CRM and ERP handoff", "Dashboards and reporting"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function ecommerceSeoSections() {
  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial search targets</span>
          <h2>E-commerce services customers search before building an online store.</h2>
          <p>This page is structured for e-commerce website development company, online store development, e-commerce platform development, product catalogue website, payment gateway integration, order management system, inventory dashboard, customer CRM, and D2C website searches.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>Storefront</strong><p>Online stores, product pages, category flows, search, offers, trust sections, cart, checkout, and conversion paths.</p></article>
          <article class="card metric-card"><strong>Payments</strong><p>Payment gateway planning, receipts, failed-payment handling, payment status, refunds direction, and finance visibility.</p></article>
          <article class="card metric-card"><strong>Operations</strong><p>Orders, stock direction, dispatch notes, customer updates, service requests, returns, internal owners, and support handoffs.</p></article>
          <article class="card metric-card"><strong>Growth</strong><p>CRM leads, distributor enquiries, campaign pages, repeat customers, WhatsApp follow-ups, dashboards, and reporting.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">E-commerce modules</span>
          <h2>What BANDEVI can build inside an e-commerce system.</h2>
          <p>The first release can start with a product catalogue and enquiry path, then expand into cart, checkout, payments, order management, CRM, inventory direction, dashboards, and automation.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>E-commerce area</th><th>What it can include</th></tr></thead>
            <tbody>
              ${ecommerceDevelopmentRows.map(([area, detail]) => `<tr><td>${area}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Industries</span>
          <h2>E-commerce workflows for product, retail, service, and group businesses.</h2>
          <p>BANDEVI can shape commerce around how each business presents products, receives orders, handles payments, follows up with customers, manages stock direction, and reviews performance.</p>
        </div>
        <div class="grid cols-3">
          ${ecommerceIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed e-commerce company</span>
          <h2>Company strength signals behind online store delivery.</h2>
          <p>E-commerce work touches products, prices, payments, customers, stock direction, support, and daily operations. BANDEVI connects this page with its public proof layer so buyers can verify the company before sharing commerce details.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and verification</h3>
              <p>The website links e-commerce service pages to the Company Profile, Proof & Verification page, Offices page, Staff Size & Net Worth page, and official company profile PDF.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>BANDEVI publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>Controlled commerce rollout</h3>
              <p>E-commerce projects can include catalogue scope, product fields, payment flow notes, order status rules, customer communication, access handover, support ownership, analytics, and post-launch improvement planning.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before commerce planning</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "Company Profile PDF", "Official contact and demo request"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/website-mobile-app-development/">Website & App Development</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">E-commerce FAQ</span>
          <h2>Answers for online store, product catalogue, payment, CRM, and order searches.</h2>
          <p>These answers help customers and search engines understand the e-commerce work BANDEVI can support.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${ecommerceFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start with the right store layer</h3>
            ${list(["Product catalogue and category pages", "Cart, checkout, and payments", "Order and stock direction", "Customer CRM and distributor leads", "Dashboards, campaigns, and automation"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function automationSeoSections() {
  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial search targets</span>
          <h2>Automation services that reduce manual work and missed follow-ups.</h2>
          <p>This page is structured for business automation company, workflow automation services, process automation, CRM automation, ERP automation, WhatsApp automation, lead automation, task automation, document request automation, and dashboard automation searches.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>Leads</strong><p>Form leads, WhatsApp enquiries, campaigns, referrals, branch enquiries, routing, ownership, and follow-up reminders.</p></article>
          <article class="card metric-card"><strong>Workflow</strong><p>Tasks, approvals, document requests, support handoffs, customer updates, status changes, and internal notifications.</p></article>
          <article class="card metric-card"><strong>CRM/ERP</strong><p>Pipeline actions, booking or order updates, invoice status, payment reminders, operations tasks, and management reports.</p></article>
          <article class="card metric-card"><strong>Dashboards</strong><p>Sales, workload, revenue, source quality, overdue actions, support tickets, turnaround time, and exceptions.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Automation modules</span>
          <h2>What BANDEVI can automate inside business workflows.</h2>
          <p>The first release can start with a small repeated workflow, then expand into connected CRM, ERP, portal, WhatsApp, dashboard, support, and reporting automation.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Automation area</th><th>What it can control</th></tr></thead>
            <tbody>
              ${automationDevelopmentRows.map(([area, detail]) => `<tr><td>${area}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Industries</span>
          <h2>Automation workflows for different business lines.</h2>
          <p>BANDEVI can shape automation around how each business receives enquiries, assigns work, updates customers, collects documents, tracks payments, and reviews performance.</p>
        </div>
        <div class="grid cols-3">
          ${automationIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed automation company</span>
          <h2>Company strength signals behind automation delivery.</h2>
          <p>Automation touches leads, customers, payments, documents, team ownership, and daily operations. BANDEVI links this service page with its public proof layer so buyers can verify the company before sharing workflow details.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and verification</h3>
              <p>The website links automation service pages to the Company Profile, Proof & Verification page, Offices page, Staff Size & Net Worth page, and official company profile PDF.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>BANDEVI publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>Controlled automation rollout</h3>
              <p>Automation work can include workflow maps, trigger rules, user roles, approval paths, message drafts, reporting fields, access handover, support ownership, and post-launch improvement planning.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before automation planning</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "Company Profile PDF", "Official contact and demo request"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/crm-erp-solutions/">CRM & ERP</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Business automation FAQ</span>
          <h2>Answers for workflow automation, CRM automation, and dashboard searches.</h2>
          <p>These answers help customers and search engines understand the automation work BANDEVI can support.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${automationFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start with one repeat workflow</h3>
            ${list(["Lead routing and assignment", "Follow-up reminders", "Document requests", "Task queues and approvals", "WhatsApp or email updates", "Dashboards and reports"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function webAppSeoSections() {
  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial search targets</span>
          <h2>Website, web app, and mobile app services customers search first.</h2>
          <p>This page is structured for website development company, business website development, corporate website development, mobile app development company, web app development company, landing page development, portal development, and dashboard development searches.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>Website</strong><p>Corporate websites, business websites, service pages, landing pages, enquiry paths, SEO structure, and trust sections.</p></article>
          <article class="card metric-card"><strong>Web app</strong><p>Dashboards, admin panels, role-based tools, workflow screens, portals, reporting views, and system interfaces.</p></article>
          <article class="card metric-card"><strong>Mobile app</strong><p>Customer apps, staff apps, service apps, account access, notifications, mobile-first portals, and workflow screens.</p></article>
          <article class="card metric-card"><strong>Growth</strong><p>CRM-ready leads, ERP connection, automation, analytics, Search Console support, and post-launch improvement.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Service modules</span>
          <h2>What BANDEVI can build for website and app projects.</h2>
          <p>The first release can start as a website, landing page, portal, web app, or mobile app, then expand into CRM, ERP, automation, dashboards, and customer access.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Service</th><th>What it includes</th></tr></thead>
            <tbody>
              ${webAppDevelopmentRows.map(([service, detail]) => `<tr><td>${service}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Industries</span>
          <h2>Website and app development for different business lines.</h2>
          <p>BANDEVI can shape the website, web app, mobile app, portal, and dashboard experience around how each business sells, supports, delivers, and reports.</p>
        </div>
        <div class="grid cols-3">
          ${webAppIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed web development company</span>
          <h2>Company strength signals behind website and app delivery.</h2>
          <p>Website and app buyers need confidence before sharing brand, customer, product, sales, and system details. BANDEVI connects its commercial service pages with the public proof layer for verification.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and verification</h3>
              <p>The website links this service page to the Company Profile, Proof & Verification page, Offices page, Staff Size & Net Worth page, and official company profile PDF.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>BANDEVI publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>Project clarity and handover</h3>
              <p>Website, web app, mobile app, portal, and dashboard projects can include scope notes, page lists, screen flows, access handover, analytics setup, support ownership, and post-launch improvement planning.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before starting</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "Company Profile PDF", "Official contact and demo request"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/crm-erp-solutions/">CRM & ERP</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Website and app FAQ</span>
          <h2>Answers for website, mobile app, web app, portal, and dashboard searches.</h2>
          <p>These answers help customers and search engines understand the website and app work BANDEVI can support.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${webAppFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start with the right release</h3>
            ${list(["Corporate website or landing page", "Web app, dashboard, or admin panel", "Mobile app or mobile-first portal", "Customer, staff, or partner portal", "CRM/ERP connection and automation"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function crmErpSeoSections() {
  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial search targets</span>
          <h2>CRM and ERP services customers search before they buy.</h2>
          <p>This page is structured for CRM development company, ERP software company, custom CRM software, ERP development, lead management software, operations management software, travel CRM, travel ERP, and business automation searches.</p>
        </div>
        <div class="grid cols-3">
          <article class="card metric-card"><strong>CRM</strong><p>Leads, enquiries, sales pipeline, quotations, follow-ups, customer profiles, source tracking, and reports.</p></article>
          <article class="card metric-card"><strong>ERP</strong><p>Operations, bookings, orders, suppliers, inventory, invoices, payments, approvals, documents, and tasks.</p></article>
          <article class="card metric-card"><strong>Automation</strong><p>Reminders, routing, notifications, approvals, document requests, status updates, and management dashboards.</p></article>
          <article class="card metric-card"><strong>Multi-office</strong><p>Branch ownership, role-based access, office-level reporting, staff queues, escalation paths, and shared management visibility.</p></article>
          <article class="card metric-card"><strong>Travel tech</strong><p>Travel CRM, travel ERP, itineraries, booking files, supplier coordination, customer documents, and payment tracking.</p></article>
          <article class="card metric-card"><strong>Proof</strong><p>1,289 staff worldwide, INR 7,594 Cr company-provided strength, and office-location proof linked from the website.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">CRM and ERP modules</span>
          <h2>What BANDEVI can build inside a CRM and ERP system.</h2>
          <p>The first release can start with the most urgent workflow, then expand into connected CRM, ERP, portal, automation, dashboard, and support modules.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Layer</th><th>Module</th><th>What it controls</th></tr></thead>
            <tbody>
              ${crmErpDevelopmentRows.map(([layer, module, detail]) => `<tr><td>${layer}</td><td>${module}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Industries</span>
          <h2>CRM and ERP workflows for different business lines.</h2>
          <p>BANDEVI can shape CRM and ERP around how each business sells, delivers, collects payments, manages documents, supports customers, and reviews performance.</p>
        </div>
        <div class="grid cols-3">
          ${crmErpIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section gold-band">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Connected software ecosystem</span>
          <h2>Internal paths that support CRM and ERP ranking.</h2>
          <p>CRM and ERP pages work better when related service pages explain the full customer journey: lead capture, booking or order control, customer access, automation, dashboards, and proof.</p>
        </div>
        <div class="grid cols-3">
          ${[
            { icon: "users", title: "Travel CRM", href: "/travel-crm/", text: "Lead capture, sales pipeline, quotations, follow-ups, customer records, and travel-specific conversion tracking." },
            { icon: "stack", title: "Travel ERP", href: "/travel-erp/", text: "Booking files, supplier coordination, invoices, payments, approvals, documents, and operations reporting." },
            { icon: "globe", title: "Lead & Booking Management", href: "/lead-booking-management/", text: "Website enquiries, WhatsApp handoff, lead ownership, booking status, reminders, and team accountability." },
            { icon: "shield", title: "Customer Portal", href: "/customer-portal/", text: "Customer access for documents, invoices, service updates, support requests, and controlled account views." },
            { icon: "chart", title: "Business Automation", href: "/business-automation/", text: "Task routing, approval flows, reminders, notifications, dashboard alerts, and workflow status automation." },
            { icon: "stack", title: "Proof & Verification", href: "/proof-verification/", text: "Public verification paths for company profile, staff size, net worth, offices, contact details, and official records." }
          ].map((item) => `
            <a class="card industry-card" href="${item.href}">
              ${iconTile(item.icon)}
              <h3>${item.title}</h3>
              <p>${item.text}</p>
              <span>Open page ${icons.arrow}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed software company</span>
          <h2>Company strength signals behind CRM and ERP delivery.</h2>
          <p>High-intent CRM and ERP buyers need confidence before discussing internal data, operations, finance, and customer systems. BANDEVI links service pages to its public proof layer for verification.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and verification</h3>
              <p>The website links CRM and ERP service pages to the Company Profile, Proof & Verification page, Offices page, Staff Size & Net Worth page, and official company profile PDF.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>BANDEVI publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>Project governance</h3>
              <p>CRM and ERP work can include scope notes, module lists, data fields, user roles, access handover, support ownership, reporting requirements, and post-launch improvement planning.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before sharing workflow details</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "Company Profile PDF", "Official contact and demo request"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/staff-size-net-worth/">Staff & Net Worth</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">CRM and ERP FAQ</span>
          <h2>Answers for CRM software, ERP development, and automation searches.</h2>
          <p>These answers help customers and search engines understand the CRM and ERP work BANDEVI can support.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${crmErpFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start with the right first module</h3>
            ${list(["Lead and enquiry control", "Sales pipeline and quotation stages", "Operations, approvals, and task workflows", "Finance, invoices, and payment tracking", "Dashboards, automation, and portals"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function travelTechWebsiteLinksSection() {
  const links = [
    {
      icon: "globe",
      title: "Travel Website Development",
      text: "Explore complete travel websites and white-label travel websites built for agencies, DMCs, operators, partners, and resellers.",
      href: "/travel-website-development/"
    },
    {
      icon: "users",
      title: "Travel CRM",
      text: "Move enquiries, quotations, follow-ups, campaigns, and customer history into a controlled sales workflow.",
      href: "/travel-crm/"
    },
    {
      icon: "stack",
      title: "Travel ERP",
      text: "Connect confirmed bookings with suppliers, services, invoices, payments, documents, and reporting.",
      href: "/travel-erp/"
    }
  ];

  return `
    <section class="section gold-band">
      <div class="container">
        <div class="section-head">
          <h2>Travel website and system options.</h2>
          <p>Start with the travel website, then connect CRM, ERP, portal, booking workflow, and reporting as the business grows.</p>
        </div>
        <div class="grid cols-3">
          ${links.map((item) => `
            <a class="card industry-card" href="${item.href}">
              ${iconTile(item.icon)}
              <h3>${item.title}</h3>
              <p>${item.text}</p>
              <span>Open page ${icons.arrow}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function itProductUpgradeSections() {
  return `
    ${productPackagesSection()}
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial product hub</span>
          <h2>A sales page for the complete BANDEVI product ecosystem.</h2>
          <p>Each product can launch independently, then connect into a larger operating system for websites, CRM, ERP, portals, travel technology, e-commerce, automation, service, finance, and leadership.</p>
        </div>
        <div class="grid cols-3">
          ${[
            ["Website products", "Corporate websites, travel websites, white-label travel websites, landing pages, SEO pages, enquiry paths, and proof sections."],
            ["CRM and ERP products", "Lead management, sales pipeline, operations workflows, booking files, order control, finance, approvals, and reports."],
            ["Portal products", "Customer portals, partner portals, staff portals, document access, invoices, support requests, and service status."],
            ["Automation products", "Task routing, reminders, approvals, notifications, dashboard alerts, WhatsApp handoff, and reporting automation."],
            ["Travel technology", "Travel CRM, Travel ERP, travel websites, booking management, supplier coordination, customer documents, and payment tracking."],
            ["Proof layer", "1,289 staff worldwide, INR 7,594 Cr company-provided strength, and 10 listed office and service-location references."]
          ].map(([title, text]) => `<article class="card metric-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section gold-band">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Priority product routes</span>
          <h2>Fast paths into the right BANDEVI product.</h2>
          <p>This hub sends buyers to the exact product page that matches their need, while keeping CRM, ERP, staff strength, net worth, offices, and proof connected.</p>
        </div>
        <div class="grid cols-3">
          ${[
            { icon: "users", title: "CRM & ERP Solutions", href: "/crm-erp-solutions/", text: "Custom CRM, ERP, lead management, sales pipeline, operations, finance, dashboards, and multi-office reporting." },
            { icon: "plane", title: "Travel CRM", href: "/travel-crm/", text: "Travel lead capture, quotation stages, follow-ups, customer records, sales ownership, and conversion visibility." },
            { icon: "stack", title: "Travel ERP", href: "/travel-erp/", text: "Bookings, suppliers, invoices, payments, approvals, documents, operations reports, and travel back-office control." },
            { icon: "globe", title: "Website & App Development", href: "/website-mobile-app-development/", text: "Corporate websites, landing pages, web apps, mobile-first portals, admin panels, and SEO-ready service pages." },
            { icon: "shield", title: "Customer Portal", href: "/customer-portal/", text: "Customer login, document access, invoices, booking or order status, support requests, and controlled account views." },
            { icon: "chart", title: "Business Automation", href: "/business-automation/", text: "Workflow automation for assignments, reminders, approvals, notifications, dashboards, and daily team control." },
            { icon: "globe", title: "E-Commerce Solutions", href: "/ecommerce-solutions/", text: "Storefronts, product catalogues, payment paths, order workflows, distributor enquiries, inventory direction, and CRM." },
            { icon: "plane", title: "Lead & Booking Management", href: "/lead-booking-management/", text: "Lead capture, booking files, source tracking, WhatsApp handoff, customer records, and operational visibility." },
            { icon: "shield", title: "Proof & Verification", href: "/proof-verification/", text: "Company profile, staff size, net worth, offices, official contact channels, and public proof links." }
          ].map((item) => `
            <a class="card industry-card" href="${item.href}">
              ${iconTile(item.icon)}
              <h3>${item.title}</h3>
              <p>${item.text}</p>
              <span>Open page ${icons.arrow}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container split reverse">
        <div class="media-frame"><img src="${heroImage}" alt="Global travel technology support network"></div>
        <div>
          <span class="eyebrow">Brand foundation</span>
          <h2>Informed by real sister-company operations.</h2>
          <p class="muted">BANDEVI GLOBAL GROUP is positioned as the IT and development company for a wider business family. THG remains a separate travel brand, while BANDEVI can also support masala, makhana, astrology, e-commerce, and service-led projects.</p>
          <p class="muted">That gives the software a stronger point of view: business systems must support trust, clear communication, documentation, faster coordination, payments, customer care, and reliable delivery across locations.</p>
          ${list(["Travel CRM and ERP modules remain available for travel-led workflows", "E-commerce and catalog systems for masala and makhana product brands", "Astrology websites, consultation booking, customer CRM, payment, and portal flows", "Premium website and portal design aligned with customer confidence", "Technology planning that understands real operations, not only generic business software"])}
        </div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed IT products</span>
          <h2>Company strength behind the product suite.</h2>
          <p>High-intent buyers compare product capability and company credibility together. BANDEVI keeps its public proof layer close to the software product pages.</p>
        </div>
        <div class="grid cols-3">
          <article class="card metric-card"><strong>1,289</strong><p>Company-provided current staff count across the worldwide operating and support ecosystem.</p></article>
          <article class="card metric-card"><strong>INR 7,594 Cr</strong><p>Company-provided current net worth and group strength figure for market-confidence context.</p></article>
          <article class="card metric-card"><strong>10 locations</strong><p>Listed office and service-location references across India, Dubai, London, and the United States.</p></article>
        </div>
        <div class="inline-actions">
          <a class="button primary" href="/staff-size-net-worth/">Staff & Net Worth ${icons.arrow}</a>
          <a class="button ghost" href="/offices/">Offices</a>
          <a class="button ghost" href="${companyProfilePdf}">Company Profile PDF</a>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Why choose BANDEVI GLOBAL GROUP.</h2>
          <p>Built around premium planning, transparent communication, documentation, support, and long-term trust across every business line.</p>
        </div>
        ${cards([
          { icon: "stack", title: "Business-domain understanding", text: "Products are planned around enquiries, quotations, orders, bookings, consultations, documents, suppliers, customers, requests, and service follow-ups." },
          { icon: "shield", title: "Professional documentation", text: "The delivery style supports clear scope, structured workflows, controlled handoffs, and cleaner records for daily teams." },
          { icon: "users", title: "Dedicated assistance", text: "Clients get a partner for launch planning, team adoption, training, refinements, and future module expansion." },
          { icon: "globe", title: "Separate brand structure", text: "Each project can stay separate with its own domain, content direction, workflow, access, and product roadmap." },
          { icon: "chart", title: "Management visibility", text: "Dashboards and reports help leadership see response speed, conversion quality, workload, order status, booking status, stock, and performance." },
          { icon: "stack", title: "Long-term product roadmap", text: "Start with the urgent workflow, then add CRM, ERP, portal, e-commerce, automation, and analytics without losing the core system." }
        ], 3)}
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">IT products FAQ</span>
          <h2>Answers for software product, package, CRM, ERP, and automation searches.</h2>
          <p>These answers help visitors and search engines understand the BANDEVI product suite before a demo request.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${itProductFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Best next demo paths</h3>
            ${list(["CRM + ERP Package", "Travel CRM and Travel ERP", "Customer Portal Package", "Automation Package", "Website + CRM Package"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Talk to Sales</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Office and service network.</h2>
          <p>The BANDEVI product story can support separate projects and service needs across India, Dubai, London, and the United States.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Location</th><th>Address</th></tr></thead>
            <tbody>
              ${officeLocations.map(([city, address]) => `<tr><td>${city}</td><td>${address}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="inline-actions">
          <a class="button primary" href="/contact-us/">Talk to Sales ${icons.arrow}</a>
          <a class="button ghost" href="/demo-request/">Request Demo</a>
        </div>
      </div>
    </section>
  `;
}

function productPackagesSection() {
  return `
    <section class="section mist" id="packages">
      <div class="container">
        <div class="section-head">
          <h2>Product and service packages.</h2>
          <p>Pick the package closest to your current business need. Timelines are typical starting ranges and can change based on content, integrations, approvals, and module depth.</p>
        </div>
        <div class="grid cols-3">
          ${productPackages.map((item) => `
            <article class="card case-card package-card">
              <div class="case-meta">
                ${iconTile(item.icon)}
                <span>${item.tag}</span>
              </div>
              <h3>${item.title}</h3>
              <div class="case-copy">
                <strong>Best for</strong>
                <p>${item.bestFor}</p>
              </div>
              <div class="case-copy">
                <strong>Included</strong>
                ${list(item.includes)}
              </div>
              <div class="case-copy">
                <strong>Add-ons</strong>
                <div class="pill-list">
                  ${item.addOns.map((addon) => `<span class="pill">${addon}</span>`).join("")}
                </div>
              </div>
              <div class="case-copy">
                <strong>Typical timeline</strong>
                <p>${item.timeline}</p>
              </div>
              <a href="${item.link}">Explore related solution ${icons.arrow}</a>
            </article>
          `).join("")}
        </div>
        <div class="inline-actions">
          <a class="button primary" href="/demo-request/">Request Package Demo ${icons.arrow}</a>
          <a class="button ghost" href="/contact-us/">Talk to Sales</a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>How to choose the right package.</h2>
          <p>The best first package is the one that fixes the most urgent sales, operations, trust, customer-service, or reporting problem.</p>
        </div>
        <div class="grid cols-4">
          ${[
            ["Need online trust?", "Start with a website, travel website, white-label website, or product-commerce package."],
            ["Need lead control?", "Start with CRM or a business website + CRM package so every enquiry has an owner and next action."],
            ["Need operations control?", "Start with CRM + ERP when orders, bookings, suppliers, documents, and payments need structure."],
            ["Need customer service control?", "Start with a portal or automation package to reduce repeated manual communication."]
          ].map(([title, text]) => `<article class="card metric-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
  `;
}

const caseStudies = [
  {
    icon: "globe",
    tag: "Travel website",
    title: "Complete travel website for a growing agency",
    challenge: "The agency needed a premium online presence that could explain destinations, packages, enquiry options, trust sections, blogs, and contact paths without looking like a generic brochure site.",
    solution: "Create a complete travel website structure with destination pages, package detail pages, itinerary highlights, WhatsApp handoff, enquiry forms, blog categories, social proof, and CRM-ready lead capture.",
    modules: ["Home and company pages", "Destination and package pages", "Enquiry and WhatsApp capture", "SEO and blog structure", "CRM-ready lead fields"],
    outcomes: ["Stronger first impression for travel prospects", "Clear package and destination storytelling", "Better enquiry data for sales follow-up", "A growth path into CRM, ERP, and portal modules"],
    result: "A travel brand can move from scattered enquiries to a polished website that captures useful lead details from day one.",
    link: "/travel-website-development/"
  },
  {
    icon: "shield",
    tag: "White-label travel",
    title: "White-label travel website model for partners and resellers",
    challenge: "A travel group needed a repeatable website model that could support agencies, partner brands, branches, or reseller teams while keeping branding and lead flow controlled.",
    solution: "Build a reusable white-label travel website structure with controlled brand sections, package content, enquiry routing, partner-ready pages, and future CRM handoff options.",
    modules: ["Reusable page structure", "Partner branding areas", "Package and service templates", "Lead routing", "Analytics and source tracking"],
    outcomes: ["Faster rollout for partner websites", "Consistent content and trust presentation", "Separate lead paths for each brand or branch", "Better control over partner growth campaigns"],
    result: "A white-label model helps travel sellers launch faster while keeping each brand separate and professional.",
    link: "/travel-website-development/"
  },
  {
    icon: "users",
    tag: "CRM + ERP",
    title: "Travel sales-to-operations control system",
    challenge: "Leads were arriving from website forms, calls, WhatsApp, referrals, and branch teams, while confirmed work needed cleaner booking, supplier, finance, and document control.",
    solution: "Create a connected CRM and ERP workflow with lead source capture, consultant ownership, quotation stages, booking files, supplier records, finance status, document tracking, and management dashboards.",
    modules: ["Lead queue", "Quotation stages", "Booking files", "Supplier records", "Invoice and payment status", "Management dashboards"],
    outcomes: ["Central lead queue for all enquiry sources", "Cleaner handoff from sales to operations", "Better booking and supplier visibility", "Source, conversion, payment, and margin reporting"],
    result: "The business can start with CRM and grow into ERP without losing the original lead and customer context.",
    link: "/crm-erp-solutions/"
  },
  {
    icon: "stack",
    tag: "Masala / food",
    title: "Masala and packaged food website with order visibility",
    challenge: "The brand needed a stronger product website with catalog pages, product trust sections, distributor enquiries, order interest, WhatsApp routing, and future e-commerce readiness.",
    solution: "Create a product-led website with categories, product pages, bulk inquiry forms, WhatsApp handoff, stock and order workflow planning, and CRM-ready distributor lead capture.",
    modules: ["Product catalog", "Bulk inquiry forms", "Distributor CRM fields", "Order workflow planning", "WhatsApp handoff", "SEO-ready product pages"],
    outcomes: ["Clearer product presentation", "Better distributor and bulk lead capture", "A path toward e-commerce and inventory control", "Professional brand experience for retail and B2B buyers"],
    result: "Food brands can use the website as both a trust builder and the first step toward digital order control.",
    link: "/masala-food-products/"
  },
  {
    icon: "globe",
    tag: "Makhana brand",
    title: "Makhana brand digital growth system",
    challenge: "The makhana brand needed premium product storytelling, online enquiry capture, bulk order interest, payments roadmap, product variants, and sales visibility.",
    solution: "Plan a premium website and digital system with product range pages, pack-size details, bulk enquiry capture, e-commerce readiness, customer records, and dashboard planning.",
    modules: ["Premium brand pages", "Product and pack-size catalog", "Bulk inquiry CRM", "E-commerce roadmap", "Customer communication", "Sales dashboard planning"],
    outcomes: ["Premium digital presence for a fast-growing product category", "Clear B2B and customer enquiry paths", "Better product and variant visibility", "Future-ready commerce and CRM structure"],
    result: "A makhana brand can look premium online while preparing the systems needed for repeat sales and distribution growth.",
    link: "/makhana-brand-solutions/"
  },
  {
    icon: "plane",
    tag: "Astrology platform",
    title: "Astrology consultation website with booking and CRM",
    challenge: "The astrology service needed a professional website that could explain services, capture consultation requests, manage payments or booking intent, and keep customer history organized.",
    solution: "Create an astrology services platform plan with service pages, consultation booking flow, WhatsApp capture, payment roadmap, CRM fields, report delivery, and customer portal options.",
    modules: ["Service pages", "Consultation booking", "WhatsApp lead capture", "Payment workflow", "Customer CRM", "Report and portal planning"],
    outcomes: ["More professional consultation journey", "Cleaner booking and enquiry capture", "Better customer follow-up history", "A roadmap for report delivery and portal access"],
    result: "Astrology brands can move from informal enquiries to a structured digital service experience.",
    link: "/astrology-services-platform/"
  },
  {
    icon: "shield",
    tag: "Customer portal",
    title: "Customer portal for documents, invoices, and support",
    challenge: "Customers needed easier access to service status, invoices, support messages, project updates, documents, and request history without repeated manual follow-ups.",
    solution: "Plan a secure portal with customer login, service status, invoice access, document downloads, support requests, project milestones, and notification workflows.",
    modules: ["Customer login", "Document access", "Invoice and payment status", "Support tickets", "Project milestones", "Notification workflow"],
    outcomes: ["Premium self-service customer experience", "Reduced repeated status questions", "Organized documents and invoice access", "Better support request history"],
    result: "A portal helps the company look more organized while reducing routine service communication pressure.",
    link: "/customer-portal/"
  },
  {
    icon: "chart",
    tag: "Automation",
    title: "Follow-up, task, and reporting automation rollout",
    challenge: "Manual reminders, document requests, internal handoffs, and daily reporting were slowing down sales, support, operations, and management review.",
    solution: "Automate lead routing, follow-up reminders, document request triggers, task queues, status notifications, WhatsApp or email handoff, and management summary reports.",
    modules: ["Lead routing", "Task reminders", "Document requests", "Status notifications", "Dashboard summaries", "Team handoff rules"],
    outcomes: ["Faster next-action visibility", "Fewer missed follow-ups", "More consistent customer communication", "Less manual report preparation"],
    result: "Automation gives teams a cleaner daily rhythm and gives leadership a better view of what needs attention.",
    link: "/business-automation/"
  }
];

function caseStudyCards(items = caseStudies) {
  return `<div class="grid cols-2">${items.map((item) => `
    <article class="card case-card">
      <div class="case-meta">
        ${iconTile(item.icon)}
        <span>${item.tag}</span>
      </div>
      <h3>${item.title}</h3>
      <div class="case-copy">
        <strong>Business challenge</strong>
        <p>${item.challenge}</p>
      </div>
      <div class="case-copy">
        <strong>Representative solution</strong>
        <p>${item.solution}</p>
      </div>
      ${item.modules ? `
        <div class="case-copy">
          <strong>Modules included</strong>
          <div class="pill-list">
            ${item.modules.map((module) => `<span class="pill">${module}</span>`).join("")}
          </div>
        </div>
      ` : ""}
      <div class="case-copy">
        <strong>Practical outcomes</strong>
        ${list(item.outcomes)}
      </div>
      ${item.result ? `
        <div class="case-copy result-copy">
          <strong>Business value</strong>
          <p>${item.result}</p>
        </div>
      ` : ""}
      <a href="${item.link}">Explore related solution ${icons.arrow}</a>
    </article>
  `).join("")}</div>`;
}

function casePreview() {
  return `
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Representative project examples.</h2>
          <p>See how websites, CRM, ERP, portals, e-commerce, booking workflows, and automation can support different BANDEVI service areas.</p>
        </div>
        ${caseStudyCards(caseStudies.slice(0, 3))}
        <div class="inline-actions">
          <a class="button dark" href="/case-studies/">View Case Studies ${icons.arrow}</a>
          <a class="button light" href="/demo-request/">Request Demo</a>
        </div>
      </div>
    </section>
  `;
}

function casesPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Representative work</span>
          <h2>Use-case stories for the systems modern brands ask for most.</h2>
          <p class="muted">These representative case studies show how BANDEVI GLOBAL GROUP can shape websites, CRM, ERP, portals, e-commerce, booking workflows, customer systems, and automation around real business needs.</p>
          ${list(["Travel sellers need complete websites, white-label websites, CRM, ERP, booking control, and portals", "Product brands need catalogs, e-commerce readiness, bulk enquiries, distributor CRM, and order visibility", "Service brands need booking flows, payment paths, customer history, documents, and support workflows", "Leadership needs dashboards that connect sales, service, revenue, workload, stock, margin, and customer experience"])}
          <div class="inline-actions">
            <a class="button dark" href="/demo-request/">Build a Similar System ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact Sales</a>
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="BANDEVI case study dashboard examples"></div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Case study examples.</h2>
          <p>Each example is written as a practical project model, so prospects can recognize their own workflow and choose the right first release.</p>
        </div>
        ${caseStudyCards()}
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <h2>Outcome map for BANDEVI projects.</h2>
          <p>The first release should solve a real business bottleneck, then create a path to expand into connected systems.</p>
        </div>
        <div class="grid cols-4">
          ${[
            ["Faster response", "Reduce delays between enquiry capture, owner assignment, first contact, quotation, booking, order, or consultation follow-up."],
            ["Cleaner handoffs", "Move confirmed work from sales to operations without losing customer, product, service, document, or supplier details."],
            ["Better visibility", "Track leads, packages, products, orders, bookings, payments, documents, support tickets, stock, and team workload."],
            ["Premium service", "Give customers a controlled digital experience with portal access, status updates, documents, invoices, and support history."]
          ].map(([title, text]) => `<div class="card metric-card"><strong>${title}</strong><p>${text}</p></div>`).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>How a similar project starts.</h2>
          <p>BANDEVI can begin with one urgent pain point and design a rollout that grows into a complete digital operating layer.</p>
        </div>
        <div class="process">
          ${[
            ["Audit", "Review your current lead sources, booking process, team roles, documents, reports, and customer communication."],
            ["Prioritize", "Choose the first release across CRM, ERP, portal, website, booking, automation, or dashboards."],
            ["Launch", "Build the core workflow, forms, pages, admin controls, reports, and team handoff process."],
            ["Expand", "Add integrations, customer portal features, automation, branch workflows, and advanced analytics."]
          ].map((item, index) => `
            <div class="process-step">
              <span>0${index + 1}</span>
              <h3>${item[0]}</h3>
              <p>${item[1]}</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    ${cta("Map your business case to the right platform release.", "Start with the bottleneck that is costing the most time, margin, or growth.")}
  `;
}

const blogArticles = [
  {
    key: "blogTravelCrm",
    slug: "travel-crm-software-for-agencies",
    tag: "Travel CRM",
    title: "Travel CRM Software for Agencies",
    description: "How travel agencies can use CRM software to capture leads, assign follow-ups, manage quotations, and improve booking conversion.",
    intro: "Travel agencies lose growth when enquiries sit in inboxes, WhatsApp chats, spreadsheets, and personal notebooks. A travel CRM gives the sales team one controlled place to capture every lead, understand the customer, follow up on time, and measure what is working.",
    highlights: ["Central enquiry capture from website, calls, WhatsApp, campaigns, and referrals", "Lead ownership, quotation stages, reminders, and customer history", "Visibility into source quality, response speed, lost reasons, and booking potential"],
    sections: [
      { title: "Why generic CRM is not enough", text: "Travel sales has its own rhythm. A customer may ask about destination, dates, budget, hotel category, visa help, flights, insurance, transfers, and payment options before confirming. A travel CRM should keep those details close to the lead record instead of forcing consultants into a generic sales pipeline.", bullets: ["Trip interest profile with destinations, dates, pax count, and budget", "Quotation stages for FIT, group, MICE, pilgrimage, and corporate requests", "Lost reason tracking for price, availability, response delay, or customer postponement"] },
      { title: "What a strong travel CRM should include", text: "The best CRM setup protects the enquiry from the first touch to the final booking handoff. It gives consultants daily clarity and gives owners visibility into performance.", bullets: ["Lead assignment and priority queues", "Follow-up reminders and next-action tracking", "Customer profile and communication notes", "Source, campaign, and conversion dashboards"] },
      { title: "How BANDEVI supports this", text: "BANDEVI GLOBAL GROUP builds CRM flows around the way travel teams actually work. The system can connect your website forms, WhatsApp handoff, quotation process, customer records, and reporting into one sales engine.", bullets: ["Website and demo forms connected to CRM-ready lead data", "Product modules for CRM, ERP, portal, and automation rollout", "Dashboards for leadership and daily team review"] }
    ],
    faqs: [
      ["What is travel CRM software?", "Travel CRM software helps agencies manage enquiries, customers, quotations, follow-ups, campaigns, sales ownership, and conversion reporting."],
      ["Can a small agency use travel CRM?", "Yes. A small agency can start with lead capture, follow-up tracking, customer profiles, and basic reports, then expand into ERP and portals later."],
      ["Does travel CRM connect with a website?", "Yes. Website contact forms, demo requests, campaign pages, and WhatsApp handoffs can feed structured lead details into the sales process."]
    ],
    links: [["Explore Travel CRM", "/travel-crm/"], ["Request Demo", "/demo-request/"]]
  },
  {
    key: "blogTravelErp",
    slug: "travel-erp-system-for-tour-operators",
    tag: "Travel ERP",
    title: "Travel ERP System for Tour Operators",
    description: "A practical guide to Travel ERP for tour operators managing bookings, suppliers, payments, documents, margins, and operations.",
    intro: "Tour operators need more than lead tracking. Once a trip is confirmed, the business must coordinate services, suppliers, passenger details, documents, invoices, payments, approvals, and delivery status. A Travel ERP turns that operational work into a controlled system.",
    highlights: ["Booking files for passenger, itinerary, service, and document details", "Supplier, payment, invoice, approval, and margin visibility", "Operations dashboards for confirmed work and delivery status"],
    sections: [
      { title: "Where tour operators lose control", text: "Operations become difficult when sales, supplier coordination, finance, and customer communication happen in separate tools. A confirmed booking should not become a scattered set of messages and spreadsheets.", bullets: ["Supplier confirmations stay outside the booking file", "Payments and invoices are checked manually", "Passenger documents are requested repeatedly", "Leadership cannot see margin and workload quickly"] },
      { title: "Core Travel ERP modules", text: "A good ERP should keep every confirmed booking organized from quote to closure. It should make team ownership, financial status, and supplier work easy to review.", bullets: ["Booking file management", "Supplier and service inventory", "Invoices, receipts, refunds, and credit notes", "Approval paths for discounts, exceptions, and payments"] },
      { title: "Why ERP and CRM should connect", text: "When CRM and ERP are joined, confirmed sales can move into operations without data loss. This makes the customer journey smoother and reduces repeated data entry.", bullets: ["Sales handoff from lead to booking", "Customer history carried into service delivery", "Revenue and margin reporting connected to sales source", "Better accountability from consultant to operations team"] }
    ],
    faqs: [
      ["What is Travel ERP?", "Travel ERP is an operations system for managing bookings, suppliers, services, documents, finance, approvals, and reporting in travel businesses."],
      ["Who needs Travel ERP?", "Tour operators, DMCs, travel agencies, consolidators, and corporate travel desks can use ERP when confirmed bookings need stronger control."],
      ["Can ERP start with only one module?", "Yes. Many businesses start with booking files or supplier coordination, then add finance, approvals, and reporting."]
    ],
    links: [["Explore Travel ERP", "/travel-erp/"], ["CRM & ERP Solutions", "/crm-erp-solutions/"]]
  },
  {
    key: "blogLeadBooking",
    slug: "lead-booking-management-for-travel-companies",
    tag: "Lead management",
    title: "Lead & Booking Management for Travel Companies",
    description: "How travel companies can connect lead capture, quotation tracking, booking files, follow-ups, and customer communication.",
    intro: "A travel business grows when it can move smoothly from enquiry to quotation, from quotation to confirmation, and from confirmation to service delivery. Lead and booking management connects those steps so nothing important disappears between teams.",
    highlights: ["Capture leads from website, WhatsApp, calls, campaigns, and partner channels", "Track quotation status, follow-ups, lost reasons, and sales ownership", "Convert confirmed enquiries into booking files with service and document details"],
    sections: [
      { title: "The gap between sales and operations", text: "Most problems happen in the handoff. Sales has the customer context, operations needs the service details, and finance needs the billing picture. A shared workflow keeps everyone aligned.", bullets: ["Lead owner and next action are clear", "Quotation stage is visible", "Confirmed booking creates an operations file", "Documents, payments, and suppliers are tracked together"] },
      { title: "What to measure", text: "Lead and booking management is not only about storage. It should help leadership see which sources convert, where delays happen, and which bookings need attention.", bullets: ["Response time by source", "Follow-up discipline by team", "Quote-to-booking conversion", "Open booking workload", "Lost reasons and revenue pipeline"] },
      { title: "How automation helps", text: "Automation can reduce repeated manual work. It can route enquiries, remind consultants, request documents, notify operations, and prepare reports.", bullets: ["Lead routing by service or source", "Follow-up reminders", "Document request triggers", "Booking status notifications", "Daily reporting summaries"] }
    ],
    faqs: [
      ["What is lead and booking management?", "It is the process of tracking enquiries, quotations, follow-ups, confirmations, booking files, documents, suppliers, and customer communication together."],
      ["Can WhatsApp enquiries be managed?", "Yes. WhatsApp handoffs can be structured so lead details are ready for the sales team instead of staying as loose chat messages."],
      ["Why connect lead and booking data?", "Connected data helps teams avoid duplicate work, missed details, delayed handoffs, and unclear ownership."]
    ],
    links: [["Lead & Booking Management", "/lead-booking-management/"], ["Request Demo", "/demo-request/"]]
  },
  {
    key: "blogCustomerPortal",
    slug: "customer-portal-for-travel-agencies",
    tag: "Customer portal",
    title: "Customer Portal for Travel Agencies",
    description: "Why travel agencies should use customer portals for trip status, invoices, documents, support requests, and premium service delivery.",
    intro: "Customers expect clear updates after they book. A customer portal gives them a controlled place to view trip status, invoices, documents, support requests, and milestones without repeatedly asking the team for the same information.",
    highlights: ["Trip status, invoices, receipts, vouchers, and document access", "Support requests and customer communication in one place", "A premium digital experience for leisure, corporate, and partner customers"],
    sections: [
      { title: "Why portals improve customer trust", text: "Travel involves many moving parts. When customers can see important updates in a portal, the agency feels more organized and premium.", bullets: ["Clear trip and service status", "Document availability in one place", "Invoice and receipt access", "Support request history", "Reduced repetitive status questions"] },
      { title: "Portal features to start with", text: "The first portal release does not need to be complicated. It should solve the most frequent customer communication problems.", bullets: ["Secure login", "Booking or trip dashboard", "Document and voucher section", "Invoices and payment status", "Support ticket form", "Profile and traveller details"] },
      { title: "How portals connect with CRM and ERP", text: "A customer portal becomes more useful when it reads from CRM and ERP records. Sales, operations, finance, and customers can work from the same truth.", bullets: ["CRM stores customer and enquiry history", "ERP stores booking, supplier, document, and invoice details", "Portal shows controlled customer-facing information", "Support requests flow back to the team"] }
    ],
    faqs: [
      ["What is a travel customer portal?", "It is a secure online area where customers can view trip details, documents, invoices, requests, and updates."],
      ["Can corporate clients use a portal?", "Yes. Corporate travel desks can use portals for traveller profiles, approvals, invoices, service requests, and reporting access."],
      ["Does a portal replace support?", "No. It supports the service team by reducing repeated requests and keeping communication organized."]
    ],
    links: [["Customer Portal", "/customer-portal/"], ["Explore Products", "/it-products/"]]
  },
  {
    key: "blogAutomation",
    slug: "business-automation-for-travel-companies",
    tag: "Automation",
    title: "Why Travel Companies Need Business Automation",
    description: "How business automation helps travel companies improve lead response, follow-ups, document requests, task routing, reports, and customer updates.",
    intro: "Travel teams handle many repeated actions every day: assigning leads, reminding consultants, requesting documents, updating customers, checking payments, and preparing reports. Business automation reduces the manual pressure so teams can focus on selling and serving.",
    highlights: ["Automated lead routing, reminders, task queues, and document requests", "Customer communication and booking status updates", "Reports for sales, workload, conversion, and service performance"],
    sections: [
      { title: "Where automation creates quick wins", text: "The best starting point is any repeated task that slows the team down or creates missed follow-ups.", bullets: ["Lead assignment from website forms", "Follow-up reminders after quotation", "Document request messages", "Payment status notifications", "Task routing to operations or support", "Daily management reports"] },
      { title: "Automation should support people", text: "Automation is not about removing the human touch. It should make consultants and support teams faster, clearer, and more consistent.", bullets: ["Keep important reminders visible", "Reduce repeated typing", "Make ownership clear", "Give customers timely updates", "Help managers see exceptions earlier"] },
      { title: "How to plan automation safely", text: "Automation works best when the business workflow is clear first. BANDEVI maps the current process, chooses useful triggers, and launches controlled automations that teams can understand.", bullets: ["Map current manual work", "Define trigger points", "Keep messages professional and brand-aligned", "Test with real team scenarios", "Review time saved and missed-task reduction"] }
    ],
    faqs: [
      ["What is business automation in travel?", "It is the use of workflows, reminders, notifications, routing, and reports to reduce repeated manual tasks in travel sales and operations."],
      ["Can automation work with CRM?", "Yes. CRM automation can assign leads, schedule follow-ups, track stages, and notify teams when action is needed."],
      ["What should be automated first?", "Start with lead routing, follow-up reminders, document requests, and daily reports because they usually create fast operational value."]
    ],
    links: [["Business Automation", "/business-automation/"], ["Request Demo", "/demo-request/"]]
  },
  {
    key: "blogCorporateWebsiteCrm",
    slug: "corporate-website-crm-for-travel-businesses",
    tag: "Website + CRM",
    title: "Corporate Website + CRM for Travel Businesses",
    description: "Why travel businesses should connect a premium corporate website with CRM to improve trust, lead capture, follow-up, and sales visibility.",
    intro: "A premium corporate website builds trust, but it becomes much more powerful when every enquiry flows into a CRM process. The website attracts and convinces; the CRM protects the lead and turns interest into follow-up discipline.",
    highlights: ["Premium service pages, product storytelling, trust sections, and demo paths", "Lead forms connected to structured sales follow-up", "Better visibility from website visitor to qualified enquiry"],
    sections: [
      { title: "What the website must prove", text: "Visitors quickly judge whether a travel technology or service brand feels credible. The website should make the offer clear, show the product ecosystem, and guide visitors toward a useful action.", bullets: ["Clear home, about, product, service, blog, contact, and demo pages", "Trust sections and office/service network", "Simple calls to action for WhatsApp, call, contact, and demo", "SEO structure for important service keywords"] },
      { title: "Why CRM should sit behind the website", text: "Without CRM, website enquiries can become scattered messages. With CRM, every form submission becomes a lead with context, ownership, and next action.", bullets: ["Lead source and page context", "Product interest and business type", "Preferred contact method", "Timeline and budget direction", "Follow-up reminders and sales reporting"] },
      { title: "The BANDEVI approach", text: "BANDEVI GLOBAL GROUP builds the website and the system story together. That means your pages, demo form, WhatsApp handoff, CRM fields, and reporting can all support the same sales process.", bullets: ["Premium corporate website design", "SEO pages for travel CRM, ERP, portal, automation, and IT services", "Demo and contact forms shaped for sales qualification", "Phased CRM, ERP, portal, and automation roadmap"] }
    ],
    faqs: [
      ["Why connect a website with CRM?", "It helps the business capture enquiries in a structured way, assign owners, follow up faster, and measure which pages or sources generate leads."],
      ["Can a website launch before CRM?", "Yes. A website can launch first with CRM-ready forms and WhatsApp handoffs, then connect deeper CRM workflows later."],
      ["What pages should a travel technology website include?", "Core pages include home, about, products, travel CRM, travel ERP, IT solutions, blog, contact, demo request, and customer portal."]
    ],
    links: [["Website & Mobile App Development", "/website-mobile-app-development/"], ["Explore Products", "/it-products/"]]
  }
];

const posts = blogArticles;

Object.assign(pageData, Object.fromEntries(blogArticles.map((article) => [
  article.key,
  {
    title: article.title,
    eyebrow: article.tag,
    lede: article.description
  }
])));

function blogPreview() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Travel technology insights.</h2>
          <p>Ideas for teams improving sales operations, booking control, digital service, and customer experience.</p>
        </div>
        ${blogCards(posts.slice(0, 3))}
      </div>
    </section>
  `;
}

function blogCards(items) {
  return `<div class="grid cols-3">${items.map((article) => `
    <article class="card blog-card">
      <time>${article.tag} guide</time>
      <h3>${article.title}</h3>
      <p>${article.description}</p>
      <a href="/blog/${article.slug}/">Read article ${icons.arrow}</a>
    </article>
  `).join("")}</div>`;
}

function blogPage() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Practical ideas for modern travel companies.</h2>
          <p>Use the blog to support SEO, educate prospects, and show the market that BANDEVI GLOBAL GROUP understands business systems, CRM, ERP, portals, automation, and digital operations.</p>
        </div>
        <div class="grid cols-3">
          ${posts.map((article) => `
            <article class="card blog-card" id="${article.slug}">
              <time>${article.tag}</time>
              <h3>${article.title}</h3>
              <p>${article.description}</p>
              <a href="/blog/${article.slug}/">Read article ${icons.arrow}</a>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    ${cta("Turn insights into qualified conversations.", "Use the blog as a sales asset linked to demo requests and product pages.")}
  `;
}

function blogArticlePage(key) {
  const article = blogArticles.find((item) => item.key === key) || blogArticles[0];
  return `
    <section class="section">
      <div class="container article-layout">
        <article class="article-body">
          <span class="eyebrow">${article.tag} guide</span>
          <h2>${article.title}</h2>
          <p class="muted article-intro">${article.intro}</p>
          ${list(article.highlights)}
          ${article.sections.map((section) => `
            <section class="article-block">
              <h3>${section.title}</h3>
              <p>${section.text}</p>
              ${list(section.bullets)}
            </section>
          `).join("")}
        </article>
        <aside class="article-aside card">
          <span class="eyebrow">Next step</span>
          <h3>Turn this guide into a working system.</h3>
          <p>Share your current workflow and BANDEVI GLOBAL GROUP can map the right website, CRM, ERP, portal, or automation release.</p>
          <div class="inline-actions">
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </div>
        </aside>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Frequently asked questions.</h2>
          <p>Short answers for business owners, sales leaders, operations teams, and travel technology buyers.</p>
        </div>
        <div class="grid cols-3">
          ${article.faqs.map(([question, answer]) => `
            <article class="card">
              <h3>${question}</h3>
              <p>${answer}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Related BANDEVI pages.</h2>
          <p>Continue from the article into the matching product, service, or demo path.</p>
        </div>
        <div class="grid cols-3">
          ${article.links.map(([label, href]) => `
            <article class="card blog-card">
              <time>Related page</time>
              <h3>${label}</h3>
              <p>Open the matching BANDEVI GLOBAL GROUP page and continue the conversation.</p>
              <a href="${href}">Open page ${icons.arrow}</a>
            </article>
          `).join("")}
          <article class="card blog-card">
            <time>Blog</time>
            <h3>More travel technology guides</h3>
            <p>Read more articles on CRM, ERP, portals, automation, websites, commerce, and digital operations.</p>
            <a href="/blog/">Back to blog ${icons.arrow}</a>
          </article>
        </div>
      </div>
    </section>
    ${cta("Build a stronger digital sales and operations engine.", "Use these SEO guides as the starting point for a real website, CRM, ERP, portal, or automation rollout.")}
  `;
}

function supportPage() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Support that keeps the platform useful after launch.</h2>
          <p>Clients can combine implementation help, user training, enhancement planning, monitoring, and ongoing platform care.</p>
        </div>
        ${cards([
          { icon: "users", title: "Implementation support", text: "Configuration, migration planning, user onboarding, workflow setup, and launch assistance." },
          { icon: "shield", title: "Managed care", text: "Issue triage, uptime checks, backups, access reviews, and scheduled maintenance." },
          { icon: "chart", title: "Enhancement roadmap", text: "Prioritize new features, integrations, reports, automations, and customer portal improvements." }
        ])}
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">Service levels</span>
          <h2>Support plans can scale with business criticality.</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Plan</th><th>Best for</th><th>Coverage</th><th>Focus</th></tr></thead>
            <tbody>
              <tr><td>Launch Care</td><td>New websites and first platform releases</td><td>Business hours</td><td>Stabilization, training, minor refinements</td></tr>
              <tr><td>Growth Care</td><td>CRM, ERP, and portal teams using the system daily</td><td>Priority queue</td><td>Enhancements, reports, automation, integrations</td></tr>
              <tr><td>Enterprise Care</td><td>High-volume business operations</td><td>Custom SLA</td><td>Monitoring, governance, security, roadmap management</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
    ${cta("Keep your digital systems moving with the business.", "Support can be planned from the first release rather than added after issues appear.")}
  `;
}

function contactForm(kind = "contact") {
  const demo = kind === "demo";
  const interestOptions = demo ? [
    "Product Package Consultation",
    "IT Products and Software Suite",
    "Starter Website Package",
    "Business Website + CRM Package",
    "Travel Website Package",
    "White-label Travel Website Package",
    "CRM + ERP Package",
    "CRM Development Demo",
    "ERP Software Demo",
    "Customer Portal Package",
    "Lead & Booking Management",
    "Masala / Makhana E-Commerce Package",
    "Astrology Booking Platform Package",
    "Automation Package",
    "CRM + ERP + Portal",
    "Travel Technology Suite",
    "Travel Website Development",
    "Complete Travel Website",
    "White-label Travel Website",
    "Masala / Food Product Website",
    "Makhana Brand Digital System",
    "Astrology Services Platform",
    "Travel CRM",
    "Travel ERP",
    "Customer Portal",
    "Corporate Website",
    "Website + Mobile App",
    "E-commerce Solution",
    "Business Automation",
    "Not sure yet"
  ] : [
    "Sales inquiry",
    "Demo request",
    "Product package consultation",
    "Starter website package",
    "Business website + CRM package",
    "Travel website package",
    "White-label travel website package",
    "CRM + ERP package",
    "Customer portal package",
    "Masala / makhana e-commerce package",
    "Astrology booking platform package",
    "Automation package",
    "Travel website development",
    "Complete travel website",
    "White-label travel website",
    "Masala / food product project",
    "Makhana brand project",
    "Astrology services project",
    "Travel CRM",
    "Travel ERP",
    "Customer portal",
    "Website or mobile app",
    "E-commerce solution",
    "Business automation",
    "Support or existing project",
    "Office or partnership"
  ];
  const timelineOptions = demo ? [
    "Immediately",
    "Within 15 days",
    "Within 30 days",
    "Within 60-90 days",
    "Planning for later"
  ] : [
    "Immediately",
    "Within 30 days",
    "Within 90 days",
    "Planning stage"
  ];

  return `
    <form class="form-panel" data-form="${kind}">
      <div class="form-grid">
        <div class="field">
          <label for="${kind}-name">Name</label>
          <input id="${kind}-name" name="name" autocomplete="name" required>
        </div>
        <div class="field">
          <label for="${kind}-company">Company</label>
          <input id="${kind}-company" name="company" autocomplete="organization" required>
        </div>
        <div class="field">
          <label for="${kind}-email">Email</label>
          <input id="${kind}-email" name="email" type="email" autocomplete="email" required>
        </div>
        <div class="field">
          <label for="${kind}-phone">Phone</label>
          <input id="${kind}-phone" name="phone" autocomplete="tel" ${demo ? "required" : ""}>
        </div>
        <div class="field">
          <label for="${kind}-interest">${demo ? "Package / product needed" : "Inquiry type"}</label>
          <select id="${kind}-interest" name="interest">
            ${optionList(interestOptions)}
          </select>
        </div>
        <div class="field">
          <label for="${kind}-business">Business type</label>
          <select id="${kind}-business" name="businessType">
            ${optionList(["IT or software project", "Masala / food products", "Makhana brand", "Astrology services", "Travel agency", "Tour operator", "DMC", "Corporate travel desk", "Multi-office or global team", "Hotel or supplier partner", "E-commerce or service business", "Other business"])}
          </select>
        </div>
        <div class="field">
          <label for="${kind}-timeline">Timeline</label>
          <select id="${kind}-timeline" name="timeline">
            ${optionList(timelineOptions)}
          </select>
        </div>
        <div class="field">
          <label for="${kind}-preferred">Preferred contact</label>
          <select id="${kind}-preferred" name="preferredContact">
            ${optionList(["WhatsApp", "Phone call", "Email", "Video meeting"])}
          </select>
        </div>
        ${demo ? `
          <div class="field">
            <label for="${kind}-scale">Team / branch scale</label>
            <select id="${kind}-scale" name="scale">
              ${optionList(["Single branch", "2-5 branches", "Multi-branch team", "Remote or global team", "Early stage business"])}
            </select>
          </div>
          <div class="field">
            <label for="${kind}-priority">Main priority</label>
            <select id="${kind}-priority" name="priority">
              ${optionList(["Need online presence", "Need better lead control", "Need CRM and ERP", "Need operations control", "Need customer portal", "Need travel technology", "Need automation", "Need full digital system"])}
            </select>
          </div>
          <div class="field">
            <label for="${kind}-budget">Budget range</label>
            <select id="${kind}-budget" name="budget">
              ${optionList(["Need guidance", "Under INR 50,000", "INR 50,000-1 lakh", "INR 1-3 lakh", "INR 3-10 lakh", "Enterprise / custom"])}
            </select>
          </div>
          <div class="field">
            <label for="${kind}-current">Current website / reference</label>
            <input id="${kind}-current" name="currentWebsite" placeholder="Optional link or reference">
          </div>
        ` : `
          <div class="field">
            <label for="${kind}-office">Office / region</label>
            <select id="${kind}-office" name="officeRegion">
              ${optionList(["Delhi", "Pune", "Gurgaon", "Mumbai", "Bangalore", "Kolkata", "Lucknow", "Dubai", "London", "United States", "Remote / online"])}
            </select>
          </div>
        `}
        <div class="field full">
          <label for="${kind}-message">${demo ? "Demo goals / current problem" : "Message"}</label>
          <textarea id="${kind}-message" name="message" placeholder="${demo ? "Example: We need CRM + ERP with website leads, WhatsApp enquiry flow, customer portal, dashboards, and multi-office reporting." : "Tell us what you want to discuss."}" required></textarea>
        </div>
      </div>
      <button class="button dark" type="submit">${demo ? "Send Demo Request" : "Send Message"} ${icons.arrow}</button>
      <p class="form-note" aria-live="polite"></p>
    </form>
  `;
}

function contactPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Contact</span>
          <h2>Contact BANDEVI GLOBAL GROUP for CRM, ERP, IT products, portals, websites, and automation.</h2>
          <p class="muted">Use the official phone, WhatsApp, email, contact form, or demo request path to reach the BANDEVI GLOBAL GROUP sales desk for CRM, ERP, Travel CRM, Travel ERP, customer portals, IT products, website projects, e-commerce, automation, office support, and implementation planning.</p>
          ${cards([
            { icon: "mail", title: "Sales desk", text: contactInfo.email },
            { icon: "phone", title: "Call or WhatsApp", text: contactInfo.phoneDisplay },
            { icon: "message", title: "Demo requests", text: "Use the demo path for CRM, ERP, IT product, portal, travel technology, website, and automation walkthroughs." },
            { icon: "globe", title: "Office network", text: "10 listed office and service-location references across India, Dubai, London, and the United States." },
            { icon: "users", title: "Staff ecosystem", text: "1,289 staff worldwide as currently provided by the company." },
            { icon: "shield", title: "Company strength", text: "INR 7,594 Cr current company-provided net worth and group strength figure." }
          ], 3)}
          <div class="inline-actions">
            <a class="button dark" href="${contactInfo.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ${icons.message}</a>
            <a class="button light" href="${contactInfo.phoneHref}">Call ${icons.phone}</a>
            <a class="button light" href="/demo-request/">Request Demo</a>
            <a class="button light" href="/proof-verification/">Verify Proof</a>
          </div>
        </div>
        ${contactForm("contact")}
      </div>
    </section>
    <section class="section gold-band">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Official contact routes</span>
          <h2>Choose the right contact path.</h2>
          <p>Contact requests work better when they are routed to the right product, proof, demo, office, or support path from the start.</p>
        </div>
        <div class="grid cols-3">
          ${[
            { icon: "stack", title: "IT Products", href: "/it-products/", text: "Review website, CRM, ERP, portal, commerce, travel tech, automation, and dashboard packages before contacting." },
            { icon: "users", title: "CRM & ERP", href: "/crm-erp-solutions/", text: "Discuss CRM development, ERP software, lead management, operations, finance, dashboards, and multi-office reporting." },
            { icon: "message", title: "Demo Request", href: "/demo-request/", text: "Request a focused walkthrough for CRM, ERP, portals, Travel CRM, Travel ERP, websites, automation, and dashboards." },
            { icon: "plane", title: "Travel CRM", href: "/travel-crm/", text: "Contact for travel leads, quotation stages, follow-ups, customer records, and travel sales visibility." },
            { icon: "stack", title: "Travel ERP", href: "/travel-erp/", text: "Contact for booking operations, suppliers, invoices, payments, documents, approvals, and travel reporting." },
            { icon: "shield", title: "Customer Portal", href: "/customer-portal/", text: "Discuss customer login, documents, invoices, service status, support requests, and controlled account access." },
            { icon: "chart", title: "Business Automation", href: "/business-automation/", text: "Discuss lead routing, reminders, task assignment, approvals, document requests, alerts, and dashboards." },
            { icon: "globe", title: "Offices", href: "/offices/", text: "View Delhi, Pune, Gurgaon, Mumbai, Bangalore, Kolkata, Lucknow, Dubai, London, and United States references." },
            { icon: "shield", title: "Proof & Verification", href: "/proof-verification/", text: "Verify company profile, staff size, net worth, office references, official phone, email, and proof links." }
          ].map((item) => `
            <a class="card industry-card" href="${item.href}">
              ${iconTile(item.icon)}
              <h3>${item.title}</h3>
              <p>${item.text}</p>
              <span>Open page ${icons.arrow}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Public verification before contact</span>
          <h2>Official contact details backed by company proof.</h2>
          <p>Before discussing customer records, finance workflows, travel operations, CRM/ERP access, or internal dashboards, visitors can verify BANDEVI's public company facts and official contact channels.</p>
        </div>
        <div class="grid cols-3">
          <article class="card metric-card"><strong>${contactInfo.phoneDisplay}</strong><p>Official phone and WhatsApp route for sales, demos, project enquiries, and support routing.</p></article>
          <article class="card metric-card"><strong>${contactInfo.email}</strong><p>Official email for CRM, ERP, portals, websites, e-commerce, automation, IT products, and office-support enquiries.</p></article>
          <article class="card metric-card"><strong>1,289</strong><p>Company-provided current staff count across the worldwide operating and support ecosystem.</p></article>
          <article class="card metric-card"><strong>INR 7,594 Cr</strong><p>Company-provided current net worth and group strength figure for public confidence and market context.</p></article>
          <article class="card metric-card"><strong>10 locations</strong><p>Listed office and service-location references across India, Dubai, London, and the United States.</p></article>
          <article class="card metric-card"><strong>Official domain</strong><p>Use bandeviglobalgroup.com, the company profile PDF, proof page, and official social profiles for verification.</p></article>
        </div>
        <div class="inline-actions">
          <a class="button primary" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
          <a class="button ghost" href="/staff-size-net-worth/">Staff & Net Worth</a>
          <a class="button ghost" href="${companyProfilePdf}">Company Profile PDF</a>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Office and service locations.</h2>
          <p>Choose the nearest office or request remote support. The sales team can route your enquiry to the right project, product, or support desk.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Location</th><th>Address</th></tr></thead>
            <tbody>
              ${officeLocations.map(([city, address]) => `<tr><td>${city}</td><td>${address}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">Response flow</span>
          <h2>What happens after you contact us.</h2>
        </div>
        <div class="process">
          ${[
            ["Receive", "Your enquiry is captured with product interest, business type, office region, and contact preference."],
            ["Review", "The sales team reviews whether you need CRM, ERP, portal, website, e-commerce, automation, or support help."],
            ["Connect", "A callback, WhatsApp reply, or email response is prepared with the next action."],
            ["Plan", "If needed, the team schedules a demo or discovery conversation around your workflow."]
          ].map((item, index) => `
            <div class="process-step">
              <span>0${index + 1}</span>
              <h3>${item[0]}</h3>
              <p>${item[1]}</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Contact FAQ</span>
          <h2>Answers for contact, phone, WhatsApp, email, office, CRM, ERP, and demo searches.</h2>
          <p>These answers help visitors and search engines understand how to contact BANDEVI through official channels.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${contactFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Official contact checklist</h3>
            ${list(["Phone and WhatsApp: +91 8287669022", "Email: sales@bandeviglobalgroup.com", "Website: bandeviglobalgroup.com", "Use demo request for product walkthroughs", "Use proof page for staff, net worth, and offices"])}
            <a class="button dark" href="${contactInfo.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ${icons.message}</a>
            <a class="button light" href="/demo-request/">Request Demo</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function demoPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Demo request</span>
          <h2>Request a CRM, ERP, portal, IT product, travel tech, website, or automation demo.</h2>
          <p class="muted">Use this page to choose the closest package, explain your current problem, and send a clean WhatsApp-ready lead message to the BANDEVI sales team.</p>
          ${list(["Select a CRM, ERP, customer portal, IT product, travel technology, website, e-commerce, astrology, or automation package", "Share business type, timeline, team scale, priority, budget direction, and current website or reference", "Ask for a focused demo around lead control, sales pipeline, operations, finance, customer access, dashboards, or automation", "Verify company profile, staff size, net worth, offices, and proof links before discussing internal workflows"])}
          <div class="inline-actions">
            <a class="button dark" href="#demo-form">Start Demo Request ${icons.arrow}</a>
            <a class="button light" href="/it-products/#packages">View Packages</a>
            <a class="button light" href="/proof-verification/">Verify BANDEVI</a>
          </div>
        </div>
        <div id="demo-form">
          ${contactForm("demo")}
        </div>
      </div>
    </section>
    <section class="section gold-band">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Choose demo focus</span>
          <h2>Fast demo paths for BANDEVI products and systems.</h2>
          <p>Start with the closest product, then the sales team can narrow the walkthrough around your actual business workflow.</p>
        </div>
        <div class="grid cols-3">
          ${[
            { icon: "users", title: "CRM & ERP Demo", href: "/crm-erp-solutions/", text: "Lead management, sales pipeline, operations workflows, finance, approvals, documents, dashboards, and multi-office reporting." },
            { icon: "stack", title: "IT Products Demo", href: "/it-products/", text: "Website packages, CRM, ERP, customer portals, e-commerce, automation, travel tech, dashboards, and software suite planning." },
            { icon: "plane", title: "Travel CRM Demo", href: "/travel-crm/", text: "Travel enquiries, quotation stages, customer records, follow-ups, sales owners, source tracking, and conversion reports." },
            { icon: "stack", title: "Travel ERP Demo", href: "/travel-erp/", text: "Bookings, suppliers, invoices, payments, approvals, documents, margins, operations tasks, and travel reporting." },
            { icon: "shield", title: "Customer Portal Demo", href: "/customer-portal/", text: "Customer login, documents, invoices, support requests, booking or order status, service updates, and controlled access." },
            { icon: "chart", title: "Automation Demo", href: "/business-automation/", text: "Lead routing, reminders, task assignment, approvals, document requests, notifications, and dashboard automation." },
            { icon: "globe", title: "Website & App Demo", href: "/website-mobile-app-development/", text: "Corporate websites, landing pages, web apps, mobile-first portals, admin panels, and CRM-ready lead flows." },
            { icon: "plane", title: "Lead & Booking Demo", href: "/lead-booking-management/", text: "Website enquiries, WhatsApp handoff, booking files, source tracking, follow-ups, customer records, and team visibility." },
            { icon: "shield", title: "Proof & Verification", href: "/proof-verification/", text: "Review company profile, staff size, net worth, offices, official contact channels, and public proof links." }
          ].map((item) => `
            <a class="card industry-card" href="${item.href}">
              ${iconTile(item.icon)}
              <h3>${item.title}</h3>
              <p>${item.text}</p>
              <span>Open page ${icons.arrow}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Select the package closest to your requirement.</h2>
          <p>You can choose one in the form, or use these cards to understand the best starting point before submitting.</p>
        </div>
        <div class="grid cols-3">
          ${productPackages.map((item) => `
            <article class="card case-card package-card">
              <div class="case-meta">
                ${iconTile(item.icon)}
                <span>${item.tag}</span>
              </div>
              <h3>${item.title}</h3>
              <p>${item.bestFor}</p>
              <div class="pill-list">
                ${item.addOns.slice(0, 3).map((addon) => `<span class="pill">${addon}</span>`).join("")}
              </div>
              <a href="${item.link}">Related solution ${icons.arrow}</a>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <h2>What your demo can cover.</h2>
          <p>The walkthrough can focus on one urgent problem or show how the full BANDEVI product suite connects across the business.</p>
        </div>
        ${cards([
          { icon: "globe", title: "Website and package plan", text: "Pages, content structure, package or product display, enquiry paths, WhatsApp handoff, SEO basics, and trust sections." },
          { icon: "users", title: "Lead and sales flow", text: "Website enquiries, assignment, follow-ups, quotation stages, customer records, source tracking, and sales visibility." },
          { icon: "stack", title: "Operations flow", text: "Orders, bookings, consultations, suppliers, service items, documents, approvals, invoices, stock, and status tracking." },
          { icon: "shield", title: "Portal and service flow", text: "Customer access for updates, invoices, documents, tickets, project milestones, booking status, and service communication." },
          { icon: "chart", title: "Automation and dashboards", text: "Reminders, lead routing, document requests, reporting summaries, conversion, workload, revenue, and support visibility." },
          { icon: "message", title: "WhatsApp-first routing", text: "The submitted request opens as a structured WhatsApp message so the team can respond with the right context." }
        ], 4)}
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof before the demo</span>
          <h2>Verify BANDEVI before sharing project details.</h2>
          <p>Demo requests can involve customer records, sales workflows, finance status, travel operations, documents, access control, and internal reporting. BANDEVI keeps public proof links close to the demo path.</p>
        </div>
        <div class="grid cols-3">
          <article class="card metric-card"><strong>1,289</strong><p>Company-provided current staff count across the worldwide operating and support ecosystem.</p></article>
          <article class="card metric-card"><strong>INR 7,594 Cr</strong><p>Company-provided current net worth and group strength figure for public confidence and market context.</p></article>
          <article class="card metric-card"><strong>10 locations</strong><p>Listed office and service-location references across India, Dubai, London, and the United States.</p></article>
        </div>
        <div class="inline-actions">
          <a class="button primary" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
          <a class="button ghost" href="/staff-size-net-worth/">Staff & Net Worth</a>
          <a class="button ghost" href="/offices/">Offices</a>
          <a class="button ghost" href="${companyProfilePdf}">Company Profile PDF</a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">Next steps</span>
          <h2>A simple path after the request.</h2>
        </div>
        <div class="process">
          ${[
            ["Submit", "Your request captures package interest, business type, team scale, priority, timeline, budget, and contact preference."],
            ["Route", "The form prepares a WhatsApp and email lead message so the sales team receives the request with proper context."],
            ["Review", "BANDEVI reviews whether you need a website, CRM, ERP, portal, e-commerce, automation, or a complete first release."],
            ["Plan", "You receive a practical next step: demo focus, first-release scope, timeline direction, and launch priorities."]
          ].map((item, index) => `
            <div class="process-step">
              <span>0${index + 1}</span>
              <h3>${item[0]}</h3>
              <p>${item[1]}</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Before you submit, this helps us respond faster.</h2>
          <p>You do not need everything ready, but these details help the team suggest the right package and first release.</p>
        </div>
        <div class="grid cols-4">
          ${[
            ["Current stage", "New website, redesign, CRM setup, ERP workflow, portal, e-commerce, or automation improvement."],
            ["Business type", "Travel, masala, makhana, astrology, e-commerce, service business, corporate desk, or other project."],
            ["Urgent problem", "Lead loss, weak website, manual operations, missing documents, repeated follow-ups, or low visibility."],
            ["Launch direction", "Immediate launch, 15-day plan, 30-day plan, 60-90 day roadmap, or early planning."]
          ].map(([title, text]) => `<article class="card metric-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Demo request FAQ.</h2>
          <p>Quick answers for prospects before they send a package or platform request.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${demoRequestFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Good demo details</h3>
            ${list(["Product or package needed", "Business type and team scale", "Main priority and timeline", "Budget direction", "Current website or reference"])}
            <a class="button dark" href="#demo-form">Start Demo Request ${icons.arrow}</a>
            <a class="button light" href="/it-products/">View IT Products</a>
          </aside>
        </div>
      </div>
    </section>
    ${cta("A good demo should feel like your business.", "Share your workflow and BANDEVI can focus the walkthrough on the package, modules, and first release that matter most.")}
  `;
}

function portalPage() {
  return `
    <section class="section">
      <div class="container portal-panel">
        <div class="portal-preview" aria-label="Customer portal preview">
          <div class="portal-preview-head">
            <span class="dot"></span><strong>Customer Portal Software Dashboard</strong>
          </div>
          <div class="portal-grid">
            ${[
              ["Bookings", "Trip, project, order, and service status", "gold"],
              ["Invoices", "Receipts, dues, refunds, and statements", ""],
              ["Documents", "Vouchers, tickets, reports, and files", ""],
              ["Support", "Requests, responses, and priority updates", "gold"],
              ["Payments", "Payment status, reminders, and finance notes", ""],
              ["Profile", "Customer, traveller, or partner details", ""]
            ].map(([title, text, tone]) => `
              <div class="portal-cell">
                <strong>${title}</strong>
                <span class="muted">${text}</span>
                <div class="bar ${tone}"></div>
                <div class="bar"></div>
              </div>
            `).join("")}
          </div>
        </div>
        <form class="form-panel" data-form="portal">
          <span class="eyebrow">Portal sign in concept</span>
          <h2>Customer access</h2>
          <p class="muted">A customer portal can connect with CRM, ERP, booking files, invoices, documents, payments, and support records for customers, corporate clients, partners, or travellers.</p>
          <div class="form-grid">
            <div class="field full">
              <label for="portal-email">Email</label>
              <input id="portal-email" type="email" autocomplete="email" required>
            </div>
            <div class="field full">
              <label for="portal-password">Password</label>
              <input id="portal-password" type="password" autocomplete="current-password" required>
            </div>
          </div>
          <button class="button dark" type="submit">Continue ${icons.arrow}</button>
          <p class="form-note" aria-live="polite"></p>
        </form>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Portal capabilities.</h2>
          <p>Customer portal software strengthens service quality while reducing repetitive manual communication about bookings, invoices, documents, payments, and support.</p>
        </div>
        ${cards([
          { icon: "shield", title: "Controlled access", text: "Role-based access to booking details, project records, documents, invoices, receipts, support history, and profile details." },
          { icon: "plane", title: "Booking visibility", text: "Customers can follow trip status, service status, project milestones, order updates, schedules, and important notes." },
          { icon: "stack", title: "Document center", text: "Organize vouchers, tickets, visa notes, reports, invoices, receipts, forms, uploaded files, and handover documents." },
          { icon: "message", title: "Support desk", text: "Structured requests give customers clarity and give teams a cleaner service queue with category, priority, and response history." },
          { icon: "users", title: "CRM and ERP connection", text: "Customer portal views can connect with CRM customer records, ERP booking files, finance status, documents, and team workflows." },
          { icon: "chart", title: "Management dashboard", text: "Track open requests, document status, unpaid invoices, service turnaround, portal activity, and workload signals." }
        ])}
      </div>
    </section>
    ${portalSeoSections()}
    ${cta("Add customer portal access to your premium service experience.", "A polished portal helps customers see bookings, documents, invoices, support updates, and service progress without repeated manual follow-up.")}
  `;
}

function portalSeoSections() {
  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Commercial search targets</span>
          <h2>Customer portal services buyers search before asking for a demo.</h2>
          <p>This page is structured for customer portal software, client portal development, travel customer portal, customer login portal, document portal, invoice portal, support portal, booking status portal, CRM customer portal, ERP customer portal, and partner portal searches.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card"><strong>Access</strong><p>Customer, corporate client, partner, branch, reseller, traveller, and support-team access with role-based views.</p></article>
          <article class="card metric-card"><strong>Documents</strong><p>Document requests, uploads, downloads, vouchers, tickets, reports, files, invoices, receipts, and handover records.</p></article>
          <article class="card metric-card"><strong>Support</strong><p>Support tickets, request history, priority notes, customer updates, internal routing, response records, and service categories.</p></article>
          <article class="card metric-card"><strong>Connection</strong><p>Travel CRM, Travel ERP, booking files, order workflows, finance status, payment reminders, automation, and dashboards.</p></article>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Portal modules</span>
          <h2>What BANDEVI can build into customer portal software.</h2>
          <p>The first release can start with login, documents, invoices, and support requests, then expand into CRM/ERP connection, payment reminders, customer notifications, partner access, and dashboards.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Portal area</th><th>What it can include</th></tr></thead>
            <tbody>
              ${customerPortalRows.map(([area, detail]) => `<tr><td>${area}</td><td>${detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Industries</span>
          <h2>Customer portals for travel, service, corporate, partner, and multi-office teams.</h2>
          <p>BANDEVI can shape portal access around how each business shares updates, documents, invoices, payment status, support history, and customer-facing information.</p>
        </div>
        <div class="grid cols-3">
          ${customerPortalIndustries.map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Proof-backed portal company</span>
          <h2>Company strength signals behind customer portal delivery.</h2>
          <p>Customer portals can expose sensitive business workflows, documents, payments, invoices, support notes, and service status. BANDEVI connects this page with its public proof layer so buyers can verify the company before planning access rules.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            <article class="article-block">
              <h3>Company profile and verification</h3>
              <p>The website links customer portal service pages to the Company Profile, Proof & Verification page, Offices page, Staff Size & Net Worth page, and official company profile PDF.</p>
            </article>
            <article class="article-block">
              <h3>Staff, net worth, and offices</h3>
              <p>BANDEVI publishes 1,289 staff worldwide, INR 7,594 Cr current company-provided net worth and group strength, and 10 listed office and service-location references.</p>
            </article>
            <article class="article-block">
              <h3>Portal governance</h3>
              <p>Portal projects can include role rules, customer fields, document folders, invoice visibility, payment status notes, support categories, access handover, training notes, and support ownership.</p>
            </article>
          </div>
          <aside class="article-aside">
            <h3>Verify before portal planning</h3>
            ${list(["Company Profile", "Proof & Verification", "Staff Size & Net Worth", "Offices & Locations", "Company Profile PDF", "Official contact and demo request"])}
            <a class="button dark" href="/proof-verification/">Open Proof Page ${icons.arrow}</a>
            <a class="button light" href="/staff-size-net-worth/">Staff & Net Worth</a>
            <a class="button light" href="${companyProfilePdf}">Company Profile PDF</a>
          </aside>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Connected system</span>
          <h2>Customer portal software connects bookings, CRM, ERP, automation, and support.</h2>
          <p>The portal becomes stronger when it reads from real customer, booking, invoice, document, and support records instead of standing alone.</p>
        </div>
        <div class="grid cols-3">
          <a class="card" href="/lead-booking-management/"><h3>Lead & Booking Management</h3><p>Move confirmed enquiries into booking files that can later feed customer-facing portal status.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/travel-crm/"><h3>Travel CRM</h3><p>Connect customer records, enquiry history, quotations, source notes, and follow-up context with portal access.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/travel-erp/"><h3>Travel ERP</h3><p>Connect booking files, passengers, suppliers, invoices, payments, documents, and operations status to portal views.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/business-automation/"><h3>Business Automation</h3><p>Automate document reminders, support alerts, payment updates, booking notes, and dashboard summaries.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/travel-technology/"><h3>Travel Technology</h3><p>Use the wider travel stack for websites, CRM, ERP, booking workflows, portals, suppliers, and reporting.</p><span>Open page ${icons.arrow}</span></a>
          <a class="card" href="/website-mobile-app-development/"><h3>Website & App Development</h3><p>Extend the portal into web apps, mobile-first access, dashboards, admin panels, and role-based workflows.</p><span>Open page ${icons.arrow}</span></a>
        </div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Customer portal FAQ</span>
          <h2>Answers for customer portal, client portal, travel portal, document access, invoices, and support searches.</h2>
          <p>These answers help customers and search engines understand the portal work BANDEVI can support.</p>
        </div>
        <div class="article-layout">
          <div class="article-body">
            ${customerPortalFaqs.map(([question, answer]) => `
              <article class="article-block">
                <h3>${question}</h3>
                <p>${answer}</p>
              </article>
            `).join("")}
          </div>
          <aside class="article-aside">
            <h3>Start with the right portal layer</h3>
            ${list(["Customer login and profile", "Booking and service status", "Documents and invoices", "Support requests", "CRM and ERP connection", "Notifications and dashboards"])}
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </aside>
        </div>
      </div>
    </section>
  `;
}

function privacyPage() {
  return `
    <section class="section">
      <div class="container article-layout">
        <article class="article-body">
          <span class="eyebrow">Privacy policy</span>
          <h2>Information we collect.</h2>
          <p class="muted article-intro">BANDEVI GLOBAL GROUP collects only the information needed to respond to inquiries, demo requests, support requests, and project discussions.</p>
          ${list([
            "Contact details such as name, company, phone number, email address, and preferred contact method.",
            "Project details shared through contact forms, demo request forms, WhatsApp, email, phone calls, or meetings.",
            "Basic website analytics and technical information such as page visits, device type, browser type, and referral source when analytics tools are enabled."
          ])}
          <section class="article-block">
            <h3>How information is used</h3>
            <p>Information is used to reply to inquiries, qualify demo requests, plan project scope, provide support, improve website content, and keep communication records clear for business follow-up.</p>
          </section>
          <section class="article-block">
            <h3>Sharing and security</h3>
            <p>BANDEVI does not sell inquiry data. Information may be shared only with internal team members, service providers, hosting tools, analytics tools, or communication platforms when needed to support the requested work.</p>
          </section>
          <section class="article-block">
            <h3>Your choices</h3>
            <p>You can contact BANDEVI to update contact details, ask about stored inquiry information, or request removal of non-essential communication records where legally and operationally possible.</p>
          </section>
        </article>
        <aside class="article-aside card">
          <span class="eyebrow">Contact</span>
          <h3>Privacy questions</h3>
          <p>For privacy or data-handling questions, contact the official BANDEVI sales and support desk.</p>
          <div class="inline-actions">
            <a class="button dark" href="mailto:${contactInfo.email}">Email ${icons.mail}</a>
            <a class="button light" href="${contactInfo.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </aside>
      </div>
    </section>
    ${cta("Need a project with clear data flow?", "BANDEVI can plan websites, CRM, ERP, portals, and automation with cleaner access and handover records.")}
  `;
}

function termsPage() {
  return `
    <section class="section">
      <div class="container article-layout">
        <article class="article-body">
          <span class="eyebrow">Terms & conditions</span>
          <h2>Website use.</h2>
          <p class="muted article-intro">This website gives general information about BANDEVI GLOBAL GROUP services, products, technology planning, and business solutions.</p>
          <section class="article-block">
            <h3>Service information</h3>
            <p>Website content, package descriptions, timelines, modules, and examples are informational. Final project scope, cost, delivery timeline, support terms, and handover items are confirmed separately through written discussion, quotation, proposal, or agreement.</p>
          </section>
          <section class="article-block">
            <h3>Demo and contact requests</h3>
            <p>Submitting a form or opening a WhatsApp message does not create a paid engagement by itself. A project starts only after the relevant commercial terms, scope, and payment milestones are accepted by both sides.</p>
          </section>
          <section class="article-block">
            <h3>Website content and references</h3>
            <p>Brand names, sister-brand references, case examples, service descriptions, and trust information are provided for business understanding. THG and BANDEVI remain separate sister-brand contexts where stated.</p>
          </section>
          <section class="article-block">
            <h3>Contact and support</h3>
            <p>For project questions, support, corrections, or formal documentation, use the official phone, WhatsApp, or email listed on this website.</p>
          </section>
        </article>
        <aside class="article-aside card">
          <span class="eyebrow">Official channel</span>
          <h3>Start with the right record.</h3>
          <p>Use the official contact and demo paths so scope, timelines, budget direction, and handover notes stay clear.</p>
          <div class="inline-actions">
            <a class="button dark" href="/demo-request/">Request Demo ${icons.arrow}</a>
            <a class="button light" href="/contact-us/">Contact</a>
          </div>
        </aside>
      </div>
    </section>
    ${cta("Ready to discuss a website or system?", "Share the business workflow and BANDEVI can map a realistic first release.")}
  `;
}

function quickContact() {
  return `
    <div class="quick-contact" aria-label="Quick contact options">
      <a href="${contactInfo.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ${icons.message}</a>
      <a href="${contactInfo.phoneHref}">Call ${icons.phone}</a>
    </div>
  `;
}

function footer() {
  const socialItems = socialLinks.map(([label, href]) => (
    `<li><a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="BANDEVI GLOBAL GROUP on ${label}">${label}</a></li>`
  )).join("");

  return `
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <h3>BANDEVI GLOBAL GROUP</h3>
          <p>Premium corporate websites, CRM, ERP, e-commerce, products, portals, and IT solutions for modern business lines.</p>
          <ul class="footer-trust-list">
            <li>Official domain: bandeviglobalgroup.com</li>
            <li>Also searched as Bandevi Global Group, Bandevi Global, and Bandevi.</li>
            <li>BANDEVI and THG operate as separate sister brands.</li>
            <li>Scope, access, handover, and support records can be documented for every project.</li>
          </ul>
        </div>
        <div>
          <h4>Solutions</h4>
          <ul class="footer-links">
            <li><a href="/it-company-software-development-services/">IT Company Services</a></li>
            <li><a href="/crm-erp-solutions/">CRM & ERP Development</a></li>
            <li><a href="/travel-crm/">Travel CRM</a></li>
            <li><a href="/travel-erp/">Travel ERP</a></li>
            <li><a href="/travel-website-development/">Travel Websites</a></li>
            <li><a href="/travel-technology/">Travel Technology</a></li>
            <li><a href="/lead-booking-management/">Lead & Booking Management</a></li>
            <li><a href="/customer-portal/">Customer Portal</a></li>
            <li><a href="/it-products/">Products</a></li>
            <li><a href="/website-mobile-app-development/">Website & App Development</a></li>
            <li><a href="/ecommerce-solutions/">E-Commerce Solutions</a></li>
            <li><a href="/business-automation/">Business Automation</a></li>
            <li><a href="/masala-food-products/">Masala / Food</a></li>
            <li><a href="/makhana-brand-solutions/">Makhana</a></li>
            <li><a href="/astrology-services-platform/">Astrology</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul class="footer-links">
            <li><a href="/about-us/">About Us</a></li>
            <li><a href="/company-profile/">Company Profile</a></li>
            <li><a href="${companyProfilePdf}">Company Profile PDF</a></li>
            <li><a href="${proofSupportPackPdf}">Proof Support Pack</a></li>
            <li><a href="/proof-verification/">Proof & Verification</a></li>
            <li><a href="/directory-listing-profile/">Directory Listing Profile</a></li>
            <li><a href="/external-citation-tracker/">External Citation Tracker</a></li>
            <li><a href="/staff-size-net-worth/">Staff Size & Net Worth</a></li>
            <li><a href="/offices/">Offices & Locations</a></li>
            <li><a href="/trust-licences-certifications/">Trust & Licences</a></li>
            <li><a href="/case-studies/">Case Studies</a></li>
            <li><a href="/blog/">Blog</a></li>
            <li><a href="/support/">Support</a></li>
            <li><a href="/privacy-policy/">Privacy Policy</a></li>
            <li><a href="/terms-and-conditions/">Terms & Conditions</a></li>
          </ul>
        </div>
        <div>
          <h4>Connect</h4>
          <ul class="footer-links">
            <li><a href="/contact-us/">Contact</a></li>
            <li><a href="/demo-request/">Demo Request</a></li>
            <li><a href="/customer-portal/">Customer Portal</a></li>
            ${socialItems}
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <small>&copy; 2026 BANDEVI GLOBAL GROUP. All rights reserved.</small>
        <small><a href="${contactInfo.phoneHref}">${contactInfo.phoneDisplay}</a> - <a href="mailto:${contactInfo.email}">${contactInfo.email}</a></small>
      </div>
    </footer>
  `;
}

const pageRenderers = {
  home: homePage,
  about: aboutPage,
  profile: companyProfilePage,
  proof: proofVerificationPage,
  directoryProfile: directoryProfilePage,
  externalCitations: externalCitationTrackerPage,
  staffWorth: staffWorthPage,
  itCompanyServices: itCompanyServicesPage,
  offices: officesPage,
  trust: trustPage,
  crm: crmPage,
  erp: erpPage,
  products: productsPage,
  itProducts: () => landingPage("itProducts"),
  crmErp: () => landingPage("crmErp"),
  ecommerce: () => landingPage("ecommerce"),
  webApp: () => landingPage("webApp"),
  automation: () => landingPage("automation"),
  masala: () => landingPage("masala"),
  makhana: () => landingPage("makhana"),
  astrology: () => landingPage("astrology"),
  travelWebsite: () => landingPage("travelWebsite"),
  travelTech: () => landingPage("travelTech"),
  leadBooking: () => landingPage("leadBooking"),
  it: itPage,
  cases: casesPage,
  blog: blogPage,
  support: supportPage,
  contact: contactPage,
  demo: demoPage,
  portal: portalPage,
  privacy: privacyPage,
  terms: termsPage
};

blogArticles.forEach((article) => {
  pageRenderers[article.key] = () => blogArticlePage(article.key);
});

function bindNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.innerHTML = open ? icons.close : icons.menu;
  });
}

function bindForms() {
  document.querySelectorAll("[data-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const note = form.querySelector(".form-note");
      const type = form.dataset.form;
      if (type === "portal") {
        if (note) note.textContent = "Portal access preview received.";
        form.reset();
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const label = type === "demo" ? "Demo request" : "Contact inquiry";
      const fieldLabels = [
        ["name", "Name"],
        ["company", "Company"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["interest", "Product / inquiry"],
        ["businessType", "Business type"],
        ["timeline", "Timeline"],
        ["preferredContact", "Preferred contact"],
        ["scale", "Team / branch scale"],
        ["priority", "Main priority"],
        ["budget", "Budget range"],
        ["currentWebsite", "Current website / reference"],
        ["officeRegion", "Office / region"],
        ["message", type === "demo" ? "Demo goals / current problem" : "Message"]
      ];
      const lines = [
        `New ${label} from BANDEVI website`,
        `Page: ${document.title}`,
        `URL: ${window.location.href.split("?")[0]}`,
        ...fieldLabels
          .map(([key, title]) => [title, (data[key] || "").trim()])
          .filter(([, value]) => value)
          .map(([title, value]) => `${title}: ${value}`)
      ];

      const message = lines.join("\n");
      const whatsappUrl = `${contactInfo.whatsapp}?text=${encodeURIComponent(message)}`;
      const mailUrl = `mailto:${contactInfo.email}?subject=${encodeURIComponent(label)}&body=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (note) {
        note.innerHTML = `Your lead message is ready. <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">Send on WhatsApp</a> or <a href="${mailUrl}">send by email</a>.`;
      }
      form.reset();
    });
  });
}

function render() {
  const page = activePage();
  const data = pageData[page] || pageData.home;
  const main = pageRenderers[page] || homePage;
  document.getElementById("site").innerHTML = `
    <div class="site-shell">
      ${header(page)}
      <main>
        ${hero(page, data)}
        ${main()}
      </main>
      ${quickContact()}
      ${footer()}
    </div>
  `;
  bindNav();
  bindForms();
}

render();


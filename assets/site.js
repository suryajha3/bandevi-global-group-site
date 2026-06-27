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
  ["LinkedIn", "https://www.linkedin.com/in/bandeviglobal-group-38584b419/"],
  ["X", "https://x.com/BANDEVIGLOBAL"]
];

const contactInfo = {
  phoneDisplay: "+91 8287669022",
  phoneHref: "tel:+918287669022",
  email: "sales@bandeviglobalgroup.com",
  whatsapp: "https://wa.me/918287669022"
};

const productImage = asset("travel-platform-dashboard.png");
const heroImage = asset("travel-operations-hero.png");

const pageData = {
  home: {
    title: "BANDEVI GLOBAL GROUP",
    eyebrow: "Travel technology for modern operators",
    lede: "Enterprise CRM, ERP, portals, and IT delivery for travel businesses that need cleaner operations, faster sales cycles, and a premium digital presence.",
    home: true
  },
  about: {
    title: "About BANDEVI GLOBAL GROUP",
    eyebrow: "Company",
    lede: "We help travel and service businesses build premium websites, CRM, ERP, portals, automation, and IT systems that support sales, operations, and customer experience."
  },
  crm: {
    title: "Travel CRM",
    eyebrow: "Sales engine",
    lede: "A structured CRM for inquiry handling, lead capture, quotation workflows, follow-ups, customer profiles, and revenue visibility."
  },
  erp: {
    title: "Travel ERP",
    eyebrow: "Operations backbone",
    lede: "A unified ERP layer for bookings, suppliers, finance, operations, inventory, approvals, and reporting across the travel business."
  },
  products: {
    title: "Products",
    eyebrow: "Platform suite",
    lede: "Modular travel technology products that can launch together or phase in across sales, operations, finance, and customer self-service."
  },
  itProducts: {
    title: "IT Products & Software Solutions",
    eyebrow: "Software products",
    lede: "Custom CRM, ERP, portals, e-commerce systems, web apps, mobile apps, and automation products for growing businesses."
  },
  crmErp: {
    title: "CRM & ERP Solutions",
    eyebrow: "Business systems",
    lede: "Connected CRM and ERP systems that help teams manage sales, customers, operations, reports, approvals, and business workflows."
  },
  ecommerce: {
    title: "E-Commerce Solutions",
    eyebrow: "Digital commerce",
    lede: "Secure e-commerce websites and platforms with product management, payment flows, customer experience, and growth-ready operations."
  },
  webApp: {
    title: "Website & Mobile App Development",
    eyebrow: "Digital delivery",
    lede: "Professional websites, web apps, and mobile app development for brands that need polished design and reliable performance."
  },
  automation: {
    title: "Business Automation",
    eyebrow: "Workflow automation",
    lede: "Automate leads, follow-ups, customer communication, task routing, reports, and daily business workflows."
  },
  travelTech: {
    title: "Travel Technology",
    eyebrow: "Travel systems",
    lede: "Travel CRM, ERP, portals, booking workflows, supplier coordination, and analytics built for agencies, operators, and DMCs."
  },
  leadBooking: {
    title: "Lead & Booking Management",
    eyebrow: "Sales to operations",
    lede: "Track travel inquiries, quotations, follow-ups, booking files, customer details, and team ownership in one controlled workflow."
  },
  it: {
    title: "IT Solutions",
    eyebrow: "Digital delivery",
    lede: "Web, cloud, integrations, automation, and managed engineering services built around the demands of travel and hospitality teams."
  },
  cases: {
    title: "Case Studies",
    eyebrow: "Business outcomes",
    lede: "Representative transformation programs for travel brands that need stronger control, faster response times, and better customer visibility."
  },
  blog: {
    title: "Blog",
    eyebrow: "Insights",
    lede: "Practical thinking on travel CRM, ERP, portals, automation, digital customer experience, and growth operations."
  },
  support: {
    title: "Support",
    eyebrow: "Client care",
    lede: "Structured support options for implementation, training, enhancements, uptime monitoring, and long-term platform improvement."
  },
  contact: {
    title: "Contact",
    eyebrow: "Start a conversation",
    lede: "Talk to BANDEVI GLOBAL GROUP about CRM, ERP, portals, website projects, and IT services for your travel business."
  },
  demo: {
    title: "Demo Request",
    eyebrow: "See the platform",
    lede: "Request a guided walkthrough of the travel CRM, ERP, products, portal experience, and implementation roadmap."
  },
  portal: {
    title: "Customer Portal",
    eyebrow: "Secure access",
    lede: "A premium portal concept for clients to view bookings, invoices, support requests, documents, and project milestones."
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
            <span class="brand-line">Travel technology company</span>
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

function cta(title = "Ready to modernize your travel business?", text = "Build the website, CRM, ERP, and customer portal around one clear growth story.") {
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

function homePage() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>One premium digital ecosystem for travel sales, operations, and client experience.</h2>
          <p>BANDEVI GLOBAL GROUP helps travel organizations replace scattered tools with integrated systems that make teams faster, customers better informed, and leadership more confident.</p>
        </div>
        ${cards([
          { icon: "users", title: "Lead to loyalty", text: "Capture inquiries, assign owners, build quotations, track follow-ups, and nurture repeat travelers." },
          { icon: "plane", title: "Booking operations", text: "Coordinate packages, suppliers, documents, payments, schedules, and exceptions in one operational layer." },
          { icon: "chart", title: "Management visibility", text: "Give decision makers dashboards for conversion, revenue, margin, workload, and customer service quality." }
        ])}
      </div>
    </section>
    <section class="section mist">
      <div class="container split">
        <div>
          <span class="eyebrow">Platform suite</span>
          <h2>Built for the real pace of travel businesses.</h2>
          <p class="muted">Every module is shaped around common travel workflows: inquiry handling, itinerary creation, supplier coordination, document management, finance, customer communication, and post-trip retention.</p>
          ${list(["CRM for inquiries, quotations, follow-ups, campaigns, and customer profiles", "ERP for booking files, suppliers, invoices, approvals, and reporting", "Customer portal for documents, invoices, tickets, and trip status", "IT services for websites, integrations, automation, cloud, and security"])}
        </div>
        <div class="media-frame"><img src="${productImage}" alt="Premium travel software dashboard mockup"></div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">Growth architecture</span>
          <h2>From website visitor to confirmed traveler.</h2>
        </div>
        <div class="process">
          ${["Attract", "Capture", "Convert", "Retain"].map((name, index) => `
            <div class="process-step">
              <span>0${index + 1}</span>
              <h3>${name}</h3>
              <p>${[
                "Premium corporate pages, product storytelling, blogs, and lead paths.",
                "Contact, demo, and campaign forms routed into travel CRM queues.",
                "Quotation, proposal, approval, booking, and payment visibility.",
                "Portal access, support, campaigns, and repeat-business intelligence."
              ][index]}</p>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
    ${blogPreview()}
    ${cta()}
  `;
}

function aboutPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Who we are</span>
          <h2>A digital technology partner for ambitious travel and service brands.</h2>
          <p class="muted">BANDEVI GLOBAL GROUP designs corporate websites, travel CRM, ERP, customer portals, and business automation systems for teams that want a more professional way to sell, operate, and serve customers.</p>
          <p class="muted">Our work connects brand presence with practical software. The website helps create trust, the CRM protects every enquiry, the ERP brings control to bookings and finance, and portals give customers cleaner self-service.</p>
          ${list(["Premium online presence for marketing and sales credibility", "Travel-first CRM and ERP workflows for daily teams", "Customer portals, lead management, and booking visibility", "Long-term improvement support after launch"])}
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
          <h2>Built around the systems a growing travel business actually needs.</h2>
          <p>Instead of treating design, software, and support as separate pieces, BANDEVI GLOBAL GROUP brings them into one practical digital growth stack.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card">
            <strong>CRM</strong>
            <p>Lead capture, follow-ups, quotation tracking, customer history, and sales visibility.</p>
          </article>
          <article class="card metric-card">
            <strong>ERP</strong>
            <p>Booking files, suppliers, operations, payments, approvals, and reporting control.</p>
          </article>
          <article class="card metric-card">
            <strong>Portal</strong>
            <p>Customer access for trip status, documents, invoices, service requests, and updates.</p>
          </article>
          <article class="card metric-card">
            <strong>Web</strong>
            <p>Corporate websites, landing pages, product pages, and conversion-focused contact paths.</p>
          </article>
        </div>
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">What we build</span>
          <h2>Technology that feels premium outside and disciplined inside.</h2>
        </div>
        ${cards([
          { icon: "plane", title: "Travel CRM", text: "A sales workspace for enquiries, campaigns, agent ownership, follow-up reminders, proposals, and conversion reporting." },
          { icon: "stack", title: "Travel ERP", text: "An operations backbone for bookings, suppliers, finance, approvals, documents, team workload, and management reports." },
          { icon: "globe", title: "Corporate websites", text: "Premium pages for company profile, products, services, blogs, demo requests, and search-friendly lead generation." },
          { icon: "shield", title: "Portals and automation", text: "Customer portals, internal dashboards, WhatsApp handoffs, task routing, and repeatable workflows for service teams." }
        ], 4)}
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>How we work with clients.</h2>
          <p>Every project starts with business clarity first, then moves into design, build, launch, and measured improvement.</p>
        </div>
        <div class="process">
          ${[
            ["Discover", "Understand services, users, lead sources, operations, reporting needs, and launch priorities."],
            ["Design", "Shape the website structure, software modules, customer journeys, and approval flows."],
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
    <section class="section mist">
      <div class="container split reverse">
        <div class="media-frame"><img src="${productImage}" alt="Travel CRM and ERP dashboard screens"></div>
        <div>
          <span class="eyebrow">Who we serve</span>
          <h2>For teams that want better control from first lead to final service.</h2>
          <p class="muted">The company is built for organizations where brand trust, fast response, booking accuracy, and customer communication directly affect revenue.</p>
          ${list(["Travel agencies and tour operators", "Destination management companies and consolidators", "Corporate travel desks and service teams", "Growing businesses that need CRM, ERP, portals, websites, and automation"])}
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
          { icon: "shield", title: "Trust by design", text: "Clear data flows, permissions, auditability, and operational controls are treated as product essentials." },
          { icon: "chart", title: "Measurable outcomes", text: "Projects are mapped to response speed, conversion visibility, staff productivity, and customer satisfaction." },
          { icon: "users", title: "Team adoption", text: "Interfaces are designed for real daily users so sales, support, operations, and leadership can work with confidence." }
        ])}
      </div>
    </section>
    ${cta("Let your website and software tell one stronger story.", "Create a premium corporate presence backed by systems that can support sales and delivery.")}
  `;
}

function crmPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Travel CRM</span>
          <h2>Control every inquiry before it slips away.</h2>
          <p class="muted">The travel CRM gives teams a central sales workspace for inbound inquiries, agent assignment, itinerary discussions, proposal progress, follow-ups, and customer history.</p>
          ${list(["Lead capture from website, campaigns, WhatsApp handoffs, and offline enquiries", "Quotation stages for FIT, group, MICE, pilgrimage, corporate, and custom trips", "Follow-up reminders, task ownership, campaign segmentation, and repeat-sales prompts", "Pipeline dashboards for source quality, conversion speed, and lost-lead reasons"])}
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
          { icon: "users", title: "Lead desk", text: "Queue, assign, prioritize, and track every enquiry from first touch to qualified opportunity." },
          { icon: "plane", title: "Trip interest profile", text: "Capture destinations, dates, budget, pax count, preferences, documents, and communication notes." },
          { icon: "chart", title: "Conversion intelligence", text: "See source performance, response times, team productivity, and upcoming revenue potential." }
        ])}
      </div>
    </section>
    ${cta("Turn more travel enquiries into booked revenue.", "Launch a CRM that keeps follow-ups sharp and leadership informed.")}
  `;
}

function erpPage() {
  return `
    <section class="section">
      <div class="container split reverse">
        <div class="media-frame"><img src="${productImage}" alt="Travel ERP operations screens"></div>
        <div>
          <span class="eyebrow">Travel ERP</span>
          <h2>Bring booking files, supplier work, and finance into one system.</h2>
          <p class="muted">The ERP layer connects operational execution with supplier costing, customer billing, approvals, documentation, and reporting so teams stop chasing information across spreadsheets and chats.</p>
          ${list(["Booking file management with passengers, itineraries, documents, and service items", "Supplier contracts, rates, confirmations, payment schedules, and reconciliation", "Invoice, receipt, refund, credit note, and margin visibility", "Role-based approvals for discounts, exceptions, payments, and changes"])}
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
          { icon: "stack", title: "Service inventory", text: "Track flights, hotels, transfers, activities, visas, insurance, and custom service components." },
          { icon: "shield", title: "Approval paths", text: "Define authority rules for margin exceptions, payment approvals, supplier changes, and refunds." },
          { icon: "chart", title: "Finance reporting", text: "Connect sales, cost, receivables, payables, and profitability views for every booking file." }
        ])}
      </div>
    </section>
    ${cta("Give operations the same polish as your sales story.", "Use ERP workflows to reduce leakage, delays, and manual reconciliation.")}
  `;
}

function productsPage() {
  return `
    <section class="section">
      <div class="container product-row">
        <div>
          <span class="eyebrow">Products</span>
          <h2>A modular platform suite for travel enterprises.</h2>
          <p class="muted">Start with the module that solves the most urgent business problem, then expand into a connected operating system for growth.</p>
          <div class="pill-list">
            ${["Travel CRM", "Travel ERP", "Customer Portal", "Booking Desk", "Supplier Hub", "Analytics"].map((item) => `<span class="pill">${item}</span>`).join("")}
          </div>
        </div>
        <div class="media-frame"><img src="${productImage}" alt="Travel technology product suite"></div>
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>Product areas.</h2>
          <p>Each product can be tailored to the scale, market, and operating model of the travel company.</p>
        </div>
        ${cards([
          { icon: "users", title: "Travel CRM", text: "Lead capture, pipeline, customer profiles, follow-up automation, campaigns, and consultant performance." },
          { icon: "stack", title: "Travel ERP", text: "Bookings, services, suppliers, invoices, receipts, approvals, documents, and profit tracking." },
          { icon: "globe", title: "Customer Portal", text: "Client login for trips, files, invoices, support tickets, and project or booking milestones." },
          { icon: "plane", title: "Booking Desk", text: "Package operations, service status, passenger data, confirmations, vouchers, and change requests." },
          { icon: "shield", title: "Supplier Hub", text: "Rates, agreements, documents, payment schedules, service confirmations, and quality notes." },
          { icon: "chart", title: "Analytics", text: "Dashboards for sales, operations, service quality, supplier performance, and management reporting." }
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
          <h2>IT solutions for travel brands that need more than a brochure website.</h2>
          <p>From premium corporate websites to integrated portals and automation, the delivery model is built to support both marketing and operations.</p>
        </div>
        ${cards([
          { icon: "globe", title: "Corporate websites", text: "Premium multi-page websites with product storytelling, lead paths, blogs, forms, and campaign-ready pages." },
          { icon: "stack", title: "Custom applications", text: "Dashboards, admin panels, portals, booking tools, workflows, and internal productivity systems." },
          { icon: "plane", title: "Travel integrations", text: "Supplier APIs, payment gateways, CRM handoffs, email workflows, analytics, and third-party tools." },
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
          ${list(["Discovery and content architecture", "Premium UI direction and responsive page design", "CRM, ERP, and portal workflow planning", "Launch support, analytics, and enhancement roadmap"])}
        </div>
        <div class="media-frame"><img src="${heroImage}" alt="Global travel operations environment"></div>
      </div>
    </section>
    ${cta("Build a digital presence that also improves operations.", "A strong travel brand website should support sales, service, and systems together.")}
  `;
}

const landingPages = {
  itProducts: {
    tag: "IT products",
    title: "Build the software layer your business can grow on.",
    intro: "BANDEVI GLOBAL GROUP designs practical software products for teams that need better visibility, faster customer response, and cleaner internal control.",
    points: ["Custom CRM and ERP products for sales, operations, finance, and reporting", "Customer portals, admin panels, dashboards, and internal productivity systems", "Modular delivery so you can launch quickly and expand without rebuilding"],
    modules: [
      { icon: "users", title: "CRM products", text: "Lead capture, assignment, follow-ups, customer records, quotation stages, and source reporting." },
      { icon: "stack", title: "ERP products", text: "Operations workflows, approval paths, invoices, documents, supplier records, and dashboards." },
      { icon: "globe", title: "Portal products", text: "Secure customer, partner, or staff portals for self-service access and controlled updates." }
    ],
    process: ["Discover the workflow", "Define the product modules", "Launch the first release", "Improve with data"]
  },
  crmErp: {
    tag: "CRM & ERP",
    title: "Connect sales, operations, and reporting in one business system.",
    intro: "A joined CRM and ERP setup helps growing companies stop losing information between lead generation, customer handling, delivery, finance, and management review.",
    points: ["CRM for lead ownership, follow-up discipline, customer profiles, and pipeline clarity", "ERP for operations, approvals, billing, supplier coordination, and reporting", "Dashboards that help leadership see conversion, workload, revenue, and bottlenecks"],
    modules: [
      { icon: "users", title: "Sales control", text: "Capture every inquiry, assign ownership, track stages, and manage follow-up reminders." },
      { icon: "shield", title: "Operational control", text: "Move confirmed work into delivery workflows with approvals, documents, and task queues." },
      { icon: "chart", title: "Management control", text: "Use reports to measure source quality, performance, turnaround time, and profitability." }
    ],
    process: ["Map current work", "Design CRM stages", "Connect ERP workflows", "Train and optimize"]
  },
  ecommerce: {
    tag: "E-commerce",
    title: "Launch an online store that feels credible and easy to manage.",
    intro: "BANDEVI GLOBAL GROUP builds e-commerce websites and platforms that combine storefront experience with product management, payments, operations, and customer communication.",
    points: ["Responsive storefronts with product catalogs, offers, search, and checkout paths", "Payment, order, inventory, customer, and notification workflows", "Admin tools and reporting for daily management and growth campaigns"],
    modules: [
      { icon: "globe", title: "Storefront", text: "Modern product pages, category flows, trust sections, and conversion-focused purchase journeys." },
      { icon: "stack", title: "Operations", text: "Order handling, product updates, payment status, customer records, and internal controls." },
      { icon: "chart", title: "Growth", text: "Campaign landing pages, analytics, source tracking, and repeat-customer communication." }
    ],
    process: ["Structure catalog", "Design storefront", "Connect payments", "Launch campaigns"]
  },
  webApp: {
    tag: "Web & mobile",
    title: "Professional websites, web apps, and mobile experiences for modern businesses.",
    intro: "From a premium corporate website to internal dashboards and mobile-first customer experiences, the delivery focuses on clarity, speed, trust, and business usefulness.",
    points: ["Corporate websites with strong positioning, SEO structure, forms, and conversion paths", "Web applications for dashboards, portals, workflows, and admin teams", "Mobile app planning and delivery for customer access, service, and engagement"],
    modules: [
      { icon: "globe", title: "Corporate website", text: "Premium pages, service storytelling, lead capture, SEO metadata, analytics, and responsive layouts." },
      { icon: "stack", title: "Web application", text: "Admin dashboards, role-based tools, portals, data views, workflows, and integrations." },
      { icon: "phone", title: "Mobile experience", text: "Mobile app and mobile-first interface planning for customers, staff, and service workflows." }
    ],
    process: ["Plan content", "Design interface", "Build and test", "Launch and measure"]
  },
  automation: {
    tag: "Automation",
    title: "Automate the repetitive work that slows down sales and service.",
    intro: "Business automation helps teams respond faster, keep follow-ups consistent, move data between tools, and reduce manual reporting pressure.",
    points: ["Lead routing, reminders, status updates, and customer communication flows", "Task queues, approvals, document requests, and internal notifications", "Reporting automations that reduce spreadsheet work and improve visibility"],
    modules: [
      { icon: "users", title: "Lead automation", text: "Route inquiries by source, service, branch, or team and keep follow-up ownership visible." },
      { icon: "shield", title: "Workflow automation", text: "Trigger tasks, approvals, reminders, and document requests at the right stage." },
      { icon: "chart", title: "Report automation", text: "Generate management views for pipeline, workload, turnaround time, and outcomes." }
    ],
    process: ["Find repeat work", "Define triggers", "Build automation", "Measure time saved"]
  },
  travelTech: {
    tag: "Travel technology",
    title: "Travel systems for agencies, tour operators, DMCs, and corporate desks.",
    intro: "BANDEVI GLOBAL GROUP brings travel CRM, ERP, booking operations, supplier workflows, portals, and analytics into a more controlled digital ecosystem.",
    points: ["Inquiry handling, quotation stages, itinerary discussions, and sales follow-up control", "Booking files, passenger details, documents, suppliers, payments, and finance visibility", "Customer portals and reporting that make service feel premium and organized"],
    modules: [
      { icon: "plane", title: "Travel CRM", text: "Manage inquiries, trip interests, quotations, follow-ups, campaigns, and customer history." },
      { icon: "stack", title: "Travel ERP", text: "Control bookings, services, suppliers, confirmations, invoices, payments, and margins." },
      { icon: "globe", title: "Customer portal", text: "Give travelers and corporate clients access to documents, invoices, status, and support." }
    ],
    process: ["Audit workflow", "Prioritize modules", "Launch travel system", "Scale with reporting"]
  },
  leadBooking: {
    tag: "Lead & booking",
    title: "Move every travel inquiry from lead to booking without losing control.",
    intro: "Lead and booking management connects inquiry capture, sales ownership, quotation tracking, operations handoff, booking files, and follow-up visibility.",
    points: ["Capture leads from website, calls, WhatsApp, campaigns, and partner channels", "Track proposal status, reminders, lost reasons, and customer preferences", "Convert confirmed sales into structured booking files with documents and service items"],
    modules: [
      { icon: "users", title: "Lead desk", text: "Centralize inquiries, assign owners, set priority, and monitor response time." },
      { icon: "plane", title: "Booking file", text: "Record passengers, services, suppliers, dates, payments, documents, and status." },
      { icon: "chart", title: "Conversion view", text: "See sources, win rate, proposal speed, lost reasons, and upcoming revenue." }
    ],
    process: ["Capture inquiry", "Build quotation", "Confirm booking", "Track delivery"]
  }
};

function landingPage(key) {
  const page = landingPages[key];
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
    ${cta(`Discuss ${page.tag.toLowerCase()} for your business.`, "Share your current workflow and BANDEVI GLOBAL GROUP can map the right first release.")}
  `;
}

function casesPage() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Transformation programs for travel businesses.</h2>
          <p>These representative case studies show how the BANDEVI GLOBAL GROUP platform can be shaped around different operating models.</p>
        </div>
        ${cards([
          { icon: "users", title: "Multi-branch travel agency", text: "Unified inquiry routing, branch-level performance, quotation tracking, and customer lifecycle visibility." },
          { icon: "plane", title: "Tour operator operations", text: "Booking files, supplier confirmations, payment schedules, passenger documents, and margin tracking." },
          { icon: "globe", title: "Corporate travel desk", text: "Portal access, request tracking, approvals, traveller profiles, invoices, and service desk reporting." }
        ])}
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head single">
          <span class="eyebrow">Outcome map</span>
          <h2>Common improvements clients look for.</h2>
        </div>
        <div class="grid cols-4">
          ${[
            ["Faster response", "Reduce delays between inquiry and first proposal."],
            ["Cleaner handoffs", "Move work from sales to operations without data loss."],
            ["Better margins", "See cost, selling price, discounting, and leakage."],
            ["Premium service", "Give customers a controlled, modern portal experience."]
          ].map(([title, text]) => `<div class="card metric-card"><strong>${title}</strong><p>${text}</p></div>`).join("")}
        </div>
      </div>
    </section>
    ${cta("Map your business case to the right platform release.", "Start with the bottleneck that is costing the most time, margin, or growth.")}
  `;
}

const posts = [
  ["CRM", "How travel teams can stop losing leads after the first inquiry", "A practical look at response ownership, lead stages, follow-up timing, and source visibility."],
  ["ERP", "Why booking files should connect sales, suppliers, and finance", "The operational benefits of joining documents, service items, invoices, payments, and margin reporting."],
  ["Portal", "Customer portals as a premium service differentiator", "How portals can reduce repetitive status questions while making the travel brand feel more organized."],
  ["Web", "What a travel technology website must prove in the first minute", "Trust signals, product clarity, service depth, lead paths, and credible digital presentation."],
  ["Automation", "Where automation helps travel consultants most", "Reminder flows, document requests, task routing, reporting, and customer communication patterns."],
  ["Growth", "Using data to improve travel sales performance", "How source quality, response time, proposal speed, and lost-lead reasons shape better management decisions."]
];

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
  return `<div class="grid cols-3">${items.map(([tag, title, text], index) => `
    <article class="card blog-card">
      <time>${tag} insight</time>
      <h3>${title}</h3>
      <p>${text}</p>
      <a href="/blog/#post-${index + 1}">Read more ${icons.arrow}</a>
    </article>
  `).join("")}</div>`;
}

function blogPage() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Practical ideas for modern travel companies.</h2>
          <p>Use the blog to support SEO, educate prospects, and show the market that BANDEVI GLOBAL GROUP understands travel operations.</p>
        </div>
        <div class="grid cols-3">
          ${posts.map(([tag, title, text], index) => `
            <article class="card blog-card" id="post-${index + 1}">
              <time>${tag}</time>
              <h3>${title}</h3>
              <p>${text}</p>
              <a href="/demo-request/">Discuss this topic ${icons.arrow}</a>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    ${cta("Turn insights into qualified conversations.", "Use the blog as a sales asset linked to demo requests and product pages.")}
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
              <tr><td>Enterprise Care</td><td>High-volume travel operations</td><td>Custom SLA</td><td>Monitoring, governance, security, roadmap management</td></tr>
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
          <input id="${kind}-phone" name="phone" autocomplete="tel">
        </div>
        <div class="field">
          <label for="${kind}-interest">Interest</label>
          <select id="${kind}-interest" name="interest">
            <option>Complete corporate website</option>
            <option>Travel CRM</option>
            <option>Travel ERP</option>
            <option>Customer portal</option>
            <option>CRM & ERP solutions</option>
            <option>E-commerce solutions</option>
            <option>Website & mobile app development</option>
            <option>Business automation</option>
            <option>IT solutions</option>
          </select>
        </div>
        <div class="field">
          <label for="${kind}-timeline">Timeline</label>
          <select id="${kind}-timeline" name="timeline">
            <option>Immediately</option>
            <option>Within 30 days</option>
            <option>Within 90 days</option>
            <option>Planning stage</option>
          </select>
        </div>
        <div class="field full">
          <label for="${kind}-message">${demo ? "Demo goals" : "Message"}</label>
          <textarea id="${kind}-message" name="message" required></textarea>
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
          <h2>Bring your corporate website and travel systems into one plan.</h2>
          <p class="muted">Use the form to begin a conversation about web presence, CRM, ERP, portal, integrations, or ongoing IT support.</p>
          ${cards([
            { icon: "mail", title: "Sales desk", text: contactInfo.email },
            { icon: "phone", title: "Call or WhatsApp", text: contactInfo.phoneDisplay },
            { icon: "globe", title: "Delivery model", text: "Remote-first project delivery with structured discovery, design, build, and launch phases." }
          ], 3)}
          <div class="inline-actions">
            <a class="button dark" href="${contactInfo.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ${icons.message}</a>
            <a class="button light" href="${contactInfo.phoneHref}">Call ${icons.phone}</a>
          </div>
        </div>
        ${contactForm("contact")}
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
          <h2>See the travel CRM, ERP, product suite, and portal experience in context.</h2>
          <p class="muted">A demo can be tailored for agencies, tour operators, corporate travel desks, DMCs, consolidators, and mixed-service travel companies.</p>
          ${list(["Review your current sales and operations workflow", "Select the right modules for the first launch", "Discuss website pages, content, forms, and lead paths", "Map a phased delivery roadmap with support options"])}
        </div>
        ${contactForm("demo")}
      </div>
    </section>
    ${cta("A good demo should feel like your business.", "Share your workflow and the walkthrough can focus on the modules that matter most.")}
  `;
}

function portalPage() {
  return `
    <section class="section">
      <div class="container portal-panel">
        <div class="portal-preview" aria-label="Customer portal preview">
          <div class="portal-preview-head">
            <span class="dot"></span><strong>Customer Portal Dashboard</strong>
          </div>
          <div class="portal-grid">
            ${[
              ["Trips", "Upcoming itineraries and service status", "gold"],
              ["Invoices", "Receipts, dues, refunds, and statements", ""],
              ["Documents", "Passports, vouchers, visas, and tickets", ""],
              ["Support", "Requests, responses, and priority updates", "gold"],
              ["Projects", "Milestones for corporate or group programs", ""],
              ["Profile", "Traveller details and service preferences", ""]
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
          <span class="eyebrow">Portal sign in</span>
          <h2>Client access</h2>
          <p class="muted">A secure portal can be connected to your CRM and ERP records for customers, corporate clients, or partners.</p>
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
          <p>The customer portal strengthens service quality while reducing repetitive manual communication.</p>
        </div>
        ${cards([
          { icon: "shield", title: "Secure records", text: "Role-based access to booking details, documents, invoices, and support history." },
          { icon: "plane", title: "Trip visibility", text: "Customers can follow service status, travel documents, schedules, and important updates." },
          { icon: "users", title: "Support desk", text: "Structured requests give customers clarity and give teams a cleaner service queue." }
        ])}
      </div>
    </section>
    ${cta("Add portal access to your premium travel experience.", "A polished customer portal helps your service feel organized before, during, and after travel.")}
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
          <p>Premium corporate websites, Travel CRM, Travel ERP, products, portals, and IT solutions for modern travel businesses.</p>
        </div>
        <div>
          <h4>Solutions</h4>
          <ul class="footer-links">
            <li><a href="/travel-crm/">Travel CRM</a></li>
            <li><a href="/travel-erp/">Travel ERP</a></li>
            <li><a href="/it-products/">Products</a></li>
            <li><a href="/website-mobile-app-development/">IT Solutions</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul class="footer-links">
            <li><a href="/about-us/">About Us</a></li>
            <li><a href="/case-studies/">Case Studies</a></li>
            <li><a href="/blog/">Blog</a></li>
            <li><a href="/support/">Support</a></li>
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
        <small><a href="${contactInfo.phoneHref}">${contactInfo.phoneDisplay}</a> · <a href="mailto:${contactInfo.email}">${contactInfo.email}</a></small>
      </div>
    </footer>
  `;
}

const pageRenderers = {
  home: homePage,
  about: aboutPage,
  crm: crmPage,
  erp: erpPage,
  products: productsPage,
  itProducts: () => landingPage("itProducts"),
  crmErp: () => landingPage("crmErp"),
  ecommerce: () => landingPage("ecommerce"),
  webApp: () => landingPage("webApp"),
  automation: () => landingPage("automation"),
  travelTech: () => landingPage("travelTech"),
  leadBooking: () => landingPage("leadBooking"),
  it: itPage,
  cases: casesPage,
  blog: blogPage,
  support: supportPage,
  contact: contactPage,
  demo: demoPage,
  portal: portalPage
};

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
      const label = type === "demo" ? "Demo request" : "Website inquiry";
      const lines = [
        `New ${label} from BANDEVI website`,
        `Page: ${document.title}`,
        `Name: ${data.name || ""}`,
        `Company: ${data.company || ""}`,
        `Email: ${data.email || ""}`,
        `Phone: ${data.phone || ""}`,
        `Interest: ${data.interest || ""}`,
        `Timeline: ${data.timeline || ""}`,
        `Message: ${data.message || ""}`
      ].filter((line) => !line.endsWith(": "));

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


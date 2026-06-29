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

const productImage = asset("travel-platform-dashboard.png");
const heroImage = asset("travel-operations-hero.png");

const pageData = {
  home: {
    title: "BANDEVI GLOBAL GROUP",
    eyebrow: "IT and development company",
    lede: "Premium websites, CRM, ERP, portals, e-commerce, automation, and business software for travel, masala, makhana, astrology, and growing service brands.",
    home: true
  },
  about: {
    title: "About BANDEVI GLOBAL GROUP",
    eyebrow: "Company",
    lede: "We help group companies and outside clients build premium websites, CRM, ERP, portals, automation, and IT systems that support sales, operations, customer experience, and digital growth."
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
    lede: "Modular software products that can launch together or phase in across sales, operations, finance, commerce, bookings, service, and customer self-service."
  },
  itProducts: {
    title: "IT Products & Software Solutions",
    eyebrow: "Software products",
    lede: "A complete product suite for CRM, ERP, customer portals, booking operations, automation, websites, e-commerce, business dashboards, and vertical-specific digital products."
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
    lede: "Web, cloud, integrations, automation, and managed development services for product, service, commerce, astrology, and travel-led businesses."
  },
  cases: {
    title: "Case Studies",
    eyebrow: "Business outcomes",
    lede: "Representative project examples for businesses that need stronger CRM, ERP, portals, automation, websites, commerce, booking control, and digital operations."
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
    lede: "Talk to BANDEVI GLOBAL GROUP about CRM, ERP, portals, website projects, automation, IT services, and office support."
  },
  demo: {
    title: "Demo Request",
    eyebrow: "See the platform",
    lede: "Request a guided walkthrough of the CRM, ERP, products, portal experience, website strategy, and implementation roadmap."
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
    <section class="section mist">
      <div class="container split">
        <div>
          <span class="eyebrow">Platform suite</span>
          <h2>Built for the real pace of growing business lines.</h2>
          <p class="muted">Every module is shaped around practical daily workflows: inquiry handling, order or booking control, product catalogs, service requests, supplier coordination, finance, customer communication, and repeat sales.</p>
          ${list(["CRM for inquiries, quotations, follow-ups, campaigns, and customer profiles", "ERP for orders, bookings, suppliers, invoices, approvals, stock, and reporting", "Customer portals for documents, invoices, tickets, service status, and project milestones", "IT services for websites, integrations, automation, cloud, e-commerce, and security"])}
        </div>
        <div class="media-frame"><img src="${productImage}" alt="Premium travel software dashboard mockup"></div>
      </div>
    </section>
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
    ${cta()}
  `;
}

function aboutPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Who we are</span>
          <h2>A digital technology partner for ambitious group companies and growing brands.</h2>
          <p class="muted">BANDEVI GLOBAL GROUP designs corporate websites, CRM, ERP, customer portals, e-commerce, and business automation systems for teams that want a more professional way to sell, operate, and serve customers.</p>
          <p class="muted">Our work connects brand presence with practical software. The website helps create trust, the CRM protects every enquiry, the ERP brings control to operations and finance, and portals give customers cleaner self-service.</p>
          ${list(["Premium online presence for marketing and sales credibility", "CRM and ERP workflows for daily teams across business lines", "Customer portals, lead management, order, booking, and service visibility", "Long-term improvement support after launch"])}
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
          <h2>Built around the systems a growing business actually needs.</h2>
          <p>Instead of treating design, software, and support as separate pieces, BANDEVI GLOBAL GROUP brings them into one practical digital growth stack.</p>
        </div>
        <div class="grid cols-4">
          <article class="card metric-card">
            <strong>CRM</strong>
            <p>Lead capture, follow-ups, quotation tracking, customer history, and sales visibility.</p>
          </article>
          <article class="card metric-card">
            <strong>ERP</strong>
            <p>Orders, bookings, suppliers, stock, operations, payments, approvals, and reporting control.</p>
          </article>
          <article class="card metric-card">
            <strong>Portal</strong>
            <p>Customer access for service status, documents, invoices, support requests, and updates.</p>
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
          { icon: "users", title: "CRM systems", text: "A sales workspace for enquiries, campaigns, owner assignment, follow-up reminders, proposals, and conversion reporting." },
          { icon: "stack", title: "ERP systems", text: "An operations backbone for orders, bookings, stock, suppliers, finance, approvals, documents, team workload, and management reports." },
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
          <p class="muted">The company is built for organizations where brand trust, fast response, order or service accuracy, and customer communication directly affect revenue.</p>
          ${list(["Group and sister-company technology projects", "Masala and food-product businesses that need e-commerce, CRM, stock, and order visibility", "Makhana brands that need product catalogs, commerce, distribution, and customer systems", "Astrology service brands that need websites, booking flows, consultation portals, CRM, and payments", "Travel, service, and corporate teams that need CRM, ERP, portals, websites, and automation"])}
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
    ${cta("Let your website and software tell one stronger story.", "Create a premium corporate presence backed by systems that can support sales, orders, service, and delivery.")}
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
          <h2>A modular platform suite for growing business lines.</h2>
          <p class="muted">Start with the module that solves the most urgent business problem, then expand into a connected operating system for growth across travel, masala, makhana, astrology, and service brands.</p>
          <div class="pill-list">
            ${["Travel CRM", "Travel ERP", "Customer Portal", "E-Commerce", "Supplier Hub", "Analytics"].map((item) => `<span class="pill">${item}</span>`).join("")}
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
    title: "One product suite for sales, operations, commerce, customer service, and digital growth.",
    intro: "BANDEVI GLOBAL GROUP builds practical software products for business lines that need stronger lead control, cleaner operations, premium customer experience, and better management visibility.",
    points: ["CRM and ERP products for sales, operations, finance, suppliers, stock, bookings, and reporting", "Customer portals, admin panels, dashboards, booking desks, order desks, and internal productivity systems", "Websites, e-commerce platforms, mobile-ready experiences, automation, and analytics connected to real business workflows"],
    modules: [
      { icon: "users", title: "Travel CRM", text: "Capture enquiries, assign sales owners, track quotation stages, manage follow-ups, and improve conversion visibility." },
      { icon: "stack", title: "Travel ERP", text: "Control bookings, services, suppliers, invoices, payments, approvals, documents, and operational reporting." },
      { icon: "globe", title: "Customer Portal", text: "Give customers controlled access to service status, invoices, documents, support requests, booking updates, and project milestones." },
      { icon: "plane", title: "Booking & Order Desk", text: "Coordinate bookings, orders, consultations, packages, confirmations, documents, change requests, and service status." },
      { icon: "shield", title: "Web & E-Commerce", text: "Launch premium corporate websites, landing pages, storefronts, masala or makhana catalogs, service pages, and search-friendly lead paths." },
      { icon: "chart", title: "Automation & Analytics", text: "Automate reminders, routing, reports, notifications, dashboards, and performance reviews." }
    ],
    process: ["Map business workflow", "Prioritize product modules", "Launch first release", "Improve with data"]
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
  const extraSections = key === "itProducts" ? itProductUpgradeSections() : "";
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

function itProductUpgradeSections() {
  return `
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <h2>A sales page for the complete BANDEVI product ecosystem.</h2>
          <p>Each product can launch independently, then connect into a larger operating system for marketing, sales, commerce, service, finance, and leadership.</p>
        </div>
        <div class="grid cols-4">
          ${[
            ["Lead control", "Capture website, WhatsApp, phone, campaign, and partner enquiries into one structured sales flow."],
            ["Operations control", "Move confirmed work into orders, bookings, files, services, suppliers, documents, payments, stock, and status tracking."],
            ["Customer control", "Give customers, partners, and service clients a premium portal experience with clean access to updates and documents."],
            ["Management control", "Review conversion, workload, service quality, revenue, stock, margin, and bottlenecks from dashboards."]
          ].map(([title, text]) => `<article class="card metric-card"><strong>${title}</strong><p>${text}</p></article>`).join("")}
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

const caseStudies = [
  {
    icon: "users",
    tag: "Travel CRM",
    title: "Multi-branch travel agency CRM setup",
    challenge: "Leads were arriving from website forms, calls, WhatsApp, referrals, and branch teams without one clear owner or follow-up view.",
    solution: "Create a CRM flow with lead source capture, branch assignment, consultant ownership, quotation stages, reminders, and management dashboards.",
    outcomes: ["Central lead queue for all enquiry sources", "Branch and consultant-level visibility", "Follow-up discipline across open opportunities", "Cleaner source and lost-reason reporting"],
    link: "/travel-crm/"
  },
  {
    icon: "stack",
    tag: "Travel ERP",
    title: "Tour operator ERP workflow",
    challenge: "Confirmed trips needed better control across booking files, passenger details, suppliers, invoices, receipts, documents, and margin review.",
    solution: "Build an ERP workflow that moves confirmed sales into structured booking files with supplier records, finance status, document tracking, and approvals.",
    outcomes: ["One booking file for sales, operations, and finance", "Supplier confirmations connected to service items", "Invoice, payment, and margin visibility", "Approval paths for exceptions and discounts"],
    link: "/travel-erp/"
  },
  {
    icon: "globe",
    tag: "Customer portal",
    title: "Corporate travel customer portal",
    challenge: "Corporate customers needed easier access to requests, traveller details, invoices, support messages, documents, and service status.",
    solution: "Plan a secure portal for customer login, trip status, invoice access, document downloads, support requests, and corporate travel milestones.",
    outcomes: ["Premium self-service customer experience", "Reduced repeated status questions", "Organized documents and invoice access", "Better support request history"],
    link: "/customer-portal/"
  },
  {
    icon: "chart",
    tag: "Website + CRM",
    title: "Corporate website with CRM-ready lead flow",
    challenge: "The brand needed a professional online presence that could explain products clearly and send qualified enquiries into a sales process.",
    solution: "Create premium corporate pages, product/service sections, SEO blog topics, demo paths, WhatsApp handoff, and structured contact forms.",
    outcomes: ["Stronger first impression for prospects", "Clear product positioning", "Lead details captured in a useful sales format", "Internal links from content to demo and product pages"],
    link: "/website-mobile-app-development/"
  },
  {
    icon: "plane",
    tag: "Booking operations",
    title: "Booking and supplier management system",
    challenge: "Operations teams needed a controlled way to manage service items, suppliers, confirmations, passenger data, vouchers, and booking status.",
    solution: "Create a booking desk structure with supplier hub records, service inventory, change requests, confirmation status, document tracking, and team ownership.",
    outcomes: ["Better visibility across active bookings", "Supplier and service records in one place", "Document and voucher status tracking", "Cleaner handoff from sales to operations"],
    link: "/lead-booking-management/"
  },
  {
    icon: "shield",
    tag: "Automation",
    title: "Follow-up and task automation rollout",
    challenge: "Manual reminders, document requests, internal handoffs, and daily reporting were slowing down sales and service teams.",
    solution: "Automate lead routing, follow-up reminders, document request triggers, task queues, status notifications, and management summary reports.",
    outcomes: ["Faster next-action visibility", "Fewer missed follow-ups", "More consistent customer communication", "Less manual report preparation"],
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
      <div class="case-copy">
        <strong>Practical outcomes</strong>
        ${list(item.outcomes)}
      </div>
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
          <p>See how CRM, ERP, portals, websites, booking workflows, and automation can work together for different travel operating models.</p>
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
          <h2>Use-case stories for the systems travel teams ask for most.</h2>
          <p class="muted">These are representative case study patterns that show how BANDEVI GLOBAL GROUP can shape CRM, ERP, portals, websites, booking operations, commerce, and automation around real business needs.</p>
          ${list(["Sales teams need faster lead ownership and follow-up control", "Operations teams need booking files, supplier records, documents, and approvals", "Customers need cleaner portal access, invoices, trip status, and support", "Leadership needs dashboards that connect sales, service, revenue, margin, and workload"])}
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
          <p>Each example is written as a practical project model, so prospects can recognize their own workflow and start with the right first release.</p>
        </div>
        ${caseStudyCards()}
      </div>
    </section>
    <section class="section dark">
      <div class="container">
        <div class="section-head">
          <h2>Outcome map for travel technology projects.</h2>
          <p>The first release should solve a real business bottleneck, then create a path to expand into connected systems.</p>
        </div>
        <div class="grid cols-4">
          ${[
            ["Faster response", "Reduce delays between enquiry capture, owner assignment, first contact, and quotation follow-up."],
            ["Cleaner handoffs", "Move confirmed work from sales to operations without losing customer, service, or supplier details."],
            ["Booking visibility", "Track passenger data, documents, suppliers, payment status, approvals, and open service tasks."],
            ["Premium service", "Give customers a controlled digital experience with portal access, status updates, and support history."]
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
    "CRM + ERP + Portal",
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
    "Travel CRM",
    "Travel ERP",
    "Customer portal",
    "Website or mobile app",
    "E-commerce solution",
    "Business automation",
    "Support or existing project",
    "Office or partnership"
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
          <label for="${kind}-interest">${demo ? "Product needed" : "Inquiry type"}</label>
          <select id="${kind}-interest" name="interest">
            ${optionList(interestOptions)}
          </select>
        </div>
        <div class="field">
          <label for="${kind}-business">Business type</label>
          <select id="${kind}-business" name="businessType">
            ${optionList(["IT or software project", "Masala / food products", "Makhana brand", "Astrology services", "Travel agency", "Tour operator", "DMC", "Corporate travel desk", "Hotel or supplier partner", "E-commerce or service business", "Other business"])}
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
            <label for="${kind}-budget">Budget range</label>
            <select id="${kind}-budget" name="budget">
              ${optionList(["Need guidance", "Under INR 1 lakh", "INR 1-3 lakh", "INR 3-10 lakh", "Enterprise / custom"])}
            </select>
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
          <textarea id="${kind}-message" name="message" placeholder="${demo ? "Example: We need CRM for leads, booking tracking, portal access, and reports." : "Tell us what you want to discuss."}" required></textarea>
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
          <h2>Bring your website, CRM, ERP, portal, commerce, and automation plan into one conversation.</h2>
          <p class="muted">Use the form to contact the BANDEVI GLOBAL GROUP sales desk for product demos, website projects, e-commerce, astrology service flows, office support, partnerships, and implementation planning.</p>
          ${cards([
            { icon: "mail", title: "Sales desk", text: contactInfo.email },
            { icon: "phone", title: "Call or WhatsApp", text: contactInfo.phoneDisplay },
            { icon: "globe", title: "Office network", text: "India, Dubai, London, and United States support presence for separate business projects." }
          ], 3)}
          <div class="inline-actions">
            <a class="button dark" href="${contactInfo.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp ${icons.message}</a>
            <a class="button light" href="${contactInfo.phoneHref}">Call ${icons.phone}</a>
          </div>
        </div>
        ${contactForm("contact")}
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
  `;
}

function demoPage() {
  return `
    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Demo request</span>
          <h2>Request a demo that is matched to your business workflow.</h2>
          <p class="muted">Tell us your business type, product need, team scale, timeline, and preferred contact method. The request opens as a clean WhatsApp lead message so the sales team can respond faster.</p>
          ${list(["Review your current sales, order, booking, service, and reporting workflow", "Select the right first modules across CRM, ERP, portal, website, e-commerce, automation, and analytics", "Discuss users, branches, rollout speed, and budget direction", "Map a phased delivery roadmap with launch and support options"])}
        </div>
        ${contactForm("demo")}
      </div>
    </section>
    <section class="section mist">
      <div class="container">
        <div class="section-head">
          <h2>What the demo can cover.</h2>
          <p>The walkthrough can focus on one urgent problem or show how the full product suite connects across the business.</p>
        </div>
        ${cards([
          { icon: "users", title: "Lead and sales flow", text: "Website enquiries, WhatsApp leads, assignment, follow-ups, quotations, pipeline stages, and source reporting." },
          { icon: "stack", title: "Operations flow", text: "Orders, bookings, consultations, suppliers, service items, documents, approvals, invoices, stock, and status tracking." },
          { icon: "globe", title: "Customer and partner portal", text: "Customer access for updates, invoices, documents, tickets, project milestones, booking status, and service communication." },
          { icon: "chart", title: "Management dashboards", text: "Conversion, workload, revenue, margin, stock, support quality, team performance, and operational bottlenecks." }
        ], 4)}
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
            ["Qualify", "Your request includes product need, business type, scale, timeline, budget range, and preferred contact."],
            ["Prepare", "The demo focus is matched to CRM, ERP, portal, website, automation, or complete suite requirements."],
            ["Show", "The walkthrough explains the user journey, admin controls, reporting, and rollout path."],
            ["Plan", "You receive a practical first-release direction with launch priorities and support options."]
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
          <p>Premium corporate websites, CRM, ERP, e-commerce, products, portals, and IT solutions for modern business lines.</p>
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
        ["budget", "Budget range"],
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


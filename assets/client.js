const asset = (name) => `/assets/${name}`;

const googleAnalyticsId = "G-TGK7Z8VNJX";

function trackAnalyticsEvent(eventName, parameters = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, parameters);
  }
}

if (googleAnalyticsId && !window.gtag) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", googleAnalyticsId);

  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
  document.head.appendChild(analyticsScript);
}

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
  ["Websites & Apps", "/website-mobile-app-development/", "webApp"],
  ["CRM & ERP", "/crm-erp-solutions/", "crmErp"],
  ["Travel Technology", "/travel-technology/", "travelTech"],
  ["Project Models", "/case-studies/", "cases"],
  ["Company", "/about-us/", "about"],
  ["Contact", "/contact-us/", "contact"]];


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

function bindNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  if (!toggle) return;
  function setOpen(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.innerHTML = open ? icons.close : icons.menu;
  }
  toggle.addEventListener("click", () => setOpen(!document.body.classList.contains("nav-open")));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && document.body.classList.contains("nav-open")) { setOpen(false); toggle.focus(); } });
  document.querySelectorAll(".primary-nav a").forEach(link => link.addEventListener("click", () => setOpen(false)));
  window.matchMedia("(min-width: 1181px)").addEventListener("change", event => { if (event.matches) setOpen(false); });
}

function bindForms() {
  document.querySelectorAll("[data-form]").forEach((form) => {
    const type = form.dataset.form;
    if (type === "demo") {
      const interest = form.elements.interest;
      const leadSource = form.elements.leadSource;
      const solutionByPath = {
        "/white-label-travel-website/": "White-label Travel Website Package",
        "/white-label-travel-portal/": "B2B Travel Portal Package",
        "/white-label-crm/": "White-label CRM Package",
        "/travel-crm-software/": "Travel CRM Software",
        "/travel-crm/": "Travel CRM",
        "/travel-erp/": "Travel ERP",
        "/travel-booking-software/": "Travel Technology Suite",
        "/tour-operator-software/": "Travel Technology Suite",
        "/dmc-software/": "Travel Technology Suite",
        "/travel-agency-website-development/": "Travel Website Package",
        "/travel-website-development/": "Travel Website Development",
        "/travel-mobile-app-development/": "Travel Agency Mobile App Package",
        "/travel-agency-mobile-app/": "Travel Agency Mobile App Package",
        "/b2b-travel-portal/": "B2B Travel Portal Package",
        "/flight-booking-engine/": "Flight Booking Engine Package",
        "/hotel-booking-engine/": "Hotel Booking Engine Package",
        "/crm-erp-solutions/": "CRM + ERP Package",
        "/custom-crm-development/": "Custom CRM Development",
        "/erp-software-development/": "ERP Software Development",
        "/custom-software-development/": "Custom Software Development",
        "/customer-portal/": "Customer Portal Package",
        "/ecommerce-website-development/": "E-Commerce Website Development",
        "/ecommerce-solutions/": "E-commerce Solution",
        "/business-process-automation/": "Business Process Automation",
        "/business-automation/": "Business Automation",
        "/website-mobile-app-development/": "Website + Mobile App",
        "/it-products/": "IT Products and Software Suite",
        "/travel-technology/": "Travel Technology Suite",
        "/lead-booking-management/": "Lead & Booking Management"
      };
      const currentUrl = new URL(window.location.href);
      const requestedSolution = currentUrl.searchParams.get("solution");
      let sourcePath = "";
      try {
        const referringUrl = document.referrer ? new URL(document.referrer) : null;
        if (referringUrl && referringUrl.origin === currentUrl.origin) sourcePath = referringUrl.pathname;
      } catch (_) {
        sourcePath = "";
      }
      const solutionAliases = {
        "ERP Software Demo": "Travel ERP Package", "Travel CRM": "Travel CRM Package", "Travel CRM Software": "Travel CRM Package", "Travel ERP": "Travel ERP Package",
        "Travel Technology Suite": "Complete Travel Website Package", "Travel Website Package": "Complete Travel Website Package", "Travel Website Development": "Complete Travel Website Package", "Travel Agency Mobile App Package": "Complete Travel Website Package",
        "CRM + ERP Package": "CRM & ERP Package", "Custom CRM Development": "CRM & ERP Package", "ERP Software Development": "CRM & ERP Package", "White-label CRM Package": "CRM & ERP Package",
        "Website + Mobile App": "Website / App Development Package", "Custom Software Development": "Website / App Development Package",
        "E-Commerce Website Development": "E-Commerce Package", "E-commerce Solution": "E-Commerce Package",
        "Business Process Automation": "Automation Package", "Business Automation": "Automation Package",
        "IT Products and Software Suite": "Need guidance", "Lead & Booking Management": "CRM & ERP Package", "Flight Booking Engine Package": "B2B Travel Portal Package", "Hotel Booking Engine Package": "B2B Travel Portal Package"
      };
      const requested = requestedSolution || solutionByPath[sourcePath];
      const selectedSolution = solutionAliases[requested] || requested;
      if (selectedSolution && Array.from(interest.options).some((option) => option.value === selectedSolution)) {
        interest.value = selectedSolution;
      }
      if (leadSource) leadSource.value = sourcePath || currentUrl.searchParams.get("source") || "Direct demo request";
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const note = form.querySelector(".form-note");
      if (type === "portal") {
        if (note) note.textContent = "Portal access preview received.";
        form.reset();
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      if (type === "contact" || type === "demo" || type === "home") {
        const button = form.querySelector('button[type="submit"]');
        if (form.dataset.sending === 'true') return;
        const payload = {
          type: type === "home" ? "contact" : type, name: data.name, email: data.email, phone: data.phone || '',
          interest: data.interest, message: data.message, website: data.website || '',
          source: window.location.pathname,
          campaign: ['utm_source','utm_medium','utm_campaign'].map(k => new URL(location.href).searchParams.get(k) || '').join(' / ').slice(0,500)
        };
        const serialized = JSON.stringify(payload);
        if (form.dataset.payload !== serialized) {
          form.dataset.requestId = crypto.randomUUID();
          form.dataset.payload = serialized;
        }
        form.dataset.sending = 'true';
        button.disabled = true;
        note.textContent = 'Sending your enquiry…';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch('/api/enquiries', {
            method: 'POST', credentials: 'same-origin', signal: controller.signal,
            headers: {'Content-Type':'application/json', 'Idempotency-Key':form.dataset.requestId},
            body: serialized
          });
          const result = await response.json();
          if (!response.ok || result.ok !== true || !/^BG-[A-F0-9]{16}$/.test(result.reference || '')) {
            if (response.status === 409) delete form.dataset.payload;
            throw new Error(result.error || 'Unable to confirm your enquiry.');
          }
          note.textContent = 'Your enquiry has been saved. Reference: ' + result.reference + '. Keep this reference for follow-up.';
          trackAnalyticsEvent('generate_lead', {lead_type:type, page_location:location.origin + location.pathname});
          form.reset();
          delete form.dataset.payload;
          delete form.dataset.requestId;
        } catch (error) {
          note.textContent = (error.name === 'AbortError' ? 'We could not confirm receipt. Retry this form to check safely.' : error.message) + ' Your draft is retained. You can also ';
          const email = document.createElement('a'); email.href = 'mailto:' + contactInfo.email; email.textContent = 'email the team';
          const whatsapp = document.createElement('a'); whatsapp.href = contactInfo.whatsapp; whatsapp.target = '_blank'; whatsapp.rel = 'noopener noreferrer'; whatsapp.textContent = 'use WhatsApp';
          note.append(email, ' or ', whatsapp, '.');
        } finally {
          clearTimeout(timeout); button.disabled = false; delete form.dataset.sending;
        }
        return;
      }
      const label = type === "demo" ? "Demo request" : type === "review" ? "Client feedback and case study approval" : "Contact inquiry";
      const currentUrl = new URL(window.location.href);
      const campaignDetails = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]
        .map((key) => [key.replace("utm_", "").replace(/^./, (letter) => letter.toUpperCase()), currentUrl.searchParams.get(key)])
        .filter(([, value]) => value)
        .map(([label, value]) => `${label}: ${value}`);
      const fieldLabels = [
        ["name", "Name"],
        ["company", "Company"],
        ["service", "Service received"],
        ["project", "Project or engagement reference"],
        ["feedback", "Client feedback"],
        ["approval", "Publication approval"],
        ["leadSource", "Solution page source"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["interest", "Product / inquiry"],
        ["businessType", "Business type"],
        ["timeline", "Timeline"],
        ["preferredContact", "Preferred contact"],
        ["scale", "Team / branch scale"],
        ["priority", "Main business objective"],
        ["decisionStage", "Decision stage"],
        ["budget", "Budget range"],
        ["currentWebsite", "Current website / reference"],
        ["officeRegion", "Office / region"],
        ["message", type === "demo" ? "Demo goals / current problem" : "Message"]
      ];
      const lines = [
        `New ${label} from BANDEVI website`,
        `Page: ${document.title}`,
        `URL: ${currentUrl.origin}${currentUrl.pathname}`,
        ...(campaignDetails.length ? ["Campaign attribution:", ...campaignDetails] : []),
        ...(document.referrer ? [`Referrer: ${document.referrer}`] : []),
        ...fieldLabels
          .map(([key, title]) => [title, (data[key] || "").trim()])
          .filter(([, value]) => value)
          .map(([title, value]) => `${title}: ${value}`)
      ];

      const message = lines.join("\n");
      const whatsappUrl = `${contactInfo.whatsapp}?text=${encodeURIComponent(message)}`;
      const mailUrl = `mailto:${contactInfo.email}?subject=${encodeURIComponent(label)}&body=${encodeURIComponent(message)}`;

      trackAnalyticsEvent("generate_lead", {
        lead_type: type,
        page_location: window.location.href,
        page_title: document.title
      });

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (note) {
        const messageType = type === "review" ? "Your feedback request" : "Your lead message";
        note.innerHTML = `${messageType} is ready. <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">Send on WhatsApp</a> or <a href="${mailUrl}">send by email</a>.`;
      }
    });
  });
}

function bindAnalyticsEvents() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    if (href.startsWith("/demo-request/")) {
      const currentUrl = new URL(window.location.href);
      const demoUrl = new URL(href, currentUrl.origin);
      const campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

      demoUrl.searchParams.set("source", currentUrl.pathname);
      campaignKeys.forEach((key) => {
        const value = currentUrl.searchParams.get(key);
        if (value) demoUrl.searchParams.set(key, value);
      });

      link.href = `${demoUrl.pathname}${demoUrl.search}${demoUrl.hash}`;
      trackAnalyticsEvent("select_content", {
        content_type: "demo_cta",
        content_name: link.textContent.trim().replace(/\s+/g, " "),
        page_location: window.location.href,
        page_title: document.title
      });
    }

    const contactMethod = href.startsWith("mailto:")
      ? "email"
      : href.startsWith("tel:")
        ? "phone"
        : href.includes("wa.me/")
          ? "whatsapp"
          : "";

    if (contactMethod) {
      trackAnalyticsEvent("generate_lead", {
        lead_type: `${contactMethod}_click`,
        contact_method: contactMethod,
        page_location: window.location.href,
        page_title: document.title
      });
    }
  });
}


bindNav();
bindForms();
bindAnalyticsEvents();

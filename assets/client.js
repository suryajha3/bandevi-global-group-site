const asset = (name) => `/assets/${name}`;


const attributionChannels = ['organic_search','paid','campaign','referral','direct_unknown','unknown'];
function publicPagePath() {
  try { return new URL(document.querySelector('link[rel="canonical"]').href).pathname; } catch (_) { return '/'; }
}
function campaignLabel(value) { return /^[a-zA-Z0-9_-]{1,80}$/.test(value || '') ? value : ''; }
function sourceAttribution() {
  const key='bg_enquiry_attribution_v1', now=Date.now();
  const url=new URL(location.href);const utm_source=campaignLabel(url.searchParams.get('utm_source'));
  const utm_medium=campaignLabel(url.searchParams.get('utm_medium'));const utm_campaign=campaignLabel(url.searchParams.get('utm_campaign'));
  const paid=['gclid','msclkid','wbraid','gbraid'].some(k=>url.searchParams.has(k)) || /^(cpc|ppc|paid|paid_search|paid_social|display|cpm)$/i.test(utm_medium);
  let referrer_domain='',external=false,internal=false;
  try { const r=new URL(document.referrer);external=r.origin!==url.origin;internal=!external;if(external)referrer_domain=r.hostname.toLowerCase(); } catch (_) {}
  const tagged=paid||!!(utm_source||utm_medium||utm_campaign);
  try { const saved=JSON.parse(sessionStorage.getItem(key));if(!external&&saved&&saved.expires>now&&attributionChannels.includes(saved.channel)&&/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(saved.landing_page)&&(!tagged||internal&&saved.utm_source===utm_source&&saved.utm_medium===utm_medium&&saved.utm_campaign===utm_campaign))return saved; } catch (_) {}
  const organic=/^(www\.)?google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/.test(referrer_domain) || /^(www\.)?(bing\.com|duckduckgo\.com|ecosia\.org)$/.test(referrer_domain) || ['search.yahoo.com','search.brave.com'].includes(referrer_domain);
  const value={channel:paid?'paid':tagged?'campaign':organic?'organic_search':external?'referral':'direct_unknown',landing_page:publicPagePath(),referrer_domain,utm_source,utm_medium,utm_campaign,expires:now+30*60*1000};
  try { sessionStorage.setItem(key,JSON.stringify(value)); } catch (_) {}
  return value;
}
const enquiryAttribution=sourceAttribution();
function safeReferrerOrigin() {try {return new URL(document.referrer).origin;}catch(_){return '';}}
function enquiryAnalytics(form,type,reference) {
  const key='bg_measured_enquiries_v1';let sent=[];
  try {sent=JSON.parse(sessionStorage.getItem(key))||[];}catch(_){}
  if(!Array.isArray(sent))sent=[];if(sent.includes(reference))return;
  sent.push(reference);try {sessionStorage.setItem(key,JSON.stringify(sent.slice(-100)));}catch(_){}
  const services={'Website / App Development Package':'website_app','CRM & ERP Package':'crm_erp','Travel CRM Package':'travel_crm','Travel ERP Package':'travel_erp','Complete Travel Website Package':'travel_website','White-label Travel Website Package':'white_label_website','B2B Travel Portal Package':'b2b_portal','Customer Portal Package':'customer_portal','E-Commerce Package':'ecommerce','Automation Package':'automation','Need guidance':'guidance','Travel Technology Planning':'travel_technology'};
  trackAnalyticsEvent('generate_lead',{lead_type:type,service_interest:services[form.elements.interest.value]||'other',acquisition_channel:enquiryAttribution.channel,landing_page:enquiryAttribution.landing_page,page_location:location.origin+publicPagePath()});
}

const googleAnalyticsId = "G-TGK7Z8VNJX";

function trackAnalyticsEvent(eventName, parameters = {}) {
  if (navigator.doNotTrack === "1") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, parameters);
  }
}

if (googleAnalyticsId && !window.gtag && navigator.doNotTrack !== "1") {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", googleAnalyticsId, {page_location:location.origin+publicPagePath(),page_referrer:safeReferrerOrigin(),allow_google_signals:false,allow_ad_personalization_signals:false});

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

function bindServicePreview() {
  document.querySelectorAll('[data-service-preview]').forEach(group=>{
    const tabs=Array.from(group.querySelectorAll('[role="tab"]')),panels=Array.from(group.querySelectorAll('.preview-panel'));
    group.querySelector('[role="tablist"]').hidden=false;
    function select(index,focus=false){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',tab.id);});const visual=document.querySelector("[data-service-visual]"),caption=document.querySelector("[data-service-caption]");if(visual){visual.src=["/assets/service-website.svg","/assets/service-crm.svg","/assets/service-travel.svg"][index];visual.alt=["Illustrative website and app workflow from service discovery to enquiry and sales handover","Illustrative CRM and ERP workflow connecting sales, operations and reporting","Illustrative travel workflow connecting enquiries, booking coordination and customer service"][index];caption.textContent=["Website & App workflow concept. Your proposal confirms the pages, forms and handover included.","CRM & ERP workflow concept. Your proposal confirms the records, permissions and reports included.","Travel Technology workflow concept. Your proposal confirms the enquiry, booking and supplier tools included."][index];}if(focus)tabs[index].focus();}
    tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(i+1)%tabs.length;else if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next,true);});});select(0);
  });
}
function bindNav() {
  bindServicePreview();
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
  document.querySelectorAll('[data-demo-planner]').forEach(form=>form.addEventListener('submit',()=>trackAnalyticsEvent('select_content',{content_type:'demo_brief',content_name:form.dataset.demoPlanner==='erp'?'travel_erp':'travel_crm',page_location:location.origin+publicPagePath()})));

  document.querySelectorAll("[data-form]").forEach((form) => {
    const type = form.dataset.form;
    if (type === "demo") {
      const demoDate=form.elements.demoDate,demoTime=form.elements.demoTime;
      function checkDemoTime(){
        if(!demoDate||!demoTime)return;
        const indiaNow=new Date(Date.now()+330*60000).toISOString().slice(0,10);
        demoDate.min=indiaNow;demoDate.max=new Date(Date.now()+180*86400000+330*60000).toISOString().slice(0,10);
        demoDate.required=!!demoTime.value;demoTime.required=!!demoDate.value;
        demoTime.setCustomValidity(demoDate.value&&demoTime.value&&Date.parse(demoDate.value+'T'+demoTime.value+':00+05:30')<=Date.now()?'Choose a future date and time in IST.':'');
      }
      if(demoDate&&demoTime){for(const field of [demoDate,demoTime])field.addEventListener('input',checkDemoTime);form.addEventListener('reset',()=>queueMicrotask(checkDemoTime));checkDemoTime();}
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
        "Travel Technology Suite": "Travel Technology Planning", "Travel Website Package": "Complete Travel Website Package", "Travel Website Development": "Complete Travel Website Package", "Travel Agency Mobile App Package": "Complete Travel Website Package",
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
      const focusLabels={'crm-enquiries':'Enquiry capture and consultant ownership','crm-quotes':'Quotation history and follow-ups','crm-reporting':'Sales reporting and role permissions','crm-handover':'Sales-to-booking handover','erp-bookings':'Booking files and service tasks','erp-suppliers':'Supplier confirmations and costs','erp-finance':'Payment status and approval rules','erp-handover':'CRM-to-operations handover'};
      Object.assign(focusLabels,{'website-journey':'Website pages and customer enquiry journey','website-portal':'Customer portal or app workflow','business-leads':'Lead ownership, quotations and follow-ups','business-operations':'Orders, approvals and operational reporting'});
      const focus=currentUrl.searchParams.get('focus'),teamLabels={'1-5':'1–5 users','6-20':'6–20 users','21-plus':'21 or more users','unsure':'Still deciding'},team=teamLabels[currentUrl.searchParams.get('team')];
      const focusOptions={
        'Travel Technology Planning':['website-journey','crm-enquiries','erp-bookings'],
        'Website / App Development Package':['website-journey','website-portal'],
        'CRM & ERP Package':['business-leads','business-operations'],
        'Travel CRM Package':['crm-enquiries','crm-quotes','crm-reporting','crm-handover'],
        'Travel ERP Package':['erp-bookings','erp-suppliers','erp-finance','erp-handover'],
        'Complete Travel Website Package':['website-journey','website-portal']
      };
      const demoFocus=form.elements.demoFocus,note=form.querySelector('.demo-focus-note');
      function updateDemoFocus(requestedFocus){
        if(!demoFocus)return;
        demoFocus.replaceChildren(new Option('Discuss with the team',''));
        for(const key of focusOptions[interest.value]||[])demoFocus.add(new Option(focusLabels[key],key));
        if(Array.from(demoFocus.options).some(o=>o.value===requestedFocus))demoFocus.value=requestedFocus;
        if(note)note.textContent='Walkthrough topics for '+(interest.value||'your selected service')+'. Available modules and integrations are confirmed with the team.';
      }
      updateDemoFocus(focus);interest.addEventListener('change',()=>updateDemoFocus(''));form.addEventListener('reset',()=>queueMicrotask(()=>updateDemoFocus('')));
      const matches=focus && ((selectedSolution==='Travel CRM Package' && focus.startsWith('crm-')) || (selectedSolution==='Travel ERP Package' && focus.startsWith('erp-')));
      if (matches && focusLabels[focus] && !form.elements.message.value) {
        form.elements.message.value='Demo focus: '+focusLabels[focus]+(team?'\nExpected users: '+team:'')+'\nPlease show the workflow, role permissions and available modules, and discuss implementation scope and support.';
      }

    }

    if (type === 'contact') {
      const requests = {
        'company-records': 'Please identify the legal entity that will contract and invoice for my project. Share its registered address and applicable registration or certificate numbers, issuing authorities, scope, validity and official verification links. Please identify any record that is not applicable or not available.',
        'client-reference': 'Please share a client-approved project reference relevant to my requirements, including BANDEVI’s delivery role, delivered scope, completion period, approved screenshots or a public link, and the source and period of any measured outcomes. Please confirm which material is approved for sharing.'
      };
      const request = new URL(window.location.href).searchParams.get('request');
      if (requests[request] && !form.elements.message.value) {
        form.elements.message.value = requests[request];
        if (!form.elements.interest.value) form.elements.interest.value = 'Need guidance';
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const note = form.querySelector(".form-note");
      if (type === "portal") {
        if (note) note.textContent = "Portal access preview received.";
        form.reset();
        return;
      }

      if(type==='demo'){
        const demoDate=form.elements.demoDate,demoTime=form.elements.demoTime;
        if(demoDate&&demoTime){demoDate.dispatchEvent(new Event('input'));if(!form.reportValidity())return;}
      }
      const data = Object.fromEntries(new FormData(form).entries());
      if (type === "contact" || type === "demo" || type === "home") {
        const button = form.querySelector('button[type="submit"]');
        if (form.dataset.sending === 'true') return;
        const payload = {
          type: type === "home" ? "contact" : type, name: data.name, email: data.email, phone: data.phone || '',
          interest: data.interest, message: [(data.businessType ? 'Business type: '+data.businessType : ''),(data.demoFocus && form.elements.demoFocus ? 'Requested walkthrough: '+form.elements.demoFocus.options[form.elements.demoFocus.selectedIndex].text : ''),data.message].filter(Boolean).join('\n'), website: data.website || '',
          source: window.location.pathname,
          campaign: [enquiryAttribution.utm_source,enquiryAttribution.utm_medium,enquiryAttribution.utm_campaign].join(' / '),
          ...(type==='demo'&&data.demoDate&&data.demoTime?{demoSchedule:{date:data.demoDate,time:data.demoTime,timezone:'Asia/Kolkata'}}:{}),
          attribution: Object.fromEntries(Object.entries(enquiryAttribution).filter(([key])=>key!=='expires'))
        };
        if(payload.message.length>3000){note.textContent="Please shorten your description so your enquiry, including the selected business type and demo focus, fits within 3,000 characters.";return;}
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
          if(type==='demo')note.textContent+=(payload.demoSchedule?' Preferred time: '+payload.demoSchedule.date+' at '+payload.demoSchedule.time+' IST (UTC+05:30).':'')+' Your demo time is not booked yet. The team will contact you to confirm availability and meeting details.';
          enquiryAnalytics(form,type,result.reference);
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

      trackAnalyticsEvent("enquiry_handoff", {
        lead_type: type,
        page_location: location.origin + publicPagePath(),
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
        const value = campaignLabel(currentUrl.searchParams.get(key));
        if (value) demoUrl.searchParams.set(key, value);
      });

      link.href = `${demoUrl.pathname}${demoUrl.search}${demoUrl.hash}`;
      trackAnalyticsEvent("select_content", {
        content_type: "demo_cta",
        content_name: link.textContent.trim().replace(/\s+/g, " "),
        page_location: location.origin + publicPagePath(),
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
      trackAnalyticsEvent("contact_click", {
        lead_type: `${contactMethod}_click`,
        contact_method: contactMethod,
        page_location: location.origin + publicPagePath(),
        page_title: document.title
      });
    }
  });
}


bindNav();
bindForms();
bindAnalyticsEvents();

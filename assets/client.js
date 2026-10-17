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
if(!document.querySelector('script[data-journey-measurement]')){const measurementScript=document.createElement('script');measurementScript.src='/assets/enquiry-measurement.js?v=20261016-consent';measurementScript.dataset.journeyMeasurement='true';document.head.append(measurementScript);}
function safeReferrerOrigin() {try {return new URL(document.referrer).origin;}catch(_){return '';}}
function enquiryAnalytics(form,type,reference) {
  const key='bg_measured_enquiries_v1';let sent=[];
  try {sent=JSON.parse(sessionStorage.getItem(key))||[];}catch(_){}
  if(!Array.isArray(sent))sent=[];if(sent.includes(reference))return;
  sent.push(reference);try {sessionStorage.setItem(key,JSON.stringify(sent.slice(-100)));}catch(_){}
  const services={'Website / App Development Package':'website_app','CRM & ERP Package':'crm_erp','Travel CRM Package':'travel_crm','Travel ERP Package':'travel_erp','Complete Travel Website Package':'travel_website','White-label Travel Website Package':'white_label_website','B2B Travel Portal Package':'b2b_portal','Customer Portal Package':'customer_portal','E-Commerce Package':'ecommerce','Automation Package':'automation','Need guidance':'guidance','Travel Technology Planning':'travel_technology'};
  trackAnalyticsEvent('generate_lead',{...(['GB','US','IN','other'].includes(form.elements.projectCountry?.value)?{project_market:form.elements.projectCountry.value}:{}),lead_type:type,service_interest:services[form.elements.interest.value]||'other',acquisition_channel:enquiryAttribution.channel,landing_page:enquiryAttribution.landing_page,page_location:location.origin+publicPagePath()});
}

const googleAnalyticsId = "G-TGK7Z8VNJX";

// Basic opt-in: no Google tag or anonymous journey requests before permission.
const analyticsConsent = (() => {
  const key = 'bg_analytics_consent_v1';
  const maxAge = 180 * 86400000;
  let choice = 'unknown', loaded = false, panel, settings;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && ['granted','denied'].includes(saved.choice) && saved.expires > Date.now() && saved.expires <= Date.now()+maxAge) choice = saved.choice;
  } catch (_) {}
  const allowed = () => choice === 'granted' && navigator.doNotTrack !== '1';
  function clearAnalyticsCookies() {
    const host = location.hostname.split('.');
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) continue;
      document.cookie = name+'=; Max-Age=0; path=/; SameSite=Lax';
      for (let i=0;i<host.length-1;i++) document.cookie = name+'=; Max-Age=0; path=/; domain=.'+host.slice(i).join('.')+'; SameSite=Lax';
    }
  }
  function apply() {
    window['ga-disable-'+googleAnalyticsId] = !allowed();
    if (allowed()) {
      if (!loaded) {
        loaded = true;
        window.dataLayer = window.dataLayer || [];
        if (typeof window.gtag !== 'function') window.gtag = function(){window.dataLayer.push(arguments);};
        window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
        window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
        window.gtag('js',new Date());
        window.gtag('config',googleAnalyticsId,{page_location:location.origin+publicPagePath(),page_referrer:safeReferrerOrigin(),allow_google_signals:false,allow_ad_personalization_signals:false});
        if (!document.querySelector('script[data-bg-google-analytics]')) {
          const script=document.createElement('script');script.async=true;script.dataset.bgGoogleAnalytics='true';script.src='https://www.googletagmanager.com/gtag/js?id='+googleAnalyticsId;document.head.append(script);
        }
      } else window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    } else {
      // The disable flag stops the loaded tag, including future automatic events.
      // Do not issue a consent update here: the library sends a status ping on withdrawal.
      clearAnalyticsCookies();
    }
    document.dispatchEvent(new CustomEvent('bg-analytics-consent-change'));
  }
  function choose(value) {
    choice=value;
    try {localStorage.setItem(key,JSON.stringify({choice,expires:Date.now()+maxAge}));}catch(_){}
    apply();panel.hidden=true;document.getElementById('main-content')?.focus({preventScroll:true});
  }
  function init() {
    if (!document.body.hasAttribute('data-page')) return;
    const style=document.createElement('style');
    style.textContent='#bg-analytics-choice{background:#202427;color:#fff;border-bottom:1px solid #bda578;padding:20px max(20px,calc((100% - 1180px)/2));font:16px/1.5 system-ui,sans-serif}#bg-analytics-choice[hidden]{display:none}#bg-analytics-choice h2{font-size:20px;color:#f1dfbb;margin:0 0 8px}#bg-analytics-choice p{max-width:850px;margin:0 0 12px}#bg-analytics-choice a{color:#f1dfbb;text-decoration:underline}#bg-analytics-choice .bg-consent-actions{display:flex;flex-wrap:wrap;gap:12px}#bg-analytics-choice button{padding:12px 18px;min-height:44px;border:1px solid #e5cea2;border-radius:6px;background:#e5cea2;color:#161b1e;font:600 15px/1.4 system-ui,sans-serif;cursor:pointer}#bg-analytics-choice button:disabled{opacity:.65;cursor:not-allowed}#bg-analytics-choice button:focus-visible,#bg-analytics-settings:focus-visible{outline:3px solid #55cbd4;outline-offset:3px}#bg-analytics-settings{display:block;margin:16px auto 88px;padding:12px 18px;border:1px solid #515b61;border-radius:6px;background:#202427;color:#fff;font:600 15px/1.4 system-ui,sans-serif;cursor:pointer}';document.head.append(style);
    panel=document.createElement('section');panel.id='bg-analytics-choice';panel.setAttribute('aria-labelledby','bg-analytics-heading');
    panel.innerHTML='<h2 id="bg-analytics-heading">Your analytics choice</h2><p>With your permission, we use Google Analytics and anonymous form-journey measurement to understand how this website is used. You can send an enquiry with analytics off. We remember your choice for six months. <a href="/privacy-policy/#analytics-choice">Privacy information</a>.</p><p data-bg-consent-status></p><div class="bg-consent-actions"><button type="button" data-bg-consent="denied">Decline analytics</button><button type="button" data-bg-consent="granted">Allow analytics</button></div>';
    panel.hidden=true;document.body.append(panel);
    settings=document.createElement('button');settings.type='button';settings.id='bg-analytics-settings';settings.textContent='Analytics preferences';settings.setAttribute('aria-controls',panel.id);document.body.append(settings);
    settings.addEventListener('click',()=>{panel.querySelector('[data-bg-consent-status]').textContent=navigator.doNotTrack==='1'?'Do Not Track is enabled in your browser. Analytics will remain off.':choice==='granted'?'Analytics is currently allowed.':'Analytics is currently off.';panel.hidden=false;panel.querySelector('button').focus();panel.scrollIntoView({block:'start'});});
    panel.querySelector('[data-bg-consent-status]').textContent=navigator.doNotTrack==='1'?'Do Not Track is enabled in your browser. Analytics will remain off.':choice==='granted'?'Analytics is currently allowed.':choice==='denied'?'Analytics is currently off.':'';
    panel.querySelector('[data-bg-consent="granted"]').disabled=navigator.doNotTrack==='1';
    panel.querySelectorAll('[data-bg-consent]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.bgConsent)));
    apply();
  }
  window.addEventListener('storage',e=>{if(e.key!==key)return;try{const saved=JSON.parse(e.newValue);choice=saved&&['granted','denied'].includes(saved.choice)&&saved.expires>Date.now()?saved.choice:'unknown';}catch(_){choice='unknown';}apply();if(panel)panel.hidden=true;});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  return {allowed};
})();
window.bgAnalyticsConsent=analyticsConsent;

function trackAnalyticsEvent(eventName, parameters = {}) {
  if (!analyticsConsent.allowed()) return;
  if (typeof window.gtag === 'function') window.gtag('event',eventName,parameters);
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
  phoneDisplay: "+91 7011040474",
  phoneHref: "tel:+917011040474",
  email: "sales@bandeviglobalgroup.com",
  whatsapp: "https://wa.me/917011040474"
};

function bindServicePreview() {
  document.querySelectorAll('[data-service-preview]').forEach(group=>{
    const tabs=Array.from(group.querySelectorAll('[role="tab"]')),panels=Array.from(group.querySelectorAll('.preview-panel'));
    group.querySelector('[role="tablist"]').hidden=false;
    function select(index,focus=false){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',tab.id);});const visual=document.querySelector("[data-service-visual]"),caption=document.querySelector("[data-service-caption]");if(visual){visual.src=["/assets/service-website.svg","/assets/service-crm.svg","/assets/service-travel.svg"][index];visual.alt=["Illustrative website and app workflow from service discovery to enquiry and sales handover","Illustrative CRM and ERP workflow connecting sales, operations and reporting","Illustrative travel workflow connecting enquiries, booking coordination and customer service"][index];caption.textContent=["Website & App workflow concept. Your proposal confirms the pages, forms and handover included.","CRM & ERP workflow concept. Your proposal confirms the records, permissions and reports included.","Travel Technology workflow concept. Your proposal confirms the enquiry, booking and supplier tools included."][index];}if(focus)tabs[index].focus();}
    tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(i+1)%tabs.length;else if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next,true);});});select(0);
  });
}
function bindMobileContact() {
  const bar = document.querySelector('.mobile-contact-bar');
  if (!bar) return;
  document.body.classList.add('has-mobile-contact');
  // Keep focused controls and visible forms/footer clear of the fixed bar.
  const visible = new Set();
  function update() {
    const editing = document.activeElement && document.activeElement.matches('input, textarea, select, [contenteditable="true"]');
    bar.hidden = visible.size > 0 || Boolean(editing);
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); });
    update();
  });
  document.querySelectorAll('main form[data-form], .footer').forEach(element => observer.observe(element));
  document.addEventListener('focusin', update);
  document.addEventListener('focusout', () => setTimeout(update, 0));
  if (document.body.dataset.page === 'demo') bar.querySelector('.mobile-contact-demo').href = '#demo-form';
  update();
}

function bindProjectFilters() {
  const section = document.querySelector('.project-directory');
  if (!section) return;
  const filters = section.querySelector('.project-filters');
  filters.hidden = false;
  filters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    filters.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    let count = 0;
    section.querySelectorAll('[data-project-category]').forEach(card => {
      card.hidden = button.dataset.projectFilter !== 'all' && card.dataset.projectCategory !== button.dataset.projectFilter;
      if (!card.hidden) count++;
    });
    section.querySelector('.project-filter-count').textContent = count + ' documented project reference' + (count === 1 ? '' : 's');
    section.querySelector('.project-filter-empty').hidden = count > 0;
  }));
}

function bindNav() {
  bindProjectFilters();
  bindMobileContact();
  bindServicePreview();

  const dropdowns = Array.from(document.querySelectorAll(".nav-dropdown"));
  const canonical = document.querySelector('link[rel="canonical"]');
  const currentPath = canonical ? new URL(canonical.href).pathname : location.pathname;
  document.querySelectorAll('.primary-nav a').forEach(link => {
    const target = new URL(link.href);
    if (!target.hash && target.pathname === currentPath) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
      const parent = link.closest('.nav-dropdown');
      if (parent) parent.querySelector('summary').classList.add('is-active');
    }
  });
  dropdowns.forEach(detail => {
    detail.querySelector('summary').addEventListener('click', () => { dropdowns.forEach(other => { if (other !== detail) other.open = false; }); });
    detail.addEventListener('keydown', event => { if (event.key === 'Tab') setTimeout(() => { if (!detail.contains(document.activeElement)) detail.open = false; }, 0); });
  });
  document.addEventListener('click', event => { dropdowns.forEach(detail => { if (!detail.contains(event.target)) detail.open = false; }); });
  document.addEventListener('keydown', event => {
    const open = dropdowns.find(detail => detail.open);
    if (event.key === 'Escape' && open) { open.open = false; open.querySelector('summary').focus(); event.stopImmediatePropagation(); }
  });
  const compactFooter = window.matchMedia('(max-width: 540px)');
  const disclosures = document.querySelectorAll('.footer-disclosure');
  function sizeFooter() { disclosures.forEach(detail => { detail.open = !compactFooter.matches; }); }
  sizeFooter();
  compactFooter.addEventListener('change', sizeFooter);
  disclosures.forEach(detail => detail.querySelector('summary').addEventListener('click', event => { if (!compactFooter.matches) event.preventDefault(); }));
  const toggle = document.querySelector("[data-nav-toggle]");
  if (!toggle) return;
  function setOpen(open) {
    document.body.classList.toggle("nav-open", open);
    if (!open) dropdowns.forEach(detail => { detail.open = false; });
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.innerHTML = open ? icons.close : icons.menu;
  }
  toggle.addEventListener("click", () => setOpen(!document.body.classList.contains("nav-open")));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && document.body.classList.contains("nav-open")) { setOpen(false); toggle.focus(); } });
  // Let the native link navigate before closing its details container.
  document.querySelectorAll(".primary-nav a").forEach(link => link.addEventListener("click", () => setTimeout(() => setOpen(false), 0)));
  window.matchMedia("(min-width: 1181px)").addEventListener("change", event => { if (event.matches) setOpen(false); });
}

function enquiryMessage(form, data) {
  return [
    ['INR','USD','GBP','EUR'].includes(data.quoteCurrency) ? 'Preferred quote currency: ' + data.quoteCurrency : '',
    ['GB','US','IN','other'].includes(data.projectCountry) ? 'Business country: ' + ({GB:'United Kingdom',US:'United States',IN:'India',other:'Another country'})[data.projectCountry] : '',
    data.projectBudget ? 'Planning budget: ' + data.projectBudget.trim() : '',
    data.contactChannel && data.contactChannel!=='Discuss' ? 'Preferred contact method: '+data.contactChannel : '',
    data.contactDate && data.contactTime ? 'Preferred contact (not confirmed): '+data.contactDate+' '+data.contactTime+' '+data.contactTimezone : '',
    data.contactTimezone ? 'Customer time zone: '+data.contactTimezone : '',
    ['Within 1 month','1–3 months','3–6 months','More than 6 months','Exploring options'].includes(data.projectLaunch) ? 'Target launch window: ' + data.projectLaunch : '',
    data.businessType ? 'Business type: ' + data.businessType : '',
    data.demoFocus && form.elements.demoFocus ? 'Requested walkthrough: ' + form.elements.demoFocus.options[form.elements.demoFocus.selectedIndex].text : '',
    form.dataset.projectReference ? 'Project reference: ' + form.dataset.projectReference + ' (public interface example)' : '',
    data.projectContext ? form.querySelector('[data-enquiry-context-label]').textContent + ': ' + data.projectContext.trim() : '',
    data.projectPriority ? form.querySelector('[data-enquiry-priority-label]').textContent + ': ' + data.projectPriority.trim() : '',
    data.message
  ].filter(Boolean).join('\n');
}

function bindEnquiryJourney(form) {
  const questions = form.querySelector('[data-enquiry-questions]');
  if (!questions) return;
  const interest = form.elements.interest, message = form.elements.message;
  const plans = {
    website: ['Which pages or app screens do you need? What should visitors be able to do?', 'Current website or app (optional)', 'Pages or features to prioritise (optional)'],
    crm: ['Which sales or operations task is hardest to manage today? What would improve it?', 'Current CRM, spreadsheets or tools (optional)', 'Workflow or reporting priorities (optional)'],
    travel: ['Who will use your portal, and which enquiry or booking steps do you need?', 'Travel business and current tools (optional)', 'Services and journey to prioritise (optional)'],
    portal: ['Who needs access, and what should they be able to view or do?', 'Portal users and current tools (optional)', 'Customer actions to prioritise (optional)'],
    commerce: ['What do you sell, and how should customers browse, order or pay?', 'Current store and product range (optional)', 'Shopping features to prioritise (optional)'],
    automation: ['Which repeated task takes the most time? Describe its inputs and expected result.', 'Current tools and repeated task (optional)', 'Automation outcome to prioritise (optional)'],
    guidance: ['Describe the problem and what a useful first release would do.', 'Current process or tools (optional)', 'Most important improvement (optional)']
  };
  const services = {
    'Website / App Development Package': 'website', 'CRM & ERP Package': 'crm', 'Website development':'website','Mobile app development':'website','Custom CRM development':'crm','ERP & business software':'crm','E-commerce development':'commerce','Custom software & integrations':'automation','Maintenance & support':'guidance',
    'Travel CRM Package': 'crm', 'Travel ERP Package': 'crm', 'Complete Travel Website Package': 'travel',
    'White-label Travel Website Package': 'travel', 'B2B Travel Portal Package': 'travel',
    'Customer Portal Package': 'portal', 'E-Commerce Package': 'commerce',
    'Automation Package': 'automation', 'Need guidance': 'guidance'
  };
  const projects = { bandevi_website: ['BANDEVI website', '/projects/bandevi-website/', 'Website / App Development Package'], trip_sarathi: ['Trip Sarathi', '/projects/trip-sarathi/'], maximtrip: ['MaximTrip', '/projects/maximtrip/'], tripodeal: ['TripOdeal', '/projects/tripodeal/'] };
  const requestedProject = new URL(location.href).searchParams.get('project');
  const project = Object.hasOwn(projects, requestedProject) ? projects[requestedProject] : null;
  if (project) {
    form.dataset.projectReference = project[0];
    if (!interest.value) interest.value = project[2] || 'Complete Travel Website Package';
    const context = form.querySelector('[data-enquiry-project]');
    context.hidden = false;
    const link = document.createElement('a'); link.href = project[1]; link.textContent = project[0];
    context.append('Your chosen example: ', link, '. We’ll discuss your own scope separately.');
  }
  function countMessage() {
    const data = Object.fromEntries(new FormData(form).entries());
    const length = enquiryMessage(form, data).length;
    const available = Math.max(0, 3000 - (length - message.value.length));
    message.maxLength = available;
    message.setCustomValidity(length > 3000 ? 'Shorten your description or optional details to fit within 3,000 characters.' : '');
    form.querySelector('[data-enquiry-count]').textContent = length > 3000 ? (length - 3000) + ' characters over the limit. Shorten your description or optional details.' : (3000 - length).toLocaleString('en-IN') + ' characters remaining, including optional details.';
  }
  function selectService(clearAnswers) {
    if (clearAnswers) { form.elements.projectContext.value = ''; form.elements.projectPriority.value = ''; }
    const plan = plans[services[interest.value] || 'guidance'];
    questions.hidden = !interest.value;
    questions.disabled = !interest.value;
    form.querySelector('#contact-service-hint').textContent = plan[0];
    form.querySelector('[data-enquiry-context-label]').textContent = plan[1];
    form.querySelector('[data-enquiry-priority-label]').textContent = plan[2];
    countMessage();
  }
  interest.addEventListener('change', () => selectService(true));
  form.addEventListener('input', countMessage);
  form.addEventListener('reset', () => queueMicrotask(() => { form.querySelector('.enquiry-optional').open = false; selectService(false); }));
  selectService(false);
  form.querySelector('[data-enquiry-submit]').disabled = false;
}

function savedEnquiryReceipt(note, reference, type) {
  note.textContent = 'Your enquiry has been saved. Reference: ';
  const savedReference = document.createElement('strong'); savedReference.textContent = reference;
  const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'button light receipt-copy'; copy.textContent = 'Copy reference';
  const feedback = document.createElement('span'); feedback.className = 'receipt-copy-feedback';
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(reference); feedback.textContent = ' Reference copied.'; }
    catch (_) { const selection = window.getSelection(), range = document.createRange(); range.selectNodeContents(savedReference); selection.removeAllRanges(); selection.addRange(range); feedback.textContent = ' Copy the selected reference.'; }
  });
  note.append(savedReference, ' ', copy, feedback, document.createElement('br'));
  note.append(type === 'demo' ? 'Keep this reference for follow-up.' : 'The team will review your requirements and contact you using the details provided. Quote this reference when you follow up.');
  const next = document.createElement('ol'); next.className='receipt-next';
  for(const text of ['Keep your reference for any follow-up.','The team will review your requirements and reply using the details you provided.','Discuss scope and next steps before agreeing to work.']){const item=document.createElement('li');item.textContent=text;next.append(item);}
  if(type!=='demo')note.append(next);
  const actions=document.createElement('div');actions.className='receipt-actions';
  const mail=document.createElement('a');mail.href='mailto:sales@bandeviglobalgroup.com?subject='+encodeURIComponent('Enquiry '+reference);mail.textContent='Email about this enquiry';
  const whatsapp=document.createElement('a');whatsapp.href='https://wa.me/917011040474?text='+encodeURIComponent('Hello BANDEVI, I would like to follow up on enquiry '+reference+'.');whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';whatsapp.textContent='Follow up on WhatsApp';
  actions.append(mail,whatsapp);note.append(actions);
  const delivery=document.createElement('p');delivery.className='receipt-delivery';delivery.textContent=type==='demo'?'This confirms your enquiry was saved. Check the booking status below for meeting confirmation; email delivery is separate.':'This confirms your enquiry was saved. Email delivery and a meeting time are not confirmed by this receipt.';note.append(delivery);
}

function bindLeadQualification(form) {
  if (!['contact','demo','home'].includes(form.dataset.form)) return;
  const regional=form.elements.projectCountry?.value||'',oldBudget=form.elements.projectBudget?.value||'';
  if(!form.querySelector('[data-lead-qualification]')){
    for(const name of ['projectCountry','projectBudget','quoteCurrency']){const field=form.elements[name];if(field)field.closest('.field').remove();}
    const box=document.createElement('fieldset');box.className='field full enquiry-qualification';box.dataset.leadQualification='1';
    const id='qualification-'+(form.id||form.dataset.form);
    box.innerHTML=`<legend>Your country & contact preferences</legend><p class="form-help">Choose your country so we can handle your enquiry in the right market. Budget and contact-time preferences are optional and do not confirm a price or appointment.</p><div class="form-grid"><div class="field"><label for="${id}-country">Business country *</label><select id="${id}-country" name="projectCountry" autocomplete="country" required><option value="">Choose your country</option><option value="GB" ${regional==='GB'?'selected':''}>United Kingdom</option><option value="US" ${regional==='US'?'selected':''}>United States</option><option value="IN" ${regional==='IN'?'selected':''}>India</option><option value="other">Another country</option></select></div><div class="field"><label for="${id}-currency">Budget / quote currency</label><select id="${id}-currency" name="quoteCurrency"><option value="">Agree with the team</option><option value="GBP">GBP - British pound</option><option value="USD">USD - US dollar</option><option value="INR">INR - Indian rupee</option><option value="EUR">EUR - Euro</option></select></div><div class="field full"><label for="${id}-budget">Planning budget or range (optional)</label><input id="${id}-budget" name="projectBudget" maxlength="120" placeholder="Enter a range, or leave blank if unsure"><p class="form-help">Your spending preference, not a published package price. Final pricing follows a custom quotation.</p></div><div class="field"><label for="${id}-channel">Preferred contact method</label><select id="${id}-channel" name="contactChannel"><option value="Discuss">Agree with the team</option><option>Email</option><option value="Phone">Phone call</option><option>WhatsApp</option></select></div><div class="field"><label for="${id}-zone">Your contact time zone *</label><select id="${id}-zone" name="contactTimezone" required><option value="">Choose your time zone</option><option value="Europe/London">UK - London</option><option value="America/New_York">US - Eastern</option><option value="America/Chicago">US - Central</option><option value="America/Denver">US - Mountain</option><option value="America/Los_Angeles">US - Pacific</option><option value="America/Phoenix">US - Arizona</option><option value="America/Anchorage">US - Alaska</option><option value="Pacific/Honolulu">US - Hawaii</option><option value="Asia/Kolkata">India - IST</option><option value="Asia/Dubai">UAE - Dubai</option><option value="Asia/Singapore">Singapore</option><option value="UTC">UTC / discuss with the team</option></select></div><div class="field"><label for="${id}-date">Best date to contact you (optional)</label><input id="${id}-date" name="contactDate" type="date"></div><div class="field"><label for="${id}-time">Best contact time (your time zone)</label><input id="${id}-time" name="contactTime" type="time"></div></div>`;
    if(form.id==='project-brief')form.querySelector('[data-brief-step="3"] .form-grid').append(box);
    else {const message=form.elements.message;message?.closest('.field')?.before(box);}
    if(form.id==='project-brief')box.querySelector('[name=projectBudget]').closest('.field').remove();
    else form.elements.projectBudget.value=oldBudget;
  }
  const e=form.elements,currencyByCountry={GB:'GBP',US:'USD',IN:'INR'},zoneByCountry={GB:'Europe/London',IN:'Asia/Kolkata'};
  if(!form.id||form.id!=='project-brief'){
    const interest=e.interest;
    for(const title of ['Website development','Mobile app development','Custom CRM development','ERP & business software','E-commerce development','Custom software & integrations','Maintenance & support'])if(interest&&!Array.from(interest.options).some(o=>o.value===title))interest.add(new Option(title,title));
  }
  function countryChanged(resetZone=false){
    const currency=currencyByCountry[e.projectCountry.value];
    if(currency)e.quoteCurrency.value=currency;
    for(const option of e.quoteCurrency.options)option.disabled=!!currency&&option.value!==currency;
    if(resetZone)e.contactTimezone.value=zoneByCountry[e.projectCountry.value]||'';
    if(!e.contactTimezone.value&&zoneByCountry[e.projectCountry.value])e.contactTimezone.value=zoneByCountry[e.projectCountry.value];
    e.contactTimezone.setCustomValidity(e.projectCountry.value==='US'&&!e.contactTimezone.value?'Choose your US time zone.':'');
  }
  function contactChanged(){
    e.contactDate.required=!!e.contactTime.value;e.contactTime.required=!!e.contactDate.value;
    if(e.email)e.email.setCustomValidity(e.contactChannel.value==='Email'&&!e.email.value.trim()?'Enter an email address for email contact.':'');
    if(e.phone){const digits=e.phone.value.replace(/\D/g,'').length;e.phone.setCustomValidity(['Phone','WhatsApp'].includes(e.contactChannel.value)&&(!/^\+?[0-9 () .-]+$/.test(e.phone.value.trim())||digits<7||digits>15)?'Enter a valid phone number for your preferred contact method.':'');}
  }
  e.projectCountry.addEventListener('change',()=>countryChanged(true));
  for(const field of [e.contactChannel,e.email,e.phone,e.contactDate,e.contactTime])if(field)field.addEventListener('input',contactChanged);
  e.contactTimezone.addEventListener('change',()=>e.contactTimezone.setCustomValidity(''));
  form.addEventListener('reset',()=>queueMicrotask(()=>{countryChanged(true);contactChanged();}));
  form.addEventListener('submit',event=>{contactChanged();if(!form.reportValidity()){event.preventDefault();event.stopImmediatePropagation();}},true);
  countryChanged();contactChanged();
}

function enquiryQualification(form,data){
  if(!form.querySelector('[data-lead-qualification]'))return {};
  const country=form.elements.projectCountry.value;
  return {qualification:{version:1,country,currency:({GB:'GBP',US:'USD',IN:'INR'})[country]||form.elements.quoteCurrency.value,budget:(form.elements.projectBudget||form.elements.briefBudget).value.trim(),contact:{channel:data.contactChannel,date:data.contactDate,time:data.contactTime,timezone:data.contactTimezone}}};
}

function bindForms() {
  document.querySelectorAll('[data-demo-planner]').forEach(form=>form.addEventListener('submit',()=>trackAnalyticsEvent('select_content',{content_type:'demo_brief',content_name:form.dataset.demoPlanner==='erp'?'travel_erp':'travel_crm',page_location:location.origin+publicPagePath()})));

  document.querySelectorAll("[data-form]").forEach((form) => {
    bindLeadQualification(form);
    const type = form.dataset.form;
    if (type === "contact") {
      const requestedChoice = new URL(window.location.href).searchParams.get("solution");
      const interest = form.elements.interest;
      if (interest && !interest.value && Array.from(interest.options).some(option => option.value === requestedChoice)) interest.value = requestedChoice;
    }
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

    if (type === "contact") {
      const email = form.elements.email, phone = form.elements.phone;
      function checkContactChannel() {
        const digits = phone.value.replace(/\D/g, '').length;
        const validPhone = /^\+?[0-9 () .-]+$/.test(phone.value.trim()) && digits >= 7 && digits <= 15;
        email.required = !validPhone;
        phone.setCustomValidity(!email.value.trim() && phone.value.trim() && !validPhone ? 'Enter a valid phone number with country code, or provide an email address.' : '');
      }
      for (const field of [email,phone]) field.addEventListener('input',checkContactChannel);
      form.addEventListener('reset',()=>queueMicrotask(checkContactChannel));
      checkContactChannel();
      bindEnquiryJourney(form);
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
          interest: data.interest || (type==='contact'?'Need guidance':''), message: enquiryMessage(form, data), website: data.website || '',
          ...(data.projectBrief ? {projectBrief: JSON.parse(data.projectBrief)} : {}),
          ...enquiryQualification(form,data),
          source: window.location.pathname,
          campaign: [enquiryAttribution.utm_source,enquiryAttribution.utm_medium,enquiryAttribution.utm_campaign].join(' / '),
          ...(type==='demo'&&data.slotId?{slotId:data.slotId}:{}),
          ...(type==='demo'&&data.demoDate&&data.demoTime?{demoSchedule:{date:data.demoDate,time:data.demoTime,timezone:'Asia/Kolkata'}}:{}),
          attribution: Object.fromEntries(Object.entries(enquiryAttribution).filter(([key])=>key!=='expires'))
        };
        if(payload.message.length>3000){form.dispatchEvent(new CustomEvent('enquiry-invalid'));note.textContent="Please shorten your description so your enquiry, including any optional details, fits within 3,000 characters.";return;}
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
            const failure = new Error(result.error || 'Unable to confirm your enquiry.');failure.measurementReason=response.status===429?'rate_limit':response.status===409?'conflict':response.status>=500?'server':'format';throw failure;
          }
          savedEnquiryReceipt(note, result.reference, type);
          if(type==='demo'){
            if(result.appointment?.confirmed){
              note.append(' Demo confirmed for '+new Date(result.appointment.starts*1000).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST. Joining details follow separately.');
              if(/^\/demo-booking\/#[a-f0-9]{64}$/.test(result.appointment.manageUrl||'')){const link=document.createElement('a');link.href=result.appointment.manageUrl;link.textContent='Manage or reschedule your demo';note.append(' ',link);}
            }else note.append((payload.demoSchedule?' Preferred time: '+payload.demoSchedule.date+' at '+payload.demoSchedule.time+' IST (UTC+05:30).':'')+' Your demo time is not booked yet. The team will contact you to confirm availability and meeting details.');
          }
          form.dispatchEvent(new CustomEvent('enquiry-saved',{detail:result}));
          enquiryAnalytics(form,type,result.reference);
          form.reset();
          delete form.dataset.payload;
          delete form.dataset.requestId;
        } catch (error) {
          form.dispatchEvent(new CustomEvent('enquiry-failed',{detail:{reason:error.measurementReason||'network'}}));
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
        content_name: "request_demo",
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

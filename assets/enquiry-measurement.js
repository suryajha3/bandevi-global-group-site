/* Anonymous journey events. No field values, URLs with queries, lead IDs or visitor cookies. */
(() => {
  'use strict';
  if (window.__bgJourneyMeasurement) return;
  window.__bgJourneyMeasurement = true;
  if (navigator.doNotTrack === '1') return;
  const forms = new WeakMap();
  const channels = ['organic_search','paid','campaign','referral','direct_unknown','unknown'];
  function context(form = 'none') {
    let page='/';try {page=new URL(document.querySelector('link[rel=canonical]').href).pathname;}catch (_) {}
    const channel=typeof enquiryAttribution!=='undefined'&&channels.includes(enquiryAttribution.channel)?enquiryAttribution.channel:'unknown';
    return {page,form,channel};
  }
  function send(data, google = true) {
    if (!window.bgAnalyticsConsent?.allowed()) return;
    try {
      fetch('/api/measurement',{method:'POST',credentials:'omit',keepalive:true,referrerPolicy:'no-referrer',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).catch(()=>{});
      if (google && typeof trackAnalyticsEvent==='function') trackAnalyticsEvent('enquiry_'+data.event,{lead_type:data.form,error_category:data.reason||'none',acquisition_channel:data.channel,page_location:location.origin+data.page});
    } catch (_) {} // Measurement must never interrupt an enquiry or contact action.
  }
  function target(node) {const f=node?.closest?.('form[data-form]');return f&&['contact','demo','home'].includes(f.dataset.form)?f:null;}
  function state(form) {let s=forms.get(form);if(!s){s={journey:crypto.randomUUID(),...context(form.dataset.form),events:new Set()};forms.set(form,s);}return s;}
  function event(form, name, reason='') {
    const s=state(form),key=name+':'+reason;
    if (!window.bgAnalyticsConsent?.allowed()) return;
    if(s.events.has(key))return;s.events.add(key);
    send({journey:s.journey,event:name,reason,page:s.page,form:s.form,channel:s.channel});
  }
  function start(form) {event(form,'start');}
  document.addEventListener('bg-analytics-consent-change',()=>{document.querySelectorAll('form[data-form]').forEach(f=>forms.delete(f));});
  for(const name of ['input','change'])document.addEventListener(name,e=>{const f=target(e.target);if(f){if(forms.get(f)?.complete)forms.delete(f);start(f);}},true);
  document.addEventListener('submit',e=>{const f=target(e.target);if(f){if(forms.get(f)?.complete)forms.delete(f);start(f);}},true);
  document.addEventListener('invalid',e=>{const f=target(e.target);if(!f)return;start(f);const v=e.target.validity;event(f,'invalid',v.valueMissing?'required':v.tooLong?'length':v.typeMismatch||v.patternMismatch||v.customError?'format':'other');},true);
  document.addEventListener('enquiry-invalid',e=>{const f=target(e.target);if(f){start(f);event(f,'invalid','length');}},true);
  document.addEventListener('enquiry-failed',e=>{const f=target(e.target);if(f){start(f);const reason=['network','server','rate_limit','conflict','format'].includes(e.detail?.reason)?e.detail.reason:'other';event(f,'failed',reason);}},true);
  document.addEventListener('enquiry-saved',e=>{const f=target(e.target);if(f){start(f);event(f,'saved');state(f).complete=true;}},true);
  document.addEventListener('click',e=>{
    const link=e.target.closest?.('a[href]');if(!link)return;
    let u;try {u=new URL(link.getAttribute('href'),location.origin);}catch(_){return;}
    const name=u.protocol==='tel:'?'phone_click':u.protocol==='mailto:'?'email_click':u.hostname==='wa.me'?'whatsapp_click':u.origin===location.origin&&['/demo-request/','/demo-request.html'].includes(u.pathname)?'demo_click':'';
    if(name)send({journey:crypto.randomUUID(),event:name,reason:'',...context()},false);
  },true);
})();

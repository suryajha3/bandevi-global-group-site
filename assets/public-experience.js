/* Public presentation only. Existing enquiry transport, fields and receipts remain authoritative. */
(() => {
 'use strict';
 const media = new WeakMap(), forms = new WeakSet();
 function enhanceMedia(img, frame) {
  if (media.has(img)) return media.get(img);
  if (!frame) {
   frame = document.createElement('div'); frame.className = 'public-media-frame';
   const original = img.parentElement.tagName === 'A' && img.parentElement.children.length === 1 ? img.parentElement : img;
   original.before(frame); frame.append(original);
  }
  frame.classList.add('public-media-frame');
  const status = document.createElement('div'); status.className = 'public-media-status'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
  const title = document.createElement('strong'), detail = document.createElement('span'), retry = document.createElement('button');
  retry.type = 'button'; retry.textContent = 'Retry image'; status.append(title,detail,retry); frame.append(status);
  let retryFocus=false;
  function set(state) {
   frame.dataset.mediaState = state; frame.setAttribute('aria-busy',String(state === 'loading')); status.hidden = state === 'ready'; retry.hidden = state !== 'error';
   title.textContent = state === 'error' ? 'Preview image unavailable' : state === 'loading' ? 'Loading preview…' : '';
   detail.textContent = state === 'error' ? 'You can retry or use the project and image links below.' : '';
   if(state!=='loading'&&retryFocus&&document.activeElement===frame){const target=state==='error'?retry:frame.querySelector('a[href]')||frame.closest('.viewer-image-wrap')||frame;frame.setAttribute('aria-label',img.alt);target.focus({preventScroll:true});retryFocus=false;}
  }
  function settle() { if (img.complete) set(img.naturalWidth > 0 ? 'ready' : 'error'); }
  function loading() { set('loading'); settle(); }
  img.addEventListener('load',settle); img.addEventListener('error',settle);
  new MutationObserver(loading).observe(img,{attributes:true,attributeFilter:['src','srcset']});
  retry.addEventListener('click',() => {
   retryFocus=document.activeElement===retry;if(retryFocus){frame.tabIndex=-1;frame.setAttribute('role','group');frame.setAttribute('aria-label','Loading preview');frame.focus({preventScroll:true});}
   const url = new URL(img.getAttribute('src'),location.href);
   if (url.origin === location.origin && url.pathname.startsWith('/assets/') && !img.srcset) { url.searchParams.set('media_retry',String(Date.now())); img.src = url.href; }
   else { const src = img.getAttribute('src'); img.removeAttribute('src'); img.setAttribute('src',src); }
   loading();
  });
  const control = {refresh:loading}; media.set(img,control); loading(); return control;
 }
 window.bgPublicMedia = enhanceMedia;
 const paths = {
  web:'M3 5h18v12H3zM8 21h8M12 17v4M3 9h18',
  crm:'M4 5h16v14H4zM4 10h16M10 10v9M14 14h3',
  travel:'m3 11 7 2 4 8 2-1-1-7 6-7-2-2-7 6-7-1z',
  portal:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6zM8 12l3 3 5-6',
  automation:'M4 6h12l-3-3m3 3-3 3M20 18H8l3-3m-3 3 3 3M4 10v8M20 14V6',
  offers:'M4 5h6v14H4zM14 5h6v14h-6zM6 9h2m8 0h2M6 13h2m8 0h2',
  products:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'
 };
 function icon(key) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('aria-hidden','true'); svg.setAttribute('focusable','false'); svg.classList.add('service-symbol');
  const path = document.createElementNS(svg.namespaceURI,'path'); path.setAttribute('d',paths[key] || paths.crm); svg.append(path); return svg;
 }
 function decorateServices() {
  document.querySelectorAll('.nav-service-title').forEach(title => { if(!title.querySelector('.service-symbol')) title.prepend(icon(title.id.split('-')[2])); });
  document.querySelectorAll('#compare-services article h3,#service-comparison article h3,#service-offers article h3').forEach(title => {
   if(title.querySelector('.service-symbol')) return;
   const card=title.closest('article'), text=(card.dataset.serviceKind || card.id || title.textContent).toLowerCase();
   title.prepend(icon(/travel/.test(text)?'travel':/web|app|visitor/.test(text)?'web':'crm')); title.classList.add('service-icon-heading');
  });
 }
 function feedback(form) {
  const note=form.querySelector('.form-note'); if(!note||forms.has(form)) return;forms.add(form);
  const heading=document.createElement('strong'); heading.className='enquiry-feedback-title'; heading.hidden=true; note.before(heading);
  const labels={pending:'Sending your enquiry',saved:'Enquiry saved',failed:'Enquiry not confirmed',invalid:'Check your details'};
  let outcome='idle';
  function state(next){ outcome=next; note.dataset.feedbackState=next; heading.textContent=labels[next]||''; heading.hidden=!labels[next]; }
  new MutationObserver(() => {
   const busy=form.dataset.sending==='true'; form.setAttribute('aria-busy',String(busy));
   if(busy && outcome!=='saved' && outcome!=='failed') state('pending');
  }).observe(form,{attributes:true,attributeFilter:['data-sending']});
  // A new submit clears only our presentation state; existing handlers own saving and retry IDs.
  form.addEventListener('submit',()=>{ outcome='idle'; if(form.dataset.sending==='true') state('pending'); });
  for(const [event,next] of [['enquiry-saved','saved'],['enquiry-failed','failed'],['enquiry-invalid','invalid']]) form.addEventListener(event,()=>state(next));
  const errors=new Map(); let sequence=0;
  function clear(field) {
   const error=errors.get(field); if(!error)return;
   const ids=(field.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id && id!==error.id);
   if(ids.length)field.setAttribute('aria-describedby',ids.join(' ')); else field.removeAttribute('aria-describedby');
   field.removeAttribute('aria-invalid'); error.remove(); errors.delete(field);
  }
  form.addEventListener('invalid',event=>{
   const field=event.target;if(!field.matches('input,select,textarea')||field.closest('[aria-hidden="true"]'))return;
   let error=errors.get(field);if(!error){error=document.createElement('span');error.className='enquiry-field-error';error.id='enquiry-field-error-'+form.dataset.form+'-'+(++sequence);field.after(error);errors.set(field,error);const ids=(field.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);ids.push(error.id);field.setAttribute('aria-describedby',ids.join(' '));}
   error.textContent=field.validationMessage;field.setAttribute('aria-invalid','true');
  },true);
  for(const event of ['input','change']) form.addEventListener(event,e=>queueMicrotask(()=>{if(e.target.validity?.valid)clear(e.target);}));
  form.addEventListener('reset',()=>{ for(const field of [...errors.keys()])clear(field); });
 }
 function init() {
  decorateServices();
  document.querySelectorAll('form[data-form="home"],form[data-form="contact"],form[data-form="demo"]').forEach(feedback);
  document.querySelectorAll('.project-directory-grid img,.project-walkthrough img,.home-proof-case img,.web-project-image img,.travel-real-work img,.crm-concept img').forEach(img=>{ if(!img.closest('picture')&&!img.srcset)enhanceMedia(img); });
 }
 function start(){init();const source=document.getElementById('site');if(source)new MutationObserver(init).observe(source,{childList:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

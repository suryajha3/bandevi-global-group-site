/* Public presentation only. Existing enquiry transport, fields and receipts remain authoritative. */
(() => {
 'use strict';
 const media = new WeakMap(), forms = new WeakSet(), promptForms=new WeakSet(), reviewForms=new WeakSet(), videos=new WeakSet(), motions=new WeakMap();let promptSequence=0,reviewSequence=0,videoSequence=0;
 function transition(element){
  if(!element?.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  motions.get(element)?.cancel();const motion=element.animate([{opacity:.9},{opacity:1}],{duration:160,easing:'ease-out'});motions.set(element,motion);motion.onfinish=()=>{if(motions.get(element)===motion)motions.delete(element);};
 }
 window.bgPublicTransition=transition;
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
   const changed=frame.dataset.mediaState!==state;
   frame.dataset.mediaState = state; frame.setAttribute('aria-busy',String(state === 'loading')); status.hidden = state === 'ready'; retry.hidden = state !== 'error';
   title.textContent = state === 'error' ? 'Preview image unavailable' : state === 'loading' ? 'Loading preview…' : '';
   detail.textContent = state === 'error' ? 'You can retry or use the project and image links below.' : '';
   if(changed&&state==='ready')transition(img);
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
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('width','18');svg.setAttribute('height','18');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.7');svg.setAttribute('aria-hidden','true'); svg.setAttribute('focusable','false'); svg.classList.add('service-symbol');
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
 function enquiryPrompts(form){
  const message=form.elements.message,interest=form.elements.interest;if(!message||!interest||promptForms.has(form))return;
  const field=message.closest('.field');if(!field)return;promptForms.add(form);
  const box=document.createElement('div');box.className='enquiry-prompts';
  const label=document.createElement('small');label.textContent='Example to help you start (optional)';const example=document.createElement('p');example.id='enquiry-example-'+(++promptSequence);box.append(label,example);field.append(box);
  const ids=(message.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);ids.push(example.id);message.setAttribute('aria-describedby',ids.join(' '));
  const examples={web:'We need a website for [business type], with [pages or features]. Our main goal is [what visitors should do].',crm:'We manage enquiries in [current tool]. We need clearer [lead ownership, follow-ups or reporting] for [team size].',travel:'We run a travel business and need [a website, portal or CRM] for [customers or agents], with [workflow or integration needs].',portal:'Our customers need to [view documents, track requests or manage accounts]. We want to improve [the current process].',general:'Tell us what your business does, what is difficult today, and the first thing you want the new system to improve.'};
  function update(){const value=interest.value.toLowerCase(),kind=/travel|flight|hotel|tour|dmc/.test(value)?'travel':/crm|erp|lead/.test(value)?'crm':/web|app|e-commerce|ecommerce/.test(value)?'web':/portal/.test(value)?'portal':'general';if(box.dataset.promptKind===kind)return;box.dataset.promptKind=kind;example.textContent=examples[kind];transition(example);}
  update();example.setAttribute('aria-live','polite');example.setAttribute('aria-atomic','true');interest.addEventListener('change',update);form.addEventListener('reset',()=>queueMicrotask(update));
 }
 function node(tag,cls,text){const item=document.createElement(tag);if(cls)item.className=cls;if(text)item.textContent=text;return item;}
 function action(cls,text){const item=node('button',cls,text);item.type='button';return item;}
 function enquiryReview(form){
  const submit=form.querySelector('button[type="submit"]');if(!submit||reviewForms.has(form)||typeof HTMLDialogElement==='undefined'||!HTMLDialogElement.prototype.showModal)return;reviewForms.add(form);
  const id='enquiry-review-'+(++reviewSequence),trigger=action('button light public-review-trigger','Review enquiry (optional)'),dialog=node('dialog','public-review-dialog');dialog.id=id;trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls',id);submit.after(trigger);
  const head=node('div','public-review-header'),title=node('h2',null,'Review your main enquiry details'),close=action('public-review-control','Close');title.id=id+'-title';close.setAttribute('aria-label','Close enquiry review');head.append(title,close);
  const note=node('p','public-review-note','Check these main details. Other optional choices remain in the form. This review does not send your enquiry or book a demo.');note.id=id+'-note';dialog.setAttribute('aria-labelledby',title.id);dialog.setAttribute('aria-describedby',note.id);
  const body=node('div','public-review-body');body.tabIndex=0;body.setAttribute('aria-label','Enquiry details; scroll to review');const foot=node('div','public-review-footer'),back=action('public-review-control','Back to form');foot.append(node('p',null,'Return to the form and choose Send enquiry when you are ready.'),back);dialog.append(head,note,body,foot);document.body.append(dialog);
  const fields=[['name','Name'],['email','Email'],['phone','Phone / WhatsApp'],['interest','Service'],['projectCountry','Business country'],['quoteCurrency','Quote currency'],['message','Message']];let editTarget=null;
  function sync(){trigger.disabled=form.dataset.sending==='true';}
  new MutationObserver(sync).observe(form,{attributes:true,attributeFilter:['data-sending']});sync();
  trigger.addEventListener('click',()=>{
   if(form.dataset.sending==='true')return;editTarget=null;body.replaceChildren();const list=node('dl','public-review-values');
   for(const [name,label] of fields){const field=form.elements[name];if(!field)continue;const row=node('div','public-review-row'),term=node('dt',null,label),description=node('dd'),edit=action('public-review-control public-review-edit','Edit');let value=String(field.value||'').trim();if(value&&field.tagName==='SELECT')value=field.selectedOptions[0]?.textContent.trim()||value;if(!value)value=name==='quoteCurrency'?'Agree with the team':'Not provided';description.textContent=value;edit.setAttribute('aria-label','Edit '+label.toLowerCase());edit.addEventListener('click',()=>{editTarget=field;dialog.close();});row.dataset.reviewField=name;if(field.type!=='hidden'&&!field.disabled)term.append(edit);row.append(term,description);list.append(row);}body.append(list);
   dialog.showModal();document.documentElement.classList.add('public-review-open');close.focus();
  });
  close.addEventListener('click',()=>dialog.close());back.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('public-review-open');const target=editTarget?.isConnected?editTarget:trigger;editTarget=null;body.replaceChildren();if(target!==trigger){for(let parent=target.parentElement;parent&&parent!==form;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;}if(target.isConnected){target.focus({preventScroll:true});const bounds=target.getBoundingClientRect();if(bounds.top<90||bounds.bottom>innerHeight)target.scrollIntoView({block:'center',behavior:'instant'});}});
  dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const items=[...dialog.querySelectorAll('button:not(:disabled),[tabindex="0"]')].filter(e=>e.getClientRects().length),first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
  form.addEventListener('reset',()=>{if(dialog.open)dialog.close();else body.replaceChildren();});
 }
 function videoFeedback(video){
  if(videos.has(video))return;videos.add(video);video.dataset.publicVideo='1';
  const figure=video.closest('figure')||video.parentElement,section=video.closest('section'),transcript=section?.querySelector('details[class*="transcript"]'),sources=[...video.querySelectorAll('source')],originals=sources.map(source=>source.getAttribute('src')),panel=node('div','public-video-state'),title=node('strong'),detail=node('span'),retry=action('public-review-control','Retry video'),links=node('div','public-video-links');
  panel.hidden=true;panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');panel.tabIndex=-1;panel.append(title,detail,retry,links);video.after(panel);
  function transcriptLink(){if(!transcript)return null;if(!transcript.id)transcript.id='public-video-transcript-'+(++videoSequence);const link=node('a',null,'Read transcript');link.href='#'+transcript.id;transcript.classList.add('public-video-transcript-target');link.addEventListener('click',event=>{if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();transcript.open=true;transcript.querySelector('summary')?.focus({preventScroll:true});transcript.scrollIntoView({block:'center',behavior:'instant'});try{const url=new URL(location.href);if(url.hash!==link.hash){url.hash=link.hash;history.pushState(history.state,'',url.href);}}catch(_){/* Reading the transcript must not depend on history access. */}});return link;}
  const fallback=transcriptLink();if(fallback){links.append(fallback);let caption=figure.querySelector('figcaption');if(!caption){caption=node('p','public-video-caption');panel.after(caption);}const shortcut=transcriptLink();shortcut.className='public-video-transcript-link';if(caption.textContent.trim())caption.append(document.createTextNode(' · '));caption.append(shortcut);}
  const file=originals.find((src,i)=>video.canPlayType(sources[i].type))||originals[0]||video.getAttribute('src');if(file){const url=new URL(file,location.href);if(['http:','https:'].includes(url.protocol)){const raw=node('a',null,'Open video file');raw.href=url.href;raw.target='_blank';raw.rel='noopener noreferrer';links.append(raw);}}
  let state='idle',armed=false,reloading=false,retryFocus=false;const failed=new Set();
  function set(next){if(state===next)return;state=next;video.dataset.videoState=next;panel.hidden=next==='idle';video.setAttribute('aria-busy',String(next==='loading'));retry.hidden=next!=='error';retry.disabled=next==='loading';title.textContent=next==='error'?'Video unavailable':next==='loading'?'Loading video…':next==='ready'?'Video reloaded':'';detail.textContent=next==='error'?'Try again, or use the available alternatives.':next==='ready'?'Press Play to continue.':'';
   if(retryFocus&&document.activeElement===panel&&next!=='loading'){const target=next==='error'?retry:video;if(target===video&&!video.hasAttribute('tabindex'))video.tabIndex=0;target.focus({preventScroll:true});retryFocus=false;}
  }
  function ready(){if(video.readyState<1)return;failed.clear();if(reloading&&video.paused){reloading=false;set('ready');}else if(!video.paused||state!=='ready')set('idle');}
  video.addEventListener('pointerdown',()=>armed=true,{passive:true});video.addEventListener('keydown',()=>armed=true);
  video.addEventListener('play',()=>{armed=true;if(video.readyState<3)set('loading');});
  for(const event of ['waiting','stalled'])video.addEventListener(event,()=>{if(armed&&!video.paused)set('loading');});
  video.addEventListener('loadstart',()=>{if(armed&&(!video.paused||reloading))set('loading');});
  for(const event of ['loadedmetadata','loadeddata','canplay','seeked'])video.addEventListener(event,ready);
  video.addEventListener('playing',()=>{reloading=false;failed.clear();set('idle');});
  video.addEventListener('pause',()=>{if(state!=='error'&&!reloading)set('idle');});video.addEventListener('ended',()=>set('idle'));
  video.addEventListener('error',event=>{if(event.target.tagName==='SOURCE')failed.add(event.target);queueMicrotask(()=>{if(video.error&&video.error.code!==1||sources.length&&sources.every(source=>failed.has(source))&&video.networkState===3)set('error');});},true);
  retry.addEventListener('click',()=>{retryFocus=document.activeElement===retry;if(retryFocus)panel.focus({preventScroll:true});armed=true;reloading=true;failed.clear();video.pause();for(let i=0;i<sources.length;i++){const url=new URL(originals[i],location.href);if(url.origin===location.origin&&url.pathname.startsWith('/assets/')){url.searchParams.set('video_retry',String(Date.now()));sources[i].src=url.href;}}video.preload='metadata';set('loading');video.load();});
 }
 // Presentation follows the existing required attributes, including email/phone alternatives.
 const requiredForms=new WeakSet();
 function requiredLabels(form){
  if(!form.matches('[data-compact-enquiry="1"]')||requiredForms.has(form))return;
  requiredForms.add(form);
  const help=node('p','enquiry-required-help','Required fields are marked. Other details are optional.');
  const grid=form.querySelector('.form-grid');if(grid)grid.before(help);
  function sync(){
   for(const field of form.querySelectorAll('input,select,textarea')){
    if(!field.id||field.type==='hidden'||field.closest('[aria-hidden="true"]'))continue;
    const label=[...form.querySelectorAll('label')].find(label=>label.htmlFor===field.id);if(!label)continue;
    let badge=label.querySelector('.enquiry-required-badge');
    if(field.required&&!field.matches(':disabled')){if(!badge){badge=node('span','enquiry-required-badge','Required');badge.setAttribute('aria-hidden','true');label.append(badge);}}
    else badge?.remove();
   }
  }
  sync();new MutationObserver(sync).observe(form,{subtree:true,attributes:true,attributeFilter:['required','disabled']});
 }
 function finishProjectFrames(){
  document.querySelectorAll('.project-directory-grid article').forEach(card=>{
   const bar=card.querySelector('.project-browser-bar');if(!bar||bar.querySelector('.project-frame-label'))return;
   bar.append(node('span','project-frame-label',card.querySelector('h3')?.textContent+' · interface reference'));
  });
 }
 function compactCoverage(){
  const container=document.querySelector('.home-global-coverage>.container');if(!container||container.querySelector('.coverage-disclosure'))return;
  const nav=container.querySelector('nav');if(!nav)return;
  const disclosure=node('details','coverage-disclosure'),summary=node('summary',null,'Explore international service coverage');
  disclosure.append(summary);container.prepend(disclosure);disclosure.append(nav);
  container.querySelector('p')?.setAttribute('hidden','');
  container.querySelector('small')?.setAttribute('hidden','');
 }
 const navigationGroups=new WeakSet(),filterSummaries=new WeakSet(),stepProgress=new WeakSet();
 function breadcrumbs(){
  const main=document.querySelector('main'),heading=main?.querySelector('h1');if(!heading||main.querySelector('.public-breadcrumbs'))return;
  let pathname=location.pathname;try{const canonical=new URL(document.querySelector('link[rel="canonical"]').href);if(canonical.origin===location.origin)pathname=canonical.pathname;}catch(_){}
  if(pathname==='/')return;
  const labels={'/about-us/':'About BANDEVI','/contact-us/':'Contact','/demo-request/':'Request a demo','/case-studies/':'Our work','/it-products/':'Products & services','/website-mobile-app-development/':'Websites & apps','/crm-erp-solutions/':'CRM & ERP','/travel-technology/':'Travel technology','/customer-portal/':'Customer portals','/business-automation/':'Business automation','/offices/':'Office & service locations','/service-offers/':'Compare service offers','/sample-crm/':'Interactive CRM demo','/crm-demo/':'CRM walkthrough','/international/':'International projects','/projects/trip-sarathi/':'Trip Sarathi','/projects/maximtrip/':'MaximTrip','/projects/tripodeal/':'TripOdeal','/projects/bandevi-website/':'BANDEVI website'};
  const markets={us:'United States',uk:'United Kingdom',india:'India',ae:'Dubai & UAE',sg:'Singapore'},segments=pathname.split('/').filter(Boolean),trail=[['Home','/']];
  if(segments[0]==='projects'&&segments.length>1)trail.push(['Our work','/case-studies/#project-directory']);
  else if(markets[segments[0]]&&segments.length>1&&segments[1]!=='software-development')trail.push([markets[segments[0]],'/'+segments[0]+'/software-development/']);
  else if(segments[0]==='blog'&&segments.length>1)trail.push(['Blog','/blog/']);
  const current=labels[pathname]||(markets[segments[0]]&&segments[1]==='software-development'?markets[segments[0]]:markets[segments[0]]&&segments[1]==='travel-agency-crm'?'Travel agency CRM':heading.textContent.replace(/\s+/g,' ').trim());
  trail.push([current,null]);const nav=node('nav','public-breadcrumbs'),list=node('ol');nav.setAttribute('aria-label','Breadcrumb');list.setAttribute('role','list');
  trail.forEach(([label,href],index)=>{const item=node('li');if(index){const separator=node('span','breadcrumb-separator','›');separator.setAttribute('aria-hidden','true');item.append(separator);}const part=node(href?'a':'span',null,label);if(href)part.href=href;else part.setAttribute('aria-current','page');item.append(part);list.append(item);});nav.append(list);const host=heading.parentElement;if(host.matches('.section-head:not(.single)'))host.before(nav);else host.prepend(nav);
 }
 function sectionIndicators(nav){
  if(navigationGroups.has(nav))return;
  const entries=[...nav.querySelectorAll('a[href^="#"]')].map(link=>{let target;try{target=document.getElementById(decodeURIComponent(link.hash.slice(1)));}catch(_){}return {link,target};}).filter(entry=>entry.target);
  if(entries.length<2)return;navigationGroups.add(nav);nav.classList.add('section-navigation');for(const {target} of entries)target.classList.add('section-navigation-target');
  let pending=false;
  function update(){pending=false;const header=document.querySelector('.topbar'),offset=Math.ceil(header?.getBoundingClientRect().height||0)+20;document.documentElement.style.setProperty('--public-navigation-offset',offset+'px');
   const ordered=entries.map(entry=>({...entry,top:entry.target.getBoundingClientRect().top})).sort((a,b)=>a.top-b.top);let active=null;for(const entry of ordered)if(entry.top<=Math.max(offset,parseFloat(getComputedStyle(entry.target).scrollMarginTop)||0)+4)active=entry.link;
   for(const {link} of entries){if(link===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('hashchange',schedule);addEventListener('pageshow',schedule);nav.addEventListener('click',schedule);update();
 }
 function galleryFilterSummary(section){
  if(filterSummaries.has(section))return;const filters=section.querySelector('.project-filters'),count=section.querySelector('.project-filter-count'),all=filters?.querySelector('[data-project-filter="all"]');if(!filters||!count||!all)return;filterSummaries.add(section);
  const group=node('div','project-filter-summary'),selected=node('span','project-selected-filter'),clear=action('project-clear-filter','Clear filter');group.setAttribute('role','group');group.setAttribute('aria-label','Current project filter');count.before(group);group.append(selected,count,clear);
  function sync(){const button=filters.querySelector('[aria-pressed="true"]')||all;selected.textContent='Category: '+button.textContent.trim();clear.hidden=button===all;count.setAttribute('aria-label',selected.textContent+', '+count.textContent);}
  clear.addEventListener('click',()=>{all.click();all.focus({preventScroll:true});});new MutationObserver(sync).observe(filters,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});sync();
 }
 function crmStepProgress(preview){
  if(stepProgress.has(preview))return;const controls=preview.querySelector('.home-crm-steps'),buttons=[...preview.querySelectorAll('[data-home-crm-step]')];if(!controls||buttons.length!==3)return;stepProgress.add(preview);
  const progress=node('p','home-crm-progress');progress.id='home-crm-progress';controls.after(progress);const described=(controls.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);described.push(progress.id);controls.setAttribute('aria-describedby',described.join(' '));
  const explanations={capture:'Save the enquiry.',assign:'Name the owner.',followup:'Set the next action.'};
  function sync(){const index=buttons.findIndex(button=>button.getAttribute('aria-pressed')==='true'),active=buttons[Math.max(0,index)];progress.textContent='Step '+(Math.max(0,index)+1)+' of 3 · '+explanations[active.dataset.homeCrmStep];}
  new MutationObserver(sync).observe(controls,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});sync();
 }
 function init() {
  decorateServices();finishProjectFrames();compactCoverage();breadcrumbs();
  document.querySelectorAll('nav.web-jump,nav.crm-jump,nav.travel-jump,main nav[aria-label="On this page"]').forEach(sectionIndicators);
  document.querySelectorAll('.project-directory').forEach(galleryFilterSummary);
  document.querySelectorAll('#intl-crm-preview').forEach(crmStepProgress);
  document.querySelectorAll('form[data-compact-enquiry="1"]').forEach(requiredLabels);
  document.querySelectorAll('form[data-form="home"],form[data-form="contact"],form[data-form="demo"]').forEach(form=>{feedback(form);enquiryPrompts(form);enquiryReview(form);});
  document.querySelectorAll('main video').forEach(videoFeedback);
  document.querySelectorAll('.home-hero-markets a,.home-region-grid a,.project-directory-grid article,.service-comparison-grid article,#service-comparison article,#service-offers article').forEach(card=>{if(!card.classList.contains('interaction-card'))card.classList.add('interaction-card');});
  document.querySelectorAll('.project-directory-grid img,.project-walkthrough img,.home-proof-case img,.web-project-image img,.travel-real-work img,.crm-concept img').forEach(img=>{ if(!img.closest('picture')&&!img.srcset)enhanceMedia(img); });
 }
 function start(){init();const source=document.getElementById('site');if(source)new MutationObserver(init).observe(source,{childList:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

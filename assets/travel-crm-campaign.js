(() => {
 'use strict';
 function fillExample(event, example, promotion) {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const form = document.querySelector('#regional-enquiry form');
  const message = form?.elements.message;
  if (!message) return;
  if (promotion) form.dataset.crmPromotion = promotion;
  if (!message.value.trim()) {
   message.value = example;
   message.dispatchEvent(new Event('input', { bubbles: true }));
  }
  requestAnimationFrame(() => message.focus({ preventScroll: true }));
 }

 function bindPromotions(carousel) {
  const slides = [...carousel.querySelectorAll('template[data-crm-slide]')];
  if (slides.length < 2) return;
  const heading = carousel.querySelector('#crm-workflow-example');
  const steps = carousel.querySelector('.crm-campaign-steps');
  const controls = carousel.querySelector('[data-crm-promo-controls]');
  const status = controls.querySelector('[data-crm-promo-status]');
  const demo = carousel.querySelector('[data-crm-promo-demo]');
  let index = 0;
  function move(direction) {
   index = (index + direction + slides.length) % slides.length;
   const slide = slides[index];
   heading.textContent = slide.dataset.title;
   steps.replaceChildren(slide.content.cloneNode(true));
   demo.href = slide.dataset.demoUrl;
   status.textContent = `${index + 1} of ${slides.length} · ${slide.dataset.label}`;
  }
  controls.querySelector('[data-crm-previous]').addEventListener('click', () => move(-1));
  controls.querySelector('[data-crm-next]').addEventListener('click', () => move(1));
  controls.addEventListener('keydown', event => {
   if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
   event.preventDefault();
   move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  carousel.querySelector('[data-crm-promo-enquiry]').addEventListener('click', event => {
   const slide = slides[index];
   fillExample(event, slide.dataset.example, slide.dataset.promotion);
  });

  let start;
  carousel.addEventListener('touchstart', event => {
   start = event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });
  carousel.addEventListener('touchcancel', () => { start = null; });
  carousel.addEventListener('touchend', event => {
   if (!start) return;
   const end = event.changedTouches[0];
   const dx = end.clientX - start.clientX;
   const dy = end.clientY - start.clientY;
   start = null;
   if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  }, { passive: true });
  controls.hidden = false;
 }

 function bindAvailability(panel) {
  const time = window.BandeviDemoTime;
  if (!time) return;
  const market = panel.dataset.crmAvailability;
  const controls = panel.querySelector('[data-availability-controls]');
  const status = panel.querySelector('[data-availability-status]');
  const request = panel.querySelector('[data-availability-request]');
  const form = panel.querySelector('form');
  const select = form.elements.crm_slot;
  const refresh = panel.querySelector('[data-availability-refresh]');
  const zone = time.zoneChoice(controls, form, {
   id: 'crm-availability-zone', initial: time.campaignZone(market), compact: true
  });
  zone.name = 'crm_zone';
  zone.setAttribute('form', form.id);
  const fallback = new URL(request.href);
  let slots = [];

  function showTimes() {
   const selected = select.value;
   select.replaceChildren(new Option('Choose an available time', ''),
    ...slots.map(slot => new Option(time.label(slot, zone.value, true), slot.id)));
   if (slots.some(slot => slot.id === selected)) select.value = selected;
   fallback.searchParams.set('crm_zone', zone.value);
   request.href = fallback.href;
  }

  async function load() {
   if (refresh.disabled) return;
   controls.hidden = false;
   form.hidden = true;
   refresh.disabled = true;
   status.textContent = 'Checking published demo times…';
   const controller = new AbortController();
   const timer = setTimeout(() => controller.abort(), 12000);
   try {
    const response = await fetch('/api/demo/slots', { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error('Availability unavailable');
    const data = await response.json();
    slots = data.slots;
    showTimes();
    form.hidden = !slots.length;
    status.textContent = slots.length
     ? 'Choose a time to continue. Your demo is confirmed when your booking is saved.'
     : 'No demo times are available right now. Request a time that works for you.';
   } catch (_) {
    slots = [];
    showTimes();
    status.textContent = 'Demo times could not be loaded. Try again or request a preferred time.';
   } finally {
    clearTimeout(timer);
    refresh.disabled = false;
   }
  }

  showTimes();
  zone.addEventListener('change', showTimes);
  refresh.addEventListener('click', load);
  if (panel.open) load();
  else panel.addEventListener('toggle', () => { if (panel.open) load(); });
 }

 function init(){
  const featuredPromotion = document.querySelector('[data-crm-slide]')?.dataset.promotion;
  document.querySelectorAll('[data-crm-example]').forEach(link => link.addEventListener('click', event =>
   fillExample(event, link.dataset.crmExample, featuredPromotion)
  ));
  document.querySelectorAll('[data-crm-promotions]').forEach(bindPromotions);
  document.querySelectorAll('[data-crm-availability]').forEach(bindAvailability);
  document.querySelectorAll('[data-travel-crm-enquiry]').forEach(link=>link.addEventListener('click',()=>{
   const form=document.querySelector('#regional-enquiry form');if(!form)return;
   const service=form.elements.interest;if(service){const option=[...service.options].find(o=>o.value==='CRM & ERP Package');if(option){service.value=option.value;service.dispatchEvent(new Event('change',{bubbles:true}));}}
   const business=form.elements.businessType;if(business){const option=[...business.options].find(o=>o.text==='Travel agency / tour operator');if(option&&!business.value)business.value=option.value;}
   const message=form.elements.message;if(message&&!message.value.trim())message.value='We are a travel agency interested in a CRM for enquiry ownership, follow-ups and quotations. We would like to discuss a first release.';
   // Country/time-zone choices and any existing enquiry text remain with the customer.
   requestAnimationFrame(()=>service?.focus({preventScroll:true}));
  }));
 }
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

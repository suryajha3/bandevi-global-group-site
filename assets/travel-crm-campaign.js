(() => {
 'use strict';
 function init(){
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

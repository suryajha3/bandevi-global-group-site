(() => {
 'use strict';
 const paths=new Set(['/','/travel-technology/','/travel-website-development/','/travel-agency-website-development/','/b2b-travel-portal/','/white-label-travel-website/','/white-label-travel-portal/','/travel-mobile-app-development/','/travel-agency-mobile-app/','/travel-booking-software/','/travel-crm-software/','/travel-crm/','/travel-erp/','/sample-crm/']);
 const workflows=new Set(['travel-crm','travel-handover','travel-finance']);
 let path;try{path=new URL(document.querySelector('link[rel="canonical"]').href).pathname;}catch(_){return;}if(!paths.has(path))return;
 const measure=(name,extra={})=>{try{if(typeof trackAnalyticsEvent==='function')trackAnalyticsEvent(name,{demo_id:'travel_workflow',page_location:location.origin+path,...extra});}catch(_){/* Navigation works without analytics. */}};
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');if(!link)return;
  let target;try{target=new URL(link.href,location.origin);}catch(_){return;}if(target.origin!==location.origin)return;
  if(link.hasAttribute('data-travel-demo-entry')&&link.closest('#travel-demo-link')&&target.pathname==='/sample-crm/'&&target.hash==='#travel-demo-guide')measure('sample_demo_link_click',{cta_placement:path==='/'?'home':'travel_service'});
  const workflow=target.searchParams.get('workflow');
  if(path==='/sample-crm/'&&link.closest('#travel-demo-brief')&&target.pathname==='/project-brief/'&&target.searchParams.get('source')==='travel-demo'&&workflows.has(workflow))measure('sample_enquiry_click',{cta_placement:'travel_workflow',entry_workflow:workflow});
 });
 const guide=path==='/sample-crm/'?document.getElementById('travel-demo-guide'):null;
 if(guide&&typeof IntersectionObserver==='function'){
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=0.25)){measure('sample_demo_view');observer.disconnect();}},{threshold:0.25});observer.observe(guide);
 }
})();

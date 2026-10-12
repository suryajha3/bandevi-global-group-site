(() => {
 'use strict';
 function init(){
  if(document.body.dataset.page!=='crmCampaign')return;
  const incoming=new URL(location.href),keys=['utm_source','utm_medium','utm_campaign'];
  const tags=keys.map(key=>[key,incoming.searchParams.get(key)]).filter(([,value])=>/^[a-zA-Z0-9_-]{1,80}$/.test(value||''));
  document.querySelectorAll('[data-campaign-link]').forEach(link=>{
   const target=new URL(link.href,location.origin);
   if(target.origin!==location.origin||!['/contact-us/','/demo-request/'].includes(target.pathname))return;
   tags.forEach(([key,value])=>target.searchParams.set(key,value));target.searchParams.set('source','/crm-demo/');
   link.href=target.pathname+target.search+target.hash;
  });
 }
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

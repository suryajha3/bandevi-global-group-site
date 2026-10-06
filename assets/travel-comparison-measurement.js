(() => {
 const comparison=document.getElementById('travel-solution-comparison');if(!comparison)return;
 const workflows=new Set(['travel-website','travel-crm','travel-erp']);
 comparison.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(!link||!comparison.contains(link))return;const target=new URL(link.href,location.origin),workflow=target.searchParams.get('workflow');if(target.origin!==location.origin||target.pathname!=='/project-brief/'||!workflows.has(workflow))return;try{if(typeof trackAnalyticsEvent==='function')trackAnalyticsEvent('travel_comparison_brief_click',{page_location:location.origin+'/travel-technology/',entry_workflow:workflow});}catch(_){/* Keep navigation working if analytics is blocked. */}});
})();

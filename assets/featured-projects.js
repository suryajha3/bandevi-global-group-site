(() => {
 function init(){
  const root=document.querySelector('[data-featured-projects]');if(!root)return;
  const projects=[
   {name:'Trip Sarathi',slug:'trip-sarathi',height:578,description:'Flight search and travel-service navigation.'},
   {name:'MaximTrip',slug:'maximtrip',height:532,description:'Flight and holiday pages with booking-management navigation.'},
   {name:'TripOdeal',slug:'tripodeal',height:532,description:'Travel search, services and booking lookup.'}
  ];
  const tabs=[...root.querySelectorAll('[data-featured-index]')],panel=root.querySelector('#featured-project-panel'),image=root.querySelector('[data-featured-image]');
  function select(index,focus=false){
   const project=projects[index];if(!project)return;
   tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
   panel.setAttribute('aria-labelledby',tabs[index].id);
   const record='/projects/'+project.slug+'/',screenshot='/assets/portfolio-'+project.slug+'.jpg';
   image.src=screenshot;image.height=project.height;image.alt=project.name+' public homepage showing '+project.description.toLowerCase().replace(/\.$/,'');
   root.querySelector('[data-featured-image-link]').href=screenshot;root.querySelector('[data-featured-image-link]').setAttribute('aria-label','View larger '+project.name+' screenshot (opens new tab)');
   root.querySelector('[data-featured-project-link]').href=record;root.querySelector('[data-featured-project-link]').textContent=project.name+' ↗';
   root.querySelector('[data-featured-name]').textContent=project.name+' · B2C travel portal';root.querySelector('[data-featured-description]').textContent=project.description;
   root.querySelector('[data-featured-explore]').href=record;root.querySelector('[data-featured-larger]').href=screenshot;
   if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(index));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next,true);});});
  panel.setAttribute('role','tabpanel');root.querySelector('.home-project-tabs').hidden=false;root.querySelector('.home-project-fallback').hidden=true;select(0);
 }
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


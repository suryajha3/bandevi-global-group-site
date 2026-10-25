(() => {
 function preview(project,device){
  if(device==='mobile'&&project.mobile)return {image:'/assets/project-'+project.slug+'-mobile-20261025.jpg',width:390,height:844,alt:project.name+' public mobile homepage captured 25 October 2026 at 390 by 844 pixels',source:'Mobile viewport captured 25 October 2026 at 390 × 844 pixels. '+project.mobile+' Public interface reference only; no customer endorsement, supplier integration or business results verified.'};
  return {image:project.image||'/assets/portfolio-'+project.slug+'.webp',width:project.width||1239,height:project.height,alt:project.alt||project.name+' public homepage screenshot',source:project.source||"Public interface captured 6 October 2026. Development attribution supplied by BANDEVI's owner; no customer endorsement implied."};
 }
 function installScreenshotViewer(root,projects){
  if(typeof HTMLDialogElement==='undefined'||typeof HTMLDialogElement.prototype.showModal!=='function')return false;
  const dialog=document.createElement('dialog');dialog.className='home-project-viewer';dialog.setAttribute('aria-labelledby','featured-viewer-title');dialog.setAttribute('aria-describedby','featured-viewer-note');
  function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node;}
  function button(label){const node=element('button','viewer-control',label);node.type='button';return node;}
  const header=element('div','viewer-header'),title=element('h2',null,'Project screenshot');title.id='featured-viewer-title';const close=button('Close');close.setAttribute('aria-label','Close screenshot viewer');header.append(title,close);
  const tools=element('div','viewer-tools'),out=button('Zoom out'),zoom=element('span','viewer-zoom','100%'),inside=button('Zoom in'),fit=button('Reset zoom');zoom.setAttribute('aria-live','polite');tools.append(out,zoom,inside,fit);
  const viewport=element('div','viewer-image-wrap');viewport.tabIndex=0;viewport.setAttribute('aria-label','Project screenshot; scroll to inspect when zoomed');const image=element('img','viewer-image');viewport.append(image);
  const footer=element('div','viewer-footer'),note=element('p',null,'Public interface captured 6 October 2026. Project reference supplied by BANDEVI’s owner; no customer endorsement implied.');note.id='featured-viewer-note';const links=element('div','viewer-links'),projectLink=element('a',null,'Explore this project ↗'),raw=element('a',null,'Open image in a new tab ↗');projectLink.href='/projects/trip-sarathi/';raw.href='/assets/portfolio-trip-sarathi.webp';raw.target='_blank';raw.rel='noopener noreferrer';links.append(projectLink,raw);footer.append(note,links);dialog.append(header,tools,viewport,footer);document.body.append(dialog);
  if(window.bgPublicMedia)window.bgPublicMedia(image);
  let scale=1,opener=null,baseWidth=0;
  function applyZoom(next){scale=Math.max(1,Math.min(2.5,next));image.style.width=(baseWidth*scale)+'px';zoom.textContent=Math.round(scale*100)+'%';out.disabled=scale===1;inside.disabled=scale===2.5;fit.disabled=scale===1;}
  function measure(){baseWidth=Math.min(viewport.clientWidth,viewport.clientHeight*Number(image.getAttribute('width'))/Number(image.getAttribute('height')));applyZoom(scale);}
  new ResizeObserver(()=>{if(dialog.open)measure();}).observe(viewport);
  out.addEventListener('click',()=>applyZoom(scale-.25));inside.addEventListener('click',()=>applyZoom(scale+.25));fit.addEventListener('click',()=>{applyZoom(1);viewport.scrollTo(0,0);});close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('featured-viewer-open');if(opener&&opener.isConnected)opener.focus({preventScroll:true});});
  dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const items=[...dialog.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(node=>node.getClientRects().length);const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  root.addEventListener('click',event=>{const link=event.target.closest('[data-featured-image-link],[data-featured-larger]');if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const selected=root.querySelector('[data-featured-index][aria-selected="true"]');const project=projects[Number(selected?.dataset.featuredIndex)];if(!project)return;
   const view=preview(project,root.dataset.device);
   event.preventDefault();opener=link;title.textContent=project.name+' · '+(root.dataset.device==='mobile'&&!project.record?'Mobile preview':project.category||'public homepage');image.src=view.image;image.alt=view.alt;image.width=view.width;image.height=view.height;projectLink.href=project.record||'/projects/'+project.slug+'/';projectLink.textContent=project.record?'Explore the CRM demo ↗':'Explore this project ↗';raw.href=image.src;note.textContent=view.source;scale=1;viewport.scrollTo(0,0);dialog.showModal();measure();document.documentElement.classList.add('featured-viewer-open');close.focus();
  });
  return true;
 }

 function init(){
  const root=document.querySelector('[data-featured-projects]');if(!root)return;
  const projects=[
   {name:'Trip Sarathi',slug:'trip-sarathi',height:578,mobile:'The current mobile homepage shows holiday discovery, activities and visa navigation.',description:'Flight search and travel-service navigation.'},
   {name:'MaximTrip',slug:'maximtrip',height:532,mobile:'Flight and holiday navigation.',description:'Flight and holiday pages with booking-management navigation.'},
   {name:'TripOdeal',slug:'tripodeal',height:532,mobile:'Travel-service navigation and a flight search form.',description:'Travel search, services and booking lookup.'},
   {name:'BANDEVI website',slug:'bandevi-website',height:532,mobile:'BANDEVI’s own internal website project; the current public homepage.',image:'/assets/bandevi-website-project.webp',category:'Internal website project',description:'Service pages, project enquiries and a private sales workspace.',source:'BANDEVI’s own website project. Public interface captured 4 October 2026; the current website has continued to evolve.'},
   {name:'BANDEVI CRM',slug:'bandevi-crm-demo',width:1280,height:720,image:'/assets/crm-walkthrough-poster.png',category:'Illustrative demo',record:'/crm-demo/#crm-video',solution:'CRM & ERP Package',alt:'BANDEVI CRM illustrative demo showing fictional enquiries, named owners and next actions',description:'Enquiries, named owners and next actions — shown with fictional records.',source:'Illustrative CRM demo with fictional records and named owners. No customer enquiry, booking or payment is sent; this is not a completed customer case study.'}
  ];
  const tabs=[...root.querySelectorAll('[data-featured-index]')],panel=root.querySelector('#featured-project-panel'),image=root.querySelector('[data-featured-image]');
  const controls=document.createElement('div');controls.className='project-device-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Project preview device');controls.hidden=true;
  const deviceNote=document.createElement('span');deviceNote.textContent='Public interface captures';controls.append(deviceNote);
  let device='desktop',current=4;
  for(const value of ['desktop','mobile']){const button=document.createElement('button');button.type='button';button.textContent=value==='desktop'?'Desktop':'Mobile';button.dataset.previewDevice=value;button.setAttribute('aria-pressed',String(value===device));button.addEventListener('click',()=>{device=value;select(current);});controls.append(button);}
  const frame=document.createElement('div');frame.className='featured-media-frame';const imageLink=root.querySelector('[data-featured-image-link]');imageLink.before(controls,frame);frame.append(imageLink);if(window.bgPublicMedia)window.bgPublicMedia(image,frame);
  const chooser=document.querySelector('#home-project-service'),projectInput=document.querySelector('[data-home-project]');
  const website='Website / App Development Package',travel='Complete Travel Website Package';
  const services={
   'Need guidance':{text:'Tell us what your business needs. We’ll help you choose the right starting point.',href:'/case-studies/#project-directory',label:'Browse project references',project:4},
   [website]:{text:'Plan your pages, app screens and customer enquiries. The BANDEVI website is an internal website reference; app scope is discussed separately.',href:'/website-mobile-app-development/',label:'Explore websites and apps',project:3},
   'CRM & ERP Package':{text:'Plan lead ownership, follow-ups, approvals and reporting. Explore our illustrative CRM demo; a matching completed CRM or ERP case study is not published yet.',href:'/sample-crm/',label:'Explore the illustrative CRM demo',project:4},
   [travel]:{text:'Plan travel search, enquiries and booking workflows. Review a travel portal reference, then discuss provider approvals and integrations for your scope.',href:'/travel-technology/',label:'Explore travel technology',project:0},
   'Customer Portal Package':{text:'Plan customer accounts, document access and request tracking. Discuss your access rules and workflow; a matching completed portal case study is not published yet.',href:'/customer-portal/',label:'Explore customer portals'}
  };
  function select(index,focus=false){
   const project=projects[index];if(!project)return;
   current=index;root.dataset.device=project.record?'desktop':device;controls.hidden=!project.mobile;
   controls.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.previewDevice===device)));
   tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
   panel.setAttribute('aria-labelledby',tabs[index].id);
   root.dataset.previewKind=project.record?'demo':'project';
   const record=project.record||'/projects/'+project.slug+'/',view=preview(project,root.dataset.device),screenshot=view.image;
   image.src=screenshot;image.width=view.width;image.height=view.height;image.alt=view.alt;
   deviceNote.textContent=device==='mobile'?'Mobile · 390 × 844 · 25 Oct 2026':'Desktop · '+(project.slug==='bandevi-website'?'4':'6')+' Oct 2026';
   root.querySelector('[data-featured-image-link]').href=screenshot;root.querySelector('[data-featured-image-link]').setAttribute('aria-label','View larger '+project.name+' screenshot ('+(viewerEnabled?'opens screenshot viewer':'opens new tab')+')');
   root.querySelector('[data-featured-project-link]').href=record;root.querySelector('[data-featured-project-link]').textContent=project.name+' ↗';
   root.querySelector('[data-featured-name]').textContent=project.name+' · '+(project.category||'B2C travel portal');root.querySelector('[data-featured-description]').textContent=root.dataset.device==='mobile'?project.mobile:project.description;
   root.querySelector('[data-featured-source]').textContent=view.source;
   root.querySelector('[data-featured-explore]').href=record;root.querySelector('[data-featured-explore]').textContent=project.record?'Explore the CRM demo ↗':'Explore this project ↗';root.querySelector('[data-featured-larger]').href=screenshot;
   const solution=project.solution||(project.slug==='bandevi-website'?website:travel);
   const code=project.slug.replaceAll('-','_'),discuss=root.querySelector('[data-featured-discuss]');
   const query=new URLSearchParams({solution,source:'/'});if(!project.record)query.set('project',code);
   discuss.textContent=project.record?'Discuss your CRM requirements ↗':'Discuss a similar project ↗';
   discuss.href='/contact-us/?'+query.toString()+'#contact-form';discuss.setAttribute('aria-label',(project.record?'Discuss your CRM requirements: ':'Discuss a similar project ↗: ')+project.name);
   if(projectInput){projectInput.disabled=Boolean(project.record)||!chooser||chooser.value!==solution;projectInput.value=projectInput.disabled?'':code;}
   if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(index));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next,true);});});
  const viewerEnabled=installScreenshotViewer(root,projects);
  panel.setAttribute('role','tabpanel');root.querySelector('.home-project-tabs').hidden=false;root.querySelector('.home-project-fallback').hidden=true;select(4);
  function guide(){
   const service=services[chooser.value]||services['Need guidance'];
   document.querySelector('[data-home-service-summary]').textContent=service.text;
   const link=document.querySelector('[data-home-service-link]');link.href=service.href;link.textContent=service.label+' ↗';
   if(service.project!==undefined)select(service.project);
   else if(projectInput){projectInput.disabled=true;projectInput.value='';}
  }
  if(chooser){chooser.addEventListener('change',guide);guide();}
 }
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


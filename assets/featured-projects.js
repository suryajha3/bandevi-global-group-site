(() => {
 function installScreenshotViewer(root,projects){
  if(typeof HTMLDialogElement==='undefined'||typeof HTMLDialogElement.prototype.showModal!=='function')return false;
  const dialog=document.createElement('dialog');dialog.className='home-project-viewer';dialog.setAttribute('aria-labelledby','featured-viewer-title');dialog.setAttribute('aria-describedby','featured-viewer-note');
  function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node;}
  function button(label){const node=element('button','viewer-control',label);node.type='button';return node;}
  const header=element('div','viewer-header'),title=element('h2',null,'Project screenshot');title.id='featured-viewer-title';const close=button('Close');close.setAttribute('aria-label','Close screenshot viewer');header.append(title,close);
  const tools=element('div','viewer-tools'),out=button('Zoom out'),zoom=element('span','viewer-zoom','100%'),inside=button('Zoom in'),fit=button('Reset zoom');zoom.setAttribute('aria-live','polite');tools.append(out,zoom,inside,fit);
  const viewport=element('div','viewer-image-wrap');viewport.tabIndex=0;viewport.setAttribute('aria-label','Project screenshot; scroll to inspect when zoomed');const image=element('img','viewer-image');viewport.append(image);
  const footer=element('div','viewer-footer'),note=element('p',null,'Public interface captured 6 October 2026. Project reference supplied by BANDEVI’s owner; no customer endorsement implied.');note.id='featured-viewer-note';const links=element('div','viewer-links'),projectLink=element('a',null,'Explore this project ↗'),raw=element('a',null,'Open image in a new tab ↗');raw.target='_blank';raw.rel='noopener noreferrer';links.append(projectLink,raw);footer.append(note,links);dialog.append(header,tools,viewport,footer);document.body.append(dialog);
  let scale=1,opener=null;
  function applyZoom(next){scale=Math.max(1,Math.min(2.5,next));image.style.width=(scale*100)+'%';zoom.textContent=Math.round(scale*100)+'%';out.disabled=scale===1;inside.disabled=scale===2.5;fit.disabled=scale===1;}
  out.addEventListener('click',()=>applyZoom(scale-.25));inside.addEventListener('click',()=>applyZoom(scale+.25));fit.addEventListener('click',()=>{applyZoom(1);viewport.scrollTo(0,0);});close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('featured-viewer-open');if(opener&&opener.isConnected)opener.focus({preventScroll:true});});
  dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const items=[...dialog.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(node=>node.getClientRects().length);const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  root.addEventListener('click',event=>{const link=event.target.closest('[data-featured-image-link],[data-featured-larger]');if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const selected=root.querySelector('[data-featured-index][aria-selected="true"]');const project=projects[Number(selected?.dataset.featuredIndex)];if(!project)return;
   event.preventDefault();opener=link;title.textContent=project.name+' · public homepage';image.src='/assets/portfolio-'+project.slug+'.jpg';image.alt=project.name+' public homepage screenshot';image.width=1239;image.height=project.height;projectLink.href='/projects/'+project.slug+'/';raw.href=image.src;applyZoom(1);viewport.scrollTo(0,0);dialog.showModal();document.documentElement.classList.add('featured-viewer-open');close.focus();
  });
  return true;
 }

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
   root.querySelector('[data-featured-image-link]').href=screenshot;root.querySelector('[data-featured-image-link]').setAttribute('aria-label','View larger '+project.name+' screenshot ('+(viewerEnabled?'opens screenshot viewer':'opens new tab')+')');
   root.querySelector('[data-featured-project-link]').href=record;root.querySelector('[data-featured-project-link]').textContent=project.name+' ↗';
   root.querySelector('[data-featured-name]').textContent=project.name+' · B2C travel portal';root.querySelector('[data-featured-description]').textContent=project.description;
   root.querySelector('[data-featured-explore]').href=record;root.querySelector('[data-featured-larger]').href=screenshot;
   if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(index));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next,true);});});
  const viewerEnabled=installScreenshotViewer(root,projects);
  panel.setAttribute('role','tabpanel');root.querySelector('.home-project-tabs').hidden=false;root.querySelector('.home-project-fallback').hidden=true;select(0);
 }
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


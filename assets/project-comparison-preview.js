/* Public comparison preview and explicit browser printing. No visitor fields or persistence. */
(() => {
  'use strict';
  function init() {
    const section=document.querySelector('.project-comparison[data-ready="true"]');
    const result=section?.querySelector('.comparison-result'),widget=document.querySelector('.project-shortlist-widget');
    if(!section||!result||!widget||section.dataset.previewReady)return;
    const origin='https://bandeviglobalgroup.com',label='Public project references — not a quotation.';
    const approved=new Map([['/projects/bandevi-website/','/assets/bandevi-home-evidence-20261015.webp'],['/projects/trip-sarathi/','/assets/portfolio-trip-sarathi.jpg'],['/projects/maximtrip/','/assets/portfolio-maximtrip.webp'],['/projects/tripodeal/','/assets/portfolio-tripodeal.webp']]);
    const map=new Map();
    try{
      const data=window.BGG_PUBLIC_PROJECT_COMPARISON;if(!Array.isArray(data)||data.length!==4)throw Error();
      for(const item of data){
        if(!item||Object.keys(item).sort().join(',')!=='attribution,captured,image,imageAlt,kind,limitations,scope,title,url,workflow'||!approved.has(item.url)||map.has(item.url)||item.image!==approved.get(item.url))throw Error();
        for(const key of ['title','kind','scope','workflow','attribution','limitations','captured','imageAlt'])if(typeof item[key]!=='string'||!item[key]||item[key].length>400)throw Error();
        map.set(item.url,Object.freeze({...item}));
      }
    }catch(_){return;}
    const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
    const button=(text,data)=>{const n=el('button',text);n.type='button';n.dataset[data]='';return n;};
    const controls=el('div',undefined,'comparison-preview-launch');controls.hidden=true;
    const launch=button('Preview comparison','comparisonPreviewOpen');
    const launchStatus=el('p','Review a browser-generated copy before printing or saving a PDF.','comparison-preview-help');launchStatus.setAttribute('role','status');controls.append(launch,launchStatus);
    const panel=el('section',undefined,'comparison-preview-panel');panel.hidden=true;panel.setAttribute('aria-labelledby','comparison-preview-heading');
    const heading=el('h3','Project Comparison Preview');heading.id='comparison-preview-heading';heading.tabIndex=-1;
    const content=el('div',undefined,'comparison-preview-content'),status=el('p',undefined,'comparison-preview-status');status.setAttribute('role','status');
    const print=button('Print / Save as PDF','comparisonPreviewPrint'),update=button('Update preview','comparisonPreviewUpdate'),close=button('Close preview','comparisonPreviewClose');print.disabled=true;update.hidden=true;
    const actions=el('div',undefined,'comparison-preview-actions');actions.append(print,update,close);
    panel.append(heading,el('p',label,'comparison-preview-label'),
      el('p','Review these public references and their limitations. The preview contains the compared references only. Your own project scope, price and delivery still need separate agreement.','comparison-preview-help'),
      content,status,actions,el('p','Choose a printer or Save as PDF in the browser print window. Printing does not send an enquiry or save comparison choices.','comparison-preview-help'));
    result.after(controls,panel);
    const paper=el('article');paper.id='bgg-comparison-print';paper.hidden=true;document.body.append(paper);
    const note='Public interface screenshots do not establish live supplier access, completed bookings, customer endorsements or measured business results. Your own scope, integrations, acceptance and handover need separate agreement. Generated in this browser.';
    let snapshot=null,prepared=null,ready=false,printing=false,generation=0;
    const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
    function read(){
      if(!section.isConnected||section.hidden||result.hidden)return null;
      const table=result.querySelector('.comparison-table-region table');if(!table)return null;
      const urls=[...table.querySelectorAll('thead th a')].map(a=>a.getAttribute('href'));
      const selected=[...section.querySelectorAll('[data-compare-reference]:checked')].map(n=>n.value);
      const available=[...widget.querySelectorAll('.shortlist-references a')].map(a=>a.getAttribute('href'));
      if(urls.length<2||urls.length>3||new Set(urls).size!==urls.length||!urls.every(u=>map.has(u)&&available.includes(u))||!same(urls,selected))return null;
      return {urls,rows:urls.map(u=>map.get(u)),signature:JSON.stringify([urls,selected,available,table.textContent,[...table.querySelectorAll('img')].map(i=>[i.getAttribute('src'),i.getAttribute('alt')])])};
    }
    function current(){return !!snapshot&&read()?.signature===snapshot.signature;}
    function tableFor(data,printable=false){
      const table=el('table',undefined,printable?'comparison-print-table':'comparison-preview-table');
      const columns=el('colgroup');for(let i=0;i<=data.rows.length;i++){const col=el('col');if(i===0)col.style.width=printable?'32mm':'140px';columns.append(col);}table.append(columns);
      const head=el('thead');
      if(printable){const row=el('tr'),identity=el('th');identity.colSpan=data.rows.length+1;identity.append(el('p','BANDEVI GLOBAL GROUP','comparison-print-brand'),el('h1','Project Comparison'),el('p',label,'comparison-print-label'));row.append(identity);head.append(row);}
      const titles=el('tr'),first=el('th','Published detail');first.scope='col';titles.append(first);
      for(const item of data.rows){const th=el('th'),link=el('a',item.title),source=el('span',origin+item.url,'comparison-preview-source');th.scope='col';link.href=origin+item.url;th.append(link,source);titles.append(th);}head.append(titles);table.append(head);
      const body=el('tbody');
      for(const [key,name] of [['kind','Reference type'],['scope','Published scope'],['workflow','Workflow shown'],['image','Dated screenshot'],['attribution','Development attribution'],['limitations','Evidence limitations']]){
        const row=el('tr'),th=el('th',name);th.scope='row';row.append(th);
        for(const item of data.rows){const td=el('td');if(key==='image'){const link=el('a'),image=el('img');link.href=origin+item.image;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Open '+item.title+' public screenshot');image.src=item.image;image.alt=item.imageAlt;image.loading='eager';image.decoding='async';link.append(image);td.append(link,el('p','Captured '+item.captured+'. The live interface may have changed.'));}else td.textContent=item[key];row.append(td);}body.append(row);
      }
      if(printable){const row=el('tr'),td=el('td',note,'comparison-print-note');td.colSpan=data.rows.length+1;row.append(td);body.append(row);}
      table.append(body);return table;
    }
    function imageReady(image){
      if(image.complete)return image.naturalWidth>0?Promise.resolve():Promise.reject(Error('Screenshot unavailable'));
      return new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>done(false),15000);
        function done(ok){clearTimeout(timer);image.removeEventListener('load',loaded);image.removeEventListener('error',failed);ok&&image.naturalWidth>0?resolve():reject(Error('Screenshot unavailable'));}
        const loaded=()=>done(true),failed=()=>done(false);image.addEventListener('load',loaded,{once:true});image.addEventListener('error',failed,{once:true});
      });
    }
    function invalidate(){
      if(!snapshot||panel.hidden||current())return;
      ready=false;print.disabled=true;update.hidden=false;
      status.textContent='This preview is out of date. Compare your current selection, then choose Update preview and review it again before printing.';
      if(printing)paper.replaceChildren(el('h1','Comparison changed'),el('p',label),el('p','Close this print window. Update and review the current comparison before printing.'));
    }
    function sync(){
      const state=read();controls.hidden=!state&&!snapshot;launch.disabled=!state||printing;
      if(!state&&snapshot)launchStatus.textContent='Choose Compare with your current references before updating the preview.';
      invalidate();
    }
    function show(){
      const data=read();if(!data||printing){sync();return;}
      const ticket=++generation;snapshot=data;ready=false;print.disabled=true;update.hidden=true;
      const region=el('div',undefined,'comparison-preview-region');region.tabIndex=0;region.setAttribute('role','region');region.setAttribute('aria-label','Public comparison preview table');region.append(tableFor(data));
      content.replaceChildren(region,el('p',note,'comparison-preview-help'));
      prepared=el('div');prepared.append(tableFor(data,true));
      panel.hidden=false;status.textContent='Preparing the public screenshots. Review the comparison below.';launchStatus.textContent='Preview generated in this tab.';
      heading.focus({preventScroll:true});panel.scrollIntoView({block:'start',behavior:'instant'});
      Promise.all([...content.querySelectorAll('img'),...prepared.querySelectorAll('img')].map(imageReady)).then(()=>{
        if(ticket!==generation||!snapshot||panel.hidden)return;
        if(!current()){invalidate();return;}
        ready=true;print.disabled=typeof window.print!=='function';status.textContent=print.disabled?'Printing is unavailable in this browser. You can still review the public comparison.':'Public screenshots are ready. Review the preview before choosing Print / Save as PDF.';
      }).catch(()=>{
        if(ticket!==generation||!snapshot||panel.hidden)return;
        ready=false;print.disabled=true;update.hidden=false;status.textContent='A public screenshot could not be loaded. Choose Update preview to try again before printing. Your shortlist is unchanged.';
      });
    }
    function finish(){
      if(!printing)return;printing=false;document.body.removeAttribute('data-bgg-comparison-print-ready');paper.replaceChildren();
      print.disabled=!ready||!current()||typeof window.print!=='function';
      if(current())status.textContent='Print window closed. You can review or print this comparison again.';else invalidate();sync();
    }
    function reset(){
      generation++;finish();snapshot=null;prepared=null;ready=false;panel.hidden=true;content.replaceChildren();paper.replaceChildren();update.hidden=true;print.disabled=true;status.textContent='';launchStatus.textContent='Review a browser-generated copy before printing or saving a PDF.';sync();
    }
    launch.addEventListener('click',show);update.addEventListener('click',show);
    close.addEventListener('click',()=>{reset();if(!launch.disabled)launch.focus({preventScroll:true});else section.querySelector('h2')?.focus();controls.scrollIntoView({block:'center',behavior:'instant'});});
    print.addEventListener('click',()=>{
      if(printing||!snapshot||!ready||panel.hidden||!prepared)return;
      if(!current()){invalidate();return;}
      try{
        if(typeof window.print!=='function')throw Error('Printing unavailable');
        if([...prepared.querySelectorAll('img')].some(i=>!i.complete||!i.naturalWidth))throw Error('Screenshot unavailable');
        paper.replaceChildren(prepared);printing=true;print.disabled=true;document.body.dataset.bggComparisonPrintReady='true';status.textContent='Use the browser print window to print or save a PDF.';sync();window.print();
      }catch(_){finish();status.textContent='The print window could not open. Your comparison and shortlist are unchanged. You can try again or use another browser.';}
    });
    section.addEventListener('change',sync);
    section.querySelector('[data-project-compare]')?.addEventListener('click',sync);
    section.querySelector('[data-project-comparison-clear]')?.addEventListener('click',reset);
    for(const target of [result,widget,section.querySelector('.comparison-options')])if(target)new MutationObserver(sync).observe(target,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','href','src','alt','value','checked']});
    window.addEventListener('beforeprint',()=>{if(printing&&!current())invalidate();});window.addEventListener('afterprint',finish);
    window.matchMedia?.('print')?.addEventListener?.('change',event=>{if(!event.matches)finish();});
    section.dataset.previewReady='true';sync();
  }
  if(document.readyState==='complete')init();else document.addEventListener('DOMContentLoaded',init,{once:true});
})();

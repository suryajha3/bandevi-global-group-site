/* Manual comparison of approved public references already present in the existing shortlist. */
(() => {
  'use strict';
  function init() {
    const host=document.querySelector('[data-shortlist-host]');
    const widget=host?.querySelector('.project-shortlist-widget[data-ready="true"]');
    if (!host || !widget || host.dataset.comparisonReady) return;
    const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
    const approved=new Map([['/projects/bandevi-website/','/assets/bandevi-home-evidence-20261015.webp'],['/projects/trip-sarathi/','/assets/portfolio-trip-sarathi.jpg'],['/projects/maximtrip/','/assets/portfolio-maximtrip.webp'],['/projects/tripodeal/','/assets/portfolio-tripodeal.webp']]);
    const map=new Map();
    try {
      const data=window.BGG_PUBLIC_PROJECT_COMPARISON;
      if (!Array.isArray(data)||data.length!==4) throw Error();
      for (const item of data) {
        if (!item||Object.keys(item).sort().join(',')!=='attribution,captured,image,imageAlt,kind,limitations,scope,title,url,workflow'||!approved.has(item.url)||map.has(item.url)||item.image!==approved.get(item.url)) throw Error();
        for (const k of ['title','kind','scope','workflow','attribution','limitations','captured','imageAlt']) if(typeof item[k]!=='string'||!item[k]||item[k].length>400)throw Error();
        map.set(item.url,item);
      }
    } catch (_) {
      const error=el('p','Public comparison information is unavailable. Your existing shortlist and brief review remain available.');error.setAttribute('role','status');host.after(error);return;
    }
    host.dataset.comparisonReady='true';
    const section=el('section',undefined,'project-comparison');section.setAttribute('aria-labelledby','project-comparison-title');
    const title=el('h2','Compare your project references');title.id='project-comparison-title';title.tabIndex=-1;
    const help=el('p','Choose two or three project references from your current shortlist, then choose Compare. Services and guides stay in your shortlist and are not included in this comparison.');
    const choices=el('fieldset',undefined,'comparison-choices');choices.append(el('legend','References to compare'));
    const options=el('div',undefined,'comparison-options');choices.append(options);
    const status=el('p');status.setAttribute('role','status');status.id='project-comparison-status';status.dataset.comparisonStatus='';
    const actions=el('div',undefined,'comparison-actions');
    const compare=el('button','Compare'),clear=el('button','Clear comparison');compare.type=clear.type='button';compare.dataset.projectCompare='';clear.dataset.projectComparisonClear='';actions.append(compare,clear);
    const browse=el('a','Find project references in Site Search ↗');browse.href='/search/';
    const result=el('div',undefined,'comparison-result');result.hidden=true;
    section.append(title,help,choices,status,actions,browse,
      el('p','Comparison choices stay in this tab. Clear comparison leaves your shortlist untouched. Save shortlist and use its existing Review in project brief action when you want to discuss the references.', 'comparison-help'),result);
    host.after(section);
    let available=[],selected=new Set(),applied=[],availability=null;
    function current() {return [...new Set([...widget.querySelectorAll('.shortlist-references a[href]')].map(a=>a.getAttribute('href')).filter(url=>map.has(url)))];}
    const chosen=()=>available.filter(url=>selected.has(url));
    const same=(a,b)=>a.length===b.length&&a.every((url,i)=>url===b[i]);
    function paint() {
      const picks=chosen();compare.disabled=picks.length<2||picks.length>3;clear.disabled=!selected.size&&!applied.length;
      for(const input of options.querySelectorAll('input')){input.checked=selected.has(input.value);input.disabled=!input.checked&&selected.size>=3;}
      if(available.length<2)status.textContent=available.length?'One eligible project reference is in your shortlist. Add another from Site Search to compare.':'No eligible project references are in your shortlist. Add project references from Site Search to compare.';
      else if(applied.length&&!same(picks,applied))status.textContent='Selection changed. The displayed comparison still shows '+applied.map(url=>map.get(url).title).join(', ')+'. Choose Compare to update it.';
      else if(applied.length)status.textContent='Comparing '+applied.length+' public project references. Published facts and evidence limitations are shown below.';
      else status.textContent=picks.length+' of 3 references selected. Choose at least two, then Compare.';
    }
    function refresh() {
      const next=current(),signature=JSON.stringify(next);if(signature===availability)return;
      availability=signature;available=next;selected=new Set([...selected].filter(url=>available.includes(url)));
      if(applied.some(url=>!available.includes(url))){applied=[];result.replaceChildren();result.hidden=true;}
      options.replaceChildren();
      for(const url of available){const item=map.get(url),label=el('label'),input=el('input');input.type='checkbox';input.value=url;input.dataset.compareReference=url;const copy=el('span');copy.append(el('strong',item.title),el('small',item.kind));label.append(input,copy);input.addEventListener('change',()=>{if(input.checked){if(selected.size<3)selected.add(url);}else selected.delete(url);paint();});options.append(label);}
      if(!available.length)options.append(el('p','Only the four published project references can be compared here. Find them in Site Search and add them to your shortlist.'));
      paint();
    }
    function render(urls) {
      const heading=el('h3','Side-by-side project comparison');heading.id='project-comparison-result-title';heading.tabIndex=-1;
      const instructions=el('p','On smaller screens, scroll the comparison sideways. Keyboard users can focus the table region and use the arrow keys. Each source page explains the full evidence and what remains unconfirmed.');instructions.id='project-comparison-scroll-help';
      const region=el('div',undefined,'comparison-table-region');region.tabIndex=0;region.setAttribute('role','region');region.setAttribute('aria-labelledby',heading.id);region.setAttribute('aria-describedby',instructions.id+' '+status.id);
      const table=el('table');table.append(el('caption','Published reference comparison: '+urls.map(url=>map.get(url).title).join(', ')));
      const head=el('thead'),header=el('tr'),label=el('th','Published detail');label.scope='col';header.append(label);
      for(const url of urls){const th=el('th'),link=el('a',map.get(url).title);th.scope='col';link.href=url;th.append(link);header.append(th);}head.append(header);table.append(head);
      const body=el('tbody');
      for(const [key,label] of [['kind','Reference type'],['scope','Published scope'],['workflow','Workflow shown'],['image','Dated screenshot'],['attribution','Development attribution'],['limitations','Evidence limitations']]){
        const row=el('tr'),th=el('th',label);th.scope='row';row.append(th);
        for(const url of urls){const item=map.get(url),td=el('td');if(key==='image'){const link=el('a'),img=el('img');link.href=item.image;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Open '+item.title+' public screenshot captured '+item.captured+' in a new tab');img.src=item.image;img.alt=item.imageAlt;img.loading='lazy';img.decoding='async';link.append(img);td.append(link,el('p','Captured '+item.captured+'. The live interface may have changed.','comparison-help'));}else td.textContent=item[key];row.append(td);}body.append(row);
      }
      const sourceRow=el('tr'),sourceHead=el('th','Full published reference');sourceHead.scope='row';sourceRow.append(sourceHead);for(const url of urls){const td=el('td'),link=el('a','Review '+map.get(url).title+' ↗');link.href=url;td.append(link);sourceRow.append(td);}body.append(sourceRow);table.append(body);region.append(table);
      result.replaceChildren(heading,instructions,region,
        el('p','These are references for discussion. Public interface screenshots do not establish live supplier access, completed bookings, customer endorsements or measured business results. Your own scope, integrations, acceptance and handover need separate agreement.','comparison-help'));
      result.hidden=false;heading.focus({preventScroll:true});result.scrollIntoView({block:'start',behavior:'instant'});
    }
    compare.addEventListener('click',()=>{refresh();const picks=chosen();if(picks.length<2||picks.length>3)return;applied=picks.slice();render(applied);paint();});
    clear.addEventListener('click',()=>{selected.clear();applied=[];result.replaceChildren();result.hidden=true;paint();status.textContent='Comparison cleared. Your current and saved shortlist are unchanged.';title.focus({preventScroll:true});section.scrollIntoView({block:'start',behavior:'instant'});});
    new MutationObserver(refresh).observe(widget,{childList:true,subtree:true});
    refresh();section.dataset.ready='true';
  }
  if(document.readyState==='complete')init();else document.addEventListener('DOMContentLoaded',init,{once:true});
})();

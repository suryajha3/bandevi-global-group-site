/* Search the embedded, curated public directory. No requests, storage or telemetry. */
(()=>{'use strict';
 const categories=['All','Services','Projects','Guides'];
 function init(){
  const form=document.querySelector('[data-site-search-form]');if(!form||form.dataset.ready)return;
  const query=form.elements.keyword,list=document.querySelector('[data-site-search-results]'),summary=document.querySelector('[data-site-search-summary]'),pending=document.querySelector('[data-site-search-pending]'),error=document.querySelector('[data-site-search-error]'),empty=document.querySelector('[data-site-search-empty]');
  let entries;try{
   entries=JSON.parse(document.getElementById('public-search-index').textContent);
   if(!Array.isArray(entries)||!entries.length||entries.length>100)throw Error('Invalid directory');
   const urls=new Set();for(const item of entries){
    if(!item||!categories.slice(1).includes(item.category)||typeof item.title!=='string'||!item.title||item.title.length>160||typeof item.description!=='string'||item.description.length>600||typeof item.keywords!=='string'||item.keywords.length>400||typeof item.url!=='string'||!/^\/(?:[a-z0-9-]+\/){1,3}$/.test(item.url)||/^\/(?:api|server|admin|team-inbox|client-portal|client-proposal|login|logout|search)\//.test(item.url)||urls.has(item.url))throw Error('Invalid public entry');
    urls.add(item.url);
   }
  }catch(_){error.hidden=false;error.textContent='Search is unavailable. You can still browse the public directory below.';return;}
  const normalized=text=>text.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const indexed=entries.map(item=>({item,title:normalized(item.title),description:normalized(item.description),keywords:normalized(item.keywords)}));
  let applied={keyword:'',category:'All'};
  function selection(){return {keyword:query.value.trim(),category:form.elements.category.value};}
  function draft(){const current=selection();pending.hidden=current.keyword===applied.keyword&&current.category===applied.category;error.hidden=true;}
  function show(items,message){
   const fragment=document.createDocumentFragment();
   for(const item of items){const li=document.createElement('li'),kind=document.createElement('span'),heading=document.createElement('h3'),link=document.createElement('a'),description=document.createElement('p');kind.className='site-search-kind';kind.textContent=item.category;link.href=item.url;link.textContent=item.title;heading.append(link);description.textContent=item.description;li.append(kind,heading,description);fragment.append(li);}
   list.replaceChildren(fragment);summary.textContent=message;empty.hidden=items.length!==0;pending.hidden=true;error.hidden=true;
  }
  form.addEventListener('submit',event=>{
   event.preventDefault();const current=selection();
   if(current.keyword.length>120||!categories.includes(current.category)){error.textContent='Use up to 120 characters and choose one of the listed content types.';error.hidden=false;return;}
   const terms=normalized(current.keyword).split(/\s+/).filter(Boolean);
   const matches=indexed.filter(row=>(current.category==='All'||row.item.category===current.category)&&terms.every(term=>(row.title+' '+row.description+' '+row.keywords).includes(term)))
    .map(row=>({item:row.item,score:(terms.length&&row.title.startsWith(terms.join(' '))?8:0)+terms.reduce((score,term)=>score+(row.title.includes(term)?8:0)+(row.keywords.includes(term)?4:0)+(row.description.includes(term)?2:0),0)}))
    .sort((a,b)=>b.score-a.score||categories.indexOf(a.item.category)-categories.indexOf(b.item.category)||a.item.title.localeCompare(b.item.title,'en')).map(row=>row.item);
   applied=current;show(matches,`${matches.length} ${matches.length===1?'result':'results'}${current.keyword?' for “'+current.keyword+'”':''}${current.category==='All'?' across all content':' in '+current.category}.`);
  });
  form.addEventListener('input',draft);form.addEventListener('change',draft);
  form.querySelector('[data-site-search-clear]').addEventListener('click',()=>{query.value='';form.elements.category.value='All';applied={keyword:'',category:'All'};show(entries,`Cleared. Browse ${entries.length} public pages.`);query.focus();});
  form.querySelectorAll('input,button').forEach(control=>control.disabled=false);form.dataset.ready='true';
 }
 if(document.readyState==='complete')init();else document.addEventListener('DOMContentLoaded',init,{once:true});
})();

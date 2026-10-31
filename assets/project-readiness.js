/* Fixed browser-local planning choices. No requests, analytics or automatic saves. */
(() => {
  'use strict';
  const KEY='bgg_public_project_readiness_v1', HANDOFF='bgg_public_project_readiness_handoff_v1';
  const IDS=['scope','content_data','integrations','access','approvals','budget_timing'];
  const LABELS={ready:'Ready',need_help:'Need help',not_sure:'Not sure'};
  function init() {
    if(document.documentElement.dataset.readinessReady) return;
    const items=window.BGG_PUBLIC_READINESS_ITEMS;
    if(!Array.isArray(items)||items.length!==IDS.length||items.some((item,i)=>item.id!==IDS[i]||typeof item.title!=='string'||item.title.length>60||!item.guidance||Object.keys(LABELS).some(key=>typeof item.guidance[key]!=='string'||item.guidance[key].length>180))) return;
    document.documentElement.dataset.readinessReady='true';
    const byId=new Map(items.map(item=>[item.id,item]));
    const ordered=answers=>Object.fromEntries(IDS.filter(id=>Object.hasOwn(answers,id)).map(id=>[id,answers[id]]));
    function answers(value) {
      if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>IDS.length||Object.entries(value).some(([id,choice])=>!IDS.includes(id)||typeof choice!=='string'||!Object.hasOwn(LABELS,choice))) throw Error('Invalid choices');
      return ordered(value);
    }
    function parse(raw) {
      if(raw===null) return {};
      if(typeof raw!=='string'||raw.length>2048) throw Error('Invalid choices');
      const data=JSON.parse(raw);
      if(!data||Object.keys(data).sort().join(',')!=='answers,version'||data.version!==1) throw Error('Invalid choices');
      return answers(data.answers);
    }
    const encode=value=>JSON.stringify({version:1,answers:ordered(value)});
    const same=(a,b)=>encode(a)===encode(b);
    function parseHandoff(raw) {
      if(typeof raw!=='string'||raw.length>3072) throw Error('Invalid handoff');
      const data=JSON.parse(raw);
      if(!data||Object.keys(data).sort().join(',')!=='answers,selected,version'||data.version!==1) throw Error('Invalid handoff');
      data.answers=answers(data.answers);
      if(!Array.isArray(data.selected)||!data.selected.length||data.selected.length>IDS.length||new Set(data.selected).size!==data.selected.length||data.selected.some(id=>!IDS.includes(id)||!Object.hasOwn(data.answers,id))) throw Error('Invalid handoff');
      data.selected=IDS.filter(id=>data.selected.includes(id)); return data;
    }
    function el(tag,text,className) { const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node; }
    const note=(id,choice)=>byId.get(id).title+': '+LABELS[choice]+' (visitor response).';
    const checklist=document.querySelector('[data-readiness-form]');
    if(checklist) {
      const controls=[...checklist.querySelectorAll('[data-readiness-answer]')],save=checklist.querySelector('[data-readiness-save]'),clear=checklist.querySelector('[data-readiness-clear]'),reload=checklist.querySelector('[data-readiness-reload]');
      const status=checklist.querySelector('[data-readiness-summary]'),error=checklist.querySelector('[data-readiness-error]'),notes=document.querySelector('[data-readiness-notes]'),review=document.querySelector('[data-readiness-review]');
      let saved={},draft={},baseRaw=null,conflict=false,readable=true,validSaved=true,selected=new Set();
      const dirty=()=>!same(draft,saved);
      function notice(text,bad=false) { error.hidden=!bad;if(bad)error.textContent=text;else status.textContent=text; }
      function load() {
        selected.clear();conflict=false;
        try { baseRaw=localStorage.getItem(KEY);saved=parse(baseRaw);draft={...saved};readable=true;validSaved=true;notice(Object.keys(saved).length?Object.keys(saved).length+' saved responses loaded from this browser.':'No saved responses yet. Choose any planning responses, then Save checklist.'); }
        catch(_) { saved={};draft={};validSaved=false;try{baseRaw=localStorage.getItem(KEY);readable=true;notice('The saved checklist could not be read. Clear it, or choose responses and Save checklist to replace it.',true);}catch(_){baseRaw=null;readable=false;notice('Browser storage is unavailable. You can explore the choices, but saving and brief handoff need browser storage.',true);} }
      }
      function updateReview() { review.disabled=dirty()||conflict||!readable||!validSaved||!selected.size; }
      function render() {
        for(const control of controls) { const id=control.dataset.readinessAnswer;control.disabled=false;control.value=draft[id]||'';document.getElementById('readiness-guidance-'+id).textContent=draft[id]?byId.get(id).guidance[draft[id]]:'Choose a response to see a useful next step.'; }
        save.disabled=conflict||!dirty();clear.disabled=!Object.keys(draft).length&&baseRaw===null;reload.hidden=!(conflict||!readable||!validSaved);
        notes.replaceChildren();
        if(!Object.keys(saved).length) notes.append(el('p','Save a response to make it available for review.'));
        for(const id of IDS.filter(id=>Object.hasOwn(saved,id))) {
          const label=el('label',undefined,'readiness-note-choice'),input=el('input'),copy=el('span');input.type='checkbox';input.dataset.readinessNote=id;input.checked=selected.has(id);input.disabled=dirty()||conflict||!readable||!validSaved;
          copy.append(el('strong',byId.get(id).title),el('span',LABELS[saved[id]]+' — '+byId.get(id).guidance[saved[id]]));label.append(input,copy);notes.append(label);
          input.addEventListener('change',()=>{if(input.checked)selected.add(id);else selected.delete(id);updateReview();});
        }
        updateReview();
      }
      function fresh() {
        try { if(localStorage.getItem(KEY)!==baseRaw) { conflict=true;selected.clear();render();notice('The saved checklist changed in another tab. Reload saved checklist before saving or continuing. Reload replaces your unsaved choices.',true);return false; }return true; }
        catch(_) { readable=false;render();notice('Browser storage is unavailable. Your current choices have not been saved.',true);return false; }
      }
      checklist.addEventListener('submit',event=>event.preventDefault());
      for(const control of controls) control.addEventListener('change',()=>{
        const id=control.dataset.readinessAnswer;if(control.value)draft[id]=control.value;else delete draft[id];selected.clear();render();notice(Object.keys(draft).length+' of '+IDS.length+' items answered. '+(dirty()?'Unsaved changes — choose Save checklist before leaving.':'These responses match the saved checklist.'));
      });
      save.addEventListener('click',()=>{
        if(conflict||!fresh())return;
        const value=Object.keys(draft).length?encode(draft):null;
        try { if(value===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,value);if(localStorage.getItem(KEY)!==value)throw Error();baseRaw=value;saved={...draft};validSaved=readable=true;selected.clear();render();notice('Checklist saved on this browser. Select the notes you want to review for your brief.'); }
        catch(_) { readable=false;render();notice('Could not verify the save. Your choices stay on this page. Reload the saved checklist before continuing.',true); }
      });
      clear.addEventListener('click',()=>{
        draft={};selected.clear();let removed=false;
        try {localStorage.removeItem(KEY);if(localStorage.getItem(KEY)!==null)throw Error();baseRaw=null;saved={};conflict=false;readable=validSaved=true;removed=true;}catch(_){notice('The current choices are clear, but the saved checklist could not be removed from this browser.',true);}
        try{sessionStorage.removeItem(HANDOFF);}catch(_){}render();if(removed)notice('Checklist cleared from this browser. Your shortlist is unchanged.');status.focus({preventScroll:true});checklist.scrollIntoView({behavior:'instant',block:'start'});
      });
      reload.addEventListener('click',()=>{load();render();});
      review.addEventListener('click',()=>{
        if(dirty()||conflict||!readable||!validSaved||!selected.size||!fresh())return;
        try {const current=parse(localStorage.getItem(KEY));if(!same(current,saved))throw Error();const raw=JSON.stringify({version:1,answers:ordered(saved),selected:IDS.filter(id=>selected.has(id))});sessionStorage.setItem(HANDOFF,raw);if(sessionStorage.getItem(HANDOFF)!==raw)throw Error();location.assign('/project-brief/#readiness-review');}
        catch(_) {notice('The brief handoff could not be prepared. Your saved checklist has been kept. Check browser storage and try again.',true);}
      });
      window.addEventListener('storage',event=>{if(event.key!==KEY&&event.key!==null)return;if(dirty()){conflict=true;selected.clear();render();notice('The saved checklist changed in another tab. Reload saved checklist before saving or continuing. Reload replaces your unsaved choices.',true);}else{load();render();}});
      window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
      status.tabIndex=-1;load();render();checklist.dataset.ready='true';
    }

    const form=document.getElementById('project-brief');if(!form)return;
    let raw,data;try{raw=sessionStorage.getItem(HANDOFF);}catch(_){return;}if(raw===null)return;
    try{data=parseHandoff(raw);}catch(_){data=null;}
    const panel=el('section',undefined,'readiness-brief-review');panel.id='readiness-review';panel.setAttribute('aria-labelledby','readiness-review-heading');
    const heading=el('h2','Review your readiness notes');heading.id='readiness-review-heading';heading.tabIndex=-1;
    const help=el('p','These are your planning responses, not agreed scope, verified readiness or a quotation. Review the selected notes before choosing Use readiness notes. Your existing Features / integrations text is kept.');
    const list=el('ul',undefined,'readiness-review-list');if(data)for(const id of data.selected)list.append(el('li',note(id,data.answers[id])));
    const status=el('p',undefined,'readiness-status'),error=el('p',undefined,'readiness-error');status.setAttribute('role','status');error.setAttribute('role','alert');error.hidden=true;
    const actions=el('div',undefined,'readiness-actions'),use=el('button','Use readiness notes'),cancel=el('button','Cancel readiness review'),back=el('a','Review saved checklist ↗');use.type=cancel.type='button';back.href='/project-readiness/';actions.append(use,cancel,back);panel.append(heading,help,list,status,error,actions);form.before(panel);
    const features=form.elements.briefFeatures;let used=false;
    function valid(){try{return data&&same(parse(localStorage.getItem(KEY)),data.answers)&&sessionStorage.getItem(HANDOFF)===raw;}catch(_){return false;}}
    function invalid(text){use.disabled=true;error.textContent=text;error.hidden=false;}
    if(!data||!valid())invalid('The saved checklist has changed or is unavailable. Return to the checklist and review the current responses.');
    use.addEventListener('click',()=>{
      if(used)return;if(!valid()){invalid('The saved checklist changed. Return to the checklist and review it again.');return;}
      if(!features||form.hidden||features.disabled||features.readOnly||form.dataset.sending==='true'){invalid('The brief is not ready to accept notes. Review the checklist again when the form is available.');return;}
      const original=features.value;
      const conflicts=data.selected.filter(id=>Object.keys(LABELS).some(choice=>choice!==data.answers[id]&&original.includes(note(id,choice))));
      if(conflicts.length){error.textContent='Features / integrations already contains a different readiness response for '+conflicts.map(id=>byId.get(id).title).join(', ')+'. Review or remove that earlier note before adding this version.';error.hidden=false;return;}
      const missing=data.selected.filter(id=>!original.includes(note(id,data.answers[id]))),block=missing.length?'Planning responses to discuss:\n'+missing.map(id=>'- '+note(id,data.answers[id])).join('\n'):'';
      const next=block?original+(original?(original.endsWith('\n')?'\n':'\n\n'):'')+block:original,limit=Math.min(features.maxLength>0?features.maxLength:1100,1100);
      if(next.length>limit){error.textContent='These notes and your existing features exceed '+limit+' characters. Edit the features or choose fewer notes, then try again.';error.hidden=false;return;}
      try{sessionStorage.removeItem(HANDOFF);if(sessionStorage.getItem(HANDOFF)!==null)throw Error();}catch(_){error.textContent='The handoff could not be cleared from this tab. No brief fields have changed. Check browser storage and try again.';error.hidden=false;return;}
      if(missing.length){features.value=next;features.dispatchEvent(new Event('input',{bubbles:true}));features.dispatchEvent(new Event('change',{bubbles:true}));}
      used=true;use.disabled=true;error.hidden=true;panel.dataset.applied='true';status.textContent=missing.length?'Selected planning responses added. Review the complete brief before sending.':'These planning responses are already in Features / integrations.';cancel.textContent='Close readiness review';
    });
    cancel.addEventListener('click',()=>{try{sessionStorage.removeItem(HANDOFF);}catch(_){}panel.remove();form.querySelector('[data-brief-step]:not([hidden]) h2')?.focus();});
    window.addEventListener('storage',event=>{if(!used&&(event.key===KEY||event.key===null)&&!valid())invalid('The saved checklist changed in another tab. Return to the checklist and review it again.');});
    panel.dataset.ready='true';if(location.hash==='#readiness-review'){heading.focus({preventScroll:true});panel.scrollIntoView({behavior:'instant',block:'start'});}
  }
  if(document.readyState==='complete')init();else document.addEventListener('DOMContentLoaded',init,{once:true});
})();

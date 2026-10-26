/* Optional CRM analytics. Loaded code is inert until the server enables collection.
   Capabilities only revoke consent. No customer details or GA identifiers in storage. */
(()=>{
  'use strict';
  const choiceKey='bg_crm_analytics_v1',registryKey='bg_crm_analytics_tokens_v1',policy='crm-analytics-v1';
  const maxAge=30*86400000,cache=new Map();let config=false,storageOK=true,flushing=false,retryAfterFlush=false,retryTimer,retryDelay=5000,choice=null,registry=[],box,status,allow,stop;
  function read(key){try{return JSON.parse(localStorage.getItem(key));}catch(_){storageOK=false;return null;}}
  function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){storageOK=false;return false;}}
  function validRegistry(value){return Array.isArray(value)&&value.length<=50&&value.every(x=>x&&/^[a-f0-9]{64}$/.test(x.token)&&Number.isSafeInteger(x.expires)&&typeof x.pending==='boolean');}
  function load(){
    choice=read(choiceKey);if(!choice||choice.policy!==policy||typeof choice.revision!=='string'||choice.expires>Date.now()+maxAge)choice=null;
    const value=read(registryKey);
    if(value!==null&&!validRegistry(value))storageOK=false;
    registry=validRegistry(value)?value:[];
    registry=registry.filter(x=>x.expires>Date.now());
  }
  const qa=()=>window.__BANDEVI_QA__===true||['qa','debug','debug_mode','debug_event','ga_debug'].some(k=>new URL(location.href).searchParams.has(k));
  function basic(){const c=read('bg_analytics_consent_v1');return c?.choice==='granted'&&c.expires>Date.now()&&navigator.doNotTrack!=='1'&&window.bgAnalyticsConsent?.allowed()===true;}
  function permitted(){return config&&storageOK&&basic()&&!qa()&&choice?.granted===true&&choice.policy===policy&&choice.expires>Date.now()&&!registry.some(x=>x.pending);}
  function update(){
    if(!box)return;
    const pending=registry.some(x=>x.pending);
    allow.disabled=!config||!storageOK||!basic()||qa()||pending;stop.disabled=!choice?.granted&&!pending;
    status.textContent=pending?'Withdrawal is pending. We will retry when this browser is online. New linking is off.':!storageOK?'Optional CRM analytics is off because this browser cannot save the withdrawal controls.':!basic()?'Allow website analytics first if you also want optional enquiry progress analytics.':qa()?'CRM analytics is off for this QA visit.':permitted()?'Enquiry progress analytics is allowed for up to 30 days.':'Enquiry progress analytics is off.';
  }
  async function flush(){
    if(flushing||!registry.some(x=>x.pending))return;clearTimeout(retryTimer);flushing=true;
    const tokens=registry.filter(x=>x.pending).map(x=>x.token),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3000);
    try{
      const r=await fetch('/api/analytics-consent/withdraw',{method:'POST',credentials:'omit',cache:'no-store',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({tokens})});
      if(r.ok&&(await r.json()).ok===true){
        // Merge fresh storage so another tab's withdrawal is not lost.
        const latest=read(registryKey);if(validRegistry(latest))registry=latest;
        registry=registry.filter(x=>!tokens.includes(x.token));save(registryKey,registry);
        retryDelay=5000;
      }
    }catch(_){}finally{
      clearTimeout(timer);flushing=false;update();
      if(registry.some(x=>x.pending)&&navigator.onLine){
        if(retryAfterFlush){retryAfterFlush=false;queueMicrotask(flush);}
        else{retryTimer=setTimeout(flush,retryDelay);retryDelay=Math.min(300000,retryDelay*3);}
      }else retryAfterFlush=false;
    }
  }
  function withdraw(){
    // Another tab may have saved an enquiry since our last observation.
    const latest=read(registryKey);if(validRegistry(latest))registry=latest;
    choice={policy,granted:false,revision:crypto.randomUUID(),expires:Date.now()+maxAge};save(choiceKey,choice);cache.clear();
    registry=registry.map(x=>({...x,pending:true}));save(registryKey,registry);update();void flush();
  }
  function reconcile(){
    load();
    if((choice?.granted&&(!basic()||choice.expires<=Date.now()||qa()))||
       (registry.some(x=>!x.pending)&&(!choice?.granted||choice.expires<=Date.now())))withdraw();
    else {update();void flush();}
  }
  async function context(requestId){
    reconcile();if(!permitted()||typeof gtag!=='function')return null;
    const before=choice.revision;
    const cached=cache.get(requestId);if(cached)return permitted()&&cached.revision===before?cached.value:null;
    if(registry.length>=50)return null;
    const client=await new Promise(resolve=>{
      let done=false;const timer=setTimeout(()=>finish(null),250);
      function finish(value){if(done)return;done=true;clearTimeout(timer);resolve(value);}
      try{window.gtag('get','G-TGK7Z8VNJX','client_id',finish);}catch(_){finish(null);}
    });
    reconcile();if(!permitted()||choice.revision!==before||typeof client!=='string'||!/^\d{1,20}\.\d{1,20}$/.test(client))return null;
    const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
    const expires=Math.floor(Math.min(choice.expires,read('bg_analytics_consent_v1')?.expires||0,Date.now()+maxAge)/1000);
    registry.push({token,expires:expires*1000,pending:false});if(!save(registryKey,registry))return null;
    const value={version:1,analytics:true,offline_analytics:true,policy,client_id:client,expires,qa:false,dnt:false,token};
    cache.set(requestId,{revision:before,value});return value;
  }
  function mount(){
    const panel=document.getElementById('bg-analytics-choice');if(!panel)return;
    box=document.createElement('fieldset');box.id='bg-crm-analytics-choice';
    box.innerHTML='<legend>Optional enquiry progress analytics</legend><p>With separate permission, we link your website analytics to whether our team confirms your enquiry as a suitable project. This does not affect our response. The link expires within 30 days. <a href="/privacy-policy/#crm-analytics">How linking and withdrawal work</a>.</p><p role="status" data-crm-analytics-status></p><div class="bg-consent-actions"><button type="button" data-crm-analytics-allow>Allow enquiry progress analytics</button><button type="button" data-crm-analytics-stop>Stop enquiry progress analytics</button></div>';
    panel.append(box);status=box.querySelector('[data-crm-analytics-status]');allow=box.querySelector('[data-crm-analytics-allow]');stop=box.querySelector('[data-crm-analytics-stop]');
    allow.addEventListener('click',()=>{reconcile();if(allow.disabled)return;choice={policy,granted:true,revision:crypto.randomUUID(),expires:Date.now()+maxAge};save(choiceKey,choice);update();});
    stop.addEventListener('click',withdraw);update();
  }
  load();window.bgQualifiedAnalytics={context};
  // Withdrawal remains available even when new collection has been switched off.
  void flush();
  document.addEventListener('bg-analytics-consent-change',reconcile);
  window.addEventListener('storage',e=>{if([choiceKey,registryKey,'bg_analytics_consent_v1'].includes(e.key))reconcile();});
  window.addEventListener('online',()=>{retryAfterFlush=true;reconcile();});window.addEventListener('pageshow',reconcile);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)reconcile();});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),1500);
  fetch('/api/analytics-consent/config',{credentials:'omit',cache:'no-store',signal:controller.signal}).then(r=>r.ok?r.json():null).then(c=>{
    config=c?.enabled===true&&c.policy===policy;if(config||choice?.granted||registry.length){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();}reconcile();
  }).catch(()=>{if(choice?.granted||registry.length)mount();}).finally(()=>clearTimeout(timer));
  document.getElementById('bg-analytics-settings')?.addEventListener('click',reconcile);
})();

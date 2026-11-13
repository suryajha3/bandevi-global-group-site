'use strict';
(()=>{
if(location.hash.startsWith('#review.'))return;
const label=slot=>window.BandeviDemoTime?BandeviDemoTime.label(slot):new Date(slot.starts*1000).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'})+' IST · '+slot.duration+' minutes';
async function request(url,body){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(url,{credentials:'same-origin',cache:'no-store',signal:controller.signal,...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw Error(data.error||'Please try again.');return data;}finally{clearTimeout(timer);}}
async function downloadCalendar(token){const result=await request('/api/demo/manage',{token,action:'calendar'});if(!result.calendar)throw Error('No calendar event is available.');const url=URL.createObjectURL(new Blob([result.calendar],{type:'text/calendar'}));const a=document.createElement('a');a.href=url;a.download='bandevi-demo.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const form=document.querySelector('form[data-form="demo"]');
if(form){
 const fieldset=form.querySelector('.demo-schedule');if(!fieldset)return;
 const time=window.BandeviDemoTime;
 const campaign=['availability-slot','availability-request'].includes(form.dataset.crmPromotion);
 const params=new URLSearchParams(location.search);
 const sample=!!form.dataset.sampleWorkflow;
 const country=form.elements.projectCountry;
 const fields=form.querySelector('.form-grid');
 const zone=time?.zoneChoice(fields,fieldset,campaign||sample?{initial:time.campaignZone(params.get('market')),compact:sample||campaign}:undefined);
 if(zone){
  const preferredZone=params.get('crm_zone');
  if(campaign&&[...zone.options].some(option=>option.value===preferredZone))zone.value=preferredZone;
  time.preferred(form,zone);
  if(sample||campaign){
   function syncContactZone(){
    const contact=form.elements.contactTimezone;
    if(contact){
     const choices=[...contact.options].map(option=>option.value);
     if(choices.includes(zone.value))contact.value=zone.value;
     else if(campaign&&!contact.value){
      const regional=time.campaignZone(country.value);
      contact.value=choices.includes(regional)?regional:'UTC';
     }
     contact.dispatchEvent(new Event('change',{bubbles:true}));
    }
   }
   zone.addEventListener('change',syncContactZone);
   country?.addEventListener('change',()=>{
    if(!['US','GB','IN'].includes(country.value))return;
    if(sample){
     zone.value=time.campaignZone(country.value);
     zone.dispatchEvent(new Event('change',{bubbles:true}));
    }else syncContactZone();
   });
   syncContactZone();
  }
 }
 const requestedSlot=params.get('crm_slot');
 let pendingSlot=form.dataset.crmPromotion==='availability-slot'&&/^[a-f0-9]{24}$/.test(requestedSlot||'')?requestedSlot:'';
 let slots=[];
 const box=document.createElement('div');box.className='confirmed-slots';const title=document.createElement('label');title.htmlFor='confirmed-slot';title.textContent='Reserve an available demo (optional)';
 const select=document.createElement('select');select.id='confirmed-slot';select.name='slotId';select.innerHTML='<option value="">Ask the team to arrange a time</option>';
 const note=document.createElement('p');note.role='status';note.textContent='Checking available demo times…';const refresh=document.createElement('button');refresh.type='button';refresh.textContent='Refresh available times';
 box.append(title,select,note,refresh);fieldset.before(box);
 const submit=form.querySelector('button[type="submit"]');
 const summary=document.createElement('p');
 if(campaign){
  const options=document.createElement('details');
  options.className='field full';
  const heading=document.createElement('summary');
  heading.textContent='Optional details and booking preferences';
  options.append(heading);
  fields.append(options);
  const essentials=new Set([form.elements.name.closest('.field'),form.elements.email.closest('.field'),fieldset,box,options]);
  for(const field of [...fields.children])if(!essentials.has(field))options.append(field);
  summary.className='field full';
  summary.setAttribute('role','status');
  fields.prepend(summary,box);
  form.elements.message.required=false;
  submit.textContent='Request a time';
  form.addEventListener('invalid',event=>{
   if(options.contains(event.target))options.open=true;
  },true);
 }
 function showSlots(selected){
  select.replaceChildren(new Option('Ask the team to arrange a time',''));
  const sorted=[...slots].sort((first,second)=>first.starts-second.starts);
  const working=campaign&&zone ? sorted.filter(slot=>time.workingHours(slot,zone.value)) : [];
  if(campaign&&zone){
   for(const [heading,group] of [['Local working hours',working],['Other available times',sorted.filter(slot=>!working.includes(slot))]]){
    if(!group.length)continue;
    const list=document.createElement('optgroup');
    list.label=heading;
    list.append(...group.map(slot=>new Option(label(slot),slot.id)));
    select.append(list);
   }
  }else select.append(...sorted.map(slot=>new Option(label(slot),slot.id)));
  if(sorted.some(slot=>slot.id===selected))select.value=selected;
 }
 async function load(takenSlot=''){
  if(refresh.disabled)return;
  refresh.disabled=true;
  try{
   const data=await request('/api/demo/slots');
   slots=data.slots.filter(slot=>slot.id!==takenSlot);
   const selected=takenSlot||select.value||pendingSlot;
   pendingSlot='';
   showSlots(selected);
   select.dispatchEvent(new Event('change'));
   note.textContent=selected&&!select.value
    ?'Your selected time is no longer available. Choose another time or request a preferred time.'
    :slots.length?'Choosing a published slot reserves your appointment when this form is successfully submitted. Joining details follow separately.'
     :'No demo slots are published right now. Send your request and the team will arrange a time.';
  }catch(e){
   pendingSlot='';slots=[];select.replaceChildren(new Option('Ask the team to arrange a time',''));select.dispatchEvent(new Event('change'));
   note.textContent='Available times could not be loaded. You can still request a demo.';
  }finally{
   refresh.disabled=false;
   if(takenSlot)select.focus();
  }
 }
 form.addEventListener('submit',event=>{
  if(!pendingSlot&&!(campaign&&refresh.disabled))return;
  event.preventDefault();event.stopImmediatePropagation();
  note.textContent='Please wait while we check your selected time.';
 },{capture:true});
 function updateSelection(){
  fieldset.hidden=!!select.value;
  for(const input of fieldset.querySelectorAll('input')){input.disabled=!!select.value;if(select.value){input.value='';input.setCustomValidity('');input.required=false;}}
  if(campaign){
   const slot=slots.find(item=>item.id===select.value);
   const workflow=form.elements.demoFocus.selectedOptions[0]?.text;
   summary.textContent=slot?'Selected demo · '+label(slot):'Travel Agency CRM demo';
   if(workflow&&form.elements.demoFocus.value)summary.append(' · '+workflow);
   submit.textContent=slot?'Confirm CRM demo':'Request a time';
  }
 }
 select.addEventListener('change',updateSelection);
 if(campaign){
  form.elements.demoFocus.addEventListener('change',updateSelection);
  form.addEventListener('enquiry-failed',event=>{
   if(event.detail.code==='demo_slot_unavailable'&&select.value)load(select.value);
  });
  form.addEventListener('enquiry-saved',()=>time?.clearSlotJourney());
 }
 form.addEventListener('reset',()=>queueMicrotask(()=>{
  updateSelection();
  if(campaign&&country&&['US','GB','IN'].includes(params.get('market'))){
   country.value=params.get('market');
   country.dispatchEvent(new Event('change',{bubbles:true}));
   form.elements.interest.value='Travel CRM Package';
   form.elements.interest.dispatchEvent(new Event('change',{bubbles:true}));
  }
  load();
 }));
 refresh.addEventListener('click',()=>{
  if(form.dataset.sending!=='true')load();
 });
 if(zone)zone.addEventListener('change',()=>{showSlots(select.value);updateSelection();});
 load();
 form.addEventListener('enquiry-saved',event=>{const a=event.detail.appointment,receipt=form.querySelector('.form-note');if(!a?.confirmed){const day=form.elements.demoDate.value,clock=form.elements.demoTime.value;if(day&&clock){const requested=document.createElement('p');requested.textContent='Requested in your time zone: '+label({starts:Date.parse(day+'T'+clock+':00+05:30')/1000,duration:30}).replace(/ · 30 minutes$/,'')+'. This time is not confirmed.';receipt.append(requested);}return;}const local=document.createElement('p');local.textContent='Confirmed in your time zone: '+label(a)+'. Joining details follow separately.';receipt.append(local);const token=a.manageUrl?.match(/^\/demo-booking\/#([a-f0-9]{64})$/)?.[1];if(!token)return;const button=document.createElement('button');button.type='button';button.textContent='Add confirmed demo to calendar (.ics)';button.addEventListener('click',async()=>{button.disabled=true;try{await downloadCalendar(token);}catch(e){const error=document.createElement('p');error.textContent=e.message;receipt.append(error);}finally{button.disabled=false;}});receipt.append(button);});
}
const panel=document.getElementById('booking-manager');if(!panel)return;
const zone=window.BandeviDemoTime?.zoneChoice(panel);if(zone){document.querySelector('label[for="reschedule-slot"]').textContent='Available times in your time zone';zone.addEventListener('change',()=>refresh().catch(e=>{message.textContent=e.message;}));}
 const token=location.hash.slice(1);let version=0;const message=document.getElementById('booking-status'),select=document.getElementById('reschedule-slot');
const prep=document.getElementById('demo-prep'),prepForm=document.getElementById('demo-prep-form');
const prepStatus=document.getElementById('demo-prep-status');
let prepVersion=null,prepSaving=false;
function renderPrep(brief){
 if(!prepForm)return;
 prep.hidden=!brief;
 if(!brief){prepVersion=null;prepForm.reset();prepStatus.textContent='';return;}
 prepForm.querySelector('button').disabled=prepSaving;
 if(prepVersion===brief.version)return;
 prepVersion=brief.version;
 for(const field of ['goal','tools','teammate'])prepForm.elements[field].value=brief[field];
}
prepForm?.addEventListener('submit',async event=>{
 event.preventDefault();
 if(prepVersion===null||prepSaving)return;
 const button=prepForm.querySelector('button');
 prepSaving=button.disabled=true;
 prepStatus.textContent='Saving your prep brief…';
 const {goal,tools,teammate}=Object.fromEntries(new FormData(prepForm));
 try{
  const result=await request('/api/demo/manage',{token,action:'save-prep',version,prepVersion,goal,tools,teammate});
  renderPrep(result.prepBrief);
  if(result.prepBrief)prepStatus.textContent='Prep brief saved for your demo host.';
 }catch(error){prepStatus.textContent=error.message;}
 finally{prepSaving=false;button.disabled=false;}
});
async function refresh(){const result=await request('/api/demo/manage',{token});version=result.version;renderPrep(result.prepBrief);document.getElementById('download-calendar').disabled=false;const meeting=document.getElementById('meeting-details');meeting.replaceChildren();if(result.state==='confirmed'&&result.meetingUrl){const url=new URL(result.meetingUrl);if(url.protocol==='https:'){const a=document.createElement('a');a.href=url.href;a.textContent='Join your scheduled demo';a.target='_blank';a.rel='noopener noreferrer';meeting.append(a);}}message.textContent=result.state==='confirmed'?'Your demo is confirmed: '+label(result)+'. Reference: '+result.enquiry_id:'This appointment is cancelled. You may reserve another published slot.';document.getElementById('cancel-booking').disabled=result.state!=='confirmed';const slots=await request('/api/demo/slots');select.replaceChildren(new Option('Choose a new demo time',''),...slots.slots.map(s=>new Option(label(s),s.id)));document.getElementById('reschedule-booking').disabled=!slots.slots.length;}
document.getElementById('download-calendar').addEventListener('click',async()=>{try{await downloadCalendar(token);}catch(e){message.textContent=e.message;}});
for(const [id,action]of [['cancel-booking','cancel'],['reschedule-booking','reschedule']])document.getElementById(id).addEventListener('click',async()=>{if(action==='reschedule'&&!select.value){message.textContent='Choose a new demo time first.';return;}if(!confirm(action==='cancel'?'Cancel your appointment?':'Confirm the new appointment time?'))return;const buttons=panel.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);try{await request('/api/demo/manage',{token,action,version,slotId:select.value});await refresh();}catch(e){message.textContent=e.message;buttons.forEach(b=>b.disabled=false);}});
if(!/^[A-Za-z0-9_-]{40,100}$/.test(token)){message.textContent='Open the private appointment link shown after your demo booking.';panel.querySelectorAll('button,select').forEach(b=>b.disabled=true);}else refresh().catch(e=>{message.textContent=e.message;});
})();

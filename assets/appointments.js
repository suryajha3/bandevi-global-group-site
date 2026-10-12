'use strict';
(()=>{
const zones=[['Asia/Kolkata','India'],['Europe/London','United Kingdom'],['America/New_York','US Eastern'],['America/Chicago','US Central'],['America/Denver','US Mountain'],['America/Los_Angeles','US Pacific'],['Asia/Dubai','Dubai / UAE'],['Asia/Singapore','Singapore']];
let buyerZone='Asia/Kolkata';
try{const detected=Intl.DateTimeFormat().resolvedOptions().timeZone;if(zones.some(([id])=>id===detected))buyerZone=detected;}catch{}
const format=(starts,zone)=>new Intl.DateTimeFormat('en-GB',{timeZone:zone,dateStyle:'medium',timeStyle:'short'}).format(new Date(starts*1000));
const label=slot=>format(slot.starts,buyerZone)+' · '+zones.find(([id])=>id===buyerZone)[1]+(buyerZone==='Asia/Kolkata'?' (IST)':' · '+format(slot.starts,'Asia/Kolkata')+' IST')+' · '+slot.duration+' minutes';
async function request(url,body){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(url,{credentials:'same-origin',cache:'no-store',signal:controller.signal,...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw Error(data.error||'Please try again.');return data;}finally{clearTimeout(timer);}}
const form=document.querySelector('form[data-form="demo"]');
const panel=document.getElementById('booking-manager');
let zoneChange=()=>{};
if(form||panel){
 const box=document.createElement('div');box.className='field full consultation-timezone';const title=document.createElement('label');title.htmlFor='buyer-timezone';title.textContent='Your meeting time zone';
 const zone=document.createElement('select');zone.id='buyer-timezone';zone.name='buyerTimezone';zone.setAttribute('aria-describedby','buyer-timezone-help');zone.replaceChildren(...zones.map(([id,name])=>new Option(name+' · '+id,id)));zone.value=buyerZone;
 const help=document.createElement('p');help.id='buyer-timezone-help';help.textContent='Published slots are shown in your selected time zone, with daylight-saving changes applied for the meeting date. India reference times are also shown. Team consultation hours: Monday–Saturday, 10:30 am–7:30 pm IST. Only published slots can be reserved; a preferred time needs team confirmation.';
 box.append(title,zone,help);if(form){form.querySelector('.demo-schedule')?.before(box);}else panel.querySelector('#booking-status').before(box);
 zone.addEventListener('change',()=>{buyerZone=zone.value;zoneChange();});
 if(form)form.addEventListener('reset',()=>queueMicrotask(()=>{zone.value=buyerZone;}));
}
if(form){
 const fieldset=form.querySelector('.demo-schedule');if(!fieldset)return;
 const box=document.createElement('div');box.className='confirmed-slots';const title=document.createElement('label');title.htmlFor='confirmed-slot';title.textContent='Reserve an available demo (optional)';
 const select=document.createElement('select');select.id='confirmed-slot';select.name='slotId';select.innerHTML='<option value="">Ask the team to arrange a time</option>';
 const note=document.createElement('p');note.role='status';note.textContent='Checking available demo times…';const refresh=document.createElement('button');refresh.type='button';refresh.textContent='Refresh available times';
 box.append(title,select,note,refresh);fieldset.before(box);
 async function load(){refresh.disabled=true;try{const data=await request('/api/demo/slots');const old=select.value;select.replaceChildren(new Option('Ask the team to arrange a time',''),...data.slots.map(s=>new Option(label(s),s.id)));if(data.slots.some(s=>s.id===old))select.value=old;select.dispatchEvent(new Event('change'));note.textContent=data.slots.length?'Choosing a published slot reserves your appointment when this form is successfully submitted. Joining details follow separately.':'No demo slots are published right now. Send your request and the team will arrange a time.';}catch(e){note.textContent='Available times could not be loaded. You can still request a demo.';}finally{refresh.disabled=false;}}
 zoneChange=load;
 select.addEventListener('change',()=>{fieldset.hidden=!!select.value;for(const input of fieldset.querySelectorAll('input')){input.disabled=!!select.value;if(select.value){input.value='';input.setCustomValidity('');}}});form.addEventListener('reset',()=>queueMicrotask(()=>{select.dispatchEvent(new Event('change'));load();}));refresh.addEventListener('click',load);load();
}
if(!panel)return;
const token=location.hash.slice(1);let version=0;const message=document.getElementById('booking-status'),select=document.getElementById('reschedule-slot');
async function refresh(){const result=await request('/api/demo/manage',{token});version=result.version;const meeting=document.getElementById('meeting-details');meeting.replaceChildren();if(result.state==='confirmed'&&result.meetingUrl){const url=new URL(result.meetingUrl);if(url.protocol==='https:'){const a=document.createElement('a');a.href=url.href;a.textContent='Join your scheduled demo';a.target='_blank';a.rel='noopener noreferrer';meeting.append(a);}}message.textContent=result.state==='confirmed'?'Your demo is confirmed: '+label(result)+'. Reference: '+result.enquiry_id:'This appointment is cancelled. You may reserve another published slot.';document.getElementById('cancel-booking').disabled=result.state!=='confirmed';const slots=await request('/api/demo/slots');select.replaceChildren(new Option('Choose a new demo time',''),...slots.slots.map(s=>new Option(label(s),s.id)));document.getElementById('reschedule-booking').disabled=!slots.slots.length;}
document.getElementById('download-calendar').addEventListener('click',async()=>{try{const result=await request('/api/demo/manage',{token,action:'calendar'});if(!result.calendar)throw Error('No calendar event is available.');const url=URL.createObjectURL(new Blob([result.calendar],{type:'text/calendar'}));const a=document.createElement('a');a.href=url;a.download='bandevi-demo.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){message.textContent=e.message;}});
for(const [id,action]of [['cancel-booking','cancel'],['reschedule-booking','reschedule']])document.getElementById(id).addEventListener('click',async()=>{if(action==='reschedule'&&!select.value){message.textContent='Choose a new demo time first.';return;}if(!confirm(action==='cancel'?'Cancel your appointment?':'Confirm the new appointment time?'))return;const buttons=panel.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);try{await request('/api/demo/manage',{token,action,version,slotId:select.value});await refresh();}catch(e){message.textContent=e.message;buttons.forEach(b=>b.disabled=false);}});
zoneChange=()=>refresh().catch(e=>{message.textContent=e.message;});
if(!/^[a-f0-9]{64}$/.test(token)){message.textContent='Open the private appointment link shown after your demo booking.';panel.querySelectorAll('button,select').forEach(b=>b.disabled=true);}else refresh().catch(e=>{message.textContent=e.message;});
})();

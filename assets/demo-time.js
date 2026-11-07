/* Display local times; the booking API continues to use UTC slots and IST requests. */
(() => {
 'use strict';
 const india='Asia/Kolkata';
 function wall(epoch,zone){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(epoch)).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));return {date:p.year+'-'+p.month+'-'+p.day,time:p.hour+':'+p.minute};}
 function instants(day,clock,zone){const target=Date.parse(day+'T'+clock+':00Z');if(!Number.isFinite(target))return [];const offsets=new Set();for(let h=-48;h<=48;h+=6){const t=target+h*3600000,p=wall(t,zone);offsets.add(Date.parse(p.date+'T'+p.time+':00Z')-t);}return [...offsets].map(offset=>target-offset).filter(t=>{const p=wall(t,zone);return p.date===day&&p.time===clock;});}
 function node(tag,value){const e=document.createElement(tag);if(value)e.textContent=value;return e;}
 const usZones = ['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix','America/Anchorage','Pacific/Honolulu'];
 function browserZone(){return Intl.DateTimeFormat().resolvedOptions().timeZone || india;}
 function campaignZone(market){
  if(market==='GB')return 'Europe/London';
  if(market==='IN')return india;
  const detected=browserZone();
  const regionalUS=/^(America\/(Adak|Boise|Detroit|Indiana\/.+|Indianapolis|Juneau|Kentucky\/.+|Louisville|Menominee|Metlakatla|Nome|North_Dakota\/.+|Sitka|Yakutat)|US\/.+)$/;
  return usZones.includes(detected)||regionalUS.test(detected)?detected:usZones[0];
 }
 function zoneChoice(container,before,{id='demo-timezone',initial=browserZone(),compact=false}={}){
  const box=node('div');box.className='demo-zone';
  const label=node('label','Your time zone'),select=node('select');select.id=id;label.htmlFor=id;
  for(const zone of new Set([initial,browserZone(),india,'Europe/London',...usZones,'Europe/Paris','Asia/Dubai','Asia/Singapore','Australia/Sydney','UTC'])){
   select.add(new Option(zone.replaceAll('_',' '),zone));
  }
  select.value=initial;box.append(label,select);
  if(!compact)box.append(node('p','Available times use this time zone, with daylight-saving changes applied for the meeting date. India reference times are also shown. Team consultation hours: Monday–Saturday, 10:30 am–7:30 pm IST. Only a successful slot reservation confirms a meeting.'));
  container.insertBefore(box,before||container.firstChild);return select;
 }
 function label(slot,zone=document.getElementById('demo-timezone')?.value||india,compact=false){
  const date = new Date(slot.starts*1000);
  const local = new Intl.DateTimeFormat(undefined,{timeZone:zone,dateStyle:'medium',timeStyle:'short'}).format(date);
  const duration = ' · '+slot.duration+' minutes';
  if(compact)return local+duration;
  const reference = zone===india?' (IST)':' · '+new Intl.DateTimeFormat('en-GB',{timeZone:india,dateStyle:'medium',timeStyle:'short'}).format(date)+' IST';
  return local+' · '+zone.replaceAll('_',' ')+reference+duration;
 }
 function preferred(form,zone){
  const fieldset=form.querySelector('.demo-schedule'),day=form.elements.demoDate,clock=form.elements.demoTime;if(!fieldset||!day||!clock)return;
  const box=node('div');box.className='form-grid';const localDay=node('input'),localTime=node('input');localDay.type='date';localDay.id='demo-local-date';localTime.type='time';localTime.id='demo-local-time';localTime.step='900';
  for(const [input,text]of [[localDay,'Preferred date in your time zone'],[localTime,'Preferred time in your time zone']]){const field=node('div');field.className='field';const l=node('label',text);l.htmlFor=input.id;input.setAttribute('aria-describedby','demo-time-help');field.append(l,input);box.append(field);}
  day.closest('.form-grid').hidden=true;day.type=clock.type='hidden';fieldset.append(box);form.querySelector('#demo-time-help').textContent='A preferred time is a request. Leave both blank to arrange a time with the team. We convert your choice to India time for the team.';let instant=null;
  function sync(){localDay.min=wall(Date.now(),zone.value).date;localDay.max=wall(Date.now()+180*86400000,zone.value).date;localDay.required=!localDay.disabled&&!!localTime.value;localTime.required=!localTime.disabled&&!!localDay.value;localTime.setCustomValidity('');instant=null;day.value=clock.value='';if(!localDay.disabled&&localDay.value&&localTime.value){const matches=instants(localDay.value,localTime.value,zone.value);if(matches.length!==1)localTime.setCustomValidity(matches.length?'This time occurs twice when the clocks change. Choose another time or use UTC.':'This local time does not exist when the clocks change. Choose another time.');else if(matches[0]<=Date.now()||matches[0]>Date.now()+180*86400000)localTime.setCustomValidity('Choose a future time within 180 days.');else{instant=matches[0];const p=wall(instant,india);day.value=p.date;clock.value=p.time;}}clock.dispatchEvent(new Event('input'));}
  for(const input of [localDay,localTime])input.addEventListener('input',sync);
  zone.addEventListener('change',()=>{if(instant!==null){const p=wall(instant,zone.value);localDay.value=p.date;localTime.value=p.time;}sync();});form.addEventListener('submit',sync,{capture:true});form.addEventListener('reset',()=>queueMicrotask(()=>{localDay.value=localTime.value='';sync();}));sync();
 }
 window.BandeviDemoTime={campaignZone,zoneChoice,label,preferred};
})();

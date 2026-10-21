'use strict';
let contactGeneration=0,contactOffset=0,coverageGeneration=0;
function setResponseCoverageAccess(role){$('coverage-section').hidden=!['admin','manager'].includes(role);}
function clearResponseCoverage(){contactGeneration++;coverageGeneration++;contactOffset=0;for(const id of ['contact-counts','contact-markets','contact-entries','contact-status','contact-page','contact-basis','coverage-rows','coverage-status','coverage-basis'])$(id).replaceChildren();for(const [id,value] of [['contact-country',''],['contact-days','30'],['contact-hours','24'],['contact-bucket','waiting'],['coverage-country',''],['coverage-horizon','14']])$(id).value=value;$('contact-previous').disabled=true;$('contact-next').disabled=true;setResponseCoverageAccess('agent');}
function contactDuration(seconds){if(seconds===null)return 'Not recorded';if(seconds<60)return seconds+'s';if(seconds<3600)return Math.round(seconds/60)+'m';return (seconds/3600).toFixed(1)+'h';}
function contactTable(rows){
 const table=text('table'),head=text('thead'),tr=text('tr');for(const title of ['Business country','Received','Contact logged','Active waiting','Over target','Unassigned','Median response'])tr.append(text('th',title));head.append(tr);table.append(head);const body=text('tbody');
 for(const row of rows){const line=text('tr');for(const value of [row.label,row.enquiries,row.contactRecorded,row.activeWaiting,row.overTarget,row.activeUnassigned,contactDuration(row.medianSeconds)])line.append(text('td',String(value)));body.append(line);}table.append(body);return table;
}
async function contactOpen(item,target,generation,identity){
 try{const r=await api('/api/admin/enquiries?'+new URLSearchParams({q:item.reference}));if(csrf!==identity||contactGeneration!==generation)return;const entry=r.items.find(e=>e.reference===item.reference);if(!entry)throw Error('This enquiry is no longer accessible. Refresh the report.');edit(entry,target);}
 catch(error){if(csrf===identity&&contactGeneration===generation)$('contact-status').textContent=error.message;}
}
async function refreshContactTimes(){
 if(!csrf)return;const identity=csrf,generation=++contactGeneration;
 for(const id of ['contact-counts','contact-markets','contact-entries','contact-page'])$(id).replaceChildren();$('contact-status').textContent='Loading recorded response times…';$('contact-previous').disabled=true;$('contact-next').disabled=true;
 try{const r=await api('/api/admin/response-times?'+new URLSearchParams({country:$('contact-country').value,days:$('contact-days').value,hours:$('contact-hours').value,bucket:$('contact-bucket').value,offset:String(contactOffset)}));if(csrf!==identity||contactGeneration!==generation)return;
  const s=r.summary;for(const [label,value] of [['Enquiries received',s.enquiries],['Contact recorded',s.contactRecorded],['Active without contact logged',s.activeWaiting],['Waiting over '+r.hours+'h',s.overTarget],['Active unassigned',s.activeUnassigned],['Median recorded response',contactDuration(s.medianSeconds)]]){const box=text('div','','count');box.append(text('span',label),text('strong',String(value)));$('contact-counts').append(box);}
  $('contact-markets').append(contactTable(r.markets));
  for(const item of r.items){const card=text('article','','entry');card.dataset.contactReference=item.reference;const body=text('div');body.append(text('h3',item.name),text('p',item.reference+' · '+item.countryLabel+' · '+item.stage),text('p','Owner: '+(item.owner||'Unassigned')),text('p','Received: '+date(item.created)+' · Elapsed: '+contactDuration(item.ageSeconds)),text('p','Next action: '+(item.nextAction||'Not recorded')+' · Follow-up: '+(item.followUpDate||'Not scheduled')));
   if(item.firstContact!==null)body.append(text('p','First recorded contact: '+date(item.firstContact)+' · '+contactDuration(item.responseSeconds)+' after receipt.'));
   else body.append(text('p',item.stageOnly?'Stage progressed; customer contact has not been logged. Review the actual contact history.':'No connected call or sent email has been logged.','growth-queue-alert'));
   if(item.overTarget)body.append(text('p','No contact logged after the '+r.hours+'-hour review target.','growth-queue-alert'));
   const actions=text('div','','growth-card-actions');for(const [label,target] of [['Open enquiry',''],['Log actual contact','activity-kind'],...(['admin','manager'].includes(viewerRole)?[['Assign / follow-up','owner']]:[])]){const button=text('button',label);button.type='button';button.addEventListener('click',()=>contactOpen(item,target,generation,identity));actions.append(button);}body.append(actions);card.append(body);$('contact-entries').append(card);
  }
  if(!r.items.length)$('contact-entries').append(text('p',r.total?'No entries on this page. Go to the previous page.':'No active enquiries match these filters.','empty'));
  $('contact-basis').textContent=r.basis;$('contact-page').textContent=r.total?Math.min(contactOffset+1,r.total)+'–'+Math.min(contactOffset+25,r.total)+' of '+r.total:'0 enquiries';$('contact-previous').disabled=contactOffset===0;$('contact-next').disabled=contactOffset+25>=r.total;
  $('contact-status').textContent='Snapshot: '+date(r.capturedAt)+'. '+s.withinTarget+' of '+s.contactRecorded+' contacted enquiries recorded within '+r.hours+'h; average '+contactDuration(s.averageSeconds)+'. '+s.stageOnly+' enquiries have stage-only progress. '+(viewerRole==='agent'?'Only your currently assigned enquiries are shown.':'');
 }catch(error){if(csrf===identity&&contactGeneration===generation)$('contact-status').textContent=error.message;}
}
async function refreshDemoCoverage(){
 if(!csrf||!['admin','manager'].includes(viewerRole))return;const identity=csrf,generation=++coverageGeneration;$('coverage-rows').replaceChildren();$('coverage-status').textContent='Loading published-slot coverage…';
 try{const r=await api('/api/admin/demo-coverage?'+new URLSearchParams({country:$('coverage-country').value,horizon:$('coverage-horizon').value}));if(csrf!==identity||coverageGeneration!==generation)return;
  for(const row of r.rows){const card=text('article','','coverage-card');card.dataset.coverageZone=row.timezone;card.append(text('h3',row.label),text('p',row.timezone+' · 09:00–17:00 weekdays'),text('p',row.fromDate+' through '+row.throughDate),text('strong',row.coveredDays+' / '+row.weekdays+' remaining weekday windows have a slot'),text('p',row.slots+' published free slot'+(row.slots===1?' fits':'s fit')+' this window.'));
   if(row.nextStart!==null){const local=new Intl.DateTimeFormat('en-GB',{timeZone:row.timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(row.nextStart*1000));card.append(text('p','Next: '+local+' · '+row.timezone));}else card.append(text('p','No published free slot fits this local window.','growth-queue-alert'));
   const details=text('details'),summary=text('summary','Review local dates and gaps');details.append(summary);const list=text('ul');for(const day of row.days)list.append(text('li',day.date+' · '+(day.elapsed?'Local window has ended':day.slots?day.slots+' available slot'+(day.slots===1?'':'s'):'No slot published / free')));details.append(list);card.append(details);$('coverage-rows').append(card);
  }
  $('coverage-basis').textContent=r.basis;$('coverage-status').textContent='Snapshot: '+date(r.capturedAt)+'. '+r.publicSlotsConsidered+' public slots considered.'+(r.publicLimitReached?' The public list limit of 100 was reached; this report follows that same list.':'')+' Coverage can change when customers reserve a slot.';
 }catch(error){if(csrf===identity&&coverageGeneration===generation)$('coverage-status').textContent=error.message;}
}
function refreshResponseCoverage(){refreshContactTimes();refreshDemoCoverage();}
for(const id of ['contact-country','contact-days','contact-hours','contact-bucket'])$(id).addEventListener('change',()=>{contactOffset=0;refreshContactTimes();});
$('contact-refresh').addEventListener('click',refreshContactTimes);$('contact-previous').addEventListener('click',()=>{contactOffset=Math.max(0,contactOffset-25);refreshContactTimes();});$('contact-next').addEventListener('click',()=>{contactOffset+=25;refreshContactTimes();});
for(const id of ['coverage-country','coverage-horizon'])$(id).addEventListener('change',refreshDemoCoverage);$('coverage-refresh').addEventListener('click',refreshDemoCoverage);
$('coverage-manage').addEventListener('click',()=>{setView('demos',true);if(typeof loadOperations==='function')loadOperations();});
$('editor').addEventListener('close',()=>{if(view==='response'&&csrf)refreshContactTimes();});

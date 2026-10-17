'use strict';
let teamRole='agent',teamUser='',demoSlots=[];
async function refreshOperations(){
  const requestIdentity=csrf;
  try{
    const identity=await api('/api/admin/session');if(!identity.authenticated||!csrf||csrf!==requestIdentity)return;
    teamRole=identity.role;teamUser=identity.user;
    $('team-tools').hidden=teamRole!=='admin';$('slot-tools').hidden=teamRole==='agent';$('operations-tools').hidden=teamRole==='agent';
    $('owner').readOnly=teamRole==='agent';
    const conversion=await api('/api/admin/conversion?days='+$('report-days').value);
    if(csrf!==requestIdentity)return;
    const table=document.createElement('table'),caption=text('caption','Recorded milestones and current outcomes by source');table.append(caption);
    const tr=document.createElement('tr');for(const title of ['Source','Enquiries','Reached Qualified','Reached Proposal','Currently Won','Currently Lost','Won / enquiries'])tr.append(text('th',title));table.append(tr);
    for(const [channel,c]of Object.entries(conversion.channels)){const row=document.createElement('tr');for(const value of [channelLabels[channel]||channel,c.enquiries,c.qualified,c.proposal,c.won,c.lost,c.enquiries?(100*c.won/c.enquiries).toFixed(1)+'%':'—'])row.append(text('td',String(value)));table.append(row);}
    $('conversion-table').replaceChildren(table);$('won-value').textContent=Object.entries(conversion.wonValueMinorUnits).map(([currency,value])=>new Intl.NumberFormat(undefined,{style:'currency',currency}).format(value/100)).join(' · ')||'No won deal values recorded.';
    await refreshSalesFunnel(requestIdentity);await refreshJourneyReport(requestIdentity);
    if(typeof refreshGrowthCosts==='function')await refreshGrowthCosts();
    if(teamRole==='agent')return;
    const [users,status,slots]=await Promise.all([api('/api/admin/team'),api('/api/admin/operations'),api('/api/admin/slots')]);if(csrf!==requestIdentity)return;demoSlots=slots.slots;
    $('team-owner-list').replaceChildren(...users.users.filter(u=>u.active).map(u=>{const o=document.createElement('option');o.value=u.email;o.label=u.name;return o;}));
    $('slot-host').replaceChildren(...users.users.filter(u=>u.active).map(u=>{const o=text('option',u.name+' · '+u.email);o.value=u.email;return o;}));
    $('team-list').replaceChildren(...users.users.map(u=>{const row=text('p',u.name+' · '+u.email+' · '+u.role+(u.active?'':' · disabled'));if(u.email!=='sales@bandeviglobalgroup.com'&&teamRole==='admin'){const edit=text('button','Edit access');edit.type='button';edit.addEventListener('click',()=>{$('staff-email').value=u.email;$('staff-name').value=u.name;$('staff-role').value=u.role;$('staff-active').checked=!!u.active;$('staff-password').value='';$('staff-email').focus();});row.append(' ',edit);}return row;}));
    $('operations-status').textContent=(status.smtpConfigured?'Email sender configured. ':'Email sender needs setup. ')+status.pendingNotifications+' notifications pending. '+(status.backup?'Last verified backup: '+date(status.backup.created)+'. ':'No verified backup recorded. ')+status.alerts.join(' ');
    $('slot-list').replaceChildren(...demoSlots.map(s=>{const row=text('div','','slot-row');row.append(text('p',new Date(s.starts*1000).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST · '+s.duration+' minutes · '+s.host+' · '+(s.state==='confirmed'?'Reserved '+s.enquiry_id:s.active?'Available':'Closed')));if(s.active){const button=text('button',s.state==='confirmed'?'Cancel appointment':'Close slot');button.type='button';button.addEventListener('click',async()=>{if(!confirm(s.state==='confirmed'?'Cancel this confirmed appointment? The customer update will be queued.':'Close this available slot?'))return;button.disabled=true;try{await post(s.state==='confirmed'?'/api/admin/appointment':'/api/admin/slots',s.state==='confirmed'?{action:'cancel',reference:s.enquiry_id,version:s.version}:{action:'close',id:s.id});await refreshOperations();}catch(e){$('slot-message').textContent=e.message;button.disabled=false;}});row.append(button);}return row;}));
  }catch(e){$('operations-message').textContent=e.message;}
}
$('staff-form').addEventListener('submit',async e=>{e.preventDefault();const button=e.submitter;button.disabled=true;try{await post('/api/admin/team',{email:$('staff-email').value,name:$('staff-name').value,role:$('staff-role').value,active:$('staff-active').checked,password:$('staff-password').value});$('staff-password').value='';$('staff-message').textContent='Staff access saved. Existing sessions for this account were signed out.';await refreshOperations();}catch(error){$('staff-message').textContent=error.message;}finally{button.disabled=false;}});
$('slot-form').addEventListener('submit',async e=>{e.preventDefault();const button=e.submitter;button.disabled=true;try{const starts=Date.parse($('slot-date').value+':00+05:30')/1000;if(!Number.isFinite(starts))throw Error('Choose a date and time in India time.');await post('/api/admin/slots',{starts,duration:Number($('slot-duration').value),host:$('slot-host').value});$('slot-message').textContent='Demo slot published.';await refreshOperations();}catch(error){$('slot-message').textContent=error.message;}finally{button.disabled=false;}});
async function refreshJourneyReport(identity){
  $('journey-message').textContent='Loading enquiry journey report…';
  try{
    const r=await api('/api/admin/journey-report?days='+$('report-days').value);if(!csrf||csrf!==identity)return;
    const duration=n=>n===null?'Not recorded':n<3600?Math.round(n/60)+' min':(n/3600).toFixed(1)+' hours';
    const c=r.response;
    $('response-counts').replaceChildren(...[['Saved enquiries',c.enquiries],['Recorded first contact',c.recordedContact],['No recorded contact',c.noRecordedContact],['Contact within 24 hours',c.within24Hours],['Median time to contact',duration(c.medianSeconds)],['Oldest without recorded contact',duration(c.oldestUncontactedSeconds)]].map(([label,value])=>{const card=text('div',label,'count');card.append(text('strong',String(value)));return card;}));
    $('response-action-counts').replaceChildren(...[['Active unassigned',c.activeUnassigned],['Active without recorded contact',c.activeWaiting],['Waiting at least 24 hours',c.waitingOver24Hours]].map(([label,value])=>{const card=text('div',label,'count');card.append(text('strong',String(value)));return card;}));
    const queue=document.createElement('table'),header=document.createElement('tr');for(const title of ['Enquiry','Stage','Owner','Waiting','Review'])header.append(text('th',title));queue.append(header);
    for(const lead of r.waiting||[]){const row=document.createElement('tr');for(const value of [lead.reference,lead.stage,lead.owner||'Unassigned',lead.noRecordedContact?duration(lead.ageSeconds)+' · no recorded contact':'Contact recorded'])row.append(text('td',value));const cell=document.createElement('td'),button=text('button','Review enquiry');button.type='button';button.addEventListener('click',()=>{chooseFilter('stage','');$('search').value=lead.reference;offset=0;load();});cell.append(button);row.append(cell);queue.append(row);}
    $('response-queue').replaceChildren(r.waiting?.length?queue:text('p','No active enquiries awaiting action in this cohort.'));
    $('response-basis').textContent=r.basis;$('website-journeys').hidden=!r.websiteVisible;
    if(r.websiteVisible){
      const table=document.createElement('table');table.append(text('caption','Measured form journeys by starting page, form and source'));const header=document.createElement('tr');for(const label of ['Page','Form','Source','Started','Saved','No measured save yet','Validation issue','Submission failed','Saved / started'])header.append(text('th',label));table.append(header);
      for(const row of r.pages){const tr=document.createElement('tr');for(const value of [row.page,row.form,channelLabels[row.channel]||row.channel,row.started,row.saved,row.notSaved,row.validation,row.failed,row.started?(100*row.saved/row.started).toFixed(1)+'%':'—'])tr.append(text('td',String(value)));table.append(tr);}
      $('journey-pages').replaceChildren(r.pages.length?table:text('p','No measured form starts in this period yet.'));
      const labels={phone_click:'Call clicks',email_click:'Email clicks',whatsapp_click:'WhatsApp clicks',demo_click:'Demo button clicks'};
      $('journey-clicks').replaceChildren(...Object.entries(r.clicks).map(([key,value])=>{const card=text('div',labels[key]||key,'count');card.append(text('strong',String(value)));return card;}));
      $('journey-errors').replaceChildren(...(r.errors.length?r.errors.map(x=>text('p',(x.event==='invalid'?'Validation':'Submission')+' · '+x.reason+': '+x.count)):[text('p','No measured issues in this period.')]));
    }else for(const id of ['journey-pages','journey-clicks','journey-errors'])$(id).replaceChildren();
    $('journey-message').textContent='';
  }catch(error){if(csrf&&csrf===identity){$('journey-message').textContent='Journey report unavailable. Refresh to try again.';for(const id of ['response-counts','response-basis','response-action-counts','response-queue','journey-pages','journey-clicks','journey-errors'])$(id).replaceChildren();$('website-journeys').hidden=true;}}
}

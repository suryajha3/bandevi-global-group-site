'use strict';
let kickoffGeneration=0,kickoffOffset=0;
let demoAttentionGeneration=0;

function clearDemoAttention(){
  demoAttentionGeneration++;
  $('demo-attention-items').replaceChildren();
  $('demo-attention-status').textContent='';
}

async function refreshDemoAttention(){
  if(!csrf)return;
  const identity=csrf,generation=++demoAttentionGeneration;
  const status=$('demo-attention-status');
  status.textContent='Checking upcoming demos…';
  try{
    const result=await api('/api/admin/demo-attention');
    if(csrf!==identity||generation!==demoAttentionGeneration)return;
    const markets={US:'United States',GB:'United Kingdom',IN:'India'};
    $('demo-attention-items').replaceChildren(...result.items.map(item=>{
      const card=text('article','','entry'),details=text('div','');
      details.append(text('h3',item.reference),text('p',(markets[item.market]||'Other market')+' · '+date(item.starts)),
        text('p','Host: '+item.host),
        text('p',[item.missingLink?'Joining link needed':'',item.awaitingRsvp?'Awaiting RSVP':''].filter(Boolean).join(' · '),'attention-reasons'));
      if(item.missingLink){
        const form=document.createElement('form'),url=document.createElement('input');
        kickoffField(form,'Demo joining link',url);url.type='url';url.required=true;url.maxLength=500;
        const save=text('button','Save and send joining link'),feedback=text('p','');
        save.type='submit';feedback.role='status';form.append(save,feedback);
        form.addEventListener('submit',async event=>{
          event.preventDefault();
          if(csrf!==identity||generation!==demoAttentionGeneration)return;
          save.disabled=true;
          try{
            await post('/api/admin/workspace/meeting',{reference:item.reference,version:item.version,url:url.value});
            if(csrf===identity&&generation===demoAttentionGeneration)await refreshDemoAttention();
          }catch(error){
            if(csrf===identity&&generation===demoAttentionGeneration){feedback.textContent=error.message;save.disabled=false;}
          }
        });
        details.append(form);
      }
      card.append(details);return card;
    }));
    status.textContent=result.items.length?'':'No demos need attention in the next 24 hours.';
  }catch(error){if(csrf===identity&&generation===demoAttentionGeneration)status.textContent=error.message;}
}

function clearKickoffQueue(){
  kickoffGeneration++;kickoffOffset=0;
  $('kickoff-items').replaceChildren();$('kickoff-message').textContent='';$('kickoff-page').textContent='';
  $('kickoff-country').value='';$('kickoff-previous').disabled=$('kickoff-next').disabled=true;
  $('kickoff-status').value='all';$('kickoff-needs-booking').textContent='';
  $('kickoff-missing-links').textContent='';
  $('kickoff-availability').replaceChildren();
}

function kickoffField(form,label,input){
  const field=text('label',label);field.append(input);form.append(field);return input;
}

function renderKickoffCard(item, result, identity, generation){
  const card=text('article','','entry');card.dataset.kickoffReference=item.reference;
  const details=text('div','');
  details.append(text('h3',item.title),text('p',item.reference+' · '+item.countryLabel+' · Accepted revision '+item.revision+' · '+item.currency),
    text('p','Delivery owner: '+(item.owner||'Unassigned')),
    text('p','Project contact: '+(item.contact||'Awaiting client')+' · Materials: '+(item.materials_ready?'Shared by client':'Awaiting client')),
    text('p',item.confirmed?'Kickoff booked · '+postDemoTime(item.scheduled):
      'Needs kickoff booking · Follow-up owner '+item.followUpOwner,'recovery-reasons'));
  if(item.scheduled&&!item.confirmed)details.append(text('p','Proposed time awaiting confirmation · '+postDemoTime(item.scheduled)));
  if(item.missingLink){
    const urgency=item.missingLinkHours===1?' · Starts within 1 hour':item.missingLinkHours===24?' · Starts within 24 hours':'';
    details.append(text('p','Missing joining link'+urgency+' · Follow-up owner '+item.followUpOwner,
      urgency?'growth-queue-alert':'recovery-reasons'));
  }
  const form=document.createElement('form');
  let owner;
  if(result.canAssign){
    owner=kickoffField(form,'Delivery owner',document.createElement('select'));
    owner.add(new Option('Unassigned',''));
    for(const person of result.owners)owner.add(new Option(person.name+' · '+person.email,person.email));
    owner.value=item.owner;
  }
  const materials=kickoffField(form,'Materials to request',document.createElement('textarea'));
  materials.maxLength=1500;materials.value=item.materials;
  const dateInput=kickoffField(form,item.booking_zone?'Booked kickoff time (IST)':'Proposed kickoff time (IST)',document.createElement('input'));
  dateInput.type='datetime-local';
  if(item.scheduled)dateInput.value=new Date(item.scheduled*1000+330*60000).toISOString().slice(0,16);
  const save=text('button','Save kickoff plan');save.type='submit';
  const start=text('button','Record kickoff started');start.type='button';
  const canStart=!!(item.owner&&item.contact&&item.materials_ready&&item.confirmed&&item.scheduled<=Date.now()/1000);
  start.disabled=!canStart;
  const status=text('p','');status.role='status';
  async function update(action, data, feedback=status){
    if(csrf!==identity||generation!==kickoffGeneration)return;
    save.disabled=start.disabled=true;
    try{
      await post('/api/admin/workspace/kickoff',{reference:item.reference,version:item.version,action,...data});
      if(csrf===identity&&generation===kickoffGeneration)await refreshKickoffQueue(
        action==='start'?'Kickoff recorded.':action==='meeting'?'Joining link updated.':'Kickoff plan saved.');
    }catch(error){if(csrf===identity&&generation===kickoffGeneration){feedback.textContent=error.message;save.disabled=false;start.disabled=!canStart;}}
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();if(save.disabled)return;
    const scheduled=dateInput.value?Date.parse(dateInput.value+':00+05:30')/1000:0;
    if(!Number.isFinite(scheduled)){status.textContent='Choose a valid kickoff time in IST.';return;}
    if(item.booking_zone&&(scheduled!==item.scheduled||owner&&owner.value!==item.owner)&&
       !confirm('Release the client’s booking and update the kickoff plan?'))return;
    update('plan',{materials:materials.value,scheduled,...(owner?{owner:owner.value}:{})});
  });
  start.addEventListener('click',()=>{if(confirm('Record that kickoff has started for '+item.reference+'?'))update('start',{});});
  form.append(save,start,status);details.append(form);
  if(item.confirmed&&item.scheduled>Date.now()/1000){
    const meeting=document.createElement('form');
    const link=kickoffField(meeting,'Kickoff joining link',document.createElement('input'));
    link.type='url';link.maxLength=500;link.value=item.meeting;
    const saveLink=text('button','Save joining link');saveLink.type='submit';
    const linkStatus=text('p','');linkStatus.role='status';
    meeting.addEventListener('submit',async event=>{
      event.preventDefault();
      if(save.disabled||saveLink.disabled)return;
      saveLink.disabled=true;
      try{await update('meeting',{url:link.value},linkStatus);}finally{saveLink.disabled=false;}
    });
    meeting.append(saveLink,linkStatus);details.append(meeting);
  }
  card.append(details);return card;
}

function renderKickoffAvailability(result, identity, generation){
  const container=$('kickoff-availability');
  container.replaceChildren();
  if(!result.canAssign)return;
  const panel=document.createElement('details');
  panel.append(text('summary','Manage kickoff availability'),
    text('p','Publish 30-minute times for delivery owners in India time (IST). Clients see times for their assigned owner in their chosen time zone.'));
  const form=document.createElement('form'),status=text('p','');status.role='status';
  const host=kickoffField(form,'Slot host',document.createElement('select'));
  for(const person of result.owners)host.add(new Option(person.name+' · '+person.email,person.email));
  const start=kickoffField(form,'Slot start (IST)',document.createElement('input'));
  start.type='datetime-local';start.step='900';start.required=true;
  const publish=text('button','Publish kickoff slot');publish.type='submit';
  async function changeSlot(data,control){
    if(csrf!==identity||generation!==kickoffGeneration||control.disabled)return;
    control.disabled=true;
    try{
      await post('/api/admin/workspace/kickoff-slots',data);
      if(csrf===identity&&generation===kickoffGeneration)await refreshKickoffQueue(
        data.action==='close'?'Kickoff slot closed.':'Kickoff slot published.',true);
    }catch(error){if(csrf===identity&&generation===kickoffGeneration)status.textContent=error.message;}
    finally{control.disabled=false;}
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    changeSlot({action:'publish',host:host.value,starts:Date.parse(start.value+':00+05:30')/1000},publish);
  });
  form.append(publish,status);panel.append(form);
  const list=document.createElement('ul');
  for(const slot of result.slots){
    const row=text('li',postDemoTime(slot.starts)+' · '+slot.host+(slot.booked?' · Booked':' · Open'));
    if(!slot.booked){
      const close=text('button','Close slot');close.type='button';
      close.setAttribute('aria-label','Close slot '+postDemoTime(slot.starts)+' for '+slot.host);
      close.addEventListener('click',()=>changeSlot({action:'close',slotId:slot.id},close));
      row.append(' ',close);
    }
    list.append(row);
  }
  panel.append(result.slots.length?list:text('p','No upcoming kickoff slots.'));
  container.append(panel);
}

async function refreshKickoffQueue(message='',openAvailability=false){
  if(!csrf)return;
  const identity=csrf,generation=++kickoffGeneration;
  const items=$('kickoff-items');items.replaceChildren();
  $('kickoff-message').textContent='Loading delivery kickoffs…';
  try{
    const result=await api('/api/admin/workspace/kickoff-queue?'+new URLSearchParams({
      country:$('kickoff-country').value,status:$('kickoff-status').value,offset:String(kickoffOffset)}));
    if(csrf!==identity||generation!==kickoffGeneration)return;
    if(kickoffOffset&&!result.items.length){kickoffOffset=Math.max(0,kickoffOffset-result.limit);return refreshKickoffQueue(message);}
    items.replaceChildren(...result.items.map(item=>renderKickoffCard(item,result,identity,generation)));
    $('kickoff-needs-booking').textContent=result.needsBooking+' accepted '+(result.needsBooking===1?'project needs':'projects need')+' a kickoff booking.';
    $('kickoff-missing-links').textContent=result.missingLinks+' confirmed '+(result.missingLinks===1?'kickoff needs':'kickoffs need')+' a joining link.';
    renderKickoffAvailability(result,identity,generation);
    if(openAvailability&&$('kickoff-availability').firstElementChild)$('kickoff-availability').firstElementChild.open=true;
    $('kickoff-previous').disabled=kickoffOffset===0;
    $('kickoff-next').disabled=kickoffOffset+result.limit>=result.total;
    $('kickoff-page').textContent=result.total?`${kickoffOffset+1}–${kickoffOffset+result.items.length} of ${result.total}`:'0 projects';
    $('kickoff-message').textContent=message||(!result.total?'No accepted projects awaiting kickoff match these filters.':'');
  }catch(error){if(csrf===identity&&generation===kickoffGeneration)$('kickoff-message').textContent=error.message;}
}
$('kickoff-country').addEventListener('change',()=>{kickoffOffset=0;refreshKickoffQueue();});
$('kickoff-status').addEventListener('change',()=>{kickoffOffset=0;refreshKickoffQueue();});
$('kickoff-refresh').addEventListener('click',()=>refreshKickoffQueue());
$('kickoff-previous').addEventListener('click',()=>{kickoffOffset=Math.max(0,kickoffOffset-25);refreshKickoffQueue();});
$('kickoff-next').addEventListener('click',()=>{kickoffOffset+=25;refreshKickoffQueue();});

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
    if(view==='response'&&csrf===requestIdentity)await refreshDemoAttention();
    if(typeof refreshGrowthCosts==='function')await refreshGrowthCosts();
    if(teamRole==='agent')return;
    const [users,status,slots]=await Promise.all([api('/api/admin/team'),api('/api/admin/operations'),api('/api/admin/slots')]);if(csrf!==requestIdentity)return;demoSlots=slots.slots;
    $('team-owner-list').replaceChildren(...users.users.filter(u=>u.active).map(u=>{const o=document.createElement('option');o.value=u.email;o.label=u.name;return o;}));
    $('slot-host').replaceChildren(...users.users.filter(u=>u.active).map(u=>{const o=text('option',u.name+' · '+u.email);o.value=u.email;return o;}));
    $('team-list').replaceChildren(...users.users.map(u=>{const row=text('p',u.name+' · '+u.email+' · '+u.role+(u.active?'':' · disabled'));if(u.email!=='sales@bandeviglobalgroup.com'&&teamRole==='admin'){const edit=text('button','Edit access');edit.type='button';edit.addEventListener('click',()=>{$('staff-email').value=u.email;$('staff-name').value=u.name;$('staff-role').value=u.role;$('staff-active').checked=!!u.active;$('staff-password').value='';$('staff-email').focus();});row.append(' ',edit);}return row;}));
    $('operations-status').textContent=(status.smtpConfigured?'Email sender configured. ':'Email sender needs setup. ')+status.pendingNotifications+' notifications pending. '+(status.backup?'Last verified backup: '+date(status.backup.created)+'. ':'No verified backup recorded. ')+status.alerts.join(' ');
    $('slot-list').replaceChildren(...demoSlots.map(s=>{const row=text('div','','slot-row');row.append(text('p',new Date(s.starts*1000).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST · '+s.duration+' minutes · '+s.host+' · '+(s.proposalReview?'Reserved for proposal review':s.state==='confirmed'?'Reserved '+s.enquiry_id:s.active?'Available':'Closed')));if(s.missingJoiningLink){const link=text('a','Missing joining link · Add joining details');link.href='/team-inbox/workspace/?'+new URLSearchParams({reference:s.enquiry_id})+'#meeting-form';row.append(link);}if(s.active&&!s.proposalReview){const button=text('button',s.state==='confirmed'?'Cancel appointment':'Close slot');button.type='button';button.addEventListener('click',async()=>{if(!confirm(s.state==='confirmed'?'Cancel this confirmed appointment? The customer update will be queued.':'Close this available slot?'))return;button.disabled=true;try{await post(s.state==='confirmed'?'/api/admin/appointment':'/api/admin/slots',s.state==='confirmed'?{action:'cancel',reference:s.enquiry_id,version:s.version}:{action:'close',id:s.id});await refreshOperations();}catch(e){$('slot-message').textContent=e.message;button.disabled=false;}});row.append(button);}return row;}));
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
      const slotTable=document.createElement('table');
      slotTable.append(text('caption','Travel Agency CRM demo times by market'));
      const slotHeader=document.createElement('tr');
      for(const label of ['Market','Slot views','Slot selections','Confirmed bookings','Selections converted','Booking conversion']){
        const cell=text('th',label);cell.scope='col';slotHeader.append(cell);
      }
      slotTable.append(slotHeader);
      const marketLabels={US:'United States',GB:'United Kingdom',IN:'India'};
      for(const market of r.crmSlots||[]){
        const row=document.createElement('tr'),name=text('th',marketLabels[market.market]);name.scope='row';
        const rate=market.selections?(100*market.converted/market.selections).toFixed(1)+'%':'—';
        row.append(name,...[market.views,market.selections,market.confirmed,market.converted,rate].map(value=>text('td',String(value))));
        slotTable.append(row);
      }
      $('crm-slot-report').replaceChildren(slotTable);
      const table=document.createElement('table');table.append(text('caption','Measured form journeys by starting page, form and source'));const header=document.createElement('tr');for(const label of ['Page','Form','Source','Started','Saved','No measured save yet','Validation issue','Submission failed','Saved / started'])header.append(text('th',label));table.append(header);
      for(const row of r.pages){const tr=document.createElement('tr');for(const value of [row.page,row.form,channelLabels[row.channel]||row.channel,row.started,row.saved,row.notSaved,row.validation,row.failed,row.started?(100*row.saved/row.started).toFixed(1)+'%':'—'])tr.append(text('td',String(value)));table.append(tr);}
      $('journey-pages').replaceChildren(r.pages.length?table:text('p','No measured form starts in this period yet.'));
      const labels={phone_click:'Call clicks',email_click:'Email clicks',whatsapp_click:'WhatsApp clicks',demo_click:'Demo button clicks'};
      $('journey-clicks').replaceChildren(...Object.entries(r.clicks).map(([key,value])=>{const card=text('div',labels[key]||key,'count');card.append(text('strong',String(value)));return card;}));
      $('journey-errors').replaceChildren(...(r.errors.length?r.errors.map(x=>text('p',(x.event==='invalid'?'Validation':'Submission')+' · '+x.reason+': '+x.count)):[text('p','No measured issues in this period.')]));
    }else for(const id of ['crm-slot-report','journey-pages','journey-clicks','journey-errors'])$(id).replaceChildren();
    $('journey-message').textContent='';
  }catch(error){if(csrf&&csrf===identity){$('journey-message').textContent='Journey report unavailable. Refresh to try again.';for(const id of ['response-counts','response-basis','response-action-counts','response-queue','crm-slot-report','journey-pages','journey-clicks','journey-errors'])$(id).replaceChildren();$('website-journeys').hidden=true;}}
}

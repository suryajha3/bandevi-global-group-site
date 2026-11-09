'use strict';
const staff=document.body.dataset.staff==='true',prefix=staff?'/api/admin/workspace/':'/api/client/';
const $=id=>document.getElementById(id);let csrf='',role='',current=null,trackerOffset=0,trackerTotal=0,trackerGeneration=0,projectGeneration=0;
let invite=staff?null:new URLSearchParams(location.hash.slice(1)).get('invite');
if(invite){history.replaceState(null,'',location.pathname);$('login').hidden=true;$('activate').hidden=false;}
function el(tag,content,cls){const node=document.createElement(tag);if(content!==undefined)node.textContent=content;if(cls)node.className=cls;return node;}
function stamp(n){return n?new Date(n*1000).toLocaleString(): '—';}
function money(p){return new Intl.NumberFormat(undefined,{style:'currency',currency:p.currency,currencyDisplay:'code'}).format(p.minor_units/100);}
async function api(path,data){const requestIdentity=csrf;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{const response=await fetch(path,{credentials:'same-origin',cache:'no-store',signal:controller.signal,...(data!==undefined?{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify(data)}:{})});const result=await response.json();if(!response.ok){if(response.status===401&&csrf&&csrf===requestIdentity)clear();throw Error(result.error||'Unable to complete the request.');}return result;}finally{clearTimeout(timer);}}
function clear(){trackerGeneration++;projectGeneration++;csrf='';current=null;$('project').replaceChildren();$('project-list').replaceChildren();$('workspace').hidden=true;$('login').hidden=false;$('logout').hidden=true;if(staff){$('report').replaceChildren();$('loss-report').replaceChildren();$('proposal-rows').replaceChildren();$('proposal-counts').replaceChildren();$('proposal-total').textContent='';$('proposal-page').textContent='';$('proposal-message').textContent='';}}
async function act(fn,success='Saved.'){try{await fn();$('message').textContent=success;}catch(e){$('message').textContent=e.name==='AbortError'?'The request timed out. Refresh to check whether it was saved before retrying.':e.message;}}
function button(label,fn){const b=el('button',label);b.type='button';b.addEventListener('click',()=>{b.disabled=true;act(fn).finally(()=>b.disabled=false);});return b;}
function field(form,label,key,type='text',choices=null){const id='f-'+Math.random().toString(36).slice(2);const l=el('label',label);l.htmlFor=id;const input=el(choices?'select':type==='textarea'?'textarea':'input');input.id=id;input.name=key;if(!choices&&type!=='textarea')input.type=type;if(choices)for(const v of choices){const o=el('option',v);o.value=v;input.append(o);}form.append(l,input);return input;}
function formBox(parent,title,submit,label='Save',afterLoad){const box=el('details'),summary=el('summary',title),form=el('form');box.append(summary,form);parent.append(box);const save=el('button',label);save.type='submit';form.addEventListener('submit',e=>{e.preventDefault();save.disabled=true;act(async()=>{await submit(form);await loadProject();afterLoad?.();if(staff)await loadTracker();},'Saved.').finally(()=>save.disabled=false);});queueMicrotask(()=>form.append(save));return form;}
async function change(action,data){if(!current)throw Error('Choose a project.');return api(prefix+action,{reference:current.reference,...(staff?{version:current.version}:{}),...data});}
async function load(){const identity=csrf;const result=await api(prefix+'projects'),selected=$('project-list').value||(staff?new URLSearchParams(location.search).get('reference'):'');if(!csrf||identity!==csrf)return;$('project-list').replaceChildren(...result.projects.map(p=>{const o=el('option',p.title+' · '+p.reference);o.value=p.reference;return o;}));if(result.projects.some(p=>p.reference===selected))$('project-list').value=selected;else if(selected&&staff){const empty=el('option','Create a project for '+selected);empty.value='';$('project-list').prepend(empty);$('project-list').value='';$('create-form').closest('details').open=true;}await loadProject();if(staff)await Promise.all([report(),loadTracker()]);}
async function report(){const identity=csrf;const r=await api(prefix+'report?days='+$('report-days').value);if(!csrf||identity!==csrf)return;const labels={enquiries:'Enquiries',demoReserved:'Reserved a demo',proposalProjects:'Published proposal',acceptedProjects:'Accepted proposal',overdueFollowups:'Overdue follow-ups',openTickets:'Active support tickets',overdueTickets:'Overdue support targets'};$('report').replaceChildren(...Object.entries(r.counts).map(([k,v])=>{const n=el('div',labels[k]||k);n.append(el('strong',String(v)));return n;}));const rate=r.counts.enquiries?(100*r.counts.demoReserved/r.counts.enquiries).toFixed(1)+'%':'—',accept=r.counts.proposalProjects?(100*r.counts.acceptedProjects/r.counts.proposalProjects).toFixed(1)+'%':'—';$('report-basis').textContent='Enquiry → demo: '+rate+'. Published proposal → acceptance: '+accept+'. '+r.basis;$('loss-report').replaceChildren(el('h3','Current lost-deal reasons'),...Object.entries(r.lostReasons).map(([k,v])=>el('p',k+': '+v)));}
async function loadProject(){const generation=++projectGeneration,identity=csrf;const ref=$('project-list').value;if(!ref){current=null;$('project').replaceChildren(el('p','No projects are available.'));return;}const query=new URLSearchParams(location.search),ticket=staff&&query.get('reference')===ref?query.get('ticket'):null;const params=new URLSearchParams({reference:ref});if(ticket)params.set('ticket',ticket);const result=await api(prefix+'project?'+params);if(!csrf||csrf!==identity||generation!==projectGeneration||$('project-list').value!==ref)return;current=result;render();const target=['#proposals','#support','#proposal-tracker'].includes(location.hash)||/^#proposal-[a-f0-9]{24}$/.test(location.hash)?$(location.hash.slice(1)):null;const thread=ticket?$('ticket-'+ticket):null;(thread||target)?.scrollIntoView({block:'start'});}
function proposalFeedbackForm(parent, proposal) {
 const form=el('form'), id='proposal-feedback-'+proposal.id, actions=el('div');
 form.id=id;form.hidden=true;
 const body=field(form,'Your message about revision '+proposal.revision,'body','textarea');
 body.required=true;body.maxLength=2500;
 const send=el('button','Send to sales team');send.type='submit';form.append(send);
 let kind,requestId;
 const buttons=Object.entries({question:'Ask a question',change:'Request changes'}).map(([choice,label])=>{
  const control=el('button',label);control.type='button';control.setAttribute('aria-controls',id);control.setAttribute('aria-expanded','false');
  control.addEventListener('click',()=>{
   if(send.disabled)return;
   kind=choice;form.hidden=false;
   buttons.forEach(button=>button.setAttribute('aria-expanded',String(button===control)));
   body.focus();
  });
  return control;
 });
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!kind||send.disabled)return;
  send.disabled=true;body.readOnly=true;requestId ||= crypto.randomUUID();
  act(async()=>{
   const result=await change('proposal-feedback',{id:proposal.id,kind,body:body.value,requestId});
   await loadProject();
   const thread=$('ticket-'+result.ticketId);
   if(thread){thread.scrollIntoView({block:'start'});thread.focus({preventScroll:true});}
  },'Proposal feedback saved. The sales team can reply here.').finally(()=>{send.disabled=false;body.readOnly=false;});
 });
 actions.append(...buttons);parent.append(actions,form);
}
function renderProposalDecision(parent,proposal){
 const decision=proposal.decision;
 if(decision?.changes){
  const changes=el('section');changes.setAttribute('aria-label','Changes in revision '+proposal.revision);
  changes.append(el('h4','What changed in revision '+proposal.revision),el('p',decision.changes,'copy'));
  parent.append(changes);
 }
 let card;
 if(decision?.published){
  card=el('section');card.setAttribute('aria-label','Your decision on revision '+proposal.revision);
  card.append(el('h4','Your decision · revision '+proposal.revision),el('p','Quoted amount · '+money(proposal)),
   el('h5','Review recap'),el('p',decision.recap,'copy'));
  if(proposal.displayStatus!=='Awaiting acceptance')card.append(el('p','Revision status · '+proposal.displayStatus,'muted'));
  if(decision.milestone)card.append(el('h5','First milestone'),el('p',decision.milestone,'copy'));
  if(decision.open_question)card.append(el('h5','Open question'),el('p',decision.open_question,'copy'));
  if(decision.due)card.append(el('p','Agreed decision date · '+new Intl.DateTimeFormat(undefined,{dateStyle:'long',timeZone:'UTC'})
   .format(new Date(decision.due+'T00:00:00Z'))));
  renderProposalBlocker(card,proposal);
  parent.append(card);
 }
 if(staff&&proposal.decisionEditable){
  const form=formBox(parent,decision?.published?'Edit decision card':'Write a decision card',()=>change('proposal-decision',{
   id:proposal.id,decisionVersion:decision?.version||0,recap:recap.value,milestone:milestone.value,
   openQuestion:question.value,due:due.value,reviewed:reviewed.checked
  }),'Publish reviewed decision card');
  const recap=field(form,'Client-facing review recap','recap','textarea');recap.required=true;recap.maxLength=1200;recap.value=decision?.recap||'';
  const milestone=field(form,'First milestone (optional)','milestone','textarea');milestone.maxLength=280;milestone.value=decision?.milestone||'';
  const question=field(form,'Open question (optional)','openQuestion','textarea');question.maxLength=500;question.value=decision?.open_question||'';
  const due=field(form,'Agreed decision date (optional)','due','date');due.value=decision?.due||'';
  const reviewed=field(form,'I reviewed this card and it is ready for the client','reviewed','checkbox');reviewed.required=true;
  form.append(el('p','The card appears on this proposal revision in Client Workspace. Review the recap against the recorded scope and terms.','muted'));
 }
 return card||parent;
}

const blockerLabels={approval:'Internal approval',purchase_order:'Purchase order',billing:'Billing details',
 scope:'Scope clarification',other:'Something else'};

function renderProposalBlocker(card,proposal){
 const blocker=proposal.blocker;
 if(blocker){
  const status=blocker.resolved?'Resolved':proposal.status==='published'?'Reported to the sales team':'Recorded on this revision';
  card.append(el('h5','Decision blocker'),el('p',blockerLabels[blocker.reason]+' · '+status));
  if(blocker.note)card.append(el('p',blocker.note,'copy'));
  if(blocker.expected)card.append(el('p','Expected decision date · '+blocker.expected));
  if(staff&&blocker.actionable){
   card.append(el('p','Sales owner · '+blocker.owner+' · Follow-up '+blocker.due));
   const resolve=button('Mark blocker resolved',async()=>{
    await change('proposal-blocker',{id:proposal.id,blockerVersion:blocker.version});
    await loadProject();
   });
   resolve.className='secondary';
   card.append(resolve);
  }
 }
 if(!proposal.blockerEditable)return;
 const form=formBox(card,'What’s holding up your decision?',()=>change('proposal-blocker',{
  id:proposal.id,blockerVersion:blocker?.version||0,reason:reason.value,expected:expected.value,note:note.value
 }), 'Save decision blocker');
 const reason=field(form,'What do you need to move forward?','reason','text',['',...Object.keys(blockerLabels)]);
 for(const option of reason.options)option.textContent=blockerLabels[option.value]||'Choose a reason';
 reason.value=blocker?.reason||'';reason.required=true;
 const expected=field(form,'Expected decision date (optional)','expected','date');
 expected.value=blocker?.resolved?'':blocker?.expected||'';
 const note=field(form,'Anything the sales team should know? (optional)','note','textarea');
 note.value=blocker?.note||'';note.maxLength=600;
}

const reviewTopics={scope:'Scope',budget:'Budget',timing:'Timing',integrations:'Integrations',other:'Other'};
const reviewStates={booked:'Booked',attended:'Attended',no_show:'No-show',cancelled:'Cancelled'};
const detectedReviewZone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
const appointmentZones=[...new Set([detectedReviewZone,'America/New_York','America/Chicago',
 'America/Denver','America/Los_Angeles','America/Phoenix','America/Anchorage','Pacific/Honolulu','Europe/London','Asia/Kolkata','UTC'])];
let reviewZone=detectedReviewZone;

function reviewTime(starts,zone){
 return new Intl.DateTimeFormat(undefined,{timeZone:zone,year:'numeric',month:'short',day:'numeric',
  hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(starts*1000);
}

function renderProposalReview(parent,proposal,reference){
 const review=proposal.review;
 if(!review&&(staff||!proposal.reviewAvailable))return;
 const section=el('section');section.setAttribute('aria-label','Proposal review for revision '+proposal.revision);
 const update=async(action,extra={},refresh=true)=>{
  await api(prefix+'proposal-review',{reference,id:proposal.id,action,reviewId:review?.id,reviewVersion:review?.version,...extra});
  if(refresh&&current?.reference===reference)await loadProject();
 };
 if(review){
  section.append(el('h4','Proposal review'),el('p',reviewStates[review.state]+' · '+reviewTime(review.starts,staff?'Asia/Kolkata':reviewZone)+' · '+review.duration+' minutes'));
  if(review.topic)section.append(el('p','Topic: '+reviewTopics[review.topic]));
  if(staff)section.append(el('p','Host: '+review.host));
  if(review.state==='booked'&&review.starts+review.duration*60>Date.now()/1000){
   if(review.meeting){
    const link=el('a','Open review meeting link');link.href=review.meeting;link.target='_blank';link.rel='noopener noreferrer';
    section.append(link);
   }else section.append(el('p','Joining details will appear here once the team adds them.'));
  }
  if(review.state==='booked'&&review.starts>Date.now()/1000){
   if(staff){
    const form=formBox(section,'Add or update joining link',()=>update('meeting',{url:url.value},false));
    const url=field(form,'HTTPS meeting link','url','url');url.required=true;url.maxLength=500;url.value=review.meeting;
   }
   section.append(button('Cancel proposal review',async()=>{if(confirm('Cancel the review of proposal revision '+proposal.revision+'?'))await update('cancel');}));
  }
  if(staff&&review.state==='booked'&&review.starts+review.duration*60<=Date.now()/1000){
   section.append(button('Record review attended',()=>update('attended')),button('Record review no-show',()=>update('no_show')));
  }
  if(staff&&['attended','no_show'].includes(review.state)){
   section.append(review.followed?el('p','Sales follow-up recorded '+stamp(review.followed)):
    button('Mark review follow-up complete',()=>update('followed')));
  }
 }
 if(!staff&&proposal.reviewAvailable){
  const box=el('details'),form=el('form'),status=el('p');status.setAttribute('role','status');
  box.append(el('summary','Book a proposal review'),form);
  form.append(el('p','Choose a time before this proposal expires. Your review stays with revision '+proposal.revision+'.'));
  const zone=field(form,'Display time zone','zone','text',appointmentZones);
  zone.value=reviewZone;
  const slot=field(form,'Available review times','slot','text',[]);slot.required=true;
  const topic=field(form,'What would you like to discuss? (optional)','topic','text',['',...Object.keys(reviewTopics)]);
  for(const option of topic.options)option.textContent=reviewTopics[option.value]||'Choose if helpful';
  const reserve=el('button','Confirm review booking');reserve.type='submit';reserve.disabled=true;
  let slots=[],loading=false,booking=false;
  function showSlots(){
   const selected=slot.value;
   slot.replaceChildren(new Option('Choose a time',''),...slots.map(item=>new Option(
    reviewTime(item.starts,zone.value)+' · '+item.duration+' minutes',item.id)));
   if(slots.some(item=>item.id===selected))slot.value=selected;
   reserve.disabled=loading||booking||!slots.length;
  }
  async function loadSlots(){
   if(loading||booking)return;
   loading=true;reserve.disabled=true;status.textContent='Checking available review times…';
   try{
    const result=await api(prefix+'review-slots?'+new URLSearchParams({reference,id:proposal.id}));
    slots=result.slots;
    status.textContent=slots.length?'Times are shown in the selected time zone.':'No times are available before this revision expires. Contact the team through Support.';
   }catch(error){slots=[];status.textContent=error.message;}
   finally{loading=false;showSlots();}
  }
  zone.addEventListener('change',()=>{reviewZone=zone.value;showSlots();});
  box.addEventListener('toggle',()=>{if(box.open)loadSlots();});
  const refresh=el('button','Refresh review times');refresh.type='button';refresh.addEventListener('click',loadSlots);
  form.append(reserve,refresh,status);
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(reserve.disabled||!slot.value)return;
   booking=true;reserve.disabled=true;
   try{await update('book',{slotId:slot.value,topic:topic.value});$('message').textContent='Proposal review booked for revision '+proposal.revision+'.';}
   catch(error){status.textContent=error.message;}
   finally{booking=false;showSlots();}
  });
  section.append(box);
 }
 parent.append(section);
}

function renderKickoffBooking(section,project,kickoff){
 const box=el('details'),form=el('form'),status=el('p','');
 const reschedule=kickoff.confirmed;
 status.role='status';
 box.append(el('summary',reschedule?'Reschedule kickoff':'Book your kickoff'),form);
 form.append(el('p','Choose a 30-minute time with your delivery owner.'));
 const zone=field(form,'Display time zone','zone','text',appointmentZones);
 zone.value=appointmentZones.includes(kickoff.booking_zone)?kickoff.booking_zone:detectedReviewZone;
 const slot=field(form,'Available kickoff times','slot','text',[]);
 slot.required=true;
 const reserve=el('button',reschedule?'Confirm new kickoff time':'Confirm kickoff booking');reserve.type='submit';
 const refresh=el('button','Refresh times');refresh.type='button';refresh.className='secondary';
 form.append(reserve,refresh,status);
 section.append(box);
 let slots=[],version=kickoff.version,loading=false,booking=false;
 function showTimes(){
  const selected=slot.value;
  slot.replaceChildren(new Option('Choose a time',''),...slots.map(time=>new Option(reviewTime(time.starts,zone.value),time.id)));
  if(slots.some(time=>time.id===selected))slot.value=selected;
  reserve.disabled=loading||booking||!slots.length;
 }
 async function loadTimes(){
  if(loading||booking)return;
  loading=true;refresh.disabled=true;reserve.disabled=true;status.textContent='Checking kickoff availability…';
  try{
   const params=new URLSearchParams({reference:project.reference,id:kickoff.proposal});
   const result=await api(prefix+'kickoff-slots?'+params);
   slots=result.slots;
   version=result.version;
   status.textContent=slots.length?'Times shown in '+zone.value+'.':'No kickoff times are open. Contact your team through Support to arrange one.';
  }catch(error){slots=[];status.textContent=error.message;}
  finally{loading=false;refresh.disabled=false;showTimes();}
 }
 box.addEventListener('toggle',()=>{if(box.open)loadTimes();});
 refresh.addEventListener('click',loadTimes);
 zone.addEventListener('change',()=>{showTimes();if(!loading&&!booking&&slots.length)status.textContent='Times shown in '+zone.value+'.';});
 form.addEventListener('submit',event=>{
  event.preventDefault();
  if(loading||booking||!slot.value)return;
  booking=true;reserve.disabled=refresh.disabled=true;
  status.textContent='Booking your kickoff…';
  act(async()=>{
   try{
    await api(prefix+'kickoff',{reference:project.reference,id:kickoff.proposal,version,
     action:reschedule?'reschedule':'book',slotId:slot.value,zone:zone.value});
    if(current?.reference===project.reference){
     await loadProject();
     $('client-kickoff')?.focus();
    }
   }catch(error){status.textContent='Refresh times before trying again.';throw error;}
   finally{booking=false;refresh.disabled=false;showTimes();}
  },reschedule?'Your kickoff has been rescheduled. Download the updated calendar event.':'Your kickoff is booked.');
 });
 showTimes();
}

function renderClientKickoff(project, root){
 const kickoff=project.kickoff;
 if(staff||!kickoff)return;
 const section=el('section');section.id='client-kickoff';section.tabIndex=-1;section.append(el('h2','Project kickoff checklist'));
 const proposal=el('a','Review accepted proposal · revision '+kickoff.revision+' · '+kickoff.currency);
 proposal.href='#proposal-'+kickoff.proposal;const scope=el('p');scope.append(proposal);section.append(scope);
 section.append(el('p','Delivery owner: '+(kickoff.ownerName||'To be assigned')));
 const support=el('a','Contact the team through Support');support.href='#support';section.append(support);
 section.append(el('h3','Requested materials'),el('p',kickoff.materials||'Check with the team for the project materials to share.','copy'));
 section.append(el('p','Use the agreed secure channel to share materials. Keep passwords and access keys out of the workspace.','muted'));
 section.append(el('p',kickoff.scheduled?(kickoff.confirmed?'Confirmed kickoff: ':'Proposed kickoff: ')+
  reviewTime(kickoff.scheduled,kickoff.booking_zone||detectedReviewZone):'Kickoff time to be arranged.'));
 if(kickoff.confirmed&&kickoff.scheduled&&!kickoff.started){
  const actions=el('p',undefined,'row');
  const calendar=el('a','Add to calendar');
  calendar.href=prefix+'kickoff-calendar?'+new URLSearchParams({reference:project.reference,id:kickoff.proposal});
  calendar.download='Bandevi-kickoff.ics';
  actions.append(calendar);
  if(kickoff.meeting){
   const join=el('a','Join kickoff');join.href=kickoff.meeting;join.target='_blank';join.rel='noopener noreferrer';
   actions.append(join);
  }else if(kickoff.scheduled>Date.now()/1000){
   actions.append(el('span','Joining link pending. Check back before your kickoff.','muted'));
  }
  section.append(actions);
 }
 if(kickoff.started){
  section.append(el('p','Kickoff recorded on '+stamp(kickoff.started)+'. Project contact: '+kickoff.contact));
 }else{
  if(!kickoff.confirmed||kickoff.canReschedule)renderKickoffBooking(section,project,kickoff);
  const form=formBox(section,'Update kickoff checklist',async()=>change('kickoff',{version:kickoff.version,contact:contact.value,materialsReady:ready.checked,confirmed:confirmed.checked}));
  const contact=field(form,'Primary project contact','contact');contact.value=kickoff.contact;contact.maxLength=160;
  const ready=field(form,'I’ve shared the requested materials','materialsReady','checkbox');ready.checked=!!kickoff.materials_ready;
  const confirmed=kickoff.booking_zone?{checked:true}:field(form,'I confirm the proposed kickoff time','confirmed','checkbox');
  if(!kickoff.booking_zone){
   confirmed.checked=!!kickoff.confirmed;
   confirmed.disabled=!kickoff.scheduled||!kickoff.confirmed&&kickoff.scheduled<=Date.now()/1000;
  }
 }
 root.append(section);
}
function render(){const p=current,root=$('project');root.replaceChildren();const overview=el('section');overview.append(el('h2',p.title),el('p','Reference: '+p.reference+' · '+p.status),el('p','Client: '+p.email));root.append(overview);
 if(staff){if(role!=='agent'){overview.append(button('Send access / password reset invitation',async()=>{if(!confirm('Send a private password setup link to '+p.email+'?'))return;await change('invite',{});await loadProject();}),button('Disable client access',async()=>{if(!confirm('Disable this client account across all its projects and revoke its sessions?'))return;await change('disable',{});await loadProject();}));}const f=formBox(overview,'Project status',async()=>change('status',{status:status.value}));const status=field(f,'Status','status','text',['Planning','In progress','Review','Delivered','On hold']);status.value=p.status;}
 const proposals=el('section');proposals.id='proposals';proposals.append(el('h2','Proposals & agreed scope'));root.append(proposals);
 if(staff){const f=formBox(proposals,'Create an immutable proposal revision',async()=>{if(!expiry.value)throw Error('Choose an expiry date.');await change('proposal',{title:title.value,scope:scope.value,terms:terms.value,value:amount.value,currency:currency.value,expires:Math.floor(Date.parse(expiry.value+'T23:59:59+05:30')/1000),changes:changes?.value||''});});const title=field(f,'Title','title'),scope=field(f,'Scope and deliverables','scope','textarea'),terms=field(f,'Commercial terms, responsibilities and payment milestones','terms','textarea'),amount=field(f,'Proposal value','value','number'),currency=field(f,'Currency','currency','text',['INR','USD','GBP','EUR','AED']),expiry=field(f,'Valid until (India date)','expires','date');for(const option of currency.options) option.textContent=({INR:'INR — Indian rupee',USD:'USD — US dollar',GBP:'GBP — British pound',EUR:'EUR — Euro',AED:'AED — UAE dirham'})[option.value];f.append(el('p','Enter the agreed amount in the selected quote currency. Changing currency does not convert the amount.','small'));title.maxLength=160;scope.maxLength=terms.maxLength=2500;const changes=p.proposals.length?field(f,'Changes from the previous revision (optional)','changes','textarea'):null;if(changes)changes.maxLength=800;if(p.postDemo){if([...currency.options].some(option=>option.value===p.postDemo.currency))currency.value=p.postDemo.currency;if(p.postDemo.body){const recap=el('details');recap.append(el('summary','Review saved customer recap'),el('p',p.postDemo.body,'copy'));const use=el('button','Use recap as draft scope');use.type='button';use.addEventListener('click',()=>{if(scope.value.trim()){message.textContent='The scope already has text. Clear it before copying the recap.';return;}scope.value=p.postDemo.body;scope.focus();message.textContent='Recap copied into the unsaved draft. Review the scope and enter the commercial terms before saving.';});recap.append(use);f.append(recap);}}if(p.salesJourney?.requirements){const discovery=el('details');discovery.append(el('summary','Review private demo requirements'),el('p',p.salesJourney.requirements,'copy'),el('p','Staff discovery notes are not an agreed scope. Review and edit the proposal before publishing.','muted'));const use=el('button','Use requirements as draft scope');use.type='button';use.addEventListener('click',()=>{scope.value=p.salesJourney.requirements;scope.focus();message.textContent='Requirements copied into the unsaved proposal scope. Review and edit before saving or publishing.';});discovery.append(use);f.append(discovery);}amount.min='0';amount.step='0.01';for(const v of [title,scope,terms,amount,expiry])v.required=true;}
 if(!p.proposals.length)proposals.append(el('p','No proposals yet.'));
 for(const proposal of p.proposals){const a=el('article');a.id='proposal-'+proposal.id;a.append(el('h3',proposal.title+' · revision '+proposal.revision),el('p',(proposal.displayStatus||proposal.status)+' · '+money(proposal)+' · Valid until '+proposalStamp(proposal.expires)),el('h4','Scope'),el('p',proposal.scope,'copy'),el('h4','Commercial terms'),el('p',proposal.terms,'copy'));a.append(button('Download proposal PDF',async()=>downloadProposal(proposal)));if(proposal.accepted)a.append(el('p','Accepted '+stamp(proposal.accepted)+' by '+proposal.accepted_by));
  if(staff&&proposal.status==='draft')a.append(button('Publish this revision',async()=>{if(!confirm('Publish this exact scope and amount, and notify the client?'))return;await change('publish',{id:proposal.id});await loadProject();await loadTracker();}));
  if(staff&&['draft','published'].includes(proposal.status))a.append(button('Withdraw',async()=>{if(!confirm('Withdraw this proposal?'))return;await change('withdraw',{id:proposal.id});await loadProject();await loadTracker();}));
  const decisionActions=renderProposalDecision(a,proposal);
  if(!staff&&proposal.status==='published'&&proposal.expires>Date.now()/1000){const f=formBox(decisionActions,'Accept this proposal',async()=>{await change('accept',{id:proposal.id,name:name.value,agree:agree.checked});},'Accept proposal',()=>$('continue-kickoff-'+proposal.id)?.focus());const name=field(f,'Your full name','name');name.required=true;name.maxLength=120;const agree=field(f,'I accept the scope, value and commercial terms of revision '+proposal.revision,'agree','checkbox');agree.required=true;}
  if(!staff&&proposal.status==='accepted'&&p.kickoff&&!p.kickoff.started){
   const link=el('a','Continue to kickoff');link.id='continue-kickoff-'+proposal.id;link.href='#client-kickoff';
   link.addEventListener('click',()=>$('client-kickoff')?.focus({preventScroll:true}));
   const next=el('p');next.append(link);decisionActions.append(next);
  }
  if(!staff&&proposal.status==='published'&&proposal.expires>Date.now()/1000)proposalFeedbackForm(decisionActions,proposal);
  renderProposalReview(a,proposal,p.reference);
  for(const request of p.tickets.filter(ticket=>ticket.proposalFeedback?.proposalId===proposal.id)){
   const link=el('a',request.subject+' · '+request.status);link.href='#ticket-'+request.id;
   const row=el('p');row.append(link);a.append(row);
  }
  proposals.append(a);}
 renderClientKickoff(p,root);
 const milestones=el('section');milestones.append(el('h2','Project milestones'));root.append(milestones);
 if(staff){const f=formBox(milestones,'Add or update a milestone',async()=>change('milestone',{id:id.value||undefined,title:title.value,due:due.value,status:status.value,notes:notes.value}));const id=field(f,'Milestone ID (leave blank to add)','id'),title=field(f,'Title','title'),due=field(f,'Target date','due','date'),status=field(f,'Status','status','text',['Planned','In progress','Ready for review','Approved','Complete']),notes=field(f,'Client-visible update','notes','textarea');title.required=true;title.maxLength=160;notes.maxLength=1500;}
 for(const m of p.milestones){const a=el('article');a.append(el('h3',m.title),el('p',m.status+' · Target '+(m.due||'Not set')),el('p',m.notes,'copy'));if(staff)a.append(el('small','ID: '+m.id));if(!staff&&m.status==='Ready for review')a.append(button('Approve milestone',async()=>{if(!confirm('Approve '+m.title+'?'))return;await change('approve-milestone',{id:m.id});await loadProject();}));milestones.append(a);}if(!p.milestones.length)milestones.append(el('p','No milestones recorded.'));
 const documents=el('section');documents.append(el('h2','Private documents'));root.append(documents);
 if(staff){const f=formBox(documents,'Upload a project document',async()=>{const file=input.files[0];if(!file||file.size>512*1024)throw Error('Choose a file up to 512 KB.');const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));await change('document',{name:file.name,content:btoa(binary)});});const input=field(f,'PDF, UTF-8 text, PNG or JPG; up to 512 KB','file','file');input.accept='.pdf,.txt,.png,.jpg,.jpeg';input.required=true;}
 for(const d of p.documents){const a=el('p'),link=el('a',d.name+' · '+Math.ceil(d.size/1024)+' KB');link.href=prefix+'document?id='+encodeURIComponent(d.id);a.append(link);if(staff)a.append(' ',button('Remove access',async()=>{if(!confirm('Remove client access to this document?'))return;await change('remove-document',{id:d.id});await loadProject();}));documents.append(a);}if(!p.documents.length)documents.append(el('p','No documents shared.'));
 const tickets=el('section');tickets.id='support';tickets.append(el('h2','Support requests'));root.append(tickets);
 if(!staff){const f=formBox(tickets,'New support request',async()=>change('ticket',{subject:subject.value,priority:priority.value,body:body.value}));const subject=field(f,'Subject','subject'),priority=field(f,'Priority','priority','text',['Normal','Urgent']),body=field(f,'Describe the request','body','textarea');subject.required=body.required=true;subject.maxLength=160;body.maxLength=2500;f.append(el('p','Priority sets an internal follow-up target; your agreed support contract governs response commitments.','muted'));}
 for(const t of p.tickets){const a=el('article');a.id='ticket-'+t.id;a.tabIndex=-1;a.append(el('h3',t.subject),el('p',t.status+' · '+t.priority+(staff?' · Owner '+t.owner+' · Internal target '+stamp(t.due):'')));for(const m of t.messages){const n=el('div',undefined,m.internal?'internal':'');n.append(el('small',m.actor+' · '+stamp(m.created)+(m.internal?' · Staff only':'')),el('p',m.body,'copy'));a.append(n);}const f=formBox(a,staff?'Reply or add an internal note':'Reply to this request',async()=>change('ticket',{id:t.id,ticketVersion:t.version,body:body.value,...(staff?{status:status.value,owner:owner.value,internal:internal.checked}:{})}));const body=field(f,'Message','body','textarea');body.required=true;body.maxLength=2500;let status,owner,internal;if(staff){status=field(f,'Status','status','text',['Open','In progress','Waiting for client','Closed']);status.value=t.status;owner=field(f,'Assigned staff email','owner','email');owner.value=t.owner;owner.required=true;owner.readOnly=!!t.proposalFeedback;internal=field(f,'Staff-only note (not visible to client)','internal','checkbox');}tickets.append(a);}if(!p.tickets.length)tickets.append(el('p','No support requests.'));
}
async function enter(identity){csrf=identity.csrf;role=identity.role||'';$('login').hidden=true;if($('activate'))$('activate').hidden=true;$('workspace').hidden=false;$('logout').hidden=false;await load();}
if(!staff){$('login-form').addEventListener('submit',e=>{e.preventDefault();const b=e.submitter;b.disabled=true;act(async()=>{await enter(await api(prefix+'login',{email:$('email').value,password:$('password').value}));$('password').value='';},'Signed in.').finally(()=>{b.disabled=false;$('password').value='';});});$('activate-form').addEventListener('submit',e=>{e.preventDefault();const b=e.submitter;b.disabled=true;act(async()=>{if($('new-password').value!==$('repeat-password').value)throw Error('Passwords do not match.');await enter(await api(prefix+'activate',{token:invite,password:$('new-password').value}));invite=null;},'Workspace access activated.').finally(()=>{b.disabled=false;$('new-password').value=$('repeat-password').value='';});});}
if(staff){const ref=new URLSearchParams(location.search).get('reference')||'';$('reference').value=$('meeting-reference').value=$('loss-reference').value=ref;$('project-title').value=new URLSearchParams(location.search).get('title')?.slice(0,160)||'';$('create-form').addEventListener('submit',e=>{e.preventDefault();const b=e.submitter;b.disabled=true;act(async()=>{await api(prefix+'create',{reference:$('reference').value,title:$('project-title').value});await load();$('project-list').value=$('reference').value;await loadProject();},'Project created.').finally(()=>b.disabled=false);});$('meeting-form').addEventListener('submit',e=>{e.preventDefault();const b=e.submitter;b.disabled=true;act(async()=>{const reference=$('meeting-reference').value,a=await api(prefix+'appointment?reference='+encodeURIComponent(reference));await api(prefix+'meeting',{reference,version:a.version,url:$('meeting-url').value});},'Meeting link saved. The customer update is queued.').finally(()=>b.disabled=false);});$('loss-form').addEventListener('submit',e=>{e.preventDefault();act(async()=>{await api(prefix+'loss',{reference:$('loss-reference').value,reason:$('loss-reason').value});await report();});});$('report-days').addEventListener('change',()=>act(report,''));}
$('refresh').addEventListener('click',()=>act(load,''));$('project-list').addEventListener('change',()=>act(loadProject,''));$('logout').addEventListener('click',()=>act(async()=>{await api(staff?'/api/admin/logout':prefix+'logout',{});clear();},'Signed out.'));
if(!invite)act(async()=>{const state=await api(staff?'/api/admin/session':prefix+'session');if(state.authenticated)await enter(state);},'');

window.addEventListener('hashchange',()=>{if(['#proposals','#support','#proposal-tracker'].includes(location.hash))document.querySelector(location.hash)?.scrollIntoView({block:'start'});});

function proposalStamp(n){return new Date(n*1000).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'})+' IST';}
async function downloadProposal(proposal){
 const identity=csrf,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(prefix+'proposal-pdf?'+new URLSearchParams({id:proposal.id}),{credentials:'same-origin',cache:'no-store',signal:controller.signal});if(!response.ok){const error=await response.json();if(response.status===401&&csrf===identity)clear();throw Error(error.error||'PDF download failed.');}const blob=await response.blob();if(!csrf||csrf!==identity)return;const url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download='Bandevi-'+proposal.reference.replace(/[^a-zA-Z0-9_-]/g,'_')+'-revision-'+proposal.revision+'.pdf';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }finally{clearTimeout(timer);}
}
async function loadTracker(){
 if(!staff||!csrf)return;const generation=++trackerGeneration,identity=csrf;$('proposal-message').textContent='Loading proposals…';
 try{const result=await api(prefix+'proposal-queue?'+new URLSearchParams({bucket:$('proposal-bucket').value,q:$('proposal-search').value.trim(),offset:String(trackerOffset)}));if(!csrf||csrf!==identity||generation!==trackerGeneration)return;
 const labels={drafts:'Drafts',awaiting:'Awaiting acceptance',expiring:'Expiring in 7 days',expired:'Expired',accepted:'Accepted'};
 $('proposal-counts').replaceChildren(...Object.entries(labels).map(([key,label])=>{const b=button(label+' · '+result.counts[key],async()=>{$('proposal-bucket').value=key;$('proposal-search').value='';trackerOffset=0;await loadTracker();});b.setAttribute('aria-pressed',String($('proposal-bucket').value===key));return b;}));
 $('proposal-rows').replaceChildren(...result.items.map(item=>{const row=el('article');row.dataset.proposal=item.id;row.append(el('h3',item.title+' · revision '+item.revision),el('p',item.projectTitle+' · '+item.reference),el('p',item.clientEmail+' · Owner: '+(item.owner||'Unassigned')),el('p',item.displayStatus+(item.expiresSoon?' · Expiring soon':'')+' · '+money(item)+' · Valid until '+proposalStamp(item.expires)));const open=el('a','Open project & proposal');open.href='/team-inbox/workspace/?'+new URLSearchParams({reference:item.reference})+'#proposals';row.append(open,' ',button('Download proposal PDF',async()=>downloadProposal(item)));return row;}));
 if(!result.items.length)$('proposal-rows').append(el('p','No proposals match this view.'));
 trackerTotal=result.total;$('proposal-total').textContent=result.total+' matching proposal revisions';$('proposal-page').textContent=result.total?(result.offset+1)+'-'+Math.min(result.offset+result.limit,result.total)+' of '+result.total:'0 proposals';$('proposal-previous').disabled=trackerOffset===0;$('proposal-next').disabled=trackerOffset+result.limit>=result.total;$('proposal-message').textContent='';
 }catch(error){if(csrf===identity&&generation===trackerGeneration)$('proposal-message').textContent=error.message;}
}
if(staff){$('proposal-filters').addEventListener('submit',event=>{event.preventDefault();trackerOffset=0;loadTracker();});$('proposal-reset').addEventListener('click',()=>{$('proposal-search').value='';$('proposal-bucket').value='awaiting';trackerOffset=0;loadTracker();});$('proposal-previous').addEventListener('click',()=>{trackerOffset=Math.max(0,trackerOffset-25);loadTracker();});$('proposal-next').addEventListener('click',()=>{trackerOffset+=25;loadTracker();});}

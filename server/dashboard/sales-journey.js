'use strict';
let salesJourneyGeneration=0,salesJourneyState=null,salesFunnelGeneration=0;
function postDemoTime(epoch){return new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}).format(epoch*1000)+' IST';}
function updateRecapControls(){
 const recap=salesJourneyState?.postDemo, body=$('demo-recap-body');
 const editable=!!recap&&!['pending','sent'].includes(recap.delivery);
 body.readOnly=!editable;
 $('demo-recap-save').disabled=!editable||!body.value.trim()||body.value.trim()===recap?.body;
 const canReview=editable&&!!recap.body&&body.value.trim()===recap.body&&!!recap.recipient;
 $('demo-recap-reviewed').disabled=!canReview;
 if(!canReview)$('demo-recap-reviewed').checked=false;
 $('demo-recap-send').disabled=!canReview||!$('demo-recap-reviewed').checked;
}
function renderRecap(state){
 const recap=state?.postDemo;
 $('demo-recap-form').hidden=!recap||['Won','Lost'].includes(state?.workflow?.stage);
 $('demo-recap-body').value=recap?.body||'';
 $('demo-recap-reviewed').checked=false;
 const step=state?.nextStep?.preview||'';
 $('demo-recap-next-step').hidden=!step;
 $('demo-recap-next-step').textContent=step;
 $('demo-recap-due').textContent=recap?'Internal follow-up target: '+postDemoTime(recap.due)+(recap.currency?' · Quote preference: '+recap.currency:''):'';
 $('demo-recap-status').textContent=recap?.delivery==='sent'?'Recap sent by the mail service.':recap?.delivery==='pending'?'Reviewed recap queued for delivery.':recap?.delivery==='cancelled'?'Previous delivery was cancelled. Review again before queueing for '+recap.recipient+'.':recap?.recipient?'Recorded recipient: '+recap.recipient:recap?'No customer email is recorded. You can still save a recap for the proposal.':'';
 updateRecapControls();
}
function renderDemoPrepAndStep(state){
 const prep=state?.prepBrief,step=state?.nextStep;
 $('journey-prep').hidden=!(prep?.goal||prep?.tools||prep?.teammate);
 $('journey-prep-goal').textContent=prep?.goal||'Not supplied';
 $('journey-prep-tools').textContent=prep?.tools||'Not supplied';
 $('journey-prep-teammate').textContent=({yes:'Would like a colleague to join',no:'No',unsure:'Still deciding'})[prep?.teammate]||'Not supplied';
 $('demo-next-step-form').hidden=!step||['Won','Lost'].includes(state?.workflow?.stage);
 $('demo-next-kind').value=step?.kind||'';
 $('demo-next-date').value=step?.due||'';
 $('demo-next-note').value=step?.note||'';
 const recapLocked=['pending','sent'].includes(state?.postDemo?.delivery);
 $('demo-next-save').disabled=!step||recapLocked;
 $('demo-next-status').textContent=step&&recapLocked?'The reviewed recap has already been queued or sent.':'';
}
function clearSalesJourney(){
 salesJourneyGeneration++;salesJourneyState=null;
 $('journey-requirements').value='';$('journey-outcome').value='Not recorded';$('journey-slot').replaceChildren();$('journey-agreed').checked=false;
 $('journey-status').textContent='';$('sales-journey-message').textContent='';$('journey-proposal').removeAttribute('href');
 $('journey-booking').hidden=true;for(const node of $('journey-record-form').elements)node.disabled=true;
 renderRecap(null);
 renderDemoPrepAndStep(null);
}
async function loadSalesJourney(entry,target=''){
 clearSalesJourney();const generation=salesJourneyGeneration,identity=csrf;
 $('journey-status').textContent='Loading demo record…';
 try{const state=await api('/api/admin/sales-journey?'+new URLSearchParams({reference:entry.reference}));
  if(!csrf||csrf!==identity||current!==entry||!$('editor').open||generation!==salesJourneyGeneration)return;
  salesJourneyState=state;$('journey-requirements').value=state.record.requirements;$('journey-outcome').value=state.record.outcome;
  const a=state.appointment;
  $('journey-status').textContent=a?'Demo: '+a.state+(a.starts?' · '+new Date(a.starts*1000).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST':'')+' · Outcome: '+state.record.outcome+(a.missingJoiningLink?' · Missing joining link':''):'No demo appointment recorded.';
  for(const node of $('journey-record-form').elements)node.disabled=false;
  $('journey-slot').replaceChildren(text('option',state.slots.length?'Choose a customer-agreed time':'No available slots'));
  $('journey-slot').firstChild.value='';
  for(const slot of state.slots){const option=text('option',new Date(slot.starts*1000).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST · '+slot.duration+' minutes');option.value=slot.id;$('journey-slot').append(option);}
  $('journey-booking').hidden=!!a||['Won','Lost'].includes(state.workflow?.stage);$('journey-book-button').disabled=!state.slots.length;
  $('journey-proposal').href='/team-inbox/workspace/?'+new URLSearchParams({reference:entry.reference,title:(entry.details.interest+' project').slice(0,160)})+'#proposals';
  $('journey-proposal').textContent=state.projectExists?'Open project & draft proposal':'Create project & draft proposal';
  renderRecap(state);
  renderDemoPrepAndStep(state);
  if(target==='demo-recap-body'&&!$('demo-recap-form').hidden)$('demo-recap-body').focus();
 }catch(error){if(csrf===identity&&current===entry&&generation===salesJourneyGeneration)$('journey-status').textContent=error.message;}
}
async function changeDemoRecap(event, action){
 event.preventDefault();
 const entry=current, state=salesJourneyState, identity=csrf, generation=salesJourneyGeneration;
 if(!entry||!state?.postDemo||!identity)return;
 const body=$('demo-recap-body').value.trim(), reviewed=$('demo-recap-reviewed').checked;
 if(action==='recap-send'&&(!reviewed||body!==state.postDemo.body))return;
 $('demo-recap-save').disabled=$('demo-recap-send').disabled=true;
 try{
  await post('/api/admin/sales-journey',{reference:entry.reference,version:state.record.version,scheduleEvent:state.record.scheduleEvent,recapVersion:state.postDemo.version,nextStepVersion:state.nextStep?.version,action,body,reviewed});
  if(csrf!==identity||current!==entry||generation!==salesJourneyGeneration||!$('editor').open)return;
  await loadSalesJourney(entry);
  if(csrf===identity&&current===entry&&$('editor').open&&action==='recap-save')$('demo-recap-status').textContent='Recap draft saved. Review it before queueing the email.';
 }catch(error){if(csrf===identity&&current===entry&&generation===salesJourneyGeneration){$('demo-recap-status').textContent=error.message;updateRecapControls();}}
}
$('demo-recap-form').addEventListener('submit',event=>changeDemoRecap(event,'recap-save'));
$('demo-recap-body').addEventListener('input',updateRecapControls);
$('demo-recap-reviewed').addEventListener('change',updateRecapControls);
$('demo-recap-send').addEventListener('click',event=>changeDemoRecap(event,'recap-send'));
$('demo-next-step-form').addEventListener('submit',async event=>{
 event.preventDefault();
 const entry=current,state=salesJourneyState,identity=csrf,generation=salesJourneyGeneration;
 if(!entry||!state?.nextStep||!identity||$('demo-next-save').disabled)return;
 const draft=$('demo-recap-body').value;
 $('demo-next-save').disabled=true;
 try{
  await post('/api/admin/sales-journey',{reference:entry.reference,action:'next-step',version:state.record.version,
   scheduleEvent:state.record.scheduleEvent,nextStepVersion:state.nextStep.version,
   kind:$('demo-next-kind').value,due:$('demo-next-date').value,note:$('demo-next-note').value});
  if(csrf!==identity||current!==entry||generation!==salesJourneyGeneration||!$('editor').open)return;
  await loadSalesJourney(entry);
  if(csrf!==identity||current!==entry||!$('editor').open)return;
  if(!$('demo-recap-body').readOnly&&draft!==state.postDemo.body){$('demo-recap-body').value=draft;updateRecapControls();}
  $('demo-next-status').textContent='Agreed next step saved.';
 }catch(error){
  if(csrf===identity&&current===entry&&generation===salesJourneyGeneration){
   $('demo-next-status').textContent=error.message;$('demo-next-save').disabled=false;
  }
 }
});
async function saveSalesJourney(event,action){
 event.preventDefault();if(!current||!salesJourneyState||!csrf)return;
 const entry=current,identity=csrf,generation=salesJourneyGeneration,version=salesJourneyState.record.version;
 const data=action==='book'?{slotId:$('journey-slot').value,customerAgreed:$('journey-agreed').checked}:{requirements:$('journey-requirements').value,outcome:$('journey-outcome').value,scheduleEvent:salesJourneyState.record.scheduleEvent};
 if(action==='book'&&(!data.slotId||!data.customerAgreed))return;
 if(action==='book'&&($('journey-requirements').value!==salesJourneyState.record.requirements||$('journey-outcome').value!==salesJourneyState.record.outcome)){
  $('sales-journey-message').textContent='Save changed requirements and outcome before booking a demo.';return;
 }
 for(const button of $('sales-journey-panel').querySelectorAll('button'))button.disabled=true;
 try{await post('/api/admin/sales-journey',{reference:entry.reference,version,action,...data});
  if(!csrf||csrf!==identity||current!==entry||!$('editor').open||generation!==salesJourneyGeneration)return;
  await loadSalesJourney(entry);
  if(csrf===identity&&current===entry&&$('editor').open)$('sales-journey-message').textContent=action==='book'?'Demo booked. The customer confirmation email is queued. Add joining details in the project workspace.':'Demo record saved. Save the owner, next action and follow-up date below when needed.';
 }catch(error){if(csrf===identity&&current===entry&&generation===salesJourneyGeneration)$('sales-journey-message').textContent=error.message+' Reload the demo record to check the saved state.';}
 finally{if(csrf===identity&&current===entry&&$('editor').open){$('journey-record-button').disabled=!salesJourneyState;$('journey-reload').disabled=false;$('journey-book-button').disabled=!salesJourneyState?.slots.length;$('demo-next-save').disabled=!salesJourneyState?.nextStep||['pending','sent'].includes(salesJourneyState?.postDemo?.delivery);}}
}
$('journey-record-form').addEventListener('submit',event=>saveSalesJourney(event,'record'));
$('journey-booking').addEventListener('submit',event=>saveSalesJourney(event,'book'));
$('journey-reload').addEventListener('click',()=>{if(current)loadSalesJourney(current);});
$('editor').addEventListener('close',()=>{if(!$('editor').open)clearSalesJourney();});
$('editor').addEventListener('cancel',clearSalesJourney);
async function refreshSalesFunnel(identity){
 const generation=++salesFunnelGeneration,days=$('report-days').value;
 $('sample-demo-report').hidden=true;
 $('sample-demo-table').replaceChildren();
 $('crm-demo-conversion').hidden=true;
 $('crm-demo-conversion-table').replaceChildren();
 $('proposal-review-conversion').hidden=true;
 $('proposal-review-conversion-table').replaceChildren();
 $('proposal-blocker-conversion-table').replaceChildren();
 $('proposal-decision-report').replaceChildren();
 $('proposal-decision-basis').textContent='Loading proposal decisions…';
 campaignSalesState=null;$('portfolio-sales-report').replaceChildren();$('industry-sales-report').replaceChildren();$('home-service-sales-report').replaceChildren();$('campaign-sales-report').replaceChildren();$('campaign-sales-basis').textContent='';$('campaign-sales-summary').textContent='Loading campaign sales…';
 try{const r=await api('/api/admin/sales-funnel?days='+days);if(!csrf||csrf!==identity||generation!==salesFunnelGeneration||days!==$('report-days').value)return;
  const labels={enquiries:'Enquiries',demoBooked:'Demo booked',demoCompleted:'Demo completed',publishedProposals:'All published proposals',proposalAfterDemo:'Proposal after demo booking',wonAfterDemoProposal:'Won after demo & proposal',currentlyWon:'All currently Won'};
  $('sales-funnel-counts').replaceChildren(...Object.entries(r.counts).map(([key,value])=>{const card=text('div',labels[key],'count');card.append(text('strong',String(value)));return card;}));
  const rate=n=>n===null?'No denominator':n+'%';$('sales-funnel-rates').textContent='Enquiry → demo booking: '+rate(r.rates.enquiryToDemo)+' · Demo booking → published proposal: '+rate(r.rates.demoToProposal)+' · Published proposal after demo → recorded Won: '+rate(r.rates.proposalToWon);
  $('sales-funnel-basis').textContent=r.basis;
  const table=document.createElement('table');table.append(text('caption','US, UK and India sales performance · received-date cohort'));
  const head=document.createElement('thead'),headers=document.createElement('tr');
  for(const label of ['Business country','Enquiries','Reached Qualified','Demo booked','Demo completed','Demo cancelled','Demo no-show','All published proposals','Proposal after demo','Currently Won','Demo / enquiry','Proposal / demo','Won / proposal after demo','Won / enquiry']){const cell=text('th',label);cell.scope='col';headers.append(cell);}head.append(headers);table.append(head);
  const body=document.createElement('tbody'),percent=value=>value===null?'—':value+'%';
  for(const market of r.markets||[]){const row=document.createElement('tr'),label=text('th',market.label);label.scope='row';row.append(label);const c=market.counts,rates=market.rates;for(const value of [c.enquiries,c.qualified,c.demoBooked,c.demoCompleted,c.demoCancelled??0,c.demoNoShow??0,c.publishedProposals,c.proposalAfterDemo,c.currentlyWon,percent(rates.enquiryToDemo),percent(rates.demoToProposal),percent(rates.proposalToWon),percent(rates.enquiryToWon)])row.append(text('td',String(value)));body.append(row);}table.append(body);
  $('market-sales-report').replaceChildren(table);$('market-sales-basis').textContent=r.marketBasis;
  renderSampleDemoFunnel(r);
  renderCrmDemoConversion(r);
  renderProposalReviewConversion(r);
  renderProposalDecisions(r);
  renderOutcomeRows('portfolio-sales-report','Project example','projectLabel',r.portfolio || []);
  renderOutcomeRows('industry-sales-report','Industry','industryLabel',r.industries || []);
  renderOutcomeRows('home-service-sales-report','Homepage service','serviceLabel',r.homeServices || []);
  renderCampaignSalesReport(r);
 }catch(error){if(csrf===identity&&generation===salesFunnelGeneration&&days===$('report-days').value){$('sales-funnel-basis').textContent=error.message;$('campaign-sales-summary').textContent=error.message;$('proposal-decision-basis').textContent='Proposal decisions could not be loaded.';}}
}

function renderProposalReviewConversion(result){
 if(!result.proposalReviewConversion)return;
 const table=document.createElement('table');
 table.append(text('caption','Proposal review outcomes · last '+result.days+' days by first review booking'));
 const header=table.createTHead().insertRow();
 for(const label of ['Business country','Revisions booked','Revisions attended','Revisions accepted','Recorded Won deals',
  'Decision cards shared','Accepted after card','Won after card']){
  const cell=text('th',label);cell.scope='col';header.append(cell);
 }
 const body=table.createTBody();
 for(const group of result.proposalReviewConversion){
  const row=body.insertRow(),label=text('th',group.label);
  label.scope='row';row.append(label);
  for(const value of [group.booked,group.attended,group.accepted,group.won,group.cardsShared,group.acceptedAfterCard,group.wonAfterCard]){
   row.append(text('td',String(value)));
  }
 }
 $('proposal-review-conversion-table').replaceChildren(table);
 const decisions=document.createElement('table');
 decisions.append(text('caption','Decision blockers and kickoff outcomes · same review booking period'));
 const decisionHeader=decisions.createTHead().insertRow();
 for(const label of ['Business country','Revisions with blockers','Latest blockers by reason','Accepted after blocker',
  'Kickoffs started after card','Median card to acceptance','Median acceptance to kickoff']){
  const cell=text('th',label);cell.scope='col';decisionHeader.append(cell);
 }
 const decisionBody=decisions.createTBody();
 const elapsed=seconds=>seconds==null?'—':seconds<3600?Math.round(seconds/60)+' min':
  seconds<86400?(seconds/3600).toFixed(1)+' hr':(seconds/86400).toFixed(1)+' days';
 for(const group of result.proposalReviewConversion){
  const row=decisionBody.insertRow(),label=text('th',group.label);
  label.scope='row';row.append(label);
  const reasons=Object.entries(group.blockerReasons||{}).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  for(const value of [group.blockedRevisions??0,reasons.map(([reason,count])=>reason+' '+count).join(' · ')||'—',
   group.acceptedAfterBlocker??0,group.kickoffsAfterCard??0,elapsed(group.medianCardToAcceptanceSeconds),
   elapsed(group.medianAcceptanceToKickoffSeconds)]){
   row.append(text('td',String(value)));
  }
 }
 $('proposal-blocker-conversion-table').replaceChildren(decisions);
 $('proposal-review-conversion').hidden=false;
}

function renderCrmDemoConversion(result){
 if(!result.crmDemoConversion)return;
 const table=document.createElement('table');
 table.append(text('caption','CRM demo conversion by business country · last '+result.days+' days by demo date'));
 const header=table.createTHead().insertRow();
 for(const label of ['Business country','Attended CRM demos','Agreed next steps','Proposals published','Recorded Won','Attended to Won']){
  const cell=text('th',label);cell.scope='col';header.append(cell);
 }
 const body=table.createTBody();
 for(const group of result.crmDemoConversion){
  const row=body.insertRow(),label=text('th',group.label);
  label.scope='row';row.append(label);
  for(const value of [group.attended,group.nextSteps,group.proposals,group.won,group.conversionRate===null?'—':group.conversionRate+'%']){
   row.append(text('td',String(value)));
  }
 }
 $('crm-demo-conversion-table').replaceChildren(table);
 $('crm-demo-conversion').hidden=false;
}

function renderSampleDemoFunnel(result){
 const groups=result.sampleDemoFunnel;
 if(!groups)return;
 const table=document.createElement('table');
 table.append(text('caption','Sample CRM to live demo · last '+result.days+' days by sample completion'));
 const headers=table.createTHead().insertRow();
 for(const label of ['Business market','Sample completions','Demo bookings','Attended demos']){
  const cell=text('th',label);cell.scope='col';headers.append(cell);
 }
 const body=table.createTBody();
 for(const group of groups){
  const row=body.insertRow(),label=text('th',group.country==='unknown'?'Market not selected':group.label);
  label.scope='row';row.append(label);
  for(const count of [group.completions,group.bookings,group.attended])row.append(text('td',String(count)));
 }
 $('sample-demo-table').replaceChildren(table);
 $('sample-demo-report').hidden=false;
}

function renderProposalDecisions(result){
 const groups=result.proposalDecisions;
 if(!groups){$('proposal-decision-basis').textContent='Proposal decisions are unavailable.';return;}
 const table=document.createElement('table');
 table.append(text('caption','Proposal decisions by business country · last '+result.days+' days by publication'));
 const header=table.createTHead().insertRow();
 for(const title of ['Business country','Published revisions','Accepted','Recorded lost','Without recorded decision','Acceptance rate','Change requests','Revisions with changes','Median time to decision']){
  const cell=text('th',title);cell.scope='col';header.append(cell);
 }
 const formatDuration=(seconds,count)=>{
  if(seconds===null)return '—';
  const elapsed=seconds<60?'<1 min':seconds<3600?Math.round(seconds/60)+' min':seconds<86400?(seconds/3600).toFixed(1)+' h':(seconds/86400).toFixed(1)+' days';
  return elapsed+' ('+count+(count===1?' decision)':' decisions)');
 };
 const body=table.createTBody();
 for(const group of groups){
  const row=body.insertRow(), heading=text('th',group.label);heading.scope='row';row.append(heading);
  const rate=group.acceptanceRate===null?'—':group.acceptanceRate+'%';
  for(const value of [group.published,group.accepted,group.lost,group.withoutDecision,rate,group.changeRequests,group.revisionsWithChanges,formatDuration(group.medianDecisionSeconds,group.decided)])row.append(text('td',String(value)));
 }
 $('proposal-decision-report').replaceChildren(table);
 $('proposal-decision-basis').textContent=result.proposalDecisionBasis;
}

function renderOutcomeRows(id,label,labelKey,groups){
 const report=$(id);
 if(!groups.length){
  report.replaceChildren(text('p','No '+label.toLowerCase()+' was saved with enquiries in this period.'));
  return;
 }
 const table=document.createElement('table');
 table.append(text('caption','Saved enquiries by '+label.toLowerCase()+' and business country'));
 const header=table.createTHead().insertRow();
 for(const title of [label,'Business country','Enquiries','Reached Qualified','Demo completed']){
  const cell=text('th',title);
  cell.scope='col';
  header.append(cell);
 }
 const body=table.createTBody();
 for(const group of groups){
  const row=body.insertRow();
  const heading=text('th',group[labelKey]);
  heading.scope='row';
  row.append(heading);
  for(const value of [group.countryLabel,group.enquiries,group.qualified,group.demoCompleted]){
   row.append(text('td',String(value)));
  }
 }
 report.replaceChildren(table);
}

let campaignSalesState=null;
function clearCampaignSales(){
 campaignSalesState=null;
 for(const id of ['campaign-sales-summary','campaign-sales-report','campaign-sales-basis','portfolio-sales-report','industry-sales-report','home-service-sales-report'])$(id).replaceChildren();
 $('campaign-sales-country').value='all';$('campaign-sales-search').value='';
 $('proposal-decision-report').replaceChildren();$('proposal-decision-basis').textContent='';
 $('sample-demo-report').hidden=true;$('sample-demo-table').replaceChildren();
 $('crm-demo-conversion').hidden=true;$('crm-demo-conversion-table').replaceChildren();
 $('proposal-review-conversion').hidden=true;$('proposal-review-conversion-table').replaceChildren();
 $('proposal-blocker-conversion-table').replaceChildren();
}
function renderCampaignSalesReport(result){
 campaignSalesState={identity:csrf,groups:result.campaigns||[]};$('campaign-sales-basis').textContent=result.campaignBasis||'';renderCampaignSalesRows();
}
const crmPromotionLabels = {
 'hero-demo': 'Main demo button',
 'lead-ownership': 'Lead ownership',
 'quote-follow-up': 'Quotation follow-up',
 'operations-handover': 'Operations handover',
 'availability-slot': 'CRM page · slot selected',
 'availability-request': 'CRM page · preferred time'
};
function renderCampaignSalesRows(){
 if(!csrf||!campaignSalesState||campaignSalesState.identity!==csrf)return;
 const country=$('campaign-sales-country').value,query=$('campaign-sales-search').value.trim().toLowerCase();
 const groups=campaignSalesState.groups.filter(group =>
  (country === 'all' || group.country === country) &&
  [(group.campaign || 'Unattributed'), (group.landingPage || ''), crmPromotionLabels[group.promotion] || '', group.promotion || ''].some(value => value.toLowerCase().includes(query))
 );
 const enquiryCount=groups.reduce((sum,g)=>sum+g.counts.enquiries,0);
 $('campaign-sales-summary').textContent=groups.length+' campaign '+(groups.length===1?'group':'groups')+' · '+enquiryCount+' '+(enquiryCount===1?'enquiry':'enquiries')+' · Qualified: '+groups.reduce((n,g)=>n+g.counts.qualified,0)+' · Demo bookings: '+groups.reduce((n,g)=>n+g.counts.demoBooked,0)+' · Completed demos: '+groups.reduce((n,g)=>n+g.counts.demoCompleted,0)+' · Published proposals: '+groups.reduce((n,g)=>n+g.counts.publishedProposals,0)+' · Currently Won: '+groups.reduce((n,g)=>n+g.counts.currentlyWon,0);
 const table=document.createElement('table');table.append(text('caption','Campaign-to-sales · saved enquiry cohort'));
 const head=document.createElement('thead'),header=document.createElement('tr');
 for(const title of ['Business country','Campaign','Source / medium','Channel','Landing page','Enquiries','CRM reviews','Reached Qualified','Demo booked','Demo completed','Published proposals','Currently Won','Qualified / enquiry','Won / enquiry','Recorded won value (not payments)','Won without value','CRM promotion','Demo completed / enquiry']){const th=text('th',title);th.scope='col';header.append(th);}head.append(header);table.append(head);
 const body=document.createElement('tbody'),percent=v=>v===null?'—':v+'%';
 for(const g of groups){const row=document.createElement('tr'),label=text('th',g.label);label.scope='row';row.append(label);const c=g.counts;
  const money=g.wonValueByCurrency.map(v=>new Intl.NumberFormat('en',{style:'currency',currency:v.currency,currencyDisplay:'code',minimumFractionDigits:2,maximumFractionDigits:2}).format(v.minorUnits/100)+' ('+v.deals+' deals)').join(' · ')||'No recorded value';
  for(const value of [g.campaign||'Unattributed',(g.source||'Not recorded')+' / '+(g.medium||'Not recorded'),channelLabels[g.channel]||'Not recorded',g.landingPage||'Not recorded',c.enquiries,c.crmReviewRequests,c.qualified,c.demoBooked,c.demoCompleted,c.publishedProposals,c.currentlyWon,percent(g.rates.enquiryToQualified),percent(g.rates.enquiryToWon),money,g.wonWithoutValue,crmPromotionLabels[g.promotion]||'—',percent(g.rates.enquiryToCompletedDemo)])row.append(text('td',String(value)));body.append(row);
 }
 if(!groups.length){const row=document.createElement('tr'),cell=text('td','No enquiries match these filters in the selected received-date period.');cell.colSpan=18;row.append(cell);body.append(row);}table.append(body);$('campaign-sales-report').replaceChildren(table);
}
$('campaign-sales-country').addEventListener('change',renderCampaignSalesRows);
$('campaign-sales-search').addEventListener('input',renderCampaignSalesRows);

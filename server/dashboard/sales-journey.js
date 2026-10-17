'use strict';
let salesJourneyGeneration=0,salesJourneyState=null,salesFunnelGeneration=0;
function clearSalesJourney(){
 salesJourneyGeneration++;salesJourneyState=null;
 $('journey-requirements').value='';$('journey-outcome').value='Not recorded';$('journey-slot').replaceChildren();$('journey-agreed').checked=false;
 $('journey-status').textContent='';$('sales-journey-message').textContent='';$('journey-proposal').removeAttribute('href');
 $('journey-booking').hidden=true;for(const node of $('journey-record-form').elements)node.disabled=true;
}
async function loadSalesJourney(entry){
 clearSalesJourney();const generation=salesJourneyGeneration,identity=csrf;
 $('journey-status').textContent='Loading demo record…';
 try{const state=await api('/api/admin/sales-journey?'+new URLSearchParams({reference:entry.reference}));
  if(!csrf||csrf!==identity||current!==entry||!$('editor').open||generation!==salesJourneyGeneration)return;
  salesJourneyState=state;$('journey-requirements').value=state.record.requirements;$('journey-outcome').value=state.record.outcome;
  const a=state.appointment;
  $('journey-status').textContent=a?'Demo: '+a.state+(a.starts?' · '+new Date(a.starts*1000).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST':'')+' · Outcome: '+state.record.outcome:'No demo appointment recorded.';
  for(const node of $('journey-record-form').elements)node.disabled=false;
  $('journey-slot').replaceChildren(text('option',state.slots.length?'Choose a customer-agreed time':'No available slots'));
  $('journey-slot').firstChild.value='';
  for(const slot of state.slots){const option=text('option',new Date(slot.starts*1000).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST · '+slot.duration+' minutes');option.value=slot.id;$('journey-slot').append(option);}
  $('journey-booking').hidden=!!a||['Won','Lost'].includes(state.workflow?.stage);$('journey-book-button').disabled=!state.slots.length;
  $('journey-proposal').href='/team-inbox/workspace/?'+new URLSearchParams({reference:entry.reference,title:(entry.details.interest+' project').slice(0,160)})+'#proposals';
  $('journey-proposal').textContent=state.projectExists?'Open project & draft proposal':'Create project & draft proposal';
 }catch(error){if(csrf===identity&&current===entry&&generation===salesJourneyGeneration)$('journey-status').textContent=error.message;}
}
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
 finally{if(csrf===identity&&current===entry&&$('editor').open){$('journey-record-button').disabled=!salesJourneyState;$('journey-reload').disabled=false;$('journey-book-button').disabled=!salesJourneyState?.slots.length;}}
}
$('journey-record-form').addEventListener('submit',event=>saveSalesJourney(event,'record'));
$('journey-booking').addEventListener('submit',event=>saveSalesJourney(event,'book'));
$('journey-reload').addEventListener('click',()=>{if(current)loadSalesJourney(current);});
$('editor').addEventListener('close',()=>{if(!$('editor').open)clearSalesJourney();});
$('editor').addEventListener('cancel',clearSalesJourney);
async function refreshSalesFunnel(identity){
 const generation=++salesFunnelGeneration,days=$('report-days').value;
 try{const r=await api('/api/admin/sales-funnel?days='+days);if(!csrf||csrf!==identity||generation!==salesFunnelGeneration||days!==$('report-days').value)return;
  const labels={enquiries:'Enquiries',demoBooked:'Demo booked',demoCompleted:'Demo completed',publishedProposals:'All published proposals',proposalAfterDemo:'Proposal after demo booking',wonAfterDemoProposal:'Won after demo & proposal',currentlyWon:'All currently Won'};
  $('sales-funnel-counts').replaceChildren(...Object.entries(r.counts).map(([key,value])=>{const card=text('div',labels[key],'count');card.append(text('strong',String(value)));return card;}));
  const rate=n=>n===null?'No denominator':n+'%';$('sales-funnel-rates').textContent='Enquiry → demo booking: '+rate(r.rates.enquiryToDemo)+' · Demo booking → published proposal: '+rate(r.rates.demoToProposal)+' · Published proposal after demo → recorded Won: '+rate(r.rates.proposalToWon);
  $('sales-funnel-basis').textContent=r.basis;
  const table=document.createElement('table');table.append(text('caption','US, UK and India sales performance · received-date cohort'));
  const head=document.createElement('thead'),headers=document.createElement('tr');
  for(const label of ['Business country','Enquiries','Reached Qualified','Demo booked','Demo completed','All published proposals','Proposal after demo','Currently Won','Demo / enquiry','Proposal / demo','Won / proposal after demo','Won / enquiry']){const cell=text('th',label);cell.scope='col';headers.append(cell);}head.append(headers);table.append(head);
  const body=document.createElement('tbody'),percent=value=>value===null?'—':value+'%';
  for(const market of r.markets||[]){const row=document.createElement('tr'),label=text('th',market.label);label.scope='row';row.append(label);const c=market.counts,rates=market.rates;for(const value of [c.enquiries,c.qualified,c.demoBooked,c.demoCompleted,c.publishedProposals,c.proposalAfterDemo,c.currentlyWon,percent(rates.enquiryToDemo),percent(rates.demoToProposal),percent(rates.proposalToWon),percent(rates.enquiryToWon)])row.append(text('td',String(value)));body.append(row);}table.append(body);
  $('market-sales-report').replaceChildren(table);$('market-sales-basis').textContent=r.marketBasis;
 }catch(error){if(csrf===identity&&generation===salesFunnelGeneration&&days===$('report-days').value)$('sales-funnel-basis').textContent=error.message;}
}

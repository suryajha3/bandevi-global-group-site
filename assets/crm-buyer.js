/* Fictional, page-memory-only workflow. No network calls, storage or real bookings. */
(() => {
 function bind(){
  const lab=document.querySelector('[data-crm-lab]');if(!lab||lab.dataset.bound)return;lab.dataset.bound='1';
  const markets={US:{name:'United States',currency:'USD',locale:'en-US',zone:'America/New_York',amount:1200},GB:{name:'United Kingdom',currency:'GBP',locale:'en-GB',zone:'Europe/London',amount:1000},IN:{name:'India',currency:'INR',locale:'en-IN',zone:'Asia/Kolkata',amount:60000}};
  const $=name=>lab.querySelector('[data-lab-'+name+']'),market=$('market'),owner=$('owner'),due=$('due'),action=$('action');
  let assigned='',followup=null,quoted=false;
  function format(){const m=markets[market.value];return new Intl.NumberFormat(m.locale,{style:'currency',currency:m.currency,currencyDisplay:'code',maximumFractionDigits:0}).format(m.amount);}
  function update(message){
   const m=markets[market.value];$('owner-summary').textContent=assigned||'Unassigned';
   $('followup-summary').textContent=followup?followup.action+' · '+followup.date+' · '+m.zone:'No follow-up set';
   $('stage').textContent=quoted?'Proposal':followup?'Follow-up planned':assigned?'Assigned':'New';
   $('quote-button').disabled=!assigned||!followup;
   $('followup-fields').disabled=!assigned;
   $('quote').hidden=!quoted;
   $('quote-amount').textContent=format();$('market-summary').textContent=m.name+' · '+m.currency;
   const step=quoted?4:followup?3:assigned?2:1;
   lab.querySelectorAll('[data-lab-step]').forEach(el=>{const n=Number(el.dataset.labStep);el.classList.toggle('is-complete',n<step);if(n===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
   $('progress').textContent=quoted?'Demo complete: an owner, next action and sample quote are ready.':'Step '+step+' of 3: '+(['assign the sample lead.','set the follow-up.','prepare the fictional quote.'][step-1]);
   if(message)$('status').textContent=message;
  }
  function reset(message){assigned='';followup=null;quoted=false;owner.value='';due.value='1';action.value='Confirm requirements';update(message);}
  owner.addEventListener('change',()=>{if(assigned&&owner.value!==assigned){assigned='';followup=null;quoted=false;update('Owner selection changed. Assign the lead again to review the next steps.');}});
  $('assign').addEventListener('click',()=>{if(!owner.value){$('status').textContent='Choose a sample consultant first.';owner.focus();return;}assigned=owner.value;followup=null;quoted=false;update('Sample lead assigned to '+assigned+'. Set the next action below.');});
  for(const field of [due,action])field.addEventListener('change',()=>{if(followup){followup=null;quoted=false;update('Follow-up selection changed. Save the sample follow-up again.');}});
  $('followup').addEventListener('click',()=>{
   if(!assigned)return;
   const m=markets[market.value],now=new Date(),parts=new Intl.DateTimeFormat('en-CA',{timeZone:m.zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),part=type=>Number(parts.find(p=>p.type===type).value);
   const day=new Date(Date.UTC(part('year'),part('month')-1,part('day')+Number(due.value),12));
   followup={action:action.value,date:new Intl.DateTimeFormat(m.locale,{timeZone:'UTC',year:'numeric',month:'short',day:'numeric'}).format(day)};quoted=false;update('Sample follow-up saved. Prepare the fictional quotation next.');
  });
  $('quote-button').addEventListener('click',()=>{if(!assigned||!followup)return;quoted=true;update('Fictional quotation prepared in '+markets[market.value].currency+'. Nothing has been sent.');const quote=$('quote');quote.tabIndex=-1;quote.scrollIntoView({block:'center',behavior:'instant'});quote.focus({preventScroll:true});});
  $('reset').addEventListener('click',()=>reset('Demo reset. All sample changes cleared.'));
  market.addEventListener('change',()=>reset('Demo market changed. Sample changes cleared; these amounts are independent examples, not currency conversions.'));
  $('controls').hidden=false;reset('Ready to try. Changes stay on this page and clear on reload.');
  const form=document.querySelector('#regional-enquiry form'),choice=form?.elements.crmPackage;
  if(choice){
   const note=document.querySelector('[data-package-status]');
   const showChoice=()=>{if(note)note.textContent=choice.value?'Starting scope selected: '+choice.options[choice.selectedIndex].text+'. Review the scope with our team.':'No starting scope selected. You can ask the team to help you choose.';};
   document.querySelectorAll('[data-crm-package]').forEach(link=>link.addEventListener('click',()=>{if(form.dataset.sending==='true')return;choice.value=link.dataset.crmPackage;form.querySelector('.enquiry-optional').open=true;choice.dispatchEvent(new Event('input',{bubbles:true}));showChoice();const target=[form.elements.name,form.elements.email,form.elements.message].find(field=>!field.value.trim())||form.elements.message;target.focus({preventScroll:true});}));
   choice.addEventListener('change',showChoice);form.addEventListener('reset',()=>queueMicrotask(showChoice));showChoice();
  }
 }
 // Deferred scripts run while readyState is interactive. The source renderer
 // may still run after this script, so bind again once rendering has finished.
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',bind,{once:true});
 bind();
})();

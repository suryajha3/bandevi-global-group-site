(() => {
 'use strict';const root=document.getElementById('travel-handover');if(!root)return;
 const option=root.querySelector('#travel-demo-option'),quote=root.querySelector('#travel-demo-quote'),accept=root.querySelector('#travel-demo-approved'),handover=root.querySelector('#travel-demo-handover'),detail=root.querySelector('#travel-demo-detail'),acceptance=root.querySelector('#travel-demo-acceptance'),tasks=root.querySelector('#travel-demo-tasks'),status=root.querySelector('#travel-demo-status'),reset=root.querySelector('#travel-demo-reset'),discuss=root.querySelector('#travel-demo-discuss');let stage=1;
 const finance=root.querySelector('#finance-controls'),waiting=root.querySelector('#finance-wait'),summary=root.querySelector('#finance-summary'),ledger=root.querySelector('#finance-ledger'),financeStatus=root.querySelector('#finance-status');
 let gross=0,pending=0,refunded=0,refundPending=0;
 const total=()=>option.value==='premium'?36000:24000,money=n=>'₹'+n.toLocaleString('en-IN');
 function renderFinance(){const net=gross-refunded,remaining=total()-net;summary.replaceChildren();for(const[label,value]of[['Booking amount',total()],['Received payments',gross],['Settled refunds',refunded],['Net received',net],['Remaining balance',remaining],['Pending payment',pending],['Pending refund',refundPending]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=money(value);summary.append(dt,dd);}root.querySelector('#finance-deposit').disabled=stage!==3||remaining-pending<6000;root.querySelector('#finance-pending').disabled=stage!==3||pending>0||remaining<=0;root.querySelector('#finance-settle').disabled=stage!==3||pending===0;root.querySelector('#finance-refund').disabled=stage!==3||net<3000||refundPending>0;root.querySelector('#finance-refund-settle').disabled=stage!==3||refundPending===0;}
 function resetFinance(){gross=pending=refunded=refundPending=0;ledger.replaceChildren();finance.hidden=stage!==3;waiting.hidden=stage===3;financeStatus.textContent='Fictional ledger reset. No payment is recorded.';renderFinance();}
 function record(message){const li=document.createElement('li');li.textContent=message;ledger.prepend(li);financeStatus.textContent=message;renderFinance();}
 root.querySelector('#finance-deposit').addEventListener('click',()=>{if(stage!==3||total()-(gross-refunded)-pending<6000)return;gross+=6000;record('Sample deposit marked received: '+money(6000)+'. No real transaction verified.');});
 root.querySelector('#finance-pending').addEventListener('click',()=>{const remaining=total()-(gross-refunded);if(stage!==3||pending||remaining<=0)return;pending=remaining;record('Sample payment pending: '+money(pending)+'. Net received has not changed.');});
 root.querySelector('#finance-settle').addEventListener('click',()=>{if(stage!==3||!pending)return;const amount=pending;gross+=amount;pending=0;record('Simulated payment settlement: '+money(amount)+'.');});
 root.querySelector('#finance-refund').addEventListener('click',()=>{if(stage!==3||gross-refunded<3000||refundPending)return;refundPending=3000;record('Sample refund requested: '+money(3000)+'. Net received has not changed.');});
 root.querySelector('#finance-refund-settle').addEventListener('click',()=>{if(stage!==3||!refundPending)return;const amount=refundPending;refunded+=amount;refundPending=0;record('Simulated refund settlement: '+money(amount)+'. Booking amount stays fixed.');});
 root.querySelector('#finance-reset').addEventListener('click',resetFinance);

 function clear(){stage=1;accept.checked=false;handover.disabled=true;acceptance.hidden=true;tasks.hidden=true;root.querySelectorAll('[data-travel-task]').forEach(t=>t.checked=false);detail.textContent='Choose an option and prepare the fictional quotation to see its summary.';status.textContent='Step 1 of 3: prepare a sample quotation.';discuss.href='/project-brief/?workflow=travel-crm';resetFinance();}
 quote.hidden=false;reset.hidden=false;resetFinance();
 option.addEventListener('change',clear);
 quote.addEventListener('click',()=>{clear();stage=2;const premium=option.value==='premium',price=premium?18000:12000;const p=document.createElement('p');p.textContent='Sample quotation Q-DEMO-01 · '+(premium?'Premium':'Standard')+' · 2 travellers × ₹'+price.toLocaleString('en-IN')+' = ₹'+(price*2).toLocaleString('en-IN')+'. Includes sample accommodation and airport transfers; excludes flights and taxes.';detail.replaceChildren(p);acceptance.hidden=false;status.textContent='Step 2 of 3: review the quotation and simulate customer acceptance.';discuss.href='/project-brief/?workflow=travel-handover';});
 accept.addEventListener('change',()=>{handover.disabled=!accept.checked;if(!accept.checked&&stage===3){stage=2;tasks.hidden=true;root.querySelectorAll('[data-travel-task]').forEach(t=>t.checked=false);status.textContent='Step 2 of 3: acceptance withdrawn; review the quotation again.';resetFinance();}});
 handover.addEventListener('click',()=>{if(stage!==2||!accept.checked)return;stage=3;tasks.hidden=false;resetFinance();status.textContent='Step 3 of 3: sample booking handed to operations. 0 of 3 checklist tasks reviewed.';});
 root.querySelectorAll('[data-travel-task]').forEach(t=>t.addEventListener('change',()=>{if(stage!==3)return;const count=root.querySelectorAll('[data-travel-task]:checked').length;status.textContent='Step 3 of 3: '+count+' of 3 checklist tasks reviewed.'+(count===3?' Sample walkthrough complete. No supplier booking or payment has been made.':'');}));
 reset.addEventListener('click',()=>{option.value='standard';clear();quote.focus();});
 function renderDashboard(){
  const count=root.querySelectorAll('[data-travel-task]:checked').length,net=gross-refunded,remaining=total()-net;
  root.querySelector('#dashboard-sales').textContent='TR-DEMO-01 · '+(stage===1?'quotation not prepared':('Q-DEMO-01 · '+money(total())+' · '+(accept.checked?'sample acceptance recorded':'awaiting sample acceptance')));
  root.querySelector('#dashboard-operations').textContent=stage===3?'BK-DEMO-01 · '+count+' of 3 tasks reviewed · '+(3-count)+' outstanding.':'Awaiting accepted quotation and handover.';
  root.querySelector('#dashboard-finance').textContent=stage===3?'Net received '+money(net)+' · remaining '+money(remaining)+' · pending payment '+money(pending)+' · pending refund '+money(refundPending)+' · settled refunds '+money(refunded)+'.':'Payment tracking unlocks after handover.';
  let message='Sales: prepare the sample quotation.',target='travel-demo-quote';
  if(stage===2){message=accept.checked?'Sales: create the sample booking handover.':'Sales: review the quotation and simulate customer acceptance.';target=accept.checked?'travel-demo-handover':'travel-demo-approved';}
  if(stage===3){
   if(refundPending){message='Finance: review the sample refund request before simulating settlement.';target='finance-refund-settle';}
   else if(pending){message='Finance: review the pending sample payment before simulating settlement.';target='finance-settle';}
   else if(count<3){message='Operations: review '+(3-count)+' outstanding sample checklist task'+(3-count===1?'':'s')+'.';target='travel-demo-tasks';}
   else if(remaining>0){message='Finance: review the remaining sample balance of '+money(remaining)+'.';target='travel-finance';}
   else{message='Sample review complete: checklist reviewed and balance settled. No real booking or transaction was made.';target='travel-demo-reset';}
  }
  root.querySelector('#dashboard-next').textContent=message;root.querySelector('#dashboard-action').href='#'+target;
 }
 root.addEventListener('click',renderDashboard);root.addEventListener('change',renderDashboard);renderDashboard();

})();

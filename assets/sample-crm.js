(() => {
 const board=document.getElementById('sample-board');if(!board)return;
 const lead=document.getElementById('sample-lead'),stage=document.getElementById('sample-stage'),status=document.getElementById('sample-status'),activity=document.getElementById('sample-activity');
 const initial=board.innerHTML;
 let guideStep=1,movedLead=null;
 const review=document.getElementById('guide-review'),progress=document.getElementById('guide-progress');
 function guide(step){guideStep=step;document.querySelectorAll('[data-guide-step]').forEach(el=>{const n=Number(el.dataset.guideStep);el.classList.toggle('guide-done',n<step);if(n===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});progress.textContent=step===1?'Step 1 of 3: choose a sample enquiry.':step===2?'Step 2 of 3: choose a different stage and update it.':step===3?'Step 3 of 3: review the updated card and next action.':'Walkthrough complete: you have tried all three steps.';document.getElementById('guide-complete').hidden=step!==4;}
 function clearHighlight(){board.querySelectorAll('.guide-highlight').forEach(el=>el.classList.remove('guide-highlight'));}
 document.getElementById('guide-choose').addEventListener('click',()=>{guide(2);document.getElementById('sample-update').scrollIntoView({block:'start'});lead.focus({preventScroll:true});});
 stage.addEventListener('change',()=>{if(guideStep<3)guide(2);});
 review.addEventListener('click',()=>{if(!movedLead)return;const card=board.querySelector('[data-lead="'+movedLead+'"]');clearHighlight();card.classList.add('guide-highlight');card.setAttribute('tabindex','-1');guide(4);card.scrollIntoView({block:'center'});card.focus({preventScroll:true});});
 document.getElementById('guide-actions').hidden=false;guide(1);

 const tasks={New:'Clarify the requirements.',Contacted:'Confirm the workflow and next discussion.',Proposal:'Review the proposed scope.'};
 function counts(){board.querySelectorAll('[data-stage]').forEach(col=>{const count=col.querySelectorAll('[data-lead]').length;board.querySelector('[data-count="'+col.dataset.stage+'"]').textContent=count;col.querySelector('.sample-empty')?.remove();if(!count){const p=document.createElement('p');p.className='sample-empty';p.textContent='No sample enquiries in this stage.';col.append(p);}});}
 function selectedStage(){stage.value=board.querySelector('[data-lead="'+lead.value+'"]').parentElement.dataset.stage;}
 lead.addEventListener('change',()=>{selectedStage();if(guideStep<3)guide(2);});
 document.getElementById('sample-move').addEventListener('click',()=>{const card=board.querySelector('[data-lead="'+lead.value+'"]'),previous=card.parentElement.dataset.stage,name=card.querySelector('h4').textContent;if(previous===stage.value){status.textContent=name+' is already in '+stage.value+'. Choose a different stage.';return;}board.querySelector('[data-stage="'+stage.value+'"]').append(card);card.querySelector('p:last-child').replaceChildren();const strong=document.createElement('strong');strong.textContent='Next action: ';card.querySelector('p:last-child').append(strong,document.createTextNode(tasks[stage.value]));counts();clearHighlight();movedLead=lead.value;review.disabled=false;guide(3);const message=name+' moved from '+previous+' to '+stage.value+'.';status.textContent=message;const item=document.createElement('li');item.textContent=message;activity.prepend(item);while(activity.children.length>6)activity.lastElementChild.remove();});
 document.getElementById('sample-reset').addEventListener('click',()=>{board.innerHTML=initial;movedLead=null;review.disabled=true;guide(1);lead.value='1';selectedStage();activity.replaceChildren();const li=document.createElement('li');li.textContent='Sample enquiries loaded.';activity.append(li);status.textContent='Sample reset. All enquiries restored to their starting stages.';});
 document.getElementById('sample-reset').hidden=false;document.getElementById('sample-update').hidden=false;selectedStage();
})();
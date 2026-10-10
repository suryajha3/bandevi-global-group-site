'use strict';
const channelLabels={organic_search:'Organic search',paid:'Paid',campaign:'Tagged campaign',referral:'Referral',direct_unknown:'Direct / unknown',unknown:'Not recorded'};
const $=id=>document.getElementById(id), stages=['New','Contacted','Qualified','Proposal','Won','Lost'];
let preferenceUser='',savedViews=[];
let activityKey='',activityGeneration=0;
let csrf='',offset=0,total=0,current=null,loading=false,reloadPending=false,businessDate='',viewerRole='agent',view='inbox';
function text(tag,value,className){const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;}
function loggedOut(message=''){clearReply();preferenceUser='';savedViews=[];$('saved-view').replaceChildren(text('option','Choose a view'));$('view-name').value='';$('view-message').textContent='';$('delete-view').disabled=true;$('delete-view').hidden=true;$('inbox-summary').open=false;$('summary-heading').textContent='Pipeline summary';activityGeneration++;$('activity-list').replaceChildren();$('activity-body').value='';$('activity-message').textContent='';$('next-action').value='';csrf='';reloadPending=false;current=null;$('editor').close();$('entries').replaceChildren();$('details').replaceChildren();$('counts').replaceChildren();for(const id of ['seo-counts','channel-report','landing-report','service-report','pipeline-report'])$(id).replaceChildren();$('editor-heading').textContent='';$('editor-reference').textContent='';$('customer-message').textContent='';$('brief-panel').hidden=true;$('brief-details').replaceChildren();$('proposal-summary').value='';$('copy-message').textContent='';$('owner').value='';$('notes').value='';$('follow-up-date').value='';$('followup-counts').replaceChildren();$('staff-password').value='';$('staff-email').value='';$('staff-name').value='';for(const id of ['team-list','slot-list','operations-status','conversion-table','won-value'])$(id).replaceChildren();$('workspace').hidden=true;$('workspace-nav').hidden=true;$('dashboard-main').classList.remove('signed-in');view='inbox';$('logout').hidden=true;$('login').hidden=false;$('login-message').textContent=message;}
async function api(url,options={}){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{const response=await fetch(url,{credentials:'same-origin',cache:'no-store',signal:controller.signal,...options});const result=await response.json();if(!response.ok){if(response.status===401&&url!=='/api/admin/login')loggedOut(result.error);throw Error(result.error||'Unable to complete this action.');}return result;}finally{clearTimeout(timer);}}
function post(url,body){return api(url,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify(body)});}
function date(timestamp){return new Date(timestamp*1000).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});}
function setView(next,focus=false){
 if(!['inbox','reports','demos','settings'].includes(next)||viewerRole==='agent'&&['demos','settings'].includes(next))next='inbox';
 view=next;
 for(const panel of document.querySelectorAll('[data-panel]'))panel.hidden=panel.dataset.panel!==next;
 for(const button of document.querySelectorAll('[data-view]')){if(button.dataset.view===next)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}
 const headings={inbox:['Enquiry inbox','Review, assign and move the next conversation forward.'],reports:['Sales reports','Review enquiry sources, recorded milestones and won project values.'],demos:['Demo availability','Publish supported times and review scheduled appointments.'],settings:['Workspace settings','Manage team access, notification delivery and verified recovery.']};
 $('workspace-heading').textContent=headings[next][0];$('workspace-intro').textContent=headings[next][1];
 if(focus)$('workspace-heading').focus({preventScroll:true});
}
function chooseFilter(kind,value){
 $('saved-view').value='';$('delete-view').disabled=true;$('delete-view').hidden=true;$('assigned-filter').value='';$('search').value='';$('channel-filter').value='';$('stage-filter').value=kind==='stage'?value:'';$('followup-filter').value=kind==='followup'?value:'';offset=0;setView('inbox');load();
}
function counter(label,count,kind,value){
 const node=text('button','','count');node.type='button';node.dataset.filterKind=kind;node.dataset.filterValue=value;node.setAttribute('aria-label',label+': '+count+' '+(kind==='stage'?'enquiries':'active follow-ups'));node.setAttribute('aria-pressed',String((kind==='stage'?$('stage-filter'):$('followup-filter')).value===value));node.append(text('span',label),text('strong',String(count)));node.addEventListener('click',()=>chooseFilter(kind,value));return node;
}
function entryAction(label,entry,target){const node=text('button',label);node.type='button';node.addEventListener('click',()=>edit(entry,target));return node;}
async function load(){
 if(loading){reloadPending=true;return;}loading=true;const requestIdentity=csrf;$('refresh').disabled=true;$('inbox-message').textContent='Loading enquiries…';
 try{
  const query=new URLSearchParams({q:$('search').value.trim(),stage:$('stage-filter').value,offset:String(offset),channel:$('channel-filter').value,followup:$('followup-filter').value,assigned:$('assigned-filter').value});
  const [result,report]=await Promise.all([api('/api/admin/enquiries?'+query),api('/api/admin/attribution?days='+$('report-days').value)]);
  if(!csrf||csrf!==requestIdentity)return;renderSourceReport(report);businessDate=result.businessDate||'';
  $('followup-counts').replaceChildren(...[['Overdue','overdue'],['Due today','today'],['Next 7 days','upcoming'],['Unassigned','unassigned']].map(([label,key])=>counter(label,result.followups?.[key]||0,'followup',key)));
  $('attention-action').textContent='Needs attention ('+(result.followups?.attention||0)+')';$('attention-action').setAttribute('aria-pressed',String($('followup-filter').value==='attention'));$('summary-heading').textContent='Pipeline summary · '+stages.filter(s=>!['Won','Lost'].includes(s)).reduce((n,s)=>n+(result.counts[s]||0),0)+' active · '+(result.followups?.attention||0)+' need attention';total=result.total;$('entries').replaceChildren();$('counts').replaceChildren(...stages.map(stage=>counter(stage,result.counts[stage],'stage',stage)));
  $('mail-status').textContent=result.emailConfigured?'Email sender configured · Check each enquiry for notification delivery status.':'Email sender needs setup · Enquiries remain safely saved in this inbox.';$('mail-status').classList.toggle('connected',result.emailConfigured);
  $('total').textContent=total+' matching '+(total===1?'request':'requests');
  for(const entry of result.items){
   const card=document.createElement('article');card.className='entry';card.dataset.reference=entry.reference;const summary=document.createElement('div');
   const name=text('h3',''),open=entryAction(entry.details.name,entry,'');open.className='entry-open';name.append(open);
   summary.append(text('p',channelLabels[entry.details.attribution?.channel]||'Not recorded','small'),name,text('p',entry.details.interest),text('p',entry.reference+' · '+entry.details.email),text('p',entry.owner?'Owner: '+entry.owner:'No owner assigned'));
   if(entry.details.projectBrief){summary.append(text('p','Budget preference: '+entry.details.projectBrief.budget),text('p','Preferred launch: '+(entry.details.projectBrief.launchDate||'Still planning')));}else if(entry.details.source==='/project-brief/'){summary.append(text('p','Project brief in customer message','small'));}
   if(entry.attentionReasons?.length)summary.append(text('p',entry.attentionReasons.join(' · '),'attention-reasons'));
   summary.append(text('p','Next action: '+(entry.nextAction||'Not set')));
   if(entry.followUpDate){const overdue=!['Won','Lost'].includes(entry.stage)&&entry.followUpDate<businessDate;summary.append(text('p',(overdue?'Overdue · ':'Next follow-up: ')+entry.followUpDate,overdue?'overdue':'small'));}
   const aside=document.createElement('aside');aside.append(text('span',entry.stage,'stage'),text('time',date(entry.created)));const actions=document.createElement('div');actions.className='entry-actions';actions.append(entryAction('Open',entry,''));
   if(viewerRole!=='agent')actions.append(entryAction('Assign owner',entry,'owner'));
   actions.append(entryAction('Reply draft',entry,'reply-template'),entryAction('Follow-up',entry,'follow-up-date'));const project=text('a','Project / proposal');project.href='/team-inbox/workspace/?'+new URLSearchParams({reference:entry.reference,title:(entry.details.interest+' project').slice(0,160)})+'#proposals';actions.append(project);aside.append(actions);card.append(summary,aside);$('entries').append(card);
  }
  if(!result.items.length)$('entries').append(text('p',total?'No requests on this page. Go back to the previous page.':'No enquiries match these filters.','empty'));
  $('previous').disabled=offset===0;$('next').disabled=offset+50>=total;$('page-label').textContent=total?Math.min(offset+1,total)+'–'+Math.min(offset+50,total)+' of '+total:'0 requests';$('inbox-message').textContent='';await refreshOperations();
 }catch(error){$('inbox-message').textContent=error.name==='AbortError'?'Loading timed out. Try refreshing.':error.message;}
 finally{loading=false;$('refresh').disabled=false;if(reloadPending&&csrf){reloadPending=false;load();}}
}
function edit(entry,target=''){current=entry;$('editor-heading').textContent=entry.details.name;$('editor-reference').textContent=entry.reference+' · '+date(entry.created);$('details').replaceChildren();for(const [label,value]of [['Email',entry.details.email],['Phone',entry.details.phone],['Service',entry.details.interest],['Request type',entry.details.type],['Preferred demo time',entry.details.demoSchedule?entry.details.demoSchedule.date+' at '+entry.details.demoSchedule.time+' IST (UTC+05:30) — awaiting team confirmation':''],['Source',entry.details.source],['Campaign',entry.details.campaign],['Acquisition',channelLabels[entry.details.attribution?.channel]||'Not recorded'],['Landing page',entry.details.attribution?.landing_page],['Referring domain',entry.details.attribution?.referrer_domain],['Notification',entry.emailStatus],['Last workflow update',entry.updated?date(entry.updated):'Not yet updated']]){if(value)$('details').append(text('dt',label),text('dd',value));}$('deal-value').value=entry.deal?String(entry.deal.minor_units/100):'';$('deal-currency').value=entry.deal?.currency||'INR';renderBrief(entry);$('customer-message').textContent=entry.details.message;$('edit-stage').value=entry.stage;$('owner').value=entry.owner;$('notes').value=entry.notes;$('follow-up-date').value=entry.followUpDate||'';$('next-action').value=entry.nextAction||'';$('activity-body').value='';$('activity-message').textContent='';activityKey=crypto.randomUUID();loadActivity(entry);$('save-message').textContent='';clearReply();generateReply(entry);$('reply-panel').open=target==='reply-template';$('editor').showModal();if(target)$(target).focus();}


function renderBrief(entry){
 const brief=entry.details.projectBrief,legacy=!brief&&entry.details.source==='/project-brief/';$('brief-panel').hidden=!brief&&!legacy;$('brief-details').replaceChildren();$('proposal-summary').value='';$('copy-message').textContent='';if(!brief&&!legacy)return;
 $('brief-record-status').textContent=brief?'Structured customer brief. Owner and next follow-up can be set below.':'Earlier brief: structured fields were not collected. Review the original customer message; no budget or date has been inferred.';
 const fields=brief?[['Service',brief.service],['Business type',brief.businessType||'Not specified'],['Business problem',brief.problem],['Features / integrations',brief.features||'To discuss'],['Budget preference (INR)',brief.budget],['Preferred launch date',brief.launchDate||'Still planning']]:[];
 for(const [label,value]of fields)$('brief-details').append(text('dt',label),text('dd',value));
 $('proposal-summary').value='Project brief — '+entry.reference+'\n'+(brief?fields.map(([label,value])=>label+': '+value).join('\n'):entry.details.message)+'\nPlanning preferences only; scope, costs and delivery remain to be agreed.';
}
$('copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('proposal-summary').value);$('copy-message').textContent='Brief summary copied.';}catch(_){$('proposal-summary').focus();$('proposal-summary').select();$('copy-message').textContent='Clipboard access is unavailable. The summary is selected; copy it manually.';}});

function renderSourceReport(report){
 $('seo-counts').replaceChildren(...[['Saved enquiries',report.enquiries],['Organic enquiries',report.channels.organic_search],['Organic proposals',report.organicStages.Proposal],['Organic won',report.organicStages.Won]].map(([label,count])=>{const el=text('div','','count');el.append(text('span',label),text('strong',String(count)));return el;}));
 function rows(id,items){$(id).replaceChildren(...items.map(([label,value])=>{const el=text('p','','report-row');el.append(text('span',label),text('strong',String(value)));return el;}));if(!items.length)$(id).append(text('p','No enquiries in this period.','small'));}
 const table=document.createElement('table'),caption=text('caption','Current sales stage by enquiry source'),head=document.createElement('thead'),heading=document.createElement('tr');
 for(const label of ['Source',...stages]){const cell=text('th',label);cell.scope='col';heading.append(cell);}head.append(heading);table.append(caption,head);
 const body=document.createElement('tbody');for(const [channel,counts]of Object.entries(report.channelStages||{})){const row=document.createElement('tr'),label=text('th',channelLabels[channel]);label.scope='row';row.append(label);for(const stage of stages)row.append(text('td',String(counts[stage]||0)));body.append(row);}table.append(body);$('pipeline-report').replaceChildren(table);
 rows('channel-report',Object.entries(report.channels).map(([key,n])=>[channelLabels[key],n]));
 rows('landing-report',report.organicLandingPages.map(item=>[item.page,item.enquiries]));
 rows('service-report',report.services.map(item=>[item.service,item.enquiries+' total / '+item.organic+' organic']));
}

async function showInbox(identity){initPersonalViews(identity.user);$('inbox-summary').open=false;for(const id of ['search','stage-filter','channel-filter','followup-filter','assigned-filter'])$(id).value='';viewerRole=identity.role||'agent';$('workspace-nav').hidden=false;$('dashboard-main').classList.add('signed-in');$('nav-demos').hidden=viewerRole==='agent';$('nav-settings').hidden=viewerRole==='agent';setView('inbox');$('login').hidden=true;$('workspace').hidden=false;$('logout').hidden=false;$('password').value='';offset=0;await load(); }
$('login-form').addEventListener('submit',async event=>{event.preventDefault();const button=event.submitter;button.disabled=true;$('login-message').textContent='Signing in…';try{const result=await post('/api/admin/login',{email:$('email').value,password:$('password').value});csrf=result.csrf;await showInbox(result);}catch(error){$('login-message').textContent=error.name==='AbortError'?'Sign-in timed out. Please try again.':error.message;}finally{button.disabled=false;$('password').value='';}});
$('workflow').addEventListener('submit',async event=>{event.preventDefault();if(!current)return;const identity=csrf,entry=current,button=event.submitter;button.disabled=true;$('save-message').textContent='Saving…';try{const result=await post('/api/admin/update',{reference:current.reference,stage:$('edit-stage').value,owner:$('owner').value,notes:$('notes').value,followUpDate:$('follow-up-date').value,nextAction:$('next-action').value,version:current.version,...($('deal-value').value!==''?{dealValue:$('deal-value').value,currency:$('deal-currency').value}:{})});if(csrf!==identity||current!==entry)return;current.version=result.version;$('save-message').textContent='Follow-up saved.';loadActivity(current);await load();}catch(error){if(csrf!==identity||current!==entry)return;$('save-message').textContent=error.name==='AbortError'?'Unable to confirm the save. Refresh before retrying; your notes are retained here.':error.message;}finally{button.disabled=false;}});
$('filters').addEventListener('submit',event=>{event.preventDefault();$('saved-view').value='';$('delete-view').disabled=true;$('delete-view').hidden=true;offset=0;load();});$('refresh').addEventListener('click',()=>load());$('report-days').addEventListener('change',()=>load());$('previous').addEventListener('click',()=>{offset=Math.max(0,offset-50);load();});$('next').addEventListener('click',()=>{offset+=50;load();});$('close-editor').addEventListener('click',()=>{clearReply();$('editor').close();});$('logout').addEventListener('click',async()=>{try{await post('/api/admin/logout',{});loggedOut('You are signed out.');}catch(error){$('inbox-message').textContent=error.message;}});
(async()=>{try{const state=await api('/api/admin/session');if(state.authenticated){csrf=state.csrf;await showInbox(state);}else if(!state.configured){$('login-message').textContent='Dashboard access needs to be set up by the site owner.';$('login-form').hidden=true;}}catch(error){$('login-message').textContent='The inbox is temporarily unavailable. Please try again.';}})();

for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>setView(button.dataset.view,true));
$('clear-filters').addEventListener('click',()=>chooseFilter('stage',''));
$('today-action').addEventListener('click',()=>chooseFilter('followup','today'));

$('clear-filter-form').addEventListener('click',()=>chooseFilter('stage',''));
const compactInbox=matchMedia('(max-width:760px)');function adjustFilters(){ $('filter-tools').open=!compactInbox.matches;}adjustFilters();compactInbox.addEventListener('change',adjustFilters);

$('attention-action').addEventListener('click',()=>chooseFilter('followup','attention'));
const activityLabels={'received':'Received','workflow':'Workflow updated','proposal':'Proposal','note':'Note','call-connected':'Call connected','call-no-answer':'Call — no answer','call-voicemail':'Call — voicemail','email-sent':'Email sent (staff reported)'};
async function loadActivity(entry){
 const generation=++activityGeneration,identity=csrf,reference=entry.reference;$('activity-list').replaceChildren(text('p','Loading activity…','small'));
 try{const result=await api('/api/admin/activity?'+new URLSearchParams({reference}));if(!csrf||csrf!==identity||generation!==activityGeneration||current?.reference!==reference)return;
 $('activity-list').replaceChildren(...result.items.map(item=>{const node=document.createElement('article');node.className='activity-event';node.append(text('strong',activityLabels[item.kind]||item.kind),text('p',date(item.created)+' · '+item.actor,'small'),text('p',item.body));return node;}));
 }catch(error){if(csrf===identity&&generation===activityGeneration)$('activity-list').replaceChildren(text('p',error.message,'small'));}
}
$('activity-form').addEventListener('submit',async event=>{
 event.preventDefault();if(!current)return;const identity=csrf,reference=current.reference,button=event.submitter;button.disabled=true;$('activity-message').textContent='Saving activity…';
 try{await post('/api/admin/activity',{reference,id:activityKey,kind:$('activity-kind').value,body:$('activity-body').value});if(!csrf||identity!==csrf||current?.reference!==reference)return;$('activity-body').value='';activityKey=crypto.randomUUID();$('activity-message').textContent='Activity recorded.';await loadActivity(current);
 }catch(error){if(csrf===identity&&current?.reference===reference)$('activity-message').textContent=error.message;}finally{button.disabled=false;}
});

function preferenceKey(){return 'bg-inbox-views-v1:'+encodeURIComponent(preferenceUser);}
function validView(item){
 return item&&typeof item.id==='string'&&/^custom:[a-f0-9-]{36}$/.test(item.id)&&typeof item.name==='string'&&item.name.trim().length>0&&item.name.length<=40&&item.filters&&['','me'].includes(item.filters.assigned)&&['',...stages].includes(item.filters.stage)&&['',...Object.keys(channelLabels)].includes(item.filters.channel)&&['','overdue','today','upcoming','unscheduled','attention','unassigned'].includes(item.filters.followup);
}
function renderViews(selected=''){
 const choices=[['','Choose a view'],['system:mine','My leads'],['system:today','Due today'],['system:attention','Needs attention'],...savedViews.map(v=>[v.id,v.name])];
 $('saved-view').replaceChildren(...choices.map(([value,label])=>{const o=text('option',label);o.value=value;return o;}));$('saved-view').value=selected;$('delete-view').disabled=!savedViews.some(v=>v.id===selected);$('delete-view').hidden=$('delete-view').disabled;
}
function initPersonalViews(user){
 preferenceUser=user.toLowerCase();savedViews=[];$('view-message').textContent='';$('view-name').value='';
 try{const raw=localStorage.getItem(preferenceKey());if(raw){const data=JSON.parse(raw);if(!Array.isArray(data)||data.length>8||!data.every(validView)||new Set(data.map(v=>v.id)).size!==data.length)throw Error();savedViews=data.map(v=>({id:v.id,name:v.name,filters:{stage:v.filters.stage,channel:v.filters.channel,followup:v.filters.followup,assigned:v.filters.assigned}}));}}
 catch(_){$('view-message').textContent='Saved views could not be loaded. Quick views are still available.';}renderViews();
}
function storeViews(next,selected){
 try{localStorage.setItem(preferenceKey(),JSON.stringify(next));savedViews=next;renderViews(selected);return true;}
 catch(_){$('view-message').textContent='Browser storage is unavailable. Your filters still work, but the view was not saved.';return false;}
}
$('saved-view').addEventListener('change',()=>{
 const id=$('saved-view').value;if(!id)return;$('view-message').textContent='';const builtins={'system:mine':{assigned:'me'},'system:today':{followup:'today'},'system:attention':{followup:'attention'}},filters=builtins[id]||savedViews.find(v=>v.id===id)?.filters;if(!filters)return;
 $('search').value='';for(const [key,node]of Object.entries({stage:'stage-filter',channel:'channel-filter',followup:'followup-filter',assigned:'assigned-filter'}))$(node).value=filters[key]||'';
 $('delete-view').disabled=!savedViews.some(v=>v.id===id);$('delete-view').hidden=$('delete-view').disabled;offset=0;setView('inbox');load();
});
$('save-view-form').addEventListener('submit',event=>{
 event.preventDefault();if(!csrf||!preferenceUser)return;const name=$('view-name').value.trim();if(!name||name.length>40)return;
 const existing=savedViews.find(v=>v.name.toLowerCase()===name.toLowerCase());if(!existing&&savedViews.length>=8){$('view-message').textContent='Eight views are already saved. Delete a view or reuse its name to update it.';return;}
 const item={id:existing?.id||'custom:'+crypto.randomUUID(),name,filters:{stage:$('stage-filter').value,channel:$('channel-filter').value,followup:$('followup-filter').value,assigned:$('assigned-filter').value}};
 const next=savedViews.filter(v=>v.id!==item.id).concat(item);if(storeViews(next,item.id)){$('view-message').textContent='View saved for your account on this browser. Search text was not stored.';$('view-name').value='';}
});
$('delete-view').addEventListener('click',()=>{if(!csrf||!preferenceUser)return;const id=$('saved-view').value;if(!savedViews.some(v=>v.id===id))return;if(storeViews(savedViews.filter(v=>v.id!==id),''))$('view-message').textContent='Saved view deleted. Current filters are unchanged.';});

function clearReply(resetTemplate=true){if(resetTemplate)$('reply-template').value='first';$('reply-reviewed').disabled=false;for(const id of ['reply-to','reply-subject','reply-body','reply-copy-buffer'])$(id).value='';$('reply-reviewed').checked=false;$('copy-reply').disabled=true;$('reply-message').textContent='';$('reply-fallback').hidden=true;}
function invalidateReply(){$('reply-reviewed').checked=false;$('copy-reply').disabled=true;$('reply-message').textContent='';$('reply-copy-buffer').value='';$('reply-fallback').hidden=true;}
function generateReply(entry){
 clearReply(false);const oneLine=value=>String(value||'').replace(/[\r\n]+/g,' ').trim(),name=oneLine(entry.details.name),service=oneLine(entry.details.interest),reference=oneLine(entry.reference),hello='Hello '+name+',\n\n',signoff='\n\nKind regards,\nBandevi Global Group';
 const drafts={first:['Your enquiry · '+reference,'Thank you for contacting Bandevi Global Group about '+service+'. Could you share your main requirements and preferred time for a conversation? We can then discuss suitable next steps.'],demo:['Arrange a demo · '+reference,'We would be happy to arrange a demo to discuss '+service+'. Please reply with a preferred date, time and timezone. Our team will confirm availability and joining details before the appointment.'],followup:['Following up · '+reference,'I am following up on your enquiry about '+service+'. Please let us know if you have any questions or would like to discuss the next steps.'],proposal:['Proposal next steps · '+reference,'Regarding your '+service+' enquiry, please let us know which scope, commercial terms or next steps you would like to discuss. We can prepare or update a proposal once the requirements are confirmed.']};
 const draft=drafts[$('reply-template').value]||drafts.first;$('reply-to').value=entry.details.email;$('reply-subject').value=draft[0];$('reply-body').value=hello+draft[1]+signoff;
}
$('generate-reply').addEventListener('click',()=>{if(current)generateReply(current);});
for(const id of ['reply-subject','reply-body'])$(id).addEventListener('input',invalidateReply);
$('reply-template').addEventListener('change',()=>{invalidateReply();$('reply-reviewed').disabled=true;$('reply-message').textContent='Click Replace draft to apply the selected template. Your current edits are retained until then.';});
$('reply-reviewed').addEventListener('change',()=>{$('copy-reply').disabled=!$('reply-reviewed').checked||!$('reply-subject').value.trim()||!$('reply-body').value.trim();});
$('copy-reply').addEventListener('click',async()=>{
 if(!current||!csrf||$('reply-reviewed').disabled||!$('reply-reviewed').checked||!$('reply-subject').value.trim()||!$('reply-body').value.trim())return;const identity=csrf,entry=current,draft='To: '+$('reply-to').value+'\nSubject: '+$('reply-subject').value+'\n\n'+$('reply-body').value;
 try{await navigator.clipboard.writeText(draft);if(csrf===identity&&current===entry&&$('editor').open)$('reply-message').textContent='Reviewed draft copied. Send it from your email app when ready.';}
 catch(_){if(csrf!==identity||current!==entry||!$('editor').open)return;$('reply-fallback').hidden=false;$('reply-copy-buffer').value=draft;$('reply-copy-buffer').focus();$('reply-copy-buffer').select();$('reply-message').textContent='Clipboard access is unavailable. The reviewed draft is selected for manual copying.';}
});
$('editor').addEventListener('close',()=>{if(!$('editor').open)clearReply();});
$('editor').addEventListener('cancel',()=>clearReply());

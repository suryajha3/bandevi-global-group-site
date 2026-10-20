/* A private capability links a saved enquiry to one published demo slot. */
(() => {
 'use strict';
 if(!location.hash.startsWith('#review.'))return;
 const token=location.hash.slice(1),main=document.getElementById('booking-manager');
 const node=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};
 main.replaceChildren();const home=node('a','BANDEVI GLOBAL GROUP');home.href='/';
 const heading=node('h1','Book your demo review'),status=node('p','Loading your saved enquiry…');status.id='booking-status';status.role='status';status.tabIndex=-1;
 const context=node('p'),controls=node('div'),result=node('div');
 main.append(home,heading,status,context,controls,result);
 const help=node('p','Your enquiry is already saved. Keep this private link safe: anyone with it can reserve a review. Joining details are sent separately by the team.');
 const contact=node('a','Contact sales');contact.href='mailto:sales@bandeviglobalgroup.com';main.append(help,contact);
 let busy=false,slots=[],select,zone,book;
 async function api(action,slotId){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const response=await fetch('/api/demo/handoff',{method:'POST',credentials:'same-origin',cache:'no-store',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({token,action,slotId})});const data=await response.json();if(!response.ok)throw Error(data.error||'Please try again.');return data;}catch(error){if(error.name==='AbortError')throw Error('The booking check timed out. Refresh to check whether your reservation was saved.');throw error;}finally{clearTimeout(timer);}}
 function choices(){const selected=select.value;select.replaceChildren(new Option('Choose an available time',''));for(const slot of slots)select.add(new Option(window.BandeviDemoTime.label(slot),slot.id));select.value=selected;book.disabled=!select.value||busy;}
 function render(data){
  context.textContent='Enquiry '+data.reference+' · '+data.service+' · Business country: '+data.country+(data.currency?' · Quote preference: '+data.currency:'');
  controls.replaceChildren();result.replaceChildren();
  if(data.appointment){
   const appt=data.appointment;status.textContent=appt.confirmed?'Your demo review is confirmed.':'Your previous appointment is cancelled.';
   if(appt.confirmed){zone=window.BandeviDemoTime.zoneChoice(result);const time=node('p');const update=()=>time.textContent=window.BandeviDemoTime.label(appt);zone.addEventListener('change',update);update();result.append(time);}
   if(appt.manageUrl&&/^\/demo-booking\/#\w{40,100}$/.test(appt.manageUrl)){const manage=node('a','Manage appointment or add to calendar');manage.href=appt.manageUrl;manage.className='button dark';result.append(manage);}else result.append(node('p','Use the private management link in your confirmation email, or contact the team.'));
   return;
  }
  if(data.closed){status.textContent='This enquiry is closed. Contact the team to discuss another review.';return;}
  slots=data.slots||[];status.textContent=slots.length?'Choose a time, then confirm your reservation.':'No demo times are published right now. Your enquiry is saved; a meeting is not yet confirmed. Contact the team to arrange a time.';
  if(slots.length){
   zone=window.BandeviDemoTime.zoneChoice(controls);const label=node('label','Available demo times');select=node('select');select.id='review-slot';label.htmlFor=select.id;
   book=node('button','Confirm demo booking');book.type='button';book.className='button dark';book.disabled=true;controls.append(label,select,book);choices();zone.addEventListener('change',choices);select.addEventListener('change',()=>book.disabled=!select.value||busy);
   book.addEventListener('click',async()=>{if(busy||!select.value)return;busy=true;book.disabled=true;status.textContent='Reserving your time…';try{render(await api('book',select.value));status.focus();}catch(error){status.textContent=error.message+' Your enquiry remains saved. Refresh times to check the latest availability.';status.focus();book.disabled=false;}finally{busy=false;}});
  }
  const refresh=node('button','Refresh available times');refresh.type='button';refresh.addEventListener('click',load);controls.append(refresh);
 }
 async function load(){if(busy)return;busy=true;controls.replaceChildren();status.textContent='Checking available times…';try{render(await api('view'));}catch(error){status.textContent=error.message;const retry=node('button','Try again');retry.type='button';retry.addEventListener('click',load);controls.append(retry);}finally{busy=false;if(select&&book)book.disabled=!select.value;}}
 // Hash links stay out of request URLs and referrers; no analytics run on this page.
 window.addEventListener('hashchange',()=>location.reload());load();
})();

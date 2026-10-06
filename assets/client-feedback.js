(() => {
 'use strict';
 const form=document.querySelector('[data-feedback-draft]'); if(!form)return;
 const projects={trip_sarathi:'Trip Sarathi',maximtrip:'MaximTrip',tripodeal:'TripOdeal'};
 const key=new URL(location.href).searchParams.get('project');
 if(Object.prototype.hasOwnProperty.call(projects,key)){form.elements.project.value=projects[key];form.elements.service.value='Travel technology';}
 const note=form.querySelector('[aria-live]');
 form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;
 const fields=[['name','Name'],['role','Role'],['company','Company'],['email','Verification email (private)'],['service','Service received'],['project','Project reference'],['scope','Work received'],['feedback','Feedback'],['approval','Publication permission']];
 const text=['BANDEVI client feedback draft',...fields.map(([key,label])=>label+': '+form.elements[key].value.trim()),'Contributor confirms genuine experience and authority to share.','Please review the final wording with me before publication.'].join('\n');
 note.replaceChildren();const heading=document.createElement('p');heading.textContent='Review your draft below. Nothing has been sent or published.';const preview=document.createElement('pre');preview.textContent=text;preview.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font:inherit';
 const email=document.createElement('a');email.textContent='Send draft by email';email.href='mailto:sales@bandeviglobalgroup.com?subject='+encodeURIComponent('Client feedback for '+form.elements.project.value.trim())+'&body='+encodeURIComponent(text);
 const whatsapp=document.createElement('a');whatsapp.textContent='Send draft on WhatsApp';whatsapp.href='https://wa.me/918287669022?text='+encodeURIComponent(text);whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';
 note.append(heading,preview,email,document.createTextNode(' · '),whatsapp);
 });
 form.addEventListener('input',()=>note.replaceChildren());
})();

(() => {
 'use strict';
 function init(){
 const form=document.querySelector('[data-feedback-draft]');if(!form)return false;if(form.dataset.feedbackBound)return true;form.dataset.feedbackBound='true';
 const projects={trip_sarathi:'Trip Sarathi',maximtrip:'MaximTrip',tripodeal:'TripOdeal'};
 const key=new URL(location.href).searchParams.get('project');
 if(Object.prototype.hasOwnProperty.call(projects,key)){form.elements.project.value=projects[key];form.elements.service.value='Travel technology';}
 const note=form.querySelector('[aria-live]');let downloadURL;
 function clear(){if(downloadURL){URL.revokeObjectURL(downloadURL);downloadURL=null;}note.replaceChildren();}
 function validateEvidence(){
  const e=form.elements,hasResult=!!e.results.value.trim();
  e.resultPeriod.required=hasResult;e.resultSource.required=hasResult;
  e.mediaReferences.setCustomValidity(e.mediaApproval.value==='approved'&&!e.mediaReferences.value.trim()?'List the exact screenshots or references you approve.':'');
 }
 form.addEventListener('submit',event=>{event.preventDefault();validateEvidence();if(!form.reportValidity())return;
 const e=form.elements;
 const fields=[['name','Name'],['role','Role'],['company','Company'],['email','Verification email (private)'],['service','Service received'],['project','Project reference'],['scope','Work received'],['feedback','Feedback'],['results','Claimed measurable result (requires review)'],['resultPeriod','Measurement period'],['resultSource','Supporting result evidence'],['mediaReferences','Exact screenshot references'],['approval','Name and feedback publication preference']];
 const text=['BANDEVI client feedback and case-study evidence draft',...fields.map(([key,label])=>label+': '+(e[key].value.trim()||'Not supplied')), 'Screenshot publication preference: '+e.mediaApproval.options[e.mediaApproval.selectedIndex].text,'Contributor confirms genuine experience and authority to share.','Results and supplied evidence still require review. Approval applies only to the stated wording and identified materials.','Please review the final wording with me before publication.'].join('\n');
 clear();const heading=document.createElement('p');heading.textContent='Review your draft below. Nothing has been sent or published.';const preview=document.createElement('pre');preview.textContent=text;preview.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font:inherit';
 downloadURL=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
 const download=document.createElement('a');download.textContent='Download draft (.txt)';download.href=downloadURL;download.download='bandevi-client-evidence-draft.txt';
 const email=document.createElement('a');email.textContent='Send draft by email';email.href='mailto:sales@bandeviglobalgroup.com?subject='+encodeURIComponent('Client feedback for '+e.project.value.trim())+'&body='+encodeURIComponent(text);
 const whatsapp=document.createElement('a');whatsapp.textContent='Send draft on WhatsApp';whatsapp.href='https://wa.me/918287669022?text='+encodeURIComponent(text);whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';
 note.append(heading,preview,download,document.createTextNode(' · '),email,document.createTextNode(' · '),whatsapp);
 });
 form.addEventListener('input',()=>{clear();validateEvidence();});
 form.addEventListener('change',()=>{clear();validateEvidence();});
 validateEvidence();return true;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else if(!init()&&document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});
})();
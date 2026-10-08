(() => {
 function init(){document.querySelectorAll('.enquiry-layout .form-note').forEach(note=>{
  let previous='';const observer=new MutationObserver(()=>{
   const text=note.textContent.trim();if(text===previous)return;previous=text;
   const state=text.startsWith('Your enquiry has been saved.')?'success':text.startsWith('Sending your enquiry')?'sending':text?'error':'';
   note.dataset.state=state;
   if(state==='success'||state==='error')note.focus({preventScroll:false});
  });observer.observe(note,{childList:true,characterData:true,subtree:true});
 });}
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

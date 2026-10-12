(() => {
 'use strict';
 document.querySelectorAll('[data-copy-caption]').forEach(button=>{button.hidden=false;button.addEventListener('click',async()=>{const field=document.getElementById(button.dataset.copyCaption),status=button.closest('article').querySelector('[data-copy-status]');try{await navigator.clipboard.writeText(field.value);status.textContent='Caption and tracked link copied. Review before publishing.';}catch(_){field.focus();field.select();status.textContent='Caption selected. Copy it manually to review and publish.';}});});
})();

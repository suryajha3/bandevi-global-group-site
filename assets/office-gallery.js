(() => {
  function init() {
    const links = [...document.querySelectorAll('[data-office-photo]')];
    if (!links.length || !HTMLDialogElement.prototype.showModal) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'office-photo-dialog';
    dialog.setAttribute('aria-labelledby', 'office-photo-title');
    dialog.innerHTML = '<div class="office-photo-toolbar"><h2 id="office-photo-title">Workspace photo</h2><button type="button" data-photo-close>Close photo</button></div><div class="office-photo-frame"><img alt=""></div><p data-photo-caption></p><p class="office-photo-origin">Company-submitted workspace photo. Location-specific records are available through our contact team.</p><div class="office-photo-actions"><button type="button" data-photo-prev>Previous photo</button><span role="status" aria-live="polite" data-photo-count></span><button type="button" data-photo-next>Next photo</button><a data-photo-original target="_blank" rel="noopener noreferrer">View original (new tab)</a></div>';
    document.body.append(dialog);
    let index = 0, opener;
    const img = dialog.querySelector('img');
    function show(i) {
      index = (i + links.length) % links.length;
      const link = links[index];
      img.src = link.href;
      img.alt = link.dataset.caption;
      dialog.querySelector('[data-photo-caption]').textContent = link.dataset.caption;
      dialog.querySelector('[data-photo-count]').textContent = `Photo ${index + 1} of ${links.length}`;
      dialog.querySelector('[data-photo-original]').href = link.dataset.original;
    }
    links.forEach((link, i) => link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); opener = link; show(i); dialog.showModal();
    }));
    dialog.querySelector('[data-photo-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-photo-prev]').addEventListener('click', () => show(index - 1));
    dialog.querySelector('[data-photo-next]').addEventListener('click', () => show(index + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    dialog.addEventListener('close', () => { img.removeAttribute('src'); opener?.focus(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();


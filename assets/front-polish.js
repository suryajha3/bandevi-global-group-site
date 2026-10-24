/* The homepage preview inspects its three existing fictional records locally. No writes or tracking. */
(() => {
  'use strict';
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
  function init() {
    const preview = document.querySelector('#intl-crm-preview');
    if (!preview || preview.dataset.interactivePreview) return;
    const buttons = [...preview.querySelectorAll('[data-preview-lead]')];
    if (buttons.length !== 3 || !preview.querySelector('.intl-fiction')?.textContent.includes('Fictional records')) return;
    const dialog = node('dialog', 'hero-lead-dialog');
    if (typeof dialog.showModal !== 'function') return; // The normal sample-demo link remains available.
    dialog.id = 'hero-lead-details';
    dialog.setAttribute('aria-labelledby', 'hero-lead-title');
    dialog.setAttribute('aria-describedby', 'hero-lead-disclosure');
    const head = node('div', 'hero-lead-dialog-head');
    const close = node('button', 'hero-lead-close', 'Close ×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close fictional lead details');
    head.append(node('span', 'hero-lead-kicker', 'FICTIONAL CRM PREVIEW'), close);
    const title = node('h2');
    title.id = 'hero-lead-title';
    const kind = node('p', 'hero-lead-kind');
    const details = node('dl', 'hero-lead-fields');
    const values = {};
    for (const label of ['Stage', 'Demo owner', 'Next action']) {
      const group = node('div');
      values[label] = node('dd');
      group.append(node('dt', '', label), values[label]);
      details.append(group);
    }
    const disclosure = node('p', 'hero-lead-disclosure', 'Fictional record and staff name. Inspecting this example does not save an enquiry or contact anyone.');
    disclosure.id = 'hero-lead-disclosure';
    const sample = node('a', 'button dark', 'Try the CRM demo ↗');
    sample.href = '/sample-crm/#guide-title';
    dialog.append(head, title, kind, details, disclosure, sample);
    document.body.append(dialog);
    let opener;
    for (const button of buttons) {
      button.hidden = false;
      button.setAttribute('aria-controls', dialog.id);
      button.addEventListener('click', () => {
        const lead = button.closest('.intl-lead');
        const stage = lead.closest('.intl-lane').querySelector('h3').cloneNode(true);
        stage.querySelectorAll('span,i').forEach(element => element.remove());
        const owner = lead.querySelector('.intl-owner').cloneNode(true);
        owner.querySelector('span')?.remove();
        title.textContent = lead.querySelector('h4').textContent;
        kind.textContent = lead.querySelector('p:not(.intl-next)').textContent;
        values.Stage.textContent = stage.textContent.trim();
        values['Demo owner'].textContent = owner.textContent.replace(' · Demo owner', '').trim();
        values['Next action'].textContent = lead.querySelector('.intl-next').textContent;
        opener = button;
        dialog.showModal();
        document.documentElement.classList.add('hero-preview-open');
        close.focus({preventScroll: true});
      });
    }
    function restorePage() {
      document.documentElement.classList.remove('hero-preview-open');
      const target = opener;
      opener = null;
      if (target?.isConnected) target.focus({preventScroll: true});
    }
    function closePreview() {
      dialog.close();
      restorePage();
    }
    close.addEventListener('click', closePreview);
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      closePreview();
    });
    dialog.addEventListener('close', () => { if (!dialog.open) restorePage(); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closePreview();
    });
    preview.querySelector('.intl-interaction-help').hidden = false;
    preview.dataset.interactivePreview = '1';
  }
  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init, {once: true});
})();

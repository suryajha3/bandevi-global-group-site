/* Fictional homepage previews only. No saved records, writes or tracking. */
(() => {
  'use strict';
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
  const stepPreviews = new WeakSet();
  function initSteps(preview) {
    if (stepPreviews.has(preview)) return;
    const controls=preview.querySelector('.home-crm-steps'),buttons=[...preview.querySelectorAll('[data-home-crm-step]')],stage=preview.querySelector('[data-home-step-stage]'),owner=preview.querySelector('[data-home-step-owner]'),next=preview.querySelector('[data-home-step-next]'),board=preview.querySelector('#home-crm-step-example');
    if (!controls||buttons.length!==3||!stage||!owner||!next||!board) return;
    const steps=new Map([
      ['capture',{stage:'New',kind:'new',owner:'Unassigned · Fictional example',next:'Review the enquiry details'}],
      ['assign',{stage:'New',kind:'new',owner:'Ravi · Demo owner',next:'Review the sales workflow'}],
      ['followup',{stage:'Contacted',kind:'contacted',owner:'Ravi · Demo owner',next:'Discuss the CRM workflow with Example Tours'}]
    ]);
    if (buttons.some(button=>!steps.has(button.dataset.homeCrmStep))) return;
    stepPreviews.add(preview);
    board.setAttribute('role','status');board.setAttribute('aria-live','polite');board.setAttribute('aria-atomic','true');
    for (const button of buttons) button.addEventListener('click',()=>{
      if(button.getAttribute('aria-pressed')==='true')return;
      const step=steps.get(button.dataset.homeCrmStep),dot=node('i');dot.setAttribute('aria-hidden','true');
      for(const other of buttons)other.setAttribute('aria-pressed',String(other===button));
      stage.replaceChildren(dot,document.createTextNode(step.stage));stage.closest('.intl-lane').dataset.homeStage=step.kind;
      owner.textContent=step.owner;next.replaceChildren(node('span',null,'Next action'),document.createTextNode(step.next));
    });
    preview.querySelector('.intl-summary-help').hidden=true;
    controls.hidden=false;
  }
  function init() {
    const teamPhoto=document.querySelector('.home-team-photo img');
    if(teamPhoto&&typeof window.bgPublicMedia==='function')window.bgPublicMedia(teamPhoto,teamPhoto.closest('.home-team-photo-media'));
    const preview = document.querySelector('#intl-crm-preview');
    if (preview?.querySelector('[data-home-demo-summary]')) { initSteps(preview); return; }
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
    document.body.classList.add('front-motion-ready');
  }
  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init, {once: true});
})();

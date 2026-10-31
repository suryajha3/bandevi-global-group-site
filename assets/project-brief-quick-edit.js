/* Review navigation only. Existing step controls own validation and composition. */
(() => {
  'use strict';
  function init() {
    const form = document.getElementById('project-brief');
    const summary = document.getElementById('brief-summary');
    if (!form || !summary || form.dataset.quickEditReady) return;
    const panels = [1, 2, 3].map(n => form.querySelector('[data-brief-step="' + n + '"]'));
    const next = [2, 3].map(n => form.querySelector('[data-next="' + n + '"]'));
    const back = [1, 2].map(n => form.querySelector('[data-back="' + n + '"]'));
    if (panels.some(p => !p) || next.some(b => !b) || back.some(b => !b)) return;
    const help = panels[2].querySelector('h2 + p');
    if (help) help.textContent = 'Check the details below. Use Edit beside a requirement, then Return to review. After changes, refresh and review the PDF preview before printing.';
    const fields = new Map([
      ['Service', ['interest', 1]], ['Business type', ['businessType', 1]],
      ['Business problem', ['briefProblem', 1]], ['Features / integrations', ['briefFeatures', 1]],
      ['Budget preference', ['briefBudget', 2]], ['Preferred launch date', ['briefDate', 2]]
    ]);
    let editing = '';
    const returns = panels.slice(0, 2).map(panel => {
      const group = document.createElement('div'); group.className = 'brief-quick-return'; group.hidden = true;
      const note = document.createElement('p'); note.className = 'brief-help'; note.setAttribute('role', 'status');
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'button dark'; button.textContent = 'Return to review'; button.dataset.briefReturnReview = '';
      group.append(note, button); panel.append(group);
      // Retain field focus through pointer-up; validation will focus the next relevant field.
      button.addEventListener('mousedown', event => { if (event.button === 0) event.preventDefault(); });
      button.addEventListener('click', () => {
        if (!editing || form.dataset.sending === 'true') return;
        // Revisit both original validation gates, including changes from other planning tools.
        if (!panels[1].hidden) back[0].click();
        if (!panels[0].hidden) next[0].click();
        if (!panels[1].hidden) next[1].click();
        sync();
      });
      return { group, note, button };
    });
    function sync() {
      if (!panels[2].hidden) editing = '';
      const busy = form.dataset.sending === 'true';
      for (const { group, note, button } of returns) {
        group.hidden = !editing;
        note.textContent = editing ? 'Editing ' + editing.toLowerCase() + '. Your other details stay in this form.' : '';
        button.disabled = busy;
      }
      for (const button of summary.querySelectorAll('[data-brief-edit]')) button.disabled = busy;
    }
    function decorate() {
      for (const term of summary.querySelectorAll('dt')) {
        const label = term.firstChild?.textContent.trim();
        if (!fields.has(label) || term.querySelector('[data-brief-edit]')) continue;
        const button = document.createElement('button'); button.type = 'button';
        button.className = 'brief-quick-edit'; button.textContent = 'Edit';
        button.setAttribute('aria-label', 'Edit ' + label.toLowerCase()); button.dataset.briefEdit = label;
        // A field's blur/change can rebuild this summary. Keep the target until click completes.
        button.addEventListener('mousedown', event => { if (event.button === 0) event.preventDefault(); });
        term.append(document.createTextNode(' '), button);
      }
      sync();
    }
    summary.addEventListener('click', event => {
      const button = event.target.closest('[data-brief-edit]');
      if (!button || !summary.contains(button) || panels[2].hidden || form.hidden || form.dataset.sending === 'true') return;
      const target = fields.get(button.dataset.briefEdit); if (!target) return;
      editing = button.dataset.briefEdit;
      back[1].click();
      if (target[1] === 1) back[0].click();
      sync();
      const field = form.elements[target[0]];
      if (field && !panels[target[1] - 1].hidden) {
        field.focus({ preventScroll: true }); field.scrollIntoView({ block: 'center' });
      }
    });
    new MutationObserver(decorate).observe(summary, { childList: true });
    const state = new MutationObserver(sync);
    for (const panel of panels) state.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    state.observe(form, { attributes: true, attributeFilter: ['data-sending', 'hidden'] });
    form.addEventListener('reset', () => { editing = ''; sync(); });
    form.dataset.quickEditReady = 'true'; decorate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

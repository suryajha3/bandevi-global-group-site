/* Browser-only requirements preview. No requests, storage or form submission. */
(() => {
  'use strict';
  function init() {
    const form = document.getElementById('project-brief');
    const review = form?.querySelector('[data-brief-step="3"]');
    const summary = document.getElementById('brief-summary');
    if (!form || !review || !summary || form.dataset.previewReady) return;
    form.dataset.previewReady = 'true';
    const label = 'Draft requirements — not a quotation.';
    const names = ['interest', 'businessType', 'briefProblem', 'briefFeatures', 'briefBudget', 'briefDate', 'quoteCurrency'];
    const el = (tag, text, className) => {
      const node = document.createElement(tag);
      if (text !== undefined) node.textContent = text;
      if (className) node.className = className;
      return node;
    };
    const button = text => { const node = el('button', text); node.type = 'button'; return node; };
    const controls = el('div', undefined, 'brief-preview-launch');
    const launch = button('Preview project brief');
    launch.dataset.briefPreviewOpen = '';
    const launchStatus = el('p', 'Review a browser-generated copy before printing or saving a PDF.', 'brief-preview-help');
    launchStatus.setAttribute('role', 'status');
    controls.append(launch, launchStatus);
    const panel = el('section', undefined, 'brief-preview-panel');
    panel.hidden = true;
    panel.setAttribute('aria-labelledby', 'brief-preview-heading');
    const heading = el('h3', 'Project Brief Preview');
    heading.id = 'brief-preview-heading'; heading.tabIndex = -1;
    const draftLabel = el('p', label, 'brief-preview-label');
    const help = el('p', 'Review the requirements below. Contact details are not included. Scope, feasibility, price and delivery dates still need agreement.', 'brief-preview-help');
    const content = el('div', undefined, 'brief-preview-content');
    const status = el('p', '', 'brief-preview-status'); status.setAttribute('role', 'status');
    const actions = el('div', undefined, 'brief-preview-actions');
    const print = button('Print / Save as PDF'); print.dataset.briefPreviewPrint = '';
    const update = button('Update preview'); update.hidden = true;
    const close = button('Close preview');
    actions.append(print, update, close);
    panel.append(heading, draftLabel, help, content, status, actions,
      el('p', 'Choose your printer or Save as PDF in the browser print window. Use the separate Send project brief button when you are ready to enquire.', 'brief-preview-help'));
    summary.after(controls, panel);
    const paper = el('article'); paper.id = 'bgg-brief-print'; paper.hidden = true;
    document.body.append(paper);
    let snapshot = null, printing = false;

    function onReview() { return !form.hidden && !review.hidden && form.dataset.sending !== 'true'; }
    function context() {
      return JSON.stringify(names.map(name => form.elements[name]?.value ?? '').concat(summary.textContent));
    }
    function capture() {
      if (!onReview()) throw Error('Return to Review before sending to preview the current requirements.');
      const e = form.elements;
      for (const name of names) if (e[name] && !e[name].checkValidity()) throw Error('Review your requirements and timing, then open the preview again.');
      if (!e.interest.value || !e.briefProblem.value.trim() || e.briefProblem.value.length > 1100 || e.briefFeatures.value.length > 1100 || e.briefBudget.value.length > 60) throw Error('Review your requirements and timing, then open the preview again.');
      const rows = [];
      for (const term of summary.querySelectorAll('dt')) {
        if (term.textContent === 'Portfolio example' && ['Trip Sarathi', 'MaximTrip', 'TripOdeal'].includes(term.nextElementSibling?.textContent)) rows.push(['Portfolio example', term.nextElementSibling.textContent]);
      }
      rows.push(['Service', e.interest.options[e.interest.selectedIndex].text],
        ['Business type', e.businessType.value || 'Not specified'],
        ['Business problem', e.briefProblem.value.trim()],
        ['Features / integrations', e.briefFeatures.value.trim() || 'To discuss'],
        ['Budget preference', e.briefBudget.value.trim() || 'To discuss'],
        ['Preferred quote currency', ['GBP', 'USD', 'INR', 'EUR'].includes(e.quoteCurrency?.value) ? e.quoteCurrency.value + ' (to agree)' : 'To agree'],
        ['Preferred launch date', e.briefDate.value || 'Still planning']);
      return { signature: context(), rows };
    }
    function list(rows, printable = false) {
      const dl = el('dl', undefined, printable ? 'bgg-print-details' : 'brief-preview-details');
      for (const [name, value] of rows) {
        const row = el('div'); row.append(el('dt', name), el('dd', value)); dl.append(row);
      }
      return dl;
    }
    function current() { return snapshot && onReview() && snapshot.signature === context(); }
    function invalidate() {
      if (!snapshot || panel.hidden || current()) return;
      print.disabled = true; update.hidden = false;
      status.textContent = 'This preview is out of date. Choose Update preview and review it again before printing.';
    }
    function show() {
      try {
        snapshot = capture(); content.replaceChildren(list(snapshot.rows));
        panel.hidden = false; update.hidden = true;
        print.disabled = typeof window.print !== 'function';
        status.textContent = print.disabled ? 'Printing is unavailable in this browser. You can still review this draft.' : 'Current requirements are ready to review.';
        launchStatus.textContent = 'Preview generated in this tab.';
        heading.focus({ preventScroll: true }); panel.scrollIntoView({ behavior: 'instant', block: 'start' });
      } catch (error) { launchStatus.textContent = error.message; }
    }
    function finish() {
      if (!printing) return;
      printing = false; document.body.removeAttribute('data-bgg-brief-print-ready'); paper.replaceChildren();
      print.disabled = !current() || typeof window.print !== 'function';
      if (current()) status.textContent = 'Print window closed. You can review or print this draft again.';
      else invalidate();
    }
    function reset() {
      finish(); snapshot = null; panel.hidden = true; content.replaceChildren();
      update.hidden = true; status.textContent = ''; launchStatus.textContent = 'Review a browser-generated copy before printing or saving a PDF.';
    }
    launch.addEventListener('click', show); update.addEventListener('click', show);
    close.addEventListener('click', () => { reset(); launch.focus({ preventScroll: true }); controls.scrollIntoView({ behavior: 'instant', block: 'center' }); });
    print.addEventListener('click', () => {
      if (printing || !snapshot || panel.hidden) return;
      if (!current()) { invalidate(); return; }
      try {
        // Revalidate the displayed snapshot at the explicit print action.
        const fresh = capture(); if (fresh.signature !== snapshot.signature) { invalidate(); return; }
        if (typeof window.print !== 'function') throw Error('Printing is unavailable in this browser.');
        paper.replaceChildren(el('p', 'BANDEVI GLOBAL GROUP', 'bgg-print-brand'), el('h1', 'Project Brief'),
          el('p', label, 'bgg-print-label'), list(snapshot.rows, true),
          el('p', 'Planning preferences and references for discussion. Scope, feasibility, price, currency and delivery dates need a separate written agreement. Generated in this browser.', 'bgg-print-note'));
        printing = true; print.disabled = true; document.body.dataset.bggBriefPrintReady = 'true';
        status.textContent = 'Use the browser print window to print or save a PDF.';
        window.print();
      } catch (error) { finish(); status.textContent = 'The print window could not open. Your brief is unchanged. You can try again or use another browser.'; }
    });
    form.addEventListener('input', invalidate); form.addEventListener('change', invalidate);
    form.addEventListener('reset', () => queueMicrotask(reset));
    new MutationObserver(invalidate).observe(summary, { childList: true, subtree: true, characterData: true });
    const observer = new MutationObserver(invalidate);
    observer.observe(form, { attributes: true, attributeFilter: ['hidden', 'data-sending'] });
    observer.observe(review, { attributes: true, attributeFilter: ['hidden'] });
    window.addEventListener('beforeprint', () => {
      if (printing && !current()) paper.replaceChildren(el('h1', 'Preview changed'), el('p', 'Close this print window. Update and review your project brief before printing.'));
    });
    window.addEventListener('afterprint', finish);
    const media = window.matchMedia?.('print');
    media?.addEventListener?.('change', event => { if (!event.matches) finish(); });
  }
  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init, { once: true });
})();

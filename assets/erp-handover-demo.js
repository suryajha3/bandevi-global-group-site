/* BANDEVI internal browser prototype. Fixed fictional records; no storage or API calls. */
(() => {
  'use strict';
  const root = document.getElementById('erp-handover-walkthrough');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const market = root.querySelector('[data-erp-market]');
  // An explicit regional link chooses the example; it does not infer buyer location.
  const entryMarket = new URL(location.href).searchParams.get('market') === 'GB' ? 'GB' : 'US';
  const checks = [...root.querySelectorAll('[data-erp-check]')];
  const buttons = [...root.querySelectorAll('[data-erp-step]')];
  const panels = [...root.querySelectorAll('[data-erp-panel]')];
  const reset = root.querySelector('[data-erp-reset]');
  const status = root.querySelector('[data-erp-status]');
  const labels = { accommodation: 'Accommodation confirmation', transfer: 'Transfer confirmation', finance: 'Financial exceptions reviewed', documents: 'Handover documents reviewed' };
  function showStep(index) {
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    panels.forEach((p, i) => { p.hidden = i !== index; });
  }
  function update() {
    const currency = market.value === 'GB' ? 'GBP' : 'USD';
    const amount = n => `${currency} ${n.toLocaleString('en-GB')}`;
    root.querySelectorAll('[data-erp-amount]').forEach(el => { el.textContent = amount(Number(el.dataset.erpAmount)); });
    const pending = checks.filter(c => !c.checked).map(c => labels[c.dataset.erpCheck]);
    status.textContent = pending.length ? `${pending.length} ${pending.length === 1 ? 'check' : 'checks'} pending. Next: ${pending[0]}.` : 'All four sample checks reviewed. Ready for internal handover review.';
    status.dataset.state = pending.length ? 'pending' : 'reviewed';
    const list = root.querySelector('[data-erp-open-items]');
    list.replaceChildren();
    for (const text of pending.length ? pending : ['Record the review owner and unresolved notes in the handover. This demonstration does not authorise a real booking or payment.']) {
      const li = document.createElement('li'); li.textContent = text; list.append(li);
    }
    root.querySelector('[data-erp-market-note]').textContent = `${currency} is used for this fictional scenario. Changing the market relabels the example amounts; it does not convert currencies.`;
    const link = root.querySelector('[data-erp-enquiry]');
    link.href = `/${market.value === 'GB' ? 'uk' : 'us'}/software-development/?solution=Travel%20ERP%20Package#regional-enquiry`;
    link.textContent = `Discuss your ${market.value === 'GB' ? 'UK' : 'US'} Travel ERP project`;
  }
  root.querySelectorAll('button, input, select').forEach(el => { el.disabled = false; });
  checks.forEach(c => { c.checked = false; });
  market.value = entryMarket;
  root.classList.add('erp-demo-enhanced');
  buttons.forEach((b, i) => b.addEventListener('click', () => showStep(i)));
  checks.forEach(c => c.addEventListener('change', update));
  market.addEventListener('change', update);
  reset.addEventListener('click', () => { checks.forEach(c => { c.checked = false; }); market.value = entryMarket; showStep(0); update(); status.textContent = 'Sample reset. Four checks pending; start with the accepted quotation.'; });
  showStep(0); update();
})();

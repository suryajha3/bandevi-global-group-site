(() => {
  'use strict';
  const workflows = {
    'crm-pipeline': ['CRM & ERP Package', 'business-leads'],
    'travel-handover': ['Travel CRM Package', 'crm-handover']
  };
  const markets = { US: 'United States', GB: 'United Kingdom', IN: 'India' };
  const marketAllowed = value => Object.hasOwn(markets, value);
  const workflowAllowed = value => Object.hasOwn(workflows, value);
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
  const canMeasure = () => navigator.doNotTrack !== '1' && window.doNotTrack !== '1' && !navigator.globalPrivacyControl;
  const key = workflow => 'bgg-sample-demo:' + workflow;

  function activeContext(workflow) {
    try {
      const value = JSON.parse(sessionStorage.getItem(key(workflow)));
      if (uuid.test(value?.journey) && value.expires > Date.now()) return value;
    } catch (_) { /* The booking link also works without browser storage. */ }
    return null;
  }

  function record(context, workflow, market) {
    if (!context || !canMeasure() || context.market === market) return;
    context.market = market;
    try { sessionStorage.setItem(key(workflow), JSON.stringify(context)); } catch (_) {}
    fetch('/api/measurement', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', keepalive: true,
      body: JSON.stringify({ event: 'sample_complete', journey: context.journey, workflow, market })
    }).catch(() => {});
  }

  function initialMarket() {
    const selected = new URLSearchParams(location.search).get('market');
    if (marketAllowed(selected)) return selected;
    try {
      const referrer = new URL(document.referrer);
      if (referrer.origin === location.origin) {
        const code = { us: 'US', uk: 'GB', india: 'IN' }[referrer.pathname.split('/')[1]];
        if (marketAllowed(code)) return code;
      }
    } catch (_) {}
    return '';
  }

  const panels = new Map();
  function update(workflow, complete) {
    let panel = panels.get(workflow);
    if (!panel && complete) {
      const container = document.querySelector(workflow === 'crm-pipeline' ? '#guide-complete' : '#travel-demo-brief');
      if (!container) return;
      const form = document.createElement('form');
      form.className = 'inline-actions';
      const field = document.createElement('div');
      field.className = 'field';
      const label = document.createElement('label');
      const market = document.createElement('select');
      market.id = workflow + '-booking-market';
      market.name = 'market';
      market.required = true;
      market.add(new Option('Choose your business market', ''));
      for (const [code, name] of Object.entries(markets)) market.add(new Option(name, code));
      market.value = initialMarket();
      label.textContent = 'Business market';
      label.htmlFor = market.id;
      field.append(label, market);
      const button = document.createElement('button');
      button.type = 'submit';
      button.className = 'button dark';
      button.textContent = 'Book a demo for my agency';
      form.append(field, button);
      if (workflow === 'crm-pipeline') container.after(form);
      else container.append(form);
      const context = activeContext(workflow) || (crypto.randomUUID && canMeasure()
        ? { journey: crypto.randomUUID(), expires: Date.now() + 86400000 } : null);
      record(context, workflow, market.value || 'unknown');
      market.addEventListener('change', () => record(context, workflow, market.value || 'unknown'));
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!marketAllowed(market.value)) return;
        record(context, workflow, market.value);
        const [solution, focus] = workflows[workflow];
        const params = new URLSearchParams({ solution, focus, market: market.value, sample_workflow: workflow });
        location.assign('/demo-request/?' + params + '#demo-form');
      });
      panel = form;
      panels.set(workflow, panel);
    }
    if (panel) panel.hidden = !complete;
  }

  function booking(params, solution, focus) {
    const workflow = params.get('sample_workflow');
    const market = params.get('market');
    if (!workflowAllowed(workflow) || !marketAllowed(market)) return null;
    const [expectedSolution, expectedFocus] = workflows[workflow];
    return solution === expectedSolution && focus === expectedFocus ? { workflow, market } : null;
  }

  function measurement(form, country) {
    const workflow = form.dataset.sampleWorkflow;
    if (!workflowAllowed(workflow) || !marketAllowed(country) || !canMeasure()) return {};
    const context = activeContext(workflow);
    return context ? { sampleJourney: { journey: context.journey, workflow } } : {};
  }

  window.BandeviSampleBooking = { update, booking, measurement };
})();

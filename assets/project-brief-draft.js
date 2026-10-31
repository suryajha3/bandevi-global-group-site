/* Optional browser-local requirements draft. Explicit save, review and empty-field restore only. */
(() => {
  'use strict';
  function init() {
    const form = document.getElementById('project-brief');
    if (!form || form.dataset.draftReady) return;
    const key = 'bgg_public_project_brief_draft_v1';
    const fields = [
      ['interest', 'Service'], ['businessType', 'Business type'],
      ['briefProblem', 'Business problem'], ['briefFeatures', 'Features / integrations'],
      ['briefBudget', 'Budget preference'], ['briefDate', 'Preferred launch date'],
      ['quoteCurrency', 'Preferred quote currency']
    ];
    const services = ['', 'Website or app', 'CRM', 'ERP', 'Travel technology', 'Help me choose'];
    const businesses = ['', 'Travel agency / tour operator', 'Professional services', 'Retail / e-commerce', 'Manufacturing / distribution', 'Other business', 'Still deciding'];
    if (fields.some(([name]) => !form.elements[name])) return;
    const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
    const button = (text, data) => { const n = el('button', text); n.type = 'button'; n.dataset[data] = ''; return n; };
    const box = el('section', undefined, 'brief-draft'); box.setAttribute('aria-labelledby', 'brief-draft-title');
    const heading = el('h2', 'Save and resume your brief'); heading.id = 'brief-draft-title';
    const help = el('p', 'Save project requirements on this browser only. Name, email, phone, country and contact preferences are excluded. Requirements text is saved as entered: keep personal or confidential information out of it.', 'brief-draft-help');
    const state = el('p'); state.setAttribute('role', 'status'); state.dataset.briefDraftStatus = '';
    const error = el('p'); error.setAttribute('role', 'alert'); error.hidden = true; error.dataset.briefDraftError = '';
    const actions = el('div', undefined, 'brief-draft-actions');
    const save = button('Save draft', 'briefDraftSave');
    const review = button('Review saved draft', 'briefDraftReview');
    const clear = button('Clear draft', 'briefDraftClear'); actions.append(save, review, clear);
    const panel = el('section', undefined, 'brief-draft-review'); panel.hidden = true; panel.id = 'brief-draft-review'; panel.setAttribute('aria-labelledby', 'brief-draft-review-title');
    const title = el('h3', 'Review saved draft'); title.id = 'brief-draft-review-title'; title.tabIndex = -1;
    const note = el('p', 'Review the saved requirements below. Restore fills empty fields only. Text and selections already in this tab stay in place. Nothing is sent.');
    const list = el('dl', undefined, 'brief-draft-details');
    const reviewState = el('p'); reviewState.setAttribute('role', 'status'); reviewState.dataset.briefDraftReviewStatus = '';
    const restore = button('Restore empty fields', 'briefDraftRestore');
    const update = button('Update draft review', 'briefDraftUpdate'); update.hidden = true;
    const cancel = button('Close draft review', 'briefDraftClose');
    const reviewActions = el('div', undefined, 'brief-draft-actions'); reviewActions.append(restore, update, cancel);
    panel.append(title, note, list, reviewState, reviewActions);
    box.append(heading, help, state, error, actions, panel,
      el('p', 'A saved draft is available to anyone using this browser profile. Clear draft removes this saved copy only; the current form, shortlist and readiness checklist stay in place.', 'brief-draft-help'));
    form.before(box);
    let observed = null, saved = null, readable = true, invalid = false, conflict = false, snapshot = null;
    function capture() {
      return Object.fromEntries(fields.map(([name]) => [name, name === 'interest' ? (form.elements.interest.value ? form.elements.interest.selectedOptions[0].text : '') : form.elements[name].value]));
    }
    const signature = value => JSON.stringify(value);
    const meaningful = value => Object.values(value).some(v => v.trim());
    const plain = v => v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
    const exact = (v, names) => plain(v) && Object.keys(v).sort().join(',') === [...names].sort().join(',');
    function validDate(value) {
      if (!value) return true;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const d = new Date(value + 'T00:00:00Z'); return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === value;
    }
    function validFields(value) {
      return exact(value, fields.map(([n]) => n)) && fields.every(([n]) => typeof value[n] === 'string') &&
        services.includes(value.interest) && businesses.includes(value.businessType) && ['', 'GBP', 'USD', 'INR', 'EUR'].includes(value.quoteCurrency) &&
        value.briefProblem.length <= 1100 && value.briefFeatures.length <= 1100 && value.briefBudget.length <= 60 && validDate(value.briefDate);
    }
    function decode(raw) {
      if (raw === null) return null;
      if (raw.length > 16000) throw Error('Unreadable draft');
      const value = JSON.parse(raw);
      if (!exact(value, ['version', 'savedAt', 'fields']) || value.version !== 1 || typeof value.savedAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.savedAt) ||
        !Number.isFinite(Date.parse(value.savedAt)) || new Date(value.savedAt).toISOString() !== value.savedAt ||
        Date.parse(value.savedAt) > Date.now() + 300000 || !validFields(value.fields) || !meaningful(value.fields)) throw Error('Unreadable draft');
      return value;
    }
    function issue(text) { error.textContent = text; error.hidden = !text; }
    function load() {
      try { observed = localStorage.getItem(key); readable = true; }
      catch (_) { readable = false; saved = null; invalid = false; issue('Browser storage is unavailable. You can continue editing and previewing this brief, but a saved draft cannot be verified.'); return; }
      try { saved = decode(observed); invalid = false; issue(''); }
      catch (_) { saved = null; invalid = true; issue('The saved draft could not be read. It has not been changed. Clear draft to remove this copy before saving again.'); }
    }
    load();
    let protectedFields = signature(capture());
    const contacts = ['name', 'email', 'phone', 'projectCountry', 'contactChannel', 'contactTimezone', 'contactDate', 'contactTime'];
    const contactSignature = () => JSON.stringify(contacts.map(n => form.elements[n]?.value || ''));
    let initialContacts = contactSignature();
    const busy = () => form.hidden || form.dataset.sending === 'true';
    function changedSinceSave() { return meaningful(capture()) && signature(capture()) !== protectedFields; }
    function paint() {
      const values = capture();
      save.disabled = busy() || !readable || invalid || conflict || !panel.hidden || !validFields(values) || !meaningful(values) || !!saved && signature(values) === signature(saved.fields);
      review.disabled = busy() || !readable || observed === null || invalid;
      clear.disabled = busy() || !readable || observed === null;
      if (!readable) state.textContent = 'No verified saved draft. Current form stays in this tab.';
      else if (conflict) state.textContent = 'Saved draft changed in another tab. Review saved draft before saving over it. Your current form is preserved.';
      else if (invalid) state.textContent = 'Saved copy is unreadable; current form is preserved.';
      else if (saved) state.textContent = 'Last saved: ' + new Date(saved.savedAt).toLocaleString() + ' (this device’s time zone). ' + (signature(values) === signature(saved.fields) ? 'Requirements match the saved copy.' : meaningful(values) ? 'Current requirements differ from the saved copy.' : 'Review the saved copy to resume.');
      else state.textContent = 'No saved draft. Choose Save draft to keep your requirements on this browser.';
    }
    function fresh() {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== observed) { conflict = true; protectedFields = ''; snapshot = null; restore.disabled = true; update.hidden = false; issue('Saved draft changed. Review the latest saved draft before continuing. Current form is preserved.'); paint(); return false; }
        return true;
      } catch (_) { readable = false; snapshot = null; restore.disabled = true; issue('Could not verify browser storage. Nothing was restored or saved.'); paint(); return false; }
    }
    function close() { panel.hidden = true; snapshot = null; list.replaceChildren(); update.hidden = true; paint(); }
    save.addEventListener('click', () => {
      if (busy() || !panel.hidden || !readable || invalid || conflict || !fresh()) return;
      const value = capture();
      if (!validFields(value) || !meaningful(value)) { issue('Review field lengths, choices and launch date before saving. An incomplete brief can be saved.'); return; }
      if (value.briefDate && !form.elements.briefDate.checkValidity()) { issue('Choose a current or future preferred launch date, or leave it blank, before saving.'); return; }
      const payload = { version: 1, savedAt: new Date().toISOString(), fields: value }, raw = JSON.stringify(payload);
      try {
        localStorage.setItem(key, raw);
        if (localStorage.getItem(key) !== raw) { conflict = true; throw Error('Verification failed'); }
        observed = raw; saved = payload; protectedFields = signature(value); issue(''); paint();
      } catch (_) { issue('Your current requirements have not been verified as saved. Keep this tab open and try again when browser storage is available.'); paint(); }
    });
    function past(value) { return value && form.elements.briefDate.min && value < form.elements.briefDate.min; }
    function allowed(name, value) {
      const field = form.elements[name];
      if (field.disabled || name === 'briefDate' && past(value)) return false;
      return field.tagName !== 'SELECT' || [...field.options].some(o => !o.disabled && (name === 'interest' ? o.text === value : o.value === value));
    }
    function reviewContext() {
      return JSON.stringify([capture(), form.elements.briefDate.min, ...fields.filter(([name]) => form.elements[name].tagName === 'SELECT').map(([name]) => [form.elements[name].disabled, ...[...form.elements[name].options].map(o => o.disabled)])]);
    }
    function renderReview() {
      if (busy()) return;
      load(); conflict = false;
      if (!readable || invalid || !saved) { close(); paint(); return; }
      const current = capture(); snapshot = { raw: observed, current: reviewContext(), fields: saved.fields };
      let available = 0; list.replaceChildren();
      for (const [name, label] of fields) {
        const value = saved.fields[name], row = el('div');
        let action = !value ? 'Not saved — no change.' : current[name] ? (current[name] === value ? 'Already in this tab — keep current.' : 'This field already has a value — keep current.') : name === 'briefDate' && past(value) ? 'Past date — choose a new date in the form.' : !allowed(name, value) ? 'Not currently available for this form — keep current settings.' : 'Restore into this empty field.';
        if (value && !current[name] && allowed(name, value)) available++;
        const description = el('dd'); description.append(el('p', value || 'Not specified', 'brief-draft-value'), el('p', action, 'brief-draft-disposition'));
        row.append(el('dt', label), description); list.append(row);
      }
      panel.hidden = false; update.hidden = true; restore.disabled = available === 0;
      reviewState.textContent = available ? available + ' empty field' + (available === 1 ? '' : 's') + ' can be restored. Existing values and contact details stay in place.' : 'No empty fields can be restored. Existing values stay in place.';
      paint(); title.focus({ preventScroll: true }); panel.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    review.addEventListener('click', renderReview); update.addEventListener('click', renderReview);
    cancel.addEventListener('click', () => { close(); review.focus(); });
    restore.addEventListener('click', () => {
      if (busy() || panel.hidden || !snapshot || !fresh()) return;
      if (snapshot.raw !== observed || snapshot.current !== reviewContext()) { invalidate(); return; }
      const current = capture(), changes = fields.filter(([name]) => snapshot.fields[name] && !current[name] && allowed(name, snapshot.fields[name]));
      for (const [name] of changes) {
        const field = form.elements[name], value = snapshot.fields[name];
        if (name === 'interest') field.selectedIndex = [...field.options].findIndex(o => o.text === value);
        else field.value = value;
      }
      // Apply the reviewed empty fields together before updating existing summary/preview controllers.
      for (const [name] of changes) { form.elements[name].dispatchEvent(new Event('input', { bubbles: true })); form.elements[name].dispatchEvent(new Event('change', { bubbles: true })); }
      if (signature(capture()) === signature(saved.fields)) protectedFields = signature(capture());
      snapshot = null; restore.disabled = true; update.hidden = true;
      reviewState.textContent = changes.length + ' empty field' + (changes.length === 1 ? '' : 's') + ' restored. Existing values were kept. Review all steps before sending or printing.';
      issue(''); paint();
    });
    clear.addEventListener('click', () => {
      if (busy() || !readable || !fresh()) return;
      try {
        localStorage.removeItem(key);
        if (localStorage.getItem(key) !== null) throw Error('Verification failed');
        observed = null; saved = null; invalid = false; conflict = false; protectedFields = signature(Object.fromEntries(fields.map(([n]) => [n, '']))); issue(''); close(); paint();
      } catch (_) { issue('Could not verify that the saved draft was cleared. Current form is unchanged.'); }
    });
    function invalidate() {
      if (snapshot && snapshot.current !== reviewContext()) { snapshot = null; restore.disabled = true; update.hidden = false; reviewState.textContent = 'Current requirements changed. Update draft review before restoring. Existing values will be kept.'; }
      paint();
    }
    form.addEventListener('input', invalidate); form.addEventListener('change', invalidate);
    form.addEventListener('reset', () => queueMicrotask(() => { protectedFields = signature(capture()); initialContacts = contactSignature(); close(); }));
    new MutationObserver(paint).observe(form, { attributes: true, attributeFilter: ['hidden', 'data-sending'] });
    window.addEventListener('storage', event => {
      if (event.key !== key && event.key !== null) return;
      if (event.storageArea !== localStorage) return;
      fresh();
    });
    window.addEventListener('pageshow', () => { fresh(); paint(); });
    window.addEventListener('beforeunload', event => {
      if (!form.hidden && form.dataset.sending !== 'true' && (changedSinceSave() || contactSignature() !== initialContacts)) { event.preventDefault(); event.returnValue = ''; }
    });
    form.dataset.draftReady = 'true'; paint();
  }
  if (document.readyState === 'complete') init(); else document.addEventListener('DOMContentLoaded', init, { once: true });
})();

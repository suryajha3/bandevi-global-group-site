/* Public location tools. No requests, tracking, storage or automatic submissions. */
(() => {
  'use strict';
  const locations = [{"id":"gurugram-base","name":"BANDEVI Gurugram delivery base","address":"SCO 63, Huda Market, First Floor, Bijwasan - Palam Vihar Rd, opposite HP Petrol Pump, Cartarpuri Alias Daulatpur Nas, Sector 23A, Gurugram, Haryana 122017, India","country":"IN","countryName":"India","kind":"base","badge":"BANDEVI delivery base","aliases":"Gurgaon Haryana SCO 63"},{"id":"delhi","name":"Delhi Office","address":"Third Floor, Gulshan Park, H-30, Plot No 6&7, Vijay Chowk Area, Laxmi Nagar, Delhi, 110092","country":"IN","countryName":"India","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":""},{"id":"pune","name":"Pune Office","address":"Spacelane 15/a, 4th Floor, A Building, City Vista, Fountain Road, Ashoka Nagar, Kharadi, Pune, Maharashtra - 411014","country":"IN","countryName":"India","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":""},{"id":"gurgaon-palm-court","name":"Gurgaon Hub","address":"7th Floor, 704 Palm Court, Mehrauli Gurugram Road, Sector 16, Gurgaon, Haryana - 122001","country":"IN","countryName":"India","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":"Gurugram Gurgaon"},{"id":"mumbai","name":"Mumbai Office","address":"1st Floor, Sai Dham Housing Society, B-2, Marol Naka, Andheri East, Mumbai, 400059","country":"IN","countryName":"India","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":""},{"id":"bangalore","name":"Bangalore Office","address":"561, 32nd Cross Rd, 4th Block, Jayanagar, Bengaluru, 560011","country":"IN","countryName":"India","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":"Bengaluru"},{"id":"kolkata","name":"Kolkata Office","address":"2D, Bose Pukur Rd, Prantik Palli, Kasba, Kolkata, 700042","country":"IN","countryName":"India","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":""},{"id":"lucknow","name":"Lucknow Office","address":"Radiant Complex, Cantonment Road, Lalbagh, Lucknow, 226001","country":"IN","countryName":"India","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":""},{"id":"dubai-sheikh-zayed","name":"Dubai Office - Sheikh Zayed Road","address":"Office 203, Al Tayer Building, Sheikh Zayed Road, Dubai, UAE","country":"AE","countryName":"United Arab Emirates UAE","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":""},{"id":"dubai-deira","name":"Dubai Office - Deira","address":"Hor Al Anz East, Deira, Dubai, UAE","country":"AE","countryName":"United Arab Emirates UAE","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":""},{"id":"london","name":"London Office","address":"71-75 Shelton Street, Covent Garden / Holborn, London, WC2H 9JQ","country":"GB","countryName":"United Kingdom UK","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":""},{"id":"california","name":"United States Office","address":"216 W Garvey Avenue, Suite C, Monterey Park, California, 91754","country":"US","countryName":"United States USA","kind":"shared","badge":"Shared BANDEVI / THG location","aliases":""},{"id":"singapore-remote","name":"Singapore service coverage","address":"SCO 63, Huda Market, First Floor, Bijwasan - Palam Vihar Rd, opposite HP Petrol Pump, Cartarpuri Alias Daulatpur Nas, Sector 23A, Gurugram, Haryana 122017, India","country":"SG","countryName":"Singapore","kind":"remote","badge":"Remote service coverage","aliases":"Singapore remote Gurugram"}];
  function initDirectory() {
    const table = document.querySelector('[data-office-directory]');
    if (!table || table.dataset.enhanced) return;
    const rows = [...table.querySelectorAll('tbody tr[data-office-id]')];
    const records = new Map(locations.map(location => [location.id, location]));
    if (rows.length !== locations.length || rows.some(row => !records.has(row.dataset.officeId))) return;
    table.dataset.enhanced = 'true';
    const controls = document.querySelector('[data-office-filters]');
    const country = controls.querySelector('select');
    const search = controls.querySelector('input[type="search"]');
    const count = document.querySelector('[data-office-count]');
    const empty = document.querySelector('[data-office-empty]');
    const feedback = document.querySelector('[data-office-copy-status]');
    const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    function filter() {
      const query = normalize(search.value.trim());
      let visible = 0;
      for (const row of rows) {
        const record = records.get(row.dataset.officeId);
        row.hidden = (country.value && record.country !== country.value) || !normalize([record.name, record.address, record.countryName, record.aliases].join(' ')).includes(query);
        if (!row.hidden) visible++;
      }
      count.textContent = `${visible} matching location ${visible === 1 ? 'entry' : 'entries'}`;
      empty.hidden = visible !== 0;
    }
    country.addEventListener('change', filter);
    search.addEventListener('input', filter);
    controls.querySelector('[data-office-reset]').addEventListener('click', () => { country.value = ''; search.value = ''; filter(); });
    controls.hidden = false;
    filter();
    // Keep pointer activation stable when a browser does not focus buttons on click.
    for (const action of [...table.querySelectorAll('.office-location-action'), controls.querySelector('[data-office-reset]')]) {
      action.addEventListener('pointerdown', event => { if (event.isPrimary && event.button === 0) action.focus({preventScroll:true}); });
      action.addEventListener('mousedown', event => { if (event.button === 0) { event.preventDefault(); action.focus({preventScroll:true}); } });
    }
    let copyRequest = 0;
    for (const row of rows) {
      const record = records.get(row.dataset.officeId);
      const button = row.querySelector('[data-office-copy]');
      const label = button.textContent;
      const ariaLabel = button.getAttribute('aria-label');
      let labelTimer;
      button.hidden = false;
      button.addEventListener('click', async () => {
        clearTimeout(labelTimer); button.textContent = label; button.setAttribute('aria-label', ariaLabel);
        const request = ++copyRequest;
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        try {
          if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
          await navigator.clipboard.writeText(record.address);
          button.textContent = 'Copied';
          button.setAttribute('aria-label', `Copied address for ${record.name}`);
          labelTimer = setTimeout(() => { button.textContent = label; button.setAttribute('aria-label', ariaLabel); }, 3000);
          row.querySelector('.office-manual-copy')?.setAttribute('hidden', '');
          if (request === copyRequest) feedback.textContent = `Copied the address for ${record.name}.`;
        } catch (_) {
          let manual = row.querySelector('.office-manual-copy');
          if (!manual) {
            manual = document.createElement('div'); manual.className = 'office-manual-copy';
            const label = document.createElement('label'); label.htmlFor = `office-copy-${record.id}`; label.textContent = `Copy the address for ${record.name} manually`;
            const input = document.createElement('textarea'); input.id = label.htmlFor; input.readOnly = true; input.rows = 3; input.value = record.address;
            manual.append(label, input); row.lastElementChild.append(manual);
          }
          manual.hidden = false;
          if (request === copyRequest) {
            const input = manual.querySelector('textarea'); input.focus({preventScroll:true}); input.select(); input.scrollIntoView({behavior:'instant',block:'center'});
            feedback.textContent = 'Automatic copying is unavailable. The address is selected below; use your device’s Copy command.';
          }
        } finally { button.disabled = false; button.removeAttribute('aria-busy'); }
      });
    }
  }
  function initEnquiry() {
    const id = new URL(location.href).searchParams.get('office');
    const record = locations.find(location => location.id === id);
    const form = document.querySelector('form[data-form="contact"]');
    if (!record || !form || form.querySelector('[data-office-enquiry-context]')) return;
    const note = document.createElement('aside'); note.className = 'office-enquiry-context'; note.dataset.officeEnquiryContext = record.id; note.setAttribute('aria-label', 'Selected location for your enquiry');
    const heading = document.createElement('strong'); heading.textContent = `Enquiry about ${record.name}`;
    const address = document.createElement('p'); address.textContent = record.address;
    const type = document.createElement('p'); type.textContent = `${record.badge}. BANDEVI software enquiries are coordinated through the Gurugram team.`;
    const link = document.createElement('a'); link.href = `/offices/#office-${record.id}`; link.textContent = 'Review this location';
    note.append(heading, address, type, link); form.prepend(note);
    const message = form.elements.message;
    const details = `Location enquiry: ${record.name}\nAddress: ${record.address}\n${record.badge}`;
    if (message && !message.value.trim()) {
      message.value = `${details}\nPlease contact me about my software requirements and arrangements for this location.`;
      message.dispatchEvent(new Event('input', {bubbles:true}));
    } else if (message && !message.value.includes(details)) {
      const add = document.createElement('button'); add.type = 'button'; add.className = 'office-location-action'; add.textContent = 'Add location details to my message';
      const feedback = document.createElement('p'); feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
      add.addEventListener('click', () => {
        if (message.value.includes(details)) { feedback.textContent = 'This location is already included in your message.'; return; }
        const next = message.value + (message.value.trim() ? '\n\n' : '') + details;
        const limit = message.maxLength > 0 ? message.maxLength : 3000;
        if (next.length > limit) { feedback.textContent = 'Your message is near its limit. Please include the location name when editing it.'; return; }
        message.value = next; message.dispatchEvent(new Event('input', {bubbles:true}));
        add.textContent = 'Location details added'; feedback.textContent = 'Location details added. Your existing text has been kept.';
      });
      note.append(add, feedback);
    }
  }
  function init() { initDirectory(); initEnquiry(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();

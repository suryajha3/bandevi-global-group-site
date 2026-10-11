const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..'), output = process.env.QA_OUTPUT || path.join(root, 'qa-results/enquiry-journey');
fs.mkdirSync(output, { recursive: true });
const live = process.argv[2];
let browser, server;
(async () => {
  const checks = [], errors = [];
  try {
    let base = live;
    if (!base) {
      server = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://local');
        if (url.pathname.startsWith('/api/')) { res.writeHead(503, { 'Content-Type': 'application/json' }); return res.end('{"ok":false,"error":"Local preview"}'); }
        let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
        if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
        if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
        res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
        let content = fs.readFileSync(file);
        if (url.searchParams.has('source') && url.pathname === '/contact-us/') content = Buffer.from(content.toString().replace(/<body[\s\S]*?<\/body>/, '<body data-page="contact"><div id="site"></div><script src="/assets/site.js" defer></script></body>'));
        res.end(content);
      });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      base = 'http://127.0.0.1:' + server.address().port;
    }
    browser = await chromium.launch(process.env.QA_CHROME ? { executablePath: process.env.QA_CHROME } : {});
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    await context.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__copiedReference = value; } } }));
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const services = [
      ['Website / App Development Package', 'pages or app screens', 'Current website'],
      ['CRM & ERP Package', 'sales or operations', 'Current CRM'],
      ['Complete Travel Website Package', 'enquiry or booking', 'Travel business'],
      ['Customer Portal Package', 'Who needs access', 'Portal users'],
      ['E-Commerce Package', 'browse, order or pay', 'Current store'],
      ['Automation Package', 'repeated task', 'Current tools'],
      ['Need guidance', 'useful first release', 'Current process']
    ];
    for (const source of [false, ...(!live ? [true] : [])]) {
      await page.goto(base + '/contact-us/' + (source ? '?source=1' : ''));
      const form = page.locator('form[data-form="contact"]');
      await page.waitForFunction(() => !document.querySelector('[data-enquiry-submit]').disabled);
      assert.deepEqual(await form.locator('[required]').evaluateAll(elements => elements.map(element => element.name).sort()), ['email', 'interest', 'message', 'name']);
      assert.equal(await form.locator('.enquiry-optional').evaluate(element => element.open), false);
      assert.equal(await form.locator('[data-enquiry-questions]').evaluate(element => element.disabled), true);
      for (const [service, hint, label] of services) {
        await form.locator('[name=interest]').selectOption(service);
        assert((await form.locator('#contact-service-hint').textContent()).includes(hint));
        assert((await form.locator('[data-enquiry-context-label]').textContent()).includes(label));
        await form.locator('.enquiry-optional').evaluate(element => { element.open = true; });
        await form.locator('[name=projectContext]').fill('Fictional QA tools');
        await form.locator('[name=interest]').selectOption('');
        assert.equal(await form.locator('[name=projectContext]').inputValue(), '');
        assert.equal(await form.locator('[data-enquiry-questions]').evaluate(element => element.disabled), true);
      }
      checks.push({ source, essentialFields: 4, serviceGuidance: services.length, staleAnswersCleared: true });
      for (const width of [360, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await form.locator('[name=interest]').selectOption('Website / App Development Package');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await form.locator('.enquiry-optional').evaluate(element => { element.open = false; });
        if (!source) await page.locator('#contact-form').screenshot({ style: '.topbar,.skip-link{visibility:hidden!important}', path: path.join(output, (live ? 'live' : 'local') + '-contact-' + width + '.png') });
        checks.push({ source, width, mobileForm: true });
      }
    }
    for (const [slug, code, label] of [['trip-sarathi', 'trip_sarathi', 'Trip Sarathi'], ['maximtrip', 'maximtrip', 'MaximTrip'], ['tripodeal', 'tripodeal', 'TripOdeal']]) {
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto(base + '/projects/' + slug + '/');
      const projectText = await page.locator('main').textContent();
      assert(projectText.includes('6 October 2026'));
      if (slug === 'trip-sarathi') assert(projectText.includes('No measured business outcome or customer testimonial is included'));
      else { assert(projectText.includes('Awaiting confirmation')); assert(projectText.includes('not a customer endorsement')); }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.getByRole('link', { name: 'Send a short enquiry about ' + label, exact: true }).click();
      await page.waitForFunction(() => document.querySelector('[data-enquiry-project]')?.hidden === false);
      assert.equal(new URL(page.url()).searchParams.get('project'), code);
      assert.equal(await page.locator('#contact-interest').inputValue(), 'Complete Travel Website Package');
      assert((await page.locator('[data-enquiry-project]').textContent()).includes(label));
      assert.equal(await page.locator('#contact-name').inputValue(), '');
      checks.push({ project: label, mobileAndEnquiryContext: true, existingEvidencePreserved: true });
    }
    await page.goto(base + '/contact-us/?solution=__proto__&project=__proto__');
    assert.equal(await page.locator('#contact-interest').inputValue(), '');
    assert.equal(await page.locator('[data-enquiry-project]').evaluate(element => element.hidden), true);
    checks.push({ unknownQueryIgnored: true });
    for (const source of [false, ...(!live ? [true] : [])]) {
      await page.goto(base + '/contact-us/?request=client-reference' + (source ? '&source=1' : ''));
      assert.equal(await page.locator('#contact-interest').inputValue(), 'Need guidance');
      assert((await page.locator('#contact-message').inputValue()).includes('client-approved project reference'));
      assert.equal(await page.locator('[data-enquiry-questions]').evaluate(element => element.disabled), false);
      assert.equal(await page.locator('#contact-message').evaluate(element => element.validity.valid), true);
      checks.push({ source, existingReferenceRequestPrefill: true, optionalQuestionsSynced: true });
    }
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + '/contact.html');
      await page.waitForFunction(() => !document.querySelector('[data-enquiry-submit]').disabled);
      assert.equal(await page.locator('form[data-form=contact] [required]').count(), 4);
      await page.locator('#contact-interest').selectOption('CRM & ERP Package');
      await page.locator('.enquiry-optional summary').click();
      assert.equal(await page.locator('[data-enquiry-questions]').isVisible(), true);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      checks.push({ legacyContactAlias: true, width, optionalQuestionsAvailable: true });
    }
    if (!live) {
      for (const source of [false, true]) {
        await page.goto(base + '/contact-us/?project=trip_sarathi' + (source ? '&source=1' : ''));
        const form = page.locator('form[data-form=contact]'), calls = [];
        await page.route('**/api/enquiries', async route => {
          calls.push({ key: route.request().headers()['idempotency-key'], payload: route.request().postDataJSON() });
          await route.fulfill({ status: calls.length === 1 ? 503 : 201, contentType: 'application/json', body: JSON.stringify(calls.length === 1 ? { ok: false, error: 'Fictional retry check' } : { ok: true, reference: 'BG-0123456789ABCDEF' }) });
        });
        await form.locator('[name=name]').fill('Fictional QA'); await form.locator('[name=email]').fill('qa@example.invalid');
        await form.locator('.enquiry-optional summary').click();
        await form.locator('[name=phone]').fill('+91 0000000000');
        await form.locator('[name=businessType]').selectOption('Travel agency / tour operator');
        await form.locator('[name=projectContext]').fill('Fictional travel tools');
        await form.locator('[name=projectPriority]').fill('Fictional enquiry and quote workflow');
        await form.locator('[name=message]').fill('Fictional project description');
        await form.locator('[data-enquiry-submit]').click();
        await form.locator('.form-note').filter({ hasText: 'Your draft is retained' }).waitFor();
        assert.equal(await form.locator('[name=projectPriority]').inputValue(), 'Fictional enquiry and quote workflow');
        await form.locator('[data-enquiry-submit]').click();
        await form.locator('.form-note').filter({ hasText: 'BG-0123456789ABCDEF' }).waitFor();
        assert.equal(calls.length, 2); assert.deepEqual(calls[0], calls[1]);
        assert(calls[1].payload.message.includes('Project reference: Trip Sarathi (public interface example)'));
        assert(calls[1].payload.message.includes('Fictional travel tools'));
        assert(calls[1].payload.message.includes('Fictional enquiry and quote workflow'));
        assert(calls[1].payload.message.length <= 3000);
        assert((await form.locator('.form-note').textContent()).includes('The team will review'));
        const copy = form.getByRole('button', { name: 'Copy reference', exact: true });
        await copy.click(); assert.equal(await page.evaluate(() => window.__copiedReference), 'BG-0123456789ABCDEF');
        assert(await copy.evaluate(element => element === document.activeElement));
        assert.equal(calls.length, 2);
        assert.equal(await form.locator('[name=name]').inputValue(), '');
        assert.equal(await form.locator('.enquiry-optional').evaluate(element => element.open), false);
        await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw Error('Synthetic clipboard unavailable'); }; });
        await copy.click(); assert.equal(await page.evaluate(() => getSelection().toString()), 'BG-0123456789ABCDEF');
        assert((await form.locator('.form-note').textContent()).startsWith('Your enquiry has been saved.'));
        await page.unroute('**/api/enquiries');
        checks.push({ source, optionalDetailsStored: true, safeRetry: true, receiptAndClipboardFallback: true });
        await form.locator('[name=interest]').selectOption('CRM & ERP Package');
        await form.locator('.enquiry-optional summary').click();
        await form.locator('[name=message]').fill('x'.repeat(2800));
        await form.locator('[name=projectPriority]').fill('y'.repeat(400));
        assert.equal(await form.locator('[name=message]').evaluate(element => element.validity.valid), false);
        assert((await form.locator('[data-enquiry-count]').textContent()).includes('over the limit'));
        await form.locator('[name=projectPriority]').fill('');
        assert.equal(await form.locator('[name=message]').evaluate(element => element.validity.valid), true);
        checks.push({ source, combinedLimit: true, draftNeverTruncated: true });
      }
    }
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const plain = await nojs.newPage(); await plain.goto(base + '/contact-us/');
    assert.equal(await plain.locator('[data-enquiry-submit]').isDisabled(), true);
    assert.equal(await plain.locator('form[data-form=contact]').getAttribute('method'), 'post');
    assert((await plain.locator('noscript').textContent()).includes('email our team'));
    await nojs.close(); checks.push({ noJavaScriptContactAlternative: true, noDetailsInUrl: true });
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, (live ? 'live' : 'local') + '-checks.json'), JSON.stringify({ checks, errors, submissions: live ? 'none' : 'local mocks only' }, null, 2));
    console.log('PASS: ' + checks.length + ' enquiry journey cases; ' + (live ? 'read-only live checks' : 'all submissions mocked locally') + '.');
  } finally { if (browser) await browser.close(); if (server) server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

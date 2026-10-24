const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..'), output = process.env.QA_OUTPUT || path.join(root, 'qa-results/navigation');
fs.mkdirSync(output, { recursive: true });
const live = process.argv[2];
let server, browser;
(async () => {
  const checks = [], errors = [];
  try {
    let base = live;
    if (!base) {
      server = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://local');
        let file = path.join(root, url.pathname);
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
        if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
        res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream');
        let content = fs.readFileSync(file);
        if (url.searchParams.has('source') && url.pathname === '/') content = Buffer.from(content.toString().replace(/<body[\s\S]*?<\/body>/, '<body data-page="home"><div id="site"></div><script src="/assets/site.js" defer></script></body>'));
        res.end(content);
      });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      base = 'http://127.0.0.1:' + server.address().port;
    }
    browser = await chromium.launch({ ...(process.env.QA_CHROME ? { executablePath: process.env.QA_CHROME } : {}) });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['/', '/crm-erp-solutions/', '/contact-us/', ...(!live ? ['/?source=1'] : [])]) {
      await page.goto(base + route);
      await page.locator('.footer-top').waitFor();
      assert.equal(await page.locator('.quick-contact').count(), 0);
      assert((await page.locator('.nav-actions .primary').textContent()).includes('Discuss Your Project'));
      assert.equal(await page.locator('.footer-disclosure a[href="/demo-request/"]').textContent(), 'Request a Demo');
      assert.equal(await page.locator('.footer-contact-actions a').count(), 3);
      assert.equal(await page.locator('.footer-social a').count(), 4);
      assert((await page.locator('.footer-office').textContent()).includes('SCO 63'));
      assert.equal(await page.locator('.primary-nav a[href="/#selected-work"]').count(), 1);
      assert.equal(await page.locator('.brand-line').textContent(), route.startsWith('/?')||route==='/' ? 'Software. Built around you.' : 'Your international software partner');
      assert((await page.locator('.nav-solutions summary').textContent()).includes('Services'));
      for (const width of [360, 390, 768, 1180, 1181, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        // Let both responsive footer and navigation listeners finish before keyboard actions.
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.waitForFunction(compact => Array.from(document.querySelectorAll('.footer-disclosure')).every(element => element.open === !compact), width <= 540);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), JSON.stringify({route, width, layout: await page.evaluate(() => ({scrollWidth:document.documentElement.scrollWidth, overflow:[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).map(el=>({tag:el.tagName, class:el.className, text:el.textContent.slice(0,80), right:el.getBoundingClientRect().right})).slice(0,12)}))}));
        if (width <= 390) {
          assert.equal(await page.locator('.footer-disclosure[open]').count(), 0);
          const summary = page.locator('.footer-disclosure summary').first();
          await summary.focus(); await summary.press('Enter');
          assert.equal(await page.locator('.footer-disclosure[open]').count(), 1);
          await summary.press('Enter');
          await page.locator('[data-nav-toggle]').click();
        }
        if (width === 768 || width === 1180) await page.locator('[data-nav-toggle]').click();
        if (width < 1181) assert.equal(await page.locator('[data-nav-toggle]').getAttribute('aria-expanded'), 'true');
        assert.equal(await page.locator('.mobile-demo').isVisible(), width < 1181);
        if (width < 1181) {
          assert.equal(await page.locator('.mobile-demo').getAttribute('href'), '/demo-request/');
          assert.equal(await page.locator('.mobile-contact-actions a[href="tel:+917011040474"]').count(), 1);
          assert.equal(await page.locator('.mobile-contact-actions a[href="https://wa.me/917011040474"]').count(), 1);
        }
        const company = page.locator('.nav-company');
        await company.locator('summary').click();
        assert.equal(await company.locator('a:visible').count(), 4);
        await company.locator('a').first().focus(); await page.keyboard.press('Escape');
        assert.equal(await company.evaluate(el => el.open), false);
        assert(await company.locator('summary').evaluate(el => el === document.activeElement));
        const markets = page.locator('.nav-markets');
        await markets.locator('summary').focus(); await markets.locator('summary').press('Enter');
        await page.waitForFunction(() => document.querySelector('.nav-markets').open);
        assert.equal(await markets.locator('a:visible').count(), 6);
        assert((await markets.textContent()).includes('Remote delivery from India'));
        for(const code of ['india','uk','us','ae','sg']) assert.equal(await markets.locator('a[href="/'+code+'/software-development/"]').count(),1);
        await markets.locator('a').first().focus(); await page.keyboard.press('Escape');
        assert.equal(await markets.evaluate(el => el.open), false);
        assert(await markets.locator('summary').evaluate(el => el === document.activeElement));
        const solutions = page.locator('.nav-solutions');
        await solutions.locator('summary').focus(); await solutions.locator('summary').press('Enter');
        await page.waitForFunction(() => document.querySelector('.nav-solutions').open);
        assert(await solutions.evaluate(element => element.open));
        assert.equal(await solutions.locator('.solutions-menu a:visible').count(), 7);
        assert.equal(await solutions.locator('a[href="/service-offers/"]').count(),1);
        if (route === '/') await page.screenshot({ path: path.join(output, (live ? 'live' : 'local') + '-menu-' + width + '.png') });
        if (width === 1440 && route === '/crm-erp-solutions/') {
          assert.equal(await solutions.locator('a[aria-current="page"]').getAttribute('href'), route);
          assert(await solutions.locator('summary').evaluate(element => element.classList.contains('is-active')));
        }
        await solutions.locator('a').first().focus(); await page.keyboard.press('Escape');
        assert.equal(await solutions.evaluate(element => element.open), false);
        assert(await solutions.locator('summary').evaluate(element => element === document.activeElement));
        if (width < 1181) {
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('[data-nav-toggle]').getAttribute('aria-expanded'), 'false');
          assert(await page.locator('[data-nav-toggle]').evaluate(element => element === document.activeElement));
        } else {
          assert.equal(await page.locator('.footer-disclosure[open]').count(), 2);
          await page.locator('.footer-disclosure summary').first().click();
          assert.equal(await page.locator('.footer-disclosure[open]').count(), 2);
        }
        if (route === '/') {
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
          await page.waitForFunction(() => scrollY < 10);
          await page.locator('.topbar').screenshot({ path: path.join(output, (live ? 'live' : 'local') + '-header-' + width + '.png') });
          await page.locator('.footer').screenshot({ path: path.join(output, (live ? 'live' : 'local') + '-footer-' + width + '.png') });
        }
        checks.push({ route, width, keyboardDropdownAndFooter: true });
      }
      await page.locator('.footer-top').click();
      await page.waitForFunction(() => scrollY < 10);
      assert(await page.locator('#page-top').evaluate(element => element === document.activeElement));
    }
    await page.goto(base + '/');
    await page.locator('.nav-solutions summary').click();
    await page.locator('h1').click();
    assert.equal(await page.locator('.nav-solutions').evaluate(element => element.open), false);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-nav-toggle]').click();
    await page.locator('.nav-solutions summary').click();
    await Promise.all([page.waitForURL('**/customer-portal/'), page.locator('.solutions-menu a[href="/customer-portal/"]').click()]);
    assert.equal(await page.locator('.primary-nav a[aria-current="page"]').getAttribute('href'), '/customer-portal/');
    assert.equal(await page.locator('[data-nav-toggle]').getAttribute('aria-expanded'), 'false');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + '/about-us/');
    await page.locator('.nav-company summary').click();
    assert.equal(await page.locator('.nav-company a[aria-current="page"]').getAttribute('href'), '/about-us/');
    assert(await page.locator('.nav-company summary').evaluate(el => el.classList.contains('is-active')));
    await page.locator('.nav-solutions summary').click();
    assert.equal(await page.locator('.nav-company').evaluate(el => el.open), false);
    await page.locator('.nav-company summary').click();
    assert.equal(await page.locator('.nav-solutions').evaluate(el => el.open), false);
    await Promise.all([page.waitForURL('**/offices/'), page.locator('.nav-company a[href="/offices/"]').click()]);
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
    const plain = await nojs.newPage();
    await plain.goto(base + '/');
    await plain.locator('.nav-solutions summary').click();
    assert.equal(await plain.locator('.solutions-menu a:visible').count(), 7);
    assert.equal(await plain.locator('.footer-disclosure[open]').count(), 2);
    await plain.locator('.nav-markets summary').click();
    assert.equal(await plain.locator('.nav-markets a:visible').count(),6);
    await nojs.close();
    await page.setViewportSize({width:390,height:844});
    await page.goto(base+'/');
    assert.match(await page.locator('h1').innerText(),/Custom software for your\s+sales and operations\./);
    await page.locator('[data-nav-toggle]').click();
    await page.locator('.nav-markets summary').click();
    await Promise.all([page.waitForURL('**/sg/software-development/'),page.locator('.nav-markets a[href="/sg/software-development/"]').click()]);
    assert.equal(await page.locator('.nav-markets a[aria-current="page"]').getAttribute('href'),'/sg/software-development/');
    assert(await page.locator('.nav-markets summary').evaluate(el=>el.classList.contains('is-active')));
    assert.equal(await page.locator('[data-nav-toggle]').getAttribute('aria-expanded'),'false');
    checks.push({ outsideDismissal: true, navigation: true, nativeDesktopFallback: true });
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, (live ? 'live' : 'local') + '-checks.json'), JSON.stringify({ checks, errors, noCustomerDataChanged: true }, null, 2));
    console.log('PASS: ' + checks.length + ' navigation cases; keyboard, active page, responsive footer, back-to-top and native fallback.');
  } finally { if (browser) await browser.close(); if (server) server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

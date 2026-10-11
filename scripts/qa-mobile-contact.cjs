const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..'), output = process.env.QA_OUTPUT || path.join(root, 'qa-results/mobile-contact');
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
        if (url.searchParams.has('source') && ['/', '/demo-request/'].includes(url.pathname)) content = Buffer.from(content.toString().replace(/<body[\s\S]*?<\/body>/, '<body data-page="' + (url.pathname === '/' ? 'home' : 'demo') + '"><div id="site"></div><script src="/assets/site.js" defer></script></body>'));
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

    for (const route of ['/', '/demo-request/', '/demo-request.html', '/contact-us/', ...(!live ? ['/?source=1', '/demo-request/?source=1'] : [])]) {
      for (const width of [360, 390, 760, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + route);
        const bar = page.locator('.mobile-contact-bar');
        assert.equal(await bar.count(), 1);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        assert.equal(await bar.locator('a').first().getAttribute('href'), 'https://wa.me/917011040474');
        assert.equal(await bar.locator('a').first().getAttribute('rel'), 'noopener noreferrer');
        if (width <= 760) {
          if (route.startsWith('/contact-us/')) {
            await page.locator('main form[data-form]').first().scrollIntoViewIfNeeded();
            await page.waitForFunction(() => document.querySelector('.mobile-contact-bar').hidden);
          } else if (!route.includes('demo-request')) {
            await page.waitForFunction(() => !document.querySelector('.mobile-contact-bar').hidden);
            assert(await bar.isVisible());
            assert((await bar.boundingBox()).height >= 68);
            const firstLink = bar.locator('a').first();
            await firstLink.focus();
            assert(await firstLink.evaluate(el => el === document.activeElement));
            await page.locator('[data-nav-toggle]').click();
            assert.equal(await bar.isVisible(), false);
            await page.keyboard.press('Escape');
            assert(await bar.isVisible());
          }
          await page.locator('main form[data-form]').first().scrollIntoViewIfNeeded();
          await page.waitForFunction(() => document.querySelector('.mobile-contact-bar').hidden);
          const input = page.locator('main form[data-form] input:not([type="hidden"]):not([tabindex="-1"])').first();
          await input.focus();
          assert.equal(await bar.isVisible(), false);
          await page.locator('.footer').scrollIntoViewIfNeeded();
          await page.waitForFunction(() => document.querySelector('.mobile-contact-bar').hidden);
        } else assert.equal(await bar.isVisible(), false);
        if (route.includes('demo-request')) {
          assert.equal(await page.locator('.demo-overview article').count(), 3);
          assert((await page.locator('.demo-intro-note').textContent()).includes('until the team confirms'));
          assert.equal(await page.locator('.demo-intro-actions a[href="#demo-form"]').count(), 1);
          assert.equal(await page.locator('.demo-intro-actions a[href="#demo-agenda"]').count(), 1);
          await page.locator('.demo-intro-actions a[href="#demo-form"]').click();
          await page.waitForFunction(() => document.querySelector('.mobile-contact-bar').hidden);
          await page.waitForFunction(() => { const y = document.querySelector('#demo-form').getBoundingClientRect().y; return y >= 70 && y < 300; });
          const form = await page.locator('#demo-form').boundingBox();
          assert(form.y >= 70 && form.y < 300, 'Form target must clear sticky header');
          assert.equal(await page.locator('h1').count(), 1);
        }
        if ((route === '/' || route === '/demo-request/') && [390,1440].includes(width)) {
          await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); scrollTo({top:0,behavior:'instant'}); });
          if (route === '/' && width <= 760) await page.waitForFunction(() => !document.querySelector('.mobile-contact-bar').hidden);
          await page.screenshot({ path: path.join(output, (live?'live':'local') + '-' + (route==='/'?'home':'demo') + '-' + width + '.png') });
        }
        checks.push({route,width,mobileControlsClear:true});
      }
    }
    await page.setViewportSize({width:390,height:900});
    await page.goto(base + '/');
    await page.waitForFunction(() => !document.querySelector('.mobile-contact-bar').hidden);
    await Promise.all([page.waitForURL(url => url.pathname === '/demo-request/'), page.locator('.mobile-contact-demo').click()]);
    assert.equal(await page.locator('.demo-overview article').count(),3);
    const plainContext = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
    const plain = await plainContext.newPage();
    await plain.goto(base + '/');
    assert(await plain.locator('.mobile-contact-bar').isVisible());
    assert.equal(await plain.locator('.mobile-contact-demo').getAttribute('href'), '/demo-request/');
    await plainContext.close();
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,(live?'live':'local')+'-checks.json'),JSON.stringify({checks,errors,noCustomerDataChanged:true},null,2));
    console.log('PASS: '+checks.length+' mobile-contact and demo cases; no submissions.');
  } finally { if (browser) await browser.close(); if (server) server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

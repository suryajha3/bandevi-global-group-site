const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..'), output = process.env.QA_OUTPUT || path.join(root, 'qa-results/service-comparison');
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

    const services = ['Website / App Development Package', 'CRM & ERP Package', 'Complete Travel Website Package'];
    for (const route of ['/', ...(!live ? ['/?source=1'] : [])]) {
      for (const width of [360, 768, 1440]) {
        await page.setViewportSize({width,height:1000});
        await page.goto(base + route);
        const section = page.locator('#compare-services');
        assert.equal(await section.locator('article').count(),3);
        assert.equal(await section.locator('dt').count(),9);
        assert.equal(await page.locator('h1').count(),1);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1));
        const boxes=await section.locator('article').evaluateAll(items=>items.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})));
        if(width<=760) assert(boxes[1].y>boxes[0].y && boxes[2].y>boxes[1].y);
        else assert(boxes.every(box=>Math.abs(box.y-boxes[0].y)<2));
        await section.locator('.button').first().focus();
        assert(await section.locator('.button').first().evaluate(el=>el===document.activeElement));
        if(route==='/') await section.screenshot({path:path.join(output,(live?'live':'local')+'-comparison-'+width+'.png')});
        for(let i=0;i<services.length;i++) {
          if(i) await page.goto(base + route);
          const link=page.locator('#compare-services .button').nth(i);
          const href=new URL(await link.getAttribute('href'),base);
          assert.equal(href.pathname,'/contact-us/');assert.equal(href.hash,'#contact-form');assert.equal(href.searchParams.get('solution'),services[i]);
          await Promise.all([page.waitForURL(url=>url.pathname==='/contact-us/'),link.click()]);
          assert.equal(await page.locator('#contact-interest').inputValue(),services[i]);
          assert.equal(await page.locator('[data-enquiry-questions]').evaluate(el=>el.hidden),false);
          await page.locator('.enquiry-optional summary').click();
          assert(await page.locator('[data-enquiry-questions]').isVisible());
          assert.equal(await page.locator('#contact-name').inputValue(),'');
          checks.push({route,width,service:services[i],prefill:true});
        }
        await page.goto(base + route);
        await Promise.all([page.waitForURL(url=>url.pathname==='/contact-us/'),page.locator('.service-comparison-note a').click()]);
        assert.equal(await page.locator('#contact-interest').inputValue(),'Need guidance');
      }
    }
    const plainContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
    const plain=await plainContext.newPage();await plain.goto(base+'/');
    assert.equal(await plain.locator('#compare-services article').count(),3);
    assert.equal(await plain.locator('#compare-services .button').count(),3);
    await plainContext.close();assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,(live?'live':'local')+'-checks.json'),JSON.stringify({checks,errors,noCustomerDataChanged:true},null,2));
    console.log('PASS: '+checks.length+' comparison/prefill cases and native comparison fallback; no submissions.');
  } finally { if(browser) await browser.close(); if(server) server.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..'), output = process.env.QA_OUTPUT || path.join(root, 'qa-results/projects-currencies');
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
        if (url.searchParams.has('source') && url.pathname === '/case-studies/') content = Buffer.from(content.toString().replace(/<body[\s\S]*?<\/body>/, '<body data-page="cases"><div id="site"></div><script src="/assets/site.js" defer></script></body>'));
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

    for(const route of ['/case-studies/','/case-studies.html',...(!live?['/case-studies/?source=1']:[])]) {
      for(const width of [390,768,1440]) {
        await page.setViewportSize({width,height:1000});await page.goto(base+route);
        const section=page.locator('.project-directory');
        assert.equal(await section.locator('[data-project-category]').count(),4);
        for(const [filter,count] of [['website',1],['travel',3],['crm',0],['all',4]]) {
          const button=section.locator('[data-project-filter='+filter+']');await button.focus();await button.press('Enter');
          assert.equal(await button.getAttribute('aria-pressed'),'true');
          assert.equal(await section.locator('[data-project-category]:visible').count(),count);
          assert.equal(await section.locator('.project-filter-empty').isVisible(),count===0);
          assert((await section.locator('.project-filter-count').textContent()).startsWith(String(count)));
          assert(await button.evaluate(el=>el===document.activeElement));
        }
        const overflow=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,items:Array.from(document.querySelectorAll('main *')).filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(0,5).map(el=>({tag:el.tagName,cls:el.className,right:el.getBoundingClientRect().right}))}));assert(overflow.scrollWidth<=overflow.width+1,JSON.stringify({route,...overflow}));
        if(route==='/case-studies/'){
          const hide=await page.addStyleTag({content:'.topbar,.skip-link,.mobile-contact-bar{visibility:hidden!important}'});
          await section.screenshot({path:path.join(output,(live?'live':'local')+'-projects-'+width+'.png')});await hide.evaluate(el=>el.remove());
        }
        checks.push({route,width,filters:true});
      }
    }
    for(const [code,name,service] of [['bandevi_website','BANDEVI website','Website / App Development Package'],['trip_sarathi','Trip Sarathi','Complete Travel Website Package'],['maximtrip','MaximTrip','Complete Travel Website Package'],['tripodeal','TripOdeal','Complete Travel Website Package']]) {
      await page.goto(base+'/case-studies/');
      const target=page.locator('.project-directory a[href*="project='+code+'"]');
      await Promise.all([page.waitForURL(url=>url.pathname==='/contact-us/'),target.click()]);
      assert.equal(await page.locator('#contact-interest').inputValue(),service);
      assert((await page.locator('[data-enquiry-project]').textContent()).includes(name));
      const currency=page.locator('[name=quoteCurrency]');assert.deepEqual(await currency.locator('option').evaluateAll(items=>items.map(el=>el.value)),['','INR','USD','GBP','EUR']);
      await page.locator('.enquiry-optional summary').click();for(const value of ['INR','USD','GBP','EUR']){await currency.selectOption(value);assert.equal(await currency.inputValue(),value);}
      assert.equal(await currency.getAttribute('required'),null);
      checks.push({code,projectPrefill:true,quoteCurrencies:true});
    }
    const plainContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:1000}});const plain=await plainContext.newPage();await plain.goto(base+'/case-studies/');assert.equal(await plain.locator('.project-directory [data-project-category]:visible').count(),4);assert.equal(await plain.locator('.project-filters').isVisible(),false);await plainContext.close();assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,(live?'live':'local')+'-checks.json'),JSON.stringify({checks,errors,noCustomerDataChanged:true},null,2));console.log('PASS: '+checks.length+' project-filter and quote-currency cases; no submissions.');
  }finally{if(browser)await browser.close();if(server)server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

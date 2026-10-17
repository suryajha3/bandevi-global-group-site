// Exercise the public marketing journey locally. Never send an enquiry or external event.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa-results/regional-travel-choices');
fs.mkdirSync(out,{recursive:true});
let server,browser;
(async()=>{try{
  server=http.createServer((req,res)=>{
    const u=new URL(req.url,'http://local');let file=path.resolve(root,'.'+u.pathname);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
    let body=fs.readFileSync(file);
    if(file.endsWith('.html')&&u.searchParams.has('source'))body=Buffer.from(body.toString().replace(/<body([\s\S]*?)>[\s\S]*?<\/body>/,'<body$1><div id="site"></div><script src="/assets/site.js" defer></script></body>'));
    res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(body);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME}:{});
  const results=[],parity=new Map();
  for(const [slug,country,currency,zone] of [['uk','GB','GBP','Europe/London'],['us','US','USD','America/New_York']])
  for(const width of [390,1440])for(const source of [false,true])for(const acquisition of ['organic','campaign']){
    const c=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await c.newPage(),writes=[],errors=[];
    await c.addInitScript(()=>{localStorage.setItem('bg_analytics_consent_v1',JSON.stringify({choice:'granted',expires:Date.now()+86400000}));window.__events=[];window.gtag=(...args)=>window.__events.push(args);});
    await c.route('**/*',r=>{
      const req=r.request();if(!req.url().startsWith(base))return r.abort();
      if(req.method()!=='GET'){
        if(req.url().endsWith('/api/enquiries'))writes.push(req.postDataJSON());
        return r.fulfill({status:201,json:{ok:true,reference:'BG-'+String(writes.length).padStart(16,'0')}});
      }return r.continue();
    });p.on('pageerror',e=>errors.push(e.message));
    const landing='/blog/automate-payment-workflows-in-travel-agencies/',regional='/'+slug+'/software-development/';
    await p.goto(base+landing+(acquisition==='campaign'?'?utm_source=google&utm_medium=cpc&utm_campaign=regional_travel_qa':''),{referer:'https://www.google.com/'});
    for(const service of ['Travel CRM Package','Travel ERP Package']){
      await p.goto(base+regional+(source?'?source=1':''));
      const card=p.locator('[data-regional-travel-choices]');await card.waitFor();
      assert.equal(await p.locator('#software-services .card').count(),7,'No additional service cards');
      assert.match(await card.innerText(),/Travel CRM: enquiries and sales/);
      assert.match(await card.innerText(),/Travel ERP: booking operations and finance/);
      const content=await card.evaluate(e=>({text:e.innerText,links:[...e.querySelectorAll('a')].map(a=>[a.textContent,a.getAttribute('href')])}));
      if(parity.has(slug))assert.deepEqual(content,parity.get(slug));else parity.set(slug,content);
      const scope=service==='Travel CRM Package'?'/travel-crm/':'/travel-erp/#erp-finance';
      const scopeLink=card.locator('a[href="'+scope+'"]');assert.equal(await scopeLink.count(),1);
      await scopeLink.click();assert.equal(new URL(p.url()).pathname,new URL(scope,base).pathname);
      if(service==='Travel ERP Package'){await p.locator('#erp-finance').waitFor();assert.equal(new URL(p.url()).hash,'#erp-finance');}
      else await p.locator('#service-modules').waitFor();
      await p.goto(base+regional+(source?'?source=1':''));
      const href='?solution='+encodeURIComponent(service)+'#regional-enquiry';
      await p.locator('[data-regional-travel-choices] a[href="'+href+'"]').click();
      await p.waitForFunction(()=>document.querySelector('[data-enquiry-submit]')&&!document.querySelector('[data-enquiry-submit]').disabled);
      const form=p.locator('#regional-enquiry form');
      assert.equal(new URL(p.url()).pathname,regional);assert.equal(new URL(p.url()).hash,'#regional-enquiry');
      assert.equal(await form.locator('[name=interest]').inputValue(),service);
      assert.equal(await form.locator('[name=projectCountry]').inputValue(),country);
      assert.equal(await form.locator('[name=quoteCurrency]').inputValue(),currency);
      assert.equal(await form.locator('[name=name]').inputValue(),'');assert.equal(await form.locator('[name=email]').inputValue(),'');
      await form.locator('[name=name]').fill('Synthetic regional QA');await form.locator('[name=email]').fill('qa@example.test');
      await form.locator('[name=message]').fill('Local intercepted service choice check.');await form.locator('[name=contactTimezone]').selectOption(zone);
      const previous=writes.length;await form.locator('[type=submit]').click();await form.locator('.form-note').filter({hasText:/BG-[0-9A-F]{16}/}).waitFor();
      assert.equal(writes.length,previous+1);const saved=writes.at(-1);
      assert.equal(saved.interest,service);assert.equal(saved.source,regional);assert.equal(saved.qualification.country,country);assert.equal(saved.qualification.currency,currency);
      assert.equal(saved.attribution.landing_page,landing);assert.equal(saved.attribution.channel,acquisition==='campaign'?'paid':'organic_search');
      assert.equal(saved.attribution.utm_source,acquisition==='campaign'?'google':'');assert.equal(saved.attribution.utm_campaign,acquisition==='campaign'?'regional_travel_qa':'');
      const events=await p.evaluate(()=>window.__events.filter(e=>e[1]==='generate_lead'));assert.equal(events.length,1);assert.equal(events[0][2].service_interest,service==='Travel CRM Package'?'travel_crm':'travel_erp');assert.equal(events[0][2].landing_page,landing);assert(!JSON.stringify(events).includes('qa@example.test'));
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
      results.push({slug,width,source,acquisition,service,routingCurrencyAttribution:true});
    }
    if(!source&&acquisition==='organic'){
      await p.goto(base+regional);await p.locator('[data-regional-travel-choices]').screenshot({style:'header,.skip-link,.mobile-contact-bar{visibility:hidden!important}',path:path.join(out,slug+'-'+width+'.png')});
    }await c.close();
  }
  for(const slug of ['uk','us']){
    const c=await browser.newContext({javaScriptEnabled:false}),p=await c.newPage();await c.route('**/*',r=>r.request().url().startsWith(base)&&r.request().method()==='GET'?r.continue():r.abort());
    await p.goto(base+'/'+slug+'/software-development/');assert.equal(await p.locator('[data-regional-travel-choices] a').count(),6);await c.close();
  }
  const report={status:'PASS',cases:results.length,results,staticSourceParity:true,noJavaScriptMarkets:2,productionEnquiries:0,productionAnalyticsEvents:0};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:'PASS',cases:results.length,productionEnquiries:0}));
}finally{if(browser)await browser.close();if(server){server.closeAllConnections();server.close();}}})().catch(e=>{console.error(e);process.exitCode=1;});

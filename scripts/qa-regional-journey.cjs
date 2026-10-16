// Public-site checks only. All enquiry/measurement writes are intercepted, including live mode.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa-results/regional-journey');fs.mkdirSync(out,{recursive:true});
let server,browser;
(async()=>{try{
 let base=process.argv[2],live=!!base;
 if(!base){server=http.createServer((req,res)=>{const u=new URL(req.url,'http://local');let file=path.resolve(root,'.'+u.pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404);return res.end();}let data=fs.readFileSync(file);if(file.endsWith('.html')&&u.searchParams.get('source')==='1')data=Buffer.from(data.toString().replace(/<body([\s\S]*?)>[\s\S]*?<\/body>/,'<body$1><div id="site"></div><script src="/assets/site.js" defer></script></body>'));res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(data);});await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
 browser=await chromium.launch(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME}:{});const results=[];
 for(const source of live?[false]:[false,true])for(const width of [390,1440])for(const [slug,market,currency] of [['uk','GB','GBP'],['us','US','USD']]){
  const c=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await c.newPage(),writes=[],errors=[];let fail=true;
  await c.addInitScript(()=>{window.__events=[];window.gtag=(...args)=>window.__events.push(args);});
  await c.route('**/*',r=>{const req=r.request(),url=req.url();if(!url.startsWith(base))return r.abort();if(req.method()!=='GET'){writes.push({url,data:req.postDataJSON()});if(url.endsWith('/api/enquiries'))return r.fulfill({status:fail?503:201,json:fail?{ok:false,error:'Synthetic retry check'}:{ok:true,reference:'BG-1234567890ABCDEF'}});return r.fulfill({status:200,json:{ok:true}});}return r.continue();});
  p.on('pageerror',e=>errors.push(e.message));
  const regional='/'+slug+'/software-development/',landing=width===390?'/blog/automate-payment-workflows-in-travel-agencies/':regional;await p.goto(base+landing+(source?'?source=1':''),{referer:'https://www.google.com/'});
  if(landing!==regional)await p.locator('main a[href="'+regional+'#regional-enquiry"]').click();
  const walkthrough=p.locator('#project-evidence a[href*="erp-handover-walkthrough"]');
  assert.equal(await walkthrough.count(),1);const href=await walkthrough.getAttribute('href');assert.equal(new URL(href,base).searchParams.get('market'),market,'Regional walkthrough link must explicitly retain market');
  await walkthrough.click();await p.waitForFunction(()=>document.querySelector('#erp-handover-walkthrough')?.dataset.ready==='true');
  const demo=p.locator('#erp-handover-walkthrough');assert.equal(await demo.locator('[data-erp-market]').inputValue(),market);
  await demo.locator('[data-erp-step="2"]').click();assert.equal(await demo.locator('[data-erp-amount="4200"]').innerText(),currency+' 4,200');
  await demo.locator('[data-erp-market]').selectOption(market==='GB'?'US':'GB');await demo.locator('[data-erp-reset]').click();assert.equal(await demo.locator('[data-erp-market]').inputValue(),market,'Reset must retain the entry market');
  await demo.locator('[data-erp-enquiry]').click();await p.waitForFunction(()=>document.querySelector('[data-enquiry-submit]')&&!document.querySelector('[data-enquiry-submit]').disabled);
  assert.equal(new URL(p.url()).pathname,regional);const form=p.locator('#regional-enquiry form');
  assert.equal(await form.locator('[name=projectCountry]').inputValue(),market);assert.equal(await form.locator('[name=quoteCurrency]').inputValue(),currency);assert.equal(await form.locator('[name=interest]').inputValue(),'Travel ERP Package');
  assert.equal(await form.locator('[name=name]').inputValue(),'');assert.equal(await form.locator('[name=email]').inputValue(),'');
  await form.locator('[name=name]').fill('Synthetic QA');await form.locator('[name=email]').fill('qa@example.test');await form.locator('[name=message]').fill('Synthetic handover review only');await form.locator('[type=submit]').click();await form.locator('.form-note').filter({hasText:'Synthetic retry check'}).waitFor();assert.equal(await form.locator('[name=message]').inputValue(),'Synthetic handover review only');
  assert.equal(await p.evaluate(()=>window.__events.filter(e=>e[1]==='generate_lead').length),0);
  fail=false;await form.locator('[type=submit]').click();await form.locator('.form-note').filter({hasText:'BG-1234567890ABCDEF'}).waitFor();
  const submissions=writes.filter(w=>w.url.endsWith('/api/enquiries'));assert.equal(submissions.length,2);assert.equal(submissions[0].data.attribution.channel,'organic_search');assert.equal(submissions[1].data.attribution.landing_page,landing);assert.equal(submissions[1].data.source,regional);assert.match(submissions[1].data.message,new RegExp('Preferred quote currency: '+currency));
  const events=await p.evaluate(()=>window.__events.filter(e=>e[1]==='generate_lead'));assert.equal(events.length,1);assert.equal(events[0][2].project_market,market);assert.equal(events[0][2].service_interest,'travel_erp');assert(!JSON.stringify(events).includes('qa@example.test'));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  const actions=form.locator('.receipt-actions');assert.equal(await actions.evaluate(e=>getComputedStyle(e).display),'flex');for(const link of await actions.locator('a').all())assert((await link.boundingBox()).height>=44,'Receipt contact links need distinct touch targets');
  if(!source)await p.locator('#regional-enquiry').screenshot({style:'header,.skip-link{visibility:hidden!important}',path:path.join(out,(live?'live':'local')+'-'+slug+'-'+width+'.png')});results.push({slug,width,source,marketPreserved:true,organicAttribution:true,retryAndSavedReceipt:true,receiptContactTargets:true});await c.close();
 }
 for(const market of ['GB','US','untrusted']){const c=await browser.newContext(),p=await c.newPage();await c.route('**/*',r=>!r.request().url().startsWith(base)?r.abort():r.request().method()!=='GET'?r.fulfill({status:204}):r.continue());await p.goto(base+'/travel-erp/?market='+market);await p.waitForFunction(()=>document.querySelector('#erp-handover-walkthrough')?.dataset.ready==='true');assert.equal(await p.locator('[data-erp-market]').inputValue(),market==='GB'?'GB':'US');await c.close();}
 const report={status:'PASS',mode:live?'live':'local',results,explicitMarketAllowlist:true,productionSubmissions:0};fs.writeFileSync(path.join(out,(live?'live':'local')+'-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{if(browser)await browser.close();if(server){server.closeAllConnections();server.close();}}})().catch(e=>{console.error(e);process.exitCode=1;});

const completeRouting=require('./qa-qualification-fields.cjs');
// Exercise real navigation and captured API payloads; never send production writes.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa-results/erp-finance-planning');fs.mkdirSync(out,{recursive:true});
const guides=[['automate-payment-workflows-in-travel-agencies','erp-finance']];
let server,browser;
(async()=>{try{
 let base=process.argv[2],live=!!base;
 if(!base){server=http.createServer((req,res)=>{const u=new URL(req.url,'http://local');let f=path.resolve(root,'.'+u.pathname);if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end();}if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)){res.writeHead(404);return res.end();}let data=fs.readFileSync(f);if(f.endsWith('.html')&&u.searchParams.has('source'))data=Buffer.from(data.toString().replace(/<body([\s\S]*?)>[\s\S]*?<\/body>/,'<body$1><div id="site"></div><script src="/assets/site.js" defer></script><script src="/assets/erp-handover-demo.js" defer></script></body>'));res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(f)]||'application/octet-stream');res.end(data);});await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
 browser=await chromium.launch(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME}:{});const results=[];
 for(const [slug,focus] of guides)for(const width of [390,1440])for(const source of live?[false]:[false,true]){
  let canonicalText;
  for(const journey of ['demo','uk','us']){
   const c=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await c.newPage(),writes=[],errors=[];
   await c.addInitScript(()=>{window.__events=[];window.gtag=(...a)=>window.__events.push(a);});
   await c.route('**/*',r=>{const req=r.request();if(!req.url().startsWith(base))return r.abort();if(req.method()!=='GET'){writes.push({url:req.url(),data:req.postDataJSON()});return r.fulfill({status:req.url().endsWith('/api/enquiries')?201:200,json:req.url().endsWith('/api/enquiries')?{ok:true,reference:'BG-1234567890ABCDEF'}:{ok:true}});}return r.continue();});p.on('pageerror',e=>errors.push(e.message));
   const landing='/blog/'+slug+'/';await p.goto(base+landing+(source?'?source=1':''),{referer:'https://www.google.com/'});await p.locator('#guide-project-path').waitFor();
   assert.equal(await p.locator('h1').count(),1);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const schemas=(await p.locator('script[type="application/ld+json"]').allTextContents()).map(JSON.parse);assert(schemas.some(s=>['Article','BlogPosting'].includes(s['@type'])&&s.dateModified==='2026-10-16'));
   for(const a of await p.locator('#guide-project-path a').all()){const href=await a.getAttribute('href');assert(!href.includes('utm_'));assert.equal((await c.request.get(base+href)).status(),200);}
   await p.locator('#guide-project-path a[href="/travel-erp/"]').click();
   await p.locator('#erp-finance').waitFor();
   assert.equal(await p.locator('#erp-finance-title').innerText(),'Plan your travel payment records and approval workflow');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   for(const a of await p.locator('#erp-finance a').all()){const href=await a.getAttribute('href');assert(!href.includes('utm_'));if(href.startsWith('#'))assert.equal(await p.locator(href).count(),1);else assert.equal((await c.request.get(base+href)).status(),200);}
   await p.locator('[data-finance-enquiry="'+journey+'"]').click();
   if(journey==='demo')await p.locator('[name=demoFocus] option[value="'+focus+'"]').waitFor({state:'attached'});
   else await p.waitForFunction(()=>document.querySelector('[data-enquiry-submit]')&&!document.querySelector('[data-enquiry-submit]').disabled);
   const form=journey==='demo'?p.locator('form[data-form=demo]'):p.locator('#regional-enquiry form');assert.equal(await form.locator('[name=interest]').inputValue(),'Travel ERP Package');
   assert.equal(await form.locator('[name=name]').inputValue(),'');assert.equal(await form.locator('[name=email]').inputValue(),'');
   if(journey==='demo')assert.equal(await form.locator('[name=demoFocus]').inputValue(),focus);
   else {assert.equal(await form.locator('[name=projectCountry]').inputValue(),journey==='uk'?'GB':'US');assert.equal(await form.locator('[name=quoteCurrency]').inputValue(),journey==='uk'?'GBP':'USD');}
   await form.locator('[name=name]').fill('Synthetic guide QA');await form.locator('[name=email]').fill('qa@example.test');await form.locator('[name=message]').fill('Synthetic guide enquiry; intercepted, never sent.');await completeRouting(form);await form.locator('[type=submit]').click();await form.locator('.form-note').filter({hasText:'BG-1234567890ABCDEF'}).waitFor();
   const saved=writes.filter(w=>w.url.endsWith('/api/enquiries'));assert.equal(saved.length,1);assert.equal(saved[0].data.attribution.channel,'organic_search');assert.equal(saved[0].data.attribution.landing_page,landing);assert.equal(saved[0].data.attribution.utm_source,'');assert.equal(saved[0].data.source,new URL(p.url()).pathname);
   const events=await p.evaluate(()=>window.__events.filter(e=>e[1]==='generate_lead'));assert.equal(events.length,1);assert.equal(events[0][2].landing_page,landing);assert(!JSON.stringify(events).includes('qa@example.test'));assert.deepEqual(errors,[]);
   results.push({slug,width,source,journey,originalLandingAndOrganicChannel:true,servicePrefill:true});await c.close();
  }
  const c=await browser.newContext({viewport:{width,height:1000}}),p=await c.newPage();await c.route('**/*',r=>!r.request().url().startsWith(base)?r.abort():r.request().method()!=='GET'?r.fulfill({status:200,json:{ok:true}}):r.continue());await p.goto(base+'/travel-erp/');await p.locator('#erp-finance').screenshot({style:'header,.skip-link,.mobile-contact-bar{visibility:hidden!important}',path:path.join(out,(live?'live':'local')+'-'+focus+'-'+width+'.png')});
  if(!live){const text=await p.locator('#erp-finance').innerText();await p.goto(base+'/travel-erp/?source=1');await p.locator('#erp-finance').waitFor();assert.equal((await p.locator('#erp-finance').innerText()).replace(/\s+/g,' '),text.replace(/\s+/g,' '),'Static/source parity');}await c.close();
 }
 const report={status:'PASS',mode:live?'live':'local',cases:results.length,results,productionSubmissions:0};fs.writeFileSync(path.join(out,(live?'live':'local')+'-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:'PASS',cases:results.length,productionSubmissions:0}));
}finally{if(browser)await browser.close();if(server){server.closeAllConnections();server.close();}}})().catch(e=>{console.error(e);process.exitCode=1;});

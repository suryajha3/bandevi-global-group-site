const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.QA_OUTPUT||path.join(root,'qa-results/guided-enquiry'),live=process.argv[2];
fs.mkdirSync(out,{recursive:true});let server,browser;
(async()=>{const checks=[],errors=[];try{
 let base=live;if(!base){server=http.createServer((req,res)=>{const u=new URL(req.url,'http://local');let f=path.join(root,u.pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'})[path.extname(f)]||'application/octet-stream');let data=fs.readFileSync(f);if(u.pathname==='/'&&u.searchParams.get('source')==='1')data=Buffer.from(data.toString().replace(/<body[\s\S]*?<\/body>/,'<body data-page="home"><div id="site"></div><script src="/assets/site.js" defer></script></body>'));res.end(data);});await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
 browser=await chromium.launch(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME}:{});
 const c=await browser.newContext({reducedMotion:'reduce'});await c.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
 const choices=[
 {value:'Website / App Development Package',project:'bandevi_website',tab:3,copy:'app scope is discussed separately',link:'/website-mobile-app-development/'},
 {value:'Complete Travel Website Package',project:'trip_sarathi',tab:0,copy:'provider approvals',link:'/travel-technology/'},
 {value:'CRM & ERP Package',project:null,copy:'illustrative CRM demo',link:'/sample-crm/'},
 {value:'Customer Portal Package',project:null,copy:'access rules',link:'/customer-portal/'},
 {value:'Need guidance',project:null,copy:'right starting point',link:'/case-studies/#project-directory'}
 ];
 for(const route of ['/',...(!live?['/?source=1']:[])])for(const width of [360,768,1440]){
  for(const choice of choices){
   await p.setViewportSize({width,height:1000});await p.goto(base+route);const service=p.locator('#home-project-service');await p.locator('[data-featured-index]').first().waitFor();await service.focus();await service.selectOption(choice.value);
   assert(await service.evaluate(e=>e===document.activeElement));
   assert.match(await p.locator('[data-home-service-summary]').innerText(),new RegExp(choice.copy));assert.equal(await p.locator('[data-home-service-link]').getAttribute('href'),choice.link);assert.equal(await p.locator('[data-home-project]').isDisabled(),!choice.project);
   if(choice.project){assert.equal(await p.locator('[data-home-project]').inputValue(),choice.project);assert.equal(await p.locator('[data-featured-index="'+choice.tab+'"]').getAttribute('aria-selected'),'true');}
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await Promise.all([p.waitForURL(u=>u.pathname==='/contact-us/'),p.locator('.home-project-choice button[type="submit"]').click()]);
   assert.equal(new URL(p.url()).searchParams.get('project'),choice.project);assert.equal(await p.locator('#contact-interest').inputValue(),choice.value);assert.equal(await p.locator('#contact-name').inputValue(),'');assert.equal(await p.locator('#contact-email').inputValue(),'');
   if(choice.project)assert.match(await p.locator('[data-enquiry-project]').innerText(),choice.project==='bandevi_website'?/BANDEVI website/:/Trip Sarathi/);
   checks.push({route,width,service:choice.value,enquiryPrefill:true});
  }
  await p.goto(base+route);await p.locator('[data-featured-index]').first().waitFor();await p.locator('#home-project-service').selectOption('Website / App Development Package');await p.locator('[data-featured-index="1"]').click();assert(await p.locator('[data-home-project]').isDisabled());
  const link=p.locator('[data-featured-discuss]'),query=new URL(await link.getAttribute('href'),base);assert.equal(query.searchParams.get('project'),'maximtrip');assert.equal(query.searchParams.get('solution'),'Complete Travel Website Package');await Promise.all([p.waitForURL(u=>u.pathname==='/contact-us/'),link.click()]);assert.equal(await p.locator('#contact-interest').inputValue(),'Complete Travel Website Package');assert.match(await p.locator('[data-enquiry-project]').innerText(),/MaximTrip/);checks.push({route,width,manualProjectEnquiry:true});
  if(route==='/'){await p.goto(base+route);await p.locator('#home-project-service').selectOption('Website / App Development Package');await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});await p.screenshot({path:path.join(out,(live?'live':'local')+'-guided-'+width+'.png')});}
 }
 await c.close();const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});await plain.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());const q=await plain.newPage();await q.goto(base+'/');assert(await q.locator('[data-home-service-summary]').isVisible());assert(await q.locator('[data-featured-discuss]').isVisible());await q.locator('#home-project-service').selectOption('CRM & ERP Package');await Promise.all([q.waitForURL(u=>u.pathname==='/contact-us/'),q.locator('.home-project-choice button[type="submit"]').click()]);assert.equal(new URL(q.url()).searchParams.get('solution'),'CRM & ERP Package');assert.equal(new URL(q.url()).searchParams.get('project'),null);checks.push({noJavaScriptServiceEnquiry:true});await plain.close();assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,(live?'live':'local')+'-checks.json'),JSON.stringify(checks,null,2));console.log('PASS: '+checks.length+' guided services, project enquiry prefill and no-JavaScript checks');
 }finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});

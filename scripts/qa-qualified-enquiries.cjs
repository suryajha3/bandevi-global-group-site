const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');let server,browser;
(async()=>{try{
 server=http.createServer((req,res)=>{const u=new URL(req.url,'http://local');let file=path.join(root,u.pathname);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404);return res.end();}let data=fs.readFileSync(file);if(u.searchParams.has('source'))data=Buffer.from(data.toString().replace(/<body[^>]*>[\s\S]*?<\/body>/,'<body data-page="contact"><div id="site"></div><script src="/assets/site.js" defer></script></body>'));res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(data);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch();let cases=0;
 for(const source of [false,true])for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:1000}});await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/contact-us/'+(source?'?source=1':''));const form=page.locator('[data-form=contact]');let payloads=[];
  await page.route('**/api/enquiries',r=>{payloads.push(r.request().postDataJSON());return r.fulfill({status:201,json:{ok:true,reference:'BG-1234567890ABCDEF'}});});
  for(const [country,currency,zone] of [['US','USD','America/Chicago'],['GB','GBP','Europe/London'],['IN','INR','Asia/Kolkata']]){
   await form.locator('[name=name]').fill('Synthetic contact');await form.locator('[name=email]').fill('qa@example.test');await form.locator('[name=interest]').selectOption('Website development');await form.locator('[name=message]').fill('Synthetic project for local QA only.');
   const before=payloads.length;await form.locator('[type=submit]').click();assert.equal(payloads.length,before,'Missing country must not submit');
   await form.locator('[name=projectCountry]').selectOption(country);if(country==='US'){await form.locator('[type=submit]').click();assert.equal(payloads.length,before,'US time zone must be explicit');await form.locator('[name=contactTimezone]').selectOption(zone);}
   assert.equal(await form.locator('[name=quoteCurrency]').inputValue(),currency);await form.locator('[name=projectBudget]').fill('Private planning range');await form.locator('[type=submit]').click();await form.locator('.form-note').filter({hasText:'BG-1234567890ABCDEF'}).waitFor();assert.equal(payloads.length,before+1);assert.deepEqual(payloads.at(-1).qualification,{version:1,country,currency,budget:'Private planning range',contact:{channel:'Discuss',date:'',time:'',timezone:zone}});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));cases++;
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS '+cases+' qualified enquiry cases: required country, US time zone, correct currency, optional budgets, structured payload and responsive forms.');
}finally{if(browser)await browser.close();if(server){server.closeAllConnections();server.close();}}})().catch(e=>{console.error(e);process.exitCode=1;});

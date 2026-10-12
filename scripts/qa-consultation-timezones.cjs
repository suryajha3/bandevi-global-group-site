const {chromium}=require('playwright');
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const slots=['2026-10-24T12:00:00Z','2026-10-26T12:00:00Z','2026-10-30T12:00:00Z','2026-11-02T12:00:00Z'].map((date,i)=>({id:String(i+1).padStart(24,'0'),starts:Date.parse(date)/1000,duration:30}));
let server,browser;
(async()=>{try{
 server=http.createServer((req,res)=>{const url=new URL(req.url,'http://local');let file=path.join(root,url.pathname);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME}:{});
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:950},timezoneId:'Europe/London',locale:'en-GB'});
  await context.route('**/*',route=>{const u=route.request().url();if(u.includes('/api/demo/slots'))return route.fulfill({json:{timezone:'Asia/Kolkata',slots}});if(u.includes('/api/demo/manage'))return route.fulfill({json:{state:'confirmed',enquiry_id:'BG-SYNTHETIC',version:0,...slots[0]}});return u.startsWith(base)?route.continue():route.abort();});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const url of ['/demo-request/','/demo-request.html']){
   await page.goto(base+url);await page.locator('#confirmed-slot option').nth(4).waitFor({state:'attached'});
   assert.equal(await page.locator('#demo-timezone').inputValue(),'Europe/London');
   let text=await page.locator('#confirmed-slot option').allTextContents();assert.match(text[1],/13:00/);assert.match(text[2],/12:00/);
   await page.locator('#confirmed-slot').selectOption(slots[1].id);
   await page.locator('#demo-timezone').selectOption('America/New_York');
   await page.waitForFunction(()=>document.querySelector('#confirmed-slot option:last-child').textContent.includes('America/New York'));
   text=await page.locator('#confirmed-slot option').allTextContents();assert.match(text[3],/08:00/);assert.match(text[4],/07:00/);
   assert.equal(await page.locator('#confirmed-slot').inputValue(),slots[1].id);assert.equal(await page.locator('#demo-time').isDisabled(),true);
   await page.locator('#demo-timezone').selectOption('Asia/Singapore');await page.waitForFunction(()=>document.querySelector('#confirmed-slot option:last-child').textContent.includes('Singapore'));
   text=await page.locator('#confirmed-slot option').allTextContents();assert.match(text[1],/20:00/);assert.match(text[1],/17:30 IST/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  }
  await page.goto(base+'/demo-booking/#'+'a'.repeat(64));await page.locator('#reschedule-slot option').nth(4).waitFor({state:'attached'});
  await page.locator('#demo-timezone').selectOption('America/Los_Angeles');await page.waitForFunction(()=>document.querySelector('#booking-status').textContent.includes('America/Los Angeles'));
  assert.match(await page.locator('#booking-status').innerText(),/05:00/);assert.match(await page.locator('#booking-status').innerText(),/17:30 IST/);
  await page.screenshot({path:path.join(root,'qa-results','consultation-timezones-'+width+'.png'),fullPage:true});
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('Passed: both demo routes, detected timezone, UK/US daylight-saving transitions, Singapore conversion, selected-slot preservation, manager display and mobile/desktop layout. No real enquiries or bookings sent.');
}finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}})().catch(e=>{console.error(e);process.exitCode=1;});

const completeRouting=require('./qa-qualification-fields.cjs');
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa-results/demo-local-time');let server,browser;
async function checkRegionalAvailability(browser,base,source,slug,market,expectedZone,width){
 const context=await browser.newContext({viewport:{width,height:850},locale:'en-GB',timezoneId:'America/Los_Angeles',extraHTTPHeaders:{DNT:'1'}});
 try {
  const page=await context.newPage();
  await page.clock.setFixedTime(new Date('2026-10-28T06:00:00Z'));
  const slot={id:'a'.repeat(24),starts:Date.parse('2026-11-02T15:00:00Z')/1000,duration:30};
  let mode='available',payload;
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin!==base)return route.abort();
   if(url.pathname==='/api/demo/slots')return route.fulfill({status:mode==='error'?503:200,json:{slots:mode==='available'?[slot]:[]}});
   if(url.pathname==='/api/enquiries'){
    payload=route.request().postDataJSON();
    return route.fulfill({status:201,json:{ok:true,reference:'BG-1234567890ABCDEF',appointment:payload.slotId?{confirmed:true,...slot}:null}});
   }
   return url.pathname.startsWith('/api/')?route.abort():route.continue();
  });
  const path='/'+slug+'/travel-agency-crm/';
  const start=base+path+'?utm_campaign=travel_crm_qa'+(source?'&source=1':'');
  await page.goto(start);
  const preview=page.locator('[data-crm-availability]');
  await preview.locator('summary').click();
  const zone=preview.getByLabel('Your time zone');
  const choice=preview.getByLabel('Available demo times');
  await choice.locator('option').nth(1).waitFor({state:'attached'});
  assert.equal(await zone.inputValue(),expectedZone);
  assert.match(await choice.innerText(),{US:/07:00/,GB:/15:00/,IN:/20:30/}[market]);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await zone.selectOption('America/Chicago');
  assert.match(await choice.innerText(),/09:00/);
  await choice.selectOption(slot.id);
  if(!source&&market==='GB')mode='empty';
  await preview.getByRole('button',{name:'Continue to booking'}).click();
  await page.waitForURL(url=>url.pathname==='/demo-request/');
  if(mode==='empty'){
   await page.getByText('Your selected time is no longer available.',{exact:false}).waitFor();
   assert(await page.locator('#demo-local-date').isVisible());
  }else{
   await page.waitForFunction(id=>document.querySelector('#confirmed-slot')?.value===id,slot.id);
   assert(await page.locator('.demo-schedule').isHidden());
  }
  assert.equal(await page.locator('#demo-timezone').inputValue(),'America/Chicago');
  assert.equal(await page.locator('[name=projectCountry]').inputValue(),market);
  if(!source&&market==='US'){
   await page.locator('#demo-name').fill('Synthetic CRM demo');
   await page.locator('#demo-email').fill('qa@example.invalid');
   await page.locator('#demo-message').fill('Isolated regional booking check.');
   const form=page.locator('form[data-form]');
   await completeRouting(form);
   await form.locator('button[type=submit]').click();
   await page.getByText('Confirmed in your time zone:',{exact:false}).waitFor();
   assert.equal(payload.slotId,slot.id);
   assert.equal(payload.qualification.country,market);
   assert.equal(payload.attribution.crm_promotion,'availability-slot');
   assert.equal(payload.attribution.landing_page,path);
   assert.equal(payload.attribution.utm_campaign,'travel_crm_qa');
  }
  if(!source&&market==='IN'){
   mode='error';
   await page.goto(start);
   await preview.locator('summary').click();
   await preview.getByText('Demo times could not be loaded.',{exact:false}).waitFor();
   mode='empty';
   await preview.getByRole('button',{name:'Refresh times'}).click();
   await preview.getByText('No demo times are available right now.',{exact:false}).waitFor();
   assert(await choice.isHidden());
   await zone.selectOption('Europe/London');
   await preview.getByRole('link',{name:'Request a preferred time'}).click();
   await page.waitForURL(url=>url.pathname==='/demo-request/');
   assert.equal(await page.locator('#demo-timezone').inputValue(),'Europe/London');
   await page.locator('#demo-local-date').fill('2026-11-02');
   await page.locator('#demo-local-time').fill('15:00');
   await page.locator('#demo-name').fill('Synthetic CRM time request');
   await page.locator('#demo-email').fill('qa@example.invalid');
   await page.locator('#demo-message').fill('Isolated preferred-time check.');
   const form=page.locator('form[data-form]');
   await completeRouting(form);
   await form.locator('button[type=submit]').click();
   await page.getByText('Requested in your time zone:',{exact:false}).waitFor();
   assert.deepEqual(payload.demoSchedule,{date:'2026-11-02',time:'20:30',timezone:'Asia/Kolkata'});
   assert.equal(payload.slotId,undefined);
   assert.equal(payload.qualification.country,market);
   assert.equal(payload.attribution.crm_promotion,'availability-request');
  }
 }finally{await context.close();}
}
async function checkSampleBooking(browser,base,market,zone,workflow){
 const context=await browser.newContext({viewport:{width:390,height:900},locale:'en-GB',timezoneId:'America/Los_Angeles'});
 try{
  const page=await context.newPage(),completions=[];
  let submitted;
  const slot={id:'c'.repeat(24),starts:Date.parse('2026-11-12T16:00:00Z')/1000,duration:30};
  await page.clock.setFixedTime(new Date('2026-11-07T10:00:00Z'));
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin!==base)return route.abort();
   if(url.pathname==='/api/measurement'){
    const event=route.request().postDataJSON();
    if(event.event==='sample_complete')completions.push(event);
    return route.fulfill({json:{ok:true}});
   }
   if(url.pathname==='/api/demo/slots')return route.fulfill({json:{slots:market==='GB'?[]:[slot]}});
   if(url.pathname==='/api/enquiries'){
    submitted=route.request().postDataJSON();
    return route.fulfill({status:201,json:{ok:true,reference:'BG-1234567890ABCDEF',appointment:submitted.slotId?{confirmed:true,...slot}:null}});
   }
   return url.pathname.startsWith('/api/')?route.abort():route.continue();
  });
  await page.goto(base+'/sample-crm/');
  const book=page.getByRole('button',{name:'Book a demo for my agency'});
  assert.equal(await book.count(),0);
  if(workflow==='crm-pipeline'){
   await page.locator('#sample-stage').selectOption('Contacted');
   await page.locator('#sample-move').click();
   await page.locator('#guide-review').click();
  }else{
   await page.locator('#travel-demo-quote').click();
   await page.locator('#travel-demo-approved').check();
   await page.locator('#travel-demo-handover').press('Enter');
   await page.locator('#finance-deposit').click();
  }
  await page.getByLabel('Business market',{exact:true}).selectOption(market);
  await book.click();
  await page.waitForURL(url=>url.pathname==='/demo-request/');
  const url=new URL(page.url());
  assert.equal(url.searchParams.get('sample_workflow'),workflow);
  assert.equal(url.searchParams.get('market'),market);
  assert(!url.search.includes(completions[0]?.journey));
  if(market==='IN'){
   url.searchParams.set('source','1');
   await page.goto(url.href);
  }
  await page.locator('#confirmed-slot').waitFor();
  assert.equal(await page.locator('#demo-timezone').inputValue(),zone);
  assert.equal(await page.locator('[name=projectCountry]').inputValue(),market);
  assert.equal(await page.locator('[name=demoFocus]').inputValue(),workflow==='crm-pipeline'?'business-leads':'crm-handover');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(market==='GB'){
   await page.getByText('No demo slots are published right now.',{exact:false}).waitFor();
   assert(await page.locator('#demo-local-date').isVisible());
  }else{
   await page.locator('#confirmed-slot').selectOption(slot.id);
   assert(await page.locator('.demo-schedule').isHidden());
  }
  await page.locator('#demo-name').fill('Synthetic CRM walkthrough');
  await page.locator('#demo-email').fill('qa@example.invalid');
  const form=page.locator('form[data-form="demo"]');
  await form.locator('button[type=submit]').click();
  await page.locator('.form-note').filter({hasText:'BG-1234567890ABCDEF'}).waitFor();
  assert.equal(submitted.slotId,market==='GB'?undefined:slot.id);
  assert.equal(submitted.qualification.country,market);
  assert.match(submitted.message,/Requested walkthrough:/);
  assert.equal(submitted.sampleJourney.workflow,workflow);
  assert(completions.some(event=>event.market===market&&event.journey===submitted.sampleJourney.journey));
 }finally{await context.close();}
}

(async()=>{const checks=[];try{
 fs.mkdirSync(out,{recursive:true});server=http.createServer((req,res)=>{const u=new URL(req.url,'http://local');let file=path.join(root,u.pathname);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream');let data=fs.readFileSync(file);if(u.searchParams.has('source'))data=Buffer.from(data.toString().replace(/<body([^>]*)>[\s\S]*?<\/body>/,'<body$1><div id="site"></div><script src="/assets/site.js" defer></script></body>'));res.end(data);});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME}:{});
 for(const source of [false,true])for(const width of [390,1440]){
  const c=await browser.newContext({viewport:{width,height:950},timezoneId:'America/New_York',extraHTTPHeaders:{DNT:'1'}}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await c.addInitScript(()=>{const RealDate=Date;window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:['2026-10-12T06:00:00Z']));}static now(){return new RealDate('2026-10-12T06:00:00Z').getTime();}};});
  let prepBrief={goal:'',tools:'',teammate:'',version:0};
  let payload,availability='available',conflict=false;const slot={id:'a'.repeat(24),starts:Date.parse('2026-11-02T15:00:00Z')/1000,duration:30},token='b'.repeat(64);
  await c.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!==base)return r.abort();if(u.pathname==='/api/demo/slots')return r.fulfill({status:availability==='error'?503:200,json:{slots:availability==='available'?[slot]:[]}});if(u.pathname==='/api/enquiries'){payload=r.request().postDataJSON();return r.fulfill({status:conflict?409:201,json:conflict?{error:'That demo time is no longer available. Choose another slot.'}:{ok:true,reference:'BG-1234567890ABCDEF',appointment:payload.slotId?{confirmed:true,starts:slot.starts,duration:30,manageUrl:'/demo-booking/#'+token}:null}});}if(u.pathname==='/api/demo/manage'){const data=r.request().postDataJSON();assert.equal(data.token,token);if(data.action==='save-prep'){assert.equal(data.prepVersion,prepBrief.version);assert.equal(data.version,0);prepBrief={goal:data.goal,tools:data.tools,teammate:data.teammate,version:prepBrief.version+1};}return r.fulfill({json:data.action==='calendar'?{calendar:'BEGIN:VCALENDAR\r\nDTSTART:20261102T150000Z\r\nEND:VCALENDAR'}:{state:'confirmed',starts:slot.starts,duration:30,enquiry_id:'BG-1234567890ABCDEF',version:0,prepBrief}});}if(u.pathname.startsWith('/api/'))return r.fulfill({status:503,json:{error:'Isolated preview'}});return r.continue();});
  const url=base+'/demo-request/'+(source?'?source=1&solution=CRM%20%26%20ERP%20Package':'?solution=CRM%20%26%20ERP%20Package');await p.goto(url);await p.locator('#demo-timezone').waitFor();assert.equal(await p.locator('#demo-timezone').inputValue(),'America/New_York');await p.locator('#confirmed-slot option').nth(1).waitFor({state:"attached"});assert.match(await p.locator('#confirmed-slot').innerText(),/10:00/);
  await p.locator('#demo-local-date').fill('2026-11-02');await p.locator('#demo-local-time').fill('10:00');assert.equal(await p.locator('[name="demoTime"]').inputValue(),'20:30');await p.locator('#demo-timezone').selectOption('Europe/London');assert.equal(await p.locator('#demo-local-time').inputValue(),'15:00');assert.equal(await p.locator('[name="demoTime"]').inputValue(),'20:30');
  await p.locator('#demo-timezone').selectOption('America/New_York');for(const [day,time,copy]of [['2026-11-01','01:30','twice'],['2027-03-14','02:30','does not exist']]){await p.locator('#demo-local-date').fill(day);await p.locator('#demo-local-time').fill(time);assert.match(await p.locator('#demo-local-time').evaluate(e=>e.validationMessage),new RegExp(copy));assert.equal(await p.locator('[name="demoTime"]').inputValue(),'');}
  await p.locator('#demo-local-date').fill('2026-11-02');await p.locator('#demo-local-time').fill('10:00');await p.locator('#demo-name').fill('Fictional QA');await p.locator('#demo-email').fill('qa@example.invalid');await p.locator('#demo-message').fill('Isolated time-zone test only.');await completeRouting(p.locator('form[data-form]'));await p.locator('form[data-form] button[type="submit"]').click();await p.locator('.form-note').filter({hasText:'not booked yet'}).waitFor();assert.deepEqual(payload.demoSchedule,{date:'2026-11-02',time:'20:30',timezone:'Asia/Kolkata'});assert.equal(await p.getByRole('button',{name:'Add confirmed demo to calendar (.ics)',exact:true}).count(),0);
  await p.locator('#confirmed-slot').selectOption(slot.id);assert(await p.locator('.demo-schedule').isHidden());await p.locator('#demo-name').fill('Fictional QA');await p.locator('#demo-email').fill('qa@example.invalid');await p.locator('#demo-message').fill('Isolated slot test only.');await p.locator('#demo-interest').selectOption('CRM & ERP Package');conflict=true;await completeRouting(p.locator('form[data-form]'));await p.locator('form[data-form] button[type="submit"]').click();await p.locator('.form-note').filter({hasText:'no longer available'}).waitFor();assert.equal(await p.getByRole('button',{name:'Add confirmed demo to calendar (.ics)',exact:true}).count(),0);conflict=false;await completeRouting(p.locator('form[data-form]'));await p.locator('form[data-form] button[type="submit"]').click();await p.getByRole('button',{name:'Add confirmed demo to calendar (.ics)',exact:true}).waitFor();assert.equal(payload.slotId,slot.id);assert.equal(payload.demoSchedule,undefined);const [download]=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'Add confirmed demo to calendar (.ics)',exact:true}).click()]);assert.equal(download.suggestedFilename(),'bandevi-demo.ics');
  await p.goto(url);await p.locator('#demo-timezone').waitFor();availability='empty';await p.getByRole('button',{name:'Refresh available times'}).click();await p.locator('.confirmed-slots p').filter({hasText:'No demo slots'}).waitFor();assert(await p.locator('#demo-local-date').isVisible());availability='error';await p.getByRole('button',{name:'Refresh available times'}).click();await p.locator('.confirmed-slots p').filter({hasText:'could not be loaded'}).waitFor();assert(await p.locator('#demo-local-date').isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('.demo-schedule').screenshot({path:path.join(out,'preferred-'+source+'-'+width+'.png')});
  availability='available';await p.goto(base+'/demo-booking/#'+token);await p.locator('#booking-status').filter({hasText:'confirmed'}).waitFor();await p.locator('#demo-timezone').selectOption('Asia/Dubai');await p.locator('#booking-status').filter({hasText:'Asia/Dubai'}).waitFor();assert.match(await p.locator('#booking-status').innerText(),/19:00|7:00/);
  if(!source&&width===390){
   await p.getByText('Prepare for your demo (optional)',{exact:true}).click();
   await p.locator('#demo-prep-goal').fill('Improve quote follow-up');
   await p.locator('#demo-prep-tools').fill('Shared spreadsheet');
   await p.locator('#demo-prep-teammate').selectOption('yes');
   await p.getByRole('button',{name:'Save prep brief',exact:true}).click();
   await p.locator('#demo-prep-status').filter({hasText:'Prep brief saved'}).waitFor();
   await p.reload();await p.getByText('Prepare for your demo (optional)',{exact:true}).click();
   assert.equal(await p.locator('#demo-prep-goal').inputValue(),'Improve quote follow-up');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  assert.deepEqual(errors,[]);checks.push({source,width,preferredConversion:true,dstBoundaries:true,confirmedSlotAndCalendar:true,conflictAndUnavailable:true,privateBookingTimezone:true});await c.close();
 }
 for(const [slug,market,zone] of [['us','US','America/Los_Angeles'],['uk','GB','Europe/London'],['india','IN','Asia/Kolkata']]){
  await checkRegionalAvailability(browser,base,false,slug,market,zone,390);
  checks.push({market,regionalAvailability:true});
 }
 await checkRegionalAvailability(browser,base,true,'uk','GB','Europe/London',1440);
 checks.push({regionalAvailabilitySource:true});
 for(const [market,zone,workflow] of [['US','America/Los_Angeles','crm-pipeline'],['GB','Europe/London','travel-handover'],['IN','Asia/Kolkata','crm-pipeline']]){
  await checkSampleBooking(browser,base,market,zone,workflow);
  checks.push({market,workflow,sampleBooking:true});
 }
 const c=await browser.newContext({javaScriptEnabled:false}),p=await c.newPage();await p.goto(base+'/demo-request/');assert(await p.locator('#demo-date').isVisible());assert.match(await p.locator('#demo-time-help').innerText(),/India Standard Time/);await p.goto(base+'/sample-crm/');const link=p.getByRole('link',{name:'Request a CRM walkthrough',exact:false});assert.equal(new URL(await link.getAttribute('href'),base).searchParams.get('solution'),'CRM & ERP Package');await c.close();checks.push({noScriptISTFallback:true,crmWalkthroughPrefill:true});fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(checks,null,2));console.log('PASS '+checks.length+' international demo booking cases (mocked requests only).');
}catch(error){console.error(error);throw error;}finally{if(browser)await browser.close();if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}}})().catch(e=>{console.error(e);process.exitCode=1;});

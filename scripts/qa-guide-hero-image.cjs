// Local static/source image-loading regression. Block all browser writes and external requests.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa-results/guide-hero-image');fs.mkdirSync(out,{recursive:true});
const guides=['automate-payment-workflows-in-travel-agencies','travel-erp-system-for-tour-operators'];
const image='/assets/travel-operations-hero.webp',oldImage='/assets/travel-operations-hero.png';
let server,browser;
(async()=>{try{
  server=http.createServer((req,res)=>{
    const u=new URL(req.url,'http://local');let f=path.resolve(root,'.'+u.pathname);
    if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
    if(!fs.existsSync(f)){res.writeHead(404);return res.end();}
    let body=fs.readFileSync(f);
    if(f.endsWith('.html')&&u.searchParams.has('source'))body=Buffer.from(body.toString().replace(/<body([\s\S]*?)>[\s\S]*?<\/body>/,'<body$1><div id="site"></div><script src="/assets/site.js" defer></script></body>'));
    res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'})[path.extname(f)]||'application/octet-stream');res.end(body);
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME}:{});
  const results=[],parity=new Map();
  for(const slug of guides)for(const width of [320,360,390,1440])for(const source of [false,true]){
    const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),p=await c.newPage(),requests=[],errors=[];
    await c.route('**/*',r=>r.request().url().startsWith(base)&&r.request().method()==='GET'?r.continue():r.abort());
    p.on('request',r=>requests.push(r.url()));p.on('pageerror',e=>errors.push(e.message));
    await p.goto(base+'/blog/'+slug+'/'+(source?'?source=1':''),{waitUntil:'networkidle'});
    const hero=p.locator('main .hero');await hero.waitFor();
    const preload=p.locator('link[rel=preload][as=image]');assert.equal(await preload.count(),1);
    assert.equal(await preload.getAttribute('href'),image);assert.equal(await preload.getAttribute('type'),'image/webp');assert.equal(await preload.getAttribute('fetchpriority'),'high');
    assert.equal(requests.filter(u=>new URL(u).pathname===image).length,1,'Preload and CSS must share one image request');
    assert.equal(requests.filter(u=>new URL(u).pathname===oldImage).length,0,'Guide must not fetch the large fallback PNG');
    const background=await hero.evaluate(e=>({url:getComputedStyle(e,'::before').backgroundImage,size:getComputedStyle(e,'::before').backgroundSize,position:getComputedStyle(e,'::before').backgroundPosition,opacity:getComputedStyle(e,'::before').opacity}));
    assert.equal(background.url,'url("'+base+image+'")');assert.equal(background.size,'cover');assert.equal(background.opacity,'1');
    assert.equal(await p.locator('h1').count(),1);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const links=await p.locator('main .hero-actions a,#guide-project-path a').evaluateAll(es=>es.map(e=>[e.textContent.trim(),e.getAttribute('href')]));
    if(parity.has(slug))assert.deepEqual(links,parity.get(slug));else parity.set(slug,links);
    assert(links.some(([,href])=>href==='/travel-erp/#erp-finance'));
    assert.deepEqual(errors,[]);
    if(!source&&[390,1440].includes(width))await hero.screenshot({style:'header,.skip-link,.mobile-contact-bar{visibility:hidden!important}',path:path.join(out,slug+'-'+width+'.png')});
    results.push({slug,width,source,oneWebpRequest:true,noPngRequest:true,background,sourceStaticLinksMatch:true});await c.close();
  }
  // A control guide retains the original shared hero behaviour.
  for(const source of [false,true]){
    const c=await browser.newContext({viewport:{width:390,height:900}}),p=await c.newPage(),requests=[];
    await c.route('**/*',r=>r.request().url().startsWith(base)&&r.request().method()==='GET'?r.continue():r.abort());p.on('request',r=>requests.push(r.url()));
    await p.goto(base+'/blog/white-label-crm-vs-custom-crm/'+(source?'?source=1':''),{waitUntil:'networkidle'});
    assert.match(await p.locator('main .hero').evaluate(e=>getComputedStyle(e,'::before').backgroundImage),/travel-operations-hero\.png/);
    assert.equal(requests.filter(u=>new URL(u).pathname===oldImage).length,1);assert.equal(await p.locator('link[rel=preload][as=image][href="'+image+'"]').count(),0);await c.close();
  }
  // The canonical HTML must retain the same optimised image without JavaScript.
  for(const slug of guides){
    const c=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),p=await c.newPage(),requests=[];
    await c.route('**/*',r=>r.request().url().startsWith(base)&&r.request().method()==='GET'?r.continue():r.abort());p.on('request',r=>requests.push(r.url()));
    await p.goto(base+'/blog/'+slug+'/',{waitUntil:'networkidle'});assert.match(await p.locator('main .hero').evaluate(e=>getComputedStyle(e,'::before').backgroundImage),/travel-operations-hero\.webp/);assert.equal(requests.filter(u=>new URL(u).pathname===image).length,1);assert.equal(requests.filter(u=>new URL(u).pathname===oldImage).length,0);await c.close();
  }
  const bytes={before:fs.statSync(path.join(root,oldImage)).size,after:fs.statSync(path.join(root,image)).size};
  assert(bytes.after<bytes.before/10);
  const report={status:'PASS',guideCases:results.length,controlGuideCases:2,noJavaScriptCases:2,results,heroBytes:bytes,productionEnquiries:0};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:'PASS',guideCases:results.length,controlGuideCases:2,noJavaScriptCases:2,heroBytes:bytes,productionEnquiries:0}));
}finally{if(browser)await browser.close();if(server){server.closeAllConnections();server.close();}}})().catch(e=>{console.error(e);process.exitCode=1;});

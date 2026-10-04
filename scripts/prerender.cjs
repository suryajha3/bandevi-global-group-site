const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const server=http.createServer((req,res)=>{let p=path.join(root,new URL(req.url,'http://localhost').pathname);if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!fs.existsSync(p)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(p)]||'application/octet-stream');let out=fs.readFileSync(p);if(p.endsWith('.html')){let h=out.toString();if(/<body data-page=/.test(h))out=Buffer.from(h.replace(/<body[\s\S]*?<\/body>/,'<body '+h.match(/<body ([^>]+)>/)[1]+'><div id="site"></div><script src="/assets/site.js" defer></script></body>'));}res.end(out);});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(8875,'127.0.0.1',r));browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true});
 const page=await browser.newPage();await page.route('https://www.googletagmanager.com/**',r=>r.abort());let errors=[];page.on('pageerror',e=>errors.push(e.message));let count=0;
 for(const f of files(root).filter(f=>f.endsWith('.html')&&!f.includes(path.sep+'server'+path.sep))){let h=fs.readFileSync(f,'utf8');if(!/<body data-page=/.test(h))continue;
  const rel=path.relative(root,f).split(path.sep).join('/');await page.goto('http://127.0.0.1:8875/'+rel,{waitUntil:'domcontentloaded'});await page.locator('#site h1').waitFor();
  const markup=await page.locator('#site').innerHTML();if(!markup.includes('main-content'))throw Error('Missing main '+rel);
  if(await page.locator('h1').count()!==1)throw Error('Heading count '+rel);
  h=h.replace(/<body[\s\S]*?<\/body>/,'<body '+h.match(/<body ([^>]+)>/)[1]+'><div id="site" data-prerendered="true">'+markup+'</div><script src="/assets/client.js?v=20261004-seo-trust" defer></script></body>');
  h=h.replace(/\/assets\/site\.js[^"']*/g,'/assets/client.js?v=20261004-seo-trust').replace(/styles\.css\?v=[^"']*/g,'styles.css?v=20261004-seo-trust');
  fs.writeFileSync(f,h);count++;
 }
 if(errors.length)throw Error(errors.join('\n'));
 const source=fs.readFileSync(path.join(root,'assets/site.js'),'utf8');const client=source.slice(0,source.indexOf('const brandAliases'))+source.slice(source.indexOf('function bindNav()'),source.indexOf('function render()'))+'\nbindNav();\nbindForms();\nbindAnalyticsEvents();\n';fs.writeFileSync(path.join(root,'assets/client.js'),client);
 console.log('Prerendered '+count+' HTML pages. Client JS '+Buffer.byteLength(client)+' bytes.');
 }finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

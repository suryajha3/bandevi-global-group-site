/* Code-native brand artwork. No customer data, screenshots or performance claims. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const cards=[
 {slug:'home',page:'index.html',route:'/',kicker:'CUSTOM SOFTWARE',lines:['Software.','Built around you.'],description:'Websites, apps, CRM, ERP and travel systems.',pill:'US · UK · INDIA',delivery:'Remote delivery from Gurugram, India'},
 ...[['us','US','USD'],['uk','UK','GBP'],['india','Indian','INR']].flatMap(([market,name,currency])=>[
  {slug:market,page:market+'/software-development/index.html',route:'/'+market+'/software-development/',kicker:'SOFTWARE DEVELOPMENT',lines:['Software for',name+' businesses.'],description:'Websites, apps, CRM and business systems.',pill:currency+' quotations',delivery:market==='india'?'Gurugram project team':'Remote delivery from India'},
  {slug:market+'-crm',page:market+'/travel-agency-crm/index.html',route:'/'+market+'/travel-agency-crm/',kicker:'TRAVEL AGENCY CRM',lines:['CRM for',name+' travel agencies.'],description:'Enquiries. Named owners. Clear follow-ups.',pill:currency+' quotations',delivery:market==='india'?'Gurugram project team':'Remote delivery from India'}
 ])
].map(card=>({...card,file:'assets/social/bandevi-'+card.slug+'-20261025.png',alt:'BANDEVI GLOBAL GROUP — '+card.lines.join(' ')+' '+card.pill+'. '+card.delivery+'.'}));
function escape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function svg(card){return [
 '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">',
 '<rect width="1200" height="630" fill="#142b23"/><path d="M755 0H1200V630H1010Z" fill="#1c352c"/>',
 '<rect x="24" y="24" width="1152" height="582" rx="22" fill="none" stroke="#dcc58f" stroke-opacity=".35"/>',
 '<rect x="64" y="58" width="82" height="82" rx="19" fill="#142b23" stroke="#dcc58f" stroke-width="1.5"/>',
 '<text x="104" y="113" text-anchor="middle" fill="#dcc58f" font-family="Georgia,serif" font-size="40" font-weight="700" letter-spacing="-4">BG</text>',
 '<g font-family="Arial,sans-serif"><text x="170" y="91" fill="#f7f4eb" font-size="27" font-weight="700" letter-spacing="2">BANDEVI GLOBAL GROUP</text>',
 '<text x="170" y="124" fill="#ccd6cd" font-size="19">Software. Built around you.</text>',
 '<path d="M64 204H112" stroke="#dcc58f" stroke-width="2"/><text x="130" y="211" fill="#dcc58f" font-size="18" font-weight="700" letter-spacing="2.5">'+escape(card.kicker)+'</text>',
 '<text x="64" y="294" fill="#fffdf8" font-size="60" font-weight="700" letter-spacing="-1.7">'+escape(card.lines[0])+'</text>',
 '<text x="64" y="365" fill="#dcc58f" font-size="57" font-weight="700" letter-spacing="-1.7">'+escape(card.lines[1])+'</text>',
 '<text x="66" y="421" fill="#f7f4eb" font-size="23">'+escape(card.description)+'</text>',
 '<rect x="64" y="486" width="222" height="45" rx="9" fill="#20523f" stroke="#8aa594" stroke-opacity=".6"/>',
 '<text x="175" y="515" text-anchor="middle" fill="#f7f4eb" font-size="20" font-weight="700">'+escape(card.pill)+'</text>',
 '<text x="307" y="515" fill="#ccd6cd" font-size="20">'+escape(card.delivery)+'</text>',
 '<path d="M64 558H1136" stroke="#ccd6cd" stroke-opacity=".25"/><text x="64" y="590" fill="#dcc58f" font-size="19">bandeviglobalgroup.com</text>',
 '<rect x="836" y="225" width="300" height="223" rx="18" fill="#f7f4eb"/>',
 '<text x="860" y="265" fill="#775622" font-size="16" font-weight="700" letter-spacing="1.4">A CLEAR NEXT STEP</text>',
 ...['Your enquiries','Clear ownership','Organised follow-ups'].map((text,i)=>'<circle cx="869" cy="'+(307+i*49)+'" r="5" fill="'+['#8aa594','#b2914f','#20523f'][i]+'"/><text x="889" y="'+(314+i*49)+'" fill="#222b27" font-size="20" font-weight="700">'+text+'</text>'),
 '</g></svg>'
 ].join('');}
function updateMetadata(){for(const card of cards){const file=path.join(root,card.page),url='https://bandeviglobalgroup.com/'+card.file;let html=fs.readFileSync(file,'utf8');if((html.match(/<meta property="og:image" /g)||[]).length!==1||(html.match(/<meta name="twitter:image" /g)||[]).length!==1)throw Error('Expected one social image per page: '+card.page);html=html.replace(/<meta property="og:image"[^>]*>/,'<meta property="og:image" content="'+url+'">\n  <meta property="og:image:secure_url" content="'+url+'">\n  <meta property="og:image:type" content="image/png">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:image:alt" content="'+escape(card.alt)+'">').replace(/<meta name="twitter:image"[^>]*>/,'<meta name="twitter:image" content="'+url+'">\n  <meta name="twitter:image:alt" content="'+escape(card.alt)+'">');fs.writeFileSync(file,html);}}
async function build(){const {chromium}=require('playwright'),browser=await chromium.launch();try{const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});for(const card of cards){const target=path.join(root,card.file);fs.mkdirSync(path.dirname(target),{recursive:true});await page.setContent('<html><head><style>html,body{margin:0;width:1200px;height:630px;overflow:hidden}svg{display:block}</style></head><body>'+svg(card)+'</body></html>');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:target,clip:{x:0,y:0,width:1200,height:630}});console.log(card.file);}if(process.argv.includes('--metadata'))updateMetadata();}finally{await browser.close();}}
module.exports={cards,svg,updateMetadata};if(require.main===module)build().catch(error=>{console.error(error);process.exitCode=1;});

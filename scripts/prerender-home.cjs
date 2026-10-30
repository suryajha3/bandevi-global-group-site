/* Regenerate only the static homepage introduction from its pure source renderer.
   Retain all later content, metadata and shared scripts; serialize no runtime UI. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'assets/site.js'),'utf8');
const start=source.indexOf('function improvedHomeHero()'),end=source.indexOf('\nfunction buyerConfidenceSection',start);assert(start>=0&&end>start);
const markup=vm.runInNewContext(source.slice(start,end)+';improvedHomeHero()');
const file=path.join(root,'index.html');let html=fs.readFileSync(file,'utf8');
const a=html.indexOf('<section class="home-professional-hero"'),b=html.indexOf('<section class="section home-buyer-trust"',a);assert(a>=0&&b>a);
html=html.slice(0,a)+markup+html.slice(b);html=html.replace('id="selected-work"><a href="/case-studies/','id="project-reference-links"><a href="/case-studies/');
if(!html.includes('/assets/home-focus.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/home-focus.css?v=20261030">\n</head>');
fs.writeFileSync(file,html);console.log('Homepage-only prerender complete; no runtime enhancements serialized.');

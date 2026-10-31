const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),n=require('./qa-brief-quick-edit-normalize.cjs');
const file=path.resolve(__dirname,'../project-brief/index.html');let html=fs.readFileSync(file,'utf8');
if(!html.includes('/assets/project-brief-quick-edit.js?')){assert.equal(html.split('</head>').length,2);html=html.replace('</head>',n.bundle+'</head>');}
assert.equal(html.split(n.bundle).length,2);fs.writeFileSync(file,html);
console.log('Built one-page Project Brief Quick Edit assets.');

/* Add only the browser-local draft bundle and accurate saved-draft explanation. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),n=require('./qa-brief-draft-normalize.cjs');
const file=path.resolve(__dirname,'../project-brief/index.html');let html=fs.readFileSync(file,'utf8');
if(!html.includes('/assets/project-brief-draft.js?')){assert.equal(html.split('</head>').length,2);html=html.replace('</head>',n.bundle+'</head>');}
if(html.includes(n.before))html=html.replace(n.before,n.after);
assert.equal(html.split(n.bundle).length,2);assert.equal(html.split(n.after).length,2);fs.writeFileSync(file,html);
console.log('Built one-page manual project brief draft assets and explanation.');

/* Add only the preview assets after the existing public comparison build. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),normalize=require('./qa-comparison-preview-normalize.cjs');
const file=path.resolve(__dirname,'../project-shortlist/index.html');let html=fs.readFileSync(file,'utf8');assert(html.includes('/assets/project-comparison.js?'));
if(!html.includes('/assets/project-comparison-preview.js?'))html=html.replace('</head>',normalize.bundle+'</head>');assert.equal(html.split(normalize.bundle).length,2);fs.writeFileSync(file,html);
console.log('Built Shortlist-only browser preview and explicit print assets.');

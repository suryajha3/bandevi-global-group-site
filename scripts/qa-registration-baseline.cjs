/* Forward only the approved registration-content delta into historical scope expectations.
   Existing whole-file comparisons still reject any change beyond that delta and each
   feature's own exact normalizer. Private code and form controllers are never adapted. */
const assert=require('node:assert/strict'),approved=require('./fixtures/company-registration-approved.json');
const legal='BANDEVI GLOBAL GROUP PRIVATE LIMITED',cin='U79110HR2026PTC152314',gst='06AAPCB2996N1ZU';
function replaceOne(value,before,after,label){assert.equal(value.split(before).length,2,label);return value.replace(before,()=>after);}
function searchDescription(value){return value.split(approved.oldSearchDescription).join(approved.newSearchDescription);}
module.exports=(name,input)=>{
 let value=input.replace(/\r\n/g,'\n');
 const record=approved.records[name];
 if(record){
  assert(record.afterMain.includes(legal)&&record.afterMain.includes(cin)&&record.afterMain.includes(gst),'Registration expectations need reviewed business identifiers');
  value=replaceOne(value,record.beforeMain,record.afterMain,name+' original main');
  const end=value.indexOf('</head>');let head=value.slice(0,end),body=value.slice(end);
  head=head.replace(/<title>.*?<\/title>/s,'<title>'+record.afterTitle+'</title>');
  for(const key of ['description','og:description','twitter:description','og:title','twitter:title']){const replacement=key.endsWith('title')?record.afterTitle:record.afterDescription;head=head.replace(new RegExp('(<meta[^>]*(?:name|property)=\"'+key+'\"[^>]*content=\")[^\"]*'),(all,start)=>start+replacement);}
  value=head+record.schema+body;
 }else if(name==='index.html'){
  let found=false;value=value.replace(/<section\b[^>]*id="buyer-trust"[\s\S]*?<\/section>/,section=>{found=true;return section.replace(/<\/div>\s*<\/section>$/,approved.homeAside+'</div></section>');});assert(found,'Homepage trust region');
  value=value.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)(.*?)(<\/script>)/s,(all,open,json,close)=>{
   const data=JSON.parse(json);const org=data['@graph'].find(n=>n['@type']==='Organization'&&n['@id']==='https://bandeviglobalgroup.com/#organization');assert(org);Object.assign(org,{legalName:legal,taxID:gst,identifier:{'@type':'PropertyValue',propertyID:'CIN',value:cin}});return open+JSON.stringify(data)+close;
  });
 }else if(name==='assets/site.js'){
  value=value.replace(/\/\/ PUBLIC SITE SEARCH START[\s\S]*?\/\/ PUBLIC SITE SEARCH END/g,block=>searchDescription(block));
  value=replaceOne(value,'\nrender();','\n'+approved.sourceAddition+'\nrender();','Source registration override');
 }else if(name==='search/index.html')value=searchDescription(value);
 return value;
};

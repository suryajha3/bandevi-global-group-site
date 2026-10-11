const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const address = 'SCO 63, Huda Market, First Floor, Bijwasan - Palam Vihar Rd, opposite HP Petrol Pump, Cartarpuri Alias Daulatpur Nas, Sector 23A, Gurugram, Haryana 122017';
const postal = {'@type':'PostalAddress',streetAddress:'SCO 63, Huda Market, First Floor, Bijwasan - Palam Vihar Rd, opposite HP Petrol Pump, Cartarpuri Alias Daulatpur Nas, Sector 23A',addressLocality:'Gurugram',addressRegion:'Haryana',postalCode:'122017',addressCountry:'IN'};
const footerMarker = '<p>BANDEVI and The Holidays Group are separate sister brands.</p>';
const footer = '<p><strong>Gurugram office</strong><br>'+address+'</p>';
const section = '<section class="section mist" id="gurugram-office"><div class="container"><h2>Gurugram office</h2><p>'+address+'</p><p>Discuss website and app development, CRM, ERP and travel technology with our team in Sector 23A, Gurugram. Call to arrange an appointment before visiting.</p><div class="inline-actions"><a class="button dark" href="https://www.google.com/maps/search/?api=1&amp;query='+encodeURIComponent(address)+'" target="_blank" rel="noopener noreferrer">Get directions</a><a class="text-link" href="tel:+917011040474">Call our team</a></div></div></section>';
const meta = {
 'index.html':['Bandevi Global Group | Software Company in Gurugram','Website and app development, CRM, ERP and travel technology from Bandevi Global Group in Sector 23A, Gurugram. Discuss your software project with our team.'],
 'contact-us/index.html':['Contact Bandevi Global Group | Gurugram Office','Contact Bandevi Global Group at SCO 63, Huda Market, Sector 23A, Gurugram, Haryana 122017. Call +91 7011040474 for website, CRM and ERP project enquiries.'],
 'offices/index.html':['Bandevi Global Group Office | Sector 23A, Gurugram','Find Bandevi Global Group at SCO 63, Huda Market, First Floor, Sector 23A, Gurugram, opposite HP Petrol Pump. Get directions and arrange your visit.'],
 'website-mobile-app-development/index.html':['Website & App Development in Gurugram | Bandevi','Plan website and mobile app development with Bandevi Global Group in Gurugram. Discuss service pages, customer journeys, enquiry forms and portal requirements.'],
 'crm-erp-solutions/index.html':['CRM & ERP Development in Gurugram | Bandevi','CRM and ERP development from Bandevi Global Group in Gurugram. Plan lead follow-ups, quotations, approvals, operational records and business reporting.'],
 'custom-software-development/index.html':['Custom Software Development in Gurugram | Bandevi','Discuss custom software development with Bandevi Global Group in Gurugram, including business workflows, customer portals, dashboards and integrations.'],
 'custom-crm-development/index.html':['Custom CRM Development in Gurugram | Bandevi','Plan custom CRM development with Bandevi Global Group in Gurugram. Define sales stages, lead ownership, follow-ups, quotations and reporting for your team.'],
 'erp-software-development/index.html':['ERP Software Development in Gurugram | Bandevi','Plan ERP software development with Bandevi Global Group in Gurugram. Discuss operations, approvals, user roles, reporting and integration requirements.'],
 'travel-technology/index.html':['Travel Technology Development in Gurugram | Bandevi','Travel technology development from Bandevi Global Group in Gurugram. Discuss travel websites, CRM, ERP, enquiries, quotations and booking handover workflows.']
};
const esc = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;');
function enrich(o) {
 if (!o || typeof o !== 'object') return;
 if (['Organization','ProfessionalService'].includes(o['@type']) && /bandevi/i.test(o.name || '')) {
  o['@id']='https://bandeviglobalgroup.com/#organization'; o.address=postal;
  if(o['@type']==='ProfessionalService') o.hasMap='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address);
  else delete o.hasMap;
 }
 for (const v of Object.values(o)) if (v && typeof v==='object') Array.isArray(v)?v.forEach(enrich):enrich(v);
}
function files(dir) {return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')||['server','qa-results','node_modules'].includes(e.name)?[]:e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let changed=0;
for (const f of files(root).filter(f=>f.endsWith('.html'))) {
 let h=fs.readFileSync(f,'utf8'); if(!/<body data-page=/.test(h))continue;
 const rel=path.relative(root,f).split(path.sep).join('/');
 if (!rel.includes('/') && rel !== 'index.html') continue;
 if (!h.includes('<strong>Gurugram office</strong>')) h=h.replace(footerMarker,footer+footerMarker);
 if (['contact-us/index.html','offices/index.html'].includes(rel)&&!h.includes('id="gurugram-office"'))h=h.replace('</main>',section+'</main>');
 if(meta[rel]) {
  const [title,description]=meta[rel]; h=h.replace(/<title>[^<]*<\/title>/,'<title>'+esc(title)+'</title>');
  h=h.replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*(">)/g,(_,a,z)=>a+esc(description)+z);
  h=h.replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*(">)/g,(_,a,z)=>a+esc(title)+z);
 }
 h=h.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,json)=>{const o=JSON.parse(json);enrich(o);if(meta[rel]&&['WebPage','ContactPage'].includes(o['@type'])){o.name=meta[rel][0];o.description=meta[rel][1];}return '<script type="application/ld+json">'+(json.includes('\n')?'\n'+JSON.stringify(o,null,2)+'\n  ':JSON.stringify(o))+'</script>';});
 if(h!==fs.readFileSync(f,'utf8')){fs.writeFileSync(f,h);changed++;}
}
const sourceFile=path.join(root,'assets/site.js');let s=fs.readFileSync(sourceFile,'utf8');
if(!s.includes('const gurugramOfficeSection')) {
 s=s.replace(footerMarker,footer+footerMarker);
 const insert='\nconst gurugramOfficeSection = '+JSON.stringify(section)+';\nconst originalLocalContact = pageRenderers.contact;\npageRenderers.contact = () => originalLocalContact() + gurugramOfficeSection;\ntrustPageContent.offices += gurugramOfficeSection;\n';
 if(s.split('\nrender();').length!==2)throw Error('Unexpected renderer');
 s=s.replace('\nrender();',insert+'\nrender();');fs.writeFileSync(sourceFile,s);
}
const factsFile=path.join(root,'assets/bandevi-global-group-official-facts.json');const facts=JSON.parse(fs.readFileSync(factsFile));enrich(facts);fs.writeFileSync(factsFile,JSON.stringify(facts,null,2)+'\n');
const sitemapFile=path.join(root,'sitemap.xml');let xml=fs.readFileSync(sitemapFile,'utf8');xml=xml.replace(/(<url><loc>[^<]*<\/loc><lastmod>)[^<]+/g,'$12026-10-11');fs.writeFileSync(sitemapFile,xml);
console.log('Updated '+changed+' public pages, source renderer, facts and sitemap.');

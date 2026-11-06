/* Forward the exact user-approved contact addition through historical scope checks.
   All whole-file, private-code and controller comparisons remain authoritative. */
const assert=require('node:assert/strict'),approved=require('./fixtures/office-landline-approved.json');
module.exports=(name,input)=>{
 let value=input.replace(/\r\n/g,'\n');
 assert.equal(approved.href,'tel:+911244763671');assert.equal(approved.display,'0124 476 3671');
 for(const {before,after,count} of approved.updates[name]||[]){assert.equal(value.split(before).length-1,count,'Original office contact marker: '+name);value=value.split(before).join(after);}
 // Carry the exact approved label into the older Travel ERP snapshot.
 if(name==='travel-erp/index.html'){
  const original='<a class="button dark" data-finance-enquiry="demo" href="/demo-request/?solution=Travel%20ERP%20Package&amp;focus=erp-finance">Discuss your payment workflow</a>';
  assert.equal(value.split(original).length,2,'Original Travel ERP finance demo button');
  value=value.replace(original,original.replace('Discuss your payment workflow','Request a supplier payment workflow demo'));
 }
 return require('./qa-public-readability-baseline.cjs')(name,value);
};

/* Forward the exact user-approved contact addition through historical scope checks.
   All whole-file, private-code and controller comparisons remain authoritative. */
const assert=require('node:assert/strict'),approved=require('./fixtures/office-landline-approved.json');
module.exports=(name,input)=>{
 let value=input.replace(/\r\n/g,'\n');
 assert.equal(approved.href,'tel:+911244763671');assert.equal(approved.display,'0124 476 3671');
 for(const {before,after,count} of approved.updates[name]||[]){assert.equal(value.split(before).length-1,count,'Original office contact marker: '+name);value=value.split(before).join(after);}
 return value;
};

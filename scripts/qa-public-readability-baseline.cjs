/* Forward only exact approved visual/contact-label deltas; retain whole-file comparisons. */
const assert=require('node:assert/strict'),approved=require('./fixtures/public-readability-approved.json');
module.exports=(name,input)=>{
 let value=input.replace(/\r\n/g,'\n');
 for(const {before,after,count} of approved.updates[name]||[]){assert.equal(value.split(before).length-1,count,'Original public wording: '+name);value=value.split(before).join(after);}
 if(approved.cssAppend[name]){const addition=approved.cssAppend[name];assert(!value.includes(addition.trim()),'Readability styling already applied: '+name);value+=addition;}
 return require('./qa-contact-entry-baseline.cjs')(name,value);
};

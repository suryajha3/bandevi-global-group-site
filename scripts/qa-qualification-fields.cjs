// Complete new routing fields in existing successful-submission scenarios.
// Empty-field checks remain separate; this helper never fills identity or message fields.
module.exports=async function completeRouting(form){
 const country=form.locator('[name=projectCountry]');if(!await country.count())return;
 let market=await country.inputValue();if(!market){const currency=form.locator('[name=quoteCurrency]');const preferred=await currency.count()?await currency.inputValue():'';market=({USD:'US',GBP:'GB',INR:'IN',EUR:'other'})[preferred]||'IN';await country.selectOption(market);}
 const zone=form.locator('[name=contactTimezone]');if(await zone.count()&&!await zone.inputValue())await zone.selectOption(market==='US'?'America/New_York':market==='GB'?'Europe/London':market==='other'?'UTC':'Asia/Kolkata');
};

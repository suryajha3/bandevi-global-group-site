/* Carry the approved homepage link row into older full-file scope checks. */
const assert = require('node:assert/strict');
const updates = require('./fixtures/home-crm-market-links-approved.json');
const promotions = require('./fixtures/travel-crm-promotions-approved.json');

module.exports = (name, source) => {
  let result = source;
  for (const { before, after } of updates[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage CRM marker: ' + name);
    result = result.replace(before, () => after);
  }
  for (const { before, after } of promotions[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original CRM promotion marker: ' + name);
    result = result.replace(before, () => after);
  }
  return result;
};

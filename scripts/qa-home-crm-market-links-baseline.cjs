/* Carry the approved homepage link row into older full-file scope checks. */
const assert = require('node:assert/strict');
const updates = require('./fixtures/home-crm-market-links-approved.json');
const promotions = require('./fixtures/travel-crm-promotions-approved.json');
const banner = require('./fixtures/home-promotion-banner-approved.json');
const proof = require('./fixtures/home-proof-strip-approved.json');
const brands = require('./fixtures/home-brand-references-approved.json');
const team = require('./fixtures/home-team-track-record-approved.json');
const slider = require('./fixtures/home-brand-slider-approved.json');

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
  for (const { before, after } of banner[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage promotion banner marker: ' + name);
    result = result.replace(before, () => after);
  }
  for (const { before, after } of proof[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage proof strip marker: ' + name);
    result = result.replace(before, () => after);
  }
  for (const { before, after } of brands[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage brand reference marker: ' + name);
    result = result.replace(before, () => after);
  }
  for (const { before, after } of team[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage team track record marker: ' + name);
    result = result.replace(before, () => after);
  }
  for (const { before, after } of slider[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original portfolio slider marker: ' + name);
    result = result.replace(before, () => after);
  }
  for (const { before, after } of require('./fixtures/home-brand-brief-approved.json')[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original portfolio brief marker: ' + name);
    result = result.replace(before, () => after);
  }
  return result;
};

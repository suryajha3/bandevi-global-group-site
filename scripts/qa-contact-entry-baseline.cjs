/* Forward only the approved public enquiry/demo routing delta into older scope checks. */
const assert = require('node:assert/strict');
const approved = require('./fixtures/contact-entry-approved.json');

module.exports = (name, input) => {
  let value = input.replace(/\r\n/g, '\n');
  const group = approved.pages[name];
  const changes = group ? approved.groups[group] : approved.assets[name];
  for (const { before, after, count } of changes || []) {
    assert.equal(value.split(before).length - 1, count, 'Original contact entry: ' + name);
    value = value.split(before).join(after);
  }
  return require('./qa-crm-workflow-pilot-baseline.cjs')(name, value);
};

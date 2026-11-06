/* Carry the exact approved CRM pilot deltas into historical full-file checks. */
const assert = require('node:assert/strict');
const updates = require('./fixtures/crm-workflow-pilot-approved.json');

module.exports = (name, source) => {
  let result = source.replace(/\r\n/g, '\n');
  for (const { before, after } of updates[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original CRM pilot marker: ' + name);
    result = result.replace(before, () => after);
  }
  return result;
};

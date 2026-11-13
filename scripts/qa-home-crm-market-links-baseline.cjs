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
  const industries = require('./fixtures/home-industries-approved.json');
  for (const { before, after } of industries[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage industries marker: ' + name);
    result = result.replace(before, () => after);
  }
  const portfolioBrief = require('./fixtures/home-brand-brief-approved.json');
  for (const { before, after } of portfolioBrief[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original portfolio brief marker: ' + name);
    result = result.replace(before, () => after);
  }
  const evidenceBanner = require('./fixtures/home-evidence-banner-approved.json');
  for (const { before, after } of evidenceBanner[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage evidence marker: ' + name);
    result = result.replace(before, () => after);
  }
  const technology = require('./fixtures/home-technology-approved.json');
  for (const { before, after } of technology[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage technology marker: ' + name);
    result = result.replace(before, () => after);
  }
  const industryGrid = require('./fixtures/home-industry-grid-approved.json');
  for (const { before, after } of industryGrid[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage industry grid marker: ' + name);
    result = result.replace(before, () => after);
  }
  const industryEnquiry = require('./fixtures/home-industry-enquiry-approved.json');
  for (const { before, after } of industryEnquiry[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original industry enquiry marker: ' + name);
    result = result.replace(before, () => after);
  }
  const servicePaths = require('./fixtures/home-service-paths-approved.json');
  for (const { before, after } of servicePaths[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage service path marker: ' + name);
    result = result.replace(before, () => after);
  }
  const officeAddresses = require('./fixtures/international-office-addresses-approved.json');
  for (const { before, after } of officeAddresses[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original international office marker: ' + name);
    result = result.replace(before, () => after);
  }
  const editorial = require('./fixtures/home-editorial-approved.json');
  for (const { before, after } of editorial[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage editorial marker: ' + name);
    result = result.replace(before, () => after);
  }
  const officeTables = require('./fixtures/public-office-tables-approved.json');
  for (const { before, after } of officeTables[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original public office table marker: ' + name);
    result = result.replace(before, () => after);
  }
  const demoAvailability = require('./fixtures/regional-demo-availability-approved.json');
  for (const { before, after } of demoAvailability[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original regional demo availability marker: ' + name);
    result = result.replace(before, () => after);
  }
  const demoReminders = require('./fixtures/demo-reminders-attendance-approved.json');
  for (const { before, after } of demoReminders[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original demo reminder and attendance marker: ' + name);
    result = result.replace(before, () => after);
  }
  const postDemo = require('./fixtures/post-demo-followup-approved.json');
  for (const { before, after } of postDemo[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original post-demo follow-up marker: ' + name);
    result = result.replace(before, () => after);
  }
  const proposalFeedback = require('./fixtures/proposal-feedback-approved.json');
  for (const { before, after } of proposalFeedback[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original proposal feedback marker: ' + name);
    result = result.replace(before, () => after);
  }
  const proposalDecisions = require('./fixtures/proposal-decisions-approved.json');
  for (const { before, after } of proposalDecisions[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original proposal decisions marker: ' + name);
    result = result.replace(before, () => after);
  }
  const clientKickoff = require('./fixtures/client-kickoff-approved.json');
  for (const { before, after } of clientKickoff[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original client kickoff marker: ' + name);
    result = result.replace(before, () => after);
  }
  const champagne = require('./fixtures/home-champagne-approved.json');
  for (const { before, after } of champagne[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage champagne palette marker: ' + name);
    result = result.replace(before, () => after);
  }
  const sampleBooking = require('./fixtures/crm-sample-booking-approved.json');
  for (const { before, after } of sampleBooking[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original CRM sample booking marker: ' + name);
    result = result.replace(before, () => after);
  }
  const prep = require('./fixtures/demo-prep-conversion-approved.json');
  for (const { before, after } of prep[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original demo prep and conversion marker: ' + name);
    result = result.replace(before, () => after);
  }
  const review = require('./fixtures/proposal-review-booking-approved.json');
  for (const { before, after } of review[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original proposal review booking marker: ' + name);
    result = result.replace(before, () => after);
  }
  const decisionCard = require('./fixtures/proposal-decision-card-approved.json');
  for (const { before, after } of decisionCard[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original proposal decision card marker: ' + name);
    result = result.replace(before, () => after);
  }
  const blockerKickoff = require('./fixtures/proposal-blocker-kickoff-approved.json');
  for (const { before, after } of blockerKickoff[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original proposal blocker and kickoff marker: ' + name);
    result = result.replace(before, () => after);
  }
  const premiumHeader = require('./fixtures/premium-public-header-approved.json');
  for (const { before, after } of premiumHeader[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original shared header marker: ' + name);
    result = result.replace(before, () => after);
  }
  const selfServiceKickoff = require('./fixtures/self-service-kickoff-approved.json');
  for (const { before, after } of selfServiceKickoff[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original self-service kickoff marker: ' + name);
    result = result.replace(before, () => after);
  }
  const kickoffConfirmation = require('./fixtures/kickoff-confirmation-approved.json');
  for (const { before, after } of kickoffConfirmation[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original kickoff confirmation marker: ' + name);
    result = result.replace(before, () => after);
  }
  const kickoffReminders = require('./fixtures/kickoff-reminders-approved.json');
  for (const { before, after } of kickoffReminders[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original kickoff reminders marker: ' + name);
    result = result.replace(before, () => after);
  }
  const homepageClarity = require('./fixtures/homepage-clarity-approved.json');
  for (const { before, after } of homepageClarity[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original homepage clarity marker: ' + name);
    result = result.replace(before, () => after);
  }
  const regionalNextSlot = require('./fixtures/regional-next-slot-approved.json');
  for (const { before, after } of regionalNextSlot[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original regional next demo slot marker: ' + name);
    result = result.replace(before, () => after);
  }
  const crmBookingConversion = require('./fixtures/crm-booking-conversion-approved.json');
  for (const { before, after } of crmBookingConversion[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original CRM booking conversion marker: ' + name);
    result = result.replace(before, () => after);
  }
  const demoAttendance = require('./fixtures/demo-attendance-approved.json');
  for (const { before, after } of demoAttendance[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original demo attendance marker: ' + name);
    result = result.replace(before, () => after);
  }
  const proposalPreparation = require('./fixtures/proposal-preparation-approved.json');
  for (const { before, after } of proposalPreparation[name] || []) {
    assert.equal(result.split(before).length - 1, 1, 'Original proposal preparation marker: ' + name);
    result = result.replace(before, () => after);
  }
  return result;
};

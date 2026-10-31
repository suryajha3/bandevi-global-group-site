/* Exact additive planning links/assets only; independently constrained by the readiness scope gate. */
const bundle='<link rel="stylesheet" href="/assets/project-readiness.css?v=20261031"><script src="/assets/project-readiness-data.js?v=20261031" defer></script><script src="/assets/project-readiness.js?v=20261031" defer></script>';
const shortlistEntry='<a class="project-readiness-entry" href="/project-readiness/">Check project readiness ↗</a> · ';
const briefEntry='<p class="project-readiness-entry"><a href="/project-readiness/" target="_blank" rel="noopener">Before you start: open the readiness checklist in a new tab ↗</a></p>';
module.exports=value=>require('./qa-brief-draft-normalize.cjs')(require('./qa-project-comparison-normalize.cjs')(value)).replace(bundle,'').replace(shortlistEntry,'').replace(briefEntry,'').replace(JSON.stringify(shortlistEntry).slice(1,-1),'');
module.exports.bundle=bundle;module.exports.shortlistEntry=shortlistEntry;module.exports.briefEntry=briefEntry;

/* Exact Shortlist-only preview bundle, independently checked against its production baseline. */
const bundle='<link rel="stylesheet" href="/assets/project-comparison-preview.css?v=20261031"><script src="/assets/project-comparison-preview.js?v=20261031" defer></script>';
module.exports=value=>require('./qa-brief-quick-edit-normalize.cjs')(value).replace(bundle,'');module.exports.bundle=bundle;

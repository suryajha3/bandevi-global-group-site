/* Exact Shortlist-only comparison asset addition, checked independently against production. */
const bundle='<link rel="stylesheet" href="/assets/project-comparison.css?v=20261031"><script src="/assets/project-comparison-data.js?v=20261031" defer></script><script src="/assets/project-comparison.js?v=20261031" defer></script>';
module.exports=value=>require('./qa-comparison-preview-normalize.cjs')(value).replace(bundle,'');module.exports.bundle=bundle;

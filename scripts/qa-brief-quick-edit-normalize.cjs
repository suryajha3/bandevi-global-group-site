/* Exact one-page navigation bundle; the independent Quick Edit gate checks its full scope. */
const bundle='<link rel="stylesheet" href="/assets/project-brief-quick-edit.css?v=20261031"><script src="/assets/project-brief-quick-edit.js?v=20261031" defer></script>';
module.exports=value=>value.replace(bundle,'');module.exports.bundle=bundle;

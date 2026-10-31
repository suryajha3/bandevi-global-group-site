/* Exact additive brief draft assets and the corresponding storage explanation only. */
const bundle='<link rel="stylesheet" href="/assets/project-brief-draft.css?v=20261031"><script src="/assets/project-brief-draft.js?v=20261031" defer></script>';
const before='Your draft stays in this tab until you send it. Reloading or closing the page clears unsent details.';
const after='Without choosing Save draft, unsent details stay in this tab and are cleared on reload or close. Saved requirements can be reviewed and restored on this browser. Contact details are not saved by the draft feature.';
module.exports=value=>value.replace(bundle,'').replace(after,before);
module.exports.bundle=bundle;module.exports.before=before;module.exports.after=after;

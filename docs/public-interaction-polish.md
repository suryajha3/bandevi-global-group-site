# Public interaction polish — 25 October 2026

The public marketing site keeps its existing colours, brand assets, page grid and section order. Only the existing public enhancement assets and their cache versions change; enquiry transport, backend and private applications are untouched.

## Gallery

The enlarged screenshot viewer now provides Previous/Next controls, a live project counter and left/right arrow navigation through all five references. Navigation wraps, updates the underlying selected gallery tab, resets zoom, and retains the selected mobile view when a reference has a mobile capture. The CRM poster remains explicitly illustrative. Zoomed viewport arrow keys retain normal panning. Modifier shortcuts are not intercepted. Closing returns focus to the gallery opener and brings it into view if needed.

Controls remain at least 44 pixels high. Short windows allow the dialog itself to scroll, with a visible close header and a usable image area. Existing project/raw-image links, zoom controls, source dates, media retry and no-JavaScript alternatives remain available.

## Feedback and motion

Service, project and market cards gain consistent outlines for hover and keyboard focus, plus pressed feedback. Cards are not moved, recoloured at rest, made into extra tab stops, or assigned artificial button roles. Existing card links remain the actions. Preview images and captions fade over 160 ms after user selection/loading; dropdowns and control states use similarly brief transitions. Reduced-motion preferences disable these additions. Image dimensions and zoom are never animated. There is no timed carousel or automatic project advance.

## Enquiry guidance

An optional example appears beneath the existing message field for websites/apps, CRM/ERP, travel, customer portals or general guidance. Changing the service changes only the example. It does not overwrite the message, add named fields or required fields, alter the saved payload, or store a draft. The example is associated with the message through `aria-describedby`; existing help and validation descriptions are preserved. Source-rendered and static pages use the same enhancement.

## Validation and release

`scripts/qa-interaction-polish.cjs` verifies static/source rendering, all five projects, wraparound, mobile preference, zoom/pan keyboard boundaries, close focus, touch targets, resting card geometry/colours, reduced motion, short windows, and US/UK/India enquiry examples with locally mocked submissions. Pinned axe-core audits check the open viewer and enquiry guidance. `--live` permits GET requests only and does not submit any enquiry. The complete existing CI suite remains a release gate. These checks are bounded accessibility evidence, not an assistive-technology certification.

Public HTML changes only refresh asset cache versions. This release does not change the HR application, travel booking modules, B2B product, advertising controls, routing, environment or customer records.

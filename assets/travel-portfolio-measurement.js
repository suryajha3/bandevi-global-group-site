(() => {
  const paths = new Set(['/', '/travel-technology/', '/travel-website-development/', '/travel-agency-website-development/', '/b2b-travel-portal/']);
  const codes = new Set(['trip_sarathi', 'maximtrip', 'tripodeal']);
  let path;
  try { path = new URL(document.querySelector('link[rel="canonical"]').href).pathname; } catch (_) { return; }
  if (!paths.has(path)) return;
  const measure = (name, extra = {}) => {
    try { if (typeof trackAnalyticsEvent === 'function') trackAnalyticsEvent(name, {page_location: location.origin + path, ...extra}); } catch (_) { /* Navigation remains available when analytics fails. */ }
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const target = new URL(link.href, location.origin);
    if (target.origin !== location.origin) return;
    if (link.closest('#travel-portfolio-link') && target.pathname === '/travel-technology/' && target.hash === '#travel-projects') measure('travel_portfolio_link_click');
    const project = link.dataset.portfolioProject;
    if (path === '/travel-technology/' && link.closest('#travel-projects') && codes.has(project) && target.pathname === '/project-brief/' && target.searchParams.get('workflow') === 'travel-website') measure('travel_portfolio_brief_click', {portfolio_project: project, entry_workflow: 'travel-website'});
  });
  const section = path === '/travel-technology/' ? document.getElementById('travel-projects') : null;
  if (section && typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.25)) { measure('travel_portfolio_view'); observer.disconnect(); }
    }, {threshold: 0.25});
    observer.observe(section);
  }
})();

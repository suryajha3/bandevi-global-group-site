(() => {
  const cards = document.getElementById('home-industry-cards');
  const controls = document.querySelector('.home-industry-controls');
  if (!cards || !controls) return;

  const [previous, next] = controls.querySelectorAll('button');
  const industries = ['travel', 'retail', 'education', 'health', 'property', 'manufacturing', 'services', 'media'];

  cards.addEventListener('click', event => {
    const link = event.target.closest?.('li.home-industry-card a[href]');
    if (!link || typeof trackAnalyticsEvent !== 'function') return;
    const card = link.closest('.home-industry-card');
    const industry = industries.find(code => card.classList.contains('home-industry-card--' + code));
    const destination = new URL(link.href);
    if (!industry || destination.origin !== location.origin) return;

    try {
      trackAnalyticsEvent('industry_card_click', {
        industry,
        destination_path: destination.pathname,
        acquisition_channel: enquiryAttribution.channel,
        landing_page: enquiryAttribution.landing_page,
        page_location: location.origin + '/',
      });
    } catch (_) { /* Navigation remains available when analytics fails. */ }
  });

  function updateControls() {
    previous.disabled = cards.scrollLeft <= 2;
    next.disabled = cards.scrollLeft + cards.clientWidth >= cards.scrollWidth - 2;
  }
  function advance(direction) {
    const [first, second] = cards.children;
    const distance = second.offsetLeft - first.offsetLeft;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.scrollBy({ left: direction * distance, behavior: reduceMotion ? 'instant' : 'smooth' });
  }

  previous.addEventListener('click', () => advance(-1));
  next.addEventListener('click', () => advance(1));
  cards.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls);
  controls.hidden = false;
  updateControls();
})();

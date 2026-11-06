(() => {
  function bindIndustryAnalytics() {
    const cards = document.getElementById('home-industry-cards');
    if (!cards) return;

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
  }

  if (document.readyState === 'complete') bindIndustryAnalytics();
  else document.addEventListener('DOMContentLoaded', bindIndustryAnalytics, { once: true });
})();

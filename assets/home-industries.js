(() => {
  const cards = document.getElementById('home-industry-cards');
  const controls = document.querySelector('.home-industry-controls');
  if (!cards || !controls) return;

  const [previous, next] = controls.querySelectorAll('button');
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

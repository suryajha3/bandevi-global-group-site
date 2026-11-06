(() => {
  function initBrandSlider() {
    const track = document.getElementById('home-brand-slider-track');
    if (!track || track.children.length < 2) return;

    const slider = track.closest('.home-brand-references');
    const controls = slider.querySelector('[data-brand-slider-controls]');
    const previous = controls.querySelector('[data-brand-previous]');
    const next = controls.querySelector('[data-brand-next]');
    const status = controls.querySelector('[data-brand-slider-status]');
    const cards = [...track.children];
    const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
    const limit = () => track.scrollWidth - track.clientWidth;

    function update() {
      const first = Math.round(track.scrollLeft / step()) + 1;
      const visible = Math.round(track.clientWidth / step());
      const last = Math.min(cards.length, first + visible - 1);
      const label = first === last ? `Project ${first} of ${cards.length}` : `Projects ${first}–${last} of ${cards.length}`;
      if (status.textContent !== label) status.textContent = label;
      previous.setAttribute('aria-disabled', String(track.scrollLeft <= 1));
      next.setAttribute('aria-disabled', String(track.scrollLeft >= limit() - 1));
    }

    function move(direction) {
      const button = direction > 0 ? next : previous;
      if (button.getAttribute('aria-disabled') === 'true') return;
      const index = Math.round(track.scrollLeft / step()) + direction;
      track.scrollTo({ left: Math.max(0, Math.min(limit(), index * step())) });
    }

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    slider.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    });
    slider.classList.add('home-brand-slider');
    slider.setAttribute('aria-roledescription', 'carousel');
    controls.hidden = false;
    track.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(track);
    update();
  }

  function init() {
    initBrandSlider();
    const banner = document.querySelector('[data-home-promotion]');
    if (!banner) return;

    const slides = [...banner.querySelectorAll('[data-promotion-slide]')];
    const viewport = banner.querySelector('.home-promotion-slides');
    const controls = banner.querySelector('[data-promotion-controls]');
    const position = banner.querySelector('[data-promotion-position]');
    const status = banner.querySelector('[data-promotion-status]');
    const play = banner.querySelector('[data-promotion-play]');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let timer;
    let start;
    let swipeEndedAt = -Infinity;

    function move(direction, announce = true) {
      slides[current].hidden = true;
      slides[current].inert = true;
      current = (current + direction + slides.length) % slides.length;
      slides[current].dataset.direction = direction > 0 ? 'next' : 'previous';
      slides[current].inert = false;
      slides[current].hidden = false;
      position.textContent = `${current + 1} / ${slides.length}`;
      if (announce) status.textContent = `Promotion ${current + 1} of ${slides.length}: ${slides[current].getAttribute('aria-label')}`;
    }

    function stop() {
      clearInterval(timer);
      timer = undefined;
      play.setAttribute('aria-label', 'Play promotions');
      play.firstElementChild.textContent = '▶';
    }

    function navigate(direction) {
      stop();
      move(direction);
    }

    controls.querySelector('[data-promotion-previous]').addEventListener('click', () => navigate(-1));
    controls.querySelector('[data-promotion-next]').addEventListener('click', () => navigate(1));
    play.addEventListener('click', () => {
      if (timer !== undefined) {
        stop();
        return;
      }
      play.setAttribute('aria-label', 'Pause promotions');
      play.firstElementChild.textContent = 'Ⅱ';
      timer = setInterval(() => {
        if (!document.hidden && !viewport.matches(':hover') && !viewport.contains(document.activeElement)) move(1, false);
      }, 6500);
    });
    viewport.addEventListener('focusin', stop);
    motion.addEventListener('change', event => { if (event.matches) stop(); });

    viewport.addEventListener('touchstart', event => {
      start = event.touches.length === 1 ? event.touches[0] : null;
    }, { passive: true });
    viewport.addEventListener('touchcancel', () => { start = null; });
    viewport.addEventListener('touchend', event => {
      if (!start) return;
      const end = event.changedTouches[0];
      const x = end.clientX - start.clientX;
      const y = end.clientY - start.clientY;
      start = null;
      if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.5) {
        swipeEndedAt = performance.now();
        navigate(x < 0 ? 1 : -1);
      }
    }, { passive: true });
    viewport.addEventListener('click', event => {
      if (event.detail && performance.now() - swipeEndedAt < 350) event.preventDefault();
    }, true);

    banner.classList.add('home-promotion-ready');
    controls.hidden = false;
  }

  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

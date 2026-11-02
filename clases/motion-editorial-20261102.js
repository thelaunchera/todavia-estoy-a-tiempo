/* Lightweight progressive motion: one-time reveals and small desktop parallax.
   Does not change navigation, forms, pricing, or the existing comparison widget. */
(() => {
  const root = document.body;
  if (!root?.classList.contains('class-page-v2')) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const smallScreen = window.matchMedia('(max-width: 900px)');
  root.classList.add('motion-enhanced');
  const scenes = [
    '.class-transform-scene',
    '.class-materials-workbench',
    '.class-faq',
    '.class-waitlist-form',
    '.class-contact-compact-button'
  ].map(selector => document.querySelector(selector)).filter(Boolean);
  scenes.forEach(element => element.setAttribute('data-motion-scene', ''));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-motion-visible');
        observer.unobserve(entry.target);
      });
    }, {rootMargin:'0px 0px -28px 0px',threshold:.08});
    scenes.forEach(element => observer.observe(element));
    const reveal = () => scenes.forEach(element => element.classList.add('is-motion-visible'));
    window.addEventListener('beforeprint', reveal, {once:true});
    reduced.addEventListener?.('change', event => {
      if (event.matches) { root.classList.remove('motion-enhanced'); reveal(); }
    });
  } else {
    scenes.forEach(element => element.classList.add('is-motion-visible'));
  }
  const film = document.querySelector('.class-cinema-visual .class-cinema-film');
  const stage = document.querySelector('.class-cinema-visual');
  if (!film || !stage || !('requestAnimationFrame' in window)) return;
  if (navigator.connection?.saveData) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    if (document.hidden || smallScreen.matches || reduced.matches) {
      film.style.removeProperty('--class-motion-parallax');
      return;
    }
    const rect = stage.getBoundingClientRect();
    if (rect.bottom < -50 || rect.top > window.innerHeight + 50) return;
    const midpoint = rect.top + rect.height / 2;
    const ratio = Math.max(-1, Math.min(1, (window.innerHeight / 2 - midpoint) / window.innerHeight));
    film.style.setProperty('--class-motion-parallax', (ratio * 10).toFixed(2) + 'px');
  };
  const schedule = () => {if (!raf) raf = requestAnimationFrame(update)};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  smallScreen.addEventListener?.('change',schedule);
  reduced.addEventListener?.('change',schedule);
  document.addEventListener('visibilitychange',schedule);
  schedule();
})();
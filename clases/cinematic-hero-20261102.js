/* Pausa el video cuando no es visible, al ahorrar datos o si se solicita menos movimiento. */
(() => {
  const stage = document.querySelector('.class-cinema-visual');
  const video = stage?.querySelector('video');
  if (!stage || !video) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lowData = !!navigator.connection?.saveData;
  let visible = false;
  const sync = () => {
    if (reduced.matches || lowData || !visible || document.hidden) { video.pause(); return; }
    const play = video.play();
    play?.catch?.(() => {});
  };
  video.muted = true;
  video.pause();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      sync();
    }, {threshold:.1}).observe(stage);
  } else {visible=true;sync()}
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener?.('change',sync);
})();
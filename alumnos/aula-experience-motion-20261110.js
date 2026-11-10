/* Independent progressive enhancement for classroom scrolling.
   Uses existing selected states; never changes lessons, authentication or storage. */
(() => {
  const boot = () => {
    const layout = document.getElementById('aula-layout');
    const rail = document.getElementById('aula-rail');
    if (!layout || !rail) return;
    const navigation = rail.querySelector('.aula-navigation');
    const top = layout.querySelector('.aula-main-top');
    let pending = false;
    const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const keepSelectedVisible = () => {
      const selected = navigation?.querySelector('.aula-side-link[aria-current="page"],.aula-side-link.aula-selected,.lesson-index button.current');
      if (!(selected instanceof HTMLElement) || !(navigation instanceof HTMLElement)) return;
      const pane = navigation.getBoundingClientRect();
      const bounds = selected.getBoundingClientRect();
      const gap = 16;
      const offset = bounds.top < pane.top + gap ? bounds.top - pane.top - gap :
        bounds.bottom > pane.bottom - gap ? bounds.bottom - pane.bottom + gap : 0;
      if (Math.abs(offset) > 2) navigation.scrollBy({top:offset,behavior:reduced()?'auto':'smooth'});
    };
    const drawProgress = () => {
      pending = false;
      if (!(top instanceof HTMLElement) || !document.body.classList.contains('aula-member')) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const portion = scrollable > 0 ? Math.max(0,Math.min(1,window.scrollY / scrollable)) : 0;
      top.style.setProperty('--aula-scroll-progress',String(portion));
    };
    const scheduleProgress = () => {
      if (!pending) { pending = true; window.requestAnimationFrame(drawProgress); }
    };
    const scheduleNav = () => window.requestAnimationFrame(keepSelectedVisible);
    const changes = navigation && new MutationObserver(scheduleNav);
    if (changes && navigation) changes.observe(navigation,{subtree:true,attributes:true,attributeFilter:['class','aria-current']});
    navigation?.addEventListener('click',scheduleNav);
    window.addEventListener('scroll',scheduleProgress,{passive:true});
    window.addEventListener('resize',scheduleProgress,{passive:true});
    document.addEventListener('visibilitychange',scheduleProgress);
    scheduleProgress(); scheduleNav();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
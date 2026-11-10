/* Lightweight editorial interactions shared by the owner Studio and Content Lab.
   Never manipulate canvas layers, editor exports, save state, or customer data. */
export function keepActiveSidebarVisible(
  rootSelector: string, scrollerSelector: string, activeSelector: string,
): void {
  if (typeof window === 'undefined') return;
  const root = document.querySelector(rootSelector);
  const scroller = root?.querySelector<HTMLElement>(scrollerSelector);
  const active = scroller?.querySelector<HTMLElement>(activeSelector);
  if (!scroller || !active || scroller.clientHeight < 1) return;
  const pane = scroller.getBoundingClientRect();
  const item = active.getBoundingClientRect();
  const margin = 16;
  const offset = item.top < pane.top + margin
    ? item.top - pane.top - margin
    : item.bottom > pane.bottom - margin
      ? item.bottom - pane.bottom + margin
      : 0;
  if (Math.abs(offset) > 2) {
    scroller.scrollBy({
      top: offset,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
}

export function revealEditorialCards(rootSelector: string, cardSelector: string): () => void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const root = document.querySelector(rootSelector);
  if (!root) return () => {};
  const cards = [...root.querySelectorAll<HTMLElement>(cardSelector)];
  if (!cards.length) return () => {};
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const card = entry.target as HTMLElement;
      // Toggle only a short arrival animation. Never hide unfocused cards or content.
      card.classList.toggle('tle-reveal-visible', entry.isIntersecting);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -18px 0px' });
  cards.forEach(card => observer.observe(card));
  return () => {
    observer.disconnect();
    cards.forEach(card => card.classList.remove('tle-reveal-visible'));
  };
}

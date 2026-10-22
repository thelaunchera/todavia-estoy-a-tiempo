(() => {
  const config = window.PODCAST_CONFIG || {};
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu-toggle');
  const toast = document.querySelector('#toast');
  let timeout;
  const publicUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  };
  const info = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(timeout);
    timeout = setTimeout(() => toast.classList.remove('show'), 5500);
  };
  const closeMenu = () => {
    nav?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Abrir navegación');
  };
  menu?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(!!open));
    menu.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav?.classList.contains('open')) {
      closeMenu();
      menu?.focus();
    }
  });
  document.addEventListener('click', event => {
    if (nav?.classList.contains('open') && !nav.contains(event.target) && !menu?.contains(event.target)) closeMenu();
  });
  document.querySelectorAll('[data-guide]').forEach(button => {
    const url = publicUrl(config.freeGuideUrl);
    if (url) {
      const note = document.querySelector('#guide-state');
      if (note) note.textContent = 'Recurso gratuito en PDF. Sin compra.';
    }
    button.addEventListener('click', () => url ? window.location.assign(url) : info('Estamos preparando las cinco preguntas. La descarga gratuita aparecerá aquí cuando esté lista.'));
  });
  document.querySelectorAll('[data-podcast]').forEach(button => {
    const url = publicUrl(config.podcastUrl);
    if (url) document.querySelector('#podcast-state')?.remove();
    button.addEventListener('click', () => url ? window.open(url, '_blank', 'noopener,noreferrer') : info('El enlace oficial del podcast se añadirá aquí. Nos escuchamos cada martes.'));
  });
  document.querySelectorAll('[data-buy]').forEach(button => {
    const url = publicUrl(config.stripePaymentLinks?.[button.dataset.buy]);
    const ready = config.commerceEnabled === true && url !== null;
    button.disabled = !ready;
    if (ready) button.textContent = 'Conseguir el cuaderno';
    button.addEventListener('click', () => {
      if (ready) window.location.assign(url);
    });
  });

  // An image pill expands from its measured hero-relative bounds to fill the hero.
  // No dependency or layout shift: only a clip-path on the full-size overlay animates.
  const hero = document.querySelector('.hero');
  const imageOverlay = document.querySelector('#hero-image-overlay');
  const overlayImage = imageOverlay?.querySelector('.hero-overlay-photo');
  const overlayQuote = imageOverlay?.querySelector('.hero-overlay-quote');
  const overlayClose = imageOverlay?.querySelector('.hero-overlay-close');
  const pills = [...document.querySelectorAll('[data-hero-pill]')];
  const heroReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let expandedPill = null;
  let overlayAnimation = null;
  let openingClip = '';
  const fullClip = 'inset(0px 0px 0px 0px round 0px)';
  const pillClip = pill => {
    const parent = hero.getBoundingClientRect();
    const p = pill.getBoundingClientRect();
    const top = Math.max(0, p.top - parent.top);
    const right = Math.max(0, parent.right - p.right);
    const bottom = Math.max(0, parent.bottom - p.bottom);
    const left = Math.max(0, p.left - parent.left);
    return `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${(p.height/2).toFixed(1)}px)`;
  };
  const resetOverlay = (restoreFocus = true) => {
    if (!expandedPill || !imageOverlay) return;
    const last = expandedPill;
    expandedPill = null;
    imageOverlay.classList.remove('is-active');
    imageOverlay.style.clipPath = '';
    imageOverlay.setAttribute('aria-hidden', 'true');
    imageOverlay.setAttribute('inert', '');
    pills.forEach(p => p.setAttribute('aria-expanded', 'false'));
    if (restoreFocus) last.focus({ preventScroll: true });
  };
  const closeOverlay = () => {
    if (!expandedPill || !imageOverlay) return;
    overlayAnimation?.cancel();
    if (heroReduceMotion.matches || typeof imageOverlay.animate !== 'function') {
      resetOverlay();
      return;
    }
    const closing = imageOverlay.animate([
      { clipPath: fullClip },
      { clipPath: openingClip }
    ], { duration: 480, easing: 'cubic-bezier(.35,0,.72,1)', fill: 'forwards' });
    overlayAnimation = closing;
    closing.finished.then(() => {
      if (overlayAnimation === closing) { closing.cancel(); resetOverlay(); }
    }).catch(() => {});
  };
  const openOverlay = pill => {
    if (!hero || !imageOverlay || !overlayImage || !overlayClose) return;
    if (expandedPill) {
      overlayAnimation?.cancel();
      resetOverlay(false);
    }
    const smallImage = pill.querySelector('img');
    if (!smallImage) return;
    expandedPill = pill;
    openingClip = pillClip(pill);
    overlayImage.src = smallImage.currentSrc || smallImage.src;
    overlayImage.alt = pill.dataset.expandedAlt || 'Imagen ampliada del podcast';
    if (overlayQuote) overlayQuote.textContent =
      pill.classList.contains('hero-pill-second')
        ? 'Volver a ti también es una forma de empezar.'
        : 'Cada historia merece su propio tiempo.';
    imageOverlay.removeAttribute('inert');
    imageOverlay.setAttribute('aria-hidden', 'false');
    imageOverlay.classList.add('is-active');
    imageOverlay.style.clipPath = openingClip;
    pills.forEach(p => p.setAttribute('aria-expanded', String(p === pill)));
    if (heroReduceMotion.matches || typeof imageOverlay.animate !== 'function') {
      imageOverlay.style.clipPath = fullClip;
      overlayClose.focus({ preventScroll: true });
      return;
    }
    const opening = imageOverlay.animate([
      { clipPath: openingClip },
      { clipPath: fullClip }
    ], { duration: 690, easing: 'cubic-bezier(.16,1,.28,1)', fill: 'forwards' });
    overlayAnimation = opening;
    opening.finished.then(() => {
      if (overlayAnimation === opening && expandedPill === pill) {
        imageOverlay.style.clipPath = fullClip;
        opening.cancel();
        overlayClose.focus({ preventScroll: true });
      }
    }).catch(() => {});
  };
  pills.forEach(pill => pill.addEventListener('click', () => openOverlay(pill)));
  overlayClose?.addEventListener('click', closeOverlay);
  imageOverlay?.addEventListener('click', event => {
    if (!overlayClose?.contains(event.target)) closeOverlay();
  });
  document.addEventListener('keydown', event => {
    if (!expandedPill) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeOverlay();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      overlayClose?.focus({ preventScroll: true });
    }
  });
  window.addEventListener('resize', () => {
    if (expandedPill) {
      openingClip = pillClip(expandedPill);
      imageOverlay.style.clipPath = fullClip;
    }
  }, { passive: true });

  const progress = document.querySelector('.scroll-progress');
  let frame = 0;
  const draw = () => {
    frame = 0;
    if (progress) {
      const limit = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      progress.style.width = Math.max(0, Math.min(100, scrollY / limit * 100)).toFixed(2) + '%';
    }
  };
  const raf = () => { if (!frame) frame = requestAnimationFrame(draw); };
  window.addEventListener('scroll', raf, { passive: true });
  window.addEventListener('resize', raf);
  draw();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const elements = [...document.querySelectorAll('.reveal')];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }, { threshold: .04, rootMargin: '0px 0px -12px 0px' });
    elements.forEach(el => observer.observe(el));
    document.body.classList.add('js-motion');
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) document.body.classList.remove('js-motion');
    });
  }
})();

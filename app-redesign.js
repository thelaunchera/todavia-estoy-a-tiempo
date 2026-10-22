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
  const guideForm = document.querySelector('#guide-form');
  guideForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!guideForm.reportValidity()) return;
    const note = document.querySelector('#guide-state');
    const button = guideForm.querySelector('button[type="submit"]');
    const endpoint = publicUrl(config.freeGuideEndpoint);
    if (!endpoint) { note.textContent = 'La entrega estará disponible pronto.'; return; }
    button.disabled = true;
    note.textContent = 'Estamos enviando tu guía…';
    const fields = new FormData(guideForm);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const payload = new URLSearchParams({
        email: String(fields.get('email') || '').trim(),
        name: '', resource: 'cinco_preguntas', newsletter: 'no',
        website: String(fields.get('website') || ''), source: 'podcast_website'
      });
      const response = await fetch(endpoint, { method: 'POST', body: payload, signal: controller.signal });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('Delivery not confirmed');
      note.textContent = 'Listo. Revisa tu correo y la carpeta de spam. Si ya la pediste hoy, usa el mismo mensaje.';
      guideForm.reset();
    } catch {
      note.textContent = 'No pudimos confirmar el envío. Inténtalo de nuevo o escribe a hello@thelaunchera.com.';
    } finally {
      clearTimeout(timer);
      button.disabled = false;
    }
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
    if (ready) button.innerHTML = 'Conseguir el cuaderno <span aria-hidden="true">↗</span>';
    button.addEventListener('click', () => {
      if (ready) window.location.assign(url);
    });
  });
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

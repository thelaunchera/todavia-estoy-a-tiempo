(() => {
  const config = window.PODCAST_CONFIG || {};
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu-toggle');
  const toast = document.querySelector('#toast');
  let timeout;

  // A tiny sentinel detects when the transparent nav becomes frosted glass.
  // The header itself does not use a scroll listener when IntersectionObserver is available.
  const glassHeader = document.querySelector('.header');
  const glassSentinel = document.querySelector('.scroll-sentinel');
  const setGlass = on => glassHeader?.setAttribute('data-scrolled', on ? 'true' : 'false');
  setGlass(window.scrollY > 8);
  if (glassHeader && glassSentinel && 'IntersectionObserver' in window) {
    const glassObserver = new IntersectionObserver(([entry]) => {
      setGlass(!entry.isIntersecting);
    }, { threshold: 0 });
    glassObserver.observe(glassSentinel);
  } else if (glassHeader) {
    window.addEventListener('scroll', () => setGlass(window.scrollY > 8), { passive: true });
  }
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
    button.addEventListener('click', () => {
      const form = document.getElementById('guide-form');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        form.querySelector('input[type="email"]')?.focus({ preventScroll: true });
      } else info('Solicita las 5 preguntas desde el formulario para recibirlas por correo.');
    });
  });
  document.querySelectorAll('[data-podcast]').forEach(button => {
    const url = publicUrl(config.podcastUrl);
    if (url) document.querySelector('#podcast-state')?.remove();
    button.addEventListener('click', () => url ? window.open(url, '_blank', 'noopener,noreferrer') : info('El enlace oficial del podcast se añadirá aquí. Nos escuchamos cada martes.'));
  });
  document.querySelectorAll('[data-buy]').forEach(button => {
    const url = publicUrl(config.checkoutLinks?.[button.dataset.buy]);
    const ready = config.commerceEnabled === true && url !== null;
    button.disabled = !ready;
    if (ready) button.textContent = button.dataset.buy === 'noVoyTarde' ? 'Comprar mi diario · $1.99' : 'Comprar mi cuaderno · $3.99';
    button.addEventListener('click', () => {
      if (ready) window.location.assign(url);
    });
  });

  // Image pills unveil a contained editorial photo panel without distorting book-cover text.
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
    // The expanded overlay fills the mobile viewport, so animation coordinates
    // must be relative to the viewport rather than the taller page hero.
    const p = pill.getBoundingClientRect();
    const width = window.innerWidth, height = window.innerHeight;
    const top = Math.max(0, Math.min(height, p.top));
    const right = Math.max(0, Math.min(width, width - p.right));
    const bottom = Math.max(0, Math.min(height, height - p.bottom));
    const left = Math.max(0, Math.min(width, p.left));
    return `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${(p.height/2).toFixed(1)}px)`;
  };
  const resetOverlay = (restoreFocus = true) => {
    if (!expandedPill || !imageOverlay) return;
    const last = expandedPill;
    expandedPill = null;
    hero.style.zIndex = '';
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
    hero.style.zIndex = '120'; // Image and dismiss button stay above the header during expansion.
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


  // Editorial paragraph reveal. The original sentence remains plain text and
  // is measured per visual line for each viewport width, without layout jumps.
  const lineTargets = [...document.querySelectorAll('[data-line-reveal]')];
  const lineOriginal = new WeakMap();
  const lineSeen = new WeakSet();
  const prefersStillness = window.matchMedia('(prefers-reduced-motion: reduce)');
  const measureParagraph = element => {
    const original = lineOriginal.get(element) || element.textContent.replace(/\s+/g, ' ').trim();
    if (!original) return;
    lineOriginal.set(element, original);
    element.setAttribute('aria-label', original);
    element.replaceChildren();
    const measure = document.createElement('span');
    measure.className = 'line-measure';
    measure.setAttribute('aria-hidden', 'true');
    const wordNodes = [];
    for (const [i, word] of original.split(' ').entries()) {
      if (i) measure.append(document.createTextNode(' '));
      const node = document.createElement('span');
      node.className = 'line-measure-word';
      node.textContent = word;
      measure.append(node);
      wordNodes.push(node);
    }
    element.append(measure);
    const lines = [];
    let previousTop = null;
    for (const word of wordNodes) {
      const top = Math.round(word.offsetTop);
      if (previousTop === null || Math.abs(top - previousTop) > 2) {
        lines.push([word.textContent]);
        previousTop = top;
      } else {
        lines[lines.length - 1].push(word.textContent);
      }
    }
    const fragment = document.createDocumentFragment();
    lines.forEach((words, index) => {
      const span = document.createElement('span');
      span.className = 'line-reveal-line';
      if (index >= Math.ceil(lines.length / 2)) span.classList.add('is-muted');
      span.style.setProperty('--i', index);
      span.textContent = words.join(' ');
      span.setAttribute('aria-hidden', 'true');
      fragment.append(span);
    });
    element.replaceChildren(fragment);
    element.classList.add('has-line-layout');
    if (lineSeen.has(element) || prefersStillness.matches) element.classList.add('is-reflowed', 'is-visible');
  };
  lineTargets.forEach(measureParagraph);
  if (!prefersStillness.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= .4 && !lineSeen.has(entry.target)) {
          lineSeen.add(entry.target);
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: [.4, 1] });
    lineTargets.forEach(element => observer.observe(element));
  } else {
    lineTargets.forEach(element => {
      lineSeen.add(element);
      element.classList.add('is-visible', 'is-reflowed');
    });
  }
  let lineResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(lineResizeTimer);
    lineResizeTimer = setTimeout(() => lineTargets.forEach(measureParagraph), 120);
  }, { passive: true });

  // Submit-time validation, then gentle live corrections. Validation feedback
  // takes reserved space, never moving the surrounding elements.
  const validEmail = email =>
    email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const installEmailField = form => {
    const input = form.querySelector('input[type="email"]');
    const wrapper = input?.closest('[data-email-field]');
    const feedback = form.querySelector('#' + input?.id + '-feedback');
    if (!input || !wrapper || !feedback) return null;
    let attempted = false;
    const validate = (showShake = false) => {
      const value = input.value.trim();
      const valid = validEmail(value);
      wrapper.classList.toggle('is-valid', valid);
      wrapper.classList.toggle('has-error', !valid);
      input.setAttribute('aria-invalid', String(!valid));
      feedback.textContent = valid ? 'Correo válido' : (value ? 'Revisa tu correo, por ejemplo: nombre@correo.com.' : 'Escribe tu correo para continuar.');
      if (!valid && showShake && !prefersStillness.matches) {
        wrapper.classList.remove('is-shaking');
        void wrapper.offsetWidth;
        wrapper.classList.add('is-shaking');
      }
      return valid;
    };
    input.addEventListener('input', () => {
      if (attempted) validate(false);
    });
    wrapper.addEventListener('animationend', () => wrapper.classList.remove('is-shaking'));
    return {
      input,
      check(shake = false) { attempted = true; return validate(shake); },
      clear() {
        attempted = false;
        wrapper.classList.remove('is-valid', 'has-error', 'is-shaking');
        input.setAttribute('aria-invalid', 'false');
        feedback.textContent = '';
      }
    };
  };
  for (const form of document.querySelectorAll('[data-podcast-form]')) {
    const field = installEmailField(form);
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('button[type="submit"]');
    const buttonText = submit?.textContent;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!field || !submit || !status) return;
      status.replaceChildren();
      status.classList.remove('is-success', 'is-error');
      const emailOkay = field.check(true);
      const requiredFields = [...form.querySelectorAll('[required]:not([type="email"])')];
      let firstInvalid = null;
      for (const input of requiredFields) {
        const valid = input.checkValidity();
        input.classList.toggle('has-form-error', !valid);
        if (!valid && !firstInvalid) firstInvalid = input;
      }
      if (!emailOkay || firstInvalid) {
        if (firstInvalid) status.textContent = 'Completa el nombre, el tema y un mensaje de al menos 10 caracteres.';
        (emailOkay ? firstInvalid : field.input).focus();
        return;
      }
      const kind = form.dataset.podcastForm;
      const wantsEpisodeNotes = kind === 'guide' && form.querySelector('input[name="newsletter"]')?.checked === true;
      const url = publicUrl(kind === 'guide' ? config.freeGuideEndpoint : config.helpEndpoint);
      if (!url) {
        status.textContent = 'El formulario no está disponible ahora. Inténtalo más tarde.';
        status.classList.add('is-error');
        return;
      }
      if (form.querySelector('[name="website"]')?.value) return;
      const payload = new URLSearchParams(new FormData(form));
      submit.disabled = true;
      submit.textContent = kind === 'guide' ? 'Enviando tu guía…' : 'Enviando consulta…';
      try {
        const response = await fetch(url, { method: 'POST', mode: 'cors', headers: { Accept: 'application/json' }, body: payload });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        if (data?.ok !== true) throw new Error('Envío no confirmado');
        status.textContent = kind === 'guide'
          ? 'Te enviamos la guía por correo. Revisa tu bandeja de entrada y la carpeta Spam.'
          : '¡Recibimos tu consulta! Te enviamos una confirmación y te responderé pronto.';
        status.classList.add('is-success');
        // The freebie never depends on subscribing. Save permission only when
        // the person explicitly checked the optional box.
        if (wantsEpisodeNotes) {
          const subscribeUrl = publicUrl(config.newsletterEndpoint);
          try {
            if (!subscribeUrl) throw new Error('Servicio no disponible');
            const consentBody = new URLSearchParams({
              email: field.input.value.trim().toLowerCase(),
              resource: 'podcast_newsletter',
              newsletter: 'yes',
              source: 'freebie',
              website: ''
            });
            const consentRes = await fetch(subscribeUrl, {
              method: 'POST', mode: 'cors',
              headers: { Accept: 'application/json' },
              body: consentBody
            });
            if (!consentRes.ok || (await consentRes.json())?.ok !== true) throw new Error('No guardado');
            status.textContent += ' También te avisaré cuando salga un nuevo episodio.';
          } catch {
            status.textContent += ' No pude activar los avisos; puedes intentarlo desde el formulario al final de la página.';
          }
        }
        form.reset();
        field.clear();
        requiredFields.forEach(input => input.classList.remove('has-form-error'));
      } catch (error) {
        status.textContent = kind === 'guide'
          ? 'No pudimos confirmar el envío de la guía. Inténtalo otra vez.'
          : 'No pudimos confirmar la consulta. Inténtalo de nuevo.';
        status.classList.add('is-error');
      } finally {
        submit.disabled = false;
        submit.textContent = buttonText;
      }
    });
    form.querySelectorAll('input[required]:not([type="email"]),textarea[required],select[required]').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('has-form-error'));
      input.addEventListener('change', () => input.classList.remove('has-form-error'));
    });
  }

  // A single threshold one viewport down controls the floating back-to-top.
  // No scroll listener is used to toggle its visibility.
  const backTop = document.querySelector('.floating-back-top[data-back-top]');
  const backSentinel = document.querySelector('.return-top-sentinel');
  const backMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const showBackTop = visible => {
    if (!backTop) return;
    backTop.classList.toggle('is-shown', visible);
    backTop.setAttribute('aria-hidden', String(!visible));
    backTop.tabIndex = visible ? 0 : -1;
  };
  if (backTop && backSentinel && 'IntersectionObserver' in window) {
    showBackTop(window.scrollY > window.innerHeight);
    const observer = new IntersectionObserver(([entry]) => {
      showBackTop(entry.boundingClientRect.top < 0 && !entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(backSentinel);
  } else if (backTop) {
    showBackTop(true);
  }
  backTop?.addEventListener('click', () => {
    closeMenu();
    const destination = document.getElementById('top') || document.getElementById('principal');
    const restoreFocus = () => {
      if (!destination) return;
      destination.setAttribute('tabindex', '-1');
      try { destination.focus({ preventScroll: true }); }
      catch { destination.focus(); }
    };
    backTop.classList.add('is-traveling');
    backTop.classList.add('is-pressing');
    window.setTimeout(() => backTop.classList.remove('is-pressing'), 90);
    if (backMotion.matches) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      backTop.classList.remove('is-traveling');
      restoreFocus();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const begun = performance.now();
    const awaitArrival = () => {
      if (window.scrollY <= 3 || performance.now() - begun > 2400) {
        backTop.classList.remove('is-traveling');
        restoreFocus();
      } else {
        requestAnimationFrame(awaitArrival);
      }
    };
    requestAnimationFrame(awaitArrival);
  });

  // Editorial CTA card overlaps the footer and grows gently with its visible area.
  const footerCta = document.querySelector('[data-footer-cta]');
  if (footerCta && !backMotion.matches && 'IntersectionObserver' in window) {
    footerCta.classList.add('is-motion-ready');
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const ctaObserver = new IntersectionObserver(([entry]) => {
      const ratio = Math.max(0, Math.min(1, entry.intersectionRatio));
      const ease = 1 - Math.pow(1 - ratio, 3);
      footerCta.style.opacity = String(.25 + .75 * ease);
      footerCta.style.transform = `translateY(${(34 * (1 - ease)).toFixed(2)}px) scale(${(.9 + .1 * ease).toFixed(4)})`;
      if (ratio >= .999) {
        footerCta.style.opacity = '1';
        footerCta.style.transform = 'none';
        ctaObserver.disconnect();
      }
    }, { threshold: thresholds });
    ctaObserver.observe(footerCta);
  }

  const editorialFooter = document.querySelector('.footer-curtain');
  if (editorialFooter && 'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const footerObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        editorialFooter.classList.add('is-visible');
        footerObserver.disconnect();
      }
    }, { threshold: 0.08 });
    editorialFooter.classList.add('footer-animate');
    footerObserver.observe(editorialFooter);
  }

  // Newsletter is separate from the free guide: opt-in only, stored by Make/Resend.
  // A successful server response is required before the field transforms.
  const newsletterForm = document.querySelector('[data-newsletter-form]');
  if (newsletterForm) {
    const email = newsletterForm.querySelector('input[type="email"]');
    const pill = newsletterForm.querySelector('[data-newsletter-pill]');
    const button = newsletterForm.querySelector('.newsletter-submit');
    const feedback = newsletterForm.querySelector('.newsletter-feedback');
    const confirmation = newsletterForm.querySelector('.newsletter-confirmation');
    const confirmationText = newsletterForm.querySelector('.newsletter-confirmation-text');
    const validNewsletterEmail = value =>
      value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    newsletterForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (newsletterForm.classList.contains('is-done') || button.disabled) return;
      const value = email.value.trim();
      feedback.textContent = '';
      pill.classList.remove('has-error');
      email.removeAttribute('aria-invalid');
      if (!validNewsletterEmail(value)) {
        pill.classList.add('has-error');
        email.setAttribute('aria-invalid', 'true');
        feedback.textContent = 'Escribe un correo válido para suscribirte.';
        email.focus();
        return;
      }
      if (newsletterForm.querySelector('[name="website"]')?.value) return;
      const endpoint = publicUrl(config.newsletterEndpoint);
      if (!endpoint) {
        feedback.textContent = 'La suscripción no está disponible en este momento.';
        return;
      }
      button.classList.add('is-pressing');
      window.setTimeout(() => button.classList.remove('is-pressing'), 90);
      email.disabled = true;
      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = 'Enviando…';
      try {
        const payload = new URLSearchParams();
        payload.set('email', value);
        payload.set('resource', 'podcast_newsletter');
        payload.set('newsletter', 'yes');
        payload.set('source', 'footer');
        payload.set('website', '');
        const response = await fetch(endpoint, {
          method: 'POST', mode: 'cors',
          headers: { Accept: 'application/json' }, body: payload
        });
        if (!response.ok) throw new Error('Error ' + response.status);
        const data = await response.json();
        if (data?.ok !== true) throw new Error('Alta no confirmada');
        confirmationText.textContent = '¡Ya estás dentro!';
        confirmation.setAttribute('aria-hidden', 'false');
        newsletterForm.classList.add('is-done');
        feedback.textContent = 'Recibirás únicamente novedades del podcast.';
        // Do not reset: successful subscriptions remain visibly confirmed.
        button.textContent = originalText;
      } catch {
        email.disabled = false;
        button.disabled = false;
        button.textContent = originalText;
        feedback.textContent = 'No pudimos confirmar tu suscripción. Inténtalo otra vez.';
        pill.classList.add('has-error');
      }
    });
    email.addEventListener('input', () => {
      if (newsletterForm.classList.contains('is-done')) return;
      pill.classList.remove('has-error');
      feedback.textContent = '';
      email.removeAttribute('aria-invalid');
    });
  }

  // El contacto del podcast se abre solo cuando lo solicita la persona.
  // Conservamos intacto el formulario y su conexión de soporte.
  const helpToggle = document.getElementById('help-toggle');
  const helpPanel = document.getElementById('help-panel');
  const helpClose = document.getElementById('help-close');
  if (helpToggle && helpPanel) {
    const setHelpOpen = open => {
      helpPanel.hidden = !open;
      helpToggle.setAttribute('aria-expanded', String(open));
      helpToggle.textContent = open ? 'Formulario abierto' : 'Escríbeme';
      if (open) {
        const firstField = helpPanel.querySelector('#help-name');
        firstField?.focus({ preventScroll: true });
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        helpPanel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
      } else {
        helpToggle.focus({ preventScroll: true });
      }
    };
    helpToggle.addEventListener('click', () => setHelpOpen(helpPanel.hidden));
    helpClose?.addEventListener('click', () => setHelpOpen(false));
    helpPanel.addEventListener('keydown', event => {
      if (event.key === 'Escape') setHelpOpen(false);
    });
    // Direct contact links from any landing open the actual form, not a closed section.
    const openLinkedHelp = () => {
      if (window.location.hash === '#ayuda' || window.location.hash === '#help-form') {
        setHelpOpen(true);
      }
    };
    openLinkedHelp();
    window.addEventListener('hashchange', openLinkedHelp);
  }

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

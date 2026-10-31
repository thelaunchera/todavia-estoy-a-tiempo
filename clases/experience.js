/* Interacciones de presentación — jamás modifica cobros ni registros de alumnos. */
(() => {
  'use strict';
  const root = document.querySelector('.class-page-v2');
  if (!root) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Transformación dirigida por la persona: sin autoplay ni ciclos decorativos.
  const transformation = document.querySelector('[data-idea-transform]');
  const ideaProgress = document.getElementById('idea-progress');
  if (transformation && ideaProgress) {
    const choices = Array.from(transformation.querySelectorAll('[data-transform-to]'));
    const before = transformation.querySelector('[data-transform-caption="before"]');
    const after = transformation.querySelector('[data-transform-caption="after"]');
    const scene = document.getElementById('transform-scene');
    let animation = null;
    function renderIdea(value) {
      const progress = Math.max(0, Math.min(100, Number(value) || 0));
      const complete = progress >= 50;
      transformation.style.setProperty('--formation', String(progress / 100));
      transformation.style.setProperty('--formed-opacity', String(Math.max(0, (progress - 15) / 85)));
      ideaProgress.style.setProperty('--fill', progress + '%');
      ideaProgress.value = String(progress);
      const description = progress === 0 ? 'Boceto inicial de Casa Brownie' : progress === 100 ? 'Resultado: muestra visual de Casa Brownie' : 'Transformación visual: ' + Math.round(progress) + '%';
      ideaProgress.setAttribute('aria-valuetext', description);
      scene?.setAttribute('aria-label', complete ? 'Resultado: muestra visual de la landing Casa Brownie.' : 'Boceto de Casa Brownie con bloques de texto, imagen y botón sin diseñar.');
      choices.forEach(choice => choice.setAttribute('aria-pressed', String(Number(choice.dataset.transformTo) === (complete ? 100 : 0))));
      if (before) before.hidden = complete;
      if (after) after.hidden = !complete;
    }
    function stopTransformation() {
      if (animation !== null) window.cancelAnimationFrame(animation);
      animation = null;
    }
    choices.forEach(choice => choice.addEventListener('click', () => {
      stopTransformation();
      const target = Number(choice.dataset.transformTo);
      const start = Number(ideaProgress.value);
      if (reducedMotion.matches || start === target) {
        renderIdea(target);
        return;
      }
      const began = performance.now();
      function step(now) {
        const elapsed = Math.min(1, (now - began) / 650);
        const eased = elapsed * elapsed * (3 - 2 * elapsed);
        renderIdea(start + (target - start) * eased);
        if (elapsed < 1) animation = window.requestAnimationFrame(step);
        else animation = null;
      }
      animation = window.requestAnimationFrame(step);
    }));
    ideaProgress.addEventListener('input', () => {
      stopTransformation();
      renderIdea(ideaProgress.value);
    });
    ideaProgress.addEventListener('pointerdown', stopTransformation);
    ideaProgress.addEventListener('keydown', stopTransformation);
    reducedMotion.addEventListener?.('change', event => {
      if (event.matches) {
        stopTransformation();
        renderIdea(Number(ideaProgress.value) >= 50 ? 100 : 0);
      }
    });
    renderIdea(ideaProgress.value);
    transformation.classList.add('is-interactive');
    transformation.querySelectorAll('.class-transform-hint, .class-transform-options, .class-transform-control').forEach(element => {element.hidden = false;});
  }
  const preview = document.querySelector('.class-browser');
  const previewCopy = {
    limpieza: {
      kicker: 'SERVICIO LOCAL · EJEMPLO',
      title: 'Más tiempo para disfrutar tu hogar.',
      text: 'Una página clara para conocer el servicio y pedir información.',
      action: 'Consultar disponibilidad'
    },
    belleza: {
      kicker: 'ESTUDIO LOCAL · EJEMPLO',
      title: 'Un espacio para cuidarte.',
      text: 'Presenta los servicios y facilita las consultas desde el móvil.',
      action: 'Conocer servicios'
    },
    cafe: {
      kicker: 'CAFETERÍA LOCAL · EJEMPLO',
      title: 'Tu rincón favorito de la ciudad.',
      text: 'Muestra lo que ofreces y ayuda a encontrar tu negocio.',
      action: 'Explorar el menú'
    }
  };
  const buttons = Array.from(document.querySelectorAll('[data-preview-choice]'));
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.previewChoice;
      const data = previewCopy[id];
      if (!data || !preview) return;
      preview.dataset.preview = id;
      document.getElementById('preview-kicker').textContent = data.kicker;
      document.getElementById('preview-headline').textContent = data.title;
      document.getElementById('preview-description').textContent = data.text;
      const action = document.getElementById('preview-action');
      action.replaceChildren();
      action.appendChild(document.createTextNode(data.action + ' '));
      const mark = document.createElement('span');
      mark.textContent = '↗';
      mark.setAttribute('aria-hidden', 'true');
      action.appendChild(mark);
      buttons.forEach(b => {
        const selected = b === button;
        b.classList.toggle('is-active', selected);
        b.setAttribute('aria-pressed', String(selected));
      });
    });
  });

  const tabs = Array.from(document.querySelectorAll('.class-material-tab'));
  function activateTab(tab, moveFocus = false) {
    const panelId = tab?.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.classList.toggle('is-active', on);
      t.tabIndex = on ? 0 : -1;
      const associated = document.getElementById(t.getAttribute('aria-controls') || '');
      if (associated) associated.hidden = !on;
    });
    if (moveFocus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', e => {
      let to = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = tabs[(index + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = tabs[(index - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') to = tabs[0];
      if (e.key === 'End') to = tabs[tabs.length - 1];
      if (to) {
        e.preventDefault();
        activateTab(to, true);
      }
    });
  });
  if (tabs.length) activateTab(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0]);

  const copy = document.getElementById('class-copy-prompt');
  copy?.addEventListener('click', async () => {
    const prompt = document.getElementById('class-sample-prompt')?.textContent?.trim();
    if (!prompt) return;
    const original = copy.textContent;
    try {
      await navigator.clipboard.writeText(prompt);
      copy.textContent = 'Copiado ✓';
    } catch {
      copy.textContent = 'Selecciona el texto para copiar';
    }
    window.setTimeout(() => {copy.textContent = original;}, 2400);
  });

  // Solo una FAQ abierta a la vez, respetando interacción nativa <details>.
  const faqs = Array.from(document.querySelectorAll('.class-faq details'));
  faqs.forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqs.forEach(other => {if (other !== item) other.open = false;});
    });
  });

  // Barrera de accesibilidad: nunca ocultar contenido antes de confirmar observer.
  const reveals = Array.from(document.querySelectorAll('[data-class-reveal]'));
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    root.dataset.motion = 'ready';
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {rootMargin:'0px 0px -45px 0px', threshold:0.08});
    reveals.forEach(node => observer.observe(node));
    const showAll = () => {reveals.forEach(n => n.classList.add('is-visible'));};
    // A cargo de user interaction, avoid invisible content if observer doesn't fire.
    window.addEventListener('beforeprint', showAll);
    reducedMotion.addEventListener?.('change', e => {if (e.matches) showAll();});
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        const dest = document.querySelector(link.getAttribute('href'));
        if (dest) dest.querySelectorAll?.('[data-class-reveal]').forEach(n => n.classList.add('is-visible'));
      });
    });
  }

  // Enlace del footer, sin controles flotantes que tapen la lectura móvil.
  const footerBack = document.querySelector('.class-back-to-top');
  footerBack?.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({top:0,left:0,behavior:reducedMotion.matches?'instant':'smooth'});
  });

  const progress = document.getElementById('class-scroll-progress');
  if (progress) {
    let queued = false;
    function updateProgress() {
      queued = false;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
      progress.style.width = (fraction * 100).toFixed(2) + '%';
    }
    const queue = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(updateProgress);
    };
    window.addEventListener('scroll', queue, {passive:true});
    window.addEventListener('resize', queue);
    updateProgress();
  }
})();

/* Interacciones de presentación — jamás modifica cobros ni registros de alumnos. */
(() => {
  'use strict';
  const root = document.querySelector('.class-page-v2');
  if (!root) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
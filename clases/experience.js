/* Interacciones de presentación — jamás modifica cobros ni registros de alumnos. */
(() => {
  'use strict';
  const root = document.querySelector('.class-page-v2');
  const en = document.documentElement.lang === 'en';
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
    const fullPageLink = transformation.querySelector('[data-casa-brownie-open]');
    const liveFrame = transformation.querySelector('[data-casa-brownie-frame]');
    const liveFrameWrap = transformation.querySelector('[data-casa-preview]');
    let previewStarted = false;
    const showRealLanding = () => {
      if (previewStarted || !liveFrame) return;
      const address = liveFrame.getAttribute('data-src');
      if (!address) return;
      previewStarted = true;
      liveFrame.addEventListener('load', () => {
        liveFrameWrap?.setAttribute('data-loaded', 'true');
      }, {once:true});
      liveFrame.setAttribute('src', address);
    };
    // Las vistas son estados completos: nunca mezclar sus capas en Safari iOS.
    function renderIdea(value) {
      const progress = Math.max(0, Math.min(100, Number(value) || 0));
      const complete = progress >= 50;
      transformation.dataset.stage = complete ? 'after' : 'before';
      ideaProgress.style.setProperty('--fill', progress + '%');
      ideaProgress.value = String(progress);
      const description = complete ? (en?'Casa Brownie: finished example':'Resultado: muestra visual de Casa Brownie') : (en?'Casa Brownie: initial wireframe':'Boceto inicial de Casa Brownie');
      ideaProgress.setAttribute('aria-valuetext', description);
      scene?.setAttribute('aria-label', complete
        ? (en?'Finished Casa Brownie website sample.':'Resultado: muestra visual de la landing Casa Brownie.')
        : (en?'Casa Brownie wireframe with text, image and button blocks.':'Boceto de Casa Brownie con bloques de texto, imagen y botón sin diseñar.'));
      choices.forEach(choice => choice.setAttribute('aria-pressed', String(Number(choice.dataset.transformTo) === (complete ? 100 : 0))));
      if (before) before.hidden = complete;
      if (after) after.hidden = !complete;
      if (fullPageLink) fullPageLink.hidden = !complete;
      if (complete) showRealLanding();
    }
    // Cambios inmediatos: el arrastre cambia de estado, no anima dos páginas superpuestas.
    choices.forEach(choice => choice.addEventListener('click', () => {
      renderIdea(Number(choice.dataset.transformTo));
    }));
    ideaProgress.addEventListener('input', () => renderIdea(ideaProgress.value));
    transformation.classList.add('is-interactive');
    renderIdea(ideaProgress.value);
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
  const previewCopyEn = {
    limpieza:{kicker:'LOCAL SERVICE · EXAMPLE',title:'More time to enjoy your home.',text:'A clear page to explain the service and request information.',action:'Check availability'},
    belleza:{kicker:'LOCAL BEAUTY · EXAMPLE',title:'A place to take care of yourself.',text:'Introduce services and make it easier to reach out from a phone.',action:'Explore services'},
    cafe:{kicker:'LOCAL CAFÉ · EXAMPLE',title:'Your favorite place in town.',text:'Show what you offer and help customers find your business.',action:'Explore the menu'}
  };
  const buttons = Array.from(document.querySelectorAll('[data-preview-choice]'));
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.previewChoice;
      const data = en ? previewCopyEn[id] : previewCopy[id];
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
      copy.textContent = en?'Copied ✓':'Copiado ✓';
    } catch {
      copy.textContent = en?'Select the text to copy it':'Selecciona el texto para copiar';
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
        if (reducedMotion.matches || entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else if (!entry.target.matches(':focus-within')) {
          entry.target.classList.remove('is-visible');
        }
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

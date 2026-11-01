/* Clase · contacto opcional, conectado al mismo soporte del podcast. */
(() => {
  const toggle = document.getElementById('class-contact-toggle');
  const panel = document.getElementById('class-contact-panel');
  const close = document.getElementById('class-contact-close');
  const form = document.getElementById('class-contact-form');
  const feedback = document.getElementById('class-contact-feedback');
  if (!toggle || !panel || !form || !feedback) return;

  function setOpen(open, focus = true) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (focus) {
      if (open) {
        document.getElementById('class-contact-name')?.focus({preventScroll:true});
        panel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'nearest'});
      } else toggle.focus({preventScroll:true});
    }
  }
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close?.addEventListener('click', () => setOpen(false));
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') {event.preventDefault();setOpen(false);}
  });
  if (window.location.hash === '#contacto' || window.location.hash === '#class-contact-form') setOpen(true,false);
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#contacto' || window.location.hash === '#class-contact-form') setOpen(true,false);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    feedback.textContent = '';
    feedback.removeAttribute('data-state');
    if (!form.reportValidity()) return;
    if (form.elements.namedItem('website')?.value) return;
    const endpoint = window.PODCAST_CONFIG?.helpEndpoint;
    let url;
    try {
      url = new URL(endpoint);
      if (url.protocol !== 'https:' || url.username || url.password) throw Error('invalid');
    } catch {
      feedback.textContent = 'El formulario no está disponible ahora. Inténtalo de nuevo más tarde.';
      feedback.dataset.state = 'error';
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    const original = submit.textContent;
    const payload = new URLSearchParams(new FormData(form));
    submit.disabled = true;
    submit.textContent = 'Enviando consulta…';
    try {
      const response = await fetch(url.href, {
        method:'POST', mode:'cors', headers:{Accept:'application/json'}, body:payload
      });
      if(!response.ok || (await response.json())?.ok !== true)throw Error('unconfirmed');
      feedback.textContent = '¡Recibimos tu consulta! Te responderé a este mismo correo.';
      feedback.dataset.state = 'success';
      form.reset();
    } catch {
      feedback.textContent = 'No pudimos confirmar el envío. Vuelve a intentarlo.';
      feedback.dataset.state = 'error';
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
})();
// Modo de prueba local para la dueña del podcast. No concede permisos ni autentica.
(() => {
  'use strict';
  const KEY = 'podcast_test_mode_until_v1';
  const DAYS = 30;
  const MILLISECONDS = DAYS * 24 * 60 * 60 * 1000;
  const query = new URLSearchParams(window.location.search);
  const requested = query.get('podcast_test');
  let temporary = false;

  const readMode = () => {
    try {
      const expiry = Number(localStorage.getItem(KEY));
      if (Number.isFinite(expiry) && expiry > Date.now()) return true;
      if (expiry) localStorage.removeItem(KEY);
    } catch { /* Un navegador puede bloquear el almacenamiento local. */ }
    return temporary;
  };
  const clearMode = () => {
    temporary = false;
    try { localStorage.removeItem(KEY); } catch {}
  };

  if (requested === 'on') {
    temporary = true;
    try { localStorage.setItem(KEY, String(Date.now() + MILLISECONDS)); } catch {}
  } else if (requested === 'off') {
    clearMode();
  }

  // No dejar la instrucción de modo prueba en los enlaces que se copian o comparten.
  if (requested === 'on' || requested === 'off') {
    query.delete('podcast_test');
    const rest = query.toString();
    try {
      history.replaceState(history.state, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
    } catch {}
  }

  window.PODCAST_VISITOR_MODE = Object.freeze({
    isTest: readMode,
    shouldTrack: () => !readMode(),
    disable: clearMode
  });

  // Indicador solo para el navegador que ha activado el modo de prueba.
  const displayStatus = () => {
    if (!readMode() || document.getElementById('podcast-test-status')) return;
    const panel = document.createElement('aside');
    panel.id = 'podcast-test-status';
    panel.setAttribute('aria-label', 'Modo de prueba de estadísticas');
    panel.innerHTML = '<span class="podcast-test-dot" aria-hidden="true"></span><span class="podcast-test-label"><strong>Modo prueba activo</strong><small>Las escuchas de prueba no se cuentan</small></span><button type="button" class="podcast-test-off">Desactivar</button>';
    panel.querySelector('button').addEventListener('click', () => {
      clearMode();
      window.location.reload();
    });
    document.body.appendChild(panel);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayStatus, {once:true});
  } else {
    displayStatus();
  }
})();

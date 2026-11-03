/* Episodio 03: landings ES y EN; mostrar en cada carga (sin cookies ni
   supresión en almacenamiento) durante 3 días calendario, hora de Nueva York.
   Noviembre 3, 4 y 5, 2026. El 6 deja de aparecer automáticamente. */
(() => {
  'use strict';
  const start = Date.parse('2026-11-03T00:00:00-05:00');
  const end = Date.parse('2026-11-06T00:00:00-05:00');
  const show = () => {
    if (!['es','en'].includes(document.documentElement.lang)) return;
    if (Date.now() < start || Date.now() >= end) return;
    const dialog = document.getElementById('podcast-ep03-dialog');
    if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;
    dialog.querySelectorAll('[data-ep03-close]').forEach(button => {
      button.addEventListener('click', () => dialog.close());
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.showModal();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show, { once: true });
  } else show();
})();

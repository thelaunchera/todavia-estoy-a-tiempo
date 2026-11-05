/* Anuncio semanal del último episodio realmente publicado.
   Cambia portada, mensaje, título y enlace en cada estreno confirmado.
   El anuncio dura hasta siete días; NINGÚN EPISODIO se elimina del archivo. */
(() => {
  'use strict';
  const show = () => {
    const language = document.documentElement.lang;
    if (!['es', 'en'].includes(language)) return;
    const english = language === 'en';
    const episodes = window.PODCAST_PUBLISHED_EPISODES;
    if (!Array.isArray(episodes) || !episodes.length) return;
    const newest = episodes[0];
    if (!newest || !newest.published || !newest.url || !newest.popupImage) return;
    // No reutilizar la foto de un estreno anterior.
    if (episodes[1] && newest.popupImage === episodes[1].popupImage) return;
    const now = new Intl.DateTimeFormat('sv-SE', {
      timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'
    }).format(new Date());
    const toDay = date => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return NaN;
      const [year,month,day] = date.split('-').map(Number);
      return Date.UTC(year, month-1, day);
    };
    const days = Math.floor((toDay(now) - toDay(newest.date)) / 86400000);
    if (!Number.isFinite(days) || days < 0 || days >= 7) return;
    const dialog = document.getElementById('podcast-ep03-dialog');
    if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;
    const storageKey = 'podcast_episode_notice_seen_v2_' + newest.number;
    try { if (sessionStorage.getItem(storageKey) === '1') return; } catch {}
    const image = dialog.querySelector('.ep03-art img');
    const label = dialog.querySelector('.ep03-eyebrow');
    const heading = dialog.querySelector('#ep03-popup-title');
    const description = dialog.querySelector('#ep03-popup-desc');
    const action = dialog.querySelector('.ep03-cta');
    const headline = english ? newest.popupHeadlineEn : newest.popupHeadline;
    const message = english ? newest.popupMessageEn : newest.popupMessage;
    if (!image || !label || !heading || !description || !action || !headline || !message) return;
    image.src = newest.popupImage;
    image.alt = (english ? 'Artwork for the new episode: ' : 'Imagen del nuevo episodio: ') +
      (english ? newest.titleEn || newest.title : newest.title);
    label.textContent = (english ? 'NEW EPISODE · ' : 'NUEVO EPISODIO · ') +
      String(newest.number).padStart(2,'0');
    heading.textContent = headline;
    description.textContent = message;
    action.href = newest.url;
    action.textContent = (english ? 'Listen to episode ' : 'Escuchar el episodio ') +
      String(newest.number).padStart(2,'0');
    action.setAttribute('aria-label', action.textContent + (english ? ' on Spotify' : ' en Spotify'));
    const markSeen = () => { try { sessionStorage.setItem(storageKey,'1'); } catch {} };
    dialog.addEventListener('close', markSeen, {once:true});
    for (const button of dialog.querySelectorAll('[data-ep03-close]')) {
      button.addEventListener('click', () => dialog.close(), {once:true});
    }
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    action.addEventListener('click', markSeen, {once:true});
    dialog.showModal();
  };
  const afterCatalog = () => {
    const ready = window.PODCAST_EPISODE_FEED_READY;
    if (ready && typeof ready.then === 'function') {
      ready.then(show).catch(show);
    } else show();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterCatalog, {once:true});
  } else afterCatalog();
})();

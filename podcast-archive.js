/* Archivo permanente: solo publicaciones reales. La portada destacada cambia,
   pero todas las anteriores permanecen en la lista. Sin acceso a borradores del Studio. */
(() => {
  'use strict';
  const section = document.getElementById('escuchar');
  const source = window.PODCAST_EPISODES;
  if (!section || !Array.isArray(source)) return;
  const english = document.documentElement.lang === 'en';
  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
  const spotify = /^https:\/\/open\.spotify\.com\/episode\/[A-Za-z0-9]+(?:\?.*)?$/;
  const photo = value => typeof value === 'string' &&
    (/^assets\/[a-zA-Z0-9_.\/-]+$/.test(value) || /^https:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9_./?&=%-]+$/.test(value));
  const published = source.filter(episode => episode.published === true &&
    Number.isInteger(episode.number) && episode.number > 0 &&
    typeof episode.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(episode.date) &&
    episode.date <= today && spotify.test(episode.url) && photo(episode.art)
  ).sort((a, b) => b.date.localeCompare(a.date) || b.number - a.number)
    .filter((episode, index, list) => list.findIndex(other => other.number === episode.number) === index);
  if (!published.length) return;
  window.PODCAST_PUBLISHED_EPISODES = published;
  const newest = published[0];
  const title = episode => (english ? episode.titleEn : episode.title) || episode.title;
  const summary = episode => (english ? episode.summaryEn : episode.summary) || episode.summary || '';
  const episodeLabel = episode => (english ? 'EPISODE ' : 'EPISODIO ') + String(episode.number).padStart(2, '0');
  const listenLabel = episode => (english ? 'Listen to episode ' : 'Escuchar episodio ') +
    episode.number + ': ' + title(episode) + (english ? ' on Spotify' : ' en Spotify');
  const formatDate = episode => new Intl.DateTimeFormat(english ? 'en-US' : 'es-ES', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(episode.date + 'T12:00:00Z'));
  const span = (tag, className, textContent) => {
    const el = document.createElement(tag);
    el.className = className;
    el.textContent = textContent;
    return el;
  };
  // La portada principal representa el último episodio efectivamente publicado.
  const feature = section.querySelector('.episode-mini-card-latest');
  if (feature) {
    const kicker = feature.querySelector('[data-ep-kicker]');
    const heading = feature.querySelector('[data-ep-title]');
    const image = feature.querySelector('[data-ep-poster]');
    if (kicker) kicker.textContent = episodeLabel(newest) + ' · ' + formatDate(newest);
    if (heading) heading.textContent = title(newest);
    if (image) {
      if (image.getAttribute('src') !== newest.art) image.src = newest.art;
      image.alt = (english ? 'Episode artwork: ' : 'Portada del episodio: ') + title(newest);
    }
    for (const a of feature.querySelectorAll('[data-ep-link]')) {
      a.href = newest.url;
      a.setAttribute('aria-label', listenLabel(newest));
    }
  }
  const since = Math.floor((Date.UTC(...today.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v))) -
    Date.UTC(...newest.date.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v)))) / 86400000);
  const releaseNote = section.querySelector('.episode-release-note');
  if (releaseNote) releaseNote.textContent = since < 7
    ? (english ? 'NEW · EPISODE ' : 'NUEVO · EPISODIO ') + String(newest.number).padStart(2, '0') + (english ? ' AVAILABLE' : ' DISPONIBLE')
    : (english ? 'LATEST PUBLISHED EPISODE' : 'ÚLTIMO EPISODIO PUBLICADO');
  const shell = section.querySelector('.shell');
  if (!shell) return;
  const archive = document.createElement('section');
  archive.className = 'podcast-episode-archive';
  archive.id = 'archivo-episodios';
  archive.setAttribute('aria-labelledby', 'archive-title');
  const head = document.createElement('div');
  head.className = 'podcast-archive-heading';
  const intro = document.createElement('div');
  intro.append(
    span('p', 'eyebrow', english ? 'ALL THE CONVERSATIONS STAY HERE' : 'LAS CONVERSACIONES SE QUEDAN AQUÍ'),
    span('h3', 'podcast-archive-title', english ? 'Episode archive' : 'Archivo de episodios'),
    span('p', 'podcast-archive-description', english
      ? 'Listen whenever you want. New releases never replace older stories.'
      : 'Escucha cuando quieras. Cada estreno se suma sin reemplazar historias anteriores.')
  );
  intro.querySelector('h3').id = 'archive-title';
  const total = span('span', 'podcast-archive-count', published.length + (english ? ' published episodes' : ' episodios publicados'));
  head.append(intro, total);
  archive.append(head);
  const older = published.slice(1); // Solo se separa el destacado, NO se eliminan anteriores.
  if (older.length) {
    const searchBox = document.createElement('label');
    searchBox.className = 'podcast-archive-search';
    searchBox.append(span('span', '', english ? 'Find a previous episode' : 'Busca un episodio anterior'));
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = english ? 'Search by title or topic' : 'Busca por título o tema';
    input.setAttribute('aria-label', english ? 'Search published episodes' : 'Buscar episodios publicados');
    searchBox.append(input);
    archive.append(searchBox);
    const list = document.createElement('ol');
    list.className = 'podcast-archive-list';
    const rows = [];
    for (const episode of older) {
      const item = document.createElement('li');
      item.className = 'podcast-archive-item';
      const a = document.createElement('a');
      a.className = 'podcast-archive-link';
      a.href = episode.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', listenLabel(episode));
      const img = document.createElement('img');
      img.src = episode.art;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 112;
      img.height = 112;
      img.addEventListener('error', () => { img.src = 'assets/logo-podcast-04.svg'; }, {once:true});
      const copy = document.createElement('div');
      copy.className = 'podcast-archive-copy';
      copy.append(span('p', 'podcast-archive-meta', episodeLabel(episode) + ' · ' + formatDate(episode)),
        span('h4', 'podcast-archive-name', title(episode)),
        span('p', 'podcast-archive-summary', summary(episode)),
        span('span', 'podcast-archive-cta', english ? 'Listen on Spotify' : 'Escuchar en Spotify'));
      a.append(img, copy);
      item.append(a);
      list.append(item);
      rows.push({item, text: (title(episode) + ' ' + summary(episode) + ' ' + episode.number).toLocaleLowerCase()});
    }
    const empty = span('p', 'podcast-archive-empty', english ? 'No episodes match that search.' : 'No hay episodios con esa búsqueda.');
    empty.hidden = true;
    input.addEventListener('input', () => {
      const term = input.value.trim().toLocaleLowerCase();
      let count = 0;
      for (const row of rows) {
        row.item.hidden = term.length > 0 && !row.text.includes(term);
        if (!row.item.hidden) count++;
      }
      empty.hidden = count > 0;
    });
    archive.append(list, empty);
  }
  shell.append(archive);
  // Las dos tarjetas heredadas siguen como respaldo sin JavaScript. Con el archivo listo
  // se ocultan para evitar que el usuario vea los mismos capítulos dos veces.
  for (const card of section.querySelectorAll('[data-ep-previous],[data-ep-earlier]')) card.hidden = true;
  section.classList.add('has-episode-archive');
})();
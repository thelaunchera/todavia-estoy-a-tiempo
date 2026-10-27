/* Una sección de escucha, no una lista infinita.
   Añadir cada episodio publicado a este catálogo; la portada muestra automáticamente
   el más reciente y el anterior. Los demás se descubren en el enlace a Spotify.
   Nunca añadir borradores ni enlaces de la página general a este catálogo. */
(() => {
  'use strict';
  const episodes = [
    {
      number: 1,
      title: 'Tengo 30 y pensé que mi vida sería diferente',
      summary: 'Sobre las expectativas, las comparaciones y esa pregunta que a veces pesa: «¿Ya debería estar en otro lugar?»',
      url: 'https://open.spotify.com/episode/21aYHKY0kodWEzg1835xcD',
      art: 'assets/episodio-01-estudio-dailin.jpg',
      published: true
    },
    {
      number: 2,
      title: 'Estoy cansada de ser fuerte todo el tiempo',
      summary: 'El trabajo que queda fuera de un «tú siempre resuelves»: lo que pospones, lo que sigues recordando y lo que casi nadie pregunta después.',
      url: 'https://open.spotify.com/episode/6ICSx9E7BVlU8Qi8rFC0s3?si=pYWZUm-8TIuCsoRsY4zkdQ',
      art: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/bece4d27-8d21-4669-8baa-fcd83c65dd55.png',
      published: true
    }
  ];
  const spotifyEpisode = /^https:\/\/open\.spotify\.com\/episode\/[A-Za-z0-9]+(?:\?.*)?$/;
  const published = episodes.filter(e => e.published === true &&
    Number.isInteger(e.number) && spotifyEpisode.test(e.url))
    .sort((a, b) => b.number - a.number);
  if (!published.length) return;
  const latest = published[0];
  const previous = published[1];
  const section = document.getElementById('escuchar');
  if (!section) return;
  const text = (selector, value) => {
    const element = section.querySelector(selector);
    if (element) element.textContent = value;
  };
  text('[data-ep-kicker]', `EPISODIO ${String(latest.number).padStart(2, '0')} · YA DISPONIBLE`);
  text('[data-ep-title]', latest.title);
  text('[data-ep-art-title]', latest.title);
  text('[data-ep-art-number]', String(latest.number).padStart(2, '0'));
  text('[data-ep-summary]', latest.summary);
  const art = section.querySelector('[data-ep-poster]');
  const cover = section.querySelector('.episode-curated-art');
  if (art && cover) {
    if (latest.art && /^https:\/\//.test(latest.art)) {
      art.src = latest.art;
      art.alt = `Portada oficial del episodio ${latest.number}: ${latest.title}`;
      art.hidden = false;
      cover.classList.add('has-real-poster');
    } else {
      art.hidden = true;
      cover.classList.remove('has-real-poster');
    }
  }
  for (const link of section.querySelectorAll('[data-ep-link]')) {
    link.href = latest.url;
    link.setAttribute('aria-label', `Escuchar episodio ${latest.number}: ${latest.title} en Spotify (abre otra pestaña)`);
  }
  const previousCard = section.querySelector('[data-ep-previous]');
  if (previousCard) {
    if (!previous) {
      previousCard.hidden = true;
    } else {
      previousCard.hidden = false;
      text('[data-ep-previous-number]', `EPISODIO ${String(previous.number).padStart(2, '0')} · POR SI TE LO PERDISTE`);
      text('[data-ep-previous-title]', previous.title);
      text('[data-ep-previous-summary]', previous.summary);
      for (const previousLink of previousCard.querySelectorAll('a')) {
        previousLink.href = previous.url;
        previousLink.setAttribute('aria-label', `Escuchar episodio ${previous.number}: ${previous.title} en Spotify (abre otra pestaña)`);
      }
      const image = previousCard.querySelector('img');
      if (image && previous.art) {
        image.src = previous.art;
        image.alt = `Portada del episodio ${previous.number} de Todavía estoy a tiempo`;
      } else if (image) {
        image.src = 'assets/logo-podcast-04.svg';
        image.alt = 'Logo del podcast Todavía estoy a tiempo';
        image.hidden = false;
      }
    }
  }
})();

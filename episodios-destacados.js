/* Catálogo de los tres capítulos publicados más recientes.
   El más reciente va primero y cada episodio conserva su propia portada y enlace.
   Nunca añadir borradores ni enlaces de la página general a este catálogo. */
(() => {
  'use strict';
  const episodes = [
    {
      number: 1,
      title: 'Tengo 30 y pensé que mi vida sería diferente',
      titleEn: "I'm 30, and I thought my life would look different",
      summary: 'Sobre las expectativas, las comparaciones y esa pregunta que a veces pesa: «¿Ya debería estar en otro lugar?»',
      url: 'https://open.spotify.com/episode/21aYHKY0kodWEzg1835xcD',
      art: 'assets/episodio-01-estudio-dailin.jpg',
      published: true
    },
    {
      number: 2,
      title: 'Estoy cansada de ser fuerte todo el tiempo',
      titleEn: "I'm tired of being strong all the time",
      summary: 'El trabajo que queda fuera de un «tú siempre resuelves»: lo que pospones, lo que sigues recordando y lo que casi nadie pregunta después.',
      url: 'https://open.spotify.com/episode/6ICSx9E7BVlU8Qi8rFC0s3?si=pYWZUm-8TIuCsoRsY4zkdQ',
      art: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/bece4d27-8d21-4669-8baa-fcd83c65dd55.png',
      published: true
    },
    {
      number: 3,
      title: 'No quiero ser influencer para vender lo que hago',
      titleEn: "I don't want to be an influencer to sell what I do",
      summary: 'La presión de exponerse en redes cuando solo querías vender un producto o servicio; maneras reales de mostrar lo que haces sin actuar frente a una cámara.',
      summaryEn: 'The pressure to be visible online when all you wanted was to sell your work, and ways to show what you do without performing on camera.',
      url: 'https://open.spotify.com/episode/5NtsF2XPSEZ2pTzBBQtw3c',
      art: 'assets/episodio-03-portada.webp',
      published: true
    },
    {
      number: 4,
      title: 'Vamos a ordenar esa idea que tienes en la cabeza',
      titleEn: "Let's make sense of the idea in your head",
      summary: 'Una idea puede sentirse clarísima en tu cabeza y volverse un enredo al explicarla. Ordenamos lo que sabes, lo que supones y lo que necesitas comprobar con personas reales.',
      summaryEn: "An idea can feel perfectly clear in your head, yet difficult to explain. Let\'s separate what you know, what you\'re assuming, and what you still need to test with real people.",
      url: 'https://open.spotify.com/episode/6nfCQjlytWbagrYjTlugLi',
      art: 'https://image-cdn-ak.spotifycdn.com/image/ab67656300005f1f072aa562ec7dfa14451a2b5e',
      published: true
    }
  ];
  const spotifyEpisode = /^https:\/\/open\.spotify\.com\/episode\/[A-Za-z0-9]+(?:\?.*)?$/;
  const published = episodes.filter(e => e.published === true &&
    Number.isInteger(e.number) && spotifyEpisode.test(e.url))
    .sort((a, b) => b.number - a.number);
  if (!published.length) return;
  // Tres episodios destacados visibles (04, 03, 02); el resto permanece en el archivo.
  const visible = published.slice(0, 3);
  const latest = visible[0];
  const previous = visible[1];
  const earlier = visible[2];
  const section = document.getElementById('escuchar');
  if (!section) return;
  const english = document.documentElement.lang === 'en';
  const titleFor = episode => english ? (episode.titleEn || episode.title) : episode.title;
  const summaryFor = episode => english ? (episode.summaryEn || episode.summary) : episode.summary;
  const labelFor = number => (english ? 'EPISODE ' : 'EPISODIO ') + String(number).padStart(2, '0');
  const linkLabelFor = episode => english
    ? `Listen to episode ${episode.number}: ${titleFor(episode)} on Spotify (opens in a new tab)`
    : `Escuchar episodio ${episode.number}: ${episode.title} en Spotify (abre otra pestaña)`;
  const text = (selector, value) => {
    const element = section.querySelector(selector);
    if (element) element.textContent = value;
  };
  text('[data-ep-kicker]', labelFor(latest.number));
  text('[data-ep-title]', titleFor(latest));
  text('[data-ep-summary]', summaryFor(latest));
  const art = section.querySelector('[data-ep-poster]');
  const cover = section.querySelector('.episode-curated-art');
  const fallback = section.querySelector('[data-ep-fallback]');
  if (art && cover) {
    const hasImage = typeof latest.art === 'string' &&
      (/^https:\/\//.test(latest.art) || /^assets\//.test(latest.art));
    const showFallback = () => {
      art.hidden = true;
      if (fallback) {
        fallback.textContent = `Todavía estoy a tiempo · ${labelFor(latest.number)}`;
        fallback.hidden = false;
      }
      cover.classList.remove('has-real-poster');
    };
    if (hasImage) {
      // Do not reset src on every refresh: resetting produces a visible
      // old cover/background while a second request for the same photo starts.
      if (art.getAttribute('src') !== latest.art) art.setAttribute('src', latest.art);
      art.alt = english ? `Official artwork for episode ${latest.number}: ${titleFor(latest)}` : `Portada oficial del episodio ${latest.number}: ${latest.title}`;
      art.hidden = false;
      if (fallback) fallback.hidden = true;
      cover.classList.add('has-real-poster');
      art.addEventListener('error', showFallback, { once: true });
      if (art.complete && art.naturalWidth === 0) showFallback();
    } else showFallback();
  }
  for (const link of section.querySelectorAll('[data-ep-link]')) {
    link.href = latest.url;
    link.setAttribute('aria-label', linkLabelFor(latest));
  }
  const previousCard = section.querySelector('[data-ep-previous]');
  if (previousCard) {
    if (!previous) {
      previousCard.hidden = true;
    } else {
      previousCard.hidden = false;
      text('[data-ep-previous-number]', labelFor(previous.number));
      text('[data-ep-previous-title]', titleFor(previous));
      text('[data-ep-previous-summary]', summaryFor(previous));
      for (const previousLink of previousCard.querySelectorAll('a')) {
        previousLink.href = previous.url;
        previousLink.setAttribute('aria-label', linkLabelFor(previous));
      }
      const image = previousCard.querySelector('img');
      if (image && previous.art) {
        image.src = previous.art;
        image.alt = english ? `Artwork for episode ${previous.number} of Todavía estoy a tiempo` : `Portada del episodio ${previous.number} de Todavía estoy a tiempo`;
      } else if (image) {
        image.src = 'assets/logo-podcast-04.svg';
        image.alt = 'Logo del podcast Todavía estoy a tiempo';
        image.hidden = false;
      }
    }
  }
  const earlierCard = section.querySelector('[data-ep-earlier]');
  if (earlierCard) {
    if (!earlier) {
      earlierCard.hidden = true;
    } else {
      earlierCard.hidden = false;
      const earlierNumber = earlierCard.querySelector('[data-ep-earlier-number]');
      const earlierTitle = earlierCard.querySelector('[data-ep-earlier-title]');
      if (earlierNumber) earlierNumber.textContent = labelFor(earlier.number);
      if (earlierTitle) earlierTitle.textContent = titleFor(earlier);
      for (const link of earlierCard.querySelectorAll('a')) {
        link.href = earlier.url;
        link.setAttribute('aria-label', linkLabelFor(earlier));
      }
      const earlierImage = earlierCard.querySelector('img');
      if (earlierImage && earlier.art) {
        earlierImage.src = earlier.art;
        earlierImage.alt = english
          ? `Artwork for episode ${earlier.number} of Todavía estoy a tiempo`
          : `Portada del episodio ${earlier.number} de Todavía estoy a tiempo`;
      }
    }
  }
})();

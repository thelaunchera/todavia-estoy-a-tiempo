/* Archivo editorial público. Añadir capítulos SOLO cuando estén publicados con enlace individual de Spotify y foto propia.
   Nunca borrar entradas antiguas por rotación semanal. Los borradores viven únicamente en Studio. */
window.PODCAST_EPISODES = Object.freeze([
  {
    number: 1, published: true, date: '2026-10-20',
    title: 'Tengo 30 y pensé que mi vida sería diferente',
    titleEn: "I'm 30, and I thought my life would look different",
    summary: 'Cuando comparas lo que imaginabas con la vida que tienes hoy, todavía hay espacio para empezar.',
    summaryEn: "When the life you imagined doesn't look like the one you're living, there's still room to begin.",
    url: 'https://open.spotify.com/episode/21aYHKY0kodWEzg1835xcD',
    art: 'assets/episodio-01-estudio-dailin.jpg',
    popupImage: 'assets/episodio-01-estudio-dailin.jpg',
    popupHeadline: '¿Y si la vida que imaginaste a los 30 no era la única posible?',
    popupHeadlineEn: "What if the life you imagined by 30 wasn't the only possible one?",
    popupMessage: 'Hablamos de expectativas, comparaciones y de recordar que tu historia no llega tarde.',
    popupMessageEn: "A conversation about expectations, comparisons, and remembering that your story isn't late."
  },
  {
    number: 2, published: true, date: '2026-10-27',
    title: 'Estoy cansada de ser fuerte todo el tiempo',
    titleEn: "I'm tired of always having to be strong",
    summary: 'El cansancio que queda detrás de ser la persona que siempre resuelve, incluso cuando necesita descansar.',
    summaryEn: 'The exhaustion that comes with being the one who always holds everything together.',
    url: 'https://open.spotify.com/episode/6ICSx9E7BVlU8Qi8rFC0s3',
    art: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/bece4d27-8d21-4669-8baa-fcd83c65dd55.png',
    popupImage: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/bece4d27-8d21-4669-8baa-fcd83c65dd55.png',
    popupHeadline: '¿Quién te pregunta cómo estás cuando eres la que siempre puede con todo?',
    popupHeadlineEn: "Who checks on you when you're always the strong one?",
    popupMessage: 'Este capítulo es para las personas que también necesitan que alguien las sostenga.',
    popupMessageEn: 'For everyone who carries so much and sometimes needs someone to hold them, too.'
  },
  {
    number: 3, published: true, date: '2026-11-03',
    title: 'No quiero ser influencer para vender lo que hago',
    titleEn: "I don't want to be an influencer to sell what I do",
    summary: 'La presión de mostrar tu vida entera cuando lo que quieres es compartir tu trabajo.',
    summaryEn: 'The pressure to put your whole life online when all you want is to share your work.',
    url: 'https://open.spotify.com/episode/5NtsF2XPSEZ2pTzBBQtw3c',
    art: 'assets/episodio-03-portada.webp',
    popupImage: 'assets/episodio-03-portada.webp',
    popupHeadline: '¿Tengo que convertirme en influencer para que la gente vea lo que hago?',
    popupHeadlineEn: 'Do I have to become an influencer just to share my work?',
    popupMessage: 'Si emprender empezó como un sueño tuyo, pero ahora sientes que debes grabar cada momento, esta conversación es para ti.',
    popupMessageEn: 'If you started something of your own but now feel pressured to film every moment, this conversation is for you.'
  },
  {
    number: 4, published: true, date: '2026-11-10',
    title: 'Vamos a ordenar esa idea que tienes en la cabeza',
    titleEn: "Let's make sense of the idea in your head",
    summary: 'Una idea puede sentirse clarísima en tu cabeza y volverse un enredo al explicarla. Ordenamos lo que sabes, lo que supones y lo que necesitas comprobar con personas reales.',
    summaryEn: "An idea can feel perfectly clear in your head, yet difficult to explain. Let\'s separate what you know, what you\'re assuming, and what you still need to test with real people.",
    url: 'https://open.spotify.com/episode/6nfCQjlytWbagrYjTlugLi',
    art: 'https://image-cdn-ak.spotifycdn.com/image/ab67656300005f1f072aa562ec7dfa14451a2b5e',
    popupImage: 'https://image-cdn-ak.spotifycdn.com/image/ab67656300005f1f072aa562ec7dfa14451a2b5e',
    popupHeadline: '¿Y si tu idea solo necesita una forma más clara de explicarse?',
    popupHeadlineEn: 'What if your idea just needs a clearer way to explain it?',
    popupMessage: 'Un capítulo para ordenar lo que sabes, reconocer lo que supones y dar un primer paso real.',
    popupMessageEn: 'A conversation about what you know, what you assume, and how to take one real first step.'
  }
].map(episode => Object.freeze(episode)));

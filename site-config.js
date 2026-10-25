// Public configuration only. Never add API keys, Stripe secrets or Make tokens.
// Stripe Payment Links and Make's paid-only PDF delivery workflow are configured.
// The first real purchase should be monitored to confirm inbox delivery.
window.PODCAST_CONFIG = {
  commerceEnabled: true,
  stripePaymentLinks: {
    noVoyTarde: 'https://buy.stripe.com/dRm3cu32Le5Pc4x5Z293y0V',
    empezarDeNuevo: 'https://buy.stripe.com/28E3cu7j16Dn7Oh87a93y0W'
  },
  freeGuideEndpoint: 'https://hook.us2.make.com/3ljucvj2nbpdff279rxmo5ys70f1ppf3',
  newsletterEndpoint: 'https://hook.us2.make.com/7yyoehld3g2sh2afq1l6bcw24ct65niw',
  unsubscribeEndpoint: 'https://hook.us2.make.com/5sgoykwaxvn52xmv817h8dgro7yxtm2h',
  helpEndpoint: 'https://hook.us2.make.com/l2yj2ral7cmqgpbgv342zlcm74wlhrjt',
  freeGuideUrl: 'https://drive.google.com/file/d/1FAJd-pAgQUynFLAeB5wdnsf1Broi5SDo/view?usp=drivesdk',
  podcastUrl: 'https://open.spotify.com/show/4f22tdJv8nMdTSMKc1kvIh',
  // Canción oficial del podcast: MP3 alojado en CDN para reproducción web; sin inicio automático.
  themeSongUrl: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/6245b40c-583e-42f0-bc44-e1ebfd096c2c.mp3',
  themeSongStartSeconds: 5,
  // Clave pública (no secreta) del proyecto dedicado exclusivamente al podcast.
  themeSongAnalytics: {
    endpoint: 'https://fhrvuhikrybobidxpvnh.supabase.co/rest/v1/podcast_audio_events',
    publishableKey: 'sb_publishable_Uj2dcLjktTPVb-IcAD5RSA_6J0AAfM-'
  },

  productPhotos: [
    { file: 'assets/productos/editorial/guia.webp', alt: '5 preguntas para cuando sientes que vas tarde' },
    { file: 'assets/productos/editorial/diario.webp', alt: 'No voy tarde: un diario para volver a mí' },
    { file: 'assets/productos/editorial/workbook.webp', alt: 'Empezar de nuevo: sin tener todo resuelto' }
  ]
};

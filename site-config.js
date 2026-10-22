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
  helpEndpoint: 'https://hook.us2.make.com/l2yj2ral7cmqgpbgv342zlcm74wlhrjt',
  freeGuideUrl: 'https://drive.google.com/file/d/1FAJd-pAgQUynFLAeB5wdnsf1Broi5SDo/view?usp=drivesdk',
  podcastUrl: 'https://open.spotify.com/show/4f22tdJv8nMdTSMKc1kvIh',
  productPhotos: [
    { file: 'assets/productos/editorial/guia.webp', alt: '5 preguntas para cuando sientes que vas tarde' },
    { file: 'assets/productos/editorial/diario.webp', alt: 'No voy tarde: un diario para volver a mí' },
    { file: 'assets/productos/editorial/workbook.webp', alt: 'Empezar de nuevo: sin tener todo resuelto' }
  ]
};

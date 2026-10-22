// Public configuration only. Never add API keys or Stripe secrets here.
// Paid sales remain disabled until checkout-to-delivery QA is complete.
window.PODCAST_CONFIG = {
  commerceEnabled: false,
  stripePaymentLinks: {
    noVoyTarde: 'https://buy.stripe.com/dRm3cu32Le5Pc4x5Z293y0V',
    empezarDeNuevo: 'https://buy.stripe.com/28E3cu7j16Dn7Oh87a93y0W'
  },
  freeGuideEndpoint: 'https://hook.us2.make.com/3ljucvj2nbpdff279rxmo5ys70f1ppf3',
  freeGuideUrl: '',
  podcastUrl: '',
  productPhotos: [
    { file: 'assets/productos/editorial/guia.webp', alt: '5 preguntas para cuando sientes que vas tarde' },
    { file: 'assets/productos/editorial/diario.webp', alt: 'No voy tarde: un diario para volver a mí' },
    { file: 'assets/productos/editorial/workbook.webp', alt: 'Empezar de nuevo: sin tener todo resuelto' }
  ]
};

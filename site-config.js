// Public configuration only. Never add API keys, Stripe secrets or Make tokens.
// Keep commerce disabled until payment confirmation and delivery pass end-to-end QA.
window.PODCAST_CONFIG = {
  commerceEnabled: false,
  stripePaymentLinks: { noVoyTarde: '', empezarDeNuevo: '' },
  freeGuideUrl: '',
  podcastUrl: '',
  productPhotos: [
    { file: 'assets/productos/editorial/guia.webp', alt: '5 preguntas para cuando sientes que vas tarde' },
    { file: 'assets/productos/editorial/diario.webp', alt: 'No voy tarde: un diario para volver a mí' },
    { file: 'assets/productos/editorial/workbook.webp', alt: 'Empezar de nuevo: sin tener todo resuelto' }
  ]
};

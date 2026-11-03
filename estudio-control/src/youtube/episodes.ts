import ep01 from './scripts/01-the-viral-emergency.md?raw';
import ep02 from './scripts/02-the-client-said-beige.md?raw';
import ep03 from './scripts/03-influencer-for-a-day.md?raw';
import ep04 from './scripts/04-the-ai-intern.md?raw';
import ep05 from './scripts/05-one-product-100-photos.md?raw';
import ep06 from './scripts/06-the-competitor.md?raw';
import ep07 from './scripts/07-the-biggest-pitch.md?raw';
import ep08 from './scripts/08-we-almost-quit.md?raw';

export const youtubeEpisodes = [
  { number: 1, title: 'The Viral Emergency', slug: 'the-viral-emergency', logline: 'Su primer encargo de café acaba con la cámara en el suelo y un inesperado hallazgo.', conflict: 'Primer cliente, presupuesto mínimo y creatividad bajo presión.', hook: 'La cámara caída mirando hacia Nia y Ruby.', script: ep01 },
  { number: 2, title: 'The Client Said Beige', slug: 'the-client-said-beige', logline: 'Un encargo de velas obliga a Ruby a aprender a escuchar y a Nia a defender una idea.', conflict: 'Libertad creativa frente a identidad de marca y alcance contratado.', hook: 'Veintitrés tonos de beige.', script: ep02 },
  { number: 3, title: 'Influencer for a Day', slug: 'influencer-for-a-day', logline: 'Las amigas producen una mañana perfecta que se desmorona antes del desayuno.', conflict: 'Autenticidad frente a imagen aspiracional.', hook: 'Un desayuno perfecto interrumpido por una alarma.', script: ep03 },
  { number: 4, title: 'The AI Intern', slug: 'the-ai-intern', logline: 'Un asistente ficticio quiere optimizarlo todo, incluso el almuerzo.', conflict: 'Automatización útil frente a criterio humano.', hook: 'Un asistente mueve la hora de comer al miércoles.', script: ep04 },
  { number: 5, title: 'One Product, 100 Photos', slug: 'one-product-100-photos', logline: 'Un producto y cien fotos desatan una guerra de utilería hasta que aclaran el brief.', conflict: 'Volumen, originalidad y expectativas de producción.', hook: 'Foto número 97 de la misma botella.', script: ep05 },
  { number: 6, title: 'The Competitor', slug: 'the-competitor', logline: 'Una agencia rival muestra un concepto demasiado parecido al suyo.', conflict: 'Originalidad, confianza y manejar conflictos profesionalmente.', hook: 'Un anuncio sospechosamente familiar.', script: ep06 },
  { number: 7, title: 'The Biggest Pitch', slug: 'the-biggest-pitch', logline: 'Su oportunidad más grande abre una grieta entre seguridad y creatividad.', conflict: 'Crecer sin perder identidad.', hook: 'Un post-it que dice DO NOT PANIC pegado en el techo.', script: ep07 },
  { number: 8, title: 'We Almost Quit', slug: 'we-almost-quit', logline: 'Una pausa presupuestaria hace que Nia y Ruby reconsideren el futuro del estudio.', conflict: 'Dinero, amistad y el tipo de agencia que desean construir.', hook: 'La pared de ideas completamente vacía.', script: ep08 },
] as const;

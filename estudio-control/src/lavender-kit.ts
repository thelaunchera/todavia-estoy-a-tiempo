import type {FinishedDemoPhoto} from './finished-demo-resources';
import type {DemoRebuildPrompt} from './demo-rebuild-prompts';

/** The Lavender Edit is a fictional brand showcase, not real merchandise.
 * Source images are the 8 original individual PNGs in Drive. The prompts
 * below describe reconstruction, not the exact original generation history. */
export const lavenderDrive = 'https://drive.google.com/drive/folders/1qD7EmHCyKEs-aHUFlloKP9-nDuv1q7Ug';
export const lavenderOriginalPrompts = 'https://drive.google.com/file/d/1YoVsthcjmxEamdB7CKah75eHzsnpWL4g/view';
export const lavenderPhotos: FinishedDemoPhoto[] = [
  {
    key: "lavender-01",
    title: "Hero lavanda",
    placement: "Portada principal",
    url: "https://thelaunchera.com/demos/lavender-edit/photos/01_Soft_Lavender_Hero.png",
    prompt: "Prompt de recreación editorial (no transcripción original): Editorial luxury lavender fragrance photographed on a pale reflective stone pedestal; quiet natural window light, subtle lavender stems and a violet glass vessel, one photographic frame with breathing room. ONE separate image only, highest resolution, photorealistic premium campaign, pale lavender, ivory and plum. Do not generate a collage, fake label, invented product claims, watermark or unrelated branding. If the real product reference is available, retain the exact packaging; otherwise label this clearly as fictional concept art."
  },
  {
    key: "lavender-02",
    title: "Texturas de lavanda",
    placement: "Atmósfera y materia",
    url: "https://thelaunchera.com/demos/lavender-edit/photos/02_Lavender_Mood_Macro.png",
    prompt: "Prompt de recreación editorial (no transcripción original): Close macro study of translucent lavender-tinted serum and glass; controlled reflections, delicate surface tension, dreamy yet believable texture. ONE separate image only, highest resolution, photorealistic premium campaign, pale lavender, ivory and plum. Do not generate a collage, fake label, invented product claims, watermark or unrelated branding. If the real product reference is available, retain the exact packaging; otherwise label this clearly as fictional concept art."
  },
  {
    key: "lavender-03",
    title: "Ritual botánico",
    placement: "Nuestra historia",
    url: "https://thelaunchera.com/demos/lavender-edit/photos/03_Lavender_Ritual.png",
    prompt: "Prompt de recreación editorial (no transcripción original): Violet-toned fragrance bottle on cool natural stone with a few restrained lavender stems, soft long shadows, premium tactile photography. ONE separate image only, highest resolution, photorealistic premium campaign, pale lavender, ivory and plum. Do not generate a collage, fake label, invented product claims, watermark or unrelated branding. If the real product reference is available, retain the exact packaging; otherwise label this clearly as fictional concept art."
  },
  {
    key: "lavender-04",
    title: "Textura de crema",
    placement: "Ritual de cuidado",
    url: "https://thelaunchera.com/demos/lavender-edit/photos/04_Cream_Texture.png",
    prompt: "Prompt de recreación editorial (no transcripción original): Close-up skincare cream in an open violet jar with natural folds and microtextures, clean ivory backdrop and soft natural light; no false ingredients or medical claims. ONE separate image only, highest resolution, photorealistic premium campaign, pale lavender, ivory and plum. Do not generate a collage, fake label, invented product claims, watermark or unrelated branding. If the real product reference is available, retain the exact packaging; otherwise label this clearly as fictional concept art."
  },
  {
    key: "lavender-05",
    title: "Regalo lavanda",
    placement: "Gifting",
    url: "https://thelaunchera.com/demos/lavender-edit/photos/05_Lavender_Gifting.png",
    prompt: "Prompt de recreación editorial (no transcripción original): A single lavender beauty product beside a gently wrapped gift with satin ribbon, refined December campaign, crisp product identity and natural fabric folds. ONE separate image only, highest resolution, photorealistic premium campaign, pale lavender, ivory and plum. Do not generate a collage, fake label, invented product claims, watermark or unrelated branding. If the real product reference is available, retain the exact packaging; otherwise label this clearly as fictional concept art."
  },
  {
    key: "lavender-06",
    title: "Campaña editorial",
    placement: "Galería · portada tipográfica",
    url: "https://thelaunchera.com/demos/lavender-edit/photos/06_Editorial_Type.png",
    prompt: "Prompt de recreación editorial (no transcripción original): Luxury editorial art direction with lilac perfume photography and monumental lavender typography; if rebuilding the photo, add typography manually in the layout, do not rely on AI text. ONE separate image only, highest resolution, photorealistic premium campaign, pale lavender, ivory and plum. Do not generate a collage, fake label, invented product claims, watermark or unrelated branding. If the real product reference is available, retain the exact packaging; otherwise label this clearly as fictional concept art."
  },
  {
    key: "lavender-07",
    title: "Daily Ritual",
    placement: "Galería · autocuidado",
    url: "https://thelaunchera.com/demos/lavender-edit/photos/07_Daily_Ritual.png",
    prompt: "Prompt de recreación editorial (no transcripción original): Violet cream jar with an understated silver lid, natural linen fabric and botanical daylight, real product reflections and quiet editorial styling. ONE separate image only, highest resolution, photorealistic premium campaign, pale lavender, ivory and plum. Do not generate a collage, fake label, invented product claims, watermark or unrelated branding. If the real product reference is available, retain the exact packaging; otherwise label this clearly as fictional concept art."
  },
  {
    key: "lavender-08",
    title: "After Hours",
    placement: "Galería · noche",
    url: "https://thelaunchera.com/demos/lavender-edit/photos/08_After_Hours.png",
    prompt: "Prompt de recreación editorial (no transcripción original): Violet fragrance bottle amid delicate botanical shadows, dim evening light, editorial perfume campaign with realistic glass and depth. ONE separate image only, highest resolution, photorealistic premium campaign, pale lavender, ivory and plum. Do not generate a collage, fake label, invented product claims, watermark or unrelated branding. If the real product reference is available, retain the exact packaging; otherwise label this clearly as fictional concept art."
  }
];

export const lavenderRebuildPrompts: DemoRebuildPrompt[] = [
  {
    title: "01 · Identidad y estructura",
    step: "Preparación",
    prompt: "Construye una landing editorial ficticia llamada The Lavender Edit para The Launch Era. Idioma inglés inicial y selector español/inglés. Paleta marfil #FAF7F6, lavanda suave #E9DDEC, ciruela #3E2B43. Titulares Italiana, cuerpo DM Sans. Secciones: hero, textura, ritual, historia, gifting, galería y footer. No es una tienda real: no añadir precios, checkout, reseñas ni promesas de producto.",
    say: "Primero construimos una identidad tranquila y una estructura reconocible. Es un concepto creativo, no una marca de cosmética a la venta.",
    show: "Enseñar portada vacía, tipografías, paleta y navegación móvil."
  },
  {
    title: "02 · Hero protagonista",
    step: "Hero",
    prompt: "Usa la foto individual exacta https://thelaunchera.com/demos/lavender-edit/photos/01_Soft_Lavender_Hero.png como protagonista del hero y conserva su encuadre original, sin generar collages. Titular editorial “A softer state of mind.”, espacio generoso y CTA de exploración interno #ritual. En 375px la foto debe verse completa como una escena independiente y el texto no debe solaparse.",
    say: "El hero tiene una sola imagen protagonista. Dejamos que la fotografía trabaje y el texto respire.",
    show: "Mostrar hero en escritorio y teléfono; evitar recortar producto."
  },
  {
    title: "03 · Textura y ritual",
    step: "Contenido",
    prompt: "Coloca únicamente dos imágenes distintas: https://thelaunchera.com/demos/lavender-edit/photos/02_Lavender_Mood_Macro.png y https://thelaunchera.com/demos/lavender-edit/photos/04_Cream_Texture.png. Construye una sección de sensaciones visuales, sin afirmar ingredientes, resultados clínicos ni propiedades certificadas. Luego crea historia editorial con https://thelaunchera.com/demos/lavender-edit/photos/03_Lavender_Ritual.png.",
    say: "Las texturas sirven para transmitir una atmósfera. Evitamos inventar beneficios o ingredientes.",
    show: "Mostrar alternancia fotografía y texto, sin repetir imágenes."
  },
  {
    title: "04 · Gifting y campaña",
    step: "Gifting",
    prompt: "Añade https://thelaunchera.com/demos/lavender-edit/photos/05_Lavender_Gifting.png para un bloque visual de regalo conceptual. CTA dirige a #gallery, no a un checkout. No añadir descuentos, precios o packs a la venta.",
    say: "La sección de regalos es visual; la interacción sirve para explorar la campaña.",
    show: "Revisar que el CTA navegue a la galería en móvil."
  },
  {
    title: "05 · Editorial de 3 imágenes",
    step: "Galería",
    prompt: "Usa exactamente estas tres fotografías individuales, una por tarjeta sin duplicarlas: https://thelaunchera.com/demos/lavender-edit/photos/06_Editorial_Type.png, https://thelaunchera.com/demos/lavender-edit/photos/07_Daily_Ritual.png, https://thelaunchera.com/demos/lavender-edit/photos/08_After_Hours.png. Mantén una composición editorial escalonada en escritorio y una grilla legible en teléfono.",
    say: "Aquí demostramos variedad de una sola dirección visual, siempre con fotos individuales.",
    show: "Mostrar los 3 looks en desktop y móvil."
  },
  {
    title: "06 · QA, archivos y enlaces",
    step: "Verificación",
    prompt: "Prueba los ocho assets de https://thelaunchera.com/demos/lavender-edit/photos/, enlaces de navegación y el selector EN/ES. Comprueba 375, 768, 1024 y 1440 px; evita scroll lateral, texto cortado, CTA inaccesibles o imágenes duplicadas. Conserva la procedencia: Drive https://drive.google.com/drive/folders/1qD7EmHCyKEs-aHUFlloKP9-nDuv1q7Ug y código https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/lavender-edit. Footer Powered by The Launch Era.",
    say: "Un demo se entrega con fotos, prompts, código y enlace. No damos por listo nada hasta verlo en el teléfono.",
    show: "Abrir la versión publicada, alternar idiomas y comprobar cada foto."
  }
];

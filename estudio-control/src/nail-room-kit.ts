import type {FinishedDemoPhoto} from './finished-demo-resources';
import type {DemoRebuildPrompt} from './demo-rebuild-prompts';
/** Canonical Nail Room demo: one registered project, no duplicate Drive files. 
 * These prompts are reconstruction guidance, NOT the original generation prompts. */
export const nailRoomDrive='https://drive.google.com/drive/folders/1vmZsTReawL7aEma7WNSRl9WFYOmmiWlN';
export const nailRoomSite='https://thelaunchera.github.io/demo-booking-landing-/nail-room/';
export const nailRoomRepo='https://github.com/thelaunchera/demo-booking-landing-/tree/main/demos/nail-room';
export const nailRoomPhotos:FinishedDemoPhoto[]=[
  {
    "key": "nail-room-hero",
    "title": "Pink Ombré — portada aprobada",
    "placement": "Hero del website",
    "url": "https://thelaunchera.github.io/demo-booking-landing-/nail-room/media/pink-ombre-hero.png",
    "prompt": "Prompt orientativo, no original. UNA foto individual, sin collage. Two hands with realistic five-finger anatomy, pink almond-shaped gradient polish, natural lengths, pink silk and soft editorial light. Avoid overlong fingers, duplicated digits and distorted joints."
  },
  {
    "key": "nail-room-french",
    "title": "French Glow — clásico marfil",
    "placement": "Galería · francés",
    "url": "https://thelaunchera.github.io/demo-booking-landing-/nail-room/media/french-ivory.png",
    "prompt": "Prompt orientativo, no original. UNA foto individual, sin collage. Natural hand with believable anatomy and short to medium French tips on ivory background, elegant understated light and realistic skin."
  },
  {
    "key": "nail-room-chrome",
    "title": "Pink Petal — chrome floral",
    "placement": "Galería · rosa chrome",
    "url": "https://thelaunchera.github.io/demo-booking-landing-/nail-room/media/pink-floral-chrome.png",
    "prompt": "Prompt orientativo, no original. UNA foto individual, sin collage. Close-up of properly proportioned hands holding a delicate flower, subtle pink chrome nails, natural fingernails and photographic studio light."
  },
  {
    "key": "nail-room-art",
    "title": "The Art Set — geometría",
    "placement": "Galería · nail art",
    "url": "https://thelaunchera.github.io/demo-booking-landing-/nail-room/media/terracotta-art.png",
    "prompt": "Prompt orientativo, no original. UNA foto individual, sin collage. Editorial medium-length natural nails with minimal terracotta geometric accents, authentic believable five-finger hands, fine manicure detail."
  },
  {
    "key": "nail-room-service",
    "title": "The Nail Date — trabajo del estudio",
    "placement": "Galería · sesión",
    "url": "https://thelaunchera.github.io/demo-booking-landing-/nail-room/media/studio-service.png",
    "prompt": "Prompt orientativo, no original. UNA foto individual, sin collage. Professional nail technician providing a delicate manicure to a client, realistic number of fingers, hands with credible proportions, salon daylight."
  },
  {
    "key": "nail-room-editorial",
    "title": "Nail Room — beauty portrait",
    "placement": "Sección de marca",
    "url": "https://thelaunchera.github.io/demo-booking-landing-/nail-room/media/pink-editorial-model.png",
    "prompt": "Prompt orientativo, no original. UNA foto individual, sin collage. Premium editorial beauty portrait with natural facial proportions, beauty studio background and polished pink aesthetic."
  }
];
export const nailRoomRebuildPrompts:DemoRebuildPrompt[]=[
  {
    "title": "01 · Recuperar y aprobar la fotografía",
    "step": "Drive + GitHub",
    "prompt": "Abre la carpeta única '06 — Belleza y uñas' en Drive y el repositorio oficial demo-booking-landing-/demos/nail-room. Reutiliza las seis imágenes ya publicadas. No usar las fotografías Nails_Burgundy_Gold_Closeup_Flowers ni Nails_Emerald_Green_Luxury_Flatlay; la hero aprobada es Beauty_Pink_Ombre_Nails. No regeneres ni dupliques fotos.",
    "say": "Primero compruebo las fotos y elimino de la selección las dos rechazadas. La portada aprobada es rosa ombré.",
    "show": "Drive 06 — Belleza y uñas, imágenes de la carpeta media/ y demo publicado."
  },
  {
    "title": "02 · Brand Board",
    "step": "Identidad",
    "prompt": "Diseña la identidad de NAIL ROOM usando rosa editorial #EC5794, pink pale #FFF0F6, ivory #FFF8FA y ink #332331, títulos Playfair Display y cuerpo DM Sans. Hero primero en iPhone, tarjetas glass translúcidas y precios en etiquetas femeninas. Reutiliza el Brand Board existente y añade esta marca sin crear otro sistema.",
    "say": "Ahora establezco una sola dirección visual y vuelvo al hero.",
    "show": "Brand Board NAIL ROOM y hero de su demo."
  },
  {
    "title": "03 · Website + servicios",
    "step": "Construcción",
    "prompt": "Usa el demo oficial como referencia: sección de cuatro servicios desde $48, $58, $74, $82; galería de cuatro looks, banner interactivo de Pink Ombré/French Glow/Pink Chrome y botones accesibles para seleccionar servicios. El formulario es solo muestra; no inventes reservas ni pagos reales.",
    "say": "El precio se entiende al primer vistazo y cada servicio tiene su propio botón.",
    "show": "Servicios, tarjetas de precios y banner que cambia de imagen."
  },
  {
    "title": "04 · Galería con Motion",
    "step": "Interacción",
    "prompt": "Añade fotografías independientes con apertura en pantalla grande, flechas anterior/siguiente, deslizamiento táctil y favoritos. Inspírate en Motion Studio: Image Zoom & Peek, Hover Image Zoom, scroll reveal suave, con prefers-reduced-motion. No usar emojis verdes ni animaciones que desplacen el contenido.",
    "say": "La fotografía tiene que poder verse completa sin perder calidad ni estirar las manos.",
    "show": "Galería, modal de imagen, favoritos y efecto al tocar."
  },
  {
    "title": "05 · Cita de demostración",
    "step": "UX de reservas",
    "prompt": "Mantén las fechas en una fila horizontal que se desplaza dentro de la tarjeta sin ensanchar el website. Elige servicio, fecha, hora y datos de muestra; resume la solicitud sin envíos de email, reservas reales ni cargos. Verifica iPhone 375px y 390px, tablet 768px y desktop.",
    "say": "Una reserva de ejemplo debe sentirse completa, sin fingir que se ha reservado.",
    "show": "Formulario de Nail Room en iPhone y desktop."
  },
  {
    "title": "06 · Publicación y visibilidad",
    "step": "Studio y Aula",
    "prompt": "Abre el GitHub Pages oficial de Nail Room y comprueba que la actualización está publicada. Regístralo en Studio > Demos terminados. Utiliza los controles existentes 'Mostrar/Ocultar de Websites' y 'Agregar/Quitar del Aula' por separado; NO publiques al Aula automáticamente.",
    "say": "El demo queda en nuestra biblioteca privada primero; los controles deciden dónde aparece.",
    "show": "Demo oficial, entrada en Studio, Brand Board y controles independientes para Websites y Aula."
  }
];

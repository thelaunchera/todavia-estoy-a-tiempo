import type {DemoRebuildPrompt} from './demo-rebuild-prompts';

/* Guía privada para reconstruir AFTR. Solo demo ficticio, sin conexiones comerciales. */
export const aftrRebuildPrompts: DemoRebuildPrompt[] = [
  {
    "step": "Preparación",
    "title": "00 · Identidad Chrome Afterglow",
    "say": "AFTR. no es una discoteca genérica. La marca busca lujo nocturno, energía y una experiencia inmersiva. Primero defino el ambiente y el público; después empiezo la web.",
    "show": "Mostrar el moodboard Chrome Afterglow, la jerarquía cromática y los dos estilos de tipografía.",
    "prompt": "Crea una web demo FICTICIA para AFTR. Las Vegas, concepto ELECTRIC AFTER DARK / CHROME AFTERGLOW. Público adulto 21+, estética luxury nightlife: fondo dominante #0B0911, Electric Violet #9A6AFF, Hot Magenta #FF3F9D, Chrome Silver #C6C9D4 y Acid Lime #D9FF52 solo como acento diminuto. Titulares monumentales sans condensada + contrapunto serif editorial, superficies reflejantes y fotografía cinematográfica. TODO el texto visible en inglés de EE. UU. No copies club ni identidad ajena. Demo únicamente; sin ventas, reservas reales, formularios conectados ni cobros. Mantén identidad estable en todas las secciones y un aviso visible de concepto ficticio."
  },
  {
    "step": "Fotografía",
    "title": "01 · Ocho fotografías individuales",
    "say": "La fotografía sostiene la sensación de entrar al club. Para que todas las secciones se vean de la misma marca, apruebo primero el hero y creo cada imagen por separado.",
    "show": "Abrir los archivos originales hero.webp, vip-lounge.webp, entry.webp, model.webp, dj.webp, bottle-service.webp, dancefloor.webp y tickets.webp en el repositorio oficial.",
    "prompt": "Usa las ocho fotos ORIGINALES YA APROBADAS que están en public/demos/aftr/assets/ y conserva estos nombres: hero.webp, vip-lounge.webp, entry.webp, model.webp, dj.webp, bottle-service.webp, dancefloor.webp, tickets.webp. No las regeneres ni sustituyas si existen. En una reconstrucción desde cero genera UNA foto por comando, en UN archivo individual, sin collage, texto ni mockup. Hero horizontal 16:9, tarjetas 4:3 y retratos 4:5. Mantén iluminación chrome/violet/magenta uniforme.",
    "photoCommands": [
      {
        "title": "01 · Hero · main club",
        "prompt": "UNA sola fotografía horizontal 16:9 de un nightclub ficticio de lujo AFTR. Las Vegas, arquitectura cromada, anillos de luz sobre DJ booth, pista llena de adultos 21+, hazes violetas, contraste negro/plata, composición panorámica cinematográfica. Sin letreros ni tipografía; no collage."
      },
      {
        "title": "02 · VIP lounge",
        "prompt": "UNA fotografía horizontal 4:3 de un lounge VIP ficticio AFTR.: sofás negros, vidrio ahumado, mesas de cromo y pista al fondo con iluminación violeta, escena editorial de hospitality. Sin logos ni texto; no collage."
      },
      {
        "title": "03 · Entrance corridor",
        "prompt": "UNA fotografía vertical 4:5 del corredor de entrada AFTR., espejos cromados, suelo negro reflectante y una sola invitada adulta caminando hacia la pista, luces arquitectónicas violetas. Sin texto ni collage."
      },
      {
        "title": "04 · Fashion portrait",
        "prompt": "UNA fotografía vertical 4:5, campaña editorial de nightlife: modelo adulta con lentes cromados futuristas y pendientes sofisticados, rim light violeta y magenta, fondo de club desenfocado. Sin texto ni collage."
      },
      {
        "title": "05 · DJ booth",
        "prompt": "UNA fotografía horizontal 4:3 de DJ adulto en cabina circular cromada, luces blancas/violetas, haze y crowd elegante en segundo plano, fotografía de evento premium. Sin texto ni collage."
      },
      {
        "title": "06 · VIP bottle service",
        "prompt": "UNA fotografía vertical 4:5, champagne en cubeta cromada y cristalería sobre mesa oscura reflectante, luces violetas, club difuso al fondo, lujo natural sin exceso. Sin texto ni collage."
      },
      {
        "title": "07 · Dancefloor",
        "prompt": "UNA fotografía horizontal 4:3 de pista de baile repleta de adultos, luces arquitectónicas en anillos cromados, violet/magenta, haze suave, energía nocturna premium. Sin texto ni collage."
      },
      {
        "title": "08 · Tickets",
        "prompt": "UNA fotografía vertical 4:5 de una entrada VIP conceptual para nightclub AFTR. sobre cromo y cristal ahumado, luz violeta, fotografía de producto de lujo, sin textos pequeños falsos ni collage."
      }
    ]
  },
  {
    "step": "Web",
    "title": "02 · Hero, navegación y acceso 21+",
    "say": "La portada no tiene que explicar de más: enseña el lugar y deja claro qué puede hacer la persona esa noche. Como es un demo, ninguna compra o reserva es real.",
    "show": "Abrir el hero en móvil, tablet y desktop; probar la navegación y la pantalla de acceso para mayores de 21.",
    "prompt": "Construye header responsive de AFTR. con wordmark AFTR. en chrome, navegación Tonight's Events / Weekly Lineup / VIP / Special Offers / Tickets, y hero visual utilizando SOLO assets/hero.webp. Mensaje principal en inglés 'A HIGHER REALITY AWAITS' y CTA Explore Events / VIP Tables, sin párrafos excesivos ni gradientes artificiales. Incluye confirmación de edad 21+ y nota de sitio conceptual. Los CTA deben navegar a secciones reales de la misma web. Conserva las fotos aprobadas y el contraste legible."
  },
  {
    "step": "Eventos",
    "title": "03 · Tonight’s Events + Weekly Lineup",
    "say": "Las promociones tienen que dar ganas de ir esta noche, no parecer un flyer barato. Cada evento se entiende rápido: nombre, fecha, tipo de música y qué hacer.",
    "show": "Presentar tarjetas de eventos, fechas ficticias marcadas como demo, botones y cambio de categoría.",
    "prompt": "Añade Tonight's Events y Weekly Lineup con tarjetas editoriales sobre fondo negro. Usa assets/dj.webp y assets/dancefloor.webp, tipografía sans condensada y detalles plata/violeta. Incluye fechas y nombres de artistas FICTICIOS claramente etiquetados como ejemplo, géneros house, hip-hop, reggaeton y EDM. Que los filtros/event buttons funcionen como simulación local, sin conectar ticketing. Las ofertas no deben sentirse como anuncios baratos."
  },
  {
    "step": "Experiencias",
    "title": "04 · VIP tables, offers y guest list",
    "say": "Aquí la experiencia se vende por lo que se ve: entrada exclusiva, atención y mesa. Evito prometer reservas porque aún no hay sistema real detrás.",
    "show": "Probar tarjetas de VIP, Special Offers, Guest List, formularios y estados de demostración.",
    "prompt": "Construye VIP Table Reservations, Special Offers y Guest List para AFTR. con assets/vip-lounge.webp, assets/bottle-service.webp, assets/model.webp y assets/entry.webp. Diseña tarjetas premium, copy estadounidense directo y formularios de demostración con confirmación LOCAL, nunca envíos ni reservas reales. No recolectes ni almacenes datos privados. Etiqueta todas las experiencias como concept demo; sin Stripe ni checkout. Prioriza accesibilidad y consistencia de marca."
  },
  {
    "step": "Tickets y QA",
    "title": "05 · Tickets, responsive y revisión final",
    "say": "Una identidad premium también se nota cuando la abres en el teléfono. Antes de mostrar el demo reviso que todo se lea y que ningún botón prometa algo que no hace.",
    "show": "Revisar desktop, tablet y móvil; validar imágenes, rutas, interacciones, navegación y el disclaimer de concepto.",
    "prompt": "Añade Tickets & Experiences con asset tickets.webp y CTAs demostrativos. Comprueba enlace a las seis secciones, menú móvil, ancho de tarjetas, legibilidad, textos en inglés y contraste. Testea responsive en 375px, 768px y 1440px. No añadas videos, chats automáticos, pagos, datos de contacto ficticios, testimonios inventados ni formularios conectados. Confirma que todos los CTA indiquen simulación cuando corresponda. Trabaja únicamente en AFTR. sin modificar Casa Brownie ni CRUMB."
  }
];

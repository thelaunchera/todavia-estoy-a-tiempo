import type {DemoRebuildPrompt} from './demo-rebuild-prompts';

// Material privado para el Studio; comandos independientes para reconstruir el demo.
export const solunaRebuildPrompts:DemoRebuildPrompt[] = [
  {
    "title": "00 · Investigación y dirección visual",
    "step": "Investigación",
    "prompt": "Investiga qué necesita un estudio de yoga nuevo en Fort Lauderdale para conseguir primeros alumnos: jerarquía, propuesta de valor, promociones, lista de espera, tipos de clase y preguntas frecuentes. Resume necesidades reales y propón una estructura mobile-first, sin copiar otras marcas. No programes todavía.",
    "say": "Primero investigamos qué necesita este negocio. Como todavía no ha abierto, su objetivo es conseguir personas interesadas y explicar la oferta, no fingir reservas.",
    "show": "Comparar tres estudios de yoga y definir la propuesta de valor, audiencia y CTA."
  },
  {
    "title": "01 · Identidad y sistema visual",
    "step": "Brand board",
    "prompt": "Diseña la identidad de SOLUNA Yoga, estudio ficticio próximo a abrir en Fort Lauderdale: warm ivory, sage green, arena, light oak y terracota suave. Editorial premium, serif elegante y tipografía limpia. Define paleta, tipografía, espaciado y dirección fotográfica; sin flechas, emojis, estrellas decorativas ni plantillas genéricas. Entrega solo el sistema visual y espera.",
    "say": "Antes de construir la página elegimos una dirección consistente. Así todas las secciones se sentirán parte de la misma marca.",
    "show": "Presentar paleta, jerarquía y ejemplos de encuadre."
  },
  {
    "title": "02 · Fotografías maestras, una por vez",
    "step": "Banco fotográfico",
    "prompt": "Crea las ocho fotografías de SOLUNA usando la dirección artística global y los comandos individuales adjuntos. Genera UNA imagen por solicitud y guarda archivos separados. Empieza por el hero y el interior para mantener consistencia. No collage, no imágenes con letras.",
    "say": "Primero hacemos la foto principal y el estudio; esas dos sirven de referencia para que las demás no parezcan lugares diferentes.",
    "show": "Mostrar los ocho prompts individuales y el orden de generación.",
    "photoCommands": [
      {
        "title": "01 · Hero — Tabletop · 16:9",
        "prompt": "Create one ultra-realistic premium editorial photograph for SOLUNA Yoga, a fictional boutique studio in Fort Lauderdale. Same coherent architecture throughout: warm ivory plaster, light oak floor, linen curtains, sage accents, neutral mats, warm Florida sunlight. Natural skin and anatomy, believable perspective, no collage, no text overlay, no watermark. A natural-looking adult Latina with dark brown hair in a low bun, matching sage sports bra and leggings, performing accurate Bharmanasana tabletop on a beige mat: wrists under shoulders, knees under hips, neutral spine, gaze slightly downward. Full body at right, generous clear negative space at left for headline, flattering three-quarter side angle, same SOLUNA studio. Landscape 16:9."
      },
      {
        "title": "02 · Exterior — fachada · 16:9",
        "prompt": "Create one ultra-realistic premium editorial photograph for SOLUNA Yoga, a fictional boutique studio in Fort Lauderdale. Same coherent architecture throughout: warm ivory plaster, light oak floor, linen curtains, sage accents, neutral mats, warm Florida sunlight. Natural skin and anatomy, believable perspective, no collage, no text overlay, no watermark. Photorealistic storefront of fictional SOLUNA YOGA studio in Fort Lauderdale, ivory stucco facade, tall glass windows, oak entry door, sage trim, restrained tropical plants, subtle single correctly spelled SOLUNA YOGA sign, authentic Florida streetscape, no people blocking the door. Architectural perspective, landscape 16:9. This is concept art, not a real location."
      },
      {
        "title": "03 · Interior vacío · 16:9",
        "prompt": "Create one ultra-realistic premium editorial photograph for SOLUNA Yoga, a fictional boutique studio in Fort Lauderdale. Same coherent architecture throughout: warm ivory plaster, light oak floor, linen curtains, sage accents, neutral mats, warm Florida sunlight. Natural skin and anatomy, believable perspective, no collage, no text overlay, no watermark. Wide architectural view of the same SOLUNA Yoga studio: ivory textured walls, light oak floor, tall windows, translucent linen curtains, eight beige mats, cork blocks and folded cream blankets, clear circulation space, no people, natural 24mm lens and straight verticals. Landscape 16:9."
      },
      {
        "title": "04 · Clase grupal Warrior II · 16:9",
        "prompt": "Create one ultra-realistic premium editorial photograph for SOLUNA Yoga, a fictional boutique studio in Fort Lauderdale. Same coherent architecture throughout: warm ivory plaster, light oak floor, linen curtains, sage accents, neutral mats, warm Florida sunlight. Natural skin and anatomy, believable perspective, no collage, no text overlay, no watermark. Six adult women of diverse appearances each on her own beige or sage mat, all in anatomically accurate Warrior II with bent front knee, straight back leg, arms horizontal; instructor visible at front. Same SOLUNA studio, warm window light, all participants in frame, no duplicated faces or limbs. Landscape 16:9."
      },
      {
        "title": "05 · Slow Flow · 4:5",
        "prompt": "Create one ultra-realistic premium editorial photograph for SOLUNA Yoga, a fictional boutique studio in Fort Lauderdale. Same coherent architecture throughout: warm ivory plaster, light oak floor, linen curtains, sage accents, neutral mats, warm Florida sunlight. Natural skin and anatomy, believable perspective, no collage, no text overlay, no watermark. Same Latina woman from hero, identical sage outfit and low bun, performing accurate gentle low lunge Anjaneyasana, front knee over ankle, back knee supported, upright torso, arms lifted naturally. Same studio and beige mat, full body and breathing room for responsive crop. Vertical 4:5."
      },
      {
        "title": "06 · Deep Rest · 4:5",
        "prompt": "Create one ultra-realistic premium editorial photograph for SOLUNA Yoga, a fictional boutique studio in Fort Lauderdale. Same coherent architecture throughout: warm ivory plaster, light oak floor, linen curtains, sage accents, neutral mats, warm Florida sunlight. Natural skin and anatomy, believable perspective, no collage, no text overlay, no watermark. Adult woman in soft sand-colored yoga clothes resting supine on a beige mat with linen bolster under knees, folded blanket nearby, relaxed expression, eyes closed. Same SOLUNA studio, warm indirect light, realistic support and anatomy, elevated three-quarter camera angle. Vertical 4:5."
      },
      {
        "title": "07 · Morning Ritual · 4:5",
        "prompt": "Create one ultra-realistic premium editorial photograph for SOLUNA Yoga, a fictional boutique studio in Fort Lauderdale. Same coherent architecture throughout: warm ivory plaster, light oak floor, linen curtains, sage accents, neutral mats, warm Florida sunlight. Natural skin and anatomy, believable perspective, no collage, no text overlay, no watermark. Same Latina woman from hero in same sage outfit and low bun, standing in anatomically accurate Mountain Pose Tadasana, feet grounded, relaxed straight legs, shoulders down, arms at sides, full body visible. Beige mat, linen-curtained window, soft Florida morning light, same studio. Vertical 4:5."
      },
      {
        "title": "08 · Flores recepción · 4:5",
        "prompt": "Create one ultra-realistic premium editorial photograph for SOLUNA Yoga, a fictional boutique studio in Fort Lauderdale. Same coherent architecture throughout: warm ivory plaster, light oak floor, linen curtains, sage accents, neutral mats, warm Florida sunlight. Natural skin and anatomy, believable perspective, no collage, no text overlay, no watermark. Fine-art still life of matte ivory ceramic vase with delicate white cosmos flowers, cream blossoms and green branches on limestone console beside tall sunlit window. Same SOLUNA reception with softly blurred yoga mats and sage-and-ivory studio in background. Natural textures, soft shadows, vertical 4:5."
      }
    ]
  },
  {
    "title": "03 · Hero y CTA de lanzamiento",
    "step": "Hero",
    "prompt": "Construye solo el hero de SOLUNA Yoga con una fotografía 16:9 a la derecha y titular 'Yoga that feels like you.' a la izquierda. Explica que es un estudio nuevo en Fort Lauderdale, amigable para principiantes, que abre pronto. CTA único 'Join the early list', secundario 'View memberships'. Sin flechas ni emojis. Diseña mobile-first a 375px. No inventes fecha ni dirección.",
    "say": "La portada debe explicar en segundos qué es, para quién es y qué hacer. No necesitamos llenar de botones ni promesas.",
    "show": "Comparar portada desktop y móvil, comprobar CTA."
  },
  {
    "title": "04 · Oferta 30% y experiencias",
    "step": "Oferta y clases",
    "prompt": "Añade la oferta para clientes nuevos: 30% de bienvenida, con condiciones pendientes de confirmar. Después crea tres experiencias Slow Flow, Deep Rest y Morning Ritual con fotografías independientes. No inventes horario ni cupos. Mantén diseño editorial, sin flechas ni adornos.",
    "say": "El descuento debe verse rápido, pero no vamos a decir que se aplica a algo específico hasta que el negocio confirme las condiciones.",
    "show": "Revisar bloque del descuento y las tres tarjetas con fotos."
  },
  {
    "title": "05 · Our Studio y ubicación",
    "step": "Espacio",
    "prompt": "Crea sección Our Studio con fotografía exterior y otra interior del mismo estudio ficticio. Añade fotografía floral en el bloque de location/lista de espera. Usa el texto 'Fort Lauderdale · opening soon'; no inventes calle, dirección ni fecha. Explica que las imágenes son conceptuales.",
    "say": "Mostramos cómo se sentiría visitar el estudio, pero aclaramos que es una propuesta visual, no fotografías de un local abierto.",
    "show": "Enseñar fachada, interior y detalle floral."
  },
  {
    "title": "06 · Membresías sin cobro ficticio",
    "step": "Precios",
    "prompt": "Crea tres opciones de membresía: Breathe $10/mes, Flow $15/mes y Rise $25/mes. Las inclusiones reales no están definidas. Los botones pueden guardar interés en una lista, pero NO deben simular cobros ni pedir tarjetas mientras no exista checkout autorizado. Indica claramente modo demo.",
    "say": "Enseñamos precios, pero una página no puede decir que cobró si no hay un pago real conectado.",
    "show": "Probar selección de las tres opciones y explicar la diferencia entre interés y pago."
  },
  {
    "title": "07 · Lista de espera, privacidad y QA",
    "step": "Conversión y prueba",
    "prompt": "Crea formulario mobile-first con nombre, email, interés y consentimiento explícito. Si no hay backend, identifica la inscripción como demo local, sin prometer emails. Añade FAQ sobre apertura, principiantes, 30% y pagos. Revisa diseño a 375px, teclado móvil, navegación, accesibilidad, sin errores de consola y sin flechas ni emojis.",
    "say": "Antes de compartir la web probamos todo como si fuéramos una persona nueva. Si un formulario solo simula, lo decimos.",
    "show": "Completar formulario de prueba, revisar validación y comprobar el móvil."
  },
  {
    "title": "08 · Publicar y comparar",
    "step": "GitHub y publicación",
    "prompt": "Publica SOLUNA como demo separado en GitHub sin modificar otros demos. Verifica URL pública, imágenes, navegación y botones. Documenta las fotografías y los pasos que faltan para habilitar lista de espera y pagos reales. No inventes una URL: devuelve la que haya quedado efectivamente publicada.",
    "say": "Terminamos con la página funcionando y un enlace que se pueda abrir. El repositorio conserva lo que construimos.",
    "show": "Abrir URL pública, GitHub y checklist final."
  }
];

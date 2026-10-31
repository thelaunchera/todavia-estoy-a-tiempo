// 30 original, editable bilingual creative briefs. Public 8-prompt freebie stays separate.
// Each brief describes photography; exact titles/prices are composed later as text layers.
export type LabLanguage='es'|'en';
export type PromptTemplate={id:string;category:string;title:{es:string;en:string};body:{es:string;en:string}};
export const PROMPT_CATEGORIES:Record<string,[string,string]>={"product":["Productos","Products"],"lifestyle":["Lifestyle","Lifestyle"],"personal":["Marca personal","Personal brand"],"food":["Food","Food"],"beauty":["Beauty","Beauty"],"services":["Servicios","Services"],"cleaning":["Cleaning","Cleaning"],"podcast":["Podcast","Podcast"],"education":["Cursos","Courses"],"tech":["Apps / Tech","Apps / Tech"],"luxury":["Premium","Premium"],"marketing":["Marketing","Marketing"]};
export const PROMPT_TEMPLATES:PromptTemplate[]=[
  {
    "id": "01",
    "category": "product",
    "title": {
      "en": "Studio hero",
      "es": "Producto en estudio"
    },
    "body": {
      "en": "Photograph {{subject}} as the unmistakable hero of a premium commercial still life: clean seamless {{background}}, a three-quarter view, one grounded soft shadow, believable material microtexture, controlled broad softbox highlights, ample space for a headline. Preserve the exact recognizable product; do not add or redraw labels.",
      "es": "Fotografía {{subject}} como protagonista de un bodegón comercial premium: fondo continuo {{background}}, ángulo de tres cuartos, una sombra suave creíble, microtextura real del material, reflejos amplios de estudio y espacio libre para un titular. Conserva la identidad real del producto; no inventes ni redibujes etiquetas."
    }
  },
  {
    "id": "02",
    "category": "product",
    "title": {
      "en": "Product macro",
      "es": "Macro del producto"
    },
    "body": {
      "en": "Create a true close macro photograph of {{subject}} emphasizing visible texture and material, not a miniature or distorted copy. Use a shallow yet physically credible depth of field, directional side light and a quiet {{background}} backdrop; no extra product details.",
      "es": "Crea una fotografía macro cercana de {{subject}}, destacando texturas y materiales visibles sin convertirlo en una miniatura deformada. Usa profundidad de campo corta pero creíble, luz lateral y fondo {{background}} discreto; sin detalles inventados."
    }
  },
  {
    "id": "03",
    "category": "product",
    "title": {
      "en": "Architectural plinth",
      "es": "Pedestal arquitectónico"
    },
    "body": {
      "en": "Set {{subject}} on one sculptural architectural pedestal in {{background}}, with refined hard-to-soft shadows, realistic gravity and reflections. An editorial product campaign, not floating or surreal, leaving deliberate negative space.",
      "es": "Coloca {{subject}} sobre un pedestal arquitectónico en {{background}}, con sombras refinadas, gravedad y reflejos creíbles. Campaña editorial de producto, sin efecto flotante ni surrealista, con espacio negativo intencional."
    }
  },
  {
    "id": "04",
    "category": "product",
    "title": {
      "en": "Packaging fidelity",
      "es": "Empaque intacto"
    },
    "body": {
      "en": "Produce a premium catalog image with {{subject}} accurately represented: preserve all real proportions, cap placement, packaging shape and existing visible marks. Change only environment and lighting to {{background}}; never fabricate readable label text.",
      "es": "Produce una imagen de catálogo premium de {{subject}} conservando proporciones, tapa, forma del empaque y marcas visibles originales. Cambia únicamente el ambiente y la iluminación hacia {{background}}; nunca inventes textos en la etiqueta."
    }
  },
  {
    "id": "05",
    "category": "product",
    "title": {
      "en": "Product color story",
      "es": "Historia de color"
    },
    "body": {
      "en": "Build a restrained commercial color story around {{subject}}, harmonizing real object colors with {{background}} and two tactile props that make contextual sense. Natural shadows, realistic scale, no duplicate products, asymmetrical art direction.",
      "es": "Construye una historia de color comercial alrededor de {{subject}}, armonizando sus colores reales con {{background}} y dos props táctiles adecuados. Sombras naturales, escala realista, sin duplicar objetos y dirección de arte asimétrica."
    }
  },
  {
    "id": "06",
    "category": "lifestyle",
    "title": {
      "en": "Window light",
      "es": "Luz de ventana"
    },
    "body": {
      "en": "Show {{subject}} in an authentic everyday setting with believable side-window daylight, subtle surface imperfections, gently lived-in styling and a spontaneous documentary composition. Keep the main subject in clear focus.",
      "es": "Muestra {{subject}} en un entorno cotidiano auténtico, con luz lateral de ventana, imperfecciones sutiles en las superficies, decoración vivida y encuadre documental espontáneo. Mantén el sujeto principal enfocado."
    }
  },
  {
    "id": "07",
    "category": "lifestyle",
    "title": {
      "en": "Candid movement",
      "es": "Movimiento natural"
    },
    "body": {
      "en": "Capture an unposed, documentary-feeling moment featuring {{subject}} in {{background}}. The body or hands should show natural purposeful action, plausible motion and anatomical proportions; avoid staged gestures and mannequin poses.",
      "es": "Captura un momento espontáneo y documental de {{subject}} en {{background}}. El cuerpo o las manos deben mostrar una acción natural, movimiento creíble y proporciones anatómicas correctas; evita poses de maniquí."
    }
  },
  {
    "id": "08",
    "category": "lifestyle",
    "title": {
      "en": "Hands at work",
      "es": "Manos trabajando"
    },
    "body": {
      "en": "Photograph real hands interacting naturally with {{subject}} while performing a believable task. Keep fingers anatomically consistent, contact and grip physically plausible, and the environment understated with natural light.",
      "es": "Fotografía manos reales interactuando naturalmente con {{subject}} mientras realizan una tarea posible. Dedos anatómicamente consistentes, contacto y agarre creíbles, entorno discreto y luz natural."
    }
  },
  {
    "id": "09",
    "category": "lifestyle",
    "title": {
      "en": "Desk moment",
      "es": "Escena de escritorio"
    },
    "body": {
      "en": "Place {{subject}} in a believable working desk environment with one notebook, warm ambient daylight and natural wear on tactile surfaces. Human, contemporary editorial photography, intentional depth and non-repetitive framing.",
      "es": "Sitúa {{subject}} en un escritorio de trabajo creíble con un cuaderno, luz cálida del día y desgaste natural de las superficies. Fotografía editorial humana y contemporánea, con profundidad y encuadre no repetitivo."
    }
  },
  {
    "id": "10",
    "category": "lifestyle",
    "title": {
      "en": "Outdoor natural",
      "es": "Exterior natural"
    },
    "body": {
      "en": "Photograph {{subject}} outdoors in open shade during a real-feeling day, with accurate environmental reflections, realistic scale, gentle background separation and no artificial HDR or oversaturation.",
      "es": "Fotografía {{subject}} en exteriores bajo sombra abierta, durante un día natural, con reflejos ambientales correctos, escala realista, separación suave del fondo y sin HDR artificial ni saturación exagerada."
    }
  },
  {
    "id": "11",
    "category": "personal",
    "title": {
      "en": "Portrait with negative space",
      "es": "Retrato con espacio"
    },
    "body": {
      "en": "Use the supplied portrait of {{subject}} as the identity reference. Make an editorial portrait with an authentic human expression, realistic skin texture, flattering window light and uncluttered {{background}} space on one side for separate editable typography. Never change facial identity.",
      "es": "Utiliza el retrato aportado de {{subject}} como referencia de identidad. Haz un retrato editorial con expresión humana auténtica, textura natural de piel, luz favorecedora de ventana y espacio {{background}} a un lado para tipografía editable. No cambies la identidad facial."
    }
  },
  {
    "id": "12",
    "category": "personal",
    "title": {
      "en": "Founder candid",
      "es": "Fundadora espontánea"
    },
    "body": {
      "en": "Create a candid editorial photograph of {{subject}} in a real work moment: relaxed posture, imperfect natural gesture, honest skin texture, believable wardrobe folds and simple modern surroundings. No fake logos or staged business props.",
      "es": "Crea una fotografía editorial espontánea de {{subject}} en un momento real de trabajo: postura relajada, gesto natural imperfecto, textura auténtica de piel, pliegues creíbles de la ropa y entorno moderno sencillo. Sin logos inventados ni props falsos."
    }
  },
  {
    "id": "13",
    "category": "personal",
    "title": {
      "en": "Cover portrait",
      "es": "Retrato de portada"
    },
    "body": {
      "en": "Compose a close editorial portrait of {{subject}} with a confident but genuine expression, strong directional light, clean tonal hierarchy and generous framing reserved for exact magazine typography added later in the editor.",
      "es": "Compón un retrato editorial cercano de {{subject}} con expresión segura y genuina, luz direccional marcada, jerarquía tonal limpia y encuadre amplio para agregar después tipografía exacta de revista en el editor."
    }
  },
  {
    "id": "14",
    "category": "personal",
    "title": {
      "en": "Casual street portrait",
      "es": "Retrato urbano casual"
    },
    "body": {
      "en": "Photograph {{subject}} outdoors in a modern everyday street setting with realistic clothing details, natural stance and candid expression. Use softly overcast light, authentic skin and credible proportions; no artificial face beautification.",
      "es": "Fotografía {{subject}} en una calle cotidiana y moderna, con detalles reales de ropa, postura natural y expresión espontánea. Luz suave de cielo nublado, piel auténtica y proporciones creíbles; sin embellecimiento artificial de rostro."
    }
  },
  {
    "id": "15",
    "category": "personal",
    "title": {
      "en": "Editorial about me",
      "es": "Sobre mí editorial"
    },
    "body": {
      "en": "Create a clean authentic portrait of {{subject}} suitable for an About Me layout. Leave clear areas around the portrait for separately editable handwritten notes and arrows; make the photography real and understated, without any text baked into the pixels.",
      "es": "Crea un retrato limpio y auténtico de {{subject}} para una composición Sobre mí. Deja áreas despejadas alrededor para notas manuscritas y flechas editables, con fotografía real y discreta, sin texto incrustado en la imagen."
    }
  },
  {
    "id": "16",
    "category": "food",
    "title": {
      "en": "Freshly baked close-up",
      "es": "Recién horneado"
    },
    "body": {
      "en": "Shoot {{subject}} as freshly prepared real food: appetizing but honest crumb structure, believable moisture, natural crumbs and warm indirect light. Avoid waxy highlights, impossible stretching or identical repeated pieces.",
      "es": "Fotografía {{subject}} como comida real recién preparada: miga apetecible y auténtica, humedad creíble, migas naturales y luz cálida indirecta. Evita brillos plásticos, estiramientos imposibles y piezas repetidas idénticas."
    }
  },
  {
    "id": "17",
    "category": "food",
    "title": {
      "en": "Cafe table scene",
      "es": "Mesa de cafetería"
    },
    "body": {
      "en": "Photograph {{subject}} on a lived-in cafe table with window daylight, believable ceramic or glass surfaces and just two relevant props. Real food textures, casual composition and subtle imperfections.",
      "es": "Fotografía {{subject}} en una mesa de cafetería vivida, con luz de ventana, superficies reales de cerámica o vidrio y solo dos props relevantes. Texturas auténticas de alimentos, composición casual e imperfecciones sutiles."
    }
  },
  {
    "id": "18",
    "category": "food",
    "title": {
      "en": "Overhead ingredients",
      "es": "Ingredientes cenital"
    },
    "body": {
      "en": "Make a top-down culinary editorial of {{subject}} with only genuine visible ingredients and natural hands if relevant, a restrained {{background}} surface, organic spacing and no fictional garnish or packaging.",
      "es": "Crea una fotografía gastronómica cenital de {{subject}}, con ingredientes genuinos visibles y manos naturales si corresponde, superficie {{background}} discreta, distribución orgánica y sin decoración ni empaque ficticios."
    }
  },
  {
    "id": "19",
    "category": "beauty",
    "title": {
      "en": "Skin texture beauty",
      "es": "Belleza con textura"
    },
    "body": {
      "en": "Create understated premium beauty photography of {{subject}}, preserving realistic skin pores, natural complexion variation and physically plausible shadows. Soft daylight, minimal styling; never smooth away identity or fabricate results.",
      "es": "Crea una fotografía beauty premium y discreta de {{subject}}, conservando poros reales, variaciones naturales del tono de piel y sombras físicamente creíbles. Luz suave de día y estilismo mínimo; no borres la identidad ni inventes resultados."
    }
  },
  {
    "id": "20",
    "category": "beauty",
    "title": {
      "en": "Vanity still life",
      "es": "Bodegón tocador"
    },
    "body": {
      "en": "Style {{subject}} as a refined beauty vanity still life with clean glass, soft diffused reflections, carefully spaced objects and cohesive {{background}} colors. Keep authentic branding intact; do not synthesize labels.",
      "es": "Presenta {{subject}} como bodegón refinado de tocador con cristal limpio, reflejos difusos, objetos cuidadosamente espaciados y colores {{background}} coherentes. Conserva marcas reales sin sintetizar etiquetas."
    }
  },
  {
    "id": "21",
    "category": "services",
    "title": {
      "en": "Before service context",
      "es": "Antes del servicio"
    },
    "body": {
      "en": "Photograph a truthful, plausible BEFORE-service environment involving {{subject}}, with honest natural lighting and no exaggerated mess or unsafe claims. Focus on context, not a fake result comparison.",
      "es": "Fotografía un ambiente realista ANTES del servicio relacionado con {{subject}}, con luz honesta y sin desorden exagerado ni promesas inseguras. Enfócate en el contexto, no en una comparación falsa de resultados."
    }
  },
  {
    "id": "22",
    "category": "services",
    "title": {
      "en": "Behind the scenes team",
      "es": "Detrás de escenas"
    },
    "body": {
      "en": "Capture behind-the-scenes work involving {{subject}} with believable tools, candid hands and unstaged interaction. Credible scale, task-accurate details and natural ambient light, without invented uniforms or company logos.",
      "es": "Captura el detrás de escenas del trabajo de {{subject}}, con herramientas creíbles, manos espontáneas e interacción sin poses forzadas. Escala, detalles de la tarea y luz ambiental reales, sin uniformes ni logos inventados."
    }
  },
  {
    "id": "23",
    "category": "services",
    "title": {
      "en": "Helpful expert moment",
      "es": "Experta en acción"
    },
    "body": {
      "en": "Show {{subject}} in a simple helpful work scenario, conveying competence through believable action rather than fake certificates or claims. Editorial natural-light photo with room for accurate captions added later.",
      "es": "Muestra {{subject}} en una situación sencilla de trabajo útil, transmitiendo profesionalidad mediante una acción creíble, no con certificados ni promesas ficticias. Foto editorial con luz natural y espacio para textos exactos."
    }
  },
  {
    "id": "24",
    "category": "cleaning",
    "title": {
      "en": "Residential cleaning detail",
      "es": "Limpieza residencial real"
    },
    "body": {
      "en": "Photograph a genuine residential cleaning work moment with {{subject}}: realistic microfiber cloth and safe household tools, believable surfaces and natural room light. Avoid fabricated before-and-after effects or invented branding.",
      "es": "Fotografía un momento genuino de limpieza residencial con {{subject}}: paño de microfibra y herramientas domésticas realistas, superficies creíbles y luz natural de una habitación. Sin efectos antes/después falsos ni marcas inventadas."
    }
  },
  {
    "id": "25",
    "category": "podcast",
    "title": {
      "en": "Podcast studio intimacy",
      "es": "Intimidad de podcast"
    },
    "body": {
      "en": "Photograph {{subject}} in a real intimate podcast recording environment: one authentic microphone, acoustic detail, soft side light, natural posture, restrained background and no fake show titles in the image.",
      "es": "Fotografía {{subject}} en un ambiente íntimo y real de grabación de podcast: un micrófono auténtico, detalles acústicos, luz lateral suave, postura natural, fondo discreto y sin títulos ficticios dentro de la imagen."
    }
  },
  {
    "id": "26",
    "category": "education",
    "title": {
      "en": "Course creation workspace",
      "es": "Creando una clase"
    },
    "body": {
      "en": "Create a candid scene of {{subject}} preparing an online course at a believable desk: real notebook, softly lit laptop with an unreadable neutral screen, practical props and human natural movement. Do not invent UI, credentials or certificates.",
      "es": "Crea una escena espontánea de {{subject}} preparando un curso online en un escritorio realista: cuaderno, laptop con pantalla neutra sin textos inventados, props prácticos y movimiento humano natural. No inventes interfaces ni certificados."
    }
  },
  {
    "id": "27",
    "category": "tech",
    "title": {
      "en": "Real app showcase",
      "es": "Aplicación real"
    },
    "body": {
      "en": "Design a premium editorial photo environment around the PROVIDED real screenshot of {{subject}}, using controlled lighting, a suitable device frame and subtle {{background}} palette. Preserve the real UI as an unchanged composited layer; NEVER regenerate screen text.",
      "es": "Diseña un ambiente fotográfico editorial premium alrededor de la captura REAL proporcionada de {{subject}}, con iluminación controlada, marco de dispositivo apropiado y paleta {{background}} discreta. Conserva la interfaz como capa original intacta; NUNCA regeneres sus textos."
    }
  },
  {
    "id": "28",
    "category": "luxury",
    "title": {
      "en": "Quiet luxury campaign",
      "es": "Campaña lujo discreto"
    },
    "body": {
      "en": "Compose a quiet-luxury still life of {{subject}} using tactile premium materials, considered negative space, subtle restrained {{background}} tones and a single elegant shadow. No gold clichés, fake logos or floating products.",
      "es": "Compón un bodegón de lujo discreto de {{subject}}, con materiales premium táctiles, espacio negativo intencional, tonos {{background}} sobrios y una sola sombra elegante. Sin clichés dorados, logos falsos ni productos flotando."
    }
  },
  {
    "id": "29",
    "category": "marketing",
    "title": {
      "en": "Launch teaser",
      "es": "Teaser de lanzamiento"
    },
    "body": {
      "en": "Create an editorial launch teaser photograph featuring {{subject}}, one dramatically cropped authentic detail and an intentional high-contrast area for later text overlay. No fabricated urgency badges, prices or lettering.",
      "es": "Crea una fotografía editorial de teaser de lanzamiento con {{subject}}, un detalle auténtico recortado dramáticamente y un área de alto contraste para texto posterior. Sin insignias de urgencia, precios ni letras inventadas."
    }
  },
  {
    "id": "30",
    "category": "marketing",
    "title": {
      "en": "Offer campaign backdrop",
      "es": "Fondo de oferta"
    },
    "body": {
      "en": "Create a bold but refined advertising background for {{subject}}, with sculptural geometry, believable perspective, clean negative space for an exact offer price added later, and coherent {{background}} colors. No built-in words or fake price tags.",
      "es": "Crea un fondo publicitario impactante pero refinado para {{subject}}, con geometría escultórica, perspectiva creíble, espacio limpio para añadir después el precio exacto y colores {{background}} coherentes. Sin palabras ni etiquetas de precios inventadas."
    }
  }
];
export const fillTemplate=(input:string,values:{subject?:string;background?:string})=>
 input.replace(/\{\{(subject|background)\}\}/g,(_,key:string)=>values[key as keyof typeof values]?.trim()||(key==='subject'?'your real reference subject':'a natural editorial backdrop'));
export const promptLang=(language:string):LabLanguage=>language==='English'?'en':'es';

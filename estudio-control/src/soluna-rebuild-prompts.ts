import type {DemoRebuildPrompt} from './demo-rebuild-prompts';
import {solunaPhotos} from './soluna-photos';

/** Guía privada SOLUNA · texto de los pasos + master prompts de las fotografías originales. */
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
    "title": "02 · Fotografía premium: 13 fotos individuales",
    "step": "Fotografías",
    "prompt": "Crea una colección editorial de 13 fotografías individuales para SOLUNA Yoga, respetando la misma modelo, arquitectura y luz en toda la serie. Usa los 13 MASTER PROMPTS que aparecen justo debajo, uno por uno, y utiliza las fotos aprobadas como referencias si están disponibles. Prohibido usar collages, mosaicos, paneles divididos, textos sobre imágenes, marcas inventadas o caras cambiantes. Guarda cada imagen individual con su nombre de archivo correspondiente. Comienza con el hero cinematográfico y el interior; continúa con las clases, fachada, matcha y ropa.",
    "say": "Aquí es donde la página comienza a sentirse como una marca real. No pido las 13 fotos juntas porque el generador puede devolver un collage. Creo una, reviso su resultado, guardo el archivo y después sigo con el siguiente prompt. Así tenemos una colección coherente y podemos reutilizarla en la landing o en redes.",
    "show": "Abrir cada una de las 13 fotos individuales y enseñar su prompt, localización en la página y archivo original de GitHub. Nunca usar collages.",
    "photoCommands": solunaPhotos.map(photo=>({title:photo.title,prompt:photo.prompt,imageUrl:photo.url}))
  },
  {
    "title": "03 · Hero editorial que impacta",
    "step": "Hero",
    "prompt": "Construye el hero editorial premium de SOLUNA Yoga tomando como fotografía principal aprobada images/soluna-hero-editorial.webp: mujer adulta con conjunto verde salvia en una postura suave de yoga, estudio orgánico y luz cálida. En escritorio, imagen protagonista a la derecha y texto legible a la izquierda: 'Yoga that feels like you.' En móvil, fotografía primero y copy después, sin banners que tapen a la modelo. Explica que abre próximamente en Fort Lauderdale y que está diseñado para principiantes. CTA principal 'Join the early list'; secundario 'View memberships'. Evita fechas, direcciones, testimonios, flechas, emojis y promesas inventadas. Verifica en 375 px.",
    "say": "La primera impresión la hace la fotografía. Aquí no quiero que el texto tape a la modelo. En el teléfono la foto abre la página y debajo aparece el mensaje con un botón claro. Así se entiende qué es SOLUNA y qué hacer.",
    "show": "Abrir el hero en teléfono y escritorio, comprobar recorte, contraste, ubicación del CTA y la ausencia de banners sobre la fotografía."
  },
  {
    "title": "04 · Oferta interactiva 30% y tres clases",
    "step": "Oferta y clases",
    "prompt": "En el demo de SOLUNA crea un bloque de bienvenida 30% OFF para huéspedes nuevos; no inventes fecha límite ni condiciones, ni un contador falso. Añade un botón o disclosure accesible 'How does the offer work?' que explica que los términos se confirmarán antes de abrir. Después crea tres clases Slow Flow, Deep Rest y Morning Ritual, cada una con su fotografía individual sin banner grande encima, nombre y descripción debajo, botón 'Discover this practice' que despliega detalles. Incluye una foto grupal Warrior II como introducción a las clases. Diseña para 375 px y pantallas grandes.",
    "say": "El descuento llama la atención, pero no vamos a inventar urgencia. El botón explica exactamente qué se sabe. Después las clases usan fotografías limpias, con sus textos debajo, para que ninguna cara quede escondida por una tarjeta.",
    "show": "Tocar el detalle del 30% y los botones de las tres clases. Confirmar que la foto queda visible y que los detalles se despliegan sin saltos."
  },
  {
    "title": "05 · Our Studio y segunda fotografía editorial",
    "step": "Espacios",
    "prompt": "Crea Our Studio con dos fotografías individuales verificadas images/studio-exterior.webp e images/studio-interior.webp y una pequeña etiqueta por foto; recuerda que es un estudio ficticio conceptual, no real. Coloca la foto images/hero.webp (modelo en tabletop Bharmanasana) en una sección editorial secundaria 'Every practice begins somewhere', NO en el hero. Usa images/floral.webp como detalle de recepción junto al formulario. Elimina espacios excesivamente altos en iPhone y evita repetir la misma imagen.",
    "say": "Ahora mostramos la fachada, el salón y una segunda escena humana. La mujer haciendo yoga en cuatro apoyos ya no es la portada: tiene una sección propia para contar la historia del estudio. También colocamos un detalle floral cerca del formulario.",
    "show": "Recorrer fachada, interior, imagen tabletop y flores; revisar proporciones en móvil y confirmar que no se repitan fotos."
  },
  {
    "title": "06 · Membresías sin cobro ficticio",
    "step": "Precios",
    "prompt": "Crea tres opciones de membresía: Breathe $10/mes, Flow $15/mes y Rise $25/mes. Las inclusiones reales no están definidas. Los botones pueden guardar interés en una lista, pero NO deben simular cobros ni pedir tarjetas mientras no exista checkout autorizado. Indica claramente modo demo.",
    "say": "Enseñamos precios, pero una página no puede decir que cobró si no hay un pago real conectado.",
    "show": "Probar selección de las tres opciones y explicar la diferencia entre interés y pago."
  },
  {
    "title": "07 · Formulario de interés y control de calidad",
    "step": "Conversión y QA",
    "prompt": "Construye la sección de lista de espera en inglés, con nombre, email, selección de interés y consentimiento claro. Si el demo funciona sin backend, indica que los registros solo se simulan en el navegador y que no se envían emails. Añade FAQ sobre principiantes, apertura, membresías, oferta y compras. Comprueba el formulario, los estados de validación, navegación, tamaños táctiles, accesibilidad, recursos e imágenes en viewport 375 px. Nunca digas que se procesó un pago ni que se inscribió a una persona real.",
    "say": "Probamos la web como si acabáramos de descubrir el estudio. Tocamos los botones y llenamos un ejemplo para saber qué pasa. Es importante contar con claridad lo que realmente funciona y lo que todavía es una simulación.",
    "show": "Enviar formulario de prueba con consentimiento, abrir FAQ y confirmar que todo queda legible en iPhone."
  },
  {
    "title": "08 · SOLUNA Shop: matcha y tres fotografías de ropa",
    "step": "Tienda conceptual",
    "prompt": "Añade la sección SOLUNA Shop usando exactamente CUATRO fotografías INDIVIDUALES, nunca collages: images/soluna-matcha-single.webp (un iced matcha), images/soluna-apparel-model.webp (modelo con conjunto verde salvia), images/soluna-apparel-set.webp (set fotografiado solo) e images/soluna-apparel-rack.webp (prendas en perchas). Construye cuatro tarjetas editoriales de la misma colección, con imagen visible y texto fuera de la foto. Cada tarjeta tiene botón 'Explore this idea/look' que despliega una descripción. No simules inventario, precios, pedidos ni checkout: son conceptos ficticios. En móvil usa una o dos columnas dependiendo del ancho, táctil cómodo, fotos sin recortes agresivos.",
    "say": "Aquí mostramos cómo podríamos ampliar una marca sin inventar que vende productos. Yo enseño cuatro fotografías distintas y coherentes: una sola bebida y tres de ropa. Todas están separadas, así podremos cambiarlas sin tocar las demás.",
    "show": "Abrir SOLUNA Shop y tocar el detalle de Matcha Ritual, Made to Move, Soft Essentials y The Studio Edit; enseñar imágenes individuales y los botones desplegables."
  },
  {
    "title": "09 · Guardar en repositorio y publicar en Studio",
    "step": "Publicación",
    "prompt": "Guarda el demo SOLUNA Yoga en el repositorio thelaunchera/demo-booking-landing- bajo demos/soluna-yoga/ con index.html, carpeta images/ y README. Asegura que cada archivo original esté en images/ y que el HTML use exclusivamente las fotos aprobadas. Publica por GitHub Pages, comprueba que el enlace abra en móvil. Después agrega el demo y sus 13 fotografías, enlaces y master prompts a la sección 'Demos terminados' del Studio privado, sin duplicar fichas. No toques otros demos, pagos ni sistemas. La lista de espera y la tienda son demostraciones; explica qué no funciona en producción.",
    "say": "Este es el paso final: guardamos el proyecto en GitHub, comprobamos el enlace y lo ponemos en nuestra biblioteca de demos terminados con sus imágenes y prompts para reconstruirlo. Así queda organizado y es reutilizable.",
    "show": "Abrir GitHub Pages y el Studio, revisar la ficha SOLUNA, las fotos individuales y copiar dos prompts de ejemplo."
  }
];

/** Recursos públicos de referencia de los demos. Prompts de recreación editorial (no son los prompts originales de fotografías aprobadas). */
import type {DemoRebuildPrompt} from './demo-rebuild-prompts';
export type FinishedDemoPhoto = {key:string; title:string;placement:string;url:string;prompt:string};
const photoData={
  "casa-brownie": {
    "base": "https://thelaunchera.com/demos/casa-brownie/assets/",
    "brand": "Casa Brownie",
    "style": "editorial de brownies, cacao, marfil, rosa cacao, luz cálida, producto artesanal",
    "items": [
      [
        "hero-brownies.webp",
        "Brownies del hero",
        "Portada estática"
      ],
      [
        "sabor-clasico.webp",
        "Brownie clásico",
        "Catálogo · clásico"
      ],
      [
        "sabor-nuez.webp",
        "Brownie con nuez",
        "Catálogo · nuez"
      ],
      [
        "sabor-dulce-de-leche.webp",
        "Brownie dulce de leche",
        "Catálogo · dulce de leche"
      ],
      [
        "sabor-frambuesa.webp",
        "Brownie de frambuesa",
        "Catálogo · frambuesa"
      ],
      [
        "sabor-oreo.webp",
        "Brownie galleta y crema",
        "Catálogo · galleta y crema"
      ],
      [
        "sabor-especial.webp",
        "Brownie edición especial",
        "Catálogo · especial"
      ],
      [
        "regalo-lazo-rosa.webp",
        "Caja regalo con lazo rosa",
        "Regalos · primer plano"
      ],
      [
        "regalos-bolsa-y-cajas.webp",
        "Bolsas y cajas de regalo",
        "Regalos · composición"
      ]
    ]
  },
  "crumb": {
    "base": "https://thelaunchera.com/demos/crumb/assets/",
    "brand": "CRUMB",
    "style": "Identidad CRUMB Blue #477BB3 y Powder Blue #C9E2F4, Warm Ivory #FAF8F3. Fotos aprobadas azul boutique; galletas en colores naturales; empaques kraft con marca azul. No usar imágenes antiguas beige/marrones, hero.webp ni brand-*.webp.",
    "items": [
      [
        "CRUMB_Storefront_Approved_20261030.webp",
        "Fachada azul aprobada de CRUMB",
        "Hero · fachada azul"
      ],
      [
        "classic.webp",
        "Classic Chocolate Chip",
        "Cookie Edit · producto Classic Chocolate Chip"
      ],
      [
        "double.webp",
        "Double Chocolate",
        "Cookie Edit · producto Double Chocolate"
      ],
      [
        "caramel.webp",
        "Salted Caramel",
        "Cookie Edit · producto Salted Caramel"
      ],
      [
        "raspberry.webp",
        "White Chocolate Raspberry",
        "Cookie Edit · producto White Chocolate Raspberry"
      ],
      [
        "nutty.webp",
        "Nutty Dream",
        "Cookie Edit · producto Nutty Dream"
      ],
      [
        "brownie.webp",
        "Brownie Chip",
        "Cookie Edit · producto Brownie Chip"
      ],
      [
        "CRUMB_03_Gift_Box_Azul.png",
        "Caja CRUMB azul y kraft",
        "Gifts · caja de cookies"
      ],
      [
        "CRUMB_Inside_Cookie_Moment_Blue.svg",
        "The cookie moment · detalles azules",
        "Inside CRUMB · imagen 1"
      ],
      [
        "CRUMB_Inside_Made_With_Care_Blue.svg",
        "Made with care · equipo CRUMB",
        "Inside CRUMB · imagen 2"
      ],
      [
        "CRUMB_02_Bolsa_Azul.png",
        "Beautifully boxed · bolsa azul",
        "Inside CRUMB · imagen 3"
      ],
      [
        "CRUMB_Our_Story_Approved_20261030.webp",
        "Our Story · clienta frente a la tienda azul",
        "Our Story · escena editorial"
      ],
      [
        "classic-cutout-v1.webp",
        "Classic Chocolate Chip · recorte individual",
        "Build Your Box · imagen de producto recortada"
      ],
      [
        "double-cutout-v1.webp",
        "Double Chocolate · recorte individual",
        "Build Your Box · imagen de producto recortada"
      ],
      [
        "caramel-cutout-v1.webp",
        "Salted Caramel · recorte individual",
        "Build Your Box · imagen de producto recortada"
      ],
      [
        "raspberry-cutout-v1.webp",
        "White Chocolate Raspberry · recorte individual",
        "Build Your Box · imagen de producto recortada"
      ],
      [
        "nutty-cutout-v1.webp",
        "Nutty Dream · recorte individual",
        "Build Your Box · imagen de producto recortada"
      ],
      [
        "brownie-cutout-v1.webp",
        "Brownie Chip · recorte individual",
        "Build Your Box · imagen de producto recortada"
      ]
    ]
  },
  "aftr": {
    "base": "https://thelaunchera.com/demos/aftr/assets/",
    "brand": "AFTR. Las Vegas",
    "style": "Chrome Afterglow, negro profundo, violeta y luces cinematográficas. Solo imágenes activas en web, no versiones anteriores.",
    "items": [
      [
        "hero-real-20261031.webp",
        "AFTR. · hero cinematográfico",
        "Hero · portada"
      ],
      [
        "aftr-approved-las-vegas-banner-20261031.webp",
        "Banner aprobado Las Vegas",
        "Ticker · campaña"
      ],
      [
        "dj-real-20261031.webp",
        "DJ de la noche",
        "Eventos · lineup"
      ],
      [
        "vip-lounge.webp",
        "VIP lounge",
        "VIP · salón"
      ],
      [
        "model.webp",
        "Invitada",
        "Experiencias · guest list"
      ],
      [
        "bottle-service.webp",
        "Bottle Service",
        "Experiencias · bebidas"
      ],
      [
        "tickets.webp",
        "Tickets",
        "Experiencias · acceso"
      ],
      [
        "dancefloor.webp",
        "Pista de baile",
        "Cierre · experiencias"
      ]
    ]
  },
  "jaramillo-boutique": {
    "base": "https://thelaunchera.github.io/demo-booking-landing-/jaramillo-boutique/assets/",
    "brand": "Jaramillo Boutique",
    "style": "Moda editorial marfil y burdeos; usar exclusivamente hero-editorial-user.jpg en portada, y fotos publicadas en colecciones.",
    "items": [
      [
        "hero-editorial-user.jpg",
        "Campaña editorial · modelo burdeos",
        "Hero · portada actual"
      ],
      [
        "corse.webp",
        "Corsé editorial",
        "Colecciones · foto publicada"
      ],
      [
        "colombian-jeans.webp",
        "Jeans colombianos",
        "Colecciones · foto publicada"
      ],
      [
        "noche.webp",
        "Looks de noche",
        "Colecciones · foto publicada"
      ],
      [
        "fajas.webp",
        "Shapewear",
        "Colecciones · foto publicada"
      ],
      [
        "plataformas.webp",
        "Plataformas",
        "Colecciones · foto publicada"
      ],
      [
        "blusas.webp",
        "Blusas",
        "Colecciones · foto publicada"
      ],
      [
        "winter.webp",
        "Winter Edit",
        "Colecciones · foto publicada"
      ],
      [
        "summer.webp",
        "Summer Edit",
        "Colecciones · foto publicada"
      ],
      [
        "atelier.webp",
        "Atelier de moda",
        "Contacto · espacio de la boutique"
      ]
    ]
  },
  "yummm": {
    "base": "https://thelaunchera.github.io/demo-booking-landing-/yummm/images/",
    "brand": "YUMMM",
    "style": "coffee, bakery and sweets, fotografía editorial realista, tonos crema y rojo, empaques de marca, cálida luz de cafetería",
    "items": [
      [
        "01.webp",
        "Imagen de marca 01",
        "Galería · referencia"
      ],
      [
        "02.webp",
        "Iced latte YUMMM",
        "Hero y productos"
      ],
      [
        "03.webp",
        "Caja surtida de cookies",
        "Productos"
      ],
      [
        "04.webp",
        "Imagen de marca 04",
        "Galería · referencia"
      ],
      [
        "05.webp",
        "Pastel de pistacho",
        "Productos · bakery"
      ],
      [
        "06.webp",
        "Imagen de marca 06",
        "Galería · referencia"
      ],
      [
        "07.webp",
        "Croissants en caja",
        "Productos · bakery"
      ],
      [
        "08.webp",
        "Delantal rojo con logo",
        "Identidad"
      ],
      [
        "09.webp",
        "Café para llevar",
        "Productos · coffee"
      ],
      [
        "10.webp",
        "Fachada con toldo rojo",
        "Hero · entrada del café"
      ],
      [
        "11.webp",
        "Vitrina de pasteles",
        "Galería"
      ],
      [
        "12.webp",
        "Empaques, bags y boxes",
        "Hero · para llevar"
      ],
      [
        "13.webp",
        "Formar cookies en bandeja",
        "Proceso · Scoop"
      ],
      [
        "14.webp",
        "Mezclar masa de cookies",
        "Proceso · Mix"
      ],
      [
        "15.webp",
        "Cookies en el horno",
        "Proceso · Bake"
      ],
      [
        "16.webp",
        "Empacar cookies",
        "Proceso · Box"
      ],
      [
        "17.webp",
        "Chocolate Chunk Cookie",
        "Catálogo · cookies"
      ],
      [
        "18.webp",
        "Double Chocolate Cookie",
        "Catálogo · cookies"
      ],
      [
        "19.webp",
        "Cookies & Cream",
        "Catálogo · cookies"
      ],
      [
        "20.webp",
        "White Chocolate Macadamia",
        "Catálogo · cookies"
      ]
    ]
  },
  "cb-depot": {
    "base": "https://thelaunchera.com/assets/clients/cb-depot/photos/",
    "brand": "CB Depot",
    "style": "fotografía profesional de mobile car detailing, coches, espuma, pintura, interiores y acabados cuidados, sin marcas de terceros inventadas",
    "items": [
      [
        "hero-desktop.webp",
        "Hero de detailing · escritorio",
        "Portada desktop"
      ],
      [
        "hero-mobile.webp",
        "Hero de detailing · móvil",
        "Portada móvil"
      ],
      [
        "exterior.webp",
        "Detailing exterior",
        "Servicios"
      ],
      [
        "interior.webp",
        "Limpieza interior",
        "Servicios"
      ],
      [
        "paint.webp",
        "Tratamiento de pintura",
        "Servicios"
      ],
      [
        "full.webp",
        "Full detailing",
        "Servicios"
      ],
      [
        "card-exterior.webp",
        "Exterior · tarjeta",
        "Cards de servicios"
      ],
      [
        "card-interior.webp",
        "Interior · tarjeta",
        "Cards de servicios"
      ],
      [
        "card-paint.webp",
        "Pintura · tarjeta",
        "Cards de servicios"
      ],
      [
        "card-full.webp",
        "Full service · tarjeta",
        "Cards de servicios"
      ],
      [
        "panda-on-bmw.webp",
        "Panda sobre BMW",
        "Mascota ilustrativa / visual"
      ]
    ]
  },
  "experience-cleaning": {
    "base": "https://thelaunchera.com/experience-cleaning/photos/",
    "brand": "Experience Cleaning",
    "style": "marfil y azul suave con fotografías reales de espacios; distinguir claramente imágenes de stock externo de fotos originales. No inventar clientes ni reservas.",
    "items": [
      [
        "/assets/cleaning-demo/hero-cleaner-original.jpg",
        "Hero · profesional de limpieza",
        "Hero · residencial"
      ],
      [
        "https://images.pexels.com/photos/8055186/pexels-photo-8055186.jpeg?auto=compress&w=1260&h=750&dpr=1",
        "Standard Cleaning · foto ilustrativa",
        "Servicios · fotografía de referencia externa"
      ],
      [
        "https://images.pexels.com/photos/9462635/pexels-photo-9462635.jpeg?auto=compress&w=1260&h=750&dpr=1",
        "Deep Cleaning · foto ilustrativa",
        "Servicios · fotografía de referencia externa"
      ],
      [
        "/assets/drive-house-gallery/whole-home.png",
        "Move In/Out · casa completa",
        "Servicios · fotografía de referencia"
      ],
      [
        "https://images.pexels.com/photos/9462298/pexels-photo-9462298.jpeg?auto=compress&w=1260&h=750&dpr=1",
        "Custom Cleaning · foto ilustrativa",
        "Servicios · fotografía de referencia externa"
      ],
      [
        "https://images.pexels.com/photos/33357392/pexels-photo-33357392/free-photo-of-janitors-cleaning-large-glass-doors-in-office-building.png?auto=compress&w=1260&h=750&dpr=1",
        "Commercial Office · foto ilustrativa",
        "Servicios · fotografía de referencia externa"
      ],
      [
        "https://images.pexels.com/photos/8440062/pexels-photo-8440062.jpeg?auto=compress&w=1260&h=750&dpr=1",
        "Custom Commercial · foto ilustrativa",
        "Servicios · fotografía de referencia externa"
      ],
      [
        "clean_roll_02_bathroom.webp",
        "Baño listo",
        "Trabajos · baño"
      ],
      [
        "portfolio_kitchen_finished.webp",
        "Cocina terminada",
        "Trabajos · cocina"
      ],
      [
        "portfolio_cleaning_action.webp",
        "Limpieza en acción",
        "Trabajos · acción"
      ],
      [
        "portfolio_living_finished.webp",
        "Sala terminada",
        "Trabajos · sala"
      ],
      [
        "portfolio_bedroom_finished.webp",
        "Dormitorio terminado",
        "Trabajos · dormitorio"
      ],
      [
        "portfolio_pet_friendly.webp",
        "Hogar pet-friendly",
        "Trabajos · mascotas"
      ],
      [
        "cleaner-owner-portrait.webp",
        "Retrato de profesional",
        "Equipo · presentación"
      ],
      [
        "final_living_room_overhead.jpg",
        "Sala final luminosa",
        "Cierre · foto"
      ]
    ]
  },
  "la-vie-in-pink": {
    "base": "https://thelaunchera.com/demos/la-vie-in-pink/resources/",
    "brand": "La Vie in Pink",
    "style": "fotografía editorial de pastelería europea premium, croissants gourmet, panadería artesanal, porcelana cálida, marrón oscuro, rojo vino, blanco marfil y olivo; luz natural auténtica, personas reales y escenas diferentes",
    "items": [
      [
        "36a1bfe5-3660-4b7e-964d-8031fe824941.png",
        "Fachada de La Vie in Pink",
        "Hero · fachada de la tienda"
      ],
      [
        "8572492e-4032-4e82-a5d3-7e087ec38613.png",
        "Croissant gourmet",
        "Colección · croissants"
      ],
      [
        "28efa0a2-eefe-40b3-9398-b25bb8e0532a.png",
        "Desayuno europeo",
        "Colección · desayunos"
      ],
      [
        "3ab35897-f8f3-4dcb-bc98-3ed74cc6aa16.png",
        "Pâtisserie artesanal",
        "Colección · pastries"
      ],
      [
        "4d3f2997-94a4-4af4-826d-bd40f493cb62.png",
        "Persona del equipo en el obrador",
        "Historia · equipo"
      ],
      [
        "0a8472e4-57b2-4259-81cb-0b3e156e09c6.png",
        "Interior de la boutique",
        "Historia · local"
      ],
      [
        "07f9bcb7-9784-42d5-b155-cd42ec3d207c.png",
        "Personas en la cafetería",
        "Experiencia · clientes"
      ],
      [
        "d27af730-b413-4fa8-8502-84431ef687eb.png",
        "Pasteles para regalar",
        "Colección · gifting"
      ],
      [
        "bdea766e-ea26-4756-9a9f-659d473627ef.png",
        "Desayuno para dos",
        "Colección · compartir"
      ],
      [
        "3674f67a-abe7-4116-b01c-19afb41ae3d5.png",
        "Brunch europeo",
        "Colección · hero de desayunos"
      ]
    ]
  }
} as const;
export const additionalDemoPhotos:Record<string,FinishedDemoPhoto[]> = Object.fromEntries(
 Object.entries(photoData).map(([id,collection])=>[id,collection.items.map((photo,index)=>({
  key:id+'-'+index,
  title:photo[1],
  placement:photo[2],
  url:photo[0].startsWith('https://')?photo[0]:photo[0].startsWith('/')?'https://thelaunchera.com'+photo[0]:collection.base+photo[0],
  prompt:photo[2].includes('foto original')||id==='cb-depot' ? 'Referencia existente de un proyecto. No regeneres ni modifiques la imagen del cliente o diseñadora sin autorización. Si necesitas una imagen nueva de práctica, crea una fotografía ORIGINAL con la misma función visual: '+photo[1]+'.' : 'Generate exactly ONE independent high-resolution photographic asset for a fictional '+collection.brand+' practice website. Subject: '+photo[1]+'. Placement: '+photo[2]+'. Art direction: '+collection.style+'. Photorealistic/editorial, clean composition, natural details, no collage, no text, no watermark. Do not recreate an actual person without their photo and permission.'
 }))])
);

export const additionalDemoPrompts:Record<'jaramillo-boutique'|'yummm'|'experience-cleaning'|'cb-depot'|'la-vie-in-pink',DemoRebuildPrompt[]> = {
  "jaramillo-boutique": [
    {
      "title": "01 · Preparar el proyecto de práctica",
      "step": "01",
      "say": "Voy a partir de una página vacía y definir la boutique antes de diseñar.",
      "show": "Crear proyecto nuevo y mostrar header vacío.",
      "prompt": "Crea una web de demostración para Jaramillo Boutique, editorial fashion boutique en Nueva York. Debe ser responsive, en inglés con selector de español, sin pedidos ni pagos reales. Configura solo header, navegación, estructura del hero, colecciones, historia de diseñadora, looks, ubicación ilustrativa y footer. No llenes todo todavía."
    },
    {
      "title": "02 · Identidad y tipografía",
      "step": "02",
      "say": "La marca se debe sentir como una revista de moda, no como una tienda genérica.",
      "show": "Comparar dos titulares y espacios en blanco.",
      "prompt": "Diseña el sistema visual de Jaramillo Boutique: títulos serif de alto contraste, texto sans limpio, marfil y carbón, proporciones editoriales, fotografías de moda grandes y espacios generosos. Mobile-first a 375px, botones consistentes y un CTA único por sección."
    },
    {
      "title": "03 · Hero con composición libre",
      "step": "03",
      "say": "El punto especial es que la modelo sobresale del bloque, como portada de revista.",
      "show": "Enseñar hero y cómo flota la modelo sobre el fondo.",
      "prompt": "Construye un hero fashion editorial con modelo recortada en WebP transparente, overflow visible, imagen extendida por encima del bloque beige, foto de fondo independiente y un titular que no tape su cara. La versión móvil debe mantener el recorte sin desplazamientos ni saltos."
    },
    {
      "title": "04 · Fotografías reales y colecciones",
      "step": "04",
      "say": "Usamos las fotos ya aprobadas, sin inventar ropa que no esté disponible.",
      "show": "Abrir galería de fotos y enseñar prendas por colección.",
      "prompt": "Prepara colecciones editoriales: jeans colombianos, blusas, corsés, looks de noche, calzado y cápsulas estacionales. Usa únicamente imágenes existentes aprobadas como referencias; no presentes fotos generadas como inventario real. Añade alt text descriptivo y tamaños WebP adecuados."
    },
    {
      "title": "05 · La diseñadora y sus tres ubicaciones",
      "step": "05",
      "say": "Su historia es parte del valor de la boutique, pero los datos deben estar confirmados.",
      "show": "Mostrar bloque de diseñadora y sección locations.",
      "prompt": "Crea una sección About the Designer con retrato original proporcionado por la dueña. No cambies identidad ni rostro. Diseña tres tarjetas de localización para Nueva York, pero usa marcadores de ejemplo hasta que la clienta confirme direcciones y horarios. Nunca inventes biografía, testimonios o disponibilidad."
    },
    {
      "title": "06 · Favoritos y tallas",
      "step": "06",
      "say": "Podemos enseñar cómo elegir estilos sin cobrar ni fingir una compra.",
      "show": "Probar selector de talla, favoritos y mensajes visibles.",
      "prompt": "Añade selector de tallas y favoritos locales de demostración que se puedan activar y desactivar. No proceses pagos, no pidas datos sensibles, no crees inventario falso. Los botones deben tener estados visibles y funcionar al tacto."
    },
    {
      "title": "07 · Bilingüe, móvil y revisión",
      "step": "07",
      "say": "Terminamos probando como una clienta que llega desde Instagram.",
      "show": "Probar 375px, tablet, idioma ES/EN y enlaces.",
      "prompt": "Revisa accesibilidad, traducción de todos los textos visibles EN/ES, contraste, jerarquía, velocidad de carga, saltos de layout, alt text, menú táctil y la experiencia a 375px. Comprueba que no existan botones sin acción. Indica explícitamente que es demo."
    }
  ],
  "yummm": [
    {
      "title": "01 · Concepto y maqueta vacía",
      "step": "01",
      "say": "Una bakery debe abrir el apetito desde el primer segundo.",
      "show": "Enseñar estructura antes de agregar productos.",
      "prompt": "Crea un proyecto nuevo YUMMM: coffee, bakery & sweets. Web de demostración en inglés con diseño alegre premium, crema y rojo YUMMM, titular redondeado, tipografía legible y estructura hero, categorías, counter, proceso, take-home, moments y footer. No hay pedidos ni cobros reales."
    },
    {
      "title": "02 · Branding y hero animado",
      "step": "02",
      "say": "En vez de una sola foto, contamos una mini historia con fotos reales.",
      "show": "Probar tres slides del hero sin romper el texto.",
      "prompt": "Arma un hero elegante con transiciones suaves entre fachada de cafetería, iced latte y bolsas/cajas. Respeta prefers-reduced-motion, reserva el espacio de imagen para evitar parpadeo, optimiza carga inicial y no pongas elementos detrás del banner."
    },
    {
      "title": "03 · Productos y fotos individuales",
      "step": "03",
      "say": "Cada producto debe verse con su imagen, nombre y precio de ejemplo.",
      "show": "Abrir imágenes del catálogo y elegir cookies, coffee, bakery.",
      "prompt": "Crea categorías Coffee, Cookies y Bakery con cards compactas y fotografías individuales. Usa las imágenes aprobadas de YUMMM, no collages. Etiqueta precios como SAMPLE, usa descripciones breves y controles táctiles legibles. Nunca afirmes que acepta órdenes reales."
    },
    {
      "title": "04 · Caja de muestra",
      "step": "04",
      "say": "La experiencia interactiva necesita sumar bien, sin cobrar.",
      "show": "Añadir dos productos y cambiar cantidades.",
      "prompt": "Implementa selección de productos, incrementar y disminuir cantidades, eliminar artículo y subtotal de muestra con cálculos correctos. Mantén estado en el navegador, muestra carrito vacío correctamente y aclara visualmente que es una simulación. No integrar pagos ni checkout."
    },
    {
      "title": "05 · Proceso y fotos de la marca",
      "step": "05",
      "say": "Estas escenas cuentan el proceso y hacen que la web se sienta real.",
      "show": "Mostrar Mix, Scoop, Bake y Box con sus fotografías.",
      "prompt": "Crea sección visual de cuatro pasos: Mix, Scoop, Bake y Box, con fotografías distintas de masa, bandeja, horno y empaques. Añade sección Moments con vitrina, fachada, delantal rojo y packaging. Mantén continuidad de marca sin repetir imágenes en tarjetas consecutivas."
    },
    {
      "title": "06 · Galería y packaging",
      "step": "06",
      "say": "La gente también compra con los ojos: todo debe sentirse consistente.",
      "show": "Comparar empaque, coffee y catálogo en móvil.",
      "prompt": "Diseña galería editorial de productos y empaques YUMMM con recortes variados y alt text, sin mezclar fotografías de otros negocios. Evita barras de texto gigantes y tarjetas de tamaño mayor que el hero."
    },
    {
      "title": "07 · QA completo",
      "step": "07",
      "say": "Vamos a tocar cada botón y revisar que la página funcione de verdad.",
      "show": "Probar hero, filtros, counter, móvil y scroll.",
      "prompt": "Prueba filtros del counter, cantidades, subtotal, imágenes de galería, enlaces, navegación, 375px y teclado. Corrige imágenes rotas, productos repetidos, elementos superpuestos, botones grandes y scroll horizontal. Mantén aviso de demo sin pagos reales."
    }
  ],
  "experience-cleaning": [
    {
      "title": "01 · Estructura del customer journey",
      "step": "01",
      "say": "Este demo debe enseñar el recorrido completo de una solicitud ficticia.",
      "show": "Mostrar página vacía y las secciones principales.",
      "prompt": "Crea una web de práctica de un cleaning business ficticio, en inglés, mobile-first, con hero, servicios residencial y comercial, fotos de trabajos, proceso de booking de muestra, solicitud de estimado y visualización educativa del Command Center. Todo debe operar en modo DEMO sin crear reservas auténticas."
    },
    {
      "title": "02 · Hero y propuesta clara",
      "step": "02",
      "say": "El visitante debe entender qué se limpia y qué debe tocar.",
      "show": "Enseñar hero con la cleaner y un CTA pequeño.",
      "prompt": "Diseña hero con foto de profesional limpiando una vivienda luminosa y texto que explique qué es, para quién y el siguiente paso. Aplica paleta TLE warm ivory y soft black, un CTA de ejemplo visible, texto accesible y sin overlays tapando botones."
    },
    {
      "title": "03 · Servicios con fotografía",
      "step": "03",
      "say": "Cada tarjeta necesita una foto y una explicación concreta.",
      "show": "Comparar Residential, Deep Clean, Move-In/Out, Office.",
      "prompt": "Crea tarjetas de servicios de limpieza con fotografía individual, una frase clara y opción de demostración. Incluye residential recurring, deep cleaning, move-in/out y office estimate. No dejes contenedores vacíos ni fotos rotas; cada tarjeta debe tener imagen real de referencia."
    },
    {
      "title": "04 · Reserva residencial simulada",
      "step": "04",
      "say": "Aquí mostramos por qué un sistema evita que se pierda la información.",
      "show": "Probar seleccionar servicio, fecha y datos ficticios.",
      "prompt": "Construye un flujo interactivo SOLO DE PRÁCTICA: elegir servicio, fecha de muestra, tamaño de casa y contacto ficticio, revisar resumen y confirmar simulación local. No enviar correos, no escribir en bases de datos, no realizar cobros ni reservar horarios reales."
    },
    {
      "title": "05 · Estimado comercial y Command Center",
      "step": "05",
      "say": "Un estimado comercial es distinto a una reserva residencial.",
      "show": "Mostrar formulario comercial y vista educativa del dashboard.",
      "prompt": "Separa Request Commercial Estimate de Residential Booking. Presenta campos mínimos de muestra y un Command Center ficticio con bookings, clients, quotes y follow-ups de ejemplo, sin conectar a datos privados ni generar leads reales. Añade una explicación simple de cada pantalla."
    },
    {
      "title": "06 · Portafolio y fotos finales",
      "step": "06",
      "say": "Las imágenes prueban visualmente el resultado del servicio.",
      "show": "Abrir cocina, baño, sala y mascota en la galería.",
      "prompt": "Construye galería responsive con fotografías del cleaning demo: cocina, baño, living, bedroom, limpieza en acción y pet-friendly. Usa WebP optimizado, lazy loading, alt text y evita repetir la misma escena."
    },
    {
      "title": "07 · Sonny y prueba móvil",
      "step": "07",
      "say": "Sonny es una guía del demo, no debe prometer acciones que no realiza.",
      "show": "Abrir Sonny, revisar CTA y scroll en iPhone.",
      "prompt": "Integra a Sonny como ayudante visual educativo con respuestas de muestra sin credenciales privadas, sin envíos reales y sin modificar datos. Revisa fotos de servicios, botón principal, cambios de idioma, validación de formularios, 375px y que toda interacción sea simulada."
    }
  ],
  "cb-depot": [
    {
      "title": "01 · Crear una práctica separada del cliente",
      "step": "01",
      "say": "Este es un trabajo entregado: no vamos a tocar sus reservas reales.",
      "show": "Abrir proyecto de práctica sin conectar producción.",
      "prompt": "Crea un proyecto de aprendizaje NUEVO con marca ficticia de mobile detailing, inspirado en estructura de CB Depot pero sin copiar datos del cliente. No conectar formularios reales, clientes, dominios, pagos, correo ni backend de producción. Solo estructura educativa responsive."
    },
    {
      "title": "02 · Hero y estilo de detailing",
      "step": "02",
      "say": "La foto del auto debe explicar el servicio rápidamente.",
      "show": "Comparar hero desktop y mobile de referencia.",
      "prompt": "Diseña hero de mobile car detailing con fotografía de vehículo brillante, marca ficticia visible, navegación sencilla, propuesta de valor clara y CTA de cotización de muestra. Paleta premium de automóvil, tipografía fuerte, atención a recortes móviles."
    },
    {
      "title": "03 · Fotografías de servicios",
      "step": "03",
      "say": "Exterior, interior y pintura deben poder diferenciarse por foto.",
      "show": "Abrir cuatro categorías y sus referencias visuales.",
      "prompt": "Crea catálogo ilustrativo de servicios Exterior, Interior, Paint Care y Full Detail con fotografías individuales y descripciones sin precios inventados. Mantén las imágenes como referencia educativa; no uses assets del cliente para comercializar otra marca."
    },
    {
      "title": "04 · Recorrido de solicitud",
      "step": "04",
      "say": "Aquí mostramos la experiencia, no reservamos al cliente.",
      "show": "Simular servicio y solicitud en la copia educativa.",
      "prompt": "Construye un formulario local de práctica para elegir servicio y describir vehículo. Confirmación solo en pantalla, sin capturar PII real, sin correo, sin CRM, sin enviar mensajes ni solicitar citas en el sitio del cliente."
    },
    {
      "title": "05 · Marca y personaje",
      "step": "05",
      "say": "El personaje ayuda a diferenciar el concepto, no necesita distraer.",
      "show": "Mostrar logo y mascota con espacios consistentes.",
      "prompt": "Diseña una sección de identidad con un personaje automotriz original diferente al logo protegido del cliente. Crea favicon, escala de botones y estados accesibles; conserva las fotos existentes únicamente como referencia de estudio privado."
    },
    {
      "title": "06 · QA y protección del sitio real",
      "step": "06",
      "say": "Antes de terminar revisamos qué enlaces siguen siendo solo de práctica.",
      "show": "Inspeccionar rutas, botones y consola a 375px.",
      "prompt": "Prueba 375px, tablets, fotos, textos, focus, menú y simulación del formulario; comprueba que no haya URLs de producción, webhooks, claves, datos de clientes ni destinos de correo. Mostrar aviso visible: Ejercicio ficticio, no aceptar citas."
    }
  ],
  "la-vie-in-pink": [
    {
      "title": "01 · Crear el website en un solo prompt",
      "step": "01 · Prompt maestro",
      "say": "Voy a pedirle a ChatGPT que construya la web completa usando AppDeploy. No voy a instalar ni programar nada manualmente.",
      "show": "Pegar el prompt maestro en ChatGPT con AppDeploy conectado; abrir la primera URL de vista previa y comprobar que existe el website.",
      "prompt": "Actúa como diseñador web senior, director de arte y desarrollador de apps. Usa el conector de AppDeploy en ChatGPT para CONSTRUIR Y PUBLICAR la primera versión de un website responsive llamado LA VIE IN PINK. No me des solo código o instrucciones: haz la web y entrega una URL visible. Es una demostración de pâtisserie europea con croissants gourmet, desayunos europeos, pastries y regalos. Audiencia: personas que extrañan sabores europeos. Estilo premium, editorial y humano; paleta marrón oscuro, rojo vino, blanco marfil y acentos oliva. Móvil primero (375 px), fotografía como punto focal. Secciones: header con selector EN/ES, hero que exprese qué ofrece la tienda, categorías/productos con fotos individuales, desayunos para compartir, historia y equipo, ambiente de la tienda, propuesta de membresía SOLO como vista previa, preguntas frecuentes, contacto por botón (no sheet flotante) y footer con 'Powered by The Launch Era'. Copy completo y natural en ambos idiomas, sin inventar testimonios, direcciones, horarios ni precios finales. No activar pagos, pedidos reales, email, automatizaciones ni formularios que envíen datos. El video en el hero sería un bono posterior, NO forma parte de la web base. Completa una primera versión y devuelve la URL."
    },
    {
      "title": "02 · Colocar las 10 fotos originales del demo",
      "step": "02 · Fotografía",
      "say": "Ahora usamos las fotos que ya existen, una para cada sección. Las imágenes no se confunden ni se sustituyen por otras al azar.",
      "show": "Abrir la colección de 10 fotografías de este kit y sustituir cada imagen por su URL original en AppDeploy.",
      "prompt": "Actualiza únicamente las imágenes de LA VIE IN PINK en AppDeploy. Utiliza las DIEZ URLs del kit de fotos de este proyecto, respetando su ubicación original: fachada en hero, croissant, desayuno, pastry, equipo, interior, clientes, regalo, desayuno para dos y brunch. Cada foto debe ser individual y distinta. Preserva textos, layouts, selector ES/EN y demás funcionalidades. Añade alt text, recorte mobile natural y lazy loading donde corresponda. No crees collages, no generes imágenes nuevas y no edites otros demos."
    },
    {
      "title": "03 · Comprobar idiomas, colección y contacto",
      "step": "03 · Interacción",
      "say": "La tienda debe poder verse en español e inglés de principio a fin, y los botones tienen que llevar a una sección real.",
      "show": "Cambiar EN/ES, explorar categorías, probar botones y abrir contacto.",
      "prompt": "Revisa LA VIE IN PINK a 375px y escritorio. Comprueba que menú, títulos, descripciones, colección, FAQ, membresía demostrativa, botones y footer cambien completamente entre español e inglés, sin mezclar idiomas. Conecta los botones a sus secciones; el botón Contact debe abrir una sección de contacto dentro del website, no un sheet. Señala con claridad que la membresía, pedidos y pagos son vistas demostrativas y que no existen compras activadas. No alteres el arte visual aprobado."
    },
    {
      "title": "04 · QA y entrega",
      "step": "04 · Publicación",
      "say": "Cierro tocando cada enlace y comparando la versión publicada con las fotografías de referencia. Solo después comparto la URL.",
      "show": "Probar menú, galería, responsive y URL https://thelaunchera.com/demos/la-vie-in-pink/.",
      "prompt": "Haz QA de LA VIE IN PINK: enlaces, contacto, navegación por teclado, contraste, tamaño de botones, ausencia de scroll horizontal, carga de las diez imágenes y traducción bilingüe. Comprueba que en 375px no se recorte el croissant ni se superpongan títulos. Mantén footer 'Powered by The Launch Era'. Corrige únicamente errores encontrados y entrégame la URL final. No habilites cobros ni mensajes reales."
    }
  ]
};

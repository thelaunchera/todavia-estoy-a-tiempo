import type {FinishedDemoPhoto} from './finished-demo-resources';
import type {DemoRebuildPrompt} from './demo-rebuild-prompts';
/** Sneekiefs uses ONLY existing approved Drive imagery published in the canonical demo.
 * The following prompts are reconstruction guidance, not source-generation originals. */
export const sneekiefsDrive='https://drive.google.com/drive/folders/16UZbyKYJKMkOQXWozE2mUsXp2d4FFdOy';
export const sneekiefsWebpDrive='https://drive.google.com/drive/folders/1DaAA7c4cWj2-P037BtckoZwd-EXVfkXf';
export const sneekiefsSite='https://thelaunchera.com/demos/sneekiefs/';
export const sneekiefsRepo='https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/public/demos/sneekiefs';
export const sneekiefsPalette={canyonSkyBlue:'#168DD2',sandstoneOrange:'#D65A24',ivory:'#FAF8F3',ink:'#16212D'} as const;
export const sneekiefsPhotos:FinishedDemoPhoto[]=[
  {
    "key": "sneekiefs-01",
    "title": "Sneekiefs · azul estudio",
    "placement": "Catálogo · Canyon Classic",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/01-studio-shoe.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage, sin cambiar la marca ni sus materiales. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24, marfil y azul marino. Photorealistic studio product photograph of a matching pair of navy blue suede Sneekiefs low-top sneakers with ivory stripes and warm gum soles on stacked bright blue studio plinths. Side daylight and crisp genuine material textures, horizontal 3:2 image, one scene only, do not invent an unrelated brand."
  },
  {
    "key": "sneekiefs-02",
    "title": "Sneekiefs · par en luz natural",
    "placement": "Catálogo · City Court",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/02-product-natural.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage, sin cambiar la marca ni sus materiales. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24, marfil y azul marino. Photorealistic editorial product shot of two navy blue and cream Sneekiefs court sneakers, warm gum outsole, on pale sunlit concrete. Palm shadows, soft coastal light, visible suede and leather texture, natural styling, no graphical UI."
  },
  {
    "key": "sneekiefs-03",
    "title": "Sneekiefs · detalle de cordones",
    "placement": "The Street Edit · detalle",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/03-detail-macro.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage, sin cambiar la marca ni sus materiales. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24, marfil y azul marino. Tight editorial macro of one navy suede and cream Sneekiefs shoe, beige laces and textured leather, warm neutral side light, detailed stitching and branded tongue, natural shape, individual photograph."
  },
  {
    "key": "sneekiefs-04",
    "title": "Sneekiefs · en movimiento",
    "placement": "The Street Edit · vida urbana",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/04-street-motion.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage, sin cambiar la marca ni sus materiales. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24, marfil y azul marino. Natural 35mm street photography crop from waist down of one person in loose cream trousers and navy Sneekiefs sneakers walking on sunlit urban pavement; candid real gait, comfortable realistic shoes, architecture and greenery in background."
  },
  {
    "key": "sneekiefs-05",
    "title": "Sneekiefs · accesorios streetwear",
    "placement": "The Street Edit · cultura urbana",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/05-streetwear-flatlay.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage, sin cambiar la marca ni sus materiales. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24, marfil y azul marino. Premium streetwear top-down still life: navy Sneekiefs suede sneakers with cream stripes, branded navy cap, ivory striped socks and black-and-white street-culture magazine on pale textured floor. One cohesive editorial photo."
  },
  {
    "key": "sneekiefs-06",
    "title": "Sneekiefs · modelo editorial",
    "placement": "Sección de campaña · estilo de vida",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/06-model-campaign.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage, sin cambiar la marca ni sus materiales. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24, marfil y azul marino. Authentic lifestyle fashion campaign photograph of one young adult woman in cream sweatshirt, loose dark navy trousers, sunglasses and blue-and-cream Sneekiefs sneakers, seated on urban concrete steps, sneakers clear, natural anatomy and sunlight."
  },
  {
    "key": "sneekiefs-07",
    "title": "Sneekiefs · póster principal",
    "placement": "Hero editorial · portada",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/07-editorial-poster.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage, sin cambiar la marca ni sus materiales. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24, marfil y azul marino. Editorial sneaker brand poster concept with adult model seated on steps wearing navy-and-cream Sneekiefs shoes, bold typographic sneaker lettering behind the model, neutral stone and sandstone-orange accents. Use existing approved image rather than recreating lettering; this prompt is conceptual guidance."
  },
  {
    "key": "sneekiefs-08",
    "title": "Sneekiefs · zapatilla naranja",
    "placement": "Catálogo · Sandstone Low",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/08-orange-sneaker.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage, sin cambiar la marca ni sus materiales. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24, marfil y azul marino. Realistic high-end product shot of a single bright sandstone-orange suede Sneekiefs low sneaker, cream textile and laces, warm tan outsole, against vivid burnt-orange studio backdrop with natural directional shadow, accurate footwear and proportions."
  },
  {
    "key": "sneekiefs-09",
    "title": "Sneekiefs · detalle editorial azul",
    "placement": "Campaña ampliada · detalle azul",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/editorial-closeup.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage ni marcas nuevas. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24. Fotografía editorial macro de la zapatilla azul Sneekiefs con materiales reales, encuadre natural y textura fiel al archivo aprobado."
  },
  {
    "key": "sneekiefs-10",
    "title": "Sneekiefs · póster de detalles",
    "placement": "Campaña ampliada · perfil del producto",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/sneaker-features.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage ni marcas nuevas. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24. Póster original Sneekiefs con sneaker azul y naranja y composición tipográfica editorial; conservar el arte aprobado sin rehacer textos."
  },
  {
    "key": "sneekiefs-11",
    "title": "Sneekiefs · Everyday Originals",
    "placement": "Campaña ampliada · póster de colección",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/everyday-poster.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage ni marcas nuevas. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24. Imagen de campaña con Sneekiefs Everyday Originals y dirección de arte de estudio, sin añadir otras marcas ni modificar el material existente."
  },
  {
    "key": "sneekiefs-12",
    "title": "Sneekiefs · The Classic Line",
    "placement": "Campaña ampliada · póster de clásicos",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/classics-poster.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage ni marcas nuevas. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24. Póster The Classic Line con zapatilla azul de gamuza, fotografía de producto y lettering original de Sneekiefs, sin recortar texto."
  },
  {
    "key": "sneekiefs-13",
    "title": "Sneekiefs · par azul sobre tela",
    "placement": "Campaña ampliada · fotografía vertical",
    "url": "https://thelaunchera.com/demos/sneekiefs/assets/blue-pair-closeup.webp",
    "prompt": "Prompt orientativo de recreación (NO es el prompt original ni sustituye la fotografía aprobada). Una fotografía individual, sin collage ni marcas nuevas. Paleta Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24. Fotografía vertical de par de zapatillas azules Sneekiefs sobre tela azul, enfoque en textura de gamuza y cordones, materiales naturales."
  }
];
export const sneekiefsRebuildPrompts:DemoRebuildPrompt[]=[
  {
    "title": "00 · Conectar fuentes reales",
    "step": "Drive + GitHub",
    "prompt": "Abre la carpeta Sneekiefs — Website Campaign en Google Drive y localiza Web Optimized: ocho fotografías WebP existentes; localiza además las cinco imágenes de campaña ya optimizadas dentro del demo en GitHub. Reutiliza esos archivos; no crees ni dupliques carpetas, y no regeneres fotos. Comprueba el repo oficial thelaunchera/the-launch-era-new-website-, directorio public/demos/sneekiefs/. La fuente de verdad es el demo y sus archivos originales, no los ejemplos temporales OFFCOURT.",
    "say": "Primero identifico la marca y los recursos existentes. El nombre correcto es Sneekiefs y las fotos ya están optimizadas en su carpeta de Drive.",
    "show": "Abrir Drive > The Launch Era — Demo Photos > Sneekiefs — Website Campaign > Web Optimized; abrir el repositorio de Sneekiefs."
  },
  {
    "title": "01 · Identidad, portada y paleta",
    "step": "Brand Board",
    "prompt": "Reconstruye SOLO la identidad visual Sneekiefs: Canyon Sky Blue #168DD2 y Sandstone Orange #D65A24; secundarios marfil #FAF8F3 y azul marino #16212D. Titulares Archivo Black, UI Space Grotesk y cuerpo DM Sans. Hero editorial con la imagen 07-editorial-poster.webp y el lema MOVE YOUR WAY. Usa las imágenes originales aprobadas; no inventes otro nombre, stock, marcas o collage.",
    "say": "Defino el color y la fotografía antes de tocar el diseño. Compruebo la portada tanto en un iPhone como en pantalla grande.",
    "show": "Comparar el Brand Board Sneekiefs con el hero original y los dos códigos hexadecimales."
  },
  {
    "title": "02 · Catálogo y carrito de demostración",
    "step": "Website",
    "prompt": "Completa la demo Sneekiefs con tres fichas de muestra basadas en las imágenes originales: Canyon Classic (01-studio-shoe.webp), City Court (02-product-natural.webp) y Sandstone Low (08-orange-sneaker.webp). Conserva filtros, selección de talla US, carrito con unidades, vista rápida, ordenación y resumen de pedido simulado. Los precios son ilustrativos y no hay checkout, envío de datos ni pagos reales. Selector EN/ES completamente funcional.",
    "say": "Las tres tarjetas son para demostrar la experiencia, no para anunciar inventario ni aceptar pagos. Pruebo tallas, filtros y carrito sin tarjeta.",
    "show": "Abrir el catálogo y probar añadir y quitar un par, después cambiar a español."
  },
  {
    "title": "03 · Fotos editoriales y revisión final",
    "step": "QA móvil / desktop",
    "prompt": "Conserva el hero y las fotografías 03-detail-macro.webp, 04-street-motion.webp, 05-streetwear-flatlay.webp y 06-model-campaign.webp. Verifica además la galería ampliada con 09-editorial-closeup.webp, 10-sneaker-features.webp, 11-everyday-poster.webp, 12-classics-poster.webp y 13-blue-pair-closeup.webp, siempre sin recortar textos ni duplicar fotos. No dupliques material ya utilizado. Verifica el sitio en 360/390 px, 768/820 px y desktop; corrige recortes, menús y fuentes sin modificar otros demos. Mantén un solo footer y el crédito Powered by The Launch Era. Revisa URL /demos/sneekiefs/ en GitHub Pages, no declares publicación hasta confirmarla.",
    "say": "Esta parte no es generar fotos nuevas: es colocar bien la campaña que ya tenemos y verificar que se vea profesional en todos los tamaños.",
    "show": "Mostrar portada móvil, productos, galería, enlace del demo, repositorio y carpeta original en Drive."
  }
];

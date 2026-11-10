/* Cuatro videos esenciales. Las fichas antiguas de producción siguen archivadas en la base de datos. */
export const CORE_LESSON_CODES=Object.freeze(['01','05','06','08']);

const lessons={
 '01':{
  es:{title:'Crea tus 8 fotos con IA',description:'Primero crea ocho fotografías PNG individuales con un Master Prompt; cuando estén listas, pide a ChatGPT guardarlas en tu carpeta personal de Google Drive y verifica el enlace.'},
  en:{title:'Create your 8 AI photos',description:'First create eight separate PNG photos with one Master Prompt. When they are ready, ask ChatGPT to save them to your personal Google Drive folder and verify the link.'},
  links:[
   {es:'Abrir ChatGPT',en:'Open ChatGPT',url:'https://chatgpt.com/'},
   {es:'Mis archivos en Google Drive',en:'My Google Drive files',url:'https://drive.google.com/drive/u/0/my-drive'}
  ]
 },
 '05':{
  es:{title:'Crea tu web con AppDeploy',description:'Usa el segundo Master Prompt para construir la web en AppDeploy con los ocho PNG confirmados en tu carpeta de Drive. Comprueba el resultado antes de publicar.'},
  en:{title:'Build with AppDeploy',description:'Use the second Master Prompt to build your website in AppDeploy with the eight PNG images verified in your Drive folder. Check before publishing.'},
  links:[
   {es:'Ver AppDeploy y sus planes',en:'See AppDeploy plans',url:'https://appdeploy.ai/pricing'},
   {es:'Ver el ejemplo Casa Brownie',en:'See the Casa Brownie example',url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video'}
  ]
 },
 '06':{
  es:{title:'Mejora tu página',description:'Muestra a ChatGPT una captura y pide corregir fotos, textos o ajustes de móvil, sin rehacer toda la web.'},
  en:{title:'Improve your website',description:'Share a screenshot with ChatGPT to fix photos, copy or mobile layout without rebuilding everything.'},
  links:[
   {es:'Abrir ChatGPT para corregir',en:'Open ChatGPT to make changes',url:'https://chatgpt.com/'},
   {es:'Ejemplo de diseño',en:'Design example',url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video'}
  ]
 },
 '08':{
  es:{title:'Publica y comprueba',description:'Abre el enlace real de tu web como visitante y comprueba el menú, las fotos, los botones y la vista móvil.'},
  en:{title:'Publish and test',description:'Open your live website link as a visitor. Check the menu, photos, buttons and mobile layout.'},
  links:[
   {es:'Abrir ChatGPT para revisar',en:'Open ChatGPT to review',url:'https://chatgpt.com/'},
   {es:'Comparar con Casa Brownie',en:'Compare with Casa Brownie',url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video'}
  ]
 }
};
export function coreLessonText(lesson,language='es'){
 const item=lessons[lesson?.lesson_code];
 return item?item[language==='en'?'en':'es']:null;
}
export function coreLessonLinks(lesson,language='es'){
 return (lessons[lesson?.lesson_code]?.links||[]).map(item=>({label:item[language==='en'?'en':'es'],url:item.url}));
}
export function localizeCoreClassroom(language='es'){
 if(typeof document==='undefined')return;
 const lang=language==='en'?'en':'es';
 document.querySelectorAll('[data-class-es][data-class-en]').forEach(node=>{
  node.textContent=lang==='en'?node.getAttribute('data-class-en'):node.getAttribute('data-class-es');
 });
}

/* Dos Master Prompts en orden: fotos -> guardar en Drive personal -> website con AppDeploy. */
const courseMasterPrompts={
  "01": {
    "es": [
      {
        "prompt_code": "master_photos_01",
        "title": "MASTER PROMPT 1 · Crea 8 fotos individuales",
        "summary": "Primero prepara las 8 fotos con continuidad visual.",
        "body": "Actúa como directora de fotografía editorial y creadora de imágenes para websites. ANTES de construir mi web, prepara con ESTE ÚNICO MASTER PROMPT una serie visual continua y coherente de exactamente OCHO FOTOGRAFÍAS. Nombre de mi marca: [MARCA]. Productos o servicios reales: [OFERTA]. Público: [CLIENTES]. Colores y estilo: [PALETA Y ESTILO]. Usa mis fotos o referencias si las compartí y conserva fielmente mis productos, logo y personas.\n\nLas ocho imágenes deben contar una sola historia de marca con iluminación, tonos, materiales y estilo fotográfico consistentes, pero con composiciones y encuadres DIFERENTES. Planea estas ocho tomas: 01 HERO de portada con espacio para titular; 02–06 cinco fotos distintas de productos, servicios o detalles reales; 07 uso/experiencia de cliente o proceso; 08 empaque, presentación o imagen de cierre. Si mi negocio tiene menos de cinco productos, varía los ángulos de los productos existentes sin inventar servicios o artículos.\n\nDirección visual: fotografía premium fotorrealista, piel y manos naturales, objetos creíbles, luz cuidada y encuadres bien compuestos para iPhone, tablet y desktop. No pongas texto sobre las fotos. Evita collages, cuadrículas, renders artificiales, marcas de agua, logos falsos, modelos repetidos, deformaciones y zoom excesivo.\n\nENTREGA: exactamente OCHO ARCHIVOS PNG INDIVIDUALES en alta calidad, nunca ocho imágenes pegadas en una sola lámina. Nómbralos 01_HERO.png, 02_FOTO.png, 03_FOTO.png, 04_FOTO.png, 05_FOTO.png, 06_FOTO.png, 07_FOTO.png, 08_FOTO.png. Comprueba los archivos y la continuidad de estilo. Si solo puedes generar pocas imágenes por tanda, sigue la MISMA dirección de arte en varias tandas; no me pidas ocho prompts. Cuando estén las ocho, AVÍSAME literalmente: «Las ocho fotos están listas. Ahora copia el siguiente prompt para guardarlas en tu Google Drive personal». No declares terminadas imágenes o PNG inexistentes. Todavía no abras AppDeploy."
      },
      {
        "prompt_code": "drive_save_01",
        "title": "Después de crear las fotos · Guarda en tu Drive",
        "summary": "Pide a ChatGPT guardar los 8 PNG en tu carpeta personal y confirmar el enlace.",
        "body": "ChatGPT: ahora que las ocho fotografías PNG individuales ya están creadas y revisadas, GUÁRDALAS en MI Google Drive personal. Conéctate solo con mi permiso. Busca en «Mi unidad» la carpeta [NOMBRE DE MI NEGOCIO]; reutilízala si ya existe o crea una carpeta con ese nombre si todavía no existe. Dentro usa o crea la subcarpeta «Fotos del website». No las guardes en carpetas compartidas de otros alumnos ni en otras marcas. No sobrescribas imágenes originales ni dupliques archivos.\n\nSube los ocho PNG separados, conserva sus nombres y verifica que cada archivo realmente se abre. Comparte el enlace DIRECTO a la carpeta «Fotos del website» y confirma el conteo de ocho archivos. Solo di «Tus 8 fotos están guardadas en Drive» si pudiste verificarlo. Si falta acceso, permiso o una función para subirlas, explica cuál es el bloqueo y cómo autorizarlo; no afirmes haber guardado nada que no esté allí. Una vez confirmado, indícame: «Ya puedes copiar el Master Prompt 2 y usar esta carpeta de Drive para construir tu web con AppDeploy»."
      }
    ],
    "en": [
      {
        "prompt_code": "master_photos_01",
        "title": "MASTER PROMPT 1 · Create 8 separate photos",
        "summary": "Start with 8 visually consistent individual photos.",
        "body": "Act as an editorial photography director for websites. BEFORE building my site, use THIS ONE MASTER PROMPT to prepare a visually consistent series of exactly EIGHT PHOTOGRAPHS. Brand: [BRAND]. Real products/services: [OFFER]. Audience: [CUSTOMERS]. Colors and style: [PALETTE AND STYLE]. Use my references when supplied, accurately preserving real products, people and logos.\n\nMake eight varied compositions with one consistent visual identity: 01 website HERO with clean space for the headline; 02–06 five distinct real product, service or detail photos; 07 customer experience, use or process; 08 packaging, presentation or campaign closing photo. If I have fewer products, vary real perspectives rather than inventing items.\n\nCreate premium photorealistic editorial photographs with believable hands, materials, natural skin, cohesive lighting and framing for phone, tablet and desktop. No text overlays, watermarks, fake logos, collages, contact sheets, repeated models, distorted anatomy or excessive zoom.\n\nDELIVER exactly EIGHT INDIVIDUAL high-quality PNG FILES, not one grid. Name them 01_HERO.png, 02_PHOTO.png, 03_PHOTO.png, 04_PHOTO.png, 05_PHOTO.png, 06_PHOTO.png, 07_PHOTO.png, 08_PHOTO.png. If the tool limits outputs per batch, continue the SAME creative direction in additional batches, without asking for eight different prompts. Verify the files. After all eight exist, explicitly tell me: 'Your eight photos are ready. Now copy the next prompt to save them to your personal Google Drive.' Never claim files are ready without verification. Do not open AppDeploy yet."
      },
      {
        "prompt_code": "drive_save_01",
        "title": "After the photos · Save to your Drive",
        "summary": "Ask ChatGPT to save the 8 PNGs in your personal folder and verify the link.",
        "body": "ChatGPT: now that all eight individual PNG photos have been created and reviewed, SAVE THEM in MY PERSONAL Google Drive. Use my permission only. Look for the [MY BUSINESS NAME] folder under 'My Drive'; reuse it if it exists or create it if needed. Within that folder use or create 'Website Photos'. Do not save them to another student’s folder or a different brand. Do not overwrite originals or create duplicates.\n\nUpload all eight separate PNGs and confirm each file opens successfully. Give me the DIRECT folder link and verify eight PNGs are there. Say 'Your eight photos are saved in Drive' ONLY after verifying them. If access, permission or upload capability is missing, clearly explain the blocker. Once verified, tell me: 'You can now copy Master Prompt 2 and use this Drive folder to build your website with AppDeploy.'"
      }
    ]
  },
  "05": {
    "es": [
      {
        "prompt_code": "master_web_02",
        "title": "MASTER PROMPT 2 · Website con AppDeploy",
        "summary": "Usa las 8 fotos guardadas y verificadas en tu Google Drive.",
        "body": "Construye mi primera página web para [NOMBRE DEL NEGOCIO] usando @AppDeploy si está conectado y autorizado en mi cuenta. Es una web responsive mobile-first, clara y profesional para [OFERTA] dirigida a [CLIENTES], con estética [PALETA Y ESTILO]. Usa como fuente de imágenes ESTA CARPETA PERSONAL DE GOOGLE DRIVE: [PEGA AQUÍ EL ENLACE DIRECTO QUE CHATGPT ACABA DE CONFIRMAR].\n\nANTES DE EMPEZAR: abre la carpeta con mi permiso, identifica los OCHO PNG separados (01_HERO.png a 08_FOTO.png), comprueba que cada uno corresponde a su sección y usa ESAS MISMAS FOTOS aprobadas. No sustituyas ninguna por stock ni generes otras. Importa las imágenes como recursos reales de la web; no confíes en enlaces privados de Drive que los visitantes no puedan cargar. No publiques mis carpetas privadas ni cambies sus permisos sin autorización. Si no puedes importar los archivos, explícame qué conexión o permiso falta antes de continuar.\n\nDISEÑO: portada editorial con 01_HERO.png y una frase que explique mi oferta, un CTA claro [ACCIÓN DEL CLIENTE], productos/servicios con las fotos 02 a 06, experiencia/proceso con 07, detalle final con 08, y footer con navegación. Usa textos reales aprobados; no inventes precios, testimonios, dirección o políticas. Navegación y botones funcionales, fotos bien encuadradas y sin scroll horizontal en iPhone o tablet. No actives cobros ni recopilación de datos sin mi autorización.\n\nMuéstrame una vista previa, prueba todos los enlaces y confirma que aparecen las ocho fotos correctas. Solo entrega una URL HTTPS como publicada después de comprobar que abre realmente y carga las fotografías. Si AppDeploy no está accesible, explica la opción compatible en lugar de fingir que se publicó."
      }
    ],
    "en": [
      {
        "prompt_code": "master_web_02",
        "title": "MASTER PROMPT 2 · Build with AppDeploy",
        "summary": "Use your 8 verified PNG files from Google Drive.",
        "body": "Build my first website for [BUSINESS NAME] using @AppDeploy if connected and authorized in my account. Make it a professional, responsive, mobile-first website for [OFFER] and [AUDIENCE], with [PALETTE AND STYLE]. Use the images from MY PERSONAL GOOGLE DRIVE FOLDER: [PASTE THE DIRECT FOLDER LINK CHATGPT JUST VERIFIED].\n\nBEFORE BUILDING: with my authorization, open that folder and verify EIGHT SEPARATE PNGs (01_HERO.png through 08_PHOTO.png). Use THOSE EXACT approved images, not stock substitutes or new AI photos. Import them as actual website assets; private Drive links must not break for public visitors. Never expose my private Drive folder or change sharing settings without permission. If the import cannot work, explain which access or capability is missing.\n\nLAYOUT: editorial hero using 01_HERO.png and a clear primary CTA [CUSTOMER ACTION]; products/services using 02–06; experience or process with 07; final branded detail with 08; and a clear footer. Keep my approved copy and factual details, do not invent prices, addresses, testimonials or legal policies. Make the menu, CTA and buttons work, ensure good mobile/tablet framing and no horizontal scrolling. Never enable payments or personal-data collection without my permission.\n\nShow a preview, test all actions and verify all eight images render. Give me a real HTTPS live URL ONLY once you have checked it loads. If AppDeploy is unavailable, explain a compatible route rather than claiming it was published."
      }
    ]
  }
};
export function coreMasterPrompts(lessonCode,language='es'){
 const set=courseMasterPrompts[lessonCode];
 return set?(set[language==='en'?'en':'es']).map(item=>({...item,isCoreMaster:true})):[];
}

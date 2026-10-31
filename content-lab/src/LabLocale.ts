/**
 * Latin-American Spanish / English UI translations for Content Lab.
 * Works with existing React screens without translating members' written copy,
 * account names, graphics, captions, or generated images.
 */
export type LabLanguage='es'|'en';
const pairs:[string,string][]=[
 ['Overview','Inicio'],['Create content','Crear contenido'],['Carousel Factory','Fábrica de carruseles'],
 ['1 Photo → 9 Posts','1 foto → 9 posts'],['Stickers PNG · gratis','Stickers · gratis'],
 ['Backgrounds · gratis','Fondos · gratis'],['Prompt Studio · 30 Recipes','Estudio de prompts · 30 recetas'],
 ['1 Product → 8 Prompts','1 producto → 8 prompts'],['My content','Mis publicaciones'],['Media library','Biblioteca de fotos'],
 ['Creative formats','Formatos creativos'],['Brand settings','Configuración de marca'],
 ['YOUR ACCOUNTS','TUS CUENTAS'],['WORKSPACE','ESTUDIO'],['MY WORKSPACE','MI ESTUDIO'],
 ['YOUR PRIVATE CREATIVE SPACE','TU ESPACIO CREATIVO PRIVADO'],['Less scrolling.','Menos desplazarte.'],
 ['More creating.','Más crear.'],['A thoughtful home for your ideas, brands and content.','Un espacio para tus ideas, marcas y publicaciones.'],
 ['CREATE','CREAR'],['CURATE','ORGANIZAR'],['PUBLISH','PUBLICAR'],
 ['Create','Crear'],['Good content starts with intention.','El buen contenido empieza con intención.'],
 ['Less noise, more meaning.','Menos ruido, más intención.'],['My private workspace','Mi espacio privado'],
 ['Sign out','Cerrar sesión'],['PRIVATE','PRIVADO'],
 ['New content','Nuevo contenido'],['Start fresh','Empezar de nuevo'],['Create content','Crear contenido'],
 ['Set the direction','Define la idea'],['What should we talk about?','¿Sobre qué quieres hablar?'],
 ['Format','Formato'],['Content angle','Enfoque del contenido'],
 ['Generate with AI','Generar con IA'],['Creating your content…','Creando contenido…'],
 ['Refine the words','Trabaja los textos'],['Internal title *','Título interno *'],
 ['Cover hook','Frase de portada'],['ALTERNATIVE HOOKS','OTRAS FRASES DE PORTADA'],
 ['Slides / Script','Slides / Guion'],['Caption','Descripción'],['CTA','Llamada a la acción'],
 ['Visual direction','Dirección visual'],['Copy content','Copiar contenido'],
 ['Save & organize','Guardar y organizar'],['Status','Estado'],['Planned date','Fecha prevista'],
 ['Update saved post','Actualizar publicación'],['Save to my library','Guardar en mi biblioteca'],
 ['COVER PREVIEW','VISTA PREVIA'],['Your graphic direction','Tu composición'],
 ['Real photo / screenshot','Foto real / captura'],['Upload','Subir'],['Remove','Quitar'],
 ['Ready','Listo'],['Published','Publicado'],['Draft','Borrador'],
 ['Ready to publish','Listo para publicar'],['Idea','Idea'],
 ['Search posts…','Buscar publicaciones…'],['Saved draft','Borrador guardado'],
 ['Nothing here yet.','Todavía no hay publicaciones.'],['Start with one meaningful idea.','Empieza por una idea que quieras compartir.'],
 ['Only publications belonging to','Solo publicaciones de'],['Everything you\'ve','Todo lo que has'],
 ['made.','creado.'],['A new idea waiting for your voice.','Una idea que espera tu voz.'],
 ['Delete post','Eliminar publicación'],['Edit post','Editar publicación'],
 ['Name this idea','Ponle nombre a esta idea'],['A clear, specific opening…','Una frase clara que conecte…'],
 ['One slide or talking point per line…','Un slide o idea por línea…'],
 ['Write like a human, not a template…','Escribe natural, sin sonar a plantilla…'],
 ['What should they do next?','¿Qué quieres que hagan después?'],
 ['Which photo or screenshot makes the story clearer?','¿Qué foto o captura explica mejor la idea?'],
 ['What are you creating today?','¿Qué quieres crear hoy?'],
 ['Start with an idea, we\'ll help you shape it.','Empieza con una idea y dale forma.'],
 ['YOUR CONTENT COLLECTION','TUS PUBLICACIONES'],['YOUR BRAND','TU MARCA'],
 ['YOUR VISUAL PRODUCTION SPACE','TU ESTUDIO DE DISEÑO'],
 ['Select a brand','Selecciona una marca'],['Personal workspace','Espacio personal'],
 ['Add another account','Añadir otra cuenta'],['A fresh voice, a separate space.','Otra marca, otro espacio.'],
 ['Edit','Editar'],['Save','Guardar'],['Delete','Eliminar'],
 ['Copy','Copiar'],['Download','Descargar'],['Search','Buscar'],
 ['AI credits · Tu saldo','Créditos IA · Tu saldo'],
 ['Media','Fotos y archivos'],['Assets','Recursos'],
 ['Image Lab','Estudio de imágenes'],['Create new','Crear nueva'],['Photo variation','Variación de foto'],
 ['A photo that looks like you','Una foto que se vea como tú'],
 ['Add color','Añadir color'],['Brand color','Color de marca'],
 ['Your Brand Kit','Tu kit de marca'],['Add image','Añadir imagen'],
 ['Back','Volver'],['Next','Siguiente'],['Previous','Anterior'],
 ['Next slide','Siguiente slide'],['Add slide','Añadir slide'],
 ['Main headline','Título principal'],['Small heading','Etiqueta'],
 ['Supporting copy (optional)','Texto de apoyo'],['Photo frames','Marcos para fotos'],
 ['Preview','Vista previa'],['Live design preview','Vista previa del diseño'],
 ['Download slide','Descargar slide'],['Prepare PNG','Preparar PNG'],
 ['Background','Fondo'],['Backgrounds','Fondos'],['Images','Imágenes'],
 ['Your story.','Tu historia.'],['Text','Texto'],['Shapes','Formas'],
 ['Font','Tipografía'],['Accent color','Color de acento'],
 ['Step 1','Paso 1'],['Step 2','Paso 2'],['Step 3','Paso 3'],
 ['PHOTO','FOTO'],['TEXT','TEXTO'],['EDIT','EDITAR'],
 ['Your next big idea.','Tu próxima gran idea.'],
 ['Made your way.','A tu manera.'],
 ['A fresh start for your content','Una nueva etapa para tu contenido'],
 ['Less clutter, better content.','Menos desorden, mejor contenido.'],
 ['Create post','Crear publicación'],['Save post','Guardar publicación'],
 ['Choose a format','Elige un formato'],['Publishing destination','Dónde publicar'],
 ['My brand','Mi marca'],['Choose one','Elige uno'],
 ['Welcome back','Qué bueno verte de nuevo'],['Get started','Comenzar'],
 ['My photo','Mi foto'],['Your photo','Tu foto'],
 ['All photos','Todas las fotos'],['Edit photo','Editar foto'],
 ['Upload photo','Subir foto'],['My posts','Mis posts'],['Library','Biblioteca'],
 ['Follows','Sigue'],['voice','voz'],
 ['AI may consume AppDeploy credits. Check all details before publishing.','La IA puede consumir créditos. Revisa el contenido antes de publicarlo.'],
 ['CREATE CONTENT','CREAR CONTENIDO'],['NEW CONTENT','NUEVO CONTENIDO'],
 ['YOUR CONTENT','TU CONTENIDO'],
 ['MY BRAND KIT','MI KIT DE MARCA'],
 ['CHOOSE A FORMAT','ELIGE UN FORMATO'],
 ['MY PHOTO LIBRARY','MI BIBLIOTECA DE FOTOS'],
 ['PHOTO STUDIO','ESTUDIO DE FOTOS'],
 ['EDITORIAL','EDITORIAL'],
 ['SINGLE POST','POST INDIVIDUAL'],
 ['VIDEOS','VIDEOS'],['Ideas','Ideas'],
 ['Instagram · 1080 × 1350 PNG','Instagram · PNG 1080 × 1350'],
 ['This photo is already in your design.','Esta foto ya está en tu diseño.'],
 ['New idea','Nueva idea'],['Your next post starts here.','Tu próximo post empieza aquí.'],
 ['Your next big idea','Tu próxima gran idea'],
 ['Product spotlight','Producto protagonista'],['POV / Relatable','Situación cotidiana'],['Storytelling','Cuenta una historia'],
 ['Pain point','Problema real'],['Educational','Educativo'],['Behind the scenes','Detrás de cámaras'],
 ['Tutorial','Tutorial'],['Offer','Oferta'],['Question','Pregunta'],
 ['Single post','Post individual'],['Story','Historia'],['Reel','Reel'],
 ['Carousel','Carrusel'],
 ['Natural editorial, human, realistic','Editorial natural, humano y realista'],
 ['Select an image…','Selecciona una imagen…'],
 ['Choose your language','Elige tu idioma'],
 ['Your account language','Idioma de tu cuenta'],
 ['Sign in','Iniciar sesión'],
 ['Open my Content Lab','Entrar a mi Content Lab'],
 ['Send sign-in code','Enviar código de acceso'],
 ['Email address','Correo electrónico'],
 ['Your authorized email','Tu correo autorizado'],
 ['Code from your email','Código de tu correo'],
 ['Change email or request another code','Cambiar correo o solicitar otro código'],
 ['Try the 8 free Master Prompts','Probar los 8 Master Prompts gratis'],
 ['Private access · $10 one-time purchase coming soon','Acceso privado · $10 pago único próximamente'],
 ['Inspiration','Inspiración'],['Photo','Foto'],['Background','Fondo'],['Review','Revisar'],
 ['Download PNG','Descargar PNG'],['Add text','Añadir texto'],
 ['Add photos','Añadir fotos'],['Photos and stickers','Fotos y stickers'],
 ['Make room for','Haz espacio para'],['One home for your ideas. A different voice for every brand.','Un espacio para tus ideas. Cada marca con su propia voz.'],
 ['What are we creating today?','¿Qué vamos a crear hoy?'],
 ['Start with one problem, one photo or one idea worth sharing.','Empieza por un problema, una foto o una idea para compartir.'],
 ['Edit brand profile','Editar perfil de marca'],['Recent creations','Publicaciones recientes'],
 ['View all','Ver todas'],['Your best ideas begin here.','Tus mejores ideas empiezan aquí.'],
 ['No content saved yet. Create your first piece.','Todavía no hay contenido guardado. Crea tu primera publicación.'],
 ['Create my first post','Crear mi primer post'],
 ['One Product → 8 Compositions','1 producto → 8 composiciones'],
 ['Content','Contenido'],['Give it a purpose. Give it your voice. Make it yours.','Dale intención, tu voz y tu estilo.'],
 ['Design full carousel','Diseñar carrusel completo'],
 ['Your brands,','Tus marcas,'],['Every account gets its own language, audience and visuals.','Cada cuenta tiene su propio idioma, público y estilo visual.'],
 ['Add a brand','Añadir marca'],['Name *','Nombre *'],
 ['Ideal audience','Público ideal'],['Voice & personality','Voz y personalidad'],
 ['Instructions for content AI','Instrucciones para la IA'],
 ['Public content language','Idioma del contenido público'],
 ['Brand colors','Colores de marca'],
 ['Cancel','Cancelar'],['Save profile','Guardar perfil'],
 ['Opening your Content Lab…','Abriendo tu Content Lab…'],
 ['Your image here','Tu imagen aquí'],['Edit image','Editar imagen'],
 ['Ready for your next idea?','¿Lista para tu próxima idea?'],
 ['Everything you\'ve','Todo lo que has'],
 ['Upload a photo','Subir una foto'],
 ['Choose an image','Elegir imagen'],
 ['Create with AI','Crear con IA'],
 ['One idea. One clear direction.','Una idea. Una dirección clara.'],
 ['AI photography','Fotografía con IA'],
 ['Get inspired','Inspírate'],['Ready to export','Listo para descargar'],
 ['Download post','Descargar publicación'],
 ['Other','Otro'],['Search photos…','Buscar fotos…'],
 ['Post status','Estado de publicación'],
 ['Delete account','Eliminar cuenta'],
 ['Confirm','Confirmar'],['Continue','Continuar'],
 ['Photo library','Biblioteca de fotos'],
 ['Choose photo','Elegir foto'],
 ['Change photo','Cambiar foto'],
 ['Cover preview','Vista previa de portada'],
 ['My photos','Mis fotos'],
 ['My backgrounds','Mis fondos'],
 ['Your creative space','Tu espacio creativo'],
 ['Use this format','Usar este formato'],
 ['Upload my photos','Subir mis fotos'],
 ['No photos yet','Todavía no hay fotos'],
 ['Close','Cerrar'],['Open','Abrir'],
 ['Selected','Seleccionado'],['New post','Nuevo post'],
 ['More options','Más opciones'],
 ['Save changes','Guardar cambios'],
 ['Plan your content','Organiza tu contenido'],
 ['Upload files','Subir archivos'],

 ['YOUR CREATIVE HQ','TU ESTUDIO CREATIVO'],
 ['CONTENT LAB · FIRST STEPS','CONTENT LAB · PRIMEROS PASOS'],
 ['YOUR CREATIVE DESK','TU MESA CREATIVA'],
 ['better content.','mejor contenido.'],
 ['MADE SIMPLE ↗','HECHO FÁCIL ↗'],
 ['THE CONTENT ENGINE','TU MOTOR DE CONTENIDO'],
 ['ACTIVE BRAND','MARCA ACTIVA'],['LANGUAGE','IDIOMA'],
 ['SAVED POSTS','POSTS GUARDADOS'],
 ['PICK UP WHERE YOU LEFT OFF','CONTINÚA DONDE LO DEJASTE'],
 ['SAVED MASTER PROMPTS','MASTER PROMPTS GUARDADOS'],
 ['composer.','compositor.'],
 ['SEPARATE BRANDS. CLEAR VOICES.','CADA MARCA CON SU PROPIA VOZ.'],
 ['your rules.','tus reglas.'],
 ['BRAND KIT · PALETA PERSONAL PARA CADA MARCA','KIT DE MARCA · TU PALETA PERSONAL'],
 ['Prompt Studio · 30 recetas','Estudio de prompts · 30 recetas'],
 ['Selecciona tu idioma · Choose your language','Elige el idioma de tu cuenta'],
 ['Idioma / Language','Idioma'],
 ['Idioma del sitio / Site language','Idioma del sitio'],

 ['TOTAL PIECES','PUBLICACIONES'],['In this account','En esta cuenta'],
 ['IN PROGRESS','EN PROCESO'],['Ideas in motion','Ideas en desarrollo'],
 ['READY TO POST','LISTAS PARA PUBLICAR'],['Ready when you are','Listas cuando tú quieras'],
 ['YOUR MEDIA','TUS ARCHIVOS'],['Photos and screenshots','Fotos y capturas'],
 ['Teach something','Enseña algo'],['A useful little lesson','Una pequeña lección útil'],
 ['Solve a pain point','Resuelve un problema'],['Make them feel seen','Haz que se sientan identificados'],
 ['Show the difference','Muestra el cambio'],['Before / after','Antes y después'],
 ['Keep it relatable','Hazlo cercano'],['A real everyday moment','Una situación cotidiana'],
 ['Define your audience in settings.','Define tu público en la configuración.'],
 ['Select a brand','Selecciona una marca'],['Personal workspace','Espacio personal'],
 ['THE CONTENT ENGINE','CENTRO DE CONTENIDO'],
 ['ONE IDEA','UNA IDEA'],['My private workspace','Mi espacio privado'],
 ['TOTAL PHOTOS','TOTAL DE FOTOS'],
 ['YOUR ACCOUNTS','TUS CUENTAS'],
 ['YOUR CREATIVE HQ','TU ESTUDIO CREATIVO'],
 ['MY WORKSPACE','MI ESTUDIO'],['My content','Mis publicaciones'],
 ['Your creative space','Tu espacio creativo'],
 ['the','el'],['creative','proceso'],['process.','creativo.'],
 ['Total posts','Total de posts'],
 ['Photos and screenshots','Fotos y capturas'],
 ['Start creating in 3 steps.','Empieza a crear en 3 pasos.'],
 ['Your studio is up and running. ✨','Tu estudio está en marcha. ✨'],
 ['You don\'t need to know design or coding. Pick an action and continue where you left off.',
   'No necesitas saber diseñar ni programar. Elige una acción y continúa desde donde quedaste.'],
 ['Set up your brand','Define tu marca'],
 ['Colors, language, audience and style.','Colores, idioma, audiencia y estilo.'],
 ['Upload a photo','Sube una foto'],
 ['Use your original or a style reference.','Usa la original o una referencia de estilo.'],
 ['Save your first post','Guarda tu primer post'],
 ['Create a post and save it to your library.','Crea una publicación y guárdala en tu biblioteca.'],
 ['My designs','Mis diseños'],
 ['Create a post','Crear publicación'],
 ['Prompt Studio · 30 recipes','Estudio de prompts · 30 recetas'],
 ['Getting started','Guía para empezar'],
 ['Setup progress','Progreso de configuración'],
 ['Use my photo as background','Mi foto como fondo'],
 ['Edit profile','Editar perfil'],
 ['Follows','Sigue'],
];
const enToEs=new Map(pairs),esToEn=new Map(pairs.map(([en,es])=>[es,en]));
/**
 * Render-time UI strings. React owns the DOM; don't rely on a MutationObserver
 * to translate React-owned nodes (React may replace them during hydration/updates).
 */
export function uiText(source:string,language:LabLanguage):string{
 if(language==='es')return enToEs.get(source)||source;
 return esToEn.get(source)||source;
}
const originals=new WeakMap<Text,{source:string,last:string}>();
const attrs=new WeakMap<Element,Map<string,{source:string,last:string}>>();
let stop:(()=>void)|null=null;
function translate(source:string,locale:LabLanguage):string{
 const map=locale==='es'?enToEs:esToEn;
 const exact=map.get(source);if(exact!==undefined)return exact;
 // Phrases with a dynamic brand name remain intact outside the UI label.
 return source;
}
function excluded(el:Element|null){
 return !el||!!el.closest('script,style,textarea,code,pre,[contenteditable],.postcard h3,.postcard p,.graphic,.touch-editor-free-text,.touch-editor-image-window,.free-post-media-grid small,.brand-avatar,.cover-artwork');
}
function updateText(node:Text,locale:LabLanguage){
 if(excluded(node.parentElement))return;
 const raw=node.nodeValue||'',stripped=raw.trim();
 if(!stripped)return;
 let saved=originals.get(node);
 if(!saved||saved.last!==raw){saved={source:stripped,last:raw};originals.set(node,saved)}
 const target=translate(saved.source,locale);
 const next=raw.replace(stripped,target);
 if(next!==raw){node.nodeValue=next;saved.last=next}
}
function updateAttribute(el:Element,key:string,locale:LabLanguage){
 const raw=el.getAttribute(key);if(!raw)return;
 let registry=attrs.get(el);if(!registry){registry=new Map();attrs.set(el,registry)}
 let saved=registry.get(key);
 if(!saved||saved.last!==raw){saved={source:raw,last:raw};registry.set(key,saved)}
 const next=translate(saved.source,locale);
 if(next!==raw){el.setAttribute(key,next);saved.last=next}
}
function visit(node:Node,locale:LabLanguage){
 if(node.nodeType===Node.TEXT_NODE){updateText(node as Text,locale);return}
 if(node.nodeType!==Node.ELEMENT_NODE)return;
 const el=node as Element;if(excluded(el))return;
 for(const key of ['placeholder','title','aria-label'])updateAttribute(el,key,locale);
 for(const child of [...el.childNodes])visit(child,locale);
}
export function installLabLocale(locale:LabLanguage):()=>void{
 stop?.();
 document.documentElement.lang=locale==='es'?'es-419':'en';
 const root=document.querySelector('.app-shell,.login') as Element|null;
 if(!root)return()=>{};
 visit(root,locale);
 const observer=new MutationObserver(records=>{
  for(const record of records){
   if(record.type==='characterData')visit(record.target,locale);
   else if(record.type==='attributes')visit(record.target,locale);
   else for(const node of record.addedNodes)visit(node,locale);
  }
 });
 observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,
  attributeFilter:['placeholder','title','aria-label']});
 const disconnect=()=>observer.disconnect();
 stop=disconnect;return disconnect;
}

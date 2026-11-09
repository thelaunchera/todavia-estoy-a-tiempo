import type {CoreClassId} from './class-core-plan';

export type ScreenCardKind='cover'|'statement'|'three'|'steps'|'checklist'|'outro';
export type ScreenCardText={
 label:string; title:string[]; lead:string; items?:string[]; cue:string;
};
export type ScreenCard={
 id:string; lessonId:CoreClassId; kind:ScreenCardKind; number:string;
 es:ScreenCardText; en:ScreenCardText;
};
/** Private, ready-to-present 16:9 recording cards — NOT student lessons.
 * IDs and order are stable so editing exports never overwrite existing recordings. */
export const classScreenCards:ScreenCard[]=[
 {id:'01-cover',lessonId:'01',number:'01',kind:'cover',
  es:{label:'VIDEO 01 · PORTADA',title:['Empieza con','ChatGPT'],lead:'Tu idea. Tus conexiones. Tu primer paso.',cue:'Al abrir el primer video'},
  en:{label:'VIDEO 01 · COVER',title:['Start with','ChatGPT'],lead:'Your idea. Your connections. Your first step.',cue:'At the start of video one'}},
 {id:'01-idea',lessonId:'01',number:'02',kind:'statement',
  es:{label:'CONCEPTO · UNA IDEA CLARA',title:['Antes del diseño,','la dirección.'],lead:'¿Qué ofreces? ¿Para quién? ¿Qué debe hacer el visitante?',cue:'Cuando expliques por qué empezamos con un brief'},
  en:{label:'CONCEPT · ONE CLEAR IDEA',title:['Before design,','find direction.'],lead:'What do you offer? Who is it for? What should visitors do?',cue:'When you explain the brief'}},
 {id:'01-tools',lessonId:'01',number:'03',kind:'three',
  es:{label:'LAS TRES HERRAMIENTAS',title:['Conectamos lo necesario.'],lead:'Revisa acceso y permisos. No todas las cuentas tienen las mismas funciones.',items:['ChatGPT|Pensamos','Google Drive|Fotos y archivos','AppDeploy|Construimos'],cue:'Mientras hables de los conectores'},
  en:{label:'THREE ESSENTIAL TOOLS',title:['Connect what you need.'],lead:'Check access and permissions. Features vary by account.',items:['ChatGPT|Plan','Google Drive|Photos and files','AppDeploy|Build'],cue:'When introducing connections'}},
 {id:'01-drive',lessonId:'01',number:'04',kind:'steps',
  es:{label:'ARCHIVOS SIN COMPLICACIONES',title:['Tus fotos,','en un solo lugar.'],lead:'Usa las carpetas existentes; no necesitas duplicarlas.',items:['Conecta Drive','Localiza Casa Brownie','Revisa fotos aprobadas'],cue:'Cuando abras la carpeta original de Casa Brownie'},
  en:{label:'FILES MADE SIMPLE',title:['Your photos,','one place.'],lead:'Reuse existing folders instead of duplicating them.',items:['Connect Drive','Find Casa Brownie','Review approved photos'],cue:'When you open the existing Casa Brownie folder'}},
 {id:'01-check',lessonId:'01',number:'05',kind:'checklist',
  es:{label:'CHECKLIST · VIDEO 01',title:['Antes de construir'],lead:'Marca lo que realmente comprobaste.',items:['Idea explicada en una frase','Fotos localizadas','Conexiones revisadas'],cue:'Al cerrar el video 1'},
  en:{label:'CHECKLIST · VIDEO 01',title:['Before you build'],lead:'Check only what you actually verified.',items:['Idea in one sentence','Photos located','Connections checked'],cue:'At the end of video 1'}},
 {id:'02-cover',lessonId:'05',number:'06',kind:'cover',
  es:{label:'VIDEO 02 · PORTADA',title:['La IA construye','nuestra web'],lead:'Un prompt bien escrito. Una primera versión.',cue:'Al abrir el segundo video'},
  en:{label:'VIDEO 02 · COVER',title:['AI builds','our website'],lead:'One clear prompt. One first draft.',cue:'At the start of video two'}},
 {id:'02-map',lessonId:'05',number:'07',kind:'three',
  es:{label:'ESTRUCTURA DE LA WEB',title:['¿Qué vamos a crear?'],lead:'Una página clara para Casa Brownie.',items:['01 · Portada|Título y botón','02 · Sabores|Seis productos','03 · Regalos|Historia y footer'],cue:'Antes de pegar el prompt maestro'},
  en:{label:'WEBSITE STRUCTURE',title:['What are we building?'],lead:'A clear one-page Casa Brownie site.',items:['01 · Hero|Headline and button','02 · Flavors|Six products','03 · Gifts|Story and footer'],cue:'Before pasting the master prompt'}},
 {id:'02-prompt',lessonId:'05',number:'08',kind:'statement',
  es:{label:'EL MÉTODO',title:['Un prompt.','Una primera versión.'],lead:'Describe lo que quieres. Enseña referencias. Pide vista previa.',cue:'En el momento de copiar el prompt'},
  en:{label:'THE METHOD',title:['One prompt.','One first draft.'],lead:'Describe your goal. Show references. Ask for a preview.',cue:'When copying the master prompt'}},
 {id:'02-preview',lessonId:'05',number:'09',kind:'steps',
  es:{label:'PRIMER RESULTADO',title:['Primero revisa.','Después publica.'],lead:'No confundas la vista previa con una web ya publicada.',items:['Mira la portada','Recorre el catálogo','Comprueba los botones'],cue:'Antes de mostrar la vista previa de AppDeploy'},
  en:{label:'FIRST RESULT',title:['Preview first.','Publish second.'],lead:'A preview is not the same as a live website.',items:['Check the hero','Browse the catalog','Test the buttons'],cue:'Before showing the website preview'}},
 {id:'02-check',lessonId:'05',number:'10',kind:'checklist',
  es:{label:'CHECKLIST · VIDEO 02',title:['Primera versión lista'],lead:'Comprueba el resultado en pantalla.',items:['Portada correcta','Fotos individuales visibles','CTA y secciones funcionan'],cue:'Al cerrar el video 2'},
  en:{label:'CHECKLIST · VIDEO 02',title:['First draft ready'],lead:'Verify the result on screen.',items:['Hero looks right','Individual photos visible','CTA and sections work'],cue:'At the end of video 2'}},
 {id:'03-cover',lessonId:'06',number:'11',kind:'cover',
  es:{label:'VIDEO 03 · PORTADA',title:['La hacemos','nuestra'],lead:'Pequeños cambios. Una web mucho mejor.',cue:'Al abrir el tercer video'},
  en:{label:'VIDEO 03 · COVER',title:['Make it','our own'],lead:'Small changes. A much better website.',cue:'At the start of video three'}},
 {id:'03-method',lessonId:'06',number:'12',kind:'steps',
  es:{label:'CÓMO PEDIR CAMBIOS',title:['No vuelvas','a empezar.'],lead:'Corrige una cosa por vez, sin perder lo que funciona.',items:['Captura del error','Instrucción concreta','Comprobación real'],cue:'Antes de adjuntar una captura a ChatGPT'},
  en:{label:'HOW TO REQUEST CHANGES',title:['Do not','start over.'],lead:'Fix one thing at a time. Preserve what works.',items:['Error screenshot','Specific instruction','Real verification'],cue:'Before sharing a screenshot with ChatGPT'}},
 {id:'03-before',lessonId:'06',number:'13',kind:'three',
  es:{label:'ANTES → DESPUÉS',title:['Una corrección real'],lead:'No cambies todo: enfoca el problema.',items:['ANTES|Imagen recortada','CAMBIO|Ajustar encuadre','DESPUÉS|Foto completa'],cue:'Entre la captura del problema y el resultado corregido'},
  en:{label:'BEFORE → AFTER',title:['One real correction'],lead:'Focus on the problem instead of changing everything.',items:['BEFORE|Cropped image','CHANGE|Adjust framing','AFTER|Full image'],cue:'Between the error and corrected result'}},
 {id:'03-mobile',lessonId:'06',number:'14',kind:'statement',
  es:{label:'DISEÑO RESPONSIVE',title:['En el teléfono','también importa.'],lead:'Foto completa · Texto legible · Botón cómodo',cue:'Al cambiar de vista tablet a teléfono'},
  en:{label:'RESPONSIVE DESIGN',title:['Mobile matters','just as much.'],lead:'Full image · Readable text · Easy-to-tap button',cue:'When switching from tablet to phone'}},
 {id:'03-check',lessonId:'06',number:'15',kind:'checklist',
  es:{label:'CHECKLIST · VIDEO 03',title:['Corrección comprobada'],lead:'Antes de avanzar, compara.',items:['Foto bien encuadrada','Título fácil de leer','Sin cortes en móvil'],cue:'Al cerrar el video 3'},
  en:{label:'CHECKLIST · VIDEO 03',title:['Correction checked'],lead:'Compare before moving on.',items:['Photo framed correctly','Headline easy to read','No mobile cutoffs'],cue:'At the end of video 3'}},
 {id:'04-cover',lessonId:'08',number:'16',kind:'cover',
  es:{label:'VIDEO 04 · PORTADA',title:['Publicamos','y probamos'],lead:'Una web se termina cuando funciona.',cue:'Al abrir el cuarto video'},
  en:{label:'VIDEO 04 · COVER',title:['Publish','and test'],lead:'A website is ready when it works.',cue:'At the start of video four'}},
 {id:'04-link',lessonId:'08',number:'17',kind:'statement',
  es:{label:'PUBLICACIÓN REAL',title:['La URL tiene','que abrir.'],lead:'Prueba la página fuera del editor, como cualquier visitante.',cue:'Cuando muestres el enlace publicado'},
  en:{label:'LIVE WEBSITE',title:['The link must','actually open.'],lead:'Test it outside the editor, like a real visitor.',cue:'When opening the published link'}},
 {id:'04-test',lessonId:'08',number:'18',kind:'three',
  es:{label:'PRUEBA COMO VISITANTE',title:['No basta con verla.'],lead:'Toca cada botón y revisa la versión móvil.',items:['MENÚ|Navegación','BOTÓN|Destino correcto','MÓVIL|Fotos y footer'],cue:'Mientras recorres y pruebas la página'},
  en:{label:'TEST AS A VISITOR',title:['Looking good is not enough.'],lead:'Tap every button and check the mobile view.',items:['MENU|Navigation','BUTTON|Correct destination','MOBILE|Photos and footer'],cue:'While testing the live page'}},
 {id:'04-check',lessonId:'08',number:'19',kind:'checklist',
  es:{label:'CHECKLIST · VIDEO 04',title:['Antes de compartir'],lead:'Tu primera web, verificada.',items:['Enlace real comprobado','Botones y menú probados','Captura móvil guardada'],cue:'Al cerrar la demostración'},
  en:{label:'CHECKLIST · VIDEO 04',title:['Before you share'],lead:'Your first website, verified.',items:['Live URL checked','Buttons and menu tested','Mobile screenshot saved'],cue:'At the end of the demo'}},
 {id:'04-outro',lessonId:'08',number:'20',kind:'outro',
  es:{label:'CIERRE DE LA CLASE',title:['Ahora te','toca a ti.'],lead:'Mismo proceso. Tu negocio. Tu propia web.',cue:'Última pantalla del curso'},
  en:{label:'COURSE OUTRO',title:['Now it is','your turn.'],lead:'Same process. Your business. Your website.',cue:'Final frame of the course'}}
];
export function screenCardsForLesson(id:string){return classScreenCards.filter(card=>card.lessonId===id);}
export function cardForSceneCut(lessonId:string,sceneIndex:number){
 const cards=screenCardsForLesson(lessonId);
 return cards[Math.min(sceneIndex+1,cards.length-1)]?.id||cards[0]?.id||null;
}

import type {ClassLesson} from './class-course';
import type {RecordingStart} from './recording-starts';

/** Versión actual: cuatro grabaciones desde iPad. Los nueve registros históricos
 * siguen intactos para no perder archivos, estados ni notas en el Studio. */
export const coreClassIds=['01','05','06','08'] as const;
export type CoreClassId=typeof coreClassIds[number];
export const coreClassLinks:Record<CoreClassId,{label:string;url:string}[]>={
 '01':[
  {label:'Abrir ChatGPT',url:'https://chatgpt.com/'},
  {label:'Abrir Google Drive',url:'https://drive.google.com/drive/u/0/my-drive'},
  {label:'Revisar AppDeploy',url:'https://appdeploy.ai/pricing'}
 ],
 '05':[
  {label:'ChatGPT · construir',url:'https://chatgpt.com/'},
  {label:'AppDeploy · acceso y créditos',url:'https://appdeploy.ai/pricing'},
  {label:'Casa Brownie · referencia estática',url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video'}
 ],
 '06':[
  {label:'ChatGPT · corregir',url:'https://chatgpt.com/'},
  {label:'Casa Brownie · comparar',url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video'}
 ],
 '08':[
  {label:'ChatGPT · revisión final',url:'https://chatgpt.com/'},
  {label:'Ver Casa Brownie sin video',url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video'}
 ]
};

const ideaPrompt=`Vamos a crear una web de demostración para Casa Brownie, negocio ficticio de brownies artesanales. Actúa como estratega web y directora de arte. Usa las fotos y carpetas YA EXISTENTES en Google Drive solo si están conectadas y tengo permiso. Si no hay acceso, dime qué fotos debo adjuntar. Resume en cinco líneas: público, oferta, mensaje principal, secciones y botón principal. No inventes dirección, testimonios, precios, reseñas ni datos de clientes. No dupliques carpetas. No publiques todavía.`;
const buildPrompt=`Construye en un proyecto NUEVO e independiente una web responsive de una página llamada «Casa Brownie · Taller». Marca DEMO EDUCATIVA · SIN PEDIDOS NI PAGOS REALES. Estilo premium artesanal: marfil #F7F0E8, cacao #422419, rosa suave, titulares serif y tipografía de cuerpo legible. Usa las fotos individuales aprobadas que compartí o las que localizamos en Drive con permiso; NO modifiques el demo oficial. Secciones en orden: header; hero con FOTO ESTÁTICA, titular «¿Qué llevo de regalo?» y CTA «Descubrir sabores» que salta al catálogo; banner; catálogo de seis sabores con fotografías separadas (Clásico, Chocolate con nuez, Dulce de leche, Frambuesa, Oreo, Edición especial); regalos/empaques; historia; entrega ficticia en Miami; footer. Diseño mobile-first con navegación y botones comprobables, sin scroll horizontal. No inventes dirección, precios, políticas, horarios ni testimonios. No actives pagos, checkout, formularios con información personal, cookies de seguimiento ni backend. Usa una herramienta de publicación conectada y autorizada, como AppDeploy SOLO si está disponible en esta cuenta. Muestra la vista previa; si aún no hay URL HTTPS realmente publicada, di qué falta en vez de afirmar que publicaste.`;
const fixPrompt=`Corrige SOLO el proyecto «Casa Brownie · Taller». Conserva la estructura, imágenes aprobadas y lo que ya funciona. Cambia la foto [archivo] por la aprobada, ajusta este título [texto exacto] y resuelve el fallo de la captura móvil adjunta [problema]. Comprueba encuadre y legibilidad en iPad y teléfono, tamaño del botón y ausencia de scroll horizontal. Muéstrame antes y después. No modifiques el demo oficial.`;
const testPrompt=`Revisa esta URL real de mi web [ENLACE] y mis capturas de móvil [ADJUNTOS]. Comprueba menú, «Descubrir sabores», fotos, fichas, CTA, aviso DEMO y footer. Enumera solo los fallos que puedas observar y propón una corrección breve por fallo; distingue lo que efectivamente verificaste de lo que debo probar manualmente. No inventes que los pagos, pedidos o formularios funcionan.`;

export const coreClassLessons:ClassLesson[]=[
 {id:'01',title:'Empieza con ChatGPT y conectores',minutes:5,
 outcome:'Preparar el brief de Casa Brownie y comprobar los conectores necesarios.',
 prep:['Abre ChatGPT en iPad y activa No molestar','Ten a mano la carpeta original de Casa Brownie en Drive','Comprueba Google Drive y AppDeploy desde Plugins; autoriza solo lo disponible'],
 beats:[
  {label:'Abre ChatGPT',show:'Enseña ChatGPT y di en una frase qué web harás; abre brevemente la referencia estática.',say:'Hoy vas a ver cómo convierto una idea en una web. Tú puedes hacerlo con tu negocio.'},
  {label:'Conecta lo necesario',show:'En ChatGPT entra a Plugins: busca Google Drive para archivos y AppDeploy para construir; revisa permisos, límites y disponibilidad en esta cuenta.',say:'ChatGPT es el punto de partida. Conecto Drive y una herramienta para construir, solo si mi cuenta lo permite.'},
  {label:'Pide el plan',show:'Copia el prompt listo; enseña el brief corto y confirma las fotos de Drive o muestra lo que deberás adjuntar.',say:'Le describo Casa Brownie y la IA organiza los primeros pasos. No tengo que crear carpetas a mano.'}
 ],
 prompt:ideaPrompt,exercise:'Abrir ChatGPT, revisar conectores y guardar un brief de cinco líneas.'},
 {id:'05',title:'La IA construye la web',minutes:15,
 outcome:'Construir una primera versión real de Casa Brownie sin editar el demo oficial.',
 prep:['Ten ChatGPT y la herramienta conectada abiertos','Usa las fotografías ya aprobadas, no generes duplicados','Comprueba el plan/créditos de la herramienta antes de ejecutar'],
 beats:[
  {label:'Proyecto nuevo',show:'Abre un proyecto nuevo; mantén la web oficial Casa Brownie únicamente como referencia.',say:'La web oficial es nuestro ejemplo. Aquí creamos una práctica distinta desde cero.'},
  {label:'Pega un prompt maestro',show:'Copia el prompt completo y permite la construcción solo en la cuenta autorizada.',say:'Con una instrucción clara le digo qué crear: portada, sabores, regalos y footer.'},
  {label:'Revisa la primera versión',show:'Muestra vista previa, botones y fotos sin recortar la pantalla ni fingir publicación.',say:'La primera versión no tiene que ser perfecta. Primero comprobamos lo que creó.'}
 ],
 prompt:buildPrompt,exercise:'Comprobar la primera vista previa y guardar el enlace real si ya existe.'},
 {id:'06',title:'Mejora fotos, texto y móvil',minutes:10,
 outcome:'Un antes/después de una corrección real desde ChatGPT.',
 prep:['Abre la web de práctica, no el demo oficial','Toma una captura de un fallo real en teléfono o tablet','Ten identificada la foto aprobada que quieres usar'],
 beats:[
  {label:'Detecta un cambio',show:'Enseña una foto, un texto o un recorte que deba mejorar.',say:'No hace falta rehacer toda la web. Vamos a corregir solo lo que no funciona.'},
  {label:'Pide la corrección',show:'Adjunta captura y copia el prompt de cambio en el proyecto conectado.',say:'Le enseño exactamente qué quiero cambiar y qué debe conservar.'},
  {label:'Compara',show:'Reabre la web y enseña el antes/después y los botones aún funcionando.',say:'Ahora verifico el resultado en tablet y teléfono antes de seguir.'}
 ],
 prompt:fixPrompt,exercise:'Guardar una captura antes/después de una corrección real.'},
 {id:'08',title:'Publica y comprueba tu enlace',minutes:8,
 outcome:'URL real comprobada, portada móvil y acción principal probada.',
 prep:['Abre la URL real de tu práctica fuera del editor','Ten teléfono o vista móvil para revisar','La demo debe seguir marcada SIN PEDIDOS NI PAGOS REALES'],
 beats:[
  {label:'Abre el enlace',show:'Copia la URL si realmente se publicó; ábrela como visitante en una ventana nueva.',say:'Una web no está terminada porque se ve bonita. Vamos a abrirla como cliente.'},
  {label:'Prueba lo importante',show:'Pulsa menú, CTA, seis sabores y footer; recorre versión móvil.',say:'Compruebo que cada botón hace lo que promete y que las fotos se ven bien.'},
  {label:'Cierra la clase',show:'Guarda URL y captura del hero móvil. Muestra dónde están los materiales opcionales y Ayuda.',say:'Ya conoces el proceso. Ahora cambia Casa Brownie por tu negocio y repite estos cuatro pasos.'}
 ],
 prompt:testPrompt,exercise:'Guardar URL real y una captura móvil; comprobar el CTA y el footer.'}
];
export const coreClassMinutes=coreClassLessons.reduce((total,lesson)=>total+lesson.minutes,0);
export const coreClassRecordingStarts:Record<string,RecordingStart>={
 '01':{
  tabs:['ChatGPT','Google Drive · carpeta Casa Brownie existente','Plugins · comprobar Drive y AppDeploy'],
  actions:['Abre ChatGPT','Revisa permisos y disponibilidad real de Google Drive y AppDeploy','Copia el prompt corto y verifica el brief con fotos existentes'],
  savedPoint:'Chat nuevo o conversación duplicable; materiales originales sin modificar.',
  finish:'Brief aprobado y conexiones disponibles comprobadas.',
  readyPrompt:ideaPrompt
 },
 '05':{
  tabs:['ChatGPT + herramienta de construcción autorizada','Fotos existentes Casa Brownie','Demo estático solo como referencia'],
  actions:['Abre un proyecto nuevo','Pega el prompt maestro completo','Comprueba portada, catálogo, footer y vista previa'],
  savedPoint:'Proyecto de práctica independiente, sin alterar el demo.',
  finish:'Primera versión y URL real si fue publicada.',
  readyPrompt:buildPrompt
 },
 '06':{
  tabs:['Web de práctica','ChatGPT','Captura antes y foto aprobada'],
  actions:['Muestra fallo real','Adjunta captura y pide un cambio específico','Verifica el antes/después en móvil'],
  savedPoint:'Captura anterior y enlace a la versión antes de cambiar.',
  finish:'Una corrección verificada.',
  readyPrompt:fixPrompt
 },
 '08':{
  tabs:['URL pública real del proyecto','Vista móvil','ChatGPT · revisión de errores'],
  actions:['Abre URL fuera del editor','Prueba navegación, fotos, CTA y footer','Guarda capturas y comparte solo si la web funciona'],
  savedPoint:'Enlace final y capturas antes de la prueba.',
  finish:'URL y prueba móvil documentadas; ningún pago ficticio activado.',
  readyPrompt:testPrompt
 }
};

/** Manual de filmación privado. El alumno siempre crea SU propia landing. */
export type ClassBeat = { label: string; say: string; show: string };
export type ClassLesson = {
 id: string; title: string; minutes: number; outcome: string; prep: string[];
 beats: ClassBeat[]; prompt: string; exercise: string;
};
export const CLASS_SECTION='clase-01-produccion-privada';
/** La única categoría de tareas de lanzamiento, ya presente en el Estudio. */
export const CLASS_TASK_SECTION='Clase 01 · Lanzamiento 3 dic';
export const CLASS_CHECKLIST='https://app.notion.com/p/407a68f2ee6e81e6b616e22c9fe73021';
export const CLASS_LAUNCH='2026-12-03';
export const CLASS_NOTION='https://app.notion.com/p/407a68f2ee6e818f9df0fa30f853c384';
export const CLASS_PLAN='https://app.notion.com/p/407a68f2ee6e81f4a273f7fe4be627d8';
export const CLASS_STUDENT='https://app.notion.com/p/407a68f2ee6e81d69eacc3cf2c3e85a4';
export const CLASS_DRIVE='https://drive.google.com/drive/folders/1sR_keLOjf3OuXdKKJ8TAYRwCPI9i5NQq';
export const CLASS_PROMPTS='https://dailin-prompts-landing.thelaunchera.chatgpt.site';
export const classStatusOptions=['pendiente','preparado','grabado','editando','aprobado'] as const;
export const classLessons:ClassLesson[]=[
{id:'00',title:'Bienvenida: qué construirás',minutes:3,outcome:'Recursos abiertos; objetivo claro; cada alumno hace SU propia landing.',
prep:['Abrir carpeta Drive y los cinco PDF','Abrir la biblioteca de 12 prompts','Tener lista la maqueta con sello DEMO · SIN COMPRAS'],
beats:[
{label:'La invitación',say:'Aquí vamos a construir una landing de principio a fin. No necesitas saber programar; lo haremos en pasos pequeños. Cada video termina con algo concreto que puedes probar.',show:'Portada editorial y breve recorrido de la página de demostración.'},
{label:'Mi ejemplo y el tuyo',say:'Mi pantalla mostrará una tienda ficticia de brownies infusionados, solamente para practicar diseño. No tiene compras ni ventas reales. Tú vas a trabajar con tu propio negocio o producto permitido.',show:'Mostrar sello DEMO · SIN COMPRAS y el botón informativo sin checkout.'},
{label:'Tus herramientas',say:'Tendrás cinco PDF, cuaderno de trabajo, checklist y doce prompts copiables. Pausa el video cuando quieras; no hace falta recordarlo todo.',show:'Abrir Empieza aquí, guía, cuaderno, biblioteca y checklist; sin mostrar archivos internos.'},
{label:'Tu resultado',say:'Al terminar prepara capturas del móvil, página completa y botón. El canal para compartirlas se anunciará una vez probado. Lo importante ahora es construir tu primera versión.',show:'Señalar una carpeta vacía llamada CAPTURAS DEL ALUMNO.'}],
prompt:'Quiero crear mi primera landing para [producto o servicio]. Antes de escribir, hazme 5 preguntas claras sobre la oferta, el público, la acción principal, mis fotos y lo que debo verificar. No inventes respuestas.',
exercise:'Abre los materiales y escribe una frase describiendo la página que construirás.'},
{id:'01',title:'Define una oferta sin complicarte',minutes:5,outcome:'Ficha de oferta con información confirmada y pendiente.',
prep:['Abrir el cuaderno y 01_FICHA_DE_OFERTA','Tener el ejemplo marcado como concepto ficticio'],
beats:[
{label:'Antes que los colores',say:'Una foto bonita no explica qué se ofrece. Antes de diseñar hay que saber qué mostramos, para quién y qué esperamos que haga esa persona.',show:'Escribir oferta, público, acción y datos pendientes en la ficha.'},
{label:'Mi ficha de ejemplo',say:'Completo el nombre del concepto, la dirección visual y la acción de explorar. Como es un ejemplo ficticio de producto regulado, no invento licencias, efectos, dosis ni disponibilidad.',show:'Rellenar la ficha sin precios ni testimonios inventados.'},
{label:'Ordenar con ChatGPT',say:'No pido que la IA invente una empresa perfecta. Le doy lo que sé y le pido distinguir los datos confirmados de las preguntas que faltan.',show:'Pegar prompt; revisar respuesta y marcar datos pendientes.'},
{label:'Tu turno',say:'Ahora escribe tu oferta en una frase. Si un dato aún no está confirmado, es mejor señalarlo que prometer algo falso.',show:'Guardar ficha final 01_FICHA_DE_OFERTA.'}],
prompt:'Tengo una idea de [producto o servicio]. Ayúdame a crear una ficha de oferta para una landing. Público: [público]. Acción: [acción]. Separa datos confirmados y pendientes, dime qué necesita entender un visitante y qué debo verificar. Sin inventar reseñas, ventas, licencias ni resultados.',
exercise:'Completar oferta, destinatario, acción principal y pendientes en la primera página del cuaderno.'},
{id:'02',title:'Inspírate sin copiar',minutes:6,outcome:'Tres referencias útiles y una dirección visual propia.',
prep:['Abrir 3 referencias de diseño/ecommerce, no procesos de compra regulados','Abrir 02_REFERENCIAS con 3 filas'],
beats:[
{label:'Buscar sin perder horas',say:'No necesitamos veinte pestañas. Voy a mirar tres páginas para aprender su orden, sus fotos y cómo ayudan a entender una oferta. Inspirarse no es copiar.',show:'Comparar hero, navegación y fotografía de tres webs.'},
{label:'Lo que sí se aprende',say:'De la primera me sirve el espacio para el título. De la segunda, el orden de las tarjetas. De la tercera, cómo funciona en el móvil. Ninguna se copia entera.',show:'Anotar enlace, acierto y elemento que NO vamos a copiar.'},
{label:'Crear identidad propia',say:'Con esas observaciones, pido a ChatGPT una dirección distinta. Si se parece demasiado a otra marca, la corrijo.',show:'Pegar prompt, elegir luz, tipografía, composición y paleta.'},
{label:'Guardar decisiones',say:'Nos quedamos con tres elecciones claras. Así las fotos y el diseño van a sentirse parte de la misma página.',show:'Guardar documento 02_REFERENCIAS.'}],
prompt:'Estas son tres páginas que revisé [URLs y mis observaciones]. Analiza jerarquía, fotos, navegación y móvil. Propón una dirección visual original para mi landing, sin copiar marcas, imágenes ni textos y sin inventar estadísticas.',
exercise:'Guardar tres referencias, una lección útil por página y una decisión que no copiarás.'},
{id:'03',title:'Crea fotos de producto con ChatGPT',minutes:7,outcome:'Hero horizontal, imagen de producto y detalle coherentes.',
prep:['Abrir ChatGPT y tus referencias','Crear carpeta 03_FOTOS: HERO, PRODUCTO, DETALLE'],
beats:[
{label:'Una sola marca',say:'No quiero una foto espectacular y otras dos de negocios distintos. Vamos a repetir la luz, los colores y los materiales.',show:'Presentar paleta y referencias de fotografía.'},
{label:'Fotografía principal',say:'Primero creamos el hero horizontal. Pido una composición realista con espacio para poner el título por fuera de la imagen.',show:'Generar HERO y revisar escala, textura, sombras, letras falsas.'},
{label:'Las otras dos',say:'Ahora utilizo la primera foto como referencia para una de producto y otra de empaque. No agrego etiquetas legales ni promesas sobre efectos que no están verificadas.',show:'Adjuntar la imagen anterior y generar PRODUCTO y DETALLE.'},
{label:'Revisión y nombres',say:'Si no parecen de la misma familia, las corrijo. También puedes usar fotografías propias si ya las tienes.',show:'Comparar tres fotos y guardarlas con nombres precisos.'}],
prompt:'Crea una fotografía editorial para [producto legal o concepto visual ficticio], formato [horizontal/vertical], luz lateral suave, paleta [colores], materiales [materiales], escala y textura realistas, espacio para titular fuera de imagen. Mantén coherencia con mis referencias. Sin letras falsas, logos, reseñas ni claims inventados.',
exercise:'Guardar tres fotos: HERO, PRODUCTO y DETALLE, comprobando coherencia y detalles.'},
{id:'04',title:'Escribe una página que se entienda',minutes:6,outcome:'Textos aprobados por secciones, sin frases vacías.',
prep:['Tener ficha de oferta y fotos','Crear 04_TEXTOS_DE_LANDING'],
beats:[
{label:'Menos adjetivos, más claridad',say:'No necesito prometer una experiencia revolucionaria. Necesito explicar claramente qué es, para quién y qué pasa cuando alguien toca el botón.',show:'Contrastar un titular genérico con uno específico.'},
{label:'Un orden simple',say:'Trabajamos hero, detalle, funcionamiento, preguntas frecuentes, contacto y acción principal. En mi demo el botón abre información, no una compra.',show:'Pegar prompt y organizar el copy sección por sección.'},
{label:'Leer con ojo crítico',say:'La IA puede escribir algo muy convincente que no es cierto. Elimino reseñas, urgencia y ventajas que no puedo comprobar.',show:'Corregir dos frases y marcar detalles pendientes.'},
{label:'Aprobar primera versión',say:'Guardo una versión con la que puedo construir. Después habrá mejoras, pero ya no voy a cambiar todo cada cinco minutos.',show:'Guardar 04_TEXTOS_DE_LANDING.'}],
prompt:'Con mi ficha confirmada [pegar ficha], redacta una landing de una página. Orden: hero, qué es, para quién, detalles, cómo funciona, FAQ, acción principal, contacto y condiciones cuando correspondan. Una idea por sección; tono humano; sin promesas, urgencia ni reseñas falsas. Marca pendientes.',
exercise:'Dejar los textos por sección y reemplazar una frase vaga por un hecho comprobable.'},
{id:'05',title:'Construye la landing paso a paso',minutes:8,outcome:'Primer prototipo navegable, con hero, bloques y CTA de demostración.',
prep:['Abrir constructor realmente disponible y crear página nueva','Preparar 03_FOTOS y 04_TEXTOS','Cerrar cuentas privadas y notificaciones'],
beats:[
{label:'Abrir el constructor',say:'Voy a mostrar los clics que sí existen en esta herramienta. Empezamos con una sola página; no necesitamos diez secciones vacías.',show:'Crear proyecto, nombrarlo y abrir vista previa.'},
{label:'La portada primero',say:'Subo el hero, pongo titular y subtítulo ya aprobados. El botón del ejemplo ficticio será informativo; no cobra ni recopila datos.',show:'Colocar foto horizontal, texto y CTA sin checkout.'},
{label:'El cuerpo de la página',say:'Agrego fotos de detalle, información y preguntas frecuentes. Vamos bloque a bloque para que cualquier corrección sea fácil.',show:'Montar tarjetas, bloques, anclajes y FAQ.'},
{label:'Probar de verdad',say:'Abro vista previa y toco los botones. Si una función no está conectada, la etiqueto como demo. No invento un proceso de compra de productos regulados.',show:'Probar navegación y aviso DEMO · SIN COMPRAS.'},
{label:'Guardar versión uno',say:'No busques la perfección todavía. Guarda el borrador y una captura del hero. Después lo corregimos en móvil.',show:'Guardar landing y captura. Si se alarga, separar 05A y 05B.'}],
prompt:'Ayúdame a construir un prototipo de landing con mis textos APROBADOS [textos], estas fotos [archivos] y estas secciones [orden]. Prioriza móvil, contraste y fotos bien recortadas. Los botones del demo no deben cobrar ni recoger datos. Muéstrame qué está sin conectar.',
exercise:'Guardar versión uno del hero y comprobar qué hace realmente el CTA.'},
{id:'06',title:'Haz que se vea bien en el teléfono',minutes:6,outcome:'Antes y después de una corrección real en móvil.',
prep:['Abrir vista móvil y desktop','Preparar 2 fallos reales de legibilidad/recorte','Desactivar notificaciones'],
beats:[
{label:'Mirar como visitante',say:'En la computadora todo puede parecer precioso y en el teléfono verse fatal. Ahora reviso la pantalla de arriba abajo.',show:'Scroll completo en ancho móvil real.'},
{label:'Encontrar dos problemas',say:'Un titular que tapa una foto y un botón demasiado pequeño son errores normales. Vamos a mostrarlos y corregirlos, no a esconderlos.',show:'Capturar recorte y CTA en estado anterior.'},
{label:'Corregir con intención',say:'Le enseño a ChatGPT capturas reales y pido cambios concretos. No quiero rehacer toda la marca sin motivo.',show:'Pegar prompt y aplicar margen, tipografía, recorte y tamaño de botón.'},
{label:'Comparar',say:'Repito la prueba y compruebo que se lee, se puede tocar y no sale nada por los bordes.',show:'Guardar capturas antes/después y verificar que no hay scroll horizontal.'}],
prompt:'Revisa mis capturas REALES de móvil y escritorio [adjuntos]. Detecta problemas concretos de recorte, tipografía, márgenes, jerarquía, CTA, navegación y scroll horizontal. Propón correcciones verificables. Distingue lo que puedes corregir de lo que debo probar personalmente.',
exercise:'Guardar hero móvil y una comparación antes/después.'},
{id:'07',title:'Explica cobro y entrega sin engañar',minutes:7,outcome:'Checklist de pago y correo de prueba para un producto permitido.',
prep:['Abrir Stripe solo en modo de prueba','Crear producto digital de ensayo permitido','No conectar checkout al ejemplo regulado'],
beats:[
{label:'El botón no demuestra un pago',say:'Una landing bonita no significa que el cobro funcione. Hoy voy a hacer una prueba con una guía digital permitida, distinta del prototipo ficticio de brownies.',show:'Separar visualmente tienda ficticia y ejemplo de guía digital.'},
{label:'Comprobar el producto',say:'Antes de activar cobros, compruebo que el proveedor permite mi producto y que sus datos son verdaderos. Este paso no se puede saltar.',show:'Mostrar producto de prueba y Stripe test mode sin datos sensibles.'},
{label:'Recorrido completo',say:'Pruebo botón, checkout, confirmación y correo. Una página que dice gracias no es suficiente: hay que verificar el pago y la entrega.',show:'Ejecutar solamente compra de prueba autorizada; revisar registro y email.'},
{label:'Qué falta',say:'Si algo no funciona o no tienes cuenta compatible, lo anotamos como pendiente. No fingimos una venta real.',show:'Checklist de pago, correo, acceso, duplicados y errores.'}],
prompt:'Para este producto PERMITIDO [producto], organiza landing → checkout → pago verificado → correo → entrega. Indica restricciones del proveedor, datos pendientes y pruebas necesarias. No afirmes que funciona antes de probar pago y correo. No actives cobros sin mi autorización.',
exercise:'Completar lista de pruebas reales o marcar checkout pendiente si aún no está autorizado.'},
{id:'08',title:'Publica, revisa y enséñame tu resultado',minutes:5,outcome:'Capturas, URL y pregunta listas para revisión.',
prep:['Abrir checklist de lanzamiento y cuaderno','Tener hero móvil y página completa','Evitar datos privados y capturas de otras personas'],
beats:[
{label:'Reconocer el resultado',say:'Ya tienes una primera versión. No tiene que parecer una empresa con años de experiencia. Lo que importa es entender qué construiste y qué falta probar.',show:'Recorrido breve de la landing completa.'},
{label:'Qué capturas guardar',say:'Necesito un hero móvil, el recorrido de la página, el destino del botón y la URL si ya existe. Añade una pregunta concreta.',show:'Carpeta 08_CAPTURAS con cuatro nombres de archivo.'},
{label:'Checklist real',say:'Comprueba fotos, claridad, CTA, móvil y datos sin verificar. Es mejor señalar un pendiente que prometer que todo está perfecto.',show:'Marcar únicamente checks que realmente se han probado.'},
{label:'Cómo compartir',say:'El canal de entrega de capturas se indicará en los materiales cuando esté probado. Guarda tus evidencias y prepara tu pregunta. Así podremos comentar mejoras concretas sin prometer una revisión ilimitada.',show:'Mostrar carpeta de capturas, no un buzón aún sin verificar.'}],
prompt:'Revisa mi landing como visitante nuevo [capturas y URL]. Evalúa claridad, fotos, jerarquía, CTA, accesibilidad y móvil. Dame tres mejoras concretas por prioridad y pruebas para verificar cada una, sin inventar resultados.',
exercise:'Preparar hero móvil, captura completa, CTA/destino, URL si existe y una pregunta específica.'}
];
export const classTotalMinutes=classLessons.reduce((n,l)=>n+l.minutes,0);
export function classRecordingScript(l:ClassLesson):string {
 return l.beats.map((b,i)=>'ESCENA '+(i+1)+' · '+b.label+'\n\nQUÉ DECIR\n'+b.say+'\n\nQUÉ MOSTRAR\n'+b.show).join('\n\n');
}

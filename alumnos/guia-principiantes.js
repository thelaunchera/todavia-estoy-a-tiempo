/* Recursos de iniciación dentro de los materiales privados. No crean progreso nuevo. */
const node=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;};
function header(content,kicker,title,description){
 const h=node('header','mi-section-head');
 h.append(node('span','mi-eyebrow',kicker),node('h3',null,title),node('p',null,description));
 content.append(h);
}
const folders=[
 ['00_IDEA','Qué ofrezco, para quién y el objetivo de mi web.'],
 ['01_TEXTOS','Titular, descripción, preguntas frecuentes y texto del botón.'],
 ['02_FOTOS','Guarda cada foto por separado; en Casa Brownie usamos hero estático, seis sabores y dos regalos.'],
 ['03_PROMPTS','Instrucciones de ChatGPT que dieron buen resultado.'],
 ['04_DISENO','Colores, letras y referencias aprobadas.'],
 ['05_WEB','Enlace público y versión revisada de mi página.'],
 ['06_PRUEBAS','Capturas del teléfono, botones probados y cambios pendientes.'],
 ['07_GASTOS','Costos y renovaciones si algún día compro un servicio.']
];
export function renderWebBasics(content,go){
 header(content,'02 / ENTENDER PARA CONSTRUIR','Tu web tiene una parte visible y otra que trabaja detrás.','Mira qué se ve y qué pasa por detrás. Vamos a entenderlo con Casa Brownie antes de conectar herramientas que todavía no necesitamos.');
 const grid=node('div','mi-structure-grid');
 [
  ['Frontend · la parte visible','Es lo que cualquier persona ve: fotografías, título, menú, colores, botones y diseño para teléfono.','Mira Casa Brownie: la portada pregunta «¿Qué llevo de regalo?» y el botón «Descubrir sabores» te lleva al catálogo.'],
  ['Backend · los procesos internos','Es lo que ocurre cuando hay que guardar datos, confirmar un pago, proteger una cuenta o enviar un mensaje automático.','Más adelante, Stripe puede verificar el pago, Make organizar el paso siguiente y Gmail enviar el correo.']
 ].forEach(([title,body,example])=>{
  const card=node('article','mi-structure-card');card.append(node('h4',null,title),node('p',null,body),node('small',null,example));grid.append(card);
 });content.append(grid);
 const controls=node('div','mi-demo-controls');
 const buttons=node('div');
 const simple=node('button',null,'Solo presentar mi idea');simple.type='button';
 const sell=node('button',null,'Vender más adelante');sell.type='button';
 buttons.append(simple,sell);controls.append(buttons);content.append(controls);
 const outcome=node('div','mi-structure-example');content.append(outcome);
 function toggle(selling){
  simple.setAttribute('aria-pressed',String(!selling));sell.setAttribute('aria-pressed',String(selling));
  outcome.replaceChildren();
  if(selling){
   outcome.append(node('strong',null,'Página → pago protegido → pago confirmado → Make → Gmail'),
    node('p',null,'Cuando el negocio sea real, Stripe gestiona la tarjeta en su página segura. Make solo continúa si el pago fue confirmado y no está repetido. Gmail envía el correo. Hay que configurar y probar cada servicio, no ocurre automáticamente.'));
  }else{
   outcome.append(node('strong',null,'Página pública con AppDeploy + fotografías + textos + botón informativo'),
    node('p',null,'Eso basta para empezar. Una web de presentación no necesita usuarios, base de datos ni un sistema de pagos propio. Puedes compartir su dirección pública sin comprar dominio.'));
  }
 }
 simple.addEventListener('click',()=>toggle(false));sell.addEventListener('click',()=>toggle(true));toggle(false);
 content.append(node('p','mi-note','Para empezar puedes usar ChatGPT gratis dentro de sus límites. AppDeploy también ofrece un plan Free con créditos limitados; poder conectarlo como plugin dentro de ChatGPT depende de tu plan y permisos. Plus es opcional para tener más capacidad, no una compra obligatoria para practicar ideas, textos y fotos.')); 
 content.append(node('p','mi-note','Un plugin es una conexión entre ChatGPT y otra herramienta: busca AppDeploy, Google/Gmail, Make o Stripe en Plugins y revisa qué permite tu cuenta. Make tiene plan Free con límites; Gmail personal puede ser gratuito; Stripe cobra comisiones cuando se procesan pagos. Instalar un plugin y contratar un servicio son cosas distintas.'));
 content.append(node('p','mi-note','Nunca coloques contraseñas, claves bancarias ni datos privados en los textos o código visible de la web. Los servicios que manejan pagos y cuentas deben mantenerlos protegidos.'));
 const actions=node('div','mi-actions');const next=node('button','mi-primary','Ordenar mi proyecto');next.type='button';next.addEventListener('click',()=>go('organizacion'));actions.append(next);content.append(actions);
}
export function renderProjectOrder(content){
 header(content,'03 / UN LUGAR PARA CADA COSA','La carpeta de tu primera web.','Crea una carpeta con el nombre de tu negocio en Google Drive. Dentro guarda estas ocho partes y no pierdas tiempo buscando archivos.');
 content.append(node('p','mi-note','Organízate por bloques: por la mañana prepara tus fotografías de marca, textos y referencias; por la tarde construye y prueba en AppDeploy. La profesora ha logrado crear hasta tres webs en un día con este método, según los límites de sus herramientas y la complejidad de cada proyecto. No es una cuota garantizada.'));
 const grid=node('div','mi-folder-grid');content.append(grid);
 for(const [title,description] of folders){const item=node('div','mi-folder-card');item.append(node('strong',null,title),node('span',null,description));grid.append(item);}
 const rules=node('div','mi-structure-example');
 rules.append(node('strong',null,'Tres reglas sencillas'));
 const list=node('ol');
 ['No cambies de negocio durante la clase: empieza y termina con la misma idea.','Antes de cambiar algo, guarda la versión anterior de la foto, el texto o la web.','Las contraseñas, claves, documentos bancarios y datos de clientes no se guardan en carpetas compartidas.'].forEach(line=>{list.append(node('li',null,line));});
 rules.append(list);content.append(rules);
 const prompt='Ayúdame a organizar una primera web para [NOMBRE DEL NEGOCIO]. Crea un plan de ocho carpetas: 00_IDEA, 01_TEXTOS, 02_FOTOS, 03_PROMPTS, 04_DISENO, 05_WEB, 06_PRUEBAS y 07_GASTOS. Explica qué va en cada una y cómo guardar versiones. Evita contraseñas y datos privados. Todo en español claro para alguien que nunca hizo una web.';
 const promptCard=node('div','mi-structure-prompt');
 promptCard.append(node('h4',null,'Instrucción lista para ChatGPT'),node('p',null,prompt));
 const button=node('button',null,'Copiar instrucción');button.type='button';
 const feedback=node('small',null,'');
 button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(prompt);feedback.textContent='Copiado. Ahora puedes pegarlo en ChatGPT.';}catch{feedback.textContent='Selecciona el texto de arriba y cópialo manualmente.';}});
 promptCard.append(button,feedback);content.append(promptCard);
 content.append(node('p','mi-note','Publica primero con la dirección gratuita que te dé AppDeploy. Comprar un dominio propio es una decisión posterior, no un requisito para terminar la clase.'));
 content.append(node('p','mi-note','Aprender a crear webs puede convertirse en un servicio de pago o ayudar a un negocio a conseguir consultas. Las ventas dependen de una oferta real, difusión y seguimiento; no aparecen automáticamente ni de un día para otro.'));
}


/* Ruta de ejecución del alumno: su negocio, no la reproducción literal de Casa Brownie. */
export function renderStudentWebPath(content,go){
 header(content,'TU RUTA / DE LA IDEA AL ENLACE','Construye TU web, paso a paso.','Casa Brownie es el ejemplo que ves en el video. Aquí trabajarás con tu propio producto o servicio. Haz un paso, comprueba el resultado y después continúa.');
 const intro=node('div','mi-path-intro');
 intro.append(node('strong',null,'Tu objetivo: una página clara que puedas abrir desde tu teléfono y compartir con un enlace.'),node('p',null,'No necesitas programar ni comprar un dominio. Para esta primera web basta con una portada, información real, fotografías, un botón que funcione y un pie de página. Los pagos y automatizaciones son opcionales y se ven después.'));
 content.append(intro);
 const steps=[
  {title:'Define tu negocio y el objetivo de la página',time:'Módulos 00 y 01',
   actions:['Escribe el nombre de tu negocio y describe en una frase qué producto o servicio ofreces.','Decide a quién quieres ayudar y qué hará esa persona al visitar la página: conocer tus servicios, ver un catálogo o contactarte.','Abre ChatGPT y pide ayuda para ordenar tu idea, sin inventar precios ni testimonios.'],
   example:'Casa Brownie muestra sus brownies como ejemplo ficticio. Tu página puede ser de limpieza, ropa, postres, belleza o cualquier servicio real.',
   save:'Guarda tu ficha en 00_IDEA.',check:'Puedes explicar tu web en una sola frase.',
   prompt:'Voy a crear mi primera web para [NOMBRE DEL NEGOCIO]. Vendo u ofrezco [PRODUCTO O SERVICIO], ayudo a [TIPO DE CLIENTE] y quiero que el visitante [ACCIÓN PRINCIPAL]. Hazme cinco preguntas sencillas, una por una, para definir la estructura de una página. No inventes datos, precios ni reseñas.'},
  {title:'Ordena tus archivos antes de diseñar',time:'Módulo 01',
   actions:['Entra en Google Drive desde el teléfono y toca Nuevo → Carpeta. Ponle el nombre de tu negocio.','Dentro crea: 00_IDEA, 01_TEXTOS, 02_FOTOS, 03_PROMPTS, 04_DISENO, 05_WEB, 06_PRUEBAS y 07_GASTOS.','Guarda cada imagen por separado y no mezcles fotos de muestra con las de tu negocio.'],
   example:'En el video verás las carpetas de Casa Brownie; tú usa el nombre de tu propio proyecto.',
   save:'Crea las ocho carpetas; no subas contraseñas ni datos privados.',check:'Encuentras una foto y un texto en menos de un minuto.',
   prompt:'Ayúdame a preparar una lista muy sencilla de los archivos que necesito para la web de [NEGOCIO]. Separa textos, fotos, diseño y pruebas. Dime cómo nombrar cada archivo para encontrarlo desde mi teléfono.'},
  {title:'Elige el estilo y prepara tus fotos',time:'Módulos 02 y 03',
   actions:['Busca dos o tres páginas de referencia. Observa sus fotografías, el título inicial y la organización móvil; no copies su identidad.','Elige dos o tres colores y el estilo de letra de tu marca.','Guarda una imagen para la portada y las fotografías de cada producto o servicio. Usa imágenes propias o con derechos de uso; si generas imágenes, revisa los límites de tu plan.'],
   example:'Casa Brownie necesita brownies y cajas de regalo. Un servicio de limpieza necesitará fotos de espacios y resultados auténticos.',
   save:'Fotografías individuales en 02_FOTOS y colores en 04_DISENO.',check:'Las fotos son coherentes, tienen permiso de uso y no están cortadas.',
   prompt:'Mi negocio es [NEGOCIO] y mi público es [CLIENTE]. Propón una dirección visual original para una web de una página: tres colores, estilo de fotografía, tipografías y distribución en teléfono. No copies ninguna marca y no inventes fotos que yo no tenga.'},
  {title:'Escribe el contenido que verá el visitante',time:'Módulo 04',
   actions:['Redacta un título de portada que se entienda en tres segundos: qué ofreces y por qué importa.','Prepara una descripción corta, tus productos o servicios, cómo funciona, preguntas frecuentes y contacto.','Decide el texto del botón principal: Ver servicios, Explorar productos o Solicitar información.'],
   example:'En Casa Brownie aparece «¿Qué llevo de regalo?». Para tu negocio el título debe hablarle a TU cliente.',
   save:'Pon cada texto aprobado en 01_TEXTOS.',check:'Ninguna frase promete algo que no puedas cumplir.',
   prompt:'Escribe los textos de una web de una página para [NEGOCIO], dirigida a [CLIENTE]. Usa SOLO estos datos confirmados: [DATOS]. Entrega: menú, título de portada, subtítulo breve, botón principal, servicios o productos, cómo funciona, FAQ y footer. Lenguaje claro y humano. Marca como PENDIENTE cualquier dato que falte.'},
  {title:'Abre AppDeploy y crea un proyecto nuevo',time:'Módulo 05 · Inicio',
   actions:['En ChatGPT abre Plugins desde el menú y busca AppDeploy. Comprueba si aparece y si tu cuenta y plan permiten conectarlo; revisa los permisos.','Si está disponible, conecta tu cuenta y crea un proyecto NUEVO para tu negocio. No abras la demo de Casa Brownie para editarla.','Si no te aparece o no permite construir, revisa las opciones y límites actuales de AppDeploy antes de pagar. Conserva los prompts para continuar cuando tengas acceso.'],
   example:'La profesora trabaja en su práctica independiente de Casa Brownie. Tú construyes un proyecto distinto con tu propia marca.',
   save:'Nombre del proyecto y primera captura en 05_WEB.',check:'El proyecto nuevo abre y no contiene información de otro negocio.',
   prompt:'Quiero comenzar un proyecto NUEVO en AppDeploy para [NEGOCIO]. Mi web será informativa, de una página, sin pagos ni pedidos activos. Primero crea solo la ESTRUCTURA VACÍA: encabezado, espacio para portada, sección de servicios/productos, sección de información y footer. No añadas imágenes ni datos inventados. Muéstrame el resultado para aprobar antes de seguir.'},
  {title:'Construye una sección cada vez',time:'Módulo 05 · Construcción',
   actions:['En el mismo proyecto, añade el menú y comprueba que funcione. Después agrega la portada con tu título y foto real.','Continúa con productos o servicios, información útil, preguntas frecuentes y footer. Usa un prompt por sección; no pegues todo de una vez.','Tras cada cambio abre la vista previa, comprueba el resultado y guarda la versión anterior si vas a modificar algo importante.'],
   example:'En el video se añaden sabores y regalos. En tu página sustituye esas secciones por lo que tú vendes u ofreces.',
   save:'Capturas de portada, sección principal y footer en 06_PRUEBAS.',check:'Todas las secciones muestran TU contenido y un mismo estilo.',
   prompt:'Continúa mi proyecto EXISTENTE de AppDeploy para [NEGOCIO]. Modifica ÚNICAMENTE [SECCIÓN], utilizando este texto aprobado [TEXTO] y esta imagen que adjunto [IMAGEN]. Mantén todo lo demás igual. Diseño móvil primero, sin desbordes, botón legible y sin inventar información. Enséñame el cambio antes de continuar.'},
  {title:'Prueba la web desde tu teléfono y corrige',time:'Módulo 06',
   actions:['Copia la URL de la vista publicada o de prueba y ábrela en Safari o Chrome, como si fueras una visita nueva.','Revisa que nada se salga de la pantalla, que las fotos carguen y que el texto se lea. Toca menú, botones, enlaces y contacto.','Si un botón falla, haz una captura. Pide que se corrija solo ese problema, sin cambiar el resto. Comprueba otra vez después.'],
   example:'La profesora compara su práctica con Casa Brownie; tú comparas tu web con tu propia ficha de contenido.',
   save:'Antes y después de los cambios en 06_PRUEBAS.',check:'El menú, el CTA y el contacto funcionan en el teléfono. Si tienes acceso a pruebas de otros tamaños, revisa 375 px, tableta y escritorio.',
   prompt:'Revisa la web de mi negocio [URL] desde un enfoque móvil primero. Tengo este problema [DESCRIBIR Y ADJUNTAR CAPTURA]. Corrige únicamente ese problema y conserva colores, textos y fotografías. No afirmes que probaste el enlace si no pudiste abrirlo. Dime cómo verificar el arreglo en mi teléfono.'},
  {title:'Publica, guarda el enlace y presenta tu proyecto',time:'Módulos 07 y 08',
   actions:['Si todo funciona, publica con la dirección disponible de AppDeploy. No necesitas comprar un dominio para terminar esta práctica.','Comprueba que el contacto y los enlaces legales correspondan a los datos que realmente recoge tu web. No actives pagos reales en el ejercicio.','Copia la URL y guarda capturas. Compártelas en Proyectos del Club de Ideas con una pregunta específica si quieres comentarios; usa Ayuda para problemas técnicos.'],
   example:'Casa Brownie no procesa pagos. Tu primera web también puede ser solamente informativa; vender y automatizar son lecciones posteriores.',
   save:'URL final en 05_WEB y capturas finales en 06_PRUEBAS.',check:'Puedes abrir el enlace desde otra pestaña y explicar qué hace el botón principal.',
   prompt:'Hazme una revisión final de mi primera web [URL Y CAPTURAS]. Comprueba estructura, lectura móvil, fotos, botones, contacto y footer solo con la evidencia disponible. Separa errores comprobados de sugerencias. Dame una lista corta para publicar sin activar cobros ni recopilar datos innecesarios.'}
 ];
 const list=node('div','mi-path-steps');
 steps.forEach((step,i)=>{
  const card=node('details','mi-path-step');if(i===0)card.open=true;
  const summary=node('summary');summary.append(node('span','mi-path-number',String(i+1).padStart(2,'0')));
  const label=node('span','mi-path-label');label.append(node('strong',null,step.title),node('small',null,step.time));summary.append(label,node('span','mi-path-plus','+'));card.append(summary);
  const body=node('div','mi-path-body');
  body.append(node('h4',null,'Dónde tocar y qué hacer'));
  const actions=node('ol');step.actions.forEach(a=>actions.append(node('li',null,a)));body.append(actions);
  const example=node('p','mi-path-example');example.append(node('strong',null,'Mira el ejemplo: '),document.createTextNode(step.example));body.append(example);
  const proof=node('div','mi-path-proof');
  const saved=node('p');saved.append(node('strong',null,'Qué guardar: '),document.createTextNode(step.save));
  const check=node('p');check.append(node('strong',null,'Antes de avanzar: '),document.createTextNode(step.check));proof.append(saved,check);body.append(proof);
  const prompt=node('div','mi-path-prompt');prompt.append(node('strong',null,'Prompt para TU negocio'),node('p',null,step.prompt));
  const copy=node('button',null,'Copiar este prompt');copy.type='button';
  const feedback=node('small',null,'');feedback.setAttribute('role','status');
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(step.prompt);feedback.textContent='Copiado. Sustituye los [CORCHETES] por tus datos.';}catch{feedback.textContent='Mantén pulsado el texto y cópialo manualmente.';}});
  prompt.append(copy,feedback);body.append(prompt);card.append(body);list.append(card);
 });
 content.append(list);
 const actions=node('div','mi-actions');
 for(const [name,view] of [['Organizar mis archivos','organizacion'],['Ver biblioteca de prompts','prompts'],['Revisión final','revision']]){const b=node('button',view==='revision'?'mi-primary':'mi-quiet',name);b.type='button';b.addEventListener('click',()=>go(view));actions.append(b);}
 content.append(actions);
 content.append(node('p','mi-note','La práctica del alumno es independiente. El video de hero animado y los pagos no son requisitos de la página principal; nunca compartas contraseñas ni datos privados en prompts o capturas.'));
}

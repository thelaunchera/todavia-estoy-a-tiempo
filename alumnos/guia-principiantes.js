/* Recursos de iniciación dentro de los materiales privados. No crean progreso nuevo. */
const node=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;};
function header(content,kicker,title,description){
 const h=node('header','mi-section-head');
 h.append(node('span','mi-eyebrow',kicker),node('h3',null,title),node('p',null,description));
 content.append(h);
}
const driveFolderPrompt="Voy a crear UNA web para [NOMBRE DEL NEGOCIO]. Con Google Drive conectado y autorizado, EJECUTA las acciones: primero busca una carpeta existente con ese nombre para no duplicar. Si no existe, CREA AHORA la carpeta principal. Dentro CREA o REUTILIZA ocho subcarpetas: 00_IDEA, 01_TEXTOS, 02_FOTOS, 03_PROMPTS, 04_DISENO, 05_WEB, 06_PRUEBAS y 07_GASTOS. Guarda allí, cuando tengas permisos, todos los textos, fotos individuales, prompts y enlaces aprobados del proyecto, sin sobrescribir versiones anteriores. Verifica el resultado y dame los enlaces REALES de Drive a las carpetas. No quiero un plan ni instrucciones manuales. Si falta conectar el servicio o autorizar escritura, pídeme el permiso y explícame qué acción está bloqueada; no afirmes que creaste algo que no pudiste crear. No guardes contraseñas, datos bancarios ni datos privados de clientes. Yo te doy el nombre y apruebo; tú organizas y compruebas.";
const folders=[
 ['00_IDEA','Qué ofrezco, para quién y el objetivo de mi web.'],
 ['01_TEXTOS','Titular, descripción, preguntas frecuentes y texto del botón.'],
 ['02_FOTOS','La IA organiza las fotos individuales aprobadas: portada, productos y regalos.'],
 ['03_PROMPTS','Instrucciones de ChatGPT que dieron buen resultado.'],
 ['04_DISENO','Colores, letras y referencias aprobadas.'],
 ['05_WEB','Enlace público y versión revisada de mi página.'],
 ['06_PRUEBAS','Capturas del teléfono, botones probados y cambios pendientes.'],
 ['07_GASTOS','Costos y renovaciones si algún día compro un servicio.']
];
export function renderWebBasics(content,go){
 header(content,'ENTIENDE TU WEB','Tu web tiene una parte visible y otra que trabaja detrás.','Mira qué se ve y qué pasa por detrás. Vamos a entenderlo con Casa Brownie antes de conectar herramientas que todavía no necesitamos.');
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
 content.append(node('p','mi-note','Un plugin es una conexión entre ChatGPT y otra herramienta: busca AppDeploy, Google Drive, Gmail, Make o Stripe en Plugins y revisa qué permite tu cuenta. Make tiene plan Free con límites; Gmail personal puede ser gratuito; Stripe cobra comisiones cuando se procesan pagos. Instalar un plugin y contratar un servicio son cosas distintas.'));
 content.append(node('p','mi-note','Nunca coloques contraseñas, claves bancarias ni datos privados en los textos o código visible de la web. Los servicios que manejan pagos y cuentas deben mantenerlos protegidos.'));
 const actions=node('div','mi-actions');const next=node('button','mi-primary','Ordenar mi proyecto');next.type='button';next.addEventListener('click',()=>go('organizacion'));actions.append(next);content.append(actions);
}
export function renderProjectOrder(content){
 header(content,'GOOGLE DRIVE + IA','ChatGPT crea las carpetas por ti.','Dile el nombre de tu negocio, conecta Google Drive y autoriza. La IA creará las carpetas reales, organizará tus recursos cuando tenga permiso y te dará los enlaces.');
 content.append(node('p','mi-note','Este es el resultado que hará ChatGPT por ti; no necesitas crear manualmente estas ocho carpetas.'));
 const grid=node('div','mi-folder-grid');content.append(grid);
 for(const [title,description] of folders){const card=node('div','mi-folder-card');card.append(node('strong',null,title),node('span',null,description));grid.append(card);}
 const rules=node('div','mi-structure-example');
 rules.append(node('strong',null,'Tu parte es aprobar. ChatGPT hace el trabajo.'));
 const list=node('ol');
 ['Autoriza Google Drive desde ChatGPT, incluyendo la creación y escritura de archivos.','Copia el único prompt. ChatGPT crea o reutiliza las carpetas y coloca los archivos aprobados cuando los tenga.','Abre los enlaces que ChatGPT entregue para verificar la creación real. Si el permiso no está disponible, debe decirlo, no fingir que terminó.'].forEach(s=>list.append(node('li',null,s)));
 rules.append(list);content.append(rules);
 const promptCard=node('div','mi-structure-prompt');
 promptCard.append(node('h4',null,'Una instrucción: la IA crea tu Drive'),node('p',null,driveFolderPrompt));
 const copy=node('button',null,'Copiar prompt · crear carpetas');copy.type='button';const feedback=node('small',null,'');
 copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(driveFolderPrompt);feedback.textContent='Copiado. Pégalo en ChatGPT con Google Drive conectado.';}catch{feedback.textContent='Selecciona el texto y cópialo.';}});
 promptCard.append(copy,feedback);content.append(promptCard);
 content.append(node('p','mi-note','Nunca pongas contraseñas, claves ni datos de clientes en las carpetas compartidas. El resultado debe tener enlaces que abran, no solamente nombres de carpetas.'));
}

/* Ruta de ejecución del alumno: su negocio, no la reproducción literal de Casa Brownie. */
export function renderStudentWebPath(content,go){
 header(content,'TU RUTA DE CREACIÓN','Dirige a ChatGPT: la IA construye tu web.','Casa Brownie es el ejemplo. Tú describes tu negocio, conectas las herramientas y apruebas. ChatGPT realiza las tareas con los conectores disponibles y autorizados; no necesitas programar ni montar la web manualmente.');
 const intro=node('div','mi-path-intro');
 intro.append(node('strong',null,'Tu objetivo: una página clara que puedas abrir desde tu teléfono y compartir con un enlace.'),node('p',null,'No necesitas programar ni comprar un dominio. Para esta primera web basta con una portada, información real, fotografías, un botón que funcione y un pie de página. Los pagos y automatizaciones son opcionales y se ven después.'));
 intro.append(node('p',null,'Orden de la clase: describes tu negocio → autorizas Drive y AppDeploy → ChatGPT crea las carpetas REALES → investiga, redacta, genera y organiza fotos → construye la web → te entrega el enlace → corrige lo que apruebes. Si una conexión no permite una acción, ChatGPT debe explicarlo, no fingir que terminó. El video del hero es un bono separado.'));
 intro.append(node('p',null,'Tu parte es explicar tu negocio, autorizar las herramientas y aprobar el resultado. La IA realiza el trabajo técnico y organiza tus archivos con los conectores disponibles. Ninguna conexión ni automatización se activa sin tu autorización.'));
 content.append(intro);
 const steps=[
  {title:'Define tu negocio y el objetivo de la página',time:'Módulos 00 y 01',
   actions:['Escribe el nombre de tu negocio y describe en una frase qué producto o servicio ofreces.','Decide a quién quieres ayudar y qué hará esa persona al visitar la página: conocer tus servicios, ver un catálogo o contactarte.','Abre ChatGPT y pide ayuda para ordenar tu idea, sin inventar precios ni testimonios.'],
   example:'Casa Brownie muestra sus brownies como ejemplo ficticio. Tu página puede ser de limpieza, ropa, postres, belleza o cualquier servicio real.',
   save:'Guarda tu ficha en 00_IDEA.',check:'Puedes explicar tu web en una sola frase.',
   prompt:'Voy a crear mi primera web para [NOMBRE DEL NEGOCIO]. Vendo u ofrezco [PRODUCTO O SERVICIO], ayudo a [TIPO DE CLIENTE] y quiero que el visitante [ACCIÓN PRINCIPAL]. Hazme cinco preguntas sencillas, una por una, para definir la estructura de una página. No inventes datos, precios ni reseñas.'},
  {title:'ChatGPT crea tus carpetas en Drive',time:'Módulo 01 · Google Drive',
    actions:['Dile a ChatGPT el nombre de tu negocio y autoriza Google Drive cuando te lo solicite.','Pega el único prompt de «Mi proyecto organizado». ChatGPT CREA o reutiliza las carpetas; tú no tienes que hacerlo manualmente.','Pide que coloque los recursos producidos dentro de la estructura con los permisos disponibles y te entregue enlaces de Drive.','Abre un enlace para comprobar. Si falta permiso, ChatGPT debe solicitarlo, sin declarar completado lo que no ejecutó.'],
    example:'Casa Brownie es el proyecto de ejemplo. En tu propia carpeta la IA usa el nombre de TU marca.',
    save:'ChatGPT crea las carpetas y devuelve sus enlaces reales.',check:'Los enlaces abren las ocho carpetas de tu negocio.',
    prompt:driveFolderPrompt},
   {title:'Moodboard con los 8 Master Prompts gratuitos',time:'Módulo 02 · Primero la dirección visual',
   actions:['Abre los 8 Master Prompts originales en el freebie gratuito de Content Lab. Si todavía no tienes acceso, usa el flujo de correo del freebie para obtenerlos.','Explora los ocho estilos: Asymmetric Editorial, Monumental Center, Type Behind Product, Side-Cropped Close-Up, Offset Negative Space, Diagonal Visual Flow, Vertical Editorial Stack y Magazine Column Split. Son composiciones, no ocho fotos obligatorias.','Elige dos estilos que tengan sentido para tu negocio. Con ChatGPT y tus referencias crea un moodboard con colores, tipografías, luz, materiales y encuadres.','Decide tres reglas que mantendrás en todas las fotografías y guárdalas. El moodboard orienta el diseño; no es la imagen que se pone entera en el hero.'],
   example:'Casa Brownie: Offset Negative Space puede orientar una portada con espacio para el texto, y Side-Cropped Close-Up puede destacar la textura de un brownie.',
   save:'Moodboard en 04_DISENO y estilos seleccionados en 03_PROMPTS.',check:'Sabes explicar cómo quieres que se vea tu marca antes de abrir AppDeploy.',
   prompt:'Estoy creando mi primera web para [NEGOCIO] dirigida a [CLIENTE]. Tengo acceso a los 8 Master Prompts gratuitos y he elegido [ESTILO 1] y [ESTILO 2] para mi dirección visual. Quiero un moodboard original que defina paleta de 3 colores, dos estilos tipográficos, iluminación, fondos, superficies y composición de la portada. Usa solo las referencias que adjunte y no inventes marca, fotos, etiquetas ni reseñas. Explica cómo esas decisiones servirán a la web, no solo a un post.'},
  {title:'Fotos principales a partir del moodboard',time:'Módulo 03 · Antes de AppDeploy',
   actions:['Entrega a ChatGPT el moodboard y las referencias aprobadas.','Pídele a la IA que genere la fotografía del hero y las fotos individuales; tú solo revisas y apruebas.','ChatGPT debe guardar las fotos aprobadas en Drive → 02_FOTOS y entregarte sus enlaces si el conector permite subir archivos.'],
   example:'Casa Brownie: hero sin video, seis fotos de sabores y dos regalos; tu negocio solo necesita las fotos de sus propios productos o servicios.',
   save:'HERO_ESTATICO y fotos individuales en 02_FOTOS.',check:'Fotos coherentes con el moodboard, separadas, bien encuadradas y con permiso de uso.',
   prompt:'Con mi moodboard aprobado y una imagen de referencia adjunta, prepara UNA foto principal editorial para [NEGOCIO]. Tema: [PRODUCTO/SERVICIO]. Composición de mis 8 Master Prompts: [ESTILO ELEGIDO]. Luz: [LUZ]. Colores: [PALETA]. Fotografía realista, formato horizontal adaptable a móvil, producto fiel a su referencia y espacio libre para añadir el texto en el sitio después. No incluyas letras falsas ni logotipos inventados. Si falta la imagen necesaria, pídemela primero. Entrega una foto, no un collage.'},
  {title:'Escribe el contenido que verá el visitante',time:'Módulo 04',
   actions:['Pide a ChatGPT que redacte el título, subtítulo, productos o servicios, FAQ y contacto a partir de tus datos reales.','Tú solo revisas y apruebas; la IA guarda los textos en Drive → 01_TEXTOS cuando tenga permisos.','Usa una fotografía estática en el hero. El video es un bono separado.'],
   example:'En Casa Brownie aparece «¿Qué llevo de regalo?». Para tu negocio el título debe hablarle a TU cliente.',
   save:'Pon cada texto aprobado en 01_TEXTOS.',check:'Ninguna frase promete algo que no puedas cumplir.',
   prompt:'Escribe los textos de una web de una página para [NEGOCIO], dirigida a [CLIENTE]. Usa SOLO estos datos confirmados: [DATOS]. Entrega: menú, título de portada, subtítulo breve, botón principal, servicios o productos, cómo funciona, FAQ y footer. Lenguaje claro y humano. Marca como PENDIENTE cualquier dato que falte.'},
  {title:'Pide a ChatGPT tu primer mockup con AppDeploy',time:'Módulo 05 · Inicio',
   actions:['En ChatGPT abre Plugins desde el menú, busca AppDeploy y conéctalo si está disponible para tu cuenta. Revisa los permisos antes de autorizar.','En el mismo chat, explica qué negocio estás creando, comparte tus textos y dirección visual, y pide a ChatGPT que use AppDeploy para construir el primer mockup. No necesitas abrir la app de AppDeploy ni programar.','Cuando el primer mockup esté listo, ChatGPT te dará una URL de vista previa. Ábrela y revisa qué está bien y qué falta antes de pedir cambios. Si la conexión no está disponible, no pagues sin revisar primero las opciones.'],
   example:'La profesora trabaja en su práctica independiente de Casa Brownie. Tú construyes un proyecto distinto con tu propia marca.',
   save:'URL del primer mockup y captura en 05_WEB.',check:'Puedes abrir la URL del primer mockup y comprobar que muestra tu negocio, no el de otra persona.',
   prompt:'Usa el plugin de AppDeploy conectado a este chat para crear el PRIMER MOCKUP de una web de una página para [NEGOCIO]. Aquí están mi objetivo, textos aprobados y dirección visual: [DATOS]. El hero debe comunicar claramente [MENSAJE PRINCIPAL DEL NEGOCIO]; no quiero video ni animaciones obligatorias. Incluye encabezado, portada, servicios/productos, información y footer. No inventes datos. Cuando termines, dame aquí la URL de vista previa para revisar el primer resultado. No necesito entrar a construir manualmente en AppDeploy.'},
  {title:'Corrige el mockup y añade tus fotos',time:'Módulo 05 · Construcción',
   actions:['Abre la URL del primer mockup que ChatGPT te dio y revisa el hero, los textos, el menú y las secciones.','En el mismo chat pide a ChatGPT que corrija una sección específica y que añada tus fotografías aprobadas donde correspondan. Puedes adjuntar una captura para señalar exactamente qué cambiar.','Después de cada cambio vuelve a abrir la URL, comprueba el resultado y continúa con la siguiente corrección. No necesitas editar manualmente dentro de AppDeploy.'],
   example:'En el video se añaden sabores y regalos. En tu página sustituye esas secciones por lo que tú vendes u ofreces.',
   save:'Capturas de portada, sección principal y footer en 06_PRUEBAS.',check:'Todas las secciones muestran TU contenido y un mismo estilo.',
   prompt:'Continúa mi proyecto EXISTENTE de AppDeploy para [NEGOCIO]. Modifica ÚNICAMENTE [SECCIÓN], utilizando este texto aprobado [TEXTO] y esta imagen que adjunto [IMAGEN]. Mantén todo lo demás igual. Diseño móvil primero, sin desbordes, botón legible y sin inventar información. Enséñame el cambio antes de continuar.'},
  {title:'Prueba la web desde tu teléfono y corrige',time:'Módulo 06',
   actions:['Copia la URL de la vista publicada o de prueba y ábrela en Safari o Chrome, como si fueras una visita nueva.','Revisa que nada se salga de la pantalla, que las fotos carguen y que el texto se lea. Toca menú, botones, enlaces y contacto.','Si un botón falla, haz una captura. Pide que se corrija solo ese problema, sin cambiar el resto. Comprueba otra vez después.'],
   example:'La profesora compara su práctica con Casa Brownie; tú comparas tu web con tu propia ficha de contenido.',
   save:'Antes y después de los cambios en 06_PRUEBAS.',check:'El menú, el CTA y el contacto funcionan en el teléfono. Si tienes acceso a pruebas de otros tamaños, revisa 375 px, tableta y escritorio.',
   prompt:'Revisa la web de mi negocio [URL] desde un enfoque móvil primero. Tengo este problema [DESCRIBIR Y ADJUNTAR CAPTURA]. Corrige únicamente ese problema y conserva colores, textos y fotografías. No afirmes que probaste el enlace si no pudiste abrirlo. Dime cómo verificar el arreglo en mi teléfono.'},
  {title:'Publica, guarda el enlace y presenta tu proyecto',time:'Módulos 07 y 08',
   actions:['Pide a ChatGPT que publique mediante AppDeploy, si la integración lo permite, y te entregue la URL. Confirma que el enlace funciona antes de compartirlo. No necesitas comprar un dominio para terminar la práctica.','Comprueba que el contacto y los enlaces legales correspondan a los datos que realmente recoge tu web. No actives pagos reales en el ejercicio.','Copia la URL y guarda capturas. Compártelas en Proyectos del Club de Ideas con una pregunta específica si quieres comentarios; usa Ayuda para problemas técnicos.'],
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
  if(i===2){const link=node('a','mi-path-freebie-link','Abrir mis 8 Master Prompts gratuitos');link.href='https://podcast.thelaunchera.com/content-lab/prompts/';link.target='_blank';link.rel='noopener noreferrer';body.append(link);}
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
 content.append(node('p','mi-note','La práctica del alumno es independiente. El video animado del hero se aborda solo en un bono separado; no está incluido en la web básica. Los pagos tampoco son un requisito; nunca compartas contraseñas ni datos privados en prompts o capturas.'));
}

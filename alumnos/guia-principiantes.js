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
 ['02_FOTOS','Imágenes separadas: HERO, PRODUCTO y DETALLE.'],
 ['03_PROMPTS','Instrucciones de ChatGPT que dieron buen resultado.'],
 ['04_DISENO','Colores, letras y referencias aprobadas.'],
 ['05_WEB','Enlace público y versión revisada de mi página.'],
 ['06_PRUEBAS','Capturas del teléfono, botones probados y cambios pendientes.'],
 ['07_GASTOS','Costos y renovaciones si algún día compro un servicio.']
];
export function renderWebBasics(content,go){
 header(content,'02 / ENTENDER PARA CONSTRUIR','Tu web tiene una parte visible y otra que trabaja detrás.','Conocer la diferencia te ayuda a elegir solo las herramientas que necesitas. No requiere aprender programación.');
 const grid=node('div','mi-structure-grid');
 [
  ['Frontend · la parte visible','Es lo que cualquier persona ve: fotografías, título, menú, colores, botones y diseño para teléfono.','En Casa Brownie, el frontend muestra la foto, la información del producto y «Conoce el proyecto».'],
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
 content.append(node('p','mi-note','Nunca coloques contraseñas, claves bancarias ni datos privados en los textos o código visible de la web. Los servicios que manejan pagos y cuentas deben mantenerlos protegidos.'));
 const actions=node('div','mi-actions');const next=node('button','mi-primary','Ordenar mi proyecto');next.type='button';next.addEventListener('click',()=>go('organizacion'));actions.append(next);content.append(actions);
}
export function renderProjectOrder(content){
 header(content,'03 / UN LUGAR PARA CADA COSA','La carpeta de tu primera web.','Crea una carpeta con el nombre de tu negocio en Google Drive. Dentro guarda estas ocho partes y no pierdas tiempo buscando archivos.');
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
}

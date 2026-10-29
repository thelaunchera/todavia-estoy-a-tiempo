/* Recursos complementarios leídos después del control de acceso al aula.
   Los comandos y las instrucciones de Mara viven en Supabase; NO incrustarlos aquí. */
const make=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;};
async function copiar(value,feedback){
 try{await navigator.clipboard.writeText(value);feedback.textContent='Copiado. Pégalo en tu propio proyecto de ChatGPT.';}
 catch{feedback.textContent='Mantén presionado el texto para seleccionarlo y copiarlo.';}
}
function heading(root,label,title,description){
 const h=make('header','mi-section-head');
 h.append(make('span','mi-eyebrow',label),make('h3','',title),make('p','',description));root.append(h);
}
function prompt(root,title,value){
 const card=make('div','mi-extras-prompt');
 card.append(make('h4','',title),make('p','mi-extras-prompt-text',value));
 const button=make('button','mi-extras-copy','Copiar instrucciones');button.type='button';
 const feedback=make('span','mi-extras-feedback','');feedback.setAttribute('role','status');
 button.addEventListener('click',()=>void copiar(value,feedback));card.append(button,feedback);root.append(card);
}
function missing(root){root.append(make('p','mi-note','Este material todavía está en preparación. Tu avance no se pierde.'))}
function list(root,items){
 const ol=make('ol','mi-extras-steps');
 (Array.isArray(items)?items:[]).forEach(item=>ol.append(make('li','',item)));
 root.append(ol);
}
export function renderMakeResources(root,extras){
 heading(root,'AUTOMATIZACIONES / GRATIS','Dos escenarios útiles para empezar.','Make Free permite hasta dos escenarios activos y 1,000 créditos al mes. Los escenarios programados tienen un intervalo mínimo de 15 minutos; las activaciones por webhook pueden ser inmediatas. No necesitas activar ambos.');
 if(!Array.isArray(extras?.scenarios))return missing(root);
 const stat=make('div','mi-extras-stats');
 [['2','escenarios activos como máximo'],['1,000','créditos por mes'],['15 min','intervalo mínimo programado'],['5 min','máximo por ejecución']].forEach(([value,label])=>{const box=make('div','');box.append(make('strong','',value),make('span','',label));stat.append(box);});
 root.append(stat);
 extras.scenarios.forEach(s=>{
  const card=make('article','mi-extras-card');
  card.append(make('span','mi-extras-kicker',s.tag||''),make('h4','',s.title||''),make('p','mi-extras-flow',s.flow||''));
  card.append(make('h5','','Cómo prepararlo, paso a paso'));list(card,s.steps);
  card.append(make('h5','','Qué debe pasar en una prueba'),make('p','',s.test||''));
  if(s.limit)card.append(make('p','mi-note',s.limit));
  prompt(card,'Comando para que ChatGPT te guíe',s.prompt||'');root.append(card);
 });
 root.append(make('p','mi-note','Un comando explica la automatización; NO la crea por sí solo. Para ejecutarla necesitarás conectar tus cuentas y autorizar el servicio correspondiente. Usa Run once con datos propios y deja todo desactivado hasta comprobarlo.'));
}
function safetyLegal(root,kicker,title,intro,items){
 heading(root,kicker,title,intro);
 if(!Array.isArray(items))return missing(root);
 items.forEach((item,i)=>{
  const box=make('article','mi-extras-card');
  box.append(make('span','mi-extras-kicker','PASO '+String(i+1).padStart(2,'0')),make('h4','',item.title),make('p','',item.explain));
  prompt(box,'Instrucción propia para ChatGPT',item.prompt);root.append(box);
 });
}
export function renderSafetyResources(root,extras){
 safetyLegal(root,'SEGURIDAD / OBLIGATORIO','Tus contraseñas y claves no van dentro de la web.','Aprende a guardar los accesos, distinguir las API keys publicables de las secretas y revisar qué permisos tienen las conexiones. No compartas contraseñas, códigos ni claves con ChatGPT, profesores o compañeros.',extras?.security);
}
export function renderLegalResources(root,extras){
 safetyLegal(root,'PIE DE PÁGINA / REVISIÓN','El footer también es parte de una web profesional.','Los enlaces deben funcionar y reflejar tu negocio real. Privacidad, términos, devoluciones, cookies y accesibilidad dependen de lo que hagas y de dónde operes. Estos prompts son una guía educativa, no sustituyen asesoría legal.',extras?.legal);
 const box=make('div','mi-structure-example');
 box.append(make('strong','','Una comprobación que nunca debes saltarte'),make('p','','Abre tu web en el teléfono. Toca cada enlace del pie de página y verifica que lleve a un contenido real. No publiques políticas copiadas de otra empresa ni textos que no describen tus procesos.'));
 root.append(box);
}
export function renderWebGuide(root,extras){
 heading(root,'TU ASISTENTE / PROYECTO PRIVADO','Mara · tu guía web','Mara es una forma de configurar tu propio Proyecto de ChatGPT con las instrucciones de la clase. No es un GPT aparte ni un chat compartido: cada estudiante tiene su propio espacio y conserva sus ideas y archivos.');
 const a=extras?.agent;
 if(!a||!a.instructions)return missing(root);
 const steps=make('article','mi-extras-card');steps.append(make('h4','','Cómo activar tu acompañante'),make('p','','Hazlo una sola vez en TU cuenta de ChatGPT. No compartas el proyecto: en los proyectos compartidos, otras personas pueden ver tus chats y archivos.'));
 list(steps,a.setup);
 const start=make('a','mi-extras-open','Abrir ChatGPT');start.href='https://chatgpt.com/';start.target='_blank';start.rel='noopener noreferrer';steps.append(start);
 root.append(steps);
 prompt(root,'1 · Copia estas instrucciones a «Configuración del proyecto»',a.instructions);
 prompt(root,'2 · Inicia la primera conversación',a.first_prompt);
 const note=make('div','mi-structure-example');
 note.append(make('strong','','Lo que sí hace Mara'),make('p','','Te pregunta por tu idea, organiza lo que ya decidiste, redacta prompts, revisa capturas, explica clics y te acompaña hasta comprobar tu web.'));
 note.append(make('strong','','Lo que no hace por sí sola'),make('p','','No crea una cuenta, no publica una página ni conecta o ejecuta automatizaciones sin herramientas disponibles, permisos y comprobaciones. No le envíes información privada.'));
 root.append(note);
}

export function renderConnectorPrompts(root,extras){
 heading(root,'CONEXIONES / UN PASO A LA VEZ','Qué pedirle a ChatGPT con cada herramienta.','Primero conecta tus propias cuentas y revisa permisos. Estos comandos NO conceden acceso ni ejecutan una acción por sí mismos. Si no tienes el plugin, ChatGPT debe explicarte cómo hacerlo en la página oficial.');
 if(!Array.isArray(extras?.connector_prompts))return missing(root);
 extras.connector_prompts.forEach((item,i)=>{
  const box=make('article','mi-extras-card');
  box.append(make('span','mi-extras-kicker','CONEXIÓN '+String(i+1).padStart(2,'0')),make('h4','',item.name),make('p','',item.purpose));
  box.append(make('h5','','Primero prepara esto'));list(box,item.steps);
  prompt(box,'Comando para ChatGPT',item.prompt);root.append(box);
 });
 root.append(make('p','mi-note','Cada conexión tiene permisos distintos y el servicio puede limitar su plan gratuito. No publiques una web, no cobres y no envíes mensajes sin revisar primero qué hace la acción.'));
}

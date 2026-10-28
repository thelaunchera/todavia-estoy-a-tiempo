/* Biblioteca del alumno — texto revisado contra el PDF editorial 01_Biblioteca_de_prompts_EDITORIAL.pdf (28 oct 2026).
   La biblioteca de Sites es pública para quien tenga el enlace. La experiencia integrada
   se presenta solo después de la verificación de acceso del aula. */
const ORIGINAL_LIBRARY='https://dailin-prompts-landing.thelaunchera.chatgpt.site';
const GROUPS=[
 {id:'todos',label:'Todos'},
 {id:'oferta',label:'01–03 · La oferta'},
 {id:'crear',label:'04–06 · Crear'},
 {id:'entrega',label:'07–10 · Cobro y entrega'},
 {id:'publicar',label:'11–12 · Publicar'}
];
const PROMPTS=[
 {id:'01',group:'oferta',step:'ANTES DE ELEGIR COLORES',title:'Define tu oferta',after:'Sabrás describir tu oferta en dos frases concretas.',prompt:`Mi negocio está en [INDUSTRIA]. Quiero ofrecer [OFERTA] a [CLIENTE IDEAL]. Mis datos confirmados son [DATOS]. Organiza qué se compra, qué incluye, precio y moneda si corresponde, cómo se recibe y cuál es el botón principal. Señala lo que falta y hazme primero tres preguntas esenciales. No inventes fechas, resultados, reseñas ni credenciales.`},
 {id:'02',group:'oferta',step:'TRES REFERENCIAS QUE ENSEÑAN',title:'Busca inspiración',after:'Abre las tres páginas antes de continuar.',prompt:`Busca tres páginas accesibles que ofrezcan [PRODUCTO O SERVICIO] a [CLIENTE] en [IDIOMA O PAÍS]. Indica URL, contenido principal, fotografías, llamadas a la acción y cómo aclaran precio o reserva. Separa hechos observados de inferencias. Si no puedes abrir un sitio, dilo; no atribuyas ventas a su diseño.`},
 {id:'03',group:'oferta',step:'INSPIRARTE SIN COPIAR',title:'Elige qué adaptar',after:'Escribe por qué elegiste cada decisión.',prompt:`Estas son mis tres referencias y mis notas: [ENLACES Y OBSERVACIONES]. Mi oferta es [FICHA]. Compara claridad, estructura, fotografía y uso de botones. Elige tres decisiones útiles para adaptar y tres cosas que no encajan. Diseña una estructura original sin copiar textos, marcas, imágenes ni afirmar resultados de ventas.`},
 {id:'04',group:'crear',step:'TEXTOS CON INTENCIÓN',title:'Escribe tu página',after:'Lee cada promesa y comprueba que puedes cumplirla.',prompt:`Escribe una landing en [IDIOMA] para esta oferta confirmada: [FICHA]. Ordena: título, propuesta, beneficios concretos, detalles de lo que recibe, cómo funciona, preguntas frecuentes, contacto y una acción principal [CTA]. Usa tono [TONO]. No inventes urgencia, reseñas, descuentos, garantías ni credenciales. Marca los datos sin confirmar.`},
 {id:'05',group:'crear',step:'DE LAS SECCIONES A LA PÁGINA',title:'Construye el borrador',after:'Abre la vista previa; no confíes solo en la miniatura.',prompt:`Necesito un borrador de landing para [OFERTA]. Tengo textos aprobados [TEXTOS], imágenes [ARCHIVOS] y estilo visual [DIRECCIÓN]. Revisa qué constructor y acciones están disponibles. Prioriza móvil, contraste y fotos sin deformar. Agrega solo funciones verificables y un CTA [BOTÓN]. Si no hay checkout, déjalo como pendiente. Muéstrame qué construiste y qué falta.`},
 {id:'06',group:'crear',step:'COMPRUEBA LA EXPERIENCIA REAL',title:'Corrige en móvil',after:'Vuelve a abrir la página desde un teléfono real.',prompt:`Revisa mi landing con estas capturas o URL: [EVIDENCIA]. Comprueba tamaño de letra, recortes, orden de secciones, elementos fuera de pantalla, contraste, carga de fotos y facilidad para tocar el botón. Corrige lo que puedas comprobar y separa los cambios pendientes. No afirmes que el cobro funciona por ver un botón.`},
 {id:'07',group:'entrega',step:'SOLO PARA OFERTAS ADMITIDAS',title:'Prepara el checkout',after:'La compatibilidad con el proveedor va antes de crear el enlace.',prompt:`Mi oferta es [OFERTA] y mi país es [PAÍS]. Confirma si Stripe admite esta actividad. Si no la admite, no crees un checkout. Si está admitida, verifica qué cuenta y entorno de prueba utilizo, producto, precio, moneda y modalidad de cobro. Muéstrame la configuración antes de crear recursos. No incluyas claves ni datos privados.`},
 {id:'08',group:'entrega',step:'PRIMERO COMPRUEBA EL ENTORNO',title:'Crea el enlace de prueba',after:'Abre el checkout de prueba y comprueba el importe.',prompt:`La configuración aprobada para una oferta admitida es [DATOS VERIFICADOS]. Crea solamente los recursos necesarios en entorno de prueba, revisa si ya existen para no duplicar, e indica producto, importe, moneda, pago único o recurrente y enlace resultante. No actives cobros reales ni cambies otros ajustes. Si no puedes hacerlo, explica los pasos que debo seguir.`},
 {id:'09',group:'entrega',step:'UN DESTINO COMPROBADO',title:'Conecta el botón',after:'Pulsa cada botón como si fueras una persona compradora.',prompt:`Mi landing de prueba usa el botón [TEXTO]. Conéctalo a [ENLACE DE PRUEBA VERIFICADO] solo si mi oferta está admitida. Revisa que los botones lleven al producto correcto, con importe y moneda coherentes. No expongas claves. Comprueba también en móvil, distinguiendo una comprobación real de algo pendiente.`},
 {id:'10',group:'entrega',step:'DESPUÉS DEL PAGO',title:'Prepara la entrega',after:'Define qué recibe la persona y cuándo lo recibe.',prompt:`Mi oferta admitida es [OFERTA]; entrego [RECURSO O SERVICIO] mediante [MÉTODO] en [PLAZO]. Diseña un mensaje de confirmación y un correo breve de instrucciones, con acceso, soporte y solución si falla la entrega. Si automatizo, necesito verificar pago confirmado y producto correcto; no usar la página de gracias como prueba de pago.`},
 {id:'11',group:'publicar',step:'EVIDENCIA, NO SUPOSICIONES',title:'Revisa las pruebas',after:'Corrige un problema por vez y vuelve a comprobar.',prompt:`Estas son las pruebas que observé: [CAPTURAS Y RESULTADOS]. Revisa coherencia entre landing, teléfono, enlaces, checkout si aplica, confirmación, correo y acceso. Clasifica cada paso en: comprobado, falló o pendiente. Para cada fallo, explica cómo corregirlo y cómo repetir la prueba. Evita datos privados.`},
 {id:'12',group:'publicar',step:'ANTES DE COMPARTIR EL ENLACE',title:'Prepara tu lanzamiento',after:'Confirma que tu página pública no tenga datos de demostración.',prompt:`Mi oferta y resultados verificados son [FICHA Y PRUEBAS]. Revisa textos, imágenes autorizadas, información legal pertinente, contacto, enlaces, visibilidad pública, cobro y entrega si aplican. Prepara un anuncio claro y un seguimiento útil sin urgencia o testimonios falsos. Distingue lo que puedo publicar de lo pendiente.`}
];
function el(tag,klass,content){
 const node=document.createElement(tag);
 if(klass)node.className=klass;
 if(content!==undefined)node.textContent=content;
 return node;
}
async function copyPrompt(value,button,feedback){
 let success=false;
 try{
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);success=true;}
 }catch{ /* Safari privado o permiso bloqueado: intentar copia por selección. */ }
 if(!success){
  const field=button.closest('.prompt-card')?.querySelector('textarea');
  if(field){field.focus();field.select();try{success=document.execCommand('copy');}catch{success=false;}}
 }
 button.textContent=success?'Copiado':'Copiar prompt';
 feedback.textContent=success?'Prompt copiado. Puedes pegarlo en ChatGPT.':'Selecciona el texto y usa Copiar en tu teléfono o computadora.';
}
export function mountPromptLibrary(root){
 if(!root||root.dataset.ready==='true')return;
 root.dataset.ready='true';
 const controls=el('div','prompt-controls');
 const search=el('input','prompt-search');
 search.type='search';search.placeholder='Buscar entre los 12 prompts…';search.setAttribute('aria-label','Buscar prompts por palabra o tema');
 const filter=el('div','prompt-filters');filter.setAttribute('role','group');filter.setAttribute('aria-label','Filtrar prompts por etapa');
 const result=el('p','prompt-result');result.setAttribute('role','status');result.setAttribute('aria-live','polite');
 const list=el('div','prompt-cards');
 let selected='todos';
 const cards=[];
 for(const item of PROMPTS){
  const card=el('article','prompt-card');card.dataset.group=item.group;
  const top=el('div','prompt-card-top');
  top.append(el('span','prompt-index',item.id),el('span','prompt-step',item.step));
  const title=el('h2','prompt-card-title',item.title);
  const hint=el('p','prompt-instruction','Sustituye los textos entre corchetes por tus datos y revisa la respuesta.');
  const field=el('textarea','prompt-editor');field.value=item.prompt;field.rows=6;
  field.setAttribute('aria-label','Texto editable del prompt '+item.id+': '+item.title);
  field.spellcheck=false;
  const actions=el('div','prompt-card-actions');
  const button=el('button','prompt-copy','Copiar prompt');button.type='button';
  const feedback=el('span','prompt-copy-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  button.addEventListener('click',()=>void copyPrompt(field.value,button,feedback));
  field.addEventListener('input',()=>{button.textContent='Copiar prompt';feedback.textContent='';});
  actions.append(button,feedback);
  const after=el('p','prompt-after','ANTES DE CONTINUAR · '+item.after);
  card.append(top,title,hint,field,actions,after);
  list.appendChild(card);cards.push({item,card});
 }
 function render(){
  const q=search.value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  let count=0;
  for(const {item,card} of cards){
   const searchable=[item.id,item.step,item.title,item.prompt].join(' ').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
   const visible=(selected==='todos'||item.group===selected)&&(!q||searchable.includes(q));
   card.hidden=!visible;if(visible)count++;
  }
  for(const b of filter.querySelectorAll('button'))b.setAttribute('aria-pressed',b.dataset.filter===selected?'true':'false');
  result.textContent=count===1?'1 prompt disponible':count+' prompts disponibles';
 }
 for(const group of GROUPS){
  const button=el('button','prompt-filter',group.label);button.type='button';button.dataset.filter=group.id;
  button.addEventListener('click',()=>{selected=group.id;render();});filter.appendChild(button);
 }
 search.addEventListener('input',render);
 controls.append(search,filter,result);
 const note=el('p','prompt-library-note','Los cambios que hagas aquí son temporales. No incluyas contraseñas ni datos de otras personas. Comprueba siempre el resultado de ChatGPT.');
 const original=el('a','prompt-original','Abrir la biblioteca original en Sites');
 original.href=ORIGINAL_LIBRARY;original.target='_blank';original.rel='noopener noreferrer';
 const footer=el('p','prompt-original-note');footer.append('¿Prefieres la versión de Sites? ',original,'. Se abre fuera del aula y ese enlace puede compartirse.');
 root.replaceChildren(controls,list,note,footer);
 render();
}

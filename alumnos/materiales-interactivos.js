/* Tu primera landing con IA · Materiales activos de la clase
   Español latino y trabajo por alumno. No instala enlaces públicos a los PDF antiguos. */
/* Los prompts y ejercicios se leen de Supabase solo tras validar el acceso. */
let PROMPTS=[],WORKBOOK=[],CHECKS=[];
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const headers=[
 ['inicio','Empieza aquí','Primero entiende lo que vas a construir.'],
 ['prompts','12 prompts para copiar','Pide lo que necesitas y revisa el resultado.'],
 ['cuaderno','Mi cuaderno','Tus decisiones, guardadas en tu cuenta.'],
 ['ejemplo','Ejemplo explicado','Mira qué tiene cada sección de una página.'],
 ['revision','Antes de publicar','Comprueba cada paso en tu proyecto.']
];
let running=0;
export async function mountMateriales(root,{db,user,courseId,adminPreview=false,onGoLessons}){
 if(!root||root.dataset.mounted==='true')return;
 root.dataset.mounted='true';
 const {data:resource,error:resourceError}=await db.from('podcast_class_learning_assets')
  .select('payload,status')
  .eq('course_id',courseId).eq('asset_code','interactive_guides_v1').maybeSingle();
 if(resourceError||!resource?.payload){
  root.textContent='Los materiales todavía están en preparación. Podrás usarlos cuando se active la clase.';
  return;
 }
 PROMPTS=Array.isArray(resource.payload.prompts)?resource.payload.prompts:[];
 WORKBOOK=Array.isArray(resource.payload.workbook)?resource.payload.workbook:[];
 CHECKS=Array.isArray(resource.payload.checks)?resource.payload.checks:[];
 if(PROMPTS.length!==12||WORKBOOK.length!==8||CHECKS.length!==16){
  root.textContent='La biblioteca no está completa. Por favor solicita ayuda desde el aula.';
  return;
 }
 const ownerPreview=adminPreview||!user;
 let answers={},checks={},saveTimer=null,dirty=0,saveRunning=false;
 const app=el('div','mi-app');
 root.appendChild(app);
 app.innerHTML=`<div class="mi-header"><div><span class="mi-eyebrow">TODAVÍA ESTOY A TIEMPO / TU PRIMERA WEB CON IA</span><h2>Tu mesa de trabajo<span>.</span></h2><p>Abre un material, haz una actividad y sigue con tu proyecto. Todo está explicado sin palabras complicadas.</p></div><div class="mi-header-symbol" aria-hidden="true">✳</div></div>
 <nav class="mi-tabs" aria-label="Materiales de la clase"></nav>
 <div class="mi-content" aria-live="polite"></div>
 <div class="mi-footer"><span>Un paso claro es mejor que diez pantallas bonitas.</span><span>Materiales de Tu primera web con IA · Uso personal</span></div>`;
 const tabs=app.querySelector('.mi-tabs'), content=app.querySelector('.mi-content');
 const tools=el('div','mi-toolbar');
 tools.innerHTML='<span>Elige lo que necesitas para tu proyecto.</span><button type="button" class="mi-print">Imprimir o guardar en PDF</button>';
 tabs.after(tools);
 tools.querySelector('button').addEventListener('click',()=>window.print());
 if(ownerPreview){
  const {data:pdfs}=await db.from('podcast_class_resources')
   .select('resource_code,title,url,status').eq('course_id',courseId).like('resource_code','pdf_%').order('resource_code');
  if(pdfs?.length){
   const details=el('details','mi-owner-pdfs');
   const summary=el('summary',null,'Revisar los 5 PDF nuevos en Drive · solo administración');
   const links=el('div','mi-owner-pdf-links');
   for(const pdf of pdfs){
    if(!/^https:\/\//.test(pdf.url||''))continue;
    const a=el('a',null,pdf.title);
    a.href=pdf.url;a.target='_blank';a.rel='noopener noreferrer';
    links.append(a);
   }
   details.append(summary,links);
   tools.after(details);
  }
 }

 const saveBadge=el('div','mi-save');
 if(ownerPreview){saveBadge.textContent='Vista de administración · no guarda respuestas';}
 else {saveBadge.textContent='Cargando tu cuaderno…';}
 app.querySelector('.mi-header').append(saveBadge);
 async function load(){
  if(ownerPreview)return;
  const {data,error}=await db.from('podcast_class_workbook').select('answers,checks')
   .eq('course_id',courseId).eq('user_id',user.id).maybeSingle();
  if(error){saveBadge.textContent='No pudimos cargar tus respuestas';return;}
  answers=(data?.answers&&typeof data.answers==='object')?data.answers:{};
  checks=(data?.checks&&typeof data.checks==='object')?data.checks:{};
  saveBadge.textContent='Tus respuestas son privadas';
 }
 await load();
 async function save(){
  if(ownerPreview||saveRunning)return;
  const version=dirty;saveRunning=true;saveBadge.textContent='Guardando…';
  const {error}=await db.from('podcast_class_workbook').upsert({
    course_id:courseId,user_id:user.id,answers,checks,updated_at:new Date().toISOString()
  },{onConflict:'course_id,user_id'});
  saveRunning=false;
  saveBadge.textContent=error?'No se guardó. Toca «Reintentar»':'Guardado en tu cuenta ✓';
  if(error){saveBadge.classList.add('mi-save-error');saveBadge.onclick=()=>void save();}
  else{saveBadge.classList.remove('mi-save-error');saveBadge.onclick=null;}
  if(version!==dirty)queueSave();
 }
 function queueSave(){if(ownerPreview)return;dirty++;clearTimeout(saveTimer);saveTimer=setTimeout(()=>void save(),900);}
 let current='inicio';
 function go(view){
  if(!headers.some(h=>h[0]===view))return;
  current=view;
  const headline=app.querySelector('.mi-header h2');
  const intro=app.querySelector('.mi-header p');
  if(headline) headline.textContent=view==='prompts'?'Biblioteca de prompts.':'Tu mesa de trabajo.';
  if(intro) intro.textContent=view==='prompts'?'12 prompts para copiar, adaptar y usar mientras construyes tu propia página.':'Abre un material, haz una actividad y sigue con tu proyecto. Todo está explicado sin palabras complicadas.';
  tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b.dataset.view===view?'page':'false'));
  content.replaceChildren();
  if(view==='inicio')renderStart();
  if(view==='prompts')renderPrompts();
  if(view==='cuaderno')renderWorkbook();
  if(view==='ejemplo')renderExample();
  if(view==='revision')renderChecks();
 }
 function section(kicker,title,intro){
  const head=el('header','mi-section-head');
  head.innerHTML='<span class="mi-eyebrow">'+esc(kicker)+'</span><h3>'+esc(title)+'</h3><p>'+esc(intro)+'</p>';
  content.append(head);
 }
 function renderStart(){
  section('01 / PRIMERO LO IMPORTANTE','Antes de empezar, aclara tu idea.','Vamos a construir una página sencilla para presentar tu producto o servicio y explicar cómo dar el siguiente paso.');
  const stage=el('div','mi-start-hero');
  stage.innerHTML='<div><span class="mi-eyebrow">TÚ VAS A CREAR</span><h4>Una página que alguien pueda entender y usar.</h4><p>No hace falta saber programar. Primero decides qué ofreces, después lo escribes y al final compruebas que funcione.</p></div><div class="mi-start-index"><strong>01</strong><span>Idea</span><strong>02</strong><span>Texto y fotos</span><strong>03</strong><span>Página</span><strong>04</strong><span>Revisión</span></div>';
  content.append(stage);
  const grid=el('div','mi-start-steps');
  const items=[
   ['Mira un módulo','Pausa el video donde te indique y haz solo ese ejercicio.'],
   ['Escribe tu oferta','En el cuaderno anota qué vendes, qué incluye y a quién ayudas.'],
   ['Copia un prompt','Cambia lo que aparece entre corchetes por tus datos reales.'],
   ['Prueba antes de publicar','Abre tu página en el teléfono y toca todos los botones.']
  ];
  for(const [i,item] of items.entries()){
   const c=el('article','mi-step');c.innerHTML='<span>0'+(i+1)+'</span><h4>'+esc(item[0])+'</h4><p>'+esc(item[1])+'</p>';grid.append(c);
  }content.append(grid);
  const actions=el('div','mi-actions');actions.innerHTML='<button type="button" class="mi-primary" data-go="cuaderno">Empezar mi cuaderno</button><button type="button" class="mi-quiet" data-go="prompts">Explorar prompts</button>';content.append(actions);
  actions.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go);});
  const note=el('p','mi-note','Un consejo: usa un solo producto o servicio mientras haces la clase. Así vas a poder comparar tu primera versión con el resultado final.');content.append(note);
 }
 function renderPrompts(){
  section('02 / BIBLIOTECA PARA COPIAR','Pídele a ChatGPT lo que realmente necesitas.','Elige el paso que estás trabajando, cambia los textos entre [corchetes] y toca «Copiar prompt». No compartas contraseñas ni datos privados.');
  const filter=el('div','mi-filter');filter.innerHTML='<label for="mi-prompt-search">Busca un tema</label><input id="mi-prompt-search" type="search" placeholder="Ej.: fotos, móvil, botón, entrega" autocomplete="off" />';content.append(filter);
  const list=el('div','mi-prompt-list');content.append(list);
  function draw(term=''){
   list.replaceChildren();
   PROMPTS.forEach(([title,desc,prompt],i)=>{
    if(![title,desc,prompt].join(' ').toLowerCase().includes(term.toLowerCase()))return;
    const card=el('details','mi-prompt');
    card.innerHTML='<summary><span class="mi-prompt-number">'+String(i+1).padStart(2,'0')+'</span><span class="mi-prompt-label"><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><span class="mi-plus" aria-hidden="true">+</span></summary><div class="mi-prompt-body"><p class="mi-prompt-text">'+esc(prompt)+'</p><button type="button" class="mi-copy">Copiar prompt</button><p class="mi-copy-state" role="status"></p></div>';
    card.querySelector('.mi-copy').addEventListener('click',()=>void copyPrompt(prompt,card));
    list.append(card);
   });
   if(!list.children.length)list.append(el('p','mi-note','No encontré ese tema. Prueba con otra palabra.'));
  }
  draw();filter.querySelector('input').addEventListener('input',e=>draw(e.target.value));
 }
 async function copyPrompt(value,card){
  let ok=false;
  try{await navigator.clipboard.writeText(value);ok=true;}catch{}
  if(!ok){
   const area=el('textarea');area.value=value;area.style.cssText='position:absolute;left:-9999px';document.body.append(area);area.select();
   try{ok=document.execCommand('copy');}catch{}area.remove();
  }
  const label=card.querySelector('.mi-copy-state');label.textContent=ok?'¡Copiado! Pégalo en ChatGPT y completa tus datos.':'Tu navegador no permitió copiar. Mantén pulsado el texto del prompt para seleccionarlo.';
 }
 function renderWorkbook(){
  section('03 / MI CUADERNO','Una idea a la vez.','Escribe tus respuestas. Lo que anotes aquí servirá para preparar tu página. No hace falta completarlo todo hoy.');
  if(ownerPreview){content.append(el('p','mi-note','Esta es una vista de administración. Las respuestas de estudiantes no aparecen aquí.'));}
  else{content.append(el('p','mi-note','Tus respuestas se guardan en tu cuenta. No escribas contraseñas ni información privada de tus clientes.'));}
  const summary=el('div','mi-work-summary');content.append(summary);
  const grid=el('div','mi-workbook-sections');content.append(grid);
  WORKBOOK.forEach((block,i)=>{
   const details=el('details','mi-work-step');
   if(i===0)details.open=true;
   const count=block.qs.filter(q=>String(answers[q[0]]||'').trim()).length;
   details.innerHTML='<summary><span class="mi-prompt-number">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+esc(block.title)+'</strong><small>'+count+' de '+block.qs.length+' respuestas</small></span><span class="mi-plus">+</span></summary><div class="mi-work-body"><p>'+esc(block.sub)+'</p></div>';
   if(block.example)details.querySelector('.mi-work-body').append(el('p','mi-note','Ejemplo: '+block.example));
   block.qs.forEach(([key,title,placeholder])=>{
    const field=el('div','mi-field'),label=el('label',null,title),textarea=el('textarea');
    textarea.id='mi-'+key;label.htmlFor=textarea.id;textarea.placeholder=placeholder;textarea.maxLength=600;textarea.rows=2;textarea.value=answers[key]||'';textarea.disabled=ownerPreview;
    textarea.addEventListener('input',()=>{answers[key]=textarea.value;queueSave();updateSummary();const small=details.querySelector('summary small');small.textContent=block.qs.filter(q=>String(answers[q[0]]||'').trim()).length+' de '+block.qs.length+' respuestas';});
    field.append(label,textarea);details.querySelector('.mi-work-body').append(field);
   });grid.append(details);
  });
  function updateSummary(){
   const answered=WORKBOOK.reduce((n,b)=>n+b.qs.filter(q=>String(answers[q[0]]||'').trim()).length,0);
   const total=WORKBOOK.reduce((n,b)=>n+b.qs.length,0);
   summary.innerHTML='<span>Tu avance en el cuaderno</span><strong>'+answered+' / '+total+'</strong><div class="mi-bar"><i style="width:'+Math.round(100*answered/total)+'%"></i></div>';
  }updateSummary();
  const actions=el('div','mi-actions');actions.innerHTML='<button class="mi-primary" type="button">Guardar mis respuestas</button><button class="mi-quiet" type="button">Imprimir mi cuaderno</button>';content.append(actions);
  actions.children[0].addEventListener('click',()=>void save());
  actions.children[1].addEventListener('click',()=>window.print());
 }
 function renderExample(){
  section('04 / UN EJEMPLO EXPLICADO','Así se ve una página que se entiende.','Vamos a usar un ejemplo ficticio: una caja de galletas artesanales por encargo. El objetivo es entender la estructura, no copiar su marca.');
  const guide=el('div','mi-demo-controls');guide.innerHTML='<div><button type="button" data-device="mobile">Ver en teléfono</button><button type="button" data-device="desktop" aria-pressed="true">Ver en computadora</button></div><p>Ejemplo visual · los botones no procesan pedidos</p>';content.append(guide);
  const frame=el('div','mi-demo-screen desktop');frame.innerHTML='<div class="mi-demo-browser"><i></i><i></i><i></i><small>VISTA DE EJEMPLO</small></div><div class="mi-demo-site"><div class="mi-demo-menu"><span>CASA MIGA</span><span>Por encargo · Preguntas</span></div><div class="mi-demo-hero"><div><span>HORNEADAS PARA COMPARTIR</span><h4>Galletas artesanales para regalar.</h4><p>Cajas por encargo, preparadas con cuidado. Consulta sabores y disponibilidad antes de pedir.</p><button type="button" class="mi-demo-cta">Preguntar por una caja</button></div><div class="mi-cookie-scene" aria-label="Ilustración editorial de tres galletas"><i></i><i></i><i></i></div></div><div class="mi-demo-details"><div><strong>¿Qué recibes?</strong><span>Una caja surtida. Los sabores se confirman al pedir.</span></div><div><strong>¿Cómo funciona?</strong><span>Escribes, confirmamos disponibilidad y acordamos la entrega.</span></div></div></div>';content.append(frame);
  const state=el('p','mi-demo-state','Este es un ejemplo visual, no una tienda real.');content.append(state);
  frame.querySelector('.mi-demo-cta').addEventListener('click',()=>state.textContent='Así debe funcionar un botón real: abrir una consulta verificada. En esta muestra no se envía ningún pedido.');
  guide.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const mobile=b.dataset.device==='mobile';frame.classList.toggle('mobile',mobile);frame.classList.toggle('desktop',!mobile);guide.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
  const notes=el('div','mi-explain-list');content.append(notes);
  const items=[
   ['01','Primera pantalla','La persona identifica el producto, a quién va dirigido y qué debe hacer.'],
   ['02','Fotos fieles','La imagen acompaña la oferta. No inventa ingredientes, tamaños ni resultados.'],
   ['03','Detalles que responden dudas','Explica qué incluye, cómo se pide, disponibilidad y entrega.'],
   ['04','Un botón con sentido','Debe llevar a una compra admitida, reserva o consulta que realmente funcione.'],
   ['05','Prueba en el teléfono','Revisa textos, recortes, tamaños y el destino de cada botón.']
  ];
  for(const [n,t,d] of items){const card=el('details','mi-explain');card.innerHTML='<summary><span>'+n+'</span><strong>'+esc(t)+'</strong><b>+</b></summary><p>'+esc(d)+'</p>';notes.append(card);}
  content.append(el('p','mi-note','Tu proyecto puede ser muy diferente de este ejemplo. Lo importante es que cada sección responda una pregunta real.'));
 }
 function renderChecks(){
  section('05 / ANTES DE COMPARTIR','¿Está lista tu página?','Marca una casilla cuando hayas hecho la prueba. Si algo falta, déjalo pendiente y vuelve después.');
  const count=el('div','mi-check-progress');content.append(count);
  const list=el('div','mi-check-list');content.append(list);
  function update(){const n=CHECKS.filter((x,i)=>checks['check'+i]===true).length;count.innerHTML='<div><span>Comprobaciones hechas</span><strong>'+n+' de '+CHECKS.length+'</strong></div><div class="mi-bar"><i style="width:'+Math.round(n/CHECKS.length*100)+'%"></i></div>'; }
  CHECKS.forEach((item,i)=>{
   const card=el('article','mi-check');const inp=el('input');inp.type='checkbox';inp.id='mi-check-'+i;inp.checked=checks['check'+i]===true;inp.disabled=ownerPreview;const label=el('label');label.htmlFor=inp.id;
   label.innerHTML='<strong>'+String(i+1).padStart(2,'0')+'. '+esc(item.name)+'</strong><span>'+esc(item.how)+'</span><small>Listo cuando: '+esc(item.done)+'</small>';
   inp.addEventListener('change',()=>{checks['check'+i]=inp.checked;card.classList.toggle('checked',inp.checked);update();queueSave();});
   card.classList.toggle('checked',inp.checked);card.append(inp,label);list.append(card);
  });update();
  const note=el('p','mi-note','No necesitas terminar todo en un día. Cuando algo no funcione, anota el problema y corrígelo antes de compartir tu enlace.');content.append(note);
  const actions=el('div','mi-actions');actions.innerHTML='<button class="mi-primary" type="button">Guardar comprobaciones</button><button class="mi-quiet" type="button">Volver a mis lecciones</button>';content.append(actions);
  actions.children[0].addEventListener('click',()=>void save());
  actions.children[1].addEventListener('click',()=>onGoLessons?.());
 }
 headers.forEach(([view,title])=>{
  const b=el('button',null,title);b.type='button';b.dataset.view=view;b.setAttribute('aria-current',view===current?'page':'false');b.addEventListener('click',()=>go(view));tabs.append(b);
 });
 go('inicio');
 return {go};
}

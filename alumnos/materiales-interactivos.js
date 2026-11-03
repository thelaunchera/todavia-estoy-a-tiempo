import {renderWebBasics,renderProjectOrder,renderStudentWebPath} from './guia-principiantes.js';
import {renderMakeResources,renderSafetyResources,renderLegalResources,renderWebGuide,renderConnectorPrompts} from './recursos-avanzados.js';
import {englishTitle,localizedPrompt} from './prompt-english.js?v=20261102-v3';
import {promptGuide} from './prompt-guide.js?v=20261102-v1';
import {translateWorkbookBlocks,translateCheckItem} from './materials-english.js?v=20261102-v1';
import {renderEnglishMaterialGuide} from './materials-guides-en.js?v=20261102-v1';
/* Tu primera web con IA · Materiales activos de la clase
   Español y trabajo por alumno. No instala enlaces públicos a los PDF antiguos. */
/* Los prompts y ejercicios se leen de Supabase solo tras validar el acceso. */
let PROMPTS=[],WORKBOOK=[],CHECKS=[],EXTRAS={},MODULE_PROMPTS=[],EXAMPLE_PROMPTS=[];
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const headers=[
 ['inicio','Empieza aquí','Primero entiende lo que vas a construir.'],
 ['funciona','Cómo funciona mi web','Distingue el diseño de los procesos internos.'],
 ['pasos','Paso a paso: mi propia web','De la idea a una página real con tu marca.'],
 ['organizacion','Mi proyecto organizado','Todo en una sola carpeta, sin perder archivos.'],
 ['prompts','Biblioteca de prompts','Incluye el bonus para diseñar desde tu celular.'],
 ['mara','Mara · mi guía web','Prepara tu proyecto privado y empieza.'],
 ['make','Make gratis','Escenarios con Gmail, paso a paso.'],
 ['conectores','Comandos de conectores','Cada servicio explicado sin programación.'],
 ['seguridad','Contraseñas y claves','Tus accesos siempre privados.'],
 ['legal','Footer y legales','Enlaces y textos reales según tu negocio.'],
 ['cuaderno','Mi cuaderno','Tus decisiones, guardadas en tu cuenta.'],
 ['ejemplo','Ejemplo explicado','Mira qué tiene cada sección de una página.'],
 ['revision','Antes de publicar','Comprueba cada paso en tu proyecto.']
];
const materialGroups=[
 {id:'empezar',title:'Empieza aquí',views:['inicio','funciona','organizacion']},
 {id:'construir',title:'Crea tu web',views:['pasos','mara','ejemplo','make','conectores']},
 {id:'recursos',title:'Tus recursos',views:['prompts','cuaderno','seguridad','legal']},
 {id:'publicar',title:'Antes de publicar',views:['revision']}
];
let running=0;
export async function mountMateriales(root,{db,user,courseId,adminPreview=false,onGoLessons,onCloseMaterials,getLanguage=()=> 'es'}){
 if(!root||root.dataset.mounted==='true')return;
 root.dataset.mounted='true';
 root.textContent=getLanguage()==='en'?'Loading your learning materials…':'Cargando tus materiales y biblioteca de prompts…';
 const {data:resource,error:resourceError}=await db.from('podcast_class_learning_assets')
  .select('payload,status')
  .eq('course_id',courseId).eq('asset_code','interactive_guides_v1').maybeSingle();
 if(resourceError||!resource?.payload){
  root.textContent=getLanguage()==='en'?'Materials are being prepared. You can use them once the course is ready.':'Los materiales todavía están en preparación. Podrás usarlos cuando se active la clase.';
  return;
 }
 PROMPTS=Array.isArray(resource.payload.prompts)?resource.payload.prompts:[];
 WORKBOOK=Array.isArray(resource.payload.workbook)?resource.payload.workbook:[];
 CHECKS=Array.isArray(resource.payload.checks)?resource.payload.checks:[];
 EXTRAS=(resource.payload.extras&&typeof resource.payload.extras==='object')?resource.payload.extras:{};
 if(PROMPTS.length!==12||WORKBOOK.length!==8||CHECKS.length!==16){
  root.textContent=getLanguage()==='en'?'The library is incomplete. Please request help from the classroom.':'La biblioteca no está completa. Por favor solicita ayuda desde el aula.';
  return;
 }
 /* Biblioteca desde la misma base protegida por RLS para estudiantes
    con compra verificada; incluye los prompts que se agreguen en el futuro. */
 MODULE_PROMPTS=[];EXAMPLE_PROMPTS=[];
 try{
  const [{data:rows,error},{data:kit,error:kitError}]=await Promise.all([
   db.from('podcast_class_prompts')
    .select('prompt_code,title,summary,body,position,status,category')
    .eq('course_id',courseId).eq('status','ready').order('position',{ascending:true}),
   db.from('podcast_class_learning_assets')
    .select('payload,status').eq('course_id',courseId)
    .eq('asset_code','inspiration_gallery_v1').maybeSingle()
  ]);
  if(!error&&Array.isArray(rows))MODULE_PROMPTS=rows;
  if(!kitError&&kit?.status==='ready'&&Array.isArray(kit?.payload?.demos)){
   for(const d of kit.payload.demos.filter(d=>adminPreview||d.published!==false)){
    for(const [i,p] of (Array.isArray(d.prompts)?d.prompts:[]).entries()){
     EXAMPLE_PROMPTS.push({prompt_code:'demo_'+d.id+'_'+i,title:p.title,
      summary:d.title+' · '+(p.step||''),body:p.body,category:'demo_'+(d.category||'services'),
      brand:d.title,position:1000+EXAMPLE_PROMPTS.length,status:'ready'});
     for(const [j,photo] of (Array.isArray(p.photos)?p.photos:[]).entries()){
      EXAMPLE_PROMPTS.push({prompt_code:'demo-photo_'+d.id+'_'+i+'_'+j,
       title:photo.title,summary:d.title+' · Foto individual',
       body:photo.body,category:'demo_photos',brand:d.title,
       position:2000+EXAMPLE_PROMPTS.length,status:'ready'});
     }
    }
   }
  }
 }catch{/* Mantener originales si la consulta adicional no responde */}
 const ownerPreview=adminPreview||!user;
 const t=(es,en)=>getLanguage()==='en'?en:es;
 let answers={},checks={},saveTimer=null,dirty=0,saveRunning=false;
 const app=el('div','mi-app');
 root.replaceChildren(app);
 app.innerHTML=`<div class="mi-header"><div><span class="mi-eyebrow">TODAVÍA ESTOY A TIEMPO / TU PRIMERA WEB CON IA</span><h2>Tu mesa de trabajo<span>.</span></h2><p>Abre un material, haz una actividad y sigue con tu proyecto. Todo está explicado sin palabras complicadas.</p></div></div>
 <nav class="mi-tabs" aria-label="Cuatro categorías de materiales"></nav><nav class="mi-subtabs" aria-label="Contenido de la categoría"></nav>
 <div class="mi-content" aria-live="polite"></div>
 <div class="mi-footer"><span>Un paso claro es mejor que diez pantallas bonitas.</span><span>Materiales de Tu primera web con IA · Uso personal</span></div>`;
 const tabs=app.querySelector('.mi-tabs'),subtabs=app.querySelector('.mi-subtabs'),content=app.querySelector('.mi-content');
 const tools=el('div','mi-toolbar');
 tools.innerHTML='<span>Elige lo que necesitas para tu proyecto.</span><button type="button" class="mi-print">Imprimir o guardar en PDF</button>';
 tabs.after(tools);
 tools.querySelector('button').addEventListener('click',()=>window.print());
 const viewControls=el('div','mi-view-controls');
 viewControls.innerHTML='<button type="button" class="mi-view-back" aria-label="Atrás: regresar al material anterior">← Atrás</button><button type="button" class="mi-view-close" aria-label="Cerrar material abierto">× Cerrar</button>';
 tools.after(viewControls);
 const viewBack=viewControls.querySelector('.mi-view-back');
 const viewClose=viewControls.querySelector('.mi-view-close');
 if(ownerPreview){
  const {data:pdfs}=await db.from('podcast_class_resources')
   .select('resource_code,title,url,status').eq('course_id',courseId).like('resource_code','pdf_%').order('resource_code');
  if(pdfs?.length){
   const details=el('details','mi-owner-pdfs');
   const summary=el('summary',null,t('Revisar los 5 PDF nuevos en Drive · solo administración','Review the 5 draft PDFs on Drive · admin only'));
   const links=el('div','mi-owner-pdf-links');
   for(const pdf of pdfs){
    if(!/^https:\/\//.test(pdf.url||''))continue;
    const pdfNames={pdf_00:'Start here · PDF',pdf_01:'12 prompts · PDF',pdf_02:'Workbook · PDF',pdf_03:'Landing page guide · PDF',pdf_04:'Launch checklist · PDF'};
    const a=el('a',null,getLanguage()==='en'?(pdfNames[pdf.resource_code]||'Draft PDF'):pdf.title);
    a.href=pdf.url;a.target='_blank';a.rel='noopener noreferrer';
    links.append(a);
   }
   details.append(summary,links);
   tools.after(details);
  }
 }

 const saveBadge=el('div','mi-save');
 if(ownerPreview){saveBadge.textContent=t('Vista de administración · no guarda respuestas','Owner preview · answers are not saved');}
 else {saveBadge.textContent=t('Cargando tu cuaderno…','Loading your workbook…');}
 app.querySelector('.mi-header').append(saveBadge);
 async function load(){
  if(ownerPreview)return;
  const {data,error}=await db.from('podcast_class_workbook').select('answers,checks')
   .eq('course_id',courseId).eq('user_id',user.id).maybeSingle();
  if(error){saveBadge.textContent=t('No pudimos cargar tus respuestas','Your saved answers could not be loaded');return;}
  answers=(data?.answers&&typeof data.answers==='object')?data.answers:{};
  checks=(data?.checks&&typeof data.checks==='object')?data.checks:{};
  saveBadge.textContent=t('Tus respuestas son privadas','Your answers are private');
 }
 await load();
 async function save(){
  if(ownerPreview||saveRunning)return;
  const version=dirty;saveRunning=true;saveBadge.textContent=t('Guardando…','Saving…');
  const {error}=await db.from('podcast_class_workbook').upsert({
    course_id:courseId,user_id:user.id,answers,checks,updated_at:new Date().toISOString()
  },{onConflict:'course_id,user_id'});
  saveRunning=false;
  saveBadge.textContent=error?t('No se guardó. Toca «Reintentar»','Could not save. Tap Retry'):t('Guardado en tu cuenta ✓','Saved to your account');
  if(error){saveBadge.classList.add('mi-save-error');saveBadge.onclick=()=>void save();}
  else{saveBadge.classList.remove('mi-save-error');saveBadge.onclick=null;}
  if(version!==dirty)queueSave();
 }
 function queueSave(){if(ownerPreview)return;dirty++;clearTimeout(saveTimer);saveTimer=setTimeout(()=>void save(),900);}
 let current='inicio';
 const materialHistory=[];
 viewBack.addEventListener('click',()=>{
  const previous=materialHistory.pop();
  if(previous)go(previous,{track:false});
  else if(current!=='inicio')go('inicio',{track:false});
  else onCloseMaterials?.();
 });
 viewClose.addEventListener('click',()=>{
  if(current==='inicio'){
   materialHistory.length=0;
   onCloseMaterials?.();
  }else{
   materialHistory.length=0;
   go('inicio',{track:false});
  }
 });
 function go(view,{track=true}={}){
  if(!headers.some(h=>h[0]===view))return;
  if(!track&&view==='inicio')materialHistory.length=0;
  if(track&&view!==current){
   materialHistory.push(current);
   if(materialHistory.length>12)materialHistory.shift();
  }
  current=view;
  viewBack.hidden=current==='inicio'&&!materialHistory.length;
  viewClose.setAttribute('aria-label',getLanguage()==='en'?(current==='inicio'?'Close materials and return to classroom home':'Close this material and return to the library'):(current==='inicio'?'Cerrar materiales y volver al inicio del aula':'Cerrar este material y volver a la biblioteca'));
  app.querySelector('.mi-eyebrow')?.replaceChildren(document.createTextNode(getLanguage()==='en'?'YOUR FIRST WEBSITE WITH AI / STUDENT MATERIALS':'TODAVÍA ESTOY A TIEMPO / TU PRIMERA WEB CON IA'));
  const footerSpans=app.querySelectorAll('.mi-footer span');
  if(footerSpans[0])footerSpans[0].textContent=t('Un paso claro es mejor que diez pantallas bonitas.','One clear step beats ten pretty screens.');
  if(footerSpans[1])footerSpans[1].textContent=t('Materiales de Tu primera web con IA · Uso personal','Your First Website With AI · Personal-use materials');
  const toolbarLabel=tools.querySelector('span');
  if(toolbarLabel)toolbarLabel.textContent=t('Elige lo que necesitas para tu proyecto.','Choose what you need for your project.');
  const printButton=tools.querySelector('.mi-print');
  if(printButton)printButton.textContent=t('Imprimir o guardar en PDF','Print or save as PDF');
  viewBack.textContent=t('Atrás','Back');
  viewClose.textContent=t('Cerrar','Close');
  if(ownerPreview)saveBadge.textContent=t('Vista de administración · no guarda respuestas','Admin preview · answers are not saved');
  const ownerDraftPdfs=app.querySelector('.mi-owner-pdfs');
  if(ownerDraftPdfs)ownerDraftPdfs.hidden=getLanguage()==='en'; // Never show Spanish PDF content in English.
  for(const groupButton of tabs.querySelectorAll('button[data-group]')){
   const group=materialGroups.find(g=>g.id===groupButton.dataset.group);
   if(group)groupButton.textContent=getLanguage()==='en'?({
    empezar:'Start here',construir:'Build your website',recursos:'Your resources',publicar:'Before publishing'
   }[group.id]||group.title):group.title;
  }
  const headline=app.querySelector('.mi-header h2');
  const intro=app.querySelector('.mi-header p');
  if(headline)headline.textContent=getLanguage()==='en'
  ?view==='prompts'?'Prompt library.':'Your creative desk.'
  :view==='prompts'?'Biblioteca de prompts.':'Tu mesa de trabajo.';
  if(intro)intro.textContent=getLanguage()==='en'
 ?view==='prompts'?'Copy and personalize prompts for your business and see mobile-friendly examples.':'Open a resource, complete one exercise and keep building, step by step.'
 :view==='prompts'?'Prompts para copiar, adaptar y usar, incluyendo un bonus para quienes trabajan desde el teléfono.':'Abre un material, haz una actividad y sigue con tu proyecto. Todo está explicado sin palabras complicadas.';
  const activeGroup=materialGroups.find(group=>group.views.includes(view));
  tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b.dataset.group===activeGroup?.id?'page':'false'));
  subtabs.replaceChildren();
  for(const child of activeGroup?.views||[]){
   const meta=headers.find(h=>h[0]===child);if(!meta)continue;
   const b=el('button',null,getLanguage()==='en'?({inicio:'Start here',funciona:'How my website works',pasos:'Build step by step',organizacion:'Organize my project',prompts:'Prompt library',mara:'My website guide',make:'Make free tier',conectores:'Connector instructions',seguridad:'Passwords and keys',legal:'Footer and legal pages',cuaderno:'My workbook',ejemplo:'Website example',revision:'Final checklist'}[child]||meta[1]):meta[1]);b.type='button';b.dataset.view=child;b.setAttribute('aria-current',child===view?'page':'false');b.addEventListener('click',()=>go(child));subtabs.append(b);
  }
  content.replaceChildren();
  if(getLanguage()==='en'&&!['prompts','cuaderno','revision'].includes(view)){
   renderEnglishMaterialGuide(content,view,go);
   translateCurrentMaterial();return;
  }
  if(view==='inicio')renderStart();
  if(view==='funciona')renderWebBasics(content,go);
  if(view==='organizacion')renderProjectOrder(content);
   if(view==='pasos')renderStudentWebPath(content,go);
  if(view==='prompts')renderPrompts();
  if(view==='mara')renderWebGuide(content,EXTRAS);
  if(view==='make')renderMakeResources(content,EXTRAS);
  if(view==='conectores')renderConnectorPrompts(content,EXTRAS);
  if(view==='seguridad')renderSafetyResources(content,EXTRAS);
  if(view==='legal')renderLegalResources(content,EXTRAS);
  if(view==='cuaderno')renderWorkbook();
  if(view==='ejemplo')renderExample();
  if(view==='revision')renderChecks();
  translateCurrentMaterial();
 }

 function translateCurrentMaterial(){
  if(getLanguage()!=='en')return;
  const map={
   'Empieza aquí':'Start here','Crea tu web':'Build your website','Tus recursos':'Your resources',
   'Antes de publicar':'Before publishing','Mi cuaderno':'My workbook',
   'Tu oferta':'Your offer','Precio y entrega':'Pricing & delivery',
   'Tus referencias':'Your references','Estilo y fotos':'Visual style & photos',
   'Texto de tu página':'Your website copy','Construcción y móvil':'Building & mobile',
   'Botón y entrega':'CTA & fulfillment','Tu revisión':'Final review',
   'Cómo funciona mi web':'How my website works','Paso a paso: mi propia web':'Build step by step',
   'Mi proyecto organizado':'My organized project','Biblioteca de prompts':'Prompt library',
   'Mara · mi guía web':'My web assistant','Make gratis':'Make free tier',
   'Comandos de conectores':'Connector instructions','Contraseñas y claves':'Passwords & keys',
   'Footer y legales':'Footer & legal','Ejemplo explicado':'Explained example'
  };
  for(const button of [...tabs.querySelectorAll('button'),...subtabs.querySelectorAll('button')]){
   if(map[button.textContent])button.textContent=map[button.textContent];
  }
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
  const actions=el('div','mi-actions');actions.innerHTML='<button type="button" class="mi-primary" data-go="pasos">Construir mi web paso a paso</button><button type="button" class="mi-quiet" data-go="mara">Configurar mi guía web</button><button type="button" class="mi-quiet" data-go="funciona">Entender mi web</button>';content.append(actions);
  actions.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go);});
  const note=el('p','mi-note','Un consejo: usa un solo producto o servicio mientras haces la clase. Así vas a poder comparar tu primera versión con el resultado final.');content.append(note);
 }
 function renderPrompts(){
  const lang=getLanguage()==='en'?'en':'es';
  const t=(es,en)=>lang==='en'?en:es;
  section(t('02 / BIBLIOTECA DE PROMPTS','02 / PROMPT LIBRARY'),
   t('Una biblioteca para cualquier negocio.','One library for every business.'),
   t('Empieza con 1 foto · 8 prompts · 1 marca. Después investiga tu negocio, crea tu identidad, organiza tus fotos y construye la web. Los demos muestran los comandos originales por etapa.','Start with 1 Photo · 8 Prompts · 1 Brand. Then research your business, build a visual identity, plan individual photos and create your website. Demo packs include their original step-by-step commands.'));
  const originals=new Map([
   ['idea',0],['cliente',1],['estructura',2],['referencias',3],['imagenes',4],['hero',5],
   ['copy',6],['construccion',7],['formularios',8],['pagos',9],['movil',10],['auditoria',11]
  ]);
  const fallback=MODULE_PROMPTS.length===0?PROMPTS.map(([title,desc,body],i)=>({prompt_code:[...originals.keys()][i],title,summary:desc,body,category:'Planificación',position:i+1})):[];
  const bonus=Array.isArray(EXTRAS.mobile_first_prompts)?EXTRAS.mobile_first_prompts
   .filter(x=>Array.isArray(x)&&x.length===3).map(([title,desc,body],i)=>({
    prompt_code:'mobile_'+(i+1),title,summary:desc,body,category:'mobile',position:500+i})):[];
  const fullCatalog=[...MODULE_PROMPTS,...fallback,...bonus,...EXAMPLE_PROMPTS].map(p=>{
   const code=p.prompt_code;
   const isFreebie=code.startsWith('freebie_1photo8_');
   const cat=String(p.category||'').toLowerCase();
   const isDemo=code.startsWith('demo_')||code.startsWith('demo-photo_');
   let group='planning';
   if(isFreebie)group='freebie';
   else if(code.startsWith('demo-photo_'))group='demo_photos';
   else if(isDemo)group='demo_'+(p.category||'demo').replace(/^demo_/,'');
   else if(code.startsWith('mobile_')||/revisi|m[oó]vil|auditor|qa|public/i.test(cat+' '+code))group='mobile';
   else if(/foto|imagen|empaque|photograph/i.test(code+' '+cat))group='photos';
   else if(/diseño|visual|identidad|brand|mood/i.test(cat+' '+code))group='design';
   else if(/constru|pagos|formular|copy|hero|checkout|estructura|m05|m07/.test(cat+' '+code))group='build';
   return {...p,group,englishTitle:englishTitle(code,p.title)};
  });
  fullCatalog.sort((a,b)=>{
   const priority={planning:0,design:1,photos:2,build:3,mobile:4,freebie:5,
    demo_food:6,demo_wellness:7,demo_hospitality:8,demo_fashion:9,demo_services:10,demo_photos:11};
   return (priority[a.group]??99)-(priority[b.group]??99)||(a.position||0)-(b.position||0);
  });
  const filters=[
   ['all',t('Todos los prompts','All prompts')],['planning',t('01 · Investiga el negocio','01 · Research the business')],
   ['design',t('02 · Marca y moodboard','02 · Brand & mood board')],
   ['photos',t('03 · Prepara fotografías','03 · Prepare photos')],
   ['build',t('04 · Construye la web','04 · Build the website')],
   ['mobile',t('05 · Revisa y publica','05 · Review & publish')],
   ['freebie',t('Bonus · 1 foto, 8 diseños','Bonus · 1 photo, 8 designs')],
   ['demo_food',t('Demos · Comida','Demos · Food')],
   ['demo_wellness',t('Demos · Bienestar','Demos · Wellness')],
   ['demo_hospitality',t('Demos · Eventos','Demos · Events')],
   ['demo_photos',t('Fotos de los demos','Demo photo prompts')],
   ['demo_services',t('Demos · Servicios','Demos · Services')]
  ];
  const itinerary=el('div','mi-prompt-itinerary');
  itinerary.innerHTML='<strong>'+t('¿Por dónde empiezo?','Where do I begin?')+'</strong><p>'+t(
   'Sigue las categorías 01 a 05 para crear tu web. El bonus de 8 diseños es para practicar composiciones con una fotografía. Los demos son ejemplos que puedes estudiar sin copiarlos.',
   'Follow categories 01 through 05 to build your site. Use the 8-design bonus to practice layouts with one photo. Study the demos as references, not templates to copy.'
  )+'</p>';
  content.append(itinerary);
  const tools=el('div','mi-prompt-searchbar');
  const label=el('label',null,t('Buscar un prompt','Search prompts'));
  const input=el('input');input.type='search';input.placeholder=t('Ej.: mi negocio, empaques, hero, móvil…','E.g. product, packaging, hero, mobile…');
  input.id='mi-prompt-search';label.setAttribute('for',input.id);
  label.append(input);
  const counter=el('p','mi-prompt-count');
  tools.append(label,counter);content.append(tools);
  const chips=el('div','mi-prompt-categories');chips.setAttribute('role','group');chips.setAttribute('aria-label',t('Categorías de prompts','Prompt categories'));
  const list=el('div','mi-prompt-list');
  const more=el('button','mi-prompt-more',t('Mostrar más prompts','Load more prompts'));
  more.type='button';
  content.append(chips,list,more);
  let active='all',limit=18,query='';
  function matchesGroup(x){
   if(active==='all')return true;
   return x.group===active;
  }
  function renderChips(){
   chips.replaceChildren();
   for(const [id,name] of filters){
    if(id!=='all'&&!fullCatalog.some(x=>x.group===id))continue;
    const n=fullCatalog.filter(x=>id==='all'||x.group===id).length;
    const b=el('button',null,name+' · '+n);b.type='button';
    b.setAttribute('aria-pressed',id===active?'true':'false');
    b.addEventListener('click',()=>{active=id;limit=18;renderChips();draw();});
    chips.append(b);
   }
  }
  function draw(){
   list.replaceChildren();
   const found=fullCatalog.filter(x=>{
    const searchable=[x.title,x.englishTitle,x.summary,x.body,x.brand||''].join(' ').toLowerCase();
    return matchesGroup(x)&&(!query||searchable.includes(query.toLowerCase()));
   });
   counter.textContent=found.length+' '+t('prompts disponibles en esta selección','available prompts in this selection');
   for(const [i,item] of found.slice(0,limit).entries()){
    const original=localizedPrompt(item.prompt_code,item.body,lang,item.brand||'');
    const title=lang==='en'?item.englishTitle:item.title;
    const guide=promptGuide(item.prompt_code,lang);
    const card=el('details','mi-prompt');
    const badge=item.group==='freebie'?String(Number(item.prompt_code.slice(-2))).padStart(2,'0'):String(i+1).padStart(2,'0');
    const summary=el('summary');
    summary.innerHTML='<span class="mi-prompt-number">'+esc(badge)+'</span>'+
      '<span class="mi-prompt-label"><strong>'+esc(title)+'</strong><small>'+
      '<b>'+esc(t('Para qué sirve: ','Use it to: '))+'</b>'+esc(guide.purpose)+'</small></span>'+
      '<span class="mi-plus" aria-hidden="true">+</span>';
    const body=el('div','mi-prompt-body');
    const guidance=el('div','mi-prompt-guide');
    const when=el('p','mi-prompt-when');
    const output=el('p','mi-prompt-output');
    when.append(el('strong',null,t('Cuándo usarlo: ','When to use it: ')),document.createTextNode(guide.when));
    output.append(el('strong',null,t('Qué obtendrás: ','What you will get: ')),document.createTextNode(guide.result));
    guidance.append(when,output);
    const instruction=el('h4','mi-prompt-instruction',t('Instrucciones para copiar','Instructions to copy'));
    const paragraph=el('p','mi-prompt-text',original);
    const copy=el('button','mi-copy',t('Copiar instrucciones','Copy instructions'));copy.type='button';
    const state=el('p','mi-copy-state');state.setAttribute('role','status');
    copy.addEventListener('click',()=>void copyPrompt(original,card));
    body.append(guidance,instruction,paragraph,copy,state);card.append(summary,body);list.append(card);
   }
   more.hidden=found.length<=limit;
   if(!found.length)list.append(el('p','mi-note',t('No encontré ese tema. Prueba con otra categoría o palabra.','No results. Try another category or word.')));
  }
  input.addEventListener('input',()=>{query=input.value;limit=18;draw();});
  more.addEventListener('click',()=>{limit+=18;draw();});
  renderChips();draw();
 }
 async function copyPrompt(value,card){
  let ok=false;
  try{await navigator.clipboard.writeText(value);ok=true;}catch{}
  if(!ok){
   const area=el('textarea');area.value=value;area.style.cssText='position:absolute;left:-9999px';document.body.append(area);area.select();
   try{ok=document.execCommand('copy');}catch{}area.remove();
  }
  const label=card.querySelector('.mi-copy-state');
  label.textContent=getLanguage()==='en'
   ?ok?'Copied! Paste into ChatGPT and add your details.':'Copy blocked. Long-press to select the prompt.'
   :ok?'¡Copiado! Pégalo en ChatGPT y completa tus datos.':'Tu navegador no permitió copiar. Mantén pulsado el texto del prompt para seleccionarlo.';
 }
 function renderWorkbook(){
  if(getLanguage()==='en')section('03 / WORKBOOK','One idea at a time.','Write your answers and use them to plan your webpage. Come back anytime.');
  else section('03 / MI CUADERNO','Una idea a la vez.','Escribe tus respuestas. Lo que anotes aquí servirá para preparar tu página. No hace falta completarlo todo hoy.');
  if(ownerPreview){content.append(el('p','mi-note',t('Esta es una vista de administración. Las respuestas de estudiantes no aparecen aquí.','This is an admin preview. Students’ private answers are not shown here.'));}
  else{content.append(el('p','mi-note',t('Tus respuestas se guardan en tu cuenta. No escribas contraseñas ni información privada de tus clientes.','Your answers are saved to your account. Do not enter passwords or private customer information.'));}
  const summary=el('div','mi-work-summary');content.append(summary);
  const grid=el('div','mi-workbook-sections');content.append(grid);
  translateWorkbookBlocks(WORKBOOK,getLanguage()).forEach((block,i)=>{
   const details=el('details','mi-work-step');
   if(i===0)details.open=true;
   const count=block.qs.filter(q=>String(answers[q[0]]||'').trim()).length;
   details.innerHTML='<summary><span class="mi-prompt-number">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+esc(block.title)+'</strong><small>'+count+(getLanguage()==='en'?' of ':' de ')+block.qs.length+(getLanguage()==='en'?' answers':' respuestas')+'</small></span><span class="mi-plus">+</span></summary><div class="mi-work-body"><p>'+esc(block.sub)+'</p></div>';
   if(block.example)details.querySelector('.mi-work-body').append(el('p','mi-note',getLanguage()==='en'?'Example: enter accurate details from your own business.':'Ejemplo: '+block.example));
   block.qs.forEach(([key,title,placeholder])=>{
    const field=el('div','mi-field'),label=el('label',null,title),textarea=el('textarea');
    textarea.id='mi-'+key;label.htmlFor=textarea.id;textarea.placeholder=placeholder;textarea.maxLength=600;textarea.rows=2;textarea.value=answers[key]||'';textarea.disabled=ownerPreview;
    textarea.addEventListener('input',()=>{answers[key]=textarea.value;queueSave();updateSummary();const small=details.querySelector('summary small');small.textContent=block.qs.filter(q=>String(answers[q[0]]||'').trim()).length+(getLanguage()==='en'?' of ':' de ')+block.qs.length+(getLanguage()==='en'?' answers':' respuestas');});
    field.append(label,textarea);details.querySelector('.mi-work-body').append(field);
   });grid.append(details);
  });
  function updateSummary(){
   const answered=WORKBOOK.reduce((n,b)=>n+b.qs.filter(q=>String(answers[q[0]]||'').trim()).length,0);
   const total=WORKBOOK.reduce((n,b)=>n+b.qs.length,0);
   summary.innerHTML='<span>'+(getLanguage()==='en'?'Workbook progress':'Tu avance en el cuaderno')+'</span><strong>'+answered+' / '+total+'</strong><div class="mi-bar"><i style="width:'+Math.round(100*answered/total)+'%"></i></div>';
  }updateSummary();
  const actions=el('div','mi-actions');actions.innerHTML=getLanguage()==='en'?'<button class="mi-primary" type="button">Save answers</button><button class="mi-quiet" type="button">Print workbook</button>':'<button class="mi-primary" type="button">Guardar mis respuestas</button><button class="mi-quiet" type="button">Imprimir mi cuaderno</button>';content.append(actions);
  actions.children[0].addEventListener('click',()=>void save());
  actions.children[1].addEventListener('click',()=>window.print());
 }
 function renderExample(){
  section('06 / EL MISMO EJEMPLO DE TODA LA CLASE','Así se ve una página que se entiende.','Seguimos con Casa Brownie, el concepto ficticio de brownies tradicionales. No se aceptan pedidos ni cobros: se trata de una web informativa.');
  const guide=el('div','mi-demo-controls');guide.innerHTML='<div><button type="button" data-device="mobile">Ver en teléfono</button><button type="button" data-device="desktop" aria-pressed="true">Ver en computadora</button></div><p>Ejemplo visual · los botones no procesan pedidos</p>';content.append(guide);
  const frame=el('div','mi-demo-screen desktop');frame.innerHTML='<div class="mi-demo-browser"><i></i><i></i><i></i><small>VISTA DE EJEMPLO</small></div><div class="mi-demo-site"><div class="mi-demo-menu"><span>CASA BROWNIE</span><span>Por encargo · Preguntas</span></div><div class="mi-demo-hero"><div><span>UNA IDEA PARA COMPARTIR</span><h4>Brownies tradicionales, una idea por descubrir.</h4><p>Te mostramos cómo podría verse una web para presentar brownies tradicionales. No se aceptan pedidos.</p><button type="button" class="mi-demo-cta">Conoce el proyecto</button></div><div class="mi-cookie-scene" aria-label="Ilustración editorial de brownies"><i></i><i></i><i></i></div></div><div class="mi-demo-details"><div><strong>¿Qué recibes?</strong><span>Una presentación ficticia con imágenes y textos claros.</span></div><div><strong>¿Cómo funciona?</strong><span>La persona conoce la idea, revisa fotos y detalles.</span></div></div></div>';content.append(frame);
  const state=el('p','mi-demo-state','Este es un ejemplo visual: no se venden brownies.');content.append(state);
  frame.querySelector('.mi-demo-cta').addEventListener('click',()=>state.textContent='El botón es informativo; este ejemplo no envía pedidos ni guarda datos.');
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
  if(getLanguage()==='en')section('05 / BEFORE YOU SHARE','Is your webpage ready?','Check each item after you actually test it. Leave incomplete items unchecked.');
  else section('05 / ANTES DE COMPARTIR','¿Está lista tu página?','Marca una casilla cuando hayas hecho la prueba. Si algo falta, déjalo pendiente y vuelve después.');
  const phoneGuide=el('details','mi-explain');
  phoneGuide.innerHTML=getLanguage()==='en'
   ?'<summary><span>📱</span><strong>Only have a phone? Review your site without a computer</strong><b>+</b></summary>'+
    '<div><p>You can do this exercise from Safari or Chrome on your phone. First test the actual public website, then compare screen sizes. A preview does not replace testing on a real device.</p>'+
    '<ol><li>Open the public website in Safari or Chrome. Scroll through the page and tap its buttons and menu.</li>'+
    '<li>In another tab, open <a href="https://cometweb.io/tools/responsive" target="_blank" rel="noopener noreferrer">CometWeb · Responsive Preview</a>. Paste the PUBLIC website link. Compare 360 px (phone), 768 px (tablet) and 1280 px (desktop) if available.</li>'+
    '<li>Look for cut-off text and photos, horizontal overflow or tiny buttons. Take screenshots.</li>'+
    '<li>Use your website-building tool to fix one issue at a time, then retest the real website.</li></ol>'+
    '<p><strong>Remember:</strong> only paste public pages into third-party preview tools. A blocked preview is not proof of a broken site. Leave any unverified check incomplete.</p></div>'
   :'<summary><span>📱</span><strong>¿Solo tienes teléfono? Revisa tu web sin computadora</strong><b>+</b></summary>'+
    '<div><p>Todo este ejercicio se puede hacer desde el navegador de tu celular. Primero comprueba los botones en la web real. Después compara distintos tamaños de pantalla: una vista previa no sustituye probar un dispositivo físico.</p>'+
    '<ol><li>Abre el enlace público de tu web en Safari o Chrome. Recorre la página y toca el menú y los botones.</li>'+
    '<li>Abre otra pestaña y entra en <a href="https://cometweb.io/tools/responsive" target="_blank" rel="noopener noreferrer">CometWeb · Revisión de tamaños</a>. Pega el enlace público, elige aproximadamente 360 px (teléfono), 768 px (tablet) y 1280 px (computadora), y toca Preview.</li>'+
    '<li>Fíjate si se cortan textos o fotos, si algo se sale por los lados o si los botones quedan muy pequeños. Guarda capturas.</li>'+
    '<li>Regresa a la herramienta que usas para crear la web, corrige un problema por vez y vuelve a probar la página real.</li></ol>'+
    '<p><strong>Importante:</strong> usa solo páginas públicas en herramientas externas. Si una web bloquea la vista previa, no significa que esté mal: deja esa comprobación pendiente.</p></div>';
  content.append(phoneGuide);
  const count=el('div','mi-check-progress');content.append(count);
  const list=el('div','mi-check-list');content.append(list);
  function update(){const n=CHECKS.filter((x,i)=>checks['check'+i]===true).length;count.innerHTML='<div><span>'+t('Comprobaciones hechas','Checks completed')+'</span><strong>'+n+t(' de ',' of ')+CHECKS.length+'</strong></div><div class="mi-bar"><i style="width:'+Math.round(n/CHECKS.length*100)+'%"></i></div>'; }
  CHECKS.map((item,i)=>translateCheckItem(item,i,getLanguage())).forEach((item,i)=>{
   const card=el('article','mi-check');const inp=el('input');inp.type='checkbox';inp.id='mi-check-'+i;inp.checked=checks['check'+i]===true;inp.disabled=ownerPreview;const label=el('label');label.htmlFor=inp.id;
   label.innerHTML='<strong>'+String(i+1).padStart(2,'0')+'. '+esc(item.name)+'</strong><span>'+esc(item.how)+'</span><small>Listo cuando: '+esc(item.done)+'</small>';
   inp.addEventListener('change',()=>{checks['check'+i]=inp.checked;card.classList.toggle('checked',inp.checked);update();queueSave();});
   card.classList.toggle('checked',inp.checked);card.append(inp,label);list.append(card);
  });update();
  const note=el('p','mi-note',t('No necesitas terminar todo en un día. Cuando algo no funcione, anota el problema y corrígelo antes de compartir tu enlace.','You do not need to finish in one day. If something fails, note the problem and fix it before sharing your link.'));content.append(note);
  const actions=el('div','mi-actions');actions.innerHTML='<button class="mi-primary" type="button">'+t('Guardar comprobaciones','Save checks')+'</button><button class="mi-quiet" type="button">'+t('Volver a mis lecciones','Back to lessons')+'</button>';content.append(actions);
  actions.children[0].addEventListener('click',()=>void save());
  actions.children[1].addEventListener('click',()=>onGoLessons?.());
 }
 materialGroups.forEach(group=>{
  const b=el('button',null,group.title);b.type='button';b.dataset.group=group.id;b.setAttribute('aria-current','false');
  b.addEventListener('click',()=>go(group.views[0]));tabs.append(b);
 });
 go('inicio',{track:false});
 return {go,setLanguage(){
  const view=current;
  go(view,{track:false});
 }};
}

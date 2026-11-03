import {localizedPrompt,englishDemoTitle,englishDemoPhotoTitle} from './prompt-english.js?v=20261102-v3';
/* Galería privada y ampliable de ejemplos terminados.
   Los kits y fotografías se consultan tras validar la compra/owner por RLS. */
const esc = s => String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;");
const safeUrl = value => {
 try { const u=new URL(String(value));return u.protocol==='https:'&&!u.username&&!u.password?u.href:''; }catch{return '';}
};
const enLabel = (es,en,lang) => lang==='en'?en:es;

const spanishStageNames={"casa-brownie":["Empezar desde una página vacía","Identidad y menú de navegación","Portada con una foto fija","Seis fotos individuales de brownies","Catálogo y presentación de sabores","Regalos y fotografías de empaques","Historia y ubicación ficticia","Información de entrega de ejemplo","Interacciones de carrito de demostración","Pie de página y créditos","Revisión final con capturas","Bono opcional: video en la portada"],"crumb":["Crear la estructura inicial","Dirección fotográfica: 14 escenas","Portada y navegación","Seis fotografías individuales","Catálogo de sabores","Regalos, cajas y presentación","Galería de la marca","Armar tu caja: demostración interactiva","Ubicación ilustrativa","Banners e historia de la marca","Pie de página y contacto ilustrativo","Revisión móvil y final"],"aftr":["Dirección visual del local nocturno","Ocho fotografías individuales","Portada, menú y acceso para mayores de 21","Eventos de hoy y programación semanal","Mesas exclusivas y lista de invitados","Entradas y revisión final"],"soluna":["Investigar el negocio y su estilo","Identidad y sistema visual","Ocho fotografías individuales de yoga","Portada y botón principal","Oferta de lanzamiento y clases","Espacios y ubicación","Membresías de demostración","Lista de espera, privacidad y revisión","Publicar y comparar"]};
function stageLabel(id,index,original,lang,prompt){
 if(lang==='en'&&prompt?.title_en)return prompt.title_en;
 if(lang!=='en'&&prompt?.title_es)return prompt.title_es;
 if(lang==='en')return englishDemoTitle('demo_'+id+'_'+index,original);
 return spanishStageNames[id]?.[index]||original||'Etapa '+(index+1);
}
const spanishDescriptions={"aftr":["Identidad visual de un club nocturno ficticio, con portada, eventos, áreas exclusivas y fotografías editoriales.","Concepto educativo para mayores de 21 años. No se venden entradas ni se reservan mesas."],"casa-brownie":["Página de repostería con portada de foto fija, sabores, fotografías individuales, regalos y contacto. Es el ejemplo principal del curso.","Ejemplo ficticio. No recibe pedidos ni pagos reales. La portada con video es opcional."],"cb-depot":["Ejemplo real de negocio de servicios, con reservas y presentación cuidada. Se muestra solo su página pública.","Proyecto de un cliente real. No se comparten sus fotografías ni instrucciones privadas."],"cleaning":["Reservas de limpieza residencial y solicitudes de presupuesto comercial. Estudia sus servicios y recorrido del cliente.","Demostración pública de servicios para el hogar. No se comparten datos internos ni automatizaciones."],"crumb":["Tienda de galletas con fotografía editorial, productos, cajas, empaques, historia de marca y diseño móvil.","Proyecto ficticio. No procesa pagos ni promete entregas reales."],"jaramillo":["Ejemplo de boutique de moda que presenta a su diseñadora y sus colecciones, sin proceso de pago.","Concepto de boutique. No reutilices la imagen ni identidad de la diseñadora."],"soluna":["Estudio de yoga: investigación, identidad, clases, oferta de lanzamiento, lista de espera y revisión final.","Ejemplo educativo. Los formularios y membresías son demostrativos; no se cobran pagos."],"yummm":["Cafetería y repostería: fotografías de postres, menú, empaques para llevar y página con identidad de marca.","Galería de 20 fotografías y guía educativa de práctica con instrucciones por sección."]};
function demoDescription(d,language){return language==='en'?(d.description_en||''):(spanishDescriptions[d.id]?.[0]||d.description_es||'');}
function demoNotes(d,language){if(d.id==='yummm')return language==='en'?'20 individual photos and an eight-step educational guide, organized by real website sections.':'20 fotografías individuales y una guía educativa de ocho etapas, ordenada por secciones reales de la web.';return language==='en'?(d.notes_en||''):(spanishDescriptions[d.id]?.[1]||d.notes_es||'');}
function galleryPhotoLabel(demo,index,photo,lang){
 const explicit=lang==='en'?photo?.label_en:photo?.label_es;
 if(explicit)return String(explicit);
 const raw=String(photo?.name||'').trim();
 const descriptive=raw&&!/^(?:\d{1,2}|hero|image|photo|img)$/i.test(raw)&&!/\.(webp|png|jpe?g)$/i.test(raw);
 // A filename or a position in an array is not evidence of placement.
 if(descriptive)return raw;
 return lang==='en'?'Reference photo '+String(index+1).padStart(2,'0'):'Fotografía de referencia '+String(index+1).padStart(2,'0');
}
function galleryPhotoSection(photo,lang){
 return lang==='en'?(photo?.section_en||'Reference image'):(photo?.section_es||'Fotografía de referencia');
}
function galleryPhotoOrder(photo,index){
 const position=Number(photo?.display_order);
 return Number.isFinite(position)&&position>0?position:1000+index;
}

async function clipboardCopy(value,button,language='es'){
 let copied=false;
 try{await navigator.clipboard.writeText(value);copied=true;}catch{}
 if(!copied){
  const input=document.createElement('textarea');input.value=value;input.style.cssText='position:fixed;left:-9999px';
  document.body.append(input);input.select();
  try{copied=document.execCommand('copy');}catch{}input.remove();
 }
 button.textContent=language==='en'?(copied?'Copied!':'Select text to copy'):(copied?'¡Copiado!':'Selecciona el texto para copiarlo');
}
function fillCreativeWorkflowPrompt(template,demo,spec,language){
 const vars={'{{DEMO}}':demo.title,'{{STYLE_ES}}':spec?.style_es||'', '{{STYLE_EN}}':spec?.style_en||'',
  '{{SECTIONS_ES}}':spec?.sections_es||'','{{SECTIONS_EN}}':spec?.sections_en||''};
 let result=String(template||'');
 for(const [token,value] of Object.entries(vars))result=result.replaceAll(token,String(value));
 if(spec?.private)result+='\n'+(language==='en'?'Do not reuse or share a real client’s private material.':'No reutilices ni compartas recursos privados de un cliente real.');
 return result;
}
function studioPhotoFile(url){return String(url||'').split(/[?#]/)[0].split('/').pop()||'';}
function correctedDemoText(text,spec){
 let value=String(text||'');
 for(const rule of Array.isArray(spec?.replace_rules)?spec.replace_rules:[]){
  if(Array.isArray(rule)&&rule.length===2)value=value.replaceAll(String(rule[0]),String(rule[1]));
 }
 return value;
}
export async function mountInspiracion(root,{db,courseId,adminPreview=false,getLanguage=()=> 'es'}={}){
 if(!root)return null;
 root.innerHTML='<p class="inspiration-loading" role="status">'+(getLanguage()==='en'?'Loading projects…':'Cargando proyectos…')+'</p>';
 const [galleryResponse,workflowResponse]=await Promise.all([
  db.from('podcast_class_learning_assets').select('payload,status')
    .eq('course_id',courseId).eq('asset_code','inspiration_gallery_v1').maybeSingle(),
  db.from('podcast_class_learning_assets').select('payload,status')
    .eq('course_id',courseId).eq('asset_code','inspiration_workflow_v3').maybeSingle()
 ]);
 const {data,error}=galleryResponse;
 const guidePayload=workflowResponse?.data?.status==='ready'?workflowResponse.data.payload:null;
 if(error||!data?.payload||data.status!=='ready'){
  root.textContent=getLanguage()==='en'?'Your inspiration gallery is being prepared.':'Tu galería de inspiración se está preparando.';
  return {setLanguage(){}};
 }
 const demos=Array.isArray(data.payload.demos)?data.payload.demos.filter(d=>d&&d.id&&d.title&&safeUrl(d.url)):[];
 const visibleDemos=()=>adminPreview?demos:demos.filter(d=>d.published!==false);
 const demoPrompts=d=>{const guideCase=guidePayload?.cases?.[d.id];return Array.isArray(d.prompts)&&d.prompts.length?d.prompts:(Array.isArray(guideCase?.extra_prompts)?guideCase.extra_prompts:[]);};
 let currentId=null,category='all',search='';
 const categoryNames={
  all:['Todas','All'],food:['Repostería y comida','Food & bakery'],
  hospitality:['Eventos','Events'],fashion:['Moda','Fashion'],wellness:['Bienestar','Wellness'],
  services:['Servicios','Services']
 };
 const curLang=()=>getLanguage()==='en'?'en':'es';
 function header(title,sub){
  const wrap=document.createElement('div');wrap.className='inspiration-heading';
  wrap.innerHTML='<span class="inspiration-eyebrow">'+enLabel('IDEAS REALES PARA ESTUDIAR','REAL EXAMPLES TO LEARN FROM',curLang())+'</span>'+
   '<h2>'+esc(title)+'</h2><p>'+esc(sub)+'</p>';
  return wrap;
 }
 function showGallery(){
  currentId=null;root.replaceChildren();
  root.append(header(enLabel('Inspírate, aprende y adapta.','Explore, learn, make it yours.',curLang()),
   enLabel('Abre una web terminada, estudia cada sección, copia sus prompts y mira las fotografías individuales. Cada proyecto responde a una necesidad diferente.','Open a finished site, review each section, copy prompts and explore individual photos. Every project solves a different business need.',curLang())));
  const filter=document.createElement('div');filter.className='inspiration-filters';
  filter.innerHTML='<label>'+enLabel('Categoría','Category',curLang())+
   '<select id="inspiration-category">'+Object.entries(categoryNames).map(([key,value])=>'<option value="'+esc(key)+'"'+(category===key?' selected':'')+'>'+esc(value[curLang()==='en'?1:0])+'</option>').join('')+'</select></label>'+
   '<label>'+enLabel('Buscar un negocio','Search by business',curLang())+
   '<input id="inspiration-search" type="search" value="'+esc(search)+'" placeholder="'+esc(enLabel('Brownie, boutique, yoga…','Brownie, boutique, yoga…',curLang()))+'"></label>';
  root.append(filter);
  if(adminPreview){
   const editor=document.createElement('section');editor.className='inspiration-owner-editor';
   const heading=document.createElement('h3');heading.textContent=enLabel('Elegir demos visibles para alumnos','Choose demos students can see',curLang());
   const hint=document.createElement('p');hint.textContent=enLabel('Activa los proyectos que quieras enseñar. Los demás permanecen disponibles solo en tu vista del Studio.','Choose which projects students can see. Other projects stay visible only in your Studio preview.',curLang());
   const options=document.createElement('div');options.className='inspiration-owner-options';
   const state=document.createElement('p');state.setAttribute('role','status');
   for(const demo of demos){
    const label=document.createElement('label');
    const input=document.createElement('input');input.type='checkbox';input.checked=demo.published!==false;
    const title=document.createElement('span');title.textContent=demo.title;
    label.append(input,title);options.append(label);
    input.addEventListener('change',async()=>{
     const previous=demo.published;demo.published=input.checked;input.disabled=true;
     const updated={...data.payload,demos};
     const {error}=await db.from('podcast_class_learning_assets').update({payload:updated}).eq('course_id',courseId).eq('asset_code','inspiration_gallery_v1');
     input.disabled=false;
     if(error){demo.published=previous;input.checked=previous!==false;state.textContent=enLabel('No se pudo guardar. Vuelve a intentarlo.','Could not save. Try again.',curLang());}
     else{state.textContent=enLabel('Selección guardada. Los alumnos verán los proyectos activados.','Selection saved. Students will see the enabled projects.',curLang());}
    });
   }
   editor.append(heading,hint,options,state);root.append(editor);
  }
  const grid=document.createElement('div');grid.className='inspiration-grid';root.append(grid);
  const count=document.createElement('p');count.className='inspiration-count';root.append(count);
  function paint(){
   grid.replaceChildren();
   const entries=visibleDemos().filter(d=>(category==='all'||d.category===category)&&(!search||[d.title,d.description_es,d.description_en].join(' ').toLowerCase().includes(search.toLowerCase())));
   count.textContent=entries.length+' '+enLabel('proyectos disponibles','projects available',curLang());
   if(!entries.length){grid.innerHTML='<p>'+enLabel('Prueba otra categoría o palabra.','Try a different category or search.',curLang())+'</p>';return;}
   for(const d of entries){
    const card=document.createElement('button');card.type='button';card.className='inspiration-card';
    card.innerHTML='<div class="inspiration-card-image">'+(safeUrl(d.image)?'<img src="'+esc(safeUrl(d.image))+'" alt="'+esc(d.title)+'" loading="lazy">':'<span class="inspiration-no-photo">'+esc(d.title)+'</span>')+'</div>'+
    '<div class="inspiration-card-meta"><small>'+esc(enLabel(d.category_es,d.category_en,curLang()))+'</small><h3>'+esc(d.title)+'</h3>'+
    '<p>'+esc(demoDescription(d,curLang()))+'</p>'+
    '<span class="inspiration-card-numbers">'+(d.photos?.length||0)+' '+enLabel('fotos','photos',curLang())+' · '+demoPrompts(d).length+' '+enLabel('etapas','steps',curLang())+'</span>'+
    '<span class="inspiration-card-link">'+enLabel('Explorar este caso','Explore case study',curLang())+' →</span></div>';
    card.addEventListener('click',()=>showDemo(d.id));grid.append(card);
   }
  }
  filter.querySelector('#inspiration-category').addEventListener('change',e=>{category=e.target.value;paint();});
  filter.querySelector('#inspiration-search').addEventListener('input',e=>{search=e.target.value;paint();});
  paint();
 }
 function showDemo(id){
  const d=visibleDemos().find(x=>x.id===id);if(!d)return showGallery();
  currentId=id;root.replaceChildren();
  const nav=document.createElement('div');nav.className='inspiration-demo-nav';
  nav.innerHTML='<button type="button" data-back>'+enLabel('← Atrás a inspiración','← Back to inspiration',curLang())+'</button>'+
   '<button type="button" data-close>'+enLabel('× Cerrar caso','× Close case',curLang())+'</button>';
  nav.querySelectorAll('button').forEach(b=>b.addEventListener('click',showGallery));root.append(nav);
  root.append(header(d.title,enLabel(d.description_es,d.description_en,curLang())));
  const lead=document.createElement('section');lead.className='inspiration-demo-lead';
  const coverPhoto=Array.isArray(d.photos)?d.photos.find(p=>safeUrl(p.url)&&safeUrl(p.url)===safeUrl(d.image)):null;
  const coverIsVerified=coverPhoto?.usage==='hero';
  const coverLabel=coverIsVerified
   ?enLabel('Imagen principal del hero','Main hero image',curLang())
   :enLabel('Imagen de referencia del demo','Demo reference image',curLang());
  lead.innerHTML='<div class="inspiration-demo-cover">'+(safeUrl(d.image)?'<img src="'+esc(safeUrl(d.image))+'" loading="lazy" alt="'+esc(coverPhoto?galleryPhotoLabel(d.id,0,coverPhoto,curLang()):d.title)+'"><small class="inspiration-cover-caption">'+esc(coverLabel)+'</small>':'')+'</div>'+
   '<div><span class="inspiration-eyebrow">'+esc(enLabel(d.category_es,d.category_en,curLang()))+'</span>'+
   '<p>'+esc(demoNotes(d,curLang()))+'</p>'+
   '<a class="inspiration-demo-open" target="_blank" rel="noopener noreferrer" href="'+esc(safeUrl(d.url))+'">'+enLabel('Abrir página completa','Open full website',curLang())+' ↗</a>'+
   (safeUrl(d.video_url)?'<a class="inspiration-demo-open secondary" target="_blank" rel="noopener noreferrer" href="'+esc(safeUrl(d.video_url))+'">'+enLabel('Comparar versión con video','Compare video version',curLang())+' ↗</a>':'')+'</div>';
  root.append(lead);
  const guideCase=guidePayload?.cases?.[d.id];
  if(guideCase&&Array.isArray(guidePayload?.templates)){
   const work=document.createElement('section');work.className='inspiration-workflow';
   work.innerHTML='<div class="inspiration-section-title"><h3>'+enLabel('Primero el moodboard. Después las fotos.','Moodboard first. Photos second.',curLang())+'</h3><p>'+enLabel('Aprueba el estilo, prepara lotes de máximo 9 fotos independientes y colócalas por sección.','Approve the style, plan batches of up to 9 separate photos and place them by section.',curLang())+'</p></div>';
   const list=document.createElement('div');list.className='inspiration-workflow-steps';
   for(const step of guidePayload.templates){
    const item=document.createElement('details');item.className='inspiration-workflow-step';
    const title=curLang()==='en'?step.title_en:step.title_es;
    const description=curLang()==='en'?step.description_en:step.description_es;
    const promptText=fillCreativeWorkflowPrompt(curLang()==='en'?step.prompt_en:step.prompt_es,d,guideCase,curLang());
    const summary=document.createElement('summary');summary.innerHTML='<strong>'+esc(title)+'</strong><small>'+esc(description||'')+'</small>';
    const inner=document.createElement('div');inner.className='inspiration-workflow-body';
    const paragraph=document.createElement('p');paragraph.className='inspiration-workflow-prompt';paragraph.textContent=promptText;
    const copy=document.createElement('button');copy.type='button';copy.className='inspiration-copy';
    copy.textContent=enLabel('Copiar este prompt','Copy this prompt',curLang());
    copy.addEventListener('click',()=>clipboardCopy(promptText,copy,curLang()));
    inner.append(paragraph,copy);item.append(summary,inner);list.append(item);
   }
   work.append(list);root.append(work);
  }
  const photos=Array.isArray(d.photos)
   ?d.photos.filter(x=>safeUrl(x.url)).map((p,index)=>({p,index}))
      .sort((a,b)=>galleryPhotoOrder(a.p,a.index)-galleryPhotoOrder(b.p,b.index))
   :[];
  const photoBlock=document.createElement('section');photoBlock.className='inspiration-photos';
  photoBlock.innerHTML='<div class="inspiration-section-title"><h3>'+enLabel('Fotografías individuales','Individual photos',curLang())+'</h3><p>'+photos.length+' '+enLabel('imágenes de referencia, sin collages. Ábrelas por separado para guardarlas.','reference images, not collages. Open each separately to save.',curLang())+'</p></div>';
  const gallery=document.createElement('div');gallery.className='inspiration-photo-batches';
  const batchSize=Math.min(9,Math.max(1,Number(guidePayload?.photo_batch_size)||9));
  for(let start=0;start<photos.length;start+=batchSize){
   const batch=photos.slice(start,start+batchSize);
   const batchWrap=document.createElement('section');batchWrap.className='inspiration-photo-batch';
   const heading=document.createElement('h4');heading.className='inspiration-photo-batch-title';
   heading.textContent=curLang()==='en'
    ?'Batch '+String(Math.floor(start/batchSize)+1).padStart(2,'0')+' · photos '+(start+1)+'–'+(start+batch.length)
    :'Lote '+String(Math.floor(start/batchSize)+1).padStart(2,'0')+' · fotos '+(start+1)+'–'+(start+batch.length);
   const grid=document.createElement('div');grid.className='inspiration-photo-grid';
   for(const {p,index:photoIndex} of batch){
    const label=galleryPhotoLabel(d.id,photoIndex,p,curLang());
    const section=galleryPhotoSection(p,curLang());
    const item=document.createElement('div');item.className='inspiration-photo-item';
    const link=document.createElement('a');link.href=safeUrl(p.url);
    link.rel='noopener noreferrer';link.target='_blank';link.className='inspiration-photo';
    if(p.usage==='hero')link.classList.add('inspiration-photo-hero');
    link.setAttribute('aria-label',section+' · '+label);
    link.innerHTML='<img alt="'+esc(label)+'" loading="lazy" src="'+esc(safeUrl(p.url))+'"><small class="inspiration-photo-section">'+esc(section)+'</small><span>'+esc(label)+'</span>';
    item.append(link);
    const directions=document.createElement('details');directions.className='inspiration-photo-directions';
    const sum=document.createElement('summary');sum.textContent=enLabel('Cómo usar esta foto','How to use this photo',curLang());
    const photoInstruction=curLang()==='en'
     ?'For '+d.title+' and my APPROVED moodboard ('+(guideCase?.style_en||'approved visual style')+'), use the ORIGINAL authorized photo '+studioPhotoFile(p.url)+' in '+section+': '+label+'. Do NOT regenerate an existing approved or owned photo. If I explicitly request a replacement, create ONE separate image for this section, never a collage, and ask me to approve it before changing the page. Preserve other images and quality.'
     :'Para '+d.title+' y mi MOODBOARD APROBADO ('+(guideCase?.style_es||'dirección visual aprobada')+'), usa la foto ORIGINAL autorizada '+studioPhotoFile(p.url)+' en '+section+': '+label+'. NO regeneres fotos propias ni aprobadas. Solo si solicito una alternativa, crea UNA foto individual para esta sección, nunca un collage, y espera mi aprobación antes de reemplazar la imagen. Conserva las demás fotos y su calidad.';
    const explanation=document.createElement('p');explanation.textContent=photoInstruction;
    const cp=document.createElement('button');cp.type='button';cp.className='inspiration-copy';
    cp.textContent=enLabel('Copiar prompt de foto','Copy photo prompt',curLang());
    cp.addEventListener('click',()=>clipboardCopy(photoInstruction,cp,curLang()));
    directions.append(sum,explanation,cp);item.append(directions);grid.append(item);
   }
   batchWrap.append(heading,grid);gallery.append(batchWrap);
  }
  if(!photos.length)gallery.innerHTML='<p>'+enLabel('Las fotos privadas de clientes no se comparten. Usa imágenes propias autorizadas para tu práctica.','Private client photos are not shared. Use your own authorized practice images.',curLang())+'</p>';
  photoBlock.append(gallery);root.append(photoBlock);
  const prompts=demoPrompts(d);
  const pSection=document.createElement('section');pSection.className='inspiration-prompts';
  pSection.innerHTML='<div class="inspiration-section-title"><h3>'+enLabel('Prompts por etapa','Step-by-step prompts',curLang())+'</h3>'+
   '<p>'+enLabel('Pega un prompt por vez. Sustituye los datos de ejemplo por los de tu negocio. Los comandos originales pueden estar en español.','Open a step and copy its US-English learning adaptation. Adjust your own facts and photos; do not copy the demo brand.',curLang())+'</p></div>';
  const list=document.createElement('div');list.className='inspiration-prompt-list';
  for(const [i,p] of prompts.entries()){
   const item=document.createElement('details');item.className='inspiration-prompt';
   item.innerHTML='<summary><span>'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(stageLabel(d.id,i,p.title,curLang(),p))+'</strong><small>'+esc(curLang()==='en'?'Step '+(i+1)+' of '+prompts.length:p.step||'')+'</small></summary>';
   const body=document.createElement('div');body.className='inspiration-prompt-body';
   const original=curLang()==='en'&&p.body_en?p.body_en:localizedPrompt('demo_'+d.id+'_'+i,p.body||'',curLang(),d.title);
   const promptText=correctedDemoText(original,guideCase);
   const mappedStagePhotos=Array.isArray(guideCase?.stage_files?.[String(i+1)])?guideCase.stage_files[String(i+1)]:[];
   const usedPhotos=mappedStagePhotos.length
    ?mappedStagePhotos.map(file=>photos.find(row=>studioPhotoFile(row.p.url)===file)?.p).filter(Boolean)
    :photos.map(row=>row.p).filter(photo=>typeof p.body==='string'&&p.body.includes(photo.url));
   const placement=usedPhotos.length
    ?(curLang()==='en'?'APPROVED PHOTOS FOR THIS STEP: ':'FOTOS APROBADAS PARA ESTA ETAPA: ')+usedPhotos.map(img=>studioPhotoFile(img.url)+' → '+galleryPhotoSection(img,curLang())).join('; ')+
      (curLang()==='en'?'. Use ONLY these originals in their sections. Do not replace the hero with a product photo.':'. Usa SOLO estos originales en las secciones indicadas. No cambies el hero por fotos de productos.')
    :enLabel('Esta etapa no necesita fotos nuevas. Conserva las imágenes ya aprobadas y espera el moodboard antes de crear otras.','This step needs no new photos. Keep approved images and wait for moodboard approval before making new ones.',curLang());
   const pre=document.createElement('p');pre.className='inspiration-prompt-text';pre.textContent=promptText;
   const copy=document.createElement('button');copy.type='button';copy.className='inspiration-copy';
   copy.textContent=enLabel('Copiar instrucciones y ubicación de fotos','Copy steps and photo placement',curLang());
   copy.addEventListener('click',()=>clipboardCopy(promptText+'\n\n'+placement,copy,curLang()));
   if(usedPhotos.length){
    const photoRefs=document.createElement('div');photoRefs.className='inspiration-step-photos';
    for(const img of usedPhotos){
     const a=document.createElement('a');a.className='inspiration-step-photo';a.href=safeUrl(img.url);
     a.target='_blank';a.rel='noopener noreferrer';
     const label=galleryPhotoLabel(d.id,0,img,curLang());
     a.innerHTML='<img src="'+esc(safeUrl(img.url))+'" alt="'+esc(label)+'" loading="lazy"><span>'+esc(galleryPhotoSection(img,curLang()))+'</span>';
     photoRefs.append(a);
    }
    body.append(photoRefs);
   }
   const placementNote=document.createElement('p');placementNote.className='inspiration-prompt-placement';placementNote.textContent=placement;
   body.append(pre,placementNote,copy);
   for(const pic of Array.isArray(p.photos)?p.photos:[]){
    const photo=document.createElement('details');photo.className='inspiration-photo-prompt';
    const sum=document.createElement('summary');sum.textContent=(curLang()==='en'?'Photo prompt: ':'Prompt de foto: ')+(curLang()==='en'?(pic.title_en||englishDemoPhotoTitle('demo-photo_'+d.id+'_'+i+'_'+(Array.isArray(p.photos)?p.photos.indexOf(pic):0),pic.title)):pic.title||'');
    const basePhotoText=curLang()==='en'&&pic.body_en?pic.body_en:localizedPrompt('demo-photo_'+d.id+'_'+i,pic.body||'',curLang(),d.title);
    const photoText=correctedDemoText(basePhotoText,guideCase)+'\n\n'+enLabel('Una fotografía por archivo. Organiza la producción en lotes de hasta 9 imágenes independientes; no collage. Solo generar después del moodboard aprobado.','One photo per file. Plan batches of up to 9 independent images; never a collage. Generate only after the moodboard is approved.',curLang());
    const txt=document.createElement('p');txt.textContent=photoText;
    const cp=document.createElement('button');cp.type='button';cp.textContent=enLabel('Copiar prompt de foto','Copy photo prompt',curLang());cp.addEventListener('click',()=>clipboardCopy(photoText,cp,curLang()));
    photo.append(sum,txt,cp);body.append(photo);
   }
   item.append(body);list.append(item);
  }
  if(!prompts.length)list.innerHTML='<p class="inspiration-coming">'+enLabel('Los prompts originales de este proyecto todavía no están verificados para publicarlos. Puedes estudiar la página y sus fotografías mientras se completa el kit.','Original prompt files for this project have not yet been verified for release. You can study its website and photographs meanwhile.',curLang())+'</p>';
  pSection.append(list);root.append(pSection);
 }
 showGallery();
 return {setLanguage(){if(currentId)showDemo(currentId);else showGallery();},open(id){showDemo(id);}};
}

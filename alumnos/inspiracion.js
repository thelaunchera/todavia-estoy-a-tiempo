import {localizedPrompt} from './prompt-english.js?v=20261102-v1';
/* Galería privada y ampliable de ejemplos terminados.
   Los kits y fotografías se consultan tras validar la compra/owner por RLS. */
const esc = s => String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;");
const safeUrl = value => {
 try { const u=new URL(String(value));return u.protocol==='https:'&&!u.username&&!u.password?u.href:''; }catch{return '';}
};
const enLabel = (es,en,lang) => lang==='en'?en:es;
async function clipboardCopy(value,button){
 let copied=false;
 try{await navigator.clipboard.writeText(value);copied=true;}catch{}
 if(!copied){
  const input=document.createElement('textarea');input.value=value;input.style.cssText='position:fixed;left:-9999px';
  document.body.append(input);input.select();
  try{copied=document.execCommand('copy');}catch{}input.remove();
 }
 button.textContent=copied?'✓ Copied / Copiado':'Select text / Selecciona el texto';
}
export async function mountInspiracion(root,{db,courseId,getLanguage=()=> 'es'}={}){
 if(!root)return null;
 root.innerHTML='<p class="inspiration-loading" role="status">Cargando proyectos / Loading projects…</p>';
 const {data,error}=await db.from('podcast_class_learning_assets')
  .select('payload,status').eq('course_id',courseId).eq('asset_code','inspiration_gallery_v1').maybeSingle();
 if(error||!data?.payload||data.status!=='ready'){
  root.textContent=getLanguage()==='en'?'Your inspiration gallery is being prepared.':'Tu galería de inspiración se está preparando.';
  return {setLanguage(){}};
 }
 const demos=Array.isArray(data.payload.demos)?data.payload.demos.filter(d=>d&&d.id&&d.title&&safeUrl(d.url)):[];
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
  const grid=document.createElement('div');grid.className='inspiration-grid';root.append(grid);
  const count=document.createElement('p');count.className='inspiration-count';root.append(count);
  function paint(){
   grid.replaceChildren();
   const entries=demos.filter(d=>(category==='all'||d.category===category)&&(!search||[d.title,d.description_es,d.description_en].join(' ').toLowerCase().includes(search.toLowerCase())));
   count.textContent=entries.length+' '+enLabel('proyectos disponibles','projects available',curLang());
   if(!entries.length){grid.innerHTML='<p>'+enLabel('Prueba otra categoría o palabra.','Try a different category or search.',curLang())+'</p>';return;}
   for(const d of entries){
    const card=document.createElement('button');card.type='button';card.className='inspiration-card';
    card.innerHTML='<div class="inspiration-card-image">'+(safeUrl(d.image)?'<img src="'+esc(safeUrl(d.image))+'" alt="'+esc(d.title)+'" loading="lazy">':'<span class="inspiration-no-photo">'+esc(d.title)+'</span>')+'</div>'+
    '<div class="inspiration-card-meta"><small>'+esc(enLabel(d.category_es,d.category_en,curLang()))+'</small><h3>'+esc(d.title)+'</h3>'+
    '<p>'+esc(enLabel(d.description_es,d.description_en,curLang()))+'</p>'+
    '<span class="inspiration-card-numbers">'+(d.photos?.length||0)+' '+enLabel('fotos','photos',curLang())+' · '+(d.prompts?.length||0)+' '+enLabel('etapas','steps',curLang())+'</span>'+
    '<span class="inspiration-card-link">'+enLabel('Explorar este caso','Explore case study',curLang())+' →</span></div>';
    card.addEventListener('click',()=>showDemo(d.id));grid.append(card);
   }
  }
  filter.querySelector('#inspiration-category').addEventListener('change',e=>{category=e.target.value;paint();});
  filter.querySelector('#inspiration-search').addEventListener('input',e=>{search=e.target.value;paint();});
  paint();
 }
 function showDemo(id){
  const d=demos.find(x=>x.id===id);if(!d)return showGallery();
  currentId=id;root.replaceChildren();
  const nav=document.createElement('div');nav.className='inspiration-demo-nav';
  nav.innerHTML='<button type="button" data-back>'+enLabel('← Atrás a inspiración','← Back to inspiration',curLang())+'</button>'+
   '<button type="button" data-close>'+enLabel('× Cerrar caso','× Close case',curLang())+'</button>';
  nav.querySelectorAll('button').forEach(b=>b.addEventListener('click',showGallery));root.append(nav);
  root.append(header(d.title,enLabel(d.description_es,d.description_en,curLang())));
  const lead=document.createElement('section');lead.className='inspiration-demo-lead';
  lead.innerHTML='<div class="inspiration-demo-cover">'+(safeUrl(d.image)?'<img src="'+esc(safeUrl(d.image))+'" loading="lazy" alt="'+esc(d.title)+'">':'')+'</div>'+
   '<div><span class="inspiration-eyebrow">'+esc(enLabel(d.category_es,d.category_en,curLang()))+'</span>'+
   '<p>'+esc(enLabel(d.notes_es,d.notes_en,curLang()))+'</p>'+
   '<a class="inspiration-demo-open" target="_blank" rel="noopener noreferrer" href="'+esc(safeUrl(d.url))+'">'+enLabel('Abrir página completa','Open full website',curLang())+' ↗</a>'+
   (safeUrl(d.video_url)?'<a class="inspiration-demo-open secondary" target="_blank" rel="noopener noreferrer" href="'+esc(safeUrl(d.video_url))+'">'+enLabel('Comparar versión con video','Compare video version',curLang())+' ↗</a>':'')+'</div>';
  root.append(lead);
  const photos=Array.isArray(d.photos)?d.photos.filter(x=>safeUrl(x.url)):[];
  const photoBlock=document.createElement('section');photoBlock.className='inspiration-photos';
  photoBlock.innerHTML='<div class="inspiration-section-title"><h3>'+enLabel('Fotografías individuales','Individual photos',curLang())+'</h3><p>'+photos.length+' '+enLabel('imágenes de referencia, sin collages. Ábrelas por separado para guardarlas.','reference images, not collages. Open each separately to save.',curLang())+'</p></div>';
  const gallery=document.createElement('div');gallery.className='inspiration-photo-grid';
  for(const p of photos){
   const link=document.createElement('a');link.href=safeUrl(p.url);link.rel='noopener noreferrer';link.target='_blank';link.className='inspiration-photo';
   link.innerHTML='<img alt="'+esc(p.name||'Photo')+'" loading="lazy" src="'+esc(safeUrl(p.url))+'"><span>'+esc(p.name||'Photo')+' ↗</span>';
   gallery.append(link);
  }
  if(!photos.length)gallery.innerHTML='<p>'+enLabel('Las fotos individuales de este cliente no se comparten.','Individual client photos are not shared.',curLang())+'</p>';
  photoBlock.append(gallery);root.append(photoBlock);
  const prompts=Array.isArray(d.prompts)?d.prompts:[];
  const pSection=document.createElement('section');pSection.className='inspiration-prompts';
  pSection.innerHTML='<div class="inspiration-section-title"><h3>'+enLabel('Prompts por etapa','Step-by-step prompts',curLang())+'</h3>'+
   '<p>'+enLabel('Pega un prompt por vez. Sustituye los datos de ejemplo por los de tu negocio. Los comandos originales pueden estar en español.','Use one prompt at a time. Replace example details with your business information. Some original prompts are in Spanish.',curLang())+'</p></div>';
  const list=document.createElement('div');list.className='inspiration-prompt-list';
  for(const [i,p] of prompts.entries()){
   const item=document.createElement('details');item.className='inspiration-prompt';
   item.innerHTML='<summary><span>'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(p.title)+'</strong><small>'+esc(p.step||'')+'</small></summary>';
   const body=document.createElement('div');body.className='inspiration-prompt-body';
   const promptText=localizedPrompt('demo_'+d.id+'_'+i,p.body||'',curLang(),d.title);
   const pre=document.createElement('p');pre.className='inspiration-prompt-text';pre.textContent=promptText;
   const copy=document.createElement('button');copy.type='button';copy.className='inspiration-copy';copy.textContent=enLabel('Copiar prompt','Copy original prompt',curLang());copy.addEventListener('click',()=>clipboardCopy(promptText,copy));
   body.append(pre,copy);
   for(const pic of Array.isArray(p.photos)?p.photos:[]){
    const photo=document.createElement('details');photo.className='inspiration-photo-prompt';
    const sum=document.createElement('summary');sum.textContent=(curLang()==='en'?'Photo prompt: ':'Prompt de foto: ')+(pic.title||'');
    const photoText=localizedPrompt('demo-photo_'+d.id+'_'+i,pic.body||'',curLang(),d.title);
    const txt=document.createElement('p');txt.textContent=photoText;
    const cp=document.createElement('button');cp.type='button';cp.textContent=enLabel('Copiar prompt de foto','Copy photo prompt',curLang());cp.addEventListener('click',()=>clipboardCopy(photoText,cp));
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

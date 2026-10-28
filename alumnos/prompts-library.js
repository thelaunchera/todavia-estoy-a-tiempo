/* Biblioteca privada: los cuerpos se solicitan tras autenticar y comprobar compra.
   No almacenar prompts completos en el bundle público ni en localStorage. */
const $=id=>document.getElementById(id);
let prompts=[],category='Todas',searchTerm='';
const list=$('student-prompts-grid'),filters=$('prompt-categories'),search=$('prompt-search'),count=$('prompt-count'),empty=$('prompt-empty'),feedback=$('prompt-feedback');

function el(tag,className,text){
 const node=document.createElement(tag);
 if(className)node.className=className;
 if(text!==undefined)node.textContent=text;
 return node;
}
function visibleEntries(){
 const q=searchTerm.trim().toLocaleLowerCase('es');
 return prompts.filter(item=>(category==='Todas'||item.category===category)
  &&(!q||[item.title,item.summary,item.category,item.body].join(' ').toLocaleLowerCase('es').includes(q)));
}
function render(){
 if(!list)return;
 list.replaceChildren();
 const entries=visibleEntries();
 count.textContent=entries.length+' '+(entries.length===1?'prompt disponible':'prompts disponibles');
 empty.hidden=entries.length>0;
 for(const item of entries){
  const card=el('article','prompt-card');
  const top=el('div','prompt-card-top');
  top.append(el('span','prompt-card-category',item.category),el('span','prompt-card-num',String(item.position).padStart(2,'0')));
  card.append(top,el('h2','',item.title),el('p','prompt-card-summary',item.summary));
  const details=el('details','prompt-card-details');
  const summary=el('summary','', 'Leer el prompt');
  const body=el('pre','prompt-card-body',item.body);
  details.append(summary,body);
  card.append(details);
  const actions=el('div','prompt-card-actions');
  const copy=el('button','prompt-copy','Copiar prompt');
  copy.type='button';copy.setAttribute('aria-label','Copiar '+item.title);
  const live=el('span','prompt-copy-feedback');
  live.setAttribute('role','status');live.setAttribute('aria-live','polite');
  copy.addEventListener('click',async()=>{
   try{
    await navigator.clipboard.writeText(item.body);
    live.textContent='Copiado ✓';copy.textContent='Copiado ✓';
    window.setTimeout(()=>{live.textContent='';copy.textContent='Copiar prompt';},2500);
   }catch{
    details.open=true;
    const selection=window.getSelection();
    const range=document.createRange();range.selectNodeContents(body);
    selection?.removeAllRanges();selection?.addRange(range);
    live.textContent='Selecciona Copiar en el texto resaltado.';
   }
  });
  actions.append(copy,live);card.append(actions);
  list.append(card);
 }
}
function renderCategories(){
 if(!filters)return;
 const categories=['Todas',...new Set(prompts.map(x=>x.category))];
 filters.replaceChildren();
 categories.forEach(name=>{
  const button=el('button','prompt-filter',name);
  button.type='button';
  button.setAttribute('aria-pressed',String(name===category));
  button.addEventListener('click',()=>{category=name;renderCategories();render();});
  filters.append(button);
 });
}
search?.addEventListener('input',e=>{searchTerm=e.target.value;render();});
export async function mountPromptLibrary(db,courseId,adminPreview=false){
 if(!list)return;
 feedback.textContent='Cargando tu biblioteca privada…';
 list.replaceChildren();empty.hidden=true;
 try{
  let query=db.from('podcast_class_prompts')
   .select('prompt_code,position,category,title,summary,body,status')
   .eq('course_id',courseId).order('position',{ascending:true});
  if(!adminPreview)query=query.eq('status','ready');
  const {data,error}=await query;
  if(error)throw error;
  prompts=(data||[]).filter(x=>adminPreview||x.status==='ready');
  category='Todas';searchTerm='';if(search)search.value='';
  feedback.textContent=adminPreview?'Vista administradora: incluye borradores.':'Disponible solo para tu cuenta de estudiante.';
  renderCategories();render();
 }catch(err){
  prompts=[];renderCategories();render();
  feedback.textContent='No se pudo cargar la biblioteca. Vuelve a entrar o pide ayuda desde tu aula.';
 }
}

import {englishTitle,localizedPrompt} from './prompt-english.js?v=20261103-bonus-library-v1';
import {promptGuide} from './prompt-guide.js?v=20261103-bonus-library-v1';

/* The existing resource RLS is the sole source of student bonus visibility.
   Bonus prompts are queried separately and never reveal an unassigned resource.
   Studio activation, individual grant, course completion and project apply. */
const word=(es,en,lang)=>lang==='en'?en:es;
const create=(tag,cls,text)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=text;
 return node;
};
function languageContent(item,lang){
 return item.body?localizedPrompt(item.prompt_code,item.body,lang).trim():'';
}
function splitInstructions(content,lang){
 const marker=lang==='en'?'PROMPT TO COPY':'PROMPT PARA COPIAR';
 const found=content.match(new RegExp('(?:^|\\n)'+marker+'\\s*\\n','i'));
 if(!found)return {guide:content,instructions:content};
 const at=found.index+found[0].length;
 return {guide:content.slice(0,found.index).trim(),instructions:content.slice(at).trim()};
}
function titleFor(item,lang){
 if(item.resource_code==='bonus_motion_studio')return word('Biblioteca de efectos web','Website effects library',lang);
 if(lang!=='en')return item.title;
 const known=englishTitle(item.prompt_code,item.title);
 if(known!==item.title)return known;
 const english=languageContent(item,'en');
 const heading=english.split('\\n').find(s=>s.trim());
 return heading?.replace(/^BONUS\\s*[—–:-]\\s*/i,'').trim()||item.title;
}
async function copyText(value){
 try{
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return true;}
 }catch{}
 const input=create('textarea');
 input.value=value;
 input.setAttribute('readonly','');
 input.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
 document.body.append(input);
 input.select();input.setSelectionRange(0,input.value.length);
 let copied=false;
 try{copied=document.execCommand('copy');}catch{}
 input.remove();
 return copied;
}
export async function mountBonusLibrary(root,{db,courseId,getLanguage=()=> 'es'}){
 if(!root)return null;
 let rows=[],failed=false;
 let lang=getLanguage()==='en'?'en':'es';
 const render=()=>{
  if(!root.isConnected)return;
  lang=getLanguage()==='en'?'en':'es';
  root.replaceChildren();
  const count=document.getElementById('bonus-library-count');
  if(count)count.textContent=failed||!rows.length?'':rows.length+' '+word(rows.length===1?'bono':'bonos',rows.length===1?'bonus':'bonuses',lang);
  if(failed){
   root.append(create('p','bonus-library-message',word('No pudimos cargar la biblioteca. Actualiza el aula para intentar de nuevo.','We could not load the bonus library. Refresh your classroom to try again.',lang)));
   return;
  }
  if(!rows.length){
   root.append(create('p','bonus-library-message',word('Todavía no tienes bonos desbloqueados.','You have no unlocked bonuses yet.',lang)));
   return;
  }
  rows.forEach((item,index)=>{
   const card=create('details','bonus-library-card');
   const heading=create('summary','bonus-library-card-head');
   const num=create('span','bonus-library-index',String(index+1).padStart(2,'0'));
   const headText=create('span','bonus-library-card-titles');
   const category=create('small','bonus-library-tag',word('RECURSO EXTRA','EXTRA RESOURCE',lang));
   const title=create('strong','bonus-library-card-title',titleFor(item,lang));
   const guide=item.body?promptGuide(item.prompt_code,lang):{
    purpose:word('Biblioteca extra de recursos y ejemplos para crear tu web.','An extra library of resources and examples to build your site.',lang),
    when:word('Cuando quieras explorar técnicas adicionales.','When you want to explore additional techniques.',lang),
    result:word('Ideas y ejemplos prácticos.','Practical ideas and examples.',lang)
   };
   const caption=create('span','bonus-library-card-summary',guide.purpose);
   headText.append(category,title,caption);
   const plus=create('span','bonus-library-plus','+');plus.setAttribute('aria-hidden','true');
   heading.append(num,headText,plus);
   card.append(heading);
   const panel=create('div','bonus-library-card-content');
   const details=create('div','bonus-library-guide');
   details.append(
    create('p',null,word('Cuándo usarlo: ','When to use it: ',lang)+guide.when),
    create('p',null,word('Qué obtendrás: ','What you will get: ',lang)+guide.result)
   );
   panel.append(details);
   const actions=create('div','bonus-library-actions');
   if(item.body){
    const translated=languageContent(item,lang);
    const parts=splitInstructions(translated,lang);
    if(parts.guide && parts.guide!==parts.instructions){
     panel.append(create('h3','bonus-library-subheading',word('Preparación y pasos','Preparation and steps',lang)));
     panel.append(create('p','bonus-library-prep',parts.guide));
    }
    panel.append(create('h3','bonus-library-subheading',word('Prompt listo para copiar','Ready-to-copy prompt',lang)));
    panel.append(create('p','bonus-library-prompt',parts.instructions));
    const button=create('button','bonus-library-copy',word('Copiar prompt','Copy prompt',lang));
    button.type='button';
    const state=create('span','bonus-library-copy-state');
    state.setAttribute('role','status');
    button.addEventListener('click',async()=>{
     const ok=await copyText(parts.instructions);
     state.textContent=ok?word('Copiado','Copied',lang):word('Selecciona el texto del prompt para copiarlo.','Select the prompt text to copy it.',lang);
    });
    actions.append(button,state);
   }else if(/^https:\/\//.test(item.url||'')){
    const link=create('a','bonus-library-copy',word('Abrir recurso','Open resource',lang));
    link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';
    actions.append(link);
   }
   if(item.resource_code==='bonus_hero_cinematic_scroll'){
    panel.append(create('p','bonus-library-example-note',word(
      'Referencia: la portada de la clase utiliza un vídeo MP4 en reproducción. El prompt de este bono es diferente: convierte fotogramas en una animación controlada por scroll.',
      'Reference: the class landing uses a looping MP4. This bonus prompt is different: it turns image frames into a scroll-controlled animation.',lang)));
    const example=create('a','bonus-library-example-link',word('Ver ejemplo de hero con vídeo','View video hero example',lang));
    example.href='https://podcast.thelaunchera.com/clases/primera-landing.html';
    example.target='_blank';example.rel='noopener noreferrer';
    actions.append(example);
   }
   panel.append(actions);
   card.append(panel);root.append(card);
  });
 };
 root.replaceChildren(create('p','bonus-library-message',word('Cargando bonos…','Loading bonuses…',lang)));
 try{
  const [{data:resources,error:resourceError},{data:prompts,error:promptError}]=await Promise.all([
   db.from('podcast_class_resources')
    .select('resource_code,title,url,status')
    .eq('course_id',courseId).eq('status','ready')
    .like('resource_code','bonus_%').order('resource_code',{ascending:true}),
   db.from('podcast_class_prompts')
    .select('prompt_code,body,summary,category,position,status')
    .eq('course_id',courseId).eq('status','ready')
    .like('prompt_code','bonus_%')
  ]);
  if(resourceError||promptError)throw resourceError||promptError;
  // Filter from the resource query first. Reading a bonus prompt by itself
  // is never sufficient to unlock it for the student's account.
  const visibleResources=(Array.isArray(resources)?resources:[])
   .filter(item=>item.resource_code?.startsWith('bonus_')&&item.status==='ready');
  const promptMap=new Map((Array.isArray(prompts)?prompts:[]).map(row=>[row.prompt_code,row]));
  rows=visibleResources.map(item=>({
   ...item,
   prompt_code:item.resource_code,
   body:promptMap.get(item.resource_code)?.body||'',
   summary:promptMap.get(item.resource_code)?.summary||''
  }));
 }catch(error){
  failed=true;
  console.warn('Optional classroom bonus library unavailable',error?.code||error?.name||'unknown');
 }
 render();
 return {setLanguage:render,refresh:()=>mountBonusLibrary(root,{db,courseId,getLanguage})};
}

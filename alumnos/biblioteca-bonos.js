import {englishTitle,localizedPrompt} from './prompt-english.js?v=20261103-bonus-library-v1';
import {promptGuide} from './prompt-guide.js?v=20261103-bonus-library-v1';

/* Published bonus prompts live in the existing protected classroom table.
   Extra bonuses can be added later as ready rows with prompt_code bonus_*.
   This shelf is separate from the personal, graduation-gated bonus rewards. */
const word=(es,en,lang)=>lang==='en'?en:es;
const create=(tag,cls,text)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=text;
 return node;
};
function languageContent(item,lang){
 return localizedPrompt(item.prompt_code,item.body,lang).trim();
}
function splitInstructions(content,lang){
 const marker=lang==='en'?'PROMPT TO COPY':'PROMPT PARA COPIAR';
 const found=content.match(new RegExp('(?:^|\\n)'+marker+'\\s*\\n','i'));
 if(!found)return {guide:content,instructions:content};
 const at=found.index+found[0].length;
 return {guide:content.slice(0,found.index).trim(),instructions:content.slice(at).trim()};
}
function titleFor(item,lang){
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
  if(count)count.textContent=failed?'':rows.length+' '+word(rows.length===1?'bono disponible':'bonos disponibles',rows.length===1?'available bonus':'available bonuses',lang);
  if(failed){
   root.append(create('p','bonus-library-message',word('No pudimos cargar la biblioteca. Actualiza el aula para intentar de nuevo.','We could not load the bonus library. Refresh your classroom to try again.',lang)));
   return;
  }
  if(!rows.length){
   root.append(create('p','bonus-library-message',word('Próximamente encontrarás más recursos aquí.','More resources will appear here soon.',lang)));
   return;
  }
  rows.forEach((item,index)=>{
   const card=create('details','bonus-library-card');
   const heading=create('summary','bonus-library-card-head');
   const num=create('span','bonus-library-index',String(index+1).padStart(2,'0'));
   const headText=create('span','bonus-library-card-titles');
   const category=create('small','bonus-library-tag',word('RECURSO EXTRA','EXTRA RESOURCE',lang));
   const title=create('strong','bonus-library-card-title',titleFor(item,lang));
   const guide=promptGuide(item.prompt_code,lang);
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
   const translated=languageContent(item,lang);
   const parts=splitInstructions(translated,lang);
   panel.append(details);
   if(parts.guide && parts.guide!==parts.instructions){
    panel.append(create('h3','bonus-library-subheading',word('Preparación y pasos','Preparation and steps',lang)));
    panel.append(create('p','bonus-library-prep',parts.guide));
   }
   panel.append(create('h3','bonus-library-subheading',word('Prompt listo para copiar','Ready-to-copy prompt',lang)));
   panel.append(create('p','bonus-library-prompt',parts.instructions));
   const actions=create('div','bonus-library-actions');
   const button=create('button','bonus-library-copy',word('Copiar prompt','Copy prompt',lang));
   button.type='button';
   const state=create('span','bonus-library-copy-state');
   state.setAttribute('role','status');
   button.addEventListener('click',async()=>{
    const ok=await copyText(parts.instructions);
    state.textContent=ok?word('Copiado','Copied',lang):word('Selecciona el texto del prompt para copiarlo.','Select the prompt text to copy it.',lang);
   });
   actions.append(button,state);panel.append(actions);
   card.append(panel);root.append(card);
  });
 };
 root.replaceChildren(create('p','bonus-library-message',word('Cargando recursos…','Loading resources…',lang)));
 try{
  const {data,error}=await db.from('podcast_class_prompts')
   .select('prompt_code,title,summary,category,position,body,status')
   .eq('course_id',courseId).eq('status','ready')
   .like('prompt_code','bonus_%').order('position',{ascending:true});
  if(error)throw error;
  rows=(Array.isArray(data)?data:[]).filter(row=>row.prompt_code?.startsWith('bonus_') && row.status==='ready');
 }catch(error){
  failed=true;
  console.warn('Optional classroom bonus library unavailable',error?.code||error?.name||'unknown');
 }
 render();
 return {setLanguage:render,refresh:()=>mountBonusLibrary(root,{db,courseId,getLanguage})};
}

/* Recuperación segura del panel de materiales del aula privada.
   No crea accesos públicos ni copia prompts al HTML. */
import {supabaseUrl,supabasePublishableKey,courseId} from '../clases/course-config.js';
import {mountMateriales} from './materiales-interactivos.js?v=20261102-library-es-en-v6';
let repairing=false,controller=null;
const $=id=>document.getElementById(id);
const lang=()=> $('aula-language')?.value==='en'?'en':'es';
function showError(message){
 const root=$('materiales-interactivos');
 if(root&&!root.querySelector('.mi-app'))root.textContent=message;
}
async function recover(){
 const root=$('materiales-interactivos'),course=$('class-content'),banner=$('admin-preview-banner');
 if(repairing||!root||!course||course.hidden||!banner||banner.hidden||root.querySelector('.mi-app'))return;
 if(root.textContent.trim()&&!/cargando|preparaci[oó]n|no se pudieron cargar/i.test(root.textContent))return;
 repairing=true;
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm');
  const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:false}});
  const {data:{user},error}=await db.auth.getUser();
  if(error||!user?.id)throw Error('owner session missing');
  const {data:owner,error:ownerError}=await db.from('podcast_studio_admins').select('role').eq('user_id',user.id).maybeSingle();
  if(ownerError||owner?.role!=='owner')throw Error('owner verification failed');
  root.dataset.mounted='';
  // El contenido sigue protegido por Supabase y sus reglas de acceso.
  controller=await mountMateriales(root,{
   db,user:null,courseId,adminPreview:false,getLanguage:lang,
   onGoLessons:()=>document.querySelector('[data-aula-view="lecciones"]')?.click(),
   onCloseMaterials:()=>document.querySelector('[data-aula-view="inicio"]')?.click()
  });
  if(controller && document.getElementById('aula-active-title')?.textContent?.match(/prompt/i))controller.go('prompts',{track:false});
  if(!root.querySelector('.mi-app'))throw Error('materials did not mount');
 }catch(e){
  console.warn('Classroom materials recovery failed',e?.message||'unknown');
  showError(lang()==='en'?'We could not load the material. Try Refresh.':'No pudimos mostrar los materiales. Toca Actualizar para reintentar.');
 }finally{repairing=false;}
}
function watch(){
 const root=$('materiales-interactivos');if(!root)return;
 const observer=new MutationObserver(()=>{
  if(controller && root.querySelector('.mi-app') && document.getElementById('aula-active-title')?.textContent?.match(/prompt/i)){
   const head=root.querySelector('.mi-header h2');
   if(head && !/prompt/i.test(head.textContent||''))controller.go('prompts',{track:false});
  }
 });
 observer.observe($('aula-active-title')||root,{childList:true,subtree:true});
 setTimeout(recover,2200);
 document.querySelectorAll('[data-aula-view="prompts"],[data-aula-view="materiales"]').forEach(el=>el.addEventListener('click',()=>setTimeout(recover,450)));
 $('aula-refresh')?.addEventListener('click',()=>setTimeout(recover,800));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();

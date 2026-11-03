/* Recuperación segura del panel de materiales del aula privada.
   No crea accesos públicos ni copia prompts al HTML. */
import {supabaseUrl,supabasePublishableKey,courseId} from '../clases/course-config.js';
import {mountMateriales} from './materiales-interactivos.js?v=20261103-print-v3';
let repairing=false,controller=null,studentGallery=null;
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
  const {createClient}=await import('./supabase-local.js?v=20261103-safari-restore-v1').catch(()=>import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm'));
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

async function showStudentResources(button){
 const root=$('materiales-interactivos'),banner=$('admin-preview-banner');
 button.disabled=true;button.textContent=lang()==='en'?'Opening student view…':'Abriendo vista del alumno…';
 try{
  const {createClient}=await import('./supabase-local.js?v=20261103-safari-restore-v1').catch(()=>import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm'));
  const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:false}});
  const {data:{user}}=await db.auth.getUser();
  const {data:owner}=user?.id?await db.from('podcast_studio_admins').select('role').eq('user_id',user.id).maybeSingle():{data:null};
  if(owner?.role!=='owner')throw Error('No authorized owner');
  root.replaceChildren();root.dataset.mounted='';
  controller=await mountMateriales(root,{db,user:null,courseId,adminPreview:false,getLanguage:lang,
   onGoLessons:()=>document.querySelector('[data-aula-view="lecciones"]')?.click(),
   onCloseMaterials:()=>document.querySelector('[data-aula-view="inicio"]')?.click()});
  if(!controller)throw Error('Student material view unavailable');
  controller.go('prompts',{track:false});
  const ownerPdfs=root.querySelector('.mi-owner-pdfs');
  if(ownerPdfs)ownerPdfs.style.display='none';
  const ownerBadge=root.querySelector('.mi-save');
  if(ownerBadge)ownerBadge.style.display='none';
  const {mountInspiracion}=await import('./inspiracion.js?v=20261103-safari-restore-v1');
  if($('inspiration-gallery'))studentGallery=await mountInspiracion($('inspiration-gallery'),{db,courseId,adminPreview:false,getLanguage:lang});
  banner.hidden=true;
  document.querySelector('.aula-side-link[data-aula-view="prompts"]')?.click();
  button.disabled=false;button.dataset.previewActive='true';button.textContent=lang()==='en'?'Exit student preview':'Salir de vista alumno';
  button.onclick=()=>window.location.reload();
  button.title=lang()==='en'?'Read-only preview of published student resources':'Vista de los recursos publicados para alumnos, sin modificar sus datos';
 }catch(e){
  console.warn('Student resources preview failed',e?.message||'unknown');
  button.disabled=false;button.textContent=lang()==='en'?'Try student view again':'Reintentar vista alumno';
 }
}
function offerStudentPreview(){
 const banner=$('admin-preview-banner'),course=$('class-content');
 if(!banner||banner.hidden||!course||course.hidden||$('aula-student-preview'))return;
 const button=document.createElement('button');
 button.id='aula-student-preview';button.type='button';
 button.textContent=lang()==='en'?'View as student':'Ver como alumno';
 button.title=lang()==='en'?'See published learning resources without editing student progress':'Ver recursos publicados sin modificar el progreso de los alumnos';
 button.style.cssText='display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 14px;border-radius:12px;border:1px solid #a5bfce;background:#f9fcfd;color:#21455f;font:700 13px/1.3 Arial,sans-serif;cursor:pointer';
 button.onclick=()=>void showStudentResources(button);
 const target=document.querySelector('.aula-main-actions')||document.querySelector('.aula-main-top');
 target?.append(button);
}

function syncPreviewLanguage(){
 if(controller?.setLanguage)controller.setLanguage();
 if(studentGallery?.setLanguage)studentGallery.setLanguage();
 const button=$('aula-student-preview');
 if(button)button.textContent=button.dataset.previewActive==='true'
  ?(lang()==='en'?'Exit student preview':'Salir de vista alumno')
  :(lang()==='en'?'View as student':'Ver como alumno');
}
function watch(){
 const root=$('materiales-interactivos');if(!root)return;
 const ownerBanner=$('admin-preview-banner');
 if(ownerBanner){new MutationObserver(offerStudentPreview).observe(ownerBanner,{attributes:true,attributeFilter:['hidden']});}
 setTimeout(offerStudentPreview,2500);
 const observer=new MutationObserver(()=>{
  if(controller && root.querySelector('.mi-app') && document.getElementById('aula-active-title')?.textContent?.match(/prompt/i)){
   const head=root.querySelector('.mi-header h2');
   if(head && !/prompt/i.test(head.textContent||''))controller.go('prompts',{track:false});
  }
 });
 observer.observe($('aula-active-title')||root,{childList:true,subtree:true});
 ['aula-language','aula-public-language'].forEach(id=>$(id)?.addEventListener('change',()=>setTimeout(syncPreviewLanguage,0)));
 setTimeout(recover,2200);
 document.querySelectorAll('[data-aula-view="prompts"],[data-aula-view="materiales"]').forEach(el=>el.addEventListener('click',()=>setTimeout(recover,450)));
 $('aula-refresh')?.addEventListener('click',()=>setTimeout(recover,800));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();

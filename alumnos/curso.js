import {supabaseUrl,supabasePublishableKey,courseId} from '../clases/course-config.js';
import {courseCopy,translateCourseMessage} from './aula-mensajes.js?v=20261103-safari-restore-v1';
import {mountMateriales} from './materiales-interactivos.js?v=20261107-live-casa-v1';
import {mountBonusLibrary} from './biblioteca-bonos.js?v=20261103-command-center-v3';
import {englishTitle,localizedPrompt} from './prompt-english.js?v=20261103-typography-library-v1';
import {renderAulaInicio} from './dashboard-inicio.js?v=20261109-core4-v2';
import {mountInspiracion} from './inspiracion.js?v=20261107-private-manager-v2';
import {getClassroomLanguage,bindClassroomLanguages,applyClassroomLanguage,translationForLesson as originalLessonTranslation} from './aula-i18n.js?v=20261103-ai-lessons-v2';
import {CORE_LESSON_CODES,coreLessonText,coreLessonLinks,localizeCoreClassroom} from './aula-video-plan.js?v=20261109-core4-v1';
function translationForLesson(item,lang=getClassroomLanguage()){return coreLessonText(item,lang)||originalLessonTranslation(item,lang);}
// A blocked CDN must not prevent the entire classroom module from starting.
let supabaseModule;
try{
 supabaseModule=await import('./supabase-local.js?v=20261103-safari-restore-v1');
}catch(localError){
 console.warn('Classroom local auth unavailable; attempting online recovery');
 try{
  supabaseModule=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm');
 }catch(primaryError){
  supabaseModule=await import('https://esm.sh/@supabase/supabase-js@2.118.0');
 }
}
const {createClient}=supabaseModule;
const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const message=$('room-message'),login=$('login-panel'),noAccess=$('no-access'),course=$('class-content');
const queryParams=new URL(location.href).searchParams;
const ADMIN_VIEW_REQUESTED=queryParams.get('vista')==='admin';
// A verified owner must explicitly open this private management mode; ownership alone
// never makes student preview reveal demo publication switches.
const MANAGE_DEMOS_REQUESTED=ADMIN_VIEW_REQUESTED && queryParams.get('gestionar_demos')==='1';
const STUDIO_EMBEDDED_OWNER=ADMIN_VIEW_REQUESTED && queryParams.get('origen')==='studio'
  && window.parent!==window;
let studioSessionReady=false;
let studioSessionLoading=false;
const REMEMBER_KEY='podcast_class_remember_24h_v1';
const TAB_KEY='podcast_class_tab_24h_v1';
const DAY_MS=24*60*60*1000;
let recoveryMode=new URLSearchParams(location.hash.slice(1)).get('type')==='recovery'||new URL(location.href).searchParams.get('type')==='recovery';
let authBusy=false;
function readStored(store,key){
 try {const obj=JSON.parse(store.getItem(key)||'null');return obj&&typeof obj.userId==='string'&&Number.isFinite(obj.expiresAt)?obj:null;}catch{return null;}
}
function rememberStudent(id,remember){
 const token={userId:id,expiresAt:Date.now()+DAY_MS};
 try{
  localStorage.removeItem(REMEMBER_KEY);sessionStorage.removeItem(TAB_KEY);
  (remember?localStorage:sessionStorage).setItem(remember?REMEMBER_KEY:TAB_KEY,JSON.stringify(token));
 }catch{return false;}
 return true;
}
function hasAulaSession(id){
 const entry=readStored(sessionStorage,TAB_KEY)||readStored(localStorage,REMEMBER_KEY);
 return entry?.userId===id && entry.expiresAt>Date.now();
}
function clearRememberedStudent(){
 try{localStorage.removeItem(REMEMBER_KEY);sessionStorage.removeItem(TAB_KEY);}catch{}
}
function currentStudentDeadline(){
 const entry=readStored(sessionStorage,TAB_KEY)||readStored(localStorage,REMEMBER_KEY);
 return entry?.userId===user?.id?entry.expiresAt:0;
}
function setAuthMode(mode){
 const forms={login:$('login-form'),register:$('register-form'),reset:$('reset-email-form'),newPassword:$('new-password-form')};
 if(!Object.hasOwn(forms,mode))return;
 for(const [name,form] of Object.entries(forms))form.hidden=name!==mode;
 const copy={
  login:['Qué gusto verte por aquí.','Entra con el correo de tu compra y tu contraseña.'],
  register:['Empieza por aquí.','Crea tu cuenta para tener tus lecciones en un solo lugar.'],
  reset:['Recupera tu acceso.','Te ayudamos a establecer una nueva contraseña.'],
  newPassword:['Crea una nueva contraseña.','Escríbela dos veces para guardarla de forma segura.']
 };
 $('aula-login-title').textContent=copy[mode][0];
 $('aula-auth-description').textContent=copy[mode][1];
 document.querySelectorAll('.aula-auth-mode').forEach(button=>{
  const on=button.dataset.authMode===mode;
  button.classList.toggle('is-active',on);button.setAttribute('aria-pressed',String(on));
 });
 $('login-panel').dataset.authMode=mode;
 applyClassroomLanguage();
}
document.querySelectorAll('[data-auth-mode]').forEach(button=>button.addEventListener('click',()=>{
 if(!recoveryMode)setAuthMode(button.dataset.authMode);
}));
$('forgot-password-trigger').addEventListener('click',()=>{setAuthMode('reset');$('reset-email').value=$('login-email').value;});
document.querySelectorAll('[data-password-toggle]').forEach(button=>button.addEventListener('click',()=>{
 const input=$(button.dataset.passwordToggle);if(!input)return;
 const visible=input.type==='password';input.type=visible?'text':'password';
 const en=getClassroomLanguage()==='en';
 button.textContent=visible?(en?'Hide':'Ocultar'):(en?'Show':'Mostrar');
 button.setAttribute('aria-label',visible?(en?'Hide password':'Ocultar contraseña'):(en?'Show password':'Mostrar contraseña'));
}));
async function submitAuth(form,fn){
 if(authBusy)return;
 const button=form.querySelector('button[type="submit"]');authBusy=true;button.disabled=true;
 try{await fn();}finally{button.disabled=false;authBusy=false;}
}
function authNotice(text){status(text);$('room-message').hidden=false;}

const out=$('logout');
let user=null,lessons=[],done=new Set(),selected=0,adminPreview=false,projectShared=false;
let materialsController=null,courseResources=[],modulePrompts=[];
// La vista previa se autoriza con una sesión autenticada y confirmada de
// Supabase Y con el rol de propietaria en la base de datos (RLS).
// No debe depender de una marca local del Studio que puede faltar al
// cambiar de navegador o dispositivo.
async function isAuthorizedOwner(who){
 if(!who?.id || !who?.email_confirmed_at)return false;
 const {data,error}=await db.from('podcast_studio_admins')
  .select('role').eq('user_id',who.id).maybeSingle();
 if(error)throw error;
 return data?.role==='owner';
}
function status(text,ok=false){message.dataset.sourceMessage=String(text??'');message.textContent=translateCourseMessage(text,getClassroomLanguage());message.dataset.ok=ok?'true':'false';}
function display(panel){
 [login,noAccess,course].forEach(el=>el.hidden=(el!==panel));
 document.body.classList.toggle('aula-member',panel===course);
 // Nunca mostrar el enlace al Studio antes de verificar el rol owner.
 const ownerNav=$('aula-owner-nav');
 if(ownerNav){
  const showOwnerShortcut=panel===course&&adminPreview;
  ownerNav.hidden=!showOwnerShortcut;
  // Solo el rol owner verificado crea un enlace navegable al Studio.
  if(showOwnerShortcut){
   ownerNav.setAttribute('href','../estudio/');
   ownerNav.setAttribute('target','_top');
  }else{
   ownerNav.removeAttribute('href');
   ownerNav.removeAttribute('target');
  }
 }
 if(panel!==course)closeAulaMenu();
}
const aulaTitle=$('aula-active-title');
const aulaOpen=$('aula-menu-open');
const aulaClose=$('aula-rail-close');
const aulaBack=$('aula-rail-backdrop');
const aulaSidebar=$('aula-rail');
const aulaViews={
 inicio:'Mi inicio', lecciones:'Mis lecciones', prompts:'Biblioteca de prompts', materiales:'Mis materiales', mara:'Mara · tu guía web',
 bonos:'Biblioteca de bonos', comunidad:'Club de Ideas', inspiracion:'Inspiración · Demos'
};
const aulaViewsEn={inicio:'My home',lecciones:'My lessons',prompts:'Prompt library',materiales:'My materials',bonos:'Bonus library',comunidad:'Ideas Club',inspiracion:'Inspiration · Demos',mara:'Mara · your web guide'};
let inspirationController=null;
let inspirationLoading=null;
function showInspirationRetry(root){
 const english=getClassroomLanguage()==='en';
 const section=document.createElement('section');
 section.className='inspiration-recovery';section.setAttribute('role','alert');
 const title=document.createElement('h2');
 title.textContent=english?'Could not display projects.':'No pudimos mostrar los demos.';
 const message=document.createElement('p');
 message.textContent=english?'Your saved projects are safe. Try again.':'Tus proyectos están guardados. Intenta cargar la galería nuevamente.';
 const button=document.createElement('button');
 button.type='button';button.className='inspiration-retry';
 button.textContent=english?'Retry gallery':'Reintentar galería';
 button.addEventListener('click',()=>void ensureInspiracion(true));
 section.append(title,message,button);
 root.replaceChildren(section);
}
function ensureInspiracion(force=false){
 const root=$('inspiration-gallery');
 if(!root||!user||course.hidden)return Promise.resolve();
 if(inspirationLoading)return inspirationLoading;
 if(!force&&inspirationController&&root.querySelector('.inspiration-heading'))return Promise.resolve();
 const loading=document.createElement('p');
 loading.className='inspiration-loading';loading.setAttribute('role','status');
 loading.textContent=getClassroomLanguage()==='en'?'Loading finished demos…':'Cargando demos terminados…';
 root.replaceChildren(loading);
 const call=mountInspiracion(root,{db,courseId,canManageDemos:adminPreview&&MANAGE_DEMOS_REQUESTED,getLanguage:getClassroomLanguage})
  .then(controller=>{
   if(!root.querySelector('.inspiration-heading')){
    inspirationController=null;
    showInspirationRetry(root);
   }else{
    inspirationController=controller||null;
   }
  }).catch(error=>{
   console.warn('Inspiration gallery failed',error?.code||error?.name||'unknown');
   inspirationController=null;
   showInspirationRetry(root);
  }).finally(()=>{inspirationLoading=null;});
 inspirationLoading=call;
 return call;
}
let bonusLibraryController=null,bonusLibraryLoading=null;
function ensureBonusLibrary(){
 if(bonusLibraryController||bonusLibraryLoading||!user||course.hidden)return;
 const root=$('bonus-library-items');if(!root)return;
 bonusLibraryLoading=mountBonusLibrary(root,{db,courseId,getLanguage:getClassroomLanguage})
  .then(controller=>{bonusLibraryController=controller||null;})
  .catch(error=>{
   console.warn('Optional bonus library unavailable',error?.name||'unknown');
   root.textContent=courseCopy('No pudimos abrir la biblioteca. Actualiza el aula.','We could not open the library. Refresh the classroom.',getClassroomLanguage());
  }).finally(()=>{bonusLibraryLoading=null;});
}
let maraController=null,maraLoading=null;
async function ensureMara(){
 if(maraController||maraLoading||!user||course.hidden)return;
 const root=$('mara-guide');if(!root)return;
 root.textContent=getClassroomLanguage()==='en'?'Preparing your private guide…':'Preparando tu guía privada…';
 maraLoading=import('./mara-guide.js?v=20261103-mara-full-app-v3')
  .then(mod=>mod.mountMara(root,{db,courseId,getLanguage:getClassroomLanguage}))
  .then(controller=>{maraController=controller||null;})
  .catch(error=>{
    console.warn('Optional Mara guide unavailable',error?.name||'unknown');
    root.textContent=getClassroomLanguage()==='en'
      ?'The guide could not load. Refresh the classroom to try again.'
      :'No pudimos cargar Mara. Actualiza el aula para reintentar.';
  })
  .finally(()=>{maraLoading=null;});
 await maraLoading;
}
let currentAulaView='lecciones';
const aulaViewHistory=[];
const AULA_PLACE_TTL_MS=2*60*60*1000;
const aulaScrollPosition={};
let aulaBrowserSteps=0,aulaRestoring=false;
const aulaPlaceKey=()=>user?.id?'tle:aula-last-place:v1:'+user.id:'';
function readAulaPlace(){
 const key=aulaPlaceKey();if(!key)return null;
 try{
  const value=JSON.parse(localStorage.getItem(key)||'null');
  if(!value||!Number.isFinite(value.at)||value.at>Date.now()||
     Date.now()-value.at>=AULA_PLACE_TTL_MS||!Object.hasOwn(aulaViews,value.view)){
   localStorage.removeItem(key);return null;
  }
  return {
    view:value.view,
    lesson:Number.isInteger(value.lesson)?value.lesson:0,
    history:Array.isArray(value.history)?value.history.filter(entry=>
      typeof entry==='string'&&(Object.hasOwn(aulaViews,entry)||
        /^lesson:\d{1,2}$/.test(entry))).slice(-12):[],
    scroll:value.scroll&&typeof value.scroll==='object'?value.scroll:{}
  };
 }catch{return null;}
}
function rememberAulaPlace(){
 const key=aulaPlaceKey();if(!key||course.hidden||aulaRestoring)return;
 aulaScrollPosition[currentAulaView]=window.scrollY;
 try{localStorage.setItem(key,JSON.stringify({
   at:Date.now(),view:currentAulaView,history:aulaViewHistory.slice(-12),
   lesson:selected,scroll:aulaScrollPosition
 }));}catch{}
}
function clearAulaPlace(){
 const key=aulaPlaceKey();if(key)try{localStorage.removeItem(key)}catch{}
}
function changeAulaBrowser(view,lesson=selected){
 const state={...window.history.state,tleAulaView:view,tleAulaLesson:lesson};
 window.history.pushState(state,'',window.location.href);aulaBrowserSteps++;
}
function backAulaPlace(){
 if(document.body.classList.contains('aula-menu-open')){closeAulaMenu();return;}
 if(!aulaViewHistory.length)return;
 if(aulaBrowserSteps>0){window.history.back();return;}
 const previous=aulaViewHistory.pop();
 if(previous?.startsWith('lesson:'))choose(Number(previous.slice(7)),{track:false});
 else if(previous)setAulaView(previous,{track:false});
 rememberAulaPlace();
}
window.addEventListener('popstate',event=>{
 if(course.hidden||!user)return;
 const target=event.state?.tleAulaView;
 if(!Object.hasOwn(aulaViews,target))return;
 const old=currentAulaView;
 const lesson=Number.isInteger(event.state?.tleAulaLesson)?event.state.tleAulaLesson:selected;
 if(old!==target&&aulaViewHistory.at(-1)===target)aulaViewHistory.pop();
 else if(old===target&&aulaViewHistory.at(-1)==='lesson:'+lesson)aulaViewHistory.pop();
 aulaBrowserSteps=Math.max(0,aulaBrowserSteps-1);
 if(target==='lecciones'&&lessons[lesson])choose(lesson,{track:false});
 else setAulaView(target,{track:false,scroll:false,browser:false});
 window.requestAnimationFrame(()=>window.scrollTo(0,aulaScrollPosition[target]||0));
 rememberAulaPlace();
});
window.addEventListener('pagehide',rememberAulaPlace);
document.addEventListener('visibilitychange',()=>{if(document.hidden)rememberAulaPlace();});
let aulaBackButton=null,aulaCloseButton=null;
function ensureAulaNavigation(){
 const header=document.querySelector('#aula-layout .aula-main-top');
 if(!header || aulaBackButton)return;
 const actions=document.createElement('div');
 actions.className='aula-section-navigation';
 aulaBackButton=document.createElement('button');
 aulaBackButton.id='aula-section-back';
 aulaBackButton.type='button';
 aulaBackButton.className='aula-section-nav-button';
 aulaBackButton.setAttribute('aria-label','Volver a la sección anterior');
 aulaBackButton.title='Atrás';
 aulaBackButton.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg><span>Atrás</span>';
 aulaCloseButton=document.createElement('button');
 aulaCloseButton.id='aula-section-close';
 aulaCloseButton.type='button';
 aulaCloseButton.className='aula-section-nav-button aula-section-nav-close';
 aulaCloseButton.setAttribute('aria-label','Cerrar esta sección y volver al inicio del aula');
 aulaCloseButton.title='Cerrar sección';
 aulaCloseButton.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg><span>Cerrar</span>';
 aulaBackButton.addEventListener('click',backAulaPlace);
 aulaCloseButton.addEventListener('click',()=>{
  aulaViewHistory.length=0;aulaBrowserSteps=0;
  closeAulaMenu();
  setAulaView('inicio',{track:false});
  window.history.replaceState({...window.history.state,tleAulaView:'inicio'},'',window.location.href);
  rememberAulaPlace();
 });
 actions.append(aulaBackButton,aulaCloseButton);
 header.querySelector('.aula-main-location')?.insertAdjacentElement('afterend',actions);
 updateAulaNavigation();
}
function updateAulaNavigation(){
 if(!aulaBackButton||!aulaCloseButton)return;
 const isHome=currentAulaView==='inicio';
 aulaBackButton.hidden=!aulaViewHistory.length;
 aulaCloseButton.hidden=isHome;
}
function closeAulaMenu(){
 document.body.classList.remove('aula-menu-open');
 aulaBack.hidden=true;
 aulaOpen.setAttribute('aria-expanded','false');
}
function openAulaMenu(){
 document.body.classList.add('aula-menu-open');
 aulaBack.hidden=false;
 aulaOpen.setAttribute('aria-expanded','true');
 const active=aulaSidebar.querySelector('.aula-side-link[aria-current="page"]');
 (active||aulaClose).focus({preventScroll:true});
}
function setAulaView(view,{scroll=true,track=true,browser=true}={}){
 // El catálogo comercial pertenece al Centro de Productos, nunca al aula.
 if(view==='catalogo')view='lecciones';
 if(!Object.prototype.hasOwnProperty.call(aulaViews,view))return;
 if(view!==currentAulaView&&!course.hidden){
  aulaScrollPosition[currentAulaView]=window.scrollY;
  if(track&&!aulaRestoring){
   aulaViewHistory.push(currentAulaView);
   if(aulaViewHistory.length>12)aulaViewHistory.shift();
   if(browser)changeAulaBrowser(view);
  }
 }
 currentAulaView=view;
 document.querySelectorAll('[data-aula-panel]').forEach(section=>{
  section.hidden=section.getAttribute('data-aula-panel')!==(view==='prompts'?'materiales':view);
 });
 if(view==='prompts')materialsController?.go('prompts',{track:false});
 if(view==='materiales')materialsController?.go('inicio',{track:false});
 if(view==='mara')void ensureMara();
 if(view==='bonos')void ensureBonusLibrary();
 if(view==='inspiracion')void ensureInspiracion();
 document.querySelectorAll('.aula-side-link[data-aula-view]').forEach(control=>{
  const selected=control.dataset.aulaView===view;
  control.setAttribute('aria-current',selected?'page':'false');
 });
 aulaTitle.textContent=(getClassroomLanguage()==='en'?aulaViewsEn:aulaViews)[view];
 updateAulaNavigation();
 closeAulaMenu();
 if(scroll&&document.body.classList.contains('aula-member')){
  window.requestAnimationFrame(()=>window.scrollTo({top:aulaScrollPosition[view]||0,behavior:'auto'}));
 }
 rememberAulaPlace();
}
document.querySelectorAll('[data-aula-view]').forEach(control=>{
 control.addEventListener('click',event=>{
  event.preventDefault();
  setAulaView(control.dataset.aulaView);
 });
});
aulaOpen.addEventListener('click',()=>document.body.classList.contains('aula-menu-open')?closeAulaMenu():openAulaMenu());
aulaClose.addEventListener('click',()=>{closeAulaMenu();aulaOpen.focus({preventScroll:true});});
aulaBack.addEventListener('click',()=>{closeAulaMenu();aulaOpen.focus({preventScroll:true});});
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 if(document.body.classList.contains('aula-menu-open')){
  closeAulaMenu();aulaOpen.focus({preventScroll:true});return;
 }
 if(!course.hidden&&aulaViewHistory.length)backAulaPlace();
});


function refreshClassroomLanguage(){
 const lang=getClassroomLanguage();
 if(!course.hidden){
  for(const [i,item] of lessons.entries()){
   const label=$('lesson-buttons')?.querySelector('button[data-index="'+i+'"] .index-title');
   if(label)label.textContent=translationForLesson(item).title;
   const option=$('lesson-picker')?.querySelector('option[value="'+i+'"]');
   if(option)option.textContent=courseCopy('Lección ','Lesson ',lang)+(i+1)+' · '+translationForLesson(item).title;
  }
  if(lessons[selected]){
   $('lesson-title').textContent=translationForLesson(lessons[selected]).title;
   $('lesson-description').textContent=translationForLesson(lessons[selected]).description;
   renderLessonLinks(lessons[selected]);
   renderLessonPrompts(lessons[selected]);
  }
  aulaTitle.textContent=(lang==='en'?aulaViewsEn:aulaViews)[currentAulaView];
  updateDashboard();
  if(!adminPreview)bonusState();
  if(message?.dataset.sourceMessage)message.textContent=translateCourseMessage(message.dataset.sourceMessage,lang);
  if(courseHelpStatus?.dataset.sourceMessage)courseHelpStatus.textContent=translateCourseMessage(courseHelpStatus.dataset.sourceMessage,lang);
  if(lessons.length){setProgressLabels();renderCourseMap();}
  inspirationController?.setLanguage?.();
  maraController?.setLanguage?.();
  materialsController?.setLanguage?.();
  bonusLibraryController?.setLanguage?.();
 }
 applyClassroomLanguage();
 localizeCoreClassroom(lang);
}
bindClassroomLanguages(refreshClassroomLanguage);
function validVideoId(id){return typeof id==='string' && /^[A-Za-z0-9_-]{11}$/.test(id);}
function escapedText(parent,tag,value,klass){const node=document.createElement(tag);node.textContent=value;if(klass)node.className=klass;parent.appendChild(node);return node;}
function progressStats(){
 const total=lessons.length,completed=lessons.filter(l=>done.has(l.lesson_code)).length;
 return {total,completed,percent:total?Math.round(100*completed/total):0};
}
// Solo la clase completa y aprobada puede generar acceso al reto del bono.
const REQUIRED_LESSON_COUNT=CORE_LESSON_CODES.length;
async function refreshPersonalBonuses(){
 if(adminPreview||!user)return;
 const box=$('assigned-bonuses'),list=$('assigned-bonus-list');
 try{
  const {data,error}=await db.from('podcast_class_resources')
   .select('resource_code,title,url,status')
   .eq('course_id',courseId).like('resource_code','bonus_%').eq('status','ready');
  if(error)throw error;
  list.replaceChildren();
  (data||[]).filter(item=>item.resource_code.startsWith('bonus_')&&/^https:\/\//.test(item.url||'')).forEach(item=>{
    const link=document.createElement('a');
    link.className='resource';link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';
    escapedText(link,'span',courseCopy('BONO PERSONAL','PERSONAL BONUS',getClassroomLanguage()),'resource-tag');
    escapedText(link,'strong',item.resource_code==='bonus_hero_cinematic_scroll'
      ? courseCopy('Hero cinematográfico','Cinematic hero',getClassroomLanguage())
      : item.resource_code==='bonus_motion_studio'
        ? courseCopy('Biblioteca de efectos web','Website effects library',getClassroomLanguage())
        : item.title);
    escapedText(link,'span',courseCopy('Abrir bono','Open bonus',getClassroomLanguage()),'resource-link');
    list.appendChild(link);
  });
  box.hidden=list.children.length===0;
 }catch{
  list.replaceChildren();box.hidden=true;
  status('No pudimos actualizar tus bonos. Vuelve a entrar o solicita ayuda.');
 }
}

function bonusState(){
 const {total,completed}=progressStats();
 const allDone=total===REQUIRED_LESSON_COUNT
  &&completed===REQUIRED_LESSON_COUNT
  &&lessons.every(l=>done.has(l.lesson_code)&&l.status==='ready'&&validVideoId(l.youtube_video_id));
 const l=$('bonus-lessons'),p=$('bonus-project');
 l.classList.toggle('is-done',allDone);
 p.classList.toggle('is-done',projectShared);
 l.querySelector('span').textContent=allDone?'✓':'○';
 p.querySelector('span').textContent=projectShared?'✓':'○';
 const eligible=allDone&&projectShared&&!adminPreview;
 const status=$('bonus-status');
 $('bonus-unlocked').hidden=!eligible;
 if(eligible)void refreshPersonalBonuses();
 else {
  $('assigned-bonus-list').replaceChildren();
  $('assigned-bonuses').hidden=true;
 }
 if(eligible){
  status.hidden=true;
  status.textContent='';
  status.dataset.state='earned';
 }else if(allDone){
  status.hidden=false;
  status.textContent=courseCopy('Solo falta compartir tu web.','Just share your website to finish.',getClassroomLanguage());
  status.dataset.state='progress';
 }else if(projectShared){
  status.hidden=false;
  status.textContent=courseCopy('¡Tu web está compartida! Sigue con las lecciones.','Your website is shared! Keep going with the lessons.',getClassroomLanguage());
  status.dataset.state='progress';
 }else{
  status.hidden=true;
  status.textContent='';
  status.dataset.state='pending';
 }
}
function updateDashboard(){
 renderAulaInicio({lessons,done,resources:courseResources,adminPreview,projectShared,
  language:getClassroomLanguage(),localizeLesson:item=>translationForLesson(item),onLesson:i=>choose(i),onView:setAulaView});
 applyClassroomLanguage();
 localizeCoreClassroom(getClassroomLanguage());
}
function setProgressLabels(){
 const {total,completed}=progressStats();
 $('progress-label').textContent=courseCopy(completed+' de '+total+' lecciones completadas',completed+' of '+total+' lessons completed',getClassroomLanguage());
}
function setProgress(){
 const {total,completed,percent}=progressStats();
 setProgressLabels();
 $('progress-percent').textContent=percent+'%';
 $('progress-bar').style.width=percent+'%';
 $('student-progress').setAttribute('aria-valuenow',String(percent));
 if(!adminPreview)bonusState();
 updateDashboard();
}
function congratulate(item){
 const {total,completed}=progressStats();
 $('lesson-celebration-title').textContent=courseCopy('¡Bien hecho! Terminaste una lección.','Well done! You finished a lesson.',getClassroomLanguage());
 $('lesson-celebration-description').textContent=total&&completed===total
  ? courseCopy('¡Completaste todas las lecciones! Ahora comparte tu primera web en el Club de Ideas para cumplir el reto del bono.','You finished every lesson! Share your first website in Ideas Club to complete the bonus challenge.',getClassroomLanguage())
  : courseCopy('Terminaste «'+item.title+'». Ya llevas '+completed+' de '+total+'. ¡Sigue así!','You finished “'+translationForLesson(item).title+'”. You have completed '+completed+' of '+total+' lessons. Keep going!',getClassroomLanguage());
 $('lesson-celebration').hidden=false;
}
async function loadMemberName(who,asAdmin){
 let name=String(who?.user_metadata?.full_name||who?.user_metadata?.name||'').trim();
 if(!asAdmin){
  const {data,error}=await db.from('podcast_club_profiles').select('display_name').eq('user_id',who.id).maybeSingle();
  if(!error&&data?.display_name)name=data.display_name;
 }
 if(!name){name=String(who?.email||'').split('@')[0].replace(/[._0-9-]+/g,' ').trim();}
 name=name.split(/\s+/).slice(0,2).join(' ').slice(0,40);
 $('student-name').textContent=name||'qué gusto verte';
}
async function checkProjectShared(){
 if(adminPreview||!user){projectShared=false;bonusState();updateDashboard();return;}
 try{
  const {data,error}=await db.from('podcast_club_posts')
   .select('id,scope,course_id,channel,image_path,project_url')
   .eq('author_id',user.id).eq('status','visible').eq('channel','proyectos').limit(40);
  if(error)throw error;
  projectShared=(data||[]).some(post=>
    (post.scope==='club'||(post.scope==='curso'&&post.course_id===courseId))
    &&Boolean(post.image_path||post.project_url)
  );
 }catch{projectShared=false;}
 bonusState();updateDashboard();
}
const CAPTIONS_PREFERENCE='podcast_class_caption_preference_v1';
const captionPicker=$('course-caption-language');
function captionPreference(){
 const selected=captionPicker?.value;
 return ['es','en','auto'].includes(selected)?selected:'es';
}
function displayVideo(item){
 const box=$('lesson-player');box.replaceChildren();box.hidden=!validVideoId(item.youtube_video_id);
 const captions=$('course-captions');if(captions)captions.hidden=box.hidden;
 if(box.hidden)return;
 const url=new URL('https://www.youtube-nocookie.com/embed/'+encodeURIComponent(item.youtube_video_id));
 url.searchParams.set('rel','0');
 const preferred=captionPreference();
 // This is a caption language preference only. YouTube must actually have the approved
 // ES/EN tracks for the video's settings to honor the requested language.
 if(preferred!=='auto'){
  url.searchParams.set('cc_load_policy','1');
  url.searchParams.set('cc_lang_pref',preferred);
 }
 const frame=document.createElement('iframe');
 frame.src=url.toString();
 frame.title='Video '+item.lesson_code+' · '+item.title;
 frame.loading='lazy';frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
 frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;
 box.appendChild(frame);
}
if(captionPicker){
 let value='es';
 try{value=localStorage.getItem(CAPTIONS_PREFERENCE)||'es';}catch{}
 if(['es','en','auto'].includes(value))captionPicker.value=value;
 captionPicker.addEventListener('change',()=>{
  try{localStorage.setItem(CAPTIONS_PREFERENCE,captionPreference());}catch{}
  const item=lessons[selected];
  if(item)displayVideo(item);
 });
}

function renderLessonLinks(item){
 const root=$('lesson-links');if(!root)return;
 root.replaceChildren();
 const language=getClassroomLanguage();
 const heading=document.createElement('strong');
 heading.className='lesson-links-title';
 heading.textContent=language==='en'?'Links for this video':'Enlaces para este video';
 const row=document.createElement('div');row.className='lesson-links-row';
 coreLessonLinks(item,language).forEach(link=>{
  const a=document.createElement('a');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=link.label;
  row.appendChild(a);
 });
 root.append(heading,row);
 root.hidden=!row.children.length;
}
/* Prompts iniciales de cada módulo: contenido del alumno, nunca notas privadas del Studio. */
function renderLessonPrompts(item){
 const panel=$('lesson-prompts-panel'),list=$('lesson-prompts-list');
 if(!panel||!list)return;
 list.replaceChildren();panel.open=false;
 const entries=modulePrompts.filter(prompt=>prompt.prompt_code.startsWith('m'+item.lesson_code+'_'));
 panel.hidden=!entries.length;
 entries.forEach((prompt,index)=>{
  const card=document.createElement('details');card.className='lesson-prompt-card';card.open=index===0;
  const summary=document.createElement('summary');
  escapedText(summary,'span',String(index+1).padStart(2,'0'),'lesson-prompt-index');
  const heading=document.createElement('span');heading.className='lesson-prompt-heading';
  const isEnglish=getClassroomLanguage()==='en';
  const textPrompt=localizedPrompt(prompt.prompt_code,prompt.body,getClassroomLanguage());
  escapedText(heading,'strong',isEnglish?englishTitle(prompt.prompt_code,prompt.title):prompt.title);
  escapedText(heading,'small',isEnglish?'Copy the prompt and personalize it with your business information.':prompt.summary||'Copia este prompt y adáptalo a tu negocio.');
  summary.append(heading);
  const body=document.createElement('div');body.className='lesson-prompt-body';
  escapedText(body,'p',textPrompt,'lesson-prompt-text');
  const copy=document.createElement('button');copy.type='button';copy.className='lesson-prompt-copy';copy.textContent=getClassroomLanguage()==='en'?'Copy prompt':'Copiar prompt';
  const state=document.createElement('span');state.className='lesson-prompt-copy-state';state.setAttribute('role','status');
  copy.addEventListener('click',async()=>{
   let copied=false;
   try{await navigator.clipboard.writeText(textPrompt);copied=true;}catch{}
   if(!copied){
    const temp=document.createElement('textarea');temp.value=textPrompt;temp.style.cssText='position:fixed;left:-9999px';
    document.body.append(temp);temp.select();
    try{copied=document.execCommand('copy');}catch{}
    temp.remove();
   }
   state.textContent=isEnglish
     ?copied?'Copied! Replace bracketed placeholders before submitting.':'Long-press to copy the prompt manually.'
     :copied?'¡Copiado! Cambia los datos entre corchetes antes de enviarlo.':'Mantén pulsado el prompt para copiarlo manualmente.';
  });
  body.append(copy,state);card.append(summary,body);list.append(card);
 });
}

function choose(i,{track=true}={}){
 if(!Number.isInteger(i)||i<0||i>=lessons.length)return;
 if(track&&!aulaRestoring&&currentAulaView==='lecciones'&&!course.hidden&&i!==selected){
  aulaViewHistory.push('lesson:'+selected);
  if(aulaViewHistory.length>12)aulaViewHistory.shift();
  changeAulaBrowser('lecciones',i);
 }
 selected=i;
 const item=lessons[i];
 if(!item)return;
 if($('lesson-picker'))$('lesson-picker').value=String(i);
 setAulaView('lecciones',{track});
 displayVideo(item);
 $('lesson-unavailable').hidden=!box.hidden;
 if(box.hidden)$('lesson-unavailable').textContent=getClassroomLanguage()==='en'
  ?'Video coming soon. You can already open the links you need below.'
  :'Video en preparación. Debajo están los enlaces que necesitarás.';
 $('lesson-number').textContent='VIDEO '+String(i+1).padStart(2,'0');
 const localized=translationForLesson(item);
 $('lesson-title').textContent=localized.title;
 $('lesson-description').textContent=localized.description;
 renderLessonLinks(item);
 renderLessonPrompts(item);
 $('lesson-done').checked=done.has(item.lesson_code);
 $('lesson-done').closest('label').hidden=adminPreview||item.status!=='ready'||!validVideoId(item.youtube_video_id);
 $('lesson-info').hidden=false;
 $('lesson-prev').disabled=i<=0;
 $('lesson-next').disabled=i>=lessons.length-1;
 document.querySelectorAll('.lesson-index button[data-index]').forEach(button=>{
  button.classList.toggle('current',Number(button.dataset.index)===i);
  button.setAttribute('aria-current',Number(button.dataset.index)===i?'step':'false');
 });
}
/* A four-phase overview helps beginners choose a lesson on a phone.
   This reads approved lesson metadata; it does not unlock videos or bonuses. */
function renderCourseMap(){
 const root=$('lesson-course-map');if(!root)return;
 root.replaceChildren();root.hidden=!lessons.length;
 if(!lessons.length)return;
 const lang=getClassroomLanguage();
 const phases=[
  {id:'define',code:'01',es:'01 · ChatGPT',en:'01 · ChatGPT',hintEs:'Tu idea y conexiones',hintEn:'Your idea and connections'},
  {id:'create',code:'05',es:'02 · Construye',en:'02 · Build',hintEs:'La IA crea tu web',hintEn:'AI builds your website'},
  {id:'build',code:'06',es:'03 · Mejora',en:'03 · Improve',hintEs:'Corrige textos, fotos y móvil',hintEn:'Fix copy, photos and mobile'},
  {id:'review',code:'08',es:'04 · Publica',en:'04 · Publish',hintEs:'Abre y prueba tu enlace',hintEn:'Open and test your link'}
 ];
 // Reuse four approved emoji-style brand elements from the existing universal library.
 // These assets are already shipped with Content Lab; no generated or duplicated artwork.
 const approvedStickerBase='/content-lab/resources/premium-stickers-2026-11/';
 const approvedSticker={
  define:'16_objetivo_rosa.png',
  create:'17_idea_lila.png',
  build:'18_creadora_laptop_lila.png',
  review:'15_checklist_rosa.png'
 };
 const heading=document.createElement('div');heading.className='lesson-map-intro';
 escapedText(heading,'strong',courseCopy('Tu ruta en 4 etapas','Your route in 4 stages',lang));
 escapedText(heading,'span',courseCopy('Toca una etapa para ir a su primera lección.','Tap a stage to open its first lesson.',lang));
 const grid=document.createElement('div');grid.className='lesson-map-grid';
 for(const phase of phases){
  const indexes=lessons.map((item,index)=>({item,index})).filter(({item})=>item.lesson_code===phase.code);
  if(!indexes.length)continue;
  const button=document.createElement('button');button.type='button';button.className='lesson-map-step';
  button.dataset.phase=phase.id;
  const completed=indexes.filter(({item})=>done.has(item.lesson_code)).length;
  const available=indexes.filter(({item})=>item.status==='ready'&&validVideoId(item.youtube_video_id)).length;
  const top=document.createElement('div');top.className='lesson-map-top';
  escapedText(top,'span',phase.es.slice(0,2),'lesson-map-index');
  const motif=document.createElement('span');motif.className='lesson-map-emblem';
  motif.setAttribute('aria-hidden','true');
  const sticker=document.createElement('img');
  sticker.src=approvedStickerBase+approvedSticker[phase.id];
  sticker.alt='';
  sticker.width=64;sticker.height=64;sticker.loading='lazy';sticker.decoding='async';
  motif.append(sticker);
  top.append(motif);
  const copy=document.createElement('div');copy.className='lesson-map-copy';
  escapedText(copy,'strong',lang==='en'?phase.en.slice(5):phase.es.slice(5),'lesson-map-title');
  escapedText(copy,'span',lang==='en'?phase.hintEn:phase.hintEs,'lesson-map-description');
  const foot=document.createElement('div');foot.className='lesson-map-foot';
  escapedText(foot,'span',completed+' / '+indexes.length+' '+courseCopy('videos','videos',lang),'lesson-map-progress-label');
  const track=document.createElement('div');track.className='lesson-map-progress';
  track.setAttribute('aria-hidden','true');
  const fill=document.createElement('span');fill.style.width=Math.round(100*completed/indexes.length)+'%';track.append(fill);
  const status=document.createElement('span');
  status.className='lesson-map-status';
  status.textContent=available===0?courseCopy('Videos en preparación','Videos in preparation',lang):
   courseCopy('Abrir primera lección','Open first lesson',lang);
  foot.append(track,status);
  button.append(top,copy,foot);
  button.setAttribute('aria-label',(lang==='en'?phase.en:phase.es)+'. '+completed+' '+courseCopy('de','of',lang)+' '+indexes.length+' '+courseCopy('videos completados.','videos complete.',lang)+' '+courseCopy('Abrir primera lección','Open first lesson',lang));
  button.addEventListener('click',()=>choose(indexes[0].index));
  grid.append(button);
 }
 root.append(heading,grid);
}

function lessonsUI(){
 const group=$('lesson-buttons');group.replaceChildren();
 const picker=$('lesson-picker');
 if(picker)picker.replaceChildren();
 if($('lesson-picker-shell'))$('lesson-picker-shell').hidden=!lessons.length;
 if(!lessons.length){$('empty-lessons').hidden=false;setProgress();return;}
 $('empty-lessons').hidden=true;
 lessons.forEach((item,i)=>{
  const button=document.createElement('button');button.type='button';button.dataset.index=String(i);
  escapedText(button,'span',String(i+1).padStart(2,'0'),'index-no');
  escapedText(button,'span',translationForLesson(item).title,'index-title');
  button.addEventListener('click',()=>choose(i));group.appendChild(button);
  if(picker){
   const option=document.createElement('option');
   option.value=String(i);
   option.textContent=courseCopy('Lección ','Lesson ',getClassroomLanguage())+(i+1)+' · '+translationForLesson(item).title;
   picker.append(option);
  }
 });
 setProgress();
 renderCourseMap();
 // Continuar en la primera lección pendiente; si terminó todo, mostrar la última.
 const nextIndex=adminPreview?0:lessons.findIndex(item=>item.status==='ready'&&validVideoId(item.youtube_video_id)&&!done.has(item.lesson_code));
 choose(nextIndex<0?(lessons.some(item=>item.status==='ready'&&validVideoId(item.youtube_video_id))?lessons.length-1:0):nextIndex);
}
document.querySelectorAll('[data-course-video-code]').forEach(button=>{
 button.addEventListener('click',()=>{
  const i=lessons.findIndex(item=>item.lesson_code===button.dataset.courseVideoCode);
  if(i>=0)choose(i);
  else setAulaView('lecciones');
 });
});

async function refreshProductShelf(){
 const statusEl=$('learning-lab-status'),actionEl=$('learning-lab-action'),hint=$('learning-lab-hint');
 if(!statusEl||!actionEl||!hint||!user)return;
 // La presencia de una tarjeta no autoriza el acceso. Solo verificamos la compra
 // en Supabase; la propia app Lab vuelve a exigir membresía vía RLS.
 try{
  const email=(user.email||'').trim().toLowerCase();
  const [{data:member,error:memberError},{data:admin,error:adminError}]=await Promise.all([
   db.from('content_lab_memberships').select('status').eq('buyer_email',email).maybeSingle(),
   db.from('content_lab_admins').select('user_id').eq('user_id',user.id).maybeSingle()
  ]);
  if(memberError||adminError)return;
  if(member?.status==='active'||admin?.user_id===user.id){
   statusEl.textContent=admin?.user_id===user.id?'VISTA PRIVADA':'TU ACCESO';
   statusEl.classList.add('is-available');
   actionEl.href='../content-lab/';
   actionEl.textContent=admin?.user_id===user.id?'Abrir Content Lab (admin) ↗':'Entrar a mi Content Lab ↗';
   actionEl.classList.remove('is-muted');
   hint.textContent=admin?.user_id===user.id?'Vista de administración. La venta pública permanece pausada.':'Tu compra del Lab fue verificada.';
  }
 }catch{/* mantener la tarjeta bloqueada ante problemas de red */}
}

async function showCourse(email,asAdmin=false){
 adminPreview=asAdmin;
 if(!asAdmin){
  const {data:entitlement,error:lookupError}=await db.from('podcast_class_access').select('status,revoked_at').eq('course_id',courseId).eq('buyer_email',email).maybeSingle();
  if(lookupError)throw lookupError;
  if(entitlement?.status!=='active'||entitlement.revoked_at){
   display(noAccess);status('Acceso pendiente de compra verificada.');return;
  }
 }
 const [l,r,p,mp]=await Promise.all([
 db.from('podcast_class_lessons').select('lesson_code,position,title,minutes,description,youtube_video_id,status').eq('course_id',courseId).order('position',{ascending:true}),
 db.from('podcast_class_resources').select('resource_code,title,url,status').eq('course_id',courseId).order('resource_code'),
 asAdmin ? Promise.resolve({data:[],error:null}) : db.from('podcast_class_progress').select('lesson_code').eq('course_id',courseId).eq('buyer_email',email),
 db.from('podcast_class_prompts').select('prompt_code,position,title,summary,body,status').eq('course_id',courseId).like('prompt_code','m%').order('position',{ascending:true})
 ]);
 // Una consulta opcional de recursos o prompts no debe echar a la
 // propietaria fuera de toda la clase si las lecciones siguen disponibles.
 if(l.error)throw l.error;
 if(p.error&&!asAdmin)throw p.error;
 if(!asAdmin&&(r.error||mp.error))throw r.error||mp.error;
 const hasPartialMaterials=Boolean(r.error||mp.error);
 modulePrompts=(mp.data||[]).filter(item=>item.status==='ready'||asAdmin);
 // Approved classroom outline is visible before recordings; a draft lesson
 // remains explicitly non-completable until its approved video is published.
 // Display only the four essential videos. Other historical course rows remain untouched.
 lessons=CORE_LESSON_CODES.map(code=>(l.data||[]).find(item=>item.lesson_code===code&&(asAdmin||['draft','ready'].includes(item.status)))).filter(Boolean);
 done=new Set((p.data||[]).map(x=>x.lesson_code));
 courseResources=asAdmin?(r.data||[]):(r.data||[]).filter(item=>item.status==='ready');
 const generalResources=courseResources.filter(item=>!item.resource_code.startsWith('bonus_'));
 const resources=$('resource-list');resources.replaceChildren();
 generalResources.forEach(item=>{
  const a=document.createElement('a');a.href=item.url||'#';a.rel='noopener noreferrer';a.target='_blank';a.className='resource';
  if(!item.url || !/^https:\/\//i.test(item.url)){a.removeAttribute('href');a.removeAttribute('target');}
  escapedText(a,'span',getClassroomLanguage()==='en'?(asAdmin?(item.status==='ready'?'APPROVED MATERIAL':'IN PREPARATION'):'GUIDE / MATERIAL'):(asAdmin?(item.status==='ready'?'MATERIAL APROBADO':'EN PREPARACIÓN'):'GUÍA / MATERIAL'),'resource-tag');
  const resourceTitleEn={prompts:'Prompt library',pdf_00:'Getting started · PDF',pdf_01:'Prompt library · PDF',pdf_02:'Workbook · PDF',pdf_03:'Website guide · PDF',pdf_04:'Final checklist · PDF'};
  escapedText(a,'strong',getClassroomLanguage()==='en'?(resourceTitleEn[item.resource_code]||'Course resource'):item.title);escapedText(a,'span',getClassroomLanguage()==='en'?(item.url?'Open':'In preparation'):(item.url?'Abrir':'En preparación'),'resource-link');
  resources.appendChild(a);
 });
 $('empty-resources').hidden=Boolean(generalResources.length);
 $('assigned-bonus-list').replaceChildren();
 $('assigned-bonuses').hidden=true;
 $('admin-preview-banner').hidden=!asAdmin;
 $('student-progress').hidden=asAdmin;
 $('progress-label').hidden=asAdmin;
 $('progress-percent').hidden=asAdmin;
 $('lesson-celebration').hidden=true;
 display(course);
 ensureAulaNavigation();
 status(asAdmin
  ? hasPartialMaterials
   ? 'Vista privada abierta. Algunas guías o prompts no cargaron; las lecciones siguen disponibles.'
   : 'Vista administrativa: borradores visibles solo para ti. Sin cambios al progreso de alumnos.'
  : 'Acceso verificado.',true);
 const storedAulaPlace=readAulaPlace();
 aulaRestoring=true; // Bootstrapping lessons must never overwrite the remembered view.
 lessonsUI();
 aulaViewHistory.length=0;
 let refreshedSection='';
  try{refreshedSection=sessionStorage.getItem('tle_aula_refresh_view')||'';sessionStorage.removeItem('tle_aula_refresh_view');}catch{}
  bonusLibraryController=null;
  $('bonus-library-items')?.replaceChildren();
  const linkSection=location.hash.slice(1);
  const explicitlyOpened=Boolean(refreshedSection&&Object.hasOwn(aulaViews,refreshedSection))||
    ['prompts','bonos'].includes(linkSection);
  if(storedAulaPlace&&!explicitlyOpened){
    Object.assign(aulaScrollPosition,storedAulaPlace.scroll);
    aulaViewHistory.push(...storedAulaPlace.history);
    if(lessons[storedAulaPlace.lesson])choose(storedAulaPlace.lesson,{track:false});
  }
  const initialView=refreshedSection&&Object.hasOwn(aulaViews,refreshedSection)?refreshedSection:
    ['prompts','bonos'].includes(linkSection)?linkSection:storedAulaPlace?.view||'inicio';
  setAulaView(initialView,{scroll:false,track:false});
  // Build in-app browser history after sign-in, without changing lesson URLs.
  const recent=storedAulaPlace&&!explicitlyOpened
    ?[...aulaViewHistory,initialView].slice(-13):[initialView];
  const first=recent.shift()||'inicio';
  const firstView=first.startsWith('lesson:')?'lecciones':first;
  window.history.replaceState({...window.history.state,tleAulaView:firstView,
    tleAulaLesson:first.startsWith('lesson:')?Number(first.slice(7)):selected},'',window.location.href);
  aulaBrowserSteps=0;
  for(const entry of recent){
    const view=entry.startsWith('lesson:')?'lecciones':entry;
    const lesson=entry.startsWith('lesson:')?Number(entry.slice(7)):selected;
    window.history.pushState({...window.history.state,tleAulaView:view,tleAulaLesson:lesson},'',window.location.href);
    aulaBrowserSteps++;
  }
  aulaRestoring=false;
  if(storedAulaPlace&&!explicitlyOpened)
    window.setTimeout(()=>window.scrollTo({top:aulaScrollPosition[initialView]||0,behavior:'auto'}),160);
  rememberAulaPlace();
 materialsController=null;
 void mountMateriales($('materiales-interactivos'),{
  db,user,courseId,adminPreview:asAdmin,getLanguage:getClassroomLanguage,
  onGoLessons:()=>setAulaView('lecciones'),
  onCloseMaterials:()=>{aulaViewHistory.length=0;setAulaView('inicio',{track:false});}
 }).then(controller=>{
  materialsController=controller||null;
  if(currentAulaView==='prompts')materialsController?.go('prompts',{track:false});
 }).catch(()=>{
  const root=$('materiales-interactivos');
  root.textContent=translateCourseMessage('No se pudieron cargar los materiales. Vuelve a abrir el aula o pide ayuda desde aquí.',getClassroomLanguage());
 });
 // Preload independently, with navigation fallback and visible error handling.
 inspirationController=null;
 void ensureInspiracion();
 if(user){await loadMemberName(user,asAdmin);if(!asAdmin)await checkProjectShared();}
}
async function refreshAuth(){
 if(recoveryMode){out.hidden=true;display(login);setAuthMode('newPassword');authNotice('Enlace de recuperación verificado. Escribe tu nueva contraseña.');return;}
 // La vista dentro del Studio no debe pedir otra compra ni contraseña.
 if(STUDIO_EMBEDDED_OWNER&&!studioSessionReady){
  out.hidden=true;display(null);status('Abriendo tu aula…');return;
 }
 let ownerConfirmed=false;
 let stage='sesión';
 try{
  const {data:{user:who},error}=await db.auth.getUser();
  if(error && !/Auth session missing/i.test(error.message||''))throw error;
  if(!who){
   user=null;out.hidden=true;display(STUDIO_EMBEDDED_OWNER?null:login);
   status(STUDIO_EMBEDDED_OWNER?'Tu acceso desde administración aún no está confirmado.':'Entra con tu correo y contraseña.');return;
  }
  stage='permiso de administradora';
  const owner=await isAuthorizedOwner(who);
  ownerConfirmed=owner;
  if(STUDIO_EMBEDDED_OWNER&&!owner){
   user=null;out.hidden=true;display(null);
   status('No pudimos verificar los permisos de administradora. Esta vista no abre cuentas de alumnos.');return;
  }
  // Solo alumnos con compra confirmada; nunca cerrar el Studio desde su iframe.
  if(!owner&&!hasAulaSession(who.id)){
   clearRememberedStudent();user=null;lessons=[];done.clear();display(login);out.hidden=true;
   await db.auth.signOut({scope:'local'});
   authNotice('Por seguridad, vuelve a entrar con tu contraseña.');
   return;
  }
  user=who;out.hidden=owner;status('Comprobando permisos…');
  if(!owner&&!who.email_confirmed_at){display(noAccess);status('Confirma tu correo antes de entrar al aula.');return;}
  stage='lecciones y materiales';
  await showCourse((who.email||'').trim().toLowerCase(),owner);
  // El aula no consulta ni anuncia otros productos.
 }catch(e){
  if(ownerConfirmed){
   // Rol owner confirmado por RLS. No mostrar la pantalla de pago.
   adminPreview=true;out.hidden=true;display(course);
   $('admin-preview-banner').hidden=false;
   status('No se pudo cargar '+stage+'. Vuelve a administración y abre el aula de nuevo.');
  }else if(STUDIO_EMBEDDED_OWNER){
   out.hidden=true;display(null);
   status('No se pudo confirmar el acceso. Vuelve a administración y abre el aula otra vez.');
  }else{
   display(login);status('No pudimos comprobar el acceso. Actualiza la página o pide ayuda si continúa.');
  }
  console.error('Course portal auth check error',e?.code||e?.name||'unknown',stage);
 }
}
$('login-form').addEventListener('submit',async e=>{
 e.preventDefault();
 const form=e.currentTarget;
 await submitAuth(form,async()=>{
  const email=$('login-email').value.trim().toLowerCase(),password=$('login-password').value;
  authNotice('Comprobando tu cuenta…');
  try{
   const {data,error}=await db.auth.signInWithPassword({email,password});
   if(error||!data?.user)throw error||Error('Invalid sign in');
   if(!rememberStudent(data.user.id,$('remember-device').checked)){
    await db.auth.signOut({scope:'local'});throw Error('Storage blocked');
   }
   $('login-password').value='';await refreshAuth();
  }catch(err){
   clearRememberedStudent();
   authNotice(err?.message==='Storage blocked'?'Activa el almacenamiento de este navegador para iniciar sesión.':'No pudimos entrar. Revisa tu correo y contraseña o recupérala si la olvidaste.');
  }
 });
});
$('register-form').addEventListener('submit',async event=>{
 event.preventDefault();const form=event.currentTarget;
 if($('register-password').value!==$('register-confirm').value){authNotice('Las contraseñas no coinciden. Inténtalo de nuevo.');return;}
 await submitAuth(form,async()=>{
  authNotice('Preparando tu cuenta…');
  try{
   const {data,error}=await db.auth.signUp({
    email:$('register-email').value.trim().toLowerCase(),
    password:$('register-password').value,
    options:{emailRedirectTo:location.origin+location.pathname}
   });
   if(error)throw error;
   if(data?.session)await db.auth.signOut({scope:'local'});
   $('register-password').value='';$('register-confirm').value='';
   authNotice('Si puedes crear una cuenta con ese correo, recibirás las instrucciones para confirmarla. Si ya tenías una cuenta, usa «Olvidé mi contraseña». Después podrás entrar con tu contraseña.');
  }catch(err){authNotice('No pudimos crear la cuenta. Comprueba el correo y utiliza una contraseña de al menos 8 caracteres.');}
 });
});
$('reset-email-form').addEventListener('submit',async event=>{
 event.preventDefault();const form=event.currentTarget;
 await submitAuth(form,async()=>{
  authNotice('Solicitando recuperación…');
  try{
   const {error}=await db.auth.resetPasswordForEmail($('reset-email').value.trim().toLowerCase(),{redirectTo:location.origin+location.pathname});
   if(error)throw error;
   authNotice('Si existe una cuenta con ese correo, recibirás el enlace para recuperar la contraseña. Revisa también Promociones o Spam.');
  }catch{authNotice('No pudimos enviar el correo. Inténtalo después o solicita ayuda.');}
 });
});
$('new-password-form').addEventListener('submit',async event=>{
 event.preventDefault();const form=event.currentTarget;
 if($('new-password').value!==$('new-password-confirm').value){authNotice('Las contraseñas no coinciden.');return;}
 await submitAuth(form,async()=>{
  authNotice('Guardando contraseña…');
  try{
   const {data:{user:who}}=await db.auth.getUser();
   if(!who)throw Error('Recovery session unavailable');
   const {error}=await db.auth.updateUser({password:$('new-password').value});
   if(error)throw error;
   $('new-password').value='';$('new-password-confirm').value='';
   recoveryMode=false;clearRememberedStudent();
   await db.auth.signOut({scope:'local'});
   setAuthMode('login');authNotice('Contraseña guardada. Ahora entra con tu correo y contraseña.');
  }catch{authNotice('No pudimos guardar tu contraseña. Abre de nuevo el enlace de recuperación o solicita uno nuevo.');}
 });
});
$('lesson-done').addEventListener('change',async e=>{
 const box=e.currentTarget;const item=lessons[selected];if(adminPreview||!user||!item){box.checked=false;return;}
 box.disabled=true;
 const email=(user.email||'').trim().toLowerCase();
 const values={course_id:courseId,buyer_email:email,lesson_code:item.lesson_code};
 try{
  const response=box.checked ? await db.from('podcast_class_progress').insert(values) :
   await db.from('podcast_class_progress').delete().eq('course_id',courseId).eq('buyer_email',email).eq('lesson_code',item.lesson_code);
  if(response.error && !(box.checked&&response.error.code==='23505'))throw response.error;
  if(box.checked)done.add(item.lesson_code);else done.delete(item.lesson_code);
  setProgress();
  if(box.checked){congratulate(item);await checkProjectShared();}
  else $('lesson-celebration').hidden=true;
 }catch{box.checked=!box.checked;status('No pudimos guardar tu avance. Vuelve a intentarlo.');}
 finally{box.disabled=false;}
});
$('lesson-picker')?.addEventListener('change',event=>{
 const index=Number(event.currentTarget.value);
 if(Number.isInteger(index)&&index>=0&&index<lessons.length)choose(index);
});
$('lesson-prev').addEventListener('click',()=>choose(Math.max(0,selected-1)));
$('lesson-next').addEventListener('click',()=>choose(Math.min(selected+1,lessons.length-1)));
$('lesson-celebration-close').addEventListener('click',()=>$('lesson-celebration').hidden=true);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden)return;
 if(user&&!adminPreview&&currentStudentDeadline()<=Date.now()){
  display(login);clearRememberedStudent();void db.auth.signOut({scope:'local'});return;
 }
 if(!adminPreview&&user&&!course.hidden)void checkProjectShared();
});
window.setInterval(()=>{
 if(user&&!adminPreview&&currentStudentDeadline()<=Date.now()){
  display(login);clearRememberedStudent();void db.auth.signOut({scope:'local'});
 }
},30*1000);
out.addEventListener('click',async()=>{
 if(adminPreview){location.assign('../estudio/');return;}
 clearAulaPlace();clearRememberedStudent();await db.auth.signOut({scope:'local'});location.replace('./');
});
const courseHelpPanel=$('soporte-aula');
const courseHelpForm=$('course-help-form');
const courseHelpStatus=$('course-help-status');
let lastHelpTrigger=null;
function toggleCourseHelp(open) {
 courseHelpPanel.hidden=!open;
 document.querySelectorAll('[data-course-help]').forEach(control=>control.setAttribute('aria-expanded',String(open)));
 if(open){
  const email=(user?.email||$('login-email').value||'').trim().toLowerCase();
  if(email && !$('course-help-email').value)$('course-help-email').value=email;
  const firstName=String(user?.user_metadata?.full_name||user?.user_metadata?.name||'').slice(0,80);
  if(firstName && !$('course-help-name').value)$('course-help-name').value=firstName;
  courseHelpPanel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  $('course-help-title').focus({preventScroll:true});
 }else{
  lastHelpTrigger?.focus({preventScroll:true});
 }
}
document.querySelectorAll('[data-course-help]').forEach(control=>control.addEventListener('click',event=>{
 event.preventDefault();lastHelpTrigger=control;toggleCourseHelp(true);
}));
$('close-course-help').addEventListener('click',()=>toggleCourseHelp(false));
$('cancel-course-help').addEventListener('click',()=>toggleCourseHelp(false));
courseHelpForm.addEventListener('submit',async event=>{
 event.preventDefault();
 courseHelpStatus.textContent='';courseHelpStatus.dataset.state='';
 if(!courseHelpForm.reportValidity())return;
 if(courseHelpForm.querySelector('[name="website"]')?.value)return;
 const endpoint=window.PODCAST_CONFIG?.helpEndpoint;
 if(typeof endpoint!=='string'||!/^https:\/\//.test(endpoint)){
  courseHelpStatus.dataset.sourceMessage='La ayuda no está disponible ahora. Escríbenos a hello@thelaunchera.com.';
  courseHelpStatus.textContent=translateCourseMessage(courseHelpStatus.dataset.sourceMessage,getClassroomLanguage());
  courseHelpStatus.dataset.state='error';return;
 }
 const button=courseHelpForm.querySelector('button[type="submit"]');
 const payload=new URLSearchParams(new FormData(courseHelpForm));
 const title=payload.get('topic')||'Clase · consulta';
 payload.set('topic',String(title));
 payload.set('message','[Centro de alumnos · Tu primera web con IA]'+
    (lessons[selected]?.title?' [Lección: '+lessons[selected].title+']':'')+'\n'+String(payload.get('message')||''));
 button.disabled=true;button.textContent=courseCopy('Enviando consulta…','Sending request…',getClassroomLanguage());
 try{
  const response=await fetch(endpoint,{method:'POST',mode:'cors',headers:{Accept:'application/json'},body:payload});
  if(!response.ok)throw Error('Error de envío');
  const data=await response.json();
  if(data?.ok!==true)throw Error('Sin confirmación');
  courseHelpStatus.dataset.sourceMessage='¡Recibí tu consulta! Te envié una confirmación por correo. Puedes continuar con tu clase.';
  courseHelpStatus.textContent=translateCourseMessage(courseHelpStatus.dataset.sourceMessage,getClassroomLanguage());
  courseHelpStatus.dataset.state='success';
  courseHelpForm.reset();
  if(user?.email)$('course-help-email').value=user.email.trim().toLowerCase();
 }catch{
  courseHelpStatus.dataset.sourceMessage='No pudimos confirmar el envío. Intenta otra vez o escribe a hello@thelaunchera.com.';
  courseHelpStatus.textContent=translateCourseMessage(courseHelpStatus.dataset.sourceMessage,getClassroomLanguage());
  courseHelpStatus.dataset.state='error';
 }finally{button.disabled=false;button.textContent=courseCopy('Enviar mi consulta','Send my request',getClassroomLanguage());}
});

// Suscribir antes de iniciar la lectura de sesión para recibir el evento de recuperación.
// Si la recuperación vuelve con un token, nunca se muestran lecciones durante el cambio de clave.
// Si la sesión termina en otra pestaña, recargar vacía los datos privados de este documento.
// También evita que un cambio de cuenta conserve material de la sesión anterior.
db.auth.onAuthStateChange((event,session)=>{
 if(STUDIO_EMBEDDED_OWNER&&!studioSessionReady)return;
 if(event==='PASSWORD_RECOVERY'){
  recoveryMode=true;display(login);setAuthMode('newPassword');authNotice('Enlace verificado. Ya puedes crear una contraseña nueva.');return;
 }
 if(authBusy)return;
 if(event==='SIGNED_OUT'){
  display(login);out.hidden=true;
  status('Tu sesión terminó. Vuelve a entrar para continuar.');
  location.replace('./');
  return;
 }
 if(session?.user && user?.id && session.user.id!==user.id){
  display(login);out.hidden=true;
  status('La cuenta cambió. Comprobando el acceso de nuevo…');
  location.replace('./');
  return;
 }
 if(session?.user && session.user.id!==user?.id){
  window.setTimeout(()=>void refreshAuth(),0);
 }
});


if(STUDIO_EMBEDDED_OWNER){
 // La solicitud se envía a la ventana que ya inició sesión en el Studio.
 // Nunca lleva credenciales en el enlace ni concede acceso por query string.
 window.addEventListener('message',async event=>{
  if(event.origin!==window.location.origin || event.source!==window.parent)return;
  if(event.data?.type!=='TLE_OWNER_SESSION_RESPONSE'||studioSessionLoading)return;
  const tokens=event.data;
  if(typeof tokens.access_token!=='string'||typeof tokens.refresh_token!=='string')return;
  studioSessionLoading=true;
  try{
   // Studio and classroom are same-origin: prefer the existing authenticated
   // browser session. Re-applying the same refresh token in two clients can
   // race with Supabase token rotation on mobile Safari.
   const {data:existing}=await db.auth.getSession();
   const sameSession=existing?.session?.user?.id===tokens.user_id
     && Boolean(existing?.session?.access_token);
   if(!sameSession){
    const {data,error}=await db.auth.setSession({
     access_token:tokens.access_token,refresh_token:tokens.refresh_token
    });
    if(error||!data.user)throw error||Error('Sesión no válida');
   }
   const {data:{user:verified},error:verifyError}=await db.auth.getUser();
   if(verifyError||!verified||!await isAuthorizedOwner(verified))throw verifyError||Error('No autorizado');
   studioSessionReady=true;
   await refreshAuth();
  }catch(e){
   studioSessionReady=false;out.hidden=true;display(null);
   const reason=e?.code==='PGRST301'?' (sesión caducada)':'';
   status('No se pudo confirmar tu acceso'+reason+'. Vuelve a administración e inténtalo de nuevo.');
   console.error('Owner classroom bridge verification failed',e?.code||e?.name||'unknown');
  }finally{studioSessionLoading=false;}
 });
 out.hidden=true;display(null);
 status('Conectando con administración…');
 // On the same origin, Supabase may already have a valid Studio session.
 // Verify the real owner role immediately instead of waiting for the bridge.
 // The message bridge remains available for isolated browser contexts.
 const checkExistingOwner=async()=>{
  if(studioSessionReady||studioSessionLoading)return;
  try{
   const {data:{user:existing}}=await db.auth.getUser();
   if(existing&&await isAuthorizedOwner(existing)){
    studioSessionReady=true;
    await refreshAuth();
    return;
   }
  }catch(e){console.warn('Studio session fallback unavailable',e?.name||'unknown');}
  out.hidden=true;display(null);
  status('No se pudo verificar tu acceso. Vuelve a administración y abre el aula otra vez.');
 };
 void checkExistingOwner();
 setTimeout(()=>{if(!studioSessionReady&&!studioSessionLoading)void checkExistingOwner();},6500);
 // Safari and embedded webviews can load the iframe before React attaches
 // the Studio message listener. Retry the handshake until it is verified.
 const requestOwnerSession=()=>{
  if(studioSessionReady)return;
  window.parent.postMessage({type:'TLE_OWNER_SESSION_REQUEST'},window.location.origin);
 };
 requestOwnerSession();
 const requestTimer=setInterval(()=>{
  if(studioSessionReady){clearInterval(requestTimer);return;}
  requestOwnerSession();
 },1400);
 setTimeout(()=>clearInterval(requestTimer),18000);
}else{
 await refreshAuth();
}


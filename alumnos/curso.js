import {supabaseUrl,supabasePublishableKey,courseId} from '../clases/course-config.js';
import {mountMateriales} from './materiales-interactivos.js?v=curso-recursos-20261029-v1';
import {renderAulaInicio} from './dashboard-inicio.js?v=20261028-final-v1';
const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm');
const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const message=$('room-message'),login=$('login-panel'),noAccess=$('no-access'),course=$('class-content');
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
}
document.querySelectorAll('[data-auth-mode]').forEach(button=>button.addEventListener('click',()=>{
 if(!recoveryMode)setAuthMode(button.dataset.authMode);
}));
$('forgot-password-trigger').addEventListener('click',()=>{setAuthMode('reset');$('reset-email').value=$('login-email').value;});
document.querySelectorAll('[data-password-toggle]').forEach(button=>button.addEventListener('click',()=>{
 const input=$(button.dataset.passwordToggle);if(!input)return;
 const visible=input.type==='password';input.type=visible?'text':'password';
 button.textContent=visible?'Ocultar':'Mostrar';
 button.setAttribute('aria-label',visible?'Ocultar contraseña':'Mostrar contraseña');
}));
async function submitAuth(form,fn){
 if(authBusy)return;
 const button=form.querySelector('button[type="submit"]');authBusy=true;button.disabled=true;
 try{await fn();}finally{button.disabled=false;authBusy=false;}
}
function authNotice(text){status(text);$('room-message').hidden=false;}

const out=$('logout');
let user=null,lessons=[],done=new Set(),selected=0,adminPreview=false,projectShared=false;
let materialsController=null,courseResources=[];
const adminMarkerKey='podcast_studio_password_login_deadline_v1';
function hasValidStudioSession(id){
 try {const value=JSON.parse(localStorage.getItem(adminMarkerKey)||'null');return value?.userId===id && Number(value?.expiresAt)>Date.now();}
 catch {return false;}
}
async function isAuthorizedOwner(who){
 if(!hasValidStudioSession(who.id))return false;
 const {data,error}=await db.from('podcast_studio_admins').select('role').eq('user_id',who.id).maybeSingle();
 if(error)throw error;
 return data?.role==='owner';
}
function status(text,ok=false){message.textContent=text;message.dataset.ok=ok?'true':'false';}
function display(panel){
 [login,noAccess,course].forEach(el=>el.hidden=(el!==panel));
 document.body.classList.toggle('aula-member',panel===course);
 if(panel!==course)closeAulaMenu();
}
const aulaTitle=$('aula-active-title');
const aulaOpen=$('aula-menu-open');
const aulaClose=$('aula-rail-close');
const aulaBack=$('aula-rail-backdrop');
const aulaSidebar=$('aula-rail');
const aulaViews={
 inicio:'Mi inicio', lecciones:'Mis lecciones', prompts:'Biblioteca de prompts', materiales:'Mis materiales',
 bonos:'Mis bonos', comunidad:'Club de Ideas'
};
let currentAulaView='lecciones';
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
function setAulaView(view,{scroll=true}={}){
 if(!Object.prototype.hasOwnProperty.call(aulaViews,view))return;
 currentAulaView=view;
 document.querySelectorAll('[data-aula-panel]').forEach(section=>{
  section.hidden=section.getAttribute('data-aula-panel')!==(view==='prompts'?'materiales':view);
 });
 if(view==='prompts')materialsController?.go('prompts');
 if(view==='materiales')materialsController?.go('inicio');
 document.querySelectorAll('.aula-side-link[data-aula-view]').forEach(control=>{
  const selected=control.dataset.aulaView===view;
  control.setAttribute('aria-current',selected?'page':'false');
 });
 aulaTitle.textContent=aulaViews[view];
 closeAulaMenu();
 if(scroll&&document.body.classList.contains('aula-member')){
  window.scrollTo({top:0,behavior:'auto'});
 }
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
 if(event.key==='Escape'&&document.body.classList.contains('aula-menu-open')){
  closeAulaMenu();aulaOpen.focus({preventScroll:true});
 }
});

function validVideoId(id){return typeof id==='string' && /^[A-Za-z0-9_-]{11}$/.test(id);}
function escapedText(parent,tag,value,klass){const node=document.createElement(tag);node.textContent=value;if(klass)node.className=klass;parent.appendChild(node);return node;}
function progressStats(){
 const total=lessons.length,completed=lessons.filter(l=>done.has(l.lesson_code)).length;
 return {total,completed,percent:total?Math.round(100*completed/total):0};
}
// Solo la clase completa y aprobada puede generar acceso al reto del bono.
const REQUIRED_LESSON_COUNT=9;
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
    escapedText(link,'span','BONO PERSONAL','resource-tag');
    escapedText(link,'strong',item.title);
    escapedText(link,'span','Abrir bono','resource-link');
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
  status.textContent='¡Completaste las lecciones y compartiste tu web! Requisitos del bono cumplidos.';
  status.dataset.state='earned';
 }else if(allDone){
  status.textContent='Te falta un paso: publica tu primera web en Proyectos, dentro del Club de Ideas.';
  status.dataset.state='progress';
 }else if(projectShared){
  status.textContent='¡Tu web ya está en el club! Termina las lecciones para activar el bono.';
  status.dataset.state='progress';
 }else{
  status.textContent='Bono bloqueado · termina las lecciones y comparte tu web en el Club de Ideas.';
  status.dataset.state='pending';
 }
}
function updateDashboard(){
 renderAulaInicio({lessons,done,resources:courseResources,adminPreview,projectShared,onLesson:i=>choose(i),onView:setAulaView});
}
function setProgress(){
 const {total,completed,percent}=progressStats();
 $('progress-label').textContent=completed+' de '+total+' lecciones completadas';
 $('progress-percent').textContent=percent+'%';
 $('progress-bar').style.width=percent+'%';
 $('student-progress').setAttribute('aria-valuenow',String(percent));
 if(!adminPreview)bonusState();
 updateDashboard();
}
function congratulate(item){
 const {total,completed}=progressStats();
 $('lesson-celebration-title').textContent='¡Bien hecho! Terminaste una lección.';
 $('lesson-celebration-description').textContent=total&&completed===total
  ? '¡Completaste todas las lecciones! Ahora comparte tu primera web en el Club de Ideas para cumplir el reto del bono.'
  : 'Terminaste «'+item.title+'». Ya llevas '+completed+' de '+total+'. ¡Sigue así!';
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
function choose(i){
 selected=i;
 const item=lessons[i];
 if(!item)return;
 setAulaView('lecciones');
 const box=$('lesson-player');box.replaceChildren();box.hidden=!validVideoId(item.youtube_video_id);
 if(!box.hidden){
  const frame=document.createElement('iframe');
  frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(item.youtube_video_id)+'?rel=0';
  frame.title='Video '+item.lesson_code+' · '+item.title;
  frame.loading='lazy';frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;
  box.appendChild(frame);
 }
 $('lesson-unavailable').hidden=!box.hidden;
 $('lesson-number').textContent='VIDEO '+item.lesson_code;
 $('lesson-title').textContent=item.title;
 $('lesson-description').textContent=item.description;
 $('lesson-done').checked=done.has(item.lesson_code);
 $('lesson-done').closest('label').hidden=adminPreview;
 $('lesson-info').hidden=false;
 $('lesson-next').disabled=i>=lessons.length-1;
 document.querySelectorAll('.lesson-index button[data-index]').forEach(button=>{
  button.classList.toggle('current',Number(button.dataset.index)===i);
  button.setAttribute('aria-current',Number(button.dataset.index)===i?'step':'false');
 });
}
function lessonsUI(){
 const group=$('lesson-buttons');group.replaceChildren();
 if(!lessons.length){$('empty-lessons').hidden=false;setProgress();return;}
 $('empty-lessons').hidden=true;
 lessons.forEach((item,i)=>{
  const button=document.createElement('button');button.type='button';button.dataset.index=String(i);
  escapedText(button,'span',item.lesson_code,'index-no');
  escapedText(button,'span',item.title,'index-title');
  button.addEventListener('click',()=>choose(i));group.appendChild(button);
 });
 setProgress();choose(0);
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
 const [l,r,p]=await Promise.all([
 db.from('podcast_class_lessons').select('lesson_code,position,title,minutes,description,youtube_video_id,status').eq('course_id',courseId).order('position',{ascending:true}),
 db.from('podcast_class_resources').select('resource_code,title,url,status').eq('course_id',courseId).order('resource_code'),
 asAdmin ? Promise.resolve({data:[],error:null}) : db.from('podcast_class_progress').select('lesson_code').eq('course_id',courseId).eq('buyer_email',email)
 ]);
 if(l.error||r.error||p.error)throw l.error||r.error||p.error;
 lessons=asAdmin?(l.data||[]):(l.data||[]).filter(item=>item.status==='ready'&&validVideoId(item.youtube_video_id));
 done=new Set((p.data||[]).map(x=>x.lesson_code));
 courseResources=asAdmin?(r.data||[]):(r.data||[]).filter(item=>item.status==='ready');
 const generalResources=courseResources.filter(item=>!item.resource_code.startsWith('bonus_'));
 const resources=$('resource-list');resources.replaceChildren();
 generalResources.forEach(item=>{
  const a=document.createElement('a');a.href=item.url||'#';a.rel='noopener noreferrer';a.target='_blank';a.className='resource';
  if(!item.url || !/^https:\/\//i.test(item.url)){a.removeAttribute('href');a.removeAttribute('target');}
  escapedText(a,'span',asAdmin?(item.status==='ready'?'MATERIAL APROBADO':'EN PREPARACIÓN'):'GUÍA / MATERIAL','resource-tag');
  escapedText(a,'strong',item.title);escapedText(a,'span',item.url?'Abrir':'En preparación','resource-link');
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
 display(course);status(asAdmin?'Vista administrativa: borradores visibles solo para ti. Sin cambios al progreso de alumnos.':'Acceso verificado.',true);lessonsUI();setAulaView(location.hash==='#prompts'?'prompts':'inicio',{scroll:false});
 materialsController=null;
 void mountMateriales($('materiales-interactivos'),{
  db,user,courseId,adminPreview:asAdmin,onGoLessons:()=>setAulaView('lecciones')
 }).then(controller=>{
  materialsController=controller||null;
  if(currentAulaView==='prompts')materialsController?.go('prompts');
 }).catch(()=>{
  const root=$('materiales-interactivos');
  root.textContent='No se pudieron cargar los materiales. Vuelve a abrir el aula o pide ayuda desde aquí.';
 });
 if(user){await loadMemberName(user,asAdmin);if(!asAdmin)await checkProjectShared();}
}
async function refreshAuth(){
 if(recoveryMode){out.hidden=true;display(login);setAuthMode('newPassword');authNotice('Enlace de recuperación verificado. Escribe tu nueva contraseña.');return;}
 try{
  const {data:{user:who},error}=await db.auth.getUser();
  if(error && !/Auth session missing/i.test(error.message||''))throw error;
  if(!who){user=null;out.hidden=true;display(login);if(!message.dataset.noticeShown)status('Entra con tu correo y contraseña.');return;}
  const owner=await isAuthorizedOwner(who);
  // La autenticación de administradora usa su propia sesión segura del Estudio.
  // La entrada de alumnos caduca a las 24 horas y no se renueva por refrescar la página.
  if(!owner&&!hasAulaSession(who.id)){
   clearRememberedStudent();user=null;lessons=[];done.clear();display(login);out.hidden=true;
   await db.auth.signOut({scope:'local'});
   authNotice('Por seguridad, vuelve a entrar con tu contraseña.');
   return;
  }
  user=who;out.hidden=false;status('Comprobando permisos…');
  if(!owner&&!who.email_confirmed_at){display(noAccess);status('Confirma tu correo antes de entrar al aula.');return;}
  await showCourse((who.email||'').trim().toLowerCase(),owner);
 }catch(e){display(login);status('No pudimos comprobar el acceso. Actualiza la página o pide ayuda si continúa.');console.error('Course portal auth check error',e?.code||'unknown');}
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
 clearRememberedStudent();await db.auth.signOut({scope:'local'});location.replace('./');
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
  $('course-help-name').focus({preventScroll:true});
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
  courseHelpStatus.textContent='La ayuda no está disponible ahora. Escríbenos a hello@thelaunchera.com.';
  courseHelpStatus.dataset.state='error';return;
 }
 const button=courseHelpForm.querySelector('button[type="submit"]');
 const payload=new URLSearchParams(new FormData(courseHelpForm));
 const title=payload.get('topic')||'Clase · consulta';
 payload.set('topic',String(title));
 payload.set('message','[Centro de alumnos · Tu primera web con IA]'+
    (lessons[selected]?.title?' [Lección: '+lessons[selected].title+']':'')+'\n'+String(payload.get('message')||''));
 button.disabled=true;button.textContent='Enviando consulta…';
 try{
  const response=await fetch(endpoint,{method:'POST',mode:'cors',headers:{Accept:'application/json'},body:payload});
  if(!response.ok)throw Error('Error de envío');
  const data=await response.json();
  if(data?.ok!==true)throw Error('Sin confirmación');
  courseHelpStatus.textContent='¡Recibí tu consulta! Te envié una confirmación por correo. Puedes continuar con tu clase.';
  courseHelpStatus.dataset.state='success';
  courseHelpForm.reset();
  if(user?.email)$('course-help-email').value=user.email.trim().toLowerCase();
 }catch{
  courseHelpStatus.textContent='No pudimos confirmar el envío. Intenta otra vez o escribe a hello@thelaunchera.com.';
  courseHelpStatus.dataset.state='error';
 }finally{button.disabled=false;button.textContent='Enviar mi consulta';}
});

// Suscribir antes de iniciar la lectura de sesión para recibir el evento de recuperación.
// Si la recuperación vuelve con un token, nunca se muestran lecciones durante el cambio de clave.
// Si la sesión termina en otra pestaña, recargar vacía los datos privados de este documento.
// También evita que un cambio de cuenta conserve material de la sesión anterior.
db.auth.onAuthStateChange((event,session)=>{
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

await refreshAuth();

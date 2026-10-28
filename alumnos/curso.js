import {supabaseUrl,supabasePublishableKey,courseId} from '../clases/course-config.js';
const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm');
const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const message=$('room-message'),login=$('login-panel'),noAccess=$('no-access'),course=$('class-content');
const out=$('logout');
let user=null,lessons=[],done=new Set(),selected=0,adminPreview=false,projectShared=false;
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
function display(panel){[login,noAccess,course].forEach(el=>el.hidden=(el!==panel));}
function validVideoId(id){return typeof id==='string' && /^[A-Za-z0-9_-]{11}$/.test(id);}
function escapedText(parent,tag,value,klass){const node=document.createElement(tag);node.textContent=value;if(klass)node.className=klass;parent.appendChild(node);return node;}
function progressStats(){
 const total=lessons.length,completed=lessons.filter(l=>done.has(l.lesson_code)).length;
 return {total,completed,percent:total?Math.round(100*completed/total):0};
}
function bonusState(){
 const {total,completed}=progressStats(),allDone=total>0&&total===completed;
 const l=$('bonus-lessons'),p=$('bonus-project');
 l.classList.toggle('is-done',allDone);p.classList.toggle('is-done',projectShared);
 l.querySelector('span').textContent=allDone?'✓':'○';p.querySelector('span').textContent=projectShared?'✓':'○';
 const status=$('bonus-status');
 if(allDone&&projectShared){
  status.textContent='¡Completaste los dos pasos! Tu bono está pendiente de anuncio y entrega.';
  status.dataset.state='earned';
 }else if(allDone){
  status.textContent='¡Terminaste las lecciones! Comparte tu primera web en el Club de Ideas.';
  status.dataset.state='progress';
 }else if(projectShared){
  status.textContent='¡Ya compartiste tu proyecto! Continúa con las lecciones.';
  status.dataset.state='progress';
 }else{
  status.textContent='Pronto te contaremos qué incluye el bono.';
  status.dataset.state='pending';
 }
}
function setProgress(){
 const {total,completed,percent}=progressStats();
 $('progress-label').textContent=completed+' de '+total+' lecciones completadas';
 $('progress-percent').textContent=percent+'%';
 $('progress-bar').style.width=percent+'%';
 $('student-progress').setAttribute('aria-valuenow',String(percent));
 if(!adminPreview)bonusState();
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
 if(adminPreview||!user){projectShared=false;bonusState();return;}
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
 bonusState();
}
function choose(i){
 selected=i;
 const item=lessons[i];
 if(!item)return;
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
 lessons=l.data||[];done=new Set((p.data||[]).map(x=>x.lesson_code));
 const resources=$('resource-list');resources.replaceChildren();
 (r.data||[]).forEach(item=>{
  const a=document.createElement('a');a.href=item.url||'#';a.rel='noopener noreferrer';a.target='_blank';a.className='resource';
  if(!item.url || !/^https:\/\//i.test(item.url)){a.removeAttribute('href');a.removeAttribute('target');}
  escapedText(a,'span',asAdmin?(item.status==='ready'?'MATERIAL APROBADO':'EN PREPARACIÓN'):'GUÍA / MATERIAL','resource-tag');
  escapedText(a,'strong',item.title);escapedText(a,'span',item.url?'Abrir ↗':'En preparación','resource-link');
  resources.appendChild(a);
 });
 $('empty-resources').hidden=Boolean((r.data||[]).length);
 $('admin-preview-banner').hidden=!asAdmin;
 $('student-progress').hidden=asAdmin;
 $('progress-label').hidden=asAdmin;
 $('progress-percent').hidden=asAdmin;
 $('lesson-celebration').hidden=true;
 display(course);status(asAdmin?'Vista administrativa: borradores visibles solo para ti. Sin cambios al progreso de alumnos.':'Acceso verificado.',true);lessonsUI();
 if(user){await loadMemberName(user,asAdmin);if(!asAdmin)await checkProjectShared();}
}
async function refreshAuth(){
 try{
  const {data:{user:who},error}=await db.auth.getUser();
  if(error && !/Auth session missing/i.test(error.message||''))throw error;
  if(!who){out.hidden=true;display(login);status('Entra con el correo que usaste en la compra.');return;}
  user=who;out.hidden=false;status('Comprobando permisos…');
  const owner=await isAuthorizedOwner(who);
  if(!owner&&!who.email_confirmed_at){display(noAccess);status('Confirma tu correo antes de entrar al aula.');return;}
  await showCourse((who.email||'').trim().toLowerCase(),owner);
 }catch(e){display(login);status('No pudimos comprobar el acceso en este momento. Actualiza la página o pide ayuda si continúa.');console.error('Course portal auth check error',e?.code||'unknown');}
}
$('login-form').addEventListener('submit',async e=>{
 e.preventDefault();
 const button=$('login-form').querySelector('button');button.disabled=true;status('Enviando enlace de acceso…');
 try{
  const email=$('login-email').value.trim().toLowerCase();
  const {error}=await db.auth.signInWithOtp({
    email,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:true}
  });
  if(error)throw error;
  status('Si existe una cuenta con ese correo, recibirás un enlace para entrar. Ábrelo desde el mismo navegador. Si no llega, consulta Ayuda.');
 }catch(e){status('No se pudo solicitar el acceso. Revisa la dirección y vuelve a intentarlo.');}
 finally{button.disabled=false;}
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
 if(!document.hidden&&!adminPreview&&user&&!course.hidden)void checkProjectShared();
});
out.addEventListener('click',async()=>{
 if(adminPreview){location.assign('../estudio/');return;}
 await db.auth.signOut();location.replace('./');
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

await refreshAuth();
db.auth.onAuthStateChange((_event,session)=>{if(session?.user && session.user.id!==user?.id)window.setTimeout(()=>void refreshAuth(),0);});

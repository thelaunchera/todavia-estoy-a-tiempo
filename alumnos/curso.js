import {supabaseUrl,supabasePublishableKey,courseId} from '../clases/course-config.js';
const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm');
const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const message=$('room-message'),login=$('login-panel'),noAccess=$('no-access'),course=$('class-content');
const out=$('logout');
let user=null,lessons=[],done=new Set(),selected=0;
function status(text,ok=false){message.textContent=text;message.dataset.ok=ok?'true':'false';}
function display(panel){[login,noAccess,course].forEach(el=>el.hidden=(el!==panel));}
function validVideoId(id){return typeof id==='string' && /^[A-Za-z0-9_-]{11}$/.test(id);}
function escapedText(parent,tag,value,klass){const node=document.createElement(tag);node.textContent=value;if(klass)node.className=klass;parent.appendChild(node);return node;}
function setProgress(){
 const total=lessons.length;
 const n=lessons.filter(l=>done.has(l.lesson_code)).length;
 $('progress-label').textContent=n+' de '+total+' lecciones disponibles completadas';
 $('progress-bar').style.width=(total?100*n/total:0)+'%';
}
function choose(i){
 selected=i;
 const item=lessons[i];
 if(!item || !validVideoId(item.youtube_video_id))return;
 const box=$('lesson-player');box.replaceChildren();box.hidden=false;
 const frame=document.createElement('iframe');
 frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(item.youtube_video_id)+'?rel=0';
 frame.title='Video '+item.lesson_code+' · '+item.title;
 frame.loading='lazy';frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
 frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;
 box.appendChild(frame);
 $('lesson-number').textContent='VIDEO '+item.lesson_code;
 $('lesson-title').textContent=item.title;
 $('lesson-description').textContent=item.description;
 $('lesson-done').checked=done.has(item.lesson_code);
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
async function showCourse(email){
 const {data:entitlement,error:lookupError}=await db.from('podcast_class_access').select('status').eq('course_id',courseId).eq('buyer_email',email).maybeSingle();
 if(lookupError)throw lookupError;
 if(entitlement?.status!=='active'){
  display(noAccess);status('Acceso pendiente de compra verificada.');return;
 }
 const [l,r,p]=await Promise.all([
 db.from('podcast_class_lessons').select('lesson_code,position,title,minutes,description,youtube_video_id').eq('course_id',courseId).order('position',{ascending:true}),
 db.from('podcast_class_resources').select('resource_code,title,url').eq('course_id',courseId).order('resource_code'),
 db.from('podcast_class_progress').select('lesson_code').eq('course_id',courseId).eq('buyer_email',email)
 ]);
 if(l.error||r.error||p.error)throw l.error||r.error||p.error;
 lessons=l.data||[];done=new Set((p.data||[]).map(x=>x.lesson_code));
 const resources=$('resource-list');resources.replaceChildren();
 (r.data||[]).forEach(item=>{
  const a=document.createElement('a');a.href=item.url;a.rel='noopener noreferrer';a.target='_blank';a.className='resource';
  escapedText(a,'span','GUÍA / MATERIAL','resource-tag');escapedText(a,'strong',item.title);escapedText(a,'span','Abrir ↗','resource-link');
  resources.appendChild(a);
 });
 $('empty-resources').hidden=Boolean((r.data||[]).length);
 display(course);status('Acceso verificado.',true);lessonsUI();
}
async function refreshAuth(){
 try{
  const {data:{user:who},error}=await db.auth.getUser();
  if(error && !/Auth session missing/i.test(error.message||''))throw error;
  if(!who){out.hidden=true;display(login);status('Entra con el correo que usaste en la compra.');return;}
  user=who;out.hidden=false;status('Comprobando tu compra…');
  await showCourse((who.email||'').trim().toLowerCase());
 }catch(e){display(login);status('No pudimos comprobar el acceso en este momento. Actualiza la página o pide ayuda si continúa.');console.error('Course portal auth check error',e?.code||'unknown');}
}
$('login-form').addEventListener('submit',async e=>{
 e.preventDefault();
 const button=$('login-form').querySelector('button');button.disabled=true;status('Enviando enlace de acceso…');
 try{
  const email=$('login-email').value.trim().toLowerCase();
  const {error}=await db.auth.signInWithOtp({
    email,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:false}
  });
  if(error)throw error;
  status('Si existe una cuenta con ese correo, recibirás un enlace para entrar. Ábrelo desde el mismo navegador. Si no llega, consulta Ayuda.');
 }catch(e){status('No se pudo solicitar el acceso. Revisa la dirección y vuelve a intentarlo.');}
 finally{button.disabled=false;}
});
$('lesson-done').addEventListener('change',async e=>{
 const box=e.currentTarget;const item=lessons[selected];if(!user||!item)return;
 box.disabled=true;
 const email=(user.email||'').trim().toLowerCase();
 const values={course_id:courseId,buyer_email:email,lesson_code:item.lesson_code};
 try{
  const response=box.checked ? await db.from('podcast_class_progress').insert(values) :
   await db.from('podcast_class_progress').delete().eq('course_id',courseId).eq('buyer_email',email).eq('lesson_code',item.lesson_code);
  if(response.error && !(box.checked&&response.error.code==='23505'))throw response.error;
  if(box.checked)done.add(item.lesson_code);else done.delete(item.lesson_code);
  setProgress();
 }catch{box.checked=!box.checked;status('No pudimos guardar tu avance. Vuelve a intentarlo.');}
 finally{box.disabled=false;}
});
$('lesson-next').addEventListener('click',()=>choose(Math.min(selected+1,lessons.length-1)));
out.addEventListener('click',async()=>{await db.auth.signOut();location.replace('./');});
await refreshAuth();
db.auth.onAuthStateChange((_event,session)=>{if(session?.user && session.user.id!==user?.id)window.setTimeout(()=>void refreshAuth(),0);});

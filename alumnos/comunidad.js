import {supabaseUrl,supabasePublishableKey,courseId} from '../clases/course-config.js';
const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm');
const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const state={user:null,owner:false,courses:[],profile:null,channel:'charla',scope:'all',posts:[],comments:[],likes:[],profiles:new Map(),images:new Map(),reports:[],busy:false};
const bucket='podcast-club-projects',marker='podcast_studio_password_login_deadline_v1';
const channelNames={charla:'Comunidad',proyectos:'Proyectos',preguntas:'Preguntas'};
const scopeName=post=>post.scope==='club'?'Todo el club':'Clase 01';
function sessionIsStudioOwner(id){
 try{const v=JSON.parse(localStorage.getItem(marker)||'null');return v?.userId===id && Number(v.expiresAt)>Date.now();}
 catch{return false;}
}
function message(value,kind=''){
 const p=$('club-feedback');p.textContent=value;p.dataset.kind=kind;
}
function node(tag,className,textValue){
 const x=document.createElement(tag);if(className)x.className=className;
 if(textValue!==undefined && textValue!==null)x.textContent=String(textValue);
 return x;
}
function button(text,onClick,cls=''){
 const b=node('button',cls,text);b.type='button';b.addEventListener('click',onClick);return b;
}
function nameOf(id){return state.owner && id===state.user?.id?'Dailin · Anfitriona':state.profiles.get(id)||'Miembro del club';}
function dateOf(value){return new Date(value).toLocaleDateString('es',{day:'numeric',month:'short',year:'numeric'});}
function showLocked(reason){
 $('club-members').hidden=true;$('club-locked').hidden=false;
 $('club-locked-message').textContent=reason;
 message('No se ha podido abrir la comunidad.','error');
}
function validName(s){return s.length>=2&&s.length<=32&&!s.includes('@');}
function validUrl(s){
 try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname.includes('.')&&s.length<=500;}
 catch{return false;}
}
function checkedImage(){
 const f=$('club-post-image').files?.[0];if(!f)return null;
 if(!['image/png','image/jpeg','image/webp'].includes(f.type))throw new Error('Usa una captura PNG, JPG o WebP.');
 if(f.size>5242880)throw new Error('La imagen supera los 5 MB permitidos.');
 return f;
}
let previewObjectUrl=null;
function clearImage(){
 $('club-post-image').value='';$('club-image-label').textContent='PNG, JPG o WebP · máximo 5 MB';
 $('club-image-preview').hidden=true;
 if(previewObjectUrl){URL.revokeObjectURL(previewObjectUrl);previewObjectUrl=null;}
}
$('club-post-image').addEventListener('change',()=>{
 try{
  const f=checkedImage();if(!f){clearImage();return;}
  if(previewObjectUrl)URL.revokeObjectURL(previewObjectUrl);
  previewObjectUrl=URL.createObjectURL(f);
  $('club-image-preview').querySelector('img').src=previewObjectUrl;
  $('club-image-preview').hidden=false;
  $('club-image-label').textContent=f.name+' · '+(f.size/1048576).toFixed(1)+' MB';
 }catch(e){clearImage();message(e.message,'error');}
});
$('club-clear-image').addEventListener('click',clearImage);
async function access(){
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user){showLocked('Abre este espacio desde tu Centro de alumnos. Debes tener una sesión iniciada.');return false;}
 state.user=user;
 const admin=await db.from('podcast_studio_admins').select('role').eq('user_id',user.id).maybeSingle();
 if(admin.error)throw admin.error;
 state.owner=admin.data?.role==='owner'&&sessionIsStudioOwner(user.id);
 if(!state.owner){
  const q=await db.from('podcast_class_access').select('course_id').eq('buyer_email',(user.email||'').trim().toLowerCase()).eq('status','active').is('revoked_at',null);
  if(q.error)throw q.error;
  state.courses=(q.data||[]).map(x=>x.course_id);
  if(!state.courses.length){showLocked('Para participar necesitas una compra verificada de alguna clase. La lista de espera no otorga acceso a la comunidad.');return false;}
 }else state.courses=[courseId];
 return true;
}
async function loadMyProfile(){
 const res=await db.from('podcast_club_profiles').select('display_name').eq('user_id',state.user.id).maybeSingle();
 if(res.error)throw res.error;
 state.profile=res.data?.display_name||null;
 $('club-display-name').value=state.profile||(state.owner?'Dailin':'');
}
$('club-save-name').addEventListener('click',async()=>{
 const name=$('club-display-name').value.trim().replace(/\s+/g,' ');
 if(!validName(name)){message('Usa un nombre o apodo de 2 a 32 caracteres, sin dirección de correo.','error');return;}
 const b=$('club-save-name');b.disabled=true;
 try{
  const {error}=await db.from('podcast_club_profiles').upsert({user_id:state.user.id,display_name:name,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(error)throw error;
  state.profile=name;state.profiles.set(state.user.id,name);
  message('Nombre guardado. Así te verán las personas del club.','good');render();
 }catch(e){message('No se pudo guardar el nombre. '+(e.message||''),'error');}
 finally{b.disabled=false;}
});
async function uploadScreenshot(file){
 const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
 const path=state.user.id+'/'+crypto.randomUUID()+'.'+ext;
 const {error}=await db.storage.from(bucket).upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
 if(error)throw new Error('La captura no se pudo subir. Comprueba el formato y vuelve a intentar.');
 return path;
}
$('club-post-form').addEventListener('submit',async ev=>{
 ev.preventDefault();if(state.busy)return;
 if(!state.profile){message('Primero guarda tu nombre o apodo para que podamos reconocer tus publicaciones.','error');$('club-display-name').focus();return;}
 const body=$('club-post-body').value.trim(),title=$('club-post-title').value.trim(),url=$('club-post-url').value.trim();
 const scope=$('club-post-scope').value;
 if(body.length<2||body.length>2000){message('Escribe entre 2 y 2000 caracteres.','error');return;}
 if(url&&!validUrl(url)){message('El enlace de tu proyecto debe comenzar con https:// y ser una web válida.','error');return;}
 if(scope==='curso'&&!state.courses.includes(courseId)){message('No tienes acceso a esa clase.','error');return;}
 let imagePath=null;state.busy=true;$('club-submit').disabled=true;$('club-submit').textContent='Publicando…';
 try{
  const file=checkedImage();if(file)imagePath=await uploadScreenshot(file);
  const row={author_id:state.user.id,scope,course_id:scope==='curso'?courseId:null,channel:state.channel,title:title||null,body,project_url:url||null,image_path:imagePath};
  const {error}=await db.from('podcast_club_posts').insert(row);
  if(error)throw error;
  $('club-post-form').reset();clearImage();
  message('¡Tu publicación ya forma parte del club! ✨','good');await loadFeed();
 }catch(e){
  if(imagePath)await db.storage.from(bucket).remove([imagePath]).catch(()=>{});
  message(e.message||'No pudimos publicar. Prueba otra vez.','error');
 }finally{state.busy=false;$('club-submit').disabled=false;$('club-submit').textContent='Publicar en el club ↗';}
});
function updateComposerChannel(){
 $('club-compose-heading').textContent=state.channel==='proyectos'?'Muéstranos tu proyecto':state.channel==='preguntas'?'¿Qué necesitas resolver?':'¿Qué estás creando?';
 $('club-post-body').placeholder=state.channel==='proyectos'?'Así va mi proyecto. Me gustaría recibir opiniones sobre…':state.channel==='preguntas'?'Estoy haciendo mi web y necesito ayuda con…':'Hoy avancé con mi primera landing…';
 $('club-feed-title').textContent=channelNames[state.channel];
 document.querySelectorAll('[data-channel]').forEach(el=>{const yes=el.dataset.channel===state.channel;el.classList.toggle('active',yes);el.setAttribute('aria-selected',String(yes));});
 render();
}
document.querySelectorAll('[data-channel]').forEach(el=>el.addEventListener('click',()=>{state.channel=el.dataset.channel;updateComposerChannel();}));
$('club-view-scope').addEventListener('change',e=>{state.scope=e.target.value;render();});
$('club-refresh').addEventListener('click',()=>void loadFeed(true));
async function loadFeed(showInfo=false){
 if(!state.user)return;
 const p=await db.from('podcast_club_posts').select('id,author_id,scope,course_id,channel,title,body,project_url,image_path,status,created_at').order('created_at',{ascending:false}).limit(60);
 if(p.error)throw p.error;
 state.posts=p.data||[];
 const ids=state.posts.map(x=>x.id);
 if(!ids.length){state.comments=[];state.likes=[];state.images=new Map();state.reports=[];render();if(showInfo)message('Comunidad actualizada.','good');return;}
 const [cr,lr,rr]=await Promise.all([
   db.from('podcast_club_comments').select('id,post_id,author_id,body,status,created_at').in('post_id',ids).order('created_at',{ascending:true}).limit(400),
   db.from('podcast_club_likes').select('post_id,author_id').in('post_id',ids).limit(1500),
   state.owner?db.from('podcast_club_reports').select('id,post_id,reason,created_at').in('post_id',ids).limit(200):Promise.resolve({data:[],error:null})
 ]);
 if(cr.error||lr.error||rr.error)throw cr.error||lr.error||rr.error;
 state.comments=cr.data||[];state.likes=lr.data||[];state.reports=rr.data||[];
 const authors=[...new Set([state.user.id,...state.posts.map(x=>x.author_id),...state.comments.map(x=>x.author_id)])];
 const profiles=await db.from('podcast_club_profiles').select('user_id,display_name').in('user_id',authors);
 if(profiles.error)throw profiles.error;
 state.profiles=new Map((profiles.data||[]).map(x=>[x.user_id,x.display_name]));
 const paths=[...new Set(state.posts.map(x=>x.image_path).filter(Boolean))];
 const signed=await Promise.all(paths.map(async path=>{
  const {data,error}=await db.storage.from(bucket).createSignedUrl(path,1800);
  return [path,error?null:data?.signedUrl||null];
 }));
 state.images=new Map(signed);
 render();if(showInfo)message('Comunidad actualizada.','good');
}
async function like(post){
 const exists=state.likes.some(x=>x.post_id===post.id&&x.author_id===state.user.id);
 try{
  const action=exists?db.from('podcast_club_likes').delete().eq('post_id',post.id).eq('author_id',state.user.id):db.from('podcast_club_likes').insert({post_id:post.id,author_id:state.user.id});
  const {error}=await action;if(error)throw error;await loadFeed();
 }catch(e){message('No se pudo guardar el me gusta. '+(e.message||''),'error');}
}
async function comment(post,input,submit){
 if(!state.profile){message('Guarda tu nombre antes de comentar.','error');$('club-display-name').focus();return;}
 const body=input.value.trim();if(body.length<2||body.length>700){message('Tu comentario debe tener entre 2 y 700 caracteres.','error');return;}
 submit.disabled=true;
 try{
  const {error}=await db.from('podcast_club_comments').insert({post_id:post.id,author_id:state.user.id,body});
  if(error)throw error;
  message('Comentario enviado.','good');await loadFeed();
 }catch(e){message('No se pudo publicar el comentario. '+(e.message||''),'error');submit.disabled=false;}
}
async function report(post){
 const reason=window.prompt('¿Qué deberíamos revisar de esta publicación? Describe el motivo brevemente.');
 if(reason===null)return;
 const clean=reason.trim();if(clean.length<4||clean.length>300){message('Escribe un motivo de 4 a 300 caracteres.','error');return;}
 const {error}=await db.from('podcast_club_reports').insert({post_id:post.id,reporter_id:state.user.id,reason:clean});
 if(error){message(error.code==='23505'?'Ya reportaste esta publicación.':'No se pudo enviar el reporte.','error');return;}
 message('Gracias. El reporte está disponible para moderación.','good');
}
async function hide(post){
 const target=post.status==='oculto'?'visible':'oculto';
 if(!window.confirm(target==='oculto'?'¿Ocultar esta publicación a los alumnos?':'¿Restaurar esta publicación en el club?'))return;
 const {error}=await db.from('podcast_club_posts').update({status:target,updated_at:new Date().toISOString()}).eq('id',post.id);
 if(error){message('No se pudo moderar la publicación.','error');return;}
 await loadFeed();message('Moderación guardada.','good');
}
async function removePost(post){
 if(!window.confirm('¿Eliminar definitivamente tu publicación y todos sus comentarios?'))return;
 const {error}=await db.from('podcast_club_posts').delete().eq('id',post.id);
 if(error){message('No se pudo eliminar la publicación.','error');return;}
 if(post.image_path)await db.storage.from(bucket).remove([post.image_path]);
 await loadFeed();message('Publicación eliminada.','good');
}
async function removeComment(c){
 const {error}=await db.from('podcast_club_comments').delete().eq('id',c.id);
 if(error){message('No se pudo quitar el comentario.','error');return;}
 await loadFeed();
}
function render(){
 const target=$('club-feed');target.replaceChildren();
 const posts=state.posts.filter(p=>p.channel===state.channel&&(state.scope==='all'||p.scope===state.scope));
 $('club-feed-empty').hidden=Boolean(posts.length);
 for(const post of posts){
  const article=node('article','club-post');
  const top=node('div','club-post-top');
  const avatar=node('div','club-avatar',(nameOf(post.author_id)||'M').trim().charAt(0).toUpperCase());
  avatar.setAttribute('aria-hidden','true');
  const author=node('div','club-post-author');
  author.append(node('strong','',nameOf(post.author_id)),node('small','',dateOf(post.created_at)+' · '+scopeName(post)+(post.status==='oculto'?' · Oculto':'')));
  top.append(avatar,author,node('span','club-post-tag',channelNames[post.channel]||'Comunidad'));article.append(top);
  if(post.title)article.append(node('h3','',post.title));
  article.append(node('p','club-post-body',post.body));
  if(post.image_path&&state.images.get(post.image_path)){
    const im=node('img','club-post-image');im.src=state.images.get(post.image_path);im.alt='Captura compartida del proyecto de '+nameOf(post.author_id);im.loading='lazy';article.append(im);
  }
  if(post.project_url&&validUrl(post.project_url)){
    const a=node('a','club-post-link','Ver el proyecto ↗');
    a.href=post.project_url;a.target='_blank';a.rel='nofollow noopener noreferrer';article.append(a);
  }
  const actions=node('div','club-post-actions');
  const count=state.likes.filter(x=>x.post_id===post.id).length;
  const liked=state.likes.some(x=>x.post_id===post.id&&x.author_id===state.user.id);
  actions.append(button((liked?'♥':'♡')+' '+count+' Me gusta',()=>void like(post),liked?'liked':''));
  const cs=state.comments.filter(x=>x.post_id===post.id&&x.status==='visible').length;
  actions.append(node('span','club-post-tag',cs+' comentarios'));
  if(state.owner){
   const reports=state.reports.filter(x=>x.post_id===post.id);
   if(reports.length)actions.append(node('span','club-post-tag','⚑ '+reports.length+' reportes'));
   actions.append(button(post.status==='oculto'?'Restaurar':'Ocultar',()=>void hide(post),'club-moderate'));
  }else if(post.author_id!==state.user.id)actions.append(button('Reportar',()=>void report(post)));
  if(post.author_id===state.user.id||state.owner)actions.append(button('Eliminar',()=>void removePost(post),'club-moderate'));
  article.append(actions);
  const thread=node('div','club-comments');
  const related=state.comments.filter(x=>x.post_id===post.id && (x.status==='visible'||state.owner));
  for(const c of related){
   const line=node('div','club-comment');const copy=node('div');
   const lead=node('div');lead.append(node('strong','',nameOf(c.author_id)),node('time','',dateOf(c.created_at)+(c.status==='oculto'?' · Oculto':'')));
   copy.append(lead,node('p','',c.body));line.append(copy);
   if(c.author_id===state.user.id||state.owner)line.append(button('Eliminar',()=>void removeComment(c)));
   thread.append(line);
  }
  if(post.status==='visible'){
   const form=node('form','club-comment-form');
   const input=node('input');input.type='text';input.maxLength=700;input.minLength=2;input.required=true;input.placeholder='Escribe un comentario útil…';input.setAttribute('aria-label','Comentar esta publicación');
   const send=node('button','','Enviar');send.type='submit';
   form.append(input,send);
   form.addEventListener('submit',ev=>{ev.preventDefault();void comment(post,input,send);});
   thread.append(form);
  }
  article.append(thread);target.append(article);
 }
}
async function init(){
 try{
  const allowed=await access();if(!allowed)return;
  $('club-members').hidden=false;$('club-locked').hidden=true;$('club-studio-link').hidden=!state.owner;
  $('club-admin-banner').hidden=!state.owner;
  if(!state.owner&&!state.courses.includes(courseId)){
   $('club-post-scope').querySelector('[value=curso]').disabled=true;
   $('club-view-scope').querySelector('[value=curso]').disabled=true;
  }
  await loadMyProfile();await loadFeed();message('Qué bueno verte en el Club de Ideas. Este espacio es privado para miembros.','good');
 }catch(e){console.error('Community init failed',e?.code||e?.message||'unknown');showLocked('No pudimos comprobar tus permisos. Actualiza la página y vuelve a entrar desde tu aula.');}
}
await init();
// Supabase Realtime notifies the club about new posts, comments and reactions.
// All actual content is re-read through member-scoped RLS policies.
let realtimeRefresh=null;
function refreshOnCommunityEvent(){
 if(!state.user||document.visibilityState==='hidden'||state.busy)return;
 if(document.activeElement?.matches('input,textarea,select'))return;
 if(realtimeRefresh)clearTimeout(realtimeRefresh);
 realtimeRefresh=setTimeout(()=>{
  realtimeRefresh=null;void loadFeed().catch(()=>{});
 },750);
}
if(state.user){
 db.channel('podcast-club-live')
  .on('postgres_changes',{event:'*',schema:'public',table:'podcast_club_posts'},refreshOnCommunityEvent)
  .on('postgres_changes',{event:'*',schema:'public',table:'podcast_club_comments'},refreshOnCommunityEvent)
  .on('postgres_changes',{event:'*',schema:'public',table:'podcast_club_likes'},refreshOnCommunityEvent)
  .subscribe();
}
// Refresh only when not editing; preserve unfinished messages and scroll.
window.setInterval(()=>{
 if(!state.user||document.visibilityState!=='visible'||state.busy)return;
 if(document.activeElement?.matches('input,textarea,select'))return;
 void loadFeed().catch(()=>{});
},45000);

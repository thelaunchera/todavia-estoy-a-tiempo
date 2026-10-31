import {supabaseUrl,supabasePublishableKey} from '../clases/course-config.js';
const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm');
const db=createClient(supabaseUrl,supabasePublishableKey,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});
const $=id=>document.getElementById(id);
const REMEMBER_KEY='podcast_class_remember_24h_v1';
const TAB_KEY='podcast_class_tab_24h_v1';
const STUDIO_KEY='podcast_studio_password_login_deadline_v1';
const DAY=24*60*60*1000;
let profile=null,owner=false,ready=false,recovery=false,pending=false;
let purchased=new Set(),releases={'web-class':false,'content-lab':false};
const releaseLinks={'web-class':'../alumnos/','content-lab':'../content-lab/'};
const friendly={'web-class':'Tu primera web con IA','content-lab':'Content Lab','no-voy-tarde':'No voy tarde','empezar-de-nuevo':'Empezar de nuevo','tle-service':'Servicio TLE'};

function record(storage,key){
 try{
  const value=JSON.parse(storage.getItem(key)||'null');
  return value&&typeof value.userId==='string'&&Number.isFinite(value.expiresAt)?value:null;
 }catch{return null;}
}
function validMarker(userId){
 const marks=[record(sessionStorage,TAB_KEY),record(localStorage,REMEMBER_KEY)];
 return marks.some(x=>x&&x.userId===userId&&x.expiresAt>Date.now());
}
function validStudioMarker(userId){const x=record(localStorage,STUDIO_KEY);return x?.userId===userId&&x.expiresAt>Date.now();}
function clearMarkers(){
 try{localStorage.removeItem(REMEMBER_KEY);sessionStorage.removeItem(TAB_KEY);}catch{}
}
function storeMarker(userId,remember){
 const v=JSON.stringify({userId,expiresAt:Date.now()+DAY});
 try{
  clearMarkers();
  (remember?localStorage:sessionStorage).setItem(remember?REMEMBER_KEY:TAB_KEY,v);
  return true;
 }catch{return false;}
}
function message(text){$('auth-message').textContent=text||'';}
function showModal(on=true){
 $('access-overlay').hidden=!on;
 document.body.classList.toggle('modal-open',on);
 if(on)window.setTimeout(()=>$('login-email').focus(),0);
}
function mode(m){
 for(const type of ['login','register','recover','update'])$('form-'+type).hidden=m!==type;
 $('auth-tabs').hidden=m==='update'||m==='recover';
 document.querySelectorAll('[data-mode]').forEach(b=>{if(b.dataset.mode==='login'||b.dataset.mode==='register')b.setAttribute('aria-pressed',String(b.dataset.mode===m));});
 const copy={login:['Bienvenida de nuevo.','Usa el correo de tu compra y tu contraseña.'],register:['Tu cuenta comienza aquí.','Crea una contraseña con el mismo correo que usaste al comprar.'],recover:['Recupera tu acceso.','Enviaremos un correo con el enlace de recuperación.'],update:['Elige una contraseña nueva.','Tu cuenta estará lista cuando la guardes.']};
 $('auth-title').textContent=copy[m][0];$('auth-copy').textContent=copy[m][1];
 message('');
}
async function runForm(form,action){
 if(pending)return;
 const btn=form.querySelector('[type=submit]');
 pending=true;btn.disabled=true;
 try{await action();}
 finally{pending=false;btn.disabled=false;}
}
async function isOwner(userId){
 const {data,error}=await db.from('podcast_studio_admins').select('role').eq('user_id',userId).maybeSingle();
 if(error)return false;
 return data?.role==='owner';
}
function setCourseActions(){
 for(const code of ['web-class','content-lab']){
  const el=$('action-'+code),state=$('status-'+code);
  const has=purchased.has(code),open=!!releases[code];
  if(owner){
   state.textContent='VISTA ADMINISTRATIVA';
   if(code==='web-class'){
    el.disabled=false;el.textContent='Abrir mi Estudio para revisar ↗';
    el.onclick=()=>location.assign('../estudio/');
   }else{
    el.disabled=false;el.textContent='Revisar Content Lab ↗';
    el.onclick=()=>location.assign('../content-lab/');
   }
   continue;
  }
  if(!open){
   state.textContent=has?'COMPRADO · EN PREPARACIÓN':'TODAVÍA CERRADO';
   el.textContent=has?'Compra confirmada · acceso pendiente':'Acceso todavía cerrado';
   el.disabled=true;el.onclick=null;
  }else if(has){
   state.textContent='TU PRODUCTO';
   el.textContent='Entrar ahora →';el.disabled=false;
   el.onclick=()=>location.assign(releaseLinks[code]);
  }else{
   state.textContent='NO ADQUIRIDO';
   el.disabled=true;el.textContent='Producto no adquirido';
   el.onclick=null;
  }
 }
 for(const code of ['no-voy-tarde','empezar-de-nuevo']){
  const badge=$('status-'+code),has=purchased.has(code);
  badge.hidden=!has;badge.textContent=has?'COMPRADO · ENTREGA POR CORREO':'';
 }
}
function renderOwnerLibrary(){
 const wrap=$('my-library'),list=$('owned-chips');
 list.replaceChildren();
 if(!profile){wrap.hidden=true;return;}
 wrap.hidden=false;
 const titles=[...purchased].filter(code=>friendly[code]).map(code=>friendly[code]);
 if(owner){$('ownership-message').textContent='Vista de administración. Puedes revisar el centro sin activar compras ni accesos.';titles.unshift('Vista de administración');}
 else if(titles.length){$('ownership-message').textContent='Estos productos tienen una compra verificada para tu correo. Los que están en preparación siguen cerrados.';}
 else{$('ownership-message').textContent='Todavía no hay compras verificadas con este correo. Si acabas de comprar, revisa tu confirmación.';}
 for(const title of titles){const chip=document.createElement('span');chip.textContent=title;list.append(chip);}
 if(!titles.length){const chip=document.createElement('span');chip.textContent='Explora el catálogo ↓';list.append(chip);}
}
function updateNav(){
 $('account-name').hidden=!profile;$('account-name').textContent=profile?.email||'';
 $('open-access').hidden=!!profile;$('signout').hidden=!profile;
 $('hero-account').textContent=profile?'Ver mi biblioteca ↗':'Ver mis compras ↗';
}
function resetState(){
 profile=null;owner=false;ready=false;purchased=new Set();releases={'web-class':false,'content-lab':false};
 updateNav();renderOwnerLibrary();setCourseActions();
}
async function refresh(){
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user){resetState();return;}
 const admin=await isOwner(user.id);
 if(!validMarker(user.id)&&!(admin&&validStudioMarker(user.id))){
  resetState();clearMarkers();
  await db.auth.signOut({scope:'local'});
  return;
 }
 profile=user;owner=admin;ready=false;
 const [orders,flags]=await Promise.all([
  db.from('podcast_hub_entitlements').select('product_code,status').eq('buyer_email',(user.email||'').toLowerCase()).eq('status','active'),
  db.from('podcast_hub_releases').select('product_code,access_enabled')
 ]);
 if(orders.error||flags.error){
  resetState();
  showModal(true);message('No pudimos verificar tus compras. Intenta de nuevo o solicita ayuda.');
  return;
 }
 purchased=new Set((orders.data||[]).map(x=>x.product_code));
 for(const item of flags.data||[])if(Object.hasOwn(releases,item.product_code))releases[item.product_code]=item.access_enabled===true;
 ready=true;updateNav();setCourseActions();renderOwnerLibrary();showModal(false);
}
$('open-access').addEventListener('click',()=>{mode('login');showModal(true);});
$('hero-account').addEventListener('click',()=>{
 if(profile){$('my-library').scrollIntoView({behavior:'smooth'});}
 else{mode('login');showModal(true);}
});
$('close-access').addEventListener('click',()=>showModal(false));
$('close-backdrop').addEventListener('click',()=>showModal(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('access-overlay').hidden)showModal(false)});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.mode)));
$('form-login').addEventListener('submit',async e=>{
 e.preventDefault();
 await runForm(e.currentTarget,async()=>{
  message('Verificando tu cuenta…');
  const email=$('login-email').value.trim().toLowerCase(),password=$('login-password').value;
  const {data,error}=await db.auth.signInWithPassword({email,password});
  if(error||!data?.user){message('No pudimos entrar. Revisa el correo y la contraseña.');return;}
  if(!storeMarker(data.user.id,$('remember-24h').checked)){
   await db.auth.signOut({scope:'local'});message('Habilita el almacenamiento del navegador para iniciar sesión.');return;
  }
  $('login-password').value='';
  await refresh();
 });
});
$('form-register').addEventListener('submit',async e=>{
 e.preventDefault();
 await runForm(e.currentTarget,async()=>{
  message('Preparando tu cuenta…');
  const {data,error}=await db.auth.signUp({
   email:$('register-email').value.trim().toLowerCase(),password:$('register-password').value,
   options:{emailRedirectTo:location.origin+'/centro/?acceso=1'}
  });
  if(error){message('No pudimos crear la cuenta. Usa al menos ocho caracteres y revisa tus datos.');return;}
  if(data?.session)await db.auth.signOut({scope:'local'});
  $('register-password').value='';
  message('Revisa tu correo para confirmar la cuenta. Después podrás iniciar sesión y ver tus compras verificadas.');
 });
});
$('form-recover').addEventListener('submit',async e=>{
 e.preventDefault();
 await runForm(e.currentTarget,async()=>{
  const {error}=await db.auth.resetPasswordForEmail($('recover-email').value.trim().toLowerCase(),{
   redirectTo:location.origin+'/centro/?acceso=1'
  });
  message(error?'No pudimos solicitar el enlace. Inténtalo de nuevo.':'Si existe una cuenta con ese correo, enviaremos un enlace para recuperar la contraseña.');
 });
});
$('form-update').addEventListener('submit',async e=>{
 e.preventDefault();
 await runForm(e.currentTarget,async()=>{
  if($('update-password').value!==$('update-confirm').value){message('Las contraseñas no coinciden.');return;}
  const {error}=await db.auth.updateUser({password:$('update-password').value});
  if(error){message('No pudimos guardar la contraseña. Solicita un enlace nuevo.');return;}
  $('update-password').value='';$('update-confirm').value='';recovery=false;
  clearMarkers();await db.auth.signOut({scope:'local'});resetState();
  mode('login');message('Contraseña guardada. Ya puedes iniciar sesión.');
 });
});
$('signout').addEventListener('click',async()=>{
 clearMarkers();await db.auth.signOut({scope:'local'});resetState();
});
db.auth.onAuthStateChange((event)=>{
 if(event==='PASSWORD_RECOVERY'){recovery=true;mode('update');showModal(true);message('Enlace confirmado. Guarda tu contraseña nueva.');}
 if(event==='SIGNED_OUT')resetState();
});
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden&&profile)void refresh();
});
window.setInterval(()=>{
 if(profile&&!validMarker(profile.id)&&!(owner&&validStudioMarker(profile.id))){
  clearMarkers();db.auth.signOut({scope:'local'}).then(resetState);
 }
},60000);
resetState();
if(new URL(location.href).searchParams.has('acceso')){mode('login');showModal(true);}
await refresh();

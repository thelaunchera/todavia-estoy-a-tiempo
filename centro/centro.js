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
const ACTIVITY_PREFIX='tle-product-last-activity-v1:';
let lastMarkedAt=0;
let profile=null,owner=false,ready=false,recovery=false,pending=false,pendingOtpEmail='';
let purchased=new Set(),releases={'web-class':false,'content-lab':false};
const releaseLinks={'web-class':'../alumnos/','content-lab':'../content-lab/'};
const friendly={'web-class':'Tu primera web con IA','content-lab':'Content Lab','no-voy-tarde':'No voy tarde','empezar-de-nuevo':'Empezar de nuevo','tle-service':'Servicio TLE'};

function record(storage,key){
 try{
  const value=JSON.parse(storage.getItem(key)||'null');
  return value&&typeof value.userId==='string'&&Number.isFinite(value.expiresAt)?value:null;
 }catch{return null;}
}
function lastActivity(userId){
 try{const raw=localStorage.getItem(ACTIVITY_PREFIX+userId);return raw===null?null:Number(raw)}catch{return null}
}
function idleExpired(userId){
 const last=lastActivity(userId),now=Date.now();
 return last!==null&&(!Number.isFinite(last)||last>now+120000||now-last>=DAY);
}
function noteActivity(userId,force=false){
 if(!userId||idleExpired(userId))return false;
 const now=Date.now();
 if(!force&&now-lastMarkedAt<30000)return true;
 try{localStorage.setItem(ACTIVITY_PREFIX+userId,String(now))}catch{}
 const local=record(localStorage,REMEMBER_KEY),tab=record(sessionStorage,TAB_KEY);
 try{
  if(local?.userId===userId)localStorage.setItem(REMEMBER_KEY,JSON.stringify({...local,expiresAt:now+DAY}));
  if(tab?.userId===userId)sessionStorage.setItem(TAB_KEY,JSON.stringify({...tab,expiresAt:now+DAY}));
 }catch{}
 lastMarkedAt=now;
 return true;
}
function validMarker(userId){
 const marks=[record(sessionStorage,TAB_KEY),record(localStorage,REMEMBER_KEY)];
 return !idleExpired(userId)&&marks.some(x=>x&&x.userId===userId&&x.expiresAt>Date.now());
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
  noteActivity(userId,true);
  return true;
 }catch{return false;}
}
function message(text){$('auth-message').textContent=text||'';}
let authReturnFocus=null;
function showModal(on=true){
 const overlay=$('access-overlay');
 if(on&&overlay.hidden)authReturnFocus=document.activeElement;
 overlay.hidden=!on;
 document.body.classList.toggle('modal-open',on);
 // Mantener la navegación de teclado dentro del acceso y no detrás del fondo.
 for(const selector of ['.center-nav','main','.footer']){
  const background=document.querySelector(selector);
  if(background)background.inert=on;
 }
 if(on){
  window.setTimeout(()=>{
   const visible=overlay.querySelector('.auth-form:not([hidden]) input:not([disabled])');
   (visible||$('close-access')).focus({preventScroll:true});
  },0);
 }else if(authReturnFocus?.isConnected&&!authReturnFocus.hidden){
  const target=authReturnFocus;
  authReturnFocus=null;
  window.setTimeout(()=>{if(target.offsetParent!==null)target.focus({preventScroll:true});},0);
 }
}
$('access-overlay').addEventListener('keydown',event=>{
 if(event.key!=='Tab')return;
 const focusables=[...$('access-overlay').querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')]
  .filter(node=>!node.closest('[hidden]')&&node.getClientRects().length);
 if(!focusables.length)return;
 const first=focusables[0],last=focusables[focusables.length-1];
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
function mode(m){
 for(const type of ['otp','otp-verify','login','register','recover','update'])$('form-'+type).hidden=m!==type;
 $('auth-tabs').hidden=m==='update'||m==='recover'||m==='otp-verify';
 document.querySelectorAll('[data-mode]').forEach(b=>{if(['login','register','otp'].includes(b.dataset.mode))b.setAttribute('aria-pressed',String(b.dataset.mode===m));});
 const copy={otp:['Tus productos, en un solo lugar.','Accede con el correo de tu compra, sin contraseña.'], 'otp-verify':['Revisa tu correo.','Introduce el código para abrir tu biblioteca.'],login:['Bienvenida de nuevo.','Usa el correo de tu compra y tu contraseña.'],register:['Tu cuenta comienza aquí.','Crea una contraseña con el mismo correo que usaste al comprar.'],recover:['Recupera tu acceso.','Enviaremos un correo con el enlace de recuperación.'],update:['Elige una contraseña nueva.','Tu cuenta estará lista cuando la guardes.']};
 $('auth-title').textContent=copy[m][0];$('auth-copy').textContent=copy[m][1];
 message('');
 if(!$('access-overlay').hidden){
  requestAnimationFrame(()=>{
   const field=$('access-overlay').querySelector('.auth-form:not([hidden]) input:not([disabled])');
   field?.focus({preventScroll:true});
  });
 }
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
  const has=purchased.has(code),open=code==='content-lab'&&has?true:!!releases[code];
  if(code==='content-lab'&&!owner&&!has){
   state.textContent='DISPONIBLE · $10 PAGO ÚNICO';
   el.disabled=false;el.textContent='Quiero mi Content Lab';
   el.onclick=()=>location.assign('https://buy.stripe.com/14AdR8dHp6Dnd8B1IM93y0Z');
   continue;
  }
  if(owner){
   state.textContent='VISTA ADMINISTRATIVA';
   if(code==='web-class'){
    el.disabled=false;el.textContent='Abrir mi Estudio para revisar';
    el.onclick=()=>location.assign('../estudio/');
   }else{
    el.disabled=false;el.textContent='Revisar Content Lab';
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
   el.textContent='Entrar ahora';el.disabled=false;
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
 for(const title of titles){
  const isLab=title==='Content Lab'&&(owner||purchased.has('content-lab'));
  const chip=document.createElement(isLab?'a':'span');
  chip.textContent=isLab?'Entrar a Content Lab':title;
  if(isLab)chip.href='../content-lab/';
  list.append(chip);
 }
 if(!titles.length){const chip=document.createElement('span');chip.textContent='Explora el catálogo';list.append(chip);}
}
function updateNav(){
 $('account-name').hidden=!profile;$('account-name').textContent=profile?.email||'';
 $('open-access').hidden=!!profile;$('signout').hidden=!profile;
 $('hero-account').textContent=profile?'Ver mi biblioteca':'Ver mis compras';
}
function resetState(){
 profile=null;owner=false;ready=false;purchased=new Set();releases={'web-class':false,'content-lab':false};
 updateNav();renderOwnerLibrary();setCourseActions();
}
async function refresh(){
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user){resetState();return;}
 const admin=await isOwner(user.id);
 if(idleExpired(user.id)){
  resetState();clearMarkers();
  await db.auth.signOut({scope:'local'});
  return;
 }
 if(!validMarker(user.id)&&!(admin&&validStudioMarker(user.id))){
  // Buyers coming from Content Lab already have a verified Supabase session
  // and a shared 24-hour idle clock; do not demand another code on entry.
  const {data:labBuyer}=lastActivity(user.id)!==null
   ? await db.from('content_lab_memberships').select('id').eq('buyer_email',(user.email||'').toLowerCase()).eq('status','active').maybeSingle()
   : {data:null};
  if(!labBuyer){
   resetState();clearMarkers();
   await db.auth.signOut({scope:'local'});
   return;
  }
  storeMarker(user.id,true);
 }
 profile=user;owner=admin;ready=false;
 const [orders,flags,labMembership]=await Promise.all([
  db.from('podcast_hub_entitlements').select('product_code,status').eq('buyer_email',(user.email||'').toLowerCase()).eq('status','active'),
  db.from('podcast_hub_releases').select('product_code,access_enabled'),
  db.from('content_lab_memberships').select('id').eq('buyer_email',(user.email||'').toLowerCase()).eq('status','active').maybeSingle()
 ]);
 if(orders.error||flags.error||labMembership.error){
  resetState();
  showModal(true);message('No pudimos verificar tus compras. Intenta de nuevo o solicita ayuda.');
  return;
 }
 purchased=new Set((orders.data||[]).map(x=>x.product_code));
 if(labMembership.data)purchased.add('content-lab');
 for(const item of flags.data||[])if(Object.hasOwn(releases,item.product_code))releases[item.product_code]=item.access_enabled===true;
 ready=true;noteActivity(user.id,true);updateNav();setCourseActions();renderOwnerLibrary();showModal(false);
}
$('open-access').addEventListener('click',()=>{mode('otp');showModal(true);});
$('hero-account').addEventListener('click',()=>{
 if(profile){$('my-library').scrollIntoView({behavior:'smooth'});}
 else{mode('otp');showModal(true);}
});
$('close-access').addEventListener('click',()=>showModal(false));
$('close-backdrop').addEventListener('click',()=>showModal(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('access-overlay').hidden)showModal(false)});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.mode)));
$('form-otp').addEventListener('submit',async e=>{
 e.preventDefault();
 await runForm(e.currentTarget,async()=>{
  const email=$('otp-email').value.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){message('Escribe un correo válido.');return;}
  const {error}=await db.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:location.origin+'/centro/?acceso=1'}});
  if(error){message('No se pudo enviar el código. Vuelve a intentarlo.');return;}
  pendingOtpEmail=email;mode('otp-verify');
  message('Código solicitado. Revisa también Spam o Promociones.');
 });
});
$('form-otp-verify').addEventListener('submit',async e=>{
 e.preventDefault();
 await runForm(e.currentTarget,async()=>{
  if(!pendingOtpEmail){mode('otp');message('Primero introduce tu correo.');return;}
  const code=$('otp-code').value.trim().replace(/\s/g,'');
  const {data,error}=await db.auth.verifyOtp({email:pendingOtpEmail,token:code,type:'email'});
  if(error||!data?.user){message('El código no es válido o expiró. Solicita otro.');return;}
  if(!storeMarker(data.user.id,true)){await db.auth.signOut({scope:'local'});message('Habilita el almacenamiento de este navegador.');return;}
  $('otp-code').value='';await refresh();
 });
});
$('otp-back').addEventListener('click',()=>{pendingOtpEmail='';mode('otp');});
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
for(const event of ['pointerdown','touchstart','keydown','input','scroll']){
 document.addEventListener(event,()=>{
  if(!profile)return;
  if(!noteActivity(profile.id)){void refresh();}
 },{passive:true,capture:true});
}
window.setInterval(()=>{
 if(profile&&!validMarker(profile.id)&&!(owner&&validStudioMarker(profile.id))){
  clearMarkers();db.auth.signOut({scope:'local'}).then(resetState);
 }
},60000);

/* Fichas editoriales de venta. La compra/propiedad solo se confirma con
   registros verificados del servidor, nunca con el botón o este catálogo. */
const productInformation=Object.freeze({
 'web-class':{
  title:'Tu primera web con IA',type:'MASTERCLASS PRÁCTICA',summary:'Aprende a construir tu primera web paso a paso, sin experiencia programando.',
  price:'Oferta de lanzamiento al abrir inscripciones',audience:'Personas que quieren crear una página para su idea o negocio y necesitan instrucciones sencillas, desde cero.',
  includes:['Lecciones en video para construir un proyecto de principio a fin.','Ejemplo práctico de página y demostraciones de diseño.','Biblioteca de prompts y materiales que acompañan los ejercicios.','Cuaderno, lista de revisión y centro de ayuda del aula.'],
  delivery:'Cuando la clase se lance y tu compra esté verificada, entrarás desde este centro con tu correo y contraseña. Puedes retomar tus lecciones y guardar avances.',
  note:'La clase sigue en preparación. La lista de espera no es una compra y el acceso permanece cerrado.'
 },
 'content-lab':{
  title:'Content Lab',type:'TU ESPACIO CREATIVO',
  summary:'Deja de empezar cada post desde cero.',
  price:'$10 USD · un solo pago',audience:'Para darle forma a tus ideas y ver tu contenido antes de publicarlo.',
  includes:['Edita posts, carruseles, reels e historias.','Usa tus fotos, fondos y stickers.','Organiza tu feed y planifica fechas y horas.'],
  delivery:'Después de comprar, recibirás el enlace por email. Entra con el correo de tu compra y abre tu Lab.',
  note:'Fotos con ChatGPT por separado. El calendario te ayuda a planificar; no publica por ti. Si usas la IA integrada, incluye 60 fotos y 30 créditos iniciales, con límites diarios de 10 fotos y 10 créditos.',
  checkout:'https://buy.stripe.com/14AdR8dHp6Dnd8B1IM93y0Z'
 },
 'booking-flow':{
  title:'Booking Automation + Command Center',type:'SERVICIO · RESERVAS',summary:'Una página de reservas conectada a un centro privado para tener las solicitudes y los próximos pasos organizados.',
  price:'$15 USD · pago único',audience:'Dueños de negocios de limpieza residencial que quieren dejar de perder solicitudes por tener la información dispersa.',
  includes:['Página de reservas personalizada con servicios, extras y solicitudes de presupuesto.','Disponibilidad y precios editables desde tu Command Center.','Solicitudes de nuevos clientes reunidas para revisarlas y responder.','Seguimientos y confirmaciones según las opciones habilitadas para tu negocio.'],
  delivery:'Después de enviar tu solicitud y confirmar el pago, se revisan los datos de tu negocio y se prepara una configuración personalizada. El servicio tiene su propio proceso de activación.',
  note:'La IA no está incluida en este pago único; los asistentes se contratan aparte. Confirma el importe final en el checkout de The Launch Era.',
  checkout:'https://thelaunchera.com/service-checkout/?offer=booking-flow'
 },
 'website-automation':{
  title:'Website Automation',type:'SERVICIO · WEBSITE',summary:'Organiza las consultas que llegan desde tu web actual y convierte cada solicitud en un siguiente paso claro.',
  price:'$35 USD · pago único',audience:'Negocios de limpieza residencial que ya tienen sitio web, pero reciben solicitudes desordenadas y pierden tiempo dando seguimiento.',
  includes:['Conexión del formulario de consultas de tu sitio existente.','Datos básicos del cliente y del servicio reunidos en un flujo organizado.','Una forma más clara de identificar las solicitudes que requieren respuesta.','Revisión inicial de la integración con tu web actual.'],
  delivery:'Se revisan tu formulario y los datos del negocio antes de configurar el flujo acordado. No se incluye una web nueva.',
  note:'La integración depende del formulario y los accesos de tu sitio. Verás el total y las condiciones finales antes de pagar.',
  checkout:'https://thelaunchera.com/service-checkout/?offer=website-automation'
 },
 'ai-booking':{
  title:'AI Booking Assistant',type:'ASISTENTE IA · RESERVAS',summary:'Ayuda a responder consultas habituales y a preparar solicitudes de reservas sin depender de respuestas manuales todo el día.',
  price:'$25 instalación + $14 USD/mes',audience:'Negocios de limpieza que reciben preguntas repetidas sobre servicios y necesitan orientar a sus clientes al siguiente paso.',
  includes:['Asistente para responder preguntas frecuentes sobre servicios.','Orientación a consultas y solicitudes de reserva.','Configuración inicial adaptada a los datos que apruebes para tu negocio.'],
  delivery:'Tras revisar la información, se prepara y entrega la configuración. La instalación incluye los primeros 30 días desde la entrega; después empieza la mensualidad.',
  note:'No confirma precios ni horarios que tu negocio no haya aprobado. La instalación y la mensualidad son conceptos distintos.',
  checkout:'https://thelaunchera.com/service-checkout/?offer=ai-booking'
 },
 'ai-followup':{
  title:'AI Follow-Up Assistant',type:'ASISTENTE IA · SEGUIMIENTO',summary:'Ayuda a dar seguimiento a interesados que ya autorizaron el contacto.',
  price:'$19 instalación + $7 USD/mes',audience:'Negocios de limpieza que reciben solicitudes y luego olvidan responder o continuar conversaciones importantes.',
  includes:['Flujo de seguimiento para contactos autorizados.','Mensajes y próximos pasos definidos según el proceso acordado.','Configuración inicial y revisión de las instrucciones del asistente.'],
  delivery:'Primero se validan el flujo y los permisos de contacto. La instalación incluye los primeros 30 días desde la entrega; luego comienza la mensualidad.',
  note:'No envía mensajes indiscriminados; requiere el consentimiento correspondiente. Confirma las condiciones en el checkout.',
  checkout:'https://thelaunchera.com/service-checkout/?offer=ai-followup'
 },
 'ai-business':{
  title:'AI Business Assistant',type:'ASISTENTE IA · COMBINADO',summary:'Une la ayuda con reservas y el seguimiento en un sistema de atención más organizado.',
  price:'$39 instalación + $19 USD/mes',audience:'Dueños de negocios de limpieza que quieren gestionar consultas iniciales y seguimientos sin separar ambas tareas.',
  includes:['Funciones de AI Booking Assistant y AI Follow-Up Assistant en una solución combinada.','Configuración inicial de los flujos aprobados.','Orientación a los siguientes pasos sin inventar datos de tu negocio.'],
  delivery:'Se revisan las necesidades y se configura el asistente combinado. La instalación incluye los primeros 30 días desde la entrega; después inicia la mensualidad.',
  note:'Las mensualidades son independientes de la instalación. La automatización respeta las reglas y permisos definidos por tu negocio.',
  checkout:'https://thelaunchera.com/service-checkout/?offer=ai-business'
 },
 'va':{
  title:'VA Essential Support',type:'SERVICIO · ASISTENCIA',summary:'Apoyo administrativo para liberar tiempo y tener más organizadas las tareas de tu negocio.',
  price:'$25 USD/mes · hasta 8 horas aprobadas',audience:'Dueños de negocios de limpieza que necesitan ayuda práctica con información de clientes, seguimientos o prioridades administrativas.',
  includes:['Hasta 8 horas al mes de tareas administrativas acordadas.','Organización de datos y solicitudes de clientes.','Apoyo en seguimientos y prioridades definidos contigo.'],
  delivery:'Antes de comenzar se revisan las tareas y se acuerdan las prioridades y el alcance del apoyo mensual.',
  note:'No es asistencia ilimitada. Las tareas y horas se acuerdan previamente; verifica términos y pago recurrente en el checkout.',
  checkout:'https://thelaunchera.com/service-checkout/?offer=va'
 },
 'no-voy-tarde':{
  title:'No voy tarde · un diario para volver a mí',type:'PRODUCTO DIGITAL · PODCAST',summary:'Un diario guiado para escucharte, bajar la comparación y reencontrar tu propio ritmo.',
  price:'$1.99 USD · pago único',audience:'Personas que sienten que van tarde y buscan un espacio íntimo para reflexionar con calma.',
  includes:['Diario digital descargable.','Ejercicios y preguntas guiadas para escribir a tu ritmo.','Un recurso personal que puedes volver a abrir cuando lo necesites.'],
  delivery:'La entrega del PDF comprado se realiza por correo después de validar el pago. No es un curso ni una suscripción.',
  note:'Es un producto descargable. Puedes revisar la página del producto y sus condiciones antes de finalizar la compra.',
  checkout:'../productos/no-voy-tarde.html',cta:'Ver página del producto'
 },
 'empezar-de-nuevo':{
  title:'Empezar de nuevo, sin tener todo resuelto',type:'PRODUCTO DIGITAL · PODCAST',summary:'Un cuaderno de 14 días con pequeños pasos para recuperar claridad sin exigirte tener todas las respuestas.',
  price:'$3.99 USD · pago único',audience:'Personas que quieren volver a empezar poco a poco y necesitan ejercicios breves y prácticos.',
  includes:['Cuaderno digital descargable con 14 días de actividades.','Preguntas y pequeños ejercicios para avanzar a tu ritmo.','Material para uso personal, sin horarios ni clases obligatorias.'],
  delivery:'La entrega del PDF se realiza por correo tras verificar el pago. Puedes leer las condiciones antes de comprar.',
  note:'No incluye acceso a la masterclass ni al Content Lab.',
  checkout:'../productos/empezar-de-nuevo.html',cta:'Ver página del producto'
 }
});
const productDialog=$('product-details');
const productButton=$('product-details-checkout');
function detailState(code){
 if(code==='content-lab')return owner?'Tu acceso de administración':purchased.has(code)?'Listo para entrar':'Disponible ahora';
 if(code==='web-class'||code==='content-lab'){
  if(owner)return 'Vista de administración';
  const has=purchased.has(code),open=code==='content-lab'&&has?true:releases[code]===true;
  return !open?(has?'Compra verificada · en preparación':'Acceso todavía cerrado'):(has?'Adquirido':'No adquirido');
 }
 if(code==='no-voy-tarde'||code==='empezar-de-nuevo')return purchased.has(code)?'Comprado · entrega por correo':'Disponible para conocer';
 return 'Contratación independiente';
}
function openProductDetails(code){
 const item=productInformation[code];if(!item)return;
 $('product-details-type').textContent=item.type;
 $('product-details-title').textContent=item.title;
 $('product-details-summary').textContent=item.summary;
 $('product-details-price').textContent=item.price;
 $('product-details-status').textContent=detailState(code);
 $('product-details-for').textContent=item.audience;
 $('product-details-delivery').textContent=item.delivery;
 $('product-details-note').textContent=item.note;
 const list=$('product-details-includes');list.replaceChildren();
 for(const title of item.includes){
  const li=document.createElement('li');
  li.textContent=title;list.append(li);
 }
 const disabled=$('product-details-unavailable');
 productDialog.classList.toggle('lab-compact',code==='content-lab');
 const accessControlled=code==='web-class';
 if(accessControlled){
  productButton.hidden=true;
  disabled.hidden=false;
  disabled.textContent=releases[code]?'Consulta la disponibilidad antes de comprar':'Venta y acceso pendientes de habilitación';
 }else{
  const labAccess=code==='content-lab'&&(owner||purchased.has(code));
  const url=new URL(labAccess?'../content-lab/':item.checkout,location.href);
  const approved=url.origin===location.origin||url.origin==='https://thelaunchera.com'||(code==='content-lab'&&url.href==='https://buy.stripe.com/14AdR8dHp6Dnd8B1IM93y0Z');
  productButton.hidden=!approved;disabled.hidden=approved;
  if(approved){
   productButton.href=url.href;
   productButton.textContent=code==='content-lab'?(labAccess?'Entrar a mi Lab':'Quiero mi Content Lab · $10'):(item.cta||'Ver opciones y continuar');
   productButton.target=url.origin===location.origin?'_self':'_blank';
   productButton.rel='noopener noreferrer';
  }else disabled.textContent='Destino de compra no disponible';
 }
 if(typeof productDialog.showModal==='function')productDialog.showModal();
 else productDialog.setAttribute('open','');
}
document.querySelectorAll('[data-detail]').forEach(el=>el.addEventListener('click',()=>openProductDetails(el.dataset.detail)));
$('product-details-close').addEventListener('click',()=>productDialog.close());
$('product-details-back').addEventListener('click',()=>productDialog.close());
productDialog.addEventListener('click',event=>{
 if(event.target===productDialog)productDialog.close();
});

resetState();
if(new URL(location.href).searchParams.has('acceso')||new URL(location.href).searchParams.get('product')==='content-lab'){mode('otp');showModal(true);}
await refresh();

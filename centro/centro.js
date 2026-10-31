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
  title:'Content Lab',type:'HERRAMIENTA DIGITAL',summary:'Un espacio personal para crear y editar contenido visual con tus referencias y tu identidad de marca.',
  price:'$10 USD · pago único',audience:'Personas que necesitan crear publicaciones y piezas visuales sin empezar cada diseño desde cero.',
  includes:['Estudio privado para organizar marcas y proyectos.','Edición de composiciones y exportación de PNG sin gastar créditos de IA.','Cuota inicial finita: 60 fotos IA y 30 créditos creativos.','Límites diarios de 10 fotos IA y 10 créditos creativos, sujetos a disponibilidad del proveedor.'],
  delivery:'Tras el lanzamiento, una compra verificada mediante Make habilitará tu acceso personal; utilizarás el mismo correo del checkout. Tus archivos privados no se comparten con otras cuentas.',
  note:'No ofrece IA ilimitada. Los créditos adicionales serán una compra separada. La compra y el acceso están pausados durante las pruebas.'
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
 if(code==='web-class'||code==='content-lab'){
  if(owner)return 'Vista de administración';
  const has=purchased.has(code),open=releases[code]===true;
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
 const accessControlled=code==='web-class'||code==='content-lab';
 if(accessControlled){
  productButton.hidden=true;
  disabled.hidden=false;
  disabled.textContent=releases[code]?'Consulta la disponibilidad antes de comprar':'Venta y acceso pendientes de habilitación';
 }else{
  const url=new URL(item.checkout,location.href);
  const approved=url.origin===location.origin||url.origin==='https://thelaunchera.com';
  productButton.hidden=!approved;disabled.hidden=approved;
  if(approved){
   productButton.href=url.href;
   productButton.textContent=item.cta||'Ver opciones y continuar';
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
if(new URL(location.href).searchParams.has('acceso')){mode('login');showModal(true);}
await refresh();

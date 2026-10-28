/* Lista de espera separada del newsletter. Inscripción solo tras verificar el correo.
   El indicador en la redirección evita depender de sessionStorage entre Gmail, Safari e Instagram. */
import {supabaseUrl,supabasePublishableKey,courseId} from './course-config.js';
const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm');
const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const form=document.querySelector('#course-waitlist-form');
const emailEl=document.querySelector('#course-waitlist-email');
const consentEl=document.querySelector('#course-waitlist-consent');
const feedback=document.querySelector('#course-waitlist-feedback');
const submit=form.querySelector('button[type=submit]');
const INTENT='podcast_class01_waitlist_confirm_intent';
const RETURN_PARAM='confirmar-lista';
const returning=new URLSearchParams(location.search).get(RETURN_PARAM)==='1';
let subscribing=false;

function message(text,good=false){
 feedback.textContent=text;
 feedback.dataset.ok=good?'true':'false';
 feedback.setAttribute('role','status');
}
function normal(email){return String(email||'').trim().toLowerCase();}
function requested(){
 try{return normal(JSON.parse(sessionStorage.getItem(INTENT)||'null')?.email||'');}
 catch{return '';}
}
function clearReturn(){
 sessionStorage.removeItem(INTENT);
 if(!returning)return;
 const url=new URL(location.href);
 url.searchParams.delete(RETURN_PARAM);
 history.replaceState(history.state,'',url.pathname+url.search+url.hash);
}
function showConfirmation(email){
 emailEl.value=email;
 submit.disabled=true;
 message('¡Ya estás en la lista de espera! 💙 Tu correo quedó confirmado. Te enviaré un mensaje de bienvenida y novedades periódicas de «Tu primera web con IA». No has realizado ninguna compra.',true);
 if(returning)document.querySelector('#lista-espera')?.scrollIntoView({behavior:'auto',block:'center'});
}
async function readMembership(email){
 const {data,error}=await db.from('podcast_class_waitlist')
  .select('email,unsubscribed_at')
  .eq('course_id',courseId).eq('email',email).maybeSingle();
 if(error)throw error;
 return data;
}
async function subscribe(user){
 const email=normal(user?.email);
 if(!email || !(returning || requested()===email) || subscribing)return;
 if(!(user.email_confirmed_at||user.confirmed_at)){
  message('Revisa el enlace que te enviamos por correo para verificar tu dirección.');
  return;
 }
 subscribing=true;
 message('Correo verificado. Estamos terminando tu registro…');
 try{
  const previous=await readMembership(email);
  if(previous?.unsubscribed_at){
   const {error}=await db.from('podcast_class_waitlist')
    .update({unsubscribed_at:null}).eq('course_id',courseId).eq('email',email);
   if(error)throw error;
  }else if(!previous){
   const {error}=await db.from('podcast_class_waitlist').insert({
    course_id:courseId,email,user_id:user.id,consent_scope:'class_01_launch_only'
   });
   if(error && error.code!=='23505')throw error;
  }
  clearReturn();
  showConfirmation(email);
  void manage(user);
 }catch(error){
  submit.disabled=false;
  message('Tu correo está verificado, pero no pudimos finalizar la inscripción. Vuelve a pulsar «Avísame cuando abra» para reintentarlo.');
  console.error('Class waitlist registration:',error?.code||'unknown');
 }finally{subscribing=false;}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!consentEl.checked){message('Marca la casilla para recibir las novedades de esta clase.');return;}
 const email=normal(emailEl.value);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254){
  message('Revisa la dirección de correo electrónico.');return;
 }
 submit.disabled=true;
 message('Preparando la verificación de tu correo…');
 try{
  sessionStorage.setItem(INTENT,JSON.stringify({email}));
  const {data:{user},error:userError}=await db.auth.getUser();
  if(userError && userError.name!=='AuthSessionMissingError')throw userError;
  if(user && normal(user.email)===email){
   await subscribe(user);
   return;
  }
  // La propia URL del enlace lleva el contexto de la lista al navegador donde se abra.
  // La inscripción real continúa exigiendo una sesión autenticada por Supabase.
  const redirect=new URL(location.origin+location.pathname);
  redirect.searchParams.set(RETURN_PARAM,'1');
  redirect.hash='lista-espera';
  const {error}=await db.auth.signInWithOtp({
   email,
   options:{emailRedirectTo:redirect.toString(),shouldCreateUser:true}
  });
  if(error)throw error;
  message('Paso 1 de 2 · Te enviamos un correo para verificar tu dirección. Pulsa el enlace de ese correo; volverás aquí y verás «¡Ya estás en la lista de espera!».');
 }catch(error){
  submit.disabled=false;
  message('No pudimos enviar la verificación. Revisa el correo e inténtalo de nuevo.');
 }
});
async function manage(user){
 const email=normal(user?.email);
 if(!email)return;
 let data;
 try{data=await readMembership(email);}catch{return;}
 if(!data||data.unsubscribed_at)return;
 if(!returning && !requested() && !feedback.dataset.ok?.includes('true'))showConfirmation(email);
 if(form.querySelector('#course-unsubscribe'))return;
 const b=document.createElement('button');
 b.type='button';b.id='course-unsubscribe';b.className='class-waitlist-optout';
 b.textContent='Darme de baja de esta lista';
 b.addEventListener('click',async()=>{
  b.disabled=true;
  const {error}=await db.from('podcast_class_waitlist')
   .update({unsubscribed_at:new Date().toISOString()}).eq('course_id',courseId).eq('email',email);
  if(error){
   b.disabled=false;message('No pudimos tramitar la baja. Inténtalo de nuevo.');return;
  }
  b.remove();submit.disabled=false;consentEl.checked=false;
  message('Tu solicitud se canceló. No recibirás más avisos sobre esta clase.',true);
 });
 form.appendChild(b);
}
async function detectSession(user){
 if(!user)return;
 if(returning||requested()===normal(user.email))await subscribe(user);
 else await manage(user);
}
if(returning)message('Verificando tu correo y completando la inscripción…');
db.auth.getUser().then(({data:{user}})=>{
 if(user)void detectSession(user);
 else if(returning)message('No encontramos una sesión confirmada. Abre de nuevo el enlace del correo en este navegador.');
}).catch(()=>{
 if(returning)message('No pudimos completar la verificación. Intenta abrir el enlace de tu correo otra vez.');
});
db.auth.onAuthStateChange((_event,session)=>{
 if(session?.user)window.setTimeout(()=>void detectSession(session.user),0);
});

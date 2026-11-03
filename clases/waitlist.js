/* Lista de espera separada del newsletter. Inscripción solo tras verificar el correo.
   El indicador en la redirección evita depender de sessionStorage entre Gmail, Safari e Instagram. */
const localized=(es,en)=>document.documentElement.lang==='en'?en:es;
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
const search=new URLSearchParams(location.search);
let returning=search.get(RETURN_PARAM)==='1';
let expectedHash=search.get('huella')||'';
let salt=search.get('reto')||'';
async function emailFingerprint(email,nonce){
 const bytes=new TextEncoder().encode(nonce+':'+normal(email));
 const hash=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function isIntendedEmail(email){
 if(returning&&expectedHash&&salt)return (await emailFingerprint(email,salt))===expectedHash;
 return requested()===email;
}
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
 url.searchParams.delete('huella');
 url.searchParams.delete('reto');
 returning=false;expectedHash='';salt='';
 history.replaceState(history.state,'',url.pathname+url.search);
}
function showConfirmation(email){
 emailEl.value=email;
 submit.disabled=true;
 message(localized('¡Tu inscripción está confirmada!',"Your signup is confirmed!"),true);
 form.hidden=true;
 document.querySelector('#course-waitlist-pending').hidden=true;
 const success=document.querySelector('#course-waitlist-success');
 success.hidden=false;
 requestAnimationFrame(()=>{
  success.scrollIntoView({behavior:'smooth',block:'center'});
  success.focus({preventScroll:true});
 });
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
 if(!email||subscribing)return;
 if(!(await isIntendedEmail(email))){
  if(returning){
   const p=document.querySelector('#course-waitlist-pending');
   document.querySelector('#course-waitlist-pending-title').textContent=localized('El correo aún no está registrado','This email is not registered yet.');
   document.querySelector('#course-waitlist-pending-description').textContent=localized('Este navegador tiene abierta otra cuenta. Solicita un enlace nuevo con el correo que deseas registrar.','Another account is open in this browser. Request a new link using the email you want to register.');
   form.hidden=true;p.hidden=false;
   p.scrollIntoView({block:'center'});
  }
  return;
 }
 if(!(user.email_confirmed_at||user.confirmed_at)){
  message(localized('Revisa el enlace que te enviamos por correo para verificar tu dirección.',"Use the email link we sent you to verify your address."));
  return;
 }
 subscribing=true;
 message(localized('Correo verificado. Estamos terminando tu registro…',"Email verified. We're finishing your signup…"));
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
  const record=await readMembership(email);
  if(!record||record.unsubscribed_at)throw new Error('Registro no guardado');
  showConfirmation(email);
  clearReturn();
  void manage(user);
 }catch(error){
  submit.disabled=false;
  message(localized('Tu correo está verificado, pero no pudimos finalizar la inscripción. Vuelve a pulsar «Avísame cuando abra» para reintentarlo.','Your email is verified, but registration could not be completed. Tap Join waitlist to try again.'));
  console.error('Class waitlist registration:',error?.code||'unknown');
 }finally{subscribing=false;}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!consentEl.checked){message(localized('Marca la casilla para recibir las novedades de esta clase.','Check the box to receive class updates.'));return;}
 const email=normal(emailEl.value);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254){
  message(localized('Revisa la dirección de correo electrónico.',"Check your email address."));return;
 }
 submit.disabled=true;
 message(localized('Preparando la verificación de tu correo…',"Preparing email verification…"));
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
  const nonce=crypto.randomUUID();
  redirect.searchParams.set('reto',nonce);
  redirect.searchParams.set('huella',await emailFingerprint(email,nonce));
  redirect.hash='lista-espera';
  const {error}=await db.auth.signInWithOtp({
   email,
   options:{emailRedirectTo:redirect.toString(),shouldCreateUser:true}
  });
  if(error)throw error;
  const p=document.querySelector('#course-waitlist-pending');
  document.querySelector('#course-waitlist-pending-title').textContent=localized('Revisa tu correo','Check your email');
  document.querySelector('#course-waitlist-pending-description').textContent=localized('Te enviamos un enlace para verificar tu correo. Al abrirlo volverás aquí y verás tu inscripción confirmada.','We sent you a verification link. Open it to return here and confirm your signup.');
  form.hidden=true;p.hidden=false;
  requestAnimationFrame(()=>p.scrollIntoView({behavior:'smooth',block:'center'}));
 }catch(error){
  submit.disabled=false;
  message(localized('No pudimos enviar la verificación. Revisa el correo e inténtalo de nuevo.',"We couldn't send verification. Please check your email and try again."));
 }
});
async function manage(user){
 const email=normal(user?.email);
 if(!email)return;
 let data;
 try{data=await readMembership(email);}catch{return;}
 if(!data||data.unsubscribed_at)return;
 // Never reveal the success panel simply because this browser has a saved login.
 if(document.querySelector('#course-unsubscribe'))return;
 const b=document.createElement('button');
 b.type='button';b.id='course-unsubscribe';b.className='class-waitlist-optout';
 b.textContent=localized('Darme de baja de esta lista','Unsubscribe from this waitlist');
 b.addEventListener('click',async()=>{
  b.disabled=true;
  const {error}=await db.from('podcast_class_waitlist')
   .update({unsubscribed_at:new Date().toISOString()}).eq('course_id',courseId).eq('email',email);
  if(error){
   b.disabled=false;message(localized('No pudimos tramitar la baja. Inténtalo de nuevo.','We could not cancel your signup. Please try again.'));return;
  }
  b.remove();document.querySelector('#course-waitlist-success').hidden=true;form.hidden=false;submit.disabled=false;consentEl.checked=false;
  message(localized('Tu solicitud se canceló. No recibirás más avisos sobre esta clase.','Your signup was canceled. You will no longer receive updates about this class.'),true);
 });
 document.querySelector('#course-waitlist-success-optout').appendChild(b);
}
async function detectSession(user){
 // A returning visitor can browse normally, even when already signed in.
 // Only an actual email-confirmation callback may complete an enrollment on page load.
 if(!user||!returning)return;
 await subscribe(user);
}
document.querySelector('#course-waitlist-dismiss').addEventListener('click',()=>{
 // Close the one-time receipt without cancelling the confirmed subscription.
 document.querySelector('#course-waitlist-success').hidden=true;
 document.querySelector('#course-waitlist-pending').hidden=true;
 document.querySelector('#course-waitlist-success-optout').replaceChildren();
 form.hidden=false;
 submit.disabled=false;
 consentEl.checked=false;
 emailEl.value='';
 sessionStorage.removeItem(INTENT);
 const url=new URL(location.href);
 ['confirmar-lista','huella','reto'].forEach(param=>url.searchParams.delete(param));
 history.replaceState(history.state,'',url.pathname+url.search);
 window.scrollTo({top:0,behavior:'smooth'});
 message(localized('Ya formas parte de la lista de espera. Puedes seguir explorando la clase.',"You're already on the waitlist. Keep exploring the class!"));
});
document.querySelector('#course-waitlist-edit').addEventListener('click',()=>{
 returning=false;expectedHash='';salt='';
 sessionStorage.removeItem(INTENT);
 const url=new URL(location.href);
 ['confirmar-lista','huella','reto'].forEach(p=>url.searchParams.delete(p));
 history.replaceState(history.state,'',url.pathname+url.search+'#lista-espera');
 document.querySelector('#course-waitlist-pending').hidden=true;
 document.querySelector('#course-waitlist-success').hidden=true;
 form.hidden=false;
 submit.disabled=false;emailEl.value='';consentEl.checked=false;
 message(localized('Puedes escribir otro correo y solicitar un nuevo enlace.',"You can enter another email and request a new link."));
 emailEl.focus();
});
if(returning){
 const p=document.querySelector('#course-waitlist-pending');
 p.hidden=false;form.hidden=true;
}
db.auth.getUser().then(({data:{user}})=>{
 if(user)void detectSession(user);
 else if(returning)message(localized('No encontramos una sesión confirmada. Abre de nuevo el enlace del correo en este navegador.','We could not verify your session. Reopen the email link in this browser.'));
}).catch(()=>{
 if(returning)document.querySelector('#course-waitlist-pending-description').textContent=localized('No pudimos completar la verificación. Solicita otro enlace e inténtalo de nuevo.',"We couldn't complete verification. Please request another link and try again.");
});
db.auth.onAuthStateChange((_event,session)=>{
 if(session?.user)window.setTimeout(()=>void detectSession(session.user),0);
});

/* Lista de espera independiente del newsletter. Confirmación por correo de Supabase. */
import {supabaseUrl,supabasePublishableKey,courseId} from './course-config.js';
const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm');
const db=createClient(supabaseUrl,supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const form=document.querySelector('#course-waitlist-form');
const emailEl=document.querySelector('#course-waitlist-email');
const consentEl=document.querySelector('#course-waitlist-consent');
const feedback=document.querySelector('#course-waitlist-feedback');
const INTENT='podcast_class01_waitlist_confirm_intent';
function message(text,good=false){feedback.textContent=text;feedback.dataset.ok=good?'true':'false';feedback.setAttribute('role','status');}
function normal(email){return email.trim().toLowerCase();}
function requested(){try{const data=JSON.parse(sessionStorage.getItem(INTENT)||'null');return data?.email||'';}catch{return '';}}
async function subscribe(user){
 const email=normal(user?.email||'');
 if(!email || email!==requested())return;
 try{
  const {data:previous,error:readError}=await db.from('podcast_class_waitlist').select('email,unsubscribed_at').eq('course_id',courseId).eq('email',email).maybeSingle();
  if(readError)throw readError;
  if(previous?.email){
   if(previous.unsubscribed_at){
    const {error}=await db.from('podcast_class_waitlist').update({unsubscribed_at:null}).eq('course_id',courseId).eq('email',email);
    if(error)throw error;
   }
  } else{
   const {error}=await db.from('podcast_class_waitlist').insert({
    course_id:courseId,email,user_id:user.id,consent_scope:'class_01_launch_only'
   });
   if(error && error.code!=='23505')throw error;
  }
  sessionStorage.removeItem(INTENT);
  message('¡Confirmado! Estás en la lista para recibir información sobre el lanzamiento de esta clase. No te hemos inscrito en el newsletter del podcast.',true);
  form.querySelector('button[type=submit]').disabled=true;
 }catch(error){message('No pudimos confirmar tu registro. Prueba a abrir esta página después de entrar con el enlace del correo.');console.error('Class waitlist failed:',error?.code||'unknown');}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!consentEl.checked){message('Marca la casilla para solicitar información de esta clase.');return;}
 const email=normal(emailEl.value);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254){message('Revisa la dirección de correo.');return;}
 const submit=form.querySelector('button[type=submit]');
 submit.disabled=true;message('Preparando la confirmación…');
 try{
  sessionStorage.setItem(INTENT,JSON.stringify({email}));
  const {data:{user}}=await db.auth.getUser();
  if(user && normal(user.email||'')===email){await subscribe(user);return;}
  const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:true}});
  if(error)throw error;
  message('Te enviamos un enlace de confirmación al correo. Ábrelo y regresa a esta página para completar tu registro.');
 }catch(e){submit.disabled=false;message('No pudimos enviar el enlace de confirmación. Comprueba el correo e inténtalo de nuevo.');}
});
db.auth.getUser().then(({data:{user}})=>{if(user)void subscribe(user);}).catch(()=>{});
db.auth.onAuthStateChange((_event,session)=>{if(session?.user)void subscribe(session.user);});

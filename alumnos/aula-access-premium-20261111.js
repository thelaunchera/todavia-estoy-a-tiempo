/* Decorative auth states only: never grants course access or changes its passwords/tokens. */
(function(){
 const panel=document.getElementById('login-panel');
 const notice=document.getElementById('room-message');
 if(!panel||!notice)return;
 const input=document.getElementById('login-email');
 const expired=document.getElementById('aula-auth-expired');
 const stage=document.getElementById('aula-email-stage');
 const resend=document.getElementById('aula-email-resend');
 const back=document.getElementById('aula-email-back');
 const emailNode=document.getElementById('aula-email-address');
 const msg=document.getElementById('aula-email-message');
 const title=document.getElementById('aula-email-heading');
 const expiredKey='tle_aula_reconnect_email';
 let timer=null,readyAt=0,lastKind='';
 function en(){
  return (document.getElementById('aula-public-language')?.value||
   document.getElementById('aula-language')?.value||'es')==='en';
 }
 function refillExpired(){
  let address='';try{address=sessionStorage.getItem(expiredKey)||''}catch{}
  if(!address||!input||!expired)return;
  input.value=address;
  expired.hidden=false;
  expired.textContent=en()?'Your session expired. Sign in again to return to your lessons.':
   'Tu sesión venció. Entra otra vez para continuar con tus lecciones.';
 }
 function finishStage(){
  panel.removeAttribute('data-email-stage');
  stage.hidden=true;lastKind='';if(timer){clearInterval(timer);timer=null;}
 }
 function countdown(){
  const n=Math.max(0,Math.ceil((readyAt-Date.now())/1000));
  if(!resend)return;
  resend.disabled=n>0;
  resend.textContent=n>0?(en()?'Resend in ':'Reenviar en ')+n+'s':
    (en()?'Resend email':'Reenviar correo');
 }
 function beginStage(kind){
  lastKind=kind;
  const email=(document.getElementById(kind==='register'?'register-email':'reset-email')?.value||'').trim();
  emailNode.textContent=email;
  title.textContent=en()?'Check your email.':'Revisa tu correo.';
  msg.textContent=en()?
   (kind==='register'?'If your email is eligible, follow the confirmation instructions to activate your classroom account.':
   'If an account exists, follow the password recovery instructions sent to this email.'):
   (kind==='register'?'Si tu correo puede registrarse, sigue las instrucciones para confirmar tu cuenta.':
   'Si existe una cuenta, sigue las instrucciones para recuperar tu contraseña.');
  resend.hidden=kind!=='reset';
  readyAt=Date.now()+60000;
  countdown();if(timer)clearInterval(timer);timer=setInterval(countdown,1000);
  stage.hidden=false;panel.dataset.emailStage='true';
  back.focus({preventScroll:true});
 }
 const observer=new MutationObserver(()=>{
  const source=notice.dataset.sourceMessage||notice.textContent||'';
  const mode=panel.dataset.authMode||'login';
  const successful=/recibir[aá]s las instrucciones para confirmarla|recibir[aá]s el enlace para recuperar la contrase[ñn]a/.test(source);
  if(successful&&['register','reset'].includes(mode)&&panel.dataset.emailStage!=='true')beginStage(mode);
 });
 observer.observe(notice,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['data-source-message']});
 document.querySelectorAll('[data-auth-mode]').forEach(node=>node.addEventListener('click',finishStage));
 back?.addEventListener('click',()=>{
  finishStage();const target=document.querySelector('[data-auth-mode="login"]');
  target?.click();input?.focus({preventScroll:true});
 });
 resend?.addEventListener('click',()=>{
  if(lastKind!=='reset'||Date.now()<readyAt)return;
  readyAt=Date.now()+60000;countdown();
  stage.hidden=true;panel.removeAttribute('data-email-stage');
  document.getElementById('reset-email-form')?.requestSubmit();
 });
 document.getElementById('aula-public-language')?.addEventListener('change',()=>{
  refillExpired();if(lastKind){const kind=lastKind;beginStage(kind);}
 });
 refillExpired();
 window.addEventListener('pageshow',refillExpired);
})();

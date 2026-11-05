/* Monthly freebies use the same email-confirmation journey as Matcha. Release is checked again by the backend. */
(()=>{"use strict";
const form=document.getElementById("signup");if(!form)return;
const resource=form.querySelector('[name="resource"]')?.value;
const release=form.dataset.releaseDate||({
 november_web_one_prompt_2026:"2026-11-19",
 december_lavender_2026:"2026-12-01",
 salt_line_january_2027:"2027-01-02"
})[resource];
if(!resource||!release)return;
const submit=form.querySelector('[type="submit"]');if(!submit)return;
const mail=form.querySelector('[name="email"]');
const started=document.createElement("input");started.type="hidden";started.name="started_at";started.value=String(Date.now());form.append(started);
const notice=document.createElement("p");notice.className="freebie-request-feedback";notice.setAttribute("role","status");notice.style.cssText="font-size:13px;line-height:1.5;margin:10px 0;color:#53615b";form.append(notice);
const en=()=>document.documentElement.lang==="en";
const day=()=>{const p=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).map(x=>[x.type,x.value]));return p.year+"-"+p.month+"-"+p.day};
function update(){
 const ready=day()>=release;
 submit.disabled=!ready;
 submit.textContent=ready?(en()?"Email me the freebie":"Enviarme el freebie"):(en()?"Available "+release:"Disponible "+release);
 form.dataset.launchReady=String(ready);
}
update();
const switcher=document.getElementById("language");if(switcher)switcher.addEventListener("click",()=>queueMicrotask(update));for(const id of ["es","en"]){const b=document.getElementById(id);if(b)b.addEventListener("click",()=>queueMicrotask(update));}
for(const button of form.ownerDocument.querySelectorAll("[data-lang]"))button.addEventListener("click",()=>queueMicrotask(update));
form.addEventListener("submit",async(e)=>{
 e.preventDefault();e.stopImmediatePropagation();
 update();
 if(form.dataset.launchReady!=="true")return;
 if(!mail||!mail.validity.valid){mail?.reportValidity();return;}
 submit.disabled=true;submit.textContent=en()?"Sending…":"Enviando…";notice.textContent="";
 try{
  const result=await fetch("https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-monthly-freebies?action=subscribe",{
   method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({resource,email:mail.value,language:document.documentElement.lang==="es"?"es":"en",website:form.querySelector('[name="website"]')?.value||"",started_at:Number(started.value),marketing_opt_in:!!form.querySelector('[name="marketing_opt_in"]')?.checked})
  });
  const data=await result.json().catch(()=>({}));
  if(!result.ok||!data.ok)throw Error(data.error||(en()?"Email not sent":"No se envió el correo"));
  notice.textContent=en()?"Check your inbox to confirm your email and open the freebie.":"Revisa tu correo para confirmar tu email y abrir el freebie.";
  mail.readOnly=true;submit.textContent=en()?"Email requested":"Correo solicitado";
 }catch(error){
  notice.textContent=error?.message||"Please try again.";
  update();
 }
},true);
})();
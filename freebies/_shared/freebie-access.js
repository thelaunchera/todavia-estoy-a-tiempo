/* Verified access: the browser never receives full prompts before confirming the personal email link. */
(async()=>{"use strict";
const root=document.querySelector("[data-tle-private-library]");if(!root)return;
const resource=root.dataset.resource,languageToggle=document.getElementById("language");
const api="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-monthly-freebies";
const status=document.getElementById("access-status"),cards=document.getElementById("prompt-cards"),download=document.getElementById("protected-download");
const key="tle_freebie_access_"+resource;
let lang=document.documentElement.lang==="es"?"es":"en",items=[];
const copy={
 es:{waiting:"Revisa tu correo: tu enlace personal abre este freebie.",loading:"Verificando tu enlace…",denied:"Acceso no disponible. Solicita otro enlace por correo.",ready:"Tus prompts están abiertos. Edítalos y copia cada uno.",copy:"Copiar prompt",copied:"Copiado",error:"No se pudo copiar. Selecciona el texto y cópialo manualmente."},
 en:{waiting:"Check your inbox: your personal link opens this freebie.",loading:"Verifying your link…",denied:"Access is unavailable. Request a new email link.",ready:"Your prompts are unlocked. Edit and copy each one.",copy:"Copy prompt",copied:"Copied",error:"Copy failed. Select the text and copy manually."}
};
function setText(t){status.textContent=t}
function render(){
 cards.replaceChildren();
 for(const item of items){
  const article=document.createElement("article");article.className="prompt-card";
  const number=document.createElement("span");number.className="number";number.textContent=item.id+" / "+String(items.length).padStart(2,"0");
  const heading=document.createElement("h2");heading.textContent=item.title;
  const editor=document.createElement("textarea");editor.rows=7;editor.value=item[lang]||item.en;editor.setAttribute("aria-label",item.title);editor.spellcheck=false;
  const btn=document.createElement("button");btn.type="button";btn.className="copy-btn";btn.textContent=copy[lang].copy;
  btn.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(editor.value);btn.textContent=copy[lang].copied;setTimeout(()=>btn.textContent=copy[lang].copy,1600)}catch{setText(copy[lang].error)}});
  article.append(number,heading,editor,btn);cards.append(article);
 }
 cards.hidden=false;setText(copy[lang].ready);if(download)download.hidden=false;
}
if(languageToggle)languageToggle.addEventListener("click",()=>{
 lang=lang==="es"?"en":"es";document.documentElement.lang=lang;languageToggle.textContent=lang==="es"?"EN":"ES";
 if(items.length)render();else setText(copy[lang].waiting);
});
const request=async(action,payload)=>{
 const resp=await fetch(api+"?action="+action,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,resource})});
 const data=await resp.json().catch(()=>({}));
 if(!resp.ok||!data.ok)throw Error(data.error||"Access unavailable");
 return data;
};
const match=location.hash.match(/^#confirm=([a-f0-9]{64})$/i);
let token=match?.[1]||"";
if(match){history.replaceState(null,"",location.pathname+location.search);setText(copy[lang].loading);
 try{const c=await request("confirm",{confirm_token:token});token=c.access_token;
 localStorage.setItem(key,JSON.stringify({token,expires:Date.now()+90*86400000}));
 }catch{setText(copy[lang].denied);return}
}else{try{const saved=JSON.parse(localStorage.getItem(key)||"null");if(saved?.expires>Date.now()&&/^[0-9a-f]{64}$/i.test(saved.token))token=saved.token}catch{}}
if(!token){setText(copy[lang].waiting);return}
setText(copy[lang].loading);
try{
 const data=await request("library",{access_token:token});
 if(!Array.isArray(data.items)||data.items.length===0)throw Error("Empty library");
 items=data.items;render();
}catch{
 localStorage.removeItem(key);setText(copy[lang].denied);
}
})();
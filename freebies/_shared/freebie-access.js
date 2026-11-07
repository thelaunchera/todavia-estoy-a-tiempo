/* Verified access: the browser never receives full prompts before confirming the personal email link. */
(async()=>{"use strict";
const root=document.querySelector("[data-tle-private-library]");if(!root)return;
const resource=root.dataset.resource,languageToggle=document.getElementById("language");
const api="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-monthly-freebies";
const status=document.getElementById("access-status"),cards=document.getElementById("prompt-cards"),download=document.getElementById("protected-download");
const key="tle_freebie_access_"+resource;
const urlLanguage=new URLSearchParams(location.search).get("lang");
let lang=(urlLanguage==="es"||urlLanguage==="en")?urlLanguage:(document.documentElement.lang==="es"?"es":"en"),items=[];
const copy={
 es:{waiting:"Revisa tu correo: tu enlace personal abre este freebie.",loading:"Verificando tu enlace…",denied:"Acceso no disponible. Solicita otro enlace por correo.",ready:"Tus prompts están abiertos. Edítalos y copia cada uno.",copy:"Copiar prompt",copied:"Copiado",error:"No se pudo copiar. Selecciona el texto y cópialo manualmente."},
 en:{waiting:"Check your inbox: your personal link opens this freebie.",loading:"Verifying your link…",denied:"Access is unavailable. Request a new email link.",ready:"Your prompts are unlocked. Edit and copy each one.",copy:"Copy prompt",copied:"Copied",error:"Copy failed. Select the text and copy manually."}
};
function setText(t){status.textContent=t}

const languageCopy={
 november_web_one_prompt_2026:{
 es:{title:"Tu web con un solo prompt | The Launch Era",eyebrow:"RECURSO GRATIS PARA TU WEB",heading:"Tu web con un solo prompt",subtitle:"Un prompt. Tu propio sitio web.",detail:"Fotografías originales y un prompt editable. El acceso personal llega por correo.",notice:"BIBLIOTECA PRIVADA DE PROMPTS",request:"SOLICITAR ACCESO POR CORREO",galleryEyebrow:"EJEMPLOS VISUALES",galleryTitle:"Inspírate con tres fotografías.",privateEyebrow:"ACCESO PERSONAL",privateTitle:"Tu prompt para copiar.",privateDescription:"El prompt aparece después de confirmar tu correo mediante el enlace personal. Puedes editar el texto antes de copiarlo.",footer:"POWERED BY THE LAUNCH ERA · EDICIÓN NOVIEMBRE",captions:["01 · Computadora","02 · Planificación","03 · Móvil"],cover:"cover.svg",coverAlt:"Portada española: Tu web con un solo prompt"},
 en:{title:"Build Your Website with One Prompt | The Launch Era",eyebrow:"FREE WEBSITE RESOURCE",heading:"Build your website with one prompt",subtitle:"One prompt. Your own website.",detail:"Original visual examples and an editable prompt. Your personal access arrives by email.",notice:"PRIVATE PROMPT LIBRARY",request:"REQUEST EMAIL ACCESS",galleryEyebrow:"VISUAL EXAMPLES",galleryTitle:"Explore three photo references.",privateEyebrow:"PERSONAL ACCESS",privateTitle:"Your copyable prompt.",privateDescription:"The prompt appears after you confirm your email with your personal link. Edit the text before copying.",footer:"POWERED BY THE LAUNCH ERA · NOVEMBER EDITION",captions:["01 · Desktop","02 · Planning","03 · Mobile"],cover:"cover-en.svg",coverAlt:"English cover: Build Your Website with One Prompt"}
 },
 december_lavender_2026:{
 es:{title:"The Lavender Edit | The Launch Era",eyebrow:"FREEBIE CREATIVO",heading:"The Lavender Edit",subtitle:"5 prompts. Una campaña de producto coherente.",detail:"Cinco fotos originales y prompts editables. Tu acceso personal llega por correo.",notice:"BIBLIOTECA PRIVADA DE PROMPTS",request:"SOLICITAR ACCESO POR CORREO",galleryEyebrow:"TEXTURAS Y DETALLES",galleryTitle:"Explora los cinco ejemplos visuales.",privateEyebrow:"ACCESO PERSONAL",privateTitle:"Tus prompts para copiar.",privateDescription:"Los prompts aparecen después de confirmar tu correo mediante el enlace personal. Puedes editarlos antes de copiarlos.",footer:"POWERED BY THE LAUNCH ERA · DICIEMBRE 2026",captions:["01 · Brillo editorial","02 · Macro y gotas","03 · Botánicos","04 · Ritual de crema","05 · Regalos"]},
 en:{title:"The Lavender Edit | The Launch Era",eyebrow:"CREATIVE FREEBIE",heading:"The Lavender Edit",subtitle:"5 prompts. One cohesive product campaign.",detail:"Five original visual examples and editable prompts. Your personal access arrives by email.",notice:"PRIVATE PROMPT LIBRARY",request:"REQUEST EMAIL ACCESS",galleryEyebrow:"TEXTURE & QUALITY",galleryTitle:"Explore the five visual examples.",privateEyebrow:"PERSONAL ACCESS",privateTitle:"Your copyable prompts.",privateDescription:"The prompts appear after you confirm your email with your personal link. Edit each prompt before copying.",footer:"POWERED BY THE LAUNCH ERA · DECEMBER 2026",captions:["01 · Editorial gloss","02 · Droplet macro","03 · Botanical still life","04 · Cream ritual","05 · Holiday gifting"]}
 },
 march_premium_app_2027:{es:{title:"Diseña una app premium con IA | The Launch Era",eyebrow:"FREEBIE CREATIVO DE MARZO",heading:"Diseña una app premium con IA",subtitle:"Ocho prompts. Una fila virtual. Tres momentos conectados.",detail:"Diseña con IA la experiencia de entrar en una fila, consultar el turno y recibir el aviso. Accede después de verificar tu correo.",notice:"BIBLIOTECA PRIVADA DE PROMPTS",request:"SOLICITAR ACCESO POR CORREO",privateEyebrow:"TU BIBLIOTECA",privateTitle:"Ocho prompts para copiar.",privateDescription:"Edita y copia cada prompt después de verificar tu correo.",galleryEyebrow:"FLUJO DE PANTALLAS",galleryTitle:"Entra. Espera. Te toca.",footer:"POWERED BY THE LAUNCH ERA · MARZO 2027"},en:{title:"Design a Premium App with AI | The Launch Era",eyebrow:"MARCH CREATIVE FREEBIE",heading:"Design a Premium App with AI",subtitle:"Eight prompts. One virtual queue. Three connected moments.",detail:"Design the journey from joining a line to seeing your spot and getting the turn-ready alert. Unlock your personal prompts after verification.",notice:"PRIVATE PROMPT LIBRARY",request:"REQUEST ACCESS BY EMAIL",privateEyebrow:"YOUR PRIVATE LIBRARY",privateTitle:"Eight copy-ready prompts.",privateDescription:"Edit and copy every prompt after email verification.",galleryEyebrow:"SCREEN FLOW",galleryTitle:"Join. Wait. You're up.",footer:"POWERED BY THE LAUNCH ERA · MARCH 2027"}},
 salt_line_january_2027:{
 es:{title:"SALT LINE | The Launch Era",eyebrow:"FREEBIE CREATIVO",heading:"SALT LINE",subtitle:"8 prompts de belleza macro · Piel, sal y luz plateada",detail:"Ejemplos visuales originales y ocho prompts editables. Tu acceso personal llega por correo.",notice:"BIBLIOTECA PRIVADA DE PROMPTS",request:"SOLICITAR ACCESO POR CORREO",galleryEyebrow:"TEXTURAS Y DETALLES",galleryTitle:"Explora los ejemplos visuales.",privateEyebrow:"ACCESO PERSONAL",privateTitle:"Tus prompts para copiar.",privateDescription:"Los ocho prompts aparecen al confirmar tu correo mediante el enlace personal. Edítalos y cópialos directamente en la web.",footer:"POWERED BY THE LAUNCH ERA · ENERO 2027",captions:["01 · La mujer","02 · Iris","03 · Labios","04 · Clavícula"]},
 en:{title:"SALT LINE | The Launch Era",eyebrow:"CREATIVE FREEBIE",heading:"SALT LINE",subtitle:"8 Macro Beauty Prompts · Skin, Salt & Silver Light",detail:"Original visual examples and eight editable prompts. Your personal access arrives by email.",notice:"PRIVATE PROMPT LIBRARY",request:"REQUEST EMAIL ACCESS",galleryEyebrow:"TEXTURE & QUALITY",galleryTitle:"Explore the visual examples.",privateEyebrow:"PERSONAL ACCESS",privateTitle:"Your copyable prompts.",privateDescription:"The eight prompts appear after you confirm your email with your personal link. Edit and copy them directly on the web.",footer:"POWERED BY THE LAUNCH ERA · JANUARY 2027",captions:["01 · The Woman","02 · The Iris","03 · The Lip","04 · The Hollow"]}
 }
};
function applyLanguage(){
 const config=languageCopy[resource]?.[lang];
 document.documentElement.lang=lang;
 if(languageToggle){languageToggle.textContent=lang==="es"?"EN":"ES";languageToggle.setAttribute("aria-label",lang==="es"?"Switch to English":"Cambiar a español")}
 if(!config)return;
 document.title=config.title;
 const put=(selector,text)=>{const n=root.querySelector(selector);if(n)n.textContent=text};
 put(".hero .eyebrow",config.eyebrow);put(".hero h1",config.heading);
 const heroP=root.querySelectorAll(".hero-copy > p");
 if(heroP[0])heroP[0].textContent=config.subtitle;
 if(heroP[1])heroP[1].textContent=config.detail;
 put(".notice strong",config.notice);
 const cta=root.querySelector(".notice a.cta");if(cta){cta.textContent=config.request;try{const url=new URL(cta.href,location.href);url.searchParams.set("lang",lang);cta.href=url.pathname+url.search}catch{}}
 const visual=root.querySelector('section[aria-label]');
 if(visual){const visualEyebrow=visual.querySelector(".eyebrow"),visualHeading=visual.querySelector("h2");if(visualEyebrow)visualEyebrow.textContent=config.galleryEyebrow;if(visualHeading)visualHeading.textContent=config.galleryTitle;visual.querySelectorAll(".gallery figcaption").forEach((n,i)=>{if(config.captions[i])n.textContent=config.captions[i]})}
 put(".private > .eyebrow",config.privateEyebrow);put(".private > h2",config.privateTitle);put(".private > p",config.privateDescription);
 const foot=document.querySelector(".footer");if(foot)foot.textContent=config.footer;
 if(config.cover){const im=root.querySelector(".hero-img");if(im){im.src="/assets/freebies/november-website/"+config.cover;im.alt=config.coverAlt}}
}
applyLanguage();

function render(){
 cards.replaceChildren();
 for(const item of items){
  const article=document.createElement("article");article.className="prompt-card";
  const number=document.createElement("span");number.className="number";number.textContent=item.id+" / "+String(items.length).padStart(2,"0");
  const displayTitle=lang==="es"?(item.title_es||item.title):item.title;
  const heading=document.createElement("h2");heading.textContent=displayTitle;
  const editor=document.createElement("textarea");editor.rows=7;editor.value=item[lang]||item.en;editor.setAttribute("aria-label",displayTitle);editor.spellcheck=false;
  const btn=document.createElement("button");btn.type="button";btn.className="copy-btn";btn.textContent=copy[lang].copy;
  btn.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(editor.value);btn.textContent=copy[lang].copied;setTimeout(()=>btn.textContent=copy[lang].copy,1600)}catch{setText(copy[lang].error)}});
  article.append(number,heading,editor,btn);cards.append(article);
 }
 cards.hidden=false;setText(copy[lang].ready);if(download)download.hidden=false;
}
if(languageToggle)languageToggle.addEventListener("click",()=>{
 lang=lang==="es"?"en":"es";applyLanguage();
 const nextUrl=new URL(location.href);nextUrl.searchParams.set("lang",lang);history.replaceState(null,"",nextUrl.pathname+nextUrl.search+nextUrl.hash);
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
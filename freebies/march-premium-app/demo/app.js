(()=>{"use strict";
const KEY="tle_petal_line_demo_v1";
const $=id=>document.getElementById(id);
const ui={
  scroller:$("screen-scroll"),language:$("language"),name:$("visitor-name"),
  form:$("join-form"),error:$("join-error"),join:$("join-button"),position:$("queue-position"),
  ahead:$("ahead-count"),ticketPurpose:$("ticket-purpose"),readyPurpose:$("ready-purpose"),
  lineHello:$("line-hello"),lineStatus:$("line-status"),readyMessage:$("ready-message"),
  advance:$("advance-button"),leave:$("leave-button"),arrived:$("arrived-button"),
  confirmation:$("arrival-confirmation"),restart:$("restart-button"),toast:$("toast")
};
const messages={
 es:{
  editorialLabel:"UNA FLORISTERÍA, UNA EXPERIENCIA MEJOR",
  editorialHeading:"Las flores merecen <em>una buena espera.</em>",
  editorialBody:"Una fila virtual para un flower bar. Sin buscar el final de la fila ni perder tu lugar. Solo flores y un momento para disfrutar.",
  editorialTag:"FILA VIRTUAL / EXPERIENCIA POP-UP",
  demo:"DEMO",
  demoNotice:"Simulación interactiva. No es una fila real ni envía mensajes.",
  tabJoin:"Entrar",tabLine:"Mi turno",tabReady:"Te toca",
  startEyebrow:"BIENVENIDO AL FLOWER BAR",
  startTitle:"Menos espera.<br><em>Más flores.</em>",
  startDescription:"Apúntate a la fila virtual y disfruta mientras preparamos tu momento floral.",
  bloomTag:"TUS FLORES, TU MOMENTO",
  nameLabel:"¿Cómo te llamas?",namePlaceholder:"Tu nombre",
  purposeLegend:"¿Qué te gustaría hacer?",bouquetChoice:"Crear mi ramo",pickupChoice:"Recoger un pedido",
  joinAction:"Entrar en la fila",joinError:"Escribe tu nombre (mínimo 2 letras).",
  lineEyebrow:"TU LUGAR ESTÁ GUARDADO",lineTitle:"Ya estás <em>en la fila.</em>",
  lineHello:name=>"¡Perfecto, "+name+"! Guardamos tu lugar en esta fila de demostración.",
  virtualTicket:"TURNO VIRTUAL",peopleAhead:"Personas antes que tú",visitType:"Tu experiencia",
  purposeBouquet:"Crear mi ramo",purposePickup:"Recoger pedido",
  statusWaiting:n=>n===1?"Solo queda una persona antes que tú.":n===0?"¡Eres la siguiente persona!":"Puedes disfrutar del flower bar mientras la fila avanza.",
  demoControls:"CONTROLES DE DEMOSTRACIÓN",
  demoControlsDescription:"Simula cómo avanza la fila. En una app real, el personal del flower bar actualizaría los turnos.",
  advanceAction:"Avanzar la fila",leaveAction:"Salir de la fila",
  readyEyebrow:"TU MOMENTO FLORECE",readyTitle:"¡Ahora <em>te toca!</em>",
  readyMessage:name=>"¡"+name+", llegó tu momento! Acércate al flower bar.",
  readyCardLabel:"TU EXPERIENCIA",readyInstruction:"Acércate al mostrador floral. Estamos listos para recibirte.",
  arrivedAction:"Ya estoy aquí",arrivalThanks:"¡Qué bueno verte!",
  arrivalText:"Tu llegada quedó confirmada en este demo.",startAgain:"Volver a empezar",
  privacyNote:"Demo local: sin reservas, mensajes ni datos compartidos.",
  joined:"¡Ya estás en la fila de demostración!",advanced:"La fila avanzó un lugar.",
  readyToast:"¡Llegó tu turno!",left:"Saliste de la fila de demostración.",
  confirmed:"Llegada confirmada en el demo.",
  storageWarning:"El navegador impide guardar los datos. El demo sigue funcionando durante esta visita.",
  offline:"Estás sin conexión. Si el demo ya cargó, puedes seguir usando la simulación.",
  title:"PETAL LINE — Demo interactivo | The Launch Era",
  demoAria:"Progreso del recorrido",queueAria:"Tu posición en la fila"
 },
 en:{
  editorialLabel:"ONE FLOWER BAR, A BETTER EXPERIENCE",
  editorialHeading:"Flowers are worth <em>waiting for.</em>",
  editorialBody:"A virtual line for a flower bar. No searching for the back of the line or losing your spot. Just flowers and a moment to enjoy.",
  editorialTag:"VIRTUAL QUEUE / POP-UP EXPERIENCE",
  demo:"DEMO",
  demoNotice:"Interactive simulation. This is not a real queue and no messages are sent.",
  tabJoin:"Join",tabLine:"My spot",tabReady:"You're up",
  startEyebrow:"WELCOME TO THE FLOWER BAR",
  startTitle:"Less waiting.<br><em>More blooming.</em>",
  startDescription:"Join the virtual line and enjoy your day while we get ready for your flower moment.",
  bloomTag:"YOUR BOUQUET, YOUR MOMENT",
  nameLabel:"What's your name?",namePlaceholder:"Your first name",
  purposeLegend:"What brings you in?",bouquetChoice:"Build my bouquet",pickupChoice:"Pick up an order",
  joinAction:"Join the line",joinError:"Please enter your name (at least 2 letters).",
  lineEyebrow:"YOUR SPOT IS SAVED",lineTitle:"You're <em>in line.</em>",
  lineHello:name=>"You're in, "+name+"! Your spot is saved in this demo queue.",
  virtualTicket:"VIRTUAL TICKET",peopleAhead:"People ahead of you",visitType:"Your experience",
  purposeBouquet:"Build my bouquet",purposePickup:"Order pickup",
  statusWaiting:n=>n===1?"Just one person ahead of you.":n===0?"You're next in line!":"Explore the flower bar while the queue moves along.",
  demoControls:"DEMO CONTROLS",
  demoControlsDescription:"Simulate the line moving forward. In a real app, flower bar staff would update the queue.",
  advanceAction:"Move the line",leaveAction:"Leave the line",
  readyEyebrow:"YOUR MOMENT IS BLOOMING",readyTitle:"You're <em>up!</em>",
  readyMessage:name=>name+", it's your moment! Come to the flower bar.",
  readyCardLabel:"YOUR EXPERIENCE",readyInstruction:"Head to the flower counter. We're ready to welcome you.",
  arrivedAction:"I'm here",arrivalThanks:"So glad you're here!",
  arrivalText:"Your arrival was confirmed in this demo.",startAgain:"Start again",
  privacyNote:"Local demo: no real booking, messages or shared data.",
  joined:"You joined the demo line!",advanced:"The demo queue moved forward.",
  readyToast:"It's your turn!",left:"You left the demo line.",
  confirmed:"Arrival confirmed in the demo.",
  storageWarning:"Your browser isn't allowing saved data. The demo still works during this visit.",
  offline:"You're offline. If the demo is already loaded, you can keep using the simulation.",
  title:"PETAL LINE — Interactive Demo | The Launch Era",
  demoAria:"Your place in the walkthrough",queueAria:"Your queue position"
 }
};
let lang=new URLSearchParams(location.search).get("lang")==="en"?"en":"es";
let active=null; // null | {name,purpose,position,arrived}
let toastTimer=0;
let storageEnabled=true;
const t=k=>messages[lang][k];
const sampleInput=()=>({name:ui.name.value.trim().replace(/\s+/g," ").slice(0,40),purpose:document.querySelector('input[name="purpose"]:checked')?.value||"bouquet"});
function load(){
  try{
    const x=JSON.parse(localStorage.getItem(KEY)||"null");
    if(x&&typeof x.name==="string"&&x.name.trim().length>=2&&["bouquet","pickup"].includes(x.purpose)&&Number.isInteger(x.position)&&x.position>=0&&x.position<=4){
      active={name:x.name.slice(0,40),purpose:x.purpose,position:x.position,arrived:x.arrived===true};
    }
  }catch{storageEnabled=false}
}
function persist(){
  try{
    if(active)localStorage.setItem(KEY,JSON.stringify(active));
    else localStorage.removeItem(KEY);
    storageEnabled=true;
  }catch{storageEnabled=false}
  updateBrowserStatus();
}
function notice(message){
  clearTimeout(toastTimer);
  ui.toast.textContent=message;ui.toast.hidden=false;
  toastTimer=setTimeout(()=>{ui.toast.hidden=true},2500);
}
function updateBrowserStatus(){
  const line=$("privacyNote")||document.querySelector('[data-t="privacyNote"]');
  if(line){
    const offline=typeof navigator.onLine==="boolean"&&!navigator.onLine;
    line.textContent=!storageEnabled?t("storageWarning"):offline?t("offline"):t("privacyNote");
  }
}
function applyLocale(){
  document.documentElement.lang=lang;document.title=t("title");
  const meta=document.querySelector('meta[name="description"]');
  if(meta)meta.content=lang==="es"?"PETAL LINE, demo original de una fila virtual para un flower bar.":"PETAL LINE, an original virtual queue demo for a flower bar.";
  document.querySelectorAll("[data-t]").forEach(el=>{const value=t(el.dataset.t);if(typeof value==="string")el.textContent=value});
  document.querySelectorAll("[data-t-html]").forEach(el=>{const value=t(el.dataset.tHtml);if(typeof value==="string")el.innerHTML=value});
  ui.language.textContent=lang==="es"?"EN":"ES";
  ui.language.setAttribute("aria-label",lang==="es"?"Switch to English":"Cambiar a español");
  ui.name.placeholder=t("namePlaceholder");
  document.querySelector(".steps-nav").setAttribute("aria-label",t("demoAria"));
  document.querySelector(".queue-ticket").setAttribute("aria-label",t("queueAria"));
  render();
}
function switchLang(){
  lang=lang==="es"?"en":"es";
  const url=new URL(location.href);url.searchParams.set("lang",lang);
  history.replaceState(null,"",url.pathname+url.search+url.hash);
  applyLocale();
}
function currentStep(){
  if(!active)return "start";
  return active.position===0?"ready":"line";
}
function render(){
  const stage=currentStep();
  for(const part of ["start","line","ready"])$("screen-"+part).hidden=part!==stage;
  const order=["start","line","ready"],at=order.indexOf(stage);
  document.querySelectorAll(".track-step").forEach(el=>{
    const n=order.indexOf(el.dataset.step);
    el.classList.toggle("active",n===at);
    el.classList.toggle("done",n<at);
    if(n===at)el.setAttribute("aria-current","step");
    else el.removeAttribute("aria-current");
  });
  if(active){
    ui.position.textContent=String(active.position).padStart(2,"0");
    const ahead=Math.max(0,active.position-1);
    ui.ahead.textContent=String(ahead);
    ui.lineHello.textContent=t("lineHello")(active.name);
    ui.lineStatus.textContent=t("statusWaiting")(ahead);
    ui.readyMessage.textContent=t("readyMessage")(active.name);
    ui.ticketPurpose.textContent=t(active.purpose==="pickup"?"purposePickup":"purposeBouquet");
    ui.readyPurpose.textContent=t(active.purpose==="pickup"?"purposePickup":"purposeBouquet");
    ui.confirmation.hidden=!active.arrived;
    ui.arrived.hidden=active.arrived;
  }
  updateBrowserStatus();
  ui.scroller.scrollTop=0;
}
function join(e){
  e.preventDefault();
  const data=sampleInput();
  if([...data.name].length<2){
    ui.error.textContent=t("joinError");ui.error.hidden=false;ui.name.focus();return;
  }
  ui.error.hidden=true;
  active={name:data.name,purpose:data.purpose,position:4,arrived:false};
  persist();render();notice(t("joined"));
}
function advance(){
  if(!active||active.position===0)return;
  active.position=Math.max(0,active.position-1);
  persist();render();notice(t(active.position===0?"readyToast":"advanced"));
}
function leave(){
  active=null;persist();ui.form.reset();ui.name.value="";
  render();notice(t("left"));
}
function arrive(){
  if(!active||active.position!==0||active.arrived)return;
  active.arrived=true;persist();render();notice(t("confirmed"));
}
function init(){
  load();applyLocale();
  ui.language.addEventListener("click",switchLang);
  ui.form.addEventListener("submit",join);
  ui.name.addEventListener("input",()=>{ui.error.hidden=true});
  ui.advance.addEventListener("click",advance);
  ui.leave.addEventListener("click",leave);
  ui.arrived.addEventListener("click",arrive);
  ui.restart.addEventListener("click",leave);
  window.addEventListener("online",updateBrowserStatus);
  window.addEventListener("offline",updateBrowserStatus);
  window.addEventListener("storage",e=>{if(e.key===KEY){active=null;load();render()}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

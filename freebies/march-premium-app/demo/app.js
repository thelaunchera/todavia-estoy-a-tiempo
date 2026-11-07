(()=>{"use strict";
const KEY="tle_dayline_local_demo_v1",MAX_PROJECTS=16,MAX_STEPS=12;
const $=id=>document.getElementById(id);
const elements={
  title:$("idea-title"),notes:$("idea-notes"),form:$("idea-form"),formError:$("form-error"),
  count:$("idea-count"),sample:$("sample-btn"),saved:$("saved-section"),savedCount:$("saved-count"),list:$("project-list"),
  focusEmpty:$("focus-empty"),focusActive:$("focus-active"),focusTitle:$("focus-idea-title"),focusNotes:$("focus-idea-notes"),
  progressNumber:$("progress-number"),progressTrack:$("progress-track"),progressFill:$("progress-fill"),
  stepsCounter:$("steps-counter"),stepsEmpty:$("steps-empty"),stepsList:$("steps-list"),stepForm:$("step-form"),stepInput:$("step-input"),stepError:$("step-error"),
  doneEmpty:$("done-empty"),doneActive:$("done-active"),doneName:$("completed-name"),doneMeta:$("completed-meta"),
  toast:$("toast"),dialog:$("delete-dialog"),connection:$("connection-note"),
  privacy:$("privacy-line"),scroller:$("screen-scroll")
};
const i18n={
es:{
  storyTag:"UN CONCEPTO ORIGINAL, UNA EXPERIENCIA REAL",
  storyHeading:"Tu próxima gran idea <em>empieza pequeña.</em>",
  storySub:"Captúrala. Elige el siguiente paso. Celebra que lo hiciste. Tres momentos diseñados para sentirse como una app de verdad.",
  storyPrivate:"Prototipo funcional · datos locales",
  demoTag:"DEMO",
  captureCount:"01 / CAPTURAR",captureHeadline:"Toda gran idea empieza con un <em>quizás.</em>",
  captureDesc:"No tienes que tenerlo todo resuelto. Solo necesitas un lugar donde empezar.",
  ideaTitleLabel:"¿Qué tienes en mente?",ideaNoteLabel:"Una nota para tu yo del futuro <span>(opcional)</span>",
  captureAction:"Guardar mi idea",trySample:"Probar con una idea de ejemplo",myIdeas:"MIS IDEAS",
  focusCount:"02 / ENFOCAR",focusHeadline:"Una cosa a la <em>vez.</em>",
  focusDesc:"Lo importante no es hacerlo todo. Es saber qué sigue.",
  focusEmptyTitle:"Primero, captura una idea.",focusEmptyBody:"Dale un nombre y luego decide el primer paso.",goCapture:"Capturar una idea",
  activeIdea:"TU IDEA EN MARCHA",progressLabel:"Tu progreso",nextSteps:"LOS SIGUIENTES PASOS",
  stepsEmpty:"Una idea se mueve con un paso pequeño. Escribe el primero.",
  stepLabel:"¿Qué harás primero?",finishHint:"Marca el paso cuando esté listo. Puedes añadir más en cualquier momento.",
  doneCount:"03 / TERMINAR",doneHeadline:"Mira lo que <em>hiciste.</em>",
  doneDesc:"Una idea menos en tu cabeza. Un logro más en el mundo.",
  doneEmptyTitle:"Tu momento llegará.",doneEmptyBody:"Completa al menos un paso para celebrarlo aquí.",goFocus:"Volver a mis pasos",
  completedLabel:"HECHO POR TI. A TU MANERA.",completedHeading:"Lo hiciste <em>real.</em>",newIdeaAction:"Empezar otra idea",
  localStorageNote:"Este demo guarda tus ideas solo en este navegador.",
  tabCapture:"Capturar",tabFocus:"Enfocar",tabDone:"Terminar",
  deleteTitle:"¿Eliminar esta idea?",deleteDesc:"La idea y sus pasos se borrarán de este navegador.",
  cancel:"Cancelar",delete:"Eliminar",
  titleError:"Escribe al menos 3 caracteres para guardar tu idea.",
  tooManyProjects:"Ya tienes 16 ideas en este demo. Elimina alguna para continuar.",
  saved:"¡Idea guardada! Ahora elige el siguiente paso.",
  sampleLoaded:"Idea de ejemplo preparada. Toca «Guardar mi idea».",
  stepError:"Escribe un paso de al menos 3 caracteres.",
  tooManySteps:"Este demo permite hasta 12 pasos por idea.",
  added:"Paso añadido. ¡Vas avanzando!",unmarked:"Paso marcado como pendiente.",
  completed:"¡Lo lograste! Tu esfuerzo se nota.",
  deleted:"Idea eliminada.",stepDeleted:"Paso eliminado.",
  stepCount:(done,total)=>done+" de "+total+" pasos terminados",
  stepCounter:(done,total)=>done+"/"+total,
  remove:"Eliminar",markDone:"Marcar como terminado",markPending:"Marcar como pendiente",
  openIdea:"Abrir idea",pending:"En progreso",doneState:"Terminada",
  noStorage:"Tu navegador no permite guardar datos. Puedes usar el demo, pero se perderán al cerrar la página.",
  offline:"Sin conexión: puedes seguir usando el demo que ya cargaste. Tus datos están en este navegador.",
  localTitle:"DAYLINE — Demo interactivo | The Launch Era",
  progressAria:"Progreso de la idea",
  addStepAria:"Añadir paso",
  sampleTitle:"Lanzar una colección de accesorios",
  sampleNotes:"Elegir el primer producto, preparar fotografías y presentar una pequeña colección.",
  captureArt:"hazlo<br><i>real.</i>",
  artCaption:"DAYLINE / ESTUDIO DE FORMAS 001",
  stageAria:"Presentación editorial",
  navAria:"Navegación de DAYLINE"
},
en:{
  storyTag:"AN ORIGINAL CONCEPT, A REAL EXPERIENCE",
  storyHeading:"Your next big idea <em>starts small.</em>",
  storySub:"Capture it. Pick a next step. Celebrate doing it. Three moments designed to feel like a real app.",
  storyPrivate:"Working prototype · local data",
  demoTag:"DEMO",
  captureCount:"01 / CAPTURE",captureHeadline:"Every great idea starts with <em>maybe.</em>",
  captureDesc:"You don't have to have it all figured out. You just need a place to begin.",
  ideaTitleLabel:"What's on your mind?",ideaNoteLabel:"A note for future you <span>(optional)</span>",
  captureAction:"Save my idea",trySample:"Try a sample idea",myIdeas:"MY IDEAS",
  focusCount:"02 / FOCUS",focusHeadline:"One thing at a <em>time.</em>",
  focusDesc:"You don't need to do everything. You need to know what's next.",
  focusEmptyTitle:"Capture an idea first.",focusEmptyBody:"Give it a name, then choose your first step.",goCapture:"Capture an idea",
  activeIdea:"YOUR IDEA IN MOTION",progressLabel:"Your progress",nextSteps:"THE NEXT STEPS",
  stepsEmpty:"An idea moves forward one small step at a time. Write yours.",
  stepLabel:"What will you do first?",finishHint:"Check a step when it's done. Add more whenever you need.",
  doneCount:"03 / DONE",doneHeadline:"Look what you <em>did.</em>",
  doneDesc:"One less idea in your head. One more achievement in the world.",
  doneEmptyTitle:"Your moment is coming.",doneEmptyBody:"Complete at least one step to celebrate it here.",goFocus:"Back to my steps",
  completedLabel:"MADE BY YOU. YOUR WAY.",completedHeading:"You made it <em>real.</em>",newIdeaAction:"Start another idea",
  localStorageNote:"This demo saves your ideas only in this browser.",
  tabCapture:"Capture",tabFocus:"Focus",tabDone:"Done",
  deleteTitle:"Delete this idea?",deleteDesc:"The idea and its steps will be deleted from this browser.",
  cancel:"Cancel",delete:"Delete",
  titleError:"Enter at least 3 characters to save your idea.",
  tooManyProjects:"You have 16 ideas in this demo. Delete one to continue.",
  saved:"Idea saved! Now choose your next step.",
  sampleLoaded:"Sample idea is ready. Tap “Save my idea”.",
  stepError:"Enter a step with at least 3 characters.",
  tooManySteps:"This demo allows up to 12 steps per idea.",
  added:"Step added. You're making progress!",unmarked:"Step moved back to pending.",
  completed:"You did it! Look at what you made happen.",
  deleted:"Idea deleted.",stepDeleted:"Step deleted.",
  stepCount:(done,total)=>done+" of "+total+" steps completed",
  stepCounter:(done,total)=>done+"/"+total,
  remove:"Delete",markDone:"Mark as done",markPending:"Mark as pending",
  openIdea:"Open idea",pending:"In progress",doneState:"Completed",
  noStorage:"Your browser doesn't allow saving. You can still try this demo, but the ideas may disappear when you leave.",
  offline:"You're offline. This already-loaded demo still works, and your ideas stay in this browser.",
  localTitle:"DAYLINE — Interactive Demo | The Launch Era",
  progressAria:"Idea progress",
  addStepAria:"Add step",
  sampleTitle:"Launch a small accessories collection",
  sampleNotes:"Choose the first product, plan the photos, and introduce a small collection.",
  captureArt:"make it<br><i>happen.</i>",
  artCaption:"DAYLINE / FORM STUDY 001",
  stageAria:"Editorial presentation",
  navAria:"DAYLINE navigation"
}};
let lang=new URLSearchParams(location.search).get("lang")==="en"?"en":"es";
let projects=[],selectedId=null,current="capture",pendingDeleteId=null,storageOk=true,toastTimer=null;
const now=()=>Date.now();
const uid=()=>globalThis.crypto?.randomUUID?.()||"id-"+now()+"-"+Math.random().toString(36).slice(2);
const escNoHTML=text=>String(text||"").trim();
const currentProject=()=>projects.find(project=>project.id===selectedId)||null;
const doneCount=project=>(project?.steps||[]).filter(step=>step.done).length;
const isComplete=project=>!!(project&&project.steps.length&&project.steps.every(step=>step.done)&&project.completedAt);
const txt=key=>i18n[lang][key];
function showToast(message){
  clearTimeout(toastTimer);
  elements.toast.textContent=message;elements.toast.hidden=false;
  toastTimer=setTimeout(()=>{elements.toast.hidden=true},2900);
}
function showError(node,message){node.textContent=message;node.hidden=false}
function hideError(node){node.hidden=true;node.textContent=""}
function saveState(){
  try{localStorage.setItem(KEY,JSON.stringify({projects,selectedId,version:1}));storageOk=true}
  catch{storageOk=false}
  renderConnection();
}
function loadState(){
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||"null");
    if(raw&&Array.isArray(raw.projects)){
      projects=raw.projects.slice(0,MAX_PROJECTS).filter(p=>p&&typeof p.id==="string"&&typeof p.title==="string").map(p=>({
        id:p.id,title:p.title.slice(0,80),notes:typeof p.notes==="string"?p.notes.slice(0,300):"",
        createdAt:Number(p.createdAt)||now(),completedAt:Number(p.completedAt)||null,
        steps:Array.isArray(p.steps)?p.steps.slice(0,MAX_STEPS).filter(s=>s&&typeof s.id==="string"&&typeof s.title==="string").map(s=>({id:s.id,title:s.title.slice(0,100),done:s.done===true})): []
      }));
      selectedId=projects.some(p=>p.id===raw.selectedId)?raw.selectedId:projects[0]?.id||null;
    }
  }catch{storageOk=false}
}
function updateLanguage(){
  document.documentElement.lang=lang;document.title=txt("localTitle");
  const meta=document.querySelector('meta[name="description"]');
  if(meta)meta.content=lang==="es"?"DAYLINE, un mini demo interactivo para capturar una idea, decidir el siguiente paso y celebrar un resultado.":"DAYLINE, an interactive demo to capture an idea, choose the next step and celebrate a result.";
  for(const el of document.querySelectorAll("[data-i18n]")){
    const key=el.dataset.i18n,value=txt(key);
    if(typeof value!=="string")continue;
    if(value.includes("<em>")||value.includes("<span>"))el.innerHTML=value;
    else el.textContent=value;
  }
  for(const el of document.querySelectorAll("[data-placeholder-es]"))el.placeholder=el.dataset["placeholder"+(lang==="es"?"Es":"En")];
  $("lang-toggle").textContent=lang==="es"?"EN":"ES";
  $("lang-toggle").setAttribute("aria-label",lang==="es"?"Switch to English":"Cambiar a español");
  $("add-step").setAttribute("aria-label",txt("addStepAria"));
  $("add-step").title=txt("addStepAria");
  $("progress-track").setAttribute("aria-label",txt("progressAria"));
  document.querySelector(".capture-art>span").innerHTML=txt("captureArt");
  document.querySelector(".art-caption").textContent=txt("artCaption");
  document.querySelector(".story").setAttribute("aria-label",txt("stageAria"));
  document.querySelector(".bottom-nav").setAttribute("aria-label",txt("navAria"));
  elements.count.textContent=elements.title.value.length+"/80";
  render();
}
function setLang(next){
  if(lang===next)return;lang=next;
  const url=new URL(location.href);url.searchParams.set("lang",lang);
  history.replaceState(null,"",url.pathname+url.search+url.hash);
  updateLanguage();
}
function renderConnection(){
  const offline=typeof navigator.onLine==="boolean"&&!navigator.onLine;
  elements.connection.hidden=!(offline||!storageOk);
  elements.connection.textContent=!storageOk?txt("noStorage"):offline?txt("offline"):"";
  const storageLine=elements.privacy.querySelector("[data-i18n]");
  if(storageLine){storageLine.textContent=storageOk?txt("localStorageNote"):txt("noStorage")}
}
function navigate(screen){
  if(!["capture","focus","done"].includes(screen))return;
  current=screen;
  for(const value of ["capture","focus","done"])$("screen-"+value).hidden=value!==screen;
  document.querySelectorAll("[data-nav]").forEach(button=>{
    if(button.dataset.nav===screen)button.setAttribute("aria-current","page");
    else button.removeAttribute("aria-current");
  });
  render();
  elements.scroller.scrollTop=0;
}
function renderProjects(){
  elements.saved.hidden=projects.length===0;
  elements.savedCount.textContent=String(projects.length);
  elements.list.replaceChildren();
  for(const project of projects.slice().sort((a,b)=>b.createdAt-a.createdAt)){
    const row=document.createElement("div");row.className="project-item";
    const button=document.createElement("button");button.type="button";button.className="project-open";
    button.dataset.open=project.id;button.setAttribute("aria-label",txt("openIdea")+": "+project.title);
    const label=document.createElement("span");label.textContent=project.title;
    const mark=document.createElement("small");mark.textContent=isComplete(project)?"✓":"↗";
    mark.title=isComplete(project)?txt("doneState"):txt("pending");
    button.append(label,mark);
    const remove=document.createElement("button");remove.type="button";remove.className="project-delete";
    remove.textContent="×";remove.dataset.delete=project.id;remove.setAttribute("aria-label",txt("remove")+": "+project.title);
    row.append(button,remove);elements.list.append(row);
  }
}
function renderFocus(){
  const project=currentProject();
  elements.focusEmpty.hidden=!!project;
  elements.focusActive.hidden=!project;
  if(!project)return;
  elements.focusTitle.textContent=project.title;
  elements.focusNotes.textContent=project.notes;
  elements.focusNotes.hidden=!project.notes;
  const done=doneCount(project),total=project.steps.length;
  const percent=total?Math.round(100*done/total):0;
  elements.progressNumber.textContent=percent+"%";
  elements.progressTrack.setAttribute("aria-valuenow",String(percent));
  elements.progressFill.style.width=percent+"%";
  elements.stepsCounter.textContent=txt("stepCounter")(done,total);
  elements.stepsEmpty.hidden=total!==0;
  elements.stepsList.replaceChildren();
  for(const step of project.steps){
    const row=document.createElement("div");row.className="step-row"+(step.done?" is-done":"");
    const toggle=document.createElement("button");toggle.type="button";toggle.dataset.toggleStep=step.id;
    toggle.className="step-toggle"+(step.done?" is-done":"");
    toggle.textContent=step.done?"✓":"";
    toggle.setAttribute("aria-label",txt(step.done?"markPending":"markDone")+": "+step.title);
    toggle.setAttribute("aria-pressed",step.done?"true":"false");
    const label=document.createElement("span");label.className="step-label";label.textContent=step.title;
    const remove=document.createElement("button");remove.type="button";remove.dataset.removeStep=step.id;
    remove.className="step-remove";remove.textContent="×";remove.setAttribute("aria-label",txt("remove")+": "+step.title);
    row.append(toggle,label,remove);elements.stepsList.append(row);
  }
}
function renderDone(){
  const project=currentProject(),finished=isComplete(project);
  elements.doneEmpty.hidden=finished;elements.doneActive.hidden=!finished;
  if(finished){
    elements.doneName.textContent=project.title;
    elements.doneMeta.textContent=txt("stepCount")(doneCount(project),project.steps.length);
  }
}
function render(){
  renderProjects();renderFocus();renderDone();renderConnection();
}
function createIdea(event){
  event.preventDefault();hideError(elements.formError);
  const title=escNoHTML(elements.title.value),notes=escNoHTML(elements.notes.value);
  if(title.length<3){showError(elements.formError,txt("titleError"));elements.title.focus();return}
  if(projects.length>=MAX_PROJECTS){showError(elements.formError,txt("tooManyProjects"));return}
  const project={id:uid(),title:title.slice(0,80),notes:notes.slice(0,300),steps:[],createdAt:now(),completedAt:null};
  projects.unshift(project);selectedId=project.id;
  elements.form.reset();elements.count.textContent="0/80";
  saveState();navigate("focus");showToast(txt("saved"));elements.stepInput.focus();
}
function addStep(event){
  event.preventDefault();hideError(elements.stepError);
  const project=currentProject();if(!project){navigate("capture");return}
  const title=escNoHTML(elements.stepInput.value);
  if(title.length<3){showError(elements.stepError,txt("stepError"));elements.stepInput.focus();return}
  if(project.steps.length>=MAX_STEPS){showError(elements.stepError,txt("tooManySteps"));return}
  project.steps.push({id:uid(),title:title.slice(0,100),done:false});
  project.completedAt=null;
  elements.stepForm.reset();saveState();render();showToast(txt("added"));
  elements.stepInput.focus();
}
function toggleStep(id){
  const project=currentProject();const step=project?.steps.find(step=>step.id===id);if(!step)return;
  step.done=!step.done;
  const finished=project.steps.length>0&&project.steps.every(s=>s.done);
  project.completedAt=finished?now():null;
  saveState();render();
  if(finished){navigate("done");showToast(txt("completed"))}
  else if(!step.done)showToast(txt("unmarked"));
}
function removeStep(id){
  const project=currentProject();if(!project)return;
  const size=project.steps.length;project.steps=project.steps.filter(s=>s.id!==id);
  if(project.steps.length===size)return;
  project.completedAt=project.steps.length&&project.steps.every(s=>s.done)?project.completedAt||now():null;
  saveState();render();showToast(txt("stepDeleted"));
}
function openProject(id){
  if(!projects.some(p=>p.id===id))return;
  selectedId=id;saveState();navigate(isComplete(currentProject())?"done":"focus");
}
function promptDelete(id){
  const project=projects.find(p=>p.id===id);
  if(!project)return;
  pendingDeleteId=id;
  if(typeof elements.dialog.showModal==="function")elements.dialog.showModal();
}
function removeIdea(){
  if(!pendingDeleteId)return;
  projects=projects.filter(p=>p.id!==pendingDeleteId);
  if(selectedId===pendingDeleteId)selectedId=projects[0]?.id||null;
  pendingDeleteId=null;
  if(elements.dialog.open)elements.dialog.close();
  saveState();navigate("capture");showToast(txt("deleted"));
}
function sample(){
  elements.title.value=txt("sampleTitle");
  elements.notes.value=txt("sampleNotes");
  elements.count.textContent=elements.title.value.length+"/80";
  hideError(elements.formError);showToast(txt("sampleLoaded"));elements.title.focus();
}
function setOfflineNotice(){renderConnection()}
function init(){
  loadState();updateLanguage();navigate("capture");
  elements.title.addEventListener("input",()=>{elements.count.textContent=elements.title.value.length+"/80";hideError(elements.formError)});
  elements.stepInput.addEventListener("input",()=>hideError(elements.stepError));
  elements.form.addEventListener("submit",createIdea);
  elements.stepForm.addEventListener("submit",addStep);
  elements.sample.addEventListener("click",sample);
  $("lang-toggle").addEventListener("click",()=>setLang(lang==="es"?"en":"es"));
  document.querySelectorAll("[data-nav]").forEach(button=>button.addEventListener("click",()=>navigate(button.dataset.nav)));
  document.querySelectorAll("[data-go]").forEach(button=>button.addEventListener("click",()=>navigate(button.dataset.go)));
  $("new-idea-btn").addEventListener("click",()=>{elements.form.reset();elements.count.textContent="0/80";navigate("capture");elements.title.focus()});
  elements.list.addEventListener("click",event=>{
    const target=event.target.closest("button");
    if(!target)return;
    if(target.dataset.open)openProject(target.dataset.open);
    else if(target.dataset.delete)promptDelete(target.dataset.delete);
  });
  elements.stepsList.addEventListener("click",event=>{
    const target=event.target.closest("button");
    if(!target)return;
    if(target.dataset.toggleStep)toggleStep(target.dataset.toggleStep);
    else if(target.dataset.removeStep)removeStep(target.dataset.removeStep);
  });
  $("cancel-delete").addEventListener("click",()=>{pendingDeleteId=null;elements.dialog.close()});
  $("confirm-delete").addEventListener("click",removeIdea);
  elements.dialog.addEventListener("close",()=>{pendingDeleteId=null});
  window.addEventListener("online",setOfflineNotice);
  window.addEventListener("offline",setOfflineNotice);
  window.addEventListener("storage",event=>{if(event.key===KEY){loadState();render()}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();

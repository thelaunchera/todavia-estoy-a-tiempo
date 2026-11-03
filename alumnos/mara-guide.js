/* Mara · private classroom companion. Loaded only after verified classroom access.
   The private Project instructions live in Supabase, never in public source. */
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
const tasks={
 define:{es:['Define mi idea','Ayúdame a aclarar la oferta, público, objetivo y acción principal de mi web. Antes de escribir, pregunta por los datos imprescindibles y propón una ficha de proyecto verificable.'],en:['Define my idea','Help clarify my offer, audience, goal, and my website’s primary action. Ask only for essential missing details, then draft a project brief I can verify.']},
 visual:{es:['Identidad y referencias','Ayúdame a elegir una dirección visual original para mi negocio. Dime cómo reunir referencias sin copiarlas, definir colores y tipografías y decidir qué fotografías necesito.'],en:['Visual direction','Help me choose an original visual direction. Explain how to collect inspiration without copying, choose colors and typography, and plan the photos I need.']},
 photos:{es:['Fotos individuales','Dime qué fotos necesita cada sección de mi web y prepara un prompt para UNA foto cada vez, con composición, luz, encuadre y calidad. Usa solo marcas y recursos que tengo derecho a utilizar.'],en:['Individual photos','Plan the photos for each website section and write a prompt for ONE image at a time, including composition, lighting, framing and quality. Use only assets I am entitled to use.']},
 copy:{es:['Textos para mi web','Escribe la estructura y los textos de mi web con un hero claro, beneficios concretos, secciones útiles y una sola llamada a la acción. Primero confirma mis datos reales; no inventes reseñas ni resultados.'],en:['Website copy','Draft my website structure and copy with a clear hero, specific benefits, useful sections and one primary call to action. Confirm my actual facts first; never invent testimonials or results.']},
 build:{es:['Construir mi web o app','Quiero que ChatGPT construya por mí mi sitio web o aplicación COMPLETA usando el plugin AppDeploy, desde la idea inicial hasta una versión funcional que pueda usar. Tú haces el trabajo con las herramientas y conectores disponibles: define conmigo solo lo imprescindible, organiza la estructura, crea el diseño y las páginas, escribe los textos, incorpora mis fotos y mi marca, configura las funciones y formularios que necesite, revisa la versión móvil y comprueba que todo funcione. Primero usa AppDeploy para generar el primer mockup y dame su URL real en este chat para revisarlo; ese mockup es solo el comienzo, NO el resultado final. Después sigue construyendo, corrigiendo y completando el mismo proyecto con AppDeploy hasta tener una web o app terminada. Haz tú los cambios que te pida mediante ChatGPT y sus conectores; no me mandes a programar ni a hacer el trabajo manualmente en AppDeploy. Si AppDeploy no está conectado, enséñame a conectarlo y continúa cuando esté disponible. Muéstrame avances y verifica cada cambio en la URL. Pregúntame solamente por información, autorizaciones o decisiones que realmente necesites. No inventes URLs ni digas que hiciste algo sin comprobarlo. Antes de publicar definitivamente, activar cobros o conectar servicios sensibles, pide mi aprobación.'],en:['Build my website or app','I want ChatGPT to build my ENTIRE website or application for me using the AppDeploy plugin, from the initial idea to a complete, working product I can use. You do the work with the tools and connectors available: clarify only the essential requirements with me, plan the structure, build the design and pages, write the copy, add my photos and branding, set up the required features and forms, review the mobile experience, and test that everything works. First use AppDeploy to generate the initial mockup and give me its real preview URL here in the chat; that mockup is just the beginning, NOT the final deliverable. Then continue building, revising, and completing the same project using AppDeploy until the website or app is finished. Make the requested changes yourself through ChatGPT and its connectors; do not ask me to code or do the build manually inside AppDeploy. If AppDeploy is not connected, show me how to connect it and continue when available. Show me progress and verify each change at its URL. Ask only for essential information, permissions, or decisions. Never invent URLs or claim work you have not verified. Ask for my approval before final publication, enabling payments, or connecting sensitive services.']},
 fix:{es:['Arreglar un problema','Algo no está funcionando en mi web. Ayúdame a diagnosticarlo con la URL pública, una captura sin datos privados o el mensaje de error. Primero identifica la causa probable, luego sugiere el cambio mínimo y una prueba para verificarlo.'],en:['Fix a problem','Something is not working on my website. Help me diagnose it using a public URL, a screenshot without private data, or an error message. Identify the likely cause, suggest the smallest fix, and give me a way to test it.']},
 mobile:{es:['Revisar en el teléfono','Quiero revisar mi web en móvil (375 px). Evalúa jerarquía, tamaño de letras y botones, recortes de fotos, scroll, formularios y accesibilidad. Dame correcciones ordenadas por prioridad, sin cambiar mi marca.'],en:['Review on mobile','Help review my website at 375px. Check hierarchy, text and button sizes, image cropping, scrolling, forms and accessibility. Rank fixes by priority without changing my brand.']},
 publish:{es:['Lista antes de publicar','Prepara una revisión final de mi web: fotos, enlaces, botón principal, formularios, políticas cuando correspondan, funcionamiento móvil y permisos de uso. No publiques ni actives cobros sin mi aprobación.'],en:['Before publishing','Prepare a final website checklist: photos, links, primary button, forms, relevant policies, mobile behavior, and content rights. Do not publish or activate payments without my approval.']}
};
function t(language,es,en){return language==='en'?en:es;}
async function copy(value,feedback,language){
 let copied=false;
 try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);copied=true;}}catch{}
 if(!copied){
  const area=el('textarea');area.value=value;area.style.cssText='position:fixed;left:-9999px;top:0;';
  document.body.append(area);area.focus();area.select();
  try{copied=document.execCommand('copy');}catch{}
  area.remove();
 }
 feedback.textContent=copied?t(language,'Copiado. Pégalo en tu Proyecto de ChatGPT.','Copied. Paste it into your ChatGPT Project.'):t(language,'No se pudo copiar. Mantén presionado el texto y cópialo.','Copy unavailable. Press and hold the text to select and copy it.');
}
export async function mountMara(root,{db,courseId,getLanguage=()=> 'es'}){
 if(!root)throw Error('Mara container missing');
 const {data,error}=await db.from('podcast_class_learning_assets')
  .select('payload,status').eq('course_id',courseId).eq('asset_code','interactive_guides_v1').maybeSingle();
 if(error||data?.status!=='ready'||!data?.payload?.extras?.agent?.instructions){
  root.textContent=t(getLanguage(),'Las instrucciones privadas de Mara no están disponibles. Actualiza el aula o pide ayuda.','Mara’s private instructions are unavailable. Refresh the classroom or request help.');
  return {setLanguage(){}};
 }
 const agent=data.payload.extras.agent;
 let active='define',business='';
 const app=el('div','mara-app');root.replaceChildren(app);
 function render(){
  const lang=getLanguage()==='en'?'en':'es';
  const phrase=(es,en)=>t(lang,es,en);
  const instructions=lang==='en'?(agent.instructions_en||agent.instructions):(agent.instructions_es||agent.instructions);
  const start=lang==='en'?(agent.first_prompt_en||agent.first_prompt):(agent.first_prompt_es||agent.first_prompt);
  const steps=lang==='en'?(agent.setup_en||agent.setup):agent.setup;
  app.replaceChildren();
  const hero=el('header','mara-hero');
  hero.append(el('span','mara-eyebrow',phrase('TU ACOMPAÑANTE WEB / PROYECTO PRIVADO','YOUR WEBSITE COMPANION / PRIVATE PROJECT')));
  hero.append(el('h1','',phrase('Mara. Tu web, paso a paso.','Mara. Your website, step by step.')));
  hero.append(el('p','',phrase('Organiza tu idea, pide instrucciones claras y revisa cada avance sin complicaciones. Mara vive en tu propio Proyecto de ChatGPT.','Organize your idea, get clear instructions and verify your progress without complications. Mara lives inside your own ChatGPT Project.')));
  hero.append(el('span','mara-private',phrase('Tu espacio personal · No es un chat compartido','Your private space · Not a shared chat')));
  app.append(hero);
  const setup=el('section','mara-card');
  setup.append(el('span','mara-kicker',phrase('01 / CONFIGURA A MARA','01 / SET UP MARA')));
  setup.append(el('h2','',phrase('Actívala una sola vez.','Set it up once.')));
  setup.append(el('p','mara-muted',phrase('No necesitas crear otro usuario ni contratar una API. Usa un Proyecto privado en tu cuenta de ChatGPT.','You do not need a new account or a paid API. Use a private Project in your ChatGPT account.')));
  const ordered=el('ol','mara-steps');
  (Array.isArray(steps)?steps:[]).forEach(s=>ordered.append(el('li','',s)));
  setup.append(ordered);
  const actions=el('div','mara-setup-actions');
  const open=el('a','mara-action-primary',phrase('Abrir ChatGPT','Open ChatGPT'));open.href='https://chatgpt.com/';open.target='_blank';open.rel='noopener noreferrer';actions.append(open);
  setup.append(actions);app.append(setup);
  const instructionCard=el('section','mara-card');
  instructionCard.append(el('span','mara-kicker',phrase('02 / SU FORMA DE TRABAJAR','02 / HOW MARA WORKS')));
  instructionCard.append(el('h2','',phrase('Instrucciones del proyecto','Project instructions')));
  instructionCard.append(el('p','mara-muted',phrase('Pega este texto completo en Configuración del proyecto → Instrucciones. Así Mara seguirá tu método en todas las conversaciones de ese proyecto.','Paste the complete text under Project settings → Instructions so Mara follows your workflow throughout that Project.')));
  const instructionText=el('textarea','mara-code');instructionText.readOnly=true;instructionText.value=instructions||'';instructionText.rows=6;instructionText.setAttribute('aria-label',phrase('Instrucciones de Mara','Mara instructions'));instructionCard.append(instructionText);
  const instructionFeedback=el('span','mara-copy-feedback','');instructionFeedback.setAttribute('role','status');
  const instructionCopy=el('button','mara-copy',phrase('Copiar instrucciones','Copy instructions'));instructionCopy.type='button';instructionCopy.addEventListener('click',()=>void copy(instructions,instructionFeedback,lang));instructionCard.append(instructionCopy,instructionFeedback);
  app.append(instructionCard);
  const starter=el('section','mara-card');
  starter.append(el('span','mara-kicker',phrase('03 / PRIMERA CONVERSACIÓN','03 / FIRST CONVERSATION')));
  starter.append(el('h2','',phrase('Empieza con una idea.','Start with one idea.')));
  const starterText=el('textarea','mara-code');starterText.readOnly=true;starterText.rows=3;starterText.value=start||'';starter.append(starterText);
  const starterFeedback=el('span','mara-copy-feedback','');starterFeedback.setAttribute('role','status');
  const starterCopy=el('button','mara-copy',phrase('Copiar mensaje para empezar','Copy starter message'));starterCopy.type='button';starterCopy.addEventListener('click',()=>void copy(start,starterFeedback,lang));starter.append(starterCopy,starterFeedback);
  app.append(starter);
  const tools=el('section','mara-card mara-workbench');
  tools.append(el('span','mara-kicker',phrase('04 / QUÉ NECESITAS HOY','04 / WHAT DO YOU NEED TODAY')));
  tools.append(el('h2','',phrase('Pídeselo a Mara.','Ask Mara.')));
  tools.append(el('p','mara-muted',phrase('Elige un objetivo, copia el mensaje y pégalo en el mismo Proyecto. ChatGPT hará el trabajo con los conectores disponibles. Tú revisas y apruebas cada avance.','Choose a goal, copy the message and paste it into the same Project. ChatGPT will do the work using available connectors. You review and approve each milestone.')));
  const label=el('label','mara-input-label',phrase('Nombre del negocio (opcional)','Business name (optional)'));label.htmlFor='mara-business';
  const input=el('input','mara-business');input.id='mara-business';input.type='text';input.maxLength=100;input.autocomplete='off';input.value=business;input.placeholder=phrase('Ej. mi tienda o servicio','E.g. my shop or service');
  const buttons=el('div','mara-task-grid');const taskText=el('textarea','mara-task-text');taskText.readOnly=true;taskText.rows=5;taskText.setAttribute('aria-label',phrase('Mensaje para Mara','Message for Mara'));
  const refreshText=()=>{
   const task=tasks[active][lang];
   taskText.value=(business?phrase('Mi negocio: ','My business: ')+business+'.\n':'')+task[1]+'\n\n'+phrase('Dime exactamente qué hacer primero, cómo comprobarlo y pregúntame solo lo imprescindible. No asumas que tienes acceso a mis cuentas.','Tell me exactly what to do first and how to verify it. Ask only essential questions. Do not assume you have access to my accounts.');
  };
  input.addEventListener('input',()=>{business=input.value.trim().slice(0,100);refreshText();});
  Object.entries(tasks).forEach(([key,translations])=>{
   const b=el('button','mara-task',translations[lang][0]);b.type='button';
   b.setAttribute('aria-pressed',String(key===active));
   b.addEventListener('click',()=>{active=key;buttons.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));refreshText();});
   buttons.append(b);
  });
  const taskFeedback=el('span','mara-copy-feedback','');taskFeedback.setAttribute('role','status');
  const taskCopy=el('button','mara-copy',phrase('Copiar este mensaje','Copy this message'));taskCopy.type='button';taskCopy.addEventListener('click',()=>void copy(taskText.value,taskFeedback,lang));
  tools.append(label,input,buttons,taskText,taskCopy,taskFeedback);app.append(tools);refreshText();
  app.append(el('p','mara-disclaimer',phrase('ChatGPT puede crear y modificar tu web o app mediante AppDeploy y otros conectores disponibles. Las conexiones sensibles, los cobros y la publicación final requieren tus permisos y aprobación. Nunca compartas contraseñas ni datos privados.','ChatGPT can create and edit your website or app through AppDeploy and other available connectors. Sensitive connections, payments, and final publication require your permissions and approval. Never share passwords or private data.')));
 }
 render();
 return {setLanguage:render};
}

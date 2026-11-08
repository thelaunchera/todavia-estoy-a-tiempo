/* Additional translations are progressive enhancements: they must never block classroom access. */
let translateStaticClassroomText=()=>{};
let translationTask=null;
function updateStaticLanguage(lang){
 try{translateStaticClassroomText(lang);}catch(error){console.warn('Optional classroom translations unavailable',error?.name||'unknown');}
 if(translationTask)return;
 translationTask=import('./aula-textos-estaticos.js?v=20261103-learning-clarity-v1')
  .then(mod=>{if(typeof mod.translateStaticClassroomText==='function'){translateStaticClassroomText=mod.translateStaticClassroomText;try{translateStaticClassroomText(language);}catch(error){console.warn('Optional classroom translation failed',error?.name||'unknown');}}})
  .catch(error=>console.warn('Optional classroom language module unavailable',error?.name||'unknown'));
}

/* Español / US English — classroom UI only.
   Language changes presentation; never changes authentication or data visibility. */
const KEY='tle_classroom_language_v1';
let language='es';
try{language=localStorage.getItem(KEY)==='en'?'en':'es';}catch{}
export const getClassroomLanguage=()=>language;
export function setClassroomLanguage(next){
 language=next==='en'?'en':'es';
 try{localStorage.setItem(KEY,language);}catch{}
 applyClassroomLanguage();
}
export const lessonTranslations={
 '00':{title:'Welcome: let ChatGPT help build your website',description:'You direct the project. Explain your business, authorize the necessary connectors and approve results. ChatGPT researches, organizes and executes tasks its connected tools support. No coding is required.'},
 '01':{title:'Define your offer with ChatGPT',description:'Ask ChatGPT to research the real needs of your business, clarify the audience, define the main website goal and propose a structure. You verify facts and approve the direction.'},
 '02':{title:'Create your brand direction with AI',description:'Share references and ask ChatGPT to create an original mood board, colors, typography and visual direction. You approve the creative decisions. The mood board is a guide, not a finished hero image.'},
 '03':{title:'Prepare photos with ChatGPT and Google Drive',description:'Ask ChatGPT to plan and prepare individual photos for each website section and organize them through Google Drive when the connector permits uploads. Review accuracy and consistency. A hero video is taught separately as bonus content; it is not included in the core website build.'},
 '04':{title:'Make your hero communicate what matters',description:'Direct ChatGPT to write a clear hero that tells visitors what your business offers, who it serves and why it matters. Request approved product or service copy, FAQs and a single clear call to action. A moving hero is an optional bonus.'},
 '05':{title:'ChatGPT builds your website with AppDeploy',description:'Connect AppDeploy in ChatGPT and ask the AI to build the first mockup of YOUR website. When available, ChatGPT gives you a preview URL. Review it and request changes and photo placement in the same chat. You do not need to build manually in AppDeploy. Casa Brownie is only an example.'},
 '06':{title:'Fix your website with screenshots and ChatGPT',description:'Open your preview URL on your phone, take screenshots of issues and ask ChatGPT to fix the connected project while preserving everything else. Check text, photos, buttons, spacing and the 375 px mobile layout. Verify each result.'},
 '07':{title:'Ask ChatGPT for connectors and automations',description:'Ask ChatGPT to set up authorized workflows with connected tools such as Make only when your business needs them: contact, bookings, quotes, confirmations or payments. Approve permissions and test each flow before using it with real customers.'},
 '08':{title:'Ask AI to review, then approve your website',description:'Ask ChatGPT to audit the URL, hero, photos, mobile layout, links, contact, footer and any automations. Fix problems using screenshots, verify what actually works and save your final website link.'}
};
const translations=[
 ['.top-inner > span','MY CLASSROOM · YOUR FIRST AI WEBSITE'],
 ['.aula-entry-edition','EDITION / 01'],
 ['.aula-entry-eyebrow','YOUR FIRST AI WEBSITE'],
 ['#entry-title','Your space to keep creating.'],
 ['#student-greeting-title','Hello!'],
 ['.aula-entry-intro','Your lessons, materials and progress live here. Come back whenever you like and move at your own pace.'],
 ['.aula-auth-kicker','CLASS ACCESS'],
 ['[data-auth-mode="login"]','Sign in'],
 ['[data-auth-mode="register"]','First time here'],
 ['#aula-login-title','Good to see you here.'],
 ['#aula-auth-description','Sign in with the email you used to buy the course and your password.'],
 ['#login-form label[for="login-email"]','Email address'],
 ['#login-form label[for="login-password"]','Password'],
 ['#login-form .aula-auth-submit > span:first-child','Enter my class'],
 ['#register-form .aula-auth-submit > span:first-child','Create my account'],
 ['#reset-email-form .aula-auth-submit > span:first-child','Send recovery link'],
 ['#new-password-form .aula-auth-submit > span:first-child','Save my password'],
 ['#register-form .aula-auth-explain','Use your purchase email to create an account and confirm your email.'],
 ['#register-form label[for="register-email"]','Purchase email'],
 ['#register-form label[for="register-password"]','Create password'],
 ['#register-form label[for="register-confirm"]','Confirm password'],
 ['#reset-email-form .aula-auth-explain','We will email you a password recovery link. Check Spam or Promotions too.'],
 ['#reset-email-form label[for="reset-email"]','Account email'],
 ['#reset-email-form .aula-auth-back','← Back to sign in'],
 ['#new-password-form .aula-auth-explain','Choose a secure new password.'],
 ['#new-password-form label[for="new-password"]','New password'],
 ['#new-password-form label[for="new-password-confirm"]','Confirm new password'],
 ['.aula-password-toggle','Show'],
 ['#forgot-password-trigger','Forgot password?'],
 ['.aula-remember span','Remember this device for 24 hours'],
 ['.aula-auth-bottom > span','Content is available only with a confirmed purchase.'],
 ['.aula-auth-bottom .support','Need help?'],
 ['.aula-entry-microcopy','Learn at your pace. Progress saves to your account.'],
 ['#no-access .eyebrow','ACCESS PENDING'],
 ['#aula-no-access-title','We cannot confirm your purchase yet.'],
 ['#no-access > p:not(.eyebrow)','No confirmed purchase was found for this email. Check your purchase email or contact us.'],
 ['#no-access .support','Help with access'],
 ['#logout','Sign out'],
 ['.aula-rail-workspace','YOUR FIRST AI WEBSITE'],
 ['.aula-navigation .aula-nav-group:first-child','YOUR JOURNEY'],
 ['.aula-side-link[data-aula-view="inicio"] > span:last-child','My home'],
 ['.aula-side-link[data-aula-view="lecciones"] > span:last-child','My lessons'],
 ['.aula-side-link[data-aula-view="prompts"] > span:last-child','Prompt library'],
 ['[data-mara-nav-group]','WHEN YOU NEED HELP'],
 ['.aula-side-link[data-aula-view="mara"] > span:last-child','Mara · your web guide'],
 ['.aula-side-link[data-aula-view="inspiracion"] > span:last-child','Inspiration · Demos'],
 ['.aula-side-link[data-aula-view="materiales"] > span:last-child','Materials'],
 ['.aula-side-link[data-aula-view="bonos"] > span:last-child','Bonus library'],
 ['.aula-side-link[data-aula-view="comunidad"] > span:last-child','Ideas Club'],
 ['.aula-navigation .aula-side-link[data-course-help] > span:last-child','Get help'],
 ['.lesson-index h3','COURSE CONTENT'],
 ['.aula-rail-footer strong','Learn at your pace.'],
 ['.aula-rail-footer small','One step at a time.'],
 ['#aula-menu-open > span','Menu'],
 ['.aula-access-note','Protected access'],
 ['.aula-quick-help > span','Help'],
 ['#aula-refresh > span','Refresh'],
 ['#aula-section-back span','Back'],
 ['#aula-section-close span','Close'],
 ['#admin-preview-banner strong','Private course preview'],
 ['#admin-preview-banner p','Only the owner can review drafts. Students never see this notice.'],
 ['.dashboard-hero .dashboard-overline','FROM IDEA TO WEBSITE'],
 ['.dashboard-progress-heading','YOUR JOURNEY'],
 ['#lesson-unavailable','This video is not available yet. It will appear here when ready.'],
 ['#empty-lessons','Videos will appear here when ready. You can explore the materials in the meantime.'],
 ['.course-captions label','Video subtitles'],
 ['#course-caption-language option[value="auto"]','Choose in the video player'],
 ['#course-caption-help','Changing the classroom language does not change video audio. Audio and subtitle options will appear as they become available. Choose them in the player.'],
 ['.lesson-guidance','Watch the video, try the exercise, then mark the lesson complete.'],
 ['.lesson-completed','I finished this lesson'],
 ['#lesson-prev','Previous'],
 ['#lesson-next','Next lesson'],
 ['#lesson-picker-shell label','Choose a lesson'],
 ['.lesson-module-prompts-eyebrow','PRACTICE THIS LESSON'],
 ['#student-bonus-heading','How to unlock your bonuses'],
 ['#assigned-bonuses-heading','More resources for you'],
 ['.club-aula-hub .club-aula-eyebrow','COURSE COMMUNITY'],
 ['.club-aula-action-featured .club-aula-action-bottom','Share my progress'],
 ['.club-aula-action:nth-child(2) .club-aula-action-bottom','Ask my question'],
 ['.club-aula-action:nth-child(3) .club-aula-action-bottom','Explore projects'],
 ['.dashboard-setup-heading > p:last-child','You do not need to set up every tool today.'],
 ['.dashboard-progress-top > span','Your progress'],
 ['.dashboard-hero-secondary[data-aula-view="prompts"]','Explore prompts'],
 ['.dashboard-hero-secondary[data-aula-view="inspiracion"]','See inspiration'],
 ['.dashboard-learning-route .dashboard-announcements-header h2','Your idea can become a real website.'],
 ['.dashboard-learning-route .dashboard-announcements-header p','YOUR 3-STEP ROADMAP'],
 ['.dashboard-learning-steps > button:nth-child(1) strong','Clarify your idea'],
 ['.dashboard-learning-steps > button:nth-child(1) small','What you offer, who it is for, and what your website should do.'],
 ['.dashboard-learning-steps > button:nth-child(2) strong','Shape your brand'],
 ['.dashboard-learning-steps > button:nth-child(2) small','Prepare photos and a visual style with AI.'],
 ['.dashboard-learning-steps > button:nth-child(3) strong','Build and check'],
 ['.dashboard-learning-steps > button:nth-child(3) small','Create your website with AI and test it on your phone.'],
 ['#dashboard-setup-title','Your tools, made simple'],
 ['.dashboard-setup-details > summary','See the tools and what they do'],
 ['#dashboard-tools-title','Go straight to what you need'],
 ['.dashboard-tool[data-aula-view="prompts"] strong','Prompt library'],
 ['.dashboard-tool[data-aula-view="inspiracion"] strong','Inspiration and demos'],
 ['.dashboard-tool[data-aula-view="materiales"] strong','My materials'],
 ['.dashboard-tool[data-aula-view="comunidad"] strong','Ideas Club'],
 ['.dashboard-tool[data-aula-view="inspiracion"] > span:last-child','See examples before deciding how your website should look.'],
 ['.dashboard-tool[data-aula-view="prompts"] > span:last-child','Tell AI what you need to create.'],
 ['.dashboard-support strong','Not sure what to do next?'],
 ['.dashboard-support p','Tell us where you got stuck. We will help you keep going without losing progress.'],
 ['.dashboard-support [data-course-help]','Ask for help'],
 ['[data-aula-panel="lecciones"] .aula-section-heading h1','My lessons'],
 ['[data-aula-panel="lecciones"] .aula-section-heading > p:last-child','Choose a lesson and do its exercise. Progress saves to your account.'],
 ['[data-aula-panel="lecciones"] .eyebrow','LEARN STEP BY STEP'],
 ['#lesson-prompts-panel h4','Prompts for this lesson'],
 ['#lesson-prompts-panel .lesson-module-prompts-heading > p','Research the business first. Then copy the prompt and fill in the details in brackets.'],
 ['[data-aula-panel="bonos"] .aula-section-heading .eyebrow','KEEP CREATING'],
 ['[data-aula-panel="bonos"] .aula-section-heading h1','Bonus library'],
 ['[data-aula-panel="bonos"] .aula-section-heading p:last-child','A place for your extra resources.'],
 ['.bonus-library-top .eyebrow','YOUR BONUSES'],
 ['#bonus-library-heading','Available resources'],
 ['#club-aula-heading','Ideas Club'],
 ['.club-aula-hub-heading > p:last-child','Show your progress, ask questions and learn from other students in this class.'],
 ['.club-aula-action-featured strong','Share my project'],
 ['.club-aula-action:nth-child(2) strong','Ask a question'],
 ['.club-aula-action:nth-child(3) strong','Explore projects'],
 ['.course-support-heading .eyebrow','HELP INSIDE YOUR CLASSROOM'],
 
 ['.aula-install-eyebrow','QUICK ACCESS'],
 ['#aula-install-title','Add your classroom to your Home Screen'],
 ['.aula-install-intro > p:last-child','Open your lessons from an icon, just like an app.'],
 ['.aula-install-platform:nth-child(1) li:nth-child(1)','Open the classroom in Safari.'],
 ['.aula-install-platform:nth-child(1) li:nth-child(2)','Tap the Page Menu, then Share.'],
 ['.aula-install-platform:nth-child(1) li:nth-child(3)','Choose Add to Home Screen.'],
 ['.aula-install-platform:nth-child(1) li:nth-child(4)','Turn on Open as Web App, then tap Add.'],
 ['.aula-install-platform:nth-child(2) li:nth-child(1)','Open the classroom in Chrome.'],
 ['.aula-install-platform:nth-child(2) li:nth-child(2)','Tap the three-dot menu (⋮).'],
 ['.aula-install-platform:nth-child(2) li:nth-child(3)','Choose Install app or Add to Home screen.'],
 ['.aula-install-platform:nth-child(2) li:nth-child(4)','Confirm with Install or Add.'],
 ['.aula-install-note','This is a home-screen web app, not an App Store download. You need internet, and you may have to sign in again the first time.'],
 ['#course-help-title','How can I help?'],
 ['.course-support-heading p:not(.eyebrow)','Read the steps below or send me a message.'],
 ['#close-course-help','Close ×'],
 ['#course-help-form label[for="course-help-name"]','Your name'],
 ['#course-help-form label[for="course-help-email"]','Your email address'],
 ['#course-help-form label[for="course-help-topic"]','What do you need help with?'],
 ['#course-help-form label[for="course-help-message"]','Your message'],
 ['#course-help-topic option[value=""]','Choose a topic'],
 ['#course-help-topic option[value="Clase · acceso al aula"]','Classroom access'],
 ['#course-help-topic option[value="Clase · videos y lecciones"]','Videos and lessons'],
 ['#course-help-topic option[value="Clase · recursos y prompts"]','Materials and prompts'],
 ['#course-help-topic option[value="Clase · Club de Ideas"]','Ideas Club'],
 ['#course-help-topic option[value="Clase · otra consulta"]','Another class question'],
 ['.course-help-note','Do not include passwords or sensitive information. We will use your details only to reply. Privacy policy.'],
 ['#course-help-form button[type="submit"]','Send my request'],
 ['#cancel-course-help','Back to my classroom'],
 ['.bottom a[href*="privacidad"]','Privacy'],
 ['.bottom a[href*="terminos"]','Terms'],
 ['.aula-rail-close','×']
];
const accessibilityText=[
 ['.aula-brand-links > a:first-child','aria-label','Go to my classroom home'],
 ['#aula-owner-nav','aria-label','Back to administration'],
 ['.aula-auth-modes','aria-label','Sign-in options'],
 ['#aula-rail','aria-label','Classroom navigation'],
 ['.aula-rail-brand a','aria-label','Classroom home'],
 ['#aula-rail-close','aria-label','Close menu'],
 ['.aula-navigation','aria-label','Class sections'],
 ['.lesson-index','aria-label','Lesson list'],
 ['#lesson-picker','aria-label','Choose a lesson from this course'],
 ['#aula-rail-backdrop','aria-label','Close menu'],
 ['#aula-menu-open','aria-label','Open classroom menu'],
 ['#aula-public-language','aria-label','Language'],
 ['#aula-language','aria-label','Classroom language'],
 ['.aula-access-note','title','This area is for registered students'],
 ['.dashboard-hero-actions','aria-label','Get started in my classroom'],
 ['#student-progress','aria-label','Class progress'],
 ['.dashboard-support','aria-label','Student help'],
 ['#lesson-celebration-close','aria-label','Dismiss congratulations'],
 ['#lesson-prompts-panel','aria-label','Prompts for this lesson'],
 ['.lesson-navigation','aria-label','Lesson navigation'],
 ['#mara-guide','aria-label','Mara · your website guide'],
 ['#materiales-interactivos','aria-label','Practical class materials'],
 ['#inspiration-gallery','aria-label','Inspiration gallery of finished websites, photos and prompts'],
 ['.club-aula-actions','aria-label','What would you like to do in Ideas Club'],
 ['#close-course-help','aria-label','Close help']
];
const originalAccessibility=new WeakMap();
function translateAccessibility(){
 for(const [selector,attribute,english] of accessibilityText){
  for(const el of document.querySelectorAll(selector)){
   let original=originalAccessibility.get(el);
   if(!original){original={};originalAccessibility.set(el,original);}
   if(!Object.hasOwn(original,attribute))original[attribute]=el.getAttribute(attribute);
   const value=language==='en'?english:original[attribute];
   if(value===null)el.removeAttribute(attribute);else el.setAttribute(attribute,value);
  }
 }
}
const placeholders=[['#login-email','name@email.com'],['#login-password','Your password'],['#course-help-name','Your name'],['#course-help-email','you@email.com'],['#course-help-message','Tell us what happened and where you need help…']];
function translateElement(selector,english){
 for(const el of document.querySelectorAll(selector)){
  if(!el.dataset.tleOriginalText)el.dataset.tleOriginalText=el.textContent;
  if(selector==='#aula-login-title'||selector==='#aula-auth-description'){
   const mode=document.getElementById('login-panel')?.dataset.authMode||'login';
   const copies={
    login:['Qué gusto verte por aquí.','Entra con el correo de tu compra y tu contraseña.','Good to see you here.','Sign in with your purchase email and password.'],
    register:['Empieza por aquí.','Crea tu cuenta para tener tus lecciones en un solo lugar.','Start here.','Create your account to keep your lessons and materials in one place.'],
    reset:['Recupera tu acceso.','Te ayudamos a establecer una nueva contraseña.','Recover your access.','We will help you set a new password.'],
    newPassword:['Crea una nueva contraseña.','Escríbela dos veces para guardarla de forma segura.','Set a new password.','Enter it twice to save it securely.']
   };
   const c=copies[mode]||copies.login;
   const offset=language==='en'?2:0;
   el.textContent=c[offset+(selector==='#aula-auth-description'?1:0)];continue;
  }
  if(selector==='#entry-title'){
   el.innerHTML=language==='en'?'Your space to <em>keep creating.</em>':'Tu espacio para <em>seguir creando.</em>';continue;
  }
  if(selector==='#student-greeting-title'){
   const name=el.querySelector('#student-name')?.textContent||'';
   const spark=el.querySelector('.dashboard-greeting-spark')?.textContent||'✳';
   el.replaceChildren();
   el.append(document.createTextNode(language==='en'?'Hello, ':'¡Hola, '));
   const span=document.createElement('span');span.id='student-name';
   span.textContent=language==='en'&&name==='qué gusto verte'?'welcome':name|| (language==='en'?'welcome':'qué gusto verte');
   el.append(span,document.createTextNode(language==='en'?'! ':'! '));
   const star=document.createElement('span');star.className='dashboard-greeting-spark';
   star.setAttribute('aria-hidden','true');star.textContent=spark;
   el.append(star);continue;
  }
  if(selector==='.course-help-note'){
   if(!el.dataset.tleOriginalHtml)el.dataset.tleOriginalHtml=el.innerHTML;
   if(language==='en'){
    el.replaceChildren(document.createTextNode('Do not include passwords or sensitive information. We only use these details to reply. '));
    const privacy=document.createElement('a');privacy.href='../privacidad-en.html';privacy.hreflang='en';privacy.target='_blank';privacy.rel='noopener noreferrer';privacy.textContent='Privacy policy';el.append(privacy,document.createTextNode('.'));
   }else el.innerHTML=el.dataset.tleOriginalHtml;
   continue;
  }
  if(selector==='.dashboard-setup-details > summary'){
   // Keep the expand indicator and any nested accessibility markup intact.
   const label=[...el.childNodes].find(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim());
   if(label){
    if(!el.dataset.tleSummarySpanish)el.dataset.tleSummarySpanish=label.textContent.trim();
    label.textContent=(language==='en'?english:el.dataset.tleSummarySpanish)+' ';
   }
   continue;
  }
  if(selector==='.aula-password-toggle'){
   const input=document.getElementById(el.dataset.passwordToggle||'');
   const showing=input?.type==='text';
   const label=language==='en'?(showing?'Hide':'Show'):(showing?'Ocultar':'Mostrar');
   el.textContent=label;
   el.setAttribute('aria-label',language==='en'?(showing?'Hide password':'Show password'):(showing?'Ocultar contraseña':'Mostrar contraseña'));
   continue;
  }
  if(selector==='.lesson-completed'){
   const textNode=[...el.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
   if(textNode)textNode.textContent=' '+(language==='en'?english:'Ya terminé esta lección');
   continue;
  }
  el.textContent=language==='en'?english:el.dataset.tleOriginalText;
 }
}
export function applyClassroomLanguage(){
 document.documentElement.lang=language;
 document.title=language==='en'?'My classroom · Your First Website With AI | Todavía estoy a tiempo':'Mi aula · Tu primera web con IA | Todavía estoy a tiempo';
 const manifestLink=document.getElementById('aula-manifest');
 if(manifestLink)manifestLink.setAttribute('href',language==='en'?'./manifest-en.webmanifest':'./manifest.webmanifest');
 const appTitle=document.querySelector('meta[name="apple-mobile-web-app-title"]');
 if(appTitle)appTitle.setAttribute('content',language==='en'?'My Classroom':'Mi Aula');
 for(const selector of ['aula-language','aula-public-language']){
  const el=document.getElementById(selector);if(el&&el.value!==language)el.value=language;
 }
 for(const [selector,en] of translations){try{translateElement(selector,en);}catch(error){console.warn('Optional classroom label skipped',selector,error?.name||'unknown');}}
 const refresh=document.getElementById('aula-refresh');
 if(refresh){refresh.setAttribute('aria-label',language==='en'?'Refresh classroom page':'Actualizar la página del aula');refresh.title=refresh.getAttribute('aria-label');}
 for(const [selector,en] of placeholders){
  const el=document.querySelector(selector);if(!el)continue;
  if(!el.dataset.tleOriginalPlaceholder)el.dataset.tleOriginalPlaceholder=el.placeholder;
  el.placeholder=language==='en'?en:el.dataset.tleOriginalPlaceholder;
 }
 // Keep legal links in the selected language, even after switching back and forth.
 for(const stem of ['privacidad','terminos']){
  const link=document.querySelector('.bottom a[href*="'+stem+'"]');
  if(link){link.href='../'+stem+(language==='en'?'-en':'')+'.html';link.hreflang=language;}
 }
 translateAccessibility();
 updateStaticLanguage(language);
}
export function translationForLesson(lesson,lang=language){
 const en=lessonTranslations[lesson?.lesson_code];
 return lang==='en'&&en?en:{title:lesson?.title||'',description:lesson?.description||''};
}
export function bindClassroomLanguages(onChange){
 ['aula-language','aula-public-language'].forEach(id=>{
  const select=document.getElementById(id);if(!select)return;
  select.value=language;
  select.addEventListener('change',()=>{setClassroomLanguage(select.value);onChange?.(language);});
 });
 try{applyClassroomLanguage();}catch(error){document.documentElement.lang=language;console.warn('Classroom labels failed but access remains available',error?.name||'unknown');}
}

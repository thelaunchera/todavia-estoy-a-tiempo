/* Español latino / US English — classroom UI only.
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
 '00':{title:'Welcome: what you will build',description:'Choose your own business or a fictional practice business. Gather real details and use the first research prompt to define your audience, goal and open questions.'},
 '01':{title:'Define your offer without overcomplicating it',description:'Research what YOUR business needs and how to assess OTHER businesses before designing. Decide whether the goal is visibility, inquiries, quotes, bookings or sales. Confirm the ideal visitor and one clear next action.'},
 '02':{title:'Find inspiration without copying',description:'Build a distinct visual identity based on the business goal. Use the eight free composition prompts, create a mood board, choose colors, typography, photography and packaging direction where relevant.'},
 '03':{title:'Create individual product photos with ChatGPT',description:'Plan which photographs each section needs. Generate one image at a time, name and save every file separately, and show physical-product packaging only when appropriate.'},
 '04':{title:'Write a webpage people immediately understand',description:'Write each section for the visitor’s real needs. Use a clear hero, supporting messages and one next step that fits the business: learn more, request a quote, book or purchase.'},
 '05':{title:'Build Casa Brownie section by section · 05A/05B',description:'Build a webpage using approved copy and individual photos. For the Casa Brownie exercise: 05A includes header, still-photo hero, banner and products; 05B adds gifts, story, delivery illustration and footer. Preview after each step.'},
 '06':{title:'Make your webpage work beautifully on mobile',description:'Check the page on phones and tablets. Fix real issues with photo cropping, button size, typography and spacing one by one. Verify at 375 px before publishing.'},
 '07':{title:'Choose safe payments and automations',description:'Decide IF online checkout is needed. Some businesses only need contact, a booking or a quote. Test payments, confirmations and fulfillment before going live. Casa Brownie remains a demo without real charges.'},
 '08':{title:'Review, finish your footer and share your site',description:'Make sure the webpage solves the original need. Verify links, photos, contact, privacy, forms and checkout when applicable. Save your finished link to share with the class.'}
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
 ['.aula-navigation .aula-nav-group:first-child','YOUR SPACE'],
 ['.aula-side-link[data-aula-view="inicio"] > span:last-child','My home'],
 ['.aula-side-link[data-aula-view="lecciones"] > span:last-child','My lessons'],
 ['.aula-side-link[data-aula-view="prompts"] > span:last-child','Prompt library'],
 ['.aula-side-link[data-aula-view="inspiracion"] > span:last-child','Inspiration · Demos'],
 ['.aula-side-link[data-aula-view="materiales"] > span:last-child','Materials'],
 ['.aula-side-link[data-aula-view="bonos"] > span:last-child','My bonuses'],
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
 ['.dashboard-hero .dashboard-overline','MY LEARNING SPACE'],
 ['.dashboard-progress-heading','YOUR JOURNEY'],
 ['#lesson-unavailable','This video is still being prepared. It will appear here after approval.'],
 ['#empty-lessons','Lesson videos are being prepared. Meanwhile, explore prompts, materials and finished demos.'],
 ['.course-captions label','Video subtitles'],
 ['#course-caption-help','Lessons will be recorded in Latin American Spanish unless an English audio track is supplied. Reviewed subtitles will appear after video publication. You can also change subtitles in YouTube settings.'],
 ['.lesson-guidance','Watch, practice in your project, then mark this lesson complete.'],
 ['.lesson-completed','I finished this lesson'],
 ['.lesson-module-prompts-eyebrow','PRACTICE THIS LESSON'],
 ['#student-bonus-heading','Unlock your bonus'],
 ['#assigned-bonuses-heading','Your personal bonuses'],
 ['.club-aula-hub .club-aula-eyebrow','COURSE COMMUNITY'],
 ['.club-aula-action-featured .club-aula-action-bottom','Share my progress'],
 ['.club-aula-action:nth-child(2) .club-aula-action-bottom','Ask my question'],
 ['.club-aula-action:nth-child(3) .club-aula-action-bottom','Explore projects'],
 ['.dashboard-setup-heading > p:last-child','Begin with your lesson and prepare tools only when you need them.'],
 ['.dashboard-progress-top > span','Your progress'],
 ['.dashboard-hero-secondary[data-aula-view="prompts"]','Explore prompts'],
 ['.dashboard-hero-secondary[data-aula-view="inspiracion"]','See inspiration'],
 ['.dashboard-learning-route .dashboard-announcements-header h2','Your 3-step roadmap.'],
 ['.dashboard-learning-route .dashboard-announcements-header p','A CLEAR PLAN'],
 ['.dashboard-learning-steps > button:nth-child(1) strong','Understand the goal'],
 ['.dashboard-learning-steps > button:nth-child(1) small','Research the business and its needs first.'],
 ['.dashboard-learning-steps > button:nth-child(2) strong','Plan the visuals'],
 ['.dashboard-learning-steps > button:nth-child(2) small','Copy prompts and save individual photos.'],
 ['.dashboard-learning-steps > button:nth-child(3) strong','Build with references'],
 ['.dashboard-learning-steps > button:nth-child(3) small','Study finished websites, section by section.'],
 ['#dashboard-setup-title','Get your tools ready.'],
 ['.dashboard-setup-details > summary','See the tools you need'],
 ['#dashboard-tools-title','Your creative workspace'],
 ['.dashboard-tool[data-aula-view="prompts"] strong','Prompt library'],
 ['.dashboard-tool[data-aula-view="inspiracion"] strong','Inspiration and demos'],
 ['.dashboard-tool[data-aula-view="materiales"] strong','My materials'],
 ['.dashboard-tool[data-aula-view="comunidad"] strong','Ideas Club'],
 ['.dashboard-tool[data-aula-view="inspiracion"] > span:last-child','Individual photos, finished sites and prompts to learn from.'],
 ['.dashboard-tool[data-aula-view="prompts"] > span:last-child','Copy and adapt instructions to your own business.'],
 ['.dashboard-support strong','Need a hand?'],
 ['.dashboard-support p','Ask from here without losing your course progress.'],
 ['.dashboard-support [data-course-help]','Ask for help'],
 ['[data-aula-panel="lecciones"] .aula-section-heading h1','My lessons'],
 ['[data-aula-panel="lecciones"] .aula-section-heading > p:last-child','Choose a lesson from the menu. Your progress is saved to your account.'],
 ['[data-aula-panel="lecciones"] .eyebrow','LEARN STEP BY STEP'],
 ['#lesson-prompts-panel h4','Prompts for this lesson'],
 ['#lesson-prompts-panel .lesson-module-prompts-heading > p','Research the business needs first. Open a prompt, copy it, and replace every bracketed placeholder with your business details.'],
 ['[data-aula-panel="bonos"] .aula-section-heading h1','My bonuses'],
 ['[data-aula-panel="bonos"] .aula-section-heading p:last-child','Bonus materials are available only when your account meets the stated requirements.'],
 ['#club-aula-heading','Ideas Club'],
 ['.club-aula-hub-heading > p:last-child','Show your progress, ask questions and learn from other students in this class.'],
 ['.club-aula-action-featured strong','Share my project'],
 ['.club-aula-action:nth-child(2) strong','Ask a question'],
 ['.club-aula-action:nth-child(3) strong','Explore projects'],
 ['.aula-rail-close','×']
];
const placeholders=[['#login-email','name@email.com'],['#login-password','Your password']];
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
 for(const selector of ['aula-language','aula-public-language']){
  const el=document.getElementById(selector);if(el&&el.value!==language)el.value=language;
 }
 for(const [selector,en] of translations)translateElement(selector,en);
 const refresh=document.getElementById('aula-refresh');
 if(refresh){refresh.setAttribute('aria-label',language==='en'?'Refresh classroom page':'Actualizar la página del aula');refresh.title=refresh.getAttribute('aria-label');}
 for(const [selector,en] of placeholders){
  const el=document.querySelector(selector);if(!el)continue;
  if(!el.dataset.tleOriginalPlaceholder)el.dataset.tleOriginalPlaceholder=el.placeholder;
  el.placeholder=language==='en'?en:el.dataset.tleOriginalPlaceholder;
 }
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
 applyClassroomLanguage();
}

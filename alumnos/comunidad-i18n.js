/* Bilingual interface for the private Ideas Club. Member-submitted text is never translated or modified. */
const storageKey='tle_classroom_language_v1';
let language='es';
try{language=localStorage.getItem(storageKey)==='en'?'en':'es';}catch{}
const translations=[
 ['.club-skip','Skip to content'],
 ['#club-page-back','Back'],
 ['#club-page-close','Close ×'],
 ['.club-hero-copy .club-overline','A SPACE TO CREATE TOGETHER'],
 ['.club-hero-copy h1','Ideas Club'],
 ['.club-hero-copy > p','A community to share what you are building, learn from other students and ask questions. Projects do not need to be perfect.'],
 ['.club-hero-mark > span','SHARE · LEARN · GROW'],
 ['.club-hero-mark > strong','Ideas become real.'],
 ['#club-locked h2','This space is private.'],
 ['#club-locked > a','Back to my classroom'],
 ['#club-admin-banner > span','Owner preview · review and moderate conversations.'],
 ['#club-admin-return','Back to Studio'],
 ['.club-welcome .club-overline','YOUR CREATIVE SPACE'],
 ['.club-welcome h2','Learn by sharing.'],
 ['.club-welcome div:first-child > p:not(.club-private-note)','Post a screenshot, share your progress, or ask for feedback. Your classmates can see only content shared to their authorized space.'],
 ['.club-private-note','Members only. Choose what you share.'],
 ['.club-profile label','What should we call you?'],
 ['#club-save-name','Save'],
 ['.club-profile small','We show your chosen display name, never your email.'],
 ['[data-channel="charla"]','Community'],
 ['[data-channel="proyectos"]','Projects'],
 ['[data-channel="preguntas"]','Questions'],
 ['.club-compose-top .club-overline','YOUR TURN'],
 ['#club-compose-heading','What are you creating?'],
 ['label[for="club-post-body"]','Share an idea, progress update or question'],
 ['#club-post-form .club-form-row > label:first-child','Share in'],
 ['#club-post-form .club-form-row > label:nth-child(2)','Project name (optional)'],
 ['#club-post-scope [value="club"]','Whole club'],
 ['#club-post-scope [value="curso"]','Your First AI Website'],
 ['#club-view-scope [value="all"]','My available spaces'],
 ['#club-view-scope [value="club"]','Whole club'],
 ['#club-view-scope [value="curso"]','My class'],
 ['.club-upload-button','Add a project screenshot'],
 ['#club-clear-image','Remove photo'],
 ['.club-compose-bottom > p','Only share photos and details you want other members to see. Never post passwords, phone numbers, addresses or customer data.'],
 ['#club-submit','Publish to club'],
 ['.club-feed-heading .club-overline','LET’S TALK ABOUT YOUR WORK'],
 ['#club-feed-title','Conversations'],
 ['#club-refresh','Refresh'],
 ['label[for="club-view-scope"]','View posts from'],
 ['#club-feed-empty','No posts yet. Start by sharing a small update or a question.'],
 ['.club-aside .club-side-card:first-child .club-overline','START HERE'],
 ['.club-aside .club-side-card:first-child h3','Your first project deserves to be seen.'],
 ['.club-aside .club-side-card:first-child p','A mobile screenshot, a webpage link or one clear question is enough to begin.'],
 ['.club-aside .club-guide .club-overline','COMMUNITY GUIDELINES'],
 ['.club-aside .club-guide h3','Make this space welcoming.'],
 ['.club-aside .club-guide p:first-of-type','Be respectful, offer useful feedback, and never share someone else’s private data or images without permission.'],
 ['.club-aside .club-guide p:last-of-type','Posts can be reported and moderated.'],
 ['.club-aside .club-other-classes .club-overline','YOUR CLASS'],
 ['.club-aside .club-other-classes h3','Learn and share in one space.'],
 ['.club-aside .club-other-classes > a','Your First AI Website'],
 ['.club-aside .club-other-classes > small','More workshops will appear here if and when they are available.']
];
export const communityLanguage=()=>language;
export const communityText=(es,en)=>language==='en'?en:es;
function setText(selector,en){
 for(const node of document.querySelectorAll(selector)){
  if(!Object.hasOwn(node.dataset,'courseEs'))node.dataset.courseEs=node.textContent;
  const value=language==='en'?en:node.dataset.courseEs;
  if(selector==='.club-hero-copy h1'){
   node.innerHTML=language==='en'?'Ideas <em>Club.</em>':'Club de <em>Ideas.</em>';continue;
  }
  if(selector==='.club-welcome h2'){
   node.innerHTML=language==='en'?'Learning grows <em>together.</em>':'Aquí también se aprende <em>compartiendo.</em>';continue;
  }
  node.textContent=value;
 }
}
export function applyCommunityLanguage(){
 document.documentElement.lang=language;
 for(const [selector,en] of translations)setText(selector,en);
 const placeholders={
  'club-display-name':['Tu nombre o apodo','Your display name'],
  'club-post-body':['Hoy avancé con mi primera web…','Today I worked on my first webpage…'],
  'club-post-title':['Mi primera página','My first webpage']
 };
 for(const [id,[es,en]] of Object.entries(placeholders)){
  const field=document.getElementById(id);
  if(field)field.placeholder=language==='en'?en:es;
 }
 const select=document.getElementById('club-language');
 if(select&&select.value!==language)select.value=language;
}
export function bindCommunityLanguage(){
 const select=document.getElementById('club-language');
 if(select){
  select.value=language;
  select.addEventListener('change',()=>{
   language=select.value==='en'?'en':'es';
   try{localStorage.setItem(storageKey,language);}catch{}
   applyCommunityLanguage();
  });
 }
 applyCommunityLanguage();
}

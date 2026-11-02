/* Portada para quien ya entró a su clase: sin ventas, otros productos ni pasos de administración. */
const $=id=>document.getElementById(id);
const write=(id,value)=>{const n=$(id);if(n)n.textContent=value;};
const validVideo=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{11}$/.test(id);
const pick=(lang,es,en)=>lang==='en'?en:es;
function addNotice(list,tag,heading,body){
 const li=document.createElement('li');li.className='dashboard-notice';
 const dot=document.createElement('span');dot.className='dashboard-notice-mark';dot.setAttribute('aria-hidden','true');
 const copy=document.createElement('div');
 for(const [tagName,textValue,klass] of [['span',tag,'dashboard-notice-label'],['strong',heading,''],['p',body,'']]){
  const n=document.createElement(tagName);n.textContent=textValue;if(klass)n.className=klass;copy.append(n);
 }
 li.append(dot,copy);list.append(li);
}
export function renderAulaInicio({lessons=[],done=new Set(),resources=[],adminPreview=false,projectShared=false,
 language='es',onLesson,onView,localizeLesson}={}){
 language=language==='en'?'en':'es';
 const list=$('dashboard-notices'),next=$('dashboard-next-action'),hero=$('dashboard-hero-continue');
 if(!list||!next)return;
 const ready=lessons.filter(l=>l.status==='ready'&&validVideo(l.youtube_video_id));
 const pending=ready.find(l=>!done.has(l.lesson_code));
 const completed=ready.filter(l=>done.has(l.lesson_code)).length;
 const showProgress=!adminPreview&&ready.length>0;
 $('dashboard-progress-real').hidden=!showProgress;
 $('dashboard-progress-empty').hidden=showProgress;
 $('dashboard-progress-shell').dataset.mode=showProgress?'progress':'waiting';
 write('student-greeting-message',pick(language,
  'Bienvenido a tu espacio para crear. Aquí puedes investigar tu idea, elegir un estilo, preparar fotos y construir tu página paso a paso.',
  'Welcome to your creative workspace. Research your idea, choose a style, prepare photos and build your website one step at a time.'));
 write('dashboard-greeting-tip',pick(language,
  'Primero entiende qué necesita tu negocio. Después comienza a diseñar.',
  'Start by understanding what your business needs. Then begin designing.'));
 write('dashboard-progress-empty-title',pick(language,'Tu proyecto, a tu ritmo.','Your project, your pace.'));
 write('dashboard-progress-empty-desc',pick(language,
  'Tu biblioteca de prompts, materiales y ejemplos ya puede ayudarte a preparar tu web.',
  'Your prompt library, materials and examples are ready to help you prepare your site.'));
 const allDone=ready.length>0&&completed===ready.length;
 let onAction;
 if(!ready.length){
  write('dashboard-next-kicker',pick(language,'TU PRIMER PASO','YOUR FIRST STEP'));
  write('dashboard-next-title',pick(language,'Aquí empieza tu primera web.','Your first website starts here.'));
  write('dashboard-next-description',pick(language,
   'Investiga qué necesita el negocio, copia tu primer prompt y guarda una idea de estilo. No tienes que hacer todo el mismo día.',
   'Research what the business needs, copy your first prompt and save a visual direction. You do not have to do everything today.'));
  write('dashboard-next-detail',pick(language,'Comienza por tu idea · Materiales disponibles','Start with your idea · Materials ready'));
  write('dashboard-next-action',pick(language,'Abrir mis prompts','Open my prompts'));
  onAction=()=>onView?.('prompts');
 }else if(pending){
  const index=ready.indexOf(pending),originalIndex=lessons.indexOf(pending);
  const translated=localizeLesson?.(pending)||pending;
  write('dashboard-next-kicker',completed?pick(language,'CONTINÚA AQUÍ','PICK UP HERE'):pick(language,'TU PRIMER PASO','YOUR FIRST STEP'));
  write('dashboard-next-title',translated.title||pending.title||'Tu siguiente lección');
  write('dashboard-next-description',translated.description||pending.description||'');
  write('dashboard-next-detail',pick(language,'Lección ','Lesson ')+(index+1)+' / '+ready.length+(pending.minutes?' · '+pending.minutes+' min':''));
  write('dashboard-next-action',completed?pick(language,'Continuar lección','Continue lesson'):pick(language,'Empezar lección','Start lesson'));
  onAction=()=>onLesson?.(originalIndex);
 }else{
  write('dashboard-next-kicker',pick(language,'SIGUIENTE PASO','NEXT STEP'));
  write('dashboard-next-title',pick(language,'Terminaste las lecciones disponibles.','You finished the available lessons.'));
  write('dashboard-next-description',pick(language,
   projectShared?'Tu web ya está compartida. Puedes revisar tus recursos o conversar con otras personas.':'Comparte una captura o enlace de tu web en el Club de Ideas.',
   projectShared?'Your website is shared. Review your resources or join the conversation.':'Share a screenshot or your site link in the Ideas Club.'));
  write('dashboard-next-detail',completed+' / '+ready.length+' '+pick(language,'lecciones completadas','lessons completed'));
  write('dashboard-next-action',pick(language,'Abrir Club de Ideas','Open Ideas Club'));
  onAction=()=>onView?.('comunidad');
 }
 next.onclick=onAction;
 if(hero){
  hero.textContent=ready.length?pick(language,'Continuar mi clase','Continue my course'):pick(language,'Empezar con mis prompts','Start with my prompts');
  hero.onclick=onAction;
 }
 list.replaceChildren();
 if(!ready.length){
  addNotice(list,pick(language,'VIDEOS','VIDEOS'),pick(language,'Los videos están en preparación','Videos are being prepared'),
   pick(language,'Mientras tanto, los materiales, prompts y ejemplos se pueden consultar.','Meanwhile, you can review materials, prompts and examples.'));
 }else{
  addNotice(list,pick(language,'LECCIONES','LESSONS'),
    ready.length+' '+(ready.length===1?pick(language,'video disponible','video available'):pick(language,'videos disponibles','videos available')),
   pick(language,'Tu progreso se guarda al terminar cada lección.','Your progress is saved as you complete each lesson.'));
 }
 addNotice(list,pick(language,'MATERIALES','MATERIALS'),pick(language,'Cuaderno y biblioteca','Workbook & library'),
  pick(language,'Los ejercicios, prompts y ejemplos están en tu espacio de trabajo.','Exercises, prompts and examples live in your workspace.'));
 addNotice(list,pick(language,'COMUNIDAD','COMMUNITY'),pick(language,'Club de Ideas','Ideas Club'),
  pick(language,'Comparte solamente los avances que quieras enseñar.','Share only the work you feel comfortable showing.'));
 write('dashboard-tool-materials',pick(language,'Cuaderno, guías y checklist','Workbook, guides and checklist'));
 write('dashboard-tool-community',projectShared?pick(language,'Proyecto compartido','Project shared'):pick(language,'Comparte tus avances','Share your progress'));
}

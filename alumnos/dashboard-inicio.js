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
  '¿No sabes por dónde empezar tu web? Cuéntale a la IA qué hace tu negocio y construye a partir de ahí.',
  'Not sure where to start your website? Tell AI what your business does and build from there.'));
 write('dashboard-greeting-tip',pick(language,
  'Tú tomas las decisiones y apruebas el resultado. Con las herramientas que autorices, la IA puede investigar, crear y organizar por ti.',
  'You make the decisions and approve the result. With tools you authorize, AI can research, create and organize for you.'));
 write('dashboard-progress-empty-title',pick(language,'Tu proyecto, a tu ritmo.','Your project, your pace.'));
 write('dashboard-progress-empty-desc',pick(language,
  'Empieza con ChatGPT y revisa tus conexiones. Los videos aparecerán cuando estén grabados.',
  'Start with ChatGPT and check your connections. Videos will appear when recorded.'));
 const allDone=ready.length>0&&completed===ready.length;
 let onAction;
 if(!ready.length){
  write('dashboard-next-kicker',pick(language,'TU PRIMER PASO','YOUR FIRST STEP'));
  write('dashboard-next-title',pick(language,'Aquí empieza tu primera web.','Your first website starts here.'));
  write('dashboard-next-description',pick(language,
   'Primero abre ChatGPT y revisa las conexiones. Después sigue los cuatro videos.',
   'Open ChatGPT and check your connections first. Then follow the four videos.'));
  write('dashboard-next-detail',pick(language,'Comienza por tu idea · Materiales disponibles','Start with your idea · Materials ready'));
  write('dashboard-next-action',pick(language,'Ver mis 4 videos','See my 4 videos'));
  onAction=()=>onView?.('lecciones');
 }else if(pending){
  const index=ready.indexOf(pending),originalIndex=lessons.indexOf(pending);
  const translated=localizeLesson?.(pending)||pending;
  write('dashboard-next-kicker',completed?pick(language,'CONTINÚA AQUÍ','PICK UP HERE'):pick(language,'TU PRIMER PASO','YOUR FIRST STEP'));
  write('dashboard-next-title',translated.title||pending.title||'Tu siguiente lección');
  write('dashboard-next-description',pick(language,
    'Mira cómo se hace y aplícalo a tu negocio. Una lección, un resultado que puedas comprobar.',
    'See how it works and apply it to your business. One lesson, one result you can check.'));
  write('dashboard-next-detail',pick(language,'Lección ','Lesson ')+(index+1)+' / '+ready.length+(pending.minutes?' · '+pending.minutes+' min':''));
  write('dashboard-next-action',completed?pick(language,'Continuar lección','Continue lesson'):pick(language,'Empezar lección','Start lesson'));
  onAction=()=>onLesson?.(originalIndex);
 }else{
  write('dashboard-next-kicker',pick(language,'SIGUIENTE PASO','NEXT STEP'));
  write('dashboard-next-title',pick(language,'Terminaste las lecciones disponibles.','You finished the available lessons.'));
  write('dashboard-next-description',pick(language,
   projectShared?'¡Tu web ya está compartida! Puedes revisar tus materiales.':'Comparte tu web en el Club de Ideas para cerrar este recorrido.',
   projectShared?'Your website is shared! You can review your materials.':'Share your website in Ideas Club to finish this journey.'));
  write('dashboard-next-detail',completed+' / '+ready.length+' '+pick(language,'lecciones completadas','lessons completed'));
  write('dashboard-next-action',pick(language,'Abrir Club de Ideas','Open Ideas Club'));
  onAction=()=>onView?.('comunidad');
 }
 next.onclick=onAction;
 if(hero){
  hero.textContent=ready.length?pick(language,'Continuar mi clase','Continue my course'):pick(language,'Ver mis 4 videos','See my 4 videos');
  hero.onclick=onAction;
 }
 list.replaceChildren();
 if(!ready.length){
  addNotice(list,pick(language,'VIDEOS','VIDEOS'),pick(language,'Los videos están en preparación','Videos are being prepared'),
   pick(language,'Mientras tanto, puedes abrir ChatGPT y los enlaces de cada video.','Meanwhile, open ChatGPT and the links provided with each video.'));
 }else{
  addNotice(list,pick(language,'LECCIONES','LESSONS'),
    ready.length+' '+(ready.length===1?pick(language,'video disponible','video available'):pick(language,'videos disponibles','videos available')),
   pick(language,'Tu progreso se guarda al terminar cada lección.','Your progress is saved as you complete each lesson.'));
 }
 addNotice(list,pick(language,'MATERIALES','MATERIALS'),pick(language,'Cuaderno y biblioteca','Workbook & library'),
  pick(language,'Los ejercicios, prompts y ejemplos están en tu espacio de trabajo.','Exercises, prompts and examples live in your workspace.'));
 addNotice(list,pick(language,'COMUNIDAD','COMMUNITY'),pick(language,'Club de Ideas','Ideas Club'),
  pick(language,'Comparte solamente los avances que quieras enseñar.','Share only the work you feel comfortable showing.'));
 write('dashboard-tool-materials',pick(language,'Guías y revisiones para tu web','Guides and checks for your website'));
 write('dashboard-tool-community',projectShared?pick(language,'Proyecto compartido','Project shared'):pick(language,'Comparte tus avances','Share your progress'));
}

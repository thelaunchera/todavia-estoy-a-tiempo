/* Inicio del aula: indicadores basados en lecciones y recursos reales, sin avisos inventados. */
const $ = id => document.getElementById(id);
function write(id,value){const node=$(id);if(node)node.textContent=value;}
function addNotice(list,tag,heading,body,tone='neutral'){
 const item=document.createElement('li');
 item.className='dashboard-notice';item.dataset.tone=tone;
 const marker=document.createElement('span');marker.className='dashboard-notice-mark';marker.setAttribute('aria-hidden','true');
 const copy=document.createElement('div');
 const label=document.createElement('span');label.className='dashboard-notice-label';label.textContent=tag;
 const title=document.createElement('strong');title.textContent=heading;
 const paragraph=document.createElement('p');paragraph.textContent=body;
 copy.append(label,title,paragraph);item.append(marker,copy);list.appendChild(item);
}
function validVideo(id){return typeof id==='string' && /^[A-Za-z0-9_-]{11}$/.test(id);}
export function renderAulaInicio({lessons=[],done=new Set(),resources=[],adminPreview=false,projectShared=false,onLesson,onView}={}){
 const list=$('dashboard-notices');
 const nextButton=$('dashboard-next-action');
 if(!list||!nextButton)return;
 const ready=lessons.filter(l=>l.status==='ready'&&validVideo(l.youtube_video_id));
 const pending=ready.find(l=>!done.has(l.lesson_code));
 const completed=ready.filter(l=>done.has(l.lesson_code)).length;
 const readyMaterials=resources.filter(r=>r.status==='ready'&&!r.resource_code?.startsWith('bonus_')&&/^https:\/\//i.test(r.url||''));
 const showProgress=!adminPreview&&ready.length>0;
 $('dashboard-progress-real').hidden=!showProgress;
 $('dashboard-progress-empty').hidden=showProgress;
 $('dashboard-progress-shell').dataset.mode=adminPreview?'admin':showProgress?'progress':'waiting';
 write('student-greeting-message',adminPreview
  ? 'Revisa el contenido y la experiencia antes de abrir las puertas de esta clase.'
  : ready.length ? 'Aquí tienes tus lecciones, recursos y próximos pasos, todo en un solo lugar.'
    : 'Tu espacio está preparado. Las lecciones aparecerán aquí cuando estén publicadas.');
 write('dashboard-progress-empty-title',adminPreview?'Vista previa privada':'Un espacio para empezar');
 write('dashboard-progress-empty-desc',adminPreview
  ? 'Los avances de esta vista no cuentan como progreso de alumnos.'
  : 'Tu recorrido se mostrará aquí cuando esté disponible la primera lección.');
 const allDone=ready.length>0&&completed===ready.length;
 let buttonAction;
 if(adminPreview){
  write('dashboard-next-kicker','REVISIÓN DE LA CLASE');
  write('dashboard-next-title',lessons.length?'Comprueba las lecciones antes de publicar.':'Tu primera lección empieza aquí.');
  write('dashboard-next-description',lessons.length
   ? 'Hay '+lessons.length+' lecciones registradas. Revisa los videos y materiales sin modificar los avances de tus estudiantes.'
   : 'Todavía no hay lecciones registradas. Desde el Estudio podrás prepararlas antes de abrir el aula.');
  write('dashboard-next-detail',ready.length+' '+(ready.length===1?'lista para publicar':'listas para publicar')+' · '+(lessons.length-ready.length)+' en preparación');
  write('dashboard-next-action','Revisar las lecciones');
  buttonAction=()=>onView?.('lecciones');
 }else if(!ready.length){
  write('dashboard-next-kicker','ESTAMOS PREPARANDO TU CLASE');
  write('dashboard-next-title','Aquí empieza tu primera web.');
  write('dashboard-next-description','Los videos todavía no están publicados. Aquí podrás empezar por el primer módulo cuando esté disponible. Mientras tanto, puedes escribirnos si necesitas algo.');
  write('dashboard-next-detail','Aún no hay videos disponibles');
  write('dashboard-next-action','Escribirnos desde aquí');
  buttonAction=()=>document.querySelector('.dashboard-support [data-course-help]')?.click();
 }else if(pending){
  const index=ready.indexOf(pending);
  write('dashboard-next-kicker',completed?'CONTINÚA POR AQUÍ':'TU PRIMER PASO');
  write('dashboard-next-title',pending.title||'Tu siguiente lección');
  write('dashboard-next-description',pending.description||'Mira el video y practica a tu ritmo. Tu avance se guardará en tu cuenta.');
  write('dashboard-next-detail','Lección '+(index+1)+' de '+ready.length+(pending.minutes?' · '+pending.minutes+' min':''));
  write('dashboard-next-action',completed?'Continuar esta lección':'Empezar esta lección');
  const lessonIndex=lessons.indexOf(pending);
  buttonAction=()=>onLesson?.(lessonIndex);
 }else{
  write('dashboard-next-kicker','TU PRÓXIMO PASO');
  write('dashboard-next-title','Terminaste las lecciones disponibles.');
  write('dashboard-next-description',projectShared
   ? 'Ya compartiste tu proyecto. Puedes volver a tus materiales o seguir conversando en el Club de Ideas.'
   : 'Tu siguiente paso puede ser compartir una captura o el enlace de tu página en el Club de Ideas.');
  write('dashboard-next-detail',completed+' de '+ready.length+' lecciones completadas');
  write('dashboard-next-action','Entrar al Club de Ideas');
  buttonAction=()=>onView?.('comunidad');
 }
 nextButton.onclick=buttonAction;
 list.replaceChildren();
 if(adminPreview){
  addNotice(list,'ESTADO DE LOS VIDEOS',ready.length+' de '+lessons.length+' lecciones listas',
   'Puedes ver borradores en tu revisión. Los alumnos solo deben recibir las lecciones publicadas.',ready.length===lessons.length&&ready.length?'good':'info');
  addNotice(list,'MATERIALES','Recursos de tu aula',
   readyMaterials.length+' recursos con enlace aprobado. Comprueba cada uno antes de habilitar el curso.');
 }else if(!ready.length){
  addNotice(list,'AVISO DE LA CLASE','Los videos están en preparación',
   'No tienes que hacer nada por ahora. Los módulos aparecerán en esta misma aula cuando sean publicados.','info');
  addNotice(list,'TU CUENTA','Tu progreso empezará con la primera lección',
   'No mostraremos porcentajes ni tareas completadas hasta que haya videos disponibles.');
 }else{
  addNotice(list,'LECCIONES',ready.length+' '+(ready.length===1?'video disponible':'videos disponibles'),
   allDone?'¡Terminaste todos los videos disponibles! Tu trabajo queda guardado.':'Continúa por donde te quedaste. Cada lección completada se registra en tu cuenta.',allDone?'good':'info');
  addNotice(list,'MATERIALES',readyMaterials.length
   ? readyMaterials.length+' '+(readyMaterials.length===1?'material aprobado':'materiales aprobados')
   : 'Materiales de apoyo',
   readyMaterials.length?'Puedes consultarlos en la sección Materiales de tu aula.':'Los recursos se irán habilitando cuando estén listos.');
 }
 addNotice(list,'CLUB DE IDEAS',projectShared?'Tu proyecto ya está compartido':'Un lugar para compartir tu proyecto',
  projectShared?'Puedes volver al Club de Ideas para ver comentarios y conocer otros proyectos.'
   :'Cuando tengas un avance de tu web, podrás compartir una captura o un enlace dentro del Club de Ideas.',projectShared?'good':'neutral');
 write('dashboard-tool-materials',readyMaterials.length
   ?readyMaterials.length+' '+(readyMaterials.length===1?'recurso aprobado':'recursos aprobados')
   :'Recursos en preparación');
 write('dashboard-tool-community',projectShared?'Proyecto compartido':'Comparte tus avances');
}

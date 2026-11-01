import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=file=>readFileSync(file,'utf8');
const home=read('index.html');
const classPage=read('clases/primera-landing.html');
const waitlist=read('clases/waitlist.js');
const room=read('alumnos/index.html');
const roomScript=read('alumnos/curso.js');
const config=read('clases/course-config.js');
const workflow=read('.github/workflows/pages.yml');
assert.match(home,/clases\/primera-landing\.html/,'El podcast enlaza la clase de preparación');
assert.match(classPage,/id="course-waitlist-form"/);
assert.match(classPage,/id="course-waitlist-consent"/);
assert.match(classPage,/type="checkbox" required/);
assert.match(classPage,/id="course-waitlist-feedback"/);
assert.match(classPage,/src="waitlist\.js(?:\?[^"]+)?"/);
assert.match(classPage,/3 de diciembre de 2026/);
assert.match(classPage,/Lista de espera abierta/i);
assert.doesNotMatch(classPage,/buy\.stripe\.com|checkout\.stripe\.com|href="https:\/\/buy\./,'No hay checkout público mientras las compras están cerradas');
assert.match(classPage,/noindex,nofollow/,'La página previa no está indexada');
assert.match(waitlist,/auth\.signInWithOtp/);
assert.match(waitlist,/shouldCreateUser:true/);
assert.match(waitlist,/consent_scope:'class_01_launch_only'/);
assert.match(waitlist,/podcast_class_waitlist/);
assert.match(classPage,/id="course-waitlist-dismiss"/,'La confirmación se puede cerrar sin desuscribirse');
assert.match(waitlist,/if\(!user\|\|!returning\)return;/,'No confirmar ni saltar a la lista en visitas normales');
assert.doesNotMatch(waitlist,/!returning && !requested\(\).*showConfirmation/,'No activar éxito por una sesión antigua');
assert.match(waitlist,/history\.replaceState\(history\.state,'',url\.pathname\+url\.search\);/,'Limpiar hash tras confirmar');

assert.match(waitlist,/course-unsubscribe/,'Puede solicitar la baja');
assert.doesNotMatch(waitlist,/podcast_subscribers|podcast_delivery_events|podcast_studio_entries/,'No reutilizar suscriptores ni contenidos');
assert.match(room,/robots" content="noindex,nofollow/);
assert.match(room,/id="login-form"/);
assert.match(room,/id="class-content" hidden/);
assert.match(room,/id="no-access" class="panel" hidden/);
assert.match(room,/id="lesson-buttons"/);
assert.match(room,/id="resource-list"/);
assert.match(room,/id="course-help-form"/,'La ayuda se solicita desde el aula sin navegar al landing');
assert.match(room,/data-course-help/,'El aula tiene controles de ayuda interna');
assert.match(room,/id="course-help-status"/,'Estado de envío accesible');
assert.doesNotMatch(room,/href="\.\.\/index\.html#ayuda"/,'Ayuda del aula no debe llevar al landing');
assert.match(roomScript,/PODCAST_CONFIG\?\.helpEndpoint/,'El formulario reutiliza la integración existente de soporte');
assert.match(roomScript,/courseHelpForm\.addEventListener\('submit'/,'El soporte envía la consulta dentro del aula');
assert.match(roomScript,/courseHelpPanel\.scrollIntoView/,'Se mantiene la navegación interna');

assert.match(roomScript,/from\('podcast_class_access'\)/);
assert.match(roomScript,/entitlement\?\.status!=='active'/);
assert.match(roomScript,/from\('podcast_class_lessons'\)/);
assert.match(roomScript,/from\('podcast_class_resources'\)/);
assert.match(roomScript,/from\('podcast_class_progress'\)/);
assert.match(roomScript,/youtube-nocookie\.com\/embed\//);
assert.doesNotMatch(roomScript,/service_role|sk_live_|rk_live_|whsec_/);
assert.doesNotMatch(config,/service_role|sk_live_|rk_live_|whsec_/, 'Sólo clave pública en el frontend');
assert.match(workflow,/cp -R assets productos clases alumnos/);
assert.match(workflow,/test -s _podcast_pages\/alumnos\/index\.html/);
assert.match(workflow,/test -s _podcast_pages\/clases\/waitlist\.js/);
console.log('Validación de preventa, aula, consentimientos, rutas y acceso: OK');

const newExperience=read('clases/experience.js');
const newStyles=read('clases/clases.css');
assert.match(classPage,/<h1 id="class-title">Tu primera web <em>con IA\.<\/em><\/h1>/,'Hero en español claro: Tu primera web con IA');
assert.match(classPage,/Una idea puede convertirse en/,'El hero presenta la oportunidad desde la idea real del alumno');
assert.match(classPage,/Lista de espera abierta/,'Lista de espera sin compra habilitada');
assert.doesNotMatch(classPage,/Video 0[0-8]|Video 0[0-8] ·|[0-9]{1,3} min(utos)? (editados|aprox)/i,'Lecciones y duraciones internas ocultas');
assert.doesNotMatch(classPage,/class-route-list|<ol class="class-route-list"/,'Sin catálogo interno de clases');
assert.match(classPage,/class-hero-image-frame/,'El hero utiliza una imagen editorial propia');
assert.match(classPage,/src="\.\.\/assets\/clase-hero-retrato-real-2026\.jpg"/,'Se publica la foto independiente de laptop en el hero');
assert.match(newStyles,/class-hero-grid/,'El layout del hero tiene estilos responsivos');
assert.match(classPage,/role="tablist"/);
assert.match(classPage,/role="tabpanel"/);
assert.match(classPage,/id="class-copy-prompt"/);
assert.match(classPage,/id="class-scroll-progress"/);
assert.match(classPage,/id="preguntas"/);
assert.match(classPage,/<header class="class-topbar"[\s\S]*?id="reloj-lanzamiento"/);
for(const path of ['privacidad.html','terminos.html','reembolsos.html','cookies.html','tus-datos.html']){
  assert.ok(classPage.includes('../'+path),'Footer legal: '+path);
}
assert.match(classPage,/logo-podcast-04.svg/);
assert.match(classPage,/Powered by The Launch Era/);
assert.match(classPage,/data-privacy-settings/);
assert.match(newExperience,/prefers-reduced-motion/);
assert.match(newExperience,/IntersectionObserver/);
assert.match(newExperience,/aria-selected/);
assert.match(newExperience,/aria-pressed/);
assert.match(newExperience,/ArrowRight/);
assert.match(newStyles,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(newStyles,/@media\(max-width:650px\)/);
assert.match(classPage,/src="experience\.js(?:\?[^" ]+)?"/);
assert.match(workflow,/clases\/experience\.js/);
console.log('Auditoría editorial 3/30 segundos, efectos, footer y privacidad: OK');

/* Precio de lanzamiento aprobado; precio de referencia FUTURO, nunca atribuir ventas anteriores. */
assert.match(classPage,/PRECIO DE LANZAMIENTO · PAGO ÚNICO/);
assert.match(classPage,/<strong>\$9\.99<\/strong>/);
assert.match(classPage,/<del>\$39\.99<\/del>/);
assert.match(classPage,/Precio regular futuro/i);
assert.match(classPage,/Lanzamiento oficial: 3 de diciembre de 2026/);
assert.doesNotMatch(classPage,/Fecha objetivo:|Objetivo de apertura:|precio todavía no está publicado|Precio e inscripciones aún por confirmar/i);
assert.doesNotMatch(classPage,/checkout\.stripe\.com|buy\.stripe\.com|href="[^"]*pagar|href="[^"]*comprar/i);
assert.match(newStyles,/class-price-inline/);
assert.match(newStyles,/class-price-bottom/);
assert.match(newStyles,/\.class-page-v2 \.class-hero \.class-primary-button[\s\S]*?border-radius:999px!important/);
assert.match(newStyles,/\.class-page-v2 :is\(/);
assert.match(newStyles,/\.class-page-v2 \.class-material-tab\{border-radius:999px!important\}/);
assert.match(newStyles,/\.class-page-v2 \.class-waitlist-form>input\[type="email"\]/);
console.log('QA precio $9.99/39.99 previsto, fecha oficial y botones ovalados: OK');

assert.match(classPage,/Tu primera web con IA/i,'Nombre de la clase presente');
assert.match(classPage,/Tu primera web <em>con IA/,'Título claro para visitantes en el hero');
assert.doesNotMatch(classPage,/no un precio anterior de venta|no una venta anterior|comprobar que los materiales funcionan|clase en preparación|fecha objetivo/i);
assert.doesNotMatch(classPage,/Stripe|Supabase|Make|nota interna|borrador de producción/i);
console.log('QA editorial: contenido orientado al alumno sin procesos internos OK');

/* Club de Ideas · verifica acceso privado, pantallas y ausencia de credenciales. */
const clubPage=read('alumnos/comunidad.html');
const clubJs=read('alumnos/comunidad.js');
const clubStyles=read('alumnos/comunidad.css');
const clubSchema=read('estudio-control/sql/club-de-ideas-comunidad.sql');
const classPortal=read('alumnos/index.html');
const studio=read('estudio-control/src/Studio.tsx');
assert.match(clubPage,/noindex,nofollow/);
assert.match(clubPage,/id="club-locked"/);
assert.match(clubPage,/id="club-members" hidden/);
assert.match(clubPage,/id="club-post-image"/);
assert.match(clubPage,/data-channel="charla"/);
assert.match(clubPage,/data-channel="proyectos"/);
assert.match(clubPage,/data-channel="preguntas"/);
assert.match(clubPage,/id="club-post-form"/);
assert.match(clubJs,/podcast_class_access/);
assert.match(clubJs,/podcast_studio_admins/);
assert.match(clubJs,/sessionIsStudioOwner/);
assert.match(clubJs,/from\('podcast_club_posts'\)/);
assert.match(clubJs,/from\('podcast_club_comments'\)/);
assert.match(clubJs,/from\('podcast_club_likes'\)/);
assert.match(clubJs,/from\('podcast_club_reports'\)/);
assert.match(clubJs,/createSignedUrl/);
assert.match(clubJs,/textContent/);
assert.doesNotMatch(clubJs,/service_role|sk_live_|rk_live_|whsec_/);
assert.match(clubSchema,/enable row level security/g);
assert.match(clubSchema,/storage[.]buckets/);
assert.match(classPortal,/comunidad[.]html/);
assert.match(studio,/Club de Ideas/);
assert.match(clubStyles,/@media\(max-width:650px\)/);
console.log('Club de Ideas: acceso privado, captura, reacciones, comentarios, moderación y móvil OK');


/* UX regression: retrato real, navegación arriba, materiales legibles y footer. */
assert.match(classPage,/clase-hero-retrato-real-2026\.jpg/);
assert.match(classPage,/width="1122" height="1402"/);
assert.doesNotMatch(classPage,/id="class-floating-top"/,'Sin botón flotante tapando el contenido');
assert.match(classPage,/class-back-to-top"/);
assert.match(classPage,/class-transform-arrow[\s\S]*?<svg/);
assert.doesNotMatch(classPage,/[↗⬆]/,'Flechas emoji de sistema prohibidas en el diseño editorial');
assert.match(newStyles,/class-material-tabs\{\s*display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(newStyles,/class-footer-brand img\{filter:brightness\(0\) invert\(1\)/);
assert.match(newStyles,/body\.class-page-v2:has\(#privacy-notice:not\(\[hidden\]\)\)/);
assert.match(newExperience,/footerBack\?\.addEventListener\('click', event =>/);
assert.match(newExperience,/window\.scrollTo\(\{top:0/);
assert.match(newStyles,/Reloj editorial compacto: cifras/,'Cuenta regresiva legible en móvil');
console.log('QA móvil: retrato original, reloj legible, sin botón flotante, footer contrastado y acceso al inicio OK');

/* Fotos originales individuales aprobadas para hero, evidencia y podcast (no collage). */
const podcastCss = read('episodios-destacados.css');
const podcastHeroCss = read('styles-redesign.css');
assert.match(home,/assets\/clase-bot-home-2026\.webp/);
assert.match(home,/Historias sobre la vida real/);
assert.match(home,/episode-mini-card-latest/);
assert.match(home,/episode-previous episode-mini-card/);
assert.doesNotMatch(home,/class="learning-book-scene"/);
assert.match(classPage,/assets\/clase-hero-retrato-real-2026\.jpg/);
assert.match(classPage,/assets\/clase-retrato-laptop-real-2026\.jpg/);
assert.doesNotMatch(classPage,/class-evidence-board/);
assert.match(podcastCss,/episodes-compact-v2 \.episode-curated-grid/);
assert.match(podcastHeroCss,/Podcast · mensaje claro en una mirada/);
assert.ok(readFileSync('assets/clase-hero-retrato-real-2026.jpg').byteLength>100_000,'Existe el retrato del hero');
assert.ok(readFileSync('assets/clase-retrato-laptop-real-2026.jpg').byteLength>100_000,'Existe el retrato de laptop');
console.log('QA: podcast claro, episodios 01 y 02 compactos y fotos aprobadas independientes OK');


/* Revisión pública: hero íntegro, contraste claro y episodios cronológicos. */
const episodeOrderJs=read('episodios-destacados.js');
const episodeOrderStart=home.indexOf('<div class="episode-curated-grid">');
const episodeOrderEnd=home.indexOf('<div class="episode-curated-bottom">',episodeOrderStart);
const episodeOrderMarkup=home.slice(episodeOrderStart,episodeOrderEnd);
assert.ok(episodeOrderStart>=0 && episodeOrderEnd>episodeOrderStart);
assert.ok(episodeOrderMarkup.indexOf('EPISODIO 01')<episodeOrderMarkup.indexOf('EPISODIO 02'),'El episodio 01 aparece primero');
assert.ok(episodeOrderMarkup.includes('21aYHKY0kodWEzg1835xcD'),'Ep 01 Spotify real');
assert.ok(episodeOrderMarkup.includes('6ICSx9E7BVlU8Qi8rFC0s3'),'Ep 02 Spotify real');
assert.match(episodeOrderJs,/published\.slice\(0, 2\)\.sort\(\(a, b\) => a\.number - b\.number\)/);
assert.match(newStyles,/class-hero .class-hero-art .class-hero-image-frame img\{/);
assert.match(newStyles,/object-fit:contain!important/);
assert.match(newStyles,/mix-blend-mode:multiply/);
assert.match(newStyles,/class-hero .class-notice strong\{/);
assert.match(newStyles,/color:#193a56!important/);
console.log('QA: ep 01 antes de 02, foto hero sin recorte ni tarjeta, tipografía contrastada OK');


/* Copy público en español cotidiano: no exponer nomenclatura interna ni repetir fecha. */
const heroCopy=classPage.slice(classPage.indexOf('<section class="class-hero"'),classPage.indexOf('</section>',classPage.indexOf('<section class="class-hero"')));
const publicReadable=classPage.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<svg\b[\s\S]*?<\/svg>/gi,'');
assert.match(heroCopy,/Explora la clase/);
assert.match(heroCopy,/sin saber programar/);
assert.equal((publicReadable.match(/3 de diciembre/g)||[]).length,1,'Una sola mención pública de la fecha de lanzamiento');
assert.doesNotMatch(publicReadable,/CLASE 01|Conocer la clase|Sin programar/i);
assert.match(newStyles,/\.class-hero \.class-hero-grid > \.class-hero-intro > p\.class-lede/);
assert.match(home,/href="clases\/primera-landing.html">Conoce la clase<\/a>/,'La masterclass aparece como extra independiente');
assert.ok(home.indexOf('id="coleccion"') < home.indexOf('id="aprender"'),'Los productos del podcast preceden a la clase complementaria');
assert.match(home,/id="help-toggle"[^>]*aria-expanded="false"/,'Ayuda se abre con un botón');
assert.match(home,/id="help-panel" hidden/,'No mostrar la plantilla del formulario hasta solicitarla');
assert.doesNotMatch(home,/EPISODIO 0[12] · YA DISPONIBLE/,'No repetir la disponibilidad de capítulos publicados');
console.log('QA: copy latino, CTA explora, sin número público y texto móvil con margen');


/* Flip clock de lanzamiento, enlazado SOLO al consentimiento de espera. */
const countdownJs=read('clases/countdown.js');
assert.match(classPage,/id="reloj-lanzamiento"/);
assert.match(classPage,/data-launch-at="2026-12-03T00:00:00-05:00"/);
assert.match(classPage,/class-flip-timer/);
for(const unit of ['days','hours','minutes','seconds']){
  assert.match(classPage,new RegExp('data-digits="'+unit+'"'));
}
assert.match(classPage,/class-launch-clock-cta" href="#lista-espera"/);
assert.match(classPage,/src="countdown\.js\?v=/);
assert.match(countdownJs,/Date\.parse\(clock\.dataset\.launchAt/);
assert.match(countdownJs,/Math\.ceil\(\(target - now\) \/ 1000\)/);
assert.match(countdownJs,/getRemaining/);
assert.match(countdownJs,/reducedMotion\.matches/);
assert.match(countdownJs,/document\.hidden/);
assert.match(countdownJs,/classFlipFold|is-flipping/);
assert.match(newStyles,/animation:classFlipFold 250ms/);
assert.match(newStyles,/animation:classFlipUnfold 250ms[^;]*250ms/);
assert.match(newStyles,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(newStyles,/\.class-topbar \.class-launch-clock/);
assert.equal((publicReadable.match(/3 de diciembre/g)||[]).length,1);
assert.doesNotMatch(classPage,/href="[^"]*(buy\.stripe|checkout\.stripe)/);
console.log('QA reloj: 4 grupos, flip 250+250ms, medianoche EST y botón a lista de espera OK');


/* La comparación de notas y web reemplaza la órbita y el antes/después estático. */
assert.doesNotMatch(classPage,/class-value-orbit|class-orbit-wheel|class-demo-before|class-demo-after/);
assert.doesNotMatch(newStyles,/classOrbitClockwise|classOrbitCounterClockwise/);
assert.match(classPage,/id="de-idea-a-web"/);
assert.match(classPage,/type="range" min="0" max="100"/);
assert.match(classPage,/aria-controls="transform-scene"/);
assert.match(classPage,/data-transform-to="0"/);
assert.match(classPage,/data-transform-to="100"/);
assert.match(classPage,/Ejemplo ilustrativo de lo que puedes crear en la clase/);
assert.match(newExperience,/ideaProgress.addEventListener\('input'/);
assert.match(newExperience,/reducedMotion.matches \|\| start === target/);
assert.match(home,/desde el teléfono, paso a paso y sin saber programar/,'Mensaje claro del extra de IA sin jerga técnica');
assert.doesNotMatch(classPage,/experta|experto|alumnas|bienvenida a tu/i);
assert.doesNotMatch(home,/experta|experto/i);
assert.doesNotMatch(clubPage,/reservado a alumnas|BIENVENIDA A TU COMUNIDAD/);
assert.match(clubPage,/ESTE ES TU ESPACIO/);
assert.doesNotMatch(room,/BIENVENIDA AL AULA|Tu primera landing con IA/);
assert.equal((classPage.match(/href="#lista-espera"/g)||[]).length,1,'Un enlace de aviso junto al reloj; envío solamente en el formulario');
assert.doesNotMatch(classPage,/class-nav-cta|class-ghost-button/,'No repetir CTAs de espera en el header ni hero');
assert.match(classPage,/Explora la clase/);
assert.match(classPage,/class-launch-clock-cta" href="#lista-espera"/);
console.log('QA: transformación interactiva, movimiento reducido, lenguaje inclusivo y CTAs únicos OK');


/* Aula personal: navegación real, progreso y bono sin entrega automática. */
const coursePersonalCss=read('alumnos/curso.css');
const coursePersonalJs=read('alumnos/curso.js');
for(const id of ['student-greeting-title','student-name','progress-percent','student-progress','aula-rail','materiales-interactivos','student-bonus-heading','bonus-lessons','bonus-project','bonus-status','lesson-celebration','lesson-celebration-close']){
 assert.match(room,new RegExp('id="'+id+'"|class="'+id+'"'));
}
assert.match(room,/<aside class="aula-rail"/);
assert.match(room,/Desbloquea tu bono/);
assert.match(room,/Club de Ideas/);
assert.match(room,/id="aula-layout"/);
assert.match(room,/data-aula-panel="materiales"/);
assert.match(coursePersonalJs,/getUser\(\)/);
assert.match(coursePersonalJs,/email_confirmed_at/);
assert.match(coursePersonalJs,/podcast_class_progress/);
assert.match(coursePersonalJs,/congratulate\(item\)/);
assert.match(coursePersonalJs,/checkProjectShared\(\)/);
assert.match(coursePersonalJs,/eq\('author_id',user.id\)/);
assert.match(coursePersonalJs,/post.image_path\|\|post.project_url/);
assert.match(coursePersonalJs,/dataset.state='earned'/);
assert.doesNotMatch(coursePersonalJs,/service_role|SUPABASE_SERVICE_ROLE_KEY/);
console.log('QA aula personal: sidebar, progreso persistido, felicitación, bono y seguridad OK');


/* Guardas del nuevo diseño sin sobreescribir cambios de soporte del aula. */
const lessonsPos=room.indexOf('class="room-grid"');
const clubPos=room.indexOf('class="club-aula-hub"');
const bonusPos=room.indexOf('class="student-bonus"');
assert.ok(lessonsPos>=0&&clubPos>lessonsPos&&bonusPos>clubPos, 'Club y bono deben ir después de las lecciones');
assert.match(room,/id="bonus-unlocked"[^>]+hidden/);
assert.match(coursePersonalJs,/REQUIRED_LESSON_COUNT=9/);
assert.match(coursePersonalJs,/completed===REQUIRED_LESSON_COUNT/);
assert.match(coursePersonalJs,/l.status==='ready'&&validVideoId/);
assert.match(coursePersonalJs,/const eligible=allDone&&projectShared&&!adminPreview/);
assert.match(coursePersonalJs,/\$\('bonus-unlocked'\)\.hidden=!eligible/);
assert.match(room,/Mostrar mi proyecto/,'Club tiene opciones reales para publicar');
assert.match(coursePersonalCss,/#class-content>.student-bonus/);
assert.match(classPage,/<header class="class-topbar"[\s\S]*?id="reloj-lanzamiento"[\s\S]*?<\/header>/);
assert.match(newStyles,/\.class-topbar \.class-launch-clock/);
assert.match(newStyles,/--flip-w:14px/);
assert.doesNotMatch(room,/BIENVENIDA AL AULA|Tu primera landing con IA/);
console.log('QA: reloj mini a la derecha del logo, Club tras lecciones y bono con doble condición OK');


// Validación de bonos individuales y navegación cerrada del aula (28 oct 2026).
const studioShell=read('estudio-control/src/Studio.tsx');
const studentManager=read('estudio-control/src/StudentManager.tsx');
const bonusLibrary=read('estudio-control/src/BonusLibrary.tsx');
const studioClient=read('estudio-control/src/supabase-client.ts');
const bonusMigration=read('estudio-control/sql/bonos-individuales-20261028.sql');
const bonusUnlock=read('estudio-control/sql/bonos-desbloqueo-20261028.sql');
assert.match(room,/<a href="#aula" aria-label="Ir al inicio de mi aula">/,'El logo permanece dentro del aula');
assert.doesNotMatch(room,/href="\.\.\/index\.html" aria-label="Volver al podcast"/,'El logo no sale al landing');
assert.doesNotMatch(room,/href="\.\.\/clases\/primera-landing\.html"/,'El aula no invita a salir a la página de ventas');
assert.match(room,/id="assigned-bonuses"[^>]*hidden/,'La sección privada de bonos está oculta de entrada');
assert.match(roomScript,/if\(adminPreview\|\|!user\)return/,'El modo de administradora no consulta bonos personales');
assert.match(roomScript,/if\(eligible\)void refreshPersonalBonuses\(\)/,'El aula solo pide bonos después de superar el reto');
assert.match(studioShell,/import StudentManager from/,'Mi Estudio integra la gestión de alumnos');
assert.match(studioShell,/<StudentManager \/>/,'El panel de alumnos está dentro del centro de alumnos');
assert.match(studentManager,/getStudioStudents\(\)/,'Lista real de compradores, separada de audiencia');
assert.match(studentManager,/setStudentBonusGrant/,'Permite asignar por persona');
assert.match(bonusLibrary,/setStudioBonusAvailability/,'Permite preparar o activar cada bono individualmente');
assert.match(studioClient,/podcast_class_bonus_grants/,'Asignación durable en Supabase, no en estado local');
assert.match(bonusMigration,/rls_enabled/,'La tabla de asignaciones requiere RLS');
assert.match(bonusMigration,/class_resources_assigned_bonus_read/,'Solo se comparte un recurso listo con su destinatario');
assert.match(bonusMigration,/resource_code !~ '\^bonus_'/,'Los bonos se excluyen de materiales generales pagados');
assert.match(bonusUnlock,/count\(\*\).*lesson|lesson.*count\(\*\)/s,'La entrega se comprueba también en el servidor');
console.log('QA: alumnos separados, asignación por persona, RLS y navegación interna del aula OK');


// Sidebar real del aula, con secciones independientes y menú móvil.
const aulaSidebarCss=read('alumnos/aula-sidebar.css');
assert.match(room,/class="aula-rail" id="aula-rail"/,'Sidebar de navegación real');
assert.match(room,/class="lesson-index"/,'Las lecciones aparecen dentro del sidebar');
assert.match(room,/id="aula-menu-open"/,'Menú para teléfonos y tablet');
assert.match(room,/id="aula-rail-backdrop"[^>]*hidden/,'Overlay de navegación privado');
for(const view of ['inicio','lecciones','materiales','comunidad','bonos']){
 assert.match(room,new RegExp('data-aula-panel="'+view+'"'),'Pantalla propia: '+view);
 assert.match(room,new RegExp('data-aula-view="'+view+'"'),'Navegación: '+view);
}
assert.match(aulaSidebarCss,/#aula-layout\.room-grid\{display:grid;grid-template-columns:258px minmax\(0,1fr\)/,'Sidebar fijo desktop');
assert.match(aulaSidebarCss,/@media\(min-width:760px\) and \(max-width:990px\)/,'Sidebar permanente en iPad vertical');
assert.match(aulaSidebarCss,/@media\(max-width:759px\)/,'Menú desplegable solo en teléfonos');
assert.match(aulaSidebarCss,/body\.aula-menu-open/,'Menú móvil funcional');
assert.match(roomScript,/function setAulaView\(/,'Navegación interactiva');
assert.match(roomScript,/setAulaView\('lecciones'\)/,'Seleccionar lección abre pantalla');
assert.match(roomScript,/if\(panel!==course\)closeAulaMenu\(\)/,'Cierra menú si la sesión termina');
assert.match(room,/aula-sidebar\.css\?v=/,'Stylesheet de sidebar con cache-bust');
assert.match(studioShell,/className="studio-student-tab-current"/,'La lista de alumnos está en Mi Estudio');
assert.match(studioShell,/href="\.\.\/alumnos\/\?vista=admin"/,'Vista del aula se abre a pantalla completa');
assert.doesNotMatch(room,/href="\.\.\/index\.html" aria-label="Volver al podcast"/,'Logo no sale al landing');
console.log('QA: sidebar real, cinco secciones, menú móvil y estudio separado OK');

// Materiales: revisión del reemplazo de los PDF defectuosos.
const interactiveJs=read('alumnos/materiales-interactivos.js');
const interactiveCss=read('alumnos/materiales-interactivos.css');
assert.match(room,/id="materiales-interactivos"/,'Aula tiene el nuevo estudio de materiales');
assert.match(room,/materiales-interactivos\.css\?v=/,'CSS editorial enlazado');
assert.match(roomScript,/import \{mountMateriales\}/,'Se instala después de comprobar acceso');
assert.match(interactiveJs,/podcast_class_learning_assets/,'Contenido privado procedente de Supabase');
assert.match(interactiveJs,/podcast_class_workbook/,'Cuaderno con guardado por alumno');
assert.doesNotMatch(interactiveJs,/const PROMPTS=\[/,'Los prompts no están publicados en JavaScript');
assert.match(interactiveJs,/navigator\.clipboard\.writeText/,'Prompts con botón para copiar');
assert.match(interactiveJs,/function renderWorkbook/,'Cuaderno editable');
assert.match(interactiveJs,/function renderExample/,'Ejemplo con vistas móvil y escritorio');
assert.match(interactiveJs,/function renderChecks/,'Lista de revisión real');
assert.match(interactiveCss,/--mi-ink:#192d46/,'Paleta azul profunda del podcast');
assert.match(interactiveCss,/@media\(max-width:440px\)/,'Materiales legibles en teléfono');
console.log('QA: cinco guías interactivas privadas, guardado por alumno y paleta editorial OK');

const clubHubCss=read('alumnos/club-hub.css');
assert.match(room,/href="\.\/comunidad\.html\?canal=proyectos&amp;accion=publicar"/,'Abrir publicación directa de proyectos');
assert.match(room,/href="\.\/comunidad\.html\?canal=preguntas&amp;accion=publicar"/,'Abrir preguntas sin rodeos');
assert.match(room,/href="\.\/comunidad\.html\?canal=proyectos"/,'Explorar proyectos');
assert.match(room,/club-hub\.css\?v=/,'Estilos propios y actualizados del Club');
assert.doesNotMatch(room,/club-editorial-flow|club-aula-visual/,'Sin tarjetas decorativas que deformen la vista');
assert.match(clubHubCss,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,'Club compacto en escritorio');
assert.match(clubHubCss,/@media\(max-width:700px\)/,'Club apilado en teléfono');
assert.match(clubJs,/requested\.get\('canal'\)/,'Acciones abren su canal real');
assert.match(clubJs,/requested\.get\('accion'\)==='publicar'/,'Publicar enfoca la entrada real');
assert.match(studioShell,/Ver aula completa/,'Botón único de vista completa');
assert.doesNotMatch(studioShell,/iframe title="Centro de alumnos · vista privada/,'No anidar la aplicación del aula');
console.log('QA: club compacto e interactivo, vista de administradora sin iframe duplicado OK');


// El centro muestra la información de los productos antes de enviar a un checkout.
const centerPage=read('centro/index.html');
const centerScript=read('centro/centro.js');
const centerStyles=read('centro/centro.css');
const offers=['booking-flow','website-automation','ai-booking','ai-followup','ai-business','va','web-class','content-lab','no-voy-tarde','empezar-de-nuevo'];
for(const offer of offers){
 assert.match(centerPage,new RegExp('data-detail="'+offer+'"'),'Producto con ficha informativa: '+offer);
 assert.ok(centerScript.includes("'"+offer+"':{"),'Datos completos de producto: '+offer);
}
assert.match(centerPage,/id="product-details"/,'Diálogo de información con título y precio');
assert.match(centerScript,/function openProductDetails/,'Detalle antes del checkout');
assert.match(centerScript,/const accessControlled=code==='web-class'/,'La clase sigue en lista de espera, sin checkout');
assert.match(centerScript,/code==='content-lab'&&\(owner\|\|purchased\.has\(code\)\)/,'Content Lab dirige a acceso solo si ya tiene compra o es administradora');
assert.match(centerScript,/https:\/\/buy\.stripe\.com\/14AdR8dHp6Dnd8B1IM93y0Z/,'Content Lab muestra su checkout aprobado');
assert.doesNotMatch(centerPage,/Ver checkout/,'No enviar clientes directamente del catálogo al checkout');
assert.match(centerStyles,/\.product-details::backdrop/,'Panel accesible para comprar informado');
console.log('QA: fichas de productos y acceso de preventa protegido OK');


// El centro utiliza la identidad visual aprobada, sin monogramas inventados,
// flechas decorativas ni emojis en tarjetas y llamadas a la acción.
const brandCenterHtml=read('centro/index.html');
const brandCenterJs=read('centro/centro.js');
const brandCenterCss=read('centro/centro.css');
const officialWordmark=read('assets/tle-wordmark-light.svg');
const officialMark=read('assets/tle-mark-light.svg');
assert.match(brandCenterHtml,/class="brand-logo" src="\.\.\/assets\/tle-wordmark-light\.svg"/,'Wordmark real aprobado');
assert.match(brandCenterHtml,/href="\.\.\/assets\/tle-mark-light\.svg"/,'Favicon oficial TLE');
assert.match(officialWordmark,/viewBox="0 0 1719 341"/,'Logo vectorial original');
assert.match(officialMark,/viewBox="0 0 405 169"/,'Icono vectorial original');
assert.doesNotMatch(brandCenterHtml,/class="brand-mark"|monograma-podcast-04\.svg|↗|→|🔒|✳|✦/,'Sin falso monograma ni iconos de emoji/flechas');
assert.doesNotMatch(brandCenterJs,/↗|→|🔒/,'El estado de sesión no añade flechas');
assert.match(brandCenterCss,/\.center-nav \.brand-logo/,'El logotipo adapta su tamaño en móvil');
console.log('QA: logo oficial, tarjetas sin emojis y botones sin flechas OK');


// Regression: los botones de soporte del Centro no se superponen al texto en iPad.
// Reuse centerPage and centerStyles loaded above; avoid duplicate const declarations.
const centerHelp=centerPage.slice(centerPage.indexOf('<section class="help-strip"'),centerPage.indexOf('</section>',centerPage.indexOf('<section class="help-strip"'))+10);
assert.ok(centerHelp.includes('<div class="help-strip-actions"'),'CTAs fuera del párrafo');
assert.ok(centerHelp.includes('class="help-strip-secondary" href="./contacto.html"'),'Contacto conserva su destino');
assert.ok(centerHelp.includes('class="help-strip-primary" href="mailto:hello@thelaunchera.com'),'El correo conserva su destino');
assert.ok(centerHelp.indexOf('</p>')<centerHelp.indexOf('class="help-strip-actions"'),'Primero el texto, después los botones');
assert.ok(centerStyles.includes('.help-strip-actions{display:flex;flex-wrap:wrap'),'Sin anchos rígidos');
assert.ok(centerStyles.includes('@media(max-width:900px){.help-strip-actions{flex-direction:column}'),'Botones apilados en iPad');
assert.ok(!centerStyles.includes('.help-strip a{border:1px solid #6a91a7'),'Sin estilo de botón aplicado a enlaces dentro del texto');
assert.ok(centerPage.includes('./centro.css?v=20261031-clean-covers-v9'),'Cache de estilos actualizado');


// Las portadas completas siguen siendo interactivas pero no repiten «Ver detalles».
const catalogHtml=read('centro/index.html');
const catalogCss=read('centro/centro.css');
const coverControls=[...catalogHtml.matchAll(/<button type="button" class="cover-action" data-detail="[^"]+" aria-label="[^"]+"><\/button>/g)];
assert.equal(coverControls.length,10,'Las 10 portadas mantienen una acción accesible');
assert.ok(!catalogHtml.includes('<span aria-hidden="true">Ver detalles</span>'),'Las portadas no muestran etiquetas repetidas');
assert.ok(catalogHtml.includes('data-detail="web-class">Conocer la clase'),'La clase conserva su CTA principal');
assert.ok(catalogHtml.includes('data-detail="content-lab">Descubre qué incluye'),'El Lab conserva su CTA principal');
assert.ok(catalogCss.includes('.cover-action:focus-visible'),'Las portadas tienen foco para teclado');
assert.ok(catalogHtml.includes('centro.css?v=20261031-clean-covers-v9'),'El navegador recibe los estilos nuevos');

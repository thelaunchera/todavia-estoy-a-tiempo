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
assert.match(classPage,/src="waitlist\.js"/);
assert.match(classPage,/3 de diciembre de 2026/);
assert.match(classPage,/Lista de espera abierta/i);
assert.doesNotMatch(classPage,/buy\.stripe\.com|checkout\.stripe\.com|href="https:\/\/buy\./,'No hay checkout público mientras las compras están cerradas');
assert.match(classPage,/noindex,nofollow/,'La página previa no está indexada');
assert.match(waitlist,/auth\.signInWithOtp/);
assert.match(waitlist,/shouldCreateUser:true/);
assert.match(waitlist,/consent_scope:'class_01_launch_only'/);
assert.match(waitlist,/podcast_class_waitlist/);
assert.match(waitlist,/course-unsubscribe/,'Puede solicitar la baja');
assert.doesNotMatch(waitlist,/podcast_subscribers|podcast_delivery_events|podcast_studio_entries/,'No reutilizar suscriptores ni contenidos');
assert.match(room,/robots" content="noindex,nofollow/);
assert.match(room,/id="login-form"/);
assert.match(room,/id="class-content" hidden/);
assert.match(room,/id="no-access" class="panel" hidden/);
assert.match(room,/id="lesson-buttons"/);
assert.match(room,/id="resource-list"/);
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
assert.match(classPage,/negocios locales/i,'Comunica la oportunidad de servicio local');
assert.match(classPage,/Lista de espera abierta/,'Lista de espera sin compra habilitada');
assert.doesNotMatch(classPage,/Video 0[0-8]|Video 0[0-8] ·|[0-9]{1,3} min(utos)? (editados|aprox)/i,'Lecciones y duraciones internas ocultas');
assert.doesNotMatch(classPage,/class-route-list|<ol class="class-route-list"/,'Sin catálogo interno de clases');
assert.match(classPage,/class-hero-image-frame/,'El hero utiliza una imagen editorial propia');
assert.match(classPage,/src="\.\.\/assets\/clase-trabajo-web-2026\.webp"/,'Se publica la foto independiente de laptop en el hero');
assert.match(newStyles,/class-hero-grid/,'El layout del hero tiene estilos responsivos');
assert.match(classPage,/role="tablist"/);
assert.match(classPage,/role="tabpanel"/);
assert.match(classPage,/id="class-copy-prompt"/);
assert.match(classPage,/id="class-scroll-progress"/);
assert.match(classPage,/id="preguntas"/);
assert.match(classPage,/aria-label="Navegación de la clase"/);
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
assert.match(classPage,/src="experience\.js"/);
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
assert.match(classPage,/clase-trabajo-web-2026\.webp/);
assert.match(classPage,/width="768" height="768"/);
assert.match(classPage,/id="class-floating-top"/);
assert.match(classPage,/class-back-to-top"/);
assert.match(classPage,/class-demo-arrow[\s\S]*?<svg/);
assert.doesNotMatch(classPage,/[↗⬆]/,'Flechas emoji de sistema prohibidas en el diseño editorial');
assert.match(newStyles,/class-material-tabs\{\s*display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(newStyles,/class-footer-brand img\{filter:brightness\(0\) invert\(1\)/);
assert.match(newStyles,/body\.class-page-v2:has\(#privacy-notice:not\(\[hidden\]\)\)/);
assert.match(newExperience,/footerBack\?\.addEventListener\('click', scrollToStart\)/);
assert.match(newExperience,/window\.scrollTo\(\{top:0/);
console.log('QA móvil: retrato original, tabs 2x2, footer contrastado y volver arriba OK');

/* Fotos originales independientes para tres secciones (no collage). */
const podcastCss = read('episodios-destacados.css');
const podcastHeroCss = read('styles-redesign.css');
assert.match(home,/assets\/clase-bot-home-2026\.webp/);
assert.match(home,/Historias sobre la vida real/);
assert.match(home,/episode-mini-card-latest/);
assert.match(home,/episode-previous episode-mini-card/);
assert.doesNotMatch(home,/class="learning-book-scene"/);
assert.match(classPage,/assets\/clase-trabajo-web-2026\.webp/);
assert.match(classPage,/assets\/clase-mostrar-web-2026\.webp/);
assert.doesNotMatch(classPage,/class-evidence-board/);
assert.match(podcastCss,/episodes-compact-v2 \.episode-curated-grid/);
assert.match(podcastHeroCss,/Podcast · mensaje claro en una mirada/);
console.log('QA: podcast claro, episodios 01 y 02 compactos y tres fotografías independientes OK');


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
assert.match(heroCopy,/No tienes que saber de coding ni ser experta en tecnología/);
assert.equal((publicReadable.match(/3 de diciembre/g)||[]).length,1,'Una sola mención pública de la fecha de lanzamiento');
assert.doesNotMatch(publicReadable,/CLASE 01|Conocer la clase|Sin programar/i);
assert.match(newStyles,/\.class-hero \.class-hero-grid > \.class-hero-intro > p\.class-lede/);
assert.match(home,/href="clases\/primera-landing.html">Explora la clase<\/a>/);
console.log('QA: copy latino, CTA explora, sin número público y texto móvil con margen');

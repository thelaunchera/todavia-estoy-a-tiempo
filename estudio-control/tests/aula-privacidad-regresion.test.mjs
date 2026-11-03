import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';

// QA adicional, solo lectura. No crea alumnos, pagos ni cambia datos privados.
const room=readFileSync('alumnos/index.html','utf8');
const course=readFileSync('alumnos/curso.js','utf8');
const materials=readFileSync('alumnos/materiales-interactivos.js','utf8');
const materialsCss=readFileSync('alumnos/materiales-interactivos.css','utf8');
const maraGuide=readFileSync('alumnos/mara-guide.js','utf8');
const workflow=readFileSync('.github/workflows/pages.yml','utf8');

test('biblioteca única: el sidebar comparte la misma pantalla de materiales, sin duplicar prompts',()=>{
 assert.ok((room.match(/data-aula-view="prompts"/g)||[]).length>=2,'La biblioteca es accesible desde el menú, portada y recorrido sin duplicar su contenido');
 assert.equal((room.match(/id="materiales-interactivos"/g)||[]).length,1,'Un solo módulo montado');
 assert.equal((room.match(/data-aula-panel="prompts"/g)||[]).length,0,'Sin una segunda pantalla paralela');
 assert.match(course,/view==='prompts'\?'materiales':view/,'La entrada de prompts reutiliza Materiales');
 assert.match(course,/materialsController\?\.go\('prompts',\{track:false\}\)/,'Navegación directa a los prompts sin historial duplicado');
 assert.match(course,/materialsController\?\.go\('inicio',\{track:false\}\)/,'Materiales vuelve a su inicio sin conservar pestañas antiguas');
 assert.match(course,/import \{mountMateriales\} from '\.\/materiales-interactivos\.js(?:\?[^']+)?'/,'Reutilizar el módulo existente');
 assert.doesNotMatch(room,/prompts-biblioteca\.js|prompts-library\.js/,'No incluir una biblioteca duplicada');
});

test('los prompts se obtienen tras validar el acceso, nunca vienen completos en el HTML público',()=>{
 const verify=course.indexOf("if(entitlement?.status!=='active'||entitlement.revoked_at)");
 const fetch=course.indexOf("void mountMateriales(");
 assert.ok(verify>=0&&fetch>verify,'La carga debe estar después del bloqueo por compra');
 assert.match(materials,/db\.from\('podcast_class_learning_assets'\)/);
 assert.match(materials,/\.eq\('course_id',courseId\)/);
 assert.match(materials,/PROMPTS=Array\.isArray\(resource\.payload\.prompts\)/);
 assert.doesNotMatch(materials,/const PROMPTS=\[\s*\[/,'No guardar textos de prompts en un JS público');
 assert.match(materials,/PROMPTS\.length!==12\|\|WORKBOOK\.length!==8\|\|CHECKS\.length!==16/,'Validar colección completa');
 for(const source of [room,course,materials]){
  assert.doesNotMatch(source,/SUPABASE_SERVICE_ROLE_KEY|sk_live_|rk_live_|whsec_/);
 }
});

test('el cuaderno persiste las respuestas del usuario actual, no las de otro alumno',()=>{
 assert.match(materials,/\.eq\('user_id',user\.id\)/);
 assert.match(materials,/course_id:courseId,user_id:user\.id,answers,checks/);
 assert.match(materials,/onConflict:'course_id,user_id'/);
 assert.match(materials,/if\(ownerPreview\)return;/,'No cargar respuestas durante vista de administración');
 assert.match(materials,/if\(ownerPreview\|\|saveRunning\)return;/,'La vista de administración no guarda');
});

test('el owner prueba el cuaderno y las casillas sin tocar respuestas reales',()=>{
 assert.match(materials,/const ownerPreview=adminPreview\|\|!user/,'El modo owner se detecta sin identidad de alumno');
 assert.doesNotMatch(materials,/textarea\.disabled=ownerPreview/,'Los campos de prueba no deben estar deshabilitados');
 assert.doesNotMatch(materials,/inp\.disabled=ownerPreview/,'Las casillas de prueba no deben estar deshabilitadas');
 assert.match(materials,/mi-owner-test-note/,'El alumno y la administradora distinguen la prueba');
 assert.match(materials,/mi-owner-test-clear/,'La prueba se puede borrar');
 assert.match(materials,/if\(ownerPreview\|\|saveRunning\)return;/,'Nunca guardar la vista owner en Supabase');
 assert.match(materials,/if\(ownerPreview\)return;/,'Nunca leer respuestas de estudiantes en preview');
 assert.match(materials,/mi-owner-test-feedback/,'El resultado de la prueba se muestra junto al botón');
 assert.match(materialsCss,/\.mi-owner-test-note/,'Vista de prueba identificable en el teléfono');
});

test('cada prompt ofrece Copiar con alternativa para Safari',()=>{
 assert.match(materials,/navigator\.clipboard\.writeText\(value\)/);
 assert.match(materials,/document\.execCommand\('copy'\)/);
 assert.match(materials,/Mantén pulsado el texto del prompt/);
 assert.match(materialsCss,/@media\(max-width:440px\)/);
});

test('cierre de sesión y cambio de cuenta limpian el documento anterior',()=>{
 const handler=course.slice(course.lastIndexOf('db.auth.onAuthStateChange('));
 assert.match(handler,/event==='SIGNED_OUT'/,'Sesión cerrada en otra pestaña');
 assert.match(handler,/display\(login\);out\.hidden=true/,'Ocultar la vista privada inmediatamente');
 assert.match(handler,/location\.replace\('\.\/'\)/,'Recargar para descartar los datos privados del documento');
 assert.match(handler,/session\.user\.id!==user\.id/,'Cambio entre cuentas diferentes');
 assert.match(handler,/session\.user\.id!==user\?\.id/,'El inicio normal de sesión sigue funcionando');
});

test('la protección forma parte de la compilación del portal, sin activar cobros',()=>{
 assert.match(workflow,/cp -R assets productos clases alumnos/);
 assert.match(room,/id="class-content" hidden/);
 assert.match(room,/robots" content="noindex,nofollow/);
  assert.match(room,/const classroomModule='\.\/curso\.js\?v=/,'El arranque usa una versión explícita del módulo');
  assert.match(room,/import\(classroomModule\)\.catch\(error=>\{/,'El módulo del aula captura los errores de importación');
});


test('Aula: correo y contraseña, recuperación, acceso de 24 horas y sin enlaces mágicos',()=>{
 assert.match(room,/id="login-password"[^>]*type="password"|type="password" id="login-password"/);
 assert.match(room,/id="remember-device"/);
 assert.match(room,/id="register-form"/);
 assert.match(room,/id="reset-email-form"/);
 assert.match(room,/id="new-password-form"/);
 assert.match(course,/auth\.signInWithPassword\(/);
 assert.match(course,/auth\.signUp\(/);
 assert.match(course,/auth\.resetPasswordForEmail\(/);
 assert.match(course,/auth\.updateUser\(\{password:/);
 assert.match(course,/const DAY_MS=24\*60\*60\*1000/);
 assert.match(course,/!hasAulaSession\(who\.id\)/);
 assert.doesNotMatch(course,/signInWithOtp\(/);
});


test('Aula de principiantes: primero el siguiente paso, después herramientas opcionales',()=>{
 const next=room.indexOf('class="dashboard-next-card"');
 const tools=room.indexOf('class="dashboard-setup"');
 assert.ok(next>0 && tools>next,'La acción principal aparece antes de la preparación técnica');
 assert.match(room,/<details class="dashboard-setup-details">/,'Las instrucciones largas no saturan el inicio');
 assert.match(room,/id="lesson-prev"/,'Se puede volver a la lección anterior');
 assert.match(room,/class="lesson-resources" data-aula-view="materiales"/,'Cada lección enlaza a materiales');
 assert.match(course,/lessons\.findIndex\(item=>item\.status==='ready'&&validVideoId\(item\.youtube_video_id\)&&!done\.has\(item\.lesson_code\)\)/,'El alumno solo retoma videos publicados y no marca borradores completados');
 assert.match(course,/\$\('lesson-prev'\)\.disabled=i<=0/,'La primera lección no permite retroceder');
});


test('Aula de la clase: sin catálogos, otros productos ni enlaces de administración públicos',()=>{
 assert.doesNotMatch(room,/data-aula-panel="catalogo"|data-aula-view="catalogo"/,'El catálogo vive en el Centro de Productos');
 assert.doesNotMatch(room,/learning-shelf|Content Lab|No voy tarde|Empezar de nuevo|service-checkout/,'El aula muestra solo la clase y sus recursos');
 assert.doesNotMatch(room,/href="\.\.\/estudio\//,'No hay enlace navegable al Studio en HTML público');
 assert.match(room,/data-aula-panel="lecciones"/,'La clase sí está en su aula');
 assert.match(room,/data-aula-panel="materiales"/,'Los materiales de la clase permanecen disponibles');
 assert.match(room,/data-aula-panel="comunidad"/,'La comunidad de la clase permanece disponible');
 assert.match(course,/prompts:'Biblioteca de prompts'/,'La biblioteca de la clase está conectada');
 assert.match(course,/if\(view==='catalogo'\)view='lecciones'/,'Enlaces antiguos al catálogo ya no muestran productos');
});
test('Navegación táctil: Atrás y Cerrar sección nunca cierran la sesión',()=>{
 assert.match(course,/function ensureAulaNavigation\(/,'El aula monta acciones después del acceso verificado');
 assert.match(course,/aula-section-back/,'Hay control para volver');
 assert.match(course,/aula-section-close/,'Hay control para cerrar sección');
 assert.match(course,/aulaViewHistory\.pop\(\)/,'Se puede volver a la pantalla anterior');
 assert.match(course,/setAulaView\('inicio',\{track:false\}\)/,'Cerrar sección vuelve al inicio del aula');
 assert.match(course,/function closeAulaMenu\(/,'El menú del teléfono tiene cierre independiente');
 const styles=readFileSync('alumnos/aula-sidebar.css','utf8');
 assert.match(styles,/\.aula-section-nav-button/,'Los botones están diseñados como controles táctiles');
 assert.match(styles,/max-width:759px/,'La navegación es compatible con iPhone');
 const materialTabs=readFileSync('alumnos/materiales-interactivos.js','utf8');
 const materialCss=readFileSync('alumnos/materiales-interactivos.css','utf8');
 assert.match(materialTabs,/mi-view-back/,'La biblioteca tiene Atrás');
 assert.match(materialTabs,/mi-view-close/,'La biblioteca tiene Cerrar');
 assert.match(materialTabs,/onCloseMaterials\?\.\(\)/,'Cerrar materiales vuelve al aula');
 assert.match(materialCss,/\.mi-view-controls/,'Controles táctiles de los materiales');
 const community=readFileSync('alumnos/comunidad.html','utf8');
 const communityScript=readFileSync('alumnos/comunidad.js','utf8');
 assert.match(community,/id="club-page-back"/,'La comunidad tiene botón Atrás');
 assert.match(community,/id="club-page-close"/,'La comunidad tiene botón Cerrar');
 assert.match(communityScript,/history\.back\(\)/,'Atrás de comunidad recuerda la vista anterior');
 assert.doesNotMatch(community,/href="\.\.\/estudio\/"/,'Ningún enlace al Studio aparece en HTML público de la comunidad');
 assert.match(communityScript,/adminReturn\.setAttribute\('href','\.\.\/estudio\/'\)/,'Solo la administradora recibe el enlace al Studio');
});


test('Centro de productos independiente, seguro y incluido en la publicación',()=>{
 const center=readFileSync('centro/index.html','utf8');
 const centerJs=readFileSync('centro/centro.js','utf8');
 const centerCss=readFileSync('centro/centro.css','utf8');
 assert.match(center,/id="programas"/);
 assert.match(center,/id="servicios"/);
 assert.match(center,/id="recursos"/);
 assert.match(center,/id="access-overlay" hidden/);
 assert.match(centerJs,/signInWithPassword\(/);
 assert.match(centerJs,/podcast_hub_entitlements/);
 assert.match(centerJs,/podcast_hub_releases/);
 assert.match(centerJs,/REMEMBER_KEY='podcast_class_remember_24h_v1'/);
 assert.match(centerJs,/if\(!open\)/);
 assert.match(centerJs,/const has=purchased\.has\(code\),open=/);
 assert.doesNotMatch(center,/href="[^"]*\/centro\/checkout/);
 assert.doesNotMatch(room,/href="\.\.\/centro\/"/,'El Aula permanece independiente del Centro de Productos');
 assert.match(workflow,/cp -R assets productos clases alumnos centro _podcast_pages\//);
 assert.match(workflow,/node --check centro\/centro.js/);
 assert.match(workflow,/test -s _podcast_pages\/centro\/index.html/);
 assert.ok(centerCss.length>1000);
});


test('Catálogo comercial independiente: ventas y productos permanecen en Centro y Studio',()=>{
 const center=readFileSync('centro/index.html','utf8');
 const studio=readFileSync('estudio-control/src/Studio.tsx','utf8');
 const service=readFileSync('estudio-control/src/supabase-client.ts','utf8');
 assert.match(center,/id="programas"/,'Centro de Productos separado');
 assert.doesNotMatch(room,/id="learning-shelf-title"|id="learning-lab-status"/,'Aula sin tienda ni métricas de otros productos');
 assert.match(studio,/Centro de ventas y productos/,'La administración conserva el Centro de Productos');
 assert.match(studio,/getVerifiedSales\(\)/,'La propietaria supervisa sus ventas');
 assert.match(studio,/CHECKOUT \$10 · PAUSADO POR QA/,'No prometer compras de Lab activas');
 assert.match(service,/await owner\(\);[\s\S]*?client\.from\('podcast_sales'\)/,'Solo administradora lee ventas');
});

test('Ventas: refrescar registros, moneda verdadera y resumen de accesos independiente',()=>{
 const studio=readFileSync('estudio-control/src/Studio.tsx','utf8');
 const api=readFileSync('estudio-control/src/supabase-client.ts','utf8');
 assert.match(studio,/setSalesRefreshKey\(n=>n\+1\)/,'Ventas tiene su propio botón de actualización');
 assert.match(studio,/page,account,salesRefreshKey/,'La actualización repite la lectura');
 assert.match(studio,/formatSaleAmount\(s\)/,'No asume USD cuando la moneda es diferente');
 assert.doesNotMatch(studio,/currency:s\.currency\?\.toUpperCase\(\)==='USD'\?'USD':'USD'/,'No se inventa la moneda');
 assert.match(studio,/Accesos de Content Lab/,'El Lab se diferencia de los PDF');
 assert.match(api,/from\('podcast_hub_entitlements'\)/,'El contador de accesos usa la fuente de verdad');
 assert.match(api,/await owner\(\)/,'Las consultas requieren administradora');
 assert.match(studio,/href="\.\.\/centro\/" target="_blank"/,'Enlace al Centro de productos');
});

test('Centro de Productos: las seis portadas originales se cargan sin modificar los checkouts',()=>{
 const center=readFileSync('centro/index.html','utf8');
 const script=readFileSync('centro/centro.js','utf8');
 const expected=[
  ['01-booking.svg','booking-flow'],
  ['02-website.svg','website-automation'],
  ['03-ai-booking.svg','ai-booking'],
  ['04-ai-followup.svg','ai-followup'],
  ['05-ai-business.svg','ai-business'],
  ['06-va-essential.svg','va']
 ];
 for(const [art,code] of expected){
  assert.match(center,new RegExp('src="\\./portadas/'+art.replaceAll('.','\\.')+'"'),'Portada cargada: '+art);
  const file=readFileSync('centro/portadas/'+art,'utf8');
  assert.match(file,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/,'Imagen vectorial original '+art);
  assert.match(file,/<\/svg>\s*$/,'SVG cerrado '+art);
  assert.match(center,new RegExp('data-detail="'+code+'"'),'Ficha disponible: '+code);
 }
 assert.equal((center.match(/class="tile-cover tile-cover-image"/g)||[]).length,6);
 assert.match(script,/service-checkout\/\?offer=booking-flow/);
 assert.match(script,/service-checkout\/\?offer=website-automation/);
 assert.match(script,/service-checkout\/\?offer=ai-booking/);
 assert.match(script,/service-checkout\/\?offer=ai-followup/);
 assert.match(script,/service-checkout\/\?offer=ai-business/);
 assert.match(script,/service-checkout\/\?offer=va/);
 assert.doesNotMatch(center,/src="\.\/portadas\/(?:0[1-6].*\.png)"/,'No prometer PNG que no existen');
});

test('Cuatro portadas originales: clase, Lab y dos productos digitales del podcast',()=>{
 const center=readFileSync('centro/index.html','utf8');
 const script=readFileSync('centro/centro.js','utf8');
 const expected=[
  ['07-tu-primera-web-con-ia.svg','web-class'],
  ['08-content-lab.svg','content-lab'],
  ['09-no-voy-tarde.svg','no-voy-tarde'],
  ['10-empezar-de-nuevo.svg','empezar-de-nuevo']
 ];
 for(const [image,code] of expected){
  const source=readFileSync('centro/portadas/'+image,'utf8');
  assert.match(source,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/,'SVG real '+image);
  assert.match(source,/<\/svg>\s*$/,'SVG completo '+image);
  assert.match(center,new RegExp('src="\\./portadas/'+image.replaceAll('.','\\.')+'"'),'Portada visible de '+code);
  assert.match(center,new RegExp('data-product="'+code+'"'),'Producto existente '+code);
  assert.match(center,new RegExp('data-detail="'+code+'"'),'Ficha de producto intacta '+code);
 }
 assert.equal((center.match(/class="program-cover program-cover-image"/g)||[]).length,2,'Dos portadas de programas');
 assert.equal((center.match(/class="tile-cover tile-cover-image tile-cover-resource"/g)||[]).length,2,'Dos portadas de recursos');
 assert.match(script,/releases=\{'web-class':false,'content-lab':false\}/,'Acceso cerrado por defecto');
 assert.match(script,/from\('podcast_hub_entitlements'\)/,'Acceso por compra verificada');
 assert.match(script,/checkout:'\.\.\/productos\/no-voy-tarde\.html'/,'Página original del diario');
 assert.match(script,/checkout:'\.\.\/productos\/empezar-de-nuevo\.html'/,'Página original del cuaderno');
});

test('Mara se muestra en un panel propio, con datos protegidos y carga opcional',()=>{
 assert.equal((room.match(/data-aula-view="mara"/g)||[]).length,1,'Un solo enlace de Mara en el sidebar');
 assert.equal((room.match(/data-aula-panel="mara"/g)||[]).length,1,'Una pantalla dedicada');
 assert.ok(course.includes("if(view==='mara')void ensureMara()"),'Mara solo se carga al navegar a su pantalla');
 assert.ok(course.includes("import('./mara-guide.js?v="),'La carga de Mara no bloquea el inicio del aula');
 assert.ok(maraGuide.includes("db.from('podcast_class_learning_assets')"),'Carga instrucciones desde el recurso privado');
 assert.ok(maraGuide.includes(".eq('course_id',courseId)"),'Consulta acotada al curso');
 assert.ok(maraGuide.includes("agent.instructions_en"),'Contenido en inglés');
 assert.ok(maraGuide.includes("agent.setup_en"),'Configuración en inglés');
 assert.ok(maraGuide.includes("navigator.clipboard"),'Los botones copiar están implementados');
 assert.doesNotMatch(maraGuide,/SUPABASE_SERVICE_ROLE_KEY|sk_live_|rk_live_|whsec_/);
 assert.ok(workflow.includes("node --check alumnos/mara-guide.js"),'El parser se comprueba en cada publicación');
});


test('Inspiración de demos no puede quedar vacía después de entrar al aula',()=>{
 const gallery=readFileSync('alumnos/inspiracion.js','utf8');
 const styles=readFileSync('alumnos/aula-inspiracion.css','utf8');
 assert.equal((room.match(/id="inspiration-gallery"/g)||[]).length,1,'Una sola galería en el aula');
 assert.match(course,/if\(view==='inspiracion'\)void ensureInspiracion\(\)/,'Abrir la pestaña activa su carga aunque falle la inicialización previa');
 assert.match(course,/function ensureInspiracion\(force=false\)/,'La galería puede volver a cargarse');
 assert.match(course,/function showInspirationRetry\(root\)/,'Hay recuperación visible y botón para reintentar');
 assert.match(course,/root\.querySelector\('\.inspiration-heading'\)/,'No se considera cargada si quedó vacía');
 assert.match(gallery,/\.eq\('asset_code','inspiration_gallery_v1'\)/,'Lectura de los demos de la clase');
 assert.match(gallery,/demos\.filter\(d=>d\.published!==false\)/,'Alumnos solo ven demos autorizados');
 assert.match(styles,/\.inspiration-recovery/,'La pantalla de error se puede leer en móvil');
 assert.doesNotMatch(room,/SUPABASE_SERVICE_ROLE_KEY|sk_live_/,'Nada confidencial en HTML');
});


test('Fotos etiquetadas por sección verificada, no por posición de archivo',()=>{
 const inspiration=readFileSync('alumnos/inspiracion.js','utf8');
 const styles=readFileSync('alumnos/aula-inspiracion.css','utf8');
 assert.match(inspiration,/const explicit=lang==='en'\?photo\?\.label_en:photo\?\.label_es/,'Priorizar metadatos reales de la imagen');
 assert.match(inspiration,/galleryPhotoSection\(p,curLang\(\)\)/,'Identificar la sección correspondiente');
 assert.match(inspiration,/galleryPhotoOrder\(a\.p,a\.index\)/,'Mostrar heroes identificados antes que referencias');
 assert.match(inspiration,/if\(p\.usage==='hero'\)/,'Los heroes requieren marcación explícita');
 assert.doesNotMatch(inspiration,/spanishPhotoNames|englishPhotoNames/,'Prohibir etiquetas fijas por índice');
 assert.match(inspiration,/coverPhoto\?\.usage==='hero'/,'La foto destacada solo dice Hero cuando está verificada');
 assert.match(styles,/\.inspiration-photo-section/,'El nombre de sección es visible en el teléfono');
 assert.ok(room.includes('./aula-inspiracion.css?v='),'El iPhone importa estilos versionados de inspiración');
 assert.ok(course.includes("./inspiracion.js?v="),'El aula importa la galería con versión de caché');
});


test('Prompts de secciones conservan imagen real, títulos y versión inglesa',()=>{
 const source=readFileSync('alumnos/inspiracion.js','utf8');
 const styles=readFileSync('alumnos/aula-inspiracion.css','utf8');
 assert.match(source,/prompt\?\.title_en/,'Los títulos corregidos son bilingües');
 assert.match(source,/p\.body_en\?p\.body_en/,'Los prompts corregidos prevalecen sobre traducciones de versiones antiguas');
 assert.match(source,/pic\.body_en\?pic\.body_en/,'Los prompts fotográficos conservan su traducción correcta');
 assert.match(source,/className='inspiration-step-photos'/,'El alumno ve la foto real junto a la etapa');
 assert.match(source,/p\.body\.includes\(photo\.url\)/,'Las imágenes se enlazan a la instrucción que las menciona');
 assert.match(styles,/\.inspiration-step-photo/, 'Vista visual del recurso en el iPhone');
 assert.ok(room.includes("const classroomModule='./curso.js?v="),'Safari importa un módulo versionado sin fijar nombres de releases');
});


test('Moodboard aprobado y lotes de nueve fotos, con guía bilingüe y sin tocar originales',()=>{
 const src=readFileSync('alumnos/inspiracion.js','utf8');
 const css=readFileSync('alumnos/aula-inspiracion.css','utf8');
 assert.match(src,/inspiration_workflow_v3/,'La guía independiente se carga junto a los demos sin saturar la biblioteca');
 assert.match(src,/Promise\.all\(/,'La galería y la guía se consultan juntas');
 assert.match(src,/fillCreativeWorkflowPrompt/,'Los prompts de moodboard se personalizan por marca y sección');
 assert.match(src,/Math\.min\(9,Math\.max\(1,/,'No se muestra un lote con más de nueve imágenes');
 assert.match(src,/inspiration-photo-batch/,'Cada lote muestra su número y fotografías separadas');
 assert.match(src,/inspiration-photo-directions/,'Cada foto tiene instrucciones propias de ubicación o reutilización');
 assert.match(src,/(?:guideCase\?\.extra_prompts|guidePayload\?\.cases\?\.\[d\.id\]\?\.extra_prompts)/,'Los casos sin material original reciben guías adicionales sin reemplazar los originales');
 assert.match(src,/mappedStagePhotos/,'Las fotos de cada prompt proceden de su sección verificada');
 assert.match(src,/correctedDemoText/,'Se corrigen rutas obsoletas sin alterar el archivo original');
 assert.match(css,/\.inspiration-workflow-steps/,'Los seis pasos se leen en móvil');
 assert.match(css,/\.inspiration-photo-batches/,'Los lotes se organizan en el aula');
 assert.doesNotMatch(src,/service_role|SUPABASE_SERVICE_ROLE_KEY/,'No hay claves privilegiadas en el aula');
});

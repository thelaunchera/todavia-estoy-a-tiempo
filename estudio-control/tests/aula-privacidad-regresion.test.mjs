import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';

// QA adicional, solo lectura. No crea alumnos, pagos ni cambia datos privados.
const room=readFileSync('alumnos/index.html','utf8');
const course=readFileSync('alumnos/curso.js','utf8');
const materials=readFileSync('alumnos/materiales-interactivos.js','utf8');
const materialsCss=readFileSync('alumnos/materiales-interactivos.css','utf8');
const workflow=readFileSync('.github/workflows/pages.yml','utf8');

test('biblioteca única: el sidebar comparte la misma pantalla de materiales, sin duplicar prompts',()=>{
 assert.equal((room.match(/data-aula-view="prompts"/g)||[]).length,2,'Un acceso en el menú y otro en el inicio');
 assert.equal((room.match(/id="materiales-interactivos"/g)||[]).length,1,'Un solo módulo montado');
 assert.equal((room.match(/data-aula-panel="prompts"/g)||[]).length,0,'Sin una segunda pantalla paralela');
 assert.match(course,/view==='prompts'\?'materiales':view/,'La entrada de prompts reutiliza Materiales');
 assert.match(course,/materialsController\?\.go\('prompts'\)/,'Navegación directa a los prompts');
 assert.match(course,/materialsController\?\.go\('inicio'\)/,'Materiales vuelve a la vista inicial');
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
 assert.match(room,/src="\.\/curso\.js\?v=/);
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
 assert.match(course,/lessons\.findIndex\(item=>!done\.has\(item\.lesson_code\)\)/,'El alumno retoma la primera lección sin terminar');
 assert.match(course,/\$\('lesson-prev'\)\.disabled=i<=0/,'La primera lección no permite retroceder');
});


test('Aula: productos por compra separados y Lab cerrado sin pago público',()=>{
 assert.match(room,/data-aula-panel="catalogo"/);
 assert.match(room,/learning-shelf-grid/);
 assert.match(room,/Content Lab/);
 assert.match(room,/Checkout no habilitado/);
 assert.match(room,/https:\/\/thelaunchera\.com\/service-checkout\/\?offer=booking-flow/);
 assert.match(room,/https:\/\/thelaunchera\.com\/service-checkout\/\?offer=ai-business/);
 assert.match(room,/href="\.\.\/productos\/no-voy-tarde\.html"/);
 assert.match(room,/href="\.\.\/productos\/empezar-de-nuevo\.html"/);
 assert.doesNotMatch(room,/href="[^"]*(?:content-lab\/(?!prompts\/)|lab\/checkout)/,'El Lab de pago y sus checkouts privados no deben ser enlaces públicos');
 assert.match(course,/catalogo:'Todos los productos'/);
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
 assert.match(room,/href="\.\.\/centro\/"/);
 assert.match(workflow,/cp -R assets productos clases alumnos centro _podcast_pages\//);
 assert.match(workflow,/node --check centro\/centro.js/);
 assert.match(workflow,/test -s _podcast_pages\/centro\/index.html/);
 assert.ok(centerCss.length>1000);
});


test('Catálogo de productos: acceso privado, PDF reales y Lab sin checkout público',()=>{
 assert.match(room,/id="learning-shelf-title"/,'Existe catálogo integrado en el aula');
 assert.match(room,/id="learning-lab-status"/,'El Lab refleja su estado');
 assert.match(room,/href="\.\.\/content-lab\/prompts\/"/,'El Lab sin acceso solo enlaza a prompts públicos');
 assert.match(room,/href="\.\.\/productos\/no-voy-tarde\.html"/,'Diario apunta a su landing real');
 assert.match(room,/href="\.\.\/productos\/empezar-de-nuevo\.html"/,'Cuaderno apunta a su landing real');
 assert.match(course,/from\('content_lab_memberships'\)/,'Lab consulta la membresía real');
 assert.match(course,/member\?\.status==='active'/,'Solo membresía activa habilita acceso');
 const studio=readFileSync('estudio-control/src/Studio.tsx','utf8');
 const service=readFileSync('estudio-control/src/supabase-client.ts','utf8');
 assert.match(studio,/Centro de ventas y productos/);
 assert.match(studio,/getVerifiedSales\(\)/,'Ventas se leen al abrir panel');
 assert.match(studio,/CHECKOUT \$10 · PAUSADO POR QA/,'No prometer compras de Lab activas');
 assert.match(service,/await owner\(\);[\s\S]*?client\.from\('podcast_sales'\)/,'Solo administradora lee las ventas');
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

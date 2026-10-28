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

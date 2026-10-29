import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {classLessons,classRecordingScript,classTotalMinutes,CLASS_SECTION,CLASS_TASK_SECTION,CLASS_CHECKLIST,CLASS_LAUNCH} from '../src/class-course.ts';
import {recordingStarts} from '../src/recording-starts.ts';

test('la clase contiene nueve videos únicos y guiones ampliados para seguridad y legales',()=>{
 assert.equal(classLessons.length,9);
 assert.equal(classTotalMinutes,57);
 assert.deepEqual(classLessons.map(x=>x.id),['00','01','02','03','04','05','06','07','08']);
 assert.equal(new Set(classLessons.map(x=>x.title)).size,9);
 assert.equal(CLASS_SECTION,'clase-01-produccion-privada');
 assert.equal(CLASS_LAUNCH,'2026-12-03');
});
test('cada video tiene escenas, qué decir, qué mostrar, materiales y un prompt copiables',()=>{
 for(const l of classLessons){
  assert.ok(l.minutes>=3&&l.minutes<=8);
  assert.ok(l.prep.length>=2);
  assert.ok(l.beats.length>=4);
  assert.ok(l.prompt.length>90);
  assert.ok(l.exercise.length>25);
  for(const b of l.beats){
   assert.ok(b.say.length>60);
   assert.ok(b.show.length>24);
  }
  const script=classRecordingScript(l);
  assert.match(script,/QUÉ DECIR/);
  assert.match(script,/QUÉ MOSTRAR/);
  assert.match(script,/ESCENA 1/);
 }
});
test('plan semanal privado, con tareas existentes y sin duplicar registros',()=>{
 const component=readFileSync('src/ClassWeeklyPlan.tsx','utf8');
 const studio=readFileSync('src/Studio.tsx','utf8');
 const production=readFileSync('src/ClassProduction.tsx','utf8');
 assert.equal(CLASS_TASK_SECTION,'Clase 01 · Lanzamiento 3 dic');
 assert.match(CLASS_CHECKLIST,/app\.notion\.com\/p\//);
 assert.match(component,/export const classWeeks=/);
 assert.match(component,/onToggle\(t,/);
 assert.match(component,/classLessons\.filter/);
 assert.match(component,/visited\.has\(key\)/);
 assert.doesNotMatch(component,/api\.post|localStorage|sessionStorage/);
 assert.match(studio,/generalTasks=tasks\.filter\(x=>x\.section!==CLASS_TASK_SECTION\)/);
 assert.match(studio,/onTaskToggle=/);
 assert.match(production,/<ClassWeeklyPlan tasks=\{tasks\}/);
});

test('una sola demo informativa: publicar gratis y separar los pagos',()=>{
 const intro=classLessons.find(x=>x.id==='00');
 const build=classLessons.find(x=>x.id==='05');
 const pay=classLessons.find(x=>x.id==='07');
 assert.match(intro.beats.map(x=>x.say).join(' '),/ficticia|ficticio/);
 assert.match(intro.beats.map(x=>x.show).join(' '),/SIN COMPRAS/);
 assert.match(build.beats.map(x=>x.say).join(' '),/AppDeploy/);
 assert.match(build.prompt,/AppDeploy/);
 assert.match(pay.beats.map(x=>x.say).join(' '),/Stripe/);
 assert.match(pay.beats.map(x=>x.say).join(' '),/Make/);
 assert.match(pay.beats.map(x=>x.say).join(' '),/Gmail/);
 assert.match(classLessons[0].beats.map(x=>x.say).join(' '),/frontend/);
 assert.match(classLessons[0].beats.map(x=>x.say).join(' '),/backend/);
 assert.match(pay.beats.map(x=>x.say).join(' '),/sin pedidos ni cobros/);
});
test('cada ficha tiene inicio repetible, clics y prompt completo, sin nuevas filas del aula',()=>{
 assert.deepEqual(Object.keys(recordingStarts).sort(),classLessons.map(x=>x.id));
 for(const lesson of classLessons){
  const guide=recordingStarts[lesson.id];
  assert.ok(guide.tabs.length>=2);
  assert.ok(guide.actions.length>=3);
  assert.ok(guide.savedPoint.length>=45);
  assert.ok(guide.finish.length>=35);
  assert.ok(guide.readyPrompt.length>=100);
 }
 const production=readFileSync('src/ClassProduction.tsx','utf8');
 const connector=readFileSync('src/ConnectorsLesson.tsx','utf8');
 assert.match(production,/recordingStart\.savedPoint/);
 assert.match(production,/recordingStart\.readyPrompt/);
 assert.match(production,/<ConnectorsLesson\/>/);
 assert.match(connector,/AppDeploy/);
 assert.match(connector,/Namecheap/);
 assert.match(connector,/Gmail/);
 assert.match(connector,/frontend/i);
 assert.match(connector,/backend/i);
 const studentGuide=readFileSync('../alumnos/guia-principiantes.js','utf8');
 const materials=readFileSync('../alumnos/materiales-interactivos.js','utf8');
 assert.match(studentGuide,/Stripe/);
 assert.match(studentGuide,/Gmail/);
 assert.match(studentGuide,/00_IDEA/);
 assert.match(materials,/renderWebBasics/);
 assert.match(materials,/renderProjectOrder/);
 assert.match(connector,/Supabase/);
});

test('automatizaciones, seguridad y footer se enseñan dentro de las nueve fichas',()=>{
 const pay=classLessons.find(l=>l.id==='07'), end=classLessons.find(l=>l.id==='08');
 const p=pay.beats.map(b=>b.say).join(' ');
 const e=end.beats.map(b=>b.say).join(' ');
 assert.match(p,/escenarios activos/);
 assert.match(p,/gestor de contraseñas/);
 assert.match(p,/API/);
 assert.match(e,/pie de página/);
 assert.match(e,/privacidad/);
 assert.match(e,/accesibilidad/);
 const learner=readFileSync('../alumnos/materiales-interactivos.js','utf8');
 const module=readFileSync('../alumnos/recursos-avanzados.js','utf8');
 assert.match(learner,/resource\.payload\.extras/,'carga las guías de la tabla privada');
 assert.match(learner,/renderWebGuide/);
 assert.match(learner,/renderMakeResources/);
 assert.match(learner,/renderSafetyResources/);
 assert.match(learner,/renderLegalResources/);
 assert.match(module,/navigator\.clipboard\.writeText/);
 assert.doesNotMatch(module,/private_key|sk_test_|sk_live_/,'sin claves reales');
});

test('biblioteca privada Casa Brownie no duplica lecciones y reserva video para bono',()=>{
 const studio=readFileSync('src/Studio.tsx','utf8');
 const production=readFileSync('src/ClassProduction.tsx','utf8');
 const kit=readFileSync('src/CasaBrownieStudioKit.tsx','utf8');
 const guide=readFileSync('src/recording-starts.ts','utf8');
 assert.match(studio,/clase-01-recursos-visuales/,'no aparece como idea editorial duplicada');
 assert.match(production,/<CasaBrownieStudioKit entry=\{visualKit\}\/>/);
 assert.match(kit,/CASA_BROWNIE_KIT_SECTION='clase-01-recursos-visuales'/);
 assert.match(kit,/promptFilter/);
 assert.match(kit,/practice_app_url/,'studio exposes the separate AppDeploy practice project');
 assert.match(kit,/dashboard\.appdeploy\.ai/,'teacher can open the AppDeploy dashboard to edit the starter');
 assert.match(kit,/navigator\.clipboard\.writeText/);
 assert.match(kit,/p\.lesson!=='bonus'/,'los prompts de bonos no aparecen en la formación base');
 assert.match(kit,/lesson==='bonus'/,'el video tiene su pestaña independiente');
 assert.match(guide,/\?etapa=sin-video/,'primero versión estática');
 assert.equal(classLessons.length,9,'no debe agregarse video como clase 10');
});

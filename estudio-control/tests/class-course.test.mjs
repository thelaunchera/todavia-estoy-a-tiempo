import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {classLessons,classRecordingScript,classTotalMinutes,CLASS_SECTION,CLASS_TASK_SECTION,CLASS_CHECKLIST,CLASS_LAUNCH} from '../src/class-course.ts';

test('la clase contiene nueve videos únicos y un objetivo de 53 minutos',()=>{
 assert.equal(classLessons.length,9);
 assert.equal(classTotalMinutes,53);
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

test('el ejemplo regulado es ficticio y el checkout se enseña con otro producto',()=>{
 const demo=classLessons.find(x=>x.id==='00');
 const pay=classLessons.find(x=>x.id==='07');
 assert.match(demo.beats.map(x=>x.say).join(' '),/ficticia|ficticio/);
 assert.match(demo.beats.map(x=>x.show).join(' '),/SIN COMPRAS/);
 assert.match(pay.beats.map(x=>x.say).join(' '),/producto digital|guía digital/);
 assert.match(pay.prompt,/PERMITIDO/);
});

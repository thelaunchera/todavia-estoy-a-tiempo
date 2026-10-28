import assert from 'node:assert/strict';
import { test } from 'node:test';
import { editorialPlan } from '../src/editorial-plan.ts';

test('the new monthly calendar excludes completed broadcasts and archived production work', () => {
  const published = { id: 'published', status: 'publicado', date: '2026-10-27' };
  const old = { id: 'old', archived: true, status: 'en producción', date: '2027-04-20', script: 'Conservar', audio: 'original.mp3' };
  const skill = { id: 'skill', status: 'borrador privado', date: '2026-11-10' };
  const research = { id: 'research', status: 'borrador privado', date: '2026-11-03' };
  const input = [published, old, skill, research];
  const before = structuredClone(input);
  const plan = editorialPlan(input);
  assert.deepEqual(plan.planned.map(row => row.id), ['research', 'skill']);
  assert.deepEqual(plan.published, [published]);
  assert.deepEqual(plan.archived, [old]);
  assert.equal(plan.active.length, 3);
  assert.match(plan.label, /noviembre.*2026/);
  assert.deepEqual(input, before, 'view selection must never rewrite saved content');
});

test('archived scripts with no date cannot become the next episode', () => {
  const plan = editorialPlan([{ archived: true, status: 'guion listo', date: null }]);
  assert.equal(plan.planned.length, 0);
  assert.equal(plan.label, 'Sin mes planificado');
});

test('publishing a monthly episode keeps it in that month without returning it to the production queue', () => {
  const done = { status: 'publicado', date: '2026-11-03', planning_month: '2026-11' };
  const historical = { status: 'publicado', date: '2026-10-27' };
  const plan = editorialPlan([historical, done]);
  assert.deepEqual(plan.month, [done]);
  assert.equal(plan.planned.length, 0);
  assert.equal(plan.published.length, 2);
  assert.match(plan.label, /noviembre.*2026/);
});

test('published chapters from prior month stay visible in default Todos and Publicados', () => {
  const episode1 = { id:'ep1',status:'publicado',date:'2026-10-20',archived:false,audio:'01.mp3' };
  const episode2 = { id:'ep2',status:'publicado',date:'2026-10-27',archived:false,audio:'02.mp3' };
  const november = { id:'nov3',status:'en producción',date:'2026-11-03',planning_month:'2026-11' };
  const archived = { id:'old',archived:true,status:'en producción',date:'2026-09-07' };
  const data = [episode1,episode2,november,archived];
  const original = structuredClone(data);
  const plan = editorialPlan(data);
  assert.deepEqual(plan.active.map(row=>row.id),['ep1','ep2','nov3']);
  assert.deepEqual(plan.published.map(row=>row.id),['ep1','ep2']);
  assert.deepEqual(plan.month.map(row=>row.id),['nov3']);
  assert.deepEqual(plan.archived.map(row=>row.id),['old']);
  assert.deepEqual(data, original,'switching episode tabs must never mutate audio or publication states');
});

test('all visible episode filters exclude archived originals without deleting their content', () => {
  const older = { id:'backed-up',title:'Texto original',archived:true,status:'guion listo',script:'Guion completo',audio:'audio.mp3',date:'2026-09-01' };
  const published = { id:'published',archived:false,status:'publicado',date:'2026-10-27' };
  const next = { id:'next',archived:false,status:'en producción',date:'2026-11-03',planning_month:'2026-11' };
  const source = [older,published,next];
  const plan = editorialPlan(source);
  for (const tab of [plan.active,plan.month,plan.published]) {
    assert.ok(tab.every(episode=>episode.archived!==true),'visible tabs must omit archived originals');
  }
  assert.deepEqual(plan.archived,[older],'original audio and script remain safely stored');
});

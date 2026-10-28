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

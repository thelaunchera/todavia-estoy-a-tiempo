import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const schema = readFileSync(new URL('../sql/estructura-podcast.sql',import.meta.url),'utf8');
const expected = [
  'podcast_studio_admins','podcast_studio_entries','podcast_sales',
  'podcast_subscribers','podcast_support_messages','podcast_delivery_events',
  'podcast_automation_runs','podcast_integrations'
];
for(const table of expected){
 assert.ok(schema.includes('create table if not exists public.'+table+' ('),'Falta la tabla '+table);
}
assert.equal((schema.match(/^\s*begin;/gmi)||[]).length,1,'Una sola transacción');
assert.equal((schema.match(/^\s*commit;/gmi)||[]).length,1,'La transacción debe terminar una sola vez');
assert.equal((schema.match(/create table if not exists public\./g)||[]).length,expected.length,'Tablas duplicadas');
assert.ok(schema.includes('alter table public.podcast_studio_admins enable row level security'),'Falta RLS admins');
assert.ok(schema.includes('alter table public.podcast_studio_entries enable row level security'),'Falta RLS registros');
assert.ok(schema.includes("role=''owner''"),'Los datos financieros requieren rol owner');
assert.ok(schema.includes('podcast_entries_local_import_uniq'),'La importación necesita clave idempotente');
assert.ok(!schema.includes("service_role"),'Las claves sensibles no se incluyen en SQL del frontend');
console.log('Esquema del podcast: estructura, aislamiento y reglas críticas comprobadas.');

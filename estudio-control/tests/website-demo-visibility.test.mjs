import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const controls=read('../src/WebsiteDemoVisibility.tsx');
const gallery=read('../src/FinishedDemos.tsx');
const api=read('../src/supabase-client.ts');
const css=read('../src/finished-demos.css');

test('Website portfolio and Aula use independent controls',()=>{
 assert.match(gallery,/WebsiteDemoVisibilityButton/);
 assert.match(gallery,/ClassroomDemoPublication/);
 assert.match(gallery,/WebsiteDemoVisibilitySummary/);
 assert.match(controls,/Ocultar de Websites/);
 assert.match(controls,/Mostrar en Websites/);
 assert.match(controls,/isClient/);
 assert.match(gallery,/isClient=\{d.kind==='live'\}/);
});
test('Sneekiefs is present in the Website of Websites selector and summary',()=>{
  assert.match(gallery,/id:'sneekiefs'/,'Sneekiefs source card must exist once');
  assert.doesNotMatch(gallery,/d\.id!==['"]sneekiefs['"]/,'Sneekiefs must not be excluded from public visibility controls');
  assert.match(gallery,/finishedDemos\.filter\(d=>d\.kind!=='live'\)\.map\(d=>websiteDemoId\(d\.id\)\)/,'All public demo IDs must count in the summary');
  assert.match(gallery,/<WebsiteDemoVisibilityButton control=\{website\} id=\{d\.id\} title=\{d\.title\} isClient=\{d\.kind==='live'\}\/?>/,'Every demo card must render the existing Website toggle');
  assert.match(api,/\.upsert\(\{demo_id:demoId,visible,updated_at:/,'The toggle must persist to the existing owner-only visibility table');
});
test('Public slug aliases preserve one Casa Brownie and the Ivory & Bloom route',()=>{
 assert.match(controls,/'casa-brownie-static':'casa-brownie'/);
 assert.match(controls,/'ivory-bloom':'ivory-and-bloom'/);
 assert.match(controls,/Una sola selección para ambas versiones/);
});
test('Studio requires an authorized owner to edit public table',()=>{
 assert.match(api,/export async function getWebsiteDemoVisibility/);
 assert.match(api,/export async function setWebsiteDemoVisibility/);
 const write=api.slice(api.indexOf('export async function setWebsiteDemoVisibility'));
 assert.match(write,/await owner\(\)/);
 assert.match(write,/\.upsert\(/);
 assert.match(write,/\.select\('demo_id,visible'\)\.single\(\)/);
});
test('Mobile tap targets and status messaging exist',()=>{
 assert.match(css,/\.finished-demo-website-control button/);
 assert.match(css,/min-height:44px/);
 assert.match(controls,/No se pudo comprobar/);
});

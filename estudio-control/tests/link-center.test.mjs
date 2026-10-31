import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/LinkCenter.tsx', import.meta.url),'utf8');
const studio = readFileSync(new URL('../src/Studio.tsx',import.meta.url),'utf8');
const records=[...source.matchAll(/\{key:'([^']+)',title:'([^']+)',url:'([^']+)',category:'([^']+)',visibility:'([^']+)'/g)]
  .map(x=>({key:x[1],title:x[2],url:x[3],category:x[4],visibility:x[5]}));
test('Link Center registers distinct categories and usable HTTPS links',()=>{
  assert.ok(records.length>=24, 'Expected actual registered links, not empty placeholder cards');
  assert.equal(new Set(records.map(x=>x.key)).size,records.length,'Duplicate link keys');
  for(const item of records){
    assert.ok(item.title.trim() && item.url.startsWith('https://'),item.key);
    assert.ok(['thelaunchera','podcast','escuela','lab'].includes(item.category),item.key);
    assert.ok(['publico','demo','interno','revision'].includes(item.visibility),item.key);
    assert.equal(new URL(item.url).protocol,'https:',item.key);
  }
  for(const category of ['thelaunchera','podcast','escuela','lab'])
    assert.ok(records.some(x=>x.category===category),'Missing '+category);
});
test('Private buyer, owner and checkout links cannot be copied in public batches',()=>{
  const lookup=Object.fromEntries(records.map(x=>[x.key,x]));
  for(const id of ['pod-studio','school-aula','school-club','school-pdf','lab-editor','lab-repo'])
    assert.equal(lookup[id]?.visibility,'interno',id);
  assert.equal(lookup['tle-checkout']?.visibility,'revision');
  assert.equal(lookup['school-wait']?.visibility,'publico');
  assert.equal(lookup['lab-prompts']?.visibility,'publico');
  assert.match(source,/const allowed=shown\.filter\(x=>shareable\(x\.visibility\) && \(LINK_PUBLICATION\[x\.key\]/);
  assert.match(source,/v==='publico' \|\| v==='demo'/);
});
test('Recording mode hides all private and review-only links',()=>{
  assert.match(source,/!readOnly \|\| shareable\(x\.visibility\)/);
  assert.match(source,/readOnly \? 'Modo grabación: solo se muestran enlaces públicos y demos/);
});
test('New Studio links point to GitHub-hosted versions, not old AppDeploy prototypes',()=>{
  assert.equal(records.some(x=>x.url.includes('appdeploy.ai')),false);
  assert.match(records.find(x=>x.key==='lab-editor')?.url||'',/podcast\.thelaunchera\.com\/content-lab\//);
  assert.match(records.find(x=>x.key==='lab-prompts')?.url||'',/\/content-lab\/prompts\//);
});
test('Link Center lives inside the protected Studio and accepts deep links',()=>{
  assert.match(studio,/import LinkCenter, \{ LINK_CENTER_SECTION \} from '\.\/LinkCenter'/);
  assert.match(studio,/page === 'links'/);
  assert.match(studio,/label: 'Centro de links'/);
  assert.match(studio,/section === 'ventas' \|\| section === 'links'/);
  assert.match(studio,/p==='ventas' \|\| p==='links'/);
  assert.match(studio,/x\.section !== LINK_CENTER_SECTION/);
  assert.match(source,/api\.(?:post|put|delete)\('\/api\/items\/ideas/);
});

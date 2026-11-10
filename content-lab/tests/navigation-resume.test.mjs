import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL(p,import.meta.url),'utf8');
const shared=read('../../creative-shared/NavigationMemory.ts');
const lab=read('../src/App.tsx');
const studio=read('../../estudio-control/src/Studio.tsx');
const aula=read('../../alumnos/curso.js');

test('two-hour account-scoped restoration is bounded and excludes authentication data',()=>{
 assert.match(shared,/2 \* 60 \* 60 \* 1000/);
 assert.match(shared,/key\(app,owner\)/);
 assert.match(shared,/now-parsed.savedAt>=NAVIGATION_RESUME_MS/);
 assert.match(shared,/allowed.includes\(parsed.view\)/);
 assert.doesNotMatch(shared,/accessToken|refreshToken|password|secret:/);
});
test('Lab Back and Close no longer share the same action',()=>{
 assert.match(lab,/const backOneView=/);
 assert.match(lab,/const closeView=/);
 assert.match(lab,/onClick=\{backOneView\}/);
 assert.match(lab,/onClick=\{closeView\}/);
 assert.match(lab,/event\.state\?\.tleLabTab/);
 assert.match(lab,/clearNavigationPlace\('content-lab'/);
});
test('Private Studio stores section history and links to the prior actual page',()=>{
 assert.match(studio,/const goStudioBack=/);
 assert.match(studio,/const closeStudioSection=/);
 assert.match(studio,/onClick=\{goStudioBack\}/);
 assert.match(studio,/onClick=\{closeStudioSection\}/);
 assert.match(studio,/tleStudioPage/);
 assert.match(studio,/clearNavigationPlace\('studio'/);
});
test('Aula restores lesson and view on same signed-in profile',()=>{
 assert.match(aula,/AULA_PLACE_TTL_MS=2\*60\*60\*1000/);
 assert.match(aula,/const aulaPlaceKey=\(\)=>user\?\.id/);
 assert.match(aula,/const storedAulaPlace=readAulaPlace\(\)/);
 assert.match(aula,/function choose\(i,\{track=true\}=\{\}\)/);
 assert.match(aula,/function backAulaPlace\(\)/);
 assert.match(aula,/clearAulaPlace\(\);clearRememberedStudent/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');
const memory=read('../../creative-shared/NavigationMemory.ts');
const lab=read('../src/App.tsx');
const studio=read('../../estudio-control/src/Studio.tsx');
const aula=read('../../alumnos/curso.js');

test('navigation snapshots expire after two hours and are scoped to the signed-in account',()=>{
 assert.match(memory,/2 \* 60 \* 60 \* 1000/);
 assert.match(memory,/owner\.trim\(\)\.toLowerCase\(\)/);
 assert.match(memory,/now-parsed\.savedAt>=NAVIGATION_RESUME_MS/);
 assert.match(memory,/allowed\.includes\(parsed\.view\)/);
 assert.match(memory,/localStorage\.removeItem/);
});
test('Content Lab Back traverses prior sections; explicit Close returns home',()=>{
 assert.match(lab,/const backOneView=/);
 assert.match(lab,/navStackRef\.current\.pop\(\)/);
 assert.match(lab,/window\.history\.back\(\)/);
 assert.match(lab,/const closeView=/);
 assert.match(lab,/onClick=\{backOneView\}/);
 assert.match(lab,/onClick=\{closeView\}/);
 assert.doesNotMatch(lab,/lab-carousel-editor-exit" onClick=\{\(\) => navigate\('home'\)/);
});
test('Lab restores only after authentication and preserves notification deep links',()=>{
 assert.match(lab,/readNavigationPlace<Tab/);
 assert.match(lab,/if\(!owner\|\|waiting\)return/);
 assert.match(lab,/searchParams\.has\('notification'\)/);
 assert.match(lab,/writeNavigationPlace\('content-lab'/);
 assert.match(lab,/clearNavigationPlace\('content-lab'/);
 assert.match(lab,/visibilitychange/);
});
test('Studio uses browser push/pop navigation, account-scoped resume and explicit close',()=>{
 assert.match(studio,/window\.history\.pushState\(\{tleStudioPage:p\}/);
 assert.match(studio,/window\.addEventListener\('popstate',onPop\)/);
 assert.match(studio,/readNavigationPlace<Page>\('studio'/);
 assert.match(studio,/onClick=\{goStudioBack\}/);
 assert.match(studio,/onClick=\{closeStudioSection\}/);
 assert.match(studio,/clearNavigationPlace\('studio'/);
});
test('Aula restores authentic lesson index, section history and scroll after sign-in',()=>{
 assert.match(aula,/AULA_PLACE_TTL_MS=2\*60\*60\*1000/);
 assert.match(aula,/const storedAulaPlace=readAulaPlace\(\)/);
 assert.match(aula,/if\(lessons\[storedAulaPlace\.lesson\]\)choose\(/);
 assert.match(aula,/aulaViewHistory\.push\('lesson:'\+selected\)/);
 assert.match(aula,/aulaBackButton\.addEventListener\('click',backAulaPlace\)/);
 assert.match(aula,/clearAulaPlace\(\);clearRememberedStudent/);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const demo='freebies/march-premium-app/demo/';
const html=read(demo+'index.html');
const js=read(demo+'app.js');
const css=read(demo+'styles.css');

test('DAYLINE is a real three-screen app in GitHub, with no external dependencies or invented image assets',()=>{
 for(const asset of ['index.html','app.js','styles.css'])assert.ok(existsSync(resolve(root,demo+asset)),asset);
 for(const id of ['screen-capture','screen-focus','screen-done','idea-form','step-form','steps-list','project-list','progress-track','done-active','delete-dialog','toast'])assert.ok(html.includes('id="'+id+'"'),'Missing '+id);
 assert.ok(html.includes('lang="es"'));
 assert.ok(html.includes('noindex,nofollow'));
 assert.ok(!html.includes('https://images.')); // No borrowed image placeholders
 assert.ok(!/<img\s/i.test(html)); // The visual identity is drawn using CSS and an original SVG
 new Script(js);
});

test('No dead UI: capture, focus, completion and deletion controls have event handlers',()=>{
 for(const text of ['addEventListener("submit",createIdea)','addEventListener("submit",addStep)','addEventListener("click",sample)','addEventListener("click",removeIdea)','toggleStep(target.dataset.toggleStep)','removeStep(target.dataset.removeStep)','openProject(target.dataset.open)','promptDelete(target.dataset.delete)','navigate("done")','saveState()']){
  assert.ok(js.includes(text),'Missing action: '+text);
 }
 assert.ok(js.includes('localStorage.setItem(KEY'));
 assert.ok(js.includes('localStorage.getItem(KEY'));
 assert.ok(js.includes('project.completedAt'));
 assert.ok(js.includes('setAttribute("aria-valuenow"'));
 assert.ok(js.includes('step.done'));
 assert.ok(js.includes('showToast(txt("completed"))'));
});

test('The DAYLINE palette is distinct from The Launch Era and from the sample creator',()=>{
 assert.match(css,/#24162E/i);
 assert.match(css,/#FF8A57/i);
 assert.match(css,/#D7D0FE/i);
 assert.match(css,/#FAF6F1/i);
 assert.doesNotMatch(css,/#F2D85B/i);
 assert.doesNotMatch(css,/#C7E3EF/i);
 assert.ok(html.includes('DAYLINE'));
 assert.ok(css.includes('@media(max-width:790px)'));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(css.includes('safe-area-inset-bottom'));
});

test('Both languages include all declared visible text and functional responses',()=>{
 const ids=[...html.matchAll(/data-i18n="([^"]+)"/g)].map(x=>x[1]);
 assert.ok(ids.length>=36);
 for(const key of ids){
  assert.ok(js.includes(key+':"')||js.includes(key+':('),'Missing translation: '+key);
 }
 for(const key of ['titleError','stepError','noStorage','offline','completed','sampleLoaded','markDone','markPending','localTitle']){
  assert.ok(js.includes(key+':'),'Missing feedback translation: '+key);
 }
 assert.ok(js.includes('url.searchParams.set("lang",lang)'));
 assert.ok(js.includes('document.documentElement.lang=lang'));
 assert.ok(js.includes('lang=new URLSearchParams(location.search).get("lang")==="en"?"en":"es"'));
});

test('The freebie landing and private page link to DAYLINE but hide the public release before March',()=>{
 const landing=read('freebies/march-premium-app/index.html');
 const access=read('freebies/march-premium-app/access/index.html');
 for(const page of [landing,access]){
  assert.ok(page.includes('/freebies/march-premium-app/demo/'));
  assert.ok(page.includes('data-es="Probar'));
  assert.ok(page.includes('data-en="Try'));
 }
 const catalog=read('freebies/index.html');
 assert.ok(catalog.includes('if(today<x.date)continue'));
 assert.ok(catalog.includes('date:"2027-03-01"'));
 assert.ok(!catalog.includes('href="/freebies/march-premium-app/demo/"'));
});

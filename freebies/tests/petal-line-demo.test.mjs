import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const base='freebies/march-premium-app/demo/';
const html=read(base+'index.html'),css=read(base+'styles.css'),js=read(base+'app.js');

test('PETAL LINE has an original, bilingual, 3-screen virtual queue experience',()=>{
  for(const asset of ['index.html','styles.css','app.js'])assert.ok(existsSync(resolve(root,base+asset)),asset);
  for(const id of ['screen-start','screen-line','screen-ready','join-form','visitor-name','advance-button','arrived-button','restart-button','queue-position','ahead-count','arrival-confirmation','language'])
    assert.ok(html.includes('id="'+id+'"'),'Missing '+id);
  assert.match(html,/<html lang="es">/);
  assert.match(html,/noindex,nofollow/);
  assert.ok(html.includes('PETAL LINE'));
  assert.ok(!html.includes('DAYLINE')&&!html.includes('idea-form')&&!html.includes('progress-track'));
  new Script(js);
});

test('Every control is wired, and the queue progresses only through explicit demo interactions',()=>{
  for(const expr of ['addEventListener("submit",join)','addEventListener("click",advance)','addEventListener("click",arrive)','addEventListener("click",leave)','addEventListener("click",switchLang)','position:4','active.position-1','active.position===0?"ready":"line"','active.arrived=true','localStorage.setItem(KEY','localStorage.removeItem(KEY'])
    assert.ok(js.includes(expr),'Missing behavior '+expr);
  assert.ok(js.includes('t("readyMessage")(active.name)'));
  assert.ok(html.includes('id="open-join"'));
  assert.ok(html.includes('id="join-panel" hidden'));
  assert.ok(js.includes('ui.openJoin.addEventListener("click"'));
  assert.ok(js.includes('ui.backHero.addEventListener("click"'));
  assert.ok(html.includes('class="queue-map"'));
  assert.ok(html.includes('class="queue-sheet"'));
  assert.ok(html.includes('class="ready-illustration"'));
  assert.ok(js.includes('ui.confirmation.hidden=!active.arrived'));
  assert.ok(html.includes('Simulación interactiva. No es una fila real ni envía mensajes.'));
  assert.ok(!js.includes('fetch(')&&!js.includes('sendNotification('));
});

test('Separate visual system, accessible responsive controls, and reduced motion',()=>{
  for(const color of ['#24162E','#FF8A57','#D7D0FE','#FAF6F1'])
    assert.ok(css.includes(color)||html.includes(color),'Missing original color '+color);
  assert.doesNotMatch(css,/#F2D85B|#E2382A|#FFC93C/i);
  assert.ok(css.includes('@media(max-width:790px)'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(html.includes('<svg'));
  assert.ok(html.includes('<img src="./petal-street.svg"'));
  assert.ok(existsSync(resolve(root,base+'petal-street.svg')));
  assert.ok(!html.includes('https://images.'));
});

test('Both languages cover every visible component and transactional feedback',()=>{
  const keys=[...html.matchAll(/data-t="([^"]+)"/g)].map(x=>x[1]);
  const richKeys=[...html.matchAll(/data-t-html="([^"]+)"/g)].map(x=>x[1]);
  assert.ok(keys.length>=24);
  for(const key of [...keys,...richKeys]){
    const occurrences=js.split(key+':"').length-1;
    assert.equal(occurrences,2,'Missing ES or EN translation of '+key);
  }
  for(const key of ['joinError','joined','advanced','readyToast','left','confirmed','offline','storageWarning','purposeBouquet','purposePickup','namePlaceholder'])
    assert.ok(js.includes(key+':'),'Missing localized feedback '+key);
  assert.ok(js.includes('url.searchParams.set("lang",lang)'));
  assert.ok(js.includes('lang=new URLSearchParams(location.search).get("lang")==="en"?"en":"es"'));
});

test('March freebie can open the demo without publishing protected prompt content',()=>{
  const landing=read('freebies/march-premium-app/index.html');
  const access=read('freebies/march-premium-app/access/index.html');
  for(const page of [landing,access]){
    assert.ok(page.includes('/freebies/march-premium-app/demo/'));
    assert.ok(!page.includes('Before any UI screens, produce one consistent design brief'));
  }
  assert.ok(read('freebies/index.html').includes('if(today<x.date)continue'));
});

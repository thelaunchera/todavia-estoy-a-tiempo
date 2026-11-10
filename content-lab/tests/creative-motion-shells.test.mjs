import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const lab = readFileSync(new URL('../src/ContentLabMotion.css',import.meta.url),'utf8');
const studio = readFileSync(new URL('../../estudio-control/src/studio-navigation-20261108.css',import.meta.url),'utf8');
const aula = readFileSync(new URL('../../alumnos/aula-sidebar.css',import.meta.url),'utf8');

test('Lab keeps fixed editor sheets viewport-fixed while animating tab transitions',()=>{
  assert.match(lab,/@keyframes labPageFadeOnly/);
  assert.match(lab,/\.app-shell \.content\[data-lab-tab\]\{animation:labPageFadeOnly/);
  assert.match(lab,/\.app-shell \.fg-detail\{animation:labSheetReveal/);
  assert.match(lab,/prefers-reduced-motion:reduce/);
});

test('carousel and gallery scroll snap is limited to horizontal preview/filter rails',()=>{
  assert.match(lab,/\.app-shell \.factory-slide-strip/);
  assert.match(lab,/\.app-shell \.fg-filterbar/);
  assert.match(lab,/scroll-snap-type:x proximity/);
  assert.doesNotMatch(lab,/\.app-shell \.factory-preview\s*\{[^}]*scroll-snap-type/s);
});

test('Studio navigation and demo previews remain scoped to the private UI',()=>{
  assert.match(studio,/\.studio \.sidebar \.studio-area-nav/);
  assert.match(studio,/\.studio \.finished-demo-card:focus-within/);
  assert.match(studio,/prefers-reduced-motion:reduce/);
});

test('student aula navigation and resources retain accessible mobile/reduced-motion states',()=>{
  assert.match(aula,/#aula-layout \.aula-navigation/);
  assert.match(aula,/body\.aula-member\.aula-menu-open\{overflow:hidden\}/);
  assert.match(aula,/prefers-reduced-motion:reduce/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../../creative-shared/editorial-motion.css',import.meta.url),'utf8');
const marker='2026-11-10 / Brand personality for CREATIVE HUBS ONLY';
const section=css.slice(css.indexOf(marker));

test('owner Studio and commercial Content Lab each keep distinct visual surfaces',()=>{
  assert.ok(section.length>1000,'shared design section exists');
  assert.match(section,/\.studio \.studio-hub-heading h2/,'owner Studio has editorial title');
  assert.match(section,/\.studio \.studio-hub-card/,'owner Studio visual cards');
  assert.match(section,/\.app-shell \.content\[data-lab-tab="formats"\] \.fg-card/,'buyer Lab format tiles');
  assert.match(section,/\.app-shell \.sidebar nav button\.active/,'Lab active nav');
  assert.match(section,/focus-visible|focus-within/,'keyboard accessibility');
  assert.match(section,/forced-colors:active/,'high-contrast preference');
  assert.match(section,/prefers-reduced-motion:reduce/,'reduced-motion preference');
  assert.doesNotMatch(section,/(?:\.canvas|\.editor-canvas|\.layers|#editorCanvas|autosave|localStorage|sessionStorage)/,
    'hub design must never affect editor, user session, layers or autosave');
  assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length,'CSS brackets balance');
});

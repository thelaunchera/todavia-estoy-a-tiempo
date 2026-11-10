import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../../creative-shared/editorial-motion.css',import.meta.url),'utf8');

test('Owner Studio and buyer Lab share only navigation presentation',()=>{
  assert.match(css,/:where\(\.studio,\.app-shell\)/);
  assert.match(css,/:focus-visible/,'keyboard users should be able to see focus');
  assert.match(css,/\.app-shell \.lab-mobile-dock button/,'mobile navigation remains easy to tap');
  assert.match(css,/min-height:44px/,'mobile navigation target minimum');
  assert.match(css,/prefers-reduced-motion:reduce/,'motion preference respected');
  assert.doesNotMatch(css,/(?:\.canvas|\.layer-content|#editorCanvas)[\s:{]/,
    'shared UI polish may not change the editing surface');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/index.css',import.meta.url),'utf8');

test('Mobile dock is a sibling after main, not part of the scrolling content',()=>{
  const marker=app.indexOf('className="lab-mobile-dock"');
  assert.ok(marker>0);
  assert.ok(app.lastIndexOf('</main>',marker)>0);
  assert.ok(app.lastIndexOf('</main>',marker)>app.lastIndexOf('<main',marker));
});

test('Mobile dock remains fixed and avoids Safari glass-blur compositing',()=>{
  assert.match(css,/\.app-shell\s*>\s*\.lab-mobile-dock\s*\{[^}]*position:fixed;/s);
  assert.match(css,/\.app-shell\s*>\s*\.lab-mobile-dock\s*\{[^}]*-webkit-backdrop-filter:none;/s);
  assert.match(css,/\.app-shell\s*>\s*\.lab-mobile-dock\s*\{[^}]*env\(safe-area-inset-bottom/s);
  assert.match(css,/\.app-shell\s*>\s*\.lab-mobile-dock button svg\s*\{[^}]*transform:none/s);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/index.css',import.meta.url),'utf8');

test('Mobile header no longer clips the Create dropdown',()=>{
  assert.match(css,/the Create dropdown must not be clipped/);
  assert.match(css,/\.app-shell \.top\s*\{\s*overflow:visible;/);
  assert.match(css,/\.app-shell \.top > div:first-child\s*\{[^}]*overflow:hidden;/s);
  assert.match(css,/\.app-shell \.top > div:last-child\s*\{\s*overflow:visible;/);
  assert.match(css,/\.app-shell \.top\s*\{[^}]*z-index:30;/s);
});

test('Create menu closes on selection, outside touch and Escape',()=>{
  assert.match(app,/ref=\{createMenuRef\} className="lab-create-menu"/);
  assert.match(app,/createMenuRef\.current!\.open=false;startFactory\(\)/);
  assert.match(app,/createMenuRef\.current!\.open=false;startVertical\('Story'\)/);
  assert.match(app,/document\.addEventListener\('pointerdown',closeOutside\)/);
  assert.match(app,/document\.addEventListener\('keydown',closeOnEscape\)/);
  assert.match(app,/document\.removeEventListener\('pointerdown',closeOutside\)/);
});

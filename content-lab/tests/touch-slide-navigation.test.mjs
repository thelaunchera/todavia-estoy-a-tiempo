import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const canvas=readFileSync(new URL('../src/TouchLayerCanvas.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/TouchLayerCanvas.css',import.meta.url),'utf8');

test('Panorama enters slide navigation mode instead of accidentally moving overlapping assets',()=>{
 assert.match(canvas,/useState<'navigate'\|'edit'>\(pageCount>1\?'navigate':'edit'\)/);
 assert.match(canvas,/pageCount>1&&interactionMode==='navigate'\)\|\|layer\.locked\)return;/);
 assert.match(canvas,/interactionMode==='navigate'\|\|\(selected!==''&&!active\)/);
 assert.match(css,/\.touch-editor-navigation-mode \.touch-editor-layer\{/);
 assert.match(css,/pointer-events:none!important/);
});
test('Navigation offers touch swipe, page arrows and explicit slide numbers',()=>{
 assert.match(canvas,/onScroll=\{syncPageFromScroll\}/);
 assert.match(canvas,/const goToPage=\(index:number,keepSelection=false\)=>/);
 assert.match(canvas,/viewport\.scrollTo\(/);
 assert.match(canvas,/aria-label="Slide siguiente"/);
 assert.match(canvas,/aria-label="Slide anterior"/);
 assert.match(canvas,/onClick=\{\(\)=>goToPage\(index\)\}/);
 assert.match(css,/touch-action:pan-x pan-y/);
});
test('Overlapping objects can be explicitly selected and only the active one moves',()=>{
 assert.match(canvas,/const selectFromList=\(id:string\)=>/);
 assert.match(canvas,/if\(selected!==layer\.id\)\{setSelected\(layer\.id\);return;\}/);
 assert.match(canvas,/onClick=\{\(\)=>selectFromList\(layer\.id\)\}/);
 assert.match(canvas,/zIndex:active\?8:z/);
 assert.match(canvas,/pointerEvents:layer\.locked\|\|pageCount>1/);
 assert.match(css,/\.touch-editor-quick-layers/);
});

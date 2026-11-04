import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(name)=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
const editor=read('PanoramaEditor.tsx');
const css=read('PanoramaEditor.css');
const factory=read('CarouselFactory.tsx');
const factoryCss=read('CarouselFactory.css');

test('Content Lab carousel uses the same six editing tools as Studio',()=>{
 for(const label of ['Fotos','Texto','Stickers','Elementos','Fondo','Capas'])
  assert.ok(editor.includes('<span>'+label+'</span>'),'missing '+label);
 assert.match(css,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
 assert.match(css,/\.panorama-editor>\.panorama-body\{order:2\}/);
 assert.match(css,/\.panorama-editor>\.panorama-primary-actions\{order:3\}/);
 assert.match(css,/\.panorama-editor>\.panorama-primary-actions\{position:fixed!important/);
 assert.match(factory,/factory-canvas-active/);
 assert.match(factoryCss,/\.factory-canvas-active \.factory-step-intro\{display:none\}/);
});

test('Content Lab floating sheets keep the artwork visible during insertion and changes',()=>{
 assert.match(editor,/const \[backgroundOpen,setBackgroundOpen\]=useState\(false\)/);
 assert.match(editor,/aria-label="Elegir fondo del carrusel"/);
 assert.match(editor,/onBackgroundColor\(color\)/);
 assert.match(editor,/setLibraryOpen\(false\);revealCanvas\(\)/);
 assert.match(css,/\.panorama-background-sheet/);
 assert.match(css,/\.panorama-quicktools\{position:fixed!important/);
 assert.match(factory,/onBackgroundColor=\{color=>/);
 assert.match(factory,/backgroundColor=\{slide.backgroundColor\|\|style.canvasColor\}/);
});

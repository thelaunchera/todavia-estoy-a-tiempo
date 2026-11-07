import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');

test('All main editors start with a single collapsed, bilingual help banner',()=>{
 const guide=read('QuickStartGuide.tsx'),app=read('App.tsx');
 assert.match(guide,/const \[open,setOpen\]=useState\(false\)/);
 assert.match(guide,/useEffect\(\(\)=>\{setOpen\(false\)\},\[scope,mode\]\)/);
 assert.match(guide,/mode==='editor'\?<div className="lab-first-guide-compact-help"/);
 assert.match(guide,/Toca · mueve · descarga/);
 assert.match(guide,/Tap · move · download/);
 assert.match(guide,/aria-expanded=\{open\}/);
 assert.match(app,/\['factory','vertical','create'\]\.includes\(tab\)/);
 assert.equal((app.match(/<QuickStartGuide[^>]*mode="editor"/g)||[]).length,1);
 assert.doesNotMatch(app,/<section className="lab-factory-help"/);
});

test('Reel and story editors open with the artboard first and keep save one tap away',()=>{
 const vertical=read('VerticalStudio.tsx'),css=read('VerticalStudio.css');
 assert.ok(vertical.indexOf('vertical-editor-details')<vertical.indexOf('vertical-options-fold'));
 assert.match(vertical,/const \[advanced,setAdvanced\]=useState\(true\)/);
 assert.match(vertical,/<button type="button" className="vertical-save" disabled=\{saving\} onClick=\{onSave\}>/);
 assert.match(vertical,/<details className="vertical-options-fold">/);
 assert.match(vertical,/<summary>\{locale==='es'\?'Texto, video y estilos'/);
 assert.match(css,/\.vertical-editor-details\{order:1/);
 assert.match(css,/\.vertical-options-fold\{order:2/);
 assert.match(css,/width:min\(100%,29dvh,260px\)/);
});

test('Carousel has compact labels and preserves necessary tools and downloads',()=>{
 const css=read('CarouselFactory.css'),factory=read('CarouselFactory.tsx');
 assert.match(css,/App-first editors: labels and tools stay visible/);
 assert.match(css,/\.factory-bc-workspace \.factory-step-intro>p/);
 assert.match(css,/\.factory-bc-workspace \.factory-step-intro h2/);
 assert.match(factory,/onClick=\{\(\)=>setStudioTab\(item\.id\)\}/);
 assert.match(factory,/onClick=\{\(\)=>void exportOne\(i\)\}/);
 assert.match(factory,/onDuplicateLayer=\{duplicatePanoramaLayer\}/);
});

test('Single-post and grid editors keep functional entry points instead of instructions',()=>{
 const app=read('App.tsx'),grid=read('BrandGrid.tsx'),css=read('FreePostStudio.css');
 assert.match(app,/Editar post/);
 assert.match(app,/lab-post-details/);
 assert.match(grid,/<h2>Nuevo grid · 9 posts<\/h2>/);
 assert.match(grid,/<details className="bg-editor-info">/);
 assert.match(grid,/Descargar PNG del post/);
 assert.match(css,/free-post-studio \.free-post-media-hint\{display:none\}/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const read=file=>readFileSync(new URL('../../'+file,import.meta.url),'utf8');
const lib=read('creative-shared/editor-font-library.ts');
function loadLibrary(document,window){
 const output=ts.transpileModule(lib,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 runInNewContext(output,{module,exports:module.exports,document,window,Map,Promise,encodeURIComponent});
 return module.exports;
}
test('Lab and Studio share exactly 50 real font choices across four distinct categories',()=>{
 const m=loadLibrary(undefined,undefined);
 assert.equal(m.EDITOR_FONTS.length,50);
 assert.equal(new Set(m.EDITOR_FONTS.map(f=>f.id)).size,50);
 assert.deepEqual(Object.fromEntries(['Sans','Display','Serif','Script'].map(type=>[
   type,m.EDITOR_FONTS.filter(f=>f.category===type).length])),{Sans:20,Display:10,Serif:12,Script:8});
 for(const id of ['prompt','futura','poster','playfair','cormorant','caveat','fraunces','dm-serif-display']){
   assert.ok(m.EDITOR_FONTS.some(f=>f.id===id));
 }
 assert.equal(m.editorFontFamily('serif'),'Georgia,serif');
 assert.equal(m.editorFontFamily('arial'),'Arial,sans-serif');
 assert.equal(m.editorFontId('dm serif display'),'dm-serif-display');
});
test('Only requested face is injected, with lazy cached loading before export',async()=>{
 const added=[];
 const document={
   createElement:()=>({rel:'',href:'',setAttribute(){},onload:null,onerror:null}),
   head:{appendChild(link){added.push(link);queueMicrotask(()=>link.onload?.())}},
   fonts:{load:async()=>['face']},
 };
 const window={setTimeout:()=>0};
 const m=loadLibrary(document,window);
 await m.ensureEditorFont('unbounded');
 await m.ensureEditorFont('unbounded');
 assert.equal(added.length,1,'should not inject all fifty families');
 assert.match(added[0].href,/fonts\.googleapis\.com\/css2\?family=Unbounded/);
 await m.ensureEditorFont('caveat');
 assert.equal(added.length,2);
 await m.ensureEditorFont('serif');
 assert.equal(added.length,2,'legacy Georgia must remain local');
});
test('Both editors expose searchable font previews from a bottom sheet and keep PNG paths font-aware',()=>{
 const lab=read('content-lab/src/TouchLayerCanvas.tsx');
 const studio=read('estudio-control/src/SeamlessEditor.tsx');
 const labPaint=read('content-lab/src/PanoramaLayers.ts');
 const labPreview=read('content-lab/src/CurvedTextPreview.tsx');
 const shelf1=read('content-lab/src/FontShelf.tsx');
 const shelf2=read('estudio-control/src/FontShelf.tsx');
 for(const source of [shelf1,shelf2]){
   assert.ok(source.includes('EDITOR_FONTS.filter'));
   assert.ok(source.includes('IntersectionObserver'));
   assert.ok(source.includes('ensureEditorFont(id)'));
   assert.ok(source.includes('role="list"'));
   assert.ok(source.includes('aria-pressed={editorFontId(value)===font.id}'));
 }
 assert.match(lab,/contextInspector==='fonts'/);
 assert.match(lab,/contextInspector==='effects'/);
 assert.match(lab,/contextInspector==='size'/);
 assert.match(lab,/contextInspector==='more'/);
 assert.ok(lab.includes('<FontShelf'));
 assert.ok(lab.includes('EDITOR_FONTS.filter(font=>font.category===group)'));
 assert.ok(labPaint.includes('await ensureEditorFont(layer.font'));
 assert.ok(labPreview.includes('ensureEditorFont(layer.font'));
 assert.ok(studio.includes('<FontShelf'));
 assert.ok(studio.includes('await ensureEditorFont(it.fontFamily'));
 assert.ok(studio.includes("const STUDIO_TEXT_FONTS:Record<string,string>="));
 assert.ok(studio.includes("activeInspector==='fonts'"));
 assert.ok(studio.includes("activeInspector==='more'"));
 assert.ok(studio.includes("activeInspector==='effects'"));
});
test('Font picker components keep low-memory iPhone scrolling and 44px buttons',()=>{
 for(const file of ['content-lab/src/TouchLayerCanvas.css','estudio-control/src/seamless-app.css']){
   const css=read(file);
   assert.match(css,/\.editor-font-shelf-list/);
   assert.match(css,/\.editor-font-shelf-choice/);
   assert.match(css,/\.editor-font-shelf-categories button/);
   assert.match(css,/min-height:44px/);
   assert.match(css,/overflow-y:auto/);
 }
});

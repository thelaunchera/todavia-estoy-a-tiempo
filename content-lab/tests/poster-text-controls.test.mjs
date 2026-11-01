import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const src=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');

test('Poster-black family and weight are shared by on-screen text and exported PNG',()=>{
 const code=src('PanoramaLayers.ts');
 const editor=src('TouchLayerCanvas.tsx');
 const css=src('index.css');
 assert.match(code,/poster:'"Archivo Black",Impact/);
 assert.match(code,/ctx\.font=panoramaTextWeight\(layer\.fontWeight\)/);
 assert.match(code,/document\.fonts\?\.load\(panoramaTextWeight\(layer\.fontWeight\)/);
 assert.match(editor,/fontFamily:panoramaFont\(layer\.font\)/);
 assert.match(editor,/fontWeight:panoramaTextWeight\(layer\.fontWeight\)/);
 assert.match(css,/family=Archivo\+Black/);
});
test('Poster style and custom text colors survive drafts and edit again',()=>{
 const cover=src('CoverDecor.ts'),post=src('FreePostStudio.tsx'),norm=src('PanoramaLayers.ts');
 assert.match(cover,/fontWeight\?:number/);
 assert.match(cover,/fontWeight:\[400,500,600,700,800,900\]/);
 assert.match(post,/fontWeight:decor\.headlineStyle\?\.fontWeight\|\|700/);
 assert.match(post,/addPosterTitle=\(\)=>/);
 assert.match(post,/name:'Texto póster',font:'poster',fontSize:116/);
 assert.match(post,/fontWeight:900,color:'#191919'/);
 assert.match(post,/onCommit=\{commit\} onUpdate=\{updateLayer\}/);
 assert.match(post,/if\(id==='main-title'\)update\(\{\.\.\.decor,headlineRect:/);
 assert.match(norm,/fontWeight:\[400,500,600,700,800,900\]/);
 assert.match(norm,/color:\/\^#\[0-9a-f\]\{6\}\$\/i/);
});
test('Text selection, bold weight, custom color and position presets are real controls',()=>{
 const editor=src('TouchLayerCanvas.tsx');
 assert.match(editor,/type="color" aria-label="Color de texto libre"/);
 assert.match(editor,/onUpdate\(chosen\.id,\{color:e\.target\.value\}\)/);
 assert.match(editor,/aria-label="Grosor del texto"/);
 assert.match(editor,/value=\{900\}>Extra bold/);
 assert.match(editor,/onClick=\{\(\)=>onUpdate\(chosen\.id,\{font:'poster',fontWeight:900/);
 assert.match(editor,/onClick=\{\(\)=>commit\(\{x:\(activePage\+\.5\)\/pageCount-selectedRect!\.w\/2,y:\.08\}\)\}/);
 assert.match(editor,/touch-editor-post-text-list/);
 assert.match(editor,/selectFromList\(layer\.id\)/);
});
test('Pure export typography helper validates weights and poster font choices',()=>{
 const code=src('PanoramaLayers.ts');
 const transpiled=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 runInNewContext(transpiled,{module,exports:module.exports,require:(path)=>{
  if(path==='./TouchGeometry')return {clampPanoramaRect:x=>x,layerCornerPixels:()=>0};
  if(path==='./PhotoCrop')return {coverPlacement:()=>({})};
  throw Error('Unexpected import '+path);
 }});
 assert.equal(module.exports.panoramaTextWeight(900),900);
 assert.equal(module.exports.panoramaTextWeight(400),400);
 assert.equal(module.exports.panoramaTextWeight('broken'),700);
 assert.match(module.exports.panoramaFont('poster'),/Archivo Black/);
});

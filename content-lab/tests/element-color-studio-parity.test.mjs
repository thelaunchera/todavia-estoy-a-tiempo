import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../src/'+path,import.meta.url),'utf8');

test('selected stickers offer visible Studio-style color, intensity and original controls',()=>{
  const canvas=read('TouchLayerCanvas.tsx');
  const css=read('TouchLayerCanvas.css');
  assert.match(canvas,/const colorTools=chosen&&onUpdate/);
  assert.match(canvas,/Cambiar color del elemento seleccionado/);
  assert.match(canvas,/Intensidad del color del elemento/);
  assert.match(canvas,/Color original/);
  assert.match(canvas,/touch-editor-color-desktop/);
  assert.match(canvas,/contextInspector==='color'&&colorTools/);
  assert.match(canvas,/setContextInspector\(v=>v==='color'\?null:'color'\)/);
  assert.match(css,/\.touch-editor-color-tools/);
  assert.match(css,/@media\(max-width:799px\)\{[\s\S]*?\.touch-editor-color-desktop\{display:none!important\}/);
});

test('tinted PNG and touch preview preserve alpha and allow partial intensity',()=>{
  const paint=read('PanoramaLayers.ts');
  const preview=read('TouchLayerCanvas.tsx');
  assert.match(paint,/tintColor\?:string; tintStrength\?:number/);
  assert.match(paint,/Number\.isFinite\(item\.tintStrength\)/);
  assert.match(paint,/item\.tintColor/);
  assert.match(paint,/ink\.globalCompositeOperation='source-atop'/);
  assert.match(paint,/ink\.globalAlpha=strength/);
  assert.match(paint,/ctx\.drawImage\(painted/);
  assert.match(preview,/maskImage:'url\("/);
  assert.match(preview,/opacity:layer\.tintColor\?\(layer\.tintStrength\?\?\.38\):1/);
  assert.match(preview,/layer\.kind==='sticker'&&layer\.tint/);
});

test('editing a legacy sticker or main photo retains saved source and allows color reset',()=>{
  const free=read('FreePostStudio.tsx');
  const decor=read('CoverDecor.ts');
  assert.match(free,/if\('tintColor' in patch\|\|'tintStrength' in patch\)/);
  assert.match(free,/const edited:PanoramaLayer=\{\.\.\.currentLayer,\.\.\.patch,tint:undefined\}/);
  assert.match(free,/stickerIds:decor\.stickerIds\.filter\(value=>value!==asset\)/);
  assert.match(free,/effect\.primaryPhotoTintColor=patch\.tintColor/);
  assert.match(free,/tintColor:undefined,tintStrength:undefined,tint:undefined/);
  assert.match(free,/selectedLayer\.kind==='photo'\|\|selectedLayer\.kind==='sticker'/);
  assert.match(decor,/primaryPhotoTintColor/);
  assert.match(decor,/primaryPhotoTintStrength/);
});

test('original Studio remains isolated, and Normal never becomes Seamless for color edits',()=>{
  const studio=read('CarouselFactory.tsx');
  const paint=read('PanoramaLayers.ts');
  assert.match(studio,/setArtStyle\(\{panoramaLayers:/);
  assert.match(studio,/promoteSource\(source,source\.rect\)/);
  assert.match(paint,/role\?:'background'/);
  assert.match(paint,/layer\.tint\?1:0/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');

test('backgrounds can be selected and resized on iPhone without a blocking pointer-events rule',()=>{
  const touch=read('TouchLayerCanvas.tsx');
  const css=read('TouchLayerCanvas.css');
  assert.doesNotMatch(css,/\.panorama-canvas \.touch-editor-layer\.is-background\s*\{\s*pointer-events:none/);
  assert.doesNotMatch(touch,/pointerEvents:layer\.locked\|\|layer\.role===['"]background['"]/);
  assert.match(touch,/data-resize-axis="x"/);
  assert.match(touch,/chosen\.role==='background'\?'Tamaño de fondo':'Tamaño de foto'/);
  assert.match(touch,/chosen\.locked\)return/);
});

test('photo background scaling is preserved in saved geometry and exported PNGs',()=>{
  const paint=read('PanoramaLayers.ts');
  const canvas=read('TouchLayerCanvas.tsx');
  const free=read('FreePostStudio.tsx');
  assert.match(paint,/backgroundFit\?:'cover'/);
  assert.match(paint,/item\.backgroundFit==='cover'/);
  assert.match(paint,/if\(layer\.backgroundFit==='cover'\)/);
  assert.match(paint,/coverPlacement\(img\.naturalWidth,img\.naturalHeight,w,h,r\.crop\)/);
  assert.match(canvas,/layer\.backgroundFit==='cover'\?'cover':'fill'/);
  assert.match(free,/const editImageBackground=\(assetId:string\)=>/);
  assert.match(free,/role:'background',backgroundFit:'cover'/);
  assert.match(free,/renderFreePost\(post,brand,images,false,scale\)/);
});

test('normal carousels remain normal while a background is converted to a movable layer',()=>{
  const factory=read('CarouselFactory.tsx');
  const panorama=read('PanoramaEditor.tsx');
  const fn=factory.split('  const extendCurrentBackground=()=>{')[1]?.split('  // The palette')[0];
  assert.ok(fn,'background converter is present');
  assert.doesNotMatch(fn,/seamlessEnabled:true/);
  assert.match(fn,/style\.seamlessEnabled\?\{\}:\{page:i\}/);
  assert.match(fn,/backgroundFit:'cover'/);
  assert.match(panorama,/Editar y agrandar fondo/);
});

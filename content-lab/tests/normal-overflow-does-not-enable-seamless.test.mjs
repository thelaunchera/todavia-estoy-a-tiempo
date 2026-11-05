import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(name)=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
const factory=read('CarouselFactory.tsx');
const layerRenderer=read('PanoramaLayers.ts');
const touchCanvas=read('TouchLayerCanvas.tsx');

test('Normal never turns into Seamless merely because a photo passes a slide edge',()=>{
  const move=factory.split('  const movePanoramaLayer=')[1]?.split('  const copyPanoramaSticker=')[0];
  assert.ok(move,'Panorama move handler exists');
  assert.doesNotMatch(move,/seamRequested|crossesSeam|seamlessEnabled\s*:/);
  assert.match(move,/promoteSource\(source,rect\)/);
  assert.match(move,/rect:clampPanoramaRect\(rect\),page:owner/);
  assert.match(factory,/onClick=\{\(\)=>chooseCarouselMode\(true\)\}/);
});

test('Normal keeps overflow geometry and clips to the original slide in PNGs',()=>{
  assert.doesNotMatch(factory,/constrainNormalLayer/);
  assert.match(factory,/overlayPanoramaPages\(all,ordered,images,ctx=>paintCarouselTypography\(ctx,slides,brand,style\),true\)/);
  assert.match(layerRenderer,/clipToPages>1/);
  assert.match(layerRenderer,/ctx\.rect\(owner\*width\/clipToPages,0,width\/clipToPages,height\)/);
  assert.match(layerRenderer,/clipToSlides\?pages\.length:0/);
});

test('Normal touch editor clips overflow without switching modes',()=>{
  assert.match(touchCanvas,/const normalClip=!continuous&&pageCount>1/);
  assert.match(touchCanvas,/clipPath:normalClip/);
  assert.match(layerRenderer,/page\?:number/);
  assert.match(layerRenderer,/Number\.isInteger\(item\.page\)/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');

test('iPad pointerup inserts a sticker without relying on a synthesized click',()=>{
  const editor=read('PanoramaEditor.tsx');
  assert.match(editor,/const addVisibleAsset=\(id:string\)=>/);
  assert.match(editor,/if\(!drag\.handled\|\|distance<32\)\{addVisibleAsset\(drag\.id\);return;\}/);
  assert.match(editor,/ignoreClick\.current=drag\.id/);
  assert.match(editor,/if\(ignoreClick\.current===asset\.id\)\{ignoreClick\.current='';return\}/);
  assert.match(editor,/addVisibleAsset\(asset\.id\)/);
});

test('the library places normal stickers on the selected slide, never offscreen',()=>{
  const editor=read('PanoramaEditor.tsx');
  assert.match(editor,/const x=seamless\?viewportCenter:\(\(pageIndex\?\?0\)\+\.5\)\/Math\.max\(1,count\)/);
  assert.match(editor,/onAdd\(id,\{x:Math\.min\(\.999,Math\.max\(\.001,x\)\),y:\.5\}\)/);
  assert.match(editor,/setLibraryOpen\(false\);revealCanvas\(\)/);
});

test('carousel sticker insert commits synchronously while photos keep their aspect ratio',()=>{
  const factory=read('CarouselFactory.tsx');
  assert.match(factory,/if\(assetCategory\(asset\)==='sticker'\)\{\s*addPanoramaAssets\(\[\{asset,point\}\]\);\s*return;/);
  assert.match(factory,/void photoAspectFromSource\(images\[id\]\)\.then\(ratio/);
  assert.match(factory,/designData:encodeCarouselDesign\(nextSlides,nextStyle\)/);
});

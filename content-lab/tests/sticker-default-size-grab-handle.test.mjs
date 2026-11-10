import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');

test('new carousel stickers arrive at a readable 40 percent slide size',()=>{
 const factory=read('CarouselFactory.tsx');
 assert.match(factory,/const w=\.4\/count,h=\.34/);
 assert.match(factory,/stickerPositions:\{\.\.\.part\.stickerPositions,\[id\]:\{x:\.55,y:\.1,w:\.4,h:\.34,angle:-7\}\}/);
 assert.match(factory,/const canAdd=!alreadyOnSlide/);
 assert.match(factory,/if\(canAdd\)\{/);
 assert.match(factory,/const r=clampRect\(part\.stickerPositions\?\.\[id\]\|\|stickerDefault\(index\)\)/);
 assert.match(factory,/kind==='photo'\?initialPanoramaPhotoRect/);
});

test('new stickers in single posts are larger without changing photo defaults',()=>{
 const free=read('FreePostStudio.tsx');
 assert.match(free,/const width=sticker\?\.4:\.46,height=sticker\?\.34:\.40/);
 assert.match(free,/rect:clampFreePhotoRect\(\{x:point\.x-width\/2,y:point\.y-height\/2,w:width,h:height\}\)/);
 const geometry=read('TouchGeometry.ts');
 assert.match(geometry,/export const stickerDefault=/);
});

test('blue dot is smaller visually but retains a full-size touch resize target',()=>{
 const css=read('TouchLayerCanvas.css');
 const touch=read('TouchLayerCanvas.tsx');
 assert.match(css,/Discreet visible resize dot/);
 assert.match(css,/width:38px;height:38px/);
 assert.match(css,/\.touch-editor \.touch-editor-layer \.touch-editor-resize::after/);
 assert.match(css,/width:12px;height:12px/);
 assert.match(css,/pointer-events:none/);
 assert.match(touch,/data-resize-handle aria-hidden="true"/);
 assert.match(touch,/closest\('\[data-resize-handle\]'\)/);
 assert.match(touch,/resizeSelected\(1\.16\)/);
});

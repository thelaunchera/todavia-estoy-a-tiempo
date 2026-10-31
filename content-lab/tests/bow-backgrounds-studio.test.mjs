import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('The 20 new coquette / satin-bow backgrounds are unique original artwork',()=>{
 const src=read('src/BowBackgrounds.ts');
 const definition=src.slice(src.indexOf('export const BOW_BACKGROUNDS=['),src.indexOf('] as const;'));
 const ids=[...definition.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
 assert.equal(ids.length,20);
 assert.equal(new Set(ids).size,20);
 assert.ok(ids.every(id=>id.startsWith('bow-')));
 for(const motif of ['satinBow','pearls','lace','cherries','foliage','hearts','cornerBows']){
  assert.ok(src.includes(motif),motif);
 }
 assert.ok(src.includes('paintBowBackground'));
});
test('Preview uses exactly the export painter; gallery has no text watermark',()=>{
 const painter=read('src/FreeDesignAssets.ts');
 const thumb=read('src/BackgroundThumbnail.tsx');
 const gallery=read('src/BackgroundLibrary.tsx');
 const palette=read('src/FreeDecorControls.tsx');
 assert.ok(painter.includes('paintBowBackground(ctx,w,h,id)'));
 assert.ok(thumb.includes('paintFreeBackground(ctx,240,300,id)'));
 assert.ok(gallery.includes('paintFreeBackground(ctx,1080,1350,id)'));
 assert.ok(gallery.includes('<BackgroundThumbnail'));
 assert.ok(!gallery.includes('Your next'));
 assert.ok(!gallery.includes('THE CONTENT LAB · STUDIO'));
 assert.ok(palette.includes('isBowBackground'));
});
test('Factory defaults to canvas-first tabs, with AI tools secluded',()=>{
 const studio=read('src/CarouselFactory.tsx');
 assert.ok(studio.includes("useState<'canvas'|'slides'|'style'|'ai'>('canvas')"));
 assert.ok(studio.includes("studioTab==='canvas'"));
 assert.ok(studio.includes("studioTab==='slides'"));
 assert.ok(studio.includes("studioTab==='style'"));
 assert.ok(studio.includes("studioTab==='ai'"));
 assert.ok(studio.includes('factory-assistant-zone'));
 assert.ok(studio.includes('factory-canvas-exports'));
 assert.ok(studio.includes('Guardar carrusel'));
});
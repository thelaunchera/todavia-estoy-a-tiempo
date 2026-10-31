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
 const seamless=read('src/SeamlessCarousel.ts');
 assert.ok(seamless.includes('isBowBackground(opts.backgroundId)'));
 assert.ok(seamless.includes('paintFreeBackground(ctx,W,H,opts.backgroundId'));

 assert.ok(thumb.includes('paintFreeBackground(ctx,240,300,id)'));
 assert.ok(gallery.includes('paintFreeBackground(ctx,1080,1350,id)'));
 assert.ok(gallery.includes('<BackgroundThumbnail'));
 assert.ok(!gallery.includes('Your next'));
 assert.ok(!gallery.includes('THE CONTENT LAB · STUDIO'));
 assert.ok(!palette.includes('isBowBackground'));
 assert.ok(!gallery.includes('isBowBackground'));
 assert.ok(!painter.includes('...BOW_BACKGROUNDS'));
 assert.ok(palette.includes('BACKGROUND_CATEGORIES.map'));
 assert.ok(gallery.includes('background-category-heading'));
});
test('Factory uses Cata design hacking sequence with IA as a short standalone section',()=>{
 const studio=read('src/CarouselFactory.tsx');
 assert.ok(studio.includes("useState<'inspiration'|'canvas'|'style'|'slides'|'review'|'ai'>('inspiration')"));
 assert.ok(studio.includes('PASO 1 DE 5 · INSPIRACIÓN'));
 assert.ok(studio.includes('PASO 2 DE 5 · FOTO PROTAGONISTA'));
 assert.ok(studio.includes('PASO 3 DE 5 · FONDO'));
 assert.ok(studio.includes('PASO 4 DE 5 · TEXTOS'));
 assert.ok(studio.includes('PASO 5 DE 5 · DETALLES'));
 assert.ok(!studio.includes('IA opcional'));
 assert.ok(studio.includes("}>IA</button>"));
 assert.ok(studio.includes("studioTab==='canvas'"));
 assert.ok(studio.includes("studioTab==='slides'"));
 assert.ok(studio.includes("studioTab==='style'"));
 assert.ok(studio.includes("studioTab==='ai'"));
 assert.ok(studio.includes('factory-assistant-zone'));
 assert.ok(studio.includes('factory-canvas-exports'));
 assert.ok(studio.includes('Guardar carrusel'));
});
test('Public wallpapers have clear exclusive categories and retired bows remain only for older saves',()=>{
 const categories=read('src/BackgroundCategories.ts');
 const gallery=read('src/BackgroundLibrary.tsx');
 const palette=read('src/FreeDecorControls.tsx');
 const assets=read('src/FreeDesignAssets.ts');
 for(const category of ['minimal','gradients','paper','editorial','retro','dark','scrapbook']) {
  assert.ok(categories.includes("id:'"+category+"'"),category);
 }
 assert.ok(categories.includes("category==='all'?lookup.has(id)"));
 assert.ok(gallery.includes("setFilter]=useState<GalleryFilter>('all')"));
 assert.ok(!gallery.includes("Coquette & bows"));
 assert.ok(!palette.includes("Aesthetic · 20"));
 assert.ok(!assets.includes("...BOW_BACKGROUNDS"));
 assert.ok(assets.includes("if(isBowBackground(id)){paintBowBackground(ctx,w,h,id);return}"));
 assert.ok(gallery.includes('Mis fondos guardados'));
 assert.ok(gallery.includes("label:'Mis fondos'"));
 assert.ok(gallery.includes('ownVisible.map'));
 assert.ok(gallery.includes('backgrounds.filter(item=>belongsToBackgroundCategory'));
});

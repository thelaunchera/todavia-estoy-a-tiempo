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
test('Factory uses the five mobile-first creation steps and keeps ideas with IA optional',()=>{
 const studio=read('src/CarouselFactory.tsx');
 assert.ok(studio.includes("useState<'inspiration'|'canvas'|'style'|'slides'|'review'|'download'|'ai'>('canvas')"));
 assert.ok(studio.includes('CREA A TU MANERA'));
 assert.ok(studio.includes('Crear carrusel con IA · 1 crédito'));
 assert.ok(studio.includes('PASO 1 DE 5 · FONDOS Y STICKERS'));
 assert.ok(studio.includes('PASO 2 DE 5 · FOTOS Y DISEÑOS'));
 assert.ok(studio.includes('PASO 3 DE 5 · TIPOGRAFÍA'));
 assert.ok(studio.includes('PASO 4 DE 5 · VISTA PREVIA'));
 assert.ok(studio.includes('PASO 5 DE 5 · DESCARGAR'));
 assert.ok(!studio.includes('IA opcional'));
 assert.ok(studio.includes('aria-label="Ideas con IA"'));
 assert.ok(studio.includes('factory-step-short'));
 assert.ok(studio.indexOf("{id:'style',name:'Fondos y stickers',short:'Fondos'}")<studio.indexOf("{id:'canvas',name:'Fotos y diseño',short:'Diseño'}"));
 assert.ok(studio.indexOf("{id:'canvas',name:'Fotos y diseño',short:'Diseño'}")<studio.indexOf("{id:'slides',name:'Tipografía',short:'Texto'}"));
 assert.ok(studio.includes("studioTab==='canvas'"));
 assert.ok(studio.includes("studioTab==='slides'"));
 assert.ok(studio.includes("studioTab==='style'"));
 assert.ok(studio.includes("studioTab==='ai'"));
 assert.ok(studio.includes('factory-assistant-zone'));
 assert.ok(studio.includes('factory-canvas-exports'));
 assert.ok(studio.includes("studioTab==='download'"));
 assert.ok(studio.includes('onClick={insert} disabled={slides.length>=MAX_CAROUSEL_SLIDES}'));
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
 assert.ok(gallery.includes("'Mis fondos privados'"));
 assert.ok(gallery.includes("label:'Mis fondos'"));
 assert.ok(gallery.includes('ownVisible.map'));
 assert.ok(gallery.includes('backgrounds.filter(item=>belongsToBackgroundCategory'));
});


test('B+C Carousel Factory makes the first viewport a compact touch workspace',()=>{
 const studio=read('src/CarouselFactory.tsx');
 const css=read('src/CarouselFactory.css');
 const panorama=read('src/PanoramaEditor.tsx');
 const panoCss=read('src/PanoramaEditor.css');
 const app=read('src/App.tsx');
 for(const step of ["short:'Fondos'","short:'Diseño'","short:'Texto'","short:'Vista'","short:'PNG'"])
   assert.ok(studio.includes(step),step);
 assert.ok(studio.includes('factory-edit-rail'));
 assert.ok(studio.includes('factory-preview-text'));
 assert.ok(studio.includes('saveState'));
 assert.ok(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'));
 assert.ok(css.includes('.factory-bc-workspace .factory-mobile-preview-trigger'));
 assert.ok(panorama.includes('panorama-expand-short'));
 assert.ok(panoCss.includes('B+C Carousel Factory artboard'));
 assert.ok(app.includes('className="lab-factory-help"'));
 assert.ok(app.includes('saveState={draftStatus}'));
});

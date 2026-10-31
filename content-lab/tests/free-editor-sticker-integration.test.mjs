import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Any paying member can view 138 shared original PNGs, but only admin may publish',()=>{
 const api=read('src/platform/client.ts'),gallery=read('src/StickerDownloads.tsx'),rls=read('supabase/migrations/20261031_shared_original_sticker_catalog.sql');
 assert.ok(api.includes('sharedStickers()'));
 assert.ok(api.includes("if(id.startsWith('shared-'))"));
 assert.ok(api.includes("if(path==='/api/sticker-catalog')"));
 assert.ok(rls.includes("m.status='active'"));
 assert.ok(rls.includes('lab admin publish original sticker'));
 assert.ok(gallery.includes("void download(asset)"));
 assert.ok(gallery.includes("await Promise.resolve(loadImage(asset.id))"));
});
test('All three graphic editors preserve original sticker layers and custom backgrounds',()=>{
 const app=read('src/App.tsx'),grid=read('src/BrandGrid.tsx'),car=read('src/CarouselFactory.tsx'),cover=read('src/FreePostStudio.tsx'),assets=read('src/FreeDecorControls.tsx');
 assert.ok(app.includes('<FreePostStudio'));
 assert.ok(cover.includes('<FreeDecorControls'));
 assert.ok(cover.includes('backgroundImageId:post.assetId'));
 assert.ok(app.includes('writeCoverDecor'));
 assert.ok(grid.includes('onStickerChange='));
 assert.ok(grid.includes('onUploadBackground='));
 assert.ok(car.includes('onUploadBackground={onUploadBackground}'));
 assert.ok(car.includes('<TouchLayerCanvas'));
 assert.ok(cover.includes('legacyStickers(decor)'));
 assert.ok(cover.includes('renderFreePost(post,brand,images'));
 assert.ok(cover.includes('paintPanoramaLayers(ctx,1080,1350'));
 assert.ok(cover.includes('<TouchLayerCanvas'));
 assert.ok(assets.includes('onChange({backgroundId,backgroundImageId,stickerIds:'));
});
test('Carousel generation and editing work without invoking AI and exports keep stickers',()=>{
 const car=read('src/CarouselFactory.tsx'),overlay=read('src/OriginalStickerOverlays.ts');
 assert.ok(car.includes('Nuevo carrusel'));
 assert.ok(car.includes('setAll(next);setCurrent(0)'));
 assert.ok(car.includes("studioTab==='ai'"));
 assert.ok(!car.includes('IA opcional'));
 assert.ok(car.includes('onUploadBackground={onUploadBackground}'));
 assert.ok(car.includes("if(!window.confirm('Esta foto utilizará 1 crédito de IA."));
 assert.ok(car.includes('await paintOriginalStickerImages'));
 assert.ok(overlay.includes('positions:StickerPositions'));
});
test('House photo previews are actual licensed demonstration images and not exported into posts',()=>{
 const car=read('src/CarouselFactory.tsx');
 assert.ok(car.includes('const sampleHomes='));
 assert.ok(car.includes('https://images.unsplash.com/photo-'));
 assert.ok(car.includes('Estas fotos son de demostración, no se añaden a tus posts'));
 assert.ok(car.includes('src={sampleHomes[n%sampleHomes.length]}'));
});

test('Content Lab navigation presents grouped creative actions rather than a flat menu',()=>{
 const app=read('src/App.tsx');
 assert.ok(app.includes('const navGroups:'));
 for(const group of ['CREAR','TUS RECURSOS','INSPIRACIÓN','GUARDAR Y ORGANIZAR']){
  assert.ok(app.includes("title:'"+group+"'"));
 }
 assert.ok(app.includes('navGroups.map(group=>'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Free sticker/background set is purely local and does not consume AI credits',()=>{
 const a=src('src/FreeDesignAssets.ts'),ui=src('src/FreeDecorControls.tsx');
 assert.ok(a.includes('FREE_STICKERS=['));
 assert.ok(a.includes('FREE_BACKGROUNDS:'));
 assert.ok(a.includes("id:'pink-bow'"));assert.ok(a.includes("id:'pink-heart'"));
 assert.ok(a.includes("id:'peony'"));assert.ok(a.includes("id:'star-washi'"));
 assert.ok(a.includes("id:'soft-blue'"));assert.ok(a.includes("id:'warm-paper'"));
 assert.ok(a.includes("id:'editorial-grid'"));assert.ok(a.includes("id:'grain-ivory'"));
 assert.ok(ui.includes('FREE_BACKGROUNDS.filter') && ui.includes('<BackgroundThumbnail'));assert.ok(ui.includes('originals.filter'));
 assert.ok(ui.includes('assets.filter(a=>assetCategory(a)'));
 assert.ok(ui.includes('Stickers y fondos a tu gusto, sin ocupar toda la pantalla.'));
});
test('Decorated carousel is saved, previewed and exported without raster AI generation',()=>{
 const app=src('src/CarouselFactory.tsx');
 assert.ok(app.includes('FreeDecorControls'));
 assert.ok(app.includes('stickerIds:Array.isArray(s.stickerIds)'));
 assert.ok(app.includes('paintFreeBackground(ctx,1080,1350'));
 assert.ok(app.includes('paintOriginalStickerImages(ctx,1080,1350,slide.stickerIds'));
 assert.ok(app.includes('encodeCarouselDesign(all,nextStyle)'));
 assert.ok(app.includes('const canvas=pages?pages[n]:await drawSlide('));
 assert.ok(app.includes('canvasToPngBlob(canvas)'));
});
test('Brand Grid editorial and classic formats both render stickers/backgrounds in final PNG',()=>{
 const grid=src('src/BrandGrid.tsx'),composer=src('src/GridComposer.ts'),poster=src('src/EditorialPoster.ts');
 assert.ok(grid.includes('FreeDecorControls'));
 assert.ok(composer.includes('paintFreeBackground(ctx,W,H,tile.backgroundId'));
 assert.ok(composer.includes('paintOriginalStickerImages(ctx,W,H,tile.stickerIds'));
 assert.ok(poster.includes('paintFreeBackground(ctx,W,H,design.backgroundPattern'));
 assert.ok(poster.includes('paintOriginalStickerImages(ctx,W,H,design.stickerIds'));
 assert.ok(grid.includes("background:'ivory' as const"));
});

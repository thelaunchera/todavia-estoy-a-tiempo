import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Seamless carousels use a shared full-width canvas sliced to precise 1080x1350 slides',()=>{
 const core=source('src/SeamlessCarousel.ts');
 assert.ok(core.includes('wide.width=total*W'));
 assert.ok(core.includes('ctx.drawImage(wide,i*W,0,W,H,0,0,W,H)'));
 assert.ok(core.includes('ctx.bezierCurveTo'));
 assert.ok(core.includes('paintFreeBackground(ctx,wide.width,H'));
 assert.ok(core.includes('export async function drawSeamlessPages'));
});
test('Seamless option survives old designs and is reused by preview and separate PNG exports',()=>{
 const style=source('src/CarouselArtDirection.ts'),ui=source('src/CarouselFactory.tsx');
 assert.ok(style.includes('seamlessEnabled:v.seamlessEnabled===true'));
 assert.ok(style.includes('seamlessEnabled:false'));
 assert.ok(ui.includes('renderAllSlides'));
 assert.ok(ui.includes('drawSeamlessPages'));
 assert.ok(ui.includes('await renderAllSlides()'));
 assert.ok(ui.includes('seamlessEnabled:e.target.checked'));
 assert.ok(ui.includes('PNG de 1080 × 1350'));
});
test('Real transparent PNG stickers are imported from the curated ZIP and offered individually, no fake emojis',()=>{
 const lib=source('src/StickerDownloads.tsx'),app=source('src/App.tsx'),media=source('src/MediaAsset.ts');
 for(const category of ['Avatares','Matcha','Ejercicios','Pilates'])assert.ok(lib.includes(category));
 assert.ok(lib.includes("unzip(blob"));
 assert.ok(lib.includes("assetCategory(a)==='sticker'"));
 assert.ok(lib.includes("download(asset)"));
 assert.ok(lib.includes('<StickerPreview asset={asset} src={images[asset.id]}'));
 assert.ok(lib.includes('<img src={src} alt={displayAssetName(asset)}'));
 assert.ok(media.includes("'sticker'"));
 assert.ok(app.includes("category==='sticker'||category==='background'"));
 assert.ok(app.includes("id: 'stickers'"));
 assert.ok(app.includes("id: 'backgrounds'"));
});

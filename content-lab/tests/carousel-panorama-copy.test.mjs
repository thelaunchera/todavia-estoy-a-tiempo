import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=p=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8');

test('Panorama sticker copied with same local x/y, size, rotation and source preserved',()=>{
 const app=source('CarouselFactory.tsx');
 assert.ok(app.includes('const copyPanoramaSticker=(id:string,targetIndex:number)'));
 assert.ok(app.includes('const source=pageLayers.find(layer=>layer.id===id&&layer.kind'));
 assert.ok(app.includes('copyStickerToSlide(slides,source.page,targetIndex,source.assetId)'));
 assert.ok(app.includes('x:global.rect.x+(targetIndex-sourceIndex)/count'));
 assert.ok(app.includes('...global,id:\'panorama-\'+crypto.randomUUID(),rect'));
 assert.ok(app.includes('if(alreadyOnTarget)return \'exists\''));
 assert.ok(app.includes("if((style.panoramaLayers||[]).length>=24)return 'full'"));
 assert.ok(app.includes('onCopySticker={copyPanoramaSticker}'));
});
test('The panorama editor exposes a selected-sticker copy action below the canvas',()=>{
 const panorama=source('PanoramaEditor.tsx');
 const touch=source('TouchLayerCanvas.tsx');
 const css=source('TouchLayerCanvas.css');
 assert.ok(panorama.includes('onCopySticker={onCopySticker}'));
 assert.ok(touch.includes("chosen.kind==='sticker'&&onCopySticker"));
 assert.ok(touch.includes('onCopySticker(chosen.id,n)'));
 assert.ok(touch.includes('Copiar este sticker a otro slide'));
 assert.ok(touch.includes("setCopyFeedback(status==='copied'"));
 assert.ok(css.includes('.touch-editor-copy-sticker'));
 assert.ok(touch.indexOf('touch-editor-copy-sticker')>touch.indexOf('touch-editor-scroll'));
});

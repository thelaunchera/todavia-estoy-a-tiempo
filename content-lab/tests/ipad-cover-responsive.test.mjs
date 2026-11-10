import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('iPad cover composer uses full width and photo/stickers side-by-side instead of a 440px left strip',()=>{
 const css=read('src/CreativeCover.css');
 assert.ok(css.includes('.app-shell .composer{grid-template-columns:minmax(0,1fr)!important'));
 assert.ok(css.includes('.app-shell .composer>.visual{order:-1;width:100%;max-width:none'));
 assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(0,1fr)'));
 assert.ok(css.includes('@media(max-width:600px)'));
 assert.ok(css.includes('.app-shell .composer>.visual{width:100%;max-width:none'));
});
test('Single-post composer uploads original photos and sets arbitrary images as background',()=>{
 const app=read('src/App.tsx'),studio=read('src/FreePostStudio.tsx');
 assert.ok(app.includes('<FreePostStudio'));
 assert.ok(app.includes("upload(file,'original',false)"));
 assert.ok(studio.includes('Subir fondo'));
 assert.ok(studio.includes('Mi foto como fondo'));
 assert.ok(studio.includes('Añadir fotos'));
 assert.ok(studio.includes('onUpload(files, point)')||studio.includes('uploadPhotos(files,point)'));
 assert.ok(studio.includes('coverLayers(post,brand,decor)'));
 assert.ok(studio.includes('paintPanoramaLayers(ctx,width,height'));
 assert.ok(studio.includes('canvasHeight={freePostDimensions(post.format).height}'));
 assert.ok(!app.includes('cover-layout-chooser'));
 assert.ok(!app.includes('template-grid'));
});
test('Free post studio keeps the draggable layer editor, stickers and backgrounds accessible',()=>{
 const app=read('src/App.tsx'),studio=read('src/FreePostStudio.tsx'),controls=read('src/FreeDecorControls.tsx');
 assert.ok(studio.includes('<TouchLayerCanvas'));
 assert.ok(studio.includes('<FreeDecorControls'));
 assert.ok(studio.includes('onReorder={reorder}'));
 assert.ok(studio.includes('onCommit={commit}'));
 assert.ok(studio.includes('onDropFiles='));
 assert.ok(!controls.includes('<span>FREE</span>'));
 assert.ok(app.includes('writeCoverDecor'));
});

test('Touch-first post and seamless editors use compact tools while retaining optional controls',()=>{
 const post=read('src/FreePostStudio.tsx'),postCss=read('src/FreePostStudio.css');
 const panorama=read('src/PanoramaEditor.tsx'),panoramaCss=read('src/PanoramaEditor.css');
 const app=read('src/App.tsx');
 assert.ok(post.includes('free-post-utility-bar'));
 assert.ok(post.includes('free-post-layers'));
 assert.ok(post.includes('saveState'));
 assert.ok(post.includes('editImageBackground(post.assetId)'));
 assert.ok(post.includes('Seleccionar fondo editable'));
 assert.ok(postCss.includes('grid-template-columns:repeat(5,minmax(0,1fr))'));
 assert.ok(postCss.includes('max-height:min(35dvh,340px)'));
 assert.ok(panorama.includes('panorama-primary-actions'));
 assert.ok(panorama.includes("openTool('sticker')"));
 assert.ok(panorama.includes('panorama-mobile-layer-panel'));
 assert.ok(panoramaCss.includes('grid-template-columns:repeat(6,minmax(0,1fr))'));
 assert.ok(app.includes('saveState={draftStatus}'));
 assert.ok(app.includes('writeDraftBackup(account.email,editor)'));
});

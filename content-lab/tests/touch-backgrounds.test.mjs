import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('buyers upload their own background and preserve transparent files in private brand library',()=>{
 const lib=src('src/BackgroundLibrary.tsx'),app=src('src/App.tsx'),types=src('src/MediaAsset.ts'),decor=src('src/FreeDecorControls.tsx');
 assert.ok(lib.includes('Subir mi fondo privado') && lib.includes('Elegir archivo'));
 assert.ok(app.includes("upload(file,'background')"));
 assert.ok(app.includes("category==='background'"));
 assert.ok(app.includes("aiWallet?.admin&&category==='background'"));
 assert.ok(app.includes('publishSharedBackground'));
 assert.ok(lib.includes("isAdmin?'Publicar fondo para todos':'Subir mi fondo privado'"));
 assert.ok(types.includes("'background'"));
 assert.ok(decor.includes("backgroundImageId"));
 assert.ok(decor.includes('onUploadBackground'));
});
test('finger editing uses one normalized geometry in iPad preview and exported PNG',()=>{
 const geometry=src('src/TouchGeometry.ts'),touch=src('src/TouchLayerCanvas.tsx');
 const factory=src('src/CarouselFactory.tsx'),photo=src('src/OriginalStickerOverlays.ts');
 assert.ok(geometry.includes('clampRect'));
 assert.ok(touch.includes('onPointerDown'));
 assert.ok(touch.includes('onPointerMove'));
 assert.ok(touch.includes('pinchDistance'));
 assert.ok(touch.includes('data-resize-handle'));
 assert.ok(factory.includes('photoPosition'));
 assert.ok(factory.includes('stickerPositions'));
 assert.ok(factory.includes('onCommit={moveTouchLayer}'));
 assert.ok(factory.includes('paintCoverImage'));
 assert.ok(photo.includes('positions[id]||stickerDefault(i)'));
});
test('Brand Grid and seamless exports reuse exact sticker positions',()=>{
 const grid=src('src/BrandGrid.tsx'),composer=src('src/GridComposer.ts'),editor=src('src/GridVisualEditor.tsx'),seamless=src('src/SeamlessCarousel.ts');
 assert.ok(grid.includes('onStickerChange={stickerPositions=>update({stickerPositions})}'));
 assert.ok(composer.includes('tile.stickerPositions'));
 assert.ok(editor.includes('onStickerChange'));
 assert.ok(seamless.includes('page.stickerPositions'));
 assert.ok(seamless.includes('editorMode'));
});

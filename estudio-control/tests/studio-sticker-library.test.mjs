import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL(p,import.meta.url),'utf8');

test('Sticker library has its own Studio navigation and back-stack destination',()=>{
 const studio=read('../src/Studio.tsx');
 assert.match(studio,/\| 'stickers'/);
 assert.match(studio,/\{ id: 'stickers', label: 'Mi biblioteca de stickers'/);
 assert.match(studio,/pages:\['seamless','stickers','ideas','links'\]/);
 assert.match(studio,/stickers: 'Mi biblioteca de stickers'/);
 assert.match(studio,/page === 'stickers' && <StudioStickerLibrary/);
 assert.match(studio,/onOpenCarousel=\{\(\)=>change\('seamless'\)\}/);
 assert.match(studio,/onClick=\{\(\)=>change\('stickers'\)\}>Ver mis stickers/);
 assert.match(studio,/const studioUrl=\(p:Page\)/);
});

test('Manager and carousel share the actual on-device v1 / v2 storage, not a second inventory',()=>{
 const manager=read('../src/StudioStickerLibrary.tsx');
 const store=read('../src/studio-sticker-store.ts');
 const carousel=read('../src/SeamlessEditor.tsx');
 for(const key of [
  'studio-imported-stickers-v1','studio-imported-stickers-v2',
  'studio-sticker-blob-v2:','studio-asset-category-overrides-v1','studio-lab-approved-shares-v1'
 ]){
  assert.ok(store.includes(key),key);
 }
 assert.match(carousel,/studio-imported-stickers-v1/);
 assert.match(carousel,/studio-imported-stickers-v2/);
 assert.match(carousel,/studio-sticker-blob-v2:/);
 assert.match(manager,/loadLocalStudioStickers\(\)/);
 assert.match(manager,/importLocalStudioStickers\(/);
 assert.match(store,/streamStickerZip\(/);
 assert.match(store,/SHA-256/);
 assert.match(store,/writeEditorRecord\(studioStickerBlobKey\(id\),image\)/);
 assert.match(store,/writeEditorRecord\(STUDIO_STICKER_V2,\[\.\.\.index,asset\]\)/);
});

test('Standalone gallery provides search, filters, private characters, backgrounds, safe sharing and lazy preview',()=>{
 const manager=read('../src/StudioStickerLibrary.tsx');
 assert.match(manager,/isPersonalCharacterAssetName/);
 assert.match(manager,/loadStudioPrivateCharacterAssets/);
 assert.match(manager,/loadStudioLabAssets/);
 assert.match(manager,/useStudioLibrarySync\(local,setShared,setSyncError,approved,overrides\)/);
 assert.match(manager,/id\.startsWith\('studio-import-'\)/);
 assert.match(manager,/isSafeGenericStudioSticker\(item\.name\)/);
 assert.match(manager,/item\.kind==='background'\?'sticker':'background'/);
 assert.match(manager,/writeEditorRecord\(STUDIO_CATEGORY_OVERRIDES,next\)/);
 assert.match(manager,/writeEditorRecord\(STUDIO_APPROVED_SHARES,next\)/);
 assert.match(manager,/Personajes privados/);
 assert.match(manager,/onDevice\(a\)&&a\.kind==='sticker'&&!isPersonal\(a\.name\)/);
 assert.match(manager,/a\.kind==='sticker'/);
 assert.match(manager,/loading="lazy"/);
 assert.match(manager,/setVisibleLimit\(n=>n\+48\)/);
 assert.match(manager,/reader|zip|ZIP/i);
 assert.doesNotMatch(manager,/storage\.from\(.+\)\.remove\(/);
 assert.doesNotMatch(manager,/\\.delete\(/);
});

test('The new library does not move character ownership or auto-publish ZIPs',()=>{
 const manager=read('../src/StudioStickerLibrary.tsx');
 const store=read('../src/studio-sticker-store.ts');
 assert.match(manager,/Estos personajes son exclusivamente tuyos/);
 assert.match(manager,/!isPersonal\(item\.name\)/);
 assert.match(manager,/STUDIO_APPROVED_SHARES/);
 assert.match(manager,/Compartir en Lab/);
 assert.doesNotMatch(store,/publishStudioLabAsset/);
 assert.doesNotMatch(store,/content_lab_sticker_catalog/);
 assert.doesNotMatch(store,/content_lab_background_catalog/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8');

test('Sticker selection never silently evicts an existing sticker',()=>{
 const picker=read('FreeDecorControls.tsx');
 const start=picker.indexOf('const toggle=(id:string)=>');
 const end=picker.indexOf('const upload=async',start);
 const toggle=picker.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.match(toggle,/if\(selected\.length>=3\)/);
 assert.match(toggle,/setFeedback\('Ya hay 3 stickers/);
 assert.match(toggle,/onChange\(\{stickerIds:\[\.\.\.selected,id\]\}\)/);
 assert.doesNotMatch(toggle,/slice\(-3\)/);
 assert.ok(picker.includes('onClick={()=>removeSticker(id)}'));
 assert.ok(picker.includes('onClick={()=>onChange({stickerIds:[]})}'));
});

test('Background selection preserves stickers and tells the user what is currently active',()=>{
 const picker=read('FreeDecorControls.tsx'),factory=read('CarouselFactory.tsx');
 assert.match(picker,/onChange\(\{backgroundId:id,backgroundImageId:imageId\}\)/);
 assert.ok(picker.includes('Fondo:'));
 assert.ok(picker.includes('Todo el carrusel'));
 assert.ok(picker.includes('Stickers:'));
 assert.ok(picker.includes("selected=stickerIds.slice(0,3)"));
 assert.ok(factory.includes('slideNumber={i+1} slideCount={slides.length}'));
 assert.ok(factory.includes('onCopySticker={copySticker} onChange={updateDecoration}'));
});

test('Both galleries support accessible search, no-match guidance and lazy original background previews',()=>{
 const picker=read('FreeDecorControls.tsx'),css=read('FreeDecorControls.css');
 assert.match(picker,/type="search" aria-label=\{tab==='backgrounds'\?'Buscar fondos':'Buscar stickers'\}/);
 assert.ok(picker.includes('matches(displayAssetName(a))'));
 assert.ok(picker.includes('const builtInMatches='));
 assert.ok(picker.includes('const studioMatches='));
 assert.ok(picker.includes('const ownMatches='));
 assert.ok(picker.includes('No encontramos ese fondo.'));
 assert.ok(picker.includes('No hay stickers con ese filtro.'));
 assert.ok(picker.includes('function LibraryBackgroundThumbnail'));
 assert.ok(picker.includes("observer.disconnect();loadImage(asset.id)"));
 assert.ok(css.includes('.free-decor-library-background img'));
 assert.ok(css.includes('.free-decor-selected-stickers'));
});

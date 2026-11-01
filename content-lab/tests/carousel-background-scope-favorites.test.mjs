import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8');

test('Background picker offers slide-only and whole-carousel application without losing stickers',()=>{
 const src=read('CarouselFactory.tsx');
 assert.match(src,/useState<'slide'\|'all'>\('slide'\)/);
 assert.ok(src.includes('Solo slide {i+1}'));
 assert.ok(src.includes('Todo el carrusel'));
 assert.ok(src.includes("if(backgroundScope==='slide')"));
 assert.ok(src.includes('index===i?{...part,backgroundId,backgroundImageId,'));
 assert.ok(src.includes('perSlideBackgrounds:true'));
 assert.ok(src.includes('perSlideBackgrounds:false'));
 assert.ok(src.includes("if(!hasBg){replace(next);return;}"));
 assert.ok(src.includes('backgroundScope={backgroundScope} preferenceScope={brand.id}'));
});

test('Seamless final PNG and live canvas use the exact same individual backgrounds',()=>{
 const src=read('CarouselFactory.tsx'),seamless=read('SeamlessCarousel.ts'),style=read('CarouselArtDirection.ts');
 assert.equal((src.match(/usePageBackgrounds:style\.perSlideBackgrounds/g)||[]).length,3);
 assert.ok(style.includes('perSlideBackgrounds:v.perSlideBackgrounds===true'));
 assert.ok(style.includes('perSlideBackgrounds:boolean'));
 assert.ok(seamless.includes('if(opts.usePageBackgrounds||sharedImageIsBackground){'));
 assert.ok(seamless.includes('ctx.translate(i*W,0)'));
 assert.ok(seamless.includes('page.backgroundImageId&&images[page.backgroundImageId]'));
 assert.ok(seamless.includes("page.backgroundId&&page.backgroundId!=='brand'"));
 assert.ok(seamless.includes('page.backgroundGradient||opts.canvasGradient'));
});

test('Favorites and recents remain independent of the active background and stickers',()=>{
 const prefs=read('DecorPreferences.ts'),picker=read('FreeDecorControls.tsx');
 assert.ok(prefs.includes("content-lab:decor-prefs:v1:"));
 assert.ok(prefs.includes('localStorage.setItem('));
 assert.ok(prefs.includes('slice(0,24)'));
 assert.ok(prefs.includes('favorites:'));
 assert.ok(picker.includes('favoriteButton(decorKey.sticker(a.id)'));
 assert.ok(picker.includes('favoriteButton(decorKey.imageBackground(a.id)'));
 assert.ok(picker.includes('favoriteButton(decorKey.freeBackground(b.id)'));
 assert.ok(picker.includes('★ Favoritos'));
 assert.ok(picker.includes('Recientes'));
 assert.ok(picker.includes('addRecent(decorKey.sticker(id))'));
 assert.ok(picker.includes('backgroundScope'));
 assert.ok(picker.includes("setResourceFilter('favorites')"));
 assert.ok(picker.includes("setResourceFilter('recent')"));
});

test('Favorites may be toggled without actually adding an asset to a slide',()=>{
 const picker=read('FreeDecorControls.tsx');
 const button=picker.slice(picker.indexOf('const favoriteButton='),picker.indexOf('const upload=async'));
 assert.ok(button.includes('onClick={()=>favorite(key)}'));
 assert.doesNotMatch(button,/onChange\(/);
 assert.ok(picker.includes("onChange({stickerIds:[...selected,id]})"));
});


test('Saved bow and lace image backgrounds stay vivid and uncropped on seamless slides',()=>{
 const seamless=read('SeamlessCarousel.ts');
 // Each page uses the same full-bleed 1080x1350 portrait painter as the
 // single-slide export instead of the 4-slide 27% opacity panorama overlay.
 assert.ok(seamless.includes('const sharedImageIsBackground=Boolean(opts.assetId&&pages.every('));
 assert.ok(seamless.includes('page=>page.backgroundImageId===opts.assetId'));
 assert.ok(seamless.includes('if(opts.usePageBackgrounds||sharedImageIsBackground){'));
 assert.ok(seamless.includes('ctx.translate(i*W,0)'));
 assert.ok(seamless.includes('ctx.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)/2,sw,sh,0,0,W,H)'));
 assert.ok(seamless.includes('if(!opts.usePageBackgrounds&&!sharedImageIsBackground&&opts.assetId&&images[opts.assetId])'));
});

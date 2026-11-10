import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');

test('Single posts save the entire order: legacy stickers, main photo, main title, new layers',()=>{
 const post=read('FreePostStudio.tsx'),decor=read('CoverDecor.ts'),canvas=read('TouchLayerCanvas.tsx');
 assert.match(post,/if\(!decor\.layerOrder\?\.length\)return defaultOrder/);
 assert.match(post,/const rank=new Map\(decor\.layerOrder\.map/);
 assert.match(post,/const ordered=layers\.map\(layer=>layer\.id\)/);
 assert.match(post,/update\(\{\.\.\.decor,layerOrder:ordered\}\)/);
 assert.doesNotMatch(post,/if\(id==='main-title'\|\|id==='main-photo'\)return/);
 assert.match(decor,/layerOrder\?:string\[\]/);
 assert.match(decor,/layerOrder:Array\.isArray\(p\.layerOrder\)/);
 assert.match(canvas,/pageCount===1\?20\+layerIndex/);
});

test('Native single post photos and old stickers keep opacity in PNG and selection',()=>{
 const post=read('FreePostStudio.tsx'),decor=read('CoverDecor.ts');
 assert.match(post,/opacity:decor\.primaryPhotoOpacity\?\?1/);
 assert.match(post,/opacity:decor\.stickerOpacities\?\.\[id\]\?\?1/);
 assert.match(post,/stickerOpacities:\{\.\.\.decor\.stickerOpacities,/);
 assert.match(post,/effect\.primaryPhotoOpacity=Math\.max/);
 assert.match(decor,/primaryPhotoOpacity:/);
 assert.match(decor,/stickerOpacities:/);
 assert.match(post,/paintPanoramaLayers\(ctx,width,height,coverLayers/);
});

test('Carousel normal and seamless layers sent back render below native photos',()=>{
 const car=read('CarouselFactory.tsx'),seamless=read('SeamlessCarousel.ts');
 assert.match(car,/const hasBehind=\(style\.panoramaLayers\|\|\[\]\)\.some/);
 assert.match(car,/const native=hasBehind\?pageLayers\.filter/);
 assert.match(car,/drawSlide\(part,n,slides\.length,brand,images,style,hasBehind,pixelScale\)/);
 assert.match(car,/return overlayPanoramaPages\(all,ordered,images/);
 assert.match(car,/const pages=await renderAllSlides\(\)/);
 const behind=seamless.indexOf("const behind=(opts.layers||[]).filter");
 const pageLoop=seamless.indexOf('for(let i=0;i<total;i++){\n  const x=i*W,page=pages[i]');
 assert.ok(behind>0&&pageLoop>behind,'Behind layers must be drawn before native page photos');
 assert.match(seamless,/const front=\(opts\.layers\|\|\[\]\)\.filter/);
});

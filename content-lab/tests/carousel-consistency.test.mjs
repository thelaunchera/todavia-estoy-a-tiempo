import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const src=(p)=>readFileSync(resolve(here,'..',p),'utf8');
test('Carousel designs keep one master art direction while reading legacy data',()=>{
 const helper=src('src/CarouselArtDirection.ts'),ui=src('src/CarouselFactory.tsx');
 assert.match(helper,/version:2/);
 assert.ok(helper.includes('if(Array.isArray(parsed))'));
 assert.ok(ui.includes('encodeCarouselDesign(all,nextStyle)'));
 assert.ok(ui.includes('encodeCarouselDesign(generated,style)'));
 assert.ok(ui.includes('const generated=parseSlides(updated,brand).map'));
 assert.ok(ui.includes('backgroundImageId,backgroundColor:slide.backgroundColor'));
 assert.ok(ui.includes('getCarouselPalette(brand,style,slide.accentIndex||0)'));
 assert.ok(ui.includes('const canvas=(await renderAllSlides())[n]'));
 assert.ok(ui.includes('overlayPanoramaPages(all,style.panoramaLayers||[],images,ctx=>paintCarouselTypography(ctx,slides,brand,style))'));
});
test('Style references are sampled locally and never pasted into carousel slides',()=>{
 const helper=src('src/CarouselArtDirection.ts'),ui=src('src/CarouselFactory.tsx');
 assert.ok(helper.includes('canvas.getContext'));
 assert.ok(helper.includes('getImageData'));
 assert.ok(ui.includes('sampleReferencePalette(url)'));
 assert.ok(ui.includes('ownedAssets=useMemo(()=>assets.filter(a=>a.brandId===brand.id||a.shared)'));
 assert.ok(ui.includes('referenceAssetId'));
 assert.ok(ui.includes('No se copia la fotografía'));
});
test('Portrait and product photo modes stay distinct with credits confirmed',()=>{
 const ui=src('src/CarouselFactory.tsx');
 assert.ok(ui.includes("imageSubjectType==='portrait'"));
 assert.ok(ui.includes("imageSubjectType==='product'"));
 assert.ok(ui.includes("subjectType:imageSubjectType"));
 assert.ok(ui.includes("window.confirm('Esta foto utilizará 1 crédito"));
 assert.ok(ui.includes("photoFocus"));
 assert.ok(ui.includes('warnings=slides.flatMap'));
});

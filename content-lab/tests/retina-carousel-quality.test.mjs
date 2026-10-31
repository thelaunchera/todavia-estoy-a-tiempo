import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Panoramic previews are rendered with Retina-ready pixels and never the old 432px JPEG pipeline',()=>{
 const factory=read('src/CarouselFactory.tsx');
 assert.ok(factory.includes('const previewPageWidth=Math.min(900,Math.floor(6800/slides.length))'));
 assert.ok(factory.includes('previewPageWidth*slides.length'));
 assert.ok(factory.includes('previewPageHeight=Math.round(previewPageWidth*1.25)'));
 assert.ok(factory.includes("context.imageSmoothingQuality='high'"));
 assert.ok(factory.includes("previews.push(thumb.toDataURL('image/png'))"));
 assert.ok(!factory.includes("small.toDataURL('image/jpeg',.72)"));
 assert.ok(!factory.includes('canvas,n*432,0,432,540'));
});
test('Draft slides never auto-insert fake English hooks or repeated filler copy',()=>{
 const factory=read('src/CarouselFactory.tsx');
 assert.ok(factory.includes('const title = post.hook.trim()'));
 assert.ok(factory.includes("key: 'slide-' + i, eyebrow: ''"));
 assert.ok(factory.includes("result.push(makeSlide(result.length,''))"));
 assert.ok(!factory.includes("'One idea worth sharing'"));
 assert.ok(!factory.includes("'What needs to change?'"));
});
test('Typography remains deliberate and consistent on layered and seamless previews',()=>{
 const factory=read('src/CarouselFactory.tsx'),seamless=read('src/SeamlessCarousel.ts');
 assert.ok(factory.includes('const textY=hasPhoto?344:hasBody?464:608'));
 assert.ok(factory.includes("if(slide.title.trim())title(82,hasPhoto?344:hasBody?464:608"));
 assert.ok(seamless.includes('const headlineY=page.assetId?244:page.description.trim()?360:475'));
 assert.ok(seamless.includes("words(ctx,page.title,x+82,headlineY"));
});

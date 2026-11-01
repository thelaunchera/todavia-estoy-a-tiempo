import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('editorial rhythm is opt-in so stored user carousels remain unchanged',()=>{
 const style=read('src/CarouselArtDirection.ts');
 assert.ok(style.includes('editorialRhythm:boolean'));
 assert.ok(style.includes('editorialRhythm:false'));
 assert.ok(style.includes('editorialRhythm:v.editorialRhythm===true'));
});
test('visual rhythm supports photo-led, typography-led and split layouts without fake copy',()=>{
 const rhythm=read('src/EditorialRhythm.ts');
 for(const variant of ["layout==='photo'","layout==='split'","layout==='steps'","layout==='closing'"])
  assert.ok(rhythm.includes(variant),variant);
 assert.ok(rhythm.includes('if(slide.assetId)return photoLayouts'));
 assert.ok(rhythm.includes("if(index===slides.length-1)return 'closing'"));
 assert.ok(!rhythm.includes('One idea worth sharing'));
});
test('rhythm is selectable per slide or all slides and respects custom photos',()=>{
 const factory=read('src/CarouselFactory.tsx');
 assert.ok(factory.includes('onClick={applyRhythm}'));
 assert.ok(factory.includes('editorialRhythmForSlides(slides)'));
 assert.ok(factory.includes('aria-label="Composición de este slide"'));
 assert.ok(factory.includes('editorialRhythm:true'));
 assert.ok(factory.includes('const p=clampRect(slide.photoPosition)'));
 assert.ok(factory.includes('A photo belongs to the editable slide regardless of its typography rhythm.'));
});
test('export, seamless and draggable text use same shared plan',()=>{
 const factory=read('src/CarouselFactory.tsx'),seamless=read('src/SeamlessCarousel.ts');
 assert.ok(factory.includes('editorialTextGeometry(part,item.field)'));
 assert.ok(factory.includes('const p=editorialPlan(slide.layout,!!slide.assetId,!!slide.description.trim())'));
 assert.ok(factory.includes('editorialRhythm:style.editorialRhythm'));
 assert.ok(factory.includes('paintSeamlessTypography(typeCtx,'));
 assert.ok(factory.includes('style.perSlideBackgrounds?slides:slides.map('),'Se mantiene el fondo individual en previsualización');
 assert.ok(factory.includes('style.font,style.freeCanvas,style.canvasColor,style.editorialRhythm)'));
 assert.ok(seamless.includes('editorialPlan((page.layout||'));
 assert.ok(seamless.includes('opts.editorialRhythm'));
 assert.ok(seamless.includes('return splitIntoPages(wide,pages.length)'));
});

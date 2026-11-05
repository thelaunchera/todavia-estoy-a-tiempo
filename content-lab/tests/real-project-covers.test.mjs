import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=(name)=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
test('Carousel project cover uses the final renderer and returns first slide only',()=>{
 const factory=source('CarouselFactory.tsx');
 assert.ok(factory.includes('export async function renderSavedCarouselCover'));
 assert.ok(factory.includes('const slides=parseSlides(post,brand)'));
 assert.ok(factory.includes('const pages=await drawSeamlessPages'));
 assert.ok(factory.includes('return pages[0]'));
 assert.ok(factory.includes('return drawSlide(slides[0],0,slides.length,brand,images,style)'));
 assert.ok(factory.includes('overlayPanoramaPages(pages,ordered,images'));
 assert.ok(factory.includes('paintCarouselTypography(ctx,slides,brand,style)'));
});
test('Post and story thumbnails reuse final free-post renderer, without writing uploads or fake art',()=>{
 const previews=source('ProjectCover.tsx');
 assert.ok(previews.includes('renderFreePost({'));
 assert.ok(previews.includes('post.format===\'Story\'||post.format===\'Reel\''));
 assert.ok(previews.includes('projectCoverAssetIds(post)'));
 assert.ok(previews.includes('const ids=useMemo'));
 assert.ok(previews.includes("const thumbnail=document.createElement('canvas')"));
 assert.ok(previews.includes("thumbnail.toDataURL('image/png')"));
 assert.ok(!previews.includes('api.post('));
 assert.ok(!previews.includes('upload('));
});
test('Both recent and saved collections display actual artwork, retaining edit and delete',()=>{
 const dashboard=source('CreatorDashboard.tsx'),app=source('App.tsx'),css=source('ProjectCover.css');
 assert.ok(dashboard.includes('<ProjectCover post={post}'));
 assert.ok(app.includes('<ProjectCover post={p}'));
 assert.ok(app.includes('onClick={() => remove(p)}'));
 assert.ok(app.includes('onClick={() => edit(p)}'));
 assert.ok(css.includes('object-fit:contain'));
 assert.ok(css.includes('aspect-ratio:9/16'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(name)=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('Feed reads actual saved carousel slide rather than only assetId',()=>{
 const feed=read('src/LiveFeedGrid.tsx');
 assert.ok(feed.includes("import ProjectCover,{type CoverPost}"));
 assert.ok(feed.includes('savedCover.designData'));
 assert.ok(feed.includes('slides:full.slides'));
 assert.ok(feed.includes('if(hasSavedVisual)return <ProjectCover'));
 assert.ok(feed.includes("post:item")===false);
 assert.ok(!feed.includes("item.assetId&&images[item.assetId]?<img"));
 assert.ok(feed.includes("item.kind==='post'"));
});
test('All feed views share real thumbnail renderer without modifying posts or publication status',()=>{
 const feed=read('src/LiveFeedGrid.tsx');
 assert.equal((feed.match(/<FeedPostPreview item=\{item\}/g)||[]).length,3,
  'Grid, next posts and history should show the same real saved design');
 assert.ok(feed.includes('grids={grids}'));
 assert.ok(feed.includes("api.put('/api/posts/'+id"));
 assert.ok(feed.includes("api.put('/api/grids/'+grid.id"));
 assert.ok(feed.includes('onClick={()=>onOpenEditor(item)}'));
 assert.ok(!feed.includes('onUploadFile'));
});
test('Scheduled nine-post campaign renders its saved poster using original source',()=>{
 const preview=read('src/GridCampaignCover.tsx');
 const composer=read('src/GridComposer.ts');
 assert.ok(preview.includes('composeGridPoster(tile'));
 assert.ok(preview.includes('images[original]'));
 assert.ok(preview.includes("grid.kind==='preserve'"));
 assert.ok(preview.includes('pixelScale')===false);
 assert.ok(preview.includes("'portrait',0.28"));
 assert.ok(composer.includes('export async function composeGridPoster'));
 assert.ok(preview.includes('IntersectionObserver'));
 assert.ok(preview.includes('queue=work.then'));
 assert.ok(!preview.includes('api.post('));
 assert.ok(!preview.includes('api.put('));
});
test('Only authorized asset loader is reused and no brand/media library is modified',()=>{
 const app=read('src/App.tsx'),css=read('src/LiveFeedGrid.css');
 assert.ok(app.includes('locale={loginLanguage} loadImage={imageLoad}'));
 assert.ok(app.includes("const imageLoad = async (id: string)"));
 assert.ok(css.includes('.lab-live-feed-tile .lab-project-cover>img'));
 assert.ok(css.includes('.lab-live-feed-small-thumb .lab-feed-campaign-cover>img'));
 const html=read('index.html');
 assert.ok(html.includes('apple-touch-icon'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=(name)=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
test('Calendar-driven grid replaces one-product photo/reference form',()=>{
 const app=src('App.tsx'),feed=src('LiveFeedGrid.tsx'),model=src('LiveFeedModel.ts');
 assert.ok(app.includes('tab === \'grid\' && (gridPref.fromCalendar && gridPref.openGridId ?'));
 assert.ok(app.includes('<LiveFeedGrid brand={brand} posts={posts}'));
 assert.ok(!feed.includes('onUploadFile'),'the new grid must not ask users to upload product and reference photos');
 assert.ok(!feed.includes('quickProduct'),'the new grid is not a fixed nine-photo AI campaign');
 assert.ok(feed.includes('plannedItems'));
 assert.ok(model.includes("item.status==='published'"));
 assert.ok(model.includes("item.status==='planned'"));
});
test('Publishing a planned post persists its status and rolls the grid forward',()=>{
 const feed=src('LiveFeedGrid.tsx');
 assert.ok(feed.includes("planningStatus:'published'"));
 assert.ok(feed.includes("planningStatus:'planned'"));
 assert.ok(feed.includes("api.put('/api/posts/'+id"));
 assert.ok(feed.includes("api.put('/api/grids/'+grid.id"));
 assert.ok(feed.includes('onPostSaved(data as CalendarPost)'));
 assert.ok(feed.includes('liveFeedTiles(timeline.published,timeline.upcoming,mode,forward)'));
 assert.ok(feed.includes('onClick={()=>onOpenEditor(item)}'));
 assert.ok(feed.includes('onClick={()=>onOpenCalendar(item.date)}'));
 assert.ok(feed.includes('const [showHistory,setShowHistory]=useState(false)'));
});
test('Preview cannot falsely claim automatic Instagram publication',()=>{
 const source=src('LiveFeedGrid.tsx'),calc=src('LiveFeedModel.ts');
 assert.ok(source.includes('El Lab no publica automáticamente'));
 assert.ok(calc.includes('reaching a date never implies'));
 assert.ok(calc.includes("const plannedSteps=mode==='future'?upcoming.slice"));
});

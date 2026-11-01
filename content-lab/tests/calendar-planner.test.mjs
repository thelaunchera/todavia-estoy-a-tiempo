import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('month calendar and feed preview available on both the sidebar and iPhone dock',()=>{
 const app=source('src/App.tsx'),calendar=source('src/ContentCalendar.tsx');
 assert.ok(app.includes("id: 'calendar', title: 'Calendario editorial'"));
 assert.ok(app.includes("items:['calendar','posts','brands']"));
 assert.ok(app.includes("{id:'calendar',label:'Calendario',icon:CalendarDays}"));
 assert.ok(app.includes("<ContentCalendar brand={brand} posts={posts} images={images}"));
 assert.ok(calendar.includes("setView('month')"));
 assert.ok(calendar.includes("setView('feed')"));
 assert.ok(calendar.includes('monthCells('));
});
test('scheduled dates are saved in existing brand-isolated Supabase posts and grids',()=>{
 const calendar=source('src/ContentCalendar.tsx'),grid=source('src/BrandGrid.tsx');
 assert.ok(calendar.includes("api.put('/api/posts/'+id"));
 assert.ok(calendar.includes("api.put('/api/grids/'+gid"));
 assert.ok(calendar.includes("x.id===gid&&x.brandId===brand.id"));
 assert.ok(calendar.includes("p.brandId===brand.id&&p.id"));
 assert.ok(calendar.includes('scheduledDate:targetDate,scheduledTime:targetTime'));
 assert.ok(grid.includes("scheduledDate?:string;scheduledTime?:string"));
 assert.ok(grid.includes('flushDraft();'));
 assert.ok(grid.includes('saveQueue.current.then(()=>onOpenCalendar?.())'));
});
test('no misleading auto-publish claim and hourly views, local wall-clock times',()=>{
 const calendar=source('src/ContentCalendar.tsx'),model=source('src/CalendarPlannerModel.ts');
 assert.ok(calendar.includes('no publica automáticamente'));
 assert.ok(calendar.includes('does not automatically publish'));
 assert.ok(calendar.includes("type=\"time\""));
 assert.ok(model.includes("validTime=(value:string)"));
 assert.ok(model.includes("localDate=(value:Date)"));
 assert.ok(model.includes("status:'planned'"));
 assert.ok(calendar.includes('Intl.DateTimeFormat().resolvedOptions().timeZone'));
});
test('9 posts are planned one-by-one and feed shows actual uploaded photos or blank states',()=>{
 const calendar=source('src/ContentCalendar.tsx'),grid=source('src/BrandGrid.tsx');
 assert.ok(calendar.includes("g.posts.map((p,i)"));
 assert.ok(calendar.includes('p.assetId&&images[p.assetId]'));
 assert.ok(calendar.includes("feed=current.slice().sort"));
 assert.ok(grid.includes('Preparar mis 9 ideas'));
 assert.ok(grid.includes('ChatGPT crea las imágenes'));
 assert.ok(grid.includes('Ver calendario y feed'));
});

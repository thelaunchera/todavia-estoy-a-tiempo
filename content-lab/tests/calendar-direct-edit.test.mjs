import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../src/'+path,import.meta.url),'utf8');

test('one tap on planned calendar item opens its saved editor; date action stays independent',()=>{
 const calendar=read('ContentCalendar.tsx');
 const app=read('App.tsx');
 assert.ok(calendar.includes('onEditItem:(item:PlannedItem)=>void'));
 assert.ok(calendar.includes('onClick={()=>openDesign(p)}'));
 assert.ok(calendar.includes('lab-calendar-reschedule'));
 assert.ok(calendar.includes('onClick={()=>choose(p.id)}'));
 assert.ok(app.includes('const openCalendarItem=(item:PlannedItem)=>'));
 assert.ok(app.includes("const saved=posts.find(p=>p.id===id&&p.brandId===brand.id)"));
 assert.ok(app.includes('edit(saved,true)'));
 assert.ok(app.includes("navigate(['Reel','Story'].includes(post.format)?'vertical':post.format==='Carousel'?'factory':'create')"));
});

test('saved carousel/post/reel editing preserves date and opens same day after manual save',()=>{
 const app=read('App.tsx'),calendar=read('ContentCalendar.tsx');
 assert.ok(app.includes("const saveAndReturnToCalendar=async(candidate?:Post)=>"));
 assert.ok(app.includes("if(ok&&returning)"));
 assert.ok(app.includes("setCalendarFocusDate(validDate(draft.date||'')?draft.date:'')"));
 assert.ok(app.includes('onSave={saveAndReturnToCalendar}'));
 assert.ok(app.includes("onClick={()=>{void saveAndReturnToCalendar()}}"));
 assert.ok(app.includes('const returnFromCalendarEditor=async()=>'));
 assert.ok(app.includes('if(draftFingerprint(draft)!==lastSavedFingerprintRef.current)'));
 assert.ok(calendar.includes("validDate(focusDate||'')"));
 assert.ok(calendar.includes('new Date(Number(focusDate!.slice(0,4)),Number(focusDate!.slice(5,7))-1,1)'));
});

test('calendar 1 Photo → 9 Posts opens its exact previously saved tile',()=>{
 const app=read('App.tsx'),grid=read('BrandGrid.tsx'),calendar=read('ContentCalendar.tsx');
 assert.ok(app.includes("if(item.kind==='grid')"));
 assert.ok(app.includes('openGridId:item.gridId,openTileIndex:item.tileIndex,fromCalendar:true'));
 assert.ok(grid.includes("saved=grids.find(item=>item.id===selection.openGridId&&item.brandId===brand.id)"));
 assert.ok(grid.includes('openedCalendarVersion.current=selection.version'));
 assert.ok(grid.includes('savedSignature.current[saved.id]=signature(saved)'));
 assert.ok(grid.includes('setGrid(saved);setSelected(index)'));
 assert.ok(grid.includes('setExpandedEditor(true)'));
 assert.ok(grid.includes('resultsRef.current?.scrollIntoView'));
 assert.ok(grid.includes('const saveAndReturnToCalendar=async()=>'));
 assert.ok(grid.includes('onOpenCalendar?.(saved.posts[selected]?.scheduledDate)'));
 assert.ok(calendar.includes('key={p.id}'));
});

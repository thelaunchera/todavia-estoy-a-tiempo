import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('calendar day and scheduled project have independent accessible targets',()=>{
 const calendar=read('src/ContentCalendar.tsx');
 assert.match(calendar,/className="lab-calendar-day-pick"/);
 assert.match(calendar,/aria-label=\{\(locale==='es'\?'Abrir publicación '/);
 assert.match(calendar,/onClick=\{\(\)=>openDesign\(p\)\}/);
 assert.match(calendar,/className="lab-calendar-item-actions"/);
 assert.match(calendar,/onClick=\{\(\)=>void downloadProject\(p\)\}/);
 assert.match(calendar,/onClick=\{\(\)=>void deleteProject\(p\)\}/);
});

test('calendar deletion checks owner and affected row, preserving nine-post projects',()=>{
 const calendar=read('src/ContentCalendar.tsx');
 const api=read('src/platform/client.ts');
 const app=read('src/App.tsx');
 assert.match(api,/\.delete\(\)\.eq\('id',id\)\.eq\('owner_id',me\.id\)\.select\('id'\)/);
 assert.match(api,/if\(!data\?\.some\(item=>item\.id===id\)\)throw Error/);
 assert.match(app,/const remove = async \(p: Post\):Promise<boolean>/);
 assert.match(calendar,/scheduledDate:'',scheduledTime:''/);
 assert.match(calendar,/sin borrar su proyecto de 9 posts/);
});

test('project download routes saved carousel to PNG step and keeps photo projects as PNG',()=>{
 const app=read('src/App.tsx'),carousel=read('src/CarouselFactory.tsx');
 assert.match(app,/await exportFreePost\(saved,brand,sources\)/);
 assert.match(app,/edit\(saved,true,true\)/);
 assert.match(app,/initialStep=\{calendarDownloadId===editor\.id\?'download':undefined\}/);
 assert.match(carousel,/initialStep\?:'canvas'\|'download'/);
 assert.match(carousel,/if\(initialStep==='download'\)setStudioTab\('download'\)/);
});

test('tap to select a carousel object cannot mount inline duplication under the finger',()=>{
 const canvas=read('src/TouchLayerCanvas.tsx');
 assert.match(canvas,/active && !cropping && !layer\.locked && pageCount===1 && <div className="touch-editor-mini-actions"/);
 assert.match(canvas,/onDuplicateLayer&&<button type="button" onClick=\{\(\)=>onDuplicateLayer\(chosen\.id\)\}/);
 assert.match(canvas,/onPointerDown=\{e => down\(e, layer\)\}/);
});

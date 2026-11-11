import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
const dashboard=read('CreatorDashboard.tsx');
const icons=read('DashboardIllustration.tsx');
const css=read('CreatorDashboard.css');
const app=read('App.tsx');
const appCss=read('index.css');

test('all home format cards use shared scalable artwork rather than product photos',()=>{
 assert.match(dashboard,/formatArtwork=\{normal:'carousel',seamless:'seamless',post:'post',story:'story'\}/);
 assert.match(dashboard,/className="cld-format-illustration"/);
 assert.doesNotMatch(dashboard,/cardPhotos|dashboard\/soluna-matcha|dashboard\/sova-headphones|dashboard\/casa-brownie-gift-box|dashboard\/golden-grid-waffles/);
 assert.match(css,/\.cld-format-illustration/);
 assert.match(icons,/viewBox="0 0 240 240"/);
});

test('prompts, Brand Kit, stickers, media and calendar each receive appropriate universal art',()=>{
 for(const name of ['media','stickers','prompts','brand','calendar']){
  assert.ok(dashboard.includes('name="'+name+'"'),name+' is missing from its card');
  assert.ok(icons.includes("name==='"+name+"'"),name+' is missing from SVG art');
 }
 assert.doesNotMatch(dashboard,/libraryPhotos|cld-resource-media-strip/);
 assert.match(dashboard,/onNavigate\('calendar'\)/);
 assert.match(dashboard,/onEditBrand/);
 assert.match(css,/\.cld-resource-feature \.lab-dashboard-illustration/);
});

test('refresh is visible, bilingual, keeps the current view, and protects unsaved edits',()=>{
 assert.match(app,/className="lab-refresh-control"/);
 assert.match(app,/Actualizar Content Lab/);
 assert.match(app,/Refresh Content Lab/);
 assert.match(app,/const refreshLab=async\(\)=>/);
 const start=app.indexOf('const refreshLab=async()=>');
 const end=app.indexOf('const saveAndStartAnotherCarousel=',start);
 assert.ok(start>=0&&end>start,'refresh handler must be in scope');
 const handler=app.slice(start,end);
 assert.match(handler,/saveInFlightRef\.current/);
 assert.match(handler,/writeDraftBackup\(account\.email,draft\)/);
 assert.match(handler,/await save\(draft,true\)/);
 assert.match(handler,/await reload\(\)/);
 assert.doesNotMatch(handler,/window\.location\.reload|localStorage\.clear|setTab\('home'\)/);
 assert.match(appCss,/\.lab-refresh-control/);
 assert.match(appCss,/@media\(max-width:850px\)/);
});

test('Refresh re-fetches grid campaigns in calendar and feed without resetting selection',()=>{
 const calendar=read('ContentCalendar.tsx');
 const feed=read('LiveFeedGrid.tsx');
 assert.match(app,/setGridRefreshRevision\(n=>n\+1\)/);
 assert.match(app,/<LiveFeedGrid[^>]*refreshRevision=\{gridRefreshRevision\}/);
 assert.match(app,/<ContentCalendar[^>]*refreshRevision=\{gridRefreshRevision\}/);
 for(const view of [calendar,feed]){
  assert.match(view,/refreshRevision:number/);
  assert.match(view,/\[brand\.id,refreshRevision\]/);
  assert.match(view,/api\.get\('\/api\/grids'\)/);
 }
 assert.match(calendar,/if\(refreshRevision===0\)\{setGrids\(\[\]\);setKey\(''\)\}/);
});

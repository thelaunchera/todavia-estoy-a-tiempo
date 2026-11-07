import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=path=>readFileSync(new URL('../src/'+path,import.meta.url),'utf8');

test('calendar grid download never exports a raw photo for an editorial tile',()=>{
 const app=source('App.tsx');
 const grid=source('BrandGrid.tsx');
 const download=app.split('const downloadCalendarProject=async')[1]?.split('const save = async')[0]||'';
 assert.match(download,/if\(item\.kind==='grid'\)\s*\{[\s\S]*?openCalendarItem\(item\);/);
 assert.doesNotMatch(download,/drawImage\(img/);
 assert.match(grid,/setBrief\(saved\.brief\);setExpandedEditor\(Boolean\(saved\.posts\[index\]\?\.design\)\)/);
 assert.match(grid,/const c=await poster\(tile,i,grid,brand,images,exportSize,scale\)/);
});

test('calendar PNG download stops rather than silently losing source images',()=>{
 const app=source('App.tsx');
 const download=app.split('const downloadCalendarProject=async')[1]?.split('const save = async')[0]||'';
 assert.match(download,/if\(ids\.some\(imageId=>!sources\[imageId\]\)\)/);
 assert.match(download,/await exportFreePost\(saved,brand,sources\)/);
});

test('a permanently deleted project is also removed from local recovery',()=>{
 const app=source('App.tsx');
 const removal=app.split('const remove = async (p: Post)')[1]?.split('const generate = async')[0]||'';
 assert.match(removal,/await api\.delete\('\/api\/posts\/' \+ p\.id\)/);
 assert.match(removal,/if\(account\?\.email\)removeDraftBackup\(account\.email,p\)/);
 assert.match(removal,/editorLatestRef\.current=next/);
 assert.match(removal,/lastSavedFingerprintRef\.current=draftFingerprint\(next\)/);
 assert.match(removal,/setRecovery\(null\)/);
});

test('Safari drag suppresses its synthetic click until consumed or a real fresh gesture',()=>{
 const editor=source('PanoramaEditor.tsx');
 const start=editor.split('const dragStart=')[1]?.split('const dragMove=')[0]||'';
 const end=editor.split('const dragEnd=')[1]?.split('const upload = async')[0]||'';
 assert.match(start,/ignoreClick\.current=''/);
 assert.match(end,/ignoreClick\.current=drag\.id/);
 assert.doesNotMatch(end,/setTimeout\(/);
 assert.match(editor,/if\(ignoreClick\.current===asset\.id\)\{ignoreClick\.current='';return\}/);
});

test('portal toolbars stop pointer gestures from leaking into carousel manipulation',()=>{
 const touch=source('TouchLayerCanvas.tsx');
 for(const name of ['touch-editor-context-dock','touch-editor-context-inspector']){
  const tail=touch.split("className={'"+name)[1]||'';
  assert.match(tail.slice(0,530),/onPointerDown=\{e=>e\.stopPropagation\(\)\}/);
  assert.match(tail.slice(0,530),/onPointerUp=\{e=>e\.stopPropagation\(\)\}/);
 }
});

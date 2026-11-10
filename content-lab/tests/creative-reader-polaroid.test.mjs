import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');
const reader=read('../src/CarouselReader.tsx');
const readerCss=read('../../creative-shared/CarouselReader.css');
const studioReader=read('../../estudio-control/src/CarouselReader.tsx');

const lab=read('../src/CarouselFactory.tsx');
const panorama=read('../src/PanoramaLayers.ts');
const studio=read('../../estudio-control/src/SeamlessEditor.tsx');

test('shared magazine reader has an accessible, opt-in dialog and swipe plus arrow navigation',()=>{
 assert.equal(reader,studioReader,'Studio y Lab deben conservar el mismo lector sin desincronizarse');
 assert.match(reader,/aria-modal="true"/);
 assert.match(reader,/onPointerUp=\{event=>/);
 assert.match(reader,/event\.key==='Escape'/);
 assert.match(reader,/event\.key==='ArrowRight'/);
 assert.match(reader,/mode==='polaroids'/);
 assert.match(readerCss,/prefers-reduced-motion:reduce/);
 assert.match(readerCss,/touch-action:pan-y/);
});
test('Studio Polaroid lives in editable doc and the export painter',()=>{
 assert.match(studio,/frameStyle\?:'polaroid'/);
 assert.match(studio,/frameStyle==='polaroid'&&it\.role!=='background'/);
 assert.match(studio,/await paint\(ctx,factor,i\*W,W\)/);
 assert.match(studio,/setDoc\(d=>\(\{\.\.\.d,items:d\.items\.map/);
 assert.match(studio,/applyPolaroidScatter/);
 assert.match(studio,/openMagazine/);
});
test('Content Lab Polaroid is persisted, mirrored on preview, and exported',()=>{
 assert.match(panorama,/frameStyle\?:string/);
 assert.match(panorama,/frameStyle:'polaroid' as const/);
 assert.match(panorama,/layer\.frameStyle==='polaroid'/);
 assert.match(panorama,/photoFrameMetrics\(w,h,'polaroid'\)/);
 assert.match(lab,/scatterExistingPhotos/);
 assert.match(lab,/setArtStyle\(\{panoramaLayers:next\}\)/);
 assert.match(lab,/pages=\{overview\}/);
});
test('creative effects remain optional, with no effects applied by default to all saved layers',()=>{
 assert.doesNotMatch(panorama,/frameStyle:\s*'polaroid'\s*,\s*kind:/);
 assert.match(studio,/current\.frameStyle==='polaroid'/);
});

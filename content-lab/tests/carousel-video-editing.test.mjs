import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import typescript from 'typescript';

const src=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
const source=src('CarouselVideoTransform.ts');
const javascript=typescript.transpileModule(source,{
  compilerOptions:{module:typescript.ModuleKind.CommonJS,target:typescript.ScriptTarget.ES2020}
}).outputText;
const module={exports:{}};
const context={module,exports:module.exports};
vm.runInNewContext(javascript,context,{filename:'CarouselVideoTransform.js'});
const video=module.exports;

test('moving and rotating a video persists normalized editable geometry',()=>{
  const raw={x:.25,y:.13,w:.7,h:.5,rotation:45,zoom:2,panX:.2,panY:-.15};
  const saved=JSON.parse(JSON.stringify(raw));
  assert.deepEqual(JSON.parse(JSON.stringify(video.normalizeVideoTransform(saved))),saved);
  assert.equal(video.videoHasEdits(saved,0,0),true);
  assert.equal(video.videoHasEdits(video.DEFAULT_VIDEO_TRANSFORM,0,0),false);
  assert.equal(video.videoHasEdits(video.DEFAULT_VIDEO_TRANSFORM,3,8),true);
});

test('invalid or oversized values cannot produce unsafe canvas dimensions',()=>{
  const result=video.normalizeVideoTransform({
    x:NaN,y:Infinity,w:-20,h:400,rotation:9999,zoom:9999,panX:9,panY:-9
  });
  assert.equal(result.x,0);
  assert.equal(result.y,0);
  assert.equal(result.w,.12);
  assert.equal(result.h,2);
  assert.equal(result.rotation,180);
  assert.equal(result.zoom,5);
  assert.equal(result.panX,1);
  assert.equal(result.panY,-1);
});

test('trim calculations cannot reverse start/end or exceed duration',()=>{
  assert.deepEqual(JSON.parse(JSON.stringify(video.videoTrim(2,7,10))),{start:2,end:7});
  assert.deepEqual(JSON.parse(JSON.stringify(video.videoTrim(2,0,10))),{start:2,end:10});
  const limited=video.videoTrim(15,5,10);
  assert.ok(limited.end>limited.start);
  assert.ok(limited.end<=10);
});

test('export draws video with the same rotation, clip and pan as the preview',()=>{
  const operations=[];
  const ctx={
    save:()=>operations.push('save'),
    translate:(x,y)=>operations.push(['translate',x,y]),
    rotate:r=>operations.push(['rotate',r]),
    beginPath:()=>operations.push('begin'),
    rect:(...args)=>operations.push(['rect',...args]),
    clip:()=>operations.push('clip'),
    fillRect:()=>operations.push('fill'),
    drawImage:(...args)=>operations.push(['video',...args]),
    restore:()=>operations.push('restore'),
  };
  video.drawTransformedVideo(ctx,{videoWidth:1920,videoHeight:1080},
    {x:.1,y:.2,w:.5,h:.5,rotation:90,zoom:2,panX:.2,panY:-.3},1080,1350);
  assert.ok(operations.some(x=>Array.isArray(x)&&x[0]==='rotate'&&Math.abs(x[1]-Math.PI/2)<.0001));
  assert.ok(operations.includes('clip'));
  assert.ok(operations.some(x=>Array.isArray(x)&&x[0]==='video'));
  assert.equal(operations.at(-1),'restore');
});

test('video editor exposes resize, rotate, crop and trim for iPhone/iPad',()=>{
  const factory=src('CarouselFactory.tsx');
  const layer=src('CarouselVideoLayer.tsx');
  const touch=src('TouchLayerCanvas.tsx');
  assert.match(factory,/Recortar encuadre/);
  assert.match(factory,/Recortar duración/);
  assert.match(factory,/htmlFor="video-rotation"/);
  assert.match(factory,/onVideoChange=\{updateVideoGeometry\}/);
  assert.match(layer,/data-video-resize/);
  assert.match(layer,/pointers.current.size===2/);
  assert.match(layer,/onChange\?\.\(video.page,next\)/);
  assert.match(touch,/onChange=\{onVideoChange\}/);
});

test('download renders edited clips and keeps sound instead of exporting originals',()=>{
  const factory=src('CarouselFactory.tsx');
  const renderer=src('CarouselVideoRender.ts');
  assert.match(factory,/videoHasEdits\(part.videoTransform,part.videoTrimStart,part.videoTrimEnd\)/);
  assert.match(factory,/renderEditedCarouselVideo\(original,/);
  assert.match(factory,/videoTrimStart:previous.videoTrimStart/);
  assert.match(factory,/videoTransform:normalizeVideoTransform\(s.videoTransform\)/);
  assert.match(renderer,/createMediaElementSource\(video\)/);
  assert.match(renderer,/createMediaStreamDestination\(\)/);
  assert.match(renderer,/canvas.captureStream\(30\)/);
  assert.match(renderer,/drawTransformedVideo\(ctx,video,transform/);
  assert.match(renderer,/MediaRecorder\.isTypeSupported/);
});

test('Seamless video crossing a cut is visible on both slides, with no duplicate file',()=>{
  const v={x:.55,y:0,w:1,h:1,rotation:0,zoom:1,panX:0,panY:0};
  assert.deepEqual([...video.videoVisiblePages(1,v,5,true)],[1,2]);
  assert.deepEqual([...video.videoVisiblePages(1,v,5,false)],[1]);
  assert.equal(video.videoOffsetForPage(1,1),0);
  assert.equal(video.videoOffsetForPage(1,2),-1);
  assert.equal(video.videoHasEdits(v,0,0),true);
});
test('rotation crossing a dotted line also exports to the neighboring slide',()=>{
  const v={x:.2,y:.12,w:.6,h:1.5,rotation:55,zoom:1,panX:0,panY:0};
  assert.deepEqual([...video.videoVisiblePages(2,v,5,true)],[1,2,3]);
  assert.deepEqual([...video.videoVisiblePages(2,v,5,false)],[2]);
  assert.deepEqual([...video.videoVisiblePages(-1,v,5,true)],[]);
});
test('shared video export applies its page offset after geometry normalization',()=>{
  const translations=[];
  const ctx={save(){},translate:(x,y)=>translations.push([x,y]),rotate(){},
    beginPath(){},rect(){},clip(){},fillRect(){},drawImage(){},restore(){}};
  const clip={x:.65,y:.1,w:.85,h:.9,rotation:0,zoom:1,panX:0,panY:0};
  video.drawTransformedVideo(ctx,{videoWidth:160,videoHeight:200},clip,1080,1350,0);
  video.drawTransformedVideo(ctx,{videoWidth:160,videoHeight:200},clip,1080,1350,-1);
  assert.equal(Math.round(translations[0][0]-translations[1][0]),1080);
  assert.equal(translations[0][1],translations[1][1]);
});
test('the editor renders spanning videos and prevents ambiguous overlapping exports',()=>{
  const factory=src('CarouselFactory.tsx');
  const component=src('CarouselVideoLayer.tsx');
  assert.match(factory,/videoVisiblePages\(owner,\s*part\.videoTransform/);
  assert.match(factory,/exportableVideo\(slides,n,style\.seamlessEnabled\)/);
  assert.match(factory,/dos videos superpuestos/);
  assert.match(factory,/videoOffsetForPage\(owner,n\)/);
  assert.match(factory,/Entre slides \{selectedVideoOwner\+1\}/);
  assert.match(component,/left:seamless\?'0%'/);
  assert.match(component,/100\*\(video\.page\+d\.x\)\/pageCount/);
});

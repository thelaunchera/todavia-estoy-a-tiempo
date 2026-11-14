import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const src=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');

test('private video storage has its own bucket and owner-bound prefix',()=>{
  const code=src('platform/client.ts');
  assert.match(code,/const videoBucket='content-lab-videos'/);
  assert.match(code,/const me=await current\(\)/);
  assert.match(code,/me\.id\+'\/carousel-videos\/'/);
  assert.match(code,/sb\.storage\.from\(videoBucket\)\.upload\(path,file/);
  assert.match(code,/sb\.storage\.from\(videoBucket\)\.download\(path\)/);
  assert.match(code,/!path\.startsWith\(me\.id\+'\/carousel-videos\/'\)/);
  assert.match(code,/file\.size>40_000_000/);
});

test('mixed carousel slide keeps private video metadata across save/reopen',()=>{
  const code=src('CarouselFactory.tsx');
  assert.match(code,/videoPath\?:string; videoName\?:string; videoMime\?:string/);
  assert.match(code,/videoPath:typeof s\.videoPath==='string'/);
  assert.match(code,/videoPath:uploaded\.path,videoName:uploaded\.name,videoMime:uploaded\.mime/);
  assert.match(code,/videoPath:previous\.videoPath/);
  assert.match(code,/encodeCarouselDesign\(updated,latest\.style\)/);
});

test('video can be chosen on the same touch canvas as photos',()=>{
  const editor=src('PanoramaEditor.tsx');
  const canvas=src('TouchLayerCanvas.tsx');
  const factory=src('CarouselFactory.tsx');
  assert.match(editor,/Subir video/);
  assert.match(editor,/videoPages=\{videoPages\}/);
  assert.match(canvas,/CarouselVideoLayer/);
  assert.match(src('CarouselVideoLayer.tsx'),/<video ref=\{preview\} src=\{video\.src\}/);
  assert.match(factory,/accept="video\/mp4,video\/quicktime,video\/webm/);
  assert.match(factory,/videoPages=\{videoPages\}/);
  assert.match(factory,/src=\{activeVideo\.url\} controls playsInline/);
});

test('export is mixed: edited videos are processed and photos remain PNG',()=>{
  const factory=src('CarouselFactory.tsx');
  const app=src('App.tsx');
  assert.match(factory,/carouselVideoMedia\.download\(part\.videoPath\)/);
  assert.match(factory,/videoFilename\(n,part\.videoPath\)/);
  assert.match(factory,/const blob=await canvasToPngBlob\(canvas\)/);
  assert.match(factory,/Preparar mis archivos/);
  assert.match(app,/readCarouselDesign\(p\.designData\|\|''\)\.slides\?\.some/);
  assert.match(app,/edit\(p,true,true\)/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8');

test('Carousel final output is native-resolution lossless PNG with high-quality smoothing',()=>{
  const factory=read('CarouselFactory.tsx');
  const seamless=read('SeamlessCarousel.ts');
  assert.match(factory,/canvas\.width=1080;canvas\.height=1350/);
  assert.match(factory,/ctx\.imageSmoothingQuality='high'/);
  assert.match(factory,/canvasToPngBlob\(canvas\)/);
  assert.match(factory,/canvas\.toBlob\(blob=>/);
  assert.match(factory,/,'image\/png'\)/);
  assert.match(seamless,/const W=1080,H=1350/);
  assert.match(seamless,/ctx\.imageSmoothingQuality='high'/);
});

test('Shared background imports retain more source pixels before export',()=>{
  const app=read('App.tsx');
  const section=app.split('const publishSharedBackground=async')[1].split('const upload = async')[0];
  assert.match(section,/maxDimension:3000,maxPixels:7_000_000,quality:0\.94/);
  assert.match(section,/preserveIfPossible:true/);
  assert.doesNotMatch(section,/maxDimension:1500,maxPixels:1800000,quality:0\.80/);
});

test('Low resolution and cropped/zoomed photos trigger warning before download',()=>{
  const factory=read('CarouselFactory.tsx');
  assert.match(factory,/const inspectImageQuality=async/);
  assert.match(factory,/normalizeCrop\(rect\.crop\)\.zoom/);
  assert.match(factory,/scale>1\.15/);
  assert.match(factory,/setImageQualityNotes\(notes\)/);
  assert.match(factory,/notes\.length>0/);
});

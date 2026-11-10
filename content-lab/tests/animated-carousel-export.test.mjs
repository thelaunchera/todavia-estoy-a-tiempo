import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');
const source=read('../../creative-shared/CarouselMotionExport.ts');
const lab=read('../src/CarouselFactory.tsx');
const studio=read('../../estudio-control/src/SeamlessEditor.tsx');

test('animated export is browser-native, local and feature-gated',()=>{
 assert.match(source,/typeof MediaRecorder!=='undefined'/);
 assert.match(source,/HTMLCanvasElement\.prototype\.captureStream/);
 assert.match(source,/MediaRecorder\.isTypeSupported/);
 assert.match(source,/video\/mp4/);
 assert.match(source,/video\/webm/);
 assert.match(source,/data:image/);
 assert.doesNotMatch(source,/\bfetch\(|XMLHttpRequest|FormData|supabase|stripe|cloudflare/i);
});
test('video encoder is bounded and cleans streams on completion and failure',()=>{
 assert.match(source,/pages\.length>10/);
 assert.match(source,/requestAnimationFrame\(tick\)/);
 assert.match(source,/stream\.getTracks\(\)\.forEach\(track=>track\.stop\(\)\)/);
 assert.match(source,/canvas\.width=1;canvas\.height=1/);
 assert.match(source,/clearTimeout\(timeoutHandle\)/);
});
test('Lab and Studio keep manual video download separate from PNG exports',()=>{
 assert.match(lab,/renderCarouselVideo\(overview/);
 assert.match(lab,/href=\{motionDownload\.url\}/);
 assert.match(lab,/download=\{motionDownload\.name\}/);
 assert.match(studio,/renderCarouselVideo\(pages/);
 assert.match(studio,/href=\{motionDownload\.url\}/);
 assert.match(studio,/download=\{motionDownload\.name\}/);
 assert.match(lab,/const exportOne=async/);
 assert.match(studio,/const exportSlides=async/);
});

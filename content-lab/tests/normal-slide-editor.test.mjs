import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const canvas=readFileSync(new URL('../src/TouchLayerCanvas.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/TouchLayerCanvas.css',import.meta.url),'utf8');

test('Normal gives each slide the full editor viewport width',()=>{
  assert.match(canvas,/const \[normalPageWidth,setNormalPageWidth\]=useState\(320\)/);
  assert.match(canvas,/viewport\.clientWidth/);
  assert.match(canvas,/width: pageCount \* normalPageWidth, minWidth: pageCount \* normalPageWidth/);
  assert.match(canvas,/\[normalPageWidth,pageCount,continuous\]/);
});
test('Normal displays one independently framed slide with swipe snapping',()=>{
  assert.match(css,/\.touch-editor-normal-pages \.touch-editor-scroll\{[\s\S]*?max-width:520px[\s\S]*?scroll-snap-type:x mandatory/);
  assert.match(css,/\.touch-editor-normal-pages \.panorama-cut-guides>div\{[\s\S]*?scroll-snap-align:start/);
  assert.match(css,/\.panorama-canvas\.touch-editor-normal-pages \.touch-editor-page-navigation button\{[\s\S]*?display:inline-flex/);
});
test('Seamless panorama remains separate, with its cut markers',()=>{
  assert.match(canvas,/continuous\s*\?\s*\{minWidth: pageCount \* 230\}/);
  assert.match(css,/\.touch-editor-seamless-pages \.panorama-cut-guides>div:not\(:first-child\)/);
  assert.match(canvas,/pageCount>1&&!continuous\?' touch-editor-normal-pages':' touch-editor-seamless-pages'/);
});

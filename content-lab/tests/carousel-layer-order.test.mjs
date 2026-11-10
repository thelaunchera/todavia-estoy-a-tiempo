import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/TouchLayerCanvas.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/TouchLayerCanvas.css',import.meta.url),'utf8');
test('single posts honor their ordered stack while panorama behind-text and background remain below',()=>{
 assert.match(source,/layers\.map\(\(layer, layerIndex\)/);
 assert.match(source,/const z = layer\.role==='background'\?1:pageCount===1\?20\+layerIndex:/);
 assert.match(source,/layer\.placement==='behind-text'\?2\+\(layerIndex\/Math\.max\(1,layers\.length\)\):20\+layerIndex/);
 assert.match(source,/zIndex:z/);
 assert.match(source,/pointerEvents:layer\.locked\|\|\(pageCount>1&&interactionMode==='navigate'\)/);
 assert.match(source,/layers\.slice\(\)\.reverse\(\)\.map/);
 assert.doesNotMatch(css,/z-index:8!important/);
 assert.doesNotMatch(css,/\.panorama-canvas \.touch-editor-layer\.is-background\{pointer-events:none!important\}/);
 assert.match(css,/\.touch-editor-layer\.is-background/);
});

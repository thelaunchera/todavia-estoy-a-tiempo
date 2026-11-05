import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');

test('Opacity sliders preview locally and commit once after touch or keyboard gesture',()=>{
  const canvas=read('TouchLayerCanvas.tsx');
  assert.match(canvas,/const \[opacityPreview,setOpacityPreview\]=useState/);
  assert.match(canvas,/const pendingOpacity=useRef/);
  assert.match(canvas,/const changeOpacity=/);
  assert.match(canvas,/const finishOpacity=/);
  assert.match(canvas,/onPointerUp:finishOpacity/);
  assert.match(canvas,/onTouchEnd:finishOpacity/);
  assert.match(canvas,/onKeyUp:finishOpacity/);
  assert.match(canvas,/onBlur:finishOpacity/);
  assert.match(canvas,/onUpdate\?\.\(draft\.id,\{opacity:draft\.value\}\)/);
  assert.equal((canvas.match(/onChange=\{e=>changeOpacity\(/g)||[]).length,2);
  assert.doesNotMatch(canvas,/onChange=\{e=>onUpdate\(chosen\.id,\{opacity:/);
  assert.match(canvas,/opacityPreview\?\.id===layer\.id/);
  assert.match(canvas,/style=\{\{\.\.\.photoWindow,opacity:visibleOpacity\(layer\)\}\}/);
  assert.match(canvas,/ctx|visibleOpacity\(layer\)/);
});

test('Both tablet and phone opacity sliders have touch-sized non-scrolling track',()=>{
  const css=read('TouchLayerCanvas.css');
  assert.match(css,/\.touch-editor-opacity-control input\[type=range\]\{[^}]*min-height:44px;touch-action:none/s);
  assert.match(css,/\.touch-editor-context-range input\[type=range\]\{[^}]*min-height:44px;touch-action:none/s);
});

test('Export layer painter uses the saved opacity setting',()=>{
  const renderer=read('PanoramaLayers.ts');
  assert.match(renderer,/ctx\.globalAlpha=Math\.max\(0,Math\.min\(1,layer\.opacity\?\?1\)\)/);
});

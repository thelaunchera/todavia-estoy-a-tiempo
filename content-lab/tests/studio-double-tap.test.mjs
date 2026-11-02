import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const compile=async(file)=>{
 const source=readFileSync(new URL('../../estudio-control/src/'+file+'.ts',import.meta.url),'utf8');
 const transpiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
 return import('data:text/javascript;base64,'+Buffer.from(transpiled.outputText).toString('base64'));
};
const {isLayerDoubleTap,isStationaryTap}=await compile('double-tap');
const {drawCurvedTextLine,clampTextCurve,clampLetterSpacing}=await compile('curved-text');
const source=readFileSync(new URL('../../estudio-control/src/SeamlessEditor.tsx',import.meta.url),'utf8');

test('delete X needs two stationary taps on the very same item',()=>{
 const first={id:1,at:100,x:100,y:200};
 assert.equal(isLayerDoubleTap(null,first),false);
 assert.equal(isLayerDoubleTap(first,{id:1,at:350,x:105,y:209}),true);
 assert.equal(isLayerDoubleTap(first,{id:2,at:350,x:105,y:209}),false);
 assert.equal(isLayerDoubleTap(first,{id:1,at:650,x:105,y:209}),false);
 assert.equal(isLayerDoubleTap(first,{id:1,at:200,x:300,y:209}),false);
 assert.equal(isStationaryTap({x:100,y:100},{x:103,y:108}),true);
 assert.equal(isStationaryTap({x:100,y:100},{x:190,y:104}),false);
});

test('blank canvas or tap outside dismisses contextual delete X',()=>{
 assert.match(source,/deleteArmedId===current\.id/,'cross only displays when layer is armed');
 assert.match(source,/if\(!it\)lastTap\.current=null/,'blank canvas resets double tap');
 assert.match(source,/setDeleteArmedId\(null\)/,'outside selection resets cross');
 assert.match(source,/target\.closest\('\[data-carousel-canvas\],\[data-carousel-delete\]'\)/);
 assert.doesNotMatch(source,/<canvas ref=\{canvas\} onDoubleClick=/,'double-click no longer unexpectedly edits text');
 assert.match(source,/onPointerUp=\{up\}/);
 assert.match(source,/isStationaryTap\(start/);
});

test('curvature uses true circular glyph positions and optional spacing',()=>{
 const positions=[],rotations=[],painted=[];
 const ctx={
  measureText:char=>({width:char===' '?18:42}),
  save(){},restore(){},translate(x,y){positions.push([x,y])},rotate(a){rotations.push(a)},
  scale(){},fillText(letter){painted.push(letter)}
 };
 drawCurvedTextLine(ctx,'FAMILIA',0,0,70,60,800,12);
 assert.equal(painted.length,7);
 assert.ok(rotations[0]<0&&rotations.at(-1)>0,'letters follow tangents');
 assert.ok(positions[3][1]<positions[0][1],'center rises on upward arc');
 const lowerPositions=[],lowerGlyphs=[];
 const bottomCtx={
  ...ctx,
  translate(x,y){lowerPositions.push([x,y])},
  fillText(letter){lowerGlyphs.push(letter)}
 };
 drawCurvedTextLine(bottomCtx,'FAMILIA',0,0,70,-60,800,12);
 assert.deepEqual(lowerGlyphs,Array.from('FAMILIA'),'letters keep their original sequence');
 assert.ok(lowerPositions[0][0]<lowerPositions.at(-1)[0],'downward arc remains left-to-right');
 assert.ok(lowerPositions[3][1]>lowerPositions[0][1],'center lowers on downward arc');
 assert.ok(positions.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)));
 assert.equal(clampTextCurve(123),100);
 assert.equal(clampLetterSpacing(80),30);
 assert.equal(clampLetterSpacing(-40),-8);
 assert.match(source,/letterSpacing\?:number/);
 assert.match(source,/\['Casi círculo',100\]/);
 assert.match(source,/curvedTextExtraHeight\(it.fontSize/);
 assert.match(source,/await paint\(ctx,factor,i\*W,W\)/,'preview and PNG export share painter');
});

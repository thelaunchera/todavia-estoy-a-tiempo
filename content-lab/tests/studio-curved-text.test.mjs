import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const source=readFileSync(new URL('../../estudio-control/src/curved-text.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{
 target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022
}}).outputText;
const {clampTextCurve,curvedTextExtraHeight,drawCurvedTextLine}=
 await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));

const fakeCanvas=()=>{
 const points=[],glyphs=[],angles=[];
 const ctx={
  measureText:char=>({width:char===' '?25:48}),
  save:()=>{},restore:()=>{},
  translate:(x,y)=>points.push({x,y}),
  rotate:angle=>angles.push(angle),
  scale:()=>{},
  fillText:(letter,x,y)=>glyphs.push({letter,x,y})
 };
 return {ctx,points,glyphs,angles};
};

test('straight text paints as a normal single text line, including legacy projects',()=>{
 const view=fakeCanvas();
 drawCurvedTextLine(view.ctx,'FAMILIA',90,240,80,0,900);
 assert.equal(view.glyphs.length,1);
 assert.deepEqual(view.glyphs[0],{letter:'FAMILIA',x:90,y:240});
 assert.equal(view.points.length,0);
});

test('arched-up and arched-down text bend in opposite directions and rotate glyphs',()=>{
 const top=fakeCanvas(),bottom=fakeCanvas();
 drawCurvedTextLine(top.ctx,'FAMILIA',20,120,76,70,900);
 drawCurvedTextLine(bottom.ctx,'FAMILIA',20,120,76,-70,900);
 assert.equal(top.glyphs.length,7);
 assert.equal(bottom.glyphs.length,7);
 assert.ok(top.points[3].y<top.points[0].y,'upward arc lifts the middle glyph');
 assert.ok(bottom.points[3].y>bottom.points[0].y,'downward arc lowers the middle glyph');
 assert.ok(top.angles[0]<0 && top.angles[6]>0);
 assert.ok(bottom.angles[0]>0 && bottom.angles[6]<0);
 assert.ok(top.points.every(point=>Number.isFinite(point.x)&&Number.isFinite(point.y)));
});

test('curvature stays within the design slider range and has room for the arch',()=>{
 assert.equal(clampTextCurve(340),100);
 assert.equal(clampTextCurve(-900),-100);
 assert.equal(clampTextCurve(Number.NaN),0);
 assert.equal(curvedTextExtraHeight(76,900,0,['FAMILIA']),0);
 assert.ok(curvedTextExtraHeight(76,900,90,['FAMILIA'])>0);
});

test('overwide text is compressed horizontally to avoid exceeding its frame',()=>{
 const view=fakeCanvas();
 drawCurvedTextLine(view.ctx,'LONG EDITORIAL HEADING',0,100,60,100,230);
 assert.ok(view.points.at(-1).x<=230,'last glyph fits inside maxWidth');
 assert.ok(view.points[0].x>=0,'first glyph stays inside maxWidth');
});

test('Studio includes the text curve controls and shared renderer for exports',()=>{
 const studio=readFileSync(new URL('../../estudio-control/src/SeamlessEditor.tsx',import.meta.url),'utf8');
 assert.match(studio,/curve\?:number/);
 assert.match(studio,/Curvar texto/);
 assert.match(studio,/drawCurvedTextLine\(ctx,line/);
 assert.match(studio,/await paint\(ctx,factor,i\*W,W\)/);
 assert.match(studio,/curvedTextExtraHeight\(it.fontSize/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const read=file=>readFileSync(new URL('../../'+file,import.meta.url),'utf8');

test('Lab text outline is an actual hollow mode with color and thickness and export parity',()=>{
 const layers=read('content-lab/src/PanoramaLayers.ts');
 const canvas=read('content-lab/src/TouchLayerCanvas.tsx');
 const cover=read('content-lab/src/CoverDecor.ts');
 const preview=read('content-lab/src/CurvedTextPreview.tsx');
 assert.ok(layers.includes("outlineColor:layer.outlineColor||'#FFFFFF'")||
           layers.includes("ctx.strokeStyle=layer.outlineColor||'#FFFFFF'"));
 assert.ok(layers.includes('if(!layer.outline||!layer.outlineOnly)ctx.fillText'));
 assert.ok(layers.includes('!!layer.outline,!layer.outline||!layer.outlineOnly'));
 assert.ok(layers.includes('outlineOnly?:boolean; outlineColor?:string; outlineWidth?:number'));
 assert.ok(canvas.includes("WebkitTextFillColor:layer.outline&&layer.outlineOnly?'transparent'"));
 assert.ok(canvas.includes('WebkitTextStroke:layer.outline?'));
 assert.ok(canvas.includes('Efecto Outline del texto'));
 assert.ok(canvas.includes('Grosor del Outline'));
 assert.ok(canvas.includes('outline:true,outlineOnly:true'));
 assert.ok(cover.includes('outlineOnly:p.headlineStyle.outlineOnly===true'));
 assert.ok(cover.includes('outlineColor:hex(p.headlineStyle.outlineColor'));
 assert.ok(preview.includes('layer.outlineColor,layer.outlineWidth'));
});

test('Studio stores real outline settings and paints the exact same render into PNGs',()=>{
 const studio=read('estudio-control/src/SeamlessEditor.tsx');
 const css=read('estudio-control/src/seamless-app.css');
 assert.ok(studio.includes("textOutline?:boolean;outlineOnly?:boolean;outlineColor?:string;outlineWidth?:number"));
 assert.ok(studio.includes("ctx.strokeStyle=it.outlineColor||'#FFFFFF'"));
 assert.ok(studio.includes("it.letterSpacing||0,!!it.textOutline,!it.textOutline||!it.outlineOnly"));
 assert.ok(studio.includes('outline:true')===false,'private Studio uses its existing textOutline field');
 assert.ok(studio.includes('textOutline:true,outlineOnly:true'));
 assert.ok(studio.includes('Color del contorno'));
 assert.ok(studio.includes('Grosor del contorno'));
 assert.ok(css.includes('.studio-outline-modes button'));
});

test('straight, tracked and curved text can stroke without filling in both renderers',()=>{
 for(const file of ['content-lab/src/CurvedText.ts','estudio-control/src/curved-text.ts']){
  const js=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};runInNewContext(js,{module:mod,exports:mod.exports});
  const paint=mod.exports.drawCurvedTextLine;
  for(const [curve,spacing] of [[0,0],[0,8],[25,0]]){
   const calls=[];
   const ctx={
    measureText:c=>({width:String(c).length*12}),
    strokeText:()=>calls.push('stroke'),fillText:()=>calls.push('fill'),
    save(){},restore(){},translate(){},scale(){},rotate(){}
   };
   paint(ctx,'OUTLINE',0,0,60,curve,600,spacing,true,false);
   assert.ok(calls.includes('stroke'),file+' stroke '+curve+'/'+spacing);
   assert.ok(!calls.includes('fill'),file+' hollow '+curve+'/'+spacing);
   calls.length=0;
   paint(ctx,'FILLED',0,0,60,curve,600,spacing,true,true);
   assert.ok(calls.includes('stroke')&&calls.includes('fill'),file+' filled '+curve+'/'+spacing);
  }
 }
});

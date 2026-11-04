import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const read=p=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8');

const source=read('CurvedText.ts');
const js=ts.transpileModule(source,{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}
}).outputText;
const {drawCurvedTextLine,clampTextCurve}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));

function glyphCanvas(){
  const rotations=[],translations=[],paint=[],strokes=[];
  const ctx={
    measureText:letter=>({width:letter===' '?10:24}),
    save(){},restore(){},
    translate(x,y){translations.push([x,y])},
    rotate(angle){rotations.push(angle)},scale(){},
    fillText(ch,x,y){paint.push([ch,x,y])},
    strokeText(ch,x,y){strokes.push([ch,x,y])}
  };
  return {ctx,rotations,translations,paint,strokes};
}

test('The Lab curves real editable glyphs along a circular arc in both directions',()=>{
  for(const bend of [50,-50]){
    const stage=glyphCanvas();
    drawCurvedTextLine(stage.ctx,'SEAMLESS',20,50,76,bend,800,4,true);
    assert.equal(stage.paint.length,8);
    assert.equal(stage.strokes.length,8);
    assert.ok(stage.rotations.some(v=>Math.abs(v)>.1));
    assert.ok(stage.translations.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)));
  }
  assert.equal(clampTextCurve(150),100);
  assert.equal(clampTextCurve(-300),-100);
  assert.equal(clampTextCurve(Number.NaN),0);
});

test('Preview and PNG exports use identical curved layer painter and text geometry',()=>{
  const preview=read('TouchLayerCanvas.tsx');
  const layers=read('PanoramaLayers.ts');
  const factory=read('CarouselFactory.tsx');
  assert.ok(preview.includes('paintPanoramaTextLayer(ctx,layer,w,h)'));
  assert.ok(layers.includes('paintPanoramaTextLayer(ctx,layer,w,h)'));
  assert.ok(layers.includes('drawCurvedTextLine(ctx,line,x,y,size,curve,maxWidth'));
  assert.ok(factory.includes('renderAllSlides(quality)'));
  assert.ok(preview.includes('value={chosen.curve||0}'));
  assert.ok(preview.includes('onUpdate(chosen.id,{curve:Number(e.target.value)})'));
});

test('Curved text is persisted independently of the private Studio',()=>{
  const layers=read('PanoramaLayers.ts');
  const factory=read('CarouselFactory.tsx');
  const translations=read('LabLocale.ts');
  assert.ok(layers.includes('curve:clampTextCurve(Number(item.curve)||0)'));
  assert.ok(factory.includes('curve:source.curve'));
  assert.ok(factory.includes('spacing:0,curve:0'));
  for(const label of ['Curva de texto','Text curve','Arco','Smile','Sonrisa']){
    assert.ok(translations.includes(label),label);
  }
});

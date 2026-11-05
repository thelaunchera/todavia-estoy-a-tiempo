import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Studio and Content Lab share persistent circular text curvature without sharing projects',()=>{
 const studio=read('../estudio-control/src/SeamlessEditor.tsx');
 const studioCurve=read('../estudio-control/src/curved-text.ts');
 const lab=read('src/TouchLayerCanvas.tsx');
 const preview=read('src/CurvedTextPreview.tsx');
 const layers=read('src/PanoramaLayers.ts');
 const curve=read('src/CurvedText.ts');
 assert.match(studio,/activeInspector==='curve'/);
 assert.match(studio,/Curvar texto/);
 assert.match(studio,/fontFamily\?:string/);
 assert.match(studio,/textOutline\?:boolean/);
 assert.match(studio,/studioTextFont\(it.fontFamily\)/);
 assert.match(studioCurve,/drawCurvedTextLine/);
 assert.match(curve,/drawCurvedTextLine/);
 assert.match(lab,/CurvedTextPreview/);
 assert.match(lab,/aria-label="Curvar texto"/);
 assert.match(lab,/onUpdate\(chosen.id,\{curve:Number\(e.target.value\)\}\)/);
 assert.match(layers,/curve\?:number/);
 assert.match(layers,/typeof item.curve==='number'/);
 assert.match(layers,/drawCurvedTextLine\(ctx,line/);
 assert.match(preview,/textPaint\(ctx,layer,width,height\)/);
 assert.doesNotMatch(studio,/setArtStyle\(/,'Studio editor must remain independent from buyer projects');
});
test('Studio imports only the four neutral editable shapes from Lab functionality',()=>{
 const studio=read('../estudio-control/src/SeamlessEditor.tsx');
 const library=read('../estudio-control/src/BrandAssetLibrary.tsx');
 const shapes=read('../estudio-control/src/studio-shapes.ts');
 assert.match(library,/onShape\?\:/);
 assert.match(library,/filteredShapes\.map/);
 assert.match(library,/studioShapeData\(shape.id,shape.color\)/);
 assert.match(studio,/onShape=\{addShape\}/);
 assert.match(studio,/recolorShape\(/);
 for(const id of ["paper","tape","circle","frame"])assert.match(shapes,new RegExp("'"+id+"'"));
});

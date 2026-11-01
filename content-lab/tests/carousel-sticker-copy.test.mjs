import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const read=(name)=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
const compile=(name,imports={})=>{
 const m={exports:{}};
 const compiled=ts.transpileModule(read(name),{compilerOptions:{
  module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022
 }}).outputText;
 runInNewContext(compiled,{
  module:m,exports:m.exports,require:(path)=>{
   if(!(path in imports))throw Error('Unexpected module '+path);
   return imports[path];
  }
 });
 return m.exports;
};
const geometry=compile('TouchGeometry.ts',{'./PhotoCrop':{
 normalizeCrop:crop=>crop
}});
const {copyStickerToSlide}=compile('CarouselStickerCopy.ts',{'./TouchGeometry':geometry});
const value=(obj)=>JSON.parse(JSON.stringify(obj));

test('copies precise saved position, rotation and rounding while protecting both slides',()=>{
 const position={x:.18,y:.63,w:.33,h:.24,angle:-17,cornerRadius:21};
 const source={key:'s1',title:'First',backgroundId:'blue',backgroundImageId:'img-bg',
   stickerIds:['book','candle'],stickerPositions:{candle:position}};
 const target={key:'s2',title:'Second',backgroundId:'rose',backgroundImageId:'other-bg',
   assetId:'photo-2',stickerIds:['flower'],stickerPositions:{flower:{x:.6,y:.2,w:.2,h:.3,angle:9}}};
 const before=value([source,target]);
 const result=copyStickerToSlide([source,target],0,1,'candle');
 assert.equal(result.result,'copied');
 assert.deepEqual(value(result.slides[1].stickerIds),['flower','candle']);
 assert.deepEqual(value(result.slides[1].stickerPositions.candle),position);
 assert.deepEqual(value(result.slides[1].stickerPositions.flower),before[1].stickerPositions.flower);
 assert.equal(result.slides[1].backgroundId,'rose');
 assert.equal(result.slides[1].backgroundImageId,'other-bg');
 assert.equal(result.slides[1].assetId,'photo-2');
 assert.equal(result.slides[1].title,'Second');
 assert.strictEqual(result.slides[0],source);
 assert.deepEqual(value([source,target]),before);
});

test('unsaved source sticker uses the original visible default position, not the target default',()=>{
 const slides=[
  {stickerIds:['other','book'],stickerPositions:{}},
  {stickerIds:[],stickerPositions:{}}
 ];
 const result=copyStickerToSlide(slides,0,1,'book');
 assert.equal(result.result,'copied');
 assert.deepEqual(value(result.slides[1].stickerPositions.book),value(geometry.clampRect(geometry.stickerDefault(1))));
 assert.notDeepEqual(value(result.slides[1].stickerPositions.book),value(geometry.clampRect(geometry.stickerDefault(0))));
});

test('never removes target stickers or moves already-present copies',()=>{
 const source={stickerIds:['book'],stickerPositions:{book:{x:.1,y:.2,w:.3,h:.3,angle:8}}};
 const full={stickerIds:['a','b','c'],stickerPositions:{}};
 const existing={stickerIds:['book'],stickerPositions:{book:{x:.65,y:.5,w:.2,h:.2,angle:0}}};
 assert.equal(copyStickerToSlide([source,full],0,1,'book').result,'full');
 assert.equal(copyStickerToSlide([source,existing],0,1,'book').result,'exists');
 assert.strictEqual(copyStickerToSlide([source,existing],0,1,'book').slides[1],existing);
 assert.equal(copyStickerToSlide([source,full],0,0,'book').result,'invalid');
 assert.equal(copyStickerToSlide([source,full],0,1,'not-present').result,'invalid');
});

test('selected-sticker menu exposes copy destinations without modifying source',()=>{
 const ui=read('FreeDecorControls.tsx'),factory=read('CarouselFactory.tsx');
 assert.ok(ui.includes('Copiar a…'));
 assert.ok(ui.includes('onCopySticker(id,n)'));
 assert.ok(ui.includes("filter(n=>n!==slideNumber-1)"));
 assert.ok(ui.includes("setFeedback('El slide '+(n+1)+' ya tiene 3 stickers."));
 assert.ok(factory.includes('copyStickerToSlide(slides,i,targetIndex,stickerId)'));
 assert.ok(factory.includes('onCopySticker={copySticker}'));
 assert.ok(factory.includes('slideCount={slides.length}'));
});

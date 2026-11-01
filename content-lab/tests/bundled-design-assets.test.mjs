import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const moduleSource=read('src/BundledDesignAssets.ts').replace('import.meta.env.BASE_URL',JSON.stringify('/content-lab/'));
const compiled=ts.transpileModule(moduleSource,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const bundle=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));

test('Release delivers 20 original inspiring PNG stickers with alpha and 20 individual portrait backgrounds',()=>{
 const files=bundle.BUNDLED_DESIGN_ASSETS;
 assert.equal(files.filter(x=>x.category==='sticker').length,20);
 assert.equal(files.filter(x=>x.category==='background').length,20);
 assert.equal(new Set(files.map(x=>x.id)).size,40);
 assert.equal(new Set(files.map(x=>x.sha256)).size,40);
 for(const file of files){
  assert.match(file.file,/^resources\/editorial-2026-11\/(stickers|backgrounds)\/[a-z0-9-]+\.png$/);
  const bytes=readFileSync(resolve(root,'public',file.file));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(bytes.length,file.sizeBytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
  const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);
  assert.equal(w,file.width);assert.equal(h,file.height);assert.ok(w>=1080&&h>=1080);
  if(file.category==='sticker'){
   assert.equal(bytes[25],6,'stickers must be RGBA PNGs');
   assert.ok(file.phrase&&file.name===file.phrase);
   assert.equal(file.stickerGroup,'Inspiración');
  }else assert.ok(Math.abs(w/h-.8)<.002,'backgrounds must be individual 4:5 compositions');
 }
});

test('Curation hides a release resource from browsing while retaining its saved-design identity',()=>{
 const sticker=bundle.BUNDLED_DESIGN_ASSETS.find(x=>x.category==='sticker');
 assert.equal(bundle.bundledDesignAssets('sticker',[sticker.id]).length,19);
 assert.equal(bundle.bundledDesignAssets('background',[sticker.id]).length,20);
 assert.equal(bundle.findBundledDesignAsset(sticker.id).file,sticker.file);
 assert.equal(bundle.findBundledDesignAsset('../private-photo'),undefined);
 assert.equal(bundle.bundledDesignAssetUrl(sticker,'/content-lab'),'/content-lab/'+sticker.file);
 assert.equal(bundle.bundledDesignAssetUrl(sticker,'/content-lab/'),'/content-lab/'+sticker.file);
});

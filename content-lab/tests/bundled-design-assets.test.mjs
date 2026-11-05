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

test('Release preserves the original library and adds the seasonal and Pinterest collections',()=>{
 const files=bundle.BUNDLED_DESIGN_ASSETS;
 assert.equal(files.filter(x=>x.category==='sticker'&&x.stickerGroup==='Inspiración').length,20);
 assert.equal(files.filter(x=>x.category==='sticker'&&x.file.startsWith('resources/premium-stickers-2026-11/')).length,19);
 assert.equal(files.filter(x=>x.category==='sticker'&&x.file.startsWith('resources/branding-marketing-stickers-2026-11/')).length,8);
 assert.equal(files.filter(x=>x.file.startsWith('resources/creative-stickers-2026-11-05/')).length,8);
 assert.equal(files.filter(x=>x.file.startsWith('resources/branding-elements-2026-11/')).length,8);
 assert.equal(files.filter(x=>x.file.startsWith('resources/pinterest-aesthetic-stickers-2026-11/')).length,20);
 assert.equal(files.filter(x=>x.category==='sticker'&&x.stickerGroup==='Branding y Marketing').length,16);
 assert.equal(files.filter(x=>x.category==='sticker').length,99);
 assert.equal(files.filter(x=>x.category==='background').length,20);
 assert.equal(new Set(files.map(x=>x.id)).size,119);
 assert.equal(new Set(files.map(x=>x.sha256)).size,119);
 for(const file of files){
  assert.match(file.file,/^resources\/(?:editorial-2026-11\/(?:stickers|backgrounds)\/[a-z0-9-]+|premium-stickers-2026-11\/[a-z0-9_]+|branding-marketing-stickers-2026-11\/[a-z0-9_]+|creative-stickers-2026-11-05\/[a-z0-9_]+|pinterest-aesthetic-stickers-2026-11\/[a-z0-9_]+|(?:branding-elements-2026-11|holiday-stickers-2026-11)\/[a-z0-9-]+)\.png$/);
  const bytes=readFileSync(resolve(root,'public',file.file));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(bytes.length,file.sizeBytes,'Original PNG size differs for '+file.file+' — restore the approved original, do not change its manifest to match a damaged upload');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,'Original PNG hash differs for '+file.file+' — restore the source image');
  assert.equal(bytes.subarray(-12).toString('hex'),'0000000049454e44ae426082','PNG is missing or has a damaged IEND chunk: '+file.file);
  const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);
  assert.equal(w,file.width);assert.equal(h,file.height);
  if(file.file.startsWith('resources/branding-elements-2026-11/')){
   assert.ok(Math.min(w,h)>=512&&Math.max(w,h)>=1200,'elements preserve their native resolution');
  }else assert.ok(w>=1024&&h>=1024);
  if(file.category==='sticker'){
   if(file.file.startsWith('resources/premium-stickers-2026-11/')){
    assert.ok(bytes[25]===6||(bytes[25]===3&&bytes.includes(Buffer.from('tRNS'))),'premium stickers must retain alpha transparency');
    assert.equal(w,1536);assert.equal(h,1536);
    assert.ok(['Avatares','Animales','Creación','Negocios'].includes(file.stickerGroup));
    assert.ok(file.name.trim());
   }else if(file.file.startsWith('resources/branding-marketing-stickers-2026-11/')){
    assert.ok(bytes[25]===6||(bytes[25]===3&&bytes.includes(Buffer.from('tRNS'))),'branding stickers must retain transparent backgrounds');
    assert.equal(w,1254);assert.equal(h,1254);
    assert.equal(file.stickerGroup,'Branding y Marketing');
    assert.ok(file.name.trim());
   }else if(file.file.startsWith('resources/creative-stickers-2026-11-05/')){
    assert.equal(bytes[25],6,'creative stickers must retain RGBA transparency');
    assert.ok(['Animales','Creación','Negocios'].includes(file.stickerGroup));
    assert.ok(file.name.trim());
   }else if(file.file.startsWith('resources/branding-elements-2026-11/')){
    assert.equal(bytes[25],6,'branding elements retain RGBA transparency');
    assert.ok(file.name.trim());
   }else if(file.file.startsWith('resources/holiday-stickers-2026-11/')){
    assert.equal(bytes[25],6);
    assert.equal(file.stickerGroup,'Temporadas');
    assert.ok(file.name.trim());
   }else if(file.file.startsWith('resources/pinterest-aesthetic-stickers-2026-11/')){
    assert.equal(bytes[25],6,'Pinterest stickers retain RGBA transparency');
    assert.equal(file.stickerGroup,'Pinterest aesthetic');
    assert.ok(file.name.trim());
   }else{
    assert.equal(bytes[25],6,'original stickers must be RGBA PNGs');
    assert.ok(file.phrase&&file.name===file.phrase);
    assert.equal(file.stickerGroup,'Inspiración');
   }
  }else assert.ok(Math.abs(w/h-.8)<.002,'backgrounds must be individual 4:5 compositions');
 }
});

test('Curation hides a release resource from browsing while retaining its saved-design identity',()=>{
 const sticker=bundle.BUNDLED_DESIGN_ASSETS.find(x=>x.category==='sticker');
 assert.equal(bundle.bundledDesignAssets('sticker',[sticker.id]).length,98);
 assert.equal(bundle.bundledDesignAssets('background',[sticker.id]).length,20);
 assert.equal(bundle.findBundledDesignAsset(sticker.id).file,sticker.file);
 assert.equal(bundle.findBundledDesignAsset('../private-photo'),undefined);
 assert.equal(bundle.bundledDesignAssetUrl(sticker,'/content-lab'),'/content-lab/'+sticker.file);
 assert.equal(bundle.bundledDesignAssetUrl(sticker,'/content-lab/'),'/content-lab/'+sticker.file);
});

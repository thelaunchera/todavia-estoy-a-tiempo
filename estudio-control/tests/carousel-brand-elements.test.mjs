import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=JSON.parse(read('src/golden-grid-carousel-assets.ts').match(/GOLDEN_GRID_CAROUSEL_ASSETS = (\[[\s\S]*?\]) as const/)[1]);
const editor=read('src/SeamlessEditor.tsx');
test('Golden Grid kit contains nine real individual transparent assets',()=>{
 assert.equal(catalog.length,9);
 assert.equal(new Set(catalog.map(a=>a.id)).size,9);
 for(const asset of catalog){
  assert.ok(asset.name&&asset.width>0);
  assert.ok(existsSync(new URL('../public/brand-kits/golden-grid/'+asset.file,import.meta.url)),asset.file);
  if(asset.file.endsWith('.svg')){
   const svg=read('public/brand-kits/golden-grid/'+asset.file);
   assert.match(svg,/<svg[^>]+viewBox=/);
   assert.doesNotMatch(svg,/<(?:script|foreignObject|image|text)\b/i);
  }
 }
});
test('placing a banner appends a selectable image without replacing the document',()=>{
 assert.match(editor,/await loadImage\(src\)/);
 assert.match(editor,/items:\[\.\.\.d.items,\{id,kind:'image',src/);
 assert.match(editor,/setSelected\(id\);setQuickPanel\(null\)/);
 assert.match(editor,/onClick=\{\(\)=>void addGoldenGridAsset\(asset\)\}/);
 assert.match(editor,/document.baseURI/);
});
test('banner library is discoverable in Studio with the original Drive kit and photo guidance',()=>{
 assert.match(editor,/Golden Grid · Cintas y banners/);
 assert.match(editor,/Añadir al lienzo/);
 assert.match(editor,/Añade el texto por separado/);
 assert.match(editor,/Fotos recomendadas/);
 assert.match(read('src/golden-grid-carousel-assets.ts'),/1MTmCioPbfZ6GAPg2Mzqw0BBvcLCTiFsv/);
});

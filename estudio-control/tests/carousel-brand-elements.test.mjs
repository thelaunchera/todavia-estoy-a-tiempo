import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const parse=(file,symbol)=>JSON.parse(read(file).match(new RegExp(symbol+' = (\\\\[[\\\\s\\\\S]*?\\\\]) as const'))[1]);
const golden=parse('src/golden-grid-carousel-assets.ts','GOLDEN_GRID_CAROUSEL_ASSETS');
const editorial=parse('src/editorial-sticker-assets.ts','EDITORIAL_STICKER_ASSETS');
const editor=read('src/SeamlessEditor.tsx');
const gallery=read('src/BrandAssetLibrary.tsx');
test('Golden Grid keeps its nine individual approved elements',()=>{
 assert.equal(golden.length,9);
 assert.equal(new Set(golden.map(a=>a.id)).size,9);
 for(const asset of golden)assert.ok(existsSync(new URL('../public/brand-kits/golden-grid/'+asset.file,import.meta.url)));
});
test('Twenty reusable transparent editorial stickers each have their own SVG',()=>{
 assert.equal(editorial.length,20);
 assert.equal(new Set(editorial.map(a=>a.id)).size,20);
 for(const a of editorial){
  assert.ok(a.name&&a.category&&a.width>0);
  const p='public/brand-kits/editorial-stickers/'+a.file;
  assert.ok(existsSync(new URL('../'+p,import.meta.url)),a.file);
  const svg=read(p);
  assert.match(svg,/<svg[^>]+viewBox=/);
  assert.doesNotMatch(svg,/<(?:script|foreignObject|image|text)\b/i);
 }
});
test('Studio uses one categorized searchable library with reusable assets',()=>{
 assert.match(gallery,/EDITORIAL_STICKER_ASSETS/);
 assert.match(gallery,/Filtrar tipo de elemento/);
 assert.match(gallery,/Buscar cintas, banners, asteriscos/);
 assert.match(gallery,/onEditorial\(a\.asset\)/);
 assert.doesNotMatch(gallery,/Filtrar elementos por marca/);
 assert.match(editor,/onEditorial=\{addEditorialAsset\}/);
 assert.match(editor,/await loadImage\(src\)/);
 assert.match(editor,/items:\[\.\.\.d\.items,\{id,kind:'image',src/);
 assert.match(editor,/document\.baseURI/);
});
test('Studio preserves source image quality and can hide pending carousel briefs',()=>{
 assert.match(editor,/Quitar todos de la lista/);
 assert.match(editor,/Quitar de pendientes/);
 assert.match(editor,/renderExportSlide/);
});

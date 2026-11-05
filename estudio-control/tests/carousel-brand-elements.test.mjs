import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const parse=(file,symbol)=>{const source=read(file);const marker=symbol+' = ';const start=source.indexOf(marker);assert.ok(start>=0);const tail=source.slice(start+marker.length);return JSON.parse(tail.slice(0,tail.indexOf(' as const;')))};
const golden=parse('src/golden-grid-carousel-assets.ts','GOLDEN_GRID_CAROUSEL_ASSETS');
const editorial=parse('src/editorial-sticker-assets.ts','EDITORIAL_STICKER_ASSETS');
const editor=read('src/SeamlessEditor.tsx');
const gallery=read('src/BrandAssetLibrary.tsx');
test('Golden Grid keeps its nine individual approved elements',()=>{
 assert.equal(golden.length,9);
 assert.equal(new Set(golden.map(a=>a.id)).size,9);
 for(const asset of golden)assert.ok(existsSync(new URL('../public/brand-kits/golden-grid/'+asset.file,import.meta.url)));
});
test('Thirty reusable transparent editorial stickers each have their own SVG',()=>{
 assert.equal(editorial.length,30);
 assert.equal(new Set(editorial.map(a=>a.id)).size,30);
 assert.equal(new Set(editorial.map(a=>a.file)).size,30);
 const additions=['asterisco-negro-organico','banner-negro-ondulado','sello-circular-tinta','cinta-negra-rasgada','destellos-trio-negro','sello-flor-festoneada','marco-negro-expresivo','subrayado-loop-negro','etiqueta-negra-perforada','rayos-minimalistas-negros'];
 for(const id of additions)assert.ok(editorial.some(a=>a.id===id),'missing '+id);

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
 assert.match(gallery,/onlyEditorial\?:boolean/);
 assert.match(editor,/quickPanel==='elementos'&&<BrandAssetLibrary compact/);
 assert.match(editor,/studio-sticker-gallery/);
 assert.doesNotMatch(editor,/<BrandAssetLibrary compact onlyEditorial onGolden=/,'Editorial and PNG stickers no longer repeat in both galleries');
 assert.match(editor,/await loadImage\(src\)/);
 assert.match(editor,/items:\[\.\.\.d\.items,\{id,kind:'image',src/);
 assert.match(editor,/document\.baseURI/);
});
test('Studio preserves source image quality and can hide pending carousel briefs',()=>{
 assert.match(editor,/Quitar todos de la lista/);
 assert.match(editor,/Quitar de pendientes/);
 assert.match(editor,/renderExportSlide/);
});

test('Studio safeguards existing carousel on interrupted IndexedDB restore and Safari suspend',()=>{
 assert.match(editor,/Promise\.allSettled\(\[readEditorRecord/);
 assert.match(editor,/if\(docResult\.status==='rejected'\)/);
 assert.match(editor,/if\(!storageReady\)return <section/);
 assert.match(editor,/if\(!storageReady\)\{\s*setMessage\(/);
 assert.match(editor,/document\.addEventListener\('visibilitychange',onHidden\)/);
 assert.match(editor,/window\.addEventListener\('pagehide',flush\)/);
});

test('Studio displays a canvas-first app workspace with the shared six-tool dock',()=>{
 const css=read('src/seamless-app.css');
 assert.ok(editor.indexOf('className="studio-app-canvas"')>=0);
 assert.ok(!editor.includes('aria-label="Biblioteca de elementos de marcas"'),'legacy stacked library must not precede canvas');
 assert.match(editor,/className="studio-app-admin"/);
 assert.match(editor,/ref=\{workspaceRef\}/);
 assert.match(editor,/workspaceRef\.current\?\.scrollIntoView/);
 assert.match(editor,/className="studio-app-slide-tray"/);
 assert.match(editor,/className="studio-app-toolbar"/);
 for(const label of ['Fotos','Texto','Stickers','Elementos','Fondo','Capas'])assert.ok(editor.includes("label:'"+label+"'"),label);
 assert.match(css,/\.studio-app-toolbar\{position:fixed!important/);
 assert.match(css,/\.studio-app-sheet\{/);
 assert.match(editor,/onClick=\{\(\)=>void downloadSlide\(slide\)\}/);
 assert.equal((editor.match(/ref=\{photoInput\}/g)||[]).length,1);
});

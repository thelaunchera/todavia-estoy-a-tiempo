import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const root=new URL('../src/',import.meta.url);
const source=readFileSync(new URL('./StudioLibraryOrganization.ts',root),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const lib=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));

test('Studio-style collections group legacy Aesthetic stickers by their art purpose',()=>{
 const examples={
  '04 lazo terciopelo rosa':'Lazos',
  '12 berry gingham tape':'Cintas',
  '24 estallido halftone azul':'Decorativos',
  '02 estrella dorada':'Estrellas',
  '07 marco editorial':'Marcos y etiquetas',
  '08 papel rasgado rosa':'Papeles y recortes',
  '25 content planner':'Branding',
  '37 sello floral':'Marcos y etiquetas',
  '09 gatito creador':'Animales',
  '04 rainy day girl':'Avatares',
  '03 osito Navidad':'Temporada',
  '10 matcha latte':'Matcha',
  '12 pilates reformer':'Pilates',
  '14 workout weights':'Ejercicios',
 };
 for(const [name,expected] of Object.entries(examples))
  assert.equal(lib.stickerCollectionFor({name,stickerGroup:'Aesthetic'}),expected,name);
 assert.equal(lib.stickerCollectionFor({name:'START WHERE YOU ARE',stickerGroup:'Inspiración'}),'Inspiración');
});

test('Private buyer sticker list is not shared with other accounts',()=>{
 const entries=[
  {name:'Marco azul',shared:true,stickerGroup:'Aesthetic'},
  {name:'Cinta mi marca',shared:false},
 ];
 assert.deepEqual(lib.visibleStickerCollections(entries).find(x=>x.label==='Mis stickers'),{label:'Mis stickers',count:1});
 assert.equal(lib.matchesStickerCollection(entries[0],'Mis stickers'),false);
 assert.equal(lib.matchesStickerCollection(entries[1],'Mis stickers'),true);
 assert.equal(lib.matchesStickerCollection(entries[1],'Todos'),true);
 assert.equal(lib.matchesStickerCollection(entries[0],'Marcos y etiquetas'),true);
 assert.equal(lib.matchesStickerCollection(entries[0],'Lazos'),false);
});

test('Historical wallpaper misfilings appear in backgrounds without duplicating storage or changing IDs',()=>{
 for(const name of lib.LEGACY_BACKGROUND_STICKER_ORIGINAL_NAMES){
  assert.equal(lib.legacyStickerIsBackground(name),true,name);
  assert.ok(['Editoriales','Papel y texturas'].includes(lib.legacyStickerBackgroundGroup(name)));
 }
 for(const name of ['14 celo rojo','01 flor rosa','28 torn paper label','01 zorra aventurera','03 blue gingham bow']){
  assert.equal(lib.legacyStickerIsBackground(name),false,name);
 }
 const client=readFileSync(new URL('./platform/client.ts',root),'utf8');
 assert.match(client,/filter\(item=>!legacyStickerIsBackground\(item\.name\)\)/);
 assert.match(client,/\.in\('name',\[\.\.\.LEGACY_BACKGROUND_STICKER_ORIGINAL_NAMES\]\)/);
 assert.match(client,/id:'shared-'\+item\.id/);
 assert.match(client,/backgroundGroup:legacyStickerBackgroundGroup\(item\.name\)/);
 const app=readFileSync(new URL('./App.tsx',root),'utf8');
 assert.match(app,/asset\.id\.startsWith\('shared-background-'\)/);
 assert.match(app,/sticker-catalog\/['\"]\+asset\.id\.slice\('shared-'\.length\)/);
});

test('Lab offers Studio-like collections, mobile lazy previews and a bounded grid',()=>{
 const gallery=readFileSync(new URL('./StickerDownloads.tsx',root),'utf8');
 assert.match(gallery,/Mis stickers/);
 assert.match(gallery,/visibleMatches=matches\.slice\(0,visibleLimit\)/);
 assert.match(gallery,/setVisibleLimit\(limit=>limit\+60\)/);
 assert.match(gallery,/IntersectionObserver/);
 assert.match(gallery,/matchesStickerCollection\(asset,category\)/);
});

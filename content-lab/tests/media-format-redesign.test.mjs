import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const file=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('20 editorial previews are unique interiors and preserve exact editor layout names',()=>{
 const gallery=file('src/FormatGallery.tsx'),composer=file('src/GridComposer.ts'),css=file('src/FormatGallery.css');
 const photoIds=[...gallery.matchAll(/\{id:'([^']+)'/g)].map(match=>match[1]);
 const spanishTitles=[...gallery.matchAll(/,es:'([^']+)'/g)].map(match=>match[1]);
 const layoutNames=[...composer.matchAll(/\{name:'([^']+)'/g)].map(match=>match[1]);
 assert.equal(photoIds.length,20);
 assert.equal(new Set(photoIds).size,20);
 assert.equal(spanishTitles.length,20);
 assert.equal(new Set(spanishTitles).size,20);
 assert.equal(layoutNames.length,20);
 assert.ok(gallery.includes('LAYOUTS.map((layout,index)'));
 assert.ok(gallery.includes('onChoose(layout.name)'));
 assert.ok(gallery.includes('boxPosition(layout.image)'));
 assert.ok(gallery.includes('boxPosition(layout.type)'));
 assert.ok(gallery.includes("fg-variant-"));
 assert.ok(css.includes('.fg-variant-19'));
 assert.ok(css.includes('.fg-sheet-backdrop'));
 assert.ok(!gallery.includes('clase-retrato-laptop-real-2026.jpg'));
 assert.ok(!gallery.includes('diario-carta-20261027.jpg'));
 assert.ok(!gallery.includes('clase-mostrar-web-2026.webp'));
 assert.ok(!gallery.includes('ownPhotos'));
 assert.ok(composer.includes('photos.preserve&&photos.original'));
 assert.ok(composer.includes('const scale=Math.min(ow/im.naturalWidth,oh/im.naturalHeight)'));
});
test('private library includes real uploads, rename, category switching and two separate image roles',()=>{
 const app=file('src/App.tsx'),lib=file('src/MediaLibrary.tsx'),client=file('src/platform/client.ts');
 assert.ok(app.includes('category,displayName:'));
 assert.ok(client.includes("if(m[1]==='assets')"));
 assert.ok(client.includes("patch.displayName"));
 assert.ok(lib.includes('Foto original · sujeto'));
 assert.ok(lib.includes('Referencia visual · estilo'));
 assert.ok(lib.includes('Usar como referencia fija'));
 assert.ok(lib.includes("onUpdate(data as LibraryAsset)"));
 assert.ok(lib.includes("setSourceId('');setReferenceId('');setFilter('all')"));
});
test('selected format and uploaded reference flow into actual private Brand Grid plan',()=>{
 const app=file('src/App.tsx'),grid=file('src/BrandGrid.tsx'),edge=file('supabase/functions/content-lab-generate/index.ts');
 assert.ok(app.includes('initialSelection={gridPref}'));
 assert.ok(app.includes('brandId:brand.id,sourceId,referenceId'));
 assert.ok(app.includes('brandId:brand.id,format'));
 assert.ok(grid.includes("chosenFormat&&g.posts.length"));
 assert.ok(grid.includes("response=await api.put('/api/grids/'+g.id,{posts})"));
 assert.ok(grid.includes("initialSelection.brandId!==brand.id"));
 assert.ok(edge.includes("SECOND IMAGE STYLE LIMIT"));
 assert.ok(edge.includes('allowedReferenceFocus'));
});


test('every editorial format reserves separate text and photo space, also on iPhone',()=>{
 const composer=file('src/GridComposer.ts'),css=file('src/FormatGallery.css'),gallery=file('src/FormatGallery.tsx');
 const matches=[...composer.matchAll(/\{name:'([^']+)',image:\[([^\]]+)\],type:\[([^\]]+)\]/g)];
 assert.equal(matches.length,20,'twenty authored image/text geometries');
 const numberList=value=>value.split(',').map(x=>Number(x.trim()));
 const intersection=(a,b)=>{
  const overlapX=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]));
  const overlapY=Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));
  return overlapX*overlapY;
 };
 for(const m of matches){
  const photo=numberList(m[2]),copy=numberList(m[3]);
  for(const rect of [photo,copy]){
   assert.equal(rect.length,4,m[1]+' geometry');
   assert.ok(rect.every(Number.isFinite),m[1]+' values must be numbers');
   assert.ok(rect[0]>=0&&rect[1]>=0&&rect[0]+rect[2]<=1.001&&rect[1]+rect[3]<=.94,
    m[1]+' must stay within image and footer safe zone');
  }
  assert.equal(intersection(photo,copy),0,m[1]+' text must never cross its photo');
 }
 assert.match(css,/\.fg-preview-copy strong\{[^}]*text-wrap:balance/s);
 assert.match(css,/@media\(max-width:580px\)[\s\S]*?\.fg-cards\{grid-template-columns:minmax\(0,1fr\)/);
 assert.ok(gallery.includes('const fit=()=>'), 'fonts resize to their actual safe box');
 assert.ok(gallery.includes('sampleCredits[index]'), 'do not stamp the same placeholder brand on all posters');
 assert.ok(gallery.includes("locale==='es'?example.es:example.en"),'preview follows selected language');
});

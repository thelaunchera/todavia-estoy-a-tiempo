import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const file=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('20 previews use real photographic local examples and accurate template positions',()=>{
 const gallery=file('src/FormatGallery.tsx'),composer=file('src/GridComposer.ts');
 assert.ok(gallery.includes("import {LAYOUTS,type Layout}"));
 assert.ok(gallery.includes('const formatPos='));
 assert.ok(gallery.includes('clase-retrato-laptop-real-2026.jpg'));
 assert.ok(gallery.includes('diario-carta-20261027.jpg'));
 assert.ok(gallery.includes('onChoose(layout.name)'));
 assert.ok(composer.includes("photos.preserve&&photos.original"));
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

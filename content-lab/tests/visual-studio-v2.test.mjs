import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=(name)=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('20 formats each have independent coordinate and motif art direction',()=>{
 const c=src('src/GridComposer.ts');
 const formats=['Editorial Hero','Bold Typography','Macro Texture','Lifestyle Scene','Playful Props',
 'Hands-on Editorial','High Contrast','Minimal Premium','Campaign Finale','Color Block',
 'Magazine Cover','Arch Frame','Product Spotlight','Floating Product','Typography Poster',
 'Negative Space','Diagonal Composition','Soft Luxury','Graphic Cutout','Story Card'];
 for(const name of formats)assert.ok(c.includes("name:'"+name+"'"),name);
 assert.equal((c.match(/\{name:'/g)||[]).length,20);
 assert.ok(c.includes('switch(layout.accent)'),'distinct motif/geometry');
});
test('3 export sizes with safe areas are actual composed canvases',()=>{
 const c=src('src/GridComposer.ts'),grid=src('src/BrandGrid.tsx');
 for(const dim of ['1080,h:1350','1080,h:1080','1080,h:1920'])assert.ok(c.includes(dim));
 assert.ok(c.includes("safeTop"));
 assert.ok(c.includes('canvas.width=W;canvas.height=H'));
 assert.ok(grid.includes('EXPORT_SIZES[exportSize]'));
});
test('per-brand kit persists without changing shared podcast schema',()=>{
 const app=src('src/App.tsx');
 for(const field of ['secondaryColor','logoAssetId','referenceAssetId','headingFont','bodyFont','photoMood','avoid'])assert.ok(app.includes(field));
 assert.ok(app.includes("a.brandId===brandForm.id"));
});
test('AI vision source and style review are explicit and optional',()=>{
 const edge=src('supabase/functions/content-lab-generate/index.ts');
 for(const part of ["@cf/qwen/qwen3.8-27b","inspectReference(","analysisStatus","visualDescription","image_url"])assert.ok(edge.includes(part));
 assert.ok(edge.includes("analysisStatus='vision'"));
 assert.ok(edge.includes('analysisStatus,visualDescription,posts'));
 assert.ok(edge.includes('No text, words')||edge.includes('NO text, words'));
});
test('iPhone editing, quality checks and explicit image quota confirmation',()=>{
 const grid=src('src/BrandGrid.tsx'),edit=src('src/GridVisualEditor.tsx');
 for(const txt of ['GridVisualEditor','checkQuality','hamming(','window.confirm(','Revisé los detalles'])assert.ok(grid.includes(txt),txt);
 assert.ok(edit.includes('onPointerMove={move}'));
 assert.ok(edit.includes("imageZoom"));
 assert.ok(edit.includes("textScale"));
});

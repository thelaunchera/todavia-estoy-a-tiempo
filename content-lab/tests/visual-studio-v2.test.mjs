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
 for(const txt of ['GridVisualEditor','checkQuality','hamming(','window.confirm(','He revisado las nueve imágenes'])assert.ok(grid.includes(txt),txt);
 assert.ok(edit.includes('onPointerMove={move}'));
 assert.ok(edit.includes("imageZoom"));
 assert.ok(edit.includes("textScale"));
});

test('mobile review checkbox uses a real 20px column instead of global 100%-wide input',()=>{
 const styles=src('src/BrandGrid.css');
 const grid=src('src/BrandGrid.tsx');
 assert.ok(styles.includes('.bg-qa-confirm input[type="checkbox"]'));
 assert.ok(styles.includes('width:20px!important'));
 assert.ok(styles.includes('grid-template-columns:22px minmax(0,1fr)'));
 assert.ok(grid.includes('<span>He revisado las nueve imágenes'));
 assert.ok(grid.includes('gridPending===0'));
});
test('photo frame can be moved and resized separately from crop/zoom',()=>{
 const composer=src('src/GridComposer.ts'),editor=src('src/GridVisualEditor.tsx');
 for(const key of ['frameX','frameY','frameScale']){assert.ok(composer.includes(key));assert.ok(editor.includes(key));}
 assert.ok(editor.includes("if(layer==='photo')onChange({...from,frameX:"));
 assert.ok(gridSource().includes('Vista previa de diseño'));
 function gridSource(){return src('src/BrandGrid.tsx');}
});
test('grid QA reports aggregate pending count, not nine repetitive warnings',()=>{
 const grid=src('src/BrandGrid.tsx');
 assert.ok(grid.includes('pending++'));
 assert.ok(grid.includes("pending+' de 9 publicaciones sin diseño exportable"));
 assert.ok(!grid.includes("found.push('Post '+(i+1)+': imagen pendiente.')"));
});

test('fixed Content Lab sidebar scrolls independently on mobile Safari',()=>{
 const css=src('src/index.css'),app=src('src/App.tsx');
 const sidebar=css.slice(css.indexOf('.sidebar {'),css.indexOf('.identity {'));
 for(const declaration of ['height: 100dvh','max-height: 100dvh','overflow-y: auto','overscroll-behavior-y: contain','-webkit-overflow-scrolling: touch','touch-action: pan-y','safe-area-inset-bottom']) {
  assert.ok(sidebar.includes(declaration),declaration);
 }
 assert.ok(css.includes('.sidebar-close {'));
 assert.ok(css.includes('flex-shrink: 0;'));
 assert.ok(app.includes('className="sidebar-close"'));
 assert.ok(app.includes('document.body.style.overflow'));
 assert.ok(app.includes('aria-expanded={menu}'));
});

test('home dashboard gives three-step guided flow plus iPhone dock',()=>{
 const app=src('src/App.tsx'),css=src('src/index.css');
 assert.ok(app.includes('setupStepsDone'));
 assert.ok(app.includes('lab-quick-steps'));
 assert.ok(app.includes('lab-mobile-dock'));
 assert.ok(css.includes('env(safe-area-inset-bottom)'));
 assert.ok(app.includes("onClick={()=>navigate('grid')}"));
});
test('grid edits autosave without exposing data in local browser storage',()=>{
 const grid=src('src/BrandGrid.tsx');
 assert.ok(grid.includes('saveQueue.current'));
 assert.ok(grid.includes('savedSignature.current'));
 assert.ok(grid.includes('setTimeout(()=>{'));
 assert.ok(grid.includes("'/api/grids/'+key"));
 assert.ok(grid.includes('Guardado automático pendiente'));
 assert.ok(grid.includes('Reintentar'));
 assert.ok(!grid.includes('localStorage.setItem'));
});
test('buyers approve exact AI credit cost for photos, plans and batches',()=>{
 const grid=src('src/BrandGrid.tsx');
 assert.ok(grid.includes("askCredits('creative',3"));
 assert.ok(grid.includes("askCredits('photo',1"));
 assert.ok(grid.includes("askCredits('photo',remaining"));
 assert.ok(grid.includes("role=\"dialog\""));
 assert.ok(grid.includes("creditDecision.current?.(answer)"));
 assert.ok(grid.includes('units>available(kind)'));
 assert.ok(!grid.includes("window.confirm('La IA generará"));
});
test('iPhone editor debounces canvas preview and hides expert controls until needed',()=>{
 const editor=src('src/GridVisualEditor.tsx');
 assert.ok(editor.includes('setTimeout(()=>{'));
 assert.ok(editor.includes('},120)'));
 assert.ok(editor.includes('aria-expanded={advanced}'));
 assert.ok(editor.includes('{advanced&&<>'));
});

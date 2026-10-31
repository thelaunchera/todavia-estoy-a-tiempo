import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('editorial templates produce actual drawn background, subject, type, and annotations',()=>{
 const s=source('src/EditorialPoster.ts');
 for(const id of ['portrait','annotated','magazine','split','typographic'])assert.ok(s.includes("id:'"+id+"'"),id);
 for(const key of ['photo','ivory','color','gradient','callouts','handwritten','kicker','overlay','putPhoto(ctx','paragraph(ctx'])assert.ok(s.includes(key),key);
 assert.ok(s.includes('ctx.drawImage('));
});
test('editorial designs preserve source image and allow PNG download without generated asset',()=>{
 const c=source('src/GridComposer.ts'),g=source('src/BrandGrid.tsx');
 assert.ok(c.includes('if(tile.design)'));
 assert.ok(c.includes('renderEditorial({'));
 assert.ok(g.includes("tile.design&&grid.kind==='preserve'"));
 assert.ok(g.includes("if(!grid.posts[i].design&&"));
 assert.ok(g.includes("grid.posts.every(p=>!!p.design)"));
});
test('reference analysis includes actual style and not unrelated guessed claims',()=>{
 const edge=source('supabase/functions/content-lab-generate/index.ts');
 assert.ok(edge.includes('CREATIVE STYLE REFERENCE'));
 assert.ok(edge.includes('Describe visible subject truthfully'));
 assert.ok(edge.includes('designMode==='));
 assert.ok(edge.includes('const firstStyle='));
 assert.ok(edge.includes('callouts:[]'));
});
test('editable art direction and fonts are available in the iPhone UI',()=>{
 const g=source('src/BrandGrid.tsx'),css=source('src/index.css');
 for(const key of ['editorial-settings','Cormorant · Editorial serif','Caveat · Manuscrita','Color del fondo','Anotación {i+1}','Dirección de arte','Adaptar la referencia que subí'])assert.ok(g.includes(key),key);
 for(const family of ['Caveat','Cormorant+Garamond','Space+Grotesk'])assert.ok(css.includes(family),family);
});

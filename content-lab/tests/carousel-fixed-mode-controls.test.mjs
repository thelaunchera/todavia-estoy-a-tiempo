import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('iPad and iPhone keep a compact Deslizar/Editar switch while scrolling',()=>{
 const editor=read('src/TouchLayerCanvas.tsx');
 const css=read('src/TouchLayerCanvas.css');
 assert.ok(editor.includes("const [floatingModeBar,setFloatingModeBar]=useState(false)"));
 assert.ok(editor.includes("window.addEventListener('scroll',schedule,true)"));
 assert.ok(editor.includes("window.removeEventListener('scroll',schedule,true)"));
 assert.ok(editor.includes("const visible=bar.bottom<12&&area.bottom>100&&area.top<height-30"));
 assert.ok(editor.includes("createPortal("));
 assert.ok(editor.includes('touch-editor-floating-mode'));
 assert.ok(editor.includes("onClick={()=>switchMode('navigate')}"));
 assert.ok(editor.includes("onClick={()=>switchMode('edit')}"));
 assert.ok(editor.includes('{activePage+1} / {pageCount}'));
 assert.ok(css.includes('.touch-editor-floating-mode{'));
 assert.ok(css.includes('position:fixed'));
 assert.ok(css.includes('env(safe-area-inset-top'));
 assert.ok(css.includes('min-height:44px'));
 assert.ok(css.includes('@media(min-width:761px) and (max-width:1180px)'));
});

test('Private Studio seamless carousel retains the same touch-first tools',()=>{
 const studio=read('../estudio-control/src/SeamlessEditor.tsx');
 const route=read('../estudio-control/src/Studio.tsx');
 assert.ok(route.includes("<SeamlessEditor />"));
 assert.ok(studio.includes('Herramientas táctiles del carrusel seamless'));
 for(const tool of ["label:'Fotos'","label:'Texto'","label:'Stickers'","label:'Capas'","label:'Fondo'"])
  assert.ok(studio.includes(tool),tool);
 assert.ok(studio.includes('quickPanel'));
 assert.ok(studio.includes("touchAction:'none'"));
});

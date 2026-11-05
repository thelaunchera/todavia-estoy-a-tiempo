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


test('Fullscreen keeps one persistent touch edit switch and one exit button on iPhone',()=>{
 const editor=read('src/TouchLayerCanvas.tsx');
 const canvasCss=read('src/TouchLayerCanvas.css');
 const panorama=read('src/PanoramaEditor.tsx');
 const panoramaCss=read('src/PanoramaEditor.css');
 assert.ok(editor.includes('fullscreen?:boolean'));
 assert.ok(editor.includes("if(pageCount<=1||fullscreen){setFloatingModeBar(false);return}"));
 assert.ok(editor.includes("{pageCount>1&&!fullscreen&&<div ref={navigationBar}"));
 assert.ok(editor.includes("{pageCount>1&&!chosen&&(fullscreen||floatingModeBar)"));
 assert.ok(editor.includes('touch-editor-context-dock'),'Selecting an element replaces floating navigation with editing tools');
 assert.ok(editor.includes("(fullscreen?' fullscreen':'')"));
 assert.ok(panorama.includes('fullscreen={expanded}'));
 assert.ok(panorama.includes('{!expanded&&<button type="button" className="btn ghost"'));
 assert.ok(panorama.includes('className="panorama-exit-fixed"'));
 assert.ok(canvasCss.includes('.touch-editor-floating-mode.fullscreen{'));
 assert.ok(canvasCss.includes('bottom:calc(102px + env(safe-area-inset-bottom, 0px))'));
 assert.ok(panoramaCss.includes('.panorama-editor.expanded .panorama-heading{display:none}'));
 assert.equal(panorama.split('Cerrar vista amplia').length-1,1,'only one exit button text remains');
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

test('Mobile canvas remains present and layer-specific controls replace the creation dock',()=>{
 const studio=read('../estudio-control/src/SeamlessEditor.tsx');
 const studioCss=read('../estudio-control/src/seamless-app.css');
 const panorama=read('src/PanoramaEditor.tsx');
 const panoramaCss=read('src/PanoramaEditor.css');
 const touch=read('src/TouchLayerCanvas.tsx');
 const touchCss=read('src/TouchLayerCanvas.css');
 assert.ok(studio.includes('studio-app-context-dock'));
 assert.ok(studio.includes('studio-canvas-mini-actions'));
 assert.ok(studio.includes('studio-app-inspector'));
 assert.ok(studioCss.includes('.studio-app-canvas{position:sticky'));
 assert.ok(studioCss.includes('.studio-app-context-dock{position:fixed'));
 assert.ok(panorama.includes('onSelectionChange={setSelectedLayerId}'));
 assert.ok(panorama.includes('panorama-discovery-categories'));
 assert.ok(panoramaCss.includes('.panorama-editor>.panorama-body{position:sticky'));
 assert.ok(panoramaCss.includes('.panorama-editor.layer-selected>.panorama-primary-actions{display:none!important}'));
 assert.ok(touch.includes('touch-editor-context-dock'));
 assert.ok(touch.includes('touch-editor-context-inspector'));
 assert.ok(touch.includes('touch-editor-mini-actions'));
 assert.ok(touchCss.includes('.touch-editor-context-dock{position:fixed'));
});

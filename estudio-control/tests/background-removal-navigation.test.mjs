import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const remover=read('src/photo-background.ts');
const editor=read('src/SeamlessEditor.tsx');
const studio=read('src/Studio.tsx');
const packageJson=JSON.parse(read('package.json'));

test('Private Studio does not load a background AI model or expose its duplicate control',()=>{
 assert.doesNotMatch(remover,/@bg0\/browser|removeBackground\(/);
 assert.doesNotMatch(editor,/Quitar fondo con IA|cutoutOriginalPhoto|removeSolidBackground/);
 assert.equal(packageJson.dependencies['@bg0/browser'],undefined);
 assert.match(remover,/export async function cutoutSolidBackground/);
 assert.match(editor,/await cutoutSolidBackground\(original\)/);
 assert.match(editor,/Quitar fondo liso/);
});

test('Background removal is reversible and never replaces a complex image when no flat color is found',()=>{
 assert.match(editor,/storeOriginalPhoto\(original\)/);
 assert.match(editor,/restoreOriginalPhoto\(item\.originalBackupId\)/);
 assert.match(editor,/Restaurar original/);
 assert.match(remover,/if\(candidates\.length<6\)/);
 assert.match(remover,/if\(removed<w\*h\*\.02\)/);
 assert.match(remover,/new Uint8Array\(w\*h\)/);
 assert.match(remover,/canvas\.width=1;canvas\.height=1/);
});

test('Carousel editor remains reachable and selected after a Studio page reload',()=>{
 const first=studio.indexOf("{ id: 'inicio'");
 const carousel=studio.indexOf("{ id: 'seamless'");
 const calendar=studio.indexOf("{ id: 'calendario'");
 assert.ok(first>=0&&carousel>first&&carousel<calendar);
 assert.equal(studio.match(/id: 'seamless', label:/g)?.length,1);
 assert.match(studio,/Object\.prototype\.hasOwnProperty\.call\(LABELS,section\)/);
 assert.match(studio,/window\.history\.pushState\(\{tleStudioPage:p\}/);
 assert.match(studio,/<SeamlessEditor \/>/);
});

test('Complex-background photos have a manual, reversible, touch-first editor',()=>{
 const eraser=read('src/ManualBackgroundEraser.tsx');
 assert.match(editor,/import ManualBackgroundEraser from '\.\/ManualBackgroundEraser'/);
 assert.match(editor,/onClick=\{\(\)=>void openManualEraser\(\)\}/);
 assert.match(editor,/onApply=\{applyManualCutout\}/);
 assert.match(editor,/originalBackupId:backupId/);
 assert.match(eraser,/onPointerDown=\{down\}/);
 assert.match(eraser,/onPointerMove=\{move\}/);
 assert.match(eraser,/onPointerCancel=\{up\}/);
 assert.match(eraser,/tool==='erase'\?'destination-out':'source-over'/);
 assert.match(eraser,/ctx\.globalCompositeOperation='destination-in'/);
 assert.match(eraser,/canvas\.toBlob\(/);
 assert.match(eraser,/image\/png/);
 for(const label of ['Borrar','Recuperar','Mover vista','Deshacer','Rehacer','Aplicar recorte'])
  assert.ok(eraser.includes(label),label);
 assert.doesNotMatch(eraser,/@bg0\/browser|removeBackground\(/);
});

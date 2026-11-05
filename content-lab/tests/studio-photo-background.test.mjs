import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const studio=readFileSync(new URL('../../estudio-control/src/SeamlessEditor.tsx',import.meta.url),'utf8');
const moduleSource=readFileSync(new URL('../../estudio-control/src/photo-background.ts',import.meta.url),'utf8');
const parsedStudio=ts.createSourceFile('SeamlessEditor.tsx',studio,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const parsedModule=ts.createSourceFile('photo-background.ts',moduleSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);

test('background tool and Studio editor parse as valid TypeScript/TSX',()=>{
 const diagnostics=source=>source.parseDiagnostics.map(d=>{
  const {line,character}=source.getLineAndCharacterOfPosition(d.start||0);
  return (line+1)+':'+(character+1)+' '+ts.flattenDiagnosticMessageText(d.messageText,' ');
 });
 assert.deepEqual(diagnostics(parsedStudio),[]);
 assert.deepEqual(diagnostics(parsedModule),[]);
});

test('uploaded photos can be cut out in place, without replacing other elements',()=>{
 assert.match(studio,/readAsDataURL\(file\)/);
 assert.match(studio,/photo\.id===item\.id&&photo\.src===item\.src/);
 assert.match(studio,/aria-label="Fondo de foto seleccionada"/);
 assert.match(studio,/onClick=\{\(\)=>void removePhotoBackground\(\)\}/);
 assert.match(studio,/setMessage\('Fondo liso eliminado/);
});

test('original photo remains available for restoration across saved projects',()=>{
 assert.match(studio,/originalBackupId\?:string/);
 assert.match(studio,/storeOriginalPhoto\(original\)/);
 assert.match(studio,/restorePhotoBackground=async/);
 assert.match(moduleSource,/indexedDB\.open\(ORIGINAL_DB,1\)/);
 assert.match(moduleSource,/readAsDataURL\(blob\)/);
});

test('only a color-uniform, edge-connected background may be removed without AI',()=>{
 assert.match(moduleSource,/export async function cutoutSolidBackground/);
 assert.match(moduleSource,/Math\.sqrt\(2_400_000\/\(bitmap\.width\*bitmap\.height\)\)/);
 assert.match(moduleSource,/new Uint8Array\(w\*h\)/);
 assert.match(moduleSource,/if\(candidates\.length<6\)/);
 assert.match(moduleSource,/if\(removed<w\*h\*\.02\)/);
 assert.match(moduleSource,/bitmap\.close\(\)/);
 assert.match(moduleSource,/canvas\.width=1;canvas\.height=1/);
 assert.doesNotMatch(moduleSource,/@bg0\/browser|removeBackground\(prepared|globalCompositeOperation='destination-in'/);
 assert.doesNotMatch(studio,/Quitar fondo con IA|cutoutOriginalPhoto/);
});

test('failure preserves the original and does not redirect out of Studio',()=>{
 assert.match(studio,/catch\(err\)\{\s*if\(generation===backgroundGeneration\.current\)/);
 assert.match(studio,/La foto original sigue intacta/);
 assert.match(studio,/Quitar fondo liso/);
 assert.match(studio,/if\(busy\)return/);
 assert.doesNotMatch(studio,/window\.location\.href=.*background|window\.location\.replace\(.*background/);
});

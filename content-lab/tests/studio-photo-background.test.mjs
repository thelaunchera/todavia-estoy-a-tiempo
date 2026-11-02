import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const studio=readFileSync(new URL('../../estudio-control/src/SeamlessEditor.tsx',import.meta.url),'utf8');
const moduleSource=readFileSync(new URL('../../estudio-control/src/photo-background.ts',import.meta.url),'utf8');
const parsedStudio=ts.createSourceFile('SeamlessEditor.tsx',studio,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const parsedModule=ts.createSourceFile('photo-background.ts',moduleSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);

test('photo background tool and Studio editor parse as valid TypeScript/TSX',()=>{
 assert.deepEqual(parsedStudio.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')),[]);
 assert.deepEqual(parsedModule.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')),[]);
});

test('uploaded photos are eligible for background removal and in-place replacement',()=>{
 assert.match(studio,/readAsDataURL\(file\)/,'uploaded files enter the normal image layer');
 assert.match(studio,/photo\.id===item\.id&&photo\.src===item\.src/,'replace only the selected image in the same document');
 assert.match(studio,/aria-label="Fondo de foto seleccionada"/,'background removal visible in compact toolbar');
 assert.match(studio,/onClick=\{\(\)=>void removePhotoBackground\(\)\}/,'remove action present for selected photo');
 assert.match(studio,/setMessage\('Fondo eliminado/);
});

test('original photo remains available for restoring across saved project sessions',()=>{
 assert.match(studio,/originalBackupId\?:string/);
 assert.match(studio,/storeOriginalPhoto\(original\)/);
 assert.match(studio,/restorePhotoBackground=async/);
 assert.match(moduleSource,/indexedDB\.open\(ORIGINAL_DB,1\)/);
 assert.match(moduleSource,/readAsDataURL\(blob\)/);
});

test('image alpha is applied to original resolution rather than preview resolution',()=>{
 assert.match(moduleSource,/drawImage\(source,0,0,out\.width,out\.height\)/);
 assert.match(moduleSource,/globalCompositeOperation='destination-in'/);
 assert.match(moduleSource,/drawImage\(mask,0,0,out\.width,out\.height\)/);
 assert.match(moduleSource,/toBlob\(blob=>blob\?resolve\(blob\)/);
 assert.match(moduleSource,/model:'lite',quality:'quality'/);
});

test('background failure leaves original photo untouched and offers a fallback',()=>{
 assert.match(studio,/catch\(err\)\{\s*if\(generation===backgroundGeneration\.current\)/);
 assert.match(studio,/La foto original sigue intacta/);
 assert.match(studio,/Quitar fondo liso/);
 assert.match(studio,/if\(busy\)return/);
});

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

test('background removal avoids double compositing and large mobile canvases',()=>{
 assert.match(moduleSource,/const maxPixels=mobile\?2_400_000:8_000_000/);
 assert.match(moduleSource,/const maxSide=mobile\?2048:4096/);
 assert.match(moduleSource,/const prepared=await prepareRemovalPhoto\(original\)/);
 assert.match(moduleSource,/removeBackground\(prepared/);
 assert.match(moduleSource,/fileToDataUrl\(result\.blob\)/,'BG0 returns a finished transparent PNG');
 assert.match(moduleSource,/bitmap\.close\(\)/,'source pixels are released before AI inference');
 assert.match(moduleSource,/canvas\.width=1;canvas\.height=1/,'intermediate canvas is released');
 assert.doesNotMatch(moduleSource,/globalCompositeOperation='destination-in'/,'avoid a duplicate full-size compositing pass');
 assert.match(moduleSource,/quality:'quality'/);
 assert.doesNotMatch(moduleSource,/model:'lite'/,'BG0 chooses the supported model automatically');
});

test('background failure leaves original photo untouched and offers a fallback',()=>{
 assert.match(studio,/catch\(err\)\{\s*if\(generation===backgroundGeneration\.current\)/);
 assert.match(studio,/La foto original sigue intacta/);
 assert.match(studio,/Quitar fondo liso/);
 assert.match(studio,/if\(busy\)return/);
});

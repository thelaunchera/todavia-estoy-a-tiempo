import test from 'node:test';
import assert from 'node:assert/strict';
import {zipSync,strToU8} from 'fflate';
import {readFileSync} from 'node:fs';
import {streamStickerZip} from '../src/sticker-zip-import.ts';

const limits={maxImages:100,maxImageBytes:18_000_000,maxUnpackedBytes:120_000_000};
const asZip=(entries,name='stickers.zip')=>new File([zipSync(entries)],name,{type:'application/zip'});

test('ZIP import processes image files one at a time and ignores package metadata',async()=>{
 const entries={
  'pack/01-ribbon.png':new Uint8Array(700_000).fill(1),
  'pack/02-star.webp':new Uint8Array(620_000).fill(2),
  'pack/03-label.jpg':new Uint8Array(530_000).fill(3),
  'pack/PROMPTS.txt':strToU8('not an image'),
  '__MACOSX/._01-ribbon.png':new Uint8Array(10),
 };
 let active=0,maxActive=0;
 const seen=[];
 const result=await streamStickerZip(asZip(entries),limits,async file=>{
  active++;maxActive=Math.max(maxActive,active);
  await new Promise(resolve=>setTimeout(resolve,2));
  seen.push([file.name,file.size,file.type]);
  active--;
 });
 assert.equal(result.count,3);
 assert.equal(result.totalBytes,1_850_000);
 assert.equal(maxActive,1);
 assert.deepEqual(seen.map(item=>item[0]),['01-ribbon.png','02-star.webp','03-label.jpg']);
 assert.deepEqual(seen.map(item=>item[2]),['image/png','image/webp','image/jpeg']);
});

test('ZIP import stops before expanding more images than the Studio accepts',async()=>{
 const entries=Object.fromEntries(Array.from({length:4},(_,index)=>[
  `${index+1}.png`,new Uint8Array(128).fill(index),
 ]));
 await assert.rejects(
  streamStickerZip(asZip(entries),{...limits,maxImages:3},async()=>{}),
  /hasta 3 imágenes/
 );
});

test('ZIP import rejects oversized expanded files without taking down the page',async()=>{
 const entries={'oversized.png':new Uint8Array(2048)};
 await assert.rejects(
  streamStickerZip(asZip(entries),{...limits,maxImageBytes:1024},async()=>{}),
  /mayor de 18 MB/
 );
});


test('30-sticker ZIP stays sequential and completes across small input chunks',async()=>{
 const entries=Object.fromEntries(Array.from({length:30},(_,i)=>[
  'pack/'+String(i+1).padStart(2,'0')+'.png',
  Uint8Array.from({length:300_000},(_,n)=>(n*17+i*31)%251)
 ]));
 let processing=0,peak=0;
 const names=[];
 const result=await streamStickerZip(asZip(entries),limits,async(file,index)=>{
  processing++;peak=Math.max(peak,processing);
  assert.equal(index,names.length+1);
  names.push(file.name);
  await new Promise(resolve=>setTimeout(resolve,0));
  processing--;
 });
 assert.equal(result.count,30);
 assert.equal(result.totalBytes,9_000_000);
 assert.equal(peak,1);
 assert.equal(names[0],'01.png');
 assert.equal(names.at(-1),'30.png');
});

test('Studio ZIP import persists one original Blob per sticker and preserves v1 library',()=>{
 const editor=readFileSync(new URL('../src/SeamlessEditor.tsx',import.meta.url),'utf8');
 const sync=readFileSync(new URL('../src/studio-library-sync.ts',import.meta.url),'utf8');
 const zip=readFileSync(new URL('../src/sticker-zip-import.ts',import.meta.url),'utf8');
 assert.match(editor,/readEditorRecord<StudioLabAsset\[\]>\('studio-imported-stickers-v1'\)/);
 assert.match(editor,/studio-imported-stickers-v2/);
 assert.match(editor,/writeEditorRecord\(stickerBlobKey\(id\),image\)/);
 assert.match(editor,/writeEditorRecord\(STICKER_INDEX_V2,\[\.\.\.index,asset\]\)/);
 assert.match(editor,/URL\.createObjectURL\(image\)/);
 assert.match(editor,/URL\.revokeObjectURL\(url\)/);
 assert.doesNotMatch(editor,/reader\.readAsDataURL\(image\)/);
 assert.match(sync,/asset\.url\.startsWith\('blob:'\)/);
 assert.match(zip,/INPUT_CHUNK_BYTES=32\*1024/);
});

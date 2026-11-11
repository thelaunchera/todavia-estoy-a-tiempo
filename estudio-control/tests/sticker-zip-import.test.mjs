import test from 'node:test';
import assert from 'node:assert/strict';
import {zipSync,strToU8} from 'fflate';
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

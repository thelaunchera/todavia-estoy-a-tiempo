import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('background gallery fetches thumbnails only near viewport to control Supabase bandwidth',()=>{
 const gallery=read('src/BackgroundLibrary.tsx');
 assert.match(gallery,/new IntersectionObserver/);
 assert.match(gallery,/rootMargin:'240px'/);
 assert.match(gallery,/if\(entries\.some\(e=>e\.isIntersecting\)\)\{io\.disconnect\(\);loadImage\(asset\.id\)\}/);
 assert.doesNotMatch(gallery,/own\.slice\(0,40\)/);
 assert.doesNotMatch(gallery,/shared\.slice\(0,40\)/);
 assert.match(gallery,/src\?<img loading="lazy"/);
 assert.match(gallery,/onPublish\(uploadFile,uploadCategory\)/);
});

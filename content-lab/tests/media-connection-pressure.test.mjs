import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Media library never eagerly downloads all brand and shared files',()=>{
 const app=read('src/App.tsx');
 const media=read('src/MediaLibrary.tsx');
 assert.doesNotMatch(app,/if\s*\(tab\s*===\s*'media'\)\s*library\.forEach/);
 assert.match(app,/onLoadImage=\{imageLoad\}/);
 assert.match(media,/IntersectionObserver/);
 assert.match(media,/rootMargin:'240px 0px'/);
 assert.match(media,/observer\.disconnect\(\);load\(\)/);
 assert.match(media,/onLoadImage\(asset\.id\)/);
 assert.match(media,/Reintentar imagen/);
});

test('Private Storage asset downloads have a bounded, deduplicated retry queue',()=>{
 const client=read('src/platform/client.ts');
 assert.match(client,/MAX_CONCURRENT_ASSET_READS=3/);
 assert.match(client,/pendingAssetReads/);
 assert.match(client,/inFlightAssetReads\.get\(id\)/);
 assert.match(client,/inFlightAssetReads\.delete\(id\)/);
 assert.match(client,/retryableAssetError/);
 assert.match(client,/too many connections/);
 assert.match(client,/attempt===2/);
 assert.match(client,/guardedAssetRead\(id,async\(\)=>/);
 assert.match(client,/\.download\(asset\.path\)/);
 assert.match(client,/content-lab-private/);
});

test('A failed database read is an error notification, not a successful save',()=>{
 const app=read('src/App.tsx');
 assert.match(app,/setNoticeKind\(kind\)/);
 assert.match(app,/noticeKind==='error'/);
 assert.match(app,/Reintentar imagen/);
 assert.match(app,/:message,'error'/);
});

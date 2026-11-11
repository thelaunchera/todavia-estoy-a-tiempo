import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dedupeStudioGallery} from '../src/studio-gallery-dedup.ts';
import {isPersonalCharacterAssetName} from '../src/studio-asset-organization.ts';
const read=(p)=>readFileSync(new URL(p,import.meta.url),'utf8');
const item=(id,name,source,privateItem=false,kind='sticker',sha256)=>({
 id,name,source,private:privateItem,kind,sha256
});

test('Duplicated labels across bundled and remote display as one card without altering files',()=>{
 const shared=[
  item('catalog-a','Lazo rosa','catalog'),
  item('included-b','Lazo rosa','bundled'),
  item('included-c','Lazo azul','bundled')
 ];
 const result=dedupeStudioGallery(shared);
 assert.deepEqual(result.map(a=>a.id),['catalog-a','included-c']);
 assert.equal(shared.length,3);
});

test('Private characters stay in a different partition from buyer catalogue, and are not deleted',()=>{
 const rows=[
  item('studio-import-char','02 pantera rosa','local',true),
  item('owner-char','02 Pantera Rosa','private-character',true),
  item('generic','02 pantera rosa','catalog',false),
  item('studio-banner','Cinta editorial','editorial',true)
 ];
 const result=dedupeStudioGallery(rows);
 assert.deepEqual(result.map(x=>x.id),['studio-import-char','generic','studio-banner']);
 assert.ok(isPersonalCharacterAssetName(result[0].name));
 assert.equal(rows.length,4);
});

test('Real artwork variants with different verified hashes remain visible',()=>{
 const one='1'.repeat(64),two='2'.repeat(64);
 const res=dedupeStudioGallery([
  item('a','Estrella','catalog',false,'sticker',one),
  item('b','Estrella','bundled',false,'sticker',two),
  item('c','Estrella','catalog',false,'sticker',one)
 ]);
 assert.deepEqual(res.map(x=>x.id),['a','b']);
});

test('Private characters are exclusive to their own gallery in both Studio and editor',()=>{
 const lib=read('../src/StudioStickerLibrary.tsx');
 const carousel=read('../src/SeamlessEditor.tsx');
 assert.match(lib,/view==='Personajes privados'/);
 assert.match(lib,/a\.private&&isPersonal\(a\.name\)/);
 assert.match(lib,/view==='Content Lab'/);
 assert.match(lib,/!a\.private&&a\.kind==='sticker'/);
 assert.match(lib,/return dedupeStudioGallery\(assets\.filter\(a=>a\.kind==='sticker'&&!isPersonal\(a\.name\)\)\)/);
 assert.match(lib,/source:'editorial' as const,private:true/);
 assert.match(lib,/isPersonal\(item\.name\)\?' · Personaje privado'/);
 assert.match(carousel,/if\(stickerCategory==='Personajes privados'\)return false/);
 assert.match(carousel,/stickerCollectionFor\(\{name:asset\.name\}\)===stickerCategory/);
 assert.match(carousel,/STICKER_COLLECTIONS\.filter/);
});

test('No file or database records are deleted as part of presentation dedup',()=>{
 const pure=read('../src/studio-gallery-dedup.ts');
 assert.doesNotMatch(pure,/deleteEditorRecord|storage\.remove|\.delete\(/);
 const lib=read('../src/StudioStickerLibrary.tsx');
 assert.match(lib,/STUDIO_CATEGORY_OVERRIDES/);
 assert.match(lib,/loadStudioPrivateCharacterAssets/);
 assert.doesNotMatch(lib,/storage\.remove|\.delete\(/);
});

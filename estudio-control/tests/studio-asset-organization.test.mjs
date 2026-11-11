import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isPersonalCharacterAssetName,isStudioBackgroundName,organizedStudioKind} from '../src/studio-asset-organization.ts';

test('all 16 imported illustrated characters remain owner-only',()=>{
 for(const name of ['01 zorra aventurera','02 pantera rosa','03 tigre guerrera','04 gata morada glam',
  '05 osa exploradora','06 conejita agente','07 agente cyber plateada','08 reina de hielo',
  '09 exploradora del desierto','10 exploradora de selva','11 heroina rayo azul',
  '12 heroina azul nocturna','13 heroina armadura marina','14 reina azul real',
  '15 heroina cyber neon','16 bruja luna morada','Nia','Ruby','OFF BRIEF Nia']){
  assert.equal(isPersonalCharacterAssetName(name),true,name);
 }
 for(const name of ['02 Papel rasgado rosa','01 dalmatian blue bow','13 lemon blue leaf','Golden Grid']){
  assert.equal(isPersonalCharacterAssetName(name),false,name);
 }
});

test('background pack entries are not mixed into stickers',()=>{
 for(const name of ['04 E 18 Agua Piscina Clara','05 F 11 Vidrio Acanalado Luz',
   '06 G 25 Seda Rosa Polvosa','28 Hand Drawn Daisy Wallpaper','16 Olive Gingham Weave']){
  assert.equal(isStudioBackgroundName(name),true,name);
 }
 for(const name of ['23 retro camera','02 pantera rosa','01 torn cream paper strip','05 blue checker tape']){
  assert.equal(isStudioBackgroundName(name),false,name);
 }
 assert.equal(organizedStudioKind({id:'abc',name:'05 F 17 Piedra Carbon',category:'sticker'}),'background');
 assert.equal(organizedStudioKind({id:'abc',name:'05 F 17 Piedra Carbon',category:'sticker'},{abc:'sticker'}),'sticker');
});

test('ZIP imports are private by default and require owner approval to publish',()=>{
 const sync=readFileSync(new URL('../src/studio-library-sync.ts',import.meta.url),'utf8');
 const studio=readFileSync(new URL('../src/SeamlessEditor.tsx',import.meta.url),'utf8');
 const client=readFileSync(new URL('../src/supabase-client.ts',import.meta.url),'utf8');
 assert.match(sync,/approvedShareIds\.includes\(item\.id\)/);
 assert.match(sync,/!isPersonalCharacterAssetName\(item\.name\)/);
 assert.match(studio,/studio-lab-approved-shares-v1/);
 assert.match(studio,/Personajes privados/);
 assert.match(studio,/Mover a Fondos/);
 assert.match(studio,/Mover a Stickers/);
 assert.match(studio,/Compartir en Lab/);
 assert.match(client,/if\(isPersonalCharacterAssetName\(displayName\|\|file\.name\)\)/);
 assert.match(client,/\.eq\('published',false\)/);
});

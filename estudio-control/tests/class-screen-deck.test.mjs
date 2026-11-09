import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../src/'+name,import.meta.url),'utf8');
const cards=read('class-screen-cards.ts');
const deck=read('ClassScreenDeck.tsx');
const styles=read('class-screen-deck.css');
const production=read('ClassProduction.tsx');
test('twenty original interstitials: four videos with five cards each',()=>{
 const ids=[...cards.matchAll(/id:'(0[1-4]-(?:cover|idea|tools|drive|check|map|prompt|preview|method|before|mobile|link|test|outro))'/g)].map(m=>m[1]);
 assert.equal(ids.length,20,'Each finished card has a unique stable identifier');
 assert.equal(new Set(ids).size,20);
 for(const [id,prefix] of [['01','01'],['05','02'],['06','03'],['08','04']]){
  assert.equal(ids.filter(x=>x.startsWith(prefix+'-')).length,5,'Video '+id+' has five cards');
 }
 for(const value of ['ChatGPT','Google Drive','AppDeploy','Antes de construir','Primera versión lista','Corrección comprobada','Antes de compartir','Ahora te']){
  assert.ok(cards.includes(value),'Missing screen content: '+value);
 }
 assert.match(cards,/es:\{label:/);
 assert.match(cards,/en:\{label:/);
});
test('tablet Studio opens ready title, concept and checklist presentations without showing private data',()=>{
 assert.match(production,/import ClassScreenDeck/);
 assert.match(production,/2\. Presentaciones para cortes/);
 assert.match(production,/openingCardId/);
 assert.match(production,/cardForSceneCut\(lesson\.id,scene\)/);
 assert.match(production,/x\.kind==='checklist'/);
 assert.match(production,/<ClassScreenDeck visible=\{area==='pantallas'\}/);
 assert.match(deck,/role="dialog" aria-modal="true"/);
 assert.match(deck,/viewBox="0 0 1600 900"/);
 assert.match(deck,/canvas\.width=1920;canvas\.height=1080/);
 assert.match(deck,/zipSync\(files,/);
 assert.match(deck,/pngFor\(card,lang\)/);
 assert.match(deck,/document\.documentElement\.style\.overflow='hidden'/);
 assert.match(styles,/aspect-ratio:16\/9/);
 assert.doesNotMatch(cards,/sk_live_|whsec_|sb_secret_/);
});

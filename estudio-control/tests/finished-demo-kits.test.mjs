import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const demosSource=read('src/FinishedDemos.tsx');
const resourcesSource=read('src/finished-demo-resources.ts');
const match=resourcesSource.match(/const photoData=(\{[\s\S]*?\}) as const;/);
assert.ok(match,'No se encontró la biblioteca central de fotografías');
const photoData=JSON.parse(match[1]);
const stepsMatch=resourcesSource.match(/export const additionalDemoPrompts:[^=]+ = (\{[\s\S]*?\});\s*$/);
assert.ok(stepsMatch,'No se encontró la biblioteca central de pasos');
const additionalSteps=JSON.parse(stepsMatch[1]);

const cards=[...demosSource.matchAll(/\{\s*id:'([^']+)'([\s\S]*?)\n\s*\},/g)].map(([,id,body])=>({id,body}));
const existingSteps=['casa-brownie','crumb','aftr','soluna','ivory-bloom','golden-grid','sova','marea'];

test('todos los demos terminados incluyen fotos, prompts y pasos en un solo kit',()=>{
 assert.ok(cards.length>=10,'Se perdieron demos del catálogo');
 for(const {id,body} of cards){
  const photos=body.match(/photos:(additionalDemoPhotos\['([^']+)'\]|solunaPhotos|ivoryBloomPhotos|goldenGridPhotos|sovaPhotos|mareaPhotos)/);
  const prompts=body.match(/promptsFor:'([^']+)'/);
  assert.ok(photos, id+' no tiene galería de fotos asociada');
  assert.ok(prompts,id+' no tiene pasos de construcción');
  const key=prompts[1];
  assert.ok(existingSteps.includes(key)||additionalSteps[key]?.length>0,id+' tiene prompts sin pasos');
  if(photos[2]){
   assert.ok(photoData[photos[2]]?.items?.length>0,id+' tiene galería vacía');
   for(const [filename,title,placement] of photoData[photos[2]].items){
    assert.ok(filename&&title&&placement,id+' tiene una foto sin identificar');
   }
  }
 }
 assert.ok(demosSource.includes('Ver kit completo: fotos + prompts + pasos'),'Los recursos deben abrirse juntos en un kit');
 assert.ok(demosSource.includes('Ver prompt de esta foto'),'Cada foto necesita su prompt junto al enlace');
});

test('los nuevos demos deben conservar origen e instrucciones antes de presentarse como terminados',()=>{
 assert.match(demosSource,/photos:FinishedDemoPhoto\[\]/,'Campo fotos obligatorio');
 assert.match(demosSource,/promptsFor:keyof typeof studioDemoPrompts/,'Campo prompts obligatorio');
 assert.ok(demosSource.includes('Los prompts de referencia no deben confundirse'),'Se debe indicar cuando un prompt es reconstruido');
 assert.ok(demosSource.includes("kind:'live'"),'Se debe distinguir un proyecto real de una simulación');
});


test('Golden Grid conserva sus nueve originales, pasos y carpeta Drive',()=>{
 const kit=read('src/golden-grid-kit.ts');
 const photos=JSON.parse(kit.match(/goldenGridPhotos: FinishedDemoPhoto\[\] = (\[[\s\S]*?\]);/)[1]);
 const steps=JSON.parse(kit.match(/goldenGridRebuildPrompts: DemoRebuildPrompt\[\] = (\[[\s\S]*?\]);/)[1]);
 assert.equal(photos.length,9);
 assert.equal(new Set(photos.map(p=>p.url)).size,9);
 for(const photo of photos){
  assert.ok(photo.title&&photo.placement&&photo.prompt);
  assert.ok(photo.url.startsWith('https://thelaunchera.com/demos/golden-grid/resources/'));
  assert.match(photo.prompt,/recreación/);
 }
 assert.equal(steps.length,4);
 for(const step of steps)assert.ok(step.prompt&&step.say&&step.show);
 assert.match(kit,/https:\/\/drive.google.com\/drive\/folders\/11QkpVn07VOpfZtwrF4zLnIiS8TJd47kK/);
 assert.match(demosSource,/photos:goldenGridPhotos/);
 assert.match(demosSource,/'golden-grid': goldenGridRebuildPrompts/);
});

test('SOVA keeps ten original photo prompts, six steps and one published card',()=>{
 const kit=read('src/sova-kit.ts');
 const photos=JSON.parse(kit.match(/sovaPhotos: FinishedDemoPhoto\[\] = (\[[\s\S]*?\]);/)[1]);
 const steps=JSON.parse(kit.match(/sovaRebuildPrompts: DemoRebuildPrompt\[\] = (\[[\s\S]*?\]);/)[1]);
 assert.equal(photos.length,10);
 assert.equal(new Set(photos.map(photo=>photo.url)).size,10);
 for(const photo of photos){
  assert.ok(photo.prompt.length>100);
  assert.ok(photo.url.startsWith('https://thelaunchera.com/demos/sova/resources/'));
 }
 assert.equal(steps.length,6);
 for(const step of steps)assert.ok(step.title&&step.prompt&&step.show&&step.say);
 assert.equal(cards.filter(card=>card.id==='sova').length,1);
 assert.match(demosSource,/publishedBrands=\{\['sova'\]\}/);
 assert.match(kit,/1dcvRv6uM4t6qz7PIkhALKJLwjGnvkJ0p/);
});

test('Marea conserva catorce PNG originales, sus prompts y una sola ficha completa',()=>{
 const kit=read('src/marea-kit.ts');
 const photos=JSON.parse(kit.match(/mareaPhotos: FinishedDemoPhoto\[\] = (\[[\s\S]*?\]);/)[1]);
 const steps=JSON.parse(kit.match(/mareaRebuildPrompts: DemoRebuildPrompt\[\] = (\[[\s\S]*?\]);/)[1]);
 assert.equal(photos.length,14);
 assert.equal(new Set(photos.map(photo=>photo.url)).size,14);
 for(const [index,photo] of photos.entries()){
  assert.ok(photo.title&&photo.placement&&photo.prompt.length>1000);
  assert.ok(photo.url.startsWith('https://thelaunchera.com/demos/marea-wigs-miami/resources/'));
  assert.ok(photo.url.endsWith('.png'));
  assert.ok(photo.prompt.includes('IMAGE '+(index+1)+' OF 14:'));
 }
 assert.equal(steps.length,6);
 for(const step of steps)assert.ok(step.title&&step.prompt&&step.show&&step.say);
 assert.equal(cards.filter(card=>card.id==='marea-wigs-miami').length,1);
 assert.match(demosSource,/photos:mareaPhotos/);
 assert.match(demosSource,/marea: mareaRebuildPrompts/);
 assert.match(resourcesSource,/export \{mareaPhotos, mareaRebuildPrompts\} from '.\/marea-kit'/);
 assert.match(kit,/18fNKBKlyXDVZd4VSsc4hmgGV5Br1OSdM/);
 assert.match(kit,/No añadido al aula/);
});

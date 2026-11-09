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
const existingSteps=['casa-brownie','crumb','aftr','soluna','ivory-bloom','golden-grid','sova','marea','havana-19','lavender-edit','wok-social','seasonal-brew','freska'];

test('todos los demos terminados incluyen fotos, prompts y pasos en un solo kit',()=>{
 assert.ok(cards.length>=10,'Se perdieron demos del catálogo');
 for(const {id,body} of cards){
  const photos=body.match(/photos:(additionalDemoPhotos\['([^']+)'\]|solunaPhotos|ivoryBloomPhotos|goldenGridPhotos|sovaPhotos|mareaPhotos|havana19Photos|lavenderPhotos|wokSocialPhotos|seasonalBrewPhotos|freskaPhotos)/);
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


test('Lavender Edit conserva ocho PNG individuales, prompts y seis pasos',()=>{
 const kit=read('src/lavender-kit.ts');
 const ids=[...kit.matchAll(/key:\s*"lavender-(\d{2})"/g)].map(match=>match[1]);
 assert.deepEqual(ids,['01','02','03','04','05','06','07','08']);
 assert.equal([...kit.matchAll(/url:\s*"https:\/\/thelaunchera\.com\/demos\/lavender-edit\/photos\//g)].length,8);
 assert.match(kit,/export const lavenderRebuildPrompts: DemoRebuildPrompt\[\] = \[/);
 assert.match(demosSource,/photos:lavenderPhotos/);
 assert.match(demosSource,/promptsFor:'lavender-edit'/);
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

test('Havana 19 has 13 individual image references, photo prompts and seven GitHub rebuild steps',()=>{
 const kit=read('src/havana19-kit.ts');
 const photos=JSON.parse(kit.match(/havana19Photos: FinishedDemoPhoto\[\] = (\[[\s\S]*?\]);/)[1]);
 const steps=JSON.parse(kit.match(/havana19RebuildPrompts: DemoRebuildPrompt\[\] = (\[[\s\S]*?\]);/)[1]);
 assert.equal(photos.length,13);
 assert.equal(new Set(photos.map(photo=>photo.url)).size,13);
 assert.equal(steps.length,7);
 for(const photo of photos)assert.ok(photo.title&&photo.placement&&photo.prompt.length>120);
 for(const step of steps)assert.ok(step.title&&step.prompt&&step.show&&step.say);
 assert.equal(cards.filter(card=>card.id==='havana-19').length,1);
 assert.match(demosSource,/photos:havana19Photos/);
 assert.match(demosSource,/'havana-19': havana19RebuildPrompts/);
 assert.match(kit,/drive\.google\.com\/drive\/folders\/1Qer6jt7_vn-om5Sm_r2bfgRlwS1L4Jw4/);
});


test('WOK SOCIAL conserva 14 fotos individuales, 7 pasos y permisos de Aula privados',()=>{
 const kit=read('src/wok-social-kit.ts');
 const photoMatch=kit.match(/wokSocialPhotos: FinishedDemoPhoto\[\] = (\[[\s\S]*?\]);/);
 const stepMatch=kit.match(/wokSocialRebuildPrompts: DemoRebuildPrompt\[\] = (\[[\s\S]*?\]);/);
 assert.ok(photoMatch,'Faltan las fotos privadas de WOK SOCIAL');
 assert.ok(stepMatch,'Faltan los pasos de reconstrucción de WOK SOCIAL');
 const photos=JSON.parse(photoMatch[1]);
 const steps=JSON.parse(stepMatch[1]);
 assert.equal(photos.length,14);
 assert.equal(steps.length,7);
 assert.equal(new Set(photos.map(p=>p.url)).size,14);
 assert.equal(cards.filter(card=>card.id==='wok-social').length,1);
 assert.match(demosSource,/photos:wokSocialPhotos/);
 assert.match(demosSource,/promptsFor:'wok-social'/);
 for(const p of photos){
  assert.ok(p.title&&p.placement&&p.prompt.length>120);
  assert.ok(p.prompt.includes('NO prompt original conservado'));
  assert.ok(p.url.startsWith('https://thelaunchera.github.io/demo-booking-landing-/wok-social/assets/'));
 }
 for(const p of steps)assert.ok(p.title&&p.prompt&&p.say&&p.show);
 assert.match(kit,/drive\.google\.com\/drive\/folders\/1HLcYvc7rrW8ncOACtxSkKknkVDjbXNcM/);
 assert.match(kit,/wokSocialPromptDocument/);
 assert.match(demosSource,/ClassroomDemoPublication/);
});


test('Seasonal Brew conserva diez originales, seis pasos, Drive y una sola ficha',()=>{
 const kit=read('src/seasonal-brew-kit.ts');
 const photoMatch=kit.match(/seasonalBrewPhotos:FinishedDemoPhoto\[\]=(\[[\s\S]*?\]);/);
 const stepMatch=kit.match(/seasonalBrewRebuildPrompts:DemoRebuildPrompt\[\]=(\[[\s\S]*?\]);/);
 assert.ok(photoMatch,'Falta la galería de Seasonal Brew');
 assert.ok(stepMatch,'Faltan los pasos de Seasonal Brew');
 const photos=JSON.parse(photoMatch[1]);
 const steps=JSON.parse(stepMatch[1]);
 assert.equal(photos.length,10);
 assert.equal(new Set(photos.map(p=>p.url)).size,10);
 assert.equal(steps.length,6);
 assert.equal(cards.filter(card=>card.id==='seasonal-brew').length,1);
 assert.ok(photos.every(p=>p.title&&p.prompt&&p.placement));
 assert.match(kit,/1vrScp7azye4DKN-v_zn-xshacHpaOe2R/);
 assert.match(demosSource,/promptsFor:'seasonal-brew'/);
});


test('FRESKA conserva un único demo, diez fotos originales y seis pasos de reconstrucción',()=>{
 const kit=read('src/freska-kit.ts');
 const photos=JSON.parse(kit.match(/freskaPhotos:FinishedDemoPhoto\[\]=(\[[\s\S]*?\]);/)[1]);
 const steps=JSON.parse(kit.match(/freskaRebuildPrompts:DemoRebuildPrompt\[\]=(\[[\s\S]*?\]);/)[1]);
 assert.equal(photos.length,10);
 assert.equal(new Set(photos.map(p=>p.url)).size,10);
 assert.equal(steps.length,6);
 assert.equal(cards.filter(card=>card.id==='freska').length,1);
 assert.ok(photos.every(p=>p.title&&p.placement&&p.prompt.includes('Instrucción reconstruida')&&p.url.startsWith('https://thelaunchera.com/demos/freska/media/')));
 assert.ok(steps.every(step=>step.step&&step.title&&step.prompt&&step.say&&step.show));
 assert.match(kit,/freska-hero-owner-approved-20261109\.jpg/);
 assert.match(kit,/1r0TD1p12HWdhsum1EizJvrBTZ7waTQm7/);
 assert.match(demosSource,/photos:freskaPhotos/);
 assert.match(demosSource,/promptsFor:'freska'/);
 assert.match(demosSource,/freskaDrive/);
});

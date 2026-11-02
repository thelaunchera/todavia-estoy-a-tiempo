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
const existingSteps=['casa-brownie','crumb','aftr','soluna','ivory-bloom'];

test('todos los demos terminados incluyen fotos, prompts y pasos en un solo kit',()=>{
 assert.ok(cards.length>=10,'Se perdieron demos del catálogo');
 for(const {id,body} of cards){
  const photos=body.match(/photos:(additionalDemoPhotos\['([^']+)'\]|solunaPhotos|ivoryBloomPhotos)/);
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

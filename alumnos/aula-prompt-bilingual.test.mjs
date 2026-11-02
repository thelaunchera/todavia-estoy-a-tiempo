import test from 'node:test';
import assert from 'node:assert/strict';
import {promptGuide} from './prompt-guide.js';
import {englishTitle,localizedPrompt,englishDemoTitle,englishDemoPhotoTitle} from './prompt-english.js';

const codes=['idea','cliente','estructura','referencias','imagenes','hero','copy','construccion','formularios','pagos','movil','auditoria','m00_elige_proyecto','m01_diagnostico_propio','m01_investiga_otros','m02_moodboard','m03_plan_fotos','m03_foto_individual','m03_empaque','m04_textos_objetivo','m05_poner_fotos','m06_corrige_movil','m07_checkout','m08_publica',...Array.from({length:8},(_,i)=>'freebie_1photo8_'+String(i+1).padStart(2,'0'))];

test('all 32 course prompts explain purpose, timing and result in both languages',()=>{
 for(const code of codes){
  for(const lang of ['es','en']){
   const guide=promptGuide(code,lang);
   assert.ok(guide.purpose?.length>=15,code+' purpose '+lang);
   assert.ok(guide.when?.length>=15,code+' when '+lang);
   assert.ok(guide.result?.length>=15,code+' result '+lang);
  }
 }
});
test('core and module English prompts do not fallback to Spanish source',()=>{
 for(const code of codes.filter(x=>!x.startsWith('freebie_'))){
  const en=localizedPrompt(code,'Actúa como profesor y revisa la web.', 'en');
  assert.ok(en.length>100,code);
  assert.ok(!en.includes('Actúa como profesor'),code);
  assert.ok(englishTitle(code,'Título español')!=='Título español',code);
 }
});
test('all eight bonus names and bilingual prompt bodies are localized',()=>{
 for(let i=1;i<=8;i++){
  const code='freebie_1photo8_'+String(i).padStart(2,'0');
  assert.ok(!/editorial asimétrico|espacio negativo|flujo diagonal|columnas de revista|impacto monumental|textura|jerarquía|tipografía detrás/i.test(englishTitle(code,'Titulo español')));
  const body='[[ES]]Crear una fotografía original.[[EN]]Create an original photo.';
  assert.equal(localizedPrompt(code,body,'en'),'Create an original photo.');
  assert.equal(localizedPrompt(code,body,'es'),'Crear una fotografía original.');
 }
});
test('demo English learning adaptations do not include Spanish source text',()=>{
 for(const [id,total] of [['casa-brownie',12],['crumb',12],['aftr',6],['soluna',9]]){
  for(let i=0;i<total;i++){
   const code='demo_'+id+'_'+i;
   const en=localizedPrompt(code,'Actúa como director y diseña la portada.', 'en','Example');
   assert.ok(en.includes('PRACTICE BRIEF'),code);
   assert.ok(!en.includes('Actúa como'),code);
   assert.ok(!englishDemoTitle(code,'Portada sin video').includes('Portada'),code);
  }
 }
 const photo='demo-photo_casa-brownie_3_2';
 assert.match(englishDemoPhotoTitle(photo),/Dulce de leche/i);
 assert.ok(!localizedPrompt(photo,'Fotografía con caja', 'en','Casa Brownie').includes('Fotografía con caja'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {courseCopy,translateCourseMessage} from './aula-mensajes.js';
const load=name=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
test('course keeps complete independent Spanish and English status messages',()=>{
 const samples=[
 'Comprobando tu cuenta…',
 'Acceso pendiente de compra verificada.',
 'No se pudieron cargar los materiales. Vuelve a abrir el aula o pide ayuda desde aquí.',
 'Si existe una cuenta con ese correo, recibirás el enlace para recuperar la contraseña. Revisa también Promociones o Spam.',
 'No pudimos confirmar el envío. Intenta otra vez o escribe a hello@thelaunchera.com.',
 'No pudimos guardar tu avance. Vuelve a intentarlo.'
 ];
 for(const original of samples){
  assert.equal(translateCourseMessage(original,'es'),original);
  const english=translateCourseMessage(original,'en');
  assert.notEqual(english,original);
  assert.match(english,/[A-Za-z]/);
 }
 assert.equal(courseCopy('Guardar','Save','es'),'Guardar');
 assert.equal(courseCopy('Guardar','Save','en'),'Save');
});
test('library guards English against Spanish source and supports both languages',()=>{
 const s=load('materiales-interactivos.js');
 assert.match(s,/getLanguage\(\)==='en'\?'Materials are being prepared/);
 assert.match(s,/ownerDraftPdfs\.hidden=getLanguage\(\)==='en'/);
 assert.match(s,/renderEnglishMaterialGuide/);
 assert.match(s,/getLanguage\(\)==='en'/);
 assert.match(s,/translateWorkbookBlocks\(WORKBOOK,getLanguage\(\)\)/);
 assert.match(s,/translateCheckItem\(item,i,getLanguage\(\)\)/);
});
test('demos and member messages do not use combined-language copy',()=>{
 const gallery=load('inspiracion.js'),club=load('comunidad.js');
 assert.ok(!gallery.includes('Copied / Copiado'));
 assert.ok(!gallery.includes('Cargando proyectos / Loading projects'));
 assert.match(gallery,/galleryPhotoLabel/);
 assert.match(gallery,/demoDescription\(d,curLang\(\)\)/);
 assert.match(club,/communityMessages/);
 assert.match(club,/clubCopy/);
 assert.match(club,/communityLanguage/);
});
test('the help form, prompts and navigation include English UI translations',()=>{
 const s=load('aula-i18n.js');
 for(const key of ['#course-help-title','#course-help-form button[type="submit"]','#course-help-topic option[value=""]','.course-help-note','#aula-section-back span','#aula-section-close span']){
  assert.ok(s.includes(key),'Missing translation for '+key);
 }
 assert.match(s,/privacy\.textContent='Privacy policy'/);
});

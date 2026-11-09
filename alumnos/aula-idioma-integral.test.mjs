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

test('Drive setup is executed by AI, shown in both classroom languages, and never misrepresented as a plan',()=>{
 const home=load('index.html');
 const translations=load('aula-textos-estaticos.js');
 const spanish=load('guia-principiantes.js');
 const english=load('materials-guides-en.js');
 assert.match(home,/class="aula-fast-start"/);
 assert.match(home,/data-class-es="ChatGPT y tus conexiones"/);
 assert.match(home,/data-class-en="ChatGPT and your connections"/);
 assert.match(home,/https:\/\/drive\.google\.com\/drive\/u\/0\/my-drive/);
 assert.match(home,/Instalar un plugin no garantiza acceso gratis/);
 assert.match(translations,/AI creates or reuses the project folder/);
 assert.match(translations,/Google Drive: connect and authorize it in ChatGPT/);
 assert.match(translations,/Start with one website/);
 assert.match(spanish,/driveFolderPrompt/);
 assert.match(spanish,/CREA AHORA la carpeta principal/);
 assert.match(spanish,/no afirmes que creaste algo que no pudiste crear/);
 assert.match(spanish,/02_FOTOS/);
 assert.match(english,/Work on ONE website at a time/);
 assert.match(english,/LET CHATGPT CREATE THE FOLDERS/);
 assert.match(english,/02_PHOTOS/);
 assert.match(home,/Google Drive para tus fotos y archivos/);
 assert.match(translations,/ask the AI to save it to Drive → 02_PHOTOS/);
});

test('Notion command center bonus describes Metricool and GSC Wizard separately in both languages',()=>{
 const guide=load('prompt-guide.js');
 const englishTitleSource=load('prompt-english.js');
 const studentBonuses=load('biblioteca-bonos.js');
 const ownerBonuses=load('../estudio-control/src/BonusLibrary.tsx');
 assert.match(guide,/bonus_content_command_notion/);
 assert.match(guide,/GSC Wizard/);
 assert.match(englishTitleSource,/BONUS · Notion command center/);
 assert.match(studentBonuses,/Centro de comando · Notion/);
 assert.match(ownerBonuses,/item.resource_code === 'bonus_content_command_notion'/);
});

test('learner-first navigation and in-page lesson picker are bilingual and accessible',()=>{
 const html=load('index.html'),app=load('curso.js'),language=load('aula-i18n.js'),strings=load('aula-textos-estaticos.js');
 assert.match(html,/id="lesson-picker-shell" hidden/);
 assert.match(html,/<label for="lesson-picker">Elige tu lección<\/label>/);
 assert.match(html,/<select id="lesson-picker"/);
 assert.match(app,/\$\('lesson-picker'\)\?\.addEventListener\('change'/);
 assert.match(app,/option\.textContent=courseCopy\('Lección ','Lesson '/);
 assert.match(language,/\['#lesson-picker-shell label','Choose a lesson'\]/);
 assert.match(language,/\['#lesson-picker','aria-label','Choose a lesson from this course'\]/);
 for(const text of ['RECURSOS PARA PRACTICAR','COMPARTE Y SIGUE','PARA SEGUIR AVANZANDO']){
  assert.ok(strings.includes('"'+text+'":'),text+' missing from the bilingual classroom');
 }
 assert.doesNotMatch(html,/class="dashboard-hero-secondary"/,'Avoid competing CTAs in the first screen');
 for(const code of ['01','05','06','08'])assert.match(html,new RegExp('data-course-video-code="'+code+'"'));
 assert.match(html,/id="lesson-links"/);
 assert.match(html,/<details id="lesson-prompts-panel"/);
 assert.match(app,/CORE_LESSON_CODES\.map\(code/);
 assert.match(app,/renderLessonLinks\(item\)/);
});
test('materials follow four progressive learning stages without hiding tool details',()=>{
 const source=load('materiales-interactivos.js');
 for(const item of ['01 · Empieza aquí','02 · Prepara tu web','03 · Herramientas','04 · Revisa y publica']){
  assert.ok(source.includes(item),'Missing stage: '+item);
 }
 for(const view of ["'organizacion'","'prompts'","'conectores'","'make'","'cuaderno'","'revision'"]){
  assert.ok(source.includes(view),'Missing teaching resource: '+view);
 }
 assert.match(source,/renderEnglishMaterialGuide\(content,view,go\)/);
});

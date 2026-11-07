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

// The 16 styles and their master must be readable in both classroom languages.
test('typography master and all 16 individual styles have bilingual guides and English titles',()=>{
 const codes=['typography_master_16',...Array.from({length:16},(_,i)=>'typography_'+String(i+1).padStart(2,'0'))];
 for(const code of codes){
  for(const lang of ['es','en']){
   const guide=promptGuide(code,lang);
   assert.ok(guide.purpose?.length>15,code+' '+lang+' purpose');
   assert.ok(guide.when?.length>15,code+' '+lang+' when');
   assert.ok(guide.result?.length>15,code+' '+lang+' result');
  }
  assert.ok(!/tipográfico|tipografía|Sans serif contemporánea|Serif elegante/i.test(englishTitle(code,'Título español')),code);
  const original='[[ES]]Usa la foto ORIGINAL para cambiar la tipografía.[[EN]]Use the ORIGINAL photo to change the lettering.';
  assert.equal(localizedPrompt(code,original,'es'),'Usa la foto ORIGINAL para cambiar la tipografía.');
  assert.equal(localizedPrompt(code,original,'en'),'Use the ORIGINAL photo to change the lettering.');
 }
});

test('creative packs keep every step together instead of classifying hero and moodboard separately',async()=>{
 const {promptPack}=await import('./prompt-guide.js');
 const names=['Scuplted Gloss Hero','Droplet & Material Macro','Botanical Still Life','Cream & Ritual Detail','Holiday Gift Campaign'];
 const packs=names.map((name,i)=>promptPack({prompt_code:'december_'+i,title:'December Creative Pack · '+name,category:i?'photos':'design'},'es'));
 assert.deepEqual([...new Set(packs.map(x=>x.id))],['december-lavender']);
 assert.match(packs[0].purpose,/campaña de producto/);
 for(const lang of ['es','en']){
  const typography=promptPack({prompt_code:'typography_01'},lang);
  assert.equal(typography.id,promptPack({prompt_code:'typography_master_16'},lang).id);
  assert.notEqual(typography.id,promptPack({prompt_code:'freebie_1photo8_01'},lang).id);
  assert.equal(promptPack({prompt_code:'demo_casa-brownie_0',brand:'Casa Brownie'},lang).id,promptPack({prompt_code:'demo-photo_casa-brownie_0_1',brand:'Casa Brownie'},lang).id);
  assert.notEqual(promptPack({prompt_code:'demo_crumb_0',brand:'Crumb'},lang).id,promptPack({prompt_code:'demo_casa-brownie_0',brand:'Casa Brownie'},lang).id);
 }
});

test('course prompts group into seven bilingual learning stages without mixing creative packs or demo brands',async()=>{
 const {promptPack,promptShelf}=await import('./prompt-guide.js');
 const stages={
  'course-01':['idea','cliente','estructura','m00_elige_proyecto','m01_diagnostico_propio'],
  'course-02':['referencias','m02_moodboard'],
  'course-03':['imagenes','m03_foto_individual'],
  'course-04':['hero','copy','m04_textos_objetivo'],
  'course-05':['construccion','formularios','m05_poner_fotos'],
  'course-06':['movil','auditoria','mobile_1','m06_corrige_movil'],
  'course-07':['pagos','m07_checkout','m08_publica']
 };
 for(const lang of ['es','en'])for(const [group,codes] of Object.entries(stages))for(const code of codes){
  const item={prompt_code:code,title:'Learning prompt'};
  assert.equal(promptPack(item,lang).id,group,code+' '+lang);
  assert.equal(promptShelf(item),'route');
  assert.ok(promptPack(item,lang).purpose.length>30);
 }
 for(const item of [{prompt_code:'typography_01'},{prompt_code:'freebie_1photo8_01'},{prompt_code:'december_1',title:'December Creative Pack · Hero'}])assert.equal(promptShelf(item),'creative');
 for(const code of ['demo_crumb_0','demo-photo_crumb_0_1'])assert.equal(promptShelf({prompt_code:code,brand:'Crumb'}),'demos');
 assert.equal(promptPack({prompt_code:'demo_crumb_0',brand:'Crumb'},'es').id,promptPack({prompt_code:'demo-photo_crumb_0_1',brand:'Crumb'},'es').id);
});

test('lavender demo overrides seasonal pack name so the brand keeps all its photos and build steps',async()=>{
 const {promptPack,promptShelf}=await import('./prompt-guide.js');
 for(const lang of ['es','en']){
  const first=promptPack({prompt_code:'demo_lavender-edit_0',brand:'The Lavender Edit',title:'Hero photo'},lang);
  const photo=promptPack({prompt_code:'demo-photo_lavender-edit_0_1',brand:'The Lavender Edit',title:'Portrait'},lang);
  assert.equal(first.id,'demo:lavender-edit');
  assert.equal(photo.id,first.id);
  assert.equal(promptShelf({prompt_code:'demo_lavender-edit_0',brand:'The Lavender Edit'}),'demos');
  assert.notEqual(first.id,promptPack({prompt_code:'december_1',title:'December Creative Pack · Lavender'},lang).id);
 }
});

// Source-level regression: distinct visual hierarchy without exposing private prompt bodies.
test('visual levels: category, guidance and copyable prompt are distinct in the student UI',async()=>{
 const {readFileSync}=await import('node:fs');
 const {fileURLToPath}=await import('node:url');
 const here=new URL('./',import.meta.url);
 const js=readFileSync(fileURLToPath(new URL('materiales-interactivos.js',here)),'utf8');
 const css=readFileSync(fileURLToPath(new URL('materiales-interactivos.css',here)),'utf8');
 const html=readFileSync(fileURLToPath(new URL('index.html',here)),'utf8');
 assert.match(js,/mi-pack-overview/);
 assert.match(js,/mi-prompt-items-heading/);
 assert.match(js,/mi-prompt-copy-panel/);
 assert.match(js,/if\(query\)packCard\.open=true/);
 assert.doesNotMatch(js,/active==='route'&&id===selectedPacks\[0\]/);
 assert.match(css,/\.mi-prompt-pack>summary/);
 assert.match(css,/\.mi-pack-overview\{/);
 assert.match(css,/\.mi-prompt-pack \.mi-prompt-guide\{/);
 assert.match(css,/\.mi-prompt-copy-panel \.mi-prompt-text\{/);
 assert.match(html,/materiales-interactivos\.css\?v=20261107-live-casa-v1/);
});

// The classroom must show the real published site, not the illustrative brownie placeholders.
test('Casa Brownie preview uses the official website and true mobile/desktop iframes',async()=>{
 const {readFileSync}=await import('node:fs');
 const here=new URL('./',import.meta.url);
 const materials=readFileSync(new URL('materiales-interactivos.js',here),'utf8');
 const preview=readFileSync(new URL('casa-brownie-live-preview.js',here),'utf8');
 assert.match(materials,/renderCasaBrownieLivePreview\(content,getLanguage\(\)\)/);
 assert.doesNotMatch(materials,/mi-demo-site/);
 assert.match(preview,/https:\/\/thelaunchera\.com\/demos\/casa-brownie\/\?etapa=sin-video/);
 assert.match(preview,/siteWidth=mobile\?390:1280/);
 assert.match(preview,/iframe\.src=url/);
 assert.match(preview,/external\.href=url/);
});

// Visual route regression: keep four functional phase buttons, approved lessons and private progress intact.
test('editorial lesson cards have four themed illustrations and real progress without green emoji',async()=>{
 const {readFileSync}=await import('node:fs');
 const here=new URL('./',import.meta.url);
 const js=readFileSync(new URL('curso.js',here),'utf8');
 const css=readFileSync(new URL('curso.css',here),'utf8');
 const html=readFileSync(new URL('index.html',here),'utf8');
 for(const id of ['define','create','build','review'])assert.match(js,new RegExp("id:'"+id+"'"));
 assert.match(js,/button\.dataset\.phase=phase\.id/);
 assert.match(js,/lesson-map-emblem/);
 assert.match(js,/done\.has\(item\.lesson_code\)/);
 assert.match(js,/button\.addEventListener\('click',\(\)=>choose\(indexes\[0\]\.index\)\)/);
 assert.match(css,/EDITORIAL LEARNING CARDS/);
 assert.match(css,/lesson-map-step\[data-phase="review"\]/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(html,/curso\.css\?v=20261107-approved-stickers-v4/);
});

// Source-level authorization boundary: the student-facing demo selector is only read-only.
test('owner student preview does not expose demo publish switches',async()=>{
 const {readFileSync}=await import('node:fs');
 const inspire=readFileSync(new URL('./inspiracion.js',import.meta.url),'utf8');
 const course=readFileSync(new URL('./curso.js',import.meta.url),'utf8');
 assert.match(inspire,/if\(canManageDemos\)\{/);
 assert.match(inspire,/visibleDemos=\(\)=>canManageDemos\?demos:demos\.filter/);
 assert.doesNotMatch(inspire,/if\(adminPreview\)\{\s*const editor=/);
 assert.match(course,/const MANAGE_DEMOS_REQUESTED=ADMIN_VIEW_REQUESTED && queryParams\.get\('gestionar_demos'\)==='1'/);
 assert.match(course,/canManageDemos:adminPreview&&MANAGE_DEMOS_REQUESTED/);
});

test('private iPad filming desk reuses existing chapter uploads, save and scenes',async()=>{
 const {readFileSync}=await import('node:fs');
 const t=readFileSync(new URL('../estudio-control/src/ClassProduction.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../estudio-control/src/class-production.css',import.meta.url),'utf8');
 assert.match(t,/class-tablet-desk/);
 assert.match(t,/tabletFilmingOrder/);
 assert.match(t,/startUpload\(lesson\.id\)/);
 assert.match(t,/onClick=\{\(\)=>void save\('grabado'\)\}/);
 assert.match(t,/class-tablet-cue/);
 assert.match(t,/window\.matchMedia/);
 assert.match(css,/class-room--tablet/);
 assert.match(css,/prefers-reduced-motion/);
});

test('owner class preview and regular students see only published demo prompts',async()=>{
 const {readFileSync}=await import('node:fs');
 const materials=readFileSync(new URL('./materiales-interactivos.js',import.meta.url),'utf8');
 const editor=readFileSync(new URL('../estudio-control/src/ClassProduction.tsx',import.meta.url),'utf8');
 assert.match(materials,/kit\.payload\.demos\.filter\(d=>d\.published!==false\)/);
 assert.doesNotMatch(materials,/kit\.payload\.demos\.filter\(d=>adminPreview\|\|d\.published!==false\)/);
 assert.match(editor,/setScene\(0\);setTabletCue\('screen'\);setLessonId\(id\)/);
});

test('approved emoji assets replace decorative circles in each class phase',async()=>{
 const {readFileSync,existsSync}=await import('node:fs');
 const js=readFileSync(new URL('./curso.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('./curso.css',import.meta.url),'utf8');
 const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
 const files={
  define:'16_objetivo_rosa.png',
  create:'17_idea_lila.png',
  build:'18_creadora_laptop_lila.png',
  review:'15_checklist_rosa.png'
 };
 for(const [phase,file] of Object.entries(files)){
  assert.match(js,new RegExp(phase+":'"+file.replaceAll('.','\\.')+"'"));
  assert.ok(existsSync(new URL('../content-lab/public/resources/premium-stickers-2026-11/'+file,import.meta.url)),file+' must already exist in the approved emoji library');
 }
 assert.match(js,/sticker\.src=approvedStickerBase\+approvedSticker\[phase\.id\]/);
 assert.match(js,/sticker\.alt=''/);
 assert.doesNotMatch(css,/\.lesson-map-step::after\s*\{/);
 assert.doesNotMatch(css,/\.lesson-course-map::after\s*\{/);
 assert.match(css,/\.lesson-map-emblem img\s*\{/);
 assert.match(html,/curso\.js\?v=20261107-approved-stickers-v5/);
});

test('iPad recording desk links actual Drive chapter folders and its official demo',async()=>{
 const {readFileSync}=await import('node:fs');
 const course=readFileSync(new URL('../estudio-control/src/class-course.ts',import.meta.url),'utf8');
 const production=readFileSync(new URL('../estudio-control/src/ClassProduction.tsx',import.meta.url),'utf8');
 const recording=readFileSync(new URL('../estudio-control/src/recording-starts.ts',import.meta.url),'utf8');
 for(let i=0;i<=8;i++)assert.match(course,new RegExp("'"+String(i).padStart(2,'0')+"':'https://drive\\.google\\.com/drive/folders/"));
 assert.match(production,/CLASS_RECORDING_FOLDERS\[lesson\.id\]/);
 assert.match(production,/href=\{OFFICIAL_DEMO_URL\}/);
 assert.match(recording,/OFFICIAL_DEMO_URL = 'https:\/\/thelaunchera\.com\/demos\/casa-brownie\//);
 assert.match(production,/almacenamiento privado del Studio, no en Drive/);
});

test('separate Casa Brownie practice folder is private and linked in tablet mode',async()=>{
 const {readFileSync}=await import('node:fs');
 const course=readFileSync(new URL('../estudio-control/src/class-course.ts',import.meta.url),'utf8');
 const prod=readFileSync(new URL('../estudio-control/src/ClassProduction.tsx',import.meta.url),'utf8');
 assert.match(course,/CLASS_EXERCISE_DRIVE='https:\/\/drive\.google\.com\/drive\/folders\/13EQAmX8sUGypQ9FQp_v1QI-nN2aCfwUB'/);
 assert.match(prod,/href=\{CLASS_EXERCISE_DRIVE\}/);
 assert.match(prod,/class-tablet-folder-primary/);
 assert.match(prod,/class-tablet-drive-more/);
});

test('iPad preflight checklist persists in lesson notes and starts with practical chapter',async()=>{
 const {readFileSync}=await import('node:fs');
 const prod=readFileSync(new URL('../estudio-control/src/ClassProduction.tsx',import.meta.url),'utf8');
 assert.match(prod,/matchMedia\?\.\('\(pointer: coarse\) and \(min-width: 650px\)'\)\.matches\)\?'01':'00'/);
 assert.match(prod,/lesson\.prep\.map\(\(item,index\)=>/);
 assert.match(prod,/checked\.includes\(index\)/);
 assert.match(prod,/recordingStart\.savedPoint/);
 assert.match(prod,/performance_notes:\[\.\.\.checked\]/);
});

import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
const paired=[
 ['index.html','index-en.html'],
 ['clases/primera-landing.html','clases/primera-landing-en.html'],
 ['productos/no-voy-tarde.html','productos/no-voy-tarde-en.html'],
 ['productos/empezar-de-nuevo.html','productos/empezar-de-nuevo-en.html'],
 ['content-lab/public/descubre/index.html','content-lab/public/descubre/en/index.html'],
 ['content-lab/public/prompts/index.html','content-lab/public/prompts/en/index.html'],
 ['terminos.html','terminos-en.html'],
 ['privacidad.html','privacidad-en.html'],
 ['reembolsos.html','reembolsos-en.html'],
 ['cookies.html','cookies-en.html'],
 ['tus-datos.html','tus-datos-en.html'],
 ['baja.html','baja-en.html'],
 ['centro/terminos.html','centro/terminos-en.html'],
 ['centro/privacidad.html','centro/privacidad-en.html'],
 ['centro/reembolsos.html','centro/reembolsos-en.html'],
 ['centro/cancelaciones.html','centro/cancelaciones-en.html'],
 ['centro/cookies.html','centro/cookies-en.html'],
 ['content-lab/public/terminos.html','content-lab/public/terminos-en.html'],
 ['content-lab/public/privacidad.html','content-lab/public/privacidad-en.html'],
 ['content-lab/public/reembolsos.html','content-lab/public/reembolsos-en.html']
];
for(const [es,en] of paired){
 assert(existsSync(es), 'Missing Spanish page '+es);
 assert(existsSync(en), 'Missing English page '+en);
 assert.match(read(es),/<html\s+lang="es"/i,es+' language');
 assert.match(read(en),/<html\s+lang="en"/i,en+' language');
}
for(const p of ['clases/primera-landing.html','clases/primera-landing-en.html']){
 const body=read(p);
 assert.match(body,/class-audio-language-note/,p+' must clearly disclose audio language');
 assert.match(body,/href="#lista-espera"/,p+' must preserve waitlist CTA');
}
const courseEs=read('clases/primera-landing.html');
const courseEn=read('clases/primera-landing-en.html');
assert.match(courseEs,/Materiales en español e inglés/,'Spanish class landing must describe bilingual materials accurately');
assert.match(courseEn,/Learning materials in English and Spanish/,'English class landing must describe bilingual materials accurately');
assert.match(courseEs,/El audio y los subtítulos de cada video se indicarán cuando estén disponibles/,'Spanish FAQ must label video-language availability honestly');
assert.match(courseEn,/Video audio and subtitles will be labeled as they become available/,'English FAQ must label video-language availability honestly');
assert.doesNotMatch(courseEs,/el audio no está doblado|La opción «English» no cambia el idioma de la voz/,'Spanish landing must not contradict bilingual audio');
assert.doesNotMatch(courseEn,/the lessons are not dubbed|does not change the spoken audio/,'English landing must not contradict bilingual audio');
const room=read('alumnos/index.html');
for(const lang of ['es','en','auto']) assert(room.includes('value="'+lang+'"'), 'Caption option '+lang);
const player=read('alumnos/curso.js');
assert.match(player,/cc_load_policy/);
assert.match(player,/cc_lang_pref/);
assert.match(player,/youtube-nocookie\.com/);
const app=read('app-redesign.js');
assert.match(app,/const ui = \(es, en\)/);
assert.match(app,/We emailed your guide/);
assert.match(app,/We couldn't confirm your subscription/);
for(const p of ['productos/no-voy-tarde-en.html','productos/empezar-de-nuevo-en.html']){
 const html=read(p);
 assert.match(html,/PDF is currently delivered in Spanish/);
 assert.match(html,/\.\.\/terminos-en\.html/);
}
const freebie=read('content-lab/public/prompts/en/index.html');
for(const p of ['/content-lab/privacidad-en.html','/content-lab/reembolsos-en.html','/content-lab/terminos-en.html']){
 assert(freebie.includes(p),'Freebie English legal link missing '+p);
}
// Podcast freebie keeps the five original reflections, adds a realistic digital idea,
// and routes ES/EN through the existing Make webhook's recognized 'source' field.
for(const [page,lang] of [['index.html','es'],['index-en.html','en']]){
 const html=read(page);
 assert(html.includes('name="resource" value="cinco_preguntas"'),page+' must retain Make trigger resource');
 assert(html.includes('name="lang"'),page+' must let people select delivery language');
 assert(html.includes('value="'+lang+'" selected'),page+' should default to the page language');
}
assert(app.includes('podcast_website_en') && app.includes('podcast_website_es'),
 'Frontend must preserve Make-compatible source language routing');
for(const file of ['assets/freebies/5-preguntas-idea-digital-es.pdf','assets/freebies/5-questions-digital-idea-en.pdf']){
 assert(existsSync(file),'Missing PDF '+file);
 const buffer=readFileSync(file);
 assert(buffer.subarray(0,4).toString() === '%PDF','Malformed PDF: '+file);
}

// Keep the language name short across public pages and visible app labels.
// This checks only the specific label, not cultural references to Latino people.
const languageLabelFiles=[...new Set([
 ...paired.flat(),
 'alumnos/index.html','alumnos/aula-i18n.js',
 'centro/index.html','centro/centro.js',
 'content-lab/src/App.tsx','content-lab/src/platform/client.ts',
 'content-lab/src/IdeaBank.tsx','content-lab/src/OnePhotoNinePrompts.ts',
 'estudio-control/src/ClassProduction.tsx'
])];
for(const file of languageLabelFiles){
 assert.doesNotMatch(read(file),/español\s+latin[oa]|latin[ -]american\s+spanish/i,
  file+' must say Español or Spanish without a regional qualifier');
}
assert.match(read('index.html'),/<option value="es" selected>Español<\/option>/);
assert.match(read('content-lab/public/prompts/index.html'),/<option value="es">Español<\/option>/);

console.log('Bilingual landing + legal + subtitle contracts: PASS ('+paired.length+' pairs)');

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
assert.match(read('clases/primera-landing.html'),/La clase se explica en español latino/);
assert.match(read('clases/primera-landing-en.html'),/Lessons are taught in Latin American Spanish/);
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
console.log('Bilingual landing + legal + subtitle contracts: PASS ('+paired.length+' pairs)');

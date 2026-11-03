import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url),'utf8');
const es = JSON.parse(read('./manifest.webmanifest'));
const en = JSON.parse(read('./manifest-en.webmanifest'));
const html = read('./index.html');
const language = read('./aula-i18n.js');
const course = read('./curso.js');
const css = read('./curso.css');

test('the student classroom has separate Spanish/English installable manifests',()=>{
 for(const manifest of [es,en]){
  assert.equal(manifest.display,'standalone');
  assert.equal(manifest.start_url,'./');
  assert.equal(manifest.scope,'./');
  assert.equal(manifest.id,'/alumnos/');
  assert.equal(manifest.background_color,'#FAF8F3');
  for(const size of ['192x192','512x512']){
   assert.ok(manifest.icons.some(icon => icon.type==='image/png' && icon.sizes===size),
      'Missing native app icon size: '+size);
  }
 }
 assert.equal(es.lang,'es');
 assert.equal(en.lang,'en');
 assert.equal(es.short_name,'Mi Aula');
 assert.equal(en.short_name,'My Classroom');
});

test('iPhone and Android receive app metadata without exposing student data',()=>{
 assert.match(html,/<link id="aula-manifest" rel="manifest" href="\.\/manifest\.webmanifest">/);
 assert.match(html,/apple-mobile-web-app-capable/);
 assert.match(html,/apple-mobile-web-app-title/);
 assert.match(html,/rel="apple-touch-icon" sizes="180x180" href="\.\/icons\/aula-180\.png"/);
 assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
 assert.ok(!html.includes('serviceWorker.register('),'Classroom must not cache private lesson responses.');
});

test('Help contains short installation instructions for iPhone and Android',()=>{
 const help = html.split('<section id="soporte-aula"')[1].split('</main>')[0];
 assert.match(help,/class="aula-install-guide"/);
 assert.match(help,/id="aula-install-title"/);
 assert.match(help,/iPhone · Safari/);
 assert.match(help,/Android · Chrome/);
 assert.match(help,/Añadir a pantalla de inicio/);
 assert.match(help,/Abrir como app/);
 assert.match(help,/Instalar aplicación/);
 assert.match(help,/Necesitas internet/);
 assert.match(help,/id="course-help-form"/);
 assert.match(css,/\.aula-install-platforms/);
 assert.match(css,/@media\(max-width:680px\)/);
});

test('Help instructions and Home Screen name switch completely to English',()=>{
 for(const selector of [
  '#aula-install-title',
  '.aula-install-intro > p:last-child',
  '.aula-install-note',
  '.aula-install-platform:nth-child(1) li:nth-child(1)',
  '.aula-install-platform:nth-child(1) li:nth-child(4)',
  '.aula-install-platform:nth-child(2) li:nth-child(1)',
  '.aula-install-platform:nth-child(2) li:nth-child(4)'
 ]){
  assert.ok(language.includes("'"+selector+"'"),'Untranslated help content: '+selector);
 }
 assert.match(language,/manifest-en\.webmanifest/);
 assert.match(language,/\['#course-help-title','How can I help\?'\]/);
 assert.match(course,/\$\('course-help-title'\)\.focus/);
});

test('the publish workflow keeps the approved Mara icon instead of regenerating the podcast monogram',()=>{
 const workflow=read('../.github/workflows/pages.yml');
 assert.doesNotMatch(workflow,/icon_svg\s*=\s*Path\(/,'Classroom icon must not be recreated from the podcast logo');
 for(const size of [180,192,512]){
  const icon=readFileSync(new URL('./icons/aula-'+size+'.png',import.meta.url));
  assert.ok(icon.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Icon must be PNG');
  assert.equal(icon.readUInt32BE(16),size,'Incorrect PNG width: '+size);
  assert.equal(icon.readUInt32BE(20),size,'Incorrect PNG height: '+size);
  assert.match(workflow,new RegExp('aula-'+size+'\\.png'));
  assert.match(workflow,new RegExp('_podcast_pages/alumnos/icons/aula-'+size+'\\.png'));
 }
 assert.match(html,/rel="icon" href="\.\/icons\/aula-192\.png" type="image\/png"/);
 assert.match(workflow,/test -s _podcast_pages\/alumnos\/manifest-en\.webmanifest/);
});

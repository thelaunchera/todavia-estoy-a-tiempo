import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');
const landingEs = read('clases/primera-landing.html');
const landingEn = read('clases/primera-landing-en.html');
const classroom = read('alumnos/index.html');
const classroomEnglish = read('alumnos/aula-i18n.js');
const classroomStatic = read('alumnos/aula-textos-estaticos.js');

const publicCopy = source => source
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<!--[\s\S]*?-->/g, '');

test('archived public class landings contain no sales, signups or course details', () => {
  for (const [lang,page] of [['es',landingEs],['en',landingEn]]) {
    assert.match(page,/name="robots" content="noindex,nofollow,noarchive"/,'Class landing is not indexed: '+lang);
    assert.match(page,/href="https:\/\/thelaunchera\.com\/"/,'Class landing leads to active site: '+lang);
    assert.doesNotMatch(page,/class-faq|class-waitlist-form|lista-espera|stripe\.com|\$9\.99|\$39\.99|data-launch-at/,'No legacy course promotion or signup: '+lang);
    assert.doesNotMatch(publicCopy(page),/\b(?:ChatGPT|AppDeploy|Stripe|Gmail|Supabase|GitHub|Notion|ManyChat|Vercel|Netlify|Replit|Google Drive|Make\.com|Studio|RLS)\b/i,'No internal stack on archived landing: '+lang);
  }
  assert.match(landingEs,/Esta página no está disponible por ahora/);
  assert.match(landingEn,/This page is unavailable for now/);
});

test('archived public class pages stay bilingual and accessible without advertising a launch date', () => {
  assert.match(landingEn,/<html lang="en">/);
  assert.match(landingEs,/<html lang="es">/);
  assert.match(landingEn,/Visit The Launch Era/);
  assert.match(landingEs,/Visitar The Launch Era/);
  assert.doesNotMatch(publicCopy(landingEn),/[¿¡]/);
  assert.doesNotMatch(landingEn,/2026-12-03|Join the waitlist|Buy now/);
});

test('only student-authenticated classroom screens explain named learning tools', () => {
  const guard=classroom.indexOf('<section id="class-content" hidden>');
  const toolSection=classroom.indexOf('class="aula-fast-start"');
  assert.ok(guard>0 && toolSection>guard,'Tools live in the authenticated classroom UI');
  assert.doesNotMatch(classroom.slice(0,guard),/ChatGPT|AppDeploy|Google Drive|Make, Gmail y Stripe/);
  for(const name of ['ChatGPT','AppDeploy','Google Drive','Gmail, Make y Stripe son opcionales']) {
    assert.ok(classroom.includes(name),'Required student tool: '+name);
  }
  assert.match(classroom,/data-class-en="ChatGPT and your connections"/);
  assert.match(classroom,/data-class-en="Gmail, Make and Stripe are optional/);
  assert.match(classroom,/Instalar un plugin no garantiza acceso gratis/);
  assert.match(classroom,/data-course-video-code="01"/);
  for(const translated of ['ChatGPT: you describe','Google Drive: connect and authorize']) {
    assert.ok(classroomStatic.includes(translated),'Keep the detailed optional bilingual guide: '+translated);
  }
});

test('English and Spanish classroom share clear captions and correct legal links', () => {
  assert.match(classroom, /El idioma del aula no cambia el audio/);
  assert.match(classroomEnglish, /Changing the classroom language does not change video audio/);
  assert.match(classroomEnglish, /privacidad-en\.html/);
  assert.match(classroomEnglish, /'\.bottom a\[href\*="privacidad"\]'/);
  assert.match(classroomEnglish, /translateAccessibility\(\)/);
});

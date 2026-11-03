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

test('public class pages describe benefits rather than internal tools or providers', () => {
  const restricted = /\b(?:ChatGPT|AppDeploy|Stripe|Gmail|Supabase|GitHub|Notion|ManyChat|Vercel|Netlify|Replit|Google Drive|Make\.com|Studio|RLS)\b/i;
  for (const [label,page] of [['es',landingEs],['en',landingEn]]) {
    assert.doesNotMatch(publicCopy(page),restricted,'No app stack in public '+label+' landing');
    assert.match(page,/class-faq/,'Public FAQs must remain available');
    assert.match(page,/class-waitlist-form/,'Waitlist must remain visible');
  }
});

test('English public class landing has English marketing and accessibility content', () => {
  assert.match(landingEn,/<html lang="en">/);
  assert.match(landingEn,/name="description" content="Build and review your first website with AI/);
  assert.match(landingEn,/og:title" content="Build Your First Website with AI/);
  assert.match(landingEn,/aria-label="Back to top of page"/);
  assert.doesNotMatch(publicCopy(landingEn),/[¿¡]/,'No Spanish punctuation in English landing');
  assert.doesNotMatch(landingEn,/(?:aria-label|placeholder)="(?:Ir al|Volver al|Cómo te|Cuéntame|Escena cinematográfica)/);
  assert.doesNotMatch(landingEn,/href="\.\.\/privacidad-en\.html" hreflang="es"/);
});

test('only student-authenticated classroom screens explain named learning tools', () => {
  const guard=classroom.indexOf('<section id="class-content" hidden>');
  const toolSection=classroom.indexOf('<section class="dashboard-setup"');
  assert.ok(guard>0 && toolSection>guard,'Tools live in the authenticated classroom UI');
  assert.doesNotMatch(classroom.slice(0,guard),/ChatGPT|AppDeploy|Google Drive|Make, Gmail y Stripe/);
  for(const name of ['ChatGPT:','AppDeploy:','Google Drive:','Make, Gmail y Stripe:']) {
    assert.ok(classroom.includes(name),'Required student tool explanation: '+name);
  }
  for(const translated of ['ChatGPT: organize','AppDeploy: turn','Google Drive: save','Make, Gmail, and Stripe:']) {
    assert.ok(classroomStatic.includes(translated),'Missing English classroom tool text: '+translated);
  }
  assert.match(classroomEnglish,/\.dashboard-setup-details > summary/);
});

test('English and Spanish classroom share clear captions and correct legal links', () => {
  assert.match(classroom, /El idioma del aula no cambia el audio/);
  assert.match(classroomEnglish, /Changing the classroom language does not change video audio/);
  assert.match(classroomEnglish, /privacidad-en\.html/);
  assert.match(classroomEnglish, /'\.bottom a\[href\*="privacidad"\]'/);
  assert.match(classroomEnglish, /translateAccessibility\(\)/);
});

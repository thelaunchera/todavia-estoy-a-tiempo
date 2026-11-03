import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const publicPaths = [
  'index.html','index-en.html',
  'clases/primera-landing.html','clases/primera-landing-en.html',
  'content-lab/public/descubre/index.html',
  'content-lab/public/descubre/en/index.html',
  'content-lab/public/prompts/index.html',
  'content-lab/public/prompts/en/index.html'
];
function visibleCopy(html){
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<!--[\s\S]*?-->/g,' ')
    .replace(/<[^>]*>/g,' ')
    .replace(/\s+/g,' ');
}
test('public pages do not describe the behind-the-scenes technology stack',()=>{
  const internalVendorNames=/\b(?:AppDeploy|Supabase|GitHub|ManyChat|Netlify|Vercel|Stripe|Make\.com|backend|service.role|API key|admin dashboard)\b/i;
  for(const page of publicPaths){
    assert.doesNotMatch(visibleCopy(read(page)),internalVendorNames,
      'Public visitor copy reveals tooling: '+page);
  }
});
test('English and Spanish landing documents declare their own language',()=>{
  for(const page of publicPaths){
    const expected=page==='index-en.html'||page.endsWith('-en.html')||page.includes('/en/')?'en':'es';
    assert.equal(read(page).match(/<html[^>]*lang=["'](en|es)["']/i)?.[1],expected,page);
  }
});
test('public English pages do not regress to known mixed-language labels',()=>{
  const englishPaths=publicPaths.filter(page=>page==='index-en.html'||page.endsWith('-en.html')||page.includes('/en/'));
  const badPhrases=[
    'Lista de espera abierta','Your first website con IA',
    'Copia tu favorita y crea tu contenido','Quiero mi Content Lab',
    'Unsubscribe</a> cuando quieras','I\'m not tarde','Starting de nuevo',
    'placeholder="tu@email.com"','placeholder="Cuéntame qué pasó',
    'aria-label="Composición anterior"','aria-label="Tiempo restante hasta el lanzamiento oficial"'
  ];
  for(const page of englishPaths){
    for(const phrase of badPhrases)assert.ok(!read(page).includes(phrase),page+' contains mixed-language phrase: '+phrase);
  }
});
test('course vendors remain explained inside protected learning materials',()=>{
  const materials=read('alumnos/guia-principiantes.js');
  assert.match(materials,/AppDeploy/);
  assert.match(materials,/Stripe/);
  assert.match(materials,/Make/);
  assert.match(materials,/Gmail/);
});
test('public English class interactions have language-aware runtime messages',()=>{
  const waitlist=read('clases/waitlist.js');
  const countdown=read('clases/countdown.js');
  const experience=read('clases/experience.js');
  assert.match(waitlist,/Unsubscribe from this waitlist/);
  assert.match(waitlist,/localized\(/);
  assert.match(countdown,/lang===\x27en\x27|lang === \x27en\x27/);
  assert.match(experience,/document\.documentElement\.lang === \x27en\x27/);
});

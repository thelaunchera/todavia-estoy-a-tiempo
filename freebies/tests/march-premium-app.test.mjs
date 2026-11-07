import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const get=p=>readFileSync(resolve(root,p),'utf8');
const resource='march_premium_app_2027';
const launch='2027-03-01';

test('March landing is private until release and its original artwork precedes the signup form',()=>{
  const html=get('freebies/march-premium-app/index.html');
  const cover='/assets/freebies/march-premium-app/cover.svg';
  assert.match(html,/name="robots" content="noindex,nofollow"/);
  assert.ok(html.includes('data-release-date="'+launch+'"'));
  assert.ok(html.includes('name="resource" value="'+resource+'"'));
  assert.ok(html.includes('id="signup"'));
  assert.ok(html.includes('name="marketing_opt_in"'));
  assert.ok(html.includes('freebie-subscribe.js'));
  assert.ok(html.indexOf(cover)<html.indexOf('id="signup"'));
  assert.ok(existsSync(resolve(root,cover.slice(1))));
  assert.ok(html.includes('Walkthrough video'));
  assert.doesNotMatch(html,/\bhook\.us2\.make\.com\b/i);
  assert.doesNotMatch(html,/Turn my idea into a one-line app promise/);
  assert.doesNotMatch(html,/copying Stub|Lucia.s Brunch|The Deli Roll/);
});

test('March access contains gated, editable, copyable prompts and does not leak full prompts in source',()=>{
  const html=get('freebies/march-premium-app/access/index.html');
  assert.ok(html.includes('data-tle-private-library'));
  assert.ok(html.includes('data-resource="'+resource+'"'));
  assert.ok(html.includes('id="prompt-cards" class="prompt-grid" hidden'));
  assert.ok(html.includes('freebie-access.js'));
  assert.ok(html.indexOf('class="hero-media"')<html.indexOf('class="hero-copy"'));
  assert.ok(html.includes('object-fit:contain'));
  assert.match(html,/noindex,nofollow/);
  assert.ok(!html.includes('Turn my idea into a one-line app promise'));
  assert.ok(!html.includes('Explore three distinctly original directions'));
  const shared=get('freebies/_shared/freebie-access.js');
  assert.ok(shared.includes(resource+':'));
  assert.ok(shared.includes('navigator.clipboard.writeText(editor.value)'));
  new Script(shared);
});

test('March is scheduled after February and hidden on the catalog until March 1 ET',()=>{
  const source=get('freebies/index.html');
  assert.ok(source.includes('if(today<x.date)continue'));
  assert.ok(source.includes('timeZone:"America/New_York"'));
  assert.ok(source.includes('date:"2027-03-01"'));
  assert.ok(source.includes('date:"2027-02-01"'));
  assert.ok(source.includes('link:"/freebies/march-premium-app/"'));
  const schedule=JSON.parse(get('freebies/release-calendar.json'));
  const march=schedule.releases.find(x=>x.resource===resource);
  assert.ok(march);
  assert.equal(march.date,launch);
  assert.equal(march.status,'scheduled');
  const subscribe=get('freebies/_shared/freebie-subscribe.js');
  assert.ok(subscribe.includes(resource+':"'+launch+'"'));
  new Script(subscribe);
});

test('Original artwork requires no image generation credits and both language labels are present',()=>{
  const svg=get('assets/freebies/march-premium-app/cover.svg');
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('Capture.'));
  assert.ok(svg.includes('Focus.'));
  assert.ok(svg.includes('Done.'));
  assert.ok(!svg.includes('<image'));
  const lang=get('freebies/_shared/freebie-access.js');
  assert.ok(lang.includes('FLUJO DE PANTALLAS'));
  assert.ok(lang.includes('SCREEN FLOW'));
});

test('March pages load in Spanish and can switch all visitor copy to English',()=>{
 const landing=get('freebies/march-premium-app/index.html');
 const access=get('freebies/march-premium-app/access/index.html');
 for(const html of [landing,access]){
  assert.ok(html.includes('<html lang="es">'),'Spanish must be the default language');
  assert.ok(html.includes('id="language"'),'Both pages need a language switch');
  assert.ok(html.includes('data-en='),'Bilingual strings are missing');
  assert.ok(html.includes('data-es='),'Spanish strings are missing');
  assert.ok(html.includes('lang==="es"')||html.includes('lang==="en"'));
  assert.ok(html.includes('cover-es.svg'),'Spanish first-look artwork must be present');
 }
 assert.ok(landing.includes('>Próximamente</button>'));
 assert.ok(landing.includes('data-en="Walkthrough video"'));
 assert.ok(landing.includes('data-es="Video del recorrido"'));
 assert.ok(landing.includes('data-en="01 / GET STARTED"'));
 assert.ok(landing.includes('data-es="01 / COMIENZA"'));
 assert.ok(access.includes('data-en="One clear promise"'));
 assert.ok(access.includes('data-es="Una promesa clara"'));
 assert.ok(access.includes('data-es="Revisión final:"'));
 assert.ok(existsSync(resolve(root,'assets/freebies/march-premium-app/cover-es.svg')));
});
test('March keeps separate, original English and Spanish cover artwork',()=>{
 const en=get('assets/freebies/march-premium-app/cover.svg');
 const es=get('assets/freebies/march-premium-app/cover-es.svg');
 assert.ok(en.includes('Design an app')&&en.includes('Capture.'));
 assert.ok(es.includes('Diseña una app')&&es.includes('Captura.'));
 assert.ok(es.includes('Enfoca.')&&es.includes('Termina.'));
});
test('Shared private library renders translated prompt titles without touching older packs',()=>{
 const src=get('freebies/_shared/freebie-access.js');
 assert.ok(src.includes('item.title_es||item.title'));
 assert.ok(src.includes('editor.setAttribute("aria-label",displayTitle)'));
 assert.ok(src.includes('lang==="es"?"EN":"ES"'));
 assert.ok(src.includes('november_web_one_prompt_2026'));
 assert.ok(src.includes('december_lavender_2026'));
 assert.ok(src.includes('salt_line_january_2027'));
});

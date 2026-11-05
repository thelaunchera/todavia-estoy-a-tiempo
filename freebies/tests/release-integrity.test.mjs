import {test} from 'node:test';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const routes=[
 {resource:'november_web_one_prompt_2026',date:'2026-11-19',landing:'freebies/november-website/index.html',access:'freebies/november-website/access/index.html',hero:'/assets/freebies/november-website/cover.svg'},
 {resource:'december_lavender_2026',date:'2026-12-01',landing:'freebies/december-lavender/signup/index.html',access:'freebies/december-lavender/access/index.html',hero:'/assets/freebies/december-lavender/01-sculpted-gloss-hero.png'},
 {resource:'salt_line_january_2027',date:'2027-01-02',landing:'freebies/january-salt-line/index.html',access:'freebies/january-salt-line/access/index.html',hero:'/assets/freebies/january-salt-line/hero.jpg'}
];
const catalog=JSON.parse(read('freebies/release-calendar.json'));
test('Three release dates remain exact and private until the calendar gate',()=>{
 assert.equal(catalog.timezone,'America/New_York');
 for(const {resource,date} of routes){
 const match=catalog.releases.find(item=>item.resource===resource);
 assert.ok(match,'Missing release metadata for '+resource);
 assert.equal(match.date,date);
 }
 const listing=read('freebies/index.html');
 assert.match(listing,/if\(today<x\.date\)continue/);
 assert.match(listing,/timeZone:"America\/New_York"/);
});
test('Every public page has its original hero first, and shows no clipped embedded typography',()=>{
 for(const {resource,date,landing,hero} of routes){
 const html=read(landing);
 assert.ok(html.includes('id="signup"'),'No email signup: '+landing);
 assert.ok(html.includes(resource),'Wrong resource: '+landing);
 assert.ok(html.includes(date),'Wrong scheduled date: '+landing);
 assert.ok(html.includes('noindex'),'Prelaunch page must not be indexed: '+landing);
 assert.ok(html.includes(hero),'Missing approved hero reference: '+landing);
 assert.ok(existsSync(resolve(root,'public',hero.slice(1)))||existsSync(resolve(root,hero.slice(1))),'Missing hero image: '+hero);
 assert.ok(html.indexOf(hero)<html.indexOf('id="signup"'),'Hero must precede email form: '+landing);
 assert.ok(html.includes('object-fit:contain'),'Do not crop approved hero: '+landing);
 assert.ok(html.includes('freebie-subscribe.js'),'Missing verified email flow: '+landing);
 assert.ok(!html.includes('hook.us2.make.com'),'Do not reintroduce legacy disconnected Make webhook: '+landing);
 }
});
test('Access pages show hero before private library, and never embed ungated prompts',()=>{
 for(const {resource,access,hero} of routes){
 const html=read(access);
 assert.match(html,/class="hero-media"/);
 assert.match(html,/class="hero-copy"/);
 assert.ok(html.indexOf('class="hero-media"')<html.indexOf('class="hero-copy"'),'Hero must precede text: '+access);
 assert.ok(html.includes(hero),'Wrong hero: '+access);
 assert.ok(html.includes('object-fit:contain'),'Do not crop text in hero: '+access);
 assert.ok(html.includes(resource));
 assert.ok(html.includes('freebie-access.js'),'Missing protected editor: '+access);
 assert.ok(html.includes('id="prompt-cards"'),'No private prompt container: '+access);
 assert.ok(!html.includes('Act as an expert web designer'),'Do not expose prompts publicly: '+access);
 assert.ok(!html.includes('Create an editorial beauty campaign'),'Do not expose prompts publicly: '+access);
 }
});
test('Shared access keeps November 19 and has no old December 1 copy',()=>{
 const source=read('freebies/_shared/freebie-access.js');
 assert.match(source,/FREE WEBSITE RESOURCE/);
 assert.match(source,/RECURSO GRATIS PARA TU WEB/);
 assert.doesNotMatch(source,/NOVEMBER EDITION · DECEMBER 1 RELEASE/);
 assert.doesNotMatch(source,/EDICIÓN NOVIEMBRE · ENTREGA 1 DE DICIEMBRE/);
 const signup=read('freebies/_shared/freebie-subscribe.js');
 assert.match(signup,/timeZone:"America\/New_York"/);
 assert.match(signup,/tle-monthly-freebies\?action=subscribe/);
});
test('One current full build publishes all updates with verified Studio assets and no private PDF bypass',()=>{
 const workflow=read('.github/workflows/pages.yml');
 const manual=read('.github/workflows/deploy-november-bilingual-hotfix.yml');
 assert.match(workflow,/test -s _podcast_pages\/content-lab\/index\.html/);
 assert.match(workflow,/cp -R assets productos clases alumnos centro freebies _podcast_pages\//);
 assert.doesNotMatch(workflow,/cp -R content-lab\/public\/prompts/);
 assert.match(workflow,/rm -f _podcast_pages\/assets\/freebies\/january-salt-line\/SALT_LINE_January_2027_Freebie.pdf/);
 assert.match(workflow,/node --test freebies\/tests\/\*\.test\.mjs/);
 assert.match(workflow,/python3 estudio-control\/scripts\/verify_shared_stickers\.py/);
 assert.match(workflow,/test -s _podcast_pages\/estudio\/assets-health\.json/);
 assert.doesNotMatch(workflow,/paths-ignore:/,'Studio/freebie-only edits must publish too');
 assert.match(workflow,/workflow_call:/);
 assert.match(manual,/uses: \.\/\.github\/workflows\/pages\.yml/);
 assert.doesNotMatch(manual,/\bpush:|download-artifact|run-id:/,'Manual entry cannot race a stale snapshot against the full build');
});


test('public freebie copy contains no production notes or fixed launch notices',()=>{
 for(const {landing,access} of routes){
  for(const path of [landing,access]){
   const html=read(path);
   assert.doesNotMatch(html,/No collage exports|Sin exportaciones en collage|Launch: January|Lanzamiento: 2 de enero|Programado para el|Scheduled for/);
  }
 }
 assert.doesNotMatch(read('freebies/_shared/freebie-access.js'),/ENTREGA 19|NOVEMBER 19 RELEASE|DECEMBER 1, 2026|JANUARY 2, 2027/);
});

test('all freebies switch automatically at New York midnight with clean bilingual CTAs',async()=>{
 const script=read('freebies/_shared/freebie-subscribe.js');
 for(const {resource,date} of routes){
  let now=Date.parse(date+'T04:59:59Z'),timer,handler,requests=0;
  class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
  const button={},mail={validity:{valid:true},value:'example@example.com'};
  const form={dataset:{},ownerDocument:{querySelectorAll:()=>[]},append(){},addEventListener:(event,cb)=>{if(event==='submit')handler=cb;},querySelector:(q)=>q==='[name="resource"]'?{value:resource}:q==='[type="submit"]'?button:q==='[name="email"]'?mail:null};
  const document={documentElement:{lang:'en'},getElementById:id=>id==='signup'?form:null,createElement:()=>({setAttribute(){},style:{}})};
  runInNewContext(script,{document,Date:Clock,Intl,setInterval:cb=>{timer=cb;},queueMicrotask:cb=>cb(),fetch:async()=>{requests++;return {ok:true,json:async()=>({ok:true})};}});
  assert.equal(button.disabled,true);assert.equal(button.textContent,'Coming soon');
  await handler({preventDefault(){},stopImmediatePropagation(){}});assert.equal(requests,0);
  now=Date.parse(date+'T05:00:00Z');timer();assert.equal(button.disabled,false);assert.equal(button.textContent,'Email me the freebie');
  document.documentElement.lang='es';timer();assert.equal(button.textContent,'Enviarme el freebie');
  await handler({preventDefault(){},stopImmediatePropagation(){}});assert.equal(requests,1);timer();assert.equal(button.disabled,true);assert.equal(button.textContent,'Correo solicitado');
 }
});

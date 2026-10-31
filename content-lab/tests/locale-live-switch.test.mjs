import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Switching ES/EN updates the real React header, dashboard, shortcuts, stats and dock',()=>{
 const app=read('src/App.tsx'),locale=read('src/LabLocale.ts');
 assert.ok(app.includes("const t = (value:string):string=>uiText(value,loginLanguage)"));
 assert.ok(app.includes("{t(nav.find(n => n.id === tab)?.title||'')}"));
 assert.ok(app.includes("loginLanguage==='es'?'¡Qué gusto verte de nuevo! 👋':'Welcome back! 👋'"));
 assert.ok(app.includes("'Tu estudio está listo. ¿Qué vamos a crear hoy?'"));
 assert.ok(app.includes("{t(s.label)}"));
 assert.ok(app.includes("{t(s.detail)}"));
 assert.ok(app.includes("{t(step.title)}"));
  assert.ok(app.includes("{t(item.label)}"));
 assert.ok(app.includes('lab-home-greeting'));
 assert.ok(!app.includes('<section className="lab-quickstart"'));
 assert.ok(app.includes('<details className="lab-greeting-progress">'));
 assert.ok(app.includes('lab-greeting-actions'));
 assert.ok(app.includes("loginLanguage==='es'?'Elige el idioma de tu cuenta':'Choose your account language'"));
 assert.ok(app.includes("onClick={()=>chooseLanguage('es')}"));
 assert.ok(app.includes("onClick={()=>chooseLanguage('en')}"));
 assert.ok(locale.includes("export function uiText(source:string,language:LabLanguage)"));
 for(const key of ['TOTAL PIECES','IN PROGRESS','READY TO POST','YOUR MEDIA','Make room for','YOUR CREATIVE DESK','Overview','Create content']){
  assert.ok(locale.includes(JSON.stringify(key))||locale.includes("'"+key+"'"),key);
 }
});
test('UI language and creative brand language remain independent',()=>{
 const app=read('src/App.tsx'),platform=read('src/platform/client.ts');
 assert.ok(app.includes("lang={loginLanguage==='es'?'es-419':'en'}"));
 assert.ok(app.includes('brand.language'));
 assert.ok(platform.includes('content_lab_language'));
 assert.ok(app.includes('auth.setPreferredLanguage(next)'));
});

test('Home greeting is compact, actionable, and keeps incomplete onboarding tucked away',()=>{
 const app=read('src/App.tsx'),styles=read('src/index.css');
 assert.ok(app.includes("setupStepsDone<3&&<details"));
 assert.ok(app.includes("onClick={()=>start()}"));
 assert.ok(app.includes("onClick={startFactory}"));
 assert.ok(app.includes("brand.name&&brand.name!=='My Brand'"));
 assert.ok(!app.includes('<section className="intro">'));
 assert.ok(styles.includes('.lab-home-greeting'));
 assert.ok(styles.includes('@media(max-width:640px)'));
});

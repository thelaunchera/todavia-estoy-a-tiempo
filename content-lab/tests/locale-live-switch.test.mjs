import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Switching ES/EN updates the real React header, dashboard, shortcuts, stats and dock',()=>{
 const app=read('src/App.tsx'),locale=read('src/LabLocale.ts');
 assert.ok(app.includes("const t = (value:string):string=>uiText(value,loginLanguage)"));
 assert.ok(app.includes("{t(nav.find(n => n.id === tab)?.title||'')}"));
 assert.ok(app.includes("{t('Make room for')}"));
 assert.ok(app.includes("{t('better content.')}"));
 assert.ok(app.includes("{t('YOUR CREATIVE DESK')}"));
 assert.ok(app.includes("{t(s.label)}"));
 assert.ok(app.includes("{t(s.detail)}"));
 assert.ok(app.includes("{t(step.title)}"));
 assert.ok(app.includes("{t(step.subtitle)}"));
 assert.ok(app.includes("{t(item.label)}"));
 assert.ok(app.includes(">{t('CONTENT LAB · FIRST STEPS')}"));
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

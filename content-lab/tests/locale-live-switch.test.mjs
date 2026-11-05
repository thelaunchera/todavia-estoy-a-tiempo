import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Switching ES/EN updates the React header, new dashboard, shortcuts and mobile dock',()=>{
 const app=read('src/App.tsx'),locale=read('src/LabLocale.ts'),dashboard=read('src/CreatorDashboard.tsx');
 assert.ok(app.includes("const t = (value:string):string=>uiText(value,loginLanguage)"));
 assert.ok(app.includes("{t(nav.find(n => n.id === tab)?.title||'')}"));
 assert.ok(app.includes('locale={loginLanguage}'));
 assert.ok(dashboard.includes("const es=locale==='es'"));
 assert.ok(dashboard.includes("es?'¿Qué vamos a':'What shall we'"));
 assert.ok(dashboard.includes("es?'Crea algo nuevo':'Create something new'"));
 assert.ok(dashboard.includes("es?'Continúa diseñando':'Keep creating'"));
 assert.ok(dashboard.includes("es?'Todo en un solo lugar':'Everything in one place'"));
 assert.ok(dashboard.includes('cld-activity-stats'));
 assert.ok(dashboard.includes('cld-format-grid'));
 assert.ok(app.includes("{t(item.label)}"));
 assert.ok(app.includes("loginLanguage==='es'?'Elige el idioma de tu cuenta':'Choose your account language'"));
 assert.ok(app.includes("onClick={()=>chooseLanguage('es')}"));
 assert.ok(app.includes("onClick={()=>chooseLanguage('en')}"));
 assert.ok(locale.includes("export function uiText(source:string,language:LabLanguage)"));
});
test('UI language and creative brand language remain independent',()=>{
 const app=read('src/App.tsx'),platform=read('src/platform/client.ts');
 assert.ok(app.includes("lang={loginLanguage==='es'?'es-419':'en'}"));
 assert.ok(app.includes('brand.language'));
 assert.ok(platform.includes('content_lab_language'));
 assert.ok(app.includes('auth.setPreferredLanguage(next)'));
});

test('Creator-first Home has accessible format actions, recent projects and optional onboarding',()=>{
 const app=read('src/App.tsx'),dashboard=read('src/CreatorDashboard.tsx'),styles=read('src/CreatorDashboard.css');
 assert.ok(app.includes('setupStepsDone<3&&'));
 assert.ok(app.includes('<details className="cld-onboarding">'));
 assert.ok(app.includes('onNewNormal={startFactory}'));
 assert.ok(app.includes('onNewSeamless={startSeamless}'));
 assert.ok(dashboard.includes('onNewStory'));
 assert.ok(dashboard.includes('cld-format-grid'));
 assert.ok(dashboard.includes('cld-project-grid'));
 assert.ok(dashboard.includes('cld-brand-pill'));
 assert.ok(dashboard.includes("onNavigate('media')"));
 assert.ok(dashboard.includes('cld-empty-project'));
 assert.ok(styles.includes('--ivory:#FAF8F3'));
 assert.ok(styles.includes('@media(max-width:660px)'));
});

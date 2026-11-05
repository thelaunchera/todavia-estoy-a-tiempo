import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Prompt Studio navigation never advertises an obsolete fixed count',()=>{
 const app=src('src/App.tsx'),locale=src('src/LabLocale.ts');
 assert.ok(app.includes("title: 'Prompt Studio'"));
 assert.ok(locale.includes("['Prompt Studio','Estudio de prompts']"));
 assert.ok(!app.includes('Prompt Studio · 30'));
 assert.ok(!locale.includes('30 recetas'));
});

test('Idea Bank cards and copied prompts follow the selected UI language, not brand defaults',()=>{
 const idea=src('src/IdeaBank.tsx'),app=src('src/App.tsx');
 assert.ok(idea.includes("ideas.map((idea,i)=>en?"));
 assert.ok(!idea.includes("language==='English'"));
 assert.ok(idea.includes("español natural para audiencias hispanohablantes de América"));
 assert.ok(app.includes('locale={loginLanguage} onUse={(idea:Idea)'));
});

test('Prompt Studio and photo prompt composer respect Spanish while retaining English',()=>{
 const studio=src('src/PromptStudio.tsx'),engine=src('src/PromptEngine.ts');
 assert.ok(studio.includes('contentLanguage=locale'));
 assert.ok(studio.includes('p.body[contentLanguage]'));
 assert.ok(engine.includes("if(language==='es')return ["));
 assert.ok(engine.includes("'SUJETO PRINCIPAL: '"));
 assert.ok(engine.includes("'MAIN SUBJECT: '"));
});

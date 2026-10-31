import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const lib=src('src/PromptLibrary.ts');
const helper=src('src/PromptEngine.ts');
const app=src('src/App.tsx');
const ui=src('src/PromptStudio.tsx');
const grid=src('src/BrandGrid.tsx');
const api=src('src/platform/client.ts');
const backend=src('supabase/functions/content-lab-generate/index.ts');
const sql=src('supabase/migrations/20261031_private_saved_prompts.sql');
test('30 separate prompts authored in two languages across relevant industries',()=>{
 assert.equal((lib.match(/"id": "[0-9]{2}"/g)||[]).length,30);
 assert.ok(lib.includes('"en": "Studio hero"'));
 assert.ok(lib.includes('"es": "Producto en estudio"'));
 assert.ok(lib.includes('"en": "Real app showcase"'));
 assert.ok(lib.includes('"es": "Aplicación real"'));
 for(const type of ['product','lifestyle','personal','food','beauty','services','cleaning','podcast','education','tech','luxury','marketing'])
  assert.ok(lib.includes('"'+type+'"'),type);
 assert.ok(lib.includes("input.replace(/\\{\\{(subject|background)\\}\\}/g"));
});
test('native prompt helper preserves free-text first; realism and negative instructions are explicit',()=>{
 assert.ok(helper.includes('instruction||'));
 assert.ok(helper.indexOf('instruction||')<helper.indexOf("'MAIN SUBJECT: '"));
 for(const part of ["'PHOTOREALISM:","'AVOID: '","'REFERENCE RULE:","'Output ONE coherent photograph"])
  assert.ok(helper.includes(part),part);
 assert.ok(!helper.includes('guaranteed'));
});
test('full Prompt Studio workflow is hooked into app and generates from user prompt',()=>{
 assert.ok(app.includes("tab === 'prompt-studio'"));
 assert.ok(app.includes("setChosenPrompt({version:Date.now(),text,settings})"));
 assert.ok(app.includes("promptSelection={chosenPrompt}"));
 assert.ok(grid.includes("setBrief(promptSelection.text)"));
 assert.ok(grid.includes("setCreativeSettings(promptSelection.settings)"));
 assert.ok(grid.includes("prompt:brief.trim()"));
 assert.ok(grid.includes("sourceId,referenceId,kind,brief,designMode,designPreset,creativeSettings"));
 assert.ok(ui.includes("onUse(compiled,{...settings,instruction:manual})"));
});
test('saved prompts remain private to authenticated owner with no unprotected public editing',()=>{
 assert.ok(sql.includes('alter table public.content_lab_prompts enable row level security'));
 assert.ok(sql.includes('owner_id=(select auth.uid())'));
 assert.ok(sql.includes("status='active'"));
 assert.ok(sql.includes('from anon'));
 assert.ok(sql.includes('revoke update(owner_id)'));
 assert.ok(api.includes("if(path==='/api/prompts')return {data:await list('prompts')}"));
 assert.ok(api.includes("path==='/api/prompts'"));
 assert.ok(ui.includes("api.post('/api/prompts'"));
 assert.ok(ui.includes("api.delete('/api/prompts/'+id)"));
 assert.ok(ui.includes("api.put('/api/prompts/'+item.id"));
});
test('Cloudflare supports actual guidance and reference images, no invented negative_prompt field',()=>{
 assert.ok(backend.includes("form.set('guidance'"));
 assert.ok(backend.includes("form.set('seed'"));
 assert.ok(backend.includes("form.append('input_image_'+i"));
 assert.ok(backend.includes("const userPrompt=clean(body.prompt,1480)"));
 assert.ok(backend.includes("const userDirection=clean(grid.brief,1100)"));
 assert.ok(backend.includes("creativeSettings:body.creativeSettings||null"));
 assert.ok(backend.includes("const guidance=settings.fidelity==='strict'?5.7:4.2"));
 assert.ok(backend.includes("refId!==sourceId"));
 assert.ok(!backend.includes("form.set('negative_prompt'"));
});
test('quick variations are from original reference and cost one photo credit',()=>{
 assert.ok(grid.includes("testOnePhoto('More candid natural light"));
 assert.ok(grid.includes("testOnePhoto('Change ONLY the environmental"));
 assert.ok(grid.includes("askCredits('photo',1"));
 assert.ok(grid.includes('no retocan píxeles de la foto generada'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('All eight freebie composition directions appear in the paid Lab with a distinct ninth',()=>{
 const freebie=read('public/prompts/index.html');
 const prompts=read('src/OnePhotoNinePrompts.ts');
 const names=['Asymmetric Editorial','Monumental Center','Type Behind Product','Side-Cropped Close-Up',
  'Offset Negative Space','Diagonal Visual Flow','Vertical Editorial Stack','Magazine Column Split'];
 for(const name of names){
  assert.ok(freebie.includes(name),'missing from freebie: '+name);
  assert.ok(prompts.includes(name),'missing from Lab: '+name);
 }
 assert.ok(prompts.includes("name:'Sensory Product Hero'"));
 assert.ok(prompts.includes('matcha campaign photography'));
 assert.ok(prompts.includes('not a contact sheet'));
 assert.ok(prompts.includes('If I have not attached it yet, ask me to upload it BEFORE'));
 assert.ok(prompts.includes('Preserve the real product identity faithfully'));
 assert.ok(prompts.includes('Do not add any overlay headline'));
});
test('Quick creation uses the real original photo, nine editable posts and no AI call or photo quota',()=>{
 const grid=read('src/BrandGrid.tsx'),client=read('src/platform/client.ts');
 const chunk=grid.slice(grid.indexOf('const createQuickNine=async()=>'),grid.indexOf('const uploadChatGptResult=async'));
 assert.ok(chunk.includes("api.post('/api/grids'"));
 assert.ok(chunk.includes('ONE_PHOTO_NINE.map'));
 assert.ok(chunk.includes("kind:'preserve'"));
 assert.ok(chunk.includes("assetId:''"));
 assert.ok(chunk.includes('planningSource:'));
 assert.ok(!chunk.includes("askCredits("));
 assert.ok(!chunk.includes("/api/grid-plan"));
 assert.ok(client.includes("if(path==='/api/grids')"));
 assert.ok(client.includes("personalAssets.some"));
 assert.ok(client.includes("personalBrands.some"));
});
test('Real ChatGPT guidance keeps user photos private until manually attached and imports result per post',()=>{
 const grid=read('src/BrandGrid.tsx');
 assert.ok(grid.includes('https://chatgpt.com/'));
 assert.ok(grid.includes('onePhotoNinePrompt(selected,'));
 assert.ok(grid.includes('navigator.clipboard.writeText(currentPrompt)'));
 assert.ok(grid.includes('El Content Lab no envía fotos a ChatGPT automáticamente.'));
 assert.ok(grid.includes("onUploadFile(file,'original')"));
 assert.ok(grid.includes('update({assetId:asset.id})'));
 assert.ok(grid.includes("photo:(tile.assetId&&images[tile.assetId])"));
 assert.ok(grid.includes('thumb.toDataURL(\'image/png\')'));
 assert.ok(grid.includes('<details className="bg-box bg-advanced-config">'));
});

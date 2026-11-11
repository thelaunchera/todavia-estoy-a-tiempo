import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const read=path=>readFileSync(new URL('../src/'+path,import.meta.url),'utf8');

test('finished/draft classification respects deliberate user choice and legacy ready statuses',()=>{
 const js=ts.transpileModule(read('PostCollection.ts'),{compilerOptions:{
   module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};runInNewContext(js,{module:mod,exports:mod.exports});
 const {isFinishedPost,collectionStatusPatch}=mod.exports;
 assert.equal(isFinishedPost({status:'Draft'}),false);
 assert.equal(isFinishedPost({status:'Ready'}),true);
 assert.equal(isFinishedPost({status:'Published'}),true);
 assert.equal(isFinishedPost({status:'Draft',isFinished:true}),true);
 assert.equal(isFinishedPost({status:'Ready',isFinished:false}),false);
 assert.deepEqual({...collectionStatusPatch(true)},{status:'Ready',isFinished:true});
 assert.deepEqual({...collectionStatusPatch(false)},{status:'Draft',isFinished:false});
});

test('autosave never demotes a finished project and leaving editor commits a pending draft',()=>{
 const app=read('App.tsx');
 assert.match(app,/const finished=automatic\?isFinishedPost\(source\):true/);
 assert.match(app,/const draft=\{\.\.\.source,isFinished:finished/);
 assert.match(app,/draftFingerprint\(editorLatestRef\.current\)!==lastSavedFingerprintRef\.current/);
 assert.match(app,/void save\(editorLatestRef\.current,true\)/);
 assert.match(app,/setPosts\(prev =>source\.id/);
});

test('My Posts syncs automatically, splits collection, and can move items deliberately',()=>{
 const app=read('App.tsx'),api=read('platform/client.ts');
 assert.ok(api.includes("if(path==='/api/posts')return {data:await list('posts')}"));
 assert.ok(app.includes("const {data}=await api.get('/api/posts')"));
 assert.ok(app.includes("window.addEventListener('focus',sync)"));
 assert.ok(app.includes("document.addEventListener('visibilitychange',onVisible)"));
 assert.ok(app.includes("setPosts(data as Post[])"));
 for(const fragment of ["'Terminados':'Finished'","'Borradores':'Drafts'",
    "visiblePosts.slice().reverse().map(p =>","setPostSection(finished?'finished':'drafts')",
    "onClick={()=>void changeSavedPostSection(p)}"]){
   assert.ok(app.includes(fragment),fragment);
 }
});

test('each post card downloads its real saved design, with per-slide carousel PNG links',()=>{
 const app=read('App.tsx'),carousel=read('CarouselFactory.tsx'),css=read('index.css');
 assert.ok(app.includes('onClick={()=>void downloadSavedPost(p)}'));
 assert.ok(app.includes('projectCoverAssetIds(p)'));
 assert.ok(app.includes('await exportFreePost(p,brand,sources)'));
 assert.ok(app.includes('await renderSavedCarouselPages(p,brand,sources)'));
 assert.ok(app.includes('await canvasToLosslessPng(canvas)'));
 assert.ok(app.includes('href={file.url} download={file.name}'));
 assert.ok(carousel.includes('export async function renderSavedCarouselPages'));
 assert.ok(carousel.includes('drawSeamlessPages(slides,brand,images'));
 assert.ok(carousel.includes('overlayPanoramaPages(pages,layers,images'));
 assert.ok(css.includes('.postcard .postbottom .lab-post-download'));
 assert.ok(css.includes('.lab-post-section-tabs'));
 assert.ok(css.includes('min-height:44px'));
});

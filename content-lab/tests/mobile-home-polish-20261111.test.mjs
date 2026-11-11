import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('iPhone home polish keeps existing favicons, assets, editors and routes untouched',()=>{
 const app=read('src/App.tsx');
 const polish=read('src/MobileHomePolish.css');
 assert.match(app,/import '\.\/MobileHomePolish\.css'/);
 assert.match(app,/tab==='home'\?'top lab-home-top':'top'/);
 assert.match(polish,/\.app-shell \.top\.lab-home-top/);
 assert.match(polish,/background:#FAF8F3/);
 assert.match(polish,/backdrop-filter:none/);
 assert.match(polish,/\.app-shell \.lab-mobile-dock/);
 assert.match(polish,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(polish.replace(/\/\*[\s\S]*?\*\//g,''),/favicon|apple-touch-icon|manifest|\.factory-preview/);
});
test('saved work retains its real cover and uses a separate accessible resume affordance',()=>{
 const dashboard=read('src/CreatorDashboard.tsx');
 const polish=read('src/MobileHomePolish.css');
 const start=dashboard.indexOf('className="cld-project-card"');
 const end=dashboard.indexOf('</button>',start);
 const card=dashboard.slice(start,end);
 assert.ok(start>0&&end>start);
 assert.ok(card.includes('<ProjectCover post={post}'));
 assert.ok(card.indexOf('className="cld-cover-action"')>card.indexOf('className="cld-project-copy"'));
 assert.ok(card.includes('onClick={()=>onEditPost(post)}'));
 assert.match(polish,/\.cld-has-recents \.cld-project-cover/);
 assert.match(polish,/aspect-ratio:auto!important/);
});
test('small-screen resource text is readable without duplicate decorative art',()=>{
 const s=read('src/MobileHomePolish.css');
 assert.match(s,/\.cld-resource-card \.cld-resource-feature\{display:none\}/);
 assert.match(s,/\.cld-resource-card strong/);
 assert.match(s,/\.cld-resource-card small/);
 const dashboard=read('src/CreatorDashboard.tsx');
 for(const name of ['media','stickers','prompts','brand'])assert.ok(dashboard.includes('name="'+name+'"'));
});

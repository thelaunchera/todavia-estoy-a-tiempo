import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(path)=>readFileSync(new URL('../src/'+path,import.meta.url),'utf8');
const app=read('App.tsx');
const dashboard=read('CreatorDashboard.tsx');
const mobileCss=read('CreatorDashboard.css');

test('home renders the same creative dashboard for admins and paid members',()=>{
 const start=app.indexOf("{brand && tab === 'home' && (");
 const end=app.indexOf("{brand && tab === 'idea-bank'",start);
 assert.ok(start>=0&&end>start,'missing common home route');
 const home=app.slice(start,end);
 assert.match(home,/<CreatorDashboard\s/);
 assert.doesNotMatch(home,/aiWallet\?\.admin|isAdmin|memberRole|buyerRole/);
 assert.match(home,/posts=\{mine\}/,'projects must remain scoped to the current brand');
});

test('saved design has a single visible resume entry on the home dashboard',()=>{
 assert.match(dashboard,/recent\.length===0&&<button[^>]+className="cld-hero-action"/);
 assert.doesNotMatch(dashboard,/Continuar último diseño|Continue last design/);
 assert.match(dashboard,/recent\.map\(\(\{post\},index\)=>/,'recent projects remain directly editable');
 assert.match(dashboard,/onClick=\{\(\)=>onEditPost\(post\)\}/);
});

test('responsive project ordering has unnumbered headings',()=>{
 assert.match(mobileCss,/\.cld-has-recents \.cld-recents-section\{order:1\}/);
 assert.match(mobileCss,/\.cld-has-recents \.cld-create-section\{order:2\}/);
 assert.match(dashboard,/TUS PROYECTOS/);
 assert.match(dashboard,/Tus diseños recientes/);
 assert.doesNotMatch(dashboard,/01 · EMPEZAR|02 · TUS DISEÑOS|03 · TU WORKSPACE/);
});

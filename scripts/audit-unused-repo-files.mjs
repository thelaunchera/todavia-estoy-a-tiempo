/* Repo cleanup audit: no writes, no dependencies. Checks the actual checked-out
 * production sources. Potentially dynamically referenced public assets are
 * classified conservatively; deletion is a separate reviewed action. */
import {readdirSync,readFileSync,statSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const ignoreDirs=new Set(['.git','node_modules','dist','.next','_podcast_pages','.cache','coverage','build']);
const media=/\.(?:png|jpe?g|webp|svg|avif|gif|mp4|m4a|mp3|wav|woff2?)$/i;
const sources=/\.(?:html|css|scss|js|jsx|ts|tsx|json|jsonc|webmanifest|md|xml|yml|yaml|py|sql|txt)$/i;
function walk(dir='') {let files=[];for(const d of readdirSync(path.join(root,dir),{withFileTypes:true})){if(d.name.startsWith('.')&&d.isDirectory())continue;const p=path.posix.join(dir,d.name);if(d.isDirectory()){if(!ignoreDirs.has(d.name)) files.push(...walk(p))}else files.push(p)}return files}
const all=walk();const scan=all.filter(p=>sources.test(p) && !p.endsWith('audit-unused-repo-files.mjs')).map(p=>({path:p,text:readFileSync(path.join(root,p),'utf8')}));
const isQa=p=>/^(?:\.github\/|scripts\/|supabase\/|.*\/tests?\/)|\.(?:test|spec)\./.test(p);
const referenced=p=>{
 const name=path.posix.basename(p),without=name.replace(/\.[^.]+$/,'');
 const exact=scan.filter(f=>f.text.includes(name)||f.text.includes(p)||f.text.includes('/'+p)||f.text.includes(without+'/'));
 return {prod:exact.filter(f=>!isQa(f.path)).map(f=>f.path),qa:exact.filter(f=>isQa(f.path)).map(f=>f.path)};
};
let sum=all.reduce((n,p)=>n+statSync(path.join(root,p)).size,0);
const assets=all.filter(p=>media.test(p));
const css=all.filter(p=>/\.css$/i.test(p));
const unrefMedia=assets.map(p=>({p,bytes:statSync(path.join(root,p)).size,...referenced(p)})).filter(x=>x.prod.length===0).sort((a,b)=>b.bytes-a.bytes);
const unrefCss=css.map(p=>({p,bytes:statSync(path.join(root,p)).size,...referenced(p)})).filter(x=>x.prod.length===0).sort((a,b)=>b.bytes-a.bytes);
const stats={rootMB:+(sum/1e6).toFixed(2),files:all.length,images:assets.length,css:css.length,
    unrefMediaMB:+(unrefMedia.reduce((n,f)=>n+f.bytes,0)/1e6).toFixed(2)};
console.log('AUDIT_SUMMARY '+JSON.stringify(stats));
for (const f of unrefMedia) console.log('UNREF_MEDIA '+JSON.stringify({path:f.p,bytes:f.bytes,qa:f.qa.slice(0,3)}));
for (const f of unrefCss) console.log('UNREF_CSS '+JSON.stringify({path:f.p,bytes:f.bytes,qa:f.qa.slice(0,3)}));
console.log('AUDIT_NOTE: a filename absent from source may still be used via a dynamic path or an external direct link; do not auto-delete.');

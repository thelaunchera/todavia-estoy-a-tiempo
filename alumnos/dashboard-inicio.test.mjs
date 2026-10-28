import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';

class FakeNode {
 constructor(){this.hidden=false;this.dataset={};this.children=[];this.textContent='';this.attrs={};}
 replaceChildren(...children){this.children=children;}
 appendChild(child){this.children.push(child);}
 append(...children){this.children.push(...children);}
 setAttribute(key,value){this.attrs[key]=value;}
}
const ids=[
 'dashboard-notices','dashboard-next-action','dashboard-progress-real','dashboard-progress-empty',
 'dashboard-progress-shell','student-greeting-message','dashboard-progress-empty-title',
 'dashboard-progress-empty-desc','dashboard-next-kicker','dashboard-next-title',
 'dashboard-next-description','dashboard-next-detail','dashboard-tool-lessons',
 'dashboard-tool-materials','dashboard-tool-community'
];
const els=new Map(ids.map(id=>[id,new FakeNode()]));
globalThis.document={
 getElementById(id){return els.get(id)||null;},
 createElement(){return new FakeNode();},
 querySelector(){return {click(){globalThis.helpClicks=(globalThis.helpClicks||0)+1;}};}
};
const source=readFileSync(new URL('./dashboard-inicio.js',import.meta.url),'utf8');
const {renderAulaInicio}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const node=id=>els.get(id);
const ready=(code,title='Mi lección')=>({lesson_code:code,title,status:'ready',youtube_video_id:'abcdefghijk',description:'Practica aquí',minutes:12});
const draft={...ready('09','No publicada'),status:'draft'};
test('No muestra porcentajes ficticios antes de publicar los videos',()=>{
 renderAulaInicio({lessons:[],done:new Set(),resources:[]});
 assert.equal(node('dashboard-progress-real').hidden,true);
 assert.equal(node('dashboard-next-title').textContent,'Aquí empieza tu primera web.');
 assert.match(node('dashboard-notices').children[0].children[1].children[1].textContent,/preparación/);
 node('dashboard-next-action').onclick();
 assert.equal(globalThis.helpClicks,1);
});
test('No cuenta ni muestra como listo un borrador',()=>{
 let opened=-1;
 renderAulaInicio({lessons:[draft,ready('01')],done:new Set(),resources:[],onLesson:i=>opened=i});
 assert.equal(node('dashboard-progress-real').hidden,false);
 assert.match(node('dashboard-notices').children[0].children[1].children[1].textContent,/1 video disponible/);
 node('dashboard-next-action').onclick();
 assert.equal(opened,1);
});
test('El avance y el próximo módulo usan el progreso real',()=>{
 const lessons=[ready('01'),ready('02','Segunda clase')];
 let opened=-1;
 renderAulaInicio({lessons,done:new Set(['01']),resources:[],onLesson:i=>opened=i});
 assert.equal(node('dashboard-next-title').textContent,'Segunda clase');
 node('dashboard-next-action').onclick();
 assert.equal(opened,1);
});
test('La vista administrativa no muestra progreso de estudiante',()=>{
 let section='';
 renderAulaInicio({lessons:[draft,ready('01')],done:new Set(),adminPreview:true,resources:[],onView:s=>section=s});
 assert.equal(node('dashboard-progress-real').hidden,true);
 assert.equal(node('dashboard-progress-empty-title').textContent,'Vista previa privada');
 assert.match(node('dashboard-next-detail').textContent,/1 lista para publicar/);
 node('dashboard-next-action').onclick();
 assert.equal(section,'lecciones');
});
test('Cuando el estudiante termina, lleva al Club de Ideas',()=>{
 let section='';
 renderAulaInicio({lessons:[ready('01')],done:new Set(['01']),projectShared:false,onView:s=>section=s});
 assert.match(node('dashboard-next-title').textContent,/Terminaste/);
 node('dashboard-next-action').onclick();
 assert.equal(section,'comunidad');
});
test('La pantalla de inicio y el aviso admin son distintos y la comprobación de permisos sigue obligatoria',()=>{
 const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('./curso.js',import.meta.url),'utf8');
 assert.match(html,/dashboard-inicio.css/);
 assert.match(html,/id="admin-preview-banner"[^>]*hidden/);
 assert.match(app,/\$\('admin-preview-banner'\)\.hidden=!asAdmin/);
 assert.match(app,/isAuthorizedOwner\(who\)/);
 assert.match(app,/entitlement\?\.status!=='active'/);
 assert.match(app,/item\.status==='ready'&&validVideoId/);
});

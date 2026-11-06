(function installProjectTransfer(){
"use strict";
const catalogs=[
 {name:"offbrief-production-v1",store:"records"},
 {name:"offbrief-generated-clips-v1",store:"clips"},
 {name:"offbrief-ipad-studio-v1",store:"projects"}
];
const codec=new TextEncoder(),decoder=new TextDecoder(),magic="OBPK1\n";
const host=document.createElement("aside");
host.className="ob-transfer";
host.innerHTML=`<button class="ob-transfer-launch" type="button" aria-expanded="false">⇄ Transferir proyectos</button>
<div class="ob-transfer-panel" hidden>
<div class="ob-transfer-header"><strong>OFF BRIEF · Transfer</strong><button type="button" class="ob-transfer-dismiss" aria-label="Cerrar">×</button></div>
<p>Los proyectos y medios permanecen en el iPad. Para pasar a otro dominio, exporta una copia privada e impórtala en el nuevo Video Maker.</p>
<button type="button" class="ob-transfer-export">1 · Exportar todo con fotos y videos</button>
<label class="ob-transfer-import">2 · Importar archivo .obpack<input type="file" accept=".obpack,application/octet-stream" hidden/></label>
<small>Incluye proyectos, imágenes, clips, voces y notas. Nunca se sube a un servidor. No reemplaza datos que ya tengas.</small>
<p class="ob-transfer-status" aria-live="polite"></p>
</div>`;
document.body.appendChild(host);
const btn=host.querySelector(".ob-transfer-launch"),panel=host.querySelector(".ob-transfer-panel"),status=host.querySelector(".ob-transfer-status");
const style=document.createElement("style");
style.textContent=`
.ob-transfer{position:fixed;bottom:13px;right:13px;z-index:9999;font-family:system-ui,-apple-system,sans-serif;color:#191919}
.ob-transfer-launch{background:#f2d85b;color:#191919;border:1px solid #e4ca50;border-radius:99px;padding:12px 15px;font-size:12px;font-weight:800;box-shadow:0 7px 24px #0002}
.ob-transfer-panel{position:absolute;right:0;bottom:54px;background:#fffdf7;border:1px solid #ddd6c6;border-radius:14px;padding:16px;box-shadow:0 17px 55px #0004;width:min(355px,calc(100vw - 26px))}
.ob-transfer-panel[hidden]{display:none}
.ob-transfer-header{display:flex;justify-content:space-between;align-items:center;gap:8px}
.ob-transfer-header strong{font-size:14px}
.ob-transfer-dismiss{font-size:20px;border:0;background:#eceae2;border-radius:7px;padding:3px 10px}
.ob-transfer-panel p{font-size:11px;line-height:1.6;color:#666a64}
.ob-transfer-export,.ob-transfer-import{display:block;width:100%;padding:13px 12px;background:#191919;color:white;border:0;text-align:center;border-radius:9px;font-size:11px;font-weight:800;margin:10px 0;cursor:pointer}
.ob-transfer-import{background:#f2d85b;color:#191919}
.ob-transfer-panel small{font-size:10px;line-height:1.6;color:#878880}
.ob-transfer-status{font-size:11px!important;font-weight:750;color:#746232!important;overflow-wrap:anywhere}`;
document.head.appendChild(style);
const report=(message,isError=false)=>{status.textContent=message;status.style.color=isError?"#b44638":"#68562b";};
btn.addEventListener("click",()=>{panel.hidden=!panel.hidden;btn.setAttribute("aria-expanded",String(!panel.hidden));});
host.querySelector(".ob-transfer-dismiss").addEventListener("click",()=>{panel.hidden=true;btn.setAttribute("aria-expanded","false");});
let busy=false;
function openDb(item){
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(item.name,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(item.store))req.result.createObjectStore(item.store,{keyPath:"id"});};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error("Storage unavailable"));
 });
}
function allRows(db,store){
 return new Promise((resolve,reject)=>{
  const request=db.transaction(store,"readonly").objectStore(store).getAll();
  request.onsuccess=()=>resolve(request.result||[]);
  request.onerror=()=>reject(request.error);
 });
}
function putMany(db,store,items){
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(store,"readwrite"),table=tx.objectStore(store);
  for(const item of items)table.put(item);
  tx.oncomplete=()=>resolve();
  tx.onerror=()=>reject(tx.error||Error("Storage write failed"));
  tx.onabort=()=>reject(tx.error||Error("Not enough storage on this iPad"));
 });
}
function encodeValue(value,assets){
 if(value instanceof Blob){
  const index=assets.length;
  assets.push({data:value,name:typeof value.name==="string"?value.name:"",type:value.type||"application/octet-stream"});
  return {__ob_binary_index:index};
 }
 if(Array.isArray(value))return value.map(x=>encodeValue(x,assets));
 if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,encodeValue(v,assets)]));
 return value;
}
function restoreValue(value,media){
 if(Array.isArray(value))return value.map(x=>restoreValue(x,media));
 if(value&&typeof value==="object"){
  if(Object.keys(value).length===1&&Object.prototype.hasOwnProperty.call(value,"__ob_binary_index")){
   const blob=media[value.__ob_binary_index];if(!blob)throw Error("Media missing from backup");
   return blob;
  }
  return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,restoreValue(v,media)]));
 }
 return value;
}
async function makeBackup(){
 if(busy)return;busy=true;
 try{
  report("Recopilando proyectos y archivos multimedia…");
  const assets=[],collections=[];let total=0;
  for(const catalog of catalogs){
   const db=await openDb(catalog),items=await allRows(db,catalog.store);
   db.close();
   collections.push({...catalog,rows:items.map(x=>encodeValue(x,assets))});
   total+=items.length;
  }
  if(!total){report("Este navegador no tiene proyectos guardados todavía.",true);return;}
  const manifest=codec.encode(JSON.stringify({format:"OFFBRIEF",version:1,createdAt:new Date().toISOString(),collections,assets:assets.map(x=>({size:x.data.size,type:x.type,name:x.name}))}));
  const bytes=new Uint8Array(4);new DataView(bytes.buffer).setUint32(0,manifest.length,true);
  const archive=new Blob([codec.encode(magic),bytes,manifest,...assets.map(x=>x.data)],{type:"application/octet-stream"});
  const url=URL.createObjectURL(archive);
  const a=document.createElement("a");a.href=url;a.download="OFF_BRIEF_"+new Date().toISOString().slice(0,10)+".obpack";document.body.appendChild(a);a.click();a.remove();
  report("Archivo creado: "+total+" registros y "+assets.length+" fotos, videos o audios. Guárdalo en Archivos del iPad.");
  setTimeout(()=>URL.revokeObjectURL(url),60000);
 }catch(error){report("No se pudo exportar: "+(error.message||String(error)),true);}
 finally{busy=false;}
}
async function restoreBackup(file){
 if(!file||busy)return;busy=true;
 try{
  report("Leyendo archivo de copia…");
  const h=new Uint8Array(await file.slice(0,10).arrayBuffer());
  if(decoder.decode(h.slice(0,6))!==magic)throw Error("Archivo .obpack no reconocido");
  const len=new DataView(h.buffer).getUint32(6,true);
  if(len<10||len>30000000)throw Error("Manifiesto de tamaño inválido");
  const end=10+len;
  const meta=JSON.parse(await file.slice(10,end).text());
  if(meta.format!=="OFFBRIEF"||meta.version!==1||!Array.isArray(meta.collections)||!Array.isArray(meta.assets))throw Error("Formato no compatible");
  let offset=end;
  const blobs=[];
  for(const asset of meta.assets){
   if(!Number.isSafeInteger(asset.size)||asset.size<0||offset+asset.size>file.size)throw Error("La copia está incompleta");
   const part=file.slice(offset,offset+asset.size,asset.type||"application/octet-stream");
   blobs.push(asset.name?new File([part],asset.name,{type:asset.type||"application/octet-stream"}):part);
   offset+=asset.size;
  }
  let added=0,kept=0;
  for(const collection of meta.collections){
   const ref=catalogs.find(c=>c.name===collection.name&&c.store===collection.store);
   if(!ref||!Array.isArray(collection.rows))throw Error("Colección no compatible");
   const db=await openDb(ref),originals=await allRows(db,ref.store),existing=new Set(originals.map(x=>x.id));
   const todo=collection.rows.map(x=>restoreValue(x,blobs)).filter(x=>{
    if(existing.has(x.id)){kept++;return false;}return true;
   });
   await putMany(db,ref.store,todo);db.close();added+=todo.length;
  }
  report("Se importaron "+added+" registros. "+kept+" datos existentes conservados. Recargando el Studio…");
  setTimeout(()=>window.location.reload(),1300);
 }catch(error){report("No se pudo importar: "+(error.message||String(error)),true);}
 finally{busy=false;}
}
host.querySelector(".ob-transfer-export").addEventListener("click",makeBackup);
host.querySelector(".ob-transfer-import input").addEventListener("change",event=>{const file=event.target.files?.[0];if(file)restoreBackup(file);event.target.value="";});
})();
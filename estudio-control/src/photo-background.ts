/**
 * On-device background removal for original user uploads and library photos.
 * BG0 produces an alpha mask at its inference size. Composite that alpha over
 * the ORIGINAL pixels so the exported PNG keeps the source photograph's detail.
 */
type ProgressCallback=(label:string)=>void;
const ORIGINAL_DB='studio-photo-originals-v1';
const STORE='photos';
const sessionOriginals=new Map<string,Blob>();

const fileToDataUrl=(blob:Blob)=>new Promise<string>((resolve,reject)=>{
 const reader=new FileReader();
 reader.onerror=()=>reject(Error('No se pudo preparar la imagen transparente.'));
 reader.onload=()=>resolve(String(reader.result));
 reader.readAsDataURL(blob);
});

function openOriginalDatabase():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){reject(Error('Sin almacenamiento local'));return}
  const request=indexedDB.open(ORIGINAL_DB,1);
  request.onupgradeneeded=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);
  };
  request.onerror=()=>reject(request.error||Error('No se pudo guardar la foto original'));
  request.onsuccess=()=>resolve(request.result);
 });
}

export async function storeOriginalPhoto(blob:Blob):Promise<string>{
 const key=(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'
  ?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2));
 sessionOriginals.set(key,blob);
 try{
  const db=await openOriginalDatabase();
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite');
   tx.objectStore(STORE).put(blob,key);
   tx.oncomplete=()=>resolve();
   tx.onerror=()=>reject(tx.error||Error('No se pudo guardar la foto original'));
  });
  db.close();
 }catch{
  // Still reversible in the current session if Safari restricts IndexedDB.
 }
 return key;
}

export async function restoreOriginalPhoto(key:string):Promise<string>{
 let blob=sessionOriginals.get(key);
 if(!blob){
  try{
   const db=await openOriginalDatabase();
   blob=await new Promise<Blob|undefined>((resolve,reject)=>{
    const tx=db.transaction(STORE,'readonly');
    const request=tx.objectStore(STORE).get(key);
    request.onsuccess=()=>resolve(request.result as Blob|undefined);
    request.onerror=()=>reject(request.error||Error('No se pudo recuperar la foto original'));
   });
   db.close();
  }catch{/* A missing browser backup must not erase the cutout. */}
 }
 if(!blob)throw Error('No se encontró la foto original en este navegador. El recorte se conserva.');
 return fileToDataUrl(blob);
}

export async function originalBlobFromSource(src:string):Promise<Blob>{
 const response=await fetch(src);
 if(!response.ok)throw Error('No se pudo acceder a esta foto. Vuelve a subirla desde tu dispositivo.');
 const blob=await response.blob();
 if(!blob.type.startsWith('image/'))throw Error('Selecciona una foto JPG, PNG, WebP o HEIC compatible.');
 return blob;
}

const asBitmap=async(blob:Blob):Promise<ImageBitmap>=>{
 if(typeof createImageBitmap==='function')return createImageBitmap(blob);
 throw Error('El navegador no puede preparar la imagen. Actualiza Safari para usar esta opción.');
};

export async function cutoutOriginalPhoto(
 original:Blob,onProgress?:ProgressCallback
):Promise<string>{
 // Lazy-load AI only when the user explicitly chooses "Quitar fondo".
 const {removeBackground}=await import('@bg0/browser');
 const result=await removeBackground(original,{
  quality:'quality',
  onProgress:({stage,message}:{stage:string;message:string})=>{
   const labels:Record<string,string>={
    preparing:'Preparando la foto…',
    downloading:'Descargando el modelo IA (solo la primera vez)…',
    processing:'Quitando el fondo…',
    finishing:'Preparando PNG transparente…',
   };
   onProgress?.(labels[stage]||message||'Procesando foto…');
  }
 });
 const source=await asBitmap(original);
 const mask=await asBitmap(result.blob);
 try{
  // Keep high-resolution source pixels, even on iPhone where the model
  // computes its alpha at a reduced input size.
  const maxArea=20_000_000,maxSide=6144;
  const factor=Math.min(1,Math.sqrt(maxArea/(source.width*source.height)),
   maxSide/Math.max(source.width,source.height));
  const out=document.createElement('canvas');
  out.width=Math.max(1,Math.round(source.width*factor));
  out.height=Math.max(1,Math.round(source.height*factor));
  const ctx=out.getContext('2d');
  if(!ctx)throw Error('No se pudo preparar el recorte en este dispositivo.');
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(source,0,0,out.width,out.height);
  ctx.globalCompositeOperation='destination-in';
  ctx.drawImage(mask,0,0,out.width,out.height);
  ctx.globalCompositeOperation='source-over';
  const transparent=await new Promise<Blob>((resolve,reject)=>
   out.toBlob(blob=>blob?resolve(blob):reject(Error('No se pudo generar el PNG transparente.')),'image/png')
  );
  return await fileToDataUrl(transparent);
 }finally{
  source.close();mask.close();
 }
}

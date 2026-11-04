/** Local photo background removal, with original photos preserved for undo. */
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

/**
 * Safari can terminate an entire tab when a full-resolution photo, an AI model
 * and multiple 20MP canvases are held in memory at the same time. Decode and
 * reduce large photos BEFORE loading the AI model; the untouched original is
 * separately saved for restoration by SeamlessEditor.
 *
 * 2.4 MP still exceeds the 1080×1350 slide export resolution.
 */
async function prepareRemovalPhoto(original:Blob):Promise<Blob>{
  const mobile=/iPhone|iPad|iPod/i.test(navigator.userAgent)
    ||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const maxPixels=mobile?2_400_000:8_000_000;
  const maxSide=mobile?2048:4096;
  const bitmap=await asBitmap(original);
  try{
    const factor=Math.min(1,Math.sqrt(maxPixels/(bitmap.width*bitmap.height)),
      maxSide/Math.max(bitmap.width,bitmap.height));
    if(factor>=1)return original;
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*factor));
    canvas.height=Math.max(1,Math.round(bitmap.height*factor));
    const ctx=canvas.getContext('2d');
    if(!ctx)throw Error('No se pudo preparar la foto en este dispositivo.');
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    try{
      return await new Promise<Blob>((resolve,reject)=>
        canvas.toBlob(blob=>blob?resolve(blob):reject(Error('No se pudo preparar la foto.')),'image/png')
      );
    }finally{
      // Release the large intermediate pixel buffer before AI inference.
      canvas.width=1;canvas.height=1;
    }
  }finally{
    bitmap.close();
  }
}

export async function cutoutOriginalPhoto(
  original:Blob,onProgress?:ProgressCallback
):Promise<string>{
  onProgress?.('Preparando una versión segura para este dispositivo…');
  const prepared=await prepareRemovalPhoto(original);
  // BG0 already returns a fully composited transparent PNG. Do not duplicate
  // the full-resolution image and mask in additional canvases.
  const {removeBackground}=await import('@bg0/browser');
  const result=await removeBackground(prepared,{
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
  return fileToDataUrl(result.blob);
}

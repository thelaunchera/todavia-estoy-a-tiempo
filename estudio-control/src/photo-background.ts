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

/**
 * Remove an edge-connected, uniform-color photo background without AI, model
 * downloads or heavyweight canvases.  Never guess on a complex background:
 * leaving the original untouched is safer than erasing the subject.
 */
export async function cutoutSolidBackground(original:Blob):Promise<string>{
 if(typeof createImageBitmap!=='function')
  throw Error('Este navegador no permite preparar el recorte. Actualiza Safari.');
 const bitmap=await createImageBitmap(original);
 try{
  const scale=Math.min(1,2048/Math.max(bitmap.width,bitmap.height),
   Math.sqrt(2_400_000/(bitmap.width*bitmap.height)));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));
  canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  try{
   const ctx=canvas.getContext('2d',{willReadFrequently:true});
   if(!ctx)throw Error('No se pudo abrir el editor de imágenes.');
   ctx.imageSmoothingEnabled=true;
   ctx.imageSmoothingQuality='high';
   ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   const {width:w,height:h}=canvas;
   const image=ctx.getImageData(0,0,w,h),pixels=image.data;
   const corners=[0,w-1,(h-1)*w,w*h-1];
   const color=(i:number)=>[pixels[i*4],pixels[i*4+1],pixels[i*4+2]];
   const colors=corners.map(color);
   const distance=(a:number[],b:number[])=>(
    (a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);
   // At least two corners must agree on the background color.
   let candidates:number[]=[];
   for(const reference of colors){
    const cluster=colors.filter(c=>distance(c,reference)<38**2);
    if(cluster.length>candidates.length/3)candidates=cluster.flat();
   }
   if(candidates.length<6)
    throw Error('El fondo tiene colores diferentes. Esta herramienta solo quita fondos lisos; la foto no se modificó.');
   const count=candidates.length/3;
   const bg=[0,1,2].map(ch=>Math.round(candidates.reduce(
    (sum,n,i)=>sum+(i%3===ch?n:0),0)/count));
   // Only connected pixels near the canvas border are eligible for removal.
   const visited=new Uint8Array(w*h),queue=new Int32Array(w*h);
   let head=0,tail=0;
   const add=(i:number)=>{
    if(i<0||i>=w*h||visited[i])return;
    visited[i]=1;
    const j=i*4;
    if((pixels[j]-bg[0])**2+(pixels[j+1]-bg[1])**2+
      (pixels[j+2]-bg[2])**2>50**2)return;
    queue[tail++]=i;
   };
   for(let x=0;x<w;x++){add(x);add((h-1)*w+x)}
   for(let y=0;y<h;y++){add(y*w);add(y*w+w-1)}
   if(tail<w+h)
    throw Error('No detecté suficiente fondo uniforme. La foto original sigue intacta.');
   let removed=0;
   while(head<tail){
    const i=queue[head++],x=i%w,y=Math.floor(i/w);
    pixels[i*4+3]=0;removed++;
    if(x>0)add(i-1);
    if(x<w-1)add(i+1);
    if(y>0)add(i-w);
    if(y<h-1)add(i+w);
   }
   if(removed<w*h*.02)
    throw Error('No detecté un fondo liso que pueda eliminar sin dañar la foto.');
   ctx.putImageData(image,0,0);
   const result=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(
    blob=>blob?resolve(blob):reject(Error('No se pudo generar el PNG transparente.')),'image/png'));
   return fileToDataUrl(result);
  }finally{canvas.width=1;canvas.height=1;}
 }finally{bitmap.close();}
}

import {Unzip,UnzipInflate} from 'fflate';

export type StickerZipLimits={
 maxImages:number;
 maxImageBytes:number;
 maxUnpackedBytes:number;
};

export type StickerZipResult={count:number;totalBytes:number};

const IMAGE_FILE=/\.(png|jpe?g|webp)$/i;
const INPUT_CHUNK_BYTES=256*1024;

const cleanEntryName=(path:string)=>path.split('/').pop()?.trim()||'';
const imageMime=(name:string)=>/\.png$/i.test(name)?'image/png':/\.webp$/i.test(name)?'image/webp':'image/jpeg';
const isUsableImage=(path:string)=>{
 const name=cleanEntryName(path);
 return Boolean(name&&IMAGE_FILE.test(name)&&!path.includes('__MACOSX')&&!name.startsWith('.'));
};

/**
 * Extract one image at a time and wait for its consumer before reading more of
 * the archive. This keeps iPhone Safari from holding the ZIP, every expanded
 * PNG and every base64 preview in memory at the same time.
 */
export async function streamStickerZip(
 archive:File,
 limits:StickerZipLimits,
 onImage:(image:File,index:number)=>Promise<void>
):Promise<StickerZipResult>{
 if(!archive.size)throw Error('El ZIP está vacío.');
 let discovered=0,completed=0,declaredBytes=0,actualBytes=0;
 let failure:Error|null=null;
 let consumer=Promise.resolve();

 const fail=(message:string)=>{if(!failure)failure=Error(message)};
 const unzipper=new Unzip(entry=>{
  if(failure||!isUsableImage(entry.name))return;
  const name=cleanEntryName(entry.name);
  const declared=Number.isFinite(entry.originalSize)?Number(entry.originalSize):0;
  discovered++;
  if(discovered>limits.maxImages){fail(`Importa hasta ${limits.maxImages} imágenes por tanda.`);return;}
  if(declared>limits.maxImageBytes){fail('El ZIP contiene una imagen mayor de 18 MB.');return;}
  declaredBytes+=declared;
  if(declaredBytes>limits.maxUnpackedBytes){fail('El ZIP supera 120 MB después de descomprimir.');return;}

  let chunks:Uint8Array<ArrayBuffer>[]=[];
  let imageBytes=0;
  entry.ondata=(error,chunk,final)=>{
   if(error){fail('El ZIP está dañado o usa una compresión no compatible.');chunks=[];return;}
   if(failure){chunks=[];entry.terminate();return;}
   imageBytes+=chunk.byteLength;
   actualBytes+=chunk.byteLength;
   if(imageBytes>limits.maxImageBytes){fail('El ZIP contiene una imagen mayor de 18 MB.');chunks=[];entry.terminate();return;}
   if(actualBytes>limits.maxUnpackedBytes){fail('El ZIP supera 120 MB después de descomprimir.');chunks=[];entry.terminate();return;}
   if(chunk.byteLength)chunks.push(chunk);
   if(!final)return;
   const image=new File(chunks,name,{type:imageMime(name)});
   chunks=[];
   const index=discovered;
   consumer=consumer.then(async()=>{
    await onImage(image,index);
    completed++;
   });
  };
  try{entry.start();}catch{fail('El ZIP está dañado o usa una compresión no compatible.');}
 });
 unzipper.register(UnzipInflate);

 try{
  for(let offset=0;offset<archive.size;offset+=INPUT_CHUNK_BYTES){
   const end=Math.min(archive.size,offset+INPUT_CHUNK_BYTES);
   const chunk=new Uint8Array(await archive.slice(offset,end).arrayBuffer());
   try{unzipper.push(chunk,end===archive.size);}catch{fail('El ZIP está dañado o no se pudo abrir.');}
   await consumer;
   if(failure)throw failure;
  }
  await consumer;
 }catch(error){
  throw error instanceof Error?error:Error('No se pudo abrir el ZIP.');
 }
 if(failure)throw failure;
 if(!discovered)throw Error('El ZIP no contiene imágenes PNG, JPG o WEBP.');
 if(completed!==discovered)throw Error('El ZIP terminó antes de completar todas las imágenes.');
 return {count:completed,totalBytes:actualBytes};
}

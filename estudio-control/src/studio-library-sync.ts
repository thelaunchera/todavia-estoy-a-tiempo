import {useEffect,useRef,useState} from 'react';
import {loadStudioLabAssets,publishStudioLabAsset,type StudioLabAsset} from './supabase-client';
import {readEditorRecord,writeEditorRecord} from './seamless-persistence';
import {CREATIVE_EDITOR_RULES} from '../../creative-shared/editor-rules';
import {classifyAdminDesignAsset} from '../../creative-shared/design-asset-kind';

/** Only admin library uploads may be shared. Photos added directly to a design
 * never pass through this hook and remain user-owned.
 */
async function prepareFile(file:File,kind:'sticker'|'background'):Promise<File>{
 if(file.size>CREATIVE_EDITOR_RULES.maxSourceFileBytes)throw Error('Archivo mayor de 25 MB.');
 const mime=file.type||(/\.png$/i.test(file.name)?'image/png':/\.webp$/i.test(file.name)?'image/webp':'image/jpeg');
 if(!['image/png','image/jpeg','image/webp'].includes(mime))throw Error('Formato no admitido.');
 if(file.size<=CREATIVE_EDITOR_RULES.maxPublishedFileBytes&&(kind==='background'||mime==='image/png'))
  return new File([file],file.name,{type:mime});
 const bitmap=await createImageBitmap(file);
 try{
  const output=kind==='sticker'?'image/png':mime;
  let scale=Math.min(1,3000/Math.max(bitmap.width,bitmap.height),Math.sqrt(7_000_000/(bitmap.width*bitmap.height)));
  for(let attempt=0;attempt<14;attempt++){
   const canvas=document.createElement('canvas');
   canvas.width=Math.max(64,Math.round(bitmap.width*scale));
   canvas.height=Math.max(64,Math.round(bitmap.height*scale));
   const ctx=canvas.getContext('2d');
   if(!ctx)throw Error('No se pudo preparar la imagen.');
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Error de imagen.')),output,.94));
   if(blob.size>200&&blob.size<=CREATIVE_EDITOR_RULES.maxPublishedFileBytes){
    const ext=output==='image/png'?'png':output==='image/webp'?'webp':'jpg';
    return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.'+ext,{type:output});
   }
   scale*=.83;
  }
  throw Error('No se pudo adaptar al límite de 5 MB del catálogo.');
 }finally{bitmap.close();}
}
const SYNC_KEY='studio-lab-synced-library-stickers-v1';
export function useStudioLibrarySync(
 imported:StudioLabAsset[],
 onLibraryChanged:(items:StudioLabAsset[])=>void,
 onLibraryError:(message:string)=>void
){
 const [syncStatus,setSyncStatus]=useState('');
 const [backgroundStatus,setBackgroundStatus]=useState('');
 const [publishingBackgrounds,setPublishingBackgrounds]=useState(false);
 const [cycle,setCycle]=useState(0);
 const running=useRef(false);
 const rerun=useRef(false);
 const refresh=async()=>{
  try{onLibraryChanged(await loadStudioLabAssets());}
  catch(e){onLibraryError(e instanceof Error?e.message:'No se pudo actualizar la biblioteca del Lab.');}
 };
 useEffect(()=>{
  if(!imported.length)return;
  if(running.current){rerun.current=true;return;}
  running.current=true;
  let active=true;
  const work=async()=>{
   try{
    const synced:Record<string,boolean>=(await readEditorRecord<Record<string,boolean>>(SYNC_KEY).catch(()=>null))||{};
    const missing=imported.filter(item=>item.id.startsWith('studio-import-')&&!synced[item.id]);
    if(!missing.length)return;
    let added=0,duplicates=0;const errors:string[]=[];
    setSyncStatus('Organizando '+missing.length+' recursos en Stickers y Fondos del Lab…');
    for(const asset of missing){
     try{
      if(!asset.url.startsWith('data:image/')&&!asset.url.startsWith('blob:'))throw Error('Archivo local no disponible.');
      const blob=await(await fetch(asset.url)).blob();
      const ext=blob.type==='image/webp'?'.webp':blob.type==='image/jpeg'?'.jpg':'.png';
      const input=new File([blob],asset.name+ext,{type:blob.type});
      const kind=asset.category==='background'?'background':await classifyAdminDesignAsset(input,asset.name);
      const result=await publishStudioLabAsset(await prepareFile(input,kind),kind,asset.name);
      if(result.duplicate)duplicates++;else added++;
      synced[asset.id]=true;
      await writeEditorRecord(SYNC_KEY,synced);
     }catch(e){errors.push(asset.name+': '+(e instanceof Error?e.message:'Error'));}
    }
    if(added||duplicates)await refresh();
    if(active)setSyncStatus((added?added+' nuevos publicados. ':'')+
     (duplicates?duplicates+' ya existían. ':'')+
     (errors.length?errors.length+' pendientes: '+errors[0]:'Sincronizado con el Lab.'));
   }catch(e){if(active)setSyncStatus(e instanceof Error?e.message:'La sincronización no se completó.');}
   finally{running.current=false;if(rerun.current){rerun.current=false;setCycle(n=>n+1);}}
  };
  void work();
  return()=>{active=false};
 },[imported,cycle]);
 const publishBackgrounds=async(files:File[])=>{
  if(!files.length)return;
  if(files.length>CREATIVE_EDITOR_RULES.maxStickerImportCount){
   setBackgroundStatus('Máximo 100 fondos por tanda.');return;
  }
  setPublishingBackgrounds(true);
  let added=0,duplicates=0;const errors:string[]=[];
  try{
   for(const file of files){
    try{
     const result=await publishStudioLabAsset(await prepareFile(file,'background'),'background',file.name);
     if(result.duplicate)duplicates++;else added++;
    }catch(e){errors.push(file.name+': '+(e instanceof Error?e.message:'Error'));}
   }
   if(added||duplicates)await refresh();
   setBackgroundStatus((added?added+' fondos nuevos. ':'')+(duplicates?duplicates+' existentes. ':'')+
    (errors.length?errors.length+' pendientes: '+errors[0]:'Publicados en Studio y Lab.'));
  }finally{setPublishingBackgrounds(false);}
 };
 return {syncStatus,backgroundStatus,publishingBackgrounds,publishBackgrounds,retry:()=>setCycle(n=>n+1)};
}

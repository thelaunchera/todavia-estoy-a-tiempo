import {readEditorRecord,writeEditorRecord} from './seamless-persistence';
import {streamStickerZip} from './sticker-zip-import';
import {classifyAdminDesignAsset} from '../../creative-shared/design-asset-kind';
import type {StudioLabAsset} from './supabase-client';
import {CREATIVE_EDITOR_RULES} from '../../creative-shared/editor-rules';

/** Shared persistence contract with Carousel Studio. Never migrate or rewrite v1. */
export const STUDIO_STICKER_V1='studio-imported-stickers-v1';
export const STUDIO_STICKER_V2='studio-imported-stickers-v2';
export const STUDIO_CATEGORY_OVERRIDES='studio-asset-category-overrides-v1';
export const STUDIO_APPROVED_SHARES='studio-lab-approved-shares-v1';
export const studioStickerBlobKey=(id:string)=>'studio-sticker-blob-v2:'+id;

export async function loadLocalStudioStickers():Promise<{
 assets:StudioLabAsset[];objectUrls:string[];missing:number
}>{
 const [old,current]=await Promise.all([
  readEditorRecord<StudioLabAsset[]>(STUDIO_STICKER_V1),
  readEditorRecord<StudioLabAsset[]>(STUDIO_STICKER_V2)
 ]);
 const legacy=Array.isArray(old)?old.filter(a=>a&&a.id&&a.name&&a.url):[];
 const seen=new Set(legacy.map(a=>a.id));
 const assets=[...legacy],objectUrls:string[]=[];
 let missing=0;
 try{
  for(const item of Array.isArray(current)?current:[]){
   if(!item?.id||!item.name||item.url!=='studio-blob:'+item.id||seen.has(item.id))continue;
   const blob=await readEditorRecord<Blob>(studioStickerBlobKey(item.id)).catch(()=>null);
   if(!(blob instanceof Blob)){missing++;continue;}
   const url=URL.createObjectURL(blob);
   objectUrls.push(url);assets.push({...item,url});seen.add(item.id);
  }
 }catch(e){objectUrls.forEach(URL.revokeObjectURL);throw e;}
 return {assets,objectUrls,missing};
}

export async function importLocalStudioStickers(
 files:File[],previousIds:ReadonlySet<string>,onProgress:(message:string)=>void
):Promise<{added:number;duplicates:number;error:string}>{
 if(!files.length)return {added:0,duplicates:0,error:''};
 const index=(await readEditorRecord<StudioLabAsset[]>(STUDIO_STICKER_V2))||[];
 if(!Array.isArray(index))throw Error('No se pudo abrir el índice local. No se borró nada.');
 const seen=new Set([...previousIds,...index.map(item=>item.id)]);
 let added=0,duplicates=0,found=0,total=0,error='';
 const add=async(image:File)=>{
  found++;total+=image.size;
  if(found>CREATIVE_EDITOR_RULES.maxStickerImportCount||total>120_000_000)
   throw Error('Importa hasta 100 imágenes y 120 MB por tanda.');
  if(image.size>18_000_000)throw Error('Cada imagen debe pesar menos de 18 MB.');
  const digest=await crypto.subtle.digest('SHA-256',await image.arrayBuffer());
  const hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
  const id='studio-import-'+hash;
  if(seen.has(id)){duplicates++;return;}
  const name=image.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
  const category=await classifyAdminDesignAsset(image,image.name);
  const asset:StudioLabAsset={id,name,category,url:'studio-blob:'+id};
  onProgress('Guardando '+(found)+' · '+name);
  await writeEditorRecord(studioStickerBlobKey(id),image);
  // Per-image commits preserve previous content if later entries are corrupt.
  await writeEditorRecord(STUDIO_STICKER_V2,[...index,asset]);
  index.push(asset);seen.add(id);added++;
  await new Promise<void>(resolve=>setTimeout(resolve,0));
 };
 try{
  for(const file of files){
   if(file.size>CREATIVE_EDITOR_RULES.maxStickerZipBytes)
    throw Error('Cada ZIP debe pesar menos de 60 MB.');
   if(/\.zip$/i.test(file.name)||/^(?:application\/(?:zip|x-zip-compressed))$/i.test(file.type)){
    await streamStickerZip(file,{
     maxImages:CREATIVE_EDITOR_RULES.maxStickerImportCount-found,
     maxImageBytes:18_000_000,maxUnpackedBytes:120_000_000-total
    },add);
   }else if(/\.(png|jpe?g|webp)$/i.test(file.name)){
    await add(file);
   }
  }
  if(!found)throw Error('Selecciona PNG, JPG, WEBP o ZIP con imágenes.');
 }catch(e){error=e instanceof Error?e.message:'No se completó la importación.';}
 return {added,duplicates,error};
}

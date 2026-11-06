/**
 * Shared Studio/Content Lab library classifier.
 * Never applies to the customer's uploads *inside* an editor: those remain private.
 * A forced type takes precedence; automatic checks only run in admin catalogue imports.
 */
export type DesignLibraryKind='sticker'|'background';
export type ImportKind='auto'|DesignLibraryKind;
const backgroundWords=/(?:^|[/_\s.-])(?:backgrounds?|fondos?|wallpapers?|patterns?|textures?|backdrops?)(?:$|[/_\s.-])/i;
const stickerWords=/(?:^|[/_\s.-])(?:stickers?|avatars?|badges?|labels?|tags?|ribbons?|banners?|bow|clipart|icons?|elementos?)(?:$|[/_\s.-])/i;
export async function classifyAdminDesignAsset(file:File,sourcePath=file.name,mode:ImportKind='auto'):Promise<DesignLibraryKind>{
 if(mode!=='auto')return mode;
 if(backgroundWords.test(sourcePath))return 'background';
 if(stickerWords.test(sourcePath))return 'sticker';
 if(typeof createImageBitmap!=='function'||typeof document==='undefined')return 'sticker';
 let bitmap:ImageBitmap;
 try{bitmap=await createImageBitmap(file);}catch{return 'sticker';}
 try{
  const ratio=bitmap.width/bitmap.height;
  // 4:5 feed artwork is a strong signal. Square resources stay stickers
  // unless they were named or packaged as backgrounds.
  if(ratio<0.70||ratio>0.90||bitmap.width<600||bitmap.height<700)return 'sticker';
  const canvas=document.createElement('canvas');
  canvas.width=20;canvas.height=20;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)return 'sticker';
  ctx.clearRect(0,0,20,20);
  ctx.drawImage(bitmap,0,0,20,20);
  const pixel=ctx.getImageData(0,0,20,20).data;
  let transparent=0;
  for(let index=3;index<pixel.length;index+=4)if(pixel[index]<250)transparent++;
  return transparent<=1?'background':'sticker';
 }catch{return 'sticker';}
 finally{bitmap.close();}
}

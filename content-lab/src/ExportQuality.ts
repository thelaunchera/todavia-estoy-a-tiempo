/** Lossless PNG export helpers shared by Content Lab editors.
 * The compact on-screen preview is NEVER the export source.
 * Pixel dimensions are matched to the largest available original, within
 * a per-canvas safety limit for mobile Safari.
 */
export async function withExportTimeout<T>(work:Promise<T>,milliseconds:number,message:string):Promise<T>{
  let timer:number|undefined;
  try{
    return await Promise.race([
      work,
      new Promise<never>((_,reject)=>{timer=window.setTimeout(()=>reject(Error(message)),milliseconds)})
    ]);
  }finally{
    window.clearTimeout(timer);
  }
}

export async function sourceAwareScale(
  sources:(string|undefined)[], baseWidth:number, baseHeight:number, maxScale=4,
):Promise<number>{
  let factor=2;
  for(const source of new Set(sources.filter((s):s is string=>Boolean(s)))){
    try{
      const im=new Image();
      im.src=source;
      await im.decode();
      if(im.naturalWidth&&im.naturalHeight)
        factor=Math.max(factor,Math.ceil(Math.max(im.naturalWidth/baseWidth,im.naturalHeight/baseHeight)));
    }catch{/* Missing media is reported by the underlying editor renderer. */}
  }
  return Math.max(1,Math.min(maxScale,factor));
}

export function canvasToLosslessPng(canvas:HTMLCanvasElement):Promise<Blob>{
  return new Promise((resolve,reject)=>canvas.toBlob(
    blob=>blob&&blob.type==='image/png'?resolve(blob):reject(new Error('No se pudo generar el PNG sin pérdida.')),
    'image/png'));
}

export async function downloadLosslessPng(canvas:HTMLCanvasElement,basename:string){
  const blob=await canvasToLosslessPng(canvas);
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=basename.replace(/\.png$/i,'')+'-'+canvas.width+'x'+canvas.height+'.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Safari may need the object URL after the click event returns.
  window.setTimeout(()=>URL.revokeObjectURL(url),90000);
}

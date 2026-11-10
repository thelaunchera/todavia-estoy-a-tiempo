/** Optional, fully local animated carousel export.
 * Uses previously rendered PNG snapshots; no cloud upload, accounts or AI cost.
 * MP4 is selected only when the browser advertises support, otherwise WebM.
 */
export type CarouselVideo={blob:Blob;extension:'mp4'|'webm';mimeType:string};
export type CarouselVideoProgress=(slide:number,total:number)=>void;

export function carouselVideoAvailable():boolean{
 return typeof document!=='undefined'&&typeof MediaRecorder!=='undefined'
   &&typeof HTMLCanvasElement!=='undefined'
   &&typeof HTMLCanvasElement.prototype.captureStream==='function'
   &&!!supportedVideoMime();
}
function supportedVideoMime():string|undefined{
 if(typeof MediaRecorder==='undefined'||typeof MediaRecorder.isTypeSupported!=='function')return;
 return ['video/mp4;codecs=avc1.42E01E','video/mp4',
   'video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']
   .find(mime=>MediaRecorder.isTypeSupported(mime));
}
async function photoFromDataUrl(src:string):Promise<HTMLImageElement>{
 if(!/^data:image\/(png|jpeg|webp);base64,/i.test(src))throw Error('Prepara primero la vista previa completa.');
 const img=new Image();img.src=src;
 if(typeof img.decode==='function')await img.decode();
 else await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(Error('No se pudo cargar una diapositiva.'));});
 if(!img.naturalWidth||!img.naturalHeight)throw Error('Hay una diapositiva vacía.');
 return img;
}
export async function renderCarouselVideo(pages:string[],onProgress?:CarouselVideoProgress):Promise<CarouselVideo>{
 if(!carouselVideoAvailable())throw Error('Este navegador no permite grabar video del lienzo. Usa otro navegador o descarga tus PNG.');
 if(pages.length<1||pages.length>10)throw Error('El video necesita entre 1 y 10 slides.');
 const mime=supportedVideoMime();
 if(!mime)throw Error('No existe un formato de video compatible.');
 const photos=await Promise.all(pages.map(photoFromDataUrl));
 const isIphone=typeof navigator!=='undefined'&&/iPhone|iPod/i.test(navigator.userAgent);
 const width=isIphone?540:720,height=isIphone?675:900;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)throw Error('No se pudo preparar el video.');
 const duration=1750,total=pages.length*duration,fadeFrom=.84;
 const drawPhoto=(img:HTMLImageElement,zoom:number,opacity:number)=>{
  const size=Math.max(width/img.naturalWidth,height/img.naturalHeight)*zoom;
  const w=img.naturalWidth*size,h=img.naturalHeight*size;
  ctx.globalAlpha=opacity;ctx.drawImage(img,(width-w)/2,(height-h)/2,w,h);ctx.globalAlpha=1;
 };
 const draw=(elapsed:number)=>{
  const slide=Math.min(photos.length-1,Math.floor(elapsed/duration));
  const fraction=Math.max(0,Math.min(1,(elapsed-slide*duration)/duration));
  ctx.fillStyle='#FAF8F3';ctx.fillRect(0,0,width,height);
  drawPhoto(photos[slide],1+fraction*.025,1);
  if(slide<photos.length-1&&fraction>fadeFrom){
   const blend=(fraction-fadeFrom)/(1-fadeFrom);
   drawPhoto(photos[slide+1],1+(fraction-fadeFrom)*.012,Math.min(1,blend));
  }
  return slide;
 };
 draw(0);
 const stream=canvas.captureStream(15);
 if(!stream.getVideoTracks().length){stream.getTracks().forEach(track=>track.stop());throw Error('La grabación no tiene pista de video.');}
 let recorder:MediaRecorder;
 try{recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:isIphone?1_900_000:3_200_000});}
 catch{stream.getTracks().forEach(track=>track.stop());throw Error('No se pudo iniciar la grabación con este formato.');}
 const chunks:Blob[]=[];
 let frameHandle=0,timeoutHandle=0;
 try{
  const blob=await new Promise<Blob>((resolve,reject)=>{
   let settled=false;
   const complete=(value:Blob|Error)=>{
    if(settled)return;settled=true;
    if(value instanceof Error)reject(value);else resolve(value);
   };
   recorder.ondataavailable=event=>{if(event.data?.size)chunks.push(event.data);};
   recorder.onerror=()=>complete(Error('Falló la grabación del video.'));
   recorder.onstop=()=>{
     const data=new Blob(chunks,{type:recorder.mimeType||mime});
     complete(data.size?data:Error('El navegador devolvió un video vacío.'));
   };
   try{recorder.start(350);}catch{complete(Error('No se pudo iniciar MediaRecorder.'));return;}
   const started=performance.now();
   let lastSlide=-1;
   const tick=(now:number)=>{
     if(settled)return;
     const elapsed=Math.min(total,Math.max(0,now-started));
     const current=draw(elapsed);
     if(current!==lastSlide){lastSlide=current;onProgress?.(current+1,photos.length);}
     if(elapsed>=total){if(recorder.state!=='inactive')recorder.stop();return;}
     frameHandle=requestAnimationFrame(tick);
   };
   frameHandle=requestAnimationFrame(tick);
   timeoutHandle=window.setTimeout(()=>{
     if(recorder.state!=='inactive'){try{recorder.stop();}catch{}}
     complete(Error('La exportación tardó demasiado; intenta con menos slides.'));
   },Math.max(30000,total+15000));
  });
  const realMime=recorder.mimeType||mime;
  return {blob,extension:realMime.startsWith('video/mp4')?'mp4':'webm',mimeType:realMime};
 }finally{
  cancelAnimationFrame(frameHandle);
  clearTimeout(timeoutHandle);
  if(recorder.state!=='inactive')try{recorder.stop();}catch{}
  stream.getTracks().forEach(track=>track.stop());
  canvas.width=1;canvas.height=1;
 }
}

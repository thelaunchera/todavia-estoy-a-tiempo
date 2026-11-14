import {drawTransformedVideo,normalizeVideoTransform,videoTrim,type CarouselVideoTransform} from './CarouselVideoTransform';
import {withExportTimeout} from './ExportQuality';

export type EditedCarouselVideo={blob:Blob;extension:'mp4'|'webm'};
const MEDIA_READY_TIMEOUT=12_000;
const VIDEO_FINALIZE_TIMEOUT=10_000;

async function waitForVideo(
  video:HTMLVideoElement,event:'canplay'|'seeked',message:string,begin:()=>void
):Promise<void>{
  const listeners=new AbortController();
  try{
    await withExportTimeout(new Promise<void>((resolve,reject)=>{
      const options={once:true,signal:listeners.signal};
      video.addEventListener(event,()=>resolve(),options);
      video.addEventListener('error',()=>reject(Error(message)),options);
      begin();
    }),MEDIA_READY_TIMEOUT,message);
  }finally{
    listeners.abort();
  }
}
export function supportsCarouselVideoEditing():boolean{
  if(typeof window==='undefined')return false;
  const c=document.createElement('canvas');
  return typeof c.captureStream==='function'&&typeof MediaRecorder!=='undefined'&&
    !!['video/mp4','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
}
/**
 * Browser-native 4:5 export, retaining the clip's sound via WebAudio.
 * It records in real time to avoid pulling in a huge WASM encoding binary on
 * iPhones. Unsupported browsers show an actionable error, never an unchanged
 * original falsely labelled as the edited result.
 */
export async function renderEditedCarouselVideo(
 blob:Blob,raw:unknown,start:number,end:number,
 background:HTMLCanvasElement|undefined,
 progress?:(ratio:number,finalizing?:boolean)=>void,
 audioContext?:AudioContext,
 pageOffset=0,
 foreground?:HTMLCanvasElement
):Promise<EditedCarouselVideo>{
  if(!supportsCarouselVideoEditing())throw Error(
    'Este navegador no permite exportar videos editados. Conservamos tus cambios: prueba Safari actualizado o Chrome.'
  );
  const mime=['video/mp4','video/webm;codecs=vp8,opus','video/webm']
    .find(t=>MediaRecorder.isTypeSupported(t));
  if(!mime)throw Error('No hay un formato de video compatible con este navegador.');
  const canvas=document.createElement('canvas');
  canvas.width=1080;canvas.height=1350;
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw Error('No se pudo preparar el lienzo para exportar el video.');
  const original=URL.createObjectURL(blob);
  const video=document.createElement('video');
  video.preload='auto';video.playsInline=true;video.muted=false;
  video.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:.001;pointer-events:none;z-index:-1';
  document.body.appendChild(video);
  let capture:MediaStream|null=null,recorder:MediaRecorder|null=null,frame=0,timer:number|undefined;
  let context=audioContext;
  let audioSource:MediaElementAudioSourceNode|undefined;
  try{
    // Wait for a decodable frame before asking Safari to draw it.
    await waitForVideo(video,'canplay','No se pudo abrir el video. Intenta de nuevo o prueba con un MP4.',()=>{video.src=original});
    if(!video.videoWidth||!video.videoHeight||!Number.isFinite(video.duration))
      throw Error('No se pudo leer la duración o dimensiones del video.');
    const trim=videoTrim(start,end,video.duration);
    if(trim.end-trim.start+1e-7<.1)throw Error('Selecciona al menos 0.1 segundos para recortar.');
    if(trim.end-trim.start>90)throw Error(
      'Para exportar el video editado desde iPhone o iPad, recorta este clip a 90 segundos o menos.'
    );
    if(Math.abs(video.currentTime-trim.start)>=.06)
      await waitForVideo(video,'seeked','No se pudo abrir el recorte del video. Intenta de nuevo.',()=>{video.currentTime=trim.start});
    const transform=normalizeVideoTransform(raw);
    const draw=()=>{
      ctx.fillStyle='#FAF8F3';ctx.fillRect(0,0,canvas.width,canvas.height);
      if(background)ctx.drawImage(background,0,0,canvas.width,canvas.height);
      drawTransformedVideo(ctx,video,transform,canvas.width,canvas.height,pageOffset);
      if(foreground){
        // The editor places editable native photos, stickers and front layers
        // above the video. Restore their pixels ONLY where this video covers
        // them, avoiding doubled transparency everywhere else on the slide.
        const x=(transform.x+pageOffset)*canvas.width,y=transform.y*canvas.height;
        const w=transform.w*canvas.width,h=transform.h*canvas.height;
        const cx=x+w/2,cy=y+h/2,angle=transform.rotation*Math.PI/180;
        ctx.save();
        ctx.translate(cx,cy);ctx.rotate(angle);
        ctx.beginPath();ctx.rect(-w/2,-h/2,w,h);ctx.clip();
        ctx.rotate(-angle);ctx.translate(-cx,-cy);
        ctx.drawImage(foreground,0,0,canvas.width,canvas.height);
        ctx.restore();
      }
    };
    draw();
    context??=new AudioContext();
    await withExportTimeout(context.resume(),MEDIA_READY_TIMEOUT,'No se pudo activar el sonido. Toca exportar de nuevo.');
    // WebKit cannot captureStream() an HTMLVideoElement, so route its audio
    // through a MediaElementAudioSourceNode instead of relying on that API.
    const audioDestination=context.createMediaStreamDestination();
    audioSource=context.createMediaElementSource(video);
    audioSource.connect(audioDestination);
    const canvasStream=canvas.captureStream(30);
    capture=new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks()
    ]);
    const encoder=new MediaRecorder(capture,{mimeType:mime,videoBitsPerSecond:4_500_000});
    recorder=encoder;
    const pieces:Blob[]=[];
    const out=await new Promise<Blob>((resolve,reject)=>{
      let finishing=false;
      const deadline=(ms:number,message:string)=>{
        window.clearTimeout(timer);
        timer=window.setTimeout(()=>reject(Error(message)),ms);
      };
      encoder.ondataavailable=e=>{if(e.data.size)pieces.push(e.data)};
      encoder.onerror=()=>reject(Error('El navegador interrumpió la exportación del video. Intenta de nuevo.'));
      encoder.onstop=()=>{
        const file=new Blob(pieces,{type:encoder.mimeType||mime});
        if(!finishing||file.size<400)reject(Error('El navegador no completó el archivo de video. Intenta de nuevo.'));
        else resolve(file);
      };
      const tick=()=>{
        try{
          if(video.error)throw Error('No se pudo reproducir el video mientras se exportaba.');
          draw();
          if(video.ended||video.currentTime>=trim.end-.035){
            finishing=true;
            progress?.(.99,true);
            deadline(VIDEO_FINALIZE_TIMEOUT,'El navegador tardó demasiado en finalizar el video. Intenta de nuevo.');
            encoder.stop();
            return;
          }
          progress?.(Math.min(.99,Math.max(0,(video.currentTime-trim.start)/(trim.end-trim.start))));
          frame=requestAnimationFrame(tick);
        }catch(error){reject(error)}
      };
      // Export one complete recording and leave its sources live through onstop.
      encoder.start();
      deadline(MEDIA_READY_TIMEOUT,'El video no empezó a reproducirse. Toca exportar de nuevo.');
      void video.play().then(()=>{
        if(encoder.state!=='recording')return;
        deadline((trim.end-trim.start)*1000+MEDIA_READY_TIMEOUT,'Se interrumpió la reproducción. Mantén el editor abierto e intenta de nuevo.');
        frame=requestAnimationFrame(tick);
      },()=>reject(Error('El navegador bloqueó la reproducción. Toca exportar de nuevo.')));
    });
    progress?.(1);
    return {blob:out,extension:(encoder.mimeType||mime).startsWith('video/mp4')?'mp4':'webm'};
  }finally{
    window.clearTimeout(timer);
    cancelAnimationFrame(frame);
    if(recorder){
      recorder.ondataavailable=null;
      recorder.onerror=null;
      recorder.onstop=null;
      if(recorder.state!=='inactive')recorder.stop();
    }
    video.pause();
    audioSource?.disconnect();
    capture?.getTracks().forEach(track=>track.stop());
    if(!audioContext&&context)void context.close().catch(()=>{});
    video.removeAttribute('src');video.load();video.remove();
    URL.revokeObjectURL(original);
    canvas.width=1;canvas.height=1;
  }
}

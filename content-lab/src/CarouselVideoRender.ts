import {drawTransformedVideo,normalizeVideoTransform,videoTrim,type CarouselVideoTransform} from './CarouselVideoTransform';

export type EditedCarouselVideo={blob:Blob;extension:'mp4'|'webm'};
const loadVideo=(video:HTMLVideoElement)=>new Promise<void>((resolve,reject)=>{
  if(video.readyState>=1){resolve();return}
  const finish=()=>{video.removeEventListener('loadedmetadata',ok);video.removeEventListener('error',failed)};
  const ok=()=>{finish();resolve()};
  const failed=()=>{finish();reject(Error('No se pudo leer el archivo de video. Prueba a convertirlo a MP4.'))};
  video.addEventListener('loadedmetadata',ok,{once:true});
  video.addEventListener('error',failed,{once:true});
});
const seekVideo=async(video:HTMLVideoElement,position:number)=>{
  if(Math.abs(video.currentTime-position)<.06)return;
  await new Promise<void>((resolve,reject)=>{
    const finish=()=>{video.removeEventListener('seeked',ok);video.removeEventListener('error',failed)};
    const ok=()=>{finish();resolve()};
    const failed=()=>{finish();reject(Error('No se pudo recortar el inicio de este video.'))};
    video.addEventListener('seeked',ok,{once:true});
    video.addEventListener('error',failed,{once:true});
    video.currentTime=position;
  });
};
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
 progress?:(ratio:number)=>void,
 audioContext?:AudioContext
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
  video.src=original;video.preload='auto';video.playsInline=true;video.muted=false;
  video.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:.001;pointer-events:none;z-index:-1';
  document.body.appendChild(video);
  let capture:MediaStream|null=null,recorder:MediaRecorder|null=null,frame=0;
  const context=audioContext||new AudioContext();
  let finalized=false;
  try{
    await loadVideo(video);
    if(!video.videoWidth||!video.videoHeight||!Number.isFinite(video.duration))
      throw Error('No se pudo leer la duración o dimensiones del video.');
    const trim=videoTrim(start,end,video.duration);
    if(trim.end-trim.start<.1)throw Error('Selecciona al menos 0.1 segundos para recortar.');
    if(trim.end-trim.start>90)throw Error(
      'Para exportar el video editado desde iPhone o iPad, recorta este clip a 90 segundos o menos.'
    );
    await seekVideo(video,trim.start);
    const transform=normalizeVideoTransform(raw);
    const draw=()=>{
      ctx.fillStyle='#FAF8F3';ctx.fillRect(0,0,canvas.width,canvas.height);
      if(background)ctx.drawImage(background,0,0,canvas.width,canvas.height);
      drawTransformedVideo(ctx,video,transform,canvas.width,canvas.height);
    };
    draw();
    await context.resume();
    // WebKit cannot captureStream() an HTMLVideoElement, so route its audio
    // through a MediaElementAudioSourceNode instead of relying on that API.
    const audioSource=context.createMediaElementSource(video);
    const audioDestination=context.createMediaStreamDestination();
    audioSource.connect(audioDestination);
    const canvasStream=canvas.captureStream(30);
    capture=new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks()
    ]);
    recorder=new MediaRecorder(capture,{mimeType:mime,videoBitsPerSecond:4_500_000});
    const pieces:Blob[]=[];
    const saved=new Promise<Blob>((resolve,reject)=>{
      if(!recorder)return reject(Error('No se pudo iniciar la exportación.'));
      recorder.ondataavailable=e=>{if(e.data?.size)pieces.push(e.data)};
      recorder.onerror=()=>reject(Error('El navegador interrumpió la exportación del video.'));
      recorder.onstop=()=>{
        const out=new Blob(pieces,{type:recorder?.mimeType||mime});
        if(out.size<400)reject(Error('El navegador no produjo un video válido. No se descargará un archivo vacío.'));
        else resolve(out);
      };
    });
    recorder.start(250);
    try{await video.play()}catch(e){
      throw Error('Safari bloqueó la reproducción necesaria para exportar. Toca Exportar de nuevo desde esta página.');
    }
    await new Promise<void>((resolve,reject)=>{
      const tick=()=>{
        if(video.error){reject(Error('No se pudo reproducir este video mientras se exportaba.'));return;}
        try{draw()}catch{reject(Error('No se pudo procesar uno de los cuadros del video.'));return}
        progress?.(Math.min(1,(video.currentTime-trim.start)/Math.max(.1,trim.end-trim.start)));
        if(video.ended||video.currentTime>=trim.end-.035){resolve();return}
        frame=requestAnimationFrame(tick);
      };
      frame=requestAnimationFrame(tick);
    });
    video.pause();
    if(recorder.state==='recording')recorder.stop();
    const out=await saved;
    finalized=true;
    progress?.(1);
    return {blob:out,extension:(recorder.mimeType||mime).startsWith('video/mp4')?'mp4':'webm'};
  }finally{
    cancelAnimationFrame(frame);
    video.pause();
    if(recorder&&!finalized&&recorder.state==='recording')recorder.stop();
    capture?.getTracks().forEach(track=>track.stop());
    await context.close().catch(()=>{});
    video.removeAttribute('src');video.load();video.remove();
    URL.revokeObjectURL(original);
    canvas.width=1;canvas.height=1;
  }
}

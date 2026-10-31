import React,{useEffect,useRef,useState} from 'react';
import {ImagePlus,Upload,Film,Save,Download,Palette} from 'lucide-react';
import FreePostStudio from './FreePostStudio';
import {readCoverDecor,writeCoverDecor} from './CoverDecor';
import type {LibraryAsset} from './MediaAsset';
import './VerticalStudio.css';

type Post={title:string;hook:string;cta:string;template:string;assetId:string;format:string;designData?:string;status:string};
type Brand={id:string;name:string;color:string;background:string;headingFont?:string};
type Props={
 post:Post;brand:Brand;assets:LibraryAsset[];images:Record<string,string>;locale:'es'|'en';
 onChange:(next:Partial<Post>)=>void;onSave:()=>void;saving:boolean;
 onUploadPhoto:(file:File)=>Promise<LibraryAsset|null>;
 onUploadBackground:(file:File)=>Promise<LibraryAsset|null>;
 loadImage:(id:string)=>void;onOpenStickers:()=>void;notify:(message:string)=>void;
};
const labels={
 es:{title:'Portadas para Reels e historias',hint:'Un solo formato vertical. Escribe tu hook, sube una foto o un video y haz tu diseño a tu manera.',
 reel:'Reel',story:'Historia',hook:'Tu hook',place:'Escribe aquí el mensaje principal…',
 photo:'Subir foto',video:'Subir video',choose:'Selecciona tu estilo',light:'Editorial claro',full:'Foto completa',dark:'Editorial oscuro',
 cover:'Editar portada',saved:'Guardar portada',videoOnly:'Vista de tu video (solo en este dispositivo)',
 videoHelp:'El video es una vista previa local. Puedes usar un fotograma como portada y descargar el diseño PNG; el video original no se guarda ni se modifica.',
 frame:'Usar fotograma como portada',frameBusy:'Preparando fotograma…',edit:'Fotos, textos, stickers y fondos editables.'},
 en:{title:'Reel & Story Covers',hint:'One vertical format. Write your hook, add a photo or video, and edit the design your way.',
 reel:'Reel',story:'Story',hook:'Your hook',place:'Write your main message here…',
 photo:'Upload photo',video:'Upload video',choose:'Choose a style',light:'Light editorial',full:'Full photo',dark:'Dark editorial',
 cover:'Edit cover',saved:'Save cover',videoOnly:'Your video preview (on this device only)',
 videoHelp:'The video is a local preview. You can turn a frame into an editable PNG cover; the original video is not stored or modified.',
 frame:'Use frame as cover',frameBusy:'Preparing frame…',edit:'Edit photos, text, stickers and backgrounds.'}
};
export default function VerticalStudio({post,brand,assets,images,locale,onChange,onSave,saving,
 onUploadPhoto,onUploadBackground,loadImage,onOpenStickers,notify}:Props){
 const t=labels[locale];
 const photoRef=useRef<HTMLInputElement>(null),videoRef=useRef<HTMLInputElement>(null),player=useRef<HTMLVideoElement>(null);
 const [videoUrl,setVideoUrl]=useState(''),[videoName,setVideoName]=useState(''),[busy,setBusy]=useState(false);
 const [advanced,setAdvanced]=useState(true);
 useEffect(()=>()=>{if(videoUrl)URL.revokeObjectURL(videoUrl)},[videoUrl]);
 const setEditorial=(name:'light'|'full'|'dark')=>{
   const d=readCoverDecor(post.designData);
   const next=name==='full'?{...d,backgroundId:'brand' as const,
       backgroundImageId:post.assetId||d.backgroundImageId,
       headlineRect:{x:.07,y:.07,w:.86,h:.22},
       headlineStyle:{font:'serif',fontSize:90,color:'#FFFFFF',shadow:true,lineHeight:1.09,spacing:0}}
    :{...d,backgroundId:'brand' as const,backgroundImageId:'',color:name==='dark'?'#191919':'#FAF8F3',
       primaryPhotoRect:{x:.07,y:.33,w:.86,h:.55},
       headlineRect:{x:.08,y:.09,w:.84,h:.19},
       headlineStyle:{font:'serif',fontSize:88,color:name==='dark'?'#FFFFFF':'#191919',shadow:false,lineHeight:1.1,spacing:0}};
   onChange({designData:writeCoverDecor(post.designData,next)});
 };
 const usePhoto=async(file?:File)=>{
   if(!file)return;
   setBusy(true);
   try{
     const item=await onUploadPhoto(file);
     if(!item){notify(locale==='es'?'No se pudo guardar la foto.':'Photo upload failed.');return}
     const d=readCoverDecor(post.designData);
     onChange({assetId:item.id,designData:writeCoverDecor(post.designData,
       {...d,backgroundImageId:d.backgroundImageId?item.id:'',
          primaryPhotoRect:d.primaryPhotoRect||{x:.07,y:.33,w:.86,h:.55}})});
     notify(locale==='es'?'Foto añadida a la portada.':'Photo added to cover.');
   }catch(e){notify(e instanceof Error?e.message:'No se pudo subir la foto.')}
   finally{setBusy(false)}
 };
 const chooseVideo=(file?:File)=>{
   if(!file)return;
   if(!file.type.startsWith('video/')&&!/\.(mp4|mov|webm|m4v)$/i.test(file.name)){
     notify(locale==='es'?'Selecciona un video compatible.':'Choose a supported video.');return;
   }
   if(file.size>350*1024*1024){notify(locale==='es'?'Elige un video de menos de 350 MB.':'Choose a video under 350 MB.');return}
   const url=URL.createObjectURL(file);setVideoUrl(url);setVideoName(file.name);
 };
 const useFrame=async()=>{
   const v=player.current;if(!v||!v.videoWidth||!v.videoHeight)return notify(locale==='es'?'Reproduce el video primero y vuelve a intentarlo.':'Play the video first.');
   setBusy(true);
   try{
     const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
     const ctx=canvas.getContext('2d');if(!ctx)throw Error('No se pudo abrir el fotograma.');
     const scale=Math.max(1080/v.videoWidth,1920/v.videoHeight);
     ctx.drawImage(v,(1080-v.videoWidth*scale)/2,(1920-v.videoHeight*scale)/2,v.videoWidth*scale,v.videoHeight*scale);
     const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.85));
     if(!blob)throw Error('No se pudo preparar la portada.');
     await usePhoto(new File([blob],'portada-video.jpg',{type:'image/jpeg'}));
   }catch(e){notify(e instanceof Error?e.message:'No se pudo preparar el fotograma.')}
   finally{setBusy(false)}
 };
 return <section className="vertical-studio">
  <header className="vertical-intro"><span>CREATIVE STUDIO · 9:16</span>
    <h1>{t.title}</h1><p>{t.hint}</p></header>
  <div className="vertical-workspace">
   <div className="vertical-controls">
    <div className="vertical-format" role="group" aria-label="Formato vertical">
      <button className={post.format==='Reel'?'selected':''} aria-pressed={post.format==='Reel'} onClick={()=>onChange({format:'Reel'})}>{t.reel}</button>
      <button className={post.format==='Story'?'selected':''} aria-pressed={post.format==='Story'} onClick={()=>onChange({format:'Story'})}>{t.story}</button>
    </div>
    <label htmlFor="vertical-hook">{t.hook}</label>
    <textarea id="vertical-hook" rows={3} value={post.hook} onChange={e=>onChange({hook:e.target.value})} placeholder={t.place} maxLength={240}/>
    <div className="vertical-upload-actions">
      <button type="button" disabled={busy} onClick={()=>photoRef.current?.click()}><ImagePlus size={17}/>{t.photo}</button>
      <button type="button" disabled={busy} onClick={()=>videoRef.current?.click()}><Film size={17}/>{t.video}</button>
    </div>
    <input hidden ref={photoRef} type="file" accept="image/*,.heic,.heif" onChange={e=>{const f=e.target.files?.[0];e.target.value='';void usePhoto(f)}}/>
    <input hidden ref={videoRef} type="file" accept="video/*,.mov,.mp4" onChange={e=>{const f=e.target.files?.[0];e.target.value='';chooseVideo(f)}}/>
    <div className="vertical-presets"><strong><Palette size={15}/>{t.choose}</strong>
      <div><button onClick={()=>setEditorial('light')}>{t.light}</button>
      <button onClick={()=>setEditorial('full')}>{t.full}</button>
      <button onClick={()=>setEditorial('dark')}>{t.dark}</button></div>
    </div>
    <button type="button" className="vertical-save" disabled={saving} onClick={onSave}><Save size={17}/>{saving?'Guardando…':t.saved}</button>
   </div>
   {videoUrl&&<section className="vertical-video-panel">
     <strong>{t.videoOnly}</strong><small>{videoName}</small>
     <video ref={player} controls playsInline preload="metadata" src={videoUrl}/>
     <button type="button" disabled={busy} onClick={()=>void useFrame()}>
       <Download size={16}/>{busy?t.frameBusy:t.frame}</button>
     <p>{t.videoHelp}</p>
   </section>}
  </div>
  <details className="vertical-editor-details" open={advanced} onToggle={e=>setAdvanced((e.currentTarget as HTMLDetailsElement).open)}>
   <summary>{t.cover} · {t.edit}</summary>
   <FreePostStudio post={post} brand={brand} assets={assets} images={images} locale={locale}
     onChange={decor=>onChange({designData:writeCoverDecor(post.designData,decor)})}
     onTitle={hook=>onChange({hook})} onUpload={onUploadPhoto} loadImage={loadImage}
     onOpenStickers={onOpenStickers} onUploadBackground={onUploadBackground} notify={notify}/>
  </details>
  {!advanced&&<button type="button" className="vertical-open-editor" onClick={()=>setAdvanced(true)}>{t.cover}</button>}
 </section>;
}

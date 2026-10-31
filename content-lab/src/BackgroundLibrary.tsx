import React,{useRef,useState,useEffect} from 'react';
import {FREE_BACKGROUNDS,type FreeBackgroundId} from './FreeDesignAssets';
import {Palette,ArrowRight,Upload} from 'lucide-react';
import {assetCategory,displayAssetName,type LibraryAsset} from './MediaAsset';
import './BackgroundLibrary.css';
type Props={onDesign:(id:FreeBackgroundId,imageAssetId?:string)=>void;assets:LibraryAsset[];images:Record<string,string>;loadImage:(id:string)=>void;onUpload:(file:File)=>Promise<LibraryAsset|null>};
export default function BackgroundLibrary({onDesign,assets,images,loadImage,onUpload}:Props){
 const fileRef=useRef<HTMLInputElement>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const own=assets.filter(a=>assetCategory(a)==='background'&&!a.shared);
 useEffect(()=>{own.slice(0,12).forEach(a=>{if(!images[a.id])loadImage(a.id)})},[assets,images]);
 const upload=async(file?:File)=>{
   if(!file)return;setBusy(true);setError('');
   try{const item=await onUpload(file);if(item){loadImage(item.id);onDesign('brand',item.id)}}
   catch(e){setError(e instanceof Error?e.message:'No se pudo subir el fondo.')}
   finally{setBusy(false);if(fileRef.current)fileRef.current.value=''}
 };

 return <section className="background-library">
  <header><span className="eyebrow">BACKGROUND STUDIO · GRATIS</span><h1>Fondos que dan personalidad.</h1><p>Fondos ivory, soft blue, sage, textura de papel, cuadrículas, puntos, degradados y dark editorial. Úsalos sin créditos de IA.</p></header>
  <section className="background-library-upload">
    <div><strong>📷 Mis backgrounds</strong><p>Sube cualquier fondo o fotografía de tu marca. Puedes usarlo como fondo completo, sin modificar la imagen original ni gastar créditos IA.</p></div>
    <button className="btn dark" type="button" disabled={busy} onClick={()=>fileRef.current?.click()}><Upload size={16}/>{busy?'Subiendo…':'Subir mi fondo'}</button>
    <input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp,image/heic" onChange={e=>void upload(e.target.files?.[0])}/>
  </section>
  {error&&<p role="alert">{error}</p>}
  {own.length>0&&<div className="background-library-grid own-backgrounds">{own.map(a=><article key={a.id}>
    <div className="background-preview uploaded-background" style={{backgroundImage:images[a.id]?'url('+images[a.id]+')':undefined}}>
      {!images[a.id]&&<button type="button" onClick={()=>loadImage(a.id)}>Cargar imagen</button>}
    </div>
    <div className="background-library-card-bottom"><div><strong>{displayAssetName(a)}</strong><small>Mi fondo</small></div><Palette size={17}/></div>
    <button className="background-use-button" type="button" onClick={()=>onDesign('brand',a.id)}>Usar este fondo <ArrowRight size={14}/></button>
   </article>)}</div>}
  <div className="background-library-grid">{FREE_BACKGROUNDS.map(b=><article key={b.id}><div className={'background-preview swatch-'+b.id} style={{background:b.color}}><span className="background-sample-title">Your next<br/>big idea.</span><span className="background-sample-caption">THE CONTENT LAB · STUDIO</span></div><div className="background-library-card-bottom"><div><strong>{b.name}</strong><small>{b.description}</small></div><Palette size={17}/></div><button className="background-use-button" type="button" onClick={()=>onDesign(b.id)}>Usar este fondo <ArrowRight size={14}/></button></article>)}</div>
  <div className="background-library-action"><p>Abre un carrusel, entra en <strong>Backgrounds</strong> y elige el fondo en el panel de decoración. La vista previa y la descarga serán idénticas.</p><button type="button" className="btn dark" onClick={()=>onDesign("brand")}>Abrir Carousel Factory <ArrowRight size={16}/></button></div>
 </section>;
}
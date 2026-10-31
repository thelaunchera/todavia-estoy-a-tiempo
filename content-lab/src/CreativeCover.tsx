import {useEffect,useState} from 'react';
import {LoaderCircle} from 'lucide-react';
import {composeGridPoster,LAYOUTS} from './GridComposer';
import {readCoverDecor,type CoverDecor} from './CoverDecor';
import TouchLayerCanvas from './TouchLayerCanvas';
import {stickerDefault,clampRect} from './TouchGeometry';
type Post={title:string;hook:string;cta:string;template:string;designData?:string};
type Brand={name:string;color:string;background:string;secondaryColor?:string;headingFont?:string;bodyFont?:string};
const legacy:Record<string,string>={Editorial:'Editorial Hero',Spotlight:'Product Spotlight',Split:'Color Block',Bold:'Bold Typography'};
export async function makeCover(post:Post,brand:Brand,src?:string,images:Record<string,string>={},omitStickers=false){
  const format=legacy[post.template]||post.template;
  const index=LAYOUTS.findIndex(x=>x.name===format);
  const decor=readCoverDecor(post.designData);
  const {canvas}=await composeGridPoster({
    format:index<0?'Editorial Hero':format,
    headline:post.hook||post.title,
    subtext:post.cta,backgroundId:decor.backgroundId,
    backgroundImageId:decor.backgroundImageId,
    stickerIds:decor.stickerIds,stickerPositions:decor.stickerPositions
  },Math.max(0,index),brand,{photo:src,stickerImages:images,omitStickers},'portrait');
  return canvas;
}
export function CreativeCover({post,brand,photo,images={},onDecorChange}:{post:Post;brand:Brand;photo?:string;images?:Record<string,string>;onDecorChange?:(next:CoverDecor)=>void}){
  const [url,setUrl]=useState(''),[failure,setFailure]=useState(false),[touchEdit,setTouchEdit]=useState(false);
  const decor=readCoverDecor(post.designData);
  const needsExample=!post.hook?.trim()&&!post.title?.trim();
  // The sample is PREVIEW-ONLY. It is never persisted or added to the exported PNG.
  const previewPost=needsExample?{...post,hook:'Your next big idea.',cta:post.cta?.trim()||'Made your way.'}:post;
  useEffect(()=>{
    let active=true;setFailure(false);setUrl('');
    makeCover(previewPost,brand,photo,images,touchEdit).then(c=>{if(active)setUrl(c.toDataURL('image/png'))})
    .catch(()=>{if(active)setFailure(true)});
    return()=>{active=false};
  },[post.template,post.hook,post.cta,post.title,post.designData,brand.name,brand.color,brand.background,brand.secondaryColor,brand.headingFont,brand.bodyFont,photo,images,touchEdit]);
  const layers=decor.stickerIds.filter(id=>images[id]).map((id,i)=>({id,kind:'sticker' as const,name:'Sticker',src:images[id],rect:clampRect(decor.stickerPositions[id]||stickerDefault(i))}));
  return <div className="cover-touch-workspace">
   {needsExample&&<div className="cover-demo-label">VISTA DE EJEMPLO <span>Escribe tu título para personalizarla</span></div>}
   {onDecorChange&&layers.length>0&&<button className="cover-touch-toggle" type="button" aria-pressed={touchEdit} onClick={()=>setTouchEdit(v=>!v)}>{touchEdit?'✓ Terminar edición':'👆 Mover y ajustar stickers'}</button>}
   {failure?<div className="cover-error cover-failure">No se pudo preparar la vista previa. Prueba otro formato o fotografía.</div>:
    !url?<div className="cover-loading" role="status" aria-label="Preparando vista previa"><LoaderCircle className="spin" size={25}/><span>Preparando tu diseño…</span></div>:
    touchEdit&&onDecorChange?<TouchLayerCanvas preview={url} layers={layers} onCommit={(_kind,id,rect)=>onDecorChange({...decor,stickerPositions:{...decor.stickerPositions,[id]:rect}})}/>:
    <img className="cover-artwork" src={url} alt="Vista previa de la composición seleccionada" draggable={false}/>}
  </div>;
}
export async function exportCreativeCover(post:Post,brand:Brand,photo?:string,images:Record<string,string>={}){
  const c=await makeCover(post,brand,photo,images),a=document.createElement('a');
  a.download=(post.title||'content').replace(/[^a-z0-9-]/gi,'-').toLowerCase()+'-1080x1350.png';
  a.href=c.toDataURL('image/png');a.click();
}

import {useEffect,useMemo,useRef,useState} from 'react';
import {Image as ImageIcon} from 'lucide-react';
import {readCarouselDesign} from './CarouselArtDirection';
import {readCoverDecor} from './CoverDecor';
import {renderSavedCarouselCover,type Brand as CarouselBrand} from './CarouselFactory';
import {renderFreePost} from './FreePostStudio';
import './ProjectCover.css';

/** Existing customer design data only. Covers never become a user media asset. */
export type CoverPost={
  id?:string;brandId:string;title:string;format:string;assetId:string;
  hook?:string;slides?:string;cta?:string;template?:string;designData?:string;updatedAt?:string;
};
type Props={
  post:CoverPost;brand:CarouselBrand;images:Record<string,string>;
  loadImage:(assetId:string)=>void|Promise<unknown>;locale?:'es'|'en';
};
const previewCache=new Map<string,string>();
let renderQueue:Promise<void>=Promise.resolve();
const maxCacheEntries=32;
function remember(key:string,url:string){
  previewCache.delete(key);
  previewCache.set(key,url);
  while(previewCache.size>maxCacheEntries){
    const first=previewCache.keys().next().value;
    if(first===undefined)break;
    previewCache.delete(first);
  }
}
export function projectCoverAssetIds(post:CoverPost):string[]{
  const ids:string[]=[];
  if(post.format==='Carousel'){
    const {slides,style}=readCarouselDesign(post.designData||'');
    if(slides?.length){
      for(const raw of slides){
        if(!raw||typeof raw!=='object')continue;
        const slide=raw as {assetId?:string;backgroundImageId?:string;stickerIds?:string[]};
        ids.push(slide.assetId||'',slide.backgroundImageId||'',...(slide.stickerIds||[]));
      }
    }else ids.push(post.assetId);
    ids.push(style.seamlessAssetId, ...((style.panoramaLayers||[])
      .filter(layer=>layer.kind==='photo'||layer.kind==='sticker').map(layer=>layer.assetId)));
  }else{
    const decor=readCoverDecor(post.designData);
    ids.push(post.assetId,decor.backgroundImageId,...decor.stickerIds,
      ...decor.layers.filter(layer=>layer.kind==='photo'||layer.kind==='sticker').map(layer=>layer.assetId));
  }
  return [...new Set(ids.filter((id):id is string=>typeof id==='string'&&id.length>0))];
}
function previewFingerprint(post:CoverPost,brand:CarouselBrand):string{
  return [post.brandId,post.id||'new',post.format,post.updatedAt||'',
    post.assetId,post.hook||'',post.slides||'',post.designData||'',
    brand.color,brand.background,brand.headingFont||'',brand.bodyFont||'',
    brand.name].join('\u001f');
}
async function makeThumbnail(post:CoverPost,brand:CarouselBrand,images:Record<string,string>):Promise<string>{
  const carousel=post.format==='Carousel';
  const tall=post.format==='Story'||post.format==='Reel';
  const canvas=carousel
    ?await renderSavedCarouselCover(post,brand,images)
    :await renderFreePost({
      title:post.title,hook:post.hook||'',cta:post.cta||'',
      template:post.template||'Editorial',assetId:post.assetId,
      format:post.format,designData:post.designData,
    },brand,images);
  try{
    const thumbnail=document.createElement('canvas');
    thumbnail.width=tall?225:320;
    thumbnail.height=tall?400:400;
    const ctx=thumbnail.getContext('2d');
    if(!ctx)throw Error('Could not prepare project thumbnail.');
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(canvas,0,0,thumbnail.width,thumbnail.height);
    const src=thumbnail.toDataURL('image/png');
    thumbnail.width=1;thumbnail.height=1;
    return src;
  }finally{
    canvas.width=1;canvas.height=1;
  }
}
export default function ProjectCover({post,brand,images,loadImage,locale='es'}:Props){
  const ref=useRef<HTMLSpanElement>(null);
  const requested=useRef(new Set<string>());
  const [visible,setVisible]=useState(false);
  const [src,setSrc]=useState('');
  const [failed,setFailed]=useState(false);
  const ids=useMemo(()=>projectCoverAssetIds(post),[
    post.assetId,post.designData,post.format,
  ]);
  const ready=ids.every(id=>Boolean(images[id]));
  const key=previewFingerprint(post,brand);
  useEffect(()=>{
    const node=ref.current;
    if(!node){setVisible(true);return;}
    if(typeof IntersectionObserver==='undefined'){setVisible(true);return;}
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}
    },{rootMargin:'240px'});
    observer.observe(node);
    return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(!visible)return;
    ids.forEach(id=>{
      if(images[id]||requested.current.has(id))return;
      requested.current.add(id);
      try{void Promise.resolve(loadImage(id)).catch(()=>{});}catch{/* Keep placeholder if image cannot load. */}
    });
  },[visible,ids,images,loadImage]);
  useEffect(()=>{
    let active=true;
    setFailed(false);
    const cached=previewCache.get(key);
    if(cached){setSrc(cached);return()=>{active=false};}
    setSrc('');
    if(!visible||!ready)return()=>{active=false};
    // Queue renders to avoid several wide seamless canvases competing for RAM
    // in Mobile Safari. Thumbnails are local, never sent to a server.
    const job=renderQueue.then(()=>makeThumbnail(post,brand,images));
    renderQueue=job.then(()=>{},()=>{});
    void job.then(data=>{
      remember(key,data);
      if(active)setSrc(data);
    }).catch(()=>{if(active)setFailed(true)});
    return()=>{active=false};
  },[visible,ready,key]);
  const story=post.format==='Story'||post.format==='Reel';
  const description=locale==='es'
    ?(failed?'Vista previa no disponible':'Preparando portada…')
    :(failed?'Preview unavailable':'Preparing cover…');
  return <span ref={ref} className={'lab-project-cover'+(story?' lab-project-cover-story':'')}
    aria-label={locale==='es'?'Portada real del diseño guardado':'Actual saved design cover'}>
    {src?<img src={src} loading="lazy" alt="" draggable={false}/>:
      <span className="lab-project-cover-placeholder" aria-hidden="true">
        <ImageIcon size={22} strokeWidth={1.5}/><small>{description}</small>
      </span>}
  </span>;
}

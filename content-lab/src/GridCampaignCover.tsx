import {useEffect,useRef,useState} from 'react';
import {ImagePlus} from 'lucide-react';
import {composeGridPoster,type VisualControls} from './GridComposer';
import type {CalendarGrid,PlannedItem} from './CalendarPlannerModel';
import type {Brand as CarouselBrand} from './CarouselFactory';
import type {EditorialDesign} from './EditorialPoster';
import type {FreeBackgroundId} from './FreeDesignAssets';
import type {StickerPositions} from './TouchGeometry';

/** Read-only thumbnail for a scheduled 1-photo/9-post campaign tile.
 * Render the saved poster, not only tile.assetId (which can be intentionally empty).
 * Uses the actual GridComposer export pipeline, at reduced pixel scale for iPhone.
 */
type GridTile=CalendarGrid['posts'][number]&{
 format?:string;subtext?:string;layout?:VisualControls;design?:EditorialDesign;
 backgroundId?:FreeBackgroundId;backgroundImageId?:string;
 stickerIds?:string[];stickerPositions?:StickerPositions;
};
export type FeedCampaignGrid=Omit<CalendarGrid,'posts'>&{
 kind?:string;posts:GridTile[];
};
type Props={
 item:PlannedItem;grid:FeedCampaignGrid;
 brand:CarouselBrand&{logoAssetId?:string};
 images:Record<string,string>;
 loadImage:(id:string)=>Promise<string|undefined>;
 locale:'es'|'en';compact?:boolean;
};
const memory=new Map<string,string>();
let queue:Promise<void>=Promise.resolve();
function cache(key:string,url:string){
 memory.delete(key);memory.set(key,url);
 while(memory.size>25){
  const first=memory.keys().next().value;
  if(first===undefined)break;
  memory.delete(first);
 }
}

export default function GridCampaignCover({item,grid,brand,images,loadImage,locale,compact=false}:Props){
 const tile=item.tileIndex===undefined?undefined:grid.posts[item.tileIndex];
 const original=grid.sourceId||'';
 const required=tile?[tile.assetId||'',tile.backgroundImageId||'',
  ...(tile.stickerIds||[]),...(original&&tile.design?[original]:[])]
  .filter((id):id is string=>Boolean(id)):[];
 const available=required.every(id=>Boolean(images[id]));
 const hasVisual=Boolean(tile&&(tile.assetId||tile.design||(grid.kind==='preserve'&&original)));
 const key=[brand.id,grid.id,item.tileIndex,brand.color,brand.background,
  brand.headingFont||'',brand.bodyFont||'',JSON.stringify(tile||{})].join('|');
 const element=useRef<HTMLSpanElement>(null);
 const requested=useRef(new Set<string>());
 const [visible,setVisible]=useState(false),[src,setSrc]=useState(''),[failed,setFailed]=useState(false);

 useEffect(()=>{
  const node=element.current;
  if(!node||typeof IntersectionObserver==='undefined'){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(x=>x.isIntersecting)){setVisible(true);observer.disconnect();}
  },{rootMargin:'160px'});
  observer.observe(node);
  return()=>observer.disconnect();
 },[]);

 useEffect(()=>{
  if(!visible||!hasVisual)return;
  let live=true;
  required.filter(id=>!images[id]&&!requested.current.has(id)).forEach(id=>{
   requested.current.add(id);
   void loadImage(id).then(value=>{if(live&&!value)setFailed(true)})
     .catch(()=>{if(live)setFailed(true)});
  });
  return()=>{live=false};
 },[visible,hasVisual,required.join('|'),available,images,loadImage]);

 useEffect(()=>{
  let live=true;
  setFailed(false);
  setSrc('');
  if(!tile||!visible||!available||!hasVisual)return()=>{live=false};
  const previous=memory.get(key);
  if(previous){setSrc(previous);return()=>{live=false};}
  const work=queue.then(async()=>{
   const result=await composeGridPoster(tile,item.tileIndex||0,brand,{
    photo:tile.assetId?images[tile.assetId]:tile.design?images[original]:undefined,
    original:images[original],logo:images[brand.logoAssetId||''],
    preserve:grid.kind==='preserve'&&!tile.design&&!tile.assetId,
    stickerImages:images,
   },'portrait',0.28);
   try{return result.canvas.toDataURL('image/jpeg',0.86);}
   finally{result.canvas.width=1;result.canvas.height=1;}
  });
  queue=work.then(()=>{},()=>{});
  void work.then(data=>{cache(key,data);if(live)setSrc(data)})
    .catch(()=>{if(live)setFailed(true)});
  return()=>{live=false};
 },[visible,available,hasVisual,key]);

 const message=failed?(locale==='es'?'Vista no disponible':'Preview unavailable'):
  !hasVisual?(locale==='es'?'Sin imagen guardada':'No saved image'):
  (locale==='es'?'Preparando vista…':'Preparing preview…');
 return <span ref={element} className="lab-feed-campaign-cover">
  {src?<img src={src} alt="" loading="lazy" draggable={false}/>:
   <span className="lab-feed-campaign-fallback" aria-hidden="true">
    <ImagePlus size={compact?18:24}/>
    {!compact&&<small>{message}</small>}
   </span>}
 </span>;
}

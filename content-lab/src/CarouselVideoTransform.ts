/**
 * Geometry is authored in the clip's original slide, but in Seamless mode its
 * visible pixels may extend into neighboring slides. A single clip is stored;
 * exports crop the SAME video into each intersected slide at the same timecode.
 */
export type CarouselVideoTransform={
  x:number;y:number;w:number;h:number;
  rotation:number;zoom:number;panX:number;panY:number;
};
export const DEFAULT_VIDEO_TRANSFORM:CarouselVideoTransform={
  x:0,y:0,w:1,h:1,rotation:0,zoom:1,panX:0,panY:0
};
const finite=(x:unknown,fallback:number)=>typeof x==='number'&&Number.isFinite(x)?x:fallback;
export const bound=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export function normalizeVideoTransform(input:unknown):CarouselVideoTransform{
  const raw=input&&typeof input==='object'?input as Partial<CarouselVideoTransform>:{};
  return {
    x:bound(finite(raw.x,0),-1,1),
    y:bound(finite(raw.y,0),-1,1),
    w:bound(finite(raw.w,1),.12,2),
    h:bound(finite(raw.h,1),.12,2),
    rotation:bound(finite(raw.rotation,0),-180,180),
    zoom:bound(finite(raw.zoom,1),1,5),
    panX:bound(finite(raw.panX,0),-1,1),
    panY:bound(finite(raw.panY,0),-1,1),
  };
}
export function videoHasEdits(
 transform:unknown,trimStart=0,trimEnd=0
):boolean{
 const v=normalizeVideoTransform(transform);
 return Object.entries(DEFAULT_VIDEO_TRANSFORM).some(([key,original])=>
   Math.abs(v[key as keyof CarouselVideoTransform]-original)>.001)
   ||trimStart>.001||trimEnd>.001;
}
/**
 * Resize in the video rectangle's rotated local axes. Keep its visually
 * opposite corner anchored (including at 90° and 180°), rather than treating
 * a screen-space drag as if the clip were never rotated.
 */
export function resizeRotatedVideo(
 raw:unknown,dxPixels:number,dyPixels:number,pageWidth:number,pageHeight:number
):CarouselVideoTransform{
 const base=normalizeVideoTransform(raw);
 const theta=base.rotation*Math.PI/180,c=Math.cos(theta),s=Math.sin(theta);
 const pw=Math.max(1,pageWidth),ph=Math.max(1,pageHeight);
 const w=bound(base.w+(c*dxPixels+s*dyPixels)/pw,.12,2);
 const h=bound(base.h+(-s*dxPixels+c*dyPixels)/ph,.12,2);
 const dw=(w-base.w)*pw,dh=(h-base.h)*ph;
 return normalizeVideoTransform({...base,w,h,
   x:base.x+((c-1)*dw-s*dh)/(2*pw),
   y:base.y+(s*dw+(c-1)*dh)/(2*ph)});
}

type PixelPoint={x:number;y:number};
function cutPolygon(
 polygon:PixelPoint[],axis:'x'|'y',at:number,keepGreater:boolean
):PixelPoint[]{
 const result:PixelPoint[]=[];
 if(!polygon.length)return result;
 let previous=polygon[polygon.length-1];
 let prevInside=keepGreater?previous[axis]>=at:previous[axis]<=at;
 for(const current of polygon){
   const inside=keepGreater?current[axis]>=at:current[axis]<=at;
   if(inside!==prevInside){
     const t=(at-previous[axis])/(current[axis]-previous[axis]);
     result.push({x:previous.x+(current.x-previous.x)*t,
       y:previous.y+(current.y-previous.y)*t});
   }
   if(inside)result.push(current);
   previous=current;prevInside=inside;
 }
 return result;
}
function polygonArea(polygon:PixelPoint[]):number{
 let twice=0;
 for(let i=0;i<polygon.length;i++){
   const a=polygon[i],b=polygon[(i+1)%polygon.length];
   twice+=a.x*b.y-b.x*a.y;
 }
 return Math.abs(twice)/2;
}
/**
 * A rotated rectangle is visible on a slide only when it actually intersects
 * the page's x bounds AND the 4:5 canvas's vertical [0,1] bounds.
 * Projection-only checks incorrectly exported blank videos near the top/bottom.
 */
export function videoVisiblePages(
 owner:number,raw:unknown,count:number,seamless:boolean
):number[]{
 if(!Number.isInteger(owner)||owner<0||owner>=count)return [];
 if(!seamless)return [owner];
 const v=normalizeVideoTransform(raw);
 const theta=v.rotation*Math.PI/180,c=Math.cos(theta),s=Math.sin(theta);
 const aspect=1350/1080;
 const cx=owner+v.x+v.w/2,cy=v.y+v.h/2;
 const polygon:PixelPoint[]=[
   [-v.w/2,-v.h/2],[v.w/2,-v.h/2],
   [v.w/2,v.h/2],[-v.w/2,v.h/2]
 ].map(([dx,dy])=>({x:cx+c*dx-s*dy*aspect,y:cy+s*dx/aspect+c*dy}));
 return Array.from({length:count},(_,page)=>page).filter(page=>{
   let clipped=cutPolygon(polygon,'x',page,true);
   clipped=cutPolygon(clipped,'x',page+1,false);
   clipped=cutPolygon(clipped,'y',0,true);
   clipped=cutPolygon(clipped,'y',1,false);
   return clipped.length>=3&&polygonArea(clipped)>1e-8;
 });
}
/** Slide-relative X for a single continuous asset on a cropped output page. */
export function videoOffsetForPage(owner:number,page:number):number{
 return owner-page;
}

export const videoTrim=(start:unknown,end:unknown,duration:number)=>{
 const limit=Number.isFinite(duration)&&duration>0?duration:0;
 const from=bound(finite(start,0),0,Math.max(0,limit-.1));
 const to=finite(end,0)>0?bound(finite(end,0),from+.1,limit):limit;
 return {start:from,end:to};
};
/**
 * Matches the CSS video slide layer: aspect-ratio contained media, independent
 * pan/zoom inside a clipped rectangle, rotation about the rectangle center.
 */
export function drawTransformedVideo(
 ctx:CanvasRenderingContext2D,video:HTMLVideoElement,raw:unknown,
 width:number,height:number,pageOffset=0,
){
 const transform=normalizeVideoTransform(raw);
 const x=(transform.x+pageOffset)*width,y=transform.y*height;
 const w=transform.w*width,h=transform.h*height;
 ctx.save();
 ctx.translate(x+w/2,y+h/2);
 ctx.rotate(transform.rotation*Math.PI/180);
 ctx.beginPath();
 ctx.rect(-w/2,-h/2,w,h);
 ctx.clip();
 ctx.fillStyle='#191919';
 ctx.fillRect(-w/2,-h/2,w,h);
 const intrinsicW=Math.max(1,video.videoWidth),intrinsicH=Math.max(1,video.videoHeight);
 const fit=Math.min(w/intrinsicW,h/intrinsicH)*transform.zoom;
 const drawW=intrinsicW*fit,drawH=intrinsicH*fit;
 ctx.drawImage(video,
   -drawW/2+transform.panX*w,
   -drawH/2+transform.panY*h,
   drawW,drawH);
 ctx.restore();
}

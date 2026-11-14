/**
 * Editable placement of a video within ONE carousel slide.
 * Coordinates are normalized to that slide (not the whole panorama).
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
 width:number,height:number,
){
 const transform=normalizeVideoTransform(raw);
 const x=transform.x*width,y=transform.y*height;
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

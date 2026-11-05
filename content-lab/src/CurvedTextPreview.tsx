import {useEffect,useRef} from 'react';
import {panoramaFont,panoramaTextWeight,textPaint,type PanoramaLayer} from './PanoramaLayers';

/** Live curved text uses the same Canvas 2D painter as the exported PNG.
 * The source text stays editable as a layer; no image is saved to the project.
 */
export default function CurvedTextPreview({layer,width,height}:{layer:PanoramaLayer;width:number;height:number}){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=canvasRef.current;
  if(!canvas||!Number.isFinite(width)||!Number.isFinite(height))return;
  let mounted=true;
  const scale=Math.min(1,2200/Math.max(width,height,1));
  canvas.width=Math.max(1,Math.round(width*scale));
  canvas.height=Math.max(1,Math.round(height*scale));
  const paint=()=>{
   if(!mounted)return;
   const ctx=canvas.getContext('2d');
   if(!ctx)return;
   ctx.clearRect(0,0,canvas.width,canvas.height);
   ctx.save();
   ctx.translate(canvas.width/2,canvas.height/2);
   ctx.scale(scale,scale);
   textPaint(ctx,layer,width,height);
   ctx.restore();
  };
  paint();
  // Repaint after web fonts load, avoiding a fallback-font mismatch.
  const font=panoramaTextWeight(layer.fontWeight)+' '+(layer.fontSize||76)+'px '+panoramaFont(layer.font);
  if(typeof document!=='undefined'&&document.fonts?.load){
   void document.fonts.load(font).then(paint).catch(()=>{});
  }
  return()=>{mounted=false};
 },[layer.text,layer.font,layer.fontSize,layer.fontWeight,layer.lineHeight,layer.spacing,
    layer.curve,layer.color,layer.outline,layer.shadow,width,height]);
 return <canvas ref={canvasRef} className="touch-editor-curved-text" aria-hidden="true"
   style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',opacity:Math.max(0,Math.min(1,layer.opacity??1))}}/>;
}

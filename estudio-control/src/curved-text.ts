/**
 * Curved typography for the private Studio carousel.
 * Positive values arch upward (∩); negative values arch downward (∪).
 * The same painter is used for preview and full-resolution PNG exports.
 */
export const clampTextCurve=(value:number):number=>
 Math.max(-100,Math.min(100,Number.isFinite(value)?value:0));

const curveHeight=(span:number,fontSize:number,curve:number):number=>
 Math.min(fontSize*2.4,span*.26)*Math.abs(clampTextCurve(curve))/100;

/** Extra room for the arc and rotated glyphs within the selectable text box. */
export function curvedTextExtraHeight(fontSize:number,maxWidth:number,curve:number,lines:string[]):number{
 const amount=Math.abs(clampTextCurve(curve))/100;
 if(!amount)return 0;
 const estimatedSpan=lines.reduce((largest,line)=>
  Math.max(largest,Math.min(maxWidth,Array.from(line).length*fontSize*.62)),0);
 return curveHeight(estimatedSpan,fontSize,curve)+fontSize*.6*amount;
}

/**
 * Draw a line one glyph at a time along an arc, without stretching its height.
 * The text block can still be moved, resized, rotated, saved and exported.
 */
export function drawCurvedTextLine(
 ctx:CanvasRenderingContext2D,line:string,x:number,y:number,
 fontSize:number,curve:number,maxWidth:number
):void{
 const strength=clampTextCurve(curve);
 if(!strength){ctx.fillText(line,x,y);return;}
 const glyphs=Array.from(line);
 const glyphWidths=glyphs.map(char=>ctx.measureText(char).width);
 const naturalWidth=glyphWidths.reduce((total,w)=>total+w,0);
 if(naturalWidth<=0)return;
 const scaleX=Math.min(1,Math.max(1,maxWidth)/naturalWidth);
 const span=naturalWidth*scaleX;
 const bend=curveHeight(span,fontSize,strength)*Math.sign(strength);
 const topPadding=fontSize*.6*(Math.abs(strength)/100)+Math.max(0,bend);
 let cursor=0;
 for(let i=0;i<glyphs.length;i++){
  const scaledWidth=glyphWidths[i]*scaleX;
  const center=cursor+scaledWidth/2;
  const unit=Math.max(-1,Math.min(1,center/span*2-1));
  const verticalOffset=-bend*(1-unit*unit);
  const slope=4*bend*unit/span;
  ctx.save();
  ctx.translate(x+center,y+fontSize/2+topPadding+verticalOffset);
  ctx.rotate(Math.atan(slope));
  ctx.scale(scaleX,1);
  ctx.fillText(glyphs[i],-glyphWidths[i]/2,-fontSize/2);
  ctx.restore();
  cursor+=scaledWidth;
 }
}

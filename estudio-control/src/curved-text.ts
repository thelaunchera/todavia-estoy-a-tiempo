/**
 * Canva-like editable text on a real circular arc, not an artificial parabola.
 * Positive curvature produces an arch (∩), negative a smile (∪).
 * Preview and exported PNG share this renderer. No text is rasterized into a sticker.
 */
export const clampTextCurve=(value:number):number=>
 Math.max(-100,Math.min(100,Number.isFinite(value)?value:0));

export const clampLetterSpacing=(value:number):number=>
 Math.max(-8,Math.min(30,Number.isFinite(value)?value:0));

type Glyph={char:string;width:number;px:number;py:number;angle:number};
type ArcLayout={glyphs:Glyph[];scaleX:number;fit:number;left:number;top:number;width:number;height:number};

const splitLetters=(s:string):string[]=>Array.from(s);

/**
 * Use actual measured glyph advances and their tangents on a circle. The
 * bounding box includes rotated letter corners and fits the user's text width.
 */
function arcLayout(
 ctx:CanvasRenderingContext2D,line:string,fontSize:number,curve:number,
 maxWidth:number,letterSpacing=0
):ArcLayout{
 const letters=splitLetters(line);
 const widths=letters.map(char=>ctx.measureText(char).width);
 const tracking=clampLetterSpacing(letterSpacing)*fontSize/100;
 const natural=widths.reduce((a,b)=>a+b,0)+Math.max(0,letters.length-1)*tracking;
 const theta=clampTextCurve(curve)/100*Math.PI*1.8; // 0–324°: gentle arc → nearly circular
 const total=Math.max(natural,1);
 const scaleX=Math.min(1,Math.max(1,maxWidth)/total);
 const radius=total*scaleX/Math.max(Math.abs(theta),.00001);
 const dir=Math.sign(theta);
 const glyphs:Glyph[]=[];
 let along=0,minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 const halfHeight=fontSize*.64;
 for(let i=0;i<letters.length;i++){
  const w=widths[i];
  const halfway=along+w/2;
  const angle=(halfway/total-.5)*theta;
  const px=radius*Math.sin(angle);
  const py=dir*radius*(1-Math.cos(angle));
  glyphs.push({char:letters[i],width:w,px,py,angle});
  const hw=w*scaleX/2;
  const cosine=Math.cos(angle),sine=Math.sin(angle);
  // Rotated glyph corners, including ascenders and descenders.
  const rotatedW=Math.abs(hw*cosine)+Math.abs(halfHeight*sine);
  const rotatedH=Math.abs(hw*sine)+Math.abs(halfHeight*cosine);
  minX=Math.min(minX,px-rotatedW);maxX=Math.max(maxX,px+rotatedW);
  minY=Math.min(minY,py-rotatedH);maxY=Math.max(maxY,py+rotatedH);
  along+=w+tracking;
 }
 if(!glyphs.length)return {glyphs,scaleX:1,fit:1,left:0,top:0,width:0,height:0};
 const rawWidth=Math.max(1,maxX-minX);
 const fit=Math.min(1,Math.max(1,maxWidth)/rawWidth);
 const visibleWidth=rawWidth*fit;
 const marginX=Math.max(0,(maxWidth-visibleWidth)/2);
 return {glyphs,scaleX,fit,left:marginX-minX*fit,
  top:-minY*fit,width:visibleWidth,height:(maxY-minY)*fit};
}

export function curvedTextExtraHeight(
 fontSize:number,maxWidth:number,curve:number,lines:string[],letterSpacing=0
):number{
 if(!clampTextCurve(curve))return 0;
 const fakeContext={
  measureText:(letter:string)=>({width:(letter===' '?0.32:0.58)*fontSize})
 } as CanvasRenderingContext2D;
 const heights=lines.map(line=>arcLayout(fakeContext,line,fontSize,curve,maxWidth,letterSpacing).height);
 return Math.max(0,...heights.map(h=>h-fontSize*1.05)) +fontSize*.12;
}

export function drawCurvedTextLine(
 ctx:CanvasRenderingContext2D,line:string,x:number,y:number,
 fontSize:number,curve:number,maxWidth:number,letterSpacing=0
):void{
 const strength=clampTextCurve(curve);
 const tracking=clampLetterSpacing(letterSpacing)*fontSize/100;
 if(!strength&&!tracking){ctx.fillText(line,x,y);return;}
 if(!strength){
  let cursor=0;
  for(const char of splitLetters(line)){
   ctx.fillText(char,x+cursor,y);
   cursor+=ctx.measureText(char).width+tracking;
  }
  return;
 }
 const layout=arcLayout(ctx,line,fontSize,strength,maxWidth,letterSpacing);
 for(const glyph of layout.glyphs){
  ctx.save();
  ctx.translate(x+layout.left+glyph.px*layout.fit,
   y+layout.top+glyph.py*layout.fit);
  ctx.rotate(glyph.angle);
  ctx.scale(layout.scaleX*layout.fit,layout.fit);
  ctx.fillText(glyph.char,-glyph.width/2,-fontSize/2);
  ctx.restore();
 }
}

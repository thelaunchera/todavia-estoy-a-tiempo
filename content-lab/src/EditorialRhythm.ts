/**
 * One editorial layout plan for full-resolution PNG, seamless canvas and live editor.
 * A layout never invents text or image assets. Existing drafts opt in explicitly.
 */
export type EditorialLayout='cover'|'statement'|'photo'|'steps'|'split'|'closing';
export type TypePlacement={x:number;top:number;width:number;size:number;lines:number};
export type EditorialPlan={
 eyebrow:{x:number;top:number}; title:TypePlacement; body:TypePlacement;folio:{x:number;top:number};
};
const placement=(x:number,top:number,width:number,size:number,lines:number):TypePlacement=>({x,top,width,size,lines});
/** All coordinates are pixels on a genuine 1080 × 1350 slide. */
export function editorialPlan(layout:EditorialLayout,hasPhoto:boolean,hasBody:boolean):EditorialPlan{
 const base={eyebrow:{x:82,top:112},folio:{x:82,top:1240}};
 if(hasPhoto){
  if(layout==='photo')return {...base,eyebrow:{x:78,top:775},
    title:placement(78,824,924,88,3),body:placement(80,1070,910,38,3)};
  if(layout==='split')return {...base,eyebrow:{x:64,top:126},
    title:placement(64,304,415,75,7),body:placement(64,1000,405,36,4)};
  if(layout==='steps')return {...base,eyebrow:{x:82,top:96},
    title:placement(82,246,918,96,4),body:placement(82,930,900,37,4)};
  // Covers and statements place the headline above the photograph, not over it.
  return {...base,title:placement(82,238,918,100,4),
    body:placement(84,1010,465,36,4)};
 }
 if(layout==='steps')return {...base,eyebrow:{x:82,top:136},
   title:placement(82,290,900,106,4),body:placement(84,800,900,40,6)};
 if(layout==='closing')return {...base,eyebrow:{x:125,top:200},
   title:placement(125,530,835,116,5),body:placement(127,1010,825,40,4)};
 if(layout==='split')return {...base,eyebrow:{x:140,top:210},
   title:placement(140,390,760,120,5),body:placement(143,990,755,40,4)};
 if(layout==='photo')return {...base,eyebrow:{x:83,top:180},
   title:placement(83,455,920,120,5),body:placement(85,1005,905,40,4)};
 if(layout==='cover')return {...base,eyebrow:{x:82,top:160},
   title:placement(82,430,915,120,5),body:placement(84,1010,900,40,4)};
 return {...base,eyebrow:{x:116,top:204},
   title:placement(116,hasBody?460:520,850,hasBody?111:126,5),
   body:placement(120,1000,840,40,4)};
}
export function editorialRhythmForSlides(slides:ReadonlyArray<{assetId:string}>):EditorialLayout[]{
 const photoLayouts:EditorialLayout[]=['cover','photo','split','photo'];
 const textLayouts:EditorialLayout[]=['statement','steps','split','closing'];
 let photoIndex=0,textIndex=0;
 return slides.map((slide,index)=>{
  if(index===slides.length-1)return 'closing';
  if(slide.assetId)return photoLayouts[photoIndex++%photoLayouts.length];
  return index===0?'cover':textLayouts[textIndex++%textLayouts.length];
 });
}

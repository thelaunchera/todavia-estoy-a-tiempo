
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from './platform/client';
import {
  Sparkles, WandSparkles, Plus, Trash2, ArrowLeft, ArrowRight, Download,
  Upload, ImagePlus, Save, Check, LoaderCircle, Layers3
} from 'lucide-react';
import './CarouselFactory.css';
import {readCarouselDesign,encodeCarouselDesign,normalizeCarouselStyle,getCarouselPalette,readableColor,sampleReferencePalette,CAROUSEL_FONTS,carouselFontFamily,isCarouselFont,type CarouselFont,type CarouselStyle} from './CarouselArtDirection';
import {SOCIAL_PLATFORMS,brandPalette,preferredPlatform,platformName,socialAccount,type SocialAccounts,type SocialPlatform} from './BrandIdentity';
import FreeDecorControls from './FreeDecorControls';
import {paintFreeBackground,FREE_BACKGROUNDS,type FreeBackgroundId} from './FreeDesignAssets';
import {isBackgroundVisible} from './BackgroundVisibility';
import {isBowBackground} from './BowBackgrounds';
import {isScrapbookBackground} from './ScrapbookBackgrounds';
import {paintOriginalStickerImages} from './OriginalStickerOverlays';
import {drawSeamlessPages,drawSeamlessCanvas,paintSeamlessTypography} from './SeamlessCarousel';
import {editorialPlan,editorialRhythmForSlides} from './EditorialRhythm';
import TouchLayerCanvas from './TouchLayerCanvas';
import PanoramaEditor from './PanoramaEditor';
import {coverPlacement,normalizeCrop,photoFrameMetrics,initialPanoramaPhotoRect} from './PhotoCrop';
import {overlayPanoramaPages,paintPanoramaLayers,reorderPanoramaLayers,type LayerMove,type PanoramaLayer} from './PanoramaLayers';
import {photoDefault,stickerDefault,clampRect,clampPanoramaRect,normalizedPositions,paintCoverImage,layerCornerPixels,type TouchRect,type StickerPositions} from './TouchGeometry';
import {assetCategory,displayAssetName,type LibraryAsset} from './MediaAsset';

type Brand = {
  id: string; name: string; handle: string; audience: string; voice: string;
  rules: string; language: 'English' | 'Español'; color: string; background: string;
  headingFont?:string;bodyFont?:string;referenceAssetId?:string;secondaryColor?:string;additionalColors?:string[];socialAccounts?:SocialAccounts;primaryPlatform?:SocialPlatform;
};
type Post = {
  id?: string; brandId: string; title: string; format: string; angle: string;
  hook: string; slides: string; caption: string; cta: string; visual: string;
  status: string; template: string; assetId: string; date: string;
  designData?: string; updatedAt?: string;
};
type Asset = LibraryAsset;
type Layout = 'cover' | 'statement' | 'photo' | 'steps' | 'split' | 'closing';
type PhotoFrame = 'none'|'rounded'|'super-rounded'|'polaroid'|'soft-shadow'|'double-border';
const photoFrames:{id:PhotoFrame;name:string}[]=[{id:'none',name:'Clean'},{id:'rounded',name:'Rounded'},{id:'super-rounded',name:'Super soft'},{id:'polaroid',name:'Polaroid'},{id:'soft-shadow',name:'Floating'},{id:'double-border',name:'Double line'}];
// Licensed Unsplash residential photographs for non-exported frame previews only.
const sampleHomes=["https://images.unsplash.com/photo-1647579350413-a6ada4e480ed?auto=format&fit=crop&w=480&q=80","https://images.unsplash.com/photo-1639060631449-4a3ba54a203a?auto=format&fit=crop&w=480&q=80","https://images.unsplash.com/photo-1771366260867-7e07094579d7?auto=format&fit=crop&w=480&q=80","https://images.unsplash.com/photo-1743884134387-24734042d379?auto=format&fit=crop&w=480&q=80","https://images.unsplash.com/photo-1770756051811-1612ac8bedfa?auto=format&fit=crop&w=480&q=80","https://images.unsplash.com/photo-1778166166419-792a411e197c?auto=format&fit=crop&w=480&q=80"];
type Slide = {
  key: string; eyebrow: string; title: string; description: string;
  layout: Layout; assetId: string; titleFont?:CarouselFont; photoFocus?:'top'|'center'|'bottom';accentIndex?:number;backgroundId?:FreeBackgroundId;backgroundColor?:string;backgroundGradient?:string;stickerIds?:string[];frameStyle?:PhotoFrame;backgroundImageId?:string;photoPosition?:TouchRect;stickerPositions?:StickerPositions;
};
type Props = {
  brand: Brand; post: Post; assets: Asset[]; images: Record<string, string>;
  onChange: (next: Post) => void; onSave: () => void;
  onNewAsset: (asset: Asset, dataUrl: string) => void;
  loadImage: (id: string) => void; uploadImage: () => void;
  notify: (message: string) => void; showError: (e: unknown) => void; saving: boolean;onOpenStickers?:()=>void; onUploadBackground:(file:File)=>Promise<Asset|null>; initialBackground?:{version:number;brandId?:string;id?:FreeBackgroundId;imageAssetId?:string}; initialSticker?:{version:number;brandId?:string;id?:string};
  onUploadPhoto:(file:File)=>Promise<Asset|null>;
};
const layouts: Layout[] = ['cover','statement','photo','steps','split','closing'];
const editorialTextGeometry=(slide:Slide,field:'eyebrow'|'title'|'description')=>{
 const plan=editorialPlan(slide.layout,!!slide.assetId,!!slide.description.trim());
 const p=field==='title'?plan.title:field==='description'?plan.body:
  {x:plan.eyebrow.x,top:plan.eyebrow.top,width:840,size:25,lines:1};
 return {rect:{x:p.x/1080,y:p.top/1350,w:p.width/1080,
  h:Math.min(.75,Math.max(.07,(p.size*p.lines*1.12)/1350))},fontSize:p.size};
};
const layoutNames: Record<Layout,string> = {
  cover: 'Editorial cover', statement: 'Statement', photo: 'Photo story',
  steps: 'Useful points', split: 'Split editorial', closing: 'Final CTA'
};
const defaultLabel = (brand: Brand) => brand.language === 'English' ? 'A CLOSER LOOK' : 'OTRA MANERA DE VERLO';
const makeSlide = (i: number, headline: string, assetId = ''): Slide => ({
  key: 'slide-' + i, eyebrow: '',
  title: headline.slice(0,420), description: '',
  layout: i === 0 ? 'cover' : i % 3 === 0 ? 'photo' : i % 2 === 0 ? 'steps' : 'statement',
  assetId,frameStyle:i===0?'rounded':'none'
});
function parseSlides(post: Post, brand: Brand): Slide[] {
  const saved=readCarouselDesign(post.designData||'');
  if(saved.slides){
    const data=saved.slides;
    if(data.length>=2&&data.length<=8){
      return data.map((s:any, i) => ({
          key: String(s.key || 'slide-' + i),
          eyebrow: String(s.eyebrow || ''),
          title: String(s.title || ''),
          description: String(s.description || ''),
          layout: layouts.includes(s.layout) ? s.layout as Layout : 'statement',
          titleFont:isCarouselFont(s.titleFont)?s.titleFont:undefined,
          assetId: String(s.assetId || ''),
          photoFocus:['top','center','bottom'].includes(s.photoFocus)?s.photoFocus:'center',
           frameStyle:photoFrames.some(f=>f.id===s.frameStyle)?s.frameStyle:'none',
          accentIndex:Number.isInteger(s.accentIndex)&&s.accentIndex>=0&&s.accentIndex<=8?s.accentIndex:0,
           backgroundId:typeof s.backgroundId==='string'?s.backgroundId:'brand',stickerIds:Array.isArray(s.stickerIds)?s.stickerIds.filter((x:unknown)=>typeof x==='string').slice(0,3):[],
           backgroundImageId:typeof s.backgroundImageId==='string'?s.backgroundImageId.slice(0,150):'',
           backgroundColor:typeof s.backgroundColor==='string'&&/^#[0-9a-f]{6}$/i.test(s.backgroundColor)?s.backgroundColor:undefined,
           backgroundGradient:typeof s.backgroundGradient==='string'&&/^#[0-9a-f]{6}$/i.test(s.backgroundGradient)?s.backgroundGradient:undefined,
           photoPosition:s.photoPosition&&typeof s.photoPosition==='object'?clampRect(s.photoPosition):undefined,
           stickerPositions:normalizedPositions(s.stickerPositions)
        }));
    }
  }
  if(!post.id&&!post.hook.trim()&&!post.slides.trim()&&!post.cta.trim()){
    return Array.from({length:4},(_,n)=>({...makeSlide(n,''),eyebrow:'',description:'',
      layout:'statement' as Layout,frameStyle:'none' as const,assetId:''}));
  }
  const entries = post.slides.split('\n').map(s => s.replace(/^\s*(?:slide|diapositiva)?\s*\d+\s*[-:.)]\s*/i,'').trim()).filter(Boolean).slice(0,4);
  // A genuinely blank draft has no fabricated marketing hook. The editor guides
  // people to write their own instead of shipping generic template copy.
  const title = post.hook.trim();
  const result: Slide[] = [{...makeSlide(0,title,post.assetId),photoFocus:'top'}];
  entries.forEach((entry,n)=>result.push(makeSlide(n+1,entry)));
  if(result.length < 3) {
    result.push(makeSlide(result.length,''));
    result.push(makeSlide(result.length,''));
  }
  result.push({
    ...makeSlide(result.length,post.cta.trim()),
    layout:'closing'
  });
  return result;
}
function fillLines(ctx: CanvasRenderingContext2D,text: string,x: number,y: number,maxW: number,size: number,lines: number,color: string,font='Georgia, serif') {
  const words=text.replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
  let built:string[]=[];
  for(let fontSize=size;fontSize>=32;fontSize-=4) {
    ctx.font='bold '+fontSize+'px '+font;
    built=[];let next='';
    words.forEach(word=>{
      const trial=next?next+' '+word:word;
      if(ctx.measureText(trial).width>maxW&&next){built.push(next);next=word;}else next=trial;
    });
    if(next)built.push(next);
    if(built.length<=lines&&built.every(line=>ctx.measureText(line).width<=maxW)){size=fontSize;break;}
    size=fontSize;
  }
  const spacing=Math.round(size*1.12);
  ctx.font='bold '+size+'px '+font;ctx.fillStyle=color;
  ctx.textBaseline='alphabetic';
  built.slice(0,lines).forEach((line,i)=>ctx.fillText(line,x,y+i*spacing));
}
async function drawSlide(slide:Slide,i:number,total:number,brand:Brand,images:Record<string,string>,style:CarouselStyle,editorMode=false) {
  if(slide.assetId&&!slide.photoPosition)slide={...slide,photoPosition:{...photoDefault(slide.layout),
    crop:normalizeCrop({y:slide.photoFocus==='top'?.12:slide.photoFocus==='bottom'?.9:.5})}};
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No se pudo abrir el diseñador de imágenes.');
  const {paper,accent,ink:paletteInk,onAccent,muted,outline}=getCarouselPalette(brand,style,slide.accentIndex||0);
  const ink=['night-editorial','night-stars','rust-autumn'].includes(slide.backgroundId||'')?'#FFFFFF':style.freeCanvas?readableColor(slide.backgroundColor||style.canvasColor||'#FFFFFF'):paletteInk;
  const destination=style.targetPlatform==='brand'?preferredPlatform(brand):style.targetPlatform;
  const handle=socialAccount(brand,destination);
  const footerName=(handle&&!/^https?:\/\//i.test(handle)?handle:brand.name).toUpperCase().slice(0,32);
  const heading=carouselFontFamily(slide.titleFont||style.font,brand.headingFont);
  const bodyFont=(brand.bodyFont||'').toLowerCase()==='futura'?'Futura, Arial, sans-serif':'Arial, sans-serif';
  try{if(document.fonts)await Promise.all([document.fonts.load('700 80px '+heading),document.fonts.load('500 32px '+bodyFont)]);}catch{/* Offline fallbacks */}
  const rect=(x:number,y:number,w:number,h:number,color:string)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  const label=(text:string,x:number,y:number,color:string,size=24)=>{
    ctx.fillStyle=color;ctx.font='700 '+size+'px '+bodyFont;
    ctx.fillText(text.slice(0,50),x,y);
  };
  const photo=async(x:number,y:number,w:number,h:number,free=false)=>{
    if(slide.photoPosition&&!free)return true;
    if(!slide.assetId||!images[slide.assetId])return false;
    const img=new Image();img.src=images[slide.assetId];
    await img.decode();
    if(!img.naturalWidth||!img.naturalHeight)return false;
    const mode=slide.frameStyle||'none';
    const metrics=photoFrameMetrics(w,h,mode);
    const {inset,bottom}=metrics;
    const customRadius=slide.photoPosition?.cornerRadius;
    const outerRadius=customRadius===undefined?metrics.radius:layerCornerPixels(slide.photoPosition!,w,h);
    const radius=customRadius===undefined?metrics.innerRadius:Math.max(0,outerRadius-inset*.38);
    if(mode!=='none'){
      ctx.save();
      if(mode==='soft-shadow'||mode==='polaroid'){
        ctx.shadowColor='rgba(21,38,45,.22)';ctx.shadowBlur=35;ctx.shadowOffsetY=12;
      }
      ctx.fillStyle=mode==='polaroid'?'#FFFCF7':paper;
      ctx.beginPath();ctx.roundRect(x,y,w,h,outerRadius);ctx.fill();ctx.restore();
    }
    const dx=x+inset,dy=y+inset,dw=w-2*inset,dh=h-inset-bottom;
    if(dw<=0||dh<=0)return false;
    const z=Math.max(dw/img.naturalWidth,dh/img.naturalHeight),sw=dw/z,sh=dh/z;
    const f=slide.photoFocus||'center';
    const cy=f==='top'?Math.max(0,(img.naturalHeight-sh)*.12):f==='bottom'?Math.max(0,(img.naturalHeight-sh)*.9):Math.max(0,(img.naturalHeight-sh)/2);
    ctx.save();
    ctx.beginPath();ctx.roundRect(dx,dy,dw,dh,radius);ctx.clip();
    if(slide.photoPosition?.crop){
      const p=coverPlacement(img.naturalWidth,img.naturalHeight,dw,dh,slide.photoPosition.crop);
      ctx.drawImage(img,dx+p.x,dy+p.y,p.width,p.height);
    }else ctx.drawImage(img,Math.max(0,(img.naturalWidth-sw)/2),cy,sw,sh,dx,dy,dw,dh);
    ctx.restore();
    if(mode==='double-border'){
      ctx.save();ctx.strokeStyle=accent;ctx.lineWidth=3;
      ctx.beginPath();ctx.roundRect(x+6,y+6,w-12,h-12,outerRadius);ctx.stroke();
      ctx.strokeStyle=paper;ctx.beginPath();ctx.roundRect(dx+7,dy+7,dw-14,dh-14,Math.max(2,radius-2));ctx.stroke();ctx.restore();
    }
    return true;
  };
  const title=(x:number,y:number,w:number,size:number,maxLines:number,color=ink)=>fillLines(ctx,slide.title,x,y,w,size,maxLines,color,heading);
  const body=(x:number,y:number,w:number,color=ink,maxLines=3)=>{
    if(slide.description)fillLines(ctx,slide.description,x,y,w,41,maxLines,color,bodyFont);
  };
  const footer=(color=ink)=>{
    label(footerName,72,1284,color,21);
    label(String(i+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),885,1284,color,21);
  };
  const decorated=(!!slide.backgroundId&&slide.backgroundId!=='brand')||!!slide.backgroundImageId;
  if(slide.backgroundImageId&&images[slide.backgroundImageId]){
    try{await paintCoverImage(ctx,images[slide.backgroundImageId],1080,1350)}catch{rect(0,0,1080,1350,paper)}
  }else if(slide.backgroundId&&slide.backgroundId!=='brand')paintFreeBackground(ctx,1080,1350,slide.backgroundId,accent,paper);
  else {
    const start=slide.backgroundColor||style.canvasColor||'#FFFFFF',end=slide.backgroundGradient||style.canvasGradient;
    if(end){const g=ctx.createLinearGradient(0,0,1080,1350);g.addColorStop(0,start);g.addColorStop(1,end);
      ctx.fillStyle=g;ctx.fillRect(0,0,1080,1350);}
    else rect(0,0,1080,1350,start);
  }
  // The free canvas begins without decorative shapes, lines, borders or prebuilt cards.
  if(style.freeCanvas){
    if(!editorMode){
      if(style.editorialRhythm){
        const p=editorialPlan(slide.layout,!!slide.assetId,!!slide.description.trim());
        if(slide.eyebrow.trim())label(slide.eyebrow,p.eyebrow.x,p.eyebrow.top+26,ink,24);
        if(slide.title.trim())title(p.title.x,p.title.top+p.title.size,p.title.width,p.title.size,p.title.lines);
        if(slide.description.trim())fillLines(ctx,slide.description,p.body.x,p.body.top+p.body.size,
          p.body.width,p.body.size,p.body.lines,ink,bodyFont);
        if(!slide.assetId&&slide.title.trim())label(String(i+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),p.folio.x,p.folio.top+20,ink,19);
      } else {
      // A minimalist editorial composition should use typography and whitespace
      // intentionally rather than fixing every headline near the top.
      const hasPhoto=Boolean(slide.assetId);
      const hasBody=Boolean(slide.description.trim());
      const hasEyebrow=Boolean(slide.eyebrow.trim());
      if(hasEyebrow)label(slide.eyebrow,82,154,ink,24);
      if(slide.title.trim()){
        const textY=hasPhoto?344:hasBody?464:608;
        const textSize=hasPhoto?104:hasBody?112:124;
        title(82,textY,916,textSize,5);
      }
      if(hasBody)body(82,hasPhoto?820:850,908,ink,5);
      if(!hasPhoto&&slide.title.trim()){
        // Small editorial folio anchors a text-only slide without adding
        // automatic lines, stickers, blocks or fake decorative elements.
        label(String(i+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),82,1270,ink,19);
      }
      }
      // A photo belongs to the editable slide regardless of its typography rhythm.
      if(slide.assetId&&slide.photoPosition){
        const p=clampRect(slide.photoPosition),pw=p.w*1080,ph=p.h*1350;
        ctx.save();ctx.translate((p.x+p.w/2)*1080,(p.y+p.h/2)*1350);
        ctx.rotate((p.angle||0)*Math.PI/180);await photo(-pw/2,-ph/2,pw,ph,true);ctx.restore();
      }
      await paintOriginalStickerImages(ctx,1080,1350,slide.stickerIds,images,slide.stickerPositions);
    }
    return canvas;
  }
  if(slide.layout==='cover') {
    slide.eyebrow&&label(slide.eyebrow,74,138,ink);rect(74,170,126,8,accent);
    title(74,348,920,106,5);
    if(slide.assetId&&!slide.photoPosition)rect(635,735,398,445,accent);
    const shown=await photo(635,735,398,445);
    if(!shown&&slide.assetId){rect(650,751,368,415,muted);ctx.strokeStyle=outline;ctx.lineWidth=7;ctx.beginPath();ctx.arc(835,958,129,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.moveTo(706,957);ctx.lineTo(706,1114);ctx.stroke();}
    body(74,1060,490,ink,3);footer();
  } else if(slide.layout==='statement') {
    if(!decorated)rect(0,0,1080,1350,accent);
    const statementInk=decorated?(['night-editorial','night-stars','rust-autumn'].includes(slide.backgroundId||'')?'#FFFFFF':'#191919'):onAccent;
    ctx.strokeStyle=statementInk;ctx.lineWidth=3;ctx.strokeRect(68,69,944,1212);
    slide.eyebrow&&label(slide.eyebrow,116,150,statementInk);
    title(116,428,850,108,6,statementInk);
    body(116,1040,825,statementInk,3);footer(statementInk);
  } else if(slide.layout==='photo') {
    if(!decorated)rect(0,0,1080,730,accent);const shown=await photo(0,0,1080,730);
    if(!shown&&slide.assetId){rect(0,0,1080,730,muted);ctx.strokeStyle=outline;ctx.lineWidth=7;ctx.strokeRect(90,95,900,550);}
    slide.eyebrow&&label(slide.eyebrow,75,832,ink);
    title(75,952,925,80,3);
    body(75,1155,900,ink,2);footer();
  } else if(slide.layout==='steps') {
    slide.eyebrow&&label(slide.eyebrow,74,135,ink);
    title(74,275,930,78,3);
    rect(74,535,932,4,accent);
    const points=slide.description.split(/\n|•/).map(s=>s.trim()).filter(Boolean).slice(0,3);
    if(points.length){
      points.forEach((p,j)=>{
        const y=630+j*173;label(String(j+1).padStart(2,'0'),75,y,accent,34);
        fillLines(ctx,p,180,y,775,48,2,ink,'Arial');
        rect(180,y+82,760,1,accent);
      });
    } else {
      rect(74,659,700,12,accent);rect(74,829,560,12,accent);rect(74,999,780,12,accent);
    }
    footer();
  } else if(slide.layout==='split') {
    rect(0,0,530,1350,accent);const shown=await photo(530,0,550,1350);
    if(!shown&&slide.assetId)rect(590,240,410,865,paper);
    slide.eyebrow&&label(slide.eyebrow,60,147,onAccent);
    title(60,340,430,78,8,onAccent);
    body(60,1110,430,onAccent,3);footer(onAccent);
  } else {
    if(!decorated){rect(0,0,1080,1350,accent);rect(73,75,934,1200,paper);}
    slide.eyebrow&&label(slide.eyebrow,116,174,ink);
    title(116,450,843,99,6);
    body(116,1040,840,ink,3);rect(116,1151,175,10,accent);
    label(footerName,116,1225,ink,22);
    label(String(i+1).padStart(2,'0'),895,1225,ink,22);
  }
  if(slide.photoPosition&&slide.assetId&&!editorMode){
    const p=clampRect(slide.photoPosition),pw=p.w*1080,ph=p.h*1350;
    ctx.save();
    ctx.translate((p.x+p.w/2)*1080,(p.y+p.h/2)*1350);
    ctx.rotate((p.angle||0)*Math.PI/180);
    await photo(-pw/2,-ph/2,pw,ph,true);
    ctx.restore();
  }
  if(!editorMode)await paintOriginalStickerImages(ctx,1080,1350,slide.stickerIds,images,slide.stickerPositions);
  return canvas;
}

/** Transparent text-only pass for putting photos behind headlines in preview AND exports. */
async function paintCarouselTypography(ctx:CanvasRenderingContext2D,
 slides:Slide[],brand:Brand,style:CarouselStyle){
 const defaultHeading=carouselFontFamily(style.font,brand.headingFont);
 const bodyFont=(brand.bodyFont||'').toLowerCase()==='futura'?'Futura, Arial, sans-serif':'Arial, sans-serif';
 try{if(document.fonts)await Promise.all([document.fonts.load('700 80px '+defaultHeading),
  document.fonts.load('500 32px '+bodyFont)]);}catch{/* Local font fallback */}
 const destination=style.targetPlatform==='brand'?preferredPlatform(brand):style.targetPlatform;
 const handle=socialAccount(brand,destination);
 const footerName=(handle&&!/^https?:\/\//i.test(handle)?handle:brand.name).toUpperCase().slice(0,32);
 for(let n=0;n<slides.length;n++){
  ctx.save();ctx.translate(n*1080,0);
  const slide=slides[n];
  const heading=carouselFontFamily(slide.titleFont||style.font,brand.headingFont);
  try{await document.fonts?.load('700 80px '+heading);}catch{/* Offline font fallback */}
  const {ink:paletteInk,accent,onAccent}=getCarouselPalette(brand,style,slide.accentIndex||0);
  const ink=['night-editorial','night-stars','rust-autumn'].includes(slide.backgroundId||'')?'#FFFFFF':style.freeCanvas?readableColor(slide.backgroundColor||style.canvasColor||'#FFFFFF'):paletteInk;
  const decorated=(!!slide.backgroundId&&slide.backgroundId!=='brand')||!!slide.backgroundImageId;
  const label=(t:string,x:number,y:number,color:string,size=24)=>{
   if(!t)return;ctx.fillStyle=color;ctx.font='700 '+size+'px '+bodyFont;
   ctx.fillText(t.slice(0,50),x,y);
  };
  const title=(x:number,y:number,w:number,size:number,lines:number,color=ink)=>
    fillLines(ctx,slide.title,x,y,w,size,lines,color,heading);
  const body=(x:number,y:number,w:number,color=ink,lines=3)=>{
   if(slide.description)fillLines(ctx,slide.description,x,y,w,41,lines,color,bodyFont);
  };
  const footer=(color=ink)=>{
   label(footerName,72,1284,color,21);
   label(String(n+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0'),885,1284,color,21);
  };
  if(style.freeCanvas){
   if(style.editorialRhythm){
    const p=editorialPlan(slide.layout,!!slide.assetId,!!slide.description.trim());
    label(slide.eyebrow,p.eyebrow.x,p.eyebrow.top+26,ink);
    if(slide.title.trim())title(p.title.x,p.title.top+p.title.size,p.title.width,p.title.size,p.title.lines);
    if(slide.description.trim())fillLines(ctx,slide.description,p.body.x,p.body.top+p.body.size,p.body.width,p.body.size,p.body.lines,ink,bodyFont);
    if(!slide.assetId&&slide.title.trim())label(String(n+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0'),p.folio.x,p.folio.top+20,ink,19);
   }else{
   const hasPhoto=Boolean(slide.assetId),hasBody=Boolean(slide.description.trim());
   if(slide.eyebrow.trim())label(slide.eyebrow,82,154,ink);
   if(slide.title.trim())title(82,hasPhoto?344:hasBody?464:608,916,hasPhoto?104:hasBody?112:124,5);
   if(hasBody)body(82,hasPhoto?820:850,908,ink,5);
   if(!hasPhoto&&slide.title.trim()){
     label(String(n+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0'),82,1270,ink,19);
   }
   }
  }else if(slide.layout==='cover'){
   label(slide.eyebrow,74,138,ink);title(74,348,920,106,5);
   body(74,1060,490,ink,3);footer();
  }else if(slide.layout==='statement'){
   const statementInk=decorated?(['night-editorial','night-stars','rust-autumn'].includes(slide.backgroundId||'')?'#FFFFFF':'#191919'):onAccent;
   label(slide.eyebrow,116,150,statementInk);
   title(116,428,850,108,6,statementInk);
   body(116,1040,825,statementInk,3);footer(statementInk);
  }else if(slide.layout==='photo'){
   label(slide.eyebrow,75,832,ink);title(75,952,925,80,3);
   body(75,1155,900,ink,2);footer();
  }else if(slide.layout==='steps'){
   label(slide.eyebrow,74,135,ink);title(74,275,930,78,3);
   const points=slide.description.split(/\n|•/).map(t=>t.trim()).filter(Boolean).slice(0,3);
   points.forEach((point,j)=>{
    const y=630+j*173;label(String(j+1).padStart(2,'0'),75,y,accent,34);
    fillLines(ctx,point,180,y,775,48,2,ink,'Arial');
   });
   footer();
  }else if(slide.layout==='split'){
   label(slide.eyebrow,60,147,onAccent);title(60,340,430,78,8,onAccent);
   body(60,1110,430,onAccent,3);footer(onAccent);
  }else{
   label(slide.eyebrow,116,174,ink);title(116,450,843,99,6);
   body(116,1040,840,ink,3);
   label(footerName,116,1225,ink,22);
   label(String(n+1).padStart(2,'0'),895,1225,ink,22);
  }
  ctx.restore();
 }
}
async function photoAspectFromSource(src?:string):Promise<number>{
 if(!src)return .75;
 try{const image=new Image();image.src=src;await image.decode();
  return image.naturalHeight?image.naturalWidth/image.naturalHeight:.75;
 }catch{return .75;}
}
async function photoAspectFromFile(file:File):Promise<number>{
 const src=URL.createObjectURL(file);
 try{return await photoAspectFromSource(src);}finally{URL.revokeObjectURL(src);}
}

const filename=(post:Post,i:number)=>{
  const slug=(post.title||'content').normalize('NFKD').replace(/[^a-z0-9 -]/gi,'').trim().replace(/\s+/g,'-').toLowerCase()||'content';
  return slug+'-slide-'+String(i+1).padStart(2,'0')+'-1080x1350.png';
};
export default function CarouselFactory({brand,post,assets,images,onChange,onSave,onNewAsset,loadImage,uploadImage,notify,showError,saving,onOpenStickers,onUploadBackground,onUploadPhoto,initialBackground,initialSticker}:Props) {
  const slides=useMemo(()=>parseSlides(post,brand),[post.designData,post.hook,post.slides,post.cta,post.assetId,brand.id]);
  const style=useMemo(()=>readCarouselDesign(post.designData||'').style,[post.designData]);
  const ownedAssets=useMemo(()=>assets.filter(a=>a.brandId===brand.id||a.shared),[assets,brand.id]);
  const socialDestination=style.targetPlatform==='brand'?preferredPlatform(brand):style.targetPlatform;
  const socialLabel=platformName(socialDestination);
  const destinationAccount=socialAccount(brand,socialDestination);
  const palette=brandPalette(brand);
  const [current,setCurrent]=useState(0);
  const swipeStart=useRef<{x:number;y:number}|null>(null);
  const [preview,setPreview]=useState('');
  const [panoramaPreview,setPanoramaPreview]=useState('');
  const [panoramaTextPreview,setPanoramaTextPreview]=useState('');
  const [panoramaError,setPanoramaError]=useState('');
  const [previewRevision,setPreviewRevision]=useState(0);
  const [touchEdit,setTouchEdit]=useState(false);
  const [studioTab,setStudioTab]=useState<'inspiration'|'canvas'|'style'|'slides'|'review'|'ai'>('canvas');
  const [downloads,setDownloads]=useState<{name:string,url:string}[]>([]);
  const pastHistory=useRef<string[]>([]);
  const futureHistory=useRef<string[]>([]);
  const [historyVersion,setHistoryVersion]=useState(0);
  const recordHistory=(snapshot:string)=>{
    if(snapshot&&pastHistory.current[pastHistory.current.length-1]!==snapshot){
      pastHistory.current=[...pastHistory.current.slice(-39),snapshot];
      futureHistory.current=[];
      setHistoryVersion(n=>n+1);
    }
  };
  const restoreHistory=(direction:'undo'|'redo')=>{
    const from=direction==='undo'?pastHistory:futureHistory;
    const to=direction==='undo'?futureHistory:pastHistory;
    const snapshot=from.current.pop();if(!snapshot)return;
    if(post.designData)to.current.push(post.designData);
    const decoded=readCarouselDesign(snapshot);
    const first=decoded.slides?.[0] as {title?:string}|undefined;
    onChange({...post,designData:snapshot,hook:first?.title||''});
    setDownloads([]);setOverview([]);setHistoryVersion(n=>n+1);
  };
  const [idea,setIdea]=useState('');
  const [imagePrompt,setImagePrompt]=useState('');
  const [imageMode,setImageMode]=useState<'new'|'variation'>('new');
  const [sourceId,setSourceId]=useState('');
  const [imageSubjectType,setImageSubjectType]=useState<'portrait'|'product'>('portrait');
  const [referenceReport,setReferenceReport]=useState('');
  const [overview,setOverview]=useState<string[]>([]);
  const [overviewBusy,setOverviewBusy]=useState(false);
  const [busy,setBusy]=useState('');
  useEffect(()=>{setCurrent(0);setTouchEdit(false);setDownloads([]);setOverview([]);setReferenceReport('');setSourceId('');setPreview('');setPanoramaPreview('');setPanoramaTextPreview('');setPanoramaError('');pastHistory.current=[];futureHistory.current=[];setHistoryVersion(n=>n+1);},[brand.id,post.id]);
  const i=Math.min(current,slides.length-1),slide=slides[i];
  // A wide, sharp preview, capped to stay below mobile canvas texture limits.
  // Legacy rendering used 432px/slide and blurred fine type on Retina displays.
  const previewPageWidth=Math.min(900,Math.floor(6800/slides.length));
  const previewPageHeight=Math.round(previewPageWidth*1.25);
  const warnings=slides.flatMap((part,n)=>{
    const result:string[]=[];
    if(!part.title.trim())result.push('Slide '+(n+1)+': falta el titular.');
    if(part.title.length>(part.layout==='split'?95:part.layout==='cover'?115:155))result.push('Slide '+(n+1)+': titular largo, revisa la vista previa.');
    if(['photo','split'].includes(part.layout)&&!part.assetId)result.push('Slide '+(n+1)+': diseño fotográfico sin foto.');
    if(part.description.length>260)result.push('Slide '+(n+1)+': texto secundario demasiado largo.');
    return result;
  });
  const renderAllSlides=async()=>{
    const required=slides.flatMap(part=>[part.assetId,part.backgroundImageId,...part.stickerIds||[]]);
    required.push(...(style.panoramaLayers||[]).filter(layer=>layer.kind==='photo'||layer.kind==='sticker').map(layer=>layer.assetId));
    if(style.seamlessEnabled)required.push(style.seamlessAssetId);
    if(required.some(id=>id&&!images[id]))throw Error('Una foto o sticker todavía está cargando. Espera antes de descargar.');
    if(style.seamlessEnabled)return drawSeamlessPages(slides,brand,images,{backgroundId:style.seamlessBackgroundId,assetId:style.seamlessAssetId,accent:style.accentSource==='reference'?style.referenceColor||brand.color:brand.color,layers:style.panoramaLayers,font:style.font,freeCanvas:style.freeCanvas,editorialRhythm:style.editorialRhythm,canvasColor:style.canvasColor,canvasGradient:style.canvasGradient});
    const all=await Promise.all(slides.map((part,n)=>drawSlide(part,n,slides.length,brand,images,style)));
    return overlayPanoramaPages(all,style.panoramaLayers||[],images,ctx=>paintCarouselTypography(ctx,slides,brand,style));
  };
  const setAll=(all:Slide[],nextStyle:CarouselStyle=style)=>{
    recordHistory(post.designData||encodeCarouselDesign(slides,style));
    onChange({...post,format:'Carousel',designData:encodeCarouselDesign(all,nextStyle),hook:all[0].title});
    setDownloads([]);setOverview([]);
  };
  const previewAll=async()=>{
    setOverviewBusy(true);setOverview([]);
    try{
      const previews:string[]=[];
      const all=await renderAllSlides();
      for(let n=0;n<all.length;n++){
        const canvas=all[n];
        const thumb=document.createElement('canvas');thumb.width=540;thumb.height=675;
        const context=thumb.getContext('2d');if(!context)throw Error('No se pudo preparar la vista previa.');
        context.imageSmoothingEnabled=true;
        context.imageSmoothingQuality='high';
        context.drawImage(canvas,0,0,thumb.width,thumb.height);
        // Lossless PNG keeps letter edges crisp, especially on iPhone.
        previews.push(thumb.toDataURL('image/png'));
        thumb.width=1;
      }
      setOverview(previews);notify('Vista previa completa preparada sin consumir créditos.');
    }catch(e){showError(e)}finally{setOverviewBusy(false)}
  };
  const setArtStyle=(patch:Partial<CarouselStyle>)=>setAll(slides,normalizeCarouselStyle({...style,...patch}));
  const appliedStickerVersion=useRef(0);
  useEffect(()=>{
    if(!initialSticker?.version||initialSticker.brandId!==brand.id||!initialSticker.id||appliedStickerVersion.current===initialSticker.version)return;
    appliedStickerVersion.current=initialSticker.version;
    const id=initialSticker.id;
    const next=slides.map((slide,i)=>i===0?{
      ...slide,stickerIds:[...(slide.stickerIds||[]).filter(x=>x!==id),id].slice(-3)
    }:slide);
    setAll(next);
    if(!images[id])loadImage(id);
    notify('Sticker original añadido a la portada. Se incluirá en el PNG exportado.');
  },[initialSticker?.version,brand.id]);
  const appliedBackgroundVersion=useRef(0);
  useEffect(()=>{
    if(!initialBackground?.version||initialBackground.brandId!==brand.id||!initialBackground.id||appliedBackgroundVersion.current===initialBackground.version)return;
    appliedBackgroundVersion.current=initialBackground.version;
    // Keep one unified collection: the chosen background applies to every slide
    // and is also used as the seamless panoramic background when enabled.
    const nextSlides=slides.map(s=>({...s,backgroundId:initialBackground.id,
      backgroundImageId:initialBackground.imageAssetId||''}));
    setAll(nextSlides,normalizeCarouselStyle({...style,seamlessBackgroundId:initialBackground.id,
     seamlessAssetId:initialBackground.imageAssetId||''}));
    if(initialBackground.imageAssetId&&!images[initialBackground.imageAssetId])loadImage(initialBackground.imageAssetId);
    setStudioTab('style');
    notify('Fondo aplicado a todo el carrusel. Puedes cambiarlo slide por slide.');
  },[initialBackground?.version,brand.id]);

  const applyReference=async()=>{
    if(!style.referenceAssetId)return notify('Elige una referencia de esta marca.');
    const url=images[style.referenceAssetId];if(!url)return notify('La imagen todavía está cargando.');
    try{
      const sample=await sampleReferencePalette(url);
      setAll(slides,{...style,referenceColor:sample.color,accentSource:'reference',mood:sample.mood});
      setReferenceReport('Referencia interpretada: '+sample.summary+' · '+sample.color+'. No se copia la fotografía. Sin créditos IA.');
      notify('Paleta y contraste aplicados a todos los slides. Sin créditos.');
    }catch(e){showError(e)}
  };
  const applyRhythm=()=>{
    const rhythm=editorialRhythmForSlides(slides);
    setAll(slides.map((item,n)=>({...item,layout:rhythm[n],photoFocus:item.photoFocus||'top'})),normalizeCarouselStyle({...style,editorialRhythm:true}));
    notify('Ritmo editorial aplicado: slides fotográficos, tipográficos y mixtos. Tus fotos y textos siguen editables.');
  };
  const replace=(patch:Partial<Slide>)=>setAll(slides.map((s,j)=>j===i?{...s,...patch}:s));
  const updateDecoration=(next:Partial<Slide>)=>{
    const hasBg=('backgroundImageId' in next)||('backgroundId' in next);
    const changedBackground=hasBg&&(
      (next.backgroundImageId||'')!==(slide.backgroundImageId||'')||
      (next.backgroundId||'brand')!==(slide.backgroundId||'brand'));
    if(changedBackground){
      // The visible "Fondo" picker is global. Apply to ALL slides and the
      // seamless canvas; never silently revert to an older default.
      const backgroundId=next.backgroundId||'brand';
      const backgroundImageId=next.backgroundImageId||'';
      setAll(slides.map((part,index)=>({...part,backgroundId,backgroundImageId,
        backgroundColor:undefined,backgroundGradient:undefined,
        ...(index===i?{stickerIds:next.stickerIds??part.stickerIds}:{})
      })),normalizeCarouselStyle({...style,seamlessBackgroundId:backgroundId,
         seamlessAssetId:backgroundImageId}));
      if(backgroundImageId&&!images[backgroundImageId])loadImage(backgroundImageId);
      notify('Fondo aplicado a todos los slides.');
    }else replace(next);
  };
  const backgroundOfAll=()=>{
    const backgroundId=slide.backgroundId||'brand',backgroundImageId=slide.backgroundImageId||'';
    setAll(slides.map(part=>({...part,backgroundId,backgroundImageId,
      backgroundColor:undefined,backgroundGradient:undefined})),
      normalizeCarouselStyle({...style,seamlessBackgroundId:backgroundId,seamlessAssetId:backgroundImageId}));
    notify('Este fondo se aplicó a todas las diapositivas.');
  };
  const enableTouch=()=>{
    if(!touchEdit&&slide.assetId&&!slide.photoPosition)replace({photoPosition:{...photoDefault(slide.layout),crop:normalizeCrop({y:slide.photoFocus==='top'?.12:slide.photoFocus==='bottom'?.9:.5})}});
    setTouchEdit(v=>!v);
  };
  const touchLayers=[
    ...(slide.photoPosition&&slide.assetId&&images[slide.assetId]?[{id:'photo-'+slide.key,kind:'photo' as const,name:'Foto del slide',src:images[slide.assetId],rect:{...clampRect(slide.photoPosition),crop:slide.photoPosition.crop||normalizeCrop({y:slide.photoFocus==='top'?.12:slide.photoFocus==='bottom'?.9:.5})},frameStyle:slide.frameStyle||'none',paper:getCarouselPalette(brand,style).paper,accent:getCarouselPalette(brand,style).accent}]:[]),
    ...(slide.stickerIds||[]).filter(id=>images[id]).map((id,index)=>({id,kind:'sticker' as const,name:ownedAssets.find(a=>a.id===id)?.displayName||'Sticker',src:images[id],rect:clampRect(slide.stickerPositions?.[id]||stickerDefault(index))}))
  ];
  const moveTouchLayer=(kind:'photo'|'sticker'|'text'|'shape',id:string,rect:TouchRect)=>{
    if(kind==='photo')replace({photoPosition:clampRect(rect)});
    else if(kind==='sticker')replace({stickerPositions:{...slide.stickerPositions,[id]:clampRect(rect)}});
  };
  const pageLayers=slides.flatMap((part,n)=>[
    ...(part.assetId&&images[part.assetId]?[{
      id:'page-photo-'+part.key,kind:'photo' as const,name:'Foto · slide '+(n+1),
      src:images[part.assetId],rect:{...clampRect(part.photoPosition||photoDefault(part.layout)),
        x:(n+clampRect(part.photoPosition||photoDefault(part.layout)).x)/slides.length,
        w:clampRect(part.photoPosition||photoDefault(part.layout)).w/slides.length,
        crop:part.photoPosition?.crop||normalizeCrop({y:part.photoFocus==='top'?.12:part.photoFocus==='bottom'?.9:.5})},
      frameStyle:style.seamlessEnabled?'panorama':part.frameStyle||'none',
      paper:getCarouselPalette(brand,style,part.accentIndex||0).paper,accent:getCarouselPalette(brand,style,part.accentIndex||0).accent,
      page:n,assetId:part.assetId,
    }]:[]),
    ...(part.stickerIds||[]).filter(id=>images[id]).map((id,index)=>{
      const r=clampRect(part.stickerPositions?.[id]||stickerDefault(index));
      return {id:'page-sticker-'+part.key+'-'+id,kind:'sticker' as const,
        name:'Sticker · slide '+(n+1),src:images[id],rect:{...r,x:(n+r.x)/slides.length,w:r.w/slides.length},page:n,assetId:id};
    }),
    ...(style.freeCanvas?([
      {field:'eyebrow' as const,value:part.eyebrow,name:'Etiqueta',rect:{x:.068,y:.061,w:.86,h:.08},fontSize:25},
      {field:'title' as const,value:part.title,name:'Título',rect:{x:.068,y:.18,w:.86,h:.38},fontSize:92},
      {field:'description' as const,value:part.description,name:'Descripción',rect:{x:.068,y:.58,w:.86,h:.28},fontSize:38},
    ].filter(item=>item.value.trim()).map(item=>{
      const geometry=style.editorialRhythm?editorialTextGeometry(part,item.field):{rect:item.rect,fontSize:item.fontSize};
      return ({
      id:'page-text-'+part.key+'-'+item.field,kind:'text' as const,assetId:'',
      name:item.name+' · slide '+(n+1),src:'',text:item.value,
      font:item.field==='title'?(part.titleFont||style.font)==='brand'?(brand.headingFont||'serif').toLowerCase():(part.titleFont||style.font):'sans',
      fontSize:geometry.fontSize,color:readableColor(part.backgroundColor||style.canvasColor||'#FFFFFF'),lineHeight:1.12,spacing:0,
      rect:{...geometry.rect,x:(n+geometry.rect.x)/slides.length,w:geometry.rect.w/slides.length},
      page:n,sourceField:item.field,placement:'front' as const,
    });})):[]),
  ]);
  const panoramaLayers=[...pageLayers,...(style.panoramaLayers||[])
    .filter(layer=>(layer.kind==='text'||layer.kind==='shape'||!!images[layer.assetId]))
    .map(layer=>({...layer,src:images[layer.assetId]||''}))];
  const panoramaTextElements=slides.flatMap((part,n)=>[
    {field:'eyebrow' as const,name:'Etiqueta',value:part.eyebrow},
    {field:'title' as const,name:'Título',value:part.title},
    {field:'description' as const,name:'Descripción',value:part.description},
  ].filter(item=>item.value.trim()).map(item=>({id:part.key+':'+item.field,
    name:item.name+' · slide '+(n+1),preview:item.value.slice(0,90)})));
  const stripSource=(source:(typeof pageLayers)[number])=>slides.map((part,n)=>{
    if(n!==source.page)return part;
    if(source.kind==='photo')return {...part,assetId:'',photoPosition:part.photoPosition||photoDefault(part.layout)};
    if(source.kind==='sticker')return {...part,stickerIds:(part.stickerIds||[]).filter(value=>value!==source.assetId)};
    if(source.kind==='text'&&source.sourceField)return {...part,[source.sourceField]:''};
    return part;
  });
  const promoteSource=(source:(typeof pageLayers)[number],rect:TouchRect):PanoramaLayer=>({
    id:source.id,assetId:source.assetId||'',name:source.name,kind:source.kind,
    rect:clampPanoramaRect(rect),placement:'front',
    ...(source.kind==='text'?{text:source.text,font:source.font,fontSize:source.fontSize,
      lineHeight:source.lineHeight,spacing:source.spacing,color:source.color}:{}),
  });
  const movePanoramaLayer=(kind:'photo'|'sticker'|'text'|'shape',id:string,rect:TouchRect)=>{
    const source=pageLayers.find(layer=>layer.id===id);
    if(source){
      if((style.panoramaLayers||[]).length>=24)return notify('Máximo 24 capas en el panorama.');
      setAll(stripSource(source),{...style,panoramaLayers:[...(style.panoramaLayers||[]),promoteSource(source,rect)]});
    }else setArtStyle({panoramaLayers:(style.panoramaLayers||[]).map(layer=>layer.id===id?{...layer,rect:clampPanoramaRect(rect)}:layer)});
  };
  const updatePanoramaLayer=(id:string,patch:Partial<PanoramaLayer>)=>{
    const source=pageLayers.find(layer=>layer.id===id);
    if(source){
      if((style.panoramaLayers||[]).length>=24)return notify('Máximo 24 capas en el panorama.');
      setAll(stripSource(source),{...style,panoramaLayers:[...(style.panoramaLayers||[]),
        {...promoteSource(source,source.rect),...patch}]});
    }else setArtStyle({panoramaLayers:(style.panoramaLayers||[]).map(layer=>layer.id===id?{...layer,...patch}:layer)});
  };
  const addCanvasLayer=(kind:'text'|'shape',shape?:PanoramaLayer['shape'])=>{
    if((style.panoramaLayers||[]).length>=24)return notify('Máximo 24 elementos en el lienzo.');
    const currentId='panorama-'+crypto.randomUUID();
    const n=Math.min(i,slides.length-1),count=slides.length;
    const newLayer:PanoramaLayer=kind==='text'
      ?{id:currentId,kind,assetId:'',name:'Texto libre',placement:'front',
         text:'Escribe tu título',font:style.font==='brand'?(brand.headingFont||'serif').toLowerCase():style.font,fontSize:86,lineHeight:1.12,spacing:0,color:readableColor(style.canvasColor||'#FFFFFF'),
         rect:{x:(n+.12)/count,y:.35,w:.76/count,h:.24}}
      :{id:currentId,kind,assetId:'',name:'Collage · '+(shape||'paper'),shape:shape||'paper',
         placement:'front',color:shape==='tape'?'#E5C9AA':'#F1E5D2',
         rect:{x:(n+.2)/count,y:.35,w:.60/count,h:shape==='tape'?.10:.35}};
    setArtStyle({panoramaLayers:[...(style.panoramaLayers||[]),newLayer]});
    notify(kind==='text'?'Texto añadido: tócalo en el lienzo para editarlo y moverlo.':'Elemento de collage añadido. Arrástralo para colocarlo.');
  };
  const reorderPanoramaLayer=(id:string,action:LayerMove)=>{
    const source=pageLayers.find(layer=>layer.id===id);
    let nextSlides=slides;
    let layers=style.panoramaLayers||[];
    if(source){
      if(layers.length>=24)return notify('Máximo 24 capas en el panorama.');
      nextSlides=stripSource(source);
      layers=[...layers,promoteSource(source,source.rect)];
    }
    setAll(nextSlides,{...style,panoramaLayers:reorderPanoramaLayers(layers,id,action)});
  };
  const removePanoramaLayer=(id:string)=>{
    const source=pageLayers.find(layer=>layer.id===id);
    if(source)setAll(stripSource(source));
    else setArtStyle({panoramaLayers:(style.panoramaLayers||[]).filter(layer=>layer.id!==id)});
  };
  const removePanoramaText=(id:string)=>{
    const separator=id.lastIndexOf(':');if(separator<0)return;
    const key=id.slice(0,separator),field=id.slice(separator+1);
    if(field!=='eyebrow'&&field!=='title'&&field!=='description')return;
    setAll(slides.map(part=>part.key===key?{...part,[field]:''}:part));
  };
  // Uploads may finish after several renders; always merge into the latest draft.
  const latestDraft=useRef({post,slides,style,ownedAssets});
  latestDraft.current={post,slides,style,ownedAssets};
  const addPanoramaAssets=(items:{asset:Asset;point:{x:number;y:number};ratio?:number}[])=>{
    const latest=latestDraft.current;
    const nextSlides=[...latest.slides];
    let nextStyle={...latest.style};
    for(const {asset,point,ratio} of items){
      if(!latest.ownedAssets.some(a=>a.id===asset.id)&&asset.brandId!==brand.id&&!asset.shared)continue;
      const kind=assetCategory(asset)==='sticker'?'sticker' as const:'photo' as const;
      const count=nextSlides.length;
      if((nextStyle.panoramaLayers||[]).length>=24){notify('Máximo 24 capas en el panorama.');break;}
      const w=.2/count,h=.18;
      const rect=kind==='photo'?initialPanoramaPhotoRect(ratio||.75,count,point)
        :{x:point.x-w/2,y:point.y-h/2,w,h};
      const layer:PanoramaLayer={id:'panorama-'+crypto.randomUUID(),assetId:asset.id,
        name:displayAssetName(asset),kind,rect:clampPanoramaRect(rect,.055/count)};
      nextStyle={...nextStyle,panoramaLayers:[...(nextStyle.panoramaLayers||[]),layer]};
    }
    recordHistory(latest.post.designData||encodeCarouselDesign(latest.slides,latest.style));
    onChange({...latest.post,format:'Carousel',hook:nextSlides[0].title,
      designData:encodeCarouselDesign(nextSlides,nextStyle)});
    setDownloads([]);setOverview([]);
  };
  const addPanoramaAsset=(id:string,point:{x:number;y:number})=>{
    const asset=ownedAssets.find(a=>a.id===id);
    if(!asset)return notify('Selecciona una foto de la biblioteca de esta marca.');
    if(!images[id])loadImage(id);
    void photoAspectFromSource(images[id]).then(ratio=>{
      if(latestDraft.current.post.brandId===brand.id)addPanoramaAssets([{asset,point,ratio}]);
    });
  };
  const uploadPanoramaPhotos=async(files:File[],point:{x:number;y:number})=>{
    const uploaded:{asset:Asset;point:{x:number;y:number};ratio?:number}[]=[];
    const originBrand=brand.id;
    for(const file of files.slice(0,8)){
      if(!file.type.startsWith('image/')&&!/\.(heic|heif|jpe?g|png|webp)$/i.test(file.name)){
        notify('Selecciona una fotografía PNG, JPG, HEIC o WEBP.');continue;
      }
      try{
        const ratio=await photoAspectFromFile(file).catch(()=>.75);
        const asset=await onUploadPhoto(file);
        if(!asset){notify('No se pudo añadir '+file.name+'. Comprueba el aviso de subida.');continue;}
        uploaded.push({asset,ratio,point:{x:Math.min(.95,point.x+uploaded.length*.03),y:point.y}});
      }catch(e){notify('No se pudo añadir '+file.name+': '+(e instanceof Error?e.message:'intenta otra vez'));}
    }
    if(uploaded.length&&latestDraft.current.post.brandId===originBrand){
      addPanoramaAssets(uploaded);
      notify(uploaded.length===1?'Foto añadida. Tócala para moverla o cambiar tamaño.':uploaded.length+' fotos añadidas al carrusel.');
    }
  };
  const insert=()=>{
    if(slides.length>=8)return notify('Máximo ocho slides.');
    const next={...makeSlide(slides.length,'', ''),key:'slide-'+Date.now(),eyebrow:'',layout:'statement' as Layout,
      backgroundId:slide.backgroundId||'brand',backgroundImageId:slide.backgroundImageId||'',
      backgroundColor:slide.backgroundColor,backgroundGradient:slide.backgroundGradient};
    setAll([...slides.slice(0,-1),next,...slides.slice(-1)]);
    setCurrent(slides.length-1);
  };
  const remove=()=>{
    if(slides.length<=2)return notify('Necesitas al menos dos slides.');
    if(!window.confirm('¿Eliminar este slide?'))return;
    setAll(slides.filter((_,j)=>j!==i));setCurrent(Math.max(0,i-1));
  };
  useEffect(()=>{
    slides.forEach(s=>{if(s.assetId&&!images[s.assetId])loadImage(s.assetId);if(s.backgroundImageId&&!images[s.backgroundImageId])loadImage(s.backgroundImageId);(s.stickerIds||[]).forEach(id=>{if(!images[id])loadImage(id)});});
    if(style.referenceAssetId&&!images[style.referenceAssetId])loadImage(style.referenceAssetId);
    if(style.seamlessAssetId&&!images[style.seamlessAssetId])loadImage(style.seamlessAssetId);
    (style.panoramaLayers||[]).filter(layer=>layer.kind==='photo'||layer.kind==='sticker').forEach(layer=>{if(!images[layer.assetId])loadImage(layer.assetId)});
  },[post.designData,brand.id,style.referenceAssetId,style.seamlessAssetId]);
  useEffect(()=>{
    let active=true;
    const timer=window.setTimeout(()=>{
      const render=async()=>{
        if(style.seamlessEnabled){
          const wide=await drawSeamlessCanvas(slides,brand,images,{backgroundId:style.seamlessBackgroundId,
            assetId:style.seamlessAssetId,accent:style.accentSource==='reference'?style.referenceColor||brand.color:brand.color,
            layers:style.panoramaLayers,font:style.font,freeCanvas:style.freeCanvas,editorialRhythm:style.editorialRhythm,canvasColor:style.canvasColor,canvasGradient:style.canvasGradient});
          const page=document.createElement('canvas');
          page.width=previewPageWidth;page.height=previewPageHeight;
          const previewCtx=page.getContext('2d');
          if(previewCtx){previewCtx.imageSmoothingQuality='high';
            previewCtx.drawImage(wide,i*1080,0,1080,1350,0,0,page.width,page.height);}
          wide.width=1;return page;
        }
        const page=await drawSlide(slide,i,slides.length,brand,images,style,touchEdit);
        if(!touchEdit&&style.panoramaLayers?.length){
          const behind=style.panoramaLayers.filter(layer=>layer.placement==='behind-text');
          const front=style.panoramaLayers.filter(layer=>layer.placement!=='behind-text');
          const ctx=page.getContext('2d');if(ctx){ctx.save();ctx.translate(-i*1080,0);
            await paintPanoramaLayers(ctx,slides.length*1080,1350,behind,images);
            if(behind.length)await paintCarouselTypography(ctx,slides,brand,style);
            await paintPanoramaLayers(ctx,slides.length*1080,1350,front,images);ctx.restore();}
        }
        return page;
      };
      void render().then(c=>{
        if(active)setPreview(c.toDataURL('image/png'));
        c.width=1;
      }).catch(e=>{if(active&&!(e instanceof Error&&e.message.includes('todavía está cargando')))showError(e)});
    },120);
    return()=>{active=false;window.clearTimeout(timer);};
  },[i,slide.key,slide.eyebrow,slide.title,slide.description,slide.layout,slide.assetId,slide.photoFocus,slide.accentIndex,slide.backgroundId,slide.backgroundImageId,slide.photoPosition,slide.stickerPositions,slide.stickerIds,touchEdit,slides.length,brand.color,brand.background,brand.secondaryColor,brand.additionalColors,brand.headingFont,brand.bodyFont,style,images]);
  useEffect(()=>{
    let active=true;
    setPanoramaError('');
    if(!(style.panoramaLayers||[]).some(layer=>layer.placement==='behind-text'))setPanoramaTextPreview('');
    const render=async()=>{
      // Photo slots are removed from this base and represented as live DOM layers.
      const editable=slides.map(part=>({...part,photoPosition:part.assetId
        ?part.photoPosition||photoDefault(part.layout):part.photoPosition}));
      if(style.seamlessEnabled)return drawSeamlessCanvas(editable,brand,images,{
        backgroundId:style.seamlessBackgroundId,assetId:style.seamlessAssetId,
        accent:style.accentSource==='reference'?style.referenceColor||brand.color:brand.color,editorMode:true,font:style.font,freeCanvas:style.freeCanvas,editorialRhythm:style.editorialRhythm,canvasColor:style.canvasColor,canvasGradient:style.canvasGradient});
      const wide=document.createElement('canvas');wide.width=previewPageWidth*slides.length;wide.height=previewPageHeight;
      const ctx=wide.getContext('2d');if(!ctx)throw Error('No se pudo abrir el lienzo.');
      for(let n=0;n<editable.length;n++){
        if(!active)return wide;
        const canvas=await drawSlide(editable[n],n,slides.length,brand,images,style,true);
        ctx.imageSmoothingQuality='high';
        ctx.drawImage(canvas,n*previewPageWidth,0,previewPageWidth,previewPageHeight);canvas.width=1;
      }
      return wide;
    };
    const timer=window.setTimeout(()=>{void render().then(async wide=>{
      if(!active){wide.width=1;return;}
      const small=document.createElement('canvas');small.width=slides.length*previewPageWidth;small.height=previewPageHeight;
      small.getContext('2d')?.drawImage(wide,0,0,small.width,small.height);
      const hasBehind=(style.panoramaLayers||[]).some(layer=>layer.placement==='behind-text');
      if(hasBehind){
        const typography=document.createElement('canvas');typography.width=slides.length*1080;typography.height=1350;
        const typeCtx=typography.getContext('2d');if(!typeCtx)throw Error('No se pudo preparar el texto.');
        if(style.seamlessEnabled)await paintSeamlessTypography(typeCtx,slides,brand,style.seamlessBackgroundId,style.font,style.freeCanvas,style.canvasColor,style.editorialRhythm);
        else await paintCarouselTypography(typeCtx,slides,brand,style);
        const scaled=document.createElement('canvas');scaled.width=small.width;scaled.height=small.height;
        scaled.getContext('2d')?.drawImage(typography,0,0,scaled.width,scaled.height);
        if(active)setPanoramaTextPreview(scaled.toDataURL('image/png'));
        typography.width=1;scaled.width=1;
      }
      if(active)setPanoramaPreview(small.toDataURL('image/png'));
      wide.width=1;small.width=1;
    }).catch(e=>{if(active)setPanoramaError(e instanceof Error?e.message:'No se pudo preparar la vista previa.');});},120);
    return()=>{active=false;window.clearTimeout(timer)};
  },[post.designData,images,brand,previewRevision]);
  const makeCopy=async()=>{
    if(idea.trim().length<8)return notify('Describe un problema o una idea más específica.');
    if(!window.confirm('Usar la IA para escribir este carrusel consume 1 crédito de ideas. También puedes crearlo manualmente con el botón de 6 slides. ¿Continuar?'))return;
    setBusy('copy');
    try{
      const {data}=await api.post('/api/ideas',{brandId:brand.id,topic:idea,format:'Carousel',angle:post.angle||'Educational',platform:socialDestination});
      const updated:Post={...post,...data,format:'Carousel',brandId:brand.id,designData:''};
      const backgroundId=slide.backgroundId||style.seamlessBackgroundId||'brand';
      const backgroundImageId=slide.backgroundImageId||style.seamlessAssetId||'';
      const generated=parseSlides(updated,brand).map(item=>({...item,
        backgroundId,backgroundImageId,backgroundColor:slide.backgroundColor,
        backgroundGradient:slide.backgroundGradient}));
      onChange({...updated,designData:encodeCarouselDesign(generated,normalizeCarouselStyle({...style,editorialRhythm:true}))});
      setCurrent(0);setDownloads([]);
      setStudioTab('style');
      notify('Tu carrusel está preparado. Elige un fondo o cambia cualquier texto.');
    }catch(e){showError(e)}finally{setBusy('');}
  };
  const createImage=async()=>{
    if(imagePrompt.trim().length<15)return notify('Describe la imagen con más detalle.');
    if(imageMode==='variation'&&!sourceId)return notify('Selecciona primero una foto de referencia.');
    if(!window.confirm('Esta foto utilizará 1 crédito de IA. ¿Generar?'))return;
    setBusy('image');
    try{
      const {data}=await api.post('/api/ai-image',{
        brandId:brand.id,prompt:imagePrompt,mode:imageMode,subjectType:imageSubjectType,
        assetId:imageMode==='variation'?sourceId:'',
        referenceId:imageMode==='variation'&&style.referenceAssetId&&style.referenceAssetId!==sourceId?style.referenceAssetId:''
      });
      const {content,...asset}=data as Asset & {content:string};
      onNewAsset(asset,'data:'+data.mime+';base64,'+content);
      replace({assetId:data.id});
      notify('Nueva imagen creada; el archivo original permanece intacto.');
    }catch(e){showError(e)}finally{setBusy('');}
  };
  const exportOne=async(n=i)=>{
    setBusy('export');
    try{
      const canvas=(await renderAllSlides())[n];
      const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=filename(post,n);a.click();
      notify('Slide '+(n+1)+' descargado como PNG individual.');
    }catch(e){showError(e)}finally{setBusy('');}
  };
  const exportAll=async()=>{
    setBusy('all');
    try{
      const result:{name:string,url:string}[]=[];
      const all=await renderAllSlides();
      for(let n=0;n<all.length;n++){
        const canvas=all[n];
        result.push({name:filename(post,n),url:canvas.toDataURL('image/png')});
      }
      setDownloads(result);
      notify('Los PNG están listos para descargarlos uno por uno.');
    }catch(e){showError(e)}finally{setBusy('');}
  };
  return <div className="factory">
    <div className="factory-header">
      <div><div className="eyebrow">YOUR VISUAL PRODUCTION SPACE</div><h1>Carousel <em>Factory.</em></h1><p>De una idea a todos los slides. Cada diseño individual y listo para Instagram.</p></div>
      <button className="btn dark" onClick={onSave} disabled={saving}><Save size={16}/> {saving?'Guardando…':'Guardar carrusel'}</button>
    </div>

    <nav className="factory-studio-tabs factory-cata-nav" aria-label="Pasos para crear el carrusel">
      <div className="factory-step-rail" role="tablist" aria-label="Proceso de diseño">
        {([
          {id:'inspiration',name:'Inspírate'},
          {id:'canvas',name:'Foto'},
          {id:'style',name:'Fondo'},
          {id:'slides',name:'Texto'},
          {id:'review',name:'Revisar'},
        ] as const).map((item,n)=><button key={item.id} type="button" role="tab"
          aria-selected={studioTab===item.id} className={studioTab===item.id?'active':''}
          onClick={()=>setStudioTab(item.id)}>
            <span className="factory-step-number">{n+1}</span><span>{item.name}</span>
          </button>)}
      </div>
      <button type="button" className={'factory-ia-entry'+(studioTab==='ai'?' active':'')}
        aria-current={studioTab==='ai'?'step':undefined} onClick={()=>setStudioTab('ai')}>IA</button>
    </nav>
    <div className="factory-design-flow"><span>INSPIRACIÓN</span><span>FOTO</span><span>FONDO</span><span>TEXTO</span><span>DETALLES</span></div>
    {studioTab==='inspiration'&&<section className="factory-inspiration">
      <div className="factory-step-intro">
        <span className="factory-step-eyebrow">CREA A TU MANERA</span>
        <h2>Cuéntame qué quieres publicar.</h2>
        <p>Escribe como se lo contarías a alguien. La IA prepara los textos; después puedes poner tus fotos y fondos sin empezar de cero.</p>
      </div>
      <div className="factory-simple-ai">
        <label htmlFor="factory-ai-brief">Tu idea</label>
        <textarea id="factory-ai-brief" rows={3} value={idea} onChange={e=>setIdea(e.target.value)}
          placeholder="Quiero un carrusel para explicar por qué se pierden clientes cuando no doy seguimiento. Que suene natural y tenga un buen cierre."/>
        <button type="button" className="btn dark" disabled={!!busy} onClick={makeCopy}>
          {busy==='copy'?<LoaderCircle className="spin" size={16}/>:<WandSparkles size={16}/>}
          Crear carrusel con IA · 1 crédito
        </button>
        <small>La IA propone los textos. Puedes cambiar cada frase, foto o fondo antes de guardar.</small>
      </div>
      <details className="factory-reference-fold"><summary>Tengo una foto de referencia</summary>
            <div className="factory-reference">
        <div className="factory-reference-copy"><strong>¿Te dieron una referencia visual?</strong><p>Úsala como inspiración de paleta y contraste, sin copiar su fotografía ni sus textos. El análisis de color es gratuito.</p></div>
        <div className="factory-reference-actions">
          <select aria-label="Referencia de estilo" value={style.referenceAssetId} onChange={e=>{setArtStyle({referenceAssetId:e.target.value});setReferenceReport('')}}>
            <option value="">Sin referencia de estilo</option>{ownedAssets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button type="button" className="btn ghost" onClick={uploadImage}><Upload size={15}/> Subir referencia</button>
          <button type="button" className="btn dark" onClick={applyReference} disabled={!style.referenceAssetId||!images[style.referenceAssetId]}>Tomar colores</button>
        </div>
        {style.referenceAssetId&&images[style.referenceAssetId]&&<img className="factory-reference-thumb" src={images[style.referenceAssetId]} alt="Referencia usada solo como inspiración"/>}
      </div>

      {referenceReport&&<p className="factory-reference-report" role="status">{referenceReport}</p>}
      <div className="factory-inspiration-hint"><strong>Tu punto de partida</strong>
        <p>Una imagen principal · dos o tres colores · un mensaje que se entienda de un vistazo.</p>
      </div>
      </details>
      <div className="factory-step-footer"><span>También puedes diseñar sin IA, desde un lienzo vacío.</span>
        <button type="button" className="btn dark" onClick={()=>setStudioTab('canvas')}>Siguiente: foto <ArrowRight size={16}/></button>
      </div>
    </section>}
    {studioTab==='canvas'&&<>

      <div className="factory-step-intro">
        <span className="factory-step-eyebrow">PASO 2 DE 5 · FOTO PROTAGONISTA</span>
        <h2>Empieza por la foto. El diseño viene después.</h2>
        <p>Sube o arrastra la imagen principal. Colócala donde quieras; los cortes se ven, pero se hacen al descargar.</p>
        <div className="factory-step-mini-actions">
          <button type="button" className="btn ghost factory-free-create" onClick={()=>{
            if(slides.some(part=>part.title||part.description||part.assetId)||(style.panoramaLayers||[]).length){
              if(!window.confirm('¿Crear un carrusel vacío nuevo? Se reemplazará el diseño actual.'))return;
            }
            const next=Array.from({length:6},(_,n)=>({...makeSlide(n,''),layout:(['cover','statement','photo','steps','split','closing'] as Layout[])[n],eyebrow:'',description:'',assetId:'',stickerIds:[],stickerPositions:{},
              backgroundId:slide.backgroundId||'brand',backgroundImageId:slide.backgroundImageId||''}));
            setAll(next,normalizeCarouselStyle({...style,editorialRhythm:true}));setCurrent(0);notify('Nuevo carrusel de 6 slides preparado.');
          }}><Plus size={16}/> Nuevo carrusel</button>
        </div>
      </div>
      <PanoramaEditor preview={panoramaPreview} textOverlay={panoramaTextPreview} count={slides.length} seamless={style.seamlessEnabled}
      onUpdate={updatePanoramaLayer} onAddLayer={addCanvasLayer}
      onUndo={()=>restoreHistory('undo')} onRedo={()=>restoreHistory('redo')}
      canUndo={historyVersion>=0&&pastHistory.current.length>0}
      canRedo={historyVersion>=0&&futureHistory.current.length>0}
      layers={panoramaLayers} assets={ownedAssets} images={images} loadImage={loadImage}
      onCommit={movePanoramaLayer} onAdd={addPanoramaAsset} onRemove={removePanoramaLayer}
      onReorder={reorderPanoramaLayer}
       textElements={panoramaTextElements} onRemoveText={removePanoramaText}
      onUpload={uploadPanoramaPhotos} error={panoramaError} onRetry={()=>setPreviewRevision(v=>v+1)}/>

      <div className="factory-step-footer"><span>La foto debe ser la protagonista, no quedar perdida entre elementos.</span><button type="button" className="btn dark" onClick={()=>setStudioTab('style')}>Siguiente: fondo <ArrowRight size={16}/></button></div>
    </>}
    {studioTab==='style'&&<>
          <section className="factory-style-panel" aria-label="Estilo maestro del carrusel">
      <div className="factory-style-title"><div><span className="factory-step-eyebrow">PASO 3 DE 5 · FONDO</span><h2>Elige el fondo que acompañe a tu foto.</h2><p>Usa dos o tres colores que combinen. Blanco, un degradado o cualquiera de los fondos guardados.</p></div><span className="factory-style-lock"><Check size={15}/> Lienzo editable</span></div>
      <div className="factory-canvas-colors">
        <label>Color del fondo <input type="color" aria-label="Color del fondo del carrusel" value={style.canvasColor}
          onChange={e=>setAll(slides.map(part=>({...part,backgroundId:'brand',backgroundImageId:''})),
            {...style,canvasColor:e.target.value,seamlessBackgroundId:'brand',seamlessAssetId:''})}/></label>
        <label><input type="checkbox" checked={!!style.canvasGradient}
          onChange={e=>setAll(slides.map(part=>({...part,backgroundId:'brand',backgroundImageId:''})),
            {...style,canvasGradient:e.target.checked?'#F3DBD5':'',seamlessBackgroundId:'brand',seamlessAssetId:''})}/>
          Fondo degradado</label>
        {style.canvasGradient&&<label>Segundo color <input type="color" aria-label="Segundo color del degradado"
          value={style.canvasGradient} onChange={e=>setAll(slides.map(part=>({...part,backgroundId:'brand',backgroundImageId:''})),
            {...style,canvasGradient:e.target.value,seamlessBackgroundId:'brand',seamlessAssetId:''})}/></label>}
        <button type="button" onClick={()=>setAll(slides.map(part=>({...part,backgroundId:'brand',backgroundImageId:''})),
            {...style,canvasColor:'#FFFFFF',canvasGradient:'',seamlessBackgroundId:'brand',seamlessAssetId:''})}>Fondo blanco</button>
      </div>
      <div className="factory-background-main">
        <div className="factory-background-main-head">
          <strong>Fondo de todo el carrusel</strong>
          <p>Elige uno de los fondos incluidos, uno del estudio o uno tuyo. Se aplicará a todas las diapositivas y también al PNG.</p>
        </div>
        <FreeDecorControls title="Elegir fondo" defaultTab="backgrounds" initiallyExpanded
          backgroundId={slide.backgroundId||'brand'}
          backgroundImageId={slide.backgroundImageId||''}
          stickerIds={slide.stickerIds||[]} onChange={updateDecoration}
          assets={ownedAssets} images={images} loadImage={loadImage}
          onOpenLibrary={onOpenStickers} onUploadBackground={onUploadBackground}/>
        <button type="button" className="btn ghost factory-background-apply" onClick={backgroundOfAll}>
          Aplicar el fondo actual a todos los slides
        </button>
      </div>
      <div className="factory-style-controls">
        <label>Dirección visual<select aria-label="Dirección visual del carrusel" value={style.mood} onChange={e=>setArtStyle({mood:e.target.value as CarouselStyle['mood']})}>
          <option value="editorial">Editorial limpio</option><option value="soft">Soft · fondos cálidos</option><option value="bold">Bold · contraste moderno</option><option value="dark">Dark · premium oscuro</option>
        </select></label>
        <label>Paleta<select aria-label="Paleta del carrusel" value={style.accentSource} onChange={e=>setArtStyle({accentSource:e.target.value as CarouselStyle['accentSource']})}>
          <option value="brand">Colores de mi marca</option><option value="reference" disabled={!style.referenceColor}>Colores de la referencia</option>
        </select></label>
      </div>
      <div className="factory-style-footer">
        <div className="factory-style-swatches">{palette.map((c,n)=><span key={n} title={c} style={{background:c}}/>)}<span title="Fondo" style={{background:brand.background}}/><small>Paleta guardada · usa otros tonos por slide cuando quieras</small></div>

      </div>
      {referenceReport&&<p className="factory-reference-report" role="status">{referenceReport}</p>}
    </section>

          <section className="seamless-config">
      <div className="seamless-header"><div><span className="eyebrow">SEAMLESS CAROUSEL</span><h2>Un lienzo continuo, dividido en slides.</h2><p>El fondo empieza blanco y no contiene líneas ni formas añadidas automáticamente. Solo tú decides qué elementos colocar.</p></div><label className="seamless-toggle"><input type="checkbox" checked={style.seamlessEnabled} onChange={e=>setArtStyle({seamlessEnabled:e.target.checked})}/><span>{style.seamlessEnabled?'Activado':'Activar seamless'}</span></label></div>
      {style.seamlessEnabled&&<div className="seamless-controls"><label>Background continuo<select value={style.seamlessBackgroundId} onChange={e=>setArtStyle({seamlessBackgroundId:e.target.value as FreeBackgroundId})}>{([
 {title:'✂️ Scrapbook',items:FREE_BACKGROUNDS.filter(b=>isBackgroundVisible(b.id)&&isScrapbookBackground(b.id))},
 {title:'🎀 Coquette & bows',items:FREE_BACKGROUNDS.filter(b=>isBackgroundVisible(b.id)&&isBowBackground(b.id))},
 {title:'🌈 Gradientes',items:FREE_BACKGROUNDS.filter(b=>isBackgroundVisible(b.id)&&['soft-gradient','sunset-peach','lavender-haze'].includes(b.id))},
 {title:'📷 Retro & papel',items:FREE_BACKGROUNDS.filter(b=>isBackgroundVisible(b.id)&&['rust-autumn','terracotta-check','vintage-paper','journal-tape','coffee-check'].includes(b.id))},
 {title:'🌙 Oscuros',items:FREE_BACKGROUNDS.filter(b=>isBackgroundVisible(b.id)&&['night-editorial','night-stars'].includes(b.id))},
 {title:'✦ Minimal & editorial',items:FREE_BACKGROUNDS.filter(b=>isBackgroundVisible(b.id)&&!isScrapbookBackground(b.id)&&!isBowBackground(b.id)&&!['soft-gradient','sunset-peach','lavender-haze','rust-autumn','terracotta-check','vintage-paper','journal-tape','coffee-check','night-editorial','night-stars'].includes(b.id))}
 ]).map(group=><optgroup key={group.title} label={group.title}>{group.items.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</optgroup>)}</select></label>
        <label>Fotografía panorámica opcional<select value={style.seamlessAssetId} onChange={e=>setArtStyle({seamlessAssetId:e.target.value})}><option value="">Sin foto · diseño gráfico</option>{ownedAssets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <p>Los textos se mantienen dentro de cada slide. Las formas y el fondo cruzan los cortes para que al deslizar se vea un solo diseño continuo.</p>
      </div>}
    </section>

      <details className="factory-style-advanced"><summary>Personalizar un slide o añadir stickers</summary>
                  {!style.seamlessEnabled&&<details className="factory-slide-colors"><summary>Color o degradado de este slide (opcional)</summary>
            <div><label>Color <input type="color" value={slide.backgroundColor||style.canvasColor}
              onChange={e=>replace({backgroundId:'brand',backgroundImageId:'',backgroundColor:e.target.value})}/></label>
              <label>Degradado <input type="checkbox" checked={!!slide.backgroundGradient}
                onChange={e=>replace({backgroundId:'brand',backgroundImageId:'',
                  backgroundGradient:e.target.checked?'#EAD9F0':undefined})}/></label>
              {slide.backgroundGradient&&<label>Segundo color <input type="color" value={slide.backgroundGradient}
                onChange={e=>replace({backgroundId:'brand',backgroundImageId:'',backgroundGradient:e.target.value})}/></label>}
              <button type="button" onClick={()=>replace({backgroundId:'brand',backgroundImageId:'',
                backgroundColor:undefined,backgroundGradient:undefined})}>Volver al fondo general</button>
            </div>
          </details>}

          <FreeDecorControls title="Añadir stickers" backgroundId={slide.backgroundId||'brand'} backgroundImageId={slide.backgroundImageId||''}
            stickerIds={slide.stickerIds||[]} onChange={updateDecoration} assets={ownedAssets}
            images={images} loadImage={loadImage} onOpenLibrary={onOpenStickers}
            onUploadBackground={onUploadBackground}/>
      </details>
      <div className="factory-step-footer"><span>El fondo acompaña a la foto, no le roba protagonismo.</span>
        <button type="button" className="btn dark" onClick={()=>setStudioTab('slides')}>Siguiente: textos <ArrowRight size={16}/></button></div>
    </>}
    {studioTab==='slides'&&<>
          <div className="factory-work">
      <div className="factory-edit">
        <div className="factory-step-intro"><span className="factory-step-eyebrow">PASO 4 DE 5 · TEXTOS</span>
          <h2>Una idea clara por slide.</h2><p>Empieza por un título que se entienda al instante. Después añade solo el texto que hace falta.</p></div>
      <details className="factory-type-gallery factory-typography-more">
        <summary>Ver las tipografías antes de elegir · {CAROUSEL_FONTS.length} estilos</summary>
        <div className="factory-type-options">{CAROUSEL_FONTS.map(font=><button key={font.id}
          type="button" aria-pressed={style.font===font.id}
          className={style.font===font.id?'selected':''}
          onClick={()=>setArtStyle({font:font.id})}>
          <span style={{fontFamily:carouselFontFamily(font.id,brand.headingFont)}}>Your story.</span>
          <small>{font.label}</small>
        </button>)}</div>
      </details>

        <div className="factory-rhythm-controls">
          <div><strong>Ritmo visual editorial</strong><p>Alterna fotografía protagonista, titulares grandes y composiciones mixtas. No agrega textos ni fotos inventadas.</p></div>
          <button type="button" className="btn dark" onClick={applyRhythm}>✨ Crear variedad editorial</button>
          {style.editorialRhythm&&<button type="button" className="btn ghost" onClick={()=>setArtStyle({editorialRhythm:false})}>Volver a posiciones originales</button>}
        </div>
        <div className="factory-section"><strong>Texto por slide</strong><span>{slides.length} slides · Editables</span></div>
        <div className="factory-slide-strip">
          {slides.map((s,n)=><button key={s.key} className={'factory-thumbnail '+(n===i?'selected':'')} onClick={()=>setCurrent(n)}><small>{String(n+1).padStart(2,'0')}</small><strong>{s.title||'New slide'}</strong><span>Lienzo libre · editable</span></button>)}
          {slides.length<8&&<button className="factory-add" onClick={insert}><Plus size={20}/> Add slide</button>}
        </div>
        <div className="factory-panel">
                  <label>Tipografía principal<select aria-label="Tipografía del carrusel" value={style.font} onChange={e=>setArtStyle({font:e.target.value as CarouselStyle['font']})}>
          {CAROUSEL_FONTS.map(font=><option key={font.id} value={font.id}>{font.label} · {font.category}</option>)}
        </select></label>

          <div className="factory-panel-title"><div><div className="eyebrow">SLIDE {i+1} / {slides.length}</div><h3>Escribe el mensaje de este slide</h3></div><button className="factory-delete" onClick={remove} title="Eliminar slide"><Trash2 size={17}/></button></div>
          <p className="factory-blank-hint">Lienzo libre: textos, fotos y elementos editables en el editor superior.</p>
          <label>Composición de este slide
            <select aria-label="Composición de este slide" value={slide.layout} onChange={e=>setAll(slides.map((part,n)=>n===i?{...part,layout:e.target.value as Layout}:part),normalizeCarouselStyle({...style,editorialRhythm:true}))}>
              <option value="statement">Tipográfico · titular protagonista</option>
              <option value="cover">Editorial · foto y titular</option>
              <option value="photo">Fotográfico · imagen protagonista</option>
              <option value="split">Mixto · foto a un lado y texto al otro</option>
              <option value="steps">Educativo · título y puntos clave</option>
              <option value="closing">Cierre · mensaje final</option>
            </select>
          </label>
          {style.editorialRhythm&&<p className="factory-rhythm-note">El diseño se aplica al PNG, a la vista panorámica y a cada slide. Si has movido una foto a mano, conservamos su posición.</p>}
          <label>Etiqueta</label><input value={slide.eyebrow} maxLength={80} onChange={e=>replace({eyebrow:e.target.value})}/>
          <label>Título principal</label><textarea rows={3} value={slide.title} maxLength={420} onChange={e=>replace({title:e.target.value})}/>
          <div className="factory-title-font"><label htmlFor="slide-font-choice">Tipografía del título de este slide</label>
            <select id="slide-font-choice" aria-label="Tipografía del título de este slide"
              value={slide.titleFont||'inherit'} onChange={e=>replace({titleFont:e.target.value==='inherit'?undefined:e.target.value as CarouselFont})}>
              <option value="inherit">Igual que el estilo maestro</option>
              {CAROUSEL_FONTS.filter(font=>font.id!=='brand').map(font=><option key={font.id} value={font.id}>{font.label}</option>)}
            </select>
            <span className="factory-title-font-example" style={{fontFamily:carouselFontFamily(slide.titleFont||style.font,brand.headingFont)}}>{slide.title.slice(0,64)||'Your story starts here.'}</span>
          </div>
          <label>Texto de apoyo</label><textarea rows={3} value={slide.description} maxLength={1000} onChange={e=>replace({description:e.target.value})} placeholder="Add a short explanation or 3 lines of practical advice."/>
           <label>Acento de este slide (opcional)</label><select aria-label="Color de marca de este slide" value={slide.accentIndex||0} onChange={e=>replace({accentIndex:Number(e.target.value)})}>
             <option value={0}>Color maestro · {style.accentSource==='reference'?'referencia':palette[0]}</option>
             {palette.slice(1).map((c,index)=><option key={c} value={index+1}>{index===0?'Secundario':'Extra '+index} · {c}</option>)}
           </select>
          <details className="factory-typography-more"><summary>Foto y detalles de este slide</summary>
           <details className="factory-optional-frames"><summary>Marcos fotográficos opcionales</summary>
             <p className="factory-frame-explain">Estas fotos son de demostración, no se añaden a tus posts. Los marcos son opcionales y no aparecen hasta que los elijas.</p>
             <div className="factory-frame-modes" role="group" aria-label="Estilos de marcos">{photoFrames.map((f,n)=><button key={f.id} type="button" aria-pressed={(slide.frameStyle||'none')===f.id} className={(slide.frameStyle||'none')===f.id?'selected':''} onClick={()=>replace({frameStyle:f.id})}><span className={'factory-frame-mini '+f.id}><img loading="lazy" src={sampleHomes[n%sampleHomes.length]} alt="" draggable={false}/></span><small>{f.name}</small></button>)}</div>
           </details>
           <label>Encuadre de la fotografía</label><select aria-label="Encuadre de foto" value={slide.photoFocus||'center'} onChange={e=>replace({photoFocus:e.target.value as Slide['photoFocus']})}>
             <option value="top">Rostro arriba · evitar recortes</option><option value="center">Centro</option><option value="bottom">Parte inferior</option>
           </select>
          <div className="factory-labelrow"><label>Real photo / screenshot</label><button className="btn ghost" onClick={uploadImage}><Upload size={16}/> Upload</button></div>
          <select value={slide.assetId} onChange={e=>replace({assetId:e.target.value})}><option value="">Sin foto · solo gráfico</option>{ownedAssets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>

          </details>
          <div className="factory-pagination"><button className="btn ghost" onClick={()=>setCurrent(v=>Math.max(0,v-1))} disabled={i===0}><ArrowLeft size={15}/> Previous</button><button className="btn dark" onClick={()=>setCurrent(v=>Math.min(slides.length-1,v+1))} disabled={i===slides.length-1}>Next slide <ArrowRight size={15}/></button></div>
        </div>

      </div>
      <aside className="factory-right">
        <div className="factory-section"><strong>Live design preview</strong><span>4:5 · 1080 × 1350</span></div>
         <button type="button" className={'factory-touch-toggle'+(touchEdit?' active':'')} aria-pressed={touchEdit} onClick={()=>{
           if(style.seamlessEnabled||style.panoramaLayers?.length){document.querySelector('.panorama-editor')?.scrollIntoView({behavior:'smooth',block:'start'});setTouchEdit(false)}else enableTouch();
         }}>{style.seamlessEnabled||style.panoramaLayers?.length?'Editar en el lienzo panorámico':touchEdit?'✓ Finalizar edición con dedos':'👆 Editar con dedos · mover fotos y stickers'}</button>
        {touchEdit?<TouchLayerCanvas key={slide.key} preview={preview} layers={touchLayers} onCommit={moveTouchLayer}/>:
        <div className="factory-preview" aria-label="Vista previa. Desliza horizontalmente para cambiar slide."
         onTouchStart={e=>{if(e.touches.length===1)swipeStart.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}}
         onTouchEnd={e=>{const start=swipeStart.current;swipeStart.current=null;if(!start||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)setCurrent(v=>Math.max(0,Math.min(slides.length-1,v+(dx<0?1:-1))))}}>
         {preview?<img src={preview} alt={'Diseño del slide '+(i+1)}/>:<LoaderCircle className="spin"/>}</div>}
        <div className="factory-previewnav"><button onClick={()=>setCurrent(v=>Math.max(0,v-1))} disabled={i===0}><ArrowLeft size={17}/> Prev</button><strong>{i+1} of {slides.length}</strong><button onClick={()=>setCurrent(v=>Math.min(slides.length-1,v+1))} disabled={i===slides.length-1}>Next <ArrowRight size={17}/></button></div>

        <div className="factory-step-mini-actions">
          <button type="button" className="btn ghost wide" onClick={()=>setStudioTab('canvas')}>Mover elementos en el lienzo</button>
        </div>
      </aside>
    </div>

      <div className="factory-step-footer"><span>Revisa el gancho, la secuencia y el cierre antes de descargar.</span><button type="button" className="btn dark" onClick={()=>setStudioTab('review')}>Siguiente: revisar <ArrowRight size={16}/></button></div>
    </>}
    {studioTab==='review'&&<section className="factory-review">
      <div className="factory-step-intro"><span className="factory-step-eyebrow">PASO 5 DE 5 · DETALLES</span>
        <h2>Comprueba el resultado antes de compartirlo.</h2>
        <p>Revisa la portada, el ritmo entre slides, la legibilidad y el último mensaje. Después descarga los PNG.</p>
      </div>
      <div className="factory-review-layout">
        <div className="factory-review-check">
          <strong>Revisión final</strong>
          <ul>
            <li><Check size={15}/> La primera portada se entiende en segundos</li>
            <li><Check size={15}/> El texto no queda cortado entre slides</li>
            <li><Check size={15}/> Hay una acción clara al final</li>
          </ul>
          <p>Revisa también las fotografías y los nombres antes de publicar.</p>
          {warnings.length>0&&<div className="factory-quality"><strong>Revisar</strong>
            {warnings.map((note,n)=><small key={n}>{note}</small>)}</div>}
        </div>
              <div className="factory-destination">
        <label>¿Dónde vas a publicar este carrusel?
          <select value={style.targetPlatform} onChange={e=>setArtStyle({targetPlatform:e.target.value as CarouselStyle['targetPlatform']})}>
            <option value="brand">Mi red principal ({platformName(preferredPlatform(brand))})</option>
            {SOCIAL_PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
        <p><strong>{socialLabel}</strong> · {destinationAccount||'Cuenta aún no configurada'} · Descargas manuales, sin publicación automática.</p>
      </div>

      </div>
            <div className="factory-canvas-exports">
        <div><strong>Tu carrusel · {slides.length} slides</strong><span>PNG individuales de 1080 × 1350. Sin líneas de edición.</span></div>
        <button type="button" className="btn ghost" onClick={previewAll} disabled={!!busy||overviewBusy}>Previsualizar slides</button>
        <button type="button" className="btn dark" onClick={exportAll} disabled={!!busy}>Preparar PNG</button>
      </div>
      {overview.length>0&&<div className="factory-overview-grid factory-canvas-overview">
        {overview.map((src,n)=><button type="button" key={n} onClick={()=>{setCurrent(n);setStudioTab('slides')}}><img src={src} alt={'Slide '+(n+1)}/><span>{n+1}/{slides.length}</span></button>)}
      </div>}
      {downloads.length>0&&<div className="factory-exports factory-canvas-download-list">
        <strong><Check size={15}/> {downloads.length} PNG listos</strong>
        <p>Descárgalos individualmente, sin ZIP.</p>
        {downloads.map((item,n)=><a key={item.name} href={item.url} download={item.name}><Download size={15}/> Slide {n+1}.png</a>)}
      </div>}

      <div className="factory-step-footer">
        <button type="button" className="btn ghost" onClick={()=>setStudioTab('slides')}>Volver a textos</button>
        <button type="button" className="btn dark" onClick={onSave} disabled={saving}><Save size={16}/> {saving?'Guardando…':'Guardar carrusel'}</button>
      </div>
    </section>}
    {studioTab==='ai'&&<section className="factory-assistant-zone">
      <div className="factory-assistant-head"><span className="eyebrow">HERRAMIENTAS IA</span>
        <h2>IA</h2>
        <p>Crea textos o imágenes con IA. Cada acción indica los créditos antes de generar; editar y descargar el carrusel no consume créditos.</p>
      </div>
      <div className="factory-idea factory-assistant-copy">
        <div><div className="eyebrow">CREAR TEXTOS</div><h3>Escribe un carrusel a partir de tu idea.</h3><p>Describe tu tema y genera una propuesta de carrusel. Después podrás editarlo en Textos.</p></div>
        <div><textarea rows={3} value={idea} onChange={e=>setIdea(e.target.value)}
          placeholder="Describe el tema o problema sobre el que quieres publicar..."/>
          <button type="button" className="btn dark" onClick={makeCopy} disabled={!!busy}>
            {busy==='copy'?<LoaderCircle className="spin" size={16}/>:<WandSparkles size={16}/>}
            Generar texto · 1 crédito</button></div>
      </div>
              <div className="factory-panel factory-ai">
          <div className="factory-panel-title"><div><div className="eyebrow">CREAR IMÁGENES</div><h3><Sparkles size={18}/> Imágenes con IA</h3></div></div>
          <p>Crea imágenes nuevas para una publicación o variaciones creativas de una fotografía. No modifica el original.</p>
          <div className="factory-mode"><button className={imageMode==='new'?'selected':''} onClick={()=>setImageMode('new')}>Imagen nueva</button><button className={imageMode==='variation'?'selected':''} onClick={()=>setImageMode('variation')}>Variación de foto</button></div>
          <label>¿Qué estás fotografiando?</label><div className="factory-mode">
             <button type="button" className={imageSubjectType==='portrait'?'selected':''} onClick={()=>setImageSubjectType('portrait')}>Persona / retrato</button>
             <button type="button" className={imageSubjectType==='product'?'selected':''} onClick={()=>setImageSubjectType('product')}>Producto / objeto</button>
           </div>
           {imageMode==='variation'&&<><label>Foto original · sujeto principal</label><select value={sourceId} onChange={e=>setSourceId(e.target.value)}><option value="">Selecciona foto original…</option>{ownedAssets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
             {style.referenceAssetId&&<small>La segunda referencia guía solamente el estilo. Tu foto original mantiene el papel de sujeto principal.</small>}
           </>}
          <label>Descripción de la imagen</label><textarea rows={3} value={imagePrompt} onChange={e=>setImagePrompt(e.target.value)} placeholder="Editorial photo of cookies on a blue table, beautiful morning light, no text or logos…"/>
          <button className="btn dark wide" onClick={createImage} disabled={!!busy}>{busy==='image'?<LoaderCircle className="spin" size={16}/>:<WandSparkles size={16}/>} Generar foto · 1 crédito IA</button>
          <small>Las generaciones pueden consumir créditos. No uses variaciones IA de screenshots de la App ni de fotos donde necesites fidelidad exacta de rostros o detalles.</small>
        </div>
      <button type="button" className="btn ghost" onClick={()=>setStudioTab('canvas')}>Volver al lienzo</button>
    </section>}
  </div>;
}

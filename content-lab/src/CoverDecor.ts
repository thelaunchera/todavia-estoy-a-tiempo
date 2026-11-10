import type {FreeBackgroundId} from './FreeDesignAssets';
import {normalizedPositions,type StickerPositions} from './TouchGeometry';
import {normalizePanoramaLayers,type PanoramaLayer} from './PanoramaLayers';
export type CoverDecor={
 backgroundId:FreeBackgroundId;backgroundImageId:string;stickerIds:string[];
 stickerPositions:StickerPositions;
 layers:PanoramaLayer[];headlineRect?:PanoramaLayer['rect'];primaryPhotoRect?:PanoramaLayer['rect'];
 layerOrder?:string[];primaryPhotoOpacity?:number;primaryPhotoTintColor?:string;primaryPhotoTintStrength?:number;stickerOpacities?:Record<string,number>;stickerTints?:Record<string,string>;
 headlineStyle?:{font?:string;fontSize?:number,fontWeight?:number,color?:string,shadow?:boolean,outline?:boolean,lineHeight?:number,spacing?:number,opacity?:number};
 color:string;gradient:string;headlineLocked?:boolean;primaryPhotoLocked?:boolean;lockedStickerIds?:string[];
};
export const blankCoverDecor=():CoverDecor=>({backgroundId:'brand',backgroundImageId:'',
 stickerIds:[],stickerPositions:{},layers:[],color:'#FFFFFF',gradient:''});
export function readCoverDecor(data?:string):CoverDecor{
 try{
  const envelope=JSON.parse(data||'{}'),p=envelope&&typeof envelope==='object'?envelope.coverDecor:null;
  if(!p||typeof p!=='object')return blankCoverDecor();
  const hex=(v:unknown,fallback:string)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v:fallback;
  return {
   backgroundId:typeof p.backgroundId==='string'?p.backgroundId:'brand',
   backgroundImageId:typeof p.backgroundImageId==='string'?p.backgroundImageId:'',
   stickerIds:Array.isArray(p.stickerIds)?p.stickerIds.filter((id:unknown)=>typeof id==='string').slice(0,3):[],
   stickerPositions:normalizedPositions(p.stickerPositions),
   layers:normalizePanoramaLayers(p.layers),
   layerOrder:Array.isArray(p.layerOrder)?[...new Set((p.layerOrder as unknown[]).filter((id):id is string=>typeof id==='string'&&id.length<180))].slice(0,32):undefined,
   primaryPhotoOpacity:typeof p.primaryPhotoOpacity==='number'&&Number.isFinite(p.primaryPhotoOpacity)
     ?Math.max(0,Math.min(1,p.primaryPhotoOpacity)):undefined,
   primaryPhotoTintColor:/^#[0-9a-f]{6}$/i.test(String(p.primaryPhotoTintColor))?String(p.primaryPhotoTintColor):undefined,
   primaryPhotoTintStrength:typeof p.primaryPhotoTintStrength==='number'&&Number.isFinite(p.primaryPhotoTintStrength)
     ?Math.max(0,Math.min(1,p.primaryPhotoTintStrength)):undefined,
   stickerOpacities:p.stickerOpacities&&typeof p.stickerOpacities==='object'
     ?Object.fromEntries(Object.entries(p.stickerOpacities as Record<string,unknown>).filter(
       ([id,value])=>id.length<150&&typeof value==='number'&&Number.isFinite(value)).slice(0,24)
       .map(([id,value])=>[id,Math.max(0,Math.min(1,value as number))])):undefined,
   stickerTints:p.stickerTints&&typeof p.stickerTints==='object'
     ?Object.fromEntries(Object.entries(p.stickerTints as Record<string,unknown>)
       .filter(([id,value])=>id.length<150&&typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)).slice(0,24).map(([id,value])=>[id,String(value)])):undefined,
   headlineRect:p.headlineRect&&typeof p.headlineRect==='object'?p.headlineRect:undefined,
   primaryPhotoRect:p.primaryPhotoRect&&typeof p.primaryPhotoRect==='object'?p.primaryPhotoRect:undefined,
   headlineStyle:p.headlineStyle&&typeof p.headlineStyle==='object'?{
    font:String(p.headlineStyle.font||'serif'),fontSize:Number(p.headlineStyle.fontSize)||82,
    fontWeight:[400,500,600,700,800,900].includes(Number(p.headlineStyle.fontWeight))?Number(p.headlineStyle.fontWeight):700,
    color:hex(p.headlineStyle.color,'#191919'),shadow:p.headlineStyle.shadow===true,
    outline:p.headlineStyle.outline===true,
    lineHeight:Number(p.headlineStyle.lineHeight)||1.12,spacing:Number(p.headlineStyle.spacing)||0,
    opacity:typeof p.headlineStyle.opacity==='number'&&Number.isFinite(p.headlineStyle.opacity)
      ?Math.max(0,Math.min(1,p.headlineStyle.opacity)):undefined,
   }:undefined,
   color:hex(p.color,'#FFFFFF'),gradient:hex(p.gradient,''),
   headlineLocked:p.headlineLocked===true,primaryPhotoLocked:p.primaryPhotoLocked===true,
   lockedStickerIds:Array.isArray(p.lockedStickerIds)?p.lockedStickerIds.filter((id:unknown)=>typeof id==='string').slice(0,3):[],
  };
 }catch{return blankCoverDecor()}
}
export function writeCoverDecor(data:string|undefined,decor:CoverDecor):string{
 let envelope:Record<string,unknown>={};
 try{const parsed=JSON.parse(data||'{}');if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))envelope=parsed}catch{}
 return JSON.stringify({...envelope,coverDecor:decor});
}

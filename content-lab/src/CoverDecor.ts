import type {FreeBackgroundId} from './FreeDesignAssets';
import {normalizedPositions,type StickerPositions} from './TouchGeometry';
export type CoverDecor={backgroundId:FreeBackgroundId;backgroundImageId:string;stickerIds:string[];stickerPositions:StickerPositions};
export const blankCoverDecor=():CoverDecor=>({backgroundId:'brand',backgroundImageId:'',stickerIds:[],stickerPositions:{}});
export function readCoverDecor(data?:string):CoverDecor{
 try{
  const envelope=JSON.parse(data||'{}'),p=envelope&&typeof envelope==='object'?envelope.coverDecor:null;
  if(!p||typeof p!=='object')return blankCoverDecor();
  return {backgroundId:typeof p.backgroundId==='string'?p.backgroundId:'brand',
   backgroundImageId:typeof p.backgroundImageId==='string'?p.backgroundImageId:'',
   stickerIds:Array.isArray(p.stickerIds)?p.stickerIds.filter((id:unknown)=>typeof id==='string').slice(0,3):[],
   stickerPositions:normalizedPositions(p.stickerPositions)};
 }catch{return blankCoverDecor()}
}
export function writeCoverDecor(data:string|undefined,decor:CoverDecor):string{
 let envelope:Record<string,unknown>={};
 try{const parsed=JSON.parse(data||'{}');if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))envelope=parsed}catch{}
 return JSON.stringify({...envelope,coverDecor:decor});
}

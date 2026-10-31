import React,{useState} from 'react';
import {FREE_BACKGROUNDS,type FreeBackgroundId} from './FreeDesignAssets';
import {assetCategory,displayAssetName,type LibraryAsset} from './MediaAsset';
import './FreeDecorControls.css';
type Props={
 backgroundId?:FreeBackgroundId;stickerIds?:string[];
 onChange:(next:{backgroundId?:FreeBackgroundId;stickerIds?:string[]})=>void;
 title?:string;assets?:LibraryAsset[];images?:Record<string,string>;loadImage?:(id:string)=>void;
 onOpenLibrary?:()=>void
};
export default function FreeDecorControls({backgroundId='brand',stickerIds=[],onChange,title='Stickers & Backgrounds',assets=[],images={},loadImage,onOpenLibrary}:Props){
 const [tab,setTab]=useState<'stickers'|'backgrounds'>('stickers');
 const [group,setGroup]=useState('Todos');
 const originals=assets.filter(a=>assetCategory(a)==='sticker');
 const selected=stickerIds.filter(id=>originals.some(a=>a.id===id)).slice(0,3);
 const groupFor=(name:string)=>/avatar/i.test(name)?'Avatares':/matcha|coffee|tea|cup/i.test(name)?'Matcha':/pilates|reformer|barre|yoga|stretch/i.test(name)?'Pilates':/squat|fitness|gym|dumbbell|workout|exercise|lunge|treadmill|plank/i.test(name)?'Fitness':'Aesthetic';
 const visible=originals.filter(a=>group==='Todos'||groupFor(a.name)===group);
 const toggle=(id:string)=>{
  if(!images[id])loadImage?.(id);
  onChange({backgroundId,stickerIds:selected.includes(id)?selected.filter(x=>x!==id):[...selected,id].slice(-3)})
 };
 return <section className="free-decor-controls" aria-label="Decoración gratis">
  <div className="free-decor-header"><div><strong>✦ {title}</strong><p>Decora con PNG originales y fondos gratuitos. Sin créditos IA.</p></div><span>FREE</span></div>
  <div className="free-decor-main-tabs"><button type="button" aria-pressed={tab==='stickers'} className={tab==='stickers'?'active':''} onClick={()=>setTab('stickers')}>🎀 Stickers PNG</button><button type="button" aria-pressed={tab==='backgrounds'} className={tab==='backgrounds'?'active':''} onClick={()=>setTab('backgrounds')}>🎨 Backgrounds</button></div>
  {tab==='backgrounds'?<div className="free-decor-backgrounds">{FREE_BACKGROUNDS.map(b=><button type="button" aria-pressed={backgroundId===b.id} className={backgroundId===b.id?'selected':''} key={b.id} onClick={()=>onChange({backgroundId:b.id,stickerIds:selected})}><i className={'free-decor-swatch swatch-'+b.id} style={{background:b.color}}/><span>{b.name}</span></button>)}</div>:
   <>
    <div className="free-decor-groups">{['Todos','Avatares','Matcha','Pilates','Fitness','Aesthetic'].map(g=><button type="button" key={g} className={group===g?'active':''} onClick={()=>setGroup(g)}>{g}</button>)}</div>
    {visible.length?<div className="free-decor-stickers">{visible.map(a=><div key={a.id} className="free-decor-sticker-cell"><button type="button" aria-pressed={selected.includes(a.id)} className={selected.includes(a.id)?'selected':''} onClick={()=>toggle(a.id)}>{images[a.id]?<img alt={displayAssetName(a)} src={images[a.id]} loading="lazy"/>:<span onClick={()=>loadImage?.(a.id)}>Cargar</span>}<small>{displayAssetName(a)}</small></button></div>)}</div>:
    <div className="free-decor-empty"><strong>Aquí aparecerán tus stickers PNG originales.</strong><p>No se mostrarán emojis de relleno. Abre la biblioteca de Stickers para importar la colección original una vez.</p>{onOpenLibrary&&<button type="button" onClick={onOpenLibrary}>Abrir biblioteca de stickers</button>}</div>}
   </>}
  <div className="free-decor-footer"><small>Máximo 3 stickers por slide. Las fotografías originales no se modifican.</small>{selected.length>0&&<button type="button" onClick={()=>onChange({backgroundId,stickerIds:[]})}>Quitar stickers</button>}</div>
 </section>
}
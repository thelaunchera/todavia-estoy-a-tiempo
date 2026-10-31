import React from 'react';
import {FREE_BACKGROUNDS,FREE_STICKERS,downloadFreeStickerPNG,type FreeBackgroundId} from './FreeDesignAssets';
import './FreeDecorControls.css';
type Props={backgroundId?:FreeBackgroundId;stickerIds?:string[];onChange:(next:{backgroundId?:FreeBackgroundId;stickerIds?:string[]})=>void;title?:string};
export default function FreeDecorControls({backgroundId='brand',stickerIds=[],onChange,title='Stickers & Backgrounds'}:Props){
 const selected=stickerIds.filter(id=>FREE_STICKERS.some(x=>x.id===id)).slice(0,3);
 const toggle=(id:string)=>onChange({backgroundId,stickerIds:selected.includes(id)?selected.filter(x=>x!==id):[...selected,id].slice(-3)});
 return <section className="free-decor-controls" aria-label="Biblioteca gratuita de decoración">
  <div className="free-decor-header"><div><strong>✦ {title}</strong><p>Recursos aesthetics gratis · sin créditos IA · incluidos en tus PNG finales.</p></div><span>FREE</span></div>
  <p className="free-decor-label">Elige tu fondo</p>
  <div className="free-decor-backgrounds">{FREE_BACKGROUNDS.map(b=><button type="button" aria-pressed={(backgroundId||'brand')===b.id} className={backgroundId===b.id?'selected':''} key={b.id} onClick={()=>onChange({backgroundId:b.id,stickerIds:selected})}><i className={'free-decor-swatch swatch-'+b.id} style={{background:b.color}}/><span>{b.name}</span></button>)}</div>
  <p className="free-decor-label">Stickers decorativos <small>hasta 3 por diseño</small></p>
  <div className="free-decor-stickers">{FREE_STICKERS.map(s=><div className="free-decor-sticker-cell" key={s.id}><button type="button" aria-pressed={selected.includes(s.id)} className={selected.includes(s.id)?'selected':''} onClick={()=>toggle(s.id)}><span aria-hidden="true">{s.emoji}</span><small>{s.name}</small></button><button className="free-decor-download" type="button" title={'Descargar PNG '+s.name} onClick={()=>downloadFreeStickerPNG(s.id)}>Descargar PNG</button></div>)}</div>
  <div className="free-decor-footer"><small>Los stickers se aplican como capas, no cambian la fotografía original.</small>{selected.length>0&&<button type="button" onClick={()=>onChange({backgroundId,stickerIds:[]})}>Quitar stickers</button>}</div>
 </section>;
}

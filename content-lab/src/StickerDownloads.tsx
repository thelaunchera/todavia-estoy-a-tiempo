import React,{useMemo,useState} from 'react';
import {Download,Search,Images} from 'lucide-react';
import {FREE_STICKERS,downloadFreeStickerPNG} from './FreeDesignAssets';
import './StickerDownloads.css';
const groups=['Todos','Avatares','Matcha','Ejercicios','Pilates','Cute','Florales','Detalles','Editorial','Lifestyle'];
export default function StickerDownloads(){
 const [category,setCategory]=useState('Todos'),[search,setSearch]=useState('');
 const matches=useMemo(()=>FREE_STICKERS.filter(s=>(category==='Todos'||s.group===category)&&s.name.toLowerCase().includes(search.toLowerCase())),[category,search]);
 return <section className="sticker-downloads" aria-label="Stickers PNG gratuitos">
  <div className="sticker-downloads-head"><div><span className="eyebrow">FREE STICKER LIBRARY</span><h2>Stickers para tus posts</h2><p>Descarga cada ilustración PNG con fondo transparente, sin gastar créditos. Avatares, matcha, fitness, Pilates y detalles aesthetics.</p></div><div className="sticker-downloads-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar sticker…" aria-label="Buscar sticker"/></div></div>
  <div className="sticker-downloads-filters" role="group" aria-label="Categorías de stickers">{groups.map(g=><button type="button" aria-pressed={category===g} className={category===g?'selected':''} key={g} onClick={()=>setCategory(g)}>{g}</button>)}</div>
  {matches.length?<div className="sticker-downloads-grid">{matches.map(s=><article key={s.id}><div className="sticker-downloads-preview"><span role="img" aria-label={s.name}>{s.emoji}</span></div><strong>{s.name}</strong><small>{s.group}</small><button type="button" onClick={()=>downloadFreeStickerPNG(s.id)}><Download size={14}/> Descargar PNG</button></article>)}</div>:<div className="sticker-downloads-empty"><Images size={20}/> No hay stickers con ese nombre.</div>}
  <p className="sticker-downloads-note">Estas son ilustraciones editoriales descargables del Content Lab. La colección de PNG ilustrados originales de Pilates y fitness se está revisando por separado.</p>
 </section>
}
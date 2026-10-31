import React from 'react';
import {FREE_BACKGROUNDS,type FreeBackgroundId} from './FreeDesignAssets';
import {Palette,ArrowRight} from 'lucide-react';
import './BackgroundLibrary.css';
type Props={onDesign:(id:FreeBackgroundId)=>void};
export default function BackgroundLibrary({onDesign}:Props){
 return <section className="background-library">
  <header><span className="eyebrow">BACKGROUND STUDIO · GRATIS</span><h1>Fondos que dan personalidad.</h1><p>Fondos ivory, soft blue, sage, textura de papel, cuadrículas, puntos, degradados y dark editorial. Úsalos sin créditos de IA.</p></header>
  <div className="background-library-grid">{FREE_BACKGROUNDS.map(b=><article key={b.id}><div className={'background-preview swatch-'+b.id} style={{background:b.color}}><span className="background-sample-title">Your next<br/>big idea.</span><span className="background-sample-caption">THE CONTENT LAB · STUDIO</span></div><div className="background-library-card-bottom"><div><strong>{b.name}</strong><small>{b.description}</small></div><Palette size={17}/></div><button className="background-use-button" type="button" onClick={()=>onDesign(b.id)}>Usar este fondo <ArrowRight size={14}/></button></article>)}</div>
  <div className="background-library-action"><p>Abre un carrusel, entra en <strong>Backgrounds</strong> y elige el fondo en el panel de decoración. La vista previa y la descarga serán idénticas.</p><button type="button" className="btn dark" onClick={()=>onDesign("brand")}>Abrir Carousel Factory <ArrowRight size={16}/></button></div>
 </section>;
}
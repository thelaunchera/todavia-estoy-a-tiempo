
import React, { useEffect, useMemo, useState } from 'react';
import { api } from './platform/client';
import {
  Sparkles, WandSparkles, Plus, Trash2, ArrowLeft, ArrowRight, Download,
  Upload, ImagePlus, Save, Check, LoaderCircle, Layers3
} from 'lucide-react';
import './CarouselFactory.css';
import {readCarouselDesign,encodeCarouselDesign,normalizeCarouselStyle,getCarouselPalette,sampleReferencePalette,type CarouselStyle} from './CarouselArtDirection';
import {SOCIAL_PLATFORMS,brandPalette,preferredPlatform,platformName,socialAccount,type SocialAccounts,type SocialPlatform} from './BrandIdentity';
import FreeDecorControls from './FreeDecorControls';
import {paintFreeBackground,paintFreeStickers,type FreeBackgroundId} from './FreeDesignAssets';

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
type Asset = { id: string; brandId: string; name: string; mime: string };
type Layout = 'cover' | 'statement' | 'photo' | 'steps' | 'split' | 'closing';
type Slide = {
  key: string; eyebrow: string; title: string; description: string;
  layout: Layout; assetId: string; photoFocus?:'top'|'center'|'bottom';accentIndex?:number;backgroundId?:FreeBackgroundId;stickerIds?:string[];
};
type Props = {
  brand: Brand; post: Post; assets: Asset[]; images: Record<string, string>;
  onChange: (next: Post) => void; onSave: () => void;
  onNewAsset: (asset: Asset, dataUrl: string) => void;
  loadImage: (id: string) => void; uploadImage: () => void;
  notify: (message: string) => void; showError: (e: unknown) => void; saving: boolean;
};
const layouts: Layout[] = ['cover','statement','photo','steps','split','closing'];
const layoutNames: Record<Layout,string> = {
  cover: 'Editorial cover', statement: 'Statement', photo: 'Photo story',
  steps: 'Useful points', split: 'Split editorial', closing: 'Final CTA'
};
const defaultLabel = (brand: Brand) => brand.language === 'English' ? 'A CLOSER LOOK' : 'OTRA MANERA DE VERLO';
const makeSlide = (i: number, headline: string, assetId = ''): Slide => ({
  key: 'slide-' + i, eyebrow: i === 0 ? 'THE BIG IDEA' : 'THE STORY',
  title: headline.slice(0,420), description: '',
  layout: i === 0 ? 'cover' : i % 3 === 0 ? 'photo' : i % 2 === 0 ? 'steps' : 'statement',
  assetId
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
          assetId: String(s.assetId || ''),
          photoFocus:['top','center','bottom'].includes(s.photoFocus)?s.photoFocus:'center',
          accentIndex:Number.isInteger(s.accentIndex)&&s.accentIndex>=0&&s.accentIndex<=8?s.accentIndex:0,
           backgroundId:typeof s.backgroundId==='string'?s.backgroundId:'brand',stickerIds:Array.isArray(s.stickerIds)?s.stickerIds.filter((x:unknown)=>typeof x==='string').slice(0,3):[]
        }));
    }
  }
  const entries = post.slides.split('\n').map(s => s.replace(/^\s*(?:slide|diapositiva)?\s*\d+\s*[-:.)]\s*/i,'').trim()).filter(Boolean).slice(0,4);
  const title = post.hook || (brand.language === 'English' ? 'One idea worth sharing' : 'Una idea que merece contarse');
  const result: Slide[] = [{...makeSlide(0,title,post.assetId),eyebrow:brand.language==='Español'?'LA GRAN IDEA':'THE BIG IDEA',photoFocus:'top'}];
  entries.forEach((entry,n)=>result.push({...makeSlide(n+1,entry),eyebrow:brand.language==='Español'?'LA HISTORIA':'THE STORY'}));
  if(result.length < 3) {
    result.push(makeSlide(result.length,brand.language === 'English' ? 'What needs to change?' : '¿Qué podemos cambiar?'));
    result.push(makeSlide(result.length,brand.language === 'English' ? 'A simpler way forward' : 'Una forma más sencilla'));
  }
  result.push({
    ...makeSlide(result.length,post.cta || (brand.language === 'English' ? 'Your next step starts here.' : 'Empieza con un paso.')),
    eyebrow:brand.language === 'English' ? 'THE NEXT STEP' : 'TU SIGUIENTE PASO',layout:'closing'
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
  const spacing=Math.round(size*1.17);
  ctx.font='bold '+size+'px '+font;ctx.fillStyle=color;
  built.slice(0,lines).forEach((line,i)=>ctx.fillText(line,x,y+i*spacing));
}
async function drawSlide(slide:Slide,i:number,total:number,brand:Brand,images:Record<string,string>,style:CarouselStyle) {
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No se pudo abrir el diseñador de imágenes.');
  const {paper,accent,ink,onAccent,muted,outline}=getCarouselPalette(brand,style,slide.accentIndex||0);
  const destination=style.targetPlatform==='brand'?preferredPlatform(brand):style.targetPlatform;
  const handle=socialAccount(brand,destination);
  const footerName=(handle&&!/^https?:\/\//i.test(handle)?handle:brand.name).toUpperCase().slice(0,32);
  const bh=(brand.headingFont||'').toLowerCase();
  const heading=style.font==='serif'?'Georgia, serif':style.font==='sans'?'Arial, sans-serif':
    bh==='prompt'?'Prompt, Arial, sans-serif':bh==='futura'?'Futura, Arial, sans-serif':
    bh==='dm serif display'?'DM Serif Display, Georgia, serif':'Georgia, serif';
  const bodyFont=(brand.bodyFont||'').toLowerCase()==='futura'?'Futura, Arial, sans-serif':'Arial, sans-serif';
  try{if(document.fonts)await Promise.all([document.fonts.load('700 80px '+heading),document.fonts.load('500 32px '+bodyFont)]);}catch{/* Offline fallbacks */}
  const rect=(x:number,y:number,w:number,h:number,color:string)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  const label=(text:string,x:number,y:number,color:string,size=24)=>{
    ctx.fillStyle=color;ctx.font='700 '+size+'px '+bodyFont;
    ctx.fillText(text.slice(0,50),x,y);
  };
  const photo=async(x:number,y:number,w:number,h:number)=>{
    if(!slide.assetId||!images[slide.assetId])return false;
    const img=new Image();img.src=images[slide.assetId];
    await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('No se pudo cargar esta fotografía.'));});
    const z=Math.max(w/img.width,h/img.height),sw=w/z,sh=h/z;
    const f=slide.photoFocus||'center';
    const cy=f==='top'?Math.max(0,(img.height-sh)*.12):f==='bottom'?Math.max(0,(img.height-sh)*.9):Math.max(0,(img.height-sh)/2);
    ctx.drawImage(img,Math.max(0,(img.width-sw)/2),cy,sw,sh,x,y,w,h);
    return true;
  };
  const title=(x:number,y:number,w:number,size:number,maxLines:number,color=ink)=>fillLines(ctx,slide.title||'Your idea here',x,y,w,size,maxLines,color,heading);
  const body=(x:number,y:number,w:number,color=ink,maxLines=3)=>{
    if(slide.description)fillLines(ctx,slide.description,x,y,w,41,maxLines,color,bodyFont);
  };
  const footer=(color=ink)=>{
    label(footerName,72,1284,color,21);
    label(String(i+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),885,1284,color,21);
  };
  const decorated=!!slide.backgroundId&&slide.backgroundId!=='brand';
  if(decorated)paintFreeBackground(ctx,1080,1350,slide.backgroundId,accent,paper);
  else rect(0,0,1080,1350,paper);
  if(slide.layout==='cover') {
    label(slide.eyebrow||defaultLabel(brand),74,138,ink);rect(74,170,126,8,accent);
    title(74,348,920,106,5);
    rect(635,735,398,445,accent);
    const shown=await photo(635,735,398,445);
    if(!shown){rect(650,751,368,415,muted);ctx.strokeStyle=outline;ctx.lineWidth=7;ctx.beginPath();ctx.arc(835,958,129,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.moveTo(706,957);ctx.lineTo(706,1114);ctx.stroke();}
    body(74,1060,490,ink,3);footer();
  } else if(slide.layout==='statement') {
    if(!decorated)rect(0,0,1080,1350,accent);
    const statementInk=decorated?(slide.backgroundId==='night-editorial'?'#FFFFFF':'#191919'):onAccent;
    ctx.strokeStyle=statementInk;ctx.lineWidth=3;ctx.strokeRect(68,69,944,1212);
    label(slide.eyebrow||defaultLabel(brand),116,150,statementInk);
    title(116,428,850,108,6,statementInk);
    body(116,1040,825,statementInk,3);footer(statementInk);
  } else if(slide.layout==='photo') {
    if(!decorated)rect(0,0,1080,730,accent);const shown=await photo(0,0,1080,730);
    if(!shown){rect(0,0,1080,730,muted);ctx.strokeStyle=outline;ctx.lineWidth=7;ctx.strokeRect(90,95,900,550);}
    label(slide.eyebrow||defaultLabel(brand),75,832,ink);
    title(75,952,925,80,3);
    body(75,1155,900,ink,2);footer();
  } else if(slide.layout==='steps') {
    label(slide.eyebrow||defaultLabel(brand),74,135,ink);
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
    if(!shown)rect(590,240,410,865,paper);
    label(slide.eyebrow||defaultLabel(brand),60,147,onAccent);
    title(60,340,430,78,8,onAccent);
    body(60,1110,430,onAccent,3);footer(onAccent);
  } else {
    if(!decorated){rect(0,0,1080,1350,accent);rect(73,75,934,1200,paper);}
    label(slide.eyebrow||'ONE LAST THING',116,174,ink);
    title(116,450,843,99,6);
    body(116,1040,840,ink,3);rect(116,1151,175,10,accent);
    label(footerName,116,1225,ink,22);
    label(String(i+1).padStart(2,'0'),895,1225,ink,22);
  }
  paintFreeStickers(ctx,1080,1350,slide.stickerIds,accent);
  return canvas;
}
const filename=(post:Post,i:number)=>{
  const slug=(post.title||'content').normalize('NFKD').replace(/[^a-z0-9 -]/gi,'').trim().replace(/\s+/g,'-').toLowerCase()||'content';
  return slug+'-slide-'+String(i+1).padStart(2,'0')+'-1080x1350.png';
};
export default function CarouselFactory({brand,post,assets,images,onChange,onSave,onNewAsset,loadImage,uploadImage,notify,showError,saving}:Props) {
  const slides=useMemo(()=>parseSlides(post,brand),[post.designData,post.hook,post.slides,post.cta,post.assetId,brand.id]);
  const style=useMemo(()=>readCarouselDesign(post.designData||'').style,[post.designData]);
  const ownedAssets=useMemo(()=>assets.filter(a=>a.brandId===brand.id),[assets,brand.id]);
  const socialDestination=style.targetPlatform==='brand'?preferredPlatform(brand):style.targetPlatform;
  const socialLabel=platformName(socialDestination);
  const destinationAccount=socialAccount(brand,socialDestination);
  const palette=brandPalette(brand);
  const [current,setCurrent]=useState(0);
  const [preview,setPreview]=useState('');
  const [downloads,setDownloads]=useState<{name:string,url:string}[]>([]);
  const [idea,setIdea]=useState('');
  const [imagePrompt,setImagePrompt]=useState('');
  const [imageMode,setImageMode]=useState<'new'|'variation'>('new');
  const [sourceId,setSourceId]=useState('');
  const [imageSubjectType,setImageSubjectType]=useState<'portrait'|'product'>('portrait');
  const [referenceReport,setReferenceReport]=useState('');
  const [overview,setOverview]=useState<string[]>([]);
  const [overviewBusy,setOverviewBusy]=useState(false);
  const [busy,setBusy]=useState('');
  useEffect(()=>{setCurrent(0);setDownloads([]);setOverview([]);setReferenceReport('');setSourceId('');},[brand.id,post.id]);
  const i=Math.min(current,slides.length-1),slide=slides[i];
  const warnings=slides.flatMap((part,n)=>{
    const result:string[]=[];
    if(!part.title.trim())result.push('Slide '+(n+1)+': falta el titular.');
    if(part.title.length>(part.layout==='split'?95:part.layout==='cover'?115:155))result.push('Slide '+(n+1)+': titular largo, revisa la vista previa.');
    if(['photo','split'].includes(part.layout)&&!part.assetId)result.push('Slide '+(n+1)+': diseño fotográfico sin foto.');
    if(part.description.length>260)result.push('Slide '+(n+1)+': texto secundario demasiado largo.');
    return result;
  });
  const setAll=(all:Slide[],nextStyle:CarouselStyle=style)=>{
    onChange({...post,format:'Carousel',designData:encodeCarouselDesign(all,nextStyle),hook:all[0].title});
    setDownloads([]);setOverview([]);
  };
  const previewAll=async()=>{
    setOverviewBusy(true);setOverview([]);
    try{
      const previews:string[]=[];
      for(let n=0;n<slides.length;n++){
        const canvas=await drawSlide(slides[n],n,slides.length,brand,images,style);
        const small=document.createElement('canvas');small.width=270;small.height=338;
        const context=small.getContext('2d');if(!context)throw Error('No se pudo preparar la vista previa.');
        context.drawImage(canvas,0,0,270,338);
        previews.push(small.toDataURL('image/jpeg',.72));
      }
      setOverview(previews);notify('Vista previa completa preparada sin consumir créditos.');
    }catch(e){showError(e)}finally{setOverviewBusy(false)}
  };
  const setArtStyle=(patch:Partial<CarouselStyle>)=>setAll(slides,normalizeCarouselStyle({...style,...patch}));
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
    const rhythm:Layout[]=['cover','statement','photo','steps','statement','split','photo','closing'];
    setAll(slides.map((item,n)=>({...item,layout:n===slides.length-1?'closing':rhythm[n],photoFocus:item.photoFocus||'top'})));
    notify('Se aplicó un ritmo visual coherente; no cambié textos ni fotos.');
  };
  const replace=(patch:Partial<Slide>)=>setAll(slides.map((s,j)=>j===i?{...s,...patch}:s));
  const insert=()=>{
    if(slides.length>=8)return notify('Máximo ocho slides.');
    const next={...makeSlide(slides.length,'', ''),key:'slide-'+Date.now(),eyebrow:defaultLabel(brand)};
    setAll([...slides.slice(0,-1),next,...slides.slice(-1)]);
    setCurrent(slides.length-1);
  };
  const remove=()=>{
    if(slides.length<=2)return notify('Necesitas al menos dos slides.');
    if(!window.confirm('¿Eliminar este slide?'))return;
    setAll(slides.filter((_,j)=>j!==i));setCurrent(Math.max(0,i-1));
  };
  useEffect(()=>{
    slides.forEach(s=>{if(s.assetId&&!images[s.assetId])loadImage(s.assetId);});
    if(style.referenceAssetId&&!images[style.referenceAssetId])loadImage(style.referenceAssetId);
  },[post.designData,brand.id,style.referenceAssetId]);
  useEffect(()=>{
    let active=true;
    drawSlide(slide,i,slides.length,brand,images,style).then(c=>{
      if(active)setPreview(c.toDataURL('image/png'));
    }).catch(showError);
    return()=>{active=false;};
  },[i,slide.key,slide.eyebrow,slide.title,slide.description,slide.layout,slide.assetId,slide.photoFocus,slide.accentIndex,slide.backgroundId,slide.stickerIds,slides.length,brand.color,brand.background,brand.secondaryColor,brand.additionalColors,brand.headingFont,brand.bodyFont,style,images]);
  const makeCopy=async()=>{
    if(idea.trim().length<8)return notify('Describe un problema o una idea más específica.');
    setBusy('copy');
    try{
      const {data}=await api.post('/api/ideas',{brandId:brand.id,topic:idea,format:'Carousel',angle:post.angle||'Educational',platform:socialDestination});
      const updated:Post={...post,...data,format:'Carousel',brandId:brand.id,designData:''};
      onChange({...updated,designData:encodeCarouselDesign(parseSlides(updated,brand),style)});
      setCurrent(0);setDownloads([]);
      notify('Carrusel listo para editar, slide por slide.');
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
      const canvas=await drawSlide(slides[n],n,slides.length,brand,images,style);
      const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=filename(post,n);a.click();
      notify('Slide '+(n+1)+' descargado como PNG individual.');
    }catch(e){showError(e)}finally{setBusy('');}
  };
  const exportAll=async()=>{
    setBusy('all');
    try{
      const result:{name:string,url:string}[]=[];
      for(let n=0;n<slides.length;n++){
        const canvas=await drawSlide(slides[n],n,slides.length,brand,images,style);
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
    <div className="factory-idea">
      <div><div className="eyebrow">01 / CONTENT ENGINE</div><h2>Start with one good idea.</h2><p>La IA escribe el carrusel en {brand.language}, siguiendo las reglas de {brand.name}.</p></div>
      <div><textarea rows={3} value={idea} onChange={e=>setIdea(e.target.value)} placeholder={brand.language==='English'?'e.g. Why cleaning clients disappear after requesting a quote':'Ej. Sentir que vas tarde en la vida y aprender a empezar otra vez'}/><button className="btn dark" onClick={makeCopy} disabled={!!busy}>{busy==='copy'?<LoaderCircle className="spin" size={16}/>:<WandSparkles size={16}/>} Generate full carousel</button></div>
    </div>
    <section className="factory-style-panel" aria-label="Estilo maestro del carrusel">
      <div className="factory-style-title"><div><span className="eyebrow">02 / BRAND KIT LOCK</span><h2>Un solo estilo para todos los slides.</h2><p>Fondos, tipografías y colores conectados. Cambia aquí una vez y el carrusel completo sigue la misma dirección de arte.</p></div><span className="factory-style-lock"><Check size={15}/> Estilo maestro activo</span></div>
      <div className="factory-destination">
        <label>¿Dónde vas a publicar este carrusel?
          <select value={style.targetPlatform} onChange={e=>setArtStyle({targetPlatform:e.target.value as CarouselStyle['targetPlatform']})}>
            <option value="brand">Mi red principal ({platformName(preferredPlatform(brand))})</option>
            {SOCIAL_PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
        <p><strong>{socialLabel}</strong> · {destinationAccount||'Cuenta aún no configurada'} · Descargas manuales, sin publicación automática.</p>
      </div>
      <div className="factory-style-controls">
        <label>Dirección visual<select aria-label="Dirección visual del carrusel" value={style.mood} onChange={e=>setArtStyle({mood:e.target.value as CarouselStyle['mood']})}>
          <option value="editorial">Editorial limpio</option><option value="soft">Soft · fondos cálidos</option><option value="bold">Bold · contraste moderno</option><option value="dark">Dark · premium oscuro</option>
        </select></label>
        <label>Tipografía<select aria-label="Tipografía del carrusel" value={style.font} onChange={e=>setArtStyle({font:e.target.value as CarouselStyle['font']})}>
          <option value="brand">Usar mi Brand Kit</option><option value="serif">Editorial serif</option><option value="sans">Moderna sans serif</option>
        </select></label>
        <label>Paleta<select aria-label="Paleta del carrusel" value={style.accentSource} onChange={e=>setArtStyle({accentSource:e.target.value as CarouselStyle['accentSource']})}>
          <option value="brand">Colores de mi marca</option><option value="reference" disabled={!style.referenceColor}>Colores de la referencia</option>
        </select></label>
      </div>
      <div className="factory-reference">
        <div className="factory-reference-copy"><strong>¿Te dieron una referencia visual?</strong><p>Úsala como inspiración de paleta y contraste, sin copiar su fotografía ni sus textos. El análisis de color es gratuito.</p></div>
        <div className="factory-reference-actions">
          <select aria-label="Referencia de estilo" value={style.referenceAssetId} onChange={e=>{setArtStyle({referenceAssetId:e.target.value});setReferenceReport('')}}>
            <option value="">Sin referencia de estilo</option>{ownedAssets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button type="button" className="btn ghost" onClick={uploadImage}><Upload size={15}/> Subir referencia</button>
          <button type="button" className="btn dark" onClick={applyReference} disabled={!style.referenceAssetId||!images[style.referenceAssetId]}>Tomar colores · gratis</button>
        </div>
        {style.referenceAssetId&&images[style.referenceAssetId]&&<img className="factory-reference-thumb" src={images[style.referenceAssetId]} alt="Referencia usada solo como inspiración"/>}
      </div>
      <div className="factory-style-footer">
        <div className="factory-style-swatches">{palette.map((c,n)=><span key={n} title={c} style={{background:c}}/>)}<span title="Fondo" style={{background:brand.background}}/><small>Paleta guardada · usa otros tonos por slide cuando quieras</small></div>
        <button type="button" className="btn ghost" onClick={applyRhythm}><Layers3 size={15}/> Aplicar composición coordinada</button>
      </div>
      {referenceReport&&<p className="factory-reference-report" role="status">{referenceReport}</p>}
    </section>
    <div className="factory-work">
      <div className="factory-edit">
        <div className="factory-section"><strong>02 / Slide storyboard</strong><span>{slides.length} slides · Editable</span></div>
        <div className="factory-slide-strip">
          {slides.map((s,n)=><button key={s.key} className={'factory-thumbnail '+(n===i?'selected':'')} onClick={()=>setCurrent(n)}><small>{String(n+1).padStart(2,'0')}</small><strong>{s.title||'New slide'}</strong><span>{layoutNames[s.layout]}</span></button>)}
          {slides.length<8&&<button className="factory-add" onClick={insert}><Plus size={20}/> Add slide</button>}
        </div>
        <div className="factory-panel">
          <div className="factory-panel-title"><div><div className="eyebrow">SLIDE {i+1} / {slides.length}</div><h3>Edit this slide</h3></div><button className="factory-delete" onClick={remove} title="Eliminar slide"><Trash2 size={17}/></button></div>
          <label>Layout</label><select value={slide.layout} onChange={e=>replace({layout:e.target.value as Layout})}>{layouts.map(v=><option key={v} value={v}>{layoutNames[v]}</option>)}</select>
          <label>Small heading</label><input value={slide.eyebrow} maxLength={80} onChange={e=>replace({eyebrow:e.target.value})}/>
          <label>Main headline</label><textarea rows={3} value={slide.title} maxLength={420} onChange={e=>replace({title:e.target.value})}/>
          <label>Supporting copy (optional)</label><textarea rows={3} value={slide.description} maxLength={1000} onChange={e=>replace({description:e.target.value})} placeholder="Add a short explanation or 3 lines of practical advice."/>
           <label>Acento de este slide (opcional)</label><select aria-label="Color de marca de este slide" value={slide.accentIndex||0} onChange={e=>replace({accentIndex:Number(e.target.value)})}>
             <option value={0}>Color maestro · {style.accentSource==='reference'?'referencia':palette[0]}</option>
             {palette.slice(1).map((c,index)=><option key={c} value={index+1}>{index===0?'Secundario':'Extra '+index} · {c}</option>)}
           </select>
           <label>Encuadre de la fotografía</label><select aria-label="Encuadre de foto" value={slide.photoFocus||'center'} onChange={e=>replace({photoFocus:e.target.value as Slide['photoFocus']})}>
             <option value="top">Rostro arriba · evitar recortes</option><option value="center">Centro</option><option value="bottom">Parte inferior</option>
           </select>
          <div className="factory-labelrow"><label>Real photo / screenshot</label><button className="btn ghost" onClick={uploadImage}><Upload size={16}/> Upload</button></div>
          <select value={slide.assetId} onChange={e=>replace({assetId:e.target.value})}><option value="">Sin foto · solo gráfico</option>{ownedAssets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <FreeDecorControls backgroundId={slide.backgroundId||'brand'} stickerIds={slide.stickerIds||[]} onChange={next=>replace(next)}/>
          <div className="factory-pagination"><button className="btn ghost" onClick={()=>setCurrent(v=>Math.max(0,v-1))} disabled={i===0}><ArrowLeft size={15}/> Previous</button><button className="btn dark" onClick={()=>setCurrent(v=>Math.min(slides.length-1,v+1))} disabled={i===slides.length-1}>Next slide <ArrowRight size={15}/></button></div>
        </div>
        <div className="factory-panel factory-ai">
          <div className="factory-panel-title"><div><div className="eyebrow">03 / IMAGE MAKER</div><h3><Sparkles size={18}/> AI Image Lab</h3></div></div>
          <p>Crea imágenes nuevas para una publicación o variaciones creativas de una fotografía. No modifica el original.</p>
          <div className="factory-mode"><button className={imageMode==='new'?'selected':''} onClick={()=>setImageMode('new')}>Create new</button><button className={imageMode==='variation'?'selected':''} onClick={()=>setImageMode('variation')}>Photo variation</button></div>
          <label>¿Qué estás fotografiando?</label><div className="factory-mode">
             <button type="button" className={imageSubjectType==='portrait'?'selected':''} onClick={()=>setImageSubjectType('portrait')}>Persona / retrato</button>
             <button type="button" className={imageSubjectType==='product'?'selected':''} onClick={()=>setImageSubjectType('product')}>Producto / objeto</button>
           </div>
           {imageMode==='variation'&&<><label>Foto original · sujeto principal</label><select value={sourceId} onChange={e=>setSourceId(e.target.value)}><option value="">Selecciona foto original…</option>{ownedAssets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
             {style.referenceAssetId&&<small>La segunda referencia guía solamente el estilo. Tu foto original mantiene el papel de sujeto principal.</small>}
           </>}
          <label>Visual prompt</label><textarea rows={3} value={imagePrompt} onChange={e=>setImagePrompt(e.target.value)} placeholder="Editorial photo of cookies on a blue table, beautiful morning light, no text or logos…"/>
          <button className="btn dark wide" onClick={createImage} disabled={!!busy}>{busy==='image'?<LoaderCircle className="spin" size={16}/>:<WandSparkles size={16}/>} Generar foto · 1 crédito IA</button>
          <small>Las generaciones pueden consumir créditos. No uses variaciones IA de screenshots de la App ni de fotos donde necesites fidelidad exacta de rostros o detalles.</small>
        </div>
      </div>
      <aside className="factory-right">
        <div className="factory-section"><strong>Live design preview</strong><span>4:5 · 1080 × 1350</span></div>
        <div className="factory-preview">{preview?<img src={preview} alt={'Diseño del slide '+(i+1)}/>:<LoaderCircle className="spin"/>}</div>
        <div className="factory-previewnav"><button onClick={()=>setCurrent(v=>Math.max(0,v-1))} disabled={i===0}><ArrowLeft size={17}/> Prev</button><strong>{i+1} of {slides.length}</strong><button onClick={()=>setCurrent(v=>Math.min(slides.length-1,v+1))} disabled={i===slides.length-1}>Next <ArrowRight size={17}/></button></div>
        <button className="btn dark wide" onClick={()=>exportOne()} disabled={!!busy}><Download size={16}/> Download slide {i+1} PNG</button>
        <button className="btn ghost wide" onClick={previewAll} disabled={!!busy||overviewBusy}>{overviewBusy?<LoaderCircle className="spin" size={16}/>:<Layers3 size={16}/>} Ver el carrusel completo · gratis</button>
        {overview.length>0&&<div className="factory-overview" aria-label="Vista previa de todos los slides"><strong>Tu carrusel, como una colección</strong><div className="factory-overview-grid">{overview.map((src,n)=><button type="button" key={n} onClick={()=>setCurrent(n)} title={'Ir al slide '+(n+1)}><img src={src} alt={'Vista previa slide '+(n+1)}/><span>{n+1}/{slides.length}</span></button>)}</div></div>}
        <button className="btn ghost wide" onClick={exportAll} disabled={!!busy}><Layers3 size={16}/> Preparar PNG individuales</button>
        {downloads.length>0&&<div className="factory-exports"><strong><Check size={15}/> {downloads.length} individual files ready</strong><p>Descarga cada archivo por separado, sin ZIP ni collage.</p>{downloads.map((d,n)=><a key={d.name} href={d.url} download={d.name}><Download size={15}/> Slide {String(n+1).padStart(2,'0')}.png <ArrowRight size={14}/></a>)}</div>}
        <div className="factory-hint"><ImagePlus size={16}/> El estilo maestro afecta todo el carrusel; el texto, las fotografías y la composición de cada slide siguen siendo editables.</div>
         <div className="factory-quality"><strong>Revisión antes de publicar</strong><p>Comprobamos longitud del texto y si faltan fotografías. Revisa manualmente ortografía, identidad facial y manos.</p>
           {warnings.length?warnings.map((note,n)=><small key={n}>• {note}</small>):<span><Check size={15}/> Sin avisos de texto o fotografías pendientes.</span>}
         </div>
      </aside>
    </div>
  </div>;
}

import BrandAssetLibrary from './BrandAssetLibrary';
import {EDITORIAL_STICKER_ASSETS} from './editorial-sticker-assets';
import {SOVA_CAROUSEL_ASSETS,type SovaCarouselAsset} from './sova-carousel-assets';
import {GOLDEN_GRID_CAROUSEL_ASSETS,type GoldenGridCarouselAsset} from './golden-grid-carousel-assets';
import {LAB_ASSETS} from './lab-assets';
import {EDITORIAL_DRAFTS,type EditorialDraft} from './editorial-drafts';
import {loadStudioLabAssets,keepStudioLabImage,type StudioLabAsset} from './supabase-client';
import {useEffect,useRef,useState} from 'react';
import {clampTextCurve,clampLetterSpacing,curvedTextExtraHeight,drawCurvedTextLine} from './curved-text';
import {isLayerDoubleTap,isStationaryTap,type LayerTap} from './double-tap';
import {cutoutOriginalPhoto,originalBlobFromSource,restoreOriginalPhoto,storeOriginalPhoto} from './photo-background';
import {readEditorRecord,writeEditorRecord} from './seamless-persistence';
import {zipSync} from 'fflate';
type Item={id:number;kind:'text'|'image'|'sticker';text?:string;src?:string;x:number;y:number;width:number;fontSize:number;color:string;textStyle?:'hook'|'title'|'paragraph'|'caption';radius?:number;rotation?:number;curve?:number;letterSpacing?:number;originalBackupId?:string;locked?:boolean};
const W=1080,H=1350,KEY='studio-seamless-v1',PROJECTS_KEY='studio-seamless-projects-v1',PROJECT_NAME_KEY='studio-seamless-current-name-v1',ACTIVE_PROJECT_KEY='studio-seamless-active-project-v1';
const defaults={count:5,background:'#FAF8F3',backgroundImages:{} as Record<number,string>,items:[] as Item[]};
const labUrl=(file:string)=>'/content-lab/'+file;
const LAB_BACKGROUNDS=[['Warm Ivory','#FAF8F3'],['Soft Blue','#DCECF4'],['Sage Studio','#E4EDE1'],['Butter Cream','#FFF4C4'],['Blush Paper','#FCE9EF'],['Dark Editorial','#22282C'],['Vintage Scrapbook','#F1E8D6'],['Peach Sunset','#F6C3AB'],['Lilac Haze','#E8DDF7'],['Coffee Club','#E5D2BB'],['Midnight Stars','#26313E']];
const LAB_STICKERS=['🎀','🩷','✨','🌸','🌷','🌿','⭐','☕','🌙','🦋','🍒','📌','📎','📝','🧘🏽‍♀️','🏋🏽‍♀️','🍵','💪','👟'];
export default function SeamlessEditor(){
 const [doc,setDoc]=useState<typeof defaults>(()=>{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return defaults}});
 const [selected,setSelected]=useState<number|null>(null);
 const [deleteArmedId,setDeleteArmedId]=useState<number|null>(null);
 const lastTap=useRef<LayerTap|null>(null);
 const pointerStart=useRef<{pointer:number;id:number|null;x:number;y:number}|null>(null);
 useEffect(()=>{
  const hideOutside=(event:PointerEvent)=>{
   const target=event.target;
   if(!(target instanceof Element)||target.closest('[data-carousel-canvas],[data-carousel-delete]'))return;
   setDeleteArmedId(null);lastTap.current=null;
  };
  document.addEventListener('pointerdown',hideOutside,true);
  return ()=>document.removeEventListener('pointerdown',hideOutside,true);
 },[]);
 const [editingText,setEditingText]=useState<number|null>(null);
 const canvasTextRef=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{if(editingText!==null)requestAnimationFrame(()=>canvasTextRef.current?.focus());},[editingText]);
 const [projectName,setProjectName]=useState(()=>localStorage.getItem(PROJECT_NAME_KEY)||'Mi carrusel');
 const [activeProjectId,setActiveProjectId]=useState<string|null>(()=>localStorage.getItem(ACTIVE_PROJECT_KEY));
 const [recentlyDeleted,setRecentlyDeleted]=useState<{item:Item;index:number}|null>(null);
 useEffect(()=>{try{localStorage.setItem(PROJECT_NAME_KEY,projectName)}catch{}},[projectName]);
 useEffect(()=>{try{if(activeProjectId)localStorage.setItem(ACTIVE_PROJECT_KEY,activeProjectId);else localStorage.removeItem(ACTIVE_PROJECT_KEY)}catch{}},[activeProjectId]);
 const [projects,setProjects]=useState<{id:string;name:string;updated:string;doc:typeof defaults}[]>(()=>{try{return JSON.parse(localStorage.getItem(PROJECTS_KEY)||'[]')}catch{return []}});
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [backgroundProgress,setBackgroundProgress]=useState('');
 const backgroundGeneration=useRef(0);
 const [brandFilter,setBrandFilter]=useState('todos');
 const [hiddenDraftIds,setHiddenDraftIds]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('studio-hidden-carousel-drafts-v1')||'[]')}catch{return []}});
 useEffect(()=>{try{localStorage.setItem('studio-hidden-carousel-drafts-v1',JSON.stringify(hiddenDraftIds))}catch{}},[hiddenDraftIds]);
 const [activeBrief,setActiveBrief]=useState<EditorialDraft|null>(null);
 const [panel,setPanel]=useState<'fondos'|'stickers'|'capas'>('fondos');
 const [quickPanel,setQuickPanel]=useState<'fondos'|'stickers'|'capas'|'elementos'|null>(null);
 const [privateAssets,setPrivateAssets]=useState<StudioLabAsset[]>([]);
 const [libraryStatus,setLibraryStatus]=useState('');
 useEffect(()=>{let live=true;setLibraryStatus('Cargando biblioteca privada…');loadStudioLabAssets().then(items=>{if(live){setPrivateAssets(items);setLibraryStatus(items.length?'':'No se encontraron archivos accesibles con esta cuenta.')}}).catch(err=>{if(live)setLibraryStatus(err instanceof Error?err.message:'No se pudo cargar la biblioteca.')});return()=>{live=false}},[]);
 const canvas=useRef<HTMLCanvasElement>(null);
 const viewport=useRef<HTMLDivElement>(null);
 const photoInput=useRef<HTMLInputElement>(null);
 const replacePhotoId=useRef<number|null>(null);
 const swipe=useRef<{pointer:number;x:number;y:number}|null>(null);
 const swipeStart=useRef<{x:number;y:number;slide:number}|null>(null);
 const layerGesture=useRef(false);
 const [slide,setSlide]=useState(0);
 const [canvasZoom,setCanvasZoom]=useState<75|100|125|150>(100);
 const textEditor=useRef<HTMLTextAreaElement>(null);
 const nextId=useRef(Date.now());
 const touches=useRef(new Map<number,{x:number;y:number}>());
 const pinch=useRef<{id:number;distance:number;size:number;x:number;y:number;w:number;h:number;cx:number;cy:number}|null>(null);
 const drag=useRef<{pointer:number;id:number;x:number;y:number;ox:number;oy:number;mode:'move'|'resize';startSize:number}|null>(null);
 const transformFrame=useRef<number|null>(null);
 const pendingTransform=useRef<{id:number;patch:Partial<Item>}|null>(null);
 const queueTransform=(id:number,patch:Partial<Item>)=>{
  pendingTransform.current={id,patch};
  if(transformFrame.current!==null)return;
  transformFrame.current=requestAnimationFrame(()=>{
   transformFrame.current=null;
   const next=pendingTransform.current;pendingTransform.current=null;
   if(next)setDoc(d=>({...d,items:d.items.map(item=>item.id===next.id?{...item,...next.patch}:item)}));
  });
 };
 useEffect(()=>()=>{if(transformFrame.current!==null)cancelAnimationFrame(transformFrame.current)},[]);
 const images=useRef(new Map<string,HTMLImageElement>());
 const width=doc.count*W;
 const [storageReady,setStorageReady]=useState(false);
 const [saveStatus,setSaveStatus]=useState('Buscando tu último diseño guardado…');
 const saveQueue=useRef<Promise<void>>(Promise.resolve());
 const persistDraft=(snapshot:typeof defaults):Promise<void>=>{
  const task=saveQueue.current.catch(()=>{}).then(()=>writeEditorRecord(KEY,snapshot));
  saveQueue.current=task.catch(()=>{});
  return task;
 };
 useEffect(()=>{
  let live=true;
  void Promise.all([readEditorRecord<typeof defaults>(KEY),readEditorRecord<typeof projects>(PROJECTS_KEY)])
   .then(([savedDoc,savedProjects])=>{
    if(!live)return;
    if(savedDoc)setDoc(savedDoc);
    if(savedProjects)setProjects(savedProjects);
    setSaveStatus('Guardado automático activado');
   })
   .catch(()=>{if(live)setSaveStatus('No se pudo abrir el guardado automático. No cierres el editor sin exportar tu trabajo.');})
   .finally(()=>{if(live)setStorageReady(true)});
  return()=>{live=false};
 },[]);
 useEffect(()=>{
  if(!storageReady)return;
  setSaveStatus('Guardando cambios…');
  const timer=window.setTimeout(()=>{
   void persistDraft(doc).then(()=>setSaveStatus('Cambios guardados en este dispositivo'))
    .catch(()=>setSaveStatus('No se guardaron los cambios. Libera espacio antes de salir.'));
  },350);
  return()=>window.clearTimeout(timer);
 },[doc,storageReady]);
 const loadImage=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const existing=images.current.get(src);if(existing?.complete){resolve(existing);return}const im=new Image();im.onload=()=>{images.current.set(src,im);resolve(im)};im.onerror=reject;im.src=src});
 const paint=async(ctx:CanvasRenderingContext2D,scale=1,clipStart=0,clipWidth=width,omitTextId:number|null=null)=>{
  ctx.save();ctx.scale(scale,scale);ctx.fillStyle=doc.background;ctx.fillRect(0,0,clipWidth,H);
  for(let slideIndex=0;slideIndex<doc.count;slideIndex++){const src=doc.backgroundImages?.[slideIndex];if(src){try{const bg=await loadImage(src);const left=slideIndex*W-clipStart;ctx.save();ctx.beginPath();ctx.rect(left,0,W,H);ctx.clip();const factor=Math.max(W/bg.width,H/bg.height);const dw=bg.width*factor,dh=bg.height*factor;ctx.drawImage(bg,left+(W-dw)/2,(H-dh)/2,dw,dh);ctx.restore()}catch{}}}
  for(const it of doc.items){if(it.kind==='text'&&it.id===omitTextId)continue;const x=it.x-clipStart;const bounds=itemBounds(it);ctx.save();if(it.rotation){ctx.translate(x+bounds.w/2,it.y+bounds.h/2);ctx.rotate(it.rotation*Math.PI/180);ctx.translate(-(x+bounds.w/2),-(it.y+bounds.h/2))}if(it.kind==='sticker'){ctx.font=it.fontSize+'px Apple Color Emoji, Segoe UI Emoji, sans-serif';ctx.textBaseline='top';ctx.fillText(it.text||'✨',x,it.y)}else if(it.kind==='text'){
    ctx.fillStyle=it.color;ctx.font='bold '+it.fontSize+'px Arial, sans-serif';ctx.textBaseline='top';
    const lines=textLines(it),curve=clampTextCurve(it.curve||0);
    const spacing=it.fontSize*1.3+curvedTextExtraHeight(it.fontSize,it.width||900,curve,lines,it.letterSpacing||0);
    lines.forEach((line,index)=>drawCurvedTextLine(ctx,line,x,it.y+index*spacing,it.fontSize,curve,it.width||900,it.letterSpacing||0));
   }else if(it.src){try{const im=await loadImage(it.src);ctx.save();ctx.beginPath();const h=it.width*im.height/im.width;const radius=Math.max(0,Math.min(it.radius||0,it.width/2,h/2));ctx.roundRect(x,it.y,it.width,h,radius);ctx.clip();ctx.drawImage(im,x,it.y,it.width,h);ctx.restore()}catch{}}ctx.restore()}
  ctx.restore();
 };
 useEffect(()=>{
   let active=true;
   const render=async()=>{
     const visible=canvas.current;if(!visible)return;
     // Paint in an isolated, display-sized buffer. An older asynchronous image
     // decode must never overwrite newer edits or make a layer disappear.
     // The export path still paints at the full 1080 × 1350 per slide.
     const previewScale=480/W;
     const buffer=document.createElement('canvas');
     buffer.width=Math.round(width*previewScale);
     buffer.height=Math.round(H*previewScale);
     const background=buffer.getContext('2d');if(!background)return;
     await paint(background,previewScale,0,width,editingText);
     if(!active)return;
     visible.width=buffer.width;visible.height=buffer.height;
     const ctx=visible.getContext('2d');if(!ctx)return;
     ctx.drawImage(buffer,0,0);
     ctx.save();ctx.scale(previewScale,previewScale);
     ctx.strokeStyle='rgba(25,25,25,.25)';ctx.setLineDash([12,12]);
     for(let i=1;i<doc.count;i++){ctx.beginPath();ctx.moveTo(i*W,0);ctx.lineTo(i*W,H);ctx.stroke()}
     ctx.setLineDash([]);
     const chosen=doc.items.find(it=>it.id===selected);
     if(chosen&&!chosen.locked){
       const b=itemBounds(chosen);ctx.save();
       ctx.strokeStyle='#1677c5';ctx.lineWidth=5;ctx.setLineDash([12,8]);
       ctx.translate(chosen.x+b.w/2,chosen.y+b.h/2);
       ctx.rotate((chosen.rotation||0)*Math.PI/180);
       ctx.strokeRect(-b.w/2,-b.h/2,b.w,b.h);
       ctx.setLineDash([]);ctx.restore();
     }
     ctx.restore();
   };
   void render();return()=>{active=false};
 },[doc,selected,editingText]);
 const toggleLock=(id:number)=>{const item=doc.items.find(it=>it.id===id);if(!item)return;setDoc(d=>({...d,items:d.items.map(it=>it.id===id?{...it,locked:!it.locked}:it)}));setDeleteArmedId(null);lastTap.current=null;setSelected(null);setMessage(item.locked?'Elemento desbloqueado. Puedes moverlo.':'Elemento bloqueado. Puedes editar los objetos que están encima sin moverlo.');};
 const update=(id:number,patch:Partial<Item>)=>setDoc(d=>({...d,items:d.items.map(it=>it.id===id?{...it,...patch}:it)}));
 const addPrivateSticker=(url:string)=>{const id=++nextId.current;setDoc(d=>({...d,items:[...d.items,{id,kind:'image',src:url,x:slide*W+200,y:200,width:460,fontSize:100,color:'#191919'}]}));setSelected(id)};
 const goldenGridAssetUrl=(file:string)=>new URL('brand-kits/golden-grid/'+file,document.baseURI).href;
 const addGoldenGridAsset=async(asset:GoldenGridCarouselAsset)=>{
  try{
   const src=goldenGridAssetUrl(asset.file);
   await loadImage(src);
   const id=++nextId.current;
   setDoc(d=>({...d,items:[...d.items,{id,kind:'image',src,x:slide*W+60,y:220,width:asset.width,fontSize:80,color:'#191919'}]}));
   setSelected(id);setQuickPanel(null);
   setMessage(asset.name+' añadido al lienzo. Muévelo, gíralo o agrándalo. Añade tu texto como otra capa.');
  }catch{setMessage('No se pudo abrir este elemento. Vuelve a intentarlo.');}
 };
 const sovaAssetUrl=(file:string)=>new URL('brand-kits/sova/'+file,document.baseURI).href;
 const addSovaAsset=async(asset:SovaCarouselAsset)=>{
  try{
   const src=sovaAssetUrl(asset.file);
   await loadImage(src);
   const id=++nextId.current;
   setDoc(d=>({...d,items:[...d.items,{id,kind:'image',src,x:slide*W+60,y:220,width:asset.width,fontSize:80,color:'#191919'}]}));
   setSelected(id);setQuickPanel(null);
   setMessage(asset.name+' añadido al lienzo. Puedes mover, girar y cambiar su tamaño. El texto se agrega como una capa independiente.');
  }catch{setMessage('No se pudo abrir el elemento SOVA. Inténtalo de nuevo.');}
 };
 const addEditorialAsset=async(asset:typeof EDITORIAL_STICKER_ASSETS[number])=>{
  try{
   const src=new URL('brand-kits/editorial-stickers/'+asset.file,document.baseURI).href;
   await loadImage(src);
   const id=++nextId.current;
   setDoc(d=>({...d,items:[...d.items,{id,kind:'image',src,x:slide*W+80,y:220,width:asset.width,fontSize:80,color:'#191919'}]}));
   setSelected(id);setQuickPanel(null);setMessage(asset.name+' añadido al lienzo. Puedes escalarlo con dos dedos.');
  }catch{setMessage('No se pudo cargar el sticker. Inténtalo nuevamente.')}
 };
 const setPrivateBackground=(url:string)=>setDoc(d=>({...d,backgroundImages:{...d.backgroundImages,[slide]:url}}));
 const addLabSticker=(file:string)=>{const id=++nextId.current;setDoc(d=>({...d,items:[...d.items,{id,kind:'image',src:labUrl(file),x:slide*W+200,y:200,width:460,fontSize:100,color:'#191919'}]}));setSelected(id);setMessage('Sticker añadido. Muévelo o agrándalo directamente sobre el diseño.')};
 const setLabBackground=(file:string)=>setDoc(d=>({...d,backgroundImages:{...d.backgroundImages,[slide]:labUrl(file)}}));
 const addSticker=(emoji:string)=>{const id=++nextId.current;setDoc(d=>({...d,items:[...d.items,{id,kind:'sticker',text:emoji,x:slide*W+200,y:220,width:180,fontSize:160,color:'#191919'}]}));setSelected(id)};
 const addText=(style:'hook'|'title'|'paragraph'|'caption'='paragraph')=>{
   const starter=doc.items.find(it=>it.kind==='text'&&Math.floor((it.x+(it.width||900)/2)/W)===slide&&!(it.text||'').trim());
   if(starter){setSelected(starter.id);setEditingText(starter.id);
     setMessage('Edita el texto vacío que ya existe; no se añadió otro.');return;}
   const id=++nextId.current;
   const existing=doc.items.filter(it=>it.kind==='text'&&Math.floor(it.x/W)===slide).length;
   const sizes={hook:104,title:82,paragraph:44,caption:30};
   setDoc(d=>({...d,items:[...d.items,{id,kind:'text',text:'',textStyle:style,
     x:slide*W+90,y:140+(existing%6)*170,width:900,fontSize:sizes[style],color:'#191919'}]}));
   setSelected(id);setEditingText(id);
   setMessage('Escribe directamente sobre el carrusel. Puedes mover el texto después.');
 };
 const onFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){setMessage('Selecciona una foto válida.');return}if(file.size>18_000_000){setMessage('Usa una foto de menos de 18 MB.');return}const reader=new FileReader();reader.onerror=()=>setMessage('No se pudo abrir la foto. Prueba con JPEG o PNG.');reader.onload=()=>{const replacing=replacePhotoId.current;replacePhotoId.current=null;if(replacing!==null){update(replacing,{src:String(reader.result),originalBackupId:undefined});setSelected(replacing);setMessage('Foto reemplazada sin perder su posición ni tamaño.')}else{const id=++nextId.current;setDoc(d=>({...d,items:[...d.items,{id,kind:'image',src:String(reader.result),x:slide*W+100,y:160,width:650,fontSize:80,color:'#191919'}]}));setSelected(id)}};reader.readAsDataURL(file);e.target.value=''};
 const locate=(e:React.PointerEvent<HTMLCanvasElement>|React.MouseEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();return {x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*H/r.height}};
 const textLines=(it:Item)=>{const lines:string[]=[];const maxWidth=it.width||900;const font=it.fontSize;for(const para of (it.text||'').split('\n')){if(!para.trim()){lines.push('');continue}let line='';for(const word of para.split(/\s+/)){const candidate=line?line+' '+word:word;if(candidate.length*font*.53>maxWidth&&line){lines.push(line);line=word}else line=candidate}lines.push(line)}return lines.length?lines:['']};
 const itemBounds=(it:Item)=>{
  const im=it.src?images.current.get(it.src):undefined;
  const lines=it.kind==='text'?textLines(it):[];
  const lineHeight=it.fontSize*1.3+(it.kind==='text'?curvedTextExtraHeight(it.fontSize,it.width||900,it.curve||0,lines,it.letterSpacing||0):0);
  return {w:it.kind==='text'?Math.max(150,it.width||900):it.kind==='sticker'?it.fontSize:it.width,
    h:it.kind==='text'?lineHeight*Math.max(1,lines.length):it.kind==='sticker'?it.fontSize:im?.width?it.width*im.height/im.width:it.width};
 };
 const hit=(x:number,y:number)=>[...doc.items].reverse().find(it=>{
    if(it.locked)return false;
   // The hit area must match the wrapped, rotated element that was painted.
   // Otherwise a finger selects the photograph underneath the text.
   const {w,h}=itemBounds(it);
   const cx=it.x+w/2,cy=it.y+h/2,a=-(it.rotation||0)*Math.PI/180;
   const dx=x-cx,dy=y-cy;
   const lx=dx*Math.cos(a)-dy*Math.sin(a)+w/2;
   const ly=dx*Math.sin(a)+dy*Math.cos(a)+h/2;
   const tolerance=24; // approximately seven displayed pixels on a phone
   return lx>=-tolerance&&lx<=w+tolerance&&ly>=-tolerance&&ly<=h+tolerance;
 });
 const down=(e:React.PointerEvent<HTMLCanvasElement>)=>{
  const p=locate(e);
  touches.current.set(e.pointerId,p);
  if(touches.current.size===2){
   lastTap.current=null;setDeleteArmedId(null);
   // Do not resize a previously selected layer if the first finger touched empty canvas.
   const id=drag.current?.id??selected;
   const firstTouchId=drag.current?.id??pointerStart.current?.id;
   const it=doc.items.find(item=>item.id===id&&item.id===firstTouchId&&!item.locked);
   if(it){
    const points=[...touches.current.values()],bounds=itemBounds(it);
    const pending=pendingTransform.current?.id===it.id?pendingTransform.current.patch:null;
    pinch.current={id:it.id,distance:Math.max(1,Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y)),
     size:it.kind==='image'?it.width:it.fontSize,x:pending?.x??it.x,y:pending?.y??it.y,
     w:bounds.w,h:bounds.h,cx:(points[0].x+points[1].x)/2,cy:(points[0].y+points[1].y)/2};
    drag.current=null;swipe.current=null;layerGesture.current=true;swipeStart.current=null;
   }
   pointerStart.current=null;
   e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);return;
  }
  if(touches.current.size>2)return;
  const it=hit(p.x,p.y);
  pointerStart.current={pointer:e.pointerId,id:it?.id??null,x:e.clientX,y:e.clientY};
  if(!it||deleteArmedId!==it.id)setDeleteArmedId(null);
  if(!it)lastTap.current=null;
  setSelected(it?.id??null);setEditingText(null);
  if(it){
   layerGesture.current=true;swipeStart.current=null;
   drag.current={pointer:e.pointerId,id:it.id,x:p.x,y:p.y,ox:it.x,oy:it.y,mode:'move',startSize:it.kind==='image'?it.width:it.fontSize};
   e.preventDefault();
  }else{
   layerGesture.current=false;
   swipe.current={pointer:e.pointerId,x:p.x,y:p.y};
  }
  e.currentTarget.setPointerCapture(e.pointerId);
 };
 const goSlide=(n:number,keepSelection=false)=>{
   const next=Math.max(0,Math.min(doc.count-1,n));setSlide(next);
   if(!keepSelection){setSelected(null);setEditingText(null);setDeleteArmedId(null);lastTap.current=null;}
   const vp=viewport.current;
   if(vp)vp.scrollTo({left:next*(vp.scrollWidth/doc.count),behavior:'smooth'});
 };
 const onViewportTouchStart=(e:React.TouchEvent<HTMLDivElement>)=>{
   if(e.touches.length!==1){swipeStart.current=null;return}
   layerGesture.current=false;
   const touch=e.touches[0];
   swipeStart.current={x:touch.clientX,y:touch.clientY,slide};
 };
 const onViewportTouchEnd=(e:React.TouchEvent<HTMLDivElement>)=>{
   const start=swipeStart.current;swipeStart.current=null;
   const interacted=layerGesture.current;
   if(e.touches.length===0)layerGesture.current=false;
   if(interacted||!start||e.changedTouches.length!==1||e.touches.length!==0||pinch.current||drag.current)return;
   const touch=e.changedTouches[0],dx=touch.clientX-start.x,dy=touch.clientY-start.y;
   if(Math.abs(dx)>=55&&Math.abs(dx)>Math.abs(dy)*1.25)goSlide(start.slide+(dx<0?1:-1));
 };
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{
  const p=locate(e);
  if(touches.current.has(e.pointerId))touches.current.set(e.pointerId,p);
  if(swipe.current?.pointer===e.pointerId)return;
  if(pinch.current&&touches.current.size===2){
   e.preventDefault();
   const points=[...touches.current.values()],start=pinch.current;
   const distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);
   const ratio=Math.max(.1,Math.min(8,distance/start.distance));
   const it=doc.items.find(item=>item.id===start.id);
   if(it&&!it.locked){
    const isImage=it.kind==='image';
    const size=Math.max(isImage?80:24,Math.min(isImage?2400:800,Math.round(start.size*ratio)));
    const scale=size/start.size;
    // Scale around the fingers' midpoint; leave rotation to the precise slider.
    const w=(isImage||it.kind==='sticker')?start.w*scale:start.w,h=start.h*scale;
    const cx=(points[0].x+points[1].x)/2,cy=(points[0].y+points[1].y)/2;
    queueTransform(it.id,{...(isImage?{width:size}:{fontSize:size}),
     x:Math.round(start.x+(start.w-w)/2+cx-start.cx),
     y:Math.round(start.y+(start.h-h)/2+cy-start.cy)});
   }
   return;
  }
  if(!drag.current||drag.current.pointer!==e.pointerId)return;
  const d=drag.current;
  if(doc.items.find(item=>item.id===d.id)?.locked)return;
  if(d.mode==='resize'){
   const it=doc.items.find(item=>item.id===d.id);if(!it)return;
   const size=Math.max(it.kind==='image'?80:24,Math.min(it.kind==='image'?2400:800,Math.round(d.startSize+p.x-d.x)));
   queueTransform(d.id,it.kind==='image'?{width:size}:{fontSize:size});
  }else queueTransform(d.id,{x:Math.round(d.ox+p.x-d.x),y:Math.round(d.oy+p.y-d.y)});
 };
 const up=(e:React.PointerEvent<HTMLCanvasElement>)=>{
  const start=pointerStart.current;
  if(start?.pointer===e.pointerId&&start.id!==null&&touches.current.size===1&&!pinch.current&&
     isStationaryTap(start,{x:e.clientX,y:e.clientY})){
   const next:LayerTap={id:start.id,at:e.timeStamp,x:e.clientX,y:e.clientY};
   if(isLayerDoubleTap(lastTap.current,next)){
    setSelected(start.id);setDeleteArmedId(start.id);setEditingText(null);lastTap.current=null;
   }else lastTap.current=next;
  }else lastTap.current=null;
  pointerStart.current=null;
  const pending=swipe.current;
  if(pending?.pointer===e.pointerId){
   if(e.pointerType!=='touch'){
    const p=locate(e),dx=p.x-pending.x;
    if(Math.abs(dx)>130&&Math.abs(p.y-pending.y)<Math.abs(dx)*1.1)goSlide(slide+(dx<0?1:-1));
   }
   swipe.current=null;
  }
  touches.current.delete(e.pointerId);if(drag.current?.pointer===e.pointerId)drag.current=null;if(touches.current.size<2)pinch.current=null;
 };
  // Download directly from original images at native-aware resolution, not from editor thumbnails.
 const renderExportSlide=async(i:number)=>{
  const sources=[doc.backgroundImages?.[i],...doc.items.filter(item=>item.kind==='image'&&item.src&&item.x<(i+1)*W&&item.x+item.width>i*W).map(item=>item.src)]
   .filter((src):src is string=>Boolean(src));
  let factor=2;
  for(const src of sources){
   try{const im=await loadImage(src);factor=Math.max(factor,Math.ceil(Math.max(im.naturalWidth/W,im.naturalHeight/H)))}
   catch{/* Renderer handles missing photos. */}
  }
  factor=Math.min(/iPad|iPhone|iPod/.test(navigator.userAgent)?2:4,factor);
  const out=document.createElement('canvas');out.width=W*factor;out.height=H*factor;
  const ctx=out.getContext('2d');if(!ctx)throw Error('Canvas');
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  await paint(ctx,factor,i*W,W);
  return out;
 };
 const downloadSlide=async(i:number)=>{setBusy(true);setMessage('Guardando copia antes de descargar…');try{if(!(await saveProject(true)))return;const cv=await renderExportSlide(i);const blob=await new Promise<Blob>((resolve,reject)=>cv.toBlob(b=>b?resolve(b):reject(Error('PNG')),'image/png'));const filename='carrusel-slide-'+String(i+1).padStart(2,'0')+'.png';const file=new File([blob],filename,{type:'image/png'});if(typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Slide '+(i+1)});setMessage('Elige «Guardar imagen» en el menú de tu teléfono.');return}catch(error){if((error as Error)?.name==='AbortError'){setMessage('No se guardó la imagen.');return}}}const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);setMessage('PNG descargado. En iPhone, si no aparece en Fotos, abre Archivos → Descargas y guarda la imagen.')}catch{setMessage('No se pudo preparar la imagen. Inténtalo de nuevo.')}finally{setBusy(false)}};
 const exportSlides=async()=>{
  if(busy)return;
  setBusy(true);setMessage('Guardando proyecto y preparando ZIP…');
  try{
   if(!(await saveProject(true)))return;
   const files:Record<string,Uint8Array>={};
   for(let i=0;i<doc.count;i++){
    const cv=await renderExportSlide(i);
    try{
     const blob=await new Promise<Blob>((resolve,reject)=>cv.toBlob(b=>b?resolve(b):reject(Error('PNG')),'image/png'));
     files['seamless-slide-'+String(i+1).padStart(2,'0')+'.png']=new Uint8Array(await blob.arrayBuffer());
    }finally{cv.width=1;cv.height=1;}
   }
   const zip=zipSync(files,{level:0});
   const url=URL.createObjectURL(new Blob([zip],{type:'application/zip'}));
   const a=document.createElement('a');a.download='carrusel-completo.zip';a.href=url;
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),90000);
   setMessage('Proyecto guardado. El ZIP contiene '+doc.count+' PNG individuales.');
  }catch{setMessage('No se pudo exportar el ZIP. El proyecto guardado sigue disponible.')}
  finally{setBusy(false);}
 };
 const prepareEditorial=async(draft:EditorialDraft)=>{
  if(busy){setMessage('Termina de procesar la foto antes de cambiar el carrusel.');return;}
  backgroundGeneration.current+=1;
  const hasWork=Boolean(activeProjectId||doc.items.length||Object.keys(doc.backgroundImages||{}).length||doc.count!==defaults.count||doc.background!==defaults.background);
  if(hasWork&&!(await saveProject()))return;
 const base=draft.brand==='tle'?'#FAF8F3':draft.brand==='lab'?'#FFF8EC':'#F7F3EB';
 const color=draft.brand==='tle'?'#191919':'#243348';
 const items:Item[]=draft.slides.map((txt,i)=>({id:++nextId.current,kind:'text',text:txt,textStyle:i===0?'hook':'title',x:i*W+90,y:i===0?310:360,width:900,fontSize:i===0?76:66,color}));
 setDoc({count:4,background:base,backgroundImages:{},items});setSlide(0);setSelected(null);setActiveProjectId(null);setRecentlyDeleted(null);setProjectName(draft.title);setActiveBrief(draft);setMessage('Guion cargado: 4 slides editables. Añade fotografías auténticas antes de exportar.');};
 const saveProject=async(silent=false):Promise<boolean>=>{
  const name=projectName.trim()||'Mi carrusel';
  const id=activeProjectId&&projects.some(p=>p.id===activeProjectId)?activeProjectId:String(Date.now());
  const next=[{id,name,updated:new Date().toLocaleDateString('es-US'),doc:JSON.parse(JSON.stringify(doc))},...projects.filter(p=>p.id!==id)];
  try{
   await persistDraft(doc);
   await writeEditorRecord(PROJECTS_KEY,next);
   setProjects(next);setActiveProjectId(id);setProjectName(name);
   setSaveStatus('Cambios guardados en este dispositivo');
   if(!silent)setMessage('Proyecto «'+name+'» guardado en este dispositivo.');
   return true;
  }catch{
   setSaveStatus('No se pudo guardar el carrusel.');
   setMessage('No se pudo guardar el proyecto. No cierres la página; comprueba el espacio del dispositivo.');
   return false;
  }
 };
 const startNewProject=async()=>{
   if(busy){setMessage('Termina de procesar la foto antes de crear otro proyecto.');return;}
   backgroundGeneration.current+=1;
   const hasWork=Boolean(activeProjectId||doc.items.length||Object.keys(doc.backgroundImages||{}).length||doc.count!==defaults.count||doc.background!==defaults.background);
   if(hasWork&&!(await saveProject()))return;
   setDoc({...defaults,backgroundImages:{},items:[]});
   setProjectName('Mi carrusel nuevo');setActiveProjectId(null);setSlide(0);
   setSelected(null);setEditingText(null);setRecentlyDeleted(null);
   setActiveBrief(null);setQuickPanel(null);viewport.current?.scrollTo({left:0});
   setMessage(hasWork?'El carrusel anterior quedó guardado en Mis proyectos. Ya puedes crear uno nuevo.':'Nuevo carrusel vacío. Puedes empezar a diseñar.');
 };
 const removeProject=async(id:string)=>{
  const project=projects.find(p=>p.id===id);
  if(!window.confirm('¿Eliminar el proyecto guardado «'+(project?.name||'')+'»? Esta acción no se puede deshacer.'))return;
  const next=projects.filter(p=>p.id!==id);
  try{
   await writeEditorRecord(PROJECTS_KEY,next);
   setProjects(next);if(activeProjectId===id)setActiveProjectId(null);
   setMessage('Proyecto guardado eliminado.');
  }catch{setMessage('No se pudo eliminar el proyecto.');}
 };
 const deleteElement=(id:number)=>{
   const index=doc.items.findIndex(it=>it.id===id);
   if(index<0)return;
   setRecentlyDeleted({item:{...doc.items[index]},index});
   setDoc(d=>({...d,items:d.items.filter(it=>it.id!==id)}));
   setSelected(null);setEditingText(null);setDeleteArmedId(null);lastTap.current=null;
   setMessage('Elemento eliminado. Pulsa «Deshacer» para recuperarlo.');
 };
 const undoDelete=()=>{
   if(!recentlyDeleted)return;
   const {item,index}=recentlyDeleted;
   setDoc(d=>{const items=[...d.items];items.splice(Math.min(index,items.length),0,item);return {...d,items}});
   setSelected(item.id);setRecentlyDeleted(null);setMessage('Elemento recuperado.');
 };
 const removeSlideBackground=()=>{
   setDoc(d=>{const backgroundImages={...d.backgroundImages};delete backgroundImages[slide];return {...d,backgroundImages}});
   setMessage('Foto de fondo quitada del slide '+(slide+1)+'.');
 };
 const duplicateSelected=()=>{if(selected===null)return;const item=doc.items.find(it=>it.id===selected);if(!item)return;const id=++nextId.current;setDoc(d=>({...d,items:[...d.items,{...item,id,x:item.x+55,y:item.y+55}]}));setSelected(id);setMessage('Elemento duplicado. Puedes mover la copia.')};
 const reorderSelected=(position:'front'|'back'|'forward'|'backward')=>{if(selected===null)return;setDoc(d=>{const items=[...d.items];const index=items.findIndex(it=>it.id===selected);if(index<0)return d;const [item]=items.splice(index,1);const target=position==='front'?items.length:position==='back'?0:position==='forward'?Math.min(index+1,items.length):Math.max(index-1,0);items.splice(target,0,item);return {...d,items}})};
 const removePhotoBackground=async()=>{
  if(busy)return;
  const item=doc.items.find(it=>it.id===selected);
  if(!item||item.kind!=='image'||!item.src)return;
  const generation=backgroundGeneration.current;
  setBusy(true);setBackgroundProgress('Preparando foto…');
  setMessage('Quitando el fondo con IA en este dispositivo. La primera vez se descargará el modelo.');
  try{
   // Uploaded photos have a data URL, and library assets may have an HTTPS URL.
   // If the user repeats removal, use the preserved ORIGINAL instead of a cutout.
   const source=item.originalBackupId
    ?await restoreOriginalPhoto(item.originalBackupId):item.src;
   const original=await originalBlobFromSource(source);
   const transparent=await cutoutOriginalPhoto(original,label=>{
    if(generation===backgroundGeneration.current)setBackgroundProgress(label);
   });
   if(generation!==backgroundGeneration.current)return;
   const backupId=item.originalBackupId||await storeOriginalPhoto(original);
   if(generation!==backgroundGeneration.current)return;
   setDoc(d=>({...d,items:d.items.map(photo=>
    photo.id===item.id&&photo.src===item.src
     ?{...photo,src:transparent,originalBackupId:backupId}:photo)}));
   setMessage('Fondo eliminado. La foto tiene transparencia y conserva su posición. Puedes recuperar la original.');
  }catch(err){
   if(generation===backgroundGeneration.current)
    setMessage((err instanceof Error?err.message:'No se pudo quitar el fondo.')+
     ' La foto original sigue intacta. Puedes probar «Quitar fondo liso» si tiene un color uniforme.');
  }finally{
   if(generation===backgroundGeneration.current){setBusy(false);setBackgroundProgress('');}
  }
 };
 const restorePhotoBackground=async()=>{
  if(busy)return;
  const item=doc.items.find(it=>it.id===selected);
  if(!item?.originalBackupId)return;
  const generation=backgroundGeneration.current;
  setBusy(true);setBackgroundProgress('Restaurando foto original…');
  try{
   const original=await restoreOriginalPhoto(item.originalBackupId);
   if(generation!==backgroundGeneration.current)return;
   setDoc(d=>({...d,items:d.items.map(photo=>
    photo.id===item.id&&photo.src===item.src
     ?{...photo,src:original,originalBackupId:undefined}:photo)}));
   setMessage('Foto original restaurada, sin cambiar su posición ni tamaño.');
  }catch(err){
   if(generation===backgroundGeneration.current)
    setMessage(err instanceof Error?err.message:'No se pudo recuperar la foto original.');
  }finally{
   if(generation===backgroundGeneration.current){setBusy(false);setBackgroundProgress('');}
  }
 };
  const removeSolidBackground=async()=>{const item=doc.items.find(it=>it.id===selected);if(!item||item.kind!=='image'||!item.src)return;setBusy(true);setMessage('Procesando fondo de color uniforme…');try{const im=await loadImage(item.src);const cv=document.createElement('canvas');const factor=Math.min(1,1600/Math.max(im.width,im.height));cv.width=Math.round(im.width*factor);cv.height=Math.round(im.height*factor);const ctx=cv.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('canvas');ctx.drawImage(im,0,0,cv.width,cv.height);const data=ctx.getImageData(0,0,cv.width,cv.height);const {width:w,height:h}=cv;const px=data.data;const corners=[0,(w-1)*4,(h-1)*w*4,((h-1)*w+w-1)*4];const rgb=[0,1,2].map(channel=>Math.round(corners.reduce((sum,i)=>sum+px[i+channel],0)/4));const visited=new Uint8Array(w*h);const queue=new Int32Array(w*h);let head=0,tail=0;const add=(i:number)=>{if(i<0||i>=w*h||visited[i])return;const p=i*4;const dist=Math.sqrt((px[p]-rgb[0])**2+(px[p+1]-rgb[1])**2+(px[p+2]-rgb[2])**2);if(dist>48)return;visited[i]=1;queue[tail++]=i};for(let x=0;x<w;x++){add(x);add((h-1)*w+x)}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1)}while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w);px[i*4+3]=0;if(x>0)add(i-1);if(x<w-1)add(i+1);if(y>0)add(i-w);if(y<h-1)add(i+w)}ctx.putImageData(data,0,0);const result=cv.toDataURL('image/png');update(item.id,{src:result});setMessage('Fondo uniforme eliminado. Revisa los bordes; las fotos con fondos complejos necesitan recorte avanzado.')}catch{setMessage('No se pudo quitar el fondo. Prueba con una foto de fondo liso.')}finally{setBusy(false)}};
 const current=doc.items.find(it=>it.id===selected);
 const editOnCanvas=()=>{if(current?.kind==='text')setEditingText(current.id)};
 const slideWidthPx=300*canvasZoom/100;
 const viewportScale=slideWidthPx/W;
 useEffect(()=>{viewport.current?.scrollTo({left:slide*slideWidthPx});},[canvasZoom]);
 const control:React.CSSProperties={padding:'11px 12px',border:'1px solid #ddd',borderRadius:12,background:'white',color:'#191919',fontSize:15};
 return <section style={{maxWidth:1100,margin:'auto',color:'#191919'}}>
  <h2>Carrusel seamless</h2><p style={{fontSize:13}}>Añade, mueve con el dedo y desliza entre slides. Abre solo las herramientas que necesites.</p>
  <section aria-label="Biblioteca de elementos de marcas" style={{margin:'14px 0',padding:13,border:'1px solid #D6D8DD',borderRadius:15,background:'#FAF8F3'}}>
   <strong style={{fontSize:17}}>Biblioteca visual · {GOLDEN_GRID_CAROUSEL_ASSETS.length+SOVA_CAROUSEL_ASSETS.length+EDITORIAL_STICKER_ASSETS.length} elementos</strong>
   <p style={{fontSize:12,color:'#66717A'}}>Todas las marcas en una sola galería. Toca una cinta, banner o detalle para colocarlo individualmente sobre el lienzo.</p>
   <BrandAssetLibrary onGolden={addGoldenGridAsset} onSova={addSovaAsset} onEditorial={addEditorialAsset}/>
  </section>
  <div role="group" aria-label="Proyecto actual" style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:8,padding:10,margin:'10px 0 14px',border:'1px solid #D7DFE2',borderRadius:14,background:'#FAF8F3'}}>
   <label style={{display:'flex',alignItems:'center',flex:'1 1 210px',gap:8,fontWeight:650,fontSize:13}}>Proyecto
    <input aria-label="Nombre del proyecto actual" value={projectName} onChange={e=>setProjectName(e.target.value)} style={{...control,minWidth:0,width:'100%',boxSizing:'border-box'}}/>
   </label>
   <button type="button" style={{...control,background:'#F2D85B',fontWeight:750}} onClick={()=>void saveProject()}>Guardar</button>
   <button type="button" style={{...control,fontWeight:750}} onClick={startNewProject}>+ Nuevo proyecto</button>
  </div>
  <details style={{marginBottom:14,border:'1px solid #D6D8DD',borderRadius:14,padding:14,background:'#F7F8FA'}}>
   <summary style={{cursor:'pointer',fontWeight:700,padding:'6px 0'}}>Carruseles pendientes ({EDITORIAL_DRAFTS.filter(d=>!hiddenDraftIds.includes(d.id)).length})</summary>
   <p style={{fontSize:13}}>Ocultar un borrador de esta lista no lo borra de Notion ni elimina proyectos guardados.</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
    <label style={{fontSize:13}}>Marca <select value={brandFilter} onChange={e=>setBrandFilter(e.target.value)} style={{...control,marginLeft:8}}><option value="todos">Todas</option><option value="tle">The Launch Era</option><option value="podcast">Podcast</option><option value="clase">Clase</option><option value="lab">Content Lab</option></select></label>
    {EDITORIAL_DRAFTS.some(d=>!hiddenDraftIds.includes(d.id))&&<button type="button" style={control} onClick={()=>{if(window.confirm('¿Quitar todos los borradores de pendientes? No se borrarán de Notion.'))setHiddenDraftIds(EDITORIAL_DRAFTS.map(d=>d.id))}}>Quitar todos de la lista</button>}
    {hiddenDraftIds.length>0&&<button type="button" style={control} onClick={()=>setHiddenDraftIds([])}>Restaurar ocultos ({hiddenDraftIds.length})</button>}
   </div>
   <div style={{display:'grid',gap:8,marginTop:12,maxHeight:340,overflowY:'auto'}}>
    {EDITORIAL_DRAFTS.filter(d=>!hiddenDraftIds.includes(d.id)&&(brandFilter==='todos'||d.brand===brandFilter)).map(d=><div key={d.id} style={{border:'1px solid #ddd',borderRadius:12,padding:12,background:'white'}}>
     <strong style={{display:'block',fontSize:14}}>{d.title}</strong>
     <span style={{fontSize:12,color:'#555'}}>{d.brand==='tle'?'The Launch Era':d.brand==='lab'?'Content Lab':d.brand==='clase'?'Clase':'Podcast'} · {d.date} · 4 slides</span>
     <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:9}}>
      <button type="button" style={{...control,background:'#F2D85B'}} onClick={()=>prepareEditorial(d)}>Preparar en editor</button>
      <button type="button" style={control} onClick={()=>setHiddenDraftIds(ids=>[...new Set([...ids,d.id])])}>Quitar de pendientes</button>
      <a href={d.url} target="_blank" rel="noopener noreferrer" style={{fontSize:13,alignSelf:'center'}}>Ver Notion</a>
     </div>
    </div>)}
    {!EDITORIAL_DRAFTS.some(d=>!hiddenDraftIds.includes(d.id))&&<p style={{fontSize:13}}>No quedan borradores visibles. Puedes restaurarlos cuando quieras.</p>}
   </div>
  </details>
  {activeBrief&&<details open style={{border:'1px solid #D6D8DD',borderRadius:12,padding:12,marginBottom:12}}><summary style={{cursor:'pointer',fontWeight:700}}>Guion activo · {activeBrief.title}</summary><p style={{fontSize:13}}><b>Dirección visual:</b> {activeBrief.direction}</p><p style={{fontSize:13}}><b>CTA:</b> {activeBrief.cta}</p><p style={{fontSize:12}}>Los textos están en las cuatro láminas y se pueden mover o editar. La portada requiere fotografía real.</p></details>}
  <details style={{marginBottom:12,border:'1px solid #ddd',borderRadius:14,padding:'10px 12px',background:'#FAF8F3'}}><summary style={{cursor:'pointer',fontWeight:700,padding:'6px 0'}}>Herramientas y botones · tocar para abrir o recoger</summary><div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:12,marginBottom:8,alignItems:'center'}}>
   <label>Slides <select aria-label="Cantidad de slides" style={control} value={doc.count} onChange={e=>setDoc(d=>({...d,count:Number(e.target.value)}))}>{[2,3,4,5,6,7,8,9,10].map(n=><option key={n}>{n}</option>)}</select></label>
   <label>Fondo <input aria-label="Color de fondo" type="color" value={doc.background} onChange={e=>setDoc(d=>({...d,background:e.target.value}))}/></label>
   <div style={{display:'flex',flexWrap:'wrap',gap:6,alignItems:'center'}}><button style={{...control,background:'#F2D85B',fontWeight:700}} onClick={()=>addText('paragraph')}>+ Texto libre</button><button style={control} onClick={()=>addText('hook')}>+ Hook</button><button style={control} onClick={()=>addText('title')}>+ Título</button><button style={control} onClick={()=>addText('caption')}>+ Texto pequeño</button></div>
   <input ref={photoInput} type="file" accept="image/*" onChange={onFile}  style={{position:'absolute',width:1,height:1,opacity:0}} aria-label="Elegir foto del dispositivo"/><button style={control} type="button" onClick={()=>{replacePhotoId.current=null;photoInput.current?.click()}}>+ Abrir fotos</button>
   <button style={{...control,background:'#F2D85B',fontWeight:700}} disabled={busy} onClick={()=>void downloadSlide(slide)}>{busy?'Preparando…':'Guardar slide '+(slide+1)+' en mi teléfono'}</button>
   <button style={control} disabled={busy} onClick={()=>void exportSlides()}>Descargar carrusel completo (ZIP)</button>
  </div></details>
  {current&&<details style={{marginBottom:10,padding:'8px 12px',border:'1px solid #D7DFE2',borderRadius:12,background:'#FAF8F3'}}><summary style={{cursor:'pointer',fontWeight:750,fontSize:13,padding:'7px 0'}}>Más ajustes · {current.kind==='text'?'Texto':current.kind==='image'?'Foto':'Sticker'}</summary><div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:10,marginTop:12}}>
    {current&&<label style={{display:'flex',alignItems:'center',gap:6}}>Girar <input aria-label="Girar elemento" type="range" min="-180" max="180" step="1" value={current.rotation||0} onChange={e=>update(current.id,{rotation:Number(e.target.value)})}/><output>{current.rotation||0}°</output></label>}{current.kind==='text'&&<><div style={{flex:'1 1 100%',padding:12,background:'#FAF8F3',borderRadius:12}}><label htmlFor="seamless-text-editor" style={{display:'block',fontWeight:700,marginBottom:6}}>Escribe o edita este texto</label><textarea ref={textEditor} id="seamless-text-editor" aria-label="Escribir texto de la diapositiva" rows={6} placeholder="Escribe aquí todo lo que quieras explicar. Puedes añadir párrafos y saltos de línea…" style={{...control,width:'100%',boxSizing:'border-box',resize:'vertical',fontFamily:'inherit'}} value={current.text||''} onChange={e=>update(current.id,{text:e.target.value})}/><div style={{fontSize:12,marginTop:5}}>Cada texto es independiente. El párrafo se ajusta automáticamente al ancho del bloque.</div><label style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>Ancho del texto <input aria-label="Ancho del párrafo" type="range" min="200" max="1000" step="20" value={current.width||900} onChange={e=>update(current.id,{width:Number(e.target.value)})}/></label></div><label>Tamaño <input aria-label="Tamaño de letra" type="range" min="28" max="220" value={current.fontSize} onChange={e=>update(current.id,{fontSize:Number(e.target.value)})}/></label><input aria-label="Color del texto" type="color" value={current.color} onChange={e=>update(current.id,{color:e.target.value})}/></>}
    {current.kind==='text'&&<div role="group" aria-label="Curvar texto" style={{flex:'1 1 100%',display:'grid',gap:9,padding:'10px 12px',border:'1px solid #E4DECF',borderRadius:12,background:'#FFFDF7'}}>
      <strong style={{fontSize:14}}>Efecto de texto · Curva circular</strong>
      <label style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap',fontSize:13}}>Curvatura
        <input type="range" min="-100" max="100" step="1" aria-label="Curvatura del texto"
          value={clampTextCurve(current.curve||0)} onChange={e=>update(current.id,{curve:Number(e.target.value)})}
          style={{flex:'1 1 160px',minWidth:120,accentColor:'#191919'}}/>
        <output aria-live="off">{clampTextCurve(current.curve||0)}%</output>
      </label>
      <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
        {([['Recto',0],['Arco suave',30],['Semicírculo',55],['Casi círculo',100],['Arco abajo',-55]] as const)
         .map(([name,value])=><button key={name} type="button"
           aria-pressed={clampTextCurve(current.curve||0)===value}
           style={{...control,padding:'9px 10px',background:clampTextCurve(current.curve||0)===value?'#F2D85B':'white'}}
           onClick={()=>update(current.id,{curve:value})}>{name}</button>)}
      </div>
      <label style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',fontSize:13}}>
       Espacio entre letras
       <input type="range" min="-8" max="30" step="1" aria-label="Espaciado de las letras"
        value={clampLetterSpacing(current.letterSpacing||0)}
        onChange={e=>update(current.id,{letterSpacing:Number(e.target.value)})}
        style={{flex:'1 1 150px',accentColor:'#191919'}}/>
       <output>{clampLetterSpacing(current.letterSpacing||0)}</output>
      </label>
      <small style={{color:'#647075'}}>Las letras siguen un círculo real. Ajusta la curva y la separación; los cambios también aparecen en los PNG.</small>
    </div>}
    {current.kind==='sticker'&&<label>Tamaño del sticker <input aria-label="Tamaño de sticker" type="range" min="40" max="600" value={current.fontSize} onChange={e=>update(current.id,{fontSize:Number(e.target.value)})}/></label>}
    {current.kind==='image'&&<><label>Ancho <input aria-label="Ancho de foto" type="range" min="100" max="1800" value={current.width} onChange={e=>update(current.id,{width:Number(e.target.value)})}/></label><button style={control} onClick={()=>{replacePhotoId.current=current.id;photoInput.current?.click()}} >Cambiar foto</button><label>Esquinas <input type="range" min="0" max="250" step="5" aria-label="Redondear esquinas" value={current.radius||0} onChange={e=>update(current.id,{radius:Number(e.target.value)})}/></label></>}
    <details style={{flex:'1 1 100%'}}><summary style={{cursor:'pointer',padding:'8px 0'}}>Ajustes precisos (opcional)</summary><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><label>Posición horizontal <input aria-label="Mover elemento horizontalmente" type="range" min="0" max={doc.count*W} value={Math.max(0,current.x)} onChange={e=>update(current.id,{x:Number(e.target.value)})}/></label><label>Posición vertical <input aria-label="Mover elemento verticalmente" type="range" min="0" max={H} value={Math.max(0,current.y)} onChange={e=>update(current.id,{y:Number(e.target.value)})}/></label></div></details>
    <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center',background:'#FAF8F3',padding:8,borderRadius:12,flex:'1 1 100%'}}><strong style={{marginRight:6}}>Elemento seleccionado:</strong><button style={control} onClick={()=>reorderSelected('front')}>Al frente</button><button style={control} onClick={()=>reorderSelected('forward')}>Adelante</button><button style={control} onClick={()=>reorderSelected('backward')}>Atrás</button><button style={control} onClick={()=>reorderSelected('back')}>Al fondo</button><button style={{...control,background:'#F2D85B'}} onClick={duplicateSelected}>Duplicar</button><button type="button" style={{...control,background:current.locked?'#DCECF4':'#F2D85B'}} onClick={()=>toggleLock(current.id)}>{current.locked?'🔓 Desbloquear':'🔒 Bloquear'}</button></div>
    {current.kind==='image'&&<div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
     <button type="button" style={{...control,background:'#F2D85B',fontWeight:750}} disabled={busy} onClick={()=>void removePhotoBackground()}>Quitar fondo con IA</button>
     {current.originalBackupId&&<button type="button" style={control} disabled={busy} onClick={()=>void restorePhotoBackground()}>Restaurar foto original</button>}
     <button type="button" style={control} disabled={busy} onClick={()=>void removeSolidBackground()}>Quitar fondo liso</button>
    </div>}
    <button type="button" style={{...control,borderColor:'#B35C58',color:'#9B3835'}} onClick={()=>deleteElement(current.id)}>Eliminar elemento</button>
   </div></details>}
  <details style={{margin:'10px 0'}}><summary style={{cursor:'pointer',fontWeight:700,fontSize:12}}>Textos de este slide · abrir para seleccionar</summary><div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',margin:'12px 0'}}><strong>Textos del slide {slide+1}:</strong>{doc.items.filter(it=>it.kind==='text'&&Math.floor(it.x/W)===slide).map((it,i)=><button key={it.id} style={{...control,background:selected===it.id?'#F2D85B':'white',maxWidth:190,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} onClick={()=>{setSelected(it.id);setTimeout(()=>textEditor.current?.focus(),30)}}>{it.text?.trim()||'Texto nuevo '+(i+1)}</button>)}<button style={control} onClick={()=>addText('paragraph')}>+ Nuevo texto</button></div></details>
  <details style={{margin:'12px 0',border:'1px solid #ddd',borderRadius:14,padding:'10px 12px'}}><summary style={{cursor:'pointer',fontWeight:700,padding:'6px 0'}}>Fondos, stickers y capas · abrir / recoger</summary><div style={{display:'flex',gap:8,margin:'12px 0',flexWrap:'wrap'}}>{(['fondos','stickers','capas'] as const).map(tab=><button key={tab} style={{...control,background:panel===tab?'#F2D85B':'white'}} onClick={()=>setPanel(tab)}>{tab==='fondos'?'Fondos':tab==='stickers'?'Stickers':'Capas'}</button>)}</div>
  {panel==='fondos'&&doc.backgroundImages?.[slide]&&<button type="button" style={{...control,borderColor:'#B35C58',color:'#9B3835'}} onClick={removeSlideBackground}>Quitar foto de fondo del slide {slide+1}</button>}
  {panel==='fondos'&&<div style={{display:'flex',gap:8,overflowX:'auto',padding:'8px 0 18px'}}>{LAB_BACKGROUNDS.map(([name,color])=><button key={name} title={name} onClick={()=>setDoc(d=>({...d,background:color}))} style={{minWidth:96,border:'1px solid #ddd',borderRadius:12,padding:8,background:'white',color:'#191919'}}><span style={{display:'block',height:62,borderRadius:8,background:color,border:'1px solid #ddd'}}/>{name}</button>)}</div>}
  {panel==='stickers'&&<div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>{LAB_STICKERS.map((emoji,i)=><button key={i} aria-label={'Añadir sticker '+emoji} onClick={()=>addSticker(emoji)} style={{...control,fontSize:28}}>{emoji}</button>)}</div>}
  {(panel==='fondos'||panel==='stickers')&&<div style={{margin:'0 0 14px'}}><strong style={{display:'block',marginBottom:8}}>Biblioteca original del Content Lab · {panel==='fondos'?'Fondos':'Stickers'}</strong>{libraryStatus&&<p role="status" style={{fontSize:13}}>{libraryStatus}</p>}<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:10,maxHeight:350,overflowY:'auto',padding:4}}>{privateAssets.filter(asset=>asset.category===(panel==='fondos'?'background':'sticker')).map(asset=><button key={asset.id} type="button" onClick={()=>{setLibraryStatus('Añadiendo imagen…');void keepStudioLabImage(asset.url).then(src=>{panel==='fondos'?setPrivateBackground(src):addPrivateSticker(src);setLibraryStatus('')}).catch(err=>setLibraryStatus(err instanceof Error?err.message:'No se pudo añadir la imagen.'))}} style={{border:'1px solid #ddd',background:'white',borderRadius:12,padding:6,color:'#191919',textAlign:'center',cursor:'pointer'}}><img src={asset.url} loading="lazy" alt="" style={{display:'block',width:'100%',height:86,objectFit:'contain',borderRadius:8}}/><span style={{fontSize:11,display:'block',marginTop:4}}>{asset.name}</span></button>)}{LAB_ASSETS.filter(asset=>asset.category===(panel==='fondos'?'background':'sticker')).map(asset=><button key={asset.id} type="button" onClick={()=>panel==='fondos'?setLabBackground(asset.file):addLabSticker(asset.file)} style={{border:'1px solid #ddd',background:'white',borderRadius:12,padding:6,color:'#191919',textAlign:'center',cursor:'pointer'}}><img src={labUrl(asset.file)} loading="lazy" alt="" style={{display:'block',width:'100%',height:86,objectFit:'contain',borderRadius:8}}/><span style={{fontSize:11,display:'block',marginTop:4}}>{asset.name}</span></button>)}</div></div>}
  {panel==='capas'&&<div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:18}}>{doc.items.map(it=><button key={it.id} style={{...control,background:selected===it.id?'#F2D85B':'white'}} onClick={()=>setSelected(it.id)}>{it.locked?'🔒 ':''}{it.kind==='image'?'📷 Foto':(it.text||'Texto sin escribir').slice(0,42)}</button>)}</div>}
  </details>
  <section aria-label="Navegador de slides" style={{margin:'12px 0',padding:'12px',border:'1px solid #D7DFE2',borderRadius:16,background:'#FAF8F3'}}>
   <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:10}}><div><strong style={{fontSize:16}}>Slide {slide+1} de {doc.count}</strong><div style={{fontSize:12,color:'#53636B'}}>Selecciona, mueve o ajusta con dos dedos</div></div><div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}><label style={{fontSize:12}}>Zoom <select aria-label="Zoom del lienzo" value={canvasZoom} onChange={e=>setCanvasZoom(Number(e.target.value) as 75|100|125|150)} style={{...control,padding:'7px 4px',fontSize:12}}><option value={75}>75%</option><option value={100}>100%</option><option value={125}>125%</option><option value={150}>150%</option></select></label><button style={{...control,padding:'8px 12px'}} onClick={()=>goSlide(slide-1)} disabled={slide===0} aria-label="Slide anterior">‹</button><button style={{...control,padding:'8px 12px'}} onClick={()=>goSlide(slide+1)} disabled={slide>=doc.count-1} aria-label="Slide siguiente">›</button></div></div>
   <div style={{display:'grid',gridTemplateColumns:'repeat('+Math.min(doc.count,5)+',minmax(0,1fr))',gap:7}}>{Array.from({length:doc.count},(_,i)=>{const texts=doc.items.filter(it=>it.kind==='text'&&Math.floor(it.x/W)===i);const photos=doc.items.filter(it=>it.kind==='image'&&Math.floor(it.x/W)===i);return <button key={i} type="button" aria-current={slide===i?'step':undefined} aria-label={'Ir al slide '+(i+1)} onClick={()=>goSlide(i)} style={{border:slide===i?'2px solid #244B5B':'1px solid #D7DFE2',background:slide===i?'#E6F0F4':'#fff',color:'#191919',borderRadius:10,padding:'10px 3px',minWidth:0,textAlign:'center'}}><strong style={{display:'block',fontSize:14}}>{i+1}</strong><span style={{display:'block',fontSize:10,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{texts[0]?.text?.trim().slice(0,14)|| (photos.length?'Foto':'Vacío')}</span></button>})}</div>
  </section>
  {current?.kind==='image'&&<div role="toolbar" aria-label="Fondo de foto seleccionada" style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:8}}>
   <button type="button" style={{...control,background:'#F2D85B',fontWeight:750}} disabled={busy}
    onClick={()=>void removePhotoBackground()}>{busy?'Procesando…':'Quitar fondo'}</button>
   {current.originalBackupId&&<button type="button" style={control} disabled={busy} onClick={()=>void restorePhotoBackground()}>Restaurar original</button>}
   {busy&&backgroundProgress&&<span role="status" style={{fontSize:12}}>{backgroundProgress}</span>}
  </div>}
    {(current||recentlyDeleted)&&<div role="toolbar" aria-label="Edición táctil" style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:8}}>
   {current&&<>
   <button type="button" style={{...control,background:current.locked?'#DCECF4':'#FFF4C4',fontWeight:750}} onClick={()=>toggleLock(current.id)}>{current.locked?'🔓 Desbloquear elemento':'🔒 Bloquear elemento'}</button>
   {current.kind==='text'&&<button type="button" style={{...control,background:'#191919',color:'white'}} onClick={editOnCanvas}>✎ Editar texto aquí</button>}
   {current.kind==='text'&&<div role="group" aria-label="Curvar texto seleccionado" style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:7,padding:'6px 9px',border:'1px solid #E4DECF',borderRadius:12,background:'#FFFDF7'}}>
    <label style={{fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:6}}>Curvar texto
      <input type="range" min="-100" max="100" step="1" aria-label="Curvar letras"
       value={clampTextCurve(current.curve||0)} onChange={e=>update(current.id,{curve:Number(e.target.value)})}
       style={{width:125,accentColor:'#191919'}}/>
    </label>
    <output style={{fontSize:12,minWidth:34}}>{clampTextCurve(current.curve||0)}%</output>
    <button type="button" aria-label="Arco hacia arriba" title="Arco hacia arriba" style={{...control,padding:'8px 10px'}} onClick={()=>update(current.id,{curve:65})}>∩</button>
    <button type="button" aria-label="Arco hacia abajo" title="Arco hacia abajo" style={{...control,padding:'8px 10px'}} onClick={()=>update(current.id,{curve:-65})}>∪</button>
    <button type="button" style={{...control,padding:'8px 10px'}} onClick={()=>update(current.id,{curve:0})}>Recto</button>
    <label style={{display:'flex',alignItems:'center',gap:7,fontSize:12,flex:'1 1 180px'}}>
     Separación <input type="range" min="-8" max="30" step="1" aria-label="Separación entre letras"
      value={clampLetterSpacing(current.letterSpacing||0)}
      onChange={e=>update(current.id,{letterSpacing:Number(e.target.value)})}
      style={{width:100,flex:'1 1 90px',accentColor:'#191919'}}/>
     <output>{clampLetterSpacing(current.letterSpacing||0)}</output>
    </label>
    </div>}
   <button type="button" style={control} onClick={()=>update(current.id,current.kind==='image'?{width:Math.round(current.width*.85)}:{fontSize:Math.round(current.fontSize*.85)})}>− Reducir</button>
   <button type="button" style={control} onClick={()=>update(current.id,current.kind==='image'?{width:Math.round(current.width*1.15)}:{fontSize:Math.round(current.fontSize*1.15)})}>＋ Agrandar</button>
   <button type="button" style={{...control,borderColor:'#B35C58',color:'#9B3835',fontWeight:750}} onClick={()=>deleteElement(current.id)}>× Borrar {current.kind==='text'?'texto':current.kind==='image'?'foto':'sticker'}</button>
   <button type="button" style={control} onClick={()=>{setSelected(null);setEditingText(null);setDeleteArmedId(null);lastTap.current=null}}>Listo</button>
   </>}
   {recentlyDeleted&&<button type="button" style={control} onClick={undoDelete}>Deshacer eliminación</button>}
   </div>}
  <div ref={viewport} onTouchStartCapture={onViewportTouchStart} onTouchEndCapture={onViewportTouchEnd} style={{overflowX:'auto',borderRadius:16,border:'1px solid #ddd',background:'#eaeaea',padding:8,scrollSnapType:'x proximity',overscrollBehaviorX:'contain'}}>
   <div style={{position:'relative',width:doc.count*slideWidthPx,maxWidth:'none'}}>
   <canvas ref={canvas} data-carousel-canvas="true" onPointerDown={down} onPointerMove={move}
    onPointerUp={up} onPointerCancel={e=>{touches.current.delete(e.pointerId);if(drag.current?.pointer===e.pointerId)drag.current=null;if(touches.current.size<2)pinch.current=null;if(swipe.current?.pointer===e.pointerId)swipe.current=null;if(pointerStart.current?.pointer===e.pointerId)pointerStart.current=null;lastTap.current=null;setDeleteArmedId(null)}}
    style={{display:'block',width:'100%',height:'auto',maxWidth:'none',touchAction:'none',cursor:'grab'}}
    aria-label="Lienzo continuo del carrusel: toca para seleccionar y mover; toca dos veces para mostrar la cruz de eliminar"/>
   {current&&deleteArmedId===current.id&&<button type="button" data-carousel-delete="true"
    aria-label={'Eliminar '+(current.kind==='text'?'texto':current.kind==='image'?'foto':'sticker')+' seleccionado'}
    title="Eliminar elemento" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();deleteElement(current.id)}}
    style={{position:'absolute',left:Math.max(0,Math.min(doc.count*slideWidthPx-42,(current.x+itemBounds(current).w)*viewportScale-21)),
     top:Math.max(0,current.y*viewportScale-21),width:42,height:42,borderRadius:'50%',
     border:'2px solid #fff',background:'#191919',color:'#fff',fontSize:26,fontWeight:650,
     display:'grid',placeItems:'center',cursor:'pointer',zIndex:7,boxShadow:'0 2px 10px #0005',
     touchAction:'manipulation'}}>×</button>}
   {editingText!==null&&current?.id===editingText&&current.kind==='text'&&<textarea ref={canvasTextRef}
    aria-label="Escribir directamente sobre el carrusel" rows={3} value={current.text||''}
    onChange={e=>update(current.id,{text:e.target.value})} onBlur={()=>setEditingText(null)}
    onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()}
    style={{position:'absolute',left:current.x*viewportScale,top:current.y*viewportScale,
     width:Math.max(100,current.width*viewportScale),height:Math.max(52,itemBounds(current).h*viewportScale+14),
     maxWidth:'none',font:'700 '+current.fontSize*viewportScale+'px/1.3 Arial,sans-serif',
     color:current.color,background:'rgba(250,248,243,.95)',border:'2px solid #447B94',borderRadius:6,
     padding:3,resize:'none',zIndex:5,boxShadow:'0 2px 12px #0002'}}/>}
   </div>
  </div>
  <div role="toolbar" aria-label="Herramientas táctiles del carrusel seamless"
    style={{display:'grid',gridTemplateColumns:'repeat(6,minmax(0,1fr))',gap:4,padding:5,position:'sticky',
      bottom:'auto',zIndex:10,border:'1px solid #dce5e5',
      borderRadius:15,background:'#fff',boxShadow:'0 -4px 16px #142c3c20'}}>
    {([
      {label:'Fotos',action:()=>{replacePhotoId.current=null;photoInput.current?.click()}},
      {label:'Texto',action:()=>addText('paragraph')},
      {label:'Elementos',action:()=>setQuickPanel(p=>p==='elementos'?null:'elementos')},
       {label:'Stickers',action:()=>setQuickPanel(p=>p==='stickers'?null:'stickers')},
      {label:'Capas',action:()=>setQuickPanel(p=>p==='capas'?null:'capas')},
      {label:'Fondo',action:()=>setQuickPanel(p=>p==='fondos'?null:'fondos')}
    ]).map((tool,i)=><button type="button" key={tool.label} onClick={tool.action}
      aria-pressed={i>1?quickPanel===(tool.label==='Fondo'?'fondos':tool.label.toLowerCase()):undefined}
      style={{border:0,background:i>1&&quickPanel===(tool.label==='Fondo'?'fondos':tool.label.toLowerCase())?'#e9f3f5':'transparent',minHeight:49,
        display:'grid',placeItems:'center',borderRadius:10,padding:5,fontSize:12,fontWeight:750,color:'#234554',
        touchAction:'manipulation'}}>{tool.label}</button>)}
  </div>
  {quickPanel&&<div role="region" aria-label={'Opciones de '+quickPanel}
    style={{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'calc(133px + env(safe-area-inset-bottom))',
      zIndex:1800,maxHeight:'min(36dvh,340px)',overflowY:'auto',maxWidth:700,width:'calc(100vw - 24px)',padding:12,
      background:'#FAF8F3',border:'1px solid #cbdce2',borderRadius:16,boxShadow:'0 -7px 20px #172e3b40'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:10}}>
      <strong style={{fontSize:13}}>{quickPanel==='fondos'?'Elegir fondo':quickPanel==='stickers'?'Elegir sticker':quickPanel==='elementos'?'Biblioteca de elementos':'Seleccionar capa'}</strong>
      <button type="button" onClick={()=>setQuickPanel(null)} aria-label="Cerrar panel"
        style={{...control,minWidth:42,minHeight:42,padding:5}}>×</button>
    </div>
    {quickPanel==='elementos'&&<BrandAssetLibrary compact onGolden={addGoldenGridAsset} onSova={addSovaAsset} onEditorial={addEditorialAsset}/>}
    {quickPanel==='capas'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:7}}>
      {[...doc.items].reverse().map(it=><button type="button" key={it.id}
        style={{...control,minWidth:0,padding:7,fontSize:12,overflow:'hidden',textOverflow:'ellipsis'}}
        onClick={()=>{setSelected(it.id);goSlide(Math.max(0,Math.min(doc.count-1,Math.floor(it.x/W))),true);setQuickPanel(null)}}>
         {it.kind==='image'&&it.src?<img src={it.src} loading="lazy" alt=""
           style={{display:'block',width:'100%',height:56,objectFit:'contain'}}/>:
           (it.text||'Sticker').slice(0,40)}
      </button>)}
    </div>}
    {quickPanel==='fondos'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(96px,1fr))',gap:8}}>
     {doc.backgroundImages?.[slide]&&<button type="button" style={{...control,gridColumn:'1 / -1',borderColor:'#B35C58',color:'#9B3835'}} onClick={()=>{removeSlideBackground();setQuickPanel(null)}}>× Quitar foto de fondo de este slide</button>}
      {LAB_BACKGROUNDS.map(([name,color])=><button type="button" key={name} onClick={()=>{setDoc(d=>({...d,background:color}));setQuickPanel(null)}}
        style={{...control,fontSize:11,minHeight:80,padding:6}}>
        <span style={{display:'block',height:42,background:color,borderRadius:7,border:'1px solid #ddd'}}/>{name}
      </button>)}
      {privateAssets.filter(asset=>asset.category==='background').map(asset=><button type="button" key={asset.id}
        onClick={()=>{void keepStudioLabImage(asset.url).then(src=>setPrivateBackground(src)).catch(err=>setLibraryStatus(err instanceof Error?err.message:'No se pudo añadir el fondo'));setQuickPanel(null)}}
        style={{...control,padding:5,fontSize:11}}>
        <img src={asset.url} loading="lazy" alt="" style={{display:'block',width:'100%',height:58,objectFit:'contain'}}/>{asset.name}
      </button>)}
      {LAB_ASSETS.filter(asset=>asset.category==='background').map(asset=><button type="button" key={asset.id}
        onClick={()=>{setLabBackground(asset.file);setQuickPanel(null)}} style={{...control,padding:5,fontSize:11}}>
        <img src={labUrl(asset.file)} loading="lazy" alt="" style={{display:'block',width:'100%',height:58,objectFit:'contain'}}/>{asset.name}
      </button>)}
    </div>}
    {quickPanel==='stickers'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(68px,1fr))',gap:8}}>
      {LAB_STICKERS.map((emoji,i)=><button type="button" key={i} onClick={()=>{addSticker(emoji);setQuickPanel(null)}}
        style={{...control,minHeight:60,fontSize:27,padding:5}}>{emoji}</button>)}
      {[...privateAssets.filter(asset=>asset.category==='sticker').map(asset=>({key:asset.id,name:asset.name,url:asset.url,file:'',remote:true})),
        ...LAB_ASSETS.filter(asset=>asset.category==='sticker').map(asset=>({key:asset.id,name:asset.name,url:labUrl(asset.file),file:asset.file,remote:false}))].map(asset=><button type="button" key={asset.key}
          onClick={()=>{if(asset.remote)void keepStudioLabImage(asset.url).then(src=>addPrivateSticker(src)).catch(err=>setLibraryStatus(err instanceof Error?err.message:'No se pudo añadir'));
            else if(asset.file)addLabSticker(asset.file);setQuickPanel(null)}}
          style={{...control,padding:4,fontSize:10,minWidth:0}}>
          <img src={asset.url} loading="lazy" alt="" style={{display:'block',width:'100%',height:59,objectFit:'contain'}}/>{asset.name}
        </button>)}
    </div>}
    {libraryStatus&&<small role="status">{libraryStatus}</small>}
  </div>}
  <p style={{fontSize:12,fontWeight:600}}>Un toque: selecciona y mueve. Dos toques rápidos sobre el mismo elemento: aparece la × para borrarlo. Toca fuera y la × desaparece. Selecciona un texto para curvarlo como un círculo y ajustar la separación entre letras.</p>
  <p style={{fontSize:13}}>Arrastra los elementos con el dedo o el mouse. Desliza sobre un espacio vacío para cambiar de slide. Usa dos dedos sobre el elemento para cambiar su tamaño; para girarlo utiliza «Más ajustes». Los botones Anterior y Siguiente son opcionales.</p>
  <details style={{marginTop:22,padding:16,border:'1px solid #ddd',borderRadius:16,background:'#FAF8F3'}}><summary style={{cursor:'pointer',fontWeight:700}}>Mis proyectos · abrir / recoger</summary><p style={{fontSize:13}}>Guarda distintas versiones y vuelve a editarlas cuando quieras en este dispositivo.</p><div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}><input aria-label="Nombre del proyecto" value={projectName} onChange={e=>setProjectName(e.target.value)} style={{...control,flex:'1 1 180px'}}/><button style={{...control,background:'#F2D85B'}} onClick={()=>void saveProject()}>Guardar proyecto</button><button style={control} onClick={startNewProject}>+ Nuevo proyecto</button></div>{projects.length===0?<p style={{fontSize:13}}>Todavía no hay proyectos guardados.</p>:<div style={{display:'grid',gap:8}}>{projects.map(p=><div key={p.id} style={{display:'flex',gap:8,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',background:'white',padding:10,borderRadius:12}}><div><strong>{p.name}</strong><div style={{fontSize:12,opacity:.7}}>{p.doc.count} slides · {p.updated}</div></div><div style={{display:'flex',gap:6}}><button style={control} onClick={()=>{if(busy)return;backgroundGeneration.current+=1;setDoc(JSON.parse(JSON.stringify(p.doc)));setProjectName(p.name);setActiveProjectId(p.id);setSlide(0);setSelected(null);setEditingText(null);setActiveBrief(null);setRecentlyDeleted(null);viewport.current?.scrollTo({left:0});setMessage('Proyecto «'+p.name+'» abierto para editar.')}}>Editar</button><button style={control} onClick={()=>{if(busy)return;backgroundGeneration.current+=1;setDoc(JSON.parse(JSON.stringify(p.doc)));setProjectName(p.name+' copia');setActiveProjectId(null);setSlide(0);setSelected(null);setEditingText(null);setActiveBrief(null);setRecentlyDeleted(null);viewport.current?.scrollTo({left:0});setMessage('Copia abierta. Pulsa Guardar proyecto para conservarla.')}}>Duplicar</button><button style={control} onClick={()=>void removeProject(p.id)}>Eliminar proyecto</button></div></div>)}</div>}</details>
  <p role="status" aria-live="polite">{message}</p><p style={{fontSize:13,opacity:.7}}>Los PNG se exportan desde las fotos originales, hasta 4× la resolución base. La vista previa no se utiliza para descargar. El carrusel se guarda automáticamente en este dispositivo. El ZIP contiene las imágenes individuales; todavía no se sincroniza entre dispositivos.</p>
 </section>;
}

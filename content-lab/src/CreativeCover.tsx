
import React,{useEffect,useState} from 'react';
import {LoaderCircle,ImagePlus} from 'lucide-react';

type Post={title:string;hook:string;cta:string;template:string};
type Brand={name:string;color:string;background:string};
const old=['Editorial','Spotlight','Split','Bold'];
const newNames=[
  'Editorial Hero','Bold Typography','Macro Texture','Lifestyle Scene','Playful Props',
  'Hands-on Editorial','High Contrast','Minimal Premium','Campaign Finale','Color Block',
  'Magazine Cover','Arch Frame','Product Spotlight','Floating Product','Typography Poster',
  'Negative Space','Diagonal Composition','Soft Luxury','Graphic Cutout','Story Card'
];
const readColor=(c:string)=>{
  if(!/^#[0-9a-f]{6}$/i.test(c))return '#181818';
  const r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);
  return r*.299+g*.587+b*.114>150?'#191919':'#FFFFFF';
};
export async function makeCover(post:Post,brand:Brand,src?:string){
  const can=document.createElement('canvas');can.width=1080;can.height=1350;const c=can.getContext('2d');
  if(!c)throw Error('Canvas no disponible');
  const a=brand.color,p=brand.background,ink=readColor(p),onA=readColor(a);
  const fill=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
  const small=(text:string,x:number,y:number,color:string,size=24)=>{
    c.fillStyle=color;c.font='700 '+size+'px Arial,sans-serif';c.fillText((text||'').slice(0,65),x,y);
  };
  const headline=(text:string,x:number,y:number,w:number,size:number,maxLines:number,color:string)=>{
    let lines:string[]=[],fs=size;
    for(let z=0;z<15;z++){
      c.font='bold '+fs+'px Georgia, serif';lines=[];let line='';
      for(const word of String(text||'Your story begins here').split(/\s+/)){
        const t=line?line+' '+word:word;
        if(c.measureText(t).width>w&&line){lines.push(line);line=word}else line=t;
      }
      if(line)lines.push(line);
      if(lines.length<=maxLines&&lines.every(line=>c.measureText(line).width<=w))break;
      fs=Math.max(34,fs-5);
    }
    c.fillStyle=color;c.font='bold '+fs+'px Georgia,serif';
    lines.slice(0,maxLines).forEach((s,i)=>c.fillText(s,x,y+i*fs*1.18));
  };
  const photo=async(x:number,y:number,w:number,h:number,contain=false)=>{
    if(!src)return;
    const im=new Image();im.src=src;await new Promise<void>((ok,bad)=>{im.onload=()=>ok();im.onerror=()=>bad(Error('No se pudo cargar la foto'))});
    const s=contain?Math.min(w/im.width,h/im.height):Math.max(w/im.width,h/im.height);
    const iw=im.width*s,ih=im.height*s;
    c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
    c.drawImage(im,x+(w-iw)/2,y+(h-ih)/2,iw,ih);c.restore();
  };
  const blob=(x:number,y:number,r:number,color:string)=>{
    c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();
  };
  const layout=old.indexOf(post.template)>=0?old.indexOf(post.template):4+Math.max(0,newNames.indexOf(post.template));
  const headlineText=post.hook||'One idea. Many possibilities.';
  fill(0,0,1080,1350,p);
  switch(layout){
    case 0:case 4: // Editorial hero
      small(brand.name.toUpperCase(),72,135,ink);
      fill(72,175,144,8,a);headline(headlineText,72,330,925,102,5,ink);
      fill(625,745,395,430,a);await photo(625,745,395,430);
      small(post.cta,72,1280,ink,24);break;
    case 1:case 16: // Spotlight, product spotlight
      fill(0,0,1080,815,a);await photo(0,0,1080,815);
      small(brand.name.toUpperCase(),70,888,ink);headline(headlineText,70,995,920,75,3,ink);small(post.cta,70,1290,ink);break;
    case 2:case 20: // Split / negative space
      fill(0,0,520,1350,a);await photo(520,0,560,1350);
      small(brand.name.toUpperCase(),60,130,onA);headline(headlineText,60,350,400,79,7,onA);small(post.cta,60,1250,onA,22);break;
    case 3:case 5:case 18: // bold typography
      fill(0,0,1080,1350,a);c.strokeStyle=onA;c.lineWidth=3;c.strokeRect(65,68,950,1210);
      small(brand.name.toUpperCase(),103,160,onA);
      headline(headlineText,103,430,850,104,6,onA);
      await photo(630,850,320,260);
      small(post.cta,103,1215,onA,23);break;
    case 6:case 19: // macro
      fill(0,0,1080,1350,a);await photo(0,0,1080,1350);
      fill(0,915,1080,435,p);
      small(brand.name.toUpperCase(),70,985,ink);
      headline(headlineText,70,1105,920,73,2,ink);small(post.cta,70,1290,ink,20);break;
    case 7:case 8: // lifestyle or props
      fill(45,55,990,905,a);await photo(45,55,990,905);
      small(brand.name.toUpperCase(),65,1015,ink);
      headline(headlineText,65,1110,950,73,2,ink);
      small(post.cta,65,1290,ink,22);break;
    case 9: // hands on
      fill(0,0,1080,1350,a);await photo(0,0,1080,990);
      fill(0,990,1080,360,p);headline(headlineText,65,1090,935,76,2,ink);
      small(brand.name.toUpperCase(),65,1290,ink,22);break;
    case 10:case 13: // contrast
      fill(0,0,1080,1350,'#191919');await photo(170,80,740,725);
      headline(headlineText,72,965,930,90,3,'#FFFFFF');
      small(brand.name.toUpperCase(),72,1270,'#FFFFFF',24);break;
    case 11:case 21: // minimal premium
      small(brand.name.toUpperCase(),65,130,ink);fill(130,215,820,815,a);
      await photo(150,240,780,760,true);
      headline(headlineText,70,1140,935,70,2,ink);small(post.cta,70,1270,ink);break;
    case 12: // campaign finale
      fill(0,0,1080,1350,a);blob(735,850,365,p);await photo(490,570,530,570);
      headline(headlineText,65,300,950,100,4,onA);
      small(brand.name.toUpperCase(),65,1200,onA);break;
    case 14: // colorblock
      fill(0,0,1080,650,a);fill(0,650,1080,700,p);
      await photo(440,450,590,660);
      headline(headlineText,65,235,870,94,3,onA);
      small(post.cta,65,1280,ink);break;
    case 15: // magazine cover
      fill(0,0,1080,1350,a);await photo(0,0,1080,1350);
      fill(50,50,980,130,p);
      small(brand.name.toUpperCase(),80,135,ink,49);
      fill(45,965,990,315,p);headline(headlineText,75,1080,930,77,2,ink);
      small(post.cta,75,1255,ink,21);break;
    case 17: // arch frame
      fill(0,0,1080,1350,a);
      c.save();c.beginPath();c.moveTo(110,1160);c.lineTo(110,480);
      c.arc(540,480,430,Math.PI,0);c.lineTo(970,1160);c.closePath();c.clip();
      await photo(110,40,860,1120);c.restore();
      small(brand.name.toUpperCase(),85,120,ink);
      fill(0,1165,1080,185,p);headline(headlineText,65,1245,950,60,1,ink);break;
    case 22: // diagonal
      fill(0,0,1080,1350,a);
      c.save();c.beginPath();c.moveTo(320,0);c.lineTo(1080,0);c.lineTo(1080,1350);c.lineTo(0,1350);c.closePath();c.clip();
      await photo(0,0,1080,1350);c.restore();
      headline(headlineText,65,320,680,86,5,onA);break;
    case 23: // soft luxury
      fill(0,0,1080,1350,p);blob(780,470,280,a);await photo(390,240,620,780,true);
      small(brand.name.toUpperCase(),70,130,ink);
      headline(headlineText,70,1130,920,76,2,ink);small(post.cta,70,1280,ink);break;
    default: // special photo card
      fill(0,0,1080,1350,a);fill(75,75,930,1200,p);
      await photo(165,305,750,705,true);
      headline(headlineText,120,240,870,84,2,ink);
      small(brand.name.toUpperCase(),120,1210,ink);
  }
  return can;
}
export function CreativeCover({post,brand,photo}:{post:Post;brand:Brand;photo?:string}){
  const [url,setUrl]=useState('');const [failure,setFailure]=useState(false);
  useEffect(()=>{let active=true;setFailure(false);makeCover(post,brand,photo)
    .then(c=>{if(active)setUrl(c.toDataURL('image/png'))}).catch(()=>{if(active)setFailure(true)});
    return()=>{active=false};
  },[post.template,post.hook,post.cta,brand.name,brand.color,brand.background,photo]);
  if(failure)return <div className="cover-error">No se pudo preparar la vista previa.</div>;
  if(!url)return <div className="cover-error"><LoaderCircle size={24}/></div>;
  return <img src={url} alt="Preview del diseño seleccionado" style={{display:'block',width:'100%',aspectRatio:'4 / 5',objectFit:'contain'}}/>;
}
export async function exportCreativeCover(post:Post,brand:Brand,photo?:string){
  const c=await makeCover(post,brand,photo),a=document.createElement('a');
  a.download=(post.title||'content').replace(/[^a-z0-9-]/gi,'-').toLowerCase()+'-1080x1350.png';
  a.href=c.toDataURL('image/png');a.click();
}

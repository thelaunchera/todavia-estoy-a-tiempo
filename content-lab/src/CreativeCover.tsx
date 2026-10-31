import {useEffect,useState} from 'react';
import {LoaderCircle} from 'lucide-react';
import {composeGridPoster,LAYOUTS} from './GridComposer';
type Post={title:string;hook:string;cta:string;template:string};
type Brand={name:string;color:string;background:string;secondaryColor?:string;headingFont?:string;bodyFont?:string};
const legacy:Record<string,string>={Editorial:'Editorial Hero',Spotlight:'Product Spotlight',Split:'Color Block',Bold:'Bold Typography'};
export async function makeCover(post:Post,brand:Brand,src?:string){
  const format=legacy[post.template]||post.template;
  const index=LAYOUTS.findIndex(x=>x.name===format);
  const {canvas}=await composeGridPoster({
    format:index<0?'Editorial Hero':format,
    headline:post.hook||post.title,
    subtext:post.cta
  },Math.max(0,index),brand,{photo:src},'portrait');
  return canvas;
}
export function CreativeCover({post,brand,photo}:{post:Post;brand:Brand;photo?:string}){
  const [url,setUrl]=useState(''),[failure,setFailure]=useState(false);
  useEffect(()=>{
    let active=true;setFailure(false);
    makeCover(post,brand,photo).then(c=>{if(active)setUrl(c.toDataURL('image/png'))})
    .catch(()=>{if(active)setFailure(true)});
    return()=>{active=false};
  },[post.template,post.hook,post.cta,post.title,brand.name,brand.color,brand.background,brand.secondaryColor,brand.headingFont,brand.bodyFont,photo]);
  if(failure)return <div className="cover-error">No se pudo preparar la vista previa.</div>;
  if(!url)return <div className="cover-error"><LoaderCircle size={24}/></div>;
  return <img src={url} alt="Vista previa de la composición seleccionada" style={{display:'block',width:'100%',aspectRatio:'4 / 5',objectFit:'contain'}}/>;
}
export async function exportCreativeCover(post:Post,brand:Brand,photo?:string){
  const c=await makeCover(post,brand,photo),a=document.createElement('a');
  a.download=(post.title||'content').replace(/[^a-z0-9-]/gi,'-').toLowerCase()+'-1080x1350.png';
  a.href=c.toDataURL('image/png');a.click();
}

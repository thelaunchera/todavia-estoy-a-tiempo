/* Content Lab owned icon system: crisp at iPhone navigation size.
 * Vector icons replace the raster sprite; nothing here comes from customer assets. */
import {
  LayoutGrid, SquarePen, PanelsTopLeft, CalendarDays, FolderOpen,
  Images, Shapes, BookOpen, Palette
} from 'lucide-react';

export type LabIconName='home'|'post'|'carousel'|'calendar'|'posts'|'media'|'stickers'|'prompts'|'brand';
const icons={
  home:LayoutGrid,
  post:SquarePen,
  carousel:PanelsTopLeft,
  calendar:CalendarDays,
  posts:FolderOpen,
  media:Images,
  stickers:Shapes,
  prompts:BookOpen,
  brand:Palette
} satisfies Record<LabIconName,typeof LayoutGrid>;

export function UniversalLabIcon({name,size=22,className=''}:{name:LabIconName;size?:number;className?:string}){
  const Icon=icons[name];
  return <span aria-hidden="true" className={'lab-universal-icon '+className}
    style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:size,height:size,flexShrink:0}}>
    <Icon size={size} strokeWidth={1.9} />
  </span>;
}
export const APP_ICON_MAP:Partial<Record<string,LabIconName>>={
  home:'home',create:'post',factory:'carousel',calendar:'calendar',posts:'posts',
  media:'media',stickers:'stickers',prompts:'prompts','prompt-studio':'prompts',brands:'brand'
};

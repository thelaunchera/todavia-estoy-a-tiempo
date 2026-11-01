/** Calendar-only helpers. Store a local wall-clock date and time, never a UTC timestamp. */
export type PlannedItem={
 id:string;kind:'post'|'grid';brandId:string;title:string;format:string;
 date:string;time:string;status:'planned'|'published';
 assetId:string;gridId?:string;tileIndex?:number;
};
export type CalendarPost={
 id?:string;brandId:string;title:string;hook?:string;format?:string;
 date?:string;time?:string;status?:string;planningStatus?:string;assetId?:string;
};
export type CalendarGrid={
 id:string;brandId:string;title:string;sourceId?:string;
 posts:Array<{headline?:string;assetId?:string;scheduledDate?:string;scheduledTime?:string;planningStatus?:string}>;
};
export type ContentKind='carousel'|'single'|'reel-cover'|'story';
/** Reel is only an image cover in Content Lab, never a video editor or video scheduler. */
export const contentKind=(format:string):ContentKind=>{
 const f=(format||'').toLowerCase().trim();
 if(f.includes('carousel')||f.includes('carrusel'))return 'carousel';
 if(f==='reel'||f.includes('reel cover')||f.includes('portada de reel'))return 'reel-cover';
 if(f.includes('story')||f.includes('historia'))return 'story';
 return 'single';
};
export const contentKindLabel=(format:string,locale:'es'|'en'='es')=>{
 const labels=locale==='es'?{carousel:'Carrusel',single:'Post', 'reel-cover':'Portada reel',story:'Historia'}:
 {carousel:'Carousel',single:'Post','reel-cover':'Reel cover',story:'Story'};
 return labels[contentKind(format)];
};
export const contentKindShort=(format:string)=>({carousel:'C',single:'P','reel-cover':'R',story:'H'})[contentKind(format)];
export const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&
 (()=>{const [y,m,d]=value.split('-').map(Number);const actual=new Date(y,m-1,d);
 return actual.getFullYear()===y&&actual.getMonth()===m-1&&actual.getDate()===d;})();
export const validTime=(value:string)=>/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
export const localDate=(value:Date)=>[value.getFullYear(),String(value.getMonth()+1).padStart(2,'0'),String(value.getDate()).padStart(2,'0')].join('-');
export const monthCells=(year:number,month:number):Array<string|null>=>{
 const count=new Date(year,month+1,0).getDate();
 const offset=(new Date(year,month,1).getDay()+6)%7;
 const cells:Array<string|null>=Array(offset).fill(null);
 for(let n=1;n<=count;n++)cells.push(localDate(new Date(year,month,n)));
 while(cells.length%7)cells.push(null);
 return cells;
};
export function plannedItems(posts:CalendarPost[],grids:CalendarGrid[],brandId:string):PlannedItem[]{
 const fromPosts=posts.filter(p=>p.brandId===brandId&&p.id&&validDate(p.date||''))
  .map(p=>({id:'post:'+p.id,kind:'post' as const,brandId,title:p.title||p.hook||'Post',
   format:p.format||'Post',date:p.date||'',time:validTime(p.time||'')?p.time!:'09:00',
   status:p.planningStatus==='published'||p.status==='Published'?'published' as const:'planned' as const,
   assetId:p.assetId||''}));
 const fromGrids=grids.filter(g=>g.brandId===brandId).flatMap(g=>
  g.posts.flatMap((p,i)=>validDate(p.scheduledDate||'')?[{
   id:'grid:'+g.id+':'+i,kind:'grid' as const,brandId,
   title:p.headline||g.title+' · '+(i+1),format:'1 Photo → 9 Posts',
   date:p.scheduledDate!,time:validTime(p.scheduledTime||'')?p.scheduledTime!:'09:00',
   status:p.planningStatus==='published'?'published' as const:'planned' as const,
   assetId:p.assetId||'',gridId:g.id,tileIndex:i
  }]:[]));
 return [...fromPosts,...fromGrids].sort((a,b)=>(a.date+' '+a.time).localeCompare(b.date+' '+b.time)||a.title.localeCompare(b.title));
}

import {plannedItems,type CalendarGrid,type CalendarPost,type PlannedItem} from './CalendarPlannerModel';

/** The grid is a view of the editorial calendar, not a fixed campaign.
 * Publishing is ONLY confirmed by the owner changing planningStatus;
 * reaching a date never implies the post was actually published.
 */
const chronology=(a:PlannedItem,b:PlannedItem)=>
 (a.date+' '+a.time).localeCompare(b.date+' '+b.time)||a.id.localeCompare(b.id);
export function liveFeedState(posts:CalendarPost[],grids:CalendarGrid[],brandId:string){
 const items=plannedItems(posts,grids,brandId);
 const published=items.filter(item=>item.status==='published').sort(chronology);
 const upcoming=items.filter(item=>item.status==='planned').sort(chronology);
 return {published,upcoming,all:items};
}
export type FeedMode='now'|'future';
/** newest at top-left, Instagram's first tile; slots rotate as posts are marked published. */
export function liveFeedTiles(published:PlannedItem[],upcoming:PlannedItem[],
 mode:FeedMode='now',advance=0):Array<PlannedItem|null>{
 const plannedSteps=mode==='future'?upcoming.slice(0,Math.max(0,Math.min(9,advance))):[];
 const selected=[...published,...plannedSteps].slice(-9).reverse();
 return Array.from({length:9},(_,index)=>selected[index]||null);
}

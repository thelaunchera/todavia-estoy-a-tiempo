import {expandSeasonTwoScenes, type SeasonTwoShot} from './season-2-shot-model';
import {sceneShots01} from './season-2/shot-data/ep-01';
import {sceneShots02} from './season-2/shot-data/ep-02';
import {sceneShots03} from './season-2/shot-data/ep-03';
import {sceneShots04} from './season-2/shot-data/ep-04';
import {sceneShots05} from './season-2/shot-data/ep-05';
import {sceneShots06} from './season-2/shot-data/ep-06';
import {sceneShots07} from './season-2/shot-data/ep-07';
import {sceneShots08} from './season-2/shot-data/ep-08';

export const seasonTwoSceneGroups=[
 sceneShots01,sceneShots02,sceneShots03,sceneShots04,
 sceneShots05,sceneShots06,sceneShots07,sceneShots08
] as const;
export const seasonTwoShotLists:SeasonTwoShot[][]=seasonTwoSceneGroups.map((s,index)=>expandSeasonTwoScenes(index+1,s));
export const seasonTwoShotTotal=seasonTwoShotLists.reduce((sum,shots)=>sum+shots.length,0);
export function getSeasonTwoShots(episode:number):SeasonTwoShot[]{
 return seasonTwoShotLists[episode-1]??[];
}

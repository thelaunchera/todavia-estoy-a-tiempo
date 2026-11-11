/** A finished design is different from a published social post.
 * Keep the user's explicit collection choice ahead of older editorial status.
 */
export type PostCollectionStatus={isFinished?:boolean;status?:string};
export function isFinishedPost(post:PostCollectionStatus):boolean{
  if(post.isFinished===true)return true;
  if(post.isFinished===false)return false;
  return post.status==='Ready'||post.status==='Published';
}
export function collectionStatusPatch(finished:boolean){
  return {isFinished:finished,status:finished?'Ready':'Draft'};
}

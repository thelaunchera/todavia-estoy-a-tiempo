/** Best-effort, private-device safety net for editor drafts.
 * Server remains the authoritative source of saved work. No image data is stored.
 */
export type RecoverablePost={
 id?:string;brandId:string;format:string;designData?:string;updatedAt?:string;
};
export type LocalDraft={savedAt:number;post:RecoverablePost};
export const draftFingerprint=(post:RecoverablePost)=>{
 const {id,updatedAt,createdAt,...rest}=post;
 void id;void updatedAt;void createdAt;
 return JSON.stringify(rest);
};
export const draftStorageKey=(account:string,post:RecoverablePost)=>
 'content-lab:draft-backup:v1:'+encodeURIComponent(account.toLowerCase())+':'+
 encodeURIComponent(post.brandId)+':'+encodeURIComponent(post.id||'new-'+post.format);
export const readDraftBackup=(account:string,post:RecoverablePost):LocalDraft|null=>{
 try{
  const data=JSON.parse(localStorage.getItem(draftStorageKey(account,post))||'null');
  if(!data||typeof data!=='object'||typeof data.savedAt!=='number'||
     !data.post||data.post.brandId!==post.brandId||data.post.format!==post.format||
     (data.post.id||'')!==(post.id||''))return null;
  if(Date.now()-data.savedAt>1000*60*60*24*14)return null;
  return data as LocalDraft;
 }catch{return null}
};
export const writeDraftBackup=(account:string,post:RecoverablePost)=>{
 try{
  // LocalStorage is only for edits and settings, never images or access tokens.
  localStorage.setItem(draftStorageKey(account,post),JSON.stringify({savedAt:Date.now(),post}));
  return true;
 }catch{return false}
};
export const removeDraftBackup=(account:string,post:RecoverablePost)=>{
 try{localStorage.removeItem(draftStorageKey(account,post))}catch{}
};
export const newerUnsavedBackup=(account:string,post:RecoverablePost):LocalDraft|null=>{
 const backup=readDraftBackup(account,post);
 if(!backup||draftFingerprint(backup.post)===draftFingerprint(post))return null;
 const serverTimestamp=post.updatedAt?Date.parse(post.updatedAt):0;
 return serverTimestamp&&backup.savedAt<serverTimestamp-5000?null:backup;
};

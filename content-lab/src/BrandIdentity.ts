/** Per-brand visual identity and optional social destinations; no social accounts are connected or authenticated here. */
export const SOCIAL_PLATFORMS=[
 {id:'instagram',label:'Instagram',placeholder:'@tucuenta'},
 {id:'facebook',label:'Facebook',placeholder:'Nombre o URL de tu página'},
 {id:'tiktok',label:'TikTok',placeholder:'@tucuenta'},
 {id:'threads',label:'Threads',placeholder:'@tucuenta'},
 {id:'youtube',label:'YouTube',placeholder:'@canal o URL'},
 {id:'pinterest',label:'Pinterest',placeholder:'@cuenta o URL'},
 {id:'linkedin',label:'LinkedIn',placeholder:'Nombre o URL de tu página'}
] as const;
export type SocialPlatform=typeof SOCIAL_PLATFORMS[number]['id'];
export type SocialAccounts=Partial<Record<SocialPlatform,string>>;
export type BrandIdentity={
 color:string;background:string;secondaryColor?:string;additionalColors?:string[];
 handle?:string;socialAccounts?:SocialAccounts;primaryPlatform?:SocialPlatform;
};
const hex=/^#[0-9a-fA-F]{6}$/;
export const validBrandColor=(value:unknown):value is string=>typeof value==='string'&&hex.test(value);
export function normalizeExtraColors(colors:unknown,base:string[]=[]):string[]{
 const seen=new Set(base.filter(validBrandColor).map(c=>c.toLowerCase()));
 if(!Array.isArray(colors))return [];
 const result:string[]=[];
 for(const raw of colors){
  if(!validBrandColor(raw))continue;
  const color=raw.toUpperCase();
  if(seen.has(color.toLowerCase()))continue;
  seen.add(color.toLowerCase());
  result.push(color);
  if(result.length>=6)break;
 }
 return result;
}
export function brandPalette(brand:BrandIdentity):string[]{
 const all=[brand.color,brand.secondaryColor,...normalizeExtraColors(brand.additionalColors||[])];
 return [...new Set(all.filter(validBrandColor).map(c=>c.toUpperCase()))];
}
export function normalizeSocialAccounts(value:unknown,legacyHandle=''):SocialAccounts{
 const source=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
 const accounts:SocialAccounts={};
 for(const p of SOCIAL_PLATFORMS){
  const raw=p.id==='instagram'?(source.instagram??legacyHandle):source[p.id];
  const text=typeof raw==='string'?raw.trim().slice(0,200):'';
  if(text)accounts[p.id]=text;
 }
 return accounts;
}
export function preferredPlatform(brand:Pick<BrandIdentity,'primaryPlatform'|'socialAccounts'|'handle'>):SocialPlatform{
 const id=brand.primaryPlatform;
 return SOCIAL_PLATFORMS.some(p=>p.id===id)?id as SocialPlatform:'instagram';
}
export function platformName(id:SocialPlatform):string{
 return SOCIAL_PLATFORMS.find(p=>p.id===id)?.label||'Instagram';
}
export function socialAccount(brand:BrandIdentity,id:SocialPlatform):string{
 return normalizeSocialAccounts(brand.socialAccounts,brand.handle||'')[id]||'';
}

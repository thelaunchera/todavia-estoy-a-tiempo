/** Image library metadata lives in the existing per-owner Supabase asset payload. */
export type MediaCategory='original'|'reference'|'logo'|'generated'|'screenshot'|'sticker'|'background';
export const MEDIA_CATEGORIES:{id:MediaCategory;label:string;detail:string}[]=[
 {id:'original',label:'Fotos originales',detail:'Retratos y fotografías reales'},
 {id:'reference',label:'Referencias de estilo',detail:'Inspiración, nunca sustituyen al sujeto'},
 {id:'logo',label:'Logos',detail:'Recursos oficiales de marca'},
 {id:'generated',label:'Fotos IA',detail:'Resultados de generaciones previas'},
 {id:'screenshot',label:'Screenshots',detail:'Capturas y pantallas reales'},
 {id:'sticker',label:'Stickers PNG',detail:'Ilustraciones reales recortadas con transparencia'},
 {id:'background',label:'Mis fondos',detail:'Fondos propios para posts y carruseles'}
];
export type LibraryAsset={
 id:string;brandId:string;name:string;mime:string;category?:MediaCategory;displayName?:string;
 generated?:boolean;path?:string;aiReference?:string;shared?:boolean;bundled?:boolean;stickerGroup?:string;backgroundGroup?:string;sizeBytes?:number;sha256?:string
};
export function assetCategory(asset:LibraryAsset):MediaCategory{
 if(MEDIA_CATEGORIES.some(x=>x.id===asset.category))return asset.category!;
 if(/sticker|avatar_|matcha|pilates|reformer|yoga|dumbbell|wellness/i.test(asset.name)&&asset.mime==='image/png')return 'sticker';
 if(asset.generated||/^(ai photo|post\s*\d+\s*-|cloudflare|generat)/i.test(asset.name))return 'generated';
 if(/logo|logotipo|brandmark/i.test(asset.name))return 'logo';
 if(/screenshot|captura|screen.?shot/i.test(asset.name))return 'screenshot';
 if(/reference|referencia|inspiraci[oó]n/i.test(asset.name))return 'reference';
 return 'original';
}
export function displayAssetName(asset:LibraryAsset):string{
 const manuallySet=typeof asset.displayName==='string'?asset.displayName.trim():'';
 if(manuallySet)return manuallySet;
 const original=String(asset.name||'').replace(/\.(png|jpe?g|webp|heic|heif)$/i,'').trim();
 if(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(original))return 'Imagen sin nombre';
 if(/^post\s*(\d+)\s*-\s*(nine creative directions|nueve ideas)/i.test(original))return original.replace(/\s*-\s*(nine creative directions|nueve ideas).*$/i,' · Foto generada');
 if(/^ai photo\s*-/i.test(original))return original.replace(/^ai photo\s*-\s*/i,'Foto IA · ');
 return original||'Imagen sin nombre';
}
export function cleanAssetName(name:string):string{
 return name.replace(/[\x00-\x1F<>]/g,'').replace(/\s+/g,' ').trim().slice(0,85);
}

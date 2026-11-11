/**
 * One buyer-facing organisation scheme for general Studio / Content Lab art.
 * Pure presentation logic: never publishes a private asset or changes its owner.
 * The 9 historical full-frame wallpapers were mistakenly saved as stickers;
 * preserve their existing IDs and Storage bytes while showing them in Fondos.
 */
export const LEGACY_BACKGROUND_STICKER_ORIGINAL_NAMES=[
 '10 Red Cream Gingham','13 Handmade Oat Paper','16 Olive Gingham Weave',
 '17 Dusty Pink Crumpled Paper','18 Vintage Cherry Wallpaper',
 '25 Mini Yellow Gingham','27 Soft Blush Handmade Paper',
 '28 Hand Drawn Daisy Wallpaper','28 marble gold veins'
] as const;
export const LEGACY_BACKGROUND_STICKER_NAMES=new Set<string>(
 LEGACY_BACKGROUND_STICKER_ORIGINAL_NAMES.map(name=>name.toLocaleLowerCase('es'))
);

export function legacyStickerIsBackground(name:string):boolean{
 return LEGACY_BACKGROUND_STICKER_NAMES.has(name.trim().toLocaleLowerCase('es'));
}
export function legacyStickerBackgroundGroup(name:string):string{
 return /wallpaper|gingham/i.test(name)?'Editoriales':'Papel y texturas';
}

export const STICKER_COLLECTIONS=[
 'Todos','Mis stickers','Lazos','Cintas','Estrellas','Marcos y etiquetas',
 'Papeles y recortes','Branding','Flores y naturaleza','Animales','Avatares',
 'Temporada','Matcha','Pilates','Ejercicios','Inspiración','Negocios',
 'Tecnología','Picnic y lifestyle','Playa y verano','Objetos','Decorativos'
] as const;
export type StickerCollection=typeof STICKER_COLLECTIONS[number];

type GroupableAsset={name:string;displayName?:string;stickerGroup?:string;shared?:boolean};

/** Classify existing 400+ "Aesthetic" labels without changing database rows. */
export function stickerCollectionFor(asset:GroupableAsset):StickerCollection{
 const name=(asset.displayName||asset.name||'').toLocaleLowerCase('es');
 const group=(asset.stickerGroup||'').toLocaleLowerCase('es');
 // Release collections with approved editorial phrases take precedence over loose keyword matching.
 if(group==='inspiración'||group==='inspiracion')return 'Inspiración';
 if(/navidad|christmas|holiday|valent[ií]n|halloween|santa|snowman|cascabel|reyes magos|pascua/.test(name)||group==='temporadas')return 'Temporada';
 if(/airdrop|air drop|iphone|smartphone|ipad|macbook|screen ?shot|notification|app icon|widget|cursor|mensaje|message|dm|red social|social media|desktop/.test(name))return 'Tecnología';
 if(/picnic|merienda|manta de cuadros|picnic basket|canasta|campestre|sandwich|basket picnic|mantel|lemonade|limonada/.test(name))return 'Picnic y lifestyle';
 if(/playa|beach|sea shell|seashell|sombrilla|surf|verano|summer|sunbed|sun hat|ocean|toalla de playa|bikini|palm tree|flotador|concha marina/.test(name))return 'Playa y verano';
 if(/lazo|bow|ribbon|moño|corbata de seda/.test(name))return 'Lazos';
 if(/cinta|tape|washi|bander[ií]n|banner|list[oó]n/.test(name))return 'Cintas';
 if(/estrella|\bstars?\b|destello|asterisco|sparkles?|rayos?|brillo estelar/.test(name))return 'Estrellas';
 if(/marco|frame|etiqueta|badge|sello|stamp|cup[oó]n|ticket|polaroid|clip|relicario/.test(name))return 'Marcos y etiquetas';
 if(/papel rasgado|torn paper|scrap|paper strip|papel troquelado|pincelada|paint stroke|subrayado|underline|nota adhesiva/.test(name))return 'Papeles y recortes';
 if(/brand|marketing|anal[ií]tica|business|logo|newsletter|planificador|planner|social|reels|content|creativo de negocios/.test(name)||group==='branding y marketing')return 'Branding';
 if(/flor|flower|botanic|bot[aá]nic|hoja|leaf|daisy|rose|orqu[ií]dea|ramas|jard[ií]n/.test(name))return 'Flores y naturaleza';
 if(/animal|perrit|perro|puppy|dog|gatit|gato|cat|lobo|wolf|conej|bunny|osito|bear|zorro|fox|mariposa|butterfly|pantera/.test(name)||group==='animales')return 'Animales';
 if(/avatar|portrait|retrato|chica|girl|woman|creadora|creador|personaje|character|modelo|woman|fashion girl/.test(name)||group==='avatares')return 'Avatares';
 if(/matcha|latte|tea|t[eé] verde|caf[eé]|coffee|croissant|taza|tumbler/.test(name)||group==='matcha')return 'Matcha';
 if(/pilates|reformer|yoga|barre|stretch|magic circle/.test(name)||group==='pilates')return 'Pilates';
 if(/workout|gym|fitness|exercise|ejercicio|squat|dumbbell|kettlebell|strength|running|zapatilla|sneaker/.test(name)||group==='ejercicios')return 'Ejercicios';
 if(group==='inspiración'||group==='inspiracion'||/^(start where you are|small steps still count|keep going|progress over perfection|your pace is valid|make room for joy|trust your next step|create your own path|you can begin again|one day at a time|done is a brave start|your ideas matter|let it take time|choose yourself|more courage less doubt|you are becoming|a little progress daily|do it with heart|good things take practice|keep showing up)$/.test(name))return 'Inspiración';
 if(group==='negocios')return 'Negocios';
 if(/phone|iphone|camera|c[aá]mara|laptop|book|libro|perfume|labial|lipstick|zapato|shoe|bolso|bag|tote|sombrero|hat|notebook|aud[ií]fonos|headphone|florero|vela|candle|p[aá]gina|globo|pez|concha|pluma|anillo/.test(name))return 'Objetos';
 return 'Decorativos';
}

/** Personal is always scoped to the authenticated account / selected brand. */
export function visibleStickerCollections(assets:GroupableAsset[]):{label:StickerCollection;count:number}[]{
 const counts=new Map<StickerCollection,number>();
 const privateCount=assets.filter(item=>!item.shared).length;
 counts.set('Todos',assets.length);
 counts.set('Mis stickers',privateCount);
 for(const item of assets){
  const category=stickerCollectionFor(item);
  counts.set(category,(counts.get(category)||0)+1);
 }
 return STICKER_COLLECTIONS.filter(label=>label==='Todos'||label==='Mis stickers'||(counts.get(label)||0)>0)
  .map(label=>({label,count:counts.get(label)||0}));
}

export function matchesStickerCollection(asset:GroupableAsset,category:StickerCollection):boolean{
 if(category==='Todos')return true;
 if(category==='Mis stickers')return !asset.shared;
 return stickerCollectionFor(asset)===category;
}

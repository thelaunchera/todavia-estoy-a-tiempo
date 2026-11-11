/** Owner-only studio organization rules. No file deletion or public sharing. */
const PERSONAL_CHARACTERS = /^(?:0?[1-9]|1[0-6])\s+(?:zorra aventurera|pantera rosa|tigre guerrera|gata morada glam|osa exploradora|conejita agente|agente cyber plateada|reina de hielo|exploradora del desierto|exploradora de selva|hero[ií]na rayo azul|hero[ií]na azul nocturna|hero[ií]na armadura marina|reina azul real|hero[ií]na cyber neon|bruja luna morada)$/i;
const SERIES_CHARACTERS = /(?:^|[\s_\/-])(?:nia|ruby|off[\s_-]?brief|personajes?\s+propios|my[\s_-]?characters?|private[\s_-]?characters?)(?=$|[\s_\/-])/i;

/** Deliberately narrow: a word like "rosa" must not hide an ordinary flower. */
export function isPersonalCharacterAssetName(name:string):boolean{
 const normalized=name.replace(/[_-]+/g,' ').trim();
 return PERSONAL_CHARACTERS.test(normalized)||SERIES_CHARACTERS.test(normalized);
}

/** Recognize known full-frame background packs, not torn-paper sticker cutouts. */
export function isStudioBackgroundName(name:string):boolean{
 const normalized=name.replace(/[_-]+/g,' ').trim();
 return /^(?:04 E |05 F |06 G )/i.test(normalized)
  || /\b(?:background|fondo|wallpaper|backdrop|seamless pattern|gingham weave|mini yellow gingham|red cream gingham|crumpled paper|handmade oat paper|soft blush handmade paper|marble gold veins)\b/i.test(normalized);
}

export type StudioAssetOrganization='sticker'|'background';
export function organizedStudioKind(asset:{id:string;name:string;category:'sticker'|'background'},overrides:Record<string,StudioAssetOrganization>={}):StudioAssetOrganization{
 return overrides[asset.id]||(isStudioBackgroundName(asset.name)?'background':asset.category);
}

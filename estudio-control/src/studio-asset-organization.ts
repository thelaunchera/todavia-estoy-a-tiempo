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

/**
 * A deliberately conservative allowlist for an owner-directed bulk sync.
 * Anything with a person, character, demo, brand, or ambiguous title stays
 * private even if it also contains a word like "ribbon" or "sticker".
 * One-off manual sharing uses the existing per-file admin control instead.
 */
const PRIVATE_CONTENT_WORDS=/(?:^|[\s_./-])(?:nia|ruby|off[\s_-]?brief|tle|the[\s_-]?launch[\s_-]?era|self[\s_-]?love[\s_-]?gym|sova|golden[\s_-]?grid|la[\s_-]?vie[\s_-]?in[\s_-]?pink|casa[\s_-]?brownie|yumm?|crumb|havana|habana|lavanda|personal|privad[ao]s?|private|mine|my[\s_-]?own|personajes?|characters?|hero[ií]na|reina|explorador[a]?|bruj[a]?|pantera|zorra|tig(?:re|ress)|gat[ao]|perrit[ao]|lobo|conej[ao]|os[ao]|muñec[ao]|avatar|portrait|retrato|woman|girl|boy|man|modelo|fot[oó]graf[ao]|creadora|creador|logo|wordmark|monogram|marca[\s_-]?propia)(?=$|[\s_./-])/i;
const GENERIC_STICKER_WORDS=/(?:^|[\s_./-])(?:asterisco|star|estrella|destellos?|sparkles?|lazos?|bows?|ribbons?|cintas?|washi|tape|banners?|bander[ií]n|etiquetas?|badges?|sellos?|seals?|marcos?|frames?|subrayados?|underline|flechas?|arrows?|charm|cursor|cadenas?|chain|burbuja|bubble|clips?|papel[\s_-]?rasgado|torn[\s_-]?paper|stickers?|icons?|iconos?|ornamentos?|ornament|halftone|corners?|esquinas?|tarjetas?|cards?|pincelad[ao]s?|paint[\s_-]?stroke)(?=$|[\s_./-])/i;

/** Never infer that an arbitrary user image is shareable from its file type. */
export function isSafeGenericStudioSticker(name:string):boolean{
 const normalized=name.replace(/[_-]+/g,' ').trim();
 return !isPersonalCharacterAssetName(normalized)
  &&!isStudioBackgroundName(normalized)
  &&!PRIVATE_CONTENT_WORDS.test(normalized)
  &&GENERIC_STICKER_WORDS.test(normalized);
}

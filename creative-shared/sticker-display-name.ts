/**
 * Human-facing sticker titles shared by the private Studio and Content Lab.
 * Never use these titles as IDs, paths, privacy/classification checks or
 * persistence keys: original filenames must continue to resolve saved art.
 *
 * Some imported ZIPs used generated filenames containing sequence numbers
 * and production prompts. Show clean labels without rewriting their files.
 */
const IPHONE_DESCRIPTIONS:[RegExp,string][]=[
 [/air\s?drop/i,'Compartir con AirDrop'],
 [/share sheet/i,'Menú para compartir'],
 [/chat bubble/i,'Burbujas de chat'],
 [/music player/i,'Reproductor de música'],
 [/location map/i,'Ubicación compartida'],
 [/notes? memo/i,'Notas'],
 [/reminder calendar/i,'Recordatorios'],
 [/photo stack/i,'Fotos apiladas'],
 [/file transfer/i,'Transferencia de archivos'],
 [/control center/i,'Centro de control'],
 [/voice message/i,'Mensaje de voz'],
 [/share contact/i,'Compartir contacto'],
 [/screenshot preview/i,'Vista previa de captura'],
 [/upload widget/i,'Subir archivos'],
 [/video call/i,'Videollamada'],
 [/route card/i,'Ruta en el mapa']
];

function capitalize(value:string):string{
 return value?value.charAt(0).toLocaleUpperCase('es')+value.slice(1):value;
}

export function friendlyStickerName(name:string):string{
 const original=String(name||'').trim();
 if(!original)return 'Sticker';
 let clean=original
  .replace(/\.(?:png|jpe?g|webp|svg|heic|heif)$/i,'')
  .replace(/[_]+/g,' ')
  .replace(/[\u2013\u2014]/g,' ')
  .replace(/[\t\n\r]+/g,' ')
  .trim();

 // Remove repeated archive and sequence markers, never digits inside words.
 // "01 iPhone UI 12 ..." and "02 Picnic 06 ..." are imported pack names.
 clean=clean.replace(/^(?:[0-9]{1,5}[a-z]?(?:\s*[.:-]\s*|\s+))+/i,'').trim();

 if(/^iphone\s*ui\b/i.test(clean)){
  const subject=clean.replace(/^iphone\s*ui\b\s*/i,'')
   .replace(/^[0-9]{1,5}(?:[\s.:_-]+|$)/,'');
  const matched=IPHONE_DESCRIPTIONS.find(([pattern])=>pattern.test(subject));
  if(matched)return matched[1];
  clean=subject||'Elementos de iPhone';
 }
 // Collection names can be retained when the rest of a filename is simply a
 // truncated generation instruction, not a real description of the picture.
 if(/^(picnic|playa|editorial)\s+[0-9]{1,4}\b/i.test(clean)){
  const match=clean.match(/^(picnic|playa|editorial)\s+[0-9]{1,4}\s*(.*)$/i);
  if(match){
   const section=match[1].toLocaleLowerCase('es');
   const description=match[2].toLocaleLowerCase('es');
   const label=section==='editorial'?'Elemento editorial':capitalize(section);
   const descriptor=
    /collage/.test(description)?'Collage':
    /cartoon/.test(description)?'Ilustración':
    /cut.?out|cutout/.test(description)?'Recorte':
    /graphic/.test(description)?'Gráfico':
    /sticker|illustration/.test(description)?'Ilustración':'';
   return descriptor?label+' · '+descriptor:label;
  }
 }

 // Drop image-production instructions only when they are standalone metadata.
 clean=clean
  .replace(/\b(?:full[ -]?hd|ultra[ -]?hd|hd|hq|uhd|4k|8k|1080p)\b/gi,' ')
  .replace(/\b(?:png|jpe?g|webp|svg)\b/gi,' ')
  .replace(/\b(?:high[ -]?resolution|high[ -]?quality|transparent[ -]?background|no[ -]?background|background[ -]?removed|white[ -]?background|isolated[ -]?(?:on[ -]?white)?|cutout|cut[ -]?out|clip[ -]?art|stock[ -]?image)\b/gi,' ')
  .replace(/\b(?:master[ -]?prompt|internal[ -]?(?:use|only)?|inside[ -]?info|draft|test[ -]?asset|demo[ -]?only|studio[ -]?only|sample[ -]?only)\b/gi,' ')
  .replace(/\b(?:version[ -]?[0-9]+|v[0-9]+|[0-9]{3,4}\s*[x×]\s*[0-9]{3,4})\b/gi,' ')
  .replace(/\b(?:no[ -]?text|without[ -]?text|plain[ -]?background)\b/gi,' ')
  .replace(/\s+[·|/]\s*$/g,' ')
  .replace(/\s{2,}/g,' ')
  .replace(/^[\s._:-]+|[\s._:-]+$/g,'')
  .trim();
 // Final trailing isolated sequence numbers are version labels, not subjects.
 clean=clean.replace(/(?:\s+[.#_-]?\s*[0-9]{1,4})+$/,'').trim();
 return capitalize(clean)||'Sticker';
}

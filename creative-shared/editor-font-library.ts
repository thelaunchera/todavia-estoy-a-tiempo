/**
 * The same curated 50 font choices are available in Content Lab and the
 * private Studio. Only the selected font loads: downloading all 50 on iPhone
 * would be slow and memory-hungry. Existing saved font keys remain valid.
 * Google Fonts CSS is dynamically requested; no font binaries are bundled.
 */
export type EditorFontCategory='Sans'|'Display'|'Serif'|'Script';
export type EditorFont={id:string;label:string;family:string;category:EditorFontCategory};
export const EDITOR_FONTS:readonly EditorFont[]=[
  {
    "id": "prompt",
    "label": "Prompt",
    "family": "Prompt",
    "category": "Sans"
  },
  {
    "id": "futura",
    "label": "Futura (estilo Jost)",
    "family": "Jost",
    "category": "Sans"
  },
  {
    "id": "dm-sans",
    "label": "DM Sans",
    "family": "DM Sans",
    "category": "Sans"
  },
  {
    "id": "inter",
    "label": "Inter",
    "family": "Inter",
    "category": "Sans"
  },
  {
    "id": "poppins",
    "label": "Poppins",
    "family": "Poppins",
    "category": "Sans"
  },
  {
    "id": "montserrat",
    "label": "Montserrat",
    "family": "Montserrat",
    "category": "Sans"
  },
  {
    "id": "raleway",
    "label": "Raleway",
    "family": "Raleway",
    "category": "Sans"
  },
  {
    "id": "urbanist",
    "label": "Urbanist",
    "family": "Urbanist",
    "category": "Sans"
  },
  {
    "id": "outfit",
    "label": "Outfit",
    "family": "Outfit",
    "category": "Sans"
  },
  {
    "id": "manrope",
    "label": "Manrope",
    "family": "Manrope",
    "category": "Sans"
  },
  {
    "id": "syne",
    "label": "Syne",
    "family": "Syne",
    "category": "Sans"
  },
  {
    "id": "space",
    "label": "Space Grotesk",
    "family": "Space Grotesk",
    "category": "Sans"
  },
  {
    "id": "sora",
    "label": "Sora",
    "family": "Sora",
    "category": "Sans"
  },
  {
    "id": "plus-jakarta-sans",
    "label": "Plus Jakarta Sans",
    "family": "Plus Jakarta Sans",
    "category": "Sans"
  },
  {
    "id": "josefin-sans",
    "label": "Josefin Sans",
    "family": "Josefin Sans",
    "category": "Sans"
  },
  {
    "id": "nunito-sans",
    "label": "Nunito Sans",
    "family": "Nunito Sans",
    "category": "Sans"
  },
  {
    "id": "rubik",
    "label": "Rubik",
    "family": "Rubik",
    "category": "Sans"
  },
  {
    "id": "quicksand",
    "label": "Quicksand",
    "family": "Quicksand",
    "category": "Sans"
  },
  {
    "id": "work-sans",
    "label": "Work Sans",
    "family": "Work Sans",
    "category": "Sans"
  },
  {
    "id": "league-spartan",
    "label": "League Spartan",
    "family": "League Spartan",
    "category": "Sans"
  },
  {
    "id": "poster",
    "label": "Archivo Black",
    "family": "Archivo Black",
    "category": "Display"
  },
  {
    "id": "bebas-neue",
    "label": "Bebas Neue",
    "family": "Bebas Neue",
    "category": "Display"
  },
  {
    "id": "anton",
    "label": "Anton",
    "family": "Anton",
    "category": "Display"
  },
  {
    "id": "oswald",
    "label": "Oswald",
    "family": "Oswald",
    "category": "Display"
  },
  {
    "id": "barlow-condensed",
    "label": "Barlow Condensed",
    "family": "Barlow Condensed",
    "category": "Display"
  },
  {
    "id": "abril-fatface",
    "label": "Abril Fatface",
    "family": "Abril Fatface",
    "category": "Display"
  },
  {
    "id": "yeseva-one",
    "label": "Yeseva One",
    "family": "Yeseva One",
    "category": "Display"
  },
  {
    "id": "cinzel",
    "label": "Cinzel",
    "family": "Cinzel",
    "category": "Display"
  },
  {
    "id": "unbounded",
    "label": "Unbounded",
    "family": "Unbounded",
    "category": "Display"
  },
  {
    "id": "bungee",
    "label": "Bungee",
    "family": "Bungee",
    "category": "Display"
  },
  {
    "id": "dm-serif-display",
    "label": "DM Serif Display",
    "family": "DM Serif Display",
    "category": "Serif"
  },
  {
    "id": "cormorant",
    "label": "Cormorant Garamond",
    "family": "Cormorant Garamond",
    "category": "Serif"
  },
  {
    "id": "playfair",
    "label": "Playfair Display",
    "family": "Playfair Display",
    "category": "Serif"
  },
  {
    "id": "fraunces",
    "label": "Fraunces",
    "family": "Fraunces",
    "category": "Serif"
  },
  {
    "id": "bodoni",
    "label": "Bodoni Moda",
    "family": "Bodoni Moda",
    "category": "Serif"
  },
  {
    "id": "libre",
    "label": "Libre Baskerville",
    "family": "Libre Baskerville",
    "category": "Serif"
  },
  {
    "id": "prata",
    "label": "Prata",
    "family": "Prata",
    "category": "Serif"
  },
  {
    "id": "marcellus",
    "label": "Marcellus",
    "family": "Marcellus",
    "category": "Serif"
  },
  {
    "id": "lora",
    "label": "Lora",
    "family": "Lora",
    "category": "Serif"
  },
  {
    "id": "eb-garamond",
    "label": "EB Garamond",
    "family": "EB Garamond",
    "category": "Serif"
  },
  {
    "id": "spectral",
    "label": "Spectral",
    "family": "Spectral",
    "category": "Serif"
  },
  {
    "id": "cormorant-infant",
    "label": "Cormorant Infant",
    "family": "Cormorant Infant",
    "category": "Serif"
  },
  {
    "id": "caveat",
    "label": "Caveat",
    "family": "Caveat",
    "category": "Script"
  },
  {
    "id": "pacifico",
    "label": "Pacifico",
    "family": "Pacifico",
    "category": "Script"
  },
  {
    "id": "dancing-script",
    "label": "Dancing Script",
    "family": "Dancing Script",
    "category": "Script"
  },
  {
    "id": "great-vibes",
    "label": "Great Vibes",
    "family": "Great Vibes",
    "category": "Script"
  },
  {
    "id": "sacramento",
    "label": "Sacramento",
    "family": "Sacramento",
    "category": "Script"
  },
  {
    "id": "permanent-marker",
    "label": "Permanent Marker",
    "family": "Permanent Marker",
    "category": "Script"
  },
  {
    "id": "indie-flower",
    "label": "Indie Flower",
    "family": "Indie Flower",
    "category": "Script"
  },
  {
    "id": "satisfy",
    "label": "Satisfy",
    "family": "Satisfy",
    "category": "Script"
  }
] as const;
const aliases:Record<string,string>={
  'dm serif display':'dm-serif-display',
  'arial':'inter',
  'sans':'dm-sans',
  'serif':'playfair',
  'brand':'playfair',
};
const lookup=new Map(EDITOR_FONTS.map(font=>[font.id,font]));
export const editorFontId=(key?:string):string=>{
  const raw=String(key||'').trim().toLowerCase();
  return aliases[raw]||raw;
};
export const editorFont=(key?:string):EditorFont|undefined=>lookup.get(editorFontId(key));
export const editorFontFamily=(key?:string,unknownFallback='Georgia,serif'):string=>{
  if(key==='serif'||key==='brand')return 'Georgia,serif';
  if(key==='sans'||key==='arial')return 'Arial,sans-serif';
  const selected=editorFont(key);
  if(!selected)return unknownFallback;
  if(selected.id==='futura')return 'Futura,"Jost",Arial,sans-serif';
  const fallback=selected.category==='Serif'?'Georgia,serif':
    selected.category==='Script'?'cursive':'Arial,sans-serif';
  return '"'+selected.family.replace(/"/g,'')+'",'+fallback;
};
const pending=new Map<string,Promise<void>>();
/** Wait for actual font availability before drawing a permanent PNG. */
export function ensureEditorFont(key?:string,weight=700):Promise<void>{
  const choice=editorFont(key);
  if(!choice||typeof document==='undefined')return Promise.resolve();
  const cache=choice.id;
  if(pending.has(cache))return pending.get(cache)!;
  const fontCssUrl='https://fonts.googleapis.com/css2?family='+
    encodeURIComponent(choice.family).replace(/%20/g,'+')+'&display=swap';
  const promise=new Promise<void>(resolve=>{
    const element=document.createElement('link');
    element.rel='stylesheet';element.href=fontCssUrl;
    element.setAttribute('data-editor-font',choice.id);
    let finished=false;
    const finish=()=>{
      if(finished)return;
      finished=true;
      // Safari's canvas text renderer must observe the loaded face.
      const face='"'+choice.family.replace(/"/g,'')+'"';
      const safeWeight=[400,500,600,700,800,900].includes(weight)?weight:700;
      void document.fonts?.load(safeWeight+' 32px '+face).catch(()=>{}).then(()=>resolve())??resolve();
    };
    element.onload=finish;element.onerror=finish;
    document.head.appendChild(element);
    // Offline mode: do not leave export frozen while a CDN is unreachable.
    window.setTimeout(finish,6500);
  });
  pending.set(cache,promise);
  return promise;
}

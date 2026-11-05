import type {LabLanguage} from './PromptLibrary';
export type StylePreset='real-life'|'studio'|'editorial'|'luxury'|'bold'|'minimal';
export type ShotPreset='auto'|'portrait'|'closeup'|'flatlay'|'hands'|'wide';
export type FidelityPreset='balanced'|'strict';
export type PromptControls={
 subject:string;environment:string;instruction:string;
 style:StylePreset;shot:ShotPreset;fidelity:FidelityPreset;
 lighting:'daylight'|'softbox'|'golden-hour'|'moody';
 avoid:string;
};
export const DEFAULT_CONTROLS:PromptControls={
 subject:'',environment:'',instruction:'',style:'real-life',
 shot:'auto',fidelity:'strict',lighting:'daylight',avoid:''
};
const styleWords:Record<StylePreset,string>={
 'real-life':'Unposed documentary photography, natural imperfection, material realism, believable scale, gentle ambient shadows.',
 studio:'Professional product photography, controlled softbox highlights, consistent perspective and credible studio shadows.',
 editorial:'High-end editorial composition, deliberate cropping, tactile material detail and considered negative space.',
 luxury:'Restrained luxury art direction, fine surface textures, subtle polished lighting and understated props.',
 bold:'Contemporary art-directed graphic still life, authentic physical objects and deliberate high-contrast lighting.',
 minimal:'Minimal commercial photography with uncluttered background, correct object proportions and visual breathing room.'
};
const shotWords:Record<ShotPreset,string>={
 auto:'Choose a camera angle appropriate to the stated subject and visual reference.',
 portrait:'Genuine editorial portrait, eye level, natural proportions and candid facial expression.',
 closeup:'Close camera framing with physically believable shallow depth of field.',
 flatlay:'Overhead flat lay with grounded objects, no unnatural floating elements.',
 hands:'Hands interacting naturally with the real subject, anatomically plausible and correctly gripping.',
 wide:'Environmental wide composition with believable context and room for graphic typography.'
};
const lightWords:Record<PromptControls['lighting'],string>={
 daylight:'Soft natural window daylight and environmental reflections.',
 softbox:'Large diffused softbox and believable grounded shadow.',
 'golden-hour':'Warm late-afternoon sunlight with controlled highlights and physically coherent shadows.',
 moody:'Moody directional light, realistic shadow falloff and no artificial HDR.'
};
const styleWordsEs:Record<StylePreset,string>={
 'real-life':'Fotografía documental espontánea, imperfecciones naturales, materiales realistas y sombras ambientales suaves.',
 studio:'Fotografía profesional de producto, luz difusa, perspectiva coherente y sombras de estudio creíbles.',
 editorial:'Composición editorial de alta calidad, encuadre intencional, texturas visibles y espacio negativo equilibrado.',
 luxury:'Dirección artística elegante y discreta, materiales refinados, iluminación sutil y accesorios mínimos.',
 bold:'Naturaleza muerta contemporánea con objetos reales, composición llamativa e iluminación de alto contraste.',
 minimal:'Fotografía comercial minimalista, fondo despejado, proporciones fieles y espacio visual limpio.'
};
const shotWordsEs:Record<ShotPreset,string>={
 auto:'Elige un ángulo de cámara apropiado para el sujeto y su referencia visual.',
 portrait:'Retrato editorial auténtico a la altura de los ojos, proporciones naturales y expresión espontánea.',
 closeup:'Encuadre cercano con profundidad de campo reducida y creíble.',
 flatlay:'Toma cenital con objetos apoyados naturalmente, sin elementos flotantes.',
 hands:'Manos interactuando de forma natural con el sujeto, anatomía y agarre correctos.',
 wide:'Toma ambiental amplia con contexto creíble y espacio para agregar tipografía.'
};
const lightWordsEs:Record<PromptControls['lighting'],string>={
 daylight:'Luz natural suave de ventana y reflejos del entorno.',
 softbox:'Luz difusa de softbox grande y sombras realistas.',
 'golden-hour':'Luz cálida de última hora de la tarde, reflejos controlados y sombras coherentes.',
 moody:'Luz direccional dramática, caída de sombras realista y sin HDR artificial.'
};
export function composeCreativePrompt(c:PromptControls,language:LabLanguage='es'){
 const instruction=c.instruction.trim().slice(0,1000);
 const subject=c.subject.trim().slice(0,180);
 const environment=c.environment.trim().slice(0,170);
 const negative=c.avoid.trim().slice(0,300);
 const knownSubject=subject|| (language==='es'?'el sujeto real de la foto de referencia':'the actual subject from the provided reference');
 if(language==='es')return [
  instruction||'Crea una fotografía comercial auténtica.',
  'SUJETO PRINCIPAL: '+knownSubject+'.'+(environment?' ENTORNO: '+environment+'.':''),
  'ESTILO: '+styleWordsEs[c.style]+' CÁMARA: '+shotWordsEs[c.shot]+' ILUMINACIÓN: '+lightWordsEs[c.lighting],
  'REFERENCIA: '+(c.fidelity==='strict'
   ?'Usa la primera foto como referencia de identidad y forma. Conserva los colores, el empaque, las proporciones y los rasgos reconocibles. No inventes etiquetas, logotipos ni funciones. Para rostros o capturas que deban permanecer idénticos, utiliza la foto original como capa en lugar de regenerarla.'
   :'Usa la primera imagen como referencia principal. Permite cambios razonables de dirección artística sin perder la identidad del sujeto.'),
  'REALISMO FOTOGRÁFICO: materiales y texturas auténticos, sombras físicamente coherentes y anatomía humana normal. Sin piel plástica, dedos extra, reflejos incorrectos, textos distorsionados, productos duplicados ni marcas de agua.',
  'EVITAR: '+(negative||'Afirmaciones no verificadas, tipografías falsas, logotipos inventados, interfaces engañosas y detalles de producto que no existen.')+';',
  'Entrega UNA sola fotografía coherente, no un collage ni una cuadrícula. Cualquier título, precio o texto promocional se agregará después como una capa editable independiente.'
 ].join('\n').slice(0,1850);
 return [
  instruction||'Create one believable commercial photograph.',
  'MAIN SUBJECT: '+knownSubject+'.'+(environment?' ENVIRONMENT: '+environment+'.':''),
  'STYLE: '+styleWords[c.style]+ ' CAMERA: '+shotWords[c.shot]+' LIGHT: '+lightWords[c.lighting],
  'REFERENCE RULE: '+(c.fidelity==='strict'
   ?'Treat the first input photo as the identity and shape reference. Keep real shape, colors, packaging proportions and recognizable subject. Do not fabricate labels, logos or product functionality. For unchanged face or app screenshot, use original-photo compositing instead of regeneration.'
   :'Use the first input as the principal source; allow reasonable art-direction changes while keeping a recognizable subject.'),
  'PHOTOREALISM: real material physics, authentic texture, physically coherent shadows, normal human anatomy; no fake plastic skin, extra fingers, misplaced reflections, text artifacts, duplicate products or visual watermarks.',
  'AVOID: '+(negative||'Unverified claims, fake typography, imaginary logos, misleading UI and invented product details.')+';',
  'Output ONE coherent photograph, never a collage, not a grid. Any title, price or promotional copy is added afterward as a separate exact editable layer.'
 ].join('\n').slice(0,1850);
}
export function refinePromptLocally(c:PromptControls,language:LabLanguage){
 return composeCreativePrompt(c,language);
}

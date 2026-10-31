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
export function composeCreativePrompt(c:PromptControls,language:LabLanguage='es'){
 const instruction=c.instruction.trim().slice(0,1000);
 const subject=c.subject.trim().slice(0,180);
 const environment=c.environment.trim().slice(0,170);
 const negative=c.avoid.trim().slice(0,300);
 const knownSubject=subject|| (language==='es'?'el sujeto real de la foto de referencia':'the actual subject from the provided reference');
 return [
  instruction|| (language==='es'?'Crea una fotografía comercial auténtica.':'Create one believable commercial photograph.'),
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

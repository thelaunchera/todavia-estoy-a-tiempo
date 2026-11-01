// 30 original, editable bilingual creative briefs. Public 8-prompt freebie stays separate.
// Each brief describes photography; exact titles/prices are composed later as text layers.
export type LabLanguage='es'|'en';
export type PromptTemplate={id:string;category:string;title:{es:string;en:string};body:{es:string;en:string}};
export const PROMPT_CATEGORIES:Record<string,[string,string]>={"product":["Productos","Products"],"lifestyle":["Lifestyle","Lifestyle"],"personal":["Marca personal","Personal brand"],"food":["Food","Food"],"beauty":["Beauty","Beauty"],"services":["Servicios","Services"],"cleaning":["Cleaning","Cleaning"],"podcast":["Podcast","Podcast"],"education":["Cursos","Courses"],"tech":["Apps / Tech","Apps / Tech"],"luxury":["Premium","Premium"],"marketing":["Marketing","Marketing"],
"drive-carousel":["Carruseles","Carousels"],"drive-hooks":["Hooks y guiones","Hooks & scripts"],
"drive-stories":["Historias","Stories"],"drive-sales":["Ventas y DMs","Sales & DMs"],
"drive-chatgpt":["ChatGPT / estrategia","ChatGPT / strategy"],"drive-claude":["Claude / documentos","Claude / documents"],
"drive-ebooks":["Ebooks y guías","Ebooks & guides"]};
// Premium template bodies are fetched from Supabase RLS after authentication.
// Do NOT embed paid prompt text in a public GitHub Pages bundle.
export const fillTemplate=(input:string,values:{subject?:string;background?:string})=>
 input.replace(/\{\{(subject|background)\}\}/g,(_,key:string)=>values[key as keyof typeof values]?.trim()||(key==='subject'?'your real reference subject':'a natural editorial backdrop'));
export const promptLang=(language:string):LabLanguage=>language==='English'?'en':'es';

/** Broad category shelves: pick a shelf first; never dump 135 prompts on screen. */
export const PROMPT_SHELVES:{id:string;icon:string;subtitle:[string,string]}[]=[
 {id:'drive-carousel',icon:'▤',subtitle:['Educación, historias y ventas en slides','Slides for education and sales']},
 {id:'drive-hooks',icon:'✳',subtitle:['Hooks y guiones para reels externos','Hooks and scripts for external reels']},
 {id:'drive-stories',icon:'◌',subtitle:['Secuencias, interacción y comunidad','Story sequences and engagement']},
 {id:'drive-sales',icon:'↗',subtitle:['Páginas, DMs, ofertas y CTAs','Pages, DMs and offers']},
 {id:'drive-chatgpt',icon:'✦',subtitle:['Negocio, contenido y estrategia','Business and content strategy']},
 {id:'drive-claude',icon:'▧',subtitle:['Documentos y estrategia editorial','Long-form documentation']},
 {id:'drive-ebooks',icon:'▣',subtitle:['Ebooks, cursos y workbooks','Ebooks and workbooks']},
 {id:'photos',icon:'◎',subtitle:['30 escenas de fotografía editorial','30 editorial photo recipes']}
];
export const isPhotoTemplate=(category:string)=>!category.startsWith('drive-');

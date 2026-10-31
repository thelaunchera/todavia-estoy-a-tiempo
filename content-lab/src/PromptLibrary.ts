// 30 original, editable bilingual creative briefs. Public 8-prompt freebie stays separate.
// Each brief describes photography; exact titles/prices are composed later as text layers.
export type LabLanguage='es'|'en';
export type PromptTemplate={id:string;category:string;title:{es:string;en:string};body:{es:string;en:string}};
export const PROMPT_CATEGORIES:Record<string,[string,string]>={"product":["Productos","Products"],"lifestyle":["Lifestyle","Lifestyle"],"personal":["Marca personal","Personal brand"],"food":["Food","Food"],"beauty":["Beauty","Beauty"],"services":["Servicios","Services"],"cleaning":["Cleaning","Cleaning"],"podcast":["Podcast","Podcast"],"education":["Cursos","Courses"],"tech":["Apps / Tech","Apps / Tech"],"luxury":["Premium","Premium"],"marketing":["Marketing","Marketing"]};
// Premium template bodies are fetched from Supabase RLS after authentication.
// Do NOT embed paid prompt text in a public GitHub Pages bundle.
export const fillTemplate=(input:string,values:{subject?:string;background?:string})=>
 input.replace(/\{\{(subject|background)\}\}/g,(_,key:string)=>values[key as keyof typeof values]?.trim()||(key==='subject'?'your real reference subject':'a natural editorial backdrop'));
export const promptLang=(language:string):LabLanguage=>language==='English'?'en':'es';

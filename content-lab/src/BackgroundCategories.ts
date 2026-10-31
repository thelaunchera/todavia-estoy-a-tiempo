/**
 * Single source of truth for the public Content Lab background gallery and
 * the in-editor picker. The retired ribbon collection remains renderable for
 * previously saved posts, but is no longer suggested in either gallery.
 */
import type {FreeBackgroundId} from './FreeDesignAssets';

export type BackgroundCategory='all'|'minimal'|'gradients'|'paper'|'editorial'|'retro'|'dark'|'scrapbook';
export const BACKGROUND_CATEGORIES:{id:Exclude<BackgroundCategory,'all'>;label:string;description:string;ids:readonly FreeBackgroundId[]}[]=[
 {id:'minimal',label:'Minimalistas',description:'Colores limpios y fondos suaves',
  ids:['brand','warm-paper','soft-blue','sage','butter-cream','pink-paper']},
 {id:'gradients',label:'Gradientes',description:'Transiciones de color y luz',
  ids:['soft-gradient','sunset-peach','lavender-haze']},
 {id:'paper',label:'Papel y texturas',description:'Texturas sutiles y notas de papel',
  ids:['grain-ivory','dotted-paper','vintage-paper','journal-tape']},
 {id:'editorial',label:'Editoriales',description:'Grillas, líneas y detalles botánicos',
  ids:['editorial-grid','blueprint-lines','botanical-sage']},
 {id:'retro',label:'Retro y otoño',description:'Cuadros, café y tonos terracota',
  ids:['rust-autumn','terracotta-check','coffee-check']},
 {id:'dark',label:'Oscuros',description:'Contraste, noche y fondos intensos',
  ids:['night-editorial','night-stars']},
 {id:'scrapbook',label:'Scrapbook',description:'Recortes, collage y papel creativo',
  ids:['scrapbook-pink-checkers','scrapbook-lavender-notebook',
    'scrapbook-sage-botanical','scrapbook-blue-film','scrapbook-coral-retro',
    'scrapbook-black-zine','scrapbook-butter-yellow','scrapbook-chocolate-vintage']},
];
const lookup=new Map<FreeBackgroundId,Exclude<BackgroundCategory,'all'>>();
BACKGROUND_CATEGORIES.forEach(category=>category.ids.forEach(id=>lookup.set(id,category.id)));
export function categoryOfBackground(id:FreeBackgroundId){
 return lookup.get(id);
}
export function belongsToBackgroundCategory(id:FreeBackgroundId,category:BackgroundCategory){
 return category==='all'?lookup.has(id):lookup.get(id)===category;
}

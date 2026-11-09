/* Cuatro videos esenciales. Las fichas antiguas de producción siguen archivadas en la base de datos. */
export const CORE_LESSON_CODES=Object.freeze(['01','05','06','08']);

const lessons={
 '01':{
  es:{title:'Empieza con ChatGPT',description:'Abre ChatGPT, cuenta qué hace tu negocio y autoriza solo las conexiones necesarias para preparar tu idea.'},
  en:{title:'Start with ChatGPT',description:'Open ChatGPT, describe your business and authorize only the connections you need to plan your website.'},
  links:[
   {es:'Abrir ChatGPT',en:'Open ChatGPT',url:'https://chatgpt.com/'},
   {es:'Mis archivos en Google Drive',en:'My Google Drive files',url:'https://drive.google.com/drive/u/0/my-drive'}
  ]
 },
 '05':{
  es:{title:'Crea tu web con IA',description:'Con un solo prompt, la IA construye una primera versión de tu web. Revisa el resultado antes de publicarlo.'},
  en:{title:'Build your website with AI',description:'Use one clear prompt to have AI build your first website draft. Review it before publishing.'},
  links:[
   {es:'Ver AppDeploy y sus planes',en:'See AppDeploy plans',url:'https://appdeploy.ai/pricing'},
   {es:'Ver el ejemplo Casa Brownie',en:'See the Casa Brownie example',url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video'}
  ]
 },
 '06':{
  es:{title:'Mejora tu página',description:'Muestra a ChatGPT una captura y pide corregir fotos, textos o ajustes de móvil, sin rehacer toda la web.'},
  en:{title:'Improve your website',description:'Share a screenshot with ChatGPT to fix photos, copy or mobile layout without rebuilding everything.'},
  links:[
   {es:'Abrir ChatGPT para corregir',en:'Open ChatGPT to make changes',url:'https://chatgpt.com/'},
   {es:'Ejemplo de diseño',en:'Design example',url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video'}
  ]
 },
 '08':{
  es:{title:'Publica y comprueba',description:'Abre el enlace real de tu web como visitante y comprueba el menú, las fotos, los botones y la vista móvil.'},
  en:{title:'Publish and test',description:'Open your live website link as a visitor. Check the menu, photos, buttons and mobile layout.'},
  links:[
   {es:'Abrir ChatGPT para revisar',en:'Open ChatGPT to review',url:'https://chatgpt.com/'},
   {es:'Comparar con Casa Brownie',en:'Compare with Casa Brownie',url:'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video'}
  ]
 }
};
export function coreLessonText(lesson,language='es'){
 const item=lessons[lesson?.lesson_code];
 return item?item[language==='en'?'en':'es']:null;
}
export function coreLessonLinks(lesson,language='es'){
 return (lessons[lesson?.lesson_code]?.links||[]).map(item=>({label:item[language==='en'?'en':'es'],url:item.url}));
}
export function localizeCoreClassroom(language='es'){
 if(typeof document==='undefined')return;
 const lang=language==='en'?'en':'es';
 document.querySelectorAll('[data-class-es][data-class-en]').forEach(node=>{
  node.textContent=lang==='en'?node.getAttribute('data-class-en'):node.getAttribute('data-class-es');
 });
}

/** Recursos editoriales exclusivos del Studio privado. No importarlos en Content Lab. */
export const SOVA_CAROUSEL_DRIVE = 'https://drive.google.com/drive/folders/1dcvRv6uM4t6qz7PIkhALKJLwjGnvkJ0p';
export const SOVA_CAROUSEL_ASSETS = [
  {id:'cinta-azul-satin',name:'Cinta azul satinada',file:'cinta-azul-satin.svg',width:1060},
  {id:'banner-cobalto-cola',name:'Banner cobalto con colas',file:'banner-cobalto-cola.svg',width:1080},
  {id:'papel-rasgado-azul',name:'Papel azul rasgado',file:'papel-rasgado-azul.svg',width:1050},
  {id:'audifonos-linea',name:'Audífonos ilustrados',file:'audifonos-linea.svg',width:480},
  {id:'onda-audio',name:'Onda sonora',file:'onda-audio.svg',width:1050},
  {id:'etiqueta-sonido',name:'Etiqueta de sonido',file:'etiqueta-sonido.svg',width:750},
  {id:'marco-capsula',name:'Marco cápsula',file:'marco-capsula.svg',width:1020},
  {id:'cinta-diagonal-marfil',name:'Cinta marfil diagonal',file:'cinta-diagonal-marfil.svg',width:1060},
] as const;
export type SovaCarouselAsset = typeof SOVA_CAROUSEL_ASSETS[number];

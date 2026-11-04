/** Kit privado del carrusel del Studio. No se importa en Content Lab. */
export const GOLDEN_GRID_CAROUSEL_DRIVE = 'https://drive.google.com/drive/folders/1MTmCioPbfZ6GAPg2Mzqw0BBvcLCTiFsv';
export const GOLDEN_GRID_CAROUSEL_ASSETS = [
  {
    "id": "cinta-plegada-roja",
    "name": "Cinta roja plegada",
    "file": "cinta-plegada-roja.svg",
    "width": 920
  },
  {
    "id": "banner-onda-azul",
    "name": "Banner azul ondulado",
    "file": "banner-onda-azul.svg",
    "width": 1080
  },
  {
    "id": "cupon-mantequilla",
    "name": "Cupón amarillo troquelado",
    "file": "cupon-mantequilla.svg",
    "width": 920
  },
  {
    "id": "etiqueta-clip-azul",
    "name": "Etiqueta azul con clip",
    "file": "etiqueta-clip-azul.svg",
    "width": 920
  },
  {
    "id": "cinta-vichy-azul",
    "name": "Cinta vichy azul",
    "file": "cinta-vichy-azul.svg",
    "width": 1080
  },
  {
    "id": "papel-rasgado-marfil",
    "name": "Papel marfil rasgado",
    "file": "papel-rasgado-marfil.svg",
    "width": 1080
  },
  {
    "id": "banner-cola-roja",
    "name": "Banner rojo con cola larga",
    "file": "banner-cola-roja.svg",
    "width": 340
  },
  {
    "id": "etiqueta-festoneada",
    "name": "Etiqueta festoneada editorial",
    "file": "etiqueta-festoneada.svg",
    "width": 920
  },
  {
    "id": "cinta-satin-roja",
    "name": "Cinta roja satinada",
    "file": "cinta-satin-roja.png",
    "width": 1100
  }
] as const;
export type GoldenGridCarouselAsset = typeof GOLDEN_GRID_CAROUSEL_ASSETS[number];

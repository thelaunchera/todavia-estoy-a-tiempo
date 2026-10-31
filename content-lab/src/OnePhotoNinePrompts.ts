/**
 * Eight composition directions from the Content Lab freebie "One Photo,
 * Eight Compositions", plus an original ninth sensory product hero.
 * The reference photo is attached manually by the user in ChatGPT.
 */
export const ONE_PHOTO_NINE=[
 {name:'Asymmetric Editorial',short:'Producto protagonista a la derecha',
  layout:'Place hero product on RIGHT, about 55% of canvas width. Stack main headline LEFT with small information below; asymmetrical but balanced negative space.',
  shot:'Art-directed three-quarter hero view, tactile real surfaces, soft daylight falling naturally across the product.'},
 {name:'Monumental Center',short:'Impacto grande, producto central',
  layout:'Use a monumental upper-middle headline taking 80-90% width. Center product BELOW with an intentional safe lower-edge crop. Secondary copy at small corners.',
  shot:'Confident front-facing hero product photography, realistic contact shadow, fine texture and premium color separation.'},
 {name:'Type Behind Product',short:'Tipografía detrás del producto',
  layout:'Make huge headline a background typographic layer. Center product in FOREGROUND, obscuring a few headline letters without losing readability. Keep support copy on clean edges.',
  shot:'Gently directional side light, crisp product edges, believable depth with no artificial glow.'},
 {name:'Side-Cropped Close-Up',short:'Detalle cercano, textura visible',
  layout:'Enlarge the real product to enter from ONE SIDE and BOTTOM. Reserve an uninterrupted opposing zone for stacked copy. Essential labels must remain readable.',
  shot:'Premium macro product photography, close visual attention to authentic textures, liquid, condensation or material details only when actually present.'},
 {name:'Offset Negative Space',short:'Producto abajo y espacio limpio',
  layout:'Put product in LOWER RIGHT at medium-large size. Compact headline in UPPER LEFT, unusually spacious center, tiny refined corner details.',
  shot:'Minimal editorial still-life, nuanced naturally occurring shadows, calm warm or neutral backdrop.'},
 {name:'Diagonal Visual Flow',short:'Composición diagonal dinámica',
  layout:'Place product HIGH RIGHT and headline LOW LEFT, forming diagonal flow by visual position. Do not rotate letters or warp the product.',
  shot:'Slightly elevated three-quarter camera angle, subtle organic energy, realistic photographic perspective.'},
 {name:'Vertical Editorial Stack',short:'Jerarquía editorial vertical',
  layout:'Three zones: narrow title at TOP, supporting content at MID, product emerging from BOTTOM. Strict vertical editorial rhythm and generous breathing room.',
  shot:'Realistic premium campaign photograph, beautiful restrained lighting, clear depth and natural material grain.'},
 {name:'Magazine Column Split',short:'Revista, texto y producto',
  layout:'Unequal editorial columns: LEFT 33% for title/copy and RIGHT 67% for one large product. Align typography to an invisible common grid.',
  shot:'Modern magazine-style object photography, honest studio lighting with human-scale surfaces and subtle tactile detail.'},
 {name:'Sensory Product Hero',short:'Foto sensorial estilo campaña',
  layout:'ONE striking original lifestyle or product-only frame. Editorial hero composition with the exact product large and recognizable, a deliberate natural crop, generous negative space and no invented text.',
  shot:'Inspired by premium matcha campaign photography: believable daylight, beautiful real texture, subtle condensation or movement ONLY when appropriate to the actual subject, an organic photographic moment rather than glossy CGI.'}
] as const;
export type OnePhotoPromptOptions={
 product:string;brandName:string;headline?:string;support?:string;
 palette?:string;notes?:string;language?:string;isPoster?:boolean;
};
export function onePhotoNinePrompt(index:number,opts:OnePhotoPromptOptions):string{
 const i=Math.max(0,Math.min(ONE_PHOTO_NINE.length-1,Math.floor(index)||0));
 const item=ONE_PHOTO_NINE[i];
 const original=opts.product.trim()||'the exact product visible in my attached reference photo';
 const brand=opts.brandName.trim()||'my brand';
 const headline=opts.headline?.trim()||'';
 const support=opts.support?.trim()||'';
 const language=/español|spanish|es\b/i.test(opts.language||'')?'Latin American Spanish':'US English';
 return [
  'CREATE ONE IMAGE ONLY — '+item.name+' — COMPOSITION '+(i+1)+' OF 9.',
  'I will attach ONE product image. Treat that attached image as the ONLY authoritative product reference. If I have not attached it yet, ask me to upload it BEFORE generating any image.',
  'Create one stand-alone premium editorial 4:5 social post (1080 × 1350 or the highest available resolution), not a contact sheet, not nine pictures, not a collage.',
  'ACTUAL PRODUCT: '+original+'. BRAND: '+brand+'.',
  'Preserve the real product identity faithfully: shape, materials, color, proportions, texture, packaging, logo, labels and print. Do not redesign the product, invent branding, duplicate items or add unsupported claims. If the reference is a finished poster, retain all original printed text and move/resize only.',
  'ART DIRECTION: '+item.shot+' Aim for the photographic realism and polished editorial variety of a high-end matcha campaign, while adapting to the ACTUAL product shown; do not insert matcha, cups or food unless they are present or appropriate.',
  'COMPOSITION RULE: '+item.layout,
  'PALETTE: '+(opts.palette?.trim()||'cohesive premium colors inspired by the real product and brand')+'.',
  'TEXT: '+(headline?'Use this exact headline verbatim: '+headline:'Do not add any overlay headline, fake typography or placeholder text.')+(support?' Supporting copy, exactly: '+support:' No extra small print.')+' Any supplied text is '+language+'. Never invent or translate the exact supplied words.',
  'USER NOTES: '+(opts.notes?.trim()||'Do not add unnecessary decorations.')+'.',
  'Keep physical reflections, realistic shadows, lens behavior and light falloff believable. Prefer natural texture, considered editorial hierarchy and beautiful negative space. Avoid plastic CGI, fake floating products, weird hands, warped logos, unreadable lettering, exaggerated filters, duplicate objects or generic stock-photo staging.',
  'Return ONE final 4:5 image only. No explanation.'
 ].join('\n\n');
}

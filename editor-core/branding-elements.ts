/** Original, shared, scalable branding assets. No customer content is included. */
export type BrandAsset={id:string;name:string;category:'Patrones'|'Papelería'|'Sellos'|'Ilustraciones'|'Packaging'|'Acentos';width:number;wallpaper?:boolean};
export const BRANDING_ELEMENTS:BrandAsset[]=[
{id:'gingham',name:'Gingham editorial',category:'Patrones',width:1080,wallpaper:true},
{id:'checker',name:'Checkerboard retro',category:'Patrones',width:1080,wallpaper:true},
{id:'stripe',name:'Rayas vintage',category:'Patrones',width:1080,wallpaper:true},
{id:'scallop',name:'Ondas repetidas',category:'Patrones',width:1080,wallpaper:true},
{id:'grid',name:'Cuadrícula de cuaderno',category:'Patrones',width:1080,wallpaper:true},
{id:'grain',name:'Papel texturizado',category:'Patrones',width:1080,wallpaper:true},
{id:'notecard',name:'Tarjeta de papel',category:'Papelería',width:710},
{id:'postcard',name:'Postal dividida',category:'Papelería',width:730},
{id:'washi',name:'Cintas diagonales',category:'Papelería',width:730},
{id:'ticket',name:'Ticket troquelado',category:'Packaging',width:680},
{id:'hangtag',name:'Etiqueta colgante',category:'Packaging',width:530},
{id:'ribbon',name:'Cinta plegada',category:'Packaging',width:780},
{id:'roundstamp',name:'Sello circular',category:'Sellos',width:530},
{id:'flowerseal',name:'Emblema floral',category:'Sellos',width:540},
{id:'sunburst',name:'Sello de rayos',category:'Sellos',width:540},
{id:'cup',name:'Taza ilustrada',category:'Ilustraciones',width:460},
{id:'flower',name:'Flor dibujada',category:'Ilustraciones',width:420},
{id:'cherries',name:'Cerezas dibujadas',category:'Ilustraciones',width:440},
{id:'leaves',name:'Rama de hojas',category:'Ilustraciones',width:460},
{id:'asterisk',name:'Asterisco orgánico',category:'Acentos',width:280},
{id:'swoosh',name:'Subrayado expresivo',category:'Acentos',width:690},
{id:'fold',name:'Esquina de papel',category:'Acentos',width:400},
];
export const brandingElementId=(id:string)=>'brand-element:'+id;
const path=(d:string,k:string,w=10,fill='none')=>'<path d="'+d+'" fill="'+fill+'" stroke="'+k+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
const rect=(x:number,y:number,w:number,h:number,fill:string)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>';
const circ=(x:number,y:number,r:number,fill:string,stroke='none')=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="7"/>';
export function brandingElementSvg(id:string,accent='#F2D85B'){
 const a=/^#[0-9a-f]{6}$/i.test(accent)?accent:'#F2D85B',k='#191919',c='#FAF8F3',b='#DCECF4';
 let s='';
 if(id==='checker')s=rect(0,0,800,1000,c)+Array.from({length:80},(_,i)=>(i%8+Math.floor(i/8))%2===0?rect(i%8*100,Math.floor(i/8)*100,100,100,a):'').join('');
 else if(id==='gingham')s=rect(0,0,800,1000,c)+Array.from({length:8},(_,i)=>rect(i*105,0,48,1000,a)).join('')+Array.from({length:10},(_,i)=>rect(0,i*105,800,48,a)).join('');
 else if(id==='stripe')s=rect(0,0,800,1000,c)+Array.from({length:8},(_,i)=>rect(i*120,0,57,1000,i%2?a:b)).join('');
 else if(id==='scallop')s=rect(0,0,800,1000,c)+Array.from({length:100},(_,i)=>path('M'+(i%10*90-30)+' '+(Math.floor(i/10)*100+70)+' q45 -90 90 0',i%2?a:k,9)).join('');
 else if(id==='grid')s=rect(0,0,800,1000,c)+Array.from({length:11},(_,i)=>path('M'+(i*90)+' 0 V1000',b,5)+path('M0 '+(i*100)+' H800',b,5)).join('');
 else if(id==='grain')s=rect(0,0,800,1000,c)+Array.from({length:260},(_,i)=>circ((i*139+11)%800,(i*223+57)%1000,i%3+1,k)).join('');
 else if(id==='notecard')s=path('M94 198 L170 178 230 192 322 173 413 193 490 173 574 191 700 182 714 795 637 807 534 787 456 815 357 791 256 812 175 789 94 803Z',k,9,c)+path('M165 390 H645 M165 470 H600 M165 550 H645',a,16);
 else if(id==='postcard')s='<rect x="76" y="227" width="648" height="546" rx="14" fill="'+c+'" stroke="'+k+'" stroke-width="9"/>'+path('M400 260 V733 M125 500 H345 M125 575 H345 M125 649 H300',k,6)+'<rect x="551" y="269" width="134" height="155" fill="'+b+'" stroke="'+k+'" stroke-width="6"/>';
 else if(id==='washi')s='<g transform="rotate(-9 400 490)">'+rect(60,320,685,130,a)+rect(130,525,575,105,b)+Array.from({length:10},(_,i)=>path('M'+(i*70+62)+' 325 l65 117',c,5)).join('')+'</g>';
 else if(id==='ticket')s=path('M106 223 H691 V365 Q620 433 691 503 V626 Q618 695 691 758 H106 V660 Q179 595 106 528 V424 Q182 361 106 302Z',k,10,a)+path('M259 266 V716 M340 429 H601 M340 502 H600 M340 576 H521',k,9);
 else if(id==='hangtag')s=path('M254 222 H543 L653 352 V769 H152 V355Z',k,10,c)+circ(402,326,28,b,k)+path('M402 326 Q465 162 530 116 M234 538 H566 M275 624 H520',k,9);
 else if(id==='ribbon')s=path('M93 322 L212 383 615 342 702 290 673 443 706 578 599 522 183 554 81 615 130 461Z',k,9,a)+path('M184 379 Q398 330 606 355 M189 540 Q400 490 610 515',c,11);
 else if(id==='roundstamp')s=circ(400,500,271,c,k)+circ(400,500,220,b,k)+circ(400,500,144,a,k)+path('M329 500 H471 M400 430 V570',k,16);
 else if(id==='flowerseal')s=Array.from({length:16},(_,i)=>{const t=i*Math.PI/8;return circ(400+188*Math.cos(t),500+188*Math.sin(t),78,a,k)}).join('')+circ(400,500,179,c,k)+circ(400,500,75,b,k);
 else if(id==='sunburst')s=Array.from({length:18},(_,i)=>{const t=i*Math.PI/9;return path('M'+(400+176*Math.cos(t))+' '+(500+176*Math.sin(t))+' L'+(400+289*Math.cos(t))+' '+(500+289*Math.sin(t)),k,17)}).join('')+circ(400,500,148,a,k);
 else if(id==='cup')s=path('M216 372 Q208 655 318 694 Q407 738 516 690 Q593 635 577 372Z',k,15,c)+path('M578 394 Q722 359 699 507 Q688 582 578 532 M256 768 Q400 802 548 768 M337 288 Q290 227 342 179 M438 289 Q391 227 441 179',k,14);
 else if(id==='flower')s=Array.from({length:7},(_,i)=>{const t=i*Math.PI*2/7;return circ(400+135*Math.cos(t),420+135*Math.sin(t),91,i%2?a:b,k)}).join('')+circ(400,420,66,c,k)+path('M399 586 Q418 697 394 821 M393 730 Q271 650 229 700',k,13);
 else if(id==='cherries')s=path('M323 444 Q331 257 469 186 Q490 283 519 439 M469 186 Q400 108 315 186',k,14)+circ(330,575,126,a,k)+circ(525,575,126,a,k);
 else if(id==='leaves')s=path('M208 815 Q392 522 586 170',k,14)+Array.from({length:7},(_,i)=>{let x=281+i*48,y=705-i*66;return '<ellipse cx="'+(x-54)+'" cy="'+y+'" rx="79" ry="28" transform="rotate(-44 '+(x-54)+' '+y+')" fill="'+a+'" stroke="'+k+'" stroke-width="5"/><ellipse cx="'+(x+54)+'" cy="'+(y-45)+'" rx="79" ry="28" transform="rotate(36 '+(x+54)+' '+(y-45)+')" fill="'+b+'" stroke="'+k+'" stroke-width="5"/>'}).join('');
 else if(id==='asterisk')s=Array.from({length:8},(_,i)=>{const t=i*Math.PI/4;return path('M400 500 Q'+(400+80*Math.cos(t+.2))+' '+(500+80*Math.sin(t+.2))+' '+(400+244*Math.cos(t))+' '+(500+244*Math.sin(t)),k,34)}).join('');
 else if(id==='swoosh')s=path('M90 560 Q290 404 511 528 Q649 591 718 412 M138 644 Q389 565 635 636',a,30);
 else if(id==='fold')s=path('M150 178 H661 V692 L512 838 H150Z',k,9,b)+path('M512 838 V692 H661Z',k,9,a)+path('M239 345 H579 M239 430 H560 M239 515 H505',k,11);
 return '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">'+s+'</svg>';
}
export const brandingElementUrl=(asset:BrandAsset|string,accent='#F2D85B')=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(brandingElementSvg(typeof asset==='string'?asset:asset.id,accent));
export const brandingElementImages=(accent='#F2D85B'):Record<string,string>=>Object.fromEntries(BRANDING_ELEMENTS.map(asset=>[brandingElementId(asset.id),brandingElementUrl(asset,accent)]));

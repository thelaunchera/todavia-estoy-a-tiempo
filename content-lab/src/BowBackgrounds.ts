/**
 * Twenty original coquette / ribbon aesthetic backgrounds for Content Lab.
 * Drawn at the requested canvas resolution: no Pinterest art is copied or embedded.
 * Both gallery previews and exported PNG use exactly this painter.
 */
export const BOW_BACKGROUNDS=[
 {id:'bow-ballet-gingham',name:'Ballet Gingham',color:'#F7E0E7',description:'Cuadros rosa, lazos de satén',group:'Lazos'},
 {id:'bow-vintage-lace',name:'Lace & Letters',color:'#F6E9E4',description:'Encaje vintage, rosa empolvado',group:'Vintage'},
 {id:'bow-cherry-ribbon',name:'Cherry Ribbon',color:'#FFF1E8',description:'Cerezas y lazos rojos',group:'Lazos'},
 {id:'bow-cafe-creme',name:'Café Crème',color:'#EFE0CC',description:'Café con leche y moños crema',group:'Retro'},
 {id:'bow-blue-coquette',name:'Blue Coquette',color:'#E5F0F4',description:'Azul cielo y cintas perladas',group:'Lazos'},
 {id:'bow-burgundy-velvet',name:'Velvet Romance',color:'#532936',description:'Borgoña con lazos champán',group:'Oscuros'},
 {id:'bow-ballet-slipper',name:'Ballet Slipper',color:'#F8E6EC',description:'Satén rosa suave y balletcore',group:'Lazos'},
 {id:'bow-strawberry-picnic',name:'Strawberry Picnic',color:'#FDE5DE',description:'Picnic, fresas y cintas',group:'Retro'},
 {id:'bow-lemon-sugar',name:'Lemon Sugar',color:'#FFF4D9',description:'Mantequilla, limón y lazos',group:'Lazos'},
 {id:'bow-lavender-mist',name:'Lavender Mist',color:'#EEE5F7',description:'Lazos lavanda en fondo etéreo',group:'Lazos'},
 {id:'bow-midnight-pearls',name:'Midnight Pearls',color:'#202330',description:'Perlas y lazos nocturnos',group:'Oscuros'},
 {id:'bow-botanical-love',name:'Botanical Love',color:'#EAF0E7',description:'Hojas delicadas y cintas',group:'Vintage'},
 {id:'bow-polka-ribbon',name:'Polka Ribbon',color:'#F6E9EC',description:'Lunares retro y satén',group:'Retro'},
 {id:'bow-pearl-frame',name:'Pearl Frame',color:'#FFF7F1',description:'Marco de perlas y lazo central',group:'Vintage'},
 {id:'bow-paper-scrapbook',name:'Bow Scrapbook',color:'#F1E8DA',description:'Papel rasgado, washi y lazos',group:'Vintage'},
 {id:'bow-ribbon-stripes',name:'Ribbon Stripes',color:'#F5E4EA',description:'Rayas finas y cintas',group:'Retro'},
 {id:'bow-heart-notes',name:'Love Notes',color:'#FCE7EA',description:'Corazones bordados y moños',group:'Lazos'},
 {id:'bow-blue-toile',name:'Blue Toile',color:'#F3F5F4',description:'Ilustración francesa azul',group:'Vintage'},
 {id:'bow-autumn-girl',name:'Autumn Bow',color:'#E9D4BE',description:'Cuadros canela y lazo chocolate',group:'Retro'},
 {id:'bow-party-charm',name:'Party Ribbons',color:'#F8E9F0',description:'Listones de fiesta, perlitas',group:'Lazos'},
] as const;
export type BowBackgroundId=typeof BOW_BACKGROUNDS[number]['id'];
export const isBowBackground=(id:unknown):id is BowBackgroundId=>
 BOW_BACKGROUNDS.some(b=>b.id===id);

type Ctx=CanvasRenderingContext2D;
function fillGradient(ctx:Ctx,w:number,h:number,a:string,b:string,mode:'diagonal'|'radial'|'vertical'='diagonal'){
 if(mode==='radial'){
  const g=ctx.createRadialGradient(w*.23,h*.17,w*.03,w*.57,h*.49,w*.96);
  g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;
 }else{
  const g=ctx.createLinearGradient(0,0,mode==='vertical'?0:w,h);
  g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;
 }
 ctx.fillRect(0,0,w,h);
}
function satinBow(ctx:Ctx,x:number,y:number,size:number,rose:string,edge:string,angle=0,opacity=1){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(size,size);ctx.globalAlpha*=opacity;
 ctx.shadowColor='#34172340';ctx.shadowBlur=Math.max(2,size*.048);ctx.shadowOffsetY=Math.max(1,size*.013);
 const loop=(side:number)=>{
  ctx.save();ctx.scale(side,1);ctx.beginPath();
  ctx.moveTo(0,.005);ctx.bezierCurveTo(.2,-.16,.54,-.47,.59,-.20);
  ctx.bezierCurveTo(.64,.07,.30,.22,.05,.065);ctx.closePath();
  let g=ctx.createLinearGradient(0,-.32,.45,.18);
  g.addColorStop(0,'#FFFDF8');g.addColorStop(.22,rose);g.addColorStop(.68,rose);g.addColorStop(1,edge);
  ctx.fillStyle=g;ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=edge;ctx.lineWidth=.012;ctx.stroke();
  ctx.beginPath();ctx.moveTo(.058,.04);ctx.bezierCurveTo(.30,-.18,.48,-.25,.57,-.19);
  ctx.strokeStyle='#FFFFFF8f';ctx.lineWidth=.022;ctx.stroke();ctx.restore();
 };
 const tail=(side:number)=>{
  ctx.save();ctx.scale(side,1);ctx.beginPath();ctx.moveTo(.04,.055);
  ctx.bezierCurveTo(.11,.24,.31,.40,.40,.72);
  ctx.lineTo(.24,.61);ctx.lineTo(.07,.78);
  ctx.bezierCurveTo(.005,.40,-.08,.19,.04,.055);ctx.closePath();
  const g=ctx.createLinearGradient(0,0,.32,.65);
  g.addColorStop(0,'#fffbfa');g.addColorStop(.28,rose);g.addColorStop(1,edge);
  ctx.fillStyle=g;ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=edge;
  ctx.lineWidth=.013;ctx.stroke();
  ctx.beginPath();ctx.moveTo(.09,.17);ctx.quadraticCurveTo(.21,.35,.28,.62);
  ctx.strokeStyle='#FFFFFF99';ctx.lineWidth=.012;ctx.stroke();ctx.restore();
 };
 tail(-1);tail(1);loop(-1);loop(1);
 ctx.shadowBlur=0;ctx.fillStyle=edge;ctx.beginPath();ctx.roundRect(-.09,-.105,.18,.20,.055);ctx.fill();
 const knot=ctx.createLinearGradient(-.08,-.08,.09,.06);knot.addColorStop(0,'#FFF8F3');
 knot.addColorStop(.38,rose);knot.addColorStop(1,edge);ctx.fillStyle=knot;
 ctx.beginPath();ctx.roundRect(-.074,-.088,.148,.164,.044);ctx.fill();
 ctx.restore();
}
function pattern(ctx:Ctx,w:number,h:number,kind:'gingham'|'checks'|'stripes'|'polka'|'floral'|'grain',tint:string){
 ctx.save();
 if(kind==='gingham'||kind==='checks'){
  const cell=Math.max(25,w/(kind==='checks'?9:13));
  ctx.globalAlpha=kind==='checks'?.22:.18;ctx.fillStyle=tint;
  for(let x=0;x<w;x+=cell)for(let y=0;y<h;y+=cell){
   const col=Math.round(x/cell),row=Math.round(y/cell);
   if((col+row)%2===0)ctx.fillRect(x,y,cell,cell);
  }
  if(kind==='gingham'){
   ctx.globalAlpha=.10;for(let x=0;x<w;x+=cell*2)ctx.fillRect(x,0,cell,w*10);
   for(let y=0;y<h;y+=cell*2)ctx.fillRect(0,y,w,cell);
  }
 }else if(kind==='stripes'){
  ctx.globalAlpha=.16;ctx.strokeStyle=tint;ctx.lineWidth=Math.max(3,w*.018);
  for(let x=-h;x<w+h;x+=Math.max(55,w*.16)){
   ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+h*.42,h);ctx.stroke();
  }
 }else if(kind==='polka'){
  ctx.fillStyle=tint;ctx.globalAlpha=.23;
  const step=Math.max(48,w*.115);
  for(let row=0,y=step*.45;y<h;y+=step,row++)
   for(let x=step*.45+(row%2)*step*.48;x<w;x+=step){
    ctx.beginPath();ctx.arc(x,y,w*.008,0,Math.PI*2);ctx.fill();
   }
 }else if(kind==='floral'){
  ctx.globalAlpha=.30;
  for(let i=0;i<70;i++){
   const x=((i*129+39)%997)/997*w,y=((i*379+64)%991)/991*h;
   const sz=w*(.009+(i%5)*.0015);ctx.fillStyle=tint;
   for(let p=0;p<5;p++){
    const a=p*Math.PI*2/5;ctx.beginPath();
    ctx.ellipse(x+Math.cos(a)*sz,y+Math.sin(a)*sz,sz*.64,sz*.90,a,0,Math.PI*2);ctx.fill();
   }
   ctx.fillStyle='#EBC4A2';ctx.beginPath();ctx.arc(x,y,sz*.48,0,Math.PI*2);ctx.fill();
  }
 }else{
  ctx.globalAlpha=.10;ctx.fillStyle=tint;
  for(let i=0;i<430;i++){
   const x=((i*313+37)%1009)/1009*w,y=((i*211+19)%997)/997*h;
   ctx.fillRect(x,y,Math.max(.65,w*.0009),Math.max(.65,w*.0009));
  }
 }
 ctx.restore();
}
function pearls(ctx:Ctx,w:number,h:number,color:string,mode:'frame'|'curve'='frame'){
 ctx.save();ctx.fillStyle=color;ctx.strokeStyle='#B7A9A077';
 const radius=Math.max(2,w*.0065);
 const draw=(x:number,y:number)=>{
  const g=ctx.createRadialGradient(x-radius*.3,y-radius*.36,radius*.05,x,y,radius);
  g.addColorStop(0,'#FFFFFF');g.addColorStop(.45,color);g.addColorStop(1,'#AD9C9677');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
 };
 if(mode==='frame'){
  const gap=w*.046;
  for(let x=gap;x<w-gap;x+=gap){draw(x,h*.05);draw(x,h*.95)}
  for(let y=h*.09;y<h*.94;y+=gap){draw(w*.055,y);draw(w*.945,y)}
 }else for(let i=0;i<48;i++){
  const t=i/47,x=w*(.08+.84*t),y=h*(.24+.055*Math.sin(t*2*Math.PI));
  draw(x,y);
 }
 ctx.restore();
}
function lace(ctx:Ctx,w:number,h:number,edge:'top'|'bottom'|'both'='both'){
 ctx.save();ctx.globalAlpha=.64;
 const doEdge=(y:number,d:number)=>{
  ctx.fillStyle='#FFFFFFCA';ctx.fillRect(0,y,w,h*.038);
  const step=w*.05;
  for(let x=step/2;x<w+step;x+=step){
   ctx.beginPath();ctx.arc(x,y+d*h*.032,step*.42,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='#D1B7B17A';ctx.lineWidth=Math.max(1,w*.001);
   ctx.stroke();
   ctx.beginPath();ctx.arc(x,y+d*h*.033,step*.19,0,Math.PI*2);
   ctx.strokeStyle='#D2B9B98F';ctx.stroke();
  }
 };
 if(edge!=='bottom')doEdge(0,1);
 if(edge!=='top')doEdge(h*.96,-1);
 ctx.restore();
}
function foliage(ctx:Ctx,w:number,h:number,tint:string){
 ctx.save();ctx.lineCap='round';ctx.strokeStyle=tint;ctx.fillStyle=tint;ctx.globalAlpha=.33;
 [[.02,.35,1],[.97,.18,-1],[.02,.89,1],[.98,.77,-1]].forEach(([px,py,d],i)=>{
  ctx.save();ctx.translate(px*w,py*h);ctx.rotate((i%2===0?1:-1)*.16);
  ctx.lineWidth=Math.max(1,w*.003);ctx.beginPath();ctx.moveTo(0,h*.12);
  ctx.quadraticCurveTo(w*.12*d,h*.06,w*.15*d,-h*.19);ctx.stroke();
  for(let j=0;j<5;j++){
   const x=(j*.027+.03)*w*d,y=(.055-j*.053)*h;
   ctx.beginPath();ctx.ellipse(x,y,w*.042,h*.014,d*.4,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 });
 ctx.restore();
}
function cherries(ctx:Ctx,w:number,h:number){
 ctx.save();
 for(let i=0;i<14;i++){
  const x=((i*233+53)%997)/997*w,y=((i*347+79)%991)/991*h,s=w*.017;
  ctx.strokeStyle='#67816D';ctx.lineWidth=Math.max(1,w*.0025);
  ctx.beginPath();ctx.moveTo(x,y-s*1.8);ctx.quadraticCurveTo(x-s*2,y-s*.6,x-s,y+s);
  ctx.moveTo(x,y-s*1.8);ctx.quadraticCurveTo(x+s*2,y-s*.6,x+s,y+s);ctx.stroke();
  ctx.fillStyle='#B93247';for(const d of [-1,1]){
   ctx.beginPath();ctx.arc(x+d*s,y+s,s,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#FFE1DA';ctx.beginPath();ctx.arc(x+d*s-s*.32,y+s-s*.34,s*.22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#B93247';
  }
 }
 ctx.restore();
}
function hearts(ctx:Ctx,w:number,h:number,tint:string){
 ctx.save();ctx.globalAlpha=.36;ctx.fillStyle=tint;
 for(let i=0;i<30;i++){
  const x=((i*151+63)%991)/991*w,y=((i*389+23)%997)/997*h,r=w*.009;
  ctx.beginPath();ctx.moveTo(x,y+r);ctx.bezierCurveTo(x-r*2,y-r*.3,x-r,y-r*2,x,y-r*.75);
  ctx.bezierCurveTo(x+r,y-r*2,x+r*2,y-r*.3,x,y+r);ctx.fill();
 }
 ctx.restore();
}
function cornerBows(ctx:Ctx,w:number,h:number,palette:[string,string],mode:'corners'|'scatter'|'single'|'edge'|'center'='corners'){
 const [rose,edge]=palette;
 if(mode==='corners'){
  satinBow(ctx,w*.13,h*.11,w*.20,rose,edge,-.24,.98);
  satinBow(ctx,w*.89,h*.86,w*.16,rose,edge,.2,.91);
  satinBow(ctx,w*.88,h*.15,w*.075,rose,edge,.21,.77);
  satinBow(ctx,w*.12,h*.79,w*.09,rose,edge,-.16,.85);
 }else if(mode==='scatter'){
  for(let i=0;i<19;i++){
   const xx=((i*179+27)%991)/991,yy=((i*227+81)%997)/997;
   satinBow(ctx,xx*w,yy*h,w*(.045+(i%3)*.01),rose,edge,(i%5-2)*.18,.80);
  }
 }else if(mode==='edge'){
  for(let i=0;i<8;i++){
   const left=i%2===0,x=left?w*.08:w*.92,y=(.11+Math.floor(i/2)*.24)*h;
   satinBow(ctx,x,y,w*.09,rose,edge,left?-.22:.24,.86);
  }
 }else if(mode==='center'){
  satinBow(ctx,w*.5,h*.13,w*.26,rose,edge,.05);
  satinBow(ctx,w*.14,h*.85,w*.12,rose,edge,-.15,.77);
  satinBow(ctx,w*.88,h*.78,w*.12,rose,edge,.24,.75);
 }else satinBow(ctx,w*.78,h*.15,w*.34,rose,edge,-.12,.96);
}
export function paintBowBackground(ctx:Ctx,w:number,h:number,id:BowBackgroundId){
 const k=BOW_BACKGROUNDS.findIndex(b=>b.id===id);
 if(k<0)return;
 const bg=BOW_BACKGROUNDS[k].color;
 const pair: [string,string][]= [
  ['#F3ACC7','#B56C8D'],['#E6AFB5','#B67B84'],['#C5384B','#8B1F36'],['#F2E1C8','#B5957A'],
  ['#9EC5DF','#618EA9'],['#D5A9AD','#8F5965'],['#E3A4BE','#B36C91'],['#CE596A','#A23545'],
  ['#F5DA8C','#C6AC62'],['#CCB0EF','#8877B9'],['#EAD8DD','#B89FAE'],['#B9C7AD','#7B9588'],
  ['#D48EA7','#A96881'],['#E9C9C5','#B49796'],['#D8AAB6','#A67A87'],['#D9B5C7','#9F7B92'],
  ['#DF96A8','#AF586E'],['#7F9BB4','#4E6D91'],['#8D5C46','#603C2F'],['#E7AACD','#AA7599']
 ];
 const [main,shade]=pair[k];
 const darker=[5,10].includes(k);
 fillGradient(ctx,w,h,bg,darker?(k===5?'#211B29':'#101B2C'):k===18?'#DBC0A4':k===1?'#FBF3EF':'#FFFBF6',k%3===0?'radial':'vertical');
 if([0,3,7,8,18].includes(k))pattern(ctx,w,h,k===3?'checks':'gingham',k===18?'#936B59':shade);
 if([12,16].includes(k))pattern(ctx,w,h,k===12?'polka':'floral',shade);
 if(k===15)pattern(ctx,w,h,'stripes',shade);
 if([1,9,13,14,17].includes(k))pattern(ctx,w,h,'grain',shade);
 if([5,10].includes(k)){
  ctx.save();const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#FFFFFF10');g.addColorStop(.5,'#FFFFFF00');
  g.addColorStop(1,'#FFFFFF13');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore();
 }
 if([1,6,13,14,17].includes(k))lace(ctx,w,h,k===6?'top':'both');
 if([4,10,13,19].includes(k))pearls(ctx,w,h,k===10?'#DAD5E0':'#F6E7E5',k===19?'curve':'frame');
 if([2,7].includes(k))cherries(ctx,w,h);
 if([11,17].includes(k))foliage(ctx,w,h,shade);
 if([16,19].includes(k))hearts(ctx,w,h,shade);
 if(k===14){
  ctx.save();ctx.translate(w*.78,h*.19);ctx.rotate(.16);
  ctx.shadowColor='#6A4E4540';ctx.shadowBlur=w*.017;ctx.fillStyle='#FDF7ED';
  ctx.fillRect(-w*.25,-h*.15,w*.50,h*.28);ctx.shadowBlur=0;ctx.fillStyle='#D6AFA6';
  ctx.globalAlpha=.55;ctx.fillRect(-w*.23,-h*.15,w*.46,h*.045);ctx.restore();
  ctx.save();ctx.globalAlpha=.65;ctx.translate(w*.16,h*.12);ctx.rotate(-.34);
  ctx.fillStyle='#D5A6B0';ctx.fillRect(-w*.10,-h*.014,w*.20,h*.047);ctx.restore();
 }
 if(k===17){
  ctx.save();ctx.strokeStyle='#89A3B9';ctx.globalAlpha=.18;ctx.lineWidth=Math.max(2,w*.0017);
  for(let i=0;i<20;i++){
   const x=((i*181+47)%997)/997*w,y=((i*263+19)%991)/991*h;
   ctx.beginPath();ctx.arc(x,y,w*.03,0,Math.PI*2);ctx.stroke();
  }ctx.restore();
 }
 const mode: 'corners'|'scatter'|'single'|'edge'|'center'=
  [0,2,4,7,9,12,15,16,18].includes(k)?'scatter':
  [1,5,10,13].includes(k)?'center':
  [3,8,11,17].includes(k)?'corners':
  [6,14].includes(k)?'single':'edge';
 cornerBows(ctx,w,h,[main,shade],mode);
 if([1,13,5,10].includes(k)){ctx.save();ctx.globalAlpha=.16;
  const g=ctx.createRadialGradient(w*.5,h*.45,w*.02,w*.5,h*.45,w*.48);
  g.addColorStop(0,'#FFFFFFCC');g.addColorStop(1,'#FFFFFF00');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore();}
 pattern(ctx,w,h,'grain',shade);
}
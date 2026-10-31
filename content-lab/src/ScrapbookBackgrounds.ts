/**
 * Eight original, lightweight scrapbook backgrounds.
 * Everything is painted on the same canvas for thumbnail, editor and PNG export.
 * No external raster assets, no credits, no text burned into the designs.
 */
export const SCRAPBOOK_BACKGROUNDS = [
 {id:'scrapbook-pink-checkers',name:'Pink Checkers',color:'#E9B9BD',description:'Cuadros · rosa · Polaroids'},
 {id:'scrapbook-lavender-notebook',name:'Lavender Notebook',color:'#CBBADD',description:'Lavanda · libreta · doodles'},
 {id:'scrapbook-sage-botanical',name:'Sage Botanical',color:'#A7AC85',description:'Salvia · flores · papel'},
 {id:'scrapbook-blue-film',name:'Blue Film',color:'#9CADBF',description:'Azul · película · recortes'},
 {id:'scrapbook-coral-retro',name:'Coral Retro',color:'#D7A393',description:'Coral · cuadros · vintage'},
 {id:'scrapbook-black-zine',name:'Black & White Zine',color:'#D4CEC1',description:'Monocromo · collage · grilla'},
 {id:'scrapbook-butter-yellow',name:'Butter Yellow',color:'#F0D796',description:'Amarillo · rosa · flores'},
 {id:'scrapbook-chocolate-vintage',name:'Chocolate Vintage',color:'#A58166',description:'Café · papel · editorial'},
] as const;
export type ScrapbookBackgroundId = typeof SCRAPBOOK_BACKGROUNDS[number]['id'];
export function isScrapbookBackground(id:unknown):id is ScrapbookBackgroundId{
 return typeof id==='string' && SCRAPBOOK_BACKGROUNDS.some(b=>b.id===id);
}
const combinations = [
 ['#E9B9BD','#9B9D75','#E9D6B7','#D87E97','#F5E7D1','#3E3633'],
 ['#CBBADD','#A0A4B8','#F5D6DF','#ABA1DC','#F9F0E6','#514462'],
 ['#A7AC85','#E4CCB2','#657956','#CBADB0','#F3E8D3','#62735B'],
 ['#9CADBF','#D0D6D5','#6C8294','#E4CDB8','#F6EEE2','#4D5E6B'],
 ['#D7A393','#B96F58','#F1C1A1','#BBA678','#F8E7D5','#885E4F'],
 ['#D4CEC1','#37363B','#9FA09C','#BDB4A5','#F6F0E3','#39383B'],
 ['#F0D796','#F8E9C8','#D7A8AB','#BAC69A','#FCF1D8','#C28F77'],
 ['#A58166','#5F493D','#C3A78C','#E8CAA6','#F2DEC5','#5D473C'],
] as const;
function random(seed:number){
 let state=seed>>>0;
 return ()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296};
}
function torn(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,seed:number,shadow=true){
 const r=random(seed);ctx.save();ctx.beginPath();ctx.moveTo(x,y);
 const q=36; for(let i=1;i<=q;i++)ctx.lineTo(x+w*i/q,y+(r()-.5)*15);
 for(let i=1;i<=q;i++)ctx.lineTo(x+w+(r()-.5)*16,y+h*i/q);
 for(let i=q-1;i>=0;i--)ctx.lineTo(x+w*i/q,y+h+(r()-.5)*15);
 for(let i=q-1;i>=0;i--)ctx.lineTo(x+(r()-.5)*16,y+h*i/q);
 ctx.closePath();
 if(shadow){ctx.shadowColor='rgba(50,34,25,.22)';ctx.shadowBlur=24;ctx.shadowOffsetX=6;ctx.shadowOffsetY=11}
 ctx.fillStyle=fill;ctx.fill();ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
 ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;ctx.stroke();ctx.restore();
}
function sheet(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,c:string,rotation:number,seed:number){
 ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(rotation);torn(ctx,-w/2,-h/2,w,h,c,seed);ctx.restore();
}
function pattern(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,a:string,b:string,unit=42,rotation=0){
 ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(rotation);ctx.fillStyle=b;ctx.fillRect(-w/2,-h/2,w,h);
 for(let j=0;j<Math.ceil(h/unit);j++)for(let i=0;i<Math.ceil(w/unit);i++){
  if((i+j)%2===0){ctx.fillStyle=a;ctx.fillRect(-w/2+i*unit,-h/2+j*unit,unit,unit)}
 }
 ctx.restore();
}
function grid(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,ink:string,rotation=0){
 ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(rotation);
 ctx.fillStyle='#F6F1E8';ctx.fillRect(-w/2,-h/2,w,h);
 ctx.strokeStyle=ink;ctx.globalAlpha=.38;ctx.lineWidth=1.5;
 for(let xx=-w/2;xx<w/2;xx+=30){ctx.beginPath();ctx.moveTo(xx,-h/2);ctx.lineTo(xx,h/2);ctx.stroke()}
 for(let yy=-h/2;yy<h/2;yy+=30){ctx.beginPath();ctx.moveTo(-w/2,yy);ctx.lineTo(w/2,yy);ctx.stroke()}
 ctx.restore();
}
function tape(ctx:CanvasRenderingContext2D,cx:number,cy:number,w:number,c:string,angle=0){
 ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);ctx.fillStyle=c;ctx.globalAlpha=.78;
 ctx.fillRect(-w/2,-18,w,36);ctx.globalAlpha=.2;ctx.strokeStyle='white';ctx.lineWidth=1;
 for(let i=-w/2;i<w/2;i+=10){ctx.beginPath();ctx.moveTo(i,-16);ctx.lineTo(i+7,16);ctx.stroke()}
 ctx.restore();
}
function photo(ctx:CanvasRenderingContext2D,cx:number,cy:number,c:string,angle=0){
 ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
 ctx.shadowColor='rgba(39,30,25,.2)';ctx.shadowBlur=18;ctx.shadowOffsetY=9;ctx.fillStyle='#FCF8F0';
 ctx.fillRect(-108,-140,216,280);ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 const g=ctx.createLinearGradient(-90,-116,90,68);g.addColorStop(0,c);g.addColorStop(1,'#D1CAC0');
 ctx.fillStyle=g;ctx.fillRect(-90,-116,180,195);ctx.restore();
}
function heart(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,c:string){
 ctx.save();ctx.translate(x,y);ctx.scale(s/42,s/42);ctx.beginPath();
 ctx.moveTo(0,24);ctx.bezierCurveTo(-49,-8,-23,-30,0,-8);ctx.bezierCurveTo(24,-30,50,-8,0,24);
 ctx.strokeStyle=c;ctx.lineWidth=4.5;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore();
}
function sparkle(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,c:string){
 ctx.save();ctx.translate(x,y);ctx.strokeStyle=c;ctx.lineWidth=4;ctx.lineCap='round';
 for(let i=0;i<8;i++){const angle=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(angle)*s*.5,Math.sin(angle)*s*.5);ctx.lineTo(Math.cos(angle)*s,Math.sin(angle)*s);ctx.stroke()}ctx.restore();
}
function flower(ctx:CanvasRenderingContext2D,x:number,y:number,s:number){
 ctx.save();ctx.translate(x,y);ctx.fillStyle='#FFF9E9';ctx.strokeStyle='rgba(119,101,70,.08)';
 for(let i=0;i<10;i++){const a=i*Math.PI/5;ctx.beginPath();ctx.ellipse(Math.cos(a)*s*.44,Math.sin(a)*s*.44,s*.35,s*.30,a,0,Math.PI*2);ctx.fill();ctx.stroke()}
 ctx.beginPath();ctx.arc(0,0,s*.22,0,Math.PI*2);ctx.fillStyle='#E9BC58';ctx.fill();ctx.restore();
}
function film(ctx:CanvasRenderingContext2D){
 ctx.save();ctx.translate(150,73);ctx.rotate(-.13);ctx.fillStyle='#242528';ctx.fillRect(-220,-53,610,115);
 ctx.fillStyle='#E9E5D9';for(let x=-205;x<385;x+=41){ctx.fillRect(x,-46,25,11);ctx.fillRect(x,43,25,11)}
 ctx.fillStyle='#959394';for(let x=-190;x<370;x+=91)ctx.fillRect(x,-28,78,57);ctx.restore();
}
export function paintScrapbookBackground(ctx:CanvasRenderingContext2D,w:number,h:number,id:ScrapbookBackgroundId){
 const index=SCRAPBOOK_BACKGROUNDS.findIndex(b=>b.id===id);if(index<0)return;
 const c=combinations[index],r=random(index*1049+19);
 ctx.save();ctx.scale(w/1080,h/1350);ctx.fillStyle=c[0];ctx.fillRect(0,0,1080,1350);
 sheet(ctx,-85,-150,450,470,c[1],.12,index+10);
 sheet(ctx,835,-85,440,510,c[2],-.15,index+20);
 sheet(ctx,-134,930,480,500,c[3],-.20,index+30);
 sheet(ctx,825,1030,360,400,c[1],.17,index+40);
 if([0,4,5,7].includes(index))pattern(ctx,-80,-90,390,245,index===5?'#2B2A2C':'#B86D60',index===5?'#F5F0E7':'#F8E8D1',40,-.11);
 if([0,4,7].includes(index))pattern(ctx,-95,1095,425,300,index===7?'#654A3E':'#AA716A','#F5EADD',40,.18);
 if([1,3,5,6].includes(index))grid(ctx,780,60,345,405,index===1?'#9F94BD':'#A9ACB3',.13);
 if([2,6].includes(index))pattern(ctx,800,1005,390,370,c[1],'#F5EFDF',36,-.11);
 if([3,7].includes(index))film(ctx);
 sheet(ctx,84,145,913,1047,c[4],-.01,index+105);
 // Light organic grain for scale-independent PNG export
 ctx.fillStyle='rgba(103,77,51,.07)';
 for(let n=0;n<2300;n++){const x=r()*1080,y=r()*1350;ctx.fillRect(x,y,1.1+r()*1.7,1.1+r()*1.7)}
 if(index===0){
  photo(ctx,888,246,'#B7B6B4',.13);tape(ctx,876,94,150,'#E7C693',.09);
  photo(ctx,158,1050,'#B6BABD',-.12);tape(ctx,149,884,145,'#E1C594',-.13);
  heart(ctx,195,525,35,c[5]);sparkle(ctx,664,140,29,c[5]);
  sheet(ctx,851,1134,340,116,'#E5C7B9',-.1,501);tape(ctx,842,1080,130,'#D59EAD',-.12);
 }else if(index===1){
  photo(ctx,860,279,'#D4C7E0',.11);tape(ctx,870,130,143,'#C7A5DB',.13);
  grid(ctx,805,1072,330,340,'#A49CB8',.15);
  sheet(ctx,164,1130,330,155,'#DFC9ED',-.12,502);
  heart(ctx,156,490,38,c[5]);sparkle(ctx,745,1110,21,c[5]);
 }else if(index===2){
  flower(ctx,170,185,48);flower(ctx,950,1065,42);
  photo(ctx,894,265,'#B5B9AA',-.12);tape(ctx,895,126,145,'#CFBE9F',-.15);
  grid(ctx,810,1042,300,290,'#A3B19D',.11);
  heart(ctx,170,580,35,c[5]);
 }else if(index===3){
  photo(ctx,880,1085,'#B2BCC8',.12);tape(ctx,874,938,148,'#E8D6AD',.1);
  grid(ctx,-58,739,210,310,'#91A9BA',-.13);
  sheet(ctx,170,1150,300,145,'#B9CEDD',-.12,503);
  heart(ctx,181,478,32,c[5]);sparkle(ctx,193,391,24,c[5]);
 }else if(index===4){
  photo(ctx,867,254,'#D4AF9D',.1);tape(ctx,866,107,135,'#EAC29D',.04);
  flower(ctx,158,1103,49);sheet(ctx,849,1151,365,115,'#ECC5B8',-.1,504);
  heart(ctx,171,439,32,c[5]);sparkle(ctx,870,724,35,c[5]);
 }else if(index===5){
  photo(ctx,857,241,'#B2B2AE',.11);tape(ctx,851,95,156,'#BDB5A9',.12);
  grid(ctx,-25,1123,315,260,'#AFACA7',.11);
  heart(ctx,170,523,40,c[5]);sparkle(ctx,816,1068,26,c[5]);
 }else if(index===6){
  photo(ctx,866,257,'#D3D0A7',-.12);tape(ctx,871,112,138,'#E8C47D',-.11);
  flower(ctx,173,1087,45);sheet(ctx,856,1155,340,130,'#EABABD',-.07,507);
  heart(ctx,184,482,34,c[5]);sparkle(ctx,822,730,27,c[5]);
 }else{
  photo(ctx,861,257,'#B7B1A9',.13);tape(ctx,860,110,134,'#C9A275',.12);
  grid(ctx,820,1075,310,260,'#A9907B',.13);
  sheet(ctx,167,1137,320,133,'#D1B89F',-.14,508);
  heart(ctx,173,532,35,c[5]);sparkle(ctx,195,456,23,c[5]);
 }
 ctx.restore();
}
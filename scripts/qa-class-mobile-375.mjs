/* Class landing mobile regression: browser-rendered geometry, no submissions.
 * Run from repository root after "npx playwright install chromium".
 * Inspect first fold, headline, price, actions and header at Instagram-sized widths.
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const origin = process.env.QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({headless:true, args:['--no-sandbox']});
mkdirSync('artifacts/class-mobile',{recursive:true});
try {
 for (const width of [320,375,390,430]){
  const page=await browser.newPage({viewport:{width,height:812},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await page.goto(origin+'/clases/primera-landing.html',{waitUntil:'networkidle',timeout:45000});
  await page.locator('.class-hero-intro h1').waitFor({state:'visible'});
  await page.screenshot({path:'artifacts/class-mobile/hero-'+width+'.png',fullPage:false});
  const report=await page.evaluate(()=>{
   const selectors={
     header:'.class-topbar', logo:'.class-wordmark', notify:'.class-launch-clock-cta',
     hero:'.class-hero', intro:'.class-hero-intro',eyebrow:'.class-hero-intro>.class-eyebrow',
     title:'.class-hero-intro>h1',benefit:'.class-hero-intro>.class-opportunity',
     lede:'.class-hero-intro>.class-lede', cta:'.class-hero-actions>.class-primary-button',
     secondary:'.class-hero-actions>.class-campaign-notify-link',
     badge:'.class-price-campaign>.class-campaign-pill',
     price:'.class-price-current>strong',regular:'.class-price-regular',
     detail:'.class-price-campaign>.class-campaign-detail',
     availability:'.class-availability',noticeText:'.class-notice',
     photo:'.class-hero-art img', journey:'#recorrido'
   };
   const out={};
   for(const [key,selector] of Object.entries(selectors)){
     const e=document.querySelector(selector);
     const b=e?.getBoundingClientRect();
     const style=e?getComputedStyle(e):null;
     out[key]={x:b?.x??null,y:b?.y??null,bottom:b?.bottom??null,
       width:b?.width??null,height:b?.height??null,display:style?.display||null,
       visibility:style?.visibility||null, text:e?.textContent?.trim()?.slice(0,60)||null};
   }
   const img=document.querySelector('.class-hero-art img');
   return {els:out,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
       photoLoaded:!!img?.complete && img.naturalWidth>0,
       countdownDisplay:getComputedStyle(document.querySelector('.class-flip-timer')).display};
  });
  const e=report.els;
  console.log('MOBILE_CLASS_GEOMETRY '+width+' '+JSON.stringify(report));
  assert(report.photoLoaded,'Photo must be loaded at '+width);
  assert(report.countdownDisplay==='none','Mobile countdown must not overlap hero at '+width);
  assert(report.scrollWidth<=width+2,'Horizontal overflow at '+width);
  assert(e.header.bottom<=e.eyebrow.y+3,'Header overlays class hero at '+width);
  assert(e.logo.x>=0&&e.notify.x>=0&&e.notify.x+e.notify.width<=width+2,'Header clips actions at '+width);
  const order=['eyebrow','title','benefit','lede','cta','secondary','badge','price','regular','detail','availability','noticeText','photo'];
  for(let i=1;i<order.length;i++){
   const before=e[order[i-1]],after=e[order[i]];
   assert(before?.height>0&&after?.height>0,'Missing section '+order[i-1]+' or '+order[i]+' at '+width);
   assert(before.bottom<=after.y+3, 'Overlap '+order[i-1]+' -> '+order[i]+' at '+width+': '+JSON.stringify({before,after}));
  }
  for(const key of order)assert(e[key].x>=-2&&e[key].x+e[key].width<=width+2,'Clipped '+key+' at '+width);
  assert(e.cta.height>=48,'CTA too small at '+width);
  await page.close();
 }
 console.log('PASS: Class landing 320,375,390,430px, no overlap or clipping, photo, readable CTA and launch price.');
} finally {await browser.close();}

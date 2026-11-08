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
  // Inspect the actual design after selecting only essential cookies in this test context.
  // Never bypass or remove the site's consent UI for real visitors.
  const essential=page.getByRole('button',{name:'Solo necesarias'});
  if(await essential.isVisible().catch(()=>false)){
    await essential.click();
    await page.waitForTimeout(180);
  }
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
     visual:'.class-cinema-visual', journey:'#recorrido'
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
   const film=document.querySelector('.class-cinema-visual video');
   const browserPreview=document.querySelector('.class-cinema-browser');
   return {els:out,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
       visualReady:!!film && !!film.poster && !!film.querySelector('source') && !!browserPreview && browserPreview.getAttribute('href')==='https://thelaunchera.com/demos/casa-brownie/',
       countdownDisplay:getComputedStyle(document.querySelector('.class-flip-timer')).display};
  });
  const e=report.els;
  console.log('MOBILE_CLASS_GEOMETRY '+width+' '+JSON.stringify(report));
  assert(report.visualReady,'Cinematic stage must contain video, poster and live demo link at '+width);
  assert(report.countdownDisplay==='none','Mobile countdown must not overlap hero at '+width);
  assert(report.scrollWidth<=width+2,'Horizontal overflow at '+width);
  assert(e.header.bottom<=e.eyebrow.y+3,'Header overlays class hero at '+width);
  assert(e.logo.x>=0&&e.notify.x>=0&&e.notify.x+e.notify.width<=width+2,'Header clips actions at '+width);
  // Keep the waitlist action visible BEFORE the colorful sample website hero.
  // The explanatory copy and the existing launch offer follow the showcase.
  const order=['eyebrow','title','benefit','cta','secondary','visual','lede','badge','price','regular','detail','availability','noticeText'];
  for(let i=1;i<order.length;i++){
   const before=e[order[i-1]],after=e[order[i]];
   assert(before?.height>0&&after?.height>0,'Missing section '+order[i-1]+' or '+order[i]+' at '+width);
   assert(before.bottom<=after.y+3, 'Overlap '+order[i-1]+' -> '+order[i]+' at '+width+': '+JSON.stringify({before,after}));
  }
  for(const key of order)assert(e[key].x>=-2&&e[key].x+e[key].width<=width+2,'Clipped '+key+' at '+width);
  assert(e.cta.height>=48,'CTA too small at '+width);
  const creative=await page.evaluate(()=>{
    const title=document.querySelector('.class-creative-type')?.getBoundingClientRect();
    const photo=document.querySelector('.class-cinema-film')?.getBoundingClientRect();
    const stage=document.querySelector('.class-cinema-visual')?.getBoundingClientRect();
    return {typeBottom:title?.bottom??null,photoTop:photo?.top??null,
      typeRight:title?.right??null,stageRight:stage?.right??null};
  });
  assert(creative.typeBottom!=null && creative.photoTop!=null,'Missing mobile campaign layers at '+width);
  assert(creative.typeBottom<=creative.photoTop+12,
    'Oversized campaign headline is hidden by the product photo at '+width+': '+JSON.stringify(creative));
  assert(creative.typeRight<=creative.stageRight+2,
    'Campaign text overflows mobile stage at '+width+': '+JSON.stringify(creative));
  // Result must reveal the official full-page demo, not a decorative mockup.
  const resultButton=page.locator('#de-idea-a-web [data-transform-to="100"]');
  await resultButton.scrollIntoViewIfNeeded();
  await resultButton.click();
  await page.waitForFunction(()=>{const el=document.querySelector('[data-casa-brownie-open]');return el && !el.hidden;},null,{timeout:10000});
  const afterState=await page.evaluate(()=>({stage:document.querySelector('[data-idea-transform]')?.dataset.stage,
    sketch:getComputedStyle(document.querySelector('.class-idea-board')).display,
    result:getComputedStyle(document.querySelector('.class-formed-web')).display}));
  assert.equal(afterState.stage,'after','Resultado debe tener el estado correcto a '+width);
  assert.equal(afterState.sketch,'none','El Boceto no puede superponerse al Resultado a '+width);
  assert.notEqual(afterState.result,'none','La web real debe mostrarse a '+width);
  const fullLink=page.locator('[data-casa-brownie-open] a');
  assert.equal(await fullLink.getAttribute('href'),'https://thelaunchera.com/demos/casa-brownie/');
  assert.equal(await fullLink.getAttribute('target'),'_blank');
  const preview=page.locator('[data-casa-brownie-frame]');
  await page.waitForFunction(()=>!!document.querySelector('[data-casa-brownie-frame]')?.getAttribute('src'),null,{timeout:12000});
  assert.equal(await preview.getAttribute('src'),'https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video');
  await page.screenshot({path:'artifacts/class-mobile/casa-resultado-'+width+'.png',fullPage:false});
  await page.locator('#de-idea-a-web [data-transform-to="0"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-casa-brownie-open]')?.hidden===true,null,{timeout:10000});
  const beforeState=await page.evaluate(()=>({stage:document.querySelector('[data-idea-transform]')?.dataset.stage,
    sketch:getComputedStyle(document.querySelector('.class-idea-board')).display,
    result:getComputedStyle(document.querySelector('.class-formed-web')).display}));
  assert.equal(beforeState.stage,'before','Boceto debe tener el estado correcto a '+width);
  assert.notEqual(beforeState.sketch,'none','El Boceto debe verse a '+width);
  assert.equal(beforeState.result,'none','La vista real debe quedar oculta al regresar al Boceto a '+width);
  assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=width+2,'After preview overflows mobile at '+width);
  await page.close();
 }
 // Screen-level regression coverage for the editorial offer cards and materials on larger displays.
 for (const width of [768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
  await page.goto(origin+'/clases/primera-landing.html',{waitUntil:'networkidle',timeout:45000});
  await page.locator('.class-hero-intro h1').waitFor({state:'visible'});
  const essential=page.getByRole('button',{name:'Solo necesarias'});
  if(await essential.isVisible().catch(()=>false))await essential.click();
  const summary=await page.evaluate(()=>{
   const cardEls=[...document.querySelectorAll('#recorrido .class-journey-card')];
   const cards=cardEls.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,width:r.width,height:r.height}});
   return {vw:innerWidth,sw:document.documentElement.scrollWidth,cardCount:cards.length,
     cards,price:document.querySelector('.class-price-campaign .class-price-current strong')?.textContent?.trim(),
     benefits:document.querySelectorAll('.tle-offer-benefits li').length,
     form:!!document.getElementById('course-waitlist-form')};
  });
  assert(summary.sw<=width+2,'Horizontal overflow at '+width+': '+summary.sw);
  assert.equal(summary.cardCount,3,'Three step cards required at '+width);
  assert.equal(summary.benefits,3,'Three offer benefits required at '+width);
  assert.equal(summary.price,'$9.99','Launch price must be accurate');
  assert(summary.form,'Waitlist form must still exist');
  for(const c of summary.cards)assert(c.width>180&&c.height>150&&c.x>=-2&&c.right<=width+2,'Clipped/empty card at '+width+': '+JSON.stringify(c));
  if(width===1440)assert(summary.cards[0].x < summary.cards[1].x && summary.cards[1].x < summary.cards[2].x,'Desktop cards should be a true 3-column grid');
  await page.screenshot({path:'artifacts/class-mobile/editorial-'+width+'.png',fullPage:true,animations:'disabled',timeout:30000});
  console.log('EDITORIAL_CLASS_DESKTOP_QA '+JSON.stringify({width,scrollWidth:summary.sw,price:summary.price,cards:summary.cards}));
  await page.close();
 }
 console.log('PASS: Class landing mobile 320/375/390/430 and responsive editorial cards 768/1440, no overflow, preserved waitlist.');
} finally {await browser.close();}

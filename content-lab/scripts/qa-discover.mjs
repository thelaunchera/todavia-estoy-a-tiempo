/* Editorial Content Lab public landing visual QA — never touches the private editor.
 * Run from content-lab/: node scripts/qa-discover.mjs
 * QA_URL defaults to local repository root served at :4173.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const origin = process.env.QA_URL || 'http://127.0.0.1:4173';
const screenshotDir = 'artifacts/discover-visual';
mkdirSync(screenshotDir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  for(const [locale,pathname] of [['es','/content-lab/public/descubre/'],['en','/content-lab/public/descubre/en/']]){
    for(const width of [320,375,390,768,1440]){
      const page=await browser.newPage({viewport:{width,height:860},deviceScaleFactor:1,isMobile:width<540,hasTouch:width<540});
      const badLocal=[];
      page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)badLocal.push({url:response.url(),status:response.status()});});
      await page.goto(origin+pathname,{waitUntil:'networkidle',timeout:45000});
      await page.locator('.offer-grid .offer').waitFor({state:'visible'});
      await page.evaluate(()=>document.fonts?.ready);
      const r=await page.evaluate(()=>{
        const box=(q)=>{const b=document.querySelector(q)?.getBoundingClientRect();return b?{x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom}:null};
        return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
          hero:box('.offer-grid'),copy:box('.offer-copy'),card:box('.offer-grid .offer'),
          checkout:document.querySelector('.offer .offer-buy>a')?.getAttribute('href'),
          h1:document.querySelector('h1')?.textContent?.trim(),price:document.querySelector('.offer .price')?.textContent?.trim(),
          benefits:document.querySelectorAll('.offer-includes li').length,
          css:!![...document.styleSheets].find(x=>x.href?.includes('offer-editorial-20261106.css')),
          gridCols:getComputedStyle(document.querySelector('.offer-grid')).gridTemplateColumns,
          faq:document.querySelectorAll('.faqs details').length,
          picture:document.querySelector('.editor-showcase img')?.naturalWidth||0,
          linkTarget:document.querySelector('.offer .offer-buy>a')?.getAttribute('target')};
      });
      assert.equal(r.scrollWidth<=width+2,true,'Horizontal overflow '+locale+' / '+width+' / '+r.scrollWidth);
      assert(r.copy&&r.card&&r.card.width>270&&r.card.height>400,'Offer card missing or not rendered '+locale+' '+width);
      assert(r.css,'Editorial style not loaded '+locale+' '+width);
      assert.equal(r.checkout,'https://buy.stripe.com/14AdR8dHp6Dnd8B1IM93y0Z','Checkout link changed');
      assert.equal(r.linkTarget,'_blank');
      assert.equal(r.benefits,5,'Offer must show five real benefits');
      assert(r.picture>0,'Editor image failed to load '+locale+' '+width);
      assert(r.faq>=4,'FAQ missing '+locale+' '+width);
      assert(r.price.includes('$10'),'Offer price incorrect');
      if(width>=881)assert(r.card.x > r.copy.x && Math.abs(r.card.y-r.copy.y)<48,'Desktop offer not beside hero');
      if(width<=880)assert(r.card.y>=r.copy.bottom-4,'Mobile offer overlaps marketing copy');
      if(width<=390)assert(r.card.right<=width+2,'Offer clipped on small phones');
      assert.equal(badLocal.length,0,'Local files failed to load '+JSON.stringify(badLocal));
      await page.screenshot({path:`${screenshotDir}/content-lab-${locale}-${width}.png`,fullPage:true,animations:'disabled',timeout:30000});
      console.log('PASS DISCOVER '+JSON.stringify({locale,width,scrollWidth:r.scrollWidth,price:r.price,benefits:r.benefits,grid:r.gridCols,cardWidth:Math.round(r.card.width),cardHeight:Math.round(r.card.height),image:r.picture}));
      if(width===390){
        const buttons=page.locator('.seamless-proof [data-proof-mode]');
        await buttons.nth(1).click();
        assert.equal(await buttons.nth(1).getAttribute('aria-pressed'),'true','Slide toggle did not update on mobile');
        await buttons.nth(0).click();
        assert.equal(await buttons.nth(0).getAttribute('aria-pressed'),'true','Full canvas toggle did not restore');
      }
      await page.close();
    }
  }
  console.log('PASS: Content Lab editorial landing ES + EN, 320/375/390/768/1440. Checkout, visual, images, toggles and FAQs preserved.');
}finally{await browser.close();}

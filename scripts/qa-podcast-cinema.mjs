/* Podcast cinematic hero: links, photograph, accessibility, device geometry.
   No signup, payments, outgoing messages or external audio playback. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html');
const css=read('podcast-cinematic-hero-20261102.css');
const js=read('podcast-cinematic-hero-20261102.js');
const hero=html.slice(html.indexOf('<section class="hero dark-paper'),html.indexOf('<a class="podcast-marquee'));
assert(hero.includes('podcast-film-hero'),'Cinematic hero missing');
assert(hero.includes('assets/podcast-hero-dailin-v3.webp'),'Approved host portrait changed');
assert(hero.includes('Escucha historias que te inspiran'),'Listening promise changed');
assert(hero.indexOf('podcast-host-portrait')<hero.indexOf('hero-project-links'),'Secondary offers should follow portrait');
assert(html.includes('podcast-hero-rebalance-20261102.css?v=1'),'Rebalanced mobile stylesheet must load');
for(const link of ['https://open.spotify.com/show/4f22tdJv8nMdTSMKc1kvIh','clases/primera-landing.html','content-lab/prompts/','content-lab/descubre/']){
 assert(hero.includes(link),'Podcast hero link missing '+link);
}
assert.equal((hero.match(/data-film-select="/g)||[]).length,3,'Three scene controls required');
assert.equal((hero.match(/data-film-scene="/g)||[]).length,3,'Three editorial scenes required');
assert(html.includes('podcast-cinematic-hero-20261102.css?v=1')&&html.includes('podcast-cinematic-hero-20261102.js?v=1'),'Cinematic assets not linked');
assert(css.includes('prefers-reduced-motion:reduce')&&css.includes('@media(max-width:600px)'),'Mobile/reduced-motion styling required');
assert(js.includes('IntersectionObserver')&&js.includes("visibilitychange")&&js.includes('saveData')&&js.includes('manual=true'),'Hero must pause, avoid waste and honor visitor selection');
assert(!hero.includes('<video')&&!hero.includes('<audio'),'Do not autoplay heavy video or any audio on homepage');
console.log('PASS: Podcast cinematic hero, Spotify, class, prompts, Content Lab, photo and motion accessibility.');
if(!process.argv.includes('--browser'))process.exit(0);
const {chromium}=await import('playwright');
const origin=process.env.QA_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
mkdirSync('artifacts/podcast-cinema',{recursive:true});
try {
 for(const width of [320,375,390,430,820,1440]){
  const page=await browser.newPage({viewport:{width,height:820},deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/',{waitUntil:'domcontentloaded',timeout:45000});
  // On launch days, the expected modal temporarily covers the hero.
  // Close it as a visitor would before testing hero controls.
  const chapterAnnouncement=page.locator('#podcast-ep03-dialog');
  if(await chapterAnnouncement.isVisible()){
   await chapterAnnouncement.locator('[data-ep03-close]').click();
   assert(!(await chapterAnnouncement.isVisible()),width+': close should restore navigation');
  }
  await page.locator('.podcast-film-captions').waitFor({state:'visible',timeout:10000});
  await page.screenshot({path:'artifacts/podcast-cinema/hero-'+width+'.png',fullPage:false});
  const state=await page.evaluate(()=>{
   const box=sel=>{const e=document.querySelector(sel),r=e?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null};
   return {
    overflow:document.documentElement.scrollWidth>innerWidth+2,
    title:box('#hero-title'),
    cta:box('.podcast-hero-v2 .hero-cta .button-light'),
    visual:box('.podcast-hero-v2 .hero-visual'),
    captions:box('.podcast-film-captions'),
    links:box('.podcast-hero-v2 .hero-project-links'),
    photo:!!document.querySelector('.podcast-host-portrait img')?.getAttribute('src'),
    controls:[...document.querySelectorAll('[data-film-select]')].map(x=>{const r=x.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,height:r.height}}),
   };
  });
  console.log('PODCAST_CINEMA_GEOMETRY',width,JSON.stringify(state));
  assert(!state.overflow,width+': page horizontal overflow');
  assert(state.photo,width+': missing host portrait');
  assert(state.cta?.height>=45,width+': Spotify button too small');
  if(width===1440)assert(state.cta.bottom<755,'Desktop Spotify CTA must appear on first screen');
  assert(state.controls.length===3,width+': missing cinematic controls');
  assert(state.controls.every(v=>v.left>=-2&&v.right<=width+2&&v.height>=30),width+': controls clipped');
  assert(state.title.left>=-10&&state.title.right<=width+10,width+': title clipped');
  assert(state.links.left>=-2&&state.links.right<=width+2,width+': class/prompts links clipped');
  if(width<=430){
    assert(state.cta.bottom<state.visual.top,width+': Spotify CTA should precede the visual on phones');
    assert(state.visual.bottom<state.links.top,width+': course and Lab links must follow the portrait on phones');
  }
  const picker=page.locator('[data-film-select="2"]');
  const hit=await picker.evaluate(el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    return {target:document.elementFromPoint(x,y)?.outerHTML?.slice(0,190),
      visible:getComputedStyle(el).pointerEvents,hero:document.querySelector('.podcast-film-hero')?.dataset.filmStep};
  });
  console.log('PODCAST_CINEMA_TAP_TARGET',width,JSON.stringify(hit));
  await picker.click();
  const active=await page.evaluate(()=>({step:document.querySelector('.podcast-film-hero')?.dataset.filmStep,
    pressed:[...document.querySelectorAll('[data-film-select]')].map(el=>el.getAttribute('aria-pressed')),
    text:document.querySelector('.podcast-film-scene.is-active strong')?.textContent}));
  assert.equal(active.step,'2',width+': manual selection failed');
  assert.deepEqual(active.pressed,['false','false','true'],width+': accessible selection failed');
  assert(active.text?.includes('ideas'),width+': wrong third scene');
  assert.deepEqual(errors,[],width+': browser errors');
  await page.close();
 }
 console.log('PASS podcast cinematic hero 320/375/390/430/820/1440, links accessible and manual scenes work.');
} finally {await browser.close();}

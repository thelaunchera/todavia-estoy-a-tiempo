/* Cinematic visual intro only; never plays audio and never touches email/forms.
   Changes pause offscreen; controls remain fully usable without animation. */
(()=> {
 const hero=document.querySelector('.podcast-film-hero');
 if(!hero)return;
 const slides=[...hero.querySelectorAll('.podcast-film-scene')];
 const buttons=[...hero.querySelectorAll('[data-film-select]')];
 if(slides.length!==3||buttons.length!==3)return;
 let step=0,visible=false,manual=false,timer=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const saveData=!!navigator.connection?.saveData;
 function show(next){
   step=next;
   hero.dataset.filmStep=String(next);
   slides.forEach((el,i)=>{el.classList.toggle('is-active',i===next);el.setAttribute('aria-hidden',i===next?'false':'true')});
   buttons.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===next)));
 }
 function sync(){
   if(timer)clearInterval(timer);
   timer=0;
   if(!visible||document.hidden||reduced.matches||saveData||manual)return;
   timer=setInterval(()=>show((step+1)%3),5800);
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{
   manual=true;show(Number(button.dataset.filmSelect));sync();
 }));
 show(0);
 if('IntersectionObserver' in window){
   const obs=new IntersectionObserver(entries=>{
     visible=!!entries[0]?.isIntersecting;sync();
   },{threshold:.16});
   obs.observe(hero);
 } else {visible=true;sync()}
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener?.('change',sync);
})();

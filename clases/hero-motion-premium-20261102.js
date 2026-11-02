/* Subtle desktop scroll depth. No layout shift, no scroll hijack, no dependencies. */
(() => {
 const body=document.body, scene=document.querySelector('.class-cinema-visual');
 if(!scene || !body.classList.contains('class-page-v2')) return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const desktop=matchMedia('(min-width: 901px)');
 if(!('requestAnimationFrame' in window)) return;
 let pending=false;
 function reset(){body.classList.remove('tle-hero-scrolled');scene.style.removeProperty('--tle-browser-scroll')}
 function update(){
  pending=false;
  if(reduced.matches || !desktop.matches || document.hidden || navigator.connection?.saveData){reset();return}
  const r=scene.getBoundingClientRect();
  if(r.bottom<0 || r.top>innerHeight){return}
  const progress=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));
  if(progress<.14){reset();return}
  body.classList.add('tle-hero-scrolled');
  scene.style.setProperty('--tle-browser-scroll',(-Math.round(progress*18))+'px');
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 reduced.addEventListener?.('change',schedule);desktop.addEventListener?.('change',schedule);
 document.addEventListener('visibilitychange',schedule);
 schedule();
})();
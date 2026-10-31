/* Interacciones públicas del catálogo. Sin lógica de pagos ni permisos. */
(()=>{
 'use strict';
 const input=document.getElementById('product-search');
 const feedback=document.getElementById('catalog-feedback');
 const clear=document.getElementById('clear-catalog');
 const reset=document.getElementById('reset-catalog');
 const empty=document.getElementById('catalog-empty');
 const filterButtons=[...document.querySelectorAll('[data-catalog-filter]')];
 const sections=[...document.querySelectorAll('[data-catalog-group]')];
 const cards=[...document.querySelectorAll('[data-catalog-item]')];
 if(!input||!feedback||!empty||!filterButtons.length||!sections.length||!cards.length)return;
 let filter='all';
 const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
 const searchable=new Map(cards.map(card=>[card,normalize([card.querySelector('h3')?.textContent,card.querySelector('p')?.textContent,card.closest('[data-catalog-group]')?.querySelector('h2')?.textContent].join(' '))]));
 function update(){
  const term=normalize(input.value);
  let count=0;
  for(const section of sections){
   const matchesCategory=filter==='all'||section.dataset.catalogGroup===filter;
   let visible=0;
   for(const card of section.querySelectorAll('[data-catalog-item]')){
    const match=matchesCategory&&(!term||searchable.get(card)?.includes(term));
    card.hidden=!match;
    if(match){count++;visible++;}
   }
   section.hidden=visible===0;
  }
  filterButtons.forEach(button=>{
   const active=button.dataset.catalogFilter===filter;
   button.setAttribute('aria-pressed',String(active));
  });
  feedback.textContent=count===1?'1 producto encontrado':count+' productos encontrados';
  empty.hidden=count!==0;
  clear.hidden=!term&&filter==='all';
 }
 function selectFilter(value){
  if(!['all','programas','servicios','recursos'].includes(value))return;
  filter=value;update();
 }
 function resetAll(){
  filter='all';input.value='';update();input.focus({preventScroll:true});
 }
 filterButtons.forEach(button=>button.addEventListener('click',()=>selectFilter(button.dataset.catalogFilter)));
 input.addEventListener('input',update);
 input.addEventListener('search',update);
 input.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&input.value){event.preventDefault();input.value='';update();}
 });
 clear.addEventListener('click',resetAll);
 reset.addEventListener('click',resetAll);
 document.addEventListener('keydown',event=>{
  if(event.key!=='/'||event.ctrlKey||event.metaKey||event.altKey)return;
  const target=event.target;
  if(target?.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"]'))return;
  if(!document.getElementById('access-overlay')?.hidden||document.getElementById('product-details')?.open)return;
  event.preventDefault();input.focus();
 });
 // Un enlace a una sección siempre funciona, incluso tras aplicar filtros.
 document.querySelectorAll('a[href="#programas"],a[href="#servicios"],a[href="#recursos"]').forEach(link=>link.addEventListener('click',()=>{
  if(filter!=='all'||input.value){filter='all';input.value='';update();}
 }));
 const initial=decodeURIComponent(location.hash.slice(1));
 if(['programas','servicios','recursos'].includes(initial))selectFilter(initial);
 else update();

 // Progreso de lectura y cabecera sutil al desplazarse, sin animaciones pesadas.
 const header=document.querySelector('.center-nav');
 const progress=document.createElement('div');
 progress.className='reading-progress';progress.setAttribute('aria-hidden','true');
 document.body.append(progress);
 let frame=0;
 function measure(){
  frame=0;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const percent=max>0?Math.max(0,Math.min(100,window.scrollY/max*100)):0;
  progress.style.transform='scaleX('+(percent/100).toFixed(4)+')';
  header?.classList.toggle('is-scrolled',window.scrollY>32);
 }
 function onScroll(){if(!frame)frame=requestAnimationFrame(measure);}
 window.addEventListener('scroll',onScroll,{passive:true});
 window.addEventListener('resize',onScroll,{passive:true});
 measure();

 // Revelación progresiva: nunca oculta contenido si no hay soporte o si se
 // prefieren menos efectos. Las tarjetas siguen disponibles al teclado.
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduced&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   for(const item of entries)if(item.isIntersecting){
    item.target.classList.add('is-visible');observer.unobserve(item.target);
   }
  },{threshold:.09,rootMargin:'0px 0px 45px 0px'});
  for(const node of document.querySelectorAll('.catalog-head,.program,.product-tile,.help-strip')){
   node.classList.add('motion-card');observer.observe(node);
  }
  document.documentElement.classList.add('motion-enhanced');
 }
})();
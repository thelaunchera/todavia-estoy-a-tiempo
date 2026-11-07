/* Casa Brownie: embed the actual published training website, never a drawn mockup.
   Stage one uses the official still-hero URL; the video is a separate bonus. */
export function renderCasaBrownieLivePreview(content,language='es'){
  const en=language==='en';
  const url='https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video'+(en?'&lang=en':'');
  const wrap=document.createElement('section');
  wrap.className='mi-live-demo';
  wrap.setAttribute('aria-label',en?'Real Casa Brownie website':'Sitio real de Casa Brownie');

  const intro=document.createElement('p');
  intro.className='mi-live-note';
  intro.textContent=en
   ?'This is the real published Casa Brownie demo, not a static illustration. It is an educational simulation with no real orders or payments.'
   :'Este es el sitio publicado de Casa Brownie, no un dibujo. Es una demostración educativa: no recibe pedidos ni pagos reales.';
  wrap.append(intro);

  const bar=document.createElement('div');
  bar.className='mi-live-toolbar';
  const switcher=document.createElement('div');
  switcher.className='mi-live-switcher';
  switcher.setAttribute('role','group');
  switcher.setAttribute('aria-label',en?'Preview device':'Dispositivo de vista previa');
  const phone=document.createElement('button'),desktop=document.createElement('button');
  phone.type=desktop.type='button';
  phone.textContent=en?'Phone · 390 px':'Teléfono · 390 px';
  desktop.textContent=en?'Desktop · 1280 px':'Computadora · 1280 px';
  switcher.append(phone,desktop);
  const external=document.createElement('a');
  external.className='mi-live-open';
  external.href=url;
  external.target='_blank';external.rel='noopener noreferrer';
  external.textContent=en?'Open the real website':'Abrir el sitio real';
  bar.append(switcher,external);wrap.append(bar);

  const frame=document.createElement('div');frame.className='mi-demo-screen mi-live-frame';
  const browser=document.createElement('div');browser.className='mi-demo-browser';
  for(let i=0;i<3;i++)browser.append(document.createElement('i'));
  const title=document.createElement('small');
  title.textContent=en?'LIVE WEBSITE · CASA BROWNIE':'SITIO REAL · CASA BROWNIE';
  browser.append(title);frame.append(browser);
  const viewport=document.createElement('div');viewport.className='mi-live-viewport';
  const stage=document.createElement('div');stage.className='mi-live-stage';
  const iframe=document.createElement('iframe');
  iframe.className='mi-live-iframe';iframe.title=en?'Casa Brownie real website preview':'Vista del sitio real Casa Brownie';
  iframe.src=url;iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';
  stage.append(iframe);viewport.append(stage);frame.append(viewport);wrap.append(frame);
  const note=document.createElement('p');note.className='mi-demo-state';
  note.textContent=en
   ?'The phone and desktop buttons change the actual website viewport. On a small screen, desktop is scaled down to fit; use “Open the real website” to test every button at full size.'
   :'Los botones cambian el ancho real de la web, no solamente el marco. En un teléfono, la vista de computadora se reduce para caber; abre el sitio real para probar los botones a tamaño completo.';
  wrap.append(note);content.append(wrap);

  let device=window.matchMedia?.('(max-width: 760px)').matches?'mobile':'desktop';
  function resize(){
    if(!wrap.isConnected)return;
    const mobile=device==='mobile';
    const siteWidth=mobile?390:1280;
    const siteHeight=mobile?790:850;
    const available=Math.max(200,viewport.clientWidth);
    const scale=Math.min(1,available/siteWidth);
    stage.style.width=(siteWidth*scale)+'px';
    stage.style.height=(siteHeight*scale)+'px';
    iframe.style.width=siteWidth+'px';iframe.style.height=siteHeight+'px';
    iframe.style.transform='scale('+scale+')';
    phone.setAttribute('aria-pressed',String(mobile));
    desktop.setAttribute('aria-pressed',String(!mobile));
    frame.dataset.device=device;
  }
  phone.addEventListener('click',()=>{device='mobile';resize();});
  desktop.addEventListener('click',()=>{device='desktop';resize();});
  if(typeof ResizeObserver!=='undefined'){
    const ro=new ResizeObserver(()=>{if(!wrap.isConnected){ro.disconnect();return;}resize();});
    ro.observe(viewport);
  }else window.addEventListener('resize',resize,{passive:true});
  resize();
}

/* Curso · FAQ por temas, mismo patrón de interacción que TLE.
   Mantener todos los detalles visibles si JS no carga. */
(() => {
  const root = document.querySelector('.class-page-v2');
  const list = root?.querySelector('.class-faq');
  const tablist = root?.querySelector('#class-faq-categories');
  const details = [...(list?.querySelectorAll(':scope > details') || [])];
  const groups = {
    inicio:[0,1,3,5,6],
    herramientas:[2,4,7,9],
    inscripcion:[8,10]
  };
  if (list && tablist && details.length === 11) {
    const panels = {};
    for(const [key,indexes] of Object.entries(groups)) {
      const panel = document.createElement('div');
      panel.id = 'class-faq-panel-' + key;
      panel.className = 'class-faq-panel';
      panel.setAttribute('role','tabpanel');
      panel.setAttribute('aria-labelledby','class-faq-tab-'+key);
      indexes.forEach(i => panel.append(details[i]));
      list.append(panel);
      panels[key] = panel;
    }
    const tabs = [...tablist.querySelectorAll('[data-class-faq-topic]')];
    const activate = (index,moveFocus=false) => {
      const activeTab = tabs[index];
      if (!activeTab) return;
      tablist.style.setProperty('--faq-index',String(index));
      tabs.forEach((tab,i)=>{
        tab.setAttribute('aria-selected',String(i===index));
        tab.tabIndex = i===index ? 0 : -1;
      });
      for(const [key,panel] of Object.entries(panels)) {
        const active = key===activeTab.dataset.classFaqTopic;
        panel.hidden = !active;
        panel.classList.toggle('is-current',active);
        if(!active) panel.querySelectorAll('details[open]').forEach(item=>{item.open=false});
      }
      if(moveFocus)activeTab.focus();
    };
    tabs.forEach((tab,index)=>{
      tab.addEventListener('click',()=>activate(index));
      tab.addEventListener('keydown',event=>{
        let next=null;
        if(event.key==='ArrowRight')next=(index+1)%tabs.length;
        if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
        if(event.key==='Home')next=0;
        if(event.key==='End')next=tabs.length-1;
        if(next!==null){event.preventDefault();activate(next,true)}
      });
    });
    activate(0);
    tablist.hidden=false;
  }
  const checks=[...document.querySelectorAll('[data-class-sample-check]')];
  const progress=document.getElementById('class-checklist-progress');
  if(progress&&checks.length){
    const render=()=>{progress.textContent=checks.filter(c=>c.checked).length+' / '+checks.length};
    checks.forEach(c=>c.addEventListener('change',render));
    render();
  }
})();
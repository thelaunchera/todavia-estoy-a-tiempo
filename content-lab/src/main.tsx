import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Apply saved device settings on EVERY launch, not only after opening Settings.
try {
  document.documentElement.dataset.labMotion=localStorage.getItem('content-lab:settings-motion')==='off'?'off':'on';
  document.documentElement.dataset.labDensity=localStorage.getItem('content-lab:settings-compact')==='on'?'compact':'comfortable';
} catch {
  document.documentElement.dataset.labMotion='on';
  document.documentElement.dataset.labDensity='comfortable';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Opt-in browser install support. Never cache private images or authenticated
// responses; the worker only serves a safe offline page for navigations.
if('serviceWorker' in navigator&&window.isSecureContext){
 window.addEventListener('load',()=>{
  void navigator.serviceWorker.register('/content-lab/sw.js',{scope:'/content-lab/'})
   .catch(error=>{if(import.meta.env.DEV)console.warn('Content Lab PWA installation unavailable',error)});
 },{once:true});
}

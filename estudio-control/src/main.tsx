import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

/* Servicio limitado al directorio /estudio/; nunca guarda consultas privadas de Supabase. */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const appBase = new URL(import.meta.env.BASE_URL, window.location.href);
    navigator.serviceWorker.register(new URL('sw.js', appBase), { scope: appBase.pathname })
      .catch(() => { /* La aplicación funciona online aunque el dispositivo no permita SW. */ });
  }, { once: true });
}

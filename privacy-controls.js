/* Optional statistics are off until a deliberate choice. No dependencies. */
(() => {
  'use strict';
  if (window.TLEPrivacy) return;
  const script = document.currentScript;
  const site = script?.dataset.site || 'tle';
  const key = site + '_privacy_choice_v1';
  const gaId = script?.dataset.gaId || '';
  const manual = script?.hasAttribute('data-manual-mount');
  const signal = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  let choice = null;
  let panel, opener, returnFocus;
  let gaLoaded = false;
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value?.version === 1 && typeof value.analytics === 'boolean' && value.expires > Date.now() ? value : null;
    } catch { return null; }
  }
  choice = read();
  const allowed = () => choice?.analytics === true && !signal();
  function clearStatistics() {
    // Do not clear authentication, business records, language or accessibility settings.
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat)(_|$)/.test(name)) continue;
      const domains = ['', location.hostname, '.' + location.hostname, '.thelaunchera.com'];
      domains.forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
      });
    }
    try {
      ['tleTrafficSource', 'tleTrafficCampaign', 'tleTrafficMedium', 'tleLandingPath', 'podcast_audio_session_v1'].forEach(name => sessionStorage.removeItem(name));
      localStorage.removeItem('tle_visitor_id');
    } catch {}
  }
  function updateAnalytics() {
    if (!gaId) { if (!allowed()) clearStatistics(); return; }
    window['ga-disable-' + gaId] = !allowed();
    if (!allowed()) {
      clearStatistics();
      if (gaLoaded && window.gtag) window.gtag('consent', 'update', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
      return;
    }
    if (gaLoaded) {
      window.gtag('consent', 'update', {analytics_storage: 'granted'});
      return;
    }
    if (!/^(thelaunchera\.com|www\.thelaunchera\.com|app\.thelaunchera\.com|thelaunchera\.github\.io)$/.test(location.hostname) || navigator.webdriver) return;
    gaLoaded = true;
    window.dataLayer = [];
    window.gtag = function () { if (allowed() || arguments[0] === 'consent') window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
    window.gtag('js', new Date());
    let referrer = '';
    try { referrer = document.referrer ? new URL(document.referrer).origin : ''; } catch {}
    window.gtag('config', gaId, {
      send_page_view: !script?.hasAttribute('data-manual-page'),
      page_location: location.origin + location.pathname,
      page_referrer: referrer,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    tag.dataset.tleGa = '1';
    document.head.appendChild(tag);
  }
  function hide() {
    if (panel) panel.hidden = true;
    document.documentElement.removeAttribute('data-privacy-pending');
    returnFocus?.focus?.({preventScroll: true});
  }
  function save(analytics) {
    choice = {version: 1, analytics: Boolean(analytics) && !signal(), updated: new Date().toISOString(), expires: Date.now() + 180 * 86400000};
    try { localStorage.setItem(key, JSON.stringify(choice)); } catch { /* Choice still works for this page. */ }
    updateAnalytics();
    hide();
    window.dispatchEvent(new CustomEvent('tle:privacy-change', {detail: {analytics: allowed()}}));
  }
  function language() {
    const value = new URLSearchParams(location.search).get('lang') || document.documentElement.lang || 'en';
    return ['es', 'fr', 'ht'].includes(value.slice(0, 2)) ? value.slice(0, 2) : 'en';
  }
  const words = {
    en: ['Privacy & cookies', 'Essential storage keeps this site working. Usage statistics are optional and enabled only with your consent.', 'Essentials only', 'Allow statistics', 'Cookie settings', 'Cookie policy', 'Your browser requests additional privacy. Optional statistics remain off.'],
    es: ['Privacidad y cookies', 'Usamos almacenamiento esencial para el funcionamiento del sitio. Las estadísticas de uso son opcionales y solo se activan con tu permiso.', 'Solo necesarias', 'Aceptar estadísticas', 'Ajustes de cookies', 'Política de cookies', 'Tu navegador solicita privacidad adicional. Las estadísticas opcionales permanecerán desactivadas.'],
    fr: ['Confidentialité et cookies', 'Le stockage essentiel assure le fonctionnement du site. Les statistiques sont facultatives et nécessitent votre accord.', 'Essentiels uniquement', 'Autoriser les statistiques', 'Réglages des cookies', 'Politique de cookies', 'Votre navigateur demande une protection supplémentaire. Les statistiques restent désactivées.'],
    ht: ['Konfidansyalite ak cookies', 'Nou itilize depo ki nesesè pou sit la mache. Estatistik yo opsyonèl e nou aktive yo sèlman si ou dakò.', 'Sèlman sa ki nesesè', 'Pèmèt estatistik', 'Reglaj cookies', 'Politik cookies', 'Navigatè ou mande plis konfidansyalite. Estatistik yo rete etenn.']
  };
  function open() {
    mount();
    returnFocus = document.activeElement;
    const w = words[language()];
    panel.querySelector('h2').textContent = w[0];
    panel.querySelector('p').textContent = signal() ? w[6] : w[1];
    panel.querySelector('[data-reject]').textContent = w[2];
    panel.querySelector('[data-accept]').textContent = w[3];
    panel.querySelector('[data-accept]').disabled = signal();
    panel.querySelector('a').textContent = w[5];
    panel.hidden = false;
    document.documentElement.setAttribute('data-privacy-pending', '');
  }
  function mount() {
    if (panel || !document.body) return;
    const w = words[language()];
    const css = document.createElement('style');
    css.textContent = site === 'podcast' ? `.privacy-notice{
  position:fixed;z-index:2147483000;
  left:16px;bottom:calc(16px + env(safe-area-inset-bottom, 0px));
  width:min(390px,calc(100vw - 32px));max-height:min(290px,calc(100dvh - 36px));
  box-sizing:border-box;overflow-y:auto;
  padding:15px 16px 12px;
  border:1px solid #d9d8dd;border-radius:17px;
  background:#faf9f6;color:#25364c;
  box-shadow:0 15px 40px rgba(19,35,56,.16);
  font:13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;
  text-align:left;
}
.privacy-notice[hidden]{display:none!important}
.privacy-notice h2{display:flex;align-items:center;gap:9px;margin:0 0 5px;font:650 16px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;letter-spacing:-.015em;color:#25364c}
.privacy-notice h2::before{content:"";display:inline-block;width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:#bf93a7}
.privacy-notice p{margin:0 0 12px;color:#596676;font-size:12.5px;line-height:1.48}
.privacy-actions{display:grid;grid-template-columns:1fr 1.14fr;gap:8px}
.privacy-notice button{min-width:0;min-height:42px;padding:9px 8px;border:1px solid #cdd4dc;border-radius:11px;background:#fff;color:#273c54;cursor:pointer;font:650 12px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
.privacy-notice button[data-accept]{background:#253d59;border-color:#253d59;color:#fff}
.privacy-notice button:not(:disabled):hover{filter:brightness(.95)}
.privacy-notice button:disabled{opacity:.55;cursor:default}
.privacy-notice a{display:inline-block;margin-top:9px;color:#425d79;font-size:11.5px;line-height:1.4;text-underline-offset:3px}
.privacy-settings{min-height:44px;min-width:44px;font:inherit;color:inherit;background:transparent;border:0;text-decoration:underline;cursor:pointer}
.privacy-settings-float{position:fixed;bottom:12px;left:12px;z-index:1000;background:#faf9f6;color:#25364c;border:1px solid #cdd4dc;border-radius:12px;padding:9px 13px;font:12px -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
.privacy-notice :focus-visible,.privacy-settings:focus-visible{outline:3px solid #5b83a4;outline-offset:3px}
@media(max-width:480px){
  .privacy-notice{left:12px;bottom:calc(10px + env(safe-area-inset-bottom, 0px));width:calc(100vw - 24px);padding:13px 14px 11px;border-radius:15px}
  .privacy-notice h2{font-size:15px}
  .privacy-notice p{font-size:12px;margin-bottom:10px}
  .privacy-notice button{min-height:40px;font-size:11.5px}
  .privacy-notice a{font-size:11px;margin-top:8px}
}
@media(max-width:335px){.privacy-actions{grid-template-columns:1fr 1fr}.privacy-notice button{font-size:11px;padding:7px 5px}}` : '.privacy-notice{position:fixed;z-index:2147483000;left:16px;bottom:16px;width:min(560px,calc(100vw - 32px));box-sizing:border-box;max-height:55svh;overflow:auto;padding:20px;background:#faf8f3;color:#191919;border:1px solid #596c7c;border-radius:18px;box-shadow:0 12px 40px #19191930;font:15px/1.5 system-ui,sans-serif;text-align:left}.privacy-notice[hidden]{display:none!important}.privacy-notice h2{font:600 20px/1.2 system-ui,sans-serif;margin:0 0 10px;color:#191919}.privacy-notice p{margin:0 0 14px;color:#333}.privacy-actions{display:flex;gap:10px;flex-wrap:wrap}.privacy-notice button{flex:1;min-height:44px;padding:10px 14px;background:#d5e6f1;color:#191919;border:1px solid #596c7c;border-radius:10px;cursor:pointer;font:600 14px/1.3 system-ui,sans-serif}.privacy-notice button:disabled{opacity:.6;cursor:default}.privacy-notice a{display:inline-block;margin-top:12px;color:#234f6d;text-decoration:underline}.privacy-settings{min-height:44px;min-width:44px;font:inherit;color:inherit;background:transparent;border:0;text-decoration:underline;cursor:pointer}.privacy-settings-float{position:fixed;bottom:10px;left:10px;z-index:1000;background:#faf8f3;color:#191919;border:1px solid #596c7c;border-radius:10px;padding:8px 12px;font:13px system-ui,sans-serif}.privacy-notice :focus-visible,.privacy-settings:focus-visible{outline:3px solid #234f6d;outline-offset:3px}@media(max-width:480px){.privacy-notice{left:10px;bottom:10px;width:calc(100vw - 20px);padding:16px;font-size:14px}.privacy-actions button{min-width:130px}}';
    document.head.appendChild(css);
    panel = document.createElement('section');
    panel.className = 'privacy-notice';
    panel.id = 'privacy-notice';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', 'privacy-notice-title');
    panel.hidden = true;
    panel.innerHTML = '<h2 id="privacy-notice-title"></h2><p></p><div class="privacy-actions"><button type="button" data-reject></button><button type="button" data-accept></button></div><a></a>';
    const policy = site === 'podcast' ? '/cookies.html' : (language() === 'es' ? 'https://thelaunchera.com/es/cookies.html' : 'https://thelaunchera.com/cookies.html');
    panel.querySelector('a').href = policy;
    panel.querySelector('[data-reject]').addEventListener('click', () => save(false));
    panel.querySelector('[data-accept]').addEventListener('click', () => save(true));
    document.body.appendChild(panel);
    if (!document.querySelector('[data-privacy-settings]')) {
      opener = document.createElement('button');
      opener.type = 'button';
      opener.className = 'privacy-settings privacy-settings-float';
      opener.dataset.privacySettings = '';
      opener.textContent = w[4];
      document.body.appendChild(opener);
    }
    document.addEventListener('click', event => {
      if (event.target.closest?.('[data-privacy-settings]')) { open(); panel.querySelector('button').focus(); }
    });
    panel.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
    if (!choice && !signal()) open();
  }
  window.TLEPrivacy = Object.freeze({allowed, open, mount});
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    choice = read();
    updateAnalytics();
    window.dispatchEvent(new CustomEvent('tle:privacy-change', {detail: {analytics: allowed()}}));
  });
  updateAnalytics();
  if (!manual) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true});
    else mount();
  }
})();

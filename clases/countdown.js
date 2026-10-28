/*
 * Cuenta regresiva de Tu primera web con IA.
 * El 2 de diciembre termina a las 23:59:59; lanzamiento a las 00:00 del día 3,
 * en hora de Florida (America/New_York = UTC-05 en diciembre).
 * No controla pagos ni habilita el aula de alumnos.
 */
(() => {
  'use strict';

  const clock = document.getElementById('reloj-lanzamiento');
  if (!clock) return;

  const target = Date.parse(clock.dataset.launchAt || '');
  if (!Number.isFinite(target)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const groups = ['days', 'hours', 'minutes', 'seconds'];
  const digits = new Map();
  let interval = null;
  let finished = false;

  const asString = (value) => String(value).padStart(2, '0');
  const display = {
    days: 'días', hours: 'horas', minutes: 'minutos', seconds: 'segundos'
  };

  function makeHalf(cssClass, text) {
    const half = document.createElement('span');
    half.className = cssClass;
    const glyph = document.createElement('span');
    glyph.className = 'class-flip-glyph';
    glyph.textContent = text;
    half.appendChild(glyph);
    return { half, glyph };
  }

  function makeDigit(symbol) {
    const element = document.createElement('span');
    element.className = 'class-flip-digit';
    element.setAttribute('aria-hidden', 'true');

    const top = makeHalf('class-flip-static-top', symbol);
    const bottom = makeHalf('class-flip-static-bottom', symbol);
    const flapTop = makeHalf('class-flip-flap-top', symbol);
    const flapBottom = makeHalf('class-flip-flap-bottom', symbol);
    [top, bottom, flapTop, flapBottom].forEach(x => element.appendChild(x.half));

    return {
      element, top: top.glyph, bottom: bottom.glyph,
      flapTop: flapTop.glyph, flapBottom: flapBottom.glyph,
      current: symbol, timeout: null
    };
  }

  function setDigit(digit, newSymbol, animate) {
    if (digit.current === newSymbol) return;
    if (digit.timeout !== null) {
      window.clearTimeout(digit.timeout);
      digit.timeout = null;
    }

    // Finish any interrupted flip before starting a new value.
    digit.element.classList.remove('is-flipping');
    digit.top.textContent = digit.current;
    digit.bottom.textContent = digit.current;

    if (!animate || reducedMotion.matches) {
      digit.top.textContent = newSymbol;
      digit.bottom.textContent = newSymbol;
      digit.current = newSymbol;
      return;
    }

    // 0-250 ms: old top folds up. 250-500 ms: new bottom unfolds.
    digit.flapTop.textContent = digit.current;
    digit.flapBottom.textContent = newSymbol;
    digit.top.textContent = newSymbol;
    // Keep bottom old until the second half has unfolded.
    digit.current = newSymbol;

    void digit.element.offsetWidth;
    digit.element.classList.add('is-flipping');
    digit.timeout = window.setTimeout(() => {
      digit.bottom.textContent = newSymbol;
      digit.element.classList.remove('is-flipping');
      digit.timeout = null;
    }, 500);
  }

  function paint(values, animate) {
    const activeMotion = animate && !document.hidden;
    for (const key of groups) {
      const str = asString(values[key]);
      const group = digits.get(key) || [];
      str.split('').forEach((char, i) => {
        if (group[i]) setDigit(group[i], char, activeMotion);
      });
    }
    clock.querySelector('.class-flip-timer')?.setAttribute(
      'aria-label',
      groups.map(key => values[key] + ' ' + display[key]).join(', ') +
      ' para el lanzamiento'
    );
  }

  function getRemaining(now) {
    const wholeSeconds = Math.max(0, Math.ceil((target - now) / 1000));
    return {
      days: Math.floor(wholeSeconds / 86400),
      hours: Math.floor((wholeSeconds % 86400) / 3600),
      minutes: Math.floor((wholeSeconds % 3600) / 60),
      seconds: wholeSeconds % 60
    };
  }

  function draw(animate = true) {
    const now = Date.now();
    const values = getRemaining(now);
    paint(values, animate);
    if (now >= target && !finished) {
      finished = true;
      clock.classList.add('is-launched');
      const heading = clock.querySelector('#class-launch-heading');
      const status = clock.querySelector('#class-launch-status');
      if (heading) heading.textContent = '¡Llegó el día del lanzamiento!';
      if (status) status.textContent = 'Revisa la información más reciente de la clase.';
      if (interval !== null) {
        window.clearInterval(interval);
        interval = null;
      }
    }
  }

  const initial = getRemaining(Date.now());
  for (const key of groups) {
    const container = clock.querySelector('[data-digits="' + key + '"]');
    if (!container) continue;
    container.replaceChildren();
    const items = [];
    for (const ch of asString(initial[key])) {
      const digit = makeDigit(ch);
      container.appendChild(digit.element);
      items.push(digit);
    }
    digits.set(key, items);
  }

  clock.classList.add('is-ready');
  draw(false);
  if (!finished) {
    interval = window.setInterval(() => draw(true), 160);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) draw(false);
  });
  reducedMotion.addEventListener?.('change', e => {
    if (e.matches) draw(false);
  });
  window.addEventListener('pagehide', () => {
    if (interval !== null) window.clearInterval(interval);
    for (const group of digits.values()) {
      group.forEach(digit => {
        if (digit.timeout !== null) window.clearTimeout(digit.timeout);
      });
    }
  }, {once:true});
})();

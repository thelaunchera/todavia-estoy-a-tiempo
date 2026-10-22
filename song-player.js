// Canción de Todavía estoy a tiempo. No se rastrean correos, IPs ni nombres.
(() => {
  'use strict';
  const config = window.PODCAST_CONFIG || {};
  const section = document.getElementById('nuestra-cancion');
  const audio = document.getElementById('theme-song-audio');
  const url = typeof config.themeSongUrl === 'string' ? config.themeSongUrl.trim() : '';
  // Un reproductor sin fuente no se debe mostrar a los visitantes.
  if (!section || !audio || !url) return;
  let src;
  try { src = new URL(url, window.location.href); }
  catch { return; }
  if (!['https:', 'http:'].includes(src.protocol)) return;
  audio.src = src.href;
  section.hidden = false;

  const {endpoint, publishableKey} = config.themeSongAnalytics || {};
  const analyticsOk = typeof endpoint === 'string' && endpoint.startsWith('https://')
    && typeof publishableKey === 'string' && publishableKey.startsWith('sb_publishable_');
  let sessionId = '';
  try {
    sessionId = sessionStorage.getItem('podcast_audio_session_v1') || crypto.randomUUID();
    sessionStorage.setItem('podcast_audio_session_v1', sessionId);
  } catch { sessionId = crypto.randomUUID(); }
  let playbackId = '';
  let playedBeforeThisStart = 0;
  const milestones = new Set();

  const playedSeconds = () => {
    // La longitud de los tramos realmente reproducidos evita inflar cifras al saltar adelante.
    let sum = 0;
    for (let i = 0; i < audio.played.length; i++) sum += Math.max(0, audio.played.end(i) - audio.played.start(i));
    return sum;
  };
  function emit(name) {
    if (!analyticsOk || !playbackId || milestones.has(name)) return;
    milestones.add(name);
    const seconds = Math.floor(Math.min(7200, Math.max(0, playedSeconds() - playedBeforeThisStart)));
    fetch(endpoint, {
      method: 'POST', mode: 'cors', keepalive: true,
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        track_code: 'podcast_theme_song',
        play_id: playbackId,
        listener_session: sessionId,
        event_name: name,
        position_seconds: seconds
      })
    }).catch(() => { /* Nunca interrumpir el audio por fallos de medición. */ });
  }
  audio.addEventListener('play', () => {
    if (!playbackId) {
      playbackId = crypto.randomUUID();
      playedBeforeThisStart = playedSeconds();
      milestones.clear();
    }
    emit('play');
  });
  audio.addEventListener('timeupdate', () => {
    if (!playbackId || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const percent = Math.max(0, playedSeconds() - playedBeforeThisStart) / audio.duration;
    if (percent >= .25) emit('quarter');
    if (percent >= .50) emit('half');
    if (percent >= .75) emit('three_quarters');
    if (percent >= .95) emit('completed');
  });
  audio.addEventListener('ended', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0 && (playedSeconds() - playedBeforeThisStart) / audio.duration >= .95) emit('completed');
    playbackId = '';
  });
})();

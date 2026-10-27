// Accept Spotify's public episode links, including shares from its Creators app.
// Show pages and private dashboard URLs are not episode listening links.
export function normalizeSpotifyEpisodeLink(value?: string): string | null {
  const input = (value || '').trim();
  if (!input || /\s/.test(input)) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    const episode = url.hostname === 'open.spotify.com' &&
      /^\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?episode\/[A-Za-z0-9]+\/?$/.test(url.pathname);
    const sharedEpisode = url.hostname === 'spotifycreators-web.app.link' &&
      /^\/e\/[A-Za-z0-9]+\/?$/.test(url.pathname);
    const creatorsEpisode = url.hostname === 'creators.spotify.com' &&
      /^\/pod\/profile\/[^/]+\/episodes\/[^/]+\/?$/.test(url.pathname);
    return episode || sharedEpisode || creatorsEpisode ? url.href : null;
  } catch {
    return null;
  }
}

export const validSpotifyEpisode = (value?: string): boolean =>
  normalizeSpotifyEpisodeLink(value) !== null;

export const SPOTIFY_EPISODE_ERROR =
  'Pega el enlace de un capítulo: open.spotify.com/episode/… o el enlace compartido de Spotify for Creators (spotifycreators-web.app.link/e/…). La página general del podcast no sirve.';

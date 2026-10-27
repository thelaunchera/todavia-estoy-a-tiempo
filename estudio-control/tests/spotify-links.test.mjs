import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeSpotifyEpisodeLink, validSpotifyEpisode } from '../src/spotify-links.ts';

test('accepts public episodes shared from Spotify and Spotify for Creators', () => {
  for (const link of [
    'https://open.spotify.com/episode/6rqhFgbbKwnb9MLmUQDhG6',
    'https://open.spotify.com/episode/6rqhFgbbKwnb9MLmUQDhG6?si=example#player',
    'https://open.spotify.com/intl-es/episode/6rqhFgbbKwnb9MLmUQDhG6/',
    'https://spotifycreators-web.app.link/e/118UbMLaxXb',
    'https://spotifycreators-web.app.link/e/118UbMLaxXb?%24web_only=true',
    'https://creators.spotify.com/pod/profile/the-push-to-pass-podcast0/episodes/Meet-the-band-of-brothers--they-give-us-some-live-tunes--Morning-Wood-EP6-e39lddt?%24web_only=true',
  ]) assert.equal(validSpotifyEpisode(link), true, link);
});

test('trims pasted links without losing their sharing parameters', () => {
  assert.equal(
    normalizeSpotifyEpisodeLink('  https://spotifycreators-web.app.link/e/118UbMLaxXb?%24web_only=true  '),
    'https://spotifycreators-web.app.link/e/118UbMLaxXb?%24web_only=true',
  );
});

test('rejects show pages, private dashboards, incomplete links and lookalike hosts', () => {
  for (const link of [
    undefined, '', 'not a link',
    'https://open.spotify.com/show/4f22tdJv8nMdTSMKc1kvIh',
    'https://open.spotify.com/episode/',
    'https://creators.spotify.com/pod/profile/example',
    'https://creators.spotify.com/pod/show/example/episode/abc',
    'https://spotifycreators-web.app.link/',
    'https://spotifycreators-web.app.link/e/',
    'https://spotifycreators-web.app.link/e/abc/extra',
    'https://open.spotify.com.evil.example/episode/abc',
    'https://spotifycreators-web.app.link.evil.example/e/abc',
    'https://spotifycreators-web.app.link@evil.example/e/abc',
    'https://user:password@spotifycreators-web.app.link/e/abc',
    'http://spotifycreators-web.app.link/e/abc',
    'javascript:alert(1)',
    'https://spotifycreators-web.app.link:8443/e/abc',
    'https://spotifycreators-web.app.link/e/ab c',
  ]) assert.equal(validSpotifyEpisode(link), false, String(link));
});

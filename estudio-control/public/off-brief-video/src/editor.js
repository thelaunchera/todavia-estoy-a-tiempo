(function offBriefStudio() {
  'use strict';
  const root = document.getElementById('app');
  const EPISODES = [
    {
      "no": 1,
      "title": "The Viral Emergency",
      "drive": "https://drive.google.com/drive/folders/1SOjQOVRq2HoFczfVANGPWNggM0FtaPMX"
    },
    {
      "no": 2,
      "title": "The Client Said Beige",
      "drive": "https://drive.google.com/drive/folders/1H9ZVmc1t3wPrR81J2l497hpkjCn8WGan"
    },
    {
      "no": 3,
      "title": "Influencer for a Day",
      "drive": "https://drive.google.com/drive/folders/1XDkFyE5RF6ryWUi1_U_juPcrpkCxTz9K"
    },
    {
      "no": 4,
      "title": "The AI Intern",
      "drive": "https://drive.google.com/drive/folders/1uW3IIoSLqUKoF_m-w_FIMsNMuufh3Pas"
    },
    {
      "no": 5,
      "title": "One Product, 100 Photos",
      "drive": "https://drive.google.com/drive/folders/1NqeHhEpQyPLUNYOhk0A4CKufywz3Z2Pz"
    },
    {
      "no": 6,
      "title": "The Competitor",
      "drive": "https://drive.google.com/drive/folders/1N_TxxJn5XVk5DZqGHnj-QX9TmtbV8Kqm"
    },
    {
      "no": 7,
      "title": "The Biggest Pitch",
      "drive": "https://drive.google.com/drive/folders/1nQo8EOZEFOeqLZWbbQBr0DOp5ZtG6b9f"
    }
  ];
  const EPISODE_MEDIA = {
    "1": [
      "https://drive.google.com/file/d/1ZAe16F65uBB-LYb69s9MJTI_OllB6USb/view?usp=drivesdk",
      "https://drive.google.com/file/d/18Q55xz7A6iaO0h4gPHvmpGTCKmn_RybV/view?usp=drivesdk"
    ],
    "2": [
      "https://drive.google.com/file/d/1mfIG4di_TJeFzbIhHG_JRiD1hw0ju_2c/view?usp=drivesdk",
      "https://drive.google.com/file/d/1UZSTdoondfU54fXbhpbH09uR2mXm1EsW/view?usp=drivesdk"
    ],
    "3": [
      "https://drive.google.com/file/d/1OKYfNswAJzb270qV8Ip4omf8eLuePIjo/view?usp=drivesdk",
      "https://drive.google.com/file/d/1vvHnzBAdHMbaLqzjukg-VahvAeL7XX1l/view?usp=drivesdk"
    ],
    "4": [
      "https://drive.google.com/file/d/10ha10QPrXpjxy2YBG6uAwX2fSa1bk3d6/view?usp=drivesdk",
      "https://drive.google.com/file/d/1VnlPPieIx0_AoMegAGzy6gk7znvc9hEc/view?usp=drivesdk"
    ],
    "5": [
      "https://drive.google.com/file/d/1YohMhLXyLJgDQQQXl-k0JnUKpW3cMFqn/view?usp=drivesdk",
      "https://drive.google.com/file/d/1w3y-s_FGu00JSIJeHp2pQVNk0_lW-P37/view?usp=drivesdk"
    ],
    "6": [
      "https://drive.google.com/file/d/1mg1IycoSzbSU9TOZGy954CLUsaj9WhzU/view?usp=drivesdk",
      "https://drive.google.com/file/d/1DHmBnq2qez_TprlQYKqRslmnnvIzd4dw/view?usp=drivesdk"
    ],
    "7": [
      "https://drive.google.com/file/d/1nS50auqSGIJa7m4_i5fHLDkENSy0S-cQ/view?usp=drivesdk",
      "https://drive.google.com/file/d/1NZfwezaoy-Vq3SrDckAFxZE5GGMsBR_b/view?usp=drivesdk"
    ]
  };

  const DB_NAME = 'offbrief-ipad-studio-v1';
  let database;
  let projects = [];
  let selectedId = null;
  let activeId = null;
  let currentTime = 0;
  let playing = false;
  let recording = false;
  let rafId = 0;
  let startedAt = 0;
  let audioSession = null;
  let saveTimer = null;
  let exportUrl = '';
  let exportFile = null;
  let progressTimer = null;
  let notice = '';
  const uid = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(36).slice(2);
  const safe = value =>
    String(value == null ? '' : value).replace(
      /[&<>"']/g,
      char =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[char]
    );
  const $ = selector => root.querySelector(selector);
  const makeScene = (kind = 'photo', index = 1) => ({
    id: uid(),
    kind,
    name:
      kind === 'title'
        ? 'OFF BRIEF'
        : kind === 'bumper'
          ? 'OFF BRIEF · Intro'
          : 'Scene ' + String(index).padStart(2, '0'),
    duration: kind === 'bumper' ? 6 : kind === 'title' ? 3 : 6,
    motion: 'zoom',
    subtitle: '',
    imageBlob: null,
    voiceBlob: null,
  });
  const makeProject = name => ({
    id: uid(),
    name: name || 'The Viral Emergency',
    episodeNo: null,
    ratio: '16:9',
    quality: '720',
    musicBlob: null,
    musicName: '',
    musicVolume: 18,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    scenes: [makeScene()],
  });
  function makeSeasonEpisode(meta) {
    const p = makeProject(meta.title);
    p.episodeNo = meta.no;
    const intro = makeScene('bumper');
    intro.subtitle = meta.title;
    p.scenes = [intro];
    for (let i = 1; i <= 10; i++) {
      const photo = makeScene('photo', i);
      photo.name = 'Scene ' + String(i).padStart(2, '0');
      p.scenes.push(photo);
    }
    return p;
  }
  function episodeFor(project) {
    return EPISODES.find(meta =>
      Number(project.episodeNo) === meta.no ||
      String(project.name || '').trim().toLowerCase() === meta.title.toLowerCase()
    );
  }
  function episodeKitHTML(meta) {
    if (!meta) return '';
    return '<section class="episode-kit">' +
      '<div><span class="eyebrow">SEASON 01 · EPISODE ' + String(meta.no).padStart(2,'0') + '</span>' +
      '<h3>Episode ready to assemble</h3>' +
      '<p>Your six-second OFF BRIEF intro is the first scene. Scene slots appear below. Original photos remain private in your Drive until imported to this iPad.</p></div>' +
      '<div class="episode-media-links">' +
      '<a class="episode-drive-link" href="' + safe(EPISODE_MEDIA[meta.no][0]) + '" target="_blank" rel="noopener noreferrer">Watch original MP4 · 6s</a>' +
      '<a class="episode-cover-link" href="' + safe(EPISODE_MEDIA[meta.no][1]) + '" target="_blank" rel="noopener noreferrer">Intro PNG</a>' +
      '<a class="episode-cover-link" href="' + safe(meta.drive) + '" target="_blank" rel="noopener noreferrer">Original scene photos</a>' +
      '</div></section>';
  }
  const current = () => projects.find(p => p.id === selectedId);
  const active = () => (current()?.scenes || []).find(s => s.id === activeId);
  const duration = scenes =>
    scenes.reduce((sum, s) => sum + Number(s.duration || 0), 0);
  const readableTime = seconds => {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    return (
      String(Math.floor(s / 60)).padStart(2, '0') +
      ':' +
      String(s % 60).padStart(2, '0')
    );
  };
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore('projects', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  function dbRequest(method, value) {
    return new Promise((resolve, reject) => {
      const tx = database.transaction('projects', 'readwrite');
      const request = tx.objectStore('projects')[method](value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  function dataCopy(p) {
    return {
      id: p.id,
      name: p.name,
      episodeNo: p.episodeNo || null,
      ratio: p.ratio,
      quality: p.quality,
      musicBlob: p.musicBlob,

import { CANON_EPISODES, CANON_CAST, canonicalShot, masterAnimationPrompt, hydrateCanonicalNote } from './canonical-helpers.js';
import {castCharacters,guestCharacters,seasonTwoTitles} from './season-two-cast.js';

(function bootOffBriefProduction() {
  'use strict';

  const episodes = CANON_EPISODES.map((original, index) => ({
    id: index + 1,
    season: original.season,
    number: original.episode,
    title: original.title,
    count: 10,
    source: original.season === 1
      ? 'Original two-minute English dialogue · ten official camera references'
      : 'Original Season 2 dialogue · original image files pending',
  }));
  const originalSpeakers = CANON_CAST;

  const videoProviders = [
    {id:'wan',name:'Wan 2.2 · ZeroGPU',free:'5 min GPU / día para cuentas gratuitas de Hugging Face',url:'https://huggingface.co/spaces/zerogpu-aoti/wan2-2-fp8da-aoti-faster',description:'Motor que ya probaste; comparte cuota ZeroGPU con otros Spaces.'},
    {id:'flow',name:'Google Flow',free:'50 créditos / día para cuentas sin suscripción',url:'https://labs.google/fx/tools/flow',description:'Créditos independientes; algunos modelos, horarios o regiones pueden limitar el acceso.'},
    {id:'pixverse',name:'PixVerse',free:'30 créditos diarios para cuentas sin membresía',url:'https://app.pixverse.ai/',description:'Cuota independiente; el costo de cada clip varía por modelo y resolución.'}
  ];
  const voiceProviders = [
    {id:'ttsmp3ai',name:'ttsMP3 AI Voices',free:'1,000 caracteres / día',url:'https://ttsmp3.com/ai',description:'Supports Voice Instructions for consistent character delivery. MP3 files can be used commercially; manual access only.'},
    {id:'ttsmp3',name:'ttsMP3',free:'3,000 caracteres / día (voces normales)',url:'https://ttsmp3.com/',description:'MP3 para YouTube monetizado; el modo de voz IA tiene una cuota menor.'},
    {id:'ttsmaker',name:'TTSMaker',free:'Plan gratuito con límite semanal',url:'https://ttsmaker.com/',description:'Genera y descarga voz; revisa las condiciones de la voz elegida.'},
    {id:'kokoro',name:'Kokoro TTS',free:'Modelo Apache 2.0; demo compartida',url:'https://huggingface.co/spaces/hexgrad/Kokoro-TTS',description:'Voces naturales sin licencia comercial restrictiva del modelo.'},
    {id:'chatterbox',name:'Chatterbox',free:'Código abierto; demo compartida',url:'https://huggingface.co/spaces/ResembleAI/Chatterbox',description:'Voces expresivas. Usa referencias propias o autorizadas.'}
  ];
  const voiceTemplates = {"Nia":{"voice":"Kore","instructions":"Identity: Nia, an adult creative studio cofounder who manages clients and deadlines.\nAffect: Grounded, observant, sophisticated, with a dry sarcastic edge.\nTone: Controlled, decisive and witty, with understated emphasis when something goes wrong.\nEmotion: Confident and practical; occasionally incredulous, never melodramatic.\nPronunciation: Native conversational US English. Crisp consonants, measured natural pauses; pronounce OFF BRIEF as two distinct English words."},"Ruby":{"voice":"Zephyr","instructions":"Identity: Ruby, an imaginative and funny adult creative director.\nAffect: Warm, effervescent, curious and a little chaotic, with authentic spontaneity.\nTone: Bright, animated, friendly and conversational; energy rises when she gets an idea.\nEmotion: Joyful and adventurous with natural reactions, gentle vulnerability when sincere.\nPronunciation: Natural conversational US English; playful rhythmic emphasis without exaggerated cartoon squealing."},"Mateo":{"voice":"Charon","instructions":"Identity: Mateo, a perceptive adult male writer with a quiet, ironic delivery.\nAffect: Understated, reflective, low-key and dryly hilarious.\nTone: Even, slightly low and deliberate; leave a short beat before clever punchlines.\nEmotion: Reserved amusement, subtle frustration, occasional warmth.\nPronunciation: Clear US English, distinct phrasing and unhurried timing; never perform an imitation of a famous comedian."},"Jules":{"voice":"Laomedeia","instructions":"Identity: Jules, an optimistic adult production coordinator and logistics expert.\nAffect: Fast-thinking, reassuring, lively, agile and human.\nTone: Upbeat and efficient, naturally quick when juggling schedules, not rushed or breathless.\nEmotion: Cheerful confidence with momentary panic that she tries to hide.\nPronunciation: Natural contemporary English, precise names, times and practical directions."},"Nova":{"voice":"Despina","instructions":"Identity: Nova, a calm and meticulous adult video editor and sound designer.\nAffect: Quiet, thoughtful, dryly funny, technically precise.\nTone: Lower-energy, smooth, intimate and slightly deadpan with sharply timed punchlines.\nEmotion: Composed, observant, occasionally annoyed by disorganized sound or edits.\nPronunciation: Clean contemporary US English with natural measured pauses; speak technical terms accurately."},"Simone":{"voice":"Aoede","instructions":"Identity: Simone, a charismatic adult PR and talent specialist.\nAffect: Confident, inviting, socially magnetic and quick with ideas.\nTone: Warm and polished with lively, persuasive momentum; friendly rather than salesy.\nEmotion: Optimistic delight, a touch of dramatic overconfidence, sincere care.\nPronunciation: Expressive fluent US English, fluid sentences and confident proper-name pronunciation."},"Val":{"voice":"Erinome","instructions":"Identity: Val, a decisive adult cinematographer who notices every detail in the light.\nAffect: Practical, direct, intense and visually exacting.\nTone: Clear, cool and assertive, with a deliberate pause before sharp visual instructions.\nEmotion: Focused urgency on set, dry satisfaction after a perfect take.\nPronunciation: Sharp contemporary US English; pronounce camera and lighting terms cleanly."},"Imani":{"voice":"Gacrux","instructions":"Identity: Imani, an experienced adult executive producer and negotiator.\nAffect: Poised, authoritative, unflappable and subtly funny.\nTone: Mature, strong, deliberate and firm without harshness.\nEmotion: Calm control, concern for scope and budget, occasional understated amusement.\nPronunciation: Articulate native US English, precise numbers, approvals and deadlines."},"June":{"voice":"Vindemiatrix","instructions":"Identity: June, an empathetic adult interviewer and documentary storyteller.\nAffect: Gentle, attentive, curious and observant.\nTone: Soft, warm and clear, giving room for other people to speak.\nEmotion: Sincere interest and quiet empathy; never overly sentimental.\nPronunciation: Natural gentle US English with thoughtful breathing and conversational pacing."},"Sage":{"voice":"Autonoe","instructions":"Identity: Sage, an adult set stylist and color designer who is passionate about detail.\nAffect: Creative, assured, opinionated and witty.\nTone: Expressive yet controlled; emphatic on color, materials and visual decisions.\nEmotion: Playful certainty, mild aesthetic horror at wrong colors, genuine excitement about a good result.\nPronunciation: Bright natural US English, clean emphasis on design words, no caricature."},"Arden":{"voice":"Alnilam","instructions":"Identity: Arden, a fictional adult marketing executive from Northlight.\nAffect: Professional, matter-of-fact and calmly authoritative.\nTone: Concise, measured, senior-level and confident.\nEmotion: Focused and respectful, understated encouragement.\nPronunciation: Clear neutral US English; speak company and project names accurately."},"Mrs. Vell":{"voice":"Sulafat","instructions":"Identity: Mrs. Vell, a mature adult boutique owner in the OFF BRIEF fictional world.\nAffect: Warm, assured, gracious and observant.\nTone: Welcoming, textured and gently amused.\nEmotion: Patient confidence with subtle delight.\nPronunciation: Natural English, careful distinct speech without a forced accent."},"Bookstore Owner":{"voice":"Callirrhoe","instructions":"Identity: A fictional adult independent bookstore owner giving an authentic interview.\nAffect: Everyday warmth, humility and light humor.\nTone: Conversational, grounded and unpolished in a believable way.\nEmotion: Genuine relief and pride, never scripted excitement.\nPronunciation: Everyday fluent English with natural pauses and ordinary language."},"Interviewee 1":{"voice":"Leda","instructions":"Identity: A fictional adult customer being interviewed on camera.\nAffect: Friendly but slightly camera-conscious.\nTone: Natural and relaxed, not an advertising announcer.\nEmotion: Cautious enthusiasm and honest hesitation.\nPronunciation: Clear English with normal conversational pacing."},"Interviewee 2":{"voice":"Achird","instructions":"Identity: A fictional adult customer being interviewed on camera.\nAffect: Good-humored and genuine.\nTone: Easygoing, casual and lightly amused.\nEmotion: Curious skepticism turning into everyday appreciation.\nPronunciation: Natural English with normal pauses and relaxed emphasis."},"Interviewee 3":{"voice":"Pulcherrima","instructions":"Identity: A fictional adult customer being interviewed on camera.\nAffect: Thoughtful, personable and a little nervous.\nTone: Soft and sincere, as if speaking without rehearsing.\nEmotion: Authentic cautious warmth, never salesy.\nPronunciation: Natural clear English, gentle pauses, avoid forced accents."}};
  const state = {
    view:'episodes',episode:1,scene:1,
    records:{},assets:{},urls:{},notice:'',
    voiceSettings:{Nia:{provider:'kokoro',voice:''},Ruby:{provider:'kokoro',voice:''},Narrator:{provider:'ttsmp3',voice:''}}
  };
  const base = document.getElementById('app');
  if(!base) return;
  const workspace = document.createElement('div');
  workspace.id='ob-production-root';
  document.body.appendChild(workspace);
  const returnButton=document.createElement('button');
  returnButton.id='ob-return-hub';
  returnButton.textContent='← OFF BRIEF · Episodes';
  returnButton.type='button';
  returnButton.addEventListener('click',()=>showProduction(true));
  document.body.appendChild(returnButton);
  const safe = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sceneKey = (episode,scene) => String(episode)+'-'+String(scene).padStart(2,'0');
  const mediaKey = (episode,scene,kind,lineId='') => [episode,scene,kind,lineId].join(':');
  const currentEpisode = () => episodes[state.episode-1]||episodes[0];
  const note = (episode = state.episode, scene = state.scene) => {
    const key = sceneKey(episode, scene);
    const existing = state.records[key];
    const result = hydrateCanonicalNote(existing, episode, scene, lineId =>
      Boolean(state.assets[mediaKey(episode, scene, 'audio', lineId)])
    );
    state.records[key] = result;
    return result;
  };
  let database;
  function db() {
    if(database) return Promise.resolve(database);
    return new Promise((resolve,reject)=>{
      const r=indexedDB.open('offbrief-production-v1',1);
      r.onupgradeneeded=()=>r.result.createObjectStore('records',{keyPath:'id'});
      r.onsuccess=()=>{database=r.result;resolve(database);};
      r.onerror=()=>reject(r.error);
    });
  }
  async function transact(method,record){
    const storage=await db();
    return new Promise((resolve,reject)=>{
      const t=storage.transaction('records','readwrite');
      const req=t.objectStore('records')[method](record);
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
  }
  async function init(){
    try{
      const all=await transact('getAll');
      for(const item of all){
        if(item.type==='note') state.records[item.id.slice(5)]=item.value;
        else if(item.type==='media')state.assets[item.id.slice(6)]={blob:item.blob,name:item.name};
        else if(item.type==='voices')state.voiceSettings=item.value;
        else if(item.type==='seasonTitle'){const ep=episodes.find(x=>x.id===item.episode);if(ep&&ep.season===2)ep.title=item.value;}
      }
    } catch(error) {state.notice='El guardado local no está disponible en este navegador.';}
    for (const character of originalSpeakers) {
      if (!state.voiceSettings[character]) {
        state.voiceSettings[character] = { provider: 'kokoro', voice: '' };
      }
    }
    showProduction(true);
  }
  function getAsset(key){return state.assets[key]||null;}
  function getUrl(key) {
    const media=getAsset(key);
    if(!media) return '';
    if(!state.urls[key])state.urls[key]=URL.createObjectURL(media.blob);
    return state.urls[key];
  }
  function mediaCount(episode){let count=0;for(let s=1;s<=10;s++)if(getAsset(mediaKey(episode,s,'clip'))) count++;return count;}
  function photoCount(episode){let count=0;for(let s=1;s<=10;s++)if(getAsset(mediaKey(episode,s,'photo'))) count++;return count;}
  function audioCount(episode,scene) {
    return note(episode,scene).dialogues.filter(line=>getAsset(mediaKey(episode,scene,'audio',line.id))).length;
  }
  function completed(episode,scene) {
    const n=note(episode,scene);
    const texts=n.dialogues.filter(l=>l.text.trim());
    return Boolean(getAsset(mediaKey(episode,scene,'clip'))&&texts.length&&texts.every(l=>getAsset(mediaKey(episode,scene,'audio',l.id))));
  }
  function minutes(episode){const list=Array.from({length:10},(_,i)=>note(episode,i+1).duration).filter(v=>v!==''&&Number(v)>0);return list.length?list.reduce((a,b)=>a+Number(b),0)+'s defined · '+(10-list.length)+' pending':'Durations not yet verified';}
  function notice(message){state.notice=message;const n=document.getElementById('ob-notice');if(n)n.textContent=message;}
  let saveTimer;
  const sceneSaveTimers = new Map();
  function scheduleSave() {
    const key = sceneKey(state.episode, state.scene);
    const data = JSON.parse(JSON.stringify(state.records[key]));
    clearTimeout(sceneSaveTimers.get(key));
    const indicator = document.getElementById('ob-save');
    if (indicator) indicator.textContent = 'Saving…';
    const timer = setTimeout(async () => {
      sceneSaveTimers.delete(key);
      try {
        await transact('put', { id: 'note:' + key, type: 'note', value: data });
        const label = document.getElementById('ob-save');
        if (label) label.textContent = 'Saved on iPad';
      } catch (error) {
        notice('Could not save this scene; check available storage.');
      }
    }, 350);
    sceneSaveTimers.set(key, timer);
  }
  async function saveAsset(key,file){
    if(!file)return;
    const allowed=/^(image|video|audio)\//.test(file.type)||/\.(heic|heif|png|jpe?g|mp4|mov|webm|mp3|wav|m4a|aac)$/i.test(file.name);
    if(!allowed){notice('Select a supported image, audio or video file.');return;}
    try{
      await transact('put',{id:'media:'+key,type:'media',blob:file,name:file.name});
      if(state.urls[key]){URL.revokeObjectURL(state.urls[key]);delete state.urls[key];}
      state.assets[key]={blob:file,name:file.name};
    }catch(error){notice('Could not store '+file.name+'. Safari storage might be full.');}
  }
  async function deleteAsset(key){
    const data=getAsset(key);if(!data||!window.confirm('Remove '+data.name+' from the local scene?'))return;
    try{await transact('delete','media:'+key);delete state.assets[key];if(state.urls[key]){URL.revokeObjectURL(state.urls[key]);delete state.urls[key];}render();}
    catch(error){notice('Unable to remove the file.');}
  }
  function photoNumber(filename){
    const matches=filename.match(/(?:^|[-_])F0?([1-9]|10)(?:[-_.]|$)/i);
    if(matches)return Number(matches[1]);
    const alternative=filename.match(/(?:^|[-_])S0?([1-9]|10)(?:[-_.]|$)/i);
    return alternative?Number(alternative[1]):null;
  }
  async function batchImport(files){
    const photos=Array.from(files).filter(f=>f.type.startsWith('image/')||/\.(heic|heif|png|jpe?g)$/i.test(f.name));
    if(!photos.length){notice('Choose 1–10 original photos for this episode.');return;}
    const numbered=new Map();
    const rest=[];
    for(const file of photos){
      const n=photoNumber(file.name);
      if(n&&n<=10&&!numbered.has(n)&&!/extra|preview|[_-]h\d/i.test(file.name)) numbered.set(n,file);
      else rest.push(file);
    }
    const used=new Set(numbered.values());
    const ordered=photos.filter(f=>!used.has(f) && !/extra|preview|[_-]h\d/i.test(f.name)).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
    for(let i=1;i<=10&&ordered.length;i++)if(!numbered.has(i))numbered.set(i,ordered.shift());
    let saved=0;
    for(const [slot,file] of numbered){await saveAsset(mediaKey(state.episode,slot,'photo'),file);saved++;}
    state.scene=1;render();notice(saved+' original photo(s) placed automatically in scene order. Extras were not mixed into the 10 main scenes.');
  }
  function showProduction(show){
    document.body.classList.toggle('ob-production-active',show);
    if(show){render();window.scrollTo(0,0);}
  }
  function sideBar(){
return `<aside class="ob-side">
 <div class="ob-logo"><div class="ob-mark">OB<span>▶</span></div><div><b>OFF BRIEF<span class="ob-yellow">.</span></b><small>VIDEO PRODUCTION</small></div></div>
 <div class="ob-menu-label">WORKSPACE</div>
 <nav class="ob-main-menu">
  <button data-view="episodes" class="${state.view==='episodes'?'current':''}">▦ <span>Episodes & scenes</span></button>
  <button data-view="video" class="${state.view==='video'?'current':''}">✳ <span>AI video generators</span></button>
  <button data-view="voice" class="${state.view==='voice'?'current':''}">♫ <span>AI voices</span></button>
  <button data-view="library" class="${state.view==='library'?'current':''}">▤ <span>Photo library</span></button>
  <button data-view="drive" class="${state.view==='drive'?'current':''}">◈ <span>Connect Google Drive</span></button>
 </nav>
 ${[1,2].map(season=>`<section class="ob-season-group">
  <div class="ob-menu-label">SEASON ${String(season).padStart(2,'0')} <span>${season===1?'IN PRODUCTION':'PHOTOS PENDING'}</span></div>
  <div class="ob-episode-buttons">${episodes.filter(e=>e.season===season).map(e=>`<button data-episode="${e.id}" class="${state.view==='episodes'&&state.episode===e.id?'current':''}">
   <span class="ob-ep-index">${String(e.number).padStart(2,'0')}</span><span class="ob-ep-name"><b>${safe(e.title)}</b><small>${photoCount(e.id)}/${e.season===2?8:10} photos · ${mediaCount(e.id)}/${e.season===2?8:10} AI clips</small></span></button>`).join('')}
  </div></section>`).join('')}
 <div class="ob-side-bottom"><b>Private on this iPad</b><p>Original images stay in Google Drive until you authorize a read-only sync.</p></div></aside>`;
}
  function heading(){
    const label={episodes:'EPISODE PRODUCTION',video:'REAL AI MOTION',voice:'CHARACTER VOICES',library:'ORIGINAL PHOTO LIBRARY',drive:'PRIVATE DRIVE'}[state.view];
    const title=state.view==='episodes'?currentEpisode().title:state.view==='video'?'AI video engines':state.view==='voice'?'Voice direction':state.view==='drive'?'Drive connection':'Production library';
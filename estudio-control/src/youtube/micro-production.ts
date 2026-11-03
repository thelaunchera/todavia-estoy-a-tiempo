import {microS1} from './micro-season-1';
import {microS2} from './micro-season-2';
import {youtubePhotoBoard,getYouTubePhotoPrompt,type YouTubePhoto} from './visual-plan';
import {getSeasonTwoShots} from './season-2-shots';
import {promptForSeasonTwoStill,type SeasonTwoShot} from './season-2-shot-model';

export type MicroEpisode={
 season:number;episode:number;title:string;hook:string;lesson:string;question:string;
 beats:readonly {label:string;start:number;end:number;script:string}[];
};
export type MicroFrame={id:string;scene:number;title:string;imagePrompt:string;motionPrompt:string};
export const microEpisodes:MicroEpisode[]=[...microS1,...microS2];
export const microLimits={
 runtimeSeconds:120,
 minTargetSeconds:90,
 baseStillsPerEpisode:3,
 outputYouTube:{label:'YouTube 16:9',width:1920,height:1080,fps:24,ratio:'16:9',frameFit:'full-width, no cropped characters'},
 outputTikTok:{label:'TikTok / YouTube Shorts 9:16',width:1080,height:1920,fps:24,ratio:'9:16',frameFit:'safe-fit blurred background by default; optional manual crop'},
 cropRule:'Use the SAME source PNG for both aspect ratios. Never regenerate the photo just to change format.',
 preservation:'Full long-form scripts and 192-shot planning archives are retained; these are condensed production cuts.'
} as const;
export function getMicroEpisode(season:number,episode:number):MicroEpisode|undefined{
 return microEpisodes.find(x=>x.season===season&&x.episode===episode);
}
function chooseDistinct<T extends {scene:number}>(source:readonly T[],target:number):T[]{
 if(!source.length)return [];
 const picks=[source[0]];
 const candidates=[source.find(x=>x.scene>=3&&x.scene<=5),source.find(x=>x.scene>=6),source[Math.floor(source.length/2)],source[source.length-1]];
 for(const item of candidates){
  if(item&&!picks.includes(item)&&!picks.some(x=>x.scene===item.scene))picks.push(item);
  if(picks.length===target)break;
 }
 for(const item of source){
  if(picks.length>=target)break;
  if(!picks.includes(item))picks.push(item);
 }
 return picks.slice(0,target);
}
const photoMotionPrompt=(id:string,shot:string,action:string)=>
 'OFF BRIEF / 2-MINUTE SHORT CUT · PHOTO-TO-VIDEO. Animate the APPROVED uploaded still '+id+
 ' (not a newly generated picture) for 4–8 seconds. Keep Nia and Ruby identical to their reference avatars, preserve hairstyle, wardrobe, hands, props and room geometry. '+
 'Original camera setup: '+shot+'. Action: '+action+'. Move: slow 3–6% push-in, small eye and head movements only; another take may use a gentle pan or reaction zoom. '+
 'No new characters, no text, no invented speech, no identity changes. 16:9 1920×1080 first. Edit a separate 9:16 version with a safe-fit or approved custom crop FROM THE SAME IMAGE, not new AI image generation. '+
 'Keep voices as original separately recorded English dialogue. Use free FFmpeg/editor keyframes if no video AI is installed.';
export function microFrames(season:number,episode:number):MicroFrame[]{
 if(season===1){
  const raw=(youtubePhotoBoard[episode]||[]).filter(p=>/^E0[1-8]-F(?:0[1-9]|10)$/.test(p.id));
  return chooseDistinct(raw,3).map((p:YouTubePhoto)=>({
   id:p.id,scene:p.scene,title:p.title,
   imagePrompt:getYouTubePhotoPrompt(p)+'\n\nCOST SAVER: This is one of only THREE unique images required for the shortened episode. Frame the two main characters toward the central safe area so the same still can be reframed vertically.',
   motionPrompt:photoMotionPrompt(p.id,p.shot,p.action)
  }));
 }
 if(season===2){
  const raw=getSeasonTwoShots(episode);
  return chooseDistinct(raw.filter(s=>s.shot===1),3).map((s:SeasonTwoShot)=>({
   id:s.id,scene:s.scene,title:s.title,imagePrompt:promptForSeasonTwoStill(s)+'\n\nCOST SAVER: Only three unique stills per episode. Frame important subjects near center, leaving composition space for vertical adaptation.',
   motionPrompt:photoMotionPrompt(s.id,s.camera,s.action)
  }));
 }
 return [];
}
export function microScriptText(q:MicroEpisode):string{
 const heading='OFF BRIEF · SEASON '+q.season+' / EPISODE '+String(q.episode).padStart(2,'0')+' — '+q.title+'\nPRODUCTION CUT: approx. 2 minutes (120 second timeline; pace dialogue and reaction holds)\n';
 return heading+'\n'+q.beats.map(b=>'['+String(b.start).padStart(2,'0')+'–'+String(b.end).padStart(2,'0')+' seconds] '+b.label+'\n'+b.script).join('\n\n')+
 '\n\nTAKEAWAY: '+q.lesson+'\nVIEWER QUESTION: '+q.question;
}
export function microWindowsProject(season:number,episode:number){
 const q=getMicroEpisode(season,episode);
 if(!q)return null;
 const frames=microFrames(season,episode);
 const [p1,p2,p3]=frames;
 const images=[p1?.id,p2?.id,p3?.id].filter(Boolean);
 return {
  format:'off-brief-dual-video-v1',series:'OFF BRIEF',season,episode,title:q.title,
  targetSeconds:120,dialogueLanguage:'en-US',
  sourceImages:images.map(id=>({id,path:'media/stills/'+id+'.png',status:'create or import approved still; reuses cast references'})),
  timeline:q.beats.map((b,i)=>({label:b.label,start:b.start,end:b.end,script:b.script,
    sourceImage:'media/stills/'+(images[Math.min(i,2)]||'MISSING')+'.png',alternateCropAllowed:true,
    onScreenText:i===3?q.question:'',lesson:i===3?q.lesson:''})),
  outputPresets:[
   {id:'youtube',width:1920,height:1080,ratio:'16:9',fps:24,container:'mp4',videoCodec:'h264',audioCodec:'aac',name:'OFF_BRIEF_S'+season+'_E'+String(episode).padStart(2,'0')+'_YOUTUBE_16x9.mp4'},
   {id:'tiktok',width:1080,height:1920,ratio:'9:16',fps:24,container:'mp4',videoCodec:'h264',audioCodec:'aac',name:'OFF_BRIEF_S'+season+'_E'+String(episode).padStart(2,'0')+'_TIKTOK_9x16.mp4'}
  ],
  defaultVerticalFit:'fit-blur',
  costSaver:'Only 3 distinct keyframes for 4 beats. Reuse same shots with keyframe pans, different crops, illustrated reusable props and simple edit overlays. Do not generate separate TikTok photographs.',
  archiveNote:'Long original scripts untouched. Short cuts are separate and recommended for production.',
  integration:'Import into the OFF BRIEF 2 min / dual format Windows companion. Project manifest is not guaranteed native import to the old Video Studio ZIP.'
 };
}
export function microVoiceCues(q:MicroEpisode):string{
 const rows=['BEAT,START_SEC,END_SEC,SPEAKER,DIALOGUE'];
 for(const b of q.beats){
  const chunks=b.script.match(/(?:^|\s)([A-Z][A-Z0-9 ]{1,25}):\s*([\s\S]*?)(?=\s+[A-Z][A-Z0-9 ]{1,25}:|$)/g)||[];
  for(const c of chunks){
   const m=c.trim().match(/^([A-Z][A-Z0-9 ]{1,25}):\s*([\s\S]*)$/);
   if(m){const vals=[b.label,String(b.start),String(b.end),m[1],m[2]];rows.push(vals.map(x=>'"'+x.replace(/"/g,'""')+'"').join(','));}
  }
 }
 return rows.join('\r\n');
}
export function microRecordingChecklist(q:MicroEpisode):string{
 const cast=[...new Set(microVoiceCues(q).split('\r\n').slice(1).map(x=>x.split('","')[3]?.replace(/"/g,'')).filter(Boolean))];
 return ['OFF BRIEF / QUICK RECORDING GUIDE','SEASON '+q.season+' EPISODE '+q.episode+' — '+q.title,
 'TARGET: 90–120 seconds. Record voices first and use their actual length; do not force artificial silence to fill 120 seconds.',
 'CAST: '+cast.join(', '),
 '1. Read scripts/2-minute-cut.txt once, then rehearse the four beats.',
 '2. Record each character separately using the free Windows Sound Recorder, or your existing voice tool. Save a master audio track as WAV or MP3.',
 '3. Keep each character consistent; do not impersonate real people without consent.',
 '4. Leave a brief pause between jokes and for the final question.',
 '5. Check voice levels, pronunciation, background noise and total duration.',
 '6. Import the master audio into the free OFF BRIEF Windows editor. It uses the SAME three PNGs for both exports.',
 '7. Make a 12-second preview before full export, then watch BOTH versions before uploading.',
 '8. The editor does not create mouth movements or automatically generate speech. No videos are uploaded automatically.',
 'VOICE CUES (CSV): see scripts/voice-cues.csv'
 ].join('\r\n');
}

export function microWindowsFiles(season:number,episode:number):Record<string,string>{
 const q=getMicroEpisode(season,episode);if(!q)return {};
 const frames=microFrames(season,episode);
 const manifest=microWindowsProject(season,episode);
 const files:Record<string,string>={
  'project.json':JSON.stringify(manifest,null,2),
  'scripts/2-minute-cut.txt':microScriptText(q),
  'scripts/voice-cues.csv':microVoiceCues(q),
  'scripts/GRABACION-PASO-A-PASO.txt':microRecordingChecklist(q),
  'media/stills/PUT-YOUR-THREE-APPROVED-PNGS-HERE.txt':'Create or copy only the 3 image files required by project.json. Use the same originals for YouTube and TikTok.\r\n',
  'media/voice/IMPORT-VOICE-WAV-HERE.txt':'Export the full approved dialogue as one soundtrack WAV/MP3, then select it in the free Windows editor. Do not imitate real peoples voices without permission.\r\n',
  'README-WINDOWS.txt':[
   'OFF BRIEF — 2-MINUTE DUAL-FORMAT VIDEO STUDIO PACK',
   'ONE short script and THREE unique images per episode. Do NOT use the old 6–8 minute script for this production.',
   '1) Unzip this project in a permanent Windows folder.',
   '2) Generate ONLY three approved stills from the included photo prompts and save as the exact filenames listed in project.json.',
   '3) Record or generate the original character voices separately. Import WAV/MP3 (not included).',
   '4) Open the companion OFF_BRIEF_DOS_FORMATOS Windows editor, choose this project.json, choose voice track and export two MP4 versions.',
   '5) YouTube standard: 1920x1080 (16:9). TikTok / YouTube Shorts: 1080x1920 (9:16). Vertical fit-blur keeps both faces; reframe manually when desired.',
   '6) Both export versions use the exact same images and voice. No extra ChatGPT image credits for the second format.',
   '7) The companion uses free FFmpeg, not a paid generative video model. It animates stills with subtle motion. True character lip-sync requires additional tools.',
   '8) Upload is your own choice; the pack does NOT upload to YouTube or TikTok.'
  ].join('\r\n')
 };
 for(const p of frames){
  files['prompts/stills/'+p.id+'.txt']=p.imagePrompt;
  files['prompts/animation/'+p.id+'.txt']=p.motionPrompt;
 }
 return files;
}

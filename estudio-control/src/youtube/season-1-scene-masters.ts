/** OFF BRIEF S01: complete-scene and image-to-video master prompts.
 * Renders directly from the eight original screenplay files and approved Season 1 visual plan.
 * Scene count is 59 (8+7+7+7+7+7+8+8); 80 principal photo references.
 */
import {youtubeEpisodes} from './episodes';
import {youtubePhotoBoard,getYouTubePhotoPrompt,type YouTubePhoto} from './visual-plan';
import {offBriefBrand} from './off-brief-brand';

export type S1SceneBlock={episode:number;scene:number;title:string;script:string;photos:YouTubePhoto[];needsExtraStill:boolean};
export const s1DefaultFrameRate=24;
export const s1Output={width:1920,height:1080,fps:24,audioHz:48000} as const;

function epNumber(ep:number):string{return String(ep).padStart(2,'0');}
function sceneNumber(s:number):string{return String(s).padStart(2,'0');}
export function getSeasonOneScenes(episode:number):S1SceneBlock[]{
 const ep=youtubeEpisodes[episode-1];
 if(!ep)return [];
 const script=ep.script;
 const headers=[...script.matchAll(/^### SCENE\s+(\d+)\s+—\s*([^\r\n]+)\s*$/gm)];
 return headers.map((h,index)=>{
   const scene=Number(h[1]);
   const start=h.index??0;
   const end=index+1<headers.length?(headers[index+1].index??script.length):script.length;
   const photos=(youtubePhotoBoard[episode]||[]).filter(p=>p.scene===scene&&!p.id.includes('-H'));
   return {episode,scene,title:h[2].trim(),script:script.slice(start,end).trim(),photos,needsExtraStill:photos.length===0};
 });
}
export const s1SceneCount=youtubeEpisodes.reduce((sum,ep)=>sum+getSeasonOneScenes(ep.number).length,0);
export const s1BasePhotoCount=youtubeEpisodes.reduce((sum,ep)=>sum+(youtubePhotoBoard[ep.number]||[]).filter(p=>p.id.includes('-F')).length,0);
function namedActors(script:string):string[]{
 const voices=[...script.matchAll(/^([A-Z][A-Z0-9 .()'-]{0,40}):\s*/gm)].map(m=>m[1]);
 return [...new Set(voices)];
}
function shotMove(photo:YouTubePhoto):string{
 const name=(photo.shot+' '+photo.title).toLowerCase();
 if(/ground|low.angle|floor cam|point of view|pov/.test(name))
  return 'Locked ground-level POV with only a VERY slow 5 cm push toward subjects, 1–2 seconds of awkward stillness, then natural eye flicks and a tiny shared expression. The camera must stay on the floor.';
 if(/extreme close|macro|product|insert|detail/.test(name))
  return 'Precise macro-level lens move or short rack focus; one deliberate prop movement only, never melting or changing shape. Hold the detail long enough for the gag.';
 if(/reaction|close.up|portrait|two.shot/.test(name))
  return 'Subtle steady 4–8 cm push toward a real micro-reaction; one blink, shoulder shift or small glance timed to the recorded line. Preserve the original eye line.';
 if(/wide|establish|room|exterior|overhead/.test(name))
  return 'Gentle lateral dolly or extremely slow push to establish the practical space. Keep architecture, people, furniture and lighting fixed. No dolly-zoom or camera spin.';
 return 'Controlled small camera drift, accurate arm and finger motion only where the still describes it, one character reaction beat, then a clean hold for dialogue editing.';
}
const originalCastLock=[
 'CHARACTER REFERENCE LOCK — THE SAME TWO WOMEN FROM ORIGINAL SEASON 1 AVATAR IMAGES:',
 'NIA: the same medium-brown-skinned adult woman with deep dark hair in a long side braid, small gold hoops, confident expressive face, blue/cobalt blazer or season-specific wardrobe matching official visual plan.',
 'RUBY: the same fair warm-skinned adult woman with large copper-red curly updo, round glasses, lively facial expressions and original green/sage overshirt or episode-specific wardrobe matching official visual plan.',
 'Supporting people appear ONLY when mentioned by the approved script or actual still; preserve their established identity if reused. Do not make all women look alike, change facial identities, hairstyles, skin colors or proportions. No famous-brand animation imitation.',
 'STYLE: original premium 3D animated workplace comedy with believable adult bodies, subtle facial animation, sophisticated cinematic material and studio lighting. Keep fictional brand props fictional.'
].join('\n');
export function getSeasonOneImageToVideoPrompt(episode:number,photo:YouTubePhoto):string {
 const scene=getSeasonOneScenes(episode).find(s=>s.scene===photo.scene);
 const script=scene?.script||'';
 const dialogue=script.split('\n').filter(line=>/^[A-Z][A-Z0-9 .()'-]{0,40}:\s/.test(line)).slice(0,10).join('\n');
 return [
 'OFF BRIEF · SEASON 1 · IMAGE TO VIDEO MASTER — '+photo.id,
 'Use the ACTUAL APPROVED STILL IMAGE saved for this exact shot as the initial frame, NOT a replacement image. If the still has not been produced, generate and APPROVE it first using the corresponding image prompt.',
 originalCastLock,
 'EPISODE: '+episode+'. SCENE: '+photo.scene+' — '+(scene?.title||photo.title)+'.',
 'ONE-SHOT ACTION: '+photo.action,
 'ORIGINAL CAMERA COMPOSITION: '+photo.shot+'.',
 'ANIMATE: '+shotMove(photo),
 'Duration 4–8 seconds per generated take, 24fps, landscape 16:9, keep source aspect and clean lighting. Generate multiple short takes when the full scene needs more dialogue or reaction coverage; never squeeze an entire conversation into one clip.',
 'VOICE AND DIALOGUE PERFORMANCE CUES (do not render text or invent speech):\n'+(dialogue||'Use gestures and room tone; voice will be added in editing.'),
 'IMPORTANT: do not ask the visual model for dialogue, voice cloning, subtitles or music. Record the original approved fictional-character dialogue separately and synchronize with the assembled scene in the editor.',
 'CONTINUITY: no morphing faces, no wardrobe swaps, no new props, no extra people, no distorted fingers, no rubber-limbs animation, no sudden camera movement, no unscripted gag, no fake logos, no AI-written text in screen imagery.',
 'OUTPUT: '+photo.id+'_take01.mp4 (and more takes if needed), 1920×1080 / 24fps H.264. Original still: '+photo.id+'.png.'
 ].join('\n\n');
}
export function getSeasonOneMissingSceneStillPrompt(episode:number,scene:number):string {
 const block=getSeasonOneScenes(episode).find(s=>s.scene===scene);
 if(!block||!block.needsExtraStill)return '';
 const shot=block.script.match(/^\*\*SHOT:\*\*\s*(.*)$/m)?.[1]||'An expressive cinematic master shot in the specified scene location.';
 return [
 'OPTIONAL EXTRA KEYFRAME NEEDED · S01 EP'+epNumber(episode)+' SCENE'+sceneNumber(scene),
 'This scene has no dedicated base photo in the 80-photo visual gallery. Do not silently reuse a photo from an unrelated scene. Create one additional approved still for editing; name S1-E'+epNumber(episode)+'-S'+sceneNumber(scene)+'-EXTRA01.png.',
 originalCastLock,
 'SCENE CAMERA DIRECTION: '+shot,
 'ACTION AND DIALOGUE TO REFERENCE:\n'+block.script,
 'Create one SINGLE 16:9 cinematic composition in the established studio or script location. Keep all faces and wardrobe consistent with other stills from this episode. No caption, no watermark, no collage, no unauthorized extra characters.'
 ].join('\n\n');
}
export function getSeasonOneSceneMaster(episode:number,scene:number):string {
 const b=getSeasonOneScenes(episode).find(s=>s.scene===scene);
 if(!b)return '';
 const ep=youtubeEpisodes[episode-1];
 const refs=b.photos.map((photo,index)=>[
   'CAMERA ANCHOR '+(index+1)+' / '+photo.id+' · '+photo.title,
   'APPROVED FRAME: '+photo.id+'.png. Film lens: '+photo.shot+'.',
   'SHOT ACTION: '+photo.action,
   'IMAGE-TO-VIDEO MOTION: '+shotMove(photo),
   'Generate 4–8s takes as needed (some lines require alternate closeups or longer silent holds). Use '+photo.id+'_take01.mp4, _take02.mp4 etc.'
 ].join('\n')).join('\n\n');
 const fallback=b.needsExtraStill?getSeasonOneMissingSceneStillPrompt(episode,scene):'Use the designated photo anchors listed below; generate additional reverse or insert views only if the dialogue or action requires them.';
 return [
 'MASTER PROMPT — FULL ANIMATED SCENE · OFF BRIEF / SEASON 1',
 'EPISODE '+epNumber(episode)+' — '+ep.title+' / SCENE '+sceneNumber(scene)+' — '+b.title,
 'GOAL: Assemble a COMPLETE movie-like animated scene from approved keyframe stills, short 4–8-second image-to-video takes, separately recorded dialogue, sound effects and precise editing. The full script is authoritative; a keyframe count does not limit dialogue coverage.',
 originalCastLock,
 'ORIGINAL CANON SCRIPT — FOLLOW ALL DIALOGUE AND ACTIONS, WITHOUT REWRITING OR OMITTING THEM:\n'+b.script,
 'PLANNED IMAGE FRAMES: '+(b.photos.length?b.photos.map(p=>p.id).join(', '):'No principal photo assigned yet; supplemental still required.'),
 refs||fallback,
 b.needsExtraStill?'REQUIRED PHOTO FOR THIS SCENE:\n'+fallback:'',
 'PERFORMANCE: preserve speaker identity and natural dialogue order. Infer timing from the exact English script and separately recorded voices. Use small eye flicks, pauses, believable face and body acting; do not generate lip-synced gibberish or accidentally duplicate a speaking character. The final scene can be longer than a short animation generation.',
 'PRODUCTION STEPS: (1) Confirm the correct character/avatar and scene wardrobe. (2) Approve each original 16:9 still. (3) Make one short animation take per camera anchor; make more takes or closeups as needed. (4) Record every script line as original character voice (consented and not cloned from a person without permission), in WAV 48kHz. (5) Assemble takes and layer voice, ambience, footsteps, and licensed/original music in the FREE WINDOWS VIDEO STUDIO or any capable free desktop editor. (6) Add a room-tone tail and export the scene.',
 'EDITING RULE: make real shot cuts, not a slideshow of mouthless portraits; do not claim one text prompt can automatically render the whole episode. Use the approved logo bumper AFTER the Scene 1 cold open only. Do not insert a bumper between ordinary scenes.',
 'CHECK BEFORE EXPORT: every written line included; reactions paced; each character stays visually consistent; correct wardrobe; screen direction and props do not teleport; no flicker/morphing; smooth 24fps output and intelligible synchronized voice; correct end tag if final scene.',
 'DELIVERABLE: S01-E'+epNumber(episode)+'-S'+sceneNumber(scene)+'.mp4, 1920×1080, 24fps H.264; optional separate voice stem WAV and project notes. No YouTube publication is triggered.'
 ].filter(Boolean).join('\n\n');
}
export function getSeasonOneEpisodeMaster(episode:number):string {
 const ep=youtubeEpisodes[episode-1];
 if(!ep)return '';
 return [
 'OFF BRIEF · SEASON ONE EPISODE '+epNumber(episode)+' — '+ep.title,
 'This is the master assembly book. Render every scene separately, then join them in story order: scene 1 cold open → official OFF BRIEF logo bumper → remaining scenes → credits/tag.',
 ...getSeasonOneScenes(episode).map(s=>getSeasonOneSceneMaster(episode,s.scene)),
 'FINAL EXPORT: 1920×1080, 24fps H.264 MP4, 48kHz dialogue mix. Verify all original English dialogue, correct cast faces, licensed original assets, 16:9 master and unique episode cover.'
 ].join('\n\n========== SCENE BOUNDARY ==========\n\n');
}
export function getSeasonOneWindowsFiles(episode:number):Record<string,string>{
 const ep=youtubeEpisodes[episode-1]; if(!ep)return {};
 const scenes=getSeasonOneScenes(episode);
 const files:Record<string,string>={};
 const manifest={
   format:'off-brief-video-studio-production-manifest-v1',
   project:'OFF BRIEF',season:1,episode,title:ep.title,output:s1Output,
   warning:'Source media, voice recordings and AI-generated video clips are NOT included. The JSON is a human-readable editing manifest, not guaranteed automatic import into Video Studio.',
   assets:{logoBumper:'media/branding/off-brief-bumper.mp4',stills:'media/stills/',clips:'media/clips/',dialogue:'media/voices/',music:'media/music/',foley:'media/sfx/'},
   editSequence:[{step:'cold open',scene:1},{step:'approved 2-sec OFF BRIEF bumper'},...scenes.filter(s=>s.scene>1).map(s=>({step:'scene',scene:s.scene})),{step:'approved credits'}],
   scenes:scenes.map(s=>({number:s.scene,title:s.title,script:'scripts/scene-'+sceneNumber(s.scene)+'.txt',master:'masters/scene-'+sceneNumber(s.scene)+'.txt',needsSupplementalStill:s.needsExtraStill,
     photos:s.photos.map(p=>({id:p.id,still:'media/stills/'+p.id+'.png',clip:'media/clips/'+p.id+'_take01.mp4',stillPrompt:'prompts/photos/'+p.id+'.txt',animationPrompt:'prompts/animation/'+p.id+'.txt',status:'pending media'}))
   }))
 };
 files['project.json']=JSON.stringify(manifest,null,2);
 files['README-WINDOWS.txt']=[
  'OFF BRIEF · SEASON 1 · EPISODE '+epNumber(episode)+' WINDOWS EDITING PACK',
  'Inside: canonical original English script; '+scenes.length+' scene masters; '+(youtubePhotoBoard[episode]?.length||0)+' still and animation prompts; project manifest.',
  'The app DOES NOT automatically create the videos from the prompts. Generate each approved still, create or keyframe short motion takes, record voices and assemble media in the free Windows editor.',
  '1. Extract this ZIP to one permanent folder in Windows.',
  '2. Open masters/scene-01.txt and the corresponding official still prompts. Generate stills in media/stills/ with the same IDs shown in project.json.',
  '3. Animate with a locally available model if installed, or use pan / zoom / parallax keyframing in a free video editor. Save sequential takes in media/clips/.',
  '4. Record or synthesize original character dialogue with permission, 48kHz WAV, keep one voice per fictional character. The full original screenplay is in scripts/episode.txt.',
  '5. Import clips into your Windows Video Studio in scene order, add voices and original sound. Insert official logo bumper only after the first cold open.',
  '6. For any scene whose manifest says needsSupplementalStill=true, first prepare the separately documented still; never silently reuse an unrelated scene.',
  '7. Export 1920x1080 / 24fps H.264 MP4, verify sound and continuity, then separately choose whether to upload it to YouTube.',
  'No paid AI service or auto-publication implied. project.json is an editing guide, not a native app-import guarantee.'
 ].join('\r\n');
 files['scripts/episode.txt']=ep.script;
 files['media/stills/PLACE-APPROVED-STILLS-HERE.txt']='Use 16:9 PNGs named exactly like the photo IDs in project.json.\r\n';
 files['media/clips/PLACE-ANIMATED-CLIPS-HERE.txt']='Put short MP4 motion clips here, named by still shot ID.\r\n';
 files['media/voices/PLACE-WAV-VOICES-HERE.txt']='Use original English dialogue WAV at 48kHz.\r\n';
 files['media/branding/PLACE-APPROVED-LOGO-HERE.txt']='Place approved 2s OFF BRIEF bumper here.\r\n';
 files['media/music/LICENSED-OR-ORIGINAL-ONLY.txt']='Never copy protected music without rights.\r\n';
 files['media/sfx/ORIGINAL-SFX-HERE.txt']='Original foley and room tone only.\r\n';
 for(const scene of scenes){
  files['scripts/scene-'+sceneNumber(scene.scene)+'.txt']=scene.script;
  files['masters/scene-'+sceneNumber(scene.scene)+'.txt']=getSeasonOneSceneMaster(episode,scene.scene);
  if(scene.needsExtraStill)files['prompts/missing-keyframes/scene-'+sceneNumber(scene.scene)+'-supplemental-still.txt']=getSeasonOneMissingSceneStillPrompt(episode,scene.scene);
  for(const photo of scene.photos){
   files['prompts/photos/'+photo.id+'.txt']=getYouTubePhotoPrompt(photo);
   files['prompts/animation/'+photo.id+'.txt']=getSeasonOneImageToVideoPrompt(episode,photo);
  }
 }
 return files;
}

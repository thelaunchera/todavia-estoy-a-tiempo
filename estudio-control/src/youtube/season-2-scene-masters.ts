import {seasonTwoScriptForEpisode} from './season-2-scripts';
import {getSeasonTwoShots} from './season-2-shots';
import {promptForSeasonTwoMotion,promptForSeasonTwoStill} from './season-2-shot-model';
import {offBriefBrand} from './off-brief-brand';

export function getSeasonTwoSceneScript(episode:number,scene:number):string{
 const full=seasonTwoScriptForEpisode(episode);
 if(!full||scene<1||scene>8)return '';
 const markers=[...full.matchAll(/^### SCENE\s+(\d+)\s+—[^\n]*$/gm)];
 const index=markers.findIndex(m=>Number(m[1])===scene);
 if(index<0)return '';
 const start=markers[index].index??0;
 const end=index+1<markers.length?markers[index+1].index??full.length:full.length;
 return full.slice(start,end).trim();
}
export function masterPromptForSeasonTwoScene(episode:number,scene:number):string{
 const shots=getSeasonTwoShots(episode).filter(s=>s.scene===scene);
 if(!shots.length)return '';
 const screenplay=getSeasonTwoSceneScript(episode,scene);
 const cast=[...new Set(shots.flatMap(shot=>shot.cast))].join(', ');
 const cameraPlan=shots.map(s=>
  'CAMERA SETUP '+s.shot+' ['+s.id+']\n' +
  'CAST: '+(s.cast.join(', ')||'Product, environment or graphics only')+'\n' +
  'FRAMING: '+s.camera+'\n' +
  'BLOCKING: '+s.action+'\n' +
  'PERFORMANCE / VOICE CUE: '+s.dialogueCue+'\n' +
  'CAMERA MOVEMENT: '+s.motion
 ).join('\n\n');
 return [
 'OFF BRIEF · COMPLETE SCENE MASTER PROMPT',
 'Season '+episode+', Scene '+scene+', visual production and EDITING BRIEF. This is an original animated workplace comedy. Produce a COMPLETE playable SCENE, not one image and not three disconnected illustrations.',
 'CREATIVE AND CHARACTER LOCK: '+offBriefBrand.tone+' Keep the exact faces and silhouettes of the official user-supplied reference avatars. Do not swap Nia and Ruby. Distinctive cinematic 3D adult character acting, realistic believable physics, warm editorial lighting, stable wardrobe across every shot within this episode, 16:9, final 1920×1080 or higher. Use original approved logo, not AI-recreated typography.',
 'SCENE INTENT / LOCATION: '+shots[0].title+' — '+shots[0].location+' ('+shots[0].time+'). Featured cast: '+(cast||'prop inserts, voice offscreen')+'.',
 'FULL APPROVED ENGLISH DIALOGUE + ACTION SCRIPT: EXACTLY FOLLOW THIS SCRIPT. NO NEW SPEECH, NO CHANGING CHARACTER NAMES. VOICE RECORDINGS ARE GENERATED/RECORDED SEPARATELY IN ENGLISH, THEN EDITED AND LIP-SYNCED WITH PERMISSION.',
 screenplay,
 'THREE CAMERA ANCHORS. These are master blocking setups, NOT a limit of three total clips. Split each into as many 3–8-second animation takes, reverses, inserts and reaction shots as needed so EVERY scripted line and action fits naturally. Return to a fixed approved still per setup for continuity.',
 cameraPlan,
 'RECOMMENDED LOCAL PRODUCTION WORKFLOW FOR VIDEO STUDIO ON WINDOWS:',
 '1. Create one approved 16:9 still image for every camera setup using its unique photo prompt and official cast references. Save as media/stills/<shot_id>.png.',
 '2. Animate that still into short 3–8-second clips using an actually installed local video-generation model, or use keyframe zoom/pan on the still inside the free editor. Save sequential variants as media/clips/<shot_id>_take01.mp4, _take02.mp4, etc. Keep model/seed/wardrobe consistent across takes.',
 '3. Create/record one consented, original fictional character voice per dialogue line, preserve voice identity, save WAV at 48 kHz as media/voices/<scene_id>_line001.wav, and maintain 200–500ms of expressive silence where indicated. Do not imitate an identifiable real person without their permission.',
 '4. Cut reaction holds, inserts and closeups to cover the full dialogue. Add room tone, separately generated footsteps / prop foley and only original or licensed music. Do not ask a video model to invent music or speech.',
 '5. The correct runtime is the time actually required to perform the whole screenplay with natural pacing. Do not force all words into a 20-second sequence. Preserve every scripted beat.',
 '6. Assemble picture and speech in chronological scene order with a 1920×1080 24fps timeline; export H.264 MP4 with AAC stereo audio. After the cold open of Scene 1, insert the approved 1–3-second OFF BRIEF logo bumper. Keep safe margins for channel overlays and do not add AI-garbled subtitles.',
 'DELIVERY CHECKLIST: all lines audible and synchronized; character and wardrobe continuity; correct shot order; no unwanted extra people; no morphing hands; stable mouths; readable product props; no illegible text; no orphan background music; approved logo bumper only; export scene and a separate voice/dialogue stem.',
 'NOTE: A prompt cannot autonomously produce a full video in the previously built Windows Video Studio. It defines the media to create/import and the exact assembly plan; if no local video model is installed, animate the stills with editor motion as a free fallback.'
 ].join('\n\n');
}
export function masterPromptForSeasonTwoEpisode(episode:number):string{
 const text=Array.from({length:8},(_,i)=>masterPromptForSeasonTwoScene(episode,i+1));
 return [
 'OFF BRIEF SEASON '+episode+' — COMPLETE EPISODE PRODUCTION MASTER',
 'Use eight separately rendered and checked scenes. Preserve exact script order, continuity and individual render files. Do not ask a video model to render the full long episode in one generation; animate short clips and edit them.',
 ...text,
 'FINAL EPISODE BUILD: cold open from scene 1 → approved series bumper → scene 2–8 → approved end credits and licensed original audio. Render one 1920×1080 H.264 MP4 at 24 fps. Double-check original character names, voice levels, and episode thumbnail before upload.'
 ].join('\n\n================ SCENE BOUNDARY ================\n\n');
}
export function seasonTwoWindowsProject(episode:number){
 const shots=getSeasonTwoShots(episode);
 return {
 schema:'off-brief-video-studio-project-v1',
 app:'Video Studio Windows (media-first project pack)',
 series:'OFF BRIEF',season:2,episode,
 frameRate:24,width:1920,height:1080,audioHz:48000,
 note:'Generated files are inputs to the free Windows video editor; AI video creation or voice cloning requires separately installed tools. No media is generated in this JSON.',
 editOrder:['scene1 cold open','OFF BRIEF logo bumper','scene2','scene3','scene4','scene5','scene6','scene7','scene8','end credits'],
 mediaFolders:{stills:'media/stills',clips:'media/clips',voices:'media/voices',music:'media/music',sfx:'media/sfx'},
 scenes:Array.from({length:8},(_,i)=>({
  scene:i+1,title:shots.find(s=>s.scene===i+1)?.title,
  scriptFile:'scripts/episode-'+String(episode).padStart(2,'0')+'.txt',
  masterFile:'masters/scene-'+String(i+1).padStart(2,'0')+'.txt',
  shots:shots.filter(s=>s.scene===i+1).map(s=>({
   id:s.id,cast:s.cast,camera:s.camera,action:s.action,dialogueReference:s.dialogueCue,
   imagePromptFile:'prompts/images/'+s.id+'.txt',motionPromptFile:'prompts/video/'+s.id+'.txt',
   stillFile:'media/stills/'+s.id+'.png',videoFile:'media/clips/'+s.id+'_take01.mp4',
   status:'pending media'
  }))
 }))
 };
}
export function seasonTwoProjectTextFiles(episode:number):Record<string,string>{
 const shots=getSeasonTwoShots(episode);
 const files:Record<string,string>={};
 files['project.json']=JSON.stringify(seasonTwoWindowsProject(episode),null,2);
 files['scripts/episode-'+String(episode).padStart(2,'0')+'.txt']=seasonTwoScriptForEpisode(episode);
 files['README-WINDOWS.txt']=[
 'OFF BRIEF — EPISODE '+episode+' — WINDOWS FREE VIDEO STUDIO PRODUCTION PACK',
 'This ZIP contains the full script, 8 complete-scene Master Prompts, 24 image prompts, 24 short-video animation prompts, and a JSON project manifest.',
 'STEPS:',
 '1. Extract ZIP to a permanent folder on your Windows PC; do not open media from inside the ZIP.',
 '2. Use the exact cast reference photos and prompts to generate scene stills and place them in media/stills as shown in project.json.',
 '3. Animate individual stills using an installed local model or your editor keyframe zoom/pan; save the result as media/clips/<SHOT_ID>_take01.mp4.',
 '4. Record or synthesize the original fictional dialogue with permission, as separate voice files in media/voices.',
 '5. Open the free Video Studio app previously built for Windows and import media in scene and shot order. The project.json is a portable plan, not a guaranteed automatic import format for earlier versions of that app.',
 '6. Use FFmpeg (free) / the local editor to assemble 1920x1080, 24fps H.264 MP4 with AAC audio. Add brand logo bumper after cold open, then eight scenes.',
 '7. Reuse the same character reference faces, locations, light and clothes. Verify sync and copyright before public release.',
 'No AI service purchases required for this planning pack. Automatic generative video or advanced voice cloning is NOT included unless local models are installed and working.'
 ].join('\r\n');
 files['media/stills/PLACE-STILLS-HERE.txt']='Copy approved generated PNG stills here using the shot IDs in project.json.\r\n';
 files['media/clips/PLACE-ANIMATED-CLIPS-HERE.txt']='Copy animated MP4 clips here using names <shot_id>_take01.mp4. Each dialogue shot may need multiple takes.\r\n';
 files['media/voices/PLACE-VOICE-WAV-HERE.txt']='Put consented English dialogue WAV recordings here. Match to the full script and project timeline.\r\n';
 files['media/sfx/PLACE-SFX-HERE.txt']='Put your original room tone, footsteps, prop sounds and OFF BRIEF sound sting here.\r\n';
 files['media/music/PLACE-MUSIC-HERE.txt']='Use only original or licensed music, not copyrighted song playback.\r\n';
 for(let scene=1;scene<=8;scene++){
  files['masters/scene-'+String(scene).padStart(2,'0')+'.txt']=masterPromptForSeasonTwoScene(episode,scene);
 }
 for(const shot of shots){
  files['prompts/images/'+shot.id+'.txt']=promptForSeasonTwoStill(shot);
  files['prompts/video/'+shot.id+'.txt']=promptForSeasonTwoMotion(shot);
 }
 return files;
}

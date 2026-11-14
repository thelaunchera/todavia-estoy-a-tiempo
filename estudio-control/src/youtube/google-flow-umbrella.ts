/**
 * The Little Detours — Pilot 01 / Google Flow continuity master.
 * Seven connected ~6-second motion segments, not seven independent visual shots.
 * Use Omni Flash 1.2 Extend for segments 2–7 where available.
 * The scene instructions are prompts only; no media is generated or uploaded by this file.
 */
export const flowMaster = {
  title: 'The Umbrella Thief',
  series: 'The Little Detours',
  format: '16:9 landscape · cinematic stylized 3D · 24 fps look · ~42 seconds',
  model: 'Google Flow · Omni Flash 1.2 (Extend on eligible Google AI Plus / Pro / Ultra plans)',
  references: [
    'Nora: short chestnut-brown hair, large expressive eyes, light blue sweater.',
    'Eli: wavy dark hair, green shirt.',
    'Pip: small cream-colored puppy with exactly ONE dark ear and a red neckerchief.',
    'One YELLOW folded umbrella (opened only after Nora retrieves it).',
    'One brown paper bag with exactly FOUR oranges.',
    'One old brass key hidden beneath Pip’s red neckerchief until the very end.'
  ],
  setting: 'ONE location throughout: a charming pastel-colored small-town shopping street, wet cobblestone sidewalk, soft overcast daylight, gentle continuous rain, reflective puddles, storefront windows, a low stone doorstep. Same weather, same light and same street from first to last frame.',
  visual: 'Premium expressive stylized 3D animated short film, tactile fabric, believable wet ground, graceful body acting, physical object permanence, small sincere expressions. A gently moving eye-level tracking camera advances to the RIGHT along the sidewalk, with only subtle continuous dolly or tilt when physically motivated. Natural real-time action.',
  prohibitions: 'NO hard cuts, jump cuts, shot changes, angle resets, instant location changes, cinematic montage, time jumps, wipes, dissolves, flashes, scene changes, character replacements, morphing, facial or wardrobe drift, disappearing objects, extra limbs, extra characters, implausible object teleportation, text, captions, subtitles, logos, watermarks, narration, speaking, lip-sync, singing or character voices.',
  sound: 'Only natural rain, footsteps, small paws, fabric rustle, splashes, oranges gently rolling, and subtle original instrumental music. No dialogue.',
} as const;

export type FlowClip = {
  number: number;
  title: string;
  time: string;
  mode: 'First clip · Frames to Video' | 'Continue · Extend previous clip';
  opening: string;
  action: string;
  ending: string;
  handoff: string;
  prompt: string;
};

const raw: Omit<FlowClip,'prompt'>[] = [
  {
    number: 1, title: 'Pip steals the umbrella', time: '00:00–00:06',
    mode: 'First clip · Frames to Video',
    opening: 'Nora stands on the LEFT side of a wet small-town sidewalk holding a FOLDED yellow umbrella down by her hand. Pip, a tiny cream puppy with one dark ear and red neckerchief, trots beside her; Eli is not visible yet.',
    action: 'In one smooth real-time movement, Pip spots the folded yellow umbrella, gently seizes its curved handle with his mouth and trots RIGHT with it. Nora turns, gasps without speaking, then follows him with an incredulous expression and careful quick steps. The umbrella stays folded and visibly held by Pip throughout.',
    ending: 'Pip is ahead on the RIGHT holding the folded yellow umbrella in his mouth; Nora is following three paces behind; both are heading RIGHT along the same rain-wet pavement.',
    handoff: 'The exact end frame is the start of scene 02: Nora chasing Pip along the same sidewalk with yellow folded umbrella firmly in Pip’s mouth.'
  },
  {
    number: 2, title: 'The gentle chase', time: '00:06–00:12',
    mode: 'Continue · Extend previous clip',
    opening: 'Immediately continue the previous end frame: Pip on the RIGHT carrying the same folded yellow umbrella; Nora three steps behind chasing him from the LEFT. Same camera tracking RIGHT, rain, wet stone pavement and storefronts.',
    action: 'Pip trots playfully along the wet pavement with Nora following, stepping carefully over a narrow puddle. The camera tracks right with them at the SAME height, angle and pace. Farther ahead in the same uninterrupted field of view, Eli naturally becomes visible holding a brown paper bag containing four oranges. Pip continues toward Eli.',
    ending: 'Pip is just approaching Eli’s shoes from the LEFT, still holding the folded yellow umbrella; Eli stands on the RIGHT holding the paper bag securely; Nora is visible behind Pip.',
    handoff: 'Continue on the very same frame as Pip approaches Eli’s feet. No new establishing shot.'
  },
  {
    number: 3, title: 'The four oranges', time: '00:12–00:18',
    mode: 'Continue · Extend previous clip',
    opening: 'Continue exactly as Pip nears Eli’s shoes. Eli is on the RIGHT holding the bag with four oranges; Nora follows just behind; Pip has the yellow umbrella in his mouth.',
    action: 'Pip darts carefully past Eli’s legs without touching him; Eli reflexively shifts the paper bag and it tilts open. Exactly four oranges spill slowly onto the wet sidewalk and roll in different short directions, all remaining visible and countable. Eli looks startled but stays standing. Pip drops the folded yellow umbrella onto the nearby low stone doorstep and pauses there. Nora arrives and slows immediately to help.',
    ending: 'Four oranges rest scattered on the pavement; Eli looks down; Nora begins to crouch; Pip stays by the low step beside the folded yellow umbrella, with red neckerchief in place.',
    handoff: 'Start scene 04 with Nora already beginning to crouch, Eli looking at the exact four oranges, and Pip beside the umbrella on the same doorstep.'
  },
  {
    number: 4, title: 'An unexpected meeting', time: '00:18–00:24',
    mode: 'Continue · Extend previous clip',
    opening: 'Continue from Nora starting to crouch beside Eli; exactly four oranges are on the same pavement; Pip waits by the folded umbrella on the low step.',
    action: 'Nora picks up two nearby oranges and gently places them into Eli’s open paper bag. Eli bends to gather the other two oranges. Their hands briefly meet over the last orange; they exchange a shy, surprised smile without speaking. The camera keeps one unbroken eye-level traveling motion, easing to match their natural pause. Pip watches from beside the untouched yellow folded umbrella.',
    ending: 'All four oranges are back in Eli’s paper bag. Nora and Eli begin to straighten up with gentle smiles. The yellow umbrella remains folded on the low doorstep next to Pip.',
    handoff: 'Start scene 05 as Nora straightens and turns her gaze toward Pip and the folded yellow umbrella.'
  },
  {
    number: 5, title: 'Under one umbrella', time: '00:24–00:30',
    mode: 'Continue · Extend previous clip',
    opening: 'Begin from the exact previous image: Nora and Eli stand side by side, Eli holds his paper bag of four oranges, and Pip waits on the doorstep next to the folded yellow umbrella.',
    action: 'Nora gently retrieves the same folded yellow umbrella from the low step, opens it smoothly above herself and Eli, and gestures for Eli to step closer under it. Eli smiles and takes a small step beneath the umbrella without dropping his paper bag. Pip walks nearby toward a shallow puddle. The camera follows at a steady angle with no cut.',
    ending: 'Nora and Eli share the OPEN yellow umbrella, standing close and facing RIGHT. Eli still holds the paper bag containing four oranges. Pip is near a shallow puddle at their feet, red neckerchief unchanged.',
    handoff: 'Start scene 06 with Nora and Eli already under the open umbrella and Pip beside the same puddle.'
  },
  {
    number: 6, title: 'Pip splashes them', time: '00:30–00:36',
    mode: 'Continue · Extend previous clip',
    opening: 'Continue directly: Nora and Eli share the open yellow umbrella in the same place; Eli holds the bag; Pip stands beside their feet at a shallow puddle.',
    action: 'Pip makes one playful little leap into the puddle. A modest realistic splash of water lands on Nora’s and Eli’s shoes. Their faces shift from surprise to silent laughter with joyful body expressions, without moving the umbrella or losing the bag. Pip shakes his small cream body; his red neckerchief loosens just enough for the faint edge of a hidden brass key to become visible, but the key has not fallen yet. The tracking camera slowly lowers toward Pip while keeping the people partly visible.',
    ending: 'Pip stands on the pavement after the splash, slightly loosened red neckerchief with a tiny glimpse of brass beneath it. Nora and Eli, still sharing the open umbrella, notice something unusual near his neck.',
    handoff: 'Start scene 07 close to Pip in the same continuous lowered camera movement, with the key still only partly revealed under the red neckerchief.'
  },
  {
    number: 7, title: 'The mysterious key', time: '00:36–00:42',
    mode: 'Continue · Extend previous clip',
    opening: 'Continue from the exact frame showing Pip’s loosened red neckerchief and a little brass glint beneath it. Nora and Eli are still sharing the open yellow umbrella nearby.',
    action: 'Pip gives one small shake, and an old brass key slips naturally from beneath his red neckerchief onto the wet cobblestones with a soft metallic sound. Nora notices, crouches in one natural movement while keeping the umbrella nearby, and gently picks up the key. Eli leans a little closer, still holding his bag of four oranges. Their eyes widen with curiosity. The camera makes a slow physical push in to the key in Nora’s hand, never cutting, and settles on a suspenseful held final moment.',
    ending: 'The antique brass key is visible in Nora’s hand; Pip is beside her with his red neckerchief, Eli looks surprised nearby, the open yellow umbrella remains in frame and rain continues. Hold naturally to the end with NO abrupt black frame or extra reveal.',
    handoff: 'End of pilot: final frame is a natural held visual hook leading to the next episode, not a new shot.'
  }
];

function scenePrompt(s: Omit<FlowClip,'prompt'>) {
  return [
    'THE LAUNCH ERA — THE LITTLE DETOURS — EPISODE 01: THE UMBRELLA THIEF',
    'SEGMENT '+String(s.number).padStart(2,'0')+' / 07 — '+s.title.toUpperCase(),
    'TARGET: about six seconds of continuous motion, 16:9 landscape.',
    s.number===1
      ? 'MODE: First clip. Animate from the approved character master references and one approved starting frame.'
      : 'MODE: EXTEND THE PREVIOUS GENERATED VIDEO. Begin on its very last frame, continuing exactly the ongoing motion; never rebuild the scene from scratch.',
    '',
    'EXACT OPENING STATE: '+s.opening,
    '',
    'ONE CONTINUOUS ACTION: '+s.action,
    '',
    'EXACT END STATE: '+s.ending,
    '',
    'HANDOFF TO NEXT CLIP: '+s.handoff,
    '',
    'CHARACTER IDENTITY: '+flowMaster.references.slice(0,3).join(' '),
    'PROP INVARIANTS: '+flowMaster.references.slice(3).join(' '),
    'LOCATION: '+flowMaster.setting,
    'VISUAL STYLE AND CAMERA: '+flowMaster.visual,
    'AUDIO: '+flowMaster.sound,
    'STRICT NEGATIVE CONSTRAINTS: '+flowMaster.prohibitions,
    '',
    'IMPORTANT: This is one connected piece of a single uninterrupted 42-second sequence. No opening recap, new establishing shot, pose reset or title card. Do not cut at the end; end on a natural, moving/held frame suitable for extension.'
  ].join('\n');
}

export const flowClips: FlowClip[] = raw.map(s=>({...s,prompt:scenePrompt(s)}));

export const flowCompleteProductionPlan = [
  flowMaster.series+' — '+flowMaster.title,
  flowMaster.format,
  'Primary method: first clip with Frames to Video; use Extend on THE SAME video for clips 02–07. Do not generate seven independent videos.',
  'Fallback if Extend is unavailable: save the final frame of each approved clip and use it as the START frame of the next Frames to Video generation. A generated continuity match still requires visual QC.',
  'Use one fixed 16:9 project, stable lighting and consistent master images. Prefer one 360p test before spending on upscale.',
  'Exact continuity checklist: identity, clothes, rain, sidewalk, direction (right), umbrella fold/open status, four oranges, paper bag, red neckerchief, concealed key, character positions, camera position, audio bridge.',
  'Save all generated versions, source images and approved last frames. No generated footage is claimed until reviewed.',
  '',
  ...flowClips.flatMap(s=>['='.repeat(70),s.prompt,''])
].join('\n');

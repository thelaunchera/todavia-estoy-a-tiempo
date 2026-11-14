/**
 * The Little Detours — one-image-per-expression reference backlog.
 * Original front/angle images remain the identity lock.
 * "Drive" rows below are the already-authored pending prompt briefs;
 * "new" rows are additional silent-storytelling expressions.
 * Nothing in this file claims any pending image has been rendered.
 */
export type ExpressionPlan = {
  id:string;
  name:string;
  label:string;
  kind:'angle'|'expression'|'action';
  framing:string;
  direction:string;
  priority:'pilot'|'later';
  origin:'drive'|'new';
};
const plan: Record<'Nora'|'Eli'|'Pip',ExpressionPlan[]> = {
  Nora:[
    {id:'Nora_05_Profile',name:'Nora',label:'Perfil derecho',kind:'angle',framing:'Full-body, pure right-side profile.',direction:'Standing naturally at ninety degrees to camera, arms relaxed, chin-length bob clearly seen in profile.',priority:'later',origin:'drive'},
    {id:'Nora_06_Happy',name:'Nora',label:'Alegría',kind:'expression',framing:'Waist-up frontal.',direction:'A warm genuine joyful open smile, sparkling eyes and a small excited hand gesture; smiling without speaking.',priority:'pilot',origin:'drive'},
    {id:'Nora_07_Worried',name:'Nora',label:'Preocupación',kind:'expression',framing:'Waist-up frontal.',direction:'Subtle worried expression, softly knitted brows, eyes full of concern and hands resting together; restrained, natural emotion.',priority:'later',origin:'drive'},
    {id:'Nora_08_Frustrated',name:'Nora',label:'Frustración cómica',kind:'expression',framing:'Waist-up frontal.',direction:'Silent comedic frustration, brow lowered, lips lightly pressed and one hand resting on her hip, still sympathetic.',priority:'pilot',origin:'drive'},
    {id:'Nora_09_Curious',name:'Nora',label:'Curiosidad',kind:'expression',framing:'Waist-up three-quarter.',direction:'Lean forward slightly, lift one eyebrow, study a mysterious discovery off-camera, eyes focused and a small restrained smile.',priority:'pilot',origin:'new'},
    {id:'Nora_10_Nervous',name:'Nora',label:'Nervios',kind:'expression',framing:'Waist-up frontal.',direction:'Small nervous half-smile, uncertain gaze and fingers gently clasped close to her sweater; quiet physical tension, not panic.',priority:'later',origin:'new'},
    {id:'Nora_11_Relieved',name:'Nora',label:'Alivio',kind:'expression',framing:'Waist-up frontal.',direction:'Gently exhale, drop her shoulders, close her eyes halfway in relief and show a soft grateful smile; no speech.',priority:'later',origin:'new'},
    {id:'Nora_12_Laughing',name:'Nora',label:'Risa silenciosa',kind:'expression',framing:'Waist-up frontal.',direction:'Authentic silent laughter, bright narrowed eyes, shoulders slightly lifted and one hand at her stomach; no voice or lip-sync.',priority:'later',origin:'new'},
    {id:'Nora_13_Embarrassed',name:'Nora',label:'Vergüenza tierna',kind:'expression',framing:'Waist-up three-quarter.',direction:'An awkward shy smile, quick downward glance, slight blush and hands tucked close; genuine understated comedy.',priority:'later',origin:'new'},
    {id:'Nora_14_Determined',name:'Nora',label:'Decisión',kind:'expression',framing:'Waist-up frontal.',direction:'Steady focused eyes, relaxed but purposeful jaw, shoulders upright and a gentle determined fist near the chest; never aggressive.',priority:'later',origin:'new'}
  ],
  Eli:[
    {id:'Eli_03_ThreeQuarter',name:'Eli',label:'Tres cuartos',kind:'angle',framing:'Full-body facing forty-five degrees to camera-right.',direction:'Relaxed shy stance with full shoes visible, one hand modestly raised, unchanged overshirt.',priority:'later',origin:'drive'},
    {id:'Eli_04_Profile',name:'Eli',label:'Perfil derecho',kind:'angle',framing:'Full-body, pure right-side profile.',direction:'Standing in natural posture, dark wavy hair and green open overshirt unchanged.',priority:'later',origin:'drive'},
    {id:'Eli_05_ShySmile',name:'Eli',label:'Sonrisa tímida',kind:'expression',framing:'Waist-up frontal.',direction:'Shy restrained warm smile, slight head tilt, subtly lifted eyebrow, hands resting comfortably close to his torso.',priority:'pilot',origin:'drive'},
    {id:'Eli_06_Surprised',name:'Eli',label:'Sorpresa',kind:'expression',framing:'Waist-up frontal.',direction:'Expressive wide eyes, eyebrows raised, jaw softly parted in a wordless surprised reaction; no speaking.',priority:'pilot',origin:'drive'},
    {id:'Eli_07_Worried',name:'Eli',label:'Preocupación',kind:'expression',framing:'Waist-up frontal.',direction:'Quiet sad or worried gaze, a subtle brow crease, slightly lowered shoulders and loosely clasped hands.',priority:'later',origin:'drive'},
    {id:'Eli_08_Laughing',name:'Eli',label:'Risa contenida',kind:'expression',framing:'Waist-up three-quarter.',direction:'A genuinely amused silent laugh with slight head tilt, eye crinkles and a discreet hand near his chest; no speech.',priority:'later',origin:'new'},
    {id:'Eli_09_Embarrassed',name:'Eli',label:'Vergüenza',kind:'expression',framing:'Waist-up frontal.',direction:'Shy awkward smile, eyes lowering briefly, cheeks faintly warm, one hand touching the back of his neck.',priority:'later',origin:'new'},
    {id:'Eli_10_Relieved',name:'Eli',label:'Alivio',kind:'expression',framing:'Waist-up three-quarter.',direction:'Softened eyebrows, long quiet exhale, shoulders relaxing and a calm appreciative smile.',priority:'later',origin:'new'},
    {id:'Eli_11_Curious',name:'Eli',label:'Intriga',kind:'expression',framing:'Waist-up three-quarter.',direction:'Slight lean toward a mystery off-camera, raised eyebrow, concentrated gaze and one gently lifted hand.',priority:'pilot',origin:'new'},
    {id:'Eli_12_Determined',name:'Eli',label:'Valor tranquilo',kind:'expression',framing:'Waist-up frontal.',direction:'Quiet resolve, clear focused eyes, steady shoulders and a small decisive nod; natural, never heroic caricature.',priority:'later',origin:'new'},
    {id:'Eli_13_Confused',name:'Eli',label:'Confusión cómica',kind:'expression',framing:'Waist-up frontal.',direction:'Eyebrows unevenly raised, head slightly angled, puzzled but sweet expression and open hands; silently questioning.',priority:'later',origin:'new'}
  ],
  Pip:[
    {id:'Pip_03_Profile',name:'Pip',label:'Perfil derecho',kind:'angle',framing:'Full-body right-side profile, all paws and tail visible.',direction:'Stand naturally on all four paws, red bandana and the two different-colored ears unchanged.',priority:'later',origin:'drive'},
    {id:'Pip_04_Back',name:'Pip',label:'Vista posterior',kind:'angle',framing:'Full-body directly from behind.',direction:'Four paws on the floor, fluffy tail, red bandana knot and two differently colored ears visible from behind.',priority:'later',origin:'drive'},
    {id:'Pip_05_Running',name:'Pip',label:'Corriendo',kind:'action',framing:'Full-body dynamic side profile.',direction:'Playfully running toward camera-right, anatomically correct gait, ears softly bouncing, red bandana visible, whole dog in frame.',priority:'pilot',origin:'drive'},
    {id:'Pip_06_SittingCute',name:'Pip',label:'Sentado y tierno',kind:'expression',framing:'Full-body seated, facing camera.',direction:'Sit on hindquarters with front paws on floor, slightly tilted head and large gentle hopeful eyes; no props.',priority:'later',origin:'drive'},
    {id:'Pip_07_Mischievous',name:'Pip',label:'Travieso',kind:'expression',framing:'Three-quarter full-body.',direction:'Playful mischievous expression, one paw gently lifted, alert ears and a subtle head tilt; canine, not human.',priority:'pilot',origin:'drive'},
    {id:'Pip_08_Happy',name:'Pip',label:'Alegría perruna',kind:'expression',framing:'Three-quarter full-body.',direction:'A delighted puppy expression, warm bright eyes, relaxed open-mouth dog smile and a naturally wagging fluffy tail; no talking.',priority:'later',origin:'new'},
    {id:'Pip_09_Worried',name:'Pip',label:'Preocupación tierna',kind:'expression',framing:'Three-quarter full-body.',direction:'Head slightly lowered, eyes gently turned upward with concern, ears naturally responding and paws still on floor; believable dog body language.',priority:'later',origin:'new'},
    {id:'Pip_10_Curious',name:'Pip',label:'Curiosidad',kind:'expression',framing:'Front three-quarter full-body.',direction:'Tilt head inquisitively, focus eyes on an off-camera glint, perk one ear slightly while retaining exact ear colors; natural puppy interest.',priority:'pilot',origin:'new'},
    {id:'Pip_11_Scared',name:'Pip',label:'Sustito gracioso',kind:'expression',framing:'Full-body frontal.',direction:'One small backward shuffle, eyes briefly widened, ears tucking slightly, tail lowered just a little; mild surprise, not distress.',priority:'later',origin:'new'},
    {id:'Pip_12_Excited',name:'Pip',label:'Emoción juguetona',kind:'expression',framing:'Full-body three-quarter.',direction:'Play bow with forepaws down and hindquarters raised, excited eyes and lively fluffy tail; still four-legged dog anatomy.',priority:'later',origin:'new'},
    {id:'Pip_13_Confused',name:'Pip',label:'Desconcierto',kind:'expression',framing:'Full-body seated.',direction:'A sweet confused look with head tipped the opposite way, asymmetric natural dog ear movements, eyes looking toward a puzzling off-camera object.',priority:'later',origin:'new'}
  ]
};

const characterLock: Record<'Nora'|'Eli'|'Pip',string> = {
  Nora:'An adult young woman: short chestnut-brown bob, expressive hazel eyes, powder-blue oversized knit sweater, ivory wide-leg trousers and white sneakers. Same exact face, body proportions and wardrobe.',
  Eli:'An adult young man: short messy dark-brown wavy curls, forest/sage-green open overshirt, plain ivory crewneck T-shirt, dark umber trousers and cream sneakers. Same exact face, proportions and wardrobe.',
  Pip:'A tiny scruffy cream-gold puppy with large brown eyes, RIGHT ear chocolate-brown and floppy, LEFT ear golden, plain bright red neckerchief, four short natural canine legs and a fluffy tail. Same anatomy and ear-color orientation.'
};

export function expressionPrompt(item:ExpressionPlan) {
  return [
    'THE LITTLE DETOURS — CHARACTER EXPRESSION REFERENCE — '+item.id+'.png',
    'IMPORTANT: Attach the approved original '+item.name+' MASTER FRONT image from the private Google Drive MASTER — Characters library as the visual reference before generating. This is a character-consistent image-to-image edit, NOT a new character design.',
    'IDENTITY LOCK: '+characterLock[item.name as 'Nora'|'Eli'|'Pip'],
    'FRAMING: '+item.framing,
    'EXPRESSION / GESTURE: '+item.direction,
    'STYLE: Premium cinematic stylized 3D animation, warm ivory clean studio background, soft diffused lighting, small contact shadow; faithful to the attached approved reference.',
    'OUTPUT: Exactly ONE separate 3:4 portrait PNG for this expression, not a collage or expression sheet. Never alter the original master image.',
    'NEGATIVE: No redesign, no face drift, no costume changes, no accessories, no extra characters, no extra limbs or anatomy errors, no text, no watermarks, no talking, no lip-sync, no forced uncanny human emotion on the dog.',
    'APPROVAL: Verify face, proportions, hairstyle/fur, ear orientation and clothing against the original before saving the new PNG to the matching private Drive character folder.'
  ].join('\n');
}

export function expressionsFor(name:'Nora'|'Eli'|'Pip') {return plan[name];}
export const expressionCounts = {
  existing: Object.values(plan).flat().filter(x=>x.origin==='drive').length,
  new: Object.values(plan).flat().filter(x=>x.origin==='new').length,
  pilot: Object.values(plan).flat().filter(x=>x.priority==='pilot').length
};

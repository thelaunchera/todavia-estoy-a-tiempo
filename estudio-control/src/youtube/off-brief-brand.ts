/* OFF BRIEF — el universo visual del canal, no marcas de terceros. */
export type BrandAssetSlot={id:string;title:string;group:'Marca'|'Canal'|'Elementos'|'Portadas T1'|'Portadas T2';details:string;format:string;kind:'image'|'video'|'audio';maxMb:number;prompt:string;season?:number;episode?:number};
export const offBriefBrand={
 name:'OFF BRIEF',subtitle:'THE CREATIVE HOUSE',mainTagline:'Great ideas. Terrible timing.',
 palette:[{name:'Warm Ivory',hex:'#FAF8F3'},{name:'Butter Yellow',hex:'#F2D85B'},{name:'Soft Black',hex:'#191919'},{name:'Soft Blue',hex:'#BCD6E8'},{name:'Cobalt',hex:'#2850C5'}],
 fonts:'Prompt para títulos, Futura/sans-serif para texto',
 tone:'Adult workplace comedy: cinematic, witty, human, sincere underneath the absurdity.',
 logoMotion:'The words OFF and BRIEF slide slightly out of alignment, snap back in two short beats, then stay perfectly legible. Original dry paper-swipe + short duck squeak.',
 thumbnailSystem:'One visual problem, one dominant face or object, 2–4 words maximum, each episode visually distinct. Add lettering in the editor, never inside the AI image.',
} as const;
export const offBriefSlogans=[
 {id:'main',label:'Principal',text:'Great ideas. Terrible timing.',purpose:'Debajo del logo y en el banner'},
 {id:'channel',label:'Canal',text:'Two friends. One creative mess.',purpose:'Descripción corta'},
 {id:'about',label:'Promesa',text:'Behind every perfect campaign is a very imperfect day.',purpose:'Trailer y descripción larga'},
 {id:'s1',label:'Temporada 1',text:'The brief was simple. Until it wasn’t.',purpose:'Trailer T1'},
 {id:'s2',label:'Temporada 2',text:'A bigger team. Even bigger problems.',purpose:'Trailer T2'},
 {id:'comedy',label:'Humor',text:'Client approved. Chaos pending.',purpose:'Clips y redes'},
 {id:'people',label:'Humano',text:'Making content. Making mistakes. Making it work.',purpose:'Créditos y cierre'},
 {id:'outro',label:'Cierre',text:'Same studio. Different disaster.',purpose:'Outro opcional'},
 {id:'channel_bio',label:'Bio YouTube',text:'OFF BRIEF is an original animated comedy about two best friends making content for brands. Big ideas, impossible deadlines and a creative team that never quite follows the brief.',purpose:'Descripción del canal'}
] as const;
const core:BrandAssetSlot[]=[
['logo_primary','Logo oficial','Marca','Wordmark horizontal transparente','PNG mínimo 2400×900','image',15,'Original minimal editorial logotype OFF BRIEF in bold uppercase geometric lettering, slight off-baseline misregistration as if a paper brief shifted, black and a single butter-yellow accent, sharp vector-like boundaries, transparent background. No other words, no stock template.'],
['logo_compact','Símbolo compacto OB','Marca','Avatar de marca pequeño, sin texto adicional','PNG cuadrado 1024×1024','image',15,'Distinctive original OB monogram for OFF BRIEF with one subtle shifted-corner detail, black and butter yellow, completely legible at 48px, centered transparent square, no noisy texture.'],
['channel_banner','Hero / banner YouTube','Canal','Texto y caras dentro de área segura centrada','PNG/JPG 2560×1440, ≤6 MB','image',6,'Cinematic 3D editorial comedy banner: Nia and Ruby exact official faces and hairstyles from supplied references on either side of their tiny creative studio table, camera gear and one rubber duck. Warm ivory and soft blue. Frame 2560×1440; KEEP ALL faces, logotype space and main tagline within center 1544×423. Leave clean center space for the editor to add OFF BRIEF and Great ideas. Terrible timing. No AI-rendered text.'],
['channel_avatar','Foto de perfil YouTube','Canal','Retrato reconocible en círculo','PNG 1024×1024','image',15,'Close two-person portrait of official Nia and Ruby reference avatars, identical faces, shoulders visible, funny contrasting dry-vs-wild expression, centered inside safe circular crop with butter-yellow background and dark clean border. 1024×1024 square. No words.'],
['motif_duck','Patito del estudio','Elementos','Prop recurrente para gags y overlays','PNG transparente 1024×1024','image',15,'One tiny original yellow rubber duck from the fictional OFF BRIEF studio, subtly expressive by posture, high-quality stylized 3D materials, isolated on transparent background. No lettering.'],
['motif_clapper','Claqueta OFF BRIEF','Elementos','Motivo pequeño reconocible','PNG transparente 1024×1024','image',15,'One premium 3D miniature black-and-butter-yellow clapperboard tilted slightly off axis, no readable writing, transparent background.'],
['lower_third','Rótulo de personajes','Elementos','Capa para añadir nombre y profesión','PNG transparente 1920×1080','image',15,'Transparent full-HD frame with ONLY one refined lower-left graphic panel, soft black with yellow offset corner and pale-blue hairline accent, generous blank space for later name typography. Nothing else.'],
['transition_card','Tarjeta de transición','Elementos','Fondo para intro y cortes de escena','PNG 1920×1080','image',15,'Minimal cinematic graphic for OFF BRIEF, soft-black background with one off-center yellow outlined rectangle like an askew paper brief; lots of clean empty space for inserting official logotype in editing. No AI typography.'],
['video_bumper','Animación del logo','Elementos','Entrada breve después del cold open','MP4/WEBM 1920×1080 · hasta 10 segundos','video',45,'Animate the approved exact OFF BRIEF logo for 5 seconds (maximum 10 seconds). Two quick offset snaps on the letters then hold legible, a tiny yellow corner slips out. Never morph typography. No music generated; original sting will be layered in editor.'],
['sfx_sting','Sonido de la serie','Elementos','Identidad sonora original','WAV/MP3 1–3s','audio',15,'Original dry paper shuffle, two tiny offbeat taps and one quiet rubber duck squeak, two seconds, no copyrighted music or words, sound design WAV 48kHz.']
].map(([id,title,group,details,format,kind,maxMb,prompt])=>({id:id as string,title:title as string,group:group as BrandAssetSlot['group'],details:details as string,format:format as string,kind:kind as BrandAssetSlot['kind'],maxMb:maxMb as number,prompt:prompt as string}));
const s1=[
['The Viral Emergency','The camera fell','Two friends peer from above into a fallen camera lens on the studio floor; low-angle face distortion, one stunned and one curious.'],
['The Client Said Beige','BEIGE AGAIN?','Two friends versus twenty-three barely different beige swatches; one absurd color chip is fluorescent pink.'],
['Influencer for a Day','FAKE MORNING','Dreamy loft breakfast with Nia serene in foreground, Ruby racing to rescue a smoking toaster behind.'],
['The AI Intern','AI TOOK OVER','A glowy digital assistant lighting every computer while Nia recoils and Ruby watches delighted.'],
['One Product, 100 Photos','100 PHOTOS?!','One identical blue water bottle against a wall of nearly identical commercial photos, two exhausted creatives.'],
['The Competitor','THEY COPIED US','Nia and Ruby recognize their candle concept at a rival agency mixer; comic shocked reaction.'],
['The Biggest Pitch','BIG PITCH','Nia in cobalt blazer, enormous corporate atrium, Ruby searching under lobby sofa for lost tiny rubber duck.'],
['We Almost Quit','WE ALMOST QUIT','Almost-empty studio, both friends in silhouette folding a photography backdrop, emotional yet hopeful.']
];
const s2=[
['We Need a Bigger Table','DOESN’T FIT','Huge wooden table stuck in studio door, Nia on inside and Ruby pushing optimistically on outside.'],
['Ten Directors, One Shot','DON’T TOUCH IT','Pristine coffee cup foreground; Ruby, Val, Sage and Mateo all pointing a different way behind it.'],
['The Missing Product','IT’S EMPTY','Inside-shipping-box POV looking up at astonished Jules, Nova and Mateo staring into nothing.'],
['Don’t Make It Real','SAME SCRIPT?','June lowers microphone in disbelief in front of three overly polished, identical-smiling interviewees.'],
['Everyone Wants Credit','WHO DID WHAT?','Nia and Nova lost behind absurd endless credit scroll covering a tiny product ad.'],
['Offline','NO WIFI','Nova stares at giant frozen loading symbol; Ruby looks shocked and Nia proudly holds paper backup.'],
['Launch Night','SCREEN BLACK','Giant blank launch-event screen with confetti while Nia force-smiles and Simone improvises onstage.'],
['The Group Photo','ONE NORMAL PHOTO','Ten-person group photo where Ruby nearly falls from chair and everybody looks toward lens in disbelief.']
];
export const offBriefAssetSlots:BrandAssetSlot[]=[
 ...core,
 ...([{season:1,group:'Portadas T1' as const,items:s1},{season:2,group:'Portadas T2' as const,items:s2}]
   .flatMap(({season,group,items})=>items.map(([title,hook,visual],index)=>({
    id:'cover_s'+season+'_e'+String(index+1).padStart(2,'0'),title:'E'+String(index+1).padStart(2,'0')+' · '+title,group,
    details:'Texto sugerido: '+hook,format:'PNG/JPG 3840×2160 (16:9)',kind:'image' as const,maxMb:15,season,episode:index+1,
    prompt:'Produce a UNIQUE premium cinematic 3D animated YouTube thumbnail for OFF BRIEF season '+season+', episode '+(index+1)+': '+title+'. Exact approved official cast avatar faces, consistent wardrobe and hair. Main visual premise: '+visual+' Dramatic readable composition, one clear action, face or object dominant, clean negative space for hook '+hook+' to be typed later in editor (DO NOT generate text). 16:9, 3840×2160; warm ivory, soft black, butter yellow, soft blue, cobalt accent; never a sticker collage.'
   }))))
];

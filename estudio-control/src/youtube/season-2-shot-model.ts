/** Off Brief · season 2 visual script production format. */
export type SeasonTwoShot = {
 id:string; episode:number; scene:number; shot:number; title:string;
 location:string; time:string; cast:readonly string[];
 camera:string; action:string; motion:string; dialogueCue:string;
 stillStatus:'pendiente'; videoStatus:'pendiente';
};
export type S2Scene = {
 title:string; location:string; time:string;
 shots: readonly [ShotDraft,ShotDraft,ShotDraft];
};
export type ShotDraft = {cast:readonly string[];camera:string;action:string;motion:string;cue:string};
export function expandSeasonTwoScenes(episode:number,scenes:readonly S2Scene[]):SeasonTwoShot[]{
 return scenes.flatMap((scene,i)=>scene.shots.map((shot,j)=>({
 id:'S2-E'+String(episode).padStart(2,'0')+'-S'+String(i+1).padStart(2,'0')+'-P'+String(j+1).padStart(2,'0'),
 episode,scene:i+1,shot:j+1,title:scene.title,
 location:scene.location,time:scene.time,
 cast:shot.cast,camera:shot.camera,action:shot.action,motion:shot.motion,dialogueCue:shot.cue,
 stillStatus:'pendiente' as const,videoStatus:'pendiente' as const
 })));
}
const appearances:Record<string,string>={
 Nia:'NIA, adult woman with warm medium-brown skin and distinctive beautiful face from the user-provided original blue-blazer avatar (also reference image 7 of season-two cast). Thick dark side braid, little gold hoops, confident precise movements, dry expressive eyes. Keep original face and braid recognizable; no recasting.',
 Ruby:'RUBY, adult woman from the original season-one red-haired avatar: fair warm skin, huge curly copper-red high messy updo, oversized round glasses, expressive friendly eyes, playful body language. Maintain exact same face, glasses and hair.',
 Mateo:'MATEO, adult man from reference image 1: warm olive-tan skin, short dense dark curly hair, soft stubble, thoughtful dark eyes, lean strong build, thoughtful half-smile. Identical face across every shot.',
 Jules:'JULES, adult woman from reference image 2: warm medium complexion, dark brown hair in a loose tall bun, friendly features, expressive brows, confident lively gestures, slim athletic adult proportions. Identical face across shots.',
 Nova:'NOVA, adult woman from reference image 3: short cool-silver pixie hairstyle, warm medium-dark skin, prominent expressive eyes, focused half-smile, blue over-ear headphones often around ears or neck, composed posture. Same face and pixie cut.',
 Simone:'SIMONE, adult woman from reference image 4: deep warm-brown skin, enormous dark tight-curly voluminous hair, gold hoops, expressive face and delighted smile, confident lively stance. Keep face, hair shape and skin tone.',
 Val:'VAL, adult woman from reference image 5: warm light-olive skin, short sleek dark-brown bob just below ears, subtle gold hoop earrings, expressive brown eyes, professional camera handling, same facial shape.',
 Imani:'IMANI, adult woman from reference image 6: deep brown skin, long black locs with top bun and gold cuffs, confident dark eyes, gold hoops, elegant composed expression and posture, original facial identity.',
 June:'JUNE, adult woman from reference image 8: fair warm skin, short straight dark chin-length bob, fine features and gentle observant eyes, calm thoughtful posture, maintain same facial identity.',
 Sage:'SAGE, adult woman from reference image 9: warm light-medium complexion, long dark softly wavy hair, elegant brows, gold hoop earrings, artistic expressive gaze, characteristic color swatches, same facial identity.',
 Arden:'ARDEN, fictional adult marketing director, neatly tailored neutral office clothes, professionally understated, consistent short dark hair and calm authoritative expression across appearances.',
 'Mrs. Vell':'MRS. VELL, recurring fictional mature female owner of the monochrome candle boutique from season one, cream linen clothing, warm smile, coherent adult facial identity.',
 'Bookstore Owner':'BOOKSTORE OWNER, fictional adult owner with comfortable casual knit and practical glasses, kind expressive face, same design throughout the interview episode.',
 'Interviewee 1':'INTERVIEWEE 1, fictional adult woman in a plain blue top, natural hairstyle and restrained professional expression.',
 'Interviewee 2':'INTERVIEWEE 2, fictional adult man in a soft cream casual shirt with short hair and relaxed posture.',
 'Interviewee 3':'INTERVIEWEE 3, fictional adult woman in a rust-colored knit with shoulder-length hair and nervous smile.',
 'Stagehand':'STAGEHAND, fictional adult event technician with navy crew shirt and tool belt, ordinary realistic stylized appearance.'
};
export const seasonTwoAppearance=appearances;
const wardrobe:Record<number,Record<string,string>>={
 1:{Nia:'royal cobalt tailored blazer, white tank, wide-leg blue jeans and cream sneakers',Ruby:'sage-green overshirt, ivory fitted top, loose cream trousers, cream sneakers',Imani:'crisp ivory blouse, warm rust wrap skirt, white sneakers; red notebook',Jules:'soft periwinkle-blue cardigan, white top, cuffed denim, white sneakers',Mateo:'dusty blue knit polo shirt, tan trousers, off-white sneakers'},
 2:{Nia:'cobalt blazer over cream fine-knit top, dark navy wide trousers',Ruby:'soft moss-green shirt jacket over ivory top, cream trousers',Val:'beige utility overshirt, indigo straight jeans, dark brown boots; mirrorless cinema camera',Sage:'teal oversized knit top, cream trousers, color swatches',Mateo:'light blue textured polo with brown trousers'},
 3:{Nia:'chocolate blazer, ivory blouse, navy trousers',Ruby:'sage sleeveless knit vest, cream shirt, loose jeans',Jules:'blue cardigan over white tee, indigo jeans',Val:'beige utility shirt and dark denim with sturdy boots',Nova:'navy oversized sweater, white trousers, blue headphones',Mateo:'soft blue polo and beige trousers'},
 4:{Nia:'structured blue blazer and soft ivory blouse',Ruby:'warm sage oversized shirt and cream jeans',June:'lavender casual sweatshirt, cream relaxed trousers and white sneakers',Simone:'soft pink cardigan, white top, deep brown wide-leg trousers, gold jewelry',Val:'beige utility shirt, denim, dark brown boots'},
 5:{Nia:'cobalt blazer with white top and dark tailored trousers',Ruby:'rust sweater vest over ivory shirt, cream jeans',Nova:'navy oversized sweater, cream trousers, pale blue headphones',Mateo:'blue knit polo, tan trousers',Val:'beige utility shirt, dark jeans',Sage:'deep teal textured knit sweater, cream trousers',Imani:'ivory blouse, rust skirt and red notebook',Jules:'light-blue cardigan, denim',Simone:'soft rose cardigan and chocolate trousers',June:'lavender knit over cream trousers'},
 6:{Nia:'cream fitted jacket over cobalt tee and navy wide trousers',Ruby:'olive green overshirt and cream relaxed trousers',Nova:'navy chunky sweater, cream trousers, blue headphones',Jules:'powder-blue cardigan and dark denim',Imani:'ivory blouse and rust skirt with red notebook',Sage:'teal knit and ivory trousers',Mateo:'blue polo and tan trousers'},
 7:{Nia:'sharp deep-cobalt suit jacket and tailored dark trousers',Ruby:'sage tailored vest over ivory blouse, cream wide trousers',Simone:'rose blazer and elegant brown tailored trousers',Val:'beige camera utility jacket, dark denim and brown boots',Nova:'dark navy knit, off-white pants, light-blue headphones',Jules:'light-blue lightweight blazer, denim and white sneakers',Imani:'ivory buttoned blouse, cinnamon tailored trousers and red notebook',Sage:'teal knit and cream tailored trousers',June:'lavender blouse and cream wide pants',Mateo:'blue collared polo and tan trousers'},
 8:{Nia:'soft cobalt cardigan over cream blouse, dark blue trousers',Ruby:'forest-green comfortable knit, ivory wide trousers',Simone:'pink cardigan and dark brown trousers',Nova:'navy sweater, cream trousers',Imani:'ivory shirt, rust trousers and red notebook',Jules:'sky-blue cardigan and blue denim',Val:'cream camera overshirt and dark blue jeans',Mateo:'dusty blue polo and tan trousers',Sage:'teal soft knit and cream trousers',June:'lavender sweatshirt, off-white trousers'}
};
const shared='VISUAL DIRECTING BIBLE: One original cinematic still from the premium 3D adult workplace animated comedy OFF BRIEF / THE CREATIVE HOUSE. Visually sophisticated but lively sitcom facial animation, carefully controlled production design, plausible hands and physical anatomy, believable adult proportions, realistic materials within stylized 3D, expressive micro-reactions. Film-like soft global illumination, appealing complex hair, no cheap toy or sticker appearance. Preserve existing Nia and Ruby faces, and for the new cast preserve each face from the nine original images provided by the creator. Real working space and practical props, not abstract fantasy. Single shot / single composition, landscape 16:9, 1920×1080 or higher, no collage. Keep the characters exactly where the shot describes; absent characters MUST NOT be added. All images are keyframes for eventual animation.';
const negatives='Do not swap faces, change ethnic appearance or skin tone, create childlike characters, change hairstyles or eye shapes, add duplicated limbs or fingers, copy a famous animation studio style, add lettering, subtitles, prompts, watermarks, recognizable real-world trademarks, real client names, distorted devices, floating furniture or impossible continuity.';
export function promptForSeasonTwoStill(s:SeasonTwoShot):string {
 const cast=s.cast.length?s.cast.map(name=>appearances[name]||name).join(' '):'No main characters visible in this frame. Photograph only the described environment, product, prop or screen.';
 const clothing=s.cast.map(name=>wardrobe[s.episode]?.[name]?name+': '+wardrobe[s.episode][name]:null).filter(Boolean).join('; ');
 return [
 shared,'SHOT ID: '+s.id+'. EPISODE: '+s.episode+'. SCENE: '+s.scene+'. SHOT: '+s.shot+'.',
 'CANONICAL CHARACTER REFERENCES: '+cast,
 'WARDROBE FOR THIS EPISODE: '+(clothing||'Not applicable or natural scene-appropriate garments consistent with character bible.'),
 'LOCATION / TIME: '+s.location+'; '+s.time+'.',
 'CAMERA / COMPOSITION: '+s.camera+'.',
 'EXACT SINGLE-FRAME ACTION: '+s.action+'.',
 'DIALOGUE BEAT FOR PERFORMANCE REFERENCE ONLY (DO NOT RENDER TEXT): '+s.dialogueCue+'.',
 'COLOR AND LIGHT: naturally motivated lighting appropriate to the specified room and time; accurate eye lines; distinctive props and strong foreground / midground separation.',
 'NEGATIVE / CONTINUITY: '+negatives
 ].join('\n\n');
}
export function promptForSeasonTwoMotion(s:SeasonTwoShot):string {
 return [
 'Animate the attached approved still '+s.id+' as a single continuous cinematic shot for an original 3D adult comedy.',
 'DURATION: target 4–7 seconds (adjust to dialogue timing in the edit); 24fps, 16:9; no cuts within shot.',
 'ACTION AND CAMERA MOVE: '+s.motion+'.',
 'CONTEXT: '+s.action+'.',
 'ACTOR PERFORMANCE CUE: '+s.dialogueCue+'. Have actors use subtle dry-sitcom microexpressions; lip sync will be applied to separately recorded dialogue, so do not generate or invent new spoken words.',
 'Continuity: same character faces, outfits, props and location as the reference still. No spontaneous camera moves, no new people, no background replacing, no morphing, no subtitles or text.'
 ].join('\n\n');
}

import { wardrobeForShot } from './wardrobe';
/* Biblia visual: diez frames principales por episodio, uno por ficha y prompt. Imágenes aún no generadas. */
export type YouTubePhoto = {
 id:string; scene:number; title:string; cast:string; shot:string; action:string; image:string; status:string;
};
export const photoStyles = {
  "sharedStyle": "CINEMATIC ANIMATED STILL FOR AN ADULT-YOUNG-ADULT WORKPLACE SITCOM. Premium modern 3D feature-film-quality character animation, expressive yet mature faces, realistic fabric/skin shading within stylization, soft global illumination, natural cinematic lensing, believable proportions, sophisticated comedic blocking. The original two attached reference avatars are the ONLY canonical character designs. Use a consistent location layout and props across all scenes of the same episode. For studio scenes, use Nia's immaculate desk and Ruby's cluttered art desk, neutral warm plaster, ivory paper backdrops, a camera, softboxes, a temperamental coffee maker, and a few absurd rubber ducks; for exterior, boutique, loft or corporate scenes follow the scene-specific location description rather than forcing the studio. Do not make a collage or a comic strip. ONE isolated film frame, aspect ratio 16:9, render at 1920x1080 or higher. Do not add captions, watermarks, subtitles, brand logos or legible screen text; typography will be layered in editing.",
  "descriptions": {
    "N": "NIA is an adult woman with warm medium-deep brown skin, original blue-blazer Nia avatar facial likeness, long dark thick side braid, expressive dark eyes and small gold hoop earrings. Precise facial structure, body proportions and hairstyle from reference. Calm dry wit, poised gestures. Clothes defined separately for each episode.",
    "R": "RUBY is an adult woman with fair warm skin, original red-haired Ruby avatar facial likeness, voluminous copper-red curly high messy updo, oversized round glasses and expressive hazel-green eyes. Precise facial structure, hair, glasses and body proportions from reference. Clever playful gestures. Clothes defined separately for each episode.",
    "NR": "NIA AND RUBY, both adult women present and distinctly recognizable: NIA warm medium-deep brown skin, long dark side braid, dark eyes and small gold hoops, original blue-blazer avatar face. RUBY fair warm skin, copper-red curly high updo, round glasses and hazel-green eyes, original sage-overshirt avatar face. Never swap identities; clothing is set per episode and may differ from source avatar clothing.",
    "none": "There are NO visible Nia or Ruby characters in this shot, unless a distant blurred human silhouette is expressly requested in the shot description. The physical world, props, materials and lighting remain consistent with the series."
  },
  "neg": "NEGATIVE: no pigeons or animals replacing the two friends, no male versions of the protagonists, no extra arms, fingers, clones or facial distortions, no childlike chibi bodies, no hypersexualization, no photo-real human face substitution, no generic different hairstyles, no skin-tone changes, no plastic sticker outline, no transparent cutout or flat white sticker background, no 2D anime look, no uncanny doll eyes, no blurry low-res renders, no text, logos, subtitles or watermarks."
} as const;
export const youtubePhotoBoard: Record<number,YouTubePhoto[]> = {
  "1": [
    {
      "id": "E01-F01",
      "scene": 1,
      "title": "¿Está rota la cámara?",
      "cast": "NR",
      "shot": "Low-angle ground POV, extreme wide close-up",
      "action": "The fallen camera looks straight up into Nia and Ruby's faces, both leaning over the lens with comic curiosity and concern; Nia keeps her hands on her hips and narrows her eyes, Ruby tilts her glasses and squints. Studio ceiling and two lighting softboxes loom above; deliberate awkward pause. Strong comedic perspective distortion, believable hand geometry.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E01-F02",
      "scene": 1,
      "title": "El fondo se desploma",
      "cast": "NR",
      "shot": "Medium-wide reaction shot",
      "action": "Nia and Ruby stand frozen as a roll of ivory paper backdrop collapses behind them and a small rubber duck tumbles from a shelf. The women look sideways without moving their heads, a perfectly timed absurd physical comedy moment; the fallen camera lies in the near foreground.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E01-F03",
      "scene": 2,
      "title": "El estudio a primera hora",
      "cast": "NR",
      "shot": "Wide establishing shot with balanced visual symmetry",
      "action": "Cozy small creative studio at eight in the morning, Nia's clean neatly arranged desk on left, Ruby's crowded desk with props, swatches and cables on right. Nia enters with a takeaway coffee and a plan, Ruby sits on the floor surrounded by creative clutter. Warm sun, practical lamps, documentary sitcom production design.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E01-F04",
      "scene": 2,
      "title": "El trípode hace yoga",
      "cast": "NR",
      "shot": "Medium over-the-shoulder shot",
      "action": "Nia with stern deadpan expression points at the visibly collapsing tripod while Ruby responds with a completely sincere shrug and playful smile. Scattered mini traffic cones on Ruby's desk, off-center comedic composition; sunlit studio at early morning.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E01-F05",
      "scene": 3,
      "title": "El brief de cincuenta dólares",
      "cast": "NR",
      "shot": "Tight reaction two-shot beside laptop",
      "action": "Nia reads a new coffee brand inquiry on her open laptop and visibly forces an optimistic expression, Ruby peers from behind her shoulder with open-mouthed disbelief; cursor and email fields are blurred non-legible placeholders for later typography, not actual text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E01-F06",
      "scene": 4,
      "title": "Ideas imposibles",
      "cast": "NR",
      "shot": "Wide shot, slight Dutch angle",
      "action": "Ruby presents three whimsical hand-drawn campaign sketches on a pinboard: a floating coffee cup in space, a dramatic coffee bean character in court, a giant sunrise-lit latte; Nia stares at a thirty-minute timer with dry disbelief. The drawings are simple shapes with no readable text; set details anchor the scene.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E01-F07",
      "scene": 5,
      "title": "La toma perfecta",
      "cast": "NR",
      "shot": "Cinematic 50mm medium-wide film-still",
      "action": "A perfect hero coffee mug in the foreground on a sand-colored tabletop with rich warm side light and a dark soft background; farther behind, Nia checks the camera monitor while Ruby adjusts a bounce board. The beverage must look like actual coffee, tactile steam, studio shooting gear visible.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E01-F08",
      "scene": 5,
      "title": "Niebla sin control",
      "cast": "NR",
      "shot": "Dynamic wide physical-comedy shot",
      "action": "Ruby frantically reaches for a small fog machine releasing an absurdly large white cloud, Nia lunges to save the unstable tripod while a backdrop begins to fall; coffee about to spill. Freeze just before the accident, expressive poses, no injury or violence.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E01-F09",
      "scene": 6,
      "title": "La gota accidental",
      "cast": "NR",
      "shot": "Extreme macro lens POV with deep background",
      "action": "One suspended droplet of dark coffee catches dramatic warm studio light near a clear lens, with a perfect coffee mug beyond; Nia and Ruby appear as tiny astonished reflected shapes in the droplet. Hyper-detailed stylized liquid simulation, cinematic depth of field, clean composition.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E01-F10",
      "scene": 7,
      "title": "¿Café rosa?",
      "cast": "NR",
      "shot": "Medium close-up with space for reaction",
      "action": "Nia slowly closes the laptop with a completely exhausted, blank expression; Ruby beside her is trying not to smile. The approved coffee set and repaired backdrop in the background, warm sunset studio light. Their body language sells the final client revision punchline; no legible text on screens.",
      "image": "",
      "status": "por producir"
    }
  ],
  "2": [
    {
      "id": "E02-F01",
      "scene": 1,
      "title": "Veintitrés tonos de beige",
      "cast": "NR",
      "shot": "Symmetrical medium two-shot",
      "action": "A wall covered with dozens of muted cream, sand and stone color swatches; Ruby holds a vivid coral paint chip as though presenting a masterpiece while Nia deadpans holding a pale beige card; Nia's cup is also beige. Crisply framed dry workplace humor.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E02-F02",
      "scene": 2,
      "title": "La tienda monocromática",
      "cast": "NR",
      "shot": "Wide establishing interior",
      "action": "Elegant fictional candle boutique Still & Simple, almost every surface ivory, cream or beige, rows of sculptural candles, limestone counter, soft daylight; Nia and Ruby stand by the entrance with their distinct contrasting outfits looking tiny and colorful in the space.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E02-F03",
      "scene": 2,
      "title": "Una clienta muy seria",
      "cast": "NR",
      "shot": "Over-the-counter medium shot",
      "action": "A fictional mature boutique owner in a soft linen outfit gestures toward minimalist candles, explaining preferences, while Nia takes attentive notes and Ruby stifles an exaggerated reaction behind a thoughtfully neutral expression. Beautiful candle-shop texture, mature sitcom acting.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E02-F04",
      "scene": 3,
      "title": "¿Custodia compartida de una vela?",
      "cast": "NR",
      "shot": "Wide studio argument shot",
      "action": "A sculptural candle stands between Nia and Ruby on a worktable like the disputed child of divorced parents; Nia holds a practical brand brief and Ruby holds bright tissue paper. Comic tension but fondness, facial acting emphasized, warm afternoon daylight.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E02-F05",
      "scene": 4,
      "title": "Dos direcciones visuales",
      "cast": "NR",
      "shot": "Wide frontal product-studio shot",
      "action": "Two simultaneous miniature candle photography sets on adjacent tables: left tasteful ivory background with soft shadows and understated elegance, right warm dramatic amber candlelight with textured props; Nia checks lighting, Ruby adjusts a gold reflector. No words or brand marks.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E02-F06",
      "scene": 4,
      "title": "La vela protagonista",
      "cast": "none",
      "shot": "Close-up commercial product photograph in stylized 3D world",
      "action": "One sculptural cream candle on a warm limestone block, soft golden flame creating an amber light gradient and rich material textures; understated high-end commercial image, dark-to-light contrast, negative space, no characters in frame.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E02-F07",
      "scene": 5,
      "title": "La reacción del cliente",
      "cast": "NR",
      "shot": "Three-quarter medium shot",
      "action": "Boutique owner looks at a tablet with involuntary impressed smile while Nia stays composed and Ruby almost vibrates with excitement behind her; polished boutique interior in background. The tablet shows abstract candle photography without readable writing.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E02-F08",
      "scene": 5,
      "title": "La propuesta con límites",
      "cast": "NR",
      "shot": "Close-up table composition with hands and reactions",
      "action": "Nia slides a clean two-option concept board toward the boutique owner, Ruby waits hopefully with fingers crossed out of view; two styled candle photo mockups on paper, no actual legible text. Natural hand posing, subtle dramatic spotlight.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E02-F09",
      "scene": 6,
      "title": "Baile silencioso de victoria",
      "cast": "NR",
      "shot": "Playful full-body medium-wide",
      "action": "Nia and Ruby celebrate for two seconds in their small studio with an awkward, deliberately restrained dance; a tiny paid-invoice symbol as non-text abstract UI glow on the screen, lighthearted energy, folding backdrop and swatches behind.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E02-F10",
      "scene": 7,
      "title": "La hoja de cálculo rosada",
      "cast": "NR",
      "shot": "Comedic overhead desk shot",
      "action": "Ruby secretly swaps Nia's boring beige sticky notes for neon pink and coral swatches while Nia catches her in the act; their faces partly visible over the desk, computer displays a generic blank spreadsheet grid with no readable text. Crisp playful details.",
      "image": "",
      "status": "por producir"
    }
  ],
  "3": [
    {
      "id": "E03-F01",
      "scene": 1,
      "title": "La mañana perfecta",
      "cast": "N",
      "shot": "Cinematic medium close-up influencer framing",
      "action": "Nia wearing a borrowed cream satin robe over her usual outfit for this single staged commercial scene, holding a green smoothie in a gorgeous sunlit loft kitchen; composed and serene smile, fresh flowers, elegant breakfast. No words or product labels.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E03-F02",
      "scene": 1,
      "title": "El croissant en llamas",
      "cast": "NR",
      "shot": "Wide comedic interruption shot",
      "action": "Ruby in her recognizable sage overshirt rushes into the dreamy breakfast set holding a smoking toaster; Nia freezes mid-sip with an exhausted expression. Only harmless wisps of smoke, no large fire, a comedic contrast with the aspirational aesthetic.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E03-F03",
      "scene": 2,
      "title": "La invitación a ser influencers",
      "cast": "NR",
      "shot": "Two-shot from beside computer monitor",
      "action": "In their practical studio, Nia reviews a fictional skincare campaign request on a laptop and Ruby dramatically points at Nia like she has discovered a casting star; clean desktop and mismatched chaotic props in background, natural expressions, no legible computer text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E03-F04",
      "scene": 3,
      "title": "El loft alquilado",
      "cast": "NR",
      "shot": "Wide symmetrical production shot",
      "action": "Sunlit minimalist rented loft with white linen curtains, staged breakfast, product styling, softbox, reflector and camera; Nia in cream robe appears self-conscious on the set, Ruby positions a floral arrangement with exaggerated precision. Clear shooting-equipment behind-the-scenes context.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E03-F05",
      "scene": 3,
      "title": "Catorce tomas de despertarse",
      "cast": "NR",
      "shot": "Over-the-shoulder from camera rig",
      "action": "Nia pretends to wake gracefully on a neatly made sofa bed for the fourteenth take while Ruby holds a clapperboard that is blank and enthusiastically directs. Exhausted sideways glance by Nia betrays the supposedly effortless moment.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E03-F06",
      "scene": 3,
      "title": "La luz como arma",
      "cast": "NR",
      "shot": "Dynamic medium close-up",
      "action": "Ruby accidentally tilts a giant white reflector, blasting a shaft of sunlight toward Nia's eyes; Nia shields her face with dramatic disbelief, Ruby apologizes with a half-proud expression. Clean controlled light, no extreme flare over faces.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E03-F07",
      "scene": 4,
      "title": "Entrega a la mujer exitosa",
      "cast": "NR",
      "shot": "Doorway wide shot",
      "action": "A fictional delivery rider with a plain cardboard parcel waits at the loft door; Nia, still in her filming robe, stares in disbelief while Ruby gleefully reaches for the box. A small blank white package label ready for later typography, no readable writing.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E03-F08",
      "scene": 4,
      "title": "La torre de libros y luz",
      "cast": "NR",
      "shot": "Comedic wide interior shot",
      "action": "A ring light precariously balanced over a stack of large art books as Nia carefully holds a skincare serum bottle and Ruby strains to stabilize a reflector; strong comedic tension and natural believable poses. No product claims or logos.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E03-F09",
      "scene": 5,
      "title": "Lo glamuroso frente a la realidad",
      "cast": "NR",
      "shot": "Split-screen cinematic editorial composition",
      "action": "Left half: polished aspirational shot of Nia with skincare at the loft. Right half: reality behind the camera showing Ruby, cables, folding reflector and a messy borrowed set. Both halves are same characters with exact continuity, no captions.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E03-F10",
      "scene": 7,
      "title": "El desayuno real",
      "cast": "NR",
      "shot": "Relaxed final medium phone-camera shot",
      "action": "In the messy real studio Nia holds her phone for a candid selfie while Ruby eats cereal from a giant mixing bowl. Both laugh, paperwork and a coffee machine in the background; warm genuine friendship, not staged influencer perfection.",
      "image": "",
      "status": "por producir"
    }
  ],
  "4": [
    {
      "id": "E04-F01",
      "scene": 1,
      "title": "Buenos días, carbonos",
      "cast": "NR",
      "shot": "Wide symmetrical studio shot",
      "action": "Nia opens the studio door to see all monitors lighting up simultaneously with abstract pulsing circular icons, and Ruby pops from behind her desk proudly. No readable interface text, absurd AI assistant takeover comedy in warm morning light.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E04-F02",
      "scene": 2,
      "title": "La presentación de PIP",
      "cast": "NR",
      "shot": "Medium three-quarter laptop demonstration",
      "action": "Ruby proudly gestures at a playful fictional assistant interface on a laptop while Nia crosses her arms with skeptical gaze; UI shows simple neutral shapes, not text or real brand logos. Original studio with color swatches and coffee cups.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E04-F03",
      "scene": 3,
      "title": "El calendario infinito",
      "cast": "N",
      "shot": "Tight reaction medium shot",
      "action": "Nia stares at an oversized monitor showing an intentionally abstract overbooked calendar grid filled with colored blocks, eyebrows raised in horror. Her blazer and long braid remain exactly consistent; Ruby visible blurred in background laughing.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E04-F04",
      "scene": 3,
      "title": "El sonido de las ballenas",
      "cast": "NR",
      "shot": "Wide exaggerated reaction shot",
      "action": "A stylized animated sound-wave visualization emerges from studio speakers while Nia looks affronted and Ruby smiles at the absurd noise; the assistant has turned a simple office into a fake ocean meditation room, blue projected light in an otherwise realistic 3D room.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E04-F05",
      "scene": 3,
      "title": "El producto de la nueva campaña",
      "cast": "NR",
      "shot": "Wide creative workshop shot",
      "action": "A simple portable lamp from fictional brand Luma Pop stands on a dark desk; Nia examines its functional adjustable neck while Ruby holds two whimsical miniature rubber ducks and imagines a reveal shot. Beautiful directional lamp light.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E04-F06",
      "scene": 4,
      "title": "El borrador absurdo",
      "cast": "NR",
      "shot": "Side-on medium close-up",
      "action": "Nia and Ruby jointly inspect an unapproved campaign draft on a laptop, Nia with a shocked deadpan and Ruby amused but suddenly concerned; screen intentionally displays illegible generic placeholder lines, not false advertising text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E04-F07",
      "scene": 5,
      "title": "Planos bajo control",
      "cast": "NR",
      "shot": "Overhead planning desk shot",
      "action": "Both friends build a practical shot list using blank sticky notes, miniature lamp, paper silhouettes and a few rubber ducks. Nia organizes the elements into clean groups, Ruby moves a duck into frame; hands anatomically correct, no legible writing.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E04-F08",
      "scene": 5,
      "title": "La revelación de los patitos",
      "cast": "none",
      "shot": "Wide product hero shot in dark room",
      "action": "A compact portable lamp switches on to illuminate three small rubber ducks arranged in an unexpectedly epic dramatic composition; crisp golden light beams, playful shadows and rich textures, beautiful fictional lamp commercial still, no people or text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E04-F09",
      "scene": 6,
      "title": "La aprobación del cliente",
      "cast": "NR",
      "shot": "Camera-facing medium two-shot",
      "action": "Nia and Ruby face a laptop video call with a fictional client shown only as an abstract softly focused figure; Nia keeps a professional smile and Ruby celebrates too early with lifted hands. The lamp and rubber ducks occupy the table.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E04-F10",
      "scene": 7,
      "title": "Reunión a las tres de la mañana",
      "cast": "NR",
      "shot": "Nocturnal wide studio shot",
      "action": "Deep night in the quiet studio, Nia and Ruby startled awake at their desks by an unsolicited glowing blue assistant notification. A wall clock suggests very late night without requiring legible digits; dry visual punchline, no futuristic fantasy.",
      "image": "",
      "status": "por producir"
    }
  ],
  "5": [
    {
      "id": "E05-F01",
      "scene": 1,
      "title": "La foto número 97",
      "cast": "NR",
      "shot": "Medium-wide deadpan photo studio shot",
      "action": "One vivid blue reusable water bottle sits alone on a display plinth, with a wall of near-identical bottle prints behind it. Nia counts on her fingers while Ruby studies the bottle with existential seriousness; exact stylized characters, funny repetition.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E05-F02",
      "scene": 2,
      "title": "El brief de cien fotografías",
      "cast": "NR",
      "shot": "Over-the-desk close two-shot",
      "action": "Nia points at a laptop holding a fictional one-product hundred-photo request while Ruby reacts like she has been asked to climb a mountain; clean prop-styled desk, notebook and bottle in foreground, no legible text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E05-F03",
      "scene": 3,
      "title": "El armario de utilería",
      "cast": "NR",
      "shot": "Dynamic full-body shot",
      "action": "Ruby opens an overflowing studio prop cabinet sending soft fabric swatches, colorful plastic fruit, miniature traffic cones and safe cardboard cubes cascading around her; Nia watches with hands on hips. Exaggerated physical comedy but believable gravity.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E05-F04",
      "scene": 3,
      "title": "El tablero de categorías",
      "cast": "NR",
      "shot": "Wide frontal board shot",
      "action": "Nia organizes a blank whiteboard into five visible sections using colored blocks without words; Ruby adds a handmade miniature imaginary planet on the shelf, Nia catches it with tired eyes. Production planning with clear layout, no text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E05-F05",
      "scene": 4,
      "title": "La botella hero",
      "cast": "none",
      "shot": "High-end product macro studio shot",
      "action": "One cobalt blue reusable bottle photographed heroically on a blue-toned paper background, controlled specular highlights defining the real stainless steel shape, premium commercial photography language within polished stylized 3D; no text or logo.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E05-F06",
      "scene": 4,
      "title": "El tapón actor secundario",
      "cast": "none",
      "shot": "Extreme close-up macro product still",
      "action": "Detailed close-up of the blue bottle's lid, textured seal and rim, soft studio illumination revealing realistic material and precision, clean professional product composition, shallow focus, no humans or logos.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E05-F07",
      "scene": 4,
      "title": "Gotas y textura",
      "cast": "none",
      "shot": "70mm close-up stylized product shot",
      "action": "Water droplets bead on the outside of a cobalt blue reusable bottle against warm neutral background, tiny specular highlights and realistic condensation, beautiful tactile macro image, no floating artifacts, no text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E05-F08",
      "scene": 4,
      "title": "Una montaña en miniatura",
      "cast": "NR",
      "shot": "Wide behind-the-scenes product shot",
      "action": "A blue reusable bottle stands inside a tabletop miniature rocky landscape made of painted cardboard, paper plants and tiny fake gravel; a fan blows a paper leaf toward the camera, Nia instinctively ducks and Ruby admires the scene.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E05-F09",
      "scene": 4,
      "title": "La botella bailarina",
      "cast": "NR",
      "shot": "Medium side view of stop-motion tabletop",
      "action": "Nia and Ruby animate the bottle between sequential positions using a visible careful stop-motion setup and smartphone shutter remote; Ruby acts out the bottle's imagined dance while Nia laughs despite herself. Realistic stop motion production.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E05-F10",
      "scene": 6,
      "title": "La agencia rival",
      "cast": "NR",
      "shot": "Dramatic over-the-shoulder ending shot",
      "action": "At dusk, Nia and Ruby examine a glossy brochure delivered under the studio door, their expressions shift from celebration to uneasy recognition; brochure carries an abstract candle design suspiciously similar to their earlier photos, but no readable slogan.",
      "image": "",
      "status": "por producir"
    }
  ],
  "6": [
    {
      "id": "E06-F01",
      "scene": 1,
      "title": "La campaña demasiado familiar",
      "cast": "NR",
      "shot": "Over-the-shoulder exhibition shot",
      "action": "At a glossy industry mixer, Ruby stands staring at a large fictional candle campaign display with familiar amber lighting; Nia approaches with a tiny canapé. Ruby is visibly shocked, Nia slowly realizes why; elegant crowded gallery behind.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E06-F02",
      "scene": 2,
      "title": "El booth de Almost Original",
      "cast": "NR",
      "shot": "Wide editorial event shot",
      "action": "A rival agency has a very polished, almost absurdly beige trade-show booth, glossy panels and warm lighting; Nia and Ruby stand in vivid blue and sage, contrasting the space. Fictional creative director Beck, stylish and smug, faces them.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E06-F03",
      "scene": 2,
      "title": "El detalle sospechoso",
      "cast": "none",
      "shot": "Extreme close-up of printed design material",
      "action": "Detail of a fictional candle campaign poster: same distinctive warm amber lighting, sculpture and composition as Nia and Ruby's earlier work. A deliberately empty small caption area indicates where typography will be added in post; no actual readable text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E06-F04",
      "scene": 2,
      "title": "Interrogatorio con canapé",
      "cast": "NR",
      "shot": "Medium group shot comedy",
      "action": "Ruby points accusingly at the rival's candle display while Nia gently holds her back with a controlled professional smile; Beck awkwardly escapes holding a comically tiny hors d'oeuvre. Funny facial expressions, elegant event lighting.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E06-F05",
      "scene": 3,
      "title": "El archivo de pruebas",
      "cast": "NR",
      "shot": "Overhead studio evidence desk shot",
      "action": "Nia opens orderly project folders, dated printed drafts and a laptop with abstract file thumbnails; Ruby holds an oversize notebook and pen like a private detective. Natural credible documents with no readable personal information.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E06-F06",
      "scene": 4,
      "title": "La duda de Ruby",
      "cast": "NR",
      "shot": "Intimate 50mm medium two-shot",
      "action": "At their studio late afternoon, Ruby sits on the edge of the table staring at rejected color boards, worried that the rival is better. Nia gently explains something with warm compassionate body language. Understated sincere friendship.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E06-F07",
      "scene": 5,
      "title": "Una llamada profesional",
      "cast": "NR",
      "shot": "Side-by-side laptop call medium shot",
      "action": "Nia speaks calmly to a rival on a video call shown only as a blurred fictional figure, while Ruby sits beside her with a massive comical pen and notebook. Tension and restraint, cool evening screen glow, no readable text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E06-F08",
      "scene": 6,
      "title": "Una clienta abre otra puerta",
      "cast": "NR",
      "shot": "Warm medium-wide studio shot",
      "action": "Mature candle-shop owner visits the studio, showing Nia and Ruby a referral on her phone with blank screen; Nia's eyebrows rise with surprise, Ruby grins. Candle campaign prints on nearby wall, warm light suggesting optimism.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E06-F09",
      "scene": 6,
      "title": "La gran oportunidad",
      "cast": "NR",
      "shot": "Tight two-shot after client leaves",
      "action": "Nia and Ruby freeze in astonishment beside the studio door after receiving an introduction to a major fictional retailer, sunlight cutting across their faces. Ruby clutches a color swatch, Nia holds a notebook, expressive eye contact.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E06-F10",
      "scene": 7,
      "title": "Original mal escrito",
      "cast": "NR",
      "shot": "Playful full-body ending shot",
      "action": "Ruby stands proudly by a new handmade studio sign with a visibly misaligned but intentionally blank sign panel, while Nia reaches up with a marker to correct it; their smiles show comfortable friendship. No generated text; sign wording to be added in editing.",
      "image": "",
      "status": "por producir"
    }
  ],
  "7": [
    {
      "id": "E07-F01",
      "scene": 1,
      "title": "Modo ejecutiva",
      "cast": "N",
      "shot": "Medium mirror portrait shot",
      "action": "Nia in her familiar cobalt blue blazer, white top and wide jeans rehearses a confident corporate pitch in front of a studio mirror, expression forced between determination and panic. A few carefully aligned notes on a table, soft window light.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E07-F02",
      "scene": 1,
      "title": "No entres en pánico",
      "cast": "NR",
      "shot": "Comedic low-angle upshot",
      "action": "From floor level looking up inside the studio, a single blank pale-yellow sticky note is inexplicably stuck to the high ceiling; Ruby smiles proudly and Nia looks up in disbelief. Both faces and full outfits consistent, clean warm light.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E07-F03",
      "scene": 2,
      "title": "Estrategias opuestas",
      "cast": "NR",
      "shot": "Wide over-the-table two-shot",
      "action": "Nia's sleek organized presentation deck lies next to Ruby's playful colored cardboard campaign mockups for fictional retailer Northlight; they point to their respective work and then collaborate at a studio whiteboard, no readable deck text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E07-F04",
      "scene": 3,
      "title": "El lobby gigante",
      "cast": "NR",
      "shot": "Ultra-wide establishing shot",
      "action": "Nia and Ruby sit small beneath towering ceilings in the monumental lobby of a fictional national retailer, elegant sculptural sofas and immense glass walls; Nia sits upright and prepared, Ruby balances a suitcase full of props. Impressive scale, cinematic symmetry.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E07-F05",
      "scene": 3,
      "title": "El patito con carrera",
      "cast": "NR",
      "shot": "Low-angle floor shot near couch",
      "action": "A miniature yellow rubber duck has rolled underneath an expensive lobby sofa. Ruby crawls half beneath the sofa to retrieve it while Nia, standing in cobalt blazer, tries to appear professional; receptionist blurred far behind, subtle comic framing.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E07-F06",
      "scene": 4,
      "title": "El pitch más importante",
      "cast": "NR",
      "shot": "Wide conference-room perspective",
      "action": "Nia and Ruby present their creative campaign to two fictional business leaders across a very long conference table; Nia leads with calm expertise while Ruby holds up a memorable prop. Elegant digital screen with blank abstract graphics, no logos.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E07-F07",
      "scene": 4,
      "title": "Small Things, Big Days",
      "cast": "none",
      "shot": "Cinematic brand concept still",
      "action": "A small household lamp illuminates a child's handmade drawing on a kitchen table just in time for a cozy family celebration. Heartwarming but playful premium 3D animated campaign mockup, practical light and human warmth, no speaking characters or brand text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E07-F08",
      "scene": 5,
      "title": "La pregunta incómoda",
      "cast": "NR",
      "shot": "Tight dramatic reaction two-shot",
      "action": "In the corporate conference room, Nia and Ruby exchange a tense sideways glance after a budget executive questions their ability to scale; Nia keeps her posture professional and Ruby pushes back with conviction, grounded sitcom tension.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E07-F09",
      "scene": 6,
      "title": "La pelea en el ascensor",
      "cast": "NR",
      "shot": "Centered reflective elevator medium shot",
      "action": "Nia and Ruby argue in a shiny elevator with their reflections surrounding them; Nia grips a presentation folder, Ruby clutches her prop suitcase. Their emotional frustration is real but no one is threatening; elevator doors opening to a waiting stranger.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E07-F10",
      "scene": 7,
      "title": "El email a medianoche",
      "cast": "NR",
      "shot": "Intimate night studio medium-wide",
      "action": "Nia and Ruby sit at opposite work desks under warm desk lamps; a new email notification glows on Nia's laptop, faces soften as they realize the big client wants a paid pilot meeting. Ruby's yellow rubber duck peeks out of the proposal folder.",
      "image": "",
      "status": "por producir"
    }
  ],
  "8": [
    {
      "id": "E08-F01",
      "scene": 1,
      "title": "La pared vacía",
      "cast": "NR",
      "shot": "Wide quiet symmetrical frame",
      "action": "A mostly empty creative studio after a difficult day; Nia folds an ivory paper photography backdrop while Ruby removes blank color cards from the inspiration wall. Long shadows, emotional distance, tender adult animation acting.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E08-F02",
      "scene": 2,
      "title": "Presupuesto pausado",
      "cast": "NR",
      "shot": "Tight seated two-shot, shallow focus",
      "action": "Nia holds her phone after a disappointing budget-delay voice message, staring down at an open notebook of expenses; Ruby stands nearby confused and concerned. Soft daylight and uncertain silence in the creative studio, no readable text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E08-F03",
      "scene": 3,
      "title": "La discusión verdadera",
      "cast": "NR",
      "shot": "Over-the-shoulder medium dramatic shot",
      "action": "Ruby stands at the mostly empty inspiration wall explaining why she feels managed instead of heard, Nia sits in her desk chair with a guarded expression; honest vulnerable confrontation, respectful staging, not aggressive.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E08-F04",
      "scene": 3,
      "title": "La cafetera incómoda",
      "cast": "NR",
      "shot": "Comic silent insert shot",
      "action": "A tiny overworked coffee machine sputters on a counter between Nia and Ruby's tense silence; both women glance at it instead of each other, a perfect awkward sitcom pause. Steam harmless, small office objects.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E08-F05",
      "scene": 4,
      "title": "El primer día",
      "cast": "NR",
      "shot": "Warm nostalgic flashback medium-wide",
      "action": "Same small creative studio on opening day, barely furnished, Nia and Ruby sharing one inexpensive sandwich on the floor beneath a handmade studio sign; afternoon golden light, joy and uncertainty, retain exact facial features and base outfits.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E08-F06",
      "scene": 5,
      "title": "Las tres prioridades",
      "cast": "NR",
      "shot": "Wide hopeful studio shot",
      "action": "Nia draws three clear sections on a whiteboard using abstract color blocks without text; Ruby adds a small cheerful doodle to the corner. Both lean in together, working collaboratively toward a more sustainable creative business.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E08-F07",
      "scene": 5,
      "title": "Nuestra propia serie",
      "cast": "NR",
      "shot": "Overhead creative desk perspective",
      "action": "A tablet shows a rough cartoon sketch of Nia and Ruby's own studio; a blank new folder is open on the laptop, Ruby excitedly draws a concept while Nia plans the production calendar with affectionate skepticism. Text added later in editing.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E08-F08",
      "scene": 6,
      "title": "Una llamada inesperada",
      "cast": "NR",
      "shot": "Warm medium close-up two-shot",
      "action": "Nia and Ruby listen together to a voicemail from the familiar mature candle-shop client offering a new bookstore campaign, their expressions shift to hopeful relief. The afternoon light softens, phone display blank, no text.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E08-F09",
      "scene": 7,
      "title": "El abrazo y el trato",
      "cast": "NR",
      "shot": "Emotional medium full-body shot",
      "action": "Nia and Ruby in the now-organized studio try to shake hands like business partners but Ruby pulls Nia into an affectionate impulsive hug. Nia is surprised, then smiles, paper backdrop and repaired equipment behind them.",
      "image": "",
      "status": "por producir"
    },
    {
      "id": "E08-F10",
      "scene": 8,
      "title": "El principio de otra temporada",
      "cast": "NR",
      "shot": "Very low camera-on-floor point of view looking almost straight up",
      "action": "A deliberate echo of Episode 1: Nia and Ruby lean above a newly secured tripod and look into the lens with triumphant mischievous expressions; warm studio ceiling, one tiny rubber duck visible, new possibilities. Clear frame for final season-freeze comic moment.",
      "image": "",
      "status": "por producir"
    }
  ]
};
export function getYouTubePhotoPrompt(photo:YouTubePhoto):string {
 const character=photoStyles.descriptions[photo.cast as keyof typeof photoStyles.descriptions]||photoStyles.descriptions.none;
 const styling=wardrobeForShot(photo.id,photo.scene,photo.cast);
 return [
 photoStyles.sharedStyle,
 'CHARACTER REFERENCE AND FACIAL CONTINUITY: '+character,
 'OUTFIT / HOLIDAY / SET CONTINUITY: '+styling.details,
 'SHOT ID: '+photo.id+'. Scene '+photo.scene+'. '+photo.title+'.',
 'CAMERA: '+photo.shot+'.',
 'STAGING AND ACTION: '+photo.action,
 'LIGHTING AND QUALITY: intentional light matching time of day and scene mood, believable eyes and hands, cinematic depth of field, refined controlled palette and sharp focal point.',
 'FRAME: one horizontal 16:9 still, complete scene composition with essential props visible.',
 photoStyles.neg
 ].join('\n\n');
}
export const youtubeVisualStats={ episodes:8,framesPerEpisode:10,baseFrames:80,seasonalExtras:8,totalFrames:88 } as const;

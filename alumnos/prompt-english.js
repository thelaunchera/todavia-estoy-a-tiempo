import {promptGuide} from './prompt-guide.js';
/* English equivalents of the original 12 core + 12 module prompts.
   Adaptations preserve learning objectives; original Spanish remains available. */
const core={
 idea:["Clarify your business idea","Act as a small-business research partner. My business is [BUSINESS] and my product/service is [OFFER]. Interview me one question at a time to identify what I really sell, the ideal customer, the problem it solves, the realistic benefit, proof I can show, and the next action the visitor should take. Then produce a brief business summary and a checklist of missing facts. Do not invent prices or claims."],
 cliente:["Understand your ideal customer","Analyze the likely needs of a customer considering [PRODUCT OR SERVICE] in [CITY OR ONLINE MARKET]. What questions should the website answer before they contact me, book or buy? Distinguish verified information from assumptions. Ask me for unknown facts and deliver five priority questions, a recommended website goal and one clear CTA."],
 estructura:["Plan your website sections","For [BUSINESS], organize a simple mobile-first website that solves [MAIN CUSTOMER NEED]. Choose only essential sections: short hero, offer/product details, proof, process, FAQs and relevant action. For each section tell me its purpose, exact photo needed, a human-sounding title and the next step. Avoid empty cards, generic filler or unnecessary pages. Prioritize 375 px width."],
 referencias:["Define visual direction","Help me turn my references [LINKS OR DESCRIPTIONS] into an original mood board for [BUSINESS]. Recommend a distinct palette, typography hierarchy, photographic tone, composition, image crops and packaging direction where applicable. Explain what to keep consistent. Never copy another brand, logo or imagery."],
 imagenes:["Prepare consistent photography","Create a photo plan for [BUSINESS]. List exactly which individual photographs my hero, products/services, story, packaging and footer need. For each: scene, subject, lighting, crop, intended section and file name. Preserve all facts about actual products and avoid making up details. Generate ONE image per prompt; no grids, collages or baked-in promotional text."],
 hero:["A clear hero in five seconds","Rewrite the hero for [BUSINESS] and [IDEAL CUSTOMER]. In the first five seconds explain what it offers, who it serves, why it matters and what to do next. Provide one eyebrow, headline, support sentence, suitable approved photograph and ONE primary CTA. Keep readable above the fold on 375 px. Never use claims the business cannot verify."],
 copy:["Write each website section","Write warm, modern, concise website copy for [BUSINESS] from these verified facts: [FACTS]. The audience is [CUSTOMER], the site objective is [GOAL]. Deliver a heading, two short sentences and one relevant action per necessary section. Separate products, services, reservations and quote requests appropriately. No fake reviews, years of experience or promises."],
 construccion:["Build a first website draft","Build a new responsive page for [BUSINESS] with the approved brand board [COLORS, FONTS], approved copy [TEXT] and named image assets [FILES]. Start mobile-first: semantic header, still-photo hero, essential content, one clear CTA, contact section and accessible footer. Add one section at a time and show changes before moving on. Keep buttons consistent, do not change working payments or invent contact information."],
 formularios:["Contact and bookings that actually work","For [BUSINESS], decide whether visitors should request a quote, contact us, choose a booking, or buy. Design the smallest form that collects only information needed, with clear labels, consent and confirmation. Explain where submissions go, how to test delivery, spam checks and privacy. Never claim that forms work until a safe test succeeds."],
 pagos:["Test checkout versus real payments","Explain whether [BUSINESS] needs checkout at all. Contrast an inquiry, quote, booking and paid digital/physical order. If checkout fits the business and product is allowed by the provider, map test mode, currency, confirmations, errors, fulfillment and privacy. Do not charge real cards or store credentials in prompts. Never claim payment success from a thank-you page alone."],
 movil:["Review your mobile website","Inspect [URL OR SCREENSHOTS] at 375 px. Check text contrast and sizes, horizontal overflow, cards, buttons, cropping, menu behavior, photos, form labels and the one main CTA. Fix the highest-impact issue first, retest and keep the established brand. If you cannot access the live site, clearly say which checks are still pending."],
 auditoria:["Audit before publishing","Review [URL OR PROJECT] for truthfulness, design, usability, accessibility and operational readiness. Check every photo, contact link, form, privacy notice, footer, CTA and checkout if used. Identify the ten most important fixes in priority order, apply only safe changes you can actually make, then list what was verified versus what remains untested."]
};
const modules={
 m00_elige_proyecto:["Choose a business for practice","I am learning to build my first website. Help me choose my own business or a clearly fictional practice business. Ask about what it offers, who it serves, what facts I know and what still needs verification. Build a short project brief with audience, goal, main CTA, products/services and unanswered questions. Do not design anything yet."],
 m01_diagnostico_propio:["Research MY business needs","Act as a business analyst. I own [BUSINESS] in [LOCATION]. Interview me to determine whether my biggest need is visibility, leads, bookings, quotes, online sales or customer follow-up. Map customer problems, facts, current workflow and constraints. Recommend the minimum website structure and one measurable next action. Ask before assuming or inventing information."],
 m01_investiga_otros:["Research ANOTHER business before offering a site","I want to help a different business: [INDUSTRY], [CITY], [KNOWN FACTS]. Research what a customer needs before ordering from it. Distinguish visibility, reservations, quotes and ecommerce. Write interview questions for the actual owner, a proposed site structure and a checklist of details that MUST be confirmed before design. Never present guesses as facts."],
 m02_moodboard:["Create my brand mood board","Based on the business need [GOAL], customer [AUDIENCE] and existing identity [LOGO, COLORS], propose one original editorial mood board. Include a restrained palette, title/body type styles, lighting, textures, visual references, image roles and packaging style when relevant. Explain why it fits the business and how to keep future photos consistent. This is a planning reference, not a final product image."],
 m03_plan_fotos:["Plan one photo for each website section","For [BUSINESS], create a photo shot list for every necessary section: hero, offer/service cards, product details, gifting/packaging, story and contact. For each shot write its purpose, composition, location, format, product attributes, file name and upload destination. Avoid photos that don't answer an actual customer question. Keep one scene per file."],
 m03_foto_individual:["Generate ONE individual photo","Generate ONE high-quality photographic image for [BUSINESS], showing exactly [SUBJECT] in [SCENE], intended for [WEBSITE SECTION]. Use realistic lighting, honest materials and anatomy, appropriate lens and enough safe space for a layout crop. Preserve any reference product, logo and packaging exactly. NO collage, grid, text overlay, other products or watermark. Return one image only."],
 m03_empaque:["Show physical product packaging accurately","For my real product [PRODUCT], design an editorial photography brief showing approved packaging [BOX, LABEL, BAG]. Preserve actual branding, size, colors and claims. Recommend one overall packaging shot and separate detail shots for [SECTION]. If I have no real packaging yet, label it clearly as a concept and do not present it as a shipped product."],
 m04_textos_objetivo:["Write for the customer's real goal","Write short, clear copy for [BUSINESS] based on verified facts [FACTS] and objective [VISIBILITY / QUOTES / BOOKINGS / SALES]. Specify the hero promise, main CTA, product or service descriptions, process, FAQ and footer copy. Do not create fake reviews, claims, operating hours, prices, payment methods or legal statements."],
 m05_poner_fotos:["Place each approved photo in its correct webpage section","Using these real files [FILE NAMES AND WHAT EACH SHOWS], place each photo in the correct section of [WEBSITE]. Use a still hero, named product/service cards, relevant packaging photos and one story photo. Preserve aspect ratios, avoid broken paths, prevent cropping important subjects and use meaningful alt text. Check each image on 375 px and desktop. Never randomly reuse the same image in unrelated sections."],
 m06_corrige_movil:["Fix mobile design step by step","Review [URL OR PROJECT] on a 375 px viewport. Find issues in navigation, text, photo crops, cards, spacing, buttons and forms. Fix them one by one without breaking desktop or working functionality. Show what changed and retest. Do not claim an iPhone test if you only reviewed code."],
 m07_checkout:["Does my business truly need a checkout?","Analyze [BUSINESS] and decide whether the correct user journey is a paid checkout, request for quote, appointment booking, contact form or free download. Explain tradeoffs and pick the simplest appropriate approach. If payment is necessary, include provider eligibility, test mode, confirmation, failure handling, data minimization and fulfillment. Never collect a live payment in a demo."],
 m08_publica:["Review and share my first webpage","Audit the finished [WEBSITE URL] against the original business goal [GOAL]. Verify its mobile hero, sections, images, contact paths, accessible buttons, privacy/footer, forms and checkout only where relevant. Separate confirmed tests from tasks still outstanding. Give me a short launch checklist and a safe project-sharing summary."]
};
const mobile=[
 ["A five-second mobile hero","At a 375 px width, redesign my hero so the visitor immediately understands what [BUSINESS] offers, for whom, why it matters and what to tap next. Use one clear headline, a short supporting sentence, an honest photo and one primary CTA. Keep all elements above the fold where practical. Do not invent claims or change working functionality."],
 ["Mobile-first redesign","Redesign [WEBSITE] for one clear column on a 375 px phone. Keep body text readable, make primary controls comfortable to tap, prevent overflow, crop real photos carefully and preserve a coherent editorial brand. Do not change checkout or user data. Verify what you can actually inspect."],
 ["Top ten visual issues","Audit [WEBSITE] at 375 px for type, contrast, spacing, alignment, crops, card density, CTA clarity and touch accessibility. Rank ten high-impact issues, fix them if you have project access and retest. Never claim a real device test without having done it."],
 ["Fix empty cards and cropped photos","Find empty or oversized cards, disappearing images, overflow, confusing flips and excessive whitespace in [WEBSITE] on mobile. Ensure each card shows its actual image, clear name, useful description and appropriate action without tapping to reveal content. Confirm real image URLs."],
 ["375 px final QA","At 375 px test the hero, menu, every image, cards, forms, links and CTA of [WEBSITE]. Look for horizontal scrolling, clipping, overlaps and broken paths. Do not submit real forms or payments. Report what passed, what you fixed and what remains unverified."]
];

/* English educational adaptations of approved example steps. The source briefs
   stay private in Supabase; never display Spanish briefs on the English view. */
const demoStages={"casa-brownie":[["Start from a blank page","Plan a fictional brownie website and outline its sections before adding visuals."],["Brand identity and navigation","Set up a clean header, brand name and simple navigation."],["One static hero photo","Build the opening section around one still brownie photograph, readable text and a clear CTA."],["Six individual product photos","Prepare six distinct brownie flavor images, one file per flavor."],["Product banner and catalog","Arrange the six brownie items with clear names and accurate mock content."],["Editorial gifts and double banner","Show gift packaging with two individual photos and a cohesive gift section."],["Brand story and fictional location","Write an honest practice-site story and label any example location as fictional."],["Illustrative delivery information","Explain a possible delivery experience without implying real fulfillment."],["Demo cart interactions","Design sample interactions without placing orders or charging money."],["Footer and attribution","Add an accessible footer, relevant links and clear practice-project credits."],["Compare the result with screenshots","Audit mobile and desktop against the approved reference without recreating unrelated parts."],["Optional animated hero bonus","Explore an optional hero-video concept only after the static experience works."]],"crumb":[["Start with a blank website","Prepare the fictional cookie brand's site structure and core information."],["Photo brand board with 14 scenes","Plan 14 separate scenes for products, storefront, gifting and behind-the-scenes content."],["Complete header and hero","Build an editorial header and an opening section with one approved hero photo."],["Six individual catalog photos","Use individual photos for six cookies without repeats or collage layouts."],["Cookie flavors and labels","Build an accurate display of six flavors with illustrative labels and approved pricing."],["Gift boxes and packaging","Create a gifting section that explains presentation and uses the approved images."],["Inside the brand gallery","Create a concise image gallery that explains the product and atmosphere."],["Interactive build-your-box demo","Sketch an interactive sample box builder with clear states and no real charges."],["Illustrative Miami location","Label the location as a concept, never as a real GPS-verified storefront."],["Editorial storytelling banners","Build two brand-story banners without hiding key product information."],["Footer and sample contact links","Show a complete footer with clearly non-operational example links where necessary."],["Responsive review and final QA","Check mobile and desktop, image paths, touch controls and approved copy."]],"aftr":[["Afterglow-inspired visual direction","Plan an original nightlife visual identity and brand board."],["Eight separate nightlife photos","Prepare distinct photos for the club, VIP, entrance, DJ, dancefloor and tickets."],["Hero, navigation and age gate","Sketch the opening experience and a clear 21+ access notice."],["Event schedule and weekly lineup","Present sample event information in a readable editorial format."],["VIP tables and guest list","Explain example VIP experiences and guest list flows without fake reservations."],["Tickets and final QA","Review sample ticket interactions, mobile responsiveness and age messaging."]],"soluna":[["Research and visual concept","Plan the goals, positioning and original visual direction of a yoga practice site."],["Brand identity and visual rules","Define typography, colors, photography and consistent layout rules."],["Eight individual yoga photographs","Plan eight distinct editorial photos for the hero, studio, classes and reception."],["Launch hero and primary CTA","Build a clear opening screen with one honest call to action."],["Launch offer and class experiences","Present the example promotion and clearly described classes without misleading claims."],["Studio details and location","Show the studio experience and illustrative location information."],["Memberships without sample charges","Outline sample memberships without pretending to process payments."],["Waitlist, privacy and QA","Design a truthful waitlist and test its consent, confirmation and mobile display."],["Publish and compare","Review a version-controlled publication and compare it with the approved preview."]]};

const demoPhotoSteps={
 'casa-brownie':{
  2:['Static hero brownie photo'],
  3:['Classic brownie','Chocolate and walnut brownie','Dulce de leche brownie','Raspberry brownie','Cookies and cream brownie','Special edition brownie'],
  5:['Gift box with pink ribbon','Gift bags and boxes']
 },
 crumb:{
  1:['Cookie brand mural','Open six-cookie box','Cookie lifestyle photograph','CRUMB storefront','Classic chocolate chip cookie','Double chocolate cookie','Salted caramel cookie','White chocolate raspberry cookie','Nutty dream cookie','Brownie chip cookie','Preparing cookie dough','Closed gift box','Kraft cookie bag','Baker with a tray'],
  2:['CRUMB opening hero photograph']
 },
 aftr:{1:['Main nightclub','VIP lounge','Entry corridor','Fashion portrait','DJ booth','Bottle service','Dancefloor','Ticket detail']},
 soluna:{2:['Yoga hero still life','Studio exterior','Empty studio interior','Group yoga class','Slow Flow class','Deep Rest class','Morning Ritual class','Reception flowers']}
};
export function englishDemoPhotoTitle(code,title=''){
 const match=/^demo-photo_(.+)_(\d+)_(\d+)$/.exec(String(code));
 if(match)return demoPhotoSteps[match[1]]?.[Number(match[2])]?.[Number(match[3])]||'Photo '+(Number(match[3])+1);
 return title||'Photo';
}

export function englishDemoTitle(code,title=''){
 const m=/^demo_(.+)_(\d+)$/.exec(String(code));
 if(m)return demoStages[m[1]]?.[Number(m[2])]?.[0]||'Website example · Step '+(Number(m[2])+1);
 const p=/^demo-photo_(.+)_(\d+)_(\d+)$/.exec(String(code));
 if(p)return 'Photo example · '+(Number(p[3])+1);
 return title||'Website example';
}
export function englishDemoStep(code,brand=''){
 const m=/^demo_(.+)_(\d+)$/.exec(String(code));
 if(m){
  const desc=demoStages[m[1]]?.[Number(m[2])];
  const task=desc?.[1]||'Build only the named part of this website, keeping existing approved information and images.';
  return 'PRACTICE BRIEF — '+(brand||'Example website')+'\n\n'+
   'Task: '+task+'\n\n'+
   'Use the existing approved brand board, exact reference images and verified business details. Work on ONE section at a time. Do not copy another brand, invent prices, accept real payments or claim untested functions work. Show the updated section and explain what changed before proceeding.';
 }
 const p=/^demo-photo_(.+)_(\d+)_(\d+)$/.exec(String(code));
 if(p){
  // The photo index belongs to its parent step, not to the full demo gallery.
  const subject=englishDemoPhotoTitle(code);
  return 'INDIVIDUAL PHOTO PRACTICE — '+(brand||'Example website')+'\n\n'+
   'Create ONE high-resolution editorial photo of '+subject+'. Match the supplied approved reference, materials, brand and lighting. Keep proportions and real product details accurate, leave useful crop space, and return ONE photo file only. No collage, invented labels, text or watermark. Check the image before using it on the website.';
 }
 return '';
}

export function englishTitle(code,defaultTitle=''){
 if(core[code])return core[code][0];
 const guide=promptGuide(code,'en');if(/^freebie_1photo8_/.test(String(code)))return guide.name;
 if(String(code).startsWith('demo_')||String(code).startsWith('demo-photo_'))return englishDemoTitle(code,defaultTitle);
 if(modules[code])return modules[code][0];
 if(/^mobile_[1-5]$/.test(code))return mobile[Number(code.slice(-1))-1][0];
 return defaultTitle;
}
export function localizedPrompt(code,original,lang='es',demoTitle=''){
 const body=String(original||'');
 if(body.includes('[[ES]]')&&body.includes('[[EN]]')){
  const es=body.split('[[ES]]')[1].split('[[EN]]')[0].trim();
  const en=body.split('[[EN]]')[1].trim();
  return lang==='en'?en:es;
 }
 if(lang!=='en')return body;
 if(core[code])return core[code][1];
 if(modules[code])return modules[code][1];
 if(/^mobile_[1-5]$/.test(code))return mobile[Number(code.slice(-1))-1][1];
 if(code.startsWith('demo_')||code.startsWith('demo-photo_'))return englishDemoStep(code,demoTitle);
 return body;
}

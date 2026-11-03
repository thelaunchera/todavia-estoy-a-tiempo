/* Practical English pages for the course's built-in material tabs.
   Every section is educational and describes only capabilities verified in class. */
const guides={
 inicio:{kicker:'START HERE',title:'Before you build, understand your idea.',intro:'You do not need coding experience. Start by choosing a business and a single visitor action.',steps:[
 ['Choose one business','Use your own business or a clearly fictional practice project. Write what it offers and where it operates.'],
 ['Research the real need','Does the owner want more visibility, contact inquiries, bookings, estimates or online sales? Ask before deciding.'],
 ['Make a simple brief','Write the ideal customer, the offer, the main benefit, the primary CTA and the facts you still need to confirm.'],
 ['Plan the visual system','Create a brand board and list individual photos for each section before building your site.'],
 ['Build, test, then publish','Create one section at a time. Test the real links, readability and safe customer journey.']
 ],actions:[['Start my prompt library','prompts'],['Plan my webpage','pasos']]},
 funciona:{kicker:'HOW A WEBSITE WORKS',title:'How your website really works.',intro:'A good-looking webpage is only one part. Plan what happens when somebody clicks the main action.',steps:[
 ['Page structure','Hero, offer, helpful proof, process, FAQs, contact and footer are common building blocks. Use only the ones your business needs.'],
 ['Contact and quote requests','A form should collect minimum necessary data, explain consent and send a confirmation after a safe test.'],
 ['Bookings and calendars','If the business uses appointments, make duration and availability clear and verify how the owner is notified.'],
 ['Online checkout','Only add payments if the product and provider support them. Test payment, failure and fulfillment before claiming it works.'],
 ['Owner operations','Quotes, jobs and follow-up are internal workflows; a public demo must not expose private business or customer data.']
 ],actions:[['Investigate my business','prompts']]},
 pasos:{kicker:'BUILD YOUR WEBSITE',title:'Build step by step.',intro:'Use Casa Brownie as a reference while you build ONE website of your own. Finish your first project before starting another.',steps:[
 ['01 — Define the goal','Research your business and ideal customer. Write what the site is for and the one action a visitor should take.'],
 ['02 — Mood board','Choose an original palette, typography, photographic tone and packaging direction if needed.'],
 ['03 — Prepare photos in Google Drive','Create each image with ChatGPT and ask to send it directly to the 02_PHOTOS folder in Drive if uploads are supported. Do not save it to your personal Photos gallery.'],
 ['03B — Check your backup','If a direct Drive upload is unavailable, use Share or a temporary file in Files, then upload through the Drive app. Open each image from Drive before removing its temporary local copy. Connecting Drive never uploads or deletes photos automatically.'],
 ['04 — Write your content','Create a five-second hero, products/services, relevant process, FAQs and CTA, using verified facts.'],
 ['05 — Build in AppDeploy','Open a blank project and build one section at a time. Upload the correct images to the correct paths.'],
 ['06 — Review mobile first','Check 375 px, phone tap targets, photo cropping, empty cards, form labels and responsive layout.'],
 ['07 — Set up the next step','For a real business, test contact, booking, quote or payment flows only when appropriate. Do not collect payments in the practice demo.'],
 ['08 — Test and share','Verify links, forms, footer and public access. Keep a record of what passed and what remains untested.']
 ],actions:[['Copy the building prompts','prompts']]},
 organizacion:{kicker:'KEEP YOUR FILES ORGANIZED',title:'Organize your entire project.',intro:'Work on ONE website at a time until you feel confident. Keep its photos, prompts and text in a dedicated Google Drive folder so you do not mix files from different businesses.',steps:[
 ['CONNECT GOOGLE DRIVE','In ChatGPT, open Settings → Plugins (or Apps), find Google Drive, connect your Google account, and review permissions. If direct saving is supported, ask ChatGPT to send each generated image into Drive → 02_PHOTOS.'],
 ['ONE PROJECT','In the Google Drive app tap + New → Folder. Name it after your first website, and keep only that business’s files inside.'],
 ['00_IDEA','Business goal, ideal customer, real facts and unknown details.'],
 ['01_TEXTS','Headlines, CTA copy, service descriptions, FAQs and confirmations.'],
 ['02_PHOTOS','Keep generated images in Drive rather than your personal photo gallery. Request a direct Drive upload if supported. Otherwise share the generated file to Drive, or temporarily save it in Files and upload through the Drive app. Check the uploaded file before deleting the temporary copy. Use names like hero_01 and product_01.'],
 ['03_PROMPTS','Save the precise prompt used for each photo and each construction step.'],
 ['04_DESIGN','Mood board, visual references, colors and font choices.'],
 ['05_WEB','Website URLs and snapshots of each successful section.'],
 ['06_TESTS','Mobile screenshots, form/booking tests and remaining QA.'],
 ['07_COSTS','Document actual provider costs only when applicable; never guess prices.']
 ],actions:[['Open prompts','prompts']]},
 mara:{kicker:'YOUR PROJECT BRIEF',title:'Prepare your own web assistant.',intro:'Use the assistant as a guide to ask questions, not as a replacement for factual business research.',steps:[
 ['Describe the business','Supply its actual name, city or online market, offer and ideal customer.'],
 ['Define what success means','Visibility, inquiries, booking requests, quotes or verified checkout.'],
 ['Agree on visual direction','Give your mood board, real references and approved photo list.'],
 ['Create one screen at a time','Request a new hero or section; review it before continuing.'],
 ['Ask for evidence','Require specific tests and clearly distinguish completed work from untested suggestions.']
 ],actions:[['Research prompts','prompts']]},
 make:{kicker:'OPTIONAL AUTOMATIONS',title:'Understand a simple Make workflow.',intro:'A free-tier workflow can be a learning exercise; actual limits and connected services depend on your account.',steps:[
 ['Choose one purpose','Example: a legitimate inquiry form sends an owner notification and an acknowledgment.'],
 ['Check account permissions','Connect only your own approved accounts and review the scopes before authorizing any service.'],
 ['Define the trigger','A new inquiry or verified order is not the same as a page visit.'],
 ['Verify data and consent','Only transfer fields needed to provide the service; avoid exposing private information.'],
 ['Test and handle failures','Try a test submission, check email receipt, errors and duplicates. Do not turn on real charges while practicing.']
 ],actions:[['Automation planning prompts','prompts']]},
 conectores:{kicker:'TOOLS AND CONNECTIONS',title:'Connect tools without programming.',intro:'Some apps or plugins may not be available on every device or plan. Use the available alternatives without promising a connection you cannot verify.',steps:[
 ['ChatGPT','Use prompts for research, copy, image planning and explanations. Keep passwords and client secrets out of chats.'],
 ['AppDeploy','If available, open your project, apply one section prompt and test the preview before continuing.'],
 ['Gmail and Make','Where available, a tested form can send a confirmation or owner notification. Confirm scopes and message delivery.'],
 ['Payment provider','Only connect a supported provider for an eligible real business after testing its checkout.'],
 ['Troubleshooting','Document the exact error and what was tested. Never paste API keys or recovery codes into public materials.']
 ],actions:[['Copy an audit prompt','prompts']]},
 seguridad:{kicker:'KEEP YOUR ACCOUNT SAFE',title:'Keep your site and customers safe.',intro:'A professional website protects the owner, the visitor and their private information.',steps:[
 ['No secrets in prompts','Never paste passwords, API keys, one-time verification codes or customer records.'],
 ['Minimal data','Ask visitors only for information the business truly needs and explain how it will be used.'],
 ['Only your own access','Work in your account. Never use a client login or copy their private materials without permission.'],
 ['Protected payment flows','Payment verification must come from a trusted provider, not only a thank-you screen.'],
 ['Owner-only areas','Admin screens, student purchases and customer data must be checked server-side.'],
 ['Recover safely','Use official password recovery and verify access from the actual browser and device.']
 ],actions:[]},
 legal:{kicker:'FOOTER AND LEGAL PAGES',title:'Finish the legal and contact details.',intro:'Requirements depend on country, activity and actual data usage. Templates do not replace appropriate legal guidance.',steps:[
 ['Business identity','Display the actual business name and verified contact details.'],
 ['Contact and hours','Publish only confirmed email, location, availability and contact methods.'],
 ['Privacy information','Explain what visitor information is collected, why and how it is used.'],
 ['Terms and refund policies','Include applicable terms for the actual product, booking or sale. Do not invent legal guarantees.'],
 ['Cookie controls','If tracking or cookies are used, provide appropriate notices and controls.'],
 ['Functional links','Tap each footer link on mobile and confirm it opens the promised page.']
 ],actions:[['Open launch checklist','revision']]},
 ejemplo:{kicker:'WEBSITE EXAMPLE',title:'Study one finished example.',intro:'Casa Brownie is a fictional educational bakery, not a live shop. Use its photography and layout as a reference while building your own site.',steps:[
 ['Hero','A still photo and a clear headline explain the offer without pretending to sell online.'],
 ['Flavor cards','Six individual brownie photos illustrate why one image per product matters.'],
 ['Gifting','Packaging photos demonstrate the difference between product shots and gift presentation.'],
 ['Story and process','Short editorial copy explains the concept and what a visitor can expect.'],
 ['Footer and safe actions','Every button should be truthful. The demo does not receive real orders or collect payments.'],
 ['Mobile review','Compare hero, image crops, card sizes and links on 375 px before changing your own site.']
 ],actions:[['Open photo and prompt gallery','inspiracion']]}
};
export function renderEnglishMaterialGuide(content,view,onGo){
 const data=guides[view];if(!data)return false;
 const heading=document.createElement('header');heading.className='mi-section-head';
 const eyebrow=document.createElement('span');eyebrow.className='mi-eyebrow';eyebrow.textContent=data.kicker;
 const title=document.createElement('h3');title.textContent=data.title;
 const intro=document.createElement('p');intro.textContent=data.intro;
 heading.append(eyebrow,title,intro);content.append(heading);
 const list=document.createElement('div');list.className='mi-start-steps';
 for(const [i,[stepTitle,body]] of data.steps.entries()){
  const card=document.createElement('article');card.className='mi-step';
  const badge=document.createElement('span');badge.textContent=String(i+1).padStart(2,'0');
  const h4=document.createElement('h4');h4.textContent=stepTitle;
  const p=document.createElement('p');p.textContent=body;
  card.append(badge,h4,p);list.append(card);
 }
 content.append(list);
 if(data.actions.length){
  const actions=document.createElement('div');actions.className='mi-actions';
  for(const [label,target] of data.actions){
   const b=document.createElement('button');b.type='button';b.className='mi-primary';
   b.textContent=label;b.addEventListener('click',()=>onGo?.(target));actions.append(b);
  }
  content.append(actions);
 }
 return true;
}

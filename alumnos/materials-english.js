/* Bilingual translations for students' interactive workbook and QA.
   Keys stay unchanged so student data remains private and persistent. */
export const workbookEn=[
 {title:'Your offer',sub:'Explain exactly what you do and who it helps.',qs:[['What exactly are you selling?','E.g. a made-to-order box of 12 cookies'],['Who is it for?','E.g. someone shopping for a thoughtful gift'],['What does the customer get?','E.g. assorted box and message card']]},
 {title:'Pricing & delivery',sub:'Do not promise details that have not been confirmed.',qs:[['How much does it cost or how do you quote?','Price, currency or quote request method'],['How and when will you deliver?','Pickup, shipping, download or response'],['What must customers know before ordering?','Lead time, availability, changes and terms']]},
 {title:'Your references',sub:'Study references without copying their words or pictures.',qs:[['First reference and what it teaches you','Paste link and summarize the learning'],['Second reference and what it teaches you','E.g. how they present products'],['Third reference and what it teaches you','E.g. the clarity of their main CTA']]},
 {title:'Visual style & photos',sub:'A consistent direction is better than too many effects.',qs:[['What palette and atmosphere fit your business?','E.g. ivory, powder blue, soft daylight'],['What should the main hero photo show?','Describe a real product or service'],['Which other two images do you need?','A wide shot and a useful detail']]},
 {title:'Your website copy',sub:'Write what the visitor needs to understand.',qs:[['Your main headline in clear language','E.g. Handmade cookies made for gifting'],['Three concrete things you actually offer','What is included, how it works and why it helps'],['Two questions your customer needs answered','E.g. How much notice do I need?']]},
 {title:'Build & mobile',sub:'Make a version that works on a phone.',qs:[['Link to your current draft','Public URL when available'],['Which sections have you completed?','Hero, products, process, contact'],['What did you fix on mobile?','Text size, crop or button layout']]},
 {title:'CTA & fulfillment',sub:'Make the next step clear before anyone taps.',qs:[['What does your main button say?','Request information, Book a call or Shop'],['Where does it lead?','Contact, quote, booking or verified checkout'],['What confirmation appears afterward?','Email, confirmation, delivery or response']]},
 {title:'Your final review',sub:'One verified improvement is worth more than guesses.',qs:[['What did you test and see working?','Describe the actual test result'],['What will you fix first?','One specific issue'],['What screenshots will you share?','Mobile hero, page, CTA and destination']]}
];
export const checksEn=[
 ['Your offer is clear','Ask someone to read your first screen and explain what you sell.','They can describe your offer and who it is for.'],
 ['Your facts are verified','Check your name, price, descriptions, hours and availability.','No unconfirmed claims appear as facts.'],
 ['It reads on a phone','Open the real site on your phone and navigate each section.','No pinching, zooming or landscape rotation is required.'],
 ['Photos are accurate','Review crop, size, ownership and actual product details.','Images are not distorted or invented.'],
 ['The CTA works','Open the public page in private browsing and tap the main CTA.','The button performs its advertised action.'],
 ['Forms deliver','Send a safe test submission from a different email.','The message arrives and you know how to reply.'],
 ['The payment provider is eligible','Check the provider’s rules for your product and location.','Provider support for the product is confirmed.'],
 ['Test payment succeeds','If relevant, safely test amount, currency, confirmation and failure in test mode.','A success page alone is not treated as proof of a completed charge.'],
 ['Confirmation explains the next step','Read what the visitor sees after purchase, booking or inquiry.','They understand what happens and when.'],
 ['Fulfillment is tested','Test the sample email, download, response or booking delivery.','You know what to do if it fails.'],
 ['The link works for outsiders','Use another browser or a private window.','The intended public visitor can open it.'],
 ['Contact and help are clear','Test contact links and relevant terms.','People can reach the business without guessing.'],
 ['Your announcement matches the offer','Write a brief message with the real offer, audience and link.','The announcement accurately describes the website.'],
 ['Your next post helps','Explain how something works or answer a common question.','Content is useful without fabricated reviews.'],
 ['You measure facts','Record verified inquiries, bookings or payments if applicable.','You do not confuse views with sales.'],
 ['You know the next fix','Identify the highest-impact issue affecting clarity or functionality.','You have one concrete change to test.']
];
export function translateWorkbookBlocks(blocks,lang='es'){
 if(lang!=='en')return blocks;
 return blocks.map((b,i)=>({ ...b,
  title:workbookEn[i]?.title||b.title,sub:workbookEn[i]?.sub||b.sub,
  example:i===0?'Example: I sell handmade cookies by preorder.':undefined,
  qs:b.qs.map(([key,title,placeholder],j)=>[key,workbookEn[i]?.qs[j]?.[0]||title,workbookEn[i]?.qs[j]?.[1]||placeholder])
 }));
}
export function translateCheckItem(item,i,lang='es'){
 if(lang!=='en'||!checksEn[i])return item;
 return {...item,name:checksEn[i][0],how:checksEn[i][1],done:checksEn[i][2]};
}

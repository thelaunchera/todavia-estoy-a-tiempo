import { PDFDocument, PDFArray, PDFDict, PDFRef, PDFNull, rgb } from 'npm:pdf-lib@1.17.1';
import fontkit from 'npm:@pdf-lib/fontkit@1.1.1';
import { FONT_BASE64 } from './font.ts';

export async function personalize(bytes: Uint8Array, name: string, product: string, kind: string) {
  const pdf = await PDFDocument.load(bytes);
  // The approved source has a free, unused XObject reference. Make it an explicit
  // null object so Apple/PDF readers do not report an absent cross-reference entry.
  const visited = new Set();
  function repair(object: any) {
    if (object instanceof PDFRef) {
      if (pdf.context.lookup(object) === undefined) pdf.context.assign(object, PDFNull);
      return;
    }
    if (!object || visited.has(object)) return;
    visited.add(object);
    if (object instanceof PDFDict) for (const [key, value] of object.entries()) {
      if (key.toString() === '/XObject') {
        const resources=pdf.context.lookup(value);
        if (resources instanceof PDFDict) for (const [, ref] of resources.entries()) {
          if (ref instanceof PDFRef && pdf.context.lookup(ref) === undefined) {
            pdf.context.assign(ref,pdf.context.flateStream(new Uint8Array(),{
              Type:'XObject',Subtype:'Form',FormType:1,BBox:[0,0,1,1],Resources:{}
            }));
          }
        }
      }
      repair(value);
    }
    else if (object instanceof PDFArray) for (const value of object.asArray()) repair(value);
    else if (object.dict) repair(object.dict);
  }
  for (const [, object] of pdf.context.enumerateIndirectObjects()) repair(object);
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(Uint8Array.from(atob(FONT_BASE64), c => c.charCodeAt(0)), { subset: true });
  const supported = new Set(font.getCharacterSet());
  const clean = [...name.normalize('NFC')].filter(c => supported.has(c.codePointAt(0)!)).join('').trim();
  const page = pdf.getPage(0);
  const width = page.getWidth();
  const isDiary = product === 'prod_VU7tP0ceGvmmmW';
  // Keep artwork, title, logo and existing footer intact. Coordinates are PDF points.
  const centerX = kind === 'main' && isDiary ? width * 0.52 : width / 2;
  const bottom = kind === 'bonus' ? 160 : isDiary ? 190 : 535;
  const maxWidth = kind === 'main' && isDiary ? 250 : 300;
  const label = clean ? 'Este espacio pertenece a' : 'Un espacio solo tuyo';
  const labelSize = kind === 'main' && !isDiary ? 6 : 7;
  page.drawText(label, { x: centerX-font.widthOfTextAtSize(label,labelSize)/2, y:bottom+(kind === 'main' && !isDiary ? 13 : 17),
    size:labelSize,font,color:rgb(.25,.31,.35) });
  if (clean) {
    let size = kind === 'main' && !isDiary ? 10 : 12;
    while(font.widthOfTextAtSize(clean,size)>maxWidth && size>6) size-=.25;
    let display = clean;
    while(font.widthOfTextAtSize(display,size)>maxWidth) display=display.slice(0,-4)+'...';
    page.drawText(display, {x:centerX-font.widthOfTextAtSize(display,size)/2,y:bottom,
      size,font,color:rgb(.09,.17,.23)});
  }
  // Do not flatten: handwritten annotations, AcroForm fields and link annotations survive.
  return await pdf.save({updateFieldAppearances:false,useObjectStreams:false});
}

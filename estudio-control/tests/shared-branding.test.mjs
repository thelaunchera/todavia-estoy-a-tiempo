import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=(p)=>readFileSync(root+p,'utf8');
test('reject low-fidelity draft branding pack from both creation menus without breaking saved projects',()=>{
 const core=read('editor-core/branding-elements.ts');
 const studio=read('estudio-control/src/SeamlessEditor.tsx');
 const studioLibrary=read('estudio-control/src/BrandAssetLibrary.tsx');
 const lab=read('content-lab/src/CarouselFactory.tsx');
 const labLibrary=read('content-lab/src/PanoramaEditor.tsx');
 // Legacy renderer intentionally stays: saved customers' layers must keep their image URLs.
 assert.match(core,/brandingElementImages/);
 assert.match(lab,/brandingElementImages\(brand.color\)/);
 assert.doesNotMatch(studio,/onUniversal|addUniversalBrandingElement|brandingElementUrl/);
 assert.doesNotMatch(studioLibrary,/BRANDING_ELEMENTS|universal-|onUniversal|brandingElementUrl/);
 assert.doesNotMatch(lab,/addSharedBrandingElement|onAddBrandingElement/);
 assert.doesNotMatch(labLibrary,/BRANDING_ELEMENTS|onAddBrandingElement|librarySection==='branding'|panorama-branding-gallery/);
 assert.match(studioLibrary,/EDITORIAL_STICKER_ASSETS/);
 assert.match(studioLibrary,/GOLDEN_GRID_CAROUSEL_ASSETS/);
 assert.match(studioLibrary,/SOVA_CAROUSEL_ASSETS/);
});

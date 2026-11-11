import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {friendlyStickerName} from '../../creative-shared/sticker-display-name.ts';

test('Sticker labels remove leading archive numbers, HD and production instructions',()=>{
 const cases=[
  ['001 paper snowdrop winter to spring','Paper snowdrop winter to spring'],
  ['01 Papel rasgado rosa','Papel rasgado rosa'],
  ['01 dalmatian blue bow','Dalmatian blue bow'],
  ['14 reina azul real','Reina azul real'],
  ['02 Autumn leaf HD PNG transparent background','Autumn leaf'],
  ['09_cinta_tela_HQ_4K.png','Cinta tela'],
  ['04 floral stamp full HD high resolution no text','Floral stamp'],
  ['05 Blue Frame - internal use - HD - v2.png','Blue Frame'],
  ['01 iPhone UI 01 glossy airdrop share prompt','Compartir con AirDrop'],
  ['01 iPhone UI 02 glossy pastel share sheet ui','Menú para compartir'],
  ['01 iPhone UI 03 glossy chat bubble sticker clust','Burbujas de chat'],
  ['01 iPhone UI 04 pastel glass music player widget','Reproductor de música'],
  ['01 iPhone UI 05 pastel shared location map stick','Ubicación compartida'],
  ['01 iPhone UI 06 minimalist notes memo sticker','Notas'],
  ['01 iPhone UI 07 glossy pink reminder calendar wi','Recordatorios'],
  ['01 iPhone UI 08 pastel selected photo stack','Fotos apiladas'],
  ['01 iPhone UI 09 glossy pastel file transfer stic','Transferencia de archivos'],
  ['01 iPhone UI 10 glossy pastel control center wid','Centro de control'],
  ['01 iPhone UI 11 glossy voice message sticker clu','Mensaje de voz'],
  ['01 iPhone UI 12 pastel share contact sticker ui','Compartir contacto'],
  ['01 iPhone UI 13 glossy screenshot preview sticke','Vista previa de captura'],
  ['01 iPhone UI 14 glossy glassmorphism upload widg','Subir archivos'],
  ['01 iPhone UI 15 glossy pastel video call widget','Videollamada'],
  ['01 iPhone UI 16 glossy pastel route card sticker','Ruta en el mapa'],
  ['02 Picnic 01 a high quality cutout collage st','Picnic · Collage'],
  ['02 Picnic 03 a detailed cutout isolation stic','Picnic · Recorte'],
  ['03 Playa 20 a bright colorful sticker style','Playa · Ilustración'],
  ['04 Editorial 06 a single isolated high quality p','Elemento editorial']
 ];
 for(const [source,expected] of cases)assert.equal(friendlyStickerName(source),expected,source);
});

test('Display labels are pure and do not alter original asset paths or privacy classification',()=>{
 const raw='02 pantera rosa HD';
 const first=friendlyStickerName(raw);
 assert.equal(first,'Pantera rosa');
 assert.equal(raw,'02 pantera rosa HD');
 const studio=readFileSync(new URL('./StudioStickerLibrary.tsx',new URL('../src/',import.meta.url)),'utf8');
 const carousel=readFileSync(new URL('./SeamlessEditor.tsx',new URL('../src/',import.meta.url)),'utf8');
 const lab=readFileSync(new URL('../../content-lab/src/MediaAsset.ts',import.meta.url),'utf8');
 assert.match(studio,/friendlyStickerName\(item\.name\)/);
 assert.match(studio,/isPersonalCharacterAssetName/);
 assert.match(carousel,/friendlyStickerName\(asset\.name\)/);
 assert.match(lab,/if\(assetCategory\(asset\)==='sticker'\)return friendlyStickerName/);
 const helperSource=readFileSync(new URL('../../creative-shared/sticker-display-name.ts',import.meta.url),'utf8');
 for(const forbidden of ['storage.from','writeEditorRecord','update('])assert.equal(helperSource.includes(forbidden),false);
});

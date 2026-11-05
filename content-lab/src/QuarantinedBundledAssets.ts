/** Temporarily unavailable: corrupted / truncated PNG uploads in Git history.
 * DO NOT replace source metadata/checksums or re-label truncated files as valid.
 * Restore each ORIGINAL complete PNG, verify SHA-256 and PNG IEND, then remove
 * only its ID from this set. Existing users' saved designs retain their IDs.
 * Snapshot verified against 2026-11-05 repo blob sizes.
 */
export const QUARANTINED_BUNDLED_ASSET_IDS=new Set<string>([
  'included-pinterest-01-lazo-terciopelo-burgundy', // resources/pinterest-aesthetic-stickers-2026-11/01_lazo_terciopelo_burgundy.png
  'included-pinterest-02-lazo-vichy-mantequilla', // resources/pinterest-aesthetic-stickers-2026-11/02_lazo_vichy_mantequilla.png
  'included-pinterest-03-lazo-organza-azul', // resources/pinterest-aesthetic-stickers-2026-11/03_lazo_organza_azul.png
  'included-pinterest-04-estrella-vichy-azul', // resources/pinterest-aesthetic-stickers-2026-11/04_estrella_vichy_azul.png
  'included-pinterest-05-estrella-terciopelo-mantequilla', // resources/pinterest-aesthetic-stickers-2026-11/05_estrella_terciopelo_mantequilla.png
  'included-pinterest-06-cerezas-disco', // resources/pinterest-aesthetic-stickers-2026-11/06_cerezas_disco.png
  'included-pinterest-07-matcha-con-lazo', // resources/pinterest-aesthetic-stickers-2026-11/07_matcha_con_lazo.png
  'included-pinterest-08-camara-lila', // resources/pinterest-aesthetic-stickers-2026-11/08_camara_lila.png
  'included-pinterest-09-pastel-corazon', // resources/pinterest-aesthetic-stickers-2026-11/09_pastel_corazon.png
  'included-pinterest-10-audifonos-marfil', // resources/pinterest-aesthetic-stickers-2026-11/10_audifonos_marfil.png
  'included-pinterest-11-bota-cowboy-rosa', // resources/pinterest-aesthetic-stickers-2026-11/11_bota_cowboy_rosa.png
  'included-pinterest-12-perfume-con-lazo', // resources/pinterest-aesthetic-stickers-2026-11/12_perfume_con_lazo.png
  'included-pinterest-13-croissant-con-lazo', // resources/pinterest-aesthetic-stickers-2026-11/13_croissant_con_lazo.png
  'included-pinterest-14-libros-con-cinta', // resources/pinterest-aesthetic-stickers-2026-11/14_libros_con_cinta.png
  'included-pinterest-15-cafe-helado', // resources/pinterest-aesthetic-stickers-2026-11/15_cafe_helado.png
  'included-pinterest-16-relicario-corazon', // resources/pinterest-aesthetic-stickers-2026-11/16_relicario_corazon.png
  'included-pinterest-17-concha-con-perla', // resources/pinterest-aesthetic-stickers-2026-11/17_concha_con_perla.png
  'included-pinterest-18-perrito-salchicha', // resources/pinterest-aesthetic-stickers-2026-11/18_perrito_salchicha.png
  'included-pinterest-20-labial-con-perlas', // resources/pinterest-aesthetic-stickers-2026-11/20_labial_con_perlas.png
  'included-holiday-osito-navidad', // resources/holiday-stickers-2026-11/osito-navidad.png
  'included-holiday-lazo-cascabeles', // resources/holiday-stickers-2026-11/lazo-cascabeles.png
  'included-holiday-galleta-navidad', // resources/holiday-stickers-2026-11/galleta-navidad.png
  'included-holiday-esfera-perlada', // resources/holiday-stickers-2026-11/esfera-perlada.png
  'included-holiday-globo-nieve', // resources/holiday-stickers-2026-11/globo-nieve.png
  'included-holiday-conejito-valentin', // resources/holiday-stickers-2026-11/conejito-valentin.png
  'included-holiday-carta-amor', // resources/holiday-stickers-2026-11/carta-amor.png
  'included-holiday-cerezas-corazon', // resources/holiday-stickers-2026-11/cerezas-corazon.png
  'included-holiday-caja-bombones', // resources/holiday-stickers-2026-11/caja-bombones.png
  'included-holiday-corazon-terciopelo', // resources/holiday-stickers-2026-11/corazon-terciopelo.png
  'included-holiday-lazo-rosa', // resources/holiday-stickers-2026-11/lazo-rosa.png
  'included-holiday-estrella-dorada', // resources/holiday-stickers-2026-11/estrella-dorada.png
  'included-holiday-baston-rosa', // resources/holiday-stickers-2026-11/baston-rosa.png
  'included-holiday-copo-perlado', // resources/holiday-stickers-2026-11/copo-perlado.png
]);

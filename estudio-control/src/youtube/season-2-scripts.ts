/** All eight complete season-two English scripts, independently downloadable. */
import ep01 from './season-2/scripts/01-we-need-a-bigger-table.md?raw';
import ep02 from './season-2/scripts/02-ten-directors-one-shot.md?raw';
import ep03 from './season-2/scripts/03-the-missing-product.md?raw';
import ep04 from './season-2/scripts/04-dont-make-it-real.md?raw';
import ep05 from './season-2/scripts/05-everyone-wants-credit.md?raw';
import ep06 from './season-2/scripts/06-offline.md?raw';
import ep07 from './season-2/scripts/07-launch-night.md?raw';
import ep08 from './season-2/scripts/08-the-group-photo.md?raw';
export const seasonTwoScripts=[ep01,ep02,ep03,ep04,ep05,ep06,ep07,ep08] as const;
export function seasonTwoScriptForEpisode(episode:number):string{
  return seasonTwoScripts[episode-1]||'';
}

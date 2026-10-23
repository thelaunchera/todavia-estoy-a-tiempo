type Episode = { number?: number; series?: string; series_number?: number };
const known = [
  { id: 'first', name: 'Pensé que a esta edad…', number: 1, from: 1, to: 8 },
  { id: 'second', name: 'La vida que nadie ve', number: 2, from: 9, to: 19 },
  { id: 'third', name: 'Amar sin perderme', number: 3, from: 20, to: 27 },
];

export function groupEpisodes<T extends Episode>(episodes: T[]) {
  const groups = new Map<string, { id: string; name: string; number: string; rows: T[] }>();
  for (const episode of episodes) {
    const named = episode.series?.trim();
    const match = named
      ? known.find(series => series.name === named)
      : known.find(series => Number(episode.number) >= series.from && Number(episode.number) <= series.to);
    const name = named || match?.name || 'Sin serie';
    const id = match?.id || name;
    if (!groups.has(id)) {
      const number = episode.series_number || match?.number;
      groups.set(id, { id, name, number: number ? String(number).padStart(2, '0') : '—', rows: [] });
    }
    groups.get(id)!.rows.push(episode);
  }
  return [...groups.values()].sort((a, b) =>
    (Number(a.number) || 999) - (Number(b.number) || 999)
  );
}

export function narrationBlocks(script: string, limit = 4300): string[] {
  const text = script.trim();
  if (!text) return [];
  if (text.length <= limit) return [text];
  const paragraphs = text.split('\n\n');
  if (text.length <= limit * 2) {
    let size = 0;
    for (let i = 0; i < paragraphs.length - 1; i++) {
      size += paragraphs[i].length + (i ? 2 : 0);
      if (size >= text.length / 2 && size <= limit && text.length - size - 2 <= limit) {
        return [paragraphs.slice(0, i + 1).join('\n\n'), paragraphs.slice(i + 1).join('\n\n')];
      }
    }
  }
  const blocks: string[] = [];
  let remaining = text;
  while (remaining.length > limit) {
    let cut = remaining.lastIndexOf('\n\n', limit);
    if (cut <= 0) cut = remaining.lastIndexOf(' ', limit);
    if (cut <= 0) cut = limit;
    blocks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) blocks.push(remaining);
  return blocks;
}

/** Ajustes editoriales de narración para episodios todavía no publicados.
 * No modifica el episodio 1 ni la voz autobiográfica de la presentadora.
 * Se aplica a la lectura, copia y edición; los textos de origen se conservan
 * hasta que se guarden expresamente en el Estudio.
 */
export function dialogueForAudience(script: string, episodeNumber?: number): string {
  if (!script || episodeNumber === 1) return script;
  return script
    .replace(/^\\[(?:softly|thoughtful|laughs|whispers|sighs)\\]\\s*/gim, '')
    .replace(/\\bBienvenida a «Todavía estoy a tiempo»/g, 'Qué bueno que estés aquí en «Todavía estoy a tiempo»')
    .replace(/\\bbienvenida a «Todavía estoy a tiempo»/g, 'qué bueno que estés aquí en «Todavía estoy a tiempo»')
    .replace(/\\bBienvenida\\b/g, 'Gracias por acompañarme')
    .replace(/\\bbienvenida\\b/g, 'gracias por acompañarme')
    .replace(/\\bnosotras mismas\\b/gi, 'cada quien')
    .replace(/\\buna misma\\b/gi, 'uno mismo')
    .replace(/\\buna responde\\b/gi, 'respondes')
    .replace(/\\buna está\\b/gi, 'estás')
    .replace(/\\buna siente\\b/gi, 'se siente')
    .replace(/\\b¿Estás segura\\?/gi, '¿Lo tienes claro?')
    .replace(/\\bestás cansada\\b/gi, 'sientes cansancio')
    .replace(/\\bestás sola\\b/gi, 'te sientes sin compañía');
}

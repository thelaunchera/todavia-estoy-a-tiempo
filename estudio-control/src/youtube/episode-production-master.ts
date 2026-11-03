/** One production brief for all ten canonical stills of a shortened OFF BRIEF episode.
 * The prompt coordinates rendering/editing, it is not a video generator by itself.
 */
import { youtubeEpisodes } from './episodes';
import { youtubePhotoBoard, type YouTubePhoto } from './visual-plan';
import { getMicroEpisode } from './micro-production';

export type EpisodePhotoAvailability = {
  id: string;
  source: 'private' | 'studio' | 'drive' | 'missing';
  fileName?: string;
  driveUrl?: string;
};

export const getEpisodeProductionBlocks = (photos: readonly YouTubePhoto[]) => {
  const base = photos.filter(photo => /^E0[1-8]-F(?:0[1-9]|10)$/.test(photo.id));
  return [
    { number: 1, title: 'Inicio', detail: 'Presentar la situación y los personajes', photos: base.slice(0, 3) },
    { number: 2, title: 'Problema', detail: 'Mostrar el conflicto y las reacciones', photos: base.slice(3, 7) },
    { number: 3, title: 'Resolución', detail: 'Resolver la historia y cerrar con intención', photos: base.slice(7) }
  ];
};

export function getEpisodeProductionMaster(episodeNumber: number, availability: readonly EpisodePhotoAvailability[]): string {
  const episode = youtubeEpisodes.find(item => item.number === episodeNumber);
  const short = getMicroEpisode(1, episodeNumber);
  if (!episode || !short) return '';
  const photos = (youtubePhotoBoard[episodeNumber] || []).filter(item => /^E0[1-8]-F(?:0[1-9]|10)$/.test(item.id));
  const status = new Map(availability.map(item => [item.id, item]));
  const blocks = getEpisodeProductionBlocks(photos);
  const shotList = blocks.flatMap(block => [
    'BLOQUE ' + block.number + ' — ' + block.title.toUpperCase() + ' (' + block.detail + ')',
    ...block.photos.map(photo => {
      const asset = status.get(photo.id);
      const source = asset?.source === 'private' ? 'SUBIDA PRIVADA'
        : asset?.source === 'studio' ? 'VISTA PREVIA EN STUDIO' : asset?.source === 'drive' ? 'ARCHIVO ORIGINAL VINCULADO EN DRIVE (abrir con conector)' : 'PENDIENTE DE FOTO';
      return [
        photo.id + ' / ' + photo.title + ' / fuente: ' + source,
        '  Escena oficial: ' + photo.scene,
        '  Plano/cámara: ' + photo.shot,
        '  Acción aprobada: ' + photo.action,
        '  Archivo esperado: ' + (asset?.fileName || photo.id + '.png'),
        '  Original en Google Drive: ' + (asset?.driveUrl || 'Sin enlace guardado')
      ].join('\n');
    })
  ]).join('\n\n');
  return [
    'OFF BRIEF — ÚNICO MASTER PROMPT DE PRODUCCIÓN DEL EPISODIO',
    'TEMPORADA 1 / EPISODIO ' + String(episodeNumber).padStart(2, '0') + ' — ' + episode.title,
    '',
    'ROL: Actúa como director de animación cinematográfica 3D, supervisor de continuidad, editor y productor de video.',
    'MISIÓN: Construye un episodio ANIMADO completo en INGLÉS, de aproximadamente 90–120 segundos, utilizando las DIEZ fotografías individuales oficiales de este episodio en el orden indicado. Las tres secciones que verás abajo son BLOQUES NARRATIVOS de organización, no un límite de imágenes ni un reemplazo del storyboard original.',
    '',
    'ACCESO A ARCHIVOS: Usa el conector Google Drive para abrir los enlaces originales de cada ficha que aparecen abajo; no dependas de vistas previas. Antes de producir, recupera las fotografías realmente adjuntas en el chat o accesibles desde el Studio/Google Drive conectado, identifica cada una por su ID E##-F## y confirma la lista. Un nombre de archivo o una vista previa NO transfiere los píxeles a la herramienta de video. No inventes imágenes ausentes, no sustituyas Nia ni Ruby, no declares que se generó un video si solo entregaste texto.',
    'CONTINUIDAD: Usa exclusivamente los avatares originales aprobados de Nia y Ruby, su identidad facial, proporciones, cabello, vestuario específico del episodio, escenografía, utilería y moodboard. Mantén consistencia de ubicación, lado de cámara, iluminación y color entre tomas. No agregues personajes, subtítulos ni logotipos dentro de los fotogramas salvo que estén indicados en los recursos oficiales.',
    '',
    'ORDEN DE LAS DIEZ FOTOGRAFÍAS:',
    shotList,
    '',
    'GUION APROBADO PARA EL CORTE BREVE (DIÁLOGOS ORIGINALES, EN INGLÉS):',
    ...short.beats.map((beat, index) => [
      'BEAT ' + (index + 1) + ' / ' + beat.start + '–' + beat.end + ' segundos / ' + beat.label,
      beat.script
    ].join('\n')),
    '',
    'EDICIÓN Y MOVIMIENTO:',
    '1. Haz un inventario con estado real de las diez imágenes. Si falta una, detalla qué ID falta antes de continuar; no reemplaces silenciosamente una toma del guion.',
    '2. Crea clips breves por foto con movimientos sutiles de cámara (push-in, pan, reacción, parpadeo) y actuación consistente. Un único prompt dirige TODO el flujo, pero el motor de video puede exigir generar varios clips. No deformes rostros, manos, productos ni texto.',
    '3. Distribuye las diez tomas en orden, manteniendo el ritmo de los cuatro beats del guion breve. Las tres secciones son inicio, problema y resolución; los tiempos de los beats mandan en el montaje.',
    '4. Usa voces originales/autorizadas de Nia y Ruby en inglés, sincronizadas con los diálogos exactos. Añade música y efectos originales o correctamente licenciados. No inventes voces, subtítulos, créditos ni frases.',
    '5. Monta un solo episodio cohesivo; usa bumper oficial después del cold open si existe, y termina con la pregunta real del guion. Respeta las escenas originales sin convertir esto en una presentación de diapositivas.',
    '6. Exporta el master YouTube horizontal MP4 a 1920x1080, 24 fps, H.264/AAC. Adapta una segunda versión vertical solo si se solicita y sin volver a generar fotos.',
    '',
    'ENTREGA OBLIGATORIA: (a) auditoría E##-F01 a E##-F10, (b) secuencia y duración de cada clip, (c) audio y edición verificables, (d) MP4 real cuando una herramienta de render y sus permisos estén disponibles. Si no puedes acceder a las diez fotos, no tienes un motor de video o falta audio, informa el bloqueo específico y entrega un plan editable SIN afirmar que hay un video terminado.',
    'ESTE PROMPT ORGANIZA LA PRODUCCIÓN, PERO NO GENERA UN MP4 POR SÍ SOLO.'
  ].join('\n\n');
}

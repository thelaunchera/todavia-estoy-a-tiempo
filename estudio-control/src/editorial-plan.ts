type PlannedEpisode = { archived?: boolean; status?: string; date?: string | null; planning_month?: string };

export function editorialPlan<T extends PlannedEpisode>(episodes: T[]) {
  const archived = episodes.filter(episode => episode.archived === true);
  const active = episodes.filter(episode => episode.archived !== true);
  const published = active.filter(episode => episode.status === 'publicado');
  const planned = active.filter(episode => episode.status !== 'publicado')
    .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  const monthKey = active.find(episode => episode.planning_month)?.planning_month
    || planned.find(episode => episode.date)?.date?.slice(0, 7);
  const month = active.filter(episode => !!monthKey && episode.date?.startsWith(monthKey))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const firstDate = monthKey ? monthKey + '-01' : undefined;
  const label = firstDate ? new Intl.DateTimeFormat('es-US', {
    month: 'long', year: 'numeric',
  }).format(new Date(firstDate + 'T12:00:00')) : 'Sin mes planificado';
  return { archived, active, published, planned, month, label };
}

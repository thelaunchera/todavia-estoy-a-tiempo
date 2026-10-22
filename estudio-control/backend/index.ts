import {
  router,
  json,
  error,
  requireAuth,
  requireAdminEmailAllowlist,
  db,
} from '@appdeploy/sdk';
const ADMIN_EMAILS = (process.env.STUDIO_ADMIN_EMAILS || '').split(',').map(v => v.trim()).filter(Boolean);
const guard = [requireAuth(), requireAdminEmailAllowlist(ADMIN_EMAILS)];
type Kind = 'episodios' | 'tareas' | 'productos' | 'ideas';
const kinds: Kind[] = ['episodios', 'tareas', 'productos', 'ideas'];
const fields: Record<Kind, string[]> = {
  episodios: [
    'title',
    'status',
    'date',
    'summary',
    'link',
    'audio',
    'art',
    'notes',
  ],
  tareas: ['title', 'status', 'date', 'section', 'notes', 'priority'],
  productos: ['title', 'status', 'subtitle', 'price', 'link', 'notes'],
  ideas: ['title', 'status', 'section', 'notes'],
};
const sample: Record<Kind, Array<Record<string, unknown>>> = {
  episodios: Array.from({ length: 8 }, (_, i) => ({
    id: 'capitulo-' + String(i + 1).padStart(2, '0'),
    title: 'Capítulo ' + String(i + 1).padStart(2, '0'),
    date: new Date(Date.UTC(2026, 9, 20 + i * 7)).toISOString().slice(0, 10),
    status: i === 0 ? 'publicado' : i === 1 ? 'en producción' : 'planificado',
    summary:
      i === 0
        ? 'El comienzo de la primera serie.'
        : 'Preparación de la primera serie.',
    link: i === 0 ? 'https://open.spotify.com/show/4f22tdJv8nMdTSMKc1kvIh' : '',
    audio: '',
    art: '',
    notes:
      i === 0 ? 'Primer episodio publicado. Completa el título editorial.' : '',
  })),
  tareas: [
    {
      id: 'portada-c2',
      title: 'Preparar portada del capítulo 2',
      date: '2026-10-26',
      status: 'pendiente',
      section: 'Diseño',
      notes: 'Continuar la dirección visual del podcast.',
    },
    {
      id: 'reel-c2',
      title: 'Preparar reel de estreno del capítulo 2',
      date: '2026-10-27',
      status: 'pendiente',
      section: 'Contenido',
      notes: 'Los martes comienzan con el reel.',
    },
    {
      id: 'seo',
      title: 'Verificar indexación en Search Console',
      date: '2026-10-30',
      status: 'pendiente',
      section: 'SEO',
      notes: 'Sitemap publicado; indexación por confirmar.',
    },
  ],
  productos: [
    {
      id: 'guia',
      title: '5 preguntas para cuando sientes que vas tarde',
      subtitle: 'Recurso gratuito',
      price: 0,
      status: 'disponible',
      link: 'https://drive.google.com/file/d/1FAJd-pAgQUynFLAeB5wdnsf1Broi5SDo/view',
      notes: 'Entrega por email.',
    },
    {
      id: 'diario',
      title: 'No voy tarde',
      subtitle: 'Un diario para volver a mí',
      price: 4.99,
      status: 'publicado',
      link: 'https://thelaunchera.github.io/todavia-estoy-a-tiempo/productos/no-voy-tarde.html',
    },
    {
      id: 'empezar',
      title: 'Empezar de nuevo',
      subtitle: 'Sin tener todo resuelto',
      price: 7.99,
      status: 'publicado',
      link: 'https://thelaunchera.github.io/todavia-estoy-a-tiempo/productos/empezar-de-nuevo.html',
    },
  ],
  ideas: [
    {
      id: 'comunidad',
      title: 'Una comunidad para seguir conversando',
      section: 'Comunidad',
      status: 'en exploración',
      notes: 'Explorar una comunidad para enero; todavía no publicada.',
    },
  ],
};
function table(kind: Kind, id: string) {
  return 'podcast_' + kind + '_' + id.replace(/[^A-Za-z0-9]/g, '_');
}
function kindOf(name: string): name is Kind {
  return kinds.includes(name as Kind);
}
function sanitize(kind: Kind, body: unknown) {
  const o =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const key of fields[kind]) {
    if (!(key in o)) continue;
    const val = o[key];
    if (key === 'price') {
      const n = Number(val);
      if (Number.isFinite(n) && n >= 0 && n < 100000)
        out.price = Math.round(n * 100) / 100;
    } else if (typeof val === 'string')
      out[key] = val
        .trim()
        .slice(0, key === 'notes' || key === 'summary' ? 3000 : 400);
  }
  return out;
}
async function init(id: string) {
  const t = 'podcast_seed_' + id.replace(/[^A-Za-z0-9]/g, '_');
  const [seed] = await db.get(t, ['started'], { consistent: true });
  if (seed) return;
  for (const kind of kinds) await db.tx.add(table(kind, id), sample[kind]);
  await db.tx.add(t, [{ id: 'started', version: '2026-10-22' }]);
}
async function studio(id: string) {
  await init(id);
  const lists = await Promise.all(
    kinds.map(k => db.list(table(k, id), { limit: 100 }))
  );
  const records: Record<string, unknown> = {};
  kinds.forEach((k, i) => {
    records[k] = lists[i].items;
  });
  return {
    records,
    sources: {
      lastVerified: '22 oct 2026',
      sales:
        'Las compras de Stripe y los eventos de Make todavía no están sincronizados con este estudio.',
      subscribers:
        'La lista de consentimiento existe en Make, pero su conteo aún no está conectado al estudio.',
      support:
        'Los correos de ayuda están configurados. Las conversaciones privadas no están sincronizadas con esta pantalla.',
      seo: 'Metadatos y sitemap publicados. Indexación no verificada.',
    },
  };
}
export const handler = router({
  'GET /api/studio': [
    ...guard,
    async ctx => {
      try {
        return json(await studio(ctx.user!.userId));
      } catch {
        return error('No se pudieron cargar los datos privados.', 503);
      }
    },
  ],
  'POST /api/items/:kind': [
    ...guard,
    async ctx => {
      const k = ctx.params.kind;
      if (!kindOf(k)) return error('Sección no permitida.', 400);
      const record = sanitize(k, ctx.body);
      if (!String(record.title || '').trim())
        return error('El título es obligatorio.', 400);
      try {
        const [id] = await db.add(table(k, ctx.user!.userId), [
          { ...record, updatedAt: new Date().toISOString() },
        ]);
        return id
          ? json({ id, ...record }, 201)
          : error('No se pudo guardar.', 503);
      } catch {
        return error('Error al guardar.', 503);
      }
    },
  ],
  'PUT /api/items/:kind/:id': [
    ...guard,
    async ctx => {
      const k = ctx.params.kind;
      if (!kindOf(k)) return error('Sección no permitida.', 400);
      const record = sanitize(k, ctx.body);
      if (!Object.keys(record).length)
        return error('Sin cambios válidos.', 400);
      try {
        const [ok] = await db.tx.update(
          table(k, ctx.user!.userId),
          [
            {
              id: ctx.params.id,
              record: { ...record, updatedAt: new Date().toISOString() },
            },
          ],
          { patch: true }
        );
        return ok ? json({ ok: true }) : error('Registro no encontrado.', 404);
      } catch {
        return error('No se pudo actualizar.', 503);
      }
    },
  ],
  'DELETE /api/items/:kind/:id': [
    ...guard,
    async ctx => {
      const k = ctx.params.kind;
      if (!kindOf(k)) return error('Sección no permitida.', 400);
      try {
        const [ok] = await db.delete(table(k, ctx.user!.userId), [
          ctx.params.id,
        ]);
        return ok ? json({ ok: true }) : error('Registro no encontrado.', 404);
      } catch {
        return error('No se pudo eliminar.', 503);
      }
    },
  ],
});

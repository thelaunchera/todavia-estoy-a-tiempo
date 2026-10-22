// Estudio del podcast - bóveda cifrada exclusiva de este navegador.
// No procesa compras ni correos; los estados de integraciones son informativos.
type Kind = 'episodios' | 'tareas' | 'productos' | 'ideas';
type Row = { id: string; title: string; [key: string]: unknown };
type Records = Record<Kind, Row[]>;
type Vault = { version: number; records: Records };
type Envelope = { version: number; salt: string; iv: string; ciphertext: string; iterations: number };
const STORAGE_KEY = 'podcast_studio_vault_v1';
const ITERATIONS = 230000;
let key: CryptoKey | null = null;
let memory: Vault | null = null;
const enc = new TextEncoder();
const dec = new TextDecoder();
const kinds: Kind[] = ['episodios', 'tareas', 'productos', 'ideas'];
const fields: Record<Kind, string[]> = {
  episodios: ['title', 'date', 'status', 'summary', 'link', 'audio', 'art', 'notes'],
  tareas: ['title', 'date', 'status', 'section', 'notes', 'priority'],
  productos: ['title', 'subtitle', 'price', 'status', 'link', 'notes'],
  ideas: ['title', 'section', 'status', 'notes']
};
function base64(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 8192)
    result += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(result);
}
function unbase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}
function fail(message: string, code: string): never {
  throw Object.assign(new Error(message), { code });
}
function readEnvelope(): Envelope | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const value = JSON.parse(raw) as Envelope;
  if (value.version !== 1 || !value.salt || !value.iv || !value.ciphertext || value.iterations !== ITERATIONS)
    fail('El archivo de tu estudio no tiene el formato esperado.', 'invalid_vault');
  return value;
}
async function derive(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}
function initial(): Vault {
  return { version: 1, records: {
    episodios: Array.from({ length: 8 }, (_, i) => ({
      id: 'capitulo-' + String(i + 1).padStart(2, '0'),
      title: 'Capítulo ' + String(i + 1).padStart(2, '0'),
      date: new Date(Date.UTC(2026, 9, 20 + 7 * i)).toISOString().slice(0, 10),
      status: i === 0 ? 'publicado' : i === 1 ? 'en producción' : 'planificado',
      summary: i === 0 ? 'El comienzo de la primera serie.' : 'Preparación de la primera serie.',
      audio: '', art: '', notes: '', link: i === 0 ? 'https://open.spotify.com/show/4f22tdJv8nMdTSMKc1kvIh' : ''
    })),
    tareas: [
      { id: 'portada-c2', title: 'Preparar portada del capítulo 2', date: '2026-10-26', status: 'pendiente', section: 'Diseño', notes: 'Seguir la identidad editorial del podcast.' },
      { id: 'reel-c2', title: 'Preparar reel de estreno del capítulo 2', date: '2026-10-27', status: 'pendiente', section: 'Contenido', notes: 'Los martes empiezan con el reel.' },
      { id: 'seo', title: 'Verificar indexación en Google', date: '2026-10-30', status: 'pendiente', section: 'SEO', notes: 'Sitemap publicado; indexación pendiente de comprobar.' }
    ],
    productos: [
      { id: 'guia', title: '5 preguntas para cuando sientes que vas tarde', subtitle: 'Recurso gratuito', price: 0, status: 'disponible', link: 'https://drive.google.com/file/d/1FAJd-pAgQUynFLAeB5wdnsf1Broi5SDo/view', notes: 'Entrega automática por correo.' },
      { id: 'diario', title: 'No voy tarde', subtitle: 'Un diario para volver a mí', price: 4.99, status: 'publicado', link: 'https://podcast.thelaunchera.com/productos/no-voy-tarde.html' },
      { id: 'empezar', title: 'Empezar de nuevo', subtitle: 'Sin tener todo resuelto', price: 7.99, status: 'publicado', link: 'https://podcast.thelaunchera.com/productos/empezar-de-nuevo.html' }
    ],
    ideas: [{ id: 'comunidad', title: 'Una comunidad para seguir conversando', section: 'Comunidad', status: 'en exploración', notes: 'Explorar más adelante, no publicado.' }]
  }};
}
async function lockAndStore(vault: Vault, encryptionKey: CryptoKey, salt: Uint8Array): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encryptionKey, enc.encode(JSON.stringify(vault)));
  const envelope: Envelope = {
    version: 1, salt: base64(salt), iv: base64(iv), ciphertext: base64(new Uint8Array(cipher)),
    iterations: ITERATIONS
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  memory = vault;
}
export function hasLocalVault(): boolean {
  try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
}
export const auth = {
  async getUser() {
    return key && memory ? { name: 'Mi estudio local', email: 'Protegido en este dispositivo' } : null;
  },
  async signIn(passphrase: string) {
    if (!passphrase || passphrase.length < 10) fail('Usa una frase de acceso de al menos 10 caracteres.', 'short_password');
    const existing = readEnvelope();
    if (existing) {
      const derived = await derive(passphrase, unbase64(existing.salt));
      try {
        const plain = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: unbase64(existing.iv) }, derived, unbase64(existing.ciphertext)
        );
        const data = JSON.parse(dec.decode(plain)) as Vault;
        if (data.version !== 1 || !data.records || !kinds.every(k => Array.isArray(data.records[k])))
          fail('El archivo cifrado no tiene el formato esperado.', 'invalid_vault');
        key = derived; memory = data;
      } catch {
        fail('La frase de acceso no coincide con este estudio.', 'bad_passphrase');
      }
    } else {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const derived = await derive(passphrase, salt);
      await lockAndStore(initial(), derived, salt);
      key = derived;
    }
    return { user: { name: 'Mi estudio local', email: 'Protegido en este dispositivo' } };
  },
  async signOut() { key = null; memory = null; }
};
function ensure(): Vault {
  if (!key || !memory) fail('Abre la bóveda antes de continuar.', 'locked');
  return memory;
}
async function persist(update: Vault): Promise<void> {
  if (!key) fail('Estudio bloqueado.', 'locked');
  const e = readEnvelope();
  if (!e) fail('No se encontró tu estudio cifrado.', 'missing_vault');
  await lockAndStore(update, key, unbase64(e.salt));
}
function sanitize(kind: Kind, value: unknown): Record<string, unknown> {
  const v = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const result: Record<string, unknown> = {};
  for (const field of fields[kind]) {
    if (!(field in v)) continue;
    if (field === 'price') {
      const amount = Number(v[field]);
      if (Number.isFinite(amount) && amount >= 0 && amount <= 99999) result.price = Math.round(amount * 100) / 100;
    } else if (typeof v[field] === 'string') {
      result[field] = (v[field] as string).trim().slice(0, field === 'notes' ? 2500 : 400);
    }
  }
  return result;
}
function parseKind(url: string): { kind: Kind; id?: string } {
  const parts = url.split('/').filter(Boolean);
  const kind = parts[2] as Kind;
  if (parts[0] !== 'api' || parts[1] !== 'items' || !kinds.includes(kind))
    fail('Sección desconocida.', 'invalid_path');
  return { kind, id: parts[3] };
}
export const api = {
  async get(url: string) {
    if (url !== '/api/studio') fail('Ruta no disponible.', 'invalid_path');
    const vault = ensure();
    return { data: {
      records: JSON.parse(JSON.stringify(vault.records)) as Records,
      sources: {
        lastVerified: '22 oct 2026',
        sales: 'Sincronización pendiente: no se muestran compradores ni ingresos sin datos verificados.',
        subscribers: 'Make guarda las altas y bajas consentidas. El conteo no está conectado a esta bóveda.',
        support: 'El formulario de ayuda envía correos; la bandeja aún no está conectada.',
        seo: 'Sitemap y metadatos publicados. La indexación aún no está verificada.'
      }
    } };
  },
  async post(url: string, body: unknown) {
    const { kind } = parseKind(url);
    const values = sanitize(kind, body);
    if (!values.title) fail('El título es obligatorio.', 'invalid_title');
    const vault = ensure();
    const record: Row = { ...values, id: crypto.randomUUID(), title: String(values.title) };
    const updated: Vault = { ...vault, records: { ...vault.records, [kind]: [...vault.records[kind], record] } };
    await persist(updated);
    return { data: record };
  },
  async put(url: string, body: unknown) {
    const { kind, id } = parseKind(url);
    const vault = ensure();
    const patch = sanitize(kind, body);
    const exists = vault.records[kind].some(row => row.id === id);
    if (!exists) fail('Registro no encontrado.', 'not_found');
    if ('title' in patch && !patch.title) fail('El título es obligatorio.', 'invalid_title');
    const updated: Vault = {
      ...vault, records: { ...vault.records, [kind]: vault.records[kind].map(row => row.id === id ? { ...row, ...patch } : row) }
    };
    await persist(updated);
    return { data: { ok: true } };
  },
  async delete(url: string) {
    const { kind, id } = parseKind(url);
    const vault = ensure();
    if (!vault.records[kind].some(row => row.id === id)) fail('Registro no encontrado.', 'not_found');
    const updated: Vault = {
      ...vault, records: { ...vault.records, [kind]: vault.records[kind].filter(row => row.id !== id) }
    };
    await persist(updated);
    return { data: { ok: true } };
  }
};
export function downloadEncryptedBackup(): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) fail('No se encontró la bóveda cifrada.', 'missing_vault');
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'todavia-estoy-a-tiempo-respaldo-cifrado.json';
  document.body.appendChild(a);
  a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
export async function importEncryptedBackup(raw: string): Promise<void> {
  const parsed = JSON.parse(raw) as Envelope;
  if (parsed.version !== 1 || parsed.iterations !== ITERATIONS ||
      typeof parsed.ciphertext !== 'string' || typeof parsed.iv !== 'string' ||
      typeof parsed.salt !== 'string' || parsed.ciphertext.length < 24)
    fail('El archivo no es un respaldo compatible.', 'invalid_backup');
  unbase64(parsed.salt); unbase64(parsed.iv); unbase64(parsed.ciphertext);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  key = null; memory = null;
}

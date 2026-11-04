// Store image-heavy carousel documents outside localStorage's small string quota.
// IndexedDB keeps the original image data while the user opens the iOS share sheet.
const DB_NAME = 'tle-seamless-editor';
const STORE_NAME = 'documents';
let connection: Promise<IDBDatabase> | null = null;

function openEditorDb(): Promise<IDBDatabase> {
  if (connection) return connection;
  connection = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Este navegador no permite almacenamiento local.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => {
      connection = null;
      reject(request.error || new Error('No se pudo abrir el almacenamiento.'));
    };
    request.onblocked = () => {
      connection = null;
      reject(new Error('El almacenamiento está bloqueado por otra pestaña.'));
    };
  });
  return connection;
}

export async function readEditorRecord<T>(key: string): Promise<T | null> {
  const db = await openEditorDb();
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
    request.onerror = () => reject(request.error || new Error('No se pudo recuperar el carrusel.'));
    tx.onabort = () => reject(tx.error || new Error('Se interrumpió la lectura.'));
  });
}

export async function writeEditorRecord(key: string, value: unknown): Promise<void> {
  const db = await openEditorDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('No se pudo guardar el carrusel.'));
    tx.onabort = () => reject(tx.error || new Error('Se interrumpió el guardado.'));
  });
}

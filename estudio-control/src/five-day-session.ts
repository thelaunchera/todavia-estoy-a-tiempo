// Session record for the podcast's local encrypted vault.
// Remembers a non-extractable WebCrypto key in this browser for exactly five days.
// NEVER stores the phrase, exports the key, or sends vault material to a server.
export const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const DB_NAME = 'podcast_studio_local_session_v1';
const STORE = 'remembered_vault';
const SESSION_ID = 'current';
type StoredSession = {
  id: string;
  key: CryptoKey;
  vaultSalt: string;
  expiresAt: number;
};
export type RememberedKey = { key: CryptoKey; expiresAt: number };

export function sessionIsActive(expiresAt: number): boolean {
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

async function openSessionDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Session database is unavailable'));
    request.onblocked = () => reject(new Error('Session database upgrade was blocked'));
  });
}

async function getStored(): Promise<StoredSession | null> {
  const db = await openSessionDb();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readonly');
      const request = transaction.objectStore(STORE).get(SESSION_ID);
      request.onsuccess = () => resolve((request.result as StoredSession | undefined) || null);
      request.onerror = () => reject(request.error || new Error('Could not load remembered session'));
    });
  } finally {
    db.close();
  }
}

async function putStored(value: StoredSession): Promise<void> {
  const db = await openSessionDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Could not remember session'));
      transaction.onabort = () => reject(transaction.error || new Error('Remembering session aborted'));
      transaction.objectStore(STORE).put(value);
    });
  } finally {
    db.close();
  }
}

async function removeStored(): Promise<void> {
  const db = await openSessionDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Could not clear session'));
      transaction.onabort = () => reject(transaction.error || new Error('Clearing session aborted'));
      transaction.objectStore(STORE).delete(SESSION_ID);
    });
  } finally {
    db.close();
  }
}

export async function rememberFiveDayKey(key: CryptoKey, vaultSalt: string): Promise<number | null> {
  if (key.extractable || key.algorithm.name !== 'AES-GCM') {
    throw new Error('Only non-extractable AES-GCM keys can be remembered');
  }
  const expiresAt = Date.now() + FIVE_DAYS_MS;
  try {
    await putStored({ id: SESSION_ID, key, vaultSalt, expiresAt });
    return expiresAt;
  } catch {
    // Private browsing or blocked IndexedDB: keep the current session open,
    // but never store a plaintext password/key as a fallback.
    return null;
  }
}

export async function restoreFiveDayKey(vaultSalt: string): Promise<RememberedKey | null> {
  try {
    const existing = await getStored();
    if (!existing) return null;
    if (!sessionIsActive(existing.expiresAt) ||
        existing.vaultSalt !== vaultSalt ||
        !(existing.key instanceof CryptoKey) ||
        existing.key.extractable ||
        existing.key.algorithm.name !== 'AES-GCM' ||
        !existing.key.usages.includes('decrypt')) {
      await clearFiveDayKey();
      return null;
    }
    return { key: existing.key, expiresAt: existing.expiresAt };
  } catch {
    return null;
  }
}

export async function clearFiveDayKey(): Promise<void> {
  try {
    await removeStored();
  } catch {
    // Lock memory even if browser storage is denied.
  }
}

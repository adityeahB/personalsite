/**
 * Robust multi-tier storage engine for photos and site content.
 * 1. Server persistence (writes to disk / public/uploads/ for production builds & all visitors)
 * 2. IndexedDB storage (500MB+ browser quota, immune to 5MB localStorage quota limits)
 * 3. Graceful localStorage fallback with QuotaExceeded error shielding
 */

const DB_NAME = 'anb_portfolio_storage_v1';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get item from IndexedDB
export async function getFromIndexedDB(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(PHOTO_STORE, 'readonly');
      const store = transaction.objectStore(PHOTO_STORE);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result ? req.result.dataUrl : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

// Save item to IndexedDB (hundreds of MBs available)
export async function saveToIndexedDB(key: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const req = store.put({ key, dataUrl, updatedAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save to IndexedDB', err);
  }
}

// Delete item from IndexedDB
export async function deleteFromIndexedDB(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(PHOTO_STORE, 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    // Ignore error
  }
}

/**
 * Universal photo saver:
 * 1. Attempts to persist to server /api/upload (so it becomes a permanent static asset on disk).
 * 2. Saves to IndexedDB (preventing any browser storage quota errors).
 * 3. Saves to localStorage safely if small enough (ignoring quota exceptions).
 */
export async function persistPhoto(key: string, dataUrl: string): Promise<string> {
  // 1. Try server upload if backend is active
  let finalUrl = dataUrl;
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, dataUrl }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        finalUrl = data.url;
      }
    }
  } catch (e) {
    // Server endpoint not reachable or offline; continue to client storage
  }

  // 2. Always store in IndexedDB (high storage quota)
  await saveToIndexedDB(key, finalUrl);

  // 3. Store in localStorage safely (wrap in try-catch to prevent crash if quota exceeded)
  try {
    localStorage.setItem(key, finalUrl);
  } catch (e) {
    console.warn(`localStorage quota exceeded for key ${key}; successfully retained in IndexedDB.`);
  }

  return finalUrl;
}

/**
 * Universal photo loader:
 * Checks localStorage first, then IndexedDB.
 */
export async function loadPersistedPhoto(key: string, fallbackUrl: string): Promise<string> {
  // Check localStorage first
  try {
    const local = localStorage.getItem(key);
    if (local) return local;
  } catch (e) {
    // ignore
  }

  // Check IndexedDB
  const idbVal = await getFromIndexedDB(key);
  if (idbVal) return idbVal;

  return fallbackUrl;
}

/**
 * Remove photo from all tiers
 */
export async function removePersistedPhoto(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignore
  }

  await deleteFromIndexedDB(key);

  // Attempt to notify server
  try {
    await fetch(`/api/upload/${encodeURIComponent(key)}`, { method: 'DELETE' });
  } catch (e) {
    // ignore
  }
}

/**
 * Sync entire site content to server so `npm run build` bundles it for published version
 */
export async function syncSiteContentToServer(content: any): Promise<boolean> {
  try {
    const res = await fetch('/api/site-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Fetch all persisted photos saved in the codebase
 */
export async function fetchAllPersistedPhotos(): Promise<any> {
  try {
    const res = await fetch('/api/sync-photos');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // fallback to static file if served
    try {
      const staticRes = await fetch('/persistedPhotos.json');
      if (staticRes.ok) return await staticRes.json();
    } catch (_) {}
  }
  return null;
}

/**
 * Sweeps all locally saved photos and URLs from browser localStorage and IndexedDB,
 * and POSTs them in bulk to /api/sync-photos so they are written to src/persistedPhotos.json
 * and baked permanently into the published build.
 */
export async function syncAllLocalPhotosToServer(): Promise<{ success: boolean; count: number; photos: any }> {
  try {
    const payload: {
      portrait?: string;
      leve?: string;
      rowbot?: string;
      certificates: Record<string, string>;
      artworks: Record<string, string>;
    } = {
      certificates: {},
      artworks: {},
    };

    let count = 0;

    // Check main slots
    const portrait = localStorage.getItem('anb_photo_portrait') || (await getFromIndexedDB('anb_photo_portrait'));
    if (portrait && !portrait.includes('aditya_portrait_1794058070153.jpg')) {
      payload.portrait = portrait;
      count++;
    }

    const leve = localStorage.getItem('anb_photo_leve') || (await getFromIndexedDB('anb_photo_leve'));
    if (leve && !leve.includes('leve_community_1794058095294.jpg')) {
      payload.leve = leve;
      count++;
    }

    const rowbot = localStorage.getItem('anb_photo_rowbot') || (await getFromIndexedDB('anb_photo_rowbot'));
    if (rowbot && !rowbot.includes('rowbot_buoy_1794058083297.jpg')) {
      payload.rowbot = rowbot;
      count++;
    }

    // Check all certificate slots
    const certIds = ['cert-1', 'cert-2', 'cert-3', 'cert-4', 'cert-5', 'cert-6', 'cert-7', 'cert-8'];
    for (const id of certIds) {
      const val = localStorage.getItem(`anb_cert_${id}`) || (await getFromIndexedDB(`anb_cert_${id}`));
      if (val) {
        payload.certificates[id] = val;
        count++;
      }
    }

    // Check all artwork slots
    const artIds = ['art-1', 'art-2', 'art-3', 'art-4', 'art-5', 'art-6', 'art-7', 'art-8'];
    for (const id of artIds) {
      const val = localStorage.getItem(`anb_art_${id}`) || (await getFromIndexedDB(`anb_art_${id}`));
      if (val) {
        payload.artworks[id] = val;
        count++;
      }
    }

    // Also scan any other custom keys in localStorage
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key);
        if (!val) continue;

        if (key.startsWith('anb_cert_') && !key.includes('meta')) {
          const id = key.replace('anb_cert_', '');
          if (!payload.certificates[id]) {
            payload.certificates[id] = val;
            count++;
          }
        } else if (key.startsWith('anb_art_') && !key.includes('meta')) {
          const id = key.replace('anb_art_', '');
          if (!payload.artworks[id]) {
            payload.artworks[id] = val;
            count++;
          }
        }
      }
    }

    if (count === 0) {
      return { success: true, count: 0, photos: payload };
    }

    const res = await fetch('/api/sync-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, count, photos: data.photos || payload };
    }

    return { success: false, count, photos: payload };
  } catch (e) {
    console.warn('syncAllLocalPhotosToServer failed:', e);
    return { success: false, count: 0, photos: {} };
  }
}


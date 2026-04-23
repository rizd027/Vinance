/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { createHandlerBoundToURL } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

// ── 1. Precache all build assets ──────────────────────────────────────────────
self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ── 2. SPA Navigation fallback ────────────────────────────────────────────────
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

// ── 3. Google Fonts ───────────────────────────────────────────────────────────
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
  'GET'
);

registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new CacheFirst({
    cacheName: 'gstatic-fonts-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
  'GET'
);

// ── 4. Google Apps Script API (NetworkFirst with cache fallback) ──────────────
registerRoute(
  ({ url }) => url.origin === 'https://script.google.com',
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
  'GET'
);

// ── 5. Background Sync ────────────────────────────────────────────────────────
// The 'sync' event fires when:
//   a) The app registers `registration.sync.register('kb-sync-pending')`
//   b) The browser/OS detects connectivity is restored (even if tab is closed)

self.addEventListener('sync', (event: any) => {
  if (event.tag === 'kb-sync-pending') {
    console.log('[SW] Background Sync triggered: kb-sync-pending');
    event.waitUntil(processSyncQueue());
  }
});

/**
 * Reads the sync queue from IndexedDB and posts each queued item to the API.
 * Uses the same data format as the main app.
 */
async function processSyncQueue(): Promise<void> {
  // Open our IndexedDB sync store directly (without localforage in SW context)
  const db = await openDB();
  const queue = await getAllFromStore(db, 'kb_sync_queue', 'queue');
  if (!queue || queue.length === 0) {
    console.log('[SW] Sync queue is empty.');
    return;
  }

  // Get the script URL from the main store
  const userData = await getFromStore(db, 'kb_main', 'kb_user');
  const scriptUrl = userData?.scriptUrl;
  if (!scriptUrl) {
    console.warn('[SW] No script URL in stored user — cannot sync');
    return;
  }

  console.log(`[SW] Processing ${queue.length} queued item(s)…`);

  const toRemove: string[] = [];

  for (const item of queue) {
    const { _queueId, _timestamp, _retries, ...payload } = item;

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      if (result.success) {
        toRemove.push(_queueId);
        console.log(`[SW] ✓ Synced: ${payload.action}`);
      } else {
        console.warn(`[SW] Server rejected: ${payload.action}`, result.error);
      }
    } catch (err) {
      console.error(`[SW] ✗ Failed to sync: ${payload.action}`, err);
      // Don't break — try remaining items; failing item stays in queue for retry
    }
  }

  // Remove successfully synced items
  if (toRemove.length > 0) {
    const updatedQueue = queue.filter((item: any) => !toRemove.includes(item._queueId));
    await setInStore(db, 'kb_sync_queue', 'queue', updatedQueue);

    // Notify all open clients so the UI can refresh
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        synced: toRemove.length,
        remaining: updatedQueue.length,
      });
    }
  }
}

// ── Minimal IndexedDB helpers (no external libs in SW) ───────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Open the same DB that localforage uses
    const req = indexedDB.open('VinanceFinance');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllFromStore(db: IDBDatabase, storeName: string, key: string): Promise<any[]> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

function getFromStore(db: IDBDatabase, storeName: string, key: string): Promise<any> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function setInStore(db: IDBDatabase, storeName: string, key: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

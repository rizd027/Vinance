import localforage from 'localforage';
import { AppData, User } from '../types';

// Initialize localForage with dedicated stores
const mainStore = localforage.createInstance({
  name: 'VinanceFinance',
  storeName: 'vinance_main',
  description: 'Primary app data and settings',
});

const syncStore = localforage.createInstance({
  name: 'VinanceFinance',
  storeName: 'vinance_sync_queue',
  description: 'Offline sync queue',
});

export const storage = {
  // ── Financial Data ─────────────────────────────────────────────────────────
  async saveData(data: AppData): Promise<void> {
    await mainStore.setItem('kb_data', data);
  },

  async getData(): Promise<AppData | null> {
    return await mainStore.getItem<AppData>('kb_data');
  },

  // ── User ───────────────────────────────────────────────────────────────────
  async saveUser(user: User): Promise<void> {
    await mainStore.setItem('kb_user', user);
  },

  async getUser(): Promise<User | null> {
    return await mainStore.getItem<User>('kb_user');
  },

  // ── Settings ───────────────────────────────────────────────────────────────
  async saveSettings(settings: any): Promise<void> {
    await mainStore.setItem('kb_settings', settings);
  },

  async getSettings(): Promise<any> {
    return await mainStore.getItem('kb_settings');
  },

  async saveTheme(theme: 'light' | 'dark'): Promise<void> {
    await mainStore.setItem('kb_theme', theme);
  },

  async getTheme(): Promise<'light' | 'dark' | null> {
    return await mainStore.getItem<'light' | 'dark'>('kb_theme');
  },

  // ── PIN ────────────────────────────────────────────────────────────────────
  async savePin(pin: string): Promise<void> {
    await mainStore.setItem('kb_pin', pin);
  },

  async getPin(): Promise<string | null> {
    return await mainStore.getItem<string>('kb_pin');
  },

  async removePin(): Promise<void> {
    await mainStore.removeItem('kb_pin');
  },

  // ── Sync Queue ─────────────────────────────────────────────────────────────
  // IMPORTANT: we use `_queueId` (not `id`) to avoid overwriting the
  // transaction's own `id` field (which is needed for delete/update).

  async getSyncQueue(): Promise<any[]> {
    return (await syncStore.getItem<any[]>('queue')) || [];
  },

  async addToSyncQueue(item: any): Promise<void> {
    const queue = await this.getSyncQueue();
    const queueItem = {
      ...item,
      _queueId: crypto.randomUUID(), // separate key — does NOT overwrite item.id
      _timestamp: Date.now(),
      _retries: 0,
    };
    queue.push(queueItem);
    await syncStore.setItem('queue', queue);

    // Ask the Service Worker to register a Background Sync tag so the
    // browser/OS will call us even if the app tab is closed.
    try {
      if ('serviceWorker' in navigator && 'SyncManager' in (window as any)) {
        const reg = await navigator.serviceWorker.ready;
        await (reg as any).sync.register('vinance-sync-pending');
        console.log('[Storage] Background Sync registered: vinance-sync-pending');
      }
    } catch (err) {
      console.warn('[Storage] Background Sync registration failed (non-critical):', err);
    }
  },

  async removeFromSyncQueue(queueId: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const updated = queue.filter((item) => item._queueId !== queueId);
    await syncStore.setItem('queue', updated);
  },

  async incrementRetry(queueId: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const updated = queue.map((item) =>
      item._queueId === queueId
        ? { ...item, _retries: (item._retries || 0) + 1 }
        : item
    );
    await syncStore.setItem('queue', updated);
  },

  async clearSyncQueue(): Promise<void> {
    await syncStore.setItem('queue', []);
  },

  async getPendingCount(): Promise<number> {
    const q = await this.getSyncQueue();
    return q.length;
  },

  // ── Clear all ──────────────────────────────────────────────────────────────
  async clearAll(): Promise<void> {
    await mainStore.clear();
    await syncStore.clear();
  },
};

import type { AppData, Transaction, User } from '../types';
import { storage } from './storage';

let currentScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxb9xd4Jh5pBWCrdfjc21hDmOFBs5F905s5C0QhQOz2nH9LSW0jBt36EyZN9buoqJJw/exec';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Read last-good data from both IndexedDB and localStorage */
async function readCachedData(): Promise<AppData | null> {
  try {
    const idb = await storage.getData();
    if (idb && (idb.transactions?.length || idb.budgets?.length)) return idb;
  } catch (_) { /* ignore */ }

  try {
    const raw = localStorage.getItem('kb_data');
    if (raw) {
      const parsed: AppData = JSON.parse(raw);
      if (parsed && (parsed.transactions || parsed.budgets)) {
        await storage.saveData(parsed).catch(() => {});
        return parsed;
      }
    }
  } catch (_) { /* ignore */ }

  return null;
}

// ─── API object ───────────────────────────────────────────────────────────────

export const api = {
  setBaseUrl(url: string) {
    currentScriptUrl = url;
  },

  getBaseUrl() {
    return currentScriptUrl;
  },

  // ── Core POST with offline queue ──────────────────────────────────────────
  async request(data: any) {
    if (!currentScriptUrl) throw new Error('API URL not configured');

    const isMutation = [
      'addTransaction', 'updateTransaction', 'deleteTransaction',
      'updateBudget', 'deleteBudget',
      'updateGoal', 'deleteGoal',
      'updateNote', 'deleteNote'
    ].includes(data.action);

    // Offline → queue immediately without trying network
    if (!navigator.onLine && isMutation) {
      console.warn('[API] Offline – queuing:', data.action);
      await storage.addToSyncQueue(data);
      return { success: true, offline: true };
    }

    try {
      const response = await fetch(currentScriptUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (err) {
      // Network failure on mutation → queue for later
      if (isMutation) {
        console.warn('[API] Network error – queuing:', data.action);
        await storage.addToSyncQueue(data);
        return { success: true, offline: true };
      }
      throw err;
    }
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.request({ action: 'login', email, password });
  },

  async register(name: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.request({ action: 'register', name, email, password });
  },

  async sendResetCode(email: string): Promise<{ success: boolean; error?: string }> {
    return this.request({ action: 'sendResetCode', email });
  },

  async resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    return this.request({ action: 'resetPasswordWithCode', email, code, newPassword });
  },

  async sendRegisterCode(email: string): Promise<{ success: boolean; error?: string }> {
    return this.request({ action: 'sendRegisterCode', email });
  },

  async sendUpdateCode(email: string): Promise<{ success: boolean; error?: string }> {
    return this.request({ action: 'sendUpdateCode', email });
  },

  async verifyRegisterAndCreate(name: string, email: string, password: string, code: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.request({ action: 'verifyRegisterAndCreate', name, email, password, code });
  },

  // ── Data Fetch ─────────────────────────────────────────────────────────────
  async getData(userId: string): Promise<AppData> {
    if (navigator.onLine) {
      try {
        const url = `${currentScriptUrl}?action=getData&userId=${userId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();

        if (result.success) {
          const appData: AppData = {
            transactions: result.transactions || [],
            budgets: result.budgets || [],
            goals: result.goals || [],
            notes: result.notes || [],
          };
          // Persist fresh data to BOTH caches
          storage.saveData(appData).catch(console.error);
          localStorage.setItem('kb_data', JSON.stringify(appData));
          return this.applyPendingChanges(appData);
        }
        throw new Error(result.error || 'Server returned failure');
      } catch (err) {
        console.warn('[API] Online fetch failed, falling back to cache:', err);
      }
    }

    console.warn('[API] Using cached data (offline or fetch failed)');
    const cached = await readCachedData();
    if (cached) return this.applyPendingChanges(cached);

    // Absolute fallback – never throw so the app always renders
    return { transactions: [], budgets: [], goals: [], notes: [] };
  },

  // ── Merge pending offline ops into in-memory data ──────────────────────────
  async applyPendingChanges(data: AppData): Promise<AppData> {
    const queue = await storage.getSyncQueue();
    if (queue.length === 0) return data;

    const transactions = [...data.transactions];
    const budgets = [...data.budgets];
    const goals = [...(data.goals || [])];
    const notes = [...(data.notes || [])];

    for (const item of queue) {
      // Strip internal queue meta fields before reading data
      const { _queueId, _timestamp, _retries, ...payload } = item;

      if (payload.action === 'addTransaction') {
        if (!transactions.find((t) => t.id === payload.id)) {
          transactions.unshift({ ...payload, temp: true });
        }
      } else if (payload.action === 'deleteTransaction') {
        const idx = transactions.findIndex((t) => t.id === payload.id);
        if (idx > -1) transactions.splice(idx, 1);
      } else if (payload.action === 'updateTransaction') {
        const idx = transactions.findIndex((t) => t.id === payload.id);
        if (idx > -1) transactions[idx] = { ...transactions[idx], ...payload };
      } else if (payload.action === 'updateBudget') {
        const idx = budgets.findIndex((b) => b.category === payload.category);
        if (idx > -1) budgets[idx] = { ...budgets[idx], limit: payload.limit };
        else budgets.push({ id: payload.id || crypto.randomUUID(), userId: payload.userId, category: payload.category, limit: payload.limit, period: 'Monthly' });
      } else if (payload.action === 'deleteBudget') {
        const idx = budgets.findIndex((b) => b.category === payload.category);
        if (idx > -1) budgets.splice(idx, 1);
      } else if (payload.action === 'updateGoal') {
        const idx = goals.findIndex((g) => g.id === payload.id);
        if (idx > -1) goals[idx] = { ...goals[idx], ...payload };
        else goals.unshift({ ...payload, temp: true });
      } else if (payload.action === 'deleteGoal') {
        const idx = goals.findIndex((g) => g.id === payload.id);
        if (idx > -1) goals.splice(idx, 1);
      } else if (payload.action === 'updateNote') {
        const idx = notes.findIndex((n) => n.id === payload.id);
        if (idx > -1) notes[idx] = { ...notes[idx], ...payload };
        else notes.unshift({ ...payload, temp: true });
      } else if (payload.action === 'deleteNote') {
        const idx = notes.findIndex((n) => n.id === payload.id);
        if (idx > -1) notes.splice(idx, 1);
      }
    }

    return { transactions, budgets, goals, notes };
  },

  // ── Background / foreground sync ───────────────────────────────────────────
  /**
   * Called by:
   *  1. window 'online' event (foreground)
   *  2. SW 'sync' event via postMessage (background)
   *
   * @param onProgress - optional callback for UI feedback (synced, failed, total)
   */
  async syncPendingRequests(
    onProgress?: (status: { synced: number; failed: number; total: number }) => void
  ): Promise<{ synced: number; failed: number }> {
    if (!navigator.onLine) return { synced: 0, failed: 0 };
    if (!currentScriptUrl) {
      const saved = localStorage.getItem('kb_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.scriptUrl) currentScriptUrl = u.scriptUrl;
      }
      if (!currentScriptUrl) return { synced: 0, failed: 0 };
    }

    const queue = await storage.getSyncQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    console.log(`[Sync] Batch processing ${queue.length} item(s)…`);

    const payloads = queue.map(item => {
      const { _queueId, _timestamp, _retries, ...payload } = item;
      return { ...payload, _queueId }; // Keep queueId to track results
    });

    try {
      const response = await fetch(currentScriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'batchAction', operations: payloads }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      if (result.success && result.results) {
        let synced = 0;
        let failed = 0;

        for (let i = 0; i < result.results.length; i++) {
          const res = result.results[i];
          const qId = payloads[i]._queueId;
          if (res.success) {
            await storage.removeFromSyncQueue(qId);
            synced++;
          } else {
            await storage.incrementRetry(qId);
            failed++;
          }
        }
        onProgress?.({ synced, failed, total: queue.length });
        return { synced, failed };
      }
      throw new Error(result.error || 'Batch failed');
    } catch (err) {
      console.error(`[Sync] Batch error:`, err);
      return { synced: 0, failed: queue.length };
    }
  },

  // ── CRUD helpers ───────────────────────────────────────────────────────────
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<{ success: boolean; id?: string; error?: string; offline?: boolean }> {
    return this.request({ action: 'addTransaction', ...transaction });
  },

  async deleteTransaction(id: string, userId: string): Promise<{ success: boolean; error?: string; offline?: boolean }> {
    return this.request({ action: 'deleteTransaction', id, userId });
  },

  async updateTransaction(transaction: Transaction): Promise<{ success: boolean; error?: string; offline?: boolean }> {
    return this.request({ action: 'updateTransaction', ...transaction });
  },

  async updateBudget(userId: string, category: string, limit: number): Promise<{ success: boolean; error?: string; offline?: boolean }> {
    return this.request({ action: 'updateBudget', userId, category, limit });
  },

  async deleteBudget(userId: string, category: string): Promise<{ success: boolean; error?: string; offline?: boolean }> {
    return this.request({ action: 'deleteBudget', userId, category });
  },

  async updateUser(userId: string, updates: Partial<User & { password?: string }>, code?: string, oldPassword?: string): Promise<{ success: boolean; error?: string; offline?: boolean }> {
    return this.request({ action: 'updateUser', id: userId, ...updates, code, oldPassword });
  },

  // Goals
  async updateGoal(userId: string, goal: any): Promise<{ success: boolean; error?: string; offline?: boolean }> {
    return this.request({ action: 'updateGoal', userId, ...goal });
  },

  async deleteGoal(userId: string, id: string): Promise<{ success: boolean; error?: string; offline?: boolean }> {
    return this.request({ action: 'deleteGoal', userId, id });
  },

  // Notes
  async updateNote(userId: string, note: any): Promise<{ success: boolean; error?: string; offline?: boolean }> {
    return this.request({ action: 'updateNote', userId, ...note });
  },

  async deleteNote(userId: string, id: string): Promise<{ success: boolean; error?: string; offline?: boolean }> {
    return this.request({ action: 'deleteNote', userId, id });
  },

  async sendFeedback(userId: string, userName: string, feedback: string): Promise<{ success: boolean; error?: string; offline?: boolean }> {
    return this.request({ action: 'sendFeedback', userId, userName, feedback });
  },
};

// useNotifications.ts — Persistent activity notification system
// Notifications are stored in localStorage and auto-expire after 1 day (24 hours).

import { ref, computed } from 'vue';

export type NotifType = 'success' | 'error' | 'info' | 'warning';

export interface ActivityNotif {
  id: string;
  message: string;
  type: NotifType;
  timestamp: number; // epoch ms
  category?: string;
}

const STORAGE_KEY = 'kb_notifications';
const TTL_MS = 24 * 60 * 60 * 1000; // 1 hari

// Shared reactive state (singleton — same as useAppState pattern)
const notifications = ref<ActivityNotif[]>([]);

// Global panel open/close state — shared across all components
const isPanelOpen = ref(false);

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const all: ActivityNotif[] = JSON.parse(raw);
    const now = Date.now();
    // Filter out expired entries (older than 1 day)
    notifications.value = all.filter(n => now - n.timestamp < TTL_MS);
    saveToStorage();
  } catch {
    notifications.value = [];
  }
};

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value));
};

// Init on module load
loadFromStorage();

export function useNotifications() {
  const unreadCount = computed(() => notifications.value.length);

  const addNotif = (message: string, type: NotifType = 'info', category?: string) => {
    const id = Math.random().toString(36).substring(2, 11);
    const notif: ActivityNotif = {
      id,
      message,
      type,
      timestamp: Date.now(),
      category,
    };
    // Prepend newest first
    notifications.value = [notif, ...notifications.value];
    saveToStorage();
  };

  const removeNotif = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
    saveToStorage();
  };

  const clearAll = () => {
    notifications.value = [];
    saveToStorage();
  };

  /**
   * Purge any notifications that have exceeded the 1-day TTL.
   * Call this periodically or on app mount.
   */
  const purgeExpired = () => {
    const now = Date.now();
    const before = notifications.value.length;
    notifications.value = notifications.value.filter(n => now - n.timestamp < TTL_MS);
    if (notifications.value.length !== before) saveToStorage();
  };

  const openPanel = () => { isPanelOpen.value = true; };
  const closePanel = () => { isPanelOpen.value = false; };
  const togglePanel = () => { isPanelOpen.value = !isPanelOpen.value; };

  return {
    notifications,
    unreadCount,
    isPanelOpen,
    addNotif,
    removeNotif,
    clearAll,
    purgeExpired,
    openPanel,
    closePanel,
    togglePanel,
  };
}

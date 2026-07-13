import { ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import type { User, Transaction, Goal, Note, AppData } from '../types';
import { api } from '../lib/api';
import { storage } from '../lib/storage';
import i18n from '../i18n';
import { useNotifications } from './useNotifications';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface DialogConfig {
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'prompt';
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

// Global shared state for Vue 3 Composables (so it acts like a store)
const user = ref<User | null>(null);
const activeTab = ref('home');
const data = reactive<AppData>({
  transactions: [],
  budgets: [],
  goals: [],
  notes: []
});
const loading = ref(false);
const syncing = ref(false);
const isOffline = ref(!navigator.onLine);
const isDark = ref(false);
const appPin = ref<string | null>(null);
const isUnlocked = ref(true);
const isSettingPin = ref(false);
const toasts = ref<Toast[]>([]);
const activeDialog = ref<DialogConfig | null>(null);
const showGenSettings = ref(false);
const showExportModal = ref(false);
const appSettings = ref({
  notifBudgets: true,
  notifSync: true,
  language: 'id'
});

interface OpenModal {
  name: string;
  close: () => void;
}
const openModalsStack = ref<OpenModal[]>([]);
let ignoreNextPopstate = false;

export function registerModal(name: string, close: () => void) {
  if (openModalsStack.value.some(m => m.name === name)) return;
  openModalsStack.value.push({ name, close });
  const currentState = window.history.state || {};
  window.history.pushState({ ...currentState, isModal: true, modalName: name }, '');
}

export function unregisterModal(name: string) {
  const index = openModalsStack.value.findIndex(m => m.name === name);
  if (index !== -1) {
    openModalsStack.value.splice(index, 1);
    ignoreNextPopstate = true;
    window.history.back();
  }
}

export function useAppState() {
  const { addNotif, purgeExpired } = useNotifications();

  // --- Initialization ---
  const init = () => {
    // Theme
    isDark.value = localStorage.getItem('kb_theme') === 'dark';
    applyTheme();

    // User
    const savedUser = localStorage.getItem('kb_user');
    if (savedUser) {
      user.value = JSON.parse(savedUser);
      if (user.value?.scriptUrl) {
        api.setBaseUrl(user.value.scriptUrl);
      }
    }

    // PIN
    appPin.value = localStorage.getItem('kb_pin');
    isUnlocked.value = !appPin.value;



    // App Settings
    const savedSettings = localStorage.getItem('kb_settings');
    if (savedSettings) {
      appSettings.value = JSON.parse(savedSettings);
    }

    // Data
    if (user.value) {
      const savedData = localStorage.getItem('kb_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        data.transactions = parsed.transactions || [];
        data.budgets = parsed.budgets || [];
        data.goals = parsed.goals || [];
        data.notes = parsed.notes || [];
      }
      fetchData();
    }
    // Purge any notifications older than 1 day
    purgeExpired();

    // Listen to popstate for back button modal closing
    window.addEventListener('popstate', () => {
      if (ignoreNextPopstate) {
        ignoreNextPopstate = false;
        return;
      }

      if (openModalsStack.value.length > 0) {
        const topModal = openModalsStack.value.pop();
        if (topModal) {
          topModal.close();
        }
      }
    });
  };

  // --- Watchers & Helpers ---
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kb_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kb_theme', 'light');
    }
  };

  watch(isDark, applyTheme);

  watch(activeDialog, (newVal) => {
    if (newVal) {
      registerModal('global-dialog', () => {
        if (activeDialog.value) {
          activeDialog.value.onCancel();
        }
      });
    } else {
      unregisterModal('global-dialog');
    }
  });

  watch(showExportModal, (newVal) => {
    if (newVal) {
      registerModal('global-export', () => { showExportModal.value = false; });
    } else {
      unregisterModal('global-export');
    }
  });

  watch(isSettingPin, (newVal) => {
    if (newVal) {
      registerModal('global-pin-setup', () => { isSettingPin.value = false; });
    } else {
      unregisterModal('global-pin-setup');
    }
  });



  watch(appSettings, (newSettings) => {
    localStorage.setItem('kb_settings', JSON.stringify(newSettings));
    // Sync i18n locale reactively
    if (newSettings.language) {
      i18n.global.locale.value = newSettings.language as 'id' | 'en' | 'zh' | 'ja';
    }
  }, { deep: true });

  watch(data, (newData) => {
    localStorage.setItem('kb_data', JSON.stringify(newData));
  }, { deep: true });

  // --- Toast Helpers ---
  const showToast = (message: string, type: Toast['type'] = 'info', category?: 'sync' | 'budget') => {
    if (category === 'sync' && !appSettings.value.notifSync && type === 'success') return;
    if (category === 'budget' && !appSettings.value.notifBudgets) return;

    const id = Math.random().toString(36).substring(2, 9);
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 3000);

    // Persist to activity notifications
    addNotif(message, type, category);
  };

  // --- Dialog Helpers (Promise-based) ---
  const confirm = (message: string, title = 'Konfirmasi'): Promise<boolean> => {
    return new Promise((resolve) => {
      activeDialog.value = {
        title,
        message,
        type: 'confirm',
        confirmText: 'Ya, Lanjutkan',
        cancelText: 'Batal',
        onConfirm: () => {
          activeDialog.value = null;
          resolve(true);
        },
        onCancel: () => {
          activeDialog.value = null;
          resolve(false);
        }
      };
    });
  };

  const alert = (message: string, title = 'Pemberitahuan'): Promise<void> => {
    return new Promise((resolve) => {
      activeDialog.value = {
        title,
        message,
        type: 'alert',
        confirmText: 'Mengerti',
        onConfirm: () => {
          activeDialog.value = null;
          resolve();
        },
        onCancel: () => {
          activeDialog.value = null;
          resolve();
        }
      };
    });
  };

  // --- Data & Connectivity Sync ---
  const fetchData = async () => {
    if (!user.value) return;
    loading.value = true;
    try {
      const res = await api.getData(user.value.id);
      data.transactions = res.transactions || [];
      data.budgets = res.budgets || [];
      data.goals = res.goals || data.goals || [];
      data.notes = res.notes || data.notes || [];
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      loading.value = false;
    }
  };

  const runSync = async () => {
    if (!navigator.onLine || !user.value) return;
    const count = await storage.getPendingCount();
    if (count > 0) {
      syncing.value = true;
      try {
        const { synced, failed } = await api.syncPendingRequests();
        if (synced > 0) showToast(`✓ ${synced} data tertunda berhasil disinkronkan`, 'success');
        if (failed > 0) showToast(`${failed} data gagal disinkronkan`, 'warning');
        await fetchData();
      } finally {
        syncing.value = false;
      }
    }
  };

  // Event handlers for online/offline
  const handleOnline = async () => {
    isOffline.value = false;
    await runSync();
  };
  const handleOffline = () => {
    isOffline.value = true;
  };

  onMounted(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  });

  // --- Actions ---
  const handleLogin = (newUser: User) => {
    data.transactions = [];
    data.budgets = [];
    data.goals = [];
    data.notes = [];
    user.value = newUser;
    if (newUser.scriptUrl) api.setBaseUrl(newUser.scriptUrl);
    localStorage.setItem('kb_user', JSON.stringify(newUser));
    fetchData();
  };

  const handleLogout = () => {
    user.value = null;
    data.transactions = [];
    data.budgets = [];
    data.goals = [];
    data.notes = [];
    localStorage.removeItem('kb_user');
    localStorage.removeItem('kb_data');
    localStorage.removeItem('kb_pin');
    localStorage.removeItem('kb_settings');
    appPin.value = null;
    isDark.value = false;
    activeTab.value = 'home';
    openModalsStack.value = [];
    window.location.replace('/');
  };

  const handleAddTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user.value) return;
    const tempId = 'temp-' + Date.now();
    const newTransaction: Transaction = { ...t, id: tempId, userId: user.value.id };
    data.transactions.unshift(newTransaction);

    syncing.value = true;
    try {
      const res = await api.addTransaction({ ...t, userId: user.value.id });
      if (res.success && !res.offline && res.id) {
        data.transactions = data.transactions.map((tr) =>
          tr.id === tempId ? { ...tr, id: res.id! } : tr
        );
        const typeLabel = t.type === 'Income' ? 'Pemasukan' : 'Pengeluaran';
        addNotif(`✅ Transaksi ${typeLabel} — ${t.category} berhasil ditambahkan`, 'success', 'transaction');
      } else if (res.offline) {
        showToast('Tersimpan secara lokal (Offline)', 'info');
      } else if (!isOffline.value) {
        data.transactions = data.transactions.filter((tr) => tr.id !== tempId);
        showToast('Gagal menambah transaksi', 'error');
      }
    } catch (err) {
      if (!isOffline.value) {
        data.transactions = data.transactions.filter((tr) => tr.id !== tempId);
        showToast('Gagal menambah transaksi (koneksi bermasalah)', 'error');
      }
    } finally {
      syncing.value = false;
    }
  };

  const handleUpdateTransaction = async (t: Transaction) => {
    if (!user.value) return;
    const prevTx = [...data.transactions];
    data.transactions = data.transactions.map((tr) => (tr.id === t.id ? t : tr));

    syncing.value = true;
    try {
      const res = await api.updateTransaction(t);
      if (!res.success && !isOffline.value) {
        data.transactions = prevTx;
        showToast('Gagal mengedit transaksi: ' + res.error, 'error');
      } else if (res.success) {
        const typeLabel = t.type === 'Income' ? 'Pemasukan' : 'Pengeluaran';
        addNotif(`✏️ Transaksi ${typeLabel} — ${t.category} diperbarui`, 'info', 'transaction');
      }
    } catch (err) {
      if (!isOffline.value) {
        data.transactions = prevTx;
        showToast('Gagal mengedit transaksi (koneksi bermasalah)', 'error');
      }
    } finally {
      syncing.value = false;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user.value) return;
    if (!(await confirm('Hapus transaksi ini?'))) return;

    const prevTx = [...data.transactions];
    data.transactions = data.transactions.filter((t) => t.id !== id);

    syncing.value = true;
    try {
      const res = await api.deleteTransaction(id, user.value.id);
      if (!res.success && !isOffline.value) {
        data.transactions = prevTx;
        showToast('Gagal menghapus transaksi', 'error');
      } else {
        showToast('Transaksi berhasil dihapus', 'success', 'sync');
      }
    } catch (err) {
      if (!isOffline.value) {
        data.transactions = prevTx;
        showToast('Gagal menghapus transaksi', 'error');
      }
    } finally {
      syncing.value = false;
    }
  };

  const handleUpdateBudget = async (category: string, limit: number) => {
    if (!user.value) return;
    const prevBudgets = [...data.budgets];

    const existing = data.budgets.find((b) => b.category === category);
    if (existing) {
      data.budgets = data.budgets.map((b) => (b.category === category ? { ...b, limit } : b));
    } else {
      data.budgets.push({ id: 'temp-' + Date.now(), userId: user.value.id, category, limit, period: 'Month' });
    }

    syncing.value = true;
    try {
      const res = await api.updateBudget(user.value.id, category, limit);
      if (!res.success && !isOffline.value) {
        data.budgets = prevBudgets;
        showToast('Gagal update budget', 'error');
      } else {
        showToast('Budget berhasil diperbarui', 'success', 'budget');
      }
    } catch (err) {
      if (!isOffline.value) {
        data.budgets = prevBudgets;
        showToast('Gagal update budget', 'error');
      }
    } finally {
      syncing.value = false;
    }
  };

  const handleDeleteBudget = async (category: string) => {
    if (!user.value) return;
    if (!(await confirm(`Hapus anggaran "${category}"?`, 'Hapus Anggaran'))) return;

    const prevBudgets = [...data.budgets];
    data.budgets = data.budgets.filter((b) => b.category !== category);

    syncing.value = true;
    try {
      const res = await api.deleteBudget(user.value.id, category);
      if (!res.success && !isOffline.value) {
        data.budgets = prevBudgets;
        showToast('Gagal menghapus budget', 'error');
      } else {
        showToast('Budget berhasil dihapus', 'success', 'budget');
      }
    } catch (err) {
      if (!isOffline.value) {
        data.budgets = prevBudgets;
        showToast('Gagal menghapus budget', 'error');
      }
    } finally {
      syncing.value = false;
    }
  };

  const handleImportTransactions = async (newTransactions: Omit<Transaction, 'id'>[]) => {
    if (!user.value) return;
    syncing.value = true;

    const tempTx = newTransactions.map((t) => ({
      ...t,
      id: 'temp-' + Math.random().toString(36).substring(2, 11),
      userId: user.value!.id
    }));

    data.transactions.unshift(...tempTx);

    try {
      for (const t of newTransactions) {
        await api.addTransaction({ ...t, userId: user.value.id });
      }
      await fetchData();
      addNotif(`📥 Import berhasil — ${newTransactions.length} transaksi ditambahkan`, 'success', 'transaction');
    } catch (err) {
      console.error('Import sync failed:', err);
      addNotif('⚠️ Import transaksi gagal atau sebagian', 'warning', 'transaction');
    } finally {
      syncing.value = false;
    }
  };

  const handleAddGoal = async (g: Omit<Goal, 'id'>) => {
    if (!user.value) return;
    const newGoal = { ...g, id: 'goal-' + Date.now() };
    data.goals.push(newGoal);
    showToast('Tujuan tabungan ditambahkan', 'success');
    await api.updateGoal(user.value.id, newGoal);
  };

  const handleUpdateGoal = async (g: Goal) => {
    if (!user.value) return;
    data.goals = data.goals.map((goal) => (goal.id === g.id ? g : goal));
    await api.updateGoal(user.value.id, g);
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user.value) return;
    data.goals = data.goals.filter((g) => g.id !== id);
    showToast('Tujuan dihapus', 'info');
    await api.deleteGoal(user.value.id, id);
  };

  const handleAddGoalSavings = async (goalId: string, amount: number) => {
    if (!user.value) return;
    const goal = data.goals.find((g) => g.id === goalId);
    if (!goal) return;
    const updatedGoal = { ...goal, savedAmount: goal.savedAmount + amount };
    data.goals = data.goals.map((g) => (g.id === goalId ? updatedGoal : g));
    showToast('Tabungan ditambahkan!', 'success');
    await api.updateGoal(user.value.id, updatedGoal);
  };

  const handleAddNote = async (n: Omit<Note, 'id'>) => {
    if (!user.value) return;
    const newNote = { ...n, id: 'note-' + Date.now() };
    data.notes.unshift(newNote);
    showToast('Catatan disimpan', 'success');
    await api.updateNote(user.value.id, newNote);
  };

  const handleUpdateNote = async (n: Note) => {
    if (!user.value) return;
    data.notes = data.notes.map((note) => (note.id === n.id ? n : note));
    await api.updateNote(user.value.id, n);
  };

  const handleDeleteNote = async (id: string) => {
    if (!user.value) return;
    data.notes = data.notes.filter((n) => n.id !== id);
    showToast('Catatan dihapus', 'info');
    await api.deleteNote(user.value.id, id);
  };

  const handleTogglePin = async () => {
    if (appPin.value) {
      if (await confirm('Nonaktifkan kunci PIN?')) {
        localStorage.removeItem('kb_pin');
        appPin.value = null;
        isUnlocked.value = true;
        showToast('Keamanan PIN dinonaktifkan', 'info');
      }
    } else {
      isSettingPin.value = true;
    }
  };

  const handleFinishPinSetup = (pin: string) => {
    localStorage.setItem('kb_pin', pin);
    appPin.value = pin;
    isSettingPin.value = false;
    isUnlocked.value = true;
    showToast('PIN berhasil dipasang!', 'success');
  };

  const handleClearAllData = async () => {
    if (await confirm('Hapus semua data transaksi & anggaran? Tindakan ini tidak dapat dibatalkan.', 'Hapus Data')) {
      data.transactions = [];
      data.budgets = [];
      data.goals = [];
      data.notes = [];
      localStorage.setItem('kb_data', JSON.stringify(data));
      showToast('Seluruh data telah dihapus', 'success');
      showGenSettings.value = false;
    }
  };

  return {
    user,
    activeTab,
    data,
    loading,
    syncing,
    isOffline,
    isDark,
    appPin,
    isUnlocked,
    isSettingPin,
    toasts,
    activeDialog,
    showGenSettings,
    showExportModal,
    appSettings,
    init,
    showToast,
    confirm,
    alert,
    fetchData,
    handleLogin,
    handleLogout,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleUpdateBudget,
    handleDeleteBudget,
    handleImportTransactions,
    handleAddGoal,
    handleUpdateGoal,
    handleDeleteGoal,
    handleAddGoalSavings,
    handleAddNote,
    handleUpdateNote,
    handleDeleteNote,
    handleTogglePin,
    handleFinishPinSetup,
    handleClearAllData,
    registerModal,
    unregisterModal
  };
}

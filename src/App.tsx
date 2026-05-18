import React, { useState, useEffect } from 'react';
import { flushSync, createPortal } from 'react-dom';

import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import Reports from './components/Reports';
import Goals from './components/Goals';
import Notes from './components/Notes';


import PinLock from './components/PinLock';
import { User, Transaction, Budget, Goal, Note, AppData } from './types';
import { api } from './lib/api';
import { storage } from './lib/storage';
import { cn } from './lib/utils';
import { LogOut, Settings, Shield, Bell, Database, ExternalLink, Info, X, Copy, Check, Lock, AlertCircle, CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight, RefreshCw, User as UserIcon, Mail, ShieldCheck, MessageSquare, Send, Coffee, ChevronRight, Image, Palette, Phone, Instagram, Github, MessageCircle, Globe, ArrowLeft, Camera, Target, PieChart, Flag, StickyNote, LayoutGrid, List } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface DialogConfig {
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'prompt';
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('home');
  const [data, setData] = useState<AppData>(() => {
    // If no user, always start with empty data
    const savedUser = localStorage.getItem('kb_user');
    if (!savedUser) return { transactions: [], budgets: [], goals: [], notes: [] };

    const saved = localStorage.getItem('kb_data');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      transactions: parsed.transactions || [],
      budgets: parsed.budgets || [],
      goals: parsed.goals || [],
      notes: parsed.notes || [],
    };
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('kb_theme');
    return saved === 'dark';
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('kb_theme', nextDark ? 'dark' : 'light');
  };

  const [appPin, setAppPin] = useState(() => localStorage.getItem('kb_pin') || null);
  const [isUnlocked, setIsUnlocked] = useState(!localStorage.getItem('kb_pin'));
  const [isSettingPin, setIsSettingPin] = useState(false);

  // Notification states
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeDialog, setActiveDialog] = useState<DialogConfig | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = (toasts?.length || 0) + (activeDialog ? 1 : 0);

  // Modals
  const [showGenSettings, setShowGenSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);

    // Fix for Android WebView White Screen on Resume
    // This triggers a subtle repaint to ensure the UI is rendered correctly 
    // when coming back from background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Force a layout reflow by toggling a non-visible property
        document.body.style.display = 'none';
        // Use offsetHeight to force calculation
        document.body.offsetHeight;
        document.body.style.display = '';
        
        // Secondary backup: slight opacity shift
        document.body.style.opacity = '0.999';
        setTimeout(() => {
          document.body.style.opacity = '1';
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Profile Edit Temp States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState(''); // old email (read-only, auto-filled)
  const [editNewEmail, setEditNewEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [editStep, setEditStep] = useState(1);
  const [editCode, setEditCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [showScriptInfo, setShowScriptInfo] = useState(false);
  const [profileView, setProfileView] = useState<'main' | 'wallpaper' | 'contact' | 'edit'>('main');
  const [wallpaper, setWallpaper] = useState(() => {
    const saved = localStorage.getItem('kb_wallpaper');
    if (saved) return saved;
    // Fallback to user preference if available
    const savedUser = localStorage.getItem('kb_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      return u.wallpaper || 'none';
    }
    return 'none';
  });

  useEffect(() => {
    localStorage.setItem('kb_wallpaper', wallpaper);
    if (user && user.wallpaper !== wallpaper) {
      api.updateUser(user.id, { wallpaper }).catch(() => {});
    }
  }, [wallpaper, user]);

  // App Settings
  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('kb_settings');
    return saved ? JSON.parse(saved) : {
      notifBudgets: true,
      notifSync: true,
      language: 'id'
    };
  });

  useEffect(() => {
    localStorage.setItem('kb_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // Navigation History Support
  useEffect(() => {
    // Initial state
    if (!window.history.state) {
      window.history.replaceState({ tab: activeTab, modal: showAddModal }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        if (showAddModal && !state.modal) {
          setShowAddModal(false);
        } else if (state.tab) {
          setActiveTab(state.tab);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, showAddModal]);

  const handleTabChange = (tabId: string) => {
    if (activeTab === tabId) return;
    setActiveTab(tabId);
    window.history.pushState({ tab: tabId, modal: false }, '');
  };

  useEffect(() => {
    if (showAddModal) {
      window.history.pushState({ tab: activeTab, modal: true }, '');
    }
  }, [showAddModal]);

  useEffect(() => {
    if (activeTab !== 'profile') {
      setProfileView('main');
    }
  }, [activeTab]);

  // Toast helpers
  const showToast = (message: string, type: Toast['type'] = 'info', category?: 'sync' | 'budget') => {
    // Respect user settings
    if (category === 'sync' && !appSettings.notifSync && type === 'success') return;
    if (category === 'budget' && !appSettings.notifBudgets) return;

    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Dialog helpers (Promise-based)
  const confirm = (message: string, title = 'Konfirmasi'): Promise<boolean> => {
    return new Promise((resolve) => {
      setActiveDialog({
        title,
        message,
        type: 'confirm',
        confirmText: 'Ya, Lanjutkan',
        cancelText: 'Batal',
        onConfirm: () => { setActiveDialog(null); resolve(true); },
        onCancel: () => { setActiveDialog(null); resolve(false); }
      });
    });
  };

  const alert = (message: string, title = 'Pemberitahuan'): Promise<void> => {
    return new Promise((resolve) => {
      setActiveDialog({
        title,
        message,
        type: 'alert',
        confirmText: 'Mengerti',
        onConfirm: () => { setActiveDialog(null); resolve(); },
        onCancel: () => { setActiveDialog(null); resolve(); }
      });
    });
  };

  // Apply theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kb_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kb_theme', 'light');
    }
  }, [isDark]);

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('kb_data', JSON.stringify(data));
  }, [data]);

  // Connectivity detection & Sync
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      setSyncing(true);
      try {
        const { synced, failed } = await api.syncPendingRequests(
          ({ synced, failed, total }) => {
            console.log(`[Sync Progress] ${synced + failed}/${total}`);
          }
        );
        if (synced > 0) {
          showToast(`✓ ${synced} data berhasil disinkronkan ke cloud`, 'success');
        }
        if (failed > 0) {
          showToast(`${failed} data gagal disinkronkan, akan dicoba lagi`, 'warning');
        }
        // Refresh data from server after sync
        if (user) await fetchData();
      } catch (err) {
        console.error('[Sync] Error during online sync:', err);
      } finally {
        setSyncing(false);
      }
    };

    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Run sync once on mount if already online (catches queued items from prev session)
    if (navigator.onLine && user) {
      (async () => {
        const count = await storage.getPendingCount();
        if (count > 0) {
          setSyncing(true);
          try {
            const { synced, failed } = await api.syncPendingRequests();
            if (synced > 0) showToast(`✓ ${synced} data tertunda berhasil disinkronkan`, 'success');
            if (failed > 0) showToast(`${failed} data gagal disinkronkan`, 'warning');
            await fetchData();
          } finally {
            setSyncing(false);
          }
        }
      })();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Sync data and base URL on mount
  useEffect(() => {
    if (user) {
      if (user.scriptUrl) api.setBaseUrl(user.scriptUrl);
      fetchData();
    }
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getData(user.id);
      setData(prev => ({
        ...res,
        transactions: res.transactions || [],
        budgets: res.budgets || [],
        goals: res.goals || prev.goals || [],
        notes: res.notes || prev.notes || [],
      }));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (newUser: User) => {
    // Clear data first to avoid ghost data from previous user
    setData({ transactions: [], budgets: [], goals: [], notes: [] });
    setUser(newUser);
    if (newUser.scriptUrl) {
      api.setBaseUrl(newUser.scriptUrl);
    }
    localStorage.setItem('kb_user', JSON.stringify(newUser));
  };

  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const [copied, setCopied] = useState(false);

  const appsScriptCode = `/**
 * Google Apps Script for Berkah Finance
 * Deploy as Web App with:
 * - Execute as: Me
 * - Who has access: Anyone
 */

function doGet(e) {
  const action = e.parameter.action;
  const userId = e.parameter.userId;
  if (action === 'getData') return handleGetData(userId);
  return createResponse({ error: 'Invalid action' });
}

function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return createResponse({ error: 'Invalid JSON' }); }
  const action = data.action;
  
  // Auth & Verification
  if (action === 'login') return handleLogin(data);
  if (action === 'register') return handleRegister(data);
  if (action === 'sendRegisterCode') return handleSendCode(data.email, 'REG');
  if (action === 'verifyRegisterAndCreate') return handleVerifyRegister(data);
  if (action === 'sendResetCode') return handleSendCode(data.email, 'RESET');
  if (action === 'resetPasswordWithCode') return handleResetPassword(data);
  if (action === 'sendUpdateCode') return handleSendCode(data.email, 'UPDATE');
  if (action === 'updateUser') return handleUpdateUser(data);
  
  // Transactions
  if (action === 'addTransaction') return handleAddTransaction(data);
  if (action === 'updateTransaction') return handleUpdateTransaction(data);
  if (action === 'deleteTransaction') return handleDeleteTransaction(data);
  
  // Budgets
  if (action === 'updateBudget') return handleUpdateBudget(data);
  if (action === 'deleteBudget') return handleDeleteBudget(data);
  
  // Goals
  if (action === 'updateGoal') return handleUpdateGoal(data);
  if (action === 'deleteGoal') return handleDeleteGoal(data);
  
  // Notes
  if (action === 'updateNote') return handleUpdateNote(data);
  if (action === 'deleteNote') return handleDeleteNote(data);
  if (action === 'sendFeedback') return handleSendFeedback(data);

  return createResponse({ error: 'Invalid action: ' + action });
}

function handleSendFeedback(data) {
  try {
    MailApp.sendEmail({
      to: 'alfarizd027@gmail.com',
      subject: '[FEEDBACK] Berkah Finance',
      htmlBody: '<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">' +
                '<h2>Saran & Masukan Baru</h2>' +
                '<p><strong>Dari:</strong> ' + data.userName + ' (' + data.userId + ')</p>' +
                '<p><strong>Pesan:</strong></p>' +
                '<div style="background:#f9fafb;padding:15px;border-radius:8px;border-left:4px solid #059669;">' +
                data.feedback.replace(/\\\\n/g, "<br>") +
                '</div>' +
                '</div>'
    });
    return createResponse({ success: true });
  } catch (e) {
    return createResponse({ error: 'Gagal mengirim feedback: ' + e.toString() });
  }
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'Users') sheet.appendRow(['id', 'name', 'email', 'password', 'photoUrl', 'createdAt']);
    else if (name === 'Transactions') sheet.appendRow(['id', 'userId', 'type', 'category', 'amount', 'date', 'note']);
    else if (name === 'Budgets') sheet.appendRow(['id', 'userId', 'category', 'limit', 'period']);
    else if (name === 'Goals') sheet.appendRow(['id', 'userId', 'name', 'targetAmount', 'savedAmount', 'deadline', 'icon', 'color']);
    else if (name === 'Notes') sheet.appendRow(['id', 'userId', 'content', 'color', 'isPinned', 'createdAt', 'updatedAt']);
    else if (name === 'Codes') sheet.appendRow(['email', 'code', 'type', 'expires']);
  }
  return sheet;
}

// --- Auth Handlers ---

function handleSendCode(email, type) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const sheet = getSheet('Codes');
  const expires = new Date(new Date().getTime() + 10 * 60000); // 10 mins
  sheet.appendRow([email, code, type, expires]);
  
  try {
    MailApp.sendEmail({
      to: email,
      subject: '[' + type + '] Kode Verifikasi Berkah Finance',
      htmlBody: '<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">' +
                '<h2>Kode Verifikasi Anda</h2>' +
                '<p>Gunakan kode berikut untuk melanjutkan proses ' + type.toLowerCase() + ' Anda:</p>' +
                '<h1 style="color:#6366f1;letter-spacing:5px;">' + code + '</h1>' +
                '<p style="color:#666;font-size:12px;">Kode ini akan kadaluarsa dalam 10 menit.</p>' +
                '</div>'
    });
    return createResponse({ success: true });
  } catch (e) {
    return createResponse({ error: 'Gagal mengirim email: ' + e.toString() });
  }
}

function verifyCode(email, code, type) {
  const sheet = getSheet('Codes');
  const data = sheet.getDataRange().getValues();
  const now = new Date().getTime();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === email && String(data[i][1]) === String(code) && data[i][2] === type) {
      if (new Date(data[i][3]).getTime() > now) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
  }
  return false;
}

function handleRegister(data) {
  const sheet = getSheet('Users');
  const users = sheet.getDataRange().getValues();
  if (users.find(u => String(u[2]) === String(data.email))) return createResponse({ error: 'Email sudah terdaftar' });
  const id = Utilities.getUuid();
  sheet.appendRow([id, data.name, data.email, data.password, '', new Date()]);
  return createResponse({ success: true, user: { id, name: data.name, email: data.email } });
}

function handleVerifyRegister(data) {
  if (!verifyCode(data.email, data.code, 'REG')) return createResponse({ error: 'Kode verifikasi salah atau kadaluarsa' });
  return handleRegister(data);
}

function handleLogin(data) {
  const sheet = getSheet('Users');
  const users = sheet.getDataRange().getValues();
  const user = users.find(u => String(u[2]) === String(data.email) && String(u[3]) === String(data.password));
  if (!user) return createResponse({ error: 'Email atau password salah' });
  return createResponse({ success: true, user: { id: user[0], name: user[1], email: user[2], photoUrl: user[4] } });
}

function handleResetPassword(data) {
  if (!verifyCode(data.email, data.code, 'RESET')) return createResponse({ error: 'Kode verifikasi salah' });
  const sheet = getSheet('Users');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] === data.email) {
      sheet.getRange(i + 1, 4).setValue(data.newPassword);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'User tidak ditemukan' });
}

function handleUpdateUser(data) {
  const isSensitive = data.email || data.password;
  if (isSensitive && !verifyCode(data.email || '', data.code, 'UPDATE')) {
     // If changing email, we might have sent code to OLD email. But data.email is the NEW one.
     // In handleUpdateProfile App.tsx, we send to user.email (old). 
     // So we need to check against OLD email if we have it, or just ensure the code is valid for ANY update for this user.
     // For simplicity, handleUpdateProfile in App.tsx sends code to user.email.
     // Let's check if the code exists for the OLD email if we can't find it for the new one.
     const userSheet = getSheet('Users');
     const userData = userSheet.getDataRange().getValues().find(u => u[0] === data.id);
     if (!userData || !verifyCode(userData[2], data.code, 'UPDATE')) {
       return createResponse({ error: 'Kode verifikasi diperlukan untuk merubah email/password' });
     }
  }
  
  const sheet = getSheet('Users');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      if (data.name) sheet.getRange(i + 1, 2).setValue(data.name);
      if (data.email) sheet.getRange(i + 1, 3).setValue(data.email);
      if (data.password) sheet.getRange(i + 1, 4).setValue(data.password);
      if (data.photoUrl !== undefined) sheet.getRange(i + 1, 5).setValue(data.photoUrl);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'User tidak ditemukan' });
}

// --- Data Handlers ---

function handleGetData(userId) {
  if (!userId) return createResponse({ error: 'User ID required' });
  const transactions = getSheet('Transactions').getDataRange().getValues().slice(1)
    .filter(row => row[1] === userId)
    .map(row => ({ id: row[0], userId: row[1], type: row[2], category: row[3], amount: row[4], date: row[5], note: row[6] }));
  
  const budgets = getSheet('Budgets').getDataRange().getValues().slice(1)
    .filter(row => row[1] === userId)
    .map(row => ({ id: row[0], userId: row[1], category: row[2], limit: row[3], period: row[4] }));
    
  const goals = getSheet('Goals').getDataRange().getValues().slice(1)
    .filter(row => row[1] === userId)
    .map(row => ({ id: row[0], userId: row[1], name: row[2], targetAmount: row[3], savedAmount: row[4], deadline: row[5], icon: row[6], color: row[7] }));
    
  const notes = getSheet('Notes').getDataRange().getValues().slice(1)
    .filter(row => row[1] === userId)
    .map(row => ({ id: row[0], userId: row[1], content: row[2], color: row[3], isPinned: row[4], createdAt: row[5], updatedAt: row[6] }));
    
  return createResponse({ success: true, transactions, budgets, goals, notes });
}

function handleAddTransaction(data) {
  const id = Utilities.getUuid();
  getSheet('Transactions').appendRow([id, data.userId, data.type, data.category, data.amount, data.date || new Date(), data.note || '']);
  return createResponse({ success: true, id });
}

function handleUpdateTransaction(data) {
  const sheet = getSheet('Transactions');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      sheet.getRange(i + 1, 3, 1, 5).setValues([[data.type, data.category, data.amount, data.date, data.note]]);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'Not found' });
}

function handleDeleteTransaction(data) {
  const sheet = getSheet('Transactions');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      sheet.deleteRow(i + 1);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'Not found' });
}

function handleUpdateBudget(data) {
  const sheet = getSheet('Budgets');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.userId && rows[i][2] === data.category) {
      sheet.getRange(i + 1, 4).setValue(data.limit);
      return createResponse({ success: true });
    }
  }
  sheet.appendRow([Utilities.getUuid(), data.userId, data.category, data.limit, 'Month']);
  return createResponse({ success: true });
}

function handleDeleteBudget(data) {
  const sheet = getSheet('Budgets');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.userId && rows[i][2] === data.category) {
      sheet.deleteRow(i + 1);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'Not found' });
}

function handleUpdateGoal(data) {
  const sheet = getSheet('Goals');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      sheet.getRange(i + 1, 3, 1, 6).setValues([[data.name, data.targetAmount, data.savedAmount, data.deadline, data.icon, data.color]]);
      return createResponse({ success: true });
    }
  }
  sheet.appendRow([data.id, data.userId, data.name, data.targetAmount, data.savedAmount, data.deadline, data.icon, data.color]);
  return createResponse({ success: true });
}

function handleDeleteGoal(data) {
  const sheet = getSheet('Goals');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      sheet.deleteRow(i + 1);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'Not found' });
}

function handleUpdateNote(data) {
  const sheet = getSheet('Notes');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      sheet.getRange(i + 1, 3, 1, 5).setValues([[data.content, data.color, data.isPinned, data.createdAt, new Date()]]);
      return createResponse({ success: true });
    }
  }
  sheet.appendRow([data.id, data.userId, data.content, data.color, data.isPinned, new Date(), new Date()]);
  return createResponse({ success: true });
}

function handleDeleteNote(data) {
  const sheet = getSheet('Notes');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      sheet.deleteRow(i + 1);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'Not found' });
}
\`;
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateScriptUrl = (url: string) => {
    if (!user) return;
    const updatedUser = { ...user, scriptUrl: url };
    setUser(updatedUser);
    api.setBaseUrl(url);
    localStorage.setItem('kb_user', JSON.stringify(updatedUser));
    fetchData();
  };

  const [testingConnection, setTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    if (!user?.scriptUrl) return;
    setTestingConnection(true);
    try {
      await api.getData(user.id);
      alert('Koneksi Berhasil! Database terhubung dengan baik.');
    } catch (err) {
      alert('Koneksi Gagal! Pastikan URL benar dan Apps Script sudah di-deploy sebagai Web App (Anyone).');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setData({ transactions: [], budgets: [], goals: [], notes: [] });
    localStorage.removeItem('kb_user');
    localStorage.removeItem('kb_data');
    localStorage.removeItem('kb_pin');
    localStorage.removeItem('kb_wallpaper');
    localStorage.removeItem('kb_settings');
    setIsDark(false);
    setActiveTab('home');
    setProfileView('main');
  };

  const handleAddTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;

    // Optimistic update
    const tempId = 'temp-' + Date.now();
    const newTransaction: Transaction = { ...t, id: tempId, userId: user.id };

    setData(prev => ({
      ...prev,
      transactions: [newTransaction, ...(prev.transactions || [])]
    }));

    setSyncing(true);
    try {
      const res = await api.addTransaction({ ...t, userId: user.id });
      if (res.success && !res.offline && res.id) {
        // Update the temporary ID with the real ID from the server
        setData(prev => ({
          ...prev,
          transactions: (prev.transactions || []).map(tr =>
            tr.id === tempId ? { ...tr, id: res.id! } : tr
          )
        }));
      } else if (res.offline) {
        showToast('Tersimpan secara lokal (Offline)', 'info');
      } else if (!isOffline) {
        // Revert on failure only if we are online (otherwise keep it for later)
        setData(prev => ({
          ...prev,
          transactions: (prev.transactions || []).filter(tr => tr.id !== tempId)
        }));
        showToast('Gagal menambah transaksi', 'error');
      }
    } catch (err) {
      if (!isOffline) {
        // Revert on real error if online
        setData(prev => ({
          ...prev,
          transactions: (prev.transactions || []).filter(tr => tr.id !== tempId)
        }));
        showToast('Gagal menambah transaksi (koneksi bermasalah)', 'error');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateTransaction = async (t: Transaction) => {
    if (!user) return;

    // Save previous state for rollback
    const previousTransactions = [...(data.transactions || [])];

    // Optimistic update
    setData(prev => ({
      ...prev,
      transactions: (prev.transactions || []).map(tr =>
        tr.id === t.id ? t : tr
      )
    }));

    setSyncing(true);
    try {
      const res = await api.updateTransaction(t);
      if (!res.success) {
        if (!isOffline) {
          setData(prev => ({ ...prev, transactions: previousTransactions }));
          showToast('Gagal mengedit transaksi: ' + res.error, 'error');
        }
      }
    } catch (err) {
      if (!isOffline) {
        setData(prev => ({ ...prev, transactions: previousTransactions }));
        showToast('Gagal mengedit transaksi (koneksi bermasalah)', 'error');
      }
    } finally {
      setSyncing(false);
    }
  };


  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    if (!await confirm('Hapus transaksi ini?')) return;

    // Store previous state for rollback
    const previousTransactions = [...(data.transactions || [])];

    // Optimistic update
    setData(prev => ({
      ...prev,
      transactions: (prev.transactions || []).filter(t => t.id !== id)
    }));

    setSyncing(true);
    try {
      const res = await api.deleteTransaction(id, user.id);
      if (!res.success && !isOffline) {
        // Revert only if we are online and it failed
        setData(prev => ({ ...prev, transactions: previousTransactions }));
        showToast('Gagal menghapus transaksi', 'error');
      } else {
        showToast('Transaksi berhasil dihapus', 'success', 'sync');
      }
    } catch (err) {
      if (!isOffline) {
        setData(prev => ({ ...prev, transactions: previousTransactions }));
        showToast('Gagal menghapus transaksi', 'error');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleTogglePin = async () => {
    if (appPin) {
      if (await confirm('Nonaktifkan kunci PIN?')) {
        localStorage.removeItem('kb_pin');
        setAppPin(null);
        showToast('Keamanan PIN dinonaktifkan', 'info');
      }
    } else {
      setIsSettingPin(true);
    }
  };

  const handleFinishPinSetup = (pin: string) => {
    localStorage.setItem('kb_pin', pin);
    setAppPin(pin);
    setIsSettingPin(false);
    showToast('PIN berhasil dipasang!', 'success');
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const isSensitiveChange = (editNewEmail && editNewEmail !== user.email) || editNewPassword !== '';

    // Validate sensitive changes
    if (isSensitiveChange && !editPassword) {
      showToast('Masukkan password lama untuk mengonfirmasi perubahan', 'warning');
      return;
    }

    if (isSensitiveChange && editStep === 1) {
      setSavingProfile(true);
      try {
        const res = await api.sendUpdateCode(user.email);
        if (res.success) {
          setEditStep(2);
          showToast('Kode OTP dikirim ke email lama Anda', 'info');
        } else {
          showToast(res.error || 'Gagal mengirim kode verifikasi', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan jaringan', 'error');
      } finally {
        setSavingProfile(false);
      }
      return;
    }

    setSavingProfile(true);
    try {
      const updates: any = {
        name: editName,
        photoUrl: editPhoto,
      };
      if (editNewEmail) updates.email = editNewEmail;
      if (editNewPassword) updates.password = editNewPassword;

      const result = await api.updateUser(user.id, updates, editCode, editPassword);
      if (result.success) {
        const updatedUser = {
          ...user,
          name: editName,
          email: editNewEmail || user.email,
          photoUrl: editPhoto,
        };
        setUser(updatedUser);
        localStorage.setItem('kb_user', JSON.stringify(updatedUser));
        showToast('Profil berhasil diperbarui', 'success');
        setProfileView('main');
        setEditStep(1);
        setEditCode('');
        setEditNewEmail('');
        setEditNewPassword('');
      } else {
        showToast(result.error || 'Gagal merubah profil', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!user || !feedback.trim()) return;
    setSendingFeedback(true);
    try {
      const res = await api.sendFeedback(user.id, user.name, feedback);
      if (res.success) {
        showToast('Terima kasih! Saran Anda telah terkirim.', 'success');
        setFeedback('');
      } else {
        showToast(res.error || 'Gagal mengirim saran', 'error');
      }
    } catch (err) {
      showToast('Gagal mengirim saran (koneksi bermasalah)', 'error');
    } finally {
      setSendingFeedback(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setEditPhoto(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran sampul maksimal 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const updatedUser = { ...user, coverUrl: dataUrl };
      setUser(updatedUser);
      localStorage.setItem('kb_user', JSON.stringify(updatedUser));
      
      try {
        await api.updateUser(user.id, { coverUrl: dataUrl });
        showToast('Sampul profil diperbarui & tersimpan', 'success');
      } catch (err) {
        showToast('Sampul tersimpan lokal (gagal sinkron)', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const openEditProfile = () => {
    if (!user) return;
    setEditName(user.name);
    setEditEmail(user.email); // current email (read-only)
    setEditNewEmail('');
    setEditPassword('');
    setEditNewPassword('');
    setEditPhoto(user.photoUrl || '');
    setEditCode('');
    setEditStep(1);
    setProfileView('edit');
  };

  const handleClearData = async () => {
    if (await confirm('Hapus semua data transaksi & anggaran? Tindakan ini tidak dapat dibatalkan.', 'Hapus Data')) {
      const emptyData = { transactions: [], budgets: [] };
      setData(emptyData);
      localStorage.setItem('kb_data', JSON.stringify(emptyData));
      showToast('Seluruh data telah dihapus', 'success');
      setShowGenSettings(false);
    }
  };

  const handleUpdateBudget = async (category: string, limit: number) => {
    if (!user) return;

    const previousBudgets = [...(data.budgets || [])];

    // Optimistic update
    setData(prev => {
      const existing = (prev.budgets || []).find(b => b.category === category);
      let newBudgets;
      if (existing) {
        newBudgets = (prev.budgets || []).map(b => b.category === category ? { ...b, limit } : b);
      } else {
        newBudgets = [...(prev.budgets || []), { id: 'temp-' + Date.now(), userId: user.id, category, limit, period: 'Month' }];
      }
      return { ...prev, budgets: newBudgets };
    });

    setSyncing(true);
    try {
      const res = await api.updateBudget(user.id, category, limit);
      if (!res.success && !isOffline) {
        setData(prev => ({ ...prev, budgets: previousBudgets }));
        showToast('Gagal update budget', 'error');
      } else {
        showToast('Budget berhasil diperbarui', 'success', 'budget');
      }
    } catch (err) {
      if (!isOffline) {
        setData(prev => ({ ...prev, budgets: previousBudgets }));
        showToast('Gagal update budget', 'error');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteBudget = async (category: string) => {
    if (!user) return;
    const previousBudgets = [...(data.budgets || [])];
    setData(prev => ({
      ...prev,
      budgets: (prev.budgets || []).filter(b => b.category !== category)
    }));
    setSyncing(true);
    try {
      const res = await api.deleteBudget(user.id, category);
      if (!res.success && !isOffline) {
        setData(prev => ({ ...prev, budgets: previousBudgets }));
        showToast('Gagal menghapus budget', 'error');
      } else {
        showToast('Budget berhasil dihapus', 'success', 'budget');
      }
    } catch (err) {
      if (!isOffline) {
        setData(prev => ({ ...prev, budgets: previousBudgets }));
        showToast('Gagal menghapus budget', 'error');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleImportTransactions = async (newTransactions: Omit<Transaction, 'id'>[]) => {
    if (!user) return;
    setSyncing(true);
    const tempTransactions = newTransactions.map(t => ({
      ...t,
      id: 'temp-' + Math.random().toString(36).substr(2, 9),
      userId: user.id
    }));

    setData(prev => ({
      ...prev,
      transactions: [...tempTransactions, ...(prev.transactions || [])]
    }));

    try {
      for (const t of newTransactions) {
        await api.addTransaction({ ...t, userId: user.id });
      }
      const syncRes = await api.getData(user.id);
      setData(syncRes);
    } catch (err) {
      console.error('Import sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran file maksimal 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setWallpaper(dataUrl);
        localStorage.setItem('kb_wallpaper', dataUrl);
        showToast('Wallpaper kustom diterapkan', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGoal = async (g: Omit<Goal, 'id'>) => {
    const newGoal = { ...g, id: 'goal-' + Date.now() };
    setData(prev => ({ ...prev, goals: [...(prev.goals || []), newGoal] }));
    showToast('Tujuan tabungan ditambahkan', 'success');
    await api.updateGoal(user!.id, newGoal);
  };

  const handleUpdateGoal = async (g: Goal) => {
    setData(prev => ({
      ...prev,
      goals: (prev.goals || []).map(goal => goal.id === g.id ? g : goal)
    }));
    await api.updateGoal(user!.id, g);
  };

  const handleDeleteGoal = async (id: string) => {
    setData(prev => ({
      ...prev,
      goals: (prev.goals || []).filter(g => g.id !== id)
    }));
    showToast('Tujuan dihapus', 'info');
    await api.deleteGoal(user!.id, id);
  };

  const handleAddGoalSavings = async (goalId: string, amount: number) => {
    const goal = data.goals.find(g => g.id === goalId);
    if (!goal) return;
    const updatedGoal = { ...goal, savedAmount: goal.savedAmount + amount };
    setData(prev => ({
      ...prev,
      goals: (prev.goals || []).map(g => g.id === goalId ? updatedGoal : g)
    }));
    showToast('Tabungan ditambahkan!', 'success');
    await api.updateGoal(user!.id, updatedGoal);
  };

  const handleAddNote = async (n: Omit<Note, 'id'>) => {
    const newNote = { ...n, id: 'note-' + Date.now() };
    setData(prev => ({ ...prev, notes: [newNote, ...(prev.notes || [])] }));
    showToast('Catatan disimpan', 'success');
    await api.updateNote(user!.id, newNote);
  };

  const handleUpdateNote = async (n: Note) => {
    setData(prev => ({
      ...prev,
      notes: (prev.notes || []).map(note => note.id === n.id ? n : note)
    }));
    await api.updateNote(user!.id, n);
  };

  const handleDeleteNote = async (id: string) => {
    setData(prev => ({
      ...prev,
      notes: (prev.notes || []).filter(n => n.id !== id)
    }));
    showToast('Catatan dihapus', 'info');
    await api.deleteNote(user!.id, id);
  };

  if (!user) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <Auth
          onLogin={handleLogin}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

      </div>
    );
  }

  if (!isUnlocked && appPin || isSettingPin) {
    return (
      <div className={isDark ? 'dark' : ''}>
        {!isUnlocked && appPin && (
          <PinLock mode="unlock" correctPin={appPin} onUnlock={() => setIsUnlocked(true)} />
        )}

        {isSettingPin && (
          <PinLock
            mode="setup"
            onComplete={handleFinishPinSetup}
            onCancel={() => setIsSettingPin(false)}
          />
        )}
      </div>
    );
  }
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            transactions={data.transactions}
            budgets={data.budgets}
            goals={data.goals}
            onAddClick={() => { handleTabChange('transactions'); setShowAddModal(true); }}
            onViewAll={() => handleTabChange('transactions')}
            onNavigateToBudget={() => handleTabChange('budgets')}
            onNavigateToGoals={() => handleTabChange('goals')}
            onNavigateToProfile={() => handleTabChange('profile')}
            isDark={isDark}
            toggleTheme={toggleTheme}
            userName={user.name}
            userPhotoUrl={user.photoUrl}
            notificationCount={notificationCount}
            onBellClick={() => setShowNotifications(true)}
          />
        );
      case 'transactions':
        return (
          <Transactions
            transactions={data.transactions}
            onAdd={handleAddTransaction}
            onUpdate={handleUpdateTransaction}
            onDelete={handleDeleteTransaction}
            onImport={handleImportTransactions}
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
          />
        );
      case 'budgets':
        return <Budgets budgets={data.budgets} transactions={data.transactions} onUpdate={handleUpdateBudget} onDelete={handleDeleteBudget} />;
      case 'reports':
        return <Reports transactions={data.transactions} />;
      case 'goals':
        return <Goals goals={data.goals} onAdd={handleAddGoal} onUpdate={handleUpdateGoal} onDelete={handleDeleteGoal} onAddSavings={handleAddGoalSavings} userId={user.id} />;
      case 'notes':
        return <Notes notes={data.notes} onAdd={handleAddNote} onUpdate={handleUpdateNote} onDelete={handleDeleteNote} userId={user.id} />;
      case 'menu':
        return (
          <div className="space-y-6 pb-10">
            {/* ── Header Title (Desktop only) ── */}
            <div className="hidden lg:flex flex-col gap-1 mb-2">
              <h2 className="text-2xl font-black text-text-primary tracking-tight leading-none">Eksplorasi Fitur</h2>
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Navigasi Seluruh Modul Keuangan</p>
              <div className="h-1 w-12 bg-gradient-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
            </div>

            {/* ── Premium Feature Showcase Card (No Card-Bg box, Flat Glassmorphic Borderless Banner) ── */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#1A2C5B] via-[#2d4992] to-[#15254e] shadow-md border border-accent/10">
              <div className="absolute inset-0 bg-[url('/doodle_wallpaper.png')] bg-repeat bg-[length:150px_150px] opacity-10 mix-blend-soft-light" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              
              <div className="relative">
                <span className="text-[9px] font-black text-amber-500 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest">✦ Vinance Ecosystem</span>
                <h3 className="text-base font-black text-white mt-2.5 leading-tight tracking-tight">Keluarga Berkah Finance</h3>
                <p className="text-[10px] text-white/80 mt-1 font-semibold leading-relaxed">
                  Kelola seluruh rencana anggaran, analisis grafik, tabungan, dan memo Anda secara premium dalam satu ekosistem finansial.
                </p>
              </div>
            </div>

            {/* ── Menu List Section (Apple / Revolut Style - Boxless & Premium) ── */}
            <div className="space-y-4 pt-2">
              <p className="text-[10px] font-black text-text-secondary/80 uppercase tracking-[0.25em] mb-1 px-1">Daftar Modul Utama</p>
              <div className="divide-y divide-border-ui/30">
                
                {/* 1. TRANSACTIONS */}
                <button
                  onClick={() => handleTabChange('transactions')}
                  className="w-full flex items-center gap-4 py-4 px-2 hover:bg-indigo-500/[0.03] active:bg-indigo-500/[0.06] transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform">
                    <List className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-text-primary tracking-tight">Catatan Transaksi</p>
                      <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Transaksi</span>
                    </div>
                    <p className="text-[10px] text-text-secondary font-medium mt-0.5">Catat pemasukan, pengeluaran, dan audit saldo kas Anda</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 2. BUDGETING */}
                <button
                  onClick={() => handleTabChange('budgets')}
                  className="w-full flex items-center gap-4 py-4 px-2 hover:bg-emerald-500/[0.03] active:bg-emerald-500/[0.06] transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-text-primary tracking-tight">Manajemen Anggaran</p>
                      <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Budgeting</span>
                    </div>
                    <p className="text-[10px] text-text-secondary font-medium mt-0.5">Kelola pos pengeluaran dan limit belanja bulanan</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 2. LAPORAN */}
                <button
                  onClick={() => handleTabChange('reports')}
                  className="w-full flex items-center gap-4 py-4 px-2 hover:bg-blue-500/[0.03] active:bg-blue-500/[0.06] transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-text-primary tracking-tight">Analisis Laporan</p>
                      <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Grafik</span>
                    </div>
                    <p className="text-[10px] text-text-secondary font-medium mt-0.5">Visualisasi arus kas masuk dan analisis alokasi dana</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 3. GOALS */}
                <button
                  onClick={() => handleTabChange('goals')}
                  className="w-full flex items-center gap-4 py-4 px-2 hover:bg-amber-500/[0.03] active:bg-amber-500/[0.06] transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                    <Flag className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-text-primary tracking-tight">Target Tabungan</p>
                      <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Goals</span>
                    </div>
                    <p className="text-[10px] text-text-secondary font-medium mt-0.5">Pantau progress pencapaian target impian Anda</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 4. NOTES */}
                <button
                  onClick={() => handleTabChange('notes')}
                  className="w-full flex items-center gap-4 py-4 px-2 hover:bg-fuchsia-500/[0.03] active:bg-fuchsia-500/[0.06] transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500 group-hover:scale-105 transition-transform">
                    <StickyNote className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-text-primary tracking-tight">Catatan Memo</p>
                      <span className="text-[8px] font-black text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Notes</span>
                    </div>
                    <p className="text-[10px] text-text-secondary font-medium mt-0.5">Simpan rencana, tips keuangan, dan memo harian</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
                </button>

              </div>
            </div>

          </div>
        );
      case 'profile':
        if (profileView === 'edit') {
          const isSensitiveChange = (editNewEmail && editNewEmail !== user.email) || editNewPassword !== '';
          return (
            <div className="space-y-6 pb-4">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => {
                    setProfileView('main');
                    setEditStep(1);
                  }}
                  className="w-10 h-10 rounded-lg bg-bg-main border border-border-ui flex items-center justify-center hover:bg-border-ui transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-text-primary" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">Edit Profil</h2>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">Pengaturan Akun & Keamanan</p>
                </div>
              </div>

              <div className="bg-card-bg rounded-lg border border-border-ui p-6 shadow-sm space-y-6">
                {editStep === 1 ? (
                  <>
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-bg-main bg-bg-main shadow-xl">
                          {editPhoto ? (
                            <img src={editPhoto} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                              <span className="text-3xl font-black text-white">{editName[0]?.toUpperCase() || '?'}</span>
                            </div>
                          )}
                          {savingProfile && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                              <RefreshCw className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-lg flex items-center justify-center border-4 border-card-bg shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                          <Palette className="w-5 h-5 text-white" />
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={savingProfile} />
                        </label>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-text-primary">Foto Profil</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">PNG, JPG maks. 2MB</p>
                      </div>
                    </div>

                    <div className="h-px bg-border-ui/50" />

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-1">Nama Lengkap</span>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-bg-main/60 rounded-lg border border-border-ui focus:border-accent outline-none text-sm font-bold text-text-primary transition-all placeholder:font-normal placeholder:text-text-secondary/50"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                    </div>

                    <div className="h-px bg-border-ui/50" />

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 px-1">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Ganti Email</span>
                        <span className="ml-auto text-[9px] font-bold text-text-secondary/50 bg-border-ui/50 px-2 py-0.5 rounded-full">Opsional</span>
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                          <input
                            type="email"
                            value={editEmail}
                            readOnly
                            className="w-full pl-11 pr-20 py-3.5 bg-bg-main/30 rounded-lg border border-border-ui/50 outline-none text-sm font-bold text-text-secondary cursor-not-allowed"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-text-secondary/50 uppercase tracking-widest bg-border-ui/70 px-2 py-0.5 rounded-full">Aktif</span>
                        </div>
                        <div className="relative">
                          <ArrowRight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                          <input
                            type="email"
                            value={editNewEmail}
                            onChange={(e) => setEditNewEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-bg-main/60 rounded-lg border border-border-ui focus:border-blue-500/70 outline-none text-sm font-bold text-text-primary transition-all placeholder:font-normal placeholder:text-text-secondary/50"
                            placeholder="Masukkan email baru"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-border-ui/50" />

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 px-1">
                        <Lock className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Ganti Password</span>
                        <span className="ml-auto text-[9px] font-bold text-text-secondary/50 bg-border-ui/50 px-2 py-0.5 rounded-full">Opsional</span>
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                          <input
                            type="password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className={cn(
                              "w-full pl-11 pr-4 py-3.5 bg-bg-main/60 rounded-lg border border-border-ui outline-none text-sm font-bold text-text-primary transition-all placeholder:font-normal placeholder:text-text-secondary/50",
                              isSensitiveChange && !editPassword && "border-rose-500/50 bg-rose-500/5"
                            )}
                            placeholder="Masukkan password lama"
                          />
                        </div>
                        <div className="relative">
                          <ArrowRight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                          <input
                            type="password"
                            value={editNewPassword}
                            onChange={(e) => setEditNewPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-bg-main/60 rounded-lg border border-border-ui focus:border-rose-500/70 outline-none text-sm font-bold text-text-primary transition-all placeholder:font-normal placeholder:text-text-secondary/50"
                            placeholder="Masukkan password baru"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 space-y-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto border border-accent/20">
                        <ShieldCheck className="w-8 h-8 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-text-primary tracking-tight">Verifikasi OTP</h4>
                        <p className="text-[11px] text-text-secondary font-medium leading-relaxed max-w-xs mx-auto mt-1">
                          Kode 6-digit telah dikirim ke <span className="text-accent font-bold">{user.email}</span>.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="text"
                        maxLength={6}
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value.replace(/\\\\D/g, ''))}
                        className="w-full py-5 bg-bg-main rounded-lg border-2 border-border-ui focus:border-accent outline-none text-2xl font-black tracking-[0.6em] text-center text-text-primary transition-all"
                        placeholder="••••••"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpdateProfile}
                  disabled={savingProfile || !editName || (editStep === 2 && editCode.length < 6)}
                  className="w-full py-4 bg-gradient-to-r from-accent to-secondary text-white rounded-lg font-black shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 text-sm"
                >
                  {savingProfile ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>
                        {editStep === 1
                          ? ((editNewEmail && editNewEmail !== user.email) || editNewPassword
                              ? 'Lanjut ke Verifikasi OTP'
                              : 'Simpan Perubahan')
                          : 'Verifikasi & Perbarui'
                        }
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        }

        if (profileView === 'wallpaper') {
          const wallpapers = [
            { id: 'none', name: 'Default', class: 'bg-bg-main' },
            { id: 'sunset', name: 'Sunset Glow', class: 'bg-gradient-to-br from-orange-400 to-rose-500' },
            { id: 'ocean', name: 'Deep Ocean', class: 'bg-gradient-to-br from-blue-600 to-cyan-500' },
            { id: 'forest', name: 'Emerald Forest', class: 'bg-gradient-to-br from-emerald-600 to-teal-500' },
            { id: 'royal', name: 'Royal Purple', class: 'bg-gradient-to-br from-violet-600 to-fuchsia-500' },
            { id: 'midnight', name: 'Midnight', class: 'bg-gradient-to-br from-slate-800 to-slate-900' },
            { id: 'aurora', name: 'Aurora', class: 'bg-gradient-to-tr from-green-300 via-blue-500 to-purple-600' },
            { id: 'mesh', name: 'Mesh Gradient', class: 'bg-[radial-gradient(at_top_left,_var(--tw-gradient-stops))] from-yellow-200 via-emerald-200 to-yellow-200' },
            { id: 'doodle', name: 'Doodle Classic', class: 'bg-slate-900 bg-[url("/doodle_wallpaper.png")] bg-repeat bg-[length:400px_400px] bg-blend-soft-light' },
          ];

          return (
            <div className="space-y-6 pb-4">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => setProfileView('main')}
                  className="w-10 h-10 rounded-lg bg-bg-main border border-border-ui flex items-center justify-center hover:bg-border-ui transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-text-primary" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">Wallpaper</h2>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">Kustomisasi Latar Belakang</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => {
                      setWallpaper(wp.id);
                      localStorage.setItem('kb_wallpaper', wp.id);
                      showToast(`Wallpaper ${wp.name} diterapkan`, 'success');
                    }}
                    className={cn(
                      "group relative aspect-[9/16] rounded-lg overflow-hidden border-4 transition-all duration-300 active:scale-95",
                      wallpaper === wp.id ? "border-accent shadow-lg shadow-accent/20 scale-[1.02]" : "border-transparent hover:border-border-ui"
                    )}
                  >
                    <div className={cn("absolute inset-0 transition-transform duration-500 group-hover:scale-110", wp.class)} />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-[11px] font-black text-white tracking-tight">{wp.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        }

        if (profileView === 'contact') {
          return (
            <div className="space-y-6 pb-4">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => setProfileView('main')}
                  className="w-10 h-10 rounded-lg bg-bg-main border border-border-ui flex items-center justify-center hover:bg-border-ui transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-text-primary" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">Hubungi Kami</h2>
                  <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mt-0.5">Bantuan & Dukungan Teknis</p>
                </div>
              </div>
                <div className="grid gap-3">
                  <a
                    href="https://instagram.com/rizd027"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-bg-main rounded-lg border border-border-ui hover:border-rose-500/50 hover:bg-rose-500/[0.02] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Instagram className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary">Instagram</p>
                      <p className="text-[10px] text-text-secondary">Update fitur & tips keuangan</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-text-secondary" />
                  </a>
                </div>

                <div className="pt-4 border-t border-border-ui/50">
                  <div className="flex items-center justify-center gap-6">
                    <a href="#" className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-secondary hover:text-text-primary">
                      <Github className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-secondary hover:text-text-primary">
                      <Globe className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="text-[9px] text-center text-text-secondary font-black uppercase tracking-[0.2em] mt-4">
                    Vinance v2.4.0 • Made with ❤️
                  </p>
                </div>
              </div>
          );
        }

        return (
          <div className="space-y-8 pb-10">

            {/* ── Page Title (Desktop only) ── */}
            <div className="hidden lg:flex flex-col gap-1 mb-2">
              <h2 className="text-2xl font-black text-text-primary tracking-tight leading-none">Manajemen Akun</h2>
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Profil & Konfigurasi Sistem</p>
              <div className="h-1 w-12 bg-gradient-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
            </div>

            {/* ── Hero Profile Section (Flat & Premium - No Box) ── */}
            <div className="relative text-center pb-6 border-b border-border-ui/30">
              {/* Cover Image backdrop banner (Flat background bleed) */}
              <div className="h-28 w-full bg-gradient-to-br from-[#1A2C5B] via-[#2d4992] to-[#15254e] rounded-2xl relative overflow-hidden shadow-inner">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
                
                {user.coverUrl ? (
                  <img src={user.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                ) : (
                  <div className="absolute inset-0 bg-[url('/doodle_wallpaper.png')] bg-repeat bg-[length:150px_150px] opacity-10 mix-blend-soft-light" />
                )}
                
                {/* Edit Cover button */}
                <label className="absolute top-3 right-3 px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[9px] font-black text-white/90 uppercase tracking-widest cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 z-10 group">
                  <Palette className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                  Ganti Sampul
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                </label>
              </div>

              {/* Avatar circle overlaps cover with thick premium border */}
              <div className="relative -mt-12 mb-4 inline-block">
                <div className="w-24 h-24 rounded-full ring-4 ring-bg-main bg-gradient-to-br from-accent to-secondary flex items-center justify-center overflow-hidden shadow-xl relative">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-white">{user.name[0].toUpperCase()}</span>
                  )}
                  {savingProfile && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={openEditProfile}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-3 border-bg-main shadow-lg hover:scale-110 active:scale-90 transition-all text-white"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* User Info */}
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tight leading-none">{user.name}</h3>
                <p className="text-xs text-text-secondary mt-1.5 font-semibold tracking-wide">{user.email}</p>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                  <span>✦ Member Premium</span>
                </div>
              </div>
            </div>

            {/* ── Settings Sections (Flat list style, no cards) ── */}
            <div className="space-y-6">
              
              {/* SECTION: AKUN & KEAMANAN */}
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.25em] mb-2 px-1">Akun & Keamanan</p>
                <div className="space-y-1">
                  
                  {/* Edit Profil */}
                  <button
                    onClick={openEditProfile}
                    className="w-full flex items-center gap-4 py-3.5 px-2 hover:bg-accent/5 active:bg-accent/10 rounded-xl transition-all group text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                      <UserIcon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary tracking-tight">Edit Profil</p>
                      <p className="text-[10px] text-text-secondary font-medium">Ubah nama, email, dan kata sandi Anda</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary transition-colors" />
                  </button>

                  {/* Kunci PIN */}
                  <button
                    onClick={handleTogglePin}
                    className="w-full flex items-center gap-4 py-3.5 px-2 hover:bg-rose-500/5 active:bg-rose-500/10 rounded-xl transition-all group text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary tracking-tight">Kunci PIN</p>
                      <p className="text-[10px] text-text-secondary font-medium">Amankan akses aplikasi dengan kode PIN</p>
                    </div>
                    <span className={cn(
                      "text-[9px] font-black px-2.5 py-1 rounded-full border tracking-wider",
                      appPin ? "bg-accent/10 text-accent border-accent/20" : "bg-bg-main text-text-secondary border-border-ui"
                    )}>
                      {appPin ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </button>

                  {/* Google Apps Script Integration */}
                  <div className="py-3.5 px-2 rounded-xl transition-all">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                        <ExternalLink className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-text-primary tracking-tight">URL Apps Script</p>
                        <p className="text-[10px] text-text-secondary font-medium">Integrasikan data keuangan Anda dengan Google Sheets</p>
                      </div>
                      <button
                        onClick={() => setShowScriptInfo(v => !v)}
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center border transition-all",
                          showScriptInfo
                            ? "bg-accent/15 border-accent/40 text-accent"
                            : "bg-bg-main border-border-ui text-text-secondary hover:border-accent/40 hover:text-accent"
                        )}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {showScriptInfo && (
                      <div className="pl-13 mb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="bg-bg-main border border-border-ui rounded-xl p-4 space-y-2.5">
                          <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
                            Hubungkan Google Sheets pribadi Anda untuk menyinkronkan seluruh data transaksi, anggaran, target, dan catatan.
                          </p>
                          <div className="flex gap-2 p-2.5 bg-warning/5 border border-warning/20 rounded-lg">
                            <span className="text-warning mt-0.5 flex-shrink-0">⚠</span>
                            <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
                              <span className="text-warning font-bold">Penting:</span> Data kredensial login dan profil tetap diamankan di sistem pusat kami.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowSetupGuide(true)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
                          >
                            <Info className="w-3 h-3" /> Cara setup database spreadsheet
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pl-13">
                      <input
                        type="text"
                        defaultValue={user.scriptUrl || ''}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border-ui bg-bg-main/60 text-[11px] text-text-primary outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-text-secondary/40"
                        onBlur={(e) => handleUpdateScriptUrl(e.target.value)}
                      />
                      <button
                        onClick={handleTestConnection}
                        disabled={!user.scriptUrl || testingConnection}
                        className="px-4 py-2.5 bg-gradient-to-r from-accent to-secondary text-white rounded-xl text-[11px] font-bold hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                      >
                        {testingConnection ? 'Testing...' : 'Tes'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION: TAMPILAN & KUSTOMISASI */}
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.25em] mb-2 px-1">Tampilan & Kustomisasi</p>
                <div className="space-y-1">
                  
                  {/* Wallpaper */}
                  <button
                    onClick={() => setProfileView('wallpaper')}
                    className="w-full flex items-center gap-4 py-3.5 px-2 hover:bg-emerald-500/5 active:bg-emerald-500/10 rounded-xl transition-all group text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <Image className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary tracking-tight">Kustomisasi Latar Belakang</p>
                      <p className="text-[10px] text-text-secondary font-medium">Ubah wallpaper dan visual dashboard Anda</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary transition-colors" />
                  </button>

                  {/* Theme Mode */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-4 py-3.5 px-2 hover:bg-blue-500/5 active:bg-blue-500/10 rounded-xl transition-all group text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <Palette className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary tracking-tight">Tema Warna</p>
                      <p className="text-[10px] text-text-secondary font-medium">Beralih antara Mode Terang dan Gelap</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-bg-main border border-border-ui/60 px-3 py-1 rounded-full text-[10px] font-bold text-text-secondary">
                      <span>{isDark ? 'GELAP' : 'TERANG'}</span>
                    </div>
                  </button>

                </div>
              </div>

              {/* SECTION: BANTUAN & MASUKAN */}
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.25em] mb-2 px-1">Bantuan & Dukungan</p>
                <div className="space-y-1">
                  
                  {/* Hubungi Kami */}
                  <button
                    onClick={() => setProfileView('contact')}
                    className="w-full flex items-center gap-4 py-3.5 px-2 hover:bg-teal-500/5 active:bg-teal-500/10 rounded-xl transition-all group text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary tracking-tight">Hubungi Kami</p>
                      <p className="text-[10px] text-text-secondary font-medium">Hubungi bantuan teknis jika menemui kendala</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary transition-colors" />
                  </button>

                  {/* Saran & Masukan */}
                  <div className="py-3.5 px-2 rounded-xl transition-all">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
                        <MessageSquare className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-text-primary tracking-tight">Saran & Masukan</p>
                        <p className="text-[10px] text-text-secondary font-medium">Bantu kami mengembangkan aplikasi lebih baik lagi</p>
                      </div>
                    </div>
                    <div className="pl-13 space-y-2.5">
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tulis saran atau kendala yang Anda alami..."
                        className="w-full px-4 py-3 bg-bg-main/60 rounded-xl border border-border-ui focus:border-accent outline-none text-xs font-semibold text-text-primary transition-all resize-none min-h-[80px] placeholder:text-text-secondary/40"
                      />
                      <button
                        onClick={handleSendFeedback}
                        disabled={!feedback.trim() || sendingFeedback}
                        className="w-full py-2.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-fuchsia-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {sendingFeedback ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {sendingFeedback ? 'Mengirim...' : 'Kirim Masukan'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Support & Donation Banner (Borderless premium cardless view) ── */}
              <div className="pt-2">
                <a
                  href="https://saweria.co/frd027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full relative overflow-hidden p-5 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] block border border-accent/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-emerald-500/5 to-secondary/5" />
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine pointer-events-none" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                      <img src="/cat-sticker.png" alt="Cat" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-text-primary leading-none">Traktir Eskrim 🍦</h4>
                      <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest mt-1">Dukung Developer Lokal</p>
                    </div>
                  </div>
                  <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md shadow-accent/25">
                    <span>saweria</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </a>
              </div>

              {/* SECTION: KELUAR */}
              <div className="pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 py-3.5 px-2 hover:bg-danger/5 active:bg-danger/10 rounded-xl transition-all group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center text-danger group-hover:scale-110 transition-transform">
                    <LogOut className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-danger tracking-tight">Keluar Akun</p>
                    <p className="text-[10px] text-text-secondary font-medium">Akhiri sesi aktif Anda sekarang</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-danger transition-colors" />
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <Dashboard
            transactions={data.transactions}
            budgets={data.budgets}
            onAddClick={() => { setActiveTab('transactions'); setShowAddModal(true); }}
            onViewAll={() => setActiveTab('transactions')}
            onNavigateToBudget={() => setActiveTab('budgets')}
            onNavigateToProfile={() => setActiveTab('profile')}
            isDark={isDark}
            toggleTheme={toggleTheme}
            userName={user.name}
          />
        );
    }
  };

  // Conditional Rendering Logic
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (!isUnlocked) {
    return <PinLock correctPin={appPin!} onUnlock={() => setIsUnlocked(true)} mode="unlock" />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      user={user!}
      isDark={isDark}
      toggleTheme={toggleTheme}
      wallpaper={wallpaper}
      transactions={data.transactions || []}
      budgets={data.budgets || []}
      syncing={loading || syncing}
      syncStatus={loading ? 'Memuat Data...' : (syncing ? 'Sinkronisasi...' : '')}
      onAddClick={() => { handleTabChange('transactions'); setShowAddModal(true); }}
      onLogout={handleLogout}
      toasts={toasts}
      activeDialog={activeDialog}
      showNotifications={showNotifications}
      setShowNotifications={setShowNotifications}
    >


      {showSetupGuide && createPortal(
        <div className="fixed inset-0 z-[10000] flex sm:p-4 items-center justify-center">
          <div
            onClick={() => setShowSetupGuide(false)}
            className={cn(
              "fixed inset-0 bg-slate-900/60",
              !isMobile ? "backdrop-blur-sm" : "hidden"
            )}
          />
          <div
            className="relative w-full h-[100dvh] sm:h-auto sm:max-w-2xl bg-card-bg sm:rounded-lg shadow-2xl border border-border-ui flex flex-col max-h-full sm:max-h-[85vh] overflow-hidden z-10"
          >
            {/* Modal Header - Fixed */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-border-ui/50 shrink-0">
              <div>
                <h3 className="text-lg font-black text-text-primary tracking-tight">Panduan Setup Database</h3>
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">Langkah-langkah Konfigurasi</p>
              </div>
              <button onClick={() => setShowSetupGuide(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 text-sm text-text-secondary leading-relaxed custom-scrollbar pb-12">
              <section>
                <h4 className="font-bold text-text-primary mb-2">1. Buat Google Sheet Baru</h4>
                <p>Buka Google Sheets dan buat spreadsheet baru. Beri nama misalnya "Database Keuangan".</p>
              </section>

              <section>
                <h4 className="font-bold text-text-primary mb-2">2. Buka Apps Script</h4>
                <p>Di Google Sheet, klik menu <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</p>
              </section>

              <section>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-text-primary">3. Copy & Paste Kode</h4>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-bold hover:bg-accent/20 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Tersalin!' : 'Salin Kode'}
                  </button>
                </div>
                <p className="mb-3">Hapus semua kode yang ada di editor Apps Script, lalu paste kode backend di bawah ini:</p>
                <div className="bg-bg-main/50 p-4 rounded-lg border border-border-ui font-mono text-[10px] overflow-x-auto max-h-40 no-scrollbar">
                  <pre>{appsScriptCode}</pre>
                </div>
              </section>

              <section>
                <h4 className="font-bold text-text-primary mb-2">4. Deploy sebagai Web App</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Klik tombol <strong>Deploy</strong> &gt; <strong>New Deployment</strong>.</li>
                  <li>Pilih type: <strong>Web App</strong>.</li>
                  <li>Description: "Backend Keuangan".</li>
                  <li>Execute as: <strong>Me</strong>.</li>
                  <li>Who has access: <strong>Anyone</strong> (Penting agar aplikasi bisa mengaksesnya).</li>
                  <li>Klik <strong>Deploy</strong> dan copy <strong>Web App URL</strong> yang dihasilkan.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-text-primary mb-2">5. Masukkan URL ke Aplikasi</h4>
                <p>Paste URL tersebut ke kolom "Konfigurasi Database" di tab Profil aplikasi ini.</p>
              </section>

              <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                <p className="text-xs text-accent font-medium">
                  <strong>Catatan:</strong> Dengan database sendiri, semua data Anda akan tersimpan aman di Google Drive pribadi Anda dan tidak dapat diakses oleh orang lain.
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {renderContent()}


    </Layout>
  );
}

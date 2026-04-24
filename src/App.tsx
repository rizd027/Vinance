import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

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
import { LogOut, Settings, Shield, Bell, Database, ExternalLink, Info, X, Copy, Check, Lock, AlertCircle, CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight, RefreshCw, User as UserIcon, Mail, ShieldCheck, MessageSquare, Send, Coffee, ChevronRight, Image, Palette, Phone, Instagram, Github, MessageCircle, Globe, ArrowLeft, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isChangingTheme, setIsChangingTheme] = useState(false);

  const toggleTheme = () => {
    setIsChangingTheme(true);
    const nextDark = !isDark;
    
    // Increase initial delay to ensure the overlay is 100% opaque before the "big flip"
    setTimeout(() => {
      setIsDark(nextDark);
      localStorage.setItem('kb_theme', nextDark ? 'dark' : 'light');
      
      // Keep it a bit longer to hide the browser's layout recalculation stutter
      setTimeout(() => {
        setIsChangingTheme(false);
      }, 500);
    }, 250); // Increased from 80ms to ensure fade-in completes
  };

  const [appPin, setAppPin] = useState(() => localStorage.getItem('kb_pin') || null);
  const [isUnlocked, setIsUnlocked] = useState(!localStorage.getItem('kb_pin'));
  const [isSettingPin, setIsSettingPin] = useState(false);

  // Notification states
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeDialog, setActiveDialog] = useState<DialogConfig | null>(null);

  // Modals
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showGenSettings, setShowGenSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Profile Edit Temp States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
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
    setUser(newUser);
    if (newUser.scriptUrl) {
      api.setBaseUrl(newUser.scriptUrl);
    }
    localStorage.setItem('kb_user', JSON.stringify(newUser));
  };

  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const [copied, setCopied] = useState(false);

  const appsScriptCode = `/**
 * Google Apps Script for KeluargaBerkah Finance
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
      subject: '[FEEDBACK] KeluargaBerkah Finance',
      htmlBody: '<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">' +
                '<h2>Saran & Masukan Baru</h2>' +
                '<p><strong>Dari:</strong> ' + data.userName + ' (' + data.userId + ')</p>' +
                '<p><strong>Pesan:</strong></p>' +
                '<div style="background:#f9fafb;padding:15px;border-radius:8px;border-left:4px solid #059669;">' +
                data.feedback.replace(/\\n/g, "<br>") +
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
      subject: '[' + type + '] Kode Verifikasi KeluargaBerkah Finance',
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
    localStorage.removeItem('kb_user');
    setActiveTab('home');
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

    const isSensitiveChange = editEmail !== user.email || editPassword !== '';

    if (isSensitiveChange && editStep === 1) {
      setSavingProfile(true);
      try {
        const res = await api.sendUpdateCode(user.email);
        if (res.success) {
          setEditStep(2);
          showToast('Kode verifikasi telah dikirim ke email Anda', 'info');
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
      const updates: any = { name: editName, email: editEmail, photoUrl: editPhoto };
      if (editPassword) updates.password = editPassword;

      const result = await api.updateUser(user.id, updates, editCode);
      if (result.success) {
        const updatedUser = { ...user, name: editName, email: editEmail, photoUrl: editPhoto };
        setUser(updatedUser);
        localStorage.setItem('kb_user', JSON.stringify(updatedUser));
        showToast('Profil berhasil diperbaharui', 'success');
        setProfileView('main');
        setEditStep(1);
        setEditCode('');
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
    setEditEmail(user.email);
    setEditPassword('');
    setEditPhoto(user.photoUrl || '');
    setEditCode('');
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

        {/* Theme Switching Loading Overlay */}
        <AnimatePresence>
          {isChangingTheme && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "linear" }}
              className={cn(
                "fixed inset-0 z-[9999] flex flex-col items-center justify-center will-change-opacity",
                isDark ? "bg-[#020617]" : "bg-[#f1f5f9]" // Use hardcoded colors to avoid CSS variable flipping flicker
              )}
            >
              <div className="relative mb-6">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-6 h-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex items-center justify-center p-1 border border-border-ui/30">
                     <img src="/Logo-Vinance.png" alt="Logo" className="w-full h-full object-contain" />
                   </div>
                </div>
              </div>
              <p className="text-[9px] font-black text-accent uppercase tracking-[0.5em] opacity-80">Syncing Theme</p>
            </motion.div>
          )}
        </AnimatePresence>
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
            onAddClick={() => { setActiveTab('transactions'); setShowAddModal(true); }}
            onViewAll={() => setActiveTab('transactions')}
            onNavigateToBudget={() => setActiveTab('budgets')}
            userName={user.name}
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
      case 'profile':
        if (profileView === 'edit') {
          return (
            <div className="space-y-6 pb-4">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => {
                    setProfileView('main');
                    setEditStep(1);
                  }}
                  className="w-10 h-10 rounded-2xl bg-bg-main border border-border-ui flex items-center justify-center hover:bg-border-ui transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-text-primary" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">Edit Profil</h2>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">Pengaturan Akun & Keamanan</p>
                </div>
              </div>

              <div className="bg-card-bg rounded-[32px] border border-border-ui p-6 shadow-sm space-y-8">
                {editStep === 1 ? (
                  <>
                    {/* Photo Upload Section */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-bg-main bg-bg-main shadow-xl">
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
                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-2xl flex items-center justify-center border-4 border-card-bg shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                          <Palette className="w-5 h-5 text-white" />
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={savingProfile} />
                        </label>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-text-primary">Foto Profil</p>
                        <p className="text-[10px] text-text-secondary mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-1">Informasi Dasar</span>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-bg-main/50 rounded-2xl border border-border-ui focus:border-accent outline-none text-sm font-bold text-text-primary transition-all"
                            placeholder="Nama Lengkap"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-1">Keamanan & Akses</span>
                        <div className="space-y-3">
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-bg-main/50 rounded-2xl border border-border-ui focus:border-accent outline-none text-sm font-bold text-text-primary transition-all"
                              placeholder="Email Baru"
                            />
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-secondary" />
                            <input
                              type="password"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-bg-main/50 rounded-2xl border border-border-ui focus:border-accent outline-none text-sm font-bold text-text-primary transition-all"
                              placeholder="Password Baru (Opsional)"
                            />
                          </div>
                        </div>
                        {(editEmail !== user.email || editPassword !== '') && (
                          <div className="mt-4 p-4 bg-secondary/10 rounded-2xl border border-secondary/20 flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
                            <p className="text-[11px] text-secondary font-bold leading-relaxed">
                              Perubahan email atau password membutuhkan verifikasi kode OTP yang akan dikirim ke email lama Anda.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 space-y-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-accent/10 rounded-[24px] flex items-center justify-center mx-auto border border-accent/20">
                        <ShieldCheck className="w-8 h-8 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-text-primary tracking-tight">Verifikasi OTP</h4>
                        <p className="text-[11px] text-text-secondary font-medium leading-relaxed max-w-[200px] mx-auto mt-1">
                          Kode 6-digit telah dikirim ke <span className="text-accent font-bold">{user.email}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <input
                        type="text"
                        maxLength={6}
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full py-5 bg-bg-main rounded-2xl border-2 border-border-ui focus:border-accent outline-none text-2xl font-black tracking-[0.6em] text-center text-text-primary transition-all"
                        placeholder="••••••"
                        autoFocus
                      />
                      <button
                        onClick={() => setEditStep(1)}
                        className="w-full text-[11px] font-black text-text-secondary hover:text-accent uppercase tracking-[0.2em] transition-colors"
                      >
                        ← Ganti Email/Nama
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpdateProfile}
                  disabled={savingProfile || !editName || !editEmail || (editStep === 2 && editCode.length < 6)}
                  className="w-full py-4.5 bg-gradient-to-r from-accent to-secondary text-white rounded-2xl font-black shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 text-sm"
                >
                  {savingProfile ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>
                        {editStep === 1 ? (
                          (editEmail !== user.email || editPassword !== '') ? 'Lanjut ke Verifikasi' : 'Simpan Perubahan'
                        ) : 'Verifikasi & Perbarui'}
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
            { id: 'doodle2', name: 'Growth Doodle', class: 'bg-slate-900 bg-[url("/doodle_2.png")] bg-repeat bg-[length:350px_350px] bg-blend-soft-light' },
            { id: 'doodle3', name: 'Abstract Flow', class: 'bg-[#020617] bg-[url("/doodle_3.png")] bg-repeat bg-[length:500px_500px] bg-blend-soft-light' },
          ];

          return (
            <div className="space-y-6 pb-4">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => setProfileView('main')}
                  className="w-10 h-10 rounded-2xl bg-bg-main border border-border-ui flex items-center justify-center hover:bg-border-ui transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-text-primary" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">Wallpaper</h2>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">Kustomisasi Latar Belakang</p>
                </div>
              </div>

              {/* Preset Wallpapers */}
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
                      "group relative aspect-[9/16] rounded-[32px] overflow-hidden border-4 transition-all duration-300 active:scale-95",
                      wallpaper === wp.id ? "border-accent shadow-lg shadow-accent/20 scale-[1.02]" : "border-transparent hover:border-border-ui"
                    )}
                  >
                    <div className={cn("absolute inset-0 transition-transform duration-500 group-hover:scale-110", wp.class)} />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-[11px] font-black text-white tracking-tight">{wp.name}</p>
                      {wallpaper === wp.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Options Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-1">Warna & Foto Kustom</p>
                <div className="bg-card-bg rounded-[32px] border border-border-ui p-6 shadow-sm space-y-6">
                  
                  {/* Custom Color Picker */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Warna Solid</p>
                        <p className="text-[10px] text-text-secondary">Pilih warna favorit Anda</p>
                      </div>
                    </div>
                    <div className="relative group">
                      <input 
                        type="color" 
                        value={wallpaper.startsWith('#') ? wallpaper : '#059669'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWallpaper(val);
                          localStorage.setItem('kb_wallpaper', val);
                        }}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 outline-none overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-xl shadow-lg"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-border-ui/50" />

                  {/* Image Upload */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Image className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Upload Foto</p>
                        <p className="text-[10px] text-text-secondary">Gunakan gambar sendiri</p>
                      </div>
                    </div>
                    <label className="px-4 py-2 bg-bg-main hover:bg-border-ui border border-border-ui rounded-xl text-xs font-black text-text-primary cursor-pointer transition-colors active:scale-95">
                      Pilih File
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleWallpaperUpload}
                      />
                    </label>
                  </div>

                  {wallpaper.startsWith('data:') && (
                    <div className="mt-2 p-3 bg-accent/5 rounded-2xl border border-accent/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded-lg overflow-hidden border border-border-ui">
                          <img src={wallpaper} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Foto Kustom Aktif</p>
                      </div>
                      <button 
                        onClick={() => {
                          setWallpaper('none');
                          localStorage.setItem('kb_wallpaper', 'none');
                        }}
                        className="p-1.5 hover:bg-danger/10 rounded-lg text-danger transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
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
                  className="w-10 h-10 rounded-2xl bg-bg-main border border-border-ui flex items-center justify-center hover:bg-border-ui transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-text-primary" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">Hubungi Kami</h2>
                  <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mt-0.5">Bantuan & Dukungan Teknis</p>
                </div>
              </div>

              <div className="bg-card-bg rounded-[32px] border border-border-ui p-6 shadow-sm space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-teal-500/10 rounded-[24px] flex items-center justify-center mx-auto border border-teal-500/20">
                    <Phone className="w-8 h-8 text-teal-500" />
                  </div>
                  <h3 className="text-base font-black text-text-primary tracking-tight">Ada Kendala?</h3>
                  <p className="text-xs text-text-secondary font-medium leading-relaxed max-w-[240px] mx-auto">
                    Kami siap membantu Anda mengelola keuangan dengan lebih baik. Silakan hubungi melalui saluran di bawah ini.
                  </p>
                </div>

                <div className="grid gap-3">
                  <a
                    href="https://wa.me/6285185443576"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-bg-main rounded-2xl border border-border-ui hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary">WhatsApp Support</p>
                      <p className="text-[10px] text-text-secondary">Respon cepat (6285185443576)</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-text-secondary" />
                  </a>

                  <a
                    href="mailto:alfarizd027@gmail.com"
                    className="flex items-center gap-4 p-4 bg-bg-main rounded-2xl border border-border-ui hover:border-blue-500/50 hover:bg-blue-500/[0.02] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary">Email Official</p>
                      <p className="text-[10px] text-text-secondary">alfarizd027@gmail.com</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-text-secondary" />
                  </a>

                  <a
                    href="https://instagram.com/vinance.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-bg-main rounded-2xl border border-border-ui hover:border-rose-500/50 hover:bg-rose-500/[0.02] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                    <a href="#" className="p-2 hover:bg-bg-main rounded-xl transition-colors text-text-secondary hover:text-text-primary">
                      <Github className="w-5 h-5" />
                    </a>
                    <a href="#" className="p-2 hover:bg-bg-main rounded-xl transition-colors text-text-secondary hover:text-text-primary">
                      <Globe className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="text-[9px] text-center text-text-secondary font-black uppercase tracking-[0.2em] mt-4">
                    Vinance v2.4.0 • Made with ❤️
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6 pb-4">

            {/* ── Page Title (Desktop only) ── */}
            <div className="hidden lg:flex flex-col gap-1 mb-2">
              <h2 className="text-2xl font-black text-text-primary tracking-tight leading-none">Manajemen Akun</h2>
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Profil & Konfigurasi Sistem</p>
              <div className="h-1 w-12 bg-gradient-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
            </div>

            {/* ── Hero Profile Card ── */}
            <div className="bg-card-bg rounded-3xl border border-border-ui shadow-sm overflow-hidden relative">
              {/* Global Card Doodle Pattern */}
              <div className="absolute inset-0 bg-[url('/doodle_wallpaper.png')] bg-repeat bg-[length:250px_250px] opacity-[0.05] pointer-events-none" />

              {/* Gradient Banner with Doodle Art */}
              <div className="h-20 bg-gradient-to-br from-accent via-emerald-500 to-secondary relative overflow-hidden">
                {/* Doodle Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('/doodle_wallpaper.png')] bg-repeat bg-[length:200px_200px] opacity-20 mix-blend-soft-light" />
                
                {/* User Cover Image */}
                {user.coverUrl && (
                  <img src={user.coverUrl} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
                )}

                {/* Edit Sampul Button */}
                <label className="absolute top-2 right-2 px-2.5 py-1.5 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-xl border border-white/20 text-[9px] font-black text-white uppercase tracking-[0.1em] cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 z-10 group">
                  <Palette className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                  Edit Sampul
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                </label>
              </div>

              {/* Profile Picture (Outside banner overflow) */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10">
                <div className="w-20 h-20 rounded-full ring-4 ring-card-bg shadow-xl overflow-hidden bg-gradient-to-br from-accent to-secondary flex items-center justify-center relative">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-white">{user.name[0].toUpperCase()}</span>
                  )}
                </div>
                <button
                  onClick={openEditProfile}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-card-bg shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* User Info */}
              <div className="pt-12 pb-5 px-6 text-center">
                <h3 className="text-lg font-black text-text-primary tracking-tight">{user.name}</h3>
                <p className="text-xs text-text-secondary mt-0.5 font-medium">{user.email}</p>
                {/* Member badge */}
                <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full shadow-md shadow-amber-500/25">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">✦ Member Aktif</span>
                </div>
              </div>
            </div>

            {/* ── Settings List ── */}
            <div>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 px-1">Pengaturan</p>
              <div className="bg-card-bg rounded-3xl border border-border-ui shadow-sm divide-y divide-border-ui/50 overflow-hidden">

                {/* Edit Profil */}
                <button
                  onClick={openEditProfile}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bg-main transition-colors group text-left"
                >
                  <div className="w-9 h-9 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-4.5 h-4.5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary">Edit Profil</p>
                    <p className="text-[10px] text-text-secondary">Nama, email & kata sandi</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                </button>

                {/* URL Script */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-9 h-9 rounded-2xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="w-4.5 h-4.5 text-violet-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">URL Apps Script</p>
                      <p className="text-[10px] text-text-secondary">Endpoint Google Sheets</p>
                    </div>
                    <button
                      onClick={() => setShowScriptInfo(v => !v)}
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center border transition-all flex-shrink-0",
                        showScriptInfo
                          ? "bg-accent/15 border-accent/40 text-accent"
                          : "bg-bg-main border-border-ui text-text-secondary hover:border-accent/40 hover:text-accent"
                      )}
                      title="Informasi"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Collapsible Info Panel */}
                  {showScriptInfo && (
                    <div className="pl-[52px] mb-3">
                      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 space-y-2.5">
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          Hubungkan Google Sheets pribadi Anda untuk menyimpan{' '}
                          <span className="text-text-primary font-bold">data keuangan</span>{' '}
                          (transaksi, anggaran, tujuan, dan catatan).
                        </p>
                        <div className="flex gap-2 p-2.5 bg-warning/5 border border-warning/20 rounded-xl">
                          <span className="text-warning mt-0.5 flex-shrink-0">⚠</span>
                          <p className="text-[11px] text-text-secondary leading-relaxed">
                            <span className="text-warning font-bold">Penting:</span> Database mandiri ini khusus untuk pengelolaan data keuangan.{' '}
                            <span className="text-text-primary font-bold">Data akun & sistem (Login, Password, Profil)</span>{' '}
                            akan tetap dikelola dan disimpan secara aman di database sistem pusat Vinance.
                          </p>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">
                          Kosongkan jika ingin menggunakan database sistem secara penuh. Setup ini hanya bagi Anda yang ingin fleksibilitas mengelola data keuangan via spreadsheet sendiri.
                        </p>
                        <button
                          onClick={() => setShowSetupGuide(true)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
                        >
                          <Info className="w-3 h-3" /> Cara setup database sendiri
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pl-[52px]">
                    <input
                      type="text"
                      defaultValue={user.scriptUrl || ''}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="flex-1 px-3 py-2 rounded-xl border border-border-ui bg-bg-main/60 text-[11px] text-text-primary outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-text-secondary/40"
                      onBlur={(e) => handleUpdateScriptUrl(e.target.value)}
                    />
                    <button
                      onClick={handleTestConnection}
                      disabled={!user.scriptUrl || testingConnection}
                      className="px-3 py-2 bg-gradient-to-r from-accent to-secondary text-white rounded-xl text-[11px] font-bold hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                    >
                      {testingConnection ? '...' : 'Tes'}
                    </button>
                  </div>
                </div>

                {/* Kunci PIN */}
                <button
                  onClick={handleTogglePin}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bg-main transition-colors group"
                >
                  <div className="w-9 h-9 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4.5 h-4.5 text-rose-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-text-primary">Kunci PIN</p>
                    <p className="text-[10px] text-text-secondary">Keamanan aplikasi</p>
                  </div>
                  <span className={cn(
                    "text-[9px] font-black px-2.5 py-1 rounded-full border",
                    appPin ? "bg-accent/10 text-accent border-accent/20" : "bg-bg-main text-text-secondary border-border-ui"
                  )}>
                    {appPin ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </button>

                {/* Notifikasi */}
                <button
                  onClick={() => setShowNotifSettings(true)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bg-main transition-colors group"
                >
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4.5 h-4.5 text-amber-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-text-primary">Notifikasi</p>
                    <p className="text-[10px] text-text-secondary">Pengingat & peringatan</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold", appSettings.notifBudgets ? "text-accent" : "text-text-secondary")}>
                      {appSettings.notifBudgets ? 'Aktif' : 'Off'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                  </div>
                </button>

                {/* Wallpaper */}
                <button
                  onClick={() => setProfileView('wallpaper')}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bg-main transition-colors group"
                >
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Image className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-text-primary">Wallpaper</p>
                    <p className="text-[10px] text-text-secondary">Kustomisasi latar belakang</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                </button>

                {/* Theme */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bg-main transition-colors group"
                >
                  <div className="w-9 h-9 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Palette className="w-4.5 h-4.5 text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-text-primary">Tema</p>
                    <p className="text-[10px] text-text-secondary">Gelap & Terang</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">
                      {isDark ? 'Gelap' : 'Terang'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                  </div>
                </button>

                {/* Logout Akun */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-danger/5 transition-colors group text-left"
                >
                  <div className="w-9 h-9 rounded-2xl bg-danger/10 flex items-center justify-center flex-shrink-0 group-hover:bg-danger/20 transition-colors">
                    <LogOut className="w-4.5 h-4.5 text-danger" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-danger">Keluar Akun</p>
                    <p className="text-[10px] text-text-secondary">Selesai sesi ini</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-danger transition-colors" />
                </button>

              </div>
            </div>

            {/* ── Feedback & Support ── */}
            <div>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 px-1">Bantuan</p>
              <div className="bg-card-bg rounded-3xl border border-border-ui shadow-sm overflow-hidden">

                {/* Kontak */}
                <button
                  onClick={() => setProfileView('contact')}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bg-main transition-colors group text-left border-b border-border-ui/50"
                >
                  <div className="w-9 h-9 rounded-2xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4.5 h-4.5 text-teal-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary">Hubungi Kami</p>
                    <p className="text-[10px] text-text-secondary">Bantuan & dukungan teknis</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                </button>

                {/* Feedback */}
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4.5 h-4.5 text-fuchsia-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Saran & Masukan</p>
                      <p className="text-[10px] text-text-secondary">Bantu kami berkembang</p>
                    </div>
                  </div>
                  <div className="pl-[52px] space-y-2">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tulis saran atau kendala yang Anda alami..."
                      className="w-full px-3 py-2.5 bg-bg-main/60 rounded-2xl border border-border-ui focus:border-accent outline-none text-xs font-medium text-text-primary transition-all resize-none min-h-[80px] placeholder:text-text-secondary/40"
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

                {/* Divider */}
                <div className="border-t border-border-ui/50" />

                {/* Support Banner */}
                <div className="p-4">
                  <a
                    href="https://saweria.co/frd027"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full relative overflow-hidden p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent via-emerald-500 to-secondary" />
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine pointer-events-none" />
                    <div className="relative flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 overflow-hidden group-hover:scale-110 transition-transform">
                        <img src="/cat-sticker.png" alt="Cat" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white leading-none">Traktir Eskrim 🍦</h4>
                        <p className="text-[9px] text-white/80 font-bold uppercase tracking-wider mt-0.5">Dukung Developer Lokal</p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-xl border border-white/30">
                      <span className="text-[10px] font-black text-white">saweria</span>
                      <ExternalLink className="w-3 h-3 text-white/70" />
                    </div>
                  </a>
                </div>
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
      setActiveTab={setActiveTab}
      user={user}
      isDark={isDark}
      toggleTheme={toggleTheme}
      wallpaper={wallpaper}
      transactions={data.transactions || []}
      budgets={data.budgets || []}
      syncing={loading || syncing}
      syncStatus={loading ? 'Memuat Data...' : (syncing ? 'Sinkronisasi...' : '')}
      onAddClick={() => { setActiveTab('transactions'); setShowAddModal(true); }}
      onLogout={handleLogout}
    >


      {showSetupGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowSetupGuide(false)}
            className={cn(
              "fixed inset-0 bg-slate-900/60",
              !isMobile && "backdrop-blur-sm"
            )}
          />
          <div
            className="relative w-full max-w-2xl bg-card-bg rounded-[32px] shadow-2xl border border-border-ui flex flex-col max-h-[85vh] overflow-hidden z-10"
          >
            {/* Modal Header - Fixed */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-border-ui/50 shrink-0">
              <div>
                <h3 className="text-lg font-black text-text-primary tracking-tight">Panduan Setup Database</h3>
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">Langkah-langkah Konfigurasi</p>
              </div>
              <button onClick={() => setShowSetupGuide(false)} className="p-2 hover:bg-bg-main rounded-xl transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 text-sm text-text-secondary leading-relaxed custom-scrollbar">
              <section>
                <h4 className="font-bold text-text-primary mb-2">1. Buat Google Sheet Baru</h4>
                <p>Buka Google Sheets dan buat spreadsheet baru. Beri nama misalnya "Database Keuangan Keluarga".</p>
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
                <div className="bg-bg-main/50 p-4 rounded-xl border border-border-ui font-mono text-[10px] overflow-x-auto max-h-40 no-scrollbar">
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

              <div className="bg-accent/5 p-4 rounded-xl border border-accent/20">
                <p className="text-xs text-accent font-medium">
                  <strong>Catatan:</strong> Dengan database sendiri, semua data Anda akan tersimpan aman di Google Drive pribadi Anda dan tidak dapat diakses oleh orang lain.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderContent()}

      {/* Global Notification & Toast Stack - Top Right (Moved down to clear header) */}
      <div className="fixed top-22 right-6 z-[100] flex flex-col gap-3 w-full max-w-[320px] pointer-events-none items-end">
        <AnimatePresence>
          {/* Toasts */}
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              layout
              className={cn(
                "px-5 py-4 rounded-[22px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-4 border backdrop-blur-xl pointer-events-auto w-full",
                toast.type === 'success' && "bg-success/15 border-success/30 text-success",
                toast.type === 'error' && "bg-danger/15 border-danger/30 text-danger",
                toast.type === 'warning' && "bg-warning/15 border-warning/30 text-warning",
                toast.type === 'info' && "bg-accent/15 border-accent/30 text-accent"
              )}
            >
              <div className="shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {toast.type === 'error' && <AlertOctagon className="w-5 h-5" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {toast.type === 'info' && <Info className="w-5 h-5" />}
              </div>
              <span className="text-[11px] font-bold leading-tight tracking-tight">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Custom Global Dialog (Alert/Confirm) - Top Right Slide-in */}
        {activeDialog && (
          <div className="fixed inset-0 z-[110] flex p-4 justify-end items-start pointer-events-none">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
              onClick={() => activeDialog.onCancel()}
            />
            <div
              className="relative w-full max-w-sm bg-card-bg rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-border-ui pointer-events-auto mt-20"
            >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                activeDialog.type === 'confirm' ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
              )}>
                {activeDialog.type === 'confirm' ? <AlertCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary tracking-tight">{activeDialog.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-medium">
                  {activeDialog.message}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <button
                onClick={() => activeDialog.onConfirm()}
                className="w-full py-4 bg-linear-to-r from-accent to-secondary text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-[0.98] transition-all text-sm"
              >
                {activeDialog.confirmText}
              </button>
              {activeDialog.type === 'confirm' && (
                <button
                  onClick={() => activeDialog.onCancel()}
                  className="w-full py-4 bg-bg-main text-text-secondary rounded-2xl font-bold hover:bg-border-ui transition-colors text-sm"
                >
                  {activeDialog.cancelText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showNotifSettings && (
        <div className="fixed inset-0 z-50 flex p-4 overflow-y-auto">
          <div
            onClick={() => setShowNotifSettings(false)}
            className={cn(
              "fixed inset-0 bg-slate-900/60",
              !isMobile && "backdrop-blur-sm"
            )}
          />
          <div className="relative bg-card-bg p-8 rounded-3xl border border-border-ui shadow-2xl w-full max-w-sm mt-4 mx-auto mb-auto z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-text-primary">Notifikasi</h3>
              <button onClick={() => setShowNotifSettings(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setAppSettings((prev: any) => ({ ...prev, notifBudgets: !prev.notifBudgets }))}
                className="w-full flex items-center justify-between p-4 bg-bg-main/50 rounded-2xl border border-border-ui"
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-text-primary">Pengingat Anggaran</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Alert jika kategori hampir habis.</p>
                </div>
                <div className={cn("w-10 h-6 rounded-full transition-colors relative", appSettings.notifBudgets ? "bg-accent" : "bg-border-ui")}>
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", appSettings.notifBudgets ? "left-5" : "left-1")} />
                </div>
              </button>

              <button
                onClick={() => setAppSettings((prev: any) => ({ ...prev, notifSync: !prev.notifSync }))}
                className="w-full flex items-center justify-between p-4 bg-bg-main/50 rounded-2xl border border-border-ui"
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-text-primary">Status Sinkronisasi</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Tampilkan toast saat simpan cloud.</p>
                </div>
                <div className={cn("w-10 h-6 rounded-full transition-colors relative", appSettings.notifSync ? "bg-accent" : "bg-border-ui")}>
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", appSettings.notifSync ? "left-5" : "left-1")} />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Switching Loading Overlay (Main App) */}
      <AnimatePresence>
        {isChangingTheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "linear" }}
            className={cn(
              "fixed inset-0 z-[9999] flex flex-col items-center justify-center will-change-opacity",
              isDark ? "bg-[#020617]" : "bg-[#f1f5f9]"
            )}
          >
            <div className="relative mb-6">
              <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-6 h-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center p-1.5 border border-border-ui/50">
                   <img src="/Logo-Vinance.png" alt="Logo" className="w-full h-full object-contain" />
                 </div>
              </div>
            </div>
            <p className="text-[9px] font-black text-accent uppercase tracking-[0.5em] opacity-80">Syncing Theme</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

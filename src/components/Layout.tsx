import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Home, List, PieChart, Target, User, LogOut, Moon, Sun, Plus, RefreshCw, TrendingUp, Wallet, StickyNote, Flag, Cloud, CloudOff, LayoutGrid, X, Bell, AlertCircle, CheckCircle2, AlertOctagon, AlertTriangle, Info } from 'lucide-react';

import { cn, formatCurrency } from '../lib/utils';
import { Transaction, Budget, User as UserType } from '../types';
import { isToday } from 'date-fns';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType;
  isDark: boolean;
  toggleTheme: () => void;
  transactions: Transaction[];
  budgets: Budget[];
  syncing: boolean;
  syncStatus?: string;
  onAddClick: () => void;
  onLogout: () => void;
  wallpaper?: string;
  toasts?: any[];
  activeDialog?: any;
}

export default function Layout({
  children, activeTab, setActiveTab, user, isDark, toggleTheme, transactions, budgets, syncing, syncStatus, onAddClick, onLogout, wallpaper = 'none', toasts = [], activeDialog
}: LayoutProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPending, startTransition] = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId) return;
    startTransition(() => {
      setActiveTab(tabId);
    });
  };


  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const mainTabs = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'transactions', icon: List, label: 'Pencatatan' },
    { id: 'budgets', icon: Target, label: 'Budgeting' },
    { id: 'reports', icon: PieChart, label: 'Laporan' },
    { id: 'goals', icon: Flag, label: 'Goals' },
    { id: 'notes', icon: StickyNote, label: 'Catatan' },
  ];

  const allTabs = [...mainTabs, { id: 'profile', icon: User, label: 'Akun' }];

  // Live stats for sidebar badges
  const sidebarStats = useMemo(() => {
    const todayTxCount = (transactions || []).filter(t => isToday(new Date(t.date))).length;
    return { todayTxCount };
  }, [transactions]);

  const transactionBadge = sidebarStats.todayTxCount > 0 ? sidebarStats.todayTxCount : null;

  const activeTabDef = allTabs.find(t => t.id === activeTab);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = (toasts?.length || 0) + (activeDialog ? 1 : 0);

  return (
    <div className="h-screen bg-bg-main flex overflow-hidden relative" onClick={() => setShowNotifications(false)}>

      {/* Sidebar for Desktop */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col sticky top-0 h-screen border-r border-sidebar-border transition-all duration-500 ease-in-out z-40 bg-sidebar-bg group/sidebar overflow-hidden",
          "w-20 hover:w-64"
        )}
      >
        <div className="px-5 py-6 border-b border-sidebar-border/30 flex items-center gap-4 h-[89px] shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3.5 flex-1 hover:bg-sidebar-text-primary/5 transition-colors text-left group rounded-lg -ml-1 pl-1 py-1"
          >
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2 bg-accent/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-10 h-10 bg-white dark:bg-slate-50 rounded-lg flex items-center justify-center shadow-xl border border-slate-200 dark:border-accent/10 p-1.5 transition-transform group-hover:scale-105 duration-300">
                <img src="/Logo-Vinance.png" alt="Vinance Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <span className="text-xl font-black tracking-tight text-sidebar-text-primary leading-none" style={{ textShadow: isDark ? '0 0 20px rgba(5, 150, 105, 0.4)' : 'none' }}>
                Vinance
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-[1.5px] w-3 bg-linear-to-r from-accent to-secondary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary/80">Ecosystem</span>
              </div>
            </div>
          </button>
          <div className="flex-shrink-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
            {syncing ? (
              <RefreshCw className="w-3.5 h-3.5 text-accent animate-spin" />
            ) : (
              <div className={cn("w-2 h-2 rounded-full shadow-sm", isOnline ? 'bg-success shadow-success/40' : 'bg-danger shadow-danger/40')} />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-3.5 space-y-8">

          {/* Navigation Section */}
          <div className="space-y-1.5">
            <p className="px-3.5 mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary/40 whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">Menu Utama</p>
            <nav className="space-y-1">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-3.5 py-3 text-sm transition-all rounded-lg font-bold relative group",
                    activeTab === tab.id
                      ? "text-accent bg-accent/10 shadow-inner"
                      : "text-sidebar-text-secondary hover:text-sidebar-text-primary hover:bg-bg-main/40"
                  )}
                >
                  <tab.icon className={cn("w-5 h-5 shrink-0 transition-all duration-300", activeTab === tab.id ? "scale-110" : "group-hover:translate-x-0.5")} />
                  <span className="flex-1 text-left tracking-wide opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">{tab.label}</span>
                  {tab.id === 'transactions' && transactionBadge && (
                    <span className={cn(
                      "flex-shrink-0 w-5 h-5 bg-linear-to-r from-accent to-secondary text-white text-[10px] font-bold rounded-lg flex items-center justify-center shadow-lg shadow-accent/20 transition-all",
                      "group-hover/sidebar:scale-100 scale-0 group-hover/sidebar:opacity-100 opacity-0"
                    )}>
                      {transactionBadge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-3.5 border-t border-sidebar-border/30 space-y-1 shrink-0">
          <button
            onClick={() => handleTabClick('profile')}
            className={cn(
              "w-full flex items-center gap-3.5 px-3.5 py-3 text-sm transition-all rounded-lg font-medium group",
              activeTab === 'profile'
                ? "text-accent bg-accent/10 shadow-inner"
                : "text-sidebar-text-secondary hover:text-sidebar-text-primary hover:bg-bg-main/40"
            )}
          >
            <User className={cn("w-5 h-5 shrink-0 transition-all", activeTab === 'profile' && "scale-110")} />
            <span className="tracking-wide opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">Profil Saya</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 text-sm font-medium text-danger/80 hover:text-danger hover:bg-danger/5 transition-all rounded-lg group"
          >
            <div className="w-5 h-5 shrink-0 flex items-center justify-center transition-transform group-hover:-translate-x-0.5">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="tracking-wide opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">Keluar Sesi</span>
          </button>
        </div>
      </aside>

      <div
        className="flex-1 flex flex-col h-screen overflow-y-auto pb-24 lg:pb-0 min-w-0 no-scrollbar sm:custom-scrollbar relative transition-colors"
      >
        {/* Wallpaper Background Layer */}
        {wallpaper !== 'none' && (
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div 
              className={cn(
                "absolute inset-0 transition-all duration-700",
                wallpaper === 'sunset' && "bg-linear-to-br from-orange-400/10 to-rose-500/15",
                wallpaper === 'ocean' && "bg-linear-to-br from-blue-600/10 to-cyan-500/15",
                wallpaper === 'forest' && "bg-linear-to-br from-emerald-600/10 to-teal-500/15",
                wallpaper === 'royal' && "bg-linear-to-br from-violet-600/10 to-fuchsia-500/15",
                wallpaper === 'midnight' && "bg-linear-to-br from-slate-800/20 to-slate-900/30",
                wallpaper === 'aurora' && "bg-linear-to-tr from-green-300/10 via-blue-500/10 to-purple-600/15",
                wallpaper === 'mesh' && "bg-[radial-gradient(at_top_left,_var(--tw-gradient-stops))] from-yellow-200/5 via-emerald-200/5 to-yellow-200/5",
                wallpaper === 'doodle' && "bg-slate-900/5 bg-[url('/doodle_wallpaper.png')] bg-repeat bg-[length:400px_400px] bg-blend-soft-light opacity-30",
                wallpaper === 'doodle2' && "bg-slate-900/5 bg-[url('/doodle_2.png')] bg-repeat bg-[length:350px_350px] bg-blend-soft-light opacity-25",
                wallpaper === 'doodle3' && "bg-[#020617]/5 bg-[url('/doodle_3.png')] bg-repeat bg-[length:500px_500px] bg-blend-soft-light opacity-20"
              )} 
              style={{
                backgroundColor: wallpaper.startsWith('#') ? `${wallpaper}15` : undefined,
                backgroundImage: wallpaper.startsWith('data:') ? `url(${wallpaper})` : undefined,
                backgroundSize: wallpaper.startsWith('data:') ? 'cover' : undefined,
                backgroundPosition: wallpaper.startsWith('data:') ? 'center' : undefined,
              }}
            />
            {/* Subtle overlay to ensure readability */}
            <div className="absolute inset-0 bg-bg-main/20 backdrop-blur-[2px]" />
          </div>
        )}

        <header className={cn(
          "bg-card-bg/80 backdrop-blur-xl border-b border-border-ui/50 px-4 sm:px-6 py-4 flex items-center justify-between z-20 sticky top-0 shadow-sm transition-all",
          isMobile && activeTab !== 'home' && "hidden"
        )}>
          <div className="relative z-10 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile: Logo & App Name */}
              <button
                onClick={() => setActiveTab('home')}
                className="flex lg:hidden items-center gap-2.5 active:scale-95 transition-transform"
              >
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-lg p-1.5 border border-accent/20">
                  <img src="/Logo-Vinance.png" alt="Vinance Logo" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-lg font-black text-text-primary tracking-tight leading-none">
                    Vinance
                  </span>
                  <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest mt-1">Ecosystem</span>
                </div>
              </button>

              {/* Desktop: Active Tab Title */}
              {activeTabDef && (
                <div className="hidden lg:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center border border-accent/20 shadow-inner">
                    {React.createElement(activeTabDef.icon, { className: "w-5 h-5 text-accent" })}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-lg font-black text-text-primary leading-none tracking-tight">{activeTabDef.label}</h1>
                    <p className="text-[10px] text-text-secondary font-bold mt-1.5 uppercase tracking-widest">
                      {activeTabDef.id === 'home' ? 'Ringkasan Keuangan' :
                        activeTabDef.id === 'transactions' ? 'Catatan Harian' :
                          activeTabDef.id === 'budgets' ? 'Manajemen Anggaran' :
                            activeTabDef.id === 'reports' ? 'Analisis Arus Kas' :
                              activeTabDef.id === 'goals' ? 'Target Tabungan' :
                                activeTabDef.id === 'notes' ? 'Memo Finansial' : 'Manajemen Akun & Sistem'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 relative">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifications(!showNotifications);
                  }}
                  className={cn(
                    "flex items-center justify-center h-8 sm:h-10 px-3 sm:px-4 rounded-lg border transition-all duration-300 relative group overflow-hidden shadow-sm",
                    syncing
                      ? "bg-accent/10 border-accent/30 text-accent"
                      : isOnline
                        ? "bg-accent/5 border-accent/25 text-accent hover:border-accent/40 hover:bg-accent/10"
                        : "bg-danger/10 border-danger/20 text-danger",
                    showNotifications && "ring-2 ring-accent/30 border-accent/50 bg-accent/5"
                  )}
                  title={syncing ? syncStatus : (isOnline ? 'Sistem Terhubung' : 'Koneksi Terputus')}
                >
                  {/* Premium Background Glow Effect */}
                  {isOnline && !syncing && (
                    <div className="absolute inset-0 bg-linear-to-tr from-accent/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                  
                  <div className="flex items-center gap-2.5 relative z-10">
                    <div className="relative">
                      {syncing ? (
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      ) : isOnline ? (
                        <div className="relative">
                          <Cloud className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-300" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full border-2 border-white dark:border-slate-800 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                        </div>
                      ) : (
                        <div className="relative">
                          <CloudOff className="w-4 h-4 shrink-0" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full border-2 border-white dark:border-slate-800 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start leading-none hidden sm:flex">
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {syncing ? 'Sinkronisasi' : isOnline ? 'Online' : 'Offline'}
                      </span>
                      {syncing && (
                        <span className="text-[8px] font-bold text-accent/70 mt-0.5 truncate max-w-[80px]">
                          {syncStatus}
                        </span>
                      )}
                    </div>

                    {notificationCount > 0 && (
                      <div className="w-4 h-4 bg-accent text-white text-[9px] font-black rounded-lg flex items-center justify-center shadow-lg shadow-accent/20 animate-bounce sm:animate-none">
                        {notificationCount}
                      </div>
                    )}
                  </div>
                </button>

                {/* Notification Badge */}
                {notificationCount > 0 && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-card-bg z-40 pointer-events-none"
                  >
                    {notificationCount}
                  </div>
                )}

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-3 w-80 bg-card-bg/95 backdrop-blur-2xl border border-border-ui rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden z-50 p-4"
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">Pemberitahuan</h4>
                      {notificationCount > 0 && (
                        <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                          {notificationCount} Baru
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar py-1">
                      {notificationCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-text-secondary/40">
                          <Bell className="w-8 h-8 mb-2 stroke-[1.5]" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Tidak ada notifikasi</p>
                        </div>
                      ) : (
                        <>
                          {/* Active Dialog (Priority) */}
                          {activeDialog && (
                            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                  <AlertCircle className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-text-primary leading-tight">{activeDialog.title}</p>
                                  <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">{activeDialog.message}</p>
                                </div>
                                </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => activeDialog.onConfirm()}
                                  className="flex-1 py-2.5 bg-accent text-white rounded-lg text-[10px] font-black shadow-lg shadow-accent/20"
                                >
                                  {activeDialog.confirmText?.toUpperCase()}
                                </button>
                                {activeDialog.type === 'confirm' && (
                                  <button
                                    onClick={() => activeDialog.onCancel()}
                                    className="flex-1 py-2.5 bg-bg-main text-text-secondary rounded-lg text-[10px] font-bold border border-border-ui"
                                  >
                                    {activeDialog.cancelText?.toUpperCase()}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Toasts */}
                          {toasts.map((toast) => (
                            <div
                              key={toast.id}
                              className={cn(
                                "p-3 rounded-lg flex items-center gap-3 border transition-colors",
                                toast.type === 'success' && "bg-success/5 border-success/20 text-success",
                                toast.type === 'error' && "bg-danger/5 border-danger/20 text-danger",
                                toast.type === 'warning' && "bg-warning/5 border-warning/20 text-warning",
                                toast.type === 'info' && "bg-accent/5 border-accent/20 text-accent"
                              )}
                            >
                              <div className="shrink-0">
                                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                                {toast.type === 'error' && <AlertOctagon className="w-4 h-4" />}
                                {toast.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                                {toast.type === 'info' && <Info className="w-4 h-4" />}
                              </div>
                              <p className="text-[11px] font-bold leading-tight flex-1">{toast.message}</p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={cn(
                  "flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md transition-all border backdrop-blur-md shadow-inner",
                  isDark
                    ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                    : "bg-bg-main border-border-ui text-text-secondary hover:bg-border-ui"
                )}
                title={isDark ? "Mode Terang" : "Mode Gelap"}
              >
                {isDark ? <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-5 max-w-[1600px] mx-auto w-full relative z-10">
          {children}
        </main>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
            />
            <div
              className="fixed bottom-[110px] left-6 right-6 z-30"
            >
              <div className="bg-card-bg/95 backdrop-blur-xl border border-border-ui rounded-lg p-6 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-text-primary">Menu Utama</h3>
                  <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-bg-main flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border-ui transition-all">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                  {mainTabs.filter(tab => !['home', 'transactions'].includes(tab.id)).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleTabClick(tab.id);
                        setIsMenuOpen(false);
                      }}
                      className="flex flex-col items-center gap-2.5 group"
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-300 relative",
                        activeTab === tab.id
                          ? "bg-accent text-white shadow-lg shadow-accent/30 scale-105"
                          : "bg-bg-main text-text-secondary group-hover:bg-accent/10 group-hover:text-accent"
                      )}>
                        <tab.icon className="w-6 h-6" />
                        {tab.id === 'transactions' && transactionBadge && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card-bg shadow-sm">
                            {transactionBadge > 9 ? '9+' : transactionBadge}
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        "text-[11px] font-bold text-center tracking-wide",
                        activeTab === tab.id ? "text-accent" : "text-text-secondary"
                      )}>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Nav Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-30 transition-all duration-500">

          {/* Background Nav with True Transparent Cutout Mask */}
          <div
            className="absolute inset-0 backdrop-blur-2xl bg-card-bg shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-border-ui/50"
            style={{
              WebkitMaskImage: 'radial-gradient(circle at 50% -10px, transparent 36px, black 37px)',
              maskImage: 'radial-gradient(circle at 50% -10px, transparent 36px, black 37px)'
            }}
          />

          {/* Interactive Content Container */}
          <div className="relative px-6 py-2 flex justify-between items-center h-[65px] pb-safe">
            {/* Left Side Tabs */}
            <div className="flex justify-around flex-1 pr-6">
              <button onClick={() => handleTabClick('home')} className="flex flex-col items-center justify-center gap-1 h-full w-14 group">
                <Home className={cn("w-5 h-5 transition-colors", activeTab === 'home' ? "text-accent" : "text-text-secondary group-hover:text-text-primary")} />
                <span className={cn("text-[9px] font-bold transition-colors", activeTab === 'home' ? "text-accent" : "text-text-secondary group-hover:text-text-primary")}>Beranda</span>
              </button>
              <button onClick={() => handleTabClick('transactions')} className="flex flex-col items-center justify-center gap-1 h-full w-14 group">
                <div className="relative">
                  <List className={cn("w-5 h-5 transition-colors", activeTab === 'transactions' ? "text-accent" : "text-text-secondary group-hover:text-text-primary")} />
                  {transactionBadge && (
                    <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-danger text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-card-bg">
                      {transactionBadge > 9 ? '9+' : transactionBadge}
                    </span>
                  )}
                </div>
                <span className={cn("text-[9px] font-bold transition-colors", activeTab === 'transactions' ? "text-accent" : "text-text-secondary group-hover:text-text-primary")}>Riwayat</span>
              </button>
            </div>

            {/* Center: Add (+) Floating Button */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6">
              <button
                onClick={() => {
                  onAddClick();
                  setIsMenuOpen(false);
                }}
                className="w-[56px] h-[56px] rounded-full bg-linear-to-tr from-accent to-secondary flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 shadow-[0_8px_20px_rgba(5,150,105,0.4)]"
              >
                <Plus className="w-7 h-7" />
              </button>
            </div>

            {/* Right Side Tabs */}
            <div className="flex justify-around flex-1 pl-6">
              <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center justify-center gap-1 h-full w-14 group">
                <LayoutGrid className={cn("w-5 h-5 transition-colors", isMenuOpen ? "text-accent" : "text-text-secondary group-hover:text-text-primary")} />
                <span className={cn("text-[9px] font-bold transition-colors", isMenuOpen ? "text-accent" : "text-text-secondary group-hover:text-text-primary")}>Menu</span>
              </button>
              <button onClick={() => handleTabClick('profile')} className="flex flex-col items-center justify-center gap-1 h-full w-14 group">
                {user.photoUrl ? (
                  <div className={cn(
                    "w-5 h-5 rounded-full overflow-hidden border transition-all",
                    activeTab === 'profile' ? "border-accent ring-1 ring-accent/30" : "border-text-secondary"
                  )}>
                    <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <User className={cn("w-5 h-5 transition-colors", activeTab === 'profile' ? "text-accent" : "text-text-secondary group-hover:text-text-primary")} />
                )}
                <span className={cn("text-[9px] font-bold transition-colors", activeTab === 'profile' ? "text-accent" : "text-text-secondary group-hover:text-text-primary")}>Profil</span>
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

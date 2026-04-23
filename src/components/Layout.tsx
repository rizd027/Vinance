import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, List, PieChart, Target, User, LogOut, Moon, Sun, Plus, RefreshCw, TrendingUp, Wallet, StickyNote, Flag, Cloud, CloudOff, LayoutGrid, X } from 'lucide-react';

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
}

export default function Layout({ 
  children, activeTab, setActiveTab, user, isDark, toggleTheme, transactions, budgets, syncing, syncStatus, onAddClick, onLogout 
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

  const allTabs = [...mainTabs, { id: 'profile', icon: User, label: 'Profil' }];

  // Live stats for sidebar badges
  const sidebarStats = useMemo(() => {
    const todayTxCount = (transactions || []).filter(t => isToday(new Date(t.date))).length;
    return { todayTxCount };
  }, [transactions]);

  const transactionBadge = sidebarStats.todayTxCount > 0 ? sidebarStats.todayTxCount : null;

  const activeTabDef = allTabs.find(t => t.id === activeTab);

  return (
    <div className="h-screen bg-bg-main flex overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 bg-sidebar-bg flex-col sticky top-0 h-screen border-r border-sidebar-border transition-colors overflow-hidden z-40">
        <div className="px-6 py-6 border-b border-sidebar-border/30 flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3.5 flex-1 hover:bg-sidebar-text-primary/5 transition-colors text-left group rounded-xl -ml-2 pl-2 py-1"
          >
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2 bg-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-11 h-11 bg-white dark:bg-slate-50 rounded-2xl flex items-center justify-center shadow-xl border border-slate-200 dark:border-accent/10 p-1.5 transition-transform group-hover:scale-105 duration-300">
                <img src="/Logo-Vinance.png" alt="Vinance Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-sidebar-text-primary leading-none" style={{ textShadow: isDark ? '0 0 20px rgba(5, 150, 105, 0.4)' : 'none' }}>
                Vinance
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-[1.5px] w-3 bg-gradient-to-r from-accent to-secondary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary/80">Ecosystem</span>
              </div>
            </div>
          </button>
          <div className="flex-shrink-0">
            {syncing ? (
              <RefreshCw className="w-3.5 h-3.5 text-accent animate-spin" />
            ) : (
              <div className={cn("w-2 h-2 rounded-full shadow-sm", isOnline ? 'bg-success shadow-success/40' : 'bg-danger shadow-danger/40')} />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-8">
          {/* User Section */}
          <div
            className={cn("p-3.5 rounded-[22px] bg-bg-main/40 border border-border-ui/40 flex items-center gap-3.5 cursor-pointer hover:border-accent/40 hover:bg-bg-main/60 transition-all group shadow-sm", isPending && "opacity-70")}
            onClick={() => handleTabClick('profile')}

          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-secondary p-[1.5px] flex-shrink-0 shadow-md transition-transform group-hover:rotate-3">
              <div className="w-full h-full bg-sidebar-bg rounded-[14.5px] flex items-center justify-center overflow-hidden">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-black text-accent">{user.name[0].toUpperCase()}</span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-sidebar-text-primary truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-text-secondary/70 truncate font-medium">{user.email}</p>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="space-y-1.5">
            <p className="px-4 mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary/40">Menu Utama</p>
            <nav className="space-y-1">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-4 py-3 text-sm transition-all rounded-[18px] font-bold relative group",
                    activeTab === tab.id
                      ? "text-accent bg-accent/10 shadow-inner"
                      : "text-sidebar-text-secondary hover:text-sidebar-text-primary hover:bg-bg-main/40"
                  )}
                >
                  <tab.icon className={cn("w-4.5 h-4.5 transition-all duration-300", activeTab === tab.id ? "scale-110" : "group-hover:translate-x-0.5")} />
                  <span className="flex-1 text-left tracking-wide">{tab.label}</span>
                  {tab.id === 'transactions' && transactionBadge && (
                    <span className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-accent to-secondary text-white text-[10px] font-bold rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
                      {transactionBadge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-sidebar-border/30 space-y-1">
          <button
            onClick={() => handleTabClick('profile')}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-3 text-sm transition-all rounded-[18px] font-medium group",
              activeTab === 'profile'
                ? "text-accent bg-accent/10 shadow-inner"
                : "text-sidebar-text-secondary hover:text-sidebar-text-primary hover:bg-bg-main/40"
            )}
          >
            <User className={cn("w-4.5 h-4.5 transition-all", activeTab === 'profile' && "scale-110")} />
            <span className="tracking-wide">Profil Saya</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-medium text-danger/80 hover:text-danger hover:bg-danger/5 transition-all rounded-[18px] group"
          >
            <div className="w-4.5 h-4.5 flex items-center justify-center transition-transform group-hover:-translate-x-0.5">
              <LogOut className="w-4.5 h-4.5" />
            </div>
            <span className="tracking-wide">Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto pb-24 lg:pb-0 min-w-0 no-scrollbar sm:custom-scrollbar relative transition-colors">
        {/* Background Doodle Pattern - Fixed behind all content */}
        <div 
          className="fixed inset-0 opacity-[0.08] dark:opacity-[0.15] pointer-events-none z-0 transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url('/finance-doodle.png')`,
            backgroundSize: '460px',
            backgroundRepeat: 'repeat',
            filter: isDark ? 'invert(1) brightness(1.8) contrast(1.1)' : 'none'
          }}
        />
        <header className="bg-card-bg px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-border-ui/50 transition-all">
          <div>
            <div className="flex items-center gap-3">
              {/* Mobile: Logo & App Name */}
              {/* Mobile: Logo & App Name */}
              <button 
                onClick={() => setActiveTab('home')}
                className="flex lg:hidden items-center gap-2.5 active:scale-95 transition-transform"
              >
                <div className="w-8 h-8 bg-white dark:bg-slate-50 rounded-[10px] flex items-center justify-center shadow-sm border border-slate-200 dark:border-accent/10 p-1">
                  <img src="/Logo-Vinance.png" alt="Vinance Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-black text-text-primary tracking-tight leading-none" style={{ textShadow: isDark ? '0 0 15px rgba(5, 150, 105, 0.3)' : 'none' }}>
                  Vinance
                </span>
              </button>

              {/* Desktop: Active Tab Title */}
              {activeTabDef && (
                <div className="hidden lg:flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-accent/10 flex items-center justify-center border border-accent/20">
                    {React.createElement(activeTabDef.icon, { className: "w-4.5 h-4.5 text-accent" })}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-base font-black text-text-primary leading-none tracking-tight">{activeTabDef.label}</h1>
                    <p className="text-[9px] text-text-secondary font-bold mt-1 uppercase tracking-widest opacity-80">
                      {activeTabDef.id === 'home' ? 'Ringkasan Keuangan' : 
                       activeTabDef.id === 'transactions' ? 'Catatan Harian' : 
                       activeTabDef.id === 'budgets' ? 'Manajemen Anggaran' :
                       activeTabDef.id === 'reports' ? 'Analisis Arus Kas' :
                       activeTabDef.id === 'goals' ? 'Target Tabungan' :
                       activeTabDef.id === 'notes' ? 'Memo Finansial' : 'Pengaturan Akun'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <motion.div 
              layout
              initial={false}
              animate={{ 
                width: syncing ? 'auto' : (isMobile ? '28px' : '32px'),
                paddingLeft: syncing ? '12px' : '0px',
                paddingRight: syncing ? '12px' : '0px'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                "flex items-center justify-center h-7 sm:h-8 rounded-[10px] border shadow-sm transition-all overflow-hidden whitespace-nowrap",
                syncing 
                  ? "bg-accent/10 border-accent/30 text-accent shadow-[0_0_15px_rgba(5,150,105,0.1)]"
                  : isOnline 
                    ? "bg-success/5 border-success/20 text-success shadow-[0_0_10px_rgba(16,185,129,0.05)]" 
                    : "bg-danger/5 border-danger/20 text-danger shadow-[0_0_10px_rgba(244,63,94,0.05)]"
              )}
              title={syncing ? syncStatus : (isOnline ? 'Online & Terhubung' : 'Offline')}
            >
              <div className="flex items-center gap-2">
                {syncing ? (
                   <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
                ) : isOnline ? (
                   <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                ) : (
                   <CloudOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                )}
                
                <AnimatePresence mode="wait">
                  {syncing && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest"
                    >
                      {syncStatus || 'Sinkronisasi'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-bg-main hover:bg-border-ui rounded-[10px] text-text-secondary hover:text-text-primary transition-all border border-border-ui/50 shadow-sm"
              title={isDark ? "Mode Terang" : "Mode Gelap"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>

        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </main>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <div
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
              />
              <div
                className="fixed bottom-[110px] left-6 right-6 z-30 lg:hidden"
              >
                <div className="bg-card-bg/95 backdrop-blur-xl border border-border-ui rounded-[32px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-text-primary">Menu Utama</h3>
                    <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-bg-main flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border-ui transition-all">
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                    {mainTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          handleTabClick(tab.id);
                          setIsMenuOpen(false);
                        }}
                        className="flex flex-col items-center gap-2.5 group"
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-300 relative",
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
            </>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Nav Bar */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[280px] z-30">
          
          {/* Background Nav with True Transparent Cutout Mask */}
          <div 
            className={cn(
              "absolute inset-0 backdrop-blur-2xl rounded-full transition-all border border-white/20 bg-gradient-to-tr from-accent to-secondary opacity-95",
              isDark 
                ? "shadow-[0_8px_32px_rgba(5,150,105,0.2)]"
                : "shadow-[0_12px_40px_-10px_rgba(6,78,59,0.4)]"
            )}
            style={{
              WebkitMaskImage: 'radial-gradient(circle at 50% 10px, transparent 31px, black 32px)',
              maskImage: 'radial-gradient(circle at 50% 10px, transparent 31px, black 32px)'
            }}
          />

          {/* Interactive Content Container */}
          <div className="relative px-8 py-2.5 flex justify-between items-center pointer-events-none">
            {/* Left: Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "pointer-events-auto flex flex-col items-center justify-center transition-all relative w-10 h-10 rounded-full",
                isMenuOpen ? "text-white bg-white/20 shadow-inner" : "text-white hover:bg-white/10"
              )}
            >
              <LayoutGrid className={cn("w-5 h-5 transition-transform drop-shadow-sm", isMenuOpen && "scale-110")} />
            </button>

            {/* Right: Profile */}
            <button
              onClick={() => {
                handleTabClick('profile');
                setIsMenuOpen(false);
              }}
              className={cn(
                "pointer-events-auto flex flex-col items-center justify-center transition-all relative w-10 h-10 rounded-full",
                activeTab === 'profile' ? "text-white bg-white/20 shadow-inner" : "text-white hover:bg-white/10"
              )}
            >
              <User className={cn("w-5 h-5 transition-transform drop-shadow-sm", activeTab === 'profile' && "scale-110")} />
            </button>
          </div>

          {/* Center: Add (+) Floating Button */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 pointer-events-auto">
            <button
              onClick={() => {
                onAddClick();
                setIsMenuOpen(false);
              }}
              className={cn(
                "w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-accent to-secondary flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95",
                isDark ? "shadow-[0_8px_20px_rgba(5,150,105,0.4)]" : "shadow-[0_8px_20px_rgba(5,150,105,0.5)]"
              )}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  ArrowRight, Plus, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight,
  Utensils, Car, ShoppingBag, Receipt, Gamepad2, HeartPulse,
  ShieldCheck, AlertCircle, Zap, Sparkles, Target, Plane, Smartphone, GraduationCap, Camera, Globe, Briefcase, Coffee, Home,
  Send, CreditCard, PiggyBank, History, Bell, Sun, Moon
} from 'lucide-react';
import { Transaction, Budget, Goal } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { isToday, isYesterday, isThisMonth, isThisWeek, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const CATEGORY_ICONS: Record<string, any> = {
  'Makanan': Utensils,
  'Transportasi': Car,
  'Belanja': ShoppingBag,
  'Tagihan': Receipt,
  'Hiburan': Gamepad2,
  'Kesehatan': HeartPulse,
  'Lainnya': Wallet,
};

const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  const entry = Object.entries(CATEGORY_ICONS).find(([key]) => key.toLowerCase() === normalized);
  return entry ? entry[1] : Wallet;
};

const GOAL_ICONS: Record<string, any> = {
  'home': Home,
  'car': Car,
  'plane': Plane,
  'phone': Smartphone,
  'edu': GraduationCap,
  'health': HeartPulse,
  'shop': ShoppingBag,
  'game': Gamepad2,
  'camera': Camera,
  'world': Globe,
  'work': Briefcase,
  'coffee': Coffee,
};

const getGoalIcon = (id: string) => {
  return GOAL_ICONS[id] || Target;
};

const CATEGORY_COLORS = [
  'bg-violet-500/15 text-violet-500',
  'bg-sky-500/15 text-sky-500',
  'bg-amber-500/15 text-amber-500',
  'bg-emerald-500/15 text-emerald-500',
  'bg-rose-500/15 text-rose-500',
  'bg-fuchsia-500/15 text-fuchsia-500',
];

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals?: Goal[];
  onAddClick: () => void;
  onViewAll: () => void;
  onNavigateToBudget?: () => void;
  onNavigateToGoals?: () => void;
  onNavigateToProfile?: () => void;
  isDark?: boolean;
  toggleTheme?: () => void;
  userName?: string;
  userPhotoUrl?: string;
  notificationCount?: number;
  onBellClick?: () => void;
}

type FilterPeriod = 'today' | 'week' | 'month' | 'all';
type TxFilter = 'all' | 'Income' | 'Expense';

export default function Dashboard({ transactions, budgets, goals = [], onAddClick, onViewAll, onNavigateToBudget, onNavigateToGoals, onNavigateToProfile, isDark, toggleTheme, userName, userPhotoUrl, notificationCount = 0, onBellClick }: DashboardProps) {
  const [period, setPeriod] = useState<FilterPeriod>('month');
  const [txFilter, setTxFilter] = useState<TxFilter>('all');

  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    if (period === 'today') return isToday(d);
    if (period === 'week') return isThisWeek(d, { weekStartsOn: 1 });
    if (period === 'month') return isThisMonth(d);
    return true;
  });

  const income = filtered.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = filtered.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const allTimeIncome = transactions.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
  const allTimeExpense = transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
  const allTimeBalance = allTimeIncome - allTimeExpense;

  const totalBudget = budgets.reduce((acc, b) => acc + Number(b.limit), 0);
  const budgetUsage = totalBudget > 0 ? Math.min((expense / totalBudget) * 100, 100) : 0;
  const savingsRate = income > 0 ? Math.max(((income - expense) / income) * 100, 0) : 0;

  const recentTransactions = [...transactions]
    .filter(t => isThisMonth(new Date(t.date)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const filteredRecent = txFilter === 'all'
    ? recentTransactions
    : recentTransactions.filter(t => t.type === txFilter);

  // Group transactions by date label
  const groupedRecent = filteredRecent.reduce((groups, t) => {
    const d = new Date(t.date);
    let label: string;
    if (isToday(d)) label = 'HARI INI';
    else if (isYesterday(d)) label = 'KEMARIN';
    else label = format(d, 'd MMM yyyy', { locale: localeId }).toUpperCase();
    if (!groups[label]) groups[label] = [];
    groups[label].push(t);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const expenseByCategory = filtered
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topExpenses = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const periodLabels: Record<FilterPeriod, string> = {
    today: 'Hari Ini',
    week: 'Pekan Ini',
    month: 'Bulan Ini',
    all: 'Semua',
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  // Donut chart (simple SVG)
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const expenseDash = circ * Math.min(budgetUsage / 100, 1);

  return (
    <div className="space-y-5 pb-4">

      {/* ══════════════════════════════════════════
           MOBILE VIEW (lg:hidden)
          ══════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Navy Blue header block */}
        <div 
          className="relative pt-6 pb-11 px-6 text-white overflow-hidden rounded-b-[40px] shadow-lg" 
          style={{ background: 'linear-gradient(180deg, #1A2C5B 0%, #15254e 100%)' }}
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-blue-400/10 rounded-full blur-2xl" />
          
          <div className="relative">
            {/* Top row: Page Title + Avatar/Bell/Theme Toggle */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[28px] font-black text-white tracking-tight leading-none">
                  Beranda
                </p>
                <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mt-2">
                  Ecosystem
                </p>
              </div>
              <div className="flex items-center gap-3">
                {toggleTheme && (
                  <button
                    onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 hover:bg-white/20 transition-all text-white/95"
                    title={isDark ? "Mode Terang" : "Mode Gelap"}
                  >
                    {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                  </button>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onBellClick) onBellClick();
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 transition-transform relative"
                >
                  <Bell className="w-4.5 h-4.5 text-white/90" />
                  {notificationCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-[#1A2C5B] animate-pulse" />
                  )}
                </button>
                <button 
                  onClick={onNavigateToProfile}
                  className="w-10 h-10 rounded-full active:scale-90 hover:scale-105 transition-all focus:outline-none"
                  title="Ke Halaman Profil"
                >
                  {userPhotoUrl ? (
                    <img src={userPhotoUrl} alt="profil" className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-md" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{userName ? userName[0].toUpperCase() : 'U'}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Income & Expense Beautified Row */}
            <div className="grid grid-cols-2 gap-3.5 my-4">
              {/* Pemasukan (Income) Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-3 flex items-center gap-3 shadow-inner shadow-white/5">
                {/* Decorative glow bubble */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-emerald-400/25 rounded-full blur-xl" />
                
                <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/25">
                  <ArrowUpRight className="w-4.5 h-4.5 text-emerald-400 stroke-[2.5]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1.5">Pemasukan</span>
                  <span className="text-sm font-black text-emerald-400 truncate currency-font">
                    {formatCurrency(allTimeIncome)}
                  </span>
                </div>
              </div>

              {/* Pengeluaran (Expense) Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-rose-500/15 to-rose-600/5 border border-rose-500/20 rounded-2xl p-3 flex items-center gap-3 shadow-inner shadow-white/5">
                {/* Decorative glow bubble */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-rose-400/25 rounded-full blur-xl" />
                
                <div className="w-8.5 h-8.5 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-400/25">
                  <ArrowDownRight className="w-4.5 h-4.5 text-rose-400 stroke-[2.5]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1.5">Pengeluaran</span>
                  <span className="text-sm font-black text-rose-400 truncate currency-font">
                    {formatCurrency(allTimeExpense)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex justify-around mt-4">
              <button onClick={onAddClick} className="flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Send className="w-5 h-5 text-[#1A2C5B]" />
                </div>
                <span className="text-[10px] font-bold text-white/90 tracking-wide">Catat</span>
              </button>
              <button onClick={onViewAll} className="flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <History className="w-5 h-5 text-[#1A2C5B]" />
                </div>
                <span className="text-[10px] font-bold text-white/90 tracking-wide">Riwayat</span>
              </button>
              <button onClick={onNavigateToBudget} className="flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5 text-[#1A2C5B]" />
                </div>
                <span className="text-[10px] font-bold text-white/90 tracking-wide">Anggaran</span>
              </button>
              <button onClick={onNavigateToGoals} className="flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <PiggyBank className="w-5 h-5 text-[#1A2C5B]" />
                </div>
                <span className="text-[10px] font-bold text-white/90 tracking-wide">Goals</span>
              </button>
            </div>
          </div>
        </div>

        {/* White Curved content sheet overlay */}
        <div className="bg-bg-main rounded-t-[36px] mt-[-28px] relative z-10 px-5 pt-7 pb-20 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] space-y-6">
          
          {/* Recent Transactions area */}
          <div>
            {/* Header + Filter Tabs */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-[#1A2C5B] dark:text-text-primary tracking-tight">Recent Transactions</h3>
              <button
                onClick={onViewAll}
                className="text-[12px] font-bold text-[#2D4DB5] dark:text-blue-400 hover:underline"
              >
                See all
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2.5 mb-4 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setTxFilter('all')}
                className={cn(
                  "flex items-center justify-center px-4.5 py-1.5 rounded-full text-xs font-bold transition-all border",
                  txFilter === 'all'
                    ? "bg-[#1A2C5B] dark:bg-text-primary text-white dark:text-bg-main border-[#1A2C5B] dark:border-text-primary shadow-xs"
                    : "bg-card-bg text-text-secondary border-border-ui/50 dark:border-border-ui/30"
                )}
              >
                All
              </button>
              <button
                onClick={() => setTxFilter('Income')}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                  txFilter === 'Income'
                    ? "bg-card-bg text-[#10b981] border-[#10b981]/30 shadow-xs"
                    : "bg-card-bg text-text-secondary border-border-ui/50 dark:border-border-ui/30"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                Income
              </button>
              <button
                onClick={() => setTxFilter('Expense')}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                  txFilter === 'Expense'
                    ? "bg-card-bg text-[#f43f5e] border-[#f43f5e]/30 shadow-xs"
                    : "bg-card-bg text-text-secondary border-border-ui/50 dark:border-border-ui/30"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
                Expense
              </button>
            </div>

            {/* Transactions grouped list */}
            <div className="space-y-4">
              {filteredRecent.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 bg-card-bg rounded-3xl border border-border-ui/50 dark:border-border-ui/30">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-text-primary">Mulai Catat Keuangan</p>
                    <p className="text-xs text-text-secondary mt-0.5">Belum ada transaksi tercatat</p>
                  </div>
                </div>
              ) : (
                Object.entries(groupedRecent).map(([dateLabel, txList]) => (
                  <div key={dateLabel} className="space-y-2.5">
                    {/* Date label */}
                    <p className="text-[10px] font-bold text-text-secondary/70 tracking-widest uppercase px-1">{dateLabel}</p>
                    
                    {/* White Card Container for transactions */}
                    <div className="bg-card-bg rounded-3xl p-3 shadow-[0_4px_16px_rgba(0,0,0,0.015)] border border-border-ui/50 dark:border-border-ui/30 divide-y divide-border-ui/40 dark:divide-border-ui/20">
                      {txList.map((t) => {
                        const Icon = getCategoryIcon(t.category);
                        return (
                          <div
                            key={t.id}
                            className="flex items-center gap-3 px-2 py-3.5 hover:bg-bg-main/50 rounded-2xl transition-colors"
                          >
                            {/* Circle Icon */}
                            <div className="w-11 h-11 rounded-2xl bg-bg-main dark:bg-white/5 border border-border-ui/30 dark:border-border-ui/20 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-[#1A2C5B] dark:text-accent" />
                            </div>
                            {/* Description */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-[#1A2C5B] dark:text-text-primary truncate">{t.category}</p>
                              <p className="text-[11px] text-text-secondary truncate mt-0.5">{t.note || '—'}</p>
                            </div>
                            {/* Amount & Date */}
                            <div className="text-right flex-shrink-0">
                              <p className={cn(
                                "text-[13px] font-black currency-font",
                                t.type === 'Income' ? "text-success" : "text-[#1A2C5B] dark:text-text-primary"
                              )}>
                                {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                              </p>
                              <p className="text-[9.5px] text-text-secondary mt-0.5">
                                {format(new Date(t.date), 'MMM d', { locale: localeId })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
           DESKTOP VIEW (hidden lg:block)
          ══════════════════════════════════════════ */}
      <div className="hidden lg:block space-y-5">
        {/* Desktop Greeting */}
        <div>
          <p className="text-xs font-semibold text-text-secondary">{greeting()},</p>
          <h2 className="text-2xl font-black text-text-primary tracking-tight leading-tight mt-0.5">
            {userName ? userName.split(' ')[0] : 'Pengguna'} 👋
          </h2>
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">
            ini ringkasan keuanganmu
          </p>
          <div className="h-0.5 w-10 bg-gradient-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
        </div>

        {/* Top Overview & Stats Grid */}
        <div className="grid grid-cols-4 gap-5">
          {/* Left Side: Balance Card */}
          <div className="col-span-2">
            <div className="relative rounded-lg overflow-hidden shadow-xl shadow-accent/20 h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-accent via-emerald-500 to-secondary" />
              <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
              <div className="relative p-6 pb-5 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">Total Saldo</p>
                    <p className="text-3xl font-black text-white tracking-tight mt-1 currency-font leading-none">{formatCurrency(allTimeBalance)}</p>
                  </div>
                  <button onClick={onAddClick} className="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-white text-xs font-bold hover:bg-white/30 active:scale-95 transition-all">
                    <Plus className="w-3.5 h-3.5" />Catat
                  </button>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"><ArrowUpRight className="w-3 h-3 text-white" /></div>
                      <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Pemasukan</p>
                    </div>
                    <p className="text-sm font-black text-white currency-font">{formatCurrency(income)}</p>
                  </div>
                  <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"><ArrowDownRight className="w-3 h-3 text-white" /></div>
                      <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Pengeluaran</p>
                    </div>
                    <p className="text-sm font-black text-white currency-font">{formatCurrency(expense)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Financial Health & Donut Chart */}
          <div className="col-span-2 grid grid-cols-3 gap-4 content-start">
            <div className="col-span-3 flex gap-2 overflow-x-auto no-scrollbar">
              {(['today', 'week', 'month', 'all'] as FilterPeriod[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "flex-1 min-w-[70px] px-2 py-2 rounded-lg text-[11px] font-bold transition-all border text-center",
                    period === p
                      ? "bg-accent text-white border-accent shadow-lg shadow-accent/25"
                      : "bg-card-bg text-text-secondary border-border-ui hover:border-accent/40 hover:text-text-primary"
                  )}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>

            {/* Savings Rate */}
            <div className="col-span-2 bg-card-bg rounded-lg p-4 border border-border-ui shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Kesehatan Finansial</p>
                <span className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold border",
                  savingsRate >= 20 ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                )}>
                  {savingsRate >= 20 ? <ShieldCheck className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                  {savingsRate >= 20 ? 'Sehat' : 'Waspada'}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-semibold text-text-primary flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-accent" /> Tabungan
                    </span>
                    <span className={cn("text-xs font-black", savingsRate >= 20 ? "text-success" : "text-warning")}>
                      {savingsRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", savingsRate >= 20 ? "bg-gradient-to-r from-success to-emerald-400" : "bg-gradient-to-r from-warning to-amber-400")}
                      style={{ width: `${Math.min(savingsRate, 100)}%` }}
                    />
                  </div>
                </div>
                {totalBudget > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-semibold text-text-primary flex items-center gap-1">
                        <Zap className="w-3 h-3 text-warning" /> Anggaran
                      </span>
                      <span className={cn("text-xs font-black", budgetUsage <= 90 ? "text-text-primary" : "text-danger")}>
                        {budgetUsage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", budgetUsage <= 90 ? "bg-gradient-to-r from-accent to-secondary" : "bg-gradient-to-r from-warning to-danger")}
                        style={{ width: `${budgetUsage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Donut Chart */}
            <div
              onClick={onNavigateToBudget}
              className={cn(
                "col-span-1 bg-card-bg rounded-lg p-3 border shadow-sm flex flex-col items-center relative cursor-pointer hover:bg-accent/5 active:scale-95 transition-all group justify-between",
                totalBudget === 0 ? "border-dashed border-accent/40" : "border-border-ui hover:border-accent/40"
              )}
            >
              <div className="w-full mb-1">
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest text-center">Anggaran</p>
              </div>
              <div className="relative flex items-center justify-center">
                <svg width="76" height="76" viewBox="0 0 88 88" className="-rotate-90">
                  <circle cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-bg-main" />
                  <circle
                    cx="44" cy="44" r={radius} fill="none"
                    stroke="url(#dashGrad2)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${expenseDash} ${circ}`}
                  />
                  <defs>
                    <linearGradient id="dashGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-text-primary mt-0.5">{totalBudget > 0 ? `${budgetUsage.toFixed(0)}%` : '—'}</span>
                </div>
              </div>
              <div className="mt-1">
                <p className="text-[8px] font-bold text-text-secondary uppercase tracking-wider text-center leading-tight whitespace-pre-line group-hover:text-accent transition-colors">
                  {'Ketuk\nUntuk Atur'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-text-primary">Target & Tujuan</h3>
              <button onClick={onNavigateToGoals} className="text-[10px] font-bold text-accent flex items-center gap-0.5 hover:gap-1.5 transition-all">
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {goals.slice(0, 3).map((goal) => {
                const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                const GoalIcon = getGoalIcon(goal.icon);
                const gColor = (goal.color && goal.color.startsWith('#')) ? goal.color : '#059669';
                return (
                  <div key={goal.id} onClick={onNavigateToGoals} className="bg-card-bg rounded-lg border border-border-ui shadow-sm flex-shrink-0 w-[240px] p-3 flex flex-col gap-2 cursor-pointer hover:shadow-md hover:border-accent/30 transition-all group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm" style={{ backgroundColor: gColor }}>
                        <GoalIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-text-primary truncate">{goal.name}</p>
                        <p className="text-[9px] text-text-secondary mt-0.5">Target: {formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-bold" style={{ color: gColor }}>{pct > 0 && pct < 1 ? '< 1' : Math.round(pct)}%</span>
                        <span className="text-[9px] text-text-secondary font-medium">{formatCurrency(goal.savedAmount)}</span>
                      </div>
                      <div className="h-1.5 bg-bg-main rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ backgroundColor: gColor, width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Expenses */}
        {topExpenses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-text-primary">Top Pengeluaran</h3>
              <button onClick={onViewAll} className="text-[10px] font-bold text-accent flex items-center gap-0.5 hover:gap-1.5 transition-all">
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {topExpenses.map(([category, amount], i) => {
                const Icon = getCategoryIcon(category);
                const colorClass = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                const totalExp = expense > 0 ? (amount / expense) * 100 : 0;
                return (
                  <div key={category} className="bg-card-bg rounded-lg p-4 border border-border-ui shadow-sm hover:shadow-md hover:border-accent/20 transition-all group">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", colorClass)}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate mb-0.5">{category}</p>
                    <p className="text-sm font-black text-text-primary currency-font">{formatCurrency(amount)}</p>
                    <div className="mt-2 h-1 bg-bg-main rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-accent to-secondary" style={{ width: `${totalExp}%` }} />
                    </div>
                    <p className="text-[9px] font-medium text-text-secondary mt-1">{totalExp.toFixed(0)}% dari total</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-text-primary">Transaksi Terakhir</h3>
            <button onClick={onViewAll} className="text-[10px] font-bold text-accent flex items-center gap-0.5 hover:gap-1.5 transition-all">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            <button onClick={() => setTxFilter('all')} className={cn('tx-filter-pill', txFilter === 'all' && 'active')}>Semua</button>
            <button onClick={() => setTxFilter('Income')} className={cn('tx-filter-pill', txFilter === 'Income' && 'active')}>
              <span className="tx-dot" style={{ backgroundColor: txFilter === 'Income' ? '#fff' : '#10b981' }} />Pemasukan
            </button>
            <button onClick={() => setTxFilter('Expense')} className={cn('tx-filter-pill', txFilter === 'Expense' && 'active')}>
              <span className="tx-dot" style={{ backgroundColor: txFilter === 'Expense' ? '#fff' : '#f43f5e' }} />Pengeluaran
            </button>
          </div>

          <div className="bg-card-bg rounded-xl border border-border-ui shadow-sm overflow-hidden">
            {filteredRecent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center"><Sparkles className="w-6 h-6 text-accent" /></div>
                <p className="text-sm font-bold text-text-primary">Mulai Catat Keuangan</p>
              </div>
            ) : (
              <div>
                {Object.entries(groupedRecent).map(([dateLabel, txList]) => (
                  <div key={dateLabel}>
                    <p className="tx-date-group px-4">{dateLabel}</p>
                    <div className="divide-y divide-border-ui/40">
                      {txList.map((t) => {
                        const Icon = getCategoryIcon(t.category);
                        return (
                          <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg-main/50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-[#f0f3fa] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                              <Icon className={cn("w-4.5 h-4.5", t.type === 'Income' ? "text-success" : "text-[#2D4DB5] dark:text-blue-400")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-text-primary truncate">{t.category}</p>
                              <p className="text-[11px] text-text-secondary truncate">{t.note || '—'}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={cn("text-[13px] font-black currency-font", t.type === 'Income' ? "text-success" : "text-danger")}>
                                {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                              </p>
                              <p className="text-[10px] text-text-secondary mt-0.5">{new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <button onClick={onAddClick} className="flex w-full bg-gradient-to-r from-accent to-secondary text-white py-3.5 rounded-lg text-xs font-black shadow-lg shadow-accent/20 items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all">
          <Plus className="w-4 h-4" /> TAMBAH TRANSAKSI
        </button>
      </div>

    </div>
  );
}

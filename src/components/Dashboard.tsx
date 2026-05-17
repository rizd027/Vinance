import React, { useState } from 'react';
import {
  ArrowRight, Plus, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight,
  Utensils, Car, ShoppingBag, Receipt, Gamepad2, HeartPulse,
  ShieldCheck, AlertCircle, Zap, Sparkles, Target, Plane, Smartphone, GraduationCap, Camera, Globe, Briefcase, Coffee, Home
} from 'lucide-react';
import { Transaction, Budget, Goal } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { isToday, isThisMonth, isThisWeek } from 'date-fns';

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
  userName?: string;
}

type FilterPeriod = 'today' | 'week' | 'month' | 'all';

export default function Dashboard({ transactions, budgets, goals = [], onAddClick, onViewAll, onNavigateToBudget, onNavigateToGoals, userName }: DashboardProps) {
  const [period, setPeriod] = useState<FilterPeriod>('month');

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

  const totalBudget = budgets.reduce((acc, b) => acc + Number(b.limit), 0);
  const budgetUsage = totalBudget > 0 ? Math.min((expense / totalBudget) * 100, 100) : 0;
  const savingsRate = income > 0 ? Math.max(((income - expense) / income) * 100, 0) : 0;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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

      {/* ── Greeting Header (Mobile only) ── */}
      <div className="lg:hidden">
        <p className="text-xs font-semibold text-text-secondary">{greeting()},</p>
        <h2 className="text-2xl font-black text-text-primary tracking-tight leading-tight mt-0.5">
          {userName ? userName.split(' ')[0] : 'Pengguna'} 👋
        </h2>
        <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">
          ini ringkasan keuanganmu
        </p>
        <div className="h-0.5 w-10 bg-gradient-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
      </div>

      {/* ── Top Overview & Stats Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Side: Balance Card & Period Filters */}
        <div className="lg:col-span-2">
          {/* ── Hero Balance Card ── */}
          <div
            className="relative rounded-lg overflow-hidden shadow-xl shadow-accent/20 h-full"
          >
            {/* Gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent via-emerald-500 to-secondary" />
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full" />

            <div className="relative p-6 pb-5 h-full flex flex-col justify-between">
              {/* Top row */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">Total Saldo</p>
                  <p className="text-3xl font-black text-white tracking-tight mt-1 currency-font leading-none">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <button
                  onClick={onAddClick}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-white text-xs font-bold hover:bg-white/30 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Catat
                </button>
              </div>

              {/* Income / Expense row */}
              <div className="flex gap-4">
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Pemasukan</p>
                  </div>
                  <p className="text-sm font-black text-white currency-font">{formatCurrency(income)}</p>
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowDownRight className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Pengeluaran</p>
                  </div>
                  <p className="text-sm font-black text-white currency-font">{formatCurrency(expense)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Financial Health & Donut Chart */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-3 lg:grid-cols-3 lg:gap-4 lg:content-start">
          {/* ── Period Filter Pills ── */}
          <div className="col-span-3 flex gap-2 overflow-x-auto no-scrollbar lg:col-span-3">
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

          {/* Savings Rate (Kesehatan Finansial) */}
          <div className="col-span-2 bg-card-bg rounded-lg p-4 border border-border-ui shadow-sm flex flex-col justify-between lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Kesehatan Finansial</p>
              <span className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold border",
                savingsRate >= 20
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-warning/10 text-warning border-warning/20"
              )}>
                {savingsRate >= 20 ? <ShieldCheck className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                {savingsRate >= 20 ? 'Sehat' : 'Waspada'}
              </span>
            </div>
            <div className="space-y-3">
              {/* Savings bar */}
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
              {/* Budget usage bar */}
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

          {/* Donut chart (Anggaran) */}
          <div
            onClick={onNavigateToBudget}
            className={cn(
              "col-span-1 bg-card-bg rounded-lg p-3 border shadow-sm flex flex-col items-center relative cursor-pointer hover:bg-accent/5 active:scale-95 transition-all group justify-between lg:col-span-1",
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
                  stroke="url(#dashGrad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${expenseDash} ${circ}`}
                />
                <defs>
                  <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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
              {totalBudget === 0 ? (
                <p className="text-[8px] font-bold text-accent uppercase tracking-wider text-center leading-tight group-hover:underline whitespace-pre-line">
                  {'Ketuk\nUntuk Atur'}
                </p>
              ) : (
                <p className="text-[8px] font-bold text-text-secondary uppercase tracking-wider text-center leading-tight whitespace-pre-line group-hover:text-accent transition-colors">
                  {'Ketuk\nUntuk Atur'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Target Tabungan (Goals) ── */}
      {goals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-text-primary">Target & Tujuan</h3>
            <button
              onClick={onNavigateToGoals}
              className="text-[10px] font-bold text-accent flex items-center gap-0.5 hover:gap-1.5 transition-all"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {goals.slice(0, 3).map((goal, i) => {
              const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
              const GoalIcon = getGoalIcon(goal.icon);
              const gColor = (goal.color && goal.color.startsWith('#')) ? goal.color : '#059669';

              return (
                <div
                  key={goal.id}
                  onClick={onNavigateToGoals}
                  className="bg-card-bg rounded-lg border border-border-ui shadow-sm flex-shrink-0 w-[240px] p-3 flex flex-col gap-2 cursor-pointer hover:shadow-md hover:border-accent/30 transition-all group"
                >
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
                      <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: gColor, width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Top Pengeluaran (ref: Popular Plan) ── */}
      {topExpenses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-text-primary">Top Pengeluaran</h3>
            <button
              onClick={onViewAll}
              className="text-[10px] font-bold text-accent flex items-center gap-0.5 hover:gap-1.5 transition-all"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {topExpenses.map(([category, amount], i) => {
              const Icon = getCategoryIcon(category);
              const colorClass = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              const totalExp = expense > 0 ? (amount / expense) * 100 : 0;
              return (
                <div
                  key={category}
                  className="bg-card-bg rounded-lg p-4 border border-border-ui shadow-sm hover:shadow-md hover:border-accent/20 transition-all group"
                >
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", colorClass)}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate mb-0.5">{category}</p>
                  <p className="text-sm font-black text-text-primary currency-font">{formatCurrency(amount)}</p>
                  <div className="mt-2 h-1 bg-bg-main rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-secondary"
                      style={{ width: `${totalExp}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-medium text-text-secondary mt-1">{totalExp.toFixed(0)}% dari total</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Transaksi Terakhir ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-text-primary">Transaksi Terakhir</h3>
          <button
            onClick={onViewAll}
            className="text-[10px] font-bold text-accent flex items-center gap-0.5 hover:gap-1.5 transition-all"
          >
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-card-bg rounded-lg border border-border-ui shadow-sm overflow-hidden">
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-text-primary">Mulai Catat Keuangan</p>
                <p className="text-xs text-text-secondary mt-0.5">Belum ada transaksi tercatat</p>
              </div>
              <button
                onClick={onAddClick}
                className="px-5 py-2 bg-gradient-to-r from-accent to-secondary text-white text-xs font-bold rounded-lg shadow-lg shadow-accent/20 active:scale-95 transition-all"
              >
                + Catat Sekarang
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border-ui/50">
              {recentTransactions.map((t, i) => {
                const Icon = getCategoryIcon(t.category);
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-bg-main/40 transition-colors"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      t.type === 'Income' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    )}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">{t.category}</p>
                      <p className="text-[10px] text-text-secondary truncate">{t.note || new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        "text-sm font-black currency-font",
                        t.type === 'Income' ? "text-success" : "text-danger"
                      )}>
                        {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-[9px] text-text-secondary">
                        {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── CTA Desktop ── */}
      <button
        onClick={onAddClick}
        className="hidden lg:flex w-full bg-gradient-to-r from-accent to-secondary text-white py-3.5 rounded-lg text-xs font-black shadow-lg shadow-accent/20 items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
      >
        <Plus className="w-4 h-4" /> TAMBAH TRANSAKSI
      </button>

    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  AreaChart, Area, CartesianGrid, LabelList
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, ArrowDownRight, ShieldCheck, Award, BarChart2,
  Utensils, Car, ShoppingBag, Receipt, Gamepad2, HeartPulse,
  Download, X
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';

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

import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, isWithinInterval, format
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { exportReportPDF, exportReportExcel, exportReportCSV, exportReportDocx } from '../lib/exportUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, FileText } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
}

type Period = 'week' | 'month' | 'year';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card-bg/95 backdrop-blur-md border border-border-ui rounded-2xl shadow-2xl p-4 text-xs min-w-[140px] animate-in fade-in zoom-in duration-200">
        <p className="font-black text-text-primary mb-3 pb-2 border-b border-border-ui/50 uppercase tracking-wider">{label}</p>
        <div className="space-y-2.5">
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: p.color }} />
                <span className="text-text-secondary font-bold">{p.name}</span>
              </div>
              <span className="font-black text-text-primary currency-font">{formatCurrency(p.value)}</span>
            </div>
          ))}
          {payload.length > 1 && (
            <div className="pt-2 border-t border-border-ui/50 flex justify-between items-center">
              <span className="text-[10px] font-black text-text-secondary uppercase">Selisih</span>
              <span className={cn("font-black", (payload[0].value - payload[1].value) >= 0 ? "text-success" : "text-danger")}>
                {formatCurrency(Math.abs(payload[0].value - payload[1].value))}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function Reports({ transactions }: ReportsProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;

    if (period === 'week') {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else if (period === 'month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      start = startOfYear(now);
      end = endOfYear(now);
    }

    return transactions.filter(t =>
      isWithinInterval(new Date(t.date), { start, end })
    );
  }, [transactions, period]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = filteredTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;

    return { income, expense, balance, savingsRate };
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'Expense')
      .reduce((acc: any[], t) => {
        const existing = acc.find(item => item.name === t.category);
        if (existing) {
          existing.value += Number(t.amount);
        } else {
          acc.push({ name: t.category, value: Number(t.amount) });
        }
        return acc;
      }, [])
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const trendData = useMemo(() => {
    const groups: Record<string, { name: string, income: number, expense: number, net: number }> = {};

    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const label = period === 'year'
        ? format(date, 'MMM', { locale: localeId })
        : format(date, 'dd MMM', { locale: localeId });

      if (!groups[label]) {
        groups[label] = { name: label, income: 0, expense: 0, net: 0 };
      }
      if (t.type === 'Income') groups[label].income += Number(t.amount);
      else groups[label].expense += Number(t.amount);
      groups[label].net = groups[label].income - groups[label].expense;
    });

    return Object.values(groups);
  }, [filteredTransactions, period]);

  const topExpenses = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'Expense')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5);
  }, [filteredTransactions]);

  const handleExport = (fmt: 'pdf' | 'xlsx' | 'csv' | 'docx') => {
    const periodLabel = period === 'week' ? 'Mingguan' : period === 'month' ? 'Bulanan' : 'Tahunan';
    switch (fmt) {
      case 'pdf': exportReportPDF(filteredTransactions, periodLabel, stats); break;
      case 'xlsx': exportReportExcel(filteredTransactions, periodLabel, stats); break;
      case 'csv': exportReportCSV(filteredTransactions, periodLabel, stats); break;
      case 'docx': exportReportDocx(filteredTransactions, periodLabel, stats); break;
    }
  };

  const healthScore = useMemo(() => {
    if (stats.income === 0) return { score: 0, label: 'Tidak ada data', color: 'text-text-secondary' };
    if (stats.savingsRate >= 30) return { score: 100, label: 'Sangat Sehat', color: 'text-success' };
    if (stats.savingsRate >= 20) return { score: 75, label: 'Sehat', color: 'text-success' };
    if (stats.savingsRate >= 10) return { score: 50, label: 'Cukup', color: 'text-warning' };
    return { score: 25, label: 'Perlu Perhatian', color: 'text-danger' };
  }, [stats]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1 lg:hidden">
          <h2 className="text-2xl font-black text-text-primary tracking-tight leading-none">Analisis Laporan</h2>
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Ringkasan & Kesehatan Finansial</p>
          <div className="h-1 w-12 bg-linear-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
        </div>

        <div className="flex items-center gap-2 bg-card-bg/50 p-1 rounded-xl border border-border-ui w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                period === p
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-main"
              )}
            >
              {p === 'week' ? 'Mingguan' : p === 'month' ? 'Bulanan' : 'Tahunan'}
            </button>
          ))}
          <div className="w-px h-6 bg-border-ui mx-1 hidden sm:block" />
          <div className="flex items-center px-1.5">
            <button 
              onClick={() => setShowExportModal(true)} 
              className="flex items-center gap-1.5 px-3 py-2 text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors font-bold text-xs" 
              title="Export Laporan"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Saldo Netto" value={stats.balance} icon={<Wallet className="w-4 h-4" />} trend={stats.balance >= 0 ? 'up' : 'down'} color={stats.balance >= 0 ? 'text-text-primary' : 'text-danger'} />
        <StatCard label="Total Pemasukan" value={stats.income} icon={<ArrowUpRight className="w-4 h-4" />} color="text-success" />
        <StatCard label="Total Pengeluaran" value={stats.expense} icon={<ArrowDownRight className="w-4 h-4" />} color="text-danger" />
        <StatCard label="Savings Rate" value={`${stats.savingsRate.toFixed(1)}%`} icon={<TrendingUp className="w-4 h-4" />} color="text-accent" isRaw />
      </div>

      {/* Area Chart - Cash Flow Trend (Full Width) */}
      <div className="bg-card-bg p-6 rounded-3xl border border-border-ui shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Tren Arus Kas
          </h3>
          <div className="flex items-center gap-4 text-[10px] font-bold">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <span className="w-3 h-3 rounded-full bg-[#10b981] inline-block shadow-sm" /> Pemasukan (Hijau)
            </span>
            <span className="flex items-center gap-1.5 text-text-secondary">
              <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block shadow-sm" /> Pengeluaran (Merah)
            </span>
          </div>
        </div>
        {trendData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <BarChart2 className="w-10 h-10 opacity-20" />
            <p className="text-xs font-medium">Tidak ada data untuk periode ini</p>
          </div>
        ) : (
          <div className="h-72 w-full" tabIndex={-1} style={{ outline: 'none' }} onClick={(e) => (e.currentTarget as HTMLElement).blur()}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={1}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <filter id="shadow" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                    <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
                    <feMerge>
                      <feMergeNode in="offsetBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.08)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  tickFormatter={(v) => {
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}jt`;
                    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
                    return String(v);
                  }}
                  width={48}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} name="Pemasukan" dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} isAnimationActive={!isMobile} animationDuration={1000} animationEasing="ease-in-out">
                  <LabelList dataKey="income" position="top" offset={15} content={(props: any) => {
                    const { x, y, value } = props;
                    if (value === 0) return null;
                    const label = value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}jt` : value >= 1_000 ? `${(value / 1_000).toFixed(0)}rb` : value;
                    return (
                      <g>
                        <rect x={x - 15} y={y - 22} width={30} height={14} rx={4} fill="#10b981" fillOpacity={0.1} />
                        <text x={x} y={y - 12} fill="#10b981" fontSize={8} fontWeight="900" textAnchor="middle">{label}</text>
                      </g>
                    );
                  }} />
                </Area>
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} name="Pengeluaran" dot={{ fill: '#ef4444', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} isAnimationActive={!isMobile} animationDuration={1000} animationEasing="ease-in-out">
                  <LabelList dataKey="expense" position="top" offset={15} content={(props: any) => {
                    const { x, y, value } = props;
                    if (value === 0) return null;
                    const label = value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}jt` : value >= 1_000 ? `${(value / 1_000).toFixed(0)}rb` : value;
                    return (
                      <g>
                        <rect x={x - 15} y={y - 22} width={30} height={14} rx={4} fill="#ef4444" fillOpacity={0.1} />
                        <text x={x} y={y - 12} fill="#ef4444" fontSize={8} fontWeight="900" textAnchor="middle">{label}</text>
                      </g>
                    );
                  }} />
                </Area>

              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2-column: Bar Chart + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Income vs Expense */}
        <div className="bg-card-bg p-6 rounded-3xl border border-border-ui shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-accent" />
              Pemasukan vs Pengeluaran
            </h3>
            <div className="flex items-center gap-3 text-[9px] font-bold">
              <span className="flex items-center gap-1 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shadow-sm" /> Pemasukan (Hijau)
              </span>
              <span className="flex items-center gap-1 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block shadow-sm" /> Pengeluaran (Merah)
              </span>
            </div>
          </div>
          {trendData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-text-secondary text-xs">Tidak ada data</div>
          ) : (
            <div className="h-52 w-full" tabIndex={-1} style={{ outline: 'none' }} onClick={(e) => (e.currentTarget as HTMLElement).blur()}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={1}>
                <BarChart data={trendData} barGap={4} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={6} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                    tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${(v / 1_000).toFixed(0)}rb`}
                    width={42}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} isAnimationActive={!isMobile} animationDuration={1000}>
                    <LabelList dataKey="income" position="top" content={(props: any) => {
                      const { x, y, width, value } = props;
                      if (value === 0) return null;
                      const label = value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}jt` : value >= 1_000 ? `${(value / 1_000).toFixed(0)}rb` : value;
                      return (
                        <g>
                          <rect x={x + width / 2 - 15} y={y - 20} width={30} height={14} rx={4} fill="#10b981" fillOpacity={0.1} />
                          <text x={x + width / 2} y={y - 10} fill="#10b981" fontSize={8} fontWeight="900" textAnchor="middle">{label}</text>
                        </g>
                      );
                    }} />
                  </Bar>
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={32} isAnimationActive={!isMobile} animationDuration={1000}>
                    <LabelList dataKey="expense" position="top" content={(props: any) => {
                      const { x, y, width, value } = props;
                      if (value === 0) return null;
                      const label = value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}jt` : value >= 1_000 ? `${(value / 1_000).toFixed(0)}rb` : value;
                      return (
                        <g>
                          <rect x={x + width / 2 - 15} y={y - 20} width={30} height={14} rx={4} fill="#ef4444" fillOpacity={0.1} />
                          <text x={x + width / 2} y={y - 10} fill="#ef4444" fontSize={8} fontWeight="900" textAnchor="middle">{label}</text>
                        </g>
                      );
                    }} />
                  </Bar>

                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Donut Chart - Category Breakdown */}
        <div className="bg-card-bg p-6 rounded-3xl border border-border-ui shadow-sm transition-colors flex flex-col">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-secondary" />
            Alokasi Biaya
          </h3>
          {categoryData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-text-secondary">Tidak ada pengeluaran</div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              <div className="h-44 w-full" tabIndex={-1} style={{ outline: 'none' }} onClick={(e) => (e.currentTarget as HTMLElement).blur()}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={1}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={4} dataKey="value" isAnimationActive={!isMobile} animationDuration={500} animationEasing="ease-out">

                      {categoryData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-2"
              >
                {categoryData.map((item: any, index: number) => {
                  const pct = ((item.value / stats.expense) * 100).toFixed(0);
                  return (
                    <motion.div
                      key={item.name}
                      variants={{ hidden: isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}

                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[10px] font-bold text-text-primary truncate">{item.name}</span>
                          <span className="text-[10px] font-bold text-text-secondary ml-2">{pct}%</span>
                        </div>
                        <div className="h-1 bg-bg-main rounded-full overflow-hidden">
                          <motion.div
                            initial={isMobile ? false : { width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}

                            className="h-full rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowDownRight className="w-2.5 h-2.5 text-danger shrink-0" />
                        <span className="text-[10px] font-bold text-text-primary shrink-0 currency-font">{formatCurrency(item.value)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Financial Health + Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Health Card */}
        <div className="bg-card-bg p-6 rounded-3xl border border-border-ui shadow-sm transition-colors">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success" />
            Kesehatan Finansial
          </h3>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-text-primary">Skor Kesehatan</p>
              <span className={cn("text-2xl font-bold", healthScore.color)}>{healthScore.label}</span>
            </div>
            <div className="h-3 bg-bg-main rounded-full overflow-hidden border border-border-ui/50">
              <motion.div
                initial={isMobile ? false : { width: 0 }}
                animate={{ width: `${healthScore.score}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}

                className={cn("h-full rounded-full", healthScore.score >= 75 ? 'bg-success' : healthScore.score >= 50 ? 'bg-warning' : 'bg-danger')}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: 'Aturan 50%\nKebutuhan', pct: stats.income > 0 ? Math.round((stats.expense / stats.income) * 100) : 0, target: 50, color: '#6366f1' },
                { label: 'Target 20%\nTabungan', pct: Math.round(Math.max(stats.savingsRate, 0)), target: 20, color: '#10b981' },
                { label: 'Rasio\nUtilisasi', pct: stats.income > 0 ? Math.round((stats.expense / stats.income) * 100) : 0, target: 80, color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 bg-bg-main/50 rounded-2xl">
                  <p className="text-lg font-bold currency-font" style={{ color: item.color }}>{item.pct}%</p>
                  <p className="text-[9px] text-text-secondary whitespace-pre-line leading-tight mt-1 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Expenses Card */}
        <div className="bg-card-bg p-6 rounded-3xl border border-border-ui shadow-sm transition-colors">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-warning" />
            Top Pengeluaran
          </h3>
          {topExpenses.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-xs text-text-secondary">Tidak ada pengeluaran</div>
          ) : (
            <div className="space-y-3">
              {topExpenses.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={isMobile ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isMobile ? 0 : i * 0.05 }}

                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger shrink-0">
                    {React.createElement(getCategoryIcon(t.category), { className: "w-5 h-5" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-text-primary uppercase tracking-wide truncate">{t.category}</p>
                    <p className="text-[9px] text-text-secondary truncate">{format(new Date(t.date), 'dd MMM yyyy, HH:mm', { locale: localeId })}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-danger shrink-0" />
                    <p className="text-xs font-bold text-danger shrink-0 currency-font">-{formatCurrency(t.amount)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setShowExportModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <div
              className="relative w-full max-w-sm bg-card-bg rounded-[24px] shadow-2xl border border-border-ui overflow-hidden z-10"
            >
              <div className="flex items-center justify-between p-5 border-b border-border-ui/50">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Download className="w-4 h-4 text-accent" />
                  Export Laporan
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => { handleExport('xlsx'); setShowExportModal(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border-ui hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Excel</span>
                </button>
                <button
                  onClick={() => { handleExport('csv'); setShowExportModal(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border-ui hover:border-slate-500 hover:bg-slate-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">CSV</span>
                </button>
                <button
                  onClick={() => { handleExport('pdf'); setShowExportModal(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border-ui hover:border-rose-500 hover:bg-rose-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">PDF</span>
                </button>
                <button
                  onClick={() => { handleExport('docx'); setShowExportModal(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border-ui hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Word</span>
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function StatCard({ label, value, icon, trend, color, isRaw }: { label: string, value: any, icon: React.ReactNode, trend?: 'up' | 'down', color: string, isRaw?: boolean }) {
  return (
    <div className="bg-card-bg p-4 rounded-2xl border border-border-ui shadow-sm hover:border-accent/40 transition-all group flex flex-col justify-between min-h-[90px]">
      <div className="flex justify-between items-start mb-3">
        <div className="p-1.5 bg-bg-main rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-widest",
            trend === 'up' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}>
            {trend === 'up' ? 'NAIK' : 'TURUN'}
          </div>
        )}
      </div>
      <div>
        <p className="text-[9px] text-text-secondary font-medium uppercase tracking-widest mb-0.5">{label}</p>
        <p className={cn("text-base font-bold truncate tracking-tight currency-font", color)}>
          {isRaw ? value : formatCurrency(value)}
        </p>
      </div>
    </div>
  );
}

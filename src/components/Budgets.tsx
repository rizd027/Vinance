import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Edit2, AlertCircle, TrendingUp, Wallet, CheckCircle2,
  Plus, Trash2, PieChart as PieIcon, ArrowRight, ShieldCheck,
  Info, X, ChevronRight, LayoutGrid, ArrowDownRight,
  Utensils, Car, ShoppingBag, Receipt, Gamepad2, HeartPulse
} from 'lucide-react';
import { Budget, Transaction } from '../types';
import { formatCurrency, cn, formatInputNumber, parseInputNumber } from '../lib/utils';

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
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend
} from 'recharts';

interface BudgetsProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdate: (category: string, limit: number) => void;
  onDelete: (category: string) => void;
}

export default function Budgets({ budgets, transactions, onUpdate, onDelete }: BudgetsProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (showAddModal || showInfoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddModal, showInfoModal]);

  const defaultCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'];

  // Combine default and existing budget categories
  const allCategories = useMemo(() => {
    const existingCats = budgets.map(b => b.category);
    return Array.from(new Set([...defaultCategories, ...existingCats]));
  }, [budgets]);

  const getSpent = (category: string) => {
    return transactions
      .filter(t => t.type === 'Expense' && t.category === category)
      .reduce((acc, t) => acc + Number(t.amount), 0);
  };

  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'Income')
      .reduce((acc, t) => acc + Number(t.amount), 0);
  }, [transactions]);

  const totalBudget = budgets.reduce((acc, b) => acc + Number(b.limit), 0);
  const totalSpent = allCategories.reduce((acc, cat) => acc + getSpent(cat), 0);
  const totalRemaining = totalBudget - totalSpent;
  const unallocated = totalIncome - totalBudget;

  const chartData = useMemo(() => {
    return budgets
      .filter(b => Number(b.limit) > 0)
      .map(b => ({ name: b.category, value: Number(b.limit) }));
  }, [budgets]);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

  const rule503020 = useMemo(() => {
    const categories50 = ['Makanan', 'Tagihan', 'Transportasi', 'Kesehatan'];
    const categories30 = ['Belanja', 'Hiburan', 'Lainnya'];

    const needsSpent = allCategories.filter(cat => categories50.some(c => c.toLowerCase() === cat.toLowerCase())).reduce((sum, cat) => sum + getSpent(cat), 0);
    const wantsSpent = allCategories.filter(cat => categories30.some(c => c.toLowerCase() === cat.toLowerCase())).reduce((sum, cat) => sum + getSpent(cat), 0);

    const totalSpentActual = allCategories.reduce((sum, cat) => sum + getSpent(cat), 0);
    const actualSavings = totalIncome - totalSpentActual;

    const needsPct = totalIncome > 0 ? (needsSpent / totalIncome) * 100 : 0;
    const wantsPct = totalIncome > 0 ? (wantsSpent / totalIncome) * 100 : 0;
    const savingsPct = totalIncome > 0 ? (Math.max(0, actualSavings) / totalIncome) * 100 : 0;

    return { needsPct, wantsPct, savingsPct };
  }, [totalIncome, allCategories, transactions]);

  const alertStatus = useMemo(() => {
    const critical = budgets.filter(b => {
      const spent = getSpent(b.category);
      return spent > Number(b.limit) && Number(b.limit) > 0;
    });
    const warning = budgets.filter(b => {
      const spent = getSpent(b.category);
      const limit = Number(b.limit);
      return spent > limit * 0.85 && spent <= limit && limit > 0;
    });
    const safe = budgets.filter(b => {
      const spent = getSpent(b.category);
      const limit = Number(b.limit);
      return spent < limit * 0.5 && limit > 0;
    });
    return { critical, warning, safe };
  }, [budgets, transactions]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1 lg:hidden">
          <h2 className="text-2xl font-black text-text-primary tracking-tight leading-none">Manajemen Anggaran</h2>
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Perencanaan & Batas Pengeluaran</p>
          <div className="h-1 w-12 bg-linear-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-accent to-secondary text-white rounded-xl text-xs font-bold shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Budget Card */}
          <div className="bg-card-bg rounded-3xl border border-border-ui p-8 shadow-sm transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-10" />
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-medium text-text-secondary uppercase tracking-widest mb-1">Total Budget</p>
                  <p className="text-3xl font-bold text-text-primary tracking-tight currency-font">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] text-text-secondary font-medium uppercase mb-1">Terpakai</p>
                    <div className="flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-danger" />
                      <p className="text-sm font-bold text-danger currency-font">{formatCurrency(totalSpent)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-secondary font-medium uppercase mb-1">Belum Dialokasi</p>
                    <p className={cn("text-sm font-bold currency-font", unallocated >= 0 ? "text-success" : "text-danger")}>
                      {formatCurrency(Math.max(0, unallocated))}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-48 space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-medium text-text-secondary uppercase">Sisa Realita</span>
                  <span className={cn("text-base font-bold currency-font", totalRemaining < 0 ? "text-danger" : "text-success")}>
                    {formatCurrency(totalRemaining)}
                  </span>
                </div>
                <div className="h-3 bg-bg-main rounded-full overflow-hidden transition-colors border border-border-ui/50">
                  {totalBudget > 0 ? (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                      className={cn(
                        "h-full transition-all duration-1000",
                        totalSpent > totalBudget ? "bg-danger" : "bg-linear-to-r from-accent to-secondary"
                      )}
                    />
                  ) : (
                    <div className="h-full w-full bg-text-secondary/10" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 50/30/20 Health Check */}
          <div className="bg-bg-main p-6 rounded-3xl border border-border-ui space-y-4 shadow-sm relative z-10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-success" />
                Analisis Kesehatan 50/30/20
              </h4>
              <Info className="w-4 h-4 text-text-secondary" />
            </div>
            <div className="grid grid-cols-3 gap-2 h-16 items-end">
              <RuleBar label="Kebutuhan" pct={rule503020.needsPct} target={50} color="bg-accent" />
              <RuleBar label="Keinginan" pct={rule503020.wantsPct} target={30} color="bg-secondary" />
              <RuleBar label="Tabungan" pct={rule503020.savingsPct} target={20} color="bg-success" />
            </div>
          </div>
        </div>

        {/* Allocation Pie Chart */}
        <div className="lg:col-span-2 bg-card-bg p-6 rounded-3xl border border-border-ui flex flex-col items-center">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 self-start flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-accent" />
            Distribusi Anggaran
          </h3>
          <div className="relative h-64 w-full mt-4 min-h-0 flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={1}>
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-3 text-text-secondary/40">
                <PieIcon className="w-16 h-16 stroke-[1]" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Belum ada data distribusi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget Reminders Section */}
      {(alertStatus.critical.length > 0 || alertStatus.warning.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertStatus.critical.length > 0 && (
            <div className="bg-danger/5 border border-danger/20 p-4 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 bg-danger/10 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-danger uppercase tracking-tight mb-1">Anggaran Terlampaui!</p>
                <div className="flex flex-wrap gap-1.5">
                  {alertStatus.critical.map(b => (
                    <span key={b.category} className="text-[10px] font-bold text-text-primary bg-danger/10 px-2 py-0.5 rounded-md border border-danger/20">
                      {b.category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {alertStatus.warning.length > 0 && (
            <div className="bg-warning/5 border border-warning/20 p-4 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-warning uppercase tracking-tight mb-1">Mendekati Batas (85%+)</p>
                <div className="flex flex-wrap gap-1.5">
                  {alertStatus.warning.map(b => (
                    <span key={b.category} className="text-[10px] font-bold text-text-primary bg-warning/10 px-2 py-0.5 rounded-md border border-warning/20">
                      {b.category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence>
          {allCategories.map((cat) => {
            const budget = budgets.find(b => b.category === cat);
            const spent = getSpent(cat);
            const limit = budget ? Number(budget.limit) : 0;
            const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const isOver = spent > limit && limit > 0;
            const isWarning = spent > limit * 0.85 && spent <= limit && limit > 0;
            const remaining = limit - spent;

            return (
              <motion.div
                key={cat}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "bg-card-bg p-3 rounded-2xl border shadow-xs group transition-all relative overflow-hidden",
                  isOver ? "border-danger/40 ring-1 ring-danger/10" :
                    isWarning ? "border-warning/40 ring-1 ring-warning/10" :
                      "border-border-ui hover:border-accent/30"
                )}
              >
                {isWarning && !isOver && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-warning text-[8px] font-black text-white rounded-bl-lg uppercase tracking-tighter z-10">
                    Batas!
                  </div>
                )}
                {isOver && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-danger text-[8px] font-black text-white rounded-bl-lg uppercase tracking-tighter z-10">
                    Over!
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isOver ? "bg-danger/10 text-danger" : "bg-bg-main text-accent group-hover:bg-accent/10"
                  )}>
                    {React.createElement(getCategoryIcon(cat), { className: "w-4 h-4" })}
                  </div>
                  <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditing(cat); setNewLimit(limit > 0 ? formatInputNumber(limit.toString()) : ''); }}
                      className="p-2 sm:p-1.5 bg-bg-main hover:bg-accent/10 rounded-lg text-text-secondary hover:text-accent transition-colors"
                      title="Edit Limit"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus kategori anggaran "${cat}"?`)) {
                          onDelete(cat);
                        }
                      }}
                      className="p-2 sm:p-1.5 bg-bg-main hover:bg-danger/10 rounded-lg text-text-secondary hover:text-danger transition-colors"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>

                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-text-primary tracking-tight leading-none text-sm mb-0.5">{cat}</h4>
                    <p className="text-[9px] font-medium text-text-secondary uppercase tracking-tight">
                      LIMIT: <span className="currency-font">{limit > 0 ? formatCurrency(limit) : 'BELUM DIATUR'}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-medium">
                      <span className="text-text-secondary tracking-widest">PENGGUNAAN</span>
                      <span className={cn("font-bold currency-font", isOver ? "text-danger" : "text-text-primary")}>{Math.round(percent)}%</span>
                    </div>
                    <div className="h-1.5 bg-bg-main rounded-full overflow-hidden transition-colors">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={cn("h-full", isOver ? "bg-danger" : percent > 85 ? "bg-warning" : "bg-accent")}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-border-ui/50">
                    <p className={cn("text-[9px] font-medium tracking-widest text-text-secondary uppercase", isOver ? "text-danger" : "")}>
                      {isOver ? 'TERLAMPAUI' : 'SISA'}
                    </p>
                    <div className={cn("text-xs font-bold currency-font flex items-center gap-1", isOver ? "text-danger" : "text-text-primary")}>
                      {!isOver && remaining > 0 && <ArrowDownRight className="w-3 h-3 text-text-secondary opacity-40" />}
                      {isOver && <ArrowDownRight className="w-3 h-3 text-danger" />}
                      {formatCurrency(Math.abs(remaining))}
                    </div>
                  </div>
                </div>

                {editing === cat && (
                  <div className="mt-4 p-3 bg-bg-main rounded-2xl space-y-3">
                    <input
                      type="text"
                      value={newLimit}
                      onChange={(e) => setNewLimit(formatInputNumber(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-border-ui bg-card-bg text-text-primary outline-none text-xs focus:ring-2 focus:ring-accent"
                      placeholder="Limit Anggaran"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onUpdate(cat, Number(parseInputNumber(newLimit))); setEditing(null); }}
                        className="flex-1 bg-linear-to-r from-accent to-secondary text-white py-2 rounded-xl text-[10px] font-bold shadow-lg shadow-accent/20"
                      >
                        SIMPAN
                      </button>
                      <button onClick={() => setEditing(null)} className="flex-1 bg-danger/10 text-danger py-2 rounded-xl text-[10px] font-bold">
                        BATAL
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex p-4 overflow-y-auto">
            <div 
              onClick={() => setShowAddModal(false)} 
              className={cn(
                "fixed inset-0 bg-slate-900/60",
                !isMobile && "backdrop-blur-sm"
              )} 
            />
            <div 
              className="relative bg-card-bg p-8 rounded-3xl border border-border-ui shadow-2xl w-full max-w-sm mt-4 mx-auto mb-auto z-10"
            >
              <h3 className="text-lg font-bold text-text-primary mb-6">Tambah Kategori Anggaran</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Nama Kategori (Contoh: Liburan)"
                  className="w-full px-4 py-3 rounded-xl border border-border-ui bg-bg-main text-text-primary outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (customCategory) {
                      setEditing(customCategory);
                      setNewLimit('');
                      setShowAddModal(false);
                      setCustomCategory('');
                    }
                  }}
                  className="w-full py-4 bg-linear-to-r from-accent to-secondary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-accent/20 transition-all"
                >
                  Lanjut ke Limit
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Tips Section */}
      <div className="bg-card-bg p-6 rounded-3xl border border-border-ui flex flex-col md:flex-row gap-6 items-center shadow-sm relative z-10">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-bold text-text-primary">Gunakan Aturan 50/30/20</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Sistem kami mendeteksi alokasi Anda secara otomatis. Pastikan Kebutuhan Pokok Anda (Needs) tidak melebihi 50% dari total penghasilan untuk menjaga keseimbangan finansial.
          </p>
        </div>
        <button onClick={() => setShowInfoModal(true)} className="px-6 py-3 bg-card-bg border border-border-ui rounded-xl text-xs font-bold text-text-primary hover:bg-bg-main transition-colors flex items-center gap-2">
          Pelajari Lebih Lanjut <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 50/30/20 Info Modal */}
      {showInfoModal && (
          <div className="fixed inset-0 z-50 flex p-4 items-center justify-center">
            <div 
              onClick={() => setShowInfoModal(false)} 
              className={cn(
                "fixed inset-0",
                isMobile ? "bg-black/80" : "bg-slate-900/60 backdrop-blur-sm"
              )} 
            />
            <div 
              className="relative bg-card-bg rounded-3xl border border-border-ui shadow-2xl w-full max-w-4xl mx-auto z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <InfoModalContent onClose={() => setShowInfoModal(false)} />
            </div>
          </div>
        )}
    </div>
  );
}

function InfoModalContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="flex justify-between items-center p-6 border-b border-border-ui/50 shrink-0">
        <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-success" />
          Aturan 50/30/20
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-xl text-text-secondary transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-base text-text-primary font-bold mb-2">Kelola Keuangan dengan Lebih Pintar</p>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              Aturan 50/30/20 adalah metode penganggaran yang membagi penghasilan setelah pajak Anda menjadi tiga kategori utama untuk mencapai keseimbangan antara gaya hidup dan masa depan.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-accent/5 border border-accent/20 rounded-3xl hover:bg-accent/10 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-sm">
                  <LayoutGrid className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-accent text-lg">50% Needs</h4>
                  <p className="text-[10px] text-accent/60 font-black uppercase tracking-widest mt-0.5">Kebutuhan Pokok</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Makan, tagihan (listrik/air), transportasi, dan kesehatan. Pengeluaran wajib untuk kelangsungan hidup.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-secondary/5 border border-secondary/20 rounded-3xl hover:bg-secondary/10 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shadow-sm">
                  <Wallet className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-lg">30% Wants</h4>
                  <p className="text-[10px] text-secondary/60 font-black uppercase tracking-widest mt-0.5">Keinginan & Gaya Hidup</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Liburan, hiburan, belanja hobi, dan makan di luar. Fleksibel dan bisa dikurangi jika diperlukan.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-success/5 border border-success/20 rounded-3xl hover:bg-success/10 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center text-success shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-success text-lg">20% Savings</h4>
                  <p className="text-[10px] text-success/60 font-black uppercase tracking-widest mt-0.5">Tabungan & Hutang</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Dana darurat, investasi pensiun, atau melunasi cicilan. Modal untuk kemandirian finansial Anda.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-bg-main p-6 rounded-3xl border border-border-ui shadow-xs relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-text-primary font-bold">Bagaimana Sistem Kami Menghitung?</p>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Aplikasi <span className="text-accent font-bold">Cuan</span> secara otomatis mengelompokkan kategori Anda: <br/>
                  - <span className="font-bold">Needs:</span> Makanan, Tagihan, Transportasi, & Kesehatan <br/>
                  - <span className="font-bold">Wants:</span> Belanja, Hiburan, & Lainnya <br/>
                  - <span className="font-bold">Savings:</span> Dihitung dari Sisa Penghasilan (Total Pendapatan - Total Anggaran)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 border-t border-border-ui/50 shrink-0 bg-card-bg">
        <button
          onClick={onClose}
          className="w-full px-5 py-4 bg-linear-to-r from-accent to-secondary text-white rounded-2xl font-black hover:shadow-xl hover:shadow-accent/20 transition-all text-sm shadow-lg tracking-wide"
        >
          SAYA MENGERTI
        </button>
      </div>
    </>
  );
}

function RuleBar({ label, pct, target, color }: { label: string, pct: number, target: number, color: string }) {
  const isSavings = label === 'Tabungan';
  const isHealthy = isSavings ? pct >= target : pct <= target;
  
  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex justify-between items-end text-[8px] font-bold uppercase tracking-tight text-text-secondary">
        <span>{label}</span>
        <span className={cn(
          "px-1.5 py-0.5 rounded-md",
          isHealthy ? "text-success bg-success/10" : "text-danger bg-danger/10"
        )}>
          {Math.round(pct)}% {isHealthy ? 'AMAN' : 'OVER'}
        </span>
      </div>
      <div className="h-full relative bg-bg-main rounded-lg overflow-hidden border border-border-ui/50">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${Math.min(pct, 100)}%` }}
          className={cn(
            "absolute bottom-0 w-full transition-all duration-1000", 
            isHealthy ? color : "bg-danger"
          )}
        />
        <div className="absolute w-full border-t border-dashed border-text-secondary/40" style={{ bottom: `${target}%` }} />
      </div>
      <div className="text-center text-[7px] font-bold text-text-secondary">Target {target}%</div>
    </div>
  );
}

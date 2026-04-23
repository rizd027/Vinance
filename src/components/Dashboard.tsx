import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Plus, Wallet, TrendingUp, Sun, ArrowUpRight, ArrowDownRight, Activity,
  Utensils, Car, ShoppingBag, Receipt, Gamepad2, HeartPulse,
  ShieldCheck, AlertCircle, PieChart, Zap
} from 'lucide-react';
import { Transaction, Budget } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { isToday } from 'date-fns';

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


interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  onAddClick: () => void;
  onViewAll: () => void;
}

export default function Dashboard({ transactions, budgets, onAddClick, onViewAll }: DashboardProps) {
  const income = transactions
    .filter(t => t.type === 'Income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = income - expense;
  const totalBudget = budgets.reduce((acc, b) => acc + Number(b.limit), 0);
  const remainingBudget = totalBudget - expense;
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
  const expenseRatio = income > 0 ? (expense / income) * 100 : 0;
  const budgetUsage = totalBudget > 0 ? (expense / totalBudget) * 100 : 0;

  // Today's summary
  const todayTransactions = transactions.filter(t => isToday(new Date(t.date)));
  const todayExpense = todayTransactions.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
  const todayIncome = todayTransactions.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
  const todayTopCategory = todayTransactions
    .filter(t => t.type === 'Expense')
    .reduce((acc: Record<string, number>, t) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount); return acc; }, {});
  const todayTopCat = Object.entries(todayTopCategory).sort(([, a], [, b]) => b - a)[0];

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const stats = [
    { label: 'Saldo', value: balance, color: 'text-text-primary' },
    { label: 'Masuk', value: income, color: 'text-success', prefix: '+' },
    { label: 'Keluar', value: expense, color: 'text-danger', prefix: '-' },
    { 
      label: 'Sisa Anggaran', 
      value: remainingBudget, 
      color: totalBudget === 0 ? 'text-text-secondary' : (remainingBudget >= 0 ? 'text-text-primary' : 'text-danger'),
      notSet: totalBudget === 0
    },
  ];

  const expenseByCategory = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topExpenses = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="mb-2 group lg:hidden">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Dashboard</h2>
        <p className="text-[10px] sm:text-[11px] text-text-secondary font-medium mt-1 uppercase tracking-widest">Ringkasan Aktivitas Keuangan</p>
        <div className="h-1 w-12 bg-linear-to-r from-accent to-secondary rounded-full mt-3 opacity-80 group-hover:w-20 transition-all duration-500" />
      </div>
      {/* Ringkasan Hari Ini */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-bg border border-accent/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <Sun className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-[9px] font-medium text-text-secondary uppercase tracking-widest">Ringkasan Hari Ini</p>
            <p className="text-sm font-bold text-text-primary">
              {todayTransactions.length === 0 ? 'Belum ada transaksi hari ini' : `${todayTransactions.length} transaksi dicatat`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 sm:ml-auto flex-wrap">
          {todayIncome > 0 && (
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-success" />
              <div>
                <p className="text-[8px] text-text-secondary uppercase tracking-wider font-medium">Masuk</p>
                <p className="text-xs font-bold text-success currency-font">+{formatCurrency(todayIncome)}</p>
              </div>
            </div>
          )}
          {todayExpense > 0 && (
            <div className="flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-danger" />
              <div>
                <p className="text-[8px] text-text-secondary uppercase tracking-wider font-medium">Keluar</p>
                <p className="text-xs font-bold text-danger currency-font">-{formatCurrency(todayExpense)}</p>
              </div>
            </div>
          )}
          {todayTopCat && (
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-accent" />
              <div>
                <p className="text-[8px] text-text-secondary uppercase tracking-wider font-medium">Terbesar</p>
                <p className="text-xs font-bold text-accent uppercase">{todayTopCat[0]}</p>
              </div>
            </div>
          )}
          {todayTransactions.length === 0 && (
            <button onClick={onAddClick} className="text-[10px] font-black text-accent hover:underline flex items-center gap-1">
              Catat Sekarang <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card-bg p-3 rounded-xl border border-border-ui transition-colors flex flex-col justify-between h-20"
          >
            <p className="text-[9px] text-text-secondary uppercase font-medium tracking-widest">{stat.label}</p>
            <div className="flex items-center gap-1.5 truncate">
              {stat.label === 'Masuk' && <ArrowUpRight className="w-3.5 h-3.5 text-success" />}
              {stat.label === 'Keluar' && <ArrowDownRight className="w-3.5 h-3.5 text-danger" />}
              <p className={cn("text-base font-bold truncate tracking-tight currency-font", stat.color)}>
                {stat.label === 'Sisa Anggaran' && stat.notSet ? (
                  <span className="text-[10px] font-black uppercase opacity-60">Belum Diatur</span>
                ) : (
                  <>
                    {stat.prefix}{formatCurrency(stat.value)}
                  </>
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Transaction Table Card */}
        <div className="xl:col-span-2 bg-card-bg rounded-xl border border-border-ui overflow-hidden flex flex-col transition-colors">
          <div className="p-3 border-b border-border-ui flex justify-between items-center bg-bg-main">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Transaksi Terakhir</h3>
            <button
              onClick={onViewAll}
              className="text-[10px] font-bold text-text-secondary hover:text-accent transition-colors flex items-center gap-1 group"
            >
              LIHAT SEMUA
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-bg-main text-text-secondary border-b border-border-ui text-[9px] font-black uppercase tracking-widest">
                  <th className="px-4 py-2.5">Tanggal</th>
                  <th className="px-4 py-2.5">Kategori</th>
                  <th className="px-4 py-2.5">Keterangan</th>
                  <th className="px-4 py-2.5 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-ui">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-[10px] text-text-secondary font-medium">
                      Belum ada transaksi
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-bg-main/20 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-medium text-text-primary">
                            {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-timestamp">
                            {new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                            t.type === 'Income' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                          )}>
                            {React.createElement(getCategoryIcon(t.category), { className: "w-4 h-4" })}
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[9px] font-medium uppercase tracking-wider",
                            t.type === 'Income' ? "bg-success/5 text-success/70 border border-success/20" : "bg-danger/5 text-danger/70 border border-danger/20"
                          )}>
                            {t.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[10px] text-text-secondary italic max-w-[100px] truncate">{t.note || '-'}</td>
                      <td className={cn(
                        "px-4 py-2.5 text-right text-xs font-bold tracking-tight currency-font",
                        t.type === 'Income' ? "text-success" : "text-danger"
                      )}>
                        <div className="flex items-center justify-end gap-1">
                          {t.type === 'Income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Summary / Tips Card */}
        <div className="flex flex-col gap-4">
          <div className="bg-card-bg p-4 rounded-xl border border-border-ui flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Kesehatan Finansial</h3>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider flex items-center gap-1",
                savingsRate >= 20 ? "bg-success/10 text-success border border-success/20" : "bg-warning/10 text-warning border border-warning/20"
              )}>
                {savingsRate >= 20 ? <ShieldCheck className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                {savingsRate >= 20 ? "Sehat" : "Waspada"}
              </div>
            </div>

            <div className="space-y-4">
              {/* Tabungan */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-text-primary flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-accent" /> Tabungan</span>
                  <span className={cn("text-base font-bold leading-none currency-font", savingsRate >= 20 ? "text-success" : "text-warning")}>
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-bg-main rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000 ease-out", savingsRate >= 20 ? "bg-success" : "bg-warning")} 
                    style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }} 
                  />
                </div>
              </div>

              {/* Rasio Pengeluaran */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-text-primary flex items-center gap-1.5"><PieChart className="w-3.5 h-3.5 text-secondary" /> Pengeluaran</span>
                  <span className={cn("text-sm font-bold leading-none currency-font", expenseRatio <= 80 ? "text-text-primary" : "text-danger")}>
                    {expenseRatio.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 bg-bg-main rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000 ease-out", expenseRatio <= 80 ? "bg-secondary" : "bg-danger")} 
                    style={{ width: `${Math.min(Math.max(expenseRatio, 0), 100)}%` }} 
                  />
                </div>
              </div>

              {/* Pemakaian Anggaran */}
              {totalBudget > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-text-primary flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-warning" /> Anggaran</span>
                    <span className={cn("text-sm font-bold leading-none currency-font", budgetUsage <= 100 ? "text-text-primary" : "text-danger")}>
                      {budgetUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1 bg-bg-main rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000 ease-out", budgetUsage <= 90 ? "bg-accent" : (budgetUsage <= 100 ? "bg-warning" : "bg-danger"))} 
                      style={{ width: `${Math.min(Math.max(budgetUsage, 0), 100)}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-3 border-t border-border-ui/50">
              <p className="text-[10px] text-text-primary font-bold mb-1 flex items-center gap-1">
                <Activity className="w-3 h-3 text-accent" /> Rekomendasi
              </p>
              <p className="text-[9px] text-text-secondary leading-relaxed font-medium italic">
                {savingsRate >= 20
                  ? "Bagus! Pertahankan rasio tabungan di atas 20%. Pertimbangkan untuk investasi."
                  : "Rasio tabungan rendah. Coba kurangi pengeluaran non-esensial minggu ini."}
              </p>
            </div>
          </div>

          {/* Top Expenses Card */}
          {topExpenses.length > 0 && (
            <div className="bg-card-bg p-4 rounded-xl border border-border-ui flex flex-col gap-3">
              <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Top Pengeluaran</h3>
              <div className="space-y-2.5">
                {topExpenses.map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center group/item">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        {React.createElement(getCategoryIcon(category), { className: "w-3.5 h-3.5" })}
                      </div>
                      <span className="text-[10px] font-medium text-text-primary uppercase tracking-tight">{category}</span>
                    </div>
                     <div className="flex items-center gap-1">
                      <ArrowDownRight className="w-2.5 h-2.5 text-danger" />
                      <span className="text-[10px] font-bold text-danger tracking-tight currency-font">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onAddClick}
            className="hidden lg:flex w-full bg-linear-to-r from-accent to-secondary text-white py-3.5 rounded-xl text-xs font-black shadow-lg shadow-accent/20 items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" /> TAMBAH TRANSAKSI
          </button>
        </div>
      </div>
    </div>
  );
}

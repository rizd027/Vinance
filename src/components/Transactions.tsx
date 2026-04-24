import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, X, Filter, Download, Upload, Search, RotateCcw, Edit2,
  Calendar as CalendarIcon, List as ListIcon, ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight, Utensils, Car, ShoppingBag, Receipt,
  Gamepad2, HeartPulse, Wallet, Settings2, SlidersHorizontal, ChevronDown,
  ArrowUpDown, FileDown, FileUp, TrendingUp
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import ExportImportModal from './ExportImportModal';

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

import CustomSelect from './UI/CustomSelect';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionsProps {
  transactions: Transaction[];
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onUpdate?: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onImport: (data: Omit<Transaction, 'id'>[]) => void;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
}

export default function Transactions({ transactions, onAdd, onUpdate, onDelete, onImport, showAddModal, setShowAddModal }: TransactionsProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (showAddModal || showExportModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddModal, showExportModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === 'Lainnya' && customCategory.trim() !== '' ? customCategory.trim() : category;

    if (editId && onUpdate) {
      onUpdate({
        id: editId,
        userId: '', // Will be filled by parent
        type,
        category: finalCategory,
        amount: Number(amount),
        date: new Date().toISOString(),
        note
      });
      setEditId(null);
    } else {
      onAdd({
        userId: '',
        type,
        category: finalCategory,
        amount: Number(amount),
        date: new Date().toISOString(),
        note
      });
    }
    setCategory('');
    setCustomCategory('');
    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  const handleEditClick = (t: Transaction) => {
    setType(t.type);

    const standardCategories = t.type === 'Income'
      ? ['Gaji', 'Bonus', 'Investasi', 'Lainnya']
      : ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'];

    if (standardCategories.includes(t.category)) {
      setCategory(t.category);
      setCustomCategory('');
    } else {
      setCategory('Lainnya');
      setCustomCategory(t.category);
    }

    setAmount(t.amount.toString());
    setNote(t.note || '');
    setEditId(t.id);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setTimeout(() => {
      setEditId(null);
      setCategory('');
      setCustomCategory('');
      setAmount('');
      setNote('');
    }, 200);
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All' || t.type === filterType;
        const matchesCategory = !filterCategory || t.category === filterCategory;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortOrder === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortOrder === 'amount-desc') return b.amount - a.amount;
        if (sortOrder === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, filterType, filterCategory, sortOrder]);

  const allAvailableCategories = Array.from(new Set(transactions.map(t => t.category)));

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('All');
    setFilterCategory('');
    setSortOrder('date-desc');
  };

  const categories = type === 'Income'
    ? ['Gaji', 'Bonus', 'Investasi', 'Lainnya']
    : ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-1 lg:hidden mb-2">
        <h2 className="text-2xl font-black text-text-primary tracking-tight leading-none">Riwayat Transaksi</h2>
        <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Pencatatan & Arus Kas</p>
        <div className="h-1 w-12 bg-linear-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
      </div>

      <div className="flex flex-col gap-3">

        {/* Unified Search, Filter & Actions Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-border-ui bg-card-bg text-xs text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-secondary/50 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "flex items-center justify-center gap-2 px-4 h-10 rounded-2xl border transition-all font-bold text-xs",
                filterType !== 'All' || filterCategory || sortOrder !== 'date-desc'
                  ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                  : "bg-card-bg border-border-ui text-text-secondary hover:bg-bg-main shadow-sm"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {!isMobile && "Opsi"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center w-10 h-10 bg-linear-to-r from-accent to-secondary text-white rounded-2xl shadow-lg shadow-accent/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
              title="Tambah Transaksi"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Unified Filter & Settings Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-[60] flex p-4 overflow-y-auto">
            <div
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <div
              className="relative w-full max-w-sm md:max-w-2xl bg-card-bg rounded-[32px] p-6 md:p-8 shadow-2xl border border-border-ui m-auto z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Filter className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-text-primary">Filter & Opsi</h3>
                </div>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-bg-main rounded-xl transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* View Mode Toggle */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Tampilan</label>
                  <div className="flex bg-bg-main p-1 rounded-2xl border border-border-ui">
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                        viewMode === 'list' ? 'bg-card-bg text-accent shadow-sm border border-border-ui/50' : 'text-text-secondary'
                      )}
                    >
                      <ListIcon className="w-4 h-4" /> Daftar
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                        viewMode === 'calendar' ? 'bg-card-bg text-accent shadow-sm border border-border-ui/50' : 'text-text-secondary'
                      )}
                    >
                      <CalendarIcon className="w-4 h-4" /> Kalender
                    </button>
                  </div>
                </div>

                {/* Type Filter */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Tipe Transaksi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'All', label: 'Semua' },
                      { id: 'Income', label: 'Masuk' },
                      { id: 'Expense', label: 'Keluar' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setFilterType(t.id as any)}
                        className={cn(
                          "py-2.5 rounded-xl text-[10px] font-bold border transition-all",
                          filterType === t.id
                            ? 'bg-accent/10 border-accent/40 text-accent'
                            : 'bg-bg-main border-border-ui text-text-secondary hover:border-accent/20'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Order */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Urutkan</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'date-desc', label: 'Terbaru', icon: ArrowUpDown },
                      { id: 'date-asc', label: 'Terlama', icon: ArrowUpDown },
                      { id: 'amount-desc', label: 'Terbesar', icon: TrendingUp },
                      { id: 'amount-asc', label: 'Terkecil', icon: TrendingUp }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSortOrder(s.id as any)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-2",
                          sortOrder === s.id
                            ? 'bg-accent/10 border-accent/40 text-accent'
                            : 'bg-bg-main border-border-ui text-text-secondary hover:border-accent/20'
                        )}
                      >
                        <s.icon className="w-3 h-3 opacity-50" />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Kategori</label>
                  <CustomSelect
                    value={filterCategory}
                    onChange={setFilterCategory}
                    options={allAvailableCategories}
                    placeholder="Semua Kategori"
                    className="rounded-2xl border-border-ui"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-border-ui">
                {/* Export/Import Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setShowExportModal(true); setShowFilters(false); }}
                    className="flex items-center justify-center gap-2 py-3 bg-bg-main border border-border-ui rounded-2xl text-[10px] font-black text-text-primary hover:bg-border-ui transition-all"
                  >
                    <FileDown className="w-4 h-4 text-accent" /> EXPORT
                  </button>
                  <button
                    onClick={() => { setShowExportModal(true); setShowFilters(false); }}
                    className="flex items-center justify-center gap-2 py-3 bg-bg-main border border-border-ui rounded-2xl text-[10px] font-black text-text-primary hover:bg-border-ui transition-all"
                  >
                    <FileUp className="w-4 h-4 text-secondary" /> IMPORT
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-4 bg-bg-main text-text-secondary rounded-2xl text-xs font-black hover:bg-danger/5 hover:text-danger transition-all border border-border-ui"
                  >
                    RESET
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-[2] py-4 bg-linear-to-r from-accent to-secondary text-white rounded-2xl text-xs font-black shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all"
                  >
                    TERAPKAN
                  </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
      
      <ExportImportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={transactions}
        onImport={onImport}
      />

      {viewMode === 'list' ? (
        <div className="bg-card-bg rounded-xl border border-border-ui overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-bg-main text-text-secondary border-b border-border-ui transition-colors text-[9px] font-bold uppercase tracking-widest">
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-right">Jumlah</th>
                  <th className="px-4 py-3 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-ui">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-bg-main rounded-2xl flex items-center justify-center text-text-secondary/30">
                          <Search className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">Transaksi tidak ditemukan</p>
                          <p className="text-xs text-text-secondary">Coba ubah filter atau kata kunci pencarian Anda.</p>
                        </div>
                        {(searchQuery || filterType !== 'All' || filterCategory) && (
                          <button
                            onClick={clearFilters}
                            className="mt-2 text-xs font-bold text-accent hover:underline"
                          >
                            Hapus Semua Filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-bg-main transition-colors group">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-medium text-text-primary">
                            {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-timestamp">
                            {new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                            t.type === 'Income' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                          )}>
                            {React.createElement(getCategoryIcon(t.category), { className: "w-4 h-4" })}
                          </div>
                          <span className="text-[10px] font-bold text-text-primary uppercase tracking-tight">{t.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-text-secondary italic max-w-[120px] truncate">{t.note || '-'}</td>
                      <td className={cn(
                        "px-4 py-3 text-right text-xs font-bold tracking-tight currency-font",
                        t.type === 'Income' ? "text-success" : "text-danger"
                      )}>
                        <div className="flex items-center justify-end gap-1">
                          {t.type === 'Income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditClick(t)}
                            className="p-1.5 text-text-secondary/40 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                            title="Edit Transaksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(t.id)}
                            className="p-1.5 text-text-secondary/40 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Calendar View */}
          <div className="bg-card-bg rounded-2xl border border-border-ui overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border-ui flex items-center justify-between bg-bg-main/20">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-bg-main rounded-lg transition-colors text-text-secondary">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentMonth(new Date())} className="px-2 py-1 text-[10px] font-bold text-accent hover:bg-accent/10 rounded-lg transition-colors">
                  HARI INI
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-bg-main rounded-lg transition-colors text-text-secondary">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-border-ui bg-bg-main/10">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <div key={day} className="py-2 text-center text-[9px] font-medium text-text-secondary uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {(() => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(monthStart);
                const startDate = startOfWeek(monthStart);
                const endDate = endOfWeek(monthEnd);
                const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                return calendarDays.map((day, idx) => {
                  const dayTransactions = transactions.filter(t => isSameDay(new Date(t.date), day));
                  const income = dayTransactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
                  const expense = dayTransactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDay = isToday(day);
                  const isCurrentMonth = isSameMonth(day, monthStart);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(isSelected ? null : day)}
                      className={cn(
                        "min-h-[70px] p-2 border-r border-b border-border-ui text-left transition-all relative group overflow-hidden",
                        !isCurrentMonth && "bg-bg-main/20",
                        isSelected ? "bg-accent/5 ring-1 ring-inset ring-accent/30" : "hover:bg-bg-main/10",
                        idx % 7 === 6 && "border-r-0"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] font-medium",
                        !isCurrentMonth ? "text-text-secondary/30" : "text-text-secondary",
                        isTodayDay && "text-accent"
                      )}>
                        {format(day, 'd')}
                      </span>

                      <div className="mt-1 space-y-0.5">
                        {income > 0 && (
                          <div className="h-1 w-full bg-success/40 rounded-full" title={`Masuk: ${formatCurrency(income)}`} />
                        )}
                        {expense > 0 && (
                          <div className="h-1 w-full bg-danger/40 rounded-full" title={`Keluar: ${formatCurrency(expense)}`} />
                        )}
                      </div>

                      {dayTransactions.length > 0 && (
                        <div className="mt-auto pt-1">
                          <p className="text-[8px] font-medium text-text-primary truncate">
                            {dayTransactions.length} tx
                          </p>
                        </div>
                      )}

                      {isTodayDay && (
                        <div className="absolute top-1 right-1 w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_rgba(192,132,252,1)]" />
                      )}
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-card-bg rounded-2xl border border-border-ui overflow-hidden shadow-lg">
              <div className="p-3 border-b border-border-ui bg-bg-main/20 flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-widest">
                  Transaksi {format(selectedDate, 'dd MMMM yyyy', { locale: localeId })}
                </h4>
                <button onClick={() => setSelectedDate(null)} className="text-text-secondary hover:text-text-primary">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-border-ui">
                {transactions.filter(t => isSameDay(new Date(t.date), selectedDate)).length === 0 ? (
                  <div className="p-8 text-center text-[10px] text-text-secondary font-medium">
                    Tidak ada transaksi pada tanggal ini
                  </div>
                ) : (
                  transactions
                    .filter(t => isSameDay(new Date(t.date), selectedDate))
                    .map(t => (
                      <div key={t.id} className="p-3 flex items-center justify-between hover:bg-bg-main/10 transition-colors">
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-[9px] font-medium uppercase tracking-wider mb-0.5",
                            t.type === 'Income' ? "text-success" : "text-danger"
                          )}>
                            {t.category}
                          </span>
                          <span className="text-[10px] text-text-secondary italic">{t.note || 'Tanpa keterangan'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "text-xs font-bold tracking-tight currency-font flex items-center gap-1",
                            t.type === 'Income' ? "text-success" : "text-danger"
                          )}>
                            {t.type === 'Income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleEditClick(t)} className="p-2.5 text-text-secondary/40 hover:text-accent hover:bg-accent/10 rounded-xl transition-all">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(t.id)} className="p-2.5 text-text-secondary/40 hover:text-danger hover:bg-danger/10 rounded-xl transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <AddEditModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onAdd={onAdd}
        onUpdate={onUpdate}
        editId={editId}
        initialData={editId ? transactions.find(t => t.id === editId) : undefined}
      />
    </div>
  );
}

// --- SUB-COMPONENTS TO PREVENT LAG ---

const AddEditModal = React.memo(({ isOpen, onClose, onAdd, onUpdate, editId, initialData }: any) => {
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      const standardCategories = initialData.type === 'Income'
        ? ['Gaji', 'Bonus', 'Investasi', 'Lainnya']
        : ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'];

      if (standardCategories.includes(initialData.category)) {
        setCategory(initialData.category);
        setCustomCategory('');
      } else {
        setCategory('Lainnya');
        setCustomCategory(initialData.category);
      }
      setAmount(initialData.amount.toString());
      setNote(initialData.note || '');
    } else {
      setType('Expense');
      setCategory('');
      setCustomCategory('');
      setAmount('');
      setNote('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === 'Lainnya' && customCategory.trim() !== '' ? customCategory.trim() : category;

    if (editId && onUpdate) {
      onUpdate({
        id: editId,
        userId: '',
        type,
        category: finalCategory,
        amount: Number(amount),
        date: initialData?.date || new Date().toISOString(),
        note
      });
    } else {
      onAdd({
        userId: '',
        type,
        category: finalCategory,
        amount: Number(amount),
        date: new Date().toISOString(),
        note
      });
    }
    onClose();
  };

  const categories = type === 'Income'
    ? ['Gaji', 'Bonus', 'Investasi', 'Lainnya']
    : ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'];

  return (
    <div className="fixed inset-0 z-50 flex p-4 overflow-y-auto">
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <div 
          className="relative w-full max-w-md bg-card-bg rounded-2xl p-6 sm:p-8 shadow-2xl border border-border-ui transition-colors mt-4 mx-auto mb-auto z-10"
        >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-text-primary">{editId ? 'Edit Transaksi' : 'Catat Transaksi Baru'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-text-primary p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-bg-main p-1 rounded-lg transition-colors">
            <button
              type="button"
              onClick={() => setType('Expense')}
              className={cn(
                "flex-1 py-2 rounded-md text-xs font-bold transition-all",
                type === 'Expense' ? 'bg-card-bg text-danger shadow-sm' : 'text-text-secondary'
              )}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('Income')}
              className={cn(
                "flex-1 py-2 rounded-md text-xs font-bold transition-all",
                type === 'Income' ? 'bg-card-bg text-success shadow-sm' : 'text-text-secondary'
              )}
            >
              Pemasukan
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">Kategori</label>
              <CustomSelect
                required
                value={category}
                onChange={setCategory}
                options={categories}
                placeholder="Pilih Kategori"
              />
              {category === 'Lainnya' && (
                <div className="mt-3">
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border-ui bg-card-bg text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm transition-colors"
                    placeholder="Ketik kategori kustom..."
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">Jumlah (Rp)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border-ui bg-card-bg text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm transition-colors"
                placeholder="0"
                inputMode="decimal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase">Keterangan</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border-ui bg-card-bg text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm transition-colors"
                placeholder="Contoh: Belanja bulanan"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-linear-to-r from-accent to-secondary text-white py-3.5 rounded-lg font-bold shadow-lg shadow-accent/20 mt-4 hover:shadow-accent/30 active:scale-[0.98] transition-all"
          >
            {editId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>
        </form>
          </div>
        </div>
      );
    });

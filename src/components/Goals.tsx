import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Target, Plus, Trash2, Edit2, X, CheckCircle2, Clock, TrendingUp, PiggyBank,
  Home, Car, Plane, Smartphone, GraduationCap, HeartPulse, ShoppingBag, Gamepad2, Camera, Globe, Briefcase, Coffee,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowUpRight
} from 'lucide-react';
import { Goal } from '../types';
import { formatCurrency, cn, formatInputNumber, parseInputNumber } from '../lib/utils';
import { format, differenceInDays, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import DatePicker from './UI/DatePicker';


interface GoalsProps {
  goals: Goal[];
  onAdd: (goal: Omit<Goal, 'id'>) => void;
  onUpdate: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onAddSavings: (goalId: string, amount: number) => void;
  userId: string;
}

const GOAL_ICONS = [
  { id: 'home', icon: Home },
  { id: 'car', icon: Car },
  { id: 'plane', icon: Plane },
  { id: 'phone', icon: Smartphone },
  { id: 'edu', icon: GraduationCap },
  { id: 'health', icon: HeartPulse },
  { id: 'shop', icon: ShoppingBag },
  { id: 'game', icon: Gamepad2 },
  { id: 'camera', icon: Camera },
  { id: 'world', icon: Globe },
  { id: 'work', icon: Briefcase },
  { id: 'coffee', icon: Coffee },
];

export default function Goals({ goals = [], onAdd, onUpdate, onDelete, onAddSavings, userId }: GoalsProps) {
  const [showModal, setShowModal] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('header-action-portal'));
  }, []);
  const [showSavingsModal, setShowSavingsModal] = useState<Goal | null>(null);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [savingsAmount, setSavingsAmount] = useState('');

  const [form, setForm] = useState({
    name: '', targetAmount: '', savedAmount: '0', deadline: '', icon: 'home', color: '#8b5cf6',
  });

  const getIconById = (id: string) => {
    return GOAL_ICONS.find(i => i.id === id)?.icon || Target;
  };

  const openAdd = () => {
    setEditGoal(null);
    setForm({ name: '', targetAmount: '', savedAmount: '0', deadline: '', icon: 'home', color: '#8b5cf6' });
    setShowModal(true);
  };

  const openEdit = (g: Goal) => {
    setEditGoal(g);
    setForm({
      name: g.name,
      targetAmount: formatInputNumber(String(g.targetAmount)),
      savedAmount: formatInputNumber(String(g.savedAmount)),
      deadline: g.deadline || '',
      icon: g.icon,
      color: g.color,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.targetAmount) return;
    const payload = {
      userId,
      name: form.name,
      targetAmount: Number(parseInputNumber(form.targetAmount)),
      savedAmount: Number(parseInputNumber(form.savedAmount)) || 0,
      deadline: form.deadline || undefined,
      icon: form.icon,
      color: form.color,
    };
    if (editGoal) {
      onUpdate({ ...editGoal, ...payload });
    } else {
      onAdd(payload);
    }
    setShowModal(false);
  };

  const handleAddSavings = () => {
    if (!showSavingsModal || !savingsAmount) return;
    onAddSavings(showSavingsModal.id, Number(parseInputNumber(savingsAmount)));
    setSavingsAmount('');
    setShowSavingsModal(null);
  };

  const totalTarget = (goals || []).reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = (goals || []).reduce((s, g) => s + g.savedAmount, 0);
  const completedGoals = (goals || []).filter(g => g.savedAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {portalTarget && createPortal(
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-secondary text-white rounded-lg text-xs font-bold shadow-md shadow-accent/20 hover:shadow-accent/30 hover:scale-105 active:scale-95 transition-all mr-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tujuan</span>
        </button>,
        portalTarget
      )}

      {/* Header (Mobile only) - Title hidden since it is covered globally by premium mobile header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:hidden mb-4">
        <button
          onClick={openAdd}
          className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-accent to-secondary text-white rounded-xl text-xs font-black shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" /> TAMBAH TUJUAN BARU
        </button>
      </div>

      {/* Summary Cards */}
      {goals && goals.length > 0 && (
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 gap-3 sm:gap-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-3 sm:pb-0">
          {[
            { label: 'Total Target', value: formatCurrency(totalTarget), icon: <Target className="w-3.5 h-3.5" />, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Total Terkumpul', value: formatCurrency(totalSaved), icon: <PiggyBank className="w-3.5 h-3.5" />, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Tujuan Tercapai', value: `${completedGoals} / ${goals.length}`, icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },

          ].map((s, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-auto bg-card-bg p-4 rounded-lg border border-border-ui shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className={cn("p-2 rounded-lg", s.bg)}>
                  <span className={s.color}>{s.icon}</span>
                </div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.15em] truncate">{s.label}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {s.label === 'Total Terkumpul' && <ArrowUpRight className="w-3.5 h-3.5 text-success" />}
                <p className={cn("text-base sm:text-lg font-black tracking-tight currency-font", s.color)}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goals Grid */}
      {!goals || goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-lg bg-accent/10 flex items-center justify-center text-4xl shadow-inner">🎯</div>
          <p className="text-sm font-bold text-text-secondary">Belum ada tujuan tabungan</p>
          <button onClick={openAdd} className="px-6 py-3 bg-accent text-white rounded-lg text-xs font-black shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            + Buat Tujuan Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, i) => {
              const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
              const remaining = goal.targetAmount - goal.savedAmount;
              const isComplete = pct >= 100;
              const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;

              return (
                <div
                  key={goal.id}
                  className="bg-card-bg rounded-lg border border-border-ui overflow-hidden shadow-md hover:shadow-xl hover:border-accent/40 transition-all group"
                >
                  {/* Card Header */}
                  <div 
                    className="p-5 sm:p-6 relative overflow-hidden bg-accent" 
                    style={{ 
                      background: (goal.color && goal.color.length > 3)
                        ? `linear-gradient(135deg, ${goal.color}, ${goal.color}dd)` 
                        : undefined 
                    }}
                  >
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full bg-[url('/doodle_wallpaper.png')] bg-repeat opacity-20 scale-150" />
                    </div>

                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-12 h-12 bg-black/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/20 shadow-inner">
                        {React.createElement(getIconById(goal.icon), { className: "w-6.5 h-6.5" })}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(goal)} className="p-2.5 bg-black/10 hover:bg-black/20 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-white" />
                        </button>
                        <button onClick={() => onDelete(goal.id)} className="p-2.5 bg-black/10 hover:bg-red-600/40 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white mt-3 leading-tight">{goal.name}</h3>
                    {isComplete && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">Tercapai!</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 sm:p-4 space-y-3">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-medium text-text-secondary">Progress</span>
                        <span className="text-[10px] font-bold currency-font" style={{ color: goal.color }}>
                          {pct > 0 && pct < 1 ? '< 1' : Math.round(pct)}%
                        </span>

                      </div>
                      <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ backgroundColor: goal.color, width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="flex justify-between">
                      <div>
                        <p className="text-[9px] text-text-secondary uppercase tracking-widest font-medium">Terkumpul</p>
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-success" />
                          <p className="text-sm font-bold text-success currency-font">{formatCurrency(goal.savedAmount)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-text-secondary uppercase tracking-widest font-medium">Target</p>
                        <p className="text-sm font-bold text-text-primary currency-font">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>

                    {/* Remaining + Deadline */}
                    <div className="flex items-center justify-between text-[9px]">
                      {remaining > 0 ? (
                        <span className="text-text-secondary">Sisa Target: <span className="font-bold text-warning currency-font">{formatCurrency(remaining)}</span></span>

                      ) : (
                        <span className="text-success font-bold">✅ Sudah tercapai!</span>
                      )}
                      {daysLeft !== null && (
                        <span className={cn("flex items-center gap-1 font-bold", daysLeft < 30 ? 'text-danger' : 'text-text-secondary')}>
                          <Clock className="w-2.5 h-2.5" />
                          {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Kedaluwarsa'}
                        </span>
                      )}
                    </div>

                    {/* Add Savings Button */}
                    {!isComplete && (
                      <button
                        onClick={() => setShowSavingsModal(goal)}
                        className="w-full py-3 bg-linear-to-r from-accent to-secondary text-white rounded-lg text-[10px] font-black shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        + TAMBAH TABUNGAN
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
           {/* Add/Edit Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex sm:p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm hidden sm:block" 
            onClick={() => setShowModal(false)} 
          />
          <div 
            className="relative bg-card-bg sm:rounded-lg border border-border-ui shadow-2xl w-full min-h-full sm:min-h-0 sm:max-w-md p-6 sm:m-auto z-10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-text-primary">{editGoal ? 'Edit Tujuan' : 'Tambah Tujuan'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-bg-main rounded-lg transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Icon Picker */}
              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Ikon Tujuan</label>
                <div className="grid grid-cols-6 gap-2">
                  {GOAL_ICONS.map(i => (
                    <button 
                      key={i.id} 
                      onClick={() => setForm(f => ({ ...f, icon: i.id }))} 
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all", 
                        form.icon === i.id ? 'bg-accent/20 scale-110 ring-2 ring-accent text-accent' : 'bg-bg-main text-text-secondary hover:bg-border-ui hover:text-text-primary'
                      )}
                    >
                      <i.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Pilih Warna</label>
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-2 flex-1">
                    {['#8b5cf6', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#d946ef'].map(c => (
                      <button 
                        key={c} 
                        onClick={() => setForm(f => ({ ...f, color: c }))} 
                        className={cn("w-8 h-8 rounded-full transition-all hover:scale-110", form.color === c && 'ring-2 ring-offset-2 ring-accent ring-offset-card-bg scale-110')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="relative group">
                    <input 
                      type="color" 
                      value={form.color} 
                      onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      className="w-10 h-10 rounded-lg bg-bg-main border border-border-ui p-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Nama Tujuan</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Tabungan Rumah" className="w-full p-3 bg-bg-main rounded-lg border border-border-ui focus:border-accent outline-none text-sm font-bold text-text-primary transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Target (Rp)</label>
                  <input type="text" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: formatInputNumber(e.target.value) }))} placeholder="500.000.000" className="w-full p-3 bg-bg-main rounded-lg border border-border-ui focus:border-accent outline-none text-sm font-bold text-text-primary transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Sudah Terkumpul</label>
                  <input type="text" value={form.savedAmount} onChange={e => setForm(f => ({ ...f, savedAmount: formatInputNumber(e.target.value) }))} placeholder="0" className="w-full p-3 bg-bg-main rounded-lg border border-border-ui focus:border-accent outline-none text-sm font-bold text-text-primary transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Target Tanggal (Opsional)</label>
                <DatePicker value={form.deadline} onChange={v => setForm(f => ({ ...f, deadline: v }))} dropUp placeholder="dd/mm/yyyy" />
              </div>

              <button onClick={handleSubmit} disabled={!form.name || !form.targetAmount} className="w-full py-3 bg-linear-to-r from-accent to-secondary text-white rounded-lg font-black text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100">
                {editGoal ? 'Simpan Perubahan' : 'Tambah Tujuan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Savings Modal */}
      {showSavingsModal && (
        <div className="fixed inset-0 z-50 flex sm:p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm hidden sm:block" 
            onClick={() => setShowSavingsModal(null)} 
          />
          <div 
            className="relative bg-card-bg sm:rounded-lg border border-border-ui shadow-2xl w-full min-h-full sm:min-h-0 sm:max-w-sm p-6 sm:m-auto z-10"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: showSavingsModal.color }}>
                  {React.createElement(getIconById(showSavingsModal.icon), { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-primary">{showSavingsModal.name}</h3>
                  <p className="text-[10px] text-text-secondary">Tambah jumlah tabungan</p>
                </div>
              </div>
              <button onClick={() => setShowSavingsModal(null)} className="p-2 hover:bg-bg-main rounded-lg transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" value={savingsAmount} onChange={e => setSavingsAmount(formatInputNumber(e.target.value))} placeholder="Masukkan jumlah (Rp)" className="w-full p-3 bg-bg-main rounded-lg border border-border-ui focus:border-accent outline-none text-sm font-bold text-text-primary transition-all" autoFocus />
              <button onClick={handleAddSavings} disabled={!savingsAmount || Number(savingsAmount) <= 0} className="w-full py-3 bg-linear-to-r from-accent to-secondary text-white rounded-lg font-black text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                Tambah {savingsAmount ? formatCurrency(Number(savingsAmount)) : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

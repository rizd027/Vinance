<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header (Mobile only) -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:hidden mb-4">
      <button
        @click="openAdd"
        class="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-xl text-xs font-black shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Plus class="w-4 h-4" /> TAMBAH TUJUAN BARU
      </button>
    </div>

    <!-- Summary Cards -->
    <div v-if="goals && goals.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pb-3 sm:pb-0">
      <div v-for="(s, i) in summaryData" :key="i" :class="['p-2 flex flex-col justify-between', i === 2 ? 'col-span-2 sm:col-span-1' : '']">
        <div class="flex items-center gap-2 mb-1">
          <span :class="s.color"><component :is="s.icon" class="w-3.5 h-3.5" /></span>
          <p class="text-[9px] font-black text-text-secondary uppercase tracking-[0.15em] truncate">{{ s.label }}</p>
        </div>
        <div class="flex items-center gap-1.5">
          <ArrowUpRight v-slot:arrow v-if="s.label === 'Total Terkumpul'" class="w-3.5 h-3.5 text-success" />
          <p :class="['text-base sm:text-lg font-black tracking-tight currency-font', s.color]">{{ s.value }}</p>
        </div>
      </div>
    </div>

    <!-- Goals Grid -->
    <div v-if="!goals || goals.length === 0" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-20 h-20 rounded-lg bg-accent/10 flex items-center justify-center text-accent shadow-inner">
        <Target class="w-10 h-10" />
      </div>
      <p class="text-sm font-bold text-text-secondary">Belum ada tujuan tabungan</p>
      <button @click="openAdd" class="px-6 py-3 bg-accent text-white rounded-lg text-xs font-black shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
        + Buat Tujuan Pertama
      </button>
    </div>
    <div v-else class="space-y-1">
      <div
        v-for="goal in goals"
        :key="goal.id"
        class="py-5 border-b border-border-ui/35 transition-all group"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3.5 min-w-0 flex-1">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner" :style="{ backgroundColor: goal.color || '#2D4DB5' }">
              <component :is="getIconById(goal.icon)" class="w-5.5 h-5.5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-text-primary truncate leading-tight">{{ goal.name }}</h3>
                <span v-if="isComplete(goal)" class="text-[9px] font-black text-success uppercase tracking-wider bg-success/10 px-2 py-0.5 rounded-full">Tercapai</span>
              </div>
              
              <!-- Amounts & deadline -->
              <div class="flex items-center gap-2.5 text-[10px] text-text-secondary mt-1">
                <span class="currency-font font-bold text-text-primary">{{ formatCurrency(goal.savedAmount) }}</span>
                <span>/</span>
                <span class="currency-font">{{ formatCurrency(goal.targetAmount) }}</span>
                <span v-if="getDaysLeft(goal) !== null" class="opacity-60">•</span>
                <span v-if="getDaysLeft(goal) !== null" class="opacity-70">{{ getDaysLeft(goal)! > 0 ? `${getDaysLeft(goal)} hari lagi` : 'Kedaluwarsa' }}</span>
              </div>
            </div>
          </div>

          <!-- Action buttons (Edit & Delete) -->
          <div class="flex gap-1">
            <button @click="openEdit(goal)" class="p-2 text-text-secondary hover:text-accent rounded-lg transition-colors">
              <Edit2 class="w-4 h-4" />
            </button>
            <button @click="$emit('delete', goal.id)" class="p-2 text-text-secondary hover:text-danger rounded-lg transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Progress bar under the details -->
        <div class="mt-3.5">
          <div class="flex justify-between items-center mb-1 text-[9px] text-text-secondary/70">
            <span>Progress</span>
            <span class="font-bold currency-font">{{ getGoalPercentage(goal) }}%</span>
          </div>
          <div class="h-1.5 bg-bg-main rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{ backgroundColor: goal.color, width: `${Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)}%` }"
            />
          </div>
        </div>

        <!-- Sisa target + Tambah Tabungan Button -->
        <div class="mt-4 flex items-center justify-between gap-4">
          <div class="flex flex-col">
            <span class="text-[9px] text-text-secondary">
              Sisa Target: <span class="font-bold text-warning currency-font">{{ formatCurrency(getRemaining(goal)) }}</span>
            </span>
            <span v-if="!isComplete(goal) && getRemaining(goal) > 0 && getDaysLeft(goal) && getDaysLeft(goal)! > 0" class="text-[9px] text-accent mt-0.5 font-bold">
              Kebutuhan: <span class="currency-font">{{ formatCurrency(Math.ceil(getRemaining(goal) / getDaysLeft(goal)!)) }}</span> / hari
            </span>
          </div>
          <button
            v-if="!isComplete(goal)"
            @click="showSavingsModal = goal"
            class="px-4 py-2 bg-accent/8 border border-accent/15 text-accent rounded-full text-[10px] font-black active:scale-95 transition-all"
          >
            + Tabungan
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Goal Modal (Full Screen) -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[9999] bg-bg-main flex flex-col overflow-hidden">
        <!-- Modal Header -->
        <div
          class="relative pt-6 pb-6 text-white overflow-hidden shrink-0"
          style="background: linear-gradient(160deg, #0f1f4b 0%, #1A2C5B 45%, #1e3a8a 100%)"
        >
          <div class="absolute top-0 right-0 w-56 h-56 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
          <div class="absolute -bottom-12 -left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div class="relative z-10 w-full max-w-xl mx-auto px-5">
            <div class="flex items-center gap-3">
              <button @click="showModal = false" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 transition-all">
                <ChevronLeft class="w-5 h-5 stroke-[2.5] text-white" />
              </button>
              <div>
                <h1 class="text-[20px] font-black text-white tracking-tight leading-none">
                  {{ editGoal ? 'Edit Tujuan' : 'Tambah Tujuan' }}
                </h1>
                <p class="text-[9.5px] font-semibold text-white/45 uppercase tracking-[0.2em] mt-1">
                  Atur Rencana Tabungan &amp; Impian
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 relative z-10 overflow-y-auto no-scrollbar bg-bg-main text-text-primary border-0">
          <div class="w-full max-w-xl mx-auto min-h-full px-5 pt-6 pb-12 flex flex-col justify-between">
            <div class="space-y-4">
              <!-- Icon Picker -->
              <div>
                <label class="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Ikon Tujuan</label>
                <div class="grid grid-cols-6 gap-2">
                  <button 
                    v-for="i in GOAL_ICONS" 
                    :key="i.id" 
                    @click="form.icon = i.id" 
                    :class="[
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all', 
                      form.icon === i.id ? 'bg-accent/20 scale-110 ring-2 ring-accent text-accent' : 'bg-bg-main text-text-secondary hover:bg-border-ui hover:text-text-primary'
                    ]"
                  >
                    <component :is="i.icon" class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- Color Picker -->
              <div>
                <label class="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Pilih Warna</label>
                <div class="flex items-center gap-3">
                  <div class="flex flex-wrap gap-2 flex-1">
                    <button 
                      v-for="c in ['#8b5cf6', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#d946ef']" 
                      :key="c" 
                      @click="form.color = c" 
                      :class="['w-8 h-8 rounded-full transition-all hover:scale-110', form.color === c && 'ring-2 ring-offset-2 ring-accent ring-offset-card-bg scale-110']"
                      :style="{ backgroundColor: c }"
                    />
                  </div>
                  <input 
                    type="color" 
                    v-model="form.color"
                    class="w-10 h-10 rounded-lg bg-bg-main border border-border-ui p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label class="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Nama Tujuan</label>
                <input type="text" v-model="form.name" placeholder="Contoh: Tabungan Rumah" class="w-full py-3 outline-none text-sm font-bold text-text-primary" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Target (Rp)</label>
                  <input type="text" v-model="form.targetAmount" @input="form.targetAmount = formatInputNumber(form.targetAmount)" placeholder="500.000.000" class="w-full py-3 outline-none text-sm font-bold text-text-primary" />
                </div>
                <div>
                  <label class="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Sudah Terkumpul</label>
                  <input type="text" v-model="form.savedAmount" @input="form.savedAmount = formatInputNumber(form.savedAmount)" placeholder="0" class="w-full py-3 outline-none text-sm font-bold text-text-primary" />
                </div>
              </div>

              <div>
                <label class="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Target Tanggal (Opsional)</label>
                <DatePicker :value="form.deadline" @change="form.deadline = $event" dropUp placeholder="dd/mm/yyyy" />
              </div>

              <button @click="handleSubmit" :disabled="!form.name || !form.targetAmount" class="w-full py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-lg font-black text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 mt-2">
                {{ editGoal ? 'Simpan Perubahan' : 'Tambah Tujuan' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add Savings Modal -->
    <Teleport to="body">
      <div v-if="showSavingsModal" class="fixed inset-0 z-50 flex sm:p-4 overflow-y-auto items-center justify-center">
        <div @click="showSavingsModal = null" class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div class="relative bg-bg-main sm:rounded-2xl shadow-lg w-full sm:max-w-sm p-6 z-10 my-auto border-0">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg" :style="{ backgroundColor: showSavingsModal.color }">
                <component :is="getIconById(showSavingsModal.icon)" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-black text-text-primary">{{ showSavingsModal.name }}</h3>
                <p class="text-[10px] text-text-secondary">Tambah jumlah tabungan</p>
              </div>
            </div>
            <button @click="showSavingsModal = null" class="p-2 hover:bg-bg-main rounded-lg transition-colors">
              <X class="w-4 h-4 text-text-secondary" />
            </button>
          </div>
          <div class="space-y-4">
            <input type="text" v-model="savingsAmount" @input="savingsAmount = formatInputNumber(savingsAmount)" placeholder="Masukkan jumlah (Rp)" class="w-full py-3 outline-none text-sm font-bold text-text-primary" autofocus />
            <button @click="handleAddSavings" :disabled="!savingsAmount || Number(parseInputNumber(savingsAmount)) <= 0" class="w-full py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-lg font-black text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all disabled:opacity-50">
              Tambah {{ savingsAmount ? formatCurrency(Number(parseInputNumber(savingsAmount))) : '' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { registerModal, unregisterModal } from '../composables/useAppState';
import { 
  Target, Plus, Trash2, Edit2, X, CheckCircle2, PiggyBank,
  Home, Car, Plane, Smartphone, GraduationCap, HeartPulse, ShoppingBag, Gamepad2, Camera, Globe, Briefcase, Coffee,
  ArrowUpRight, ChevronLeft
} from '@lucide/vue';
import type { Goal } from '../types';
import { formatCurrency, formatInputNumber, parseInputNumber } from '../lib/utils';
import { differenceInDays } from 'date-fns';
import DatePicker from './UI/DatePicker.vue';

interface Props {
  goals: Goal[];
  userId: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  add: [goal: Omit<Goal, 'id'>];
  update: [goal: Goal];
  delete: [id: string];
  addSavings: [goalId: string, amount: number];
}>();

const showModal = ref(false);
const showSavingsModal = ref<Goal | null>(null);
const editGoal = ref<Goal | null>(null);
const savingsAmount = ref('');

watch(showModal, (newVal) => {
  if (newVal) {
    registerModal('goals-add-edit', () => { showModal.value = false; });
  } else {
    unregisterModal('goals-add-edit');
  }
});

watch(showSavingsModal, (newVal) => {
  if (newVal) {
    registerModal('goals-savings', () => { showSavingsModal.value = null; });
  } else {
    unregisterModal('goals-savings');
  }
});

const form = ref({
  name: '', targetAmount: '', savedAmount: '0', deadline: '', icon: 'home', color: '#8b5cf6',
});

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

const getIconById = (id: string) => {
  return GOAL_ICONS.find(i => i.id === id)?.icon || Target;
};

const openAdd = () => {
  editGoal.value = null;
  form.value = { name: '', targetAmount: '', savedAmount: '0', deadline: '', icon: 'home', color: '#8b5cf6' };
  showModal.value = true;
};

const openEdit = (g: Goal) => {
  editGoal.value = g;
  form.value = {
    name: g.name,
    targetAmount: formatInputNumber(String(g.targetAmount)),
    savedAmount: formatInputNumber(String(g.savedAmount)),
    deadline: g.deadline || '',
    icon: g.icon,
    color: g.color,
  };
  showModal.value = true;
};

const handleSubmit = () => {
  if (!form.value.name || !form.value.targetAmount) return;
  const payload = {
    userId: props.userId,
    name: form.value.name,
    targetAmount: Number(parseInputNumber(form.value.targetAmount)),
    savedAmount: Number(parseInputNumber(form.value.savedAmount)) || 0,
    deadline: form.value.deadline || undefined,
    icon: form.value.icon,
    color: form.value.color,
  };
  if (editGoal.value) {
    emit('update', { ...editGoal.value, ...payload });
  } else {
    emit('add', payload);
  }
  showModal.value = false;
};

const handleAddSavings = () => {
  if (!showSavingsModal.value || !savingsAmount.value) return;
  emit('addSavings', showSavingsModal.value.id, Number(parseInputNumber(savingsAmount.value)));
  savingsAmount.value = '';
  showSavingsModal.value = null;
};

const totalTarget = computed(() => (props.goals || []).reduce((s, g) => s + g.targetAmount, 0));
const totalSaved = computed(() => (props.goals || []).reduce((s, g) => s + g.savedAmount, 0));
const completedGoals = computed(() => (props.goals || []).filter(g => g.savedAmount >= g.targetAmount).length);

const summaryData = computed(() => [
  { label: 'Total Target', value: formatCurrency(totalTarget.value), icon: Target, color: 'text-accent', bg: 'bg-accent/10' },
  { label: 'Total Terkumpul', value: formatCurrency(totalSaved.value), icon: PiggyBank, color: 'text-success', bg: 'bg-success/10' },
  { label: 'Tujuan Tercapai', value: `${completedGoals.value} / ${props.goals.length}`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
]);

const getGoalPercentage = (goal: Goal) => {
  const pct = (goal.savedAmount / goal.targetAmount) * 100;
  return pct > 0 && pct < 1 ? '< 1' : Math.round(pct);
};

const getRemaining = (goal: Goal) => goal.targetAmount - goal.savedAmount;

const isComplete = (goal: Goal) => (goal.savedAmount / goal.targetAmount) * 100 >= 100;

const getDaysLeft = (goal: Goal) => {
  return goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;
};
</script>

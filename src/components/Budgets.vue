<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header (Mobile only) -->
    <div class="flex justify-between items-center lg:hidden mb-4">
      <button
        @click="showAddModal = true"
        class="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-xl text-xs font-black shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Plus class="w-4 h-4" /> TAMBAH ANGGARAN BARU
      </button>
    </div>

    <!-- Stats Dashboard -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3 space-y-6">
        <!-- Main Budget Card -->
        <div class="bg-transparent p-0 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-10" />
          <div class="flex flex-col sm:flex-row justify-between gap-6">
            <div class="space-y-4">
              <div>
                <p class="text-[10px] font-medium text-text-secondary uppercase tracking-widest mb-1">Total Budget</p>
                <p class="text-3xl font-bold text-text-primary tracking-tight currency-font">{{ formatCurrency(totalBudget) }}</p>
              </div>
              <div class="flex gap-6">
                <div>
                  <p class="text-[10px] text-text-secondary font-medium uppercase mb-1">Terpakai</p>
                  <div class="flex items-center gap-1">
                    <ArrowDownRight class="w-3 h-3 text-danger" />
                    <p class="text-sm font-bold text-danger currency-font">{{ formatCurrency(totalSpent) }}</p>
                  </div>
                </div>
                <div>
                  <p class="text-[10px] text-text-secondary font-medium uppercase mb-1">Belum Dialokasi</p>
                  <p :class="['text-sm font-bold currency-font', unallocated >= 0 ? 'text-success' : 'text-danger']">
                    {{ formatCurrency(Math.max(0, unallocated)) }}
                  </p>
                </div>
              </div>
            </div>
            <div class="w-full sm:w-48 space-y-3">
              <div class="flex justify-between items-end">
                <span class="text-[10px] font-medium text-text-secondary uppercase">Sisa Realita</span>
                <span :class="['text-base font-bold currency-font', totalRemaining < 0 ? 'text-danger' : 'text-success']">
                  {{ formatCurrency(totalRemaining) }}
                </span>
              </div>
              <div class="h-1.5 bg-bg-main rounded-full overflow-hidden transition-colors">
                <div
                  v-if="totalBudget > 0"
                  :class="[
                    'h-full transition-all duration-1000',
                    totalSpent > totalBudget ? 'bg-danger' : 'bg-gradient-to-r from-accent to-secondary'
                  ]"
                  :style="{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }"
                />
                <div v-else class="h-full w-full bg-text-secondary/10" />
              </div>
            </div>
          </div>
        </div>

        <!-- 50/30/20 Health Check -->
        <div class="bg-transparent p-0 space-y-4 relative z-10">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-success" />
              Analisis Kesehatan 50/30/20
            </h4>
            <Info class="w-4 h-4 text-text-secondary cursor-pointer" @click="showInfoModal = true" />
          </div>
          <div class="grid grid-cols-3 gap-2 h-32 items-end">
            <div class="flex flex-col gap-2 h-full flex-1 justify-end">
              <div class="flex justify-between items-end text-[8px] font-bold uppercase tracking-tight text-text-secondary">
                <span>Kebutuhan</span>
                <span :class="['px-1.5 py-0.5 rounded-md', rule503020.needsPct <= 50 ? 'text-success bg-success/10' : 'text-danger bg-danger/10']">
                  {{ Math.round(rule503020.needsPct) }}% {{ rule503020.needsPct <= 50 ? 'AMAN' : 'OVER' }}
                </span>
              </div>
              <div class="h-16 relative bg-bg-main rounded-lg overflow-hidden border-0">
                <div
                  :class="['absolute bottom-0 w-full', rule503020.needsPct <= 50 ? 'bg-accent' : 'bg-danger']"
                  :style="{ height: `${Math.min(rule503020.needsPct, 100)}%` }"
                />
                <div class="absolute w-full border-t border-dashed border-text-secondary/40" style="bottom: 50%" />
              </div>
              <div class="text-center text-[7px] font-bold text-text-secondary">Target 50%</div>
            </div>

            <div class="flex flex-col gap-2 h-full flex-1 justify-end">
              <div class="flex justify-between items-end text-[8px] font-bold uppercase tracking-tight text-text-secondary">
                <span>Keinginan</span>
                <span :class="['px-1.5 py-0.5 rounded-md', rule503020.wantsPct <= 30 ? 'text-success bg-success/10' : 'text-danger bg-danger/10']">
                  {{ Math.round(rule503020.wantsPct) }}% {{ rule503020.wantsPct <= 30 ? 'AMAN' : 'OVER' }}
                </span>
              </div>
              <div class="h-16 relative bg-bg-main rounded-lg overflow-hidden border-0">
                <div
                  :class="['absolute bottom-0 w-full', rule503020.wantsPct <= 30 ? 'bg-secondary' : 'bg-danger']"
                  :style="{ height: `${Math.min(rule503020.wantsPct, 100)}%` }"
                />
                <div class="absolute w-full border-t border-dashed border-text-secondary/40" style="bottom: 30%" />
              </div>
              <div class="text-center text-[7px] font-bold text-text-secondary">Target 30%</div>
            </div>

            <div class="flex flex-col gap-2 h-full flex-1 justify-end">
              <div class="flex justify-between items-end text-[8px] font-bold uppercase tracking-tight text-text-secondary">
                <span>Tabungan</span>
                <span :class="['px-1.5 py-0.5 rounded-md', rule503020.savingsPct >= 20 ? 'text-success bg-success/10' : 'text-danger bg-danger/10']">
                  {{ Math.round(rule503020.savingsPct) }}% {{ rule503020.savingsPct >= 20 ? 'AMAN' : 'OVER' }}
                </span>
              </div>
              <div class="h-16 relative bg-bg-main rounded-lg overflow-hidden border-0">
                <div
                  :class="['absolute bottom-0 w-full', rule503020.savingsPct >= 20 ? 'bg-success' : 'bg-danger']"
                  :style="{ height: `${Math.min(rule503020.savingsPct, 100)}%` }"
                />
                <div class="absolute w-full border-t border-dashed border-text-secondary/40" style="bottom: 20%" />
              </div>
              <div class="text-center text-[7px] font-bold text-text-secondary">Target 20%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Allocation Chart -->
      <div class="lg:col-span-2 bg-transparent p-0 flex flex-col items-center border-0">
        <h3 class="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 self-start flex items-center gap-2">
          <PieIcon class="w-4 h-4 text-accent" />
          Distribusi Anggaran
        </h3>
        <div class="relative h-64 w-full mt-4 min-h-0 flex items-center justify-center">
          <div v-if="chartSeries.length > 0" class="w-full">
            <apexchart type="donut" height="240" :options="chartOptions" :series="chartSeries" />
          </div>
          <div v-else class="flex flex-col items-center gap-3 text-text-secondary/40">
            <PieIcon class="w-16 h-16 stroke-[1]" />
            <p class="text-[10px] font-bold uppercase tracking-widest">Belum ada data distribusi</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Budget Reminders -->
    <div v-if="alertStatus.critical.length > 0 || alertStatus.warning.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-if="alertStatus.critical.length > 0" class="bg-danger/5 p-4 rounded-lg flex items-start gap-3 border-0">
        <div class="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center shrink-0">
          <AlertCircle class="w-5 h-5 text-danger" />
        </div>
        <div class="flex-1">
          <p class="text-xs font-bold text-danger uppercase tracking-tight mb-1">Anggaran Terlampaui!</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="b in alertStatus.critical" :key="b.category" class="text-[10px] font-bold text-text-primary bg-danger/10 px-2 py-0.5 rounded-md border border-danger/20">
              {{ b.category }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="alertStatus.warning.length > 0" class="bg-warning/5 p-4 rounded-lg flex items-start gap-3 border-0">
        <div class="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center shrink-0">
          <Info class="w-5 h-5 text-warning" />
        </div>
        <div class="flex-1">
          <p class="text-xs font-bold text-warning uppercase tracking-tight mb-1">Mendekati Batas (85%+)</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="b in alertStatus.warning" :key="b.category" class="text-[10px] font-bold text-text-primary bg-warning/10 px-2 py-0.5 rounded-md border border-warning/20">
              {{ b.category }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- categories List -->
    <div class="space-y-1">
      <div
        v-for="cat in allCategories"
        :key="cat"
        class="py-4 border-b border-border-ui/35 transition-all group flex flex-col gap-3"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div :class="[
              'p-2 rounded-lg transition-colors',
              isOver(cat) ? 'bg-danger/10 text-danger' : 'bg-bg-main text-accent group-hover:bg-accent/10'
            ]">
              <component :is="getCategoryIcon(cat)" class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-text-primary tracking-tight leading-none text-sm">{{ cat }}</h4>
                <span v-if="isOver(cat)" class="text-[9px] font-black text-danger uppercase tracking-wider bg-danger/10 px-2 py-0.5 rounded-full">Over Limit</span>
                <span v-else-if="isWarning(cat)" class="text-[9px] font-black text-warning uppercase tracking-wider bg-warning/10 px-2 py-0.5 rounded-full">Mendekati Limit</span>
              </div>
            </div>
          </div>

          <div class="flex gap-1">
            <button
              @click="startEdit(cat)"
              class="p-2 text-text-secondary hover:text-accent rounded-lg transition-colors"
              title="Edit Limit"
            >
              <Edit2 class="w-4 h-4" />
            </button>
            <button
              @click="$emit('delete', cat)"
              class="p-2 text-text-secondary hover:text-danger rounded-lg transition-colors"
              title="Hapus Kategori"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Budget progress & metrics -->
        <div class="space-y-2">
          <div class="flex justify-between text-xs">
            <div class="flex flex-col">
              <span class="text-[9px] text-text-secondary uppercase tracking-widest font-medium">Terpakai</span>
              <span :class="['font-bold currency-font', isOver(cat) ? 'text-danger' : 'text-text-primary']">{{ formatCurrency(getSpent(cat)) }}</span>
            </div>
            <div class="flex flex-col text-right">
              <span class="text-[9px] text-text-secondary uppercase tracking-widest font-medium">Limit</span>
              <span class="font-bold text-text-primary currency-font">{{ formatCurrency(getLimit(cat)) }}</span>
            </div>
          </div>

          <div class="h-1.5 bg-bg-main rounded-full overflow-hidden">
            <div
              :class="[
                'h-full rounded-full transition-all duration-500',
                isOver(cat) ? 'bg-danger' : isWarning(cat) ? 'bg-warning' : 'bg-accent'
              ]"
              :style="{ width: `${Math.min((getSpent(cat) / getLimit(cat)) * 100, 100)}%` }"
            />
          </div>

          <div class="flex justify-between items-center text-[10px]">
            <span v-if="getLimit(cat) - getSpent(cat) >= 0" class="text-text-secondary">
              Sisa Limit: <span class="font-bold text-success currency-font">{{ formatCurrency(getLimit(cat) - getSpent(cat)) }}</span>
            </span>
            <span class="text-danger font-bold" v-else>Over Limit!</span>
            
            <span class="text-text-secondary font-bold currency-font">
              {{ Math.round((getSpent(cat) / getLimit(cat)) * 100) }}%
            </span>
          </div>
        </div>

        <div v-if="editing === cat" class="mt-2 p-3 bg-bg-main rounded-lg space-y-3">
          <input
            type="text"
            v-model="newLimit"
            @input="newLimit = formatInputNumber(newLimit)"
            class="w-full py-2 text-text-primary outline-none text-xs"
            placeholder="Limit Anggaran"
            autofocus
          />
          <div class="flex gap-2">
            <button
              @click="saveEdit(cat)"
              class="flex-1 bg-gradient-to-r from-accent to-secondary text-white py-2 rounded-lg text-[10px] font-bold shadow-lg shadow-accent/20"
            >
              SIMPAN
            </button>
            <button @click="editing = null" class="flex-1 bg-danger/10 text-danger py-2 rounded-lg text-[10px] font-bold">
              BATAL
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-[10000] flex sm:p-4 overflow-y-auto items-center justify-center">
        <div @click="showAddModal = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <div class="relative bg-bg-main p-8 sm:rounded-2xl shadow-lg w-full sm:max-w-sm z-10 border-0">
          <h3 class="text-lg font-bold text-text-primary mb-6">Tambah Kategori Anggaran</h3>
          <div class="space-y-4">
            <input
              type="text"
              v-model="customCategory"
              placeholder="Nama Kategori (Contoh: Liburan)"
              class="w-full py-3 text-text-primary outline-none"
              autofocus
            />
            <button
              @click="addCustomCategory"
              class="w-full py-4 bg-gradient-to-r from-accent to-secondary text-white rounded-lg font-bold hover:shadow-lg hover:shadow-accent/20 transition-all"
            >
              Lanjut ke Limit
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 50/30/20 Info Modal -->
    <Teleport to="body">
      <div v-if="showInfoModal" class="fixed inset-0 z-[10000] flex sm:p-4 items-center justify-center">
        <div @click="showInfoModal = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <div class="relative bg-bg-main sm:rounded-2xl shadow-lg w-full h-[100dvh] sm:h-auto sm:max-w-4xl mx-auto z-10 overflow-hidden flex flex-col max-h-full sm:max-h-[90vh] border-0">
          <div class="flex justify-between items-center p-6 border-0 shrink-0">
            <h3 class="text-xl font-black text-text-primary flex items-center gap-2">
              <ShieldCheck class="w-6 h-6 text-success" />
              Aturan 50/30/20
            </h3>
            <button @click="showInfoModal = false" class="p-2 hover:bg-bg-main rounded-lg text-text-secondary transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
            <div class="space-y-8">
              <div class="text-center max-w-2xl mx-auto">
                <p class="text-base text-text-primary font-bold mb-2">Kelola Keuangan dengan Lebih Pintar</p>
                <p class="text-sm text-text-secondary leading-relaxed font-medium">
                  Aturan 50/30/20 adalah metode penganggaran yang membagi penghasilan setelah pajak Anda menjadi tiga kategori utama untuk mencapai keseimbangan antara gaya hidup dan masa depan.
                </p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div class="p-6 bg-accent/5 border-0 rounded-lg hover:bg-accent/10 transition-all group relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                  <div class="flex flex-col items-center text-center gap-4">
                    <div class="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center text-accent shadow-sm">
                      <LayoutGrid class="w-7 h-7" />
                    </div>
                    <div>
                      <h4 class="font-bold text-accent text-lg">50% Needs</h4>
                      <p class="text-[10px] text-accent/60 font-black uppercase tracking-widest mt-0.5">Kebutuhan Pokok</p>
                    </div>
                    <p class="text-xs text-text-secondary leading-relaxed">
                      Makan, tagihan (listrik/air), transportasi, dan kesehatan. Pengeluaran wajib untuk kelangsungan hidup.
                    </p>
                  </div>
                </div>
                                <div class="p-6 bg-secondary/5 border-0 rounded-lg hover:bg-secondary/10 transition-all group relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-16 h-16 bg-secondary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                  <div class="flex flex-col items-center text-center gap-4">
                    <div class="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary shadow-sm">
                      <Wallet class="w-7 h-7" />
                    </div>
                    <div>
                      <h4 class="font-bold text-secondary text-lg">30% Wants</h4>
                      <p class="text-[10px] text-secondary/60 font-black uppercase tracking-widest mt-0.5">Keinginan &amp; Gaya Hidup</p>
                    </div>
                    <p class="text-xs text-text-secondary leading-relaxed">
                      Liburan, hiburan, belanja hobi, dan makan di luar. Fleksibel dan bisa dikurangi jika diperlukan.
                    </p>
                  </div>
                </div>
                                <div class="p-6 bg-success/5 border-0 rounded-lg hover:bg-success/10 transition-all group relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                  <div class="flex flex-col items-center text-center gap-4">
                    <div class="w-14 h-14 bg-success/10 rounded-lg flex items-center justify-center text-success shadow-sm">
                      <CheckCircle2 class="w-7 h-7" />
                    </div>
                    <div>
                      <h4 class="font-bold text-success text-lg">20% Savings</h4>
                      <p class="text-[10px] text-success/60 font-black uppercase tracking-widest mt-0.5">Tabungan &amp; Hutang</p>
                    </div>
                    <p class="text-xs text-text-secondary leading-relaxed">
                      Dana darurat, investasi pensiun, atau melunasi cicilan. Modal untuk kemandirian finansial Anda.
                    </p>
                  </div>
                </div>
              </div>
                            <div class="bg-bg-main p-6 rounded-lg border-0 relative overflow-hidden">
                <div class="flex items-start gap-4">
                  <div class="p-2 bg-accent/10 rounded-lg text-accent">
                    <Info class="w-5 h-5" />
                  </div>
                  <div class="space-y-2">
                    <p class="text-xs text-text-primary font-bold">Bagaimana Sistem Kami Menghitung?</p>
                    <p class="text-[11px] text-text-secondary leading-relaxed">
                      Aplikasi <span class="text-accent font-bold">Vinance</span> secara otomatis mengelompokkan kategori Anda: <br/>
                      - <span class="font-bold">Needs:</span> Makanan, Tagihan, Transportasi, &amp; Kesehatan <br/>
                      - <span class="font-bold">Wants:</span> Belanja, Hiburan, &amp; Lainnya <br/>
                      - <span class="font-bold">Savings:</span> Dihitung dari Sisa Penghasilan (Total Pendapatan - Total Anggaran)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

           <div class="p-6 md:p-8 border-0 shrink-0 bg-bg-main">
            <button
              @click="showInfoModal = false"
              class="w-full px-5 py-4 bg-gradient-to-r from-accent to-secondary text-white rounded-lg font-black hover:shadow-xl hover:shadow-accent/20 transition-all text-sm shadow-lg tracking-wide"
            >
              SAYA MENGERTI
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Tips Section -->
    <div class="bg-transparent p-0 flex flex-col md:flex-row gap-6 items-center border-0 relative z-10">
      <div class="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
        <TrendingUp class="w-8 h-8" />
      </div>
      <div class="flex-1 space-y-1">
        <h4 class="font-bold text-text-primary">Gunakan Aturan 50/30/20</h4>
        <p class="text-xs text-text-secondary leading-relaxed">
          Sistem kami mendeteksi alokasi Anda secara otomatis. Pastikan Kebutuhan Pokok Anda (Needs) tidak melebihi 50% dari total penghasilan untuk menjaga keseimbangan finansial.
        </p>
      </div>
      <button @click="showInfoModal = true" class="px-6 py-3 bg-bg-main/60 rounded-lg text-xs font-bold text-text-primary hover:bg-bg-main transition-colors flex items-center gap-2 border-0">
        Pelajari Lebih Lanjut <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  Edit2, AlertCircle, TrendingUp, Wallet, CheckCircle2,
  Plus, Trash2, PieChart as PieIcon, ArrowRight, ShieldCheck,
  Info, X, ArrowDownRight, Utensils, Car, ShoppingBag, Receipt,
  Gamepad2, HeartPulse, LayoutGrid
} from '@lucide/vue';
import type { Budget, Transaction } from '../types';
import { registerModal, unregisterModal } from '../composables/useAppState';
import { formatCurrency, formatInputNumber, parseInputNumber } from '../lib/utils';

interface Props {
  budgets: Budget[];
  transactions: Transaction[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [category: string, limit: number];
  delete: [category: string];
}>();

const editing = ref<string | null>(null);
const newLimit = ref('');
const showAddModal = ref(false);
const showInfoModal = ref(false);
const customCategory = ref('');
const isMobile = ref(false);

watch(showAddModal, (newVal) => {
  if (newVal) {
    registerModal('budgets-add', () => { showAddModal.value = false; });
  } else {
    unregisterModal('budgets-add');
  }
});

watch(showInfoModal, (newVal) => {
  if (newVal) {
    registerModal('budgets-info', () => { showInfoModal.value = false; });
  } else {
    unregisterModal('budgets-info');
  }
});

const defaultCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'];

const allCategories = computed(() => {
  const existingCats = props.budgets.map(b => b.category);
  return Array.from(new Set([...defaultCategories, ...existingCats]));
});

const getSpent = (category: string) => {
  return props.transactions
    .filter(t => t.type === 'Expense' && t.category === category)
    .reduce((acc, t) => acc + Number(t.amount), 0);
};

const totalIncome = computed(() => {
  return props.transactions
    .filter(t => t.type === 'Income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
});

const totalBudget = computed(() => props.budgets.reduce((acc, b) => acc + Number(b.limit), 0));
const totalSpent = computed(() => allCategories.value.reduce((acc, cat) => acc + getSpent(cat), 0));
const totalRemaining = computed(() => totalBudget.value - totalSpent.value);
const unallocated = computed(() => totalIncome.value - totalBudget.value);

// Chart Data mapping for ApexCharts
const chartSeries = computed(() => 
  props.budgets
    .filter(b => Number(b.limit) > 0)
    .map(b => Number(b.limit))
);

const chartOptions = computed(() => {
  const labels = props.budgets
    .filter(b => Number(b.limit) > 0)
    .map(b => b.category);
  
  return {
    chart: {
      type: 'donut',
    },
    labels,
    colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: props.transactions.length > 0 ? '#64748b' : '#94a3b8'
      }
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrency(val)
      }
    }
  };
});

const rule503020 = computed(() => {
  const categories50 = ['Makanan', 'Tagihan', 'Transportasi', 'Kesehatan'];
  const categories30 = ['Belanja', 'Hiburan', 'Lainnya'];

  const needsSpent = allCategories.value.filter(cat => categories50.some(c => c.toLowerCase() === cat.toLowerCase())).reduce((sum, cat) => sum + getSpent(cat), 0);
  const wantsSpent = allCategories.value.filter(cat => categories30.some(c => c.toLowerCase() === cat.toLowerCase())).reduce((sum, cat) => sum + getSpent(cat), 0);

  const totalSpentActual = allCategories.value.reduce((sum, cat) => sum + getSpent(cat), 0);
  const actualSavings = totalIncome.value - totalSpentActual;

  const needsPct = totalIncome.value > 0 ? (needsSpent / totalIncome.value) * 100 : 0;
  const wantsPct = totalIncome.value > 0 ? (wantsSpent / totalIncome.value) * 100 : 0;
  const savingsPct = totalIncome.value > 0 ? (Math.max(0, actualSavings) / totalIncome.value) * 100 : 0;

  return { needsPct, wantsPct, savingsPct };
});

const alertStatus = computed(() => {
  const critical = props.budgets.filter(b => {
    const spent = getSpent(b.category);
    return spent > Number(b.limit) && Number(b.limit) > 0;
  });
  const warning = props.budgets.filter(b => {
    const spent = getSpent(b.category);
    const limit = Number(b.limit);
    return spent > limit * 0.85 && spent <= limit && limit > 0;
  });
  return { critical, warning };
});

const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  const entry = Object.entries(CATEGORY_ICONS).find(([key]) => key.toLowerCase() === normalized);
  return entry ? entry[1] : Wallet;
};

const getLimit = (cat: string) => {
  const b = props.budgets.find(item => item.category === cat);
  return b ? Number(b.limit) : 0;
};

const isOver = (cat: string) => {
  const limit = getLimit(cat);
  const spent = getSpent(cat);
  return spent > limit && limit > 0;
};

const isWarning = (cat: string) => {
  const limit = getLimit(cat);
  const spent = getSpent(cat);
  return spent > limit * 0.85 && spent <= limit && limit > 0;
};

const startEdit = (cat: string) => {
  editing.value = cat;
  const limit = getLimit(cat);
  newLimit.value = limit > 0 ? formatInputNumber(limit.toString()) : '';
};

const saveEdit = (cat: string) => {
  emit('update', cat, Number(parseInputNumber(newLimit.value)));
  editing.value = null;
};

const addCustomCategory = () => {
  if (customCategory.value) {
    editing.value = customCategory.value;
    newLimit.value = '';
    showAddModal.value = false;
    customCategory.value = '';
  }
};

const CATEGORY_ICONS: Record<string, any> = {
  'Makanan': Utensils,
  'Transportasi': Car,
  'Belanja': ShoppingBag,
  'Tagihan': Receipt,
  'Hiburan': Gamepad2,
  'Kesehatan': HeartPulse,
  'Lainnya': Wallet,
};

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

watch([showAddModal, showInfoModal], ([newAdd, newInfo]) => {
  if (newAdd || newInfo) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.body.style.overflow = '';
});
</script>

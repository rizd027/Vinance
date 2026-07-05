<template>
  <div class="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
    <!-- Header & Filter -->
    <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
      <div class="hidden lg:flex flex-col gap-1">
        <h2 class="text-3xl font-black text-text-primary tracking-tighter leading-none">Analisis Laporan</h2>
        <div class="flex items-center gap-2 mt-1.5">
          <span class="w-8 h-1 bg-accent rounded-full" />
          <p class="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Ringkasan &amp; Kesehatan Finansial</p>
        </div>
      </div>

      <div class="flex flex-col items-stretch gap-4 w-full xl:w-auto">
        <div class="flex flex-col gap-3 bg-transparent p-0 border-0 shadow-none w-full xl:min-w-[500px]">
          <!-- Top Row: Period & Date Navigator -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <!-- Period Selector -->
            <div class="flex items-center bg-bg-main/60 p-1 rounded-lg flex-1">
              <button
                v-for="p in ['week', 'month', 'year'] as Period[]"
                :key="p"
                @click="changePeriod(p)"
                :class="[
                  'flex-1 px-2 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-500',
                  period === p
                    ? 'bg-card-bg text-accent shadow-none border-0'
                    : 'text-text-secondary hover:text-text-primary'
                ]"
              >
                {{ p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Tahun' }}
              </button>
            </div>

            <!-- Date Navigator -->
            <div class="flex items-center bg-bg-main/60 p-1 rounded-lg sm:min-w-[240px]">
              <button 
                @click="handlePrev"
                class="p-2 hover:bg-accent/10 hover:text-accent rounded-lg text-text-secondary transition-all shrink-0"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>
              
              <button
                @click="resetDate"
                class="flex-1 flex items-center gap-2 px-2 py-2 hover:bg-card-bg rounded-lg transition-all group justify-center"
              >
                <Calendar class="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" />
                <span class="text-[11px] font-black text-text-primary whitespace-nowrap tracking-tight">{{ periodLabel }}</span>
              </button>

              <button 
                @click="handleNext"
                class="p-2 hover:bg-accent/10 hover:text-accent rounded-lg text-text-secondary transition-all shrink-0"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Bottom Row: Primary Action -->
          <button 
            @click="showExportModal = true" 
            class="group relative flex items-center justify-center gap-3 px-6 py-3.5 text-white overflow-hidden rounded-lg transition-all duration-500 shadow-xl shadow-accent/20 hover:shadow-accent/40 active:scale-[0.98]" 
          >
            <div class="absolute inset-0 bg-gradient-to-r from-accent via-secondary to-accent bg-[length:200%_auto]" />
            <div class="relative z-10 flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em]">
              <Download class="w-4 h-4" />
              <span>Export Laporan Lengkap</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-transparent p-0 border-0 flex flex-col justify-between min-h-[90px]">
        <div class="flex justify-between items-start mb-3">
          <div class="p-1.5 bg-bg-main rounded-lg group-hover:scale-110 transition-transform">
            <Wallet class="w-4 h-4" />
          </div>
          <div :class="['text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-widest', stats.balance >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger']">
            {{ stats.balance >= 0 ? 'NAIK' : 'TURUN' }}
          </div>
        </div>
        <div>
          <p class="text-[9px] text-text-secondary font-medium uppercase tracking-widest mb-0.5">Saldo Netto</p>
          <p :class="['text-base font-bold truncate tracking-tight currency-font', stats.balance >= 0 ? 'text-text-primary' : 'text-danger']">
            {{ formatCurrency(stats.balance) }}
          </p>
        </div>
      </div>

      <div class="bg-transparent p-0 border-0 flex flex-col justify-between min-h-[90px]">
        <div class="flex justify-between items-start mb-3">
          <div class="p-1.5 bg-bg-main rounded-lg group-hover:scale-110 transition-transform">
            <ArrowUpRight class="w-4 h-4" />
          </div>
        </div>
        <div>
          <p class="text-[9px] text-text-secondary font-medium uppercase tracking-widest mb-0.5">Total Pemasukan</p>
          <p class="text-base font-bold truncate tracking-tight currency-font text-success">
            {{ formatCurrency(stats.income) }}
          </p>
        </div>
      </div>

      <div class="bg-transparent p-0 border-0 flex flex-col justify-between min-h-[90px]">
        <div class="flex justify-between items-start mb-3">
          <div class="p-1.5 bg-bg-main rounded-lg group-hover:scale-110 transition-transform">
            <ArrowDownRight class="w-4 h-4" />
          </div>
        </div>
        <div>
          <p class="text-[9px] text-text-secondary font-medium uppercase tracking-widest mb-0.5">Total Pengeluaran</p>
          <p class="text-base font-bold truncate tracking-tight currency-font text-danger">
            {{ formatCurrency(stats.expense) }}
          </p>
        </div>
      </div>

      <div class="bg-transparent p-0 border-0 flex flex-col justify-between min-h-[90px]">
        <div class="flex justify-between items-start mb-3">
          <div class="p-1.5 bg-bg-main rounded-lg group-hover:scale-110 transition-transform">
            <TrendingUp class="w-4 h-4" />
          </div>
        </div>
        <div>
          <p class="text-[9px] text-text-secondary font-medium uppercase tracking-widest mb-0.5">Savings Rate</p>
          <p class="text-base font-bold truncate tracking-tight currency-font text-accent">
            {{ stats.savingsRate.toFixed(1) }}%
          </p>
        </div>
      </div>
    </div>

    <!-- Cash Flow Trend Area Chart -->
    <div class="bg-transparent p-0 border-0">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-accent" />
          Tren Arus Kas
        </h3>
        <div class="flex items-center gap-4 text-[10px] font-bold">
          <span class="flex items-center gap-1.5 text-text-secondary">
            <span class="w-3 h-3 rounded-full bg-[#10b981] inline-block shadow-sm" /> Pemasukan
          </span>
          <span class="flex items-center gap-1.5 text-text-secondary">
            <span class="w-3 h-3 rounded-full bg-[#ef4444] inline-block shadow-sm" /> Pengeluaran
          </span>
        </div>
      </div>
      <div v-if="trendData.length === 0" class="h-64 flex flex-col items-center justify-center gap-3 text-text-secondary">
        <BarChart2 class="w-10 h-10 opacity-20" />
        <p class="text-xs font-medium">Tidak ada data untuk periode ini</p>
      </div>
      <div v-else class="h-72 w-full">
        <apexchart type="area" height="280" :options="areaChartOptions" :series="areaChartSeries" />
      </div>
    </div>

    <!-- 2-column Chart Area -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-transparent p-0 border-0">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 class="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
            <BarChart2 class="w-4 h-4 text-accent" />
            Pemasukan vs Pengeluaran
          </h3>
        </div>
        <div v-if="trendData.length === 0" class="h-48 flex items-center justify-center text-text-secondary text-xs">Tidak ada data</div>
        <div v-else class="h-52 w-full">
          <apexchart type="bar" height="200" :options="barChartOptions" :series="barChartSeries" />
        </div>
      </div>

      <div class="bg-transparent p-0 border-0 flex flex-col">
        <h3 class="text-xs font-black text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <PieIcon class="w-4 h-4 text-secondary" />
          Alokasi Biaya
        </h3>
        <div v-if="categoryData.length === 0" class="flex-1 flex items-center justify-center text-xs text-text-secondary">Tidak ada pengeluaran</div>
        <div v-else class="flex flex-col gap-4 flex-1">
          <div class="h-44 w-full flex items-center justify-center">
            <apexchart type="donut" height="170" :options="pieChartOptions" :series="pieChartSeries" />
          </div>
          <div v-for="(item, index) in categoryData" :key="item.name" class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: COLORS[index % COLORS.length] }" />
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-0.5">
                <span class="text-[10px] font-bold text-text-primary truncate">{{ item.name }}</span>
                <span class="text-[10px] font-bold text-text-secondary ml-2">{{ ((item.value / stats.expense) * 100).toFixed(0) }}%</span>
              </div>
              <div class="h-1 bg-bg-main rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :style="{ backgroundColor: COLORS[index % COLORS.length], width: `${((item.value / stats.expense) * 100).toFixed(0)}%` }"
                />
              </div>
            </div>
            <div class="flex items-center gap-1">
              <ArrowDownRight class="w-2.5 h-2.5 text-danger shrink-0" />
              <span class="text-[10px] font-bold text-text-primary shrink-0 currency-font">{{ formatCurrency(item.value) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Financial Health + Top Expenses -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-transparent p-0 border-0">
        <h3 class="text-xs font-black text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
          <ShieldCheck class="w-4 h-4 text-success" />
          Kesehatan Finansial
        </h3>
        <div class="flex flex-col gap-5">
          <div class="flex items-center justify-between">
            <p class="text-sm font-bold text-text-primary">Skor Kesehatan</p>
            <span :class="['text-2xl font-bold', healthScore.color]">{{ healthScore.label }}</span>
          </div>
          <div class="h-1.5 bg-bg-main rounded-full overflow-hidden">
            <div
              :class="['h-full rounded-full', healthScore.score >= 75 ? 'bg-success' : healthScore.score >= 50 ? 'bg-warning' : 'bg-danger']"
              :style="{ width: `${healthScore.score}%` }"
            />
          </div>
          <div class="grid grid-cols-3 gap-3 pt-2">
            <div v-for="(item, i) in [
              { label: 'Aturan 50%\nKebutuhan', pct: stats.income > 0 ? Math.round((stats.expense / stats.income) * 100) : 0, target: 50, color: '#6366f1' },
              { label: 'Target 20%\nTabungan', pct: Math.round(Math.max(stats.savingsRate, 0)), target: 20, color: '#10b981' },
              { label: 'Rasio\nUtilisasi', pct: stats.income > 0 ? Math.round((stats.expense / stats.income) * 100) : 0, target: 80, color: '#f59e0b' },
            ]" :key="i" class="text-center p-3 bg-bg-main/50 rounded-lg">
              <p class="text-lg font-bold currency-font" :style="{ color: item.color }">{{ item.pct }}%</p>
              <p class="text-[9px] text-text-secondary whitespace-pre-line leading-tight mt-1 font-medium">{{ item.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-transparent p-0 border-0">
        <h3 class="text-xs font-black text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
          <Award class="w-4 h-4 text-warning" />
          Top Pengeluaran
        </h3>
        <div v-if="topExpenses.length === 0" class="flex items-center justify-center h-40 text-xs text-text-secondary">Tidak ada pengeluaran</div>
        <div v-else class="space-y-3">
          <div v-for="t in topExpenses" :key="t.id" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center text-danger shrink-0">
              <component :is="getCategoryIcon(t.category)" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold text-text-primary uppercase tracking-wide truncate">{{ t.category }}</p>
              <p class="text-[9px] text-text-secondary truncate">{{ format(new Date(t.date), 'dd MMM yyyy, HH:mm', { locale: localeId }) }}</p>
            </div>
            <div class="flex items-center gap-1">
              <ArrowDownRight class="w-3 h-3 text-danger shrink-0" />
              <p class="text-xs font-bold text-danger shrink-0 currency-font">-{{ formatCurrency(t.amount) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <Teleport to="body">
      <div v-if="showExportModal" class="fixed inset-0 z-50 flex sm:p-4 items-center justify-center">
        <div @click="showExportModal = false" class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div class="relative w-full h-full sm:h-auto sm:max-w-sm bg-bg-main sm:rounded-2xl shadow-lg border-0 overflow-hidden z-10 my-auto">
          <div class="flex items-center justify-between p-5 border-0">
            <h3 class="text-sm font-bold text-text-primary flex items-center gap-2">
              <Download class="w-4 h-4 text-accent" />
              Export Laporan
            </h3>
            <button @click="showExportModal = false" class="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-lg transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="p-5 grid grid-cols-2 gap-3">
            <button
              v-for="fmt in [
                { id: 'xlsx', label: 'Excel', icon: FileSpreadsheet, color: 'text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/5' },
                { id: 'csv', label: 'CSV', icon: FileText, color: 'text-slate-500 hover:border-slate-500 hover:bg-slate-500/5' },
                { id: 'pdf', label: 'PDF', icon: FileText, color: 'text-rose-500 hover:border-rose-500 hover:bg-rose-500/5' },
                { id: 'docx', label: 'Word', icon: FileText, color: 'text-blue-500 hover:border-blue-500 hover:bg-blue-500/5' },
              ]"
              :key="fmt.id"
              @click="handleExportFormat(fmt.id as any)"
              :class="['flex flex-col items-center gap-2 p-4 rounded-lg border-0 bg-bg-main/50 transition-all group', fmt.color]"
            >
              <div class="w-10 h-10 rounded-full bg-current/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <component :is="fmt.icon" class="w-5 h-5" />
              </div>
              <span class="text-xs font-bold text-text-primary">{{ fmt.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, ShieldCheck, Award,
  BarChart2, Utensils, Car, ShoppingBag, Receipt, Gamepad2, HeartPulse,
  Download, X, ChevronLeft, ChevronRight, Calendar, FileSpreadsheet, FileText, PieChart as PieIcon
} from '@lucide/vue';
import type { Transaction } from '../types';
import { formatCurrency } from '../lib/utils';
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear,
  isWithinInterval, format, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { exportReportPDF, exportReportExcel, exportReportCSV, exportReportDocx } from '../lib/exportUtils';

interface Props {
  transactions: Transaction[];
}

const props = defineProps<Props>();

type Period = 'week' | 'month' | 'year';

const period = ref<Period>('month');
const selectedDate = ref(new Date());
const isMobile = ref(false);
const showExportModal = ref(false);

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

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

const filteredTransactions = computed(() => {
  let start: Date, end: Date;

  if (period.value === 'week') {
    start = startOfWeek(selectedDate.value, { weekStartsOn: 1 });
    end = endOfWeek(selectedDate.value, { weekStartsOn: 1 });
  } else if (period.value === 'month') {
    start = startOfMonth(selectedDate.value);
    end = endOfMonth(selectedDate.value);
  } else {
    start = startOfYear(selectedDate.value);
    end = endOfYear(selectedDate.value);
  }

  return props.transactions.filter(t =>
    isWithinInterval(new Date(t.date), { start, end })
  );
});

const stats = computed(() => {
  const income = filteredTransactions.value
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = filteredTransactions.value
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  return { income, expense, balance, savingsRate };
});

const categoryData = computed(() => {
  return filteredTransactions.value
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
});

const trendData = computed(() => {
  const groups: Record<string, { name: string, income: number, expense: number }> = {};

  filteredTransactions.value.forEach(t => {
    const dateVal = new Date(t.date);
    const label = period.value === 'year'
      ? format(dateVal, 'MMM', { locale: localeId })
      : format(dateVal, 'dd MMM', { locale: localeId });

    if (!groups[label]) {
      groups[label] = { name: label, income: 0, expense: 0 };
    }
    if (t.type === 'Income') groups[label].income += Number(t.amount);
    else groups[label].expense += Number(t.amount);
  });

  return Object.values(groups);
});

const topExpenses = computed(() => {
  return filteredTransactions.value
    .filter(t => t.type === 'Expense')
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);
});

const healthScore = computed(() => {
  if (stats.value.income === 0) return { score: 0, label: 'Tidak ada data', color: 'text-text-secondary' };
  if (stats.value.savingsRate >= 30) return { score: 100, label: 'Sangat Sehat', color: 'text-success' };
  if (stats.value.savingsRate >= 20) return { score: 75, label: 'Sehat', color: 'text-success' };
  if (stats.value.savingsRate >= 10) return { score: 50, label: 'Cukup', color: 'text-warning' };
  return { score: 25, label: 'Perlu Perhatian', color: 'text-danger' };
});

const periodLabel = computed(() => {
  if (period.value === 'week') {
    const start = startOfWeek(selectedDate.value, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate.value, { weekStartsOn: 1 });
    return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`;
  }
  if (period.value === 'month') return format(selectedDate.value, 'MMMM yyyy', { locale: localeId });
  return format(selectedDate.value, 'yyyy');
});

const changePeriod = (p: Period) => {
  period.value = p;
  selectedDate.value = new Date();
};

const handlePrev = () => {
  if (period.value === 'week') selectedDate.value = subWeeks(selectedDate.value, 1);
  else if (period.value === 'month') selectedDate.value = subMonths(selectedDate.value, 1);
  else selectedDate.value = subYears(selectedDate.value, 1);
};

const handleNext = () => {
  if (period.value === 'week') selectedDate.value = addWeeks(selectedDate.value, 1);
  else if (period.value === 'month') selectedDate.value = addMonths(selectedDate.value, 1);
  else selectedDate.value = addYears(selectedDate.value, 1);
};

const resetDate = () => {
  selectedDate.value = new Date();
};

const handleExportFormat = (fmt: 'pdf' | 'xlsx' | 'csv' | 'docx') => {
  const periodStr = period.value === 'week' ? 'Mingguan' : period.value === 'month' ? 'Bulanan' : 'Tahunan';
  switch (fmt) {
    case 'pdf': exportReportPDF(filteredTransactions.value, periodStr, stats.value); break;
    case 'xlsx': exportReportExcel(filteredTransactions.value, periodStr, stats.value); break;
    case 'csv': exportReportCSV(filteredTransactions.value, periodStr, stats.value); break;
    case 'docx': exportReportDocx(filteredTransactions.value, periodStr, stats.value); break;
  }
  showExportModal.value = false;
};

// ApexCharts Options Configurations
const areaChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    fontFamily: 'inherit',
  },
  colors: ['#10b981', '#ef4444'],
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: trendData.value.map(d => d.name),
    labels: { style: { colors: '#94a3b8', fontSize: '10px' } }
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '9px' },
      formatter: (v: number) => {
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}jt`;
        if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
        return String(v);
      }
    }
  },
  dataLabels: { enabled: false },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.25,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  },
  tooltip: {
    y: {
      formatter: (val: number) => formatCurrency(val)
    }
  }
}));

const areaChartSeries = computed(() => [
  { name: 'Pemasukan', data: trendData.value.map(d => d.income) },
  { name: 'Pengeluaran', data: trendData.value.map(d => d.expense) },
]);

const barChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false }
  },
  colors: ['#10b981', '#ef4444'],
  xaxis: {
    categories: trendData.value.map(d => d.name),
    labels: { style: { colors: '#94a3b8', fontSize: '9px' } }
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '9px' },
      formatter: (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${(v / 1_000).toFixed(0)}rb`
    }
  },
  dataLabels: { enabled: false },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '50%',
    }
  },
  tooltip: {
    y: {
      formatter: (val: number) => formatCurrency(val)
    }
  }
}));

const barChartSeries = computed(() => [
  { name: 'Pemasukan', data: trendData.value.map(d => d.income) },
  { name: 'Pengeluaran', data: trendData.value.map(d => d.expense) }
]);

const pieChartOptions = computed(() => ({
  chart: {
    type: 'donut'
  },
  labels: categoryData.value.map(c => c.name),
  colors: COLORS,
  dataLabels: { enabled: false },
  legend: { show: false },
  tooltip: {
    y: {
      formatter: (val: number) => formatCurrency(val)
    }
  }
}));

const pieChartSeries = computed(() => categoryData.value.map(c => c.value));

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="space-y-6 pb-4">
    <!-- Header Title (Desktop only) -->
    <div class="hidden lg:flex flex-col gap-1 mb-2">
      <h2 class="text-2xl font-black text-text-primary tracking-tight leading-none">Eksplorasi Fitur</h2>
      <p class="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Navigasi Seluruh Modul Keuangan</p>
      <div class="h-1 w-12 bg-gradient-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
    </div>

    <!-- Premium Feature Showcase Card -->
    <div class="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#1A2C5B] via-[#2d4992] to-[#15254e] shadow-none border-0">
      <div class="absolute inset-0 bg-[url('/doodle_wallpaper.png')] bg-repeat bg-[length:150px_150px] opacity-10 mix-blend-soft-light" />
      <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
      
      <div class="relative">
        <span class="text-[9px] font-black text-amber-500 bg-amber-500/15 border-0 px-2 py-0.5 rounded-full uppercase tracking-widest">✦ Vinance Ecosystem</span>
        <h3 class="text-base font-black text-white mt-2.5 leading-tight tracking-tight">Vinance</h3>
        <p class="text-[10px] text-white/80 mt-1 font-semibold leading-relaxed">
          Kelola seluruh rencana anggaran, analisis grafik, tabungan, dan memo Anda secara premium dalam satu ekosistem finansial.
        </p>
      </div>
    </div>

    <!-- Menu List Section -->
    <div class="space-y-4 pt-2">
      <p class="text-[10px] font-black text-text-secondary/80 uppercase tracking-[0.25em] mb-1 px-1">Daftar Modul Utama</p>
      <div class="divide-y divide-border-ui/35">
        
        <!-- 1. TRANSACTIONS -->
        <button
          @click="$emit('navigate', 'transactions')"
          class="w-full flex items-center gap-4 py-4 px-2 hover:bg-indigo-500/[0.03] active:bg-indigo-500/[0.06] transition-all group text-left"
        >
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform">
            <ListIcon class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-1.5">
              <p class="text-sm font-bold text-text-primary tracking-tight">Catatan Transaksi</p>
              <span class="text-[8px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Transaksi</span>
            </div>
            <p class="text-[10px] text-text-secondary font-medium mt-0.5">Catat pemasukan, pengeluaran, dan audit saldo kas Anda</p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
        </button>

        <!-- 2. BUDGETING -->
        <button
          @click="$emit('navigate', 'budgets')"
          class="w-full flex items-center gap-4 py-4 px-2 hover:bg-emerald-500/[0.03] active:bg-emerald-500/[0.06] transition-all group text-left"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform">
            <Target class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-1.5">
              <p class="text-sm font-bold text-text-primary tracking-tight">Manajemen Anggaran</p>
              <span class="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Budgeting</span>
            </div>
            <p class="text-[10px] text-text-secondary font-medium mt-0.5">Kelola pos pengeluaran dan limit belanja bulanan</p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
        </button>

        <!-- 3. LAPORAN -->
        <button
          @click="$emit('navigate', 'reports')"
          class="w-full flex items-center gap-4 py-4 px-2 hover:bg-blue-500/[0.03] active:bg-blue-500/[0.06] transition-all group text-left"
        >
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
            <PieChart class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-1.5">
              <p class="text-sm font-bold text-text-primary tracking-tight">Analisis Laporan</p>
              <span class="text-[8px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Grafik</span>
            </div>
            <p class="text-[10px] text-text-secondary font-medium mt-0.5">Visualisasi arus kas masuk dan analisis alokasi dana</p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
        </button>

        <!-- 4. GOALS -->
        <button
          @click="$emit('navigate', 'goals')"
          class="w-full flex items-center gap-4 py-4 px-2 hover:bg-amber-500/[0.03] active:bg-amber-500/[0.06] transition-all group text-left"
        >
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
            <Flag class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-1.5">
              <p class="text-sm font-bold text-text-primary tracking-tight">Target Tabungan</p>
              <span class="text-[8px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Goals</span>
            </div>
            <p class="text-[10px] text-text-secondary font-medium mt-0.5">Pantau progress pencapaian target impian Anda</p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
        </button>

        <!-- 5. NOTES -->
        <button
          @click="$emit('navigate', 'notes')"
          class="w-full flex items-center gap-4 py-4 px-2 hover:bg-fuchsia-500/[0.03] active:bg-fuchsia-500/[0.06] transition-all group text-left"
        >
          <div class="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500 group-hover:scale-105 transition-transform">
            <StickyNote class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-1.5">
              <p class="text-sm font-bold text-text-primary tracking-tight">Catatan Memo</p>
              <span class="text-[8px] font-black text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Notes</span>
            </div>
            <p class="text-[10px] text-text-secondary font-medium mt-0.5">Simpan rencana, tips keuangan, dan memo harian</p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { List as ListIcon, Target, PieChart, Flag, StickyNote, ChevronRight } from '@lucide/vue';

defineEmits<{
  navigate: [tab: string];
}>();
</script>

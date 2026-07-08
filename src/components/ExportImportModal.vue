<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] bg-bg-main flex flex-col overflow-hidden">
      <!-- Modal Header -->
      <div
        class="relative pt-6 pb-6 text-white overflow-hidden shrink-0"
        style="background: linear-gradient(160deg, #0f1f4b 0%, #1A2C5B 45%, #1e3a8a 100%)"
      >
        <div class="absolute top-0 right-0 w-56 h-56 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
        <div class="absolute -bottom-12 -left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div class="relative z-10 w-full max-w-xl mx-auto px-5">
          <div class="flex items-center gap-3">
            <button @click="$emit('close')" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 transition-all">
              <ChevronLeft class="w-5 h-5 stroke-[2.5] text-white" />
            </button>
            <div>
              <h1 class="text-[20px] font-black text-white tracking-tight leading-none">Manajemen Data</h1>
              <p class="text-[9.5px] font-semibold text-white/45 uppercase tracking-[0.2em] mt-1">Export &amp; Import Transaksi</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 relative z-10 overflow-y-auto no-scrollbar bg-bg-main text-text-primary border-0">
        <div class="w-full max-w-xl mx-auto min-h-full px-5 pt-6 pb-12 flex flex-col justify-between gap-6">
          <div class="space-y-6">
            <div class="flex bg-bg-main/50 p-1 rounded-xl border border-border-ui/30 shrink-0">
              <button
                @click="activeTab = 'export'"
                :class="[
                  'flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border-0',
                  activeTab === 'export' ? 'bg-card-bg text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'
                ]"
              >
                <Download class="w-4 h-4" /> Export Data
              </button>
              <button
                @click="activeTab = 'import'"
                :class="[
                  'flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border-0',
                  activeTab === 'import' ? 'bg-card-bg text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'
                ]"
              >
                <Upload class="w-4 h-4" /> Import Data
              </button>
            </div>

            <div>
              <div v-if="activeTab === 'export'" class="grid grid-cols-2 gap-4">
                <button
                  v-for="format in exportFormats"
                  :key="format.id"
                  @click="handleExport(format.id)"
                  :disabled="isProcessing || transactions.length === 0"
                  class="p-4 bg-bg-main/40 border border-border-ui rounded-2xl flex flex-col items-center gap-3 hover:shadow-xl hover:shadow-accent/5 hover:border-accent/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                >
                  <div class="w-12 h-12 bg-card-bg rounded-xl flex items-center justify-center shadow-inner">
                    <FileSpreadsheet v-if="format.icon === 'excel'" class="w-6 h-6 text-emerald-500" />
                    <FileText v-else-if="format.icon === 'csv'" class="w-6 h-6 text-slate-500" />
                    <FileText v-else-if="format.icon === 'pdf'" class="w-6 h-6 text-rose-500" />
                    <FileText v-else class="w-6 h-6 text-blue-500" />
                  </div>
                  <span class="text-[10px] font-bold text-text-primary uppercase tracking-tight">{{ format.label }}</span>
                </button>
              </div>

              <div v-else class="space-y-4">
                <div
                  @click="triggerFileInput"
                  class="border-2 border-dashed border-border-ui rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
                >
                  <div class="w-12 h-12 bg-bg-main rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Loader2 v-if="isProcessing" class="w-6 h-6 text-accent animate-spin" />
                    <Upload v-else class="w-6 h-6 text-text-secondary" />
                  </div>
                  <div class="text-center">
                    <p class="text-sm font-bold text-text-primary">Klik atau seret file ke sini</p>
                    <p class="text-xs text-text-secondary mt-1">Mendukung .xlsx dan .csv</p>
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    class="hidden"
                    accept=".xlsx,.xls,.csv"
                    @change="handleFileUpload"
                    :disabled="isProcessing"
                  />
                </div>

                <div class="bg-bg-main/50 p-4 rounded-xl border border-border-ui flex gap-3">
                  <AlertCircle class="w-5 h-5 text-warning shrink-0" />
                  <p class="text-[10px] text-text-secondary leading-relaxed">
                    <strong>Tips:</strong> Pastikan file memiliki kolom: **Tanggal, Tipe, Kategori, Keterangan, Jumlah**.
                    Tipe harus berisi "Pemasukan" atau "Pengeluaran".
                  </p>
                </div>
              </div>

              <div v-if="error" class="mt-4 p-3 bg-danger/10 text-danger text-xs rounded-lg flex items-center gap-2">
                <AlertCircle class="w-4 h-4" />
                {{ error }}
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-border-ui/40 text-center shrink-0">
            <p class="text-[10px] text-text-secondary font-medium">
              Vinance &bull; Data Aman &amp; Privat
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, FileSpreadsheet, FileText, Download, Upload, Loader2, AlertCircle } from '@lucide/vue';
import type { Transaction } from '../types';
import { exportToExcel, exportToCSV, exportToPDF, exportToDocx } from '../lib/exportUtils';
import * as XLSX from 'xlsx';

interface Props {
  isOpen: boolean;
  transactions: Transaction[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  import: [data: Omit<Transaction, 'id'>[]];
}>();

const activeTab = ref<'export' | 'import'>('export');
const isProcessing = ref(false);
const error = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isMobile = ref(false);

const exportFormats = [
  { id: 'xlsx', label: 'Excel (.xlsx)', icon: 'excel' },
  { id: 'csv', label: 'CSV (.csv)', icon: 'csv' },
  { id: 'pdf', label: 'PDF (.pdf)', icon: 'pdf' },
  { id: 'docx', label: 'Word (.docx)', icon: 'docx' },
] as const;

const handleExport = async (format: 'xlsx' | 'csv' | 'pdf' | 'docx') => {
  isProcessing.value = true;
  error.value = null;
  try {
    switch (format) {
      case 'xlsx': exportToExcel(props.transactions); break;
      case 'csv': exportToCSV(props.transactions); break;
      case 'pdf': exportToPDF(props.transactions); break;
      case 'docx': await exportToDocx(props.transactions); break;
    }
  } catch {
    error.value = 'Gagal mengekspor file';
  } finally {
    isProcessing.value = false;
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isProcessing.value = true;
  error.value = null;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const bstr = event.target?.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      let headerIdx = -1;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] && (rows[i].includes('Tanggal') || rows[i].includes('date')) && (rows[i].includes('Jumlah') || rows[i].includes('amount'))) {
          headerIdx = i;
          break;
        }
      }

      if (headerIdx === -1) {
        throw new Error('Kolom tidak valid. Pastikan ada kolom Tanggal dan Jumlah.');
      }

      const headers = rows[headerIdx];
      const dataRows = rows.slice(headerIdx + 1);
      const importedData: Omit<Transaction, 'id'>[] = [];

      for (const row of dataRows) {
        if (!row || row.length === 0 || (!row[0] && !row[1] && !row[4])) continue;

        const rowObj: any = {};
        headers.forEach((h: string, idx: number) => {
          if (h) rowObj[h] = row[idx];
        });

        const note = String(rowObj['Keterangan'] || rowObj['note'] || '');
        if (note.includes('TOTAL PEMASUKAN') || note.includes('TOTAL PENGELUARAN') || note.includes('SALDO NETTO') || note === 'TOTAL') {
          continue;
        }

        let dateVal = rowObj['Tanggal'] || rowObj['date'];
        let parsedDate = new Date();
        if (dateVal) {
          const tempDate = new Date(dateVal);
          if (!isNaN(tempDate.getTime())) {
            parsedDate = tempDate;
          }
        }

        let typeStr = String(rowObj['Tipe'] || rowObj['type'] || '');
        let type: 'Income' | 'Expense' = (typeStr.toLowerCase().includes('masuk') || typeStr.toLowerCase() === 'income') ? 'Income' : 'Expense';

        let amountVal = rowObj['Jumlah'] || rowObj['amount'] || 0;
        if (typeof amountVal === 'string') {
          amountVal = Number(amountVal.replace(/[^0-9.-]+/g, ''));
        }

        importedData.push({
          userId: '',
          type,
          category: rowObj['Kategori'] || rowObj['category'] || 'Lainnya',
          amount: Number(amountVal),
          date: parsedDate.toISOString(),
          note: note
        });
      }

      if (importedData.length === 0) throw new Error('File kosong atau format tidak sesuai');

      emit('import', importedData);
      emit('close');
    } catch {
      error.value = 'Gagal membaca file. Pastikan format kolom sesuai: Tanggal, Tipe, Kategori, Keterangan, Jumlah.';
    } finally {
      isProcessing.value = false;
    }
  };
  reader.onerror = () => {
    error.value = 'Gagal mengunggah file.';
    isProcessing.value = false;
  };
  reader.readAsBinaryString(file);
};

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

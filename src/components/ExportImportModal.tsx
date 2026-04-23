import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet, FileText, Download, Upload, Loader2, AlertCircle, FileCheck } from 'lucide-react';
import { Transaction } from '../types';
import { exportToExcel, exportToCSV, exportToPDF, exportToDocx } from '../lib/exportUtils';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onImport: (data: Omit<Transaction, 'id'>[]) => void;
}

export default function ExportImportModal({ isOpen, onClose, transactions, onImport }: ExportImportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleExport = async (format: 'xlsx' | 'csv' | 'pdf' | 'docx') => {
    setIsProcessing(true);
    try {
      switch (format) {
        case 'xlsx': exportToExcel(transactions); break;
        case 'csv': exportToCSV(transactions); break;
        case 'pdf': exportToPDF(transactions); break;
        case 'docx': await exportToDocx(transactions); break;
      }
    } catch (err) {
      setError('Gagal mengekspor file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

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

        onImport(importedData);
        onClose();
        alert(`Berhasil mengimpor ${importedData.length} transaksi!`);
      } catch (err) {
        setError('Gagal membaca file. Pastikan format kolom sesuai: Tanggal, Tipe, Kategori, Keterangan, Jumlah.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setError('Gagal mengunggah file.');
      setIsProcessing(false);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      {!isMobile ? (
        isOpen && (
          <div className="fixed inset-0 z-50 flex p-4 items-center justify-center">
            <div
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <div className="relative w-full max-w-lg bg-card-bg rounded-2xl shadow-2xl border border-border-ui overflow-hidden flex flex-col transition-colors mt-4 mx-auto mb-auto">
              <ExportImportContent 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onClose={onClose} 
                handleExport={handleExport} 
                handleFileUpload={handleFileUpload} 
                fileInputRef={fileInputRef} 
                isProcessing={isProcessing} 
                transactions={transactions} 
                error={error} 
              />
            </div>
          </div>
        )
      ) : (
        isOpen && (
          <div className="fixed inset-0 z-50 flex p-4 items-center justify-center">
            <div
              onClick={onClose}
              className="fixed inset-0 bg-black/80"
            />
            <div className="relative w-full bg-card-bg rounded-2xl shadow-xl border border-border-ui overflow-hidden flex flex-col mt-4 mx-auto mb-auto">
              <ExportImportContent 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onClose={onClose} 
                handleExport={handleExport} 
                handleFileUpload={handleFileUpload} 
                fileInputRef={fileInputRef} 
                isProcessing={isProcessing} 
                transactions={transactions} 
                error={error} 
              />
            </div>
          </div>
        )
      )}
    </>
  );
}

function ExportImportContent({ 
  activeTab, setActiveTab, onClose, handleExport, handleFileUpload, fileInputRef, isProcessing, transactions, error 
}: any) {
  return (
    <>
      <div className="p-6 border-b border-border-ui flex justify-between items-center">
        <h3 className="text-lg font-bold text-text-primary">Manajemen Data</h3>
        <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-xl transition-colors">
          <X className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      <div className="flex bg-bg-main/50 p-1 mx-6 mt-4 rounded-xl border border-border-ui shrink-0">
        <button
          onClick={() => setActiveTab('export')}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'export' ? "bg-card-bg text-accent shadow-sm" : "text-text-secondary hover:text-text-primary"
          )}
        >
          <Download className="w-4 h-4" /> Export Data
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'import' ? "bg-card-bg text-accent shadow-sm" : "text-text-secondary hover:text-text-primary"
          )}
        >
          <Upload className="w-4 h-4" /> Import Data
        </button>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar">
        {activeTab === 'export' ? (
          <div className="grid grid-cols-2 gap-4">
            <ExportButton
              label="Excel (.xlsx)"
              icon={<FileSpreadsheet className="w-6 h-6 text-emerald-500" />}
              onClick={() => handleExport('xlsx')}
              disabled={isProcessing || transactions.length === 0}
            />
            <ExportButton
              label="CSV (.csv)"
              icon={<FileText className="w-6 h-6 text-slate-500" />}
              onClick={() => handleExport('csv')}
              disabled={isProcessing || transactions.length === 0}
            />
            <ExportButton
              label="PDF (.pdf)"
              icon={<FileText className="w-6 h-6 text-rose-500" />}
              onClick={() => handleExport('pdf')}
              disabled={isProcessing || transactions.length === 0}
            />
            <ExportButton
              label="Word (.docx)"
              icon={<FileText className="w-6 h-6 text-blue-500" />}
              onClick={() => handleExport('docx')}
              disabled={isProcessing || transactions.length === 0}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-ui rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-bg-main rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                {isProcessing ? <Loader2 className="w-6 h-6 text-accent animate-spin" /> : <Upload className="w-6 h-6 text-text-secondary" />}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-text-primary">Klik atau seret file ke sini</p>
                <p className="text-xs text-text-secondary mt-1">Mendukung .xlsx dan .csv</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </div>

            <div className="bg-bg-main/50 p-4 rounded-xl border border-border-ui flex gap-3">
              <AlertCircle className="w-5 h-5 text-warning shrink-0" />
              <p className="text-[10px] text-text-secondary leading-relaxed">
                <strong>Tips:</strong> Pastikan file memiliki kolom: **Tanggal, Tipe, Kategori, Keterangan, Jumlah**.
                Tipe harus berisi "Pemasukan" atau "Pengeluaran".
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-danger/10 text-danger text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-bg-main/30 border-t border-border-ui text-center shrink-0">
        <p className="text-[10px] text-text-secondary font-medium">
          Vinance &bull; Data Aman & Privat
        </p>
      </div>
    </>
  );
}

function ExportButton({ label, icon, onClick, disabled }: { label: string, icon: React.ReactNode, onClick: () => void, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-4 bg-bg-main/40 border border-border-ui rounded-2xl flex flex-col items-center gap-3 hover:shadow-xl hover:shadow-accent/5 hover:border-accent/40 active:scale-95 transition-all",
        disabled && "opacity-50 cursor-not-allowed grayscale"
      )}
    >
      <div className="w-12 h-12 bg-card-bg rounded-xl flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-text-primary uppercase tracking-tight">{label}</span>
    </button>
  );
}

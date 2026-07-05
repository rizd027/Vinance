import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, TextRun, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import type { Transaction } from '../types';
import { formatCurrency } from './utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const getHeaders = () => ['Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Jumlah'];

const getLogoBase64 = async (): Promise<string | null> => {
  try {
    const res = await fetch('/Logo-Vinance.png');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    return null;
  }
};

const getLogoArrayBuffer = async (): Promise<ArrayBuffer | null> => {
  try {
    const res = await fetch('/Logo-Vinance.png');
    return await res.arrayBuffer();
  } catch {
    return null;
  }
};


const getSummary = (transactions: Transaction[]) => {
  const income = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + Number(t.amount), 0);
  return { income, expense, balance: income - expense };
};

const formatData = (transactions: Transaction[]) => {
  return transactions.map(t => [
    format(new Date(t.date), 'dd MMM yyyy, HH:mm', { locale: id }),
    t.type === 'Income' ? 'Pemasukan' : 'Pengeluaran',
    t.category,
    t.note || '-',
    t.amount
  ]);
};

export const exportToExcel = (transactions: Transaction[]) => {
  const summary = getSummary(transactions);
  const data = formatData(transactions);
  data.push(['', '', '', 'TOTAL PEMASUKAN', summary.income]);
  data.push(['', '', '', 'TOTAL PENGELUARAN', summary.expense]);
  data.push(['', '', '', 'SALDO NETTO', summary.balance]);

  
  // Create worksheet with summary header
  const wsData = [
    ['VINANCE - LAPORAN TRANSAKSI'],
    [`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`],
    [''],
    ['RINGKASAN'],
    ['Total Pemasukan', summary.income],
    ['Total Pengeluaran', summary.expense],
    ['Saldo Netto', summary.balance],
    [''],
    getHeaders(),
    ...data
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Tanggal
    { wch: 15 }, // Tipe
    { wch: 20 }, // Kategori
    { wch: 30 }, // Keterangan
    { wch: 15 }, // Jumlah
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
  XLSX.writeFile(wb, `Vinance_Export_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
};

export const exportToCSV = (transactions: Transaction[]) => {
  const summary = getSummary(transactions);
  const data = formatData(transactions);
  data.push(['', '', '', 'TOTAL PEMASUKAN', summary.income]);
  data.push(['', '', '', 'TOTAL PENGELUARAN', summary.expense]);
  data.push(['', '', '', 'SALDO NETTO', summary.balance]);

  
  const wsData = [
    ['VINANCE - EXPORT CSV'],
    [`Ringkasan: Pemasukan=${summary.income}, Pengeluaran=${summary.expense}, Saldo=${summary.balance}`],
    [''],
    getHeaders(),
    ...data
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `Vinance_Export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
};

export const exportToPDF = async (transactions: Transaction[]) => {
  const doc = new jsPDF();
  const summary = getSummary(transactions);
  const dateStr = format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id });
  const data = formatData(transactions);
  data.push(['', '', '', 'TOTAL PEMASUKAN', summary.income]);
  data.push(['', '', '', 'TOTAL PENGELUARAN', summary.expense]);
  data.push(['', '', '', 'SALDO NETTO', summary.balance]);

  
  // Header
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 35, 'F');
  
  let textX = 14;
  const logoBase64 = await getLogoBase64();
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 14, 10, 14, 14);
    textX = 32;
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('VINANCE', textX, 19);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('DATA TRANSAKSI KEUANGAN', textX, 25);
  
  doc.text(dateStr, 196, 25, { align: 'right' });

  // Summary Cards
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text('Ringkasan Keuangan', 14, 48);
  
  autoTable(doc, {
    startY: 52,
    head: [['Pemasukan', 'Pengeluaran', 'Saldo Akhir']],
    body: [[
      formatCurrency(summary.income),
      formatCurrency(summary.expense),
      formatCurrency(summary.balance)
    ]],
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241], halign: 'center', fontSize: 9 },
    bodyStyles: { halign: 'center', fontStyle: 'bold', fontSize: 11 },
  });

  // Table
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [getHeaders()],
    body: data.map(row => [
      row[0], 
      row[1], 
      row[2], 
      row[3], 
      formatCurrency(row[4] as number)
    ]),
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Halaman ${i} dari ${pageCount} | Vinance Ecosystem`, 105, 290, { align: 'center' });
  }

  doc.save(`Vinance_Export_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};

export const exportToDocx = async (transactions: Transaction[]) => {
  const summary = getSummary(transactions);
  const data = formatData(transactions);
  data.push(['', '', '', 'TOTAL PEMASUKAN', summary.income]);
  data.push(['', '', '', 'TOTAL PENGELUARAN', summary.expense]);
  data.push(['', '', '', 'SALDO NETTO', summary.balance]);

  const logoArrayBuffer = await getLogoArrayBuffer();
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            ...(logoArrayBuffer ? [new ImageRun({
              data: logoArrayBuffer,
              transformation: { width: 40, height: 40 },
              type: "png"
            }), new TextRun({ text: "  " })] : []),
            new TextRun({ text: "VINANCE", bold: true, size: 56, color: "6366f1" }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: "Laporan Transaksi Keuangan",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 400 },
        }),

        // Summary Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total Pemasukan", bold: true })] })], shading: { fill: "f1f5f9" } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total Pengeluaran", bold: true })] })], shading: { fill: "f1f5f9" } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Saldo Netto", bold: true })] })], shading: { fill: "f1f5f9" } }),
              ],
            }),

            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(summary.income), color: "059669" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(summary.expense), color: "dc2626" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(summary.balance), bold: true })] })] }),
              ],
            }),

          ],
        }),
        
        new Paragraph({ text: "", spacing: { before: 400 } }),

        // Main Data Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: getHeaders().map(h => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "ffffff" })] })],
                shading: { fill: "1e293b" },
              }))
            }),
            ...data.map(row => new TableRow({
              children: row.map((cell, i) => new TableCell({
                children: [new Paragraph({ 
                  text: i === 4 ? formatCurrency(cell as number) : String(cell),
                  alignment: i === 4 ? AlignmentType.RIGHT : AlignmentType.LEFT,
                  spacing: { before: 100, after: 100 }
                })],
              }))
            }))
          ]
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Vinance_Export_${format(new Date(), 'yyyyMMdd_HHmm')}.docx`);
};

export const exportReportPDF = async (transactions: Transaction[], period: string, stats: { income: number, expense: number, balance: number, savingsRate: number }) => {
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'dd MMMM yyyy', { locale: id });
  
  // Elegant Dark Header
  doc.setFillColor(2, 6, 23); // Slate 950
  doc.rect(0, 0, 210, 45, 'F');
  
  // Decorative line
  doc.setFillColor(99, 102, 241); // Accent Purple
  doc.rect(0, 45, 210, 2, 'F');
  
  let textX = 14;
  const logoBase64 = await getLogoBase64();
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 14, 12, 16, 16);
    textX = 34;
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('VINANCE', textX, 22);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('ECOSYSTEM FINANSIAL', textX, 28);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`LAPORAN ANALISIS ${period.toUpperCase()}`, 196, 22, { align: 'right' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`Dicetak: ${dateStr}`, 196, 28, { align: 'right' });

  // Main Stats Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN PERFORMA', 14, 62);
  
  autoTable(doc, {
    startY: 68,
    head: [['TOTAL PEMASUKAN', 'TOTAL PENGELUARAN', 'SALDO NETTO', 'SAVINGS RATE']],
    body: [[
      formatCurrency(stats.income),
      formatCurrency(stats.expense),
      formatCurrency(stats.balance),
      `${stats.savingsRate.toFixed(1)}%`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241], halign: 'center', fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { halign: 'center', fontStyle: 'bold', fontSize: 12, textColor: [30, 41, 59] },
    styles: { cellPadding: 5 }
  });

  // Insights Section
  const expenses = transactions
    .filter(t => t.type === 'Expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Visual Category Chart (New Section)
  const categoryTotals = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const chartY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('VISUALISASI ALOKASI BIAYA', 14, chartY);
  
  // Draw simple bar chart
  const COLORS = [[99, 102, 241], [236, 72, 153], [245, 158, 11], [16, 185, 129], [239, 68, 68]];
  let barY = chartY + 10;
  topCategories.forEach(([cat, amount], i) => {
    const percentage = (amount / stats.expense);
    const barWidth = 140 * percentage;
    
    // Category label
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(cat.toUpperCase(), 14, barY + 4);
    
    // Bar background
    doc.setFillColor(241, 245, 249);
    doc.rect(50, barY, 140, 5, 'F');
    
    // Bar fill
    const color = COLORS[i % COLORS.length];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(50, barY, barWidth, 5, 'F');
    
    // Percentage text
    doc.setTextColor(15, 23, 42);
    doc.text(`${(percentage * 100).toFixed(1)}%`, 195, barY + 4, { align: 'right' });
    
    barY += 10;
  });

  doc.setFontSize(14);
  doc.text('DISTRIBUSI PENGELUARAN PER KATEGORI', 14, barY + 10);
  
  autoTable(doc, {
    startY: barY + 15,
    head: [['KATEGORI', 'TOTAL PENGELUARAN', 'PERSENTASE']],
    body: topCategories.map(([cat, amount]) => [
      cat.toUpperCase(),
      formatCurrency(amount),
      `${((amount / stats.expense) * 100).toFixed(1)}%`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' },
      2: { halign: 'center' }
    }
  });

  doc.setFontSize(14);
  doc.text('RIWAYAT 10 PENGELUARAN TERBESAR', 14, (doc as any).lastAutoTable.finalY + 18);
  
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 24,
    head: [['TANGGAL & WAKTU', 'KATEGORI', 'KETERANGAN', 'JUMLAH']],
    body: [
      ...expenses.map(e => [
        format(new Date(e.date), 'dd MMM yyyy, HH:mm', { locale: id }),
        e.category.toUpperCase(),
        e.note || '-',
        formatCurrency(e.amount)
      ]),
      [
        '', 
        '', 
        'TOTAL', 
        formatCurrency(expenses.reduce((sum, e) => sum + Number(e.amount), 0))
      ]
    ],

    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] }
    }
  });

  // Savings Recommendation
  const currentY = (doc as any).lastAutoTable.finalY + 20;
  if (currentY < 250) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, currentY, 182, 30, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, currentY, 182, 30, 3, 3, 'D');
    
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('CATATAN ANALISIS:', 20, currentY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const message = stats.savingsRate >= 20 
      ? `Luar biasa! Savings rate Anda sebesar ${stats.savingsRate.toFixed(1)}% telah memenuhi target ideal 20%. Pertahankan kedisiplinan finansial ini.`
      : `Savings rate Anda sebesar ${stats.savingsRate.toFixed(1)}% masih di bawah target ideal 20%. Cobalah meninjau kembali kategori pengeluaran terbesar untuk efisiensi.`;
    
    const splitText = doc.splitTextToSize(message, 170);
    doc.text(splitText, 20, currentY + 18);
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Laporan Eksklusif Vinance - Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('Data ini bersifat pribadi dan rahasia.', 105, 290, { align: 'center' });
  }

  doc.save(`Laporan_Analisis_${period}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

export const exportReportExcel = (transactions: Transaction[], period: string, stats: { income: number, expense: number, balance: number, savingsRate: number }) => {
  const data = formatData(transactions);
  data.push(['', '', '', 'TOTAL PEMASUKAN', stats.income]);
  data.push(['', '', '', 'TOTAL PENGELUARAN', stats.expense]);
  data.push(['', '', '', 'SALDO NETTO', stats.balance]);

  const wsData = [
    [`VINANCE - LAPORAN ANALISIS ${period.toUpperCase()}`],
    [`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`],
    [''],
    ['RINGKASAN PERFORMA'],
    ['Total Pemasukan', stats.income],
    ['Total Pengeluaran', stats.expense],
    ['Saldo Netto', stats.balance],
    ['Savings Rate', `${stats.savingsRate.toFixed(1)}%`],
    [''],
    ['DATA TRANSAKSI'],
    getHeaders(),
    ...data
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  XLSX.writeFile(wb, `Laporan_${period}_${Date.now()}.xlsx`);
};

export const exportReportCSV = (transactions: Transaction[], period: string, stats: { income: number, expense: number, balance: number, savingsRate: number }) => {
  const data = formatData(transactions);
  data.push(['', '', '', 'TOTAL PEMASUKAN', stats.income]);
  data.push(['', '', '', 'TOTAL PENGELUARAN', stats.expense]);
  data.push(['', '', '', 'SALDO NETTO', stats.balance]);

  const wsData = [
    [`VINANCE - LAPORAN ANALISIS ${period.toUpperCase()}`],
    [`Ringkasan: Pemasukan=${stats.income}, Pengeluaran=${stats.expense}, Saldo=${stats.balance}, SavingsRate=${stats.savingsRate.toFixed(1)}%`],
    [''],
    getHeaders(),
    ...data
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `Laporan_${period}_${Date.now()}.csv`);
};

export const exportReportDocx = async (transactions: Transaction[], period: string, stats: { income: number, expense: number, balance: number, savingsRate: number }) => {
  const data = formatData(transactions);
  data.push(['', '', '', 'TOTAL PEMASUKAN', stats.income]);
  data.push(['', '', '', 'TOTAL PENGELUARAN', stats.expense]);
  data.push(['', '', '', 'SALDO NETTO', stats.balance]);

  const logoArrayBuffer = await getLogoArrayBuffer();
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            ...(logoArrayBuffer ? [new ImageRun({
              data: logoArrayBuffer,
              transformation: { width: 40, height: 40 },
              type: "png"
            }), new TextRun({ text: "  " })] : []),
            new TextRun({ text: "VINANCE", bold: true, size: 56, color: "6366f1" })
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Laporan Analisis Keuangan - ${period}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 400 },
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total Pemasukan", bold: true })] })], shading: { fill: "f1f5f9" } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total Pengeluaran", bold: true })] })], shading: { fill: "f1f5f9" } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Saldo Netto", bold: true })] })], shading: { fill: "f1f5f9" } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Savings Rate", bold: true })] })], shading: { fill: "f1f5f9" } }),
              ],
            }),

            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(stats.income), color: "059669" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(stats.expense), color: "dc2626" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(stats.balance), bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${stats.savingsRate.toFixed(1)}%`, bold: true })] })] }),
              ],
            }),

          ],
        }),
        
        new Paragraph({ text: "", spacing: { before: 400 } }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: getHeaders().map(h => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "ffffff" })] })],
                shading: { fill: "1e293b" },
              }))
            }),

            ...data.map(row => new TableRow({
              children: row.map((cell, i) => new TableCell({
                children: [new Paragraph({ 
                  text: i === 4 ? formatCurrency(cell as number) : String(cell),
                  alignment: i === 4 ? AlignmentType.RIGHT : AlignmentType.LEFT,
                  spacing: { before: 100, after: 100 }
                })],
              }))
            }))
          ]
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Laporan_${period}_${Date.now()}.docx`);
};

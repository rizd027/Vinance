import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO,
  setMonth, setYear, getYear
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  dropUp?: boolean;
}

type PickerMode = 'calendar' | 'month' | 'year';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function DatePicker({ value, onChange, placeholder = 'Pilih tanggal', className, dropUp = false }: DatePickerProps) {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<PickerMode>('calendar');
  const [viewDate, setViewDate] = useState(value ? parseISO(value) : new Date());
  
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const years = useMemo(() => {
    const currentYear = getYear(viewDate);
    const startYear = currentYear - 10;
    return Array.from({ length: 21 }, (_, i) => startYear + i);
  }, [viewDate]);

  const selectedDate = value ? parseISO(value) : null;

  const handleMonthSelect = (mIdx: number) => {
    setViewDate(setMonth(viewDate, mIdx));
    setMode('calendar');
  };

  const handleYearSelect = (year: number) => {
    setViewDate(setYear(viewDate, year));
    setMode('month');
  };

  return (
    <div className={cn("relative", className)}>
      <div 
        onClick={() => {
          setShow(!show);
          if (!show) setMode('calendar');
        }}
        className="w-full p-3 bg-bg-main rounded-xl border border-border-ui focus-within:border-accent cursor-pointer flex items-center justify-between transition-all hover:border-accent/50 group"
      >
        <span className={cn("text-sm font-bold transition-colors", !value ? "text-text-secondary" : "text-text-primary group-hover:text-accent")}>
          {value ? format(parseISO(value), 'dd MMMM yyyy', { locale: localeId }) : placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" />
      </div>

      {show && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setShow(false)} />
          <div 
            className={cn(
              "absolute z-[70] bg-card-bg border border-border-ui rounded-2xl shadow-2xl p-4 overflow-hidden min-w-[300px]",
              dropUp ? "bottom-full mb-2" : "top-full mt-2"
            )}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 bg-bg-main/30 p-2 rounded-xl">
              <button 
                onClick={() => setViewDate(subMonths(viewDate, mode === 'year' ? 120 : 1))} 
                className="p-1.5 hover:bg-bg-main rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-text-secondary" />
              </button>
              
              <div className="flex items-center gap-1 cursor-pointer hover:bg-bg-main px-2 py-1 rounded-lg transition-colors" onClick={() => setMode(mode === 'calendar' ? 'month' : mode === 'month' ? 'year' : 'calendar')}>
                <span className="text-[11px] font-black text-text-primary uppercase tracking-widest">
                  {mode === 'year' ? `${years[0]} - ${years[years.length-1]}` : format(viewDate, mode === 'month' ? 'yyyy' : 'MMMM yyyy', { locale: localeId })}
                </span>
                <ChevronDown className={cn("w-3 h-3 text-text-secondary transition-transform", mode !== 'calendar' && "rotate-180")} />
              </div>

              <button 
                onClick={() => setViewDate(addMonths(viewDate, mode === 'year' ? 120 : 1))} 
                className="p-1.5 hover:bg-bg-main rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            {mode === 'calendar' && (
              <div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d, i) => (
                    <div key={i} className="text-[9px] font-black text-text-secondary text-center py-1 opacity-50">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, i) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, viewDate);
                    const isTodayDate = isSameDay(day, new Date());
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          onChange(format(day, 'yyyy-MM-dd'));
                          setShow(false);
                        }}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all relative",
                          !isCurrentMonth ? "opacity-10" : "hover:bg-accent/10 hover:text-accent",
                          isSelected ? "bg-accent text-white shadow-lg shadow-accent/30 scale-110 z-10" : "text-text-primary",
                          isTodayDate && !isSelected && "text-accent ring-1 ring-accent/30"
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === 'month' && (
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => handleMonthSelect(i)}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      i === viewDate.getMonth() ? "bg-accent text-white shadow-lg" : "bg-bg-main text-text-secondary hover:bg-accent/10 hover:text-accent"
                    )}
                  >
                    {m.substring(0, 3)}
                  </button>
                ))}
              </div>
            )}

            {mode === 'year' && (
              <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                {years.map(y => (
                  <button
                    key={y}
                    onClick={() => handleYearSelect(y)}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-black transition-all",
                      y === getYear(viewDate) ? "bg-accent text-white shadow-lg" : "bg-bg-main text-text-secondary hover:bg-accent/10 hover:text-accent"
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

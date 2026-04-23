import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Check,
  Utensils, Car, ShoppingBag, Receipt,
  Heart, PlusCircle, Wallet, TrendingUp, HelpCircle,
  Gem, Briefcase, Zap, PartyPopper
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: (string | Option)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const getIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('makanan') || l.includes('food')) return <Utensils className="w-3.5 h-3.5" />;
  if (l.includes('transport')) return <Car className="w-3.5 h-3.5" />;
  if (l.includes('belanja') || l.includes('shopping')) return <ShoppingBag className="w-3.5 h-3.5" />;
  if (l.includes('tagihan') || l.includes('bill')) return <Receipt className="w-3.5 h-3.5" />;
  if (l.includes('hiburan') || l.includes('entertainment')) return <PartyPopper className="w-3.5 h-3.5" />;
  if (l.includes('kesehatan') || l.includes('health')) return <Heart className="w-3.5 h-3.5" />;
  if (l.includes('gaji') || l.includes('salary')) return <Briefcase className="w-3.5 h-3.5" />;
  if (l.includes('bonus')) return <Gem className="w-3.5 h-3.5" />;
  if (l.includes('invest')) return <TrendingUp className="w-3.5 h-3.5" />;
  if (l.includes('dompet') || l.includes('wallet')) return <Wallet className="w-3.5 h-3.5" />;
  if (l.includes('utilitas')) return <Zap className="w-3.5 h-3.5" />;
  if (l.includes('pilih')) return <PlusCircle className="w-3.5 h-3.5" />;
  return <HelpCircle className="w-3.5 h-3.5" />;
};

export default function CustomSelect({ options, value, onChange, placeholder = "Pilih...", className, required }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: Option[] = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-border-ui bg-card-bg text-sm transition-all text-left outline-none",
          isOpen ? "ring-2 ring-accent/20 border-accent" : "hover:border-accent/30",
          !value && "text-text-secondary"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {value && getIcon(selectedOption?.label || '')}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-text-secondary transition-transform", isOpen && "rotate-180")} />
      </button>

      <>
        {isOpen && (
          <div
            className="absolute z-[100] w-full mt-2 bg-card-bg/95 backdrop-blur-xl border border-border-ui rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto no-scrollbar py-1.5">
              {normalizedOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-bold transition-all text-left hover:bg-accent/10 group",
                    value === opt.value ? "text-accent bg-accent/5" : "text-text-primary hover:text-accent"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      value === opt.value ? "bg-accent/20 text-accent" : "bg-bg-main group-hover:bg-accent/20 group-hover:text-accent"
                    )}>
                      {getIcon(opt.label)}
                    </div>
                    {opt.label}
                  </div>
                  {value === opt.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </>

      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
          value={value}
          onChange={() => { }}
          required
        />
      )}
    </div>
  );
}

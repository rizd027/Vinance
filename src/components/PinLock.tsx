import React, { useState, useEffect } from 'react';
import { Lock, Delete, Fingerprint, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface PinLockProps {
  correctPin?: string;
  onUnlock?: () => void;
  onComplete?: (pin: string) => void;
  onCancel?: () => void;
  mode: 'unlock' | 'setup';
  title?: string;
  description?: string;
}

export default function PinLock({
  correctPin,
  onUnlock,
  onComplete,
  onCancel,
  mode,
  title,
  description
}: PinLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const displayTitle = title || (mode === 'unlock' ? 'Aplikasi Terkunci' : 'Atur PIN Baru');
  const displayDesc = description || (mode === 'unlock'
    ? 'Masukkan 4 digit PIN Anda untuk membuka Vinance.'
    : 'Buat 4 digit PIN untuk mengamankan data keuangan Anda.');

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (mode === 'unlock') {
        if (pin === correctPin) {
          if (onUnlock) onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      } else {
        // Setup mode
        if (onComplete) onComplete(pin);
      }
    }
  }, [pin, correctPin, mode, onUnlock, onComplete]);

  return (
    <div className={cn(
      "fixed inset-0 z-[100] bg-bg-main flex flex-col items-center justify-center p-6 text-text-primary",
    )}>
      {mode === 'setup' && (
        <button
          onClick={onCancel}
          className="absolute top-8 right-8 p-3 hover:bg-bg-main rounded-2xl transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="max-w-xs w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-accent" />
        </div>

        <h2 className="text-xl font-black tracking-tight mb-2">{displayTitle}</h2>
        <p className="text-xs text-text-secondary mb-8 text-center px-4 leading-relaxed font-medium">
          {displayDesc}
        </p>

        {/* PIN Indicators */}
        <div className="flex gap-4 mb-12 h-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-200",
                pin.length > index ? "bg-accent scale-110" : "bg-bg-main border-2 border-border-ui",
                error && "bg-danger border-danger animate-bounce"
              )}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-16 w-16 mx-auto rounded-full bg-card-bg hover:bg-bg-main border border-border-ui text-2xl font-black active:scale-90 transition-all shadow-sm"
            >
              {num}
            </button>
          ))}

          <div className="h-16 w-16 mx-auto flex flex-col items-center justify-center text-accent">
            <Fingerprint className="w-8 h-8 opacity-20" />
          </div>

          <button
            onClick={() => handleKeyPress('0')}
            className="h-16 w-16 mx-auto rounded-full bg-card-bg hover:bg-bg-main border border-border-ui text-2xl font-black active:scale-90 transition-all shadow-sm"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-16 w-16 mx-auto rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-main active:scale-90 transition-all"
          >
            <Delete className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}

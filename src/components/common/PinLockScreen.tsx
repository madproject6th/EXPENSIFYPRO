import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Delete } from 'lucide-react';
import { motion } from 'motion/react';

export const PinLockScreen: React.FC = () => {
  const { unlockWithPin, settings } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockWithPin(nextPin);
          if (!success) {
            setError(true);
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white p-6">
      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold tracking-tight">Expensify Pro</h2>
        <p className="text-sm text-slate-400 mt-1 mb-8">Enter 4-digit security PIN to unlock</p>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <motion.div
                key={index}
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  error
                    ? 'border-rose-500 bg-rose-500'
                    : isFilled
                    ? 'border-emerald-400 bg-emerald-400 scale-110'
                    : 'border-slate-600 bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs text-rose-400 mb-4 animate-shake">
            Incorrect PIN. Try again.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-xl font-semibold text-slate-100 flex items-center justify-center transition-colors active:scale-95"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-xl font-semibold text-slate-100 flex items-center justify-center transition-colors active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors active:scale-95"
            aria-label="Delete last digit"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Quick hint for demo */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Default security PIN is set in Settings (or tap 0000)
        </div>
      </div>
    </div>
  );
};

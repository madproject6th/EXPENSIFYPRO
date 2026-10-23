import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'animating' | 'fading'>('animating');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('fading');
      setTimeout(onComplete, 400);
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'fading' ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white"
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Glow Halo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.4, 0.2] }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute w-44 h-44 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"
        />

        {/* Brand Custom Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950 ring-2 ring-emerald-500/40 p-1 bg-slate-900"
        >
          <img
            src="/assets/aistudio/images_29a856f5.jfif"
            alt="Expensify Pro Logo"
            className="w-full h-full object-cover rounded-2xl"
          />
        </motion.div>

        {/* App Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            Expensify <span className="text-emerald-400 font-extrabold">Pro</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
            Intelligent Wealth & Expense Command
          </p>
        </motion.div>

        {/* Minimal Financial Wave Graphic */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 140 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-8 h-10 overflow-hidden flex items-center justify-center"
        >
          <svg className="w-36 h-8 text-emerald-400 stroke-current fill-none stroke-2">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: 'easeInOut' }}
              d="M 0 20 Q 20 5, 45 18 T 90 10 T 140 4"
            />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ONBOARDING_SLIDES } from '../../constants/defaultCategories';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const { updateSettings } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    updateSettings({ onboardingCompleted: true });
    onFinish();
  };

  const isLast = currentSlide === ONBOARDING_SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative min-h-[600px]">
        {/* Top bar with Skip */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden shadow-xs ring-1 ring-emerald-500/30">
              <img src="/assets/aistudio/images_29a856f5.jfif" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">Expensify</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold uppercase tracking-wider">
                Pro
              </span>
            </div>
          </div>
          {!isLast && (
            <button
              onClick={completeOnboarding}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-800"
            >
              Skip
            </button>
          )}
        </div>

        {/* Carousel Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {/* Slide Image */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden mb-6 shadow-xl border border-slate-800 bg-slate-950 flex items-center justify-center">
                <img
                  src={ONBOARDING_SLIDES[currentSlide].image}
                  alt={ONBOARDING_SLIDES[currentSlide].title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-balance">
                {ONBOARDING_SLIDES[currentSlide].title}
              </h2>
              <p className="text-sm text-slate-400 mt-2.5 max-w-xs leading-relaxed">
                {ONBOARDING_SLIDES[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom controls: Dots & Next Button */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-2">
            {ONBOARDING_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-7 bg-emerald-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action button */}
          <button
            onClick={handleNext}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 ${
              isLast
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-900 shadow-white/10'
            }`}
          >
            {isLast ? (
              <>
                <span>Get Started</span>
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  formatter: (val: number) => string;
  duration?: number; // ms
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  formatter,
  duration = 500,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const endValue = value;
    const diff = endValue - startValue;

    if (Math.abs(diff) < 0.01) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * ease;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(endValue);
      }
    };

    const animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  return <span className={`tabular-nums font-mono ${className}`}>{formatter(displayValue)}</span>;
};

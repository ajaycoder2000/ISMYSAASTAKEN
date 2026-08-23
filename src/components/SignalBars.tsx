'use client';

import { useState, useEffect } from 'react';
import { SaturationLevel } from '@/types';

export type SignalBarColor = 'accent' | 'amber' | 'red';

interface SignalBarsProps {
  level?: number; // 1 to 5
  color?: SignalBarColor;
  score?: SaturationLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BAR_HEIGHTS_MD = [10, 17, 24, 31, 38];
const BAR_HEIGHTS_SM = [6, 10, 14, 18, 22];

export default function SignalBars({
  level: rawLevel,
  color: rawColor,
  score,
  showLabel = true,
  size = 'md',
  className = '',
}: SignalBarsProps) {
  // Derive level, color and label from score if provided
  let activeLevel = rawLevel ?? 3;
  let activeColor: SignalBarColor = rawColor ?? 'amber';
  let labelText = 'Competitive';

  if (score) {
    if (score === 'low') {
      activeLevel = 2;
      activeColor = 'accent';
      labelText = 'Gap found';
    } else if (score === 'high') {
      activeLevel = 5;
      activeColor = 'red';
      labelText = 'Taken';
    } else {
      activeLevel = 3;
      activeColor = 'amber';
      labelText = 'Competitive';
    }
  } else if (rawColor) {
    if (rawColor === 'accent') labelText = 'Gap found';
    else if (rawColor === 'red') labelText = 'Taken';
    else labelText = 'Competitive';
  }

  // Animation state: number of bars lit up sequentially
  const [litBarsCount, setLitBarsCount] = useState(0);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setLitBarsCount(activeLevel);
      return;
    }

    // Reset and start staggered sequence after 200ms
    setLitBarsCount(0);
    const startTimeout = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setLitBarsCount(current);
        if (current >= activeLevel) {
          clearInterval(interval);
        }
      }, 120);

      return () => clearInterval(interval);
    }, 200);

    return () => clearTimeout(startTimeout);
  }, [activeLevel]);

  const heights = size === 'sm' ? BAR_HEIGHTS_SM : BAR_HEIGHTS_MD;
  const barWidth = size === 'sm' ? 'w-[3px]' : 'w-1.5';
  const gap = size === 'sm' ? 'gap-[2.5px]' : 'gap-1';

  // Color mappings referencing CSS variables
  const colorStyles: Record<SignalBarColor, { bg: string; glow: string; text: string }> = {
    accent: {
      bg: 'var(--accent)',
      glow: '0 0 8px var(--accent-glow)',
      text: 'text-[hsl(42,95%,55%)]',
    },
    amber: {
      bg: 'var(--amber)',
      glow: '0 0 8px var(--accent-glow)',
      text: 'text-[hsl(40,15%,75%)]',
    },
    red: {
      bg: 'var(--red)',
      glow: '0 0 8px rgba(239, 68, 68, 0.4)',
      text: 'text-[hsl(0,72%,60%)]',
    },
  };

  const currentStyle = colorStyles[activeColor];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 5 Signal Bars */}
      <div className={`flex items-end ${gap}`} role="img" aria-label={`Saturation strength ${activeLevel} of 5`}>
        {heights.map((h, index) => {
          const barNumber = index + 1;
          const isLit = barNumber <= litBarsCount;

          return (
            <div
              key={index}
              className={`${barWidth} rounded-sm transition-all duration-200`}
              style={{
                height: `${h}px`,
                backgroundColor: isLit ? currentStyle.bg : 'var(--border)',
                boxShadow: isLit ? currentStyle.glow : 'none',
                opacity: isLit ? 1 : 0.4,
              }}
            />
          );
        })}
      </div>

      {/* Accessible Text Label */}
      {showLabel && (
        <span
          className={`font-[family-name:var(--font-mono)] uppercase tracking-wider font-bold ${
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          } ${currentStyle.text}`}
        >
          {labelText}
        </span>
      )}
    </div>
  );
}

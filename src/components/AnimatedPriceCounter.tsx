'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedPriceCounterProps {
  value: number;
  prefix?: string;
  durationMs?: number;
  className?: string;
}

export default function AnimatedPriceCounter({
  value,
  prefix = '$',
  durationMs = 420,
  className = '',
}: AnimatedPriceCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValueRef.current = value;
      return;
    }

    const fromVal = prevValueRef.current;
    const toVal = value;
    prevValueRef.current = value;

    if (fromVal === toVal) return;

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(toVal);
      return;
    }

    let startTimestamp: number | null = null;
    let animFrame: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(fromVal + (toVal - fromVal) * ease);

      setDisplayValue(current);

      if (progress < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        setDisplayValue(toVal);
      }
    };

    animFrame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [value, durationMs]);

  return (
    <span className={`inline-flex items-baseline font-[family-name:var(--font-space-grotesk)] transition-transform duration-200 ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span className="tabular-nums tracking-tight">{displayValue}</span>
    </span>
  );
}

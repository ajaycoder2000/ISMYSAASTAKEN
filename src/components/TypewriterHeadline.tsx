'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterHeadlineProps {
  line1?: string;
  line2?: string;
  className?: string;
}

export default function TypewriterHeadline({
  line1 = 'Is your SaaS idea',
  line2 = 'already taken?',
  className = '',
}: TypewriterHeadlineProps) {
  const [displayedLine1, setDisplayedLine1] = useState('');
  const [displayedLine2, setDisplayedLine2] = useState('');
  const [isTypingLine1, setIsTypingLine1] = useState(true);
  const [isTypingLine2, setIsTypingLine2] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayedLine1(line1);
      setDisplayedLine2(line2);
      setIsDone(true);
      return;
    }

    let i = 0;
    let j = 0;
    let timer: NodeJS.Timeout | null = null;

    // Reset
    setDisplayedLine1('');
    setDisplayedLine2('');
    setIsTypingLine1(true);
    setIsTypingLine2(false);
    setIsDone(false);

    const typeLine1 = () => {
      if (!mountedRef.current) return;
      if (i < line1.length) {
        setDisplayedLine1(line1.slice(0, i + 1));
        i++;
        // Slight natural typing variation (30-55ms)
        const delay = 35 + Math.random() * 20;
        timer = setTimeout(typeLine1, delay);
      } else {
        setIsTypingLine1(false);
        setIsTypingLine2(true);
        // Pause briefly before typing the highlighted second line
        timer = setTimeout(typeLine2, 180);
      }
    };

    const typeLine2 = () => {
      if (!mountedRef.current) return;
      if (j < line2.length) {
        setDisplayedLine2(line2.slice(0, j + 1));
        j++;
        const delay = 45 + Math.random() * 25;
        timer = setTimeout(typeLine2, delay);
      } else {
        setIsTypingLine2(false);
        setIsDone(true);
      }
    };

    // Initial slight pause before typing starts
    timer = setTimeout(typeLine1, 120);

    return () => {
      mountedRef.current = false;
      if (timer) clearTimeout(timer);
    };
  }, [line1, line2]);

  return (
    <h1
      className={`text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight leading-[1.12] text-[hsl(40,20%,92%)] min-h-[2.4em] sm:min-h-[2.3em] flex flex-col justify-start select-none ${className}`}
      aria-label={`${line1} ${line2}`}
    >
      {/* Line 1 */}
      <span className="inline-flex items-center">
        <span>{displayedLine1}</span>
        {isTypingLine1 && (
          <span
            className="inline-block w-[3px] h-[0.85em] ml-1 bg-[hsl(40,20%,92%)] animate-pulse"
            aria-hidden="true"
          />
        )}
      </span>

      {/* Line 2 with Amber Highlight */}
      <span className="text-[hsl(42,95%,55%)] inline-flex items-center mt-0.5 sm:mt-1">
        <span>{displayedLine2}</span>
        {isTypingLine2 && (
          <span
            className="inline-block w-[3.5px] h-[0.85em] ml-1 bg-[hsl(42,95%,55%)] animate-pulse shadow-[0_0_8px_hsl(42,95%,55%,0.8)]"
            aria-hidden="true"
          />
        )}
        {/* Subtle resting cursor that softly fades out after finishing */}
        {isDone && (
          <span
            className="inline-block w-[2.5px] h-[0.8em] ml-1.5 bg-[hsl(42,95%,55%,0.6)] animate-[pulse_1.8s_ease-in-out_3] opacity-60"
            aria-hidden="true"
          />
        )}
      </span>
    </h1>
  );
}

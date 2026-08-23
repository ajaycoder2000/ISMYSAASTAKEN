'use client';

import { useState, useEffect, useRef } from 'react';

interface DecryptTextProps {
  text: string;
  durationMs?: number;
  className?: string;
  as?: 'p' | 'span' | 'div';
}

const CHAR_POOL = '!<>-_\/[]{}—=+*^?#';

function getRandomChar(): string {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
}

export default function DecryptText({
  text,
  durationMs = 800,
  className = '',
  as: Component = 'p',
}: DecryptTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !text) {
      setDisplayText(text);
      return;
    }

    const totalFrames = 26;
    const frameIntervalMs = Math.max(20, Math.floor(durationMs / totalFrames));
    let currentFrame = 0;
    let timeoutId: NodeJS.Timeout | null = null;
    let animFrameId: number | null = null;

    const animate = () => {
      if (!isMountedRef.current) return;

      currentFrame += 1;
      const progress = currentFrame / totalFrames;
      const revealedLength = Math.floor(progress * text.length);

      if (currentFrame >= totalFrames) {
        setDisplayText(text);
        return;
      }

      // Generate frame string
      let nextStr = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === ' ' || char === '\n' || char === '\t') {
          nextStr += char;
        } else if (i < revealedLength) {
          nextStr += char;
        } else {
          nextStr += getRandomChar();
        }
      }

      setDisplayText(nextStr);

      timeoutId = setTimeout(() => {
        animFrameId = requestAnimationFrame(animate);
      }, frameIntervalMs);
    };

    // Start initial frame
    timeoutId = setTimeout(() => {
      animFrameId = requestAnimationFrame(animate);
    }, 40);

    return () => {
      isMountedRef.current = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [text, durationMs]);

  return <Component className={className}>{displayText}</Component>;
}

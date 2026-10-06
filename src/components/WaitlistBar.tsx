'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WAITLIST_BASE_REWARD } from '@/lib/waitlistRewards';

const DISMISSED_KEY = 'waitlist:banner_dismissed';
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

const EXCLUDED_PREFIXES = [
  '/checkout',
  '/admin',
  '/dashboard',
  '/sign-in',
  '/sign-up',
  '/waitlist',
  '/badge',
];

export default function WaitlistBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 1. Check path exclusion
    const isExcluded = EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (isExcluded) {
      setVisible(false);
      return;
    }

    // 2. Check 14-day dismissal from localStorage
    try {
      const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setVisible(false);
        return;
      }
    } catch {
      // Storage blocked or unavailable
    }

    setVisible(true);
  }, [pathname]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now() + FOURTEEN_DAYS_MS));
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Pre-launch waitlist notice"
      className="relative z-30 w-full bg-gradient-to-r from-amber-500/15 via-[var(--bg-surface-alt)] to-amber-500/15 border-b border-[var(--accent-amber)]/25 text-[var(--text-primary)] px-3 py-2 text-xs font-[family-name:var(--font-inter)] transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Banner content */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 text-center flex-wrap">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] border border-[var(--accent-amber)]/30">
            Launch Perks
          </span>
          <span className="text-[var(--text-secondary)]">
            Join the waitlist for <strong className="text-[var(--text-primary)] font-semibold">{WAITLIST_BASE_REWARD}</strong>
          </span>
          <Link
            href="/waitlist"
            className="inline-flex items-center gap-1 font-bold text-[var(--accent-amber)] hover:underline whitespace-nowrap font-[family-name:var(--font-space-grotesk)]"
          >
            Claim your spot &rarr;
          </Link>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Dismiss launch waitlist banner"
          className="p-1 rounded text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/40 transition-colors shrink-0 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

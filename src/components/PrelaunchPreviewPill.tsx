'use client';

import React, { useState, useEffect } from 'react';

export default function PrelaunchPreviewPill() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // Check if session dismissed
      if (sessionStorage.getItem('prelaunch_pill_dismissed') === '1') {
        return;
      }

      // Check if bypass cookie is present
      const hasPreviewCookie = document.cookie
        .split(';')
        .some((c) => c.trim().startsWith('prelaunch_preview='));

      if (hasPreviewCookie) {
        setVisible(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem('prelaunch_pill_dismissed', '1');
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Pre-launch mode preview notice"
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 max-w-[calc(100vw-24px)]"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border)] shadow-xl text-[11px] font-[family-name:var(--font-inter)] text-[var(--text-secondary)]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
        <span className="truncate">
          <strong className="text-[var(--text-primary)] font-semibold">Pre-launch preview</strong>
          <span className="hidden sm:inline"> · the public sees the waitlist only</span>
        </span>
        <span className="text-[var(--text-dim)]">·</span>
        <a
          href="/exit"
          className="font-bold text-[var(--accent-amber)] hover:underline whitespace-nowrap"
        >
          Exit preview
        </a>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss preview notice for this session"
          className="ml-1 p-0.5 text-[var(--text-dim)] hover:text-[var(--text-primary)] rounded transition-colors cursor-pointer"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

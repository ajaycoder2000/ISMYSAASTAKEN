'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

//  ------------------------------ | SWITCH - TOGGLE THEME | ------------------------------  //

interface ThemeToggleProps {
  className?: string;
}

export function SwitchToggleTheme({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — theme is unknown until client-side hydration completes
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-20 h-7 shrink-0", className)} aria-hidden="true" />;
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  return (
    <div className={cn("flex items-center justify-center gap-1.5 sm:gap-2", className)}>
      {/* Light Mode Sun Button */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={cn(
          "p-1 rounded cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-amber)]",
          !isDark
            ? "text-amber-500 dark:text-amber-400"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        )}
        aria-label="Light mode"
        title="Switch to light mode"
      >
        <Sun className="size-4" />
      </button>

      {/* Switch Control */}
      <button
        type="button"
        role="switch"
        id="switch-theme-between"
        aria-checked={isDark}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-md border border-[var(--border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-amber)] focus-visible:ring-offset-2",
          isDark
            ? "bg-[var(--accent-amber)] border-amber-500"
            : "bg-zinc-200 dark:bg-zinc-700"
        )}
      >
        <span
          data-slot="switch-thumb"
          className={cn(
            "pointer-events-none block h-3.5 w-3.5 rounded-sm bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
            isDark ? "translate-x-[17px]" : "translate-x-[2px]"
          )}
        />
      </button>

      {/* Dark Mode Moon Button */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={cn(
          "p-1 rounded cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-amber)]",
          isDark
            ? "text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        )}
        aria-label="Dark mode"
        title="Switch to dark mode"
      >
        <Moon className="size-4" />
      </button>
    </div>
  );
}

// Alias for existing usages
export const ThemeToggle = SwitchToggleTheme;

export default SwitchToggleTheme;


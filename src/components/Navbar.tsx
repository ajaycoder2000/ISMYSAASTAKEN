'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  SignInButton,
  SignUpButton,
  UserButton,
  Show,
} from '@clerk/nextjs';
import NotificationCenter from './NotificationCenter';
import ScanMeter from './ScanMeter';
import UpgradeModal from './UpgradeModal';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [userData, setUserData] = useState<{
    plan: string;
    role?: 'user' | 'admin' | string;
    is_admin?: boolean;
    scansUsedThisMonth: number;
  } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUserData(data.user);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <nav className="w-full border-b border-[var(--border)] bg-[var(--bg-primary)] sm:bg-[var(--bg-primary)]/95 sm:backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
        <div className="w-full max-w-[1780px] mx-auto px-3 sm:px-5 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            title="IsMySaaSTaken"
          >
            <Image
              src="/logo.png"
              alt="IsMySaaSTaken"
              width={200}
              height={24}
              priority
              className="h-6 sm:h-7 w-auto object-contain theme-logo-dark"
            />
            <Image
              src="/logo-light.png"
              alt="IsMySaaSTaken"
              width={200}
              height={24}
              priority
              className="h-6 sm:h-7 w-auto object-contain theme-logo-light"
            />
          </Link>
          
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              href="/#recent-scans"
              className="hidden md:inline text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-inter)]"
            >
              Recent Scans
            </Link>
            <Link
              href="/roadmap"
              className="hidden md:inline text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-inter)]"
            >
              Roadmap 🚀
            </Link>
            <Link
              href="/keywords"
              className="hidden lg:flex text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-inter)] items-center gap-1.5"
            >
              <span>Keywords</span>
              <span className="text-[9px] font-[family-name:var(--font-mono)] uppercase px-1.5 py-0.5 bg-emerald-500/15 text-[var(--accent-emerald)] rounded border border-emerald-500/30 font-bold">
                NEW
              </span>
            </Link>
            <Link
              href="/is-it-taken"
              className="hidden lg:flex text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-inter)] items-center gap-1.5"
            >
              <span>Is It Taken?</span>
              <span className="text-[9px] font-[family-name:var(--font-mono)] uppercase px-1.5 py-0.5 bg-emerald-500/15 text-[var(--accent-emerald)] rounded border border-emerald-500/30 font-bold">
                NEW
              </span>
            </Link>
            <Link
              href="/roast"
              className="hidden md:flex text-xs sm:text-sm text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors font-[family-name:var(--font-inter)] items-center gap-1 font-medium"
            >
              <span>🔥 Roast</span>
              <span className="text-[9px] font-[family-name:var(--font-mono)] uppercase px-1 py-0.5 bg-orange-500/15 text-orange-600 dark:text-orange-400 rounded border border-orange-500/30 font-bold">
                HOT
              </span>
            </Link>
            <Link
              href="/why-validation-matters"
              className="hidden xl:flex text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-inter)] items-center gap-1.5"
            >
              <span>Why Validate?</span>
              <span className="text-[9px] font-[family-name:var(--font-mono)] uppercase px-1.5 py-0.5 bg-amber-500/15 text-[var(--accent-amber)] rounded border border-amber-500/30 font-bold">
                QUIZ
              </span>
            </Link>
            <Link
              href="/pricing"
              className="hidden sm:inline text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-inter)]"
            >
              Pricing
            </Link>

            {/* Signed In Scan Meter */}
            <Show when="signed-in">
              <ScanMeter
                plan={userData?.role === 'admin' || userData?.is_admin ? 'founder_pro' : (userData?.plan || 'free')}
                role={userData?.role}
                scansUsed={userData?.scansUsedThisMonth || 0}
                scansLimit={3}
                onClick={() => {
                  if (userData?.role !== 'admin' && !userData?.is_admin) {
                    setShowUpgradeModal(true);
                  }
                }}
              />
            </Show>

            {/* Market Alerts & Notifications */}
            <NotificationCenter />

            {/* Light / Dark Theme Toggle */}
            <ThemeToggle className="hidden sm:flex" />

            {/* Signed Out Controls */}
            <Show when="signed-out">
              <div className="hidden sm:flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="text-xs sm:text-sm px-2.5 py-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-colors font-[family-name:var(--font-inter)] cursor-pointer">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-xs sm:text-sm px-3.5 py-1.5 bg-[var(--accent-amber)] hover:opacity-90 text-white font-bold rounded-lg transition-all font-[family-name:var(--font-space-grotesk)] shadow-sm cursor-pointer">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </Show>

            {/* Signed In Controls */}
            <Show when="signed-in">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Link
                  href="/dashboard"
                  className="hidden sm:inline text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-inter)]"
                >
                  Dashboard
                </Link>

                {/* Only visible to ismysaastaken@gmail.com */}
                {userData?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-[11px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-amber-500/15 text-[var(--accent-amber)] border border-amber-500/30 hover:bg-amber-500/25 transition-colors font-bold"
                  >
                    Admin ⚡
                  </Link>
                )}

                <UserButton />
              </div>
            </Show>

            {/* Mobile Light / Dark Theme Toggle */}
            <ThemeToggle className="sm:hidden" />

            {/* Mobile / Tablet Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2 text-sm font-[family-name:var(--font-inter)]">
              <Link
                href="/#recent-scans"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] flex items-center justify-between"
              >
                <span>Live Feed</span>
                <span className="text-[10px] font-mono text-[var(--accent-amber)]">LIVE</span>
              </Link>
              <Link
                href="/roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] flex items-center justify-between"
              >
                <span>Public Roadmap</span>
                <span className="text-xs">🚀</span>
              </Link>
              <Link
                href="/keywords"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] flex items-center justify-between"
              >
                <span>Keyword Research</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-emerald-500/15 text-[var(--accent-emerald)] rounded font-bold border border-emerald-500/30">
                  NEW
                </span>
              </Link>
              <Link
                href="/is-it-taken"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] flex items-center justify-between"
              >
                <span>Is It Taken?</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-emerald-500/15 text-[var(--accent-emerald)] rounded font-bold border border-emerald-500/30">
                  NEW
                </span>
              </Link>
              <Link
                href="/roast"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-[var(--bg-surface-alt)] flex items-center justify-between font-medium"
              >
                <span>🔥 Roast Mode</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-orange-500/15 text-orange-600 dark:text-orange-400 rounded font-bold border border-orange-500/30">
                  HOT
                </span>
              </Link>
              <Link
                href="/why-validation-matters"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] flex items-center justify-between"
              >
                <span>Why Validation Matters</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-amber-500/15 text-[var(--accent-amber)] rounded font-bold border border-amber-500/30">
                  QUIZ
                </span>
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
              >
                Pricing &amp; Passes
              </Link>

              <div className="px-3 py-2 rounded-lg flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">Theme Mode</span>
                <ThemeToggle />
              </div>

              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] flex items-center justify-between"
                >
                  <span>Founder Dashboard</span>
                  <span className="text-xs">⚙️</span>
                </Link>
              </Show>
            </div>

            {/* Signed-out actions for mobile */}
            <Show when="signed-out">
              <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2">
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-surface-alt)] rounded-lg border border-[var(--border)]"
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-bold text-white bg-[var(--accent-amber)] rounded-lg font-[family-name:var(--font-space-grotesk)]"
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        )}
      </nav>

      {/* Upgrade Modal Triggered from Meter */}
      <UpgradeModal
        open={showUpgradeModal && userData?.role !== 'admin' && !userData?.is_admin}
        scansUsed={userData?.scansUsedThisMonth || 3}
        scansLimit={3}
        onDismiss={() => setShowUpgradeModal(false)}
      />
    </>
  );
}

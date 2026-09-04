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

export default function Navbar() {
  const [userData, setUserData] = useState<{ plan: 'free' | 'pro'; role?: 'user' | 'admin'; scansUsedThisMonth: number } | null>(null);
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
      <nav className="w-full border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%,0.92)] backdrop-blur-md sticky top-0 z-50">
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
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </Link>
          
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              href="/#recent-scans"
              className="hidden md:inline text-xs sm:text-sm text-[hsl(40,8%,55%)] hover:text-[hsl(40,20%,92%)] transition-colors font-[family-name:var(--font-inter)]"
            >
              Recent Scans
            </Link>
            <Link
              href="/roadmap"
              className="hidden md:inline text-xs sm:text-sm text-[hsl(40,8%,55%)] hover:text-[hsl(40,20%,92%)] transition-colors font-[family-name:var(--font-inter)]"
            >
              Roadmap 🚀
            </Link>
            <Link
              href="/keywords"
              className="text-xs sm:text-sm text-[hsl(40,8%,55%)] hover:text-[hsl(40,20%,92%)] transition-colors font-[family-name:var(--font-inter)] flex items-center gap-1.5"
            >
              <span>Keywords</span>
              <span className="text-[9px] font-[family-name:var(--font-mono)] uppercase px-1.5 py-0.5 bg-[hsl(145,60%,45%,0.15)] text-[hsl(145,60%,55%)] rounded border border-[hsl(145,60%,45%,0.3)] font-bold">
                NEW
              </span>
            </Link>
            <Link
              href="/name-check"
              className="hidden lg:inline text-xs sm:text-sm text-[hsl(40,8%,55%)] hover:text-[hsl(40,20%,92%)] transition-colors font-[family-name:var(--font-inter)]"
            >
              Name Check
            </Link>
            <Link
              href="/pricing"
              className="text-xs sm:text-sm text-[hsl(40,8%,55%)] hover:text-[hsl(40,20%,92%)] transition-colors font-[family-name:var(--font-inter)]"
            >
              Pricing
            </Link>

            {/* Signed In Scan Meter */}
            <Show when="signed-in">
              <ScanMeter
                plan={userData?.plan || 'free'}
                scansUsed={userData?.scansUsedThisMonth || 0}
                scansLimit={3}
                onClick={() => setShowUpgradeModal(true)}
              />
            </Show>

            {/* Market Alerts & Notifications */}
            <NotificationCenter />

            {/* Signed Out Controls */}
            <Show when="signed-out">
              <div className="hidden sm:flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="text-xs sm:text-sm px-2.5 py-1.5 text-[hsl(40,20%,90%)] hover:text-[hsl(42,95%,55%)] transition-colors font-[family-name:var(--font-inter)] cursor-pointer">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-xs sm:text-sm px-3.5 py-1.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold rounded-lg transition-all font-[family-name:var(--font-space-grotesk)] shadow-sm cursor-pointer">
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
                  className="hidden sm:inline text-xs sm:text-sm text-[hsl(40,8%,60%)] hover:text-[hsl(40,20%,92%)] transition-colors font-[family-name:var(--font-inter)]"
                >
                  Dashboard
                </Link>

                {/* Only visible to ismysaastaken@gmail.com */}
                {userData?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-[11px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)] border border-[hsl(42,95%,55%,0.3)] hover:bg-[hsl(42,95%,55%,0.25)] transition-colors font-bold"
                  >
                    Admin ⚡
                  </Link>
                )}

                <UserButton />
              </div>
            </Show>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1.5 text-[hsl(40,8%,60%)] hover:text-[hsl(40,20%,95%)] transition-colors rounded-lg bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)]"
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
          <div className="sm:hidden border-t border-[hsl(220,10%,16%)] bg-[hsl(220,15%,9%)] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2 text-sm font-[family-name:var(--font-inter)]">
              <Link
                href="/#recent-scans"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[hsl(40,20%,90%)] hover:bg-[hsl(220,12%,14%)] flex items-center justify-between"
              >
                <span>Live Feed</span>
                <span className="text-[10px] font-mono text-[hsl(42,95%,55%)]">LIVE</span>
              </Link>
              <Link
                href="/roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[hsl(40,20%,90%)] hover:bg-[hsl(220,12%,14%)] flex items-center justify-between"
              >
                <span>Public Roadmap</span>
                <span className="text-xs">🚀</span>
              </Link>
              <Link
                href="/keywords"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[hsl(40,20%,90%)] hover:bg-[hsl(220,12%,14%)] flex items-center justify-between"
              >
                <span>Keyword Research</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[hsl(145,60%,45%,0.15)] text-[hsl(145,60%,55%)] rounded font-bold border border-[hsl(145,60%,45%,0.3)]">
                  NEW
                </span>
              </Link>
              <Link
                href="/name-check"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[hsl(40,20%,90%)] hover:bg-[hsl(220,12%,14%)] flex items-center justify-between"
              >
                <span>Name &amp; Handle Checker</span>
                <span className="text-xs">🏷️</span>
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[hsl(40,20%,90%)] hover:bg-[hsl(220,12%,14%)]"
              >
                Pricing &amp; Passes
              </Link>

              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-[hsl(40,20%,90%)] hover:bg-[hsl(220,12%,14%)] flex items-center justify-between"
                >
                  <span>Founder Dashboard</span>
                  <span className="text-xs">⚙️</span>
                </Link>
              </Show>
            </div>

            {/* Signed-out actions for mobile */}
            <Show when="signed-out">
              <div className="pt-2 border-t border-[hsl(220,10%,16%)] flex items-center gap-2">
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-bold text-[hsl(40,20%,90%)] bg-[hsl(220,12%,14%)] rounded-lg border border-[hsl(220,10%,20%)]"
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-bold text-[hsl(220,15%,8%)] bg-[hsl(42,95%,55%)] rounded-lg font-[family-name:var(--font-space-grotesk)]"
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
        open={showUpgradeModal}
        scansUsed={userData?.scansUsedThisMonth || 3}
        scansLimit={3}
        onDismiss={() => setShowUpgradeModal(false)}
      />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [userData, setUserData] = useState<{ plan: 'free' | 'pro'; scansUsedThisMonth: number } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
      <nav className="w-full border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%,0.85)] backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-[1780px] mx-auto px-3 sm:px-5 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-space-grotesk)] font-bold text-[hsl(40,20%,92%)] text-base hover:text-[hsl(42,95%,55%)] transition-colors tracking-tight"
          >
            ismysaas<span className="text-[hsl(42,95%,55%)]">taken</span><span className="text-[hsl(40,8%,45%)]">?</span>
          </Link>
          
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              href="/#recent-scans"
              className="hidden md:inline text-xs sm:text-sm text-[hsl(40,8%,55%)] hover:text-[hsl(40,20%,92%)] transition-colors font-[family-name:var(--font-inter)]"
            >
              Recent Scans
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
              <div className="flex items-center gap-2">
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
                <Link
                  href="/admin"
                  className="text-[11px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)] border border-[hsl(42,95%,55%,0.3)] hover:bg-[hsl(42,95%,55%,0.25)] transition-colors font-bold"
                >
                  Admin ⚡
                </Link>
                <UserButton />
              </div>
            </Show>
          </div>
        </div>
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

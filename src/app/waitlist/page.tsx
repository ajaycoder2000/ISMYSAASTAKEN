import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import LaunchListWidget from '@/components/LaunchListWidget';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Join the Launch Waitlist — ismysaastaken?',
  description:
    'Join the waitlist for ismysaastaken?. Be first to verify your SaaS ideas, discover live competitors, and find defensible product wedges before writing code.',
  alternates: {
    canonical: '/waitlist',
  },
  openGraph: {
    title: 'Join the Launch Waitlist — ismysaastaken?',
    description:
      'Be first to verify your SaaS ideas, discover live competitors, and find defensible product wedges.',
    url: `${SITE_URL}/waitlist`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join the Launch Waitlist — ismysaastaken?',
    description:
      'Be first to verify your SaaS ideas, discover live competitors, and find defensible product wedges.',
  },
};

export default function WaitlistPage() {
  return (
    <main className="min-h-[88vh] flex flex-col justify-center items-center relative overflow-hidden py-12 sm:py-20 px-4">
      {/* Ambient background glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20 bg-[var(--accent-amber)]"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-10 bg-emerald-500"
        aria-hidden="true"
      />

      <div className="w-full max-w-xl mx-auto space-y-8 text-center relative z-10">
        {/* Brand Badge */}
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-[family-name:var(--font-mono)] font-bold uppercase tracking-wider bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border border-[var(--accent-amber)]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] animate-pulse" />
            Pre-Launch Waitlist
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
            Be first in line when we launch.
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-[family-name:var(--font-inter)] max-w-md mx-auto leading-relaxed">
            Verify if your SaaS idea is taken, surface live competitors, and spot defensible product wedges before writing code.
          </p>
        </div>

        {/* LaunchList Embedded Form Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
          <LaunchListWidget keyId="R7xdtZ" />
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          <div className="p-4 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)]">
            <div className="text-lg mb-1.5">🎁</div>
            <div className="text-xs font-bold text-[var(--text-primary)] font-[family-name:var(--font-space-grotesk)]">
              Founding Perks
            </div>
            <div className="text-[11px] text-[var(--text-dim)] font-[family-name:var(--font-inter)] mt-0.5 leading-snug">
              Bonus scan credits unlocked on launch day.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)]">
            <div className="text-lg mb-1.5">⚡</div>
            <div className="text-xs font-bold text-[var(--text-primary)] font-[family-name:var(--font-space-grotesk)]">
              Instant Moat Check
            </div>
            <div className="text-[11px] text-[var(--text-dim)] font-[family-name:var(--font-inter)] mt-0.5 leading-snug">
              Uncover crowded markets and find open wedges.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)]">
            <div className="text-lg mb-1.5">🚀</div>
            <div className="text-xs font-bold text-[var(--text-primary)] font-[family-name:var(--font-space-grotesk)]">
              Early Access
            </div>
            <div className="text-[11px] text-[var(--text-dim)] font-[family-name:var(--font-inter)] mt-0.5 leading-snug">
              Try new validation tools before public release.
            </div>
          </div>
        </div>

        {/* Navigation link back to main site */}
        <div className="pt-2">
          <Link
            href="/"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-colors font-[family-name:var(--font-inter)] inline-flex items-center gap-1.5"
          >
            ← Back to ismysaastaken.live
          </Link>
        </div>
      </div>
    </main>
  );
}

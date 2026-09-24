'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ScanCard from '@/components/scan/ScanCard';
import RateLimitMessage from '@/components/RateLimitMessage';
import LivePulse from '@/components/LivePulse';
import MomentumStat from '@/components/MomentumStat';
import ExpandedResultShowcase from '@/components/ExpandedResultShowcase';
import RecentScansSection from '@/components/RecentScansSection';
import HowItWorksPipeline from '@/components/HowItWorksPipeline';
import WhyThisExists from '@/components/WhyThisExists';
import KeywordTeaserSection from '@/components/KeywordTeaserSection';
import IsItTakenSection from '@/components/IsItTakenSection';
import MarketPlaybook from '@/components/MarketPlaybook';
import WeeklyGapSignup from '@/components/WeeklyGapSignup';
import HeroBackground from '@/components/HeroBackground';
import TypewriterHeadline from '@/components/TypewriterHeadline';
import PaywallModal from '@/components/PaywallModal';
import { IScanDocument } from '@/types';

const ScanGlobe = dynamic(() => import('@/components/ScanGlobe'), { ssr: false });
const LiveTerminalScan = dynamic(() => import('@/components/LiveTerminalScan'), { ssr: false });

export default function HomePage() {
  const [result, setResult] = useState<IScanDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);
  const [paywallMode, setPaywallMode] = useState<'PAYWALL' | 'SIGN_IN_REQUIRED' | null>(null);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full px-4 sm:px-6 lg:px-10 max-w-5xl mx-auto relative">
      {/* Main Centered Content Column */}
      <div className="w-full flex flex-col items-center">
        {/* Hero section */}
        <div className={`w-full mx-auto pt-8 sm:pt-14 pb-6 transition-all duration-300 relative overflow-hidden rounded-2xl ${result ? 'pt-4 sm:pt-6' : ''}`}>
          {/* Animated Hero Background Layer */}
          <HeroBackground />

          {!result && (
            <div className="mb-7 sm:mb-8 animate-fade-in relative z-10">
              <TypewriterHeadline />
              <p className="mt-3 sm:mt-3.5 text-subhead text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-relaxed max-w-xl">
                Describe your idea. We&apos;ll search the web for real competitors, 
                tell you how crowded the space is, and find the gap you could 
                actually build toward.
              </p>
              <div className="mt-4">
                <LivePulse />
              </div>
            </div>
          )}

          {/* Scan card */}
          <div className="w-full relative z-10">
            <ScanCard
              onResultChange={(doc) => setResult(doc)}
              onError={(msg) => setError(msg)}
              onRateLimited={(msg) => setRateLimitMsg(msg)}
              onPaywall={(mode) => setPaywallMode(mode)}
            />

            {!result && (
              <div className="mt-3.5 flex items-center justify-center">
                <Link
                  href="/roast"
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-950/40 via-red-950/30 to-amber-950/40 border border-orange-500/25 hover:border-orange-500/60 transition-all text-xs font-[family-name:var(--font-inter)] text-orange-200/90 shadow-sm hover:shadow-orange-950/30"
                >
                  <span className="text-sm group-hover:scale-110 transition-transform">🔥</span>
                  <span>
                    Want brutally honest feedback?{' '}
                    <span className="font-semibold text-orange-400 group-hover:underline underline-offset-4 font-[family-name:var(--font-mono)]">
                      Try Idea Roast Mode &rarr;
                    </span>
                  </span>
                </Link>
              </div>
            )}

            {/* Dotted globe rising from below scan box */}
            {!result && (
              <div
                className="relative mx-auto mt-8 w-full max-w-[320px] h-[170px] md:max-w-[560px] md:h-[300px] overflow-hidden"
                style={{ maskImage: "linear-gradient(to bottom, black 65%, transparent)" }}
              >
                <div className="absolute inset-x-0 top-0">
                  <ScanGlobe />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full mx-auto mt-6 bg-[var(--bg-surface-alt)] border border-red-500/30 rounded-lg p-4 sm:p-5 animate-fade-in relative z-10">
            <p className="text-sm text-red-600 dark:text-red-400 font-[family-name:var(--font-inter)]">
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="mt-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-[family-name:var(--font-mono)]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Rate limit message */}
        {rateLimitMsg && <RateLimitMessage message={rateLimitMsg} />}

        {/* Watch a scan run — Live Terminal Scan */}
        {!result && (
          <section className="w-full pt-8 sm:pt-12 pb-6 border-t border-[var(--border)] text-center relative z-10">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                Watch a scan run
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
                Real sources, real competitors, a clear verdict in seconds.
              </p>
            </div>
            <LiveTerminalScan />
          </section>
        )}

        {/* 1. Momentum / Scale Stat Block */}
        <MomentumStat />

        {/* 2. Is It Taken? — Startup Name & Handle Availability */}
        <div className="w-full pt-4 sm:pt-6 border-t border-[var(--border)]">
          <IsItTakenSection />
        </div>

        {/* 3. 3-Step Live Intelligence Engine */}
        <div className="w-full pt-6 sm:pt-10 border-t border-[var(--border)]">
          <HowItWorksPipeline />
        </div>

        {/* 3. Why This Exists (ChatGPT vs This Tool) */}
        <div className="w-full pt-8 sm:pt-12 border-t border-[var(--border)]">
          <WhyThisExists />
        </div>

        {/* 4. Search Demand & Keyword Radar Feature Showcase */}
        <div className="w-full pt-8 sm:pt-12 border-t border-[var(--border)]">
          <KeywordTeaserSection />
        </div>

        {/* 5. Expanded Result Showcase ("See a real result") */}
        <div className="w-full pt-8 sm:pt-12 border-t border-[var(--border)]">
          <ExpandedResultShowcase />
        </div>

        {/* 5. Founder Moat Playbook (Interactive Archetypes) */}
        <div className="w-full pt-10 sm:pt-16 border-t border-[var(--border)]">
          <MarketPlaybook />
        </div>

        {/* 6. Weekly Gap Report Signup Widget */}
        <div className="w-full pt-10 sm:pt-16 border-t border-[var(--border)]">
          <WeeklyGapSignup />
        </div>

        {/* 7. Recent Scans Live Feed */}
        <div className="w-full pt-12 sm:pt-16 border-t border-[var(--border)]">
          <RecentScansSection />
        </div>

        {/* Bottom Upgrade & Pricing CTA Card */}
        <div className="w-full mt-14 sm:mt-20 p-6 sm:p-10 bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-2xl text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-amber)]/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] mb-2 relative z-10">
            Ready to validate your next startup idea?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] max-w-lg mx-auto mb-6 relative z-10">
            Start with 1 free scan, or explore our $9 Sprint Pass and unlimited Founder Pro plans.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
            <Link
              href="/pricing"
              className="px-6 py-2.5 bg-[var(--accent-amber)] hover:opacity-90 text-black font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md"
            >
              View Plans & Passes →
            </Link>
            <Link
              href="/roadmap"
              className="px-5 py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[var(--text-primary)] text-xs sm:text-sm font-medium rounded-xl transition-all font-[family-name:var(--font-space-grotesk)]"
            >
              Public Roadmap 🚀
            </Link>
          </div>
        </div>

        {/* Freemium Paywall / Auth Gate Modal */}
        <PaywallModal
          isOpen={!!paywallMode}
          mode={paywallMode}
          onClose={() => setPaywallMode(null)}
          toolName="SaaS Idea Scanner"
        />

        {/* Bottom spacer */}
        <div className="pb-16" />
      </div>
    </div>
  );
}

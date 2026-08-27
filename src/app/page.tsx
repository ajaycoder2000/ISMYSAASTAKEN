'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScanForm from '@/components/ScanForm';
import ScanResult from '@/components/ScanResult';
import ScanLoadingState from '@/components/ScanLoadingState';
import RateLimitMessage from '@/components/RateLimitMessage';
import LivePulse from '@/components/LivePulse';
import MomentumStat from '@/components/MomentumStat';
import ExpandedResultShowcase from '@/components/ExpandedResultShowcase';
import RecentScansSection from '@/components/RecentScansSection';
import HowItWorksPipeline from '@/components/HowItWorksPipeline';
import WhyThisExists from '@/components/WhyThisExists';
import MarketPlaybook from '@/components/MarketPlaybook';
import WeeklyGapSignup from '@/components/WeeklyGapSignup';
import HeroBackground from '@/components/HeroBackground';
import TypewriterHeadline from '@/components/TypewriterHeadline';
import { IScanDocument } from '@/types';

export default function HomePage() {
  const [result, setResult] = useState<IScanDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);

  const handleResult = (data: IScanDocument) => {
    setResult(data);
    setError(null);
    setRateLimitMsg(null);
    setLoading(false);
  };

  const handleError = (message: string) => {
    setError(message);
    setLoading(false);
  };

  const handleRateLimited = (message: string) => {
    setRateLimitMsg(message);
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto relative">
      {/* Main Centered Content Column */}
      <div className="w-full flex flex-col items-center">
        {/* Hero section */}
        <div className={`w-full mx-auto pt-8 sm:pt-14 pb-6 transition-all duration-300 relative overflow-hidden rounded-2xl ${result ? 'pt-4 sm:pt-6' : ''}`}>
          {/* Animated Hero Background Layer */}
          <HeroBackground />

          {!result && (
            <div className="mb-7 sm:mb-8 animate-fade-in relative z-10">
              <TypewriterHeadline />
              <p className="mt-3 sm:mt-3.5 text-sm sm:text-base text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed max-w-xl">
                Describe your idea. We&apos;ll search the web for real competitors, 
                tell you how crowded the space is, and find the gap you could 
                actually build toward.
              </p>
              <div className="mt-4">
                <LivePulse />
              </div>
            </div>
          )}

          {/* Scan form */}
          <div className={`w-full relative z-10 ${result ? 'opacity-80 hover:opacity-100 transition-opacity' : ''}`}>
            <ScanForm
              onResult={handleResult}
              onError={handleError}
              onRateLimited={handleRateLimited}
              disabled={loading}
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && <ScanLoadingState />}

        {/* Error message */}
        {error && (
          <div className="w-full mx-auto mt-6 bg-[hsl(220,12%,12%)] border border-[hsl(0,72%,55%,0.3)] rounded-lg p-4 sm:p-5 animate-fade-in relative z-10">
            <p className="text-sm text-[hsl(0,72%,65%)] font-[family-name:var(--font-inter)]">
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="mt-2.5 text-xs text-[hsl(40,8%,45%)] hover:text-[hsl(40,20%,92%)] transition-colors font-[family-name:var(--font-mono)]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Rate limit message */}
        {rateLimitMsg && <RateLimitMessage message={rateLimitMsg} />}

        {/* Live Scan Results */}
        {result && (
          <div className="w-full pb-8 animate-slide-up relative z-10">
            <ScanResult data={result} showShareButton={true} />
          </div>
        )}

        {/* 1. Momentum / Scale Stat Block */}
        <MomentumStat />

        {/* 2. 3-Step Live Intelligence Engine */}
        <div className="w-full pt-6 sm:pt-10 border-t border-[hsl(220,10%,15%)]">
          <HowItWorksPipeline />
        </div>

        {/* 3. Why This Exists (ChatGPT vs This Tool) */}
        <div className="w-full pt-8 sm:pt-12 border-t border-[hsl(220,10%,15%)]">
          <WhyThisExists />
        </div>

        {/* 4. Expanded Result Showcase ("See a real result") */}
        <div className="w-full pt-8 sm:pt-12 border-t border-[hsl(220,10%,15%)]">
          <ExpandedResultShowcase />
        </div>

        {/* 5. Founder Moat Playbook (Interactive Archetypes) */}
        <div className="w-full pt-10 sm:pt-16 border-t border-[hsl(220,10%,15%)]">
          <MarketPlaybook />
        </div>

        {/* 6. Weekly Gap Report Signup Widget */}
        <div className="w-full pt-10 sm:pt-16 border-t border-[hsl(220,10%,15%)]">
          <WeeklyGapSignup />
        </div>

        {/* 7. Recent Scans Live Feed */}
        <div className="w-full pt-12 sm:pt-16 border-t border-[hsl(220,10%,15%)]">
          <RecentScansSection />
        </div>

        {/* Bottom Upgrade & Pricing CTA Card */}
        <div className="w-full mt-14 sm:mt-20 p-6 sm:p-10 bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(42,95%,55%,0.05)] rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] mb-2 relative z-10">
            Ready to validate your next startup idea?
          </h3>
          <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] max-w-md mx-auto mb-6 relative z-10">
            Start with 3 free scans every month, or explore our $9 Sprint Pass and unlimited Founder Pro plans.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
            <Link
              href="/pricing"
              className="px-6 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md"
            >
              View Plans & Passes →
            </Link>
            <Link
              href="/roadmap"
              className="px-5 py-2.5 bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,20%)] border border-[hsl(220,10%,24%)] text-[hsl(40,20%,90%)] text-xs sm:text-sm font-medium rounded-xl transition-all font-[family-name:var(--font-space-grotesk)]"
            >
              Public Roadmap 🚀
            </Link>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="pb-16" />
      </div>
    </div>
  );
}

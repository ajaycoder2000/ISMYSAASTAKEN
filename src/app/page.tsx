'use client';

import { useState } from 'react';
import ScanForm from '@/components/ScanForm';
import ScanResult from '@/components/ScanResult';
import ScanLoadingState from '@/components/ScanLoadingState';
import RateLimitMessage from '@/components/RateLimitMessage';
import LivePulse from '@/components/LivePulse';
import SponsorRail from '@/components/SponsorRail';
import MomentumStat from '@/components/MomentumStat';
import ExpandedResultShowcase from '@/components/ExpandedResultShowcase';
import RecentScansSection from '@/components/RecentScansSection';
import ProductPricingSection from '@/components/ProductPricingSection';
import SponsorshipSection from '@/components/SponsorshipSection';
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
    <div className="min-h-[calc(100vh-3.5rem)] w-full px-3 sm:px-5 lg:px-8 max-w-[1780px] mx-auto relative">
      {/* 3-Column Layout: Left Rail + Center Main Content + Right Rail */}
      <div className="flex justify-between gap-4 lg:gap-6 xl:gap-8 items-start w-full">
        {/* Left Sponsor Rail (Desktop Only ≥1200px) */}
        <aside className="hidden min-[1200px]:block w-[240px] xl:w-[260px] 2xl:w-[280px] flex-shrink-0 sticky top-14 self-start">
          <SponsorRail side="left" />
        </aside>

        {/* Main Centered Content Column */}
        <div className="w-full flex-1 max-w-3xl xl:max-w-4xl mx-auto flex flex-col items-center px-0 sm:px-2">
          {/* Hero section */}
          <div className={`w-full mx-auto pt-8 sm:pt-12 pb-6 transition-all duration-300 relative overflow-hidden rounded-2xl ${result ? 'pt-4 sm:pt-6' : ''}`}>
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

          {/* 1. Momentum / Scale Stat Block (Non-card bold metric) */}
          <MomentumStat />

          {/* 2. Expanded Result Showcase ("See a real result") */}
          <div className="w-full pt-10 sm:pt-16 border-t border-[hsl(220,10%,15%)]">
            <ExpandedResultShowcase />
          </div>

          {/* 3. Recent Scans Feed */}
          <div className="w-full pt-16 sm:pt-24">
            <RecentScansSection />
          </div>

          {/* 4. Product Pricing Section (Free vs Pro with monthly/yearly toggle) */}
          <div className="w-full pt-16 sm:pt-24 border-t border-[hsl(220,10%,15%)]">
            <ProductPricingSection />
          </div>

          {/* 5. Sponsorship Section */}
          <div className="w-full pt-16 sm:pt-24 border-t border-[hsl(220,10%,15%)]">
            <SponsorshipSection />
          </div>

          {/* Bottom spacer */}
          <div className="pb-16" />
        </div>

        {/* Right Sponsor Rail (Desktop Only ≥1200px) */}
        <aside className="hidden min-[1200px]:block w-[240px] xl:w-[260px] 2xl:w-[280px] flex-shrink-0 sticky top-14 self-start">
          <SponsorRail side="right" />
        </aside>
      </div>
    </div>
  );
}

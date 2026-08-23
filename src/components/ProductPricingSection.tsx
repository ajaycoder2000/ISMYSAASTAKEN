'use client';

import { useState } from 'react';
import Link from 'next/link';
import AnimatedPriceCounter from './AnimatedPriceCounter';

export default function ProductPricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="w-full mx-auto pt-4 sm:pt-6">
      {/* Section Header */}
      <div className="text-center mb-8">
        <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,50%)] block mb-1.5 font-semibold">
          Simple Pricing
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] tracking-tight">
          Invest before you build
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] max-w-md mx-auto">
          Every scan performs real-time LLM reasoning and live web crawling. Free gets you validation, Pro keeps you discovering.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="mt-5 inline-flex items-center bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={`px-3.5 py-1 text-xs font-[family-name:var(--font-mono)] rounded-md transition-all cursor-pointer ${
              billingPeriod === 'monthly'
                ? 'bg-[hsl(220,10%,20%)] text-[hsl(40,20%,92%)] font-bold shadow-sm'
                : 'text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,90%)]'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('yearly')}
            className={`px-3.5 py-1 text-xs font-[family-name:var(--font-mono)] rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              billingPeriod === 'yearly'
                ? 'bg-[hsl(220,10%,20%)] text-[hsl(40,20%,92%)] font-bold shadow-sm'
                : 'text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,90%)]'
            }`}
          >
            Yearly
            <span className="text-[10px] text-[hsl(42,95%,55%)] font-semibold bg-[hsl(42,95%,55%,0.15)] px-1.5 py-0.5 rounded">
              Save 31%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards (Free vs Pro) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
        {/* Free Plan — Visually Quiet */}
        <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                Free
              </h3>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)]">
                Starter
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                $0
              </span>
              <span className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
                /forever
              </span>
            </div>

            <ul className="space-y-2.5 mb-6 text-xs text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,8%,45%)]">✓</span>
                1 scan without signing up
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,8%,45%)]">✓</span>
                2 free scans/month after sign-in
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(40,8%,45%)]">✓</span>
                Full competitor search & pricing
              </li>
              <li className="flex items-start gap-2 text-[hsl(40,8%,35%)]">
                <span>✕</span>
                No saved scan history
              </li>
            </ul>
          </div>

          <Link
            href="/login"
            className="w-full text-center py-2.5 px-4 bg-[hsl(220,10%,16%)] hover:bg-[hsl(220,10%,22%)] text-[hsl(40,20%,90%)] text-xs font-semibold rounded-lg transition-all font-[family-name:var(--font-space-grotesk)]"
          >
            Start free →
          </Link>
        </div>

        {/* Pro Plan — Amber Emphasized with animated price counting & scanline hover */}
        <div className="bg-[hsl(220,12%,12%)] scanline-card border-2 border-[hsl(42,95%,55%)] shadow-[0_0_24px_rgba(245,166,35,0.12)] rounded-xl p-5 sm:p-6 flex flex-col justify-between relative transition-all duration-300">
          <div className="absolute -top-2.5 right-4 bg-[hsl(42,95%,55%)] text-[hsl(220,15%,8%)] text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider px-2 py-0.5 rounded z-20 shadow-sm">
            Pro
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                Pro
              </h3>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] font-bold">
                Unlimited
              </span>
            </div>

            {/* Dynamic Animated Number Counter */}
            <div className="flex items-baseline gap-1.5 mb-1">
              <AnimatedPriceCounter
                value={billingPeriod === 'monthly' ? 12 : 99}
                prefix="$"
                durationMs={450}
                className="text-2xl sm:text-3xl font-bold text-[hsl(40,20%,92%)]"
              />
              <span className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)] transition-all">
                {billingPeriod === 'monthly' ? '/month' : '/year'}
              </span>
            </div>

            <div className="h-4 mb-4">
              {billingPeriod === 'yearly' ? (
                <p className="text-[11px] text-[hsl(42,95%,55%)] font-[family-name:var(--font-mono)] animate-fade-in">
                  Just $8.25/month • Save $45/yr
                </p>
              ) : (
                <p className="text-[11px] text-[hsl(40,8%,40%)] font-[family-name:var(--font-mono)]">
                  Billed monthly • Cancel anytime
                </p>
              )}
            </div>

            <ul className="space-y-2.5 mb-6 text-xs text-[hsl(40,20%,85%)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)] font-bold">✓</span>
                Unlimited idea scans
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)] font-bold">✓</span>
                Saved scan history & bookmarks
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)] font-bold">✓</span>
                Full access to shareable result links
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)] font-bold">✓</span>
                Priority live web search processing
              </li>
            </ul>
          </div>

          <Link
            href="/pricing"
            className="w-full text-center py-2.5 px-4 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] text-xs font-bold rounded-lg transition-all font-[family-name:var(--font-space-grotesk)] shadow-md"
          >
            Upgrade to Pro →
          </Link>
        </div>
      </div>
    </section>
  );
}

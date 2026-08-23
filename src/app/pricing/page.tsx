'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedPriceCounter from '@/components/AnimatedPriceCounter';

interface UserSession {
  plan: string;
}

export default function PricingPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => setUser(data.user))
      .catch(() => {});
  }, []);

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(priceId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  };

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly';
  const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_yearly';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,50%)] block mb-1.5 font-semibold">
            Simple Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight text-[hsl(40,20%,92%)]">
            Invest before you build
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] max-w-md mx-auto">
            Every scan performs real-time LLM reasoning and live web crawling. Free gets you started. Pro keeps you discovering.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-6 inline-flex items-center bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 text-xs font-[family-name:var(--font-mono)] rounded-md transition-all cursor-pointer ${
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
              className={`px-4 py-1.5 text-xs font-[family-name:var(--font-mono)] rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
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

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto items-stretch">
          {/* Free tier */}
          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                  Free
                </h2>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)]">
                  Starter
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">$0</span>
                <span className="text-sm text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">/forever</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  '1 anonymous scan (no signup)',
                  '3 scans/month after signup',
                  'Full competitor analysis',
                  'Shareable result pages',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)]">
                    <svg className="w-4 h-4 text-[hsl(145,60%,45%)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
                {[
                  'No saved scan history',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[hsl(40,8%,30%)] font-[family-name:var(--font-inter)]">
                    <svg className="w-4 h-4 text-[hsl(40,8%,25%)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {user?.plan === 'free' ? (
              <div className="text-center py-2.5 text-sm text-[hsl(40,8%,45%)] font-[family-name:var(--font-mono)] bg-[hsl(220,10%,16%)] rounded-lg">
                Current plan
              </div>
            ) : !user ? (
              <Link
                href="/"
                className="block w-full text-center py-2.5 bg-[hsl(220,10%,16%)] hover:bg-[hsl(220,10%,22%)] border border-[hsl(220,10%,25%)] text-[hsl(40,20%,92%)] rounded-lg text-sm font-medium transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
              >
                Try it free →
              </Link>
            ) : null}
          </div>

          {/* Pro tier */}
          <div className="bg-[hsl(220,12%,12%)] scanline-card border-2 border-[hsl(42,95%,55%)] shadow-[0_0_24px_rgba(245,166,35,0.12)] rounded-xl p-6 sm:p-7 relative flex flex-col justify-between">
            <div className="absolute -top-3 right-6">
              <span className="bg-[hsl(42,95%,55%)] text-[hsl(220,15%,8%)] text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider px-3 py-1 rounded shadow-sm">
                Pro
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                  Pro
                </h2>
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
                  className="text-3xl font-bold text-[hsl(40,20%,92%)]"
                />
                <span className="text-sm text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
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

              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited scans',
                  'Full competitor analysis',
                  'Shareable result pages',
                  'Saved scan history',
                  'Priority during high traffic',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[hsl(40,20%,82%)] font-[family-name:var(--font-inter)]">
                    <svg className="w-4 h-4 text-[hsl(42,95%,55%)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {user?.plan === 'pro' ? (
              <div className="text-center py-2.5 text-sm text-[hsl(42,95%,55%)] font-[family-name:var(--font-mono)] bg-[hsl(42,95%,55%,0.15)] rounded-lg">
                ✓ Current plan
              </div>
            ) : (
              <div>
                <button
                  onClick={() => handleCheckout(billingPeriod === 'monthly' ? monthlyPriceId : yearlyPriceId)}
                  disabled={loading !== null}
                  className="w-full py-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-sm rounded-lg transition-all duration-200 disabled:opacity-50 font-[family-name:var(--font-space-grotesk)] shadow-md cursor-pointer"
                >
                  {loading !== null
                    ? 'Loading...'
                    : billingPeriod === 'monthly'
                    ? 'Start monthly — $12/mo →'
                    : 'Start yearly — $99/yr →'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FAQ footer */}
        <div className="mt-16 max-w-lg mx-auto text-center">
          <p className="text-xs text-[hsl(40,8%,35%)] font-[family-name:var(--font-inter)] leading-relaxed">
            Payments handled securely by Stripe. Cancel anytime — no questions, no hoops. 
            Your scan results stay accessible even if you downgrade.
          </p>
        </div>
      </div>
    </div>
  );
}

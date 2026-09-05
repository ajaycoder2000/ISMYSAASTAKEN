'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface PaywallModalProps {
  isOpen: boolean;
  mode: 'PAYWALL' | 'SIGN_IN_REQUIRED' | null;
  onClose: () => void;
  toolName?: string;
}

export default function PaywallModal({
  isOpen,
  mode,
  onClose,
  toolName = 'this tool',
}: PaywallModalProps) {
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mode) return null;

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push('/pricing');
      }
    } catch {
      router.push('/pricing');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,22%)] rounded-2xl shadow-2xl p-5 sm:p-8 z-10 overflow-hidden space-y-6">
        {/* Subtle accent glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[hsl(42,95%,55%,0.08)] rounded-full blur-3xl pointer-events-none" />

        {/* Header with close button */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            {mode === 'SIGN_IN_REQUIRED' ? (
              <span className="inline-block text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-2.5 py-0.5 rounded border border-[hsl(42,95%,55%,0.25)]">
                AUTHENTICATION REQUIRED
              </span>
            ) : (
              <span className="inline-block text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(0,75%,65%)] bg-[hsl(0,75%,65%,0.1)] px-2.5 py-0.5 rounded border border-[hsl(0,75%,65%,0.25)]">
                QUOTA REACHED // 1 FREE SCAN USED
              </span>
            )}

            <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] tracking-tight">
              {mode === 'SIGN_IN_REQUIRED'
                ? 'Sign in to use this tool'
                : "You've used your free scan"}
            </h2>

            <p className="text-xs sm:text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed">
              {mode === 'SIGN_IN_REQUIRED'
                ? `Create a free account or sign in to unlock your 1 combined free scan across SaaS Keyword Radar and Is It Taken.`
                : 'Upgrade to keep scanning Keyword Radar and Is It Taken — plus unlimited idea validation.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,95%)] bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,20%)] w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-pointer font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content based on mode */}
        {mode === 'SIGN_IN_REQUIRED' ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-[hsl(220,14%,8%)] border border-[hsl(220,10%,18%)] space-y-2 text-xs font-[family-name:var(--font-inter)] text-[hsl(40,20%,85%)]">
              <div className="flex items-center gap-2">
                <span className="text-[hsl(145,60%,55%)] font-bold">✓</span>
                <span>1 combined free scan for Keyword Radar &amp; Is It Taken</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(145,60%,55%)] font-bold">✓</span>
                <span>3 free AI idea scans every calendar month</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(145,60%,55%)] font-bold">✓</span>
                <span>No credit card required • Instant 5-second sign-in</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Link
                href="/sign-in"
                className="flex-1 py-2.5 px-4 text-center rounded-xl bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm font-[family-name:var(--font-space-grotesk)] transition-all shadow-md"
              >
                Sign In →
              </Link>
              <Link
                href="/sign-up"
                className="flex-1 py-2.5 px-4 text-center rounded-xl bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,24%)] text-[hsl(40,20%,90%)] hover:text-white font-bold text-xs sm:text-sm font-[family-name:var(--font-space-grotesk)] transition-colors"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5 pt-1">
            {/* Inline Plan Cards (Sprint Pass vs Founder Pro) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Sprint Pass */}
              <div className="bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,20%)] hover:border-[hsl(220,10%,30%)] rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                      Sprint Pass
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[hsl(145,60%,55%)] bg-[hsl(145,60%,45%,0.1)] px-1.5 py-0.5 rounded border border-[hsl(145,60%,45%,0.2)]">
                      7 DAYS
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)]">
                      $9
                    </span>
                    <span className="text-[10px] font-mono text-[hsl(40,8%,50%)]">one-time</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] font-[family-name:var(--font-inter)] text-[hsl(40,8%,65%)] pt-1">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[hsl(42,95%,55%)]">✓</span>
                      <span><strong>Unlimited</strong> new tools access</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[hsl(42,95%,55%)]">✓</span>
                      <span>25 deep idea scans</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[hsl(42,95%,55%)]">✓</span>
                      <span>Zero recurring subscription</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckout('price_sprint_9')}
                  disabled={checkoutLoading === 'price_sprint_9'}
                  className="w-full py-2 bg-[hsl(220,12%,16%)] hover:bg-[hsl(220,12%,22%)] border border-[hsl(220,10%,28%)] text-[hsl(40,20%,90%)] hover:text-white rounded-lg text-xs font-bold font-[family-name:var(--font-space-grotesk)] transition-all cursor-pointer"
                >
                  {checkoutLoading === 'price_sprint_9' ? 'Loading...' : 'Get Sprint Pass ($9) →'}
                </button>
              </div>

              {/* Founder Pro */}
              <div className="bg-[hsl(220,14%,12%)] border-2 border-[hsl(42,95%,55%)] rounded-xl p-4 flex flex-col justify-between space-y-3 relative shadow-lg">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                      Founder Pro
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.15)] px-1.5 py-0.5 rounded border border-[hsl(42,95%,55%,0.3)]">
                      ★ POPULAR
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)]">
                      $19
                    </span>
                    <span className="text-[10px] font-mono text-[hsl(40,8%,50%)]">/month</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] font-[family-name:var(--font-inter)] text-[hsl(40,20%,85%)] pt-1">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[hsl(42,95%,55%)]">✓</span>
                      <span><strong>Unlimited</strong> new tools access</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[hsl(42,95%,55%)]">✓</span>
                      <span><strong>Unlimited</strong> AI idea scans</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[hsl(42,95%,55%)]">✓</span>
                      <span>Pivot Moats &amp; PNG Exports</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckout('price_pro_monthly')}
                  disabled={checkoutLoading === 'price_pro_monthly'}
                  className="w-full py-2 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] rounded-lg text-xs font-bold font-[family-name:var(--font-space-grotesk)] transition-all cursor-pointer shadow-md"
                >
                  {checkoutLoading === 'price_pro_monthly' ? 'Loading...' : 'Upgrade to Pro ($19/mo) →'}
                </button>
              </div>
            </div>

            {/* Link to full pricing comparison */}
            <div className="text-center pt-1 border-t border-[hsl(220,10%,16%)]">
              <Link
                href="/pricing"
                onClick={onClose}
                className="text-xs text-[hsl(40,8%,50%)] hover:text-[hsl(42,95%,55%)] font-[family-name:var(--font-mono)] transition-colors underline"
              >
                Compare all features &amp; annual discounts on pricing page →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

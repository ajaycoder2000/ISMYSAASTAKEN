'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SessionData {
  user?: {
    id: string;
    email?: string;
    plan: string;
    scansUsed?: number;
  };
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Poll session briefly to allow webhook processing to reflect tier upgrade
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let attempts = 0;

    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data);
          if (data?.user?.plan && data.user.plan !== 'free') {
            setLoading(false);
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.warn('Failed to load session:', err);
      } finally {
        attempts++;
        if (attempts >= 5) {
          setLoading(false);
          clearInterval(intervalId);
        }
      }
    };

    fetchSession();
    intervalId = setInterval(fetchSession, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const planName = session?.user?.plan
    ? session.user.plan === 'sprint_pass'
      ? '7-Day Sprint Pass'
      : session.user.plan === 'founder_pro'
      ? 'Founder Pro'
      : session.user.plan === 'studio'
      ? 'Studio'
      : session.user.plan.toUpperCase()
    : 'Founder Pro';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,20%)] rounded-2xl shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[hsl(42,95%,55%,0.1)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[hsl(145,60%,45%,0.08)] rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[hsl(145,60%,45%,0.15)] border border-[hsl(145,60%,45%,0.3)] flex items-center justify-center text-3xl text-[hsl(145,60%,55%)] shadow-lg animate-in zoom-in-50 duration-300">
          ✓
        </div>

        {/* Header */}
        <span className="inline-block text-[11px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.25em] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)] px-3 py-1 rounded-full border border-[hsl(42,95%,55%,0.25)] mb-3">
          ORDER COMPLETE // PAYMENT SUCCESSFUL
        </span>

        <h1 className="text-2xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)] tracking-tight mb-3">
          You&apos;re All Set, Founder.
        </h1>

        <p className="text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed max-w-md mx-auto mb-8">
          Your payment was processed securely by Dodo Payments. Your account tier is now{' '}
          <strong className="text-[hsl(42,95%,55%)] font-semibold">
            {loading ? 'updating...' : planName}
          </strong>
          .
        </p>

        {/* Plan Highlights Card */}
        <div className="bg-[hsl(220,13%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-5 mb-8 text-left space-y-3 font-[family-name:var(--font-inter)] text-xs text-[hsl(40,20%,85%)]">
          <div className="flex items-center gap-2">
            <span className="text-[hsl(145,60%,55%)] font-bold">✓</span>
            <span>Live Google Search Grounding with AI Moat Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[hsl(145,60%,55%)] font-bold">✓</span>
            <span>Strategic Pivot Angles &amp; Executive Pitch Card PNG exports</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[hsl(145,60%,55%)] font-bold">✓</span>
            <span>Roast Mode AI critique &amp; Validated badge for qualifying landing pages</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[hsl(145,60%,55%)] font-bold">✓</span>
            <span>Full access to SaaS Keyword Radar &amp; Is It Taken tools</span>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] rounded-xl text-sm font-bold font-[family-name:var(--font-space-grotesk)] transition-all shadow-md text-center"
          >
            Run Your Next Scan →
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 bg-[hsl(220,12%,15%)] hover:bg-[hsl(220,12%,20%)] border border-[hsl(220,10%,24%)] text-[hsl(40,20%,90%)] hover:text-white rounded-xl text-sm font-bold font-[family-name:var(--font-space-grotesk)] transition-colors text-center"
          >
            View Dashboard
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-[hsl(220,10%,16%)] flex items-center justify-center gap-6 text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-mono)]">
          <Link href="/radar" className="hover:text-[hsl(42,95%,55%)] transition-colors">
            Keyword Radar
          </Link>
          <span>•</span>
          <Link href="/name-checker" className="hover:text-[hsl(42,95%,55%)] transition-colors">
            Is It Taken?
          </Link>
          <span>•</span>
          <Link href="/pricing" className="hover:text-[hsl(42,95%,55%)] transition-colors">
            View Tiers
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <div className="text-xs font-mono text-[hsl(40,8%,50%)]">Loading confirmation...</div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

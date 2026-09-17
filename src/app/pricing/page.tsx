'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import AnimatedPriceCounter from '@/components/AnimatedPriceCounter';

interface UserSession {
  id: string;
  email?: string;
  name?: string;
  plan: string;
}

const resolveDodoProductId = (key: string) => {
  if (key === 'price_sprint_9' || key === 'sprint_pass') {
    return process.env.NEXT_PUBLIC_DODO_SPRINT_PASS_PRODUCT_ID || 'pdt_0NnMyu4e7QVSBFRVyfgTG';
  }
  if (key === 'price_pro_yearly' || key === 'founder_pro_annual') {
    return process.env.NEXT_PUBLIC_DODO_FOUNDER_PRO_ANNUAL_PRODUCT_ID || 'pdt_0NnMytpeAfTAkzo2P45pE';
  }
  if (key === 'price_pro_monthly' || key === 'founder_pro') {
    return process.env.NEXT_PUBLIC_DODO_FOUNDER_PRO_PRODUCT_ID || 'pdt_0NnMytX9JyLRoQljhwwmj';
  }
  if (key === 'price_studio_49' || key === 'studio') {
    return process.env.NEXT_PUBLIC_DODO_STUDIO_PRODUCT_ID || 'pdt_0NnMytHDvd9MYJIXYfCwq';
  }
  return process.env.NEXT_PUBLIC_DODO_FOUNDER_PRO_PRODUCT_ID || 'pdt_0NnMytX9JyLRoQljhwwmj';
};

export default function PricingPage() {
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setUser(data?.user || null))
      .catch(() => {});
  }, []);

  const handleCheckout = async (planKey: string) => {
    setLoading(planKey);
    const productId = resolveDodoProductId(planKey);

    try {
      const bodyPayload: Record<string, any> = {
        product_cart: [{ product_id: productId, quantity: 1 }],
      };

      const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || user?.email;
      const userName = clerkUser?.fullName || clerkUser?.firstName || user?.name || (userEmail ? userEmail.split('@')[0] : 'Founder');
      const userId = clerkUser?.id || user?.id;

      if (userEmail && userEmail.includes('@')) {
        bodyPayload.customer = {
          email: userEmail,
          name: userName,
        };
      }

      if (userId) {
        bodyPayload.metadata = {
          userId,
        };
      }

      const res = await fetch('/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      if (data.error || !res.ok) {
        const errorMsg = data.message || data.error || text || 'Failed to initialize checkout';
        console.error('Dodo checkout error:', errorMsg);
        alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err?.message || 'Network error during checkout initialization.');
    } finally {
      setLoading(null);
    }
  };

  const faqs = [
    {
      q: 'How does the 7-Day Sprint Pass work?',
      a: 'The Sprint Pass is a one-time $9 payment that gives you 25 deep AI scans and full Pro access for 7 days. There is zero recurring subscription, making it perfect for hackathons or weekend ideation sprints.',
    },
    {
      q: 'Where does the competitor data come from?',
      a: 'Every scan triggers a live, real-time Google search grounding crawl that inspects active SaaS landing pages, Product Hunt launches, GitHub repos, and pricing directories.',
    },
    {
      q: 'Can I cancel my Founder Pro subscription anytime?',
      a: 'Yes, with one click in your dashboard. You retain Pro access until the end of your billing cycle, and your past scans remain saved forever.',
    },
    {
      q: 'When will founder tool sponsorships open?',
      a: 'We are prioritizing search accuracy and founder adoption first. Tool sponsorships will open in Phase 3 after reaching our monthly active scan milestone. You can preview the mockup and join the waitlist on our public roadmap.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-3 sm:px-6 py-12 sm:py-20 w-full max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <span className="text-meta font-[family-name:var(--font-mono)] uppercase tracking-[0.25em] text-[var(--accent-amber)] font-bold block mb-2">
          TRANSPARENT FOUNDER PRICING
        </span>
        <h1 className="text-display font-[family-name:var(--font-space-grotesk)] tracking-tight text-[var(--text-primary)]">
          Validate Before You Build
        </h1>
        <p className="mt-3 text-subhead text-[var(--text-secondary)] font-[family-name:var(--font-inter)] max-w-xl mx-auto">
          Every scan performs live web search grounding and deep competitive moat analysis. Start free, buy an ideation sprint pass, or unlock unlimited founder access.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="mt-8 inline-flex items-center bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-xl p-1 shadow-md">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={`px-5 py-2 text-xs sm:text-sm font-[family-name:var(--font-mono)] rounded-lg transition-all cursor-pointer ${
              billingPeriod === 'monthly'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('yearly')}
            className={`px-5 py-2 text-xs sm:text-sm font-[family-name:var(--font-mono)] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              billingPeriod === 'yearly'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Annual Billing
            <span className="text-[10px] text-[var(--accent-amber)] font-bold bg-[var(--accent-amber)]/10 px-2 py-0.5 rounded border border-[var(--accent-amber)]/30">
              Save 37%
            </span>
          </button>
        </div>
      </div>

      {/* 4-Tier Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-20">
        {/* Tier 1: Free */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                Starter
              </h3>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] px-2 py-0.5 rounded bg-[var(--bg-surface-alt)] border border-[var(--border)]">
                Free
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                $0
              </span>
              <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-inter)]">
                /forever
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mb-6">
              For curious builders testing their first concept.
            </p>

            <ul className="space-y-3 mb-8 text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span> 1 free scan (lifetime)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> 1 combined free scan <span className="text-[var(--text-muted)]">(shared Keyword Radar &amp; Is It Taken)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span> Live Google Search grounding
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span> Market saturation signal bars
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span> Roast Mode — blunt AI feedback on your idea <span className="text-[var(--text-muted)]">(1 scan only)</span>
              </li>
              <li className="flex items-start gap-2 text-[var(--text-dim)]">
                <span className="text-red-500 font-semibold">✕</span> No Validated Embeddable Badge <span className="text-[var(--text-dim)]">(Paid tiers only)</span>
              </li>
              <li className="flex items-start gap-2 text-[var(--text-dim)]">
                <span className="text-red-500 font-semibold">✕</span> No Pivot Moats or Pitch Deck Export
              </li>
            </ul>
          </div>

          <Link
            href="/"
            className="block w-full text-center py-2.5 bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl text-button transition-all font-[family-name:var(--font-space-grotesk)] shadow-sm font-semibold"
          >
            Start scanning free →
          </Link>
        </div>

        {/* Tier 2: 7-Day Sprint Pass */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-amber)]/40 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                Sprint Pass
              </h3>
              <span className="text-meta font-[family-name:var(--font-mono)] text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold">
                7 Days Access
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                $9
              </span>
              <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-inter)]">
                one-time (no sub)
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mb-6">
              For hackathons, brainstorming weekends, and active ideation sprints.
            </p>

            <ul className="space-y-3 mb-8 text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> <strong>25 deep scans</strong> for 7 days
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> <strong>Unlimited</strong> Keyword Radar &amp; Is It Taken
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Strategic Pivot Moat angles
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Executive Pitch Card PNG export
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Roast Mode — blunt AI feedback on your idea
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Validated badge for your landing page (on qualifying scans)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Zero recurring subscription fear
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout('price_sprint_9')}
            className="w-full py-2.5 bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-amber)] text-[var(--text-primary)] hover:text-[var(--accent-amber)] rounded-xl text-button transition-all font-[family-name:var(--font-space-grotesk)] cursor-pointer shadow-sm font-semibold"
          >
            Get 7-Day Pass — $9 →
          </button>
        </div>

        {/* Tier 3: Founder Pro (Hero / Most Popular) */}
        <div className="bg-[var(--bg-surface)] border-2 border-[var(--accent-amber)] shadow-[0_0_30px_rgba(245,166,35,0.15)] rounded-2xl p-6 sm:p-7 relative flex flex-col justify-between">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="bg-[var(--accent-amber)] text-black text-[11px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
              ★ Most Popular
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 mt-1">
              <h3 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                Founder Pro
              </h3>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--accent-amber)] font-bold">
                Unlimited
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-1">
              <AnimatedPriceCounter
                value={billingPeriod === 'monthly' ? 19 : 12}
                prefix="$"
                durationMs={450}
                className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]"
              />
              <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-inter)]">
                {billingPeriod === 'monthly' ? '/month' : '/mo (billed $144/yr)'}
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mb-6">
              For serial builders, indie hackers, and founders launching multiple products.
            </p>

            <ul className="space-y-3 mb-8 text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> <strong>Unlimited AI idea scans</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> <strong>Unlimited</strong> Keyword Radar &amp; Is It Taken
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Strategic Pivot Moats &amp; Wedges
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Executive Pitch Card PNG export
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Roast Mode — blunt AI feedback on your idea
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Validated badge for your landing page (on qualifying scans)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Saved scan history &amp; bookmarks
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-amber)] font-bold">✓</span> Priority LLM processing queue
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout(billingPeriod === 'monthly' ? 'price_pro_monthly' : 'price_pro_yearly')}
            className="w-full py-3 bg-[var(--accent-amber)] hover:opacity-90 text-black font-bold rounded-xl text-button transition-all shadow-md font-[family-name:var(--font-space-grotesk)] cursor-pointer"
          >
            Upgrade to Pro ({billingPeriod === 'monthly' ? '$19/mo' : '$12/mo'}) →
          </button>
        </div>

        {/* Tier 4: Studio / Lifetime Decoy */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                Studio
              </h3>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 font-bold">
                Agency
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
                $49
              </span>
              <span className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-inter)]">
                /month
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mb-6">
              For venture studios, agencies, and teams running client market research.
            </p>

            <ul className="space-y-3 mb-8 text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span> Everything in Founder Pro
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span> <strong>White-label PDF reports</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span> Raw CSV competitor exports
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span> 5 Team Member Seats
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout('price_studio_49')}
            className="w-full py-2.5 bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl text-button transition-all font-[family-name:var(--font-space-grotesk)] cursor-pointer shadow-sm font-semibold"
          >
            Start Studio — $49/mo →
          </button>
        </div>
      </div>

      {/* Trust Quote / Proof Signal */}
      <div className="w-full max-w-xl mx-auto text-center mb-16 p-4 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border)] shadow-sm">
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] italic">
          &ldquo;Found two direct competitors in 10 seconds that I completely missed after 3 days of manual Googling. Saved me 3 months of wasted build time.&rdquo;
        </p>
        <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)] mt-2 block font-medium">
          — Indie Hacker launching in Q3
        </span>
      </div>

      {/* Feature Comparison Table Across Free, Sprint Pass, Founder Pro */}
      <div className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-5 sm:p-10 mb-20 overflow-hidden shadow-xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.25em] text-[var(--accent-amber)] block mb-2">
            DETAILED BREAKDOWN
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
            Feature Comparison Matrix
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] font-[family-name:var(--font-inter)]">
            Clear limits, zero hidden gotchas. Shared freemium scan quota across all discovery tools.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-3.5 px-4 text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-muted)]">
                  Feature
                </th>
                <th className="py-3.5 px-4 text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-secondary)]">
                  Free
                </th>
                <th className="py-3.5 px-4 text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--accent-emerald)]">
                  Sprint Pass
                </th>
                <th className="py-3.5 px-4 text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--accent-amber)]">
                  Founder Pro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-xs font-[family-name:var(--font-inter)]">
              <tr className="hover:bg-[var(--bg-surface-alt)]/50 transition-colors">
                <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                  Idea Scanner
                </td>
                <td className="py-3.5 px-4 text-[var(--text-secondary)] font-mono">
                  3 scans/mo
                </td>
                <td className="py-3.5 px-4 text-[var(--text-primary)] font-mono">
                  Unlimited (7 days)
                </td>
                <td className="py-3.5 px-4 text-[var(--accent-amber)] font-bold font-mono">
                  Unlimited
                </td>
              </tr>
              <tr className="hover:bg-[var(--bg-surface-alt)]/50 transition-colors bg-[var(--bg-surface-alt)]/30">
                <td className="py-3.5 px-4 font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <span>SaaS Keyword Radar</span>
                  <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-emerald-500/15 text-[var(--accent-emerald)] border border-emerald-500/25">
                    New
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[var(--accent-amber)] font-mono font-medium">
                  1 combined free scan <span className="text-[var(--text-muted)]">(shared)</span>
                </td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)] font-mono font-medium">
                  Unlimited (7 days)
                </td>
                <td className="py-3.5 px-4 text-[var(--accent-amber)] font-bold font-mono">
                  Unlimited
                </td>
              </tr>
              <tr className="hover:bg-[var(--bg-surface-alt)]/50 transition-colors bg-[var(--bg-surface-alt)]/30">
                <td className="py-3.5 px-4 font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <span>Is It Taken?</span>
                  <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-emerald-500/15 text-[var(--accent-emerald)] border border-emerald-500/25">
                    New
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[var(--accent-amber)] font-mono font-medium">
                  1 combined free scan <span className="text-[var(--text-muted)]">(shared)</span>
                </td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)] font-mono font-medium">
                  Unlimited (7 days)
                </td>
                <td className="py-3.5 px-4 text-[var(--accent-amber)] font-bold font-mono">
                  Unlimited
                </td>
              </tr>
              <tr className="hover:bg-[var(--bg-surface-alt)]/50 transition-colors">
                <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                  Live Google Search Grounding
                </td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
              </tr>
              <tr className="hover:bg-[var(--bg-surface-alt)]/50 transition-colors">
                <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                  Strategic Pivot Moats &amp; Wedges
                </td>
                <td className="py-3.5 px-4 text-[var(--red)] font-semibold">✕</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
              </tr>
              <tr className="hover:bg-[var(--bg-surface-alt)]/50 transition-colors">
                <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                  Executive Pitch Deck PNG Export
                </td>
                <td className="py-3.5 px-4 text-[var(--red)] font-semibold">✕</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
              </tr>
              <tr className="hover:bg-[var(--bg-surface-alt)]/50 transition-colors">
                <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                  Saved Bookmarks &amp; History
                </td>
                <td className="py-3.5 px-4 text-[var(--red)] font-semibold">✕</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
              </tr>
              <tr className="hover:bg-[var(--bg-surface-alt)]/50 transition-colors">
                <td className="py-3.5 px-4 font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <span>Idea Roast Mode</span>
                  <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25">
                    Hot
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[var(--accent-amber)] font-mono font-medium">1 scan only</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ Included</td>
              </tr>
              <tr className="hover:bg-[var(--bg-surface-alt)]/50 transition-colors">
                <td className="py-3.5 px-4 font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <span>Validated Embeddable Badge</span>
                  <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-emerald-500/15 text-[var(--accent-emerald)] border border-emerald-500/25">
                    Seal
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[var(--accent-amber)] font-mono font-medium">1 scan only <span className="text-[var(--text-muted)]">(qualifying)</span></td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ (qualifying scans)</td>
                <td className="py-3.5 px-4 text-[var(--accent-emerald)]">✓ (qualifying scans)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-2 text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-muted)]">
          <span>⚖️ <strong>Trust Transparency:</strong> The 1 free scan on Free accounts is shared across both new tools (1 scan total across either tool, not 1 each).</span>
          <span className="text-[var(--accent-amber)]">Sprint Pass &amp; Founder Pro unlock unlimited scans for both.</span>
        </div>
      </div>

      {/* Sponsorship & Ad Placements Roadmap Teaser */}
      <div className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-12 mb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-amber)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mb-6 relative z-10">
          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.25em] text-[var(--accent-amber)] font-bold block mb-2">
            UPCOMING ROADMAP MILESTONE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
            Founder &amp; DevTool Sponsorship Network
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mt-2 leading-relaxed">
            Active sponsorships will open once our monthly founder validation volume reaches target scale. Explore our visual mockups, placement mechanics, and join the early partner waitlist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <Link
            href="/roadmap"
            className="px-6 py-3 bg-[var(--accent-amber)] hover:opacity-90 text-white font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-md"
          >
            Preview How Sponsorships Will Look →
          </Link>
          <Link
            href="/roadmap"
            className="px-5 py-3 bg-[var(--bg-surface-alt)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] text-xs sm:text-sm font-medium rounded-xl transition-all font-[family-name:var(--font-space-grotesk)]"
          >
            Join Early Sponsor Waitlist
          </Link>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-center text-[var(--text-primary)] mb-6">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] hover:text-[var(--accent-amber)] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-base text-[var(--text-muted)]">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-relaxed border-t border-[var(--border)]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

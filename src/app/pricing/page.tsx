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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  const handleCheckout = async (planKey: string) => {
    if (!user) {
      window.location.href = '/sign-in';
      return;
    }

    setLoading(planKey);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
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
      q: 'How do sponsor ad slots work?',
      a: 'Sponsors get high-visibility placement on both side rails of the scanner. We rotate up to 10 verified SaaS devtools/launchpads with live click-tracking telemetry.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-3 sm:px-6 py-12 sm:py-20 w-full max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.25em] text-[hsl(42,95%,55%)] font-bold block mb-2">
          TRANSPARENT FOUNDER PRICING
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight text-[hsl(40,20%,94%)]">
          Validate Before You Build
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] max-w-xl mx-auto">
          Every scan performs live web search grounding and deep competitive moat analysis. Start free, buy an ideation sprint pass, or unlock unlimited founder access.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="mt-8 inline-flex items-center bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl p-1 shadow-md">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={`px-5 py-2 text-xs sm:text-sm font-[family-name:var(--font-mono)] rounded-lg transition-all cursor-pointer ${
              billingPeriod === 'monthly'
                ? 'bg-[hsl(220,10%,20%)] text-[hsl(40,20%,94%)] font-bold shadow-sm'
                : 'text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,90%)]'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('yearly')}
            className={`px-5 py-2 text-xs sm:text-sm font-[family-name:var(--font-mono)] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              billingPeriod === 'yearly'
                ? 'bg-[hsl(220,10%,20%)] text-[hsl(40,20%,94%)] font-bold shadow-sm'
                : 'text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,90%)]'
            }`}
          >
            Annual Billing
            <span className="text-[10px] text-[hsl(42,95%,55%)] font-bold bg-[hsl(42,95%,55%,0.15)] px-2 py-0.5 rounded border border-[hsl(42,95%,55%,0.3)]">
              Save 37%
            </span>
          </button>
        </div>
      </div>

      {/* 4-Tier Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-20">
        {/* Tier 1: Free */}
        <div className="bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                Starter
              </h3>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)] px-2 py-0.5 rounded bg-[hsl(220,10%,16%)]">
                Free
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                $0
              </span>
              <span className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
                /forever
              </span>
            </div>
            <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-6">
              For curious builders testing their first concept.
            </p>

            <ul className="space-y-3 mb-8 text-xs text-[hsl(40,8%,70%)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(145,60%,45%)]">✓</span> 3 free scans every month
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(145,60%,45%)]">✓</span> Live Google Search grounding
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(145,60%,45%)]">✓</span> Market saturation signal bars
              </li>
              <li className="flex items-start gap-2 text-[hsl(40,8%,35%)]">
                <span>✕</span> No Pivot Moats or Pitch Deck Export
              </li>
            </ul>
          </div>

          <Link
            href="/"
            className="block w-full text-center py-2.5 bg-[hsl(220,10%,16%)] hover:bg-[hsl(220,10%,22%)] border border-[hsl(220,10%,25%)] text-[hsl(40,20%,90%)] rounded-xl text-xs font-bold transition-all font-[family-name:var(--font-space-grotesk)]"
          >
            Start scanning free →
          </Link>
        </div>

        {/* Tier 2: 7-Day Sprint Pass */}
        <div className="bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(220,10%,28%)] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                Sprint Pass
              </h3>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(145,60%,55%)] px-2 py-0.5 rounded bg-[hsl(145,60%,45%,0.1)] border border-[hsl(145,60%,45%,0.2)] font-bold">
                7 Days Access
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                $9
              </span>
              <span className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
                one-time (no sub)
              </span>
            </div>
            <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-6">
              For hackathons, brainstorming weekends, and active ideation sprints.
            </p>

            <ul className="space-y-3 mb-8 text-xs text-[hsl(40,8%,70%)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)]">✓</span> <strong>25 deep scans</strong> for 7 days
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)]">✓</span> Strategic Pivot Moat angles
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)]">✓</span> Executive Pitch Card PNG export
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)]">✓</span> Zero recurring subscription fear
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout('price_sprint_9')}
            className="w-full py-2.5 bg-[hsl(220,12%,16%)] hover:bg-[hsl(220,12%,22%)] border border-[hsl(220,10%,28%)] text-[hsl(40,20%,92%)] hover:text-[hsl(42,95%,55%)] rounded-xl text-xs font-bold transition-all font-[family-name:var(--font-space-grotesk)] cursor-pointer"
          >
            Get 7-Day Pass — $9 →
          </button>
        </div>

        {/* Tier 3: Founder Pro (Hero / Most Popular) */}
        <div className="bg-[hsl(220,14%,12%)] border-2 border-[hsl(42,95%,55%)] shadow-[0_0_30px_rgba(245,166,35,0.15)] rounded-2xl p-6 sm:p-7 relative flex flex-col justify-between">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="bg-[hsl(42,95%,55%)] text-[hsl(220,15%,8%)] text-[11px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
              ★ Most Popular
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 mt-1">
              <h3 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                Founder Pro
              </h3>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] font-bold">
                Unlimited
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-1">
              <AnimatedPriceCounter
                value={billingPeriod === 'monthly' ? 19 : 12}
                prefix="$"
                durationMs={450}
                className="text-3xl sm:text-4xl font-bold text-[hsl(40,20%,95%)]"
              />
              <span className="text-xs text-[hsl(40,8%,50%)] font-[family-name:var(--font-inter)]">
                {billingPeriod === 'monthly' ? '/month' : '/mo (billed $144/yr)'}
              </span>
            </div>

            <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-6">
              For serial builders, indie hackers, and founders launching multiple products.
            </p>

            <ul className="space-y-3 mb-8 text-xs text-[hsl(40,20%,85%)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)]">✓</span> <strong>Unlimited AI idea scans</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)]">✓</span> Strategic Pivot Moats & Wedges
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)]">✓</span> Executive Pitch Card PNG export
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)]">✓</span> Saved Bookmarks & History
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(42,95%,55%)]">✓</span> Priority search indexing queue
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout(billingPeriod === 'monthly' ? 'price_pro_monthly' : 'price_pro_yearly')}
            className="w-full py-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-lg shadow-[rgba(245,166,35,0.2)] cursor-pointer"
          >
            {billingPeriod === 'monthly' ? 'Upgrade to Pro — $19/mo →' : 'Upgrade to Pro — $144/yr →'}
          </button>
        </div>

        {/* Tier 4: Studio / Lifetime Decoy */}
        <div className="bg-[hsl(220,13%,11%)] border border-[hsl(220,10%,18%)] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                Studio
              </h3>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[hsl(260,80%,65%)] px-2 py-0.5 rounded bg-[hsl(260,80%,65%,0.1)] border border-[hsl(260,80%,65%,0.2)] font-bold">
                Agency
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
                $49
              </span>
              <span className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)]">
                /month
              </span>
            </div>
            <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-6">
              For venture studios, agencies, and teams running client market research.
            </p>

            <ul className="space-y-3 mb-8 text-xs text-[hsl(40,8%,70%)] font-[family-name:var(--font-inter)]">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(260,80%,65%)]">✓</span> Everything in Founder Pro
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(260,80%,65%)]">✓</span> <strong>White-label PDF reports</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(260,80%,65%)]">✓</span> Raw CSV competitor exports
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(260,80%,65%)]">✓</span> 5 Team Member Seats
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout('price_studio_49')}
            className="w-full py-2.5 bg-[hsl(220,12%,16%)] hover:bg-[hsl(220,12%,22%)] border border-[hsl(220,10%,28%)] text-[hsl(40,20%,92%)] rounded-xl text-xs font-bold transition-all font-[family-name:var(--font-space-grotesk)] cursor-pointer"
          >
            Start Studio — $49/mo →
          </button>
        </div>
      </div>

      {/* Sponsorship & Ad Placements Section */}
      <div className="w-full bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-3xl p-6 sm:p-12 mb-20">
        <div className="max-w-2xl mb-8">
          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.25em] text-[hsl(42,95%,55%)] font-bold block mb-2">
            SPONSORSHIP OPPORTUNITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
            Reach 10,000+ Active SaaS Founders Every Month
          </h2>
          <p className="text-xs sm:text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] mt-2 leading-relaxed">
            Our audience consists 100% of indie hackers, solo developers, and founders actively building software and looking for devtools, APIs, boilerplates, and launch platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] block mb-1">
                Sidebar Standard
              </span>
              <div className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(42,95%,55%)] mb-3">
                $49 <span className="text-xs text-[hsl(40,8%,45%)] font-normal">/month</span>
              </div>
              <ul className="space-y-2 text-xs text-[hsl(40,8%,65%)] font-[family-name:var(--font-inter)] mb-6">
                <li>• Permanent left/right sidebar card</li>
                <li>• Real-time click tracking</li>
                <li>• DoFollow backlink to your domain</li>
              </ul>
            </div>
            <a
              href="mailto:sponsor@ismysaastaken.com?subject=Sponsor%20Inquiry%20-%20Sidebar%20Standard"
              className="block w-full text-center py-2 bg-[hsl(220,10%,18%)] hover:bg-[hsl(220,10%,24%)] text-[hsl(40,20%,90%)] text-xs font-bold rounded-lg transition-all font-[family-name:var(--font-space-grotesk)]"
            >
              Book Slot ($49/mo) →
            </a>
          </div>

          <div className="bg-[hsl(220,12%,12%)] border-2 border-[hsl(42,95%,55%,0.5)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] block mb-1">
                Featured Anchor
              </span>
              <div className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(42,95%,55%)] mb-3">
                $149 <span className="text-xs text-[hsl(40,8%,45%)] font-normal">/month</span>
              </div>
              <ul className="space-y-2 text-xs text-[hsl(40,8%,65%)] font-[family-name:var(--font-inter)] mb-6">
                <li>• Top priority #1 position on sidebar</li>
                <li>• Featured tag & glowing border</li>
                <li>• Mentioned in weekly scan digest</li>
              </ul>
            </div>
            <a
              href="mailto:sponsor@ismysaastaken.com?subject=Sponsor%20Inquiry%20-%20Featured%20Anchor"
              className="block w-full text-center py-2 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] text-xs font-bold rounded-lg transition-all font-[family-name:var(--font-space-grotesk)]"
            >
              Book Featured ($149/mo) →
            </a>
          </div>

          <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] block mb-1">
                Category Takeover
              </span>
              <div className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(42,95%,55%)] mb-3">
                $299 <span className="text-xs text-[hsl(40,8%,45%)] font-normal">/month</span>
              </div>
              <ul className="space-y-2 text-xs text-[hsl(40,8%,65%)] font-[family-name:var(--font-inter)] mb-6">
                <li>• Exclusivity on all scanner results</li>
                <li>• Custom CTA badge inside scan reports</li>
                <li>• Direct founder intro in newsletters</li>
              </ul>
            </div>
            <a
              href="mailto:sponsor@ismysaastaken.com?subject=Sponsor%20Inquiry%20-%20Category%20Takeover"
              className="block w-full text-center py-2 bg-[hsl(220,10%,18%)] hover:bg-[hsl(220,10%,24%)] text-[hsl(40,20%,90%)] text-xs font-bold rounded-lg transition-all font-[family-name:var(--font-space-grotesk)]"
            >
              Contact for Takeover →
            </a>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-center text-[hsl(40,20%,94%)] mb-6">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] hover:text-[hsl(42,95%,55%)] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-base text-[hsl(40,8%,50%)]">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[hsl(40,8%,65%)] font-[family-name:var(--font-inter)] leading-relaxed border-t border-[hsl(220,10%,15%)]">
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

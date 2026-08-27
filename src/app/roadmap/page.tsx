'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RoadmapPage() {
  const [sponsorEmail, setSponsorEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [toolName, setToolName] = useState('');

  const handleSponsorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorEmail.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSponsorEmail('');
      setToolName('');
    }, 4000);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <span className="text-[11px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.25em] text-[hsl(42,95%,55%)] block mb-2">
          PUBLIC PRODUCT PIPELINE
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] tracking-tight mb-3">
          IsMySaaSTaken Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] max-w-xl mx-auto leading-relaxed">
          We build in public. Explore what has shipped, what is in active development, and what is planned for our upcoming quarterly milestones.
        </p>
      </div>

      {/* Roadmap Stages */}
      <div className="space-y-10 mb-16">
        {/* Stage 1: Shipped */}
        <div className="bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,18%)] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(145,60%,55%)]" />
            <h2 className="text-sm sm:text-base font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(145,60%,55%)]">
              Phase 1: Core Engine & Grounding (Live in Production)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-[hsl(40,8%,70%)] font-[family-name:var(--font-inter)]">
            <div className="p-3.5 bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl">
              <span className="font-bold text-[hsl(40,20%,92%)] block mb-1">✓ Live Web Search Grounding</span>
              <span>Real-time crawler scanning active SaaS landing pages, Product Hunt, and pricing indices.</span>
            </div>
            <div className="p-3.5 bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl">
              <span className="font-bold text-[hsl(40,20%,92%)] block mb-1">✓ 2D Market Saturation Scatter Map</span>
              <span>Interactive scatter matrix mapping competitor establishment vs crowdedness with PNG export.</span>
            </div>
            <div className="p-3.5 bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl">
              <span className="font-bold text-[hsl(40,20%,92%)] block mb-1">✓ 7-Day Sprint Pass & Pro Tiers</span>
              <span>No-subscription $9 pass option for weekend hackathons alongside Founder Pro unlimited.</span>
            </div>
            <div className="p-3.5 bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl">
              <span className="font-bold text-[hsl(40,20%,92%)] block mb-1">✓ Dynamic Daily Idea Stream</span>
              <span>Member feed with category filtering (AI, DevTools, Micro-SaaS) updated every 24 hours.</span>
            </div>
          </div>
        </div>

        {/* Stage 2: In Active Development */}
        <div className="bg-[hsl(220,14%,10%)] border border-[hsl(42,95%,55%,0.3)] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(42,95%,55%)] animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(42,95%,55%)]">
              Phase 2: Founder Workspace & Alerts (In Development)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-[hsl(40,8%,70%)] font-[family-name:var(--font-inter)]">
            <div className="p-3.5 bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl">
              <span className="font-bold text-[hsl(40,20%,92%)] block mb-1">⚡ Competitor Price Shift Webhooks</span>
              <span>Automatic alerts when a tracked competitor raises prices, drops free tiers, or pivots.</span>
            </div>
            <div className="p-3.5 bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-xl">
              <span className="font-bold text-[hsl(40,20%,92%)] block mb-1">⚡ 1-Click Linear & GitHub Ticket Sync</span>
              <span>Export identified open market wedges straight into sprint backlogs with reproduction steps.</span>
            </div>
          </div>
        </div>

        {/* Stage 3: Planned - Founder & Tool Sponsorship Network */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,20%)] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(260,80%,65%)]" />
              <h2 className="text-sm sm:text-base font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(260,80%,65%)]">
                Phase 3: Founder & DevTool Sponsorship Network (Upcoming Milestone)
              </h2>
            </div>
            <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.15)] px-2.5 py-0.5 rounded-full border border-[hsl(42,95%,55%,0.3)]">
              Scheduled post-traffic milestone
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[hsl(40,8%,60%)] font-[family-name:var(--font-inter)] leading-relaxed mb-6">
            To ensure maximum ROI for advertisers, we are holding off on active sponsorship bookings until our monthly founder scan volume reaches our target traffic milestone. Here is an exact preview of how verified devtools, boilerplate providers, and SaaS services will be showcased.
          </p>

          {/* Interactive Visual Preview / Mockup of Sponsor Card */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2 text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
              <span>MOCKUP PREVIEW: HOW SPONSORS WILL APPEAR</span>
              <span className="text-[hsl(145,60%,55%)]">Targeted by Idea Category</span>
            </div>

            {/* Example Sponsor Card Mockup */}
            <div className="bg-[hsl(220,13%,12%)] border-2 border-[hsl(42,95%,55%,0.4)] rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(220,15%,18%)] border border-[hsl(220,10%,26%)] flex items-center justify-center text-lg font-bold text-[hsl(42,95%,55%)] flex-shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
                        Supabase — Backend & Database for Builders
                      </h4>
                      <span className="text-[9px] font-bold font-[family-name:var(--font-mono)] bg-[hsl(42,95%,55%,0.15)] text-[hsl(42,95%,55%)] px-1.5 py-0.2 rounded border border-[hsl(42,95%,55%,0.3)]">
                        ⭐ SPONSORED TOOL
                      </span>
                    </div>
                    <p className="text-xs text-[hsl(40,8%,65%)] font-[family-name:var(--font-inter)] leading-relaxed max-w-xl mb-2">
                      The open source Firebase alternative. Build production apps with instant Postgres database, authentication, instant APIs, and edge functions in seconds.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
                      <span>🎯 Matched Context: Shown on DevTools & Database idea scans</span>
                      <span>•</span>
                      <span className="text-[hsl(145,60%,55%)]">DoFollow Direct Link</span>
                    </div>
                  </div>
                </div>

                <span className="hidden sm:inline-block px-3 py-1.5 bg-[hsl(42,95%,55%)] text-[hsl(220,15%,8%)] text-xs font-bold font-[family-name:var(--font-space-grotesk)] rounded-lg shadow-sm">
                  Visit Tool ↗
                </span>
              </div>
            </div>
          </div>

          {/* Waitlist Form */}
          <div className="p-5 bg-[hsl(220,12%,11%)] border border-[hsl(220,10%,18%)] rounded-xl">
            <h3 className="text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] mb-1">
              Interested in reaching founders when sponsorship slots open?
            </h3>
            <p className="text-xs text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-4">
              Join the early sponsor list to get notified first with discounted launch partner rates.
            </p>

            {submitted ? (
              <div className="p-3 bg-[hsl(145,60%,45%,0.1)] border border-[hsl(145,60%,45%,0.3)] rounded-lg text-xs font-[family-name:var(--font-mono)] text-[hsl(145,60%,55%)]">
                ✓ Thank you! We&apos;ve added {sponsorEmail || 'your email'} to our early sponsor cohort.
              </div>
            ) : (
              <form onSubmit={handleSponsorSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Your tool / company name"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="bg-[hsl(220,14%,14%)] border border-[hsl(220,10%,22%)] rounded-xl px-3.5 py-2 text-xs text-[hsl(40,20%,92%)] font-[family-name:var(--font-inter)] outline-none focus:border-[hsl(42,95%,55%)]"
                />
                <input
                  type="email"
                  required
                  placeholder="founder@company.com"
                  value={sponsorEmail}
                  onChange={(e) => setSponsorEmail(e.target.value)}
                  className="flex-1 bg-[hsl(220,14%,14%)] border border-[hsl(220,10%,22%)] rounded-xl px-3.5 py-2 text-xs text-[hsl(40,20%,92%)] font-[family-name:var(--font-mono)] outline-none focus:border-[hsl(42,95%,55%)]"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] text-xs font-bold font-[family-name:var(--font-space-grotesk)] rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  Join Sponsor Waitlist →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8 border-t border-[hsl(220,10%,16%)]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-xs sm:text-sm rounded-xl transition-all font-[family-name:var(--font-space-grotesk)] shadow-lg shadow-[rgba(245,166,35,0.15)]"
        >
          Check your SaaS idea free →
        </Link>
      </div>
    </div>
  );
}

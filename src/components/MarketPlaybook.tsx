'use client';

import { useState } from 'react';

interface Archetype {
  id: string;
  badge: string;
  name: string;
  tagline: string;
  classicExample: string;
  thePlaybook: string;
  winningMetric: string;
  exampleIdea: string;
}

const archetypes: Archetype[] = [
  {
    id: 'antibloat',
    badge: '10x Faster',
    name: 'The Anti-Bloat Wedge',
    tagline: 'Take the 1 core feature users actually care about and make it blazing fast.',
    classicExample: 'Linear vs. Jira • Notion vs. Confluence',
    thePlaybook:
      'Entrenched SaaS giants add 500 features over 10 years, making their UI sluggish and clunky. Win by building zero-lag keyboard shortcuts, minimalist design, and instant loading.',
    winningMetric: 'Time to value < 30 seconds (no 6-week onboarding calls)',
    exampleIdea: 'Minimalist issue tracker for 5-person indie teams with keyboard-first UI',
  },
  {
    id: 'opensource',
    badge: 'Developer Moat',
    name: 'The Open-Source Alternative',
    tagline: 'Give developers a self-hostable core, monetize cloud scale and enterprise compliance.',
    classicExample: 'Supabase vs. Firebase • PostHog vs. Mixpanel',
    thePlaybook:
      'Developers hate vendor lock-in. By offering an open-source MIT/AGPL core, you win grassroots trust and organic developer word-of-mouth with zero initial marketing budget.',
    winningMetric: 'Community GitHub stars & self-hosted Docker deployments',
    exampleIdea: 'Open-source error tracking and APM for Next.js with self-hosted Docker compose',
  },
  {
    id: 'vertical',
    badge: 'High Pricing Power',
    name: 'The Vertical Specialist',
    tagline: 'Tailor a generic software exclusively for one high-paying, under-served industry.',
    classicExample: 'Toast (Restaurants) • ServiceTitan (Contractors)',
    thePlaybook:
      'A generic CRM or invoicing tool cannot handle industry-specific jargon, HIPAA regulations, or specialized equipment tracking. Niche buyers will happily pay 3x more for native industry workflows.',
    winningMetric: '$100–$500/mo ARPU from low-churn vertical businesses',
    exampleIdea: 'HIPAA-compliant client intake and automated SMS reminder portal for dental clinics',
  },
  {
    id: 'microtool',
    badge: 'Impulse Buy',
    name: 'The Browser / Bot Entry Wedge',
    tagline: 'Deliver value directly where users already work (Chrome, Slack, Raycast, Telegram).',
    classicExample: 'Grammarly • Loom • Tweet Hunter',
    thePlaybook:
      'Never ask users to open another browser tab. Embed your tool directly into their daily workflow with a 1-click browser extension or bot. Upsell them to a web dashboard once habit is formed.',
    winningMetric: 'Daily active usage via browser overlay or desktop hotkey',
    exampleIdea: 'Chrome extension that extracts B2B pricing tables into structured Google Sheets',
  },
];

export default function MarketPlaybook() {
  const [activeTab, setActiveTab] = useState<string>('antibloat');
  const active = archetypes.find((a) => a.id === activeTab) || archetypes[0];

  return (
    <section className="w-full mx-auto py-10 sm:py-16">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-[0.25em] text-[var(--accent-amber)] font-bold block mb-2">
          FOUNDER PLAYBOOK
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] tracking-tight">
          How to Win in a &ldquo;Crowded&rdquo; Market
        </h2>
        <p className="mt-2.5 text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] max-w-xl mx-auto">
          Every giant has blind spots. Explore the 4 strategic archetypes used by modern founders to carve out multi-million dollar wedges.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {archetypes.map((item) => {
          const isSelected = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-[var(--bg-surface)] border-[var(--accent-amber)] shadow-[0_0_18px_rgba(245,166,35,0.12)]'
                  : 'bg-[var(--bg-surface-alt)] border-[var(--border)] hover:border-[var(--text-dim)] opacity-80 hover:opacity-100'
              }`}
            >
              <span className="text-[9px] font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] font-semibold block w-fit mb-1.5 border border-[var(--accent-amber)]/20">
                {item.badge}
              </span>
              <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] leading-snug">
                {item.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Interactive Detail Card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 mb-5 border-b border-[var(--border)]">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
              {active.name}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--accent-amber)] font-[family-name:var(--font-inter)] font-medium mt-0.5">
              {active.tagline}
            </p>
          </div>
          <span className="text-xs font-[family-name:var(--font-mono)] px-2.5 py-1 rounded bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] border border-[var(--border)]">
            🏆 {active.classicExample}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-muted)] block mb-1.5 font-semibold">
              THE PLAYBOOK
            </span>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-relaxed">
              {active.thePlaybook}
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-xl">
              <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--accent-amber)] block mb-1 font-bold">
                KEY WINNING METRIC
              </span>
              <p className="text-xs font-[family-name:var(--font-inter)] text-[var(--text-primary)] font-medium">
                {active.winningMetric}
              </p>
            </div>

            <div className="p-3.5 bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-xl">
              <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-muted)] block mb-1 font-semibold">
                SAMPLE VALIDATED IDEA
              </span>
              <p className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-secondary)]">
                &ldquo;{active.exampleIdea}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

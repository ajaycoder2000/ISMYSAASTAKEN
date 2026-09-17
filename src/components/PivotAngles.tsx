'use client';

import { useState } from 'react';

interface PivotAnglesProps {
  ideaText: string;
  saturationScore: 'low' | 'medium' | 'high';
  competitors: Array<{ name: string; url?: string }>;
}

interface Angle {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  moat: string;
  targetAudience: string;
  pricingPlay: string;
}

export default function PivotAngles({
  ideaText,
  saturationScore,
  competitors,
}: PivotAnglesProps) {
  const [selectedAngle, setSelectedAngle] = useState<string>('vertical');
  const [copied, setCopied] = useState(false);

  const topCompetitor = competitors[0]?.name || 'the incumbents';

  const angles: Angle[] = [
    {
      id: 'vertical',
      title: 'Vertical ICP Specialist',
      badge: 'High Win-Rate',
      tagline: `Build specifically for ONE industry instead of competing as a generic tool like ${topCompetitor}.`,
      moat: `Tailor terminology, compliance, integrations, and presets specifically for (e.g. Legal, Healthcare, Real Estate, or Creators). Generic tools can't out-customize you.`,
      targetAudience: 'Niche operators willing to pay 3-5x for industry-native workflow',
      pricingPlay: '$49 - $199/month (niche value vs generic commodity)',
    },
    {
      id: 'opensource',
      title: 'The Open-Source Moat',
      badge: 'Viral Growth',
      tagline: `Launch an AGPL / MIT core that developers can self-host, then monetize cloud hosting & enterprise SSO.`,
      moat: `Self-hosting captures privacy-conscious devs and EU/healthcare compliance buyers who are forbidden from using closed proprietary SaaS like ${topCompetitor}.`,
      targetAudience: 'DevOps engineers, privacy-first teams, agencies',
      pricingPlay: 'Free self-hosted + $29/mo managed cloud + $499/mo enterprise',
    },
    {
      id: 'speed',
      title: 'Anti-Bloat Micro-Wedge',
      badge: 'Fastest To Ship',
      tagline: `Take the ONE feature 80% of ${topCompetitor}'s users actually care about and make it 10x faster.`,
      moat: `No 40-tab dashboard, no 6-week onboarding calls. Instant zero-setup utility with browser extension or Telegram/Slack bot entry point.`,
      targetAudience: 'Solo founders, freelancers, busy executives',
      pricingPlay: '$9 - $19/mo impulse buy or $79 lifetime deal',
    },
  ];

  const current = angles.find((a) => a.id === selectedAngle) || angles[0];

  const handleCopyStrategy = () => {
    const text = `Strategy Wedge: ${current.title}\n• Concept: ${current.tagline}\n• Moat: ${current.moat}\n• Target ICP: ${current.targetAudience}\n• Pricing: ${current.pricingPlay}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--accent-amber)]/30 rounded-xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-amber)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)]">
              ⚡ Strategic Pivot Wedges
            </span>
            <span className="text-[10px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border border-[var(--accent-amber)]/30 font-bold">
              AI MOAT ENGINE
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] mt-1">
            {saturationScore === 'high'
              ? 'Market is crowded. Here are 3 distinct battle-tested angles to carve out your profitable moat:'
              : 'Differentiate early before competitors catch up with these 3 strategic wedge angles:'}
          </p>
        </div>

        <button
          onClick={handleCopyStrategy}
          className="self-start sm:self-center px-3 py-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent-amber)]/40 text-[var(--text-secondary)] hover:text-[var(--accent-amber)] text-xs font-[family-name:var(--font-mono)] transition-all flex items-center gap-1.5 cursor-pointer bg-[var(--bg-surface-alt)] font-medium"
        >
          {copied ? '✓ Copied Strategy' : '📋 Copy Wedge'}
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {angles.map((angle) => {
          const isActive = angle.id === selectedAngle;
          return (
            <button
              key={angle.id}
              onClick={() => setSelectedAngle(angle.id)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--bg-surface-alt)] border-[var(--accent-amber)] shadow-[0_0_15px_rgba(245,166,35,0.1)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border)] hover:border-[var(--text-dim)] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] truncate">
                  {angle.title}
                </span>
                <span className="text-[9px] font-[family-name:var(--font-mono)] px-1.5 py-0.2 rounded bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border border-[var(--border)] flex-shrink-0">
                  {angle.badge}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-[family-name:var(--font-inter)] line-clamp-1">
                {angle.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Angle Drilldown Card */}
      <div className="bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-lg p-4 space-y-3 shadow-sm">
        <div>
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--accent-amber)] font-semibold block mb-1">
            CORE WEDGE PROPOSITION
          </span>
          <p className="text-sm font-medium text-[var(--text-primary)] font-[family-name:var(--font-inter)] leading-relaxed">
            {current.tagline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
          <div>
            <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-muted)] block mb-1 font-semibold">
              DEFENSIBLE MOAT
            </span>
            <p className="text-xs text-[var(--text-secondary)] font-[family-name:var(--font-inter)] leading-relaxed">
              {current.moat}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--text-muted)] block mb-1 font-semibold">
              SUGGESTED MONETIZATION
            </span>
            <p className="text-xs text-[var(--accent-amber)] font-[family-name:var(--font-mono)] font-semibold leading-relaxed">
              {current.pricingPlay}
            </p>
            <span className="text-[10px] text-[var(--text-dim)] font-[family-name:var(--font-inter)] block mt-1">
              ICP: {current.targetAudience}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

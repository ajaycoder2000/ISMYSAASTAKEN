'use client';

import { useState } from 'react';
import SignalBars from './SignalBars';
import DecryptText from './DecryptText';
import { SaturationLevel } from '@/types';

interface ShowcaseScenario {
  id: string;
  tabLabel: string;
  badgeType: 'wedge' | 'gap' | 'crowded';
  ideaText: string;
  targetAudience: string;
  pricePoint: string;
  coreAngle: string;
  saturationScore: SaturationLevel;
  saturationReasoning: string;
  competitors: {
    name: string;
    pricing: string;
    desc: string;
    url: string;
    quadrant: 'enterprise' | 'bloated' | 'niche';
  }[];
  quadrantConfig: {
    xAxisLabel: string; // e.g. Complexity: Lightweight -> Enterprise
    yAxisLabel: string; // e.g. Pricing: Micro-SaaS -> High Enterprise
    yourIdeaPosition: { x: number; y: number }; // percentage 0-100
    competitorsPosition: { name: string; x: number; y: number }[];
  };
  gapAnalysis: string;
}

const SCENARIOS: ShowcaseScenario[] = [
  {
    id: 'zendesk-linear',
    tabLabel: 'Support Bug Extractor',
    badgeType: 'wedge',
    ideaText: 'An AI tool that monitors customer support tickets from Zendesk, extracts recurring bugs, and auto-writes detailed Jira & Linear tickets with reproduction steps.',
    targetAudience: 'Product & Engineering teams at fast-growing startups',
    pricePoint: '$29 - $49 / month',
    coreAngle: 'Zero-config repro extraction without migrating CRM',
    saturationScore: 'medium',
    saturationReasoning: 'Enterprise suites (Thena, DevRev) lock customers into six-figure CRMs. No lightweight developer-first repro synthesizer exists for small teams.',
    competitors: [
      { name: 'Thena', pricing: '$500/mo+', desc: 'Heavy B2B customer support hub for Slack/Zendesk to Linear.', url: 'https://thena.ai', quadrant: 'enterprise' },
      { name: 'DevRev', pricing: '$20/user/mo', desc: 'Heavyweight AI CRM unifying tickets directly with code repos.', url: 'https://devrev.ai', quadrant: 'enterprise' },
      { name: 'Unthread', pricing: '$400/mo', desc: 'AI-assisted routing and engineering sync across Slack.', url: 'https://unthread.io', quadrant: 'enterprise' },
      { name: 'Jira Discovery', pricing: '$10/user/mo', desc: "Atlassian's native customer feedback into sprint backlogs.", url: 'https://atlassian.com', quadrant: 'enterprise' },
    ],
    quadrantConfig: {
      xAxisLabel: 'Complexity (Lightweight → Enterprise Suite)',
      yAxisLabel: 'Pricing (Micro-SaaS → High Enterprise)',
      yourIdeaPosition: { x: 22, y: 78 }, // bottom-left (low cost, lightweight)
      competitorsPosition: [
        { name: 'Thena', x: 80, y: 22 },
        { name: 'DevRev', x: 86, y: 38 },
        { name: 'Unthread', x: 74, y: 28 },
        { name: 'Jira', x: 62, y: 55 },
      ],
    },
    gapAnalysis: 'The winning angle is zero-configuration repro extraction rather than another support inbox. Incumbents force companies to migrate their entire CRM. If you build a lightweight webhook listener that automatically extracts stack traces, browser environments, and step-by-step reproduction bullets from Zendesk tickets and pushes clean markdown into Linear for $29/mo, engineering teams will adopt it instantly without bureaucratic procurement.',
  },
  {
    id: 'gong-alt',
    tabLabel: 'Self-Hosted Gong Alternative',
    badgeType: 'gap',
    ideaText: 'A lightweight, privacy-first alternative to Gong.io that runs locally or on your private cloud with Whisper transcription for small remote sales teams.',
    targetAudience: 'Bootstrapped founders & security-conscious sales agencies',
    pricePoint: '$99 one-time or $19/mo self-hosted',
    coreAngle: '100% data privacy with zero per-seat enterprise extortion',
    saturationScore: 'low',
    saturationReasoning: 'Gong & Chorus are strictly $1,400+/seat enterprise contracts with aggressive sales reps. Small teams are completely locked out.',
    competitors: [
      { name: 'Gong.io', pricing: '$1,400+/user/yr', desc: 'Enterprise revenue intelligence platform requiring annual minimums.', url: 'https://gong.io', quadrant: 'enterprise' },
      { name: 'Chorus.ai', pricing: '$1,200+/user/yr', desc: 'ZoomInfo conversation intelligence for large sales orgs.', url: 'https://zoominfo.com', quadrant: 'enterprise' },
      { name: 'Fathom', pricing: 'Free / $24/mo', desc: 'AI meeting recorder for individuals, lacking team pipeline analytics.', url: 'https://fathom.video', quadrant: 'niche' },
    ],
    quadrantConfig: {
      xAxisLabel: 'Privacy & Control (Cloud-Locked → Self-Hosted)',
      yAxisLabel: 'Cost Barrier (Solo-Friendly → $10k+ Minimums)',
      yourIdeaPosition: { x: 82, y: 80 },
      competitorsPosition: [
        { name: 'Gong', x: 18, y: 15 },
        { name: 'Chorus', x: 22, y: 25 },
        { name: 'Fathom', x: 35, y: 65 },
      ],
    },
    gapAnalysis: 'Huge open gap for early-stage agencies who want conversation insights without paying $10k/yr minimums. Build a 1-click Docker container or desktop Electron app that ingests Zoom/Google Meet recordings, runs Whisper + local LLM summarization, and delivers deal risk alerts directly to a Slack webhook.',
  },
  {
    id: 'cold-email',
    tabLabel: 'AI Cold Email Scraper',
    badgeType: 'crowded',
    ideaText: 'AI cold email personalization tool that automatically scrapes prospect LinkedIn profiles and generates custom opening icebreakers.',
    targetAudience: 'Outbound SDRs and lead generation freelancers',
    pricePoint: '$49 / month',
    coreAngle: 'Automated LinkedIn icebreakers',
    saturationScore: 'high',
    saturationReasoning: 'Over 25+ direct competitors exist (Instantly, Clay, Smartlead, Lemlist). Generic LinkedIn icebreakers are heavily flagged as spam.',
    competitors: [
      { name: 'Clay.com', pricing: 'From $149/mo', desc: 'Dominant data enrichment and 100+ provider waterfall aggregator.', url: 'https://clay.com', quadrant: 'enterprise' },
      { name: 'Instantly.ai', pricing: 'From $37/mo', desc: 'High-volume warm-up and automated cold email sender.', url: 'https://instantly.ai', quadrant: 'bloated' },
      { name: 'Smartlead.ai', pricing: 'From $39/mo', desc: 'Cold email automation with infinite mailbox rotation.', url: 'https://smartlead.ai', quadrant: 'bloated' },
      { name: 'Lemlist', pricing: 'From $59/mo', desc: 'Multi-channel personalized cold outreach platform.', url: 'https://lemlist.com', quadrant: 'bloated' },
    ],
    quadrantConfig: {
      xAxisLabel: 'Feature Depth (Point Solution → Complete Suite)',
      yAxisLabel: 'Market Crowding (Unclaimed → 25+ Players)',
      yourIdeaPosition: { x: 30, y: 22 },
      competitorsPosition: [
        { name: 'Clay', x: 85, y: 18 },
        { name: 'Instantly', x: 70, y: 15 },
        { name: 'Smartlead', x: 65, y: 22 },
        { name: 'Lemlist', x: 60, y: 28 },
      ],
    },
    gapAnalysis: 'Do NOT build a generic LinkedIn icebreaker tool — the space is saturated and email filters punish it. Instead, pivot to "Trigger-Based Intent Signals": scan GitHub pull requests, company hiring boards, or changelogs to email founders only the exact moment their app has a public downtime incident or hires a new tech lead.',
  },
];

export default function ExpandedResultShowcase() {
  const [activeScenarioId, setActiveScenarioId] = useState('zendesk-linear');
  const scenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  const handleFillIdea = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.value = scenario.ideaText;
      textarea.focus();
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full pt-6 sm:pt-10">
      {/* Section Header */}
      <div className="text-center sm:text-left mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/20 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] animate-pulse" />
          <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[var(--accent-amber)] font-bold">
            Interactive Inspector
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[var(--text-primary)] tracking-tight">
          See how the scanner deconstructs an idea
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] font-[family-name:var(--font-inter)] max-w-xl">
          Pick a sample scenario below to see real live market intelligence, competitive positioning matrix, and strategic opportunity wedges.
        </p>
      </div>

      {/* Scenario Tabs — Responsive Grid ensuring all 3 are always 100% visible */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 w-full">
        {SCENARIOS.map((sc) => {
          const isActive = sc.id === activeScenarioId;
          const badgeColor =
            sc.badgeType === 'gap'
              ? 'text-[var(--accent-amber)] bg-[var(--accent-amber)]/10 border-[var(--accent-amber)]/30'
              : sc.badgeType === 'wedge'
              ? 'text-[var(--accent-amber)] bg-[var(--accent-amber)]/10 border-[var(--accent-amber)]/30'
              : 'text-red-500 bg-red-500/10 border-red-500/30';

          return (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`px-3 py-2.5 rounded-lg text-xs font-[family-name:var(--font-mono)] transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer border w-full text-left ${
                isActive
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--accent-amber)] shadow-[0_0_12px_rgba(245,166,35,0.1)]'
                  : 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--text-dim)]'
              }`}
            >
              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border flex-shrink-0 ${badgeColor}`}>
                {sc.saturationScore}
              </span>
              <span className="truncate">{sc.tabLabel}</span>
            </button>
          );
        })}
      </div>

      {/* 2-Column Inspector Canvas */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl scanline-card">
        {/* Window Chrome Titlebar */}
        <div className="px-4 py-2.5 bg-[var(--bg-surface-alt)] border-b border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)] font-[family-name:var(--font-mono)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(0,72%,50%,0.7)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(42,95%,50%,0.7)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(145,60%,45%,0.7)]" />
            <span className="ml-2 text-[11px] text-[var(--text-secondary)] hidden sm:inline">
              intel_dossier::{scenario.id}.json
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[var(--accent-amber)] bg-[var(--accent-amber)]/10 px-2 py-0.5 rounded font-bold">
              LLM + Web Crawl
            </span>
            <span className="text-[10px] text-[var(--text-dim)]">0.82s</span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
          {/* LEFT COLUMN: The Idea Anatomy (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-[var(--bg-surface)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[var(--text-dim)] block mb-1.5 font-semibold">
                  01 // Input Idea
                </span>
                <p className="text-sm sm:text-base text-[var(--text-primary)] font-[family-name:var(--font-space-grotesk)] font-medium leading-snug border-l-2 border-[var(--accent-amber)] pl-3">
                  &ldquo;{scenario.ideaText}&rdquo;
                </p>
              </div>

              {/* Extracted Anatomy Pills */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.18em] text-[var(--text-dim)] block font-medium">
                  Extracted Attributes
                </span>

                <div className="bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-lg p-3 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] font-[family-name:var(--font-mono)] block">
                      Target ICP
                    </span>
                    <span className="text-[var(--text-primary)] font-medium font-[family-name:var(--font-inter)]">
                      {scenario.targetAudience}
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-[family-name:var(--font-mono)] block">
                        Viable Price Tier
                      </span>
                      <span className="text-[var(--accent-amber)] font-[family-name:var(--font-mono)] font-bold">
                        {scenario.pricePoint}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-[family-name:var(--font-mono)] block">
                      Core Wedge Angle
                    </span>
                    <span className="text-[var(--text-secondary)] text-[11px] font-[family-name:var(--font-inter)] leading-snug block mt-0.5">
                      {scenario.coreAngle}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test this prompt button */}
            <div className="pt-2">
              <button
                onClick={handleFillIdea}
                className="w-full py-2.5 px-3 bg-[var(--bg-surface-alt)] hover:bg-[var(--accent-amber)] text-[var(--text-primary)] hover:text-black text-xs font-bold rounded-lg transition-all font-[family-name:var(--font-space-grotesk)] flex items-center justify-center gap-1.5 group cursor-pointer border border-[var(--border)] hover:border-[var(--accent-amber)]"
              >
                <span>Test this idea yourself</span>
                <span className="transition-transform group-hover:-translate-y-0.5 font-[family-name:var(--font-mono)]">↑</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Market Matrix & Blueprint (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 bg-[var(--bg-surface-alt)] space-y-5">
            {/* Saturation Header */}
            <div className="flex items-center justify-between bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3.5 py-2.5">
              <div>
                <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.18em] text-[var(--text-muted)] block">
                  Market Saturation
                </span>
                <SignalBars score={scenario.saturationScore} size="sm" className="mt-1" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--text-dim)] block">
                  Discovered Competitors
                </span>
                <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                  {scenario.competitors.length} live players
                </span>
              </div>
            </div>

            {/* 2×2 Positioning Matrix Visual Chart */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 relative shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.18em] text-[var(--text-muted)] font-bold">
                  2×2 Competitive Positioning Matrix
                </span>
                <span className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--accent-amber)] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] animate-ping" />
                  Your Unclaimed Sweet Spot
                </span>
              </div>

              {/* Matrix Canvas Box */}
              <div className="h-44 w-full bg-[var(--bg-surface-alt)] border border-[var(--border)] rounded-lg relative overflow-hidden flex items-center justify-center">
                {/* Grid Axes Lines */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[var(--border)] border-t border-dashed border-[var(--border)]" />
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[var(--border)] border-l border-dashed border-[var(--border)]" />

                {/* Subtle Quadrant Labels */}
                <span className="absolute top-2 left-2 text-[8px] font-[family-name:var(--font-mono)] text-[var(--text-dim)] uppercase tracking-wider">
                  Niche / Expensive
                </span>
                <span className="absolute top-2 right-2 text-[8px] font-[family-name:var(--font-mono)] text-[var(--text-dim)] uppercase tracking-wider">
                  Crowded Enterprise
                </span>
                <span className="absolute bottom-2 left-2 text-[8px] font-[family-name:var(--font-mono)] text-[var(--accent-amber)] uppercase tracking-wider font-semibold">
                  ★ Low-Barrier Wedge
                </span>
                <span className="absolute bottom-2 right-2 text-[8px] font-[family-name:var(--font-mono)] text-[var(--text-dim)] uppercase tracking-wider">
                  Complex Suite
                </span>

                {/* Plotted Competitors */}
                {scenario.quadrantConfig.competitorsPosition.map((cp, idx) => (
                  <div
                    key={idx}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border)] px-1.5 py-0.5 rounded shadow-sm transition-all hover:scale-105 z-10"
                    style={{ left: `${cp.x}%`, top: `${cp.y}%` }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                    <span className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--text-secondary)] whitespace-nowrap font-medium">
                      {cp.name}
                    </span>
                  </div>
                ))}

                {/* Plotted "Your Idea" Beacon */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-[var(--accent-amber)] text-black font-bold px-2 py-0.5 rounded-full shadow-[0_0_16px_rgba(245,166,35,0.4)] z-20 animate-bounce"
                  style={{
                    left: `${scenario.quadrantConfig.yourIdeaPosition.x}%`,
                    top: `${scenario.quadrantConfig.yourIdeaPosition.y}%`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span className="text-[10px] font-[family-name:var(--font-space-grotesk)] font-bold whitespace-nowrap">
                    YOUR WEDGE
                  </span>
                </div>
              </div>

              {/* Axis Labels */}
              <div className="flex justify-between text-[9px] text-[var(--text-dim)] font-[family-name:var(--font-mono)] mt-2 px-1">
                <span>← {scenario.quadrantConfig.xAxisLabel.split('→')[0]}</span>
                <span>{scenario.quadrantConfig.xAxisLabel.split('→')[1]} →</span>
              </div>
            </div>

            {/* Competitor Micro Badges */}
            <div className="grid grid-cols-2 gap-2">
              {scenario.competitors.map((comp, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-2.5 flex flex-col justify-between hover:border-[var(--accent-amber)]/30 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-[var(--text-primary)] font-[family-name:var(--font-space-grotesk)] truncate">
                      {comp.name}
                    </span>
                    <span className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--accent-amber)] bg-[var(--accent-amber)]/10 px-1 rounded whitespace-nowrap font-semibold">
                      {comp.pricing}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 leading-tight font-[family-name:var(--font-inter)]">
                    {comp.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* The Opportunity Wedge Payoff */}
            <div className="bg-[var(--bg-surface)] border-l-2 border-l-[var(--accent-amber)] border-r border-t border-b border-[var(--border)] rounded-lg p-3.5 sm:p-4 shadow-sm">
              <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.18em] text-[var(--accent-amber)] block mb-1.5 font-bold">
                ★ The Winning Angle (Gap Analysis)
              </span>
              <DecryptText
                key={scenario.id}
                text={scenario.gapAnalysis}
                durationMs={850}
                className="text-xs text-[var(--text-primary)] font-[family-name:var(--font-inter)] leading-relaxed font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

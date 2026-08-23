'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SignalBars from './SignalBars';
import { SaturationLevel } from '@/types';

type VerdictType = 'low' | 'medium' | 'high';

interface ScanDisplayItem {
  id: string;
  timeAgo: string;
  idea: string;
  competitors: number;
  saturationScore: SaturationLevel;
  shareSlug?: string;
  featured?: boolean;
}

const defaultExampleScans: ScanDisplayItem[] = [
  {
    id: '1',
    timeAgo: '3m ago',
    idea: 'AI meeting notes to Linear tickets with auto-reproduction steps',
    competitors: 4,
    saturationScore: 'low',
  },
  {
    id: '2',
    timeAgo: '9m ago',
    idea: 'Slack bot for failed Stripe payments dunning & recovery',
    competitors: 14,
    saturationScore: 'high',
  },
  {
    id: '3',
    timeAgo: '16m ago',
    idea: 'Notion for voice memos with automatic action items',
    competitors: 8,
    saturationScore: 'medium',
  },
  {
    id: '4',
    timeAgo: '24m ago',
    idea: 'Cheaper, self-hosted alternative to Gong.io for small teams',
    competitors: 3,
    saturationScore: 'low',
  },
  {
    id: '5',
    timeAgo: '38m ago',
    idea: 'Auto-changelog generator directly from GitHub commit history',
    competitors: 16,
    saturationScore: 'high',
  },
  {
    id: '6',
    timeAgo: '52m ago',
    idea: 'SOC2 compliance automation tailored specifically for solo founders',
    competitors: 5,
    saturationScore: 'low',
  },
  {
    id: '7',
    timeAgo: '1h ago',
    idea: 'Figma to Tailwind CSS component converter with clean AST exports',
    competitors: 11,
    saturationScore: 'medium',
  },
  {
    id: '8',
    timeAgo: '2h ago',
    idea: 'AI cold email personalization using live LinkedIn profile scraping',
    competitors: 19,
    saturationScore: 'high',
  },
  {
    id: '9',
    timeAgo: '3h ago',
    idea: 'Micro-SaaS server health and uptime monitor via WhatsApp alerts',
    competitors: 4,
    saturationScore: 'low',
  },
  {
    id: '10',
    timeAgo: '4h ago',
    idea: 'Customer support QA grader using custom LLM evaluation rubrics',
    competitors: 7,
    saturationScore: 'medium',
  },
];

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function RecentScansSection() {
  const [scans, setScans] = useState<ScanDisplayItem[]>(defaultExampleScans);

  useEffect(() => {
    fetch('/api/scans/recent')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ScanDisplayItem[] = res.data.map((item: {
            _id: string;
            ideaText: string;
            saturationScore: SaturationLevel;
            competitorsCount: number;
            shareSlug: string;
            featured?: boolean;
            createdAt: string;
          }) => ({
            id: item._id,
            timeAgo: formatTimeAgo(item.createdAt),
            idea: item.ideaText,
            competitors: item.competitorsCount,
            saturationScore: item.saturationScore,
            shareSlug: item.shareSlug,
            featured: item.featured,
          }));

          const combined = mapped.length >= 6 ? mapped : [...mapped, ...defaultExampleScans.slice(mapped.length)];
          setScans(combined.slice(0, 10));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="recent-scans" className="w-full mx-auto pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] tracking-tight">
            Recent Scans
          </h2>
          <p className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-mono)] mt-0.5">
            live community & curated validation feed
          </p>
        </div>
        <span className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)] sm:text-right">
          Live stream
        </span>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {scans.map((scan) => {
          const content = (
            <div className="bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(220,10%,26%)] rounded-lg px-3.5 py-3 sm:px-4 sm:py-3 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] sm:text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)]">
                    {scan.timeAgo}
                  </span>
                  <span className="text-[10px] text-[hsl(220,10%,25%)]">•</span>
                  <span className="text-[10px] sm:text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">
                    {scan.competitors} competitors found
                  </span>
                  {scan.featured && (
                    <span className="text-[9px] font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.15)] px-1 rounded font-bold">
                      ★ Featured
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-[hsl(40,20%,90%)] font-[family-name:var(--font-inter)] leading-snug group-hover:text-[hsl(40,20%,100%)] transition-colors">
                  {scan.idea}
                </p>
              </div>

              {/* Signal Strength Saturation Bars */}
              <div className="flex-shrink-0 self-start sm:self-center">
                <SignalBars score={scan.saturationScore} size="sm" />
              </div>
            </div>
          );

          return scan.shareSlug ? (
            <Link key={scan.id} href={`/scan/${scan.shareSlug}`} className="block">
              {content}
            </Link>
          ) : (
            <div key={scan.id}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}

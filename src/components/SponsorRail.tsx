'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SponsorItem {
  _id?: string;
  name: string;
  desc?: string;
  description?: string;
  icon?: string;
  iconText?: string;
  url: string;
  tier?: string;
  priority?: number;
}

const defaultLeftSponsors: SponsorItem[] = [
  {
    name: 'Supastack',
    desc: 'Instant Postgres, Auth & queues for early SaaS',
    icon: '⚡',
    url: 'https://example.com/sponsor-1',
  },
  {
    name: 'Reship',
    desc: 'Next.js boilerplate with Stripe & Auth pre-wired',
    icon: '🚀',
    url: 'https://example.com/sponsor-2',
  },
  {
    name: 'LogSnag',
    desc: 'Real-time event tracking and push alerts for founders',
    icon: '📊',
    url: 'https://example.com/sponsor-3',
  },
  {
    name: 'PromptArmor',
    desc: 'AI prompt injection security and LLM firewall',
    icon: '🛡️',
    url: 'https://example.com/sponsor-4',
  },
];

const defaultRightSponsors: SponsorItem[] = [
  {
    name: 'LemonVault',
    desc: 'Merchant-of-record global tax compliance for solo devs',
    icon: '🍋',
    url: 'https://example.com/sponsor-5',
  },
  {
    name: 'CronHQ',
    desc: 'Zero-maintenance distributed cron jobs & webhooks',
    icon: '⏱️',
    url: 'https://example.com/sponsor-6',
  },
  {
    name: 'Polar.sh',
    desc: 'Developer-first monetization & subscriptions for repos',
    icon: '❄️',
    url: 'https://example.com/sponsor-7',
  },
  {
    name: 'Posthog Indie',
    desc: 'Product analytics, heatmaps & feature flags',
    icon: '🦔',
    url: 'https://example.com/sponsor-8',
  },
];

export default function SponsorRail({ side }: { side: 'left' | 'right' }) {
  const [sponsors, setSponsors] = useState<SponsorItem[]>(
    side === 'left' ? defaultLeftSponsors : defaultRightSponsors
  );
  const [slotCount, setSlotCount] = useState(side === 'left' ? 7 : 8);
  const totalSlots = 10;

  useEffect(() => {
    fetch('/api/sponsors')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const half = Math.ceil(res.data.length / 2);
          const activeSide = side === 'left' ? res.data.slice(0, half) : res.data.slice(half);
          if (activeSide.length > 0) {
            setSponsors(activeSide);
            setSlotCount(Math.min(10, res.data.length));
          }
        }
      })
      .catch(() => {});
  }, [side]);

  const handleSponsorClick = (id?: string) => {
    if (id) {
      fetch(`/api/sponsors/${id}/click`, { method: 'POST' }).catch(() => {});
    }
  };

  const percentage = (slotCount / totalSlots) * 100;

  return (
    <div className="w-full space-y-2.5 pt-8 sm:pt-12">
      {/* Category header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.18em] text-[hsl(40,8%,45%)] font-semibold">
          {side === 'left' ? 'DevTools & Infra' : 'SaaS Launchpad'}
        </span>
        <span className="text-[9px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] bg-[hsl(220,10%,16%)] px-1.5 py-0.5 rounded font-medium">
          Sponsored
        </span>
      </div>

      {/* Stacked sponsor cards */}
      {sponsors.map((sponsor, i) => (
        <a
          key={sponsor._id || i}
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSponsorClick(sponsor._id)}
          className="group block bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(220,10%,28%)] rounded-lg p-2.5 sm:p-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded bg-[hsl(220,10%,15%)] border border-[hsl(220,10%,20%)] flex items-center justify-center flex-shrink-0 text-sm transition-colors mt-0.5">
              {sponsor.iconText || sponsor.icon || '⚡'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[hsl(40,20%,92%)] group-hover:text-[hsl(40,20%,100%)] transition-colors font-[family-name:var(--font-space-grotesk)] truncate">
                  {sponsor.name}
                </span>
                <span className="text-[10px] text-[hsl(40,8%,35%)] group-hover:text-[hsl(40,8%,60%)] transition-colors opacity-60">
                  ↗
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-snug line-clamp-2">
                {sponsor.description || sponsor.desc}
              </p>
            </div>
          </div>
        </a>
      ))}

      {/* Slot capacity / availability widget */}
      <div className="bg-[hsl(220,12%,10%)] border border-[hsl(220,10%,16%)] rounded-lg p-2.5 sm:p-3">
        <div className="flex items-center justify-between text-[11px] font-[family-name:var(--font-mono)] mb-1.5">
          <span className="text-[hsl(40,8%,55%)]">Sidebar capacity</span>
          <span className="text-[hsl(40,20%,85%)] font-bold">
            {slotCount}/{totalSlots} taken
          </span>
        </div>
        <div className="w-full h-1 bg-[hsl(220,10%,18%)] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[hsl(40,20%,70%)] rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <Link
          href="/#sponsors-section"
          className="block text-center text-[10px] sm:text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)] hover:text-[hsl(40,20%,90%)] transition-colors font-medium"
        >
          Claim remaining slot →
        </Link>
      </div>
    </div>
  );
}

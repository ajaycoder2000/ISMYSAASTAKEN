'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SponsorSlotProps {
  customSponsor?: {
    _id?: string;
    name: string;
    description: string;
    ctaText?: string;
    url: string;
    iconText?: string;
  };
}

export default function SponsorSlot({ customSponsor }: SponsorSlotProps) {
  const [sponsor, setSponsor] = useState(
    customSponsor || {
      _id: undefined,
      name: 'Supastack Cloud',
      description: 'Instant PostgreSQL database, auth, and automated background workers tailored for early-stage SaaS.',
      ctaText: 'Get $200 in free credits →',
      url: 'https://example.com/sponsor-ref',
      iconText: '⚡',
    }
  );

  useEffect(() => {
    if (!customSponsor) {
      fetch('/api/sponsors')
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const featured = res.data.find((s: { tier: string }) => s.tier === 'featured') || res.data[0];
            setSponsor({
              _id: featured._id,
              name: featured.name,
              description: featured.description,
              ctaText: 'Visit sponsor →',
              url: featured.url,
              iconText: featured.iconText || '⚡',
            });
          }
        })
        .catch(() => {});
    }
  }, [customSponsor]);

  const handleClick = () => {
    if (sponsor._id) {
      fetch(`/api/sponsors/${sponsor._id}/click`, { method: 'POST' }).catch(() => {});
    }
  };

  return (
    <div className="w-full bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(220,10%,25%)] rounded-lg p-4 transition-all duration-200">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-md bg-[hsl(220,10%,15%)] border border-[hsl(220,10%,22%)] flex items-center justify-center flex-shrink-0 text-base font-bold">
          {sponsor.iconText || '⚡'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[hsl(40,20%,92%)] font-[family-name:var(--font-space-grotesk)]">
                {sponsor.name}
              </span>
              <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(40,8%,40%)] bg-[hsl(220,10%,16%)] px-1.5 py-0.5 rounded">
                Sponsor
              </span>
            </div>
            <Link
              href="/#sponsors-section"
              className="text-[11px] font-[family-name:var(--font-mono)] text-[hsl(40,8%,40%)] hover:text-[hsl(40,20%,90%)] transition-colors"
            >
              Your ad here?
            </Link>
          </div>
          <p className="mt-1 text-xs text-[hsl(40,8%,60%)] leading-relaxed font-[family-name:var(--font-inter)]">
            {sponsor.description}
          </p>
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="inline-block mt-2 text-xs font-[family-name:var(--font-mono)] text-[hsl(42,95%,55%)] hover:underline transition-colors"
          >
            {sponsor.ctaText || 'Learn more →'}
          </a>
        </div>
      </div>
    </div>
  );
}

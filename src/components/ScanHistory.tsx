'use client';
import Link from 'next/link';
import { SaturationLevel } from '@/types';
import SaturationBadge from './SaturationBadge';

interface ScanHistoryEntry {
  _id: string;
  ideaText: string;
  saturationScore: SaturationLevel;
  shareSlug: string;
  competitorCount: number;
  createdAt: string;
  isBookmarked?: boolean;
}

export default function ScanHistory({
  scans,
  emptyMessage,
}: {
  scans: ScanHistoryEntry[];
  emptyMessage?: string;
}) {
  if (scans.length === 0) {
    return (
      <div className="text-center py-12 bg-[hsl(220,14%,10%)] border border-[hsl(220,10%,16%)] rounded-xl p-6">
        <p className="text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)] text-sm leading-relaxed">
          {emptyMessage || 'No scans yet. Your history will show up once you run your first one.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scans.map((scan) => (
        <Link
          key={scan._id}
          href={`/scan/${scan.shareSlug}`}
          className="block bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-lg p-4 hover:border-[hsl(220,10%,25%)] transition-colors duration-200 group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {scan.isBookmarked && (
                  <span className="text-[hsl(42,95%,55%)] text-xs" title="Bookmarked Idea">
                    ★
                  </span>
                )}
                <p className="text-sm text-[hsl(40,20%,92%)] font-[family-name:var(--font-inter)] truncate group-hover:text-[hsl(42,95%,55%)] transition-colors">
                  {scan.ideaText}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <SaturationBadge level={scan.saturationScore} />
                <span className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,35%)]">
                  {scan.competitorCount} competitors
                </span>
                <span className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,35%)]">
                  {new Date(scan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-[hsl(40,8%,35%)] group-hover:text-[hsl(42,95%,55%)] transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
